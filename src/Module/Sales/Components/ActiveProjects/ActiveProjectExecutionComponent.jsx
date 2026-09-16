import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHardHat,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUserTie,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaSave,
  FaCalendarAlt,
  FaCamera,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaCheck,
  FaTools,
  FaComments,
  FaFilter,
  FaSearch
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import activeProjectService from "../../services/activeProjectService";
import { contractorService } from "../../services/contractorService";

// Fallback seed contractors if API has none
const FALLBACK_CONTRACTORS = [
  "Apex Civil Infratech Pvt Ltd",
  "National Shuttering & Scaffolding Works",
  "Modern Bar Binders & Steel Works",
  "Krishna Excavators & Earthmovers",
  "Reliable MEP & Plumbing Solutions"
];

const ActiveProjectExecutionComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isViewerOnly = user?.role === "Observer"; // 2-login system

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable header state
  const [headerForm, setHeaderForm] = useState({
    activePerson: "",
    projectStatus: "On Track",
    projectSubStatus: "",
    overallRemark: ""
  });
  const [savingHeader, setSavingHeader] = useState(false);

  // Contractor Master list
  const [contractorsList, setContractorsList] = useState(FALLBACK_CONTRACTORS);

  // UI States
  const [expandedStages, setExpandedStages] = useState({});
  const [stageFilter, setStageFilter] = useState("ALL"); // ALL, IN_PROGRESS, COMPLETED, DELAYED
  const [taskSearch, setTaskSearch] = useState("");

  // Load project
  const loadProjectData = () => {
    setLoading(true);
    try {
      const data = activeProjectService.getActiveProjectById(id);
      if (data) {
        setProject(data);
        setHeaderForm({
          activePerson: data.activePerson || "",
          projectStatus: data.projectStatus || "On Track",
          projectSubStatus: data.projectSubStatus || "",
          overallRemark: data.overallRemark || ""
        });

        // Expand the first stage by default if not set
        setExpandedStages((prev) => {
          if (Object.keys(prev).length === 0 && data.stages?.length > 0) {
            return { [data.stages[0].stageId]: true };
          }
          return prev;
        });
      } else {
        toast.error("Active Project not found with ID: " + id);
        navigate("/sales/active-projects");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  // Load Contractors from Module 5
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await contractorService.getAllContractors({ limit: 200 });
        const items = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          const names = items.map((c) => c.contractorName || c.name).filter(Boolean);
          if (names.length > 0) {
            setContractorsList(names);
          }
        }
      } catch (e) {
        console.warn("Using fallback contractors list");
      }
    };
    fetchContractors();
  }, []);

  // Save Project Header Metadata
  const handleSaveHeader = (e) => {
    e.preventDefault();
    if (isViewerOnly) {
      toast.warn("Viewers cannot modify project metadata.");
      return;
    }
    setSavingHeader(true);
    try {
      const updated = activeProjectService.updateProjectMetadata(id, headerForm);
      if (updated) {
        setProject(updated);
        toast.success("Project status & site manager details updated!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update project details.");
    } finally {
      setSavingHeader(false);
    }
  };

  // Toggle stage accordion
  const toggleStage = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const expandAllStages = () => {
    const next = {};
    (project?.stages || []).forEach((s) => {
      next[s.stageId] = true;
    });
    setExpandedStages(next);
  };

  const collapseAllStages = () => {
    setExpandedStages({});
  };

  // Handle Task Updates (Status, Contractor, Deadline, Photo, Remark)
  const handleTaskUpdate = (stageId, workId, taskId, updates) => {
    if (isViewerOnly) {
      toast.warn("Viewers cannot update task checklist.");
      return;
    }

    try {
      const updated = activeProjectService.updateTask(id, stageId, workId, taskId, updates);
      if (updated) {
        setProject(updated);
        // Sync project status in header form if changed
        setHeaderForm((prev) => ({
          ...prev,
          projectStatus: updated.projectStatus
        }));
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update task.");
    }
  };

  // Handle Photo Upload (Base64)
  const handlePhotoUpload = (stageId, workId, taskId, e) => {
    if (isViewerOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Photo size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleTaskUpdate(stageId, workId, taskId, { photoUrl: reader.result });
      toast.success("Site photo attached!");
    };
    reader.readAsDataURL(file);
  };

  // Filtered Stages
  const filteredStages = useMemo(() => {
    if (!project?.stages) return [];
    return project.stages.filter((stg) => {
      // Stage filter
      if (stageFilter === "COMPLETED" && stg.status !== "Completed") return false;
      if (stageFilter === "IN_PROGRESS" && stg.status !== "In Progress") return false;
      if (stageFilter === "NOT_STARTED" && stg.status !== "Not Started") return false;

      // Task search
      if (taskSearch) {
        const q = taskSearch.toLowerCase();
        const stageMatch = stg.stageName.toLowerCase().includes(q) || stg.stageId.toLowerCase().includes(q);
        const taskMatch = (stg.works || []).some((w) =>
          w.workName.toLowerCase().includes(q) ||
          (w.tasks || []).some((t) => t.taskName.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q))
        );
        return stageMatch || taskMatch;
      }

      return true;
    });
  }, [project?.stages, stageFilter, taskSearch]);

  if (loading || !project) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold">Loading Site Tracking Screen...</p>
      </div>
    );
  }

  const completedStagesCount = (project.stages || []).filter((s) => s.status === "Completed").length;
  const totalStagesCount = (project.stages || []).length;

  return (
    <div className="space-y-4 pb-20 font-sans">
      {/* ================= FIXED / STICKY HEADER BANNER ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl px-4 py-3 shadow-md border border-indigo-700/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/sales/active-projects")}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10 mt-0.5"
                title="Back to Active Projects"
              >
                <FaArrowLeft className="text-xs" />
              </button>
              <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
                <FaHardHat className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                    {project.id}
                  </span>
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    {project.clientName}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    Site Execution
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
                <p className="text-[11px] text-indigo-200/90 mt-0.5 leading-none font-normal">
                  {project.workType || "Design + Construction"} • {project.city || "Lucknow"} • 23 Major Stages Execution
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15">
                {project.overallProgress || 0}% Complete ({completedStagesCount}/{totalStagesCount} Stages)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Read-Only Alert Banner if Observer */}
      {isViewerOnly && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <FaLock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Viewer Role:</strong> You are browsing in read-only mode. Task status toggles, contractor assignments, and notes are disabled.
          </span>
        </div>
      )}

      {/* ================= PROJECT OVERVIEW & METADATA CARD (Presale Carry-Forward) ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Presale Carry-Forward Details (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Presale Details (Carry-Forward)
              </span>
              <span className="text-xs font-bold text-slate-500">
                Contract: {project.contractSignedDate || "Signed"}
              </span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{project.clientName}</h1>
              <div className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {project.workType || "Design + Construction"}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-extrabold">{project.engagementScope}</span>
                {project.revenue && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-700 font-black">Revenue: {project.revenue}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{project.address || `${project.city}, UP`}</span>
              </div>
              {project.phone && (
                <div className="flex items-center gap-2">
                  <FaPhoneAlt className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{project.phone}</span>
                </div>
              )}
            </div>

            {/* Overall Progress Gauge */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Overall Site Execution Progress
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-0.5">
                    {project.overallProgress || 0}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-indigo-700">
                    {completedStagesCount} of {totalStagesCount} Stages Completed
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {project.completedTasks || 0} / {project.totalTasks || 0} Tasks Done
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    project.overallProgress === 100
                      ? "bg-emerald-500"
                      : project.projectStatus === "Delayed"
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"
                  }`}
                  style={{ width: `${project.overallProgress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right: Editable Site Operations Metadata Form (Cols 8-12) */}
          <div className="lg:col-span-5 bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FaUserTie className="w-3.5 h-3.5 text-indigo-600" />
                <span>Site Management Entry</span>
              </h3>
              {!isViewerOnly && (
                <button
                  type="button"
                  onClick={handleSaveHeader}
                  disabled={savingHeader}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <FaSave className="w-3 h-3" />
                  <span>{savingHeader ? "Saving..." : "Save"}</span>
                </button>
              )}
            </div>

            {/* Current Active Person */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Current Active Person in Project (Site Lead / PM)
              </label>
              <input
                type="text"
                disabled={isViewerOnly}
                value={headerForm.activePerson}
                onChange={(e) => setHeaderForm({ ...headerForm, activePerson: e.target.value })}
                placeholder="e.g. Er. Amit Sharma (Site Engineer)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-100"
              />
            </div>

            {/* Project Status & Sub-Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Project Status
                </label>
                <select
                  disabled={isViewerOnly}
                  value={headerForm.projectStatus}
                  onChange={(e) => setHeaderForm({ ...headerForm, projectStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-100"
                >
                  <option value="On Track">On Track</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Delayed">Delayed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Project Sub-Status
                </label>
                <input
                  type="text"
                  disabled={isViewerOnly}
                  value={headerForm.projectSubStatus}
                  onChange={(e) => setHeaderForm({ ...headerForm, projectSubStatus: e.target.value })}
                  placeholder="Current site situation..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Overall Remark */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Overall Project Remark
              </label>
              <textarea
                rows={2}
                disabled={isViewerOnly}
                value={headerForm.overallRemark}
                onChange={(e) => setHeaderForm({ ...headerForm, overallRemark: e.target.value })}
                placeholder="Site execution notes, client feedback, or pending approvals..."
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 23 MAJOR STAGES CHECKLIST ACCORDION HEADER ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                23
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                23-Stage Construction Execution Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cloned from PMS Master. Click task status to update: <strong>Not Started → In Progress → Completed</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setStageFilter("ALL")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  stageFilter === "ALL" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({totalStagesCount})
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("IN_PROGRESS")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  stageFilter === "IN_PROGRESS" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                In Progress
              </button>
              <button
                type="button"
                onClick={() => setStageFilter("COMPLETED")}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  stageFilter === "COMPLETED" ? "bg-white text-emerald-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Completed ({completedStagesCount})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={expandAllStages}
                className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllStages}
                className="px-2.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
              >
                Collapse
              </button>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/40">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Search stage name, work, or task description..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>
        </div>

        {/* ================= STAGES LIST ================= */}
        <div className="divide-y divide-slate-200/80">
          {filteredStages.map((stage) => {
            const isExpanded = Boolean(expandedStages[stage.stageId]);
            const isCompleted = stage.status === "Completed";
            const isInProgress = stage.status === "In Progress";

            return (
              <div key={stage.stageId} className="transition-colors">
                {/* Stage Header Accordion Bar */}
                <div
                  onClick={() => toggleStage(stage.stageId)}
                  className={`px-4 sm:px-6 py-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isCompleted
                      ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                      : isInProgress
                      ? "bg-indigo-50/30 hover:bg-indigo-50/60"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isInProgress
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {isCompleted ? <FaCheck className="w-3 h-3" /> : stage.stageId}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                          {stage.stageId}: {stage.stageName}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isInProgress
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{(stage.works || []).length} Works</span>
                        <span>•</span>
                        <span>{stage.completedTasksCount || 0} / {stage.totalTasksCount || 0} Tasks Done</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-2 w-28">
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${stage.progressPercent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 min-w-[28px] text-right">
                        {stage.progressPercent || 0}%
                      </span>
                    </div>

                    <div className="p-1 text-slate-400">
                      {isExpanded ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>

                {/* Stage Body: Works & Tasks */}
                {isExpanded && (
                  <div className="px-4 sm:px-6 py-4 bg-slate-50/50 space-y-4 border-t border-slate-100">
                    {(stage.works || []).map((work) => {
                      const isWorkDone = work.status === "Completed";

                      return (
                        <div
                          key={work.workId}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3"
                        >
                          {/* Work Header */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                {work.workId}
                              </span>
                              <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                                {work.workName}
                              </h5>
                            </div>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                                isWorkDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                              }`}
                            >
                              {work.completedTasksCount || 0}/{work.totalTasksCount || 0} Tasks Done
                            </span>
                          </div>

                          {/* Tasks Under this Work */}
                          <div className="space-y-3">
                            {(work.tasks || []).map((task) => {
                              const isTaskDone = task.status === "Completed";
                              const isTaskInProg = task.status === "In Progress";

                              return (
                                <div
                                  key={task.taskId}
                                  className={`p-3.5 rounded-xl border transition-all ${
                                    isTaskDone
                                      ? "bg-emerald-50/20 border-emerald-200/70"
                                      : task.isOverdue
                                      ? "bg-red-50/30 border-red-200 ring-1 ring-red-300"
                                      : isTaskInProg
                                      ? "bg-blue-50/20 border-blue-200"
                                      : "bg-slate-50/40 border-slate-200/80"
                                  }`}
                                >
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    {/* Task Name & Code */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1 rounded">
                                          {task.taskId}
                                        </span>
                                        <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                                          {task.taskName}
                                        </span>
                                        {task.isOverdue && (
                                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                                            OVERDUE
                                          </span>
                                        )}
                                      </div>

                                      {/* Contractor & Deadline Display / Selector */}
                                      <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-600">
                                        {/* Contractor Assignment */}
                                        <div className="flex items-center gap-1.5">
                                          <FaHardHat className="w-3 h-3 text-amber-500 shrink-0" />
                                          <select
                                            disabled={isViewerOnly}
                                            value={task.assignedContractor || ""}
                                            onChange={(e) =>
                                              handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                                assignedContractor: e.target.value
                                              })
                                            }
                                            className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                          >
                                            <option value="">-- Assign Contractor --</option>
                                            {contractorsList.map((c) => (
                                              <option key={c} value={c}>
                                                {c}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        {/* Target Deadline Date */}
                                        <div className="flex items-center gap-1.5">
                                          <FaCalendarAlt className="w-3 h-3 text-indigo-500 shrink-0" />
                                          <input
                                            type="date"
                                            disabled={isViewerOnly}
                                            value={task.deadlineDate || ""}
                                            onChange={(e) =>
                                              handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                                deadlineDate: e.target.value
                                              })
                                            }
                                            className="px-2 py-0.5 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                          />
                                        </div>

                                        {/* Photo Upload Attachment */}
                                        <div className="flex items-center gap-1.5">
                                          <label
                                            className={`cursor-pointer px-2 py-1 rounded border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                                              task.photoUrl
                                                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                            } ${isViewerOnly ? "pointer-events-none opacity-60" : ""}`}
                                          >
                                            <FaCamera className="w-3 h-3 text-slate-400" />
                                            <span>{task.photoUrl ? "Photo Attached" : "Site Photo"}</span>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              disabled={isViewerOnly}
                                              onChange={(e) =>
                                                handlePhotoUpload(stage.stageId, work.workId, task.taskId, e)
                                              }
                                              className="hidden"
                                            />
                                          </label>
                                          {task.photoUrl && (
                                            <a
                                              href={task.photoUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[10px] text-indigo-600 font-bold underline"
                                            >
                                              View
                                            </a>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Task Status Toggles: Not Started -> In Progress -> Completed */}
                                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0">
                                      <button
                                        type="button"
                                        disabled={isViewerOnly}
                                        onClick={() =>
                                          handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                            status: "Not Started"
                                          })
                                        }
                                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                          task.status === "Not Started"
                                            ? "bg-slate-600 text-white shadow-xs"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                        } disabled:opacity-50`}
                                      >
                                        Not Started
                                      </button>

                                      <button
                                        type="button"
                                        disabled={isViewerOnly}
                                        onClick={() =>
                                          handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                            status: "In Progress"
                                          })
                                        }
                                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                          isTaskInProg
                                            ? "bg-blue-600 text-white shadow-xs"
                                            : "text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                        } disabled:opacity-50`}
                                      >
                                        In Progress
                                      </button>

                                      <button
                                        type="button"
                                        disabled={isViewerOnly}
                                        onClick={() =>
                                          handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                            status: "Completed"
                                          })
                                        }
                                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                          isTaskDone
                                            ? "bg-emerald-600 text-white shadow-xs"
                                            : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                                        } disabled:opacity-50`}
                                      >
                                        <FaCheck className="w-2.5 h-2.5" />
                                        <span>Completed</span>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Task Notes / Remarks Field */}
                                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2">
                                    <FaComments className="w-3 h-3 text-slate-300 shrink-0" />
                                    <input
                                      type="text"
                                      disabled={isViewerOnly}
                                      value={task.remark || ""}
                                      onChange={(e) =>
                                        handleTaskUpdate(stage.stageId, work.workId, task.taskId, {
                                          remark: e.target.value
                                        })
                                      }
                                      placeholder="Site log note, delay reason, or inspection point..."
                                      className="w-full text-xs text-slate-700 bg-transparent placeholder:text-slate-300 focus:outline-none disabled:bg-transparent"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectExecutionComponent;
