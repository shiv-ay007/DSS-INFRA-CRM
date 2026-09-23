import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import { FaTrashRestore, FaUndo, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import { getDeletedLeadsApi, restoreLeadApi } from "../../services/totalLeads.api";
import { workCategoryList, indianStatesList } from "../../data/addLeadData";
import { useLeadContext, notifyLeadChange } from "../../../../context/LeadContext";
import { useAuth } from "../../../../context/AuthContext";

const DeletedLeadsTable = () => {
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const { invalidateCache } = useLeadContext();

  const [deletedLeads, setDeletedLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterWorkCategory, setFilterWorkCategory] = useState("ALL");
  const [filterState, setFilterState] = useState("ALL");

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Restore Modal State
  const [restoreModalLead, setRestoreModalLead] = useState(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Fetch deleted leads from backend
  const fetchDeletedLeads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDeletedLeadsApi({ limit: 1000 });
      if (res && res.success && res.data?.leads) {
        setDeletedLeads(res.data.leads);
      } else {
        setDeletedLeads([]);
      }
    } catch (err) {
      console.error("Error fetching deleted leads:", err);
      toast.error("Failed to load deleted leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedLeads();
  }, [fetchDeletedLeads]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
    setFilterWorkCategory("ALL");
    setFilterState("ALL");
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterStatus !== "ALL") count++;
    if (filterWorkCategory !== "ALL") count++;
    if (filterState !== "ALL") count++;
    if (searchTerm.trim()) count++;
    return count;
  }, [filterStatus, filterWorkCategory, filterState, searchTerm]);

  // Filtered leads based on search and dropdown filters
  const filteredLeads = useMemo(() => {
    return deletedLeads.filter((lead) => {
      // 1. Text Search
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const name = (lead.clientName || lead.concernPersonName || "").toLowerCase();
        const phone = (lead.phoneNumber || lead.phone || "").toLowerCase();
        const leadId = (lead.leadId || "").toLowerCase();
        const city = (lead.city || "").toLowerCase();
        const email = (lead.emailAddress || lead.email || "").toLowerCase();
        const matchSearch =
          name.includes(term) ||
          phone.includes(term) ||
          leadId.includes(term) ||
          city.includes(term) ||
          email.includes(term);
        if (!matchSearch) return false;
      }

      // 2. Status Filter
      if (filterStatus !== "ALL") {
        const status = (lead.leadStatus || lead.status || "").toLowerCase();
        if (status !== filterStatus.toLowerCase()) return false;
      }

      // 3. Work Category Filter
      if (filterWorkCategory !== "ALL") {
        const rawCat = lead.workCategory || lead.businessType || "";
        const catStr = Array.isArray(rawCat) ? rawCat.join(", ") : String(rawCat);
        if (!catStr.toLowerCase().includes(filterWorkCategory.toLowerCase())) return false;
      }

      // 4. State Filter
      if (filterState !== "ALL") {
        const state = (lead.state || "").toLowerCase();
        if (!state.includes(filterState.toLowerCase())) return false;
      }

      return true;
    });
  }, [deletedLeads, searchTerm, filterStatus, filterWorkCategory, filterState]);

  // Pagination Calculations
  const totalItems = filteredLeads.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
  const startItem = totalItems > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  // Handle Confirm Restore
  const handleConfirmRestore = async () => {
    if (!restoreModalLead) return;
    const targetId = restoreModalLead._id || restoreModalLead.id || restoreModalLead.leadId;
    if (!targetId) return;

    try {
      setIsRestoring(true);
      const res = await restoreLeadApi(targetId);

      if (res && res.success) {
        toast.success(`Lead for "${restoreModalLead.clientName || 'Client'}" restored successfully! 🎉`);
        
        // Remove from deleted list locally
        setDeletedLeads((prev) => prev.filter((item) => (item._id || item.id) !== (restoreModalLead._id || restoreModalLead.id)));
        setRestoreModalLead(null);

        // Invalidate caches so Dashboard, Total Leads, etc. fetch fresh data
        invalidateCache("totalLeads");
        invalidateCache("dashboard_leads_all");
        invalidateCache("leadManagement");
        invalidateCache("sales_management_sheet");
        notifyLeadChange({ ...restoreModalLead, isDeleted: 0 });
      } else {
        toast.error(res?.message || "Failed to restore lead");
      }
    } catch (err) {
      console.error("Error restoring lead:", err);
      toast.error("An error occurred while restoring lead");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-3 font-sans pb-8">
      {/* 1. PAGE HEADER */}
      <PageHeader
        title="DELETED LEADS / TRASH"
        badge={`${deletedLeads.length} Deleted`}
        badgeColor="bg-rose-50 text-rose-700 border-rose-200"
        description="View and restore previously deleted leads back into your active sales pipeline."
        showBackButton={true}
        backPath="/sales/dashboard"
        rightActions={
          <div className="flex items-center gap-2">
            {/* Filter Toggle Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                showFilters
                  ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                  : "bg-[#FF5722] hover:bg-[#F4511E] border-[#FF5722] text-white shadow-xs"
              }`}
              title="Toggle Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="hidden sm:inline text-xs font-bold">
                {showFilters ? "Hide Filters" : "Filters"}
              </span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#FF5722] text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchDeletedLeads}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh list"
            >
              <FaSync className={`text-xs ${loading ? "animate-spin text-indigo-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Back to Dashboard */}
            <Link
              to="/sales/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        }
      />

      {/* 2. COLLAPSIBLE FILTER PANEL */}
      {showFilters && (
        <div className="bg-white border border-slate-200/90 shadow-2xs p-4 space-y-3 transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>Filter Deleted Leads</span>
              {activeFiltersCount > 0 && (
                <span className="text-[11px] font-bold text-amber-600">({activeFiltersCount} active)</span>
              )}
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <FaTimes className="text-[11px]" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Prior Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
            </div>

            {/* Work Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Work Category
              </label>
              <select
                value={filterWorkCategory}
                onChange={(e) => {
                  setFilterWorkCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500 cursor-pointer font-medium"
              >
                <option value="ALL">All Categories</option>
                {workCategoryList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                State
              </label>
              <select
                value={filterState}
                onChange={(e) => {
                  setFilterState(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500 cursor-pointer font-medium"
              >
                <option value="ALL">All States</option>
                {indianStatesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Action / Clear */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SEARCH & COUNTER BAR (Sharp rectangle, NO curves) */}
      <div className="p-2.5 bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by client, phone, lead ID..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 text-xs sm:text-sm font-medium focus:bg-white focus:border-black focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Counter Info */}
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{filteredLeads.length}</span> of{" "}
          <span className="font-bold text-slate-800">{deletedLeads.length}</span> deleted records
        </div>
      </div>

      {/* 4. DELETED LEADS TABLE (Sharp rectangle, NO curves / rounded-none) */}
      <div className="w-full bg-white border border-slate-200 shadow-2xs overflow-hidden rounded-none">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
                <th className="py-2.5 px-3 text-center w-12 border-r border-slate-800 whitespace-nowrap">
                  SR. NO.
                </th>
                <th className="py-2.5 px-3 text-center w-24 border-r border-slate-800 whitespace-nowrap">
                  ACTION
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                  LEAD ID
                </th>
                <th className="py-2.5 px-3 text-left border-r border-slate-800 whitespace-nowrap">
                  CLIENT DETAILS
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                  CITY / STATE
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                  WORK TYPE / CATEGORY
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                  EXPECTED BUSINESS
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                  PRIOR STATUS
                </th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">
                  DELETED / UPDATED AT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-semibold text-slate-600">Loading deleted leads...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-400 text-xl border border-slate-200">
                        <FaTrashRestore />
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {searchTerm || activeFiltersCount > 0 ? "No Matching Deleted Leads Found" : "No Deleted Leads in Trash"}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {searchTerm || activeFiltersCount > 0
                          ? "Try changing or resetting your search and filter criteria."
                          : "Deleted leads will appear here. You can restore them anytime back to your pipeline."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead, index) => {
                  const leadIdDisplay = lead.leadId || (lead._id ? `LD-${String(lead._id).slice(-4).toUpperCase()}` : `LD-${index + 1}`);
                  const amt = Number(lead.expectedBusiness || lead.budget || lead.amount || 0);
                  const dateStr = lead.updatedAt || lead.createdAt || lead.date;
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                    : "--";
                  const formattedTime = dateStr
                    ? new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                    : "";

                  const statusStr = (lead.leadStatus || lead.status || "Cold").toUpperCase();
                  const isHot = statusStr === "HOT";
                  const isWarm = statusStr === "WARM";

                  const workTypes = Array.isArray(lead.workType)
                    ? lead.workType.join(", ")
                    : lead.workType || (Array.isArray(lead.workCategory) ? lead.workCategory.join(", ") : lead.workCategory || "--");

                  const srNo = startItem + index;

                  return (
                    <tr
                      key={lead._id || lead.id || index}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      {/* 1. SR. NO. */}
                      <td className="py-2.5 px-3 text-center font-bold text-slate-600 border-r border-slate-100 whitespace-nowrap">
                        {srNo}
                      </td>

                      {/* 2. ACTION: RESTORE BUTTON */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isUserObserver}
                            onClick={() => {
                              if (isUserObserver) {
                                toast.info("Observer Mode: Restoring leads is disabled.");
                              } else {
                                setRestoreModalLead(lead);
                              }
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border font-bold text-xs transition-all shadow-2xs active:scale-95 ${
                              isUserObserver
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 hover:border-emerald-400 cursor-pointer shadow-xs"
                            }`}
                            title="Restore this lead to active pipeline"
                          >
                            <FaUndo className="text-xs" />
                            <span>Restore</span>
                          </button>
                        </div>
                      </td>

                      {/* 3. LEAD ID */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                          {leadIdDisplay}
                        </span>
                      </td>

                      {/* 4. CLIENT DETAILS */}
                      <td className="py-2.5 px-3 text-left border-r border-slate-100">
                        <div className="font-bold text-slate-900">{lead.clientName || lead.concernPersonName || "--"}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{lead.phoneNumber || lead.phone || "--"}</div>
                        {lead.emailAddress && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                            {lead.emailAddress}
                          </div>
                        )}
                      </td>

                      {/* 5. LOCATION */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{lead.city || "--"}</div>
                        {lead.state && <div className="text-[10px] text-slate-400">{lead.state}</div>}
                      </td>

                      {/* 6. WORK TYPE / CATEGORY */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[180px]">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-indigo-800 bg-indigo-50 border border-indigo-200 font-medium text-[11px] truncate max-w-[170px]"
                          title={workTypes}
                        >
                          {workTypes}
                        </span>
                      </td>

                      {/* 7. EXPECTED BUSINESS */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                          ₹{amt.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* 8. PRIOR STATUS */}
                      <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                            isHot
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : isWarm
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-50 text-slate-700 border-slate-200"
                          }`}
                        >
                          {lead.leadStatus || lead.status || "Cold"}
                        </span>
                      </td>

                      {/* 9. DELETED AT */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="font-bold text-slate-700">{formattedDate}</div>
                        {formattedTime && <div className="text-[10px] text-slate-400 font-mono">{formattedTime}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        {totalItems > 0 && !loading && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-3 border-t border-slate-200 bg-slate-50/70 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium">
              <span>
                Showing <strong className="text-slate-900 font-bold">{startItem}</strong> to{" "}
                <strong className="text-slate-900 font-bold">{endItem}</strong> of{" "}
                <strong className="text-slate-900 font-bold">{totalItems}</strong> entries
              </span>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-slate-500 font-bold text-xs">Per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {[10, 25, 50, 100].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 border border-slate-300 bg-white font-mono font-bold text-xs text-slate-800 shadow-2xs">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 border border-slate-300 bg-white text-slate-700 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= 6. RESTORE CONFIRMATION MODAL ================= */}
      {restoreModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Title & Icon */}
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <FaUndo className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-extrabold text-slate-900">
                  Restore Lead?
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed font-medium">
                  Are you sure you want to restore this lead? It will be moved back to your active pipeline.
                </p>
                {restoreModalLead.clientName && (
                  <p className="mt-2 inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 truncate max-w-full">
                    {restoreModalLead.clientName}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons: Cancel & Restore */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setRestoreModalLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <FaUndo className="w-3 h-3" />
                    <span>Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeletedLeadsTable;
