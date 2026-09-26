// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - REASSIGNMENT BANNER (EMPLOYEE & DRIVER)
// Employee-facing non-technical pickup update & Driver dispatch alert
// ============================================================================

import React from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  onTrackNewDriver?: () => void;
  onVerifyTrustPass?: () => void;
  onDismiss?: () => void;
  userType?: 'employee' | 'driver' | 'admin';
}

export function ReassignmentBanner({
  reassignment,
  onTrackNewDriver,
  onVerifyTrustPass,
  onDismiss,
  userType = 'employee',
}: Props) {
  const driver = reassignment.selectedDriver;
  const isAccepted = reassignment.status === 'REASSIGNED' || reassignment.status === 'ACCEPTED';

  if (userType === 'employee') {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-4 rounded-2xl shadow-xl border border-blue-800/40 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm border border-blue-500/30">
              🔄
            </div>
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wide">Pickup Update</div>
              <div className="text-sm font-semibold text-white">New Verified Driver Dispatched</div>
            </div>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-slate-400 hover:text-white text-xs p-1">
              ✕
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          Due to heavy traffic on your current route, your pickup has been reassigned to a nearby verified driver to avoid delay.
        </p>

        {/* Assigned driver & vehicle card */}
        <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
              {driver?.driverAvatar || driver?.driverName.substring(0, 2).toUpperCase() || 'DR'}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{driver?.driverName || reassignment.newDriverName || 'Mohan Singh'}</span>
                <span className="text-[10px] text-amber-300 font-normal">★ {driver?.driverRating || 4.9}</span>
              </div>
              <div className="text-[11px] text-blue-200">
                {driver?.vehicleModel || reassignment.newVehicleModel || 'Toyota Etios'} · <span className="font-mono text-white font-semibold">{driver?.vehiclePlate || reassignment.newVehiclePlate || 'MH12EF9012'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-300 uppercase tracking-wider">New ETA</div>
            <div className="text-base font-black text-emerald-400 font-mono">
              {driver?.predictedEtaMinutes || reassignment.newEtaMinutes || 6} min
            </div>
          </div>
        </div>

        {/* TrustPass Verification Tag */}
        <div className="flex items-center justify-between py-1 px-2.5 bg-emerald-950/60 rounded-lg border border-emerald-500/30 mb-3 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <span>🛡️</span>
            <span>TrustPass Dynamic QR & OTP Protection Active</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/50 px-2 py-0.5 rounded font-semibold">
            {reassignment.trustPassStatus === 'VERIFIED' ? 'Verified ✓' : 'Required at Boarding'}
          </span>
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-2">
          {onTrackNewDriver && (
            <button
              onClick={onTrackNewDriver}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>📍</span>
              <span>Track New Driver</span>
            </button>
          )}
          {onVerifyTrustPass && (
            <button
              onClick={onVerifyTrustPass}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🛡️</span>
              <span>Verify TrustPass</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Driver/Admin view
  return (
    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-800 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">✅</span>
        <div>
          <div className="text-xs font-bold text-emerald-900">
            Pickup Reassignment Active · Stop C (Chandani Chowk)
          </div>
          <div className="text-[11px] text-slate-600">
            Original: {reassignment.originalDriverName} ➔ New: <span className="font-bold text-emerald-800">{reassignment.newDriverName}</span> ({reassignment.newVehiclePlate}) · ETA: {reassignment.newEtaMinutes}m
          </div>
        </div>
      </div>
      {onTrackNewDriver && (
        <button
          onClick={onTrackNewDriver}
          className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-300"
        >
          View Route
        </button>
      )}
    </div>
  );
}
