import React, { useState } from 'react';
import { TrustPassKPIs } from './TrustPassKPIs';
import { LiveVerificationFeed } from './LiveVerificationFeed';
import { TrustPassAuditModal } from './TrustPassAuditModal';
import { VerificationReceiptModal } from './VerificationReceiptModal';
import { FailedVerificationCenter } from './FailedVerificationCenter';
import { SecurityAlertsCenter } from './SecurityAlertsCenter';
import { ManualOverrideQueue } from './ManualOverrideQueue';
import { VerificationPolicyManager } from './VerificationPolicyManager';
import { TrustPassAnalyticsView } from './TrustPassAnalyticsView';
import { TrustPassAuditLogView } from './TrustPassAuditLogView';
import { SafeDropAuditCenter } from './SafeDropAuditCenter';
import { SecurityArchitectureFlow } from './SecurityArchitectureFlow';
import { VerificationFeedItem } from '../types';

export type ControlTowerTab =
  | 'overview'
  | 'feed-audit'
  | 'failed-center'
  | 'security-alerts'
  | 'manual-overrides'
  | 'policies'
  | 'analytics'
  | 'safe-drop'
  | 'architecture';

export function TrustPassControlTower() {
  const [activeTab, setActiveTab] = useState<ControlTowerTab>('overview');
  const [selectedVerification, setSelectedVerification] = useState<VerificationFeedItem | null>(null);
  const [receiptItem, setReceiptItem] = useState<VerificationFeedItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const handleInspectAudit = (item: VerificationFeedItem) => {
    setSelectedVerification(item);
  };

  const handleViewReceipt = (item: VerificationFeedItem) => {
    setReceiptItem(item);
  };

  const handleKpiFilter = (filter: string) => {
    setStatusFilter(filter);
    setActiveTab('overview');
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 overflow-y-auto">
      
      {/* Top Navigation & Subheader */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm">
              🛡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight font-sans">
                  TRUSTPASS CONTROL TOWER
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  Operations & Security
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Zero-Trust
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Verify the right employee, right driver, right vehicle, and right ride before boarding.
              </p>
            </div>
          </div>

          {/* Quick Simulation & Live Status */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-600">
              <span className="text-slate-400">HSM Node:</span>
              <strong className="text-slate-800">bom-az-1</strong>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">Latency:</span>
              <strong className="text-emerald-600 font-bold">8ms</strong>
            </div>
          </div>

        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 overflow-x-auto pt-4 mt-1 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'overview', label: 'Dashboard & Feed', icon: '▦' },
            { id: 'feed-audit', label: 'Audit Log (17 Events)', icon: '📜' },
            { id: 'failed-center', label: 'Failed Verification Center', icon: '🔴', count: '11' },
            { id: 'security-alerts', label: 'Security Alerts', icon: '⚠', count: '5', isAlert: true },
            { id: 'manual-overrides', label: 'Manual Overrides', icon: '🛡', count: '3' },
            { id: 'policies', label: 'Verification Policies', icon: '⚖' },
            { id: 'analytics', label: 'Analytics (Methods & Fleet)', icon: '📊' },
            { id: 'safe-drop', label: 'Safe-Drop Audits', icon: '📍' },
            { id: 'architecture', label: 'Architecture & Privacy', icon: '🔐' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as ControlTowerTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === t.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {t.count && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === t.id
                      ? 'bg-white/20 text-white'
                      : t.isAlert
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* TAB 1: OVERVIEW & DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* 7 KPI Cards */}
            <TrustPassKPIs onFilterStatus={handleKpiFilter} />

            {/* Live Verification Feed with 9 filters */}
            <LiveVerificationFeed
              statusFilter={statusFilter}
              onSelectVerification={handleInspectAudit}
            />
          </div>
        )}

        {/* TAB 2: AUDIT LOG */}
        {activeTab === 'feed-audit' && (
          <div className="animate-in fade-in duration-150">
            <TrustPassAuditLogView />
          </div>
        )}

        {/* TAB 3: FAILED VERIFICATION CENTER */}
        {activeTab === 'failed-center' && (
          <div className="animate-in fade-in duration-150">
            <FailedVerificationCenter />
          </div>
        )}

        {/* TAB 4: SECURITY ALERTS */}
        {activeTab === 'security-alerts' && (
          <div className="animate-in fade-in duration-150">
            <SecurityAlertsCenter />
          </div>
        )}

        {/* TAB 5: MANUAL OVERRIDES */}
        {activeTab === 'manual-overrides' && (
          <div className="animate-in fade-in duration-150">
            <ManualOverrideQueue />
          </div>
        )}

        {/* TAB 6: POLICIES */}
        {activeTab === 'policies' && (
          <div className="animate-in fade-in duration-150">
            <VerificationPolicyManager />
          </div>
        )}

        {/* TAB 7: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-150">
            <TrustPassAnalyticsView />
          </div>
        )}

        {/* TAB 8: SAFE DROP */}
        {activeTab === 'safe-drop' && (
          <div className="animate-in fade-in duration-150">
            <SafeDropAuditCenter />
          </div>
        )}

        {/* TAB 9: ARCHITECTURE & PRIVACY */}
        {activeTab === 'architecture' && (
          <div className="animate-in fade-in duration-150">
            <SecurityArchitectureFlow />
          </div>
        )}

      </div>

      {/* Verification Audit Modal */}
      {selectedVerification && (
        <TrustPassAuditModal
          item={selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onViewReceipt={handleViewReceipt}
        />
      )}

      {/* Verification Receipt Modal */}
      {receiptItem && (
        <VerificationReceiptModal
          item={receiptItem}
          onClose={() => setReceiptItem(null)}
          onViewAudit={handleInspectAudit}
        />
      )}

    </div>
  );
}
