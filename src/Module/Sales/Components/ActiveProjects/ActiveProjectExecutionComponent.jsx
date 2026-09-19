import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaHardHat,
  FaHammer,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaUserTie,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaSave,
  FaCalendarAlt,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaLock,
  FaSearch,
  FaClipboardList,
  FaRupeeSign,
  FaLayerGroup,
  FaSpinner,
  FaPlus,
  FaTrash
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import activeProjectService, {
  isObjectId,
  mapPmsStagesToExecutionStages
} from "../../services/activeProjectService";
import { contractorService } from "../../services/contractorService";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import pmsTemplateService from "../../services/pmsTemplateService";
import { pmsWbsService } from "../../services/pmsWbsService";

const ActiveProjectExecutionComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "view";
  const { user } = useAuth();
  const isViewerOnly = user?.role === "Observer";

  const isEditMode = mode === "edit" && !isViewerOnly;
  const isReadOnly = !isEditMode;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);

  // Project header form
  const [headerForm, setHeaderForm] = useState({
    activePerson: "",
    projectStatus: "On Track",
    startDate: "",
    targetDate: "",
    overallRemark: ""
  });

  // WBS stages/works/tasks data
  const [stagesData, setStagesData] = useState([]);
  const [expandedStages, setExpandedStages] = useState({});
  const [taskSearch, setTaskSearch] = useState("");
  const [contractorsList, setContractorsList] = useState([]);

  // ============================================================
  // DAILY SITE LOGS (NEW)
  // ============================================================
  const [dailyLogs, setDailyLogs] = useState([]);
  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split("T")[0],
    loggedBy: user?.name || user?.username || "",
    stageId: "",
    workId: "",
    taskId: "",
    status: "In Progress",
    manpowerCount: "",
    summary: "",
    remark: ""
  });

  // ============================================================
  // LOAD PROJECT + SYNC
  // ============================================================
  const loadProjectData = async () => {
    setLoading(true);
    try {
      let presales = [];
      let pmsList = [];
      let wbsData = null;

      const [presalesRes, pmsRes, wbsRes] = await Promise.allSettled([
        getAllLeadProjectsApi(),
        pmsTemplateService.getAllTemplates({ limit: 1000 }),
        pmsWbsService.getAllWbsData()
      ]);

      if (presalesRes.status === "fulfilled") {
        const raw =
          presalesRes.value?.data?.projects ||
          presalesRes.value?.data?.data?.projects ||
          presalesRes.value?.projects ||
          (Array.isArray(presalesRes.value?.data) ? presalesRes.value.data : []);
        if (Array.isArray(raw)) presales = raw;
      }

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
      } catch (e) {}

      const dedupMap = new Map();
      pmsList.forEach((t) => {
        const key = t?._id
          ? String(t._id)
          : `${t?.clientName}-${t?.projectName}-${t?.duration}`;
        dedupMap.set(key, t);
      });
      pmsList = Array.from(dedupMap.values());

      if (wbsRes.status === "fulfilled") {
        wbsData = wbsRes.value?.data?.data || wbsRes.value?.data || null;
      }

      try {
        activeProjectService.syncWithPresales(presales, pmsList, wbsData);
      } catch (syncErr) {
        if (process.env.NODE_ENV !== "production") console.warn(syncErr);
      }

      const data = activeProjectService.getActiveProjectById(id, wbsData);

      if (!data) {
        toast.error("Active Project not found with ID: " + id);
        navigate("/sales/active-projects");
        return;
      }

      const directTmpl = pmsList.find((t) => {
        const pId = String(t.projectId?._id || t.projectId || "");
        const lId = String(t.leadId?._id || t.leadId || "");
        const tClient = (
          t.clientName ||
          t.projectId?.clientName ||
          t.leadId?.clientName ||
          ""
        )
          .toLowerCase()
          .trim();
        const pClient = (data.clientName || "").toLowerCase().trim();
        return (
          pId === String(id) ||
          pId === String(data.projectId) ||
          (data.leadId && lId === String(data.leadId)) ||
          (tClient && pClient && tClient === pClient)
        );
      });

      try {
        if (directTmpl && Array.isArray(directTmpl.stages) && directTmpl.stages.length > 0) {
          data.stages = mapPmsStagesToExecutionStages(directTmpl.stages, wbsData, data.stages);
          if (typeof activeProjectService.saveFullProject === "function") {
            activeProjectService.saveFullProject(data.id, data);
          }
        }
      } catch (syncErr) {
        if (process.env.NODE_ENV !== "production") console.warn(syncErr);
      }

      setProject(data);
      setHeaderForm({
        activePerson: data.activePerson || user?.name || "Site Engineer",
        projectStatus: data.projectStatus || "On Track",
        startDate: data.contractSignedDate || new Date().toISOString().split("T")[0],
        targetDate: data.targetCompletionDate || "",
        overallRemark: data.overallRemark || ""
      });

      const stgs = data.stages || [];
      setStagesData(stgs);

      // Load daily logs from project
      setDailyLogs(Array.isArray(data.dailyLogs) ? data.dailyLogs : []);

      const allExp = {};
      stgs.forEach((s) => {
        allExp[s.stageId] = true;
      });
      setExpandedStages(allExp);
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error(e);
      toast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectData();
  }, [id]);

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await contractorService.getAllContractors({ limit: 200 });
        const items = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          const names = items.map((c) => c.contractorName || c.name).filter(Boolean);
          if (names.length > 0) setContractorsList(names);
        }
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.warn(e);
      }
    };
    fetchContractors();
  }, []);

  // ============================================================
  // DAILY LOG HANDLERS
  // ============================================================
  const handleAddDailyLog = () => {
    if (isReadOnly) {
      toast.warn("View-Only mode: Cannot add daily log.");
      return;
    }
    if (!newLog.summary?.trim()) {
      toast.error("Please enter work summary.");
      return;
    }

    const stg = stagesData.find((s) => s.stageId === newLog.stageId);
    const wk = stg?.works?.find((w) => w.workId === newLog.workId);
    const tk = wk?.tasks?.find((t) => t.taskId === newLog.taskId);

    const logEntry = {
      id: `LOG-${Date.now()}`,
      date: newLog.date,
      loggedBy: newLog.loggedBy || user?.name || "Site Engineer",
      stageId: newLog.stageId || "",
      stageName: stg?.stageName || "",
      workId: newLog.workId || "",
      workName: wk?.workName || "",
      taskId: newLog.taskId || "",
      taskName: tk?.taskName || "",
      status: newLog.status || "In Progress",
      manpowerCount: newLog.manpowerCount || "",
      summary: newLog.summary,
      remark: newLog.remark || "",
      createdAt: new Date().toISOString()
    };

    // If task selected, auto-update task status/remark in stagesData
    if (newLog.stageId && newLog.workId && newLog.taskId) {
      handleTaskFieldChange(newLog.stageId, newLog.workId, newLog.taskId, "status", newLog.status);
      if (newLog.remark) {
        handleTaskFieldChange(newLog.stageId, newLog.workId, newLog.taskId, "remark", newLog.remark);
      }
    }

    setDailyLogs((prev) => [logEntry, ...prev]);

    // Reset form (keep date and loggedBy)
    setNewLog((prev) => ({
      ...prev,
      stageId: "",
      workId: "",
      taskId: "",
      status: "In Progress",
      manpowerCount: "",
      summary: "",
      remark: ""
    }));

    toast.success("Daily log added! Click 'Save Project Execution' to persist.");
  };

  const handleRemoveDailyLog = (logId) => {
    if (isReadOnly) return;
    setDailyLogs((prev) => prev.filter((l) => l.id !== logId));
  };

  // ============================================================
  // TASK FIELD UPDATE
  // ============================================================
  const handleTaskFieldChange = (stageId, workId, taskId, field, value) => {
    if (isReadOnly) {
      toast.warn("View-Only mode.");
      return;
    }
    setStagesData((prevStages) =>
      prevStages.map((stg) => {
        if (stg.stageId !== stageId) return stg;
        return {
          ...stg,
          works: (stg.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return {
              ...w,
              tasks: (w.tasks || []).map((t) =>
                t.taskId === taskId ? { ...t, [field]: value } : t
              )
            };
          })
        };
      })
    );
  };

  // ============================================================
  // SAVE
  // ============================================================
  const handleSaveAll = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isReadOnly) {
      toast.warn("View-Only mode: Cannot modify.");
      return;
    }

    setSavingAll(true);
    try {
      const updated = activeProjectService.saveFullProject(id, {
        activePerson: headerForm.activePerson,
        projectStatus: headerForm.projectStatus,
        contractSignedDate: headerForm.startDate,
        targetCompletionDate: headerForm.targetDate,
        overallRemark: headerForm.overallRemark,
        stages: stagesData,
        dailyLogs
      });

      if (updated) {
        setProject(updated);
        setStagesData(updated.stages || []);
        setDailyLogs(updated.dailyLogs || []);
        toast.success("Project execution + daily logs saved successfully! 🎯");
      } else {
        toast.error("Could not save. Record not found.");
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      toast.error("Failed to save.");
    } finally {
      setSavingAll(false);
    }
  };

  // ============================================================
  // DERIVED COUNTS
  // ============================================================
  const totalStagesCount = stagesData.length;
  const totalWorksCount = useMemo(
    () => stagesData.reduce((sum, s) => sum + (s.works?.length || 0), 0),
    [stagesData]
  );
  const totalTasksCount = useMemo(
    () =>
      stagesData.reduce(
        (sum, s) => sum + (s.works || []).reduce((wSum, w) => wSum + (w.tasks?.length || 0), 0),
        0
      ),
    [stagesData]
  );
  const completedTasksCount = useMemo(
    () =>
      stagesData.reduce(
        (sum, s) =>
          sum +
          (s.works || []).reduce(
            (wSum, w) => wSum + (w.tasks || []).filter((t) => t.status === "Completed").length,
            0
          ),
        0
      ),
    [stagesData]
  );
  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Cascading for daily log form
  const logStageObj = useMemo(
    () => stagesData.find((s) => s.stageId === newLog.stageId) || null,
    [stagesData, newLog.stageId]
  );
  const logWorksAvail = useMemo(() => logStageObj?.works || [], [logStageObj]);
  const logWorkObj = useMemo(
    () => logWorksAvail.find((w) => w.workId === newLog.workId) || null,
    [logWorksAvail, newLog.workId]
  );
  const logTasksAvail = useMemo(() => logWorkObj?.tasks || [], [logWorkObj]);

  // Search filter
  const filteredStages = useMemo(() => {
    if (!taskSearch) return stagesData;
    const q = taskSearch.toLowerCase();
    return stagesData.filter((stg) => {
      const stageMatch =
        stg.stageName?.toLowerCase().includes(q) || stg.stageId?.toLowerCase().includes(q);
      const taskMatch = (stg.works || []).some(
        (w) =>
          w.workName?.toLowerCase().includes(q) ||
          w.workId?.toLowerCase().includes(q) ||
          (w.tasks || []).some(
            (t) => t.taskName?.toLowerCase().includes(q) || t.taskId?.toLowerCase().includes(q)
          )
      );
      return stageMatch || taskMatch;
    });
  }, [stagesData, taskSearch]);

  const toggleStage = (stageId) =>
    setExpandedStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));

  if (loading || !project) {
    return (
      <div className="py-24 text-center text-slate-400 font-sans">
        <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading...</p>
      </div>
    );
  }

  const projectStatusBadgeClasses =
    headerForm.projectStatus === "Completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : headerForm.projectStatus === "In Progress"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : headerForm.projectStatus === "Delayed"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : headerForm.projectStatus === "On Hold"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-20 px-1 sm:px-3">
      {/* ================= 1. HEADER ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/sales/active-projects")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center shrink-0 mt-0.5"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                  Type: {project.workType || "Turnkey Construction"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                  Category: {project.workCategory || "Construction"}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${projectStatusBadgeClasses}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {headerForm.projectStatus}
                </span>
                {isReadOnly ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <FaLock className="w-2.5 h-2.5 text-slate-500" /> View-Only
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Editor Mode
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1 truncate">
                {project.clientName}
                {project.projectName &&
                project.projectName !== "Site Execution" &&
                project.projectName !== "Site Workflow"
                  ? ` — ${project.projectName}`
                  : ""}
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Multi-stage Construction Checklist & daily task execution tracking.
              </p>
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => navigate("/sales/active-projects")}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={savingAll}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingAll ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-3.5 h-3.5" />
                    <span>Save Project Execution</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
          <FaLock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            <strong>View-Only Mode:</strong> This project is read-only.
          </span>
        </div>
      )}

      {/* ================= 2. FORM ================= */}
      <form
        onSubmit={handleSaveAll}
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6"
      >
        {/* --- CLIENT & PROJECT INFO --- */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Client Name</label>
              <input
                type="text"
                readOnly
                value={project.clientName || ""}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact</label>
              <input
                type="text"
                readOnly
                value={project.phone || "—"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                readOnly
                value={project.projectName || "Site Workflow"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Site Location</label>
              <input
                type="text"
                readOnly
                value={project.address || project.city || "—"}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* --- SITE MANAGEMENT --- */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Active Person (Site Lead) {isEditMode && <span className="text-rose-500">*</span>}
              </label>
              <input
                type="text"
                disabled={isReadOnly}
                value={headerForm.activePerson}
                onChange={(e) => setHeaderForm({ ...headerForm, activePerson: e.target.value })}
                placeholder="e.g. Er. Amit Sharma"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Overall Status {isEditMode && <span className="text-rose-500">*</span>}
              </label>
              <select
                disabled={isReadOnly}
                value={headerForm.projectStatus}
                onChange={(e) => setHeaderForm({ ...headerForm, projectStatus: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50"
              >
                <option value="On Track">On Track</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                disabled={isReadOnly}
                value={headerForm.startDate}
                onChange={(e) => setHeaderForm({ ...headerForm, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Date</label>
              <input
                type="date"
                disabled={isReadOnly}
                value={headerForm.targetDate}
                onChange={(e) => setHeaderForm({ ...headerForm, targetDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50"
              />
            </div>
            <div className="md:col-span-2 flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-700 mb-1">Progress</span>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden border">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-black text-slate-800 whitespace-nowrap">
                  {completedTasksCount}/{totalTasksCount} ({progressPercent}%)
                </span>
              </div>
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Overall Remark</label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={headerForm.overallRemark}
                onChange={(e) => setHeaderForm({ ...headerForm, overallRemark: e.target.value })}
                placeholder="Project-level notes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* ============================================================
            --- DAILY SITE TRACKING (NEW SECTION) ---
            ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FaClipboardList className="text-indigo-600 w-4 h-4" />
            <h3 className="text-sm font-black text-slate-900">
              Daily Site Tracking Log
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {dailyLogs.length} Entries
            </span>
          </div>

          {/* --- ENTRY FORM (DDL CASCADING) --- */}
          {!isReadOnly && (
            <div className="bg-gradient-to-br from-indigo-50/60 to-white border-2 border-indigo-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <FaPlus className="w-3 h-3" />
                <span>Add Today's Progress</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Date */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newLog.date}
                    onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                {/* Logged By */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Logged By
                  </label>
                  <input
                    type="text"
                    value={newLog.loggedBy}
                    onChange={(e) => setNewLog({ ...newLog, loggedBy: e.target.value })}
                    placeholder="Site Engineer name"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                {/* Manpower */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Manpower Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newLog.manpowerCount}
                    onChange={(e) => setNewLog({ ...newLog, manpowerCount: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={newLog.status}
                    onChange={(e) => setNewLog({ ...newLog, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                {/* Stage DDL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Stage
                  </label>
                  <select
                    value={newLog.stageId}
                    onChange={(e) =>
                      setNewLog({
                        ...newLog,
                        stageId: e.target.value,
                        workId: "",
                        taskId: ""
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="">-- Select Stage --</option>
                    {stagesData.map((s) => (
                      <option key={s.stageId} value={s.stageId}>
                        {s.stageId} - {s.stageName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Work DDL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Work
                  </label>
                  <select
                    value={newLog.workId}
                    disabled={!newLog.stageId}
                    onChange={(e) =>
                      setNewLog({ ...newLog, workId: e.target.value, taskId: "" })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!newLog.stageId ? "-- Select Stage First --" : "-- Select Work --"}
                    </option>
                    {logWorksAvail.map((w) => (
                      <option key={w.workId} value={w.workId}>
                        {w.workName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task DDL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Task
                  </label>
                  <select
                    value={newLog.taskId}
                    disabled={!newLog.workId}
                    onChange={(e) => setNewLog({ ...newLog, taskId: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!newLog.workId ? "-- Select Work First --" : "-- Select Task --"}
                    </option>
                    {logTasksAvail.map((t) => (
                      <option key={t.taskId} value={t.taskId}>
                        {t.taskName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary + Remark */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Work Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLog.summary}
                    onChange={(e) => setNewLog({ ...newLog, summary: e.target.value })}
                    placeholder="e.g. Slab casting 40% done, 12 workers deployed"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Remark
                  </label>
                  <input
                    type="text"
                    value={newLog.remark}
                    onChange={(e) => setNewLog({ ...newLog, remark: e.target.value })}
                    placeholder="Any site issue, delay reason..."
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddDailyLog}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Add Daily Log</span>
                </button>
              </div>
            </div>
          )}

          {/* --- DAILY LOGS LIST --- */}
          <div className="space-y-2">
            {dailyLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
                No daily logs added yet. {!isReadOnly && "Add the first entry above."}
              </div>
            ) : (
              dailyLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {log.date}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {log.loggedBy}
                      </span>
                      {log.manpowerCount && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          👷 {log.manpowerCount} workers
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.status === "Completed"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : log.status === "In Progress"
                            ? "bg-blue-50 text-blue-800 border-blue-300"
                            : log.status === "Delayed"
                            ? "bg-rose-50 text-rose-800 border-rose-300"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    {(log.stageName || log.workName || log.taskName) && (
                      <p className="text-[11px] text-slate-500">
                        {log.stageName && <span className="font-semibold">{log.stageName}</span>}
                        {log.workName && <span> → {log.workName}</span>}
                        {log.taskName && <span> → {log.taskName}</span>}
                      </p>
                    )}

                    <p className="text-xs text-slate-800 font-medium">{log.summary}</p>
                    {log.remark && (
                      <p className="text-[11px] text-slate-500 italic">Remark: {log.remark}</p>
                    )}
                  </div>

                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDailyLog(log.id)}
                      className="p-1.5 rounded text-rose-500 hover:bg-rose-50 shrink-0 self-start sm:self-center"
                      title="Remove log"
                    >
                      <FaTrash className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* ============================================================
            --- WBS TRACKING (Stage / Work / Task level)
            ============================================================ */}
        <div className="space-y-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <FaLayerGroup className="text-indigo-600 w-4 h-4" />
                <span>WBS Stages, Works & Tasks Execution Tracking</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {totalStagesCount} Stages • {totalWorksCount} Works • {totalTasksCount} Tasks
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Update task status, contractor, deadline, and remark. Changes reflect in progress.
              </p>
            </div>
          </div>

          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-slate-50 focus:bg-white"
            />
            {taskSearch && (
              <button
                type="button"
                onClick={() => setTaskSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="space-y-3 pt-1">
            {filteredStages.length === 0 ? (
              <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <FaCheckCircle className="w-7 h-7 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No stages found.</p>
              </div>
            ) : (
              filteredStages.map((stage, sIdx) => {
                const isExpanded = !!expandedStages[stage.stageId];
                const sWorks = stage.works || [];
                const sTaskCount = sWorks.reduce((sum, w) => sum + (w.tasks || []).length, 0);
                const sCompletedTasks = sWorks.reduce(
                  (sum, w) => sum + (w.tasks || []).filter((t) => t.status === "Completed").length,
                  0
                );
                const sPercent =
                  sTaskCount > 0 ? Math.round((sCompletedTasks / sTaskCount) * 100) : 0;

                const cleanStageCode = isObjectId(stage.stageId) ? `S${sIdx + 1}` : stage.stageId;
                const cleanStageName =
                  isObjectId(stage.stageName) || (stage.stageName || "").startsWith("Stage 6a")
                    ? `STAGE ${cleanStageCode}`
                    : stage.stageName;

                return (
                  <div
                    key={stage.stageId || sIdx}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs"
                  >
                    <div
                      onClick={() => toggleStage(stage.stageId)}
                      className="px-4 py-3 bg-slate-50 hover:bg-slate-100/80 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none border-b border-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="px-2.5 py-0.5 rounded text-xs font-black bg-indigo-600 text-white shrink-0">
                          {cleanStageCode}
                        </span>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                          {cleanStageName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-slate-700 border border-slate-200 whitespace-nowrap">
                          {sWorks.length} W • {sTaskCount} T
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap ${
                            sPercent === 100
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : sPercent > 0
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {sCompletedTasks}/{sTaskCount} ({sPercent}%)
                        </span>
                        <div className="p-1 text-slate-400">
                          {isExpanded ? (
                            <FaChevronUp className="w-3 h-3" />
                          ) : (
                            <FaChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-3 sm:p-4 space-y-4 bg-slate-50/40">
                        {sWorks.length === 0 ? (
                          <p className="text-xs text-slate-400 italic py-2">No work packages.</p>
                        ) : (
                          sWorks.map((work, wIdx) => {
                            const wTasks = work.tasks || [];
                            const cleanWorkCode = isObjectId(work.workId)
                              ? `${cleanStageCode}-W${wIdx + 1}`
                              : work.workId;
                            const cleanWorkName =
                              isObjectId(work.workName) || (work.workName || "").startsWith("6a")
                                ? `Work Package ${cleanWorkCode}`
                                : work.workName;

                            return (
                              <div
                                key={work.workId || wIdx}
                                className="bg-white border border-slate-200 rounded-lg p-3 sm:p-3.5 shadow-2xs space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 flex-wrap">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                      {cleanWorkCode}
                                    </span>
                                    <h5 className="text-xs font-black text-slate-800 truncate">
                                      {cleanWorkName}
                                    </h5>
                                  </div>
                                  <span className="text-[11px] font-bold text-slate-500">
                                    {wTasks.length} Tasks
                                  </span>
                                </div>

                                <div className="space-y-2.5 pt-1">
                                  {wTasks.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-1">
                                      No tasks.
                                    </p>
                                  ) : (
                                    wTasks.map((task, tIdx) => {
                                      const cleanTaskCode = isObjectId(task.taskId)
                                        ? `${cleanWorkCode}-T${tIdx + 1}`
                                        : task.taskId;
                                      const cleanTaskName =
                                        isObjectId(task.taskName) ||
                                        (task.taskName || "").startsWith("6a")
                                          ? `Execution Task ${cleanTaskCode}`
                                          : task.taskName;

                                      const taskStatus = task.status || "Not Started";

                                      return (
                                        <div
                                          key={task.taskId || tIdx}
                                          className="p-3 rounded-lg border border-slate-200 bg-white space-y-2.5 text-xs"
                                        >
                                          <div className="flex items-start gap-2 flex-1 min-w-0">
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 mt-0.5">
                                              {cleanTaskCode}
                                            </span>
                                            <div className="min-w-0">
                                              <p className="font-bold text-slate-900 leading-snug">
                                                {cleanTaskName}
                                              </p>
                                              {task.instruction && (
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                  {task.instruction}
                                                </p>
                                              )}
                                            </div>
                                          </div>

                                          <div className="pt-2 border-t border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 bg-slate-50/70 p-2 rounded-md">
                                            <div className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1.5 shrink-0">
                                              <FaClipboardList className="text-indigo-600 text-xs" />
                                              <span>Tracking:</span>
                                            </div>

                                            {isReadOnly ? (
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <span
                                                  className={`px-2.5 py-1 rounded-md border text-xs font-bold ${
                                                    taskStatus === "Completed"
                                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                                      : taskStatus === "In Progress"
                                                      ? "bg-blue-50 text-blue-800 border-blue-300"
                                                      : "bg-slate-100 text-slate-700 border-slate-200"
                                                  }`}
                                                >
                                                  {taskStatus}
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                  {task.assignedContractor || "—"}
                                                </span>
                                                <span className="text-xs font-mono text-slate-600">
                                                  {task.deadlineDate || "—"}
                                                </span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                                  {task.remark || "—"}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2 flex-wrap">
                                                <select
                                                  value={taskStatus}
                                                  onChange={(e) =>
                                                    handleTaskFieldChange(
                                                      stage.stageId,
                                                      work.workId,
                                                      task.taskId,
                                                      "status",
                                                      e.target.value
                                                    )
                                                  }
                                                  className={`px-2.5 py-1 rounded-md border text-xs font-bold cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                                                    taskStatus === "Completed"
                                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                                      : taskStatus === "In Progress"
                                                      ? "bg-blue-50 text-blue-800 border-blue-300"
                                                      : "bg-white text-slate-700 border-slate-200"
                                                  }`}
                                                >
                                                  <option value="Not Started">Not Started</option>
                                                  <option value="In Progress">In Progress</option>
                                                  <option value="Completed">Completed</option>
                                                  <option value="Delayed">Delayed</option>
                                                  <option value="On Hold">On Hold</option>
                                                </select>

                                                <select
                                                  value={
                                                    task.assignedContractor ||
                                                    task.workWillDoneBy ||
                                                    ""
                                                  }
                                                  onChange={(e) =>
                                                    handleTaskFieldChange(
                                                      stage.stageId,
                                                      work.workId,
                                                      task.taskId,
                                                      "assignedContractor",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="px-2 py-1 rounded-md border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 truncate min-w-[140px]"
                                                >
                                                  <option value="">Contractor</option>
                                                  {contractorsList.map((c) => (
                                                    <option key={c} value={c}>
                                                      {c}
                                                    </option>
                                                  ))}
                                                </select>

                                                <input
                                                  type="date"
                                                  value={task.deadlineDate || ""}
                                                  onChange={(e) =>
                                                    handleTaskFieldChange(
                                                      stage.stageId,
                                                      work.workId,
                                                      task.taskId,
                                                      "deadlineDate",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="px-2 py-1 rounded-md border border-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                />

                                                <input
                                                  type="text"
                                                  placeholder="Remark..."
                                                  value={task.remark || ""}
                                                  onChange={(e) =>
                                                    handleTaskFieldChange(
                                                      stage.stageId,
                                                      work.workId,
                                                      task.taskId,
                                                      "remark",
                                                      e.target.value
                                                    )
                                                  }
                                                  className="px-2 py-1 rounded-md border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 min-w-[160px]"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* --- BOTTOM ACTIONS --- */}
        <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Progress:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              {completedTasksCount} / {totalTasksCount} ({progressPercent}%)
            </span>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/sales/active-projects")}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAll}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingAll ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-3.5 h-3.5" />
                    <span>Save Project Execution</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ActiveProjectExecutionComponent;