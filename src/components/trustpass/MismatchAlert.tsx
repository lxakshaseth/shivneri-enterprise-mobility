import React, { useState } from 'react';
import { DriverMismatchType } from './types';

interface MismatchAlertProps {
  type: DriverMismatchType;
  // Passenger Mismatch
  expectedPassenger?: string;
  detectedPassenger?: string;
  rideId?: string;
  // Vehicle Mismatch
  expectedVehicle?: string;
  detectedVehicle?: string;
  // Driver Mismatch
  expectedDriver?: string;
  detectedDriver?: string;
  onDoNotBoard?: () => void;
  onReport?: () => void;
  onViewAssigned?: () => void;
  onContactTower?: () => void;
  className?: string;
}

export const MismatchAlert: React.FC<MismatchAlertProps> = ({
  type = 'WRONG_PASSENGER',
  expectedPassenger = 'Akshat G.',
  detectedPassenger = 'Rahul S. (EMP-3921)',
  rideId = 'RID-10421',
  expectedVehicle = 'MH12AB1234',
  detectedVehicle = 'MH12XY7890',
  expectedDriver = 'Raj Kumar',
  detectedDriver = 'Mohan Singh',
  onDoNotBoard,
  onReport,
  onViewAssigned,
  onContactTower,
  className = '',
}) => {
  const [reported, setReported] = useState(false);

  const handleReport = () => {
    setReported(true);
    onReport?.();
  };

  return (
    <div className={`p-4 flex flex-col justify-between min-h-full bg-slate-950 text-white ${className}`}>
      <div>
        {/* Header Warning Icon */}
        <div className="flex flex-col items-center text-center pt-2 mb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-3xl shadow-lg ring-8 ring-red-500/10 mb-3 animate-pulse">
            🔴
          </div>

          {/* Section 5: WRONG PASSENGER */}
          {type === 'WRONG_PASSENGER' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider mb-1">
                SECURITY INTERCEPT
              </div>
              <h2 className="text-lg font-black text-red-500 tracking-tight">
                PASSENGER NOT ASSIGNED
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                This passenger is rostered on a different vehicle or route.
              </p>
            </>
          )}

          {/* Section 6: WRONG VEHICLE */}
          {type === 'WRONG_VEHICLE' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider mb-1">
                VEHICLE CONFLICT
              </div>
              <h2 className="text-lg font-black text-red-500 tracking-tight">
                WRONG VEHICLE
              </h2>
              <p className="text-xs text-red-300 font-semibold mt-1">
                “Do not board this vehicle.”
              </p>
            </>
          )}

          {/* Section 7: WRONG DRIVER */}
          {type === 'WRONG_DRIVER' && (
            <>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider mb-1">
                DRIVER AUTHENTICATION FAILED
              </div>
              <h2 className="text-lg font-black text-red-500 tracking-tight">
                DRIVER MISMATCH
              </h2>
              <p className="text-xs text-red-300 font-semibold mt-1">
                “This driver is not assigned to your ride.”
              </p>
            </>
          )}
        </div>

        {/* Audit Comparison Details */}
        <div className="bg-slate-900 rounded-2xl border border-red-500/30 p-3.5 space-y-2 mb-3 text-xs">
          <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">
            Mismatch Analysis
          </div>

          {type === 'WRONG_PASSENGER' && (
            <>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Employee Detected:</span>
                <span className="font-bold text-red-400">{detectedPassenger}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expected Passenger:</span>
                <span className="font-bold text-emerald-400">{expectedPassenger}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Ride:</span>
                <span className="mono font-bold text-blue-400">{rideId}</span>
              </div>
            </>
          )}

          {type === 'WRONG_VEHICLE' && (
            <>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expected Vehicle:</span>
                <span className="ind-plate text-[10px]">
                  <span className="ind-plate-blue">IND</span>
                  {expectedVehicle}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Detected Vehicle:</span>
                <span className="ind-plate text-[10px] border-red-500 text-red-600">
                  <span className="bg-red-600 text-white text-[7px] font-bold px-1 rounded-xs mr-1">IND</span>
                  {detectedVehicle}
                </span>
              </div>
            </>
          )}

          {type === 'WRONG_DRIVER' && (
            <>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Expected Driver:</span>
                <span className="font-bold text-emerald-400">{expectedDriver}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Detected Driver:</span>
                <span className="font-bold text-red-400">{detectedDriver}</span>
              </div>
            </>
          )}
        </div>

        {/* Security Warning Notice: Never allow driver to bypass this silently */}
        <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
          <div className="flex items-center gap-1.5 text-red-400 font-bold">
            <span>⚠️</span>
            <span>Zero-Tolerance Policy</span>
          </div>
          <p className="leading-relaxed">
            Shivneri policy strictly forbids onboarding unverified passengers or operating unassigned vehicles. All mismatch attempts are logged in the enterprise audit ledger.
          </p>
          {reported && (
            <div className="text-[10px] font-mono text-emerald-400 pt-1">
              ✓ Incident reported to Control Tower (#INC-84920)
            </div>
          )}
        </div>
      </div>

      {/* Buttons as explicitly specified in prompt */}
      <div className="space-y-2 pt-3">
        {type === 'WRONG_PASSENGER' && (
          <>
            <button
              onClick={onDoNotBoard}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
            >
              DO NOT BOARD
            </button>
            <button
              onClick={handleReport}
              disabled={reported}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            >
              {reported ? 'REPORTED TO CONTROL TOWER' : 'REPORT MISMATCH'}
            </button>
          </>
        )}

        {type === 'WRONG_VEHICLE' && (
          <>
            <button
              onClick={handleReport}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
            >
              REPORT
            </button>
            <button
              onClick={onViewAssigned}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            >
              VIEW ASSIGNED VEHICLE
            </button>
          </>
        )}

        {type === 'WRONG_DRIVER' && (
          <>
            <button
              onClick={onDoNotBoard}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg cursor-pointer"
            >
              DO NOT BOARD
            </button>
            <button
              onClick={onContactTower}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
            >
              CONTACT CONTROL TOWER
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MismatchAlert;
