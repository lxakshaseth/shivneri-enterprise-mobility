// ============================================================================
// DATA MODELS & SCHEMAS FOR SHIVNERI ENTERPRISE MOBILITY
// MongoDB 2dsphere GeoJSON Compliant
// ============================================================================

export type DriverStatus = 'AVAILABLE' | 'BUSY' | 'ASSIGNED' | 'OFFLINE';

export type RideStatus =
  | 'REQUESTED'
  | 'ASSIGNING'
  | 'ASSIGNED'
  | 'DRIVER_EN_ROUTE'
  | 'ARRIVED'
  | 'PICKED_UP'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REASSIGNING';

export type ReassignmentReason =
  | 'BETTER_ETA'
  | 'DRIVER_OFFLINE'
  | 'DRIVER_CANCELLED'
  | 'LOCATION_STALE'
  | 'DRIVER_UNAVAILABLE'
  | 'MANUAL_REASSIGNMENT';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude] per GeoJSON spec
}

export interface DriverDocument {
  driverId: string;
  name: string;
  phone: string;
  avatar?: string;
  status: DriverStatus;
  isOnline: boolean;
  location: GeoPoint;
  accuracy: number;
  lastUpdatedAt: Date;
  rating: number;
  isCompliant: boolean;
  policeVerificationValid: boolean;
  poshCertified: boolean;
  vehicle: {
    plate: string;
    model: string;
    type: 'cab' | 'shuttle' | 'suv';
    capacity: number;
  };
  organizationId?: string;
}

export interface RideDocument {
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  organizationId: string;
  status: RideStatus;
  pickupLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  dropLocation: {
    name: string;
    latitude: number;
    longitude: number;
  };
  assignedDriverId: string | null;
  assignedDriverName: string | null;
  assignedDriverPhone?: string | null;
  routeGeometry: {
    type: 'LineString';
    coordinates: [number, number][];
  } | null;
  distanceKm: number;
  etaMinutes: number;
  reassignmentCount: number;
  lastReassignedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReassignmentHistoryDocument {
  id: string;
  rideId: string;
  previousDriverId: string;
  previousDriverName: string;
  newDriverId: string;
  newDriverName: string;
  reason: ReassignmentReason;
  previousEta: number;
  newEta: number;
  timestamp: string; // ISO 8601
}
