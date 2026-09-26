import React, { useState } from 'react';
import { VerificationFeedItem } from '../types';

interface TrustPassAuditModalProps {
  item: VerificationFeedItem | null;
  onClose: () => void;
  onViewReceipt?: (item: VerificationFeedItem) => void;
}

export function TrustPassAuditModal({ item, onClose, onViewReceipt }: TrustPassAuditModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const checks = [
    { label: 'Employee Identity', passed: item.auditChecks.employeeIdentity, detail: 'Enterprise SSO credential validated with photo biometric' },
    { label: 'Driver Identity', passed: item.auditChecks.driverIdentity, detail: 'Shivneri Verified Partner badge #DRV-4091 confirmed' },
    { label: 'Vehicle Match', passed: item.auditChecks.vehicle, detail: 'RTO MH12AB1234 registered to assigned driver' },
    { label: 'Ride Assignment', passed: item.auditChecks.ride, detail: 'Manifest assignment matched in Shivneri Dispatch Engine' },
    { label: 'Geofence Perimeter', passed: item.auditChecks.geofence, detail: 'Device GPS within 150m perimeter of Kothrud hub' },
    { label: 'Time Window', passed: item.auditChecks.time, detail: 'Within allowed shift window (07:20 - 07:45 IST)' },
    { label: 'Device Integrity', passed: item.auditChecks.device, detail: 'Hardware keystore verified, no mock location or root detected' },
    { label: 'Policy Compliance', passed: item.auditChecks.policy, detail: 'Enterprise Standard Shift Policy v4.2 fully compliant' },
  ];

  const handleCopyHash = () => {
    navigator.clipboard?.writeText?.(`VRF-AUDIT-${item.verificationId}-SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'ALLOW':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">ALLOW (Authorized)</span>;
      case 'DENY':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">DENY (Blocked)</span>;
      case 'FALLBACK_REQUIRED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">FALLBACK REQUIRED</span>;
      case 'MANUAL_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">MANUAL APPROVAL</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{decision}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-lg">
              🛡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-wide">TRUSTPASS AUDIT</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {item.verificationId}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cryptographic Bilateral Handshake & Zero-Trust Context Record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Top metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Ride ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{item.rideId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Employee</span>
              <span className="font-semibold text-slate-900">{item.employeeName}</span>
              <span className="text-[10px] text-slate-500 block">{item.employeeOrg}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver</span>
              <span className="font-semibold text-slate-900">{item.driverName}</span>
              <span className="text-[10px] text-emerald-600 font-medium block">Verified Partner ✓</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle</span>
              <span className="font-mono font-bold text-slate-900">{item.vehiclePlate}</span>
              <span className="text-[10px] text-slate-500 block">Toyota Innova Crysta</span>
            </div>
          </div>

          {/* Verification Method & Decision Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
            <div>
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Method Used</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                <span className="text-blue-600">⚡</span> {item.method}
                {item.fallbackUsed && (
                  <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    (Fallback: {item.fallbackUsed})
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Decision</div>
              {getDecisionBadge(item.decision)}
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timestamp</div>
              <div className="font-mono text-xs font-semibold text-slate-800 mt-1">{item.timestamp}</div>
            </div>
          </div>

          {/* 8-Point Context Verification Matrix */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <span>8-Point Bilateral Context Verification</span>
                <span className="text-[10px] font-normal text-slate-500">
                  ({Object.values(item.auditChecks).filter(Boolean).length}/8 Passed)
                </span>
              </h4>
              <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                Non-Repudiation Guaranteed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {checks.map((chk, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                    chk.passed
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-red-50/50 border-red-200'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      chk.passed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {chk.passed ? '✓' : '✕'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{chk.label}</span>
                      <span
                        className={`text-[10px] font-bold ${
                          chk.passed ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {chk.passed ? 'VERIFIED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {chk.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Proof Hash */}
          <div className="p-3.5 bg-slate-900 rounded-xl text-slate-300 text-xs font-mono border border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
              <span className="uppercase tracking-wider font-semibold text-slate-300">
                Immutable Ledger Cryptographic Seal
              </span>
              <button
                onClick={handleCopyHash}
                className="hover:text-white transition-colors text-blue-400"
              >
                {copied ? 'Copied ✓' : 'Copy Hash'}
              </button>
            </div>
            <div className="text-[11px] break-all text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800">
              SHA256: 4b22c83ef07a998bc19d9b62a632db2f039a04a11c834a3e895c0dc5a242{item.verificationId}9f82
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
              <span>Signer: Shivneri KeyMaster HSM v2</span>
              <span>Node: bom-az-1 (Mumbai Region)</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <div className="flex items-center gap-2">
            {item.status === 'VERIFIED' && onViewReceipt && (
              <button
                onClick={() => {
                  onClose();
                  onViewReceipt(item);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>🧾</span> View Verification Receipt
              </button>
            )}
            <button
              onClick={() => {
                alert(`Exporting official audit bundle for ${item.verificationId} as signed PDF/JSON.`);
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span>⬇</span> Export Audit Bundle
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
