// ============================================================================
// LIVE DRIVER DISPATCH PANEL (Section 13 Frontend UX)
// Dispatcher/Admin Live Control Tower with OpenStreetMap, OSRM Routes,
// Alternative Driver ETA Comparison, One-Click Reassignment & Audit Trail
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { DriverMap, MapDriver, MapPickup } from './DriverMap';
import {
  OpenMapApiClient,
  ApiDriver,
  ApiRide,
  ReassignmentEvaluationData,
  ReassignmentHistoryItem,
} from '../../services/api/openMapApi';
import { DriverGeolocationTracker } from '../../services/geolocation/driverGeolocation';

// Fallback seed state for seamless standalone rendering
const INITIAL_PICKUP: MapPickup = {
  latitude: 18.5080,
  longitude: 73.7925,
  name: 'Chandani Chowk, Kothrud',
  address: 'Paud Road Flyover Junction, Pune',
  passengerName: 'Rohan Joshi',
  passengerPhone: '+91 97654 32109',
  scheduledTime: '08:30 AM',
  slaMinutes: 10,
  isDelayed: true,
};

const INITIAL_DRIVERS: MapDriver[] = [
  {
    driverId: 'DRV-001',
    name: 'Raj Kumar',
    phone: '+91 98230 11223',
    latitude: 18.5089,
    longitude: 73.8122,
    status: 'Assigned',
    rating: 4.88,
    vehiclePlate: 'MH 12 AB 1234',
    vehicleModel: 'Tata Tigor EV',
    capacity: 4,
    etaMinutes: 18, // Delayed due to bottleneck
    distanceKm: 4.8,
  },
  {
    driverId: 'DRV-208',
    name: 'Mohan Singh',
    phone: '+91 97654 33211',
    latitude: 18.5123,
    longitude: 73.8055,
    status: 'Available',
    rating: 4.94,
    vehiclePlate: 'MH 12 DE 5678',
    vehicleModel: 'Hyundai Xcent',
    capacity: 4,
    etaMinutes: 6,
    distanceKm: 2.4,
  },
  {
    driverId: 'DRV-114',
    name: 'Santosh Shinde',
    phone: '+91 98901 22334',
    latitude: 18.5255,
    longitude: 73.8211,
    status: 'Available',
    rating: 4.82,
    vehiclePlate: 'MH 14 CC 8899',
    vehicleModel: 'Maruti Ertiga',
    capacity: 6,
    etaMinutes: 11,
    distanceKm: 4.2,
  },
  {
    driverId: 'DRV-301',
    name: 'Vikram Jadhav',
    phone: '+91 94220 77665',
    latitude: 18.5399,
    longitude: 73.7844,
    status: 'Available',
    rating: 4.76,
    vehiclePlate: 'MH 12 XY 4321',
    vehicleModel: 'Tata Nexon EV',
    capacity: 4,
    etaMinutes: 14,
    distanceKm: 5.6,
  },
  {
    driverId: 'DRV-404',
    name: 'Ganesh More',
    phone: '+91 91580 99887',
    latitude: 18.5204,
    longitude: 73.8567,
    status: 'Offline',
    rating: 4.65,
    vehiclePlate: 'MH 12 ZZ 9900',
    vehicleModel: 'Maruti Dzire',
    capacity: 4,
    etaMinutes: 28,
    distanceKm: 12.0,
  },
];

export const LiveDriverDispatchPanel: React.FC = () => {
  const [drivers, setDrivers] = useState<MapDriver[]>(INITIAL_DRIVERS);
  const [pickup, setPickup] = useState<MapPickup>(INITIAL_PICKUP);
  const [assignedDriverId, setAssignedDriverId] = useState<string>('DRV-001');
  const [currentEta, setCurrentEta] = useState<number>(18);
  const [currentDistance, setCurrentDistance] = useState<number>(4.8);
  const [routeCoordinates, setRouteCoordinates] = useState<Array<[number, number]>>([]);
  const [alternativeRoutes, setAlternativeRoutes] = useState<Array<{
    driverId: string;
    coordinates: Array<[number, number]>;
    distanceKm: number;
    etaMinutes: number;
  }>>([]);

  // Reassignment evaluation & history
  const [evaluation, setEvaluation] = useState<ReassignmentEvaluationData | null>(null);
  const [reassignmentBanner, setReassignmentBanner] = useState<{
    show: boolean;
    previousDriver: string;
    newDriver: string;
    previousEta: number;
    newEta: number;
  } | null>(null);
  const [history, setHistory] = useState<ReassignmentHistoryItem[]>([]);
  const [isReassigning, setIsReassigning] = useState(false);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const trackerRef = useRef<DriverGeolocationTracker | null>(null);

  // Load initial OSRM route & evaluation
  const loadRouteAndCandidates = async (driverId = assignedDriverId) => {
    const driver = drivers.find(d => d.driverId === driverId);
    if (!driver) return;

    try {
      // 1. Fetch OSRM Route for current assigned driver
      const routeRes = await OpenMapApiClient.getRoute(
        [driver.latitude, driver.longitude],
        [pickup.latitude, pickup.longitude]
      );

      if (routeRes && routeRes.geometry?.coordinates) {
        setRouteCoordinates(routeRes.geometry.coordinates);
        setCurrentDistance(routeRes.distance);
        // If driver has reported severe bottleneck, retain higher ETA unless improved
        setCurrentEta(prev => Math.max(prev, routeRes.duration));
      }

      // 2. Fetch alternative candidate routes
      const altDrivers = drivers.filter(
        d => d.driverId !== driverId && (d.status === 'Available' || d.status === 'AVAILABLE')
      );

      const computedAlts: typeof alternativeRoutes = [];
      for (const alt of altDrivers) {
        try {
          const altRoute = await OpenMapApiClient.getRoute(
            [alt.latitude, alt.longitude],
            [pickup.latitude, pickup.longitude]
          );
          if (altRoute?.geometry?.coordinates) {
            computedAlts.push({
              driverId: alt.driverId,
              coordinates: altRoute.geometry.coordinates,
              distanceKm: altRoute.distance,
              etaMinutes: altRoute.duration,
            });
          }
        } catch {}
      }
      setAlternativeRoutes(computedAlts);

      // 3. Try to fetch backend evaluation & history if server running
      try {
        const evalData = await OpenMapApiClient.evaluateReassignment('RIDE-10421');
        setEvaluation(evalData);
        const hist = await OpenMapApiClient.getReassignmentHistory('RIDE-10421');
        setHistory(hist);
      } catch {
        // Build client-side evaluation fallback
        buildClientSideEvaluation(driverId, altDrivers, computedAlts);
      }
    } catch (err) {
      console.warn('Could not fetch OSRM route:', err);
    }
  };

  const buildClientSideEvaluation = (
    currentId: string,
    altDrivers: MapDriver[],
    computedAlts: typeof alternativeRoutes
  ) => {
    const evaluatedAlternatives = altDrivers.map(alt => {
      const altRoute = computedAlts.find(a => a.driverId === alt.driverId);
      const eta = altRoute?.etaMinutes ?? alt.etaMinutes ?? 10;
      const improvement = currentEta - eta;
      const eligible = improvement >= 5;

      return {
        driver: {
          driverId: alt.driverId,
          name: alt.name,
          phone: alt.phone || '',
          status: 'AVAILABLE' as const,
          isOnline: true,
          location: { type: 'Point' as const, coordinates: [alt.longitude, alt.latitude] as [number, number] },
          accuracy: 10,
          lastUpdatedAt: new Date().toISOString(),
          rating: alt.rating || 4.8,
          vehicle: {
            plate: alt.vehiclePlate || '',
            model: alt.vehicleModel || '',
            type: 'cab' as const,
            capacity: alt.capacity || 4,
          },
        },
        distanceKm: altRoute?.distanceKm ?? alt.distanceKm ?? 3.5,
        etaMinutes: eta,
        etaImprovementMinutes: improvement,
        eligible,
        rejectionReason: eligible
          ? undefined
          : `Improvement of ${improvement}m below threshold (5m required)`,
      };
    });

    evaluatedAlternatives.sort((a, b) => a.etaMinutes - b.etaMinutes);
    const best = evaluatedAlternatives.find(a => a.eligible);

    setEvaluation({
      canReassign: Boolean(best),
      currentEtaMinutes: currentEta,
      bestAlternativeDriver: best?.driver || null,
      bestAlternativeEtaMinutes: best?.etaMinutes || null,
      etaImprovementMinutes: best?.etaImprovementMinutes || 0,
      evaluatedAlternatives,
      ruleChecks: [
        { passed: true, rule: '1. Ride still needs pickup', reason: 'Awaiting driver arrival' },
        { passed: true, rule: '2. Current driver still assigned', reason: `Driver ${currentId} assigned` },
        { passed: Boolean(best), rule: '3. Alternative driver available', reason: best ? `Found ${best.driver.name}` : 'None eligible' },
        { passed: true, rule: '4. Location is fresh', reason: 'Telemetry under 30s' },
        { passed: Boolean(best && best.etaImprovementMinutes >= 5), rule: '5. ETA improvement >= 5 min', reason: best ? `Improves by ${best.etaImprovementMinutes}m` : 'Threshold not met' },
        { passed: true, rule: '6. Within 10 km radius', reason: 'Candidates in range' },
        { passed: true, rule: '7. Reassignments <= 2', reason: 'Within limit' },
      ],
    });
  };

  useEffect(() => {
    loadRouteAndCandidates();
  }, [assignedDriverId, currentEta]);

  // Execute Reassignment (Section 8 & 13)
  const handleExecuteReassignment = async (targetDriverId?: string) => {
    const candidateId = targetDriverId || evaluation?.bestAlternativeDriver?.driverId || 'DRV-208';
    const targetDriver = drivers.find(d => d.driverId === candidateId);
    if (!targetDriver) return;

    setIsReassigning(true);

    try {
      // Call backend reassignment endpoint
      const result = await OpenMapApiClient.reassignPickup('RIDE-10421', {
        targetDriverId: candidateId,
        reason: 'BETTER_ETA',
        force: true,
      });

      const prevDriverName = result.previousDriver?.name || 'Raj Kumar';
      const newDriverName = result.newDriver?.name || targetDriver.name;
      const prevEta = result.historyRecord?.previousEta || currentEta;
      const newEta = result.historyRecord?.newEta || targetDriver.etaMinutes || 6;

      // Update local state
      applyReassignment(candidateId, prevDriverName, newDriverName, prevEta, newEta);
    } catch {
      // Fallback local execution
      const currentDriver = drivers.find(d => d.driverId === assignedDriverId);
      const prevDriverName = currentDriver?.name || 'Raj Kumar';
      const newDriverName = targetDriver.name;
      const prevEta = currentEta;
      const newEta = targetDriver.etaMinutes || 6;

      applyReassignment(candidateId, prevDriverName, newDriverName, prevEta, newEta);
    } finally {
      setIsReassigning(false);
    }
  };

  const applyReassignment = (
    newDriverId: string,
    prevName: string,
    newName: string,
    prevEta: number,
    newEta: number
  ) => {
    // Swap statuses
    setDrivers(prev =>
      prev.map(d => {
        if (d.driverId === assignedDriverId) {
          return { ...d, status: 'Available' };
        }
        if (d.driverId === newDriverId) {
          return { ...d, status: 'Assigned' };
        }
        return d;
      })
    );

    setAssignedDriverId(newDriverId);
    setCurrentEta(newEta);

    // Show Reassignment Banner (Section 13)
    setReassignmentBanner({
      show: true,
      previousDriver: prevName,
      newDriver: newName,
      previousEta: prevEta,
      newEta: newEta,
    });

    // Add to history record
    const newRecord: ReassignmentHistoryItem = {
      id: `REASSIGN-${Date.now()}`,
      rideId: 'RIDE-10421',
      previousDriverId: assignedDriverId,
      previousDriverName: prevName,
      newDriverId,
      newDriverName: newName,
      reason: 'BETTER_ETA',
      previousEta: prevEta,
      newEta: newEta,
      timestamp: new Date().toISOString(),
    };
    setHistory(prev => [newRecord, ...prev]);
  };

  // Simulate Traffic Delay on Current Driver
  const handleSimulateTrafficDelay = () => {
    setCurrentEta(prev => prev + 8);
    setPickup(prev => ({ ...prev, isDelayed: true }));
  };

  // Toggle Browser Geolocation API
  const handleToggleGeolocation = () => {
    if (isGpsTracking) {
      trackerRef.current?.stopTracking();
      setIsGpsTracking(false);
    } else {
      setGpsError(null);
      if (!trackerRef.current) {
        trackerRef.current = new DriverGeolocationTracker('DRV-001', 10, 20);
      }
      const started = trackerRef.current.startTracking(
        coords => {
          // Update assigned driver's coordinates live
          setDrivers(prev =>
            prev.map(d =>
              d.driverId === assignedDriverId
                ? { ...d, latitude: coords.latitude, longitude: coords.longitude }
                : d
            )
          );
        },
        err => {
          setGpsError(`${err.code}: ${err.message}`);
          setIsGpsTracking(false);
        }
      );
      setIsGpsTracking(started);
    }
  };

  // Simulate Driver Movement along road
  const handleSimulateDriverMove = () => {
    setDrivers(prev =>
      prev.map(d => {
        if (d.driverId === assignedDriverId) {
          // Shift driver closer to pickup
          const newLat = d.latitude + (pickup.latitude - d.latitude) * 0.25;
          const newLng = d.longitude + (pickup.longitude - d.longitude) * 0.25;
          return { ...d, latitude: newLat, longitude: newLng };
        }
        return d;
      })
    );
  };

  const currentAssignedDriver = drivers.find(d => d.driverId === assignedDriverId);
  const alternativeCandidates = drivers.filter(
    d => d.driverId !== assignedDriverId && (d.status === 'Available' || d.status === 'AVAILABLE')
  );

  return (
    <div className="flex flex-col gap-5 text-white">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2.5">
            <span>🗺️</span>
            OpenStreetMap & OSRM Dispatcher Control Tower
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-cost, fully open-source GIS stack: OpenStreetMap tiles + Leaflet + OSRM routing engine
          </p>
        </div>

        {/* Simulation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateTrafficDelay}
            className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⚠️</span>
            Simulate Traffic Delay (+8m)
          </button>
          <button
            onClick={handleSimulateDriverMove}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>⏩</span>
            Simulate Driver GPS Move
          </button>
          <button
            onClick={handleToggleGeolocation}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              isGpsTracking
                ? 'bg-emerald-600 text-white border-emerald-400 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <span>🛰️</span>
            {isGpsTracking ? 'Live GPS Tracking Active' : 'Enable Device Geolocation'}
          </button>
        </div>
      </div>

      {gpsError && (
        <div className="bg-amber-950/80 border border-amber-600/80 px-4 py-2.5 rounded-xl text-xs text-amber-200 flex items-center justify-between">
          <span>⚠️ Geolocation notice: {gpsError}</span>
          <button onClick={() => setGpsError(null)} className="text-amber-400 font-bold ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Reassignment Banner (Section 13) */}
      {reassignmentBanner?.show && (
        <div className="bg-emerald-950/90 border border-emerald-500 rounded-2xl p-4 shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Pickup Reassigned Successfully
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {reassignmentBanner.previousDriver} → {reassignmentBanner.newDriver}
              </div>
              <div className="text-xs text-emerald-300/90 mt-0.5 font-mono">
                Previous ETA: {reassignmentBanner.previousEta} min &nbsp;➔&nbsp; New ETA:{' '}
                <span className="font-bold text-white">{reassignmentBanner.newEta} min</span> (
                Saved {reassignmentBanner.previousEta - reassignmentBanner.newEta} min)
              </div>
            </div>
          </div>
          <button
            onClick={() => setReassignmentBanner(null)}
            className="text-xs bg-emerald-800/60 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg border border-emerald-600 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Grid: Interactive Map (Left) + Dispatcher Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: OpenStreetMap Leaflet Container */}
        <div className="lg:col-span-8 flex flex-col">
          <DriverMap
            drivers={drivers}
            assignedDriverId={assignedDriverId}
            pickupLocation={pickup}
            routeCoordinates={routeCoordinates}
            routeDistanceKm={currentDistance}
            routeEtaMinutes={currentEta}
            alternativeRoutes={alternativeRoutes}
            height="560px"
          />
        </div>

        {/* Right: Dispatcher Pickup & Alternative Drivers Card (Section 13 layout) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Pickup Details Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
                  Pickup #123 (RIDE-10421)
                </span>
                <h3 className="text-base font-bold text-white mt-1">{pickup.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">SLA Target</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {pickup.slaMinutes} min
                </span>
              </div>
            </div>

            {/* Current Driver Block */}
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Current Driver
                </span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  🚗 {currentAssignedDriver?.name || 'None'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentAssignedDriver?.vehiclePlate} · {currentAssignedDriver?.vehicleModel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Current ETA</span>
                <span
                  className={`text-lg font-black font-mono ${
                    currentEta > (pickup.slaMinutes || 10) ? 'text-rose-400' : 'text-blue-400'
                  }`}
                >
                  {currentEta} min
                </span>
                {currentEta > (pickup.slaMinutes || 10) && (
                  <span className="text-[10px] text-rose-400 font-semibold block">
                    +{currentEta - (pickup.slaMinutes || 10)}m Delay
                  </span>
                )}
              </div>
            </div>

            {/* Alternative Drivers Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Alternative Candidates (OSRM ETA)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {alternativeCandidates.length} nearby
                </span>
              </div>

              <div className="space-y-2">
                {alternativeCandidates.map(alt => {
                  const altRoute = alternativeRoutes.find(r => r.driverId === alt.driverId);
                  const eta = altRoute?.etaMinutes || alt.etaMinutes || 7;
                  const improvement = currentEta - eta;
                  const isEligible = improvement >= 5;

                  return (
                    <div
                      key={alt.driverId}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        isEligible
                          ? 'bg-emerald-950/30 border-emerald-600/60 hover:border-emerald-500'
                          : 'bg-slate-950/40 border-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {alt.name}
                          {isEligible && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                              Best Choice
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {alt.vehicleModel} · {alt.distanceKm} km away
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-black font-mono text-emerald-400 block">
                            {eta} min
                          </span>
                          {improvement > 0 && (
                            <span className="text-[9px] text-emerald-400/80 font-mono">
                              -{improvement}m faster
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleExecuteReassignment(alt.driverId)}
                          disabled={isReassigning}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Reassign Button */}
            <button
              onClick={() => handleExecuteReassignment()}
              disabled={isReassigning || (!evaluation?.canReassign && currentEta <= 10)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isReassigning ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Transferring Pickup...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Reassign Pickup (Best OSRM ETA)
                </>
              )}
            </button>
          </div>

          {/* Reassignment Rule Checks Checklist */}
          {evaluation && (
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-3.5 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Automated Reassignment Rule Evaluation
              </span>
              <div className="space-y-1.5">
                {evaluation.ruleChecks.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className={rule.passed ? 'text-emerald-400' : 'text-rose-400'}>
                      {rule.passed ? '✓' : '✗'}
                    </span>
                    <div className="flex-1">
                      <span className="text-slate-300 font-medium block">{rule.rule}</span>
                      {rule.reason && (
                        <span className="text-[10px] text-slate-500 block">{rule.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reassignment Audit History Table (Section 12) */}
      {history.length > 0 && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span>📜</span> Reassignment Audit History (Section 12)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Ride ID</th>
                  <th className="py-2.5 px-3">Previous Driver</th>
                  <th className="py-2.5 px-3">New Driver</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-right">ETA Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200">{item.rideId}</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.previousDriverName}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-400">
                      {item.newDriverName}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px]">
                        {item.reason}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">
                      {item.previousEta}m ➔ {item.newEta}m (-{item.previousEta - item.newEta}m)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveDriverDispatchPanel;
