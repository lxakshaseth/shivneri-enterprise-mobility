// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - CONTROL TOWER ESCALATION DIALOG
// Critical Operations Alert Modal for SLA-critical trips requiring dispatcher intervention
// ============================================================================

import React from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  onClose: () => void;
  onResolve: () => void;
}

export function ControlTowerEscalationDialog({ reassignment, onClose, onResolve }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-rose-600/80 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-bounce">🚨</span>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Control Tower Escalation
              </h3>
              <p className="text-[10px] text-rose-200">Autonomous Reassignment Requires Human Dispatcher</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-rose-200">
            <strong>Escalation Reason:</strong> {reassignment.reason}
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800 p-3 rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">Trip ID</span>
              <span className="font-bold text-white font-mono">{reassignment.rideId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Pickup SLA</span>
              <span className="font-bold text-rose-400 font-mono">Breached (+{reassignment.predictedSlaBreachMinutes}m)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Passenger</span>
              <span className="font-medium text-slate-200">{reassignment.employeeName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Search Radius</span>
              <span className="font-mono text-slate-300">{reassignment.searchRadiusKm} km exhausted</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-bold text-slate-300">Recommended Dispatcher Actions:</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-400 text-[11px]">
              <li>Contact adjacent vendor dispatch hubs (Hinjewadi / Baner node)</li>
              <li>Deploy designated corporate shuttle backup van</li>
              <li>Re-route passenger via rapid on-demand priority voucher</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onClose}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
            >
              Acknowledge & Monitor
            </button>
            <button
              onClick={onResolve}
              className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg transition-colors cursor-pointer"
            >
              Manual Override Dispatch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
