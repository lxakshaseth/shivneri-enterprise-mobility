// ============================================================================
// VALIDATION MIDDLEWARE
// Strict boundary and schema validation for coordinates and telemetry
// ============================================================================

import { Request, Response, NextFunction } from 'express';

export function validateCoordinates(lat: any, lng: any): { valid: boolean; reason?: string } {
  if (lat === undefined || lat === null || typeof lat !== 'number' || isNaN(lat)) {
    return { valid: false, reason: 'Latitude must be a valid number' };
  }
  if (lng === undefined || lng === null || typeof lng !== 'number' || isNaN(lng)) {
    return { valid: false, reason: 'Longitude must be a valid number' };
  }
  if (lat < -90 || lat > 90) {
    return { valid: false, reason: `Latitude ${lat} out of bounds (-90 to 90)` };
  }
  if (lng < -180 || lng > 180) {
    return { valid: false, reason: `Longitude ${lng} out of bounds (-180 to 180)` };
  }
  return { valid: true };
}

export function validateLocationUpdate(req: Request, res: Response, next: NextFunction) {
  const { latitude, longitude, accuracy } = req.body;

  const coordCheck = validateCoordinates(latitude, longitude);
  if (!coordCheck.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_COORDINATES', message: coordCheck.reason },
    });
  }

  if (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0)) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ACCURACY', message: 'Accuracy must be a positive number' },
    });
  }

  next();
}

export function validateNearbyQuery(req: Request, res: Response, next: NextFunction) {
  const latitude = parseFloat(req.query.latitude as string);
  const longitude = parseFloat(req.query.longitude as string);
  const radius = req.query.radius ? parseFloat(req.query.radius as string) : 10; // Default 10km

  const coordCheck = validateCoordinates(latitude, longitude);
  if (!coordCheck.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_COORDINATES', message: coordCheck.reason },
    });
  }

  if (isNaN(radius) || radius <= 0 || radius > 100) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_RADIUS', message: 'Radius must be a positive number up to 100 km' },
    });
  }

  req.query.latitude = String(latitude);
  req.query.longitude = String(longitude);
  req.query.radius = String(radius);

  next();
}

export function validateRouteQuery(req: Request, res: Response, next: NextFunction) {
  let originLat: number | undefined;
  let originLng: number | undefined;
  let destLat: number | undefined;
  let destLng: number | undefined;

  // Support ?originLat=..&originLng=..&destLat=..&destLng=.. OR ?origin=lat,lng&destination=lat,lng
  if (req.query.originLat && req.query.originLng) {
    originLat = parseFloat(req.query.originLat as string);
    originLng = parseFloat(req.query.originLng as string);
  } else if (req.query.origin) {
    const parts = (req.query.origin as string).split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2) {
      originLat = parts[0];
      originLng = parts[1];
    }
  }

  if (req.query.destLat && req.query.destLng) {
    destLat = parseFloat(req.query.destLat as string);
    destLng = parseFloat(req.query.destLng as string);
  } else if (req.query.destination) {
    const parts = (req.query.destination as string).split(',').map(s => parseFloat(s.trim()));
    if (parts.length === 2) {
      destLat = parts[0];
      destLng = parts[1];
    }
  }

  const originCheck = validateCoordinates(originLat, originLng);
  if (!originCheck.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_ORIGIN', message: originCheck.reason },
    });
  }

  const destCheck = validateCoordinates(destLat, destLng);
  if (!destCheck.valid) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_DESTINATION', message: destCheck.reason },
    });
  }

  (req as any).routePoints = {
    origin: [originLat, originLng] as [number, number],
    destination: [destLat, destLng] as [number, number],
  };

  next();
}
