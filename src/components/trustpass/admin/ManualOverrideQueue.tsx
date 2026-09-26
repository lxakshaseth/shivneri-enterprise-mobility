import React, { useState, useEffect } from 'react';
import { ManualOverrideRequestItem, ManualVerificationReason } from '../types';

export function ManualOverrideQueue() {
  const [requests, setRequests] = useState<ManualOverrideRequestItem[]>([
    {
      id: 'OVR-701',
      rideId: 'RID-10419',
      employeeName: 'Amit Shah',
      employeeId: 'EMP-4091',
      employeeOrg: 'Capgemini India',
      driverName: 'Sandeep Joshi',
      driverId: 'DRV-102',
      vehiclePlate: 'MH12OP1234',
      location: 'Punawale Phata (Cellular dead zone)',
      reason: 'Network unavailable',
      customNotes: 'Driver and employee both reporting zero 4G/5G reception under highway flyover. Both badge photos cross-matched.',
      requestedBy: 'Driver',
      requestedAt: '07:24:10',
      expiresAt: '07:34:10',
      secondsRemaining: 210, // ~3.5 min
      riskLevel: 'LOW',
      status: 'APPROVED',
      reviewedBy: 'Akash Mehta (Super Admin)',
      reviewedAt: '07:25:00',
    },
    {
      id: 'OVR-702',
      rideId: 'RID-10425',
      employeeName: 'Rohan Deshpande',
      employeeId: 'EMP-8832',
      employeeOrg: 'TCS Pune Campus',
      driverName: 'Priya Das',
      driverId: 'DRV-408',
      vehiclePlate: 'MH12MN6789',
      location: 'Kothrud Depot',
      reason: 'Phone unavailable',
      customNotes: 'Employee phone battery drained at 0%. Physical corporate RFID card and government Aadhaar verified by driver.',
      requestedBy: 'Driver',
      requestedAt: '07:30:15',
      expiresAt: '07:35:15',
      secondsRemaining: 180,
      riskLevel: 'MEDIUM',
      status: 'PENDING',
    },
    {
      id: 'OVR-703',
      rideId: 'RID-10427',
      employeeName: 'Sunita Rao',
      employeeId: 'EMP-1102',
      employeeOrg: 'Infosys BPM',
      driverName: 'Mohan Sharma',
      driverId: 'DRV-221',
      vehiclePlate: 'MH12KL2345',
      location: 'Hinjewadi Phase 2',
      reason: 'QR unavailable',
      customNotes: 'Camera module cracked on driver mobile device; cannot scan passenger TrustPass QR.',
      requestedBy: 'Driver',
      requestedAt: '07:33:00',
      expiresAt: '07:38:00',
      secondsRemaining: 260,
      riskLevel: 'LOW',
      status: 'PENDING',
    },
    {
      id: 'OVR-704',
      rideId: 'RID-10430',
      employeeName: 'Kunal Kapoor',
      employeeId: 'EMP-9021',
      employeeOrg: 'Wipro Technologies',
      driverName: 'Arjun Nair',
      driverId: 'DRV-331',
      vehiclePlate: 'MH12GH3456',
      location: 'Hadapsar Bypass',
      reason: 'Emergency',
      customNotes: 'Critical patient transit escort; medical supervisor requested immediate boarding bypass.',
      requestedBy: 'Dispatcher',
      requestedAt: '07:34:20',
      expiresAt: '07:39:20',
      secondsRemaining: 295,
      riskLevel: 'HIGH',
      status: 'PENDING',
    },
    {
      id: 'OVR-705',
      rideId: 'RID-10388',
      employeeName: 'Mahesh K.',
      employeeId: 'EMP-3312',
      employeeOrg: 'Cognizant',
      driverName: 'Deepak Patil',
      driverId: 'DRV-119',
      vehiclePlate: 'MH12EF9012',
      location: 'Baner Rd',
      reason: 'OTP unavailable',
      customNotes: 'SMS gateway delayed; requested security override.',
      requestedBy: 'Employee',
      requestedAt: '06:45:00',
      expiresAt: '06:50:00',
      secondsRemaining: 0,
      riskLevel: 'LOW',
      status: 'EXPIRED',
      reviewedBy: 'System Auto-Expire',
    },
  ]);

  // Live timer countdown that automatically expires approved & pending requests
  useEffect(() => {
    const timer = setInterval(() => {
      setRequests(prev =>
        prev.map(req => {
          if (req.secondsRemaining <= 0) {
            if (req.status === 'APPROVED' || req.status === 'PENDING') {
              return { ...req, status: 'EXPIRED', secondsRemaining: 0 };
            }
            return req;
          }
          return { ...req, secondsRemaining: req.secondsRemaining - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleApprove = (id: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'APPROVED',
              secondsRemaining: 300, // 5 min auto-expire countdown
              reviewedBy: 'You (Security Admin)',
              reviewedAt: new Date().toLocaleTimeString(),
            }
          : r
      )
    );
  };

  const handleReject = (id: string) => {
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              status: 'REJECTED',
              reviewedBy: 'You (Security Admin)',
              reviewedAt: new Date().toLocaleTimeString(),
            }
          : r
      )
    );
  };

  const handleEscalate = (id: string) => {
    alert(`Request ${id} escalated to Transport Operations Director & Fleet Security VP with High-Priority SMS dispatched.`);
    setRequests(prev =>
      prev.map(r =>
        r.id === id
          ? {
              ...r,
              riskLevel: 'HIGH',
              customNotes: `${r.customNotes} [ESCALATED TO VP SAFETY]`,
            }
          : r
      )
    );
  };

  const formatRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string, seconds: number) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            ⏳ PENDING APPROVAL
          </span>
        );
      case 'APPROVED':
        return (
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ APPROVED
            </span>
            <span className="text-[10px] text-amber-700 font-mono mt-0.5 font-bold">
              Auto-expires in: {formatRemaining(seconds)}
            </span>
          </div>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            ✕ REJECTED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            ⏱ EXPIRED
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">HIGH RISK</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              MANUAL VERIFICATION REQUESTS
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {requests.filter(r => r.status === 'PENDING').length} Pending Dispatcher Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-loop exception management. Approved authorizations enforce a 5-minute cryptographic auto-expiration policy to prevent token replay attacks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center gap-1.5">
            <span>🛡</span> Security Policy: Auto-Expire strictly enforced
          </div>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {requests.map(req => (
            <div
              key={req.id}
              className={`p-5 transition-colors ${
                req.status === 'PENDING' ? 'bg-amber-50/20 hover:bg-amber-50/30' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                
                {/* Left metadata */}
                <div className="space-y-2 flex-1 min-w-[300px]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {req.id}
                    </span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {req.rideId}
                    </span>
                    {getRiskBadge(req.riskLevel)}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      Reason: {req.reason}
                    </span>
                  </div>

                  {/* Parties Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Employee</span>
                      <strong className="text-slate-900">{req.employeeName}</strong>
                      <span className="text-[10px] text-slate-500 block">{req.employeeOrg}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver</span>
                      <strong className="text-slate-900">{req.driverName}</strong>
                      <span className="text-[10px] text-slate-500 font-mono block">{req.vehiclePlate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Location</span>
                      <span className="text-slate-700 block line-clamp-1">{req.location}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested By</span>
                      <span className="text-slate-800 font-medium">{req.requestedBy}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">at {req.requestedAt}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {req.customNotes && (
                    <div className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">Driver/Officer Notes:</span> {req.customNotes}
                    </div>
                  )}

                  {req.reviewedBy && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Reviewed by: <strong className="text-slate-700">{req.reviewedBy}</strong> {req.reviewedAt && `at ${req.reviewedAt}`}
                    </div>
                  )}
                </div>

                {/* Right side status & action buttons */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {getStatusBadge(req.status, req.secondsRemaining)}

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleApprove(req.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <span>✓</span> Approve
                      </button>

                      <button
                        onClick={() => handleReject(req.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
                      >
                        <span>✕</span> Reject
                      </button>

                      <button
                        onClick={() => handleEscalate(req.id)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>⚡</span> Escalate
                      </button>
                    </div>
                  )}

                  {req.status === 'APPROVED' && (
                    <button
                      onClick={() => handleReject(req.id)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:text-red-800 hover:underline"
                    >
                      Revoke Approval
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
