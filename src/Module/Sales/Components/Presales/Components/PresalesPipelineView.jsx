import React, { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaSave,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaBuilding,
  FaUserTie,
  FaPhoneAlt,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaSpinner,
  FaArrowLeft,
  FaTable,
  FaBoxes,
  FaLock
} from "react-icons/fa";
import { toast } from "react-toastify";
import PageHeader from "../../../../../Common/Components/PageHeader";
import PresalesStepper, { PIPELINE_STAGES, isStageApplicable } from "./PresalesStepper";
import SubStageFormRenderer from "./SubStageFormRenderer";
import PresalesDiscussionLog from "./PresalesDiscussionLog";
import SavedStageSummaryCard from "./SavedStageSummaryCard";
import CommentWithMedia from "../../../../../Common/Components/CommentWithMedia";
import { updateLeadProjectApi } from "../../../services/leadProject.api";
import { savePresaleStageApi, getPresaleByProjectIdApi, addPresaleRemarkApi, closePresaleApi } from "../../../services/presale.api";

export const PROJECT_STATUS_OPTIONS = [
  {
    value: "On Track",
    label: "On Track",
    badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold",
    dot: "🟢"
  },
  {
    value: "Hold (By Client)",
    label: "Hold (By Client)",
    badgeClass: "bg-[#4a2e18] text-white font-bold shadow-2xs",
    dot: "🟤"
  },
  {
    value: "Delay (By Company)",
    label: "Delay (By Company)",
    badgeClass: "bg-blue-600 text-white font-bold shadow-2xs",
    dot: "🔵"
  },
  {
    value: "Delay (By Client)",
    label: "Delay (By Client)",
    badgeClass: "bg-purple-700 text-white font-bold shadow-2xs",
    dot: "🟣"
  },
  {
    value: "Hold (By Company)",
    label: "Hold (By Company)",
    badgeClass: "bg-sky-100 text-sky-900 border border-sky-300 font-bold",
    dot: "🌐"
  },
  {
    value: "OUT",
    label: "OUT",
    badgeClass: "bg-rose-700 text-white font-bold shadow-2xs",
    dot: "🔴"
  }
];

export const PROJECT_SUB_STATUS_OPTIONS = [
  { value: "VISIT", label: "VISIT", stageId: 1, badgeClass: "bg-rose-600 text-white font-bold shadow-2xs" },
  { value: "SITE BRIEFING", label: "SITE BRIEFING", stageId: 2, badgeClass: "bg-rose-100 text-rose-800 border border-rose-300 font-bold" },
  { value: "FORMATION = TENTATIVE QUOTATION", label: "FORMATION = TENTATIVE QUOTATION", stageId: 3, badgeClass: "bg-orange-100 text-orange-900 border border-orange-300 font-semibold" },
  { value: "CLIENT ACCEPTANCE = TENTATIVE QUOTATION", label: "CLIENT ACCEPTANCE = TENTATIVE QUOTATION", stageId: 4, badgeClass: "bg-orange-100 text-orange-900 border border-orange-300 font-semibold" },
  { value: "CONCEPT DRAWING = FORMATION & FINALISATION", label: "CONCEPT DRAWING = FORMATION & FINALISATION", stageId: 5, badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-semibold" },
  { value: "BANK QUOTATION = FORMATION & HANDOVER", label: "BANK QUOTATION = FORMATION & HANDOVER", stageId: 6, badgeClass: "bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold" },
  { value: "STRUCTURE WORK = FORMATION", label: "STRUCTURE WORK = FORMATION", stageId: 7, badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold" },
  { value: "FRONT ELEVATION = FORMATION & FINALISATION", label: "FRONT ELEVATION = FORMATION & FINALISATION", stageId: 8, badgeClass: "bg-emerald-200 text-emerald-900 border border-emerald-400 font-semibold" },
  { value: "MATERIAL FINALISATION", label: "MATERIAL FINALISATION", stageId: 9, badgeClass: "bg-sky-100 text-sky-900 border border-sky-300 font-semibold" },
  { value: "FORMATION = FINAL QUOTATION", label: "FORMATION = FINAL QUOTATION", stageId: 10, badgeClass: "bg-teal-100 text-teal-900 border border-teal-300 font-semibold" },
  { value: "CLIENT ACCEPTANCE = FINAL QUOTATION", label: "CLIENT ACCEPTANCE = FINAL QUOTATION", stageId: 10, badgeClass: "bg-cyan-100 text-cyan-900 border border-cyan-300 font-semibold" },
  { value: "CONTRACT FORMATION & ACCEPTANCE", label: "CONTRACT FORMATION & ACCEPTANCE", stageId: 11, badgeClass: "bg-indigo-100 text-indigo-900 border border-indigo-300 font-semibold" }
];

// Helper: Normalize arbitrary business type/scope to valid 3 presale enums
export const normalizeEngagementScope = (scope) => {
  if (!scope || typeof scope !== "string") return "Design + Construction";
  const s = scope.toLowerCase().trim();
  if (s.includes("consult")) return "Consultancy Only";
  if (s.includes("design") && !s.includes("construct")) return "Design Only";
  return "Design + Construction";
};

const PresalesPipelineView = ({
  presale,
  allProjects: passedAllProjects,
  onClose,
  onUpdatePresale,
  readOnly = false,
  currentUser = "Admin"
}) => {
  if (!presale) return null;

  // Resolve all projects associated with this client
  const allProjects = useMemo(() => {
    if (Array.isArray(passedAllProjects) && passedAllProjects.length > 0) return passedAllProjects;
    if (Array.isArray(presale?.allProjects) && presale.allProjects.length > 0) return presale.allProjects;
    return [presale];
  }, [passedAllProjects, presale]);

  // Selected project ID for switching between multiple projects of the same client
  const [selectedProjectId, setSelectedProjectId] = useState(presale.id || presale._id);

  // Sync selected project ID when incoming presale changes
  useEffect(() => {
    if (presale) {
      setSelectedProjectId(presale.id || presale._id);
    }
  }, [presale?.id, presale?._id]);

  // Currently active project document
  const currentProject = useMemo(() => {
    return (
      allProjects.find(
        (p) =>
          (p.id && p.id === selectedProjectId) ||
          (p._id && p._id === selectedProjectId)
      ) || presale
    );
  }, [allProjects, selectedProjectId, presale]);

  // Active Stage in Stepper (defaults to currentProject.currentStageId or 1)
  const [activeStageId, setActiveStageId] = useState(currentProject.currentStageId || 1);
  const [stageFormData, setStageFormData] = useState({});
  const [isSavingStage, setIsSavingStage] = useState(false);

  // Sync active stage when switching projects
  useEffect(() => {
    setActiveStageId(currentProject.currentStageId || 1);
  }, [currentProject?.id, currentProject?._id]);

  // Active Person from project form
  const initialActivePerson =
    currentProject.nextPersonName ||
    currentProject.projectCoordinatorName ||
    currentProject.activePerson ||
    currentProject.assignedTo ||
    currentProject.salesPerson ||
    currentUser ||
    "Admin";

  // Top-Level Editable States
  const [engagementScope, setEngagementScope] = useState(
    normalizeEngagementScope(currentProject.engagementScope || currentProject.businessType)
  );
  const [activePerson, setActivePerson] = useState(initialActivePerson);
  const [projectStatus, setProjectStatus] = useState(currentProject.projectStatus || "On Track");
  const [projectSubStatus, setProjectSubStatus] = useState(currentProject.projectSubStatus || "VISIT");
  const [closureStatus, setClosureStatus] = useState(
    currentProject.closureStatus || (currentProject.status === "CLOSED" ? "Closed — Consultancy Only" : "Open")
  );

  // Presale lifecycle status & stage tracking
  const [presaleStatusState, setPresaleStatusState] = useState(
    currentProject.presaleStatus || (currentProject.status === "CLOSED" ? "Closed" : "In Progress")
  );
  const [closedAtStageState, setClosedAtStageState] = useState(currentProject.closedAtStage || null);

  // Close Confirmation Modal State (with remarks & Cloudinary media)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [selectedClosureOption, setSelectedClosureOption] = useState("Lost — Client Dropped / Budget Mismatch");
  const [closeRemarkText, setCloseRemarkText] = useState("");
  const [closeAttachments, setCloseAttachments] = useState([]);
  const [isSubmittingClose, setIsSubmittingClose] = useState(false);

  // Project-specific stage data map, status map and remarks from Presales collection
  const [stagesDataMap, setStagesDataMap] = useState({});
  const [stagesStatusMap, setStagesStatusMap] = useState({});
  const [currentStageIdState, setCurrentStageIdState] = useState(currentProject.currentStageId || 1);
  const [remarksList, setRemarksList] = useState([]);

  // Fetch presale record whenever the selected project changes
  useEffect(() => {
    let isMounted = true;
    const targetId = currentProject._id || currentProject.id;
    if (!targetId) return;

    // Reset state for new project immediately so no stale data is shown
    setRemarksList([]);
    setStagesDataMap({});
    setStagesStatusMap({});
    setPresaleStatusState(currentProject.presaleStatus || (currentProject.status === "CLOSED" ? "Closed" : "In Progress"));
    setClosedAtStageState(currentProject.closedAtStage || null);

    const fetchPresale = async () => {
      try {
        const res = await getPresaleByProjectIdApi(targetId);
        if (!isMounted) return;

        if (res?.data) {
          const presaleDoc = res.data;
          const fetchedRemarks = (Array.isArray(presaleDoc.remarks) ? presaleDoc.remarks : [])
            .filter((r) => r._id !== "initial-lead-transfer");
          setRemarksList(fetchedRemarks);

          const map = {};
          const statusMap = {};
          if (Array.isArray(presaleDoc.stages)) {
            presaleDoc.stages.forEach((s) => {
              if (s.status) {
                statusMap[s.stageId] = s.status;
              }
              if (s.data && typeof s.data === "object" && Object.keys(s.data).length > 0) {
                map[s.stageId] = s.data;
              }
            });
          }
          setStagesDataMap(map);
          setStagesStatusMap(statusMap);

          if (presaleDoc.presaleStatus) {
            setPresaleStatusState(presaleDoc.presaleStatus);
          }
          if (presaleDoc.closedAtStage) {
            setClosedAtStageState(presaleDoc.closedAtStage);
          }
          if (presaleDoc.closureReason) {
            setClosureStatus(presaleDoc.closureReason);
          }

          if (presaleDoc.projectDetails?.currentStageId) {
            setCurrentStageIdState(presaleDoc.projectDetails.currentStageId);
            setActiveStageId(presaleDoc.projectDetails.currentStageId);
          }
          if (presaleDoc.projectDetails?.engagementScope) {
            setEngagementScope(normalizeEngagementScope(presaleDoc.projectDetails.engagementScope));
          }
          if (presaleDoc.projectDetails?.projectStatus) {
            setProjectStatus(presaleDoc.projectDetails.projectStatus);
          }
          if (presaleDoc.projectDetails?.projectSubStatus) {
            setProjectSubStatus(presaleDoc.projectDetails.projectSubStatus);
          }
        } else {
          setRemarksList([]);
          setStagesDataMap({});
          setStagesStatusMap({});
        }
      } catch (err) {
        console.error("Error fetching presale:", err);
        if (isMounted) {
          setRemarksList([]);
          setStagesDataMap({});
          setStagesStatusMap({});
        }
      }
    };

    fetchPresale();

    return () => {
      isMounted = false;
    };
  }, [currentProject?._id, currentProject?.id]);

  // Keep stage form data in sync whenever stage or stagesDataMap changes
  useEffect(() => {
    const saved = stagesDataMap?.[activeStageId] || currentProject.stagesData?.[activeStageId] || {};
    setStageFormData(saved);
  }, [activeStageId, stagesDataMap, currentProject]);

  // Keep top-level fields synced with incoming currentProject
  useEffect(() => {
    setEngagementScope(
      normalizeEngagementScope(currentProject.engagementScope || currentProject.businessType)
    );
    setActivePerson(
      currentProject.nextPersonName ||
      currentProject.projectCoordinatorName ||
      currentProject.activePerson ||
      currentProject.assignedTo ||
      currentProject.salesPerson ||
      currentUser ||
      "Admin"
    );
    setProjectStatus(currentProject.projectStatus || "On Track");
    setProjectSubStatus(currentProject.projectSubStatus || "VISIT");
    setClosureStatus(
      currentProject.closureStatus ||
        (currentProject.status === "CLOSED" ? "Closed — Consultancy Only" : "Open")
    );
  }, [currentProject, currentUser]);

  // Current selected project status and sub-status objects for display badges
  const currentProjectStatusObj = useMemo(() => {
    return (
      PROJECT_STATUS_OPTIONS.find(
        (s) => s.value.toLowerCase() === String(projectStatus || "").toLowerCase()
      ) || PROJECT_STATUS_OPTIONS[0]
    );
  }, [projectStatus]);

  const currentProjectSubStatusObj = useMemo(() => {
    return (
      PROJECT_SUB_STATUS_OPTIONS.find(
        (s) => s.value.toLowerCase() === String(projectSubStatus || "").toLowerCase()
      ) || PROJECT_SUB_STATUS_OPTIONS[0]
    );
  }, [projectSubStatus]);

  // Configuration for currently active stage
  const activeStageConfig = useMemo(() => {
    return PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];
  }, [activeStageId]);

  const isCurrentStageApplicable = useMemo(() => {
    return isStageApplicable(activeStageId, engagementScope);
  }, [activeStageId, engagementScope]);

  // Switch project handler
  const handleSwitchProject = (targetProj) => {
    const projId = targetProj.id || targetProj._id;
    setSelectedProjectId(projId);
    window.history.replaceState(null, "", `/sales/presales/${projId}`);
    toast.info(`Switched to: ${targetProj.projectName || targetProj.workCategory || "Project"}`);
  };

  // Synchronize stageFormData with active stage's saved data
  useEffect(() => {
    const existing =
      stagesDataMap?.[activeStageId] ||
      currentProject.stagesData?.[activeStageId] ||
      {};
    setStageFormData({ ...existing });
  }, [activeStageId, stagesDataMap, currentProject.stagesData]);

  // --------------------------------------------------------------------------
  // Check if Active Stage is Saved / Completed (Locks re-filling and shows view below)
  // --------------------------------------------------------------------------
  const isCurrentStageSaved = useMemo(() => {
    if (stagesStatusMap?.[activeStageId] === "completed") return true;
    const saved = stagesDataMap?.[activeStageId] || currentProject.stagesData?.[activeStageId];
    if (!saved) return false;
    return Object.entries(saved).some(([k, v]) => {
      if (k === "_id" || k === "id") return false;
      if (Array.isArray(v)) return v.length > 0;
      return v !== null && v !== undefined && String(v).trim() !== "";
    });
  }, [stagesStatusMap, stagesDataMap, activeStageId, currentProject.stagesData]);

  const isProjectClosed = useMemo(() => {
    return (
      presaleStatusState === "Closed" ||
      currentProject.status === "CLOSED" ||
      currentProject.presaleStatus === "Closed" ||
      Boolean(closureStatus && closureStatus !== "Open")
    );
  }, [presaleStatusState, currentProject.status, currentProject.presaleStatus, closureStatus]);

  const effectiveClosedAtStage = useMemo(() => {
    return (
      closedAtStageState ||
      currentProject.closedAtStage ||
      currentStageIdState ||
      activeStageId ||
      1
    );
  }, [closedAtStageState, currentProject.closedAtStage, currentStageIdState, activeStageId]);

  // If project is closed and viewing a stage higher than closedAtStage, clamp to closed stage
  useEffect(() => {
    if (isProjectClosed && effectiveClosedAtStage && activeStageId > Number(effectiveClosedAtStage)) {
      setActiveStageId(Number(effectiveClosedAtStage));
    }
  }, [isProjectClosed, effectiveClosedAtStage, activeStageId]);

  // Lock inputs if global readOnly, project is closed, or current stage is already saved
  const isStageLocked = readOnly || isProjectClosed || isCurrentStageSaved;

  // --------------------------------------------------------------------------
  // Rule Check: Move to Active Project
  // STRICT RULE: Enabled ONLY IF scope === "Design + Construction" AND Stage 11 Contract Signed Date is present
  // --------------------------------------------------------------------------
  const isMoveToActiveEnabled = useMemo(() => {
    if (readOnly) return false;
    if (engagementScope !== "Design + Construction") return false;
    const stage11 = currentProject.stagesData?.[11] || (activeStageId === 11 ? stageFormData : null);
    return Boolean(stage11 && stage11.finalContractSignDate && stage11.finalContractSignDate.trim() !== "");
  }, [currentProject, engagementScope, activeStageId, stageFormData, readOnly]);

  // Handle Engagement Scope Change (Section 2: Upgradeable anytime)
  const handleScopeChange = async (newScope) => {
    if (readOnly) return;
    const normalized = normalizeEngagementScope(newScope);
    setEngagementScope(normalized);
    const updated = {
      ...currentProject,
      engagementScope: normalized,
      businessType: normalized
    };
    onUpdatePresale?.(updated);

    try {
      const targetId = currentProject._id || currentProject.id;
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          engagementScope: normalized,
          businessType: normalized
        });
      }
      toast.info(`Engagement Scope updated to "${normalized}"!`);
    } catch (err) {
      console.error("Error updating scope:", err);
      toast.error("Failed to update engagement scope on server");
    }
  };

  // Handle Active Person Change
  const handleActivePersonChange = async (person) => {
    if (readOnly) return;
    setActivePerson(person);
    const updated = {
      ...currentProject,
      activePerson: person,
      nextPersonName: person,
      projectCoordinatorName: person,
      assignedTo: person
    };
    onUpdatePresale?.(updated);

    try {
      const targetId = currentProject._id || currentProject.id;
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          activePerson: person,
          nextPersonName: person,
          projectCoordinatorName: person,
          assignedTo: person
        });
      }
      toast.success(`Active person updated: ${person}`);
    } catch (err) {
      console.error("Error updating active person:", err);
    }
  };

  // Handle Project Status Change
  const handleProjectStatusChange = async (newStatus) => {
    if (readOnly) return;
    setProjectStatus(newStatus);
    const updated = {
      ...currentProject,
      projectStatus: newStatus
    };
    onUpdatePresale?.(updated);

    try {
      const targetId = currentProject._id || currentProject.id;
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          projectStatus: newStatus
        });
      }
      toast.success(`Project Status updated: ${newStatus}`);
    } catch (err) {
      console.error("Error updating project status:", err);
    }
  };

  // Handle Project Sub-Status Change
  const handleProjectSubStatusChange = async (newSubStatus) => {
    if (readOnly) return;
    setProjectSubStatus(newSubStatus);
    const matched = PROJECT_SUB_STATUS_OPTIONS.find((opt) => opt.value === newSubStatus);
    if (matched && matched.stageId) {
      setActiveStageId(matched.stageId);
    }
    const updated = {
      ...currentProject,
      projectSubStatus: newSubStatus
    };
    onUpdatePresale?.(updated);

    try {
      const targetId = currentProject._id || currentProject.id;
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          projectSubStatus: newSubStatus
        });
      }
      toast.success(`Project Sub-Status updated: ${newSubStatus}`);
    } catch (err) {
      console.error("Error updating project sub-status:", err);
    }
  };

  // Handle Save Stage Data (Connected to dedicated Presales collection)
  const handleSaveStage = async () => {
    if (readOnly || isSavingStage) return;
    const targetId = currentProject._id || currentProject.id;
    if (!targetId) {
      toast.error("Project ID is missing!");
      return;
    }

    setIsSavingStage(true);

    try {
      let finalStageData = { ...stageFormData };

      // 1. If any media files or completion notes are attached in the stage form, upload to Cloudinary & sync to discussion
      const rawFiles = Array.isArray(stageFormData.attachments)
        ? stageFormData.attachments.filter((a) => a.file)
        : [];
      const stageNotes = stageFormData.notes || stageFormData.visitRemarks || "";

      if (rawFiles.length > 0 || (stageNotes && stageNotes.trim() !== "")) {
        try {
          const formPayload = new FormData();
          formPayload.append(
            "text",
            stageNotes.trim()
              ? `[Stage ${activeStageId} ${activeStageConfig.name} Completed] ${stageNotes.trim()}`
              : `[Stage ${activeStageId} ${activeStageConfig.name}] Completed & saved.`
          );
          formPayload.append("author", currentUser || activePerson || "Admin");
          formPayload.append("stageId", activeStageId);
          formPayload.append("stageName", activeStageConfig.name || `Stage ${activeStageId}`);
          rawFiles.forEach((att) => {
            if (att.file) {
              formPayload.append("files", att.file, att.name || "media");
            }
          });

          const remRes = await addPresaleRemarkApi(targetId, formPayload);
          if (remRes?.data?.newRemark) {
            const uploadedRemark = remRes.data.newRemark;
            handleAddRemark(uploadedRemark);

            // Save persistent Cloudinary attachments in finalStageData
            if (Array.isArray(uploadedRemark.attachments) && uploadedRemark.attachments.length > 0) {
              finalStageData = {
                ...finalStageData,
                attachments: uploadedRemark.attachments
              };
              setStageFormData(finalStageData);
            }
          }
        } catch (mediaErr) {
          console.error("Error uploading stage attachments to Cloudinary:", mediaErr);
        }
      }

      // 2. Save stage data to Presales collection
      const response = await savePresaleStageApi({
        projectId: targetId,
        stageId: activeStageId,
        stageData: finalStageData,
        isCompleted: true,
        engagementScope: normalizeEngagementScope(engagementScope),
        projectStatus: projectStatus,
        projectSubStatus: projectSubStatus,
        activePerson: activePerson,
        userName: currentUser || "Admin"
      });

      if (response?.success === false) {
        toast.error(response.message || "Failed to save stage");
        return false;
      }

      const savedPresale = response?.data;
      const isClosedNow = savedPresale?.presaleStatus === "Closed";

      const updatedMap = {
        ...stagesDataMap,
        [activeStageId]: finalStageData
      };

      const updatedStatusMap = {
        ...stagesStatusMap,
        [activeStageId]: "completed"
      };

      if (savedPresale?.stages) {
        savedPresale.stages.forEach((s) => {
          if (s.status) {
            updatedStatusMap[s.stageId] = s.status;
          }
          if (s.data && typeof s.data === "object" && Object.keys(s.data).length > 0) {
            updatedMap[s.stageId] = s.data;
          }
        });
      }
      setStagesDataMap(updatedMap);
      setStagesStatusMap(updatedStatusMap);

      const nextStageId = Math.max(
        Number(savedPresale?.projectDetails?.currentStageId) || 1,
        Number(currentStageIdState) || 1,
        activeStageId + 1
      );
      setCurrentStageIdState(nextStageId);

      const updatedPresale = {
        ...currentProject,
        stagesData: updatedMap,
        currentStageId: nextStageId,
        subStatus: `Stage ${activeStageId}: ${activeStageConfig.name}`,
        presaleStatus: savedPresale?.presaleStatus || currentProject.presaleStatus,
        closureStatus: isClosedNow ? savedPresale?.closureReason : currentProject.closureStatus
      };

      if (isClosedNow) {
        setClosureStatus(savedPresale.closureReason || "Closed by Client Response");
        toast.warning(`Presale has been CLOSED due to Client Rejection!`);
      } else {
        toast.success(`Stage ${activeStageId} (${activeStageConfig.name}) saved successfully! 🚀`);
      }

      onUpdatePresale?.(updatedPresale);
      return true;
    } catch (err) {
      console.error("Error saving stage:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to save stage details on server";
      toast.error(errMsg);
      return false;
    } finally {
      setIsSavingStage(false);
    }
  };

  // Handle Add Discussion Remark (State sync when new remark is saved)
  const handleAddRemark = (newRemark) => {
    if (readOnly) return;
    setRemarksList((prev) => [newRemark, ...(prev || [])]);

    const updatedRemarks = [newRemark, ...(currentProject.remarks || [])];

    const updatedPresale = {
      ...currentProject,
      remarks: updatedRemarks
    };
    onUpdatePresale?.(updatedPresale);
  };

  // Handle Move to Active Project Action
  const handleMoveToActive = async () => {
    if (!isMoveToActiveEnabled) {
      toast.warning(
        "Move to Active Project requires Scope = 'Design + Construction' and Stage 11 Contract Signed Date!"
      );
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to promote ${currentProject.projectName || currentProject.clientName} to Active Project (Construction Phase)?`
      )
    ) {
      const targetId = currentProject._id || currentProject.id;
      const updatedPresale = {
        ...currentProject,
        status: "ACTIVE_PROJECT",
        closureStatus: "Converted to Construction"
      };
      setClosureStatus("Converted to Construction");
      onUpdatePresale?.(updatedPresale);

      try {
        if (targetId) {
          await updateLeadProjectApi(targetId, {
            status: "ACTIVE_PROJECT",
            closureStatus: "Converted to Construction"
          });
        }
        toast.success(`🎉 ${currentProject.projectName || currentProject.clientName} successfully moved to Active Project!`);
        onClose?.();
      } catch (err) {
        console.error("Error moving to active project:", err);
        toast.error("Failed to promote to Active Project on server");
      }
    }
  };

  // Handle Confirm Close Action with Remarks & Cloudinary Media
  const handleConfirmClose = async () => {
    const targetId = currentProject._id || currentProject.id;
    if (!targetId || isSubmittingClose) return;

    setIsSubmittingClose(true);

    try {
      const formData = new FormData();
      formData.append("closureReason", selectedClosureOption);
      formData.append("closureRemark", closeRemarkText ? closeRemarkText.trim() : "");
      formData.append("stageId", activeStageId);
      formData.append("stageName", activeStageConfig.name || `Stage ${activeStageId}`);
      formData.append("author", currentUser || activePerson || "Admin");

      closeAttachments.forEach((att) => {
        if (att.file) {
          formData.append("files", att.file, att.name || "closure-media");
        }
      });

      const res = await closePresaleApi(targetId, formData);
      const fullClosureReason = `${selectedClosureOption}${closeRemarkText.trim() ? " — " + closeRemarkText.trim() : ""}`;

      if (res?.data?.newRemark) {
        handleAddRemark(res.data.newRemark);
      }

      setClosureStatus(fullClosureReason);

      const updatedPresale = {
        ...currentProject,
        status: "CLOSED",
        presaleStatus: "Closed",
        closureStatus: fullClosureReason,
        closedAtStage: activeStageId
      };
      onUpdatePresale?.(updatedPresale);

      toast.warning(`Presale has been CLOSED at Stage ${activeStageId} (${activeStageConfig.name})!`);
      setIsCloseModalOpen(false);
      setCloseRemarkText("");
      setCloseAttachments([]);
    } catch (err) {
      console.error("Error closing presale:", err);
      toast.error(err?.response?.data?.message || "Failed to mark presale as closed");
    } finally {
      setIsSubmittingClose(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-16 animate-in fade-in duration-200">
      {/* ================================================================= */}
      {/* STICKY TOP HEADER BANNER CARD (Full page standard CRM style) */}
      {/* ================================================================= */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title={currentProject.clientName || presale.clientName || "Client"}
          showBackButton={true}
          onBack={onClose}
          rightActions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FaArrowLeft className="text-slate-500 text-xs" />
                <span>Back to Presales List</span>
              </button>

              {isCurrentStageApplicable && isCurrentStageSaved && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold shadow-2xs">
                  <FaCheckCircle className="text-xs text-emerald-700" />
                  <span>Stage {activeStageId} Completed</span>
                </div>
              )}
            </div>
          }
        />
      </div>

      {/* ================================================================= */}
      {/* CLOSED STATUS BANNER (If Lead is Closed at Any Stage) */}
      {/* ================================================================= */}
      {(currentProject.status === "CLOSED" || currentProject.presaleStatus === "Closed" || (closureStatus && closureStatus !== "Open")) && (
        <div className="bg-gradient-to-r from-rose-50 via-rose-100/60 to-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs text-rose-950 space-y-2 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
                <FaTimesCircle className="text-base" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-rose-900 flex items-center gap-2">
                  <span>Presale Pipeline Closed</span>
                  {currentProject.closedAtStage && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px] font-bold">
                      At Stage {currentProject.closedAtStage}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-rose-700 font-medium">
                  This lead has been stopped/dropped and archived.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold bg-rose-600 text-white px-3 py-1 rounded-full shadow-2xs">
              CLOSED
            </span>
          </div>
          <div className="pt-2 border-t border-rose-200 text-xs text-rose-800 flex flex-wrap items-center gap-2">
            <span className="font-bold text-rose-900">Recorded Reason:</span>
            <span className="italic font-semibold text-rose-950 bg-white/70 px-2.5 py-1 rounded-lg border border-rose-200">
              {closureStatus || currentProject.closureStatus || "Client Dropped / Lost"}
            </span>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MULTI-PROJECT SWITCHER TABS (For Clients with 2+ Projects) */}
      {/* ================================================================= */}
      {allProjects.length > 1 && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-3.5 shadow-md text-white">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <FaBoxes className="text-sm" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <span>Client Projects ({allProjects.length} Projects)</span>
                  <span className="text-[10px] font-normal text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                    Individual 11-Stage Pipelines
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Select a project below to manage its specific stages, status, scope & discussions
                </p>
              </div>
            </div>
            <div className="text-[11px] font-medium text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
              Client: <span className="font-bold text-white">{currentProject.clientName || presale.clientName}</span>
            </div>
          </div>

          {/* Project Tabs Strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {allProjects.map((p, idx) => {
              const pId = p.id || p._id;
              const isSelected = pId === (currentProject.id || currentProject._id);
              const pName = p.projectName || p.workCategory || `Project #${idx + 1}`;
              const pBudget = Number(p.expectedBusiness || p.amount || p.expectedRevenue || 0);
              const pStage = p.currentStageId || 1;

              return (
                <button
                  key={pId || idx}
                  type="button"
                  onClick={() => handleSwitchProject(p)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border text-left ${
                    isSelected
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md ring-2 ring-indigo-400/40"
                      : "bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                      isSelected ? "bg-white text-indigo-700 shadow-xs" : "bg-white/20 text-slate-200"
                    }`}
                  >
                    P{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold truncate max-w-[170px] sm:max-w-[220px]">
                        {pName}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.2 rounded font-bold uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] opacity-85 font-mono mt-0.5">
                      <span>₹{pBudget.toLocaleString("en-IN")}</span>
                      <span>•</span>
                      <span>Stage {pStage}/11</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SECTION 3: TOP-LEVEL ENTRY FIELDS (Presale Record Header Controls) */}
      {/* ================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        {/* Top Header Control Cards: Active Person + Status + Sub-Status + Scope */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">

          {/* 1. CURRENT ACTIVE PERSON IN PROJECT (From Project Form) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <FaUserTie className="text-blue-600 text-xs" />
                  <span>Current Active Person</span>
                </label>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Project Form
                </span>
              </div>
              <input
                type="text"
                disabled={readOnly}
                value={activePerson}
                onChange={(e) => handleActivePersonChange(e.target.value)}
                placeholder="Enter active coordinator name..."
                list="active-person-suggestions"
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
              <datalist id="active-person-suggestions">
                {currentProject.nextPersonName && <option value={currentProject.nextPersonName} />}
                {currentProject.projectCoordinatorName && <option value={currentProject.projectCoordinatorName} />}
                {currentProject.assignedTo && <option value={currentProject.assignedTo} />}
                <option value="PRASHANT SIR" />
                <option value="SHAHNAWAZ SIR" />
                <option value="Admin" />
                <option value="Rahul Sharma" />
                <option value="Pooja Verma" />
              </datalist>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 truncate">
              {currentProject.designation ? `Designation: ${currentProject.designation}` : "Assigned executive managing client"}
            </p>
          </div>

          {/* 2. PROJECT STATUS (Exact options from Google Sheet screenshot 1) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Project Status
                </label>
                <span className={`px-2 py-0.5 rounded text-[10px] ${currentProjectStatusObj.badgeClass}`}>
                  {currentProjectStatusObj.label}
                </span>
              </div>
              <select
                disabled={readOnly}
                value={projectStatus}
                onChange={(e) => handleProjectStatusChange(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {PROJECT_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.dot} {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Overall operational status</p>
          </div>

          {/* 3. PROJECT SUB - STATUS (Exact options from Google Sheet screenshot 2) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Project Sub - Status
                </label>
                <span className={`px-2 py-0.5 rounded text-[10px] truncate max-w-[120px] ${currentProjectSubStatusObj.badgeClass}`}>
                  {currentProjectSubStatusObj.label}
                </span>
              </div>
              <select
                disabled={readOnly}
                value={projectSubStatus}
                onChange={(e) => handleProjectSubStatusChange(e.target.value)}
                className="w-full bg-white border border-slate-300 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                {PROJECT_SUB_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Syncs with 11-stage design pipeline</p>
          </div>

          {/* 4. ENGAGEMENT SCOPE (Section 2 - Upgradeable Anytime) */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-900 block mb-1">
                Engagement Scope <span className="text-blue-500 font-normal">(Upgradeable)</span>
              </label>
              <select
                disabled={readOnly}
                value={engagementScope}
                onChange={(e) => handleScopeChange(e.target.value)}
                className="w-full bg-white border border-blue-300 text-blue-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer disabled:bg-slate-100 shadow-2xs"
              >
                <option value="Consultancy Only">Consultancy Only (Stages 1-2)</option>
                <option value="Design Only">Design Only (Stages 1-10)</option>
                <option value="Design + Construction">Design + Construction (Stages 1-11)</option>
              </select>
            </div>
            <p className="text-[10px] text-blue-600 mt-1">Controls stage locks & construction gates</p>
          </div>
        </div>

        {/* Secondary Info Strip: Project Name, Phone, Revenue, Work Types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {/* Active Project Name */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Project Name
            </span>
            <span className="font-bold text-indigo-700 text-xs truncate ml-2">
              {currentProject.projectName || currentProject.workCategory || "Primary Project"}
            </span>
          </div>

          {/* Phone & Contact */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Contact Phone
            </span>
            <span className="font-bold font-mono text-slate-900 text-xs">
              {currentProject.phoneNumber || currentProject.contactNo || "--"}
            </span>
          </div>

          {/* Expected Revenue */}
          <div className="px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
              Expected Revenue
            </span>
            <span className="font-extrabold font-mono text-emerald-700 text-xs sm:text-sm">
              ₹{Number(currentProject.expectedBusiness || currentProject.amount || 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Work Type Tags */}
          <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Work:
            </span>
            {Array.isArray(currentProject.workType) && currentProject.workType.length > 0 ? (
              currentProject.workType.map((wt, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[10px] border border-indigo-200 shrink-0"
                >
                  {wt}
                </span>
              ))
            ) : (
              <span className="text-slate-600 font-medium text-[11px] truncate">
                {typeof currentProject.workType === "string" && currentProject.workType !== "--"
                  ? currentProject.workType
                  : "Standard Architectural Design"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 4: 11 SUB-STAGES VISUAL STEPPER */}
      {/* ================================================================= */}
      {/* ================================================================= */}
      {/* SECTION 4: SUB-STAGES VISUAL STEPPER (Hides future stages if Closed) */}
      {/* ================================================================= */}
      <PresalesStepper
        activeStageId={activeStageId}
        onSelectStage={(id) => setActiveStageId(id)}
        engagementScope={engagementScope}
        currentStageId={currentStageIdState}
        stagesData={stagesDataMap}
        stagesStatus={stagesStatusMap}
        isClosed={isProjectClosed}
        closedAtStage={effectiveClosedAtStage}
      />

      {/* ================================================================= */}
      {/* ACTIVE STAGE ENTRY FORM */}
      {/* ================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isProjectClosed && activeStageId === Number(effectiveClosedAtStage)
                  ? "bg-rose-600"
                  : isCurrentStageSaved
                  ? "bg-emerald-600"
                  : "bg-blue-600"
              }`}
            ></span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase">
              STAGE {activeStageConfig.id} — {activeStageConfig.fullName}
            </h3>
            {isProjectClosed && activeStageId === Number(effectiveClosedAtStage) ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                <FaTimesCircle className="text-[10px]" /> Pipeline Closed at this Stage
              </span>
            ) : isCurrentStageSaved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <FaCheckCircle className="text-[10px]" /> Completed
              </span>
            )}
          </div>

          {!isProjectClosed && isCurrentStageApplicable && isCurrentStageSaved && (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                <FaCheckCircle className="text-xs" /> Data Saved
              </span>
              {activeStageId < 11 && (
                <button
                  type="button"
                  onClick={() => setActiveStageId((prev) => prev + 1)}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Next Stage</span>
                  <FaArrowRight className="text-xs" />
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <SubStageFormRenderer
            stageId={activeStageId}
            stageData={stageFormData}
            onChange={(newData) => setStageFormData(newData)}
            engagementScope={engagementScope}
            readOnly={isStageLocked}
          />
        </div>

        {/* View Saved Stage Details Right Below if already saved */}
        {isCurrentStageSaved && (
          <div className="pt-2">
            <SavedStageSummaryCard
              stageId={activeStageId}
              stageName={activeStageConfig.name}
              stageData={
                stagesDataMap[activeStageId] ||
                currentProject.stagesData?.[activeStageId] ||
                stageFormData
              }
              hasNextStage={!isProjectClosed && activeStageId < 11}
              onNextStage={() => {
                if (!isProjectClosed && activeStageId < 11) {
                  setActiveStageId((prev) => prev + 1);
                }
              }}
            />
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* SECTION 5 & 6: DISCUSSION LOG & GATEKEEPER ACTIONS */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Discussion Log / Remarks (Specific to Active Stage) */}
        <PresalesDiscussionLog
          projectId={currentProject._id || currentProject.id}
          activeStageId={activeStageId}
          activeStageName={activeStageConfig.name}
          remarks={remarksList || []}
          onAddRemark={handleAddRemark}
          onSaveCurrentStage={handleSaveStage}
          onNextStage={() => {
            if (!isProjectClosed && activeStageId < 11) {
              setActiveStageId((prev) => prev + 1);
            }
          }}
          readOnly={readOnly || isProjectClosed}
          currentUser={currentUser}
        />

        {/* Right: Presale Pipeline Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase pb-2 border-b border-slate-100">
              Presale Pipeline Actions & Closure Gateways
            </h4>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <FaInfoCircle className="text-blue-600" />
                <span>Rules for Promotion & Closure:</span>
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 pl-1">
                <li>
                  <strong>Consultancy Only</strong>: Closes after Stage 1–2 without becoming Active Project.
                </li>
                <li>
                  <strong>Design Only</strong>: Closes after Stages 1–10 without becoming Active Project.
                </li>
                <li>
                  <strong>Design + Construction</strong>: Moves to Active Project once Stage 11 Contract is signed.
                </li>
              </ul>
            </div>

            {!isMoveToActiveEnabled && engagementScope === "Design + Construction" && (
              <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-medium">
                ⚠️ "Move to Active Project" will unlock as soon as <strong>Stage 11 (Contract Formation)</strong> has its Final Contract Sign Date filled.
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
            {/* Mark as Closed Button */}
            {!readOnly ? (
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Mark as Closed...
              </button>
            ) : (
              <span className="text-xs text-slate-400 italic">Actions disabled in Viewer mode</span>
            )}

            {/* Move to Active Project Button */}
            {!readOnly && (
              <button
                type="button"
                onClick={handleMoveToActive}
                disabled={!isMoveToActiveEnabled}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isMoveToActiveEnabled
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer hover:scale-105 active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
                }`}
                title={
                  isMoveToActiveEnabled
                    ? "Promote this presale to Active Project"
                    : "Requires Scope: 'Design + Construction' and Stage 11 Contract Signed Date"
                }
              >
                <span>Move to Active Project</span>
                <FaArrowRight className="text-xs" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MODAL: MARK AS CLOSED (With Closure Remarks & Cloudinary Media) */}
      {/* ================================================================= */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <FaTimesCircle className="text-lg" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Mark Presale as Closed / Drop
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Record closure reason, voice explanation & proof attachments
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmittingClose}
                onClick={() => setIsCloseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-all disabled:opacity-50"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* Stage Identification Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-600 uppercase text-[10px] tracking-wider">
                Current Pipeline Stage:
              </span>
              <span className="font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-lg text-xs">
                Stage {activeStageId} — {activeStageConfig.name} ({activeStageConfig.fullName})
              </span>
            </div>

            <div className="space-y-3.5">
              {/* Reason Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Closure Reason Category <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isSubmittingClose}
                  value={selectedClosureOption}
                  onChange={(e) => setSelectedClosureOption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-500 bg-white shadow-2xs"
                >
                  <option value="Lost — Client Dropped / Budget Mismatch">
                    Lost — Client Dropped / Budget Mismatch
                  </option>
                  <option value="Lost — Client Not Interested">
                    Lost — Client Not Interested
                  </option>
                  <option value="Lost — No Response from Long Time">
                    Lost — No Response from Long Time
                  </option>
                  <option value="Lost — Competitor Chosen">
                    Lost — Competitor Chosen
                  </option>
                  <option value="Closed — Consultancy Only">
                    Closed — Consultancy Only (Completed Stages 1–2)
                  </option>
                  <option value="Closed — Design Only">
                    Closed — Design Only (Completed Drawings / Stages 1–10)
                  </option>
                  <option value="Other / Client Cancelled">
                    Other / Client Cancelled
                  </option>
                </select>
              </div>

              {/* Close Remarks & Audio/Screenshot Attachment */}
              <CommentWithMedia
                title="Closure Remarks, Call Voice Note & Attachments"
                placeholder="Detail why client dropped / closed (e.g. rate issue, postponed to next year, call summary)..."
                value={closeRemarkText}
                onChange={(val) => setCloseRemarkText(val)}
                files={closeAttachments}
                onFilesChange={(newFiles) => setCloseAttachments(newFiles)}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isSubmittingClose}
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingClose}
                onClick={handleConfirmClose}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingClose ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Uploading Media & Closing...</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-xs" />
                    <span>Confirm & Mark as Closed</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresalesPipelineView;
