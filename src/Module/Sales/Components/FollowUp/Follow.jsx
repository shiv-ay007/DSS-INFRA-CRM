import React, { useState, useMemo } from "react";

/**
 * Feature ID: LM-F-04
 * Component: Follow (Scheduled Leads Sheet)
 * Exact design replica of the DSS CRM Scheduled Leads Sheet screenshot & specification.
 * 
 * Features:
 * - Top header with Back arrow (←) & "!! Scheduled Leads Sheet !!"
 * - Rows per page selection (10, 25, 50, 100)
 * - Filter controls: Lead Type, Lead Source, Lead Status, Lead Label, Date Range & Orange Reset Button (🔄)
 * - Solid Black Table Header with Sort Indicators:
 *   S. NO. | ACTIONS | CONCERN PERSON | NEXT FOLLOW-UP | FOLLOW-UP REMARK | CREATED DATE | LEAD AGE | STATUS | LEAD LABEL | LEAD TYPE | REQUIREMENT | EXPECTED BUSINESS | PIN CODE | LEAD SOURCE | LEAD BY | ASSIGN TO | ADDRESS
 * - 2x2 Action Button Grid in Table (View 👁️, Remarks Info ℹ️, Complete/WhatsApp 💬, Schedule 📅)
 * - Follow-up Remarks Pill ("2 Follow-ups", "1 Follow-up", etc.) - click to open chronological logs
 * - Color Coded Next Follow-up:
 *   - Today: Green
 *   - Tomorrow: Yellow
 *   - Overdue: Red
 *   - Completed: Grey
 * - Schedule Follow-up Modal matching the exact ASCII wireframe layout
 * - Lead Detail & Complete Modals
 */

// Helper to get formatted date string (YYYY-MM-DD)
const getOffsetDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Available Team Members for assignment
const teamMembers = [
  "Sales TL",
  "John (Sales TL)",
  "Sanjay Srivastava",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel"
];

// Time Options for time picker dropdown
const timeOptions = [
  "09:00 am",
  "09:30 am",
  "10:00 am",
  "10:30 am",
  "11:00 am",
  "11:30 am",
  "12:00 pm",
  "12:30 pm",
  "02:00 pm",
  "02:30 pm",
  "03:00 pm",
  "03:30 pm",
  "04:00 pm",
  "04:30 pm",
  "05:00 pm",
  "05:30 pm",
  "06:00 pm"
];

// Filter Dropdown Options
const leadTypeOptions = ["Lead Type", "FRESH", "EXISTING CLIENT", "RENEWAL", "REPEAT"];
const leadSourceOptions = ["Lead Source", "WHATSAPP", "JUSTDIAL", "EMAIL", "FACEBOOK", "DIRECT INBOUND", "WEBSITE"];
const leadStatusOptions = ["Lead Status", "INTERESTED", "LOST", "REASSIGNED (LOST)", "CONVERTED", "FOLLOW UP"];
const leadLabelOptions = ["Lead Label", "HOT", "WARM", "COLD", "UNTOUCHED"];
const timeRangeOptions = ["All Time", "Today", "Tomorrow", "This Week", "Overdue", "This Month"];

// Initial dataset matching screenshot rows exactly
const initialScheduledLeads = [
  {
    id: "LD-SCH-01",
    concernPersonName: "notification test",
    phoneNumber: "9876544567",
    emailAddress: "hi@gmail.com",
    nextFollowupDate: "22 Jun 2026",
    nextFollowupDateRaw: getOffsetDateString(-2),
    nextFollowupTime: "12:00 pm",
    channelType: "SMS",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "22 Jun 2026", time: "12:00 pm", notes: "Sent quotation SMS and brochure link for P2.5 outdoor display.", rep: "Sales TL", status: "Overdue" },
      { date: "16 Jun 2026", time: "05:37 pm", notes: "Initial requirement discussion on phone.", rep: "Sales TL", status: "Completed" }
    ],
    createdDate: "16 Jun 2026",
    createdTime: "05:37 pm",
    leadAge: "64 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "fghjkl",
    expectedBusiness: "3000",
    pincode: "273001",
    leadSource: "WHATSAPP",
    leadBy: "Sales TL",
    assignTo: "--",
    address: "--",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-02",
    concernPersonName: "notification test",
    phoneNumber: "9876544434",
    emailAddress: "hi@gmail.com",
    nextFollowupDate: "27 Jun 2026",
    nextFollowupDateRaw: getOffsetDateString(-1),
    nextFollowupTime: "05:35 pm",
    channelType: "+2>",
    followupRemarksCount: 2,
    followupHistory: [
      { date: "27 Jun 2026", time: "05:35 pm", notes: "Follow-up regarding technical specification review.", rep: "Sales TL", status: "Overdue" },
      { date: "16 Jun 2026", time: "06:35 pm", notes: "Client requested quotation for 3 kiosks.", rep: "Sales TL", status: "Completed" }
    ],
    createdDate: "16 Jun 2026",
    createdTime: "06:35 pm",
    leadAge: "64 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "fghjkl",
    expectedBusiness: "3000",
    pincode: "273001",
    leadSource: "WHATSAPP",
    leadBy: "Sales TL",
    assignTo: "--",
    address: "--",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-03",
    concernPersonName: "client 23 april",
    phoneNumber: "9876540000",
    emailAddress: "uytuu@gmail.com",
    nextFollowupDate: "24 Apr 2026",
    nextFollowupDateRaw: getOffsetDateString(0),
    nextFollowupTime: "06:32 pm",
    channelType: "Whatsapp",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "24 Apr 2026", time: "06:32 pm", notes: "WhatsApp catalog shared. Awaiting confirmation on site visit.", rep: "Sales TL", status: "Today" }
    ],
    createdDate: "23 Apr 2026",
    createdTime: "06:30 pm",
    leadAge: "118 Days",
    status: "INTERESTED",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "Sed nosclunt quo ea",
    expectedBusiness: "2100",
    pincode: "273001",
    leadSource: "JUSTDIAL",
    leadBy: "Sales TL",
    assignTo: "--",
    address: "dsuf kjlsdufjksd jn jk",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-04",
    concernPersonName: "Mr. Suresh kumar",
    phoneNumber: "0120984483",
    emailAddress: "accessauthority.business@gmail.com",
    nextFollowupDate: "11 Apr 2026",
    nextFollowupDateRaw: getOffsetDateString(0),
    nextFollowupTime: "02:20 pm",
    channelType: "call",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "11 Apr 2026", time: "02:20 pm", notes: "Called for price negotiation on signage display boards.", rep: "Sales", status: "Today" }
    ],
    createdDate: "10 Apr 2026",
    createdTime: "02:19 pm",
    leadAge: "131 Days",
    status: "reassigned (Lost)",
    leadLabel: "HOT",
    leadType: "FRESH",
    requirement: "Need some signages",
    expectedBusiness: "84000",
    pincode: "274001",
    leadSource: "EMAIL",
    leadBy: "Sales",
    assignTo: "--",
    address: "Deoria, UP India",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-05",
    concernPersonName: "bglfgubjk",
    phoneNumber: "9876503210",
    emailAddress: "skumari57003@gmail.com",
    nextFollowupDate: "20 Mar 2026",
    nextFollowupDateRaw: getOffsetDateString(1),
    nextFollowupTime: "10:00 am",
    channelType: "Whatsapp",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "20 Mar 2026", time: "10:00 am", notes: "Share revised rate list over WhatsApp.", rep: "Sales", status: "Tomorrow" }
    ],
    createdDate: "19 Mar 2026",
    createdTime: "05:56 pm",
    leadAge: "153 Days",
    status: "INTERESTED",
    leadLabel: "COLD",
    leadType: "FRESH",
    requirement: "Temporibus natus aspd...",
    expectedBusiness: "253",
    pincode: "224141",
    leadSource: "WHATSAPP",
    leadBy: "Sales",
    assignTo: "--",
    address: "r3stfffo",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-06",
    concernPersonName: "Mr. New singh",
    phoneNumber: "0000000000",
    emailAddress: "hr@dssup.in",
    nextFollowupDate: "18 Mar 2026",
    nextFollowupDateRaw: getOffsetDateString(1),
    nextFollowupTime: "05:17 pm",
    channelType: "call",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "18 Mar 2026", time: "05:17 pm", notes: "Discussion on commercial signage installation schedule.", rep: "Sales", status: "Tomorrow" }
    ],
    createdDate: "18 Mar 2026",
    createdTime: "12:46 pm",
    leadAge: "154 Days",
    status: "INTERESTED",
    leadLabel: "WARM",
    leadType: "FRESH",
    requirement: "One Signage please",
    expectedBusiness: "590000",
    pincode: "274401",
    leadSource: "FACEBOOK",
    leadBy: "Sales",
    assignTo: "--",
    address: "New address",
    reminder: true,
    reminderHours: 24
  },
  {
    id: "LD-SCH-07",
    concernPersonName: "Sales Exec Test user",
    phoneNumber: "9233334442",
    emailAddress: "sales.test@dss.in",
    nextFollowupDate: "18 Mar 2026",
    nextFollowupDateRaw: getOffsetDateString(4),
    nextFollowupTime: "12:10 pm",
    channelType: "call",
    followupRemarksCount: 1,
    followupHistory: [
      { date: "18 Mar 2026", time: "12:10 pm", notes: "Demonstration call scheduled for repeat order.", rep: "Sales TL", status: "Completed" }
    ],
    createdDate: "14 Mar 2026",
    createdTime: "11:20 am",
    leadAge: "158 Days",
    status: "INTERESTED",
    leadLabel: "UNTOUCHED",
    leadType: "REPEAT",
    requirement: "Quis eligendi ea rer...",
    expectedBusiness: "38899",
    pincode: "901234",
    leadSource: "WHATSAPP",
    leadBy: "Sales TL",
    assignTo: "--",
    address: "--",
    reminder: true,
    reminderHours: 24
  }
];

const Follow = () => {
  // State for all scheduled leads
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("dss_scheduled_leads_sheet");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialScheduledLeads;
  });

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_scheduled_leads_sheet", JSON.stringify(newLeads));
    } catch (e) {}
  };

  // Filter States
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterLeadType, setFilterLeadType] = useState("Lead Type");
  const [filterLeadSource, setFilterLeadSource] = useState("Lead Source");
  const [filterLeadStatus, setFilterLeadStatus] = useState("Lead Status");
  const [filterLeadLabel, setFilterLeadLabel] = useState("Lead Label");
  const [filterTimeRange, setFilterTimeRange] = useState("All Time");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals States
  const [scheduleModalLead, setScheduleModalLead] = useState(null); // Opens Wireframe Schedule Modal
  const [remarksModalLead, setRemarksModalLead] = useState(null); // Opens Follow-up Remarks History Modal
  const [detailModalLead, setDetailModalLead] = useState(null); // Opens Lead Detail Modal
  const [completeModalLead, setCompleteModalLead] = useState(null); // Opens Mark Complete Modal

  // Schedule Modal Form State (Matching exact Wireframe specifications)
  const defaultScheduleForm = {
    date: getOffsetDateString(1), // Default: Tomorrow
    time: "10:00 am", // Default: 10:00 AM
    assignedTo: "John (Sales TL)", // Default: Current User
    reminder: true, // Default: ON
    reminderHours: 24, // Default: 24 hours before
    notes: "" // Required
  };
  const [scheduleFormData, setScheduleFormData] = useState(defaultScheduleForm);
  const [scheduleFormErrors, setScheduleFormErrors] = useState({});

  // Reset Filters Handler
  const handleResetFilters = () => {
    setFilterLeadType("Lead Type");
    setFilterLeadSource("Lead Source");
    setFilterLeadStatus("Lead Status");
    setFilterLeadLabel("Lead Label");
    setFilterTimeRange("All Time");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Classification for Next Followup Color Coding
  const todayStr = getOffsetDateString(0);
  const tomorrowStr = getOffsetDateString(1);

  const getFollowupCategory = (item) => {
    if (item.status === "CONVERTED" || item.status === "COMPLETED") return "completed";
    if (item.nextFollowupDateRaw < todayStr) return "overdue";
    if (item.nextFollowupDateRaw === todayStr) return "today";
    if (item.nextFollowupDateRaw === tomorrowStr) return "tomorrow";
    return "upcoming";
  };

  // Color Coding Text Helper for Next Followup Column
  const getFollowupColorClass = (item) => {
    const cat = getFollowupCategory(item);
    if (cat === "overdue") return "text-red-500 font-bold"; // Overdue: Red
    if (cat === "today") return "text-emerald-600 font-bold"; // Today: Green
    if (cat === "tomorrow") return "text-amber-500 font-bold"; // Tomorrow: Yellow
    if (cat === "completed") return "text-slate-400 font-medium"; // Completed: Grey
    return "text-red-500 font-bold"; // Default red as in screenshot
  };

  // Status Badge Class Helper
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("INTERESTED")) return "text-emerald-700 bg-emerald-50 border border-emerald-300";
    if (s.includes("LOST")) return "text-slate-600 bg-slate-100 border border-slate-300";
    if (s.includes("CONVERTED")) return "text-blue-700 bg-blue-50 border border-blue-300";
    return "text-emerald-700 bg-emerald-50 border border-emerald-300";
  };

  // Lead Label Badge Class Helper
  const getLeadLabelBadgeClass = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "HOT") return "text-red-600 bg-red-50 border border-red-200 font-bold";
    if (l === "WARM") return "text-amber-600 bg-amber-50 border border-amber-200 font-bold";
    if (l === "COLD") return "text-sky-600 bg-sky-50 border border-sky-200 font-bold";
    return "text-purple-600 bg-purple-50 border border-purple-200 font-bold";
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterLeadType !== "Lead Type" && lead.leadType !== filterLeadType) return false;
      if (filterLeadSource !== "Lead Source" && lead.leadSource !== filterLeadSource) return false;
      if (filterLeadStatus !== "Lead Status" && lead.status !== filterLeadStatus) return false;
      if (filterLeadLabel !== "Lead Label" && lead.leadLabel !== filterLeadLabel) return false;

      // Time Range Filter
      const cat = getFollowupCategory(lead);
      if (filterTimeRange === "Today" && cat !== "today") return false;
      if (filterTimeRange === "Tomorrow" && cat !== "tomorrow") return false;
      if (filterTimeRange === "Overdue" && cat !== "overdue") return false;

      // Search Box
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          (lead.concernPersonName || "").toLowerCase().includes(q) ||
          (lead.phoneNumber || "").includes(q) ||
          (lead.emailAddress || "").toLowerCase().includes(q) ||
          (lead.requirement || "").toLowerCase().includes(q) ||
          (lead.address || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [leads, filterLeadType, filterLeadSource, filterLeadStatus, filterLeadLabel, filterTimeRange, searchTerm]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  // Open Schedule Modal for a lead
  const handleOpenScheduleModal = (lead) => {
    setScheduleModalLead(lead);
    setScheduleFormData({
      date: getOffsetDateString(1),
      time: "10:00 am",
      assignedTo: lead.assignTo !== "--" ? lead.assignTo : "John (Sales TL)",
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

    const updated = leads.map((l) =>
      l.id === scheduleModalLead.id
        ? {
            ...l,
            nextFollowupDate: formattedDisplayDate,
            nextFollowupDateRaw: scheduleFormData.date,
            nextFollowupTime: scheduleFormData.time,
            assignTo: scheduleFormData.assignedTo,
            reminder: scheduleFormData.reminder,
            reminderHours: scheduleFormData.reminderHours,
            followupRemarksCount: (l.followupRemarksCount || 0) + 1,
            followupHistory: [newHistoryEntry, ...(l.followupHistory || [])]
          }
        : l
    );

    saveLeads(updated);
    setScheduleModalLead(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 p-3 sm:p-5 select-none pb-12">
      
      {/* ================= 1. TOP HEADER ================= */}
      <div className="w-full bg-gradient-to-r from-amber-50 via-orange-50/30 to-white rounded-2xl border border-amber-200/80 shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => window.history.back?.()}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>Scheduled Leads & Follow-ups</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono">
                Daily Calls
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              View upcoming, today's and overdue customer follow-ups and log activity notes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs sm:text-sm font-bold text-slate-700">
            Total: <span className="font-mono text-amber-700 font-black">{filteredLeads.length}</span> Scheduled
          </span>
        </div>
      </div>

      {/* ================= 2. FILTER CONTROLS TOOLBAR ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 mb-5 space-y-3.5">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Dropdown 1: Lead Type */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={filterLeadType}
              onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
            >
              {leadTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 2: Lead Source */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={filterLeadSource}
              onChange={(e) => { setFilterLeadSource(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
            >
              {leadSourceOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 3: Lead Status */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={filterLeadStatus}
              onChange={(e) => { setFilterLeadStatus(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
            >
              {leadStatusOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 4: Lead Label */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={filterLeadLabel}
              onChange={(e) => { setFilterLeadLabel(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
            >
              {leadLabelOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 5: Time Range Filter (All Time) */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <select
              value={filterTimeRange}
              onChange={(e) => { setFilterTimeRange(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
            >
              {timeRangeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Bright Orange Refresh / Reset Button */}
          <button
            type="button"
            onClick={handleResetFilters}
            className="h-10 px-4 rounded-xl bg-[#F95700] hover:bg-[#E04F00] text-white flex items-center gap-2 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer shrink-0"
            title="Reset All Filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>

        </div>
      </div>

      {/* ================= 4. DATA TABLE (Exact Screenshot Columns & Row Design) ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300">
          <table className="w-full text-left border-collapse text-xs">
            
            {/* Solid Black Header Row */}
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
                <th className="py-3.5 px-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1"><span>NEXT FOLLOW-UP</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>FOLLOW-UP REMARK</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1"><span>CREATED DATE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>LEAD AGE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>STATUS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>LEAD LABEL</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>LEAD TYPE</span><span className="text-[10px] text-slate-400">↕</span></div>
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

            {/* Table Body Rows */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((item, index) => {
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;
                  const followupColorClass = getFollowupColorClass(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/90 transition-colors group">
                      
                      {/* 1. S. NO. */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {serialNumber}
                      </td>

                      {/* 2. ACTIONS (2x2 Grid of Square Buttons: Eye, Info, Message, Calendar) */}
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

                          {/* 2. Purple Info Button (Follow-up Remarks History) */}
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

                          {/* 3. Blue/Green Check or Message Button */}
                          <button
                            type="button"
                            onClick={() => setCompleteModalLead(item)}
                            className="w-6 h-6 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Mark Follow-up Complete / Log Activity"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>

                          {/* 4. Blue Calendar Button (Opens ASCII Schedule Follow-up Modal) */}
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleModal(item)}
                            className="w-6 h-6 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                            title="Schedule / Reschedule Follow-up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </button>

                        </div>
                      </td>

                      {/* 3. CONCERN PERSON (Name, Phone, Email) */}
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

                      {/* 4. NEXT FOLLOW-UP (Red/Green Date, Time, Channel) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className={`text-[11px] ${followupColorClass}`}>
                          {item.nextFollowupDate}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.nextFollowupTime}
                        </div>
                        <div className="text-[10px] text-blue-500 font-semibold cursor-pointer hover:underline">
                          {item.channelType}
                        </div>
                      </td>

                      {/* 5. FOLLOW-UP REMARK (Light Blue Pill Button) */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setRemarksModalLead(item)}
                          className="px-3 py-1 rounded-full bg-blue-50/90 text-blue-600 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
                        >
                          {item.followupRemarksCount} Follow-up{item.followupRemarksCount > 1 ? "s" : ""}
                        </button>
                      </td>

                      {/* 6. CREATED DATE */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="font-semibold text-slate-700 text-[11px]">{item.createdDate}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.createdTime}</div>
                      </td>

                      {/* 7. LEAD AGE */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded text-blue-600 bg-blue-50/70 border border-blue-200 text-xs font-semibold italic">
                          {item.leadAge}
                        </span>
                      </td>

                      {/* 8. STATUS */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide ${getStatusBadgeClass(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* 9. LEAD LABEL */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase ${getLeadLabelBadgeClass(item.leadLabel)}`}>
                          {item.leadLabel}
                        </span>
                      </td>

                      {/* 10. LEAD TYPE */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700">
                        {item.leadType}
                      </td>

                      {/* 11. REQUIREMENT */}
                      <td className="py-3 px-3 text-slate-600 max-w-[160px] truncate" title={item.requirement}>
                        {item.requirement}
                      </td>

                      {/* 12. EXPECTED BUSINESS */}
                      <td className="py-3 px-3 text-right font-mono font-medium text-slate-800 whitespace-nowrap">
                        {item.expectedBusiness}
                      </td>

                      {/* 13. PIN CODE */}
                      <td className="py-3 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                        {item.pincode}
                      </td>

                      {/* 14. LEAD SOURCE */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-700 uppercase">
                        {item.leadSource}
                      </td>

                      {/* 15. LEAD BY */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                        {item.leadBy}
                      </td>

                      {/* 16. ASSIGN TO */}
                      <td className="py-3 px-3 text-center whitespace-nowrap text-slate-400">
                        {item.assignTo}
                      </td>

                      {/* 17. ADDRESS */}
                      <td className="py-3 px-3 text-slate-600 truncate max-w-[140px]" title={item.address}>
                        {item.address}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-400">
                    <div className="text-xl mb-1">📋</div>
                    <div className="font-bold text-slate-700 text-xs">No scheduled leads found</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Try clearing or changing your filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 5. PAGINATION BAR ================= */}
        {filteredLeads.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
            <div className="text-slate-500 font-medium">
              Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredLeads.length)} of {filteredLeads.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Previous
              </button>

              <button
                type="button"
                className="w-8 h-8 rounded-lg bg-black text-white font-bold cursor-pointer"
              >
                {currentPage}
              </button>

              <button
                type="button"
                disabled={currentPage * rowsPerPage >= filteredLeads.length}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-slate-700 cursor-pointer transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SCHEDULE FOLLOW-UP (EXACT ASCII WIREFRAME SPECIFICATION)         */}
      {/* ┌─────────────────────────────────────────────────────────────┐           */}
      {/* │  ✕ SCHEDULE FOLLOW-UP                           [X]       │           */}
      {/* │  Client: Sanjay Srivastava                                │           */}
      {/* │                                                             │           */}
      {/* │  ┌─────────────────────────────────────────────────────┐  │           */}
      {/* │  │ Date* [25/08/2026]   Time* [10:00 ▼]              │  │           */}
      {/* │  │ Assigned To* [John ▼]                              │  │           */}
      {/* │  │ Reminder: [ON] 24 hours before                     │  │           */}
      {/* │  │ Notes* [_________________________________________] │  │           */}
      {/* │  │        [_________________________________________] │  │           */}
      {/* │  └─────────────────────────────────────────────────────┘  │           */}
      {/* │                                                             │           */}
      {/* │                                 [Cancel] [Schedule]        │           */}
      {/* └─────────────────────────────────────────────────────────────┘           */}
      {/* ========================================================================= */}
      {scheduleModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Top Header with ✕ SCHEDULE FOLLOW-UP and [X] */}
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✕</span>
                  <h3 className="text-sm sm:text-base font-black tracking-wider uppercase">
                    SCHEDULE FOLLOW-UP
                  </h3>
                </div>
                <div className="text-xs text-neutral-300 font-medium mt-1">
                  Client: <span className="text-white font-bold">{scheduleModalLead.concernPersonName}</span>
                </div>
              </div>

              {/* [X] Close Button */}
              <button
                type="button"
                onClick={() => setScheduleModalLead(null)}
                className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors border border-neutral-700"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Inner Bordered Form Container */}
            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-xs">
              
              <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 sm:p-5 space-y-4 shadow-2xs">
                
                {/* Date* and Time* Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Date*
                    </label>
                    <input
                      type="date"
                      value={scheduleFormData.date}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Default: Tomorrow</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Time* <span className="text-slate-400 font-normal">[{scheduleFormData.time} ▼]</span>
                    </label>
                    <select
                      value={scheduleFormData.time}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                      required
                    >
                      {timeOptions.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Default: 10:00 am</span>
                  </div>
                </div>

                {/* Assigned To* Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Assigned To* <span className="text-slate-400 font-normal">[{scheduleFormData.assignedTo} ▼]</span>
                  </label>
                  <select
                    value={scheduleFormData.assignedTo}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-black cursor-pointer shadow-2xs"
                    required
                  >
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Default: Current User</span>
                </div>

                {/* Reminder: [ON] 24 hours before */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Reminder:</span>
                    
                    {/* Toggle Switch [ON/OFF] */}
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

                  {scheduleFormData.reminder && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <span>Hours:</span>
                      <input
                        type="number"
                        min={1}
                        max={72}
                        value={scheduleFormData.reminderHours}
                        onChange={(e) => setScheduleFormData({ ...scheduleFormData, reminderHours: Number(e.target.value) })}
                        className="w-14 px-1.5 py-0.5 rounded border border-slate-300 text-center font-bold text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Notes* Text Area */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Notes*
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter discussion notes, call objective, quotation details..."
                    value={scheduleFormData.notes}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-900 focus:outline-hidden focus:border-black shadow-2xs"
                    required
                  />
                  {scheduleFormErrors.notes && (
                    <div className="text-red-500 text-[10px] mt-0.5">{scheduleFormErrors.notes}</div>
                  )}
                </div>

              </div>

              {/* Modal Footer: [Cancel] [Schedule] */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  [Cancel]
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-98"
                >
                  [Schedule]
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: FOLLOW-UP REMARKS & HISTORY MODAL ================= */}
      {remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <span>ℹ️</span> Follow-up Remarks & History
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Client: {remarksModalLead.concernPersonName} ({remarksModalLead.phoneNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarksModalLead(null)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              
              <div className="space-y-3">
                {remarksModalLead.followupHistory && remarksModalLead.followupHistory.length > 0 ? (
                  remarksModalLead.followupHistory.map((hist, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          📅 {hist.date} at {hist.time}
                        </span>
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
                  <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No past follow-up remarks recorded for this lead.
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const lead = remarksModalLead;
                    setRemarksModalLead(null);
                    handleOpenScheduleModal(lead);
                  }}
                  className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs"
                >
                  + Schedule Next Follow-up
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
            
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{detailModalLead.concernPersonName}</h3>
                <p className="text-xs text-neutral-400">Lead ID: {detailModalLead.id} • {detailModalLead.leadSource}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLead(null)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
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
                  <div className="font-bold text-emerald-600 mt-0.5">₹{detailModalLead.expectedBusiness}</div>
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
                    const lead = detailModalLead;
                    setDetailModalLead(null);
                    handleOpenScheduleModal(lead);
                  }}
                  className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs"
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

      {/* ================= MODAL 4: COMPLETE FOLLOW-UP MODAL ================= */}
      {completeModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mark Activity Complete</h3>
            <p className="text-slate-500 mb-4">
              Mark follow-up completed for <span className="font-bold text-slate-800">{completeModalLead.concernPersonName}</span>.
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
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Follow;