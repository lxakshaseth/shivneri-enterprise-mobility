import React, { useState, useMemo } from 'react';
import { TrustPassAuditEvent, TrustPassEventType } from '../types';

export const SEED_AUDIT_EVENTS: TrustPassAuditEvent[] = [
  {
    id: 'AUD-9917',
    eventType: 'SAFE_DROP_CONFIRMED',
    actor: 'Driver: Raj Kumar',
    actorRole: 'driver',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Safe-Drop Deboarding OTP',
    timestamp: '08:18:02',
    decision: 'ALLOW',
    reason: 'Employee validated safe drop arrival at Hinjewadi Phase 1 with OTP 5831',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-DROP',
    location: 'Hinjewadi Phase 1',
  },
  {
    id: 'AUD-9916',
    eventType: 'BOARDING_CONFIRMED',
    actor: 'Driver: Raj Kumar',
    actorRole: 'driver',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Dynamic QR + OTP',
    timestamp: '07:31:22',
    decision: 'ALLOW',
    reason: 'Mutual bilateral handshake verified. Passenger authorized to board.',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-BOARD',
    location: 'Kothrud Hub',
  },
  {
    id: 'AUD-9915',
    eventType: 'VERIFICATION_ALLOWED',
    actor: 'TrustPass Engine v4.2',
    actorRole: 'system',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Dynamic QR + OTP',
    timestamp: '07:31:21',
    decision: 'ALLOW',
    reason: '8-point matrix fully validated (Identity, Vehicle, Ride, Geofence, Time, Device, Policy)',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-DECISION',
    location: 'Kothrud Hub',
  },
  {
    id: 'AUD-9914',
    eventType: 'GEOFENCE_PASSED',
    actor: 'TrustPass Telemetry Worker',
    actorRole: 'system',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'GPS RTK',
    timestamp: '07:31:18',
    decision: 'ALLOW',
    reason: 'Driver & employee coordinates both within 42m of designated Kothrud pickup pin (<150m perimeter)',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-GEO',
    location: 'Kothrud Hub',
  },
  {
    id: 'AUD-9913',
    eventType: 'OTP_VERIFIED',
    actor: 'Employee: Akshat G.',
    actorRole: 'employee',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Ride OTP',
    timestamp: '07:31:14',
    decision: 'ALLOW',
    reason: '4-digit OTP 7429 successfully matched server seed hash',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-OTP',
  },
  {
    id: 'AUD-9912',
    eventType: 'QR_SCANNED',
    actor: 'Driver: Raj Kumar',
    actorRole: 'driver',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Dynamic QR',
    timestamp: '07:31:05',
    decision: 'ALLOW',
    reason: 'Driver camera decoded ECDSA signed token; token age 4.2s (Valid < 30s)',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-SCAN',
  },
  {
    id: 'AUD-9911',
    eventType: 'QR_GENERATED',
    actor: 'Employee: Akshat G.',
    actorRole: 'employee',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'Dynamic QR',
    timestamp: '07:31:00',
    decision: 'PENDING',
    reason: 'Dynamic cryptographic QR refreshed with seed seed-10421-0731',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-QRGEN',
  },
  {
    id: 'AUD-9910',
    eventType: 'VERIFICATION_STARTED',
    actor: 'Employee: Akshat G.',
    actorRole: 'employee',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    organization: 'TCS Pune Campus',
    method: 'App Init',
    timestamp: '07:30:45',
    decision: 'PENDING',
    reason: 'Employee clicked [ VERIFY PICKUP ] approaching Kothrud point',
    verificationId: 'VRF-928172',
    correlationId: 'CORR-RID10421-INIT',
  },
  {
    id: 'AUD-9909',
    eventType: 'VERIFICATION_DENIED',
    actor: 'TrustPass Engine v4.2',
    actorRole: 'system',
    rideId: 'RID-10422',
    employeeName: 'Neha Joshi',
    driverName: 'Vikram Singh (Unassigned)',
    vehiclePlate: 'MH12IJ7890',
    organization: 'Cognizant',
    method: 'Dynamic QR',
    timestamp: '07:32:04',
    decision: 'DENY',
    reason: 'Driver mismatch: scanned by DRV-992 (Vikram Singh) instead of assigned DRV-118 (Mohan Sharma)',
    verificationId: 'VRF-928173',
    correlationId: 'CORR-RID10422-FAIL',
    location: 'Magarpatta South Gate',
  },
  {
    id: 'AUD-9908',
    eventType: 'GEOFENCE_FAILED',
    actor: 'TrustPass Telemetry Worker',
    actorRole: 'system',
    rideId: 'RID-10424',
    employeeName: 'Priya Nair',
    driverName: 'Suresh Yadav',
    vehiclePlate: 'MH12CD5678',
    organization: 'Wipro Technologies',
    method: 'GPS RTK',
    timestamp: '07:34:10',
    decision: 'DENY',
    reason: 'Vehicle position at Wakad Bridge is 210m from authorized pickup point (>150m boundary)',
    verificationId: 'VRF-928175',
    correlationId: 'CORR-RID10424-GEOFAIL',
    location: 'Wakad Bridge',
  },
  {
    id: 'AUD-9907',
    eventType: 'MANUAL_OVERRIDE_APPROVED',
    actor: 'Super Admin: Akash Mehta',
    actorRole: 'admin',
    rideId: 'RID-10419',
    employeeName: 'Amit Shah',
    driverName: 'Sandeep Joshi',
    vehiclePlate: 'MH12OP1234',
    organization: 'Capgemini India',
    method: 'Admin Console',
    timestamp: '07:25:00',
    decision: 'MANUAL_APPROVAL',
    reason: 'Cellular dead zone in Punawale; driver verified employee physical corporate badge. 5-min auto-expire active.',
    verificationId: 'VRF-928170',
    correlationId: 'CORR-RID10419-OVR-APP',
  },
  {
    id: 'AUD-9906',
    eventType: 'MANUAL_OVERRIDE_REQUESTED',
    actor: 'Driver: Sandeep Joshi',
    actorRole: 'driver',
    rideId: 'RID-10419',
    employeeName: 'Amit Shah',
    driverName: 'Sandeep Joshi',
    vehiclePlate: 'MH12OP1234',
    organization: 'Capgemini India',
    method: 'Driver App Form',
    timestamp: '07:24:10',
    decision: 'PENDING',
    reason: 'Reason: Network unavailable under highway pass',
    verificationId: 'VRF-928170',
    correlationId: 'CORR-RID10419-OVR-REQ',
  },
  {
    id: 'AUD-9905',
    eventType: 'OTP_FAILED',
    actor: 'Driver Mobile Client',
    actorRole: 'driver',
    rideId: 'RID-10415',
    employeeName: 'Amit Shah',
    driverName: 'Mohan Sharma',
    vehiclePlate: 'MH12KL2345',
    organization: 'Capgemini India',
    method: 'Ride OTP',
    timestamp: '07:11:42',
    decision: 'DENY',
    reason: 'Invalid OTP code entered (Attempt 4 of 4); verification locked for 5 minutes',
    verificationId: 'VRF-928165',
    correlationId: 'CORR-RID10415-OTPFAIL',
  },
];

export function TrustPassAuditLogView() {
  const [events, setEvents] = useState<TrustPassAuditEvent[]>(SEED_AUDIT_EVENTS);
  const [selectedEventType, setSelectedEventType] = useState<string>('ALL');
  const [selectedDecision, setSelectedDecision] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<TrustPassAuditEvent | null>(null);

  // All 17 events listed in prompt
  const ALL_EVENT_TYPES: TrustPassEventType[] = [
    'VERIFICATION_STARTED',
    'QR_GENERATED',
    'QR_SCANNED',
    'OTP_SENT',
    'OTP_VERIFIED',
    'OTP_FAILED',
    'DRIVER_VERIFIED',
    'EMPLOYEE_VERIFIED',
    'VEHICLE_VERIFIED',
    'GEOFENCE_PASSED',
    'GEOFENCE_FAILED',
    'VERIFICATION_ALLOWED',
    'VERIFICATION_DENIED',
    'MANUAL_OVERRIDE_REQUESTED',
    'MANUAL_OVERRIDE_APPROVED',
    'BOARDING_CONFIRMED',
    'SAFE_DROP_CONFIRMED',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedEventType !== 'ALL' && e.eventType !== selectedEventType) return false;
      if (selectedDecision !== 'ALL' && e.decision !== selectedDecision) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          e.rideId.toLowerCase().includes(q) ||
          e.employeeName.toLowerCase().includes(q) ||
          e.driverName.toLowerCase().includes(q) ||
          e.verificationId.toLowerCase().includes(q) ||
          e.correlationId.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          (e.reason && e.reason.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, selectedEventType, selectedDecision, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Event Type', 'Ride ID', 'Employee', 'Driver', 'Vehicle', 'Organization', 'Method', 'Decision', 'Reason', 'Verification ID', 'Correlation ID'];
    const rows = filteredEvents.map(e => [
      e.timestamp,
      e.eventType,
      e.rideId,
      `"${e.employeeName}"`,
      `"${e.driverName}"`,
      e.vehiclePlate,
      `"${e.organization}"`,
      `"${e.method}"`,
      e.decision,
      `"${e.reason || ''}"`,
      e.verificationId,
      e.correlationId,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trustpass-audit-export-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getEventBadge = (eventType: TrustPassEventType) => {
    if (eventType.includes('CONFIRMED') || eventType.includes('ALLOWED') || eventType.includes('PASSED') || eventType.includes('APPROVED')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">{eventType}</span>;
    }
    if (eventType.includes('DENIED') || eventType.includes('FAILED')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 font-mono">{eventType}</span>;
    }
    if (eventType.includes('REQUESTED')) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">{eventType}</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">{eventType}</span>;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              ENTERPRISE AUDIT TRAIL & LEDGER
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
              17 Event Types Audited
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable, zero-trust audit trail tracking every verification step with actor attribution, cryptographic correlation IDs, and non-repudiation seals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span>⬇</span> Export Audit CSV
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <input
            type="text"
            placeholder="Search by Ride, Employee, Driver, Correlation ID, Reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div>
            <select
              value={selectedEventType}
              onChange={e => setSelectedEventType(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="ALL">All Event Types ({ALL_EVENT_TYPES.length})</option>
              {ALL_EVENT_TYPES.map(ev => (
                <option key={ev} value={ev}>{ev}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDecision}
              onChange={e => setSelectedDecision(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
            >
              <option value="ALL">All Decisions</option>
              <option value="ALLOW">ALLOW</option>
              <option value="DENY">DENY</option>
              <option value="PENDING">PENDING</option>
              <option value="MANUAL_APPROVAL">MANUAL_APPROVAL</option>
            </select>
          </div>

          {(selectedEventType !== 'ALL' || selectedDecision !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedEventType('ALL');
                setSelectedDecision('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset ✕
            </button>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp & Ride</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Employee / Driver</th>
                <th className="py-3 px-4">Decision & Reason</th>
                <th className="py-3 px-4">Verification / Correlation ID</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(event => (
                <tr key={event.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{event.rideId}</span>
                    <span className="font-mono text-[10px] text-slate-400">{event.timestamp}</span>
                  </td>

                  <td className="py-3 px-4">
                    {getEventBadge(event.eventType)}
                    <span className="block text-[10px] text-slate-500 mt-0.5">{event.method}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">{event.actor}</span>
                    <span className="text-[10px] text-slate-400 capitalize">{event.actorRole}</span>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{event.employeeName}</div>
                    <div className="text-[10px] text-slate-500">
                      Driver: {event.driverName} • <span className="font-mono">{event.vehiclePlate}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        event.decision === 'ALLOW'
                          ? 'bg-green-100 text-green-800'
                          : event.decision === 'DENY'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {event.decision}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-xs line-clamp-2">
                      {event.reason}
                    </p>
                  </td>

                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                    <span className="text-slate-800 font-semibold block">{event.verificationId}</span>
                    <span className="text-slate-400 block line-clamp-1">{event.correlationId}</span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      Audit Trail 🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Detail Inspector Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Cryptographic Event Record</h4>
                <span className="font-mono text-xs text-slate-400">{selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl font-mono text-slate-700 border border-slate-200">
              <div><strong className="text-slate-900">Event:</strong> {selectedEvent.eventType}</div>
              <div><strong className="text-slate-900">Timestamp:</strong> {selectedEvent.timestamp} IST</div>
              <div><strong className="text-slate-900">Ride:</strong> {selectedEvent.rideId}</div>
              <div><strong className="text-slate-900">Actor:</strong> {selectedEvent.actor} ({selectedEvent.actorRole})</div>
              <div><strong className="text-slate-900">Verification ID:</strong> {selectedEvent.verificationId}</div>
              <div><strong className="text-slate-900">Correlation ID:</strong> {selectedEvent.correlationId}</div>
              <div><strong className="text-slate-900">Organization:</strong> {selectedEvent.organization}</div>
              <div><strong className="text-slate-900">Decision:</strong> {selectedEvent.decision}</div>
              {selectedEvent.location && <div><strong className="text-slate-900">GPS Point:</strong> {selectedEvent.location}</div>}
              <div><strong className="text-slate-900">Reason:</strong> {selectedEvent.reason}</div>
            </div>

            <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900 text-slate-300 p-3 rounded-lg border border-slate-800">
              LEDGER_HASH: sha256:{selectedEvent.id}_{selectedEvent.correlationId}_9827fbc72
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
