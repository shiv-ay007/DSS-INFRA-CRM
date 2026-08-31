import React from "react";
import { statusBreakdownData } from "../../data/dashboardData";

const LeadStatusBreakdown = ({ statusBreakdown = statusBreakdownData, totalLeads = 250, conversionRate = "18.4%" }) => {
  const hotItem = statusBreakdown.find((i) => i.label.toLowerCase().includes("hot")) || { percentage: 18 };
  const warmItem = statusBreakdown.find((i) => i.label.toLowerCase().includes("warm")) || { percentage: 32 };
  const coldItem = statusBreakdown.find((i) => i.label.toLowerCase().includes("cold")) || { percentage: 40 };
  const newItem = statusBreakdown.find((i) => i.label.toLowerCase().includes("new")) || { percentage: 10 };

  const hotPct = Number(hotItem.percentage) || 0;
  const warmPct = Number(warmItem.percentage) || 0;
  const coldPct = Number(coldItem.percentage) || 0;
  const newPct = Number(newItem.percentage) || 0;

  const hotOffset = 0;
  const warmOffset = -hotPct;
  const coldOffset = -(hotPct + warmPct);
  const newOffset = -(hotPct + warmPct + coldPct);

  return (
    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Lead Status Distribution
          </h2>
          <span className="text-xs font-mono font-bold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
            Total: {totalLeads}
          </span>
        </div>

        {/* SVG Donut Chart with vibrant colors */}
        <div className="flex items-center justify-center py-2">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 filter drop-shadow-xs" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Hot */}
              <path
                stroke="#f43f5e"
                strokeWidth="4.5"
                strokeDasharray={`${hotPct}, 100`}
                strokeDashoffset={`${hotOffset}`}
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Warm */}
              <path
                stroke="#f59e0b"
                strokeWidth="4.5"
                strokeDasharray={`${warmPct}, 100`}
                strokeDashoffset={`${warmOffset}`}
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Cold */}
              <path
                stroke="#0ea5e9"
                strokeWidth="4.5"
                strokeDasharray={`${coldPct}, 100`}
                strokeDashoffset={`${coldOffset}`}
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* New */}
              <path
                stroke="#10b981"
                strokeWidth="4.5"
                strokeDasharray={`${newPct}, 100`}
                strokeDashoffset={`${newOffset}`}
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {totalLeads}
              </span>
              <span className="text-[10px] font-mono text-slate-500 font-bold uppercase mt-0.5 tracking-wider">
                Total Leads
              </span>
            </div>
          </div>
        </div>

        {/* Percentage Breakdown Legend */}
        <div className="mt-3 space-y-2">
          {statusBreakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor} shadow-2xs`} />
                <span className="font-bold text-slate-800">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-mono font-medium text-xs">{item.count} leads</span>
                <span className={`px-1.5 py-0.5 rounded font-mono font-extrabold text-[11px] border ${item.badgeColor}`}>
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Overall Conversion Rate:</span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
          ⚡ {conversionRate}
        </span>
      </div>
    </div>
  );
};

export default LeadStatusBreakdown;
