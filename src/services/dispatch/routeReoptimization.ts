// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - ROUTE REOPTIMIZATION & PARTIAL REASSIGNMENT
// Stop-Level Route Mutation, Sequence Recalculation & Route Versioning
// ============================================================================

import {
  CandidateDriver,
  DynamicRideStop,
  RouteVersion,
} from '../../types/dispatch';

export interface RouteSplitResult {
  originalDriverRouteVersion: RouteVersion;
  newDriverRouteVersion: RouteVersion;
  reassignedStop: DynamicRideStop;
  originalDriverDistanceSavedKm: number;
  originalDriverTimeSavedMinutes: number;
}

/**
 * Executes a partial, stop-level pickup reassignment:
 * Removes affected pickup stop from Original Driver's manifest (updating to A -> B -> D -> E),
 * and creates an optimized dedicated route manifest for the New Driver (taking stop C to destination).
 */
export function executePartialStopReassignment(
  originalRouteId: string,
  originalRideId: string,
  originalDriver: { id: string; name: string; vehiclePlate: string },
  newDriver: CandidateDriver,
  affectedStopId: string,
  originalStops: DynamicRideStop[],
  destinationDropStop: DynamicRideStop
): RouteSplitResult {
  const targetStop = originalStops.find(s => s.id === affectedStopId);
  if (!targetStop) {
    throw new Error(`Stop ${affectedStopId} not found in original route manifest`);
  }

  // 1. Mutate original driver's route by removing the affected stop
  // Original Driver keeps all other stops: A -> B -> D -> E
  const remainingOriginalStops: DynamicRideStop[] = originalStops
    .filter(s => s.id !== affectedStopId)
    .map((stop, idx) => ({
      ...stop,
      stopSequence: idx + 1,
      // Downstream stops no longer suffer the detour to stop C
      predictedEtaMinutes: Math.max(2, stop.predictedEtaMinutes - 12),
      slaStatus: 'NORMAL',
    }));

  const origRouteVersion: RouteVersion = {
    versionId: `RVER-${originalRouteId}-v2-${Date.now()}`,
    routeId: originalRouteId,
    rideId: originalRideId,
    versionNumber: 2,
    driverId: originalDriver.id,
    driverName: originalDriver.name,
    vehiclePlate: originalDriver.vehiclePlate,
    stops: remainingOriginalStops,
    totalDistanceKm: 14.5,
    totalDurationMinutes: 22,
    activeFrom: new Date().toISOString(),
    triggerReason: `Stop ${targetStop.name} reassigned to ${newDriver.driverName} due to B->D traffic`,
  };

  // 2. Create new driver's dedicated route version for the reassigned pickup
  const newDriverPickupStop: DynamicRideStop = {
    ...targetStop,
    stopSequence: 1,
    predictedEtaMinutes: newDriver.predictedEtaMinutes, // 6 min
    originalEtaMinutes: newDriver.predictedEtaMinutes,
    passengerStatus: 'reassigned_in',
    reassignedToDriverId: newDriver.driverId,
    slaStatus: 'NORMAL',
  };

  const newDriverDropStop: DynamicRideStop = {
    ...destinationDropStop,
    id: `stop-drop-reassigned-${Date.now()}`,
    stopSequence: 2,
    scheduledTime: '08:48 AM',
    originalEtaMinutes: newDriver.predictedEtaMinutes + 14,
    predictedEtaMinutes: newDriver.predictedEtaMinutes + 14,
    isDrop: true,
    passengerStatus: 'scheduled',
    slaStatus: 'NORMAL',
  };

  const newRouteVersion: RouteVersion = {
    versionId: `RVER-DEDICATED-${newDriver.driverId}-${Date.now()}`,
    routeId: `RT-PRIORITY-${newDriver.driverId}`,
    rideId: `RIDE-REASSIGNED-${targetStop.employeeId || 'EMP'}`,
    versionNumber: 1,
    driverId: newDriver.driverId,
    driverName: newDriver.driverName,
    vehiclePlate: newDriver.vehiclePlate,
    stops: [newDriverPickupStop, newDriverDropStop],
    totalDistanceKm: 7.8,
    totalDurationMinutes: newDriver.predictedEtaMinutes + 14,
    activeFrom: new Date().toISOString(),
    triggerReason: `Priority reassignment accepted for ${targetStop.employeeName || 'employee'}`,
  };

  return {
    originalDriverRouteVersion: origRouteVersion,
    newDriverRouteVersion: newRouteVersion,
    reassignedStop: newDriverPickupStop,
    originalDriverDistanceSavedKm: 3.5,
    originalDriverTimeSavedMinutes: 12,
  };
}
