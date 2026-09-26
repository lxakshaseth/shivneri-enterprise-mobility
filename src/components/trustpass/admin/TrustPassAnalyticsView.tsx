import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export function TrustPassAnalyticsView() {
  const [period, setPeriod] = useState<'Today' | '7 Days' | '30 Days'>('Today');

  // Exact verification method distribution from prompt
  const METHOD_DATA = [
    { name: 'Dynamic QR', value: 62, count: '796 rides', color: '#2563eb' },
    { name: 'OTP', value: 25, count: '321 rides', color: '#10b981' },
    { name: 'WhatsApp', value: 8, count: '103 rides', color: '#22c55e' },
    { name: 'Email', value: 3, count: '38 rides', color: '#f59e0b' },
    { name: 'NFC/BLE', value: 2, count: '26 rides', color: '#8b5cf6' },
  ];

  // Location performance metrics
  const LOCATION_DATA = [
    { location: 'Kothrud Hub', successRate: 98.4, totalRides: 312, avgTime: '6.4s' },
    { location: 'Hinjewadi Ph 1', successRate: 97.8, totalRides: 420, avgTime: '7.8s' },
    { location: 'Magarpatta City', successRate: 97.1, totalRides: 169, avgTime: '8.2s' },
    { location: 'Baner Rd', successRate: 96.9, totalRides: 198, avgTime: '8.6s' },
    { location: 'Wakad Bridge', successRate: 96.5, totalRides: 185, avgTime: '9.1s' },
  ];

  // Driver performance rankings
  const DRIVER_PERF = [
    { name: 'Raj Kumar', rides: 142, success: '99.8%', avgLatency: '5.2s', status: 'Top Rated ⭐' },
    { name: 'Ramesh Kumar', rides: 128, success: '99.2%', avgLatency: '6.1s', status: 'Compliant' },
    { name: 'Deepak Patil', rides: 119, success: '98.7%', avgLatency: '7.3s', status: 'Compliant' },
    { name: 'Arjun Nair', rides: 104, success: '97.5%', avgLatency: '8.4s', status: 'Compliant' },
    { name: 'Suresh Yadav', rides: 98, success: '95.1%', avgLatency: '11.8s', status: 'Coaching Req.' },
  ];

  // Vehicle fleet metrics
  const VEHICLE_PERF = [
    { plate: 'MH12 AB 1234', model: 'Toyota Innova Crysta', success: '100.0%', scans: 88, hardwareTrust: 'Verified' },
    { plate: 'MH12 EF 9012', model: 'Maruti Ertiga', success: '99.1%', scans: 74, hardwareTrust: 'Verified' },
    { plate: 'MH12 KL 2345', model: 'Force Urbania', success: '98.6%', scans: 140, hardwareTrust: 'Verified' },
    { plate: 'MH12 CD 5678', model: 'Tata Tigor EV', success: '96.2%', scans: 62, hardwareTrust: 'Audit Due' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              TRUSTPASS TELEMETRY & ANALYTICS
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Zero-Trust Verification Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Method distribution, handshake latencies, failure rates, driver adherence scores, and location heat maps.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['Today', '7 Days', '30 Days'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                period === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Verification Time
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1 text-blue-600">
            8 sec
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            -1.4s vs benchmark
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Success Rate
          </span>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-1">
            97.2%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            1,249 authorized
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Failure Rate
          </span>
          <div className="text-2xl font-black text-red-600 font-mono mt-1">
            2.8%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            35 blocked / denied
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Manual Override Rate
          </span>
          <div className="text-2xl font-black text-purple-600 font-mono mt-1">
            0.23%
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            3 admin sanctioned
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Night-Shift Success
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            99.1%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            Zero security breaches
          </span>
        </div>
      </div>

      {/* Verification Methods Breakdown: Charts & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Donut Chart & Legend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-slate-900">VERIFICATION METHODS DISTRIBUTION</h4>
              <span className="text-xs font-mono text-slate-400">Total: 1,284 Handshakes</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Share of cryptographic dynamic QR vs fallbacks (OTP, WhatsApp, Email, Hardware NFC/BLE)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-56 w-56 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={METHOD_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {METHOD_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 font-mono">62%</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Dynamic QR</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 space-y-2.5 w-full">
              {METHOD_DATA.map(m => (
                <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-xs font-bold text-slate-800">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-900">{m.value}%</span>
                    <span className="text-[10px] text-slate-400">({m.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between mt-4">
            <span>Primary Method: Dynamic QR (Tier-1 Cryptographic)</span>
            <span className="text-blue-600 font-medium">Auto-cascade active</span>
          </div>
        </div>

        {/* Verification by Location Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm text-slate-900">VERIFICATION BY LOCATION</h4>
              <span className="text-xs font-mono text-slate-400">Hub Compliance</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Geofence adherence and verification pass rate across top Pune pickup corridors
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LOCATION_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[90, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  formatter={(val: any) => [`${val}%`, 'Success Rate']}
                />
                <Bar dataKey="successRate" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-3 border-t border-slate-100 text-[10px] text-center text-slate-500">
            {LOCATION_DATA.map(l => (
              <div key={l.location}>
                <span className="font-bold text-slate-800 block">{l.successRate}%</span>
                <span className="text-slate-400">{l.avgTime}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Driver and Vehicle Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Verification by Driver */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Verification Adherence by Driver</h4>
            <span className="text-xs font-mono text-slate-400">Driver Matrix</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Driver</th>
                <th className="py-2.5 px-4 text-center">Rides Today</th>
                <th className="py-2.5 px-4 text-center">Handshake Latency</th>
                <th className="py-2.5 px-4 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DRIVER_PERF.map(d => (
                <tr key={d.name} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-semibold text-slate-800">
                    {d.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{d.status}</span>
                  </td>
                  <td className="py-2.5 px-4 text-center font-mono">{d.rides}</td>
                  <td className="py-2.5 px-4 text-center font-mono text-blue-600">{d.avgLatency}</td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600">{d.success}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verification by Vehicle */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h4 className="font-bold text-slate-900 text-sm">Verification Integrity by Vehicle</h4>
            <span className="text-xs font-mono text-slate-400">Fleet Registry</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Vehicle Plate</th>
                <th className="py-2.5 px-4">Model</th>
                <th className="py-2.5 px-4 text-center">Decal Scans</th>
                <th className="py-2.5 px-4 text-right">Match Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {VEHICLE_PERF.map(v => (
                <tr key={v.plate} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{v.plate}</td>
                  <td className="py-2.5 px-4 text-slate-600">{v.model}</td>
                  <td className="py-2.5 px-4 text-center font-mono">{v.scans}</td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="font-mono font-bold text-emerald-600">{v.success}</span>
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
