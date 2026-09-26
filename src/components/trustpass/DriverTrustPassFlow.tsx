import React, { useState } from 'react';
import { DriverMismatchType } from './types';
import PassengerVerificationCard from './PassengerVerificationCard';
import QRScanner from './QRScanner';
import MutualHandshake from './MutualHandshake';
import PassengerResult from './PassengerResult';
import MismatchAlert from './MismatchAlert';
import OTPVerification from './OTPVerification';
import SafeDropVerification from './SafeDropVerification';

interface DriverTrustPassFlowProps {
  onBoardingComplete?: () => void;
  onTripCompleted?: () => void;
  onBackToDashboard?: () => void;
  initialStep?:
    | 'verify-passenger'
    | 'scanner'
    | 'handshake'
    | 'result'
    | 'otp'
    | 'mismatch'
    | 'safedrop';
  className?: string;
}

export const DriverTrustPassFlow: React.FC<DriverTrustPassFlowProps> = ({
  onBoardingComplete,
  onTripCompleted,
  onBackToDashboard,
  initialStep = 'verify-passenger',
  className = '',
}) => {
  const [step, setStep] = useState<
    | 'verify-passenger'
    | 'scanner'
    | 'handshake'
    | 'result'
    | 'otp'
    | 'mismatch'
    | 'safedrop'
  >(initialStep);

  const [mismatchType, setMismatchType] = useState<DriverMismatchType>('WRONG_PASSENGER');
  const [boardingTime, setBoardingTime] = useState<string>('07:31:45 AM');

  // Active Ride Info
  const rideInfo = {
    rideId: 'RID-10421',
    pickup: 'Kothrud, Pune',
    expectedPassenger: 'Akshat G.',
    passengerId: 'EMP-10481',
    vehicle: 'MH12AB1234',
    vehicleModel: 'Toyota Innova Crysta',
    driver: 'Raj Kumar',
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-white ${className}`}>
      {/* Top Prototype Scenario Selector Toolbar */}
      <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between text-[10px] shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-mono text-slate-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Driver TrustPass Test</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setStep('handshake');
            }}
            title="Test Mutual Handshake & Allow Decision"
            className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold cursor-pointer"
          >
            Handshake
          </button>
          <button
            onClick={() => {
              setMismatchType('WRONG_PASSENGER');
              setStep('mismatch');
            }}
            title="Test Wrong Passenger (Rahul S.)"
            className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[9px] cursor-pointer"
          >
            Wrong Pax
          </button>
          <button
            onClick={() => {
              setMismatchType('WRONG_VEHICLE');
              setStep('mismatch');
            }}
            title="Test Wrong Vehicle (MH12XY7890)"
            className="px-1.5 py-0.5 rounded bg-orange-600 hover:bg-orange-500 text-white text-[9px] cursor-pointer"
          >
            Wrong Veh
          </button>
          <button
            onClick={() => {
              setStep('otp');
            }}
            title="Test OTP Fallback"
            className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[9px] cursor-pointer"
          >
            OTP
          </button>
          <button
            onClick={() => {
              setStep('safedrop');
            }}
            title="Test Deboarding Safe Drop"
            className="px-1.5 py-0.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-[9px] cursor-pointer"
          >
            Drop
          </button>
          <button
            onClick={() => setStep('verify-passenger')}
            title="Reset"
            className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-[9px] cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Screen Body */}
      <div className="flex-1 overflow-y-auto pb-16">
        {/* ==================================================
            1. DRIVER VERIFICATION SCREEN (At Pickup Point)
            ================================================== */}
        {step === 'verify-passenger' && (
          <div className="p-4 space-y-4">
            <PassengerVerificationCard
              rideId={rideInfo.rideId}
              pickup={rideInfo.pickup}
              expectedPassenger={rideInfo.expectedPassenger}
              passengerId={rideInfo.passengerId}
              vehicle={rideInfo.vehicle}
              vehicleModel={rideInfo.vehicleModel}
              status="pending"
              onScanQR={() => setStep('scanner')}
              onEnterOTP={() => setStep('otp')}
            />

            {/* Quick Helper Tips for Driver */}
            <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <span>🛡️</span>
                <span>Shivneri Mutual Security Protocol</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Position your phone camera towards passenger Akshat G.'s Dynamic QR code. Never allow boarding before mutual confirmation.
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            2. QR SCANNER SCREEN
            ================================================== */}
        {step === 'scanner' && (
          <QRScanner
            rideId={rideInfo.rideId}
            expectedPassenger={rideInfo.expectedPassenger}
            vehicle={rideInfo.vehicle}
            location="Kothrud"
            onScanSuccess={() => {
              setStep('handshake');
            }}
            onScanWrongPassenger={() => {
              setMismatchType('WRONG_PASSENGER');
              setStep('mismatch');
            }}
            onScanWrongVehicle={() => {
              setMismatchType('WRONG_VEHICLE');
              setStep('mismatch');
            }}
            onScanWrongDriver={() => {
              setMismatchType('WRONG_DRIVER');
              setStep('mismatch');
            }}
            onSwitchToOtp={() => setStep('otp')}
            onCancel={() => setStep('verify-passenger')}
          />
        )}

        {/* ==================================================
            3. MUTUAL HANDSHAKE SCREEN (The Core Shivneri Feature)
            ================================================== */}
        {step === 'handshake' && (
          <MutualHandshake
            employeeVerified={true}
            driverVerified={true}
            vehicleVerified={true}
            rideVerified={true}
            locationVerified={false}
            timeVerified={true}
            decision="ALLOW"
            onProceed={() => setStep('result')}
            onFallback={() => setStep('otp')}
            onDeny={() => {
              setMismatchType('WRONG_PASSENGER');
              setStep('mismatch');
            }}
          />
        )}

        {/* ==================================================
            4. DRIVER PASSENGER RESULT & BOARDING CONFIRMATION
            ================================================== */}
        {step === 'result' && (
          <PassengerResult
            employeeName={rideInfo.expectedPassenger}
            employeeId={rideInfo.passengerId}
            rideId={rideInfo.rideId}
            pickup="Kothrud"
            vehicle={rideInfo.vehicle}
            vehicleModel={rideInfo.vehicleModel}
            onConfirmBoarding={t => {
              setBoardingTime(t);
            }}
            onProceedToRide={() => {
              onBoardingComplete?.();
            }}
          />
        )}

        {/* ==================================================
            5, 6, 7. MISMATCH ALERTS (Wrong Passenger, Vehicle, Driver)
            ================================================== */}
        {step === 'mismatch' && (
          <MismatchAlert
            type={mismatchType}
            expectedPassenger={rideInfo.expectedPassenger}
            detectedPassenger="Rahul S. (EMP-3921)"
            rideId={rideInfo.rideId}
            expectedVehicle={rideInfo.vehicle}
            detectedVehicle="MH12XY7890"
            expectedDriver={rideInfo.driver}
            detectedDriver="Mohan Singh"
            onDoNotBoard={() => setStep('verify-passenger')}
            onReport={() => {
              alert('🚨 Security Incident Logged: Control Tower alerted with live GPS pin.');
            }}
            onViewAssigned={() => setStep('verify-passenger')}
            onContactTower={() => {
              alert('📞 Dialing Control Tower (+91 20 6712 9000)...');
            }}
          />
        )}

        {/* ==================================================
            8. OTP FALLBACK SCREEN (4 attempts limit)
            ================================================== */}
        {step === 'otp' && (
          <OTPVerification
            correctOtp="7429"
            maxAttempts={4}
            onSuccess={() => {
              setStep('result');
            }}
            onBlocked={() => {
              // Blocked state handled within component
            }}
            onCancel={() => setStep('verify-passenger')}
          />
        )}

        {/* ==================================================
            9. DEBOARDING VERIFICATION (Safe Drop Protocol)
            ================================================== */}
        {step === 'safedrop' && (
          <SafeDropVerification
            employeeName={rideInfo.expectedPassenger}
            dropLocation="Hinjewadi Phase 1"
            dropTime="08:18 AM"
            expectedOtp="5831"
            onTripCompleted={() => {
              onTripCompleted?.();
            }}
            onCancel={() => setStep('verify-passenger')}
          />
        )}
      </div>
    </div>
  );
};

export default DriverTrustPassFlow;
