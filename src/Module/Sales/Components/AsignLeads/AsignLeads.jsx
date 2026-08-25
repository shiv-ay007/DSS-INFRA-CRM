import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import ScopeTabs from "../../../../Common/Components/ScopeTabs";
import { initialAssignedLeads, teamMembers } from "../../data/assignedLeadsData";
import { availableWorkTypes, workCategoryList, leadTypesList } from "../../data/addLeadData";
import { FaUserPlus, FaSearch, FaFilter, FaUserCheck, FaUser, FaRegCheckCircle } from "react-icons/fa";

const leadModesList = [
  "ALL",
  "Business networking",
  "By freelancer",
  "By sales Team",
  "Customer to customer"
];

const AsignLeads = () => {
  const navigate = useNavigate();

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
  const [showFilters, setShowFilters] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState("all");
  const [filterExecutive, setFilterExecutive] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeadMode, setFilterLeadMode] = useState("ALL");
  const [filterLeadType, setFilterLeadType] = useState("ALL");
  const [filterWorkCategory, setFilterWorkCategory] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");

  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [reassignModalLead, setReassignModalLead] = useState(null);
  const [newAssignee, setNewAssignee] = useState("");
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [selectedClientStatus, setSelectedClientStatus] = useState("");

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLeadMode("ALL");
    setFilterLeadType("ALL");
    setFilterWorkCategory("ALL");
    setFilterWorkType("ALL");
    setFilterStatus("ALL");
    setFilterDateFrom("");
    setAssignmentTab("all");
    setFilterExecutive("ALL");
    setCurrentPage(1);
  };

  // Handler to move lead to Lead Management (Followup) or Lost Leads based on Client Status
  const handleSendToSalesManagement = () => {
    if (!statusModalLead) return;

    if (!selectedClientStatus) {
      toast.error("Please select Client Status (INTERESTED or NOT INTERESTED)!");
      return;
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    if (selectedClientStatus === "INTERESTED") {
      // 1. Move to Lead Management (dss_lead_management_sheet_v1) & Followup Leads
      const leadData = {
        ...statusModalLead,
        leadStatus: "Hot",
        status: "INTERESTED",
        isInterested: true,
        movedToFollowupDate: formattedDate,
        movedToFollowupTime: formattedTime,
        nextFollowupDate: formattedDate,
        nextFollowupTime: "11:00 am"
      };

      try {
        // Save to Lead Management Sheet
        const savedMgmt = localStorage.getItem("dss_lead_management_sheet_v1");
        const currentMgmt = savedMgmt ? JSON.parse(savedMgmt) : [];
        const filteredMgmt = currentMgmt.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify([leadData, ...filteredMgmt]));

        // Sync to Followup Leads
        const savedFollowup = localStorage.getItem("dss_followup_leads");
        const currentFollowup = savedFollowup ? JSON.parse(savedFollowup) : [];
        const filteredFollowup = currentFollowup.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_followup_leads", JSON.stringify([leadData, ...filteredFollowup]));

        // Sync to Scheduled Sheet
        const savedScheduled = localStorage.getItem("dss_scheduled_leads_sheet");
        const currentScheduled = savedScheduled ? JSON.parse(savedScheduled) : [];
        const filteredScheduled = currentScheduled.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_scheduled_leads_sheet", JSON.stringify([leadData, ...filteredScheduled]));
      } catch (e) {
        console.error("Error saving lead to Lead Management:", e);
      }

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName} marked as INTERESTED and sent to Lead Management! 🎯`);
    } else if (selectedClientStatus === "NOT INTERESTED") {
      // 2. Move to Lost Leads (dss_lost_leads)
      const lostLeadData = {
        ...statusModalLead,
        leadStatus: "Cold",
        status: "NOT INTERESTED",
        isInterested: false,
        lostReason: "Client Not Interested",
        lostDate: formattedDate,
        lostTime: formattedTime
      };

      try {
        const savedLost = localStorage.getItem("dss_lost_leads");
        const currentLost = savedLost ? JSON.parse(savedLost) : [];
        const filteredLost = currentLost.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_lost_leads", JSON.stringify([lostLeadData, ...filteredLost]));
      } catch (e) {
        console.error("Error saving to lost leads:", e);
      }

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName} marked as NOT INTERESTED and moved to Lost Leads! 📌`);
    }

    // Remove from dss_assigned_leads list
    const updatedAssigned = leads.filter(l => l.id !== statusModalLead.id);
    saveLeads(updatedAssigned);

    setStatusModalLead(null);
    setSelectedClientStatus("");
  };

  // Table Column Configuration matching Total Leads exactly
  const columnConfig = useMemo(() => ({
    srNo: {
      label: "SR. NO.",
      align: "center",
      render: (val, row, idx) => (
        <span className="font-mono font-bold text-slate-700 text-xs">
          {(currentPage - 1) * rowsPerPage + idx + 1}
        </span>
      )
    },
    actions: {
      label: "ACTIONS",
      align: "center",
      render: (val, row) => {
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* View Lead Details Eye Button */}
            <button
              type="button"
              onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
              className="w-6.5 h-6.5 rounded-md border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="View Lead Details"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* ONLY ON SELF TAB: 1 Single Green Check-Circle Icon Button for Client Status Modal */}
            {assignmentTab?.toLowerCase() === "self" && (
              <button
                type="button"
                onClick={() => {
                  setStatusModalLead(row);
                  setSelectedClientStatus("");
                }}
                className="w-6.5 h-6.5 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Client Status (Interested / Not Interested)"
              >
                <FaRegCheckCircle className="w-3.5 h-3.5 text-emerald-600 hover:text-white" />
              </button>
            )}
          </div>
        );
      }
    },
    createdDate: {
      label: "CREATED DATE & TIME",
      render: (val, row) => {
        const dateStr = row.createdDate || row.date || row.assignedDate || "2026-08-18";
        const timeStr = row.createdTime || row.assignedTime || "11:00 am";
        return (
          <div className="text-xs font-medium text-slate-700 whitespace-nowrap">
            <div>{dateStr}</div>
            <div className="text-[10px] font-mono text-slate-500 font-bold">{timeStr}</div>
          </div>
        );
      }
    },
    clientDetails: {
      label: "CLIENT DETAILS",
      render: (val, row) => {
        const name = row.clientName || row.concernPersonName || "--";
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        const email = row.emailAddress || row.email || "--";

        return (
          <div className="text-xs space-y-0.5 max-w-[160px]">
            {/* Line 1: Client Name (Highlighted with color badge) */}
            <div className="mb-0.5">
              <span
                className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs inline-block truncate max-w-full text-xs"
                title={name}
              >
                {name}
              </span>
            </div>

            {/* Line 2: Contact Number */}
            {phone !== "--" ? (
              <div>
                <a
                  href={`tel:${phone}`}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {phone}
                </a>
              </div>
            ) : (
              <div className="text-slate-400">--</div>
            )}

            {/* Line 3: Email Address */}
            {email !== "--" ? (
              <div>
                <a
                  href={`mailto:${email}`}
                  className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline truncate block cursor-pointer"
                  title={email}
                >
                  {email}
                </a>
              </div>
            ) : (
              <div className="text-slate-400 font-mono text-[11px]">--</div>
            )}
          </div>
        );
      }
    },
    leadType: {
      label: "LEAD TYPE",
      render: (val, row) => {
        const type = (row.leadType || val || "FRESH").toUpperCase();
        const isFresh = type === "FRESH";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border shadow-2xs ${
              isFresh
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-blue-600 text-white border-blue-700"
            }`}
          >
            {type}
          </span>
        );
      }
    },
    leadStatus: {
      label: "LEAD STATUS",
      render: (val, row) => {
        const status = (row.leadStatus || row.status || "Warm").toUpperCase();
        const colors = {
          HOT: "bg-rose-100 text-rose-800 border-rose-200",
          WARM: "bg-amber-100 text-amber-800 border-amber-200",
          COLD: "bg-sky-100 text-sky-800 border-sky-200",
          NEW: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${colors[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {status}
          </span>
        );
      }
    },
    leadMode: {
      label: "LEAD MODE",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.leadMode || row.leadSource || "Business networking"}
        </span>
      )
    },
    workCategory: {
      label: "WORK CATEGORY",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.workCategory || "Design"}
        </span>
      )
    },
    workType: {
      label: "WORK TYPE",
      render: (val, row) => {
        const wt = Array.isArray(row.workType)
          ? row.workType.join(", ")
          : (row.workType || "Concept Drawing");
        return (
          <div className="max-w-[140px] truncate text-xs font-medium text-slate-700" title={wt}>
            {wt}
          </div>
        );
      }
    },
    alternateNumber: {
      label: "ALTERNATE NUMBER",
      render: (val, row) => {
        const alt = row.alternateNumber || "--";
        return alt !== "--" ? (
          <a
            href={`tel:${alt}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {alt}
          </a>
        ) : (
          <span className="text-xs text-slate-400">--</span>
        );
      }
    },
    address: {
      label: "ADDRESS",
      render: (val, row) => {
        const addr = row.address || row.siteAddress || "--";
        return (
          <div className="max-w-[140px] truncate text-xs text-slate-700 font-medium" title={addr}>
            {addr}
          </div>
        );
      }
    },
    pincode: {
      label: "PINCODE",
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-700 font-bold">
          {row.pincode || "--"}
        </span>
      )
    },
    city: {
      label: "CITY",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.city || "--"}
        </span>
      )
    },
    state: {
      label: "STATE",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.state || "--"}
        </span>
      )
    },
    expectedBusiness: {
      label: "EXPECTED BUSINESS (₹)",
      render: (val, row) => {
        const amt = Number(row.expectedBusiness || row.expectedRevenue || row.expectedBusinessAmount || 0);
        return (
          <span className="text-xs font-mono font-bold text-slate-900">
            ₹{amt.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    assignedTo: {
      label: "ASSIGNED TO",
      render: (val, row) => {
        const assignee = row.assignTo || row.assignedTo || row.salesPerson || "Sales TL";
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {assignee}
          </span>
        );
      }
    },
    assignmentRemark: {
      label: "ASSIGNMENT REMARK",
      render: (val, row) => {
        const remark = row.assignmentRemark || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium" title={remark}>
            {remark}
          </div>
        );
      }
    },
    projectDetail: {
      label: "PROJECT DETAIL",
      render: (val, row) => {
        const pd = row.projectDetail || row.projectDetails || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium" title={pd}>
            {pd}
          </div>
        );
      }
    },
    remark: {
      label: "REMARK",
      render: (val, row) => {
        const rem = row.remark || row.requirement || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium" title={rem}>
            {rem}
          </div>
        );
      }
    }
  }), [currentPage, rowsPerPage, navigate, assignmentTab]);

  // Filtering Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const normTab = (assignmentTab || "").toLowerCase();
      // Scope Filter (All / Self / Team)
      if (normTab === "self") {
        const assigned = (lead.assignTo || lead.assignedTo || lead.salesPerson || "").toLowerCase();
        if (!assigned.includes("self") && !assigned.includes("tl") && !assigned.includes("current")) {
          return false;
        }
      }
      if (normTab === "team") {
        const assigned = (lead.assignTo || lead.assignedTo || lead.salesPerson || "").toLowerCase();
        if (assigned.includes("self") || assigned.includes("tl") || assigned.includes("current")) {
          return false;
        }
        if (filterExecutive !== "ALL" && !assigned.includes(filterExecutive.toLowerCase())) {
          return false;
        }
      }

      // Search Query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const client = (lead.clientName || lead.concernPersonName || "").toLowerCase();
        const proj = (lead.projectDetail || lead.projectDetails || "").toLowerCase();
        const city = (lead.city || "").toLowerCase();
        const phone = (lead.phoneNumber || lead.contact || "").toLowerCase();
        const email = (lead.emailAddress || lead.email || "").toLowerCase();
        if (!client.includes(q) && !proj.includes(q) && !city.includes(q) && !phone.includes(q) && !email.includes(q)) {
          return false;
        }
      }

      // Dropdown Filters
      if (filterLeadMode !== "ALL" && (lead.leadMode || lead.leadSource) !== filterLeadMode) return false;
      if (filterLeadType !== "ALL" && lead.leadType !== filterLeadType) return false;
      if (filterWorkCategory !== "ALL" && lead.workCategory !== filterWorkCategory) return false;
      if (filterWorkType !== "ALL") {
        const wt = Array.isArray(lead.workType) ? lead.workType.join(",") : (lead.workType || "");
        if (!wt.includes(filterWorkType)) return false;
      }
      if (filterStatus !== "ALL" && (lead.leadStatus || lead.status || "").toLowerCase() !== filterStatus.toLowerCase()) {
        return false;
      }
      if (filterDateFrom && !(lead.createdDate || lead.assignedDate || lead.date || "").includes(filterDateFrom)) {
        return false;
      }

      return true;
    });
  }, [
    leads,
    assignmentTab,
    filterExecutive,
    searchTerm,
    filterLeadMode,
    filterLeadType,
    filterWorkCategory,
    filterWorkType,
    filterStatus,
    filterDateFrom
  ]);

  // Pagination Logic
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const handleConfirmReassign = () => {
    if (!reassignModalLead || !newAssignee) {
      toast.error("Please select a team member to reassign!");
      return;
    }
    const isSelf = newAssignee.includes("Self") || newAssignee.includes("TL");
    const updated = leads.map((l) =>
      l.id === reassignModalLead.id
        ? {
            ...l,
            assignTo: newAssignee,
            assignedTo: newAssignee,
            salesPerson: newAssignee,
            assignedType: isSelf ? "self" : "executive",
            assignedDate: new Date().toLocaleDateString("en-GB")
          }
        : l
    );
    saveLeads(updated);

    // Also update dss_leads
    try {
      const savedTotal = localStorage.getItem("dss_leads");
      if (savedTotal) {
        const parsedTotal = JSON.parse(savedTotal);
        const updatedTotal = parsedTotal.map((l) =>
          l.id === reassignModalLead.id ? { ...l, assignTo: newAssignee, salesPerson: newAssignee } : l
        );
        localStorage.setItem("dss_leads", JSON.stringify(updatedTotal));
      }
    } catch (e) {}

    toast.success(`Lead ${reassignModalLead.clientName || reassignModalLead.concernPersonName} reassigned to ${newAssignee} successfully! 👤`);
    setReassignModalLead(null);
    setNewAssignee("");
  };

  return (
    <div className="space-y-5 font-sans pb-12 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* 1. SUB-HEADER BAR */}
      <PageHeader
        title="Assigned Leads Directory"
        badge="Pipeline"
        badgeColor="bg-blue-100 text-blue-800 border-blue-300"
        description="Manage self and team assigned leads, filter by source, status, or re-assign reps."
        showBackButton={true}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`h-9 px-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                showFilters
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-[#FF5722] text-[#white] border-[#FF5722] hover:bg-[#e64a19]"
              }`}
            >
              <FaFilter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>

            <div className="text-xs sm:text-sm text-slate-600 font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
              Total: <span className="font-black text-blue-700 font-mono">{filteredLeads.length}</span> Leads
            </div>
          </div>
        }
      />

      {/* 2. SCOPE TABS WITH EXECUTIVE DROPDOWN */}
      <ScopeTabs
        activeTab={assignmentTab}
        onTabChange={(tab) => {
          setAssignmentTab(tab);
          setCurrentPage(1);
        }}
        selectedExecutive={filterExecutive}
        onExecutiveChange={(exec) => {
          setFilterExecutive(exec);
          setCurrentPage(1);
        }}
        executives={teamMembers}
      />

      {/* 3. COLLAPSIBLE FILTER PANEL */}
      {showFilters && (
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          
          {/* Top Row: Search Input + Status Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="relative w-full lg:w-96">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search Client Name, Project Details, City..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-black transition-all placeholder:text-slate-400 font-medium shadow-2xs"
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

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {["ALL", "HOT", "WARM", "COLD"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFilterStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterStatus === st
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs sm:text-sm">
              {/* 1. Lead Type */}
              <select
                value={filterLeadType}
                onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Type</option>
                {leadTypesList.filter(t => t !== "ALL").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* 2. Lead Mode */}
              <select
                value={filterLeadMode}
                onChange={(e) => { setFilterLeadMode(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Mode</option>
                {leadModesList.filter(m => m !== "ALL").map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* 3. Lead Status */}
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Status</option>
                {["Hot", "Warm", "Cold"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* 4. Work Category */}
              <select
                value={filterWorkCategory}
                onChange={(e) => { setFilterWorkCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Work Category</option>
                {workCategoryList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* 5. Work Type */}
              <select
                value={filterWorkType}
                onChange={(e) => { setFilterWorkType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Work Type</option>
                {availableWorkTypes.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Date Picker & Orange Reset Button */}
            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 font-medium shadow-2xs cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="w-9 h-9 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center font-bold text-sm shrink-0"
                title="Reset Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. TABLE */}
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* 5. RE-ASSIGN LEAD MODAL (FOR TEAM LEADS) */}
      {reassignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FaUserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Re-assign Lead</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReassignModalLead(null);
                  setNewAssignee("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Client Info Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Client Name
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {reassignModalLead.clientName || reassignModalLead.concernPersonName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Assigned To
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {reassignModalLead.assignTo || reassignModalLead.assignedTo || "Unassigned"}
                </span>
              </div>
            </div>

            {/* Select Team Member Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Assign / Re-assign To <span className="text-red-500">*</span>
              </label>
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500 shadow-2xs cursor-pointer"
              >
                <option value="">-- Select Team Member --</option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setReassignModalLead(null);
                  setNewAssignee("");
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReassign}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Assign / Re-assign Lead
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= CLIENT STATUS / LEAD DETAILS MODAL (MATCHING IMAGE 1) ================= */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-6 animate-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">Lead Details</h3>
              <button
                type="button"
                onClick={() => {
                  setStatusModalLead(null);
                  setSelectedClientStatus("");
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top Cards: Client Info (Light Blue) & Expected Business (Light Green) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Left Box: Client Info */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <FaUser className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {statusModalLead.clientName || statusModalLead.concernPersonName || "Client Name"}
                  </h4>
                  <p className="text-xs font-mono text-slate-600 font-semibold truncate">
                    {statusModalLead.phoneNumber || statusModalLead.contact || "--"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {statusModalLead.emailAddress || statusModalLead.email || "--"}
                  </p>
                </div>
              </div>

              {/* Right Box: Expected Business */}
              <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-200/80 text-center flex flex-col justify-center items-center">
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Expected Business
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {statusModalLead.expectedBusiness || statusModalLead.expectedRevenue || statusModalLead.expectedBusinessAmount || "0"}
                </span>
              </div>
            </div>

            {/* Form Section: Client Status Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Client Status
              </label>
              <select
                value={selectedClientStatus}
                onChange={(e) => setSelectedClientStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="">-- Select Status --</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="NOT INTERESTED">NOT INTERESTED</option>
              </select>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusModalLead(null);
                  setSelectedClientStatus("");
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendToSalesManagement}
                className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-sm font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Send To Sales Management
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AsignLeads;