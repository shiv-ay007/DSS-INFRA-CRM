import React from "react";
import { FaChartBar, FaFire, FaBolt, FaSnowflake } from "react-icons/fa";

const LeadOverviewCard = ({ lead }) => {
  const status = (lead?.status || lead?.leadStatus || "NEW").toString().toUpperCase();
  const label = (lead?.leadLabel || lead?.priority || "HOT").toString().toUpperCase();
  const leadSource = lead?.leadSource || lead?.leadMode || "--";
  const channel = lead?.channelType || lead?.channel || "Sales";
  const leadType = lead?.leadType || "FRESH";
  const jobType = lead?.jobType || "NEW";
  const clientType = lead?.clientType || "Individual";
  const leadAge = lead?.leadAge || "0 Days";
  const createdDate = lead?.createdDate || lead?.date || "--";
  const createdTime = lead?.createdTime || "";
  const assignTo = lead?.assignTo || lead?.salesPerson || "Sales TL";

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
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Lead ID</span>
          <span className="font-mono font-black text-slate-900 px-3 py-1 rounded-lg bg-white border border-slate-300 shadow-2xs">
            {lead?.id || "LD-1001"}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Current Status</span>
          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusBadge(status)}`}>
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Lead Priority</span>
          <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${getLabelBadge(label)}`}>
            {label === "HOT" && <FaFire className="text-rose-500 text-xs" />}
            {label === "WARM" && <FaBolt className="text-amber-500 text-xs" />}
            {label === "COLD" && <FaSnowflake className="text-sky-500 text-xs" />}
            <span>{label}</span>
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Lead Source</span>
          <span className="font-black text-slate-900">{leadSource}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Channel</span>
          <span className="font-extrabold text-slate-800">{channel}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Lead Type</span>
          <span className="px-3 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-black border border-blue-200 text-xs">
            {leadType}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Job Type</span>
          <span className="px-3 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-black border border-purple-200 text-xs">
            {jobType}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Client Type</span>
          <span className="font-extrabold text-slate-800">{clientType}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Lead Age</span>
          <span className="font-mono font-extrabold text-slate-800">{leadAge}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Assigned To</span>
          <span className="font-black text-slate-900">{assignTo}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/90 border border-slate-200/70">
          <span className="text-slate-500 font-bold">Creation Date</span>
          <span className="font-mono text-xs text-slate-800 font-extrabold">
            {createdDate} {createdTime && `at ${createdTime}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadOverviewCard;
