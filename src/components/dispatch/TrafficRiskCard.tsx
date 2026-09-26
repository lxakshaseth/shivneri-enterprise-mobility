// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - TRAFFIC RISK CARD
// Real-time visualization of arterial corridor congestion and route delay impacts
// ============================================================================

import React from 'react';
import { TrafficEvent } from '../../types/dispatch';

interface Props {
  event: TrafficEvent;
  onEvaluate?: () => void;
  onViewImpact?: () => void;
}

export function TrafficRiskCard({ event, onEvaluate, onViewImpact }: Props) {
  const isCritical = event.severity === 'CRITICAL' || event.severity === 'HIGH';

  return (
    <div className={`p-4 rounded-xl border transition-all ${isCritical ? 'bg-amber-50/70 border-amber-300 shadow-xs' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-lg">⚠️</span>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Severe Congestion Corridor</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase">
                {event.severity}
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium">
              {event.segmentFrom} ➔ {event.segmentTo}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-black text-red-600 font-mono">+{event.delayMinutes} min</div>
          <div className="text-[10px] text-slate-500 font-medium">delay added</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 my-2.5 py-2 px-3 bg-white/80 rounded-lg border border-amber-200/60 text-center">
        <div>
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Avg Speed</div>
          <div className="text-xs font-bold text-slate-800 font-mono">{event.avgSpeedKmh} km/h</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Congestion</div>
          <div className="text-xs font-bold text-red-600 font-mono">{(event.congestionIndex * 100).toFixed(0)}%</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400 font-semibold uppercase">Source</div>
          <div className="text-xs font-semibold text-slate-700">GPS Telemetry</div>
        </div>
      </div>

      {/* Progress bar representing congestion index */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-red-600 transition-all duration-500"
          style={{ width: `${Math.min(100, event.congestionIndex * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] text-slate-500 font-mono">Detected: {event.detectedAt}</span>
        <div className="flex gap-2">
          {onViewImpact && (
            <button
              onClick={onViewImpact}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              Route Impact
            </button>
          )}
          {onEvaluate && (
            <button
              onClick={onEvaluate}
              className="text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg shadow-xs transition-colors"
            >
              ⚡ Dynamic Reassign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
