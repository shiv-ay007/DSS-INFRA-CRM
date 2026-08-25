import React from "react";
import { FaUserPlus, FaUsers } from "react-icons/fa";

const defaultExecutivesList = [
  "ALL",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta"
];

const ScopeTabs = ({
  activeTab = "ALL",
  onTabChange,
  selectedExecutive = "ALL",
  onExecutiveChange,
  executives = defaultExecutivesList,
  allLabel = "All",
  selfLabel = "Self",
  teamLabel = "Team"
}) => {
  const normalizedTab = (activeTab || "").toUpperCase();
  const isTeam = normalizedTab === "TEAM";

  return (
    <div className="flex flex-col items-center justify-center w-full my-2.5 gap-3">
      {/* 1. Scope Tabs Bar */}
      <div className="inline-flex items-center p-1.5 bg-[#f0fdf4] border border-emerald-200/90 rounded-2xl gap-2 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            onTabChange(activeTab === "all" ? "all" : "ALL");
            if (onExecutiveChange) onExecutiveChange("ALL");
          }}
          className={`px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            normalizedTab === "ALL"
              ? "bg-[#00b050] text-white shadow-md"
              : "text-[#00b050] hover:bg-emerald-100/70"
          }`}
        >
          {allLabel}
        </button>

        <button
          type="button"
          onClick={() => {
            onTabChange(activeTab === "self" ? "self" : "SELF");
            if (onExecutiveChange) onExecutiveChange("ALL");
          }}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            normalizedTab === "SELF"
              ? "bg-[#00b050] text-white shadow-md"
              : "text-[#00b050] hover:bg-emerald-100/70"
          }`}
        >
          <FaUserPlus className="w-3.5 h-3.5" />
          <span>{selfLabel}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onTabChange(activeTab === "team" ? "team" : "TEAM");
          }}
          className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            isTeam
              ? "bg-[#00b050] text-white shadow-md"
              : "text-[#00b050] hover:bg-emerald-100/70"
          }`}
        >
          <FaUsers className="w-3.5 h-3.5" />
          <span>{teamLabel}</span>
        </button>
      </div>

      {/* 2. FILTER BY EXECUTIVE DROPDOWN CARD (Matching Reference Design) */}
      {isTeam && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-md w-72 sm:w-80 text-center animate-in fade-in slide-in-from-top-2 duration-200">
          <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-mono mb-2">
            FILTER BY EXECUTIVE
          </label>
          <select
            value={selectedExecutive}
            onChange={(e) => onExecutiveChange && onExecutiveChange(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border-2 border-emerald-500 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 cursor-pointer shadow-2xs transition-all"
          >
            <option value="ALL">All Executives</option>
            {executives
              .filter((e) => e !== "ALL" && e !== "All")
              .map((exec) => (
                <option key={exec} value={exec}>
                  {exec}
                </option>
              ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ScopeTabs;
