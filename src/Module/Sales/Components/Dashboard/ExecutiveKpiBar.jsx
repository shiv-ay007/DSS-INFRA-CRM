import React from "react";
import { Link } from "react-router-dom";
import { 
  FaRupeeSign, 
  FaHardHat, 
  FaHandshake,
  FaChartLine
} from "react-icons/fa";

/**
 * Format raw currency numbers to Indian format (Cr / L / K)
 */
const formatIndianCurrency = (amount) => {
  const num = Number(amount) || 0;
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1)} K`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const ExecutiveKpiBar = ({ 
  leads = [], 
  activeProjectsCount = 0,
  wbsStagesCount = 25
}) => {
  // Total expected pipeline business value
  const totalPipelineValue = leads.reduce((acc, lead) => {
    const val = Number(lead.expectedBusiness || lead.budget || 0);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  // Leads with budget provided
  const leadsWithBudget = leads.filter(
    (l) => Number(l.expectedBusiness || l.budget || 0) > 0
  );

  // Average Deal Size
  const avgDealSize = leadsWithBudget.length > 0 
    ? Math.round(totalPipelineValue / leadsWithBudget.length) 
    : 0;

  // Active in-discussion leads (Hot + Warm)
  const activeDiscussions = leads.filter((l) => {
    const s = (l.leadStatus || l.status || "").toLowerCase();
    return s === "hot" || s === "warm";
  }).length;

  const kpis = [
    {
      id: "pipeline",
      label: "Pipeline Value",
      value: formatIndianCurrency(totalPipelineValue),
      change: `💰 ${leadsWithBudget.length} Leads Active`,
      cardGradient: "from-emerald-500/10 via-teal-500/5 to-white",
      borderColor: "border-emerald-200/90",
      iconBg: "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-lg shadow-emerald-500/25",
      badgeBg: "bg-emerald-100/80 text-emerald-800 border-emerald-200",
      icon: <FaRupeeSign className="w-5 h-5 text-white" />,
      link: "/sales/leads/total"
    },
    {
      id: "sites",
      label: "Active Sites",
      value: String(activeProjectsCount),
      change: `🏗️ ${wbsStagesCount || 25} WBS Stages Live`,
      cardGradient: "from-blue-500/10 via-indigo-500/5 to-white",
      borderColor: "border-blue-200/90",
      iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25",
      badgeBg: "bg-blue-100/80 text-blue-800 border-blue-200",
      icon: <FaHardHat className="w-5 h-5 text-white" />,
      link: "/sales/active-projects"
    },
    {
      id: "presales",
      label: "Presales Deals",
      value: String(activeDiscussions),
      change: "⚡ In Negotiation / BOQ",
      cardGradient: "from-amber-500/10 via-orange-500/5 to-white",
      borderColor: "border-amber-200/90",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25",
      badgeBg: "bg-amber-100/80 text-amber-800 border-amber-200",
      icon: <FaHandshake className="w-5 h-5 text-white" />,
      link: "/sales/presales"
    },
    {
      id: "avgDeal",
      label: "Avg Deal Size",
      value: formatIndianCurrency(avgDealSize),
      change: "📈 Avg Project Ticket",
      cardGradient: "from-purple-500/10 via-fuchsia-500/5 to-white",
      borderColor: "border-purple-200/90",
      iconBg: "bg-gradient-to-tr from-purple-600 to-fuchsia-500 shadow-lg shadow-purple-500/25",
      badgeBg: "bg-purple-100/80 text-purple-800 border-purple-200",
      icon: <FaChartLine className="w-5 h-5 text-white" />,
      link: "/sales/leads/total"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {kpis.map((kpi) => (
        <Link
          key={kpi.id}
          to={kpi.link}
          className={`p-3.5 sm:p-4 rounded-xl bg-gradient-to-br ${kpi.cardGradient} border ${kpi.borderColor} shadow-2xs hover:shadow-md transition-all cursor-pointer block group`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide group-hover:text-slate-900 transition-colors">
              {kpi.label}
            </span>
            <div className={`w-9 h-9 rounded-xl ${kpi.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
              {kpi.icon}
            </div>
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {kpi.value}
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${kpi.badgeBg}`}>
              {kpi.change}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ExecutiveKpiBar;
