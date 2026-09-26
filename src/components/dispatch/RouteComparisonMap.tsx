// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - ROUTE COMPARISON MAP
// Visual Map Layers for Original Route, Split Reassigned Route & Traffic Hotspot
// ============================================================================

import React, { useState } from 'react';
import { DynamicRideStop, ReassignmentEvent, TrafficEvent } from '../../types/dispatch';
import { getMapboxRasterTileUrl } from '../../services/mapbox/mapboxService';

interface Props {
  stops: DynamicRideStop[];
  reassignment: ReassignmentEvent | null;
  trafficEvent: TrafficEvent | null;
}

export function RouteComparisonMap({ stops, reassignment, trafficEvent }: Props) {
  const [showOriginalRoute, setShowOriginalRoute] = useState(true);
  const [showNewRoute, setShowNewRoute] = useState(true);
  const [showTrafficLayer, setShowTrafficLayer] = useState(true);

  const isReassigned = reassignment?.status === 'REASSIGNED' || reassignment?.status === 'ACCEPTED';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 text-white shadow-xl h-[380px] flex flex-col">
      {/* Map Control Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-md pointer-events-auto flex items-center gap-2">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Pune Arterial Corridor Live GIS
          </span>
          <span className="text-[10px] text-slate-400 font-mono">RT-001 (Kothrud ➔ Hinjewadi)</span>
        </div>

        {/* Layer Toggles */}
        <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-md pointer-events-auto flex items-center gap-1 text-[10px] font-semibold">
          <button
            onClick={() => setShowOriginalRoute(!showOriginalRoute)}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showOriginalRoute ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Orig Route
          </button>
          <button
            onClick={() => setShowNewRoute(!showNewRoute)}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showNewRoute ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Reassigned Route
          </button>
          <button
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              showTrafficLayer ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Traffic Hotspot
          </button>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="flex-1 w-full h-full relative bg-radial from-slate-900 via-slate-950 to-black overflow-hidden">
        {/* Real-World Mapbox Base Raster Tiles */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-1 select-none pointer-events-none opacity-25 mix-blend-screen overflow-hidden">
          <img
            src={getMapboxRasterTileUrl('dark', 12, 2886, 1833)}
            alt="Mapbox Pune West"
            className="w-full h-full object-cover"
          />
          <img
            src={getMapboxRasterTileUrl('dark', 12, 2887, 1833)}
            alt="Mapbox Pune East"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Background GIS Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-15">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#38bdf8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* TRAFFIC CONGESTION ZONE LAYER (Karve Nagar to Wakad Bridge) */}
          {showTrafficLayer && trafficEvent && trafficEvent.isActive && (
            <g className="animate-pulse">
              {/* Traffic corridor glow buffer */}
              <line
                x1="34"
                y1="64"
                x2="62"
                y2="36"
                stroke="#ef4444"
                strokeWidth="7"
                strokeOpacity="0.3"
                strokeLinecap="round"
              />
              <line
                x1="34"
                y1="64"
                x2="62"
                y2="36"
                stroke="#dc2626"
                strokeWidth="2.5"
                strokeDasharray="3 2"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* ORIGINAL ROUTE (A -> B -> C -> D -> E) */}
          {showOriginalRoute && (
            <polyline
              points="20,78 34,64 48,50 62,36 82,22"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.8"
              strokeDasharray={isReassigned ? '3 2' : 'none'}
              strokeOpacity={isReassigned ? 0.4 : 0.9}
            />
          )}

          {/* REASSIGNED SPLIT ROUTES */}
          {showNewRoute && isReassigned && (
            <>
              {/* Original Driver's Bypass Route (A -> B -> D -> E, skipping C) */}
              <polyline
                points="20,78 34,64 62,36 82,22"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* New Driver Mohan Singh Approach & Service Route (DRV-208 Aundh node -> Stop C -> Stop E) */}
              <polyline
                points="35,40 48,50 82,22"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
              />
            </>
          )}

          {/* STOPS RENDER */}
          {stops.map(stop => {
            const isStopC = stop.id === 'stop-c';
            const isReassignedStop = isStopC && isReassigned;

            return (
              <g key={stop.id} transform={`translate(${stop.mapX}, ${stop.mapY})`}>
                {/* Ping animation for affected stop */}
                {isStopC && (
                  <circle r="6" fill="#f59e0b" fillOpacity="0.4" className="animate-ping" />
                )}

                <circle
                  r={isStopC ? '3.5' : '2.5'}
                  fill={
                    stop.isDrop
                      ? '#ef4444'
                      : isReassignedStop
                      ? '#10b981'
                      : isStopC
                      ? '#f59e0b'
                      : '#3b82f6'
                  }
                  stroke="#ffffff"
                  strokeWidth="0.8"
                />

                {/* Stop Label text */}
                <text
                  x="0"
                  y="-5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="2.8"
                  fontWeight="bold"
                  className="drop-shadow-md select-none font-sans"
                >
                  {stop.name.split(' ')[0]} {isStopC ? '(C)' : ''}
                </text>
              </g>
            );
          })}

          {/* VEHICLE 1 (Driver Raj Kumar - DRV-001) */}
          <g transform="translate(34, 64)">
            <circle r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="7" textAnchor="middle" fill="#93c5fd" fontSize="2.4" fontWeight="bold">
              DRV-001 (Raj)
            </text>
          </g>

          {/* VEHICLE 2 (Backup Driver Mohan Singh - DRV-208) */}
          {isReassigned && (
            <g transform="translate(35, 40)">
              <circle r="4.2" fill="#10b981" stroke="#ffffff" strokeWidth="1" className="animate-pulse" />
              <text x="0" y="7" textAnchor="middle" fill="#6ee7b7" fontSize="2.4" fontWeight="bold">
                DRV-208 (Mohan) ⚡
              </text>
            </g>
          )}
        </svg>

        {/* Legend / Status Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-[10px] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1 bg-blue-500 rounded-sm" />
            <span className="text-slate-300">Driver 1 Bypass (A ➔ B ➔ D ➔ E)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1 bg-emerald-500 rounded-sm" />
            <span className="text-slate-300">Driver 2 Reassigned (C ➔ E) · ETA 6m</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-1 bg-rose-500 rounded-sm" />
            <span className="text-slate-300">Severe Traffic Bottleneck (B ➔ D)</span>
          </div>
        </div>

        {/* Traffic Delay Badge */}
        {trafficEvent && trafficEvent.isActive && (
          <div className="absolute top-14 right-3 bg-rose-950/90 border border-rose-600/80 px-3 py-1.5 rounded-xl text-right">
            <div className="text-[10px] font-bold text-rose-300 uppercase">Traffic Bottleneck</div>
            <div className="text-xs font-black text-rose-100 font-mono">+{trafficEvent.delayMinutes} min delay</div>
            <div className="text-[9px] text-rose-300/80">Avg speed: {trafficEvent.avgSpeedKmh} km/h</div>
          </div>
        )}

        {/* Mapbox GIS Watermark */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs border border-slate-700/60 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-bold text-white tracking-wide">mapbox</span>
          <span className="text-slate-400">© Mapbox</span>
        </div>
      </div>
    </div>
  );
}
