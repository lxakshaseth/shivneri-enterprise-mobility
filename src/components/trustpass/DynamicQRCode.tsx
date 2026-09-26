import React, { useState, useEffect } from 'react';
import { QRState } from './types';

interface DynamicQRCodeProps {
  rideId?: string;
  driverName?: string;
  vehiclePlate?: string;
  initialTimeSeconds?: number;
  qrState?: QRState;
  onStateChange?: (state: QRState) => void;
  onGenerateNewQR?: () => void;
  onSimulateSuccess?: () => void;
  onSimulateError?: (errorType: string) => void;
  className?: string;
}

export const DynamicQRCode: React.FC<DynamicQRCodeProps> = ({
  rideId = 'RID-10421',
  driverName = 'Raj Kumar',
  vehiclePlate = 'MH12AB1234',
  initialTimeSeconds = 30,
  qrState: externalState,
  onStateChange,
  onGenerateNewQR,
  onSimulateSuccess,
  onSimulateError,
  className = '',
}) => {
  const [internalState, setInternalState] = useState<QRState>('WAITING');
  const currentState = externalState ?? internalState;

  const [timeLeft, setTimeLeft] = useState<number>(initialTimeSeconds);
  const [tokenSeed, setTokenSeed] = useState<number>(10421);

  // Sync internal state if prop changes
  useEffect(() => {
    if (externalState) {
      setInternalState(externalState);
    }
  }, [externalState]);

  const updateState = (next: QRState) => {
    setInternalState(next);
    onStateChange?.(next);
  };

  // Timer countdown
  useEffect(() => {
    if (currentState !== 'WAITING') return;

    if (timeLeft <= 0) {
      updateState('EXPIRED');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          updateState('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentState, timeLeft]);

  const handleRefresh = () => {
    setTimeLeft(30);
    setTokenSeed(prev => prev + 1);
    updateState('WAITING');
    onGenerateNewQR?.();
  };

  // Format mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG QR matrix generation based on seed
  const renderQRGrid = () => {
    const size = 21;
    const cells: React.ReactNode[] = [];
    const seed = tokenSeed;

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Corner 1: top-left 7x7
        const inTopLeft = r < 7 && c < 7;
        // Corner 2: top-right 7x7
        const inTopRight = r < 7 && c >= size - 7;
        // Corner 3: bottom-left 7x7
        const inBottomLeft = r >= size - 7 && c < 7;
        // Center shield zone (7x7 in center)
        const inCenter = r >= 8 && r <= 12 && c >= 8 && c <= 12;

        if (inCenter) continue;

        // Alignment finder patterns
        if (inTopLeft) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          if (isBorder || isCenter) {
            cells.push(
              <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width={8} height={8} rx={1.5} fill="#1e3a8a" />
            );
          }
          continue;
        }
        if (inTopRight) {
          const isBorder = r === 0 || r === 6 || c === size - 7 || c === size - 1;
          const isCenter = r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3;
          if (isBorder || isCenter) {
            cells.push(
              <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width={8} height={8} rx={1.5} fill="#1e3a8a" />
            );
          }
          continue;
        }
        if (inBottomLeft) {
          const isBorder = r === size - 7 || r === size - 1 || c === 0 || c === 6;
          const isCenter = r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4;
          if (isBorder || isCenter) {
            cells.push(
              <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width={8} height={8} rx={1.5} fill="#1e3a8a" />
            );
          }
          continue;
        }

        // Timing patterns
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) {
            cells.push(
              <rect key={`${r}-${c}`} x={c * 9} y={r * 9} width={8} height={8} rx={1} fill="#2563eb" />
            );
          }
          continue;
        }

        // Deterministic pseudo-random payload pattern based on seed and coords
        const pseudoVal = Math.sin(r * 12.9898 + c * 78.233 + seed * 1.5) * 43758.5453;
        const isFilled = (Math.abs(pseudoVal) % 1) > 0.46;

        if (isFilled) {
          cells.push(
            <rect
              key={`${r}-${c}`}
              x={c * 9}
              y={r * 9}
              width={8}
              height={8}
              rx={1.2}
              fill="#0f172a"
              className={currentState === 'WAITING' ? 'transition-all duration-300' : ''}
            />
          );
        }
      }
    }
    return cells;
  };

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Title */}
      <div className="mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold mb-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          DYNAMIC TRUSTPASS
        </div>
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Show this QR to your driver
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Hold screen towards driver's Shivneri Scanner
        </p>
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 rounded-3xl bg-white shadow-xl border-2 border-slate-100 flex flex-col items-center justify-center">
        {/* Dynamic Glowing Border Frame */}
        <div
          className={`absolute inset-0 rounded-3xl pointer-events-none transition-all duration-500 ${
            currentState === 'WAITING'
              ? 'border-2 border-blue-500/40 shadow-lg shadow-blue-500/10'
              : currentState === 'SCANNING'
              ? 'border-2 border-cyan-400 shadow-xl shadow-cyan-500/30'
              : currentState === 'VERIFYING'
              ? 'border-2 border-indigo-500 shadow-xl shadow-indigo-500/30'
              : currentState === 'VERIFIED'
              ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/30'
              : currentState === 'EXPIRED'
              ? 'border-2 border-amber-500/60 shadow-md shadow-amber-500/10'
              : 'border-2 border-red-500 shadow-xl shadow-red-500/30'
          }`}
        />

        {/* Laser Scanner Line (during SCANNING state) */}
        {currentState === 'SCANNING' && (
          <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] z-20 animate-pulse transition-all"
               style={{
                 top: '40%',
                 animation: 'sound-wave 1.2s ease-in-out infinite'
               }}
          />
        )}

        {/* Corner Targets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-blue-600 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-blue-600 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-blue-600 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-blue-600 rounded-br-sm pointer-events-none" />

        {/* The SVG QR Matrix */}
        <div className="relative">
          <svg
            width={189}
            height={189}
            viewBox="0 0 189 189"
            className={`transition-opacity duration-300 ${
              currentState === 'EXPIRED' || currentState === 'INVALID' ? 'opacity-20 blur-[1px]' : 'opacity-100'
            }`}
          >
            {renderQRGrid()}

            {/* Central Shivneri Security Shield Badge */}
            <rect x={72} y={72} width={45} height={45} rx={10} fill="#ffffff" stroke="#e2e8f0" strokeWidth={2} />
            <g transform="translate(80, 80)">
              <rect x={0} y={0} width={29} height={29} rx={7} fill="#1e40af" />
              <path
                d="M14.5 4.5L7 8V14C7 18.5 10.5 22.5 14.5 24C18.5 22.5 22 18.5 22 14V8L14.5 4.5Z"
                fill="#ffffff"
                opacity={0.9}
              />
              <path
                d="M12 13.5L14 15.5L18 10.5"
                stroke="#1e40af"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>

          {/* Overlay for EXPIRED State */}
          {currentState === 'EXPIRED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] rounded-2xl p-2 z-30">
              <span className="text-3xl mb-1">⏱</span>
              <div className="text-xs font-black text-amber-700 uppercase tracking-wider">
                QR Expired
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                Expired after 30s for safety
              </p>
              <button
                onClick={handleRefresh}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
              >
                <span>🔄</span>
                <span>Generate New QR</span>
              </button>
            </div>
          )}

          {/* Overlay for INVALID State */}
          {currentState === 'INVALID' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[2px] rounded-2xl p-2 z-30">
              <span className="text-3xl mb-1 text-red-600">⚠️</span>
              <div className="text-xs font-black text-red-700 uppercase tracking-wider">
                Verification Failed
              </div>
              <p className="text-[10px] text-slate-600 mb-2">
                Digital token mismatch
              </p>
              <button
                onClick={handleRefresh}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer"
              >
                <span>🔄</span>
                <span>Regenerate Token</span>
              </button>
            </div>
          )}

          {/* Overlay for VERIFYING State */}
          {currentState === 'VERIFYING' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-[1px] rounded-2xl p-2 z-30 text-white">
              <div className="w-9 h-9 border-3 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
              <div className="text-xs font-bold text-blue-200">VERIFYING TOKEN</div>
              <div className="text-[9px] text-slate-300 mono mt-0.5">Authenticating with cab...</div>
            </div>
          )}

          {/* Overlay for VERIFIED State */}
          {currentState === 'VERIFIED' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/90 backdrop-blur-[1px] rounded-2xl p-2 z-30 text-white">
              <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-lg mb-1 animate-bounce">
                ✓
              </div>
              <div className="text-xs font-black uppercase tracking-wider">VERIFIED!</div>
              <div className="text-[9px] text-emerald-100">Mutual handshake verified</div>
            </div>
          )}
        </div>
      </div>

      {/* Details below QR as requested */}
      <div className="w-full max-w-[270px] mt-4 space-y-2 text-left">
        {/* Ride & Expiry Row */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/90">
          <div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Ride ID</div>
            <div className="mono text-xs font-bold text-blue-700">{rideId}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Expires in</div>
            <div
              className={`mono text-xs font-bold ${
                timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-slate-800'
              }`}
            >
              ⏱ {timeFormatted}
            </div>
          </div>
        </div>

        {/* Driver & Vehicle Row */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
          <div>
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Driver</div>
            <div className="font-bold text-slate-900 truncate">{driverName}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Vehicle</div>
            <div className="mono font-bold text-slate-900 truncate">{vehiclePlate}</div>
          </div>
        </div>

        {/* Security Message */}
        <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-center">
          <p className="text-[10px] text-blue-900 font-medium leading-relaxed">
            🛡️ <span className="font-semibold">“This QR is unique to this ride and expires automatically.”</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DynamicQRCode;
