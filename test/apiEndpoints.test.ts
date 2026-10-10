// ============================================================================
// API ENDPOINTS INTEGRATION TEST SUITE
// Verifies HTTP endpoints: Health, Root Descriptor, Drivers, Rides, Routing, Reset & 404
// ============================================================================

import assert from 'node:assert';
import http from 'node:http';
import app from '../server/app';
import { dbManager } from '../server/db';

export async function runApiEndpointTests() {
  console.log('\n--- 5. API ENDPOINTS INTEGRATION TESTS ---');

  dbManager.resetDefaults();

  // Spin up an ephemeral HTTP server on random free port
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  const address = server.address() as { port: number };
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const authHeaders = {
    'Authorization': 'Bearer admin_token',
    'Content-Type': 'application/json',
  };

  try {
    // Test 5.1: Root API descriptor endpoint
    {
      const res = await fetch(`${baseUrl}/`);
      assert.strictEqual(res.status, 200, 'Root endpoint must return 200 OK');
      const data = await res.json();
      assert.strictEqual(data.service, 'Shivneri Enterprise Mobility API');
      assert.strictEqual(data.status, 'online');
      assert.ok(data.documentation?.health, 'Must provide documentation paths');
      console.log('  ✓ Root welcome endpoint: Returned API status and service descriptor');
    }

    // Test 5.2: Health check endpoint with system metrics
    {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200, 'Health endpoint must return 200 OK');
      const data = await res.json();
      assert.strictEqual(data.status, 'healthy');
      assert.ok(typeof data.uptime?.seconds === 'number', 'Uptime seconds must be numeric');
      assert.ok(data.system?.memory?.heapUsedMb > 0, 'Memory metrics must be reported');
      assert.strictEqual(data.services?.paidApiKeysRequired, false);
      console.log(`  ✓ Health check: Verified healthy status, uptime (${data.uptime.seconds}s), and memory diagnostics`);
    }

    // Test 5.3: Driver list endpoint
    {
      const res = await fetch(`${baseUrl}/api/drivers`, { headers: authHeaders });
      assert.strictEqual(res.status, 200, 'Drivers endpoint must return 200 OK');
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data), 'Must return data array');
      assert.ok(json.data.length > 0, 'Must have seeded drivers');
      const sample = json.data[0];
      assert.ok(sample.driverId, 'Driver must have driverId');
      assert.strictEqual(sample.location?.type, 'Point', 'Driver location must be GeoJSON Point');
      console.log(`  ✓ Driver listing: Retrieved ${json.data.length} drivers with GeoJSON coordinates`);
    }

    // Test 5.4: Rides list endpoint
    {
      const res = await fetch(`${baseUrl}/api/rides`, { headers: authHeaders });
      assert.strictEqual(res.status, 200, 'Rides endpoint must return 200 OK');
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data), 'Must return rides data array');
      console.log(`  ✓ Rides listing: Retrieved ${json.data.length} corporate rides`);
    }

    // Test 5.5: Route calculation endpoint
    {
      const res = await fetch(
        `${baseUrl}/api/routes?originLat=18.5080&originLng=73.7925&destLat=18.5913&destLng=73.7389`,
        { headers: authHeaders }
      );
      assert.strictEqual(res.status, 200, 'Route calculation must return 200 OK');
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(json.data.distance > 0, 'Distance must be > 0');
      assert.ok(json.data.duration > 0, 'Duration must be > 0');
      assert.strictEqual(json.data.geometry?.type, 'LineString');
      console.log(`  ✓ Route calculation: Successfully calculated ${json.data.distance}km (${json.data.duration}m) via ${json.data.provider}`);
    }

    // Test 5.6: 404 fallback for undefined endpoints
    {
      const res = await fetch(`${baseUrl}/api/undefined-resource-xyz`);
      assert.strictEqual(res.status, 404, 'Unknown endpoint must return 404');
      const data = await res.json();
      assert.strictEqual(data.success, false);
      assert.strictEqual(data.error?.code, 'ENDPOINT_NOT_FOUND');
      console.log('  ✓ API 404 handler: Gracefully returned ENDPOINT_NOT_FOUND error JSON');
    }

    // Test 5.7: Database reset endpoint
    {
      const res = await fetch(`${baseUrl}/api/admin/reset`, { method: 'POST' });
      assert.strictEqual(res.status, 200, 'Admin reset must return 200 OK');
      const data = await res.json();
      assert.strictEqual(data.success, true);
      console.log('  ✓ Admin reset: Successfully restored baseline seed records');
    }
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}
