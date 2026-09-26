import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useDispatchStore } from '../services/dispatch/useDispatchStore';
import { getMapboxRasterTileUrl } from '../services/mapbox/mapboxService';

// ─── TYPES ─────────────────────────────────────────────────────────────────
export interface Passenger {
  id: string;
  name: string;
  dept: string;
  phone: string;
  seat: string;
  pickupTime: string;
  status: 'picked_up' | 'next' | 'scheduled';
  address: string;
}

export interface RouteStop {
  id: string;
  name: string;
  landmark: string;
  x: number; // percentage 0-100 on map
  y: number; // percentage 0-100 on map
  scheduledTime: string;
  etaMinutes: number;
  passenger?: Passenger;
  isDrop?: boolean;
}

export interface RouteRow {
  id: string;
  name: string;
  organization: string;
  driver: string;
  driverPhone: string;
  vehicle: string;
  vehicleModel: string;
  capacity: number; // Cab capacity (e.g. 4)
  employees: number; // 2, 3, or 4 employees in cab
  stops: number;
  distance: string;
  eta: string;
  status: 'Active' | 'Delayed' | 'Inactive';
  pickup: string;
  drop: string;
  passengers: Passenger[];
  waypoints: RouteStop[];
}

// ─── REAL-WORLD PUNE GIS MAP TILES (Zoom 12 covers Hinjewadi, Wakad, Kothrud, Central Pune, Airport, Magarpatta, Kharadi) ───
const PUNE_MAP_TILES = [
  { x: 2886, y: 1832 }, { x: 2887, y: 1832 }, { x: 2888, y: 1832 }, { x: 2889, y: 1832 },
  { x: 2886, y: 1833 }, { x: 2887, y: 1833 }, { x: 2888, y: 1833 }, { x: 2889, y: 1833 },
  { x: 2886, y: 1834 }, { x: 2887, y: 1834 }, { x: 2888, y: 1834 }, { x: 2889, y: 1834 },
];

const getMapTileUrl = (x: number, y: number, style: 'dark' | 'satellite' | 'streets') => {
  const mapboxStyle = style === 'satellite' ? 'satellite-streets' : style === 'streets' ? 'streets' : 'dark';
  return getMapboxRasterTileUrl(mapboxStyle, 12, x, y);
};

// ─── SEED CORPORATE CAB ROUTES (Realistic 2, 3, 4 passengers) ──────────────
const SEED_CAB_ROUTES: RouteRow[] = [
  {
    id: 'RT-001',
    name: 'Kothrud → Hinjewadi Ph1',
    organization: 'TCS Pune Campus',
    driver: 'Raj Kumar',
    driverPhone: '+91 98765 10482',
    vehicle: 'MH12AB1234',
    vehicleModel: 'Maruti Suzuki Swift Dzire (White)',
    capacity: 4,
    employees: 3, // 3 employees in cab
    stops: 4,
    distance: '18 km',
    eta: '32 min',
    status: 'Active',
    pickup: 'Kothrud Depot',
    drop: 'TCS Hinjewadi Ph1',
    passengers: [
      { id: 'EMP-10421', name: 'Priya Desai', dept: 'BFSI Technology', phone: '+91 98221 44321', seat: 'Front Left', pickupTime: '08:12 AM', status: 'picked_up', address: 'Kothrud Depot, Gate 3' },
      { id: 'EMP-10482', name: 'Akshat Sharma', dept: 'Operations & Transport', phone: '+91 98765 10482', seat: 'Rear Right', pickupTime: '08:20 AM', status: 'picked_up', address: 'Karve Nagar, Vitthal Mandir' },
      { id: 'EMP-10495', name: 'Rohan Joshi', dept: 'Cloud Infrastructure', phone: '+91 97654 32109', seat: 'Rear Left', pickupTime: '08:31 AM', status: 'next', address: 'Chandani Chowk, Near Flyover' },
    ],
    waypoints: [
      { id: 's1', name: 'Kothrud Depot', landmark: 'Depot Gate 3', x: 20, y: 78, scheduledTime: '08:10 AM', etaMinutes: 0, isDrop: false },
      { id: 's2', name: 'Karve Nagar', landmark: 'Vitthal Mandir Corner', x: 34, y: 64, scheduledTime: '08:18 AM', etaMinutes: 0, isDrop: false },
      { id: 's3', name: 'Chandani Chowk', landmark: 'NDA Road Overpass', x: 48, y: 50, scheduledTime: '08:30 AM', etaMinutes: 4, isDrop: false },
      { id: 's4', name: 'Wakad Bridge', landmark: 'NH 48 Bypass Interchange', x: 62, y: 36, scheduledTime: '08:42 AM', etaMinutes: 16, isDrop: false },
      { id: 's5', name: 'TCS Hinjewadi Ph1', landmark: 'Sahyadri Park Main Gate', x: 82, y: 22, scheduledTime: '08:52 AM', etaMinutes: 26, isDrop: true },
    ],
  },
  {
    id: 'RT-002',
    name: 'Baner → Hinjewadi Ph2',
    organization: 'Infosys BPM',
    driver: 'Suresh Yadav',
    driverPhone: '+91 98220 54321',
    vehicle: 'MH12CD5678',
    vehicleModel: 'Maruti Suzuki Ertiga (Silver)',
    capacity: 6,
    employees: 4, // 4 employees in cab
    stops: 5,
    distance: '12 km',
    eta: '22 min',
    status: 'Active',
    pickup: 'Baner Circle',
    drop: 'Infosys Ph2 Gate 3',
    passengers: [
      { id: 'EMP-20101', name: 'Sneha Rao', dept: 'Financial Analytics', phone: '+91 98111 22334', seat: 'Front Left', pickupTime: '08:15 AM', status: 'picked_up', address: 'Baner Circle, Orchid Hotel' },
      { id: 'EMP-20102', name: 'Vikram Joshi', dept: 'Enterprise QA', phone: '+91 98222 33445', seat: 'Rear Left', pickupTime: '08:24 AM', status: 'picked_up', address: 'Sus Road, Balaji Temple' },
      { id: 'EMP-20103', name: 'Aditya Patil', dept: 'Supply Chain Ops', phone: '+91 98333 44556', seat: 'Rear Right', pickupTime: '08:33 AM', status: 'next', address: 'Mahalunge Stadium Gate' },
      { id: 'EMP-20104', name: 'Neha Kulkarni', dept: 'HR Talent Hub', phone: '+91 98444 55667', seat: 'Rear Middle', pickupTime: '08:40 AM', status: 'scheduled', address: 'Maan Hinjewadi Link' },
    ],
    waypoints: [
      { id: 's1', name: 'Baner Circle', landmark: 'Orchid Hotel', x: 24, y: 72, scheduledTime: '08:15 AM', etaMinutes: 0 },
      { id: 's2', name: 'Sus Road', landmark: 'Balaji Temple', x: 42, y: 55, scheduledTime: '08:24 AM', etaMinutes: 0 },
      { id: 's3', name: 'Mahalunge', landmark: 'Sports Complex', x: 60, y: 38, scheduledTime: '08:34 AM', etaMinutes: 6 },
      { id: 's4', name: 'Infosys Ph2 Gate', landmark: 'Campus Gate 3', x: 80, y: 22, scheduledTime: '08:46 AM', etaMinutes: 18, isDrop: true },
    ],
  },
  {
    id: 'RT-003',
    name: 'Aundh → Magarpatta City',
    organization: 'Wipro Technologies',
    driver: 'Mohan Singh',
    driverPhone: '+91 98555 66778',
    vehicle: 'MH12EF9012',
    vehicleModel: 'Hyundai Aura (White)',
    capacity: 4,
    employees: 3, // 3 employees in cab
    stops: 4,
    distance: '22 km',
    eta: '38 min',
    status: 'Active',
    pickup: 'Aundh Bremen Chowk',
    drop: 'Magarpatta Tower 4',
    passengers: [
      { id: 'EMP-30401', name: 'Anand Verma', dept: 'Cyber Security', phone: '+91 98666 77889', seat: 'Front Left', pickupTime: '08:05 AM', status: 'picked_up', address: 'Bremen Chowk, Aundh' },
      { id: 'EMP-30402', name: 'Ritu Singh', dept: 'SAP S/4HANA', phone: '+91 98777 88990', seat: 'Rear Right', pickupTime: '08:16 AM', status: 'picked_up', address: 'Shivaji Nagar, Sancheti' },
      { id: 'EMP-30403', name: 'Rahul Kale', dept: 'Full Stack Engineering', phone: '+91 98888 99001', seat: 'Rear Left', pickupTime: '08:32 AM', status: 'next', address: 'Kalyani Nagar Joggers Park' },
    ],
    waypoints: [
      { id: 's1', name: 'Aundh Bremen Chowk', landmark: 'Spicer College', x: 22, y: 74, scheduledTime: '08:05 AM', etaMinutes: 0 },
      { id: 's2', name: 'Shivaji Nagar', landmark: 'Sancheti Chowk', x: 42, y: 58, scheduledTime: '08:18 AM', etaMinutes: 0 },
      { id: 's3', name: 'Kalyani Nagar', landmark: 'Joggers Park', x: 62, y: 40, scheduledTime: '08:33 AM', etaMinutes: 8 },
      { id: 's4', name: 'Magarpatta Tower 4', landmark: 'Cybercity Circle', x: 82, y: 24, scheduledTime: '08:50 AM', etaMinutes: 24, isDrop: true },
    ],
  },
  {
    id: 'RT-004',
    name: 'Viman Nagar → Kharadi EON',
    organization: 'Cognizant',
    driver: 'Arjun Nair',
    driverPhone: '+91 98234 56789',
    vehicle: 'MH12GH3456',
    vehicleModel: 'Mahindra Scorpio (Silver)',
    capacity: 6,
    employees: 4, // 4 employees in cab
    stops: 5,
    distance: '7 km',
    eta: '16 min',
    status: 'Active',
    pickup: 'Phoenix Marketcity',
    drop: 'EON Free Zone Phase 2',
    passengers: [
      { id: 'EMP-40111', name: 'Sameer Deshmukh', dept: 'Data Engineering', phone: '+91 98999 00112', seat: 'Front Left', pickupTime: '08:22 AM', status: 'picked_up', address: 'Phoenix Marketcity Gate 2' },
      { id: 'EMP-40112', name: 'Pooja Mehta', dept: 'Product Design', phone: '+91 98123 45678', seat: 'Rear Left', pickupTime: '08:28 AM', status: 'next', address: 'Symbiosis College Road' },
      { id: 'EMP-40113', name: 'Kunal Shah', dept: 'DevOps / AWS', phone: '+91 98234 56781', seat: 'Rear Right', pickupTime: '08:34 AM', status: 'scheduled', address: 'Thite Nagar Bypass' },
      { id: 'EMP-40114', name: 'Divya Nair', dept: 'Agile Delivery', phone: '+91 98345 67892', seat: 'Rear Middle', pickupTime: '08:40 AM', status: 'scheduled', address: 'World Trade Center Kharadi' },
    ],
    waypoints: [
      { id: 's1', name: 'Phoenix Marketcity', landmark: 'North Gate', x: 18, y: 70, scheduledTime: '08:20 AM', etaMinutes: 0 },
      { id: 's2', name: 'Symbiosis Rd', landmark: 'College Circle', x: 38, y: 55, scheduledTime: '08:28 AM', etaMinutes: 4 },
      { id: 's3', name: 'Thite Nagar', landmark: 'Riverbank Road', x: 58, y: 40, scheduledTime: '08:36 AM', etaMinutes: 10 },
      { id: 's4', name: 'Kharadi EON Ph2', landmark: 'Cluster C Gate', x: 80, y: 22, scheduledTime: '08:46 AM', etaMinutes: 18, isDrop: true },
    ],
  },
  {
    id: 'RT-005',
    name: 'Wakad → Hinjewadi Ph1',
    organization: 'TCS Pune Campus',
    driver: 'Deepak Patel',
    driverPhone: '+91 98456 78901',
    vehicle: 'MH12IJ7890',
    vehicleModel: 'Maruti Suzuki Dzire (White)',
    capacity: 4,
    employees: 2, // 2 employees in cab
    stops: 3,
    distance: '8 km',
    eta: '17 min',
    status: 'Delayed',
    pickup: 'Wakad Signal',
    drop: 'TCS Hinjewadi Ph1',
    passengers: [
      { id: 'EMP-50011', name: 'Kavita Shinde', dept: 'Enterprise Risk', phone: '+91 98567 89012', seat: 'Front Left', pickupTime: '08:25 AM', status: 'picked_up', address: 'Wakad Signal, Sayaji Corner' },
      { id: 'EMP-50012', name: 'Amit Kadam', dept: 'Software Architecture', phone: '+91 98678 90123', seat: 'Rear Right', pickupTime: '08:35 AM', status: 'next', address: 'Dange Chowk BRT Station' },
    ],
    waypoints: [
      { id: 's1', name: 'Wakad Signal', landmark: 'Sayaji Corner', x: 20, y: 76, scheduledTime: '08:25 AM', etaMinutes: 0 },
      { id: 's2', name: 'Dange Chowk', landmark: 'BRT Junction', x: 50, y: 48, scheduledTime: '08:36 AM', etaMinutes: 5 },
      { id: 's3', name: 'TCS Hinjewadi Ph1', landmark: 'Campus Circle', x: 80, y: 22, scheduledTime: '08:48 AM', etaMinutes: 16, isDrop: true },
    ],
  },
  {
    id: 'RT-006',
    name: 'Hadapsar → Magarpatta',
    organization: 'Capgemini India',
    driver: 'Santosh Rao',
    driverPhone: '+91 98789 01234',
    vehicle: 'MH12KL2345',
    vehicleModel: 'Toyota Etios (White)',
    capacity: 4,
    employees: 3, // 3 employees in cab
    stops: 4,
    distance: '5 km',
    eta: '12 min',
    status: 'Active',
    pickup: 'Hadapsar Gadital',
    drop: 'Magarpatta Tower 7',
    passengers: [
      { id: 'EMP-60021', name: 'Deepak Kulkarni', dept: 'Oracle ERP', phone: '+91 98890 12345', seat: 'Front Left', pickupTime: '08:30 AM', status: 'picked_up', address: 'Hadapsar Gadital BRT' },
      { id: 'EMP-60022', name: 'Shruti Patwardhan', dept: 'UX Research', phone: '+91 98901 23456', seat: 'Rear Left', pickupTime: '08:36 AM', status: 'picked_up', address: 'NIBM Road Corner' },
      { id: 'EMP-60023', name: 'Nikhil Joshi', dept: 'Backend Platform', phone: '+91 98012 34567', seat: 'Rear Right', pickupTime: '08:42 AM', status: 'next', address: 'Nobel Hospital Chowk' },
    ],
    waypoints: [
      { id: 's1', name: 'Hadapsar Gadital', landmark: 'BRT Terminal', x: 18, y: 72, scheduledTime: '08:30 AM', etaMinutes: 0 },
      { id: 's2', name: 'NIBM Rd Corner', landmark: 'Axis Bank', x: 44, y: 52, scheduledTime: '08:38 AM', etaMinutes: 0 },
      { id: 's3', name: 'Nobel Chowk', landmark: 'Hospital Gate', x: 64, y: 38, scheduledTime: '08:44 AM', etaMinutes: 4 },
      { id: 's4', name: 'Magarpatta Tower 7', landmark: 'Main Cybercity', x: 82, y: 22, scheduledTime: '08:52 AM', etaMinutes: 12, isDrop: true },
    ],
  },
  {
    id: 'RT-007',
    name: 'Kothrud → Baner High St',
    organization: 'Wipro Technologies',
    driver: 'Ravi Sharma',
    driverPhone: '+91 98123 78901',
    vehicle: 'MH12MN6789',
    vehicleModel: 'Maruti Suzuki Dzire (Silver)',
    capacity: 4,
    employees: 2, // 2 employees in cab
    stops: 3,
    distance: '10 km',
    eta: '20 min',
    status: 'Active',
    pickup: 'Paud Road',
    drop: 'Baner High Street',
    passengers: [
      { id: 'EMP-70031', name: 'Mahesh Gaikwad', dept: 'Cloud Security', phone: '+91 98234 89012', seat: 'Front Left', pickupTime: '08:20 AM', status: 'picked_up', address: 'Paud Road, Ideal Colony' },
      { id: 'EMP-70032', name: 'Swati Rao', dept: 'Business Operations', phone: '+91 98345 90123', seat: 'Rear Right', pickupTime: '08:32 AM', status: 'next', address: 'Karve Statue Chowk' },
    ],
    waypoints: [
      { id: 's1', name: 'Paud Road', landmark: 'Ideal Colony Gate', x: 20, y: 76, scheduledTime: '08:20 AM', etaMinutes: 0 },
      { id: 's2', name: 'Karve Statue', landmark: 'Kothrud Corner', x: 50, y: 50, scheduledTime: '08:32 AM', etaMinutes: 3 },
      { id: 's3', name: 'Baner High St', landmark: 'Wipro Office Hub', x: 80, y: 22, scheduledTime: '08:45 AM', etaMinutes: 16, isDrop: true },
    ],
  },
  {
    id: 'RT-008',
    name: 'Pimpri → Hinjewadi Ph3',
    organization: 'Infosys BPM',
    driver: 'Vikram Joshi',
    driverPhone: '+91 98456 01234',
    vehicle: 'MH12OP0123',
    vehicleModel: 'Maruti Suzuki Ertiga (White)',
    capacity: 6,
    employees: 3, // 3 employees in cab
    stops: 4,
    distance: '15 km',
    eta: '30 min',
    status: 'Inactive',
    pickup: 'Pimpri Chowk',
    drop: 'Infosys Ph3 SEZ',
    passengers: [
      { id: 'EMP-80041', name: 'Tanvi Joshi', dept: 'BPM Services', phone: '+91 98567 12345', seat: 'Front Left', pickupTime: '08:10 AM', status: 'scheduled', address: 'Pimpri Chowk Metro' },
      { id: 'EMP-80042', name: 'Omkar Pawar', dept: 'Compliance Ops', phone: '+91 98678 23456', seat: 'Rear Left', pickupTime: '08:22 AM', status: 'scheduled', address: 'Chinchwad Station' },
      { id: 'EMP-80043', name: 'Harshada Mane', dept: 'Human Capital', phone: '+91 98789 34567', seat: 'Rear Right', pickupTime: '08:35 AM', status: 'scheduled', address: 'Wakad Bridge Corner' },
    ],
    waypoints: [
      { id: 's1', name: 'Pimpri Chowk', landmark: 'Metro Pillar 42', x: 18, y: 78, scheduledTime: '08:10 AM', etaMinutes: 0 },
      { id: 's2', name: 'Chinchwad', landmark: 'Railway Station Rd', x: 38, y: 60, scheduledTime: '08:22 AM', etaMinutes: 10 },
      { id: 's3', name: 'Wakad Bridge', landmark: 'Highway Entry', x: 60, y: 40, scheduledTime: '08:35 AM', etaMinutes: 22 },
      { id: 's4', name: 'Hinjewadi Ph3', landmark: 'Infosys SEZ Gate', x: 82, y: 20, scheduledTime: '08:50 AM', etaMinutes: 35, isDrop: true },
    ],
  },
];

export default function RoutesView() {
  const dispatchState = useDispatchStore();
  const isRT001Reassigned = Boolean(
    dispatchState.currentReassignment &&
    ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(dispatchState.currentReassignment.status)
  );

  const [routes, setRoutes] = useState<RouteRow[]>(SEED_CAB_ROUTES);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showAssignDriver, setShowAssignDriver] = useState(false);
  const [toast, setToast] = useState('');

  // ─── DYNAMIC CAB SIMULATION & REAL-WORLD MAP STATE ────────────────────────
  const [mapStyle, setMapStyle] = useState<'dark' | 'satellite' | 'streets'>('dark');
  const [simPlaying, setSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState<0.5 | 1 | 2>(1); // 0.5x Slow, 1x Normal, 2x Fast
  const [cabProgress, setCabProgress] = useState(0.28); // 0.0 to 1.0 along the route
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3200);
  };

  // Filter routes
  const filteredRoutes = routes.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q) ||
      r.driver.toLowerCase().includes(q) ||
      r.vehicle.toLowerCase().includes(q)
    );
  });

  const activeRoute = filteredRoutes[selectedIdx] ?? routes[0];

  // Dynamic simulation loop moving the cab along the road route at realistic, slow speed
  useEffect(() => {
    if (!simPlaying) return;
    const interval = setInterval(() => {
      setCabProgress((prev) => {
        // Slow realistic city commute pace:
        // - At 1x speed: 0.0006 per 60ms = ~0.01 per second (~100 seconds to cover 18km route)
        // - At 0.5x speed: 0.0003 per 60ms = ~0.005 per second (~200 seconds, gentle cruising)
        // - At 2x speed: 0.0012 per 60ms = ~0.02 per second (~50 seconds)
        const step = 0.0006 * simSpeed;
        const next = prev + step;
        return next > 0.99 ? 0.01 : next;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [simPlaying, simSpeed]);

  // Interpolate position along the waypoints of active route
  const getCabPosition = () => {
    const pts = activeRoute.waypoints;
    if (pts.length < 2) return { x: 50, y: 50, heading: 0, currentStopIdx: 0 };

    const totalSegments = pts.length - 1;
    const segmentFloat = cabProgress * totalSegments;
    const segIdx = Math.min(Math.floor(segmentFloat), totalSegments - 1);
    const segPct = segmentFloat - segIdx;

    const p1 = pts[segIdx];
    const p2 = pts[segIdx + 1];

    const currentX = p1.x + (p2.x - p1.x) * segPct;
    const currentY = p1.y + (p2.y - p1.y) * segPct;

    // Heading calculation in degrees
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const heading = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x: currentX, y: currentY, heading, currentStopIdx: segIdx };
  };

  // Dynamic realistic telemetry (speed in km/h based on stops, distance covered)
  const getDynamicTelemetry = () => {
    const pos = getCabPosition();
    const totalSegs = activeRoute.waypoints.length - 1;
    const segFloat = cabProgress * totalSegs;
    const distToStop = Math.abs(segFloat - Math.round(segFloat));
    // Slower speed near pickup stops (14-20 km/h), faster on open bypass road (38-48 km/h)
    const baseSpeed = distToStop < 0.14 ? 16 : 42;
    const currentSpeed = Math.round(baseSpeed + Math.sin(cabProgress * 18) * 3);
    const totalDistNum = parseFloat(activeRoute.distance) || 15;
    const kmCovered = (cabProgress * totalDistNum).toFixed(1);

    return {
      ...pos,
      speedKmh: currentSpeed,
      kmCovered,
      pctProgress: Math.round(cabProgress * 100),
    };
  };

  const telemetry = getDynamicTelemetry();
  const cabPos = telemetry;

  // Color helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#22c55e';
      case 'Delayed':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="flex h-full w-full slide-in overflow-hidden relative bg-slate-100">
      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-700 dialog-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {toast}
        </div>
      )}

      {/* ─── LEFT PANEL: CORPORATE CAB ROUTES LIST ───────────────────────── */}
      <aside className="w-76 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex-shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cab Routes</h3>
              <p className="text-[11px] text-slate-500">
                Shared Corporate Commutes · <strong className="text-blue-600">2-4 seats/cab</strong>
              </p>
            </div>
            <button
              onClick={() => showToast('Route creation wizard launched')}
              className="px-2.5 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-xs">
              + New Cab
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Search cab by driver, plate, route…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIdx(0);
              }}
            />
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Routes List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/40">
          {filteredRoutes.map((route, idx) => {
            const isSelected = activeRoute.id === route.id;
            const statusColor = getStatusColor(route.status);
            return (
              <div
                key={route.id}
                onClick={() => {
                  setSelectedIdx(idx);
                  setCabProgress(0.2); // reset simulation near start
                  setSelectedPassenger(null);
                }}
                className={`w-full text-left rounded-2xl p-3.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-400 bg-blue-50/70 shadow-sm ring-1 ring-blue-400/40'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {route.id}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: statusColor, boxShadow: `0 0 5px ${statusColor}` }}
                    />
                    <span className="text-[10px] font-bold" style={{ color: statusColor }}>
                      {route.status}
                    </span>
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-900 leading-snug mb-1">
                  {route.name}
                </div>
                <div className="text-[11px] font-medium text-blue-600 mb-2">{route.organization}</div>

                {/* Driver & Vehicle Plate with Authentic Style */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span>🚗</span>
                    <span className="font-semibold text-slate-800">{route.driver}</span>
                  </div>
                  <span className="ind-plate scale-90 origin-right">
                    <span className="ind-plate-blue">IND</span>
                    {route.vehicle}
                  </span>
                </div>

                {/* Realistic Cab Capacity Metrics (2, 3, 4 passengers) */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1">
                    <span>🚏</span>
                    <span>{route.stops} stops</span>
                  </div>
                  {/* Highlighted realistic employee count */}
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                    <span>👥</span>
                    <span>{route.employees} in cab ({route.capacity} seat cab)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📍</span>
                    <span>{route.distance}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ─── MAIN CENTER AREA: DYNAMIC CAB ROUTE MAP & TELEMETRY ─────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900 relative">
        {/* Route Top Header Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs z-20 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-900">{activeRoute.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ● {activeRoute.status}
              </span>
              <span className="font-mono text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                {activeRoute.id}
              </span>
              {activeRoute.id === 'RT-001' && isRT001Reassigned && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs animate-pulse">
                  ⚡ Stop C Reassigned to Mohan Singh (DRV-208)
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="text-blue-600 font-semibold">{activeRoute.organization}</span>
              <span>·</span>
              <span>Driver: <strong className="text-slate-800">{activeRoute.driver}</strong> ({activeRoute.vehicleModel})</span>
              <span>·</span>
              <span className="font-mono text-emerald-700 font-semibold">ETA {activeRoute.eta} ({activeRoute.distance})</span>
              <span>·</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                👥 {activeRoute.employees} Employees Assigned (Sedan/Cab Pool)
              </span>
            </div>
          </div>

          {/* Quick Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast(`Driver ${activeRoute.driver} pings acknowledged`)}
              className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors border border-slate-200">
              📞 Contact Cab
            </button>
            <button
              onClick={() => showToast('Route waypoints optimized via Traffic AI')}
              className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-xs">
              ⚡ Optimize Stops
            </button>
          </div>
        </div>

        {/* ─── REALISTIC DYNAMIC ROAD MAP CANVAS WITH REAL-WORLD MAP ─── */}
        <div className="flex-1 relative overflow-hidden bg-slate-950">
          {/* ─── REAL-WORLD PUNE BACKGROUND MAP TILES ─── */}
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 select-none pointer-events-none overflow-hidden">
            {PUNE_MAP_TILES.map((t) => (
              <div key={`${t.x}-${t.y}`} className="relative w-full h-full bg-slate-950 overflow-hidden">
                <img
                  src={getMapTileUrl(t.x, t.y, mapStyle)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://basemaps.cartocdn.com/rastertiles/dark_all/12/${t.x}/${t.y}.png`;
                  }}
                  alt={`Mapbox Pune ${t.x},${t.y}`}
                  className="w-full h-full object-cover transition-opacity duration-500"
                  style={{
                    filter:
                      mapStyle === 'dark'
                        ? 'contrast(1.1) brightness(0.92)'
                        : mapStyle === 'satellite'
                        ? 'contrast(1.15) brightness(0.85)'
                        : 'none',
                    opacity: mapStyle === 'dark' ? 0.86 : mapStyle === 'satellite' ? 0.8 : 0.92,
                  }}
                  loading="eager"
                />
              </div>
            ))}
          </div>

          {/* Atmospheric Contrast & Vignette Overlay to ensure route lines are crisp */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              background:
                mapStyle === 'satellite'
                  ? 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.25) 0%, rgba(2, 6, 23, 0.85) 100%)'
                  : mapStyle === 'streets'
                  ? 'radial-gradient(ellipse at 50% 50%, rgba(15, 23, 42, 0.15) 0%, rgba(15, 23, 42, 0.65) 100%)'
                  : 'radial-gradient(ellipse at 50% 50%, rgba(2, 6, 23, 0.4) 0%, rgba(2, 6, 23, 0.9) 100%)',
            }}
          />

          {/* Subtle GIS Map Grid */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG PUNE ROAD ROUTE CARTOGRAPHY */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 650" preserveAspectRatio="none">
            <defs>
              {/* Route Path Gradients */}
              <linearGradient id="routeProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="45%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* Asphalt Road Shadow */}
              <filter id="roadShadow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ─── BACKGROUND PUNE ARTERIAL ROAD NETWORK (Visual Context) ─── */}
            <g opacity="0.22">
              {/* NH 48 Western Bypass */}
              <path d="M 80,120 Q 300,240 500,340 Q 720,440 920,540" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
              {/* River Line */}
              <path d="M 50,420 Q 350,380 650,410 Q 850,390 980,360" fill="none" stroke="#0284c7" strokeWidth="8" />
              {/* Secondary grid lines */}
              <line x1="200" y1="100" x2="250" y2="600" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
              <line x1="600" y1="100" x2="650" y2="600" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
            </g>

            {/* ─── ACTUAL REALISTIC CAB ROAD TRAJECTORY ─── */}
            {/* 1. Base Road Surface (Wide Asphalt Dark Lane) */}
            <polyline
              points={activeRoute.waypoints.map((w) => `${w.x * 10},${w.y * 6.5}`).join(' ')}
              fill="none"
              stroke="#071529"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 2. Secondary Road Border */}
            <polyline
              points={activeRoute.waypoints.map((w) => `${w.x * 10},${w.y * 6.5}`).join(' ')}
              fill="none"
              stroke="#1e3a5f"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 3. Glowing Active Commute Path */}
            <polyline
              points={activeRoute.waypoints.map((w) => `${w.x * 10},${w.y * 6.5}`).join(' ')}
              fill="none"
              stroke="url(#routeProgressGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="12 6"
              opacity="0.95"
              filter="url(#roadShadow)"
            />

            {/* ─── WAYPOINT PICKUP STOPS (Rendered with Badges) ─── */}
            {activeRoute.waypoints.map((stop, i) => {
              const svgX = stop.x * 10;
              const svgY = stop.y * 6.5;
              const isPassed = cabPos.currentStopIdx > i;
              const isCurrent = cabPos.currentStopIdx === i;

              return (
                <g key={stop.id} transform={`translate(${svgX}, ${svgY})`}>
                  {/* Outer pulse for current pickup */}
                  {isCurrent && (
                    <circle r="18" fill="#38bdf8" opacity="0.35" className="pulse-dot" />
                  )}

                  {/* Stop Marker Node */}
                  <circle
                    r={stop.isDrop ? '12' : '9'}
                    fill={stop.isDrop ? '#1d4ed8' : isPassed ? '#22c55e' : isCurrent ? '#06b6d4' : '#0f172a'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="shadow-lg"
                  />

                  {/* Number inside marker */}
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fill="#ffffff"
                    fontSize={stop.isDrop ? '9' : '8'}
                    fontWeight="bold"
                    fontFamily="monospace">
                    {stop.isDrop ? '🏢' : i + 1}
                  </text>

                  {/* Stop Label Banner */}
                  <g transform="translate(0, -18)">
                    <rect
                      x="-65"
                      y="-16"
                      width="130"
                      height="22"
                      rx="6"
                      fill="rgba(15, 23, 42, 0.94)"
                      stroke={isCurrent ? '#38bdf8' : 'rgba(255,255,255,0.2)'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="-2"
                      fill={isCurrent ? '#38bdf8' : '#ffffff'}
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif">
                      {stop.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* ─── DYNAMIC ANIMATED CAB MOVING ALONG THE ROAD (Smooth gliding at slow cruising speed) ─── */}
          <div
            className="absolute transition-[left,top] duration-75 ease-linear pointer-events-none"
            style={{
              left: `${telemetry.x}%`,
              top: `${telemetry.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 40,
            }}>
            {/* Cab Radar Pulse */}
            <div className="absolute -top-3 -left-3 w-12 h-12 rounded-full border-2 border-cyan-400 animate-ping opacity-35 pointer-events-none" />

            {/* Cab Vehicle Body */}
            <div
              className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-white shadow-2xl flex items-center justify-center transition-transform duration-75"
              style={{
                transform: `rotate(${telemetry.heading}deg)`,
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.85)',
              }}>
              <span className="text-xs">🚗</span>
            </div>

            {/* In-Cab Mini HUD Floating Tooltip */}
            <div className="absolute left-8 -top-3 bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-xl border border-cyan-400/50 shadow-2xl whitespace-nowrap z-50">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-cyan-300 font-mono">
                  {activeRoute.vehicle}
                </span>
                <span className="text-[9px] text-slate-300">· {activeRoute.driver}</span>
              </div>
              <div className="text-[9px] text-slate-300 mt-0.5 flex items-center gap-2">
                <span>Speed: <strong className="text-emerald-400 font-mono">{telemetry.speedKmh} km/h</strong></span>
                <span>·</span>
                <span>Covered: <strong className="text-cyan-300 font-mono">{telemetry.kmCovered} km</strong></span>
              </div>
            </div>
          </div>

          {/* ─── DYNAMIC SIMULATION CONTROLS & ROUTE SCRUBBER (FLOATING TOP-LEFT) ─── */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-2.5 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
            {/* Play/Pause Button */}
            <button
              onClick={() => setSimPlaying((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">
              <span>{simPlaying ? '⏸ Pause' : '▶ Play'}</span>
            </button>

            {/* Realistic Slow Speed Toggles (0.5x, 1x, 2x) */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              {([0.5, 1, 2] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimSpeed(spd)}
                  title={spd === 0.5 ? 'Slow / Cruising Speed' : spd === 1 ? 'Normal City Speed' : 'Fast Preview'}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                    simSpeed === spd ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}>
                  {spd}x {spd === 0.5 ? 'Slow' : spd === 1 ? 'Normal' : 'Fast'}
                </button>
              ))}
            </div>

            {/* Route Scrubber Slider */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 font-mono">Progress:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={cabProgress}
                onChange={(e) => setCabProgress(parseFloat(e.target.value))}
                className="w-24 md:w-32 h-1.5 accent-cyan-400 bg-slate-700 rounded-lg cursor-pointer"
                title="Scrub cab position along route"
              />
              <span className="text-[10px] font-mono text-cyan-300 font-bold min-w-[28px]">
                {telemetry.pctProgress}%
              </span>
            </div>

            {/* Reset to Start */}
            <button
              onClick={() => setCabProgress(0.02)}
              title="Reset Cab to Route Start"
              className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700">
              ↺
            </button>
          </div>

          {/* ─── REAL-WORLD MAP STYLE SWITCHER (FLOATING TOP-RIGHT) ─── */}
          <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 hidden md:inline">
              Real-World Map:
            </span>
            {(
              [
                { id: 'dark', label: '🗺️ Dark Streets' },
                { id: 'satellite', label: '🛰️ Satellite' },
                { id: 'streets', label: '🏙️ Streets' },
              ] as const
            ).map((style) => (
              <button
                key={style.id}
                onClick={() => setMapStyle(style.id)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-xl transition-all ${
                  mapStyle === style.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}>
                {style.label}
              </button>
            ))}
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" title="Real-World Pune GIS Active" />
          </div>

          {/* ─── LIVE CAB TELEMETRY SUMMARY DOCK (BOTTOM OF MAP) ─── */}
          <div className="absolute bottom-4 left-4 right-4 z-30 flex items-center justify-between p-3.5 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl text-xs text-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-lg">
                🚘
              </div>
              <div>
                <div className="font-bold flex items-center gap-2">
                  <span>{activeRoute.vehicleModel}</span>
                  <span className="ind-plate scale-90">
                    <span className="ind-plate-blue">IND</span>
                    {activeRoute.vehicle}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Driver: <strong className="text-slate-200">{activeRoute.driver}</strong> ({activeRoute.driverPhone})
                </div>
              </div>
            </div>

            {/* Dynamic Segment Status */}
            <div className="hidden md:flex items-center gap-6 text-[11px]">
              <div>
                <div className="text-slate-400">Current Leg:</div>
                <div className="font-semibold text-cyan-300">
                  {activeRoute.waypoints[cabPos.currentStopIdx]?.name} ➔{' '}
                  {activeRoute.waypoints[cabPos.currentStopIdx + 1]?.name || 'Final Campus'}
                </div>
              </div>

              <div>
                <div className="text-slate-400">Cab Capacity:</div>
                <div className="font-semibold text-emerald-400">
                  👥 {activeRoute.employees} in cab ({activeRoute.capacity} seat cab)
                </div>
              </div>

              <div>
                <div className="text-slate-400">Route Telemetry:</div>
                <div className="font-semibold text-white font-mono">
                  {telemetry.kmCovered} / {activeRoute.distance} ({telemetry.pctProgress}%) · Cruising {telemetry.speedKmh} km/h
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/60 border border-slate-700/60 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-bold text-white tracking-wide">mapbox</span>
                <span className="text-slate-400">© Mapbox</span>
              </div>
              <button
                onClick={() => showToast(`SMS sent to ${activeRoute.employees} passengers: "Cab is 4 mins away"`)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs">
                📲 Notify Passengers
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─── RIGHT PANEL: PASSENGER PICKUP SHEET & SEAT PLAN ─────────────── */}
      <aside className="w-80 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden shadow-xs">
        {/* Panel Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Cab Passenger Manifest
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activeRoute.employees} in Cab
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Assigned Corporate Pool · Swift Dzire
          </p>
        </div>

        {/* ─── PASSENGERS LIST (Realistic 2-4 employees) ─── */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Sequential Pickups ({activeRoute.passengers.length} Employees)
          </div>

          {activeRoute.passengers.map((p, pIdx) => {
            const isPicked = p.status === 'picked_up';
            const isNext = p.status === 'next';
            const isSelected = selectedPassenger?.id === p.id;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPassenger(p)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}>
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    {/* Passenger Avatar */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        isPicked ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {p.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.name}</div>
                      <div className="text-[10px] text-slate-500">{p.dept}</div>
                    </div>
                  </div>

                  {/* Pickup Status Tag */}
                  {activeRoute.id === 'RT-001' && p.id === 'EMP-10495' && isRT001Reassigned ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      ⚡ Reassigned to Mohan Singh
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isPicked
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isNext
                          ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                      {isPicked ? '✓ Onboard' : isNext ? 'Next Pickup' : 'Scheduled'}
                    </span>
                  )}
                </div>

                {/* Pickup details */}
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 mt-2 space-y-1">
                  {activeRoute.id === 'RT-001' && p.id === 'EMP-10495' && isRT001Reassigned && (
                    <div className="p-1.5 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-semibold mb-1 text-[10px]">
                      ⚡ Dispatched to Backup Cab #DRV-208 Mohan Singh (Tata Tigor EV MH14GH4321) · ETA 6m · TrustPass Handshake Active
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stop:</span>
                    <span className="font-semibold text-slate-700">{p.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Seat:</span>
                    <span className="font-bold text-blue-700 font-mono">{p.seat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="font-mono text-slate-700">{p.pickupTime}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-2.5">
                  <a
                    href={`tel:${p.phone}`}
                    className="flex-1 text-center py-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                    📞 Call
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      showToast(`SMS sent to ${p.name}: "Cab is arriving at your stop"`);
                    }}
                    className="flex-1 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    💬 Ping SMS
                  </button>
                </div>
              </div>
            );
          })}

          {/* ─── IN-CAB SEATING LAYOUT WIDGET (Cab Reality) ─── */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mt-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Swift Dzire Seating Layout
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 text-center text-xs">
              {/* Driver & Front Seat */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-slate-100 rounded-lg text-[10px] text-slate-500 font-semibold border border-slate-200">
                  🚗 Driver (Raj Kumar)
                </div>
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[10px] font-bold border border-emerald-200">
                  Seat 1: {activeRoute.passengers[0]?.name || 'Priya Desai'}
                </div>
              </div>

              {/* Rear Seats */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-[9px] font-bold border border-emerald-200">
                  Seat 2: {activeRoute.passengers[1]?.name || 'Akshat S.'}
                </div>
                <div className="p-2 bg-slate-100 text-slate-400 rounded-lg text-[9px] font-medium border border-slate-200">
                  {activeRoute.passengers[3]?.name ? `Seat 4: ${activeRoute.passengers[3].name}` : 'Empty'}
                </div>
                <div className="p-2 bg-cyan-50 text-cyan-800 rounded-lg text-[9px] font-bold border border-cyan-200">
                  Seat 3: {activeRoute.passengers[2]?.name || 'Rohan J.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
