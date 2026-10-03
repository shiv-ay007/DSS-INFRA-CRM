import React, { useState } from "react";
import { FaCalendarAlt, FaFilter, FaSyncAlt } from "react-icons/fa";

const FILTER_PRESETS = [
  { id: "this_month", label: "This Month" },
  { id: "this_year", label: "This Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" }
];

const DashboardDateFilter = ({
  filterType = "this_month",
  startDate = "",
  endDate = "",
  onChange,
  onRefresh,
  isLoading = false
}) => {
  const [showCustomPicker, setShowCustomPicker] = useState(filterType === "custom");
  const [customStart, setCustomStart] = useState(startDate || "");
  const [customEnd, setCustomEnd] = useState(endDate || "");

  const handlePresetClick = (id) => {
    if (id === "custom") {
      setShowCustomPicker(true);
      onChange?.({ filterType: "custom", startDate: customStart, endDate: customEnd });
    } else {
      setShowCustomPicker(false);
      onChange?.({ filterType: id, startDate: "", endDate: "" });
    }
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onChange?.({ filterType: "custom", startDate: customStart, endDate: customEnd });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Filter Title */}
        <div className="flex items-center gap-2 text-slate-800">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80">
            <FaFilter className="text-xs" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900">
              Period Filter & Reporting Scope
            </h3>
            <p className="text-[11px] text-slate-500">
              Aggregating live numbers across Module 1 to 7
            </p>
          </div>
        </div>

        {/* Right: Presets & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/80">
            {FILTER_PRESETS.map((preset) => {
              const isActive = filterType === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetClick(preset.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-2xs shadow-emerald-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer border border-slate-200 shrink-0"
            title="Refresh All Snapshots"
          >
            <FaSyncAlt className={`text-xs ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Expandable Custom Date Range Selector */}
      {showCustomPicker && (
        <form
          onSubmit={handleApplyCustom}
          className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
              <FaCalendarAlt className="text-slate-400 text-xs" />
              From:
            </span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs shadow-emerald-600/30"
          >
            Apply Range
          </button>
        </form>
      )}
    </div>
  );
};

export default DashboardDateFilter;
