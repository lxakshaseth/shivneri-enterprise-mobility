import React from 'react';

interface DriverIdentityCardProps {
  name?: string;
  rating?: number;
  verified?: boolean;
  photo?: string;
  driverId?: string;
  phone?: string;
  badgeLabel?: string;
  variant?: 'card' | 'compact' | 'minimal';
  className?: string;
}

export const DriverIdentityCard: React.FC<DriverIdentityCardProps> = ({
  name = 'Raj Kumar',
  rating = 4.8,
  verified = true,
  driverId = 'DRV-8492',
  phone,
  badgeLabel = 'Verified Driver ✓',
  variant = 'card',
  className = '',
}) => {
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
          {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-800 truncate">{name}</div>
          <div className="text-[10px] text-amber-600 font-medium">★ {rating.toFixed(1)}</div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            {verified && (
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                ✓
              </span>
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{name}</span>
              <span className="text-[10px] text-amber-500 font-medium">★ {rating.toFixed(1)}</span>
            </div>
            <div className="text-[10px] text-slate-400">ID: {driverId}</div>
          </div>
        </div>
        {verified && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {badgeLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:border-blue-300 transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">DRIVER</span>
        {verified && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {badgeLabel}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-blue-900 to-indigo-800 text-white font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-blue-100">
            {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[9px] font-bold px-1 py-0.2 rounded-full border border-white flex items-center shadow-xs">
            ★ {rating.toFixed(1)}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-900 truncate">{name}</div>
          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
            <span className="mono font-medium text-slate-600">{driverId}</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Corporate Vetted</span>
          </div>
          {phone && (
            <div className="text-[10px] text-blue-600 font-medium mt-0.5">
              📞 {phone}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverIdentityCard;
