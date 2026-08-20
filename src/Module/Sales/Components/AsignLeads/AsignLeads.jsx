import React, { useState, useMemo } from "react";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import {
  initialAssignedLeads,
  leadTypeOptions,
  leadSourceOptions,
  leadStatusOptions,
  leadLabelOptions,
  jobTypeOptions,
  teamMembers
} from "../../data/assignedLeadsData";

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
  const [showFilters, setShowFilters] = useState(false);
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

  // Table Column Configuration for common Table component
  const columnConfig = useMemo(() => ({
    actions: {
      label: "ACTIONS",
      render: (val, row) => {
        const phone = row.phoneNumber || row.contact || "";
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedLead(row)}
              className="w-7 h-7 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="View Lead Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            <a
              href={phone ? `tel:${phone}` : "#"}
              className={`w-7 h-7 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${!phone && "opacity-40 pointer-events-none"}`}
              title={phone ? `Call ${phone}` : "No phone available"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>
        );
      }
    },
    createdDate: {
      label: "CREATED DATE",
      render: (val, row) => (
        <span className="text-slate-700 text-xs font-sans font-medium">
          {val || row.createdDate || "18/7/2026, 12:45:35 pm"}
        </span>
      )
    },
    leadAge: {
      label: "LEAD AGE",
      render: (val, row) => (
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold italic text-xs border border-blue-200 inline-block">
          {val || row.leadAge || "33 Days"}
        </span>
      )
    },
    status: {
      label: "STATUS",
      render: (val, row) => {
        const s = (val || row.status || row.leadStatus || "").toString().toUpperCase();
        const isNew = s === "NEW" || s === "FRESH" || row.jobType === "NEW";
        const displayStatus = isNew ? "NEW" : "OLD";

        return (
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
              displayStatus === "NEW"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {displayStatus}
          </span>
        );
      }
    },
    concernPersonName: {
      label: "CONCERN PERSON NAME",
      render: (val, row) => (
        <div className="text-left font-medium text-slate-800 text-xs">
          {row.concernPersonName || row.clientName || "--"}
          {row.clientDesignation && <div className="text-[11px] text-slate-500 font-normal">{row.clientDesignation}</div>}
        </div>
      )
    },
    phoneNumber: {
      label: "PHONE",
      render: (val, row) => (
        <div className="text-left font-sans text-slate-800 text-xs font-medium">
          {row.phoneNumber || row.contact || "--"}
        </div>
      )
    },
    assignedTo: {
      label: "ASSIGNED TO",
      render: (val, row) => (
        <div className="flex items-center justify-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${row.assignedType === "self" ? "bg-emerald-500" : "bg-blue-500"}`} />
          <span className="text-xs font-bold text-slate-800">{val || row.assignedTo || "Sales TL"}</span>
          <button
            type="button"
            onClick={() => { setReassignModalLead(row); setNewAssignee(row.assignedTo || teamMembers[0]); }}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
          >
            Edit
          </button>
        </div>
      )
    },
    sourceType: {
      label: "SOURCE / TYPE",
      render: (val, row) => (
        <span className="text-xs text-slate-700">
          <strong className="text-slate-800">{row.leadSource || "WEBSITE"}</strong> ({row.leadType || "FRESH"})
        </span>
      )
    }
  }), []);

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
      <PageHeader
        title="Assigned Leads"
        badge="Pipeline"
        badgeColor="bg-blue-100 text-blue-800 border-blue-300"
        description="Manage self and team assigned leads, filter by source, status, or re-assign reps."
        showBackButton={true}
        rightActions={
          <div className="text-xs sm:text-sm text-slate-600 font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            Total: <span className="font-black text-blue-700 font-mono">{filteredLeads.length}</span> Leads
          </div>
        }
      />

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

      {/* 3. COLLAPSIBLE FILTER TOGGLE BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-semibold text-slate-600 text-center sm:text-left">
          Showing <strong className="font-bold text-slate-900">{filteredLeads.length}</strong> of <strong className="font-bold text-slate-900">{leads.length}</strong> Assigned Leads
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{showFilters ? "Hide Filter Options ✕" : "Filter Options 🔍"}</span>
        </button>
      </div>

      {/* COLLAPSIBLE FILTER PANEL (Opens on click) */}
      {showFilters && (
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 animate-in fade-in duration-150">
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
      )}

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
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={sortedLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

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