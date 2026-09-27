// ============================================================================
// ROUTING REST ENDPOINTS
// GET /api/routes
// Computes driving routes, distance (km), duration (min), and GeoJSON line
// ============================================================================

import { Router, Request, Response } from 'express';
import { osrmService } from '../services/routing/osrmService';
import { validateRouteQuery } from '../middleware/validationMiddleware';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

/**
 * GET /api/routes
 * Parameters:
 * ?originLat=18.5204&originLng=73.8567&destLat=18.5913&destLng=73.7389
 * OR ?origin=18.5204,73.8567&destination=18.5913,73.7389
 */
router.get('/', authenticate, validateRouteQuery, async (req: Request, res: Response) => {
  const { origin, destination } = (req as any).routePoints as {
    origin: [number, number]; // [lat, lng]
    destination: [number, number]; // [lat, lng]
  };

  try {
    const route = await osrmService.getRoute(origin, destination);

    return res.status(200).json({
      success: true,
      data: {
        distance: route.distanceKm, // In kilometers
        duration: route.durationMinutes, // In minutes
        geometry: route.geometry, // GeoJSON LineString
        steps: route.steps,
        provider: route.provider,
        isTrafficAware: route.isTrafficAware,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ROUTING_FAILED',
        message: err.message || 'Failed to calculate driving route',
      },
    });
  }
});

export default router;
