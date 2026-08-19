import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";

/**
 * Component: Lead (Lead Management Sheet)
 * Design matching the DSS CRM Lead Management Sheet screenshot with rich colorful styling & larger text.
 */

// Helper to format currency
const formatLakhs = (val) => {
  const num = Number(val) || 0;
  return `₹${(num / 100000).toFixed(2)}L`;
};

// Initial Lead Dataset
const initialLeadsData = [
  {
    id: "LM-001",
    concernPersonName: "Aarav Sharma",
    phoneNumber: "9876544434",
    emailAddress: "aarav.sharma@codecrafter.in",
    status: "INTERESTED",
    nextFollowupDate: "22 Aug 2026",
    nextFollowupDateRaw: "2026-08-22",
    nextFollowupTime: "11:00 am",
    channelType: "Call",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "18 Aug 2026", time: "11:00 am", notes: "Shared P3 LED screen quotation and site layout.", rep: "Sales TL", status: "Followup Done" }
    ],
    createdDate: "25 Jun 2026",
    createdTime: "12:12 pm",
    leadAge: "55 Days",
    leadLabel: "WARM",
    leadType: "REPEAT",
    jobType: "NEW",
    requirement: "P3 Indoor Interactive LED Video Wall 12x8 ft",
    expectedBusiness: "245000",
    pincode: "273001",
    leadSource: "JUSTDIAL",
    leadBy: "Sales TL",
    assignTo: "John (Sales TL)",
    address: "Golghar, Park Road, Gorakhpur",
    clientDesignation: "Managing Director"
  },
  {
    id: "LM-002",
    concernPersonName: "Pooja Verma",
    phoneNumber: "9876559088",
    emailAddress: "pooja@vermajewellers.com",
    status: "INTERESTED",
    nextFollowupDate: "25 Aug 2026",
    nextFollowupDateRaw: "2026-08-25",
    nextFollowupTime: "03:30 pm",
    channelType: "Meeting",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "15 Aug 2026", time: "03:30 pm", notes: "Sample acrylic lettering shown at showroom.", rep: "Pooja Verma", status: "Interested" }
    ],
    createdDate: "16 Jun 2026",
    createdTime: "05:34 pm",
    leadAge: "64 Days",
    leadLabel: "HOT",
    leadType: "FRESH",
    jobType: "NEW",
    requirement: "Outdoor Golden Acrylic LED Backlit Glow Signboard",
    expectedBusiness: "380000",
    pincode: "226001",
    leadSource: "WHATSAPP",
    leadBy: "Sales TL",
    assignTo: "Pooja Verma",
    address: "Hazratganj Main Market, Lucknow",
    clientDesignation: "Proprietor"
  },
  {
    id: "LM-003",
    concernPersonName: "Rajesh Singhania",
    phoneNumber: "9988888989",
    emailAddress: "singhania.finance@gmail.com",
    status: "CONVERTED",
    nextFollowupDate: "Completed",
    nextFollowupDateRaw: "2026-06-20",
    nextFollowupTime: "11:00 am",
    channelType: "Call",
    followupRemarksCount: 3,
    followupHistory: [
      { date: "20 Jun 2026", time: "11:00 am", notes: "Final advance received, converted deal.", rep: "Sales TL", status: "Converted" },
      { date: "15 Jun 2026", time: "03:00 pm", notes: "Demo completed successfully.", rep: "Sales TL", status: "Completed" }
    ],
    createdDate: "10 Jun 2026",
    createdTime: "10:15 am",
    leadAge: "70 Days",
    leadLabel: "HOT",
    leadType: "FRESH",
    jobType: "NEW",
    requirement: "Facade P10 LED Display Repair & SMPS Replacement",
    expectedBusiness: "150000",
    pincode: "221002",
    leadSource: "JUSTDIAL",
    leadBy: "Sales TL",
    assignTo: "John (Sales TL)",
    address: "Rathyatra Crossing, Varanasi",
    clientDesignation: "Director"
  },
  {
    id: "LM-004",
    concernPersonName: "Dr. Sunita Tripathi",
    phoneNumber: "9839090889",
    emailAddress: "contact@citycarehospital.org",
    status: "INTERESTED",
    nextFollowupDate: "28 Aug 2026",
    nextFollowupDateRaw: "2026-08-28",
    nextFollowupTime: "02:00 pm",
    channelType: "Call",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "12 Aug 2026", time: "02:00 pm", notes: "Hospital reception kiosk specs finalized.", rep: "Sanjay Srivastava", status: "In Discussion" }
    ],
    createdDate: "19 May 2026",
    createdTime: "06:54 pm",
    leadAge: "92 Days",
    leadLabel: "HOT",
    leadType: "FRESH",
    jobType: "NEW",
    requirement: "55-inch Touchscreen Reception Info Kiosk (2 Units)",
    expectedBusiness: "285000",
    pincode: "273004",
    leadSource: "DIRECT",
    leadBy: "Sanjay Srivastava",
    assignTo: "Sanjay Srivastava",
    address: "Medical College Road, Asuran, Gorakhpur",
    clientDesignation: "Medical Superintendent"
  },
  {
    id: "LM-005",
    concernPersonName: "Mohd. Irshad Khan",
    phoneNumber: "9878080889",
    emailAddress: "irshad.banquet@outlook.com",
    status: "CONVERTED",
    nextFollowupDate: "Completed",
    nextFollowupDateRaw: "2026-06-15",
    nextFollowupTime: "05:00 pm",
    channelType: "Call",
    followupRemarksCount: 4,
    followupHistory: [
      { date: "15 Jun 2026", time: "05:00 pm", notes: "Curved stage display deal closed with 50% advance.", rep: "Sales TL", status: "Converted" }
    ],
    createdDate: "19 May 2026",
    createdTime: "12:29 pm",
    leadAge: "92 Days",
    leadLabel: "HOT",
    leadType: "FRESH",
    jobType: "NEW",
    requirement: "Grand Stage Curved LED Video Wall 20x10 ft P3.91",
    expectedBusiness: "560000",
    pincode: "224001",
    leadSource: "INSTAGRAM",
    leadBy: "Sales TL",
    assignTo: "John (Sales TL)",
    address: "NH-28 Bypass Road, Faizabad, Ayodhya",
    clientDesignation: "Owner"
  },
  {
    id: "LM-006",
    concernPersonName: "Vikramaditya Roy",
    phoneNumber: "9129985581",
    emailAddress: "accessauthority@gmail.com",
    status: "INTERESTED",
    nextFollowupDate: "No Schedule",
    nextFollowupDateRaw: "",
    nextFollowupTime: "",
    channelType: "",
    followupRemarksCount: 0,
    followupHistory: [],
    createdDate: "16 May 2026",
    createdTime: "06:23 pm",
    leadAge: "95 Days",
    leadLabel: "WARM",
    leadType: "REPEAT",
    jobType: "NEW",
    requirement: "Reception 3D Stainless Steel Backlit Letter Board",
    expectedBusiness: "84000",
    pincode: "274405",
    leadSource: "OTHER",
    leadBy: "Sales TL",
    assignTo: "--",
    address: "Civil Lines Main Road, Deoria",
    clientDesignation: "Operations Head"
  }
];

const teamMembers = [
  "Sales TL",
  "John (Sales TL)",
  "Sanjay Srivastava",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra"
];

const timeOptions = [
  "09:00 am", "09:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am",
  "12:00 pm", "12:30 pm", "02:00 pm", "02:30 pm", "03:00 pm", "03:30 pm",
  "04:00 pm", "04:30 pm", "05:00 pm", "05:30 pm", "06:00 pm"
];

const Lead = () => {
  // Leads state with localStorage cache
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("dss_lead_management_sheet_v1");
      return saved ? JSON.parse(saved) : initialLeadsData;
    } catch {
      return initialLeadsData;
    }
  });

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(newLeads));
    } catch (e) {
      console.error(e);
    }
  };

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLeadType, setFilterLeadType] = useState("All");
  const [filterJobType, setFilterJobType] = useState("All");
  const [filterLeadLabel, setFilterLeadLabel] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailModalLead, setDetailModalLead] = useState(null);
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [remarksModalLead, setRemarksModalLead] = useState(null);
  const [completeModalLead, setCompleteModalLead] = useState(null);

  // Schedule Form State
  const [scheduleFormData, setScheduleFormData] = useState({
    date: "",
    time: "10:00 am",
    assignedTo: "Sales TL",
    reminder: true,
    reminderHours: 24,
    notes: ""
  });
  const [scheduleFormErrors, setScheduleFormErrors] = useState({});

  // 1. KPI Aggregations
  const stats = useMemo(() => {
    const total = leads.length;
    const fresh = leads.filter((l) => (l.leadType || "").toUpperCase() === "FRESH").length;
    const converted = leads.filter((l) => (l.status || "").toUpperCase() === "CONVERTED").length;
    const interested = leads.filter((l) => (l.status || "").toUpperCase().includes("INTERESTED")).length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    
    // Revenue calculations
    const totalRevenue = leads
      .filter((l) => (l.status || "").toUpperCase() === "CONVERTED")
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);
    
    const expectedRevenue = leads
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);

    const totalIncentives = totalRevenue * 0.02; // 2% incentive
    const expectedIncentives = expectedRevenue * 0.02;

    return {
      total,
      fresh,
      converted,
      interested,
      conversionRate: `${conversionRate}%`,
      totalRevenue: formatLakhs(totalRevenue),
      expectedRevenue: formatLakhs(expectedRevenue),
      totalIncentives: formatLakhs(totalIncentives),
      expectedIncentives: formatLakhs(expectedIncentives)
    };
  }, [leads]);

  // 2. Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterStatus !== "All" && lead.status !== filterStatus) return false;
      if (filterLeadType !== "All" && lead.leadType !== filterLeadType) return false;
      if (filterJobType !== "All" && lead.jobType !== filterJobType) return false;
      if (filterLeadLabel !== "All" && lead.leadLabel !== filterLeadLabel) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (lead.concernPersonName || "").toLowerCase().includes(q) ||
          (lead.phoneNumber || "").includes(q) ||
          (lead.emailAddress || "").toLowerCase().includes(q) ||
          (lead.requirement || "").toLowerCase().includes(q) ||
          (lead.leadSource || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [leads, filterStatus, filterLeadType, filterJobType, filterLeadLabel, searchTerm]);

  // 3. Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;

  // Status Badge Class
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("INTERESTED")) return "text-emerald-700 bg-emerald-50 border border-emerald-300";
    if (s.includes("CONVERTED")) return "text-blue-700 bg-blue-50 border border-blue-300";
    if (s.includes("LOST")) return "text-rose-700 bg-rose-50 border border-rose-300";
    return "text-slate-700 bg-slate-100 border border-slate-300";
  };

  // Lead Label Badge Class
  const getLeadLabelBadgeClass = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "HOT") return "text-rose-700 bg-rose-50 border border-rose-200";
    if (l === "WARM") return "text-amber-700 bg-amber-50 border border-amber-200";
    if (l === "COLD") return "text-sky-700 bg-sky-50 border border-sky-200";
    return "text-purple-700 bg-purple-50 border border-purple-200";
  };

  // Open Schedule Modal
  const handleOpenScheduleModal = (lead) => {
    setScheduleModalLead(lead);
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = tmr.toISOString().split("T")[0];

    setScheduleFormData({
      date: tmrStr,
      time: "10:00 am",
      assignedTo: lead.assignTo !== "--" ? lead.assignTo : "Sales TL",
      reminder: true,
      reminderHours: 24,
      notes: ""
    });
    setScheduleFormErrors({});
  };

  // Submit Schedule Form
  const handleSaveSchedule = (e) => {
    e.preventDefault();
    if (!scheduleFormData.notes?.trim()) {
      setScheduleFormErrors({ notes: "Notes are required" });
      return;
    }
    if (!scheduleModalLead) return;

    const [year, month, day] = scheduleFormData.date.split("-");
    const formattedDisplayDate = `${day} ${new Date(year, month - 1, day).toLocaleString("en-IN", { month: "short" })} ${year}`;

    const newHistoryEntry = {
      date: formattedDisplayDate,
      time: scheduleFormData.time,
      notes: scheduleFormData.notes,
      rep: scheduleFormData.assignedTo,
      status: "Scheduled"
    };

    const updated = leads.map((item) => {
      if (item.id === scheduleModalLead.id) {
        const prevHist = item.followupHistory || [];
        return {
          ...item,
          nextFollowupDate: formattedDisplayDate,
          nextFollowupDateRaw: scheduleFormData.date,
          nextFollowupTime: scheduleFormData.time,
          channelType: "Call",
          followupRemarksCount: prevHist.length + 1,
          followupHistory: [newHistoryEntry, ...prevHist],
          assignTo: scheduleFormData.assignedTo
        };
      }
      return item;
    });

    saveLeads(updated);
    setScheduleModalLead(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterLeadType("All");
    setFilterJobType("All");
    setFilterLeadLabel("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 font-sans select-none pb-16 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* ================= 1. SUB-HEADER BANNER ================= */}
      <div className="w-full bg-gradient-to-r from-emerald-50 via-teal-50/30 to-white rounded-2xl border border-emerald-200/80 shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Lead Management Sheet
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Master Sheet
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Complete overview of all leads, conversion metrics, expected revenue, and customer interactions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/sales/leads/add"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Lead
          </Link>
        </div>
      </div>

      {/* ================= 2. TOP 9 COLORFUL KPI STAT CARDS (Exact Screenshot Match) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        
        {/* 1. Total Leads (Pastel Purple/Pink) */}
        <div className="p-3.5 rounded-2xl bg-[#FDF2F8] border border-pink-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-base">📊</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <span className="text-[11px] font-bold text-pink-900 mt-2">Total Leads</span>
        </div>

        {/* 2. Fresh Leads (Pastel Blue) */}
        <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-base">👤+</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.fresh}</span>
          </div>
          <span className="text-[11px] font-bold text-blue-900 mt-2">Fresh Leads</span>
        </div>

        {/* 3. Converted Leads (Pastel Mint Green) */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 text-base">📈</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.converted}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 mt-2">Converted Leads</span>
        </div>

        {/* 4. Interested Leads (Pastel Yellow) */}
        <div className="p-3.5 rounded-2xl bg-[#FEFCE8] border border-yellow-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-base">👍</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.interested}</span>
          </div>
          <span className="text-[11px] font-bold text-yellow-900 mt-2">Interested Leads</span>
        </div>

        {/* 5. Conversion Rate (Pastel Amber) */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-amber-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-base">↗️</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">{stats.conversionRate}</span>
          </div>
          <span className="text-[11px] font-bold text-amber-900 mt-2">Conversion Rate</span>
        </div>

        {/* 6. Total Revenue (Pastel Emerald) */}
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-emerald-800 font-mono truncate">{stats.totalRevenue}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 mt-2">Total Revenue</span>
        </div>

        {/* 7. Expected Revenue (Pastel Rose) */}
        <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-rose-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-rose-800 font-mono truncate">{stats.expectedRevenue}</span>
          </div>
          <span className="text-[11px] font-bold text-rose-900 mt-2">Expected Revenue</span>
        </div>

        {/* 8. Total Incentives (Pastel Teal) */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-teal-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-teal-800 font-mono truncate">{stats.totalIncentives}</span>
          </div>
          <span className="text-[11px] font-bold text-teal-900 mt-2">Total Incentives</span>
        </div>

        {/* 9. Expect. Incentive (Pastel Lavender) */}
        <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-purple-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-purple-800 font-mono truncate">{stats.expectedIncentives}</span>
          </div>
          <span className="text-[11px] font-bold text-purple-900 mt-2">Expect. Incentive</span>
        </div>

      </div>

      {/* ================= 3. FILTER CONTROLS & SEARCH BAR ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          
          {/* Rows Per Page Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600">Show:</span>
            <div className="relative w-20">
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="w-full appearance-none px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {/* Real-time Search */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search Client Name, Phone, Requirement..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-black transition-all placeholder:text-slate-400 font-medium shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
            >
              <option value="All">All Status</option>
              <option value="INTERESTED">Interested</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>

            {/* Lead Type */}
            <select
              value={filterLeadType}
              onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
            >
              <option value="All">All Lead Types</option>
              <option value="FRESH">Fresh</option>
              <option value="REPEAT">Repeat</option>
              <option value="RENEWAL">Renewal</option>
            </select>

            {/* Job Type */}
            <select
              value={filterJobType}
              onChange={(e) => { setFilterJobType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
            >
              <option value="All">All Job Types</option>
              <option value="NEW">New</option>
              <option value="EXISTING">Existing</option>
            </select>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-xs transition-colors"
              title="Reset Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

          </div>

        </div>
      </div>

      {/* ================= 4. MAIN DATA TABLE (Exact Screenshot Columns) ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider select-none border-b border-slate-800">
                <th className="py-3.5 px-3 text-center w-12">
                  <div className="flex items-center justify-center gap-1"><span>S. NO.</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-28">
                  <div className="flex items-center justify-center gap-1"><span>ACTIONS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[170px]">
                  <div className="flex items-center gap-1"><span>CONCERN PERSON</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>STATUS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>NEXT FOLLOW-UP</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>FOLLOW-UP REMARK</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>CREATED DATE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>LEAD AGE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>LEAD LABEL</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>LEAD TYPE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>JOB TYPE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[160px]">
                  <div className="flex items-center gap-1"><span>REQUIREMENT</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1"><span>EXPECTED BUSINESS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>PIN CODE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>LEAD SOURCE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>LEAD BY</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>ASSIGN TO</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[140px]">
                  <div className="flex items-center gap-1"><span>ADDRESS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((item, index) => {
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/90 transition-colors group">
                      
                      {/* 1. S. NO. */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {serialNumber}
                      </td>

                      {/* 2. ACTIONS (2x2 Grid of Square Buttons: Eye, Calendar, Check, Info) */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="grid grid-cols-2 gap-1.5 w-14 mx-auto">
                          
                          {/* 1. Orange Eye Button (View Detail) */}
                          <button
                            type="button"
                            onClick={() => setDetailModalLead(item)}
                            className="w-6 h-6 rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="View Lead Details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* 2. Blue Calendar Button (Schedule Follow-up) */}
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(item)}
                            className="w-6 h-6 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Schedule Follow-up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* 3. Emerald Check Button (Complete Activity) */}
                          <button
                            type="button"
                            onClick={() => setCompleteModalLead(item)}
                            className="w-6 h-6 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Mark Activity Complete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>

                          {/* 4. Purple Info Button (Remarks History) */}
                          <button
                            type="button"
                            onClick={() => setRemarksModalLead(item)}
                            className="w-6 h-6 rounded-lg border border-purple-400 text-purple-600 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="View Follow-up Remarks & History"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>

                        </div>
                      </td>

                      {/* 3. CONCERN PERSON */}
                      <td className="py-3.5 px-3">
                        <div
                          onClick={() => setDetailModalLead(item)}
                          className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 hover:underline leading-tight"
                        >
                          {item.concernPersonName}
                        </div>
                        <div className="text-xs text-slate-600 font-mono font-medium mt-0.5">{item.phoneNumber}</div>
                        <div className="text-xs text-slate-400 truncate max-w-[160px]">{item.emailAddress}</div>
                      </td>

                      {/* 4. STATUS */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* 5. NEXT FOLLOW-UP */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                        <span className={item.nextFollowupDate === "No Schedule" ? "text-slate-400 italic" : "text-emerald-700 font-bold"}>
                          {item.nextFollowupDate}
                        </span>
                      </td>

                      {/* 6. FOLLOW-UP REMARK */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-xs">
                        {item.followupRemarksCount > 0 ? (
                          <button
                            type="button"
                            onClick={() => setRemarksModalLead(item)}
                            className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold hover:bg-blue-100 cursor-pointer shadow-2xs"
                          >
                            {item.followupRemarksCount} Follow-up{item.followupRemarksCount > 1 ? "s" : ""}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">No follow-ups</span>
                        )}
                      </td>

                      {/* 7. CREATED DATE */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="font-semibold text-slate-700 text-xs">{item.createdDate}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.createdTime}</div>
                      </td>

                      {/* 8. LEAD AGE */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-md text-blue-700 bg-blue-50 border border-blue-200 text-xs font-bold italic">
                          {item.leadAge}
                        </span>
                      </td>

                      {/* 9. LEAD LABEL */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getLeadLabelBadgeClass(item.leadLabel)}`}>
                          {item.leadLabel}
                        </span>
                      </td>

                      {/* 10. LEAD TYPE */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-700 text-xs">
                        {item.leadType}
                      </td>

                      {/* 11. JOB TYPE */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.jobType}
                        </span>
                      </td>

                      {/* 12. REQUIREMENT */}
                      <td className="py-3.5 px-3 text-slate-700 max-w-[160px] truncate text-xs" title={item.requirement}>
                        {item.requirement}
                      </td>

                      {/* 13. EXPECTED BUSINESS */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                        ₹{Number(item.expectedBusiness).toLocaleString("en-IN")}
                      </td>

                      {/* 14. PIN CODE */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600 whitespace-nowrap text-xs">
                        {item.pincode}
                      </td>

                      {/* 15. LEAD SOURCE */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-700 uppercase text-xs">
                        {item.leadSource}
                      </td>

                      {/* 16. LEAD BY */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 text-xs">
                        {item.leadBy}
                      </td>

                      {/* 17. ASSIGN TO */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-400 text-xs">
                        {item.assignTo}
                      </td>

                      {/* 18. ADDRESS */}
                      <td className="py-3.5 px-3 text-slate-600 truncate max-w-[140px] text-xs" title={item.address}>
                        {item.address}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400">
                    <div className="text-2xl mb-1">📋</div>
                    <div className="font-bold text-slate-700 text-sm">No leads found in this sheet</div>
                    <div className="text-xs text-slate-400 mt-0.5">Try changing or resetting your search filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 5. PAGINATION BAR ================= */}
        {filteredLeads.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm bg-slate-50/50">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredLeads.length)}</span> of <span className="font-bold text-slate-900">{filteredLeads.length}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                Previous
              </button>

              <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold shadow-xs">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 cursor-pointer transition-colors shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL 1: SCHEDULE FOLLOW-UP MODAL ================= */}
      {scheduleModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">📅</span>
                  <h3 className="text-sm sm:text-base font-black tracking-wider uppercase">
                    SCHEDULE FOLLOW-UP
                  </h3>
                </div>
                <div className="text-xs text-slate-300 font-medium mt-1">
                  Client: <span className="text-white font-bold">{scheduleModalLead.concernPersonName}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setScheduleModalLead(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Date*</label>
                    <input
                      type="date"
                      value={scheduleFormData.date}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Time*</label>
                    <select
                      value={scheduleFormData.time}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                      required
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Assigned To*</label>
                  <select
                    value={scheduleFormData.assignedTo}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                    required
                  >
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Reminder:</span>
                    <button
                      type="button"
                      onClick={() => setScheduleFormData({ ...scheduleFormData, reminder: !scheduleFormData.reminder })}
                      className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        scheduleFormData.reminder
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      [{scheduleFormData.reminder ? "ON" : "OFF"}]
                    </button>
                    <span className="text-xs text-slate-600 font-medium">
                      {scheduleFormData.reminderHours || 24} hours before
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Discussion Notes*</label>
                  <textarea
                    rows={3}
                    placeholder="Enter discussion notes, call objective, quotation details..."
                    value={scheduleFormData.notes}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-black shadow-2xs"
                    required
                  />
                  {scheduleFormErrors.notes && (
                    <div className="text-rose-500 text-[10px] mt-0.5">{scheduleFormErrors.notes}</div>
                  )}
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold transition-all shadow-md cursor-pointer"
                >
                  Schedule Follow-up
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: REMARKS HISTORY MODAL ================= */}
      {remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>ℹ️</span> Follow-up Remarks & History
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Client: {remarksModalLead.concernPersonName} ({remarksModalLead.phoneNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarksModalLead(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {remarksModalLead.followupHistory && remarksModalLead.followupHistory.length > 0 ? (
                  remarksModalLead.followupHistory.map((hist, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">📅 {hist.date} at {hist.time}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {hist.status || "Logged"}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs">{hist.notes}</p>
                      <div className="text-[10px] text-slate-400">
                        Follow-up by: <span className="font-semibold text-slate-600">{hist.rep || "Sales Rep"}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No past follow-up remarks recorded for this lead.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const l = remarksModalLead;
                    setRemarksModalLead(null);
                    handleOpenScheduleModal(l);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  + Schedule Next
                </button>
                <button
                  type="button"
                  onClick={() => setRemarksModalLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 3: LEAD DETAIL MODAL ================= */}
      {detailModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{detailModalLead.concernPersonName}</h3>
                <p className="text-xs text-slate-300">Lead ID: {detailModalLead.id} • {detailModalLead.leadSource}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLead(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{detailModalLead.phoneNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                  <div className="font-medium text-slate-900 mt-0.5 truncate">{detailModalLead.emailAddress}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Expected Business</span>
                  <div className="font-bold text-emerald-600 mt-0.5">₹{Number(detailModalLead.expectedBusiness).toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pincode & Address</span>
                  <div className="font-medium text-slate-900 mt-0.5">{detailModalLead.pincode} • {detailModalLead.address}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Requirement:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                  {detailModalLead.requirement}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const l = detailModalLead;
                    setDetailModalLead(null);
                    handleOpenScheduleModal(l);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  + Schedule Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModalLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 4: COMPLETE ACTIVITY MODAL ================= */}
      {completeModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mark Lead as Converted</h3>
            <p className="text-slate-600 mb-4">
              Mark deal converted for <span className="font-bold text-slate-800">{completeModalLead.concernPersonName}</span>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompleteModalLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = leads.map((l) =>
                    l.id === completeModalLead.id ? { ...l, status: "CONVERTED" } : l
                  );
                  saveLeads(updated);
                  setCompleteModalLead(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Confirm Converted
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lead;