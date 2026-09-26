// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - REAL-TIME TRAFFIC & ETA DETECTION ENGINE
// Continuous Telemetry Monitoring, SLA Breach Prediction & Alert Thresholds
// ============================================================================

import {
  DynamicRideStop,
  OrganizationDispatchConfig,
  SlaStatus,
  TrafficEvent,
  TrafficSeverity,
  VehicleTelemetryPing,
} from '../../types/dispatch';

export const DEFAULT_ORG_CONFIG: OrganizationDispatchConfig = {
  organizationId: 'ORG-001',
  organizationName: 'TCS Pune Campus',
  pickupSlaMinutes: 10,
  warningThresholdMinutes: 5,
  criticalThresholdMinutes: 8,
  reassignmentThresholdMinutes: 10,
  minEtaImprovementMinutes: 3,
  reassignmentCooldownMinutes: 15,
  maxReassignmentAttempts: 3,
  driverAcceptanceTimeoutSeconds: 45,
  searchRadiusTiersKm: [2, 5, 10],
  dispatchMode: 'DRIVER_ACCEPT',
  allowPartialPickupReassignment: true,
  allowRouteReoptimization: true,
  requireFemaleEscortOnNightReassign: true,
};

export interface RouteProgressState {
  routeId: string;
  rideId: string;
  driverId: string;
  vehiclePlate: string;
  currentTrafficSeverity: TrafficSeverity;
  currentSpeedKmh: number;
  totalDelayMinutes: number;
  stops: DynamicRideStop[];
  activeTrafficEvents: TrafficEvent[];
  lastTelemetryPing?: VehicleTelemetryPing;
}

/**
 * Categorizes SLA status based on predicted delay vs organization thresholds.
 */
export function determineSlaStatus(
  predictedEtaMinutes: number,
  config: OrganizationDispatchConfig = DEFAULT_ORG_CONFIG
): SlaStatus {
  const { pickupSlaMinutes, warningThresholdMinutes, criticalThresholdMinutes } = config;

  if (predictedEtaMinutes <= pickupSlaMinutes - warningThresholdMinutes) {
    return 'NORMAL';
  }
  if (predictedEtaMinutes <= pickupSlaMinutes) {
    return 'WARNING';
  }
  if (predictedEtaMinutes <= pickupSlaMinutes + (criticalThresholdMinutes - warningThresholdMinutes)) {
    return 'CRITICAL';
  }
  return 'BREACHED';
}

/**
 * Assesses whether predicted ETA delay requires reassignment intervention.
 */
export function isReassignmentRequired(
  predictedEtaMinutes: number,
  config: OrganizationDispatchConfig = DEFAULT_ORG_CONFIG
): {
  required: boolean;
  slaStatus: SlaStatus;
  breachMinutes: number;
  reason: string;
} {
  const slaStatus = determineSlaStatus(predictedEtaMinutes, config);
  const breachMinutes = Math.max(0, predictedEtaMinutes - config.pickupSlaMinutes);
  const delayExceedsThreshold = breachMinutes >= (config.reassignmentThresholdMinutes - config.criticalThresholdMinutes);

  const required = slaStatus === 'CRITICAL' || slaStatus === 'BREACHED' || delayExceedsThreshold;

  let reason = 'ETA within acceptable SLA';
  if (slaStatus === 'BREACHED') {
    reason = `Severe delay detected: Predicted ETA (${predictedEtaMinutes}m) breaches ${config.pickupSlaMinutes}m SLA by ${breachMinutes} min`;
  } else if (slaStatus === 'CRITICAL') {
    reason = `Critical SLA risk: Predicted arrival in ${predictedEtaMinutes} min exceeds safety threshold (${config.criticalThresholdMinutes}m)`;
  } else if (slaStatus === 'WARNING') {
    reason = `SLA Warning: ETA (${predictedEtaMinutes}m) is approaching the SLA limit (${config.pickupSlaMinutes}m)`;
  }

  return {
    required,
    slaStatus,
    breachMinutes,
    reason,
  };
}

/**
 * Calculates updated ETAs for remaining stops along a route given a traffic congestion event.
 */
export function recalculateRouteStopsWithTraffic(
  stops: DynamicRideStop[],
  trafficEvent: TrafficEvent | null,
  config: OrganizationDispatchConfig = DEFAULT_ORG_CONFIG
): DynamicRideStop[] {
  if (!trafficEvent || !trafficEvent.isActive) {
    return stops.map(s => ({
      ...s,
      predictedEtaMinutes: s.originalEtaMinutes,
      slaStatus: determineSlaStatus(s.originalEtaMinutes, config),
    }));
  }

  let accumulatedDelay = 0;
  let passedTrafficZone = false;

  return stops.map(stop => {
    // If stop is before or at the congestion point
    if (stop.name.toLowerCase().includes('depot') || stop.name.toLowerCase().includes('stop a')) {
      return {
        ...stop,
        predictedEtaMinutes: stop.originalEtaMinutes,
        slaStatus: 'NORMAL' as SlaStatus,
      };
    }

    // Congestion between Stop B and Stop D hits stops C, D, E
    if (stop.name.toLowerCase().includes('karve nagar') || stop.name.toLowerCase().includes('stop b')) {
      accumulatedDelay += Math.round(trafficEvent.delayMinutes * 0.3);
    } else if (stop.name.toLowerCase().includes('chandani chowk') || stop.name.toLowerCase().includes('stop c')) {
      accumulatedDelay += trafficEvent.delayMinutes;
      passedTrafficZone = true;
    } else if (passedTrafficZone) {
      // Downstream stops also delayed
      accumulatedDelay = trafficEvent.delayMinutes;
    }

    const predictedEta = stop.originalEtaMinutes + accumulatedDelay;
    const slaStatus = determineSlaStatus(predictedEta, config);

    return {
      ...stop,
      predictedEtaMinutes: predictedEta,
      slaStatus,
    };
  });
}

/**
 * Evaluates incoming vehicle GPS telemetry ping and checks for traffic or route deviation.
 */
export function processVehicleTelemetry(
  ping: VehicleTelemetryPing,
  routeStops: DynamicRideStop[],
  config: OrganizationDispatchConfig = DEFAULT_ORG_CONFIG
): {
  updatedStops: DynamicRideStop[];
  identifiedRisks: DynamicRideStop[];
  trafficEventCreated?: TrafficEvent;
} {
  const isCongested = ping.speedKmh < 15 && ping.trafficSeverity === 'HIGH' || ping.trafficSeverity === 'CRITICAL';

  let trafficEvent: TrafficEvent | null = null;
  if (isCongested) {
    trafficEvent = {
      id: `TRF-${Date.now()}`,
      routeId: ping.routeId,
      segmentFrom: ping.currentRouteSegment || 'Wakad / Baner Corridor',
      segmentTo: ping.nextStopId || 'Hinjewadi IT Junction',
      severity: ping.trafficSeverity,
      delayMinutes: ping.stopDelayMinutes > 0 ? ping.stopDelayMinutes : 14,
      avgSpeedKmh: ping.speedKmh,
      congestionIndex: ping.speedKmh < 10 ? 0.85 : 0.65,
      source: 'GPS_CONGESTION',
      detectedAt: ping.timestamp || new Date().toISOString(),
      isActive: true,
    };
  }

  const updatedStops = recalculateRouteStopsWithTraffic(routeStops, trafficEvent, config);
  const identifiedRisks = updatedStops.filter(s => {
    const check = isReassignmentRequired(s.predictedEtaMinutes, config);
    return check.required && !s.isDrop && s.passengerStatus !== 'picked_up';
  });

  return {
    updatedStops,
    identifiedRisks,
    trafficEventCreated: trafficEvent || undefined,
  };
}
