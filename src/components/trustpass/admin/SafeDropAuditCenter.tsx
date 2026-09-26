import React, { useState } from 'react';

export function SafeDropAuditCenter() {
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  const SAFE_DROP_RECORDS = [
    {
      id: 'SD-10421',
      rideId: 'RID-10421',
      employeeName: 'Akshat G.',
      employeeOrg: 'TCS Pune Campus',
      driverName: 'Raj Kumar',
      vehiclePlate: 'MH12AB1234',
      dropLocation: 'Hinjewadi Phase 1',
      dropTime: '08:18 AM',
      deboardingOtp: '5831',
      status: 'SAFE DROP VERIFIED ✓',
      verifiedBy: 'Driver Handshake OTP',
      nightShiftMandate: false,
      auditHash: 'SHA256:DROP-10421-5831-CONFIRMED',
      geofenceRadiusAtDrop: '12m from Hinjewadi Campus Gate',
    },
    {
      id: 'SD-10419',
      rideId: 'RID-10419',
      employeeName: 'Amit Shah',
      employeeOrg: 'Capgemini India',
      driverName: 'Sandeep Joshi',
      vehiclePlate: 'MH12OP1234',
      dropLocation: 'Magarpatta Tower 4',
      dropTime: '08:12 AM',
      deboardingOtp: '4092',
      status: 'SAFE DROP VERIFIED ✓',
      verifiedBy: 'Driver Handshake OTP',
      nightShiftMandate: false,
      auditHash: 'SHA256:DROP-10419-4092-CONFIRMED',
      geofenceRadiusAtDrop: '18m from Tower Drop Zone',
    },
    {
      id: 'SD-10410',
      rideId: 'RID-10410',
      employeeName: 'Priya Sharma',
      employeeOrg: 'TCS Pune Campus',
      driverName: 'Ramesh Kumar',
      vehiclePlate: 'MH12AB1234',
      dropLocation: 'Kothrud Residence Gate',
      dropTime: '06:45 AM (Night Shift)',
      deboardingOtp: '9120',
      status: 'SAFE DROP VERIFIED ✓',
      verifiedBy: 'Driver OTP + Security Gate Attendant',
      nightShiftMandate: true,
      auditHash: 'SHA256:DROP-10410-NIGHT-SECURE',
      geofenceRadiusAtDrop: '8m (Home Geofence Verified)',
    },
    {
      id: 'SD-10408',
      rideId: 'RID-10408',
      employeeName: 'Sneha Kulkarni',
      employeeOrg: 'Cognizant',
      driverName: 'Deepak Patil',
      vehiclePlate: 'MH12EF9012',
      dropLocation: 'Baner West',
      dropTime: '08:04 AM',
      deboardingOtp: '3318',
      status: 'SAFE DROP VERIFIED ✓',
      verifiedBy: 'Driver Handshake OTP',
      nightShiftMandate: false,
      auditHash: 'SHA256:DROP-10408-3318-CONFIRMED',
      geofenceRadiusAtDrop: '22m from Society Main Gate',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              SAFE-DROP AUDIT & ARRIVAL CONFIRMATION
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Trip Deboarding Assurance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero-Trust journey closure: verifies physical destination arrival through separate employee-generated deboarding OTP before trip completion is authorized.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200 font-bold">
            Safe Drop Compliance: 99.4%
          </div>
        </div>
      </div>

      {/* Featured Primary Safe Drop Record (Exact from prompt) */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-emerald-800/50 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 tracking-wider">
                  SAFE DROP VERIFIED ✓
                </span>
                <span className="font-mono text-xs text-emerald-300">
                  RID-10421
                </span>
              </div>
              <h4 className="text-lg font-bold text-white mt-1">
                Akshat G. — Safely Arrived at Hinjewadi Phase 1
              </h4>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Confirmation Time</div>
            <div className="text-xl font-mono font-bold text-emerald-400">08:18 AM</div>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10 text-xs">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Passenger</span>
            <span className="font-bold text-white text-sm">Akshat G.</span>
            <span className="text-[10px] text-slate-400 block">TCS Pune Campus</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Drop Destination</span>
            <span className="font-bold text-white text-sm">Hinjewadi Phase 1</span>
            <span className="text-[10px] text-emerald-400 block">Campus Gate 2 Geofence (12m)</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Driver & Cab</span>
            <span className="font-bold text-white text-sm">Raj Kumar</span>
            <span className="font-mono text-[10px] text-slate-300 block">MH12AB1234 (Toyota Innova)</span>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Deboarding OTP</span>
            <span className="font-mono font-bold text-emerald-300 text-sm tracking-widest">5831</span>
            <span className="text-[10px] text-slate-400 block">Bilateral verification verified</span>
          </div>
        </div>

        {/* Connected Audit Trail Hash */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Connected to Ride Audit Ledger: <strong className="text-slate-300">VRF-928172</strong></span>
          <span className="text-emerald-400">Zero-Trust Trip Closure Complete ✓</span>
        </div>
      </div>

      {/* Safe-Drop Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Real-Time Safe-Drop Telemetry Log</h4>
            <p className="text-xs text-slate-500">Destination arrivals verified via separate deboarding one-time tokens</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{SAFE_DROP_RECORDS.length} drops logged</span>
        </div>

        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Ride & Drop Time</th>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Driver & Vehicle</th>
              <th className="py-3 px-4">Drop Location</th>
              <th className="py-3 px-4 text-center">Deboarding OTP</th>
              <th className="py-3 px-4 text-right">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SAFE_DROP_RECORDS.map(rec => (
              <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4">
                  <span className="font-mono font-bold text-slate-900 block">{rec.rideId}</span>
                  <span className="font-mono text-[10px] text-slate-400">{rec.dropTime}</span>
                </td>

                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-800 block">{rec.employeeName}</span>
                  <span className="text-[10px] text-slate-400">{rec.employeeOrg}</span>
                </td>

                <td className="py-3 px-4">
                  <span className="text-slate-800 font-medium block">{rec.driverName}</span>
                  <span className="font-mono text-[10px] text-slate-500">{rec.vehiclePlate}</span>
                </td>

                <td className="py-3 px-4">
                  <span className="font-medium text-slate-800 block">{rec.dropLocation}</span>
                  <span className="text-[10px] text-slate-400">{rec.geofenceRadiusAtDrop}</span>
                </td>

                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-0.5 bg-slate-100 rounded font-mono font-bold text-slate-800 border border-slate-200">
                    {rec.deboardingOtp}
                  </span>
                </td>

                <td className="py-3 px-4 text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <span>✓</span> {rec.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
