import React from 'react';

interface TrustPassCardProps {
  rideId?: string;
  driverName?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  pickupLocation?: string;
  eta?: string;
  status?: 'pending' | 'verified' | 'in-progress';
  onVerifyPickup?: () => void;
  className?: string;
}

export const TrustPassCard: React.FC<TrustPassCardProps> = ({
  rideId = 'RID-10421',
  driverName = 'Raj Kumar',
  driverRating = 4.8,
  vehiclePlate = 'MH12AB1234',
  vehicleModel = 'Toyota Innova',
  pickupLocation = 'Kothrud, Pune',
  eta = '12 min',
  status = 'pending',
  onVerifyPickup,
  className = '',
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-4 shadow-xl border border-indigo-500/30 ${className}`}
    >
      {/* Background glow and subtle holographic pattern */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-sm shadow-inner">
            🛡️
          </div>
          <div>
            <div className="text-xs font-black tracking-widest text-blue-300 uppercase">
              TRUSTPASS
            </div>
            <div className="text-[11px] text-slate-300 font-medium">
              Verify your driver before boarding
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div>
          {status === 'verified' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              🟢 Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
              🟡 Verification pending
            </span>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-2.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 mb-3 text-xs relative z-10 backdrop-blur-xs">
        {/* Ride */}
        <div>
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ride</div>
          <div className="mono font-bold text-white tracking-wide text-xs">{rideId}</div>
        </div>

        {/* ETA */}
        <div className="text-right">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ETA</div>
          <div className="text-amber-400 font-bold text-xs">{eta}</div>
        </div>

        {/* Driver */}
        <div className="pt-1 border-t border-white/5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Driver</div>
          <div className="font-semibold text-white flex items-center gap-1 truncate">
            <span>{driverName}</span>
            <span className="text-amber-400 text-[10px] font-normal">★ {driverRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Vehicle */}
        <div className="pt-1 border-t border-white/5 text-right">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle</div>
          <div className="mono font-bold text-white text-[11px] truncate">{vehiclePlate}</div>
          <div className="text-[10px] text-slate-300 truncate">{vehicleModel}</div>
        </div>

        {/* Pickup (Full width row) */}
        <div className="col-span-2 pt-1 border-t border-white/5 flex items-center justify-between">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Pickup</div>
          <div className="text-right text-[11px] font-medium text-slate-200 truncate flex items-center gap-1">
            <span>📍</span>
            <span>{pickupLocation}</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onVerifyPickup}
        className="w-full py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 border border-blue-400/30 transition-all cursor-pointer relative z-10"
      >
        <span>🛡️</span>
        <span className="tracking-wide font-black">VERIFY PICKUP</span>
        <span className="text-blue-200">→</span>
      </button>

      {/* Micro trust assurance */}
      <div className="mt-2 text-center text-[9px] text-slate-400 tracking-wide relative z-10">
        🔒 Cryptographic mutual handshake · Shivneri TrustPass
      </div>
    </div>
  );
};

export default TrustPassCard;
