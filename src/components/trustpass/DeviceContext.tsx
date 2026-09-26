import React, { useState } from 'react';

interface DeviceContextProps {
  initialRiskHigh?: boolean;
  onProceed?: () => void;
  onRequestAdditionalAuth?: () => void;
  className?: string;
}

export const DeviceContext: React.FC<DeviceContextProps> = ({
  initialRiskHigh = false,
  onProceed,
  onRequestAdditionalAuth,
  className = '',
}) => {
  const [riskHigh, setRiskHigh] = useState<boolean>(initialRiskHigh);

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>📱</span>
            <span>DEVICE CONTEXT</span>
          </div>
          {/* Risk toggle for simulator */}
          <button
            onClick={() => setRiskHigh(prev => !prev)}
            className="text-[9px] text-cyan-400 underline cursor-pointer"
          >
            Toggle: {riskHigh ? 'Low Risk' : 'High Risk'}
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Device & Session Integrity
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Internal hardware-backed trust signals
          </p>
        </div>

        {/* Clean, Non-Exposing Display as mandated */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3 mb-4 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
            <span className="text-slate-300 font-medium">Employee device:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>Trusted</span>
              <span>✓</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-700/60">
            <span className="text-slate-300 font-medium">Driver device:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>Trusted</span>
              <span>✓</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-300 font-medium">Session:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>Active</span>
              <span>✓</span>
            </span>
          </div>
        </div>

        {/* High Risk Alert Banner */}
        {riskHigh && (
          <div className="bg-amber-950/50 border border-amber-500/50 rounded-xl p-3 text-center space-y-1 mb-3">
            <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
              <span>⚠️</span>
              <span>DEVICE RISK DETECTED</span>
            </div>
            <p className="text-xs text-amber-200 font-semibold">
              “Additional verification required.”
            </p>
            <p className="text-[10px] text-slate-400">
              Unusual network location or new hardware profile detected. Step-up corporate OTP required.
            </p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {!riskHigh ? (
          <button
            onClick={onProceed}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
          >
            DEVICE VERIFIED · PROCEED →
          </button>
        ) : (
          <button
            onClick={onRequestAdditionalAuth}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
          >
            START STEP-UP VERIFICATION
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceContext;
