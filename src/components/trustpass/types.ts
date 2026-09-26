export type VerificationMethod =
  | 'dynamic-qr'
  | 'ride-otp'
  | 'whatsapp-otp'
  | 'email-otp'
  | 'vehicle-qr'
  | 'nfc-tap'
  | 'nearby-device';

export type QRState =
  | 'WAITING'
  | 'SCANNING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'EXPIRED'
  | 'INVALID';

export type SecurityErrorType =
  | 'DRIVER_MISMATCH'
  | 'VEHICLE_MISMATCH'
  | 'RIDE_MISMATCH'
  | 'QR_EXPIRED'
  | 'INVALID_SIGNATURE';

export type TrustPassDecision =
  | 'ALLOW'
  | 'FALLBACK_REQUIRED'
  | 'MANUAL_APPROVAL'
  | 'DENY';

export type DriverMismatchType =
  | 'WRONG_PASSENGER'
  | 'WRONG_VEHICLE'
  | 'WRONG_DRIVER'
  | 'QR_EXPIRED'
  | 'BLOCKED';

export type ManualVerificationReason =
  | 'Network unavailable'
  | 'Phone unavailable'
  | 'QR unavailable'
  | 'OTP unavailable'
  | 'Emergency'
  | 'Other';

export interface TrustPassRideData {
  rideId: string;
  driverName: string;
  driverRating: number;
  driverVerified: boolean;
  driverPhone: string;
  driverPhoto?: string;
  vehiclePlate: string;
  vehicleModel: string;
  vehicleAssigned: boolean;
  pickupLocation: string;
  pickupTime: string;
  dropLocation: string;
  eta: string;
  employeeName: string;
  employeeId: string;
  employeeOrg: string;
  verificationStatus: 'pending' | 'in-progress' | 'verified' | 'failed';
  verificationMethod: VerificationMethod;
  verificationId: string;
  timestamp: string;
  tokenExpiresIn: number;
}

export interface VerificationCheckItem {
  id: string;
  title: string;
  subtitle?: string;
  status: 'verified' | 'pending' | 'failed';
  timestamp?: string;
}

export interface MethodConfig {
  id: VerificationMethod;
  name: string;
  subtitle: string;
  icon: string;
  isRecommended?: boolean;
  securityTier: 'Cryptographic Tier-1' | 'Encrypted 2FA' | 'Hardware Security' | 'Proximity Sensor';
  description: string;
}

export interface MutualHandshakeData {
  employeeVerified: boolean;
  driverVerified: boolean;
  vehicleVerified: boolean;
  rideVerified: boolean;
  locationVerified: boolean;
  timeVerified: boolean;
  decision: TrustPassDecision;
}

export interface SafeDropRecord {
  employeeName: string;
  employeeId: string;
  rideId: string;
  dropLocation: string;
  dropTime: string;
  deboardingOtp: string;
  confirmed: boolean;
  logId: string;
}

export interface ContextMatrix {
  employeeIdentity: boolean;
  driverIdentity: boolean;
  vehicleMatch: boolean;
  rideMatch: boolean;
  location: boolean;
  timeWindow: boolean;
  deviceContext: boolean;
  policy: boolean;
}

export interface TrustedContactConfig {
  name: string;
  phone: string;
  relationship?: string;
  notifyBoarding: boolean;
  notifyRideStarted: boolean;
  notifySos: boolean;
  notifySafeDrop: boolean;
  notifyRideCompleted: boolean;
}

// ─── PART 4 CONTROL TOWER & AUDIT TYPES ──────────────────────────────────────────

export type TrustPassEventType =
  | 'VERIFICATION_STARTED'
  | 'QR_GENERATED'
  | 'QR_SCANNED'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'OTP_FAILED'
  | 'DRIVER_VERIFIED'
  | 'EMPLOYEE_VERIFIED'
  | 'VEHICLE_VERIFIED'
  | 'GEOFENCE_PASSED'
  | 'GEOFENCE_FAILED'
  | 'VERIFICATION_ALLOWED'
  | 'VERIFICATION_DENIED'
  | 'MANUAL_OVERRIDE_REQUESTED'
  | 'MANUAL_OVERRIDE_APPROVED'
  | 'BOARDING_CONFIRMED'
  | 'SAFE_DROP_CONFIRMED';

export interface TrustPassAuditEvent {
  id: string;
  eventType: TrustPassEventType;
  actor: string;
  actorRole: 'employee' | 'driver' | 'admin' | 'system';
  rideId: string;
  employeeName: string;
  driverName: string;
  vehiclePlate: string;
  organization: string;
  method: string;
  timestamp: string;
  decision: 'ALLOW' | 'DENY' | 'REQUIRES_FALLBACK' | 'PENDING' | 'MANUAL_APPROVAL';
  reason?: string;
  verificationId: string;
  correlationId: string;
  location?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface VerificationFeedItem {
  id: string;
  time: string;
  rideId: string;
  employeeName: string;
  employeeOrg: string;
  driverName: string;
  vehiclePlate: string;
  location: string;
  method: string;
  status: 'VERIFIED' | 'BLOCKED' | 'PENDING' | 'FAILED' | 'OVERRIDDEN';
  failureReason?: string;
  fallbackUsed?: string;
  verificationId: string;
  auditChecks: {
    employeeIdentity: boolean;
    driverIdentity: boolean;
    vehicle: boolean;
    ride: boolean;
    geofence: boolean;
    time: boolean;
    device: boolean;
    policy: boolean;
  };
  decision: TrustPassDecision;
  timestamp: string;
}

export interface SecurityAlert {
  id: string;
  alertType:
    | 'REPEATED_FAILED_VERIFICATION'
    | 'MULTIPLE_WRONG_PASSENGER'
    | 'VEHICLE_MISMATCH'
    | 'DRIVER_MISMATCH'
    | 'REPEATED_OTP_FAILURES'
    | 'SUSPICIOUS_PATTERN'
    | 'MANUAL_OVERRIDE_SPIKE'
    | 'UNUSUAL_LOCATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rideId: string;
  employeeName: string;
  driverName: string;
  vehiclePlate: string;
  location: string;
  attemptsCount: number;
  reason: string;
  timestamp: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  assignedTo?: string;
}

export interface ManualOverrideRequestItem {
  id: string;
  rideId: string;
  employeeName: string;
  employeeId: string;
  employeeOrg: string;
  driverName: string;
  driverId: string;
  vehiclePlate: string;
  location: string;
  reason: ManualVerificationReason;
  customNotes?: string;
  requestedBy: 'Driver' | 'Employee' | 'Dispatcher';
  requestedAt: string;
  expiresAt: string;
  secondsRemaining: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface VerificationPolicyRule {
  id: string;
  name: string;
  category: 'Standard Ride' | 'Night Ride' | 'High Security Ride' | 'Emergency';
  requirements: string[];
  organization: string;
  shift: 'All Shifts' | 'Day Shift' | 'Evening' | 'Night Shift (Graveyard)';
  locationScope: string;
  employeeGroup: 'All Employees' | 'VIP / Leadership' | 'Female Workforce' | 'Contractors';
  rideType: 'Point-to-Point' | 'Shared Shuttle' | 'Airport Express' | 'Ad-hoc';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  enforcementMode: 'STRICT_BLOCK' | 'FALLBACK_ALLOWED' | 'MANUAL_ESCALATION';
  active: boolean;
}

export interface VerificationReceiptData {
  receiptId: string;
  verificationId: string;
  rideId: string;
  employeeName: string;
  employeeId: string;
  employeeOrg: string;
  driverName: string;
  driverRating: number;
  vehiclePlate: string;
  vehicleModel: string;
  methodsUsed: string[];
  locationStatus: 'VERIFIED_WITHIN_GEOFENCE' | 'MANUAL_CONFIRMATION';
  timeStatus: 'ON_SCHEDULE' | 'OVERRIDE_WINDOW';
  assignmentStatus: 'MATCHED';
  boardingTime: string;
  pickupAddress: string;
  dropAddress: string;
  digitalSignature: string;
  status: 'VERIFIED';
}
