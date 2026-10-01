import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaHardHat,
  FaUserTie,
  FaMapMarkerAlt,
  FaTools,
  FaArrowRight,
  FaEye
} from "react-icons/fa";
import Table from "../../../../Common/Components/Table";
import { useAuth } from "../../../../context/AuthContext";

const ActiveProjectsSiteTracker = ({
  activeProjects = [],
  wbsStagesCount = 25,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver =
    isObserver || String(currentRole).toLowerCase().trim() === "observer";

  const displayProjects = useMemo(() => {
    if (!Array.isArray(activeProjects)) return [];

    return activeProjects.map((p, idx) => {
      const rawId = String(p.id || p._id || "");
      const cleanCode =
        p.projectCode ||
        p.leadId ||
        (rawId && !rawId.match(/^[0-9a-fA-F]{24}$/)
          ? rawId
          : `PRJ-${rawId.slice(-4).toUpperCase() || 101 + idx}`);

      const stages = Array.isArray(p.stages) ? p.stages : [];
      const totalStages = stages.length || wbsStagesCount || 25;

      const completedStages = stages.filter(
        (s) => s.status === "Completed" || (s.progress && Number(s.progress) >= 100)
      ).length;

      const currentActiveStage =
        stages.find(
          (s) =>
            s.status === "In Progress" ||
            (s.progress && Number(s.progress) > 0 && Number(s.progress) < 100)
        ) ||
        stages[completedStages] || {
          stage_code: `S${Math.min(completedStages + 1, totalStages)}`,
          stage_name: "Active Site Work"
        };

      let progress = Number(p.progress || p.overallProgress || 0);
      if (!progress && totalStages > 0) {
        progress = Math.round((completedStages / totalStages) * 100);
      }

      let statusLabel = "On Track";
      let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-300";
      let dotColor = "bg-emerald-500";
      if (progress >= 100) {
        statusLabel = "Completed";
        statusColor = "bg-blue-50 text-blue-700 border-blue-300";
        dotColor = "bg-blue-500";
      } else if (p.isDelayed) {
        statusLabel = "Delayed";
        statusColor = "bg-rose-50 text-rose-700 border-rose-300";
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

  const columnConfig = useMemo(
    () => ({
      // 1. Action (Placed at front right after Sr. No)
      actions: {
        label: "Action",
        align: "center",
        headerClass: "w-24 min-w-[96px]",
        render: (_, row) => (
          <div className="flex items-center justify-center gap-1.5">
            {/* View Details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/sales/active-projects/${row.id}?mode=view`);
              }}
              title="View Site Details"
              aria-label="View Details"
              className="p-1.5 rounded-none text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer shadow-2xs"
            >
              <FaEye className="w-3.5 h-3.5" />
            </button>

            {/* Execute / Track Site Work (Hidden for Observer) */}
            {!isUserObserver && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sales/active-projects/${row.id}?mode=edit`);
                }}
                title="Open Site Execution"
                aria-label="Open Site Execution"
                className="p-1.5 rounded-none text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-300 transition-all cursor-pointer shadow-2xs"
              >
                <FaTools className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )
      },

      // 2. Project Name & Code
      project: {
        label: "Project & Code",
        align: "left",
        headerClass: "min-w-[180px]",
        render: (_, row) => (
          <div className="flex flex-col items-start gap-1 py-1 text-left">
            <span
              onClick={() => navigate(`/sales/active-projects/${row.id}?mode=view`)}
              className="font-bold text-slate-900 text-xs hover:text-orange-600 transition-colors cursor-pointer truncate max-w-[200px]"
              title={row.name}
            >
              {row.name}
            </span>
            <span className="inline-block px-1.5 py-0.5 rounded-none bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-300">
              {row.cleanCode}
            </span>
          </div>
        )
      },

      // 3. Client & Location
      client: {
        label: "Client & Location",
        align: "left",
        headerClass: "min-w-[160px]",
        render: (_, row) => (
          <div className="flex flex-col items-start gap-0.5 py-1 text-left">
            <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 truncate max-w-[170px]" title={row.clientName}>
              <FaUserTie className="w-3 h-3 text-indigo-500 shrink-0" />
              {row.clientName}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate max-w-[170px]" title={row.city}>
              <FaMapMarkerAlt className="w-2.5 h-2.5 text-rose-500 shrink-0" />
              {row.city}
            </span>
          </div>
        )
      },

      // 4. Current Stage
      currentStage: {
        label: "Current Stage",
        align: "left",
        headerClass: "min-w-[180px]",
        render: (_, row) => (
          <div className="flex items-center gap-2 py-1 text-left">
            <span className="w-6 h-6 rounded-none bg-orange-600 text-white font-mono font-black text-[10px] flex items-center justify-center shrink-0">
              {row.currentStageCode}
            </span>
            <div className="min-w-0">
              <span className="block font-bold text-slate-800 text-xs truncate max-w-[160px]" title={row.currentStageName}>
                {row.currentStageName}
              </span>
              <span className="block text-[10px] text-slate-500 font-medium">
                {row.completedStages}/{row.totalStages} Stages
              </span>
            </div>
          </div>
        )
      },

      // 5. Completion Progress
      progress: {
        label: "Completion %",
        align: "center",
        headerClass: "min-w-[130px]",
        render: (_, row) => (
          <div className="w-full max-w-[120px] mx-auto py-1 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800">
              <span className="text-slate-500">Progress</span>
              <span>{row.progress}%</span>
            </div>
            <div className="w-full h-2 rounded-none bg-slate-100 border border-slate-300 overflow-hidden">
              <div
                className="h-full rounded-none bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                style={{ width: `${Math.max(4, Math.min(100, row.progress))}%` }}
              />
            </div>
          </div>
        )
      },

      // 6. Status
      status: {
        label: "Status",
        align: "center",
        headerClass: "min-w-[110px]",
        render: (_, row) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-mono text-[10px] font-bold border ${row.statusColor}`}
          >
            <span className={`w-1.5 h-1.5 rounded-none ${row.dotColor}`} />
            <span>{row.statusLabel}</span>
          </span>
        )
      }
    }),
    [navigate, isUserObserver]
  );

  return (
    <div className="w-full h-full bg-white rounded-none border border-slate-200/90 shadow-2xs p-4 flex flex-col">
      {/* Clean Minimal Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-none bg-orange-50 text-orange-600 border border-orange-200/90 flex items-center justify-center text-sm shadow-2xs">
            <FaHardHat className="text-base" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Active Construction Sites
              </h2>
              <span className="px-2 py-0.5 rounded-none bg-orange-50 text-orange-700 text-xs font-mono font-bold border border-orange-200">
                {displayProjects.length} Running
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Live milestones and execution progress across {wbsStagesCount || 25} WBS construction stages
            </p>
          </div>
        </div>

        {/* Right Action: All Sites Link */}
        <div className="flex items-center gap-2">
          <Link
            to="/sales/active-projects"
            className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1.5"
          >
            <span>All Sites</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Standard Table with No Radius */}
      <div className="w-full flex-1 overflow-hidden rounded-none border border-slate-200">
        <Table
          data={displayProjects}
          columnConfig={columnConfig}
          showSrNo={true}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ActiveProjectsSiteTracker;
