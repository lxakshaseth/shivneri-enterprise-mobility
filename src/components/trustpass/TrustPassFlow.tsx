import React, { useState } from 'react';
import {
  VerificationMethod,
  QRState,
  SecurityErrorType,
  TrustPassRideData,
} from './types';
import DriverIdentityCard from './DriverIdentityCard';
import VehicleIdentityCard from './VehicleIdentityCard';
import VerificationStatus from './VerificationStatus';
import VerificationMethodCard, { TRUSTPASS_METHODS } from './VerificationMethodCard';
import DynamicQRCode from './DynamicQRCode';
import VerificationResult from './VerificationResult';
import SecurityErrorState from './SecurityErrorState';
import VerificationDetails from './VerificationDetails';

// Part 3 advanced components
import WhatsAppOTP from './WhatsAppOTP';
import EmailOTP from './EmailOTP';
import VehicleQR from './VehicleQR';
import NFCVerification from './NFCVerification';
import ProximityVerification from './ProximityVerification';
import GeofenceCheck from './GeofenceCheck';
import TimeWindowCheck from './TimeWindowCheck';
import DeviceContext from './DeviceContext';
import SmartFallback from './SmartFallback';
import ManualVerification from './ManualVerification';
import NightSafetyMode from './NightSafetyMode';
import TrustedContact from './TrustedContact';
import TrustPassDecision from './TrustPassDecision';

interface TrustPassFlowProps {
  onBoardSuccess?: () => void;
  onGoHome?: () => void;
  initialStep?:
    | 'verify-pickup'
    | 'method-select'
    | 'dynamic-qr'
    | 'whatsapp-otp'
    | 'email-otp'
    | 'vehicle-qr'
    | 'nfc'
    | 'proximity'
    | 'geofence'
    | 'timewindow'
    | 'device-context'
    | 'smart-fallback'
    | 'manual-override'
    | 'night-safety'
    | 'trusted-contact'
    | 'decision-engine'
    | 'success'
    | 'details'
    | 'error';
  className?: string;
}

export const TrustPassFlow: React.FC<TrustPassFlowProps> = ({
  onBoardSuccess,
  onGoHome,
  initialStep = 'verify-pickup',
  className = '',
}) => {
  const [step, setStep] = useState<string>(initialStep);
  const [selectedMethod, setSelectedMethod] = useState<VerificationMethod>('dynamic-qr');
  const [qrState, setQrState] = useState<QRState>('WAITING');
  const [errorType, setErrorType] = useState<SecurityErrorType>('DRIVER_MISMATCH');
  const [nightModeActive, setNightModeActive] = useState<boolean>(true);

  // Active Ride Data
  const rideData: TrustPassRideData = {
    rideId: 'RID-10421',
    driverName: 'Raj Kumar',
    driverRating: 4.8,
    driverVerified: true,
    driverPhone: '+91 98220 12345',
    vehiclePlate: 'MH12AB1234',
    vehicleModel: 'Toyota Innova',
    vehicleAssigned: true,
    pickupLocation: 'Kothrud, Pune',
    pickupTime: '07:30 AM',
    dropLocation: 'Hinjewadi Phase 1',
    eta: '12 min',
    employeeName: 'Akshat Gupta',
    employeeId: 'EMP-10481',
    employeeOrg: 'TCS Pune Campus',
    verificationStatus: 'pending',
    verificationMethod: selectedMethod,
    verificationId: 'VRF-928172',
    timestamp: '07:31:22 AM',
    tokenExpiresIn: 30,
  };

  // Simulate scanning progression
  const handleSimulateDriverScan = () => {
    setQrState('SCANNING');
    setTimeout(() => {
      setQrState('VERIFYING');
      setTimeout(() => {
        setQrState('VERIFIED');
        setTimeout(() => {
          setStep('decision-engine');
        }, 800);
      }, 1000);
    }, 1000);
  };

  // Simulate failure scenarios
  const handleTriggerError = (type: SecurityErrorType) => {
    setErrorType(type);
    if (type === 'QR_EXPIRED') {
      setQrState('EXPIRED');
    } else {
      setQrState('INVALID');
    }
    setStep('error');
  };

  const handleReset = () => {
    setQrState('WAITING');
    setStep('verify-pickup');
  };

  return (
    <div className={`flex flex-col h-full bg-[#f8fafc] ${className}`}>
      {/* Interactive Testing & Navigation Bar */}
      <div className="bg-slate-900 text-white px-2.5 py-1.5 flex items-center justify-between text-[10px] shrink-0 border-b border-slate-800 overflow-x-auto">
        <div className="flex items-center gap-1 font-mono text-slate-300 shrink-0 mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>TrustPass Part 3</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setStep('decision-engine')}
            title="8-Point TrustPass Engine Synthesis"
            className="px-1.5 py-0.5 rounded bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-[9px] cursor-pointer"
          >
            Engine
          </button>
          <button
            onClick={() => setStep('geofence')}
            title="Pickup Geofence Perimeter Check"
            className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[9px] cursor-pointer"
          >
            Geofence
          </button>
          <button
            onClick={() => setStep('timewindow')}
            title="Time Window Check"
            className="px-1.5 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white text-[9px] cursor-pointer"
          >
            Time
          </button>
          <button
            onClick={() => setStep('device-context')}
            title="Device & Session Context"
            className="px-1.5 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] cursor-pointer"
          >
            Device
          </button>
          <button
            onClick={() => setStep('smart-fallback')}
            title="Smart Automated Fallback"
            className="px-1.5 py-0.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-[9px] cursor-pointer"
          >
            Fallback
          </button>
          <button
            onClick={() => setStep('manual-override')}
            title="Manual Control Tower Override"
            className="px-1.5 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[9px] cursor-pointer"
          >
            Manual
          </button>
          <button
            onClick={() => setStep('trusted-contact')}
            title="Trusted Contacts Notification"
            className="px-1.5 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[9px] cursor-pointer"
          >
            Contact
          </button>
          <button
            onClick={handleReset}
            title="Reset flow"
            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-[9px] cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* ==================================================
            SCREEN 2: VERIFY PICKUP SCREEN
            ================================================== */}
        {step === 'verify-pickup' && (
          <div className="p-4 space-y-3.5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] font-black tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 uppercase mb-1">
                🛡️ TrustPass Security
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Verify Your Ride
              </h1>
              <p className="text-xs text-slate-500">
                Confirm your driver and vehicle before boarding.
              </p>
            </div>

            {/* Night Safety Policy Badge as required in Section 11 */}
            {nightModeActive && (
              <div className="p-2.5 rounded-xl bg-purple-900/10 border border-purple-300 text-purple-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🌙</span>
                  <span className="font-extrabold text-[11px]">Enhanced Safety Verification Active</span>
                </div>
                <button
                  onClick={() => setStep('night-safety')}
                  className="text-[10px] text-purple-700 underline font-semibold cursor-pointer"
                >
                  Policy Details
                </button>
              </div>
            )}

            {/* DRIVER Section */}
            <DriverIdentityCard
              name={rideData.driverName}
              rating={rideData.driverRating}
              verified={rideData.driverVerified}
              badgeLabel="Verified Driver ✓"
            />

            {/* VEHICLE Section */}
            <VehicleIdentityCard
              plateNumber={rideData.vehiclePlate}
              modelName={rideData.vehicleModel}
              assigned={rideData.vehicleAssigned}
            />

            {/* RIDE Section */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">RIDE</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Assigned ✓
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="mono text-xs font-bold text-blue-700">{rideData.rideId}</div>
                  <div className="text-xs font-semibold text-slate-800">Pune → Hinjewadi</div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  Morning Shift · Escort Compliant
                </div>
              </div>
            </div>

            {/* PICKUP Section */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PICKUP</span>
                <span className="mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {rideData.pickupTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📍</span>
                <div>
                  <div className="text-xs font-bold text-slate-900">{rideData.pickupLocation}</div>
                  <div className="text-[10px] text-slate-400">Designated Safe Enterprise Zone</div>
                </div>
              </div>
            </div>

            {/* Verification Status Checklist */}
            <VerificationStatus
              variant="list"
              rideAssigned={true}
              driverAssigned={true}
              vehicleAssigned={true}
              pickupVerified={false}
            />

            {/* Primary CTA */}
            <div className="pt-1">
              <button
                onClick={() => setStep('method-select')}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>🛡️</span>
                <span>START VERIFICATION</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            SCREEN 3: CHOOSE VERIFICATION METHOD
            ================================================== */}
        {step === 'method-select' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <div>
                <button
                  onClick={() => setStep('verify-pickup')}
                  className="text-xs text-blue-600 font-semibold mb-1 flex items-center gap-1 cursor-pointer"
                >
                  ← Back to Ride Details
                </button>
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Choose Verification Method
                </h2>
                <p className="text-[11px] text-slate-500">
                  Select your preferred TrustPass mutual handshake
                </p>
              </div>
            </div>

            {/* Unified TrustPass System Methods */}
            <div className="space-y-2">
              {TRUSTPASS_METHODS.map(m => (
                <VerificationMethodCard
                  key={m.id}
                  method={m}
                  isSelected={selectedMethod === m.id}
                  onSelect={methodId => {
                    setSelectedMethod(methodId);
                    if (methodId === 'dynamic-qr') setStep('dynamic-qr');
                    else if (methodId === 'whatsapp-otp') setStep('whatsapp-otp');
                    else if (methodId === 'email-otp') setStep('email-otp');
                    else if (methodId === 'vehicle-qr') setStep('vehicle-qr');
                    else if (methodId === 'nfc-tap') setStep('nfc');
                    else if (methodId === 'nearby-device') setStep('proximity');
                    else setStep('dynamic-qr');
                  }}
                />
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setStep('smart-fallback')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🔄</span>
                <span>Adaptive Smart Fallback (Automated Cascade)</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            SCREEN 4: DYNAMIC QR SCREEN
            ================================================== */}
        {step === 'dynamic-qr' && (
          <div className="p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setStep('method-select')}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                ← Change Method
              </button>
              <span className="mono text-[10px] text-slate-400">RID-10421</span>
            </div>

            <DynamicQRCode
              rideId={rideData.rideId}
              driverName={rideData.driverName}
              vehiclePlate={rideData.vehiclePlate}
              qrState={qrState}
              onStateChange={st => setQrState(st)}
              onGenerateNewQR={() => setQrState('WAITING')}
            />

            {qrState === 'WAITING' && (
              <div className="mt-4 pt-2">
                <button
                  onClick={handleSimulateDriverScan}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>📲</span>
                  <span>Driver Scans Your QR (Test Handshake)</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            PART 3 ADVANCED MULTI-METHOD COMPONENTS
            ================================================== */}
        {step === 'whatsapp-otp' && (
          <WhatsAppOTP
            maskedNumber="+91 XXXXXXXX21"
            expectedOtp="8103"
            onSuccess={() => setStep('decision-engine')}
            onCancel={() => setStep('method-select')}
          />
        )}

        {step === 'email-otp' && (
          <EmailOTP
            maskedEmail="a****a@company.com"
            corporateDomain="@tcs.in"
            expectedOtp="5934"
            onSuccess={() => setStep('decision-engine')}
            onCancel={() => setStep('method-select')}
          />
        )}

        {step === 'vehicle-qr' && (
          <VehicleQR
            expectedVehicle="MH12AB1234"
            expectedModel="Toyota Innova"
            expectedDriver="Raj Kumar"
            expectedRide="RID-10421"
            onSuccess={() => setStep('decision-engine')}
            onMismatch={() => handleTriggerError('VEHICLE_MISMATCH')}
            onCancel={() => setStep('method-select')}
          />
        )}

        {step === 'nfc' && (
          <NFCVerification
            onSuccess={() => setStep('decision-engine')}
            onCancel={() => setStep('method-select')}
          />
        )}

        {step === 'proximity' && (
          <ProximityVerification
            onSuccess={() => setStep('decision-engine')}
            onCancel={() => setStep('method-select')}
          />
        )}

        {step === 'geofence' && (
          <GeofenceCheck
            pickupZone="Kothrud Corporate Pickup Zone"
            radiusMeters={150}
            onProceed={() => setStep('decision-engine')}
            onNavigateToPickup={() => alert('🧭 GPS Navigation started towards Kothrud pickup bay.')}
          />
        )}

        {step === 'timewindow' && (
          <TimeWindowCheck
            windowStart="07:20 AM"
            windowEnd="07:45 AM"
            onProceed={() => setStep('decision-engine')}
          />
        )}

        {step === 'device-context' && (
          <DeviceContext
            onProceed={() => setStep('decision-engine')}
            onRequestAdditionalAuth={() => setStep('email-otp')}
          />
        )}

        {step === 'smart-fallback' && (
          <SmartFallback
            onSelectMethod={mId => {
              if (mId === 'dynamic-qr') setStep('dynamic-qr');
              else if (mId === 'whatsapp-otp') setStep('whatsapp-otp');
              else if (mId === 'email-otp') setStep('email-otp');
              else if (mId === 'nfc-ble') setStep('nfc');
              else setStep('manual-override');
            }}
            onManualOverride={() => setStep('manual-override')}
          />
        )}

        {step === 'manual-override' && (
          <ManualVerification
            rideId={rideData.rideId}
            employeeName={rideData.employeeName}
            driverName={rideData.driverName}
            vehiclePlate={rideData.vehiclePlate}
            location="Kothrud Bay 2"
            onApproved={() => setStep('decision-engine')}
            onCancel={() => setStep('verify-pickup')}
          />
        )}

        {step === 'night-safety' && (
          <div className="p-4 space-y-4">
            <button
              onClick={() => setStep('verify-pickup')}
              className="text-xs text-blue-600 font-semibold cursor-pointer"
            >
              ← Back to Verification
            </button>
            <NightSafetyMode
              initialActive={nightModeActive}
              onToggle={active => setNightModeActive(active)}
            />
          </div>
        )}

        {step === 'trusted-contact' && (
          <div className="p-4 space-y-4">
            <button
              onClick={() => setStep('verify-pickup')}
              className="text-xs text-blue-600 font-semibold cursor-pointer"
            >
              ← Back
            </button>
            <TrustedContact showBoardingNotification={true} />
          </div>
        )}

        {/* ==================================================
            SCREEN 13: TRUSTPASS ENGINE MULTI-CONTEXT DECISION
            ================================================== */}
        {step === 'decision-engine' && (
          <TrustPassDecision
            matrix={{
              employeeIdentity: true,
              driverIdentity: true,
              vehicleMatch: true,
              rideMatch: true,
              location: true,
              timeWindow: true,
              deviceContext: true,
              policy: nightModeActive,
            }}
            onBoardRide={() => setStep('success')}
            onViewAudit={() => setStep('details')}
          />
        )}

        {/* ==================================================
            SCREEN 5: SUCCESS STATE (TRUSTED PICKUP)
            ================================================== */}
        {step === 'success' && (
          <VerificationResult
            driverName={rideData.driverName}
            driverRating={rideData.driverRating}
            vehiclePlate={rideData.vehiclePlate}
            vehicleModel={rideData.vehicleModel}
            rideId={rideData.rideId}
            employeeName={rideData.employeeName}
            employeeId={rideData.employeeId}
            onBoardRide={() => {
              onBoardSuccess?.();
            }}
            onViewDetails={() => {
              setStep('details');
            }}
          />
        )}

        {/* ==================================================
            SCREEN 6: FAILURE STATES
            ================================================== */}
        {step === 'error' && (
          <SecurityErrorState
            errorType={errorType}
            assignedDriver={rideData.driverName}
            assignedVehicle={`${rideData.vehiclePlate} (${rideData.vehicleModel})`}
            assignedRide={rideData.rideId}
            onRetry={() => {
              setQrState('WAITING');
              setStep('dynamic-qr');
            }}
            onSwitchToAssigned={() => {
              setQrState('WAITING');
              setStep('dynamic-qr');
            }}
            onEmergencyContact={() => {
              alert('🚨 Fleet Security Alert dispatched! Operations room has been pinged.');
            }}
            onBack={() => setStep('verify-pickup')}
          />
        )}

        {/* ==================================================
            SCREEN 7: VERIFICATION DETAIL SCREEN
            ================================================== */}
        {step === 'details' && (
          <VerificationDetails
            employeeVerified={true}
            driverVerified={true}
            vehicleVerified={true}
            rideVerified={true}
            timeValid={true}
            locationPending={false}
            verificationMethod={TRUSTPASS_METHODS.find(m => m.id === selectedMethod)?.name || 'Dynamic QR'}
            verificationId={rideData.verificationId}
            timestamp={rideData.timestamp}
            employeeName={rideData.employeeName}
            employeeId={rideData.employeeId}
            driverName={rideData.driverName}
            vehiclePlate={rideData.vehiclePlate}
            rideId={rideData.rideId}
            onBack={() => setStep('decision-engine')}
          />
        )}
      </div>
    </div>
  );
};

export default TrustPassFlow;
