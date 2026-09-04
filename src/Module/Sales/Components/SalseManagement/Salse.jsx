import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { subscribeToLeadUpdates } from "../../utils/leadStorageUtils";
import { getAllLeadsApi } from "../../../../services/totalLeads.api";
import { useLeadContext } from "../../../../context/LeadContext";
import { workCategoryList } from "../../data/addLeadData";
import { FaFilter, FaSearch } from "react-icons/fa";

const Salse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [salesData, setSalesData] = useState(() => {
    if (location.state?.lead) {
      const incomingLead = location.state.lead;
      const cleanId = incomingLead.leadId || incomingLead.clientId || incomingLead.id || incomingLead._id;
      const dateObj = new Date(incomingLead.createdAt || incomingLead.date || Date.now());
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
        : (incomingLead.createdDate || incomingLead.date || "--");
      const formattedTime = incomingLead.createdTime || (!isNaN(dateObj.getTime())
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : "11:00 am");

      return [{
        ...incomingLead,
        id: cleanId,
        leadId: cleanId,
        clientId: cleanId,
        createdDate: formattedDate,
        createdTime: formattedTime,
        date: formattedDate
      }];
    }
    return [];
  });

  const { getCachedData, setCachedData } = useLeadContext();

  const fetchSalesLeads = useCallback(async (forceRefresh = false) => {
    const cacheKey = "sales_management_sheet_all";
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        setSalesData(cached.data);
        return;
      }
    }

    try {
      const res = await getAllLeadsApi({ limit: 200, isLoss: false });
      if (res && res.success && res.data && res.data.leads) {
        const interestedLeads = res.data.leads
          .filter(
            (item) =>
              !item.isLoss &&
              !["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(item.leadStatus || "").toUpperCase()) &&
              !["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(item.status || "").toUpperCase()) &&
              (item.status === "INTERESTED" || item.leadStatus === "INTERESTED" || item.isInterested === true)
          )
          .map((item) => {
            const dateObj = new Date(item.createdAt || item.date || Date.now());
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
              : (item.createdDate || item.date || "--");
            const formattedTime = item.createdTime || (!isNaN(dateObj.getTime())
              ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
              : "11:00 am");

            const cleanId = item.leadId || item.clientId || item.id || (item._id && !String(item._id).match(/^[0-9a-fA-F]{24}$/) ? item._id : `LD-${String(item._id || '').slice(-4).toUpperCase()}`);

            return {
              ...item,
              id: cleanId,
              leadId: cleanId,
              clientId: cleanId,
              createdDate: formattedDate,
              createdTime: formattedTime,
              date: formattedDate
            };
          });

        // Ensure newly transferred lead is prepended if not yet synced in this batch
        if (location.state?.lead) {
          const incomingLead = location.state.lead;
          const incId = incomingLead.leadId || incomingLead.clientId || incomingLead.id || incomingLead._id;
          const exists = interestedLeads.some(l => (l.leadId || l.clientId || l.id || l._id) === incId);
          if (!exists) {
            const dateObj = new Date(incomingLead.createdAt || incomingLead.date || Date.now());
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
              : (incomingLead.createdDate || incomingLead.date || "--");
            const formattedTime = incomingLead.createdTime || (!isNaN(dateObj.getTime())
              ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
              : "11:00 am");
            const cleanId = incId || `LD-${String(incomingLead._id || '').slice(-4).toUpperCase()}`;

            interestedLeads.unshift({
              ...incomingLead,
              id: cleanId,
              leadId: cleanId,
              clientId: cleanId,
              createdDate: formattedDate,
              createdTime: formattedTime,
              date: formattedDate
            });
          }
        }

        // Sort descending: newest / most recently updated lead always appears at the top!
        interestedLeads.sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.movedToSalesManagementDate || a.createdAt || a.date || 0).getTime();
          const timeB = new Date(b.updatedAt || b.movedToSalesManagementDate || b.createdAt || b.date || 0).getTime();
          return timeB - timeA;
        });

        setSalesData(interestedLeads);
        setCachedData(cacheKey, interestedLeads);
      }
    } catch (err) {
      console.error("Error fetching sales management sheet leads:", err);
    }
  }, [getCachedData, setCachedData, location.state]);

  useEffect(() => {
    // If arriving from transfer form, force refresh to fetch latest from DB
    const force = Boolean(location.state?.lead);
    fetchSalesLeads(force);
    const unsubscribe = subscribeToLeadUpdates(() => {
      fetchSalesLeads(true);
    });
    return () => unsubscribe();
  }, [fetchSalesLeads, location.state]);

  // Filter States
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterJobType, setFilterJobType] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Table Column Configuration
  const columnConfig = useMemo(
    () => ({
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
        render: (val, row) => (
          <button
            type="button"
            onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
            className="w-7 h-7 rounded-lg border border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 hover:border-orange-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs mx-auto active:scale-95"
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
        align: "center",
        render: (val, row) => {
          const amt = Number(row.amount || row.expectedBusiness || 0);
          return (
            <span className="inline-block px-3 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
              ₹{amt.toLocaleString("en-IN")}
            </span>
          );
        }
      },
      clientId: {
        label: "CLIENT ID",
        align: "center",
        render: (val, row) => {
          const cid = row.clientId || row.leadId || row.id || (row._id && !String(row._id).match(/^[0-9a-fA-F]{24}$/) ? row._id : `LD-${String(row._id || '').slice(-4).toUpperCase()}`);
          return (
            <span className="font-mono font-bold text-slate-700 text-xs">{cid || "--"}</span>
          );
        }
      },
      clientName: {
        label: "CLIENT",
        align: "left",
        render: (val, row) => (
          <div className="text-left font-medium text-slate-800 text-xs">
            <div
              className="font-bold text-slate-900 cursor-pointer hover:text-blue-600 hover:underline"
              onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
            >
              {row.clientName || row.concernPersonName || "--"}
            </div>
            <div className="text-xs text-slate-600 font-mono font-medium">{row.phoneNumber || row.contact || "--"}</div>
            {row.emailAddress && row.emailAddress !== "--" && (
              <div className="text-xs text-slate-400 truncate max-w-[160px]">{row.emailAddress}</div>
            )}
          </div>
        )
      },
      priority: {
        label: "PRIORITY",
        align: "center",
        render: (val, row) => {
          const p = (val || row.priority || row.leadLabel || "LOW").toUpperCase();
          const isHigh = p === "HIGH" || p === "HOT";
          const isMedium = p === "MEDIUM" || p === "WARM";
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                isHigh
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : isMedium
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isHigh ? "🔴 High" : isMedium ? "🟡 Medium" : "🟢 Low"}
            </span>
          );
        }
      },
      status: {
        label: "STATUS",
        align: "center",
        render: (val, row) => {
          const s = (val || row.status || "INTERESTED").toUpperCase();
          return (
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs">
              {s}
            </span>
          );
        }
      },
      createdAt: {
        label: "CREATED AT",
        align: "center",
        render: (val, row) => {
          let dateStr = row.createdDate || row.date;
          if (!dateStr || dateStr.includes("T") || dateStr.includes("Z")) {
            const dateObj = new Date(row.createdAt || row.createdDate || row.date || Date.now());
            dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
              : "03 Sept 2026";
          }
          const timeStr = row.createdTime || "11:00 am";
          return (
            <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs">
              <span className="font-extrabold text-xs whitespace-nowrap">{dateStr}</span>
              <span className="font-mono text-[10px] font-bold text-blue-700 whitespace-nowrap">{timeStr}</span>
            </div>
          );
        }
      },
      businessType: {
        label: "BUSINESS TYPE",
        align: "center",
        render: (val, row) => <span className="text-xs font-medium text-slate-700">{row.businessType || row.workCategory || "--"}</span>
      },
      leadType: {
        label: "LEAD TYPE",
        align: "center",
        render: (val, row) => {
          const type = (row.leadType || row.jobType || "FRESH").toUpperCase();
          const isRepeat = type.includes("REPEAT");
          return (
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${
                isRepeat
                  ? "bg-purple-50 text-purple-700 border-purple-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {type}
            </span>
          );
        }
      },
      city: {
        label: "CITY",
        align: "center",
        render: (val, row) => <span className="text-xs font-semibold text-slate-800">{row.city || "--"}</span>
      },
      pincode: {
        label: "PINCODE",
        align: "center",
        render: (val, row) => <span className="font-mono text-slate-600 text-xs">{row.pincode || "--"}</span>
      },
      requirement: {
        label: "REQUIREMENT",
        align: "center",
        render: (val, row) => (
          <div className="max-w-[160px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={row.requirement}>
            {row.requirement || "--"}
          </div>
        )
      },
      address: {
        label: "ADDRESS",
        align: "center",
        render: (val, row) => (
          <div className="max-w-[150px] truncate text-xs text-slate-600 font-medium mx-auto text-center" title={row.address}>
            {row.address || "--"}
          </div>
        )
      }
    }),
    [navigate, currentPage, rowsPerPage]
  );

  // KPI numbers
  const stats = useMemo(() => {
    const totalAmt = salesData.reduce((sum, d) => sum + Number(d.amount || d.expectedBusiness || 0), 0);
    return {
      totalAmountFormatted: `₹${totalAmt.toLocaleString("en-IN")}`,
      qualified: salesData.length,
      followedUp: salesData.filter((d) => d.status === "INTERESTED" || d.isInterested).length
    };
  }, [salesData]);

  // Cities List for filter
  const citiesList = useMemo(() => {
    const set = new Set(salesData.map((d) => d.city).filter((c) => c && c !== "--"));
    return ["all", ...Array.from(set)];
  }, [salesData]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return salesData.filter((item) => {
      if (selectedPriority !== "all") {
        const p = (item.priority || item.leadLabel || "").toLowerCase();
        if (selectedPriority === "high" && p !== "high" && p !== "hot") return false;
        if (selectedPriority === "medium" && p !== "medium" && p !== "warm") return false;
        if (selectedPriority === "low" && p !== "low" && p !== "cold") return false;
      }

      if (selectedCity !== "all" && item.city !== selectedCity) return false;
      if (filterCategory !== "All" && (item.businessType || item.workCategory) !== filterCategory) return false;
      if (filterJobType !== "All" && item.jobType !== filterJobType) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (item.clientName || item.concernPersonName || "").toLowerCase().includes(q) ||
          (item.clientId || "").toLowerCase().includes(q) ||
          (item.phoneNumber || "").includes(q) ||
          (item.city || "").toLowerCase().includes(q) ||
          (item.requirement || "").toLowerCase().includes(q) ||
          (item.address || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [salesData, selectedPriority, selectedCity, filterCategory, filterJobType, searchTerm]);

  // Paginated Data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPriority("all");
    setSelectedCity("all");
    setFilterCategory("All");
    setFilterJobType("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 font-sans pb-16 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* ================= 1. SUB-HEADER BANNER ================= */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Sales Management Sheet"
          badge="Executive Overview"
          badgeColor="bg-purple-100 text-purple-800 border-purple-300"
          description="Track active pipeline health, expected vs achieved target revenues and incentive structures."
          showBackButton={true}
          rightActions={
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-2xs font-bold text-xs sm:text-sm ${
                showFilters
                  ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-2xs"
                  : "bg-[#FF5722] text-white border-[#FF5722] hover:bg-[#e64a19]"
              }`}
              title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          }
        />
      </div>

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

      {/* COLLAPSIBLE ADVANCED FILTER BAR */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FaFilter className="text-orange-500 text-sm" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                Advanced Filter Options
              </h3>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Search</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search Client Name, ID, Phone..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Work Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="All">All Categories</option>
                {workCategoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => { setSelectedPriority(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="all">All Cities</option>
                {citiesList.filter((c) => c !== "all").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. MAIN DATA TABLE ================= */}
      <Table
        data={paginatedData}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

    </div>
  );
};

export default Salse;