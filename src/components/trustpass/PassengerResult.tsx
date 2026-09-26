import React, { useState } from 'react';

interface PassengerResultProps {
  employeeName?: string;
  employeeId?: string;
  rideId?: string;
  pickup?: string;
  vehicle?: string;
  vehicleModel?: string;
  initialConfirmed?: boolean;
  onConfirmBoarding?: (timestamp: string) => void;
  onProceedToRide?: () => void;
  className?: string;
}

export const PassengerResult: React.FC<PassengerResultProps> = ({
  employeeName = 'Akshat G.',
  employeeId = 'EMP-10481',
  rideId = 'RID-10421',
  pickup = 'Kothrud',
  vehicle = 'MH12AB1234',
  vehicleModel = 'Toyota Innova',
  initialConfirmed = false,
  onConfirmBoarding,
  onProceedToRide,
  className = '',
}) => {
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [boardingTime, setBoardingTime] = useState<string>('07:31:45 AM');

  const handleConfirm = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setBoardingTime(timeStr);
    setConfirmed(true);
    onConfirmBoarding?.(timeStr);
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white ${className}`}>
      <div>
        {/* Top Icon and Banner */}
        <div className="flex flex-col items-center text-center pt-2 mb-4">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-500/10 animate-bounce">
              🟢
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 text-slate-950 text-xs rounded-full flex items-center justify-center font-bold ring-2 ring-slate-900">
              ✓
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider mb-1">
            {confirmed ? 'BOARDING AUTHORIZED' : 'PASSENGER VERIFIED'}
          </div>

          <h2 className="text-lg font-black text-white tracking-tight">
            {confirmed ? 'Boarding Confirmed' : 'Ready for Boarding'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {confirmed
              ? `Passenger verified and logged at ${boardingTime}`
              : 'Mutual security checks verified. Confirm passenger boarding.'}
          </p>
        </div>

        {/* Structured Details Box */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2 mb-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Employee</span>
            <div className="text-right">
              <span className="font-bold text-white text-sm">{employeeName}</span>
              <span className="text-[10px] text-slate-400 mono ml-1.5">({employeeId})</span>
            </div>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ride</span>
            <span className="mono font-bold text-blue-400">{rideId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-700/60">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pickup</span>
            <span className="font-semibold text-slate-200 flex items-center gap-1">
              <span>📍</span>
              <span>{pickup}</span>
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle</span>
            <div className="text-right">
              <span className="ind-plate text-[10px] mr-1.5">
                <span className="ind-plate-blue">IND</span>
                {vehicle}
              </span>
              <span className="text-[10px] text-slate-400">{vehicleModel}</span>
            </div>
          </div>
        </div>

        {/* 3-Point Status Checklist as specified */}
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-3 mb-3 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Status Verification
          </div>
          {[
            { label: 'Correct employee', val: employeeName },
            { label: 'Correct ride', val: rideId },
            { label: 'Correct vehicle', val: vehicle },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-700/40 last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
                <span className="text-slate-200 font-medium">{item.label}</span>
              </div>
              <span className="text-[10px] mono text-emerald-400 font-semibold">{item.val}</span>
            </div>
          ))}
        </div>

        {/* If Confirmed, show official Boarding Authorized Stamp */}
        {confirmed && (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-center space-y-1">
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <span>🛡️</span>
              <span>BOARDING AUTHORIZED</span>
            </div>
            <div className="text-xs text-slate-300">
              Boarding timestamp recorded: <span className="mono font-bold text-white">{boardingTime}</span>
            </div>
            <div className="text-[9px] mono text-slate-400">
              AUDIT CERTIFICATE: SHIV-BRD-81920-OK
            </div>
          </div>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2 pt-2">
        {!confirmed ? (
          <button
            onClick={handleConfirm}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span>✓</span>
            <span>CONFIRM BOARDING</span>
          </button>
        ) : (
          <button
            onClick={onProceedToRide}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:scale-[0.99]"
          >
            <span>START ACTIVE RIDE</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PassengerResult;
