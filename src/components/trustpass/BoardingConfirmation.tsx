import React from 'react';

interface BoardingConfirmationProps {
  employeeName?: string;
  employeeId?: string;
  rideId?: string;
  vehicle?: string;
  timestamp?: string;
  onProceedToRide?: () => void;
  className?: string;
}

export const BoardingConfirmation: React.FC<BoardingConfirmationProps> = ({
  employeeName = 'Akshat G.',
  employeeId = 'EMP-10481',
  rideId = 'RID-10421',
  vehicle = 'MH12AB1234',
  timestamp = '07:31:45 AM',
  onProceedToRide,
  className = '',
}) => {
  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white ${className}`}>
      <div className="pt-3">
        {/* Success Icon */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-500/10 mb-3 animate-bounce">
            🟢
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-wider mb-1">
            SHIVNERI TRUSTPASS
          </div>
          <h2 className="text-lg font-black text-white tracking-tight">
            BOARDING AUTHORIZED
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mutual passenger & vehicle verification confirmed
          </p>
        </div>

        {/* Boarding Badge Card */}
        <div className="bg-slate-800 rounded-2xl border border-emerald-500/40 p-4 space-y-3 mb-4 shadow-xl">
          <div className="flex justify-between items-center pb-2 border-b border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Boarding Time</span>
            <span className="mono font-bold text-emerald-400 text-sm">{timestamp}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-700 text-xs">
            <span className="text-slate-400">Verified Passenger:</span>
            <span className="font-bold text-white">{employeeName} ({employeeId})</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-700 text-xs">
            <span className="text-slate-400">Ride Identifier:</span>
            <span className="mono font-bold text-blue-400">{rideId}</span>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Assigned Vehicle:</span>
            <span className="ind-plate text-[10px]">
              <span className="ind-plate-blue">IND</span>
              {vehicle}
            </span>
          </div>
        </div>

        {/* Security Stamp */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-[10px] text-slate-400 space-y-1">
          <div className="flex justify-between font-mono text-emerald-400">
            <span>MUTUAL HANDSHAKE SEAL</span>
            <span>VERIFIED ✓</span>
          </div>
          <p className="text-slate-400 text-[10px] leading-relaxed">
            Encrypted telemetry logged to Shivneri Central Tower. Geofence tracking active.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-4">
        <button
          onClick={onProceedToRide}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.99]"
        >
          <span>PROCEED TO ACTIVE RIDE</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};

export default BoardingConfirmation;
