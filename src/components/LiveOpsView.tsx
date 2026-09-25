import React, { useState, useEffect, useRef, Fragment } from 'react';

// ─── TYPES ─────────────────────────────────────────────────────────────────
export interface LiveRide {
  id: string;
  driver: string;
  vehicle: string;
  employees: number;
  eta: string;
  status: 'On Route' | 'Delayed' | 'SOS' | 'Assigned';
  pickup: string;
  drop: string;
  org: string;
  mapX: number; // percentage 0-100 on base map
  mapY: number; // percentage 0-100 on base map
  speed: number; // km/h
  heading: number; // degrees
  vehicleType: 'cab' | 'shuttle' | 'suv';
}

const SEED_RIDES: LiveRide[] = [
  { id: 'RIDE-10421', driver: 'Raj Kumar', vehicle: 'MH12AB1234', employees: 4, eta: '08 min', status: 'On Route', pickup: 'Kothrud', drop: 'Hinjewadi Ph1', org: 'TCS Pune', mapX: 24, mapY: 34, speed: 38, heading: 310, vehicleType: 'cab' },
  { id: 'RIDE-10422', driver: 'Suresh Yadav', vehicle: 'MH12CD5678', employees: 6, eta: '22 min', status: 'Delayed', pickup: 'Baner', drop: 'Hinjewadi Ph2', org: 'Infosys', mapX: 38, mapY: 38, speed: 14, heading: 290, vehicleType: 'suv' },
  { id: 'RIDE-10423', driver: 'Mohan Singh', vehicle: 'MH12EF9012', employees: 3, eta: '14 min', status: 'On Route', pickup: 'Aundh', drop: 'Magarpatta', org: 'Wipro', mapX: 62, mapY: 62, speed: 42, heading: 135, vehicleType: 'cab' },
  { id: 'RIDE-10438', driver: 'Arjun Nair', vehicle: 'MH12GH3456', employees: 7, eta: 'SOS!', status: 'SOS', pickup: 'Wakad', drop: 'Hinjewadi Ph3', org: 'Cognizant', mapX: 19, mapY: 28, speed: 0, heading: 270, vehicleType: 'suv' },
  { id: 'RIDE-10439', driver: 'Deepak Patel', vehicle: 'MH12IJ7890', employees: 5, eta: '31 min', status: 'Assigned', pickup: 'Pimple Saudagar', drop: 'Baner Rd', org: 'TCS Pune', mapX: 35, mapY: 26, speed: 25, heading: 215, vehicleType: 'cab' },
  { id: 'RIDE-10440', driver: 'Vikram Sharma', vehicle: 'MH12KL2345', employees: 14, eta: '11 min', status: 'On Route', pickup: 'Koregaon Park', drop: 'Hadapsar', org: 'TCS Pune', mapX: 74, mapY: 52, speed: 34, heading: 120, vehicleType: 'shuttle' },
  { id: 'RIDE-10441', driver: 'Priya Das', vehicle: 'MH12MN6789', employees: 4, eta: '06 min', status: 'On Route', pickup: 'Kothrud', drop: 'Baner', org: 'Infosys', mapX: 33, mapY: 50, speed: 45, heading: 340, vehicleType: 'cab' },
  { id: 'RIDE-10442', driver: 'Ravi Joshi', vehicle: 'MH12OP1234', employees: 5, eta: '28 min', status: 'Delayed', pickup: 'Aundh', drop: 'Viman Nagar', org: 'Wipro', mapX: 66, mapY: 42, speed: 12, heading: 85, vehicleType: 'suv' },
  { id: 'RIDE-10443', driver: 'Anita Kulkarni', vehicle: 'MH12QR5678', employees: 12, eta: '16 min', status: 'On Route', pickup: 'Pimpri', drop: 'Hinjewadi Ph2', org: 'Cognizant', mapX: 23, mapY: 21, speed: 40, heading: 240, vehicleType: 'shuttle' },
  { id: 'RIDE-10444', driver: 'Sanjay Patil', vehicle: 'MH12ST9012', employees: 4, eta: '09 min', status: 'On Route', pickup: 'Baner Rd', drop: 'Hinjewadi Ph1', org: 'TCS Pune', mapX: 29, mapY: 33, speed: 32, heading: 300, vehicleType: 'cab' },
  { id: 'RIDE-10445', driver: 'Ganesh More', vehicle: 'MH12UV3456', employees: 4, eta: '18 min', status: 'On Route', pickup: 'Viman Nagar', drop: 'Kharadi EON', org: 'Wipro', mapX: 84, mapY: 43, speed: 36, heading: 90, vehicleType: 'cab' },
  { id: 'RIDE-10446', driver: 'Ramesh Shinde', vehicle: 'MH12WX7890', employees: 8, eta: '04 min', status: 'On Route', pickup: 'Bhumkar Chowk', drop: 'TCS Sahyadri', org: 'TCS Pune', mapX: 21, mapY: 31, speed: 28, heading: 285, vehicleType: 'suv' },
];

const EVENTS_LOG = [
  { time: '08:42:14', color: 'text-red-400', bg: 'rgba(239,68,68,0.12)', icon: '🚨', msg: 'SOS Triggered — RIDE-10438', sub: 'Employee #10482 · Wakad Bypass' },
  { time: '08:38:00', color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', icon: '⏱️', msg: 'RIDE-10422 Delayed +12 min', sub: 'Heavy commute bottleneck · Baner junction' },
  { time: '08:35:10', color: 'text-emerald-400', bg: 'rgba(34,197,94,0.1)', icon: '✓', msg: 'RIDE-10421 — Pickup complete', sub: '4 employees boarded · Kothrud depot' },
  { time: '08:30:22', color: 'text-blue-400', bg: 'rgba(96,165,250,0.1)', icon: '🚘', msg: 'RIDE-10439 Driver confirmed', sub: 'Deepak Patel (MH12 IJ 7890) on route' },
  { time: '08:28:45', color: 'text-cyan-400', bg: 'rgba(34,211,238,0.1)', icon: '📍', msg: 'RIDE-10443 En route to Hinjewadi', sub: 'Pimpri MIDC → Hinjewadi Phase 2' },
  { time: '08:22:18', color: 'text-emerald-400', bg: 'rgba(34,197,94,0.1)', icon: '✓', msg: 'RIDE-10415 Trip complete', sub: 'Infosys Phase 1 · 6 employees dropped' },
  { time: '08:18:05', color: 'text-amber-400', bg: 'rgba(245,158,11,0.1)', icon: '⚠️', msg: 'Harsh braking detected', sub: 'Cab MH12 EF 9012 · University flyover' },
];

// ─── PUNE GIS LANDMARKS & DISTRICT COORDINATES ─────────────────────────────
const PUNE_ZONES = [
  { id: 'hinjewadi-ph1', name: 'HINJEWADI PH 1', sub: 'TCS Sahyadri / Infosys', x: 180, y: 280, type: 'tech' },
  { id: 'hinjewadi-ph2', name: 'HINJEWADI PH 2', sub: 'Wipro / Tech M', x: 140, y: 320, type: 'tech' },
  { id: 'hinjewadi-ph3', name: 'HINJEWADI PH 3', sub: 'Cognizant / Megapolis', x: 100, y: 360, type: 'tech' },
  { id: 'wakad', name: 'WAKAD', sub: 'Bhumkar Chowk / NH48', x: 260, y: 290, type: 'residential' },
  { id: 'pimpri', name: 'PIMPRI - CHINCHWAD', sub: 'MIDC Auto Cluster', x: 300, y: 160, type: 'industrial' },
  { id: 'aundh', name: 'AUNDH', sub: 'Bremen Chowk / River', x: 420, y: 310, type: 'residential' },
  { id: 'baner', name: 'BANER', sub: 'High Street / Bypass', x: 370, y: 365, type: 'residential' },
  { id: 'univ', name: 'PUNE UNIVERSITY', sub: 'Ganeshkhind Reserve', x: 480, y: 370, type: 'park' },
  { id: 'sb-road', name: 'SENAPATI BAPAT RD', sub: 'ICC Tech Towers', x: 520, y: 430, type: 'commercial' },
  { id: 'shv-ngr', name: 'SHIVAJI NAGAR', sub: 'Central Transit Interchange', x: 580, y: 410, type: 'hub' },
  { id: 'deccan', name: 'DECCAN GYMKHANA', sub: 'FC Road / Mutha River', x: 560, y: 490, type: 'commercial' },
  { id: 'kothrud', name: 'KOTHRUD', sub: 'Chandani Chowk / Paud', x: 430, y: 560, type: 'residential' },
  { id: 'airport', name: 'PUNE AIRPORT (PNQ)', sub: 'Lohegaon Apron & Runway', x: 790, y: 250, type: 'airport' },
  { id: 'viman-ngr', name: 'VIMAN NAGAR', sub: 'Phoenix Mall / Symbiosis', x: 770, y: 350, type: 'commercial' },
  { id: 'kalyani', name: 'KALYANI NAGAR', sub: 'East Riverbank Tech', x: 730, y: 410, type: 'commercial' },
  { id: 'krg-park', name: 'KOREGAON PARK', sub: 'North Main Road', x: 690, y: 460, type: 'park' },
  { id: 'magarpatta', name: 'MAGARPATTA CITY', sub: 'Cybercity IT Campus', x: 820, y: 560, type: 'tech' },
  { id: 'kharadi', name: 'KHARADI EON', sub: 'World Trade Center', x: 910, y: 410, type: 'tech' },
  { id: 'hadapsar', name: 'HADAPSAR', sub: 'Industrial Belt', x: 840, y: 640, type: 'industrial' },
];

export default function LiveOpsView() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'trips' | 'events'>('trips');
  const [showSosModal, setShowSosModal] = useState(false);
  const [filterOrg, setFilterOrg] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  // Map Navigation & Layers State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Map Feature Layer Toggles
  const [showTraffic, setShowTraffic] = useState(true);
  const [showTechHubs, setShowTechHubs] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [mapStyle, setMapStyle] = useState<'dark-ops' | 'satellite-contrast'>('dark-ops');

  // Simulation loop for live vehicle movement
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  // Filtered vehicles
  const ALL_VEHICLES = SEED_RIDES;
  const ORG_OPTIONS = ['All', 'TCS Pune', 'Infosys', 'Wipro', 'Cognizant'];
  const filteredVehicles = ALL_VEHICLES.filter((r) => {
    const matchOrg = filterOrg === 'All' || r.org === filterOrg;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchOrg && matchStatus;
  });

  const selectedRide = ALL_VEHICLES.find((r) => r.id === selectedId);

  // Status color mapper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SOS':
        return '#ef4444';
      case 'Delayed':
        return '#f59e0b';
      case 'Assigned':
        return '#60a5fa';
      default:
        return '#22c55e';
    }
  };

  // Realistic vehicle telemetry positioning
  const getVehiclePosition = (ride: LiveRide) => {
    const baseSpeed = ride.status === 'On Route' ? 0.35 : ride.status === 'Delayed' ? 0.08 : 0;
    const phase = ride.mapX * 0.15 + ride.mapY * 0.11;
    const offsetX = Math.sin(tick * baseSpeed + phase) * 1.6;
    const offsetY = Math.cos(tick * baseSpeed * 0.8 + phase) * 1.1;

    // Convert percentage to SVG viewBox coordinates (1200 x 800)
    const svgX = (ride.mapX / 100) * 1200 + offsetX * 12;
    const svgY = (ride.mapY / 100) * 800 + offsetY * 8;

    return { x: svgX, y: svgY, pctX: ride.mapX + offsetX, pctY: ride.mapY + offsetY };
  };

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.75, +(prev + delta).toFixed(2))));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedId(null);
    setTracking(null);
  };

  const handleFocusRegion = (region: 'hinjewadi' | 'central' | 'east') => {
    if (region === 'hinjewadi') {
      setZoomLevel(1.6);
      setPanOffset({ x: 260, y: 140 });
    } else if (region === 'central') {
      setZoomLevel(1.5);
      setPanOffset({ x: -40, y: -60 });
    } else {
      setZoomLevel(1.5);
      setPanOffset({ x: -320, y: 60 });
    }
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicked directly on map canvas
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'map-canvas-container') {
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Glass style generator
  const glassPanel = (opacity = 0.88): React.CSSProperties => ({
    background: `rgba(9, 18, 36, ${opacity})`,
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
  });

  return (
    <div
      className="flex flex-col h-full w-full select-none overflow-hidden relative"
      style={{ background: '#040914' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      {/* ─── TOP KPI DISPATCH BAR ───────────────────────────────────────── */}
      <header
        className="flex items-center gap-3 px-5 py-2.5 z-30 flex-shrink-0"
        style={{
          background: 'rgba(7, 15, 30, 0.98)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}>
        {/* Brand & Live Ops Pulse */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black text-white tracking-wider uppercase flex items-center gap-1.5">
              <span>LIVE OPS</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PUNE GIS
              </span>
            </div>
            <div className="text-[10px] text-slate-400">Fleet Dispatch Command</div>
          </div>
        </div>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Real-time KPI Metric Pills */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[
            { label: 'Active Trips', val: '247', change: '+12 this hr', color: '#22c55e', pulse: false },
            { label: 'Delayed Commutes', val: '18', change: 'avg +14m', color: '#f59e0b', pulse: false },
            { label: 'SOS Emergencies', val: '2', change: 'Action Needed', color: '#ef4444', pulse: true },
            { label: 'Drivers Online', val: '389', change: 'of 412 shift', color: '#60a5fa', pulse: false },
            { label: 'Punctuality', val: '91.4%', change: 'vs 89% target', color: '#34d399', pulse: false },
            { label: 'Fleet Active', val: '74%', change: '663 of 896', color: '#a78bfa', pulse: false },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all"
              style={{
                background: kpi.pulse ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                borderColor: kpi.pulse ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.06)',
              }}>
              {kpi.pulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-bold font-mono" style={{ color: kpi.color }}>
                    {kpi.val}
                  </span>
                  <span className="text-[9px] text-slate-400">{kpi.change}</span>
                </div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Filter Buttons */}
        <div className="ml-auto flex items-center gap-2">
          <div
            className="flex gap-1 rounded-xl p-0.5 border"
            style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            {['All', 'On Route', 'Delayed', 'SOS', 'Assigned'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all"
                style={
                  filterStatus === s
                    ? {
                        background:
                          s === 'SOS'
                            ? '#dc2626'
                            : s === 'Delayed'
                            ? '#d97706'
                            : 'linear-gradient(135deg, #1d4ed8, #0891b2)',
                        color: '#ffffff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }
                    : { color: '#94a3b8' }
                }>
                {s}
              </button>
            ))}
          </div>

          {/* ─── FIXED CUSTOM DROPDOWN (Resolves Screenshot 2 White-on-White Bug) ─── */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-colors"
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
              }}>
              <span className="text-slate-400">Org:</span>
              <span className="font-semibold text-cyan-300">{filterOrg}</span>
              <span className="text-[9px] text-slate-400 ml-1">▼</span>
            </button>

            {isOrgDropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border shadow-2xl py-1 z-50 dialog-in"
                style={{
                  background: '#0b162c',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                }}>
                <div className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Corporate Tenant
                </div>
                {ORG_OPTIONS.map((orgName) => (
                  <button
                    key={orgName}
                    onClick={() => {
                      setFilterOrg(orgName);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors ${
                      filterOrg === orgName
                        ? 'bg-blue-600/30 text-cyan-300'
                        : 'text-slate-100 hover:bg-slate-800 hover:text-white'
                    }`}>
                    <span>{orgName}</span>
                    {filterOrg === orgName && <span className="text-cyan-400 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN MAP CANVAS WRAPPER ────────────────────────────────────── */}
      <div id="map-canvas-container" className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
        {/* SVG REALISTIC PUNE VECTOR MAP */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}>
          <svg
            className="w-full h-full min-w-[1200px] min-h-[800px]"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* GIS Terrain & Glow Gradients */}
              <linearGradient id="mulaMuthaRiverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#083344" />
                <stop offset="45%" stopColor="#0e7490" />
                <stop offset="65%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>

              <radialGradient id="puneNightGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0d2342" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#081426" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#040914" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="hinjewadiHubGlow" cx="22%" cy="33%" r="20%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#081426" stopOpacity="0" />
              </radialGradient>

              {/* Grid texture pattern for authentic GIS appearance */}
              <pattern id="gisGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" strokeWidth="0.8" />
              </pattern>

              {/* Filter glow for active highway lighting */}
              <filter id="highwayGlow">
                <feGaussianBlur stdDeviation="2.5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base GIS Cartography Layers */}
            <rect width="1200" height="800" fill="#040914" />
            <rect width="1200" height="800" fill="url(#gisGrid)" />

            {/* Metro Center Ambient Light */}
            <circle cx="560" cy="440" r="420" fill="url(#puneNightGlow)" />
            <circle cx="240" cy="310" r="280" fill="url(#hinjewadiHubGlow)" />

            {/* ─── REAL URBAN SECTORS & CITY BLOCKS (Urban Fabric) ─── */}
            <g opacity={mapStyle === 'satellite-contrast' ? '0.2' : '0.12'}>
              {/* Pimpri MIDC Grid */}
              <rect x="230" y="110" width="160" height="80" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
              {/* Hinjewadi IT Park Ph1/2/3 Parcels */}
              <polygon points="120,250 250,220 230,360 90,380" fill="#0369a1" opacity="0.18" stroke="#38bdf8" strokeWidth="0.8" />
              {/* University Green Reserve */}
              <ellipse cx="480" cy="370" rx="55" ry="35" fill="#14532d" opacity="0.3" stroke="#22c55e" strokeWidth="0.8" />
              {/* Vetal Tekdi Hill Reserve */}
              <ellipse cx="440" cy="480" rx="45" ry="25" fill="#14532d" opacity="0.25" stroke="#22c55e" strokeWidth="0.8" />
              {/* Magarpatta Circular Cybercity */}
              <circle cx="820" cy="560" r="48" fill="#1e1b4b" opacity="0.35" stroke="#6366f1" strokeWidth="1.2" strokeDasharray="6 4" />
              {/* Kharadi EON IT Park */}
              <rect x="880" y="380" width="70" height="60" rx="8" fill="#0284c7" opacity="0.2" stroke="#38bdf8" strokeWidth="0.8" />
            </g>

            {/* ─── PUNE AIRPORT RUNWAY (PNQ / Lohegaon Air Base) ─── */}
            <g opacity="0.75">
              {/* Main Runway 28/10 */}
              <line x1="720" y1="230" x2="880" y2="280" stroke="#475569" strokeWidth="8" strokeLinecap="round" />
              <line x1="720" y1="230" x2="880" y2="280" stroke="#f8fafc" strokeWidth="1.2" strokeDasharray="12 8" opacity="0.7" />
              {/* Terminal Apron */}
              <polygon points="780,240 820,252 815,225 785,215" fill="#334155" stroke="#64748b" strokeWidth="0.8" />
              <text x="800" y="210" fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="700">PNQ AIRPORT</text>
            </g>

            {/* ─── REAL MULA-MUTHA RIVER NETWORK WITH AUTHENTIC CURVES ─── */}
            <g id="pune-rivers">
              {/* Pavana River (North) */}
              <path
                d="M 160,80 Q 240,110 320,130 Q 380,150 430,220"
                fill="none"
                stroke="url(#mulaMuthaRiverGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Mula River (Wakad -> Aundh -> Sangam Bridge) */}
              <path
                d="M 120,290 Q 180,270 240,310 Q 300,350 380,310 Q 430,270 490,320 Q 530,360 580,390"
                fill="none"
                stroke="url(#mulaMuthaRiverGrad)"
                strokeWidth="11"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Mutha River (Deccan -> Shivaji Nagar -> Sangam Bridge) */}
              <path
                d="M 380,680 Q 460,590 520,530 Q 560,480 580,390"
                fill="none"
                stroke="url(#mulaMuthaRiverGrad)"
                strokeWidth="9"
                strokeLinecap="round"
                opacity="0.8"
              />

              {/* Confluence (Sangam) -> East (Bund Garden -> Koregaon Park -> Kharadi) */}
              <path
                d="M 580,390 Q 640,380 700,430 Q 760,460 840,410 Q 920,380 1060,390"
                fill="none"
                stroke="url(#mulaMuthaRiverGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* River water core highlights */}
              <path
                d="M 120,290 Q 180,270 240,310 Q 300,350 380,310 Q 430,270 490,320 Q 530,360 580,390 Q 640,380 700,430 Q 760,460 840,410 Q 920,380 1060,390"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                opacity="0.4"
              />

              {/* Bridges Across River */}
              {[
                { x1: 235, y1: 298, x2: 245, y2: 320, name: 'Wakad Bridge' },
                { x1: 375, y1: 300, x2: 385, y2: 322, name: 'Aundh Bridge' },
                { x1: 575, y1: 380, x2: 585, y2: 400, name: 'Sangam Bridge' },
                { x1: 690, y1: 420, x2: 705, y2: 440, name: 'Bund Garden' },
                { x1: 835, y1: 400, x2: 845, y2: 422, name: 'Mundhwa Bridge' },
              ].map((bridge, bIdx) => (
                <line
                  key={bIdx}
                  x1={bridge.x1}
                  y1={bridge.y1}
                  x2={bridge.x2}
                  y2={bridge.y2}
                  stroke="#f8fafc"
                  strokeWidth="3.5"
                  opacity="0.8"
                />
              ))}
            </g>

            {/* ─── REAL HIGHWAY NETWORK & MAJOR EXPRESSWAYS ─── */}
            <g id="pune-highways">
              {/* Outer Ring Road Draft */}
              <ellipse
                cx="580"
                cy="440"
                rx="490"
                ry="330"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="2"
                strokeDasharray="8 6"
                opacity="0.6"
              />

              {/* 1. Mumbai-Pune Expressway & NH 48 (Western Bypass) */}
              <path
                d="M 60,110 Q 170,180 230,270 Q 280,360 360,440 Q 420,530 460,670 Q 500,740 560,780"
                fill="none"
                stroke="#0f2648"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d="M 60,110 Q 170,180 230,270 Q 280,360 360,440 Q 420,530 460,670 Q 500,740 560,780"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#highwayGlow)"
              />
              <path
                d="M 60,110 Q 170,180 230,270 Q 280,360 360,440 Q 420,530 460,670 Q 500,740 560,780"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="14 10"
                opacity="0.8"
              />

              {/* 2. Old Mumbai-Pune Highway (NH 60 - Nigdi to Shivaji Nagar) */}
              <path
                d="M 270,80 Q 320,180 430,280 Q 510,340 580,410"
                fill="none"
                stroke="#0f2648"
                strokeWidth="8"
              />
              <path
                d="M 270,80 Q 320,180 430,280 Q 510,340 580,410"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                opacity="0.9"
              />

              {/* 3. Ahmednagar Road (MH SH 27 - Shivaji Nagar to Wagholi) */}
              <path
                d="M 580,410 Q 670,360 770,340 Q 880,330 1080,310"
                fill="none"
                stroke="#0f2648"
                strokeWidth="8"
              />
              <path
                d="M 580,410 Q 670,360 770,340 Q 880,330 1080,310"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                opacity="0.9"
              />

              {/* 4. Solapur Highway (NH 65 - Swargate to Hadapsar / Magarpatta) */}
              <path
                d="M 580,510 Q 690,540 810,560 Q 930,590 1080,630"
                fill="none"
                stroke="#0f2648"
                strokeWidth="8"
              />
              <path
                d="M 580,510 Q 690,540 810,560 Q 930,590 1080,630"
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                opacity="0.9"
              />

              {/* 5. Hinjewadi Tech Park Arterial Corridor (Spine Road) */}
              <path
                d="M 230,270 Q 180,280 140,320 Q 100,360 60,410"
                fill="none"
                stroke="#0891b2"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* 6. Ganeshkhind & Senapati Bapat Ring */}
              <path
                d="M 370,365 Q 430,360 480,370 Q 540,380 580,410"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="3"
              />
              <path
                d="M 480,370 Q 520,430 560,490"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="2.5"
              />

              {/* 7. Karve Road & Paud Road */}
              <path
                d="M 560,490 Q 480,520 430,560"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="3"
              />
            </g>

            {/* ─── LIVE TRAFFIC CONGESTION HEATMAP OVERLAY ─── */}
            {showTraffic && (
              <g id="traffic-overlay">
                {/* Wakad Flyover & Bhumkar Chowk (Heavy Morning Rush - Red) */}
                <path
                  d="M 215,250 Q 230,270 245,290"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.9"
                  filter="url(#highwayGlow)"
                />
                <circle cx="230" cy="270" r="14" fill="#ef4444" opacity="0.25" className="pulse-dot" />

                {/* Chandani Chowk / Kothrud interchange (Medium Congestion - Amber) */}
                <path
                  d="M 395,480 Q 410,500 425,525"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  opacity="0.85"
                />

                {/* Shivaji Nagar Junction (Moderate Traffic - Amber) */}
                <path
                  d="M 570,400 Q 580,410 595,420"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4.5"
                  opacity="0.85"
                />

                {/* Magarpatta North Gate (Slow traffic - Amber) */}
                <path
                  d="M 800,550 Q 820,560 835,570"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="4"
                  opacity="0.8"
                />

                {/* Free flow stretches (Green) */}
                <path
                  d="M 140,160 Q 180,200 215,250"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  opacity="0.75"
                />
                <path
                  d="M 680,360 Q 740,345 800,340"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  opacity="0.75"
                />
              </g>
            )}

            {/* ─── REALISTIC ACTIVE ROUTE PATHS ─── */}
            {showRoutes &&
              filteredVehicles.map((ride) => {
                if (ride.status === 'SOS') return null;
                const vPos = getVehiclePosition(ride);
                const isSelected = selectedId === ride.id;

                // Waypoint destination lookup
                const targetZone =
                  PUNE_ZONES.find((z) => ride.drop.toLowerCase().includes(z.name.toLowerCase().split(' ')[0])) ||
                  PUNE_ZONES[0];

                return (
                  <Fragment key={ride.id + '-real-route'}>
                    <path
                      d={`M ${vPos.x},${vPos.y} Q ${(vPos.x + targetZone.x) / 2 + 15},${
                        (vPos.y + targetZone.y) / 2 - 10
                      } ${targetZone.x},${targetZone.y}`}
                      fill="none"
                      stroke={isSelected ? '#38bdf8' : 'rgba(56, 189, 248, 0.22)'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      strokeDasharray={isSelected ? '6 4' : '3 4'}
                      opacity={isSelected ? 0.95 : 0.4}
                    />
                    {isSelected && (
                      <circle
                        cx={targetZone.x}
                        cy={targetZone.y}
                        r="6"
                        fill="#0284c7"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        className="pulse-dot"
                      />
                    )}
                  </Fragment>
                );
              })}

            {/* ─── PUNE DISTRICT & HUB LABELS ─── */}
            <g id="district-labels">
              {PUNE_ZONES.map((zone) => {
                const isTech = zone.type === 'tech';
                const isAirport = zone.type === 'airport';
                return (
                  <g key={zone.id} transform={`translate(${zone.x}, ${zone.y})`}>
                    <circle
                      r={isTech ? 4.5 : isAirport ? 4 : 2.5}
                      fill={isTech ? '#0284c7' : isAirport ? '#94a3b8' : '#334155'}
                      stroke={isTech ? '#38bdf8' : '#64748b'}
                      strokeWidth="1"
                    />
                    <text
                      y="-8"
                      fill={isTech ? '#e0f2fe' : isAirport ? '#f1f5f9' : '#94a3b8'}
                      fontSize={isTech ? 9.5 : 8}
                      fontWeight={isTech ? '800' : '600'}
                      fontFamily="monospace"
                      textAnchor="middle"
                      letterSpacing="0.8">
                      {zone.name}
                    </text>
                    <text
                      y="16"
                      fill="#64748b"
                      fontSize="7"
                      fontFamily="sans-serif"
                      textAnchor="middle">
                      {zone.sub}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* ─── INTERACTIVE MOVING VEHICLE MARKERS (HTML OVERLAY) ─── */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}>
          {filteredVehicles.map((ride) => {
            const vPos = getVehiclePosition(ride);
            const isSel = selectedId === ride.id;
            const isSos = ride.status === 'SOS';
            const color = getStatusColor(ride.status);

            return (
              <div
                key={ride.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(isSel ? null : ride.id);
                }}
                className="absolute pointer-events-auto cursor-pointer group transition-all duration-300"
                style={{
                  left: `${(vPos.x / 1200) * 100}%`,
                  top: `${(vPos.y / 800) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSos ? 35 : isSel ? 32 : 20,
                }}>
                {/* Radar pulse for moving or SOS vehicle */}
                {(isSos || isSel) && (
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: isSos ? 48 : 36,
                      height: isSos ? 48 : 36,
                      top: isSos ? -14 : -8,
                      left: isSos ? -14 : -8,
                      border: `2px solid ${color}`,
                      animation: isSos ? 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite' : 'pulse 2s infinite',
                      opacity: 0.6,
                    }}
                  />
                )}

                {/* Directional Vehicle Capsule */}
                <div
                  className={`flex items-center justify-center rounded-full transition-transform shadow-lg ${
                    isSos ? 'w-8 h-8' : isSel ? 'w-7 h-7' : 'w-5 h-5'
                  }`}
                  style={{
                    background: isSos
                      ? '#dc2626'
                      : isSel
                      ? 'linear-gradient(135deg, #1d4ed8, #0891b2)'
                      : color,
                    border: '2px solid rgba(255, 255, 255, 0.95)',
                    boxShadow: `0 0 ${isSel || isSos ? 20 : 10}px ${color}aa`,
                  }}>
                  {/* Vehicle icon / directional heading */}
                  <span
                    className="text-[10px] leading-none"
                    style={{ transform: `rotate(${ride.heading}deg)` }}>
                    {isSos ? '🚨' : ride.vehicleType === 'shuttle' ? '🚐' : '🚗'}
                  </span>
                </div>

                {/* Hover / Active Telemetry Tooltip */}
                <div
                  className={`absolute left-6 -top-2 bg-slate-900/95 text-white p-2 rounded-xl whitespace-nowrap border border-slate-700 shadow-2xl pointer-events-none transition-all duration-150 ${
                    isSel ? 'opacity-100 scale-100 ring-2 ring-blue-500' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'
                  }`}
                  style={{ zIndex: 60 }}>
                  <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-cyan-300">
                    <span>{ride.id}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded text-slate-300 bg-slate-800">
                      {ride.org}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-200 mt-0.5 font-medium">
                    {ride.driver} · <span className="font-mono text-slate-400">{ride.vehicle}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-800">
                    <span>Speed: <strong className="text-emerald-400 font-mono">{ride.speed} km/h</strong></span>
                    <span>ETA: <strong className="text-white font-mono">{ride.eta}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── MAP QUICK REGION JUMP BAR (TOP CENTER) ─── */}
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full z-20"
          style={glassPanel(0.85)}>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider mr-1">
            Focus:
          </span>
          {[
            { id: 'all', label: 'All Pune', action: handleResetView },
            { id: 'hinjewadi', label: 'Hinjewadi IT Hub', action: () => handleFocusRegion('hinjewadi') },
            { id: 'central', label: 'Central Pune', action: () => handleFocusRegion('central') },
            { id: 'east', label: 'Airport & Kharadi', action: () => handleFocusRegion('east') },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={btn.action}
              className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-white border border-slate-700/60 transition-colors">
              {btn.label}
            </button>
          ))}
        </div>

        {/* ─── FIXED ZOOM & MAP CONTROLS (Moved to avoid SOS card overlap) ─── */}
        <div
          className="absolute top-4 right-[328px] flex flex-col gap-1.5 z-20"
          title="Map navigation controls">
          <button
            onClick={() => handleZoom(0.25)}
            title="Zoom In"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
            style={glassPanel(0.85)}>
            +
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            title="Zoom Out"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
            style={glassPanel(0.85)}>
            −
          </button>
          <button
            onClick={handleResetView}
            title="Reset Centered View"
            className="w-8 h-8 rounded-xl text-slate-300 hover:text-cyan-400 flex items-center justify-center text-xs transition-colors"
            style={glassPanel(0.85)}>
            ⊙
          </button>
          <button
            onClick={() => setShowTraffic((t) => !t)}
            title="Toggle Live Traffic Heatmap"
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
              showTraffic ? 'text-amber-400 ring-1 ring-amber-400/50' : 'text-slate-400'
            }`}
            style={glassPanel(0.85)}>
            🚦
          </button>
        </div>

        {/* ─── LEFT PANEL: ACTIVE TRIPS & DISPATCH EVENTS ────────────────── */}
        <div
          className="absolute left-4 top-4 bottom-4 w-76 flex flex-col overflow-hidden rounded-2xl z-20"
          style={glassPanel(0.92)}>
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Active Commutes</h3>
                <span className="text-[11px] font-mono text-cyan-300">({filteredVehicles.length})</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                LIVE TELEMETRY
              </span>
            </div>

            {/* Trips vs Events Tab Toggle */}
            <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('trips')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'trips'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}>
                Trips ({filteredVehicles.length})
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'events'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}>
                Events ({EVENTS_LOG.length})
              </button>
            </div>
          </div>

          {/* List Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activeTab === 'trips'
              ? filteredVehicles.map((ride) => {
                  const isSel = selectedId === ride.id;
                  const color = getStatusColor(ride.status);
                  return (
                    <div
                      key={ride.id}
                      onClick={() => setSelectedId(isSel ? null : ride.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? 'bg-blue-600/20 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
                          : 'bg-white/3 border-white/5 hover:border-slate-600 hover:bg-white/5'
                      }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono font-bold text-white tracking-wide">
                          {ride.id}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                          />
                          <span className="text-[10px] font-bold" style={{ color }}>
                            {ride.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-200 font-semibold">
                        {ride.driver} · <span className="text-slate-400 font-normal">{ride.org}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {ride.vehicle} · {ride.employees} passengers
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2">
                        <span className="truncate max-w-[85px]">{ride.pickup}</span>
                        <span className="text-slate-600">→</span>
                        <span className="truncate max-w-[85px] text-slate-300 font-medium">{ride.drop}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/5">
                        <span
                          className={`text-xs font-bold font-mono ${
                            ride.status === 'SOS'
                              ? 'text-red-400'
                              : ride.status === 'Delayed'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}>
                          ETA: {ride.eta}
                        </span>
                        {isSel && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTracking(tracking === ride.id ? null : ride.id);
                            }}
                            className="text-[10px] px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs">
                            {tracking === ride.id ? '● Tracking' : 'Track Vehicle'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              : EVENTS_LOG.map((evt, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-white/5 transition-all"
                    style={{ background: evt.bg }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${evt.color}`}>
                        {evt.icon} {evt.msg}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{evt.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">{evt.sub}</div>
                  </div>
                ))}
          </div>
        </div>

        {/* ─── RIGHT PANEL: SOS ALERT, OPS SUMMARY & FLEET METRICS ───────── */}
        {/* Adjusted width to w-76 and position so it doesn't overlap zoom controls or bottom button */}
        <div
          className="absolute right-4 top-4 bottom-4 w-76 flex flex-col gap-3 overflow-y-auto pr-1 z-20"
          style={{ scrollbarWidth: 'none' }}>
          {/* ─── SOS EMERGENCY CARD (Fixed text truncation & overlapping buttons) ─── */}
          <div
            className="rounded-2xl overflow-hidden border border-red-500/40 shadow-2xl flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, rgba(80, 15, 15, 0.75), rgba(40, 10, 10, 0.85))',
              backdropFilter: 'blur(20px)',
            }}>
            <div className="px-4 py-3 bg-red-600/30 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                <span className="text-xs font-bold text-red-300 uppercase tracking-wider">
                  Critical SOS Alert
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                ACTIVE
              </span>
            </div>

            <div className="p-4 space-y-2">
              {[
                { label: 'Active Ride', val: 'RIDE-10438' },
                { label: 'Assigned Driver', val: 'Arjun Nair' },
                { label: 'Vehicle Plate', val: 'MH12 GH 3456' },
                { label: 'Employee ID', val: 'EMP #10482 (Cognizant)' },
                { label: 'GPS Incident Spot', val: 'Wakad Bypass Chowk' },
                { label: 'Time Elapsed', val: '2 minutes ago' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-red-200/70 text-[11px]">{row.label}:</span>
                  <span className="text-white font-semibold font-mono text-[11px]">{row.val}</span>
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setSelectedId('RIDE-10438')}
                  className="py-2 px-3 text-xs font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors shadow-sm text-center">
                  Track Live GPS
                </button>
                <button
                  onClick={() => setShowSosModal(true)}
                  className="py-2 px-3 text-xs font-semibold text-red-200 hover:text-white rounded-xl border border-red-500/40 hover:bg-red-600/20 transition-colors text-center">
                  Incident Action
                </button>
              </div>
            </div>
          </div>

          {/* ─── OPS SUMMARY ─── */}
          <div className="rounded-2xl p-4 flex-shrink-0" style={glassPanel(0.85)}>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
              Operations Real-Time Breakdown
            </div>
            {[
              { label: 'On-Time Trips', count: '229', pct: 91, color: '#22c55e' },
              { label: 'Delayed (> 10m)', count: '18', pct: 7, color: '#f59e0b' },
              { label: 'Emergency Alerts', count: '2', pct: 2, color: '#ef4444' },
            ].map((stat) => (
              <div key={stat.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">{stat.label}</span>
                  <span className="text-white font-bold font-mono">{stat.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${stat.pct}%`, background: stat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ─── FLEET STATUS ─── */}
          <div className="rounded-2xl p-4 flex-shrink-0" style={glassPanel(0.85)}>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
              Fleet Vehicle Availability
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'On Commute', val: '524', color: '#38bdf8' },
                { label: 'Ready Standby', val: '233', color: '#22c55e' },
                { label: 'Drivers Off-Duty', val: '87', color: '#94a3b8' },
                { label: 'In Maintenance', val: '52', color: '#f59e0b' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 bg-white/4 rounded-xl border border-white/5 text-center">
                  <div className="text-base font-bold font-mono" style={{ color: item.color }}>
                    {item.val}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── BOTTOM SELECTED VEHICLE DETAIL CARD ────────────────────────── */}
        {selectedRide && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between gap-5 px-6 py-4 rounded-2xl z-30 border shadow-2xl dialog-in max-w-xl w-full"
            style={{
              ...glassPanel(0.96),
              borderColor: 'rgba(56, 189, 248, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            }}>
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #0891b2)' }}>
                {selectedRide.driver
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{selectedRide.driver}</h4>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${getStatusColor(selectedRide.status)}22`,
                      color: getStatusColor(selectedRide.status),
                      border: `1px solid ${getStatusColor(selectedRide.status)}44`,
                    }}>
                    ● {selectedRide.status}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  <span className="font-mono text-cyan-300 font-semibold">{selectedRide.vehicle}</span> ·{' '}
                  <span className="text-slate-400">{selectedRide.org}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                  <span>{selectedRide.pickup}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-slate-200 font-medium">{selectedRide.drop}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-emerald-400 font-bold font-mono">ETA {selectedRide.eta}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setTracking(tracking === selectedRide.id ? null : selectedRide.id)}
                className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">
                {tracking === selectedRide.id ? '● Unfollow' : 'Track GPS'}
              </button>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-sm transition-colors">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ─── MAP BOTTOM LEGEND ─────────────────────────────────────────── */}
        {!selectedRide && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-5 px-5 py-2 rounded-full z-20"
            style={glassPanel(0.85)}>
            {[
              ['#22c55e', 'On Route'],
              ['#f59e0b', 'Delayed (+10m)'],
              ['#ef4444', 'Emergency SOS'],
              ['#60a5fa', 'Assigned / Standby'],
            ].map(([col, title]) => (
              <div key={title} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                  style={{ background: col, boxShadow: `0 0 6px ${col}` }}
                />
                <span className="text-[11px] text-slate-300 font-medium">{title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── SOS INCIDENT PROTOCOL MODAL ─────────────────────────────────── */}
      {showSosModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md dialog-in"
          onClick={() => setShowSosModal(false)}>
          <div
            className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-red-500/40"
            style={{ background: '#091122' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="p-5 bg-gradient-to-r from-red-900 to-slate-900 border-b border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center text-xl font-bold shadow-md">
                  🚨
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    SOS Emergency Protocol
                  </h3>
                  <p className="text-xs text-red-300">RIDE-10438 · Incident In Progress</p>
                </div>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-xs text-red-200">
                Panic button triggered by passenger <strong>EMP #10482</strong>. Vehicle is stationary on the Wakad Bypass flyover.
              </div>

              <div className="space-y-2 text-xs">
                {[
                  ['Assigned Driver', 'Arjun Nair (+91 98234 56789)'],
                  ['Vehicle Plate', 'MH12 GH 3456 (White Scorpio)'],
                  ['Passengers', '7 employees on board'],
                  ['Corporate Tenant', 'Cognizant Hinjewadi Hub'],
                  ['Live Coordinates', '18.5982° N, 73.7644° E (Wakad)'],
                  ['Response Status', 'Pune Police (112) & Fleet Dispatch Alerted'],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">{lbl}:</span>
                    <span className="font-semibold text-slate-100 font-mono">{val}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-3">
                <a
                  href="tel:112"
                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors">
                  🚨 Call Police (112)
                </a>
                <button
                  onClick={() => setShowSosModal(false)}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors">
                  Acknowledge & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
