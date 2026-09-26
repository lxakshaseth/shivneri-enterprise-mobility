// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - TRUSTPASS RE-VERIFICATION CARD
// Strict Mutual Cryptographic Handshake & Boarding Authorization Gate
// ============================================================================

import React, { useState } from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  onVerificationComplete: (isValid: boolean) => void;
}

export function TrustPassReverificationCard({ reassignment, onVerificationComplete }: Props) {
  const [method, setMethod] = useState<'qr' | 'otp'>('qr');
  const [otpInput, setOtpInput] = useState('4821');
  const [isVerifying, setIsVerifying] = useState(false);
  const [testFailureMode, setTestFailureMode] = useState<string | null>(null);

  const isVerified = reassignment.trustPassStatus === 'VERIFIED';
  const isBlocked = reassignment.trustPassStatus === 'BLOCKED';

  const handleVerify = (forceFail?: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (forceFail) {
        setTestFailureMode(forceFail);
        onVerificationComplete(false);
      } else {
        setTestFailureMode(null);
        onVerificationComplete(true);
      }
    }, 700);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
            🛡️
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span>TrustPass Security Gate for Reassigned Driver</span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold">
                Tier-1 Security
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Identity verification required prior to passenger boarding authorization
            </p>
          </div>
        </div>

        <span
          className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
            isVerified
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
              : isBlocked
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500'
              : 'bg-amber-500/20 text-amber-400 border border-amber-500'
          }`}
        >
          {isVerified ? 'BOARDING AUTHORIZED ✓' : isBlocked ? 'BOARDING BLOCKED ✗' : 'VERIFICATION PENDING'}
        </span>
      </div>

      {/* Verification Checklist */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
        {[
          { label: 'Driver Identity', check: 'Mohan Singh (#DRV-208)', valid: true },
          { label: 'Assigned Vehicle', check: 'MH12EF9012 (Etios)', valid: testFailureMode !== 'vehicle_mismatch' },
          { label: 'Pickup Geofence', check: 'Within 50m of Stop C', valid: testFailureMode !== 'outside_geofence' },
          { label: 'Time Window', check: 'Pickup SLA Synchronized', valid: true },
        ].map((c, i) => (
          <div key={i} className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
            <span className="text-[10px] text-slate-400 block mb-0.5">{c.label}</span>
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-200">
              <span className={c.valid ? 'text-emerald-400' : 'text-rose-400'}>
                {c.valid ? '✓' : '✗'}
              </span>
              <span className="truncate">{c.check}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Verification Mode Selector */}
      {!isVerified && !isBlocked && (
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-300">Select Mutual Verification Method</span>
            <div className="flex gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setMethod('qr')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  method === 'qr' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dynamic QR
              </button>
              <button
                onClick={() => setMethod('otp')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  method === 'otp' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Boarding OTP
              </button>
            </div>
          </div>

          {method === 'qr' ? (
            <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center font-black text-slate-900 text-2xl tracking-tighter shrink-0 border-2 border-emerald-400">
                ▦
              </div>
              <div className="text-xs space-y-1">
                <div className="font-bold text-white">Dynamic Cryptographic QR Code</div>
                <div className="text-[11px] text-slate-400">
                  Scan driver's TrustPass QR or show this code to Driver Mohan Singh
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Token: TP-HMAC-{reassignment.id.substring(3)}-2026 (Rotates every 30s)
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-700">
              <div>
                <div className="text-xs font-bold text-white">Mutual Boarding OTP</div>
                <div className="text-[11px] text-slate-400">Share this code with Driver Mohan Singh upon boarding</div>
              </div>
              <div className="text-2xl font-black font-mono tracking-widest text-emerald-400 bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700">
                {otpInput}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification State Banner */}
      {isVerified && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl flex items-center gap-3 text-xs mb-3 text-emerald-200">
          <span className="text-xl">✅</span>
          <div>
            <div className="font-bold text-white">TrustPass Handshake Complete</div>
            <div>Driver Mohan Singh, Vehicle MH12EF9012, and Rohan Joshi verified. Safe boarding logged in security audit stream.</div>
          </div>
        </div>
      )}

      {isBlocked && (
        <div className="p-3 bg-rose-950/70 border border-rose-500/50 rounded-xl flex items-center gap-3 text-xs mb-3 text-rose-200">
          <span className="text-xl">🚨</span>
          <div>
            <div className="font-bold text-white">Boarding Blocked: Verification Failed</div>
            <div>{testFailureMode === 'vehicle_mismatch' ? 'Vehicle plate did not match reassigned dispatch manifest.' : 'Passenger was outside geofence boundary.'} Control Tower alert triggered.</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          {!isVerified && (
            <>
              <button
                onClick={() => handleVerify()}
                disabled={isVerifying}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : '✓ Complete TrustPass Verification'}
              </button>

              <button
                onClick={() => handleVerify('vehicle_mismatch')}
                disabled={isVerifying}
                className="px-3 py-2 bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 font-semibold text-xs rounded-xl border border-rose-700 transition-colors cursor-pointer"
              >
                Simulate Mismatch Failure
              </button>
            </>
          )}

          {isBlocked && (
            <button
              onClick={() => handleVerify()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Retry Verification
            </button>
          )}
        </div>

        <span className="text-[10px] text-slate-500 font-mono">
          Ref: {reassignment.trustPassVerificationId || 'TP-REF-10421'}
        </span>
      </div>
    </div>
  );
}
