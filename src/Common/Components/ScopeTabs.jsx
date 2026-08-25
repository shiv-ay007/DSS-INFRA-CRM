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
    <div className="flex flex-wrap items-center justify-center w-full my-2.5 gap-3">
      {/* 1. Scope Tabs Bar */}
      <div className="inline-flex items-center p-1 bg-[#f0fdf4] border border-emerald-200/90 rounded-2xl gap-1.5 shadow-2xs">
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

      {/* 2. SIDE-BY-SIDE FILTER BY EXECUTIVE DROPDOWN (Matching Screenshot Exactly) */}
      {isTeam && (
        <div className="inline-flex items-center animate-in fade-in slide-in-from-left-2 duration-200">
          <select
            value={selectedExecutive}
            onChange={(e) => onExecutiveChange && onExecutiveChange(e.target.value)}
            className="px-4 py-2 rounded-2xl border-2 border-[#00b050] text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/30 cursor-pointer shadow-2xs transition-all min-w-[200px] sm:min-w-[220px]"
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
