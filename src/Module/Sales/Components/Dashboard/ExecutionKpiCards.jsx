import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaDraftingCompass,
  FaHardHat,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight
} from "react-icons/fa";

/**
 * Execution & Project Scope KPI Cards
 * Displays:
 * 1. Active Projects with Design scope
 * 2. Active Projects with Only Construction scope (no design)
 * 3. Complete Projects (100% Handed Over)
 * 4. Loss / Drop Projects (Cancelled / Not Interested)
 */
const ExecutionKpiCards = ({
  activeProjects = [],
  completedCount = 0,
  lostCount = 0
}) => {
  // Calculate Design vs Only Construction from Active Projects
  const { designCount, constructionOnlyCount } = useMemo(() => {
    let design = 0;
    let constOnly = 0;

    (activeProjects || []).forEach((p) => {
      const scope = String(p.workCategory || p.category || p.engagementScope || "").toLowerCase();
      const wt = String(p.workType || "").toLowerCase();

      const hasDesign = scope.includes("design") || wt.includes("design") || wt.includes("drawing");
      const hasConst = scope.includes("construction") || scope.includes("civil") || wt.includes("construction");

      if (hasDesign) {
        design++;
      }
      if (hasConst && !hasDesign) {
        constOnly++;
      } else if (!hasDesign && !hasConst) {
        // Fallback for active on-ground site projects with unclassified scope
        constOnly++;
      }
    });

    return { designCount: design, constructionOnlyCount: constOnly };
  }, [activeProjects]);

  const cards = [
    {
      id: "active_design",
      label: "ACTIVE DESIGN",
      value: designCount,
      subtext: "Design & Architectural Scope",
      badge: "Design Included",
      badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: <FaDraftingCompass className="text-base text-indigo-600" />,
      iconBg: "bg-indigo-50 border border-indigo-200/90",
      cardGradient: "from-indigo-50/50 via-white to-white",
      borderColor: "border-indigo-100/90",
      hoverBorder: "hover:border-indigo-300",
      link: "/sales/active-projects"
    },
    {
      id: "active_construction_only",
      label: "ONLY CONSTRUCTION",
      value: constructionOnlyCount,
      subtext: "Pure Civil / Site Execution",
      badge: "Only Construction",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <FaHardHat className="text-base text-amber-600" />,
      iconBg: "bg-amber-50 border border-amber-200/90",
      cardGradient: "from-amber-50/50 via-white to-white",
      borderColor: "border-amber-100/90",
      hoverBorder: "hover:border-amber-300",
      link: "/sales/active-projects"
    },
    {
      id: "complete_projects",
      label: "COMPLETE PROJECTS",
      value: completedCount,
      subtext: "100% Finished & Handed Over",
      badge: "Handed Over",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <FaCheckCircle className="text-base text-emerald-600" />,
      iconBg: "bg-emerald-50 border border-emerald-200/90",
      cardGradient: "from-emerald-50/50 via-white to-white",
      borderColor: "border-emerald-100/90",
      hoverBorder: "hover:border-emerald-300",
      link: "/sales/complete-projects"
    },
    {
      id: "lost_drop_projects",
      label: "LOST / DROP PROJECTS",
      value: lostCount,
      subtext: "Not Interested / Cancelled",
      badge: "Lost & Dropped",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <FaTimesCircle className="text-base text-rose-600" />,
      iconBg: "bg-rose-50 border border-rose-200/90",
      cardGradient: "from-rose-50/50 via-white to-white",
      borderColor: "border-rose-100/90",
      hoverBorder: "hover:border-rose-300",
      link: "/sales/leads/lost"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c) => (
        <Link
          key={c.id}
          to={c.link}
          className={`group p-3.5 sm:p-4 rounded-xl bg-gradient-to-br ${c.cardGradient} border ${c.borderColor} shadow-2xs ${c.hoverBorder} hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-pointer`}
        >
          <div>
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide pr-1">
                {c.label}
              </span>
              <div
                className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs`}
              >
                {c.icon}
              </div>
            </div>

            {/* Big Value */}
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {c.value}
            </div>
          </div>

          {/* Bottom row: Badge pill & View arrow */}
          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-100/80">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${c.badgeClass}`}>
              {c.badge}
            </span>
            <span className="text-slate-400 group-hover:text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors">
              <span className="hidden sm:inline text-[11px]">View</span>
              <FaArrowRight className="text-[10px] group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ExecutionKpiCards;
