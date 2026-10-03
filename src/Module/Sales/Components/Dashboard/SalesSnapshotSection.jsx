import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  FaUsers,
  FaRupeeSign,
  FaFire,
  FaSun,
  FaSnowflake,
  FaTimesCircle,
  FaChartPie,
  FaChartLine
} from "react-icons/fa";

const formatINR = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1 min-w-[160px]">
        <div className="font-bold text-slate-300 border-b border-slate-700 pb-1">
          {label}
        </div>
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <span style={{ color: p.color }}>{p.name}:</span>
            <span className="font-mono font-bold">
              {p.name.includes("Revenue") ? `₹ ${p.value} L` : p.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const SalesSnapshotSection = ({ salesData = {} }) => {
  const {
    totalLeads = 0,
    hotCount = 0,
    warmCount = 0,
    coldCount = 0,
    lostCount = 0,
    newCount = 0,
    totalPipelineValue = 0,
    statusChart = [],
    monthlyTrends = []
  } = salesData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 mb-5">
      {/* Clean Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <FaUsers className="text-sm" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              1. Sales Snapshot
            </h2>
            <p className="text-[11px] text-slate-500">
              Module 1 Overview • Lead pipeline status &amp; cumulative deal volume
            </p>
          </div>
        </div>

        {/* Clean Pipeline Value Badge */}
        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Total Pipeline Value
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
            {formatINR(totalPipelineValue)}
          </span>
        </div>
      </div>

      {/* 6 Minimal, Spacious Cards Grid (No top accent line, clean layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {/* Total Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Leads</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaUsers className="text-xs" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">{totalLeads}</p>
        </div>

        {/* Hot Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-rose-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Hot</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FaFire className="text-xs" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 font-mono">{hotCount}</p>
        </div>

        {/* Warm Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-amber-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Warm</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaSun className="text-xs" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 font-mono">{warmCount}</p>
        </div>

        {/* Cold Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-sky-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Cold</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <FaSnowflake className="text-xs" />
            </div>
          </div>
          <p className="text-2xl font-black text-sky-600 font-mono">{coldCount}</p>
        </div>

        {/* New Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-emerald-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">New</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 font-mono">{newCount}</p>
        </div>

        {/* Lost Leads */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Lost</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <FaTimesCircle className="text-xs" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-600 font-mono">{lostCount}</p>
        </div>
      </div>

      {/* Charts Row: Revenue & Lead Trends (8 cols) + Status Breakdown (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Trend Graph */}
        <div className="lg:col-span-8 bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FaChartLine className="text-blue-500 text-xs" />
              6-Month Revenue &amp; Lead Growth Trend
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Area = Pipeline ₹ (Lakhs) • Bar = Leads</span>
          </div>

          <div className="h-[230px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                <Area
                  type="monotone"
                  dataKey="Pipeline Revenue (₹ Lakhs)"
                  fill="#3b82f6"
                  stroke="#2563eb"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Bar dataKey="Total Leads" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Donut Breakdown */}
        <div className="lg:col-span-4 bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FaChartPie className="text-emerald-500 text-xs" />
                Status Distribution
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{totalLeads} total</span>
            </div>
            <div className="h-[170px] w-full flex items-center justify-center">
              {statusChart && statusChart.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {statusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [`${val} Leads`, name]}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "8px",
                        border: "none",
                        color: "#fff",
                        fontSize: "11px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">No status data available</p>
              )}
            </div>
          </div>

          {/* Mini Legend */}
          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200/70">
            {statusChart.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] px-2 py-0.5 bg-white rounded border border-slate-100">
                <span className="flex items-center gap-1 text-slate-600">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-slate-800 font-mono">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesSnapshotSection;
