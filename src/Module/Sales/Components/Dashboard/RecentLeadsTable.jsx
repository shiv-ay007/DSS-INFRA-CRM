import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import Table from "../../../../Common/Components/Table";
import { recentLeadsData } from "../../data/dashboardData";

const getStatusBadge = (status) => {
  switch (status) {
    case "Hot":
      return "bg-rose-100 text-rose-700 border-rose-300 font-bold";
    case "Warm":
      return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
    case "Cold":
      return "bg-sky-100 text-sky-800 border-sky-300 font-bold";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
  }
};

const getSourceBadge = (source) => {
  switch (source) {
    case "Direct Call":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Website":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Campaign":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    default:
      return "bg-teal-50 text-teal-700 border-teal-200";
  }
};

const RecentLeadsTable = ({ recentLeads = recentLeadsData }) => {
  const columnConfig = useMemo(
    () => ({
      id: {
        label: "Lead ID",
        align: "left",
        render: (val, row) => {
          const rawId = row.leadId || row.id || val;
          const displayId = (rawId && String(rawId).match(/^[0-9a-fA-F]{24}$/))
            ? `LD-${String(rawId).slice(-4).toUpperCase()}`
            : rawId;
          return (
            <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
              {displayId}
            </span>
          );
        },
      },
      date: {
        label: "Date",
        align: "left",
        render: (val) => (
          <span className="font-mono text-xs text-slate-600 whitespace-nowrap">{val}</span>
        ),
      },
      name: {
        label: "Client / Company",
        align: "left",
        headerClass: "min-w-[200px]",
        render: (val, row) => (
          <div className="text-left">
            <div className="font-bold text-slate-900 text-xs">{val}</div>
            <div className="text-[11px] text-slate-500 font-medium">{row.company}</div>
          </div>
        ),
      },
      source: {
        label: "Source",
        align: "left",
        render: (val) => (
          <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold border ${getSourceBadge(val)}`}>
            {val}
          </span>
        ),
      },
      amount: {
        label: "Deal Value",
        align: "left",
        render: (val) => (
          <span className="font-mono font-bold text-emerald-700 text-xs whitespace-nowrap">
            {val}
          </span>
        ),
      },
      status: {
        label: "Status",
        align: "center",
        render: (val) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(val)} shadow-2xs`}>
            {val === "Hot" && "🔥 "}
            {val === "Warm" && "⚡ "}
            {val === "Cold" && "❄️ "}
            {val}
          </span>
        ),
      },
      action: {
        label: "Action",
        align: "right",
        render: () => (
          <Link
            to="/sales/leads/total"
            className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-black transition-all cursor-pointer shadow-xs"
          >
            View
          </Link>
        ),
      },
    }),
    []
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Recent Incoming Leads
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Latest inquiries, customer details, potential deal value, and their current pipeline status.
          </p>
        </div>
        <Link
          to="/sales/leads/total"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <span>View All Leads</span>
          <span>→</span>
        </Link>
      </div>

      <Table data={recentLeads} columnConfig={columnConfig} showSrNo={true} />
    </div>
  );
};

export default RecentLeadsTable;
