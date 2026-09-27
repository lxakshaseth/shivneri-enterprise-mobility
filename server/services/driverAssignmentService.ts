// ============================================================================
// DRIVER ASSIGNMENT SERVICE
// Finds available drivers, computes OSRM driving routes/ETAs, scores candidates,
// and assigns the optimal driver (based on route ETA, not straight-line distance).
// ============================================================================

import { dbManager } from '../db';
import { osrmService } from './routing/osrmService';
import { DriverDocument, RideDocument } from '../models/types';
import { RouteResult } from './routing/RoutingProvider';

export interface DriverCandidateWithRoute {
  driver: DriverDocument;
  distanceKm: number;
  etaMinutes: number;
  routeGeometry: RouteResult['geometry'];
  score: number;
  scoreBreakdown: {
    etaScore: number;
    distanceScore: number;
    ratingScore: number;
    capacityScore: number;
    total: number;
  };
}

export interface AssignmentResult {
  ride: RideDocument;
  assignedDriver: DriverDocument;
  route: RouteResult;
  evaluatedCandidates: DriverCandidateWithRoute[];
}

export class DriverAssignmentService {
  /**
   * Find available nearby drivers who are online and have fresh locations
   */
  async findAvailableNearbyDrivers(
    pickupLat: number,
    pickupLng: number,
    radiusKm = 10,
    maxLocationAgeSeconds = 300
  ): Promise<DriverDocument[]> {
    const maxMeters = radiusKm * 1000;
    const now = Date.now();

    // Query 2dsphere near with filter for AVAILABLE and isOnline
    const nearDrivers = await dbManager.driversCollection.findNear(
      [pickupLng, pickupLat],
      maxMeters,
      {
        status: 'AVAILABLE',
        isOnline: true,
      }
    );

    // Filter out drivers with stale locations or compliance flags
    const validDrivers = nearDrivers
      .map(entry => entry.doc)
      .filter(driver => {
        const lastUpdated = new Date(driver.lastUpdatedAt).getTime();
        const ageSeconds = (now - lastUpdated) / 1000;
        if (ageSeconds > maxLocationAgeSeconds) {
          return false; // Stale location
        }
        if (driver.policeVerificationValid === false) {
          return false; // Non-compliant
        }
        return true;
      });

    return validDrivers;
  }

  /**
   * Calculate multi-factor score for a candidate driver
   * Prioritizes OSRM ETA heavily over straight-line distance.
   */
  calculateCandidateScore(
    etaMinutes: number,
    distanceKm: number,
    rating: number,
    availableSeats: number
  ): { total: number; etaScore: number; distanceScore: number; ratingScore: number; capacityScore: number } {
    // ETA score: Lower is better (0 min = 100 pts, 30 min = 0 pts)
    const etaScore = Math.max(0, Math.min(100, (1 - etaMinutes / 30) * 100));

    // Distance score: Lower is better (0 km = 100 pts, 15 km = 0 pts)
    const distanceScore = Math.max(0, Math.min(100, (1 - distanceKm / 15) * 100));

    // Rating score: 5.0 = 100 pts, 4.0 = 0 pts
    const ratingScore = Math.max(0, Math.min(100, ((rating - 4.0) / 1.0) * 100));

    // Capacity score: > 0 seats available
    const capacityScore = availableSeats > 0 ? 100 : 0;

    // Weights: ETA: 50%, Distance: 20%, Rating: 20%, Capacity: 10%
    const total = Math.round(
      etaScore * 0.5 +
      distanceScore * 0.2 +
      ratingScore * 0.2 +
      capacityScore * 0.1
    );

    return {
      total,
      etaScore: Math.round(etaScore),
      distanceScore: Math.round(distanceScore),
      ratingScore: Math.round(ratingScore),
      capacityScore,
    };
  }

  /**
   * Assign driver to pickup using OSRM driving routes and ETA
   */
  async assignDriverToPickup(
    rideId: string,
    options?: { searchRadiusKm?: number; preferredDriverId?: string }
  ): Promise<AssignmentResult> {
    const ride = await dbManager.ridesCollection.findOne({ rideId });
    if (!ride) {
      throw new Error(`Ride ${rideId} not found`);
    }

    if (ride.status !== 'REQUESTED' && ride.status !== 'ASSIGNING') {
      throw new Error(`Cannot assign driver to ride in status ${ride.status}`);
    }

    // Set ride status to ASSIGNING
    await dbManager.ridesCollection.updateOne(
      { rideId },
      { $set: { status: 'ASSIGNING', updatedAt: new Date() } }
    );

    const radiusKm = options?.searchRadiusKm || 10;
    const candidates = await this.findAvailableNearbyDrivers(
      ride.pickupLocation.latitude,
      ride.pickupLocation.longitude,
      radiusKm
    );

    if (candidates.length === 0) {
      // Revert status to REQUESTED
      await dbManager.ridesCollection.updateOne(
        { rideId },
        { $set: { status: 'REQUESTED', updatedAt: new Date() } }
      );
      throw new Error('No available online drivers found within pickup search radius');
    }

    // Fetch OSRM route and calculate ETA for each candidate
    const candidatesWithRoutes: DriverCandidateWithRoute[] = [];

    for (const driver of candidates) {
      const driverLng = driver.location.coordinates[0];
      const driverLat = driver.location.coordinates[1];

      try {
        const route = await osrmService.getRoute(
          [driverLat, driverLng],
          [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
        );

        const scoreBreakdown = this.calculateCandidateScore(
          route.durationMinutes,
          route.distanceKm,
          driver.rating,
          driver.vehicle.capacity
        );

        candidatesWithRoutes.push({
          driver,
          distanceKm: route.distanceKm,
          etaMinutes: route.durationMinutes,
          routeGeometry: route.geometry,
          score: scoreBreakdown.total,
          scoreBreakdown,
        });
      } catch (err) {
        console.warn(`Could not compute route for driver ${driver.driverId}:`, err);
      }
    }

    if (candidatesWithRoutes.length === 0) {
      await dbManager.ridesCollection.updateOne(
        { rideId },
        { $set: { status: 'REQUESTED', updatedAt: new Date() } }
      );
      throw new Error('Failed to compute driving route for any nearby candidate');
    }

    // Sort by ETA ascending (lowest driving time first), then by score descending
    candidatesWithRoutes.sort((a, b) => {
      if (a.etaMinutes !== b.etaMinutes) {
        return a.etaMinutes - b.etaMinutes;
      }
      return b.score - a.score;
    });

    // Check if preferred driver requested and present
    let selected = candidatesWithRoutes[0];
    if (options?.preferredDriverId) {
      const preferred = candidatesWithRoutes.find(c => c.driver.driverId === options.preferredDriverId);
      if (preferred) selected = preferred;
    }

    // Fetch full route from selected driver to pickup
    const selectedDriver = selected.driver;
    const selectedRoute = await osrmService.getRoute(
      [selectedDriver.location.coordinates[1], selectedDriver.location.coordinates[0]],
      [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
    );

    // Atomically update Driver and Ride
    await dbManager.driversCollection.updateOne(
      { driverId: selectedDriver.driverId },
      { $set: { status: 'ASSIGNED', lastUpdatedAt: new Date() } }
    );

    await dbManager.ridesCollection.updateOne(
      { rideId },
      {
        $set: {
          status: 'ASSIGNED',
          assignedDriverId: selectedDriver.driverId,
          assignedDriverName: selectedDriver.name,
          assignedDriverPhone: selectedDriver.phone,
          routeGeometry: selectedRoute.geometry,
          distanceKm: selectedRoute.distanceKm,
          etaMinutes: selectedRoute.durationMinutes,
          updatedAt: new Date(),
        },
      }
    );

    const updatedRide = (await dbManager.ridesCollection.findOne({ rideId }))!;

    return {
      ride: updatedRide,
      assignedDriver: selectedDriver,
      route: selectedRoute,
      evaluatedCandidates: candidatesWithRoutes,
    };
  }
}

export const driverAssignmentService = new DriverAssignmentService();
