import React from "react";
import { FaChartBar, FaFire, FaBolt, FaSnowflake } from "react-icons/fa";

const LeadOverviewCard = ({ lead }) => {
  const status = (lead?.status || lead?.leadStatus || "NEW").toString().toUpperCase();
  const label = (lead?.leadLabel || lead?.priority || "HOT").toString().toUpperCase();
  const leadMode = lead?.leadMode || lead?.leadSource || "--";
  const channel = lead?.channelType || lead?.channel || "Sales";
  const leadType = lead?.leadType || "FRESH";
  const jobType = lead?.jobType || "NEW";
  const clientType = lead?.clientType || "Individual";
  const leadAge = lead?.leadAge || "0 Days";
  const rawDateVal =
    lead?.createdDate ||
    lead?.createdAtIST ||
    lead?.createdAt ||
    lead?.date ||
    lead?.assignedDate;

  let createdDate = "--";
  let createdTime = lead?.createdTime || lead?.assignedTime || "";

  if (rawDateVal && rawDateVal !== "--") {
    try {
      const d = new Date(rawDateVal);
      if (!isNaN(d.getTime())) {
        createdDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        if (!createdTime) {
          createdTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      } else {
        createdDate = String(rawDateVal);
      }
    } catch (e) {
      createdDate = String(rawDateVal);
    }
  }

  const assignTo = lead?.assignTo || lead?.salesPerson || "Admin";

  const getStatusBadge = (s) => {
    if (s.includes("HOT")) return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
    if (s.includes("WARM") || s.includes("INTERESTED")) return "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
    if (s.includes("COLD")) return "bg-sky-100 text-sky-800 border-sky-300 font-extrabold";
    if (s.includes("CONVERTED")) return "bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold";
    if (s.includes("LOST")) return "bg-slate-200 text-slate-800 border-slate-400 font-extrabold";
    return "bg-blue-100 text-blue-800 border-blue-300 font-extrabold";
  };

  const getLabelBadge = (l) => {
    if (l === "HOT") return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
    if (l === "WARM") return "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
    if (l === "COLD") return "bg-sky-100 text-sky-800 border-sky-300 font-extrabold";
    return "bg-slate-100 text-slate-800 border-slate-300 font-bold";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100 shadow-2xs">
          <FaChartBar />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Lead Overview
          </h2>
          <p className="text-xs text-slate-500 font-medium">Pipeline classification and assignment</p>
        </div>
      </div>

      {/* KEY-VALUE ITEMS */}
      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">LEAD ID</span>
          <span className="font-mono font-black text-slate-900 px-3 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
            {lead?.leadId || lead?.id || "LD-1001"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">LEAD STATUS</span>
          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(status)}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">LEAD TYPE</span>
          <span className="px-3 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-black border border-blue-200 text-xs">
            {leadType}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">LEAD MODE</span>
          <span className="font-black text-slate-900 text-right break-words">{leadMode}</span>
        </div>

        <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0 mt-0.5">WORK CATEGORY</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[65%]">
            {(Array.isArray(lead?.workCategory)
              ? lead.workCategory
              : typeof lead?.workCategory === "string"
              ? lead.workCategory.split(",").map((s) => s.trim())
              : [lead?.workCategory || "Design"]
            )
              .filter(Boolean)
              .map((cat, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs"
                >
                  {cat}
                </span>
              ))}
          </div>
        </div>

        <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0 mt-0.5">WORK TYPE</span>
          <div className="flex flex-wrap items-center justify-end gap-1.5 max-w-[65%]">
            {(Array.isArray(lead?.workType)
              ? lead.workType
              : typeof lead?.workType === "string"
              ? lead.workType.split(",").map((s) => s.trim())
              : [lead?.workType || "Concept Drawing"]
            )
              .filter(Boolean)
              .map((wt, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs"
                >
                  {wt}
                </span>
              ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">EXPECTED BUSINESS</span>
          <span className="font-mono font-black text-emerald-800 text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ₹{Number(lead?.expectedBusiness || lead?.expectedRevenue || lead?.amount || 0).toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold uppercase tracking-wider shrink-0">CREATED DATE</span>
          <span className="font-mono text-xs text-slate-800 font-extrabold text-right">
            {createdDate} {createdTime && `at ${createdTime}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadOverviewCard;
