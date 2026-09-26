// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DISPATCH ANALYTICS MODAL
// Enterprise Operational Intelligence, SLA Protection Metrics & Performance Analytics
// ============================================================================

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { DispatchAnalyticsKPIs } from '../../types/dispatch';

interface Props {
  kpis: DispatchAnalyticsKPIs;
  onClose: () => void;
}

const HOURLY_SAVED_DATA = [
  { hour: '06:00', saved: 8, breaches: 1 },
  { hour: '07:00', saved: 22, breaches: 2 },
  { hour: '08:00', saved: 48, breaches: 3 }, // Peak traffic shift
  { hour: '09:00', saved: 34, breaches: 2 },
  { hour: '10:00', saved: 15, breaches: 0 },
  { hour: '11:00', saved: 6, breaches: 0 },
];

const ROUTE_DISTRIBUTION_DATA = [
  { route: 'Kothrud ➔ Hinjewadi', reassignments: 42 },
  { route: 'Baner ➔ Hinjewadi', reassignments: 31 },
  { route: 'Aundh ➔ Magarpatta', reassignments: 26 },
  { route: 'Wakad ➔ Hinjewadi Ph3', reassignments: 18 },
  { route: 'Pimple Saudagar ➔ Baner', reassignments: 10 },
];

export function SmartDispatchAnalyticsModal({ kpis, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                Platform Intelligence
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-semibold">
                Live Stream
              </span>
            </div>
            <h2 className="text-base font-bold text-white">Smart Dynamic Dispatch & SLA Analytics</h2>
            <div className="text-xs text-slate-400">
              Corridor optimization, fleet response times and algorithmic protection KPIs
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* PRIMARY KPI BANNER: Pickups Saved From SLA Breach */}
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between gap-6 flex-wrap">
            <div>
              <div className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
                ⭐ PRIMARY DISPATCH KPI
              </div>
              <div className="text-4xl md:text-5xl font-black font-mono tracking-tight text-white mb-1">
                {kpis.pickupsSavedFromSlaBreach}
              </div>
              <div className="text-sm font-semibold text-emerald-100">
                Pickups Protected From SLA Breach This Week
              </div>
              <p className="text-xs text-emerald-200/80 mt-1 max-w-md">
                Autonomous candidate discovery and stop-level reassignment prevented {kpis.pickupsSavedFromSlaBreach} corporate passengers from missing their shift punch-in SLA.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-200 uppercase font-semibold">Avg ETA Saved</div>
                <div className="text-2xl font-black font-mono text-white">+{kpis.averageEtaImprovementMinutes}m</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="text-[10px] text-emerald-200 uppercase font-semibold">Acceptance Rate</div>
                <div className="text-2xl font-black font-mono text-white">{kpis.driverAcceptanceRatePct}%</div>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Reassignments Today</div>
              <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{kpis.totalReassignmentsToday}</div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">11 traffic · 3 availability</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Reassignment Time</div>
              <div className="text-xl font-black text-blue-700 font-mono mt-0.5">{kpis.averageReassignmentTimeSeconds}s</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Telemetry to driver offer</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">TrustPass Pass Rate</div>
              <div className="text-xl font-black text-emerald-600 font-mono mt-0.5">{kpis.trustPassSuccessRatePct}%</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">Tier-1 cryptographic security</div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Search Radius</div>
              <div className="text-xl font-black text-slate-800 font-mono mt-0.5">{kpis.averageSearchRadiusKm} km</div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">{kpis.averageCandidateCount} candidate pool</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pickups Protected by Hour */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Pickups Protected by Hour (Morning Peak)
              </div>
              <div className="text-[11px] text-slate-500 mb-3">
                Comparison of proactive reassignments vs prevented SLA breaches
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_SAVED_DATA}>
                    <defs>
                      <linearGradient id="colorSaved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" fontSize={10} stroke="#94a3b8" />
                    <YAxis fontSize={10} stroke="#94a3b8" />
                    <Tooltip />
                    <Area type="monotone" dataKey="saved" stroke="#10b981" fillOpacity={1} fill="url(#colorSaved)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reassignments by Corridor */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Reassignments by Pune Corridor
              </div>
              <div className="text-[11px] text-slate-500 mb-3">
                Highest traffic congestion hotspots triggering dynamic reassignment
              </div>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ROUTE_DISTRIBUTION_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" fontSize={10} stroke="#94a3b8" />
                    <YAxis dataKey="route" type="category" width={110} fontSize={9} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="reassignments" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Analytics View
          </button>
        </div>
      </div>
    </div>
  );
}
