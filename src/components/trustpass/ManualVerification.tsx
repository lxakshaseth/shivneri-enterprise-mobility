import React, { useState } from 'react';
import { ManualVerificationReason } from './types';

interface ManualVerificationProps {
  rideId?: string;
  employeeName?: string;
  driverName?: string;
  vehiclePlate?: string;
  location?: string;
  onSubmitted?: () => void;
  onApproved?: () => void;
  onRejected?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ManualVerification: React.FC<ManualVerificationProps> = ({
  rideId = 'RID-10421',
  employeeName = 'Akshat G.',
  driverName = 'Raj Kumar',
  vehiclePlate = 'MH12AB1234',
  location = 'Kothrud Corporate Bay 2',
  onSubmitted,
  onApproved,
  onRejected,
  onCancel,
  className = '',
}) => {
  const [viewState, setViewState] = useState<'request' | 'admin-review' | 'approved' | 'rejected'>('request');
  const [selectedReason, setSelectedReason] = useState<ManualVerificationReason>('Network unavailable');

  const reasons: ManualVerificationReason[] = [
    'Network unavailable',
    'Phone unavailable',
    'QR unavailable',
    'OTP unavailable',
    'Emergency',
    'Other',
  ];

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono text-orange-400 bg-orange-950/60 border border-orange-500/40 px-2 py-0.5 rounded-full">
            <span>🏢</span>
            <span>CONTROL TOWER DESK</span>
          </div>
        </div>

        {/* 1. EMPLOYEE / DRIVER REQUEST SCREEN */}
        {viewState === 'request' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
                REQUEST MANUAL VERIFICATION
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated protocols failed. Request human dispatcher authorization.
              </p>
            </div>

            {/* Reason selector radio group as specified */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Select Failure Reason
              </div>
              {reasons.map(r => (
                <label
                  key={r}
                  onClick={() => setSelectedReason(r)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                    selectedReason === r
                      ? 'bg-orange-500/20 border-orange-500/50 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium">{r}</span>
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-orange-500"
                  />
                </label>
              ))}
            </div>

            <button
              onClick={() => {
                setViewState('admin-review');
                onSubmitted?.();
              }}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
            >
              SUBMIT MANUAL REQUEST →
            </button>
          </div>
        )}

        {/* 2. ADMIN RECEIVES: MANUAL BOARDING REQUEST */}
        {viewState === 'admin-review' && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-black uppercase mb-1">
                INCOMING DISPATCHER ALERT
              </div>
              <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
                MANUAL BOARDING REQUEST
              </h2>
            </div>

            {/* Details Box as specified */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Ride:</span>
                <span className="mono font-bold text-blue-400">{rideId}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-white">{employeeName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Driver:</span>
                <span className="font-bold text-white">{driverName}</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Vehicle:</span>
                <span className="ind-plate text-[10px]">
                  <span className="ind-plate-blue">IND</span>
                  {vehiclePlate}
                </span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Location:</span>
                <span className="text-slate-200">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Reason:</span>
                <span className="font-bold text-orange-400">{selectedReason}</span>
              </div>
            </div>

            {/* 4 Required Manual Approval Rules Notice */}
            <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div className="text-cyan-400 font-bold">MANDATORY GOVERNANCE RULES:</div>
              <div className="grid grid-cols-2 gap-1 text-[9px]">
                <span>✓ Time-limited (10 min expiry)</span>
                <span>✓ Ride-specific ({rideId})</span>
                <span>✓ Immutably Audited</span>
                <span>✓ Attributed to Approver</span>
              </div>
            </div>

            {/* 3 Actions as specified: [ APPROVE ] [ REJECT ] [ REQUEST MORE INFO ] */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setViewState('approved');
                  onApproved?.();
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
              >
                APPROVE MANUAL BOARDING
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setViewState('rejected');
                    onRejected?.();
                  }}
                  className="py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-xl border border-red-500/40 cursor-pointer"
                >
                  REJECT
                </button>
                <button
                  onClick={() => alert('📞 Dispatcher call bridge opened with driver & employee.')}
                  className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                >
                  REQUEST INFO
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. APPROVED STATE */}
        {viewState === 'approved' && (
          <div className="text-center pt-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto ring-8 ring-emerald-500/10">
              ✓
            </div>
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">
              OVERRIDE AUTHORIZED
            </div>
            <h2 className="text-base font-extrabold text-white">
              Manual Approval Granted
            </h2>
            <div className="bg-slate-800 rounded-xl p-3 text-xs text-left space-y-1 text-slate-300">
              <div>Approver: <span className="font-bold text-white">Dispatcher Sunil M. (DSP-402)</span></div>
              <div>Audit Code: <span className="mono text-cyan-400">OVR-9812-TIME-10M</span></div>
              <div>Valid Until: <span className="font-bold text-emerald-400">07:42 AM</span></div>
            </div>
          </div>
        )}

        {/* 4. REJECTED STATE */}
        {viewState === 'rejected' && (
          <div className="text-center pt-4 space-y-3">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto ring-8 ring-red-500/10">
              ✗
            </div>
            <div className="text-xs font-black text-red-400 uppercase tracking-widest">
              REQUEST DENIED
            </div>
            <h2 className="text-base font-extrabold text-white">
              Manual Override Rejected
            </h2>
            <p className="text-xs text-slate-400">
              Control Tower detected vehicle location anomaly. Passenger must not board.
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 text-center text-[10px] text-slate-500">
        Enterprise SOC-2 Escalation Protocol
      </div>
    </div>
  );
};

export default ManualVerification;
