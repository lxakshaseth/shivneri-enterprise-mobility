// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DRIVER SCORING ENGINE
// Weighted Multi-Factor Reassignment Optimization Model
// ============================================================================

import {
  CandidateDriver,
  CandidateScoreBreakdown,
  DispatchScoringWeights,
  DynamicRideStop,
} from '../../types/dispatch';

export const DEFAULT_SCORING_WEIGHTS: DispatchScoringWeights = {
  eta: 0.30,                // 30%
  proximity: 0.20,          // 20%
  routeCompatibility: 0.15, // 15%
  availability: 0.10,       // 10%
  capacity: 0.10,           // 10%
  traffic: 0.05,            // 5%
  compliance: 0.05,         // 5%
  workload: 0.05,           // 5%
  detourPenaltyWeight: 1.5,
  workloadPenaltyWeight: 0.8,
  conflictPenaltyWeight: 25.0,
};

/**
 * Normalizes ETA into a 0-100 score.
 * Lower ETA gives higher score.
 * An ETA <= 3 min gives 100 pts; an ETA >= 30 min gives 0 pts.
 */
function calculateEtaScore(predictedEtaMinutes: number, pickupSlaMinutes: number): number {
  if (predictedEtaMinutes <= 3) return 100;
  if (predictedEtaMinutes > pickupSlaMinutes * 2) return Math.max(0, 20 - (predictedEtaMinutes - pickupSlaMinutes * 2));
  
  // High score when well within SLA
  const ratio = predictedEtaMinutes / pickupSlaMinutes;
  if (ratio <= 0.6) return 95 - (ratio * 15);
  if (ratio <= 1.0) return 80 - ((ratio - 0.6) * 35);
  // Exceeds SLA
  return Math.max(5, 45 - ((ratio - 1.0) * 40));
}

/**
 * Normalizes Distance/Proximity into a 0-100 score.
 * 0-1 km: 100; 10+ km: 10.
 */
function calculateProximityScore(distanceKm: number): number {
  if (distanceKm <= 1.0) return 100;
  if (distanceKm >= 12.0) return 10;
  return Math.max(10, Math.round(100 - (distanceKm - 1.0) * 8.0));
}

/**
 * Evaluates route compatibility (0 - 100).
 * Drivers heading toward the pickup zone get high compatibility.
 */
function calculateRouteCompatibilityScore(candidate: CandidateDriver): number {
  // If driver has low detour and matching direction
  if (candidate.additionalDetourMinutes <= 2) return 95;
  if (candidate.additionalDetourMinutes <= 5) return 80;
  if (candidate.additionalDetourMinutes <= 10) return 60;
  return Math.max(15, 60 - (candidate.additionalDetourMinutes - 10) * 4);
}

/**
 * Scores availability based on driver status and shifts.
 */
function calculateAvailabilityScore(candidate: CandidateDriver): number {
  if (candidate.status === 'Available') return 100;
  if (candidate.status === 'On Duty' && candidate.currentPassengerCount === 0) return 90;
  if (candidate.status === 'On Trip' && candidate.availableSeats > 0) return 65;
  return 10;
}

/**
 * Evaluates vehicle capacity safety margin.
 */
function calculateCapacityScore(candidate: CandidateDriver): number {
  const seats = candidate.availableSeats;
  if (seats >= 3) return 100;
  if (seats === 2) return 85;
  if (seats === 1) return 70;
  return 0; // Full / no capacity
}

/**
 * Evaluates driver compliance (Police verification, POSH, Medical).
 */
function calculateComplianceScore(candidate: CandidateDriver): number {
  let score = 50;
  if (candidate.policeVerificationValid) score += 20;
  if (candidate.poshCertified) score += 20;
  if (candidate.medicalCheckValid) score += 10;
  if (candidate.driverRating >= 4.7) score += 5;
  return Math.min(100, score);
}

/**
 * Evaluates remaining shift workload. Drivers approaching 10h limit get lower score.
 */
function calculateWorkloadScore(candidate: CandidateDriver): number {
  const remainingHours = candidate.maxAllowedDailyHours - candidate.dailyWorkingHours;
  if (remainingHours >= 4) return 100;
  if (remainingHours >= 2) return 75;
  if (remainingHours > 0.5) return 50;
  return 10; // Near limit
}

/**
 * Scores a single candidate driver against an at-risk pickup stop.
 */
export function scoreCandidateDriver(
  candidate: CandidateDriver,
  stop: DynamicRideStop,
  weights: DispatchScoringWeights = DEFAULT_SCORING_WEIGHTS,
  slaMinutes = 10
): CandidateScoreBreakdown {
  const explanation: string[] = [];
  let rejectionReason: string | undefined;

  // Hard eligibility checks
  if (!candidate.isOnline) {
    rejectionReason = 'Driver is offline';
  } else if (candidate.status === 'Suspended') {
    rejectionReason = 'Driver account is suspended';
  } else if (!candidate.isCompliant || !candidate.policeVerificationValid) {
    rejectionReason = 'Driver compliance / police verification failed';
  } else if (candidate.availableSeats <= 0) {
    rejectionReason = 'Vehicle capacity exhausted (0 seats available)';
  } else if (candidate.dailyWorkingHours >= candidate.maxAllowedDailyHours) {
    rejectionReason = 'Exceeded maximum permitted daily driving hours';
  }

  const etaScore = calculateEtaScore(candidate.predictedEtaMinutes, slaMinutes);
  const proximityScore = calculateProximityScore(candidate.distanceKm);
  const routeCompatibilityScore = calculateRouteCompatibilityScore(candidate);
  const availabilityScore = calculateAvailabilityScore(candidate);
  const capacityScore = calculateCapacityScore(candidate);
  const trafficScore = candidate.additionalDetourMinutes > 8 ? 40 : 85;
  const complianceScore = calculateComplianceScore(candidate);
  const workloadScore = calculateWorkloadScore(candidate);

  // Penalties
  const detourPenalty = Math.round(candidate.additionalDetourMinutes * weights.detourPenaltyWeight);
  const workloadPenalty = Math.round(candidate.currentPassengerCount * weights.workloadPenaltyWeight);
  const conflictPenalty = candidate.status === 'On Trip' && candidate.additionalDetourMinutes > 10
    ? weights.conflictPenaltyWeight
    : 0;

  // Weighted base score
  const weightedBase =
    etaScore * weights.eta +
    proximityScore * weights.proximity +
    routeCompatibilityScore * weights.routeCompatibility +
    availabilityScore * weights.availability +
    capacityScore * weights.capacity +
    trafficScore * weights.traffic +
    complianceScore * weights.compliance +
    workloadScore * weights.workload;

  const totalPenalties = detourPenalty + workloadPenalty + conflictPenalty;
  const rawScore = Math.max(0, weightedBase - totalPenalties);
  const totalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  // Generate decision explanation
  if (candidate.predictedEtaMinutes <= slaMinutes) {
    explanation.push(`✓ ETA: ${candidate.predictedEtaMinutes} min (within ${slaMinutes}m SLA)`);
  } else {
    explanation.push(`⚠ ETA: ${candidate.predictedEtaMinutes} min (exceeds ${slaMinutes}m SLA by ${candidate.predictedEtaMinutes - slaMinutes} min)`);
    if (!rejectionReason) {
      rejectionReason = `Predicted pickup SLA breach (+${candidate.predictedEtaMinutes - slaMinutes}m)`;
    }
  }

  explanation.push(`✓ Proximity: ${candidate.distanceKm.toFixed(1)} km away (${proximityScore}/100)`);
  explanation.push(`✓ Capacity: ${candidate.availableSeats} seats open (${candidate.currentPassengerCount}/${candidate.vehicleCapacity} onboard)`);
  explanation.push(`✓ Compliance: Verified & POSH certified (★ ${candidate.driverRating})`);
  explanation.push(`✓ Detour: ${candidate.additionalDetourMinutes} min impact`);
  explanation.push(`✓ Scope: Verified organization/vendor tenant match`);

  return {
    etaScore,
    proximityScore,
    routeCompatibilityScore,
    availabilityScore,
    capacityScore,
    trafficScore,
    complianceScore,
    workloadScore,
    detourPenalty,
    workloadPenalty,
    conflictPenalty,
    rawScore,
    totalScore,
    explanation,
    rejectionReason,
  };
}

/**
 * Evaluates and ranks an array of candidate drivers.
 * Ineligible drivers are pushed to the end.
 */
export function rankCandidateDrivers(
  candidates: CandidateDriver[],
  stop: DynamicRideStop,
  weights: DispatchScoringWeights = DEFAULT_SCORING_WEIGHTS,
  slaMinutes = 10
): CandidateDriver[] {
  const scored = candidates.map(c => {
    const breakdown = scoreCandidateDriver(c, stop, weights, slaMinutes);
    const eligible = !breakdown.rejectionReason && breakdown.totalScore >= 30;
    return {
      ...c,
      eligible,
      scoreBreakdown: breakdown,
    };
  });

  return scored.sort((a, b) => {
    // Eligible first
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    // Then higher score
    const scoreA = a.scoreBreakdown?.totalScore ?? 0;
    const scoreB = b.scoreBreakdown?.totalScore ?? 0;
    return scoreB - scoreA;
  });
}
