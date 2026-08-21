import React from "react";
import { metricsData } from "../../data/dashboardData";

const DashboardMetrics = ({ metrics = metricsData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-br ${metric.cardGradient} border ${metric.borderColor} shadow-2xs`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
              {metric.label}
            </span>
            <div className={`w-9 h-9 rounded-xl ${metric.iconBg} flex items-center justify-center`}>
              {metric.icon}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {metric.value}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${metric.badgeBg}`}>
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardMetrics;
