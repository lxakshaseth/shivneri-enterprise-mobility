// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SLA WARNING BANNER
// Operational alert banner when predicted pickup time breaches SLA threshold
// ============================================================================

import React from 'react';
import { DynamicRideStop } from '../../types/dispatch';

interface Props {
  stop: DynamicRideStop;
  onAutoReassign?: () => void;
  onOpenDetails?: () => void;
}

export function SLAWarningBanner({ stop, onAutoReassign, onOpenDetails }: Props) {
  const breachMinutes = Math.max(0, stop.predictedEtaMinutes - stop.slaMinutes);

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between gap-4 flex-wrap animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-lg shrink-0">
          ⏱️
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-100 flex items-center gap-1.5">
            <span>PICKUP SLA BREACH PREDICTED</span>
            <span className="bg-white/20 text-white px-2 py-0.2 rounded text-[10px] font-mono">
              +{breachMinutes}m over SLA
            </span>
          </div>
          <div className="text-sm font-semibold">
            {stop.name} · Passenger: <span className="underline decoration-white/40">{stop.employeeName || 'Assigned Employee'}</span>
          </div>
          <div className="text-[11px] text-white/80">
            Predicted ETA: <span className="font-bold text-white font-mono">{stop.predictedEtaMinutes} min</span> (Configured SLA limit: {stop.slaMinutes} min)
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onOpenDetails && (
          <button
            onClick={onOpenDetails}
            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20 cursor-pointer"
          >
            Inspect Decision
          </button>
        )}
        {onAutoReassign && (
          <button
            onClick={onAutoReassign}
            className="px-3.5 py-1.5 rounded-lg bg-white text-rose-700 hover:bg-rose-50 text-xs font-black shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span>
            <span>Dispatch Backup Driver</span>
          </button>
        )}
      </div>
    </div>
  );
}
