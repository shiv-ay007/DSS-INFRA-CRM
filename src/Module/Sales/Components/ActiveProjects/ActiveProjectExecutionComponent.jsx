import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaLock,
  FaSave,
  FaSpinner,
  FaLayerGroup,
  FaTasks,
  FaHammer,
  FaCommentDots,
  FaEdit
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
import activeProjectService, {
  isObjectId,
  mapPmsStagesToExecutionStages
} from "../../services/activeProjectService";
import { getAllLeadProjectsApi, updateLeadProjectApi } from "../../services/leadProject.api";
import pmsTemplateService from "../../services/pmsTemplateService";
import { pmsWbsService } from "../../services/pmsWbsService";
import { ReactSelectMulti } from "../Master/PmsTemplate/ReactSelectMulti";

const DEFAULT_PROJECT_STATUSES = [
  "On Track",
  "In Progress",
  "Delayed",
  "On Hold",
  "Completed",
  "Closed"
];

const ActiveProjectExecutionComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "view";
  const { role, isObserver, user } = useAuth();
  const currentRole = role || user?.role || "";
  const isViewerOnly = isObserver || String(currentRole).toLowerCase().trim() === "observer";

  const isEditMode = mode === "edit" && !isViewerOnly;
  const isReadOnly = !isEditMode;

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingAll, setSavingAll] = useState(false);
  const [matchedTemplate, setMatchedTemplate] = useState(null);

  // Status options loaded from matched PMS template / master
  const [pmsStatusOptions, setPmsStatusOptions] = useState(DEFAULT_PROJECT_STATUSES);

  // WBS stages data
  const [stagesData, setStagesData] = useState([]);

  // Form State: strictly following user requirements
  const [trackingForm, setTrackingForm] = useState({
    projectStatus: "On Track",
    completedStageIds: [],
    runningStageId: "",
    completedWorkIds: [],
    runningWorkId: "",
    completedTaskIds: [],
    runningTaskId: "",
    completedSubtaskIds: [],
    runningSubtaskId: "",
    finalTrackingRemark: ""
  });

  // ============================================================
  // LOAD PROJECT + PMS TEMPLATE SYNC
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

      // Find matching PMS Template created for this project / lead / client
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

      // Extract Project Statuses chosen during PMS template creation
      let extractedStatuses = [];
      if (directTmpl && directTmpl.projectStatus) {
        const rawSt = directTmpl.projectStatus;
        if (Array.isArray(rawSt)) {
          extractedStatuses = rawSt
            .map((s) => (typeof s === "object" ? s.status_name || s.name || s.value : String(s)))
            .filter(Boolean);
        } else if (typeof rawSt === "string" && rawSt.trim()) {
          extractedStatuses = rawSt.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }

      if (extractedStatuses.length === 0) {
        if (Array.isArray(wbsData?.project_status) && wbsData.project_status.length > 0) {
          extractedStatuses = wbsData.project_status
            .map((s) => (typeof s === "object" ? s.status_name || s.name : String(s)))
            .filter(Boolean);
        } else {
          extractedStatuses = DEFAULT_PROJECT_STATUSES;
        }
      }

      // Deduplicate statuses
      extractedStatuses = Array.from(new Set(extractedStatuses));
      setPmsStatusOptions(extractedStatuses);

      // Sync stages from PMS template if needed
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

      setMatchedTemplate(directTmpl || null);
      setProject(data);
      const stgs = data.stages || [];
      setStagesData(stgs);

      // Check if backend pms_templates has executionTracking records
      const trackingList = Array.isArray(directTmpl?.executionTracking)
        ? directTmpl.executionTracking
        : [];
      const latestTracking =
        trackingList.length > 0 ? trackingList[trackingList.length - 1] : null;

      // Restore form tracking states (prefer backend executionTracking from pms_templates)
      const savedCompletedStages =
        Array.isArray(latestTracking?.completedStageIds)
          ? latestTracking.completedStageIds
          : Array.isArray(data.completedStageIds)
          ? data.completedStageIds
          : stgs.filter((s) => s.status === "Completed").map((s) => s.stageId);

      const savedRunningStage =
        latestTracking?.runningStageId ||
        data.runningStageId ||
        stgs.find((s) => s.status === "In Progress")?.stageId ||
        stgs.find((s) => !savedCompletedStages.includes(s.stageId))?.stageId ||
        stgs[0]?.stageId ||
        "";

      const currentStageObj = stgs.find((s) => s.stageId === savedRunningStage);
      const currentStageWorks = currentStageObj?.works || [];

      const savedCompletedWorks =
        Array.isArray(latestTracking?.completedWorkIds)
          ? latestTracking.completedWorkIds
          : Array.isArray(data.completedWorkIds)
          ? data.completedWorkIds
          : currentStageWorks.filter((w) => w.status === "Completed").map((w) => w.workId);

      const savedRunningWork =
        latestTracking?.runningWorkId ||
        data.runningWorkId ||
        currentStageWorks.find((w) => w.status === "In Progress")?.workId ||
        currentStageWorks.find((w) => !savedCompletedWorks.includes(w.workId))?.workId ||
        currentStageWorks[0]?.workId ||
        "";

      const currentWorkObj = currentStageWorks.find((w) => w.workId === savedRunningWork);
      const currentWorkTasks = currentWorkObj?.tasks || [];

      const savedCompletedTasks =
        Array.isArray(latestTracking?.completedTaskIds)
          ? latestTracking.completedTaskIds
          : Array.isArray(data.completedTaskIds)
          ? data.completedTaskIds
          : currentWorkTasks.filter((t) => t.status === "Completed").map((t) => t.taskId);

      const savedRunningTask =
        latestTracking?.runningTaskId ||
        data.runningTaskId ||
        currentWorkTasks.find((t) => t.status === "In Progress")?.taskId ||
        currentWorkTasks.find((t) => !savedCompletedTasks.includes(t.taskId))?.taskId ||
        currentWorkTasks[0]?.taskId ||
        "";

      const currentTaskObj = currentWorkTasks.find((t) => t.taskId === savedRunningTask);
      const currentTaskSubtasks = currentTaskObj?.subtasks || [];

      const savedCompletedSubtasks =
        Array.isArray(latestTracking?.completedSubtaskIds)
          ? latestTracking.completedSubtaskIds
          : Array.isArray(data.completedSubtaskIds)
          ? data.completedSubtaskIds
          : currentTaskSubtasks.filter((st) => st.status === "Completed").map((st) => st.subtaskId);

      const savedRunningSubtask =
        latestTracking?.runningSubtaskId ||
        data.runningSubtaskId ||
        currentTaskSubtasks.find((st) => st.status === "In Progress")?.subtaskId ||
        currentTaskSubtasks.find((st) => !savedCompletedSubtasks.includes(st.subtaskId))?.subtaskId ||
        currentTaskSubtasks[0]?.subtaskId ||
        "";

      setTrackingForm({
        projectStatus:
          latestTracking?.projectStatus ||
          data.projectStatus ||
          extractedStatuses[0] ||
          "On Track",
        completedStageIds: savedCompletedStages,
        runningStageId: savedRunningStage,
        completedWorkIds: savedCompletedWorks,
        runningWorkId: savedRunningWork,
        completedTaskIds: savedCompletedTasks,
        runningTaskId: savedRunningTask,
        completedSubtaskIds: savedCompletedSubtasks,
        runningSubtaskId: savedRunningSubtask,
        finalTrackingRemark:
          latestTracking?.finalTrackingRemark ||
          data.finalTrackingRemark ||
          data.overallRemark ||
          ""
      });
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

  // ============================================================
  // CASCADING DERIVED OPTIONS & LOCKING COMPLETED ITEMS
  // ============================================================
  // Stages that are already completed in previous tracking / database
  const lockedStageIds = useMemo(() => {
    const locked = new Set();
    (stagesData || []).forEach((s) => {
      if (s.status === "Completed") locked.add(s.stageId);
    });
    const trackingList = Array.isArray(matchedTemplate?.executionTracking)
      ? matchedTemplate.executionTracking
      : [];
    trackingList.forEach((t) => {
      (t.completedStageIds || []).forEach((sId) => locked.add(sId));
    });
    return Array.from(locked);
  }, [stagesData, matchedTemplate]);

  const stageOptions = useMemo(() => {
    const lockedSet = new Set(lockedStageIds);
    return stagesData.map((s, idx) => {
      const cleanCode = isObjectId(s.stageId) ? `S${idx + 1}` : s.stageId;
      const cleanName =
        isObjectId(s.stageName) || (s.stageName || "").startsWith("Stage 6a")
          ? `STAGE ${cleanCode}`
          : s.stageName;
      const isLocked = lockedSet.has(s.stageId);
      return {
        value: s.stageId,
        label: isLocked ? `${cleanCode} - ${cleanName} (Completed)` : `${cleanCode} - ${cleanName}`,
        isDisabled: isLocked,
        isFixed: isLocked
      };
    });
  }, [stagesData, lockedStageIds]);

  // Selected Running Stage Object
  const selectedRunningStageObj = useMemo(() => {
    return stagesData.find((s) => s.stageId === trackingForm.runningStageId) || null;
  }, [stagesData, trackingForm.runningStageId]);

  // Works that are already completed in previous tracking
  const lockedWorkIds = useMemo(() => {
    const locked = new Set();
    if (selectedRunningStageObj) {
      (selectedRunningStageObj.works || []).forEach((w) => {
        if (w.status === "Completed") locked.add(w.workId);
      });
    }
    const trackingList = Array.isArray(matchedTemplate?.executionTracking)
      ? matchedTemplate.executionTracking
      : [];
    trackingList.forEach((t) => {
      (t.completedWorkIds || []).forEach((wId) => locked.add(wId));
    });
    return Array.from(locked);
  }, [selectedRunningStageObj, matchedTemplate]);

  // Works under Running Stage
  const workOptions = useMemo(() => {
    if (!selectedRunningStageObj) return [];
    const lockedSet = new Set(lockedWorkIds);
    return (selectedRunningStageObj.works || []).map((w, idx) => {
      const cleanCode = isObjectId(w.workId)
        ? `${selectedRunningStageObj.stageId || "S"}-W${idx + 1}`
        : w.workId;
      const cleanName =
        isObjectId(w.workName) || (w.workName || "").startsWith("6a")
          ? `Work Package ${cleanCode}`
          : w.workName;
      const isLocked = lockedSet.has(w.workId);
      return {
        value: w.workId,
        label: isLocked ? `${cleanCode} - ${cleanName} (Completed)` : `${cleanCode} - ${cleanName}`,
        isDisabled: isLocked,
        isFixed: isLocked
      };
    });
  }, [selectedRunningStageObj, lockedWorkIds]);

  // Selected Running Work Object
  const selectedRunningWorkObj = useMemo(() => {
    if (!selectedRunningStageObj) return null;
    return (
      (selectedRunningStageObj.works || []).find((w) => w.workId === trackingForm.runningWorkId) ||
      null
    );
  }, [selectedRunningStageObj, trackingForm.runningWorkId]);

  // Tasks that are already completed in previous tracking
  const lockedTaskIds = useMemo(() => {
    const locked = new Set();
    if (selectedRunningWorkObj) {
      (selectedRunningWorkObj.tasks || []).forEach((t) => {
        if (t.status === "Completed") locked.add(t.taskId);
      });
    }
    const trackingList = Array.isArray(matchedTemplate?.executionTracking)
      ? matchedTemplate.executionTracking
      : [];
    trackingList.forEach((t) => {
      (t.completedTaskIds || []).forEach((tId) => locked.add(tId));
    });
    return Array.from(locked);
  }, [selectedRunningWorkObj, matchedTemplate]);

  // Tasks under Running Work
  const taskOptions = useMemo(() => {
    if (!selectedRunningWorkObj) return [];
    const lockedSet = new Set(lockedTaskIds);
    return (selectedRunningWorkObj.tasks || []).map((t, idx) => {
      const cleanCode = isObjectId(t.taskId)
        ? `${selectedRunningWorkObj.workId || "W"}-T${idx + 1}`
        : t.taskId;
      const cleanName =
        isObjectId(t.taskName) || (t.taskName || "").startsWith("6a")
          ? `Task ${cleanCode}`
          : t.taskName;
      const isLocked = lockedSet.has(t.taskId);
      return {
        value: t.taskId,
        label: isLocked ? `${cleanCode} - ${cleanName} (Completed)` : `${cleanCode} - ${cleanName}`,
        isDisabled: isLocked,
        isFixed: isLocked
      };
    });
  }, [selectedRunningWorkObj, lockedTaskIds]);

  // Selected Running Task Object
  const selectedRunningTaskObj = useMemo(() => {
    if (!selectedRunningWorkObj) return null;
    return (
      (selectedRunningWorkObj.tasks || []).find((t) => t.taskId === trackingForm.runningTaskId) ||
      null
    );
  }, [selectedRunningWorkObj, trackingForm.runningTaskId]);

  // Subtasks that are already completed in previous tracking
  const lockedSubtaskIds = useMemo(() => {
    const locked = new Set();
    if (selectedRunningTaskObj) {
      (selectedRunningTaskObj.subtasks || []).forEach((st) => {
        if (st.status === "Completed") locked.add(st.subtaskId);
      });
    }
    const trackingList = Array.isArray(matchedTemplate?.executionTracking)
      ? matchedTemplate.executionTracking
      : [];
    trackingList.forEach((t) => {
      (t.completedSubtaskIds || []).forEach((stId) => locked.add(stId));
    });
    return Array.from(locked);
  }, [selectedRunningTaskObj, matchedTemplate]);

  // Subtasks under Running Task
  const subtaskOptions = useMemo(() => {
    if (!selectedRunningTaskObj) return [];
    const lockedSet = new Set(lockedSubtaskIds);
    return (selectedRunningTaskObj.subtasks || []).map((st, idx) => {
      const cleanCode = isObjectId(st.subtaskId)
        ? `${selectedRunningTaskObj.taskId || "T"}-ST${idx + 1}`
        : st.subtaskId;
      const cleanName =
        isObjectId(st.subtaskName) || (st.subtaskName || "").startsWith("6a")
          ? `Subtask ${cleanCode}`
          : st.subtaskName;
      const isLocked = lockedSet.has(st.subtaskId);
      return {
        value: st.subtaskId,
        label: isLocked ? `${cleanCode} - ${cleanName} (Completed)` : `${cleanCode} - ${cleanName}`,
        isDisabled: isLocked,
        isFixed: isLocked
      };
    });
  }, [selectedRunningTaskObj, lockedSubtaskIds]);

  // ============================================================
  // DERIVED PROGRESS STATS
  // ============================================================
  const totalTasksCount = useMemo(
    () =>
      stagesData.reduce(
        (sum, s) => sum + (s.works || []).reduce((wSum, w) => wSum + (w.tasks?.length || 0), 0),
        0
      ),
    [stagesData]
  );

  const completedTasksCount = useMemo(() => {
    const completedStageSet = new Set(trackingForm.completedStageIds || []);
    const completedWorkSet = new Set(trackingForm.completedWorkIds || []);
    const completedTaskSet = new Set(trackingForm.completedTaskIds || []);

    return stagesData.reduce((sum, s) => {
      const isStageDone = completedStageSet.has(s.stageId) || s.status === "Completed";
      return (
        sum +
        (s.works || []).reduce((wSum, w) => {
          const isWorkDone = isStageDone || completedWorkSet.has(w.workId) || w.status === "Completed";
          return (
            wSum +
            (w.tasks || []).filter(
              (t) => isWorkDone || completedTaskSet.has(t.taskId) || t.status === "Completed"
            ).length
          );
        }, 0)
      );
    }, 0);
  }, [
    stagesData,
    trackingForm.completedStageIds,
    trackingForm.completedWorkIds,
    trackingForm.completedTaskIds
  ]);

  const totalSubtasksCount = useMemo(
    () =>
      stagesData.reduce(
        (sum, s) =>
          sum +
          (s.works || []).reduce(
            (wSum, w) =>
              wSum + (w.tasks || []).reduce((tSum, t) => tSum + (t.subtasks?.length || 0), 0),
            0
          ),
        0
      ),
    [stagesData]
  );

  const completedSubtasksCount = useMemo(() => {
    const completedStageSet = new Set(trackingForm.completedStageIds || []);
    const completedWorkSet = new Set(trackingForm.completedWorkIds || []);
    const completedTaskSet = new Set(trackingForm.completedTaskIds || []);
    const completedSubtaskSet = new Set(trackingForm.completedSubtaskIds || []);

    return stagesData.reduce((sum, s) => {
      const isStageDone = completedStageSet.has(s.stageId) || s.status === "Completed";
      return (
        sum +
        (s.works || []).reduce((wSum, w) => {
          const isWorkDone = isStageDone || completedWorkSet.has(w.workId) || w.status === "Completed";
          return (
            wSum +
            (w.tasks || []).reduce((tSum, t) => {
              const isTaskDone = isWorkDone || completedTaskSet.has(t.taskId) || t.status === "Completed";
              return (
                tSum +
                (t.subtasks || []).filter(
                  (st) => isTaskDone || completedSubtaskSet.has(st.subtaskId) || st.status === "Completed"
                ).length
              );
            }, 0)
          );
        }, 0)
      );
    }, 0);
  }, [
    stagesData,
    trackingForm.completedStageIds,
    trackingForm.completedWorkIds,
    trackingForm.completedTaskIds,
    trackingForm.completedSubtaskIds
  ]);

  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Helpers to resolve human-friendly clean labels for view mode
  const getStageLabel = (stageId) => {
    if (!stageId) return "";
    const opt = stageOptions.find((o) => o.value === stageId);
    if (opt) return opt.label.replace(/\s*\(Completed\)$/, "");
    const stg = stagesData.find((s) => s.stageId === stageId);
    if (stg) return stg.stageName || stg.stageId;
    return stageId;
  };

  const getWorkLabel = (workId) => {
    if (!workId) return "";
    const opt = workOptions.find((o) => o.value === workId);
    if (opt) return opt.label.replace(/\s*\(Completed\)$/, "");
    for (const s of stagesData) {
      const idx = (s.works || []).findIndex((w) => w.workId === workId);
      if (idx !== -1) {
        const w = s.works[idx];
        const cleanCode = isObjectId(w.workId) ? `${s.stageId || "S"}-W${idx + 1}` : w.workId;
        const cleanName =
          isObjectId(w.workName) || (w.workName || "").startsWith("6a")
            ? `Work Package ${cleanCode}`
            : w.workName;
        return `${cleanCode} - ${cleanName}`;
      }
    }
    return workId;
  };

  const getTaskLabel = (taskId) => {
    if (!taskId) return "";
    const opt = taskOptions.find((o) => o.value === taskId);
    if (opt) return opt.label.replace(/\s*\(Completed\)$/, "");
    for (const s of stagesData) {
      for (const w of s.works || []) {
        const idx = (w.tasks || []).findIndex((t) => t.taskId === taskId);
        if (idx !== -1) {
          const t = w.tasks[idx];
          const cleanCode = isObjectId(t.taskId) ? `${w.workId || "W"}-T${idx + 1}` : t.taskId;
          const cleanName =
            isObjectId(t.taskName) || (t.taskName || "").startsWith("6a")
              ? `Task ${cleanCode}`
              : t.taskName;
          return `${cleanCode} - ${cleanName}`;
        }
      }
    }
    return taskId;
  };

  const getSubtaskLabel = (subtaskId) => {
    if (!subtaskId) return "";
    const opt = subtaskOptions.find((o) => o.value === subtaskId);
    if (opt) return opt.label.replace(/\s*\(Completed\)$/, "");
    for (const s of stagesData) {
      for (const w of s.works || []) {
        for (const t of w.tasks || []) {
          const idx = (t.subtasks || []).findIndex((st) => st.subtaskId === subtaskId);
          if (idx !== -1) {
            const st = t.subtasks[idx];
            const cleanCode = isObjectId(st.subtaskId) ? `${t.taskId || "T"}-ST${idx + 1}` : st.subtaskId;
            const cleanName =
              isObjectId(st.subtaskName) || (st.subtaskName || "").startsWith("6a")
                ? `Subtask ${cleanCode}`
                : st.subtaskName;
            return `${cleanCode} - ${cleanName}`;
          }
        }
      }
    }
    return subtaskId;
  };

  // ============================================================
  // SAVE FORM
  // ============================================================
  const handleSaveAll = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isReadOnly) {
      toast.warn("View-Only mode: Cannot modify.");
      return;
    }

    setSavingAll(true);
    try {
      const completedStageSet = new Set(trackingForm.completedStageIds || []);
      const completedWorkSet = new Set(trackingForm.completedWorkIds || []);
      const completedTaskSet = new Set(trackingForm.completedTaskIds || []);
      const completedSubtaskSet = new Set(trackingForm.completedSubtaskIds || []);

      // Synchronize statuses across stages, works, tasks, and subtasks based on DDL selections
      const updatedStages = stagesData.map((stg) => {
        const isStageCompleted = completedStageSet.has(stg.stageId);
        const isStageRunning = stg.stageId === trackingForm.runningStageId;

        const updatedWorks = (stg.works || []).map((w) => {
          const isWorkCompleted = isStageCompleted || completedWorkSet.has(w.workId);
          const isWorkRunning = isStageRunning && w.workId === trackingForm.runningWorkId;

          const updatedTasks = (w.tasks || []).map((t) => {
            const isTaskCompleted = isWorkCompleted || completedTaskSet.has(t.taskId);
            const isTaskRunning = isWorkRunning && t.taskId === trackingForm.runningTaskId;

            const updatedSubtasks = (t.subtasks || []).map((st) => {
              let stStatus = st.status || "Not Started";
              if (isTaskCompleted || completedSubtaskSet.has(st.subtaskId)) {
                stStatus = "Completed";
              } else if (isTaskRunning && st.subtaskId === trackingForm.runningSubtaskId) {
                stStatus = "In Progress";
              }
              return {
                ...st,
                status: stStatus
              };
            });

            let taskStatus = t.status || "Not Started";
            if (isTaskCompleted) {
              taskStatus = "Completed";
            } else if (isTaskRunning) {
              taskStatus = "In Progress";
            } else if (
              updatedSubtasks.length > 0 &&
              updatedSubtasks.every((st) => st.status === "Completed")
            ) {
              taskStatus = "Completed";
            } else if (
              updatedSubtasks.some((st) => st.status === "In Progress" || st.status === "Completed")
            ) {
              taskStatus = "In Progress";
            }

            return {
              ...t,
              status: taskStatus,
              subtasks: updatedSubtasks
            };
          });

          let workStatus = "Not Started";
          if (isWorkCompleted) {
            workStatus = "Completed";
          } else if (isWorkRunning) {
            workStatus = "In Progress";
          } else if (
            updatedTasks.some((t) => t.status === "In Progress" || t.status === "Completed")
          ) {
            workStatus = "In Progress";
          }

          return {
            ...w,
            status: workStatus,
            tasks: updatedTasks
          };
        });

        let stageStatus = "Not Started";
        if (isStageCompleted) {
          stageStatus = "Completed";
        } else if (isStageRunning) {
          stageStatus = "In Progress";
        } else if (
          updatedWorks.some((w) => w.status === "In Progress" || w.status === "Completed")
        ) {
          stageStatus = "In Progress";
        }

        return {
          ...stg,
          status: stageStatus,
          works: updatedWorks
        };
      });

      // 1. Prepare Backend Tracking Payload (for pms_templates collection)
      const trackingPayload = {
        projectStatus: trackingForm.projectStatus,
        completedStageIds: trackingForm.completedStageIds,
        runningStageId: trackingForm.runningStageId,
        completedWorkIds: trackingForm.completedWorkIds,
        runningWorkId: trackingForm.runningWorkId,
        completedTaskIds: trackingForm.completedTaskIds,
        runningTaskId: trackingForm.runningTaskId,
        completedSubtaskIds: trackingForm.completedSubtaskIds,
        runningSubtaskId: trackingForm.runningSubtaskId,
        finalTrackingRemark: trackingForm.finalTrackingRemark,
        progressPercent,
        completedTasksCount,
        totalTasksCount,
        completedSubtasksCount,
        totalSubtasksCount,
        leadId: project?.leadId,
        projectId: project?.projectId || project?.id,
        stages: updatedStages
      };

      // 2. Persist to MongoDB pms_templates collection
      const targetTemplateOrProjectId = matchedTemplate?._id || project?.projectId || id;
      try {
        const res = await pmsTemplateService.saveExecutionTracking(
          targetTemplateOrProjectId,
          trackingPayload
        );
        if (res?.data?.data) {
          setMatchedTemplate(res.data.data);
        }
      } catch (apiErr) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("Backend pms_templates save note:", apiErr);
        }
      }

      // 3. Ensure LeadProject status is ACTIVE_PROJECT in MongoDB
      if (project?.projectId || project?.id) {
        try {
          await updateLeadProjectApi(project.projectId || project.id, {
            status: "ACTIVE_PROJECT",
            inSalesManagement: true,
            isSalesTransferred: true
          });
        } catch (dbErr) {
          if (process.env.NODE_ENV !== "production") {
            console.warn("Backend LeadProject status note:", dbErr);
          }
        }
      }

      // 3. Keep local cache updated for immediate UI sync
      const updated = activeProjectService.saveFullProject(id, {
        projectStatus: trackingForm.projectStatus,
        overallRemark: trackingForm.finalTrackingRemark,
        finalTrackingRemark: trackingForm.finalTrackingRemark,
        completedStageIds: trackingForm.completedStageIds,
        runningStageId: trackingForm.runningStageId,
        completedWorkIds: trackingForm.completedWorkIds,
        runningWorkId: trackingForm.runningWorkId,
        completedTaskIds: trackingForm.completedTaskIds,
        runningTaskId: trackingForm.runningTaskId,
        completedSubtaskIds: trackingForm.completedSubtaskIds,
        runningSubtaskId: trackingForm.runningSubtaskId,
        stages: updatedStages
      });

      if (updated) {
        setProject(updated);
        setStagesData(updated.stages || []);
        toast.success("Project tracking execution saved successfully! 🎯");
      } else {
        toast.error("Could not save. Record not found.");
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error(err);
      toast.error("Failed to save project execution.");
    } finally {
      setSavingAll(false);
    }
  };

  if (loading || !project) {
    return (
      <div className="py-24 text-center text-slate-400 font-sans">
        <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Loading project details...</p>
      </div>
    );
  }

  const projectStatusBadgeClasses =
    trackingForm.projectStatus === "Completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : trackingForm.projectStatus === "In Progress"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : trackingForm.projectStatus === "Delayed"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : trackingForm.projectStatus === "On Hold"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : trackingForm.projectStatus === "Closed"
      ? "bg-slate-100 text-slate-700 border-slate-300"
      : "bg-indigo-50 text-indigo-700 border-indigo-200";

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-20 px-1 sm:px-3">
      {/* ================= 1. HEADER BANNER ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/sales/active-projects")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center shrink-0 mt-0.5"
              title="Back to Active Projects"
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
                  {trackingForm.projectStatus}
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

          {isEditMode ? (
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
          ) : null}
        </div>
      </div>

      {isReadOnly && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-center gap-2">
          <FaLock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>
            <strong>View-Only Mode:</strong> This project execution view is read-only.
          </span>
        </div>
      )}

      {/* ================= 2. EXECUTION FORM ================= */}
      <form
        onSubmit={handleSaveAll}
        className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6"
      >
        {/* --- SECTION 1: CLIENT DETAILS (Preserved) --- */}
        <div>
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <FaBuilding className="text-indigo-600 w-3.5 h-3.5" />
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Client & Project Details
            </h3>
          </div>
          {isReadOnly ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Client Name
                </span>
                <span className="text-xs font-black text-slate-800 break-words">
                  {project.clientName || "—"}
                </span>
              </div>
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Contact
                </span>
                <span className="text-xs font-bold text-slate-700 font-mono">
                  {project.phone || "—"}
                </span>
              </div>
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Project Name
                </span>
                <span className="text-xs font-bold text-slate-800 break-words">
                  {project.projectName || "Site Workflow"}
                </span>
              </div>
              <div className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                  Site Location
                </span>
                <span className="text-xs font-semibold text-slate-700 break-words">
                  {project.address || project.city || "—"}
                </span>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        <hr className="border-slate-200" />

        {/* --- SECTION 2: TRACKING STATUS / EDIT DDLs --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FaLayerGroup className="text-indigo-600 w-4 h-4" />
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                {isReadOnly
                  ? "Execution Tracking Status & Milestones"
                  : "Execution Tracking DDL Hierarchy"}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              {stageOptions.length} Stages Available
            </span>
          </div>

          {isReadOnly ? (
            /* ================= VIEW MODE: CLEAN BADGES & MILESTONES (NO DDLs) ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Project Status */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Project Status
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black border ${projectStatusBadgeClasses}`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {trackingForm.projectStatus}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">(From PMS Blueprint)</span>
                </div>
              </div>

              {/* 2. Stage Complete */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Stage Complete
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
                  {trackingForm.completedStageIds?.length > 0 ? (
                    trackingForm.completedStageIds.map((sId) => (
                      <span
                        key={sId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <FaCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{getStageLabel(sId)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None completed yet</span>
                  )}
                </div>
              </div>

              {/* 3. Running Stage */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Running Stage
                </span>
                <div className="min-h-[34px] flex items-center">
                  {trackingForm.runningStageId ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span>{getStageLabel(trackingForm.runningStageId)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No running stage selected</span>
                  )}
                </div>
              </div>

              {/* 4. Complete Work of Running Stage */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Complete Work of Running Stage
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
                  {trackingForm.completedWorkIds?.length > 0 ? (
                    trackingForm.completedWorkIds.map((wId) => (
                      <span
                        key={wId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                      >
                        <FaCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{getWorkLabel(wId)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None completed yet</span>
                  )}
                </div>
              </div>

              {/* 5. Running Work of Running Stage */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Running Work of Running Stage
                </span>
                <div className="min-h-[34px] flex items-center">
                  {trackingForm.runningWorkId ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span>{getWorkLabel(trackingForm.runningWorkId)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No running work selected</span>
                  )}
                </div>
              </div>

              {/* 6. Complete Task of Running Work */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Complete Task of Running Work
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
                  {trackingForm.completedTaskIds?.length > 0 ? (
                    trackingForm.completedTaskIds.map((tId) => (
                      <span
                        key={tId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 break-words"
                      >
                        <FaCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{getTaskLabel(tId)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None completed yet</span>
                  )}
                </div>
              </div>

              {/* 7. Running Task of Running Work */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Running Task of Running Work
                </span>
                <div className="min-h-[34px] flex items-center">
                  {trackingForm.runningTaskId ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 break-words">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span>{getTaskLabel(trackingForm.runningTaskId)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No running task selected</span>
                  )}
                </div>
              </div>

              {/* 8. Complete Subtask of Running Task */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Complete Subtask of Running Task
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
                  {trackingForm.completedSubtaskIds?.length > 0 ? (
                    trackingForm.completedSubtaskIds.map((stId) => (
                      <span
                        key={stId}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 break-words"
                      >
                        <FaCheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{getSubtaskLabel(stId)}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">None completed</span>
                  )}
                </div>
              </div>

              {/* 9. Running Subtask of Running Task */}
              <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5 space-y-2">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Running Subtask of Running Task
                </span>
                <div className="min-h-[34px] flex items-center">
                  {trackingForm.runningSubtaskId ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 break-words">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      <span>{getSubtaskLabel(trackingForm.runningSubtaskId)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No running subtask</span>
                  )}
                </div>
              </div>

              {/* 10. Final Tracking Remark */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3 bg-slate-50/70 border border-slate-200/90 rounded-xl p-3.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FaCommentDots className="text-indigo-500 w-3.5 h-3.5" />
                  <span>Final Tracking Remark</span>
                </div>
                {trackingForm.finalTrackingRemark ? (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-medium">
                    {trackingForm.finalTrackingRemark}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No tracking remarks added yet.</p>
                )}
              </div>
            </div>
          ) : (
            /* ================= EDIT MODE: INTERACTIVE DDLs ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* 1. Project Status (DDL - populated from PMS creation) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Project Status <span className="text-rose-500">*</span>
                  <span className="ml-1 text-[10px] font-normal text-slate-500">
                    (From PMS Blueprint)
                  </span>
                </label>
                <select
                  disabled={isReadOnly}
                  value={trackingForm.projectStatus}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, projectStatus: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  {pmsStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Stage Complete (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Stage Complete
                  <span className="ml-1 text-[10px] font-normal text-emerald-600">
                    ({trackingForm.completedStageIds?.length || 0} completed)
                  </span>
                </label>
                <ReactSelectMulti
                  isDisabled={isReadOnly}
                  placeholder="Select completed stage(s)..."
                  options={stageOptions}
                  value={trackingForm.completedStageIds}
                  onChange={(vals) => {
                    const merged = Array.from(new Set([...lockedStageIds, ...vals]));
                    setTrackingForm((prev) => ({ ...prev, completedStageIds: merged }));
                  }}
                  themeColor="emerald"
                />
              </div>

              {/* 3. Running Stage (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Running Stage <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isReadOnly}
                  value={trackingForm.runningStageId}
                  onChange={(e) => {
                    const newStageId = e.target.value;
                    setTrackingForm((prev) => ({
                      ...prev,
                      runningStageId: newStageId,
                      completedWorkIds: [],
                      runningWorkId: "",
                      completedTaskIds: [],
                      runningTaskId: ""
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  <option value="">-- Select Running Stage --</option>
                  {stageOptions.map((s) => (
                    <option key={s.value} value={s.value} disabled={s.isDisabled}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Complete Work of Running Stage (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Complete Work of Running Stage
                  <span className="ml-1 text-[10px] font-normal text-emerald-600">
                    ({trackingForm.completedWorkIds?.length || 0} completed)
                  </span>
                </label>
                <ReactSelectMulti
                  isDisabled={isReadOnly || !trackingForm.runningStageId}
                  placeholder={
                    !trackingForm.runningStageId
                      ? "Select Running Stage first..."
                      : "Select completed work(s)..."
                  }
                  options={workOptions}
                  value={trackingForm.completedWorkIds}
                  onChange={(vals) => {
                    const merged = Array.from(new Set([...lockedWorkIds, ...vals]));
                    setTrackingForm((prev) => ({ ...prev, completedWorkIds: merged }));
                  }}
                  themeColor="emerald"
                />
              </div>

              {/* 5. Running Work of Running Stage (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Running Work of Running Stage
                </label>
                <select
                  disabled={isReadOnly || !trackingForm.runningStageId}
                  value={trackingForm.runningWorkId}
                  onChange={(e) => {
                    const newWorkId = e.target.value;
                    setTrackingForm((prev) => ({
                      ...prev,
                      runningWorkId: newWorkId,
                      completedTaskIds: [],
                      runningTaskId: ""
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!trackingForm.runningStageId
                      ? "-- Select Running Stage First --"
                      : "-- Select Running Work --"}
                  </option>
                  {workOptions.map((w) => (
                    <option key={w.value} value={w.value} disabled={w.isDisabled}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Complete Task of Running Work (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Complete Task of Running Work
                  <span className="ml-1 text-[10px] font-normal text-emerald-600">
                    ({trackingForm.completedTaskIds?.length || 0} completed)
                  </span>
                </label>
                <ReactSelectMulti
                  isDisabled={isReadOnly || !trackingForm.runningWorkId}
                  placeholder={
                    !trackingForm.runningWorkId
                      ? "Select Running Work first..."
                      : "Select completed task(s)..."
                  }
                  options={taskOptions}
                  value={trackingForm.completedTaskIds}
                  onChange={(vals) => {
                    const merged = Array.from(new Set([...lockedTaskIds, ...vals]));
                    setTrackingForm((prev) => ({ ...prev, completedTaskIds: merged }));
                  }}
                  themeColor="emerald"
                />
              </div>

              {/* 7. Running Task of Running Work (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Running Task of Running Work
                </label>
                <select
                  disabled={isReadOnly || !trackingForm.runningWorkId}
                  value={trackingForm.runningTaskId}
                  onChange={(e) => {
                    const newTaskId = e.target.value;
                    setTrackingForm((prev) => ({
                      ...prev,
                      runningTaskId: newTaskId,
                      completedSubtaskIds: [],
                      runningSubtaskId: ""
                    }));
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!trackingForm.runningWorkId
                      ? "-- Select Running Work First --"
                      : "-- Select Running Task --"}
                  </option>
                  {taskOptions.map((t) => (
                    <option key={t.value} value={t.value} disabled={t.isDisabled}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Complete Subtask of Running Task (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Complete Subtask of Running Task
                  <span className="ml-1 text-[10px] font-normal text-emerald-600">
                    ({trackingForm.completedSubtaskIds?.length || 0} completed)
                  </span>
                </label>
                <ReactSelectMulti
                  isDisabled={isReadOnly || !trackingForm.runningTaskId}
                  placeholder={
                    !trackingForm.runningTaskId
                      ? "Select Running Task first..."
                      : subtaskOptions.length === 0
                      ? "No subtasks defined for this task"
                      : "Select completed subtask(s)..."
                  }
                  options={subtaskOptions}
                  value={trackingForm.completedSubtaskIds}
                  onChange={(vals) => {
                    const merged = Array.from(new Set([...lockedSubtaskIds, ...vals]));
                    setTrackingForm((prev) => ({ ...prev, completedSubtaskIds: merged }));
                  }}
                  themeColor="emerald"
                />
              </div>

              {/* 9. Running Subtask of Running Task (DDL) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Running Subtask of Running Task
                </label>
                <select
                  disabled={
                    isReadOnly || !trackingForm.runningTaskId || subtaskOptions.length === 0
                  }
                  value={trackingForm.runningSubtaskId}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({ ...prev, runningSubtaskId: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!trackingForm.runningTaskId
                      ? "-- Select Running Task First --"
                      : subtaskOptions.length === 0
                      ? "-- No Subtasks Defined --"
                      : "-- Select Running Subtask --"}
                  </option>
                  {subtaskOptions.map((st) => (
                    <option key={st.value} value={st.value} disabled={st.isDisabled}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 10. Final Tracking Remark */}
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700">
                  Final Tracking Remark
                </label>
                <textarea
                  rows={3}
                  disabled={isReadOnly}
                  value={trackingForm.finalTrackingRemark}
                  onChange={(e) =>
                    setTrackingForm((prev) => ({
                      ...prev,
                      finalTrackingRemark: e.target.value
                    }))
                  }
                  placeholder="Enter final site tracking remark, milestone progress or notes..."
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white disabled:bg-slate-50 shadow-2xs"
                />
              </div>
            </div>
          )}
        </div>

        <hr className="border-slate-200" />

        {/* --- BOTTOM ACTIONS & SUMMARY --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-600">Calculated Execution:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                {completedTasksCount} / {totalTasksCount} Tasks ({progressPercent}%)
              </span>
              {totalSubtasksCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-50 text-amber-700 border border-amber-200">
                  {completedSubtasksCount} / {totalSubtasksCount} Subtasks
                </span>
              )}
            </div>
            <div className="w-full sm:w-36 bg-slate-100 rounded-full h-2 border border-slate-200 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {isEditMode && (
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
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