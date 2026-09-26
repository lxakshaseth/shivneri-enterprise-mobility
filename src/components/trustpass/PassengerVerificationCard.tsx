import React from 'react';

interface PassengerVerificationCardProps {
  rideId?: string;
  pickup?: string;
  expectedPassenger?: string;
  passengerId?: string;
  vehicle?: string;
  vehicleModel?: string;
  status?: 'pending' | 'verified' | 'failed';
  onScanQR?: () => void;
  onEnterOTP?: () => void;
  className?: string;
}

export const PassengerVerificationCard: React.FC<PassengerVerificationCardProps> = ({
  rideId = 'RID-10421',
  pickup = 'Kothrud',
  expectedPassenger = 'Akshat G.',
  passengerId = 'EMP-10481',
  vehicle = 'MH12AB1234',
  vehicleModel = 'Toyota Innova',
  status = 'pending',
  onScanQR,
  onEnterOTP,
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-4 shadow-xl border border-blue-500/30 relative overflow-hidden ${className}`}
    >
      {/* Decorative gradient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Icon and Title */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sm shadow-xs">
            🛡️
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-blue-300 uppercase">
              VERIFY PASSENGER
            </div>
            <div className="text-[10px] text-slate-300">
              Pickup Point · Mutual Handshake
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div>
          {status === 'verified' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              🟢 Verified
            </span>
          ) : status === 'failed' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
              🔴 Mismatch
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              🟡 Passenger verification pending
            </span>
          )}
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3.5 space-y-2 backdrop-blur-xs relative z-10 text-xs">
        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ride</span>
          <span className="mono font-bold text-blue-300">{rideId}</span>
        </div>

        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pickup</span>
          <span className="font-semibold text-white flex items-center gap-1">
            <span>📍</span>
            <span>{pickup}</span>
          </span>
        </div>

        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expected Passenger</span>
          <div className="text-right">
            <span className="font-bold text-emerald-400">{expectedPassenger}</span>
            <span className="text-[10px] text-slate-400 mono ml-1.5">({passengerId})</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle</span>
          <div className="text-right">
            <span className="ind-plate text-[10px] mr-1">
              <span className="ind-plate-blue">IND</span>
              {vehicle}
            </span>
            <span className="text-[10px] text-slate-300 font-medium">{vehicleModel}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 relative z-10">
        <button
          onClick={onScanQR}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all border border-blue-400/30"
        >
          <span>📷</span>
          <span>SCAN PASSENGER QR</span>
        </button>

        <button
          onClick={onEnterOTP}
          className="w-full py-2 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
        >
          <span>🔐</span>
          <span>ENTER OTP</span>
        </button>
      </div>
    </div>
  );
};

export default PassengerVerificationCard;
