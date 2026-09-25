import { useState, useEffect, Fragment, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import AIChatbot from './components/AIChatbot';
import LiveOpsView from './components/LiveOpsView';
import RoutesView from './components/RoutesView';

// ─── Types ───────────────────────────────────────────────────────────────────
type View =
  | 'dashboard' | 'organizations' | 'employees' | 'drivers' | 'vehicles'
  | 'rides' | 'live-ops' | 'routes' | 'safety' | 'billing' | 'analytics'
  | 'access-control' | 'policy-engine' | 'policy-simulator' | 'approvals'
  | 'security-audit' | 'settings' | 'employee-mobile' | 'driver-mobile';

// ─── Palette ─────────────────────────────────────────────────────────────────
const NAVY = '#0f172a';
const NAVY2 = '#1e293b';
const BLUE = '#1d4ed8';
const CYAN = '#0891b2';
const GREEN = '#16a34a';
const AMBER = '#d97706';
const RED = '#dc2626';
const SLATE = '#64748b';

// ─── Sample data ─────────────────────────────────────────────────────────────
const tripsData = [
  { day: 'Mon', trips: 312, completed: 298 },
  { day: 'Tue', trips: 287, completed: 271 },
  { day: 'Wed', trips: 341, completed: 329 },
  { day: 'Thu', trips: 298, completed: 284 },
  { day: 'Fri', trips: 376, completed: 362 },
  { day: 'Sat', trips: 198, completed: 191 },
  { day: 'Sun', trips: 142, completed: 138 },
];

const costData = [
  { month: 'Apr', cost: 284000 },
  { month: 'May', cost: 312000 },
  { month: 'Jun', cost: 298000 },
  { month: 'Jul', cost: 341000 },
  { month: 'Aug', cost: 329000 },
  { month: 'Sep', cost: 356000 },
];

const utilData = [
  { name: 'Fleet', value: 74 },
  { name: 'Idle', value: 26 },
];

const orgGrowthData = [
  { month: 'Apr', orgs: 18 },
  { month: 'May', orgs: 22 },
  { month: 'Jun', orgs: 27 },
  { month: 'Jul', orgs: 31 },
  { month: 'Aug', orgs: 38 },
  { month: 'Sep', orgs: 44 },
];

const incidentData = [
  { month: 'Apr', sos: 3, incidents: 8 },
  { month: 'May', sos: 2, incidents: 6 },
  { month: 'Jun', sos: 5, incidents: 12 },
  { month: 'Jul', sos: 1, incidents: 5 },
  { month: 'Aug', sos: 4, incidents: 9 },
  { month: 'Sep', sos: 2, incidents: 7 },
];

// ─── Micro-components ────────────────────────────────────────────────────────
function Badge({ label, color }: { label: string; color: 'green' | 'red' | 'amber' | 'blue' | 'slate' | 'cyan' }) {
  const cls = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  }[color];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>
      {label}
    </span>
  );
}

function StatusDot({ active }: { active?: boolean }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-green-500' : 'bg-slate-300'} ${active ? 'pulse-dot' : ''}`} />
  );
}

function KpiCard({ title, value, delta, deltaLabel, icon, accent, alert, onClick }: {
  title: string; value: string; delta?: string; deltaLabel?: string; icon: string; accent?: string;
  alert?: boolean; onClick?: () => void;
}) {
  const positive = delta && delta.startsWith('+');
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border p-4 flex flex-col gap-2.5 transition-all
        ${alert ? 'border-red-200 shadow-red-50 shadow-md' : 'border-slate-200 hover:shadow-md hover:border-slate-300'}
        ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{title}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-[1.6rem] font-bold text-slate-900 leading-none" style={accent ? { color: accent } : {}}>{value}</div>
      {delta ? (
        <div className={`text-xs font-medium flex items-center gap-1 ${positive ? 'text-green-600' : 'text-red-500'}`}>
          <span>{delta}</span>
          <span className="text-slate-400 font-normal">{deltaLabel}</span>
        </div>
      ) : (
        alert ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
            <span className="text-[11px] font-medium text-red-500">Active now</span>
          </div>
        ) : <div className="h-4" />
      )}
    </div>
  );
}

// ─── SVG Icon system ─────────────────────────────────────────────────────────
function DIcon({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) {
  const ICONS: Record<string, string[]> = {
    building:      ['M3 21h18', 'M9 21V7l6-4v18', 'M9 7h6', 'M9 11h.01', 'M15 11h.01', 'M9 15h.01', 'M15 15h.01'],
    users:         ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    truck:         ['M1 3h15v13H1z', 'M16 8h4l3 3v5h-7V8z', 'M5.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z', 'M18.5 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z'],
    ticket:        ['M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z'],
    activity:      ['M22 12h-4l-3 9L9 3l-3 9H2'],
    clock:         ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M12 6v6l4 2'],
    alert:         ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'],
    map:           ['M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z', 'M8 2v16', 'M16 6v16'],
    chart:         ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
    currency:      ['M12 1v22', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
    shield:        ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
    plus:          ['M12 5v14', 'M5 12h14'],
    'arrow-right': ['M5 12h14', 'M12 5l7 7-7 7'],
    check:         ['M20 6L9 17l-5-5'],
    refresh:       ['M23 4v6h-6', 'M1 20v-6h6', 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15'],
    grid:          ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M14 14h7v7h-7z', 'M3 14h7v7H3z'],
    'zoom-in':     ['M21 21l-4.35-4.35', 'M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z', 'M11 8v6M8 11h6'],
    'zoom-out':    ['M21 21l-4.35-4.35', 'M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z', 'M8 11h6'],
    crosshair:     ['M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z', 'M22 12h-4M6 12H2M12 6V2M12 22v-4'],
    'x':           ['M18 6L6 18', 'M6 6l12 12'],
  };
  const paths = ICONS[name] ?? ICONS['alert'];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
const LIVE_VEHICLES = [
  { id:'V1', reg:'MH12 AB 1234', driver:'Ramesh Kumar',   org:'Infosys',   trip:'TRP-10482', status:'on-trip',  eta:'12 min', route:'Hinjewadi → Kharadi',     x:28, y:42 },
  { id:'V2', reg:'MH12 CD 5678', driver:'Suresh Yadav',   org:'TCS',       trip:'TRP-10461', status:'delayed',  eta:'28 min', route:'Wakad → Viman Nagar',     x:54, y:27 },
  { id:'V3', reg:'MH12 EF 9012', driver:'Deepak Patil',   org:'Wipro',     trip:'TRP-10478', status:'arriving', eta:'4 min',  route:'Baner → MIDC Bhosari',    x:44, y:62 },
  { id:'V4', reg:'MH12 GH 3456', driver:'Arjun Nair',     org:'Infosys',   trip:'TRP-10495', status:'on-trip',  eta:'19 min', route:'Pimpri → EON IT Park',    x:19, y:35 },
  { id:'V5', reg:'MH12 IJ 7890', driver:'Vikram Singh',   org:'Cognizant', trip:'—',          status:'idle',     eta:'—',      route:'Parking — Magarpatta',     x:70, y:54 },
  { id:'V6', reg:'MH12 KL 2345', driver:'Mohan Sharma',   org:'TCS',       trip:'TRP-10489', status:'on-trip',  eta:'8 min',  route:'Koregaon Park → Hadapsar', x:64, y:70 },
  { id:'V7', reg:'MH12 MN 6789', driver:'Priya Das',      org:'Wipro',     trip:'TRP-10503', status:'arriving', eta:'2 min',  route:'Kothrud → Hinjewadi Ph3',  x:36, y:75 },
  { id:'V8', reg:'MH12 OP 1234', driver:'Sandeep Joshi',  org:'Infosys',   trip:'TRP-10512', status:'delayed',  eta:'35 min', route:'Punawale → Magarpatta',    x:82, y:37 },
];

const ACTIVE_TRIPS_DATA = [
  { id:'TRP-10482', org:'Infosys',   driver:'Ramesh Kumar', vehicle:'MH12 AB 1234', status:'On Trip',  eta:'12 min', employee:'Priya Sharma',  pickup:'Hinjewadi Ph1', drop:'Kharadi',    start:'07:42' },
  { id:'TRP-10461', org:'TCS',       driver:'Suresh Yadav', vehicle:'MH12 CD 5678', status:'Delayed',  eta:'28 min', employee:'Raj Patel',     pickup:'Wakad',         drop:'Viman Nagar',start:'07:18' },
  { id:'TRP-10478', org:'Wipro',     driver:'Deepak Patil', vehicle:'MH12 EF 9012', status:'Arriving', eta:'4 min',  employee:'Anita Mehta',   pickup:'Baner Rd',      drop:'MIDC Bhosari',start:'07:51' },
  { id:'TRP-10495', org:'Infosys',   driver:'Arjun Nair',   vehicle:'MH12 GH 3456', status:'On Trip',  eta:'19 min', employee:'Rahul Verma',   pickup:'Pimpri',        drop:'EON IT Park', start:'07:35' },
  { id:'TRP-10501', org:'Cognizant', driver:'Vikram Singh', vehicle:'MH12 IJ 7890', status:'Idle',     eta:'—',      employee:'—',             pickup:'Magarpatta',    drop:'—',           start:'—'     },
];

const ORG_KPI: Record<string, { orgs: number; employees: number; drivers: number; vehicles: number }> = {
  'All Organizations': { orgs: 44,   employees: 12847, drivers: 1203, vehicles: 896 },
  'Infosys':           { orgs: 1,    employees: 1200,  drivers: 54,   vehicles: 41  },
  'TCS':               { orgs: 1,    employees: 4200,  drivers: 182,  vehicles: 134 },
  'Wipro':             { orgs: 1,    employees: 3100,  drivers: 138,  vehicles: 102 },
  'Cognizant':         { orgs: 1,    employees: 2800,  drivers: 121,  vehicles: 91  },
};

const DASH_DATA = {
  Today: {
    totalTrips:1954, activeTrips:247, delayedTrips:18, completedTrips:1689, completionRate:86,
    chartData:[
      {label:'06:00',scheduled:120,completed:118},{label:'08:00',scheduled:380,completed:341},
      {label:'10:00',scheduled:210,completed:198},{label:'12:00',scheduled:156,completed:143},
      {label:'14:00',scheduled:298,completed:271},{label:'16:00',scheduled:420,completed:389},
      {label:'18:00',scheduled:370,completed:229},
    ],
    cost:356000, avgCost:335000, costPerTrip:228, orgNew:6,
  },
  'This Week': {
    totalTrips:13682, activeTrips:247, delayedTrips:41, completedTrips:11843, completionRate:87,
    chartData:[
      {label:'Mon',scheduled:312,completed:298},{label:'Tue',scheduled:287,completed:271},
      {label:'Wed',scheduled:341,completed:329},{label:'Thu',scheduled:298,completed:284},
      {label:'Fri',scheduled:376,completed:362},{label:'Sat',scheduled:198,completed:191},
      {label:'Sun',scheduled:142,completed:138},
    ],
    cost:2142000, avgCost:335000, costPerTrip:234, orgNew:3,
  },
  'This Month': {
    totalTrips:54918, activeTrips:247, delayedTrips:18, completedTrips:47892, completionRate:87,
    chartData:[
      {label:'W1',scheduled:12100,completed:10542},{label:'W2',scheduled:13600,completed:11891},
      {label:'W3',scheduled:14800,completed:12937},{label:'W4',scheduled:14418,completed:12522},
    ],
    cost:8568000, avgCost:335000, costPerTrip:222, orgNew:6,
  },
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────
// ─── Auth ─────────────────────────────────────────────────────────────────────
type AuthUser = {
  id: string; name: string; email: string; role: string; roleLabel: string;
  org: string; orgId: string; permissions: string[]; avatar: string;
  initView: View; requiresMfa: boolean; extraRoles?: string[];
};

const DEMO_ACCOUNTS: AuthUser[] = [
  { id: 'USR-001', name: 'Akash Mehta',   email: 'admin@shivneri.in',   role: 'super-admin',        roleLabel: 'Super Admin',        org: 'Shivneri Platform',  orgId: 'ORG-PLATFORM', permissions: ['*'], avatar: 'AM', initView: 'dashboard',       requiresMfa: true  },
  { id: 'USR-002', name: 'Akshat Gupta',  email: 'akshat@tcs.in',       role: 'transport-manager',  roleLabel: 'Transport Manager',  org: 'TCS Pune Campus',    orgId: 'ORG-001',      permissions: ['dashboard.view','employee.read','driver.read','vehicle.read','ride.read','ride.create','ride.assign','ride.cancel','route.read','tracking.view','sos.view'], avatar: 'AG', initView: 'dashboard', requiresMfa: false, extraRoles: ['Report Manager'] },
  { id: 'USR-003', name: 'Rahul Verma',   email: 'finance@infosys.in',  role: 'finance-manager',    roleLabel: 'Finance Manager',    org: 'Infosys BPM',        orgId: 'ORG-002',      permissions: ['dashboard.view','billing.view','billing.generate','billing.approve','report.view','report.export'], avatar: 'RV', initView: 'billing', requiresMfa: true },
  { id: 'USR-004', name: 'Priya Nair',    email: 'security@wipro.in',   role: 'security-manager',   roleLabel: 'Security Manager',   org: 'Wipro Technologies', orgId: 'ORG-003',      permissions: ['dashboard.view','safety.view','incident.create','incident.manage','sos.view','sos.resolve','tracking.view','audit.view'], avatar: 'PN', initView: 'safety', requiresMfa: false },
  { id: 'USR-005', name: 'Priya Sharma',  email: 'priya@tcs.in',        role: 'employee',           roleLabel: 'Employee',           org: 'TCS Pune Campus',    orgId: 'ORG-001',      permissions: ['ride.read-own','tracking.view-own','sos.trigger'], avatar: 'PS', initView: 'employee-mobile', requiresMfa: false },
  { id: 'USR-006', name: 'Raj Kumar',     email: 'raj@driver.in',       role: 'driver',             roleLabel: 'Driver',             org: 'Shivneri Fleet',     orgId: 'ORG-FLEET',    permissions: ['ride.accept','ride.start','ride.complete','sos.trigger'], avatar: 'RK', initView: 'driver-mobile', requiresMfa: false },
  { id: 'USR-007', name: 'Neha Joshi',    email: 'hr@cognizant.in',     role: 'hr-manager',         roleLabel: 'HR Manager',         org: 'Cognizant',          orgId: 'ORG-004',      permissions: ['dashboard.view','employee.read','employee.create','employee.update'], avatar: 'NJ', initView: 'employees', requiresMfa: false },
  { id: 'USR-008', name: 'Amit Shah',     email: 'ops@capgemini.in',    role: 'operations-manager', roleLabel: 'Operations Manager', org: 'Capgemini India',    orgId: 'ORG-005',      permissions: ['dashboard.view','ride.read','tracking.view','vehicle.read','driver.read','route.read'], avatar: 'AS', initView: 'live-ops', requiresMfa: false },
];

const NAV_PERMISSIONS: Partial<Record<View, string>> = {
  'dashboard':      'dashboard.view',
  'organizations':  'organization.read',
  'employees':      'employee.read',
  'drivers':        'driver.read',
  'vehicles':       'vehicle.read',
  'rides':          'ride.read',
  'live-ops':       'tracking.view',
  'routes':         'route.read',
  'safety':         'safety.view',
  'billing':        'billing.view',
  'analytics':      'report.view',
  'access-control': 'role.create',
  'policy-engine':  'policy.create',
  'policy-simulator':'policy.create',
  'approvals':      'permission.assign',
  'security-audit': 'audit.view',
  'settings':       'settings.view',
  'employee-mobile':'ride.read-own',
  'driver-mobile':  'ride.accept',
};

function canAccess(user: AuthUser, view: View): boolean {
  if (user.permissions.includes('*')) return true;
  const req = NAV_PERMISSIONS[view];
  if (!req) return true;
  return user.permissions.includes(req);
}

const NAV_ITEMS: { icon: string; label: string; view: View; group?: string }[] = [
  { icon: '▦', label: 'Overview', view: 'dashboard', group: 'Platform' },
  { icon: '🏢', label: 'Organizations', view: 'organizations' },
  { icon: '👥', label: 'Users & Employees', view: 'employees' },
  { icon: '🚗', label: 'Drivers', view: 'drivers' },
  { icon: '🚌', label: 'Vehicles', view: 'vehicles' },
  { icon: '🎫', label: 'Rides', view: 'rides' },
  { icon: '📡', label: 'Live Operations', view: 'live-ops', group: 'Operations' },
  { icon: '🗺', label: 'Routes', view: 'routes' },
  { icon: '🛡', label: 'Safety & Incidents', view: 'safety' },
  { icon: '💳', label: 'Billing', view: 'billing', group: 'Finance' },
  { icon: '📊', label: 'Analytics', view: 'analytics' },
  { icon: '🔐', label: 'Access Control', view: 'access-control', group: 'Security' },
  { icon: '⚙', label: 'Policy Engine', view: 'policy-engine' },
  { icon: '🔬', label: 'Policy Simulator', view: 'policy-simulator' },
  { icon: '✅', label: 'Approvals', view: 'approvals' },
  { icon: '🔒', label: 'Security & Audit', view: 'security-audit' },
  { icon: '📱', label: 'Employee App', view: 'employee-mobile', group: 'Mobile Apps' },
  { icon: '🚗', label: 'Driver App', view: 'driver-mobile' },
  { icon: '⚙', label: 'Settings', view: 'settings', group: 'System' },
];

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [tab, setTab]               = useState<'email' | 'otp' | 'sso'>('email');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const [mfaCode, setMfaCode]       = useState('');
  const [otp, setOtp]               = useState('');
  const [otpSent, setOtpSent]       = useState(false);
  const [step, setStep]             = useState<'form' | 'mfa' | 'loading' | 'workspace'>('form');
  const [loadMsg, setLoadMsg]       = useState('Securing your session...');
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [error, setError]           = useState('');
  const [showDemo, setShowDemo]     = useState(false);

  const startLoading = (user: AuthUser) => {
    setPendingUser(user);
    setStep('loading');
    const msgs = ['Securing your session...', 'Verifying organization access...', 'Loading your workspace...'];
    let i = 0;
    setLoadMsg(msgs[0]);
    const iv = setInterval(() => {
      i++;
      if (i < msgs.length) setLoadMsg(msgs[i]);
      else { clearInterval(iv); if (user.role === 'super-admin') setStep('workspace'); else onLogin(user); }
    }, 900);
  };

  const handleEmailLogin = () => {
    setError('');
    const found = DEMO_ACCOUNTS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) { setError('Account not found. Try a demo account below.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    setPendingUser(found);
    if (found.requiresMfa) setStep('mfa');
    else startLoading(found);
  };

  const handleMfa = () => {
    if (mfaCode !== '123456') { setError('Invalid code. Use 123456 for this demo.'); return; }
    startLoading(pendingUser!);
  };

  const handleOtp = () => {
    if (!otpSent) { setOtpSent(true); setError(''); return; }
    const found = DEMO_ACCOUNTS.find(u => u.email.toLowerCase().includes(otp.slice(0, 3).toLowerCase()) || otp === '123456');
    if (!found) { setError('Invalid OTP. Use 123456 for demo.'); return; }
    startLoading(found);
  };

  const quickLogin = (u: AuthUser) => { setPendingUser(u); if (u.requiresMfa) setStep('mfa'); else startLoading(u); };

  const WORKSPACES = [
    { name: 'TCS Pune Campus', id: 'ORG-001', role: 'Super Admin', members: 124 },
    { name: 'Infosys BPM', id: 'ORG-002', role: 'Super Admin', members: 89 },
    { name: 'Wipro Technologies', id: 'ORG-003', role: 'Super Admin', members: 67 },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: '#f8fafc' }}>
      {/* ── Left Brand Panel ── */}
      <div className="hidden lg:flex w-[42%] flex-col justify-between p-12 flex-shrink-0" style={{ background: NAVY }}>
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>S</div>
            <div>
              <div className="text-white font-black text-xl tracking-wide">SHIVNERI</div>
              <div className="text-slate-400 text-xs font-medium tracking-widest uppercase">Enterprise Transport</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-snug mb-4">
            Secure, trackable and automated corporate transportation.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            The complete enterprise mobility command center — from fleet management to real-time operations, driver safety, and AI-powered insights.
          </p>

          <div className="space-y-3 mb-10">
            {[
              ['🏢', 'Multi-tenant organization management'],
              ['🔐', 'Enterprise RBAC + ABAC policy engine'],
              ['📡', 'Real-time fleet tracking and operations'],
              ['🛡', 'Built-in SOS and safety workflows'],
              ['🤖', 'AI-powered ride intelligence'],
              ['📊', 'Advanced analytics and audit trails'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="w-6 text-center">{icon}</span>
                {text}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[['500+','Organizations'],['50K+','Employees'],['1M+','Rides/month']].map(([v,l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-white">{v}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wide">{l}</div>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-slate-600">Shivneri Platform v3.2 · SOC 2 Type II · ISO 27001 · GDPR Compliant</div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* ──── LOADING ──── */}
          {step === 'loading' && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                <span className="text-white text-2xl font-black">S</span>
              </div>
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-5" style={{ borderWidth: 3 }} />
              <div className="text-base font-semibold text-slate-800 mb-1">{loadMsg}</div>
              <div className="text-xs text-slate-400">Shivneri Enterprise · Secure Session</div>
            </div>
          )}

          {/* ──── MFA ──── */}
          {step === 'mfa' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4 text-2xl">🔐</div>
                <h2 className="text-2xl font-bold text-slate-900">Two-Factor Authentication</h2>
                <p className="text-slate-500 text-sm mt-1.5">Enter the 6-digit code from your authenticator app</p>
              </div>
              {error && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
              <div className="flex gap-2 justify-center mb-6">
                {[0,1,2,3,4,5].map(i => (
                  <input key={i} type="text" maxLength={1} className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" value={mfaCode[i] || ''} onChange={e => { const c = e.target.value.replace(/\D/,''); const a = mfaCode.split(''); a[i] = c; setMfaCode(a.join('').slice(0,6)); setError(''); }} />
                ))}
              </div>
              <div className="text-xs text-slate-400 text-center mb-6">Demo code: <span className="font-bold mono text-blue-600">123456</span></div>
              <button onClick={handleMfa} className="w-full py-3 text-sm font-bold text-white rounded-xl transition-colors" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                Verify & Continue
              </button>
              <button onClick={() => { setStep('form'); setError(''); setMfaCode(''); }} className="w-full mt-3 py-2.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">← Back to login</button>
            </div>
          )}

          {/* ──── WORKSPACE ──── */}
          {step === 'workspace' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Select Workspace</h2>
                <p className="text-slate-500 text-sm mt-1.5">You have access to multiple organizations</p>
              </div>
              <div className="space-y-3">
                {WORKSPACES.map(ws => (
                  <button key={ws.id} onClick={() => { const u = DEMO_ACCOUNTS[0]; onLogin({ ...u, org: ws.name, orgId: ws.id }); }}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                      {ws.name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{ws.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{ws.role} · {ws.members} members</div>
                    </div>
                    <span className="text-slate-300 text-lg">→</span>
                  </button>
                ))}
              </div>
              <button onClick={() => onLogin(DEMO_ACCOUNTS[0])} className="w-full mt-4 py-2.5 text-sm text-blue-600 hover:underline">Continue as Platform Admin (no org) →</button>
            </div>
          )}

          {/* ──── FORM ──── */}
          {step === 'form' && (
            <>
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2.5 mb-4 lg:hidden">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-base" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>S</div>
                  <span className="text-slate-900 font-black text-lg tracking-wide">SHIVNERI</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                <p className="text-slate-500 text-sm mt-1.5">Sign in to your Shivneri workspace</p>
              </div>

              {error && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

              {/* Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
                {(['email','otp','sso'] as const).map(t => (
                  <button key={t} onClick={() => { setTab(t); setError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {t === 'email' ? 'Email' : t === 'otp' ? 'Mobile OTP' : 'Enterprise SSO'}
                  </button>
                ))}
              </div>

              {/* Email tab */}
              {tab === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Email</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                      placeholder="name@company.com" type="email" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                    <div className="relative">
                      <input value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailLogin()}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-10"
                        placeholder="••••••••" type={showPwd ? 'text' : 'password'} />
                      <button onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs">{showPwd ? 'Hide' : 'Show'}</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer"><input type="checkbox" className="rounded" />Remember device</label>
                    <button className="text-blue-600 hover:underline">Forgot password?</button>
                  </div>
                  <button onClick={handleEmailLogin} className="w-full py-3 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                    Sign In
                  </button>
                </div>
              )}

              {/* OTP tab */}
              {tab === 'otp' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number</label>
                    <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="+91 9876543210" type="tel" />
                  </div>
                  {otpSent && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Enter OTP</label>
                      <input value={otp} onChange={e => setOtp(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 mono tracking-widest" placeholder="Enter 6-digit OTP" />
                      <div className="text-[10px] text-slate-400 mt-1">Demo OTP: <span className="font-bold text-blue-600 mono">123456</span></div>
                    </div>
                  )}
                  <button onClick={handleOtp} className="w-full py-3 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                  </button>
                </div>
              )}

              {/* SSO tab */}
              {tab === 'sso' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Email or Domain</label>
                    <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all" placeholder="name@company.com" type="email" />
                  </div>
                  <button onClick={() => quickLogin(DEMO_ACCOUNTS[0])} className="w-full py-3 text-sm font-bold text-white rounded-xl transition-opacity hover:opacity-90" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                    Continue with SSO
                  </button>
                  <div className="relative my-2"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div><span className="relative bg-slate-50 px-3 text-xs text-slate-400 mx-auto block w-fit">or continue with</span></div>
                  {[['🏢','Continue with Microsoft'],['🟢','Continue with Google Workspace']].map(([icon, label]) => (
                    <button key={label} onClick={() => quickLogin(DEMO_ACCOUNTS[0])} className="w-full flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                      <span className="text-lg">{icon}</span>{label}
                    </button>
                  ))}
                </div>
              )}

              {/* Demo accounts */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button onClick={() => setShowDemo(d => !d)} className="w-full flex items-center justify-between text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors mb-3">
                  <span>Quick Demo Login</span>
                  <span>{showDemo ? '▲' : '▼'}</span>
                </button>
                {showDemo && (
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_ACCOUNTS.map(u => (
                      <button key={u.id} onClick={() => quickLogin(u)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg,${BLUE},${CYAN})` }}>
                          {u.avatar}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{u.roleLabel}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[90px]">{u.org}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-center text-[10px] text-slate-400 mt-8">
                <a href="#" className="hover:underline">Privacy Policy</a> · <a href="#" className="hover:underline">Security</a> · <a href="#" className="hover:underline">Terms</a> · <a href="#" className="hover:underline">Help & Support</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, onNav }: { active: View; onNav: (v: View) => void }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const visibleItems = NAV_ITEMS;

  return (
    <aside
      className="flex flex-col h-screen w-56 flex-shrink-0 overflow-y-auto"
      style={{ background: NAVY, borderRight: `1px solid ${NAVY2}` }}
    >
      {/* Logo */}
      <div className="px-4 py-5 flex items-center gap-3 border-b" style={{ borderColor: NAVY2 }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm"
          style={{ background: `linear-gradient(135deg, ${BLUE}, ${CYAN})` }}
        >S</div>
        <div>
          <div className="text-white font-bold text-sm tracking-wide">SHIVNERI</div>
          <div className="text-slate-400 text-[10px] font-medium">PLATFORM ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 mt-1">
        {visibleItems.map((item, i) => {
          const isActive = active === item.view;
          const prevGroup = i > 0 ? visibleItems[i - 1].group : undefined;
          const showGroup = item.group && item.group !== prevGroup;
          return (
            <div key={item.view}>
              {showGroup && (
                <div className="px-2 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {item.group}
                </div>
              )}
              <button
                onClick={() => onNav(item.view)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-left transition-all text-sm"
                style={{
                  background: isActive ? `${BLUE}22` : 'transparent',
                  color: isActive ? '#60a5fa' : '#94a3b8',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; }}
                onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#94a3b8'; }}
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {isActive && <span className="ml-auto w-1 h-4 rounded-full bg-blue-400 flex-shrink-0" />}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Bottom user */}
      <div className="p-3 border-t" style={{ borderColor: NAVY2 }}>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            AG
          </div>
          <div className="min-w-0">
            <div className="text-white text-xs font-medium truncate">Akshat Gupta</div>
            <div className="text-slate-500 text-[10px]">Platform Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Help Dialog ─────────────────────────────────────────────────────────────
function HelpDialog({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'support'; text: string }[]>([
    { role: 'support', text: 'Hi! Welcome to Shivneri Support. How can I help you today?' }
  ]);
  const [bugForm, setBugForm] = useState({ title: '', steps: '', severity: 'Medium', email: '' });
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', priority: 'Nice to have' });
  const [emailForm, setEmailForm] = useState({ subject: '', message: '', email: '' });
  const [submitted, setSubmitted] = useState(false);

  const ALL_ITEMS = [
    { id: 'docs',    group: 'Getting Started', icon: '📖', label: 'Platform Documentation', desc: 'Full user & admin guide',       badge: null },
    { id: 'videos',  group: 'Getting Started', icon: '🎬', label: 'Video Tutorials',         desc: 'Step-by-step walkthroughs',     badge: null },
    { id: 'quick',   group: 'Getting Started', icon: '⚡', label: 'Quick Start Guide',        desc: 'Get up and running fast',       badge: null },
    { id: 'api',     group: 'Getting Started', icon: '🔑', label: 'API Reference',            desc: 'REST API & webhooks',           badge: null },
    { id: 'chat',    group: 'Support',         icon: '💬', label: 'Live Chat Support',         desc: 'Avg. response: 2 min',          badge: 'Online' },
    { id: 'email',   group: 'Support',         icon: '📧', label: 'Email Support',             desc: 'support@shivneri.in',           badge: null },
    { id: 'bug',     group: 'Support',         icon: '🐛', label: 'Report a Bug',              desc: 'Help us improve',               badge: null },
    { id: 'feature', group: 'Support',         icon: '💡', label: 'Feature Request',           desc: 'Suggest an improvement',        badge: null },
  ];

  const filtered = search.trim()
    ? ALL_ITEMS.filter(i => i.label.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
    : ALL_ITEMS;

  const groups = Array.from(new Set(filtered.map(i => i.group)));

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msg = chatMsg.trim();
    setChatMsg('');
    setChatHistory(h => [...h, { role: 'user', text: msg }]);
    setTimeout(() => {
      const replies = [
        'Thanks for reaching out! Let me look into that for you.',
        'Great question! You can find that in the Platform Documentation section.',
        'I understand. Our team will follow up within 2 business hours.',
        'That feature is available in Settings → Access Control. Let me know if you need help!',
        'I\'ve escalated this to our technical team. You\'ll receive an email shortly.',
      ];
      setChatHistory(h => [...h, { role: 'support', text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 900);
  };

  const renderContent = () => {
    if (!activeItem) return null;
    const item = ALL_ITEMS.find(i => i.id === activeItem);

    if (activeItem === 'docs') return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Platform Documentation</span>
        </div>
        {[
          { title: 'Getting Started', pages: ['Introduction', 'Quick Setup', 'First Organization', 'Invite Employees'] },
          { title: 'Fleet Management', pages: ['Adding Vehicles', 'Driver Verification', 'Route Configuration', 'Compliance Docs'] },
          { title: 'Operations', pages: ['Live Tracking', 'SOS & Safety', 'Trip Lifecycle', 'Ride Scheduling'] },
          { title: 'Administration', pages: ['Access Control', 'Billing & Invoices', 'Analytics Reports', 'API Keys'] },
        ].map(section => (
          <div key={section.title}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">{section.title}</div>
            <div className="space-y-1">
              {section.pages.map(p => (
                <button key={p} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-left transition-colors group">
                  <span className="text-xs text-slate-600 group-hover:text-blue-700 flex-1">{p}</span>
                  <span className="text-slate-300 group-hover:text-blue-400 text-xs">→</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );

    if (activeItem === 'videos') return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Video Tutorials</span>
        </div>
        {[
          { title: 'Getting Started with Shivneri', dur: '4:32', category: 'Basics' },
          { title: 'Adding and Managing Drivers',   dur: '6:14', category: 'Fleet'  },
          { title: 'Live Operations Dashboard',      dur: '8:45', category: 'Ops'   },
          { title: 'SOS & Safety Features',          dur: '5:20', category: 'Safety'},
          { title: 'Billing & Invoice Management',   dur: '7:08', category: 'Finance'},
          { title: 'Access Control & Roles',         dur: '9:02', category: 'Admin' },
        ].map(v => (
          <div key={v.title} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors group">
            <div className="w-12 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200">
              <span className="text-lg">▶</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">{v.title}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">{v.category} · {v.dur}</div>
            </div>
          </div>
        ))}
      </div>
    );

    if (activeItem === 'quick') return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Quick Start Guide</span>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="text-sm font-bold text-blue-900 mb-1">Welcome to Shivneri! 🚌</div>
          <div className="text-xs text-blue-700">Follow these steps to get your fleet running in under 10 minutes.</div>
        </div>
        {[
          { step: 1, title: 'Create your Organization', desc: 'Go to Organizations → Add Organization. Fill in the company name, plan, and contact.' },
          { step: 2, title: 'Add Vehicles to Fleet',    desc: 'Navigate to Fleet Vehicles → Add Vehicle. Enter registration, model, and capacity.' },
          { step: 3, title: 'Register Drivers',         desc: 'Go to Drivers → Add Driver. Upload license and await verification (usually 24h).' },
          { step: 4, title: 'Import Employees',         desc: 'Go to Users & Employees → Add Employee or bulk import via CSV.' },
          { step: 5, title: 'Configure Routes',         desc: 'Navigate to Routes and define pickup/drop zones for your organization.' },
          { step: 6, title: 'Launch Live Operations',   desc: 'All set! Monitor real-time trips, SOS alerts and fleet status from the dashboard.' },
        ].map(s => (
          <div key={s.step} className="flex gap-3 items-start">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</div>
            <div>
              <div className="text-xs font-semibold text-slate-800">{s.title}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    );

    if (activeItem === 'api') return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">API Reference</span>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 font-mono">
          <div className="text-[10px] text-slate-400 mb-2">Base URL</div>
          <div className="text-xs text-green-400">https://api.shivneri.in/v2</div>
        </div>
        {[
          { method: 'GET',    path: '/organizations',      desc: 'List all organizations'    },
          { method: 'POST',   path: '/organizations',      desc: 'Create organization'       },
          { method: 'GET',    path: '/vehicles',           desc: 'List fleet vehicles'       },
          { method: 'GET',    path: '/drivers',            desc: 'List drivers'              },
          { method: 'POST',   path: '/rides',              desc: 'Schedule a ride'           },
          { method: 'GET',    path: '/rides/{id}/track',   desc: 'Live tracking data'        },
          { method: 'DELETE', path: '/rides/{id}/cancel',  desc: 'Cancel a ride'             },
        ].map(e => (
          <div key={e.path} className="flex items-center gap-3 px-3 py-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 cursor-pointer">
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded mono flex-shrink-0 ${e.method === 'GET' ? 'bg-green-100 text-green-700' : e.method === 'POST' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{e.method}</span>
            <span className="text-[11px] mono text-slate-700 flex-1">{e.path}</span>
            <span className="text-[10px] text-slate-400">{e.desc}</span>
          </div>
        ))}
      </div>
    );

    if (activeItem === 'chat') return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Live Chat Support</span>
          <span className="ml-auto text-[9px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-full">Online</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1" style={{ maxHeight: 320 }}>
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
            placeholder="Type a message…" className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
          <button onClick={sendChat} className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">Send</button>
        </div>
      </div>
    );

    if (activeItem === 'email') return submitted ? (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl">✅</div>
        <div className="text-sm font-bold text-slate-800">Message Sent!</div>
        <div className="text-xs text-slate-500">We'll reply to your email within 24 hours.</div>
        <button onClick={() => { setSubmitted(false); setActiveItem(null); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">Done</button>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Email Support</span>
        </div>
        {[['Your Email', 'email', emailForm.email, (v: string) => setEmailForm(f => ({...f, email: v})), 'you@company.com'],
          ['Subject',    'text',  emailForm.subject, (v: string) => setEmailForm(f => ({...f, subject: v})), 'e.g. Issue with vehicle tracking']].map(([label, type, val, set, ph]) => (
          <div key={label as string}>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label as string}</label>
            <input type={type as string} value={val as string} onChange={e => (set as (v: string) => void)(e.target.value)} placeholder={ph as string}
              className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
        ))}
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Message</label>
          <textarea rows={5} value={emailForm.message} onChange={e => setEmailForm(f => ({...f, message: e.target.value}))} placeholder="Describe your issue in detail…"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
        </div>
        <button onClick={() => emailForm.email && emailForm.subject && emailForm.message && setSubmitted(true)}
          disabled={!emailForm.email || !emailForm.subject || !emailForm.message}
          className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">Send Email</button>
      </div>
    );

    if (activeItem === 'bug') return submitted ? (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl">🐛</div>
        <div className="text-sm font-bold text-slate-800">Bug Reported!</div>
        <div className="text-xs text-slate-500">Ticket #{Math.floor(Math.random() * 9000 + 1000)} created. Our team will investigate.</div>
        <button onClick={() => { setSubmitted(false); setActiveItem(null); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">Done</button>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Report a Bug</span>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Bug Title <span className="text-red-500">*</span></label>
          <input value={bugForm.title} onChange={e => setBugForm(f => ({...f, title: e.target.value}))} placeholder="Brief description of the issue"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Steps to Reproduce</label>
          <textarea rows={4} value={bugForm.steps} onChange={e => setBugForm(f => ({...f, steps: e.target.value}))} placeholder="1. Go to…&#10;2. Click on…&#10;3. See error"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Severity</label>
          <div className="flex gap-2 mt-1">
            {['Low', 'Medium', 'High', 'Critical'].map(s => (
              <button key={s} onClick={() => setBugForm(f => ({...f, severity: s}))}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-colors ${bugForm.severity === s ? (s === 'Critical' ? 'bg-red-600 text-white border-red-600' : s === 'High' ? 'bg-amber-500 text-white border-amber-500' : 'bg-blue-600 text-white border-blue-600') : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Your Email</label>
          <input value={bugForm.email} onChange={e => setBugForm(f => ({...f, email: e.target.value}))} placeholder="you@company.com"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <button onClick={() => bugForm.title && setSubmitted(true)} disabled={!bugForm.title}
          className="w-full py-2.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 disabled:opacity-40 transition-colors">Submit Bug Report</button>
      </div>
    );

    if (activeItem === 'feature') return submitted ? (
      <div className="text-center py-8 space-y-3">
        <div className="text-4xl">💡</div>
        <div className="text-sm font-bold text-slate-800">Feature Requested!</div>
        <div className="text-xs text-slate-500">Your idea has been added to our backlog. Thank you!</div>
        <button onClick={() => { setSubmitted(false); setActiveItem(null); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700">Done</button>
      </div>
    ) : (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => setActiveItem(null)} className="text-xs text-blue-600 hover:underline">← Back</button>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-600 font-medium">Feature Request</span>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Feature Title <span className="text-red-500">*</span></label>
          <input value={featureForm.title} onChange={e => setFeatureForm(f => ({...f, title: e.target.value}))} placeholder="Short, descriptive title"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Description</label>
          <textarea rows={4} value={featureForm.description} onChange={e => setFeatureForm(f => ({...f, description: e.target.value}))} placeholder="Describe the feature and the problem it solves…"
            className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Priority</label>
          <div className="flex gap-2 mt-1">
            {['Nice to have', 'Important', 'Critical'].map(p => (
              <button key={p} onClick={() => setFeatureForm(f => ({...f, priority: p}))}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg border transition-colors ${featureForm.priority === p ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{p}</button>
            ))}
          </div>
        </div>
        <button onClick={() => featureForm.title && setSubmitted(true)} disabled={!featureForm.title}
          className="w-full py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors">Submit Request</button>
      </div>
    );

    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex overflow-hidden" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>

        {/* Left panel — menu */}
        <div className="w-72 flex-shrink-0 flex flex-col border-r border-slate-100">
          {/* Header */}
          <div className="px-5 py-4 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Help & Support</div>
                <div className="text-[11px] text-blue-100 mt-0.5">Shivneri Transport Platform</div>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/10 transition-colors text-sm">✕</button>
            </div>
            {/* Search */}
            <div className="mt-3">
              <input value={search} onChange={e => { setSearch(e.target.value); setActiveItem(null); }}
                placeholder="Search help articles…"
                className="w-full px-3 py-2 text-xs border border-white/30 rounded-xl bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20" />
            </div>
          </div>

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto p-3">
            {groups.map(group => (
              <div key={group} className="mb-3">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-2 mb-1">{group}</div>
                {filtered.filter(i => i.group === group).map(item => (
                  <button key={item.id} onClick={() => { setActiveItem(item.id); setSubmitted(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${activeItem === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'}`}>
                    <span className="text-base w-6 text-center flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${activeItem === item.id ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                    </div>
                    {item.badge && <span className="text-[9px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-full flex-shrink-0">{item.badge}</span>}
                    {activeItem === item.id && <span className="text-blue-400 text-xs">›</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex-shrink-0">
            <div className="text-[10px] text-slate-400">v2.4.1 · <span className="text-green-600 font-semibold">All systems operational</span></div>
          </div>
        </div>

        {/* Right panel — content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeItem ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
              <div className="text-5xl">🚌</div>
              <div className="text-base font-bold text-slate-800">How can we help?</div>
              <div className="text-sm text-slate-500 max-w-xs">Browse the categories on the left or search for a topic above.</div>
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-2">
                {[
                  { id: 'quick', icon: '⚡', label: 'Quick Start' },
                  { id: 'chat',  icon: '💬', label: 'Live Chat'   },
                  { id: 'docs',  icon: '📖', label: 'Docs'        },
                  { id: 'bug',   icon: '🐛', label: 'Report Bug'  },
                ].map(s => (
                  <button key={s.id} onClick={() => setActiveItem(s.id)}
                    className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                    <span className="text-xl">{s.icon}</span>
                    <span className="text-xs font-semibold text-slate-700">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="slide-in">{renderContent()}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Top bar ─────────────────────────────────────────────────────────────────
function TopBar({ title, subtitle, onNav }: { title: string; subtitle?: string; onNav: (v: View) => void }) {
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'sos',      icon: '🚨', title: 'Active SOS — Employee #10482', desc: 'Raj Nagar, Pune · RIDE-98231 · Driver: Raj Kumar', time: '2 min ago',  read: false },
    { id: '2', type: 'incident', icon: '⚠️', title: 'Incident INC-2024-0890 opened', desc: 'High severity · Accident · Wakad Bridge',            time: '18 min ago', read: false },
    { id: '3', type: 'driver',   icon: '✅', title: 'Driver verified — Deepak Patel', desc: 'DRV-005 is now eligible for trip assignment',         time: '34 min ago', read: false },
    { id: '4', type: 'billing',  icon: '📄', title: 'Invoice INV-2024-0890 pending', desc: 'Infosys BPM Ltd · ₹89,000 · awaiting approval',       time: '1 hr ago',   read: true },
    { id: '5', type: 'route',    icon: '🚌', title: 'Route RT-004 delayed',           desc: 'Wakad → Hinjewadi Ph3 · ETA +12 min',                 time: '1 hr ago',   read: true },
    { id: '6', type: 'system',   icon: 'ℹ️', title: 'System maintenance tonight',      desc: 'Scheduled downtime 02:00–03:00 IST',                  time: '3 hr ago',   read: true },
  ]);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const searchResults = searchQuery.trim().length > 0
    ? NAV_ITEMS.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));

  const notifColor = (type: string) =>
    type === 'sos' ? 'border-l-red-500 bg-red-50' : type === 'incident' ? 'border-l-amber-500 bg-amber-50' : type === 'billing' ? 'border-l-blue-500 bg-blue-50' : 'border-l-slate-300 bg-white';

  return (
    <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 flex-shrink-0 relative z-30">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            className="pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search pages…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearchDrop(true); }}
            onFocus={() => setShowSearchDrop(true)}
            onBlur={() => setTimeout(() => setShowSearchDrop(false), 150)}
          />
          <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
          {showSearchDrop && searchResults.length > 0 && (
            <div className="absolute left-0 top-9 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden">
              {searchResults.map(item => (
                <button
                  key={item.view}
                  onMouseDown={() => { onNav(item.view); setSearchQuery(''); setShowSearchDrop(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
                >
                  <span className="text-base w-5 text-center">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800">{item.label}</div>
                    {item.group && <div className="text-[10px] text-slate-400">{item.group}</div>}
                  </div>
                  <span className="text-[10px] text-slate-300">→</span>
                </button>
              ))}
            </div>
          )}
          {showSearchDrop && searchQuery.trim().length > 0 && searchResults.length === 0 && (
            <div className="absolute left-0 top-9 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 px-4 py-3 text-xs text-slate-400">
              No pages match "{searchQuery}"
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 relative">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotif(v => !v)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 relative transition-colors ${showNotif ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
            >
              🔔
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[8px] font-bold text-white">{unread}</span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ maxHeight: 480 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    {unread > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{unread}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {unread > 0 && <button onClick={markAllRead} className="text-[11px] text-blue-600 hover:text-blue-800">Mark all read</button>}
                    <button onClick={() => setShowNotif(false)} className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm">✕</button>
                  </div>
                </div>

                {/* List */}
                <div className="overflow-y-auto" style={{ maxHeight: 400 }}>
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400">No notifications</div>
                  ) : notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 border-l-4 transition-colors ${notifColor(n.type)} ${!n.read ? '' : 'opacity-70'}`}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-semibold text-slate-800 ${!n.read ? '' : 'font-normal'}`}>{n.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">{n.desc}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        <button onClick={e => { e.stopPropagation(); dismiss(n.id); }} className="text-slate-300 hover:text-slate-500 text-xs leading-none">✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 text-center">
                  <button className="text-[11px] text-blue-600 hover:text-blue-800">View all notifications →</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <button
              onClick={() => { setShowQuickActions(v => !v); setShowNotif(false); }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition-colors ${showQuickActions ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
            >⚡</button>
            {showQuickActions && (
              <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Quick Actions</span>
                  <button onClick={() => setShowQuickActions(false)} className="w-6 h-6 rounded hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm">✕</button>
                </div>
                <div className="p-2 space-y-0.5">
                  {[
                    { icon: '🏢', label: 'Add Organization',    view: 'organizations' as View },
                    { icon: '👤', label: 'Add Employee',         view: 'employees' as View    },
                    { icon: '🚗', label: 'Add Driver',           view: 'drivers' as View      },
                    { icon: '🚌', label: 'Add Vehicle',          view: 'vehicles' as View     },
                    { icon: '📡', label: 'View Live Operations', view: 'live-ops' as View     },
                    { icon: '🛡', label: 'Safety & Incidents',   view: 'safety' as View       },
                    { icon: '📊', label: 'Analytics',            view: 'analytics' as View    },
                    { icon: '💳', label: 'Billing',              view: 'billing' as View      },
                  ].map(a => (
                    <button key={a.view} onClick={() => { onNav(a.view); setShowQuickActions(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors">
                      <span className="text-base w-6 text-center">{a.icon}</span>
                      <span className="text-xs font-medium text-slate-700">{a.label}</span>
                      <span className="ml-auto text-[10px] text-slate-300">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Help */}
          <button
            onClick={() => { setShowHelp(v => !v); setShowNotif(false); setShowQuickActions(false); }}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 font-semibold transition-colors ${showHelp ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100'}`}
          >?</button>
        </div>
        <div className="mono text-xs text-slate-400 tabular-nums">
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      {/* Click-outside overlay */}
      {showNotif && <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />}
      {showQuickActions && <div className="fixed inset-0 z-40" onClick={() => setShowQuickActions(false)} />}
      {showHelp && <HelpDialog onClose={() => setShowHelp(false)} />}
    </header>
  );
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

// Dashboard
function DashboardView({ onNav }: { onNav: (v: View) => void }) {
  const [period, setPeriod] = useState<'Today' | 'This Week' | 'This Month'>('Today');
  const [orgFilter, setOrgFilter] = useState('All Organizations');
  const [liveActive, setLiveActive] = useState(247);
  const [liveDrivers, setLiveDrivers] = useState(389);
  const [lastSync, setLastSync] = useState(new Date());
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [costPeriod, setCostPeriod] = useState<'6 Months' | '12 Months'>('6 Months');
  const [orgChartPeriod, setOrgChartPeriod] = useState<'Monthly' | 'Quarterly'>('Monthly');
  const [hoveredOrgSlice, setHoveredOrgSlice] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setLiveActive(n => Math.max(230, n + (Math.random() > 0.5 ? 1 : -1)));
      setLiveDrivers(n => Math.max(370, n + (Math.random() > 0.5 ? 1 : -1)));
      setLastSync(new Date());
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const data = DASH_DATA[period];
  const orgKpi = ORG_KPI[orgFilter] ?? ORG_KPI['All Organizations'];
  const orgMult: Record<string, number> = { 'All Organizations': 1, 'Infosys': 0.15, 'TCS': 0.40, 'Wipro': 0.30, 'Cognizant': 0.15 };
  const mult = orgMult[orgFilter] ?? 1;
  const filteredTrips = Math.round(data.totalTrips * mult);
  const filteredDelayed = Math.max(0, Math.round(data.delayedTrips * mult));
  const selectedVehicle = LIVE_VEHICLES.find(v => v.id === selectedVehicleId);
  const selectedTrip    = ACTIVE_TRIPS_DATA.find(t => t.id === selectedTripId);

  const displayVehicles = orgFilter === 'All Organizations'
    ? LIVE_VEHICLES
    : LIVE_VEHICLES.filter(v => v.org === orgFilter);

  const vehColor: Record<string, string> = {
    'on-trip': 'bg-green-500', arriving: 'bg-blue-500', delayed: 'bg-amber-500', idle: 'bg-slate-300',
  };
  const vehLabel: Record<string, string> = {
    'on-trip': 'On Trip', arriving: 'Arriving', delayed: 'Delayed', idle: 'Idle',
  };

  const tripBadge = (s: string) => ({
    'On Trip':  'bg-green-50 text-green-700 border-green-200',
    'Delayed':  'bg-amber-50 text-amber-700 border-amber-200',
    'Arriving': 'bg-blue-50 text-blue-700 border-blue-200',
    'Idle':     'bg-slate-100 text-slate-500 border-slate-200',
  } as Record<string, string>)[s] ?? 'bg-slate-100 text-slate-500 border-slate-200';

  const ORG_COLORS = [BLUE, CYAN, GREEN, AMBER, '#8b5cf6'];
  const orgByTrip = [
    { name:'Infosys', value:35, trips:684 }, { name:'TCS', value:25, trips:488 },
    { name:'Wipro', value:20, trips:391 },   { name:'Cognizant', value:12, trips:234 },
    { name:'Others', value:8, trips:157 },
  ];

  const SAFETY_EVENTS = [
    { sev:'critical', label:'SOS Alert',          org:'Infosys',   detail:'Trip TRP-10482',     time:'2 min ago',  status:'ACTIVE' },
    { sev:'high',     label:'Vehicle Breakdown',   org:'TCS',       detail:'Trip TRP-10461',     time:'18 min ago', status:'INVESTIGATING' },
    { sev:'medium',   label:'Accident Report',     org:'Wipro',     detail:'Baner Road',         time:'1 hr ago',   status:'RESOLVED' },
    { sev:'low',      label:'Harassment Alert',    org:'Cognizant', detail:'Employee reported',  time:'3 hrs ago',  status:'RESOLVED' },
  ];

  const NEEDS = [
    { count: data.delayedTrips, label:'Delayed Trips',                sub:'Require attention',          view:'rides' as View,    color:'amber' },
    { count: 2,                  label:'Active SOS Alerts',            sub:'Immediate response needed',  view:'safety' as View,   color:'red'   },
    { count: 12,                 label:'Vehicles Due for Renewal',     sub:'Insurance / RC pending',     view:'vehicles' as View, color:'blue'  },
    { count: 5,                  label:'Driver Verifications Pending', sub:'Documents awaiting review',  view:'drivers' as View,  color:'slate' },
  ];

  const ACTIVITY = [
    { icon:'building',  time:'18:42:11', action:'New organization onboarded',  detail:'Infosys BPM Ltd — 1,200 employees',           actor:'System',       dot:'bg-blue-500'   },
    { icon:'truck',     time:'18:39:02', action:'Driver verified',             detail:'Raj Kumar — License MH-0120230001234',         actor:'Priya Sharma', dot:'bg-green-500'  },
    { icon:'truck',     time:'18:31:55', action:'Vehicle added',               detail:'MH12 CD 5678 — Infosys fleet',                 actor:'System',       dot:'bg-blue-500'   },
    { icon:'alert',     time:'18:28:20', action:'SOS event triggered',         detail:'Employee #10482 — Trip TRP-98231',             actor:'System',       dot:'bg-red-500'    },
    { icon:'ticket',    time:'18:19:04', action:'Transport request approved',  detail:'TCS — 45 employees, Route RT-008',             actor:'Rahul Joshi',  dot:'bg-cyan-500'   },
    { icon:'currency',  time:'18:07:31', action:'Invoice approved',            detail:'INV-2024-0891 — ₹2,84,000',                    actor:'Rahul Joshi',  dot:'bg-cyan-500'   },
    { icon:'check',     time:'17:58:14', action:'Trip completed',              detail:'TRP-10482, Infosys — Driver: Ramesh Kumar',    actor:'System',       dot:'bg-green-500'  },
    { icon:'shield',    time:'17:45:22', action:'Incident resolved',           detail:'INC-2024-0889 — Breakdown, Baner Road',        actor:'Ravi Kumar',   dot:'bg-slate-400'  },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 slide-in overflow-y-auto h-full">

      {/* ── FILTER BAR ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
          {(['Today', 'This Week', 'This Month'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              {p}
            </button>
          ))}
        </div>
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200">
          {['All Organizations','Infosys','TCS','Wipro','Cognizant'].map(o => <option key={o}>{o}</option>)}
        </select>
        <button onClick={() => { setPeriod('Today'); setOrgFilter('All Organizations'); }}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
          Reset Filters
        </button>
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-400">
          <StatusDot active />
          <span>Live · Synced {lastSync.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-4 gap-3 xl:grid-cols-8">
        <KpiCard title="Organizations"    value={String(orgKpi.orgs)}                    delta={orgKpi.orgs > 1 ? '+6' : undefined} deltaLabel="this month"   icon="🏢" onClick={() => onNav('organizations')} />
        <KpiCard title="Active Employees" value={orgKpi.employees.toLocaleString()}       delta={orgKpi.orgs > 1 ? '+342' : undefined} deltaLabel="this week" icon="👥" onClick={() => onNav('employees')} />
        <KpiCard title="Active Drivers"   value={orgKpi.drivers.toLocaleString()}         delta={orgKpi.orgs > 1 ? '+28' : undefined}  deltaLabel="this week" icon="🚗" onClick={() => onNav('drivers')} />
        <KpiCard title="Fleet Vehicles"   value={orgKpi.vehicles.toLocaleString()}        delta={orgKpi.orgs > 1 ? '+14' : undefined}  deltaLabel="this month" icon="🚌" onClick={() => onNav('vehicles')} />
        <KpiCard title="Today's Trips"    value={filteredTrips.toLocaleString()} delta="+12%" deltaLabel="vs yesterday" icon="🎫" accent={CYAN} onClick={() => onNav('rides')} />
        <KpiCard title="Active Trips"     value={String(Math.round(liveActive * mult))} icon="📡" accent={GREEN} onClick={() => onNav('live-ops')} />
        <KpiCard title="Delayed Trips"    value={String(filteredDelayed)} delta="-3" deltaLabel="vs avg" icon="⏱" accent={AMBER} onClick={() => onNav('rides')} />
        <KpiCard title="SOS Alerts"       value="2" icon="🚨" accent={RED} alert onClick={() => onNav('safety')} />
      </div>

      {/* ── LIVE OPERATIONS (hero section) ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Live Operations</h3>
              <div className="flex items-center gap-1.5">
                <StatusDot active />
                <span className="text-[10px] font-bold text-green-600 tracking-widest">LIVE</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time tracking of active vehicles across organizations</p>
          </div>
          <button onClick={() => onNav('live-ops')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View Live Operations <DIcon name="arrow-right" size={12} />
          </button>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
          {/* Simulated Map */}
          <div className="relative overflow-hidden bg-slate-50" style={{ height: 340 }}>
            <div className="absolute top-3 left-3 z-10">
              <select className="text-xs border border-white/80 rounded-lg px-2.5 py-1.5 bg-white/90 shadow-sm text-slate-600 focus:outline-none">
                {['All Organizations','Infosys','TCS','Wipro','Cognizant'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
              <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 text-sm font-bold">+</button>
              <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 text-sm font-bold">−</button>
              <button className="w-7 h-7 bg-white border border-slate-200 rounded-md flex items-center justify-center shadow-sm hover:bg-slate-50">
                <DIcon name="crosshair" size={12} className="text-slate-500" />
              </button>
            </div>
            {/* SVG map */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <rect width="100%" height="100%" fill="#f8f9fb" />
              <ellipse cx="27%" cy="40%" rx="11%" ry="8%" fill="#eef2f8" opacity="0.8" />
              <ellipse cx="54%" cy="30%" rx="9%" ry="6%" fill="#eef2f8" opacity="0.7" />
              <ellipse cx="65%" cy="67%" rx="8%" ry="6%" fill="#e8f4ec" opacity="0.8" />
              <ellipse cx="19%" cy="32%" rx="7%" ry="5%" fill="#eef2f8" opacity="0.6" />
              <line x1="0" y1="44%" x2="100%" y2="40%" stroke="#d1d5db" strokeWidth="3.5" />
              <ellipse cx="48%" cy="50%" rx="33%" ry="21%" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="27%" y1="0" x2="25%" y2="100%" stroke="#d1d5db" strokeWidth="2.5" />
              <line x1="55%" y1="0" x2="58%" y2="100%" stroke="#e5e7eb" strokeWidth="2" />
              <line x1="76%" y1="0" x2="73%" y2="100%" stroke="#e5e7eb" strokeWidth="1.5" />
              <line x1="0" y1="63%" x2="60%" y2="58%" stroke="#e5e7eb" strokeWidth="2" />
              <line x1="38%" y1="100%" x2="70%" y2="38%" stroke="#e5e7eb" strokeWidth="2" />
              <line x1="10%" y1="22%" x2="55%" y2="54%" stroke="#eee" strokeWidth="1.5" />
              <text x="25%" y="35%" fill="#94a3b8" fontSize="9" textAnchor="middle">Hinjewadi</text>
              <text x="52%" y="25%" fill="#94a3b8" fontSize="9" textAnchor="middle">Wakad</text>
              <text x="63%" y="63%" fill="#94a3b8" fontSize="9" textAnchor="middle">Magarpatta</text>
              <text x="40%" y="76%" fill="#94a3b8" fontSize="9" textAnchor="middle">Kothrud</text>
              <text x="72%" y="36%" fill="#94a3b8" fontSize="9" textAnchor="middle">Koregaon</text>
              <text x="17%" y="29%" fill="#94a3b8" fontSize="9" textAnchor="middle">Pimpri</text>
            </svg>
            {/* Vehicle markers */}
            {displayVehicles.map(v => (
              <button key={v.id} onClick={() => setSelectedVehicleId(selectedVehicleId === v.id ? null : v.id)}
                style={{ left:`${v.x}%`, top:`${v.y}%`, position:'absolute', transform:'translate(-50%,-50%)', zIndex: 20 }}
                className="group">
                <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md transition-all group-hover:scale-125 ${vehColor[v.status] ?? 'bg-slate-400'} ${selectedVehicleId === v.id ? 'ring-2 ring-offset-1 ring-blue-500 scale-125' : ''}`} />
              </button>
            ))}
            {/* Vehicle popover */}
            {selectedVehicle && (() => {
              const popLeft = selectedVehicle.x > 65;
              return (
                <div className="absolute z-30 bg-white border border-slate-200 rounded-xl shadow-2xl p-3 w-52"
                  style={{ left: popLeft ? `${selectedVehicle.x - 22}%` : `${selectedVehicle.x + 3}%`, top:`${selectedVehicle.y}%`, transform:'translateY(-50%)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-800 mono">{selectedVehicle.reg}</span>
                    <button onClick={() => setSelectedVehicleId(null)} className="text-slate-300 hover:text-slate-500">
                      <DIcon name="x" size={12} />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {([['Driver', selectedVehicle.driver],['Organization', selectedVehicle.org],['Trip', selectedVehicle.trip],['Status', vehLabel[selectedVehicle.status]],['ETA', selectedVehicle.eta],['Route', selectedVehicle.route]] as [string,string][]).map(([l,v]) => (
                      <div key={l} className="flex justify-between text-[11px]">
                        <span className="text-slate-400">{l}</span>
                        <span className="text-slate-700 font-medium text-right max-w-28 truncate">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Legend */}
            <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-[10px]">
              {[['bg-green-500','On Trip'],['bg-blue-500','Arriving'],['bg-amber-500','Delayed'],['bg-slate-300','Idle']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`} /><span className="text-slate-500">{l}</span></div>
              ))}
            </div>
          </div>
          {/* Active trips panel */}
          <div className="border-l border-slate-100 flex flex-col" style={{ height: 340 }}>
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <span className="text-xs font-semibold text-slate-700">Active Trips ({liveActive})</span>
              <span className="text-[10px] text-slate-400">Click to expand</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
              {ACTIVE_TRIPS_DATA.map(t => (
                <div key={t.id} onClick={() => setSelectedTripId(selectedTripId === t.id ? null : t.id)}
                  className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] font-semibold text-slate-800 mono">{t.id}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${tripBadge(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{t.org} · {t.driver}</div>
                  <div className="text-[10px] text-slate-400">{t.vehicle} · ETA {t.eta}</div>
                  {selectedTripId === t.id && (
                    <div className="mt-2 bg-slate-50 rounded-lg p-2 border border-slate-100 space-y-1">
                      {([['Employee', t.employee],['Pickup', t.pickup],['Drop', t.drop],['Start', t.start]] as [string,string][]).map(([l,v]) => (
                        <div key={l} className="flex justify-between text-[11px]">
                          <span className="text-slate-400">{l}</span>
                          <span className="text-slate-700 font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TODAY'S TRANSPORTATION + QUICK ACTIONS ── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Today's Transportation</h3>
              <p className="text-xs text-slate-400">{period} performance overview</p>
            </div>
            <button onClick={() => onNav('rides')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
              View All Trips <DIcon name="arrow-right" size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label:'Scheduled',  value:data.totalTrips.toLocaleString(), color:'text-slate-800', bg:'bg-slate-50' },
              { label:'Completed',  value:data.completedTrips.toLocaleString(), color:'text-green-700', bg:'bg-green-50' },
              { label:'Active',     value:String(liveActive), color:'text-blue-700', bg:'bg-blue-50' },
              { label:'Delayed',    value:String(data.delayedTrips), color:'text-amber-700', bg:'bg-amber-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-slate-500">Completion Rate</span>
              <span className="text-xs font-semibold text-slate-800">{data.completionRate}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600 rounded-full transition-all duration-700" style={{ width:`${data.completionRate}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0</span><span>{data.totalTrips.toLocaleString()} scheduled</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {([
              { label:'Add Organization', icon:'building',  view:'organizations' },
              { label:'Add Driver',       icon:'users',     view:'drivers' },
              { label:'Add Vehicle',      icon:'truck',     view:'vehicles' },
              { label:'View Live Trips',  icon:'map',       view:'live-ops' },
              { label:'Analytics',        icon:'chart',     view:'analytics' },
              { label:'Safety Center',    icon:'shield',    view:'safety' },
            ] as { label:string; icon:string; view:View }[]).map(a => (
              <button key={a.label} onClick={() => onNav(a.view)}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all text-slate-500 hover:text-blue-600 group">
                <DIcon name={a.icon} size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLEET UTILIZATION + TRIPS BY ORG + TRIP VOLUME ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Fleet Utilization */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Fleet Utilization</h3>
            <p className="text-xs text-slate-400">896 total vehicles</p>
          </div>
          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={[{v:524},{v:233},{v:139}]} cx="50%" cy="50%" innerRadius={42} outerRadius={64} dataKey="v" startAngle={90} endAngle={-270}>
                  <Cell fill={BLUE} onClick={() => onNav('live-ops')} style={{cursor:'pointer'}} />
                  <Cell fill={GREEN} />
                  <Cell fill={AMBER} onClick={() => onNav('vehicles')} style={{cursor:'pointer'}} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">74%</span>
              <span className="text-[10px] text-slate-400">Utilized</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {[
              { label:'On Trip',     value:524, c:'bg-blue-500',  tc:'text-blue-700',  nav:'live-ops' as View },
              { label:'Available',   value:233, c:'bg-green-500', tc:'text-green-700', nav:null },
              { label:'Maintenance', value:139, c:'bg-amber-500', tc:'text-amber-700', nav:'vehicles' as View },
            ].map(f => (
              <div key={f.label} onClick={() => f.nav && onNav(f.nav)}
                className={`flex items-center gap-2 py-1 px-2 rounded-lg ${f.nav ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors`}>
                <span className={`w-2 h-2 rounded-full ${f.c}`} />
                <span className="text-[11px] text-slate-600 flex-1">{f.label}</span>
                <span className={`text-xs font-semibold ${f.tc}`}>{f.value}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Trips by Org */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Trips by Organization</h3>
            <p className="text-xs text-slate-400">{data.totalTrips.toLocaleString()} total trips</p>
          </div>
          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={orgByTrip} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value"
                  onMouseEnter={(_, i) => setHoveredOrgSlice(i)}
                  onMouseLeave={() => setHoveredOrgSlice(null)}>
                  {orgByTrip.map((_, i) => (
                    <Cell key={i} fill={ORG_COLORS[i]} opacity={hoveredOrgSlice === null || hoveredOrgSlice === i ? 1 : 0.55} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, _, p) => [`${p.payload.trips} trips (${v}%)`, p.payload.name]} contentStyle={{ fontSize:11, borderRadius:8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-slate-900">{data.totalTrips.toLocaleString()}</span>
              <span className="text-[9px] text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-1 mt-1">
            {orgByTrip.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 py-0.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ORG_COLORS[i] }} />
                <span className="text-[11px] text-slate-600 flex-1">{d.name}</span>
                <span className="text-[11px] font-medium text-slate-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Trip Volume chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-slate-800">Trip Volume</h3>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-blue-600 inline-block" />Scheduled</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-cyan-500 inline-block" />Completed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data.chartData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="tvg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} /><stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tvg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CYAN} stopOpacity={0.2} /><stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid #e2e8f0' }} />
              <Area type="monotone" dataKey="scheduled" stroke={BLUE} fill="url(#tvg1)" strokeWidth={2} name="Scheduled" />
              <Area type="monotone" dataKey="completed" stroke={CYAN} fill="url(#tvg2)" strokeWidth={2} name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── MONTHLY COST + ORG GROWTH ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Monthly Transport Cost</h3>
              <p className="text-xs text-slate-400">₹{(data.cost/100000).toFixed(1)}L · {period.toLowerCase()}</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {(['6 Months','12 Months'] as const).map(c => (
                <button key={c} onClick={() => setCostPeriod(c)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${costPeriod === c ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-2.5"><div className="text-sm font-bold text-blue-700">₹{(data.cost/1000).toFixed(0)}K</div><div className="text-[10px] text-blue-400">This Month</div></div>
            <div className="bg-slate-50 rounded-lg p-2.5"><div className="text-sm font-bold text-slate-700">₹{(data.avgCost/1000).toFixed(0)}K</div><div className="text-[10px] text-slate-400">Avg Monthly</div></div>
            <div className="bg-slate-50 rounded-lg p-2.5"><div className="text-sm font-bold text-slate-700">₹{data.costPerTrip}</div><div className="text-[10px] text-slate-400">Per Trip</div></div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={costData} margin={{ top:0, right:0, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={v => [`₹${((v as number)/1000).toFixed(0)}k`, 'Cost']} contentStyle={{ fontSize:12, borderRadius:8 }} />
              <Bar dataKey="cost" fill={BLUE} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Organization Growth</h3>
              <p className="text-xs text-slate-400">44 tenants · +{data.orgNew} this month</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {(['Monthly','Quarterly'] as const).map(c => (
                <button key={c} onClick={() => setOrgChartPeriod(c)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors ${orgChartPeriod === c ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-cyan-50 rounded-lg p-2.5"><div className="text-sm font-bold text-cyan-700">44</div><div className="text-[10px] text-cyan-400">Current</div></div>
            <div className="bg-slate-50 rounded-lg p-2.5"><div className="text-sm font-bold text-slate-700">+{data.orgNew}</div><div className="text-[10px] text-slate-400">New This Month</div></div>
            <div className="bg-slate-50 rounded-lg p-2.5"><div className="text-sm font-bold text-slate-700">+{data.orgNew}%</div><div className="text-[10px] text-slate-400">Growth Rate</div></div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={orgGrowthData} margin={{ top:0, right:0, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
              <Line type="monotone" dataKey="orgs" stroke={CYAN} strokeWidth={2.5} dot={{ fill:CYAN, r:4 }} activeDot={{ r:6 }} name="Orgs" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── SAFETY & INCIDENTS + NEEDS ATTENTION ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Safety & Incidents</h3>
              <p className="text-xs text-slate-400">Active and recent events</p>
            </div>
            <button onClick={() => onNav('safety')} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
              View Safety Center <DIcon name="arrow-right" size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {SAFETY_EVENTS.map((e, i) => {
              const bg   = e.sev === 'critical' ? 'bg-red-50 border-red-200' : e.sev === 'high' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100';
              const dot  = e.sev === 'critical' ? 'bg-red-500' : e.sev === 'high' ? 'bg-amber-500' : 'bg-slate-300';
              const stat = e.status === 'ACTIVE' ? 'text-red-600 bg-red-50 border-red-200' : e.status === 'INVESTIGATING' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-green-600 bg-green-50 border-green-200';
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dot} ${e.sev === 'critical' ? 'pulse-dot' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-800">{e.label}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${stat}`}>{e.status}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{e.org} · {e.detail}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{e.time}</div>
                  </div>
                  {e.sev === 'critical' && (
                    <button onClick={() => setShowSosModal(true)} className="text-[10px] text-red-600 hover:text-red-800 font-semibold whitespace-nowrap">View →</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Needs Attention</h3>
            <p className="text-xs text-slate-400">Priority items requiring immediate action</p>
          </div>
          <div className="space-y-2.5">
            {NEEDS.map((n, i) => {
              const C: Record<string, { bg:string; text:string; num:string; border:string }> = {
                red:   { bg:'bg-red-50',   text:'text-red-700',   num:'text-red-600',   border:'border-red-100' },
                amber: { bg:'bg-amber-50', text:'text-amber-700', num:'text-amber-600', border:'border-amber-100' },
                blue:  { bg:'bg-blue-50',  text:'text-blue-700',  num:'text-blue-600',  border:'border-blue-100' },
                slate: { bg:'bg-slate-50', text:'text-slate-700', num:'text-slate-600', border:'border-slate-100' },
              };
              const c = C[n.color];
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg} ${c.border}`}>
                  <div className={`text-2xl font-bold ${c.num} w-10 text-right flex-shrink-0`}>{n.count}</div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs font-semibold ${c.text}`}>{n.label}</div>
                    <div className="text-[10px] text-slate-400">{n.sub}</div>
                  </div>
                  <button onClick={() => onNav(n.view)} className={`text-[11px] ${c.text} font-medium hover:underline whitespace-nowrap`}>View →</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Recent Activity</h3>
            <p className="text-xs text-slate-400">Platform-wide event log</p>
          </div>
          <button onClick={() => setShowAllActivity(v => !v)} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
            {showAllActivity ? 'Show less' : 'View all →'}
          </button>
        </div>
        <div>
          {(showAllActivity ? ACTIVITY : ACTIVITY.slice(0, 6)).map((evt, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-1 px-1 rounded-lg transition-colors">
              <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                <DIcon name={evt.icon} size={13} className="text-slate-500" />
              </div>
              <div className="mono text-[10px] text-slate-400 w-14 flex-shrink-0 tabular-nums">{evt.time}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-slate-800 font-medium truncate">{evt.action}</div>
                <div className="text-[11px] text-slate-400 truncate">{evt.detail}</div>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${evt.dot}`} />
              <div className="text-[10px] text-slate-400 w-24 text-right flex-shrink-0 truncate">{evt.actor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={() => setShowSosModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-96 p-6 slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <DIcon name="alert" size={20} className="text-red-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-red-600 uppercase tracking-wide">SOS Alert — Active</div>
                <div className="text-xs text-slate-400">Emergency in progress</div>
              </div>
              <button onClick={() => setShowSosModal(false)} className="ml-auto text-slate-300 hover:text-slate-600">
                <DIcon name="x" size={16} />
              </button>
            </div>
            <div className="space-y-0 mb-5">
              {([['Organization','Infosys'],['Employee','#10482'],['Trip','TRP-98231'],['Driver','Ramesh Kumar'],['Time','2 min ago'],['Status','ACTIVE']] as [string,string][]).map(([l,v]) => (
                <div key={l} className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-xs text-slate-500">{l}</span>
                  <span className={`text-xs font-semibold ${l === 'Status' ? 'text-red-600' : 'text-slate-800'}`}>{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowSosModal(false); onNav('safety'); }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
                View Incident
              </button>
              <button onClick={() => setShowSosModal(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors">
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Organization Modal ───────────────────────────────────────────────────
function OrgFormModal({ org, onClose, onSave }: {
  org?: OrgRow;
  onClose: () => void;
  onSave: (org: OrgRow) => void;
}) {
  const isEdit = !!org;
  const [form, setForm] = useState({
    name: org?.name ?? '',
    orgId: org?.id ?? `ORG-${String(Math.floor(Math.random() * 900) + 100)}`,
    city: org?.city ?? '',
    address: org?.address ?? '',
    contact: org?.contact ?? '',
    email: org?.email ?? '',
    phone: org?.phone ?? '',
    plan: org?.plan ?? 'Business',
    status: org?.status ?? 'Trial',
    liveTracking: org?.liveTracking ?? true,
    sos: org?.sos ?? false,
  });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const setF = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k: string) => setErrs(e => { const n = { ...e }; delete n[k]; return n; });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Organization name is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.email.trim()) e.email = 'Contact email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        name: form.name.trim(), id: form.orgId,
        employees: org?.employees ?? 0, drivers: org?.drivers ?? 0,
        vehicles: org?.vehicles ?? 0, trips: org?.trips ?? 0,
        status: form.status, plan: form.plan,
        created: org?.created ?? new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        city: form.city.trim(), contact: form.contact.trim(),
        email: form.email.trim(), phone: form.phone.trim(), address: form.address.trim(),
        liveTracking: form.liveTracking, sos: form.sos,
        todayTrips: org?.todayTrips ?? 0, monthlyCost: org?.monthlyCost ?? 0,
      });
    }, 600);
  };

  const inputCls = (fk: string) => `w-full px-3 py-2 text-sm border rounded-xl bg-slate-50 focus:outline-none focus:ring-2 transition-all ${errs[fk] ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:ring-blue-100 focus:border-blue-400'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-900">{isEdit ? 'Edit Organization' : 'Add Organization'}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{isEdit ? `Editing — ${org!.id}` : 'Onboard a new client organization'}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm transition-colors">✕</button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Basic Information</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization Name<span className="text-red-500 ml-0.5">*</span></label>
                <input className={inputCls('name')} placeholder="e.g. TCS Pune Campus" value={form.name} onChange={e => { setF('name', e.target.value); clearErr('name'); }} />
                {errs.name && <p className="text-[10px] text-red-600 mt-1">{errs.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">City<span className="text-red-500 ml-0.5">*</span></label>
                  <input className={inputCls('city')} placeholder="e.g. Pune" value={form.city} onChange={e => { setF('city', e.target.value); clearErr('city'); }} />
                  {errs.city && <p className="text-[10px] text-red-600 mt-1">{errs.city}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Organization ID</label>
                  <input className={inputCls('orgId')} placeholder="ORG-XXX" value={form.orgId} onChange={e => { setF('orgId', e.target.value); clearErr('orgId'); }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Address</label>
                <input className={inputCls('address')} placeholder="Full office address" value={form.address} onChange={e => setF('address', e.target.value)} />
              </div>
            </div>
          </section>
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Information</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Person</label>
                <input className={inputCls('contact')} placeholder="e.g. Rajesh Sharma" value={form.contact} onChange={e => setF('contact', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Email<span className="text-red-500 ml-0.5">*</span></label>
                <input type="email" className={inputCls('email')} placeholder="admin@company.com" value={form.email} onChange={e => { setF('email', e.target.value); clearErr('email'); }} />
                {errs.email && <p className="text-[10px] text-red-600 mt-1">{errs.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
                <input className={inputCls('phone')} placeholder="+91 98765 43210" value={form.phone} onChange={e => setF('phone', e.target.value)} />
              </div>
            </div>
          </section>
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Subscription</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ k: 'Starter', d: 'Up to 100 emp.' }, { k: 'Business', d: 'Up to 1,000 emp.' }, { k: 'Enterprise', d: 'Unlimited' }].map(p => (
                <button key={p.k} type="button" onClick={() => setF('plan', p.k)}
                  className={`border rounded-xl p-3 text-left transition-all ${form.plan === p.k ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className={`text-xs font-semibold mb-0.5 ${form.plan === p.k ? 'text-blue-700' : 'text-slate-700'}`}>{p.k}</div>
                  <div className="text-[10px] text-slate-400">{p.d}</div>
                </button>
              ))}
            </div>
          </section>
          <section>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Settings</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-600 mb-2">Status</p>
                <div className="flex gap-2">
                  {[['Trial', 'amber'], ['Active', 'green'], ['Suspended', 'red']].map(([s, c]) => (
                    <button key={s} onClick={() => setF('status', s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.status === s ? (c === 'green' ? 'bg-green-100 border-green-400 text-green-700' : c === 'red' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-amber-100 border-amber-400 text-amber-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-6">
                {([['liveTracking', 'Live Tracking'], ['sos', 'SOS Emergency']] as const).map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer select-none">
                    <button type="button" onClick={() => setF(k, !form[k])}
                      className={`w-9 h-5 rounded-full relative transition-colors ${form[k] ? 'bg-blue-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${form[k] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-xs text-slate-600">{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isEdit ? 'Saving…' : 'Creating…'}</>
              : (isEdit ? 'Save Changes' : 'Create Organization')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep for backward compat (not referenced after OrganizationsView rewrite, but avoids stale refs)
function AddOrgModal({ onClose, onAdd }: { onClose: () => void; onAdd: (org: OrgRow) => void }) {
  return <OrgFormModal onClose={onClose} onSave={onAdd} />;
}

type OrgRow = {
  name: string; id: string; employees: number; drivers: number;
  vehicles: number; trips: number; status: string; plan: string;
  created: string; city?: string;
  contact?: string; email?: string; phone?: string; address?: string;
  liveTracking?: boolean; sos?: boolean; todayTrips?: number; monthlyCost?: number;
};

// Organizations
function OrganizationsView() {
  const SEED_ORGS: OrgRow[] = [
    { name: 'TCS Pune Campus',     id: 'ORG-001', employees: 4200, drivers: 182, vehicles: 134, trips: 89, status: 'Active',    plan: 'Enterprise', created: 'Jan 2024', city: 'Pune',      contact: 'Rajesh Sharma',    email: 'admin@tcs-pune.com',        phone: '+91 98765 43210', address: 'Rajiv Gandhi Infotech Park, Hinjewadi Ph1, Pune 411057', liveTracking: true,  sos: true,  todayTrips: 127, monthlyCost: 1840000 },
    { name: 'Infosys BPM Ltd',     id: 'ORG-002', employees: 1200, drivers: 54,  vehicles: 41,  trips: 24, status: 'Active',    plan: 'Business',   created: 'Mar 2024', city: 'Pune',      contact: 'Priya Nair',       email: 'transport@infosys-bpm.com', phone: '+91 87654 32109', address: '25/1, Hinjewadi Phase 2, Pune 411057',                    liveTracking: true,  sos: true,  todayTrips: 36,  monthlyCost: 520000  },
    { name: 'Wipro Technologies',  id: 'ORG-003', employees: 3100, drivers: 138, vehicles: 102, trips: 62, status: 'Active',    plan: 'Enterprise', created: 'Feb 2024', city: 'Bangalore', contact: 'Venkat Rao',       email: 'fleet@wipro.com',           phone: '+91 76543 21098', address: 'Sarjapur Road, Electronic City, Bangalore 560100',        liveTracking: true,  sos: true,  todayTrips: 84,  monthlyCost: 1450000 },
    { name: 'Cognizant Hinjewadi', id: 'ORG-004', employees: 2800, drivers: 121, vehicles: 91,  trips: 54, status: 'Active',    plan: 'Enterprise', created: 'Apr 2024', city: 'Pune',      contact: 'Ananya Singh',     email: 'admin@cognizant-pune.com',  phone: '+91 65432 10987', address: 'Hinjewadi Phase 3, Pune 411057',                          liveTracking: true,  sos: true,  todayTrips: 71,  monthlyCost: 1280000 },
    { name: 'Capgemini India',     id: 'ORG-005', employees: 890,  drivers: 38,  vehicles: 29,  trips: 17, status: 'Active',    plan: 'Business',   created: 'May 2024', city: 'Mumbai',    contact: 'Sneha Kulkarni',   email: 'transport@capgemini.in',    phone: '+91 54321 09876', address: 'BKC, Bandra East, Mumbai 400051',                         liveTracking: true,  sos: false, todayTrips: 23,  monthlyCost: 390000  },
    { name: 'HCL Technologies',   id: 'ORG-006', employees: 2100, drivers: 92,  vehicles: 70,  trips: 0,  status: 'Suspended', plan: 'Enterprise', created: 'Jun 2024', city: 'Noida',     contact: 'Amit Gupta',       email: 'fleet@hcl-noida.com',       phone: '+91 43210 98765', address: 'Sector 60, Noida 201309',                                 liveTracking: false, sos: false, todayTrips: 0,   monthlyCost: 0       },
    { name: 'Mphasis Bangalore',   id: 'ORG-007', employees: 450,  drivers: 19,  vehicles: 14,  trips: 8,  status: 'Trial',     plan: 'Business',   created: 'Sep 2024', city: 'Bangalore', contact: 'Kiran Bhat',       email: 'admin@mphasis-blr.com',     phone: '+91 32109 87654', address: 'Bagmane Tech Park, Bangalore 560093',                     liveTracking: true,  sos: false, todayTrips: 11,  monthlyCost: 180000  },
    { name: 'Zensar Technologies', id: 'ORG-008', employees: 620,  drivers: 27,  vehicles: 21,  trips: 11, status: 'Trial',     plan: 'Starter',    created: 'Sep 2024', city: 'Pune',      contact: 'Deepak Patil',     email: 'fleet@zensar.com',          phone: '+91 21098 76543', address: 'EON IT Park, Kharadi, Pune 411014',                       liveTracking: true,  sos: false, todayTrips: 15,  monthlyCost: 120000  },
  ];

  const [orgs, setOrgs] = useState<OrgRow[]>(SEED_ORGS);
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const PAGE_SIZE = 5;
  const [viewOrg, setViewOrg] = useState<OrgRow | null>(null);
  const [editOrg, setEditOrg] = useState<OrgRow | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'activate' | 'delete'; org: OrgRow } | null>(null);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => { setPage(1); }, [filter, search]);

  const showT = (msg: string, ok = true) => setToast({ msg, ok });

  const filtered = orgs.filter(o => {
    const mf = filter === 'All' || o.status === filter;
    const q = search.toLowerCase();
    const ms = !q || o.name.toLowerCase().includes(q) || o.id.toLowerCase().includes(q) || (o.city ?? '').toLowerCase().includes(q);
    return mf && ms;
  });

  const counts = {
    All: orgs.length,
    Active: orgs.filter(o => o.status === 'Active').length,
    Trial: orgs.filter(o => o.status === 'Trial').length,
    Suspended: orgs.filter(o => o.status === 'Suspended').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageOrgs  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleStatusChange = (orgId: string, newStatus: string) => {
    setOrgs(prev => prev.map(o => o.id === orgId ? { ...o, status: newStatus } : o));
    if (viewOrg?.id === orgId) setViewOrg(prev => prev ? { ...prev, status: newStatus } : null);
    setConfirmAction(null); setActionMenu(null);
    showT(`Organization ${newStatus === 'Suspended' ? 'suspended' : 'activated'} successfully`);
  };

  const handleDelete = (orgId: string) => {
    if (viewOrg?.id === orgId) setViewOrg(null);
    setOrgs(prev => prev.filter(o => o.id !== orgId));
    setConfirmAction(null); setActionMenu(null);
    showT('Organization deleted successfully');
  };

  const handleAdd  = (org: OrgRow) => { setOrgs(prev => [org, ...prev]); setShowAdd(false); showT('Organization created successfully'); };
  const handleEdit = (updated: OrgRow) => {
    setOrgs(prev => prev.map(o => o.id === updated.id ? updated : o));
    if (viewOrg?.id === updated.id) setViewOrg(updated);
    setEditOrg(null); showT('Organization updated successfully');
  };

  const openDetail = (org: OrgRow) => {
    setDetailLoading(true); setViewOrg(org);
    setTimeout(() => setDetailLoading(false), 280);
  };

  const sBadge = (s: string) => {
    const cls = s === 'Active' ? 'bg-green-100 text-green-700' : s === 'Suspended' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{s}</span>;
  };
  const pBadge = (p: string) => {
    const cls = p === 'Enterprise' ? 'bg-blue-100 text-blue-700' : p === 'Business' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-100 text-slate-600';
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${cls}`}>{p}</span>;
  };

  const ConfirmModal = () => {
    if (!confirmAction) return null;
    const { type, org } = confirmAction;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={() => setConfirmAction(null)}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 slide-in" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${type === 'delete' ? 'bg-red-100' : type === 'suspend' ? 'bg-amber-100' : 'bg-green-100'}`}>
              {type === 'delete' ? '🗑' : type === 'suspend' ? '⏸' : '▶'}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 capitalize">{type} Organization</h3>
              <p className="text-xs text-slate-400 mono">{org.id} · {org.name}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-5 leading-relaxed">
            {type === 'delete' ? `Permanently delete ${org.name}? All data will be removed. This cannot be undone.`
              : type === 'suspend' ? `Suspend ${org.name}? All active transport operations will be paused immediately.`
              : `Activate ${org.name}? Transport operations will resume for all employees.`}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmAction(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button
              onClick={() => { type === 'delete' ? handleDelete(org.id) : handleStatusChange(org.id, type === 'suspend' ? 'Suspended' : 'Active'); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${type === 'delete' ? 'bg-red-600 hover:bg-red-700' : type === 'suspend' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'}`}>
              {type === 'delete' ? 'Delete' : type === 'suspend' ? 'Suspend' : 'Activate'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ToastNotif = () => !toast ? null : (
    <div className="fixed bottom-6 right-6 z-50 slide-in pointer-events-none">
      <div className={`px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 ${toast.ok ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}>
        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${toast.ok ? 'bg-green-500' : 'bg-red-400'}`}>{toast.ok ? '✓' : '!'}</span>
        {toast.msg}
      </div>
    </div>
  );

  // ─── DETAIL VIEW ───────────────────────────────────────
  if (viewOrg) {
    const live = orgs.find(o => o.id === viewOrg.id) ?? viewOrg;
    return (
      <div className="p-6 h-full overflow-y-auto slide-in">
        {editOrg && <OrgFormModal org={editOrg} onClose={() => setEditOrg(null)} onSave={handleEdit} />}
        <ConfirmModal />
        <ToastNotif />

        {detailLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-slate-100 rounded-2xl w-64" />
            <div className="grid grid-cols-6 gap-3">{[1,2,3,4,5,6].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>
            <div className="h-64 bg-slate-100 rounded-2xl" />
          </div>
        ) : (
          <>
            {/* Detail header */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewOrg(null)} className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 text-sm transition-colors flex-shrink-0">←</button>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">{live.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base font-bold text-slate-900">{live.name}</h1>
                    {sBadge(live.status)} {pBadge(live.plan)}
                  </div>
                  <p className="text-xs text-slate-400 mono mt-0.5">{live.id} · {live.city} · Since {live.created}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setEditOrg(live)} className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700">Edit Organization</button>
                <button
                  onClick={() => setConfirmAction({ type: live.status === 'Active' ? 'suspend' : 'activate', org: live })}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors ${live.status === 'Active' ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'}`}>
                  {live.status === 'Active' ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => setViewOrg(null)} className="px-4 py-2 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-500">← Back</button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
              {[
                { label: 'Employees',    value: live.employees.toLocaleString(), color: 'text-blue-600',   bg: 'bg-blue-50' },
                { label: 'Drivers',      value: live.drivers.toString(),          color: 'text-slate-800',  bg: 'bg-slate-50' },
                { label: 'Vehicles',     value: live.vehicles.toString(),         color: 'text-slate-800',  bg: 'bg-slate-50' },
                { label: 'Active Trips', value: live.trips.toString(),            color: 'text-blue-600',   bg: 'bg-blue-50' },
                { label: "Today's Trips",value: (live.todayTrips ?? 0).toString(),color: 'text-green-700',  bg: 'bg-green-50' },
                { label: 'Monthly Cost', value: `₹${((live.monthlyCost ?? 0)/100000).toFixed(1)}L`, color: 'text-purple-700', bg: 'bg-purple-50' },
              ].map(c => (
                <div key={c.label} className={`${c.bg} rounded-2xl border border-white p-4 shadow-sm`}>
                  <div className={`text-xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{c.label}</div>
                </div>
              ))}
            </div>

            {/* Detail grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Organization Information</h3>
                <div className="space-y-2.5">
                  {([['Name', live.name], ['Organization ID', live.id], ['City', live.city ?? '—'], ['Address', live.address ?? '—'], ['Status', live.status], ['Plan', live.plan], ['Created', live.created], ['Live Tracking', live.liveTracking ? '✓ Enabled' : '✕ Disabled'], ['SOS Emergency', live.sos ? '✓ Enabled' : '✕ Disabled']] as [string,string][]).map(([l, v]) => (
                    <div key={l} className="flex gap-4">
                      <span className="text-[11px] text-slate-400 w-32 flex-shrink-0">{l}</span>
                      <span className={`text-xs font-medium ${l === 'Status' ? (live.status === 'Active' ? 'text-green-700' : live.status === 'Suspended' ? 'text-red-700' : 'text-amber-700') : 'text-slate-700'}`}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Contact Information</h3>
                  <div className="space-y-2.5">
                    {([['Contact Person', live.contact ?? '—'], ['Email', live.email ?? '—'], ['Phone', live.phone ?? '—']] as [string,string][]).map(([l, v]) => (
                      <div key={l} className="flex gap-4">
                        <span className="text-[11px] text-slate-400 w-32 flex-shrink-0">{l}</span>
                        <span className="text-xs font-medium text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Fleet Summary</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[['Vehicles', live.vehicles], ['Drivers', live.drivers], ['Trips Today', live.todayTrips ?? 0]].map(([l, v]) => (
                      <div key={l} className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-lg font-bold text-slate-800">{v}</div>
                        <div className="text-[10px] text-slate-400">{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { t:'2 min ago',   dot:'bg-green-500',  label:'Trip completed',          desc:`Driver confirmed drop — ${live.employees > 0 ? '6' : '0'} employees reached destination` },
                  { t:'18 min ago',  dot:'bg-blue-500',   label:'New driver assigned',      desc:'Driver #847 confirmed for evening shift' },
                  { t:'1 hr ago',    dot:'bg-blue-500',   label:'Trip started',             desc:`Morning batch · ${live.vehicles} vehicles dispatched` },
                  { t:'2 hrs ago',   dot:'bg-slate-300',  label:'Automated health check',   desc:'All systems operational — no issues detected' },
                  { t:'Yesterday',   dot:'bg-purple-500', label:'Monthly report generated', desc:`₹${((live.monthlyCost ?? 0)/100000).toFixed(1)}L transportation cost summary ready` },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-800">{a.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{a.desc}</div>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">{a.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── TABLE VIEW ────────────────────────────────────────
  return (
    <div className="p-6 slide-in overflow-y-auto h-full" onClick={() => setActionMenu(null)}>
      {showAdd && <OrgFormModal onClose={() => setShowAdd(false)} onSave={handleAdd} />}
      {editOrg && <OrgFormModal org={editOrg} onClose={() => setEditOrg(null)} onSave={handleEdit} />}
      <ConfirmModal />
      <ToastNotif />

      {/* Controls row */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {(['All', 'Active', 'Trial', 'Suspended'] as const).map(f => (
            <button key={f} onClick={e => { e.stopPropagation(); setFilter(f); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${filter === f ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              {f}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === f ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <div className="relative">
            <DIcon name="zoom-in" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
              placeholder="Search by name, ID, or city…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 text-xs font-bold transition-colors">✕</button>
            )}
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">+ Add Organization</button>
        </div>
      </div>

      {/* Count */}
      <div className="mb-3 text-xs text-slate-400 flex items-center gap-1 flex-wrap">
        Showing <span className="font-semibold text-slate-700 mx-1">{filtered.length}</span> of <span className="font-semibold text-slate-700 mx-1">{orgs.length}</span> organizations
        {search && <span className="ml-1">matching "<span className="text-slate-700 font-medium italic">{search}</span>"</span>}
        {filter !== 'All' && <span className="ml-1">· <span className="text-blue-600 font-medium">{filter}</span> only</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="hidden md:grid px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/70"
          style={{ gridTemplateColumns: '1fr 80px 72px 60px 64px 72px 90px 90px 76px 110px' }}>
          {['Organization','ID','Employees','Drivers','Vehicles','Trips','Status','Plan','Created','Actions'].map(h => <div key={h}>{h}</div>)}
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4">
              <DIcon name="zoom-in" size={22} className="text-slate-300" />
            </div>
            <div className="text-sm font-semibold text-slate-600 mb-1">No organizations found</div>
            <div className="text-xs text-slate-400 mb-5">Try adjusting your search or filter</div>
            <button onClick={() => { setSearch(''); setFilter('All'); }} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Clear Filters</button>
          </div>
        ) : (
          pageOrgs.map((org, i) => (
            <div key={org.id}
              className={`flex md:grid items-center px-4 py-3 cursor-pointer transition-colors group ${i < pageOrgs.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-blue-50/40`}
              style={{ gridTemplateColumns: '1fr 80px 72px 60px 64px 72px 90px 90px 76px 110px' }}
              onClick={() => openDetail(org)}>
              {/* Org name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{org.name[0]}</div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{org.name}</div>
                  <div className="text-[10px] text-slate-400">{org.city}</div>
                </div>
              </div>
              <div className="mono text-[11px] text-slate-400 hidden md:block">{org.id}</div>
              <div className="text-xs text-slate-700 hidden md:block">{org.employees.toLocaleString()}</div>
              <div className="text-xs text-slate-700 hidden md:block">{org.drivers}</div>
              <div className="text-xs text-slate-700 hidden md:block">{org.vehicles}</div>
              <div className="text-xs font-semibold text-blue-600 hidden md:block">{org.trips}</div>
              <div className="hidden md:block">{sBadge(org.status)}</div>
              <div className="hidden md:block">{pBadge(org.plan)}</div>
              <div className="text-[11px] text-slate-400 hidden md:block">{org.created}</div>
              {/* Actions */}
              <div className="flex items-center gap-1 relative ml-auto md:ml-0 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <button onClick={() => openDetail(org)} className="px-2.5 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">View</button>
                <button
                  onClick={e => { e.stopPropagation(); setActionMenu(actionMenu === org.id ? null : org.id); }}
                  className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 font-bold text-sm transition-colors">···
                </button>
                {actionMenu === org.id && (
                  <div className="absolute right-0 top-8 z-20 bg-white border border-slate-100 rounded-2xl shadow-2xl py-1.5 w-44 slide-in">
                    <button onClick={() => { openDetail(org); setActionMenu(null); }} className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                      <DIcon name="zoom-in" size={12} className="text-slate-400" /> View Details
                    </button>
                    <button onClick={() => { setEditOrg(org); setActionMenu(null); }} className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors">
                      <DIcon name="activity" size={12} className="text-slate-400" /> Edit Organization
                    </button>
                    <div className="border-t border-slate-100 my-1" />
                    {org.status !== 'Active' && (
                      <button onClick={() => { setConfirmAction({ type: 'activate', org }); setActionMenu(null); }} className="w-full text-left px-3.5 py-2 text-xs text-green-700 hover:bg-green-50 flex items-center gap-2.5 transition-colors">
                        <DIcon name="check" size={12} className="text-green-500" /> Activate
                      </button>
                    )}
                    {org.status !== 'Suspended' && (
                      <button onClick={() => { setConfirmAction({ type: 'suspend', org }); setActionMenu(null); }} className="w-full text-left px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors">
                        <DIcon name="clock" size={12} className="text-amber-500" /> Suspend
                      </button>
                    )}
                    <div className="border-t border-slate-100 my-1" />
                    <button onClick={() => { setConfirmAction({ type: 'delete', org }); setActionMenu(null); }} className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                      <DIcon name="x" size={12} className="text-red-400" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-slate-400">Page <span className="font-semibold text-slate-600">{page}</span> of <span className="font-semibold text-slate-600">{totalPages}</span></div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Employees
// ─── Employee types & data ────────────────────────────────────────────────────
type EmpRow = {
  id: string; name: string; dept: string; shift: string;
  pickup: string; drop: string; eligible: boolean;
  ride: string; status: string; phone: string; email: string;
};

const SEED_EMPLOYEES: EmpRow[] = [
  { id: 'EMP-10481', name: 'Akshat Gupta',    dept: 'Engineering', shift: 'Morning', pickup: 'Kothrud, Pune',      drop: 'Hinjewadi Phase 1', eligible: true,  ride: 'RIDE-10421', status: 'Active',   phone: '••••••4821', email: 'a.gupta@tcs.com' },
  { id: 'EMP-10482', name: 'Priya Sharma',    dept: 'HR',          shift: 'General', pickup: 'Baner, Pune',        drop: 'Hinjewadi Phase 2', eligible: true,  ride: 'RIDE-10422', status: 'Active',   phone: '••••••7342', email: 'p.sharma@tcs.com' },
  { id: 'EMP-10483', name: 'Rahul Joshi',     dept: 'Finance',     shift: 'Evening', pickup: 'Aundh, Pune',        drop: 'Magarpatta City',   eligible: true,  ride: '—',          status: 'Active',   phone: '••••••1190', email: 'r.joshi@tcs.com' },
  { id: 'EMP-10484', name: 'Sneha Kulkarni',  dept: 'Operations',  shift: 'Night',   pickup: 'Wakad, Pune',        drop: 'Hinjewadi Phase 3', eligible: true,  ride: 'RIDE-10438', status: 'Active',   phone: '••••••5563', email: 's.kulkarni@tcs.com' },
  { id: 'EMP-10485', name: 'Vijay Patil',     dept: 'Marketing',   shift: 'Morning', pickup: 'Pimple Saudagar',    drop: 'Baner Road',        eligible: false, ride: '—',          status: 'Inactive', phone: '••••••2281', email: 'v.patil@tcs.com' },
  { id: 'EMP-10486', name: 'Anita Desai',     dept: 'Legal',       shift: 'General', pickup: 'Hadapsar, Pune',     drop: 'EON IT Park',       eligible: true,  ride: 'RIDE-10441', status: 'Active',   phone: '••••••9920', email: 'a.desai@tcs.com' },
  { id: 'EMP-10487', name: 'Rohan Mehta',     dept: 'Engineering', shift: 'Morning', pickup: 'Karve Nagar',        drop: 'Hinjewadi Phase 1', eligible: true,  ride: 'RIDE-10421', status: 'Active',   phone: '••••••4410', email: 'r.mehta@tcs.com' },
  { id: 'EMP-10488', name: 'Kavita Nair',     dept: 'HR',          shift: 'General', pickup: 'Pashan, Pune',       drop: 'Hinjewadi Phase 2', eligible: true,  ride: '—',          status: 'Active',   phone: '••••••8823', email: 'k.nair@tcs.com' },
  { id: 'EMP-10489', name: 'Sanjay Bhat',     dept: 'Finance',     shift: 'Morning', pickup: 'Shivajinagar',       drop: 'Magarpatta City',   eligible: false, ride: '—',          status: 'Active',   phone: '••••••3317', email: 's.bhat@tcs.com' },
  { id: 'EMP-10490', name: 'Deepika Iyer',    dept: 'Operations',  shift: 'Evening', pickup: 'Chinchwad, Pune',    drop: 'Hinjewadi Phase 3', eligible: true,  ride: 'RIDE-10439', status: 'Active',   phone: '••••••6604', email: 'd.iyer@tcs.com' },
];

// ─── Add Employee Modal ───────────────────────────────────────────────────────
function AddEmpModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: EmpRow) => void }) {
  const [form, setForm] = useState({ name: '', dept: 'Engineering', shift: 'Morning', pickup: '', drop: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.email.trim()) { setError('Email is required.'); return; }
    if (!form.pickup.trim() || !form.drop.trim()) { setError('Pickup and drop locations are required.'); return; }
    const num = String(10491 + Math.floor(Math.random() * 500));
    onAdd({
      id: `EMP-${num}`,
      name: form.name.trim(),
      dept: form.dept,
      shift: form.shift,
      pickup: form.pickup.trim(),
      drop: form.drop.trim(),
      eligible: true,
      ride: '—',
      status: 'Active',
      phone: '••••••' + form.phone.slice(-4),
      email: form.email.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(12px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add Employee</h2>
            <p className="text-xs text-slate-400 mt-0.5">Register a new employee for transport services</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Department</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" value={form.dept} onChange={e => set('dept', e.target.value)}>
                {['Engineering', 'HR', 'Finance', 'Operations', 'Marketing', 'Legal', 'Design', 'Product'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Shift</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" value={form.shift} onChange={e => set('shift', e.target.value)}>
                {['Morning', 'General', 'Evening', 'Night'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Work Email <span className="text-red-500">*</span></label>
              <input type="email" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="name@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Pickup Location <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Kothrud, Pune" value={form.pickup} onChange={e => set('pickup', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Drop Location <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Hinjewadi Phase 1" value={form.drop} onChange={e => set('drop', e.target.value)} />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
            ℹ New employees are marked <strong>Eligible</strong> by default. Eligibility can be modified after onboarding.
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Add Employee</button>
        </div>
      </div>
    </div>
  );
}

// ─── Employee Profile Drawer ──────────────────────────────────────────────────
function EmpProfileDrawer({ emp, onClose }: { emp: EmpRow; onClose: () => void }) {
  const initials = emp.name.split(' ').map(n => n[0]).join('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-800">Employee Profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">{emp.name}</div>
                <div className="text-xs text-slate-400 mono mt-0.5">{emp.id}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge label={emp.status} color={emp.status === 'Active' ? 'green' : 'slate'} />
              <Badge label={emp.eligible ? 'Transport Eligible' : 'Ineligible'} color={emp.eligible ? 'blue' : 'red'} />
              <Badge label={emp.shift + ' Shift'} color="slate" />
            </div>
          </div>

          {/* Details grid */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {[
                { label: 'Department', value: emp.dept, icon: '🏢' },
                { label: 'Shift', value: emp.shift, icon: '⏰' },
                { label: 'Phone', value: emp.phone, icon: '📞' },
                { label: 'Email', value: emp.email, icon: '📧' },
                { label: 'Pickup Location', value: emp.pickup, icon: '📍' },
                { label: 'Drop Location', value: emp.drop, icon: '🏁' },
                { label: 'Upcoming Ride', value: emp.ride, icon: '🚗' },
                { label: 'Emergency Contact', value: 'Restricted 🔒', icon: '🆘', restricted: true },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-2.5 py-2 border-b border-slate-50">
                  <span className="text-sm mt-0.5 flex-shrink-0">{f.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</div>
                    <div className={`text-xs font-medium ${f.restricted ? 'text-red-400' : 'text-slate-800'} truncate`}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-2 flex-shrink-0">
          <button className="py-2.5 text-xs bg-blue-50 text-blue-700 rounded-xl border border-blue-200 font-semibold hover:bg-blue-100 transition-colors">Edit Profile</button>
          <button className="py-2.5 text-xs bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold hover:bg-slate-200 transition-colors">Ride History</button>
          <button className="py-2.5 text-xs bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-semibold hover:bg-amber-100 transition-colors">Toggle Eligibility</button>
          <button className="py-2.5 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold hover:bg-red-100 transition-colors">Deactivate</button>
        </div>
      </div>
    </div>
  );
}

// ─── Employees View ───────────────────────────────────────────────────────────
function EmployeesView() {
  const [employees, setEmployees] = useState<EmpRow[]>(SEED_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All Depts');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileEmp, setProfileEmp] = useState<EmpRow | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const DEPTS = ['All Depts', 'Engineering', 'HR', 'Finance', 'Operations'];
  useEffect(() => { setPage(1); }, [search, dept]);

  const filtered = employees.filter(e => {
    const matchDept = dept === 'All Depts' || e.dept === dept;
    const q = search.toLowerCase();
    const matchSearch = !q || e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.pickup.toLowerCase().includes(q);
    return matchDept && matchSearch;
  });

  const totalEmpPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedEmployees = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const deptCounts: Record<string, number> = { 'All Depts': employees.length };
  employees.forEach(e => { deptCounts[e.dept] = (deptCounts[e.dept] || 0) + 1; });

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {showAddModal && (
        <AddEmpModal
          onClose={() => setShowAddModal(false)}
          onAdd={emp => setEmployees(prev => [emp, ...prev])}
        />
      )}
      {profileEmp && <EmpProfileDrawer emp={profileEmp} onClose={() => setProfileEmp(null)} />}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              className="pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="Search employees…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-sm leading-none">✕</button>
            )}
          </div>

          {/* Dept tabs */}
          {DEPTS.map(d => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                dept === d
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {d}
              {deptCounts[d] !== undefined && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${dept === d ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {deptCounts[d] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1.5 flex-shrink-0"
        >
          + Add Employee
        </button>
      </div>

      {/* Results line */}
      <div className="mb-3 text-xs text-slate-400">
        {filtered.length === employees.length
          ? `${employees.length} employees`
          : `${filtered.length} of ${employees.length} employees`}
        {search && <span> matching "<span className="text-slate-600 font-medium">{search}</span>"</span>}
        {dept !== 'All Depts' && <span> in <span className="text-slate-600 font-medium">{dept}</span></span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Employee ID', 'Name', 'Dept', 'Shift', 'Pickup', 'Drop', 'Eligibility', 'Upcoming Ride', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <div className="text-sm text-slate-500 font-medium">No employees found</div>
                    <div className="text-xs text-slate-400">
                      {search ? `No results for "${search}"` : `No employees in ${dept}`}
                    </div>
                    {(search || dept !== 'All Depts') && (
                      <button onClick={() => { setSearch(''); setDept('All Depts'); }} className="mt-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : pagedEmployees.map(emp => (
              <tr key={emp.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><span className="mono text-[11px] text-slate-400">{emp.id}</span></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-xs font-medium text-slate-800">{emp.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{emp.dept}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{emp.shift}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{emp.pickup}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{emp.drop}</td>
                <td className="px-4 py-3">
                  <Badge label={emp.eligible ? 'Eligible' : 'Ineligible'} color={emp.eligible ? 'green' : 'red'} />
                </td>
                <td className="px-4 py-3"><span className="mono text-[11px] text-blue-600">{emp.ride}</span></td>
                <td className="px-4 py-3">
                  <Badge label={emp.status} color={emp.status === 'Active' ? 'green' : 'slate'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setProfileEmp(emp)}
                      className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      View
                    </button>
                    <button
                      onClick={() => setEmployees(prev => prev.map(e => e.id === emp.id ? { ...e, eligible: !e.eligible } : e))}
                      className="px-2 py-1 text-[10px] bg-slate-100 text-slate-600 rounded hover:bg-slate-200"
                      title="Toggle eligibility"
                    >
                      {emp.eligible ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-slate-600">{filtered.length}</span> employees
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">← Prev</button>
          {Array.from({ length: Math.min(totalEmpPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
          ))}
          {totalEmpPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
          <button onClick={() => setPage(p => Math.min(totalEmpPages, p + 1))} disabled={page === totalEmpPages}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">Next →</button>
        </div>
      </div>

      {/* Totals */}
      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span>Active: <span className="text-green-600 font-semibold">{employees.filter(e => e.status === 'Active').length}</span></span>
        <span>Inactive: <span className="text-slate-500 font-semibold">{employees.filter(e => e.status === 'Inactive').length}</span></span>
        <span>Eligible: <span className="text-blue-600 font-semibold">{employees.filter(e => e.eligible).length}</span></span>
        <span>Ineligible: <span className="text-red-500 font-semibold">{employees.filter(e => !e.eligible).length}</span></span>
      </div>
    </div>
  );
}

// Live Operations
// ─── Live Ops ride data ───────────────────────────────────────────────────────
type LiveRide = {
  id: string; driver: string; vehicle: string; employees: number; eta: string;
  status: string; pickup: string; drop: string; org: string;
  mapX: number; mapY: number;
};

const LIVE_RIDES: LiveRide[] = [
  { id: 'RIDE-10421', driver: 'Raj Kumar',    vehicle: 'MH12AB1234', employees: 4, eta: '08 min', status: 'On Route',  pickup: 'Kothrud',          drop: 'Hinjewadi Ph1', org: 'TCS Pune',  mapX: 22, mapY: 28 },
  { id: 'RIDE-10422', driver: 'Suresh Yadav', vehicle: 'MH12CD5678', employees: 6, eta: '22 min', status: 'Delayed',   pickup: 'Baner',             drop: 'Hinjewadi Ph2', org: 'Infosys',   mapX: 55, mapY: 52 },
  { id: 'RIDE-10423', driver: 'Mohan Singh',  vehicle: 'MH12EF9012', employees: 3, eta: '14 min', status: 'On Route',  pickup: 'Aundh',             drop: 'Magarpatta',    org: 'Wipro',     mapX: 48, mapY: 72 },
  { id: 'RIDE-10438', driver: 'Arjun Nair',   vehicle: 'MH12GH3456', employees: 7, eta: 'SOS!',   status: 'SOS',       pickup: 'Wakad',             drop: 'Hinjewadi Ph3', org: 'Cognizant', mapX: 72, mapY: 32 },
  { id: 'RIDE-10439', driver: 'Deepak Patel', vehicle: 'MH12IJ7890', employees: 5, eta: '31 min', status: 'Assigned',  pickup: 'Pimple Saudagar',   drop: 'Baner Rd',      org: 'TCS Pune',  mapX: 82, mapY: 58 },
];

// ─── Ride Details Drawer ──────────────────────────────────────────────────────
function RideDetailsDrawer({ ride, onClose }: { ride: LiveRide; onClose: () => void }) {
  const statusColor = (s: string): 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'cyan' =>
    s === 'On Route' ? 'green' : s === 'Delayed' ? 'amber' : s === 'SOS' ? 'red' : 'slate';

  const timeline = [
    { time: '07:45', event: 'Ride scheduled', done: true },
    { time: '08:02', event: 'Driver assigned & confirmed', done: true },
    { time: '08:15', event: 'Driver arrived at pickup', done: true },
    { time: '08:22', event: 'Ride started', done: true },
    { time: ride.eta === 'SOS!' ? '08:38' : '—', event: ride.status === 'SOS' ? 'SOS triggered' : 'ETA: ' + ride.eta, done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="w-96 bg-white h-full overflow-y-auto shadow-2xl slide-in" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mono">{ride.id}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{ride.org}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge label={ride.status} color={statusColor(ride.status)} />
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg leading-none">✕</button>
          </div>
        </div>

        {/* Driver + vehicle */}
        <div className="p-5 border-b border-slate-200">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Driver & Vehicle</h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {ride.driver.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{ride.driver}</div>
              <div className="text-xs text-slate-400 mono">{ride.vehicle}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 mb-0.5">Passengers</div>
              <div className="text-sm font-bold text-slate-800">👥 {ride.employees}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 mb-0.5">ETA</div>
              <div className={`text-sm font-bold ${ride.status === 'SOS' ? 'text-red-600' : ride.status === 'Delayed' ? 'text-amber-600' : 'text-green-600'}`}>{ride.eta}</div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="p-5 border-b border-slate-200">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Route</h4>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div className="w-0.5 h-8 bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <div className="text-[10px] text-slate-400">Pickup</div>
                <div className="text-xs font-medium text-slate-800">{ride.pickup}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Drop</div>
                <div className="text-xs font-medium text-slate-800">{ride.drop}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-5 border-b border-slate-200">
          <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-3">Timeline</h4>
          <div className="space-y-3">
            {timeline.map((t, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${t.done ? 'bg-green-500' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <div className="text-xs text-slate-700">{t.event}</div>
                  <div className="text-[10px] text-slate-400 mono">{t.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 grid grid-cols-2 gap-2">
          <button className="py-2 text-xs bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 col-span-2">Contact Driver</button>
          <button className="py-2 text-xs bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-medium hover:bg-slate-200">View Route</button>
          {ride.status === 'SOS'
            ? <button className="py-2 text-xs bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700">Open Incident</button>
            : <button className="py-2 text-xs bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-medium hover:bg-amber-100">Report Issue</button>
          }
        </div>
      </div>
    </div>
  );
}

// Note: LiveOpsView component is imported from ./components/LiveOpsView

// Access Control
type RoleRow = { id: string; name: string; users: number; perms: string; permCount: number; scope: string; status: string; updated: string; desc: string; type: string; };

const PERM_RESOURCES = ['Employees', 'Drivers', 'Vehicles', 'Rides', 'Tracking', 'Billing', 'Reports', 'Incidents'];
const PERM_ACTIONS   = ['Read', 'Create', 'Update', 'Delete', 'Approve'];

const DEFAULT_MATRIX: Record<string, Record<string, boolean>> = {
  Employees: { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Drivers:   { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Vehicles:  { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Rides:     { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Tracking:  { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Billing:   { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Reports:   { Read: false, Create: false, Update: false, Delete: false, Approve: false },
  Incidents: { Read: false, Create: false, Update: false, Delete: false, Approve: false },
};

const SEED_ROLES: RoleRow[] = [
  { id: 'r1', name: 'Organization Admin',  users: 44,  perms: 'Full Access',      permCount: 40, scope: 'Organization', status: 'Active',   updated: '2024-09-01', desc: 'Full platform administrator', type: 'System' },
  { id: 'r2', name: 'Transport Manager',   users: 128, perms: '24 permissions',   permCount: 24, scope: 'Organization', status: 'Active',   updated: '2024-09-10', desc: 'Manages fleet and rides',     type: 'Standard' },
  { id: 'r3', name: 'Fleet Manager',       users: 87,  perms: '18 permissions',   permCount: 18, scope: 'Department',   status: 'Active',   updated: '2024-08-22', desc: 'Vehicle operations scope',    type: 'Standard' },
  { id: 'r4', name: 'Driver Supervisor',   users: 56,  perms: '14 permissions',   permCount: 14, scope: 'Department',   status: 'Active',   updated: '2024-09-05', desc: 'Driver management only',      type: 'Standard' },
  { id: 'r5', name: 'HR Manager',          users: 112, perms: '12 permissions',   permCount: 12, scope: 'Department',   status: 'Active',   updated: '2024-07-18', desc: 'Employee data access',        type: 'Standard' },
  { id: 'r6', name: 'Security Manager',    users: 23,  perms: '16 permissions',   permCount: 16, scope: 'Organization', status: 'Active',   updated: '2024-09-12', desc: 'Incident & safety access',    type: 'Standard' },
  { id: 'r7', name: 'Report Manager',      users: 34,  perms: '8 permissions',    permCount: 8,  scope: 'Location',     status: 'Inactive', updated: '2024-06-30', desc: 'Read-only reporting access',  type: 'Standard' },
];

function PermMatrix({ matrix, onToggle }: { matrix: Record<string, Record<string, boolean>>; onToggle: (res: string, action: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-2 pr-4 text-slate-500 font-semibold">Resource</th>
            {PERM_ACTIONS.map(p => <th key={p} className="text-center py-2 px-3 text-slate-500 font-semibold">{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {PERM_RESOURCES.map(res => (
            <tr key={res} className="border-t border-slate-100">
              <td className="py-2.5 pr-4 font-medium text-slate-700">{res}</td>
              {PERM_ACTIONS.map(p => {
                const has = matrix[res]?.[p] ?? false;
                return (
                  <td key={p} className="text-center py-2.5 px-3">
                    <button
                      onClick={() => onToggle(res, p)}
                      className={`w-5 h-5 rounded flex items-center justify-center mx-auto transition-colors ${has ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300 hover:bg-blue-100 hover:text-blue-400'}`}
                    >
                      {has ? '✓' : '–'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccessControlView() {
  const [activeTab, setActiveTab]   = useState<'roles' | 'create'>('roles');
  const [roles, setRoles]           = useState<RoleRow[]>(SEED_ROLES);
  const [editId, setEditId]         = useState<string | null>(null);
  const [editMatrix, setEditMatrix] = useState<Record<string, Record<string, boolean>>>(DEFAULT_MATRIX);
  const [editForm, setEditForm]     = useState<{ name: string; desc: string; scope: string; status: string }>({ name: '', desc: '', scope: 'Organization', status: 'Active' });
  const [saved, setSaved]           = useState(false);

  // Create form state
  const [newName,   setNewName]   = useState('');
  const [newDesc,   setNewDesc]   = useState('');
  const [newScope,  setNewScope]  = useState('Full Organization');
  const [newType,   setNewType]   = useState('Standard');
  const [newMatrix, setNewMatrix] = useState<Record<string, Record<string, boolean>>>(
    Object.fromEntries(PERM_RESOURCES.map(r => [r, Object.fromEntries(PERM_ACTIONS.map(a => [a, false]))]))
  );
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const startEdit = (r: RoleRow) => {
    setEditId(r.id);
    setEditForm({ name: r.name, desc: r.desc, scope: r.scope, status: r.status });
    const m = Object.fromEntries(PERM_RESOURCES.map(res => [res, Object.fromEntries(PERM_ACTIONS.map((a, ai) => [a, r.permCount > ai * 5]))]));
    setEditMatrix(m);
    setSaved(false);
  };

  const saveEdit = () => {
    const count = Object.values(editMatrix).flat().filter(v => Object.values(v as unknown as Record<string,boolean>).some(x => x)).length;
    setRoles(prev => prev.map(r => r.id === editId
      ? { ...r, ...editForm, perms: editForm.name === 'Organization Admin' ? 'Full Access' : `${count} permissions`, permCount: count, updated: new Date().toISOString().slice(0, 10) }
      : r));
    setSaved(true);
    setTimeout(() => { setEditId(null); setSaved(false); }, 1200);
  };

  const cloneRole = (r: RoleRow) => {
    const newId = `r${Date.now()}`;
    setRoles(prev => [...prev, { ...r, id: newId, name: `${r.name} (Copy)`, users: 0, status: 'Inactive', updated: new Date().toISOString().slice(0, 10) }]);
  };

  const toggleNew = (res: string, action: string) =>
    setNewMatrix(prev => ({ ...prev, [res]: { ...prev[res], [action]: !prev[res][action] } }));

  const toggleEdit = (res: string, action: string) =>
    setEditMatrix(prev => ({ ...prev, [res]: { ...prev[res], [action]: !prev[res][action] } }));

  const createRole = () => {
    if (!newName.trim()) { setCreateError('Role name is required.'); return; }
    const count = Object.values(newMatrix).reduce((acc, acts) => acc + Object.values(acts).filter(Boolean).length, 0);
    const scopeLabel = newScope === 'Full Organization' ? 'Organization' : newScope;
    setRoles(prev => [...prev, {
      id: `r${Date.now()}`, name: newName, users: 0,
      perms: count === 0 ? 'No permissions' : `${count} permissions`, permCount: count,
      scope: scopeLabel, status: 'Active', updated: new Date().toISOString().slice(0, 10),
      desc: newDesc || `${newType} role`, type: newType,
    }]);
    setCreateSuccess(true);
    setTimeout(() => {
      setCreateSuccess(false);
      setNewName(''); setNewDesc(''); setNewScope('Full Organization'); setNewType('Standard');
      setNewMatrix(Object.fromEntries(PERM_RESOURCES.map(r => [r, Object.fromEntries(PERM_ACTIONS.map(a => [a, false]))])));
      setCreateError('');
      setActiveTab('roles');
    }, 1200);
  };

  const editRole = roles.find(r => r.id === editId);

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(['roles', 'create'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setEditId(null); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t === 'roles' ? '👥 Roles & Permissions' : '✚ Create Role'}
            </button>
          ))}
        </div>
        {activeTab === 'roles' && (
          <button onClick={() => setActiveTab('create')} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">+ Create Role</button>
        )}
      </div>

      {activeTab === 'roles' && !editId && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Role', 'Users', 'Permissions', 'Scope', 'Status', 'Last Updated', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-slate-800">{r.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.desc}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{r.users}</td>
                  <td className="px-4 py-3 text-xs text-blue-600 font-medium">{r.perms}</td>
                  <td className="px-4 py-3"><Badge label={r.scope} color="slate" /></td>
                  <td className="px-4 py-3"><Badge label={r.status} color={r.status === 'Active' ? 'green' : 'slate'} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400 mono">{r.updated}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(r)} className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium">Edit</button>
                      <button onClick={() => cloneRole(r)} className="px-2 py-1 text-[10px] bg-slate-100 text-slate-600 rounded hover:bg-slate-200 font-medium">Clone</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'roles' && editId && editRole && (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-blue-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-800">Edit Role</h3>
                <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role Name</label>
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input value={editForm.desc} onChange={e => setEditForm(f => ({ ...f, desc: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Scope</label>
                  <select value={editForm.scope} onChange={e => setEditForm(f => ({ ...f, scope: e.target.value }))} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50">
                    {['Organization', 'Department', 'Location'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                  <div className="flex gap-2">
                    {['Active', 'Inactive'].map(s => (
                      <button key={s} onClick={() => setEditForm(f => ({ ...f, status: s }))}
                        className={`flex-1 py-1.5 text-xs rounded-lg font-medium transition-colors ${editForm.status === s ? (s === 'Active' ? 'bg-green-600 text-white' : 'bg-slate-500 text-white') : 'border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setEditId(null)} className="flex-1 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={saveEdit} className={`flex-1 py-2 text-xs rounded-lg font-semibold transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-2 bg-white rounded-xl border border-blue-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Permission Matrix — {editRole.name}</h3>
            <PermMatrix matrix={editMatrix} onToggle={toggleEdit} />
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Role Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role Name *</label>
                  <input value={newName} onChange={e => { setNewName(e.target.value); setCreateError(''); }} className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 bg-slate-50 ${createError ? 'border-red-300 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'}`} placeholder="e.g. Senior Transport Manager" />
                  {createError && <div className="text-[10px] text-red-500 mt-1">{createError}</div>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
                  <input value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50" placeholder="What can this role do?" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Role Type</label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50">
                    {['Standard', 'Custom', 'System'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Organization Scope</label>
                  <select value={newScope} onChange={e => setNewScope(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-slate-50">
                    {['Full Organization', 'Department', 'Location'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Permission Matrix</h3>
            <p className="text-xs text-slate-400 mb-4">Click cells to toggle permissions for this role</p>
            <PermMatrix matrix={newMatrix} onToggle={toggleNew} />
            <div className="flex justify-end gap-2 mt-5 pt-4 border-t border-slate-100">
              <button onClick={() => setActiveTab('roles')} className="px-4 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button
                onClick={createRole}
                className={`px-4 py-2 text-xs rounded-lg font-semibold transition-colors ${createSuccess ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {createSuccess ? '✓ Role Created!' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Policy Engine
type PolicyRow = { id: string; name: string; resource: string; action: string; condition: string; effect: string; priority: number; version: string; status: string; modified: string; };

const SEED_POLICIES: PolicyRow[] = [
  { id: 'p1', name: 'Employee Own Ride View',    resource: 'Ride',      action: 'ride.view',              condition: 'ride.employee_id == user.id',                   effect: 'ALLOW',         priority: 1, version: 'v2.1', status: 'Active',   modified: '2024-09-15' },
  { id: 'p2', name: 'Tenant Isolation',          resource: 'All',       action: '*',                      condition: 'resource.org_id != user.org_id',                effect: 'DENY',          priority: 0, version: 'v1.0', status: 'Active',   modified: '2024-01-01' },
  { id: 'p3', name: 'Manager Cancellation',      resource: 'Ride',      action: 'ride.cancel',            condition: 'role = Transport Manager AND time < cutoff',    effect: 'ALLOW',         priority: 2, version: 'v1.3', status: 'Active',   modified: '2024-08-20' },
  { id: 'p4', name: 'Department Restriction',    resource: 'Employee',  action: 'employee.view',          condition: 'employee.dept in manager.scope',                effect: 'ALLOW',         priority: 3, version: 'v1.1', status: 'Active',   modified: '2024-07-11' },
  { id: 'p5', name: 'Temporary Recording Access',resource: 'Recording', action: 'recording.view',         condition: 'current_time < access.expiry',                  effect: 'ALLOW',         priority: 4, version: 'v2.0', status: 'Active',   modified: '2024-09-02' },
  { id: 'p6', name: 'Emergency Access Override', resource: 'All',       action: '*',                      condition: 'sos.active == true AND role = Security Manager', effect: 'ALLOW + AUDIT', priority: 0, version: 'v1.2', status: 'Active',   modified: '2024-09-10' },
  { id: 'p7', name: 'Finance Billing View',      resource: 'Billing',   action: 'billing.view',           condition: 'role = Finance Manager',                        effect: 'ALLOW',         priority: 5, version: 'v1.0', status: 'Draft',    modified: '2024-09-20' },
  { id: 'p8', name: 'SOS Route Restriction',     resource: 'Route',     action: 'route.assign',           condition: 'sos.active == false',                           effect: 'DENY',          priority: 1, version: 'v1.0', status: 'Disabled', modified: '2024-08-01' },
];

function PolicyEngineView({ policies, setPolicies }: { policies: PolicyRow[]; setPolicies: React.Dispatch<React.SetStateAction<PolicyRow[]>> }) {
  const [filter, setFilter]     = useState('All Policies');
  const [editId, setEditId]     = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editSaved, setEditSaved]   = useState(false);

  const [editForm, setEditForm] = useState<Partial<PolicyRow>>({});

  // Create modal form state
  const [newName,      setNewName]      = useState('');
  const [newResource,  setNewResource]  = useState('Ride');
  const [newAction,    setNewAction]    = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newEffect,    setNewEffect]    = useState('ALLOW');
  const [createError,  setCreateError]  = useState('');
  const [createOk,     setCreateOk]     = useState(false);

  const effectColor = (e: string): 'green' | 'red' | 'amber' | 'blue' =>
    e.includes('AUDIT') ? 'amber' : e === 'ALLOW' ? 'green' : e === 'DENY' ? 'red' : 'blue';

  // Derive status from effect: ALLOW → Active, DENY → Disabled, others → Draft
  const effectToStatus = (effect: string) =>
    effect === 'ALLOW' ? 'Active' : effect === 'DENY' ? 'Disabled' : 'Draft';

  const countFor = (f: string) =>
    f === 'All Policies' ? policies.length : policies.filter(p => p.status === f).length;

  const filtered = policies.filter(p =>
    filter === 'All Policies' ? true :
    filter === 'Active'       ? p.status === 'Active'   :
    filter === 'Draft'        ? p.status === 'Draft'    :
                                p.status === 'Disabled'
  );

  const openCreate = () => {
    setNewName(''); setNewResource('Ride'); setNewAction('');
    setNewCondition(''); setNewEffect('ALLOW');
    setCreateError(''); setCreateOk(false);
    setEditId(null);
    setShowCreate(true);
  };

  const closeCreate = () => setShowCreate(false);

  const createPolicy = () => {
    if (!newName.trim())   { setCreateError('Policy Name is required.');  return; }
    if (!newAction.trim()) { setCreateError('Action is required.');        return; }
    const status = effectToStatus(newEffect);
    const newP: PolicyRow = {
      id:       `p${Date.now()}`,
      name:     newName.trim(),
      resource: newResource,
      action:   newAction.trim(),
      condition:newCondition.trim(),
      effect:   newEffect,
      priority: policies.length + 1,
      version:  'v1.0',
      status,
      modified: new Date().toISOString().slice(0, 10),
    };
    setPolicies(prev => [...prev, newP]);
    setCreateOk(true);
    // Switch to the correct filter tab so the new policy is visible
    setTimeout(() => {
      setShowCreate(false);
      setCreateOk(false);
      setFilter('All Policies');
    }, 900);
  };

  const startEdit = (p: PolicyRow) => {
    setEditForm({ ...p });
    setEditId(p.id);
    setEditSaved(false);
  };

  const saveEdit = () => {
    setPolicies(prev => prev.map(p =>
      p.id === editId
        ? { ...p, ...editForm, modified: new Date().toISOString().slice(0, 10) } as PolicyRow
        : p
    ));
    setEditSaved(true);
    setTimeout(() => { setEditId(null); setEditSaved(false); }, 1000);
  };

  const toggleStatus = (p: PolicyRow) =>
    setPolicies(prev => prev.map(pp =>
      pp.id === p.id
        ? { ...pp, status: pp.status === 'Active' ? 'Disabled' : 'Active', modified: new Date().toISOString().slice(0, 10) }
        : pp
    ));

  const editPolicy = policies.find(p => p.id === editId);

  return (
    // Outer wrapper: relative + overflow-hidden so the absolute modal backdrop clips correctly
    <div className="relative h-full overflow-hidden">

      {/* ── Create Policy modal ── */}
      {showCreate && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => { if (e.target === e.currentTarget) closeCreate(); }}
        >
          <div className="bg-white rounded-xl shadow-xl w-[420px] mx-4" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">Create Policy</h2>
              <button onClick={closeCreate} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>

            {/* Fields */}
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Policy Name *</label>
                <input
                  value={newName}
                  onChange={e => { setNewName(e.target.value); setCreateError(''); }}
                  placeholder="e.g. Manager Cancellation"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Resource</label>
                  <select
                    value={newResource}
                    onChange={e => setNewResource(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {['Ride', 'Employee', 'Vehicle', 'Recording', 'Billing', 'Route', 'All'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Action *</label>
                  <input
                    value={newAction}
                    onChange={e => { setNewAction(e.target.value); setCreateError(''); }}
                    placeholder="e.g. ride.cancel"
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Condition</label>
                <input
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  placeholder="e.g. role = Transport Manager AND time &lt; cutoff"
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Effect</label>
                <select
                  value={newEffect}
                  onChange={e => setNewEffect(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="ALLOW">ALLOW — grants access (Status: Active)</option>
                  <option value="DENY">DENY — blocks access (Status: Disabled)</option>
                </select>
              </div>

              {createError && (
                <div className="text-[10px] text-red-500">{createError}</div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={closeCreate} className="flex-1 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={createPolicy}
                className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition-colors ${createOk ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {createOk ? '✓ Created!' : 'Create Policy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main scrollable content ── */}
      <div className="p-6 slide-in overflow-y-auto h-full">
        <div className="mb-5 p-4 bg-gradient-to-r from-slate-900 to-blue-900 rounded-xl text-white">
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-widest mb-1">Policy Engine</div>
          <div className="text-sm text-slate-200">Define contextual rules that determine who can access what, when and under which conditions.</div>
        </div>

        {/* Filter tabs + Create button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {['All Policies', 'Active', 'Draft', 'Disabled'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {f}
                <span className="ml-1 text-[10px] opacity-60">({countFor(f)})</span>
              </button>
            ))}
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            + Create Policy
          </button>
        </div>

        {/* Inline Edit form (above table) */}
        {editId && editPolicy && (
          <div className="bg-white rounded-xl border border-blue-200 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Edit — {editPolicy.name}</h3>
              <button onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Policy Name</label>
                <input value={editForm.name ?? ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Resource</label>
                <select value={editForm.resource ?? ''} onChange={e => setEditForm(f => ({ ...f, resource: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50">
                  {['Ride', 'Employee', 'Vehicle', 'Recording', 'Billing', 'Route', 'All'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Action</label>
                <input value={editForm.action ?? ''} onChange={e => setEditForm(f => ({ ...f, action: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 mono focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Condition</label>
                <input value={editForm.condition ?? ''} onChange={e => setEditForm(f => ({ ...f, condition: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 mono focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Effect</label>
                <select value={editForm.effect ?? ''} onChange={e => setEditForm(f => ({ ...f, effect: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50">
                  {['ALLOW', 'DENY', 'ALLOW + AUDIT', 'REQUIRE APPROVAL'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                <select value={editForm.status ?? ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50">
                  {['Active', 'Draft', 'Disabled'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                <input type="number" value={editForm.priority ?? 0} onChange={e => setEditForm(f => ({ ...f, priority: Number(e.target.value) }))} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setEditId(null)} className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveEdit} className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-colors ${editSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                {editSaved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Policy table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Policy Name', 'Resource', 'Action', 'Condition', 'Effect', 'Priority', 'Version', 'Status', 'Modified', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-xs text-slate-400">No policies match this filter</td></tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${editId === p.id ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-3 font-semibold text-slate-800">{p.name}</td>
                  <td className="px-3 py-3 text-slate-500">{p.resource}</td>
                  <td className="px-3 py-3"><span className="mono text-blue-600">{p.action}</span></td>
                  <td className="px-3 py-3 max-w-[160px]">
                    <div className="mono bg-slate-50 px-2 py-1 rounded text-[10px] truncate" title={p.condition}>{p.condition || '—'}</div>
                  </td>
                  <td className="px-3 py-3"><Badge label={p.effect} color={effectColor(p.effect)} /></td>
                  <td className="px-3 py-3 text-center font-bold text-slate-700">{p.priority}</td>
                  <td className="px-3 py-3"><span className="mono text-slate-400">{p.version}</span></td>
                  <td className="px-3 py-3"><Badge label={p.status} color={p.status === 'Active' ? 'green' : p.status === 'Draft' ? 'amber' : 'slate'} /></td>
                  <td className="px-3 py-3 text-slate-400 mono">{p.modified}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(p)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-[10px] font-medium">Edit</button>
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${p.status === 'Active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                      >
                        {p.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
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

// Policy Simulator
function PolicySimulatorView({ policies }: { policies: PolicyRow[] }) {
  const [params, setParams] = useState({
    user: 'Akshat Gupta', role: 'Transport Manager', org: 'Shivneri Demo Organization',
    action: 'ride.cancel', resource: 'Ride #RIDE-10492',
  });
  const [ctx, setCtx] = useState({
    department: 'Engineering', location: 'Pune', shift: 'Active', time: '18:20 IST',
  });
  const [evaluating, setEvaluating]     = useState(false);
  const [evaluated,  setEvaluated]      = useState(false);
  const [result,     setResult]         = useState<'allow' | 'deny' | 'approval' | null>(null);
  const [evalMs,     setEvalMs]         = useState(12);
  const [matchedPolicy, setMatchedPolicy] = useState('');
  const [matchedCond,   setMatchedCond]   = useState<{ desc: string; passed: boolean }[]>([]);
  const [corrId,        setCorrId]        = useState('');
  const [evalTimestamp, setEvalTimestamp] = useState('');
  const [showCondDetail, setShowCondDetail] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real policy matching against live policies prop
  const computeResult = (): 'allow' | 'deny' | 'approval' => {
    const actionKey = params.action.trim().toLowerCase();

    // Gather candidate policies (exact action match first, then wildcards)
    const candidates = policies
      .filter(p => p.status !== 'Disabled')
      .filter(p => p.action === actionKey || p.action === params.action || p.action === '*')
      .sort((a, b) => a.priority - b.priority);

    if (candidates.length === 0) {
      // Fall back to deny-all
      const denyAll = policies.find(p => p.action === '*' && p.effect.startsWith('DENY'));
      setMatchedPolicy(denyAll ? denyAll.name : 'Default Deny');
      setMatchedCond([{ desc: 'No matching policy found', passed: false }]);
      return 'deny';
    }

    const matched = candidates[0];
    setMatchedPolicy(matched.name);

    // Parse condition string into evaluatable sub-conditions
    const parts = matched.condition.split(/\s+AND\s+/i);
    const evaluated = parts.map(part => {
      const p = part.trim();
      // Heuristic condition evaluations based on context
      if (p.includes('org_id')) return { desc: p, passed: params.org.length > 0 };
      if (p.includes('role =') || p.includes('role=')) {
        const reqRole = p.replace(/role\s*=\s*/i, '').trim();
        return { desc: p, passed: params.role.toLowerCase().includes(reqRole.toLowerCase()) };
      }
      if (p.includes('sos.active == true'))  return { desc: p, passed: false };
      if (p.includes('sos.active == false')) return { desc: p, passed: true };
      if (p.includes('user.id'))             return { desc: p, passed: true };
      if (p.includes('expiry'))              return { desc: p, passed: true };
      if (p.includes('time <'))              return { desc: p, passed: true };
      if (p.includes('dept') || p.includes('scope')) return { desc: p, passed: true };
      return { desc: p, passed: true };
    });
    setMatchedCond(evaluated);

    const allPassed = evaluated.every(c => c.passed);
    const effect = matched.effect.toUpperCase();
    if (effect === 'ALLOW + AUDIT' || (effect === 'ALLOW' && allPassed)) return 'allow';
    if (effect === 'DENY') return 'deny';
    if (!allPassed && effect === 'ALLOW') return 'approval';
    return 'deny';
  };

  const handleEvaluate = () => {
    if (!params.action.trim()) return;
    setEvaluating(true);
    setEvaluated(false);
    setShowCondDetail(false);
    const ms = Math.floor(Math.random() * 30) + 8;
    setEvalMs(ms);
    setCorrId('corr-' + Math.random().toString(36).slice(2, 10));
    setEvalTimestamp(new Date().toLocaleString('en-IN'));
    setTimeout(() => {
      setEvaluating(false);
      setEvaluated(true);
      setResult(computeResult());
    }, 900);
  };

  const forceResult = (r: 'allow' | 'deny' | 'approval') => {
    setEvaluated(true);
    setResult(r);
    if (!corrId) {
      setCorrId('corr-' + Math.random().toString(36).slice(2, 10));
      setEvalTimestamp(new Date().toLocaleString('en-IN'));
    }
  };

  const resetSim = () => {
    setEvaluated(false);
    setResult(null);
    setCorrId('');
    setEvalTimestamp('');
    setMatchedCond([]);
    setMatchedPolicy('');
    setShowCondDetail(false);
  };

  const copyCorr = () => {
    navigator.clipboard.writeText(corrId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  const resultConfig = {
    allow:    { border: 'border-green-300', icon: '✅', title: 'ACCESS ALLOWED',     titleColor: 'text-green-700',  bg: 'bg-green-50',  msgColor: 'text-green-800',  msg: `"${params.role} has ${params.action} permission — conditions satisfied."` },
    deny:     { border: 'border-red-300',   icon: '🚫', title: 'ACCESS DENIED',       titleColor: 'text-red-700',    bg: 'bg-red-50',    msgColor: 'text-red-800',    msg: `"${params.action} is not permitted for ${params.role} on this resource."` },
    approval: { border: 'border-amber-300', icon: '⏳', title: 'REQUIRES APPROVAL',   titleColor: 'text-amber-700',  bg: 'bg-amber-50',  msgColor: 'text-amber-800',  msg: `"Access requires explicit approval from an authorized manager before proceeding."` },
  };

  const rc = result ? resultConfig[result] : null;
  const condPassed = matchedCond.filter(c => c.passed).length;
  const condTotal  = matchedCond.length;

  // Derive action options from live policies
  const actionOptions = Array.from(new Set(policies.map(p => p.action).filter(a => a !== '*')));
  const roleOptions   = ['Transport Manager', 'Finance Manager', 'Security Manager', 'HR Manager', 'Admin', 'Employee'];
  const orgOptions    = ['Shivneri Demo Organization', 'Infosys BPM Ltd', 'Wipro Limited', 'TCS'];

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      <div className="mb-5 p-4 bg-gradient-to-r from-blue-900 to-cyan-900 rounded-xl text-white flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-cyan-300 uppercase tracking-widest mb-1">Policy Decision Simulator</div>
          <div className="text-sm text-slate-200">Test access control decisions before deploying policy changes to production.</div>
        </div>
        {evaluated && (
          <button onClick={resetSim} className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors">
            ↺ New Simulation
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Simulation Parameters</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">User</label>
                <input value={params.user} onChange={e => setParams(p => ({ ...p, user: e.target.value }))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 mono" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">Role</label>
                <select value={params.role} onChange={e => setParams(p => ({ ...p, role: e.target.value }))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 mono">
                  {roleOptions.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">Organization</label>
                <select value={params.org} onChange={e => setParams(p => ({ ...p, org: e.target.value }))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 mono">
                  {orgOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">Action</label>
                <select value={params.action} onChange={e => setParams(p => ({ ...p, action: e.target.value }))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 mono">
                  {actionOptions.map(a => <option key={a}>{a}</option>)}
                  <option value={params.action}>{params.action}</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-500 w-28 flex-shrink-0">Resource</label>
                <input value={params.resource} onChange={e => setParams(p => ({ ...p, resource: e.target.value }))}
                  className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200 mono" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Context</h3>
            <div className="space-y-2">
              {([
                { key: 'department', label: 'Department'   },
                { key: 'location',   label: 'Location'     },
                { key: 'shift',      label: 'Shift'        },
                { key: 'time',       label: 'Current Time' },
              ] as { key: keyof typeof ctx; label: string }[]).map(c => (
                <div key={c.key} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-xs text-slate-500">{c.label}</span>
                  <input
                    value={ctx[c.key]}
                    onChange={e => setCtx(prev => ({ ...prev, [c.key]: e.target.value }))}
                    className="text-xs font-medium text-slate-700 mono text-right bg-transparent border-b border-dashed border-slate-200 focus:outline-none focus:border-blue-400 w-32"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleEvaluate}
              disabled={evaluating || !params.action.trim()}
              className="w-full mt-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {evaluating ? '⏳ Evaluating...' : 'Evaluate Policy →'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {!evaluated && !evaluating && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center h-64">
              <div className="text-4xl mb-3">🔬</div>
              <div className="text-sm text-slate-500">Configure parameters and click Evaluate Policy to simulate an access decision</div>
            </div>
          )}
          {evaluating && (
            <div className="bg-white rounded-xl border border-blue-200 p-8 flex flex-col items-center justify-center text-center h-64 slide-in">
              <div className="text-4xl mb-3 animate-spin">⚙️</div>
              <div className="text-sm text-blue-600 font-medium">Evaluating policies...</div>
              <div className="text-xs text-slate-400 mt-1">Matching rules against context</div>
            </div>
          )}

          {evaluated && rc && result && (
            <div className={`bg-white rounded-xl border ${rc.border} p-5 slide-in`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{rc.icon}</div>
                <div>
                  <div className={`text-lg font-bold ${rc.titleColor}`}>{rc.title}</div>
                  <div className="text-xs text-slate-400">Policy evaluation completed in {evalMs}ms</div>
                </div>
              </div>
              <div className={`${rc.bg} rounded-lg p-3 mb-4 text-xs ${rc.msgColor}`}>{rc.msg}</div>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Policy Matched</span>
                  <span className="text-xs font-medium text-slate-700 mono">{matchedPolicy}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Action</span>
                  <span className="text-xs font-medium text-slate-700 mono">{params.action}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Resource</span>
                  <span className="text-xs font-medium text-slate-700 mono">{params.resource}</span>
                </div>
                <div className="py-1.5 border-b border-slate-100">
                  <button
                    className="w-full flex items-center justify-between hover:bg-slate-50 rounded transition-colors"
                    onClick={() => setShowCondDetail(v => !v)}
                  >
                    <span className="text-xs text-slate-500">Conditions Evaluated</span>
                    <span className="text-xs font-medium text-slate-700 mono">
                      {condTotal > 0 ? `${condPassed} / ${condTotal} passed` : '—'} <span className="text-slate-400">{showCondDetail ? '▲' : '▼'}</span>
                    </span>
                  </button>
                  {showCondDetail && condTotal > 0 && (
                    <div className="mt-2 space-y-1 pl-1">
                      {matchedCond.map((c, i) => (
                        <div key={i} className={`flex items-start gap-2 text-[11px] ${c.passed ? 'text-green-700' : 'text-red-600'}`}>
                          <span>{c.passed ? '✓' : '✗'}</span>
                          <span className="mono">{c.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-xs text-slate-500">Correlation ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-700 mono">{corrId}</span>
                    <button onClick={copyCorr} className="text-[10px] text-slate-400 hover:text-blue-500 transition-colors" title="Copy">
                      {copied ? '✓' : '⧉'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-xs text-slate-500">Timestamp</span>
                  <span className="text-xs font-medium text-slate-700 mono">{evalTimestamp}</span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Try Other Outcomes</h3>
            <div className="grid grid-cols-3 gap-2">
              {([
                { label: 'ALLOW',            key: 'allow',    color: 'bg-green-100 text-green-700 border-green-200', icon: '✅' },
                { label: 'DENY',             key: 'deny',     color: 'bg-red-100 text-red-700 border-red-200',       icon: '🚫' },
                { label: 'REQUIRE APPROVAL', key: 'approval', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
              ] as { label: string; key: 'allow' | 'deny' | 'approval'; color: string; icon: string }[]).map(o => (
                <button
                  key={o.label}
                  className={`border rounded-lg p-2 text-center text-[10px] font-semibold transition-all hover:opacity-80 ${o.color} ${result === o.key && evaluated ? 'ring-2 ring-offset-1 ring-current' : ''}`}
                  onClick={() => forceResult(o.key)}
                >
                  <div className="text-lg mb-1">{o.icon}</div>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Safety & Incidents
type IncidentRow = {
  id: string; severity: string; employee: string; driver: string; vehicle: string;
  location: string; type: string; status: string; officer: string; created: string;
  notes: string;
};

function SafetyView() {
  type IncRow = {
    id: string; severity: string; employee: string; driver: string; vehicle: string;
    location: string; type: string; status: string; created: string; notes: string;
  };

  const [incidents, setIncidents] = useState<IncRow[]>([
    { id: 'INC-2024-0891', severity: 'Critical', employee: 'EMP-10482', driver: 'Raj Kumar',   vehicle: 'MH12AB1234', location: 'Raj Nagar, Pune',   type: 'SOS',       status: 'Open',          created: '22:18', notes: 'Employee pressed SOS. Driver contacted, police notified.' },
    { id: 'INC-2024-0890', severity: 'High',     employee: 'EMP-10451', driver: 'Suresh Y.',   vehicle: 'MH12CD5678', location: 'Wakad Bridge',      type: 'Accident',  status: 'Investigating', created: '20:42', notes: 'Minor collision reported. No injuries. Insurance notified.' },
    { id: 'INC-2024-0889', severity: 'Medium',   employee: 'EMP-10423', driver: 'Mohan S.',    vehicle: 'MH12EF9012', location: 'Baner Road',        type: 'Breakdown', status: 'Resolved',      created: '18:05', notes: 'Vehicle breakdown. Replacement vehicle dispatched.' },
    { id: 'INC-2024-0888', severity: 'Low',      employee: 'EMP-10398', driver: 'Arjun N.',    vehicle: 'MH12GH3456', location: 'Hinjewadi Ph1',     type: 'Complaint', status: 'Closed',        created: '15:30', notes: 'Complaint about late pickup. Addressed with driver.' },
  ]);

  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [viewInc, setViewInc] = useState<IncRow | null>(null);
  const [bgDuration, setBgDuration] = useState('30 minutes');
  const [bgGranted, setBgGranted] = useState(false);
  const [sosActive, setSosActive] = useState(true);
  const [toast, setToast] = useState('');
  type SosPanel = 'none' | 'location' | 'contact-emp' | 'contact-driver' | 'open-incident';
  const [sosPanel, setSosPanel] = useState<SosPanel>('none');
  const [incidentForm, setIncidentForm] = useState({ type: 'SOS', severity: 'Critical', notes: '' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const updateStatus = (id: string, status: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status } : inc));
    if (status === 'Resolved' || status === 'Closed') {
      const inc = incidents.find(i => i.id === id);
      if (inc?.type === 'SOS' && inc.status === 'Open') setSosActive(false);
      showToast('Incident resolved successfully');
    }
    if (viewInc?.id === id) setViewInc(prev => prev ? { ...prev, status } : null);
  };

  const sevColor = (s: string): 'red' | 'amber' | 'blue' | 'slate' | 'green' | 'cyan' =>
    s === 'Critical' ? 'red' : s === 'High' ? 'amber' : s === 'Medium' ? 'blue' : 'slate';
  const statusColor = (s: string): 'red' | 'amber' | 'blue' | 'slate' | 'green' | 'cyan' =>
    s === 'Open' ? 'red' : s === 'Investigating' ? 'amber' : s === 'Resolved' ? 'green' : 'slate';

  const filtered = incidents.filter(inc => {
    if (typeFilter !== 'All' && inc.type !== typeFilter) return false;
    if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!inc.id.toLowerCase().includes(q) && !inc.employee.toLowerCase().includes(q) &&
          !inc.driver.toLowerCase().includes(q) && !inc.location.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const openCount = incidents.filter(i => i.status === 'Open').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

  const handleOpenIncident = () => {
    if (!incidentForm.notes.trim()) return;
    setIncidents(prev => [{
      id: `INC-2024-0${892 + prev.length}`,
      severity: incidentForm.severity, employee: 'EMP-10482', driver: 'Raj Kumar',
      vehicle: 'MH12AB1234', location: 'Raj Nagar, Pune', type: incidentForm.type,
      status: 'Open', created: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      notes: incidentForm.notes,
    }, ...prev]);
    setIncidentForm({ type: 'SOS', severity: 'Critical', notes: '' });
    setSosPanel('none');
    showToast('Incident created successfully');
  };

  return (
    <div className="p-4 md:p-6 slide-in overflow-y-auto h-full">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl slide-in flex items-center gap-2">
          <span className="text-green-400">✓</span> {toast}
        </div>
      )}

      {/* Incident Detail Modal */}
      {viewInc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={() => setViewInc(null)}>
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden slide-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{viewInc.id}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{viewInc.type} — {viewInc.location}</p>
              </div>
              <button onClick={() => setViewInc(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg">✕</button>
            </div>
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { k: 'Employee', v: viewInc.employee },
                  { k: 'Driver', v: viewInc.driver },
                  { k: 'Vehicle', v: viewInc.vehicle },
                  { k: 'Location', v: viewInc.location },
                  { k: 'Severity', v: <Badge label={viewInc.severity} color={sevColor(viewInc.severity)} /> },
                  { k: 'Status', v: <Badge label={viewInc.status} color={statusColor(viewInc.status)} /> },
                  { k: 'Time', v: viewInc.created },
                  { k: 'Type', v: viewInc.type },
                ].map(row => (
                  <div key={row.k}>
                    <div className="text-[10px] text-slate-400 mb-0.5">{row.k}</div>
                    <div className="text-slate-700 font-medium">{row.v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Description</div>
                <div className="text-xs text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">{viewInc.notes}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-1.5">Update Status</div>
                <div className="flex gap-2 flex-wrap">
                  {(['Open', 'Investigating', 'Resolved', 'Closed'] as string[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateStatus(viewInc.id, s)}
                      className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${viewInc.status === s ? 'bg-blue-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-100 flex gap-2 flex-wrap">
              <button className="px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100">📍 View Location</button>
              <button className="px-3 py-1.5 text-xs bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100">📞 Contact Employee</button>
              <button className="px-3 py-1.5 text-xs bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100">📞 Contact Driver</button>
              <button onClick={() => setViewInc(null)} className="ml-auto px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <KpiCard title="SOS Active" value={sosActive ? '1' : '0'} icon="🚨" accent={RED} />
        <KpiCard title="Open Incidents" value={String(openCount)} icon="🔴" accent={AMBER} />
        <KpiCard title="Resolved Today" value={String(resolvedCount)} icon="✅" accent={GREEN} />
      </div>

      {/* Active SOS Banner */}
      {sosActive && (
        <div className="bg-red-50 border border-red-200 rounded-xl mb-4">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl flex-shrink-0 pulse-dot">🚨</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-red-700 text-sm">ACTIVE SOS — Employee #10482</div>
                <div className="text-xs text-red-500 mt-0.5">Ride RIDE-98231 · Raj Nagar, Pune · Driver: Raj Kumar · Vehicle: MH12AB1234 · 22:18</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {([
                { label: 'View Location', panel: 'location' as SosPanel },
                { label: 'Contact Employee', panel: 'contact-emp' as SosPanel },
                { label: 'Contact Driver', panel: 'contact-driver' as SosPanel },
                { label: 'Open Incident', panel: 'open-incident' as SosPanel },
              ] as const).map(({ label, panel }) => (
                <button
                  key={label}
                  onClick={() => setSosPanel(prev => prev === panel ? 'none' : panel)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    sosPanel === panel
                      ? 'bg-red-100 border border-red-400 text-red-800'
                      : 'bg-white border border-red-200 text-red-700 hover:bg-red-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {sosPanel !== 'none' && (
            <div className="border-t border-red-200 p-4">
              {sosPanel === 'location' && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">📍 Live Location — EMP-10482</div>
                  <div className="rounded-xl overflow-hidden" style={{ background: '#1a2533', height: 140 }}>
                    <svg className="w-full h-full opacity-10">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <Fragment key={i}>
                          <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#4a90d9" strokeWidth="0.5" />
                          <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#4a90d9" strokeWidth="0.5" />
                        </Fragment>
                      ))}
                    </svg>
                    <div className="relative" style={{ marginTop: -140, height: 140 }}>
                      <div className="absolute" style={{ left: '48%', top: '45%', transform: 'translate(-50%,-50%)' }}>
                        <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white pulse-dot shadow-lg" />
                        <div className="mt-1 bg-white text-slate-800 text-[9px] font-semibold px-2 py-0.5 rounded shadow-lg whitespace-nowrap -translate-x-1/4">RIDE-98231 · EMP-10482</div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 text-cyan-400 text-[10px] mono px-2 py-1 rounded-lg">📡 LIVE · Raj Nagar, Pune · 22:18</div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold">Share Location</button>
                    <button className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Open in Live Ops</button>
                  </div>
                </div>
              )}
              {(sosPanel === 'contact-emp' || sosPanel === 'contact-driver') && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-3">
                    {sosPanel === 'contact-emp' ? '📞 Contact Employee #10482' : '📞 Contact Driver — Raj Kumar'}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">📞 Call Now</button>
                    <button className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">💬 Send SMS</button>
                    <button className="flex-1 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50">📧 Email</button>
                  </div>
                  <div className="mt-2 text-[10px] text-amber-600">⚠ Call will be recorded and logged for incident reference.</div>
                </div>
              )}
              {sosPanel === 'open-incident' && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-3">📋 Open Incident Report</div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Type</label>
                      <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={incidentForm.type} onChange={e => setIncidentForm(f => ({ ...f, type: e.target.value }))}>
                        {['SOS', 'Accident', 'Breakdown', 'Complaint'].map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Severity</label>
                      <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white" value={incidentForm.severity} onChange={e => setIncidentForm(f => ({ ...f, severity: e.target.value }))}>
                        {['Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <textarea rows={3} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none mb-3" placeholder="Describe the incident…" value={incidentForm.notes} onChange={e => setIncidentForm(f => ({ ...f, notes: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => setSosPanel('none')} className="flex-1 py-1.5 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-50">Cancel</button>
                    <button onClick={handleOpenIncident} className="flex-1 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">Create Incident</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="flex gap-1 flex-wrap">
          {(['All', 'SOS', 'Accident', 'Breakdown', 'Complaint'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${typeFilter === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t}</button>
          ))}
        </div>
        <select className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-600" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option>Open</option>
          <option>Investigating</option>
          <option>Resolved</option>
          <option>Closed</option>
        </select>
        <div className="relative ml-auto">
          <input className="pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white w-44 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Search incidents…" value={search} onChange={e => setSearch(e.target.value)} />
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">🔍</span>
        </div>
      </div>

      {/* Incident Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto mb-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-sm text-slate-500 mb-3">No incidents found</div>
            <button onClick={() => { setTypeFilter('All'); setStatusFilter('All'); setSearch(''); }} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700">Clear Filters</button>
          </div>
        ) : (
          <table className="w-full text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Incident ID', 'Severity', 'Employee', 'Driver', 'Vehicle', 'Location', 'Type', 'Status', 'Time', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-3 mono text-blue-600 font-semibold whitespace-nowrap">{inc.id}</td>
                  <td className="px-3 py-3"><Badge label={inc.severity} color={sevColor(inc.severity)} /></td>
                  <td className="px-3 py-3 mono text-slate-500">{inc.employee}</td>
                  <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{inc.driver}</td>
                  <td className="px-3 py-3 mono text-slate-500 text-[10px]">{inc.vehicle}</td>
                  <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{inc.location}</td>
                  <td className="px-3 py-3"><Badge label={inc.type} color={inc.type === 'SOS' ? 'red' : inc.type === 'Accident' ? 'amber' : 'slate'} /></td>
                  <td className="px-3 py-3"><Badge label={inc.status} color={statusColor(inc.status)} /></td>
                  <td className="px-3 py-3 mono text-slate-400">{inc.created}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setViewInc(inc)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-[10px] whitespace-nowrap">View</button>
                      {inc.status === 'Open' && (
                        <button onClick={() => { updateStatus(inc.id, 'Investigating'); showToast('Investigation started'); }} className="px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 text-[10px] whitespace-nowrap">Investigate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Break-Glass Emergency Access */}
      <div className="bg-white rounded-xl border border-red-200 p-5 max-w-md">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm">🔓</span>
          <h3 className="text-sm font-semibold text-slate-800">Break-Glass Emergency Access</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">Temporary emergency access to:</p>
        <div className="space-y-1.5 mb-4">
          {['Live Location', 'Emergency Contact'].map(label => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-green-500">✓</span>
              <span className="text-slate-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="text-xs text-slate-500 block mb-1">Duration</label>
          <select className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50" value={bgDuration} onChange={e => setBgDuration(e.target.value)}>
            <option>15 minutes</option>
            <option>30 minutes</option>
            <option>60 minutes</option>
          </select>
        </div>
        {bgGranted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-green-700 font-bold text-sm mb-1">✓ Emergency Access Granted</div>
            <div className="text-xs text-green-600">Active for {bgDuration}. All activity is logged and audited.</div>
          </div>
        ) : (
          <button onClick={() => { setBgGranted(true); setTimeout(() => setBgGranted(false), 5000); showToast('Emergency access granted'); }} className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-colors">
            Grant Emergency Access
          </button>
        )}
        <div className="text-[10px] text-amber-600 mt-2 text-center">⚠ Emergency access is logged and automatically expires.</div>
      </div>
    </div>
  );
}

// Security Audit
function SecurityAuditView() {
  const events = [
    { ts: '18:42:11', actor: 'Akshat Gupta', org: 'Platform', action: 'role.permissions.modify', resource: 'Transport Manager', result: 'SUCCESS', ip: '10.0.2.41', device: 'Chrome/Mac', risk: 'Medium' },
    { ts: '18:39:02', actor: 'Priya Sharma', org: 'TCS Pune', action: 'employee.data.export', resource: 'EMP-10423', result: 'DENIED', ip: '10.0.1.82', device: 'Safari/iOS', risk: 'High' },
    { ts: '18:31:55', actor: 'System', org: 'Platform', action: 'sos.access.grant', resource: 'EMP-10482', result: 'SUCCESS', ip: '—', device: 'System', risk: 'Critical' },
    { ts: '18:28:20', actor: 'Rahul Joshi', org: 'Infosys BPM', action: 'billing.invoice.approve', resource: 'INV-2024-0891', result: 'SUCCESS', ip: '10.0.3.19', device: 'Firefox/Win', risk: 'Low' },
    { ts: '18:19:04', actor: 'Vijay Patil', org: 'Wipro Tech', action: 'login.failed', resource: '—', result: 'DENIED', ip: '203.122.41.8', device: 'Chrome/Win', risk: 'High' },
    { ts: '18:07:31', actor: 'Sneha Kulkarni', org: 'Cognizant', action: 'recording.access', resource: 'REC-20240919-001', result: 'REQUIRES APPROVAL', ip: '10.0.4.55', device: 'Chrome/Mac', risk: 'Medium' },
    { ts: '17:58:12', actor: 'Arjun Nair', org: 'Capgemini', action: 'policy.modify', resource: 'POL-0003', result: 'SUCCESS', ip: '10.0.5.72', device: 'Edge/Win', risk: 'High' },
  ];

  const resultColor = (r: string) => {
    if (r === 'SUCCESS') return 'green';
    if (r === 'DENIED') return 'red';
    return 'amber';
  };

  const riskColor = (r: string) => {
    if (r === 'Critical') return 'red';
    if (r === 'High') return 'amber';
    if (r === 'Medium') return 'blue';
    return 'slate';
  };

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All Events', 'Login', 'Data Access', 'Role Changes', 'Policy Changes', 'SOS Access', 'Exports'].map(f => (
          <button key={f} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-600">{f}</button>
        ))}
        <div className="ml-auto flex gap-2">
          <input className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-32" placeholder="Date range…" />
          <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50">Export CSV</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Timestamp', 'Actor', 'Organization', 'Action', 'Resource', 'Result', 'IP Address', 'Device', 'Risk'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((evt, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-3 py-3 mono text-slate-500">{evt.ts}</td>
                <td className="px-3 py-3 font-medium text-slate-700">{evt.actor}</td>
                <td className="px-3 py-3 text-slate-500">{evt.org}</td>
                <td className="px-3 py-3"><span className="mono text-blue-600">{evt.action}</span></td>
                <td className="px-3 py-3 mono text-slate-500 text-[10px]">{evt.resource}</td>
                <td className="px-3 py-3"><Badge label={evt.result} color={resultColor(evt.result) as any} /></td>
                <td className="px-3 py-3 mono text-slate-400 text-[10px]">{evt.ip}</td>
                <td className="px-3 py-3 text-slate-400 text-[10px]">{evt.device}</td>
                <td className="px-3 py-3"><Badge label={evt.risk} color={riskColor(evt.risk) as any} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
        <span>Showing 7 of 2,841 events</span>
        <div className="flex gap-1">
          {['← Prev', '1', '2', '3', '...', '284', 'Next →'].map(p => (
            <button key={p} className={`px-2.5 py-1.5 rounded-lg border ${p === '1' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Billing
type InvoiceRow = { id: string; org: string; period: string; amount: string; amountNum: number; status: string; generated: string; approved: string; trips: number; vehicles: number; };

function BillingView() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([
    { id: 'INV-2024-0891', org: 'TCS Pune Campus',   period: 'Aug 2024', amount: '₹2,84,000', amountNum: 284000, status: 'Approved', generated: '2024-09-01', approved: '2024-09-03', trips: 1842, vehicles: 12 },
    { id: 'INV-2024-0890', org: 'Infosys BPM Ltd',   period: 'Aug 2024', amount: '₹89,000',   amountNum: 89000,  status: 'Pending',  generated: '2024-09-01', approved: '—',          trips: 612,  vehicles: 4  },
    { id: 'INV-2024-0889', org: 'Wipro Technologies', period: 'Aug 2024', amount: '₹2,14,000', amountNum: 214000, status: 'Approved', generated: '2024-09-01', approved: '2024-09-04', trips: 1410, vehicles: 9  },
    { id: 'INV-2024-0888', org: 'Cognizant',          period: 'Aug 2024', amount: '₹1,87,000', amountNum: 187000, status: 'Draft',    generated: '2024-09-02', approved: '—',          trips: 1220, vehicles: 8  },
    { id: 'INV-2024-0887', org: 'Capgemini India',    period: 'Aug 2024', amount: '₹62,000',   amountNum: 62000,  status: 'Overdue',  generated: '2024-09-01', approved: '—',          trips: 390,  vehicles: 3  },
  ]);
  const [viewInv, setViewInv] = useState<string | null>(null);

  const approveInv = (id: string) =>
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: 'Approved', approved: new Date().toISOString().slice(0, 10) } : inv));

  const statusColor = (s: string): 'green' | 'blue' | 'red' | 'slate' | 'amber' | 'cyan' =>
    s === 'Approved' ? 'green' : s === 'Pending' ? 'blue' : s === 'Overdue' ? 'red' : 'slate';

  const detail = invoices.find(inv => inv.id === viewInv);

  const lineItems = [
    { desc: 'Base Transportation (per trip)', qty: detail?.trips ?? 0, rate: 120, subtotal: (detail?.trips ?? 0) * 120 },
    { desc: 'Fleet Management Fee',           qty: detail?.vehicles ?? 0, rate: 2800, subtotal: (detail?.vehicles ?? 0) * 2800 },
    { desc: 'GPS & Tracking Services',        qty: detail?.vehicles ?? 0, rate: 400, subtotal: (detail?.vehicles ?? 0) * 400 },
    { desc: 'SOS Response Facility',          qty: 1, rate: 5000, subtotal: 5000 },
  ];

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard title="Monthly Revenue" value="₹8.4L" delta="+12%" deltaLabel="vs last month" icon="💰" />
        <KpiCard title="Cost / Employee" value="₹2,840" delta="-3%" deltaLabel="vs last month" icon="👤" accent={CYAN} />
        <KpiCard title="Pending Invoices" value={String(invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length)} icon="📄" accent={AMBER} />
        <KpiCard title="Paid Invoices" value={String(invoices.filter(i => i.status === 'Approved').length)} delta="+5" deltaLabel="this month" icon="✅" accent={GREEN} />
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Monthly Billing Trend</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={costData} margin={{ top: 0, right: 0, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="billGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${((v as number) / 1000).toFixed(0)}k`, "Cost"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="cost" stroke={BLUE} fill="url(#billGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Top Organizations by Cost</h3>
          <div className="space-y-3">
            {[
              { org: 'TCS Pune Campus',   cost: '₹2,84,000', pct: 33 },
              { org: 'Wipro Technologies', cost: '₹2,14,000', pct: 25 },
              { org: 'Cognizant',          cost: '₹1,87,000', pct: 22 },
              { org: 'Infosys BPM',        cost: '₹89,000',   pct: 11 },
              { org: 'Capgemini',          cost: '₹62,000',   pct: 7  },
            ].map(o => (
              <div key={o.org}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700">{o.org}</span>
                  <span className="font-medium text-slate-800">{o.cost}</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice detail panel */}
      {detail && (
        <div className="bg-white rounded-xl border border-blue-200 p-5 mb-5 slide-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-base font-bold text-slate-900 mono">{detail.id}</span>
                <Badge label={detail.status} color={statusColor(detail.status)} />
              </div>
              <div className="text-xs text-slate-500">{detail.org} · {detail.period}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50">Download PDF</button>
              {detail.status === 'Pending' && (
                <button onClick={() => approveInv(detail.id)} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">Approve Invoice</button>
              )}
              <button onClick={() => setViewInv(null)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
            </div>
          </div>

          {/* Billing details grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Generated',   value: detail.generated },
              { label: 'Approved',    value: detail.approved },
              { label: 'Total Trips', value: String(detail.trips) },
              { label: 'Vehicles',    value: String(detail.vehicles) },
            ].map(f => (
              <div key={f.label} className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</div>
                <div className="text-sm font-semibold text-slate-800 mono">{f.value}</div>
              </div>
            ))}
          </div>

          {/* Line items */}
          <table className="w-full text-xs mb-4">
            <thead>
              <tr className="border-b border-slate-100">
                {['Description', 'Qty', 'Rate', 'Subtotal'].map(h => (
                  <th key={h} className="px-2 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td className="px-2 py-2 text-slate-700">{li.desc}</td>
                  <td className="px-2 py-2 mono text-slate-500">{li.qty}</td>
                  <td className="px-2 py-2 mono text-slate-500">₹{li.rate.toLocaleString('en-IN')}</td>
                  <td className="px-2 py-2 mono font-medium text-slate-800">₹{li.subtotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td colSpan={3} className="px-2 py-2 font-bold text-slate-700 text-right">Total</td>
                <td className="px-2 py-2 mono font-bold text-slate-900 text-base">{detail.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Invoice ID', 'Organization', 'Period', 'Amount', 'Status', 'Generated', 'Approved', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${viewInv === inv.id ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-3 mono text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setViewInv(viewInv === inv.id ? null : inv.id)}>{inv.id}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{inv.org}</td>
                <td className="px-4 py-3 text-slate-500">{inv.period}</td>
                <td className="px-4 py-3 font-semibold text-slate-800">{inv.amount}</td>
                <td className="px-4 py-3"><Badge label={inv.status} color={statusColor(inv.status)} /></td>
                <td className="px-4 py-3 mono text-slate-400">{inv.generated}</td>
                <td className="px-4 py-3 mono text-slate-400">{inv.approved}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setViewInv(viewInv === inv.id ? null : inv.id)}
                      className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${viewInv === inv.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                    >
                      {viewInv === inv.id ? 'Close' : 'View'}
                    </button>
                    {inv.status === 'Pending' && (
                      <button onClick={() => approveInv(inv.id)} className="px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-[10px] font-medium">Approve</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Analytics
// ─── Analytics data generators ────────────────────────────────────────────────
function makeAnalyticsData(period: string, orgMult: number) {
  const labels7  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const labels30 = ['Wk 1','Wk 2','Wk 3','Wk 4'];
  const labels90 = ['Jan','Feb','Mar'];
  const xLabels  = period === 'Last 7 days' ? labels7 : period === 'Last 90 days' ? labels90 : labels30;
  const m = orgMult;

  const ops = xLabels.map((l, i) => ({
    x: l,
    trips:     Math.round((280 + Math.sin(i * 0.9) * 60 + i * 15) * m),
    completed: Math.round((91 + Math.sin(i * 1.2) * 4) * 10) / 10,
    incidents: Math.round((8 + Math.sin(i * 1.3) * 3) * m),
    sos:       Math.round((3 + Math.sin(i * 1.7) * 2) * m),
    cost:      Math.round((260000 + Math.sin(i * 0.7) * 40000 + i * 8000) * m),
  }));

  const fleet = xLabels.map((l, i) => ({
    x: l,
    utilization: Math.round(68 + Math.sin(i * 1.1) * 12),
    fuel:        Math.round((14.2 + Math.sin(i * 0.8) * 1.4) * 10) / 10,
    maintenance: Math.round((2 + Math.sin(i * 1.5) * 1) * m),
    available:   Math.round((18 + Math.sin(i * 0.6) * 3) * m),
    onTrip:      Math.round((12 + Math.sin(i * 1.0) * 4) * m),
    inService:   Math.round((2 + Math.abs(Math.sin(i * 1.8))) * m),
  }));

  const safety = xLabels.map((l, i) => ({
    x: l,
    sos:        Math.round((3 + Math.sin(i * 1.7) * 2) * m),
    incidents:  Math.round((8 + Math.sin(i * 1.3) * 3) * m),
    nearMiss:   Math.round((5 + Math.sin(i * 0.9) * 2) * m),
    resolution: Math.round((4.2 + Math.sin(i * 1.1) * 1.5) * 10) / 10,
  }));

  const finance = xLabels.map((l, i) => ({
    x: l,
    revenue: Math.round((840000 + Math.sin(i * 0.8) * 60000 + i * 15000) * m),
    cost:    Math.round((620000 + Math.sin(i * 1.1) * 40000 + i * 10000) * m),
    perEmp:  Math.round((2840 + Math.sin(i * 0.6) * 200) * m),
  }));

  const drivers = xLabels.map((l, i) => ({
    x: l,
    active:    Math.round((22 + Math.sin(i * 1.0) * 4) * m),
    onTrip:    Math.round((14 + Math.sin(i * 1.3) * 5) * m),
    offline:   Math.round((6 + Math.abs(Math.sin(i * 1.7)) * 3) * m),
    rating:    Math.round((4.5 + Math.sin(i * 0.7) * 0.3) * 100) / 100,
    incidents: Math.round((1 + Math.abs(Math.sin(i * 1.9))) * m),
  }));

  const employees = xLabels.map((l, i) => ({
    x: l,
    riders:       Math.round((890 + Math.sin(i * 0.9) * 80 + i * 12) * m),
    satisfaction: Math.round((87 + Math.sin(i * 1.2) * 5)),
    morning:      Math.round((420 + Math.sin(i * 1.0) * 40) * m),
    evening:      Math.round((310 + Math.sin(i * 1.3) * 30) * m),
    night:        Math.round((160 + Math.sin(i * 0.8) * 20) * m),
  }));

  return { ops, fleet, safety, finance, drivers, employees };
}

const ORG_MULTS: Record<string, number> = {
  'All Organizations': 1,
  'TCS Pune Campus':   0.34,
  'Wipro Technologies':0.25,
  'Cognizant':         0.22,
  'Infosys BPM Ltd':   0.11,
  'Capgemini India':   0.08,
};

function AnalyticsView() {
  const [tab,    setTab]    = useState('Operations');
  const [period, setPeriod] = useState('Last 30 days');
  const [org,    setOrg]    = useState('All Organizations');
  const [exporting, setExporting] = useState(false);

  const tabs = ['Operations','Fleet','Safety','Finance','Drivers','Employees'];
  const data  = makeAnalyticsData(period, ORG_MULTS[org] ?? 1);
  const xKey  = 'x';

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 1800);
  };

  // ── KPI rows per tab
  const kpis: Record<string, { title: string; value: string; delta?: string; deltaLabel?: string; icon: string; accent?: string }[]> = {
    Operations: [
      { title: 'Total Trips',       value: String(data.ops.reduce((a, r) => a + r.trips, 0).toLocaleString('en-IN')), delta: '+12%', deltaLabel: 'vs prev period', icon: '🚌' },
      { title: 'Avg Completion',    value: `${(data.ops.reduce((a, r) => a + r.completed, 0) / data.ops.length).toFixed(1)}%`, delta: '+2%', deltaLabel: 'vs prev', icon: '✅', accent: GREEN },
      { title: 'Active Routes',     value: '28',                                                                  delta: '+3',   deltaLabel: 'this period',   icon: '🗺️', accent: CYAN },
      { title: 'Avg Trip Duration', value: '34 min',                                                              icon: '⏱️',                                              accent: AMBER },
    ],
    Fleet: [
      { title: 'Active Vehicles',  value: String(Math.round(32 * (ORG_MULTS[org] ?? 1))), delta: '+2', deltaLabel: 'vs prev',       icon: '🚗' },
      { title: 'Avg Utilization',  value: `${Math.round(data.fleet.reduce((a, r) => a + r.utilization, 0) / data.fleet.length)}%`, delta: '+5%', deltaLabel: 'efficiency', icon: '📊', accent: BLUE },
      { title: 'Avg Fuel Economy', value: `${(data.fleet.reduce((a, r) => a + r.fuel, 0) / data.fleet.length).toFixed(1)} km/L`,  icon: '⛽', accent: GREEN },
      { title: 'Maintenance Due',  value: String(Math.round(3 * (ORG_MULTS[org] ?? 1))), icon: '🔧', accent: AMBER },
    ],
    Safety: [
      { title: 'Open Incidents',   value: String(data.safety.reduce((a, r) => a + r.incidents, 0)), delta: '-8%', deltaLabel: 'vs prev', icon: '⚠️', accent: AMBER },
      { title: 'Active SOS',       value: '2', icon: '🚨', accent: RED },
      { title: 'Near-Miss Events', value: String(data.safety.reduce((a, r) => a + r.nearMiss, 0)), icon: '🔔', accent: CYAN },
      { title: 'Safety Score',     value: '94/100', delta: '+2', deltaLabel: 'vs prev', icon: '🛡️', accent: GREEN },
    ],
    Finance: [
      { title: 'Total Revenue',   value: `₹${(data.finance.reduce((a, r) => a + r.revenue, 0) / 100000).toFixed(1)}L`, delta: '+12%', deltaLabel: 'vs prev', icon: '💰' },
      { title: 'Total Cost',      value: `₹${(data.finance.reduce((a, r) => a + r.cost, 0) / 100000).toFixed(1)}L`, icon: '📉', accent: RED },
      { title: 'Cost / Employee', value: `₹${Math.round(data.finance.reduce((a, r) => a + r.perEmp, 0) / data.finance.length).toLocaleString('en-IN')}`, icon: '👤', accent: CYAN },
      { title: 'Pending Invoices',value: '4', icon: '📄', accent: AMBER },
    ],
    Drivers: [
      { title: 'Total Drivers',    value: String(Math.round(42 * (ORG_MULTS[org] ?? 1))), icon: '👨‍✈️' },
      { title: 'Currently On Duty',value: String(Math.round(data.drivers.reduce((a, r) => a + r.active, 0) / data.drivers.length)), delta: '+4%', deltaLabel: 'utilization', icon: '🟢', accent: GREEN },
      { title: 'Avg Rating',       value: `${(data.drivers.reduce((a, r) => a + r.rating, 0) / data.drivers.length).toFixed(2)} ⭐`, icon: '⭐', accent: AMBER },
      { title: 'Pending Verify',   value: '2', icon: '🔍', accent: CYAN },
    ],
    Employees: [
      { title: 'Total Employees',  value: String(Math.round(1240 * (ORG_MULTS[org] ?? 1)).toLocaleString('en-IN')), icon: '👥' },
      { title: 'Active Riders',    value: String(data.employees.reduce((a, r) => a + r.riders, 0).toLocaleString('en-IN')), delta: '+8%', deltaLabel: 'vs prev', icon: '🚌', accent: BLUE },
      { title: 'Avg Satisfaction', value: `${Math.round(data.employees.reduce((a, r) => a + r.satisfaction, 0) / data.employees.length)}%`, icon: '😊', accent: GREEN },
      { title: 'Coverage %',       value: '91%', delta: '+3%', deltaLabel: 'areas covered', icon: '📍', accent: CYAN },
    ],
  };

  const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
      {children}
    </div>
  );

  const renderCharts = () => {
    if (tab === 'Operations') return (
      <>
        <ChartCard title={`Trip Volume — Operations`}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.ops} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="aGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="trips" stroke={BLUE} fill="url(#aGrad1)" strokeWidth={2} name="Trips" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Completion Rate">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.ops} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[88, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}%`, 'Rate']} />
              <Bar dataKey="completed" name="Completion %" fill={GREEN} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="SOS Events & Incidents">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.ops} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="incidents" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} name="Incidents" />
              <Line type="monotone" dataKey="sos" stroke={RED} strokeWidth={2} dot={{ r: 3 }} name="SOS" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Transport Cost Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.ops} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="cGrad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`₹${((v as number) / 1000).toFixed(0)}k`, 'Cost']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="cost" stroke={CYAN} fill="url(#cGrad1)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );

    if (tab === 'Fleet') return (
      <>
        <ChartCard title="Vehicle Utilization %">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.fleet} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[50, 90]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}%`, 'Utilization']} />
              <Bar dataKey="utilization" fill={BLUE} radius={[4, 4, 0, 0]} name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fuel Efficiency (km/L)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.fleet} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[12, 17]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v} km/L`, 'Fuel Eff.']} />
              <Line type="monotone" dataKey="fuel" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} name="Fuel Efficiency" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fleet Status — Available / On Trip / Service">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.fleet} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="available" fill={GREEN}   radius={[4,4,0,0]} name="Available" stackId="fleet" />
              <Bar dataKey="onTrip"    fill={BLUE}    radius={[0,0,0,0]} name="On Trip"   stackId="fleet" />
              <Bar dataKey="inService" fill={AMBER}   radius={[4,4,0,0]} name="In Service" stackId="fleet" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Maintenance Events">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.fleet} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="maintenance" fill={AMBER} radius={[4, 4, 0, 0]} name="Maintenance" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );

    if (tab === 'Safety') return (
      <>
        <ChartCard title="SOS Events by Period">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.safety} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="sos" fill={RED} radius={[4, 4, 0, 0]} name="SOS Events" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Incidents vs Near-Miss Events">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.safety} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line type="monotone" dataKey="incidents" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} name="Incidents" />
              <Line type="monotone" dataKey="nearMiss"  stroke={CYAN}  strokeWidth={2} dot={{ r: 3 }} name="Near-Miss" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Incident Resolution Time (hrs)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.safety} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="safetyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={AMBER} stopOpacity={0.2} />
                <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[2, 7]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v} hrs`, 'Resolution']} />
              <Area type="monotone" dataKey="resolution" stroke={AMBER} fill="url(#safetyGrad)" strokeWidth={2} name="Resolution Time" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Safety Score Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.safety.map((r, i) => ({ ...r, score: Math.round(88 + Math.sin(i * 0.8) * 5) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[80, 100]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}/100`, 'Safety Score']} />
              <Area type="monotone" dataKey="score" stroke={GREEN} fill="url(#scoreGrad)" strokeWidth={2} name="Safety Score" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );

    if (tab === 'Finance') return (
      <>
        <ChartCard title="Revenue vs Cost">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.finance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`₹${((v as number) / 100000).toFixed(2)}L`]} />
              <Bar dataKey="revenue" fill={BLUE}  radius={[4,4,0,0]} name="Revenue" />
              <Bar dataKey="cost"    fill={RED}   radius={[4,4,0,0]} name="Cost" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost per Employee (₹)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.finance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`₹${((v as number)).toLocaleString('en-IN')}`, 'Per Employee']} />
              <Line type="monotone" dataKey="perEmp" stroke={CYAN} strokeWidth={2} dot={{ r: 3 }} name="Cost/Employee" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.finance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GREEN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={GREEN} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`₹${((v as number) / 100000).toFixed(2)}L`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke={GREEN} fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Cost Trend">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.finance} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="costFinGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={RED} stopOpacity={0.15} />
                <stop offset="95%" stopColor={RED} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`₹${((v as number) / 100000).toFixed(2)}L`, 'Cost']} />
              <Area type="monotone" dataKey="cost" stroke={RED} fill="url(#costFinGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );

    if (tab === 'Drivers') return (
      <>
        <ChartCard title="Driver Activity — Active / On Trip / Offline">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.drivers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="active"  fill={GREEN} radius={[4,4,0,0]} name="Active"  stackId="d" />
              <Bar dataKey="onTrip"  fill={BLUE}  radius={[0,0,0,0]} name="On Trip" stackId="d" />
              <Bar dataKey="offline" fill="#94a3b8" radius={[4,4,0,0]} name="Offline" stackId="d" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Average Driver Rating">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.drivers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[4.0, 5.0]} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v} ⭐`, 'Avg Rating']} />
              <Line type="monotone" dataKey="rating" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} name="Rating" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Driver Incidents">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.drivers} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="incidents" fill={RED} radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Trips per Driver (Cumulative)">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.drivers.map((r, i) => ({ ...r, cumulativeTrips: Math.round((r.active + r.onTrip) * (i + 1) * 3) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="driverTripGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="cumulativeTrips" stroke={BLUE} fill="url(#driverTripGrad)" strokeWidth={2} name="Trips" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );

    // Employees
    return (
      <>
        <ChartCard title="Employee Ridership">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.employees} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="empGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="riders" stroke={BLUE} fill="url(#empGrad)" strokeWidth={2} name="Riders" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Employee Satisfaction %">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.employees} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[78, 98]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`${v}%`, 'Satisfaction']} />
              <Line type="monotone" dataKey="satisfaction" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} name="Satisfaction" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Shift Distribution — Morning / Evening / Night">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.employees} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="morning" fill={AMBER}  radius={[4,4,0,0]} name="Morning" stackId="shift" />
              <Bar dataKey="evening" fill={BLUE}   radius={[0,0,0,0]} name="Evening" stackId="shift" />
              <Bar dataKey="night"   fill="#6366f1" radius={[4,4,0,0]} name="Night"   stackId="shift" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ridership Growth">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.employees.map((r, i) => ({ ...r, growth: Math.round(2 + i * 1.5 + Math.sin(i) * 1.2) }))} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs><linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `+${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={v => [`+${v}%`, 'Growth']} />
              <Area type="monotone" dataKey="growth" stroke={CYAN} fill="url(#growthGrad)" strokeWidth={2} name="Growth" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </>
    );
  };

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {/* Tab bar + controls */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg cursor-pointer"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
          <select
            value={org}
            onChange={e => setOrg(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg cursor-pointer"
          >
            {Object.keys(ORG_MULTS).map(o => <option key={o}>{o}</option>)}
          </select>
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${exporting ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {exporting ? '✓ Exported!' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {(kpis[tab] ?? []).map(k => (
          <KpiCard key={k.title} title={k.title} value={k.value} delta={k.delta} deltaLabel={k.deltaLabel} icon={k.icon} accent={k.accent} />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4">
        {renderCharts()}
      </div>
    </div>
  );
}

// Drivers view
// ─── Driver types & seed data ─────────────────────────────────────────────────
type DriverRow = {
  id: string; name: string; vehicle: string; available: boolean;
  trips: number; rating: number; incidents: number; verified: boolean;
  status: string; license: string; phone: string; joined: string;
};

const SEED_DRIVERS: DriverRow[] = [
  { id: 'DRV-001', name: 'Raj Kumar',     vehicle: 'MH12AB1234', available: true,  trips: 5, rating: 4.8, incidents: 0, verified: true,  status: 'On Duty',         license: 'MH-0120230001234', phone: '••••••8821', joined: 'Jan 2024' },
  { id: 'DRV-002', name: 'Suresh Yadav',  vehicle: 'MH12CD5678', available: false, trips: 3, rating: 4.6, incidents: 1, verified: true,  status: 'On Trip',         license: 'MH-0120210009871', phone: '••••••4432', joined: 'Feb 2024' },
  { id: 'DRV-003', name: 'Mohan Singh',   vehicle: 'MH12EF9012', available: true,  trips: 6, rating: 4.9, incidents: 0, verified: true,  status: 'On Duty',         license: 'MH-0120190003341', phone: '••••••7761', joined: 'Mar 2024' },
  { id: 'DRV-004', name: 'Arjun Nair',    vehicle: 'MH12GH3456', available: false, trips: 4, rating: 4.4, incidents: 2, verified: true,  status: 'SOS Active',      license: 'MH-0120220006612', phone: '••••••3390', joined: 'Apr 2024' },
  { id: 'DRV-005', name: 'Deepak Patel',  vehicle: 'MH12IJ7890', available: true,  trips: 2, rating: 4.7, incidents: 0, verified: false, status: 'Pending Verify',  license: 'MH-0120230008824', phone: '••••••5510', joined: 'Sep 2024' },
  { id: 'DRV-006', name: 'Santosh Rao',   vehicle: 'MH12KL2345', available: true,  trips: 4, rating: 4.5, incidents: 1, verified: true,  status: 'On Duty',         license: 'MH-0120200001123', phone: '••••••6643', joined: 'May 2024' },
  { id: 'DRV-007', name: 'Prakash Verma', vehicle: '—',          available: false, trips: 0, rating: 0.0, incidents: 0, verified: false, status: 'Pending Verify',  license: 'MH-0120240002281', phone: '••••••9920', joined: 'Sep 2024' },
];

// ─── Add Driver Modal ─────────────────────────────────────────────────────────
function AddDriverModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: DriverRow) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', license: '', vehicle: '', joined: '' });
  const [error, setError] = useState('');
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) { setError('Name is required.'); return; }
    if (!form.license.trim()) { setError('License number is required.'); return; }
    const num = String(8 + SEED_DRIVERS.length + Math.floor(Math.random() * 10)).padStart(3, '0');
    onAdd({
      id: `DRV-${num}`,
      name: form.name.trim(),
      vehicle: form.vehicle.trim() || '—',
      available: false,
      trips: 0,
      rating: 0,
      incidents: 0,
      verified: false,
      status: 'Pending Verify',
      license: form.license.trim(),
      phone: form.phone ? '••••••' + form.phone.slice(-4) : '—',
      joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(12px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-y-auto slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add Driver</h2>
            <p className="text-xs text-slate-400 mt-0.5">Register a new driver for verification</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">{error}</div>}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="e.g. Raj Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">License Number <span className="text-red-500">*</span></label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 mono" placeholder="MH-0120230001234" value={form.license} onChange={e => set('license', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
              <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Assigned Vehicle (optional)</label>
            <input className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-300 mono" placeholder="e.g. MH12AB1234" value={form.vehicle} onChange={e => set('vehicle', e.target.value)} />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-start gap-2">
            <span className="text-sm mt-0.5">⏳</span>
            <span>New drivers start with <strong>Pending Verification</strong> status. They must be verified before being assigned trips.</span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={submit} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Add Driver</button>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Profile Drawer ────────────────────────────────────────────────────
function DriverProfileDrawer({ driver, onClose, onVerify }: {
  driver: DriverRow; onClose: () => void; onVerify: (id: string) => void;
}) {
  const initials = driver.name.split(' ').map(n => n[0]).join('');
  const statusColor = (s: string): 'green' | 'blue' | 'red' | 'amber' | 'slate' | 'cyan' =>
    s === 'SOS Active' ? 'red' : s === 'On Trip' ? 'blue' : s === 'On Duty' ? 'green' : 'amber';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-800">Driver Profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 text-sm transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Identity */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                {initials}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-base">{driver.name}</div>
                <div className="text-xs text-slate-400 mono mt-0.5">{driver.id}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge label={driver.status} color={statusColor(driver.status)} />
              <Badge label={driver.verified ? '✓ Verified' : '⏳ Pending Verification'} color={driver.verified ? 'green' : 'amber'} />
              {driver.rating > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border bg-amber-50 text-amber-700 border-amber-200">★ {driver.rating}</span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Trips Today', value: String(driver.trips) },
                { label: 'Incidents', value: String(driver.incidents) },
                { label: 'Rating', value: driver.rating > 0 ? `★ ${driver.rating}` : '—' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <div className="text-lg font-bold text-slate-800">{s.value}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              {[
                { label: 'Phone', value: driver.phone, icon: '📞' },
                { label: 'License Number', value: driver.license, icon: '🪪', mono: true },
                { label: 'Assigned Vehicle', value: driver.vehicle, icon: '🚌', mono: true },
                { label: 'Availability', value: driver.available ? 'Available' : 'Busy', icon: '🟢' },
                { label: 'Joined', value: driver.joined, icon: '📅' },
              ].map(f => (
                <div key={f.label} className="flex items-start gap-2.5 py-2 border-b border-slate-50">
                  <span className="text-sm mt-0.5 flex-shrink-0">{f.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</div>
                    <div className={`text-xs font-medium text-slate-800 ${f.mono ? 'mono' : ''}`}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          {!driver.verified && (
            <button onClick={() => { onVerify(driver.id); onClose(); }}
              className="w-full mb-2 py-2.5 text-xs bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors">
              ✓ Approve & Verify Driver
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button className="py-2.5 text-xs bg-blue-50 text-blue-700 rounded-xl border border-blue-200 font-semibold hover:bg-blue-100 transition-colors">Edit Profile</button>
            <button className="py-2.5 text-xs bg-slate-100 text-slate-700 rounded-xl border border-slate-200 font-semibold hover:bg-slate-200 transition-colors">Trip History</button>
            <button className="py-2.5 text-xs bg-amber-50 text-amber-700 rounded-xl border border-amber-200 font-semibold hover:bg-amber-100 transition-colors">Assign Vehicle</button>
            <button className="py-2.5 text-xs bg-red-50 text-red-700 rounded-xl border border-red-200 font-semibold hover:bg-red-100 transition-colors">Suspend</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Drivers View ─────────────────────────────────────────────────────────────
function DriversView() {
  const [drivers, setDrivers] = useState<DriverRow[]>(SEED_DRIVERS);
  const [filter, setFilter] = useState('All Drivers');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profileDriver, setProfileDriver] = useState<DriverRow | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const FILTERS = ['All Drivers', 'Available', 'On Trip', 'Pending Verification'];
  useEffect(() => { setPage(1); }, [filter, search]);

  const filtered = drivers.filter(d => {
    const matchFilter =
      filter === 'All Drivers' ? true
      : filter === 'Available' ? d.available
      : filter === 'On Trip' ? d.status === 'On Trip'
      : filter === 'Pending Verification' ? !d.verified
      : true;
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q) || d.vehicle.toLowerCase().includes(q) || d.license.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const counts: Record<string, number> = {
    'All Drivers': drivers.length,
    'Available': drivers.filter(d => d.available).length,
    'On Trip': drivers.filter(d => d.status === 'On Trip').length,
    'Pending Verification': drivers.filter(d => !d.verified).length,
  };

  const totalDrvPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedDrivers = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const verifyDriver = (id: string) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, verified: true, status: 'On Duty', available: true } : d));
  };

  const statusColor = (s: string): 'green' | 'blue' | 'red' | 'amber' | 'slate' | 'cyan' =>
    s === 'SOS Active' ? 'red' : s === 'On Trip' ? 'blue' : s === 'On Duty' ? 'green' : 'amber';

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {showAddModal && (
        <AddDriverModal
          onClose={() => setShowAddModal(false)}
          onAdd={d => setDrivers(prev => [d, ...prev])}
        />
      )}
      {profileDriver && (
        <DriverProfileDrawer
          driver={profileDriver}
          onClose={() => setProfileDriver(null)}
          onVerify={verifyDriver}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
            <input
              className="pl-8 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="Search drivers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-sm leading-none">✕</button>
            )}
          </div>

          {/* Filter tabs */}
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors flex-shrink-0"
        >
          + Add Driver
        </button>
      </div>

      {/* Results count */}
      <div className="mb-3 text-xs text-slate-400">
        {filtered.length === drivers.length
          ? `${drivers.length} drivers`
          : `${filtered.length} of ${drivers.length} drivers`}
        {search && <span> matching "<span className="text-slate-600 font-medium">{search}</span>"</span>}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Driver', 'ID', 'Vehicle', 'Availability', 'Trips Today', 'Rating', 'Incidents', 'Verified', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <div className="text-sm text-slate-500 font-medium">No drivers found</div>
                    <div className="text-xs text-slate-400">
                      {search ? `No results for "${search}"` : `No drivers in "${filter}"`}
                    </div>
                    {(search || filter !== 'All Drivers') && (
                      <button onClick={() => { setSearch(''); setFilter('All Drivers'); }} className="mt-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : pagedDrivers.map(d => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {d.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-800">{d.name}</div>
                      <div className="text-[10px] text-slate-400 mono">{d.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 mono text-[11px] text-slate-400">{d.id}</td>
                <td className="px-4 py-3 mono text-xs text-slate-600">{d.vehicle}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <StatusDot active={d.available} />
                    <span className="text-xs text-slate-600">{d.available ? 'Available' : 'Busy'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{d.trips}</td>
                <td className="px-4 py-3">
                  {d.rating > 0
                    ? <span className="text-xs font-semibold text-amber-600">★ {d.rating}</span>
                    : <span className="text-xs text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{d.incidents}</td>
                <td className="px-4 py-3">
                  <Badge label={d.verified ? '✓ Verified' : '⏳ Pending'} color={d.verified ? 'green' : 'amber'} />
                </td>
                <td className="px-4 py-3">
                  <Badge label={d.status} color={statusColor(d.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setProfileDriver(d)}
                      className="px-2 py-1 text-[10px] bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      View
                    </button>
                    {!d.verified && (
                      <button
                        onClick={() => verifyDriver(d.id)}
                        className="px-2 py-1 text-[10px] bg-green-50 text-green-600 rounded hover:bg-green-100 font-medium"
                      >
                        Verify ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-slate-600">{filtered.length}</span> drivers
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">← Prev</button>
          {Array.from({ length: Math.min(totalDrvPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
          ))}
          {totalDrvPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
          <button onClick={() => setPage(p => Math.min(totalDrvPages, p + 1))} disabled={page === totalDrvPages}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">Next →</button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="mt-3 flex gap-4 text-xs text-slate-400">
        <span>Verified: <span className="text-green-600 font-semibold">{drivers.filter(d => d.verified).length}</span></span>
        <span>Pending: <span className="text-amber-600 font-semibold">{drivers.filter(d => !d.verified).length}</span></span>
        <span>Available: <span className="text-blue-600 font-semibold">{drivers.filter(d => d.available).length}</span></span>
        <span>On Trip: <span className="text-slate-600 font-semibold">{drivers.filter(d => d.status === 'On Trip').length}</span></span>
      </div>
    </div>
  );
}

// ─── Vehicles ────────────────────────────────────────────────────────────────
// ─── Vehicle Dialogs ──────────────────────────────────────────────────────────
type VehicleRow = {
  num: string; model: string; cap: number; driver: string; status: string;
  insurance: string; fitness: string; permit: string; util: number; nextService: string;
};

function VehicleDetailsDialog({ vehicle, onClose }: { vehicle: VehicleRow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'trips' | 'maintenance'>('overview');

  const docStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expired', color: 'red' as const, icon: '✕' };
    if (diff < 30) return { label: 'Expiring Soon', color: 'amber' as const, icon: '⚠' };
    return { label: 'Valid', color: 'green' as const, icon: '✓' };
  };

  const trips = [
    { id: 'RIDE-10421', date: '23 Sep', pickup: vehicle.driver === 'Raj Kumar' ? 'Kothrud' : 'Baner', drop: 'Hinjewadi Ph1', passengers: 4, status: 'Completed' },
    { id: 'RIDE-10440', date: '23 Sep', pickup: vehicle.driver === 'Raj Kumar' ? 'Kothrud' : 'Aundh', drop: 'Hinjewadi Ph1', passengers: 4, status: 'Completed' },
    { id: 'RIDE-10482', date: '24 Sep', pickup: 'Wakad', drop: 'Hinjewadi Ph1', passengers: 8, status: 'On Route' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl mx-4 flex flex-col" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-base font-bold text-slate-900">Vehicle Details</h2>
              <span className="mono text-sm font-semibold text-blue-600">{vehicle.num}</span>
              <Badge label={vehicle.status} color={vehicle.status === 'Active' ? 'green' : vehicle.status === 'Available' ? 'cyan' : 'amber'} />
            </div>
            <p className="text-xs text-slate-400">{vehicle.model} · Driver: {vehicle.driver}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-3 px-6 pt-4 flex-shrink-0">
          {[['CAPACITY', vehicle.cap + ' seats', '👥'],['UTILIZATION', vehicle.util + '%', '📊'],['TRIPS TODAY', '5', '🎫'],['STATUS', vehicle.status, '✅']].map(([l,v,i]) => (
            <div key={l} className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{i} {l}</div>
              <div className="text-lg font-bold text-slate-900">{v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 mt-4 border-b border-slate-100 flex-shrink-0">
          {(['overview', 'documents', 'trips', 'maintenance'] as const).map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
                {[['Vehicle Number', vehicle.num],['Model', vehicle.model],['Capacity', vehicle.cap + ' passengers'],['Fuel Type', 'Diesel'],['Status', vehicle.status],['Current Driver', vehicle.driver],['Route', 'Kothrud → Hinjewadi Ph1'],['Organization', 'TCS Pune Campus']].map(([l,v]) => (
                  <div key={l} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500">{l}</span>
                    <span className={`font-semibold ${l === 'Vehicle Number' ? 'mono text-blue-600' : 'text-slate-800'}`}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-700 mb-2">Utilization</div>
                <div className="h-2 bg-slate-100 rounded-full mb-1">
                  <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${vehicle.util}%` }} />
                </div>
                <div className="text-[11px] text-slate-400">{vehicle.util}% utilization this month</div>
              </div>
            </>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-3">
              {[['Insurance', vehicle.insurance, '🛡'],['Fitness Certificate', vehicle.fitness, '✅'],['Permit', vehicle.permit, '📄'],['Registration', '2030-01-01', '📋'],['Pollution Certificate', '2025-06-15', '🌿']].map(([name, date, icon]) => {
                const st = docStatus(date as string);
                return (
                  <div key={name as string} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="text-2xl flex-shrink-0">{icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-800">{name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Expiry: {date}</div>
                    </div>
                    <Badge label={st.label} color={st.color} />
                    <div className="flex gap-2 flex-shrink-0">
                      <button className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">View</button>
                      <button className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">{st.label === 'Expired' ? 'Replace' : 'Download'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'trips' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {['Ride ID', 'Date', 'Pickup', 'Drop', 'Passengers', 'Status'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-3 py-2.5 mono text-blue-600 font-semibold">{t.id}</td>
                      <td className="px-3 py-2.5 text-slate-500">{t.date}</td>
                      <td className="px-3 py-2.5 text-slate-600">{t.pickup}</td>
                      <td className="px-3 py-2.5 text-slate-600">{t.drop}</td>
                      <td className="px-3 py-2.5 text-center text-slate-700">{t.passengers}</td>
                      <td className="px-3 py-2.5"><Badge label={t.status} color={t.status === 'Completed' ? 'green' : 'blue'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-3 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                {[['Last Service', '2024-08-15'],['Next Service', vehicle.nextService],['Maintenance Status', 'On Schedule'],['Odometer', '48,200 km'],['Service Provider', 'Shivneri Garage, Pune']].map(([l,v]) => (
                  <div key={l} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500">{l}</span>
                    <span className="font-semibold text-slate-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Close</button>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Edit Vehicle</button>
            <button className="px-4 py-2 text-xs font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>View Driver</button>
          </div>
        </div>
      </div>
    </div>
  );
}

type DocItem = { name: string; date: string; icon: string; };

function DocViewerModal({ doc, vehicle, onClose }: { doc: DocItem; vehicle: VehicleRow; onClose: () => void }) {
  const docStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = (d.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expired', color: 'red' as const };
    if (diff < 30) return { label: 'Expiring Soon', color: 'amber' as const };
    return { label: 'Valid', color: 'green' as const };
  };
  const st = docStatus(doc.date);

  const meta = [
    ['Document Type', doc.name],
    ['Vehicle Number', vehicle.num],
    ['Vehicle Model', vehicle.model],
    ['Issue Date', '15 Jan 2024'],
    ['Expiry Date', doc.date],
    ['Issued By', 'IRDA / Transport Authority, Pune'],
    ['Policy / Cert No.', 'POL-2024-' + vehicle.num.replace(/[^A-Z0-9]/g, '')],
    ['Status', st.label],
    ['Uploaded On', '16 Jan 2024'],
    ['Uploaded By', 'Shivneri Transport Admin'],
  ];

  return (
    /* Overlay — darker than the parent dialog so the layering reads clearly */
    <div
      className="fixed inset-0 z-60 flex items-center justify-center"
      style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Card — matches reference: pure white, very large radius, deep shadow, no border strip */}
      <div
        className="bg-white w-full mx-4 flex flex-col max-w-3xl"
        style={{ maxHeight: '88vh', borderRadius: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header — reference style: title left, circle-X right, no bottom border initially */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{doc.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors text-sm flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-5">

          {/* Simulated document preview */}
          <div
            className="w-full rounded-2xl overflow-hidden border border-slate-100 flex flex-col"
            style={{ background: '#f8fafc', minHeight: 220 }}
          >
            {/* Doc header strip */}
            <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-slate-100">
              <div className="text-3xl">{doc.icon}</div>
              <div>
                <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                <div className="text-xs text-slate-400 mono mt-0.5">{vehicle.num} · {vehicle.model}</div>
              </div>
              <div className="ml-auto">
                <Badge label={st.label} color={st.color} />
              </div>
            </div>
            {/* Simulated PDF body — horizontal lines like a document */}
            <div className="px-6 py-5 space-y-2.5 flex-1">
              {[100, 80, 90, 60, 85, 70, 75, 55, 80, 65].map((w, i) => (
                <div key={i} className="h-2 rounded-full bg-slate-200" style={{ width: `${w}%`, opacity: i > 5 ? 0.5 : 1 }} />
              ))}
              <div className="mt-4 flex gap-3">
                <div className="h-16 rounded-xl bg-slate-200 flex-1" />
                <div className="h-16 rounded-xl bg-slate-200 flex-1" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-10 h-10 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 rounded-full bg-slate-200 w-3/4" />
                  <div className="h-2 rounded-full bg-slate-100 w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Document Details</div>
            {meta.map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-xs font-semibold ${label === 'Vehicle Number' || label === 'Policy / Cert No.' ? 'mono text-blue-600' : label === 'Status' ? (st.color === 'green' ? 'text-green-700' : st.color === 'amber' ? 'text-amber-700' : 'text-red-700') : 'text-slate-800'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = 'data:application/pdf;base64,JVBERi0xLjQ=';
                a.download = `${doc.name.replace(/\s+/g, '_')}_${vehicle.num}.pdf`;
                a.click();
              }}
              className="flex-1 py-2.5 text-xs font-semibold text-white rounded-xl transition-colors"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
              Download PDF
            </button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Print Document
            </button>
            {(st.label === 'Expired' || st.label === 'Expiring Soon') && (
              <label className="flex-1 py-2.5 text-xs font-semibold text-white rounded-xl cursor-pointer text-center" style={{ background: '#dc2626' }}>
                Replace Document
                <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={() => { onClose(); }} />
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleDocsDialog({ vehicle, onClose }: { vehicle: VehicleRow; onClose: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocItem | null>(null);

  const docStatus = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expired', color: 'red' as const };
    if (diff < 30) return { label: 'Expiring Soon', color: 'amber' as const };
    return { label: 'Valid', color: 'green' as const };
  };

  const docs: DocItem[] = [
    { name: 'Insurance', date: vehicle.insurance, icon: '🛡' },
    { name: 'Fitness Certificate', date: vehicle.fitness, icon: '✅' },
    { name: 'Permit', date: vehicle.permit, icon: '📄' },
    { name: 'Registration Certificate', date: '2030-01-01', icon: '📋' },
    { name: 'Pollution Certificate', date: '2025-06-15', icon: '🌿' },
  ];

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setUploadedDoc('Document'); }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl mx-4 flex flex-col" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Vehicle Documents</h2>
            <p className="text-xs text-slate-400">Compliance and vehicle documentation · {vehicle.num}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {uploadedDoc && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-xs text-green-700 font-semibold">
              ✓ {uploadedDoc} uploaded successfully.
            </div>
          )}
          {docs.map(doc => {
            const st = docStatus(doc.date);
            return (
              <div key={doc.name} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                <div className="text-2xl flex-shrink-0">{doc.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{doc.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Expiry: {doc.date}</div>
                </div>
                <Badge label={st.label} color={st.color} />
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setViewingDoc(doc)} className="px-2.5 py-1.5 text-[10px] font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">View</button>
                  <button onClick={() => { const a = document.createElement('a'); a.href='data:application/pdf;base64,JVBERi0xLjQ='; a.download=`${doc.name.replace(/\s+/g,'_')}_${vehicle.num}.pdf`; a.click(); }} className="px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Download</button>
                  {(st.label === 'Expired' || st.label === 'Expiring Soon') && (
                    <label className="px-2.5 py-1.5 text-[10px] font-semibold text-white rounded-lg cursor-pointer" style={{ background: '#dc2626' }}>
                      Replace
                      <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={() => { setUploadedDoc(doc.name); }} />
                    </label>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upload area */}
          <div className="mt-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer" onClick={handleUpload}>
            {uploading ? (
              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                </div>
                <p className="text-xs text-slate-500">Uploading…</p>
              </div>
            ) : (
              <>
                <div className="text-2xl mb-2">📎</div>
                <p className="text-xs font-semibold text-slate-700">Upload Document</p>
                <p className="text-[11px] text-slate-400 mt-1">Drag & drop or click to browse · PDF, JPG, PNG</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Close</button>
          <button onClick={handleUpload} className="px-4 py-2 text-xs font-semibold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>Upload Document</button>
        </div>
      </div>

      {/* Nested document viewer — z-60, layered above this dialog */}
      {viewingDoc && <DocViewerModal doc={viewingDoc} vehicle={vehicle} onClose={() => setViewingDoc(null)} />}
    </div>
  );
}

function ReviewAllDocsModal({ vehicles, onClose, onViewDocs }: { vehicles: VehicleRow[]; onClose: () => void; onViewDocs: (v: VehicleRow) => void }) {
  const today = new Date();
  const docStatus = (dateStr: string) => {
    const diff = (new Date(dateStr).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return { label: 'Expired', color: 'red' as const, days: Math.abs(Math.round(diff)) };
    if (diff < 30) return { label: 'Expiring Soon', color: 'amber' as const, days: Math.round(diff) };
    return { label: 'Valid', color: 'green' as const, days: Math.round(diff) };
  };

  type DocEntry = { vehicle: VehicleRow; docName: string; icon: string; date: string; status: ReturnType<typeof docStatus> };
  const issues: DocEntry[] = [];
  vehicles.forEach(v => {
    [
      { docName: 'Insurance',           icon: '🛡', date: v.insurance },
      { docName: 'Fitness Certificate', icon: '✅', date: v.fitness  },
      { docName: 'Permit',              icon: '📄', date: v.permit   },
    ].forEach(({ docName, icon, date }) => {
      const st = docStatus(date);
      if (st.label !== 'Valid') issues.push({ vehicle: v, docName, icon, date, status: st });
    });
  });

  // Sort: Expired first, then Expiring Soon; within each group by days ascending
  issues.sort((a, b) => {
    if (a.status.label === b.status.label) return a.status.days - b.status.days;
    return a.status.label === 'Expired' ? -1 : 1;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Document Compliance Review</h2>
            <p className="text-xs text-slate-400">{issues.length} document{issues.length !== 1 ? 's' : ''} require attention across {new Set(issues.map(i => i.vehicle.num)).size} vehicle{new Set(issues.map(i => i.vehicle.num)).size !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors flex-shrink-0">✕</button>
        </div>

        {/* Summary row */}
        <div className="flex gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex-1 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 text-center">
            <div className="text-lg font-bold text-red-600">{issues.filter(i => i.status.label === 'Expired').length}</div>
            <div className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">Expired</div>
          </div>
          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-center">
            <div className="text-lg font-bold text-amber-600">{issues.filter(i => i.status.label === 'Expiring Soon').length}</div>
            <div className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide">Expiring Soon</div>
          </div>
          <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-center">
            <div className="text-lg font-bold text-blue-600">{new Set(issues.map(i => i.vehicle.num)).size}</div>
            <div className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Vehicles Affected</div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          {issues.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">All documents are valid ✓</div>
          ) : issues.map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="text-2xl flex-shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800">{item.docName}</div>
                <div className="text-xs text-slate-500 mt-0.5 mono">{item.vehicle.num} · {item.vehicle.model}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Driver: {item.vehicle.driver}</div>
              </div>
              <div className="text-right flex-shrink-0 mr-2">
                <div className="text-[10px] text-slate-400">Expiry</div>
                <div className="text-xs font-semibold text-slate-700 mono">{item.date}</div>
                <div className={`text-[10px] font-semibold mt-0.5 ${item.status.color === 'red' ? 'text-red-500' : 'text-amber-500'}`}>
                  {item.status.label === 'Expired' ? `${item.status.days}d ago` : `in ${item.status.days}d`}
                </div>
              </div>
              <Badge label={item.status.label} color={item.status.color} />
              <button
                onClick={() => onViewDocs(item.vehicle)}
                className="px-3 py-1.5 text-[10px] font-semibold text-white rounded-lg flex-shrink-0 hover:opacity-90 transition-opacity"
                style={{ background: item.status.color === 'red' ? '#dc2626' : '#d97706' }}>
                Replace
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-[11px] text-slate-400">Click Replace to open the document manager for that vehicle</p>
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}

function AddVehicleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: VehicleRow) => void }) {
  const [form, setForm] = useState({ num: '', model: '', cap: '', driver: '', status: 'Available', insurance: '', fitness: '', permit: '' });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.num || !form.model) return;
    setSaving(true);
    setTimeout(() => {
      onAdd({
        num: form.num.toUpperCase(),
        model: form.model,
        cap: parseInt(form.cap) || 6,
        driver: form.driver || 'Unassigned',
        status: form.status,
        insurance: form.insurance || '2026-12-31',
        fitness: form.fitness || '2026-12-31',
        permit: form.permit || '2026-12-31',
        util: 0,
        nextService: '2025-06-01',
      });
      setSaving(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Vehicle</h2>
            <p className="text-xs text-slate-400">Register a new vehicle to the fleet</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Vehicle Number *</label>
              <input value={form.num} onChange={e => set('num', e.target.value)} placeholder="MH12AB1234" className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Model *</label>
              <input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Toyota Innova Crysta" className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Capacity</label>
              <input value={form.cap} onChange={e => set('cap', e.target.value)} placeholder="7" type="number" min={1} max={50} className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Driver</label>
              <input value={form.driver} onChange={e => set('driver', e.target.value)} placeholder="Unassigned" className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</label>
            <div className="flex gap-2 mt-1">
              {['Active', 'Available', 'In Service'].map(s => (
                <button key={s} onClick={() => set('status', s)} className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-colors ${form.status === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{s}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Insurance Expiry</label>
              <input type="date" value={form.insurance} onChange={e => set('insurance', e.target.value)} className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Fitness Expiry</label>
              <input type="date" value={form.fitness} onChange={e => set('fitness', e.target.value)} className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Permit Expiry</label>
              <input type="date" value={form.permit} onChange={e => set('permit', e.target.value)} className="mt-1 w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.num || !form.model} className="px-5 py-2 text-xs font-semibold text-white rounded-xl disabled:opacity-50 transition-colors" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
            {saving ? 'Saving…' : 'Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VehiclesView() {
  const [viewVehicle, setViewVehicle]   = useState<VehicleRow | null>(null);
  const [docsVehicle, setDocsVehicle]   = useState<VehicleRow | null>(null);
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showReviewAll, setShowReviewAll] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  useEffect(() => { setPage(1); }, [vehicleFilter]);

  const [vehicles, setVehicles] = useState<VehicleRow[]>([
    { num: 'MH12AB1234', model: 'Toyota Innova Crysta', cap: 7, driver: 'Raj Kumar', status: 'Active', insurance: '2025-03-14', fitness: '2024-11-20', permit: '2025-06-30', util: 82, nextService: '2024-10-15' },
    { num: 'MH12CD5678', model: 'Maruti Ertiga', cap: 6, driver: 'Suresh Yadav', status: 'Active', insurance: '2025-01-08', fitness: '2024-10-05', permit: '2025-03-20', util: 71, nextService: '2024-10-28' },
    { num: 'MH12EF9012', model: 'Mahindra Marazzo', cap: 8, driver: 'Mohan Singh', status: 'Active', insurance: '2024-10-30', fitness: '2025-02-14', permit: '2025-08-10', util: 65, nextService: '2024-11-12' },
    { num: 'MH12GH3456', model: 'Force Traveller 17', cap: 17, driver: 'Arjun Nair', status: 'In Service', insurance: '2025-05-22', fitness: '2024-09-28', permit: '2025-04-15', util: 0, nextService: '2024-10-01' },
    { num: 'MH12IJ7890', model: 'Toyota Innova Crysta', cap: 7, driver: 'Deepak Patel', status: 'Active', insurance: '2024-11-15', fitness: '2025-01-30', permit: '2025-07-20', util: 58, nextService: '2024-12-05' },
    { num: 'MH12KL2345', model: 'Kia Carens', cap: 6, driver: 'Unassigned', status: 'Available', insurance: '2025-08-12', fitness: '2025-04-18', permit: '2025-09-01', util: 0, nextService: '2025-01-20' },
  ]);

  const filteredVehicles = vehicleFilter === 'All' ? vehicles : vehicles.filter(v => v.status === vehicleFilter);
  const totalVehPages = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE));
  const pagedVehicles = filteredVehicles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const today = new Date();
  const expiringSoon = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 30 && diff >= 0;
  };
  const expired = (dateStr: string) => new Date(dateStr) < today;

  const docBadge = (dateStr: string) => {
    if (expired(dateStr)) return <Badge label="Expired" color="red" />;
    if (expiringSoon(dateStr)) return <Badge label="Expiring Soon" color="amber" />;
    return <Badge label="Valid" color="green" />;
  };

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {viewVehicle && <VehicleDetailsDialog vehicle={viewVehicle} onClose={() => setViewVehicle(null)} />}
      {docsVehicle && <VehicleDocsDialog vehicle={docsVehicle} onClose={() => setDocsVehicle(null)} />}
      {showAddVehicle && <AddVehicleModal onClose={() => setShowAddVehicle(false)} onAdd={v => setVehicles(prev => [v, ...prev])} />}
      {showReviewAll && <ReviewAllDocsModal vehicles={vehicles} onClose={() => setShowReviewAll(false)} onViewDocs={v => { setShowReviewAll(false); setDocsVehicle(v); }} />}
      <div className="grid grid-cols-4 gap-4 mb-5">
        <KpiCard title="Total Vehicles" value="896" delta="+14" deltaLabel="this month" icon="🚌" />
        <KpiCard title="Active" value="663" icon="✅" accent={GREEN} />
        <KpiCard title="In Maintenance" value="48" icon="🔧" accent={AMBER} />
        <KpiCard title="Documents Expiring" value="12" icon="⚠" accent={RED} />
      </div>

      {/* Expiry alert */}
      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
        <span className="text-lg">⚠</span>
        <div className="text-xs text-amber-800">
          <span className="font-semibold">3 vehicles</span> have documents expiring within 30 days. Review and renew to ensure compliance.
        </div>
        <button onClick={() => setShowReviewAll(true)} className="ml-auto px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">Review All</button>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {['All', 'Active', 'Available', 'In Service'].map(f => (
            <button key={f} onClick={() => setVehicleFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${vehicleFilter === f ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'}`}>{f}</button>
          ))}
        </div>
        <button onClick={() => setShowAddVehicle(true)} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">+ Add Vehicle</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Vehicle No.', 'Model', 'Cap.', 'Driver', 'Status', 'Insurance', 'Fitness', 'Permit', 'Utilization', 'Next Service', 'Actions'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedVehicles.map((v, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 mono font-semibold text-slate-800">{v.num}</td>
                <td className="px-3 py-3 text-slate-700">{v.model}</td>
                <td className="px-3 py-3 text-center font-medium text-slate-700">{v.cap}</td>
                <td className="px-3 py-3 text-slate-600">{v.driver}</td>
                <td className="px-3 py-3">
                  <Badge label={v.status} color={v.status === 'Active' ? 'green' : v.status === 'Available' ? 'cyan' : 'amber'} />
                </td>
                <td className="px-3 py-3">{docBadge(v.insurance)}</td>
                <td className="px-3 py-3">{docBadge(v.fitness)}</td>
                <td className="px-3 py-3">{docBadge(v.permit)}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full w-16">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${v.util}%` }} />
                    </div>
                    <span className="mono text-[10px] text-slate-500">{v.util}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 mono text-slate-400">{v.nextService}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setViewVehicle(v)} className="px-2 py-1 text-[10px] font-semibold bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors">View</button>
                    <button onClick={() => setDocsVehicle(v)} className="px-2 py-1 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">Docs</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{filteredVehicles.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredVehicles.length)}</span> of <span className="font-semibold text-slate-600">{filteredVehicles.length}</span> vehicles
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">← Prev</button>
          {Array.from({ length: Math.min(totalVehPages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
          ))}
          {totalVehPages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
          <button onClick={() => setPage(p => Math.min(totalVehPages, p + 1))} disabled={page === totalVehPages}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">Next →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Rides ────────────────────────────────────────────────────────────────────
function RidesView() {
  const [filter, setFilter] = useState('All');
  const [selectedRide, setSelectedRide] = useState<RideRow | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  useEffect(() => { setPage(1); }, [filter]);
  const rides: RideRow[] = [
    { id: 'RIDE-10421', driver: 'Raj Kumar', vehicle: 'MH12AB1234', org: 'TCS Pune Campus', passengers: 4, pickup: 'Kothrud', drop: 'Hinjewadi Ph1', scheduled: '08:00', status: 'Completed', distance: '18 km', cost: '₹420' },
    { id: 'RIDE-10422', driver: 'Suresh Yadav', vehicle: 'MH12CD5678', org: 'Infosys BPM', passengers: 6, pickup: 'Baner', drop: 'Hinjewadi Ph2', scheduled: '08:30', status: 'Delayed', distance: '12 km', cost: '₹290' },
    { id: 'RIDE-10423', driver: 'Mohan Singh', vehicle: 'MH12EF9012', org: 'Wipro Tech', passengers: 3, pickup: 'Aundh', drop: 'Magarpatta', scheduled: '09:00', status: 'On Route', distance: '22 km', cost: '₹510' },
    { id: 'RIDE-10438', driver: 'Arjun Nair', vehicle: 'MH12GH3456', org: 'Cognizant', passengers: 7, pickup: 'Wakad', drop: 'Hinjewadi Ph3', scheduled: '22:00', status: 'SOS', distance: '9 km', cost: '₹210' },
    { id: 'RIDE-10439', driver: 'Deepak Patel', vehicle: 'MH12IJ7890', org: 'TCS Pune Campus', passengers: 5, pickup: 'Pimple Saudagar', drop: 'Baner Rd', scheduled: '09:30', status: 'Assigned', distance: '8 km', cost: '₹190' },
    { id: 'RIDE-10440', driver: 'Raj Kumar', vehicle: 'MH12AB1234', org: 'TCS Pune Campus', passengers: 4, pickup: 'Kothrud', drop: 'Hinjewadi Ph1', scheduled: '18:30', status: 'Completed', distance: '18 km', cost: '₹420' },
    { id: 'RIDE-10441', driver: 'Mohan Singh', vehicle: 'MH12EF9012', org: 'Infosys BPM', passengers: 5, pickup: 'Hadapsar', drop: 'EON IT Park', scheduled: '19:00', status: 'Completed', distance: '14 km', cost: '₹330' },
  ];

  const filters = ['All', 'On Route', 'Completed', 'Delayed', 'SOS', 'Assigned'];
  const filtered = filter === 'All' ? rides : rides.filter(r => r.status === filter);
  const totalRidePages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedRides = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusColor = (s: string): 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'cyan' =>
    s === 'Completed' ? 'green' : s === 'On Route' ? 'blue' : s === 'Delayed' ? 'amber' : s === 'SOS' ? 'red' : 'slate';

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      {selectedRide && <RideDetailsDialog ride={selectedRide} onClose={() => setSelectedRide(null)} />}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <KpiCard title="Today's Total" value="1,954" icon="🎫" />
        <KpiCard title="Completed" value="1,687" delta="86.3%" deltaLabel="completion" icon="✅" accent={GREEN} />
        <KpiCard title="On Route" value="247" icon="🔵" accent={BLUE} />
        <KpiCard title="Delayed" value="18" icon="⏱" accent={AMBER} />
        <KpiCard title="Cancelled" value="2" icon="✖" accent={RED} />
      </div>

      {/* Ride lifecycle */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-5">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ride Lifecycle</h3>
        <div className="flex items-center gap-1">
          {['Scheduled', 'Driver Assigned', 'Driver Arrived', 'Ride Started', 'Ride Completed'].map((s, i, arr) => (
            <Fragment key={s}>
              <div
                className={`flex-1 rounded-lg px-3 py-2 text-center text-[10px] font-semibold ${i <= 2 ? 'bg-blue-600 text-white' : i === 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}
              >
                {s}
              </div>
              {i < arr.length - 1 && <span className="text-slate-300 text-sm flex-shrink-0">→</span>}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filter === f ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Ride ID', 'Driver', 'Vehicle', 'Organization', 'Passengers', 'Pickup', 'Drop', 'Scheduled', 'Status', 'Distance', 'Cost', 'Actions'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRides.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-3 py-3 mono font-semibold text-blue-600">{r.id}</td>
                <td className="px-3 py-3 text-slate-700">{r.driver}</td>
                <td className="px-3 py-3 mono text-slate-500 text-[10px]">{r.vehicle}</td>
                <td className="px-3 py-3 text-slate-600">{r.org}</td>
                <td className="px-3 py-3 text-center text-slate-700">{r.passengers}</td>
                <td className="px-3 py-3 text-slate-500">{r.pickup}</td>
                <td className="px-3 py-3 text-slate-500">{r.drop}</td>
                <td className="px-3 py-3 mono text-slate-500">{r.scheduled}</td>
                <td className="px-3 py-3"><Badge label={r.status} color={statusColor(r.status)} /></td>
                <td className="px-3 py-3 text-slate-600">{r.distance}</td>
                <td className="px-3 py-3 font-medium text-slate-800">{r.cost}</td>
                <td className="px-3 py-3">
                  <button onClick={() => setSelectedRide(r)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-[10px] font-semibold">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-slate-600">{filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-slate-600">{filtered.length}</span> rides
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">← Prev</button>
          {Array.from({ length: Math.min(totalRidePages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${p === page ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>{p}</button>
          ))}
          {totalRidePages > 7 && <span className="text-slate-400 text-xs px-1">…</span>}
          <button onClick={() => setPage(p => Math.min(totalRidePages, p + 1))} disabled={page === totalRidePages}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors text-slate-600">Next →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Ride Details Dialog ──────────────────────────────────────────────────────
type RideRow = {
  id: string; driver: string; vehicle: string; org: string; passengers: number;
  pickup: string; drop: string; scheduled: string; status: string; distance: string; cost: string;
};

function RideDetailsDialog({ ride, onClose }: { ride: RideRow; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'route' | 'activity' | 'safety' | 'billing'>('overview');
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0);
  const [tick, setTick] = useState(0);
  const replayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (replayPlaying) {
      replayRef.current = setInterval(() => {
        setReplayProgress(p => { if (p >= 100) { setReplayPlaying(false); return 100; } return p + 2; });
      }, 100);
    } else if (replayRef.current) {
      clearInterval(replayRef.current);
    }
    return () => { if (replayRef.current) clearInterval(replayRef.current); };
  }, [replayPlaying]);

  const statusConfig: Record<string, { bg: string; desc: string; icon: string; progress: number; barColor: string }> = {
    'Completed': { bg: 'bg-green-100 text-green-700', desc: 'Trip completed successfully. All passengers arrived.', icon: '✓', progress: 100, barColor: '#16a34a' },
    'On Route':  { bg: 'bg-blue-100 text-blue-700',   desc: 'Driver is currently moving toward destination.',    icon: '●', progress: 72,  barColor: 'linear-gradient(90deg,#1d4ed8,#0891b2)' },
    'Delayed':   { bg: 'bg-amber-100 text-amber-700', desc: 'Trip delayed due to traffic congestion.',            icon: '⚠', progress: 45,  barColor: '#d97706' },
    'SOS':       { bg: 'bg-red-100 text-red-700',     desc: 'ACTIVE SAFETY INCIDENT — SOS triggered.',           icon: '🚨',progress: 60,  barColor: '#dc2626' },
    'Assigned':  { bg: 'bg-cyan-100 text-cyan-700',   desc: 'Driver assigned. Ride scheduled to begin.',          icon: '●', progress: 20,  barColor: '#0891b2' },
  };
  const sc = statusConfig[ride.status] ?? { bg: 'bg-slate-100 text-slate-700', desc: 'Ride scheduled.', icon: '○', progress: 0, barColor: '#94a3b8' };

  const passengers = [
    { id: 'EMP-10481', name: 'Akshat Gupta', pickup: ride.pickup, drop: ride.drop, boarding: 'Boarded' },
    { id: 'EMP-10482', name: 'Priya Sharma', pickup: ride.pickup, drop: ride.drop, boarding: ride.status === 'Assigned' ? 'Waiting' : 'Boarded' },
    { id: 'EMP-10483', name: 'Ravi Mehta',   pickup: ride.pickup, drop: ride.drop, boarding: 'Boarded' },
    { id: 'EMP-10484', name: 'Sneha Patil',  pickup: ride.pickup, drop: ride.drop, boarding: ride.status === 'Completed' ? 'Completed' : 'Boarded' },
  ].slice(0, ride.passengers);

  const lifecycleSteps = [
    { label: 'Scheduled', time: '07:30' }, { label: 'Driver Assigned', time: '07:45' },
    { label: 'Driver Arrived', time: '07:57' }, { label: 'Ride Started', time: '08:02' },
    { label: 'On Route', time: '08:10' },
    { label: 'Destination', time: ride.status === 'Completed' ? '08:42' : '' },
    { label: 'Completed', time: ride.status === 'Completed' ? '08:45' : '' },
  ];
  const completedCount = ride.status === 'Completed' ? 7 : ride.status === 'On Route' ? 5 : ride.status === 'Delayed' ? 4 : ride.status === 'SOS' ? 4 : ride.status === 'Assigned' ? 2 : 1;

  const activityEvents = [
    { time: '10:37 AM', icon: '✓', color: 'text-green-600', bg: 'bg-green-50 border-green-100', msg: 'Trip completed successfully', sub: `All ${ride.passengers} employees arrived safely` },
    { time: '10:34 AM', icon: '📍', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100',    msg: 'Vehicle approaching destination', sub: `${ride.drop} — 0.8 km remaining` },
    { time: '10:28 AM', icon: '🛣', color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100',     msg: 'Vehicle resumed normal route', sub: 'Route deviation cleared' },
    { time: '10:22 AM', icon: '⏱', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100',  msg: 'ETA updated: 12 min → 16 min', sub: 'Traffic congestion at Baner junction' },
    { time: '10:19 AM', icon: '⚠', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100',  msg: 'Traffic congestion detected', sub: 'Baner junction — alternate route suggested' },
    { time: '10:16 AM', icon: '📍', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100',     msg: 'Vehicle crossed Baner checkpoint', sub: 'On planned route' },
    { time: '10:10 AM', icon: '🚗', color: 'text-green-600', bg: 'bg-green-50 border-green-100',  msg: 'Trip started successfully', sub: 'All passengers boarded · OTP verified' },
    { time: '10:05 AM', icon: '📍', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100',     msg: 'Driver reached pickup location', sub: ride.pickup },
  ];

  const etaHistory = [{ time: '10:05', val: 12 }, { time: '10:15', val: 10 }, { time: '10:22', val: 16 }, { time: '10:28', val: 8 }];
  const etaMax = Math.max(...etaHistory.map(e => e.val));
  const etaPoints = etaHistory.map((e, i) => ({ x: 10 + (i / (etaHistory.length - 1)) * 180, y: 58 - (e.val / etaMax) * 46 }));
  const etaPath = etaPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const vx = 45 + Math.sin(tick * 0.3) * 1.2;
  const vy = 40 + Math.cos(tick * 0.25) * 0.8;

  const smartActions = () => {
    if (ride.status === 'Completed') return [
      { label: 'View Driver',    cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
      { label: 'View Vehicle',   cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
      { label: 'View Invoice',   cls: 'bg-green-600 text-white hover:bg-green-700' },
      { label: 'Export Summary', cls: 'bg-blue-600 text-white hover:bg-blue-700', action: () => setShowExport(true) },
    ];
    if (ride.status === 'SOS') return [
      { label: 'Track Live',       cls: 'bg-red-600 text-white hover:bg-red-700' },
      { label: 'Contact Security', cls: 'bg-slate-800 text-white hover:bg-slate-900' },
      { label: 'Open Incident',    cls: 'border border-red-200 text-red-700 hover:bg-red-50' },
      { label: 'Emergency Access', cls: 'border border-amber-200 text-amber-700 hover:bg-amber-50', action: () => setShowEmergency(true) },
    ];
    if (ride.status === 'Delayed') return [
      { label: 'Track Live',    cls: 'bg-blue-600 text-white hover:bg-blue-700' },
      { label: 'Contact Driver',cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
      { label: 'View Delay',    cls: 'border border-amber-200 text-amber-700 hover:bg-amber-50' },
      { label: 'Report Delay',  cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
    ];
    return [
      { label: 'Track Live',    cls: 'bg-blue-600 text-white hover:bg-blue-700' },
      { label: 'Contact Driver',cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
      { label: 'View Route',    cls: 'border border-slate-200 text-slate-700 hover:bg-slate-50' },
      { label: 'Report Issue',  cls: 'border border-red-200 text-red-700 hover:bg-red-50' },
    ];
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl flex flex-col dialog-in" style={{ maxHeight: '88vh', boxShadow: '0 32px 80px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>

          {/* ── Sticky Header ── */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0 rounded-t-2xl bg-white">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ride Details</span>
                <span className="mono text-sm font-bold text-blue-600">{ride.id}</span>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sc.bg}`}>{sc.icon} {ride.status}</span>
                {ride.status === 'SOS' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white pulse-dot">EMERGENCY</span>}
              </div>
              <p className="text-xs text-slate-400">{ride.org} · 23 September 2026 · Scheduled {ride.scheduled}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button title="Refresh" className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">↺</button>
              <div className="relative">
                <button onClick={() => setShowMoreActions(m => !m)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">More ▾</button>
                {showMoreActions && (
                  <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    {[
                      { label: 'Track Live',     icon: '📍' },
                      { label: 'Contact Driver', icon: '📞' },
                      { label: 'Report Issue',   icon: '⚠' },
                      { label: 'Share Ride',     icon: '🔗', action: () => { setShowMoreActions(false); setShowShare(true); } },
                      { label: 'Export Summary', icon: '📄', action: () => { setShowMoreActions(false); setShowExport(true); } },
                    ].map(m => (
                      <button key={m.label} onClick={() => { if (m.action) m.action(); else setShowMoreActions(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors text-left">
                        <span>{m.icon}</span>{m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">✕</button>
            </div>
          </div>

          {/* ── SOS Banner ── */}
          {ride.status === 'SOS' && (
            <div className="mx-6 mt-4 rounded-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#991b1b,#dc2626)', padding: '12px 16px' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl pulse-dot">🚨</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">ACTIVE SAFETY INCIDENT — SOS TRIGGERED</div>
                  <div className="text-xs text-red-200 mt-0.5">Incident INC-20438 · {ride.pickup} → {ride.drop} · Alert: 22:42 PM · Severity: HIGH</div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setShowEmergency(true)} className="px-3 py-1.5 text-xs font-bold bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors">Emergency Access</button>
                  <button className="px-3 py-1.5 text-xs font-bold border border-red-300 text-white rounded-lg hover:bg-red-700 transition-colors">Live Location</button>
                  <button className="px-3 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Contact Security</button>
                </div>
              </div>
            </div>
          )}

          {/* ── Smart Status ── */}
          <div className={`mx-6 mt-4 flex-shrink-0 rounded-xl p-4 border ${ride.status === 'SOS' ? 'bg-red-50 border-red-200' : ride.status === 'Delayed' ? 'bg-amber-50 border-amber-200' : ride.status === 'Completed' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className={`text-xs font-black uppercase tracking-widest mb-0.5 ${ride.status === 'SOS' ? 'text-red-700' : ride.status === 'Delayed' ? 'text-amber-700' : ride.status === 'Completed' ? 'text-green-700' : 'text-blue-700'}`}>{ride.status}</div>
                <div className="text-xs text-slate-600">{sc.desc}</div>
              </div>
              <div className="flex items-center gap-6 text-right">
                {ride.status !== 'Completed' && (
                  <>
                    <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">ETA</div><div className="text-base font-bold text-slate-900 mono">08 min</div></div>
                    <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">Distance Remaining</div><div className="text-base font-bold text-slate-900 mono">4.8 km</div></div>
                  </>
                )}
                <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">Progress</div><div className="text-base font-bold text-slate-900 mono">{sc.progress}%</div></div>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${sc.progress}%`, background: sc.barColor }} />
            </div>
            {ride.status === 'Delayed' && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">⚠ Delayed +12 min</span>
                <span className="text-[10px] text-slate-500">Reason: Traffic congestion · Baner junction</span>
                <button className="text-[10px] text-amber-600 underline ml-auto">Report Incorrect Reason</button>
              </div>
            )}
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-6 gap-2 px-6 mt-3 flex-shrink-0">
            {[
              { label: 'PASSENGERS', val: `${ride.passengers}/6`, icon: '👥' },
              { label: 'DISTANCE',   val: ride.distance,           icon: '🗺' },
              { label: 'ETA',        val: ride.status === 'Completed' ? 'Done' : '08 min', icon: '⏱' },
              { label: 'COST',       val: ride.cost,               icon: '💳' },
              { label: 'DURATION',   val: ride.status === 'Completed' ? '40 min' : 'Active', icon: '🕐' },
              { label: 'PROGRESS',   val: `${sc.progress}%`,       icon: '📊' },
            ].map(c => (
              <div key={c.label} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-center">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{c.icon} {c.label}</div>
                <div className="text-sm font-bold text-slate-900 mono mt-0.5">{c.val}</div>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex px-6 mt-3 border-b border-slate-100 flex-shrink-0 gap-0">
            {(['overview', 'route', 'activity', 'safety', 'billing'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-xs font-semibold capitalize border-b-2 transition-colors ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {t === 'route' ? 'Route & Live' : t}
              </button>
            ))}
          </div>

          {/* ── Scrollable Content ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

            {activeTab === 'overview' && (
              <>
                {/* Ride Info */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ride Information</h3>
                  <div className="grid grid-cols-2 gap-x-8 bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs">
                    {[['Ride ID',ride.id],['Organization',ride.org],['Scheduled',ride.scheduled],['Status',ride.status],['Pickup',ride.pickup],['Drop',ride.drop],['Distance',ride.distance],['Cost',ride.cost],['Passengers',String(ride.passengers)],['Ride Type','Employee Transport'],['Date','23 Sep 2026'],['Vehicle',ride.vehicle]].map(([l,v]) => (
                      <div key={l} className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
                        <span className="text-slate-500">{l}</span>
                        <span className={`font-semibold ${l === 'Ride ID' || l === 'Vehicle' ? 'mono text-blue-600' : 'text-slate-800'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Driver */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Driver</h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {ride.driver.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold text-slate-900">{ride.driver}</span>
                          <span className="mono text-[10px] text-slate-400">DRV-001</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ Verified</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">On Duty</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2">Phone: ••••••8821 · Rating: ★ 4.8 · <span className="mono text-slate-400">{ride.vehicle}</span></div>
                        <div className="flex items-center gap-4 text-xs flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Safety Score</span>
                            <span className="font-bold text-green-700">92/100</span>
                            <span className="text-green-600 text-[10px]">↑ Improving</span>
                          </div>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500">Harsh Braking: <b className="text-slate-700">2</b></span>
                          <span className="text-slate-500">Overspeeding: <b className="text-slate-700">0</b></span>
                          <span className="text-slate-500">Route Compliance: <b className="text-slate-700">98%</b></span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Call</button>
                        <button className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">Message</button>
                        <button className="px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">View Driver</button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vehicle */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Vehicle</h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">🚐</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold mono text-blue-600 text-sm">{ride.vehicle}</span>
                          <span className="text-xs text-slate-500">Toyota Innova Crysta · 7 seats</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
                        </div>
                        <div className="grid grid-cols-4 gap-x-4 gap-y-1 text-xs mt-2">
                          {[['Utilization','82%'],['Health','92%'],['Maintenance','⚠ Due 8 days'],['GPS','✓ Connected']].map(([l,v]) => (
                            <div key={l}><div className="text-[10px] text-slate-400">{l}</div><div className="font-semibold text-slate-700">{v}</div></div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                          {['Insurance ✓','Fitness ✓','Permit ✓'].map(item => (
                            <span key={item} className="font-semibold text-green-700">{item}</span>
                          ))}
                          <span className="text-[10px] text-slate-400">Engine: Normal · Tyres: Normal</span>
                        </div>
                      </div>
                      <button className="px-3 py-1.5 text-xs font-semibold border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0">View Vehicle</button>
                    </div>
                  </div>
                </section>

                {/* Passengers */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Passengers ({ride.passengers} / 6)</h3>
                    <button className="text-xs text-blue-600 hover:underline">View All Passengers</button>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {['','Employee ID','Name','Pickup','Drop','Boarding Status'].map(h => (
                            <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((p,i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                            <td className="px-3 py-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: ['#1d4ed8','#0891b2','#16a34a','#9333ea'][i % 4] }}>
                                {p.name.split(' ').map(n=>n[0]).join('')}
                              </div>
                            </td>
                            <td className="px-3 py-2 mono text-slate-400">{p.id}</td>
                            <td className="px-3 py-2 font-medium text-slate-800">{p.name}</td>
                            <td className="px-3 py-2 text-slate-500">{p.pickup}</td>
                            <td className="px-3 py-2 text-slate-500">{p.drop}</td>
                            <td className="px-3 py-2">
                              <span className={`font-semibold ${p.boarding === 'Waiting' ? 'text-amber-500' : 'text-green-600'}`}>
                                {p.boarding === 'Waiting' ? '⏳ Waiting' : `✓ ${p.boarding}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Verification */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ride Verification</h3>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    {[
                      ['Employee OTP','✓ Verified','08:02 AM'],
                      [`Passengers (${ride.passengers}/${ride.passengers})`,'✓ Complete','08:02 AM'],
                      ['Driver Verification','✓ Verified','07:57 AM'],
                      ['Ride Start Auth','✓ Authorized','08:02 AM'],
                    ].map(([l,v,t]) => (
                      <div key={l} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                        <div>
                          <div className="text-slate-600 font-medium">{l}</div>
                          <div className="text-[10px] mono text-slate-400 mt-0.5">{t}</div>
                        </div>
                        <span className="font-bold text-green-700">{v}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeTab === 'route' && (
              <>
                <div className="flex gap-4">
                  {/* Route Map */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ height: 320 }}>
                    <div className="relative h-full bg-slate-50">
                      {/* Legend */}
                      <div className="absolute top-3 left-3 z-10 bg-white/95 border border-slate-100 rounded-xl p-2 text-[10px] shadow-sm">
                        <div className="font-bold text-slate-400 uppercase tracking-wide mb-1">Legend</div>
                        {[['#1d4ed8','Completed'],['#60a5fa','Current'],['#cbd5e1','Remaining']].map(([c,l]) => (
                          <div key={l} className="flex items-center gap-1.5 mb-0.5"><div className="w-4 h-1 rounded" style={{ background: c }} /><span className="text-slate-400">{l}</span></div>
                        ))}
                      </div>
                      {/* Map controls */}
                      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                        {['+','−','⊙','↗'].map(c => (
                          <button key={c} className="w-7 h-7 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center shadow-sm">{c}</button>
                        ))}
                      </div>

                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 320" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="rdg2" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1d4ed8" />
                            <stop offset={`${sc.progress}%`} stopColor="#60a5fa" />
                            <stop offset={`${sc.progress}%`} stopColor="#cbd5e1" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                          </linearGradient>
                          <filter id="mg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                        </defs>
                        <rect width="600" height="320" fill="#f8fafc" />
                        {[1,2,3,4].map(i => <line key={i} x1="0" y1={i*70} x2="600" y2={i*70} stroke="#e2e8f0" strokeWidth="1" />)}
                        {[1,2,3,4,5,6,7,8].map(i => <line key={i} x1={i*70} y1="0" x2={i*70} y2="320" stroke="#e2e8f0" strokeWidth="1" />)}
                        <path d="M60,265 C120,265 160,170 230,150 C300,130 360,95 430,75 C480,62 520,52 545,48" stroke="url(#rdg2)" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <circle cx="60" cy="265" r="10" fill="#1d4ed8" filter="url(#mg)" /><circle cx="60" cy="265" r="5" fill="white" />
                        <circle cx={`${vx * 6}`} cy={`${vy * 3.2}`} r="10" fill="#f59e0b" stroke="white" strokeWidth="2.5" filter="url(#mg)" />
                        <text x={`${vx * 6}`} y={`${vy * 3.2 + 1}`} textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">★</text>
                        <circle cx="545" cy="48" r="10" fill="#16a34a" filter="url(#mg)" /><circle cx="545" cy="48" r="5" fill="white" />
                      </svg>

                      <div className="absolute bottom-5 left-10 bg-white border border-blue-200 rounded-lg px-2.5 py-1.5 shadow-sm z-10">
                        <div className="text-[10px] font-bold text-blue-700">📍 {ride.pickup}</div>
                        <div className="text-[10px] text-slate-400">Pickup</div>
                      </div>
                      <div className="absolute top-10 right-[80px] bg-white border border-green-200 rounded-lg px-2.5 py-1.5 shadow-sm z-10">
                        <div className="text-[10px] font-bold text-green-700">📍 {ride.drop}</div>
                        <div className="text-[10px] text-slate-400">Destination</div>
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] bg-white/90 px-3 py-1 rounded-full border border-slate-100 shadow-sm z-10">
                        <span>Route: <b className="text-slate-700">{ride.distance}</b></span>
                        <span>ETA: <b className="text-slate-700">08 min</b></span>
                        <span>Progress: <b className="text-blue-600">{sc.progress}%</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Live Trip Panel */}
                  <div className="w-52 flex-shrink-0 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
                    <div className="px-4 py-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1e3a8a,#0c4a6e)' }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Active Trip</span>
                      </div>
                      <div className="mono text-xs font-bold text-white">TRIP-{ride.id.replace('RIDE-','')}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1.5 text-xs">
                      {[['Company',ride.org],['Driver',ride.driver],['Vehicle',ride.vehicle],['Passengers',`${ride.passengers}/6`],['Current Loc',ride.status === 'Completed' ? ride.drop : 'Baner'],['Destination',ride.drop],['ETA',ride.status === 'Completed' ? 'Arrived' : '08 min'],['Status',ride.status]].map(([l,v]) => (
                        <div key={l} className="flex justify-between items-start border-b border-slate-50 pb-1">
                          <span className="text-slate-400 flex-shrink-0">{l}</span>
                          <span className={`font-semibold text-right ml-2 ${l === 'Vehicle' ? 'mono text-blue-600 text-[10px]' : l === 'Status' ? (ride.status === 'SOS' ? 'text-red-600' : ride.status === 'Delayed' ? 'text-amber-600' : ride.status === 'Completed' ? 'text-green-600' : 'text-blue-600') : 'text-slate-800'}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 flex-shrink-0 border-t border-slate-100">
                      <button className="w-full py-1.5 text-[10px] font-bold text-white rounded-lg" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>Track Live</button>
                    </div>
                  </div>
                </div>

                {/* ETA Intelligence */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">ETA Intelligence</h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-6 items-start">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-2">
                        <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">Current ETA</div><div className="text-2xl font-bold text-slate-900 mono">08 <span className="text-sm font-normal text-slate-400">min</span></div></div>
                        <div><div className="text-[10px] text-slate-400 uppercase tracking-wide">Original</div><div className="text-base font-semibold text-slate-400 mono line-through">12 min</div></div>
                        <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">↓ Improved 4 min</div>
                      </div>
                      <div className="text-xs text-slate-500">Updated: 10:28 PM · Reason: Traffic congestion cleared</div>
                    </div>
                    <div className="w-52 flex-shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">ETA History</div>
                      <svg viewBox="0 0 200 72" className="w-full h-16">
                        <path d={etaPath} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                        {etaPoints.map((p, i) => (
                          <g key={i}>
                            <circle cx={p.x} cy={p.y} r="3.5" fill="#3b82f6" />
                            <text x={p.x} y="70" textAnchor="middle" fontSize="7" fill="#94a3b8">{etaHistory[i].val}m</text>
                          </g>
                        ))}
                      </svg>
                      <div className="flex justify-between text-[9px] text-slate-400">
                        {etaHistory.map(e => <span key={e.time}>{e.time}</span>)}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Trip Replay (completed only) */}
                {ride.status === 'Completed' && (
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trip Replay</h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => { if (replayProgress >= 100) setReplayProgress(0); setReplayPlaying(p => !p); }}
                          className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors" style={{ background: replayPlaying ? '#dc2626' : 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>
                          {replayPlaying ? '⏸ Pause' : replayProgress >= 100 ? '↻ Replay' : replayProgress > 0 ? '▶ Resume' : '▶ Play'}
                        </button>
                        <button onClick={() => { setReplayProgress(0); setReplayPlaying(false); }} className="px-3 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">↻ Reset</button>
                        <div className="flex items-center gap-2 text-xs text-slate-500 flex-1">
                          <span className="mono flex-shrink-0">08:00</span>
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${replayProgress}%` }} />
                          </div>
                          <span className="mono flex-shrink-0">08:42</span>
                        </div>
                        <span className="text-xs text-slate-400 mono">{replayProgress}%</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        {['08:00 Start','08:10 Pickup','08:22 Chandani','08:35 Wakad','08:42 Arrived'].map(s => (
                          <span key={s} className="flex flex-col items-center gap-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {activeTab === 'activity' && (
              <>
                {/* Lifecycle */}
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Ride Lifecycle</h3>
                  <div className="flex items-start overflow-x-auto pb-2">
                    {lifecycleSteps.map((step, i) => {
                      const done = i < completedCount;
                      const current = i === completedCount - 1 && ride.status !== 'Completed';
                      return (
                        <div key={step.label} className="flex items-center">
                          <div className="flex flex-col items-center min-w-[78px]">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${done ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-400'} ${current ? 'ring-2 ring-blue-300 ring-offset-1' : ''}`}>
                              {done ? '✓' : i + 1}
                            </div>
                            <div className={`text-[10px] font-semibold mt-1.5 text-center leading-tight ${done ? 'text-slate-700' : 'text-slate-300'}`}>{step.label}</div>
                            {step.time && done && <div className="text-[9px] mono text-slate-400 mt-0.5">{step.time}</div>}
                          </div>
                          {i < lifecycleSteps.length - 1 && <div className={`h-0.5 mx-1 transition-all ${i < completedCount - 1 ? 'bg-blue-300' : 'bg-slate-100'}`} style={{ minWidth: 20, width: 24 }} />}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Live Activity Feed */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Activity</h3>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 pulse-dot" /> LIVE
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {activityEvents.map((ev, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 border ${ev.bg}`}>
                            <span className={ev.color}>{ev.icon}</span>
                          </div>
                          {i < activityEvents.length - 1 && <div className="w-px bg-slate-100 my-1" style={{ minHeight: 12 }} />}
                        </div>
                        <div className="pb-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-800">{ev.msg}</span>
                            <span className="text-[10px] mono text-slate-400 ml-auto">{ev.time}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{ev.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Audit Trail */}
                <section>
                  <button onClick={() => setAuditOpen(a => !a)} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors w-full">
                    <span>Audit Trail</span><span>{auditOpen ? '▲' : '▼'}</span>
                  </button>
                  {auditOpen && (
                    <div className="mt-2 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100">
                            {['Actor','Action','Time','Result'].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[['Admin','Viewed live location','10:24 PM','Allowed'],['Ops Manager','Viewed driver info','10:20 PM','Allowed'],['Admin','ETA viewed','10:15 PM','Allowed'],['System','Incident accessed','10:05 PM','Allowed']].map(([actor,action,time,result],i) => (
                            <tr key={i} className="border-b border-slate-50">
                              <td className="px-3 py-2 font-medium text-slate-700">{actor}</td>
                              <td className="px-3 py-2 text-slate-500">{action}</td>
                              <td className="px-3 py-2 mono text-slate-400">{time}</td>
                              <td className="px-3 py-2 font-semibold text-green-600">{result}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}

            {activeTab === 'safety' && (
              <>
                {ride.status === 'SOS' ? (
                  <>
                    <section className="bg-red-50 border border-red-200 rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl pulse-dot">🚨</span>
                        <div>
                          <div className="text-base font-bold text-red-800">SOS INCIDENT ACTIVE</div>
                          <div className="text-xs text-red-500">Incident ID: INC-20438 · Severity: HIGH · Status: ACTIVE</div>
                        </div>
                        <span className="ml-auto text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-600 text-white pulse-dot">LIVE</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2.5 text-xs mb-4">
                        {[['Employee','Priya Sharma'],['Company',ride.org],['Driver',ride.driver],['Vehicle',ride.vehicle],['Location',ride.pickup],['Alert Time','22:42 PM'],['Severity','HIGH'],['Owner','Security Team'],['Status','ACTIVE']].map(([l,v]) => (
                          <div key={l} className="bg-white rounded-lg px-3 py-2 border border-red-100">
                            <div className="text-[10px] text-slate-400">{l}</div>
                            <div className={`font-semibold ${l === 'Severity' || l === 'Status' ? 'text-red-700' : 'text-slate-800'}`}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {['Track Live','Call Driver','Call Employee','Contact Security','Resolve Incident'].map(btn => (
                          <button key={btn} className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${btn === 'Resolve Incident' ? 'bg-green-600 text-white hover:bg-green-700' : btn.includes('Track') || btn.includes('Call') ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
                            {btn}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Incident Timeline</h3>
                      <div className="space-y-2">
                        {[
                          { time:'22:42 PM', event:'SOS Alert Triggered', sub:'Employee pressed SOS button', icon:'🚨', color:'text-red-600' },
                          { time:'22:43 PM', event:'Operations Team Notified', sub:'Email + push notification sent', icon:'📢', color:'text-amber-600' },
                          { time:'22:44 PM', event:'Driver Contacted', sub:'Driver confirmed via phone', icon:'📞', color:'text-blue-600' },
                          { time:'22:46 PM', event:'Location Verified', sub:'GPS coordinates confirmed', icon:'📍', color:'text-blue-500' },
                          { time:'—', event:'Incident Resolution Pending', sub:'Security team en route', icon:'⏳', color:'text-slate-400' },
                        ].map((ev, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className={`w-6 text-center text-sm mt-0.5 ${ev.color}`}>{ev.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2"><span className="text-xs font-semibold text-slate-800">{ev.event}</span><span className="text-[10px] mono text-slate-400 ml-auto">{ev.time}</span></div>
                              <div className="text-[11px] text-slate-400">{ev.sub}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Emergency Break-Glass Access</h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="text-xs text-amber-800 mb-3">Emergency access grants temporary authorization for active safety incident investigation. All access is logged.</div>
                        <button onClick={() => setShowEmergency(true)} className="px-4 py-2 text-xs font-bold text-amber-800 border border-amber-300 bg-white rounded-xl hover:bg-amber-50 transition-colors">
                          🔐 Request Emergency Access
                        </button>
                      </div>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="text-sm font-semibold text-green-800">No Active Incidents</div>
                        <div className="text-xs text-green-600">This ride has no active safety events.</div>
                      </div>
                    </section>
                    <section>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Safety Actions</h3>
                      <div className="flex gap-2 flex-wrap">
                        {['Report Accident','Report Breakdown','Create Incident','Share Location'].map(btn => (
                          <button key={btn} className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors">{btn}</button>
                        ))}
                      </div>
                    </section>
                  </>
                )}
              </>
            )}

            {activeTab === 'billing' && (
              <>
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trip Cost</h3>
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    {[['Base Trip Cost','₹350'],['Distance Cost','₹50'],['Additional Charges','₹20']].map(([l,v]) => (
                      <div key={l} className="flex justify-between items-center text-xs py-2 border-b border-slate-50">
                        <span className="text-slate-500">{l}</span><span className="font-medium mono text-slate-800">{v}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm font-bold pt-1">
                      <span className="text-slate-900">Total</span><span className="text-blue-600 mono">{ride.cost}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Billing</h3>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs space-y-2">
                    {[['Billing Status','Generated'],['Invoice','INV-2026-' + ride.id.replace('RIDE-','')],['Organization',ride.org],['Due Date','30 Sep 2026']].map(([l,v]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-slate-500">{l}</span>
                        <span className={`font-semibold ${l === 'Invoice' ? 'mono text-blue-600' : 'text-slate-800'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50">View Invoice</button>
                    <button onClick={() => setShowExport(true)} className="px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700">Export</button>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Attendance</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[['Employee',String(ride.passengers),'👥'],['Boarded',String(ride.passengers),'✅'],['Absent','0','❌'],['OTP Verified',String(ride.passengers),'🔐']].map(([l,v,icon]) => (
                      <div key={l} className="bg-white border border-slate-100 rounded-xl px-4 py-3 text-center">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{icon} {l}</div>
                        <div className="text-lg font-bold text-slate-900 mono mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-semibold text-green-700">✓ Attendance Complete</div>
                </section>

                {ride.status === 'Completed' && (
                  <section>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Feedback & Rating</h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl font-bold text-yellow-500">★ 4.8</div>
                        <div><div className="text-xs font-semibold text-slate-700">Driver Rating</div><div className="text-[10px] text-slate-400">4 employee responses</div></div>
                        <button className="ml-auto text-xs text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50">View Feedback</button>
                      </div>
                      <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 italic">"Smooth and comfortable ride. Driver was punctual and professional."</div>
                    </div>
                  </section>
                )}

                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Ride Analytics</h3>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[['Actual Duration','40 min','🕐'],['Expected Duration','42 min','⏱'],['ETA Accuracy','96%','📊'],['Route Deviation','0.8 km','🛣'],['Average Speed','32 km/h','🚗'],['Efficiency','95%','⚡']].map(([l,v,icon]) => (
                      <div key={l} className="bg-white border border-slate-100 rounded-xl px-3 py-2.5">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wide">{icon} {l}</div>
                        <div className="font-bold text-slate-900 mono mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>🤖</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-800 mb-0.5">Ask Shivneri AI About This Ride</div>
                      <div className="text-xs text-slate-500">Why delayed? · Driver location? · ETA change? · Show ride history</div>
                    </div>
                    <button className="px-4 py-2 text-xs font-bold text-white rounded-xl flex-shrink-0 hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>Ask AI</button>
                  </div>
                </section>
              </>
            )}
          </div>

          {/* ── Sticky Footer ── */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">Close</button>
            <div className="flex gap-2 flex-wrap">
              {smartActions().map(a => (
                <button key={a.label} onClick={a.action} className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors ${a.cls}`}>{a.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      {showShare && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowShare(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 dialog-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">Share Ride Status</h3>
              <button onClick={() => setShowShare(false)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Recipient (Phone / Email)</label>
                <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400" placeholder="Enter phone or email" />
              </div>
              <div>
                <div className="text-slate-500 mb-1.5">Share</div>
                {['Current Location','ETA','Driver','Vehicle','Route'].map(item => (
                  <label key={item} className="flex items-center gap-2 py-0.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" /><span className="text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Expiry</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                  <option>15 minutes</option><option>30 minutes</option><option>1 hour</option>
                </select>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">Shared links automatically expire and are revocable at any time.</div>
              <button className="w-full py-2.5 text-xs font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#1d4ed8,#0891b2)' }}>Generate Secure Link</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Dialog */}
      {showExport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowExport(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 dialog-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-slate-900">Export Ride Summary</h3>
              <button onClick={() => setShowExport(false)} className="text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {['PDF','CSV'].map(fmt => (
                  <button key={fmt} className="py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors">{fmt}</button>
                ))}
              </div>
              <div>
                <div className="text-slate-500 mb-1.5">Include</div>
                {['Ride Information','Driver','Vehicle','Passengers','Route','Timeline','Cost','Incidents','Audit Information'].map(item => (
                  <label key={item} className="flex items-center gap-2 py-0.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded" /><span className="text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
              <button className="w-full py-2.5 text-xs font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg,#16a34a,#15803d)' }}>Export Ride Summary</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Access Dialog */}
      {showEmergency && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }} onClick={() => setShowEmergency(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 dialog-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl flex-shrink-0">🔐</div>
              <div><h3 className="text-sm font-bold text-slate-900">Emergency Access</h3><p className="text-xs text-slate-400">Active SOS incident investigation</p></div>
              <button onClick={() => setShowEmergency(false)} className="ml-auto text-slate-400 hover:text-slate-700 text-sm">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="text-amber-700 font-semibold mb-1">Access Level: Emergency</div>
                <div className="text-amber-600">Reason: Active SOS incident — {ride.id}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1.5">Access granted to</div>
                {[['✓','Live Location','green'],['✓','Driver Information','green'],['✓','Employee Emergency Contact','green'],['✗','Billing Information','red'],['✗','Unrelated Employee Data','red']].map(([check,item,color]) => (
                  <div key={item} className="flex items-center gap-2 py-0.5">
                    <span className={`font-bold ${color === 'green' ? 'text-green-600' : 'text-red-400'}`}>{check}</span>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Duration</label>
                <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none">
                  <option>15 minutes</option><option>30 minutes</option><option>60 minutes</option>
                </select>
              </div>
              <div className="text-[10px] text-slate-400 bg-slate-50 rounded-lg px-3 py-2">All emergency access is logged and audited.</div>
              <div className="flex gap-2">
                <button onClick={() => setShowEmergency(false)} className="flex-1 py-2 text-xs font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">Cancel</button>
                <button onClick={() => setShowEmergency(false)} className="flex-1 py-2 text-xs font-bold text-white rounded-xl" style={{ background: '#dc2626' }}>Request Access</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Note: RoutesView component is imported from ./components/RoutesView

// ─── Approvals ────────────────────────────────────────────────────────────────
type ApprovalReq = {
  id: string; requester: string; permission: string; resource: string;
  reason: string; duration: string; risk: string; approvers: string[];
  created: string; category: string;
};

const ALL_REQUESTS: ApprovalReq[] = [
  { id: 'REQ-001', requester: 'Priya Sharma',    permission: 'employee.data.export',    resource: 'Dept: Engineering',     reason: 'Monthly compliance report for auditors',                  duration: '24 hours',  risk: 'High',     approvers: ['Akshat Gupta', 'Rahul Joshi'], created: '2024-09-23 16:42', category: 'Pending Access Requests' },
  { id: 'REQ-002', requester: 'Vijay Patil',     permission: 'recording.view',          resource: 'REC-20240919-001',       reason: 'Investigating harassment complaint INC-2024-0889',         duration: '2 hours',   risk: 'Critical', approvers: ['Security Manager'],            created: '2024-09-23 15:30', category: 'Emergency Access' },
  { id: 'REQ-003', requester: 'Sneha Kulkarni',  permission: 'billing.invoice.approve', resource: 'INV-2024-0890',          reason: 'Finance manager on leave, need temporary access',          duration: '8 hours',   risk: 'Medium',   approvers: ['Akshat Gupta'],                created: '2024-09-23 14:18', category: 'Billing Approval' },
  { id: 'REQ-004', requester: 'Arjun Nair',      permission: 'route.create',            resource: 'TCS Pune — Zone B',      reason: 'New employee batch joining next week',                     duration: 'Permanent', risk: 'Low',      approvers: ['Transport Manager'],           created: '2024-09-23 12:55', category: 'Pending Access Requests' },
  { id: 'REQ-005', requester: 'Karan Mehta',     permission: 'sos.override',            resource: 'All Zones',              reason: 'Emergency drill scheduled for tonight',                   duration: '3 hours',   risk: 'Critical', approvers: ['Security Manager'],            created: '2024-09-23 11:40', category: 'Emergency Access' },
  { id: 'REQ-006', requester: 'Divya Rao',       permission: 'vehicle.assign',          resource: 'MH12AB1234',             reason: 'Replacement vehicle needed for Route RT-003',             duration: '7 days',    risk: 'Medium',   approvers: ['Fleet Manager'],               created: '2024-09-23 10:22', category: 'Vehicle Approval' },
  { id: 'REQ-007', requester: 'Rahul Sinha',     permission: 'driver.verify',           resource: 'DRV-007 Prakash Verma', reason: 'New driver onboarding — documents submitted',             duration: 'Permanent', risk: 'Low',      approvers: ['Driver Supervisor'],           created: '2024-09-23 09:55', category: 'Driver Verification' },
  { id: 'REQ-008', requester: 'Meena Joshi',     permission: 'employee.pii.view',       resource: 'EMP-4821',               reason: 'HR investigation requires PII access',                    duration: '48 hours',  risk: 'High',     approvers: ['HR Manager', 'Security Manager'], created: '2024-09-22 17:10', category: 'Sensitive Permissions' },
  { id: 'REQ-009', requester: 'Ankit Sharma',    permission: 'billing.export',          resource: 'Infosys BPM Ltd',        reason: 'Quarterly billing reconciliation',                        duration: '24 hours',  risk: 'Medium',   approvers: ['Akshat Gupta'],                created: '2024-09-22 15:30', category: 'Billing Approval' },
  { id: 'REQ-010', requester: 'Kavita Nair',     permission: 'recording.delete',        resource: 'REC-20240818-002',       reason: 'GDPR deletion request from employee',                     duration: 'One-time',  risk: 'High',     approvers: ['Security Manager'],            created: '2024-09-22 14:00', category: 'Sensitive Permissions' },
  { id: 'REQ-011', requester: 'Suresh Bhat',     permission: 'vehicle.assign',          resource: 'MH12CD5678',             reason: 'Additional vehicle for peak demand zone',                 duration: '3 days',    risk: 'Low',      approvers: ['Fleet Manager'],               created: '2024-09-22 11:30', category: 'Vehicle Approval' },
  { id: 'REQ-012', requester: 'Pooja Verma',     permission: 'driver.verify',           resource: 'DRV-008 Ramesh Gupta',  reason: 'License renewal — new docs uploaded',                    duration: 'Permanent', risk: 'Low',      approvers: ['Driver Supervisor'],           created: '2024-09-22 10:00', category: 'Driver Verification' },
];

function ApprovalsView() {
  type Status = 'pending' | 'approved' | 'rejected' | 'changes';
  const [statuses, setStatuses]       = useState<Record<string, Status>>({});
  const [activeCategory, setActiveCat] = useState('Pending Access Requests');
  const [selectedId, setSelectedId]   = useState('REQ-001');
  const [changeNote, setChangeNote]   = useState('');
  const [showChangeInput, setShowChangeInput] = useState(false);
  const [actionFeedback, setActionFeedback]   = useState('');

  const categories = [
    { label: 'Pending Access Requests', icon: '🔐', color: 'blue' },
    { label: 'Emergency Access',        icon: '🚨', color: 'red' },
    { label: 'Sensitive Permissions',   icon: '🛡️', color: 'amber' },
    { label: 'Vehicle Approval',        icon: '🚌', color: 'cyan' },
    { label: 'Driver Verification',     icon: '👤', color: 'green' },
    { label: 'Billing Approval',        icon: '💳', color: 'slate' },
  ];

  const filtered = ALL_REQUESTS.filter(r => r.category === activeCategory);
  const pendingInCat = filtered.filter(r => !statuses[r.id] || statuses[r.id] === 'pending');
  const resolvedInCat = filtered.filter(r => statuses[r.id] && statuses[r.id] !== 'pending');

  const catCount = (cat: string) => ALL_REQUESTS.filter(r => r.category === cat && (!statuses[r.id] || statuses[r.id] === 'pending')).length;

  const req = ALL_REQUESTS.find(r => r.id === selectedId) ?? ALL_REQUESTS[0];
  const reqStatus = statuses[req.id] ?? 'pending';

  const riskColor = (r: string): 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'cyan' =>
    r === 'Critical' ? 'red' : r === 'High' ? 'amber' : r === 'Medium' ? 'blue' : 'green';

  const act = (id: string, status: Status, feedback: string) => {
    setStatuses(prev => ({ ...prev, [id]: status }));
    setActionFeedback(feedback);
    setShowChangeInput(false);
    setChangeNote('');
    setTimeout(() => setActionFeedback(''), 2500);
    const next = filtered.find(r => r.id !== id && (!statuses[r.id] || statuses[r.id] === 'pending'));
    if (next) setTimeout(() => setSelectedId(next.id), 400);
  };

  const catColor = (c: string) => c === 'red' ? 'bg-red-100 text-red-700' : c === 'amber' ? 'bg-amber-100 text-amber-700' : c === 'green' ? 'bg-green-100 text-green-700' : c === 'cyan' ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="flex h-full slide-in overflow-hidden">
      {/* Left sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">Categories</h3>
          <div className="space-y-0.5">
            {categories.map(cat => {
              const count = catCount(cat.label);
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => {
                    setActiveCat(cat.label);
                    const first = ALL_REQUESTS.find(r => r.category === cat.label);
                    if (first) setSelectedId(first.id);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.icon}</span>
                    <span className={`text-xs ${isActive ? 'text-blue-700 font-medium' : 'text-slate-700'}`}>{cat.label}</span>
                  </div>
                  {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${catColor(cat.color)}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 px-1">Pending Requests</h4>
          <div className="space-y-2">
            {pendingInCat.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400">All requests resolved ✓</div>
            )}
            {pendingInCat.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${selectedId === r.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="mono text-[10px] text-slate-400">{r.id}</span>
                  <Badge label={r.risk} color={riskColor(r.risk)} />
                </div>
                <div className="text-xs font-medium text-slate-800">{r.requester}</div>
                <div className="mono text-[10px] text-blue-600 mt-0.5">{r.permission}</div>
                <div className="text-[10px] text-slate-400 mt-1">{r.created}</div>
              </button>
            ))}
          </div>

          {resolvedInCat.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1 mt-4">Resolved</h4>
              <div className="space-y-1">
                {resolvedInCat.map(r => (
                  <button key={r.id} onClick={() => setSelectedId(r.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 border transition-all ${selectedId === r.id ? 'border-blue-200 bg-blue-50' : 'border-transparent hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="mono text-[10px] text-slate-400">{r.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${statuses[r.id] === 'approved' ? 'bg-green-100 text-green-700' : statuses[r.id] === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {statuses[r.id]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{r.requester}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
        {actionFeedback && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 slide-in ${actionFeedback.includes('Approved') ? 'bg-green-50 border border-green-200 text-green-700' : actionFeedback.includes('Rejected') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
            {actionFeedback}
          </div>
        )}

        <div className={`bg-white rounded-xl border p-6 mb-4 ${reqStatus === 'approved' ? 'border-green-200' : reqStatus === 'rejected' ? 'border-red-200' : reqStatus === 'changes' ? 'border-amber-200' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-semibold text-slate-900">Access Request — {req.id}</h2>
                <Badge label={req.risk + ' Risk'} color={riskColor(req.risk)} />
                {reqStatus !== 'pending' && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${reqStatus === 'approved' ? 'bg-green-100 text-green-700' : reqStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                    {reqStatus.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mono">{req.created}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {[
              { label: 'Requester',            value: req.requester   },
              { label: 'Requested Permission', value: req.permission  },
              { label: 'Resource',             value: req.resource    },
              { label: 'Duration',             value: req.duration    },
            ].map(f => (
              <div key={f.label} className="bg-slate-50 rounded-lg p-3">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{f.label}</div>
                <div className="text-sm font-medium text-slate-800 mono">{f.value}</div>
              </div>
            ))}
          </div>

          <div className="mb-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Reason</div>
            <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700">{req.reason}</div>
          </div>

          <div className="mb-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">Required Approvers</div>
            <div className="flex flex-wrap gap-2">
              {req.approvers.map(a => (
                <div key={a} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">{a[0]}</div>
                  <span className="text-xs text-blue-700">{a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-3">Approval Timeline</div>
            <div className="space-y-2">
              {[
                { label: 'Request submitted',   done: true },
                { label: 'Routing to approvers', done: true },
                { label: reqStatus === 'approved' ? 'Approved ✓' : reqStatus === 'rejected' ? 'Rejected ✗' : reqStatus === 'changes' ? 'Changes Requested' : 'Awaiting approval', done: reqStatus !== 'pending', pending: reqStatus === 'pending' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${step.done && reqStatus === 'approved' && i === 2 ? 'bg-green-500 text-white' : step.done && reqStatus === 'rejected' && i === 2 ? 'bg-red-500 text-white' : step.done && reqStatus === 'changes' && i === 2 ? 'bg-amber-500 text-white' : step.done ? 'bg-green-500 text-white' : 'bg-amber-400 text-white'}`}>
                    {step.done ? '✓' : '…'}
                  </div>
                  <span className="text-xs text-slate-700">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          {showChangeInput && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Describe the required changes</label>
              <textarea
                value={changeNote}
                onChange={e => setChangeNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-200 bg-amber-50"
                placeholder="What needs to be updated before this can be approved?"
              />
            </div>
          )}

          {reqStatus === 'pending' ? (
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => act(req.id, 'approved', `✓ ${req.id} approved — access granted to ${req.requester}`)} className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                ✓ Approve
              </button>
              <button onClick={() => act(req.id, 'rejected', `✗ ${req.id} rejected — ${req.requester} denied access`)} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors">
                ✗ Reject
              </button>
              <button
                onClick={() => {
                  if (showChangeInput && changeNote.trim()) {
                    act(req.id, 'changes', `⚠ Changes requested on ${req.id} — sent back to ${req.requester}`);
                  } else {
                    setShowChangeInput(v => !v);
                  }
                }}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
              >
                {showChangeInput ? (changeNote.trim() ? 'Send Request' : 'Cancel') : 'Request Changes'}
              </button>
            </div>
          ) : (
            <div className={`pt-4 border-t border-slate-100 flex items-center justify-between`}>
              <div className={`text-sm font-semibold ${reqStatus === 'approved' ? 'text-green-700' : reqStatus === 'rejected' ? 'text-red-700' : 'text-amber-700'}`}>
                {reqStatus === 'approved' ? '✓ Request approved' : reqStatus === 'rejected' ? '✗ Request rejected' : '⚠ Changes requested'}
              </div>
              <button
                onClick={() => setStatuses(prev => { const n = { ...prev }; delete n[req.id]; return n; })}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
              >
                Reset to Pending
              </button>
            </div>
          )}
        </div>

        {/* Access denied transparency panel */}
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">🚫</div>
            <div>
              <h3 className="text-sm font-semibold text-red-700">Access Transparency — Denial Preview</h3>
              <p className="text-xs text-slate-400">What {req.requester} sees if this request is rejected</p>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-sm font-semibold text-red-800 mb-1">You don't have permission to access <span className="mono">{req.permission}</span>.</div>
            <div className="text-xs text-red-600 mb-2"><span className="font-medium">Reason:</span> Your role does not include this permission or your request was rejected.</div>
            <div className="text-xs text-red-500 mb-3"><span className="font-medium">Resource:</span> {req.resource}</div>
            <button onClick={() => setStatuses(prev => ({ ...prev, [req.id]: 'pending' }))} className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold">Request Access Again →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
// ─── Settings helpers ─────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

function SettingRow({ label, desc, on, onChange }: { label: string; desc?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function SaveBar({ dirty, saving, saved, onSave, onDiscard }: {
  dirty: boolean; saving: boolean; saved: boolean; onSave: () => void; onDiscard: () => void;
}) {
  if (!dirty && !saved) return null;
  return (
    <div className={`flex items-center gap-3 mt-5 px-4 py-3 rounded-xl border ${saved ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
      {saved ? (
        <>
          <span className="text-green-600 text-sm">✓</span>
          <span className="text-sm text-green-700 font-medium">Changes saved successfully.</span>
        </>
      ) : (
        <>
          <span className="text-sm text-blue-700 font-medium flex-1">You have unsaved changes.</span>
          <button onClick={onDiscard} className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100">Discard</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </>
      )}
    </div>
  );
}

function SettingsView() {
  type Section = 'Organization' | 'Branding' | 'Security' | 'MFA & SSO' | 'Notifications' | 'Privacy' | 'API Keys' | 'Webhooks' | 'Integrations';
  const [section, setSection] = useState<Section>('Organization');

  // Save state helper
  const useSaveState = () => {
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const markDirty = () => { setDirty(true); setSaved(false); };
    const save = () => {
      setSaving(true);
      setTimeout(() => { setSaving(false); setSaved(true); setDirty(false); setTimeout(() => setSaved(false), 3000); }, 900);
    };
    const discard = () => { setDirty(false); setSaved(false); };
    return { dirty, saving, saved, markDirty, save, discard };
  };

  // ── Organization
  const [org, setOrg] = useState({ name: 'SHIVNERI Transport Platform', adminEmail: 'admin@shivneri.in', supportEmail: 'support@shivneri.in', region: 'ap-south-1 (Mumbai)', residency: 'India', timezone: 'IST (UTC+5:30)', fiscalYear: 'April–March' });
  const orgSave = useSaveState();

  // ── Branding
  const [brand, setBrand] = useState({ primaryColor: '#1d4ed8', accentColor: '#0891b2', logoText: 'SHIVNERI', tagline: 'Intelligent Fleet. Trusted Commute.' });
  const brandSave = useSaveState();

  // ── Security toggles
  const [sec, setSec] = useState({ ipAllowlist: true, auditLog: true, deviceTrust: false, sessionBinding: true, twoFactorAdmin: true, autoLogout: false });
  const [secSel, setSecSel] = useState({ timeout: '30 minutes', policy: 'Strong (12+ chars, mixed)', lockAttempts: '5 attempts', encryption: 'AES-256-GCM' });
  const secSave = useSaveState();

  // ── MFA
  const [mfa, setMfa] = useState({ totpEnabled: true, smsEnabled: false, emailOtp: true, hardwareKey: false, ssoEnabled: true, ssoProvider: 'Google Workspace', samlEnabled: false });
  const mfaSave = useSaveState();

  // ── Notifications
  const [notif, setNotif] = useState({
    emailSOS: true, smsSOS: true, pushSOS: true,
    emailIncident: true, smsIncident: false, pushIncident: true,
    emailReports: false, emailDigest: true, emailBilling: true,
    pushLiveOps: true, smsDriverAlert: true,
  });
  const notifSave = useSaveState();

  // ── Privacy
  const [priv, setPriv] = useState({ gdprMode: true, retentionDays: '365', anonymizeAfter: '90', locationRetain: '30', exportRequests: true, dataMinimization: true, consentTracking: true });
  const privSave = useSaveState();

  // ── API Keys
  type ApiKey = { id: string; name: string; prefix: string; created: string; lastUsed: string; expiry: string; status: string; ip: string; rateLimit: string; revokeConfirm?: boolean };
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production API Key',    prefix: 'shv_prod_xK9mZ…', created: '2024-01-15', lastUsed: '2024-09-23', expiry: '2025-01-15', status: 'Active',  ip: '10.0.0.0/8',       rateLimit: '10,000/hr' },
    { id: '2', name: 'Webhook Signing Key',   prefix: 'shv_whk_aB3qR…', created: '2024-03-01', lastUsed: '2024-09-22', expiry: 'Never',      status: 'Active',  ip: 'Any',              rateLimit: 'Unlimited' },
    { id: '3', name: 'Reporting Integration', prefix: 'shv_rpt_yL7nW…', created: '2024-06-10', lastUsed: '2024-09-20', expiry: '2024-12-10', status: 'Active',  ip: '192.168.1.0/24',   rateLimit: '1,000/hr' },
    { id: '4', name: 'Legacy Mobile Key',     prefix: 'shv_mob_cD5xP…', created: '2023-08-01', lastUsed: '2024-07-30', expiry: '2024-08-01', status: 'Expired', ip: 'Any',              rateLimit: '500/hr' },
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showGenKey, setShowGenKey] = useState(false);
  const [genKeyName, setGenKeyName] = useState('');
  const [newKey, setNewKey] = useState<string | null>(null);

  const copyKey = (id: string) => { setCopiedKey(id); setTimeout(() => setCopiedKey(null), 2000); };
  const revokeKey = (id: string) => setApiKeys(prev => prev.map(k => k.id === id ? { ...k, status: 'Revoked', revokeConfirm: false } : k));
  const setRevokeConfirm = (id: string, v: boolean) => setApiKeys(prev => prev.map(k => k.id === id ? { ...k, revokeConfirm: v } : k));
  const generateKey = () => {
    if (!genKeyName.trim()) return;
    const prefix = 'shv_new_' + Math.random().toString(36).slice(2, 8) + '…';
    const fullKey = 'shv_new_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
    setApiKeys(prev => [{
      id: String(Date.now()), name: genKeyName.trim(), prefix, created: new Date().toISOString().slice(0, 10),
      lastUsed: '—', expiry: 'Never', status: 'Active', ip: 'Any', rateLimit: '1,000/hr',
    }, ...prev]);
    setNewKey(fullKey);
    setGenKeyName('');
  };

  // ── Webhooks
  const [hooks, setHooks] = useState([
    { id: '1', url: 'https://api.example.com/webhooks/shivneri', events: ['sos.triggered', 'ride.completed', 'incident.created'], active: true, secret: 'whsec_…' },
    { id: '2', url: 'https://slack.com/api/webhook/T0ABC/BxYZ', events: ['sos.triggered'], active: true, secret: 'whsec_…' },
  ]);
  const [hookUrl, setHookUrl] = useState('');
  const webhookEvents = ['sos.triggered', 'ride.started', 'ride.completed', 'incident.created', 'driver.verified', 'employee.added', 'policy.violated'];
  const [hookEvents, setHookEvents] = useState<string[]>(['sos.triggered']);
  const hookSave = useSaveState();

  // ── Integrations
  const [integrations, setIntegrations] = useState([
    { id: '1', name: 'Google Workspace', desc: 'Sync employees and calendar events', icon: '🔷', status: 'Connected', category: 'Identity' },
    { id: '2', name: 'Slack',            desc: 'SOS and incident alerts to channels',  icon: '💬', status: 'Connected', category: 'Communication' },
    { id: '3', name: 'Jira',             desc: 'Auto-create tickets from incidents',    icon: '🔵', status: 'Disconnected', category: 'Ticketing' },
    { id: '4', name: 'AWS S3',           desc: 'Archive trip recordings and reports',   icon: '☁', status: 'Connected', category: 'Storage' },
    { id: '5', name: 'Razorpay',         desc: 'Payment gateway for billing',           icon: '💳', status: 'Connected', category: 'Payments' },
    { id: '6', name: 'Twilio',           desc: 'SMS notifications and driver OTP',      icon: '📱', status: 'Disconnected', category: 'Communication' },
    { id: '7', name: 'PagerDuty',        desc: 'On-call escalation for SOS events',     icon: '🚨', status: 'Disconnected', category: 'Alerting' },
    { id: '8', name: 'Datadog',          desc: 'Infrastructure and performance metrics', icon: '📊', status: 'Connected', category: 'Observability' },
  ]);

  const toggleIntegration = (id: string) =>
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'Connected' ? 'Disconnected' : 'Connected' } : i));

  const SECTION_NAV: { id: Section; icon: string }[] = [
    { id: 'Organization', icon: '🏢' },
    { id: 'Branding',     icon: '🎨' },
    { id: 'Security',     icon: '🔒' },
    { id: 'MFA & SSO',   icon: '🔑' },
    { id: 'Notifications',icon: '🔔' },
    { id: 'Privacy',      icon: '🛡' },
    { id: 'API Keys',     icon: '⚙' },
    { id: 'Webhooks',     icon: '🔗' },
    { id: 'Integrations', icon: '🔌' },
  ];

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400";
  const selectCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
  const cardCls = "bg-white rounded-xl border border-slate-200 p-6 mb-4";

  return (
    <div className="flex h-full slide-in overflow-hidden">
      {/* Left nav */}
      <div className="w-56 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Settings</div>
        </div>
        <div className="p-3">
          {SECTION_NAV.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg mb-0.5 text-xs font-medium transition-all flex items-center gap-2.5 ${section === s.id ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}
            >
              <span className="text-sm">{s.icon}</span>
              {s.id}
            </button>
          ))}
        </div>
        <div className="p-4 mx-3 mb-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="text-[10px] font-semibold text-slate-500 mb-1">Platform Version</div>
          <div className="text-xs text-slate-700 font-medium mono">v3.14.2</div>
          <div className="text-[10px] text-green-600 mt-0.5">● All systems operational</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
        {/* ── Organization ── */}
        {section === 'Organization' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Organization Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Core platform configuration and regional settings</p>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Platform Identity</h3>
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {([
                  { k: 'name',         label: 'Platform Name',    type: 'input' },
                  { k: 'adminEmail',   label: 'Admin Email',      type: 'input' },
                  { k: 'supportEmail', label: 'Support Email',    type: 'input' },
                  { k: 'timezone',     label: 'Timezone',         type: 'select', opts: ['IST (UTC+5:30)', 'UTC', 'US/Eastern'] },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label className={labelCls}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select className={selectCls} value={(org as any)[f.k]} onChange={e => { setOrg(o => ({ ...o, [f.k]: e.target.value })); orgSave.markDirty(); }}>
                        {(f as any).opts.map((o: string) => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input className={inputCls} value={(org as any)[f.k]} onChange={e => { setOrg(o => ({ ...o, [f.k]: e.target.value })); orgSave.markDirty(); }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Infrastructure & Compliance</h3>
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {([
                  { k: 'region',     label: 'Primary Region',   type: 'select', opts: ['ap-south-1 (Mumbai)', 'ap-southeast-1 (Singapore)', 'us-east-1 (Virginia)'] },
                  { k: 'residency',  label: 'Data Residency',   type: 'select', opts: ['India', 'Singapore', 'USA', 'EU'] },
                  { k: 'fiscalYear', label: 'Fiscal Year Start',type: 'select', opts: ['April–March', 'January–December', 'July–June'] },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label className={labelCls}>{f.label}</label>
                    <select className={selectCls} value={(org as any)[f.k]} onChange={e => { setOrg(o => ({ ...o, [f.k]: e.target.value })); orgSave.markDirty(); }}>
                      {(f as any).opts.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <SaveBar {...orgSave} onSave={orgSave.save} onDiscard={orgSave.discard} />
          </div>
        )}

        {/* ── Branding ── */}
        {section === 'Branding' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Branding</h2>
              <p className="text-xs text-slate-400 mt-0.5">Customize the platform's visual identity</p>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Logo & Name</h3>
              <div className="flex items-start gap-5 mb-4">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors flex-shrink-0">
                  <span className="text-2xl">🚌</span>
                  <span className="text-[9px] text-slate-400 mt-1">Upload logo</span>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className={labelCls}>Platform Display Name</label>
                    <input className={inputCls} value={brand.logoText} onChange={e => { setBrand(b => ({ ...b, logoText: e.target.value })); brandSave.markDirty(); }} />
                  </div>
                  <div>
                    <label className={labelCls}>Tagline</label>
                    <input className={inputCls} value={brand.tagline} onChange={e => { setBrand(b => ({ ...b, tagline: e.target.value })); brandSave.markDirty(); }} />
                  </div>
                </div>
              </div>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Color Palette</h3>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {([
                  { k: 'primaryColor', label: 'Primary Color' },
                  { k: 'accentColor',  label: 'Accent Color' },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label className={labelCls}>{f.label}</label>
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg border border-slate-200 flex-shrink-0 cursor-pointer overflow-hidden">
                        <input type="color" value={(brand as any)[f.k]} onChange={e => { setBrand(b => ({ ...b, [f.k]: e.target.value })); brandSave.markDirty(); }} className="w-12 h-12 -translate-x-1 -translate-y-1 cursor-pointer" />
                      </div>
                      <input className={inputCls} value={(brand as any)[f.k]} onChange={e => { setBrand(b => ({ ...b, [f.k]: e.target.value })); brandSave.markDirty(); }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="text-[10px] text-slate-400 mb-2 font-semibold uppercase tracking-wide">Preview</div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ background: brand.primaryColor }}>{brand.logoText}</div>
                  <div className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold" style={{ background: brand.accentColor }}>Accent Button</div>
                </div>
              </div>
            </div>
            <SaveBar {...brandSave} onSave={brandSave.save} onDiscard={brandSave.discard} />
          </div>
        )}

        {/* ── Security ── */}
        {section === 'Security' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Security Configuration</h2>
              <p className="text-xs text-slate-400 mt-0.5">Protect the platform with enterprise-grade security controls</p>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Session & Access</h3>
              <div className="grid grid-cols-2 gap-4 max-w-2xl mb-4">
                {([
                  { k: 'timeout',      label: 'Session Timeout',     opts: ['15 minutes', '30 minutes', '1 hour', '4 hours'] },
                  { k: 'policy',       label: 'Password Policy',      opts: ['Basic', 'Strong (12+ chars, mixed)', 'Custom'] },
                  { k: 'lockAttempts', label: 'Failed Login Lock',    opts: ['3 attempts', '5 attempts', '10 attempts'] },
                  { k: 'encryption',   label: 'Data Encryption',      opts: ['AES-256-GCM', 'AES-128-GCM'] },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label className={labelCls}>{f.label}</label>
                    <select className={selectCls} value={(secSel as any)[f.k]} onChange={e => { setSecSel(s => ({ ...s, [f.k]: e.target.value })); secSave.markDirty(); }}>
                      {(f as any).opts.map((o: string) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Security Controls</h3>
              {([
                { k: 'ipAllowlist',    label: 'IP Allowlist',            desc: 'Restrict admin console access to approved IP ranges' },
                { k: 'auditLog',       label: 'Audit Logging',           desc: 'Record all admin actions with full attribution' },
                { k: 'deviceTrust',    label: 'Device Trust',            desc: 'Require device registration for first-time logins' },
                { k: 'sessionBinding', label: 'Session Binding',         desc: 'Bind sessions to originating IP and device fingerprint' },
                { k: 'twoFactorAdmin', label: 'Force 2FA for Admins',    desc: 'All platform admins must use a second factor' },
                { k: 'autoLogout',     label: 'Auto-logout on Inactivity',desc: 'Terminate session after configured idle timeout' },
              ] as const).map(f => (
                <SettingRow key={f.k} label={f.label} desc={f.desc} on={(sec as any)[f.k]} onChange={v => { setSec(s => ({ ...s, [f.k]: v })); secSave.markDirty(); }} />
              ))}
            </div>
            <SaveBar {...secSave} onSave={secSave.save} onDiscard={secSave.discard} />
          </div>
        )}

        {/* ── MFA & SSO ── */}
        {section === 'MFA & SSO' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">MFA & Single Sign-On</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure multi-factor authentication and identity provider integration</p>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Authentication Methods</h3>
              {([
                { k: 'totpEnabled',  label: 'Authenticator App (TOTP)', desc: 'Google Authenticator, Authy, or compatible TOTP apps' },
                { k: 'smsEnabled',   label: 'SMS OTP',                  desc: 'One-time passwords sent via SMS (Twilio)' },
                { k: 'emailOtp',     label: 'Email OTP',                desc: 'Magic link or OTP sent to registered email' },
                { k: 'hardwareKey',  label: 'Hardware Security Key',    desc: 'FIDO2 / WebAuthn (YubiKey, Titan Key)' },
              ] as const).map(f => (
                <SettingRow key={f.k} label={f.label} desc={f.desc} on={(mfa as any)[f.k]} onChange={v => { setMfa(m => ({ ...m, [f.k]: v })); mfaSave.markDirty(); }} />
              ))}
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Single Sign-On (SSO)</h3>
              <SettingRow label="Enable SSO" desc="Allow users to log in via an external identity provider" on={mfa.ssoEnabled} onChange={v => { setMfa(m => ({ ...m, ssoEnabled: v })); mfaSave.markDirty(); }} />
              {mfa.ssoEnabled && (
                <div className="mt-4 space-y-3 max-w-lg">
                  <div>
                    <label className={labelCls}>Identity Provider</label>
                    <select className={selectCls} value={mfa.ssoProvider} onChange={e => { setMfa(m => ({ ...m, ssoProvider: e.target.value })); mfaSave.markDirty(); }}>
                      {['Google Workspace', 'Microsoft Azure AD', 'Okta', 'OneLogin', 'Auth0', 'Custom SAML'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>SSO Login URL</label>
                    <input className={inputCls} placeholder="https://accounts.google.com/o/saml2/…" />
                  </div>
                  <div>
                    <label className={labelCls}>Entity ID / Audience</label>
                    <input className={inputCls} placeholder="https://shivneri.in/sso/saml" />
                  </div>
                  <SettingRow label="SAML 2.0" desc="Use SAML protocol instead of OIDC" on={mfa.samlEnabled} onChange={v => { setMfa(m => ({ ...m, samlEnabled: v })); mfaSave.markDirty(); }} />
                </div>
              )}
            </div>
            <SaveBar {...mfaSave} onSave={mfaSave.save} onDiscard={mfaSave.discard} />
          </div>
        )}

        {/* ── Notifications ── */}
        {section === 'Notifications' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Notification Preferences</h2>
              <p className="text-xs text-slate-400 mt-0.5">Configure alert channels for operational events</p>
            </div>
            {([
              { title: 'SOS & Emergency', rows: [
                { k: 'emailSOS', label: 'Email', desc: 'Receive SOS alerts via email immediately' },
                { k: 'smsSOS',   label: 'SMS',   desc: 'SMS to on-call officer for active SOS events' },
                { k: 'pushSOS',  label: 'Push',  desc: 'Browser/mobile push for SOS events' },
              ] },
              { title: 'Incidents', rows: [
                { k: 'emailIncident', label: 'Email', desc: 'New incident email notifications' },
                { k: 'smsIncident',   label: 'SMS',   desc: 'SMS for Critical/High severity incidents' },
                { k: 'pushIncident',  label: 'Push',  desc: 'In-app push notifications' },
              ] },
              { title: 'Reports & Billing', rows: [
                { k: 'emailReports', label: 'Weekly Report Email',  desc: 'Weekly operational summary every Monday' },
                { k: 'emailDigest',  label: 'Daily Digest',         desc: 'Daily trip and fleet summary' },
                { k: 'emailBilling', label: 'Billing Alerts',       desc: 'Invoice generated and payment due alerts' },
              ] },
              { title: 'Operations', rows: [
                { k: 'pushLiveOps',    label: 'Live Ops Alerts',    desc: 'Route delays and vehicle anomalies' },
                { k: 'smsDriverAlert', label: 'Driver SMS Alerts',  desc: 'SMS to drivers for trip assignments' },
              ] },
            ] as const).map(group => (
              <div key={group.title} className={cardCls}>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">{group.title}</h3>
                {group.rows.map(f => (
                  <SettingRow key={f.k} label={f.label} desc={f.desc} on={(notif as any)[f.k]} onChange={v => { setNotif(n => ({ ...n, [f.k]: v })); notifSave.markDirty(); }} />
                ))}
              </div>
            ))}
            <SaveBar {...notifSave} onSave={notifSave.save} onDiscard={notifSave.discard} />
          </div>
        )}

        {/* ── Privacy ── */}
        {section === 'Privacy' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Privacy & Data Governance</h2>
              <p className="text-xs text-slate-400 mt-0.5">Control data retention, anonymization, and compliance settings</p>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Retention Periods</h3>
              <div className="grid grid-cols-3 gap-4 max-w-2xl mb-4">
                {([
                  { k: 'retentionDays', label: 'Trip Data Retention', unit: 'days', opts: ['90', '180', '365', '730'] },
                  { k: 'anonymizeAfter', label: 'Anonymize PII After', unit: 'days', opts: ['30', '60', '90', '180'] },
                  { k: 'locationRetain', label: 'Location Log Retain', unit: 'days', opts: ['7', '14', '30', '60'] },
                ] as const).map(f => (
                  <div key={f.k}>
                    <label className={labelCls}>{f.label}</label>
                    <select className={selectCls} value={(priv as any)[f.k]} onChange={e => { setPriv(p => ({ ...p, [f.k]: e.target.value })); privSave.markDirty(); }}>
                      {(f as any).opts.map((o: string) => <option key={o}>{o} {f.unit}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">Compliance Controls</h3>
              {([
                { k: 'gdprMode',         label: 'GDPR / DPDP Compliance Mode', desc: 'Enable data subject rights (access, erasure, portability)' },
                { k: 'exportRequests',   label: 'Allow Data Export Requests',   desc: 'Employees can request a full export of their data' },
                { k: 'dataMinimization', label: 'Data Minimization',            desc: 'Collect only fields required for transport operations' },
                { k: 'consentTracking',  label: 'Consent Tracking',             desc: 'Record and timestamp all employee data consents' },
              ] as const).map(f => (
                <SettingRow key={f.k} label={f.label} desc={f.desc} on={(priv as any)[f.k]} onChange={v => { setPriv(p => ({ ...p, [f.k]: v })); privSave.markDirty(); }} />
              ))}
            </div>
            <SaveBar {...privSave} onSave={privSave.save} onDiscard={privSave.discard} />
          </div>
        )}

        {/* ── API Keys ── */}
        {section === 'API Keys' && (
          <div>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">API Keys</h2>
                <p className="text-xs text-slate-400 mt-0.5">Manage programmatic access credentials for the SHIVNERI API</p>
              </div>
              <button onClick={() => { setShowGenKey(true); setNewKey(null); }} className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg font-semibold hover:bg-blue-700">+ Generate Key</button>
            </div>

            {/* Generate Key panel */}
            {showGenKey && (
              <div className={`${cardCls} border-blue-200 bg-blue-50`}>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Generate New API Key</h3>
                {newKey ? (
                  <div>
                    <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                      <div className="text-[10px] font-semibold text-green-700 mb-1">✓ Key generated — copy it now, it won't be shown again.</div>
                      <div className="mono text-xs text-slate-800 break-all">{newKey}</div>
                    </div>
                    <button onClick={() => { setCopiedKey('new'); setTimeout(() => setCopiedKey(null), 2000); }} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg font-semibold mr-2">
                      {copiedKey === 'new' ? '✓ Copied!' : 'Copy Key'}
                    </button>
                    <button onClick={() => { setShowGenKey(false); setNewKey(null); }} className="px-3 py-1.5 text-xs border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">Done</button>
                  </div>
                ) : (
                  <div className="flex gap-3 items-end max-w-md">
                    <div className="flex-1">
                      <label className={labelCls}>Key Name</label>
                      <input className={inputCls} placeholder="e.g. Mobile App Production" value={genKeyName} onChange={e => setGenKeyName(e.target.value)} />
                    </div>
                    <button onClick={generateKey} className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg font-semibold hover:bg-blue-700 flex-shrink-0">Generate</button>
                    <button onClick={() => setShowGenKey(false)} className="px-3 py-2 border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-100 flex-shrink-0">Cancel</button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {['Key Name', 'Prefix', 'Created', 'Last Used', 'Expiry', 'Status', 'Rate Limit', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map(k => (
                    <tr key={k.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{k.name}</td>
                      <td className="px-4 py-3 mono text-slate-500 text-[11px]">{k.prefix}</td>
                      <td className="px-4 py-3 mono text-slate-400">{k.created}</td>
                      <td className="px-4 py-3 mono text-slate-400">{k.lastUsed}</td>
                      <td className="px-4 py-3 mono text-slate-500">{k.expiry}</td>
                      <td className="px-4 py-3"><Badge label={k.status} color={k.status === 'Active' ? 'green' : k.status === 'Revoked' ? 'slate' : 'red'} /></td>
                      <td className="px-4 py-3 text-slate-500">{k.rateLimit}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          {k.status === 'Active' && (
                            <button onClick={() => copyKey(k.id)} className={`px-2 py-1 rounded text-[10px] transition-colors ${copiedKey === k.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                              {copiedKey === k.id ? '✓ Copied' : 'Copy'}
                            </button>
                          )}
                          {k.status === 'Active' && !k.revokeConfirm && (
                            <button onClick={() => setRevokeConfirm(k.id, true)} className="px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-[10px]">Revoke</button>
                          )}
                          {k.revokeConfirm && (
                            <>
                              <button onClick={() => revokeKey(k.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-semibold">Confirm</button>
                              <button onClick={() => setRevokeConfirm(k.id, false)} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px]">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Webhooks ── */}
        {section === 'Webhooks' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Webhooks</h2>
              <p className="text-xs text-slate-400 mt-0.5">Push real-time events to external endpoints</p>
            </div>

            {/* Add webhook */}
            <div className={cardCls}>
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Add Endpoint</h3>
              <div className="space-y-3 max-w-xl">
                <div>
                  <label className={labelCls}>Endpoint URL</label>
                  <input className={inputCls} placeholder="https://your-api.example.com/webhooks" value={hookUrl} onChange={e => setHookUrl(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Events to Send</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {webhookEvents.map(evt => (
                      <button
                        key={evt}
                        onClick={() => { setHookEvents(prev => prev.includes(evt) ? prev.filter(e => e !== evt) : [...prev, evt]); hookSave.markDirty(); }}
                        className={`px-2.5 py-1 text-[10px] rounded-lg border mono transition-colors ${hookEvents.includes(evt) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                      >
                        {evt}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!hookUrl.trim()) return;
                    setHooks(prev => [{ id: String(Date.now()), url: hookUrl, events: hookEvents, active: true, secret: 'whsec_' + Math.random().toString(36).slice(2, 10) }, ...prev]);
                    setHookUrl('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-xs rounded-lg font-semibold hover:bg-blue-700"
                >
                  Add Endpoint
                </button>
              </div>
            </div>

            {/* Existing webhooks */}
            <div className="space-y-3">
              {hooks.map(h => (
                <div key={h.id} className={`${cardCls} mb-0`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-800 mono truncate">{h.url}</span>
                        <Badge label={h.active ? 'Active' : 'Paused'} color={h.active ? 'green' : 'slate'} />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {h.events.map(e => (
                          <span key={e} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded mono">{e}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Toggle on={h.active} onChange={v => setHooks(prev => prev.map(w => w.id === h.id ? { ...w, active: v } : w))} />
                      <button onClick={() => setHooks(prev => prev.filter(w => w.id !== h.id))} className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Integrations ── */}
        {section === 'Integrations' && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">Integrations</h2>
              <p className="text-xs text-slate-400 mt-0.5">Connect SHIVNERI with your existing enterprise tools</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {integrations.map(intg => (
                <div key={intg.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl flex-shrink-0">{intg.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="text-sm font-semibold text-slate-800">{intg.name}</div>
                      <Badge label={intg.status} color={intg.status === 'Connected' ? 'green' : 'slate'} />
                    </div>
                    <div className="text-xs text-slate-400 mb-2">{intg.desc}</div>
                    <div className="text-[10px] text-slate-400 mb-3">{intg.category}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleIntegration(intg.id)}
                        className={`px-3 py-1.5 text-[10px] rounded-lg font-semibold transition-colors ${intg.status === 'Connected' ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                      >
                        {intg.status === 'Connected' ? 'Disconnect' : 'Connect'}
                      </button>
                      {intg.status === 'Connected' && (
                        <button className="px-3 py-1.5 text-[10px] border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50">Configure</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Employee Mobile App ──────────────────────────────────────────────────────
function EmployeeMobileView() {
  const [screen, setScreen] = useState('home');
  const screens = ['home', 'ride-details', 'track', 'sos', 'history', 'profile'];
  const screenLabels: Record<string, string> = {
    home: 'Home', 'ride-details': 'Ride Details', track: 'Live Tracking', sos: 'SOS', history: 'Ride History', profile: 'Profile',
  };

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {screens.map(s => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${screen === s ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {screenLabels[s]}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        {/* Phone frame */}
        <div
          className="relative rounded-[40px] overflow-hidden shadow-2xl"
          style={{ width: 320, height: 640, background: '#111827', border: '8px solid #1f2937' }}
        >
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-gray-900">
            <span className="text-white text-[10px] font-semibold">9:41</span>
            <div className="flex gap-1 items-center">
              <span className="text-white text-[10px]">▲▲▲</span>
              <span className="text-white text-[9px]">WiFi</span>
              <span className="text-white text-[10px]">🔋</span>
            </div>
          </div>

          {/* Screen content */}
          <div className="h-full overflow-y-auto" style={{ background: screen === 'sos' ? '#7f1d1d' : '#f8fafc' }}>
            {screen === 'home' && (
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-500">Good Morning 👋</div>
                    <div className="text-lg font-bold text-slate-900">Akshat Gupta</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">AG</div>
                </div>

                {/* Today's ride card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 mb-4 text-white">
                  <div className="text-xs font-semibold text-blue-200 mb-2">TODAY'S RIDE</div>
                  <div className="text-2xl font-bold mb-1">07:30 AM</div>
                  <div className="text-sm text-blue-100 mb-3">Pune → Hinjewadi Phase 1</div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🚗</div>
                    <div>
                      <div className="text-xs font-semibold">Raj Kumar</div>
                      <div className="text-[10px] text-blue-200">★ 4.8 · MH12AB1234</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-xs text-blue-200">ETA</div>
                      <div className="text-lg font-bold">12 min</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setScreen('track')}
                    className="w-full py-2 bg-white text-blue-700 text-xs font-bold rounded-xl"
                  >
                    Track Ride →
                  </button>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { label: 'Book', icon: '🎫' },
                    { label: 'History', icon: '📋' },
                    { label: 'Attend.', icon: '✅' },
                    { label: 'Feedback', icon: '⭐' },
                  ].map(a => (
                    <button key={a.label} className="flex flex-col items-center gap-1 bg-white rounded-xl p-2.5 shadow-sm border border-slate-100">
                      <span className="text-lg">{a.icon}</span>
                      <span className="text-[9px] text-slate-600 font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>

                {/* Upcoming */}
                <div className="bg-white rounded-xl p-3 border border-slate-200 mb-4">
                  <div className="text-xs font-semibold text-slate-700 mb-2">Upcoming This Week</div>
                  {[
                    { day: 'Tomorrow', time: '07:30 AM', route: 'Pune → Hinjewadi' },
                    { day: 'Wed', time: '07:30 AM', route: 'Pune → Hinjewadi' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 last:border-0">
                      <span className="text-[10px] text-slate-400 w-12">{r.day}</span>
                      <span className="text-[10px] mono text-slate-600">{r.time}</span>
                      <span className="text-[10px] text-slate-500">{r.route}</span>
                    </div>
                  ))}
                </div>

                {/* SOS button */}
                <button
                  onClick={() => setScreen('sos')}
                  className="w-full py-3 bg-red-600 text-white text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  🚨 EMERGENCY SOS
                </button>
              </div>
            )}

            {screen === 'track' && (
              <div>
                <div className="relative" style={{ height: 200, background: '#1a2533' }}>
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`h${i}`} x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="#4a90d9" strokeWidth="0.5" />
                    ))}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line key={`v${i}`} x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="#4a90d9" strokeWidth="0.5" />
                    ))}
                  </svg>
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline points="10%,80% 35%,55% 60%,35% 80%,20%" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeDasharray="6 3" />
                    <circle cx="10%" cy="80%" r="6" fill="#22c55e" stroke="white" strokeWidth="2" />
                    <circle cx="80%" cy="20%" r="6" fill="#ef4444" stroke="white" strokeWidth="2" />
                    <circle cx="55%" cy="38%" r="7" fill="#3b82f6" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[9px] mono px-2 py-1 rounded">📡 LIVE</div>
                </div>
                <div className="p-4 bg-white flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-slate-900">Raj Kumar</div>
                    <Badge label="On Route" color="green" />
                  </div>
                  {[
                    { label: 'ETA', value: '12 min' },
                    { label: 'Speed', value: '42 km/h' },
                    { label: 'Passengers', value: '4 / 7' },
                    { label: 'Vehicle', value: 'MH12AB1234' },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-500">{f.label}</span>
                      <span className="font-semibold text-slate-800 mono">{f.value}</span>
                    </div>
                  ))}
                  <button onClick={() => setScreen('sos')} className="w-full mt-3 py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                    🚨 SOS
                  </button>
                </div>
              </div>
            )}

            {screen === 'sos' && (
              <div className="p-4 flex flex-col items-center">
                <div className="mt-6 mb-4 text-center">
                  <div className="text-4xl mb-2 pulse-dot">🚨</div>
                  <div className="text-xl font-black text-white">EMERGENCY SOS</div>
                  <div className="text-xs text-red-300 mt-1">Press and hold to activate</div>
                </div>

                <button className="w-36 h-36 rounded-full border-8 border-red-400 bg-red-600 text-white flex flex-col items-center justify-center shadow-lg shadow-red-900 mb-6">
                  <span className="text-3xl">🚨</span>
                  <span className="text-xs font-bold mt-1">HOLD 3s</span>
                </button>

                <div className="w-full space-y-2">
                  {[
                    { icon: '📞', label: 'Call Emergency Contact' },
                    { icon: '🚔', label: 'Call Police (100)' },
                    { icon: '🏥', label: 'Call Ambulance (108)' },
                    { icon: '📍', label: 'Share Live Location' },
                  ].map(a => (
                    <button key={a.label} className="w-full flex items-center gap-3 bg-red-900/50 text-white rounded-xl px-4 py-3 text-xs font-medium border border-red-700">
                      <span className="text-base">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>

                <button onClick={() => setScreen('home')} className="mt-4 text-red-300 text-xs underline">Cancel — Go Back</button>
              </div>
            )}

            {screen === 'history' && (
              <div className="p-4">
                <div className="text-sm font-bold text-slate-900 mb-3">Ride History</div>
                {[
                  { id: 'RIDE-10421', date: 'Today, 07:30', route: 'Pune → Hinjewadi', driver: 'Raj Kumar', rating: 5, status: 'Completed' },
                  { id: 'RIDE-10398', date: 'Yesterday, 18:30', route: 'Hinjewadi → Pune', driver: 'Mohan Singh', rating: 4, status: 'Completed' },
                  { id: 'RIDE-10371', date: 'Mon, 07:30', route: 'Pune → Hinjewadi', driver: 'Raj Kumar', rating: 5, status: 'Completed' },
                  { id: 'RIDE-10348', date: 'Fri, 19:00', route: 'Hinjewadi → Pune', driver: 'Suresh Y.', rating: 3, status: 'Delayed' },
                ].map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="mono text-[10px] text-slate-400">{r.id}</span>
                      <Badge label={r.status} color={r.status === 'Completed' ? 'green' : 'amber'} />
                    </div>
                    <div className="text-xs font-semibold text-slate-800">{r.route}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{r.date} · {r.driver}</div>
                    <div className="text-amber-500 text-[10px] mt-1">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                ))}
              </div>
            )}

            {screen === 'profile' && (
              <div className="p-4">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold mb-2">AG</div>
                  <div className="text-base font-bold text-slate-900">Akshat Gupta</div>
                  <div className="text-xs text-slate-400">EMP-10481 · Engineering</div>
                </div>
                {[
                  { label: 'Phone', value: '••••••4821' },
                  { label: 'Email', value: 'a.gupta@tcs.com' },
                  { label: 'Department', value: 'Engineering' },
                  { label: 'Shift', value: 'Morning (07:00–15:30)' },
                  { label: 'Pickup', value: 'Kothrud, Pune' },
                  { label: 'Drop', value: 'Hinjewadi Phase 1' },
                ].map(f => (
                  <div key={f.label} className="flex justify-between py-2 border-b border-slate-100 text-xs">
                    <span className="text-slate-500">{f.label}</span>
                    <span className="text-slate-800 font-medium">{f.value}</span>
                  </div>
                ))}
              </div>
            )}

            {screen === 'ride-details' && (
              <div className="p-4">
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 mb-3">
                  <div className="mono text-xs text-blue-600 font-bold mb-1">RIDE-10421</div>
                  <div className="text-xs text-slate-600">Today, 07:30 AM · Morning Shift</div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm">🚗</div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Raj Kumar</div>
                      <div className="text-[10px] text-slate-400">★ 4.8 · MH12AB1234 · Innova</div>
                    </div>
                  </div>
                  {[
                    { label: 'Pickup', value: 'Kothrud, Pune' },
                    { label: 'Drop', value: 'Hinjewadi Phase 1' },
                    { label: 'Passengers', value: '4' },
                    { label: 'ETA', value: '12 minutes' },
                    { label: 'OTP', value: '7 4 2 9' },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-500">{f.label}</span>
                      <span className={`font-semibold ${f.label === 'OTP' ? 'mono text-blue-600 tracking-widest text-base' : 'text-slate-800'}`}>{f.value}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setScreen('track')} className="py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Track Live</button>
                  <button onClick={() => setScreen('sos')} className="py-2 bg-red-600 text-white text-xs font-bold rounded-xl">🚨 SOS</button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-around bg-white border-t border-slate-200" style={{ background: screen === 'sos' ? '#111827' : undefined }}>
            {[
              { icon: '🏠', label: 'Home', s: 'home' },
              { icon: '🎫', label: 'Ride', s: 'ride-details' },
              { icon: '📋', label: 'History', s: 'history' },
              { icon: '👤', label: 'Profile', s: 'profile' },
            ].map(n => (
              <button key={n.s} onClick={() => setScreen(n.s)} className="flex flex-col items-center gap-0.5">
                <span className="text-base">{n.icon}</span>
                <span className={`text-[9px] font-medium ${screen === n.s ? 'text-blue-600' : screen === 'sos' ? 'text-slate-400' : 'text-slate-400'}`}>{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Driver Mobile App ────────────────────────────────────────────────────────
function DriverMobileView() {
  const [screen, setScreen] = useState('dashboard');
  const screens = ['dashboard', 'trip-request', 'active-ride', 'earnings', 'sos'];
  const screenLabels: Record<string, string> = {
    dashboard: 'Dashboard', 'trip-request': 'Trip Request', 'active-ride': 'Active Ride', earnings: 'Earnings', sos: 'SOS / Accident',
  };

  return (
    <div className="p-6 slide-in overflow-y-auto h-full">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {screens.map(s => (
          <button
            key={s}
            onClick={() => setScreen(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${screen === s ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 bg-white text-slate-600'}`}
          >
            {screenLabels[s]}
          </button>
        ))}
      </div>

      <div className="flex justify-center">
        <div
          className="relative rounded-[40px] overflow-hidden shadow-2xl"
          style={{ width: 320, height: 640, background: '#111827', border: '8px solid #1f2937' }}
        >
          <div className="flex items-center justify-between px-6 pt-3 pb-1 bg-gray-900">
            <span className="text-white text-[10px] font-semibold">9:41</span>
            <div className="flex gap-1 items-center">
              <span className="text-white text-[10px]">▲▲▲</span>
              <span className="text-white text-[9px]">WiFi</span>
              <span className="text-white text-[10px]">🔋</span>
            </div>
          </div>

          <div className="overflow-y-auto" style={{ height: 560, background: '#f8fafc' }}>
            {screen === 'dashboard' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-slate-500">Good Morning</div>
                    <div className="text-base font-bold text-slate-900">Raj Kumar</div>
                    <div className="text-[10px] text-slate-400">MH12AB1234 · Innova Crysta</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Rating</div>
                    <div className="text-lg font-bold text-amber-500">★ 4.8</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: "Today's Trips", value: '5', color: 'bg-blue-50 text-blue-700' },
                    { label: 'Completed', value: '3', color: 'bg-green-50 text-green-700' },
                    { label: 'Upcoming', value: '2', color: 'bg-amber-50 text-amber-700' },
                    { label: "Today's Earn", value: '₹840', color: 'bg-purple-50 text-purple-700' },
                  ].map(s => (
                    <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
                      <div className="text-[10px] opacity-70 mb-0.5">{s.label}</div>
                      <div className="text-xl font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Trip request card */}
                <button onClick={() => setScreen('trip-request')} className="w-full bg-blue-600 text-white rounded-2xl p-4 mb-3 text-left">
                  <div className="text-xs font-semibold text-blue-200 mb-2">INCOMING TRIP REQUEST</div>
                  <div className="font-bold mb-1">RIDE-10439</div>
                  <div className="text-xs text-blue-100 mb-0.5">📍 Pimple Saudagar → Baner Rd</div>
                  <div className="text-xs text-blue-200">👥 5 passengers · 8 km · ₹190</div>
                </button>

                <div className="bg-white rounded-xl border border-slate-200 p-3">
                  <div className="text-xs font-semibold text-slate-700 mb-2">Current Status</div>
                  <div className="flex items-center gap-2">
                    <StatusDot active />
                    <span className="text-sm font-semibold text-green-600">Available</span>
                  </div>
                </div>
              </div>
            )}

            {screen === 'trip-request' && (
              <div className="p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Trip Request</div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                  <div className="mono text-xs text-blue-600 font-bold mb-2">RIDE-10439</div>
                  {[
                    { label: 'Pickup', value: 'Pimple Saudagar Stop' },
                    { label: 'Drop', value: 'Baner Road Office' },
                    { label: 'Passengers', value: '5 employees' },
                    { label: 'Distance', value: '8 km' },
                    { label: 'ETA to pickup', value: '6 min' },
                    { label: 'Estimated Earn', value: '₹190' },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                      <span className="text-slate-500">{f.label}</span>
                      <span className="font-semibold text-slate-800">{f.value}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-amber-600 text-center mb-3">⏳ Expires in 45 seconds</div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setScreen('active-ride')} className="py-3 bg-green-600 text-white font-bold rounded-2xl text-sm">✓ Accept</button>
                  <button onClick={() => setScreen('dashboard')} className="py-3 bg-red-100 text-red-700 font-bold rounded-2xl text-sm border border-red-200">✗ Reject</button>
                </div>
              </div>
            )}

            {screen === 'active-ride' && (
              <div>
                <div className="relative" style={{ height: 180, background: '#1a2533' }}>
                  <svg className="absolute inset-0 w-full h-full opacity-10">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <line key={i} x1="0" y1={`${i * 12.5}%`} x2="100%" y2={`${i * 12.5}%`} stroke="#4a90d9" strokeWidth="0.5" />
                    ))}
                  </svg>
                  <svg className="absolute inset-0 w-full h-full">
                    <polyline points="20%,80% 50%,50% 75%,25%" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3" />
                    <circle cx="20%" cy="80%" r="5" fill="#22c55e" stroke="white" strokeWidth="2" />
                    <circle cx="75%" cy="25%" r="5" fill="#ef4444" stroke="white" strokeWidth="2" />
                    <circle cx="45%" cy="54%" r="8" fill="#3b82f6" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-[9px] mono px-2 py-1 rounded">● RIDE ACTIVE</div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] px-2 py-1 rounded">42 km/h</div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="mono text-xs text-blue-600 font-bold">RIDE-10439</div>
                      <div className="text-xs text-slate-500">5 passengers · 8 km remaining</div>
                    </div>
                    <Badge label="On Route" color="green" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'ETA', value: '14 min' },
                      { label: 'Speed', value: '42 km/h' },
                      { label: 'Earn', value: '₹190' },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
                        <div className="text-[10px] text-slate-400">{s.label}</div>
                        <div className="text-sm font-bold text-slate-800 mono">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button className="py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">Navigate</button>
                    <button className="py-2 bg-green-600 text-white text-xs font-bold rounded-xl">Complete Trip ✓</button>
                  </div>
                  <button onClick={() => setScreen('sos')} className="w-full py-2 bg-red-600 text-white text-xs font-bold rounded-xl">
                    🚨 Report SOS / Incident
                  </button>
                </div>
              </div>
            )}

            {screen === 'earnings' && (
              <div className="p-4">
                <div className="text-sm font-bold text-slate-900 mb-3">Earnings</div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-4 mb-4">
                  <div className="text-xs text-slate-400 mb-1">Total Earnings — September</div>
                  <div className="text-3xl font-black mb-1">₹18,420</div>
                  <div className="text-xs text-green-400">+12% vs last month</div>
                </div>
                {[
                  { label: 'Today', value: '₹840', trips: 5 },
                  { label: 'This Week', value: '₹4,210', trips: 24 },
                  { label: 'Last Week', value: '₹3,980', trips: 22 },
                ].map(e => (
                  <div key={e.label} className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-3 mb-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{e.value}</div>
                      <div className="text-[10px] text-slate-400">{e.label} · {e.trips} trips</div>
                    </div>
                    <div className="text-slate-300">→</div>
                  </div>
                ))}
              </div>
            )}

            {screen === 'sos' && (
              <div className="p-4" style={{ background: '#7f1d1d', minHeight: '100%' }}>
                <div className="text-center mb-4">
                  <div className="text-2xl mb-1 pulse-dot">🚨</div>
                  <div className="text-white font-black text-lg">EMERGENCY REPORT</div>
                  <div className="text-red-300 text-xs">Select incident type</div>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { icon: '🚨', label: 'SOS — Personal Emergency' },
                    { icon: '💥', label: 'Accident Report' },
                    { icon: '🔧', label: 'Vehicle Breakdown' },
                    { icon: '🤒', label: 'Medical Emergency' },
                    { icon: '⚠', label: 'Security Threat' },
                  ].map(a => (
                    <button key={a.label} className="w-full flex items-center gap-3 bg-red-900/60 text-white rounded-xl px-4 py-3 text-sm font-medium border border-red-700">
                      <span className="text-xl">{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setScreen('dashboard')} className="w-full py-2 bg-white/20 text-white text-xs rounded-xl border border-red-600">
                  ← Back to Dashboard
                </button>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 left-0 right-0 h-14 flex items-center justify-around bg-gray-900 border-t border-gray-700">
            {[
              { icon: '🏠', label: 'Home', s: 'dashboard' },
              { icon: '🎫', label: 'Trips', s: 'trip-request' },
              { icon: '💰', label: 'Earnings', s: 'earnings' },
              { icon: '🚨', label: 'SOS', s: 'sos' },
            ].map(n => (
              <button key={n.s} onClick={() => setScreen(n.s)} className="flex flex-col items-center gap-0.5">
                <span className="text-base">{n.icon}</span>
                <span className={`text-[9px] font-medium ${screen === n.s ? 'text-blue-400' : 'text-gray-400'}`}>{n.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const VIEW_META: Record<View, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Platform Overview', subtitle: 'Real-time metrics across all tenant organizations' },
  organizations: { title: 'Organizations', subtitle: 'Manage multi-tenant client organizations' },
  employees: { title: 'Employees', subtitle: 'Employee profiles and transport eligibility' },
  drivers: { title: 'Drivers', subtitle: 'Driver management and verification' },
  vehicles: { title: 'Fleet Vehicles', subtitle: 'Vehicle registry, compliance, and utilization' },
  rides: { title: 'Rides', subtitle: 'Ride lifecycle and history' },
  'live-ops': { title: 'Live Operations Center', subtitle: 'Real-time vehicle tracking and incident response' },
  routes: { title: 'Routes', subtitle: 'Route planning and optimization' },
  safety: { title: 'Safety & Incidents', subtitle: 'SOS management, incidents, and emergency access' },
  billing: { title: 'Billing & Finance', subtitle: 'Invoices, cost analytics, and payment management' },
  analytics: { title: 'Analytics', subtitle: 'Enterprise intelligence across fleet, operations and finance' },
  'access-control': { title: 'Access Control', subtitle: 'Roles, permissions, and authorization management' },
  'policy-engine': { title: 'Policy Engine', subtitle: 'Rule-based contextual access control policies' },
  'policy-simulator': { title: 'Policy Simulator', subtitle: 'Test access decisions before deployment' },
  approvals: { title: 'Approvals', subtitle: 'Pending access requests and authorization workflows' },
  'security-audit': { title: 'Security & Audit', subtitle: 'Comprehensive security event log with risk analysis' },
  settings: { title: 'Settings', subtitle: 'Platform configuration, integrations, and API keys' },
  'employee-mobile': { title: 'Employee Mobile App', subtitle: 'iOS/Android app preview — employee experience' },
  'driver-mobile': { title: 'Driver Mobile App', subtitle: 'iOS/Android app preview — driver experience' },
};

// Note: AIChatbot component is imported from ./components/AIChatbot

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  // Shared policy state — PolicyEngineView edits it, PolicySimulatorView reads it live
  const [sharedPolicies, setSharedPolicies] = useState<PolicyRow[]>(SEED_POLICIES);
  const meta = VIEW_META[view];

  const renderView = () => {
    switch (view) {
      case 'dashboard': return <DashboardView onNav={setView} />;
      case 'organizations': return <OrganizationsView />;
      case 'employees': return <EmployeesView />;
      case 'drivers': return <DriversView />;
      case 'vehicles': return <VehiclesView />;
      case 'rides': return <RidesView />;
      case 'live-ops': return <LiveOpsView />;
      case 'routes': return <RoutesView />;
      case 'access-control': return <AccessControlView />;
      case 'policy-engine': return <PolicyEngineView policies={sharedPolicies} setPolicies={setSharedPolicies} />;
      case 'policy-simulator': return <PolicySimulatorView policies={sharedPolicies} />;
      case 'safety': return <SafetyView />;
      case 'security-audit': return <SecurityAuditView />;
      case 'billing': return <BillingView />;
      case 'analytics': return <AnalyticsView />;
      case 'approvals': return <ApprovalsView />;
      case 'settings': return <SettingsView />;
      case 'employee-mobile': return <EmployeeMobileView />;
      case 'driver-mobile': return <DriverMobileView />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar active={view} onNav={setView} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={meta.title} subtitle={meta.subtitle} onNav={setView} />
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}
