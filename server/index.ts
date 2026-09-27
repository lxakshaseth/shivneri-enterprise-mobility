// ============================================================================
// SERVER ENTRY POINT
// Connects to DB and starts Express HTTP listener on configured port
// ============================================================================

import app from './app';
import { CONFIG } from './config';
import { dbManager } from './db';

const PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT, 10) : CONFIG.PORT;

async function bootstrap() {
  await dbManager.connect();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n================================================================`);
    console.log(`🚀 SHIVNERI OPEN-SOURCE MAP & ROUTING SERVER ACTIVE`);
    console.log(`📍 Endpoint: http://localhost:${PORT}`);
    console.log(`🗺️ Map Engine: OpenStreetMap + Leaflet`);
    console.log(`🚗 Routing Engine: OSRM (${CONFIG.OSRM_BASE_URL})`);
    console.log(`🍃 Database: ${dbManager.isConnectedToMongo ? 'MongoDB' : 'MongoDB 2dsphere In-Memory Engine'}`);
    console.log(`🔐 Zero Paid API Keys Required`);
    console.log(`================================================================\n`);
  });
}

bootstrap().catch(err => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
