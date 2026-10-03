import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import { FaClock, FaExclamationTriangle, FaProjectDiagram, FaHourglassHalf, FaCheckCircle } from "react-icons/fa";

const STAGE_COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#14b8a6"
];

const PresaleSnapshotSection = ({ presaleData = {} }) => {
  const {
    subStageCounts = {},
    stagnantCount = 0,
    stagnantList = [],
    funnelChart = []
  } = presaleData;

  const totalPresaleRecords = Object.values(subStageCounts).reduce((a, b) => a + Number(b || 0), 0);
  const stageEntries = Object.entries(subStageCounts);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 shadow-2xs">
            <FaProjectDiagram className="text-base" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              2. Presale Snapshot
            </h2>
            <p className="text-xs text-slate-500">
              Module 2 Overview • Sub-stage pipeline conversion &amp; ageing bottleneck tracking
            </p>
          </div>
        </div>

        {/* Ageing Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs sm:text-sm font-bold shadow-2xs">
            <FaExclamationTriangle className="text-amber-600 text-xs" />
            <span>Stagnant Alert: <strong className="font-mono text-amber-950">{stagnantCount} Leads (&gt;3 Days)</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row - Clean Minimal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
        {/* Total Presale Pipeline */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Total Presale Pipeline
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaProjectDiagram className="text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {totalPresaleRecords}
            </span>
            <span className="text-xs font-semibold text-slate-400">Prospects</span>
          </div>
        </div>

        {/* Bottlenecks (>3 Days) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-amber-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Bottlenecks (&gt;3 Days)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaHourglassHalf className="text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 font-mono tracking-tight">
              {stagnantCount}
            </span>
            <span className="text-xs font-semibold text-amber-600">Stalled Stages</span>
          </div>
        </div>

        {/* Pipeline Sub-Stages */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-teal-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Pipeline Sub-Stages
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaCheckCircle className="text-xs" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700 font-mono tracking-tight">
              {stageEntries.length}
            </span>
            <span className="text-xs font-semibold text-teal-600">Workflow Phases</span>
          </div>
        </div>
      </div>

      {/* Sub-Stage Quick Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mb-6">
        {stageEntries.map(([stageName, count]) => (
          <div
            key={stageName}
            className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 text-center hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight block truncate mb-1">
              {stageName}
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Row: Stage Bar Chart (7 cols) + Ageing / Delayed List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Stage Bar Chart */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaProjectDiagram className="text-purple-500 text-sm" />
              Sub-Stage Record Distribution
            </span>
            <span className="text-xs text-slate-500 font-medium">Records per stage</span>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChart} margin={{ top: 10, right: 10, left: -25, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 10.5, fill: "#64748b" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val} Records`, "Count"]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={36}>
                  {funnelChart.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={STAGE_COLORS[idx % STAGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ageing / Stuck Leads Alert Box */}
        <div className="lg:col-span-5 bg-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200/80">
              <span className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <FaClock className="text-amber-600 text-sm" />
                Leads Stagnant in Stage (&gt;3 Days)
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Action Needed
              </span>
            </div>

            {stagnantList && stagnantList.length > 0 ? (
              <div className="space-y-2 mt-1">
                {stagnantList.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-amber-200/70 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">{item.clientName}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Stage: <strong className="text-purple-700">{item.stageName}</strong> • Coord: {item.activePerson}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-mono text-xs font-bold whitespace-nowrap shrink-0">
                      {item.daysPending}d delay
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <span className="text-sm font-bold text-emerald-600">No Stage Bottlenecks!</span>
                <span className="text-xs text-slate-500 mt-1">All presale projects are moving on schedule.</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-3 text-right">
            Threshold: Stage unchanged for more than 72 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default PresaleSnapshotSection;
