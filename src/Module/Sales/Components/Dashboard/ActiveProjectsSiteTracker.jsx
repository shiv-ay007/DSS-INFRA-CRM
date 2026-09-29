import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FaHardHat,
  FaBuilding,
  FaUserTie,
  FaMapMarkerAlt,
  FaTools,
  FaTasks,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const ActiveProjectsSiteTracker = ({ activeProjects = [], wbsStagesCount = 25 }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const displayProjects = useMemo(() => {
    if (!Array.isArray(activeProjects)) return [];

    return activeProjects.map((p, idx) => {
      const rawId = String(p.id || p._id || "");
      // Clean short code (e.g. PRJ-2A9B) instead of long 24-char raw MongoDB hex hash
      const cleanCode = p.projectCode || p.leadId || (rawId && !rawId.match(/^[0-9a-fA-F]{24}$/) ? rawId : `PRJ-${rawId.slice(-4).toUpperCase() || (101 + idx)}`);

      const stages = Array.isArray(p.stages) ? p.stages : [];
      const totalStages = stages.length || wbsStagesCount || 25;
      
      const completedStages = stages.filter(
        (s) => s.status === "Completed" || (s.progress && Number(s.progress) >= 100)
      ).length;

      const currentActiveStage = stages.find(
        (s) => s.status === "In Progress" || (s.progress && Number(s.progress) > 0 && Number(s.progress) < 100)
      ) || stages[completedStages] || {
        stage_code: `S${Math.min(completedStages + 1, totalStages)}`,
        stage_name: "Active Site Work"
      };

      let progress = Number(p.progress || p.overallProgress || 0);
      if (!progress && totalStages > 0) {
        progress = Math.round((completedStages / totalStages) * 100);
      }

      let statusLabel = "On Track";
      let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
      let dotColor = "bg-emerald-500";
      if (progress >= 100) {
        statusLabel = "Completed";
        statusColor = "bg-blue-50 text-blue-700 border-blue-200";
        dotColor = "bg-blue-500";
      } else if (p.isDelayed) {
        statusLabel = "Delayed";
        statusColor = "bg-rose-50 text-rose-700 border-rose-200";
        dotColor = "bg-rose-500";
      }

      return {
        id: p.id || p._id || cleanCode,
        cleanCode,
        name: p.projectName || p.name || `Site Project #${idx + 1}`,
        clientName: p.clientName || "Client",
        city: p.city || p.location || p.address || "Main Site Location",
        progress,
        currentStageCode: currentActiveStage.stage_code || `S${idx + 1}`,
        currentStageName: currentActiveStage.stage_name || "Structural Execution",
        totalStages,
        completedStages,
        statusLabel,
        statusColor,
        dotColor
      };
    });
  }, [activeProjects, wbsStagesCount]);

  return (
    <div className="w-full h-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between">
      {/* Clean Minimal Header with Slider Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/90 flex items-center justify-center text-sm shadow-2xs">
            <FaHardHat className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Active Construction Sites
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-xs font-mono font-bold border border-orange-200">
                {displayProjects.length} Running
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Live milestones and execution progress across {wbsStagesCount || 25} WBS construction stages
            </p>
          </div>
        </div>

        {/* Right Actions: Slider Controls & All Sites Link */}
        <div className="flex items-center gap-2">
          {displayProjects.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-6 h-6 rounded-md bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center text-[10px] shadow-2xs transition-all cursor-pointer"
                title="Previous Sites"
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-6 h-6 rounded-md bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center text-[10px] shadow-2xs transition-all cursor-pointer"
                title="Next Sites"
              >
                <FaChevronRight />
              </button>
            </div>
          )}

          <Link
            to="/sales/active-projects"
            className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5 ml-1"
          >
            <span>All Sites</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Projects Slider Container (Shifted Up, No Add Box) */}
      <div className="pt-0.5">
        {displayProjects.length === 0 ? (
          <div className="py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-xl bg-orange-100/70 text-orange-600 flex items-center justify-center text-base mb-2">
              <FaHardHat />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              No Active Construction Sites Launched Yet
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3 max-w-sm">
              Convert your leads to start on-ground site execution tracking across 23 WBS construction stages.
            </p>
            <Link
              to="/sales/active-projects/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <span>Launch Site</span>
              <FaArrowRight className="text-[9px]" />
            </Link>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex items-stretch gap-4 overflow-x-auto pb-1 scroll-smooth snap-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayProjects.map((p) => (
              <div
                key={p.id}
                className={`group p-4 rounded-xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/30 to-white hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between snap-start shrink-0 ${
                  displayProjects.length === 1 ? "w-full" : "min-w-[320px] sm:min-w-[360px] md:min-w-[380px] max-w-[420px] flex-1"
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Title, ID & Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                        <FaBuilding className="text-sm" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 capitalize truncate" title={p.name}>
                          {p.name}
                        </h4>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border shrink-0 ${p.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.dotColor} animate-pulse`} />
                      <span>{p.statusLabel}</span>
                    </span>
                  </div>

                  {/* Client & City with React Icons */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-2.5 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FaUserTie className="text-slate-400 text-xs shrink-0" />
                      <span className="font-semibold text-slate-800 truncate" title={p.clientName}>
                        {p.clientName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FaMapMarkerAlt className="text-rose-400 text-xs shrink-0" />
                      <span className="text-slate-600 truncate" title={p.city}>
                        {p.city}
                      </span>
                    </div>
                  </div>

                  {/* Current Stage Indicator */}
                  <div className="mb-2.5 p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-orange-500 text-white font-mono font-black text-[9px] flex items-center justify-center shrink-0">
                        {p.currentStageCode}
                      </span>
                      <div className="min-w-0">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Current Stage
                        </span>
                        <span className="font-bold text-slate-800 truncate block text-[11px]" title={p.currentStageName}>
                          {p.currentStageName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-md shrink-0 ml-1">
                      {p.completedStages}/{p.totalStages} Stages
                    </span>
                  </div>

                  {/* Site Progress Bar */}
                  <div className="space-y-1 mb-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <FaTasks className="text-slate-400 text-[10px]" />
                        <span>Site Completion</span>
                      </span>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {p.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                        style={{ width: `${Math.max(4, Math.min(100, p.progress))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Link */}
                <Link
                  to={`/sales/active-projects/${p.id}`}
                  className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <FaTools className="text-orange-500 text-[10px]" />
                    <span>Open Site Execution</span>
                  </span>
                  <FaArrowRight className="text-[9px] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsSiteTracker;
