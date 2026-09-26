import React, { useState, useEffect } from 'react';

interface WhatsAppOTPProps {
  maskedNumber?: string;
  expectedOtp?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const WhatsAppOTP: React.FC<WhatsAppOTPProps> = ({
  maskedNumber = '+91 XXXXXXXX21',
  expectedOtp = '8103',
  onSuccess,
  onCancel,
  className = '',
}) => {
  const [sent, setSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90); // 01:30
  const [pin, setPin] = useState(['', '', '', '']);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sent || verified || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sent, verified, timeLeft]);

  const handleSend = () => {
    setSent(true);
    setTimeLeft(90);
    setError(null);
  };

  const handleDigitChange = (idx: number, val: string) => {
    if (verified) return;
    const digit = val.slice(-1);
    const newPin = [...pin];
    newPin[idx] = digit;
    setPin(newPin);

    // If filled
    if (newPin.every(d => d !== '')) {
      const code = newPin.join('');
      if (code === expectedOtp) {
        setVerified(true);
        setError(null);
        setTimeout(() => onSuccess?.(), 800);
      } else {
        setError('Incorrect WhatsApp verification code.');
      }
    }
  };

  const formatCountdown = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-white rounded-2xl ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onCancel}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-medium"
          >
            ← Back
          </button>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            WhatsApp 2FA
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-2 shadow-xs">
            💬
          </div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Send verification code via WhatsApp
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            A secure 4-digit mutual handshake token will be dispatched to your registered WhatsApp
          </p>
        </div>

        {/* Masked Phone Number Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center mb-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Registered Number (Privacy Masked)
          </div>
          <div className="mono text-base font-extrabold text-slate-800 tracking-wider">
            {maskedNumber}
          </div>
          <div className="text-[9px] text-slate-400 mt-0.5">
            🔒 PII Encrypted · Never displayed in full
          </div>
        </div>

        {/* Send Trigger or Active Countdown */}
        {!sent ? (
          <button
            onClick={handleSend}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>📲</span>
            <span>SEND WHATSAPP OTP</span>
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <span>✓</span>
                <span>Code sent</span>
              </span>
              <span className="mono text-slate-600 font-bold">
                ⏱ {formatCountdown()}
              </span>
            </div>

            {/* 4-digit OTP Inputs */}
            <div className="flex justify-center gap-2.5">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  disabled={verified}
                  onChange={e => handleDigitChange(idx, e.target.value)}
                  className="w-12 h-14 text-center mono text-2xl font-bold bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 rounded-xl outline-none transition-colors"
                />
              ))}
            </div>

            {/* Quick autofill helper for prototype tester */}
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  setPin(['8', '1', '0', '3']);
                  setVerified(true);
                  setTimeout(() => onSuccess?.(), 800);
                }}
                className="text-[10px] text-emerald-700 font-semibold underline cursor-pointer"
              >
                Autofill WhatsApp PIN ({expectedOtp})
              </button>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg text-center font-medium">
                {error}
              </div>
            )}

            {verified && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1 animate-bounce">
                <div className="text-xs font-black text-emerald-800">
                  ✓ WhatsApp identity verified
                </div>
                <div className="text-[10px] text-emerald-600">
                  Mutual token validated by WhatsApp Business API
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 text-center text-[10px] text-slate-400">
        Shivneri Out-of-Band Multi-Factor Authentication
      </div>
    </div>
  );
};

export default WhatsAppOTP;
