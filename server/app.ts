// ============================================================================
// EXPRESS APPLICATION INITIALIZATION
// Open-source Map and Driver Routing System (OSM + Leaflet + OSRM + MongoDB)
// ============================================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import driverRoutes from './routes/driverRoutes';
import routeRoutes from './routes/routeRoutes';
import rideRoutes from './routes/rideRoutes';
import { dbManager } from './db';

const app = express();

// Standard middlewares
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// API Routes
app.use('/api/drivers', driverRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/rides', rideRoutes);

// Root welcome & API descriptor endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    service: 'Shivneri Enterprise Mobility API',
    version: '1.0.2',
    status: 'online',
    documentation: {
      health: '/api/health',
      drivers: '/api/drivers',
      routes: '/api/routes',
      rides: '/api/rides',
    },
    engine: {
      map: 'OpenStreetMap',
      routing: 'OSRM',
      database: dbManager.isConnectedToMongo ? 'MongoDB (Native)' : 'MongoDB (2dsphere In-Memory Engine)',
    },
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const memory = process.memoryUsage();
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        heapUsedMb: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMb: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMb: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    },
    services: {
      mapData: 'OpenStreetMap (Free)',
      mapRendering: 'Leaflet / React-Leaflet',
      routing: 'OSRM (Open Source Routing Machine)',
      database: dbManager.isConnectedToMongo ? 'MongoDB (Native)' : 'MongoDB (2dsphere In-Memory Engine)',
      paidApiKeysRequired: false,
    },
  });
});

// Admin reset endpoint to restore baseline seed data for testing
app.post('/api/admin/reset', (req: Request, res: Response) => {
  dbManager.resetDefaults();
  res.status(200).json({ success: true, message: 'Database reset to default seed state' });
});

// Global 404 handler for API routes
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ENDPOINT_NOT_FOUND',
      message: `The requested endpoint ${req.originalUrl} does not exist`,
    },
  });
});

// Global Error Handler (Section 14: Never crash the application)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    },
  });
});

export default app;
