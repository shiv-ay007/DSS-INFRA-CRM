import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHardHat,
  FaSearch,
  FaFilter,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaUserTie,
  FaMapMarkerAlt,
  FaBuilding,
  FaPhoneAlt,
  FaPlus,
  FaEye,
  FaLock,
  FaTimes,
  FaSpinner,
  FaArrowLeft,
  FaRegFolderOpen,
  FaTasks
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import Table from "../../../../Common/Components/Table";
import activeProjectService from "../../services/activeProjectService";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";

// Reusable KPI Metric Card (Matching MasterForm / Presales / PMS Template Design)
const KpiCard = ({ gradient, label, value, subtitle, icon, IconBg, onClick, isActive }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl p-3.5 text-white shadow-xs transition-all duration-200 cursor-pointer ${gradient} ${
      isActive ? "ring-3 ring-offset-2 ring-indigo-500 scale-[1.02] shadow-md" : "hover:shadow-md hover:scale-[1.01]"
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
  const isViewerOnly = user?.role === "Observer"; // 2-login system: Observer = Viewer (Read-Only)

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");

  // Pagination states for common Table component
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Presales conversion modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [qualifiedPresales, setQualifiedPresales] = useState([]);
  const [loadingPresales, setLoadingPresales] = useState(false);

  // Load Active Projects
  const loadProjects = () => {
    setLoading(true);
    try {
      const data = activeProjectService.getAllActiveProjects();
      setProjects(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load active projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, cityFilter]);

  // Fetch presales that qualify for conversion (Design + Construction & Stage 11 completed)
  const fetchQualifiedPresales = async () => {
    setLoadingPresales(true);
    try {
      const res = await getAllLeadProjectsApi();
      const raw = res?.data?.projects || res?.projects || (Array.isArray(res?.data) ? res.data : []);

      // Find candidates: Design + Construction and Stage 11 Contract Completed
      const filtered = raw.filter((p) => {
        const scope = p.engagementScope || (p.leadId && p.leadId.workCategory) || "";
        const isDesignConstruction =
          scope.toLowerCase().includes("construction") ||
          scope.toLowerCase().includes("design + construction");
        const stage11 = p.stages?.find((s) => s.stageId === 11 || s.stage_id === 11);
        const isContractDone = stage11 ? stage11.status === "Completed" : true;
        return isDesignConstruction && isContractDone;
      });

      setQualifiedPresales(filtered);
    } catch (err) {
      console.warn("Could not fetch presales for conversion:", err);
    } finally {
      setLoadingPresales(false);
    }
  };

  const handleOpenConvertModal = () => {
    setIsConvertModalOpen(true);
    fetchQualifiedPresales();
  };

  const handleConvertPresale = (presale) => {
    const res = activeProjectService.convertPresaleToActiveProject(presale);
    if (res.alreadyExists) {
      toast.info(`Project "${res.project.clientName}" is already an Active Project.`);
      navigate(`/sales/active-projects/${res.project.id}`);
    } else {
      toast.success(`Presale converted! Cloned 23-stage checklist for "${res.project.clientName}".`);
      setIsConvertModalOpen(false);
      loadProjects();
      navigate(`/sales/active-projects/${res.project.id}`);
    }
  };

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const total = projects.length;
    const onTrack = projects.filter((p) => p.projectStatus === "On Track").length;
    const delayed = projects.filter((p) => p.projectStatus === "Delayed" || p.overdueTasks > 0).length;
    const completed = projects.filter(
      (p) => p.projectStatus === "Completed" || p.overallProgress === 100
    ).length;
    return { total, onTrack, delayed, completed };
  }, [projects]);

  // Cities List for Filter
  const availableCities = useMemo(() => {
    const set = new Set(projects.map((p) => p.city).filter(Boolean));
    return Array.from(set);
  }, [projects]);

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        p.clientName?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.activePerson?.toLowerCase().includes(q) ||
        p.workType?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "Delayed"
          ? p.projectStatus === "Delayed" || p.overdueTasks > 0
          : p.projectStatus === statusFilter);

      const matchCity = cityFilter === "ALL" || p.city === cityFilter;

      return matchSearch && matchStatus && matchCity;
    });
  }, [projects, searchQuery, statusFilter, cityFilter]);

  // Paginated Projects for Table Component
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const getStatusBadge = (status, overdueTasks = 0) => {
    if (status === "Delayed" || overdueTasks > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          Delayed {overdueTasks > 0 ? `(${overdueTasks})` : ""}
        </span>
      );
    }
    if (status === "Completed") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Completed
        </span>
      );
    }
    if (status === "On Hold") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          On Hold
        </span>
      );
    }
    if (status === "In Progress") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        On Track
      </span>
    );
  };

  // Reusable Table Column Configuration (Matching standard Table across CRM)
  const columnConfig = useMemo(
    () => ({
      actions: {
        label: "Action",
        align: "center",
        headerClass: "min-w-[120px] w-28",
        render: (_, row) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/sales/active-projects/${row.id}`);
            }}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Track Site</span>
            <FaArrowRight className="w-3 h-3" />
          </button>
        )
      },
      client: {
        label: "Project & Client",
        align: "left",
        headerClass: "min-w-[240px]",
        render: (_, row) => (
          <div className="py-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                {row.id}
              </span>
              {row.revenue && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-100">
                  {row.revenue}
                </span>
              )}
            </div>
            <h4
              onClick={() => navigate(`/sales/active-projects/${row.id}`)}
              className="font-extrabold text-slate-900 text-xs mt-1 hover:text-indigo-600 cursor-pointer transition-colors"
            >
              {row.clientName}
            </h4>
            {row.phone && (
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <FaPhoneAlt className="w-2.5 h-2.5 text-slate-300" />
                <span>{row.phone}</span>
              </p>
            )}
          </div>
        )
      },
      location: {
        label: "Location & Work Type",
        align: "left",
        headerClass: "min-w-[180px]",
        render: (_, row) => (
          <div>
            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <FaMapMarkerAlt className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{row.city || "Lucknow"}</span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {row.workType || "Design + Construction"}
            </p>
          </div>
        )
      },
      activePerson: {
        label: "Active Person (Site Lead)",
        align: "left",
        headerClass: "min-w-[180px]",
        render: (val) => (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] shrink-0">
              <FaUserTie className="w-3 h-3" />
            </div>
            <span className="font-bold text-slate-800 text-xs truncate">
              {val || "Not Assigned"}
            </span>
          </div>
        )
      },
      progress: {
        label: "Execution Progress",
        align: "left",
        headerClass: "min-w-[210px]",
        render: (_, row) => {
          const completedStages = (row.stages || []).filter((s) => s.status === "Completed").length;
          const totalStages = (row.stages || []).length || 23;

          return (
            <div className="space-y-1 py-1">
              <div className="flex items-center justify-between text-[11px]">
                <strong className="text-slate-900 font-extrabold">{row.overallProgress || 0}%</strong>
                <span className="text-[10px] font-semibold text-slate-500">
                  {completedStages}/{totalStages} Stages Done
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    row.overallProgress === 100
                      ? "bg-emerald-500"
                      : row.projectStatus === "Delayed"
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600"
                  }`}
                  style={{ width: `${row.overallProgress || 0}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400">
                {row.completedTasks || 0} / {row.totalTasks || 0} Tasks Completed
              </p>
            </div>
          );
        }
      },
      status: {
        label: "Status",
        align: "center",
        headerClass: "min-w-[130px]",
        render: (val, row) => getStatusBadge(val, row.overdueTasks)
      },
      remarks: {
        label: "Sub-Status & Remarks",
        align: "left",
        headerClass: "min-w-[200px]",
        render: (_, row) => (
          <div>
            <div className="font-semibold text-slate-800 text-xs line-clamp-1">
              {row.projectSubStatus || "--"}
            </div>
            {row.overallRemark && (
              <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 italic">
                "{row.overallRemark}"
              </p>
            )}
          </div>
        )
      }
    }),
    [navigate]
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-16 px-1 sm:px-0 font-sans">
      {/* ================= FIXED / STICKY HEADER BANNER (Matching Presales, PMS Template & Material Master) ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl px-4 py-3 shadow-md border border-indigo-700/50 overflow-hidden relative">
          {/* Glow Effects */}
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
                  23-Stage Construction Checklist execution tracking for 'Design + Construction' projects.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {!isViewerOnly && (
                <button
                  type="button"
                  onClick={handleOpenConvertModal}
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-lg shadow-md shadow-teal-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
                >
                  <HiSparkles className="w-3.5 h-3.5" />
                  <span>Convert Presale Contract</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS (Matching Presales & PMS Template) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          label="Total Active Sites"
          value={metrics.total}
          subtitle="Sites in active execution"
          icon={<FaBuilding className="w-5 h-5 text-white" />}
          IconBg={<FaBuilding className="w-20 h-20" />}
          onClick={() => setStatusFilter("ALL")}
          isActive={statusFilter === "ALL"}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="On Track Sites"
          value={metrics.onTrack}
          subtitle="Meeting target deadlines"
          icon={<FaCheckCircle className="w-5 h-5 text-white" />}
          IconBg={<FaCheckCircle className="w-20 h-20" />}
          onClick={() => setStatusFilter("On Track")}
          isActive={statusFilter === "On Track"}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-rose-600 to-pink-700"
          label="Delayed / Overdue"
          value={metrics.delayed}
          subtitle="Attention required on site"
          icon={<FaExclamationTriangle className="w-5 h-5 text-white" />}
          IconBg={<FaExclamationTriangle className="w-20 h-20" />}
          onClick={() => setStatusFilter("Delayed")}
          isActive={statusFilter === "Delayed"}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-purple-600 to-fuchsia-700"
          label="Completed Sites"
          value={metrics.completed}
          subtitle="All 23 stages finished"
          icon={<FaCheckCircle className="w-5 h-5 text-white" />}
          IconBg={<FaCheckCircle className="w-20 h-20" />}
          onClick={() => setStatusFilter("Completed")}
          isActive={statusFilter === "Completed"}
        />
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Client Name, Project ID, City, Site Engineer, Work Type..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <FaFilter className="w-3 h-3 text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses ({metrics.total})</option>
            <option value="On Track">On Track ({metrics.onTrack})</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed ({metrics.delayed})</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed ({metrics.completed})</option>
          </select>

          {availableCities.length > 0 && (
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              {availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          {(searchQuery || statusFilter !== "ALL" || cityFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
                setCityFilter("ALL");
              }}
              className="px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ================= STANDARD COMMON TABLE (Matching all CRM modules) ================= */}
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
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        ) : (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FaRegFolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-slate-700">No Active Projects Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== "ALL" || cityFilter !== "ALL"
                ? "Try adjusting your search query or status filter."
                : "Projects with 'Design + Construction' scope and completed Contract Signing will appear here."}
            </p>
            {!isViewerOnly && (
              <button
                type="button"
                onClick={handleOpenConvertModal}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <HiSparkles className="w-3.5 h-3.5" />
                <span>Convert Presale Contract</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= CONVERT PRESALES MODAL ================= */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-5 sm:p-6 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <HiSparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Convert Presale to Active Project</h3>
                  <p className="text-xs text-slate-400">
                    Auto-clones 23 WBS stages for site execution tracking
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1 space-y-2.5 pr-1">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Specification Note:</strong> Only Presales records with Scope{" "}
                <span className="font-bold underline">"Design + Construction"</span> and Contract Signing (Stage 11) completed qualify for Site Tracking. Consultancy / Design only records are excluded.
              </div>

              {loadingPresales ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <FaSpinner className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                  Scanning presales contracts...
                </div>
              ) : qualifiedPresales.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                  No new qualified Presale contracts pending conversion.
                </div>
              ) : (
                qualifiedPresales.map((pre) => (
                  <div
                    key={pre.id || pre._id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-white hover:bg-teal-50/30 transition-all flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-extrabold text-slate-900 text-xs">
                        {pre.clientName || pre.concernPersonName}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {pre.businessType || pre.workType || "Design + Construction"} • {pre.city || "Lucknow"}
                      </div>
                      {pre.amount && (
                        <div className="text-[10px] font-bold text-teal-700 mt-0.5">
                          Budget: ₹{Number(pre.amount).toLocaleString("en-IN")}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConvertPresale(pre)}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Convert & Clone
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveProjectsListComponent;
