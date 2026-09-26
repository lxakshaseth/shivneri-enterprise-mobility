import React, { useState } from 'react';

interface TimeWindowCheckProps {
  windowStart?: string;
  windowEnd?: string;
  initialState?: 'VALID' | 'TOO_EARLY' | 'EXPIRED';
  onProceed?: () => void;
  className?: string;
}

export const TimeWindowCheck: React.FC<TimeWindowCheckProps> = ({
  windowStart = '07:20 AM',
  windowEnd = '07:45 AM',
  initialState = 'VALID',
  onProceed,
  className = '',
}) => {
  const [timeState, setTimeState] = useState<'VALID' | 'TOO_EARLY' | 'EXPIRED'>(initialState);

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>⏱️</span>
            <span>SHIFT TIME POLICY</span>
          </div>
          {/* Quick simulator selector */}
          <div className="flex gap-1 text-[9px]">
            <button
              onClick={() => setTimeState('TOO_EARLY')}
              className={`px-1.5 py-0.5 rounded ${timeState === 'TOO_EARLY' ? 'bg-amber-600 font-bold' : 'text-slate-400'}`}
            >
              Early
            </button>
            <button
              onClick={() => setTimeState('VALID')}
              className={`px-1.5 py-0.5 rounded ${timeState === 'VALID' ? 'bg-emerald-600 font-bold' : 'text-slate-400'}`}
            >
              Valid
            </button>
            <button
              onClick={() => setTimeState('EXPIRED')}
              className={`px-1.5 py-0.5 rounded ${timeState === 'EXPIRED' ? 'bg-red-600 font-bold' : 'text-slate-400'}`}
            >
              Expired
            </button>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Verification Time Window
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Shift schedule window compliance
          </p>
        </div>

        {/* Configurable window display as specified in prompt */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-4 text-center">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Authorized Boarding Window
          </div>
          <div className="flex items-center justify-center gap-3 my-2">
            <span className="mono text-xl font-black text-cyan-400">{windowStart}</span>
            <span className="text-slate-500 text-xs font-bold uppercase">to</span>
            <span className="mono text-xl font-black text-cyan-400">{windowEnd}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Morning Shift A · Pickup Kothrud (Target 07:30 AM)
          </div>
        </div>

        {/* 3 Result States as explicitly specified */}
        {timeState === 'VALID' && (
          <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-1">
            <div className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1.5">
              <span>✓</span>
              <span>VALID TIME</span>
            </div>
            <p className="text-xs text-slate-300">
              Current time is within authorized 25-minute pickup window.
            </p>
          </div>
        )}

        {timeState === 'TOO_EARLY' && (
          <div className="p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-center space-y-1">
            <div className="text-sm font-black text-amber-400 flex items-center justify-center gap-1.5">
              <span>🟡</span>
              <span>TOO EARLY</span>
            </div>
            <p className="text-xs text-slate-300">
              Verification window opens at {windowStart}. Please wait at pickup zone.
            </p>
          </div>
        )}

        {timeState === 'EXPIRED' && (
          <div className="p-3.5 bg-red-500/20 border border-red-500/40 rounded-xl text-center space-y-1">
            <div className="text-sm font-black text-red-400 flex items-center justify-center gap-1.5">
              <span>🔴</span>
              <span>VERIFICATION EXPIRED</span>
            </div>
            <p className="text-xs text-slate-300">
              Pickup window closed after {windowEnd}. Request dispatcher re-roster.
            </p>
          </div>
        )}
      </div>

      <div className="pt-2">
        {timeState === 'VALID' ? (
          <button
            onClick={onProceed}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
          >
            CONTINUE VERIFICATION →
          </button>
        ) : (
          <button
            disabled
            className="w-full py-3 bg-slate-800 text-slate-500 text-xs font-black tracking-wider uppercase rounded-xl cursor-not-allowed border border-slate-700"
          >
            OUTSIDE PERMITTED WINDOW
          </button>
        )}
      </div>
    </div>
  );
};

export default TimeWindowCheck;
