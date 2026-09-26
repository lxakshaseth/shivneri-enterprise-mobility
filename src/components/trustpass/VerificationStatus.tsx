import React from 'react';

interface VerificationStatusProps {
  status?: 'pending' | 'verifying' | 'verified' | 'failed' | 'expired';
  rideAssigned?: boolean;
  driverAssigned?: boolean;
  vehicleAssigned?: boolean;
  pickupVerified?: boolean;
  variant?: 'badge' | 'list' | 'compact-list';
  className?: string;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status = 'pending',
  rideAssigned = true,
  driverAssigned = true,
  vehicleAssigned = true,
  pickupVerified = false,
  variant = 'badge',
  className = '',
}) => {
  if (variant === 'badge') {
    switch (status) {
      case 'verified':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            🟢 Verified & Trusted
          </span>
        );
      case 'verifying':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
            🔵 Verifying TrustPass...
          </span>
        );
      case 'failed':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            🔴 Security Mismatch
          </span>
        );
      case 'expired':
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            ⏱ Verification Expired
          </span>
        );
      case 'pending':
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 ${className}`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            🟡 Verification pending
          </span>
        );
    }
  }

  const items = [
    { label: 'Ride assigned', checked: rideAssigned },
    { label: 'Driver assigned', checked: driverAssigned },
    { label: 'Vehicle assigned', checked: vehicleAssigned },
    { label: pickupVerified ? 'Pickup verified' : 'Pickup verification pending', checked: pickupVerified, isPending: !pickupVerified },
  ];

  if (variant === 'compact-list') {
    return (
      <div className={`grid grid-cols-2 gap-2 text-[11px] ${className}`}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            {item.checked ? (
              <span className="text-emerald-600 font-bold">✓</span>
            ) : (
              <span className="text-amber-500 font-bold">○</span>
            )}
            <span className={item.checked ? 'text-slate-700 font-medium' : 'text-slate-500 font-medium'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 space-y-2.5 ${className}`}>
      <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        VERIFICATION STATUS
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {item.checked ? (
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                </div>
              )}
              <span className={item.checked ? 'text-slate-800 font-medium' : 'text-slate-600 font-medium'}>
                {item.label}
              </span>
            </div>
            <span className={`text-[10px] font-semibold ${item.checked ? 'text-emerald-600' : 'text-amber-600'}`}>
              {item.checked ? 'Verified' : 'Pending'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationStatus;
