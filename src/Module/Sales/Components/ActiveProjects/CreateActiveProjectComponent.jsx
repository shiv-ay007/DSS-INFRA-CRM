import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaBuilding,
  FaCheckCircle,
  FaHardHat,
  FaSpinner,
  FaCalendarAlt,
  FaUserTie,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFileContract,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaSearch,
  FaSave,
  FaClock,
  FaTools,
  FaLayerGroup,
  FaClipboardList
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import pmsTemplateService from "../../services/pmsTemplateService";
import activeProjectService, { cloneChecklistFromMaster, mapPmsStagesToExecutionStages, isObjectId } from "../../services/activeProjectService";
import { contractorService } from "../../services/contractorService";

// Fallback contractors list
const FALLBACK_CONTRACTORS = [
  "Apex Civil Infratech Pvt Ltd",
  "National Shuttering & Scaffolding Works",
  "Modern Bar Binders & Steel Works",
  "Krishna Excavators & Earthmovers",
  "Reliable MEP & Plumbing Solutions",
  "UltraTech Cement Masonry Team",
  "Shree Ram Tiles & Flooring Works"
];

const CreateActiveProjectComponent = () => {
  const navigate = useNavigate();

  // Auxiliary data states
  const [loadingAux, setLoadingAux] = useState(true);
  const [rawPresales, setRawPresales] = useState([]);
  const [pmsTemplates, setPmsTemplates] = useState([]);
  const [contractorsList, setContractorsList] = useState(FALLBACK_CONTRACTORS);

  // Form selection states
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Site Operations & Leadership
  const [assignedActivePerson, setAssignedActivePerson] = useState("Er. Amit Kumar (Site Project Manager)");
  const [projectOverallStatus, setProjectOverallStatus] = useState("On Track");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().split("T")[0];
  });
  const [projectRemarks, setProjectRemarks] = useState("");

  // Tracking Stages, Works & Tasks State
  const [stagesData, setStagesData] = useState([]);
  const [expandedStages, setExpandedStages] = useState({});
  const [stageFilter, setStageFilter] = useState("ALL"); // "ALL", "NOT_STARTED", "IN_PROGRESS", "COMPLETED"
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load Presales, PMS Templates & Contractors
  useEffect(() => {
    const loadAuxData = async () => {
      setLoadingAux(true);
      try {
        const [presalesRes, pmsRes, contrRes] = await Promise.allSettled([
          getAllLeadProjectsApi(),
          pmsTemplateService.getAllTemplates({ limit: 1000 }),
          contractorService.getAllContractors({ limit: 200 })
        ]);

        if (presalesRes.status === "fulfilled") {
          const raw =
            presalesRes.value?.data?.projects ||
            presalesRes.value?.projects ||
            (Array.isArray(presalesRes.value?.data) ? presalesRes.value.data : []);
          if (Array.isArray(raw)) setRawPresales(raw);
        }

        if (pmsRes.status === "fulfilled") {
          const rawTmpl = pmsRes.value?.data?.data || pmsRes.value?.data || [];
          if (Array.isArray(rawTmpl)) setPmsTemplates(rawTmpl);
        }

        if (contrRes.status === "fulfilled") {
          const items = contrRes.value?.data?.data || contrRes.value?.data || [];
          if (Array.isArray(items) && items.length > 0) {
            const names = items.map((c) => c.contractorName || c.name).filter(Boolean);
            if (names.length > 0) {
              setContractorsList((prev) => Array.from(new Set([...names, ...prev])));
            }
          }
        }
      } catch (err) {
        console.warn("Could not load auxiliary presales and PMS templates:", err);
      } finally {
        setLoadingAux(false);
      }
    };
    loadAuxData();
  }, []);

  // Map of PMS Templates by ID, clientName, projectName
  const pmsTemplateMap = useMemo(() => {
    const map = new Map();
    (pmsTemplates || []).forEach((t) => {
      const pId = t.projectId?._id || t.projectId;
      if (pId) map.set(String(pId), t);
      const lId = t.leadId?._id || t.leadId;
      if (lId) map.set(String(lId), t);
      if (t.clientName) map.set(t.clientName.toLowerCase().trim(), t);
      if (t.projectName) map.set(t.projectName.toLowerCase().trim(), t);
    });
    return map;
  }, [pmsTemplates]);

  // Clients grouped from Presales API
  const presalesClients = useMemo(() => {
    const map = new Map();
    (rawPresales || []).forEach((item) => {
      const leadObj = typeof item.leadId === "object" && item.leadId !== null ? item.leadId : {};
      const clientId = String(leadObj._id || item.leadId || item._id || Math.random());
      const clientName = leadObj.clientName || item.clientName || item.concernPersonName || "Unnamed Client";
      const phone = leadObj.phoneNumber || item.phoneNumber || item.phone || "";
      const email = leadObj.emailAddress || item.emailAddress || item.email || "";
      const city = leadObj.city || item.city || "Lucknow";
      const address = leadObj.address || item.address || "";

      if (!map.has(clientId)) {
        map.set(clientId, {
          clientId,
          clientName,
          phone,
          email,
          city,
          address,
          projects: []
        });
      }
      map.get(clientId).projects.push(item);
    });
    return Array.from(map.values());
  }, [rawPresales]);

  // Selected Client and Project
  const currentClient = useMemo(() => {
    return presalesClients.find((c) => c.clientId === selectedClientId);
  }, [presalesClients, selectedClientId]);

  const currentProject = useMemo(() => {
    if (!currentClient) return null;
    return currentClient.projects.find(
      (p) => String(p.id || p._id) === String(selectedProjectId)
    );
  }, [currentClient, selectedProjectId]);

  // Find linked PMS Template for Selected Project
  const currentProjectPmsTemplate = useMemo(() => {
    if (!currentProject) return null;
    const pId = currentProject.id || currentProject._id;
    if (pId && pmsTemplateMap.has(String(pId))) {
      return pmsTemplateMap.get(String(pId));
    }
    const leadId = currentProject.leadId?._id || currentProject.leadId;
    if (leadId && pmsTemplateMap.has(String(leadId))) {
      return pmsTemplateMap.get(String(leadId));
    }
    if (currentClient?.clientName && pmsTemplateMap.has(currentClient.clientName.toLowerCase().trim())) {
      return pmsTemplateMap.get(currentClient.clientName.toLowerCase().trim());
    }
    const pName = currentProject.projectName || currentProject.name;
    if (pName && pmsTemplateMap.has(pName.toLowerCase().trim())) {
      return pmsTemplateMap.get(pName.toLowerCase().trim());
    }
    return null;
  }, [currentProject, currentClient, pmsTemplateMap]);

  // When Client / Project is selected, Auto-populate Stages, Works & Tasks!
  useEffect(() => {
    if (!currentProject) {
      setStagesData([]);
      setExpandedStages({});
      return;
    }

    let loadedStages = [];

    if (currentProjectPmsTemplate && Array.isArray(currentProjectPmsTemplate.stages) && currentProjectPmsTemplate.stages.length > 0) {
      // Map from PMS Template Master Structure cleanly using normalizer
      loadedStages = mapPmsStagesToExecutionStages(currentProjectPmsTemplate.stages, null, []);
    } else {
      // Auto-populate with Standard 23-Stage Construction Checklist
      const baseChecklist = cloneChecklistFromMaster();
      loadedStages = baseChecklist.map((s) => ({
        ...s,
        completedWorksCount: 0,
        totalWorksCount: (s.works || []).length,
        completedTasksCount: 0,
        totalTasksCount: (s.works || []).reduce((sum, w) => sum + (w.tasks || []).length, 0),
        progressPercent: 0
      }));
    }

    setStagesData(loadedStages);

    // Auto-expand first 2 stages
    const initialExp = {};
    if (loadedStages.length > 0) initialExp[loadedStages[0].stageId] = true;
    if (loadedStages.length > 1) initialExp[loadedStages[1].stageId] = true;
    setExpandedStages(initialExp);
  }, [currentProject, currentProjectPmsTemplate]);

  // Toggle stage accordion
  const toggleStage = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const expandAll = () => {
    const all = {};
    stagesData.forEach((s) => {
      all[s.stageId] = true;
    });
    setExpandedStages(all);
  };

  const collapseAll = () => {
    setExpandedStages({});
  };

  // Update specific task field (status, contractor, deadline, remark)
  const handleTaskChange = (stageId, workId, taskId, field, value) => {
    setStagesData((prevStages) =>
      prevStages.map((s) => {
        if (s.stageId !== stageId) return s;

        const updatedWorks = (s.works || []).map((w) => {
          if (w.workId !== workId) return w;

          const updatedTasks = (w.tasks || []).map((t) => {
            if (t.taskId !== taskId) return t;
            return { ...t, [field]: value };
          });

          const totalWTasks = updatedTasks.length;
          const completedWTasks = updatedTasks.filter((t) => t.status === "Completed").length;
          let wStatus = "Not Started";
          if (totalWTasks > 0 && completedWTasks === totalWTasks) {
            wStatus = "Completed";
          } else if (completedWTasks > 0 || updatedTasks.some((t) => t.status === "In Progress")) {
            wStatus = "In Progress";
          }

          return {
            ...w,
            status: wStatus,
            completedTasksCount: completedWTasks,
            totalTasksCount: totalWTasks,
            tasks: updatedTasks
          };
        });

        const allTasks = updatedWorks.flatMap((w) => w.tasks || []);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.status === "Completed").length;
        const completedWorks = updatedWorks.filter((w) => w.status === "Completed").length;

        let sStatus = "Not Started";
        if (totalTasks > 0 && completedTasks === totalTasks) {
          sStatus = "Completed";
        } else if (completedTasks > 0 || updatedWorks.some((w) => w.status === "In Progress")) {
          sStatus = "In Progress";
        }

        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...s,
          status: sStatus,
          progressPercent,
          completedWorksCount: completedWorks,
          totalWorksCount: updatedWorks.length,
          completedTasksCount: completedTasks,
          totalTasksCount: totalTasks,
          works: updatedWorks
        };
      })
    );
  };

  // Change entire stage status (e.g. mark stage as Completed or In Progress)
  const handleStageStatusChange = (stageId, newStatus) => {
    setStagesData((prevStages) =>
      prevStages.map((s) => {
        if (s.stageId !== stageId) return s;

        const updatedWorks = (s.works || []).map((w) => {
          const updatedTasks = (w.tasks || []).map((t) => ({
            ...t,
            status: newStatus === "Completed" ? "Completed" : newStatus === "Not Started" ? "Not Started" : t.status
          }));
          const totalWTasks = updatedTasks.length;
          const completedWTasks = updatedTasks.filter((t) => t.status === "Completed").length;
          return {
            ...w,
            status: newStatus === "Completed" ? "Completed" : newStatus === "Not Started" ? "Not Started" : w.status,
            completedTasksCount: completedWTasks,
            totalTasksCount: totalWTasks,
            tasks: updatedTasks
          };
        });

        const allTasks = updatedWorks.flatMap((w) => w.tasks || []);
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter((t) => t.status === "Completed").length;
        const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...s,
          status: newStatus,
          progressPercent,
          completedWorksCount: updatedWorks.filter((w) => w.status === "Completed").length,
          totalWorksCount: updatedWorks.length,
          completedTasksCount: completedTasks,
          totalTasksCount: totalTasks,
          works: updatedWorks
        };
      })
    );
  };

  // Overall Statistics Rollup
  const overallStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgTasks = 0;
    let totalWorks = 0;
    let completedWorks = 0;
    let totalStages = stagesData.length;
    let completedStages = 0;

    stagesData.forEach((s) => {
      if (s.status === "Completed") completedStages += 1;
      (s.works || []).forEach((w) => {
        totalWorks += 1;
        if (w.status === "Completed") completedWorks += 1;
        (w.tasks || []).forEach((t) => {
          totalTasks += 1;
          if (t.status === "Completed") completedTasks += 1;
          else if (t.status === "In Progress") inProgTasks += 1;
        });
      });
    });

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalStages,
      completedStages,
      totalWorks,
      completedWorks,
      totalTasks,
      completedTasks,
      inProgTasks,
      overallProgress
    };
  }, [stagesData]);

  // Filtered Stages by Search & Status Filter
  const filteredStages = useMemo(() => {
    return stagesData.filter((stg) => {
      if (stageFilter === "COMPLETED" && stg.status !== "Completed") return false;
      if (stageFilter === "IN_PROGRESS" && stg.status !== "In Progress") return false;
      if (stageFilter === "NOT_STARTED" && stg.status !== "Not Started") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const stageMatch = stg.stageName.toLowerCase().includes(q) || stg.stageId.toLowerCase().includes(q);
        const workOrTaskMatch = (stg.works || []).some(
          (w) =>
            w.workName.toLowerCase().includes(q) ||
            w.workId.toLowerCase().includes(q) ||
            (w.tasks || []).some((t) => t.taskName.toLowerCase().includes(q) || t.taskId.toLowerCase().includes(q))
        );
        return stageMatch || workOrTaskMatch;
      }
      return true;
    });
  }, [stagesData, stageFilter, searchQuery]);

  // Save Project Execution Tracking
  const handleSaveActiveProject = (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      toast.error("Please select a Presales Client.");
      return;
    }
    if (!selectedProjectId) {
      toast.error("Please select a Project.");
      return;
    }

    setSubmitting(true);
    try {
      const res = activeProjectService.createActiveProjectWithPms(
        currentProject,
        currentProjectPmsTemplate,
        {
          activePerson: assignedActivePerson,
          projectStatus: projectOverallStatus,
          startDate,
          targetDate,
          overallRemark: projectRemarks,
          customStages: stagesData
        }
      );

      toast.success(
        res.updated
          ? `Active Project execution tracking updated for "${res.project.clientName}"!`
          : `Active Project created & initialized with tracked stages for "${res.project.clientName}"!`
      );
      navigate(`/sales/active-projects/${res.project.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save active project tracking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 font-sans max-w-6xl mx-auto">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => navigate("/sales/active-projects")}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10 mt-0.5"
              title="Back to Active Projects"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center shrink-0">
              <FaHardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Active Project Execution & Tracking Form
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3 text-cyan-300" /> WBS Site Tracking
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-1 font-normal">
                Auto-fills Presales client details and project stages/works/tasks from PMS template. Track daily execution below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigate("/sales/active-projects")}
              className="px-4 py-2 border border-white/20 rounded-xl text-xs font-bold text-indigo-100 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveActiveProject}
              disabled={submitting || !selectedProjectId}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-950/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-3.5 h-3.5" />
                  <span>Save & Track Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 1: PRESALES CLIENT & PROJECT SELECTION ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FaFileContract className="text-indigo-600 w-3.5 h-3.5" />
              <span>1. Select Presales Client & Project</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Client details & specifications are auto-loaded from Presales contract.
            </p>
          </div>
          {loadingAux && (
            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1.5">
              <FaSpinner className="w-3 h-3 animate-spin" />
              <span>Loading presales data...</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Client Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Presales Client <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={selectedClientId}
              onChange={(e) => {
                const cId = e.target.value;
                setSelectedClientId(cId);
                const foundClient = presalesClients.find((c) => c.clientId === cId);
                if (foundClient && foundClient.projects.length > 0) {
                  setSelectedProjectId(String(foundClient.projects[0].id || foundClient.projects[0]._id));
                } else {
                  setSelectedProjectId("");
                }
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer transition-all"
            >
              <option value="">-- Choose Client --</option>
              {presalesClients.map((c) => (
                <option key={c.clientId} value={c.clientId}>
                  {c.clientName} ({c.projects.length} {c.projects.length === 1 ? "Project" : "Projects"})
                </option>
              ))}
            </select>
          </div>

          {/* Project Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Project Details <span className="text-red-500">*</span>
            </label>
            <select
              required
              disabled={!currentClient}
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:bg-slate-100 cursor-pointer transition-all"
            >
              <option value="">-- Choose Project --</option>
              {(currentClient?.projects || []).map((p, idx) => {
                const pId = p.id || p._id || `proj_${idx}`;
                const pName = p.projectName || p.name || `Project #${idx + 1}`;
                const wt = p.workType || p.businessType || "";
                return (
                  <option key={pId} value={pId}>
                    {pName} {wt ? `(${wt})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Auto-filled Presales Profile Card */}
        {currentProject && (
          <div className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FaBuilding className="text-indigo-600 w-4 h-4" />
                {currentProject.projectName || currentProject.name || "Project Workflow"}
              </span>
              <span className="font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-xs w-fit">
                Budget: ₹{Number(currentProject.expectedBusiness || currentProject.amount || 0).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Client Name:</span>
                <strong className="text-slate-800 text-xs">{currentClient?.clientName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Phone Contact:</span>
                <strong className="text-slate-800 text-xs">{currentClient?.phone || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Email Address:</span>
                <strong className="text-slate-800 text-xs truncate block">{currentClient?.email || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Location:</span>
                <strong className="text-slate-800 text-xs">{currentProject.city || currentClient?.city || "Lucknow"}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Work Category:</span>
                <strong className="text-slate-800 text-xs">{currentProject.workCategory || "Civil Works"}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block text-[11px]">Work Type:</span>
                <strong className="text-slate-800 text-xs">{currentProject.workType || "Design + Construction"}</strong>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-400 font-medium block text-[11px]">Site Address:</span>
                <span className="font-semibold text-slate-800 text-xs truncate block">
                  {currentProject.address || currentClient?.address || "Address as per Presales"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= SECTION 2: SITE OPERATIONS & SCHEDULE ================= */}
      {currentProject && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FaUserTie className="text-indigo-600 w-3.5 h-3.5" />
              <span>2. Site Management & Operations Setup</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign responsible site lead engineer and project milestone timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Site Incharge */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Assigned Site Incharge (Site Lead) <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={assignedActivePerson}
                onChange={(e) => setAssignedActivePerson(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer"
              >
                <option value="Er. Amit Kumar (Site Project Manager)">Er. Amit Kumar (Site Project Manager)</option>
                <option value="Er. Rajesh Singh (Sr. Site Engineer)">Er. Rajesh Singh (Sr. Site Engineer)</option>
                <option value="Er. Deepak Mishra (Project Lead)">Er. Deepak Mishra (Project Lead)</option>
                <option value="Er. Vikas Pandey (Civil Engineer)">Er. Vikas Pandey (Civil Engineer)</option>
                <option value="Er. Alok Srivastava (Site Incharge)">Er. Alok Srivastava (Site Incharge)</option>
              </select>
            </div>

            {/* Overall Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Project Overall Status
              </label>
              <select
                value={projectOverallStatus}
                onChange={(e) => setProjectOverallStatus(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white cursor-pointer"
              >
                <option value="On Track">On Track</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Execution Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>

            {/* Target Completion Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Completion Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>

            {/* Remarks */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initial Site Execution Remarks
              </label>
              <input
                type="text"
                value={projectRemarks}
                onChange={(e) => setProjectRemarks(e.target.value)}
                placeholder="e.g. Total station benchmarking done. Barricading & site office setup underway..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: STAGES, WORKS & TASKS EXECUTION TRACKING ================= */}
      {currentProject && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
          {/* Header & Source Notification Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FaClipboardList className="text-indigo-600 w-4 h-4" />
                <span>3. Stages, Works & Tasks Execution Tracking</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Auto-populated from project's PMS template. Track completion status, assigned contractor, and daily work notes.
              </p>
            </div>

            {/* Source Tag */}
            {currentProjectPmsTemplate ? (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 self-start md:self-auto">
                <FaCheckCircle className="text-emerald-600 w-3.5 h-3.5" />
                <span>PMS Master Linked: {currentProjectPmsTemplate.templateName || "Template"}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5 self-start md:self-auto">
                <HiSparkles className="text-blue-600 w-3.5 h-3.5" />
                <span>Standard 23 Construction Stages Blueprint</span>
              </span>
            )}
          </div>

          {/* Summary Progress Bar & Rollup Metrics */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 border border-indigo-100/70 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                  Total Execution Progress:
                </span>
                <span className="text-xl font-black text-indigo-700">
                  {overallStats.overallProgress}%
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-700 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                  {overallStats.completedStages}/{overallStats.totalStages} Stages Done
                </span>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                  {overallStats.completedWorks}/{overallStats.totalWorks} Works Done
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs">
                  {overallStats.completedTasks}/{overallStats.totalTasks} Tasks Done
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallStats.overallProgress}%` }}
              />
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="relative max-w-sm w-full">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stage, work or task..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-lg text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setStageFilter("ALL")}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    stageFilter === "ALL" ? "bg-white text-indigo-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({stagesData.length})
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
                  Completed
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[11px] font-bold cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* STAGES LIST ACCORDION */}
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {filteredStages.map((stage) => {
              const isExpanded = Boolean(expandedStages[stage.stageId]);
              const isDone = stage.status === "Completed";
              const isInProg = stage.status === "In Progress";

              return (
                <div key={stage.stageId} className="bg-white">
                  {/* Stage Accordion Header */}
                  <div
                    className={`px-4 py-3.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isDone
                        ? "bg-emerald-50/50 hover:bg-emerald-50/80"
                        : isInProg
                        ? "bg-indigo-50/40 hover:bg-indigo-50/70"
                        : "hover:bg-slate-50"
                    }`}
                    onClick={() => toggleStage(stage.stageId)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          isDone
                            ? "bg-emerald-600 text-white"
                            : isInProg
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isDone ? <FaCheck className="w-3 h-3" /> : stage.stageId}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {stage.stageId}: {stage.stageName}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isDone
                                ? "bg-emerald-100 text-emerald-800"
                                : isInProg
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {stage.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap font-medium">
                          <span>{stage.completedWorksCount || 0} / {(stage.works || []).length} Works Completed</span>
                          <span>•</span>
                          <span>{stage.completedTasksCount || 0} / {stage.totalTasksCount || 0} Tasks Done</span>
                          <span>•</span>
                          <span className="font-bold text-indigo-700">{stage.progressPercent || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage Status Selector & Controls */}
                    <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={stage.status}
                        onChange={(e) => handleStageStatusChange(stage.stageId, e.target.value)}
                        className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
                      >
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => toggleStage(stage.stageId)}
                        className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {isExpanded ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                      </button>
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
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                  {work.workId}
                                </span>
                                <h5 className="font-extrabold text-slate-800 text-xs sm:text-sm">
                                  {work.workName}
                                </h5>
                              </div>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  isWorkDone
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                }`}
                              >
                                {work.completedTasksCount || 0}/{(work.tasks || []).length} Tasks Done
                              </span>
                            </div>

                            {/* Tasks Under this Work */}
                            <div className="space-y-2.5">
                              {(work.tasks || []).map((task) => {
                                const isTaskDone = task.status === "Completed";
                                const isTaskInProg = task.status === "In Progress";

                                return (
                                  <div
                                    key={task.taskId}
                                    className={`p-3 rounded-xl border transition-all ${
                                      isTaskDone
                                        ? "bg-emerald-50/30 border-emerald-200"
                                        : isTaskInProg
                                        ? "bg-blue-50/30 border-blue-200"
                                        : "bg-slate-50/50 border-slate-200"
                                    }`}
                                  >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                      {/* Task Title */}
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-mono text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                            {task.taskId}
                                          </span>
                                          <span className="font-extrabold text-xs text-slate-900">
                                            {task.taskName}
                                          </span>
                                        </div>

                                        {/* Contractor & Deadline selectors */}
                                        <div className="flex items-center gap-3 mt-2 flex-wrap text-xs text-slate-600">
                                          {/* Contractor Assignment */}
                                          <div className="flex items-center gap-1.5">
                                            <FaHardHat className="w-3 h-3 text-amber-500 shrink-0" />
                                            <input
                                              type="text"
                                              list={`contractors-${work.workId}`}
                                              value={task.assignedContractor || ""}
                                              onChange={(e) =>
                                                handleTaskChange(stage.stageId, work.workId, task.taskId, "assignedContractor", e.target.value)
                                              }
                                              placeholder="Assign Contractor..."
                                              className="px-2 py-1 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 w-48"
                                            />
                                            <datalist id={`contractors-${work.workId}`}>
                                              {contractorsList.map((c) => (
                                                <option key={c} value={c} />
                                              ))}
                                            </datalist>
                                          </div>

                                          {/* Target Deadline */}
                                          <div className="flex items-center gap-1.5">
                                            <FaCalendarAlt className="w-3 h-3 text-indigo-500 shrink-0" />
                                            <input
                                              type="date"
                                              value={task.deadlineDate || ""}
                                              onChange={(e) =>
                                                handleTaskChange(stage.stageId, work.workId, task.taskId, "deadlineDate", e.target.value)
                                              }
                                              className="px-2 py-0.5 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Task Status Toggles */}
                                      <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shrink-0 self-start lg:self-auto">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleTaskChange(stage.stageId, work.workId, task.taskId, "status", "Not Started")
                                          }
                                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                            task.status === "Not Started"
                                              ? "bg-slate-700 text-white shadow-xs"
                                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                                          }`}
                                        >
                                          Not Started
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleTaskChange(stage.stageId, work.workId, task.taskId, "status", "In Progress")
                                          }
                                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                                            isTaskInProg
                                              ? "bg-blue-600 text-white shadow-xs"
                                              : "text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                          }`}
                                        >
                                          In Progress
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleTaskChange(stage.stageId, work.workId, task.taskId, "status", "Completed")
                                          }
                                          className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                            isTaskDone
                                              ? "bg-emerald-600 text-white shadow-xs"
                                              : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
                                          }`}
                                        >
                                          <FaCheck className="w-2.5 h-2.5" />
                                          <span>Completed</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Work Done Remarks / Notes */}
                                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-2">
                                      <FaClipboardList className="w-3 h-3 text-slate-300 shrink-0" />
                                      <input
                                        type="text"
                                        value={task.remark || ""}
                                        onChange={(e) =>
                                          handleTaskChange(stage.stageId, work.workId, task.taskId, "remark", e.target.value)
                                        }
                                        placeholder="Work execution notes, delay reason, or inspection point..."
                                        className="w-full text-xs text-slate-700 bg-transparent placeholder:text-slate-300 focus:outline-none"
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
      )}

      {/* ================= ACTION FOOTER BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between gap-3 sticky bottom-4 z-20">
        <button
          type="button"
          onClick={() => navigate("/sales/active-projects")}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleSaveActiveProject}
          disabled={submitting || !selectedProjectId}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-950/25 cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {submitting ? (
            <>
              <FaSpinner className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Project Tracking...</span>
            </>
          ) : (
            <>
              <FaSave className="w-3.5 h-3.5" />
              <span>Save & Track Active Project</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateActiveProjectComponent;
