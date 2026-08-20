import React, { useState, useMemo } from "react";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { initialLostLeads } from "../../data/lostLeadsData";

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
const lostReasonOptions = [
  "Lost Reason",
  "Price / Budget Constraint",
  "Competitor (Lower Quote)",
  "Project Cancelled / Dropped",
  "Timeline / Delivery Delay",
  "Specification Mismatch",
  "No Response / Cold",
  "Management Postponed"
];
const leadLabelOptions = ["Lead Label", "Hot Lead 🔥", "Warm Lead ⚡", "Cold Lead ❄️"];
const jobTypeOptions = ["Job Type", "NEW", "REPAIR / AMC", "EXPANSION", "UPGRADE"];

const Lostlead = () => {
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("dss_lost_leads");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialLostLeads;
  });

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_lost_leads", JSON.stringify(newLeads));
    } catch (e) {}
  };

  const [reasonTab, setReasonTab] = useState("all");
  const [filterLeadType, setFilterLeadType] = useState("Lead Type");
  const [filterLeadSource, setFilterLeadSource] = useState("Lead Source");
  const [filterLostReason, setFilterLostReason] = useState("Lost Reason");
  const [filterLeadLabel, setFilterLeadLabel] = useState("Lead Label");
  const [filterJobType, setFilterJobType] = useState("Job Type");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");

  const [selectedLead, setSelectedLead] = useState(null);
  const [reviveModalLead, setReviveModalLead] = useState(null);
  const [reviveStatus, setReviveStatus] = useState("Warm");
  const [reviveNotes, setReviveNotes] = useState("");

  // Table Column Configuration for common Table component
  const columnConfig = useMemo(() => ({
    actions: {
      label: "ACTIONS",
      render: (val, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedLead(row)}
            className="w-7 h-7 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="View Lost Lead Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setReviveModalLead(row)}
            className="w-7 h-7 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Revive / Reopen Lead"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )
    },
    lostDate: {
      label: "LOST DATE",
      render: (val, row) => (
        <span className="text-slate-700 text-xs font-sans font-medium">
          {val || row.createdDate || "18/7/2026"}
        </span>
      )
    },
    lostReason: {
      label: "LOST REASON",
      render: (val, row) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          {val || row.lostReason || "Price / Budget Constraint"}
        </span>
      )
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
    expectedBusinessAmount: {
      label: "EXPECTED REVENUE",
      render: (val, row) => (
        <span className="font-mono font-bold text-rose-600 text-xs">
          ₹ {Number(val || row.expectedBusinessAmount || 0).toLocaleString("en-IN")}
        </span>
      )
    },
    salesPerson: {
      label: "SALES PERSON",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-800">
          {val || row.salesPerson || "Sales Rep"}
        </span>
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
    setFilterLostReason("Lost Reason");
    setFilterLeadLabel("Lead Label");
    setFilterJobType("Job Type");
    setFilterDate("");
    setSearchTerm("");
    setReasonTab("all");
    setCurrentPage(1);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (reasonTab === "price" && !lead.lostReason?.toLowerCase().includes("price")) return false;
      if (reasonTab === "competitor" && !lead.lostReason?.toLowerCase().includes("competitor")) return false;
      if (reasonTab === "cancelled" && !lead.lostReason?.toLowerCase().includes("cancelled") && !lead.lostReason?.toLowerCase().includes("dropped")) return false;
      if (reasonTab === "no_response" && !lead.lostReason?.toLowerCase().includes("no response") && !lead.lostReason?.toLowerCase().includes("cold")) return false;

      if (filterLeadType !== "Lead Type" && lead.leadType !== filterLeadType) return false;
      if (filterLeadSource !== "Lead Source" && lead.leadSource !== filterLeadSource) return false;
      if (filterLostReason !== "Lost Reason" && lead.lostReason !== filterLostReason) return false;
      if (filterLeadLabel !== "Lead Label" && lead.leadLabel !== filterLeadLabel) return false;
      if (filterJobType !== "Job Type" && lead.jobType !== filterJobType) return false;

      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          (lead.concernPersonName || "").toLowerCase().includes(query) ||
          (lead.phoneNumber || "").includes(query) ||
          (lead.city || "").toLowerCase().includes(query) ||
          (lead.lostReason || "").toLowerCase().includes(query) ||
          (lead.id || "").toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filterDate && !(lead.lostDate || lead.createdDate || "").includes(filterDate)) return false;

      return true;
    });
  }, [leads, reasonTab, filterLeadType, filterLeadSource, filterLostReason, filterLeadLabel, filterJobType, filterDate, searchTerm]);

  const totalLostAmount = useMemo(() => {
    return filteredLeads.reduce((sum, item) => sum + (Number(item.expectedBusinessAmount) || 0), 0);
  }, [filteredLeads]);

  const sortedLeads = useMemo(() => {
    const data = [...filteredLeads];
    if (sortField) {
      data.sort((a, b) => {
        let valA = a[sortField] || "";
        let valB = b[sortField] || "";
        if (sortField === "expectedBusinessAmount") {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
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

  const handleConfirmRevive = () => {
    if (!reviveModalLead) return;
    const updatedLost = leads.filter((l) => l.id !== reviveModalLead.id);
    saveLeads(updatedLost);

    try {
      const activeLeads = JSON.parse(localStorage.getItem("dss_leads") || "[]");
      const revivedItem = {
        ...reviveModalLead,
        leadStatus: reviveStatus,
        nextFollowup: "Re-opened - Followup Scheduled",
        remarks: `${reviveModalLead.remarks || ""} [Reopened: ${reviveNotes || "Revived lead for fresh negotiation"}]`
      };
      activeLeads.unshift(revivedItem);
      localStorage.setItem("dss_leads", JSON.stringify(activeLeads));
    } catch (e) {}

    setReviveModalLead(null);
    setSelectedLead(null);
    setReviveNotes("");
    alert(`Lead for "${reviveModalLead.concernPersonName}" revived and moved to Active Pipeline!`);
  };

  const getReasonBadgeClass = (reason) => {
    const r = reason?.toLowerCase() || "";
    if (r.includes("price") || r.includes("budget")) return "bg-rose-50 text-rose-700 border-rose-200";
    if (r.includes("competitor")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (r.includes("cancelled") || r.includes("dropped")) return "bg-slate-100 text-slate-700 border-slate-300";
    if (r.includes("timeline") || r.includes("delay")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-red-50 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-5 font-sans select-none pb-12 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* 1. SUB-HEADER BAR */}
      <PageHeader
        title="Lost Leads Directory"
        badge="Closed / Lost"
        badgeColor="bg-rose-100 text-rose-800 border-rose-300"
        description="Analyze lost deal reasons and revive opportunities back into the active pipeline."
        showBackButton={true}
        rightActions={
          <div className="px-4 py-2 rounded-xl bg-white border border-rose-200 shadow-2xs text-xs sm:text-sm font-bold flex items-center gap-2">
            <span className="text-rose-600">📉 Lost Value:</span>
            <span className="font-mono font-black text-rose-800 text-sm sm:text-base">
              ₹ {totalLostAmount.toLocaleString("en-IN")}
            </span>
          </div>
        }
      />

      {/* 2. TAB BUTTONS */}
      <div className="flex justify-center w-full">
        <div className="inline-flex flex-wrap p-1.5 rounded-2xl bg-slate-200/80 border border-slate-300/80 gap-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => { setReasonTab("all"); setCurrentPage(1); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              reasonTab === "all" ? "bg-slate-900 text-white shadow-md" : "bg-transparent text-slate-700 hover:bg-white/80"
            }`}
          >
            All Lost Leads ({leads.length})
          </button>

          <button
            type="button"
            onClick={() => { setReasonTab("price"); setCurrentPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reasonTab === "price" ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-600/25" : "bg-transparent text-rose-800 hover:bg-white/80"
            }`}
          >
            <span>💰 Budget / Price</span>
          </button>

          <button
            type="button"
            onClick={() => { setReasonTab("competitor"); setCurrentPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reasonTab === "competitor" ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/25" : "bg-transparent text-amber-800 hover:bg-white/80"
            }`}
          >
            <span>⚔️ Competitor Won</span>
          </button>

          <button
            type="button"
            onClick={() => { setReasonTab("cancelled"); setCurrentPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reasonTab === "cancelled" ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md shadow-slate-900/25" : "bg-transparent text-slate-800 hover:bg-white/80"
            }`}
          >
            <span>🚫 Dropped / Cancelled</span>
          </button>

          <button
            type="button"
            onClick={() => { setReasonTab("no_response"); setCurrentPage(1); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              reasonTab === "no_response" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25" : "bg-transparent text-blue-800 hover:bg-white/80"
            }`}
          >
            <span>❄️ No Response</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER CONTROLS */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="relative col-span-2 sm:col-span-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search Client, Phone, Reason..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white hover:border-slate-300 focus:outline-hidden focus:border-black pr-8 font-semibold shadow-2xs placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={filterLeadType}
              onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-7 font-medium shadow-2xs"
            >
              {leadTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filterLeadSource}
              onChange={(e) => { setFilterLeadSource(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-7 font-medium shadow-2xs"
            >
              {leadSourceOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filterLostReason}
              onChange={(e) => { setFilterLostReason(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-7 font-medium shadow-2xs"
            >
              {lostReasonOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={filterJobType}
              onChange={(e) => { setFilterJobType(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-7 font-medium shadow-2xs"
            >
              {jobTypeOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Date Filter & Orange Reset */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative w-48 sm:w-60">
            <input
              type={showDatePicker ? "date" : "text"}
              value={filterDate}
              onFocus={() => setShowDatePicker(true)}
              onBlur={(e) => { if (!e.target.value) setShowDatePicker(false); }}
              onChange={(e) => { setFilterDate(e.target.value); setCurrentPage(1); }}
              placeholder="All Dates"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:outline-hidden focus:border-black cursor-pointer pr-9 shadow-2xs font-medium placeholder:text-slate-700"
            />
            <span className="absolute right-3 text-slate-400 pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="w-9 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
            title="Reset All Filters"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* 4. ROWS PER PAGE */}
      <div className="flex items-center gap-2">
        <div className="relative w-20">
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="w-full appearance-none px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

      {/* 7. FULL LOST LEAD DETAIL MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-sm font-bold">📉</span>
                <div>
                  <h3 className="text-base font-black text-slate-900">{selectedLead.concernPersonName}</h3>
                  <p className="text-xs text-slate-400">Lead ID: <span className="font-mono font-bold text-slate-700">{selectedLead.id}</span> • Lost Date: {selectedLead.lostDate}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer">✕</button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">Primary Reason for Loss:</span>
              <div className="font-bold text-sm text-rose-900">{selectedLead.lostReason}</div>
              {selectedLead.lostRemarks && <p className="text-xs text-rose-700 mt-1 italic">"{selectedLead.lostRemarks}"</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Client Designation</span><span className="font-semibold text-slate-800">{selectedLead.clientDesignation || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Client Type</span><span className="font-semibold text-slate-800">{selectedLead.clientType || "Individual"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lost Deal Value</span><span className="font-mono font-black text-rose-600 text-sm">₹ {Number(selectedLead.expectedBusinessAmount || 0).toLocaleString("en-IN")}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Phone Number</span><a href={`tel:${selectedLead.phoneNumber}`} className="font-mono font-bold text-blue-600 hover:underline">+91 {selectedLead.phoneNumber}</a></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">WhatsApp Number</span><a href={`https://wa.me/91${selectedLead.whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="font-mono font-bold text-emerald-600 hover:underline">+91 {selectedLead.whatsAppNumber} 💬</a></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Email Address</span><span className="text-slate-800 truncate block">{selectedLead.emailAddress || "—"}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Source</span><span className="font-semibold text-slate-800">{selectedLead.leadSource}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Type & Job</span><span className="font-semibold text-slate-800">{selectedLead.leadType} ({selectedLead.jobType})</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100"><span className="text-[10px] font-bold text-slate-400 uppercase block">City & State</span><span className="font-semibold text-slate-800">{selectedLead.city}, {selectedLead.state}</span></div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-1 sm:col-span-2 md:col-span-3"><span className="text-[10px] font-bold text-slate-400 uppercase block">Original Requirements & Remarks</span><p className="mt-1 text-slate-700 leading-relaxed font-medium">{selectedLead.remarks || "No additional project notes provided."}</p></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a href={`tel:${selectedLead.phoneNumber}`} className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"><span>📞 Call</span></a>
                <a href={`https://wa.me/91${selectedLead.whatsAppNumber}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs"><span>WhatsApp</span></a>
                <button type="button" onClick={() => setReviveModalLead(selectedLead)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"><span>🚀 Revive Lead</span></button>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="px-5 py-1.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. REVIVE LEAD MODAL */}
      {reviveModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg font-bold mb-2">🚀</div>
              <h3 className="text-sm font-black text-slate-900">Revive / Reopen Lead</h3>
              <p className="text-xs text-slate-500 mt-0.5">Client: <strong className="text-slate-800">{reviveModalLead.concernPersonName}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Pipeline Status</label>
              <select value={reviveStatus} onChange={(e) => setReviveStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-black cursor-pointer">
                <option value="Hot">Hot Lead 🔥</option>
                <option value="Warm">Warm Lead ⚡</option>
                <option value="Interested">Interested / Followup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Re-opening Notes / Strategy</label>
              <textarea
                rows={2}
                value={reviveNotes}
                onChange={(e) => setReviveNotes(e.target.value)}
                placeholder="E.g. Discount offered, new requirement discussion..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-hidden focus:border-black placeholder:text-slate-400 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setReviveModalLead(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button type="button" onClick={handleConfirmRevive} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-xs">Move to Active Pipeline</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lostlead;