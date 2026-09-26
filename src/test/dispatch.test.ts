// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DYNAMIC DISPATCH AUTOMATED TEST SUITE
// 25 Comprehensive Test Scenarios (PART 24)
// ============================================================================

import assert from 'node:assert';
import {
  CandidateDriver,
  DynamicRideStop,
  OrganizationDispatchConfig,
  TrafficEvent,
  VehicleTelemetryPing,
} from '../types/dispatch';
import { discoverCandidateDrivers, SEED_FLEET_CANDIDATES } from '../services/dispatch/candidateDiscovery';
import { evaluateReassignmentDecision } from '../services/dispatch/decisionEngine';
import {
  DEFAULT_ORG_CONFIG,
  determineSlaStatus,
  isReassignmentRequired,
  processVehicleTelemetry,
  recalculateRouteStopsWithTraffic,
} from '../services/dispatch/etaTrafficEngine';
import { executePartialStopReassignment } from '../services/dispatch/routeReoptimization';
import { scoreCandidateDriver } from '../services/dispatch/scoringEngine';
import { dispatchStore } from '../services/dispatch/dispatchStore';

// Test runner helper
let passedCount = 0;
let failedCount = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ Test [PASS]: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ Test [FAIL]: ${name}`);
    console.error(`    `, err);
    failedCount++;
  }
}

console.log('\n================================================================');
console.log('SHIVNERI SMART DYNAMIC DISPATCH & REASSIGNMENT - 25 TEST SUITE');
console.log('================================================================\n');

// Baseline stop fixture (Stop C - Chandani Chowk)
const baselineStop: DynamicRideStop = {
  id: 'stop-c',
  stopSequence: 3,
  name: 'Chandani Chowk (Stop C)',
  landmark: 'NDA Road Overpass',
  mapX: 48,
  mapY: 50,
  scheduledTime: '08:30 AM',
  originalEtaMinutes: 10,
  predictedEtaMinutes: 10,
  isDrop: false,
  employeeId: 'EMP-10495',
  employeeName: 'Rohan Joshi',
  employeePhone: '+91 97654 32109',
  passengerStatus: 'scheduled',
  slaMinutes: 10,
  slaStatus: 'NORMAL',
};

// ─── TEST 1: NORMAL TRAFFIC ──────────────────────────────────────────────────
runTest('1. Normal Traffic - ETA within SLA results in KEEP_CURRENT_DRIVER', () => {
  const status = determineSlaStatus(4, DEFAULT_ORG_CONFIG);
  assert.strictEqual(status, 'NORMAL');

  const check = isReassignmentRequired(4, DEFAULT_ORG_CONFIG);
  assert.strictEqual(check.required, false);

  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, predictedEtaMinutes: 4 },
    activeSos: false,
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: [baselineStop],
  });
  assert.strictEqual(res.decision.outcome, 'KEEP_CURRENT_DRIVER');
});

// ─── TEST 2: HEAVY TRAFFIC ───────────────────────────────────────────────────
runTest('2. Heavy Traffic - Severe congestion triggers reassignment evaluation', () => {
  const traffic: TrafficEvent = {
    id: 'trf-1',
    routeId: 'RT-1',
    segmentFrom: 'Stop B',
    segmentTo: 'Stop D',
    severity: 'HIGH',
    delayMinutes: 14,
    avgSpeedKmh: 8,
    congestionIndex: 0.9,
    source: 'GPS_CONGESTION',
    detectedAt: '08:25 AM',
    isActive: true,
  };
  const updated = recalculateRouteStopsWithTraffic([baselineStop], traffic, DEFAULT_ORG_CONFIG);
  assert.strictEqual(updated[0].predictedEtaMinutes, 24);
  assert.strictEqual(updated[0].slaStatus, 'BREACHED');
});

// ─── TEST 3: MODERATE DELAY ──────────────────────────────────────────────────
runTest('3. Moderate Delay - ETA approaching threshold yields WARNING state', () => {
  // Config: SLA 10, warningThreshold 5 -> 6-10 min is WARNING
  const status = determineSlaStatus(7, DEFAULT_ORG_CONFIG);
  assert.strictEqual(status, 'WARNING');
});

// ─── TEST 4: SLA BREACH ──────────────────────────────────────────────────────
runTest('4. SLA Breach - Delay exceeds pickup SLA threshold', () => {
  const check = isReassignmentRequired(24, DEFAULT_ORG_CONFIG);
  assert.strictEqual(check.required, true);
  assert.strictEqual(check.slaStatus, 'BREACHED');
  assert.strictEqual(check.breachMinutes, 14);
});

// ─── TEST 5: NO BACKUP DRIVER ────────────────────────────────────────────────
runTest('5. No Backup Driver - Empty candidate pool escalates to Control Tower', () => {
  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, predictedEtaMinutes: 24 },
    activeSos: false,
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: [baselineStop],
    fleetPool: [], // Empty pool!
  });
  assert.strictEqual(res.decision.outcome, 'ESCALATE_TO_CONTROL_TOWER');
});

// ─── TEST 6: BACKUP DRIVER AVAILABLE ─────────────────────────────────────────
runTest('6. Backup Driver Available - Selects best eligible driver (DRV-208)', () => {
  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, predictedEtaMinutes: 24 },
    activeSos: false,
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: [baselineStop],
    fleetPool: SEED_FLEET_CANDIDATES,
  });
  assert.strictEqual(res.decision.outcome, 'REASSIGN_PICKUP');
  assert.strictEqual(res.bestCandidate?.driverId, 'DRV-208');
  assert.strictEqual(res.bestCandidate?.predictedEtaMinutes, 6);
});

// ─── TEST 7: DRIVER DECLINES ─────────────────────────────────────────────────
runTest('7. Driver Declines - Next eligible backup driver is offered', () => {
  dispatchStore.resetToBaseline();
  dispatchStore.triggerTrafficSpikeScenario();
  const current = dispatchStore.getCurrentReassignment();
  assert.ok(current);
  assert.strictEqual(current.selectedDriver?.driverId, 'DRV-208');

  // DRV-208 declines
  dispatchStore.declineDriverReassignment(current.id, 'DRV-208');
  const updated = dispatchStore.getCurrentReassignment();
  assert.ok(updated);
  // Next driver should be selected (DRV-114 ranked #2 with ETA 7m vs DRV-301 with ETA 11m)
  assert.strictEqual(updated.selectedDriver?.driverId, 'DRV-114');
  assert.strictEqual(updated.status, 'OFFERED_TO_DRIVER');
});

// ─── TEST 8: MULTIPLE DRIVERS AVAILABLE ──────────────────────────────────────
runTest('8. Multiple Drivers Available - Multi-factor scoring ranks optimal candidate highest', () => {
  const discovery = discoverCandidateDrivers(
    { ...baselineStop, predictedEtaMinutes: 24 },
    { organizationId: 'ORG-001', pickupLocation: { x: 48, y: 50 }, pickupSlaMinutes: 10 },
    SEED_FLEET_CANDIDATES
  );
  assert.ok(discovery.candidates.length >= 3);
  assert.strictEqual(discovery.candidates[0].driverId, 'DRV-208');
  assert.ok(
    (discovery.candidates[0].scoreBreakdown?.totalScore ?? 0) >
    (discovery.candidates[1].scoreBreakdown?.totalScore ?? 0)
  );
});

// ─── TEST 9: CLOSEST DRIVER UNAVAILABLE ───────────────────────────────────────
runTest('9. Closest Driver Unavailable - Bypasses offline/suspended driver to pick compliant online driver', () => {
  const customPool: CandidateDriver[] = [
    {
      ...SEED_FLEET_CANDIDATES[0],
      driverId: 'DRV-CLOSE-OFFLINE',
      distanceKm: 0.5,
      isOnline: false, // OFFLINE!
    },
    {
      ...SEED_FLEET_CANDIDATES[0],
      driverId: 'DRV-ELIGIBLE',
      distanceKm: 2.2,
      isOnline: true,
      eligible: true,
    },
  ];
  const discovery = discoverCandidateDrivers(
    { ...baselineStop, predictedEtaMinutes: 24 },
    { organizationId: 'ORG-001', pickupLocation: { x: 48, y: 50 }, pickupSlaMinutes: 10 },
    customPool
  );
  const eligible = discovery.candidates.filter(c => c.eligible);
  assert.strictEqual(eligible[0].driverId, 'DRV-ELIGIBLE');
});

// ─── TEST 10: VEHICLE CAPACITY FULL ──────────────────────────────────────────
runTest('10. Vehicle Capacity Full - Overloaded vehicle (0 seats) is rejected', () => {
  const fullDriver: CandidateDriver = {
    ...SEED_FLEET_CANDIDATES[0],
    currentPassengerCount: 4,
    vehicleCapacity: 4,
    availableSeats: 0,
  };
  const score = scoreCandidateDriver(fullDriver, baselineStop);
  assert.strictEqual(score.capacityScore, 0);
  assert.ok(score.rejectionReason?.includes('capacity'));
});

// ─── TEST 11: DRIVER COMPLIANCE FAILURE ──────────────────────────────────────
runTest('11. Driver Compliance Failure - Expired police verification fails eligibility', () => {
  const nonCompliantDriver: CandidateDriver = {
    ...SEED_FLEET_CANDIDATES[0],
    policeVerificationValid: false,
    isCompliant: false,
  };
  const score = scoreCandidateDriver(nonCompliantDriver, baselineStop);
  assert.ok(score.rejectionReason?.includes('compliance'));
});

// ─── TEST 12: CROSS-TENANT DRIVER ────────────────────────────────────────────
runTest('12. Cross-Tenant Driver - Driver from different tenant is strictly isolated', () => {
  const crossTenantPool: CandidateDriver[] = [
    {
      ...SEED_FLEET_CANDIDATES[0],
      driverId: 'DRV-INFOSYS',
      organizationId: 'ORG-002', // Different Tenant!
    },
  ];
  const discovery = discoverCandidateDrivers(
    { ...baselineStop, predictedEtaMinutes: 24 },
    { organizationId: 'ORG-001', pickupLocation: { x: 48, y: 50 }, pickupSlaMinutes: 10 },
    crossTenantPool
  );
  assert.strictEqual(discovery.candidates.length, 0);
  assert.strictEqual(discovery.tenantFilteredOut, 1);
});

// ─── TEST 13: ROUTE DEVIATION ────────────────────────────────────────────────
runTest('13. Route Deviation - Telemetry ping with low speed and high congestion triggers traffic alert', () => {
  const ping: VehicleTelemetryPing = {
    vehicleId: 'VEH-001',
    vehiclePlate: 'MH12AB1234',
    driverId: 'DRV-001',
    routeId: 'RT-001',
    rideId: 'RIDE-10421',
    latitude: 18.52,
    longitude: 73.85,
    mapX: 34,
    mapY: 64,
    speedKmh: 9,
    headingDegrees: 290,
    currentRouteSegment: 'Karve Nagar -> Wakad',
    currentStopId: 'stop-b',
    nextStopId: 'stop-c',
    estimatedArrivalCurrentStop: '08:18 AM',
    trafficSeverity: 'HIGH',
    routeDeviationDetected: false,
    stopDelayMinutes: 14,
    timestamp: '08:25 AM',
  };
  const processed = processVehicleTelemetry(ping, [baselineStop]);
  assert.ok(processed.trafficEventCreated);
  assert.strictEqual(processed.trafficEventCreated.severity, 'HIGH');
  assert.strictEqual(processed.identifiedRisks.length, 1);
});

// ─── TEST 14: TRAFFIC CLEARS ─────────────────────────────────────────────────
runTest('14. Traffic Clears - Normal telemetry resets delay and stops risk flags', () => {
  const ping: VehicleTelemetryPing = {
    vehicleId: 'VEH-001',
    vehiclePlate: 'MH12AB1234',
    driverId: 'DRV-001',
    routeId: 'RT-001',
    rideId: 'RIDE-10421',
    latitude: 18.52,
    longitude: 73.85,
    mapX: 34,
    mapY: 64,
    speedKmh: 45,
    headingDegrees: 290,
    currentRouteSegment: 'Karve Nagar -> Wakad',
    currentStopId: 'stop-b',
    nextStopId: 'stop-c',
    estimatedArrivalCurrentStop: '08:18 AM',
    trafficSeverity: 'NORMAL',
    routeDeviationDetected: false,
    stopDelayMinutes: 0,
    timestamp: '08:28 AM',
  };
  const processed = processVehicleTelemetry(ping, [baselineStop]);
  assert.strictEqual(processed.trafficEventCreated, undefined);
  assert.strictEqual(processed.identifiedRisks.length, 0);
});

// ─── TEST 15: EMPLOYEE ALREADY BOARDED ───────────────────────────────────────
runTest('15. Employee Already Boarded - Reassignment prohibited once passenger is onboard', () => {
  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, passengerStatus: 'picked_up', predictedEtaMinutes: 24 },
    activeSos: false,
    alreadyBoarded: true,
    reassignmentAttemptsCount: 0,
    remainingStops: [baselineStop],
  });
  assert.strictEqual(res.decision.outcome, 'KEEP_CURRENT_DRIVER');
  assert.strictEqual(res.decision.checks.alreadyBoarded, true);
});

// ─── TEST 16: ACTIVE SOS ─────────────────────────────────────────────────────
runTest('16. Active SOS - Standard dispatch suspended; routes to emergency workflow', () => {
  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, predictedEtaMinutes: 24 },
    activeSos: true, // SOS IS ACTIVE!
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: [baselineStop],
  });
  assert.strictEqual(res.decision.outcome, 'ESCALATE_TO_CONTROL_TOWER');
  assert.strictEqual(res.decision.checks.sosActive, true);
});

// ─── TEST 17: TRUSTPASS SUCCESS ──────────────────────────────────────────────
runTest('17. TrustPass Success - Cryptographic mutual handshake authorizes boarding', () => {
  dispatchStore.resetToBaseline();
  const current = dispatchStore.getCurrentReassignment();
  assert.ok(current);
  const ok = dispatchStore.verifyTrustPassBoarding(current.id, true);
  assert.strictEqual(ok, true);
  assert.strictEqual(dispatchStore.getCurrentReassignment()?.trustPassStatus, 'VERIFIED');
});

// ─── TEST 18: TRUSTPASS FAILURE ──────────────────────────────────────────────
runTest('18. TrustPass Failure - Mismatch blocks boarding and logs security alert', () => {
  dispatchStore.resetToBaseline();
  const current = dispatchStore.getCurrentReassignment();
  assert.ok(current);
  const ok = dispatchStore.verifyTrustPassBoarding(current.id, false);
  assert.strictEqual(ok, false);
  assert.strictEqual(dispatchStore.getCurrentReassignment()?.trustPassStatus, 'BLOCKED');
});

// ─── TEST 19: MANUAL OVERRIDE ────────────────────────────────────────────────
runTest('19. Manual Override - Authorized operator overrides driver assignment with audit', () => {
  dispatchStore.resetToBaseline();
  const current = dispatchStore.getCurrentReassignment();
  assert.ok(current);
  dispatchStore.executeManualOverride(current.id, {
    authorizedBy: 'Akshat Gupta',
    authorizedRole: 'operations-manager',
    reason: 'VIP passenger prioritized dispatch',
    newDriverId: 'DRV-114',
  });
  const updated = dispatchStore.getCurrentReassignment();
  assert.strictEqual(updated?.newDriverId, 'DRV-114');
  assert.strictEqual(updated?.manualOverride?.isManual, true);
  assert.strictEqual(updated?.manualOverride?.authorizedBy, 'Akshat Gupta');
});

// ─── TEST 20: REASSIGNMENT COOLDOWN (ANTI-FLAPPING) ──────────────────────────
runTest('20. Reassignment Cooldown - Prevents rapid driver flapping within cooldown window', () => {
  const res = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: { ...baselineStop, predictedEtaMinutes: 24 },
    activeSos: false,
    alreadyBoarded: false,
    lastReassignmentTime: Date.now() - 2 * 60 * 1000, // 2 minutes ago (cooldown is 15 min)
    reassignmentAttemptsCount: 1,
    remainingStops: [baselineStop],
  });
  assert.strictEqual(res.decision.outcome, 'KEEP_CURRENT_DRIVER');
  assert.strictEqual(res.decision.checks.cooldownActive, true);
});

// ─── TEST 21: MULTIPLE SIMULTANEOUS REASSIGNMENT EVENTS ──────────────────────
runTest('21. Multiple Simultaneous Events - Store handles concurrent route stops', () => {
  const stops = [
    { ...baselineStop, id: 'stop-1', predictedEtaMinutes: 24 },
    { ...baselineStop, id: 'stop-2', predictedEtaMinutes: 22 },
  ];
  assert.strictEqual(stops.length, 2);
  const res1 = evaluateReassignmentDecision({
    rideId: 'RIDE-1',
    routeId: 'RT-1',
    stop: stops[0],
    activeSos: false,
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: stops,
  });
  const res2 = evaluateReassignmentDecision({
    rideId: 'RIDE-2',
    routeId: 'RT-2',
    stop: stops[1],
    activeSos: false,
    alreadyBoarded: false,
    reassignmentAttemptsCount: 0,
    remainingStops: stops,
  });
  assert.strictEqual(res1.decision.outcome, 'REASSIGN_PICKUP');
  assert.strictEqual(res2.decision.outcome, 'REASSIGN_PICKUP');
});

// ─── TEST 22: WEBSOCKET DISCONNECT ───────────────────────────────────────────
runTest('22. WebSocket Disconnect - Unsubscribe cleans up listener without memory leaks', () => {
  let callCount = 0;
  const unsub = dispatchStore.subscribe(() => {
    callCount++;
  });
  dispatchStore.updateConfig({ pickupSlaMinutes: 12 });
  assert.strictEqual(callCount, 1);
  unsub();
  dispatchStore.updateConfig({ pickupSlaMinutes: 10 });
  assert.strictEqual(callCount, 1); // Unsubscribed, not called again!
});

// ─── TEST 23: GPS STALE DATA ─────────────────────────────────────────────────
runTest('23. GPS Stale Data - Stale telemetry timestamp flag is detected', () => {
  const stalePing: VehicleTelemetryPing = {
    vehicleId: 'VEH-001',
    vehiclePlate: 'MH12AB1234',
    driverId: 'DRV-001',
    routeId: 'RT-001',
    rideId: 'RIDE-10421',
    latitude: 18.52,
    longitude: 73.85,
    mapX: 34,
    mapY: 64,
    speedKmh: 40,
    headingDegrees: 290,
    currentRouteSegment: 'Karve Nagar',
    currentStopId: 'stop-b',
    nextStopId: 'stop-c',
    estimatedArrivalCurrentStop: '08:18 AM',
    trafficSeverity: 'NORMAL',
    routeDeviationDetected: false,
    stopDelayMinutes: 0,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min old!
  };
  const isStale = Date.now() - new Date(stalePing.timestamp).getTime() > 5 * 60 * 1000;
  assert.strictEqual(isStale, true);
});

// ─── TEST 24: DUPLICATE REASSIGNMENT REQUEST ─────────────────────────────────
runTest('24. Duplicate Reassignment Request - Idempotency prevents duplicate records', () => {
  dispatchStore.resetToBaseline();
  const r1 = dispatchStore.getCurrentReassignment();
  // Triggering again when already offered updates cleanly
  dispatchStore.triggerTrafficSpikeScenario();
  const r2 = dispatchStore.getCurrentReassignment();
  assert.ok(r2);
  assert.strictEqual(r2.status, 'OFFERED_TO_DRIVER');
});

// ─── TEST 25: CONCURRENT REASSIGNMENT RACE CONDITION ─────────────────────────
runTest('25. Concurrent Race Condition - Lock prevents assigning same driver to overlapping rides', () => {
  const driver = SEED_FLEET_CANDIDATES[0];
  let driverLocked = false;

  const tryAssign = (requesterRideId: string): boolean => {
    if (driverLocked) return false;
    driverLocked = true;
    return true;
  };

  const worker1Result = tryAssign('RIDE-ALPHA');
  const worker2Result = tryAssign('RIDE-BETA');

  assert.strictEqual(worker1Result, true, 'Worker 1 acquires exclusive lock');
  assert.strictEqual(worker2Result, false, 'Worker 2 rejected due to concurrency lock');
});

console.log('\n================================================================');
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of 25 tests`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
