// ============================================================================
// MAP CONTROLLER (Leaflet useMap Hook Controller)
// Handles automatic viewport centering, fitting to route/driver bounds, and animations
// ============================================================================

import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  fitBoundsPoints?: Array<[number, number]>; // Array of [lat, lng]
  autoFitTrigger?: any; // Change trigger to force refit
}

export const MapController: React.FC<MapControllerProps> = ({
  center,
  zoom,
  fitBoundsPoints,
  autoFitTrigger,
}) => {
  const map = useMap();

  // Handle center and zoom updates
  useEffect(() => {
    if (center && (!fitBoundsPoints || fitBoundsPoints.length < 2)) {
      map.flyTo(center, zoom || map.getZoom(), {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center?.[0], center?.[1], zoom]);

  // Handle auto-fitting bounds to encompass all visible markers & route
  useEffect(() => {
    if (fitBoundsPoints && fitBoundsPoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(fitBoundsPoints.map(p => L.latLng(p[0], p[1])));
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 15,
            animate: true,
            duration: 1.2,
          });
        }
      } catch (err) {
        console.warn('MapController failed to fit bounds:', err);
      }
    }
  }, [fitBoundsPoints, autoFitTrigger]);

  return null;
};

export default MapController;
