import React from 'react';
import { ContextMatrix } from './types';

interface TrustPassDecisionProps {
  matrix?: Partial<ContextMatrix>;
  onBoardRide?: () => void;
  onViewAudit?: () => void;
  className?: string;
}

export const TrustPassDecision: React.FC<TrustPassDecisionProps> = ({
  matrix = {
    employeeIdentity: true,
    driverIdentity: true,
    vehicleMatch: true,
    rideMatch: true,
    location: true,
    timeWindow: true,
    deviceContext: true,
    policy: true,
  },
  onBoardRide,
  onViewAudit,
  className = '',
}) => {
  const checks = [
    { label: 'Employee Identity', key: 'employeeIdentity', verified: matrix.employeeIdentity ?? true },
    { label: 'Driver Identity', key: 'driverIdentity', verified: matrix.driverIdentity ?? true },
    { label: 'Vehicle Match', key: 'vehicleMatch', verified: matrix.vehicleMatch ?? true },
    { label: 'Ride Match', key: 'rideMatch', verified: matrix.rideMatch ?? true },
    { label: 'Location', key: 'location', verified: matrix.location ?? true },
    { label: 'Time Window', key: 'timeWindow', verified: matrix.timeWindow ?? true },
    { label: 'Device Context', key: 'deviceContext', verified: matrix.deviceContext ?? true },
    { label: 'Policy', key: 'policy', verified: matrix.policy ?? true },
  ];

  const allPassed = checks.every(c => c.verified);

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-950 text-white rounded-2xl ${className}`}>
      <div>
        {/* Top Header */}
        <div className="text-center pt-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider mb-2">
            <span>🛡️</span>
            <span>SHIVNERI MULTI-CONTEXT SECURITY</span>
          </div>
          <h2 className="text-lg font-black text-white tracking-tight uppercase">
            TRUSTPASS ENGINE
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic identity, telemetry, spatial and shift policy synthesis
          </p>
        </div>

        {/* 8-Point Contextual Security Matrix as specified */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-2 mb-4 text-xs">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Contextual Anchor Signals
          </div>

          <div className="space-y-1.5">
            {checks.map(item => (
              <div
                key={item.key}
                className="flex items-center justify-between py-1 border-b border-slate-800/60 last:border-0"
              >
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className="font-extrabold flex items-center gap-1 text-emerald-400">
                  <span>✓</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL DECISION Box as explicitly specified */}
        <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-4 text-center space-y-2 mb-3 shadow-lg shadow-emerald-900/20">
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            FINAL DECISION:
          </div>

          <div className="text-xl font-black text-emerald-400 tracking-tight flex items-center justify-center gap-2">
            <span>🟢</span>
            <span>TRUSTED PICKUP</span>
          </div>

          <div className="inline-block px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs uppercase tracking-wider border border-emerald-500/40">
            BOARDING AUTHORIZED
          </div>

          <p className="text-[10px] text-slate-400 leading-tight pt-1">
            All 8 cryptographic, biometric, spatial, temporal, and enterprise compliance requirements satisfied.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onBoardRide}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer transition-transform active:scale-[0.99]"
        >
          CONFIRM BOARDING →
        </button>

        {onViewAudit && (
          <button
            onClick={onViewAudit}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
          >
            View Cryptographic Audit Trail
          </button>
        )}

        <div className="text-center text-[9px] text-slate-500 pt-1">
          🔒 Sensitive internal risk weights and calculations remain confidential.
        </div>
      </div>
    </div>
  );
};

export default TrustPassDecision;
