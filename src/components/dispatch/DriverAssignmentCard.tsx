// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DRIVER ASSIGNMENT CARD
// Side-by-side comparison of original vs newly reassigned driver and vehicles
// ============================================================================

import React from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  onOpenAudit?: () => void;
  onManualOverride?: () => void;
}

export function DriverAssignmentCard({ reassignment, onOpenAudit, onManualOverride }: Props) {
  const driver = reassignment.selectedDriver;
  const timeSaved = Math.max(0, reassignment.predictedEtaMinutes - (reassignment.newEtaMinutes || 6));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Reassignment Event #{reassignment.id}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          SLA Protected (-{timeSaved} min)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Original Driver */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Original Assigned Driver</span>
            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded font-mono">Delayed</span>
          </div>
          <div className="text-xs font-bold text-slate-900">{reassignment.originalDriverName}</div>
          <div className="text-[11px] text-slate-500">{reassignment.originalVehicleModel} · <span className="font-mono">{reassignment.originalVehiclePlate}</span></div>
          <div className="mt-2 text-xs flex justify-between items-center text-slate-600">
            <span>Predicted Delay:</span>
            <span className="font-black text-rose-600 font-mono">{reassignment.predictedEtaMinutes} min</span>
          </div>
        </div>

        {/* New Reassigned Driver */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5 flex items-center justify-between">
            <span>⚡ Reassigned Driver</span>
            <span className="text-emerald-700 bg-emerald-100 font-mono px-1.5 py-0.2 rounded">Optimal</span>
          </div>
          <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
            <span>{driver?.driverName || reassignment.newDriverName || 'Mohan Singh'}</span>
            <span className="text-[10px] text-amber-600">★ {driver?.driverRating || 4.9}</span>
          </div>
          <div className="text-[11px] text-emerald-800">
            {driver?.vehicleModel || reassignment.newVehicleModel || 'Toyota Etios'} · <span className="font-mono font-semibold">{driver?.vehiclePlate || reassignment.newVehiclePlate || 'MH12EF9012'}</span>
          </div>
          <div className="mt-2 text-xs flex justify-between items-center text-emerald-900">
            <span>Updated Pickup ETA:</span>
            <span className="font-black text-emerald-600 font-mono text-sm">{reassignment.newEtaMinutes || 6} min</span>
          </div>
        </div>
      </div>

      {/* TrustPass Gateway Verification Status */}
      <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between gap-3 text-xs mb-3">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-base">🛡️</span>
          <div>
            <div className="font-bold text-white text-[11px]">TrustPass Multi-Factor Handshake</div>
            <div className="text-[10px] text-slate-400">
              Driver, Vehicle Plate & Geofence Verification Pending at Boarding
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-mono px-2 py-1 rounded font-semibold ${
          reassignment.trustPassStatus === 'VERIFIED'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }`}>
          {reassignment.trustPassStatus === 'VERIFIED' ? 'Verified ✓' : 'Token Active ⏳'}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-500">
          Passenger: <strong className="text-slate-800">{reassignment.employeeName}</strong>
        </span>
        <div className="flex gap-2">
          {onManualOverride && (
            <button
              onClick={onManualOverride}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              Manual Override
            </button>
          )}
          {onOpenAudit && (
            <button
              onClick={onOpenAudit}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              Audit Trail →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
