// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DISPATCH STATE & EVENT BUS STORE
// Reactive In-Memory State Manager, Telemetry Loop, Audit Log & Real-Time Sync
// ============================================================================

import {
  CandidateDriver,
  DispatchAnalyticsKPIs,
  DispatchAuditEvent,
  DispatchDecision,
  DispatchNotificationEvent,
  DynamicRideStop,
  OrganizationDispatchConfig,
  ReassignmentEvent,
  RouteVersion,
  TrafficEvent,
} from '../../types/dispatch';
import { SEED_FLEET_CANDIDATES } from './candidateDiscovery';
import { evaluateReassignmentDecision } from './decisionEngine';
import { DEFAULT_ORG_CONFIG, recalculateRouteStopsWithTraffic } from './etaTrafficEngine';
import { executePartialStopReassignment } from './routeReoptimization';

// ─── CANONICAL SEED ROUTE (Route A -> B -> C -> D -> E) ──────────────────────
export const CANONICAL_ORIGINAL_STOPS: DynamicRideStop[] = [
  {
    id: 'stop-a',
    stopSequence: 1,
    name: 'Kothrud Depot (Stop A)',
    landmark: 'Depot Gate 3',
    mapX: 20,
    mapY: 78,
    scheduledTime: '08:10 AM',
    originalEtaMinutes: 0,
    predictedEtaMinutes: 0,
    isDrop: false,
    employeeId: 'EMP-10421',
    employeeName: 'Priya Desai',
    employeeDept: 'BFSI Technology',
    employeePhone: '+91 98221 44321',
    passengerStatus: 'picked_up',
    slaMinutes: 10,
    slaStatus: 'NORMAL',
  },
  {
    id: 'stop-b',
    stopSequence: 2,
    name: 'Karve Nagar (Stop B)',
    landmark: 'Vitthal Mandir Corner',
    mapX: 34,
    mapY: 64,
    scheduledTime: '08:18 AM',
    originalEtaMinutes: 0,
    predictedEtaMinutes: 0,
    isDrop: false,
    employeeId: 'EMP-10482',
    employeeName: 'Akshat Sharma',
    employeeDept: 'Transport & Ops',
    employeePhone: '+91 98765 10482',
    passengerStatus: 'picked_up',
    slaMinutes: 10,
    slaStatus: 'NORMAL',
  },
  {
    id: 'stop-c',
    stopSequence: 3,
    name: 'Chandani Chowk (Stop C)',
    landmark: 'NDA Road Overpass',
    mapX: 48,
    mapY: 50,
    scheduledTime: '08:30 AM',
    originalEtaMinutes: 10,
    predictedEtaMinutes: 24, // Delay brings this to 24 min!
    isDrop: false,
    employeeId: 'EMP-10495',
    employeeName: 'Rohan Joshi',
    employeeDept: 'Cloud Infrastructure',
    employeePhone: '+91 97654 32109',
    passengerStatus: 'scheduled',
    slaMinutes: 10,
    slaStatus: 'BREACHED',
  },
  {
    id: 'stop-d',
    stopSequence: 4,
    name: 'Wakad Bridge (Stop D)',
    landmark: 'NH 48 Bypass Interchange',
    mapX: 62,
    mapY: 36,
    scheduledTime: '08:42 AM',
    originalEtaMinutes: 20,
    predictedEtaMinutes: 34,
    isDrop: false,
    passengerStatus: 'scheduled',
    slaMinutes: 10,
    slaStatus: 'CRITICAL',
  },
  {
    id: 'stop-e',
    stopSequence: 5,
    name: 'TCS Hinjewadi Ph1 (Stop E)',
    landmark: 'Sahyadri Park Main Gate',
    mapX: 82,
    mapY: 22,
    scheduledTime: '08:52 AM',
    originalEtaMinutes: 30,
    predictedEtaMinutes: 44,
    isDrop: true,
    passengerStatus: 'scheduled',
    slaMinutes: 10,
    slaStatus: 'CRITICAL',
  },
];

// Initial Audit History
const INITIAL_AUDIT_LOG: DispatchAuditEvent[] = [
  {
    id: 'AUD-001',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:10 AM',
    actor: 'GPS Congestion Engine',
    actorRole: 'system_engine',
    eventType: 'TRAFFIC_DETECTED',
    description: 'Traffic severity changed → HIGH between Stop B (Karve Nagar) & Stop D (Wakad Bridge)',
    details: { segment: 'B -> D Corridor', avgSpeedKmh: 8, delayMinutes: 14 },
  },
  {
    id: 'AUD-002',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:13 AM',
    actor: 'ETA Telemetry Engine',
    actorRole: 'system_engine',
    eventType: 'ETA_RECALCULATED',
    description: 'Predicted ETA to Stop C (Chandani Chowk) increased from 10 min → 24 min',
    details: { originalEta: 10, predictedEta: 24, delayAdded: 14 },
  },
  {
    id: 'AUD-003',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:13 AM',
    actor: 'SLA Policy Monitor',
    actorRole: 'system_engine',
    eventType: 'SLA_AT_RISK',
    description: 'Pickup SLA (10 min) breached by +14 minutes. Reassignment threshold reached.',
    details: { pickupSlaMinutes: 10, breachMinutes: 14 },
  },
  {
    id: 'AUD-004',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:14 AM',
    actor: 'Smart Dynamic Dispatch',
    actorRole: 'system_engine',
    eventType: 'REASSIGNMENT_TRIGGERED',
    description: 'Automated Stop-Level Reassignment triggered for Stop C (Rohan Joshi)',
    details: { trigger: 'TRAFFIC_DELAY', allowPartial: true },
  },
  {
    id: 'AUD-005',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:15 AM',
    actor: 'Candidate Discovery Engine',
    actorRole: 'system_engine',
    eventType: 'DRIVER_SEARCH_STARTED',
    description: 'Driver search initiated across radius tiers (2km → 5km) in TCS Pune Campus scope',
    details: { poolChecked: 8, tenantScope: 'ORG-001', radius: '2.1 km' },
  },
  {
    id: 'AUD-006',
    reassignmentId: 'RA-10245',
    rideId: 'RIDE-10421',
    timestamp: '09:32:16 AM',
    actor: 'Multi-Factor Scoring Engine',
    actorRole: 'system_engine',
    eventType: 'DRIVER_SELECTED',
    description: 'Candidate Driver #DRV-208 (Mohan Singh) ranked #1 with composite score 92/100 (ETA 6m)',
    details: { driverId: 'DRV-208', score: 92, eta: 6, vehicle: 'MH12EF9012' },
  },
];

// Initial Canonical Reassignment Record
const INITIAL_REASSIGNMENT: ReassignmentEvent = {
  id: 'RA-10245',
  rideId: 'RIDE-10421',
  rideStopId: 'stop-c',
  organizationId: 'ORG-001',

  originalDriverId: 'DRV-001',
  originalDriverName: 'Raj Kumar',
  originalDriverPhone: '+91 98765 43210',
  newDriverId: 'DRV-208',
  newDriverName: 'Mohan Singh',
  newDriverPhone: '+91 98234 56781',

  originalVehicleId: 'VEH-001',
  originalVehiclePlate: 'MH12AB1234',
  originalVehicleModel: 'Maruti Suzuki Dzire (White)',
  newVehicleId: 'VEH-208',
  newVehiclePlate: 'MH12EF9012',
  newVehicleModel: 'Toyota Etios (White)',

  employeeId: 'EMP-10495',
  employeeName: 'Rohan Joshi',
  employeePhone: '+91 97654 32109',
  pickupLocation: 'Chandani Chowk (Stop C), NDA Road Overpass',
  dropLocation: 'TCS Hinjewadi Ph1, Sahyadri Park Gate',

  reason: 'Severe traffic bottleneck detected between Karve Nagar & Wakad Bridge (+14 min delay)',
  triggerType: 'TRAFFIC_DELAY',

  originalEtaMinutes: 10,
  predictedEtaMinutes: 24,
  newEtaMinutes: 6,

  trafficSeverity: 'HIGH',
  delayMinutes: 14,
  pickupSlaMinutes: 10,
  predictedSlaBreachMinutes: 14,

  searchRadiusKm: 2.1,
  candidateDrivers: SEED_FLEET_CANDIDATES,
  selectedDriver: SEED_FLEET_CANDIDATES[0], // Mohan Singh

  decisionType: 'REASSIGN_PICKUP',
  decisionScore: 92,
  decisionExplanation: [
    '✓ ETA: 6 min (satisfies 10m pickup SLA)',
    '✓ Proximity: 2.1 km away in Aundh node',
    '✓ Vehicle capacity: 4 seats open (0 onboard)',
    '✓ Driver: Available & compliant (★ 4.9)',
    '✓ Vehicle: Verified & AIS-140 active',
    '✓ Route compatibility: High (direct corridor)',
    '✓ Detour: 1 min additional transit',
    '✓ Tenant: Matched TCS Pune Campus scope',
  ],

  status: 'OFFERED_TO_DRIVER',
  driverResponse: 'PENDING',
  acceptanceExpiresAt: new Date(Date.now() + 45000).toISOString(),

  trustPassStatus: 'PENDING',
  trustPassVerificationId: 'TP-VRF-98214',

  createdAt: '09:32:16 AM',
  updatedAt: '09:32:16 AM',
  attemptCount: 1,

  routeSnapshotBefore: {
    driver: 'Raj Kumar (MH12AB1234)',
    vehicle: 'Maruti Suzuki Dzire',
    stops: ['Kothrud Depot (A)', 'Karve Nagar (B)', 'Chandani Chowk (C)', 'Wakad Bridge (D)', 'TCS Ph1 (E)'],
    eta: '24 min (SLA BREACH)',
  },
  routeSnapshotAfter: {
    originalDriverStops: ['Kothrud Depot (A)', 'Karve Nagar (B)', 'Wakad Bridge (D)', 'TCS Ph1 (E)'],
    newDriverStops: ['Chandani Chowk (C)', 'TCS Ph1 (E)'],
    newDriverEta: '6 min (ON TIME)',
  },

  auditLog: INITIAL_AUDIT_LOG,
};

// Initial KPIs
const INITIAL_KPIS: DispatchAnalyticsKPIs = {
  totalReassignmentsToday: 14,
  pickupsSavedFromSlaBreach: 127,
  trafficTriggeredReassignments: 11,
  driverUnavailableReassignments: 3,
  averageReassignmentTimeSeconds: 24,
  averageEtaImprovementMinutes: 8.4,
  driverAcceptanceRatePct: 94.2,
  failedReassignmentRatePct: 1.8,
  manualOverrideRatePct: 3.2,
  trustPassSuccessRatePct: 99.4,
  averageSearchRadiusKm: 4.2,
  averageCandidateCount: 5.1,
  activeTrafficRisksCount: 1,
  slaAtRiskCount: 1,
  pendingAcceptancesCount: 1,
  controlTowerEscalationsCount: 0,
};

// Initial Traffic Event
const INITIAL_TRAFFIC_EVENT: TrafficEvent = {
  id: 'TRF-WAKAD-901',
  routeId: 'RT-001',
  segmentFrom: 'Stop B - Karve Nagar',
  segmentTo: 'Stop D - Wakad Bridge',
  severity: 'HIGH',
  delayMinutes: 14,
  avgSpeedKmh: 9,
  congestionIndex: 0.88,
  source: 'GPS_CONGESTION',
  detectedAt: '09:32:10 AM',
  coordinates: { x1: 34, y1: 64, x2: 62, y2: 36 },
  isActive: true,
};

// Initial Notifications
const INITIAL_NOTIFICATIONS: DispatchNotificationEvent[] = [
  {
    id: 'NOTIF-001',
    recipientType: 'new_driver',
    recipientId: 'DRV-208',
    recipientName: 'Mohan Singh',
    channels: ['in_app', 'push'],
    title: '🚨 NEW PRIORITY PICKUP OFFER',
    message: 'Stop C (Chandani Chowk) reassigned due to traffic. ETA: 6 min. +₹140 surge premium.',
    timestamp: '09:32:16 AM',
    read: false,
    payload: { reassignmentId: 'RA-10245', rideId: 'RIDE-10421' },
  },
  {
    id: 'NOTIF-002',
    recipientType: 'employee',
    recipientId: 'EMP-10495',
    recipientName: 'Rohan Joshi',
    channels: ['in_app', 'push', 'whatsapp'],
    title: 'Pickup Update',
    message: 'Due to heavy traffic on your current route, your pickup has been reassigned to Mohan Singh (Toyota Etios MH12EF9012). New ETA: 6 min.',
    timestamp: '09:32:21 AM',
    read: false,
    payload: { newDriver: 'Mohan Singh', vehicle: 'MH12EF9012', newEta: '6 min' },
  },
];

type Listener = () => void;

class DispatchStore {
  private config: OrganizationDispatchConfig = DEFAULT_ORG_CONFIG;
  private activeStops: DynamicRideStop[] = CANONICAL_ORIGINAL_STOPS;
  private currentReassignment: ReassignmentEvent | null = INITIAL_REASSIGNMENT;
  private reassignmentsHistory: ReassignmentEvent[] = [INITIAL_REASSIGNMENT];
  private kpis: DispatchAnalyticsKPIs = INITIAL_KPIS;
  private trafficEvents: TrafficEvent[] = [INITIAL_TRAFFIC_EVENT];
  private notifications: DispatchNotificationEvent[] = INITIAL_NOTIFICATIONS;
  private originalDriverRouteVersion: RouteVersion | null = null;
  private newDriverRouteVersion: RouteVersion | null = null;
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // ─── Getters ───────────────────────────────────────────────────────────────
  public getConfig(): OrganizationDispatchConfig {
    return this.config;
  }

  public getStops(): DynamicRideStop[] {
    return this.activeStops;
  }

  public getCurrentReassignment(): ReassignmentEvent | null {
    return this.currentReassignment;
  }

  public getReassignmentsHistory(): ReassignmentEvent[] {
    return this.reassignmentsHistory;
  }

  public getKpis(): DispatchAnalyticsKPIs {
    return this.kpis;
  }

  public getTrafficEvents(): TrafficEvent[] {
    return this.trafficEvents;
  }

  public getNotifications(): DispatchNotificationEvent[] {
    return this.notifications;
  }

  public getRouteVersions() {
    return {
      original: this.originalDriverRouteVersion,
      reassigned: this.newDriverRouteVersion,
    };
  }

  // ─── Setters & Actions ─────────────────────────────────────────────────────
  public updateConfig(newConfig: Partial<OrganizationDispatchConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.notify();
  }

  /**
   * Triggers the canonical traffic congestion scenario (Route A -> B -> C -> D -> E, traffic B -> D).
   */
  public triggerTrafficSpikeScenario() {
    const trafficEvent: TrafficEvent = {
      id: `TRF-${Date.now()}`,
      routeId: 'RT-001',
      segmentFrom: 'Stop B - Karve Nagar',
      segmentTo: 'Stop D - Wakad Bridge',
      severity: 'HIGH',
      delayMinutes: 14,
      avgSpeedKmh: 8,
      congestionIndex: 0.92,
      source: 'GPS_CONGESTION',
      detectedAt: new Date().toLocaleTimeString(),
      coordinates: { x1: 34, y1: 64, x2: 62, y2: 36 },
      isActive: true,
    };

    this.trafficEvents = [trafficEvent, ...this.trafficEvents];

    // Recalculate stops with traffic delay
    this.activeStops = recalculateRouteStopsWithTraffic(CANONICAL_ORIGINAL_STOPS, trafficEvent, this.config);

    const affectedStop = this.activeStops.find(s => s.id === 'stop-c') || this.activeStops[2];

    // Run decision engine
    const decisionResult = evaluateReassignmentDecision({
      rideId: 'RIDE-10421',
      routeId: 'RT-001',
      stop: affectedStop,
      config: this.config,
      activeSos: false,
      alreadyBoarded: false,
      reassignmentAttemptsCount: 0,
      remainingStops: this.activeStops.slice(2),
      fleetPool: SEED_FLEET_CANDIDATES,
    });

    const bestDriver = decisionResult.bestCandidate || SEED_FLEET_CANDIDATES[0];

    // Create Reassignment Event
    const reassignment: ReassignmentEvent = {
      id: `RA-${Math.floor(10000 + Math.random() * 90000)}`,
      rideId: 'RIDE-10421',
      rideStopId: 'stop-c',
      organizationId: this.config.organizationId,

      originalDriverId: 'DRV-001',
      originalDriverName: 'Raj Kumar',
      originalDriverPhone: '+91 98765 43210',
      newDriverId: bestDriver.driverId,
      newDriverName: bestDriver.driverName,
      newDriverPhone: bestDriver.driverPhone,

      originalVehicleId: 'VEH-001',
      originalVehiclePlate: 'MH12AB1234',
      originalVehicleModel: 'Maruti Suzuki Dzire',
      newVehicleId: bestDriver.assignedVehicleId,
      newVehiclePlate: bestDriver.vehiclePlate,
      newVehicleModel: bestDriver.vehicleModel,

      employeeId: 'EMP-10495',
      employeeName: 'Rohan Joshi',
      employeePhone: '+91 97654 32109',
      pickupLocation: 'Chandani Chowk (Stop C), NDA Road Overpass',
      dropLocation: 'TCS Hinjewadi Ph1, Gate 3',

      reason: 'Heavy traffic between Karve Nagar & Wakad Bridge caused predicted +14 min SLA breach',
      triggerType: 'TRAFFIC_DELAY',

      originalEtaMinutes: 10,
      predictedEtaMinutes: 24,
      newEtaMinutes: bestDriver.predictedEtaMinutes,

      trafficSeverity: 'HIGH',
      delayMinutes: 14,
      pickupSlaMinutes: this.config.pickupSlaMinutes,
      predictedSlaBreachMinutes: 14,

      searchRadiusKm: decisionResult.searchRadiusKm,
      candidateDrivers: decisionResult.candidateList,
      selectedDriver: bestDriver,

      decisionType: decisionResult.decision.outcome,
      decisionScore: bestDriver.scoreBreakdown?.totalScore || 92,
      decisionExplanation: decisionResult.explanation,

      status: this.config.dispatchMode === 'AUTO_ACCEPT' ? 'ACCEPTED' : 'OFFERED_TO_DRIVER',
      driverResponse: this.config.dispatchMode === 'AUTO_ACCEPT' ? 'ACCEPTED' : 'PENDING',
      acceptanceExpiresAt: new Date(Date.now() + this.config.driverAcceptanceTimeoutSeconds * 1000).toISOString(),

      trustPassStatus: 'PENDING',
      trustPassVerificationId: `TP-VRF-${Date.now()}`,

      createdAt: new Date().toLocaleTimeString(),
      updatedAt: new Date().toLocaleTimeString(),
      attemptCount: 1,

      routeSnapshotBefore: {
        driver: 'Raj Kumar (MH12AB1234)',
        vehicle: 'Maruti Suzuki Dzire',
        stops: ['Kothrud Depot (A)', 'Karve Nagar (B)', 'Chandani Chowk (C)', 'Wakad Bridge (D)', 'TCS Ph1 (E)'],
        eta: '24 min (SLA BREACH)',
      },

      auditLog: [
        {
          id: `AUD-${Date.now()}-1`,
          reassignmentId: `RA-NEW`,
          rideId: 'RIDE-10421',
          timestamp: new Date().toLocaleTimeString(),
          actor: 'GPS Telemetry Engine',
          actorRole: 'system_engine',
          eventType: 'TRAFFIC_DETECTED',
          description: 'Traffic severity changed → HIGH between Stop B & Stop D',
          details: { segment: 'B -> D Corridor', avgSpeedKmh: 8, delayMinutes: 14 },
        },
        {
          id: `AUD-${Date.now()}-2`,
          reassignmentId: `RA-NEW`,
          rideId: 'RIDE-10421',
          timestamp: new Date().toLocaleTimeString(),
          actor: 'ETA Telemetry Engine',
          actorRole: 'system_engine',
          eventType: 'ETA_RECALCULATED',
          description: 'Predicted ETA to Stop C increased from 10m → 24m (+14m breach)',
          details: { originalEta: 10, predictedEta: 24 },
        },
        {
          id: `AUD-${Date.now()}-3`,
          reassignmentId: `RA-NEW`,
          rideId: 'RIDE-10421',
          timestamp: new Date().toLocaleTimeString(),
          actor: 'Smart Dynamic Dispatch Engine',
          actorRole: 'system_engine',
          eventType: 'DRIVER_SELECTED',
          description: `Discovered and selected ${bestDriver.driverName} (#${bestDriver.driverId}) with score ${bestDriver.scoreBreakdown?.totalScore || 92}/100`,
          details: { bestDriver: bestDriver.driverName, eta: bestDriver.predictedEtaMinutes },
        },
      ],
    };

    this.currentReassignment = reassignment;
    this.reassignmentsHistory = [reassignment, ...this.reassignmentsHistory];

    this.kpis = {
      ...this.kpis,
      activeTrafficRisksCount: this.kpis.activeTrafficRisksCount + 1,
      slaAtRiskCount: this.kpis.slaAtRiskCount + 1,
      pendingAcceptancesCount: this.kpis.pendingAcceptancesCount + 1,
    };

    // If auto-accept mode, complete assignment immediately
    if (this.config.dispatchMode === 'AUTO_ACCEPT') {
      this.acceptDriverReassignment(reassignment.id, bestDriver.driverId);
    } else {
      // Add notification for driver
      this.notifications = [
        {
          id: `NOTIF-${Date.now()}`,
          recipientType: 'new_driver',
          recipientId: bestDriver.driverId,
          recipientName: bestDriver.driverName,
          channels: ['in_app', 'push'],
          title: '🚨 NEW PRIORITY PICKUP OFFER',
          message: `Chandani Chowk pickup reassigned. ETA: ${bestDriver.predictedEtaMinutes} min. Tap to accept.`,
          timestamp: new Date().toLocaleTimeString(),
          read: false,
          payload: { reassignmentId: reassignment.id },
        },
        ...this.notifications,
      ];
    }

    this.notify();
  }

  /**
   * Driver accepts the reassignment offer.
   */
  public acceptDriverReassignment(reassignmentId: string, driverId: string) {
    if (!this.currentReassignment || this.currentReassignment.id !== reassignmentId) return;

    const r = this.currentReassignment;
    const driver = r.selectedDriver || SEED_FLEET_CANDIDATES[0];

    // 1. Partial Route Split & Reoptimization
    const splitResult = executePartialStopReassignment(
      'RT-001',
      r.rideId,
      { id: r.originalDriverId, name: r.originalDriverName, vehiclePlate: r.originalVehiclePlate },
      driver,
      'stop-c',
      this.activeStops,
      this.activeStops[4] // Destination drop stop
    );

    this.originalDriverRouteVersion = splitResult.originalDriverRouteVersion;
    this.newDriverRouteVersion = splitResult.newDriverRouteVersion;

    // Mutate local stops: Stop C marked as reassigned to Mohan Singh
    this.activeStops = this.activeStops.map(s => {
      if (s.id === 'stop-c') {
        return {
          ...s,
          passengerStatus: 'reassigned_out',
          reassignedToDriverId: driver.driverId,
          predictedEtaMinutes: driver.predictedEtaMinutes,
          slaStatus: 'NORMAL',
        };
      }
      return s;
    });

    const auditAccept: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-ACC`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: driver.driverName,
      actorRole: 'driver',
      eventType: 'DRIVER_ACCEPTED',
      description: `Driver ${driver.driverName} accepted reassignment offer`,
      details: { driverId, eta: driver.predictedEtaMinutes },
    };

    const auditRoute: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-ROU`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Route Optimization Engine',
      actorRole: 'system_engine',
      eventType: 'ROUTE_REOPTIMIZED',
      description: 'Route split executed: Original Driver retains A->B->D->E; Mohan Singh assigned C->E',
      details: { timeSavedMinutes: splitResult.originalDriverTimeSavedMinutes },
    };

    const auditTP: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-TP`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'TrustPass Security Gateway',
      actorRole: 'system_engine',
      eventType: 'TRUSTPASS_INITIATED',
      description: 'TrustPass initiated for new driver: Dynamic OTP / QR generated for Rohan Joshi',
      details: { verificationId: r.trustPassVerificationId },
    };

    const updated: ReassignmentEvent = {
      ...r,
      status: 'REASSIGNED',
      driverResponse: 'ACCEPTED',
      driverResponseTimestamp: new Date().toLocaleTimeString(),
      completedAt: new Date().toLocaleTimeString(),
      trustPassStatus: 'INITIATED',
      routeSnapshotAfter: {
        originalDriverStops: ['Kothrud Depot (A)', 'Karve Nagar (B)', 'Wakad Bridge (D)', 'TCS Ph1 (E)'],
        newDriverStops: ['Chandani Chowk (C)', 'TCS Ph1 (E)'],
        newDriverEta: `${driver.predictedEtaMinutes} min (ON TIME)`,
      },
      auditLog: [...r.auditLog, auditAccept, auditRoute, auditTP],
    };

    this.currentReassignment = updated;
    this.reassignmentsHistory = this.reassignmentsHistory.map(item => item.id === reassignmentId ? updated : item);

    // Update KPI: Pickups saved
    this.kpis = {
      ...this.kpis,
      pickupsSavedFromSlaBreach: this.kpis.pickupsSavedFromSlaBreach + 1,
      totalReassignmentsToday: this.kpis.totalReassignmentsToday + 1,
      pendingAcceptancesCount: Math.max(0, this.kpis.pendingAcceptancesCount - 1),
      slaAtRiskCount: Math.max(0, this.kpis.slaAtRiskCount - 1),
    };

    // Employee Notification
    this.notifications = [
      {
        id: `NOTIF-${Date.now()}-EMP`,
        recipientType: 'employee',
        recipientId: r.employeeId,
        recipientName: r.employeeName,
        channels: ['in_app', 'push', 'whatsapp'],
        title: 'Pickup Update',
        message: `Due to heavy traffic on your current route, your pickup has been reassigned to ${driver.driverName} (${driver.vehicleModel}, ${driver.vehiclePlate}). Updated pickup ETA: ${driver.predictedEtaMinutes} min.`,
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        payload: {
          driverName: driver.driverName,
          vehiclePlate: driver.vehiclePlate,
          vehicleModel: driver.vehicleModel,
          newEta: `${driver.predictedEtaMinutes} min`,
          trustPassRequired: true,
        },
      },
      {
        id: `NOTIF-${Date.now()}-ORIG`,
        recipientType: 'original_driver',
        recipientId: r.originalDriverId,
        recipientName: r.originalDriverName,
        channels: ['in_app', 'push'],
        title: 'Route Updated',
        message: `Stop C (Chandani Chowk) reassigned to Driver ${driver.driverName} due to traffic. Proceed directly to Stop D.`,
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        payload: { bypassedStop: 'Chandani Chowk', nextStop: 'Wakad Bridge' },
      },
      ...this.notifications,
    ];

    this.notify();
  }

  /**
   * Driver declines reassignment offer. System immediately searches next eligible candidate.
   */
  public declineDriverReassignment(reassignmentId: string, driverId: string) {
    if (!this.currentReassignment || this.currentReassignment.id !== reassignmentId) return;

    const r = this.currentReassignment;
    const remainingCandidates = r.candidateDrivers.filter(c => c.driverId !== driverId && c.eligible);

    const auditDecline: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-DEC`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: `Driver #${driverId}`,
      actorRole: 'driver',
      eventType: 'DRIVER_DECLINED',
      description: `Driver #${driverId} declined reassignment offer. Fallback discovery engaged.`,
      details: { declinedDriverId: driverId },
    };

    if (remainingCandidates.length > 0) {
      const nextDriver = remainingCandidates[0];
      const auditNext: DispatchAuditEvent = {
        id: `AUD-${Date.now()}-NEXT`,
        reassignmentId,
        rideId: r.rideId,
        timestamp: new Date().toLocaleTimeString(),
        actor: 'Smart Dynamic Dispatch',
        actorRole: 'system_engine',
        eventType: 'DISPATCH_OFFER_SENT',
        description: `Offering reassignment to next eligible backup driver: ${nextDriver.driverName} (#${nextDriver.driverId})`,
        details: { nextDriverId: nextDriver.driverId, eta: nextDriver.predictedEtaMinutes },
      };

      const updated: ReassignmentEvent = {
        ...r,
        selectedDriver: nextDriver,
        newDriverId: nextDriver.driverId,
        newDriverName: nextDriver.driverName,
        newDriverPhone: nextDriver.driverPhone,
        newVehicleId: nextDriver.assignedVehicleId,
        newVehiclePlate: nextDriver.vehiclePlate,
        newVehicleModel: nextDriver.vehicleModel,
        newEtaMinutes: nextDriver.predictedEtaMinutes,
        status: 'OFFERED_TO_DRIVER',
        driverResponse: 'PENDING',
        attemptCount: r.attemptCount + 1,
        auditLog: [...r.auditLog, auditDecline, auditNext],
      };

      this.currentReassignment = updated;
    } else {
      // No more drivers -> Escalate to Control Tower
      const auditEscalate: DispatchAuditEvent = {
        id: `AUD-${Date.now()}-ESC`,
        reassignmentId,
        rideId: r.rideId,
        timestamp: new Date().toLocaleTimeString(),
        actor: 'Smart Dynamic Dispatch',
        actorRole: 'system_engine',
        eventType: 'ESCALATED_TO_CONTROL_TOWER',
        description: 'All backup candidates declined. Escalating to Control Tower for dispatcher intervention.',
        details: { attempts: r.attemptCount + 1 },
      };

      const updated: ReassignmentEvent = {
        ...r,
        status: 'ESCALATED',
        driverResponse: 'DECLINED',
        auditLog: [...r.auditLog, auditDecline, auditEscalate],
      };

      this.currentReassignment = updated;
      this.kpis = {
        ...this.kpis,
        controlTowerEscalationsCount: this.kpis.controlTowerEscalationsCount + 1,
        pendingAcceptancesCount: Math.max(0, this.kpis.pendingAcceptancesCount - 1),
      };
    }

    this.notify();
  }

  /**
   * TrustPass Verification for Reassigned Driver & Employee.
   * If TrustPass succeeds -> marks boarding authorized.
   * If fails -> blocks boarding.
   */
  public verifyTrustPassBoarding(reassignmentId: string, isValid = true): boolean {
    if (!this.currentReassignment || this.currentReassignment.id !== reassignmentId) return false;

    const r = this.currentReassignment;

    if (!isValid) {
      const auditFail: DispatchAuditEvent = {
        id: `AUD-${Date.now()}-TP-FAIL`,
        reassignmentId,
        rideId: r.rideId,
        timestamp: new Date().toLocaleTimeString(),
        actor: 'TrustPass Security Gateway',
        actorRole: 'system_engine',
        eventType: 'TRUSTPASS_FAILED',
        description: 'CRITICAL: TrustPass boarding check failed (OTP/QR or Geofence mismatch). BOARDING BLOCKED.',
        details: { status: 'BOARDING_BLOCKED', verificationId: r.trustPassVerificationId },
      };

      this.currentReassignment = {
        ...r,
        trustPassStatus: 'BLOCKED',
        auditLog: [...r.auditLog, auditFail],
      };
      this.notify();
      return false;
    }

    const auditPass: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-TP-PASS`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'TrustPass Security Gateway',
      actorRole: 'system_engine',
      eventType: 'TRUSTPASS_VERIFIED',
      description: '✓ TrustPass Mutual Handshake verified: Driver, Vehicle, Employee, Geofence, Time Window MATCHED. Boarding Authorized.',
      details: { status: 'VERIFIED', verificationId: r.trustPassVerificationId },
    };

    const auditComp: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-COMP`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: 'Smart Dynamic Dispatch',
      actorRole: 'system_engine',
      eventType: 'REASSIGNMENT_COMPLETED',
      description: 'Pickup successfully executed and passenger boarded with verified backup driver.',
      details: { completedAt: new Date().toLocaleTimeString() },
    };

    // Update stop status to picked_up
    this.activeStops = this.activeStops.map(s => {
      if (s.id === 'stop-c') {
        return {
          ...s,
          passengerStatus: 'picked_up',
        };
      }
      return s;
    });

    this.currentReassignment = {
      ...r,
      trustPassStatus: 'VERIFIED',
      status: 'REASSIGNED',
      auditLog: [...r.auditLog, auditPass, auditComp],
    };

    this.notify();
    return true;
  }

  /**
   * Manual Control Tower Override (Protected by RBAC & ABAC).
   */
  public executeManualOverride(
    reassignmentId: string,
    overrideData: {
      authorizedBy: string;
      authorizedRole: string;
      reason: string;
      newDriverId: string;
    }
  ) {
    if (!this.currentReassignment || this.currentReassignment.id !== reassignmentId) return;

    const r = this.currentReassignment;
    const targetDriver = SEED_FLEET_CANDIDATES.find(c => c.driverId === overrideData.newDriverId) || SEED_FLEET_CANDIDATES[0];

    const auditOverride: DispatchAuditEvent = {
      id: `AUD-${Date.now()}-OVR`,
      reassignmentId,
      rideId: r.rideId,
      timestamp: new Date().toLocaleTimeString(),
      actor: `${overrideData.authorizedBy} (${overrideData.authorizedRole})`,
      actorRole: overrideData.authorizedRole.includes('admin') ? 'super_admin' : 'operations_manager',
      eventType: 'MANUAL_OVERRIDE_EXECUTED',
      description: `Manual Control Tower Override executed: Reassigned to ${targetDriver.driverName} (${targetDriver.vehiclePlate}). Reason: ${overrideData.reason}`,
      details: overrideData,
    };

    const updated: ReassignmentEvent = {
      ...r,
      newDriverId: targetDriver.driverId,
      newDriverName: targetDriver.driverName,
      newDriverPhone: targetDriver.driverPhone,
      newVehicleId: targetDriver.assignedVehicleId,
      newVehiclePlate: targetDriver.vehiclePlate,
      newVehicleModel: targetDriver.vehicleModel,
      newEtaMinutes: targetDriver.predictedEtaMinutes,
      status: 'REASSIGNED',
      driverResponse: 'ACCEPTED',
      manualOverride: {
        isManual: true,
        authorizedBy: overrideData.authorizedBy,
        authorizedRole: overrideData.authorizedRole,
        reason: overrideData.reason,
        confirmedAt: new Date().toLocaleTimeString(),
      },
      auditLog: [...r.auditLog, auditOverride],
    };

    this.currentReassignment = updated;
    this.kpis = {
      ...this.kpis,
      manualOverrideRatePct: Number((this.kpis.manualOverrideRatePct + 0.1).toFixed(1)),
      controlTowerEscalationsCount: Math.max(0, this.kpis.controlTowerEscalationsCount - 1),
    };

    this.notify();
  }

  /**
   * Resets demo to clean baseline.
   */
  public resetToBaseline() {
    this.activeStops = CANONICAL_ORIGINAL_STOPS;
    this.trafficEvents = [INITIAL_TRAFFIC_EVENT];
    this.currentReassignment = INITIAL_REASSIGNMENT;
    this.reassignmentsHistory = [INITIAL_REASSIGNMENT];
    this.kpis = INITIAL_KPIS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.originalDriverRouteVersion = null;
    this.newDriverRouteVersion = null;
    this.notify();
  }
}

// Export singleton instance
export const dispatchStore = new DispatchStore();
