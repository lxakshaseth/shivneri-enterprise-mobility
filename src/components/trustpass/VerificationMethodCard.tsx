import React from 'react';
import { VerificationMethod, MethodConfig } from './types';

export const TRUSTPASS_METHODS: MethodConfig[] = [
  {
    id: 'dynamic-qr',
    name: 'Dynamic QR',
    subtitle: 'Show code to driver',
    icon: '🟦',
    isRecommended: true,
    securityTier: 'Cryptographic Tier-1',
    description: 'Fastest and most secure option.',
  },
  {
    id: 'ride-otp',
    name: 'Ride OTP',
    subtitle: '4-digit rotating security code',
    icon: '🔐',
    securityTier: 'Encrypted 2FA',
    description: 'Enter code on driver app or read aloud.',
  },
  {
    id: 'whatsapp-otp',
    name: 'WhatsApp OTP',
    subtitle: 'Official business verification',
    icon: '📱',
    securityTier: 'Encrypted 2FA',
    description: 'Dispatch verified PIN via Shivneri Enterprise WhatsApp.',
  },
  {
    id: 'email-otp',
    name: 'Corporate Email OTP',
    subtitle: 'Enterprise domain token',
    icon: '✉',
    securityTier: 'Encrypted 2FA',
    description: 'Send verification token to registered corporate inbox.',
  },
  {
    id: 'vehicle-qr',
    name: 'Vehicle QR',
    subtitle: 'Scan cab windshield badge',
    icon: '📷',
    securityTier: 'Cryptographic Tier-1',
    description: 'Scan physical high-security QR on vehicle windshield.',
  },
  {
    id: 'nfc-tap',
    name: 'NFC Tap',
    subtitle: 'Tap driver console terminal',
    icon: '📳',
    securityTier: 'Hardware Security',
    description: 'Hold phone against the Shivneri onboard dash reader.',
  },
  {
    id: 'nearby-device',
    name: 'Nearby Device',
    subtitle: 'Bluetooth BLE beacon handshake',
    icon: '📡',
    securityTier: 'Proximity Sensor',
    description: 'Automatic wireless proximity verification within 3 meters.',
  },
];

interface VerificationMethodCardProps {
  method: MethodConfig;
  isSelected?: boolean;
  onSelect: (method: VerificationMethod) => void;
  className?: string;
}

export const VerificationMethodCard: React.FC<VerificationMethodCardProps> = ({
  method,
  isSelected = false,
  onSelect,
  className = '',
}) => {
  const isRec = method.isRecommended;

  return (
    <div
      onClick={() => onSelect(method.id)}
      role="button"
      tabIndex={0}
      className={`relative rounded-2xl p-3.5 transition-all text-left cursor-pointer border ${
        isSelected
          ? 'bg-blue-50/90 border-blue-600 shadow-sm ring-1 ring-blue-500'
          : isRec
          ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-white border-blue-300 hover:border-blue-400'
          : 'bg-white border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-xs ${
              isRec
                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white'
                : isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {method.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">{method.name}</span>
              {isRec && (
                <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                  Recommended
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">{method.description}</div>
          </div>
        </div>

        <div className="shrink-0 pt-0.5">
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white'
            }`}
          >
            {isSelected && <span className="text-[10px] font-bold">✓</span>}
          </div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
        <span className="text-slate-400">{method.subtitle}</span>
        <span className="mono text-[9px] text-slate-500 bg-slate-100/80 px-1.5 py-0.5 rounded font-medium">
          {method.securityTier}
        </span>
      </div>
    </div>
  );
};

export default VerificationMethodCard;
