// ============================================================================
// ROUTING TEST SUITE
// Tests valid coordinates, invalid coordinates, same origin/destination,
// timeout, and OSRM fallback/provider abstraction
// ============================================================================

import assert from 'node:assert';
import { OSRMProvider } from '../server/services/routing/OSRMProvider';
import { TrafficRoutingProvider } from '../server/services/routing/TrafficRoutingProvider';
import { osrmService } from '../server/services/routing/osrmService';

export async function runRoutingTests() {
  console.log('\n--- 1. ROUTING TESTS ---');

  const osrm = new OSRMProvider();

  // Test 1.1: Valid coordinates (Pune: Chandani Chowk to Hinjewadi)
  {
    const origin: [number, number] = [18.5080, 73.7925];
    const destination: [number, number] = [18.5913, 73.7389];
    const route = await osrm.getRoute(origin, destination);

    assert.ok(route, 'Route must be returned');
    assert.ok(route.distanceKm > 0, 'Distance must be > 0 km');
    assert.ok(route.durationMinutes > 0, 'Duration must be > 0 minutes');
    assert.strictEqual(route.geometry.type, 'LineString');
    assert.ok(route.geometry.coordinates.length >= 2, 'Geometry must contain at least 2 points');
    console.log(`  ✓ Valid coordinates: distance=${route.distanceKm}km, duration=${route.durationMinutes}m, provider=${route.provider}`);
  }

  // Test 1.2: Same origin and destination
  {
    const point: [number, number] = [18.5204, 73.8567];
    const route = await osrm.getRoute(point, point);

    assert.strictEqual(route.distanceKm, 0, 'Distance for same point should be 0');
    assert.strictEqual(route.durationMinutes, 0, 'Duration for same point should be 0');
    assert.strictEqual(route.geometry.type, 'LineString');
    console.log('  ✓ Same origin/destination: returns 0 km, 0 min');
  }

  // Test 1.3: Invalid coordinates (Latitude out of range > 90)
  {
    let errorCaught = false;
    try {
      await osrm.getRoute([95.0, 73.85], [18.52, 73.85]);
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.message.toLowerCase().includes('latitude'), 'Should throw latitude bounds error');
    }
    assert.ok(errorCaught, 'Should reject latitude > 90');
    console.log('  ✓ Invalid coordinates: bounds error correctly thrown');
  }

  // Test 1.4: Invalid coordinates (Longitude out of range < -180)
  {
    let errorCaught = false;
    try {
      await osrm.getRoute([18.52, -195.0], [18.52, 73.85]);
    } catch (err: any) {
      errorCaught = true;
      assert.ok(err.message.toLowerCase().includes('longitude'), 'Should throw longitude bounds error');
    }
    assert.ok(errorCaught, 'Should reject longitude < -180');
    console.log('  ✓ Invalid coordinates: longitude bounds error correctly thrown');
  }

  // Test 1.5: OSRM timeout / unreachable fallback
  {
    // Point to non-routable dummy host to test graceful fallback
    const brokenOsrm = new OSRMProvider('http://127.0.0.1:54321/nonexistent', 500);
    const origin: [number, number] = [18.5080, 73.7925];
    const destination: [number, number] = [18.5913, 73.7389];

    const fallbackRoute = await brokenOsrm.getRoute(origin, destination);
    assert.ok(fallbackRoute, 'Fallback route must be returned');
    assert.ok(fallbackRoute.distanceKm > 0, 'Fallback distance must be > 0');
    assert.ok(fallbackRoute.durationMinutes > 0, 'Fallback duration must be > 0');
    assert.strictEqual(fallbackRoute.provider, 'OSRM_FALLBACK');
    console.log(`  ✓ OSRM unreachable/timeout: graceful fallback succeeds without crashing (provider: ${fallbackRoute.provider})`);
  }

  // Test 1.6: TrafficRoutingProvider abstraction
  {
    const trafficProvider = new TrafficRoutingProvider(osrm, 1.4);
    const origin: [number, number] = [18.5080, 73.7925];
    const destination: [number, number] = [18.5913, 73.7389];

    const normalEta = await osrm.getEta(origin, destination);
    const trafficEta = await trafficProvider.getEta(origin, destination);

    assert.ok(trafficEta >= normalEta, 'Traffic-aware ETA should account for congestion');
    assert.strictEqual(trafficProvider.isTrafficAware, true);
    console.log(`  ✓ RoutingProvider abstraction: base ETA=${normalEta}m -> traffic ETA=${trafficEta}m`);
  }
}
