// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DYNAMIC DISPATCH & PICKUP REASSIGNMENT
// Data Models, Types, and Interfaces
// ============================================================================

export type TrafficSeverity = 'NORMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type SlaStatus = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'BREACHED';

export type DecisionOutcome =
  | 'KEEP_CURRENT_DRIVER'
  | 'REOPTIMIZE_ROUTE'
  | 'REASSIGN_PICKUP'
  | 'ESCALATE_TO_CONTROL_TOWER';

export type ReassignmentStatus =
  | 'INITIALIZED'
  | 'EVALUATING'
  | 'OFFERED_TO_DRIVER'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'REASSIGNED'
  | 'FAILED'
  | 'CANCELLED'
  | 'ESCALATED';

export type DriverResponse = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TIMEOUT';

export type DispatchMode = 'AUTO_ACCEPT' | 'DRIVER_ACCEPT' | 'CONTROL_TOWER_APPROVAL';

export type ReassignmentTriggerType =
  | 'TRAFFIC_DELAY'
  | 'DRIVER_UNAVAILABLE'
  | 'VEHICLE_BREAKDOWN'
  | 'ROUTE_DEVIATION'
  | 'MANUAL_OVERRIDE'
  | 'SLA_PREDICTIVE_RISK';

export type TrustPassReassignmentStatus =
  | 'NOT_STARTED'
  | 'PENDING'
  | 'INITIATED'
  | 'VERIFIED'
  | 'FAILED'
  | 'BLOCKED';

// ─── Organization Dispatch Configuration ─────────────────────────────────────
export interface OrganizationDispatchConfig {
  organizationId: string;
  organizationName: string;
  pickupSlaMinutes: number;           // Standard pickup SLA (e.g. 10 min)
  warningThresholdMinutes: number;    // Warning trigger (e.g. 5 min remaining or 5 min delay)
  criticalThresholdMinutes: number;   // Critical SLA risk (e.g. 8 min delay)
  reassignmentThresholdMinutes: number;// Trigger reassignment when predicted ETA exceeds SLA by threshold
  minEtaImprovementMinutes: number;   // Anti-flapping: candidate must improve ETA by at least X min (e.g. 3 min)
  reassignmentCooldownMinutes: number;// Anti-flapping: minimum wait before re-triggering reassignment for same ride
  maxReassignmentAttempts: number;    // Maximum attempts before auto-escalating to Control Tower (e.g. 3)
  driverAcceptanceTimeoutSeconds: number; // Driver acceptance window (e.g. 45 sec)
  searchRadiusTiersKm: number[];      // Configurable radius expansion: [2, 5, 10]
  dispatchMode: DispatchMode;         // AUTO_ACCEPT, DRIVER_ACCEPT, CONTROL_TOWER_APPROVAL
  allowPartialPickupReassignment: boolean; // Support stop-level partial transfer
  allowRouteReoptimization: boolean; // Attempt re-sequencing before reassignment
  requireFemaleEscortOnNightReassign: boolean; // Women safety compliance
}

// ─── Scoring Engine Weights ──────────────────────────────────────────────────
export interface DispatchScoringWeights {
  eta: number;                // default 0.30 (30%)
  proximity: number;          // default 0.20 (20%)
  routeCompatibility: number; // default 0.15 (15%)
  availability: number;       // default 0.10 (10%)
  capacity: number;           // default 0.10 (10%)
  traffic: number;            // default 0.05 (5%)
  compliance: number;         // default 0.05 (5%)
  workload: number;           // default 0.05 (5%)
  // Penalties
  detourPenaltyWeight: number;   // default 1.5 pts per minute of detour
  workloadPenaltyWeight: number; // default 0.8 pts per active passenger
  conflictPenaltyWeight: number; // default 20 pts if schedule overlap
}

// ─── Score Breakdown for Candidate ───────────────────────────────────────────
export interface CandidateScoreBreakdown {
  etaScore: number;                 // 0 - 100
  proximityScore: number;           // 0 - 100
  routeCompatibilityScore: number;  // 0 - 100
  availabilityScore: number;        // 0 - 100
  capacityScore: number;            // 0 - 100
  trafficScore: number;             // 0 - 100
  complianceScore: number;          // 0 - 100
  workloadScore: number;            // 0 - 100
  detourPenalty: number;
  workloadPenalty: number;
  conflictPenalty: number;
  rawScore: number;
  totalScore: number;               // Normalized final score (0 - 100)
  explanation: string[];            // Clear decision explanation checklist
  rejectionReason?: string;
}

// ─── Candidate Driver Profile ────────────────────────────────────────────────
export interface CandidateDriver {
  driverId: string;
  driverName: string;
  driverPhone: string;
  driverRating: number;
  driverAvatar?: string;
  organizationId: string;
  vendorId?: string;
  status: 'Available' | 'On Duty' | 'On Trip' | 'Suspended' | 'Offline';
  isOnline: boolean;
  isAvailable: boolean;
  isCompliant: boolean;
  policeVerificationValid: boolean;
  poshCertified: boolean;
  medicalCheckValid: boolean;
  dailyWorkingHours: number;        // in hours
  maxAllowedDailyHours: number;     // e.g. 10 hours
  assignedVehicleId: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleType: 'cab' | 'shuttle' | 'suv';
  vehicleCapacity: number;
  currentPassengerCount: number;
  availableSeats: number;
  location: {
    lat: number;
    lng: number;
    x: number;                      // UI Map X percentage (0-100)
    y: number;                      // UI Map Y percentage (0-100)
    address: string;
  };
  distanceKm: number;
  predictedEtaMinutes: number;
  additionalDetourMinutes: number;
  eligible: boolean;
  scoreBreakdown?: CandidateScoreBreakdown;
}

// ─── Traffic Event ───────────────────────────────────────────────────────────
export interface TrafficEvent {
  id: string;
  routeId: string;
  segmentFrom: string;              // e.g. 'Stop B - Karve Nagar'
  segmentTo: string;                // e.g. 'Stop D - Wakad Bridge'
  severity: TrafficSeverity;
  delayMinutes: number;
  avgSpeedKmh: number;
  congestionIndex: number;          // 0.0 - 1.0 (1.0 = gridlock)
  source: 'GPS_CONGESTION' | 'CITY_TRAFFIC_FEED' | 'DRIVER_REPORT' | 'SIMULATION';
  detectedAt: string;
  coordinates?: { x1: number; y1: number; x2: number; y2: number };
  resolvedAt?: string;
  isActive: boolean;
}

// ─── GPS Telemetry Ping ──────────────────────────────────────────────────────
export interface VehicleTelemetryPing {
  vehicleId: string;
  vehiclePlate: string;
  driverId: string;
  routeId: string;
  rideId: string;
  latitude: number;
  longitude: number;
  mapX: number;
  mapY: number;
  speedKmh: number;
  headingDegrees: number;
  currentRouteSegment: string;
  currentStopId: string;
  nextStopId: string;
  estimatedArrivalCurrentStop: string;
  trafficSeverity: TrafficSeverity;
  routeDeviationDetected: boolean;
  stopDelayMinutes: number;
  timestamp: string;
}

// ─── Stop Model with Stop-Level Reassignment Support ─────────────────────────
export interface DynamicRideStop {
  id: string;
  stopSequence: number;
  name: string;
  landmark: string;
  mapX: number;
  mapY: number;
  scheduledTime: string;
  originalEtaMinutes: number;
  predictedEtaMinutes: number;
  isDrop: boolean;
  employeeId?: string;
  employeeName?: string;
  employeeDept?: string;
  employeePhone?: string;
  passengerStatus: 'scheduled' | 'next' | 'picked_up' | 'dropped_off' | 'reassigned_out' | 'reassigned_in';
  reassignedToDriverId?: string;
  reassignedToRideId?: string;
  reassignmentEventId?: string;
  slaMinutes: number;
  slaStatus: SlaStatus;
}

// ─── Reassignment Event (Full Entity) ────────────────────────────────────────
export interface ReassignmentEvent {
  id: string;
  rideId: string;
  rideStopId: string;
  organizationId: string;

  originalDriverId: string;
  originalDriverName: string;
  originalDriverPhone: string;
  newDriverId?: string;
  newDriverName?: string;
  newDriverPhone?: string;

  originalVehicleId: string;
  originalVehiclePlate: string;
  originalVehicleModel: string;
  newVehicleId?: string;
  newVehiclePlate?: string;
  newVehicleModel?: string;

  employeeId: string;
  employeeName: string;
  employeePhone?: string;
  pickupLocation: string;
  dropLocation: string;

  reason: string;
  triggerType: ReassignmentTriggerType;

  originalEtaMinutes: number;
  predictedEtaMinutes: number;
  newEtaMinutes?: number;

  trafficSeverity: TrafficSeverity;
  delayMinutes: number;
  pickupSlaMinutes: number;
  predictedSlaBreachMinutes: number;

  searchRadiusKm: number;
  candidateDrivers: CandidateDriver[];
  selectedDriver?: CandidateDriver;

  decisionType: DecisionOutcome;
  decisionScore?: number;
  decisionExplanation: string[];

  status: ReassignmentStatus;
  driverResponse: DriverResponse;
  driverResponseTimestamp?: string;
  acceptanceExpiresAt?: string;

  trustPassStatus: TrustPassReassignmentStatus;
  trustPassVerificationId?: string;

  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  attemptCount: number;

  routeSnapshotBefore: {
    driver: string;
    vehicle: string;
    stops: string[];
    eta: string;
  };
  routeSnapshotAfter?: {
    originalDriverStops: string[];
    newDriverStops: string[];
    newDriverEta: string;
  };

  manualOverride?: {
    isManual: boolean;
    authorizedBy: string;
    authorizedRole: string;
    reason: string;
    confirmedAt: string;
    ipAddress?: string;
  };

  auditLog: DispatchAuditEvent[];
}

// ─── Dispatch Decision Result ────────────────────────────────────────────────
export interface DispatchDecision {
  id: string;
  rideId: string;
  timestamp: string;
  outcome: DecisionOutcome;
  reason: string;
  checks: {
    slaAtRisk: boolean;
    routeOptimizable: boolean;
    backupDriverAvailable: boolean;
    sosActive: boolean;
    alreadyBoarded: boolean;
    cooldownActive: boolean;
    etaImprovementMet: boolean;
  };
  reassignmentEventId?: string;
}

// ─── Route Version ───────────────────────────────────────────────────────────
export interface RouteVersion {
  versionId: string;
  routeId: string;
  rideId: string;
  versionNumber: number;
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  stops: DynamicRideStop[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  activeFrom: string;
  triggerReason: string;
}

// ─── Audit Event ─────────────────────────────────────────────────────────────
export interface DispatchAuditEvent {
  id: string;
  reassignmentId: string;
  rideId: string;
  timestamp: string;
  actor: string;
  actorRole: 'system_engine' | 'driver' | 'employee' | 'operations_manager' | 'super_admin';
  eventType:
    | 'TRAFFIC_DETECTED'
    | 'ETA_RECALCULATED'
    | 'SLA_AT_RISK'
    | 'REASSIGNMENT_TRIGGERED'
    | 'DRIVER_SEARCH_STARTED'
    | 'CANDIDATES_SCORED'
    | 'DRIVER_SELECTED'
    | 'DISPATCH_OFFER_SENT'
    | 'DRIVER_ACCEPTED'
    | 'DRIVER_DECLINED'
    | 'DRIVER_TIMEOUT'
    | 'EMPLOYEE_NOTIFIED'
    | 'ORIGINAL_DRIVER_NOTIFIED'
    | 'ROUTE_REOPTIMIZED'
    | 'TRUSTPASS_INITIATED'
    | 'TRUSTPASS_VERIFIED'
    | 'TRUSTPASS_FAILED'
    | 'MANUAL_OVERRIDE_EXECUTED'
    | 'REASSIGNMENT_COMPLETED'
    | 'REASSIGNMENT_FAILED'
    | 'ESCALATED_TO_CONTROL_TOWER';
  description: string;
  details: Record<string, unknown>;
}

// ─── Notification Event ──────────────────────────────────────────────────────
export interface DispatchNotificationEvent {
  id: string;
  recipientType: 'employee' | 'original_driver' | 'new_driver' | 'admin' | 'control_tower';
  recipientId: string;
  recipientName: string;
  channels: ('in_app' | 'push' | 'sms' | 'whatsapp' | 'email')[];
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  payload: Record<string, unknown>;
}

// ─── Dispatch Analytics & KPIs ───────────────────────────────────────────────
export interface DispatchAnalyticsKPIs {
  totalReassignmentsToday: number;
  pickupsSavedFromSlaBreach: number;     // e.g. 127 pickups protected
  trafficTriggeredReassignments: number;
  driverUnavailableReassignments: number;
  averageReassignmentTimeSeconds: number; // e.g. 24 sec
  averageEtaImprovementMinutes: number;   // e.g. 8.4 min
  driverAcceptanceRatePct: number;        // e.g. 94.2%
  failedReassignmentRatePct: number;      // e.g. 1.8%
  manualOverrideRatePct: number;          // e.g. 3.2%
  trustPassSuccessRatePct: number;        // e.g. 99.4%
  averageSearchRadiusKm: number;          // e.g. 4.2 km
  averageCandidateCount: number;          // e.g. 5.1 drivers
  activeTrafficRisksCount: number;
  slaAtRiskCount: number;
  pendingAcceptancesCount: number;
  controlTowerEscalationsCount: number;
}
