// ============================================================================
// DRIVER REST ENDPOINTS
// PUT /api/drivers/:driverId/location & GET /api/drivers/nearby
// ============================================================================

import { Router, Request, Response } from 'express';
import { dbManager } from '../db';
import {
  authenticate,
  authorizeDriverSelfOrAdmin,
} from '../middleware/authMiddleware';
import {
  validateLocationUpdate,
  validateNearbyQuery,
} from '../middleware/validationMiddleware';
import { CONFIG } from '../config';

const router = Router();

/**
 * PUT /api/drivers/:driverId/location
 * Updates driver's latest GPS telemetry in MongoDB Point format
 */
router.put(
  '/:driverId/location',
  authenticate,
  authorizeDriverSelfOrAdmin,
  validateLocationUpdate,
  async (req: Request, res: Response) => {
    const { driverId } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    try {
      const driver = await dbManager.driversCollection.findOne({ driverId });

      if (!driver) {
        return res.status(404).json({
          success: false,
          error: { code: 'DRIVER_NOT_FOUND', message: `Driver with ID ${driverId} does not exist` },
        });
      }

      // Check if driver is active
      if (!driver.isOnline || driver.status === 'OFFLINE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'DRIVER_INACTIVE',
            message: 'Driver must be online before location updates can be accepted',
          },
        });
      }

      // Update location in MongoDB GeoJSON format
      await dbManager.driversCollection.updateOne(
        { driverId },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [longitude, latitude], // [lng, lat]
            },
            accuracy: accuracy || 10,
            lastUpdatedAt: new Date(),
          },
        }
      );

      const updated = await dbManager.driversCollection.findOne({ driverId });

      return res.status(200).json({
        success: true,
        data: {
          driverId,
          location: updated?.location,
          accuracy: updated?.accuracy,
          lastUpdatedAt: updated?.lastUpdatedAt,
          status: updated?.status,
        },
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }
);

/**
 * GET /api/drivers/nearby
 * Find nearby available drivers using MongoDB 2dsphere queries
 * Filters out offline, busy, and stale drivers
 */
router.get(
  '/nearby',
  authenticate,
  validateNearbyQuery,
  async (req: Request, res: Response) => {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseFloat(req.query.radius as string) || 10; // in km

    try {
      const maxMeters = radius * 1000;
      const now = Date.now();
      const maxAgeMs = CONFIG.GEOLOCATION.staleLocationThresholdSeconds * 1000;

      // Geospatial query for AVAILABLE and isOnline drivers
      const nearResults = await dbManager.driversCollection.findNear(
        [longitude, latitude],
        maxMeters,
        {
          status: 'AVAILABLE',
          isOnline: true,
        }
      );

      // Exclude stale drivers and format response
      const results = nearResults
        .filter(entry => {
          const age = now - new Date(entry.doc.lastUpdatedAt).getTime();
          return age <= maxAgeMs;
        })
        .map(entry => {
          const d = entry.doc;
          return {
            driverId: d.driverId,
            name: d.name,
            phone: d.phone,
            distance: entry.distanceKm,
            latitude: d.location.coordinates[1],
            longitude: d.location.coordinates[0],
            rating: d.rating,
            status: d.status,
            isOnline: d.isOnline,
            vehicle: d.vehicle,
            lastUpdatedAt: d.lastUpdatedAt,
          };
        });

      return res.status(200).json({
        success: true,
        count: results.length,
        radiusKm: radius,
        data: results,
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }
);

/**
 * GET /api/drivers
 * Returns all drivers for dispatcher map
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const drivers = await dbManager.driversCollection.find();
    return res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

/**
 * GET /api/drivers/:driverId
 */
router.get('/:driverId', authenticate, async (req: Request, res: Response) => {
  try {
    const driver = await dbManager.driversCollection.findOne({ driverId: req.params.driverId });
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Driver not found' },
      });
    }
    return res.status(200).json({ success: true, data: driver });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

/**
 * POST /api/drivers/:driverId/status
 * Toggle or set driver status
 */
router.post('/:driverId/status', authenticate, async (req: Request, res: Response) => {
  const { status, isOnline } = req.body;
  const { driverId } = req.params;

  try {
    const update: any = { lastUpdatedAt: new Date() };
    if (status !== undefined) update.status = status;
    if (isOnline !== undefined) update.isOnline = isOnline;

    await dbManager.driversCollection.updateOne({ driverId }, { $set: update });
    const updated = await dbManager.driversCollection.findOne({ driverId });

    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export default router;
