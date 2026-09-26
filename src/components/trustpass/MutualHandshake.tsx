import React from 'react';
import { TrustPassDecision } from './types';

interface MutualHandshakeProps {
  employeeVerified?: boolean;
  driverVerified?: boolean;
  vehicleVerified?: boolean;
  rideVerified?: boolean;
  locationVerified?: boolean;
  timeVerified?: boolean;
  decision?: TrustPassDecision;
  onProceed?: () => void;
  onFallback?: () => void;
  onDeny?: () => void;
  className?: string;
}

export const MutualHandshake: React.FC<MutualHandshakeProps> = ({
  employeeVerified = true,
  driverVerified = true,
  vehicleVerified = true,
  rideVerified = true,
  locationVerified = false, // ○ pending by default
  timeVerified = true,
  decision = 'ALLOW',
  onProceed,
  onFallback,
  onDeny,
  className = '',
}) => {
  const getDecisionConfig = () => {
    switch (decision) {
      case 'ALLOW':
        return {
          icon: '🟢',
          title: 'ALLOW',
          bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
          badge: 'bg-emerald-500 text-white',
          desc: 'All security anchors verified. Mutual cryptographic trust established.',
          ctaLabel: 'PROCEED TO BOARDING →',
          ctaAction: onProceed,
          ctaClass: 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white',
        };
      case 'FALLBACK_REQUIRED':
        return {
          icon: '🟡',
          title: 'FALLBACK REQUIRED',
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
          badge: 'bg-amber-500 text-slate-900 font-bold',
          desc: 'Optical verification timed out. Switch to Out-of-band Ride OTP.',
          ctaLabel: 'SWITCH TO RIDE OTP →',
          ctaAction: onFallback,
          ctaClass: 'bg-amber-600 hover:bg-amber-500 text-white',
        };
      case 'MANUAL_APPROVAL':
        return {
          icon: '🟠',
          title: 'MANUAL APPROVAL',
          bg: 'bg-orange-500/10 border-orange-500/40 text-orange-300',
          badge: 'bg-orange-500 text-white',
          desc: 'Geofence proximity deviation. Control tower manual override required.',
          ctaLabel: 'REQUEST CONTROL TOWER APPROVAL',
          ctaAction: onFallback,
          ctaClass: 'bg-orange-600 hover:bg-orange-500 text-white',
        };
      case 'DENY':
      default:
        return {
          icon: '🔴',
          title: 'DENY',
          bg: 'bg-red-500/10 border-red-500/40 text-red-300',
          badge: 'bg-red-600 text-white',
          desc: 'Security mismatch detected. Boarding strictly blocked.',
          ctaLabel: 'DO NOT BOARD · ALERT SECURITY',
          ctaAction: onDeny,
          ctaClass: 'bg-red-600 hover:bg-red-500 text-white',
        };
    }
  };

  const config = getDecisionConfig();

  const matrixChecks = [
    { label: 'EMPLOYEE', verified: employeeVerified, isPending: false },
    { label: 'DRIVER', verified: driverVerified, isPending: false },
    { label: 'VEHICLE', verified: vehicleVerified, isPending: false },
    { label: 'RIDE', verified: rideVerified, isPending: false },
    { label: 'LOCATION', verified: locationVerified, isPending: !locationVerified },
    { label: 'TIME', verified: timeVerified, isPending: false },
  ];

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-950 text-white ${className}`}>
      <div>
        {/* Header */}
        <div className="text-center pt-1 mb-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span>🛡️</span>
            <span>SHIVNERI CORE FEATURE</span>
          </div>
          <h2 className="text-base font-black text-white tracking-tight">
            Mutual Trust Handshake
          </h2>
          <p className="text-[11px] text-slate-400">
            Bi-directional verification between Employee and Driver
          </p>
        </div>

        {/* Bilateral Verification Diagram */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Employee side */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 text-left">
            <div className="text-[10px] font-black tracking-wider text-blue-400 uppercase mb-2 flex items-center justify-between">
              <span>EMPLOYEE</span>
              <span className="text-[9px] text-emerald-400 font-normal">verifies</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Driver</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Vehicle</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Ride</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
            </div>
          </div>

          {/* Driver side */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 text-left">
            <div className="text-[10px] font-black tracking-wider text-cyan-400 uppercase mb-2 flex items-center justify-between">
              <span>DRIVER</span>
              <span className="text-[9px] text-emerald-400 font-normal">verifies</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <span>Employee</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Ride</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Vehicle</span>
                <span className="text-emerald-400 font-bold">✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6-Point Verification Matrix as explicitly specified in prompt */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-3 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-left">
            6-Point Security Matrix
          </div>
          <div className="grid grid-cols-3 gap-2">
            {matrixChecks.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="text-[10px] font-bold text-slate-300 tracking-wider">
                  {item.label}
                </span>
                <span
                  className={`font-black text-sm ${
                    item.isPending
                      ? 'text-amber-400'
                      : item.verified
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {item.isPending ? '○' : item.verified ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* TRUSTPASS DECISION Card as specified */}
        <div className={`rounded-2xl border p-3.5 mb-2 text-left transition-all ${config.bg}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              TRUSTPASS DECISION
            </span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.icon} {config.title}
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-1 leading-snug">
            {config.desc}
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={config.ctaAction}
          className={`w-full py-3 text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.99] ${config.ctaClass}`}
        >
          <span>{config.ctaLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default MutualHandshake;
