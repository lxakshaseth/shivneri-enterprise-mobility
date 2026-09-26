// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DISPATCH STORE REACT HOOK
// Reactive Subscription Hook for Live Dispatch Updates (WebSocket/SSE Simulation)
// ============================================================================

import { useEffect, useState } from 'react';
import {
  DispatchAnalyticsKPIs,
  DispatchNotificationEvent,
  DynamicRideStop,
  OrganizationDispatchConfig,
  ReassignmentEvent,
  TrafficEvent,
} from '../../types/dispatch';
import { dispatchStore } from './dispatchStore';

export interface DispatchStoreState {
  config: OrganizationDispatchConfig;
  stops: DynamicRideStop[];
  currentReassignment: ReassignmentEvent | null;
  history: ReassignmentEvent[];
  kpis: DispatchAnalyticsKPIs;
  trafficEvents: TrafficEvent[];
  notifications: DispatchNotificationEvent[];
  routeVersions: ReturnType<typeof dispatchStore.getRouteVersions>;
}

export function useDispatchStore(): DispatchStoreState & {
  triggerTrafficSpike: () => void;
  acceptReassignment: (reassignmentId: string, driverId: string) => void;
  declineReassignment: (reassignmentId: string, driverId: string) => void;
  verifyTrustPass: (reassignmentId: string, isValid?: boolean) => boolean;
  manualOverride: (reassignmentId: string, data: { authorizedBy: string; authorizedRole: string; reason: string; newDriverId: string }) => void;
  updateConfig: (cfg: Partial<OrganizationDispatchConfig>) => void;
  resetToBaseline: () => void;
} {
  const [state, setState] = useState<DispatchStoreState>(() => ({
    config: dispatchStore.getConfig(),
    stops: dispatchStore.getStops(),
    currentReassignment: dispatchStore.getCurrentReassignment(),
    history: dispatchStore.getReassignmentsHistory(),
    kpis: dispatchStore.getKpis(),
    trafficEvents: dispatchStore.getTrafficEvents(),
    notifications: dispatchStore.getNotifications(),
    routeVersions: dispatchStore.getRouteVersions(),
  }));

  useEffect(() => {
    const unsubscribe = dispatchStore.subscribe(() => {
      setState({
        config: dispatchStore.getConfig(),
        stops: dispatchStore.getStops(),
        currentReassignment: dispatchStore.getCurrentReassignment(),
        history: dispatchStore.getReassignmentsHistory(),
        kpis: dispatchStore.getKpis(),
        trafficEvents: dispatchStore.getTrafficEvents(),
        notifications: dispatchStore.getNotifications(),
        routeVersions: dispatchStore.getRouteVersions(),
      });
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    triggerTrafficSpike: () => dispatchStore.triggerTrafficSpikeScenario(),
    acceptReassignment: (rId, dId) => dispatchStore.acceptDriverReassignment(rId, dId),
    declineReassignment: (rId, dId) => dispatchStore.declineDriverReassignment(rId, dId),
    verifyTrustPass: (rId, valid) => dispatchStore.verifyTrustPassBoarding(rId, valid),
    manualOverride: (rId, data) => dispatchStore.executeManualOverride(rId, data),
    updateConfig: cfg => dispatchStore.updateConfig(cfg),
    resetToBaseline: () => dispatchStore.resetToBaseline(),
  };
}
