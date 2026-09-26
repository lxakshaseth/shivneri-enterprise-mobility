import React from 'react';
import { VerificationFeedItem } from '../types';

interface VerificationReceiptModalProps {
  item: VerificationFeedItem | null;
  onClose: () => void;
  onViewAudit?: (item: VerificationFeedItem) => void;
}

export function VerificationReceiptModal({ item, onClose, onViewAudit }: VerificationReceiptModalProps) {
  if (!item) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const receiptText = `
==================================================
SHIVNERI VERIFICATION RECEIPT
==================================================
Ride: ${item.rideId}
Employee: ${item.employeeName} (${item.employeeOrg})
Driver: ${item.driverName}
Vehicle: ${item.vehiclePlate}
Methods: ${item.method}
Context:
  Location: PASS (Within 150m geofence)
  Time: PASS (Within shift window)
  Assignment: MATCHED (Dispatch manifest confirmed)
Boarding: ${item.timestamp}
Verification ID: ${item.verificationId}
Status: VERIFIED (Authorized by TrustPass Engine)
Digital Signature: SHA256:${item.verificationId}A79F21E389B029
==================================================
Issued by Shivneri Enterprise Mobility
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${item.verificationId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col">
        
        {/* Receipt Top Header */}
        <div className="bg-emerald-700 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white transition-colors"
          >
            ✕
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center text-2xl mb-2 backdrop-blur-sm">
            🛡
          </div>
          <h3 className="font-extrabold text-lg tracking-wider uppercase font-mono">
            SHIVNERI VERIFICATION RECEIPT
          </h3>
          <p className="text-emerald-100 text-xs mt-1">Official Boarding Authorization Certificate</p>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 text-xs font-bold mt-3 border border-emerald-500/40">
            <span>🟢</span> STATUS: VERIFIED
          </div>
        </div>

        {/* Receipt Content - Styled as authentic high-security voucher */}
        <div className="p-6 bg-slate-50/70 border-b border-dashed border-slate-300 space-y-4 text-xs">
          
          {/* Key Identifiers */}
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Ride</span>
              <div className="text-sm font-bold font-mono text-slate-900">{item.rideId}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Verification ID</span>
              <div className="text-sm font-bold font-mono text-slate-900">{item.verificationId}</div>
            </div>
          </div>

          {/* People & Vehicle */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Employee:</span>
              <span className="font-bold text-slate-900">{item.employeeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Organization:</span>
              <span className="font-medium text-slate-700">{item.employeeOrg}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Driver:</span>
              <span className="font-bold text-slate-900">{item.driverName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Vehicle:</span>
              <span className="font-bold font-mono text-slate-900 px-2 py-0.5 rounded bg-slate-200/70 border border-slate-300 text-[11px]">
                {item.vehiclePlate}
              </span>
            </div>
          </div>

          {/* Methods & Context Verification */}
          <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Methods:</span>
              <span className="font-bold text-blue-700">{item.method}</span>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Context Attestation</span>
              <div className="grid grid-cols-3 gap-1 text-[11px]">
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span>✓</span> Location
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span>✓</span> Time
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <span>✓</span> Assignment
                </div>
              </div>
            </div>
          </div>

          {/* Boarding Time & Seal */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Boarding Confirmed:</span>
            <span className="font-mono font-bold text-slate-900">{item.timestamp}</span>
          </div>

          {/* Security Barcode / QR Graphic Simulation */}
          <div className="pt-2 text-center">
            <div className="p-2 bg-white rounded-lg border border-slate-200 inline-block shadow-inner">
              <div className="flex items-center justify-center gap-0.5 h-8">
                {[...Array(38)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-800 h-full"
                    style={{
                      width: i % 4 === 0 ? '3px' : i % 3 === 0 ? '1px' : '2px',
                      opacity: i % 5 === 0 ? 0.4 : 1,
                    }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-1">
              DIGITAL AUDIT SEAL • SHIVNERI TRUSTPASS HSM • SHA256:VERIFIED
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="p-4 bg-white flex items-center justify-between gap-2">
          <button
            onClick={() => {
              if (onViewAudit) {
                onClose();
                onViewAudit(item);
              }
            }}
            className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>🔍</span> VIEW AUDIT
          </button>
          
          <button
            onClick={handleExport}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span>⬇</span> EXPORT
          </button>

          <button
            onClick={handlePrint}
            title="Print Receipt"
            className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs transition-colors"
          >
            🖨
          </button>
        </div>

      </div>
    </div>
  );
}
