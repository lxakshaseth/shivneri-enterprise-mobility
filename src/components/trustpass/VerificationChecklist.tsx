import React from 'react';

export interface VerificationChecklistProps {
  employeeVerified?: boolean;
  driverVerified?: boolean;
  vehicleAssigned?: boolean;
  rideAssigned?: boolean;
  employeeInfo?: { name: string; id: string };
  driverInfo?: { name: string; rating?: number };
  vehicleInfo?: { plate: string; model?: string };
  rideInfo?: { id: string; route?: string };
  variant?: 'card' | 'compact' | 'success-list';
  className?: string;
}

export const VerificationChecklist: React.FC<VerificationChecklistProps> = ({
  employeeVerified = true,
  driverVerified = true,
  vehicleAssigned = true,
  rideAssigned = true,
  employeeInfo = { name: 'Akshat Gupta', id: 'EMP-10481' },
  driverInfo = { name: 'Raj Kumar', rating: 4.8 },
  vehicleInfo = { plate: 'MH12AB1234', model: 'Toyota Innova' },
  rideInfo = { id: 'RID-10421', route: 'Pune → Hinjewadi' },
  variant = 'card',
  className = '',
}) => {
  const items = [
    {
      title: 'Employee identity',
      subtitle: `${employeeInfo.name} (${employeeInfo.id})`,
      verified: employeeVerified,
      icon: '👤',
    },
    {
      title: 'Driver identity',
      subtitle: `${driverInfo.name} ★ ${driverInfo.rating ?? 4.8}`,
      verified: driverVerified,
      icon: '🚗',
    },
    {
      title: 'Vehicle assignment',
      subtitle: `${vehicleInfo.plate} · ${vehicleInfo.model ?? 'Innova'}`,
      verified: vehicleAssigned,
      icon: '🚐',
    },
    {
      title: 'Ride assignment',
      subtitle: `${rideInfo.id} (${rideInfo.route ?? 'Active Route'})`,
      verified: rideAssigned,
      icon: '📍',
    },
  ];

  if (variant === 'success-list') {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">{item.title}</div>
                <div className="text-[10px] text-slate-500">{item.subtitle}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
              Verified
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${item.verified ? 'text-emerald-600' : 'text-amber-500'}`}>
                {item.verified ? '✓' : '○'}
              </span>
              <span className="text-slate-700 font-medium">{item.title}</span>
            </div>
            <span className="text-[10px] text-slate-400 mono">{item.subtitle}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          4-POINT TRUSTPASS CHECKS
        </span>
        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Mutual Verification
        </span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{item.icon}</span>
              <div>
                <div className="text-xs font-semibold text-slate-800">{item.title}</div>
                <div className="text-[10px] text-slate-500">{item.subtitle}</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {item.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">✓</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px]">○</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationChecklist;
