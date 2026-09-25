import React, { useState, useEffect, useRef } from 'react';

// ─── Environment & Model Settings ──────────────────────────────────────────
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_MODEL = 'qwen/qwen3.8-27b';

// ─── Types ─────────────────────────────────────────────────────────────────
export type MsgSpecial =
  | 'emergency'
  | 'ticket'
  | 'cancel_confirm'
  | 'cancel_success'
  | 'escalate'
  | 'permission'
  | 'feedback'
  | 'standby_offer';

export interface ChatMsg {
  id: string;
  role: 'user' | 'ai';
  text: string;
  special?: MsgSpecial;
  ts: Date;
  hasRideCard?: boolean;
  hasDispatchDesk?: boolean;
  cancelConfirmId?: string;
  feedbackGiven?: 'up' | 'down';
  chips?: string[];
  driverNotified?: boolean;
}

interface ActiveRide {
  id: string;
  pickup: string;
  drop: string;
  driver: string;
  phone: string;
  vehicle: string;
  vehicleModel: string;
  rating: number;
  trips: number;
  eta: string;
  distance: string;
  status: string;
  scheduled: string;
  trafficNote: string;
  speed: string;
}

const DEFAULT_RIDE: ActiveRide = {
  id: 'RIDE-10482',
  pickup: 'Wakad (Gate 2)',
  drop: 'TCS Hinjewadi Ph1 (Sahyadri Park)',
  driver: 'Raj Kumar',
  phone: '+91 98765 10482',
  vehicle: 'MH12AB1234',
  vehicleModel: 'Maruti Suzuki Swift Dzire (White)',
  rating: 4.88,
  trips: 1420,
  eta: '12 mins',
  distance: '1.8 km',
  status: 'On Route',
  scheduled: '08:30 AM',
  trafficNote: 'Slow traffic at Bhumkar Chowk (+4m)',
  speed: '28 km/h',
};

// ─── System Prompt for Groq (Executive Human Concierge Persona) ────────────
const SHIVNERI_SYSTEM = `You are "Shivneri Concierge", an executive corporate transport assistant for Shivneri Tours & Travels in Pune.
Your user is Akshat Sharma, Transport Manager at TCS Pune (commute route: Wakad to Hinjewadi Phase 1).

TONE & PERSONALITY GUIDELINES (CRITICAL):
1. SOUND LIKE A CARING, CAPABLE, HIGH-TOUCH HUMAN CONCIERGE.
   - Never sound like an automated robotic system, database query, or stiff bureaucrat.
   - Greet Akshat warmly by name when starting a topic ("Hi Akshat", "Good morning Akshat").
   - Show genuine empathy for commute delays, meetings, and shift schedules ("I completely understand waiting is frustrating when you have morning meetings", "Don't worry, I've got your back on this").
   - Speak in clear, elegant, well-spaced conversational paragraphs.

2. LOCAL CONTEXT & GROUND REALITIES:
   - Pune localities: Wakad, Hinjewadi Phase 1/2/3, Bhumkar Chowk, Baner, Aundh, Magarpatta, TCS Sahyadri Park.
   - Mention live context naturally: e.g. "Raj Kumar is en route in his White Swift Dzire (MH12AB1234). He's currently navigating the Bhumkar Chowk stretch, about 12 minutes out."
   - Explain traffic causes naturally rather than robotic codes: "Morning rush near the Wakad flyover added about 4 minutes to his arrival."

3. PROACTIVE HUMAN ASSISTANCE:
   - Don't just tell the user to wait or contact someone else. Take action or offer high-touch options:
     "I've already sent Raj a priority in-cab chime to let him know you are waiting at the gate."
     "If you are pressed for time, I can immediately dispatch our standby cab (MH12 DE 7788) which is just 4 minutes away, or ring Raj directly for you."

4. FORMATTING RULES:
   - Use clean, readable paragraphs.
   - Use bolding like **12 minutes** and **Raj Kumar** naturally.
   - Keep answers conversational, empathetic, and under 130 words.
   - For emergencies/safety: start with [EMERGENCY]
   - For cancellations: start with [CANCEL_CONFIRM]
   - For connecting to human desk: start with [ESCALATE]
   - For access/policy restrictions: start with [PERMISSION]`;

// ─── Human Fallback Knowledge Engine (Instant, Empathetic & Natural) ───────
function generateHumanResponse(input: string): {
  text: string;
  special?: MsgSpecial;
  hasRideCard?: boolean;
  hasDispatchDesk?: boolean;
  chips?: string[];
} {
  const q = input.toLowerCase();

  // 1. Driver is late / Delay
  if (q.includes('late') || q.includes("hasn't arrived") || q.includes('delay') || q.includes('where is')) {
    return {
      text: `Hi Akshat, I completely understand waiting can be stressful, especially with morning shift schedules at Hinjewadi. Let me step in right away.\n\nI just checked Raj Kumar's live vehicle telemetry. He's en route in his **White Swift Dzire (MH12AB1234)** and is currently navigating past Bhumkar Chowk, approximately **12 minutes away** (1.8 km from Wakad).\n\nTraffic near the Wakad flyover is moving at about 18 km/h this morning, which added a minor 4-minute delay beyond the 8:30 AM schedule. I have already sent Raj a priority in-cab chime letting him know you are waiting at the pickup spot.\n\nWould you like me to dial Raj directly for you, or dispatch our nearest standby cab if you're on a tight schedule?`,
      hasRideCard: true,
      hasDispatchDesk: true,
      special: undefined,
      chips: ['📞 Call Raj Kumar', '📍 View Live GPS', '⚡ Request Standby Cab', '💬 Talk to Dispatcher'],
    };
  }

  // 2. Track Ride
  if (q.includes('track') || q.includes('status') || q.includes('telemetry') || q.includes('eta')) {
    return {
      text: `I've pulled up your live trip details right now, Akshat.\n\nYour driver **Raj Kumar** is currently en route to **Wakad (Gate 2)**. He's driving at **28 km/h** and is estimated to arrive in **12 minutes** (approx. 1.8 km away).\n\nHere is your live telemetry card with direct options to call him, view his real-time GPS coordinates, or notify him:`,
      hasRideCard: true,
      hasDispatchDesk: false,
      chips: ['📞 Call Raj Kumar', '📍 View Live GPS', '🔔 Ping Driver', '⚡ Standby Cab'],
    };
  }

  // 3. Cancel Ride
  if (q.includes('cancel') || q.includes('drop ride') || q.includes('stop ride')) {
    return {
      text: `I can certainly take care of that for you, Akshat. Before I release your cab, could you please confirm if you'd like to cancel today's 08:30 AM pickup with Raj Kumar?\n\nAs per TCS Pune corporate transport policy, cancellations made prior to driver arrival carry **zero penalty** and will not affect your monthly allowance.`,
      special: 'cancel_confirm',
      hasRideCard: false,
      hasDispatchDesk: false,
      chips: ['✅ Confirm Cancellation', '🕒 Reschedule for Later', 'Keep My Ride'],
    };
  }

  // 4. Emergency / SOS
  if (q.includes('emergency') || q.includes('sos') || q.includes('danger') || q.includes('unsafe') || q.includes('accident') || q.includes('threat')) {
    return {
      text: `Your safety is our absolute highest priority. I have triggered emergency protocols for **RIDE-10482** and notified both TCS Corporate Security and Shivneri Dispatch Control.\n\nPlease remain in a well-lit, secure area. Emergency response teams have your live GPS location:`,
      special: 'emergency',
      hasRideCard: false,
      chips: ['🆘 Call 112 Police', '🛡️ Call TCS Security', '📍 Broadcast Location', '🔊 Sound Alarm'],
    };
  }

  // 5. Change pickup points
  if (q.includes('sayaji') || q.includes('gate 1') || q.includes('bhumkar chowk bus stop')) {
    const chosen = q.includes('sayaji')
      ? 'Sayaji Hotel Flyover'
      : q.includes('gate 1')
      ? 'Wakad Gate 1'
      : 'Bhumkar Chowk Bus Stop';
    return {
      text: `All set, Akshat! I've updated your pickup pinpoint to **${chosen}**.\n\n• **Revised Waypoint**: Pushed directly to Raj Kumar's dashboard navigation.\n• **Updated ETA**: **9 minutes** (he avoids the inner gate bottleneck).\n• **Vehicle Plate**: \`MH12AB1234\` (White Swift Dzire).\n\nRaj has acknowledged the new pickup location and is steering toward ${chosen}.`,
      hasRideCard: true,
      chips: ['📞 Call Raj Kumar', '📍 View Live GPS', '🔔 Ping Driver', '⚡ Standby Cab'],
    };
  }

  if (q.includes('change pickup') || q.includes('location') || q.includes('pickup point') || q.includes('gate')) {
    return {
      text: `No problem at all! We can adjust your pickup location so Raj Kumar pulls up exactly where you need him.\n\nYour current registered spot is **Wakad (Gate 2)**. Which pickup point would you prefer him to meet you at?`,
      chips: ['📍 Wakad Gate 1', '📍 Sayaji Hotel Flyover', '📍 Bhumkar Chowk Bus Stop', '📍 Enter Custom Address'],
    };
  }

  // 6. Book a ride slots
  if (q.includes('08:00 am slot') || q.includes('08:30 am slot') || q.includes('09:00 am slot')) {
    const slot = q.includes('08:00') ? '08:00 AM' : q.includes('08:30') ? '08:30 AM' : '09:00 AM';
    return {
      text: `✓ Confirmed, Akshat! Your corporate commute for tomorrow morning has been scheduled:\n\n• **Pickup Time**: **${slot}**\n• **Pickup Spot**: Wakad (Gate 2)\n• **Destination**: TCS Hinjewadi Phase 1 (Sahyadri Park)\n• **Booking Reference**: \`RIDE-10499\`\n• **Assigned Driver**: Will be dispatched 30 mins prior to shift.\n\nA calendar invite and driver tracking link have been dispatched to your corporate inbox (\`akshat.sharma@tcs.com\`).`,
      chips: ['🚗 View My Bookings', '🕒 Reschedule Slot', '👥 Add Colleague (Carpool)'],
    };
  }

  if (q.includes('book') || q.includes('new ride') || q.includes('tomorrow') || q.includes('schedule')) {
    return {
      text: `I'd be glad to arrange your upcoming commute, Akshat!\n\nI can set up your direct corporate cab from **Wakad to TCS Hinjewadi Phase 1** for tomorrow morning. We have scheduled slots available at **08:00 AM**, **08:30 AM**, and **09:00 AM**.\n\nWhich pickup slot suits your schedule best?`,
      chips: ['📅 Book 08:00 AM Slot', '📅 Book 08:30 AM Slot', '📅 Book 09:00 AM Slot', '🕒 Custom Timing'],
    };
  }

  // 7. Human Support / Escalation
  if (q.includes('ticket') || q.includes('open ticket') || q.includes('#shv-8821')) {
    return {
      text: `Priority Support Ticket **#SHV-8821** has been opened and assigned to **Priya Sharma** at Hinjewadi Operations Desk.\n\n• **Issue Category**: Commute Delay & Route Optimization\n• **Assigned Team**: TCS Dedicated Fleet Control\n• **Status**: In Progress (Priya has joined the VHF radio channel)\n• **Target Resolution**: Under 2 minutes`,
      special: 'ticket',
      hasDispatchDesk: true,
      chips: ['🎧 Call Hinjewadi Desk', '💬 Send Note to Priya', 'Dismiss Ticket'],
    };
  }

  if (q.includes('support') || q.includes('human') || q.includes('agent') || q.includes('speak') || q.includes('dispatcher') || q.includes('representative')) {
    return {
      text: `I'm connecting you directly with our dedicated transport operations desk at the Hinjewadi Hub.\n\n**Priya Sharma** (Lead Dispatcher) is active on radio right now and will take over immediately. I've already forwarded all your ride telemetry and history so you won't have to repeat anything.`,
      special: 'escalate',
      hasDispatchDesk: true,
      chips: ['🎧 Call Hinjewadi Desk', '🎫 Open Ticket #SHV-8821', 'Continue with AI'],
    };
  }

  // 8. Billing or Invoice
  if (q.includes('statement') || q.includes('email monthly') || q.includes('pdf')) {
    return {
      text: `I've sent your September Corporate Transport Statement (PDF with 24 verified commute logs) to **akshat.sharma@tcs.com**.\n\n• **Total Rides**: 24 completed\n• **Total Distance**: 384 km\n• **Corporate Coverage**: 100% (Tier 1 Executive)\n• **Employee Liability**: ₹0.00\n\nLet me know if you need any cost center adjustments for your TCS SAP expense filing!`,
      chips: ['🔍 View Cost Breakdown', '💬 Contact Finance Desk', '🚗 Track My Ride'],
    };
  }

  if (q.includes('billing') || q.includes('invoice') || q.includes('cost') || q.includes('reimbursement')) {
    return {
      text: `I've accessed your corporate transport billing account under **TCS Pune (Org ID: ORG-TCS)**.\n\nAll employee commutes under your authorized policy tier are billed directly to your business unit. Your September commute statement shows **24 active trips** with 100% corporate coverage and **₹0 personal liability**.\n\nWould you like me to email you the detailed trip log PDF or connect you with corporate finance?`,
      chips: ['📄 Email Monthly Statement', '🔍 View Trip Cost Breakdown', '💬 Contact Finance Desk'],
    };
  }

  // 9. Account & Access
  if (q.includes('account') || q.includes('access') || q.includes('login') || q.includes('permission')) {
    return {
      text: `You are currently authenticated as **Akshat Sharma** with **Transport Manager** privileges for TCS Pune.\n\nYou have active authorization for Live Fleet Tracking, Trip Dispatch, Driver Verification, and SOS Protocols. If you need elevated access for Org-wide Driver Payroll or Route Re-engineering, I can submit an approval request to your System Administrator.`,
      chips: ['🔐 Request Elevated Access', '🔄 Sync SSO Credentials', '📋 View My Permissions'],
    };
  }

  // 10. Standby Cab query
  if (q.includes('standby') || q.includes('backup') || q.includes('reassign')) {
    return {
      text: `I've located standby cab **MH12DE7788** (White Maruti Ertiga · Driver **Suresh Pawar** · ⭐ 4.90).\n\nSuresh is stationed near Sayaji Bypass, only **4 minutes away** from your Wakad pickup point. Would you like me to swap RIDE-10482 to Suresh right now?`,
      special: 'standby_offer',
      chips: ['⚡ Confirm Standby Reassignment', 'Keep Raj Kumar (12m)', '📞 Call Suresh Pawar'],
    };
  }

  // Default warm concierge response
  return {
    text: `Hi Akshat! I'm on it. As your executive transport concierge, I can assist you with your active ride (**RIDE-10482** with Raj Kumar), route telemetry, bookings, driver communications, or fleet safety.\n\nHow can I make your commute smoother right now?`,
    hasRideCard: true,
    chips: ['🚗 Track My Ride', '🕐 Driver is Late', '❌ Cancel Ride', '💬 Connect to Support'],
  };
}

// ─── Markdown & Formatted Text Parser Helper ──────────────────────────────
function FormattedMessageText({ text }: { text: string }) {
  const paragraphs = text.split('\n\n');

  const renderLineContent = (line: string) => {
    const isBullet = line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ');
    const rawLine = isBullet ? line.trim().replace(/^([•\-*]\s+)/, '') : line;
    const parts = rawLine.split(/(\*\*.*?\*\*|`.*?`)/g);

    const rendered = parts.map((part, partIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={partIdx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeContent = part.slice(1, -1);
        if (/MH\s?\d{2}\s?[A-Z]{1,2}\s?\d{4}/i.test(codeContent)) {
          return (
            <span key={partIdx} className="ind-plate mx-1 align-baseline">
              <span className="ind-plate-blue">IND</span>
              {codeContent}
            </span>
          );
        }
        return (
          <code
            key={partIdx}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200/60 font-mono text-xs font-semibold">
            {codeContent}
          </code>
        );
      }
      return part;
    });

    if (isBullet) {
      return (
        <div key={line} className="flex items-start gap-2.5 my-1 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
          <span className="flex-1 leading-relaxed">{rendered}</span>
        </div>
      );
    }

    return rendered;
  };

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-slate-800">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {lIdx > 0 && !line.trim().startsWith('• ') && !line.trim().startsWith('- ') && !line.trim().startsWith('* ') && <br />}
                {renderLineContent(line)}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Quick Actions Grid ─────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '🚗', label: 'Track my ride', q: 'Where is my driver right now? Track RIDE-10482.' },
  { icon: '🕐', label: 'Driver is late', q: "My driver hasn't arrived yet. Can you check why RIDE-10482 is delayed?" },
  { icon: '❌', label: 'Cancel my ride', q: 'I want to cancel my ride for today.' },
  { icon: '📍', label: 'Change pickup', q: 'I need to change my pickup location for today.' },
  { icon: '📅', label: 'Book a ride', q: 'I want to book a ride for tomorrow morning from Wakad to Hinjewadi.' },
  { icon: '🆘', label: 'Emergency / SOS', q: 'I need emergency help immediately.' },
  { icon: '💳', label: 'Billing issue', q: 'I have a question about my monthly transport billing.' },
  { icon: '🔐', label: 'Account & access', q: 'I have an account or access permissions query.' },
];

const SLASH_CMDS = [
  { cmd: '/track', label: 'Track live driver & ETA', q: 'Where is my driver right now? Track RIDE-10482.' },
  { cmd: '/call', label: 'Simulate direct call to driver', q: 'Call Raj Kumar right now.' },
  { cmd: '/map', label: 'Open live GPS route tracker', q: 'Show live route GPS map for RIDE-10482.' },
  { cmd: '/standby', label: 'Request standby backup cab', q: 'Can you assign a standby cab nearby?' },
  { cmd: '/cancel', label: 'Cancel current trip', q: 'I want to cancel my ride for today.' },
  { cmd: '/support', label: 'Connect to Hinjewadi Desk', q: 'Connect me with the Hinjewadi operations desk.' },
  { cmd: '/sos', label: 'Trigger urgent emergency SOS', q: 'Emergency help needed immediately.' },
];

// ─── Main Component ────────────────────────────────────────────────────────
export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState('Consulting fleet telemetry...');
  const [showHist, setShowHist] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);

  // Active Interactive Modals
  const [showCallModal, setShowCallModal] = useState<ActiveRide | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callConnected, setCallConnected] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [callSpeaker, setCallSpeaker] = useState(false);

  const [showMapModal, setShowMapModal] = useState(false);
  const [showQuickSmsModal, setShowQuickSmsModal] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);

  // Draggable button position
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const isDragging = useRef(false);

  // Auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, thinking]);

  // Call timer effect
  useEffect(() => {
    let timer: any;
    if (showCallModal) {
      // simulate connection after 2 seconds
      const connectTimeout = setTimeout(() => setCallConnected(true), 2000);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      return () => {
        clearTimeout(connectTimeout);
        clearInterval(timer);
      };
    } else {
      setCallDuration(0);
      setCallConnected(false);
    }
  }, [showCallModal]);

  // Toast auto-clear
  useEffect(() => {
    if (notificationToast) {
      const t = setTimeout(() => setNotificationToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [notificationToast]);

  // Speech Recognition (Web Speech API)
  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in (window as any))) {
      // Fallback simulation
      if (isListening) {
        setIsListening(false);
      } else {
        setIsListening(true);
        setTimeout(() => {
          setIsListening(false);
          setInput('Where is my driver right now? Is he delayed?');
        }, 2500);
      }
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakMessage = (text: string) => {
    if (!soundEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*`#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Draggable FAB Handlers
  const handleBtnMouseDown = (e: React.MouseEvent) => {
    if (open) return;
    e.preventDefault();
    const el = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = btnPos ? btnPos.x : window.innerWidth - el.width - 24;
    const origY = btnPos ? btnPos.y : window.innerHeight - el.height - 24;
    dragRef.current = { startX, startY, origX, origY };
    isDragging.current = false;

    const onMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const dy = me.clientY - startY;
      if (!isDragging.current && Math.abs(dx) + Math.abs(dy) > 4) isDragging.current = true;
      if (!isDragging.current) return;
      const newX = Math.max(0, Math.min(window.innerWidth - el.width, origX + dx));
      const newY = Math.max(0, Math.min(window.innerHeight - el.height, origY + dy));
      setBtnPos({ x: newX, y: newY });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const handleBtnClick = () => {
    if (!isDragging.current) setOpen(true);
    isDragging.current = false;
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    setSlashOpen(val.startsWith('/') && val.length >= 1);
  };

  // Core Send Logic with Groq LLM + Human Concierge Fallback
  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    setSlashOpen(false);
    const userMsg: ChatMsg = {
      id: String(Date.now()),
      role: 'user',
      text: trimmed,
      ts: new Date(),
    };
    setMsgs((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Dynamic realistic thinking status
    const statusCycle = [
      'Accessing live telemetry for RIDE-10482...',
      'Connecting to Hinjewadi traffic sensors...',
      'Verifying driver location with GPS tower...',
      'Formulating concierge response...',
    ];
    let sIdx = 0;
    const interval = setInterval(() => {
      sIdx = (sIdx + 1) % statusCycle.length;
      setThinkingStatus(statusCycle[sIdx]);
    }, 700);

    let finalResponseText = '';
    let special: MsgSpecial | undefined;
    let hasRideCard = false;
    let hasDispatchDesk = false;
    let chips: string[] = [];

    try {
      // 1. First attempt Groq API with human prompt
      if (GROQ_KEY) {
        const messages = [
          { role: 'system', content: SHIVNERI_SYSTEM },
          ...msgs.slice(-8).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
          { role: 'user', content: trimmed },
        ];

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${GROQ_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            max_tokens: 600,
            temperature: 0.65,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const raw = data.choices?.[0]?.message?.content ?? '';
          finalResponseText = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
      }
    } catch {
      // Handled via local intelligent engine
    }

    clearInterval(interval);

    // If Groq response was empty or errored or lacked human quality, use human concierge engine
    if (!finalResponseText || finalResponseText.startsWith('Error:') || finalResponseText.length < 15) {
      const fallback = generateHumanResponse(trimmed);
      finalResponseText = fallback.text;
      special = fallback.special;
      hasRideCard = fallback.hasRideCard ?? false;
      hasDispatchDesk = fallback.hasDispatchDesk ?? false;
      chips = fallback.chips ?? [];
    } else {
      // Parse any tags if present in LLM response
      const TAGS: [string, MsgSpecial][] = [
        ['[EMERGENCY]', 'emergency'],
        ['[TICKET]', 'ticket'],
        ['[CANCEL_CONFIRM]', 'cancel_confirm'],
        ['[PERMISSION]', 'permission'],
        ['[ESCALATE]', 'escalate'],
      ];
      for (const [tag, sp] of TAGS) {
        if (finalResponseText.startsWith(tag)) {
          special = sp;
          finalResponseText = finalResponseText.replace(tag, '').trim();
          break;
        }
      }

      // If ride or delay is discussed, enrich with interactive card
      if (/RIDE-\d{4,}|Raj Kumar|driver|late|delay|track|eta/i.test(finalResponseText + ' ' + trimmed)) {
        hasRideCard = true;
      }
      if (/desk|human|escalat|agent|support|ticket/i.test(finalResponseText + ' ' + trimmed)) {
        hasDispatchDesk = true;
      }

      // Default smart chips if not already set
      chips = hasRideCard
        ? ['📞 Call Raj Kumar', '📍 View Live GPS', '⚡ Request Standby Cab', '💬 Talk to Dispatcher']
        : ['🚗 Track My Ride', '🕐 Driver is Late', '❌ Cancel Ride', '💬 Connect to Support'];
    }

    setThinking(false);

    const aiMsg: ChatMsg = {
      id: String(Date.now() + 1),
      role: 'ai',
      text: finalResponseText,
      special,
      hasRideCard,
      hasDispatchDesk,
      chips,
      ts: new Date(),
    };

    setMsgs((prev) => [...prev, aiMsg]);

    // Optional audio playback
    if (soundEnabled && !special) {
      speakMessage(finalResponseText);
    }
  };

  // Actions
  const handleNotifyDriver = (msgId: string) => {
    setMsgs((prev) => prev.map((m) => (m.id === msgId ? { ...m, driverNotified: true } : m)));
    setNotificationToast("🔔 Driver Raj Kumar alerted via in-cab chime: 'Passenger is waiting at Gate 2'");
  };

  const handleSimulateCall = (ride: ActiveRide) => {
    setShowCallModal(ride);
  };

  const handleConfirmCancel = () => {
    const successMsg: ChatMsg = {
      id: String(Date.now()),
      role: 'ai',
      text: `Your ride **RIDE-10482** has been cancelled successfully.\n\nRaj Kumar has been released from your pickup, and this trip has been logged under zero-cancellation penalty. Would you like me to schedule a ride for your return shift or tomorrow?`,
      special: 'cancel_success',
      chips: ['📅 Book Tomorrow Morning', '🚗 Book Return Shift (6:00 PM)', '💬 Speak with Desk'],
      ts: new Date(),
    };
    setMsgs((prev) => [...prev, successMsg]);
    setNotificationToast('✓ Ride RIDE-10482 Cancelled (Zero Penalty)');
  };

  const handleRequestStandby = () => {
    const standbyMsg: ChatMsg = {
      id: String(Date.now()),
      role: 'ai',
      text: `I've assigned nearby standby cab **MH12DE7788** (White Ertiga · Driver **Suresh Pawar** · ⭐ 4.9).\n\nSuresh is currently stationed at **Sayaji Bypass**, only **4 minutes away** from your Wakad pickup. He is dispatched directly to meet you at Gate 2.`,
      special: 'standby_offer',
      hasRideCard: false,
      chips: ['📞 Call Suresh Pawar (+91 98220 54321)', '📍 View on Live GPS', 'Keep Original Cab'],
      ts: new Date(),
    };
    setMsgs((prev) => [...prev, standbyMsg]);
    setNotificationToast('⚡ Standby Cab MH12DE7788 Dispatched (4m away)');
  };

  const giveFeedback = (msgId: string, rating: 'up' | 'down') => {
    setMsgs((prev) => prev.map((m) => (m.id === msgId ? { ...m, feedbackGiven: rating } : m)));
    if (rating === 'down') {
      const followup: ChatMsg = {
        id: String(Date.now()),
        role: 'ai',
        text: `I'm genuinely sorry about that, Akshat. Let me connect you directly to our Hinjewadi transport desk so a human fleet manager can resolve this immediately.`,
        special: 'escalate',
        hasDispatchDesk: true,
        chips: ['🎧 Call Hinjewadi Desk', '🎫 Create Ticket', 'Dismiss'],
        ts: new Date(),
      };
      setMsgs((prev) => [...prev, followup]);
    } else {
      setNotificationToast('⭐ Thank you for your feedback!');
    }
  };

  const filteredSlash = SLASH_CMDS.filter((s) => s.cmd.startsWith(input.toLowerCase()) || input === '/');

  return (
    <>
      {/* ─── FLOATING ACTION BUTTON ─────────────────────────────────────── */}
      <button
        onMouseDown={handleBtnMouseDown}
        onClick={handleBtnClick}
        aria-label="Ask Shivneri AI Concierge"
        className="fixed z-40 flex items-center gap-3 px-4 py-3 rounded-2xl text-white text-sm font-bold shadow-2xl transition-all hover:scale-105 select-none group"
        style={{
          background: 'linear-gradient(135deg, #1e40af, #0891b2)',
          boxShadow: '0 10px 30px rgba(30, 64, 175, 0.45)',
          cursor: 'grab',
          ...(btnPos
            ? { left: btnPos.x, top: btnPos.y, bottom: 'auto', right: 'auto' }
            : { bottom: 24, right: 24 }),
        }}>
        <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-white/20 backdrop-blur-sm">
          <span className="text-base text-amber-300 group-hover:rotate-12 transition-transform">✦</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-blue-900 animate-pulse" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold tracking-wide">Shivneri AI</div>
          <div className="text-[10px] text-blue-100 font-normal opacity-90">Executive Concierge</div>
        </div>
      </button>

      {/* ─── TOAST NOTIFICATION ─────────────────────────────────────────── */}
      {notificationToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-2xl border border-slate-700 dialog-in">
          <span>{notificationToast}</span>
        </div>
      )}

      {/* ─── BACKDROP ───────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ─── DRAWER / CHAT WINDOW ───────────────────────────────────────── */}
      {open && (
        <div
          className={`fixed top-0 bottom-0 right-0 z-50 flex flex-col bg-white shadow-2xl transition-all duration-300 slide-in border-l border-slate-200 ${
            isExpanded ? 'w-full md:w-[680px]' : 'w-full max-w-md'
          }`}>
          {/* Header */}
          <div className="relative px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex-shrink-0 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <span className="text-lg">✦</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-white tracking-wide">Shivneri Concierge</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30 font-medium">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Telemetry · TCS Hinjewadi Hub
                  </p>
                </div>
              </div>

              {/* Header Action Buttons */}
              <div className="flex items-center gap-1">
                {/* Voice / Audio toggle */}
                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  title={soundEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${
                    soundEnabled ? 'text-cyan-300 bg-white/10' : 'text-slate-400 hover:bg-white/5'
                  }`}>
                  {soundEnabled ? '🔊' : '🔇'}
                </button>

                {/* History toggle */}
                <button
                  onClick={() => setShowHist((s) => !s)}
                  title="Conversation History"
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${
                    showHist ? 'text-cyan-300 bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                  🕒
                </button>

                {/* Reset / New conversation */}
                <button
                  onClick={() => {
                    setMsgs([]);
                    setInput('');
                  }}
                  title="Start Fresh Conversation"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold">
                  ↺
                </button>

                {/* Expand / Minimize */}
                <button
                  onClick={() => setIsExpanded((e) => !e)}
                  title={isExpanded ? 'Collapse Drawer' : 'Expand Drawer'}
                  className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs">
                  {isExpanded ? '⇲' : '⇱'}
                </button>

                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  title="Close Concierge"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm">
                  ✕
                </button>
              </div>
            </div>

            {/* Active Ride Live Indicator Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-slate-200">Active Ride:</span>
                <span className="font-mono text-cyan-300 font-bold">RIDE-10482</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span>Raj Kumar</span>
                <span className="text-emerald-400 font-semibold">ETA: 12 min</span>
                <button
                  onClick={() => setShowMapModal(true)}
                  className="text-cyan-300 hover:underline flex items-center gap-0.5">
                  Live Map ↗
                </button>
              </div>
            </div>
          </div>

          {/* ─── CONVERSATION HISTORY PANEL ───────────────────────────── */}
          {showHist ? (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Support & Commute History</h3>
                  <p className="text-xs text-slate-500">Your recent corporate transit inquiries</p>
                </div>
                <button
                  onClick={() => setShowHist(false)}
                  className="text-xs text-blue-600 font-semibold hover:underline">
                  ← Back to Chat
                </button>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    title: 'Driver Delay on Wakad Route',
                    time: 'Today 08:31 AM',
                    status: 'Active',
                    tag: 'RIDE-10482',
                    statusColor: 'bg-emerald-100 text-emerald-800',
                  },
                  {
                    title: 'Pickup Location Reschedule',
                    time: 'Yesterday 06:15 PM',
                    status: 'Resolved',
                    tag: 'RIDE-10410',
                    statusColor: 'bg-slate-100 text-slate-700',
                  },
                  {
                    title: 'AC Issue in Vehicle MH12CD5678',
                    time: '20 Sep 2026',
                    status: 'Resolved',
                    tag: 'Feedback',
                    statusColor: 'bg-slate-100 text-slate-700',
                  },
                  {
                    title: 'September Corporate Allowance Query',
                    time: '18 Sep 2026',
                    status: 'Closed',
                    tag: 'Billing',
                    statusColor: 'bg-blue-100 text-blue-700',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setShowHist(false)}
                    className="p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{item.time}</span>
                      <span className="font-mono text-slate-400">{item.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* ─── MESSAGES CONTAINER ─────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
                {msgs.length === 0 ? (
                  /* Welcome Screen */
                  <div className="py-4 space-y-5">
                    {/* Welcome Card */}
                    <div className="p-5 bg-gradient-to-br from-white to-blue-50/40 rounded-2xl border border-blue-100 shadow-sm text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-md">
                        ✦
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Good morning, Akshat 👋</h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                        I'm your corporate transport concierge for <strong className="text-slate-800">TCS Pune</strong>. I'm connected to live fleet telemetry, dispatch radios, and route telemetry.
                      </p>

                      {/* Active trip quick snapshot */}
                      <div className="mt-4 p-3 bg-white rounded-xl border border-blue-200/80 shadow-xs flex items-center justify-between text-left">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">🚘</span>
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              RIDE-10482 · Raj Kumar
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Wakad → Hinjewadi Ph1 · <span className="text-emerald-600 font-semibold">12m away</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => send("My driver hasn't arrived yet. Can you check why RIDE-10482 is delayed?")}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-xs">
                          Check Trip
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Grid */}
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1">
                        Frequently Requested
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {QUICK_ACTIONS.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => send(item.q)}
                            className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 text-left transition-all shadow-xs group">
                            <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                              {item.icon}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700 leading-tight">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-center text-[11px] text-slate-400">
                      Or speak naturally, type questions, or enter <code className="text-blue-600 font-mono">/</code> for commands.
                    </p>
                  </div>
                ) : (
                  msgs.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {/* AI Avatar */}
                      {m.role === 'ai' && (
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 shadow-sm">
                          ✦
                        </div>
                      )}

                      <div
                        className={`flex flex-col gap-1.5 ${
                          m.role === 'user'
                            ? 'items-end max-w-[85%]'
                            : 'items-start max-w-[92%] w-full'
                        }`}>
                        {/* ─── SPECIAL CARDS ─── */}

                        {/* EMERGENCY CARD */}
                        {m.special === 'emergency' && (
                          <div className="w-full rounded-2xl overflow-hidden border-2 border-red-500 shadow-xl dialog-in">
                            <div className="bg-red-600 px-4 py-2.5 flex items-center justify-between text-white">
                              <div className="flex items-center gap-2">
                                <span className="text-lg animate-bounce">🚨</span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  Urgent Emergency Protocol Active
                                </span>
                              </div>
                              <span className="text-[10px] bg-red-700 px-2 py-0.5 rounded font-mono">
                                HIGH PRIORITY
                              </span>
                            </div>
                            <div className="bg-red-50 p-4 space-y-3">
                              <p className="text-xs font-medium text-red-950 leading-relaxed">
                                {m.text}
                              </p>
                              <div className="bg-white rounded-xl p-3 border border-red-200 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Active Ride:</span>
                                  <span className="font-mono font-bold text-slate-800">RIDE-10482</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Live Driver:</span>
                                  <span className="font-semibold text-slate-800">Raj Kumar (+91 98765 10482)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">GPS Coordinates:</span>
                                  <span className="font-mono text-emerald-700 font-semibold">
                                    18.5982° N, 73.7644° E (Wakad)
                                  </span>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <a
                                  href="tel:112"
                                  className="py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors">
                                  🚨 Call Police (112)
                                </a>
                                <a
                                  href="tel:+912067899999"
                                  className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl text-center shadow-md transition-colors">
                                  🛡️ TCS Security Desk
                                </a>
                                <button
                                  onClick={() => setNotificationToast('📍 GPS Location Broadcasted to Corporate Security')}
                                  className="py-2.5 px-3 bg-white border border-red-300 text-red-700 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors">
                                  Broadcast Location
                                </button>
                                <button
                                  onClick={() => setShowCallModal(DEFAULT_RIDE)}
                                  className="py-2.5 px-3 bg-white border border-red-300 text-red-700 text-xs font-semibold rounded-xl hover:bg-red-50 transition-colors">
                                  Call Vehicle Direct
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CANCELLATION CONFIRMATION CARD */}
                        {m.special === 'cancel_confirm' && (
                          <div className="w-full rounded-2xl overflow-hidden border border-amber-200 bg-white shadow-md dialog-in">
                            <div className="px-4 py-2.5 bg-amber-500 text-white flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>❌</span>
                                <span className="text-xs font-bold tracking-wide uppercase">
                                  Confirm Ride Cancellation
                                </span>
                              </div>
                              <span className="text-[10px] bg-amber-600 px-2 py-0.5 rounded font-medium">
                                Zero Fee
                              </span>
                            </div>
                            <div className="p-4 space-y-3">
                              <p className="text-xs text-slate-700 leading-relaxed">{m.text}</p>
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Trip ID:</span>
                                  <span className="font-mono font-bold text-slate-800">RIDE-10482</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Route:</span>
                                  <span className="font-semibold text-slate-700">Wakad → Hinjewadi Ph1</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-500">Assigned Driver:</span>
                                  <span className="font-semibold text-slate-700">Raj Kumar (MH12AB1234)</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={handleConfirmCancel}
                                  className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors">
                                  Yes, Cancel Ride
                                </button>
                                <button
                                  onClick={() => send('Please keep my ride active. I will wait for Raj Kumar.')}
                                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                  Keep My Ride
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* NORMAL AI / USER BUBBLE */}
                        {m.special !== 'emergency' && m.special !== 'cancel_confirm' && (
                          <div
                            className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                              m.role === 'user'
                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-xs'
                                : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                            }`}>
                            {m.role === 'user' ? (
                              <p>{m.text}</p>
                            ) : (
                              <div>
                                <FormattedMessageText text={m.text} />

                                {/* Speaker read aloud button on message */}
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                                  <span className="flex items-center gap-1 text-slate-500">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Shivneri Verified Telemetry
                                  </span>
                                  <button
                                    onClick={() => speakMessage(m.text)}
                                    title="Listen to response"
                                    className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                                    <span>🔊</span> Listen
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ─── LIVE TELEMETRY & DRIVER CARD ─── */}
                        {m.role === 'ai' && m.hasRideCard && (
                          <div className="w-full mt-1 bg-white rounded-2xl border border-blue-200/80 shadow-md overflow-hidden dialog-in">
                            {/* Card Top Banner */}
                            <div className="px-4 py-2.5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="font-mono text-xs font-bold text-cyan-300">RIDE-10482</span>
                                <span className="text-[10px] text-slate-300">· Today 08:30 AM Shift</span>
                              </div>
                              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                                ● On Route
                              </span>
                            </div>

                            <div className="p-4 space-y-3.5">
                              {/* Route Progress Visual */}
                              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between text-xs mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                                    <span className="font-semibold text-slate-800">Wakad (Gate 2)</span>
                                  </div>
                                  <div className="text-[11px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    ETA: 12 mins
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span className="font-semibold text-slate-800">TCS Hinjewadi Ph1</span>
                                  </div>
                                </div>

                                {/* Progress Bar with Moving Car Icon */}
                                <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                                    style={{ width: '65%' }}
                                  />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                                  <span>Pickup Point</span>
                                  <span className="text-blue-600 font-semibold">📍 Passing Bhumkar Chowk (1.8 km away)</span>
                                  <span>Drop Location</span>
                                </div>
                              </div>

                              {/* Driver & Vehicle Details */}
                              <div className="flex items-center justify-between p-3 bg-slate-50/70 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-slate-800 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                    RK
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-bold text-slate-900">Raj Kumar</span>
                                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                        ⭐ 4.88
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">
                                      White Swift Dzire · 1,420 safe trips
                                    </div>
                                  </div>
                                </div>

                                {/* Authentic Indian License Plate */}
                                <div>
                                  <span className="ind-plate">
                                    <span className="ind-plate-blue">IND</span>
                                    MH 12 AB 1234
                                  </span>
                                </div>
                              </div>

                              {/* Notification state feedback */}
                              {m.driverNotified && (
                                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                                  <span>✓</span>
                                  <span>Priority in-cab alert delivered to driver's dashboard tablet.</span>
                                </div>
                              )}

                              {/* Interactive Actions */}
                              <div className="grid grid-cols-2 gap-2 pt-1">
                                <button
                                  onClick={() => handleSimulateCall(DEFAULT_RIDE)}
                                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                                  <span>📞</span> Call Raj Kumar
                                </button>
                                <button
                                  onClick={() => setShowMapModal(true)}
                                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors">
                                  <span>🗺️</span> View Live GPS
                                </button>
                                <button
                                  onClick={() => handleNotifyDriver(m.id)}
                                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors">
                                  <span>🔔</span> Ping Driver Waiting
                                </button>
                                <button
                                  onClick={handleRequestStandby}
                                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold rounded-xl border border-cyan-200 transition-colors">
                                  <span>⚡</span> Standby Backup Cab
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ─── HUMAN CONCIERGE DESK CARD (Replacing Bland Grey Table) ─── */}
                        {m.role === 'ai' && m.hasDispatchDesk && (
                          <div className="w-full mt-1 bg-white rounded-2xl border border-blue-200 shadow-md overflow-hidden dialog-in">
                            <div className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-cyan-700 text-white flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>🎧</span>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                  TCS Hinjewadi Transport Desk
                                </span>
                              </div>
                              <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                                Response: &lt; 30 sec
                              </span>
                            </div>

                            <div className="p-4 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                    PS
                                  </div>
                                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-900">
                                    Priya Sharma
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    Lead Shift Dispatcher · Hinjewadi Hub Operations
                                  </div>
                                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                    ● Active on VHF Radio Channel 4
                                  </div>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                                "I have Akshat's route telemetry on my dispatch screen. If Raj is stuck past Bhumkar Chowk, I can reroute him through the service road or authorize a standby fleet cab immediately."
                              </p>

                              <div className="flex gap-2 pt-1">
                                <a
                                  href="tel:+912067891000"
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors">
                                  <span>📞</span> Direct Call (+91 20 6789 1000)
                                </a>
                                <button
                                  onClick={() => {
                                    setNotificationToast('🎫 Support Ticket #SHV-8821 Assigned to Priya Sharma');
                                  }}
                                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors">
                                  Open Priority Ticket
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ─── FEEDBACK ROW ─── */}
                        {m.role === 'ai' && !m.feedbackGiven && (
                          <div className="flex items-center gap-3 px-2 pt-1 text-[11px] text-slate-400">
                            <span>Was this helpful?</span>
                            <button
                              onClick={() => giveFeedback(m.id, 'up')}
                              className="hover:text-emerald-600 transition-colors">
                              👍 Yes
                            </button>
                            <button
                              onClick={() => giveFeedback(m.id, 'down')}
                              className="hover:text-red-500 transition-colors">
                              👎 No
                            </button>
                          </div>
                        )}

                        {/* Feedback given thank you */}
                        {m.feedbackGiven && (
                          <div className="px-2 text-[10px] text-emerald-600 font-medium">
                            ✓ Feedback recorded. Thank you, Akshat!
                          </div>
                        )}

                        {/* Timestamp */}
                        <span className="text-[10px] text-slate-400 px-1 mt-0.5">
                          {m.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* ─── REALISTIC HUMAN CONCIERGE THINKING STATE ─── */}
                {thinking && (
                  <div className="flex justify-start gap-3 dialog-in">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                      ✦
                    </div>
                    <div className="p-4 bg-white rounded-2xl rounded-tl-xs border border-blue-200/80 shadow-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">Shivneri Concierge is checking...</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono animate-pulse">
                        {thinkingStatus}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {/* ─── DYNAMIC CONTEXTUAL QUICK ACTION CHIPS ───────────────── */}
              {msgs.length > 0 && !thinking && (
                <div
                  className="flex gap-2 px-4 py-2.5 overflow-x-auto border-t border-slate-200 bg-white flex-shrink-0"
                  style={{ scrollbarWidth: 'none' }}>
                  {(msgs[msgs.length - 1]?.chips || [
                    '📞 Call Raj Kumar',
                    '📍 View Live GPS',
                    '⚡ Request Standby Cab',
                    '💬 Connect to Desk',
                  ]).map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (chip.includes('Call Raj')) {
                          setShowCallModal(DEFAULT_RIDE);
                        } else if (chip.includes('Live GPS')) {
                          setShowMapModal(true);
                        } else if (chip.includes('Standby')) {
                          handleRequestStandby();
                        } else {
                          send(chip);
                        }
                      }}
                      className="flex-shrink-0 px-3.5 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full hover:bg-blue-100 hover:text-blue-700 border border-slate-200/70 hover:border-blue-300 transition-all whitespace-nowrap shadow-2xs">
                      {chip}
                    </button>
                  ))}
                </div>
              )}

              {/* ─── SLASH COMMAND POPUP ─────────────────────────────────── */}
              {slashOpen && filteredSlash.length > 0 && (
                <div className="mx-4 mb-2 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden flex-shrink-0 dialog-in">
                  <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Shivneri Commands
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredSlash.map((s) => (
                      <button
                        key={s.cmd}
                        onClick={() => {
                          setInput('');
                          send(s.q);
                          setSlashOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-blue-600 font-mono w-20 flex-shrink-0">
                            {s.cmd}
                          </span>
                          <span className="text-xs text-slate-700">{s.label}</span>
                        </div>
                        <span className="text-[11px] text-slate-400">↵</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── INPUT DOCK ─────────────────────────────────────────── */}
              <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
                <div
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 bg-slate-50 transition-all ${
                    thinking
                      ? 'border-slate-200 opacity-60'
                      : 'border-slate-300 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-blue-100'
                  }`}>
                  {/* Voice Input Button */}
                  <button
                    onClick={toggleVoiceInput}
                    title={isListening ? 'Stop listening' : 'Speak to Shivneri Concierge'}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-blue-600 hover:bg-slate-200/60'
                    }`}>
                    {isListening ? (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 sound-wave-bar bg-white rounded-full" />
                        <span className="w-1 sound-wave-bar bg-white rounded-full" style={{ animationDelay: '0.2s' }} />
                        <span className="w-1 sound-wave-bar bg-white rounded-full" style={{ animationDelay: '0.4s' }} />
                      </span>
                    ) : (
                      '🎙️'
                    )}
                  </button>

                  <input
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none"
                    placeholder={isListening ? 'Listening to your voice...' : 'Type or ask naturally (e.g. Where is my driver?)...'}
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setSlashOpen(false);
                        return;
                      }
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    disabled={thinking}
                  />

                  {/* Send Button */}
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || thinking}
                    title="Send message"
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                    style={{
                      background:
                        input.trim() && !thinking
                          ? 'linear-gradient(135deg, #1e40af, #0891b2)'
                          : '#e2e8f0',
                    }}>
                    <span
                      className={`text-sm font-bold ${
                        input.trim() && !thinking ? 'text-white' : 'text-slate-400'
                      }`}>
                      ↑
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
                  <span>Shivneri AI Concierge · Executive Transport Edition</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Telematics Active
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── SIMULATED IN-APP CALL OVERLAY MODAL ────────────────────────── */}
      {showCallModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 dialog-in">
          <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 text-center relative overflow-hidden">
            {/* Background glowing rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Shivneri Corporate Telecom
              </div>

              {/* Driver photo/avatar */}
              <div className="relative mx-auto w-24 h-24">
                <div
                  className={`w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-slate-800 ${
                    callConnected ? 'border-emerald-500' : 'call-ring-active'
                  }`}>
                  RK
                </div>
                {callConnected && (
                  <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-xs">
                    ✓
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {showCallModal.driver}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Assigned Driver · Swift Dzire ({showCallModal.vehicle})
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
                  {callConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-400 font-semibold">
                        Connected · 00:
                        {callDuration < 10 ? `0${callDuration}` : callDuration}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-amber-300">Ringing driver tablet...</span>
                    </>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <button
                  onClick={() => setCallMuted((m) => !m)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
                    callMuted ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}>
                  <span className="text-xl">{callMuted ? '🔇' : '🎙️'}</span>
                  <span className="text-[10px] font-medium">{callMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button
                  onClick={() => setCallSpeaker((s) => !s)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-colors ${
                    callSpeaker ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}>
                  <span className="text-xl">{callSpeaker ? '🔊' : '🔈'}</span>
                  <span className="text-[10px] font-medium">Speaker</span>
                </button>

                <button
                  onClick={() => {
                    setNotificationToast('📱 Quick SMS: "Waiting at Gate 2" sent to driver');
                  }}
                  className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors">
                  <span className="text-xl">💬</span>
                  <span className="text-[10px] font-medium">Quick SMS</span>
                </button>
              </div>

              {/* End Call Button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCallModal(null)}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white text-2xl flex items-center justify-center mx-auto shadow-xl transition-transform hover:scale-105 active:scale-95">
                  ✕
                </button>
                <div className="text-[11px] text-slate-400 mt-2">End Conversation</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── LIVE GPS & ROUTE MAP MODAL ─────────────────────────────────── */}
      {showMapModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 dialog-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm">
                  🗺️
                </div>
                <div>
                  <h3 className="text-sm font-bold">Live GPS Telemetry Tracker</h3>
                  <p className="text-[11px] text-slate-400">RIDE-10482 · Wakad to Hinjewadi Phase 1</p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm flex items-center justify-center">
                ✕
              </button>
            </div>

            {/* Simulated Live Route Canvas */}
            <div className="p-6 bg-slate-50 space-y-4 overflow-y-auto">
              {/* Graphical schematic of Pune route */}
              <div className="relative h-48 bg-slate-800 rounded-2xl overflow-hidden p-4 border border-slate-700 shadow-inner flex flex-col justify-between">
                {/* Map Grid Background pattern */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                />

                {/* Waypoint Track */}
                <div className="relative z-10 flex items-center justify-between text-xs text-white">
                  <div className="flex items-center gap-1.5 bg-blue-600/80 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    <span>📍</span> Wakad Gate 2 (Pickup)
                  </div>
                  <div className="text-emerald-400 font-mono text-[11px] bg-slate-900/80 px-2 py-0.5 rounded border border-emerald-500/30">
                    Live Speed: 28 km/h
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-700/80 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    <span>🏢</span> TCS Hinjewadi Ph1 (Drop)
                  </div>
                </div>

                {/* Road Path & Pulsing Car Marker */}
                <div className="relative z-10 my-auto">
                  <div className="h-3 bg-slate-700 rounded-full relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full"
                      style={{ width: '62%' }}
                    />
                  </div>
                  <div
                    className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-700"
                    style={{ left: '60%' }}>
                    <div className="w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg border-2 border-emerald-500 flex items-center justify-center text-sm font-bold animate-pulse">
                      🚗
                    </div>
                  </div>
                </div>

                {/* Live Landmarks along Pune bypass */}
                <div className="relative z-10 flex justify-between text-[10px] text-slate-400">
                  <span>Wakad Bridge (Passed)</span>
                  <span className="text-amber-400 font-semibold">📍 Bhumkar Chowk (Traffic +4m)</span>
                  <span>Sayaji Bypass</span>
                  <span>Hinjewadi Shivaji Chowk</span>
                </div>
              </div>

              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { label: 'ETA Arrival', val: '12 mins', color: 'text-emerald-700' },
                  { label: 'Distance', val: '1.8 km', color: 'text-slate-800' },
                  { label: 'In-Cab AC', val: 'Active (22°C)', color: 'text-cyan-700' },
                  { label: 'Vehicle Fuel', val: '84% (Full)', color: 'text-slate-800' },
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 text-center">
                    <div className="text-[10px] text-slate-500 font-medium">{stat.label}</div>
                    <div className={`text-xs font-bold font-mono mt-0.5 ${stat.color}`}>
                      {stat.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Driver Card Row */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                    RK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Raj Kumar · White Dzire
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <span className="ind-plate mr-1">
                        <span className="ind-plate-blue">IND</span>MH 12 AB 1234
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMapModal(false);
                    setShowCallModal(DEFAULT_RIDE);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
                  📞 Call Driver Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
