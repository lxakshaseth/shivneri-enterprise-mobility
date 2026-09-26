import React from 'react';

interface VehicleIdentityCardProps {
  plateNumber?: string;
  modelName?: string;
  assigned?: boolean;
  vehicleType?: string;
  color?: string;
  telematicsLocked?: boolean;
  variant?: 'card' | 'compact' | 'minimal';
  className?: string;
}

export const VehicleIdentityCard: React.FC<VehicleIdentityCardProps> = ({
  plateNumber = 'MH12AB1234',
  modelName = 'Toyota Innova',
  assigned = true,
  vehicleType = '7-Seater Premium MPV',
  color = 'Silver Pearl',
  telematicsLocked = true,
  variant = 'card',
  className = '',
}) => {
  // Format plate nicely if it's alphanumeric
  const cleanPlate = plateNumber.replace(/\s+/g, '');
  const stateCode = cleanPlate.slice(0, 2);
  const districtCode = cleanPlate.slice(2, 4);
  const series = cleanPlate.slice(4, cleanPlate.length - 4);
  const number = cleanPlate.slice(-4);
  const formattedPlate = `${stateCode} ${districtCode} ${series} ${number}`.trim();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="ind-plate text-[10px]">
          <span className="ind-plate-blue">IND</span>
          {formattedPlate || plateNumber}
        </span>
        <span className="text-xs text-slate-600 font-medium">{modelName}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-xs ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 text-lg">
            🚐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="ind-plate text-[10px] leading-tight">
                <span className="ind-plate-blue">IND</span>
                {formattedPlate || plateNumber}
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">{modelName}</div>
          </div>
        </div>
        {assigned && (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Assigned ✓
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:border-blue-300 transition-all ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">VEHICLE</span>
        {assigned && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Assigned ✓
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="ind-plate">
              <span className="ind-plate-blue">IND</span>
              <span>{formattedPlate || plateNumber}</span>
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900">{modelName}</div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
            <span>{vehicleType}</span>
            <span className="text-slate-300">·</span>
            <span>{color}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl shadow-inner border border-slate-200/60">
            🚘
          </div>
          {telematicsLocked && (
            <span className="text-[9px] mono font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-blue-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              GPS LOCKED
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleIdentityCard;
