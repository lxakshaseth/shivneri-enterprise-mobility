// ============================================================================
// DRIVER GEOLOCATION SERVICE (Browser Geolocation API)
// Captures latitude, longitude, accuracy, timestamp.
// Throttles and debounces updates based on distance and elapsed time.
// ============================================================================

import { OpenMapApiClient } from '../api/openMapApi';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

export type GeolocationCallback = (coords: GeolocationCoords) => void;
export type GeolocationErrorCallback = (error: { code: string; message: string }) => void;

/**
 * Calculates straight line distance in meters
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class DriverGeolocationTracker {
  private watchId: number | null = null;
  private driverId: string;
  private minDistanceMeters: number;
  private maxHeartbeatSeconds: number;
  private lastReportedCoords: GeolocationCoords | null = null;
  private lastReportedTime = 0;
  private isTracking = false;

  constructor(driverId = 'DRV-001', minDistanceMeters = 15, maxHeartbeatSeconds = 30) {
    this.driverId = driverId;
    this.minDistanceMeters = minDistanceMeters;
    this.maxHeartbeatSeconds = maxHeartbeatSeconds;
  }

  /**
   * Start tracking driver geolocation via navigator.geolocation.watchPosition
   */
  startTracking(
    onLocationUpdate?: GeolocationCallback,
    onError?: GeolocationErrorCallback
  ): boolean {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      onError?.({
        code: 'GEOLOCATION_UNSUPPORTED',
        message: 'Browser Geolocation API is not supported on this device/browser',
      });
      return false;
    }

    if (this.isTracking) return true;

    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      async position => {
        const coords: GeolocationCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: new Date(position.timestamp).toISOString(),
        };

        const now = Date.now();
        const elapsedSeconds = (now - this.lastReportedTime) / 1000;

        let shouldSend = false;

        if (!this.lastReportedCoords) {
          shouldSend = true;
        } else {
          const distanceMoved = calculateDistanceMeters(
            this.lastReportedCoords.latitude,
            this.lastReportedCoords.longitude,
            coords.latitude,
            coords.longitude
          );

          // Debounce: update if driver moved > minDistanceMeters OR if maxHeartbeatSeconds elapsed
          if (distanceMoved >= this.minDistanceMeters || elapsedSeconds >= this.maxHeartbeatSeconds) {
            shouldSend = true;
          }
        }

        if (shouldSend) {
          this.lastReportedCoords = coords;
          this.lastReportedTime = now;

          // Notify frontend listener
          onLocationUpdate?.(coords);

          // Transmit to backend API
          try {
            await OpenMapApiClient.updateDriverLocation(
              this.driverId,
              coords.latitude,
              coords.longitude,
              coords.accuracy
            );
          } catch (err) {
            console.warn(`Failed to push driver ${this.driverId} location to backend:`, err);
          }
        }
      },
      error => {
        let code = 'GEOLOCATION_ERROR';
        if (error.code === error.PERMISSION_DENIED) code = 'PERMISSION_DENIED';
        else if (error.code === error.POSITION_UNAVAILABLE) code = 'POSITION_UNAVAILABLE';
        else if (error.code === error.TIMEOUT) code = 'TIMEOUT';

        onError?.({ code, message: error.message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return true;
  }

  /**
   * Stop active GPS tracking
   */
  stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  getIsTracking(): boolean {
    return this.isTracking;
  }

  getLastCoords(): GeolocationCoords | null {
    return this.lastReportedCoords;
  }
}
