import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { FaBullhorn } from "react-icons/fa";

// Vibrant Palette for Lead Sources
const SOURCE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#64748b"  // Slate
];

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.color }} />
          <span className="font-bold text-slate-200">{data.name}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-300">
          <span>Total Leads:</span>
          <span className="font-mono font-bold text-white">{data.value}</span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-400 text-[11px]">
          <span>Share:</span>
          <span className="font-mono font-bold text-emerald-400">{data.payload.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

const LeadSourceDistributionChart = ({ leads = [] }) => {
  const { chartData, totalWithSource } = useMemo(() => {
    const sourceCountMap = {};

    leads.forEach((l) => {
      let src = l.leadMode || l.leadSource || l.source || "Direct Call";
      // Normalize common names
      src = String(src).trim();
      if (!src || src.toLowerCase() === "undefined") {
        src = "Direct Call";
      }
      sourceCountMap[src] = (sourceCountMap[src] || 0) + 1;
    });

    const entries = Object.entries(sourceCountMap);
    const total = leads.length || 1;

    // Sort by count descending
    entries.sort((a, b) => b[1] - a[1]);

    const formatted = entries.slice(0, 6).map(([name, count], index) => ({
      name,
      value: count,
      percentage: Math.round((count / total) * 100),
      color: SOURCE_COLORS[index % SOURCE_COLORS.length]
    }));

    // If there are more beyond top 5, combine into "Other Sources"
    if (entries.length > 6) {
      const restCount = entries.slice(6).reduce((acc, curr) => acc + curr[1], 0);
      formatted.push({
        name: "Other Sources",
        value: restCount,
        percentage: Math.round((restCount / total) * 100),
        color: SOURCE_COLORS[6]
      });
    }

    return {
      chartData: formatted.length > 0 ? formatted : [
        { name: "Direct Call", value: 1, percentage: 100, color: "#3b82f6" }
      ],
      totalWithSource: leads.length
    };
  }, [leads]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <FaBullhorn />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Lead Acquisition Channels
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Distribution of marketing and inquiry sources
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            {totalWithSource} Leads
          </span>
        </div>

        {/* Donut Chart */}
        <div className="h-44 sm:h-48 relative flex items-center justify-center my-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">Channels</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">{chartData.length}</span>
          </div>
        </div>

        {/* Legend Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100/90 text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-slate-800 truncate" title={item.name}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className="font-mono text-slate-500 font-semibold text-[11px]">{item.value}</span>
                <span className="font-mono font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Top Inflow Channel:</span>
        <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          🏆 {chartData[0]?.name || "Direct Call"} ({chartData[0]?.percentage || 0}%)
        </span>
      </div>
    </div>
  );
};

export default LeadSourceDistributionChart;
