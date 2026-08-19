import React, { useState } from "react";
import { Link } from "react-router-dom";

const Salesdash = () => {
  // 1. Top 4 Metrics Data with Rich Gradients & Colors
  const metrics = [
    {
      id: "total",
      label: "Total Leads",
      value: "250",
      change: "+12% this month",
      cardGradient: "from-blue-500/10 via-indigo-500/5 to-white",
      borderColor: "border-blue-200/90",
      iconBg: "bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/25",
      textColor: "text-blue-700",
      badgeBg: "bg-blue-100/80 text-blue-700 border-blue-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: "hot",
      label: "Hot Leads",
      value: "45",
      change: "🔥 High Priority",
      cardGradient: "from-rose-500/10 via-red-500/5 to-white",
      borderColor: "border-rose-200/90",
      iconBg: "bg-gradient-to-tr from-rose-600 to-red-500 shadow-lg shadow-rose-500/25",
      textColor: "text-rose-700",
      badgeBg: "bg-rose-100/80 text-rose-700 border-rose-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    },
    {
      id: "warm",
      label: "Warm Leads",
      value: "80",
      change: "⚡ In Discussion",
      cardGradient: "from-amber-500/10 via-orange-500/5 to-white",
      borderColor: "border-amber-200/90",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25",
      textColor: "text-amber-700",
      badgeBg: "bg-amber-100/80 text-amber-800 border-amber-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: "cold",
      label: "Cold Leads",
      value: "100",
      change: "❄️ Nurturing Phase",
      cardGradient: "from-sky-500/10 via-teal-500/5 to-white",
      borderColor: "border-sky-200/90",
      iconBg: "bg-gradient-to-tr from-sky-500 to-teal-500 shadow-lg shadow-sky-500/25",
      textColor: "text-sky-700",
      badgeBg: "bg-sky-100/80 text-sky-700 border-sky-200",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  // 2. Follow-ups Due Today
  const [followups] = useState([
    { id: 1, name: "Aarav Sharma", company: "CodeCrafter IT Hub", time: "10:00 AM", phone: "+91 98765 44434", tag: "P3 Video Wall Demo" },
    { id: 2, name: "Pooja Verma", company: "Verma Jewellers", time: "02:00 PM", phone: "+91 98765 59088", tag: "Signboard Final Quote" },
    { id: 3, name: "Dr. Sunita Tripathi", company: "City Care Hospital", time: "04:30 PM", phone: "+91 98390 90889", tag: "Reception Kiosks Review" },
    { id: 4, name: "Mohd. Irshad Khan", company: "Grand Imperial Banquet", time: "06:00 PM", phone: "+91 98780 80889", tag: "Stage Display Contract" }
  ]);

  // 3. Lead Status Breakdown (Donut Data)
  const statusBreakdown = [
    { label: "Hot Leads", count: 45, percentage: 18, dotColor: "bg-rose-500", badgeColor: "bg-rose-50 text-rose-700 border-rose-200", stroke: "#f43f5e" },
    { label: "Warm Leads", count: 80, percentage: 32, dotColor: "bg-amber-500", badgeColor: "bg-amber-50 text-amber-700 border-amber-200", stroke: "#f59e0b" },
    { label: "Cold Leads", count: 100, percentage: 40, dotColor: "bg-sky-500", badgeColor: "bg-sky-50 text-sky-700 border-sky-200", stroke: "#0ea5e9" },
    { label: "New Leads", count: 25, percentage: 10, dotColor: "bg-emerald-500", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", stroke: "#10b981" }
  ];

  // 4. Recent Leads Table Data
  const recentLeads = [
    { id: "LD-901", date: "25/08/2026", name: "Aarav Sharma", company: "CodeCrafter IT Hub", amount: "₹ 2,45,000", status: "Hot", source: "Direct Call" },
    { id: "LD-902", date: "24/08/2026", name: "Pooja Verma", company: "Verma Jewellers", amount: "₹ 3,80,000", status: "Hot", source: "WhatsApp" },
    { id: "LD-903", date: "23/08/2026", name: "Rajesh Singhania", company: "Singhania Logistics", amount: "₹ 1,50,000", status: "Warm", source: "JustDial" },
    { id: "LD-904", date: "22/08/2026", name: "Dr. Sunita Tripathi", company: "City Care Hospital", amount: "₹ 2,85,000", status: "Hot", source: "Direct Call" },
    { id: "LD-905", date: "21/08/2026", name: "Vikramaditya Roy", company: "Code Crafter PVT LTD", amount: "₹ 84,000", status: "Warm", source: "Facebook" }
  ];

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

  return (
    <div className="space-y-6 select-none font-sans pb-10">
      
      {/* ================= 1. HEADER & ADD LEAD CTA ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-white via-slate-50 to-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              LEAD DASHBOARD
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Pipeline
            </span>
          </div>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">
            Complete overview of your daily leads, revenue pipeline, status breakdowns, and scheduled follow-ups.
          </p>
        </div>

        {/* Add Lead Button */}
        <Link
          to="/sales/leads/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Lead</span>
        </Link>
      </div>

      {/* ================= 2. 4 TOP STATS CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${metric.cardGradient} border ${metric.borderColor} shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm sm:text-base font-bold text-slate-700 uppercase tracking-wide">
                {metric.label}
              </span>
              <div className={`w-12 h-12 rounded-2xl ${metric.iconBg} flex items-center justify-center`}>
                {metric.icon}
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {metric.value}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-xs sm:text-sm font-semibold border ${metric.badgeBg}`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ================= 3. MIDDLE SECTION (FOLLOW-UPS & DONUT CHART) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT (7 COLS): FOLLOW-UPS DUE TODAY */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Follow-ups Due Today
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold font-mono">
                {followups.length} Calls Pending
              </span>
            </div>

            {/* List */}
            <div className="space-y-3">
              {followups.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50/90 border border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-mono font-bold text-sm shadow-xs shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {item.name}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                        <span className="text-slate-800 font-semibold">{item.company}</span> • <span className="font-mono text-slate-700">{item.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Time Badge & Call Button */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                    <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>⏰</span>
                      <span>{item.time}</span>
                    </span>
                    <a
                      href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z" />
                      </svg>
                      <span>Call</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs sm:text-sm text-slate-500 font-medium">Keep in touch with every client daily</span>
            <Link
              to="/sales/leads/followup"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>View All Followups</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* RIGHT (5 COLS): LEAD STATUS DONUT / PIE CHART */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Lead Status Distribution
              </h2>
              <span className="text-xs sm:text-sm font-mono font-bold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                Total: 250
              </span>
            </div>

            {/* SVG Donut Chart with vibrant colors */}
            <div className="flex items-center justify-center py-3">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 filter drop-shadow-sm" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Hot 18% */}
                  <path
                    stroke="#f43f5e"
                    strokeWidth="4.5"
                    strokeDasharray="18, 100"
                    strokeDashoffset="0"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Warm 32% */}
                  <path
                    stroke="#f59e0b"
                    strokeWidth="4.5"
                    strokeDasharray="32, 100"
                    strokeDashoffset="-18"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Cold 40% */}
                  <path
                    stroke="#0ea5e9"
                    strokeWidth="4.5"
                    strokeDasharray="40, 100"
                    strokeDashoffset="-50"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* New 10% */}
                  <path
                    stroke="#10b981"
                    strokeWidth="4.5"
                    strokeDasharray="10, 100"
                    strokeDashoffset="-90"
                    fill="none"
                    strokeLinecap="round"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">
                    250
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-bold uppercase mt-1 tracking-wider">
                    Total Leads
                  </span>
                </div>
              </div>
            </div>

            {/* Percentage Breakdown Legend */}
            <div className="mt-4 space-y-2.5">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs sm:text-sm p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.dotColor} shadow-xs`} />
                    <span className="font-bold text-slate-800">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono font-medium">{item.count} leads</span>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-extrabold text-xs border ${item.badgeColor}`}>
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-medium">
            <span>Overall Conversion Rate:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-black">
              ⚡ 18.4%
            </span>
          </div>
        </div>

      </div>

      {/* ================= 4. RECENT LEADS TABLE ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Recent Incoming Leads
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Latest inquiries, customer details, potential deal value, and their current pipeline status.
            </p>
          </div>
          <Link
            to="/sales/leads/total"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <span>View All Leads</span>
            <span>→</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                <th className="py-3.5 px-4">Lead ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 min-w-[200px]">Client / Company</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Deal Value</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-slate-800">
                    <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs">
                      {lead.id}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                    {lead.date}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 text-sm sm:text-base">{lead.name}</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">{lead.company}</div>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${getSourceBadge(lead.source)}`}>
                      {lead.source}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-black text-emerald-700 text-sm sm:text-base whitespace-nowrap">
                    {lead.amount}
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(lead.status)} shadow-2xs`}>
                      {lead.status === "Hot" && "🔥 "}
                      {lead.status === "Warm" && "⚡ "}
                      {lead.status === "Cold" && "❄️ "}
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <Link
                      to="/sales/leads/total"
                      className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-black transition-all cursor-pointer shadow-xs"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default Salesdash;