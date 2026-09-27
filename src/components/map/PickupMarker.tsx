// ============================================================================
// PICKUP MARKER COMPONENT
// Custom animated Leaflet pin representing employee pickup point
// ============================================================================

import React, { useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

interface PickupMarkerProps {
  position: [number, number]; // [lat, lng]
  name?: string;
  address?: string;
  passengerName?: string;
  passengerPhone?: string;
  scheduledTime?: string;
  slaMinutes?: number;
  isDelayed?: boolean;
}

export const PickupMarker: React.FC<PickupMarkerProps> = ({
  position,
  name = 'Pickup Location',
  address = 'Chandani Chowk, Kothrud',
  passengerName = 'Employee Passenger',
  passengerPhone = '+91 97654 32109',
  scheduledTime = '08:30 AM',
  slaMinutes = 10,
  isDelayed = false,
}) => {
  // Create custom SVG DivIcon for pickup
  const pickupIcon = useMemo(() => {
    const pulseBg = isDelayed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';
    const ringBorder = isDelayed ? '#ef4444' : '#10b981';

    const html = `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${pulseBg}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: #0f172a; border: 2.5px solid ${ringBorder}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${ringBorder}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-pickup-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -22],
    });
  }, [isDelayed]);

  return (
    <Marker position={position} icon={pickupIcon}>
      <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
        <div className="text-[11px] font-bold text-slate-900 px-1 py-0.5">
          📍 {name}
        </div>
      </Tooltip>
      <Popup className="custom-map-popup">
        <div className="p-3 text-slate-900 min-w-[220px]">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Pickup Point
            </span>
            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              {scheduledTime}
            </span>
          </div>

          <div className="font-bold text-sm text-slate-900 mb-1">{name}</div>
          <div className="text-xs text-slate-600 mb-2 leading-relaxed">{address}</div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Passenger:</span>
              <span className="font-semibold text-slate-800">{passengerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span className="font-mono text-slate-700">{passengerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pickup SLA:</span>
              <span className="font-bold text-slate-800">{slaMinutes} minutes</span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default PickupMarker;
