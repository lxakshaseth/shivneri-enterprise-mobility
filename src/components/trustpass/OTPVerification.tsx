import React, { useState } from 'react';

interface OTPVerificationProps {
  correctOtp?: string;
  maxAttempts?: number;
  onSuccess?: () => void;
  onBlocked?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  correctOtp = '7429',
  maxAttempts = 4,
  onSuccess,
  onBlocked,
  onCancel,
  className = '',
}) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(maxAttempts);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (isSuccess || isBlocked) return;

    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex !== -1) {
      const newPin = [...pin];
      newPin[emptyIndex] = num;
      setPin(newPin);
      setErrorMessage(null);

      // If full pin entered
      if (emptyIndex === 3) {
        verifyCode(newPin.join(''));
      }
    }
  };

  const handleDelete = () => {
    if (isSuccess || isBlocked) return;
    const filledIndices = pin.map((d, i) => (d !== '' ? i : -1)).filter(i => i !== -1);
    if (filledIndices.length > 0) {
      const lastIndex = filledIndices[filledIndices.length - 1];
      const newPin = [...pin];
      newPin[lastIndex] = '';
      setPin(newPin);
      setErrorMessage(null);
    }
  };

  const verifyCode = (code: string) => {
    if (code === correctOtp) {
      setIsSuccess(true);
      setErrorMessage(null);
      setTimeout(() => {
        onSuccess?.();
      }, 700);
    } else {
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);
      setPin(['', '', '', '']);

      if (nextAttempts <= 0) {
        setIsBlocked(true);
        setErrorMessage('🔴 VERIFICATION BLOCKED — Contact Shivneri Control Tower.');
        onBlocked?.();
      } else {
        setErrorMessage(`Invalid OTP. Remaining attempts: ${nextAttempts}`);
      }
    }
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
            ← Back
          </button>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-900/40 border border-blue-500/40 px-2 py-0.5 rounded-full">
            FALLBACK METHOD
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <div className="text-3xl mb-1">🔐</div>
          <h2 className="text-base font-extrabold text-white tracking-tight">
            ENTER RIDE OTP
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ask passenger to read out or display their 4-digit boarding code
          </p>
        </div>

        {/* Employee Phone Simulation Preview Helper */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 mb-4 text-center">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            Passenger Screen Shows:
          </div>
          <div className="mono text-lg font-black text-blue-400 tracking-widest">
            {correctOtp}
          </div>
          <div className="text-[9px] text-slate-400">
            YOUR BOARDING OTP (Expires in 30s)
          </div>
        </div>

        {/* 4-Digit Input Display Box [ _ ] [ _ ] [ _ ] [ _ ] */}
        <div className="flex justify-center gap-3 mb-4">
          {pin.map((digit, idx) => (
            <div
              key={idx}
              className={`w-12 h-14 rounded-2xl flex items-center justify-center mono text-2xl font-black border-2 transition-all ${
                isSuccess
                  ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                  : isBlocked
                  ? 'border-red-600 bg-red-950/40 text-red-500'
                  : digit !== ''
                  ? 'border-cyan-400 bg-slate-900 text-white shadow-md shadow-cyan-500/10'
                  : 'border-slate-700 bg-slate-900/80 text-slate-500'
              }`}
            >
              {digit !== '' ? digit : <span className="text-slate-600 text-lg">_</span>}
            </div>
          ))}
        </div>

        {/* Status & Error Messages */}
        {isSuccess && (
          <div className="text-center p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-bounce mb-3">
            ✓ OTP verified
          </div>
        )}

        {errorMessage && !isSuccess && (
          <div
            className={`text-center p-2.5 rounded-xl border text-xs font-bold mb-3 ${
              isBlocked
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
            }`}
          >
            <div>{errorMessage}</div>
            {!isBlocked && (
              <div className="text-[10px] font-normal text-slate-300 mt-0.5">
                Remaining attempts: <span className="font-bold text-amber-400">{attemptsLeft}</span>
              </div>
            )}
          </div>
        )}

        {/* Blocked State Notice */}
        {isBlocked && (
          <div className="bg-red-950/60 border border-red-600/50 rounded-2xl p-3 text-center space-y-2 mb-3">
            <div className="text-xs font-black text-red-400 uppercase tracking-wider">
              🔴 VERIFICATION BLOCKED
            </div>
            <p className="text-[11px] text-slate-300">
              Maximum retry limit reached. This pickup cannot proceed without authorization.
            </p>
            <div className="text-[10px] mono text-red-300">
              “Contact Shivneri Control Tower.”
            </div>
          </div>
        )}
      </div>

      {/* Numeric Keypad or Action */}
      {!isBlocked ? (
        <div className="space-y-3 pt-2">
          {/* 3x4 On-Screen Keypad */}
          <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
              <button
                key={num}
                onClick={() => handleKeyPress(num)}
                className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-blue-600 text-white font-bold text-lg border border-slate-800 shadow-sm cursor-pointer transition-colors"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => verifyCode(correctOtp)}
              className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs border border-slate-800 cursor-pointer flex items-center justify-center"
              title="Quick Autofill Correct OTP"
            >
              Autofill
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-blue-600 text-white font-bold text-lg border border-slate-800 shadow-sm cursor-pointer"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-red-400 font-bold text-sm border border-slate-800 cursor-pointer flex items-center justify-center"
            >
              ⌫
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <button
            onClick={() => alert('📞 Calling Shivneri Fleet Control Tower (+91 20 6712 9000)...')}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>📞</span>
            <span>CONTACT CONTROL TOWER</span>
          </button>
          <button
            onClick={() => {
              setAttemptsLeft(4);
              setIsBlocked(false);
              setErrorMessage(null);
              setPin(['', '', '', '']);
            }}
            className="w-full py-2 bg-slate-800 text-slate-300 text-xs rounded-xl font-medium cursor-pointer"
          >
            Reset Attempts (Simulator)
          </button>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
