import React, { useState } from 'react';

interface SmartFallbackProps {
  onSelectMethod?: (method: string) => void;
  onManualOverride?: () => void;
  className?: string;
}

export const SmartFallback: React.FC<SmartFallbackProps> = ({
  onSelectMethod,
  onManualOverride,
  className = '',
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(1);

  const fallbackChain = [
    { id: 'dynamic-qr', label: 'Dynamic QR', status: 'Failed (Camera glare)', icon: '🟦' },
    { id: 'ride-otp', label: 'Ride OTP', status: 'Trying...', icon: '🔐' },
    { id: 'whatsapp-otp', label: 'WhatsApp OTP', status: 'Next in cascade', icon: '📱' },
    { id: 'email-otp', label: 'Corporate Email', status: 'Standby', icon: '✉' },
    { id: 'nfc-ble', label: 'NFC / BLE', status: 'Hardware check', icon: '📳' },
    { id: 'manual', label: 'Control Tower', status: 'Last resort', icon: '🏢' },
  ];

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            ADAPTIVE AUTONOMOUS FALLBACK
          </span>
          <button
            onClick={() => setActiveStepIndex(prev => (prev + 1) % fallbackChain.length)}
            className="text-[9px] text-cyan-400 underline cursor-pointer"
          >
            Advance Step
          </button>
        </div>

        <div className="text-center mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl mx-auto mb-2">
            🔄
          </div>
          <h2 className="text-sm font-extrabold text-white tracking-tight">
            “TrustPass is trying another secure verification method.”
          </h2>
          <p className="text-[11px] text-slate-400 mt-1">
            Intelligent security cascade ensures continuous employee boarding without deadlocks
          </p>
        </div>

        {/* Fallback Chain Stepper */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2 mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Autonomous Cascade Order
          </div>

          {fallbackChain.map((step, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isDone = idx < activeStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                  isCurrent
                    ? 'bg-blue-900/40 border border-blue-500/50 shadow-sm'
                    : isDone
                    ? 'bg-slate-900/60 text-slate-400'
                    : 'bg-slate-900/30 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{step.icon}</span>
                  <div>
                    <div className={`font-bold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {isCurrent ? 'Active Attempt' : isDone ? 'Timed out' : step.status}
                    </div>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      TRYING
                    </span>
                  ) : isDone ? (
                    <span className="text-slate-500 text-[10px]">Skipped</span>
                  ) : (
                    <span className="text-slate-600 text-[10px]">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={() => onSelectMethod?.(fallbackChain[activeStepIndex].id)}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
        >
          CONTINUE WITH {fallbackChain[activeStepIndex].label.toUpperCase()} →
        </button>

        <button
          onClick={onManualOverride}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer"
        >
          Request Manual Control Tower Verification
        </button>
      </div>
    </div>
  );
};

export default SmartFallback;
