// ============================================================================
// DRIVER MAP COMPONENT (OpenStreetMap + Leaflet + React-Leaflet)
// Complete open-source map rendering with zero paid API keys.
// Displays OSM tiles, driver markers with 4 states, pickup point, and OSRM route line.
// ============================================================================

import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapController } from './MapController';
import { DriverMarker, DriverMarkerStatus } from './DriverMarker';
import { PickupMarker } from './PickupMarker';
import { RouteLine } from './RouteLine';

export interface MapDriver {
  driverId: string;
  name: string;
  phone?: string;
  latitude: number;
  longitude: number;
  status: DriverMarkerStatus;
  isOnline?: boolean;
  rating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  capacity?: number;
  etaMinutes?: number;
  distanceKm?: number;
}

export interface MapPickup {
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  passengerName?: string;
  passengerPhone?: string;
  scheduledTime?: string;
  slaMinutes?: number;
  isDelayed?: boolean;
}

interface DriverMapProps {
  drivers: MapDriver[];
  assignedDriverId?: string | null;
  pickupLocation: MapPickup;
  routeCoordinates?: Array<[number, number]>; // OSRM [lng, lat]
  routeDistanceKm?: number;
  routeEtaMinutes?: number;
  alternativeRoutes?: Array<{
    driverId: string;
    coordinates: Array<[number, number]>;
    distanceKm: number;
    etaMinutes: number;
  }>;
  onSelectDriver?: (driver: MapDriver) => void;
  className?: string;
  height?: string | number;
}

export const DriverMap: React.FC<DriverMapProps> = ({
  drivers,
  assignedDriverId,
  pickupLocation,
  routeCoordinates,
  routeDistanceKm,
  routeEtaMinutes,
  alternativeRoutes = [],
  onSelectDriver,
  className = '',
  height = '500px',
}) => {
  const [centerTarget, setCenterTarget] = useState<[number, number] | undefined>(undefined);
  const [autoFitCounter, setAutoFitCounter] = useState(0);
  const [showAllDrivers, setShowAllDrivers] = useState(true);
  const [showAlternativeRoutes, setShowAlternativeRoutes] = useState(true);

  // Identify assigned driver
  const assignedDriver = useMemo(() => {
    return drivers.find(d => d.driverId === assignedDriverId);
  }, [drivers, assignedDriverId]);

  // Compute all points that should be in the viewport bounds
  const fitBoundsPoints: Array<[number, number]> = useMemo(() => {
    const points: Array<[number, number]> = [
      [pickupLocation.latitude, pickupLocation.longitude],
    ];

    if (assignedDriver) {
      points.push([assignedDriver.latitude, assignedDriver.longitude]);
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      // Sample route coordinates (start, mid, end) to bound the view
      points.push([routeCoordinates[0][1], routeCoordinates[0][0]]);
      points.push([routeCoordinates[Math.floor(routeCoordinates.length / 2)][1], routeCoordinates[Math.floor(routeCoordinates.length / 2)][0]]);
      points.push([routeCoordinates[routeCoordinates.length - 1][1], routeCoordinates[routeCoordinates.length - 1][0]]);
    }

    // Add other visible drivers if available
    for (const d of drivers) {
      if (d.status === 'AVAILABLE' || d.status === 'Available') {
        points.push([d.latitude, d.longitude]);
      }
    }

    return points;
  }, [pickupLocation, assignedDriver, routeCoordinates, drivers]);

  const handleFitAll = () => {
    setAutoFitCounter(prev => prev + 1);
  };

  const handleCenterPickup = () => {
    setCenterTarget([pickupLocation.latitude, pickupLocation.longitude]);
  };

  const handleCenterAssignedDriver = () => {
    if (assignedDriver) {
      setCenterTarget([assignedDriver.latitude, assignedDriver.longitude]);
    }
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-2xl flex flex-col ${className}`}
      style={{ height }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        {/* Status Pill */}
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              OpenStreetMap + OSRM Live Fleet
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {drivers.length} Drivers Active · Zero Paid API Keys
            </span>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-lg pointer-events-auto flex items-center gap-1 text-[11px] font-medium text-white">
          <button
            onClick={handleFitAll}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Fit viewport to include pickup and all drivers"
          >
            Fit View
          </button>
          <button
            onClick={handleCenterPickup}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            title="Center map on pickup location"
          >
            📍 Pickup
          </button>
          {assignedDriver && (
            <button
              onClick={handleCenterAssignedDriver}
              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
              title="Center map on currently assigned driver"
            >
              🚗 Driver
            </button>
          )}
          <button
            onClick={() => setShowAllDrivers(!showAllDrivers)}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              showAllDrivers ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {showAllDrivers ? 'All Drivers' : 'Assigned Only'}
          </button>
          {alternativeRoutes.length > 0 && (
            <button
              onClick={() => setShowAlternativeRoutes(!showAlternativeRoutes)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                showAlternativeRoutes ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Alt Routes
            </button>
          )}
        </div>
      </div>

      {/* Floating Route Metric Badge */}
      {routeEtaMinutes !== undefined && routeDistanceKm !== undefined && (
        <div className="absolute top-16 left-3 z-[1000] bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-500/50 shadow-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
            🚗
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Assigned Driving Route
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white font-mono">
                {routeEtaMinutes} min
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs font-semibold text-slate-300 font-mono">
                {routeDistanceKm} km
              </span>
              <span className="text-[9px] bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50 font-mono ml-1">
                OSRM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* React-Leaflet Map Container */}
      <MapContainer
        center={[pickupLocation.latitude, pickupLocation.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
        className="z-0"
      >
        {/* OpenStreetMap Tile Layer with Proper Mandatory Attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Viewport / Bounds Controller */}
        <MapController
          center={centerTarget}
          fitBoundsPoints={fitBoundsPoints}
          autoFitTrigger={autoFitCounter}
        />

        {/* Alternative Candidate Routes (Dashed Emerald) */}
        {showAlternativeRoutes &&
          alternativeRoutes.map(alt => (
            <RouteLine
              key={`alt-route-${alt.driverId}`}
              coordinates={alt.coordinates}
              isGeoJsonFormat={true}
              color="#10b981"
              weight={3}
              opacity={0.65}
              dashArray="6 4"
              isAssignedRoute={false}
              label={`Alternative Candidate (${alt.driverId})`}
              etaMinutes={alt.etaMinutes}
              distanceKm={alt.distanceKm}
            />
          ))}

        {/* Primary Assigned Driving Route (Solid Blue) */}
        {routeCoordinates && routeCoordinates.length >= 2 && (
          <RouteLine
            coordinates={routeCoordinates}
            isGeoJsonFormat={true}
            color="#2563eb"
            weight={5}
            opacity={0.9}
            isAssignedRoute={true}
            label="Assigned Route"
            etaMinutes={routeEtaMinutes}
            distanceKm={routeDistanceKm}
          />
        )}

        {/* Pickup Location Marker */}
        <PickupMarker
          position={[pickupLocation.latitude, pickupLocation.longitude]}
          name={pickupLocation.name}
          address={pickupLocation.address}
          passengerName={pickupLocation.passengerName}
          passengerPhone={pickupLocation.passengerPhone}
          scheduledTime={pickupLocation.scheduledTime}
          slaMinutes={pickupLocation.slaMinutes}
          isDelayed={pickupLocation.isDelayed}
        />

        {/* Driver Markers */}
        {drivers.map(driver => {
          const isAssigned = driver.driverId === assignedDriverId;
          if (!showAllDrivers && !isAssigned) return null;

          return (
            <DriverMarker
              key={driver.driverId}
              position={[driver.latitude, driver.longitude]}
              driverId={driver.driverId}
              name={driver.name}
              phone={driver.phone}
              status={driver.status}
              isAssigned={isAssigned}
              etaMinutes={driver.etaMinutes}
              distanceKm={driver.distanceKm}
              rating={driver.rating}
              vehiclePlate={driver.vehiclePlate}
              vehicleModel={driver.vehicleModel}
              capacity={driver.capacity}
              onSelect={() => onSelectDriver?.(driver)}
            />
          );
        })}
      </MapContainer>

      {/* Driver Status Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 shadow-xl text-[11px] flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-slate-300 font-medium">Assigned</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-300 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-300 font-medium">Busy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <span className="text-slate-300 font-medium">Offline</span>
        </div>
      </div>
    </div>
  );
};

export default DriverMap;
