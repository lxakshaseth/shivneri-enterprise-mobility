import React from 'react';
import { SecurityErrorType } from './types';

interface SecurityErrorStateProps {
  errorType: SecurityErrorType;
  assignedDriver?: string;
  detectedDriver?: string;
  assignedVehicle?: string;
  detectedVehicle?: string;
  assignedRide?: string;
  detectedRide?: string;
  onRetry?: () => void;
  onSwitchToAssigned?: () => void;
  onEmergencyContact?: () => void;
  onBack?: () => void;
  className?: string;
}

export const SecurityErrorState: React.FC<SecurityErrorStateProps> = ({
  errorType,
  assignedDriver = 'Raj Kumar',
  detectedDriver = 'Mohan Singh (DRV-9012)',
  assignedVehicle = 'MH12AB1234 (Toyota Innova)',
  detectedVehicle = 'MH14XY9876 (Maruti Ertiga)',
  assignedRide = 'RID-10421',
  detectedRide = 'RID-10398 (Evening Shift B)',
  onRetry,
  onSwitchToAssigned,
  onEmergencyContact,
  onBack,
  className = '',
}) => {
  const getErrorConfig = () => {
    switch (errorType) {
      case 'DRIVER_MISMATCH':
        return {
          icon: '🔴',
          title: 'DRIVER MISMATCH',
          badgeText: 'SECURITY ALERT · UNVERIFIED DRIVER',
          subtitle: 'This driver is not assigned to your ride.',
          explanation: `The driver detected (${detectedDriver}) does not match your assigned verified driver (${assignedDriver}). Transport security rules forbid boarding cabs with unassigned personnel.`,
          actionRecommendation: 'Do NOT board this vehicle. Ask the driver to show company ID or contact fleet dispatch.',
          primaryActionLabel: '🔄 Verify Assigned Driver',
          primaryAction: onRetry,
          showEmergencyCall: true,
        };

      case 'VEHICLE_MISMATCH':
        return {
          icon: '🔴',
          title: 'VEHICLE MISMATCH',
          badgeText: 'SECURITY ALERT · UNASSIGNED FLEET',
          subtitle: 'This vehicle is not assigned to your ride.',
          explanation: `Detected license plate (${detectedVehicle}) does not match your assigned vehicle (${assignedVehicle}). Unregistered vehicles are blocked from pickup geofences.`,
          actionRecommendation: 'Inspect the license plate carefully. If the fleet company substituted vehicles, dispatch authorization is required.',
          primaryActionLabel: '🔄 Re-check Vehicle Plate',
          primaryAction: onRetry,
          showEmergencyCall: true,
        };

      case 'RIDE_MISMATCH':
        return {
          icon: '🔴',
          title: 'RIDE MISMATCH',
          badgeText: 'ROUTING CONFLICT · WRONG SHIFT',
          subtitle: 'This verification belongs to another ride.',
          explanation: `This verification code is generated for Ride ${assignedRide}, but the driver scanned token for ${detectedRide}.`,
          actionRecommendation: 'Confirm your rostered shift time or ask driver to refresh trip schedule.',
          primaryActionLabel: '🔁 Switch to Scheduled Ride',
          primaryAction: onSwitchToAssigned ?? onRetry,
          showEmergencyCall: false,
        };

      case 'QR_EXPIRED':
        return {
          icon: '⏱',
          title: 'QR EXPIRED',
          badgeText: 'REPLAY DEFENSE · TOKEN TIMEOUT',
          subtitle: 'Generate a new verification code.',
          explanation: 'To prevent replay attacks and visual cloning, Shivneri TrustPass codes expire automatically after 30 seconds of inactivity.',
          actionRecommendation: 'Generate a fresh dynamic QR. The new cryptographic key will be valid for another 30 seconds.',
          primaryActionLabel: '🔄 Generate New Verification Code',
          primaryAction: onRetry,
          showEmergencyCall: false,
        };

      case 'INVALID_SIGNATURE':
      default:
        return {
          icon: '⚠️',
          title: 'INVALID TOKEN',
          badgeText: 'CRYPTO VERIFICATION FAILED',
          subtitle: 'Cryptographic handshake could not be validated.',
          explanation: 'The digital signature payload was corrupted or intercepted. The central security certificate did not match.',
          actionRecommendation: 'Ensure active mobile internet or switch to offline Ride OTP verification.',
          primaryActionLabel: '🔄 Refresh Security Token',
          primaryAction: onRetry,
          showEmergencyCall: true,
        };
    }
  };

  const config = getErrorConfig();

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full ${className}`}>
      <div>
        {/* Top Header Warning */}
        <div className="flex flex-col items-center text-center pt-1 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-3xl shadow-sm mb-2.5">
            {config.icon}
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black tracking-wider uppercase mb-1">
            {config.badgeText}
          </span>

          <h2 className="text-base font-black text-red-600 tracking-tight">
            {config.title}
          </h2>

          <p className="text-xs font-semibold text-slate-800 mt-0.5">
            “{config.subtitle}”
          </p>
        </div>

        {/* Professional Explanation Card */}
        <div className="bg-red-50/70 border border-red-200/90 rounded-2xl p-3.5 mb-3 text-left">
          <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>Security Assessment</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed font-normal">
            {config.explanation}
          </p>

          <div className="mt-2.5 pt-2 border-t border-red-200/60 text-[11px] text-red-900 font-semibold flex items-start gap-1.5">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span>{config.actionRecommendation}</span>
          </div>
        </div>

        {/* Assigned vs Detected Comparison Box */}
        {(errorType === 'DRIVER_MISMATCH' || errorType === 'VEHICLE_MISMATCH' || errorType === 'RIDE_MISMATCH') && (
          <div className="bg-white rounded-xl border border-slate-200 p-3 mb-3 text-xs space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Verification Audit Diff
            </div>
            {errorType === 'DRIVER_MISMATCH' && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Driver:</span>
                  <span className="font-bold text-emerald-700">{assignedDriver} ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Detected Driver:</span>
                  <span className="font-bold text-red-600">{detectedDriver} ✗</span>
                </div>
              </>
            )}
            {errorType === 'VEHICLE_MISMATCH' && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Vehicle:</span>
                  <span className="font-bold text-emerald-700">{assignedVehicle} ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Detected Vehicle:</span>
                  <span className="font-bold text-red-600">{detectedVehicle} ✗</span>
                </div>
              </>
            )}
            {errorType === 'RIDE_MISMATCH' && (
              <>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Ride:</span>
                  <span className="mono font-bold text-emerald-700">{assignedRide} ✓</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Detected Ride:</span>
                  <span className="mono font-bold text-red-600">{detectedRide} ✗</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={config.primaryAction}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>{config.primaryActionLabel}</span>
        </button>

        {config.showEmergencyCall && (
          <button
            onClick={onEmergencyContact}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>🚨</span>
            <span>Alert Fleet Security Dispatch</span>
          </button>
        )}

        <button
          onClick={onBack}
          className="w-full py-2 text-slate-500 hover:text-slate-700 text-xs font-medium text-center cursor-pointer"
        >
          ← Return to Verification Menu
        </button>
      </div>
    </div>
  );
};

export default SecurityErrorState;
