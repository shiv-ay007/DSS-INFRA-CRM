import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { initialSalesData } from "../../data/salesManagementData";

/**
 * Component: Salse (Sales Management Sheet)
 * Design matching the DSS CRM Sales Management Sheet screenshot with rich colorful styling & larger text.
 */

const Salse = () => {
  const [salesData] = useState(initialSalesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModalLead, setDetailModalLead] = useState(null);

  // Table Column Configuration for common Table component
  const columnConfig = useMemo(() => ({
    actions: {
      label: "ACTIONS",
      render: (val, row) => (
        <button
          type="button"
          onClick={() => setDetailModalLead(row)}
          className="w-7 h-7 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs mx-auto"
          title="View Lead Details"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )
    },
    amount: {
      label: "AMOUNT",
      render: (val, row) => (
        <span className="inline-block px-3 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
          ₹{val ? val.toLocaleString("en-IN") : "0"}
        </span>
      )
    },
    clientId: {
      label: "CLIENT ID",
      render: (val, row) => (
        <span className="font-mono font-bold text-slate-700 text-xs">{val || "--"}</span>
      )
    },
    clientName: {
      label: "CLIENT",
      render: (val, row) => (
        <div className="text-left font-medium text-slate-800 text-xs">
          <div className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 hover:underline" onClick={() => setDetailModalLead(row)}>
            {row.clientName || "--"}
          </div>
          <div className="text-xs text-slate-600 font-mono font-medium">{row.phoneNumber}</div>
          {row.emailAddress && row.emailAddress !== "--" && (
            <div className="text-xs text-slate-400 truncate max-w-[160px]">{row.emailAddress}</div>
          )}
        </div>
      )
    },
    priority: {
      label: "PRIORITY",
      render: (val, row) => {
        const p = (val || "LOW").toUpperCase();
        const badges = {
          HIGH: "bg-red-50 text-red-700 border-red-200",
          MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
          LOW: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${badges[p] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {p === "HIGH" ? "🔴 High" : p === "MEDIUM" ? "🟡 Medium" : "🟢 Low"}
          </span>
        );
      }
    },
    status: {
      label: "STATUS",
      render: (val, row) => {
        const s = (val || "").toString().toUpperCase();
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
    createdAt: {
      label: "CREATED AT",
      render: (val, row) => (
        <div className="text-center font-sans text-xs">
          <div className="font-semibold text-slate-700">{row.createdAt}</div>
          <div className="text-[10px] text-slate-400 font-mono">{row.createdTime}</div>
        </div>
      )
    },
    companyName: {
      label: "COMPANY NAME",
      render: (val, row) => (
        <span className="text-xs text-slate-600">{val || "--"}</span>
      )
    },
    businessType: {
      label: "BUSINESS TYPE",
      render: (val, row) => (
        <span className="text-xs font-medium text-slate-700">{val || "--"}</span>
      )
    },
    jobType: {
      label: "JOB TYPE",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
          {val || "NEW"}
        </span>
      )
    },
    city: {
      label: "CITY",
      render: (val, row) => (
        <span className="text-xs font-medium text-slate-800">{val || "--"}</span>
      )
    },
    pincode: {
      label: "PINCODE",
      render: (val, row) => (
        <span className="font-mono text-slate-600 text-xs">{val || "--"}</span>
      )
    },
    requirement: {
      label: "REQUIREMENT",
      render: (val, row) => (
        <div className="max-w-[160px] truncate text-xs text-slate-700" title={val}>
          {val || "--"}
        </div>
      )
    },
    address: {
      label: "ADDRESS",
      render: (val, row) => (
        <div className="max-w-[150px] truncate text-xs text-slate-600" title={val}>
          {val || "--"}
        </div>
      )
    },
    clientRating: {
      label: "CLIENT RATING",
      render: (val, row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black font-mono bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
          <span className="text-amber-500">★</span> {val ? val.toFixed(1) : "4.0"}
        </span>
      )
    }
  }), []);

  // KPI numbers
  const stats = useMemo(() => {
    return {
      totalAmountFormatted: "₹28,65,000",
      qualified: 34,
      followedUp: 19
    };
  }, []);

  // Priority badge styling
  const getPriorityBadge = (p) => {
    const pr = (p || "").toLowerCase();
    if (pr === "high") {
      return "text-rose-600 bg-rose-50 border border-rose-200";
    }
    if (pr === "medium") {
      return "text-amber-600 bg-amber-50 border border-amber-200";
    }
    return "text-emerald-600 bg-emerald-50 border border-emerald-200";
  };

  // Status badge styling
  const getStatusBadge = (st) => {
    const s = (st || "").toUpperCase();
    if (s.includes("INTERESTED")) {
      return "text-blue-700 bg-blue-50 border border-blue-200";
    }
    if (s.includes("ASSIGNED")) {
      return "text-sky-700 bg-sky-50 border border-sky-200";
    }
    if (s.includes("CONVERTED")) {
      return "text-emerald-700 bg-emerald-50 border border-emerald-300";
    }
    return "text-slate-700 bg-slate-100 border border-slate-200";
  };

  // Job Type badge styling
  const getJobTypeBadge = (job) => {
    const j = (job || "").toUpperCase();
    if (j === "NEW") {
      return "text-emerald-700 bg-emerald-50 border border-emerald-200";
    }
    if (j === "REPAIR") {
      return "text-amber-700 bg-amber-50 border border-amber-200";
    }
    return "text-slate-500 bg-slate-100 border border-slate-200";
  };

  // Filtered Leads
  const filteredData = useMemo(() => {
    return salesData.filter((item) => {
      if (selectedPriority !== "all" && item.priority.toLowerCase() !== selectedPriority.toLowerCase()) {
        return false;
      }
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }
      if (selectedCity !== "all" && item.city !== selectedCity) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          item.clientName.toLowerCase().includes(q) ||
          item.clientId.toLowerCase().includes(q) ||
          item.phoneNumber.includes(q) ||
          item.city.toLowerCase().includes(q) ||
          item.requirement.toLowerCase().includes(q) ||
          item.address.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [salesData, selectedPriority, selectedStatus, selectedCity, searchTerm]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage) || 1;

  // Cities List for filter
  const citiesList = useMemo(() => {
    const set = new Set(salesData.map((d) => d.city).filter((c) => c && c !== "--"));
    return ["all", ...Array.from(set)];
  }, [salesData]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPriority("all");
    setSelectedStatus("all");
    setSelectedCity("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 font-sans select-none pb-16 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* ================= 1. SUB-HEADER BANNER ================= */}
      <PageHeader
        title="Sales Management Sheet"
        badge="Executive Overview"
        badgeColor="bg-purple-100 text-purple-800 border-purple-300"
        description="Real-time sales deal tracking, client requirement log, priority matrix, and revenue valuation."
        showBackButton={true}
        rightActions={
          <Link
            to="/sales/leads/add"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Lead
          </Link>
        }
      />

      {/* ================= 2. TOP 3 COLORFUL KPI METRIC CARDS (Exact Screenshot Design) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Amount (Light Green Card) */}
        <div className="p-5 rounded-2xl bg-[#ECFDF5] border border-emerald-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs sm:text-sm font-bold text-emerald-700 mb-1">
            Total Amount
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono tracking-tight">
            {stats.totalAmountFormatted}
          </div>
        </div>

        {/* Card 2: Qualified (Light Blue Card) */}
        <div className="p-5 rounded-2xl bg-[#EFF6FF] border border-blue-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs sm:text-sm font-bold text-blue-700 mb-1">
            Qualified
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-900 font-mono tracking-tight">
            {stats.qualified}
          </div>
        </div>

        {/* Card 3: Followed Up (Light Purple/Lavender Card) */}
        <div className="p-5 rounded-2xl bg-[#FAF5FF] border border-purple-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="text-xs sm:text-sm font-bold text-purple-700 mb-1">
            Followed Up
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-900 font-mono tracking-tight">
            {stats.followedUp}
          </div>
        </div>

      </div>

      {/* ================= 3. FILTER CONTROLS & PRIORITY PILLS ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          
          {/* Rows Per Page */}
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

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search Client Name, ID, Phone, City, Requirement..."
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

          {/* Priority Pills (Screenshot Match: High, Medium, Low) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => { setSelectedPriority("all"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedPriority === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => { setSelectedPriority("high"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedPriority === "high"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                  : "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100"
              }`}
            >
              High
            </button>

            <button
              type="button"
              onClick={() => { setSelectedPriority("medium"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedPriority === "medium"
                  ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                  : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
              }`}
            >
              Medium
            </button>

            <button
              type="button"
              onClick={() => { setSelectedPriority("low"); setCurrentPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedPriority === "low"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
              }`}
            >
              Low
            </button>

            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300 ml-1"
            >
              <option value="all">All Cities</option>
              {citiesList.filter((c) => c !== "all").map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-xs transition-colors"
              title="Reset All Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>

          </div>

        </div>
      </div>

      {/* ================= 4. MAIN DATA TABLE ================= */}
      <Table
        data={paginatedData}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ================= MODAL: LEAD DETAIL POPUP ================= */}
      {detailModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{detailModalLead.clientName}</h3>
                <p className="text-xs text-slate-300">Client ID: {detailModalLead.clientId} • {detailModalLead.city}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLead(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{detailModalLead.phoneNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Deal Amount</span>
                  <div className="font-mono font-black text-emerald-700 mt-0.5">₹{detailModalLead.amount.toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Priority / Status</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityBadge(detailModalLead.priority)}`}>
                      {detailModalLead.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(detailModalLead.status)}`}>
                      {detailModalLead.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">City & Pincode</span>
                  <div className="font-medium text-slate-900 mt-0.5">{detailModalLead.city} • {detailModalLead.pincode}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Requirement:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium">
                  {detailModalLead.requirement}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Address:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs">
                  {detailModalLead.address || "No address provided"}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Client Rating:</span>
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-amber-900 font-bold flex items-center gap-2">
                  <span className="text-amber-500 text-base">★</span>
                  <span>{detailModalLead.clientRating ? detailModalLead.clientRating.toFixed(1) : "4.0"} / 5.0 (Client Satisfaction Score)</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDetailModalLead(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 cursor-pointer shadow-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Salse;