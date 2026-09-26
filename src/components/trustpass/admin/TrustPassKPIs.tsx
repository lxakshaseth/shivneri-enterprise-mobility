import React from 'react';

interface TrustPassKPIsProps {
  onFilterStatus?: (status: string) => void;
}

export function TrustPassKPIs({ onFilterStatus }: TrustPassKPIsProps) {
  const cards = [
    {
      title: "Today's Rides",
      value: "1,284",
      delta: "+14.2%",
      deltaLabel: "vs yesterday",
      icon: "🚗",
      accent: "#0f172a",
      sub: "Total scheduled today",
      filter: "ALL",
    },
    {
      title: "Verified",
      value: "1,249",
      delta: "97.2%",
      deltaLabel: "compliance",
      icon: "🟢",
      accent: "#16a34a",
      sub: "Boarding authorized",
      filter: "VERIFIED",
    },
    {
      title: "Pending",
      value: "21",
      delta: "In progress",
      deltaLabel: "active now",
      icon: "🟠",
      accent: "#d97706",
      sub: "Awaiting handshake",
      filter: "PENDING",
      isLive: true,
    },
    {
      title: "Failed",
      value: "11",
      delta: "-2 vs yesterday",
      deltaLabel: "drop",
      icon: "🔴",
      accent: "#dc2626",
      sub: "Blocked or rejected",
      filter: "FAILED",
      isAlert: true,
    },
    {
      title: "Manual Override",
      value: "3",
      delta: "0.23%",
      deltaLabel: "override rate",
      icon: "🛡",
      accent: "#7c3aed",
      sub: "Admin sanctioned",
      filter: "OVERRIDDEN",
    },
    {
      title: "Average Verification",
      value: "8 sec",
      delta: "-1.4s",
      deltaLabel: "faster",
      icon: "⚡",
      accent: "#0284c7",
      sub: "Handshake latency",
    },
    {
      title: "Success Rate",
      value: "97.2%",
      delta: "+0.8%",
      deltaLabel: "this month",
      icon: "📈",
      accent: "#059669",
      sub: "First-attempt pass",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          onClick={() => c.filter && onFilterStatus?.(c.filter)}
          className={`bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300 ${
            c.filter ? 'cursor-pointer hover:scale-[1.01]' : ''
          } ${c.isAlert ? 'border-red-200 bg-red-50/20' : ''}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {c.title}
            </span>
            <span className="text-base">{c.icon}</span>
          </div>

          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono" style={{ color: c.accent }}>
              {c.value}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
              {c.sub}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
            <span className="font-semibold text-slate-700">{c.delta}</span>
            <span className="text-slate-400">{c.deltaLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
