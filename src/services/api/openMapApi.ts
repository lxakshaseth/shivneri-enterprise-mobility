// ============================================================================
// OPEN-SOURCE MAP & DISPATCH CLIENT API
// Interacts with Backend /api Endpoints (OSM + OSRM + MongoDB)
// ============================================================================

const API_BASE = (typeof window !== 'undefined' && window.location.port === '8443')
  ? '/api' // Proxied by Vite dev server or direct port
  : 'http://localhost:5001/api';

export interface ApiDriver {
  driverId: string;
  name: string;
  phone: string;
  avatar?: string;
  status: 'AVAILABLE' | 'BUSY' | 'ASSIGNED' | 'OFFLINE';
  isOnline: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  accuracy: number;
  lastUpdatedAt: string;
  rating: number;
  vehicle: {
    plate: string;
    model: string;
    type: 'cab' | 'shuttle' | 'suv';
    capacity: number;
  };
}

export interface ApiRide {
  rideId: string;
  passengerName: string;
  passengerPhone: string;
  organizationId: string;
  status: string;
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
    coordinates: [number, number][]; // [lng, lat]
  } | null;
  distanceKm: number;
  etaMinutes: number;
  reassignmentCount: number;
  lastReassignedAt?: string | null;
}

export interface ApiRouteResponse {
  distance: number; // km
  duration: number; // min
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
  steps?: Array<{
    instruction: string;
    distanceKm: number;
    durationMinutes: number;
  }>;
  provider: string;
  isTrafficAware: boolean;
}

export interface ReassignmentEvaluationData {
  canReassign: boolean;
  currentEtaMinutes: number;
  bestAlternativeDriver: ApiDriver | null;
  bestAlternativeEtaMinutes: number | null;
  etaImprovementMinutes: number;
  evaluatedAlternatives: Array<{
    driver: ApiDriver;
    distanceKm: number;
    etaMinutes: number;
    etaImprovementMinutes: number;
    eligible: boolean;
    rejectionReason?: string;
  }>;
  ruleChecks: Array<{
    passed: boolean;
    rule: string;
    reason?: string;
    details?: any;
  }>;
}

export interface ReassignmentHistoryItem {
  id: string;
  rideId: string;
  previousDriverId: string;
  previousDriverName: string;
  newDriverId: string;
  newDriverName: string;
  reason: string;
  previousEta: number;
  newEta: number;
  timestamp: string;
}

export class OpenMapApiClient {
  private static async request<T>(path: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-role': 'dispatcher',
      'x-organization-id': 'ORG-001',
      ...(options?.headers as any),
    };

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errMsg = `Request failed: ${res.statusText}`;
      try {
        const json = await res.json();
        if (json?.error?.message) errMsg = json.error.message;
      } catch {}
      throw new Error(errMsg);
    }

    const data = await res.json();
    return data.data !== undefined ? data.data : data;
  }

  // --- DRIVER ENDPOINTS ---
  static async getDrivers(): Promise<ApiDriver[]> {
    return this.request<ApiDriver[]>('/drivers');
  }

  static async getNearbyDrivers(lat: number, lng: number, radius = 10): Promise<ApiDriver[]> {
    return this.request<ApiDriver[]>(`/drivers/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`);
  }

  static async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
    accuracy = 10
  ): Promise<any> {
    return this.request<any>(`/drivers/${driverId}/location`, {
      method: 'PUT',
      headers: { 'x-driver-id': driverId },
      body: JSON.stringify({ latitude, longitude, accuracy }),
    });
  }

  // --- ROUTING ENDPOINTS ---
  static async getRoute(
    origin: [number, number], // [lat, lng]
    destination: [number, number] // [lat, lng]
  ): Promise<ApiRouteResponse> {
    return this.request<ApiRouteResponse>(
      `/routes?originLat=${origin[0]}&originLng=${origin[1]}&destLat=${destination[0]}&destLng=${destination[1]}`
    );
  }

  // --- RIDE & REASSIGNMENT ENDPOINTS ---
  static async getRide(rideId: string): Promise<ApiRide> {
    return this.request<ApiRide>(`/rides/${rideId}`);
  }

  static async evaluateReassignment(rideId: string): Promise<ReassignmentEvaluationData> {
    return this.request<ReassignmentEvaluationData>(`/rides/${rideId}/reassign/evaluation`);
  }

  static async reassignPickup(
    rideId: string,
    params?: { targetDriverId?: string; reason?: string; force?: boolean }
  ): Promise<{
    ride: ApiRide;
    previousDriver: { driverId: string; name: string };
    newDriver: ApiDriver;
    newRoute: ApiRouteResponse;
    historyRecord: ReassignmentHistoryItem;
    etaImprovementMinutes: number;
  }> {
    return this.request<any>(`/rides/${rideId}/reassign`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  static async getReassignmentHistory(rideId: string): Promise<ReassignmentHistoryItem[]> {
    return this.request<ReassignmentHistoryItem[]>(`/rides/${rideId}/reassignment-history`);
  }
}
