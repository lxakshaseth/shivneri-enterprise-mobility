import React, { useState } from 'react';

interface NightSafetyModeProps {
  initialActive?: boolean;
  shiftHours?: string;
  onToggle?: (active: boolean) => void;
  className?: string;
}

export const NightSafetyMode: React.FC<NightSafetyModeProps> = ({
  initialActive = true,
  shiftHours = '20:00 - 06:00',
  onToggle,
  className = '',
}) => {
  const [active, setActive] = useState<boolean>(initialActive);

  const toggleMode = () => {
    const next = !active;
    setActive(next);
    onToggle?.(next);
  };

  const mandatoryChecks = [
    'Driver verification',
    'Employee verification',
    'Vehicle verification',
    'OTP / QR',
    'Geofence',
    'Live tracking',
    'Boarding audit',
  ];

  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white border border-indigo-500/30 ${className}`}>
      {/* Header Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌙</span>
          <div>
            <h3 className="text-xs font-black tracking-wider text-purple-300 uppercase">
              NIGHT SAFETY MODE
            </h3>
            <div className="text-[10px] text-slate-300">
              Configured Shift: {shiftHours}
            </div>
          </div>
        </div>

        <button
          onClick={toggleMode}
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
            active
              ? 'bg-purple-600 text-white border-purple-400 shadow-sm'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {active ? 'Policy Enforced' : 'Disabled'}
        </button>
      </div>

      {/* Employee Facing Badge as explicitly requested in Section 11 */}
      {active && (
        <div className="p-2.5 rounded-xl bg-purple-900/40 border border-purple-400/40 flex items-center gap-2 mb-3">
          <span className="text-lg">🌙</span>
          <div>
            <div className="text-xs font-extrabold text-purple-200">
              Enhanced Safety Verification Active
            </div>
            <div className="text-[10px] text-purple-300">
              Strict multi-factor security rules enforced for night shift
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Checklist as specified */}
      <div className="space-y-1.5 text-xs bg-black/40 rounded-xl p-3 border border-white/5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          Mandatory Guardrails
        </div>
        {mandatoryChecks.map((check, idx) => (
          <div key={idx} className="flex items-center justify-between py-0.5">
            <span className="text-slate-300">{check}</span>
            <span className="font-bold text-purple-400 flex items-center gap-1">
              <span>✓</span>
              <span>Mandatory</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-center text-[9px] text-slate-400">
        Maharashtra State Labour Regulations Compliant (Female Employee Night Safety)
      </div>
    </div>
  );
};

export default NightSafetyMode;
