import React, { useState } from 'react';
import { TrustedContactConfig } from './types';

interface TrustedContactProps {
  initialContact?: TrustedContactConfig;
  showBoardingNotification?: boolean;
  onUpdate?: (config: TrustedContactConfig) => void;
  className?: string;
}

export const TrustedContact: React.FC<TrustedContactProps> = ({
  initialContact = {
    name: 'Neha Gupta',
    phone: '+91 XXXXXXXX99',
    relationship: 'Family Member',
    notifyBoarding: true,
    notifyRideStarted: true,
    notifySos: true,
    notifySafeDrop: true,
    notifyRideCompleted: true,
  },
  showBoardingNotification = true,
  onUpdate,
  className = '',
}) => {
  const [config, setConfig] = useState<TrustedContactConfig>(initialContact);

  const toggleSetting = (key: keyof TrustedContactConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    onUpdate?.(updated);
  };

  const notificationOptions = [
    { key: 'notifyBoarding', label: 'Boarding notification' },
    { key: 'notifyRideStarted', label: 'Ride started' },
    { key: 'notifySos', label: 'SOS' },
    { key: 'notifySafeDrop', label: 'Safe drop' },
    { key: 'notifyRideCompleted', label: 'Ride completed' },
  ] as const;

  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
              TRUSTED CONTACTS
            </h3>
            <div className="text-[10px] text-slate-500">
              Automated telemetry broadcast to family
            </div>
          </div>
        </div>
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Sync Active
        </span>
      </div>

      {/* Contact Profile Box */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <div className="text-xs font-bold text-slate-900">{config.name}</div>
          <div className="mono text-[10px] text-slate-500">{config.phone}</div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{config.relationship}</span>
      </div>

      {/* Notification Settings Toggle Group as specified in Section 12 */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Notification Triggers
        </div>
        {notificationOptions.map(opt => (
          <label
            key={opt.key}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 cursor-pointer text-xs"
          >
            <span className="text-slate-700 font-medium">{opt.label}</span>
            <input
              type="checkbox"
              checked={Boolean(config[opt.key])}
              onChange={() => toggleSetting(opt.key)}
              className="accent-blue-600 w-4 h-4 cursor-pointer"
            />
          </label>
        ))}
      </div>

      {/* Live Dispatched Notification Preview as explicitly requested in Section 12 */}
      {showBoardingNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
          <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <span>🟢</span>
            <span>BOARDING CONFIRMED (DISPATCHED SMS)</span>
          </div>
          <p className="text-slate-800 font-medium leading-relaxed bg-white p-2 rounded-lg border border-emerald-100 text-[11px]">
            “Akshat boarded RID-10421. Driver: Raj Kumar, Vehicle: MH12AB1234, Time: 07:31 AM.”
          </p>
          <div className="text-[9px] text-emerald-600 text-right">
            Delivered to {config.phone} via Shivneri Cloud SMS
          </div>
        </div>
      )}
    </div>
  );
};

export default TrustedContact;
