import React, { useState, useEffect } from 'react';

interface ProximityVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const ProximityVerification: React.FC<ProximityVerificationProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [searching, setSearching] = useState(true);
  const [driverNearby, setDriverNearby] = useState(false);
  const [employeeNearby, setEmployeeNearby] = useState(false);
  const [vehicleNearby, setVehicleNearby] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setDriverNearby(true), 600);
    const t2 = setTimeout(() => setEmployeeNearby(true), 1100);
    const t3 = setTimeout(() => {
      setVehicleNearby(true);
      setSearching(false);
      setConfirmed(true);
      setTimeout(() => onSuccess?.(), 1000);
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            BLE BEACON SENSING
          </span>
        </div>

        <div className="text-center mb-4">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Nearby Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {searching ? 'Searching for nearby Bluetooth telemetry beacons...' : 'Mutual proximity detected within 3m'}
          </p>
        </div>

        {/* Searching Radar Animation */}
        <div className="relative w-44 h-44 mx-auto rounded-full bg-slate-950 border border-cyan-500/40 flex items-center justify-center mb-4 shadow-xl overflow-hidden">
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-30 pointer-events-none" />
          <div className="w-28 h-28 rounded-full border border-cyan-500/30 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400 flex items-center justify-center text-2xl">
              📡
            </div>
          </div>
          {/* Beacons blips */}
          {driverNearby && (
            <div className="absolute top-8 left-10 w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" title="Driver device" />
          )}
          {vehicleNearby && (
            <div className="absolute bottom-10 right-10 w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_#60a5fa]" title="Vehicle" />
          )}
        </div>

        {/* Status Indicators as specified */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2.5 text-xs mb-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Driver device</span>
            <span className={`flex items-center gap-1.5 font-bold ${driverNearby ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${driverNearby ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              {driverNearby ? '● Nearby (-46 dBm)' : 'Scanning...'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Employee device</span>
            <span className={`flex items-center gap-1.5 font-bold ${employeeNearby ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${employeeNearby ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              {employeeNearby ? '● Nearby (Active)' : 'Scanning...'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-medium">Vehicle</span>
            <span className={`flex items-center gap-1.5 font-bold ${vehicleNearby ? 'text-emerald-400' : 'text-slate-500'}`}>
              <span className={`w-2 h-2 rounded-full ${vehicleNearby ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              {vehicleNearby ? '● Nearby (MH12AB1234)' : 'Scanning...'}
            </span>
          </div>
        </div>

        {confirmed && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center space-y-0.5 animate-bounce">
            <div className="text-xs font-black text-emerald-400">
              ✓ Proximity confirmed
            </div>
            <div className="text-[10px] text-slate-300">
              Continuing to TrustPass policy decision...
            </div>
          </div>
        )}
      </div>

      {/* Mandatory contextual instruction */}
      <div className="pt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <p className="text-[9px] text-slate-400">
          ⚠️ Do not automatically authorize solely based on Bluetooth proximity. Proximity is a secondary signal.
        </p>
      </div>
    </div>
  );
};

export default ProximityVerification;
