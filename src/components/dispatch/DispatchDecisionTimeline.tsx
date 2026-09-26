// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - DISPATCH DECISION TIMELINE
// 14-Step Real-Time Autonomous Dynamic Dispatch Lifecycle Progression
// ============================================================================

import React from 'react';
import { ReassignmentEvent } from '../../types/dispatch';

interface Props {
  reassignment: ReassignmentEvent | null;
}

const LIFECYCLE_STEPS = [
  { step: 1, title: 'Detect Traffic Condition', desc: 'GPS telemetry detects congestion corridor between Stop B & D' },
  { step: 2, title: 'Recalculate ETA', desc: 'Stop C arrival recalculated to 24 min (+14m delay)' },
  { step: 3, title: 'Compare Against SLA', desc: 'Breaches 10 min pickup SLA threshold' },
  { step: 4, title: 'Determine Reassignment', desc: 'Reassignment policy triggered (partial stop transfer)' },
  { step: 5, title: 'Search Eligible Drivers', desc: 'Discovered candidate drivers in 2.1 km radius' },
  { step: 6, title: 'Score Candidate Drivers', desc: 'Multi-factor weighted evaluation with detour penalties' },
  { step: 7, title: 'Select Best Driver', desc: 'Driver #DRV-208 Mohan Singh selected (Score 92/100, ETA 6m)' },
  { step: 8, title: 'Offer Reassignment', desc: 'Priority offer dispatched to Driver App' },
  { step: 9, title: 'Notify Original Driver', desc: 'Raj Kumar notified to bypass Stop C and proceed directly to D' },
  { step: 10, title: 'Notify New Driver', desc: 'Mohan Singh receives route manifest and pickup navigation' },
  { step: 11, title: 'Notify Employee', desc: 'Rohan Joshi notified with new vehicle plate and updated ETA' },
  { step: 12, title: 'Recalculate Route', desc: 'Route split executed into version 2 manifests' },
  { step: 13, title: 'Trigger TrustPass', desc: 'Dynamic QR/OTP mutual handshake initialized for boarding' },
  { step: 14, title: 'Audit Immutable Record', desc: 'Full cryptographic audit log recorded in security stream' },
];

export function DispatchDecisionTimeline({ reassignment }: Props) {
  // Determine current active step based on status
  let currentStep = 1;
  if (!reassignment) {
    currentStep = 1;
  } else if (reassignment.trustPassStatus === 'VERIFIED') {
    currentStep = 14;
  } else if (reassignment.status === 'REASSIGNED') {
    currentStep = 13;
  } else if (reassignment.status === 'ACCEPTED') {
    currentStep = 12;
  } else if (reassignment.status === 'OFFERED_TO_DRIVER') {
    currentStep = 8;
  } else {
    currentStep = 7;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            14-Step Autonomous Dynamic Dispatch Engine
          </h4>
          <p className="text-[11px] text-slate-500">
            Real-time execution trace of stop-level pickup reassignment pipeline
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
          Step {Math.min(14, currentStep)} of 14
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
        {LIFECYCLE_STEPS.map(item => {
          const isDone = item.step <= currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <div
              key={item.step}
              className={`p-2 rounded-lg flex items-start gap-2.5 transition-all ${
                isCurrent
                  ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                  : isDone
                  ? 'bg-slate-50/50'
                  : 'opacity-40'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {isDone ? '✓' : item.step}
              </div>
              <div className="min-w-0">
                <div className={`font-bold ${isCurrent ? 'text-blue-900' : 'text-slate-800'}`}>
                  {item.step}. {item.title}
                </div>
                <div className="text-[11px] text-slate-500 leading-snug truncate">
                  {item.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
