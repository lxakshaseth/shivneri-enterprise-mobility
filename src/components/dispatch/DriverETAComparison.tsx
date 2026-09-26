// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DRIVER ETA COMPARISON
// Visual benchmarking of candidate ETAs vs pickup SLA threshold
// ============================================================================

import React from 'react';
import { CandidateDriver } from '../../types/dispatch';

interface Props {
  originalDriverEta: number; // e.g. 24 min
  slaThresholdMinutes: number; // e.g. 10 min
  candidates: CandidateDriver[];
  selectedDriverId?: string;
}

export function DriverETAComparison({
  originalDriverEta,
  slaThresholdMinutes,
  candidates,
  selectedDriverId,
}: Props) {
  const maxEta = Math.max(originalDriverEta, 30);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Candidate ETA vs Pickup SLA ({slaThresholdMinutes} min)
          </h4>
          <p className="text-[11px] text-slate-500">
            Evaluating arrival times against corporate pickup SLA threshold
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
          SLA Limit: {slaThresholdMinutes}m
        </span>
      </div>

      <div className="space-y-3">
        {/* Original Driver Bar (Trapped in traffic) */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-semibold text-rose-700 flex items-center gap-1.5">
              <span>🚗</span>
              <span>Original: Raj Kumar (#DRV-001)</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-mono">
                TRAFFIC DELAY
              </span>
            </span>
            <span className="font-black text-rose-600 font-mono">
              {originalDriverEta} min (+{originalDriverEta - slaThresholdMinutes}m breach)
            </span>
          </div>
          <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            {/* SLA line indicator at slaThresholdMinutes */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
              style={{ left: `${(slaThresholdMinutes / maxEta) * 100}%` }}
            />
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(100, (originalDriverEta / maxEta) * 100)}%` }}
            />
          </div>
        </div>

        {/* Candidate Drivers */}
        {candidates.slice(0, 3).map(cand => {
          const isSelected = cand.driverId === selectedDriverId;
          const breaches = cand.predictedEtaMinutes > slaThresholdMinutes;

          return (
            <div key={cand.driverId}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>{isSelected ? '⚡' : '🚙'}</span>
                  <span>{cand.driverName} (#{cand.driverId})</span>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                      SELECTED
                    </span>
                  )}
                  {breaches && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded">
                      Rejected: SLA breach
                    </span>
                  )}
                </span>
                <span
                  className={`font-black font-mono ${
                    isSelected ? 'text-emerald-600' : breaches ? 'text-slate-400' : 'text-blue-600'
                  }`}
                >
                  {cand.predictedEtaMinutes} min
                </span>
              </div>
              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
                  style={{ left: `${(slaThresholdMinutes / maxEta) * 100}%` }}
                />
                <div
                  className={`h-full rounded-full ${
                    isSelected
                      ? 'bg-emerald-500'
                      : breaches
                      ? 'bg-slate-300'
                      : 'bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(100, (cand.predictedEtaMinutes / maxEta) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
