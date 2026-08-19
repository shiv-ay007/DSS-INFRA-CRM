import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

// Initial Mock Dataset matching Feature LM-F-02 & LM-F-01
const initialLeadsData = [
  {
    id: "LD-1001",
    date: "2026-08-18",
    salesPerson: "Rahul Sharma",
    clientName: "Reliance Retail Ltd",
    contact: "9876543210",
    alternateNo: "9876500000",
    projectDetails: "P2.5 Indoor LED Video Wall for Flagship Store Entrance (12x8 ft) with Novastar Controller",
    workType: "LED Video Wall",
    expectedRevenue: 1250000,
    city: "Noida",
    state: "Uttar Pradesh",
    leadStatus: "Hot",
    nextFollowup: "2026-08-20 10:30 AM",
    leadMode: "Direct Call / Inbound",
    clientDesignation: "Project Head"
  },
  {
    id: "LD-1002",
    date: "2026-08-17",
    salesPerson: "Pooja Verma",
    clientName: "PVR INOX Cinemas",
    contact: "9812345678",
    alternateNo: "",
    projectDetails: "55-inch Ultra HD Interactive Digital Kiosks for Multiplex Lobby ticket booking & trailer showcase",
    workType: "Interactive Kiosk",
    expectedRevenue: 650000,
    city: "Delhi NCR",
    state: "Delhi NCR",
    leadStatus: "Warm",
    nextFollowup: "2026-08-22 02:00 PM",
    leadMode: "Website Inquiry",
    clientDesignation: "Marketing Director"
  },
  {
    id: "LD-1003",
    date: "2026-08-16",
    salesPerson: "Vikram Malhotra",
    clientName: "DLF Cyber City Corp",
    contact: "9765432109",
    alternateNo: "9765400000",
    projectDetails: "Outdoor P6 Curved Billboard on Commercial Tower Facade with auto-brightness sensors",
    workType: "Outdoor Billboard",
    expectedRevenue: 2800000,
    city: "Gurugram",
    state: "Haryana",
    leadStatus: "Hot",
    nextFollowup: "2026-08-19 11:00 AM",
    leadMode: "Direct Referral",
    clientDesignation: "VP Infrastructure"
  },
  {
    id: "LD-1004",
    date: "2026-08-15",
    salesPerson: "Ankit Patel",
    clientName: "Tata Croma Stores",
    contact: "9898912345",
    alternateNo: "",
    projectDetails: "Cloud Digital Signage CMS software deployment across 15 retail outlets with 1-year AMC",
    workType: "Software / CMS",
    expectedRevenue: 450000,
    city: "Mumbai",
    state: "Maharashtra",
    leadStatus: "Converted",
    nextFollowup: "Completed",
    leadMode: "Field Visit",
    clientDesignation: "IT Manager"
  },
  {
    id: "LD-1005",
    date: "2026-08-14",
    salesPerson: "Sanjay Gupta",
    clientName: "AIIMS Medical Center",
    contact: "9834567890",
    alternateNo: "",
    projectDetails: "Patient Queue Management token display displays and interactive directory kiosks in OPD blocks",
    workType: "Digital Signage",
    expectedRevenue: 850000,
    city: "Delhi NCR",
    state: "Delhi NCR",
    leadStatus: "New",
    nextFollowup: "2026-08-25 04:00 PM",
    leadMode: "Inbound Call",
    clientDesignation: "Medical Superintendent"
  },
  {
    id: "LD-1006",
    date: "2026-08-13",
    salesPerson: "Sales TL (Current User)",
    clientName: "FabIndia Overseas",
    contact: "9823456781",
    alternateNo: "",
    projectDetails: "Slim Bezel Commercial Displays for Festive Ethnic Collection Window Display in 8 flagship stores",
    workType: "Indoor Display",
    expectedRevenue: 920000,
    city: "Bengaluru",
    state: "Karnataka",
    leadStatus: "Cold",
    nextFollowup: "2026-09-01 12:00 PM",
    leadMode: "Exhibition / Expo",
    clientDesignation: "Brand Visual Merchandiser"
  },
  {
    id: "LD-1007",
    date: "2026-08-12",
    salesPerson: "Rahul Sharma",
    clientName: "Maruti Suzuki Dealership",
    contact: "9871122334",
    alternateNo: "",
    projectDetails: "Service Bay Video Walls and Customer Lounge LED Display with remote content scheduling",
    workType: "LED Video Wall",
    expectedRevenue: 1500000,
    city: "Jaipur",
    state: "Rajasthan",
    leadStatus: "Warm",
    nextFollowup: "2026-08-23 03:30 PM",
    leadMode: "Outbound Calling",
    clientDesignation: "General Manager"
  }
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterCity, setFilterCity] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

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
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/20 to-white rounded-2xl border border-blue-200/80 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Total Leads Directory
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                Master Directory
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredLeads.length}</span> of <span className="font-bold text-slate-900">{leads.length}</span> registered pipeline leads
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
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
      </div>

      {/* ================= 2. SEARCH & FILTER CONTROLS ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
        
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Sales Person
            </label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Work Type
            </label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              City
            </label>
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black font-semibold shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:border-black font-semibold shadow-2xs"
            />
          </div>

        </div>

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

      </div>

      {/* ================= 3. LEADS TABLE (ACTIONS COLUMN NEXT TO SR. NO.) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-900 text-xs font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 select-none">
                
                {/* 1. Checkbox */}
                <th className="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={paginatedLeads.length > 0 && selectedIds.length === paginatedLeads.length}
                    className="w-3.5 h-3.5 rounded cursor-pointer accent-black"
                  />
                </th>

                {/* 2. Sr. No. */}
                <th
                  onClick={() => handleSort("id")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Sr.</span>
                    {sortConfig.key === "id" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 3. ACTIONS (POSITIONED RIGHT NEXT TO SR. NO.) */}
                <th className="py-3 px-3 font-bold text-center whitespace-nowrap bg-slate-100/70 border-x border-slate-200/60 min-w-[140px]">
                  ⚡ Actions
                </th>

                {/* 4. Date */}
                <th
                  onClick={() => handleSort("date")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    {sortConfig.key === "date" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 5. Sales Person */}
                <th
                  onClick={() => handleSort("salesPerson")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Sales Person</span>
                    {sortConfig.key === "salesPerson" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 6. Client Name */}
                <th
                  onClick={() => handleSort("clientName")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black min-w-[150px]"
                >
                  <div className="flex items-center gap-1">
                    <span>Client Name</span>
                    {sortConfig.key === "clientName" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 7. Contact */}
                <th className="py-3 px-3 font-bold whitespace-nowrap">Contact</th>

                {/* 8. Project Details */}
                <th className="py-3 px-3 font-bold min-w-[200px] max-w-[260px]">
                  Project Details
                </th>

                {/* 9. Work Type */}
                <th className="py-3 px-3 font-bold whitespace-nowrap">Work Type</th>

                {/* 10. Expected Revenue */}
                <th
                  onClick={() => handleSort("expectedRevenue")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Revenue (₹)</span>
                    {sortConfig.key === "expectedRevenue" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 11. City */}
                <th
                  onClick={() => handleSort("city")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>City</span>
                    {sortConfig.key === "city" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 12. Lead Status */}
                <th
                  onClick={() => handleSort("leadStatus")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortConfig.key === "leadStatus" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>

                {/* 13. Next Follow-up */}
                <th
                  onClick={() => handleSort("nextFollowup")}
                  className="py-3 px-3 font-bold cursor-pointer hover:text-black whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Follow-up</span>
                    {sortConfig.key === "nextFollowup" && <span>{sortConfig.direction === "asc" ? "▲" : "▼"}</span>}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isConvertible = ["hot", "warm"].includes(item.leadStatus?.toLowerCase());

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-slate-50" : ""
                      }`}
                    >
                      {/* 1. Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(item.id)}
                          className="w-3.5 h-3.5 rounded cursor-pointer accent-black"
                        />
                      </td>

                      {/* 2. Sr No */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {(currentPage - 1) * rowsPerPage + index + 1}
                      </td>

                      {/* 3. BEAUTIFULLY STYLED ACTIONS ROW (NEXT TO SR. NO.) */}
                      <td className="py-2.5 px-3 bg-slate-50/50 border-x border-slate-100 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          
                          {/* 1. View Button (Eye Icon) */}
                          <button
                            type="button"
                            onClick={() => setActiveLeadModal(item)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="View Lead Details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* 2. Follow-up Button (Phone Icon) */}
                          <button
                            type="button"
                            onClick={() => {
                              setFollowupModal(item);
                              setFollowupDate(item.nextFollowup || "");
                            }}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Schedule Follow-up"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </button>

                          {/* 3. Convert Button (Clean Badge) */}
                          {isConvertible && (
                            <button
                              type="button"
                              onClick={() => handleConvertLead(item)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-extrabold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                              title="Convert Lead to Deal"
                            >
                              <span>Convert</span>
                            </button>
                          )}

                          {/* 4. Delete Button (Trash Icon) */}
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(item.id)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                            title="Delete Lead"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>

                        </div>
                      </td>

                      {/* 4. Date */}
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* 5. Sales Person */}
                      <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap">
                        {item.salesPerson}
                      </td>

                      {/* 6. Client Name */}
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <div className="truncate max-w-[160px]" title={item.clientName}>
                          {item.clientName}
                        </div>
                      </td>

                      {/* 7. Contact */}
                      <td className="py-3 px-3 font-mono text-slate-700 whitespace-nowrap">
                        +91 {item.contact || item.phoneNumber}
                      </td>

                      {/* 8. Project Details */}
                      <td className="py-3 px-3 text-slate-600">
                        <div
                          className="truncate max-w-[220px] cursor-help text-[11px]"
                          title={item.projectDetails}
                        >
                          {item.projectDetails || "—"}
                        </div>
                      </td>

                      {/* 9. Work Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                          {Array.isArray(item.workType) ? item.workType[0] : item.workType || "Display"}
                        </span>
                      </td>

                      {/* 10. Revenue */}
                      <td className="py-3 px-3 font-mono font-black text-slate-900 whitespace-nowrap">
                        ₹ {Number(item.expectedRevenue || item.expectedBusinessAmount || 0).toLocaleString("en-IN")}
                      </td>

                      {/* 11. City */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {item.city}
                      </td>

                      {/* 12. Lead Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(item.leadStatus)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.leadStatus)}`} />
                          <span>{item.leadStatus || "New"}</span>
                        </span>
                      </td>

                      {/* 13. Next Followup */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {item.nextFollowup || "—"}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-400 text-xs">
                    No leads found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= 4. PAGINATION FOOTER ================= */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-slate-600">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold cursor-pointer"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold cursor-pointer"
            >
              Prev
            </button>

            <span className="px-3 py-1 font-mono font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-bold cursor-pointer"
            >
              Next
            </button>
          </div>

        </div>

      </div>

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