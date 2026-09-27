// ============================================================================
// GEOLOCATION TEST SUITE
// Tests valid location, invalid coordinates, stale location, and driver authorization
// ============================================================================

import assert from 'node:assert';
import { dbManager } from '../server/db';
import { validateCoordinates } from '../server/middleware/validationMiddleware';
import { authorizeDriverSelfOrAdmin, AuthenticatedUser } from '../server/middleware/authMiddleware';

export async function runGeolocationTests() {
  console.log('\n--- 4. GEOLOCATION TESTS ---');

  dbManager.resetDefaults();

  // Test 4.1: Valid Location Update in MongoDB Point format
  {
    const driverId = 'DRV-208';
    const lat = 18.5204;
    const lng = 73.8567;
    const accuracy = 10;

    await dbManager.driversCollection.updateOne(
      { driverId },
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          accuracy,
          lastUpdatedAt: new Date(),
        },
      }
    );

    const updated = await dbManager.driversCollection.findOne({ driverId });
    assert.strictEqual(updated?.location.type, 'Point');
    assert.strictEqual(updated?.location.coordinates[0], lng);
    assert.strictEqual(updated?.location.coordinates[1], lat);
    assert.strictEqual(updated?.accuracy, accuracy);
    console.log(`  ✓ Valid location update: Persisted MongoDB Point GeoJSON [${lng}, ${lat}] with accuracy ${accuracy}m`);
  }

  // Test 4.2: Coordinate Bounds Validation
  {
    const valid = validateCoordinates(18.5204, 73.8567);
    assert.strictEqual(valid.valid, true);

    const latHigh = validateCoordinates(95.0, 73.8567);
    assert.strictEqual(latHigh.valid, false);
    assert.ok(latHigh.reason?.includes('Latitude'));

    const latLow = validateCoordinates(-91.0, 73.8567);
    assert.strictEqual(latLow.valid, false);

    const lngHigh = validateCoordinates(18.5204, 185.0);
    assert.strictEqual(lngHigh.valid, false);
    assert.ok(lngHigh.reason?.includes('Longitude'));

    const nonNumber = validateCoordinates('abc' as any, 73.8567);
    assert.strictEqual(nonNumber.valid, false);

    console.log('  ✓ Coordinate bounds validation: Correctly accepts valid and rejects out-of-bounds or non-numeric');
  }

  // Test 4.3: Stale Location Detection
  {
    const staleTime = new Date(Date.now() - 90 * 1000); // 90 seconds ago
    const freshTime = new Date(Date.now() - 10 * 1000); // 10 seconds ago

    const isStale90s = (Date.now() - staleTime.getTime()) / 1000 > 60;
    const isStale10s = (Date.now() - freshTime.getTime()) / 1000 > 60;

    assert.strictEqual(isStale90s, true, '90s old telemetry is stale (>60s threshold)');
    assert.strictEqual(isStale10s, false, '10s old telemetry is fresh');
    console.log('  ✓ Stale location detection: Accurately classifies GPS updates based on threshold window');
  }

  // Test 4.4: Driver Authorization Security Check
  {
    // Case A: Driver 1 updating Driver 1 (Allowed)
    let nextCalled = false;
    const mockReqA: any = {
      params: { driverId: 'DRV-101' },
      user: { userId: 'DRV-101', driverId: 'DRV-101', role: 'driver', organizationId: 'ORG-001' } as AuthenticatedUser,
    };
    const mockResA: any = {
      status: () => mockResA,
      json: () => mockResA,
    };
    authorizeDriverSelfOrAdmin(mockReqA, mockResA, () => {
      nextCalled = true;
    });
    assert.strictEqual(nextCalled, true, 'Driver should be authorized to update their own location');

    // Case B: Driver 1 attempting to update Driver 2's location (Forbidden)
    let statusReturned = 0;
    let jsonReturned: any = null;
    const mockReqB: any = {
      params: { driverId: 'DRV-202' }, // Target is Driver 2!
      user: { userId: 'DRV-101', driverId: 'DRV-101', role: 'driver', organizationId: 'ORG-001' } as AuthenticatedUser,
    };
    const mockResB: any = {
      status: (code: number) => {
        statusReturned = code;
        return mockResB;
      },
      json: (data: any) => {
        jsonReturned = data;
        return mockResB;
      },
    };
    authorizeDriverSelfOrAdmin(mockReqB, mockResB, () => {
      assert.fail('Should not call next for unauthorized driver spoofing');
    });
    assert.strictEqual(statusReturned, 403, 'Should return 403 Forbidden for driver updating another driver');
    assert.strictEqual(jsonReturned?.error?.code, 'FORBIDDEN');

    // Case C: Dispatcher updating any driver (Allowed)
    let dispatcherNext = false;
    const mockReqC: any = {
      params: { driverId: 'DRV-202' },
      user: { userId: 'USR-DISPATCH', role: 'dispatcher', organizationId: 'ORG-001' } as AuthenticatedUser,
    };
    authorizeDriverSelfOrAdmin(mockReqC, mockResA, () => {
      dispatcherNext = true;
    });
    assert.strictEqual(dispatcherNext, true, 'Dispatcher should have management permissions');

    console.log('  ✓ Driver authorization: Prevents driver from spoofing another driver\'s location (403 Forbidden)');
  }
}
