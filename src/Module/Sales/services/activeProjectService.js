import { getAllLeadProjectsApi } from "./leadProject.api";
import pmsWbsService from "./pmsWbsService";

export const ACTIVE_PROJECTS_STORAGE_KEY = "dss_active_projects_data";

// Standard 23 Major Construction Stages (Module 4 Master Blueprint)
export const DEFAULT_23_STAGES = [
  { stage_code: "S1", stage_name: "Site Survey, Soil Testing & Benchmarking" },
  { stage_code: "S2", stage_name: "Site Clearance, Demolition & Earth Leveling" },
  { stage_code: "S3", stage_name: "Excavation, Trenching & Pit Preparation" },
  { stage_code: "S4", stage_name: "Anti-Termite Treatment & PCC Foundation Bed" },
  { stage_code: "S5", stage_name: "Footing Rebar, Shuttering & Raft Concreting" },
  { stage_code: "S6", stage_name: "Pedestal Columns & Ground Level Tie Beams" },
  { stage_code: "S7", stage_name: "Backfilling, Compaction & Plinth Beam Construction" },
  { stage_code: "S8", stage_name: "DPC (Damp Proof Course) & Plinth Protection" },
  { stage_code: "S9", stage_name: "Ground Floor Column Casting & Curing" },
  { stage_code: "S10", stage_name: "Brickwork / AAC Block Masonry (Ground Floor)" },
  { stage_code: "S11", stage_name: "Ground Floor Slab Formwork & Rebar Binding" },
  { stage_code: "S12", stage_name: "Concealed Slab Electrical & Plumbing Conduit Laying" },
  { stage_code: "S13", stage_name: "Ground Floor RCC Slab Casting & Pond Curing" },
  { stage_code: "S14", stage_name: "First Floor Columns, Masonry & Slab Casting" },
  { stage_code: "S15", stage_name: "Parapet Wall, Staircase Headroom & Mumty Room" },
  { stage_code: "S16", stage_name: "Internal & External Wall Plastering (1:4 Cement Sand)" },
  { stage_code: "S17", stage_name: "Terrace Waterproofing, Screeding & Rainwater Outlets" },
  { stage_code: "S18", stage_name: "Concealed Wall Electrical Wiring & Plumbing Pipelines" },
  { stage_code: "S19", stage_name: "Door Frames (Chowkhat) & Window Sub-Frame Installation" },
  { stage_code: "S20", stage_name: "Flooring, Skirting & Bathroom Wall Tile Cladding" },
  { stage_code: "S21", stage_name: "Modular Kitchen, Sanitaryware & Bath Fitting Installation" },
  { stage_code: "S22", stage_name: "Wall Putty, Primer, 2-Coat Paint & Polish Work" },
  { stage_code: "S23", stage_name: "Deep Cleaning, Final Snagging, Testing & Handover" }
];

// Helper to create seed works & tasks for a stage if none exists in master
const generateFallbackStageWorks = (stageCode, stageName) => {
  return [
    {
      workId: `${stageCode}-W1`,
      workName: `${stageName} - Preparation & Material Staging`,
      tasks: [
        {
          taskId: `${stageCode}-W1-T1`,
          taskName: `Material inspection & safety checks for ${stageName}`,
          status: "Not Started",
          assignedContractor: "Apex Civil Infratech Pvt Ltd",
          deadlineDate: "",
          photoUrl: "",
          remark: ""
        },
        {
          taskId: `${stageCode}-W1-T2`,
          taskName: `Execution & formwork preparation for ${stageName}`,
          status: "Not Started",
          assignedContractor: "Krishna Excavators & Earthmovers",
          deadlineDate: "",
          photoUrl: "",
          remark: ""
        }
      ]
    },
    {
      workId: `${stageCode}-W2`,
      workName: `${stageName} - Execution & Final Quality Sign-off`,
      tasks: [
        {
          taskId: `${stageCode}-W2-T1`,
          taskName: `Main site execution & supervisor alignment for ${stageName}`,
          status: "Not Started",
          assignedContractor: "National Shuttering & Scaffolding Works",
          deadlineDate: "",
          photoUrl: "",
          remark: ""
        },
        {
          taskId: `${stageCode}-W2-T2`,
          taskName: `Quality audit, dimension verification & engineer signoff`,
          status: "Not Started",
          assignedContractor: "Modern Bar Binders & Steel Works",
          deadlineDate: "",
          photoUrl: "",
          remark: ""
        }
      ]
    }
  ];
};

/**
 * Clones the complete 23 Stages checklist from Module 4 WBS Master / fallback blueprint
 */
export const cloneChecklistFromMaster = () => {
  let masterStages = [];
  let masterWorks = [];
  let masterTasks = [];

  try {
    const sStr = localStorage.getItem("pms_master_stages_data");
    const wStr = localStorage.getItem("pms_master_works_data");
    const tStr = localStorage.getItem("pms_master_tasks_data");
    if (sStr) masterStages = JSON.parse(sStr);
    if (wStr) masterWorks = JSON.parse(wStr);
    if (tStr) masterTasks = JSON.parse(tStr);
  } catch (e) {
    console.warn("Error reading cached WBS master:", e);
  }

  const baseStages = Array.isArray(masterStages) && masterStages.length >= 5
    ? masterStages
    : DEFAULT_23_STAGES;

  const clonedStages = baseStages.map((stg, idx) => {
    const sCode = stg.stage_code || stg.code || `S${idx + 1}`;
    const sName = stg.stage_name || stg.name || `Stage ${sCode}`;

    // Filter works for this stage
    const matchingWorks = (masterWorks || []).filter(
      (w) => w.stage_code === sCode || String(w.code || "").startsWith(`${sCode}-`)
    );

    let worksList = [];
    if (matchingWorks.length > 0) {
      worksList = matchingWorks.map((w) => {
        const wCode = w.work_code || w.code || `${sCode}-W1`;
        const wName = w.work_name || w.name || wCode;

        // Filter tasks for this work
        const matchingTasks = (masterTasks || []).filter(
          (t) => t.work_code === wCode || String(t.code || "").startsWith(`${wCode}-`)
        );

        let tasksList = [];
        if (matchingTasks.length > 0) {
          tasksList = matchingTasks.map((t) => {
            const tCode = t.task_code || t.code || `${wCode}-T1`;
            const tName = t.task_name || t.name || tCode;
            return {
              taskId: tCode,
              taskName: tName,
              status: "Not Started", // Not Started -> In Progress -> Completed
              assignedContractor: "",
              deadlineDate: "",
              photoUrl: "",
              remark: ""
            };
          });
        } else {
          tasksList = [
            {
              taskId: `${wCode}-T1`,
              taskName: `${wName} - Primary Execution Task`,
              status: "Not Started",
              assignedContractor: "",
              deadlineDate: "",
              photoUrl: "",
              remark: ""
            }
          ];
        }

        return {
          workId: wCode,
          workName: wName,
          status: "Not Started",
          tasks: tasksList
        };
      });
    } else {
      worksList = generateFallbackStageWorks(sCode, sName);
    }

    return {
      stageId: sCode,
      stageName: sName,
      status: "Not Started",
      works: worksList
    };
  });

  return clonedStages;
};

// Seed Active Projects (Empty by default - real data only)
export const SEED_ACTIVE_PROJECTS = [];

/**
 * Computes roll-up stats for a project:
 * - Total tasks count
 * - Completed tasks count
 * - In progress tasks count
 * - Overdue / delayed tasks count
 * - Overall progress %
 * - Work & Stage level auto-completions
 */
export const calculateProjectRollup = (project) => {
  const stages = project.stages || [];
  let totalTasks = 0;
  let completedTasks = 0;
  let inProgressTasks = 0;
  let overdueTasks = 0;

  const todayStr = new Date().toISOString().split("T")[0];

  const updatedStages = stages.map((stage) => {
    let stageTotalTasks = 0;
    let stageCompletedTasks = 0;

    const updatedWorks = (stage.works || []).map((work) => {
      let workTotalTasks = (work.tasks || []).length;
      let workCompletedTasks = 0;

      const updatedTasks = (work.tasks || []).map((task) => {
        totalTasks += 1;
        stageTotalTasks += 1;

        const isDone = task.status === "Completed";
        const isInProg = task.status === "In Progress";
        if (isDone) {
          completedTasks += 1;
          workCompletedTasks += 1;
          stageCompletedTasks += 1;
        } else if (isInProg) {
          inProgressTasks += 1;
        }

        // Auto Delay check: deadline passed & not completed
        const isOverdue = Boolean(
          task.deadlineDate &&
          task.deadlineDate < todayStr &&
          task.status !== "Completed"
        );
        if (isOverdue) overdueTasks += 1;

        return {
          ...task,
          isOverdue
        };
      });

      // Auto roll-up for work
      let workStatus = "Not Started";
      if (workTotalTasks > 0 && workCompletedTasks === workTotalTasks) {
        workStatus = "Completed";
      } else if (workCompletedTasks > 0 || (work.tasks || []).some((t) => t.status === "In Progress")) {
        workStatus = "In Progress";
      }

      return {
        ...work,
        status: workStatus,
        completedTasksCount: workCompletedTasks,
        totalTasksCount: workTotalTasks,
        tasks: updatedTasks
      };
    });

    // Auto roll-up for stage
    let stageStatus = "Not Started";
    if (stageTotalTasks > 0 && stageCompletedTasks === stageTotalTasks) {
      stageStatus = "Completed";
    } else if (stageCompletedTasks > 0 || updatedWorks.some((w) => w.status === "In Progress")) {
      stageStatus = "In Progress";
    }

    const stageProgressPercent = stageTotalTasks > 0
      ? Math.round((stageCompletedTasks / stageTotalTasks) * 100)
      : 0;

    const stageTotalWorks = updatedWorks.length;
    const stageCompletedWorks = updatedWorks.filter((w) => w.status === "Completed").length;

    return {
      ...stage,
      status: stageStatus,
      progressPercent: stageProgressPercent,
      completedTasksCount: stageCompletedTasks,
      totalTasksCount: stageTotalTasks,
      completedWorksCount: stageCompletedWorks,
      totalWorksCount: stageTotalWorks,
      works: updatedWorks
    };
  });

  const overallProgress = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Auto-flag project status as "Delayed" if any active task is overdue and user hasn't marked On Hold/Completed
  let autoProjectStatus = project.projectStatus || "On Track";
  if (overdueTasks > 0 && autoProjectStatus === "On Track") {
    autoProjectStatus = "Delayed";
  } else if (overallProgress === 100) {
    autoProjectStatus = "Completed";
  }

  return {
    ...project,
    stages: updatedStages,
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    overallProgress,
    projectStatus: autoProjectStatus
  };
};

/**
 * Check if a string is a raw 24-character hexadecimal MongoDB ObjectId
 */
export const isObjectId = (str) => {
  return typeof str === "string" && /^[0-9a-fA-F]{24}$/.test(str.trim());
};

/**
 * Builds lookup maps from WBS Master data (MongoDB API or local storage cache)
 */
export const buildWbsLookupMaps = (wbsData = null) => {
  const stageMap = new Map();
  const workMap = new Map();
  const taskMap = new Map();

  let stages = wbsData?.stages || [];
  let works = wbsData?.works || [];
  let tasks = wbsData?.tasks || [];

  if (!stages.length) {
    try {
      const s = localStorage.getItem("pms_master_stages_data");
      if (s) stages = JSON.parse(s);
    } catch (e) {}
  }
  if (!works.length) {
    try {
      const w = localStorage.getItem("pms_master_works_data");
      if (w) works = JSON.parse(w);
    } catch (e) {}
  }
  if (!tasks.length) {
    try {
      const t = localStorage.getItem("pms_master_tasks_data");
      if (t) tasks = JSON.parse(t);
    } catch (e) {}
  }

  (stages || []).forEach((s) => {
    if (s._id) stageMap.set(String(s._id), s);
    if (s.id) stageMap.set(String(s.id), s);
    if (s.stage_code) stageMap.set(String(s.stage_code), s);
    if (s.code) stageMap.set(String(s.code), s);
  });

  (works || []).forEach((w) => {
    if (w._id) workMap.set(String(w._id), w);
    if (w.id) workMap.set(String(w.id), w);
    if (w.work_code) workMap.set(String(w.work_code), w);
    if (w.code) workMap.set(String(w.code), w);
  });

  (tasks || []).forEach((t) => {
    if (t._id) taskMap.set(String(t._id), t);
    if (t.id) taskMap.set(String(t.id), t);
    if (t.task_code) taskMap.set(String(t.task_code), t);
    if (t.code) taskMap.set(String(t.code), t);
  });

  return { stageMap, workMap, taskMap };
};

/**
 * Checks if a stages array contains any unpopulated raw ObjectIds
 */
export const hasCorruptedStageIds = (stages = []) => {
  return (stages || []).some(
    (s) =>
      isObjectId(s.stageId) ||
      (s.stageName && (isObjectId(s.stageName) || s.stageName.includes("6a") || s.stageName.startsWith("Stage 6a"))) ||
      (s.works || []).some(
        (w) =>
          isObjectId(w.workId) ||
          isObjectId(w.workName) ||
          (w.tasks || []).some((t) => isObjectId(t.taskId) || isObjectId(t.taskName))
      )
  );
};

/**
 * Maps PMS Template stages into clean, human-readable execution stages format
 */
export const mapPmsStagesToExecutionStages = (pmsStages = [], wbsData = null, previousStages = []) => {
  const { stageMap, workMap, taskMap } = buildWbsLookupMaps(wbsData);

  const prevTaskStatusMap = new Map();
  (previousStages || []).forEach((ps) => {
    (ps.works || []).forEach((pw) => {
      (pw.tasks || []).forEach((pt) => {
        if (pt.taskId) prevTaskStatusMap.set(String(pt.taskId), pt);
        if (pt.taskName) prevTaskStatusMap.set(String(pt.taskName).toLowerCase().trim(), pt);
      });
    });
  });

  return (pmsStages || []).map((stg, sIdx) => {
    const rawStageId = typeof stg.stageId === "object" && stg.stageId !== null ? (stg.stageId._id || stg.stageId.id) : stg.stageId;
    const stageWbsObj = stageMap.get(String(rawStageId)) || (typeof stg.stageId === "object" ? stg.stageId : null);

    let sCode =
      stg.stageId?.stage_code ||
      stg.stage_code ||
      stg.stageCode ||
      stageWbsObj?.stage_code ||
      stageWbsObj?.code ||
      (typeof stg.stageId === "string" && !isObjectId(stg.stageId) ? stg.stageId : null) ||
      `S${sIdx + 1}`;

    let sName =
      stg.stageId?.stage_name ||
      stg.stage_name ||
      stg.stageName ||
      stageWbsObj?.stage_name ||
      stageWbsObj?.name ||
      stageWbsObj?.description ||
      `Stage ${sCode}`;

    if (isObjectId(sName) || sName.includes(String(rawStageId))) {
      sName = stageWbsObj?.stage_name || `Stage ${sCode}`;
    }

    const sWorks = (stg.works || []).map((w, wIdx) => {
      const rawWorkId = typeof w.workId === "object" && w.workId !== null ? (w.workId._id || w.workId.id) : w.workId;
      const workWbsObj = workMap.get(String(rawWorkId)) || (typeof w.workId === "object" ? w.workId : null);

      let wCode =
        w.workId?.work_code ||
        w.work_code ||
        w.workCode ||
        workWbsObj?.work_code ||
        workWbsObj?.code ||
        (typeof w.workId === "string" && !isObjectId(w.workId) ? w.workId : null) ||
        `${sCode}-W${wIdx + 1}`;

      let wName =
        w.workId?.work_name ||
        w.work_name ||
        w.workName ||
        workWbsObj?.work_name ||
        workWbsObj?.name ||
        wCode;

      if (isObjectId(wName) || wName.includes(String(rawWorkId))) {
        wName = workWbsObj?.work_name || wCode;
      }

      const wTasks = (w.tasks || []).map((t, tIdx) => {
        const rawTaskId = typeof t.taskId === "object" && t.taskId !== null ? (t.taskId._id || t.taskId.id) : t.taskId;
        const taskWbsObj = taskMap.get(String(rawTaskId)) || (typeof t.taskId === "object" ? t.taskId : null);

        let tCode =
          t.taskId?.task_code ||
          t.task_code ||
          t.taskCode ||
          taskWbsObj?.task_code ||
          taskWbsObj?.code ||
          (typeof t.taskId === "string" && !isObjectId(t.taskId) ? t.taskId : null) ||
          `${wCode}-T${tIdx + 1}`;

        let tName =
          t.taskId?.task_name ||
          t.task_name ||
          t.taskName ||
          taskWbsObj?.task_name ||
          taskWbsObj?.name ||
          tCode;

        if (isObjectId(tName) || tName.includes(String(rawTaskId))) {
          tName = taskWbsObj?.task_name || tCode;
        }

        const fData = t.fieldData || w.fieldData || stg.fieldData || {};
        const contrName =
          fData.contractorName ||
          (typeof fData.contractorId === "object" ? fData.contractorId?.name : null) ||
          fData.workWillDoneBy ||
          "";
        const deadDate = fData.deadlineDate ? String(fData.deadlineDate).split("T")[0] : "";
        const remarkText = fData.instruction || fData.remark || "";

        const prev = prevTaskStatusMap.get(tCode) || prevTaskStatusMap.get(String(rawTaskId)) || prevTaskStatusMap.get(tName.toLowerCase().trim()) || {};

        return {
          taskId: tCode,
          taskName: tName,
          fieldData: t.fieldData || {},
          status: prev.status || "Not Started",
          assignedContractor: prev.assignedContractor || contrName,
          deadlineDate: prev.deadlineDate || deadDate,
          photoUrl: prev.photoUrl || "",
          remark: prev.remark || remarkText
        };
      });

      return {
        workId: wCode,
        workName: wName,
        fieldData: w.fieldData || {},
        status: (wTasks.length > 0 && wTasks.every(tk => tk.status === "Completed")) ? "Completed" : (wTasks.some(tk => tk.status === "In Progress") ? "In Progress" : "Not Started"),
        tasks: wTasks.length > 0 ? wTasks : [
          {
            taskId: `${wCode}-T1`,
            taskName: `${wName} Execution`,
            fieldData: {},
            status: "Not Started",
            assignedContractor: "",
            deadlineDate: "",
            photoUrl: "",
            remark: ""
          }
        ]
      };
    });

    return {
      stageId: sCode,
      stageName: sName,
      fieldData: stg.fieldData || {},
      status: (sWorks.length > 0 && sWorks.every(wk => wk.status === "Completed")) ? "Completed" : (sWorks.some(wk => wk.status === "In Progress") ? "In Progress" : "Not Started"),
      works: sWorks
    };
  });
};

/**
 * Repairs existing active project stages that were saved with raw ObjectIds
 */
export const repairCorruptedStages = (stages = [], wbsData = null) => {
  const { stageMap, workMap, taskMap } = buildWbsLookupMaps(wbsData);

  return (stages || []).map((stg, sIdx) => {
    let sCode = stg.stageId;
    let sName = stg.stageName;

    if (isObjectId(sCode)) {
      const match = stageMap.get(sCode);
      sCode = match?.stage_code || `S${sIdx + 1}`;
      sName = match?.stage_name || `Stage ${sCode}`;
    } else if (sName && (isObjectId(sName) || sName.includes("6a") || sName.startsWith("Stage 6a"))) {
      const match = stageMap.get(sCode);
      sName = match?.stage_name || sName;
    }

    const works = (stg.works || []).map((w, wIdx) => {
      let wCode = w.workId;
      let wName = w.workName;

      if (isObjectId(wCode)) {
        const match = workMap.get(wCode);
        wCode = match?.work_code || `${sCode}-W${wIdx + 1}`;
        wName = match?.work_name || wCode;
      } else if (wName && isObjectId(wName)) {
        const match = workMap.get(wCode);
        wName = match?.work_name || wCode;
      }

      const tasks = (w.tasks || []).map((t, tIdx) => {
        let tCode = t.taskId;
        let tName = t.taskName;

        if (isObjectId(tCode)) {
          const match = taskMap.get(tCode);
          tCode = match?.task_code || `${wCode}-T${tIdx + 1}`;
          tName = match?.task_name || tCode;
        } else if (tName && isObjectId(tName)) {
          const match = taskMap.get(tCode);
          tName = match?.task_name || tCode;
        }

        return {
          ...t,
          fieldData: t.fieldData || {},
          taskId: tCode,
          taskName: tName
        };
      });

      return {
        ...w,
        fieldData: w.fieldData || {},
        workId: wCode,
        workName: wName,
        tasks
      };
    });

    return {
      ...stg,
      fieldData: stg.fieldData || {},
      stageId: sCode,
      stageName: sName,
      works
    };
  });
};

/**
 * Active Project Service Methods
 */
export const activeProjectService = {
  // 1. Get All Active Projects with roll-up computations
  getAllActiveProjects: (wbsData = null) => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECTS_STORAGE_KEY);
      let list = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          list = [];
        }
      }

      if (!Array.isArray(list)) {
        list = [];
      }

      // Automatically purge any dummy seed data so the system only holds real projects
      const initialLength = list.length;
      list = list.filter(
        (p) =>
          !["PRJ-ACT-101", "PRJ-ACT-102", "PRJ-ACT-103"].includes(p?.id) &&
          p?.clientName !== "Er. Alok Srivastava" &&
          p?.clientName !== "Dr. Sunita Verma" &&
          p?.clientName !== "M/s Royal Heritage Hotel"
      );

      // Auto-repair any projects with raw MongoDB ObjectIds in stages
      let repairedAny = false;
      list = list.map((p) => {
        if (hasCorruptedStageIds(p?.stages)) {
          repairedAny = true;
          return {
            ...p,
            stages: repairCorruptedStages(p.stages, wbsData)
          };
        }
        return p;
      });

      if (list.length !== initialLength || repairedAny) {
        localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
      }

      // Return each with recalculated roll-up
      return list.map((p) => calculateProjectRollup(p));
    } catch (err) {
      console.error("Error loading active projects:", err);
      return [];
    }
  },

  // 2. Get Single Active Project by ID
  getActiveProjectById: (id, wbsData = null) => {
    const list = activeProjectService.getAllActiveProjects(wbsData);
    const cleanId = String(id || "");
    const found = list.find(
      (p) =>
        String(p.id) === cleanId ||
        String(p.projectId) === cleanId ||
        String(p.presaleId) === cleanId ||
        String(p.leadId) === cleanId
    );
    if (!found) return null;

    if (hasCorruptedStageIds(found.stages)) {
      found.stages = repairCorruptedStages(found.stages, wbsData);
      const targetIdx = list.findIndex((p) => String(p.id) === String(found.id));
      if (targetIdx !== -1) {
        list[targetIdx] = found;
        localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
      }
    }

    return calculateProjectRollup(found);
  },

  // 3. Update Task Status & Details
  updateTask: (projectId, stageId, workId, taskId, updates) => {
    const list = activeProjectService.getAllActiveProjects();
    const targetIdx = list.findIndex((p) => String(p.id) === String(projectId));
    if (targetIdx === -1) return null;

    const project = list[targetIdx];
    const updatedStages = (project.stages || []).map((s) => {
      if (s.stageId !== stageId) return s;
      return {
        ...s,
        works: (s.works || []).map((w) => {
          if (w.workId !== workId) return w;
          return {
            ...w,
            tasks: (w.tasks || []).map((t) => {
              if (t.taskId !== taskId) return t;
              return {
                ...t,
                ...updates
              };
            })
          };
        })
      };
    });

    const updatedProject = calculateProjectRollup({
      ...project,
      stages: updatedStages,
      updatedAt: new Date().toISOString()
    });

    list[targetIdx] = updatedProject;
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return updatedProject;
  },

  // 4. Update Project Header / Core Metadata (Editor only)
  updateProjectMetadata: (projectId, { activePerson, projectStatus, projectSubStatus, overallRemark }) => {
    const list = activeProjectService.getAllActiveProjects();
    const targetIdx = list.findIndex((p) => String(p.id) === String(projectId));
    if (targetIdx === -1) return null;

    const project = list[targetIdx];
    const updatedProject = calculateProjectRollup({
      ...project,
      activePerson: activePerson !== undefined ? activePerson : project.activePerson,
      projectStatus: projectStatus !== undefined ? projectStatus : project.projectStatus,
      projectSubStatus: projectSubStatus !== undefined ? projectSubStatus : project.projectSubStatus,
      overallRemark: overallRemark !== undefined ? overallRemark : project.overallRemark,
      updatedAt: new Date().toISOString()
    });

    list[targetIdx] = updatedProject;
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return updatedProject;
  },

  // 4b. Save Full Active Project state (Single-page unified form submission)
  saveFullProject: (projectId, fullData) => {
    const list = activeProjectService.getAllActiveProjects();
    const targetIdx = list.findIndex(
      (p) => String(p.id) === String(projectId) || String(p.projectId) === String(projectId)
    );
    if (targetIdx === -1) return null;

    const project = list[targetIdx];
    const updatedProject = calculateProjectRollup({
      ...project,
      ...fullData,
      updatedAt: new Date().toISOString()
    });

    list[targetIdx] = updatedProject;
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return updatedProject;
  },

  // 4c. Alias to save active project
  saveActiveProject: (fullData) => {
    if (!fullData || !fullData.id) return null;
    return activeProjectService.saveFullProject(fullData.id, fullData);
  },

  // 5. Convert Presale to Active Project (Auto-Clones 23 Stages)
  convertPresaleToActiveProject: (presaleRecord) => {
    const list = activeProjectService.getAllActiveProjects();

    // Check if already converted
    const existing = list.find((p) => p.presaleId === presaleRecord.id || p.presaleId === presaleRecord._id);
    if (existing) {
      return { project: existing, alreadyExists: true };
    }

    const clonedChecklist = cloneChecklistFromMaster();

    const newProject = calculateProjectRollup({
      id: "PRJ-ACT-" + Math.floor(100 + Math.random() * 900),
      presaleId: presaleRecord.id || presaleRecord._id || `PRE-${Date.now()}`,
      clientName: presaleRecord.clientName || presaleRecord.concernPersonName || "Unnamed Client",
      phone: presaleRecord.phone || presaleRecord.contactNumber || presaleRecord.mobile || "",
      email: presaleRecord.email || "",
      city: presaleRecord.city || "Lucknow",
      address: presaleRecord.address || presaleRecord.siteAddress || `${presaleRecord.city || "Site"}, UP`,
      workType: presaleRecord.businessType || presaleRecord.workType || "Design + Construction",
      engagementScope: "Design + Construction",
      revenue: presaleRecord.amount ? `₹ ${Number(presaleRecord.amount).toLocaleString("en-IN")}` : "₹ 50,00,000",
      contractSignedDate: new Date().toISOString().split("T")[0],
      activePerson: "Er. Assigned Site Engineer",
      projectStatus: "On Track",
      projectSubStatus: "Site Handover & Survey Stage",
      overallRemark: "Presales contract signed. 23-stage checklist auto-cloned from PMS Master.",
      stages: clonedChecklist,
      createdAt: new Date().toISOString()
    });

    const updatedList = [newProject, ...list];
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(updatedList));
    return { project: newProject, alreadyExists: false };
  },

  // 6. Create Active Project (from Presales Project + PMS Template WBS or 23-stage fallback)
  createActiveProjectWithPms: ({
    presaleProject,
    pmsTemplate,
    activePerson,
    startDate,
    targetDate,
    overallRemark,
    customStages
  }) => {
    const list = activeProjectService.getAllActiveProjects();
    const projId = presaleProject.id || presaleProject._id;
    const existingIdx = list.findIndex((p) => String(p.projectId || p.presaleId) === String(projId));
    if (existingIdx !== -1 && customStages && customStages.length > 0) {
      const existingProject = list[existingIdx];
      const updated = calculateProjectRollup({
        ...existingProject,
        activePerson: activePerson || existingProject.activePerson,
        contractSignedDate: startDate || existingProject.contractSignedDate,
        targetCompletionDate: targetDate || existingProject.targetCompletionDate,
        overallRemark: overallRemark !== undefined ? overallRemark : existingProject.overallRemark,
        stages: customStages,
        updatedAt: new Date().toISOString()
      });
      list[existingIdx] = updated;
      localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
      return { project: updated, alreadyExists: false, updated: true };
    } else if (existingIdx !== -1) {
      return { project: list[existingIdx], alreadyExists: true };
    }

    let stagesToUse = [];
    if (Array.isArray(customStages) && customStages.length > 0) {
      stagesToUse = customStages;
    } else if (pmsTemplate && Array.isArray(pmsTemplate.stages) && pmsTemplate.stages.length > 0) {
      stagesToUse = mapPmsStagesToExecutionStages(pmsTemplate.stages, null, []);
    } else {
      stagesToUse = cloneChecklistFromMaster();
    }

    const leadObj = typeof presaleProject.leadId === "object" && presaleProject.leadId !== null ? presaleProject.leadId : {};
    const clientName = presaleProject.clientName || leadObj.clientName || presaleProject.concernPersonName || "Unnamed Client";
    const projectName = presaleProject.projectName || leadObj.projectName || presaleProject.name || "Project Workflow";
    const phone = presaleProject.phoneNumber || presaleProject.phone || leadObj.phoneNumber || "";
    const email = presaleProject.emailAddress || presaleProject.email || leadObj.emailAddress || "";
    const city = presaleProject.city || leadObj.city || "Lucknow";
    const address = presaleProject.address || leadObj.address || `${city}, UP`;
    const workType = presaleProject.workType || leadObj.workType || presaleProject.businessType || "Design + Construction";
    const revenue = presaleProject.expectedBusiness || presaleProject.amount || 0;

    const newProject = calculateProjectRollup({
      id: "PRJ-ACT-" + Math.floor(100 + Math.random() * 900),
      projectId: projId,
      presaleId: projId,
      projectName,
      clientName,
      companyName: presaleProject.companyName || leadObj.companyName || "",
      phone,
      email,
      city,
      address,
      workType,
      engagementScope: presaleProject.workCategory || leadObj.workCategory || "Design + Construction",
      revenue: revenue ? `₹ ${Number(revenue).toLocaleString("en-IN")}` : "₹ 50,00,000",
      contractSignedDate: startDate || new Date().toISOString().split("T")[0],
      targetCompletionDate: targetDate || "",
      activePerson: activePerson || "Er. Amit Kumar (Site Project Manager)",
      projectStatus: "On Track",
      projectSubStatus: pmsTemplate ? "Initialized from PMS Masterdata Template" : "Initialized from 23-Stage Construction Checklist",
      overallRemark: overallRemark || (pmsTemplate ? "Project active with PMS master stages linked." : "Active project created."),
      stages: stagesToUse,
      createdAt: new Date().toISOString()
    });

    const updatedList = [newProject, ...list];
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(updatedList));
    return { project: newProject, alreadyExists: false };
  },

  // 7. Add Daily Site Log Entry to Active Project
  addDailyLog: (projectId, logData) => {
    const list = activeProjectService.getAllActiveProjects();
    const targetIdx = list.findIndex((p) => String(p.id) === String(projectId));
    if (targetIdx === -1) return null;
    const project = list[targetIdx];
    const dailyLogs = Array.isArray(project.dailyLogs) ? project.dailyLogs : [];
    const newLog = {
      id: `LOG-${Date.now()}`,
      date: logData.date || new Date().toISOString().split("T")[0],
      loggedBy: logData.loggedBy || "Site Engineer",
      summary: logData.summary || "",
      stageId: logData.stageId || "",
      stageName: logData.stageName || "",
      workId: logData.workId || "",
      workName: logData.workName || "",
      taskId: logData.taskId || "",
      taskName: logData.taskName || "",
      status: logData.status || "",
      manpowerCount: logData.manpowerCount || "",
      tasksUpdated: logData.tasksUpdated || [],
      photoUrl: logData.photoUrl || "",
      createdAt: new Date().toISOString()
    };
    const updatedProject = calculateProjectRollup({
      ...project,
      dailyLogs: [newLog, ...dailyLogs],
      updatedAt: new Date().toISOString()
    });
    list[targetIdx] = updatedProject;
    localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
    return updatedProject;
  },

  // 8. Synchronize all projects from Presales into Active Projects
  syncWithPresales: (presaleProjects = [], pmsTemplates = [], wbsData = null) => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECTS_STORAGE_KEY);
      let list = [];
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {
          list = [];
        }
      }
      if (!Array.isArray(list)) list = [];

      // Always strip out any dummy seed projects
      list = list.filter(
        (p) =>
          !["PRJ-ACT-101", "PRJ-ACT-102", "PRJ-ACT-103"].includes(p?.id) &&
          p?.clientName !== "Er. Alok Srivastava" &&
          p?.clientName !== "Dr. Sunita Verma" &&
          p?.clientName !== "M/s Royal Heritage Hotel"
      );

      // PMS Template map for quick lookup
      const pmsMap = new Map();
      (pmsTemplates || []).forEach((t) => {
        const pId = t.projectId?._id || t.projectId;
        if (pId) pmsMap.set(String(pId), t);
        const lId = t.leadId?._id || t.leadId;
        if (lId) pmsMap.set(String(lId), t);
        if (t.clientName) pmsMap.set(t.clientName.toLowerCase().trim(), t);
        if (t.projectId?.clientName) pmsMap.set(t.projectId.clientName.toLowerCase().trim(), t);
        if (t.leadId?.clientName) pmsMap.set(t.leadId.clientName.toLowerCase().trim(), t);
        if (t.projectName) pmsMap.set(t.projectName.toLowerCase().trim(), t);
        if (t.projectId?.projectName) pmsMap.set(t.projectId.projectName.toLowerCase().trim(), t);
      });

      let changed = false;

      (presaleProjects || []).forEach((bp) => {
        const leadObj = typeof bp.leadId === "object" && bp.leadId !== null ? bp.leadId : {};
        const projId = String(bp._id || bp.id || leadObj._id || bp.leadId || "");
        if (!projId) return;

        // Find PMS template if available
        let matchedTmpl = null;
        if (pmsMap.has(projId)) matchedTmpl = pmsMap.get(projId);
        else if (bp.leadId && pmsMap.has(String(typeof bp.leadId === "object" ? bp.leadId._id : bp.leadId))) {
          matchedTmpl = pmsMap.get(String(typeof bp.leadId === "object" ? bp.leadId._id : bp.leadId));
        } else if (bp.clientName && pmsMap.has(bp.clientName.toLowerCase().trim())) {
          matchedTmpl = pmsMap.get(bp.clientName.toLowerCase().trim());
        }

        const clientName = bp.clientName || bp.concernPersonName || leadObj.clientName || leadObj.concernPersonName || "Unnamed Client";
        const tmplProjName = matchedTmpl?.projectName || (typeof matchedTmpl?.projectId === "object" ? matchedTmpl?.projectId?.projectName : null);
        const projectName =
          (bp.projectName && bp.projectName.trim()) ||
          tmplProjName ||
          (leadObj.projectName && leadObj.projectName.trim()) ||
          leadObj.projectDetail ||
          "Site Execution";

        const companyName =
          bp.companyName ||
          (typeof matchedTmpl?.projectId === "object" ? matchedTmpl?.projectId?.companyName : null) ||
          leadObj.companyName ||
          "";

        // Clean, human-readable display ID instead of raw 24-hex ObjectId
        const readableLeadCode = leadObj.leadId || bp.projectCode || "";
        const displayId = readableLeadCode ? readableLeadCode : (projId.length === 24 ? `PRJ-${projId.slice(-5).toUpperCase()}` : projId);

        // Check if already in list (Match strictly by projId first)
        const existingIdx = list.findIndex((p) => {
          if (projId && (String(p.id) === projId || String(p.projectId) === projId || String(p.presaleId) === projId)) {
            return true;
          }
          if (
            !projId &&
            p.clientName &&
            clientName &&
            p.clientName.toLowerCase().trim() === clientName.toLowerCase().trim() &&
            p.projectName &&
            projectName &&
            p.projectName.toLowerCase().trim() === projectName.toLowerCase().trim()
          ) {
            return true;
          }
          return false;
        });

        if (existingIdx !== -1) {
          // Existing active project: keep user-modified stages, but update any blank metadata & populate fields
          const existing = list[existingIdx];
          let updatedItem = false;

          existing.displayId = displayId;
          existing.leadIdCode = readableLeadCode || displayId;
          existing.id = projId; // Keep route id consistent

          if (clientName && existing.clientName !== clientName) {
            existing.clientName = clientName;
            updatedItem = true;
          }
          if (tmplProjName && (existing.projectName !== tmplProjName || existing.projectName === "Site Execution" || existing.projectName === "Site Workflow" || existing.projectName === leadObj.projectDetail)) {
            existing.projectName = tmplProjName;
            updatedItem = true;
          } else if (projectName && (!existing.projectName || existing.projectName === "Site Workflow" || existing.projectName === "Site Execution")) {
            existing.projectName = projectName;
            updatedItem = true;
          }
          if (companyName && !existing.companyName) {
            existing.companyName = companyName;
            updatedItem = true;
          }
          if (!existing.phone && (bp.phoneNumber || bp.contactNo || leadObj.phoneNumber)) {
            existing.phone = bp.phoneNumber || bp.contactNo || leadObj.phoneNumber;
            updatedItem = true;
          }
          if (!existing.city && (bp.city || leadObj.city)) {
            existing.city = bp.city || leadObj.city;
            updatedItem = true;
          }
          if (!existing.projectId) {
            existing.projectId = projId;
            updatedItem = true;
          }

          // Stage & Task Repair / Synchronization with PMS Template (including fieldData)
          if (matchedTmpl && Array.isArray(matchedTmpl.stages) && matchedTmpl.stages.length > 0) {
            existing.stages = mapPmsStagesToExecutionStages(matchedTmpl.stages, wbsData, existing.stages);
            updatedItem = true;
          } else if (!matchedTmpl && !existing.trackerData) {
            if (Array.isArray(existing.stages) && existing.stages.length > 0) {
              existing.stages = [];
              updatedItem = true;
            }
          } else if (hasCorruptedStageIds(existing.stages)) {
            existing.stages = repairCorruptedStages(existing.stages, wbsData);
            updatedItem = true;
          }

          if (updatedItem) {
            list[existingIdx] = calculateProjectRollup(existing);
            changed = true;
          }
        } else {
          // Not in list yet: create new active project entry
          let stagesToUse = [];
          if (matchedTmpl && Array.isArray(matchedTmpl.stages) && matchedTmpl.stages.length > 0) {
            stagesToUse = mapPmsStagesToExecutionStages(matchedTmpl.stages, wbsData, []);
          } else {
            // Keep empty until PMS template is created
            stagesToUse = [];
          }

          const phone = bp.phoneNumber || bp.contactNo || bp.whatsappNumber || leadObj.phoneNumber || "";
          const email = bp.emailAddress || bp.email || leadObj.emailAddress || "";
          const city = bp.city || leadObj.city || "Lucknow";
          const address = bp.address || leadObj.address || `${city}, UP`;
          const wType = Array.isArray(bp.workType) ? bp.workType.join(", ") : (bp.workType || bp.workCategory || bp.businessType || "Design + Construction");
          const revVal = Number(bp.expectedBusiness || bp.amount || bp.expectedRevenue || 0);

          const newProj = calculateProjectRollup({
            id: projId,
            projectId: projId,
            presaleId: projId,
            leadId: leadObj._id || (typeof bp.leadId === "string" ? bp.leadId : projId),
            displayId,
            leadIdCode: readableLeadCode || displayId,
            clientName,
            projectName,
            companyName,
            phone,
            email,
            city,
            address,
            workType: wType,
            revenue: revVal > 0 ? `₹ ${revVal.toLocaleString("en-IN")}` : "₹ 0",
            activePerson: bp.assignedTo || bp.salesPerson || leadObj.salesPerson || "Admin",
            contractSignedDate: bp.createdAt ? new Date(bp.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
            projectStatus: "On Track",
            projectSubStatus: "Site Handover",
            overallRemark: bp.transferRemark || bp.salesRemarks || "Presales project synchronized for execution tracking.",
            stages: stagesToUse,
            createdAt: bp.createdAt || new Date().toISOString()
          });

          list.push(newProj);
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem(ACTIVE_PROJECTS_STORAGE_KEY, JSON.stringify(list));
      }

      return list.map((p) => calculateProjectRollup(p));
    } catch (err) {
      console.error("Error syncing active projects with presales:", err);
      return activeProjectService.getAllActiveProjects();
    }
  }
};

/**
 * Checks if a project has an existing PMS Masterdata Template created
 */
export const isPmsMasterdataCreated = (row, allTemplates = []) => {
  if (!row) return false;
  const rowId = String(row.projectId || row.presaleId || row.id || row._id || "");
  const rowLeadId = String(
    (typeof row.leadId === "object" ? row.leadId?._id : row.leadId) || ""
  );
  const rowClientName = (row.clientName || "").toLowerCase().trim();
  const rowProjectName = (row.projectName || "").toLowerCase().trim();

  return (allTemplates || []).some((t) => {
    if (!t) return false;

    const tProjId = String(
      (typeof t.projectId === "object" ? t.projectId?._id : t.projectId) ||
      (typeof t.selectedProject === "object" ? t.selectedProject?._id : t.selectedProject) ||
      ""
    );
    const tLeadId = String(
      (typeof t.leadId === "object" ? t.leadId?._id : t.leadId) || ""
    );
    const tClientName = (
      (typeof t.projectId === "object" ? t.projectId?.clientName : null) ||
      (typeof t.leadId === "object" ? t.leadId?.clientName : null) ||
      t.clientName ||
      ""
    ).toLowerCase().trim();

    const tProjectName = (
      (typeof t.projectId === "object" ? t.projectId?.projectName : null) ||
      t.projectName ||
      ""
    ).toLowerCase().trim();

    // 1. Direct ID match
    if (rowId && (rowId === tProjId || rowId === tLeadId)) return true;
    if (rowLeadId && (rowLeadId === tProjId || rowLeadId === tLeadId)) return true;

    // 2. Both client name and project name match
    if (
      rowClientName &&
      rowClientName !== "unnamed client" &&
      rowClientName === tClientName &&
      rowProjectName &&
      rowProjectName !== "site workflow" &&
      rowProjectName === tProjectName
    ) {
      return true;
    }

    // 3. Distinctive Client name match
    if (
      rowClientName &&
      rowClientName !== "unnamed client" &&
      rowClientName === tClientName
    ) {
      return true;
    }

    return false;
  });
};

export default activeProjectService;
