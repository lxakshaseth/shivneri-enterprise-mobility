import React, { useState } from 'react';

interface VehicleQRProps {
  expectedVehicle?: string;
  expectedModel?: string;
  expectedDriver?: string;
  expectedRide?: string;
  initialMode?: 'scanning' | 'verified' | 'mismatch';
  onSuccess?: () => void;
  onMismatch?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const VehicleQR: React.FC<VehicleQRProps> = ({
  expectedVehicle = 'MH12AB1234',
  expectedModel = 'Toyota Innova',
  expectedDriver = 'Raj Kumar',
  expectedRide = 'RID-10421',
  initialMode = 'scanning',
  onSuccess,
  onMismatch,
  onCancel,
  className = '',
}) => {
  const [mode, setMode] = useState<'scanning' | 'verified' | 'mismatch'>(initialMode);

  const simulateScan = (isCorrect: boolean) => {
    if (isCorrect) {
      setMode('verified');
      setTimeout(() => onSuccess?.(), 900);
    } else {
      setMode('mismatch');
      onMismatch?.();
    }
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white rounded-2xl ${className}`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-full">
            <span>📷</span>
            <span>WINDSHIELD QR</span>
          </div>
        </div>

        {mode === 'scanning' && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                VERIFY VEHICLE
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan physical Shivneri QR decal on vehicle windshield
              </p>
            </div>

            {/* Simulated Windshield QR Camera Viewfinder */}
            <div className="relative w-60 h-52 mx-auto rounded-2xl bg-slate-950 border-2 border-slate-700 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />

              <div className="w-24 h-24 border border-white/20 rounded-xl flex items-center justify-center p-2 text-center bg-white/5">
                <span className="text-4xl opacity-70">🚐</span>
              </div>

              <div className="absolute bottom-2 text-[9px] mono text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                Align Windshield Sticker
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => simulateScan(true)}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✓</span>
                <span>Simulate Scan Assigned Vehicle ({expectedVehicle})</span>
              </button>

              <button
                onClick={() => simulateScan(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✗</span>
                <span>Simulate Wrong Vehicle Decal (Test Mismatch)</span>
              </button>
            </div>
          </div>
        )}

        {mode === 'verified' && (
          <div className="space-y-4 pt-1">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg ring-8 ring-emerald-500/10">
                ✓
              </div>
              <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                VEHICLE CONFIRMED
              </div>
              <h2 className="text-base font-extrabold text-white">
                VERIFY VEHICLE
              </h2>
            </div>

            {/* Vehicle Details */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Vehicle:</span>
                <span className="ind-plate text-[10px]">
                  <span className="ind-plate-blue">IND</span>
                  {expectedVehicle}
                </span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Model:</span>
                <span className="font-bold text-white">{expectedModel}</span>
              </div>
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-700">
                <span className="text-slate-400">Driver:</span>
                <span className="font-bold text-white">{expectedDriver}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ride:</span>
                <span className="mono font-bold text-blue-400">{expectedRide}</span>
              </div>
            </div>

            {/* 4-point Checklist as specified */}
            <div className="bg-slate-800/80 rounded-2xl border border-slate-700/80 p-3 space-y-1.5 text-xs">
              {[
                'Vehicle exists',
                'Vehicle assigned',
                'Driver assigned',
                'Ride assigned',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-0.5">
                  <span className="text-slate-200">{item}</span>
                  <span className="text-emerald-400 font-bold">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'mismatch' && (
          <div className="space-y-4 pt-1 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg ring-8 ring-red-500/10">
              🔴
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase">
              SECURITY BLOCK
            </div>
            <h2 className="text-base font-black text-red-500 tracking-tight">
              WRONG VEHICLE
            </h2>
            <p className="text-xs text-slate-300 font-semibold">
              “Do not board.”
            </p>

            <div className="bg-slate-900 border border-red-500/30 rounded-xl p-3 text-xs text-left space-y-1.5">
              <div className="text-slate-400">
                Expected: <span className="font-bold text-emerald-400">{expectedVehicle}</span>
              </div>
              <div className="text-slate-400">
                Detected: <span className="font-bold text-red-400">MH14XY9876 (Unregistered Decal)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => alert('🚨 Incident reported to Control Tower: Wrong Vehicle Decal scanned.')}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
              >
                Report Vehicle Mismatch
              </button>
              <button
                onClick={() => setMode('scanning')}
                className="w-full py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ← Scan Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 text-center text-[10px] text-slate-400">
        Physical Cryptographic Sticker with Tamper-Evident RFID
      </div>
    </div>
  );
};

export default VehicleQR;
