import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaBuilding,
  FaPhoneAlt,
  FaRupeeSign,
  FaUserTie,
  FaArrowLeft,
  FaEye,
  FaCalendarAlt,
  FaLayerGroup,
  FaSyncAlt,
  FaTimes,
  FaFileAlt,
  FaExternalLinkAlt,
  FaHardHat,
  FaInfoCircle,
  FaStream,
  FaUndo,
  FaSpinner
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";
import { getAllLeadProjectsApi, updateLeadProjectApi } from "../../services/leadProject.api";
import { reopenPresaleApi } from "../../services/presale.api";
import activeProjectService from "../../services/activeProjectService";
import { useAuth } from "../../../../context/AuthContext";

// KPI Card Component matching DSS CRM standard
const KpiCard = ({ gradient, label, value, subtitle, icon, IconBg, active, onClick }) => (
  <div
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl p-4 text-white shadow-sm transition-all duration-200 cursor-pointer select-none ${gradient} ${
      active
        ? "ring-4 ring-offset-2 ring-emerald-500 scale-[1.02] shadow-md"
        : "hover:scale-[1.01] hover:shadow"
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

const CompleteProjectsComponent = () => {
  const navigate = useNavigate();
  const { role, isObserver, user } = useAuth();
  const currentRole = role || user?.role || "";
  const isUserObserver = isObserver || String(currentRole).toLowerCase().trim() === "observer";

  const [loading, setLoading] = useState(true);
  const [closedProjects, setClosedProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // "ALL" | "COMPLETE" | "LOST"
  const [completeSubFilter, setCompleteSubFilter] = useState("ALL"); // "ALL" | "CONSULTANCY" | "DESIGN" | "CONSTRUCTION"
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [showFilters, setShowFilters] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Selected Project for Modal Details View
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reopen Confirmation Modal State
  const [projectToReopen, setProjectToReopen] = useState(null);
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  // Load Closed & Completed Projects
  const fetchCompletedProjects = async () => {
    setLoading(true);
    try {
      // 1. Fetch live active projects from MongoDB / PMS templates & presales sync
      let activeList = [];
      try {
        activeList = await activeProjectService.fetchAndSyncActiveProjects();
      } catch (syncErr) {
        activeList = activeProjectService.getAllActiveProjects() || [];
      }
      if (!Array.isArray(activeList) || activeList.length === 0) {
        activeList = activeProjectService.getAllActiveProjects() || [];
      }

      // 2. Fetch closed & completed lead projects from backend database
      const res = await getAllLeadProjectsApi({ isClosed: "true" });
      const backendProjects =
        res?.data?.projects || res?.projects || (Array.isArray(res?.data) ? res.data : []);

      const normalizedList = [];

      // Process Backend Projects (Presales / Closed Leads)
      backendProjects.forEach((bp) => {
        const leadObj = typeof bp.leadId === "object" && bp.leadId !== null ? bp.leadId : {};
        const status = String(bp.status || leadObj.status || "").toUpperCase();
        const closureStatus = String(bp.closureStatus || leadObj.closureStatus || "");
        const presaleStatus = String(bp.presaleStatus || leadObj.presaleStatus || "");

        // ⚠️ CRITICAL: Agar project Construction me convert ho chuka hai (ACTIVE_PROJECT / Converted),
        // to wo yahan Presales side se Complete Projects me NAHI aayega!
        // Wo Active Projects me chal raha hai.
        const isConvertedToConstruction =
          status === "ACTIVE_PROJECT" ||
          status === "CONVERTED" ||
          closureStatus.toLowerCase().includes("converted") ||
          presaleStatus.toLowerCase().includes("converted");

        if (isConvertedToConstruction) {
          return; // Skip! Active project me hai, not closed/completed.
        }

        const isClosed =
          bp.isClosed === true ||
          bp.isCompleted === true ||
          status === "CLOSED" ||
          closureStatus.trim().length > 0 ||
          presaleStatus.toLowerCase() === "closed" ||
          String(bp.projectStatus || "").toLowerCase() === "closed";

        if (isClosed) {
          const cleanId = bp._id || bp.id || leadObj._id;
          const revenue = Number(bp.expectedBusiness || bp.amount || leadObj.expectedBusiness || 0);

          let closureCategory = "LOST";
          if (closureStatus.toLowerCase().includes("consultancy")) {
            closureCategory = "CONSULTANCY";
          } else if (closureStatus.toLowerCase().includes("design")) {
            closureCategory = "DESIGN";
          }

          normalizedList.push({
            id: cleanId,
            _id: cleanId,
            leadId: leadObj?._id || bp.leadId || cleanId,
            code: bp.projectCode || leadObj?.leadId || (cleanId ? `PRJ-${String(cleanId).slice(-4).toUpperCase()}` : "PRJ-CLS"),
            projectName: bp.projectName || leadObj?.projectName || "Unnamed Project",
            clientName: bp.clientName || bp.concernPersonName || leadObj?.clientName || "Client",
            phoneNumber: bp.phoneNumber || bp.contactNo || leadObj?.phoneNumber || "--",
            companyName: bp.companyName || leadObj?.companyName || "--",
            city: bp.city || leadObj?.city || "--",
            address: bp.address || leadObj?.address || "",
            workCategory: bp.workCategory || bp.businessType || leadObj?.workCategory || "Design",
            workType: bp.workType || leadObj?.workType || "Execution",
            expectedBusiness: revenue,
            priority: bp.priority || "High",
            activePerson: bp.nextPersonName || bp.projectCoordinatorName || bp.activePerson || bp.assignedTo || "Admin",
            closureCategory,
            closureReason: bp.closureReason || closureStatus || bp.lossReason || "Closed / Dropped",
            closureRemark: bp.closureRemark || bp.transferRemark || bp.remark || "",
            closedAtStage: bp.closedAtStage || bp.currentStageId || 1,
            closedAtDate: bp.closedAt || bp.updatedAt || bp.createdAt || new Date().toISOString(),
            remarks: bp.remarks || [],
            source: "Presales Pipeline",
            raw: bp
          });
        }
      });

      // Process Active Construction Projects (100% Completed OR Closed/Dropped)
      activeList.forEach((ap) => {
        const pStatus = String(ap.projectStatus || "").trim().toLowerCase();
        const progress = Number(ap.overallProgress ?? ap.progressPercent ?? 0);
        const isCompleted = pStatus === "completed" || progress === 100;
        const isClosed = pStatus === "closed" || pStatus === "dropped" || pStatus === "cancelled" || ap.isClosed === true;

        if (isCompleted) {
          const revNum = Number(String(ap.revenue || "").replace(/[^0-9]/g, "")) || 0;
          normalizedList.push({
            id: ap.id || ap._id,
            _id: ap.id || ap._id,
            leadId: ap.projectId || ap.presaleId || ap.id,
            code: ap.id || `PRJ-${String(ap._id || "").slice(-4).toUpperCase()}`,
            projectName: ap.projectName || "Site Execution Handover",
            clientName: ap.clientName || "Client",
            phoneNumber: ap.phone || "--",
            companyName: ap.companyName || "--",
            city: ap.city || "--",
            address: ap.address || "",
            workCategory: ap.engagementScope || ap.workCategory || "Design + Construction",
            workType: ap.workType || "Full Handover",
            expectedBusiness: revNum,
            priority: "High",
            activePerson: ap.activePerson || "Site Engineer",
            closureCategory: "CONSTRUCTION_COMPLETED",
            closureReason: ap.closureReason || "100% Construction Completed & Handed Over",
            closureRemark: ap.overallRemark || ap.finalTrackingRemark || "All stages successfully executed and snagged.",
            closedAtStage: "23 (Handover)",
            closedAtDate: ap.updatedAt || ap.createdAt || new Date().toISOString(),
            remarks: ap.dailyLogs || [],
            source: "Active Construction",
            raw: ap
          });
        } else if (isClosed) {
          const revNum = Number(String(ap.revenue || "").replace(/[^0-9]/g, "")) || 0;
          normalizedList.push({
            id: ap.id || ap._id,
            _id: ap.id || ap._id,
            leadId: ap.projectId || ap.presaleId || ap.id,
            code: ap.id || `PRJ-${String(ap._id || "").slice(-4).toUpperCase()}`,
            projectName: ap.projectName || "Site Execution Handover",
            clientName: ap.clientName || "Client",
            phoneNumber: ap.phone || "--",
            companyName: ap.companyName || "--",
            city: ap.city || "--",
            address: ap.address || "",
            workCategory: ap.engagementScope || ap.workCategory || "Design + Construction",
            workType: ap.workType || "Execution Stopped",
            expectedBusiness: revNum,
            priority: "Medium",
            activePerson: ap.activePerson || "Site Engineer",
            closureCategory: "LOST",
            closureReason: ap.closureReason || ap.overallRemark || "Construction Closed / Dropped",
            closureRemark: ap.closureRemark || ap.overallRemark || ap.finalTrackingRemark || "Project closed during site execution.",
            closedAtStage: ap.runningStageId || ap.currentStageId || "--",
            closedAtDate: ap.updatedAt || ap.createdAt || new Date().toISOString(),
            remarks: ap.dailyLogs || [],
            source: "Active Construction",
            raw: ap
          });
        }
      });

      // Sort newest closed first
      normalizedList.sort((a, b) => new Date(b.closedAtDate || 0) - new Date(a.closedAtDate || 0));
      setClosedProjects(normalizedList);
    } catch (err) {
      console.error("Error loading completed/closed projects:", err);
      toast.error("Failed to load completed projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedProjects();
  }, []);

  // Handle Reopen Action
  const handleConfirmReopen = async () => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    if (!projectToReopen) return;
    setIsReopening(true);
    try {
      const targetId = projectToReopen.id || projectToReopen._id;

      // 1. If from presale, call reopen API
      if (projectToReopen.source === "Presales Pipeline") {
        try {
          await reopenPresaleApi(targetId);
        } catch (apiErr) {
          console.warn("Reopen Presale API fallback to direct update:", apiErr);
          await updateLeadProjectApi(targetId, {
            status: "INTERESTED",
            closureStatus: "",
            closureRemark: "",
            isClosed: false,
            isCompleted: false,
            closedAt: null,
            closedAtStage: null
          });
        }
      } else {
        const list = activeProjectService.getAllActiveProjects();
        const updated = list.map((p) =>
          String(p.id) === String(targetId) ? { ...p, projectStatus: "On Track" } : p
        );
        activeProjectService.saveActiveProjects(updated);
        try {
          updateLeadProjectApi(targetId, {
            status: "ACTIVE_PROJECT",
            isCompleted: false,
            isClosed: false
          }).catch(() => {});
        } catch (e) {}
      }

      toast.success(`Project "${projectToReopen.projectName}" reopened back to active pipeline! 🎉`);
      setIsReopenModalOpen(false);
      setProjectToReopen(null);
      await fetchCompletedProjects();
    } catch (err) {
      console.error("Error reopening project:", err);
      toast.error(err?.response?.data?.message || "Failed to reopen project");
    } finally {
      setIsReopening(false);
    }
  };

  // Filtered Records
  const filteredList = useMemo(() => {
    const list = closedProjects.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.projectName.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.phoneNumber.includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.companyName.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.closureReason.toLowerCase().includes(q);

      const isItemLost = item.closureCategory === "LOST";

      let matchType = true;
      if (filterType === "LOST") {
        matchType = isItemLost;
      } else if (filterType === "COMPLETE") {
        if (isItemLost) {
          matchType = false;
        } else if (completeSubFilter === "CONSULTANCY") {
          matchType = item.closureCategory === "CONSULTANCY";
        } else if (completeSubFilter === "DESIGN") {
          matchType = item.closureCategory === "DESIGN";
        } else if (completeSubFilter === "CONSTRUCTION") {
          matchType = item.closureCategory === "CONSTRUCTION_COMPLETED";
        } else {
          matchType = true; // All Complete
        }
      }

      const matchPriority =
        filterPriority === "ALL" ||
        String(item.priority || "").toUpperCase() === filterPriority.toUpperCase();

      return matchSearch && matchType && matchPriority;
    });

    return list;
  }, [closedProjects, searchQuery, filterType, completeSubFilter, filterPriority]);

  // Metrics
  const metrics = useMemo(() => {
    const total = closedProjects.length;
    const totalVal = closedProjects.reduce((acc, c) => acc + (c.expectedBusiness || 0), 0);
    const lostCount = closedProjects.filter((c) => c.closureCategory === "LOST").length;
    const consultancyCount = closedProjects.filter((c) => c.closureCategory === "CONSULTANCY").length;
    const designCount = closedProjects.filter((c) => c.closureCategory === "DESIGN").length;
    const constructionCount = closedProjects.filter((c) => c.closureCategory === "CONSTRUCTION_COMPLETED").length;
    const completeCount = consultancyCount + designCount + constructionCount;

    return {
      total,
      totalValFormatted: `₹${(totalVal / 100000).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Lakhs`,
      totalValRaw: `₹${totalVal.toLocaleString("en-IN")}`,
      lostCount,
      consultancyCount,
      designCount,
      constructionCount,
      completeCount
    };
  }, [closedProjects]);

  // Pagination
  const totalPages = Math.ceil(filteredList.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, currentPage, rowsPerPage]);

  return (
    <div className="w-full min-h-full pb-16 font-sans">
      {/* ──────────────────────────────────────────────────────────────────
          1. FIXED / STICKY HEADER BANNER (DOES NOT SCROLL)
      ────────────────────────────────────────────────────────────────── */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-4 sm:p-5 text-white shadow-md border border-indigo-900/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10"
                title="Go Back"
              >
                <FaArrowLeft className="text-xs" />
              </button>
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    Complete Projects
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <HiSparkles className="w-2.5 h-2.5 text-emerald-300" /> Database Live
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/90 mt-0.5 leading-none font-normal">
                  Central archive of closed presale pipelines and completed construction handovers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm border ${
                  showFilters
                    ? "bg-white text-indigo-950 border-white shadow-md scale-105"
                    : "bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-100 border-indigo-600/50 hover:border-indigo-500"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className={`w-3.5 h-3.5 ${showFilters ? "text-indigo-700" : "text-indigo-300"}`} />
              </button>

              <button
                type="button"
                onClick={fetchCompletedProjects}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Refresh project list"
              >
                <FaSyncAlt className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
                <span>Refresh</span>
              </button>

              <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15">
                {closedProjects.length} Records
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto space-y-4 pt-2">
      {/* ──────────────────────────────────────────────────────────────────
          2. COMPACT KPI METRIC SUMMARY CARDS
      ────────────────────────────────────────────────────────────────── */}
      {/* ──────────────────────────────────────────────────────────────────
          2. COMPACT KPI METRIC SUMMARY CARDS
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            gradient="bg-gradient-to-br from-slate-800 to-slate-900"
            label="Total Closed"
            value={metrics.total}
            subtitle={metrics.totalValRaw}
            icon={<FaLayerGroup className="w-5 h-5 text-white" />}
            IconBg={<FaLayerGroup className="w-20 h-20" />}
            active={filterType === "ALL"}
            onClick={() => {
              setFilterType("ALL");
              setCurrentPage(1);
            }}
          />
          <KpiCard
            gradient="bg-gradient-to-br from-rose-600 to-red-700"
            label="Presale Lost / Dropped"
            value={metrics.lostCount}
            subtitle="Stopped before contract"
            icon={<FaTimesCircle className="w-5 h-5 text-white" />}
            IconBg={<FaTimesCircle className="w-20 h-20" />}
            active={filterType === "LOST"}
            onClick={() => {
              setFilterType("LOST");
              setCurrentPage(1);
            }}
          />
          <KpiCard
            gradient="bg-gradient-to-br from-indigo-600 to-purple-700"
            label="Consultancy & Design"
            value={metrics.consultancyCount + metrics.designCount}
            subtitle="Completed Scope Stage 2 / 10"
            icon={<FaFileAlt className="w-5 h-5 text-white" />}
            IconBg={<FaFileAlt className="w-20 h-20" />}
            active={filterType === "COMPLETE" && (completeSubFilter === "CONSULTANCY" || completeSubFilter === "DESIGN")}
            onClick={() => {
              setFilterType("COMPLETE");
              setCompleteSubFilter("ALL");
              setCurrentPage(1);
            }}
          />
          <KpiCard
            gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
            label="Construction Completed"
            value={metrics.constructionCount}
            subtitle="100% Handover & Snagged"
            icon={<FaCheckCircle className="w-5 h-5 text-white" />}
            IconBg={<FaCheckCircle className="w-20 h-20" />}
            active={filterType === "COMPLETE" && completeSubFilter === "CONSTRUCTION"}
            onClick={() => {
              setFilterType("COMPLETE");
              setCompleteSubFilter("CONSTRUCTION");
              setCurrentPage(1);
            }}
          />
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            3. SEARCH & TABLE-BASED FILTER CONTROL BAR (COLLAPSIBLE)
        ────────────────────────────────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-xs border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Top Row: Search Box + Priority Filter */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Box */}
              <div className="relative flex-1 max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by client, project name, phone, code or closure reason..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-slate-500">Priority:</span>
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setFilterPriority(p);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                      filterPriority === p
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Row: SEPARATE TABS: COMPLETE PROJECTS vs LOSS / DROPPED */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              {/* Primary Segments */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Complete Projects Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("COMPLETE");
                    setCompleteSubFilter("ALL");
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs border ${
                    filterType === "COMPLETE"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <FaCheckCircle className="text-xs" />
                  <span>Complete Projects</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      filterType === "COMPLETE"
                        ? "bg-white/25 text-white"
                        : "bg-emerald-200/80 text-emerald-900"
                    }`}
                  >
                    {metrics.completeCount}
                  </span>
                </button>

                {/* Loss / Dropped Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("LOST");
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-2xs border ${
                    filterType === "LOST"
                      ? "bg-rose-600 text-white border-rose-600 shadow-sm"
                      : "bg-rose-50/80 hover:bg-rose-100 text-rose-800 border-rose-200"
                  }`}
                >
                  <FaTimesCircle className="text-xs" />
                  <span>Loss / Dropped</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      filterType === "LOST"
                        ? "bg-white/25 text-white"
                        : "bg-rose-200/80 text-rose-900"
                    }`}
                  >
                    {metrics.lostCount}
                  </span>
                </button>

                {/* All Records Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setFilterType("ALL");
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border ${
                    filterType === "ALL"
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  }`}
                >
                  <FaLayerGroup className="text-xs" />
                  <span>All Records</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      filterType === "ALL"
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 text-slate-800"
                    }`}
                  >
                    {metrics.total}
                  </span>
                </button>
              </div>

              {/* Sub-filters when Complete Projects is active */}
              {filterType === "COMPLETE" && (
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Scope:</span>
                  {[
                    { id: "ALL", label: `All (${metrics.completeCount})` },
                    { id: "CONSULTANCY", label: `Consultancy (${metrics.consultancyCount})` },
                    { id: "DESIGN", label: `Design (${metrics.designCount})` },
                    { id: "CONSTRUCTION", label: `Construction (${metrics.constructionCount})` }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setCompleteSubFilter(sub.id);
                        setCurrentPage(1);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer border ${
                        completeSubFilter === sub.id
                          ? "bg-emerald-700 text-white border-emerald-700"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            4. CRM STANDARD TABLE VIEW (BLACK HEADER & ACTIONS AT FRONT)
        ────────────────────────────────────────────────────────────────── */}
        <div className="w-full bg-white border border-slate-200/90 shadow-xs overflow-hidden rounded-none">
          {/* Active Category Header Bar */}
          <div
            className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold border-b transition-colors ${
              filterType === "COMPLETE"
                ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                : filterType === "LOST"
                ? "bg-rose-50 text-rose-950 border-rose-200"
                : "bg-slate-100 text-slate-800 border-slate-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {filterType === "COMPLETE" && (
                <span className="p-1 rounded-md bg-emerald-600 text-white">
                  <FaCheckCircle className="text-xs" />
                </span>
              )}
              {filterType === "LOST" && (
                <span className="p-1 rounded-md bg-rose-600 text-white">
                  <FaTimesCircle className="text-xs" />
                </span>
              )}
              {filterType === "ALL" && (
                <span className="p-1 rounded-md bg-slate-800 text-white">
                  <FaLayerGroup className="text-xs" />
                </span>
              )}
              <span className="text-xs sm:text-sm font-black">
                {filterType === "COMPLETE"
                  ? `Completed Projects Archive (${filteredList.length})`
                  : filterType === "LOST"
                  ? `Loss / Dropped Projects Archive (${filteredList.length})`
                  : `All Closed & Completed Projects (${filteredList.length} total • ${metrics.completeCount} Complete, ${metrics.lostCount} Lost)`}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Value:{" "}
                <span className="font-bold text-slate-900 font-mono">
                  ₹{filteredList.reduce((acc, c) => acc + (c.expectedBusiness || 0), 0).toLocaleString("en-IN")}
                </span>
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
                  {/* 1. SR. NO */}
                  <th className="py-3 px-3 text-center w-12 border-r border-slate-800 whitespace-nowrap">
                    SR. NO.
                  </th>
                  {/* 2. ACTIONS AT FRONT (VIEW + RESTORE) */}
                  <th className="py-3 px-3 text-center w-28 border-r border-slate-800 whitespace-nowrap">
                    ACTIONS
                  </th>
                  {/* 3. PROJECT NAME */}
                  <th className="py-3 px-3 text-left border-r border-slate-800 whitespace-nowrap min-w-[180px]">
                    PROJECT NAME
                  </th>
                  {/* 4. CLIENT */}
                  <th className="py-3 px-3 text-left border-r border-slate-800 whitespace-nowrap min-w-[180px]">
                    CLIENT
                  </th>
                  {/* 5. AMOUNT */}
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                    AMOUNT
                  </th>
                  {/* 6. PRIORITY */}
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                    PRIORITY
                  </th>
                  {/* 7. CLOSURE REASON */}
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap min-w-[220px]">
                    CLOSURE REASON
                  </th>
                  {/* 8. STAGE STOPPED */}
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                    STAGE STOPPED
                  </th>
                  {/* 9. HANDLED BY */}
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                    HANDLED BY
                  </th>
                  {/* 10. CLOSED AT */}
                  <th className="py-3 px-3 text-center whitespace-nowrap">
                    CLOSED AT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-emerald-600 text-xl" />
                        <span className="text-xs font-semibold">Loading completed & closed projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500 font-medium">
                      {closedProjects.length === 0
                        ? "No closed or completed projects found in database."
                        : "No records match your search or filter."}
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((item, idx) => {
                    const srNo = (currentPage - 1) * rowsPerPage + idx + 1;
                    const amt = Number(item.expectedBusiness || 0);
                    const isLost = item.closureCategory === "LOST";
                    const isHandover = item.closureCategory === "CONSTRUCTION_COMPLETED";

                    const dateObj = item.closedAtDate ? new Date(item.closedAtDate) : null;
                    const isValidDate = dateObj && !isNaN(dateObj.getTime());
                    const formattedDate = isValidDate
                      ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "--";

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. SR NO */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                          {srNo}
                        </td>

                        {/* 2. ACTIONS: VIEW + RESTORE (AT FRONT) */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* VIEW FULL DETAILS PAGE */}
                            <button
                              type="button"
                              onClick={() => {
                                navigate(`/sales/complete-projects/details/${item.id}`, {
                                  state: { project: item }
                                });
                              }}
                              className="w-7 h-7 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="View Full Project Details & Media"
                            >
                              <FaEye className="text-xs" />
                            </button>

                            {/* REOPEN PROJECT BUTTON (Worker only) */}
                            {!isUserObserver && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProjectToReopen(item);
                                  setIsReopenModalOpen(true);
                                }}
                                className="w-7 h-7 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                title="Reopen Project"
                              >
                                <FaUndo className="text-xs" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* 3. PROJECT NAME */}
                        <td className="py-2.5 px-3 border-r border-slate-100">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.projectName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                              {item.code}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                              {item.workCategory}
                            </span>
                          </div>
                        </td>

                        {/* 4. CLIENT */}
                        <td className="py-2.5 px-3 border-r border-slate-100">
                          <div className="font-bold text-slate-900 text-xs">
                            {item.clientName}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                            <FaPhoneAlt className="text-[9px] text-slate-400" />
                            <span>{item.phoneNumber}</span>
                          </div>
                          {item.companyName && item.companyName !== "--" && (
                            <div className="text-[10px] text-slate-400 font-medium">
                              {item.companyName}
                            </div>
                          )}
                        </td>

                        {/* 5. AMOUNT */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
                            ₹{amt.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* 6. PRIORITY */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              item.priority?.toLowerCase() === "high" || item.priority?.toLowerCase() === "hot"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {item.priority || "High"}
                          </span>
                        </td>

                        {/* 7. CLOSURE REASON */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100">
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold max-w-[260px] truncate shadow-2xs">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isLost
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : isHandover
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              }`}
                            >
                              {isLost ? <FaTimesCircle className="text-[9px]" /> : <FaCheckCircle className="text-[9px]" />}
                              <span className="truncate">{item.closureReason}</span>
                            </span>
                          </div>
                          {item.closureRemark && (
                            <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[240px] mx-auto">
                              "{item.closureRemark}"
                            </p>
                          )}
                        </td>

                        {/* 8. STAGE STOPPED */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                            Stage {item.closedAtStage}
                          </span>
                        </td>

                        {/* 9. HANDLED BY */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-slate-700 font-semibold text-xs">
                            <FaUserTie className="text-slate-400 text-xs" />
                            <span className="truncate max-w-[120px]">{item.activePerson}</span>
                          </div>
                        </td>

                        {/* 10. CLOSED DATE */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-600 font-medium">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ──────────────────────────────────────────────────────────────────
              PAGINATION
          ────────────────────────────────────────────────────────────────── */}
          {filteredList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-600">
              <div>
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {(currentPage - 1) * rowsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-900">
                  {Math.min(currentPage * rowsPerPage, filteredList.length)}
                </span>{" "}
                of <span className="font-bold text-slate-900">{filteredList.length}</span> records
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Previous
                </button>
                <span className="font-bold text-slate-800 px-1 font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            5. MODAL: VIEW FULL CLOSURE DETAILS (MATCHING USER SCREENSHOT)
        ────────────────────────────────────────────────────────────────── */}
        {isModalOpen && selectedProject && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-8">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg font-bold">
                    <FaFileAlt />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {selectedProject.projectName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Code: <span className="font-mono font-bold">{selectedProject.code}</span> • Client: {selectedProject.clientName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProject(null);
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Exact Closed Banner matching User's screenshot */}
              <div className="p-4 rounded-2xl border border-rose-300 bg-rose-50/90 flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-xl bg-rose-600 text-white shadow-xs shrink-0 mt-0.5">
                    <FaTimesCircle className="text-base" />
                  </span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-rose-900 flex items-center gap-2">
                      <span>Presale Pipeline Closed</span>
                      {selectedProject.closedAtStage && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold">
                          At Stage {selectedProject.closedAtStage}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-rose-700 font-medium mt-0.5">
                      This lead has been stopped/dropped and archived.
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="text-xs text-rose-950 font-bold bg-white/80 px-3 py-1.5 rounded-lg border border-rose-200 inline-block">
                        Recorded Reason: <span className="font-extrabold text-rose-700">{selectedProject.closureReason}</span>
                      </div>
                      <div className="text-xs text-rose-950 font-bold bg-white/80 px-3 py-1.5 rounded-lg border border-rose-200 inline-flex items-center gap-1.5">
                        <FaUserTie className="text-rose-600 text-xs" />
                        <span>Closed By: <span className="font-extrabold text-rose-800">{selectedProject.activePerson || "Admin"}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold bg-rose-600 text-white px-3 py-1 rounded-full shadow-2xs shrink-0">
                  CLOSED
                </span>
              </div>

              {/* Project Commercial & Client Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Client Details</p>
                  <div className="font-bold text-slate-800">{selectedProject.clientName}</div>
                  <div className="text-slate-600 flex items-center gap-1.5 font-mono">
                    <FaPhoneAlt className="text-slate-400 text-[10px]" />
                    <span>{selectedProject.phoneNumber}</span>
                  </div>
                  {selectedProject.companyName && (
                    <div className="text-slate-500 text-[11px]">{selectedProject.companyName}</div>
                  )}
                  {selectedProject.city && (
                    <div className="text-slate-500 text-[11px]">{selectedProject.city}</div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <p className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Commercials & Scope</p>
                  <div className="font-black text-slate-900 text-sm font-mono">
                    ₹{Number(selectedProject.expectedBusiness || 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-slate-600 font-medium">
                    Work Category: <span className="font-bold text-slate-800">{selectedProject.workCategory}</span>
                  </div>
                  <div className="text-slate-600 font-medium">
                    Handled By: <span className="font-bold text-slate-800">{selectedProject.activePerson}</span>
                  </div>
                </div>
              </div>

              {/* Closure Remarks */}
              {selectedProject.closureRemark && (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-amber-50/50 space-y-1">
                  <p className="text-[11px] font-black uppercase text-amber-800 tracking-wider">Closure Remark / Note</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {selectedProject.closureRemark}
                  </p>
                </div>
              )}

              {/* Media & Discussion Remarks Callout Box */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <FaPaperclip className="text-indigo-600 text-sm shrink-0" />
                  <span>Discussion Remarks, Follow-up notes & Media Attachments</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    navigate(`/sales/complete-projects/details/${selectedProject.id}`, {
                      state: { project: selectedProject }
                    });
                  }}
                  className="font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>View All Remarks & Media Files</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </button>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Archived on {new Date(selectedProject.closedAtDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/sales/complete-projects/details/${selectedProject.id}`, {
                        state: { project: selectedProject }
                      });
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                    <span>Open Full Details Page</span>
                  </button>
                  {!isUserObserver && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setProjectToReopen(selectedProject);
                        setIsReopenModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <FaUndo className="text-xs" />
                      <span>Reopen Project</span>
                    </button>
                  )}
                  {selectedProject.source === "Presales Pipeline" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        navigate(`/sales/presales/${selectedProject.id}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Open Pipeline View
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedProject(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────
            6. MODAL: REOPEN CONFIRMATION DIALOG
        ────────────────────────────────────────────────────────────────── */}
        {isReopenModalOpen && projectToReopen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                  <FaUndo />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Reopen Project?
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    This project will be reopened back to the active Presales pipeline.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Project Name:</span>
                  <span className="font-bold text-slate-900">{projectToReopen.projectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Client:</span>
                  <span className="font-bold text-slate-900">{projectToReopen.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Value:</span>
                  <span className="font-bold font-mono text-emerald-700">
                    ₹{Number(projectToReopen.expectedBusiness || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Previous Reason:</span>
                  <span className="font-semibold text-rose-700 truncate max-w-[200px]">
                    {projectToReopen.closureReason}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isReopening}
                  onClick={() => {
                    setIsReopenModalOpen(false);
                    setProjectToReopen(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isReopening}
                  onClick={handleConfirmReopen}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isReopening ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Reopening...</span>
                    </>
                  ) : (
                    <>
                      <FaUndo className="text-xs" />
                      <span>Confirm Reopen</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompleteProjectsComponent;
