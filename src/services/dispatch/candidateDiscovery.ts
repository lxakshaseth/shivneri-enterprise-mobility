// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - CANDIDATE DRIVER DISCOVERY ENGINE
// Multi-Tier Radius Search with Tenant Isolation and ABAC/RBAC Filtering
// ============================================================================

import { CandidateDriver, DynamicRideStop } from '../../types/dispatch';
import { rankCandidateDrivers } from './scoringEngine';

export interface DiscoveryOptions {
  organizationId: string;
  vendorId?: string;
  pickupLocation: { x: number; y: number; lat?: number; lng?: number };
  pickupSlaMinutes: number;
  radiusTiersKm?: number[]; // [2, 5, 10]
  userRole?: string;
  userOrgId?: string;
}

// ─── POOL OF REGISTERED FLEET DRIVERS (Realistic Pune Mobility Network) ──────
export const SEED_FLEET_CANDIDATES: CandidateDriver[] = [
  {
    driverId: 'DRV-208',
    driverName: 'Mohan Singh',
    driverPhone: '+91 98234 56781',
    driverRating: 4.9,
    driverAvatar: 'MS',
    organizationId: 'ORG-001', // TCS Pune Campus
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'Available',
    isOnline: true,
    isAvailable: true,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 4.2,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-208',
    vehiclePlate: 'MH12EF9012',
    vehicleModel: 'Toyota Etios (White)',
    vehicleType: 'cab',
    vehicleCapacity: 4,
    currentPassengerCount: 0,
    availableSeats: 4,
    location: {
      lat: 18.558,
      lng: 73.789,
      x: 35, // Nearby Baner / Aundh
      y: 40,
      address: 'Bremen Chowk, Aundh',
    },
    distanceKm: 2.1,
    predictedEtaMinutes: 6,
    additionalDetourMinutes: 1,
    eligible: true,
  },
  {
    driverId: 'DRV-301',
    driverName: 'Suresh Yadav',
    driverPhone: '+91 98220 54321',
    driverRating: 4.6,
    driverAvatar: 'SY',
    organizationId: 'ORG-001', // TCS Pune Campus
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'On Duty',
    isOnline: true,
    isAvailable: true,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 5.5,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-301',
    vehiclePlate: 'MH12CD5678',
    vehicleModel: 'Maruti Suzuki Ertiga (Silver)',
    vehicleType: 'cab',
    vehicleCapacity: 6,
    currentPassengerCount: 2,
    availableSeats: 4,
    location: {
      lat: 18.591,
      lng: 73.765,
      x: 46,
      y: 34,
      address: 'Wakad Bridge Overpass',
    },
    distanceKm: 4.8,
    predictedEtaMinutes: 11,
    additionalDetourMinutes: 3,
    eligible: true,
  },
  {
    driverId: 'DRV-114',
    driverName: 'Deepak Patel',
    driverPhone: '+91 98456 78901',
    driverRating: 4.7,
    driverAvatar: 'DP',
    organizationId: 'ORG-001',
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'Available',
    isOnline: true,
    isAvailable: true,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 3.1,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-114',
    vehiclePlate: 'MH12IJ7890',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    vehicleType: 'cab',
    vehicleCapacity: 4,
    currentPassengerCount: 1,
    availableSeats: 3,
    location: {
      lat: 18.572,
      lng: 73.782,
      x: 32,
      y: 44,
      address: 'Pimple Saudagar Garden',
    },
    distanceKm: 3.4,
    predictedEtaMinutes: 7,
    additionalDetourMinutes: 2,
    eligible: true,
  },
  {
    driverId: 'DRV-405',
    driverName: 'Santosh Rao',
    driverPhone: '+91 98789 01234',
    driverRating: 4.5,
    driverAvatar: 'SR',
    organizationId: 'ORG-001',
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'On Trip',
    isOnline: true,
    isAvailable: true,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 6.8,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-405',
    vehiclePlate: 'MH12KL2345',
    vehicleModel: 'Force Traveller Shuttle',
    vehicleType: 'shuttle',
    vehicleCapacity: 12,
    currentPassengerCount: 9,
    availableSeats: 3,
    location: {
      lat: 18.535,
      lng: 73.834,
      x: 58,
      y: 52,
      address: 'Shivajinagar Station',
    },
    distanceKm: 7.2,
    predictedEtaMinutes: 16,
    additionalDetourMinutes: 6,
    eligible: false, // > SLA
  },
  {
    // Cross-tenant driver (belongs to Infosys ORG-002) - MUST BE FILTERED OUT for TCS!
    driverId: 'DRV-999',
    driverName: 'Vikram Joshi (Cross-Tenant)',
    driverPhone: '+91 98888 12345',
    driverRating: 4.9,
    driverAvatar: 'VJ',
    organizationId: 'ORG-002', // Infosys BPM - Different Tenant
    vendorId: 'VND-INFOSYS-HINJ',
    status: 'Available',
    isOnline: true,
    isAvailable: true,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 2.0,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-999',
    vehiclePlate: 'MH12XX9999',
    vehicleModel: 'Hyundai Aura',
    vehicleType: 'cab',
    vehicleCapacity: 4,
    currentPassengerCount: 0,
    availableSeats: 4,
    location: {
      lat: 18.558,
      lng: 73.790,
      x: 35,
      y: 38,
      address: 'Baner High Street',
    },
    distanceKm: 1.5,
    predictedEtaMinutes: 4,
    additionalDetourMinutes: 1,
    eligible: false, // Tenant mismatch
  },
  {
    // Non-compliant driver (expired police verification)
    driverId: 'DRV-550',
    driverName: 'Nitin Kadam (Non-Compliant)',
    driverPhone: '+91 98333 44556',
    driverRating: 4.2,
    driverAvatar: 'NK',
    organizationId: 'ORG-001',
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'On Duty',
    isOnline: true,
    isAvailable: true,
    isCompliant: false, // Inactive compliance
    policeVerificationValid: false,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 4.0,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-550',
    vehiclePlate: 'MH12ZZ1122',
    vehicleModel: 'Tata Tigor EV',
    vehicleType: 'cab',
    vehicleCapacity: 4,
    currentPassengerCount: 0,
    availableSeats: 4,
    location: {
      lat: 18.560,
      lng: 73.780,
      x: 33,
      y: 40,
      address: 'Pashan Sus Road',
    },
    distanceKm: 2.8,
    predictedEtaMinutes: 8,
    additionalDetourMinutes: 2,
    eligible: false,
  },
  {
    // Overloaded driver (Capacity full)
    driverId: 'DRV-660',
    driverName: 'Ganesh More (Capacity Full)',
    driverPhone: '+91 98111 99887',
    driverRating: 4.8,
    driverAvatar: 'GM',
    organizationId: 'ORG-001',
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'On Trip',
    isOnline: true,
    isAvailable: false,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 5.0,
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-660',
    vehiclePlate: 'MH12YY3344',
    vehicleModel: 'Maruti Dzire',
    vehicleType: 'cab',
    vehicleCapacity: 4,
    currentPassengerCount: 4,
    availableSeats: 0, // FULL
    location: {
      lat: 18.570,
      lng: 73.775,
      x: 36,
      y: 38,
      address: 'Balewadi Phata',
    },
    distanceKm: 1.8,
    predictedEtaMinutes: 5,
    additionalDetourMinutes: 2,
    eligible: false,
  },
  {
    // Driver with hours exceeded
    driverId: 'DRV-770',
    driverName: 'Sunil Shinde (Hours Exceeded)',
    driverPhone: '+91 98444 77665',
    driverRating: 4.6,
    driverAvatar: 'SS',
    organizationId: 'ORG-001',
    vendorId: 'VND-PUNE-CENTRAL',
    status: 'Available',
    isOnline: true,
    isAvailable: false,
    isCompliant: true,
    policeVerificationValid: true,
    poshCertified: true,
    medicalCheckValid: true,
    dailyWorkingHours: 10.5, // > 10 hours limit!
    maxAllowedDailyHours: 10.0,
    assignedVehicleId: 'VEH-770',
    vehiclePlate: 'MH12WW5566',
    vehicleModel: 'Toyota Innova',
    vehicleType: 'suv',
    vehicleCapacity: 6,
    currentPassengerCount: 0,
    availableSeats: 6,
    location: {
      lat: 18.565,
      lng: 73.785,
      x: 34,
      y: 42,
      address: 'Baner Orchid Junction',
    },
    distanceKm: 2.0,
    predictedEtaMinutes: 5,
    additionalDetourMinutes: 1,
    eligible: false,
  },
];

/**
 * Discovers nearby eligible candidate drivers with progressive search radius expansion.
 * Enforces Tenant Isolation and ABAC/RBAC.
 */
export function discoverCandidateDrivers(
  stop: DynamicRideStop,
  options: DiscoveryOptions,
  fleetPool: CandidateDriver[] = SEED_FLEET_CANDIDATES
): {
  candidates: CandidateDriver[];
  activeRadiusKm: number;
  totalPoolChecked: number;
  tenantFilteredOut: number;
  complianceFilteredOut: number;
  capacityFilteredOut: number;
} {
  const tiers = options.radiusTiersKm || [2, 5, 10];
  let tenantFilteredOut = 0;
  let complianceFilteredOut = 0;
  let capacityFilteredOut = 0;

  // 1. Enforce strict Tenant Isolation & RBAC
  const tenantScopedDrivers = fleetPool.filter(driver => {
    // If user has platform super-admin role, check if driver belongs to the ride's organization
    if (driver.organizationId !== options.organizationId) {
      tenantFilteredOut++;
      return false;
    }
    return true;
  });

  // 2. Progressive radius expansion
  let matchingDrivers: CandidateDriver[] = [];
  let chosenRadius = tiers[0];

  for (const radius of tiers) {
    chosenRadius = radius;
    const inRadius = tenantScopedDrivers.filter(d => d.distanceKm <= radius);
    
    // Check if we have at least one compliant, available driver with capacity
    const eligibleInRadius = inRadius.filter(d => {
      if (!d.isOnline || d.status === 'Suspended') {
        return false;
      }
      if (!d.isCompliant || !d.policeVerificationValid || !d.poshCertified) {
        complianceFilteredOut++;
        return false;
      }
      if (d.availableSeats <= 0) {
        capacityFilteredOut++;
        return false;
      }
      if (d.dailyWorkingHours >= d.maxAllowedDailyHours) {
        return false;
      }
      return true;
    });

    if (eligibleInRadius.length > 0) {
      matchingDrivers = inRadius;
      break;
    }
    // If not found in current tier, loop expands to next tier
    matchingDrivers = inRadius;
  }

  // 3. Rank and score all discovered drivers in the selected radius
  const ranked = rankCandidateDrivers(matchingDrivers, stop, undefined, options.pickupSlaMinutes);

  return {
    candidates: ranked,
    activeRadiusKm: chosenRadius,
    totalPoolChecked: fleetPool.length,
    tenantFilteredOut,
    complianceFilteredOut,
    capacityFilteredOut,
  };
}
