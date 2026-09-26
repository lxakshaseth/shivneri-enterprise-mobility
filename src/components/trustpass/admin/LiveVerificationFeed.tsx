import React, { useState, useMemo } from 'react';
import { VerificationFeedItem } from '../types';

interface LiveVerificationFeedProps {
  onSelectVerification: (item: VerificationFeedItem) => void;
  statusFilter?: string;
}

export const INITIAL_FEED_ITEMS: VerificationFeedItem[] = [
  {
    id: 'FEED-001',
    time: '07:34',
    rideId: 'RID-10424',
    employeeName: 'Priya Nair',
    employeeOrg: 'Wipro Technologies',
    driverName: 'Suresh Yadav',
    vehiclePlate: 'MH12CD5678',
    location: 'Wakad Bridge',
    method: 'Dynamic QR',
    status: 'PENDING',
    failureReason: 'Outside geofence (210m away from pickup perimeter)',
    verificationId: 'VRF-928175',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: true,
      vehicle: true,
      ride: true,
      geofence: false,
      time: true,
      device: true,
      policy: true,
    },
    decision: 'FALLBACK_REQUIRED',
    timestamp: '07:34:10',
  },
  {
    id: 'FEED-002',
    time: '07:33',
    rideId: 'RID-10423',
    employeeName: 'Rahul Verma',
    employeeOrg: 'Infosys BPM',
    driverName: 'Deepak Patil',
    vehiclePlate: 'MH12EF9012',
    location: 'Baner Rd',
    method: 'OTP fallback',
    fallbackUsed: 'QR expired → WhatsApp OTP',
    status: 'VERIFIED',
    verificationId: 'VRF-928174',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: true,
      vehicle: true,
      ride: true,
      geofence: true,
      time: true,
      device: true,
      policy: true,
    },
    decision: 'ALLOW',
    timestamp: '07:33:45',
  },
  {
    id: 'FEED-003',
    time: '07:32',
    rideId: 'RID-10422',
    employeeName: 'Neha Joshi',
    employeeOrg: 'Cognizant',
    driverName: 'Vikram Singh (Unassigned)',
    vehiclePlate: 'MH12IJ7890',
    location: 'Magarpatta South Gate',
    method: 'Dynamic QR',
    status: 'BLOCKED',
    failureReason: 'Driver mismatch (Assigned: Mohan Sharma)',
    verificationId: 'VRF-928173',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: false,
      vehicle: false,
      ride: true,
      geofence: true,
      time: true,
      device: true,
      policy: false,
    },
    decision: 'DENY',
    timestamp: '07:32:04',
  },
  {
    id: 'FEED-004',
    time: '07:31',
    rideId: 'RID-10421',
    employeeName: 'Akshat G.',
    employeeOrg: 'TCS Pune Campus',
    driverName: 'Raj Kumar',
    vehiclePlate: 'MH12AB1234',
    location: 'Kothrud Hub',
    method: 'Dynamic QR + OTP',
    status: 'VERIFIED',
    verificationId: 'VRF-928172',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: true,
      vehicle: true,
      ride: true,
      geofence: true,
      time: true,
      device: true,
      policy: true,
    },
    decision: 'ALLOW',
    timestamp: '07:31:22',
  },
  {
    id: 'FEED-005',
    time: '07:28',
    rideId: 'RID-10420',
    employeeName: 'Sneha Kulkarni',
    employeeOrg: 'Cognizant',
    driverName: 'Arjun Nair',
    vehiclePlate: 'MH12GH3456',
    location: 'Pimpri Finolex Chowk',
    method: 'Dynamic QR',
    status: 'VERIFIED',
    verificationId: 'VRF-928171',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: true,
      vehicle: true,
      ride: true,
      geofence: true,
      time: true,
      device: true,
      policy: true,
    },
    decision: 'ALLOW',
    timestamp: '07:28:19',
  },
  {
    id: 'FEED-006',
    time: '07:25',
    rideId: 'RID-10419',
    employeeName: 'Amit Shah',
    employeeOrg: 'Capgemini India',
    driverName: 'Sandeep Joshi',
    vehiclePlate: 'MH12OP1234',
    location: 'Punawale Phata',
    method: 'WhatsApp OTP',
    status: 'OVERRIDDEN',
    fallbackUsed: 'Network timeout → Manual Security approval',
    failureReason: 'Cellular dead-zone',
    verificationId: 'VRF-928170',
    auditChecks: {
      employeeIdentity: true,
      driverIdentity: true,
      vehicle: true,
      ride: true,
      geofence: true,
      time: true,
      device: false,
      policy: true,
    },
    decision: 'MANUAL_APPROVAL',
    timestamp: '07:25:50',
  },
  {
    id: 'FEED-007',
    time: '07:21',
    rideId: 'RID-10418',
    employeeName: 'Tanvi Deshmukh',
    employeeOrg: 'TCS Pune Campus',
    driverName: 'Ramesh Kumar',
    vehiclePlate: 'MH12AB1234',
    location: 'Hinjewadi Ph1',
    method: 'Dynamic QR',
    status: 'FAILED',
    failureReason: 'Wrong Passenger: QR scan mismatch with dispatch passenger hash',
    verificationId: 'VRF-928169',
    auditChecks: {
      employeeIdentity: false,
      driverIdentity: true,
      vehicle: true,
      ride: false,
      geofence: true,
      time: true,
      device: true,
      policy: false,
    },
    decision: 'DENY',
    timestamp: '07:21:05',
  },
];

export function LiveVerificationFeed({ onSelectVerification, statusFilter }: LiveVerificationFeedProps) {
  const [feedItems, setFeedItems] = useState<VerificationFeedItem[]>(INITIAL_FEED_ITEMS);
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [selectedDriver, setSelectedDriver] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(statusFilter || 'ALL');
  const [selectedMethod, setSelectedMethod] = useState('ALL');
  const [selectedReason, setSelectedReason] = useState('ALL');

  // Sync if parent updates statusFilter
  React.useEffect(() => {
    if (statusFilter) {
      setSelectedStatus(statusFilter);
    }
  }, [statusFilter]);

  // Derived filter options
  const orgOptions = useMemo(() => ['ALL', ...new Set(feedItems.map(f => f.employeeOrg))], [feedItems]);
  const locationOptions = useMemo(() => ['ALL', ...new Set(feedItems.map(f => f.location))], [feedItems]);
  const driverOptions = useMemo(() => ['ALL', ...new Set(feedItems.map(f => f.driverName))], [feedItems]);
  const vehicleOptions = useMemo(() => ['ALL', ...new Set(feedItems.map(f => f.vehiclePlate))], [feedItems]);
  const methodOptions = useMemo(() => ['ALL', 'Dynamic QR', 'Dynamic QR + OTP', 'OTP fallback', 'WhatsApp OTP', 'Email OTP'], []);
  const reasonOptions = useMemo(() => [
    'ALL',
    'Driver mismatch',
    'Wrong Passenger',
    'Outside geofence',
    'QR expired',
    'Cellular dead-zone',
  ], []);

  // Filter items
  const filteredItems = useMemo(() => {
    return feedItems.filter(item => {
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'VERIFIED' && item.status !== 'VERIFIED') return false;
        if (selectedStatus === 'PENDING' && item.status !== 'PENDING') return false;
        if (selectedStatus === 'FAILED' && (item.status !== 'FAILED' && item.status !== 'BLOCKED')) return false;
        if (selectedStatus === 'OVERRIDDEN' && item.status !== 'OVERRIDDEN') return false;
      }
      if (selectedOrg !== 'ALL' && item.employeeOrg !== selectedOrg) return false;
      if (selectedLocation !== 'ALL' && item.location !== selectedLocation) return false;
      if (selectedDriver !== 'ALL' && item.driverName !== selectedDriver) return false;
      if (selectedVehicle !== 'ALL' && item.vehiclePlate !== selectedVehicle) return false;
      if (selectedMethod !== 'ALL' && !item.method.includes(selectedMethod)) return false;
      if (selectedReason !== 'ALL') {
        if (!item.failureReason || !item.failureReason.toLowerCase().includes(selectedReason.toLowerCase())) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.rideId.toLowerCase().includes(q) ||
          item.employeeName.toLowerCase().includes(q) ||
          item.driverName.toLowerCase().includes(q) ||
          item.vehiclePlate.toLowerCase().includes(q) ||
          item.verificationId.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [
    feedItems,
    selectedStatus,
    selectedOrg,
    selectedLocation,
    selectedDriver,
    selectedVehicle,
    selectedMethod,
    selectedReason,
    searchQuery,
  ]);

  // Simulate incoming live event
  const handleSimulateNewEvent = () => {
    const nextRideNum = Math.floor(10425 + Math.random() * 20);
    const newRideId = `RID-${nextRideNum}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newItem: VerificationFeedItem = {
      id: `FEED-${Date.now()}`,
      time: timeStr,
      rideId: newRideId,
      employeeName: 'Devika Sen',
      employeeOrg: 'Infosys BPM',
      driverName: 'Ramesh Kumar',
      vehiclePlate: 'MH12AB1234',
      location: 'Hinjewadi Gate 3',
      method: 'Dynamic QR + OTP',
      status: 'VERIFIED',
      verificationId: `VRF-${Math.floor(928180 + Math.random() * 1000)}`,
      auditChecks: {
        employeeIdentity: true,
        driverIdentity: true,
        vehicle: true,
        ride: true,
        geofence: true,
        time: true,
        device: true,
        policy: true,
      },
      decision: 'ALLOW',
      timestamp: `${timeStr}:${String(now.getSeconds()).padStart(2, '0')}`,
    };
    setFeedItems(prev => [newItem, ...prev]);
  };

  const resetFilters = () => {
    setSelectedOrg('ALL');
    setSelectedLocation('ALL');
    setSelectedDriver('ALL');
    setSelectedVehicle('ALL');
    setSelectedStatus('ALL');
    setSelectedMethod('ALL');
    setSelectedReason('ALL');
    setSearchQuery('');
  };

  const getStatusBadge = (item: VerificationFeedItem) => {
    switch (item.status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
            <span>🟢</span> VERIFIED
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200 animate-pulse">
            <span>🔴</span> BLOCKED
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
            <span>🔴</span> FAILED
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <span>🟠</span> PENDING
          </span>
        );
      case 'OVERRIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <span>🛡</span> OVERRIDDEN
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header with live ticker & simulation */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm tracking-wide">
              LIVE VERIFICATION FEED
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>STREAMING LIVE</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredItems.length} of {feedItems.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateNewEvent}
            className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <span>⚡</span> Simulate Verification Event
          </button>
          
          <button
            onClick={() => setIsLiveActive(!isLiveActive)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isLiveActive
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            {isLiveActive ? 'Live Sync: ON' : 'Live Sync: Paused'}
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-200 space-y-3">
        {/* Top search & quick status filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Search Ride, Employee, Driver, Plate or VRF ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'VERIFIED', 'PENDING', 'FAILED', 'OVERRIDDEN'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {(selectedOrg !== 'ALL' || selectedLocation !== 'ALL' || selectedDriver !== 'ALL' || selectedVehicle !== 'ALL' || selectedMethod !== 'ALL' || selectedReason !== 'ALL' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1"
            >
              Reset Filters ✕
            </button>
          )}
        </div>

        {/* Multi-dropdown Filter Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Organization</label>
            <select
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {orgOptions.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Location</label>
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {locationOptions.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Driver</label>
            <select
              value={selectedDriver}
              onChange={e => setSelectedDriver(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {driverOptions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {vehicleOptions.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Method</label>
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {methodOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Failure Reason</label>
            <select
              value={selectedReason}
              onChange={e => setSelectedReason(e.target.value)}
              className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700"
            >
              {reasonOptions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Feed list */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <span className="text-3xl block mb-2">🔍</span>
            <p className="text-sm font-semibold">No verification events match your filter criteria</p>
            <button
              onClick={resetFilters}
              className="mt-3 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectVerification(item)}
              className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-4 group"
            >
              {/* Left: Time & Ride */}
              <div className="flex items-center gap-3 min-w-[140px]">
                <div className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                  {item.time}
                </div>
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">
                    {item.rideId}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.verificationId}
                  </div>
                </div>
              </div>

              {/* Middle: People & Plate */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Employee</span>
                  <span className="font-semibold text-slate-800">{item.employeeName}</span>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">{item.employeeOrg}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Driver</span>
                  <span className="font-semibold text-slate-800">{item.driverName}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-100 rounded text-slate-600 border border-slate-200">
                      {item.vehiclePlate}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Method & Location</span>
                  <div className="font-medium text-slate-700">{item.method}</div>
                  <span className="text-[10px] text-slate-400 block line-clamp-1">{item.location}</span>
                </div>
              </div>

              {/* Failure / Warning note if any */}
              {item.failureReason && (
                <div className="hidden lg:block max-w-[220px] text-[11px] text-red-600 bg-red-50 p-1.5 rounded border border-red-100">
                  <span className="font-bold">Alert:</span> {item.failureReason}
                </div>
              )}

              {/* Right: Status Pill & Click indicator */}
              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(item)}
                <span className="text-slate-300 group-hover:text-blue-600 text-sm font-bold transition-colors">
                  →
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>Click any row to inspect complete 8-point cryptographic audit & issue verification receipt</span>
        <span className="font-mono text-[11px] text-slate-400">Shivneri TrustEngine v4.2 • Latency 8ms</span>
      </div>

    </div>
  );
}
