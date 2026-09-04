import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { availableWorkTypes, workCategoryList, leadTypesList } from "../../data/addLeadData";
import { FaFilter, FaSearch, FaUserPlus } from "react-icons/fa";

const leadModesList = [
  "ALL",
  "Business networking",
  "By freelancer",
  "By sales Team",
  "Customer to customer"
];

import { subscribeToLeadUpdates, getStoredLeads } from "../../utils/leadStorageUtils";
import { getLossLeadsApi, getAllLossLeadsApi } from "../../../../services/lostLeads.api";
import { useLeadContext } from "../../../../context/LeadContext";

const Lostlead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [leads, setLeads] = useState(() => {
    if (location.state?.lostLead) {
      return [location.state.lostLead];
    }
    return [];
  });
  const { getCachedData, setCachedData, invalidateCache } = useLeadContext();

  const fetchBackendLossLeads = React.useCallback(async (forceRefresh = false) => {
    const cacheKey = "lostLeads_all";
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        setLeads(cached.data);
        return;
      }
    }
    try {
      let rawData = [];

      // 1. Fetch authoritative loss leads
      try {
        const resDirect = await getAllLossLeadsApi({ limit: 200 });
        if (resDirect && resDirect.success && resDirect.data) {
          rawData = Array.isArray(resDirect.data)
            ? resDirect.data
            : (resDirect.data.leads || resDirect.data.lossLeads || resDirect.data.data || []);
        }
      } catch (err) {
        console.warn("getAllLossLeadsApi warning:", err);
      }

      // Fallback to getLossLeadsApi only if direct endpoint returned empty or failed
      if (!rawData || rawData.length === 0) {
        try {
          const res = await getLossLeadsApi({ limit: 200 });
          if (res && res.success && res.data) {
            rawData = Array.isArray(res.data)
              ? res.data
              : (res.data.leads || res.data.lossLeads || res.data.data || []);
          }
        } catch (err) {
          console.warn("getLossLeadsApi fallback warning:", err);
        }
      }

      const seen = new Set();
      const uniqueProcessed = [];

      (rawData || []).forEach((item) => {
        const leadRefId = item.lead?._id ? String(item.lead._id) : (typeof item.lead === "string" ? item.lead : "");
        const leadId = item.leadId ? String(item.leadId).trim() : "";
        const phone = (item.phoneNumber || item.phone) ? String(item.phoneNumber || item.phone).trim() : "";
        const id = item._id ? String(item._id) : "";

        const isDup =
          (id && seen.has("id:" + id)) ||
          (leadRefId && seen.has("id:" + leadRefId)) ||
          (leadId && seen.has("code:" + leadId)) ||
          (phone && phone !== "--" && seen.has("phone:" + phone));

        if (isDup) return;

        if (id) seen.add("id:" + id);
        if (leadRefId) seen.add("id:" + leadRefId);
        if (leadId) seen.add("code:" + leadId);
        if (phone && phone !== "--") seen.add("phone:" + phone);

        const dateObj = new Date(item.lossDate || item.createdAt || Date.now());
        const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        const formattedTime = item.createdTime || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const leadObj = (item.lead && typeof item.lead === "object") ? item.lead : {};
        const assignee = item.salesPerson || (typeof item.assignedTo === 'object' ? item.assignedTo?.name : item.assignedTo) || leadObj.salesPerson || (typeof leadObj.assignedTo === 'object' ? leadObj.assignedTo?.name : leadObj.assignedTo) || "Admin";

        const processed = {
          ...leadObj,
          ...item,
          id: item.leadId || item._id || item.id || leadObj.leadId || leadObj._id,
          leadId: item.leadId || leadObj.leadId || item._id || item.id,
          _id: item._id || leadObj._id,
          clientName: item.clientName || item.concernPersonName || leadObj.clientName || leadObj.concernPersonName || "Client",
          concernPersonName: item.clientName || item.concernPersonName || leadObj.clientName || leadObj.concernPersonName || "Client",
          phoneNumber: item.phoneNumber || item.phone || item.contact || leadObj.phoneNumber || leadObj.phone || leadObj.contact || "--",
          contact: item.phoneNumber || item.phone || item.contact || leadObj.phoneNumber || leadObj.phone || leadObj.contact || "--",
          alternateNumber: item.alternateNumber || leadObj.alternateNumber || "--",
          emailAddress: item.emailAddress || item.email || leadObj.emailAddress || leadObj.email || "--",
          email: item.emailAddress || item.email || leadObj.emailAddress || leadObj.email || "--",
          workCategory: item.workCategory || leadObj.workCategory || "Design",
          workType: (Array.isArray(item.workType) && item.workType.length > 0)
            ? item.workType
            : (item.workType ? [item.workType] : ((Array.isArray(leadObj.workType) && leadObj.workType.length > 0) ? leadObj.workType : (leadObj.workType ? [leadObj.workType] : ["Concept Drawing"]))),
          address: item.address || leadObj.address || item.siteAddress || leadObj.siteAddress || "--",
          city: item.city || leadObj.city || "--",
          pincode: item.pincode || leadObj.pincode || "--",
          state: item.state || leadObj.state || "--",
          projectDetail: item.projectDetail || leadObj.projectDetail || item.projectDetails || leadObj.projectDetails || item.notes || leadObj.notes || "--",
          expectedBusiness: String(item.expectedBusiness || item.budget || leadObj.expectedBusiness || leadObj.budget || 0),
          reason: item.lossReason || item.reason || leadObj.lossReason || leadObj.reason || "Closed Lost",
          lostReason: item.lossReason || item.reason || leadObj.lossReason || leadObj.reason || "Closed Lost",
          remark: item.lossRemark || item.remark || item.requirement || leadObj.lossRemark || leadObj.remark || leadObj.requirement || item.notes || leadObj.notes || "--",
          lossDate: formattedDate,
          createdDate: formattedDate,
          createdTime: formattedTime,
          date: item.date || leadObj.date || formattedDate,
          salesPerson: assignee,
          assignedTo: assignee,
          assignTo: assignee,
          leadMode: item.leadMode || item.leadSource || leadObj.leadMode || leadObj.leadSource || "Business networking",
          leadSource: item.leadSource || item.leadMode || leadObj.leadSource || leadObj.leadMode || "Business networking",
          leadType: item.leadType || leadObj.leadType || "FRESH",
          leadStatus: (item.leadStatus === "CLOSED_LOST" || item.status === "CLOSED_LOST" || !item.leadStatus) ? "LOST" : item.leadStatus,
          status: (item.status === "CLOSED_LOST" || !item.status) ? "LOST" : item.status
        };

        uniqueProcessed.push(processed);
      });

      setLeads(uniqueProcessed);
      setCachedData(cacheKey, uniqueProcessed);
    } catch (err) {
      console.error("Error fetching loss leads from API:", err);
    }
  }, [getCachedData, setCachedData]);

  React.useEffect(() => {
    if (location.state?.lostLead) {
      const incoming = location.state.lostLead;
      setLeads((prev) => {
        const exists = prev.some((l) => String(l.id || l._id || l.leadId) === String(incoming.id || incoming._id || incoming.leadId));
        if (exists) return prev;
        return [incoming, ...prev];
      });
    }
    fetchBackendLossLeads(Boolean(location.state?.lostLead));
    const unsubscribe = subscribeToLeadUpdates((updatedData) => {
      if (updatedData?.lead && (updatedData.lead.isLoss || updatedData.lead.status === "CLOSED_LOST" || updatedData.lead.status === "NOT INTERESTED")) {
        setLeads((prev) => {
          const exists = prev.some((l) => String(l.id || l._id || l.leadId) === String(updatedData.lead.id || updatedData.lead._id || updatedData.lead.leadId));
          if (exists) {
            return prev.map((l) => String(l.id || l._id || l.leadId) === String(updatedData.lead.id || updatedData.lead._id || updatedData.lead.leadId) ? { ...l, ...updatedData.lead } : l);
          }
          return [updatedData.lead, ...prev];
        });
      }
      fetchBackendLossLeads(true);
    });

    return () => unsubscribe();
  }, [fetchBackendLossLeads, location.state]);

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
  };

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeadMode, setFilterLeadMode] = useState("ALL");
  const [filterLeadType, setFilterLeadType] = useState("ALL");
  const [filterWorkCategory, setFilterWorkCategory] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");

  // Pagination States
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [selectedLead, setSelectedLead] = useState(null);
  const [reviveModalLead, setReviveModalLead] = useState(null);
  const [reviveStatus, setReviveStatus] = useState("Warm");
  const [reviveNotes, setReviveNotes] = useState("");

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLeadMode("ALL");
    setFilterLeadType("ALL");
    setFilterWorkCategory("ALL");
    setFilterWorkType("ALL");
    setFilterStatus("ALL");
    setFilterDateFrom("");
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const exportData = filteredLeads;
    const headers = [
      "Lead ID",
      "Lost Date",
      "Client Name",
      "Contact",
      "Email",
      "Lost Reason",
      "Lead Type",
      "Lead Status",
      "Lead Mode",
      "Work Category",
      "Work Type",
      "Expected Business",
      "City",
      "State",
      "Remark"
    ];
    const rows = exportData.map((l) => [
      l.id || l.leadId || "",
      l.lostDate || l.date || "",
      `"${l.clientName || l.concernPersonName || ""}"`,
      l.phoneNumber || l.contact || "",
      l.emailAddress || l.email || "",
      `"${l.lostReason || l.reason || ""}"`,
      l.leadType || "",
      l.leadStatus || "",
      l.leadMode || "",
      l.workCategory || "",
      Array.isArray(l.workType) ? `"${l.workType.join(" | ")}"` : `"${l.workType || ""}"`,
      l.expectedBusiness || 0,
      `"${l.city || ""}"`,
      `"${l.state || ""}"`,
      `"${(l.remark || l.lossRemark || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lost_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Table Column Configuration - Standardized across the application
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
      render: (val, row) => (
        <div className="flex items-center justify-center gap-1.5">
          {/* View Lost Lead Details Eye Button */}
          <button
            type="button"
            onClick={() => setSelectedLead(row)}
            className="w-7 h-7 rounded-lg border border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 hover:border-orange-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="View Lost Lead Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* Revive Lead Button */}
          <button
            type="button"
            onClick={() => setReviveModalLead(row)}
            className="w-7 h-7 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
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
      align: "center",
      render: (val, row) => {
        const rawDate = row.lostDate || val || row.createdDate || row.createdAt || row.date || Date.now();
        let dateStr = "--";
        let timeStr = row.createdTime || row.lostTime || "";

        const str = String(rawDate);
        if (str.includes(",")) {
          const parts = str.split(",");
          dateStr = parts[0].trim();
          if (!timeStr && parts[1]) {
            timeStr = parts[1].trim();
          }
        } else {
          dateStr = str;
        }

        try {
          const parseTarget = dateStr.includes("/") ? dateStr.split("/").reverse().join("-") : dateStr;
          const d = new Date(parseTarget);
          if (!isNaN(d.getTime())) {
            dateStr = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
          }
        } catch (e) {}

        if (!timeStr) timeStr = "11:00 am";

        return (
          <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200/90 shadow-2xs">
            <span className="font-extrabold text-xs whitespace-nowrap">{dateStr}</span>
            <span className="font-mono text-[10px] font-bold text-rose-700 whitespace-nowrap">{timeStr}</span>
          </div>
        );
      }
    },
    lostReason: {
      label: "LOST REASON",
      align: "center",
      render: (val, row) => (
        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
          {row.lostReason || val || "Client Not Interested"}
        </span>
      )
    },
    clientDetails: {
      label: "CLIENT DETAILS",
      align: "center",
      render: (val, row) => {
        const name = row.clientName || row.concernPersonName || "--";
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        const email = row.emailAddress || row.email || "--";

        return (
          <div className="text-xs space-y-0.5 max-w-[160px] mx-auto text-center">
            <div className="mb-0.5">
              <span
                className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs inline-block truncate max-w-full text-xs cursor-pointer hover:text-blue-600"
                title={name}
                onClick={() => setSelectedLead(row)}
              >
                {name}
              </span>
            </div>
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
      align: "center",
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
      align: "center",
      render: (val, row) => {
        const rawStatus = row.leadStatus || row.status || "Lost";
        const status = (rawStatus.toUpperCase() === "CLOSED_LOST" ? "LOST" : rawStatus).toUpperCase();
        const colors = {
          HOT: "bg-rose-100 text-rose-800 border-rose-200",
          WARM: "bg-amber-100 text-amber-800 border-amber-200",
          COLD: "bg-sky-100 text-sky-800 border-sky-200",
          LOST: "bg-rose-100 text-rose-800 border-rose-200"
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${colors[status] || "bg-rose-100 text-rose-800 border-rose-200"}`}>
            {status}
          </span>
        );
      }
    },
    leadMode: {
      label: "LEAD MODE",
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.leadMode || row.leadSource || "Business networking"}
        </span>
      )
    },
    workCategory: {
      label: "WORK CATEGORY",
      align: "center",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.workCategory || "Design"}
        </span>
      )
    },
    workType: {
      label: "WORK TYPE",
      align: "center",
      render: (val, row) => {
        const wt = Array.isArray(row.workType)
          ? row.workType.join(", ")
          : (row.workType || "Concept Drawing");
        return (
          <div className="max-w-[140px] truncate text-xs font-medium text-slate-700 mx-auto text-center" title={wt}>
            {wt}
          </div>
        );
      }
    },
    alternateNumber: {
      label: "ALTERNATE NUMBER",
      align: "center",
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
      align: "center",
      render: (val, row) => {
        const addr = row.address || row.siteAddress || "--";
        return (
          <div className="max-w-[140px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={addr}>
            {addr}
          </div>
        );
      }
    },
    pincode: {
      label: "PINCODE",
      align: "center",
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-700 font-bold">
          {row.pincode || "--"}
        </span>
      )
    },
    city: {
      label: "CITY",
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.city || "--"}
        </span>
      )
    },
    state: {
      label: "STATE",
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.state || "--"}
        </span>
      )
    },
    expectedBusiness: {
      label: "EXPECTED BUSINESS (₹)",
      align: "center",
      render: (val, row) => {
        const amt = Number(row.expectedBusinessAmount || row.expectedBusiness || row.expectedRevenue || 0);
        return (
          <span className="text-xs font-mono font-bold text-rose-700">
            ₹{amt.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    projectDetail: {
      label: "PROJECT DETAIL",
      align: "center",
      render: (val, row) => {
        const pd = row.projectDetail || row.projectDetails || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={pd}>
            {pd}
          </div>
        );
      }
    },
    remark: {
      label: "REMARK",
      align: "center",
      render: (val, row) => {
        const rem = row.remark || row.requirement || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={rem}>
            {rem}
          </div>
        );
      }
    }
  }), [currentPage, rowsPerPage]);

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      // 1. Search Query Filter
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.clientName?.toLowerCase().includes(search) ||
        item.concernPersonName?.toLowerCase().includes(search) ||
        item.phoneNumber?.includes(search) ||
        item.emailAddress?.toLowerCase().includes(search) ||
        item.lostReason?.toLowerCase().includes(search) ||
        item.city?.toLowerCase().includes(search);

      if (!matchSearch) return false;

      // 2. Dropdown Filters
      if (filterLeadMode !== "ALL" && (item.leadMode || item.leadSource) !== filterLeadMode) return false;
      if (filterLeadType !== "ALL" && item.leadType !== filterLeadType) return false;
      if (filterWorkCategory !== "ALL" && (item.workCategory || item.leadLabel) !== filterWorkCategory) return false;
      if (filterWorkType !== "ALL" && (item.workType || item.jobType) !== filterWorkType) return false;
      if (
        filterStatus !== "ALL" &&
        (item.leadStatus || "").toUpperCase() !== filterStatus.toUpperCase() &&
        (item.status || "").toUpperCase() !== filterStatus.toUpperCase()
      ) return false;

      // 3. Date Filter
      if (filterDateFrom && !(item.createdDate || item.date || item.lostDate || "").includes(filterDateFrom)) return false;

      return true;
    });
  }, [
    leads,
    searchTerm,
    filterLeadMode,
    filterLeadType,
    filterWorkCategory,
    filterWorkType,
    filterStatus,
    filterDateFrom
  ]);

  const totalLostAmount = useMemo(() => {
    return filteredLeads.reduce((sum, item) => sum + (Number(item.expectedBusiness || item.expectedBusinessAmount || item.expectedRevenue) || 0), 0);
  }, [filteredLeads]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const handleReviveSubmit = () => {
    if (!reviveModalLead) return;

    const revivedItem = {
      ...reviveModalLead,
      leadStatus: reviveStatus,
      isAssigned: false,
      nextFollowup: "Re-opened - Followup Scheduled",
      remark: `${reviveModalLead.remark || ""} [Reopened: ${reviveNotes || "Revived lead for fresh negotiation"}]`
    };

    const updatedLost = leads.filter((l) => l.id !== reviveModalLead.id);
    saveLeads(updatedLost);
    notifyLeadChange(revivedItem);

    setReviveModalLead(null);
    setReviveNotes("");
  };

  return (
    <div className="space-y-4 font-sans pb-16">
      
      {/* ================= 1. SUB-HEADER / ACTIONS ================= */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Lost Leads Directory"
          badge="Lost Leads"
          badgeColor="bg-rose-100 text-rose-800 border-rose-300"
          description={`Showing ${paginatedLeads.length} of ${filteredLeads.length} closed lost leads`}
          showBackButton={true}
          rightActions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                title="Export CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/sales/leads/add")}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Add Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showFilters
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-[#FF5722] hover:bg-[#F4511E] border-[#FF5722] text-white shadow-xs"
                }`}
                title="Toggle Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          }
        />
      </div>

      {/* ================= 2. COLLAPSIBLE FILTER PANEL ================= */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 transition-all">
          {/* Top Search, Show Dropdown & Status Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
              {/* Rows Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-600">Show:</span>
                <div className="relative w-20">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Real-time Search */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔍
                </span>
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
            </div>

            {/* Quick Status Tabs (ALL, LOST, HOT, WARM, COLD) */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {["ALL", "LOST", "HOT", "WARM", "COLD"].map((st) => (
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
                onChange={(e) => {
                  setFilterLeadType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Type</option>
                {leadTypesList.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* 2. Lead Mode */}
              <select
                value={filterLeadMode}
                onChange={(e) => {
                  setFilterLeadMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Mode</option>
                {leadModesList.filter((m) => m !== "ALL").map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* 3. Lead Status */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Status</option>
                {["LOST", "Hot", "Warm", "Cold"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* 4. Work Category */}
              <select
                value={filterWorkCategory}
                onChange={(e) => {
                  setFilterWorkCategory(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setFilterWorkType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Work Type</option>
                {availableWorkTypes.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Row 2: Date Picker & Orange Reset Button */}
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

      {/* ================= 3. TABLE COMPONENT ================= */}
      <Table
        columnConfig={columnConfig}
        data={paginatedLeads}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(limit) => {
          setRowsPerPage(limit);
          setCurrentPage(1);
        }}
        itemsPerPageOptions={[10, 25, 50, 100]}
      />

      {/* ================= 4. REVIVE MODAL ================= */}
      {reviveModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">Revive / Reopen Lead</h3>
              <p className="text-xs text-slate-500 mt-0.5">Client: <strong className="text-slate-800">{reviveModalLead.clientName || reviveModalLead.concernPersonName}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lead Priority Status</label>
              <select value={reviveStatus} onChange={(e) => setReviveStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white cursor-pointer">
                <option value="Hot">Hot Lead 🔥</option>
                <option value="Warm">Warm Lead ⚡</option>
                <option value="Cold">Cold Lead ❄️</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Revive Notes / Remarks</label>
              <textarea
                value={reviveNotes}
                onChange={(e) => setReviveNotes(e.target.value)}
                placeholder="Enter negotiation notes..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setReviveModalLead(null)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={handleReviveSubmit} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">Revive Lead</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. DETAIL VIEW MODAL ================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">Lost Lead Details</h3>
              <button type="button" onClick={() => setSelectedLead(null)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 text-xs cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Client Name:</strong> {selectedLead.clientName || selectedLead.concernPersonName}</p>
              <p><strong>Phone:</strong> {selectedLead.phoneNumber || selectedLead.contact}</p>
              <p><strong>Email:</strong> {selectedLead.emailAddress || selectedLead.email || "--"}</p>
              <p><strong>Lost Reason:</strong> <span className="text-rose-700 font-bold">{selectedLead.lostReason || "Client Not Interested"}</span></p>
              <p><strong>Expected Business:</strong> ₹{Number(selectedLead.expectedBusiness || selectedLead.expectedBusinessAmount || 0).toLocaleString("en-IN")}</p>
              <p><strong>Remarks:</strong> {selectedLead.remark || selectedLead.remarks || "--"}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button type="button" onClick={() => setSelectedLead(null)} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lostlead;