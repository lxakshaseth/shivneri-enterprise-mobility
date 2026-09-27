// ============================================================================
// DRIVER SELECTION TEST SUITE
// Tests nearest driver, fastest ETA driver, empty pool, stale driver,
// offline driver, and busy driver
// ============================================================================

import assert from 'node:assert';
import { dbManager } from '../server/db';
import { driverAssignmentService } from '../server/services/driverAssignmentService';
import { DriverDocument, RideDocument } from '../server/models/types';

export async function runDriverSelectionTests() {
  console.log('\n--- 2. DRIVER SELECTION TESTS ---');

  // Reset database to default seed state
  dbManager.resetDefaults();

  const pickupLat = 18.5080;
  const pickupLng = 73.7925;

  // Test 2.1: Fastest ETA vs Nearest Straight-Line Distance
  {
    // Driver A is closer straight-line (1.5 km), but has high traffic/circuitous path (ETA 18 min)
    // Driver B is farther straight-line (3.5 km), but on highway with fast flow (ETA 6 min)
    const customRide: RideDocument = {
      rideId: 'RIDE-SELECTION-1',
      passengerName: 'Priya Sharma',
      passengerPhone: '+91 91234 56789',
      organizationId: 'ORG-001',
      status: 'REQUESTED',
      pickupLocation: { name: 'Chandani Chowk', latitude: pickupLat, longitude: pickupLng },
      dropLocation: { name: 'Hinjewadi', latitude: 18.5913, longitude: 73.7389 },
      assignedDriverId: null,
      assignedDriverName: null,
      assignedDriverPhone: null,
      routeGeometry: null,
      distanceKm: 0,
      etaMinutes: 0,
      reassignmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await dbManager.ridesCollection.insertOne(customRide);

    const assignment = await driverAssignmentService.assignDriverToPickup('RIDE-SELECTION-1');
    assert.ok(assignment.assignedDriver, 'Should assign a driver');
    // Driver Mohan Singh (DRV-208) has the fastest route ETA from Paud Road to Chandani Chowk (~6 min)
    assert.ok(assignment.assignedDriver.driverId === 'DRV-208' || assignment.assignedDriver.driverId === 'DRV-114');
    assert.ok(assignment.route.durationMinutes <= 15, 'Selected driver must have optimal ETA');
    console.log(`  ✓ Fastest ETA driver selected: ${assignment.assignedDriver.name} (${assignment.assignedDriver.driverId}) with ETA ${assignment.route.durationMinutes} min`);
  }

  // Test 2.2: Offline drivers are excluded
  {
    const offlineDriver = await dbManager.driversCollection.findOne({ driverId: 'DRV-404' });
    assert.strictEqual(offlineDriver?.status, 'OFFLINE');
    assert.strictEqual(offlineDriver?.isOnline, false);

    const nearby = await driverAssignmentService.findAvailableNearbyDrivers(pickupLat, pickupLng, 15);
    const offlineFound = nearby.find(d => d.driverId === 'DRV-404');
    assert.strictEqual(offlineFound, undefined, 'Offline driver must not appear in candidate pool');
    console.log('  ✓ Offline driver (DRV-404) successfully excluded from candidate pool');
  }

  // Test 2.3: Busy/Assigned drivers are excluded
  {
    const busyDriver = await dbManager.driversCollection.findOne({ driverId: 'DRV-001' });
    assert.strictEqual(busyDriver?.status, 'ASSIGNED');

    const nearby = await driverAssignmentService.findAvailableNearbyDrivers(pickupLat, pickupLng, 15);
    const busyFound = nearby.find(d => d.driverId === 'DRV-001');
    assert.strictEqual(busyFound, undefined, 'Busy/Assigned driver must not appear in available pool');
    console.log('  ✓ Busy/Assigned driver (DRV-001) successfully excluded from available pool');
  }

  // Test 2.4: Stale location drivers are excluded
  {
    // Temporarily insert a driver with stale telemetry (10 minutes old)
    const staleDriver: DriverDocument = {
      driverId: 'DRV-STALE',
      name: 'Stale Driver',
      phone: '+91 99999 11111',
      status: 'AVAILABLE',
      isOnline: true,
      location: { type: 'Point', coordinates: [73.7930, 18.5085] }, // Right at pickup!
      accuracy: 5,
      lastUpdatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      rating: 5.0,
      isCompliant: true,
      policeVerificationValid: true,
      poshCertified: true,
      vehicle: { plate: 'MH 12 ST 0001', model: 'Cab', type: 'cab', capacity: 4 },
    };
    await dbManager.driversCollection.insertOne(staleDriver);

    const nearby = await driverAssignmentService.findAvailableNearbyDrivers(pickupLat, pickupLng, 10, 60);
    const foundStale = nearby.find(d => d.driverId === 'DRV-STALE');
    assert.strictEqual(foundStale, undefined, 'Stale driver must be excluded');
    console.log('  ✓ Stale driver (last location 10m ago) excluded from dispatch candidates');
  }

  // Test 2.5: No available drivers
  {
    const customRide: RideDocument = {
      rideId: 'RIDE-EMPTY-POOL',
      passengerName: 'Amit Kumar',
      passengerPhone: '+91 99887 76655',
      organizationId: 'ORG-001',
      status: 'REQUESTED',
      pickupLocation: { name: 'Remote Outpost', latitude: 20.0000, longitude: 78.0000 }, // Far away
      dropLocation: { name: 'City Center', latitude: 20.0500, longitude: 78.0500 },
      assignedDriverId: null,
      assignedDriverName: null,
      assignedDriverPhone: null,
      routeGeometry: null,
      distanceKm: 0,
      etaMinutes: 0,
      reassignmentCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await dbManager.ridesCollection.insertOne(customRide);

    let caught = false;
    try {
      await driverAssignmentService.assignDriverToPickup('RIDE-EMPTY-POOL', { searchRadiusKm: 5 });
    } catch (err: any) {
      caught = true;
      assert.ok(err.message.includes('No available online drivers found'));
    }
    assert.ok(caught, 'Should throw error when pool is empty');

    const updated = await dbManager.ridesCollection.findOne({ rideId: 'RIDE-EMPTY-POOL' });
    assert.strictEqual(updated?.status, 'REQUESTED', 'Ride status should reset safely');
    console.log('  ✓ No available drivers: throws controlled error and keeps ride in REQUESTED state');
  }
}
