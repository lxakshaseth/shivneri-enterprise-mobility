// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DISPATCH LIVE OPERATIONS PANEL
// Real-Time Control Tower Dashboard, Canonical Simulation Controller & Map Hub
// ============================================================================

import React, { useState } from 'react';
import { useDispatchStore } from '../../services/dispatch/useDispatchStore';
import { ControlTowerEscalationDialog } from './ControlTowerEscalationDialog';
import { DispatchDecisionTimeline } from './DispatchDecisionTimeline';
import { DriverAssignmentCard } from './DriverAssignmentCard';
import { DriverCandidateCard } from './DriverCandidateCard';
import { DriverETAComparison } from './DriverETAComparison';
import { ManualReassignmentModal } from './ManualReassignmentModal';
import { ReassignmentDetailsDrawer } from './ReassignmentDetailsDrawer';
import { RouteComparisonMap } from './RouteComparisonMap';
import { SLAWarningBanner } from './SLAWarningBanner';
import { SmartDispatchAnalyticsModal } from './SmartDispatchAnalyticsModal';
import { SmartDispatchStatusBadge } from './SmartDispatchStatusBadge';
import { TrafficRiskCard } from './TrafficRiskCard';
import { TrustPassReverificationCard } from './TrustPassReverificationCard';

export function SmartDispatchLiveOpsPanel() {
  const {
    stops,
    currentReassignment,
    kpis,
    trafficEvents,
    triggerTrafficSpike,
    acceptReassignment,
    verifyTrustPass,
    manualOverride,
    resetToBaseline,
  } = useDispatchStore();

  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  const affectedStop = stops.find(s => s.id === 'stop-c') || stops[2];
  const activeTraffic = trafficEvents.find(t => t.isActive) || trafficEvents[0];
  const isSlaBreached = affectedStop.slaStatus === 'BREACHED' || affectedStop.slaStatus === 'CRITICAL';
  const isReassigned = currentReassignment?.status === 'REASSIGNED' || currentReassignment?.status === 'ACCEPTED';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Modals & Drawers */}
      {showDetailsDrawer && currentReassignment && (
        <ReassignmentDetailsDrawer
          reassignment={currentReassignment}
          onClose={() => setShowDetailsDrawer(false)}
          onVerifyTrustPass={() => {
            verifyTrustPass(currentReassignment.id, true);
          }}
          onManualOverride={() => {
            setShowDetailsDrawer(false);
            setShowOverrideModal(true);
          }}
        />
      )}

      {showOverrideModal && currentReassignment && (
        <ManualReassignmentModal
          reassignment={currentReassignment}
          availableDrivers={currentReassignment.candidateDrivers}
          onClose={() => setShowOverrideModal(false)}
          onConfirmOverride={(driverId, reason) => {
            manualOverride(currentReassignment.id, {
              authorizedBy: 'Akshat Gupta',
              authorizedRole: 'operations-manager',
              reason,
              newDriverId: driverId,
            });
          }}
        />
      )}

      {showEscalationModal && currentReassignment && (
        <ControlTowerEscalationDialog
          reassignment={currentReassignment}
          onClose={() => setShowEscalationModal(false)}
          onResolve={() => {
            setShowEscalationModal(false);
            setShowOverrideModal(true);
          }}
        />
      )}

      {showAnalyticsModal && (
        <SmartDispatchAnalyticsModal
          kpis={kpis}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}

      {/* TOP CONTROL BAR & SIMULATION BUTTON */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-lg border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl shadow-md">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Smart Dynamic Dispatch & Reassignment</h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded font-bold">
                ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Traffic Delay Detection, Pickup SLA Protection & TrustPass Integration
            </p>
          </div>
        </div>

        {/* Simulation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAnalyticsModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>📊</span>
            <span>Analytics KPI ({kpis.pickupsSavedFromSlaBreach} Saved)</span>
          </button>

          <button
            onClick={resetToBaseline}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            ↺ Reset
          </button>

          <button
            onClick={triggerTrafficSpike}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 hover:from-amber-400 text-white text-xs font-black shadow-lg transition-all flex items-center gap-1.5 cursor-pointer transform active:scale-95"
          >
            <span>🚨</span>
            <span>Simulate Traffic Spike (B ➔ D)</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD KPI CARDS (Part 11) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Active Rides', value: '247', icon: '🚗', color: 'text-slate-800', bg: 'bg-white' },
          { label: 'Traffic Risks', value: String(kpis.activeTrafficRisksCount), icon: '⚠️', color: 'text-amber-600', bg: 'bg-amber-50/60' },
          { label: 'SLA At Risk', value: String(kpis.slaAtRiskCount), icon: '⏱️', color: 'text-rose-600', bg: 'bg-rose-50/60' },
          { label: 'Auto Reassign', value: String(kpis.totalReassignmentsToday), icon: '⚡', color: 'text-emerald-600', bg: 'bg-emerald-50/60' },
          { label: 'Pending Acceptance', value: String(kpis.pendingAcceptancesCount), icon: '⏳', color: 'text-blue-600', bg: 'bg-blue-50/60' },
          { label: 'Failed Reassign', value: `${kpis.failedReassignmentRatePct}%`, icon: '✗', color: 'text-slate-600', bg: 'bg-white' },
          { label: 'Control Tower Escalated', value: String(kpis.controlTowerEscalationsCount), icon: '🚨', color: 'text-red-700', bg: 'bg-red-50/60' },
        ].map((card, idx) => (
          <div key={idx} className={`p-3 rounded-xl border border-slate-200/80 shadow-xs ${card.bg}`}>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              <span className="text-sm">{card.icon}</span>
            </div>
            <div className={`text-xl font-black font-mono ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* CRITICAL SLA WARNING BANNER (When delay detected) */}
      {isSlaBreached && !isReassigned && (
        <SLAWarningBanner
          stop={affectedStop}
          onAutoReassign={() => {
            if (currentReassignment) {
              acceptReassignment(currentReassignment.id, currentReassignment.selectedDriver?.driverId || 'DRV-208');
            }
          }}
          onOpenDetails={() => setShowDetailsDrawer(true)}
        />
      )}

      {/* MAP & TRAFFIC RISK GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Visual Map Layers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <RouteComparisonMap
            stops={stops}
            reassignment={currentReassignment}
            trafficEvent={activeTraffic}
          />

          {/* 14-Step Decision Progression */}
          <DispatchDecisionTimeline reassignment={currentReassignment} />
        </div>

        {/* Right Column: Traffic Alert, Assignment & Candidates (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Traffic Risk */}
          <TrafficRiskCard
            event={activeTraffic}
            onEvaluate={triggerTrafficSpike}
            onViewImpact={() => setShowDetailsDrawer(true)}
          />

          {/* Current Assignment / Reassigned Status Card */}
          {currentReassignment && (
            <DriverAssignmentCard
              reassignment={currentReassignment}
              onOpenAudit={() => setShowDetailsDrawer(true)}
              onManualOverride={() => setShowOverrideModal(true)}
            />
          )}

          {/* ETA Benchmark Comparison */}
          {currentReassignment && (
            <DriverETAComparison
              originalDriverEta={currentReassignment.predictedEtaMinutes}
              slaThresholdMinutes={currentReassignment.pickupSlaMinutes}
              candidates={currentReassignment.candidateDrivers}
              selectedDriverId={currentReassignment.selectedDriver?.driverId}
            />
          )}

          {/* Quick Driver Candidate Inspector */}
          {currentReassignment && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Eligible Nearby Drivers ({currentReassignment.candidateDrivers.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Scoped within {currentReassignment.searchRadiusKm} km radius · Tenant: TCS
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsDrawer(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View All Details →
                </button>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {currentReassignment.candidateDrivers.slice(0, 3).map(candidate => (
                  <DriverCandidateCard
                    key={candidate.driverId}
                    candidate={candidate}
                    isSelected={candidate.driverId === currentReassignment.selectedDriver?.driverId}
                    onSelect={() => setSelectedCandidateId(candidate.driverId)}
                    showExplanation={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TrustPass Re-verification interactive card */}
          {currentReassignment && isReassigned && (
            <TrustPassReverificationCard
              reassignment={currentReassignment}
              onVerificationComplete={isValid => {
                verifyTrustPass(currentReassignment.id, isValid);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
