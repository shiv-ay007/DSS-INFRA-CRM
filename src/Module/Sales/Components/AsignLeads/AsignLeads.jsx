import React, { useState, useMemo } from "react";

// Initial Mock Dataset (Matching Screenshot & AddLead Form Fields)
const initialAssignedLeads = [
  {
    id: "LD-2026-01",
    concernPersonName: "client 18 aug for recce flow change testing",
    clientDesignation: "Project Coordinator",
    clientType: "Corporate / Enterprise",
    phoneNumber: "9876788789",
    alternateNumber: "9876700001",
    whatsAppNumber: "9876788789",
    emailAddress: "client.testing@enterprise.in",
    leadSource: "Direct Call / Inbound",
    channel: "Sales",
    leadType: "FRESH",
    jobType: "NEW",
    leadLabel: "Hot Lead 🔥",
    leadStatus: "INTERESTED",
    createdDate: "18/8/2026, 11:17:29 am",
    timestamp: new Date("2026-08-18T11:17:29").getTime(),
    leadAge: "0 Days",
    assignedTo: "Sales TL (Self)",
    assignedType: "self",
    assignedDate: "18/8/2026, 11:30:00 am",
    pincode: "201301",
    city: "Noida",
    state: "Uttar Pradesh",
    expectedBusinessAmount: "1500000",
    googleLocation: "https://maps.google.com/?q=Noida+Sector+62",
    remarks: "Recce flow change testing required for 12x8 ft LED Display video wall."
  },
  {
    id: "LD-2026-02",
    concernPersonName: "Andrew Conrad",
    clientDesignation: "Procurement Head",
    clientType: "Retail Store / Chain",
    phoneNumber: "7285093740",
    alternateNumber: "",
    whatsAppNumber: "7285093740",
    emailAddress: "andrew.conrad@retailchain.com",
    leadSource: "Website Inquiry",
    channel: "Marketing",
    leadType: "EXISTING CLIENT",
    jobType: "EXPANSION",
    leadLabel: "Warm Lead ⚡",
    leadStatus: "INTERESTED",
    createdDate: "7/8/2026, 3:08:08 pm",
    timestamp: new Date("2026-08-07T15:08:08").getTime(),
    leadAge: "11 Days",
    assignedTo: "Rahul Sharma",
    assignedType: "team",
    assignedDate: "7/8/2026, 3:30:00 pm",
    pincode: "110001",
    city: "Delhi NCR",
    state: "Delhi NCR",
    expectedBusinessAmount: "850000",
    googleLocation: "https://maps.google.com/?q=Connaught+Place",
    remarks: "55-inch interactive touch kiosks for multi-floor showroom lobby."
  },
  {
    id: "LD-2026-03",
    concernPersonName: "quotation client",
    clientDesignation: "Director",
    clientType: "Individual",
    phoneNumber: "8745962310",
    alternateNumber: "8745900000",
    whatsAppNumber: "8745962310",
    emailAddress: "quotation.client@gmail.com",
    leadSource: "Client Referral",
    channel: "Partner / Referral",
    leadType: "FRESH",
    jobType: "NEW",
    leadLabel: "Hot Lead 🔥",
    leadStatus: "INTERESTED",
    createdDate: "16/7/2026, 12:25:39 pm",
    timestamp: new Date("2026-07-16T12:25:39").getTime(),
    leadAge: "33 Days",
    assignedTo: "Sales TL (Self)",
    assignedType: "self",
    assignedDate: "16/7/2026, 12:45:00 pm",
    pincode: "122002",
    city: "Gurugram",
    state: "Haryana",
    expectedBusinessAmount: "620000",
    googleLocation: "https://maps.google.com/?q=Cyber+City+Gurugram",
    remarks: "Quotation sent. Awaiting management review for outdoor P6 display."
  },
  {
    id: "LD-2026-04",
    concernPersonName: "Kay Browning",
    clientDesignation: "Operations Manager",
    clientType: "Corporate / Enterprise",
    phoneNumber: "6199704512",
    alternateNumber: "",
    whatsAppNumber: "6199704512",
    emailAddress: "kay.browning@enterprise.org",
    leadSource: "Exhibition / Trade Fair",
    channel: "Direct Channel",
    leadType: "RENEWAL",
    jobType: "REPAIR / AMC",
    leadLabel: "Warm Lead ⚡",
    leadStatus: "INTERESTED",
    createdDate: "25/6/2026, 12:12:05 pm",
    timestamp: new Date("2026-06-25T12:12:05").getTime(),
    leadAge: "54 Days",
    assignedTo: "Pooja Verma",
    assignedType: "team",
    assignedDate: "25/6/2026, 01:00:00 pm",
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
    expectedBusinessAmount: "450000",
    googleLocation: "https://maps.google.com/?q=BKC+Mumbai",
    remarks: "1-year annual maintenance contract renewal and controller firmware upgrade."
  },
  {
    id: "LD-2026-05",
    concernPersonName: "Vikram Malhotra",
    clientDesignation: "VP Infrastructure",
    clientType: "Corporate / Enterprise",
    phoneNumber: "9765432109",
    alternateNumber: "9765400000",
    whatsAppNumber: "9765432109",
    emailAddress: "vikram.m@dlf.in",
    leadSource: "Direct Call / Inbound",
    channel: "Sales",
    leadType: "FRESH",
    jobType: "NEW",
    leadLabel: "Hot Lead 🔥",
    leadStatus: "HOT",
    createdDate: "10/6/2026, 10:45:10 am",
    timestamp: new Date("2026-06-10T10:45:10").getTime(),
    leadAge: "69 Days",
    assignedTo: "Sales TL (Self)",
    assignedType: "self",
    assignedDate: "10/6/2026, 11:00:00 am",
    pincode: "122002",
    city: "Gurugram",
    state: "Haryana",
    expectedBusinessAmount: "2800000",
    googleLocation: "https://maps.google.com/?q=DLF+Cybercity",
    remarks: "High priority curved outdoor LED wall for corporate facade."
  },
  {
    id: "LD-2026-06",
    concernPersonName: "PVR INOX Cinemas (Sanjay Roy)",
    clientDesignation: "Marketing Director",
    clientType: "Retail Store / Chain",
    phoneNumber: "9812345678",
    alternateNumber: "",
    whatsAppNumber: "9812345678",
    emailAddress: "sanjay.roy@pvrinox.com",
    leadSource: "Website Inquiry",
    channel: "Marketing",
    leadType: "CROSS-SELL",
    jobType: "UPGRADE",
    leadLabel: "Warm Lead ⚡",
    leadStatus: "WARM",
    createdDate: "1/6/2026, 04:30:22 pm",
    timestamp: new Date("2026-06-01T16:30:22").getTime(),
    leadAge: "78 Days",
    assignedTo: "Ankit Patel",
    assignedType: "team",
    assignedDate: "1/6/2026, 05:00:00 pm",
    pincode: "110020",
    city: "Delhi NCR",
    state: "Delhi NCR",
    expectedBusinessAmount: "950000",
    googleLocation: "https://maps.google.com/?q=Saket+New+Delhi",
    remarks: "Multiplex box-office digital menu board integration and synchronization."
  }
];

// Dropdown options matching Addlead.jsx
const leadTypeOptions = ["Lead Type", "FRESH", "EXISTING CLIENT", "RENEWAL", "CROSS-SELL"];
const leadSourceOptions = [
  "Lead Source",
  "Direct Call / Inbound",
  "WhatsApp Business",
  "Website Inquiry",
  "Client Referral",
  "Exhibition / Trade Fair",
  "Outbound Calling",
  "Social Media"
];
const leadStatusOptions = ["Lead Status", "INTERESTED", "HOT", "WARM", "COLD", "NEW", "CONVERTED", "LOST"];
const leadLabelOptions = ["Lead Label", "Hot Lead 🔥", "Warm Lead ⚡", "Cold Lead ❄️"];
const jobTypeOptions = ["Job Type", "NEW", "REPAIR / AMC", "EXPANSION", "UPGRADE"];
const teamMembers = [
  "Sales TL (Self)",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta",
  "Neha Verma"
];

const AsignLeads = () => {
  // Leads state with LocalStorage support
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("dss_assigned_leads");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialAssignedLeads;
  });

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_assigned_leads", JSON.stringify(newLeads));
    } catch (e) {}
  };

  // Filter States
  const [assignmentTab, setAssignmentTab] = useState("all");
  const [filterLeadType, setFilterLeadType] = useState("Lead Type");
  const [filterLeadSource, setFilterLeadSource] = useState("Lead Source");
  const [filterLeadStatus, setFilterLeadStatus] = useState("Lead Status");
  const [filterLeadLabel, setFilterLeadLabel] = useState("Lead Label");
  const [filterJobType, setFilterJobType] = useState("Job Type");
  const [filterDate, setFilterDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pagination & Sorting States
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modal States
  const [selectedLead, setSelectedLead] = useState(null);
  const [reassignModalLead, setReassignModalLead] = useState(null);
  const [newAssignee, setNewAssignee] = useState("");

  const handleResetFilters = () => {
    setFilterLeadType("Lead Type");
    setFilterLeadSource("Lead Source");
    setFilterLeadStatus("Lead Status");
    setFilterLeadLabel("Lead Label");
    setFilterJobType("Job Type");
    setFilterDate("");
    setAssignmentTab("all");
    setCurrentPage(1);
  };

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (assignmentTab === "self" && lead.assignedType !== "self") return false;
      if (assignmentTab === "team" && lead.assignedType !== "team") return false;
      if (filterLeadType !== "Lead Type" && lead.leadType !== filterLeadType) return false;
      if (filterLeadSource !== "Lead Source" && lead.leadSource !== filterLeadSource) return false;
      if (
        filterLeadStatus !== "Lead Status" &&
        lead.leadStatus?.toUpperCase() !== filterLeadStatus.toUpperCase()
      ) {
        return false;
      }
      if (filterLeadLabel !== "Lead Label" && lead.leadLabel !== filterLeadLabel) return false;
      if (filterJobType !== "Job Type" && lead.jobType !== filterJobType) return false;
      if (filterDate && !(lead.createdDate || "").includes(filterDate)) return false;
      return true;
    });
  }, [
    leads,
    assignmentTab,
    filterLeadType,
    filterLeadSource,
    filterLeadStatus,
    filterLeadLabel,
    filterJobType,
    filterDate
  ]);

  // Sorting Logic
  const sortedLeads = useMemo(() => {
    const data = [...filteredLeads];
    if (sortField) {
      data.sort((a, b) => {
        let valA = a[sortField] || "";
        let valB = b[sortField] || "";
        if (sortField === "leadAge") {
          valA = parseInt(valA, 10) || 0;
          valB = parseInt(valB, 10) || 0;
        } else if (typeof valA === "string") {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [filteredLeads, sortField, sortDirection]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedLeads.slice(start, start + rowsPerPage);
  }, [sortedLeads, currentPage, rowsPerPage]);

  const handleSortToggle = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleConfirmReassign = () => {
    if (!reassignModalLead || !newAssignee) return;
    const isSelf = newAssignee.includes("Self") || newAssignee.includes("TL");
    const updated = leads.map((l) =>
      l.id === reassignModalLead.id
        ? {
            ...l,
            assignedTo: newAssignee,
            assignedType: isSelf ? "self" : "team",
            assignedDate: new Date().toLocaleString("en-IN")
          }
        : l
    );
    saveLeads(updated);
    if (selectedLead && selectedLead.id === reassignModalLead.id) {
      setSelectedLead((prev) => ({
        ...prev,
        assignedTo: newAssignee,
        assignedType: isSelf ? "self" : "team"
      }));
    }
    setReassignModalLead(null);
    setNewAssignee("");
  };

  const getStatusBadgeClass = (status) => {
    const st = status?.toUpperCase() || "";
    if (st.includes("INTERESTED") || st.includes("NEW")) {
      return "bg-emerald-50 text-emerald-600 border border-emerald-300 font-bold";
    }
    if (st.includes("HOT")) return "bg-rose-50 text-rose-600 border border-rose-300 font-bold";
    if (st.includes("WARM")) return "bg-amber-50 text-amber-600 border border-amber-300 font-bold";
    if (st.includes("COLD")) return "bg-blue-50 text-blue-600 border border-blue-300 font-bold";
    if (st.includes("LOST")) return "bg-red-50 text-red-600 border border-red-300 font-bold";
    if (st.includes("CONVERTED")) return "bg-green-600 text-white font-extrabold";
    return "bg-slate-100 text-slate-700 border border-slate-300 font-bold";
  };

  return (
    <div className="space-y-5 font-sans select-none pb-12 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* 1. SUB-HEADER BAR */}
      <div className="w-full bg-gradient-to-r from-blue-50 via-indigo-50/30 to-white rounded-2xl border border-blue-200/80 shadow-xs px-5 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Assigned Leads</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold font-mono">
                Pipeline
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Manage self and team assigned leads, filter by source, status, or re-assign reps.
            </p>
          </div>
        </div>
        <div className="text-xs sm:text-sm text-slate-600 font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          Total: <span className="font-black text-blue-700 font-mono">{filteredLeads.length}</span> Leads
        </div>
      </div>

      {/* 2. TAB BUTTONS (All Assigned | + Self Assigned | 👥 Team Assigned) */}
      <div className="flex justify-center w-full">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 gap-2 shadow-2xs">
          <button
            type="button"
            onClick={() => { setAssignmentTab("all"); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              assignmentTab === "all" ? "bg-slate-900 text-white shadow-md" : "bg-transparent text-slate-700 hover:bg-white/80"
            }`}
          >
            All Assigned ({leads.length})
          </button>

          <button
            type="button"
            onClick={() => { setAssignmentTab("self"); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              assignmentTab === "self" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25" : "bg-transparent text-emerald-800 hover:bg-white/80"
            }`}
          >
            <span className="text-base leading-none font-black">+</span>
            <span>Self Assigned</span>
          </button>

          <button
            type="button"
            onClick={() => { setAssignmentTab("team"); setCurrentPage(1); }}
            className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              assignmentTab === "team" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25" : "bg-transparent text-blue-800 hover:bg-white/80"
            }`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <span>Team Assigned</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER CONTROLS */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Dropdown 1: Lead Type */}
          <div className="relative">
            <select
              value={filterLeadType}
              onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-8 font-semibold shadow-2xs"
            >
              {leadTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 2: Lead Source */}
          <div className="relative">
            <select
              value={filterLeadSource}
              onChange={(e) => { setFilterLeadSource(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-8 font-semibold shadow-2xs"
            >
              {leadSourceOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 3: Lead Status */}
          <div className="relative">
            <select
              value={filterLeadStatus}
              onChange={(e) => { setFilterLeadStatus(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-8 font-semibold shadow-2xs"
            >
              {leadStatusOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 4: Lead Label */}
          <div className="relative">
            <select
              value={filterLeadLabel}
              onChange={(e) => { setFilterLeadLabel(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-8 font-semibold shadow-2xs"
            >
              {leadLabelOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          {/* Dropdown 5: Job Type */}
          <div className="relative">
            <select
              value={filterJobType}
              onChange={(e) => { setFilterJobType(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-8 font-semibold shadow-2xs"
            >
              {jobTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Date Filter & Orange Refresh Button */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative w-56 sm:w-64">
            <input
              type={showDatePicker ? "date" : "text"}
              value={filterDate}
              onFocus={() => setShowDatePicker(true)}
              onBlur={(e) => { if (!e.target.value) setShowDatePicker(false); }}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              placeholder="All Dates"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-9 shadow-2xs font-semibold placeholder:text-slate-700"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="h-10 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs shrink-0"
            title="Reset All Filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* 4. ROWS PER PAGE */}
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm font-bold text-slate-600">Rows per page:</span>
        <div className="relative w-24">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="w-full appearance-none px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
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

      {/* 5. TABLE */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider select-none border-b border-slate-800">
                <th onClick={() => handleSortToggle("id")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 text-center w-16">
                  <div className="flex items-center justify-center gap-1.5"><span>S. NO.</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3.5 text-center whitespace-nowrap w-20">
                  <div className="flex items-center justify-center gap-1.5"><span>ACTIONS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th onClick={() => handleSortToggle("createdDate")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><span>CREATED DATE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th onClick={() => handleSortToggle("leadAge")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5"><span>LEAD AGE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th onClick={() => handleSortToggle("leadStatus")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5"><span>STATUS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th onClick={() => handleSortToggle("concernPersonName")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 min-w-[200px]">
                  <div className="flex items-center gap-1.5"><span>CONCERN PERSON NAME</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th onClick={() => handleSortToggle("phoneNumber")} className="py-3.5 px-3.5 cursor-pointer hover:bg-slate-800 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><span>PHONE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5"><span>ASSIGNED TO</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3.5 whitespace-nowrap"><span>SOURCE / TYPE</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((item, index) => {
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/90 transition-colors group">
                      <td className="py-4 px-3.5 text-center font-mono font-bold text-slate-800">{serialNumber}</td>
                      <td className="py-4 px-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(item)}
                          className="w-8 h-8 rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs mx-auto"
                          title="View Full Lead Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>
                      <td className="py-4 px-3.5 text-slate-600 font-mono whitespace-nowrap text-xs">{item.createdDate}</td>
                      <td className="py-4 px-3.5 text-center whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-md text-blue-700 bg-blue-50 border border-blue-200 text-xs font-bold">{item.leadAge}</span>
                      </td>
                      <td className="py-4 px-3.5 text-center whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${getStatusBadgeClass(item.leadStatus)}`}>{item.leadStatus || "INTERESTED"}</span>
                      </td>
                      <td className="py-4 px-3.5 text-slate-900 font-medium max-w-[240px]">
                        <div className="truncate font-bold text-slate-900 text-sm sm:text-base" title={item.concernPersonName}>{item.concernPersonName}</div>
                        {item.clientDesignation && <div className="text-xs text-slate-500 font-medium mt-0.5">{item.clientDesignation} • {item.clientType || "Individual"}</div>}
                      </td>
                      <td className="py-4 px-3.5 font-mono text-slate-800 font-bold whitespace-nowrap">
                        <a href={`tel:${item.phoneNumber}`} className="hover:text-blue-600 hover:underline">{item.phoneNumber}</a>
                      </td>
                      <td className="py-4 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${item.assignedType === "self" ? "bg-emerald-500" : "bg-blue-500"}`} />
                          <span className="text-xs sm:text-sm font-bold text-slate-800">{item.assignedTo || "Sales TL"}</span>
                          <button
                            type="button"
                            onClick={() => { setReassignModalLead(item); setNewAssignee(item.assignedTo || teamMembers[0]); }}
                            className="ml-1 text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-3.5 whitespace-nowrap text-xs text-slate-600">
                        <span className="font-bold text-slate-800">{item.leadSource}</span> <span className="text-slate-500">({item.leadType})</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No assigned leads found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 6. PAGINATION */}
        <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50">
          <div className="text-slate-500">
            Showing <strong>{paginatedLeads.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</strong> to <strong>{Math.min(currentPage * rowsPerPage, sortedLeads.length)}</strong> of <strong>{sortedLeads.length}</strong> entries
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-white font-bold cursor-pointer"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono font-bold text-slate-800">{currentPage} / {totalPages}</span>
            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 hover:bg-white font-bold cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* 7. FULL LEAD DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">👁️</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedLead.concernPersonName}</h3>
                  <p className="text-xs text-slate-400">Lead ID: <span className="font-mono font-bold text-slate-700">{selectedLead.id}</span> • Created: {selectedLead.createdDate}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Client Designation</span><span className="font-semibold text-slate-800">{selectedLead.clientDesignation || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Client Type</span><span className="font-semibold text-slate-800">{selectedLead.clientType || "Individual"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Label</span><span className="font-semibold text-slate-800">{selectedLead.leadLabel || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Phone Number</span><a href={`tel:${selectedLead.phoneNumber}`} className="font-mono font-bold text-blue-600 hover:underline">+91 {selectedLead.phoneNumber}</a></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">WhatsApp Number</span><a href={`https://wa.me/91${selectedLead.whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-600 hover:underline">+91 {selectedLead.whatsAppNumber} 💬</a></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span><span className="text-slate-800 truncate block">{selectedLead.emailAddress || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Source</span><span className="font-semibold text-slate-800">{selectedLead.leadSource}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Channel</span><span className="font-semibold text-slate-800">{selectedLead.channel || "Sales"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Type</span><span className="font-semibold text-slate-800">{selectedLead.leadType}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Job Type</span><span className="font-semibold text-slate-800">{selectedLead.jobType}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Status</span><span className={`inline-block px-2 py-0.5 rounded text-[10px] ${getStatusBadgeClass(selectedLead.leadStatus)}`}>{selectedLead.leadStatus}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Business</span><span className="font-mono font-black text-slate-900 text-sm">₹ {Number(selectedLead.expectedBusinessAmount || 0).toLocaleString("en-IN")}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">City & State</span><span className="font-semibold text-slate-800">{selectedLead.city}, {selectedLead.state}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Pincode</span><span className="font-mono font-semibold text-slate-800">{selectedLead.pincode || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Age & Assigned</span><span className="font-semibold text-slate-800">{selectedLead.leadAge} ({selectedLead.assignedTo})</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-1 sm:col-span-2 md:col-span-3"><span className="text-[10px] font-bold text-slate-400 uppercase block">Project Remarks / Notes</span><p className="mt-1 text-slate-700 leading-relaxed font-medium">{selectedLead.remarks || "No additional remarks specified."}</p></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a href={`tel:${selectedLead.phoneNumber}`} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"><span>📞 Call</span></a>
                <a href={`https://wa.me/91${selectedLead.whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs"><span>WhatsApp</span></a>
                <button type="button" onClick={() => { setReassignModalLead(selectedLead); setNewAssignee(selectedLead.assignedTo || teamMembers[0]); }} className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs">Re-assign</button>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="px-5 py-1.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. RE-ASSIGN MODAL */}
      {reassignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Re-assign Lead</h3>
              <p className="text-xs text-slate-500 mt-0.5">Client: <strong className="text-slate-800">{reassignModalLead.concernPersonName}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Team Member</label>
              <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white cursor-pointer">
                {teamMembers.map((member) => (<option key={member} value={member}>{member}</option>))}
              </select>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setReassignModalLead(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleConfirmReassign} className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800">Assign</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AsignLeads;