// ============================================================================
// OSRM ROUTING PROVIDER (Open Source Routing Machine)
// Free, Open-Source Driving Routes, Distance & Duration
// Note: OSRM Public Server does NOT include real-time live traffic data.
// ============================================================================

import { RoutingProvider, RouteResult, RouteGeometry } from './RoutingProvider';
import { CONFIG } from '../../config';

/**
 * Calculates Haversine distance in kilometers between two coordinates
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class OSRMProvider extends RoutingProvider {
  readonly name = 'OSRM';
  readonly isTrafficAware = false;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl = CONFIG.OSRM_BASE_URL, timeoutMs = 6000) {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  /**
   * Fetch driving route from OSRM
   * @param origin [latitude, longitude]
   * @param destination [latitude, longitude]
   */
  async getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteResult> {
    const [originLat, originLng] = origin;
    const [destLat, destLng] = destination;

    // Validate coordinate bounds
    this.validateCoordinates(originLat, originLng, 'Origin');
    this.validateCoordinates(destLat, destLng, 'Destination');

    // Case: Same origin and destination
    if (
      Math.abs(originLat - destLat) < 0.00001 &&
      Math.abs(originLng - destLng) < 0.00001
    ) {
      return {
        distanceKm: 0,
        durationMinutes: 0,
        geometry: {
          type: 'LineString',
          coordinates: [
            [originLng, originLat],
            [destLng, destLat],
          ],
        },
        steps: [],
        provider: this.name,
        isTrafficAware: this.isTrafficAware,
      };
    }

    // OSRM URL format: /route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&steps=true
    const url = `${this.baseUrl}/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'ShivneriEnterpriseMobility/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM API responded with status ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as any;

      if (!data || data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(data?.message || 'No route found between coordinates');
      }

      const primary = data.routes[0];
      const distanceKm = Math.round((primary.distance / 1000) * 10) / 10;
      const durationMinutes = Math.max(1, Math.round(primary.duration / 60));

      const steps: Array<{
        instruction: string;
        distanceKm: number;
        durationMinutes: number;
      }> = [];

      if (primary.legs && primary.legs[0]?.steps) {
        for (const step of primary.legs[0].steps) {
          if (step.maneuver) {
            steps.push({
              instruction: `${step.maneuver.type} ${step.name ? 'onto ' + step.name : ''}`.trim(),
              distanceKm: Math.round((step.distance / 1000) * 10) / 10,
              durationMinutes: Math.max(0.1, Math.round((step.duration / 60) * 10) / 10),
            });
          }
        }
      }

      return {
        distanceKm,
        durationMinutes,
        geometry: primary.geometry as RouteGeometry,
        steps,
        provider: this.name,
        isTrafficAware: this.isTrafficAware,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      // Graceful fallback: If public OSRM server is down or times out, calculate realistic urban road distance & ETA
      // Urban road network factor: ~1.25x straight-line, average city speed: 25 km/h
      return this.computeFallbackRoute(origin, destination, err?.message || 'OSRM unavailable');
    }
  }

  /**
   * Fast ETA calculation in minutes
   */
  async getEta(
    origin: [number, number],
    destination: [number, number]
  ): Promise<number> {
    const route = await this.getRoute(origin, destination);
    return route.durationMinutes;
  }

  /**
   * Fallback routing calculation when public OSRM is unreachable
   */
  private computeFallbackRoute(
    origin: [number, number],
    destination: [number, number],
    reason: string
  ): RouteResult {
    const [lat1, lng1] = origin;
    const [lat2, lng2] = destination;
    const straightKm = haversineDistanceKm(lat1, lng1, lat2, lng2);
    // Urban road detour multiplier: 1.28
    const distanceKm = Math.round(straightKm * 1.28 * 10) / 10;
    // Urban speed assumption: 26 km/h -> ~2.3 min per km + 2 min pickup buffer
    const durationMinutes = Math.max(1, Math.round(distanceKm * 2.3 + 1));

    // Simple interpolated polyline
    const midLat = (lat1 + lat2) / 2 + (lng2 - lng1) * 0.05;
    const midLng = (lng1 + lng2) / 2 - (lat2 - lat1) * 0.05;

    return {
      distanceKm,
      durationMinutes,
      geometry: {
        type: 'LineString',
        coordinates: [
          [lng1, lat1],
          [midLng, midLat],
          [lng2, lat2],
        ],
      },
      steps: [
        {
          instruction: `Drive towards destination (Estimated via fallback: ${reason})`,
          distanceKm,
          durationMinutes,
        },
      ],
      provider: 'OSRM_FALLBACK',
      isTrafficAware: false,
    };
  }

  private validateCoordinates(lat: number, lng: number, label: string) {
    if (typeof lat !== 'number' || isNaN(lat) || lat < -90 || lat > 90) {
      throw new Error(`Invalid ${label} latitude: ${lat}. Must be between -90 and 90.`);
    }
    if (typeof lng !== 'number' || isNaN(lng) || lng < -180 || lng > 180) {
      throw new Error(`Invalid ${label} longitude: ${lng}. Must be between -180 and 180.`);
    }
  }
}
