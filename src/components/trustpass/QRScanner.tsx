import React, { useState, useEffect } from 'react';

interface QRScannerProps {
  rideId?: string;
  expectedPassenger?: string;
  vehicle?: string;
  location?: string;
  onScanSuccess?: () => void;
  onScanWrongPassenger?: () => void;
  onScanWrongVehicle?: () => void;
  onScanWrongDriver?: () => void;
  onScanExpired?: () => void;
  onSwitchToOtp?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  rideId = 'RID-10421',
  expectedPassenger = 'Akshat G.',
  vehicle = 'MH12AB1234',
  location = 'Kothrud',
  onScanSuccess,
  onScanWrongPassenger,
  onScanWrongVehicle,
  onScanWrongDriver,
  onScanExpired,
  onSwitchToOtp,
  onCancel,
  className = '',
}) => {
  const [scanStep, setScanStep] = useState<'SCANNING' | 'VERIFYING' | 'RESULT'>('SCANNING');

  const triggerScanFlow = (onComplete?: () => void) => {
    setScanStep('SCANNING');
    setTimeout(() => {
      setScanStep('VERIFYING');
      setTimeout(() => {
        setScanStep('RESULT');
        setTimeout(() => {
          onComplete?.();
        }, 600);
      }, 1000);
    }, 1200);
  };

  const handleValidScan = () => {
    triggerScanFlow(onScanSuccess);
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-950 text-white ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Cancel
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono bg-blue-900/40 text-blue-300 border border-blue-600/40 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            SHIVNERI OPTICAL ENGINE
          </div>
        </div>

        <div className="text-center mb-3">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            Scan Employee TrustPass QR
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Align passenger's screen within the optical viewfinder
          </p>
        </div>

        {/* Optical Camera Viewfinder Frame */}
        <div className="relative w-64 h-64 mx-auto rounded-3xl bg-slate-900/90 border-2 border-slate-700/60 flex flex-col items-center justify-center overflow-hidden shadow-2xl">
          {/* Subtle camera video preview background texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-slate-900/80 pointer-events-none" />

          {/* Viewfinder Corner Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-3 border-r-3 border-cyan-400 rounded-br-lg pointer-events-none" />

          {/* Scanning Beam (when in SCANNING state) */}
          {scanStep === 'SCANNING' && (
            <div
              className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] z-20"
              style={{
                animation: 'sound-wave 1.6s ease-in-out infinite',
                top: '45%',
              }}
            />
          )}

          {/* Target reticle / QR ghost */}
          <div className="w-36 h-36 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center p-3 text-center pointer-events-none">
            {scanStep === 'SCANNING' && (
              <>
                <div className="text-3xl mb-1 opacity-40">📱</div>
                <div className="text-[9px] text-cyan-300 font-mono tracking-wider animate-pulse">
                  SEARCHING QR CODE...
                </div>
              </>
            )}

            {scanStep === 'VERIFYING' && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-2" />
                <div className="text-[10px] font-bold text-cyan-200">VERIFYING TOKEN</div>
                <div className="text-[8px] mono text-slate-400">Cryptographic Mutual Check</div>
              </div>
            )}

            {scanStep === 'RESULT' && (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg mb-1 animate-bounce">
                  ✓
                </div>
                <div className="text-[10px] font-bold text-emerald-300">CODE CAPTURED</div>
              </div>
            )}
          </div>

          {/* State pill */}
          <div className="absolute bottom-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[9px] font-mono text-slate-300 border border-white/10">
            STATE: <span className="text-cyan-400 font-bold">{scanStep}</span>
          </div>
        </div>

        {/* Structured Details Below Viewfinder */}
        <div className="mt-4 bg-slate-900 rounded-2xl border border-slate-800 p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ride</span>
            <span className="mono font-bold text-blue-400">{rideId}</span>
          </div>

          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Expected passenger</span>
            <span className="font-bold text-emerald-400">{expectedPassenger}</span>
          </div>

          <div className="flex justify-between items-center pb-1.5 border-b border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle</span>
            <span className="ind-plate text-[10px]">
              <span className="ind-plate-blue">IND</span>
              {vehicle}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Location</span>
            <span className="font-medium text-slate-300 flex items-center gap-1">
              <span>📍</span>
              <span>{location}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action and Simulation Triggers */}
      <div className="space-y-2 pt-3">
        {/* Primary simulation trigger */}
        <button
          onClick={handleValidScan}
          disabled={scanStep !== 'SCANNING'}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📸</span>
          <span>Simulate Scan Employee QR (Success)</span>
        </button>

        {/* Secondary fallback */}
        <button
          onClick={onSwitchToOtp}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>🔐</span>
          <span>Camera Issue? Enter Ride OTP Instead</span>
        </button>
      </div>
    </div>
  );
};

export default QRScanner;
