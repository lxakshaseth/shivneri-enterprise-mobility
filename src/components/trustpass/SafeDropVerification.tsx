import React, { useState } from 'react';

interface SafeDropVerificationProps {
  employeeName?: string;
  dropLocation?: string;
  dropTime?: string;
  expectedOtp?: string;
  onTripCompleted?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const SafeDropVerification: React.FC<SafeDropVerificationProps> = ({
  employeeName = 'Akshat G.',
  dropLocation = 'Hinjewadi Phase 1',
  dropTime = '08:18 AM',
  expectedOtp = '5831',
  onTripCompleted,
  onCancel,
  className = '',
}) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleKeyPress = (num: string) => {
    if (isConfirmed) return;
    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      const newPin = [...pin];
      newPin[emptyIndex] = num;
      setPin(newPin);
      setError(null);

      if (emptyIndex === 3) {
        verifyDeboarding(newPin.join(''));
      }
    }
  };

  const handleDelete = () => {
    if (isConfirmed) return;
    const filledIndices = pin.map((d, i) => (d !== '' ? i : -1)).filter(i => i !== -1);
    if (filledIndices.length > 0) {
      const lastIndex = filledIndices[filledIndices.length - 1];
      const newPin = [...pin];
      newPin[lastIndex] = '';
      setPin(newPin);
      setError(null);
    }
  };

  const verifyDeboarding = (code: string) => {
    if (code === expectedOtp) {
      setIsConfirmed(true);
      setError(null);
    } else {
      setError('Invalid Deboarding OTP. Ask passenger for code.');
      setPin(['', '', '', '']);
    }
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-900 text-white ${className}`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>
          <div className="flex items-center gap-1 text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            DESTINATION REACHED
          </div>
        </div>

        {!isConfirmed ? (
          <>
            {/* Input state */}
            <div className="text-center mb-3">
              <div className="text-3xl mb-1">🏁</div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                SAFE DROP VERIFICATION
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Deboarding protocol · Confirm safe employee drop
              </p>
            </div>

            {/* Passenger Phone Simulation Helper */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-3 mb-4 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Employee Received: “Confirm safe arrival”
              </div>
              <div className="mono text-2xl font-black text-emerald-400 tracking-widest bg-slate-900 p-2 rounded-xl border border-emerald-500/30">
                {expectedOtp}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Enter passenger's safe deboarding code
              </div>
            </div>

            {/* 4-digit Pin Display */}
            <div className="flex justify-center gap-3 mb-3">
              {pin.map((digit, idx) => (
                <div
                  key={idx}
                  className="w-12 h-14 rounded-2xl flex items-center justify-center mono text-2xl font-black border-2 border-slate-700 bg-slate-800/90 text-white"
                >
                  {digit !== '' ? digit : <span className="text-slate-600 text-lg">_</span>}
                </div>
              ))}
            </div>

            {error && (
              <div className="text-center text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/40 p-2 rounded-xl mb-3">
                {error}
              </div>
            )}
          </>
        ) : (
          /* Confirmation Success State as specified in Section 9 */
          <div className="pt-2 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-500/10 mx-auto mb-3 animate-bounce">
              🟢
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider mb-1">
              SAFE DROP CONFIRMED
            </div>

            <h2 className="text-lg font-black text-white tracking-tight">
              Trip Successfully Completed
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 mb-4">
              Deboarding verified and cryptographically recorded
            </p>

            {/* Details Box as specified */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-3.5 space-y-2.5 text-xs text-left mb-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="text-slate-400">Employee:</span>
                <span className="font-bold text-emerald-400 text-sm">{employeeName}</span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <span className="text-slate-400">Drop:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <span>📍</span>
                  <span>{dropLocation}</span>
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Time:</span>
                <span className="mono font-bold text-slate-200">{dropTime}</span>
              </div>
            </div>

            {/* Audit Log Stamp */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-[10px] text-slate-400 mono">
              <div className="text-emerald-400 font-bold mb-0.5">✓ LOGGED IN CENTRAL AUDIT ENGINE</div>
              <div>EVENT-ID: EVT-DRP-91823 · PROTOCOL: SECURE-DROP-v2</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-2">
        {!isConfirmed ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-blue-600 text-white font-bold text-lg border border-slate-700 cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={() => verifyDeboarding(expectedOtp)}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-slate-700 cursor-pointer"
              >
                Autofill
              </button>
              <button
                onClick={() => handleKeyPress('0')}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg border border-slate-700 cursor-pointer"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-sm border border-slate-700 cursor-pointer"
              >
                ⌫
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onTripCompleted}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>COMPLETE TRIP & VIEW EARNINGS</span>
            <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SafeDropVerification;
