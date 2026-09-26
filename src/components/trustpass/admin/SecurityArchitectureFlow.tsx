import React, { useState } from 'react';

export function SecurityArchitectureFlow() {
  const [activeStep, setActiveStep] = useState<number>(6); // Default on Policy Engine
  const [showAdminUnmaskModal, setShowAdminUnmaskModal] = useState(false);
  const [unmaskJustification, setUnmaskJustification] = useState('');
  const [isUnmasked, setIsUnmasked] = useState(false);

  // 10 stages of backend flow from prompt
  const FLOW_STAGES = [
    { num: 1, title: 'Employee / Driver', role: 'Actors', desc: 'Bilateral mobile clients initiate rendezvous', icon: '📱' },
    { num: 2, title: 'Authentication', role: 'OAuth 2.0 / OIDC', desc: 'Cryptographic keystore token verification', icon: '🔑' },
    { num: 3, title: 'Tenant Resolution', role: 'Multi-Tenant', desc: 'Isolates client corporate security domain', icon: '🏢' },
    { num: 4, title: 'RBAC', role: 'Role Permissions', desc: 'Validates transport manager & driver scopes', icon: '🛡' },
    { num: 5, title: 'ABAC', role: 'Attribute Claims', desc: 'Evaluates shift, location, and group tags', icon: '🏷' },
    { num: 6, title: 'TrustPass Context', role: '8-Point Signal', desc: 'Synthesizes identity, ride, vehicle, geofence', icon: '🌐' },
    { num: 7, title: 'Policy Engine', role: 'Authoritative', desc: 'Evaluates strict vs fallback rule profiles', icon: '⚙' },
    { num: 8, title: 'Verification Decision', role: 'Decision Gate', desc: 'ALLOW / FALLBACK / APPROVAL / DENY', icon: '⚖' },
    { num: 9, title: 'Boarding', role: 'Dispatch State', desc: 'Real-time state transition to active ride', icon: '🚗' },
    { num: 10, title: 'Audit Ledger', role: 'Non-Repudiation', desc: 'Immutable HSM signed cryptographic record', icon: '📜' },
  ];

  // Future-ready modules from prompt
  const FUTURE_MODULES = [
    { name: 'Passkeys (FIDO2 / WebAuthn)', status: 'ACTIVE IN STAGING', tier: 'Biometric Keystore', icon: '🔐', desc: 'FIDO2 hardware biometric key enrollment for passwordless driver & passenger verification.' },
    { name: 'Verifiable Credentials (W3C DID)', status: 'ROADMAP Q1 2027', tier: 'Decentralized Identity', icon: '🪪', desc: 'Cryptographically verifiable digital employee badges issued directly to corporate Apple/Google Wallets.' },
    { name: 'Digital Employee Identity', status: 'ACTIVE', tier: 'Zero-Trust ID', icon: '👤', desc: 'Real-time HRMS employee state synchronization with instant termination token revocation.' },
    { name: 'Digital Driver Identity', status: 'ACTIVE', tier: 'RTO & Police Verified', icon: '🪪', desc: 'DigiLocker automated driving license validity and criminal background verification.' },
    { name: 'NFC Contactless Handshake', status: 'ACTIVE IN STAGING', tier: 'Hardware Security', icon: '📡', desc: 'ISO 14443 Type A contactless tap between driver terminal and employee corporate smartcard.' },
    { name: 'BLE Proximity Radar', status: 'ACTIVE IN STAGING', tier: 'Micro-location', icon: '📶', desc: 'Bluetooth Low Energy RSSI distance attenuation confirms sub-3-meter physical presence.' },
    { name: 'Connected Vehicle Identity (CAN bus)', status: 'ROADMAP Q2 2027', tier: 'OBD-II Telematics', icon: '🚌', desc: 'Direct in-vehicle ECU telemetry broadcast confirming engine start only upon passenger authorization.' },
    { name: 'Telematics Verification', status: 'ACTIVE', tier: 'Fleet IoT', icon: '📊', desc: 'GPS, accelerometer, and door sensor telemetry validates vehicle came to a complete halt.' },
    { name: 'Device Attestation (Play Integrity)', status: 'ACTIVE', tier: 'OS Integrity', icon: '📱', desc: 'Hardware backed Play Integrity and Apple DeviceCheck blocks rooted devices and GPS spoofers.' },
    { name: 'Autonomous Vehicle Identity', status: 'STANDARDS COMPLIANT', tier: 'Future Mobility V2X', icon: '🤖', desc: 'V2X mutual cryptographic authentication protocol for future driverless robo-shuttles.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Final UX Creed Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500 text-slate-950 uppercase tracking-wider">
                SHIVNERI TRUSTPASS ARCHITECTURE
              </span>
              <h3 className="text-xl font-black text-white mt-2 tracking-tight">
                “Right Employee. Right Driver. Right Vehicle. Right Ride. Right Place. Right Time.”
              </h3>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-blue-300 font-mono">
              Zero-Trust Authoritative Backend v4.2
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            TrustPass must <strong>NEVER</strong> be only a frontend feature. Mobile apps capture physical tokens; all verification decisions are authoritatively computed on the isolated backend engine with non-repudiation cryptographic ledgers.
          </p>

          {/* Experience Journey Pill Stream */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 tracking-wider">
              Authoritative Journey Lifecycle
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {[
                'IDENTIFY', 'MATCH', 'VERIFY', 'AUTHORIZE', 'BOARD', 'TRACK', 'SAFE DROP', 'AUDIT'
              ].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-blue-300 border border-slate-700">
                    {step}
                  </span>
                  {idx < arr.length - 1 && (
                    <span className="text-slate-500 font-bold px-0.5">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Backend Flow Pipeline Diagram */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Backend Verification Pipeline (10 Stages)</h4>
            <p className="text-xs text-slate-500">Zero-Trust Authoritative Decision Tree executed in under 8 milliseconds</p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
            Server-Authoritative Enforcement ✓
          </span>
        </div>

        {/* Pipeline Horizontal Flow */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {FLOW_STAGES.map(stage => (
            <div
              key={stage.num}
              onClick={() => setActiveStep(stage.num)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                activeStep === stage.num
                  ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-400 shadow-md'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                  <span>0{stage.num}</span>
                  <span>{stage.icon}</span>
                </div>
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{stage.title}</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-0.5">{stage.role}</div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 line-clamp-2 leading-tight">
                {stage.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Highlighted Step Inspector */}
        <div className="p-4 bg-slate-900 rounded-xl text-white text-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-400">Inspecting Pipeline Stage 0{activeStep}</span>
            <h5 className="text-sm font-bold text-white mt-0.5">
              {FLOW_STAGES[activeStep - 1].title} — {FLOW_STAGES[activeStep - 1].role}
            </h5>
            <p className="text-xs text-slate-400 mt-1">
              {FLOW_STAGES[activeStep - 1].desc}. Backend guarantees non-bypassable isolation. Client apps receive only cryptographic attestations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-400/30">
              Contract: RFC-7519 JWT + HSM Seal
            </span>
          </div>
        </div>
      </div>

      {/* Privacy-by-Design Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">Privacy-by-Design & Data Redaction</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                GDPR & DPDP Act 2023 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict RBAC / ABAC data minimization prevents passenger and driver PII exposure.
            </p>
          </div>

          <button
            onClick={() => setShowAdminUnmaskModal(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <span>🔐</span> {isUnmasked ? 'Lock Redaction' : 'Request Break-Glass PII Access'}
          </button>
        </div>

        {/* 2-Column Comparison: Driver View vs Employee View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Driver Visibility Limits */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>🚗</span> Driver Screen Restrictions
              </span>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                STRICTLY PROHIBITED
              </span>
            </div>

            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Government ID & Aadhaar:</strong> Never transmitted to or rendered in driver device storage.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Full Phone Numbers:</strong> Strictly masked (<span className="font-mono bg-slate-200 px-1 rounded">{isUnmasked ? '+91 98201 10421' : '+91 XXXXXXXX21'}</span>). Calls routed through virtual proxy bridge.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Personal Email & HR Data:</strong> Only masked corporate alias shown (<span className="font-mono bg-slate-200 px-1 rounded">{isUnmasked ? 'akshat.gupta@tcs.in' : 'a****a@company.com'}</span>).
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Emergency Contacts:</strong> Masked unless an active SOS safety incident is declared by transport ops.
                </div>
              </li>
            </ul>
          </div>

          {/* Employee Visibility Limits */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>👤</span> Employee Screen Restrictions
              </span>
              <span className="text-[10px] font-mono bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">
                DATA MINIMIZATION
              </span>
            </div>

            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Driver Private Documents:</strong> Personal residential address, bank accounts, and family details are never accessible.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-600 font-bold">✕</span>
                <div>
                  <strong className="text-slate-800">Vehicle Compliance Docs:</strong> Insurance policy numbers and chassis certificates redacted; only verified badge displayed.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <div>
                  <strong className="text-slate-800">Verified Identity Only:</strong> Name (<span className="font-semibold text-slate-800">Raj Kumar</span>), Verified Partner badge, RTO Plate (<span className="font-mono">MH12AB1234</span>), and Driver Star Rating (★ 4.8).
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Future-Ready Modular Architecture */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Future-Ready Verification Integrations</h4>
            <p className="text-xs text-slate-500">
              Pluggable adapter interface: add new hardware and cryptographic credentials without touching core dispatch
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">10 Standard Adapters Ready</span>
        </div>

        {/* 10 Future-ready Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FUTURE_MODULES.map(mod => (
            <div key={mod.name} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex flex-col justify-between hover:bg-slate-50 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{mod.icon}</span>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                    mod.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : mod.status.includes('STAGING')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {mod.status}
                  </span>
                </div>
                <div className="font-bold text-xs text-slate-900 leading-snug">{mod.name}</div>
                <div className="text-[10px] text-blue-600 font-medium mt-0.5">{mod.tier}</div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{mod.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 mt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Plug & Play Adapter</span>
                <span className="text-emerald-600 font-bold">API Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Break-glass PII unmask modal */}
      {showAdminUnmaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡</span>
                <h4 className="font-bold text-slate-900 text-base">Break-Glass PII Access Request</h4>
              </div>
              <button onClick={() => setShowAdminUnmaskModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              In compliance with enterprise privacy policy, unmasking full passenger phone numbers and unredacted identities requires security audit justification and creates a high-priority entry in the security audit ledger.
            </p>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                Investigation Reason / Incident Ticket #
              </label>
              <input
                type="text"
                placeholder="e.g. INC-20438 / Emergency Passenger Contact"
                value={unmaskJustification}
                onChange={e => setUnmaskJustification(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAdminUnmaskModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={!unmaskJustification.trim()}
                onClick={() => {
                  setIsUnmasked(!isUnmasked);
                  setShowAdminUnmaskModal(false);
                  alert(`PII display toggled. Audit event logged: SEC-UNMASK-${Date.now()}`);
                }}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold"
              >
                Authorize Unmask
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
