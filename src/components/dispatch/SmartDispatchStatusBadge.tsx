// ============================================================================
// SHIVNERI ENTERPRISE MOBILITY - SMART DISPATCH STATUS BADGE
// Reusable status indicator for dispatch outcomes and SLA health
// ============================================================================

import React from 'react';
import { DecisionOutcome, ReassignmentStatus, SlaStatus } from '../../types/dispatch';

interface Props {
  type: 'sla' | 'decision' | 'status';
  value: SlaStatus | DecisionOutcome | ReassignmentStatus | string;
  size?: 'sm' | 'md';
}

export function SmartDispatchStatusBadge({ type, value, size = 'md' }: Props) {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (type === 'sla') {
    switch (value) {
      case 'NORMAL':
        return <span className={`${pad} font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1`}>🟢 Normal SLA</span>;
      case 'WARNING':
        return <span className={`${pad} font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1`}>🟡 SLA Approaching</span>;
      case 'CRITICAL':
        return <span className={`${pad} font-semibold rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1`}>🟠 SLA Critical</span>;
      case 'BREACHED':
        return <span className={`${pad} font-semibold rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 animate-pulse`}>🔴 SLA Breached</span>;
      default:
        return <span className={`${pad} rounded-full bg-slate-100 text-slate-700`}>{value}</span>;
    }
  }

  if (type === 'decision') {
    switch (value) {
      case 'KEEP_CURRENT_DRIVER':
        return <span className={`${pad} font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200`}>🛡️ Keep Current Driver</span>;
      case 'REOPTIMIZE_ROUTE':
        return <span className={`${pad} font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200`}>🔄 Reoptimize Route</span>;
      case 'REASSIGN_PICKUP':
        return <span className={`${pad} font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300`}>⚡ Reassign Pickup</span>;
      case 'ESCALATE_TO_CONTROL_TOWER':
        return <span className={`${pad} font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-300 animate-pulse`}>🚨 Escalate Control Tower</span>;
      default:
        return <span className={`${pad} rounded-full bg-slate-100 text-slate-700`}>{value}</span>;
    }
  }

  switch (value) {
    case 'OFFERED_TO_DRIVER':
      return <span className={`${pad} font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200`}>⏳ Awaiting Acceptance</span>;
    case 'ACCEPTED':
    case 'REASSIGNED':
      return <span className={`${pad} font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200`}>✓ Reassigned</span>;
    case 'DECLINED':
      return <span className={`${pad} font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200`}>✗ Declined</span>;
    case 'ESCALATED':
      return <span className={`${pad} font-bold rounded-full bg-red-100 text-red-800 border border-red-300`}>🚨 Escalated</span>;
    default:
      return <span className={`${pad} rounded-full bg-slate-100 text-slate-700`}>{value}</span>;
  }
}
