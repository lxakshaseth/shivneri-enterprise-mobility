import React, { useState } from 'react';

interface GeofenceCheckProps {
  pickupZone?: string;
  radiusMeters?: number;
  initialDriverInside?: boolean;
  onProceed?: () => void;
  onNavigateToPickup?: () => void;
  className?: string;
}

export const GeofenceCheck: React.FC<GeofenceCheckProps> = ({
  pickupZone = 'Kothrud Corporate Pickup Zone',
  radiusMeters = 150,
  initialDriverInside = true,
  onProceed,
  onNavigateToPickup,
  className = '',
}) => {
  const [driverInside, setDriverInside] = useState<boolean>(initialDriverInside);
  const employeeInside = true;
  const vehicleNearby = driverInside;
  const verificationAllowed = employeeInside && driverInside && vehicleNearby;

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span>📍</span>
            <span>GEOFENCE TELEMETRY</span>
          </div>
          {/* Quick toggle to simulate driver being outside pickup zone */}
          <button
            onClick={() => setDriverInside(prev => !prev)}
            className="text-[9px] text-cyan-400 underline cursor-pointer"
          >
            Toggle: {driverInside ? 'Simulate Outside Zone' : 'Simulate Inside Zone'}
          </button>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Pickup Geofence Check
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mutual presence required within {radiusMeters}m perimeter
          </p>
        </div>

        {/* Radar Map Graphic with Radius Circle */}
        <div className="relative h-36 rounded-2xl bg-slate-950 border border-slate-800 p-3 mb-4 flex flex-col items-center justify-center overflow-hidden">
          {/* Circular Geofence boundary */}
          <div className="w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/60 bg-cyan-500/5 flex items-center justify-center relative">
            <span className="text-[9px] text-cyan-300 font-mono absolute top-1">
              Radius: {radiusMeters}m
            </span>

            {/* Center Pickup Marker */}
            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="Zone Center" />

            {/* Employee inside */}
            <div className="absolute left-6 bottom-6 w-3 h-3 rounded-full bg-blue-400" title="Employee" />

            {/* Driver position (inside or outside boundary) */}
            {driverInside ? (
              <div className="absolute right-6 top-6 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" title="Driver inside" />
            ) : (
              <div className="absolute -right-8 -top-3 w-4 h-4 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_#ef4444]" title="Driver outside" />
            )}
          </div>

          <div className="absolute bottom-2 text-[10px] text-slate-400 font-medium">
            {pickupZone}
          </div>
        </div>

        {/* 4 Condition checks as specified in prompt */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2 text-xs mb-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Employee:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <span>✓</span>
              <span>Inside zone (22m)</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Driver:</span>
            {driverInside ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span>✓</span>
                <span>Inside zone (45m)</span>
              </span>
            ) : (
              <span className="font-bold text-red-400 flex items-center gap-1">
                <span>✗</span>
                <span>Outside zone (410m away)</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Vehicle:</span>
            {vehicleNearby ? (
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <span>✓</span>
                <span>Nearby (MH12AB1234)</span>
              </span>
            ) : (
              <span className="font-bold text-red-400 flex items-center gap-1">
                <span>✗</span>
                <span>Vehicle Out of Range</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
            <span className="text-slate-400 font-semibold">Verification:</span>
            {verificationAllowed ? (
              <span className="font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded text-[10px]">
                ✓ Allowed
              </span>
            ) : (
              <span className="font-black text-red-400 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded text-[10px]">
                ✗ Blocked
              </span>
            )}
          </div>
        </div>

        {/* Outside Zone Warning as specified */}
        {!driverInside && (
          <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3 text-center space-y-1 mb-3">
            <div className="text-xs font-black text-red-400 uppercase tracking-wider">
              🔴 OUTSIDE PICKUP ZONE
            </div>
            <p className="text-xs text-slate-200">
              “Verification cannot be completed here.”
            </p>
          </div>
        )}
      </div>

      {/* Primary CTA: Disabled until policy conditions are satisfied as specified */}
      <div className="pt-2">
        {verificationAllowed ? (
          <button
            onClick={onProceed}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
          >
            PROCEED WITH VERIFICATION →
          </button>
        ) : (
          <div className="space-y-2">
            <button
              disabled
              className="w-full py-3 bg-slate-800 text-slate-500 text-xs font-black tracking-wider uppercase rounded-xl cursor-not-allowed border border-slate-700"
            >
              VERIFICATION LOCKED (OUT OF ZONE)
            </button>
            <button
              onClick={onNavigateToPickup}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🧭</span>
              <span>NAVIGATE TO PICKUP</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofenceCheck;
