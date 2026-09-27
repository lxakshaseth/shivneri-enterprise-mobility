// ============================================================================
// RIDE REST ENDPOINTS
// Assignment, Automatic Reassignment, State Transitions & Audit History
// ============================================================================

import { Router, Request, Response } from 'express';
import { dbManager } from '../db';
import { driverAssignmentService } from '../services/driverAssignmentService';
import { reassignmentService } from '../services/reassignmentService';
import {
  authenticate,
  requireDispatcherOrAdmin,
} from '../middleware/authMiddleware';
import { RideStatus, ReassignmentReason } from '../models/types';

const router = Router();

/**
 * Valid state transitions for rides
 */
const VALID_TRANSITIONS: Record<RideStatus, RideStatus[]> = {
  REQUESTED: ['ASSIGNING', 'CANCELLED'],
  ASSIGNING: ['ASSIGNED', 'REQUESTED', 'CANCELLED'],
  ASSIGNED: ['DRIVER_EN_ROUTE', 'REASSIGNING', 'CANCELLED'],
  DRIVER_EN_ROUTE: ['ARRIVED', 'REASSIGNING', 'CANCELLED'],
  REASSIGNING: ['ASSIGNED', 'DRIVER_EN_ROUTE', 'CANCELLED'],
  ARRIVED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_PROGRESS'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

/**
 * GET /api/rides
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const rides = await dbManager.ridesCollection.find();
    return res.status(200).json({ success: true, count: rides.length, data: rides });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

/**
 * GET /api/rides/:rideId
 */
router.get('/:rideId', authenticate, async (req: Request, res: Response) => {
  try {
    const ride = await dbManager.ridesCollection.findOne({ rideId: req.params.rideId });
    if (!ride) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ride not found' } });
    }
    return res.status(200).json({ success: true, data: ride });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

/**
 * POST /api/rides
 * Create new ride
 */
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { passengerName, passengerPhone, pickupLocation, dropLocation, organizationId } = req.body;

  if (!pickupLocation?.latitude || !pickupLocation?.longitude) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_PICKUP', message: 'Pickup coordinates required' },
    });
  }

  const rideId = `RIDE-${Date.now()}`;
  const newRide = {
    rideId,
    passengerName: passengerName || 'Employee Passenger',
    passengerPhone: passengerPhone || '+91 90000 00000',
    organizationId: organizationId || 'ORG-001',
    status: 'REQUESTED' as RideStatus,
    pickupLocation: {
      name: pickupLocation.name || 'Pickup Point',
      latitude: pickupLocation.latitude,
      longitude: pickupLocation.longitude,
    },
    dropLocation: {
      name: dropLocation?.name || 'Drop Point',
      latitude: dropLocation?.latitude || 18.5913,
      longitude: dropLocation?.longitude || 73.7389,
    },
    assignedDriverId: null,
    assignedDriverName: null,
    assignedDriverPhone: null,
    routeGeometry: null,
    distanceKm: 0,
    etaMinutes: 0,
    reassignmentCount: 0,
    lastReassignedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await dbManager.ridesCollection.insertOne(newRide);
  return res.status(201).json({ success: true, data: newRide });
});

/**
 * POST /api/rides/:rideId/assign
 * Assigns optimal driver based on OSRM driving routes and ETAs
 */
router.post(
  '/:rideId/assign',
  authenticate,
  requireDispatcherOrAdmin,
  async (req: Request, res: Response) => {
    const { rideId } = req.params;
    const { searchRadiusKm, preferredDriverId } = req.body || {};

    try {
      const result = await driverAssignmentService.assignDriverToPickup(rideId, {
        searchRadiusKm,
        preferredDriverId,
      });

      return res.status(200).json({
        success: true,
        message: `Driver ${result.assignedDriver.name} (${result.assignedDriver.driverId}) assigned successfully.`,
        data: {
          ride: result.ride,
          assignedDriver: result.assignedDriver,
          route: result.route,
          candidateCount: result.evaluatedCandidates.length,
          evaluatedCandidates: result.evaluatedCandidates.map(c => ({
            driverId: c.driver.driverId,
            name: c.driver.name,
            etaMinutes: c.etaMinutes,
            distanceKm: c.distanceKm,
            score: c.score,
          })),
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'ASSIGNMENT_FAILED', message: err.message },
      });
    }
  }
);

/**
 * GET /api/rides/:rideId/reassign/evaluation
 * Evaluates reassignment rules without executing transfer
 */
router.get(
  '/:rideId/reassign/evaluation',
  authenticate,
  async (req: Request, res: Response) => {
    const { rideId } = req.params;
    try {
      const evaluation = await reassignmentService.evaluateReassignment(rideId);
      return res.status(200).json({ success: true, data: evaluation });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'EVALUATION_FAILED', message: err.message },
      });
    }
  }
);

/**
 * POST /api/rides/:rideId/reassign
 * Automatic or manual pickup reassignment
 */
router.post(
  '/:rideId/reassign',
  authenticate,
  requireDispatcherOrAdmin,
  async (req: Request, res: Response) => {
    const { rideId } = req.params;
    const { targetDriverId, reason, force } = req.body || {};

    try {
      const result = await reassignmentService.reassignPickup(rideId, {
        targetDriverId,
        reason: reason as ReassignmentReason,
        force: Boolean(force),
      });

      return res.status(200).json({
        success: true,
        message: `Pickup transferred from ${result.previousDriver.name} to ${result.newDriver.name}. ETA improved by ${result.etaImprovementMinutes} minutes.`,
        data: {
          ride: result.ride,
          previousDriver: result.previousDriver,
          newDriver: result.newDriver,
          newRoute: result.newRoute,
          historyRecord: result.historyRecord,
          etaImprovementMinutes: result.etaImprovementMinutes,
        },
      });
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: { code: 'REASSIGNMENT_FAILED', message: err.message },
      });
    }
  }
);

/**
 * GET /api/rides/:rideId/reassignment-history
 */
router.get(
  '/:rideId/reassignment-history',
  authenticate,
  async (req: Request, res: Response) => {
    const { rideId } = req.params;
    try {
      const history = await reassignmentService.getReassignmentHistory(rideId);
      return res.status(200).json({ success: true, count: history.length, data: history });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: err.message },
      });
    }
  }
);

/**
 * POST /api/rides/:rideId/status
 * Manually advance or change ride state with validation
 */
router.post('/:rideId/status', authenticate, async (req: Request, res: Response) => {
  const { rideId } = req.params;
  const { status } = req.body;

  try {
    const ride = await dbManager.ridesCollection.findOne({ rideId });
    if (!ride) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ride not found' } });
    }

    const currentStatus = ride.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(status as RideStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition ride from ${currentStatus} to ${status}. Allowed next states: ${allowed.join(', ') || 'None'}`,
        },
      });
    }

    await dbManager.ridesCollection.updateOne({ rideId }, { $set: { status, updatedAt: new Date() } });
    const updated = await dbManager.ridesCollection.findOne({ rideId });

    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
