import React, { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export function FailedVerificationCenter() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Failure categories as requested
  const FAILURE_STATS = [
    { key: 'expired_qr', label: 'Expired QR', count: 21, color: '#f59e0b', severity: 'Medium', desc: 'Employee presented stale QR code (>30s)' },
    { key: 'network_failure', label: 'Network Failure', count: 18, color: '#64748b', severity: 'Low', desc: 'Cellular disconnect during handshake sync' },
    { key: 'wrong_driver', label: 'Wrong Driver', count: 12, color: '#ef4444', severity: 'High', desc: 'Unassigned driver attempted boarding scan' },
    { key: 'outside_geofence', label: 'Outside Geofence', count: 11, color: '#f97316', severity: 'Medium', desc: 'Boarding attempted >150m from designated point' },
    { key: 'wrong_vehicle', label: 'Wrong Vehicle', count: 8, color: '#dc2626', severity: 'High', desc: 'License plate did not match ride manifest' },
    { key: 'expired_otp', label: 'Expired OTP', count: 7, color: '#eab308', severity: 'Medium', desc: 'OTP code entered after 90s expiration' },
    { key: 'wrong_passenger', label: 'Wrong Passenger', count: 5, color: '#b91c1c', severity: 'Critical', desc: 'Passenger token belonged to different shift/route' },
    { key: 'device_mismatch', label: 'Device Mismatch', count: 3, color: '#8b5cf6', severity: 'High', desc: 'Device fingerprint failed cryptographic binding' },
  ];

  // Hourly trend data showing when failures occur
  const HOURLY_TREND = [
    { hour: '06:00', total: 4, qr: 1, driver: 0, network: 2, other: 1 },
    { hour: '07:00', total: 24, qr: 7, driver: 3, network: 6, other: 8 },
    { hour: '08:00', total: 28, qr: 8, driver: 5, network: 5, other: 10 },
    { hour: '09:00', total: 12, qr: 2, driver: 1, network: 3, other: 6 },
    { hour: '10:00', total: 3, qr: 1, driver: 0, network: 1, other: 1 },
    { hour: '12:00', total: 2, qr: 0, driver: 1, network: 0, other: 1 },
    { hour: '14:00', total: 4, qr: 1, driver: 0, network: 1, other: 2 },
    { hour: '16:00', total: 8, qr: 2, driver: 2, network: 2, other: 2 },
    { hour: '18:00', total: 19, qr: 5, driver: 3, network: 4, other: 7 },
    { hour: '19:00', total: 16, qr: 4, driver: 2, network: 3, other: 7 },
  ];

  // Detailed failed events table
  const RECENT_FAILED_EVENTS = [
    {
      id: 'FL-801',
      rideId: 'RID-10422',
      time: '07:32:04',
      reason: 'Wrong Driver',
      category: 'wrong_driver',
      driver: 'Vikram Singh (Unassigned)',
      vehicle: 'MH12IJ7890',
      passenger: 'Neha Joshi',
      location: 'Magarpatta South Gate',
      actionTaken: 'Ride locked; Dispatcher re-routed scheduled driver Mohan Sharma',
      status: 'BLOCKED',
    },
    {
      id: 'FL-802',
      rideId: 'RID-10418',
      time: '07:21:05',
      reason: 'Wrong Passenger',
      category: 'wrong_passenger',
      driver: 'Ramesh Kumar',
      vehicle: 'MH12AB1234',
      passenger: 'Tanvi Deshmukh',
      location: 'Hinjewadi Ph1',
      actionTaken: 'Boarding denied; passenger escorted to assigned Shuttle #4',
      status: 'BLOCKED',
    },
    {
      id: 'FL-803',
      rideId: 'RID-10424',
      time: '07:34:10',
      reason: 'Outside Geofence',
      category: 'outside_geofence',
      driver: 'Suresh Yadav',
      vehicle: 'MH12CD5678',
      passenger: 'Priya Nair',
      location: 'Wakad Bridge (210m off)',
      actionTaken: 'Driver instructed via app to proceed to exact pickup pin',
      status: 'PENDING',
    },
    {
      id: 'FL-804',
      rideId: 'RID-10411',
      time: '07:14:22',
      reason: 'Wrong Vehicle',
      category: 'wrong_vehicle',
      driver: 'Arjun Nair',
      vehicle: 'MH12ZZ9999 (Substitute)',
      passenger: 'Rahul Verma',
      location: 'Pimpri Chowk',
      actionTaken: 'Flagged fleet supervisor: vehicle substitution unapproved in portal',
      status: 'BLOCKED',
    },
    {
      id: 'FL-805',
      rideId: 'RID-10405',
      time: '07:05:40',
      reason: 'Expired QR',
      category: 'expired_qr',
      driver: 'Raj Kumar',
      vehicle: 'MH12AB1234',
      passenger: 'Akshat G.',
      location: 'Kothrud Hub',
      actionTaken: 'Autonomous fallback triggered: OTP validated in 6 seconds',
      status: 'RESOLVED_BY_FALLBACK',
    },
    {
      id: 'FL-806',
      rideId: 'RID-10398',
      time: '06:58:11',
      reason: 'Device Mismatch',
      category: 'device_mismatch',
      driver: 'Deepak Patil',
      vehicle: 'MH12EF9012',
      passenger: 'Devendra K.',
      location: 'Baner Rd',
      actionTaken: 'Secondary OTP requested via WhatsApp; corporate email verified',
      status: 'RESOLVED_BY_FALLBACK',
    },
  ];

  const totalFailures = FAILURE_STATS.reduce((acc, curr) => acc + curr.count, 0);

  const filteredEvents = selectedCategory
    ? RECENT_FAILED_EVENTS.filter(e => e.category === selectedCategory)
    : RECENT_FAILED_EVENTS;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              FAILED VERIFICATION CENTER
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
              {totalFailures} Failures Recorded Today
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry on boarding rejections, mismatched identifiers, protocol timeouts, and fallback recoveries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 rounded"
            >
              Clear Filter ✕
            </button>
          )}
          <button
            onClick={() => alert('Exporting failure forensics log (CSV)...')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ⬇ Export Incident Log
          </button>
        </div>
      </div>

      {/* Grid of 8 Failure Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {FAILURE_STATS.map(stat => (
          <div
            key={stat.key}
            onClick={() => setSelectedCategory(selectedCategory === stat.key ? null : stat.key)}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              selectedCategory === stat.key
                ? 'ring-2 ring-blue-500 bg-blue-50/30 border-blue-400 shadow-md'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: stat.color }} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {stat.severity}
              </span>
            </div>
            
            <div className="text-xl font-black text-slate-900 font-mono">
              {stat.count}
            </div>

            <div className="text-[11px] font-bold text-slate-700 mt-0.5 line-clamp-1">
              {stat.label}
            </div>

            <div className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
              {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section: Causes Distribution + Hourly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cause Distribution Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Failure Causes Breakdown</h4>
              <p className="text-xs text-slate-500">Distribution across protocol failure vectors</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Pareto Analysis</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={FAILURE_STATS}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 10, fill: '#475569' }}
                  width={95}
                />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any) => [`${val} occurrences`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {FAILURE_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Trend Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Hourly Failure Spike Trend</h4>
              <p className="text-xs text-slate-500">Correlated with peak morning (07:00-09:00) and evening shifts</p>
            </div>
            <span className="text-xs font-mono text-slate-400">Time-Series</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={HOURLY_TREND}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any) => [`${val} failures`, 'Total Failures']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  fill="url(#failGrad)"
                  name="Failures"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Forensic Failure Incident Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Forensic Incident Log</h4>
            <p className="text-xs text-slate-500">Chronological rejection audit with automated mitigation outcome</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredEvents.length} events listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Time & Ride</th>
                <th className="py-3 px-4">Failure Cause</th>
                <th className="py-3 px-4">Driver & Vehicle</th>
                <th className="py-3 px-4">Passenger & Location</th>
                <th className="py-3 px-4">Enforcement Action</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 block">{ev.rideId}</span>
                    <span className="font-mono text-[10px] text-slate-400">{ev.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-red-100 text-red-800 border border-red-200 inline-block">
                      {ev.reason}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{ev.driver}</div>
                    <span className="font-mono text-[10px] text-slate-500">{ev.vehicle}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{ev.passenger}</div>
                    <span className="text-[10px] text-slate-400">{ev.location}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] text-slate-600 block max-w-xs">{ev.actionTaken}</span>
                  </td>
                  <td className="py-3 px-4">
                    {ev.status === 'BLOCKED' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        🔴 BLOCKED
                      </span>
                    ) : ev.status === 'PENDING' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        🟠 PENDING
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        🟢 RECOVERED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
