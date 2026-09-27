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

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
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
