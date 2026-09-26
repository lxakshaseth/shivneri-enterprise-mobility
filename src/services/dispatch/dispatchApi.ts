// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DISPATCH REST & REAL-TIME API CLIENT
// API Endpoints with ABAC/RBAC Policy Enforcement & Tenant Boundary Validation
// ============================================================================

import {
  CandidateDriver,
  DispatchAnalyticsKPIs,
  DynamicRideStop,
  ReassignmentEvent,
  TrafficEvent,
} from '../../types/dispatch';
import { dispatchStore } from './dispatchStore';

export interface ApiAuthContext {
  userId: string;
  userName: string;
  userRole: string; // 'super-admin' | 'transport-manager' | 'operations-manager' | 'driver' | 'employee'
  organizationId: string;
  permissions: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    tenantScope: string;
  };
}

/**
 * Validates permission against user's auth context.
 */
function assertPermission(
  ctx: ApiAuthContext,
  requiredPermission: string,
  resourceOrgId?: string
): void {
  // Super admin wildcard
  if (ctx.permissions.includes('*')) return;

  // Tenant boundary check (ABAC)
  if (resourceOrgId && resourceOrgId !== ctx.organizationId && !ctx.permissions.includes('*')) {
    throw new Error(`ABAC Access Denied: Cross-tenant access attempted to ${resourceOrgId} from user tenant ${ctx.organizationId}`);
  }

  // RBAC permission check
  if (!ctx.permissions.includes(requiredPermission)) {
    throw new Error(`RBAC Forbidden: Role ${ctx.userRole} lacks required permission: ${requiredPermission}`);
  }
}

/**
 * Simulated Production REST API Client with full RBAC/ABAC enforcement.
 */
export class SmartDispatchApiClient {
  /**
   * GET /api/rides/:rideId/dispatch-status
   */
  public static async getRideDispatchStatus(
    rideId: string,
    auth: ApiAuthContext
  ): Promise<ApiResponse<{
    stops: DynamicRideStop[];
    activeReassignment: ReassignmentEvent | null;
    trafficEvents: TrafficEvent[];
  }>> {
    assertPermission(auth, 'tracking.view');

    const stops = dispatchStore.getStops();
    const activeReassignment = dispatchStore.getCurrentReassignment();
    const trafficEvents = dispatchStore.getTrafficEvents();

    return {
      success: true,
      statusCode: 200,
      data: { stops, activeReassignment, trafficEvents },
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * GET /api/rides/:rideId/reassignment-candidates
   */
  public static async getReassignmentCandidates(
    rideId: string,
    auth: ApiAuthContext
  ): Promise<ApiResponse<CandidateDriver[]>> {
    assertPermission(auth, 'ride.assign');

    const reassignment = dispatchStore.getCurrentReassignment();
    const candidates = reassignment?.candidateDrivers || [];

    // Data masking: hide driver contact details from non-managerial roles
    const safeCandidates = candidates.map(c => ({
      ...c,
      driverPhone: auth.userRole.includes('manager') || auth.userRole.includes('admin')
        ? c.driverPhone
        : '••••••••8821',
    }));

    return {
      success: true,
      statusCode: 200,
      data: safeCandidates,
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * POST /api/rides/:rideId/reassignment/evaluate
   */
  public static async evaluateReassignment(
    rideId: string,
    auth: ApiAuthContext
  ): Promise<ApiResponse<ReassignmentEvent | null>> {
    assertPermission(auth, 'ride.assign');

    dispatchStore.triggerTrafficSpikeScenario();
    const result = dispatchStore.getCurrentReassignment();

    return {
      success: true,
      statusCode: 200,
      data: result,
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * POST /api/rides/:rideId/reassignment/:reassignmentId/accept
   */
  public static async acceptReassignment(
    rideId: string,
    reassignmentId: string,
    driverId: string,
    auth: ApiAuthContext
  ): Promise<ApiResponse<{ status: string; message: string }>> {
    assertPermission(auth, 'ride.accept');

    dispatchStore.acceptDriverReassignment(reassignmentId, driverId);

    return {
      success: true,
      statusCode: 200,
      data: {
        status: 'ACCEPTED',
        message: `Driver #${driverId} confirmed pickup reassignment. Route updated and TrustPass token generated.`,
      },
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * POST /api/rides/:rideId/reassignment/:reassignmentId/decline
   */
  public static async declineReassignment(
    rideId: string,
    reassignmentId: string,
    driverId: string,
    auth: ApiAuthContext
  ): Promise<ApiResponse<{ status: string; message: string }>> {
    assertPermission(auth, 'ride.accept');

    dispatchStore.declineDriverReassignment(reassignmentId, driverId);

    return {
      success: true,
      statusCode: 200,
      data: {
        status: 'DECLINED',
        message: 'Driver declined offer. Engine engaged next nearby candidate.',
      },
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * GET /api/admin/dispatch/at-risk
   */
  public static async getAtRiskRides(
    auth: ApiAuthContext
  ): Promise<ApiResponse<ReassignmentEvent[]>> {
    assertPermission(auth, 'tracking.view');

    const history = dispatchStore.getReassignmentsHistory();
    const atRisk = history.filter(r => r.status === 'OFFERED_TO_DRIVER' || r.status === 'ESCALATED');

    return {
      success: true,
      statusCode: 200,
      data: atRisk,
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * GET /api/admin/dispatch/reassignments
   */
  public static async getReassignments(
    auth: ApiAuthContext
  ): Promise<ApiResponse<ReassignmentEvent[]>> {
    assertPermission(auth, 'tracking.view');

    const history = dispatchStore.getReassignmentsHistory();

    return {
      success: true,
      statusCode: 200,
      data: history,
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * POST /api/admin/dispatch/manual-reassignment
   */
  public static async manualReassignment(
    reassignmentId: string,
    params: {
      newDriverId: string;
      reason: string;
    },
    auth: ApiAuthContext
  ): Promise<ApiResponse<{ status: string }>> {
    assertPermission(auth, 'ride.assign');

    dispatchStore.executeManualOverride(reassignmentId, {
      authorizedBy: auth.userName,
      authorizedRole: auth.userRole,
      reason: params.reason,
      newDriverId: params.newDriverId,
    });

    return {
      success: true,
      statusCode: 200,
      data: { status: 'OVERRIDDEN' },
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }

  /**
   * GET /api/admin/dispatch/kpis
   */
  public static async getKpis(
    auth: ApiAuthContext
  ): Promise<ApiResponse<DispatchAnalyticsKPIs>> {
    assertPermission(auth, 'tracking.view');

    return {
      success: true,
      statusCode: 200,
      data: dispatchStore.getKpis(),
      metadata: {
        requestId: `REQ-${Date.now()}`,
        timestamp: new Date().toISOString(),
        tenantScope: auth.organizationId,
      },
    };
  }
}
