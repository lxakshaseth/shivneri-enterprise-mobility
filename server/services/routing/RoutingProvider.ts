// ============================================================================
// ABSTRACT ROUTING PROVIDER & TYPES
// Supports pluggable providers (OSRM, Traffic-aware routing, Mock/Fallback)
// ============================================================================

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteGeometry {
  type: 'LineString';
  coordinates: [number, number][]; // [longitude, latitude] per GeoJSON spec
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry: RouteGeometry;
  steps?: Array<{
    instruction: string;
    distanceKm: number;
    durationMinutes: number;
  }>;
  provider: string;
  isTrafficAware: boolean;
}

export abstract class RoutingProvider {
  abstract readonly name: string;
  abstract readonly isTrafficAware: boolean;

  /**
   * Calculate driving route, distance, and duration between origin and destination
   * @param origin [latitude, longitude]
   * @param destination [latitude, longitude]
   */
  abstract getRoute(
    origin: [number, number],
    destination: [number, number]
  ): Promise<RouteResult>;

  /**
   * Fast ETA calculation in minutes
   * @param origin [latitude, longitude]
   * @param destination [latitude, longitude]
   */
  abstract getEta(
    origin: [number, number],
    destination: [number, number]
  ): Promise<number>;
}
