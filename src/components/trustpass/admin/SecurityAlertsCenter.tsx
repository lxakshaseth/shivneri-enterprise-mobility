import React, { useState } from 'react';
import { SecurityAlert } from '../types';

export function SecurityAlertsCenter() {
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED'>('ALL');

  // Sample security alerts fulfilling prompt
  const [alerts, setAlerts] = useState<SecurityAlert[]>([
    {
      id: 'ALT-101',
      alertType: 'REPEATED_FAILED_VERIFICATION',
      severity: 'CRITICAL',
      rideId: 'RID-10421',
      employeeName: 'Akshat G.',
      driverName: 'Raj Kumar',
      vehiclePlate: 'MH12AB1234',
      location: 'Kothrud Hub (Near Gate 2)',
      attemptsCount: 5,
      reason: 'Wrong passenger / OTP mismatch (5 failed verification attempts)',
      timestamp: '07:31:15',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-102',
      alertType: 'DRIVER_MISMATCH',
      severity: 'HIGH',
      rideId: 'RID-10422',
      employeeName: 'Neha Joshi',
      driverName: 'Vikram Singh (Unassigned)',
      vehiclePlate: 'MH12IJ7890',
      location: 'Magarpatta South Gate',
      attemptsCount: 2,
      reason: 'Driver mismatch: Unauthorized replacement driver without transport supervisor approval',
      timestamp: '07:32:04',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-103',
      alertType: 'MULTIPLE_WRONG_PASSENGER',
      severity: 'CRITICAL',
      rideId: 'RID-10418',
      employeeName: 'Tanvi Deshmukh',
      driverName: 'Ramesh Kumar',
      vehiclePlate: 'MH12AB1234',
      location: 'Hinjewadi Ph1',
      attemptsCount: 4,
      reason: 'Multiple wrong-passenger attempts on high-security route',
      timestamp: '07:21:05',
      status: 'INVESTIGATING',
      assignedTo: 'Capt. Rao (Security Lead)',
    },
    {
      id: 'ALT-104',
      alertType: 'UNUSUAL_LOCATION',
      severity: 'HIGH',
      rideId: 'RID-10424',
      employeeName: 'Priya Nair',
      driverName: 'Suresh Yadav',
      vehiclePlate: 'MH12CD5678',
      location: 'Wakad Bridge (>200m from Geofence)',
      attemptsCount: 3,
      reason: 'Unusual verification location: Geofence violation attempt outside authorized zone',
      timestamp: '07:34:10',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-105',
      alertType: 'REPEATED_OTP_FAILURES',
      severity: 'MEDIUM',
      rideId: 'RID-10415',
      employeeName: 'Amit Shah',
      driverName: 'Mohan Sharma',
      vehiclePlate: 'MH12KL2345',
      location: 'Hadapsar IT Park',
      attemptsCount: 4,
      reason: 'Repeated OTP failures: 4 consecutive invalid OTP inputs within 60s',
      timestamp: '07:11:42',
      status: 'ACTIVE',
    },
    {
      id: 'ALT-106',
      alertType: 'MANUAL_OVERRIDE_SPIKE',
      severity: 'MEDIUM',
      rideId: 'FLEET-ZONE-EAST',
      employeeName: 'Multiple Employees',
      driverName: 'Zone 4 Fleet',
      vehiclePlate: 'Multiple Vehicles',
      location: 'Kharadi EON Cluster',
      attemptsCount: 7,
      reason: 'Manual override spikes: 5 manual override requests submitted within 10 minutes',
      timestamp: '07:05:19',
      status: 'INVESTIGATING',
      assignedTo: 'Network Ops Center',
    },
    {
      id: 'ALT-107',
      alertType: 'SUSPICIOUS_PATTERN',
      severity: 'HIGH',
      rideId: 'RID-10390',
      employeeName: 'Vikram Mehta',
      driverName: 'Deepak Patil',
      vehiclePlate: 'MH12EF9012',
      location: 'Baner High St',
      attemptsCount: 3,
      reason: 'Suspicious verification pattern: Simultaneous scan from two disparate GPS locations',
      timestamp: '06:45:22',
      status: 'RESOLVED',
      assignedTo: 'SecOps (Resolved: Ghost session cleared)',
    },
  ]);

  const handleResolveAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, status: 'RESOLVED' as const } : a))
    );
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(prev => prev ? { ...prev, status: 'RESOLVED' } : null);
    }
  };

  const handleAssignAlert = (alertId: string, assignee: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId ? { ...a, status: 'INVESTIGATING' as const, assignedTo: assignee } : a
      )
    );
    if (selectedAlert?.id === alertId) {
      setSelectedAlert(prev => prev ? { ...prev, status: 'INVESTIGATING', assignedTo: assignee } : null);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'ALL') return true;
    return a.status === activeTab;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase tracking-wider">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">HIGH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider">MEDIUM</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              SECURITY ALERTS & INCIDENT ROOM
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
              {alerts.filter(a => a.status === 'ACTIVE').length} Active Threats
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated anomaly detection across bilateral handshakes, suspicious patterns, credential brute-forcing, and policy breaches.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['ALL', 'ACTIVE', 'INVESTIGATING', 'RESOLVED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
              alert.severity === 'CRITICAL'
                ? 'border-red-300 ring-1 ring-red-200/50 bg-red-50/10'
                : alert.severity === 'HIGH'
                ? 'border-amber-300 ring-1 ring-amber-200/50'
                : 'border-slate-200'
            }`}
          >
            <div>
              {/* Alert Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚠</span>
                  <span className="text-xs font-black tracking-wider uppercase text-slate-900">
                    SECURITY ALERT
                  </span>
                </div>
                {getSeverityBadge(alert.severity)}
              </div>

              {/* Ride & Target */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-slate-900">{alert.rideId}</span>
                  <span className="text-[10px] font-mono text-slate-500">{alert.timestamp}</span>
                </div>
                <div className="text-xs text-slate-600 flex items-center justify-between">
                  <span>Pass: <strong className="text-slate-800">{alert.employeeName}</strong></span>
                  <span>Driver: <strong className="text-slate-800">{alert.driverName}</strong></span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {alert.vehiclePlate} • {alert.location}
                </div>
              </div>

              {/* Reason / Failure Detail */}
              <div className="mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Alert Details
                </div>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                  {alert.reason}
                </p>
                <div className="text-[11px] text-red-600 font-medium mt-1">
                  {alert.attemptsCount} failed verification attempts recorded
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="text-[10px] font-mono text-slate-400">
                {alert.status === 'RESOLVED' ? (
                  <span className="text-emerald-600 font-bold">✓ RESOLVED</span>
                ) : alert.status === 'INVESTIGATING' ? (
                  <span className="text-blue-600 font-bold">🔍 UNDER INVESTIGATION</span>
                ) : (
                  <span className="text-red-600 font-bold">🔴 ACTION REQUIRED</span>
                )}
              </div>

              <button
                onClick={() => setSelectedAlert(alert)}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1"
              >
                <span>[ INVESTIGATE ]</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Investigation Modal / Drawer */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 bg-red-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                  🚨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base tracking-wide uppercase">
                      INCIDENT INVESTIGATION
                    </h3>
                    <span className="text-xs bg-black/20 px-2 py-0.5 rounded font-mono">
                      {selectedAlert.id}
                    </span>
                  </div>
                  <p className="text-xs text-red-100 mt-0.5">
                    {selectedAlert.rideId} • {selectedAlert.reason}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-black/20 flex items-center justify-center transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Target overview */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Passenger</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedAlert.employeeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Driver</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedAlert.driverName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Vehicle</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAlert.vehiclePlate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Incident Coordinates</span>
                  <span className="text-slate-700">{selectedAlert.location}</span>
                </div>
              </div>

              {/* Forensic Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Chronological Telemetry Trail (5 Attempts)
                </h4>
                <div className="space-y-2 border-l-2 border-red-300 pl-3">
                  <div className="text-[11px]">
                    <span className="font-mono font-bold text-slate-800">07:30:12</span> — Initial QR Scan rejected: Token signature invalid or expired.
                  </div>
                  <div className="text-[11px]">
                    <span className="font-mono font-bold text-slate-800">07:30:28</span> — Retry 2: QR scan rejected: Driver app detected passenger hash mismatch.
                  </div>
                  <div className="text-[11px]">
                    <span className="font-mono font-bold text-slate-800">07:30:45</span> — Retry 3: Fallback OTP entered `8821` (Invalid code; expected `7429`).
                  </div>
                  <div className="text-[11px]">
                    <span className="font-mono font-bold text-slate-800">07:31:02</span> — Retry 4: OTP entered `7499` (Invalid code; 1 attempt remaining).
                  </div>
                  <div className="text-[11px] text-red-700 font-semibold">
                    <span className="font-mono font-bold text-red-800">07:31:15</span> — Attempt 5: Lockout threshold triggered. Driver boarding permanently blocked.
                  </div>
                </div>
              </div>

              {/* Recommended Security Actions */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
                  Immediate Containment Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => alert(`Calling Driver ${selectedAlert.driverName} on direct encrypted VoIP line...`)}
                    className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <span className="text-lg">📞</span>
                    <div>
                      <div className="font-bold text-slate-900">Call Driver</div>
                      <span className="text-[10px] text-slate-500">Direct audio bridge</span>
                    </div>
                  </button>

                  <button
                    onClick={() => alert(`Dispatching Shivneri Safety Escort to ${selectedAlert.location}...`)}
                    className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <span className="text-lg">🚔</span>
                    <div>
                      <div className="font-bold text-slate-900">Dispatch Patrol</div>
                      <span className="text-[10px] text-slate-500">Local emergency unit</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Ride ${selectedAlert.rideId} has been locked and removed from active rotation.`);
                      handleResolveAlert(selectedAlert.id);
                    }}
                    className="p-3 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <span className="text-lg">🔒</span>
                    <div>
                      <div className="font-bold text-red-900">Lock Ride & Re-route</div>
                      <span className="text-[10px] text-red-600">Cancel & replace cab</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleAssignAlert(selectedAlert.id, 'Senior Security Officer');
                      alert('Assigned to Senior Security Officer for investigation.');
                    }}
                    className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-left transition-colors flex items-center gap-2.5"
                  >
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="font-bold text-blue-900">Assign Officer</div>
                      <span className="text-[10px] text-blue-600">Escalate to SecOps lead</span>
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>

              <button
                onClick={() => {
                  handleResolveAlert(selectedAlert.id);
                  alert(`Alert ${selectedAlert.id} marked as RESOLVED.`);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <span>✓</span> Mark Incident Resolved
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
