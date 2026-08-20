import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
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
      <div className="w-full bg-gradient-to-r from-purple-50 via-indigo-50/30 to-white rounded-2xl border border-purple-200/80 shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                Sales Management Sheet
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                Executive Overview
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Real-time sales deal tracking, client requirement log, priority matrix, and revenue valuation.
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

      {/* ================= 4. MAIN DATA TABLE (Exact Screenshot Columns) ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-white text-xs font-bold uppercase tracking-wider select-none border-b border-slate-800">
                <th className="py-3.5 px-3 text-center w-12">
                  <div className="flex items-center justify-center gap-1"><span>S. NO.</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap w-20">
                  <div className="flex items-center justify-center gap-1"><span>ACTIONS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>AMOUNT</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>CLIENT ID</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[170px]">
                  <div className="flex items-center gap-1"><span>CLIENT</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>PRIORITY</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>STATUS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>CREATED AT</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>COMPANY NAME</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-1"><span>BUSINESS TYPE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>JOB TYPE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>CITY</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>PINCODE</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[160px]">
                  <div className="flex items-center gap-1"><span>REQUIREMENT</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 min-w-[150px]">
                  <div className="flex items-center gap-1"><span>ADDRESS</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
                <th className="py-3.5 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1"><span>CLIENT RATING</span><span className="text-[10px] text-slate-400">↕</span></div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const serialNumber = (currentPage - 1) * rowsPerPage + index + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/90 transition-colors group">
                      
                      {/* 1. S. NO. */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                        {serialNumber}
                      </td>

                      {/* 2. ACTIONS (Orange Eye Button matching screenshot) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailModalLead(item)}
                          className="w-7 h-7 rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs mx-auto"
                          title="View Lead Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </td>

                      {/* 3. AMOUNT (Light Green Pill Badge) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-3 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* 4. CLIENT ID */}
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-700 whitespace-nowrap text-xs">
                        {item.clientId}
                      </td>

                      {/* 5. CLIENT */}
                      <td className="py-3.5 px-3">
                        <div
                          onClick={() => setDetailModalLead(item)}
                          className="font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:text-blue-600 hover:underline leading-tight"
                        >
                          {item.clientName}
                        </div>
                        <div className="text-xs text-slate-600 font-mono font-medium mt-0.5">{item.phoneNumber}</div>
                        {item.emailAddress && item.emailAddress !== "--" && (
                          <div className="text-xs text-slate-400 truncate max-w-[160px]">{item.emailAddress}</div>
                        )}
                      </td>

                      {/* 6. PRIORITY (Screenshot pill: red, yellow, green) */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getPriorityBadge(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>

                      {/* 7. STATUS */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>

                      {/* 8. CREATED AT */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="font-semibold text-slate-700 text-xs">{item.createdAt}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.createdTime}</div>
                      </td>

                      {/* 9. COMPANY NAME */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap text-slate-600 text-xs">
                        {item.companyName}
                      </td>

                      {/* 10. BUSINESS TYPE */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 text-xs font-medium">
                        {item.businessType}
                      </td>

                      {/* 11. JOB TYPE */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getJobTypeBadge(item.jobType)}`}>
                          {item.jobType}
                        </span>
                      </td>

                      {/* 12. CITY */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap font-medium text-slate-800 text-xs">
                        {item.city}
                      </td>

                      {/* 13. PINCODE */}
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600 whitespace-nowrap text-xs">
                        {item.pincode}
                      </td>

                      {/* 14. REQUIREMENT */}
                      <td className="py-3.5 px-3 text-slate-700 max-w-[160px] truncate text-xs" title={item.requirement}>
                        {item.requirement}
                      </td>

                      {/* 15. ADDRESS */}
                      <td className="py-3.5 px-3 text-slate-600 max-w-[150px] truncate text-xs" title={item.address}>
                        {item.address}
                      </td>

                      {/* 16. CLIENT RATING */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black font-mono bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                          <span className="text-amber-500">★</span> {item.clientRating ? item.clientRating.toFixed(1) : "4.0"}
                        </span>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-slate-400">
                    <div className="text-2xl mb-1">📋</div>
                    <div className="font-bold text-slate-700 text-sm">No sales records found</div>
                    <div className="text-xs text-slate-400 mt-0.5">Try clearing or changing your filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 5. PAGINATION BAR ================= */}
        {filteredData.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm bg-slate-50/50">
            <div className="text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * rowsPerPage + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * rowsPerPage, filteredData.length)}</span> of <span className="font-bold text-slate-900">{filteredData.length}</span> entries
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