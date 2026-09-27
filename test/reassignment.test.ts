// ============================================================================
// REASSIGNMENT TEST SUITE
// Tests better ETA, insufficient ETA improvement, driver unavailable,
// maximum reassignments limit, concurrent race conditions, and already boarded
// ============================================================================

import assert from 'node:assert';
import { dbManager } from '../server/db';
import { reassignmentService } from '../server/services/reassignmentService';
import { RideDocument, DriverDocument } from '../server/models/types';
import { CONFIG } from '../server/config';

export async function runReassignmentTests() {
  console.log('\n--- 3. REASSIGNMENT TESTS ---');

  // Reset DB
  dbManager.resetDefaults();

  // Test 3.1: Better ETA triggers valid reassignment
  {
    // Baseline SEED_RIDE has Driver Raj Kumar (DRV-001) with ETA 18 min
    // Driver Mohan Singh (DRV-208) is at Bavdhan with ETA ~6 min (Improvement: ~12 min >= 5 min threshold)
    const evalResult = await reassignmentService.evaluateReassignment('RIDE-10421');

    assert.strictEqual(evalResult.canReassign, true, 'Reassignment rules should pass for severe ETA discrepancy');
    assert.ok(evalResult.bestAlternativeDriver, 'Should find Mohan Singh as alternative');
    assert.strictEqual(evalResult.bestAlternativeDriver?.driverId, 'DRV-208');
    assert.ok(evalResult.etaImprovementMinutes >= CONFIG.REASSIGNMENT_CONFIG.minimumEtaImprovementMinutes);

    // Execute reassignment
    const execResult = await reassignmentService.reassignPickup('RIDE-10421');
    assert.strictEqual(execResult.success, true);
    assert.strictEqual(execResult.newDriver.driverId, 'DRV-208');
    assert.strictEqual(execResult.previousDriver.driverId, 'DRV-001');

    // Verify ride document updated
    const updatedRide = await dbManager.ridesCollection.findOne({ rideId: 'RIDE-10421' });
    assert.strictEqual(updatedRide?.assignedDriverId, 'DRV-208');
    assert.strictEqual(updatedRide?.reassignmentCount, 1);

    // Verify previous driver released to AVAILABLE
    const prevDriver = await dbManager.driversCollection.findOne({ driverId: 'DRV-001' });
    assert.strictEqual(prevDriver?.status, 'AVAILABLE');

    // Verify new driver is ASSIGNED
    const newDriver = await dbManager.driversCollection.findOne({ driverId: 'DRV-208' });
    assert.strictEqual(newDriver?.status, 'ASSIGNED');

    // Verify History record (Section 12)
    const history = await reassignmentService.getReassignmentHistory('RIDE-10421');
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].previousDriverId, 'DRV-001');
    assert.strictEqual(history[0].newDriverId, 'DRV-208');
    assert.strictEqual(history[0].reason, 'BETTER_ETA');

    console.log(`  ✓ Better ETA reassignment: Transferred DRV-001 (ETA ${execResult.historyRecord.previousEta}m) -> DRV-208 (ETA ${execResult.historyRecord.newEta}m). Improvement: ${execResult.etaImprovementMinutes}m`);
  }

  // Test 3.2: Insufficient ETA improvement is rejected
  {
    // Now RIDE-10421 has DRV-208 with ETA ~6 min.
    // Candidate DRV-114 has ETA ~8 min. Improvement is negative or < 5 min.
    const evalResult = await reassignmentService.evaluateReassignment('RIDE-10421');
    assert.strictEqual(evalResult.canReassign, false, 'Should reject reassignment when improvement is < 5 min');
    const improvementRule = evalResult.ruleChecks.find(r => r.rule.includes('ETA improvement'));
    assert.strictEqual(improvementRule?.passed, false);
    console.log('  ✓ Insufficient ETA improvement: Correctly rejected (threshold: >= 5 min)');
  }

  // Test 3.3: Maximum reassignments limit enforced
  {
    // Max reassignments is 2. Let's set ride.reassignmentCount = 2
    await dbManager.ridesCollection.updateOne(
      { rideId: 'RIDE-10421' },
      { $set: { reassignmentCount: CONFIG.REASSIGNMENT_CONFIG.maximumReassignments } }
    );

    const evalResult = await reassignmentService.evaluateReassignment('RIDE-10421');
    assert.strictEqual(evalResult.canReassign, false);
    const limitRule = evalResult.ruleChecks.find(r => r.rule.includes('attempt limit'));
    assert.strictEqual(limitRule?.passed, false);

    let caught = false;
    try {
      await reassignmentService.reassignPickup('RIDE-10421');
    } catch (err: any) {
      caught = true;
      assert.ok(err.message.includes('validation failed') || err.message.includes('limit'));
    }
    assert.ok(caught, 'Should prevent exceeding maximum reassignments');
    console.log('  ✓ Maximum reassignment limit: Blocks 3rd attempt after reaching configured maximum of 2');
  }

  // Test 3.4: Ride already picked up cannot be reassigned
  {
    const pickedUpRide: RideDocument = {
      rideId: 'RIDE-PICKED-UP',
      passengerName: 'Nisha Verma',
      passengerPhone: '+91 97654 00000',
      organizationId: 'ORG-001',
      status: 'PICKED_UP', // Passenger is onboard!
      pickupLocation: { name: 'Chandani Chowk', latitude: 18.5080, longitude: 73.7925 },
      dropLocation: { name: 'Hinjewadi', latitude: 18.5913, longitude: 73.7389 },
      assignedDriverId: 'DRV-208',
      assignedDriverName: 'Mohan Singh',
      assignedDriverPhone: '+91 97654 33211',
      routeGeometry: null,
      distanceKm: 4.8,
      etaMinutes: 15,
      reassignmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await dbManager.ridesCollection.insertOne(pickedUpRide);

    const evalResult = await reassignmentService.evaluateReassignment('RIDE-PICKED-UP');
    assert.strictEqual(evalResult.canReassign, false);
    const stateRule = evalResult.ruleChecks.find(r => r.rule.includes('needs pickup'));
    assert.strictEqual(stateRule?.passed, false);
    console.log('  ✓ Already picked up: Passenger onboard prohibits pickup reassignment');
  }

  // Test 3.5: Concurrent Reassignment Race Condition Lock
  {
    const rideId = 'RIDE-RACE-TEST';
    const raceRide: RideDocument = {
      rideId,
      passengerName: 'Kiran Mane',
      passengerPhone: '+91 99112 23344',
      organizationId: 'ORG-001',
      status: 'ASSIGNED',
      pickupLocation: { name: 'Chandani Chowk', latitude: 18.5080, longitude: 73.7925 },
      dropLocation: { name: 'Hinjewadi', latitude: 18.5913, longitude: 73.7389 },
      assignedDriverId: 'DRV-001',
      assignedDriverName: 'Raj Kumar',
      assignedDriverPhone: '+91 98230 11223',
      routeGeometry: null,
      distanceKm: 5.0,
      etaMinutes: 22,
      reassignmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await dbManager.ridesCollection.insertOne(raceRide);

    // Run two reassignment calls concurrently
    const p1 = reassignmentService.reassignPickup(rideId, { force: true, targetDriverId: 'DRV-301' });
    const p2 = reassignmentService.reassignPickup(rideId, { force: true, targetDriverId: 'DRV-114' });

    const results = await Promise.allSettled([p1, p2]);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const rejectedCount = results.filter(r => r.status === 'rejected').length;

    assert.strictEqual(successCount, 1, 'Only one concurrent reassignment should succeed');
    assert.strictEqual(rejectedCount, 1, 'Second concurrent request must be rejected with concurrency lock');
    console.log('  ✓ Concurrency lock: Prevents duplicate/conflicting simultaneous reassignment requests');
  }
}
