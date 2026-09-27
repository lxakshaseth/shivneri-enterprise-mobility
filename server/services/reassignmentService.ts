// ============================================================================
// AUTOMATIC PICKUP REASSIGNMENT SERVICE
// Evaluates reassignment rules, verifies conditions, transfers driver assignment,
// and records detailed reassignment audit history.
// ============================================================================

import { dbManager } from '../db';
import { osrmService } from './routing/osrmService';
import { CONFIG } from '../config';
import {
  DriverDocument,
  RideDocument,
  ReassignmentHistoryDocument,
  ReassignmentReason,
} from '../models/types';
import { RouteResult } from './routing/RoutingProvider';

export interface ReassignmentEvaluationRuleResult {
  passed: boolean;
  rule: string;
  reason?: string;
  details?: Record<string, any>;
}

export interface ReassignmentEvaluation {
  canReassign: boolean;
  currentEtaMinutes: number;
  bestAlternativeDriver: DriverDocument | null;
  bestAlternativeEtaMinutes: number | null;
  etaImprovementMinutes: number;
  evaluatedAlternatives: Array<{
    driver: DriverDocument;
    distanceKm: number;
    etaMinutes: number;
    etaImprovementMinutes: number;
    eligible: boolean;
    rejectionReason?: string;
  }>;
  ruleChecks: ReassignmentEvaluationRuleResult[];
}

export interface ReassignmentExecutionResult {
  success: boolean;
  ride: RideDocument;
  previousDriver: { driverId: string; name: string };
  newDriver: DriverDocument;
  newRoute: RouteResult;
  historyRecord: ReassignmentHistoryDocument;
  etaImprovementMinutes: number;
}

// In-memory mutex map to prevent concurrent reassignment race conditions
const rideLocks = new Set<string>();

export class ReassignmentService {
  /**
   * Acquire execution lock for a ride
   */
  private acquireLock(rideId: string): boolean {
    if (rideLocks.has(rideId)) return false;
    rideLocks.add(rideId);
    return true;
  }

  /**
   * Release execution lock
   */
  private releaseLock(rideId: string): void {
    rideLocks.delete(rideId);
  }

  /**
   * Evaluate whether a ride qualifies for reassignment based on the 7 strict rules
   */
  async evaluateReassignment(
    rideId: string,
    customReason?: ReassignmentReason
  ): Promise<ReassignmentEvaluation> {
    const ride = await dbManager.ridesCollection.findOne({ rideId });
    if (!ride) {
      throw new Error(`Ride ${rideId} not found`);
    }

    const cfg = CONFIG.REASSIGNMENT_CONFIG;
    const ruleChecks: ReassignmentEvaluationRuleResult[] = [];

    // Rule 1: Ride still needs pickup (must be ASSIGNED or DRIVER_EN_ROUTE)
    const needsPickup = ride.status === 'ASSIGNED' || ride.status === 'DRIVER_EN_ROUTE';
    ruleChecks.push({
      passed: needsPickup,
      rule: '1. Ride still needs pickup',
      reason: needsPickup
        ? 'Ride is awaiting driver arrival'
        : `Ride is in ${ride.status} state, passenger already picked up or cancelled`,
    });

    // Rule 2: Current driver is still assigned
    const currentDriverAssigned = Boolean(ride.assignedDriverId);
    ruleChecks.push({
      passed: currentDriverAssigned,
      rule: '2. Current driver still assigned',
      reason: currentDriverAssigned
        ? `Driver ${ride.assignedDriverId} currently assigned`
        : 'No driver currently assigned to ride',
    });

    // Rule 7: Ride has not already been reassigned too many times
    const maxReassignments = cfg.maximumReassignments;
    const withinReassignmentLimit = (ride.reassignmentCount || 0) < maxReassignments;
    ruleChecks.push({
      passed: withinReassignmentLimit,
      rule: '7. Reassignment attempt limit not exceeded',
      details: { currentCount: ride.reassignmentCount, limit: maxReassignments },
      reason: withinReassignmentLimit
        ? `Reassignment count ${ride.reassignmentCount} is below limit ${maxReassignments}`
        : `Maximum reassignments (${maxReassignments}) reached for ride ${rideId}`,
    });

    // Current driver's reported or predicted driving ETA (incorporates recorded traffic delays)
    let currentEta = ride.etaMinutes || 0;
    if (ride.assignedDriverId && currentEta <= 0) {
      const currentDriver = await dbManager.driversCollection.findOne({
        driverId: ride.assignedDriverId,
      });
      if (currentDriver) {
        try {
          const currentRoute = await osrmService.getRoute(
            [currentDriver.location.coordinates[1], currentDriver.location.coordinates[0]],
            [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
          );
          currentEta = currentRoute.durationMinutes;
        } catch {
          // Keep ride.etaMinutes
        }
      }
    }

    // Find nearby available alternative drivers
    const now = Date.now();
    const rawNearby = await dbManager.driversCollection.findNear(
      [ride.pickupLocation.longitude, ride.pickupLocation.latitude],
      cfg.maximumDriverDistanceKm * 1000,
      {
        status: 'AVAILABLE',
        isOnline: true,
      }
    );

    // Filter out current driver
    const candidateEntries = rawNearby.filter(
      entry => entry.doc.driverId !== ride.assignedDriverId
    );

    const evaluatedAlternatives: ReassignmentEvaluation['evaluatedAlternatives'] = [];
    let bestAlternativeDriver: DriverDocument | null = null;
    let bestAlternativeEtaMinutes: number | null = null;
    let bestEtaImprovement = 0;

    for (const entry of candidateEntries) {
      const driver = entry.doc;
      const driverLng = driver.location.coordinates[0];
      const driverLat = driver.location.coordinates[1];

      // Check Rule 4: Location freshness
      const lastUpdatedMs = new Date(driver.lastUpdatedAt).getTime();
      const ageSeconds = (now - lastUpdatedMs) / 1000;
      const isFresh = ageSeconds <= cfg.maximumLocationAgeSeconds;

      // Check Rule 6: Driver within configured maximum radius
      const withinRadius = entry.distanceKm <= cfg.maximumDriverDistanceKm;

      if (!isFresh) {
        evaluatedAlternatives.push({
          driver,
          distanceKm: entry.distanceKm,
          etaMinutes: 999,
          etaImprovementMinutes: 0,
          eligible: false,
          rejectionReason: `Location stale (${Math.round(ageSeconds)}s old, max ${cfg.maximumLocationAgeSeconds}s)`,
        });
        continue;
      }

      if (!withinRadius) {
        evaluatedAlternatives.push({
          driver,
          distanceKm: entry.distanceKm,
          etaMinutes: 999,
          etaImprovementMinutes: 0,
          eligible: false,
          rejectionReason: `Distance ${entry.distanceKm} km exceeds max radius ${cfg.maximumDriverDistanceKm} km`,
        });
        continue;
      }

      // Query OSRM for actual driving ETA
      try {
        const route = await osrmService.getRoute(
          [driverLat, driverLng],
          [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
        );
        const altEta = route.durationMinutes;
        const etaImprovement = currentEta - altEta;

        const isMeaningfulImprovement = etaImprovement >= cfg.minimumEtaImprovementMinutes;

        evaluatedAlternatives.push({
          driver,
          distanceKm: route.distanceKm,
          etaMinutes: altEta,
          etaImprovementMinutes: etaImprovement,
          eligible: isMeaningfulImprovement,
          rejectionReason: isMeaningfulImprovement
            ? undefined
            : `ETA improvement of ${etaImprovement} min is below required threshold (${cfg.minimumEtaImprovementMinutes} min)`,
        });

        if (isMeaningfulImprovement && etaImprovement > bestEtaImprovement) {
          bestEtaImprovement = etaImprovement;
          bestAlternativeDriver = driver;
          bestAlternativeEtaMinutes = altEta;
        }
      } catch (err) {
        evaluatedAlternatives.push({
          driver,
          distanceKm: entry.distanceKm,
          etaMinutes: 999,
          etaImprovementMinutes: 0,
          eligible: false,
          rejectionReason: 'Failed to calculate OSRM route',
        });
      }
    }

    // Sort alternatives by ETA ascending
    evaluatedAlternatives.sort((a, b) => a.etaMinutes - b.etaMinutes);

    // Rule 3: Alternative driver is available
    const hasAlternative = evaluatedAlternatives.some(a => a.eligible);
    ruleChecks.push({
      passed: hasAlternative,
      rule: '3. Alternative driver is available',
      reason: hasAlternative
        ? `Found ${evaluatedAlternatives.filter(a => a.eligible).length} eligible driver(s)`
        : 'No eligible alternative driver available',
    });

    // Rule 4: Alternative driver location is fresh
    const candidateHasFreshLocation = bestAlternativeDriver
      ? (now - new Date(bestAlternativeDriver.lastUpdatedAt).getTime()) / 1000 <= cfg.maximumLocationAgeSeconds
      : false;
    ruleChecks.push({
      passed: Boolean(bestAlternativeDriver && candidateHasFreshLocation),
      rule: '4. Alternative driver location is fresh',
      reason: bestAlternativeDriver
        ? `Location is fresh for candidate ${bestAlternativeDriver.name}`
        : 'N/A',
    });

    // Rule 5: Alternative driver ETA is meaningfully better
    const meaningfulImprovementPassed = bestEtaImprovement >= cfg.minimumEtaImprovementMinutes;
    ruleChecks.push({
      passed: meaningfulImprovementPassed,
      rule: `5. ETA improvement >= ${cfg.minimumEtaImprovementMinutes} min`,
      details: { currentEta, bestCandidateEta: bestAlternativeEtaMinutes, improvement: bestEtaImprovement },
      reason: meaningfulImprovementPassed
        ? `ETA improves by ${bestEtaImprovement} min (from ${currentEta}m down to ${bestAlternativeEtaMinutes}m)`
        : `Improvement of ${bestEtaImprovement} min does not meet required ${cfg.minimumEtaImprovementMinutes} min threshold`,
    });

    // Rule 6: Driver within max radius
    ruleChecks.push({
      passed: Boolean(bestAlternativeDriver),
      rule: `6. Driver within ${cfg.maximumDriverDistanceKm} km radius`,
      reason: bestAlternativeDriver ? 'Driver located within service radius' : 'No driver within radius',
    });

    const canReassign = ruleChecks.every(r => r.passed);

    return {
      canReassign,
      currentEtaMinutes: currentEta,
      bestAlternativeDriver,
      bestAlternativeEtaMinutes,
      etaImprovementMinutes: bestEtaImprovement,
      evaluatedAlternatives,
      ruleChecks,
    };
  }

  /**
   * Execute automatic or manual pickup reassignment
   */
  async reassignPickup(
    rideId: string,
    options?: {
      targetDriverId?: string;
      reason?: ReassignmentReason;
      force?: boolean;
    }
  ): Promise<ReassignmentExecutionResult> {
    // Acquire concurrency lock
    if (!this.acquireLock(rideId)) {
      throw new Error(`Reassignment for ride ${rideId} is currently being processed by another worker`);
    }

    try {
      const ride = await dbManager.ridesCollection.findOne({ rideId });
      if (!ride) {
        throw new Error(`Ride ${rideId} not found`);
      }

      const reason: ReassignmentReason = options?.reason || 'BETTER_ETA';
      const evaluation = await this.evaluateReassignment(rideId, reason);

      let targetDriver: DriverDocument | null = null;
      let targetEta = 0;

      if (options?.targetDriverId) {
        // Specific driver requested (e.g. manual reassignment)
        targetDriver = await dbManager.driversCollection.findOne({ driverId: options.targetDriverId });
        if (!targetDriver) {
          throw new Error(`Requested alternative driver ${options.targetDriverId} not found`);
        }
        if (targetDriver.status !== 'AVAILABLE' && !options.force) {
          throw new Error(`Driver ${targetDriver.name} is not available (status: ${targetDriver.status})`);
        }
        const route = await osrmService.getRoute(
          [targetDriver.location.coordinates[1], targetDriver.location.coordinates[0]],
          [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
        );
        targetEta = route.durationMinutes;
      } else {
        if (!evaluation.canReassign && !options?.force) {
          const failedRules = evaluation.ruleChecks.filter(r => !r.passed).map(r => r.reason).join('; ');
          throw new Error(`Reassignment rules validation failed: ${failedRules}`);
        }
        targetDriver = evaluation.bestAlternativeDriver;
        targetEta = evaluation.bestAlternativeEtaMinutes || 0;
      }

      if (!targetDriver) {
        throw new Error('No valid driver candidate found for reassignment');
      }

      // Compute full route for new driver to pickup
      const newRoute = await osrmService.getRoute(
        [targetDriver.location.coordinates[1], targetDriver.location.coordinates[0]],
        [ride.pickupLocation.latitude, ride.pickupLocation.longitude]
      );

      const previousDriverId = ride.assignedDriverId || 'UNKNOWN';
      const previousDriverName = ride.assignedDriverName || 'Unassigned';
      const previousEta = ride.etaMinutes;

      // 1. Release previous driver back to AVAILABLE
      if (ride.assignedDriverId) {
        await dbManager.driversCollection.updateOne(
          { driverId: ride.assignedDriverId },
          { $set: { status: 'AVAILABLE', lastUpdatedAt: new Date() } }
        );
      }

      // 2. Mark new driver as ASSIGNED
      await dbManager.driversCollection.updateOne(
        { driverId: targetDriver.driverId },
        { $set: { status: 'ASSIGNED', lastUpdatedAt: new Date() } }
      );

      // 3. Atomically update Ride
      await dbManager.ridesCollection.updateOne(
        { rideId },
        {
          $set: {
            status: 'ASSIGNED',
            assignedDriverId: targetDriver.driverId,
            assignedDriverName: targetDriver.name,
            assignedDriverPhone: targetDriver.phone,
            routeGeometry: newRoute.geometry,
            distanceKm: newRoute.distanceKm,
            etaMinutes: newRoute.durationMinutes,
            lastReassignedAt: new Date(),
            updatedAt: new Date(),
          },
          $inc: {
            reassignmentCount: 1,
          },
        }
      );

      // 4. Record History Record (Section 12: Reassignment History)
      const historyRecord: ReassignmentHistoryDocument = {
        id: `REASSIGN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        rideId,
        previousDriverId,
        previousDriverName,
        newDriverId: targetDriver.driverId,
        newDriverName: targetDriver.name,
        reason,
        previousEta,
        newEta: newRoute.durationMinutes,
        timestamp: new Date().toISOString(),
      };

      await dbManager.reassignmentHistoryCollection.insertOne(historyRecord);

      const updatedRide = (await dbManager.ridesCollection.findOne({ rideId }))!;

      return {
        success: true,
        ride: updatedRide,
        previousDriver: { driverId: previousDriverId, name: previousDriverName },
        newDriver: targetDriver,
        newRoute,
        historyRecord,
        etaImprovementMinutes: previousEta - newRoute.durationMinutes,
      };
    } finally {
      this.releaseLock(rideId);
    }
  }

  /**
   * Retrieve all reassignment history records for a ride
   */
  async getReassignmentHistory(rideId: string): Promise<ReassignmentHistoryDocument[]> {
    return dbManager.reassignmentHistoryCollection.find({ rideId });
  }
}

export const reassignmentService = new ReassignmentService();
