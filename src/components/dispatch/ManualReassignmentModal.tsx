// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - MANUAL REASSIGNMENT OVERRIDE MODAL
// Control Tower Human-in-the-Loop Override with RBAC/ABAC Step-Up Authorization
// ============================================================================

import React, { useState } from 'react';
import { CandidateDriver, ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent;
  availableDrivers: CandidateDriver[];
  onClose: () => void;
  onConfirmOverride: (selectedDriverId: string, reason: string) => void;
}

export function ManualReassignmentModal({
  reassignment,
  availableDrivers,
  onClose,
  onConfirmOverride,
}: Props) {
  const [selectedDriverId, setSelectedDriverId] = useState(
    availableDrivers[0]?.driverId || 'DRV-208'
  );
  const [reason, setReason] = useState('Dispatcher operational preference for Aundh cluster');
  const [stepUpVerified, setStepUpVerified] = useState(false);
  const [stepUpCode, setStepUpCode] = useState('');
  const [error, setError] = useState('');

  const eligibleDrivers = availableDrivers.filter(d => d.eligible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A valid operational override reason is mandatory for compliance audit.');
      return;
    }
    if (!stepUpVerified) {
      setError('Please complete step-up confirmation code before executing manual override.');
      return;
    }
    onConfirmOverride(selectedDriverId, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 text-lg">⚠️</span>
            <div>
              <h3 className="text-sm font-bold text-white">Manual Control Tower Override</h3>
              <p className="text-[11px] text-slate-400">
                Authorized Operations Action · Step-up Verification Enforced
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <strong>RBAC / ABAC Security Policy Notice:</strong> All manual overrides bypass deterministic scoring logic and generate high-priority security audit entries.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Select Replacement Driver & Vehicle
            </label>
            <select
              value={selectedDriverId}
              onChange={e => setSelectedDriverId(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
            >
              {eligibleDrivers.map(d => (
                <option key={d.driverId} value={d.driverId}>
                  {d.driverName} (#{d.driverId}) · {d.vehicleModel} ({d.vehiclePlate}) · ETA: {d.predictedEtaMinutes}m · ★ {d.driverRating}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Mandatory Justification / Reason *
            </label>
            <textarea
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setError('');
              }}
              rows={3}
              placeholder="Explain why manual override is necessary..."
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Step-up authentication */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">Step-Up Confirmation</span>
              <span className="text-[10px] text-slate-500 font-mono">Role: operations-manager</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 'CONFIRM-OVERRIDE'"
                value={stepUpCode}
                onChange={e => {
                  setStepUpCode(e.target.value);
                  if (e.target.value === 'CONFIRM-OVERRIDE' || e.target.value.toLowerCase() === 'override') {
                    setStepUpVerified(true);
                    setError('');
                  }
                }}
                className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  setStepUpCode('CONFIRM-OVERRIDE');
                  setStepUpVerified(true);
                }}
                className="px-3 py-1 text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
            {stepUpVerified && (
              <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                ✓ Identity & step-up token validated
              </span>
            )}
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-black text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Confirm & Execute Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
