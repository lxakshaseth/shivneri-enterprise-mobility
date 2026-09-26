import React, { useState } from 'react';

interface NFCVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const NFCVerification: React.FC<NFCVerificationProps> = ({
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [tapping, setTapping] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleTap = () => {
    setTapping(true);
    setTimeout(() => {
      setTapping(false);
      setConfirmed(true);
      setTimeout(() => onSuccess?.(), 800);
    }, 1200);
  };

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
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-500/40 px-2 py-0.5 rounded-full">
            NFC CONTACTLESS
          </span>
        </div>

        <div className="text-center mb-5">
          <h2 className="text-base font-extrabold text-white tracking-tight uppercase">
            TAP TO VERIFY VEHICLE
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Hold top of device near Shivneri Smart Terminal or Vehicle Tag
          </p>
        </div>

        {/* Visual Diagram: Phone -> NFC -> Shivneri Vehicle Tag */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 mb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Phone */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-16 rounded-xl bg-slate-700 border border-slate-500 flex items-center justify-center text-xl shadow-inner">
                📱
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Phone</span>
            </div>

            {/* Pulsing NFC Waves */}
            <div className="flex flex-col items-center">
              <span className={`text-2xl ${tapping ? 'animate-ping text-cyan-400' : 'text-blue-400'}`}>
                📳
              </span>
              <span className="mono text-[9px] text-blue-300 font-bold uppercase mt-1">NFC Field</span>
            </div>

            {/* Shivneri Vehicle Tag */}
            <div className="flex flex-col items-center">
              <div className="w-14 h-16 rounded-xl bg-blue-900/60 border-2 border-blue-400 flex flex-col items-center justify-center shadow-lg">
                <span className="text-lg">🛡️</span>
                <span className="mono text-[8px] text-blue-200 font-extrabold">TAG</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Vehicle Tag</span>
            </div>
          </div>

          {!confirmed ? (
            <button
              onClick={handleTap}
              disabled={tapping}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer transition-transform active:scale-[0.99]"
            >
              {tapping ? 'Reading Vehicle Tag...' : 'Simulate NFC Tap Handshake'}
            </button>
          ) : (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl space-y-1 text-xs animate-bounce">
              <div className="font-bold text-emerald-400 text-center">
                ✓ Vehicle identity confirmed
              </div>
              <div className="flex justify-around text-[10px] text-slate-300 pt-1 border-t border-slate-700/60">
                <span>✓ Ride matched</span>
                <span>✓ Driver matched</span>
              </div>
            </div>
          )}
        </div>

        {/* Results Box */}
        {confirmed && (
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">NFC Chip UID:</span>
              <span className="mono text-cyan-400">04:7B:A2:3F:19</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Tag:</span>
              <span className="font-bold text-white">MH12AB1234 (Toyota Innova)</span>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory architectural disclaimer */}
      <div className="pt-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
        <p className="text-[9px] text-slate-400">
          🔒 NFC is treated as one verification signal, not the sole authorization mechanism.
        </p>
      </div>
    </div>
  );
};

export default NFCVerification;
