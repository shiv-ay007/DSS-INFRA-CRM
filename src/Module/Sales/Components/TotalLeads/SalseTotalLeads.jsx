import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { initialTotalLeads as initialLeadsData } from "../../data/totalLeadsData";

const salesPersonsList = [
  "ALL",
  "Sales TL (Current User)",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta"
];

const workTypesList = [
  "ALL",
  "Digital Signage",
  "LED Video Wall",
  "Indoor Display",
  "Outdoor Billboard",
  "Interactive Kiosk",
  "Software / CMS",
  "Maintenance & AMC"
];

const citiesList = [
  "ALL",
  "Noida",
  "Delhi NCR",
  "Gurugram",
  "Mumbai",
  "Bengaluru",
  "Jaipur"
];

const SalseTotalLeads = () => {
  const navigate = useNavigate();

  // Load leads from localStorage or default dataset
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("dss_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : initialLeadsData;
      } catch (e) {
        return initialLeadsData;
      }
    }
    return initialLeadsData;
  });

  const saveLeadsToStorage = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem("dss_leads", JSON.stringify(newLeads));
  };

  // Search & Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterCity, setFilterCity] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  // Table Column Configuration for common Table component matching exact screenshot design
  const columnConfig = useMemo(() => ({
    actions: {
      label: "ACTIONS",
      render: (val, row) => {
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "";
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* Orange Square Eye Button matching screenshot */}
            <button
              type="button"
              onClick={() => setActiveLeadModal(row)}
              className="w-7 h-7 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="View Lead Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Green Phone Call Icon */}
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
          {val || row.createdDate || row.date || "18/7/2026, 12:45:35 pm"}
          {row.createdTime && `, ${row.createdTime}`}
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
        const isNew = s === "NEW" || s === "FRESH" || row.jobType === "NEW" || (row.leadType && row.leadType.toUpperCase() === "FRESH");
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
        </div>
      )
    },
    phoneNumber: {
      label: "PHONE",
      render: (val, row) => {
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        return (
          <div className="text-left font-sans text-slate-800 text-xs font-medium">
            {phone}
          </div>
        );
      }
    },
    email: {
      label: "EMAIL",
      render: (val, row) => (
        <span className="text-xs font-mono text-slate-600">
          {val || row.emailAddress || row.email || "--"}
        </span>
      )
    },
    leadType: {
      label: "LEAD TYPE",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {val || row.leadType || "FRESH"}
        </span>
      )
    },
    jobType: {
      label: "JOB TYPE",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
          {val || row.jobType || "NEW"}
        </span>
      )
    },
    leadLabel: {
      label: "LEAD LABEL",
      render: (val, row) => {
        const lbl = (val || row.leadLabel || row.leadStatus || "WARM").toUpperCase();
        const colors = {
          HOT: "bg-rose-100 text-rose-800 border-rose-200",
          WARM: "bg-amber-100 text-amber-800 border-amber-200",
          COLD: "bg-sky-100 text-sky-800 border-sky-200",
          NEW: "bg-purple-100 text-purple-800 border-purple-200"
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${colors[lbl] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {lbl}
          </span>
        );
      }
    },
    leadSource: {
      label: "LEAD SOURCE",
      render: (val, row) => (
        <span className="text-xs font-bold text-slate-700 uppercase">
          {val || row.leadSource || row.leadMode || "WEBSITE"}
        </span>
      )
    },
    requirement: {
      label: "REQUIREMENTS",
      render: (val, row) => (
        <div className="max-w-[200px] truncate text-xs text-slate-700 font-medium" title={val || row.requirement || row.projectDetails}>
          {val || row.requirement || row.projectDetails || "--"}
        </div>
      )
    },
    addressPincode: {
      label: "ADDRESS & PIN CODE",
      render: (val, row) => (
        <div className="text-left text-xs max-w-[180px]">
          <div className="truncate text-slate-800 font-medium" title={row.address || row.siteAddress || row.city}>
            {row.address || row.siteAddress || row.city || "--"}
          </div>
          {row.pincode && (
            <div className="text-[11px] font-mono text-slate-500 font-bold">
              PIN: {row.pincode}
            </div>
          )}
        </div>
      )
    },
    assignTo: {
      label: "ASSIGN PERSON",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          {val || row.assignTo || row.salesPerson || "--"}
        </span>
      )
    },
    priority: {
      label: "PRIORITY",
      render: (val, row) => {
        const p = (val || row.priority || (row.leadLabel === "HOT" || row.leadStatus === "Hot" ? "HIGH" : row.leadLabel === "WARM" || row.leadStatus === "Warm" ? "MEDIUM" : "LOW")).toUpperCase();
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
    }
  }), []);

  // Sort State
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc"
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [activeLeadModal, setActiveLeadModal] = useState(null);
  const [followupModal, setFollowupModal] = useState(null);
  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("Warm");

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.clientName?.toLowerCase().includes(search) ||
        item.projectDetails?.toLowerCase().includes(search) ||
        item.city?.toLowerCase().includes(search) ||
        item.contact?.includes(search) ||
        item.id?.toLowerCase().includes(search);

      const matchStatus =
        filterStatus === "ALL" ||
        item.leadStatus?.toLowerCase() === filterStatus.toLowerCase();

      const matchSalesPerson =
        filterSalesPerson === "ALL" ||
        item.salesPerson === filterSalesPerson;

      const matchWorkType =
        filterWorkType === "ALL" ||
        (Array.isArray(item.workType)
          ? item.workType.includes(filterWorkType)
          : item.workType === filterWorkType);

      const matchCity =
        filterCity === "ALL" || item.city === filterCity;

      let matchDate = true;
      if (filterDateFrom) {
        matchDate = matchDate && item.date >= filterDateFrom;
      }
      if (filterDateTo) {
        matchDate = matchDate && item.date <= filterDateTo;
      }

      return matchSearch && matchStatus && matchSalesPerson && matchWorkType && matchCity && matchDate;
    });
  }, [leads, searchTerm, filterStatus, filterSalesPerson, filterWorkType, filterCity, filterDateFrom, filterDateTo]);

  // Sort Logic
  const sortedLeads = useMemo(() => {
    const sortable = [...filteredLeads];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "expectedRevenue") {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal ? bVal.toLowerCase() : "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredLeads, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedLeads.slice(start, start + rowsPerPage);
  }, [sortedLeads, currentPage, rowsPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Bulk Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedLeads.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete selected ${selectedIds.length} leads permanently?`)) {
      const updated = leads.filter((item) => !selectedIds.includes(item.id));
      saveLeadsToStorage(updated);
      setSelectedIds([]);
    }
  };

  const handleBulkStatusApply = () => {
    const updated = leads.map((item) =>
      selectedIds.includes(item.id) ? { ...item, leadStatus: bulkNewStatus } : item
    );
    saveLeadsToStorage(updated);
    setBulkStatusModal(false);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportData = selectedIds.length > 0
      ? leads.filter((item) => selectedIds.includes(item.id))
      : filteredLeads;

    const headers = ["Lead ID", "Date", "Sales Person", "Client Name", "Contact", "Work Type", "Expected Revenue", "City", "Status", "Next Followup"];
    const rows = exportData.map((l) => [
      l.id,
      l.date,
      l.salesPerson,
      `"${l.clientName}"`,
      l.contact,
      Array.isArray(l.workType) ? l.workType.join(" | ") : l.workType,
      l.expectedRevenue,
      l.city,
      l.leadStatus,
      l.nextFollowup || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Row Action Handlers
  const handleDeleteRow = (id) => {
    if (window.confirm("Delete this lead record permanently?")) {
      const updated = leads.filter((item) => item.id !== id);
      saveLeadsToStorage(updated);
    }
  };

  const handleConvertLead = (lead) => {
    if (window.confirm(`Convert ${lead.clientName} lead to Deal / Order?`)) {
      const updated = leads.map((item) =>
        item.id === lead.id ? { ...item, leadStatus: "Converted", nextFollowup: "Deal Won" } : item
      );
      saveLeadsToStorage(updated);
    }
  };

  const handleSaveFollowup = () => {
    if (!followupDate) return;
    const updated = leads.map((item) =>
      item.id === followupModal.id
        ? { ...item, nextFollowup: `${followupDate}`, remarks: followupNotes || item.remarks }
        : item
    );
    saveLeadsToStorage(updated);
    setFollowupModal(null);
    setFollowupDate("");
    setFollowupNotes("");
  };

  // Badges & Dot Styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "hot":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "warm":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cold":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "converted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "new":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case "hot":
        return "bg-rose-500";
      case "warm":
        return "bg-amber-500";
      case "cold":
        return "bg-sky-500";
      case "converted":
        return "bg-emerald-500";
      case "new":
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-4 font-sans select-none pb-16">
      
      {/* ================= 1. SUB-HEADER / ACTIONS ================= */}
      <PageHeader
        title="Total Leads Directory"
        badge="Master Directory"
        badgeColor="bg-blue-100 text-blue-800 border-blue-300"
        description={`Showing ${filteredLeads.length} of ${leads.length} registered pipeline leads`}
        showBackButton={true}
        rightActions={
          <div className="flex items-center gap-2.5">
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

            <Link
              to="/sales/leads/add"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Add Lead
            </Link>
          </div>
        }
      />

      {/* ================= 2. COLLAPSIBLE FILTER TOGGLE BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex items-center justify-between gap-4">
        <div className="text-xs sm:text-sm font-semibold text-slate-600">
          Showing <strong className="font-bold text-slate-900">{filteredLeads.length}</strong> of <strong className="font-bold text-slate-900">{leads.length}</strong> Total Leads
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 transition-all">
          {/* Top Search & Status Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
            {/* Real-time Search */}
            <div className="relative w-full lg:w-96">
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

            {/* Quick Status Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {["ALL", "HOT", "WARM", "COLD", "NEW", "CONVERTED"].map((st) => (
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
                  {st !== "ALL" && (
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(st)}`} />
                  )}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sales Person</label>
              <select
                value={filterSalesPerson}
                onChange={(e) => {
                  setFilterSalesPerson(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
              >
                {salesPersonsList.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Work Type</label>
              <select
                value={filterWorkType}
                onChange={(e) => {
                  setFilterWorkType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
              >
                {workTypesList.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">City</label>
              <select
                value={filterCity}
                onChange={(e) => {
                  setFilterCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black cursor-pointer font-semibold shadow-2xs"
              >
                {citiesList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date From</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black font-semibold shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date To</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black font-semibold shadow-2xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Selected Rows Batch Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold">Leads Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkStatusModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Change Status
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. REUSABLE COMMON TABLE COMPONENT ================= */}
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ================= 5. VIEW DETAIL MODAL ================= */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Lead Details</span>
                <h3 className="text-base font-black text-slate-900">{activeLeadModal.clientName}</h3>
              </div>
              <button
                onClick={() => setActiveLeadModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Lead ID</span>
                <strong className="font-mono">{activeLeadModal.id}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Sales Person</span>
                <strong>{activeLeadModal.salesPerson}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                <strong className="font-mono">+91 {activeLeadModal.contact}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Deal Value</span>
                <strong className="font-mono text-emerald-600 font-black">
                  ₹ {Number(activeLeadModal.expectedRevenue || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 col-span-2">
                <span className="text-slate-400 block text-[10px]">Scope & Requirements</span>
                <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                  {activeLeadModal.projectDetails || "No additional project notes provided."}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">City & Region</span>
                <strong>{activeLeadModal.city} ({activeLeadModal.state || "India"})</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Lead Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activeLeadModal.leadStatus)}`}>
                  {activeLeadModal.leadStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setActiveLeadModal(null)}
                className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 6. SCHEDULE FOLLOW-UP MODAL ================= */}
      {followupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Schedule Next Follow-up
            </h3>
            <p className="text-xs text-slate-500">
              For: <strong className="text-slate-800">{followupModal.clientName}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Call Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Quotation discussion, site survey, demo..."
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFollowupModal(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFollowup}
                className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Save Followup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. BULK STATUS MODAL ================= */}
      {bulkStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Update Status for {selectedIds.length} Leads
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select New Status</label>
              <select
                value={bulkNewStatus}
                onChange={(e) => setBulkNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white cursor-pointer"
              >
                <option value="Hot">Hot Lead 🔥</option>
                <option value="Warm">Warm Lead ⚡</option>
                <option value="Cold">Cold Lead ❄️</option>
                <option value="New">New ⚪</option>
                <option value="Converted">Converted 🟢</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkStatusModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkStatusApply}
                className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Apply Status
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalseTotalLeads;
export { SalseTotalLeads as TotalLeads };