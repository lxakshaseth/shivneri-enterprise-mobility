// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DRIVER CANDIDATE CARD
// Multi-factor scored driver candidate card with transparent decision breakdown
// ============================================================================

import React from 'react';
import { CandidateDriver } from '../../types/dispatch';

interface Props {
  candidate: CandidateDriver;
  isSelected?: boolean;
  onSelect?: () => void;
  showExplanation?: boolean;
}

export function DriverCandidateCard({
  candidate,
  isSelected = false,
  onSelect,
  showExplanation = false,
}: Props) {
  const score = candidate.scoreBreakdown?.totalScore ?? 0;
  const isTopMatch = score >= 85 && candidate.eligible;

  return (
    <div
      className={`p-3.5 rounded-xl border transition-all ${
        isSelected
          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30 shadow-xs'
          : candidate.eligible
          ? 'bg-white border-slate-200 hover:border-slate-300'
          : 'bg-slate-50 border-slate-200 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
            {candidate.driverAvatar || candidate.driverName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>{candidate.driverName}</span>
              <span className="text-[10px] text-slate-400 font-mono">#{candidate.driverId}</span>
              {isTopMatch && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  TOP MATCH
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              {candidate.vehicleModel} · <span className="font-mono text-slate-700">{candidate.vehiclePlate}</span>
            </div>
          </div>
        </div>

        {/* Score & ETA pill */}
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-[10px] text-slate-400 font-semibold">SCORE</span>
            <span
              className={`text-sm font-black font-mono px-2 py-0.5 rounded-lg ${
                score >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : score >= 50
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {score}/100
            </span>
          </div>
          <div className="text-[11px] font-bold text-blue-700 font-mono mt-0.5">
            ETA: {candidate.predictedEtaMinutes} min
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-1.5 py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-100 text-center text-[10px] mb-2">
        <div>
          <span className="text-slate-400 block text-[9px]">Distance</span>
          <span className="font-semibold text-slate-800">{candidate.distanceKm.toFixed(1)} km</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px]">Seats</span>
          <span className="font-semibold text-slate-800">{candidate.availableSeats} open</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px]">Detour</span>
          <span className="font-semibold text-slate-800">+{candidate.additionalDetourMinutes}m</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[9px]">Rating</span>
          <span className="font-semibold text-amber-600">★ {candidate.driverRating}</span>
        </div>
      </div>

      {/* Status or Rejection note */}
      {!candidate.eligible && candidate.scoreBreakdown?.rejectionReason && (
        <div className="text-[10px] text-rose-600 bg-rose-50 border border-rose-200 rounded px-2 py-1 mb-2 font-medium">
          ✗ {candidate.scoreBreakdown.rejectionReason}
        </div>
      )}

      {/* Transparent Explanation Checklist */}
      {showExplanation && candidate.scoreBreakdown && (
        <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
          {candidate.scoreBreakdown.explanation.map((item, idx) => (
            <div key={idx} className="text-[10px] text-slate-600 flex items-center gap-1.5">
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {onSelect && candidate.eligible && (
        <button
          onClick={onSelect}
          className={`w-full mt-2 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isSelected
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {isSelected ? '✓ Selected Backup Driver' : 'Assign This Driver'}
        </button>
      )}
    </div>
  );
}
