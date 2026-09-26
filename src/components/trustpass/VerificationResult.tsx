import React from 'react';
import VerificationChecklist from './VerificationChecklist';

interface VerificationResultProps {
  driverName?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  rideId?: string;
  employeeName?: string;
  employeeId?: string;
  onBoardRide?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  driverName = 'Raj Kumar',
  driverRating = 4.8,
  vehiclePlate = 'MH12AB1234',
  vehicleModel = 'Toyota Innova',
  rideId = 'RID-10421',
  employeeName = 'Akshat Gupta',
  employeeId = 'EMP-10481',
  onBoardRide,
  onViewDetails,
  className = '',
}) => {
  return (
    <div className={`p-4 flex flex-col justify-between min-h-full ${className}`}>
      {/* Top Banner / Hero */}
      <div>
        <div className="flex flex-col items-center text-center pt-2 mb-4">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl shadow-lg ring-8 ring-emerald-50 animate-bounce">
              🟢
            </div>
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold ring-2 ring-white">
              ✓
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black tracking-wider uppercase mb-1">
            TRUSTED PICKUP
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Your ride has been verified.
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Safe to board. 4-way mutual identity handshake confirmed.
          </p>
        </div>

        {/* 4-point Checklist */}
        <div className="mb-4">
          <VerificationChecklist
            variant="success-list"
            employeeVerified={true}
            driverVerified={true}
            vehicleAssigned={true}
            rideAssigned={true}
            employeeInfo={{ name: employeeName, id: employeeId }}
            driverInfo={{ name: driverName, rating: driverRating }}
            vehicleInfo={{ plate: vehiclePlate, model: vehicleModel }}
            rideInfo={{ id: rideId, route: 'Pune → Hinjewadi' }}
          />
        </div>

        {/* Verified Assignment Details Summary Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-md mb-4 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver</span>
            <div className="text-right">
              <span className="text-xs font-bold text-white">{driverName}</span>
              <span className="text-amber-400 text-xs ml-1.5">★ {driverRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle</span>
            <div className="text-right">
              <span className="ind-plate text-[10px] mr-1.5">
                <span className="ind-plate-blue">IND</span>
                {vehiclePlate}
              </span>
              <span className="text-[11px] text-slate-300 font-medium">{vehicleModel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ride</span>
            <span className="mono text-xs font-bold text-blue-400">{rideId}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onBoardRide}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-black tracking-wider uppercase rounded-xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
        >
          <span>🚗</span>
          <span>BOARD RIDE</span>
          <span>→</span>
        </button>

        <button
          onClick={onViewDetails}
          className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>📜</span>
          <span>VIEW VERIFICATION DETAILS</span>
        </button>
      </div>
    </div>
  );
};

export default VerificationResult;
