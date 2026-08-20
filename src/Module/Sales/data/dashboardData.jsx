import React from "react";

// Top 4 Metrics Data with Gradients & Icons
export const metricsData = [
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

// Initial Follow-ups Due Today
export const initialFollowups = [
  { id: 1, name: "Aarav Sharma", company: "CodeCrafter IT Hub", time: "10:00 AM", phone: "+91 98765 44434", tag: "P3 Video Wall Demo" },
  { id: 2, name: "Pooja Verma", company: "Verma Jewellers", time: "02:00 PM", phone: "+91 98765 59088", tag: "Signboard Final Quote" },
  { id: 3, name: "Dr. Sunita Tripathi", company: "City Care Hospital", time: "04:30 PM", phone: "+91 98390 90889", tag: "Reception Kiosks Review" },
  { id: 4, name: "Mohd. Irshad Khan", company: "Grand Imperial Banquet", time: "06:00 PM", phone: "+91 98780 80889", tag: "Stage Display Contract" }
];

// Lead Status Breakdown (Donut Data)
export const statusBreakdownData = [
  { label: "Hot Leads", count: 45, percentage: 18, dotColor: "bg-rose-500", badgeColor: "bg-rose-50 text-rose-700 border-rose-200", stroke: "#f43f5e" },
  { label: "Warm Leads", count: 80, percentage: 32, dotColor: "bg-amber-500", badgeColor: "bg-amber-50 text-amber-700 border-amber-200", stroke: "#f59e0b" },
  { label: "Cold Leads", count: 100, percentage: 40, dotColor: "bg-sky-500", badgeColor: "bg-sky-50 text-sky-700 border-sky-200", stroke: "#0ea5e9" },
  { label: "New Leads", count: 25, percentage: 10, dotColor: "bg-emerald-500", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", stroke: "#10b981" }
];

// Recent Leads Table Data
export const recentLeadsData = [
  { id: "LD-901", date: "25/08/2026", name: "Aarav Sharma", company: "CodeCrafter IT Hub", amount: "₹ 2,45,000", status: "Hot", source: "Direct Call" },
  { id: "LD-902", date: "24/08/2026", name: "Pooja Verma", company: "Verma Jewellers", amount: "₹ 3,80,000", status: "Hot", source: "WhatsApp" },
  { id: "LD-903", date: "23/08/2026", name: "Rajesh Singhania", company: "Singhania Logistics", amount: "₹ 1,50,000", status: "Warm", source: "JustDial" },
  { id: "LD-904", date: "22/08/2026", name: "Dr. Sunita Tripathi", company: "City Care Hospital", amount: "₹ 2,85,000", status: "Hot", source: "Direct Call" },
  { id: "LD-905", date: "21/08/2026", name: "Vikramaditya Roy", company: "Code Crafter PVT LTD", amount: "₹ 84,000", status: "Warm", source: "Facebook" }
];
