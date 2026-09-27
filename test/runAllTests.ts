// ============================================================================
// MASTER TEST RUNNER FOR SHIVNERI MAP & DRIVER-ROUTING SYSTEM
// Runs Routing, Driver Selection, Reassignment & Geolocation test suites
// ============================================================================

import { runRoutingTests } from './routing.test';
import { runDriverSelectionTests } from './driverSelection.test';
import { runReassignmentTests } from './reassignment.test';
import { runGeolocationTests } from './geolocation.test';

async function main() {
  console.log('================================================================');
  console.log('SHIVNERI ENTERPRISE MOBILITY - OPEN-SOURCE ROUTING TEST SUITE');
  console.log('OpenStreetMap + Leaflet + OSRM + MongoDB + Driver Reassignment');
  console.log('================================================================');

  const startTime = Date.now();
  let passedSuites = 0;
  let failedSuites = 0;

  try {
    await runRoutingTests();
    passedSuites++;
  } catch (err) {
    console.error('  ✗ Routing Tests Failed:', err);
    failedSuites++;
  }

  try {
    await runDriverSelectionTests();
    passedSuites++;
  } catch (err) {
    console.error('  ✗ Driver Selection Tests Failed:', err);
    failedSuites++;
  }

  try {
    await runReassignmentTests();
    passedSuites++;
  } catch (err) {
    console.error('  ✗ Reassignment Tests Failed:', err);
    failedSuites++;
  }

  try {
    await runGeolocationTests();
    passedSuites++;
  } catch (err) {
    console.error('  ✗ Geolocation Tests Failed:', err);
    failedSuites++;
  }

  const durationMs = Date.now() - startTime;
  console.log('\n================================================================');
  console.log(`TEST SUITE RESULTS: ${passedSuites} SUITES PASSED, ${failedSuites} FAILED (${durationMs}ms)`);
  console.log('================================================================\n');

  if (failedSuites > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
