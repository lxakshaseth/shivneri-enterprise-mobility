// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DRIVER ASSIGNMENT OFFER
// Priority Reassignment Acceptance Dialog for Driver Mobile App
// ============================================================================

import React, { useState, useEffect } from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  onAccept: () => void;
  onDecline: () => void;
}

export function DriverAssignmentOffer({ reassignment, onAccept, onDecline }: Props) {
  const [secondsRemaining, setSecondsRemaining] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline(); // Auto timeout decline
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onDecline]);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
        {/* Top Emergency/Priority Bar */}
        <div className="bg-gradient-to-r from-amber-500 to-rose-600 px-4 py-2 flex items-center justify-between text-xs font-black tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <span className="animate-ping">🚨</span>
            <span>NEW PRIORITY PICKUP OFFER</span>
          </span>
          <span className="font-mono bg-black/30 px-2 py-0.5 rounded">
            ⏳ {secondsRemaining}s
          </span>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">TRIP REASSIGNMENT</span>
              <div className="text-base font-bold text-white">{reassignment.rideId}</div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-400 font-bold block">PRIORITY SURGE</span>
              <span className="text-lg font-black text-emerald-400 font-mono">+₹140</span>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 space-y-2.5 mb-4 text-xs">
            <div className="flex justify-between items-start">
              <span className="text-slate-400">Pickup Area:</span>
              <span className="font-bold text-white text-right max-w-[180px]">
                Chandani Chowk (Stop C)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pickup ETA:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">6 minutes away</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Passenger (Privacy Masked):</span>
              <span className="font-medium text-slate-200">Rohan J. (EMP-10495)</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Destination:</span>
              <span className="font-medium text-blue-300">TCS Hinjewadi Ph1 Gate</span>
            </div>

            <div className="flex justify-between items-center border-t border-slate-700/80 pt-2 text-[11px]">
              <span className="text-slate-400">Reason:</span>
              <span className="text-amber-300 font-medium">Bypass Wakad traffic delay</span>
            </div>
          </div>

          {/* TrustPass Requirement Notice */}
          <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-2.5 mb-4 flex items-center gap-2 text-[11px] text-emerald-300">
            <span className="text-base">🛡️</span>
            <span>TrustPass mutual QR & OTP check required upon passenger boarding.</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAccept}
              className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>✓</span>
              <span>ACCEPT PICKUP</span>
            </button>
            <button
              onClick={onDecline}
              className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
