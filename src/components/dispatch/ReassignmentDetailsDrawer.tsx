// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - REASSIGNMENT DETAILS DRAWER
// Comprehensive 20-Section Operational Diagnostic & Audit Inspection Center
// ============================================================================

import React, { useState } from 'react';
import { ReassignmentEvent } from '../../types/dispatch';
import { SmartDispatchStatusBadge } from './SmartDispatchStatusBadge';

interface Props {
  reassignment: ReassignmentEvent;
  onClose: () => void;
  onVerifyTrustPass?: () => void;
  onManualOverride?: () => void;
}

export function ReassignmentDetailsDrawer({
  reassignment,
  onClose,
  onVerifyTrustPass,
  onManualOverride,
}: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'decision' | 'candidates' | 'audit'>('all');
  const selectedDriver = reassignment.selectedDriver;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold">
                REASSIGNMENT #{reassignment.id}
              </span>
              <SmartDispatchStatusBadge type="status" value={reassignment.status} size="sm" />
            </div>
            <h2 className="text-base font-bold text-white">Dynamic Dispatch Inspection & Audit</h2>
            <div className="text-xs text-slate-400">
              Trip: {reassignment.rideId} · Tenant: {reassignment.organizationId} · Trigger: {reassignment.triggerType}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switchers */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'All 20 Diagnostic Sections' },
            { id: 'decision', label: 'Scoring & Explanation' },
            { id: 'candidates', label: `Candidates (${reassignment.candidateDrivers.length})` },
            { id: 'audit', label: `Audit Timeline (${reassignment.auditLog.length})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as unknown as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. RIDE INFORMATION */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>1. Ride Information</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Ride ID</span>
                <span className="font-bold text-slate-800 font-mono">{reassignment.rideId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Route ID</span>
                <span className="font-bold text-slate-800 font-mono">RT-001 (Kothrud → Hinjewadi)</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Organization</span>
                <span className="font-semibold text-slate-800">TCS Pune Campus</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Trigger Type</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                  {reassignment.triggerType}
                </span>
              </div>
            </div>
          </section>

          {/* 2. EMPLOYEE DETAILS */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              2. Employee (Affected Passenger)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Employee Name</span>
                <span className="font-bold text-slate-800">{reassignment.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Employee ID</span>
                <span className="font-mono text-slate-700">{reassignment.employeeId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Pickup Location</span>
                <span className="text-slate-800 font-medium">{reassignment.pickupLocation}</span>
              </div>
            </div>
          </section>

          {/* 3, 4, 5, 6. DRIVER & VEHICLE COMPARISON */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Driver & Vehicle */}
            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
                3 & 5. Original Assignment
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-bold text-slate-800">{reassignment.originalDriverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-mono text-slate-800">{reassignment.originalVehiclePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-slate-700">{reassignment.originalVehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-rose-700 font-semibold">Trapped in Congestion</span>
                </div>
              </div>
            </div>

            {/* New Reassigned Driver & Vehicle */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-300">
              <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                4 & 6. New Assignment
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Driver:</span>
                  <span className="font-bold text-emerald-900">{selectedDriver?.driverName || reassignment.newDriverName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-mono text-emerald-950 font-bold">{selectedDriver?.vehiclePlate || reassignment.newVehiclePlate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model:</span>
                  <span className="text-slate-700">{selectedDriver?.vehicleModel || reassignment.newVehicleModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rating & Cap:</span>
                  <span className="text-amber-600 font-semibold">★ {selectedDriver?.driverRating || 4.9} ({selectedDriver?.availableSeats || 4} seats open)</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7 & 8. ROUTE COMPARISON */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              7 & 8. Original vs New Optimized Route Manifests
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1 text-[11px] text-rose-700">Original Route (Driver 1)</div>
                <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                  {reassignment.routeSnapshotBefore.stops.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="text-slate-400">{idx + 1}.</span>
                      <span className={s.includes('Chandani') ? 'text-rose-600 font-bold line-through' : ''}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-slate-800 mb-1 text-[11px] text-emerald-700">Split Route (Driver 2 - Dedicated)</div>
                <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                  {reassignment.routeSnapshotAfter?.newDriverStops.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                      <span className="text-emerald-500">{idx + 1}.</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 9, 10, 11, 12, 13. TRAFFIC, ETAs & REASON */}
          <section className="p-4 rounded-xl bg-slate-900 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase">9. Traffic Severity</div>
                <div className="text-sm font-black text-rose-400 font-mono">{reassignment.trafficSeverity}</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase">10. Original ETA</div>
                <div className="text-sm font-black text-slate-200 font-mono">{reassignment.originalEtaMinutes} min</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase">11. Predicted Delay</div>
                <div className="text-sm font-black text-rose-400 font-mono">{reassignment.predictedEtaMinutes} min</div>
              </div>
              <div className="p-2 bg-white/10 rounded-lg">
                <div className="text-[10px] text-slate-400 uppercase">12. New ETA</div>
                <div className="text-sm font-black text-emerald-400 font-mono">{reassignment.newEtaMinutes || 6} min</div>
              </div>
            </div>

            <div className="text-xs border-t border-slate-800 pt-3">
              <div className="text-[10px] text-slate-400 uppercase font-semibold mb-1">13. Reassignment Reason</div>
              <p className="text-slate-200 leading-relaxed">{reassignment.reason}</p>
            </div>
          </section>

          {/* 14. DECISION EXPLANATION */}
          <section className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
              14. Reassignment Decision Explanation
            </h3>
            <div className="space-y-1 text-xs text-slate-700">
              {reassignment.decisionExplanation.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{exp}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 15 & 16. CANDIDATE DRIVERS & SELECTED DRIVER */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
              <span>15 & 16. Candidate Discovery ({reassignment.candidateDrivers.length} considered)</span>
              <span className="text-[11px] font-mono text-blue-700 font-semibold">Search Radius: {reassignment.searchRadiusKm} km</span>
            </h3>
            <div className="space-y-2">
              {reassignment.candidateDrivers.map(cand => (
                <div
                  key={cand.driverId}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                    cand.driverId === selectedDriver?.driverId
                      ? 'bg-emerald-50 border-emerald-300 font-bold'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">#{cand.driverId}</span>
                    <span className="text-slate-900">{cand.driverName}</span>
                    <span className="text-slate-500">({cand.vehicleModel})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-600 font-mono">{cand.distanceKm.toFixed(1)} km</span>
                    <span className="text-blue-700 font-mono font-bold">ETA: {cand.predictedEtaMinutes}m</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold">
                      Score: {cand.scoreBreakdown?.totalScore ?? 0}
                    </span>
                    {cand.driverId === selectedDriver?.driverId && (
                      <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">
                        SELECTED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 17. TRUSTPASS STATUS */}
          <section className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                17. TrustPass Multi-Factor Security Verification
              </div>
              <div className="text-xs font-semibold text-white">
                Verification ID: <span className="font-mono text-emerald-400">{reassignment.trustPassVerificationId}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Driver, Vehicle Plate & Geofence Validated via Dynamic OTP / QR Handshake
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                reassignment.trustPassStatus === 'VERIFIED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500'
              }`}>
                {reassignment.trustPassStatus === 'VERIFIED' ? 'TRUSTED PICKUP ✓' : 'TOKEN ACTIVE'}
              </span>
              {onVerifyTrustPass && reassignment.trustPassStatus !== 'VERIFIED' && (
                <button
                  onClick={onVerifyTrustPass}
                  className="block mt-2 text-[10px] font-bold text-emerald-400 underline cursor-pointer"
                >
                  Verify Now →
                </button>
              )}
            </div>
          </section>

          {/* 18 & 19. EMPLOYEE NOTIFICATION & DRIVER ACCEPTANCE */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-700 mb-1.5">18. Employee Notification</h4>
              <p className="text-slate-600 mb-2">
                "Due to heavy traffic on your current route, your pickup has been reassigned to Mohan Singh (Toyota Etios MH12EF9012). New ETA: 6 min."
              </p>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Sent via In-App, Push & WhatsApp
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <h4 className="font-bold text-slate-700 mb-1.5">19. Driver Acceptance State</h4>
              <div className="space-y-1 mb-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-700">{reassignment.driverResponse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="font-mono text-slate-700">{reassignment.driverResponseTimestamp || 'Pending'}</span>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Mode: DRIVER_ACCEPT
              </span>
            </div>
          </section>

          {/* 20. AUDIT TIMELINE */}
          <section className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              20. Immutable Audit Timeline ({reassignment.auditLog.length} events)
            </h3>
            <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
              {reassignment.auditLog.map(log => (
                <div key={log.id} className="relative text-xs">
                  <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{log.timestamp}</span>
                    <span className="font-bold text-slate-800 text-[11px]">{log.eventType}</span>
                    <span className="text-[10px] text-slate-400 font-medium">by {log.actor}</span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">{log.description}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex gap-2">
            {onManualOverride && (
              <button
                onClick={onManualOverride}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Control Tower Override
              </button>
            )}
            {onVerifyTrustPass && reassignment.trustPassStatus !== 'VERIFIED' && (
              <button
                onClick={onVerifyTrustPass}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>🛡️</span>
                <span>Authorize TrustPass Boarding</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
