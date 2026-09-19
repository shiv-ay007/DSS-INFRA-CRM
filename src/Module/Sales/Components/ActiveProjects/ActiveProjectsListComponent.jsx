import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHardHat,
  FaSearch,
  FaFilter,
  FaClock,
  FaUserTie,
  FaBuilding,
  FaPhoneAlt,
  FaEnvelope,
  FaPlus,
  FaEye,
  FaEdit,
  FaLock,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaRegFolderOpen,
  FaTasks,
  FaCalendarAlt,
  FaLayerGroup,
  FaUser
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import Table from "../../../../Common/Components/Table";
import activeProjectService, { isPmsMasterdataCreated } from "../../services/activeProjectService";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import pmsTemplateService from "../../services/pmsTemplateService";
import { pmsWbsService } from "../../services/pmsWbsService";

// Reusable KPI Metric Card
const KpiCard = ({ gradient, label, value, subtitle, icon, IconBg, onClick, isActive }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl p-3.5 text-white shadow-xs transition-all duration-200 ${
      onClick ? "cursor-pointer" : ""
    } ${gradient} ${
      isActive
        ? "ring-3 ring-offset-2 ring-indigo-500 scale-[1.02] shadow-md"
        : onClick
        ? "hover:shadow-md hover:scale-[1.01]"
        : ""
    }`}
  >
    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 pointer-events-none text-white">
      {IconBg}
    </div>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">{label}</p>
        <h3 className="text-2xl font-black mt-0.5 tracking-tight">{value}</h3>
        <p className="text-[10px] opacity-80 mt-1 font-medium">{subtitle}</p>
      </div>
      <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

const ActiveProjectsListComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewerOnly = user?.role === "Observer";

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorkType, setSelectedWorkType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // PMS Templates
  const [pmsTemplates, setPmsTemplates] = useState([]);

  // Load Active Projects + Presales + PMS Templates
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [presalesRes, pmsRes, wbsRes] = await Promise.allSettled([
        getAllLeadProjectsApi(),
        pmsTemplateService.getAllTemplates({ limit: 1000 }),
        pmsWbsService.getAllWbsData()
      ]);

      // Presales
      let presales = [];
      if (presalesRes.status === "fulfilled") {
        const raw =
          presalesRes.value?.data?.projects ||
          presalesRes.value?.data?.data?.projects ||
          presalesRes.value?.projects ||
          (Array.isArray(presalesRes.value?.data) ? presalesRes.value.data : []);
        if (Array.isArray(raw)) presales = raw;
      }

      // PMS Templates (API + localStorage, deduped)
      let pmsList = [];
      if (pmsRes.status === "fulfilled") {
        const rawTmpl = pmsRes.value?.data?.data || pmsRes.value?.data || [];
        if (Array.isArray(rawTmpl)) pmsList = [...rawTmpl];
      }

      try {
        const storedTasks = localStorage.getItem("dss_pms_tasks_master_data");
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed)) pmsList = [...pmsList, ...parsed];
        }
        const storedTemplates = localStorage.getItem("dss_pms_templates_data");
        if (storedTemplates) {
          const parsedT = JSON.parse(storedTemplates);
          if (Array.isArray(parsedT)) pmsList = [...pmsList, ...parsedT];
        }
      } catch (e) {
        // silent — cache optional
      }

      // Dedupe by _id
      const dedupMap = new Map();
      pmsList.forEach((t) => {
        const key = t?._id
          ? String(t._id)
          : `${t?.clientName}-${t?.projectName}-${t?.duration}`;
        dedupMap.set(key, t);
      });
      pmsList = Array.from(dedupMap.values());
      setPmsTemplates(pmsList);

      // WBS
      let wbsData = null;
      if (wbsRes.status === "fulfilled") {
        wbsData = wbsRes.value?.data?.data || wbsRes.value?.data || null;
      }

      // Sync into Active Projects
      const synced = activeProjectService.syncWithPresales(presales, pmsList, wbsData);
      setProjects(Array.isArray(synced) ? synced : []);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error loading active projects:", err);
      }
      toast.error("Failed to load active projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClient, selectedCategory, selectedWorkType]);

  // KPI Metrics
  const metrics = useMemo(() => {
    const total = projects.length;
    const uniqueClients = new Set(
      projects.map((p) => p.clientName).filter((c) => c && c !== "—" && c !== "Unnamed Client")
    ).size;
    const totalStages = projects.reduce((acc, p) => acc + (p.stages?.length || 0), 0);
    const totalTasks = projects.reduce(
      (acc, p) =>
        acc +
        (p.stages || []).reduce(
          (wSum, s) => wSum + (s.works || []).reduce((tSum, w) => tSum + (w.tasks || []).length, 0),
          0
        ),
      0
    );
    return { total, uniqueClients, totalStages, totalTasks };
  }, [projects]);

  // Filter option lists
  const clientOptions = useMemo(() => {
    const set = new Set(
      projects.map((p) => p.clientName).filter((c) => c && c !== "—" && c !== "Unnamed Client")
    );
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  const categoryOptions = useMemo(() => {
    const set = new Set(projects.map((p) => p.workCategory || p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  const workTypeOptions = useMemo(() => {
    const set = new Set(projects.map((p) => p.workType || p.projectType).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (selectedClient !== "All") count++;
    if (selectedCategory !== "All") count++;
    if (selectedWorkType !== "All") count++;
    return count;
  }, [searchQuery, selectedClient, selectedCategory, selectedWorkType]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedClient("All");
    setSelectedCategory("All");
    setSelectedWorkType("All");
    setCurrentPage(1);
  };

  // Filtered + Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (selectedClient !== "All" && p.clientName !== selectedClient) return false;
        if (selectedCategory !== "All") {
          const cat = p.workCategory || p.category;
          if (cat !== selectedCategory) return false;
        }
        if (selectedWorkType !== "All") {
          const wt = p.workType || p.projectType;
          if (wt !== selectedWorkType) return false;
        }
        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;
        return (
          p.clientName?.toLowerCase().includes(q) ||
          p.projectName?.toLowerCase().includes(q) ||
          p.phone?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.workType?.toLowerCase().includes(q) ||
          p.workCategory?.toLowerCase().includes(q) ||
          p.displayId?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [projects, selectedClient, selectedCategory, selectedWorkType, searchQuery]);

  // Paginated
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  // Table Column Configuration
  const columnConfig = useMemo(
    () => ({
      // 1. Actions
      actions: {
        label: "Actions",
        align: "center",
        headerClass: "min-w-[150px] w-36",
        render: (_, row) => {
          const hasPms = isPmsMasterdataCreated(row, pmsTemplates);

          return (
            <div className="flex items-center justify-center gap-1.5 flex-wrap">
              {/* View */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/sales/active-projects/${row.id}?mode=view`);
                }}
                title="View Execution Details (View-Only)"
                aria-label="View Details"
                className="p-1.5 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 transition-all cursor-pointer shadow-2xs hover:scale-105"
              >
                <FaEye className="w-3.5 h-3.5" />
              </button>

              {/* Edit (only if PMS exists AND not viewer) */}
              {hasPms && !isViewerOnly ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/sales/active-projects/${row.id}?mode=edit`);
                  }}
                  title="Edit & Track Daily Execution"
                  aria-label="Edit Details"
                  className="p-1.5 rounded-md text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer shadow-2xs hover:scale-105"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  onClick={(e) => e.stopPropagation()}
                  title={
                    isViewerOnly
                      ? "Read-only mode. Editing is disabled for Observers."
                      : "PMS masterdata not created yet. Please create PMS template first to enable editing."
                  }
                  aria-label="Edit Disabled"
                  className="p-1.5 rounded-md text-slate-300 bg-slate-100 border border-slate-200 cursor-not-allowed opacity-60 shadow-2xs"
                >
                  <FaEdit className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Add PMS (only if not created AND not viewer) */}
              {!hasPms && !isViewerOnly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const cParam = encodeURIComponent(row.clientName || "");
                    const pParam = encodeURIComponent(row.projectName || row.workType || "");
                    const projIdParam = encodeURIComponent(row.projectId || row.id || "");
                    const leadIdParam = encodeURIComponent(row.leadId || "");
                    navigate(
                      `/sales/master/pms-template/create?projectId=${projIdParam}&leadId=${leadIdParam}&clientName=${cParam}&projectName=${pParam}`
                    );
                  }}
                  title="PMS Masterdata not created yet. Click to configure PMS template"
                  className="px-2 py-1 rounded text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all flex items-center gap-1 shadow-2xs hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  <FaPlus className="w-2 h-2 text-amber-600" />
                  <span>+ Add PMS</span>
                </button>
              )}
            </div>
          );
        }
      },

      // 2. Client Details
      clientDetails: {
        label: "Client Details",
        align: "left",
        headerClass: "min-w-[210px]",
        render: (_, row) => (
          <div className="py-1 flex flex-col items-start gap-0.5 text-left">
            <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <FaUserTie className="w-3 h-3 text-indigo-500 shrink-0" />
              {row.clientName || "—"}
            </span>
            {row.phone && row.phone !== "—" && (
              <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
                <FaPhoneAlt className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                {row.phone}
              </span>
            )}
            {row.email && row.email !== "—" && (
              <span
                className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate max-w-[200px]"
                title={row.email}
              >
                <FaEnvelope className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                {row.email}
              </span>
            )}
          </div>
        )
      },

      // 3. Project Details
      projectDetails: {
        label: "Project Details",
        align: "left",
        headerClass: "min-w-[250px]",
        render: (_, row) => {
          const displayProj =
            row.projectName &&
            row.projectName !== "Site Execution" &&
            row.projectName !== "Site Workflow"
              ? row.projectName
              : row.companyName || "Project Execution";

          return (
            <div className="py-1 flex flex-col items-start gap-1 text-left">
              <span
                onClick={() => navigate(`/sales/active-projects/${row.id}?mode=view`)}
                title={displayProj}
                className="inline-block max-w-[280px] truncate bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-2.5 py-1 rounded border border-slate-200 cursor-pointer transition-colors"
              >
                {displayProj}
              </span>
              <span className="inline-block bg-sky-50 text-sky-800 font-semibold text-[11px] px-2 py-0.5 rounded border border-sky-200">
                Type: {row.workType || row.projectType || "Construction"}
              </span>
              <span className="inline-block bg-purple-50 text-purple-800 font-semibold text-[11px] px-2 py-0.5 rounded border border-purple-200">
                Category: {row.workCategory || row.category || "Construction"}
              </span>
            </div>
          );
        }
      },

      // 4. Stages / Works / Tasks
      stagesWorksTasks: {
        label: "Stages / Works / Tasks",
        align: "center",
        headerClass: "min-w-[220px]",
        render: (_, row) => {
          const hasPms = isPmsMasterdataCreated(row, pmsTemplates);
          if (!hasPms) {
            return <span className="text-xs font-semibold text-slate-400">—</span>;
          }

          const stages = row.stages || [];
          const stagesCount = stages.length || row.stagesCount || 0;
          const worksCount =
            stages.length > 0
              ? stages.reduce((sum, s) => sum + (s.works || []).length, 0)
              : row.worksCount || 0;
          const tasksCount =
            stages.length > 0
              ? stages.reduce(
                  (sum, s) =>
                    sum + (s.works || []).reduce((wSum, w) => wSum + (w.tasks || []).length, 0),
                  0
                )
              : row.tasksCount || 0;

          if (stagesCount === 0 && worksCount === 0 && tasksCount === 0) {
            return <span className="text-xs font-semibold text-slate-400">—</span>;
          }

          return (
            <div className="py-1 flex flex-wrap items-center justify-center gap-1.5">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                {stagesCount} {stagesCount === 1 ? "Stage" : "Stages"}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
                {worksCount} {worksCount === 1 ? "Work" : "Works"}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                {tasksCount} {tasksCount === 1 ? "Task" : "Tasks"}
              </span>
            </div>
          );
        }
      },

      // 5. Work Duration
      duration: {
        label: "Work Duration",
        align: "center",
        headerClass: "min-w-[130px]",
        render: (_, row) => {
          const hasPms = isPmsMasterdataCreated(row, pmsTemplates);
          if (!hasPms) {
            return <span className="text-xs font-semibold text-slate-400">—</span>;
          }

          let dur = row.duration;
          const matchedTmpl = pmsTemplates.find(
            (t) =>
              (t.projectId?._id && String(t.projectId._id) === String(row.projectId || row.id)) ||
              (t.leadId?._id && String(t.leadId._id) === String(row.leadId)) ||
              (t.clientName &&
                row.clientName &&
                t.clientName.toLowerCase().trim() === row.clientName.toLowerCase().trim())
          );

          if (matchedTmpl?.duration) {
            dur = matchedTmpl.duration;
          } else if (!dur || dur === "30 Days") {
            const totalDays = (row.stages || []).reduce((acc, s) => {
              const d = Number(s.durationDays || s.fieldData?.durationDays);
              return acc + (!isNaN(d) ? d : 0);
            }, 0);
            dur = totalDays > 0 ? `${totalDays} Days` : "—";
          }

          if (!dur || dur === "—") {
            return <span className="text-xs font-semibold text-slate-400">—</span>;
          }

          return (
            <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md whitespace-nowrap">
              <FaClock className="w-3 h-3 text-slate-500 shrink-0" />
              {dur}
            </span>
          );
        }
      },

      // 6. Created Date
      createdDate: {
        label: "Created Date",
        align: "center",
        headerClass: "min-w-[130px]",
        render: (_, row) => {
          const rawDate = row.createdAt || row.contractSignedDate;
          let createdDateFormatted = "—";
          if (rawDate) {
            try {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                createdDateFormatted = d.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                });
              } else {
                createdDateFormatted = String(rawDate);
              }
            } catch (e) {
              createdDateFormatted = String(rawDate);
            }
          }

          return (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
              <FaCalendarAlt className="w-3 h-3 text-amber-600 shrink-0" />
              {createdDateFormatted}
            </span>
          );
        }
      }
    }),
    [navigate, pmsTemplates, isViewerOnly]
  );

  return (
    <div className="space-y-4 pb-12 font-sans px-1 sm:px-0 w-full max-w-full min-w-0">
      {/* ================= STICKY HEADER BANNER ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl px-4 py-3 shadow-md border border-indigo-700/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10 mt-0.5"
                title="Go Back"
              >
                <FaArrowLeft className="text-xs" />
              </button>
              <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
                <FaHardHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                    Active Projects
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <HiSparkles className="w-3 h-3 text-cyan-300" /> Module 3 • Site Tracking
                  </span>
                  {isViewerOnly ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      <FaLock className="w-2.5 h-2.5" /> Read-Only
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Editor Mode
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-200/90 mt-1 max-w-xl font-normal">
                  Multi-stage Construction  Checklist & daily task execution tracking for active project sites.
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`relative p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm border ${
                  showFilters
                    ? "bg-white text-indigo-950 border-white shadow-md scale-105"
                    : "bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-100 border-indigo-500/50 hover:border-indigo-400"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className={`w-3.5 h-3.5 ${showFilters ? "text-indigo-700" : "text-cyan-300"}`} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15 hidden sm:inline-block">
                {filteredProjects.length} Projects
              </span>

              {!isViewerOnly && (
                <button
                  type="button"
                  onClick={() => navigate("/sales/active-projects/create")}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-md shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  <span>Create Active Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================= COLLAPSIBLE FILTER PANEL ================= */}
        {showFilters && (
          <div className="bg-white rounded-xl p-3.5 sm:p-4 shadow-md border border-slate-200 space-y-3 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by client name, project name, phone, email, work type..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 justify-between sm:justify-end">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                    title="Reset all filters"
                  >
                    <FaTimes className="w-3 h-3" />
                    <span>Reset Filters</span>
                  </button>
                )}

                <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                  {filteredProjects.length} Found
                </span>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Filter Panel"
                >
                  <FaTimes className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Client Details
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                    selectedClient !== "All"
                      ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  <option value="All">All Clients</option>
                  {clientOptions
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Work Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                    selectedCategory !== "All"
                      ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  <option value="All">All Categories</option>
                  {categoryOptions
                    .filter((cat) => cat !== "All")
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Work Type
                </label>
                <select
                  value={selectedWorkType}
                  onChange={(e) => {
                    setSelectedWorkType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                    selectedWorkType !== "All"
                      ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  <option value="All">All Work Types</option>
                  {workTypeOptions
                    .filter((wt) => wt !== "All")
                    .map((wt) => (
                      <option key={wt} value={wt}>
                        {wt}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          label="Total Active Projects"
          value={metrics.total}
          subtitle="Sites in active execution"
          icon={<FaBuilding className="w-5 h-5 text-white" />}
          IconBg={<FaBuilding className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Clients Mapped"
          value={metrics.uniqueClients}
          subtitle="Direct clients linked"
          icon={<FaUser className="w-5 h-5 text-white" />}
          IconBg={<FaUser className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-purple-600 to-fuchsia-700"
          label="Total Stages"
          value={metrics.totalStages}
          subtitle="WBS milestones tracked"
          icon={<FaLayerGroup className="w-5 h-5 text-white" />}
          IconBg={<FaLayerGroup className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          label="Total Tasks"
          value={metrics.totalTasks}
          subtitle="Execution tasks defined"
          icon={<FaTasks className="w-5 h-5 text-white" />}
          IconBg={<FaTasks className="w-20 h-20" />}
        />
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <FaSpinner className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm font-semibold">Loading active project sites...</p>
          </div>
        ) : paginatedProjects.length > 0 ? (
          <Table
            data={paginatedProjects}
            columnConfig={columnConfig}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={filteredProjects.length}
            showSrNo={true}
          />
        ) : (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FaRegFolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">No Active Projects Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search query or filters."
                : "Active site execution tracking for your Presales & PMS master templates."}
            </p>
            {!isViewerOnly && !hasActiveFilters && (
              <button
                type="button"
                onClick={() => navigate("/sales/active-projects/create")}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-500/20"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>+ Add Active Project</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveProjectsListComponent;