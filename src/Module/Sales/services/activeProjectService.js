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

// Seed Active Projects for realistic instant testing
export const SEED_ACTIVE_PROJECTS = [
  {
    id: "PRJ-ACT-101",
    presaleId: "PRESALE-101",
    clientName: "Er. Alok Srivastava",
    phone: "9876543210",
    email: "alok.srivastava@gmail.com",
    city: "Lucknow",
    address: "Plot 42, Gomti Nagar Extension, Lucknow, UP",
    workType: "Commercial & Residential Duplex",
    engagementScope: "Design + Construction",
    revenue: "₹ 85,00,000",
    contractSignedDate: "2025-02-15",
    activePerson: "Er. Amit Kumar (Site Project Manager)",
    projectStatus: "On Track", // On Track / Delayed / On Hold / Completed
    projectSubStatus: "Excavation & PCC Bed Underway",
    overallRemark: "Excavation completed up to 1.5m. PCC casting scheduled for tomorrow morning.",
    createdAt: new Date().toISOString()
  },
  {
    id: "PRJ-ACT-102",
    presaleId: "PRESALE-102",
    clientName: "Dr. Sunita Verma",
    phone: "9834211099",
    email: "sunita.verma@apollo.org",
    city: "Kanpur",
    address: "Civil Lines, Near Mall Road, Kanpur",
    workType: "Luxury Villa (G+2)",
    engagementScope: "Design + Construction",
    revenue: "₹ 1,20,00,000",
    contractSignedDate: "2025-01-20",
    activePerson: "Er. Rajesh Singh (Sr. Site Engineer)",
    projectStatus: "Delayed",
    projectSubStatus: "Plinth beam rebar delayed by unseasonal rain",
    overallRemark: "Rainwater draining completed. Bar binders back on site. Catching up in 3 days.",
    createdAt: new Date().toISOString()
  },
  {
    id: "PRJ-ACT-103",
    presaleId: "PRESALE-103",
    clientName: "M/s Royal Heritage Hotel",
    phone: "9450123880",
    email: "gm@royalheritage.in",
    city: "Varanasi",
    address: "Sigra - Cantt Road, Varanasi, UP",
    workType: "Boutique Hotel & Banquet",
    engagementScope: "Design + Construction",
    revenue: "₹ 2,40,00,000",
    contractSignedDate: "2024-11-10",
    activePerson: "Er. Deepak Mishra (Project Lead)",
    projectStatus: "In Progress",
    projectSubStatus: "First Floor Slab Concreting Completed",
    overallRemark: "Slab pond curing in progress. Internal brickwork started on Ground Floor.",
    createdAt: new Date().toISOString()
  }
];

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

    return {
      ...stage,
      status: stageStatus,
      progressPercent: stageProgressPercent,
      completedTasksCount: stageCompletedTasks,
      totalTasksCount: stageTotalTasks,
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
 * Active Project Service Methods
 */
export const activeProjectService = {
  // 1. Get All Active Projects with roll-up computations
  getAllActiveProjects: () => {
    try {
      const stored = localStorage.getItem(ACTIVE_PROJECTS_STORAGE_KEY);
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }

      if (!Array.isArray(list) || list.length === 0) {
        // Initialize seed projects with cloned checklists
        list = SEED_ACTIVE_PROJECTS.map((p, idx) => {
          const cloned = cloneChecklistFromMaster();
          // Simulate some progress on seed projects
          if (idx === 0) {
            // Project 1: First 2 stages partially done
            if (cloned[0]?.works?.[0]?.tasks?.[0]) cloned[0].works[0].tasks[0].status = "Completed";
            if (cloned[0]?.works?.[0]?.tasks?.[1]) cloned[0].works[0].tasks[1].status = "Completed";
            if (cloned[0]?.works?.[1]?.tasks?.[0]) cloned[0].works[1].tasks[0].status = "In Progress";
          } else if (idx === 1) {
            // Project 2: Stage 1 complete, Stage 2 delayed
            if (cloned[0]) {
              cloned[0].works.forEach(w => w.tasks.forEach(t => { t.status = "Completed"; }));
            }
            if (cloned[1]?.works?.[0]?.tasks?.[0]) {
              cloned[1].works[0].tasks[0].status = "In Progress";
              cloned[1].works[0].tasks[0].deadlineDate = "2025-01-01"; // overdue!
            }
          } else if (idx === 2) {
            // Project 3: First 12 stages done
            for (let s = 0; s < 12; s++) {
              if (cloned[s]) {
                cloned[s].works.forEach(w => w.tasks.forEach(t => { t.status = "Completed"; }));
              }
            }
          }
          return {
            ...p,
            stages: cloned
          };
        });

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
  getActiveProjectById: (id) => {
    const list = activeProjectService.getAllActiveProjects();
    const found = list.find((p) => String(p.id) === String(id));
    return found ? calculateProjectRollup(found) : null;
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
  }
};

export default activeProjectService;
