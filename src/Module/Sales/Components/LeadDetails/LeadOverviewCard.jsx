import React from "react";

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
  const assignTo = lead?.assignTo || lead?.salesPerson || "Sales TL (Current User)";

  const getLabelBadge = (l) => {
    if (l === "HOT") return "bg-rose-100 text-rose-800 border-rose-300 font-extrabold";
    if (l === "WARM") return "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
    if (l === "COLD") return "bg-sky-100 text-sky-800 border-sky-300 font-extrabold";
    return "bg-slate-100 text-slate-800 border-slate-300 font-bold";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg border border-purple-100 shadow-2xs">
            📊
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Lead Overview
            </h2>
            <p className="text-xs text-slate-500 font-medium">Pipeline classification and assignment</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Lead ID</span>
          <span className="font-mono font-extrabold text-slate-900 px-2.5 py-1 rounded bg-white border border-slate-200">
            {lead?.id || "LD-1001"}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Current Status</span>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs">
            {status}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Lead Label / Priority</span>
          <span className={`px-3 py-1 rounded-full text-xs border ${getLabelBadge(label)}`}>
            {label === "HOT" && "🔥 "}
            {label === "WARM" && "⚡ "}
            {label === "COLD" && "❄️ "}
            {label}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Lead Source</span>
          <span className="font-bold text-slate-900">{leadSource}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Channel</span>
          <span className="font-semibold text-slate-800">{channel}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Lead Type</span>
          <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200 text-xs">
            {leadType}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Job Type</span>
          <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200 text-xs">
            {jobType}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Client Type</span>
          <span className="font-semibold text-slate-800">{clientType}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Lead Age</span>
          <span className="font-mono font-bold text-slate-800">{leadAge}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Assigned To</span>
          <span className="font-bold text-slate-900">{assignTo}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-slate-500 font-medium">Creation Date & Time</span>
          <span className="font-mono text-xs text-slate-700 font-medium">
            {createdDate} {createdTime && `at ${createdTime}`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeadOverviewCard;
