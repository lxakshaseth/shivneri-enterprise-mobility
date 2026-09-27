// ============================================================================
// DRIVER MARKER COMPONENT
// Renders driver pin with distinctive visual states: Available, Busy, Assigned, Offline
// ============================================================================

import React, { useMemo } from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

export type DriverMarkerStatus = 'Available' | 'Busy' | 'Assigned' | 'Offline' | 'AVAILABLE' | 'BUSY' | 'ASSIGNED' | 'OFFLINE';

interface DriverMarkerProps {
  position: [number, number]; // [lat, lng]
  driverId: string;
  name: string;
  phone?: string;
  status: DriverMarkerStatus;
  isAssigned?: boolean;
  etaMinutes?: number;
  distanceKm?: number;
  rating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  capacity?: number;
  onSelect?: () => void;
}

export const DriverMarker: React.FC<DriverMarkerProps> = ({
  position,
  driverId,
  name,
  phone = '+91 98230 11223',
  status,
  isAssigned = false,
  etaMinutes,
  distanceKm,
  rating = 4.8,
  vehiclePlate = 'MH 12 AB 1234',
  vehicleModel = 'Tata EV',
  capacity = 4,
  onSelect,
}) => {
  // Normalize status string
  const normalizedStatus = String(status).toUpperCase();
  const effectiveStatus: 'ASSIGNED' | 'AVAILABLE' | 'BUSY' | 'OFFLINE' = isAssigned
    ? 'ASSIGNED'
    : normalizedStatus === 'AVAILABLE'
    ? 'AVAILABLE'
    : normalizedStatus === 'BUSY'
    ? 'BUSY'
    : normalizedStatus === 'OFFLINE'
    ? 'OFFLINE'
    : 'AVAILABLE';

  // Marker Colors & Styling per State
  const styleConfig = useMemo(() => {
    switch (effectiveStatus) {
      case 'ASSIGNED':
        return {
          bgColor: '#2563eb', // Blue
          ringColor: '#3b82f6',
          badgeText: 'ASSIGNED',
          badgeClass: 'bg-blue-600 text-white',
          pulseRing: true,
          iconSvg: `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          `,
        };
      case 'AVAILABLE':
        return {
          bgColor: '#10b981', // Emerald green
          ringColor: '#34d399',
          badgeText: 'AVAILABLE',
          badgeClass: 'bg-emerald-600 text-white',
          pulseRing: false,
          iconSvg: `
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2"></path>
              <circle cx="7" cy="17" r="2"></circle>
              <path d="M9 17h6"></path>
              <circle cx="17" cy="17" r="2"></circle>
            </svg>
          `,
        };
      case 'BUSY':
        return {
          bgColor: '#f59e0b', // Amber
          ringColor: '#fbbf24',
          badgeText: 'BUSY',
          badgeClass: 'bg-amber-600 text-white',
          pulseRing: false,
          iconSvg: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          `,
        };
      case 'OFFLINE':
      default:
        return {
          bgColor: '#64748b', // Slate
          ringColor: '#94a3b8',
          badgeText: 'OFFLINE',
          badgeClass: 'bg-slate-500 text-white',
          pulseRing: false,
          iconSvg: `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          `,
        };
    }
  }, [effectiveStatus]);

  // Leaflet DivIcon
  const driverIcon = useMemo(() => {
    const pulseHtml = styleConfig.pulseRing
      ? `<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(59, 130, 246, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
      : '';

    const labelHtml = `
      <div style="position: absolute; bottom: -20px; white-space: nowrap; font-size: 10px; font-weight: 700; background: rgba(15, 23, 42, 0.9); color: #ffffff; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 2px 6px rgba(0,0,0,0.4); pointer-events: none;">
        ${name.split(' ')[0]} ${etaMinutes !== undefined ? `· ${etaMinutes}m` : ''}
      </div>
    `;

    const html = `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        ${pulseHtml}
        <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: ${styleConfig.bgColor}; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
          ${styleConfig.iconSvg}
        </div>
        ${labelHtml}
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-driver-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -26],
    });
  }, [styleConfig, name, etaMinutes]);

  return (
    <Marker
      position={position}
      icon={driverIcon}
      eventHandlers={{
        click: () => onSelect?.(),
      }}
    >
      <Tooltip direction="top" offset={[0, -22]} opacity={0.95}>
        <div className="text-[11px] font-bold text-slate-900 px-1 py-0.5">
          🚗 {name} ({styleConfig.badgeText})
        </div>
      </Tooltip>
      <Popup className="custom-map-popup">
        <div className="p-3 text-slate-900 min-w-[240px]">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${styleConfig.badgeClass}`}
            >
              {styleConfig.badgeText}
            </span>
            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
              ★ {rating.toFixed(1)}
            </span>
          </div>

          <div className="font-bold text-sm text-slate-900 mb-0.5">{name}</div>
          <div className="text-xs text-slate-500 font-mono mb-2">{driverId} · {phone}</div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle:</span>
              <span className="font-semibold text-slate-800">{vehicleModel} ({vehiclePlate})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Capacity:</span>
              <span className="text-slate-800">{capacity} Passengers</span>
            </div>
            {etaMinutes !== undefined && (
              <div className="flex justify-between font-bold text-blue-700 bg-blue-50/80 px-1.5 py-1 rounded">
                <span>OSRM Driving ETA:</span>
                <span>{etaMinutes} min</span>
              </div>
            )}
            {distanceKm !== undefined && (
              <div className="flex justify-between text-slate-600">
                <span>Driving Distance:</span>
                <span>{distanceKm} km</span>
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default DriverMarker;
