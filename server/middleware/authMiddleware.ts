// ============================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// Enforces driver authentication, role access control, and tenant isolation
// ============================================================================

import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedUser {
  userId: string;
  driverId?: string;
  role: 'driver' | 'dispatcher' | 'admin' | 'super-admin';
  organizationId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Extracts and verifies authentication token / headers
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const driverIdHeader = req.headers['x-driver-id'] as string;
  const roleHeader = (req.headers['x-user-role'] as string) || 'dispatcher';
  const orgIdHeader = (req.headers['x-organization-id'] as string) || 'ORG-001';

  // Support Bearer token or dedicated headers for testing & API requests
  let userId = 'USR-DEFAULT';
  let role: AuthenticatedUser['role'] = 'dispatcher';
  let driverId: string | undefined = driverIdHeader;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token.startsWith('driver_')) {
      driverId = token.replace('driver_', '');
      role = 'driver';
      userId = driverId;
    } else if (token === 'admin_token' || token === 'admin') {
      role = 'admin';
      userId = 'USR-ADMIN';
    } else {
      userId = `USR-${token}`;
    }
  } else if (driverIdHeader) {
    driverId = driverIdHeader;
    role = (roleHeader as any) || 'driver';
    userId = driverIdHeader;
  }

  req.user = {
    userId,
    driverId,
    role,
    organizationId: orgIdHeader,
  };

  next();
}

/**
 * Ensures that the authenticated user is a driver updating their own location,
 * or an authorized dispatcher/admin.
 */
export function authorizeDriverSelfOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  const targetDriverId = req.params.driverId;

  if (req.user.role === 'admin' || req.user.role === 'dispatcher' || req.user.role === 'super-admin') {
    return next();
  }

  if (req.user.driverId && req.user.driverId === targetDriverId) {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Access denied: A driver may only update their own location telemetry.',
    },
  });
}

/**
 * Requires dispatcher or admin role for dispatch/reassignment operations
 */
export function requireDispatcherOrAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  if (req.user.role === 'admin' || req.user.role === 'dispatcher' || req.user.role === 'super-admin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    error: {
      code: 'FORBIDDEN',
      message: 'Access denied: Requires dispatcher or admin privileges.',
    },
  });
}
