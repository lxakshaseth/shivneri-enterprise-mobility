// ============================================================================
// ROUTE LINE COMPONENT
// Renders OSRM GeoJSON Polyline route on Leaflet with ETA & Distance badge
// ============================================================================

import React, { useMemo } from 'react';
import { Polyline, Popup } from 'react-leaflet';

interface RouteLineProps {
  coordinates: Array<[number, number]>; // OSRM coordinates [lng, lat] OR Leaflet [lat, lng]
  isGeoJsonFormat?: boolean; // If true, points are [longitude, latitude]
  color?: string;
  weight?: number;
  opacity?: number;
  dashArray?: string;
  etaMinutes?: number;
  distanceKm?: number;
  label?: string;
  isAssignedRoute?: boolean;
}

export const RouteLine: React.FC<RouteLineProps> = ({
  coordinates,
  isGeoJsonFormat = true,
  color,
  weight,
  opacity,
  dashArray,
  etaMinutes,
  distanceKm,
  label = 'Driving Route',
  isAssignedRoute = true,
}) => {
  // Convert [lng, lat] (GeoJSON) to Leaflet's [lat, lng]
  const leafletPositions: Array<[number, number]> = useMemo(() => {
    if (!coordinates || coordinates.length < 2) return [];

    if (isGeoJsonFormat) {
      return coordinates.map(coord => [coord[1], coord[0]]);
    }
    return coordinates;
  }, [coordinates, isGeoJsonFormat]);

  if (leafletPositions.length < 2) return null;

  const strokeColor = color || (isAssignedRoute ? '#2563eb' : '#10b981');
  const strokeWeight = weight || (isAssignedRoute ? 5 : 3.5);
  const strokeOpacity = opacity || (isAssignedRoute ? 0.9 : 0.7);

  return (
    <>
      {/* Outer Glow / Casing for High Contrast */}
      <Polyline
        positions={leafletPositions}
        pathOptions={{
          color: '#ffffff',
          weight: strokeWeight + 3,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Main Driving Path */}
      <Polyline
        positions={leafletPositions}
        pathOptions={{
          color: strokeColor,
          weight: strokeWeight,
          opacity: strokeOpacity,
          dashArray: dashArray,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      >
        <Popup>
          <div className="p-2 text-slate-900 text-xs">
            <div className="font-bold text-sm text-blue-700 mb-1">{label}</div>
            {etaMinutes !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Duration (OSRM):</span>
                <span className="font-bold font-mono text-slate-800">{etaMinutes} min</span>
              </div>
            )}
            {distanceKm !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Distance:</span>
                <span className="font-bold font-mono text-slate-800">{distanceKm} km</span>
              </div>
            )}
            <div className="text-[10px] text-slate-400 mt-1 border-t pt-1">
              Engine: Open Source Routing Machine (OSRM)
            </div>
          </div>
        </Popup>
      </Polyline>
    </>
  );
};

export default RouteLine;
