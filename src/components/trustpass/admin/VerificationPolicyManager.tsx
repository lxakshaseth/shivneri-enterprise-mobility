import React, { useState } from 'react';
import { VerificationPolicyRule } from '../types';

export function VerificationPolicyManager() {
  const [policies, setPolicies] = useState<VerificationPolicyRule[]>([
    {
      id: 'POL-TP-01',
      name: 'Standard Daytime Fleet Policy',
      category: 'Standard Ride',
      requirements: ['Dynamic QR OR Single-use Ride OTP'],
      organization: 'All Organizations',
      shift: 'Day Shift',
      locationScope: 'Pune Metro Perimeter',
      employeeGroup: 'All Employees',
      rideType: 'Point-to-Point',
      riskLevel: 'Low',
      enforcementMode: 'FALLBACK_ALLOWED',
      active: true,
    },
    {
      id: 'POL-TP-02',
      name: 'Night Shift Female Employee Mandate',
      category: 'Night Ride',
      requirements: ['Dynamic QR', 'Ride OTP', '150m Pickup Geofence', 'Night Safety SMS Alert'],
      organization: 'All Organizations',
      shift: 'Night Shift (Graveyard)',
      locationScope: 'All Operating Zones',
      employeeGroup: 'Female Workforce',
      rideType: 'Shared Shuttle',
      riskLevel: 'High',
      enforcementMode: 'STRICT_BLOCK',
      active: true,
    },
    {
      id: 'POL-TP-03',
      name: 'Executive & High Security Transit',
      category: 'High Security Ride',
      requirements: ['Dynamic QR', 'Driver Identity Bio-match', 'Vehicle Decal Scan', '150m Geofence', 'BLE Proximity Radar'],
      organization: 'TCS Pune Campus',
      shift: 'All Shifts',
      locationScope: 'SEZ Campus & Hinjewadi Cluster',
      employeeGroup: 'VIP / Leadership',
      rideType: 'Point-to-Point',
      riskLevel: 'Critical',
      enforcementMode: 'STRICT_BLOCK',
      active: true,
    },
    {
      id: 'POL-TP-04',
      name: 'Emergency SOS / Fleet Breakdown Protocol',
      category: 'Emergency',
      requirements: ['Dispatcher Manual Override', 'SecOps Lead Dual-Sign Approval', 'Geo-Audited Override Window (5 min)'],
      organization: 'All Organizations',
      shift: 'All Shifts',
      locationScope: 'All Operating Zones',
      employeeGroup: 'All Employees',
      rideType: 'Ad-hoc',
      riskLevel: 'High',
      enforcementMode: 'MANUAL_ESCALATION',
      active: true,
    },
  ]);

  const [editingPolicy, setEditingPolicy] = useState<VerificationPolicyRule | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const togglePolicyActive = (id: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Standard Ride':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Night Ride':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'High Security Ride':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Emergency':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              VERIFICATION POLICY ENGINE
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              ABAC / RBAC Dynamic Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-factor context security requirements dynamically by Organization, Shift Window, Location Perimeter, Employee Group, and Risk Level.
          </p>
        </div>

        <button
          onClick={() => {
            const newPol: VerificationPolicyRule = {
              id: `POL-TP-0${policies.length + 1}`,
              name: 'New Custom Shift Security Rule',
              category: 'Standard Ride',
              requirements: ['Dynamic QR OR Single-use Ride OTP'],
              organization: 'Infosys BPM',
              shift: 'Evening',
              locationScope: 'Hinjewadi Phase 1 & 2',
              employeeGroup: 'All Employees',
              rideType: 'Shared Shuttle',
              riskLevel: 'Medium',
              enforcementMode: 'FALLBACK_ALLOWED',
              active: true,
            };
            setPolicies(prev => [newPol, ...prev]);
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
        >
          <span>＋</span> Add Verification Rule
        </button>
      </div>

      {/* 4 Core Configurable Profiles as Prompt Mandated */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Standard Ride */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Profile 1</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">STANDARD</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Standard Ride</h4>
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-900 font-semibold mb-3">
              Rule: <span className="font-mono text-blue-700">OTP OR QR</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Standard daytime transit. Allows rapid boarding with either dynamic encrypted QR or simple 4-digit ride OTP.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between mt-3">
            <span>Enforcement: Soft fallback</span>
            <span className="text-emerald-600 font-bold">Active ✓</span>
          </div>
        </div>

        {/* Night Ride */}
        <div className="bg-white rounded-2xl p-5 border border-purple-200 bg-purple-50/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-purple-600">Profile 2</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">NIGHT GUARD</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Night Ride</h4>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 font-semibold mb-3">
              Rule: <span className="font-mono text-purple-700">QR + OTP + Geofence</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mandatory dual-factor handshake plus 150m GPS geofence perimeter check for pickups between 20:00 - 06:00 IST.
            </p>
          </div>
          <div className="pt-3 border-t border-purple-100 text-[11px] text-purple-600 flex items-center justify-between mt-3">
            <span>Enforcement: Strict Block</span>
            <span className="text-purple-700 font-bold">Active ✓</span>
          </div>
        </div>

        {/* High Security Ride */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 bg-rose-50/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-rose-600">Profile 3</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">HIGH SECURITY</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">High Security Ride</h4>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-semibold mb-3">
              Rule: <span className="font-mono text-rose-700">QR + Driver ID + Vehicle + Geofence</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full 4-quadrant authentication including driver face biometrics and physical vehicle windshield decal verification.
            </p>
          </div>
          <div className="pt-3 border-t border-rose-100 text-[11px] text-rose-600 flex items-center justify-between mt-3">
            <span>Enforcement: Zero Tolerance</span>
            <span className="text-rose-700 font-bold">Active ✓</span>
          </div>
        </div>

        {/* Emergency */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 bg-amber-50/10 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-amber-600">Profile 4</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">EMERGENCY</span>
            </div>
            <h4 className="font-bold text-sm text-slate-900 mb-1">Emergency</h4>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-semibold mb-3">
              Rule: <span className="font-mono text-amber-700">Manual override + Security approval</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Crisis fail-safe protocol requiring SecOps approval with automatic 5-minute cryptographic expiration.
            </p>
          </div>
          <div className="pt-3 border-t border-amber-100 text-[11px] text-amber-600 flex items-center justify-between mt-3">
            <span>Enforcement: Dual Sign-off</span>
            <span className="text-amber-700 font-bold">Active ✓</span>
          </div>
        </div>

      </div>

      {/* Configurable Policy Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Active Verification Policies by Scope</h4>
            <p className="text-xs text-slate-500">Fine-grained access control rules applied at boarding moment</p>
          </div>
          <span className="text-xs font-mono text-slate-400">{policies.length} policies registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Policy & Profile</th>
                <th className="py-3 px-4">Required Credentials</th>
                <th className="py-3 px-4">Target Organization</th>
                <th className="py-3 px-4">Shift & Location</th>
                <th className="py-3 px-4">Employee Group</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {policies.map(pol => (
                <tr key={pol.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-900 block">{pol.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] text-slate-400">{pol.id}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${getCategoryColor(pol.category)}`}>
                        {pol.category}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {pol.requirements.map((req, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {req}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-800">
                    {pol.organization}
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-800 block font-medium">{pol.shift}</span>
                    <span className="text-[10px] text-slate-400 block">{pol.locationScope}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-700">
                    {pol.employeeGroup}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pol.riskLevel === 'Critical'
                          ? 'bg-red-100 text-red-800'
                          : pol.riskLevel === 'High'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {pol.riskLevel}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => togglePolicyActive(pol.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                        pol.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {pol.active ? 'ACTIVE' : 'DISABLED'}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Policy ${pol.id} configuration drawer opened.`)}
                      className="px-2 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Edit ⚙
                    </button>
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
