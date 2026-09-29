import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { FaChartArea, FaChartBar, FaCalendarAlt } from "react-icons/fa";

/**
 * Custom Tooltip for the Recharts graph
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 min-w-[170px]">
        <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 flex items-center justify-between">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400">Monthly Stats</span>
        </div>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-medium">{item.name}:</span>
            </span>
            <span className="font-mono font-bold text-white">
              {item.name.toLowerCase().includes("revenue")
                ? `₹ ${item.value} L`
                : `${item.value} Leads`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueAndLeadTrendsChart = ({ leads = [] }) => {
  const [chartType, setChartType] = useState("composed"); // 'composed' | 'area' | 'bar'

  // Dynamic 6-month calculation from real leads data
  const chartData = useMemo(() => {
    const months = [];
    const now = new Date();

    // Generate last 6 months list (from 5 months ago to current month)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        monthName: `${monthName} '${String(year).slice(-2)}`,
        year: year,
        monthIndex: d.getMonth(),
        leads: 0,
        revenue: 0, // in Lakhs
        hot: 0
      });
    }

    // Populate with real leads
    leads.forEach((l) => {
      const leadDate = new Date(l.createdAt || l.createdDate || Date.now());
      if (isNaN(leadDate.getTime())) return;

      const leadMonth = leadDate.getMonth();
      const leadYear = leadDate.getFullYear();

      const matchedMonth = months.find(
        (m) => m.year === leadYear && m.monthIndex === leadMonth
      );

      if (matchedMonth) {
        matchedMonth.leads += 1;
        const bizVal = Number(l.expectedBusiness || l.budget || 0);
        if (!isNaN(bizVal) && bizVal > 0) {
          // Convert to Lakhs (1 Lakh = 100,000)
          matchedMonth.revenue += bizVal / 100000;
        }
        const s = (l.leadStatus || l.status || "").toLowerCase();
        if (s === "hot") {
          matchedMonth.hot += 1;
        }
      }
    });

    // If data is very sparse in development, ensure clean rounded numbers
    return months.map((m) => ({
      name: m.monthName,
      "Total Leads": m.leads,
      "Pipeline Revenue (₹ Lakhs)": Math.round(m.revenue * 10) / 10,
      "Hot Leads": m.hot
    }));
  }, [leads]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
      {/* Header with Title and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-2 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Lead Inflow & Revenue Pipeline Trend
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time monthly lead volume vs. expected project value (in ₹ Lakhs)
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => setChartType("composed")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartType === "composed"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaChartArea className="text-emerald-600 text-xs" />
            <span>Combined</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartType === "area"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaChartArea className="text-blue-600 text-xs" />
            <span>Area</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              chartType === "bar"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaChartBar className="text-indigo-600 text-xs" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 sm:h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
          >
            <defs>
              {/* Gradient for Revenue Area */}
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Gradient for Leads Area */}
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              yAxisId="left"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#10b981"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v}L`}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10, fontSize: 12, fontWeight: 600 }}
              iconType="circle"
            />

            {/* Leads representation */}
            {(chartType === "composed" || chartType === "area") && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="Total Leads"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#leadsGrad)"
                name="Total Leads"
              />
            )}

            {chartType === "bar" && (
              <Bar
                yAxisId="left"
                dataKey="Total Leads"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                name="Total Leads"
              />
            )}

            {/* Pipeline Revenue representation */}
            {chartType === "composed" ? (
              <Bar
                yAxisId="right"
                dataKey="Pipeline Revenue (₹ Lakhs)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Pipeline Revenue (₹ Lakhs)"
              />
            ) : chartType === "area" ? (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="Pipeline Revenue (₹ Lakhs)"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                name="Pipeline Revenue (₹ Lakhs)"
              />
            ) : (
              <Bar
                yAxisId="right"
                dataKey="Pipeline Revenue (₹ Lakhs)"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
                name="Pipeline Revenue (₹ Lakhs)"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1.5 font-medium">
        <span className="flex items-center gap-1 text-slate-600">
          <FaCalendarAlt className="text-slate-400" />
          <span>Rolling 6-Month dynamic performance window</span>
        </span>
        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 self-start sm:self-auto">
          ⚡ 100% Calculated from Live Leads
        </span>
      </div>
    </div>
  );
};

export default RevenueAndLeadTrendsChart;
