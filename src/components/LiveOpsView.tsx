import React, { useState, useEffect, useRef, Fragment } from 'react';

// ─── TYPES ─────────────────────────────────────────────────────────────────
export interface LiveRide {
  id: string; // e.g. 'TRIP-10421'
  tripId: string; // e.g. 'TRIP-10421'
  employee: string; // Lead passenger e.g. 'Raj Kumar'
  employeePhone: string;
  company: string; // e.g. 'Infosys'
  driver: string; // e.g. 'Ajay Patil'
  driverPhone: string;
  vehicle: string; // Plate e.g. 'MH12AB1234'
  vehicleModel: string;
  passengers: number; // e.g. 4
  capacity: number; // e.g. 6
  currentLocation: string; // e.g. 'Baner'
  pickup: string; // e.g. 'Baner'
  pickupName: string;
  pickupCoords: { x: number; y: number };
  drop: string; // e.g. 'Infosys Phase 2'
  dropName: string;
  dropCoords: { x: number; y: number };
  eta: string; // e.g. '08 Minutes'
  status: 'On Route' | 'Delayed' | 'SOS' | 'Assigned';
  org: string;
  mapX: number; // percentage 0-100 on base map
  mapY: number; // percentage 0-100 on base map
  speed: number; // km/h
  heading: number; // degrees
  vehicleType: 'cab' | 'shuttle' | 'suv';
  progressStage: 'pickup' | 'on_route' | 'destination';
  progressPct: number;
}

export interface SosIncident {
  id: string;
  tripId: string;
  employee: string;
  employeePhone: string;
  company: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  vehicleModel: string;
  location: string;
  alertTime: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Resolved';
  coordinates: { x: number; y: number };
  notes: string;
  resolvedAt?: string;
}

export interface ActivityEvent {
  id: string;
  time: string;
  type: 'trip' | 'traffic' | 'sos' | 'system';
  color: string;
  bg: string;
  icon: string;
  msg: string;
  sub: string;
  tripId?: string;
  vehicle?: string;
}

// ─── SEED ACTIVE TRIPS (Aligned with Client Demo Recommendations) ───────────
const SEED_RIDES: LiveRide[] = [
  {
    id: 'TRIP-10421',
    tripId: 'TRIP-10421',
    employee: 'Raj Kumar',
    employeePhone: '+91 98220 10421',
    company: 'Infosys',
    driver: 'Ajay Patil',
    driverPhone: '+91 98765 43210',
    vehicle: 'MH12AB1234',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Baner',
    pickup: 'Baner',
    pickupName: 'Baner High Street Gate',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Infosys Phase 2',
    dropName: 'Infosys Ph2 Gate 3',
    dropCoords: { x: 140, y: 320 },
    eta: '08 Minutes',
    status: 'On Route',
    org: 'Infosys',
    mapX: 34,
    mapY: 36,
    speed: 38,
    heading: 300,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 65,
  },
  {
    id: 'TRIP-10422',
    tripId: 'TRIP-10422',
    employee: 'Sneha Rao',
    employeePhone: '+91 98111 22334',
    company: 'Infosys',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98220 54321',
    vehicle: 'MH12CD5678',
    vehicleModel: 'Maruti Suzuki Ertiga (Silver)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Wakad Bridge',
    pickup: 'Baner Circle',
    pickupName: 'Baner Orchid Junction',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Hinjewadi Ph2',
    dropName: 'Wipro Circle Ph2',
    dropCoords: { x: 140, y: 320 },
    eta: '22 Minutes',
    status: 'Delayed',
    org: 'Infosys',
    mapX: 38,
    mapY: 38,
    speed: 14,
    heading: 290,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 40,
  },
  {
    id: 'TRIP-10423',
    tripId: 'TRIP-10423',
    employee: 'Mohan Singh',
    employeePhone: '+91 98901 23456',
    company: 'Wipro',
    driver: 'Ramesh Kale',
    driverPhone: '+91 98234 56781',
    vehicle: 'MH12EF9012',
    vehicleModel: 'Toyota Etios (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'University Flyover',
    pickup: 'Aundh',
    pickupName: 'Bremen Chowk Terminal',
    pickupCoords: { x: 420, y: 310 },
    drop: 'Magarpatta',
    dropName: 'Magarpatta Cybercity Tower 4',
    dropCoords: { x: 820, y: 560 },
    eta: '14 Minutes',
    status: 'On Route',
    org: 'Wipro',
    mapX: 62,
    mapY: 62,
    speed: 42,
    heading: 135,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 55,
  },
  {
    id: 'TRIP-10438',
    tripId: 'TRIP-10438',
    employee: 'Priya Sharma',
    employeePhone: '+91 98224 89012',
    company: 'WNS',
    driver: 'Rakesh Patil',
    driverPhone: '+91 98901 23456',
    vehicle: 'MH12XY4567',
    vehicleModel: 'Mahindra Scorpio (Black)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Hinjewadi Phase 1',
    pickup: 'Wakad',
    pickupName: 'Bhumkar Chowk Overpass',
    pickupCoords: { x: 260, y: 290 },
    drop: 'Hinjewadi Phase 1',
    dropName: 'WNS Global Campus Gate 1',
    dropCoords: { x: 180, y: 280 },
    eta: 'SOS Alert',
    status: 'SOS',
    org: 'WNS',
    mapX: 19,
    mapY: 28,
    speed: 0,
    heading: 270,
    vehicleType: 'suv',
    progressStage: 'on_route',
    progressPct: 80,
  },
  {
    id: 'TRIP-10439',
    tripId: 'TRIP-10439',
    employee: 'Kavita Shinde',
    employeePhone: '+91 98567 89012',
    company: 'TCS Pune',
    driver: 'Deepak Patel',
    driverPhone: '+91 98456 78901',
    vehicle: 'MH12IJ7890',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Pimple Saudagar',
    pickup: 'Pimple Saudagar',
    pickupName: 'Govind Garden Chowk',
    pickupCoords: { x: 340, y: 240 },
    drop: 'Baner Rd',
    dropName: 'TCS Baner Delivery Hub',
    dropCoords: { x: 370, y: 365 },
    eta: '31 Minutes',
    status: 'Assigned',
    org: 'TCS Pune',
    mapX: 35,
    mapY: 26,
    speed: 25,
    heading: 215,
    vehicleType: 'cab',
    progressStage: 'pickup',
    progressPct: 15,
  },
  {
    id: 'TRIP-10440',
    tripId: 'TRIP-10440',
    employee: 'Vikram Sharma',
    employeePhone: '+91 98444 33221',
    company: 'TCS Pune',
    driver: 'Santosh Rao',
    driverPhone: '+91 98789 01234',
    vehicle: 'MH12KL2345',
    vehicleModel: 'Force Traveller Shuttle (White)',
    passengers: 4,
    capacity: 6,
    currentLocation: 'Bund Garden Bridge',
    pickup: 'Koregaon Park',
    pickupName: 'North Main Road Lane 5',
    pickupCoords: { x: 690, y: 460 },
    drop: 'Hadapsar',
    dropName: 'Magarpatta Tower 7',
    dropCoords: { x: 840, y: 640 },
    eta: '11 Minutes',
    status: 'On Route',
    org: 'TCS Pune',
    mapX: 74,
    mapY: 52,
    speed: 34,
    heading: 120,
    vehicleType: 'shuttle',
    progressStage: 'on_route',
    progressPct: 70,
  },
  {
    id: 'TRIP-10441',
    tripId: 'TRIP-10441',
    employee: 'Priya Das',
    employeePhone: '+91 98221 44321',
    company: 'Infosys',
    driver: 'Mahesh Gaikwad',
    driverPhone: '+91 98234 89012',
    vehicle: 'MH12MN6789',
    vehicleModel: 'Maruti Suzuki Dzire (Silver)',
    passengers: 3,
    capacity: 4,
    currentLocation: 'Chandani Chowk',
    pickup: 'Kothrud',
    pickupName: 'Kothrud Depot Gate 2',
    pickupCoords: { x: 430, y: 560 },
    drop: 'Baner',
    dropName: 'Baner High Street Wipro Hub',
    dropCoords: { x: 370, y: 365 },
    eta: '06 Minutes',
    status: 'On Route',
    org: 'Infosys',
    mapX: 33,
    mapY: 50,
    speed: 45,
    heading: 340,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 85,
  },
  {
    id: 'TRIP-10444',
    tripId: 'TRIP-10444',
    employee: 'Akshat Seth',
    employeePhone: '+91 98765 10482',
    company: 'TCS Pune',
    driver: 'Sanjay Patil',
    driverPhone: '+91 98123 78901',
    vehicle: 'MH12ST9012',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    passengers: 4,
    capacity: 4,
    currentLocation: 'Pashan Sus Road',
    pickup: 'Baner Rd',
    pickupName: 'Baner Orchid Hotel',
    pickupCoords: { x: 370, y: 365 },
    drop: 'Hinjewadi Ph1',
    dropName: 'TCS Sahyadri Park Main Gate',
    dropCoords: { x: 180, y: 280 },
    eta: '09 Minutes',
    status: 'On Route',
    org: 'TCS Pune',
    mapX: 29,
    mapY: 33,
    speed: 32,
    heading: 300,
    vehicleType: 'cab',
    progressStage: 'on_route',
    progressPct: 60,
  },
];

// ─── INITIAL SOS EMERGENCY INCIDENT (Directly from Document Pages 5-6) ─────
const INITIAL_SOS_INCIDENT: SosIncident = {
  id: 'SOS-9042',
  tripId: 'TRIP-10438',
  employee: 'Priya Sharma',
  employeePhone: '+91 98224 89012',
  company: 'WNS',
  driver: 'Rakesh Patil',
  driverPhone: '+91 98901 23456',
  vehicle: 'MH12XY4567',
  vehicleModel: 'Mahindra Scorpio (Black)',
  location: 'Hinjewadi Phase 1',
  alertTime: '10:42 PM',
  severity: 'High',
  status: 'Active',
  coordinates: { x: 190, y: 285 },
  notes: 'Panic button triggered by passenger. Vehicle stationary on Hinjewadi Phase 1 bypass.',
};

// ─── REAL-TIME ACTIVITY FEED STREAM (Directly from Document Pages 4-5) ──────
const INITIAL_ACTIVITY_FEED: ActivityEvent[] = [
  {
    id: 'act-1',
    time: '10:50 PM',
    type: 'sos',
    color: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.12)',
    icon: '✓',
    msg: 'Incident Protocol Standing By',
    sub: 'Emergency desk ready for operator resolution',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-2',
    time: '10:46 PM',
    type: 'sos',
    color: 'text-cyan-400',
    bg: 'rgba(34,211,238,0.12)',
    icon: '📍',
    msg: 'Location Verified — Hinjewadi Phase 1',
    sub: 'GPS beacon locked at 18.5982° N, 73.7644° E',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-3',
    time: '10:44 PM',
    type: 'sos',
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.12)',
    icon: '📞',
    msg: 'Driver Contacted — Rakesh Patil',
    sub: 'Operations center initiated direct comms bridge',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-4',
    time: '10:43 PM',
    type: 'sos',
    color: 'text-red-400',
    bg: 'rgba(239,68,68,0.14)',
    icon: '🚨',
    msg: 'Operations Team Notified',
    sub: 'Incident escalated to safety desk · Quick response team alerted',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-5',
    time: '10:42 PM',
    type: 'sos',
    color: 'text-red-500',
    bg: 'rgba(239,68,68,0.20)',
    icon: '🚨',
    msg: 'SOS Alert Triggered',
    sub: 'Employee: Priya Sharma (WNS) · Vehicle: MH12XY4567',
    tripId: 'TRIP-10438',
    vehicle: 'MH12XY4567',
  },
  {
    id: 'act-6',
    time: '10:37 PM',
    type: 'trip',
    color: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.10)',
    icon: '✓',
    msg: 'Trip completed successfully',
    sub: 'Infosys Phase 2 · 4 employees dropped at destination',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-7',
    time: '10:34 PM',
    type: 'trip',
    color: 'text-cyan-400',
    bg: 'rgba(34,211,238,0.10)',
    icon: '📍',
    msg: 'Employee approaching destination',
    sub: 'Cab MH12AB1234 within 800m of Infosys Phase 2 Gate 3',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-8',
    time: '10:28 PM',
    type: 'trip',
    color: 'text-blue-400',
    bg: 'rgba(96,165,250,0.10)',
    icon: '🛣️',
    msg: 'Vehicle resumed normal route',
    sub: 'Highway traffic clear · Cruising at 42 km/h on bypass',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-9',
    time: '10:22 PM',
    type: 'traffic',
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.10)',
    icon: '⏱️',
    msg: 'ETA updated from 12 min to 16 min',
    sub: 'Moderate bottleneck near Wakad bridge interchange',
    tripId: 'TRIP-10422',
    vehicle: 'MH12CD5678',
  },
  {
    id: 'act-10',
    time: '10:19 PM',
    type: 'traffic',
    color: 'text-amber-400',
    bg: 'rgba(245,158,11,0.10)',
    icon: '🚦',
    msg: 'Traffic congestion detected',
    sub: 'Baner junction signal delay · Auto reroute suggested',
    tripId: 'TRIP-10422',
    vehicle: 'MH12CD5678',
  },
  {
    id: 'act-11',
    time: '10:16 PM',
    type: 'trip',
    color: 'text-slate-300',
    bg: 'rgba(255,255,255,0.05)',
    icon: '📍',
    msg: 'Vehicle crossed Baner checkpoint',
    sub: 'Cab MH12AB1234 en route to Infosys Phase 2',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-12',
    time: '10:10 PM',
    type: 'trip',
    color: 'text-blue-400',
    bg: 'rgba(96,165,250,0.10)',
    icon: '🚘',
    msg: 'Trip started successfully',
    sub: 'Driver Ajay Patil started route for Infosys commute',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-13',
    time: '10:08 PM',
    type: 'trip',
    color: 'text-emerald-400',
    bg: 'rgba(34,197,94,0.10)',
    icon: '👥',
    msg: 'Employee boarded vehicle',
    sub: 'Raj Kumar + 3 passengers onboard at Baner pickup',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
  {
    id: 'act-14',
    time: '10:05 PM',
    type: 'trip',
    color: 'text-cyan-400',
    bg: 'rgba(34,211,238,0.10)',
    icon: '📍',
    msg: 'Driver reached pickup location',
    sub: 'Ajay Patil arrived at Baner High Street pickup gate',
    tripId: 'TRIP-10421',
    vehicle: 'MH12AB1234',
  },
];

// ─── OPERATIONS HEALTH SUMMARY METRICS (Directly from Document Page 7) ──────
const OPS_HEALTH_METRICS = {
  activeTrips: 18,
  onTimeTrips: 229,
  delayedTrips: 12,
  sosIncidents: 2,
  fleetUtilization: 91,
  etaAccuracy: 96,
};

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

// ─── REAL-WORLD PUNE GIS MAP TILES ─────────────────────────────────────────
const PUNE_MAP_TILES = [
  { x: 2886, y: 1832 }, { x: 2887, y: 1832 }, { x: 2888, y: 1832 }, { x: 2889, y: 1832 },
  { x: 2886, y: 1833 }, { x: 2887, y: 1833 }, { x: 2888, y: 1833 }, { x: 2889, y: 1833 },
  { x: 2886, y: 1834 }, { x: 2887, y: 1834 }, { x: 2888, y: 1834 }, { x: 2889, y: 1834 },
];

export default function LiveOpsView() {
  const [selectedId, setSelectedId] = useState<string | null>('TRIP-10421'); // Default select recommended demo trip
  const [tracking, setTracking] = useState<string | null>('TRIP-10421');
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'trips' | 'feed'>('trips'); // 'trips' or 'feed'
  const [feedFilter, setFeedFilter] = useState<'all' | 'trip' | 'traffic' | 'sos'>('all');
  
  // SOS Incident state
  const [sosIncident, setSosIncident] = useState<SosIncident>(INITIAL_SOS_INCIDENT);
  const [showSosIncident, setShowSosIncident] = useState(false);
  const [sosNotification, setSosNotification] = useState<{
    open: boolean;
    title: string;
    desc: string;
    time: string;
    vehicle: string;
    location: string;
  } | null>(null);
  const [callModal, setCallModal] = useState<{ open: boolean; type: 'driver' | 'employee'; name: string; phone: string; title: string } | null>(null);

  // Audio alert chime using Web Audio API
  const playSosChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio might be muted or unpermitted by browser policy
    }
  };

  // Handler triggered ONLY when Active SOS is clicked
  const handleOpenActiveSos = (source = 'Active SOS Click') => {
    playSosChime();
    setShowSosIncident(true);
    setSelectedId('TRIP-10438');
    setTracking('TRIP-10438');
    setZoomLevel(1.75);
    setPanOffset({ x: 240, y: 120 });
    setSosNotification({
      open: true,
      title: 'Active SOS Emergency Notification',
      desc: `Priya Sharma (${sosIncident.company}) reported an emergency on ${sosIncident.vehicleModel} (${sosIncident.vehicle})`,
      time: sosIncident.alertTime,
      vehicle: sosIncident.vehicle,
      location: sosIncident.location,
    });
    showToast(`🚨 Active SOS Notification: Priya Sharma at Hinjewadi Phase 1`);
  };

  // Activity Feed state
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>(INITIAL_ACTIVITY_FEED);

  // Filters & Dropdowns
  const [filterOrg, setFilterOrg] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [toast, setToast] = useState('');

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3400);
  };

  // Simulation loop for live vehicle movement (Gentle 800ms pace)
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 800);
    return () => clearInterval(id);
  }, []);

  // Filtered vehicles
  const ALL_VEHICLES = SEED_RIDES;
  const ORG_OPTIONS = ['All', 'Infosys', 'TCS Pune', 'Wipro', 'Cognizant', 'WNS'];
  const filteredVehicles = ALL_VEHICLES.filter((r) => {
    const matchOrg = filterOrg === 'All' || r.org === filterOrg || r.company === filterOrg;
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

  // Realistic vehicle telemetry positioning (Slow, smooth, gentle cruising along roads)
  const getVehiclePosition = (ride: LiveRide) => {
    const baseSpeed = ride.status === 'On Route' ? 0.035 : ride.status === 'Delayed' ? 0.012 : 0;
    const phase = ride.mapX * 0.15 + ride.mapY * 0.11;
    const offsetX = Math.sin(tick * baseSpeed + phase) * 1.5;
    const offsetY = Math.cos(tick * baseSpeed * 0.8 + phase) * 1.0;

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

  // Track Live GPS action (centers map on incident or selected vehicle)
  const handleTrackLiveIncident = () => {
    setSelectedId('TRIP-10438');
    setTracking('TRIP-10438');
    setZoomLevel(1.75);
    setPanOffset({ x: 240, y: 120 });
    showToast('🚨 Live GPS locked on SOS Incident: Hinjewadi Phase 1');
  };

  // Resolve SOS Incident workflow action
  const handleResolveIncident = () => {
    if (sosIncident.status === 'Resolved') {
      showToast('Incident is already marked as Resolved');
      return;
    }
    const resolvedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSosIncident((prev) => ({
      ...prev,
      status: 'Resolved',
      resolvedAt: resolvedTime,
    }));
    setSosNotification(null);

    // Append resolution log event to the Real-Time Activity Feed
    const resolutionEvent: ActivityEvent = {
      id: `act-${Date.now()}`,
      time: resolvedTime,
      type: 'sos',
      color: 'text-emerald-400',
      bg: 'rgba(34,197,94,0.15)',
      icon: '✓',
      msg: 'Incident Resolved — SOS-9042',
      sub: `Priya Sharma verified safe · Driver Rakesh Patil cleared incident by dispatch`,
      tripId: 'TRIP-10438',
      vehicle: 'MH12XY4567',
    };
    setActivityFeed((prev) => [resolutionEvent, ...prev]);
    showToast('✓ Emergency Incident marked Resolved. Activity log updated.');
  };

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Filtered activity feed
  const filteredFeed = activityFeed.filter((ev) => {
    if (feedFilter === 'all') return true;
    return ev.type === feedFilter;
  });

  return (
    <div
      className="flex flex-col h-full w-full select-none overflow-hidden relative"
      style={{ background: '#040914' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>

      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 dialog-in">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {toast}
        </div>
      )}

      {/* ─── URGENT SOS EMERGENCY NOTIFICATION MODAL BANNER ─────────────── */}
      {sosNotification?.open && (
        <div className="fixed top-18 right-6 z-50 w-96 rounded-2xl border-2 border-red-500/80 bg-slate-950/95 text-white shadow-2xl p-4 backdrop-blur-2xl ring-4 ring-red-500/20 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2.5 border-b border-red-500/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/50 flex items-center justify-center text-lg animate-pulse flex-shrink-0">
                🚨
              </div>
              <div>
                <div className="text-xs font-black text-red-400 tracking-wider uppercase flex items-center gap-1.5">
                  <span>Critical SOS Notification</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Time: {sosNotification.time} · Severity: CRITICAL HIGH
                </div>
              </div>
            </div>
            <button
              onClick={() => setSosNotification(null)}
              className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
              title="Dismiss Notification">
              ✕
            </button>
          </div>

          <p className="text-xs text-red-100 font-medium mb-3">
            {sosNotification.desc}
          </p>

          <div className="space-y-1.5 text-xs mb-3 bg-red-950/40 p-2.5 rounded-xl border border-red-500/25">
            <div className="flex justify-between items-center">
              <span className="text-red-200/70 text-[11px]">Passenger:</span>
              <span className="text-white font-bold">{sosIncident.employee}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-200/70 text-[11px]">Organization:</span>
              <span className="text-white font-medium">{sosIncident.company}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-200/70 text-[11px]">Vehicle:</span>
              <span className="text-cyan-300 font-mono font-bold">{sosIncident.vehicle}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-200/70 text-[11px]">Location:</span>
              <span className="text-amber-300 font-semibold">{sosIncident.location}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              onClick={() => {
                handleTrackLiveIncident();
                setSosNotification(null);
              }}
              className="py-2 px-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-center text-[11px] transition-colors shadow-sm">
              🎯 Track Live
            </button>
            <button
              onClick={() => {
                setCallModal({
                  open: true,
                  type: 'driver',
                  name: sosIncident.driver,
                  phone: sosIncident.driverPhone,
                  title: `SOS Emergency Call: Driver`,
                });
                setSosNotification(null);
              }}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-center text-[11px] border border-white/10 transition-colors">
              📞 Call Driver
            </button>
            <button
              onClick={() => {
                setCallModal({
                  open: true,
                  type: 'employee',
                  name: sosIncident.employee,
                  phone: sosIncident.employeePhone,
                  title: `SOS Emergency Call: Passenger`,
                });
                setSosNotification(null);
              }}
              className="py-2 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-center text-[11px] border border-white/10 transition-colors">
              📱 Passenger
            </button>
          </div>
        </div>
      )}

      {/* ─── TOP KPI DISPATCH BAR (Directly from Suggested Layout) ─────── */}
      <header
        className="flex items-center gap-3 px-5 py-2.5 z-30 flex-shrink-0"
        style={glassPanel(0.95)}>
        <div className="flex items-center gap-2.5 border-r border-white/10 pr-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <h1 className="text-xs font-bold text-white tracking-wide uppercase">
              Live Operations Control
            </h1>
            <p className="text-[10px] text-slate-400">Shivneri Pune Metropolitan Hub</p>
          </div>
        </div>

        {/* Recommended KPI Metric Cards Bar */}
        <div className="flex items-center gap-4 text-xs overflow-x-auto py-0.5">
          {[
            { label: 'Active Trips', val: '18', color: '#38bdf8', icon: '🚘' },
            { label: 'On-Time Trips', val: '229', color: '#22c55e', icon: '⏱️' },
            { label: 'Delayed Trips', val: '12', color: '#f59e0b', icon: '⚠️' },
            {
              label: 'SOS Incidents',
              val: sosIncident.status === 'Active' ? '1 Active' : '0 Active (1 Solved)',
              color: sosIncident.status === 'Active' ? '#ef4444' : '#22c55e',
              icon: '🚨',
              pulse: sosIncident.status === 'Active',
              isSos: true,
            },
            { label: 'Fleet Utilization', val: '91%', color: '#38bdf8', icon: '📊' },
            { label: 'ETA Accuracy', val: '96%', color: '#22c55e', icon: '🎯' },
          ].map((kpi) => {
            const isSosCard = (kpi as { isSos?: boolean }).isSos;
            return (
              <div
                key={kpi.label}
                onClick={() => {
                  if (isSosCard) {
                    handleOpenActiveSos('Active SOS KPI Card');
                  }
                }}
                title={isSosCard ? 'Click to open Active SOS Emergency Notification & Response Center' : undefined}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border flex-shrink-0 transition-all ${
                  isSosCard
                    ? sosIncident.status === 'Active'
                      ? 'bg-red-950/40 border-red-500/50 hover:bg-red-900/50 hover:border-red-400 cursor-pointer shadow-lg shadow-red-950/50 ring-1 ring-red-500/40 hover:scale-105 active:scale-95'
                      : 'bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-900/30 cursor-pointer'
                    : 'bg-white/4 border-white/5'
                }`}>
                <span className="text-sm">{kpi.icon}</span>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs font-bold font-mono" style={{ color: kpi.color }}>
                      {kpi.val}
                    </span>
                    {kpi.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                    {isSosCard && sosIncident.status === 'Active' && (
                      <span className="text-[8px] font-black tracking-widest text-red-200 uppercase px-1 py-0.2 bg-red-600/60 rounded border border-red-400/50 animate-pulse">
                        CLICK
                      </span>
                    )}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider">{kpi.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filter controls */}
        <div className="ml-auto flex items-center gap-2">
          {/* Status Filter */}
          <div
            className="flex gap-1 rounded-xl p-0.5 border"
            style={{ background: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
            {['All', 'On Route', 'Delayed', 'SOS'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterStatus(s);
                  if (s === 'SOS') {
                    handleOpenActiveSos('Status Filter: SOS');
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all"
                style={
                  filterStatus === s
                    ? {
                        background:
                          s === 'SOS'
                            ? '#dc2626'
                            : s === 'Delayed'
                            ? '#d97706'
                            : s === 'On Route'
                            ? '#16a34a'
                            : '#2563eb',
                        color: '#ffffff',
                      }
                    : { color: '#94a3b8' }
                }>
                {s}
              </button>
            ))}
          </div>

          {/* Org Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-xl border transition-all text-slate-200"
              style={{ background: 'rgba(255, 255, 255, 0.06)', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              <span>🏢 {filterOrg === 'All' ? 'All Companies' : filterOrg}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>
            {isOrgDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-40 rounded-xl shadow-2xl border border-slate-700 py-1 z-50 bg-slate-900 text-xs"
                onClick={(e) => e.stopPropagation()}>
                {ORG_OPTIONS.map((orgName) => (
                  <button
                    key={orgName}
                    onClick={() => {
                      setFilterOrg(orgName);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between ${
                      filterOrg === orgName ? 'bg-blue-600/30 text-cyan-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
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

      {/* ─── MAIN WORKSPACE: MAP CANVAS + PANELS ─────────────────────────── */}
      <div id="map-canvas-container" className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing">
        
        {/* ─── MAP CANVAS WITH REAL-WORLD TILES & ROUTE VISUALIZATION ─────── */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center pointer-events-none"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}>
          {/* Real-World Pune Base Map Tiles */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 select-none pointer-events-none min-w-[1200px] min-h-[800px] overflow-hidden">
            {PUNE_MAP_TILES.map((t) => (
              <div key={`${t.x}-${t.y}`} className="relative w-full h-full bg-slate-950 overflow-hidden">
                <img
                  src={
                    mapStyle === 'satellite-contrast'
                      ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/${t.y}/${t.x}`
                      : `https://basemaps.cartocdn.com/rastertiles/dark_all/12/${t.x}/${t.y}.png`
                  }
                  alt={`Pune Map ${t.x},${t.y}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{
                    filter:
                      mapStyle === 'satellite-contrast'
                        ? 'contrast(1.15) brightness(0.8)'
                        : 'contrast(1.08) brightness(0.88)',
                    opacity: mapStyle === 'satellite-contrast' ? 0.78 : 0.82,
                  }}
                  loading="eager"
                />
              </div>
            ))}
          </div>

          {/* SVG Vector Cartography Layer */}
          <svg
            className="w-full h-full min-w-[1200px] min-h-[800px] relative z-10"
            viewBox="0 0 1200 800"
            preserveAspectRatio="xMidYMid slice">
            <defs>
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

              <linearGradient id="selectedRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              <filter id="highwayGlow">
                <feGaussianBlur stdDeviation="2.5" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Translucent Layer to let Real-World Tiles shine through */}
            <rect width="1200" height="800" fill="rgba(4, 9, 20, 0.42)" />

            {/* Metro Center Ambient Light */}
            <circle cx="560" cy="440" r="420" fill="url(#puneNightGlow)" />

            {/* ─── REAL MULA-MUTHA RIVER NETWORK ─── */}
            <g id="pune-rivers">
              {/* Pavana River */}
              <path d="M 160,80 Q 240,110 320,130 Q 380,150 430,220" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
              {/* Mula River */}
              <path d="M 120,290 Q 180,270 240,310 Q 300,350 380,310 Q 430,270 490,320 Q 530,360 580,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="11" strokeLinecap="round" opacity="0.85" />
              {/* Mutha River */}
              <path d="M 380,680 Q 460,590 520,530 Q 560,480 580,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="9" strokeLinecap="round" opacity="0.8" />
              {/* Sangam Confluence */}
              <path d="M 580,390 Q 640,380 700,430 Q 760,460 840,410 Q 920,380 1060,390" fill="none" stroke="url(#mulaMuthaRiverGrad)" strokeWidth="14" strokeLinecap="round" opacity="0.9" />
            </g>

            {/* ─── LIVE TRAFFIC HEATMAP OVERLAY ─── */}
            {showTraffic && (
              <g id="traffic-overlay">
                <path d="M 215,250 Q 230,270 245,290" fill="none" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" opacity="0.9" filter="url(#highwayGlow)" />
                <circle cx="230" cy="270" r="14" fill="#ef4444" opacity="0.25" className="pulse-dot" />
                <path d="M 395,480 Q 410,500 425,525" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
                <path d="M 570,400 Q 580,410 595,420" fill="none" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" opacity="0.85" />
                <path d="M 800,550 Q 820,560 835,570" fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.8" />
              </g>
            )}

            {/* ─── ROUTE VISUALIZATION (ENHANCEMENT #1 FROM DOCUMENT) ────── */}
            {/* Renders Pickup Point, Drop Location, and Route Path */}
            {showRoutes &&
              filteredVehicles.map((ride) => {
                const isSelected = selectedId === ride.id;
                const vPos = getVehiclePosition(ride);

                // Origin / Pickup point
                const pickupPt = ride.pickupCoords;
                // Destination / Drop point
                const dropPt = ride.dropCoords;

                if (!isSelected) {
                  // Non-selected subtle corridor
                  return (
                    <path
                      key={ride.id + '-ambient-route'}
                      d={`M ${pickupPt.x},${pickupPt.y} Q ${vPos.x},${vPos.y} ${dropPt.x},${dropPt.y}`}
                      fill="none"
                      stroke="rgba(56, 189, 248, 0.18)"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  );
                }

                // ─── ACTIVE SELECTED TRIP DETAILED ROUTE VISUALIZATION ───
                return (
                  <Fragment key={ride.id + '-highlight-route'}>
                    {/* 1. Complete Road Corridor: Pickup -> Vehicle -> Drop */}
                    <path
                      d={`M ${pickupPt.x},${pickupPt.y} Q ${(pickupPt.x + vPos.x) / 2},${(pickupPt.y + vPos.y) / 2 - 15} ${vPos.x},${vPos.y}`}
                      fill="none"
                      stroke="#071529"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${pickupPt.x},${pickupPt.y} Q ${(pickupPt.x + vPos.x) / 2},${(pickupPt.y + vPos.y) / 2 - 15} ${vPos.x},${vPos.y}`}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="4"
                      strokeLinecap="round"
                      opacity="0.85"
                    />

                    <path
                      d={`M ${vPos.x},${vPos.y} Q ${(vPos.x + dropPt.x) / 2 + 10},${(vPos.y + dropPt.y) / 2 - 20} ${dropPt.x},${dropPt.y}`}
                      fill="none"
                      stroke="#071529"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${vPos.x},${vPos.y} Q ${(vPos.x + dropPt.x) / 2 + 10},${(vPos.y + dropPt.y) / 2 - 20} ${dropPt.x},${dropPt.y}`}
                      fill="none"
                      stroke="url(#selectedRouteGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="8 5"
                      filter="url(#highwayGlow)"
                    />

                    {/* 2. PICKUP POINT NODE (Document Page 2) */}
                    <g transform={`translate(${pickupPt.x}, ${pickupPt.y})`}>
                      <circle r="14" fill="#22c55e" opacity="0.3" className="pulse-dot" />
                      <circle r="7" fill="#22c55e" stroke="#ffffff" strokeWidth="2.5" />
                      {/* Label Badge */}
                      <g transform="translate(0, -18)">
                        <rect x="-55" y="-12" width="110" height="20" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#22c55e" strokeWidth="1" />
                        <text textAnchor="middle" dy="2" fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          📍 Pickup: {ride.pickup}
                        </text>
                      </g>
                    </g>

                    {/* 3. DROP DESTINATION NODE (Document Page 2) */}
                    <g transform={`translate(${dropPt.x}, ${dropPt.y})`}>
                      <circle r="16" fill="#3b82f6" opacity="0.3" className="pulse-dot" />
                      <circle r="8" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2.5" />
                      {/* Label Badge */}
                      <g transform="translate(0, -20)">
                        <rect x="-65" y="-12" width="130" height="20" rx="6" fill="rgba(15, 23, 42, 0.95)" stroke="#38bdf8" strokeWidth="1" />
                        <text textAnchor="middle" dy="2" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                          🏢 Drop: {ride.drop}
                        </text>
                      </g>
                    </g>
                  </Fragment>
                );
              })}

            {/* ─── PUNE DISTRICT & HUB LABELS ─── */}
            <g id="district-labels">
              {PUNE_ZONES.map((zone) => {
                const isTech = zone.type === 'tech';
                return (
                  <g key={zone.id} transform={`translate(${zone.x}, ${zone.y})`}>
                    <circle r={isTech ? 4.5 : 2.5} fill={isTech ? '#0284c7' : '#334155'} stroke={isTech ? '#38bdf8' : '#64748b'} strokeWidth="1" />
                    <text y="-8" fill={isTech ? '#e0f2fe' : '#94a3b8'} fontSize={isTech ? 9.5 : 8} fontWeight={isTech ? '800' : '600'} fontFamily="monospace" textAnchor="middle">
                      {zone.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* ─── MOVING VEHICLE MARKERS (HTML OVERLAY) ────────────────────── */}
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
                  if (isSos) {
                    handleOpenActiveSos('Map SOS Marker');
                  } else {
                    setShowSosIncident(false);
                    setSelectedId(isSel ? null : ride.id);
                  }
                }}
                className="absolute pointer-events-auto cursor-pointer group transition-all duration-700 ease-out"
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
                      border: `2px solid ${isSos ? '#ef4444' : '#38bdf8'}`,
                      animation: 'ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite',
                      opacity: 0.6,
                    }}
                  />
                )}

                {/* Vehicle Badge Icon */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-bold shadow-2xl transition-transform ${
                    isSel ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{
                    background:
                      isSos
                        ? 'linear-gradient(135deg, #ef4444, #991b1b)'
                        : isSel
                        ? 'linear-gradient(135deg, #0284c7, #2563eb)'
                        : 'linear-gradient(135deg, #1e293b, #0f172a)',
                    border: `1.5px solid ${color}`,
                    boxShadow: `0 0 16px ${color}88`,
                  }}>
                  {isSos ? '🚨' : ride.vehicleType === 'shuttle' ? '🚐' : '🚗'}
                </div>

                {/* Floating Cab Tooltip HUD with Plate & Driver */}
                <div
                  className={`absolute left-10 -top-2 px-2.5 py-1.5 rounded-xl border whitespace-nowrap z-50 transition-opacity ${
                    isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={glassPanel(0.95)}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="font-mono font-bold text-white text-[11px]">{ride.vehicle}</span>
                    <span className="text-[10px] text-slate-400">· {ride.driver}</span>
                  </div>
                  <div className="text-[9px] text-slate-300 mt-0.5">
                    {ride.pickup} → {ride.drop} · <strong className="text-emerald-400">{ride.eta}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── ROUTE PROGRESS INDICATOR HUD (ENHANCEMENT #1 STEPPER) ──────── */}
        {selectedRide && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2.5 rounded-2xl flex items-center gap-4 text-xs shadow-2xl border"
            style={glassPanel(0.95)}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">{selectedRide.vehicle}</span>
              <span className="text-[10px] text-slate-400">({selectedRide.driver})</span>
            </div>

            <div className="h-4 w-px bg-white/20" />

            {/* Stepper: Pickup -> On Route -> Destination */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Pickup: {selectedRide.pickup}</span>
              </div>

              <span className="text-slate-500 font-mono">────</span>

              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>On Route ({selectedRide.progressPct}%)</span>
              </div>

              <span className="text-slate-500 font-mono">────</span>

              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Destination: {selectedRide.drop}</span>
              </div>
            </div>

            <div className="h-4 w-px bg-white/20" />

            <div className="font-mono text-emerald-400 font-bold text-xs">
              ETA: {selectedRide.eta}
            </div>
          </div>
        )}

        {/* ─── FLOATING ZOOM & MAP LAYER CONTROLS ─────────────────────────── */}
        <div className="absolute top-4 right-[345px] flex flex-col gap-1.5 z-20">
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
          <button
            onClick={() => setMapStyle((s) => (s === 'dark-ops' ? 'satellite-contrast' : 'dark-ops'))}
            title={mapStyle === 'dark-ops' ? 'Switch to Real-World Satellite' : 'Switch to Real-World Dark GIS'}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
              mapStyle === 'satellite-contrast' ? 'text-cyan-400 ring-1 ring-cyan-400/50' : 'text-slate-400 hover:text-white'
            }`}
            style={glassPanel(0.85)}>
            {mapStyle === 'satellite-contrast' ? '🛰️' : '🗺️'}
          </button>
        </div>

        {/* ─── LEFT PANEL: ACTIVE TRIPS & REAL-TIME ACTIVITY FEED ─────────── */}
        <div
          className="absolute left-4 top-4 bottom-4 w-80 flex flex-col overflow-hidden rounded-2xl z-20"
          style={glassPanel(0.94)}>
          {/* Header with Switcher Tabs */}
          <div className="p-3.5 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Dispatch Stream
                </h3>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AUTO SYNC
              </span>
            </div>

            {/* Tab switchers: Active Trips vs Real-Time Activity Feed */}
            <div className="flex gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('trips')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'trips'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}>
                Active Trips ({filteredVehicles.length})
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'feed'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}>
                Activity Feed ({activityFeed.length})
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {activeTab === 'trips' ? (
              /* ─── ACTIVE TRIPS CARDS (Enhanced with Route Indicators) ─── */
              filteredVehicles.map((ride) => {
                const isSel = selectedId === ride.id;
                const color = getStatusColor(ride.status);
                return (
                  <div
                    key={ride.id}
                    onClick={() => {
                      if (ride.status === 'SOS') {
                        handleOpenActiveSos('Active Trips Stream');
                      } else {
                        setShowSosIncident(false);
                        setSelectedId(isSel ? null : ride.id);
                        if (!isSel) setTracking(ride.id);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSel
                        ? 'bg-blue-600/25 border-cyan-400 shadow-md ring-1 ring-cyan-400/50'
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
                      {ride.driver} · <span className="text-cyan-300 font-mono font-normal">{ride.vehicle}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Employee: <strong className="text-white">{ride.employee}</strong> ({ride.company})
                    </div>

                    {/* Route Corridor Progress */}
                    <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5 mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-300">
                        <span>📍 {ride.pickup}</span>
                        <span className="text-slate-500">→</span>
                        <span>🏢 {ride.drop}</span>
                      </div>
                      {/* Mini progress bar */}
                      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
                          style={{ width: `${ride.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className="text-xs font-bold font-mono text-emerald-400">
                        ETA: {ride.eta}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        👥 {ride.passengers} / {ride.capacity} Passengers
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              /* ─── REAL-TIME ACTIVITY FEED STREAM (Document Page 4-5) ─── */
              <div className="space-y-2">
                {/* Filter tags for Activity Feed */}
                <div className="flex items-center gap-1 pb-2 border-b border-white/5 overflow-x-auto text-[10px]">
                  {(['all', 'trip', 'traffic', 'sos'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFeedFilter(cat)}
                      className={`px-2 py-0.5 rounded-md font-semibold capitalize transition-colors ${
                        feedFilter === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>

                {filteredFeed.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => {
                      if (evt.type === 'sos') {
                        handleOpenActiveSos('Activity Feed Event');
                      } else if (evt.tripId) {
                        setShowSosIncident(false);
                        setSelectedId(evt.tripId);
                        setTracking(evt.tripId);
                      }
                    }}
                    className="p-2.5 rounded-xl border border-white/5 transition-all cursor-pointer hover:border-slate-500 hover:scale-[1.01]"
                    style={{ background: evt.bg }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[11px] font-bold flex items-center gap-1.5 ${evt.color}`}>
                        <span>{evt.icon}</span>
                        <span>{evt.msg}</span>
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{evt.time}</span>
                    </div>
                    <div className="text-[10px] text-slate-300 pl-4">{evt.sub}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: TRIP DETAILS / SOS / HEALTH SUMMARY ──────────── */}
        <div
          className="absolute right-4 top-4 bottom-4 w-80 flex flex-col gap-3 overflow-y-auto pr-1 z-20"
          style={{ scrollbarWidth: 'none' }}>

          {/* Conditional Display:
              1. If showSosIncident is true -> CASE B: SOS INCIDENT CENTER (with close button ✕)
              2. Else if selectedRide is truthy -> CASE A: ACTIVE TRIP DETAILS (with close button ✕)
              3. Else -> CASE C: OPERATIONS HUB OVERVIEW (Default state when no ride selected & SOS not clicked)
          */}
          {showSosIncident ? (
            /* ─── CASE B: SOS INCIDENT CENTER (Document Pages 5-6) ────────── */
            <div
              className="rounded-2xl overflow-hidden border border-red-500/40 shadow-2xl flex-shrink-0 animate-in fade-in duration-300"
              style={{
                background: 'linear-gradient(180deg, rgba(80, 15, 15, 0.9), rgba(40, 10, 10, 0.95))',
                backdropFilter: 'blur(20px)',
              }}>
              <div className="px-4 py-3 bg-red-600/30 border-b border-red-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${sosIncident.status === 'Active' ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-bold text-red-200 uppercase tracking-wider">
                    SOS Incident Center
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sosIncident.status === 'Active' ? 'bg-red-600 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    }`}>
                    {sosIncident.status === 'Active' ? 'CRITICAL HIGH' : 'RESOLVED'}
                  </span>
                  <button
                    onClick={() => setShowSosIncident(false)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-red-200 hover:text-white flex items-center justify-center text-xs transition-colors"
                    title="Close SOS Center">
                    ✕
                  </button>
                </div>
              </div>

              {/* Exact Fields Specified in Document Pages 5-6 */}
              <div className="p-4 space-y-2 text-xs">
                {[
                  { label: 'Employee', val: sosIncident.employee },
                  { label: 'Company', val: sosIncident.company },
                  { label: 'Driver', val: sosIncident.driver },
                  { label: 'Vehicle', val: sosIncident.vehicle, isMono: true },
                  { label: 'Location', val: sosIncident.location },
                  { label: 'Alert Time', val: sosIncident.alertTime, isMono: true },
                  { label: 'Severity', val: sosIncident.severity, isRed: sosIncident.status === 'Active' },
                  { label: 'Status', val: sosIncident.status, isGreen: sosIncident.status === 'Resolved' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-0.5">
                    <span className="text-red-200/70 text-[11px]">{row.label}:</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        row.isMono ? 'font-mono' : ''
                      } ${row.isRed ? 'text-red-400 font-bold' : row.isGreen ? 'text-emerald-400 font-bold' : 'text-white'}`}>
                      {row.val}
                    </span>
                  </div>
                ))}

                {/* Four Required Actions from Document Page 6 */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handleTrackLiveIncident}
                    className="py-2 px-2.5 text-[11px] font-bold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors shadow-sm text-center">
                    🎯 Track Live
                  </button>
                  <button
                    onClick={() =>
                      setCallModal({
                        open: true,
                        type: 'driver',
                        name: sosIncident.driver,
                        phone: sosIncident.driverPhone,
                        title: `SOS Emergency Call: Driver`,
                      })
                    }
                    className="py-2 px-2.5 text-[11px] font-semibold text-red-200 hover:text-white rounded-xl border border-red-500/40 hover:bg-red-600/20 transition-colors text-center">
                    📞 Call Driver
                  </button>
                  <button
                    onClick={() =>
                      setCallModal({
                        open: true,
                        type: 'employee',
                        name: sosIncident.employee,
                        phone: sosIncident.employeePhone,
                        title: `SOS Emergency Call: Passenger`,
                      })
                    }
                    className="py-2 px-2.5 text-[11px] font-semibold text-red-200 hover:text-white rounded-xl border border-red-500/40 hover:bg-red-600/20 transition-colors text-center">
                    📱 Call Employee
                  </button>
                  <button
                    onClick={handleResolveIncident}
                    className="py-2 px-2.5 text-[11px] font-bold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm text-center">
                    ✓ Resolve
                  </button>
                </div>
              </div>
            </div>
          ) : selectedRide ? (
            /* ─── CASE A: ACTIVE TRIP DETAILS PANEL (Document Page 3) ─────── */
            <div
              className="rounded-2xl p-4 border border-cyan-500/40 shadow-2xl flex-shrink-0 dialog-in"
              style={{
                background: 'linear-gradient(180deg, rgba(14, 30, 60, 0.95), rgba(9, 18, 36, 0.95))',
                backdropFilter: 'blur(20px)',
              }}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Active Trip Details
                  </span>
                  <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                    {selectedRide.tripId}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${getStatusColor(selectedRide.status)}22`,
                      color: getStatusColor(selectedRide.status),
                      border: `1px solid ${getStatusColor(selectedRide.status)}44`,
                    }}>
                    ● {selectedRide.status}
                  </span>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs">
                    ✕
                  </button>
                </div>
              </div>

              {/* Exact Fields Specified in Document Page 3 */}
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Trip ID', val: selectedRide.tripId, isMono: true, highlight: true },
                  { label: 'Employee', val: selectedRide.employee },
                  { label: 'Company', val: selectedRide.company },
                  { label: 'Driver', val: selectedRide.driver },
                  { label: 'Vehicle', val: selectedRide.vehicle, isMono: true },
                  { label: 'Passengers', val: `${selectedRide.passengers} / ${selectedRide.capacity}` },
                  { label: 'Current Location', val: selectedRide.currentLocation },
                  { label: 'Destination', val: selectedRide.drop },
                  { label: 'ETA', val: selectedRide.eta, isMono: true, isGreen: true },
                  { label: 'Status', val: selectedRide.status },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400 text-[11px]">{row.label}:</span>
                    <span
                      className={`text-[11px] font-semibold ${
                        row.isMono ? 'font-mono' : ''
                      } ${row.isGreen ? 'text-emerald-400' : row.highlight ? 'text-cyan-300' : 'text-white'}`}>
                      {row.val}
                    </span>
                  </div>
                ))}
              </div>

              {/* Route Progress Visual Stepper */}
              <div className="mt-3 p-2.5 bg-slate-900/80 rounded-xl border border-white/5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Route Stage Progress
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold mb-1">
                  <span className="text-emerald-400">Pickup</span>
                  <span className="text-cyan-300">On Route ({selectedRide.progressPct}%)</span>
                  <span className="text-slate-500">Destination</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${selectedRide.progressPct}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  onClick={() =>
                    setCallModal({
                      open: true,
                      type: 'driver',
                      name: selectedRide.driver,
                      phone: selectedRide.driverPhone,
                      title: `Driver Call — ${selectedRide.vehicle}`,
                    })
                  }
                  className="py-2 px-3 text-xs font-bold text-white rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs text-center">
                  📞 Call Driver
                </button>
                <button
                  onClick={() =>
                    setCallModal({
                      open: true,
                      type: 'employee',
                      name: selectedRide.employee,
                      phone: selectedRide.employeePhone,
                      title: `Employee Comms — ${selectedRide.company}`,
                    })
                  }
                  className="py-2 px-3 text-xs font-semibold text-cyan-200 hover:text-white rounded-xl border border-cyan-500/30 hover:bg-cyan-600/20 transition-colors text-center">
                  📱 Call Employee
                </button>
              </div>
            </div>
          ) : (
            /* ─── CASE C: OPERATIONS HUB OVERVIEW (Default State) ─────── */
            <div
              className="rounded-2xl p-4 border border-white/10 shadow-2xl flex-shrink-0 animate-in fade-in duration-300"
              style={glassPanel(0.92)}>
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Operations Overview
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    Pune Central Dispatch
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Interactive Banner: Only when Active SOS exists */}
              {sosIncident.status === 'Active' ? (
                <div
                  onClick={() => handleOpenActiveSos('Overview SOS Banner')}
                  className="p-3 mb-3 rounded-xl bg-gradient-to-r from-red-950/80 to-red-900/60 border border-red-500/40 hover:border-red-400 cursor-pointer transition-all shadow-md group">
                  <div className="flex items-center justify-between text-xs font-bold text-red-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      🚨 1 Active SOS Incident
                    </span>
                    <span className="text-[10px] text-red-300 group-hover:text-white underline">
                      View Alert →
                    </span>
                  </div>
                  <p className="text-[11px] text-red-200/80 mt-1">
                    {sosIncident.employee} ({sosIncident.company}) · {sosIncident.location}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 mb-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <span>✅</span>
                  <span className="text-[11px]">All emergency channels normal. 0 active SOS.</span>
                </div>
              )}

              {/* Quick Fleet Highlights */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 text-[11px]">Active Cabs Stream:</span>
                  <span className="text-white font-mono font-bold">8 Vehicles Active</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 text-[11px]">Primary Corridor:</span>
                  <span className="text-cyan-300 font-semibold">Hinjewadi IT Park</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-slate-400 text-[11px]">Standby Fleet:</span>
                  <span className="text-emerald-400 font-mono font-semibold">2 Available</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-slate-900/60 rounded-xl border border-white/5 text-[11px] text-slate-400">
                💡 <strong className="text-slate-300">Notice:</strong> Click on any vehicle marker or trip card to inspect telemetry, or click on <span className="text-red-400 font-semibold cursor-pointer underline" onClick={() => handleOpenActiveSos('Guide Text')}>🚨 1 Active SOS</span> to view emergency notification.
              </div>
            </div>
          )}

          {/* ─── OPERATIONS HEALTH SUMMARY (Document Page 7) ─────────────── */}
          <div className="rounded-2xl p-4 flex-shrink-0" style={glassPanel(0.88)}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Operations Health Summary
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                DAILY METRICS
              </span>
            </div>

            {/* Exactly Specified Metrics from Document Page 7 */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                <span className="text-slate-300">Active Trips</span>
                <span className="text-white font-mono font-bold">{OPS_HEALTH_METRICS.activeTrips}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                <span className="text-slate-300">On-Time Trips</span>
                <span className="text-emerald-400 font-mono font-bold">{OPS_HEALTH_METRICS.onTimeTrips}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                <span className="text-slate-300">Delayed Trips</span>
                <span className="text-amber-400 font-mono font-bold">{OPS_HEALTH_METRICS.delayedTrips}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/5">
                <span className="text-slate-300">SOS Incidents</span>
                <span className="text-red-400 font-mono font-bold">
                  {sosIncident.status === 'Active' ? '2 (1 Active)' : '2 (Resolved)'}
                </span>
              </div>

              {/* Fleet Utilization Progress */}
              <div className="pt-1">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-300">Fleet Utilization</span>
                  <span className="text-cyan-300 font-mono font-bold">{OPS_HEALTH_METRICS.fleetUtilization}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-700"
                    style={{ width: `${OPS_HEALTH_METRICS.fleetUtilization}%` }}
                  />
                </div>
              </div>

              {/* Average ETA Accuracy Progress */}
              <div className="pt-1">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-300">Average ETA Accuracy</span>
                  <span className="text-emerald-400 font-mono font-bold">{OPS_HEALTH_METRICS.etaAccuracy}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${OPS_HEALTH_METRICS.etaAccuracy}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MAP BOTTOM LEGEND (When no trip is inspected) ──────────────── */}
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

      {/* ─── INTERACTIVE CALL MODAL (DIALER SIMULATOR) ───────────────────── */}
      {callModal && callModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md dialog-in"
          onClick={() => setCallModal(null)}>
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/40 p-6"
            style={{ background: '#091122' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-cyan-400 mx-auto flex items-center justify-center text-2xl animate-pulse">
                📞
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{callModal.title}</h3>
                <p className="text-xs text-cyan-300 font-semibold mt-1">{callModal.name}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{callModal.phone}</p>
              </div>

              <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/5 text-[11px] text-slate-300 text-left space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dispatch Desk:</span>
                  <span className="text-white font-mono">Pune Central Ops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audio Codec:</span>
                  <span className="text-emerald-400 font-mono">Encrypted VoIP (HD)</span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <a
                  href={`tel:${callModal.phone}`}
                  onClick={() => showToast(`Calling ${callModal.name} at ${callModal.phone}…`)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors">
                  Direct Dial
                </a>
                <button
                  onClick={() => setCallModal(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors">
                  End Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
