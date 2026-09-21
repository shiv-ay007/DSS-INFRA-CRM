import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  FaFileContract, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaEdit, 
  FaClock, 
  FaLayerGroup, 
  FaCheckCircle, 
  FaRegFolderOpen,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaTimes,
  FaTasks
} from "react-icons/fa";
import { HiOutlineTemplate } from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";
import pmsTemplateService from "../../../services/pmsTemplateService";
import pmsWbsService from "../../../services/pmsWbsService";
import { PMS_TASKS_STORAGE_KEY, PMS_TEMPLATES_STORAGE_KEY } from "./CreatePmsTemplateComponent";
import { useAuth } from "../../../../../context/AuthContext";

export const DEFAULT_INITIAL_TEMPLATES = [
  {
    id: "DEFAULT-01",
    code: "PMS-RES-01",
    task: "PMS-RES-01",
    clientName: "Rajesh Sharma",
    phoneNumber: "+91 98765 43210",
    emailAddress: "rajesh.sharma@example.com",
    projectDetails: "Luxury Villa Construction Template",
    category: "Residential",
    projectType: "Full Turnkey Construction",
    milestones: 7,
    tasksCount: 38,
    duration: "24 Weeks",
    budgetTier: "Luxury",
    status: "Active",
    workWillDoneBy: "Civil Contractor",
    materialRequired: "Cement, TMT Steel, Sand",
    supplierName: "Ultratech Cement",
    description: "End-to-end milestone workflow from foundation excavation to luxury interior handover.",
    createdDate: "2025-01-15"
  },
  {
    id: "DEFAULT-02",
    code: "PMS-COM-02",
    task: "PMS-COM-02",
    clientName: "DLF Corporate Park",
    phoneNumber: "+91 98112 34567",
    emailAddress: "dlf.infra@dlf.in",
    projectDetails: "Commercial Office Fitout Standard",
    category: "Commercial",
    projectType: "Interior Fitout & Joinery",
    milestones: 5,
    tasksCount: 26,
    duration: "12 Weeks",
    budgetTier: "Premium",
    status: "Active",
    workWillDoneBy: "Interior Contractor",
    materialRequired: "Modular Panels, Toughened Glass",
    supplierName: "Saint Gobain",
    description: "Standard corporate turnkey workspace execution, HVAC, networking & aesthetic fitout.",
    createdDate: "2025-02-04"
  }
];

const categories = ["All", "Residential", "Commercial", "Infrastructure", "Interior Turnkey", "Industrial"];

const PmsTemplateComponent = () => {
  const navigate = useNavigate();
  const { role, isObserver, user } = useAuth();
  const currentRole = role || user?.role || localStorage.getItem("role") || "";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorkType, setSelectedWorkType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch Templates from Backend API (with local storage fallback)
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // 1. Fetch live templates and WBS masters concurrently
      const [templatesRes, stagesRes, worksRes, tasksRes] = await Promise.allSettled([
        pmsTemplateService.getAllTemplates(),
        pmsWbsService.getStagesPaginated({ limit: 1000 }),
        pmsWbsService.getWorksPaginated({ limit: 1000 }),
        pmsWbsService.getTasksPaginated({ limit: 1000 })
      ]);

      let liveTemplates = [];
      if (templatesRes.status === "fulfilled") {
        const apiData = templatesRes.value?.data?.data || templatesRes.value?.data;
        if (Array.isArray(apiData)) liveTemplates = apiData;
      }

      // WBS Masters maps for ObjectId -> Name resolution
      const stageList = stagesRes.status === "fulfilled" ? (stagesRes.value?.data?.data || stagesRes.value?.data || []) : [];
      const workList = worksRes.status === "fulfilled" ? (worksRes.value?.data?.data || worksRes.value?.data || []) : [];
      const taskList = tasksRes.status === "fulfilled" ? (tasksRes.value?.data?.data || tasksRes.value?.data || []) : [];

      const stageMap = new Map();
      stageList.forEach((s) => {
        if (s._id) stageMap.set(String(s._id), s);
        if (s.stage_code) stageMap.set(String(s.stage_code), s);
      });

      const workMap = new Map();
      workList.forEach((w) => {
        if (w._id) workMap.set(String(w._id), w);
        if (w.work_code) workMap.set(String(w.work_code), w);
      });

      const taskMap = new Map();
      taskList.forEach((t) => {
        if (t._id) taskMap.set(String(t._id), t);
        if (t.task_code) taskMap.set(String(t.task_code), t);
      });

      // Also read local storage saved tasks
      let cachedTasks = [];
      try {
        const storedTasks = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed)) cachedTasks = parsed;
        }
      } catch (e) {}

      // Combine backend + cache (deduplicated by id / _id)
      const combinedMap = new Map();
      liveTemplates.forEach((t) => combinedMap.set(String(t._id || t.id), t));
      cachedTasks.forEach((t) => {
        const key = String(t._id || t.id);
        if (!combinedMap.has(key)) combinedMap.set(key, t);
      });

      let finalData = Array.from(combinedMap.values());
      if (finalData.length === 0) {
        finalData = DEFAULT_INITIAL_TEMPLATES;
      }

      // Normalize row structure for table columns
      const formatted = finalData.map((item) => {
        const rawId = item._id || item.id || `T-${Math.random()}`;
        const rawStages = item.stages || item.wbsStructure?.stages || [];

        // Deep resolve stages, works, tasks from MongoDB populated data or local maps
        const resolvedStages = rawStages.map((stg, sIdx) => {
          const sId = stg.stageId?._id || stg.stageId;
          const sRef = typeof stg.stageId === "object" && stg.stageId?.stage_name
            ? stg.stageId
            : stageMap.get(String(sId)) || {};

          const sCode = sRef.stage_code || stg.stageId?.stage_code || stg.stage_code || (typeof stg.stageId === "string" ? stg.stageId : `Stage ${sIdx + 1}`);
          const sName = sRef.stage_name || stg.stageId?.stage_name || stg.stage_name || sCode;
          const fData = stg.fieldData || stg || {};

          const resolvedWorks = (stg.works || []).map((wrk, wIdx) => {
            const wId = wrk.workId?._id || wrk.workId;
            const wRef = typeof wrk.workId === "object" && wrk.workId?.work_name
              ? wrk.workId
              : workMap.get(String(wId)) || {};

            const wCode = wRef.work_code || wrk.workId?.work_code || wrk.work_code || (typeof wrk.workId === "string" ? wrk.workId : `Work ${wIdx + 1}`);
            const wName = wRef.work_name || wrk.workId?.work_name || wrk.work_name || wCode;

            const resolvedTasks = (wrk.tasks || []).map((tsk, tIdx) => {
              const tRawId = typeof tsk === "object" ? tsk.taskId?._id || tsk.taskId : tsk;
              const tRef = typeof tsk === "object" && tsk.taskId?.task_name
                ? tsk.taskId
                : taskMap.get(String(tRawId)) || {};

              const tCode = tRef.task_code || (typeof tsk === "object" ? tsk.taskId?.task_code || tsk.task_code : null) || (typeof tRawId === "string" ? tRawId : `Task ${tIdx + 1}`);
              const tName = tRef.task_name || (typeof tsk === "object" ? tsk.taskId?.task_name || tsk.task_name : null) || tCode;

              return {
                taskId: tCode,
                task_code: tCode,
                task_name: tName,
                fieldData: typeof tsk === "object" ? tsk.fieldData : {}
              };
            });

            return {
              workId: wCode,
              work_code: wCode,
              work_name: wName,
              fieldData: wrk.fieldData || {},
              tasks: resolvedTasks
            };
          });

          return {
            stageId: sCode,
            stage_code: sCode,
            stage_name: sName,
            fieldData: fData,
            works: resolvedWorks
          };
        });

        const worksCount = resolvedStages.reduce((acc, s) => acc + (s.works?.length || 0), 0);
        const tasksCount = resolvedStages.reduce(
          (acc, s) => acc + (s.works?.reduce((wAcc, w) => wAcc + (w.tasks?.length || 0), 0) || 0),
          0
        );

        const firstStage = resolvedStages[0] || {};
        const firstFieldData = firstStage.fieldData || {};

        // Materials list extraction
        let materialsList = [];
        if (Array.isArray(firstFieldData.materialSupplier) && firstFieldData.materialSupplier.length > 0) {
          materialsList = firstFieldData.materialSupplier;
        } else if (item.materialRequired) {
          materialsList = [{ materialRequired: item.materialRequired, supplierName: item.supplierName }];
        }

        const rawProjectStatus = item.projectStatus;
        const statusLabel = Array.isArray(rawProjectStatus) && rawProjectStatus.length > 0
          ? (typeof rawProjectStatus[0] === "object" ? rawProjectStatus[0].status_name || rawProjectStatus[0].name || rawProjectStatus[0].value : rawProjectStatus[0])
          : (typeof rawProjectStatus === "string" && rawProjectStatus.trim() ? rawProjectStatus : item.status || "Active");

        // Code priority: primaryTaskCode -> first Stage code -> template code
        const primaryCode = item.task && item.task !== "--"
          ? item.task
          : firstStage.stage_code
          ? firstStage.stage_code
          : item.code && item.code !== "PMS-01"
          ? item.code
          : `TSK-${String(rawId).slice(-4).toUpperCase()}`;

        // Project details priority
        const pObj = typeof item.projectId === "object" && item.projectId !== null ? item.projectId : {};
        const pName =
          pObj.projectName ||
          item.projectDetails ||
          (pObj.businessType ? `${pObj.businessType} Project` : null) ||
          item.name ||
          "Project Workflow";

        const pCategory = pObj.workCategory || item.category || "Residential";
        const pType = Array.isArray(pObj.workType)
          ? pObj.workType.join(", ")
          : pObj.workType || item.projectType || "Full Turnkey";

        const clientName =
          item.leadId?.clientName ||
          item.projectId?.clientName ||
          item.clientName ||
          "—";

        const clientPhone =
          item.leadId?.phoneNumber ||
          item.leadId?.alternateNumber ||
          item.leadId?.phone ||
          item.projectId?.phoneNumber ||
          item.projectId?.phone ||
          item.contactNumber ||
          item.phoneNumber ||
          item.phone ||
          "—";

        const clientEmail =
          item.leadId?.emailAddress ||
          item.leadId?.email ||
          item.projectId?.emailAddress ||
          item.projectId?.email ||
          item.emailAddress ||
          item.email ||
          "—";

        const rawDate = item.createdAt || item.date || item.createdDate;
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

        const totalDaysFromStages = resolvedStages.reduce((acc, s) => {
          const d = Number(s.fieldData?.durationDays);
          return acc + (!isNaN(d) ? d : 0);
        }, 0);

        const durationDisplay = totalDaysFromStages > 0
          ? `${totalDaysFromStages} Days`
          : firstFieldData.durationFormatted || item.duration || `${firstFieldData.durationDays || 3} Days`;

        return {
          ...item,
          id: rawId,
          code: primaryCode,
          clientName,
          clientPhone,
          clientEmail,
          projectName: pName,
          category: pCategory,
          projectType: pType,
          stagesCount: resolvedStages.length || item.milestones || 1,
          worksCount: worksCount || 0,
          tasksCount: tasksCount || item.tasksCount || 0,
          duration: durationDisplay,
          createdDateFormatted,
          workWillDoneBy: firstFieldData.workWillDoneBy || item.workWillDoneBy || "Civil Contractor",
          contractorType: firstFieldData.contractorType || item.contractorType || "",
          materialsList,
          status: statusLabel,
          stagesList: resolvedStages
        };
      });

      setTemplates(formatted);
    } catch (err) {
      console.error("Error fetching templates:", err);
      toast.error("Failed to load PMS templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // KPI Calculations strictly matching Table Columns:
  // 1. Total Templates (Project Templates)
  // 2. Clients Mapped (matching Column: CLIENT DETAILS)
  // 3. Total WBS Stages (matching Column: STAGES / WORKS / TASKS)
  // 4. Total Deliverable Tasks (matching Column: STAGES / WORKS / TASKS)
  const stats = useMemo(() => {
    const total = templates.length;
    const uniqueClients = new Set(
      templates
        .map((t) => t.clientName)
        .filter((c) => c && c !== "—" && c !== "Direct Client")
    ).size;
    const totalStages = templates.reduce((acc, t) => acc + (Number(t.stagesCount) || 0), 0);
    const totalTasks = templates.reduce((acc, t) => acc + (Number(t.tasksCount) || 0), 0);
    return { total, uniqueClients, totalStages, totalTasks };
  }, [templates]);

  // Dynamic filter options based on templates
  const clientOptions = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      if (t.clientName && t.clientName !== "—" && t.clientName !== "Direct Client") {
        set.add(t.clientName.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  const categoryOptions = useMemo(() => {
    const set = new Set(["Residential", "Commercial", "Infrastructure", "Interior Turnkey", "Industrial"]);
    templates.forEach((t) => {
      if (t.category && t.category !== "—") set.add(t.category.trim());
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  const workTypeOptions = useMemo(() => {
    const set = new Set();
    templates.forEach((t) => {
      if (t.projectType && t.projectType !== "—") {
        t.projectType.split(",").forEach((pt) => {
          const trimmed = pt.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [templates]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== "") count++;
    if (selectedClient !== "All") count++;
    if (selectedCategory !== "All") count++;
    if (selectedWorkType !== "All") count++;
    if (sortBy !== "newest") count++;
    return count;
  }, [searchTerm, selectedClient, selectedCategory, selectedWorkType, sortBy]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedClient("All");
    setSelectedCategory("All");
    setSelectedWorkType("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Filtered Templates strictly matching Table Columns
  const filteredTemplates = useMemo(() => {
    let result = templates.filter((template) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        (template.projectName && template.projectName.toLowerCase().includes(q)) ||
        (template.clientName && template.clientName.toLowerCase().includes(q)) ||
        (template.clientPhone && template.clientPhone.toLowerCase().includes(q)) ||
        (template.clientEmail && template.clientEmail.toLowerCase().includes(q)) ||
        (template.code && template.code.toLowerCase().includes(q)) ||
        (template.projectType && template.projectType.toLowerCase().includes(q)) ||
        (template.category && template.category.toLowerCase().includes(q));

      const matchClient =
        selectedClient === "All" || template.clientName === selectedClient;
      const matchCategory =
        selectedCategory === "All" || template.category === selectedCategory;
      const matchWorkType =
        selectedWorkType === "All" ||
        (template.projectType && template.projectType.toLowerCase().includes(selectedWorkType.toLowerCase()));

      return matchSearch && matchClient && matchCategory && matchWorkType;
    });

    // Sorting matching table
    if (sortBy === "oldest") {
      result = [...result].reverse();
    } else if (sortBy === "duration_desc") {
      result = [...result].sort((a, b) => {
        const da = parseInt(a.duration) || 0;
        const db = parseInt(b.duration) || 0;
        return db - da;
      });
    } else if (sortBy === "duration_asc") {
      result = [...result].sort((a, b) => {
        const da = parseInt(a.duration) || 0;
        const db = parseInt(b.duration) || 0;
        return da - db;
      });
    }

    return result;
  }, [templates, searchTerm, selectedClient, selectedCategory, selectedWorkType, sortBy]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(start, start + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  const getCategoryColor = (cat) => {
    switch (cat) {
      case "Residential": return "bg-sky-50 text-sky-700 border-sky-200";
      case "Commercial": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Infrastructure": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Interior Turnkey": return "bg-rose-50 text-rose-700 border-rose-200";
      case "Industrial": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Table Column Configuration strictly matching user specifications:
  // 1. SR. NO. (via Table showSrNo={true})
  // 2. Action: Only icons (View & Edit), no text
  // 3. Client Details: Client Name, Contact Number, Email only
  // 4. Project Details: Project Name, Work Type, Work Category (each with its own background stacked vertically)
  // 5. Stages / Works / Tasks: Only the counts of stages, works, tasks
  // 6. Work Duration: Work duration with icon
  // 7. Created Date: Date when filled with its own background badge
  const columnConfig = useMemo(() => ({
    // 1. Action Column (Icons only - no text)
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-20 min-w-[80px]",
      render: (_, row) => {
        const rowId = row.id;
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* View Icon Button */}
            <button
              onClick={() => navigate(`/sales/master/pms-template/details/${rowId}`)}
              title="View Complete Template Details"
              aria-label="View Details"
              className="p-1.5 rounded-md text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 border border-emerald-200 transition-all cursor-pointer shadow-2xs hover:scale-105"
            >
              <FaEye className="w-3.5 h-3.5" />
            </button>

            {/* Edit Icon Button (Hidden for Observer) */}
            {!isUserObserver && (
              <button
                onClick={() => navigate(`/sales/master/pms-template/edit/${rowId}`)}
                title="Edit Template"
                aria-label="Edit Template"
                className="p-1.5 rounded-md text-amber-600 bg-amber-50 hover:bg-amber-100 hover:text-amber-700 border border-amber-200 transition-all cursor-pointer shadow-2xs hover:scale-105"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }
    },

    // 2. Client Details Column (Client name, contact number, email only)
    clientDetails: {
      label: "Client Details",
      align: "left",
      headerClass: "min-w-[210px]",
      render: (_, row) => (
        <div className="py-1 flex flex-col items-start gap-0.5 text-left">
          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <FaUser className="w-3 h-3 text-indigo-500 shrink-0" />
            {row.clientName}
          </span>
          <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1.5">
            <FaPhoneAlt className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            {row.clientPhone}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate max-w-[200px]" title={row.clientEmail}>
            <FaEnvelope className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            {row.clientEmail}
          </span>
        </div>
      )
    },

    // 3. Project Details Column (Project Name, Work Type, Work Category - each with background stacked below)
    projectDetails: {
      label: "Project Details",
      align: "left",
      headerClass: "min-w-[250px]",
      render: (_, row) => (
        <div className="py-1 flex flex-col items-start gap-1 text-left">
          {/* Project Name with distinct background */}
          <span
            onClick={() => navigate(`/sales/master/pms-template/details/${row.id}`)}
            title={row.projectName}
            className="inline-block max-w-[280px] truncate bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs px-2.5 py-1 rounded border border-slate-200 cursor-pointer transition-colors"
          >
            {row.projectName}
          </span>

          {/* Work Type with distinct background */}
          <span className="inline-block bg-sky-50 text-sky-800 font-semibold text-[11px] px-2 py-0.5 rounded border border-sky-200">
            Type: {row.projectType}
          </span>

          {/* Work Category with distinct background */}
          <span className="inline-block bg-purple-50 text-purple-800 font-semibold text-[11px] px-2 py-0.5 rounded border border-purple-200">
            Category: {row.category}
          </span>
        </div>
      )
    },

    // 4. Stages, Works, Tasks Counts (kitne stage hai kitne work hai kitne task hai ye show hoga bs aur kuch na)
    stagesWorksTasks: {
      label: "Stages / Works / Tasks",
      align: "center",
      headerClass: "min-w-[220px]",
      render: (_, row) => (
        <div className="py-1 flex flex-wrap items-center justify-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap">
            {row.stagesCount} {row.stagesCount === 1 ? "Stage" : "Stages"}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 whitespace-nowrap">
            {row.worksCount} {row.worksCount === 1 ? "Work" : "Works"}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
            {row.tasksCount} {row.tasksCount === 1 ? "Task" : "Tasks"}
          </span>
        </div>
      )
    },

    // 5. Work Duration (work duration hoga bs)
    duration: {
      label: "Work Duration",
      align: "center",
      headerClass: "min-w-[130px]",
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md whitespace-nowrap">
          <FaClock className="w-3 h-3 text-slate-500 shrink-0" />
          {val}
        </span>
      )
    },

    // 6. Date Created (aur date kb bhra gya hai ye date ka apna backgorund hoga)
    createdDate: {
      label: "Created Date",
      align: "center",
      headerClass: "min-w-[130px]",
      render: (_, row) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
          <FaCalendarAlt className="w-3 h-3 text-amber-600 shrink-0" />
          {row.createdDateFormatted}
        </span>
      )
    }
  }), [navigate]);

  const KpiCard = ({ gradient, icon, label, value, subtitle, IconBg }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 shadow-md ${gradient} text-white group`}>
      <div className="absolute -right-4 -bottom-6 opacity-15 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {IconBg}
      </div>
      <div className="relative z-1 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">{label}</p>
          <h3 className="text-3xl font-black mt-1 leading-none">{value}</h3>
          <p className="text-[10px] opacity-80 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* ================= FIXED / STICKY HEADER BANNER ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl px-4 py-3 shadow-md border border-indigo-700/50 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
                <HiOutlineTemplate className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    PMS Template
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <HiSparkles className="w-3 h-3 text-cyan-300" /> MasterForm
                  </span>
                </div>
                <p className="text-xs text-indigo-200/90 mt-1 max-w-xl font-normal">
                  Standardize project milestones, tasks, deliverables, and duration templates for quick sales proposals.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Filter Button in Header */}
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

              {!isUserObserver && (
                <button
                  onClick={() => navigate("/sales/master/pms-template/create")}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-md shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
                >
                  <FaPlus className="w-3.5 h-3.5" />
                  <span>Create PMS Template</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS (MATCHING TABLE COLUMNS) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          label="Total Templates"
          value={stats.total}
          subtitle="Saved project templates"
          icon={<FaFileContract className="w-5 h-5 text-white" />}
          IconBg={<FaFileContract className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Clients Mapped"
          value={stats.uniqueClients}
          subtitle="Direct clients linked"
          icon={<FaUser className="w-5 h-5 text-white" />}
          IconBg={<FaUser className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-purple-600 to-fuchsia-700"
          label="Total Stages"
          value={stats.totalStages}
          subtitle="WBS milestones mapped"
          icon={<FaLayerGroup className="w-5 h-5 text-white" />}
          IconBg={<FaLayerGroup className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          label="Total Tasks"
          value={stats.totalTasks}
          subtitle="Deliverable tasks defined"
          icon={<FaTasks className="w-5 h-5 text-white" />}
          IconBg={<FaTasks className="w-20 h-20" />}
        />
      </div>

      {/* ================= SEARCH & TABLE-BASED FILTER CONTROL BAR (COLLAPSIBLE) ================= */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3.5 sm:p-4 shadow-xs border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top Row: Search Box, Found Count, Reset & Close */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by project name, client, phone, email, code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions & Count */}
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
                {filteredTemplates.length} Found
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

          {/* Bottom Row: Dropdown Filters Matching Table Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
            {/* 1. Client Filter (Matching Column: CLIENT DETAILS) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Client
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
                {clientOptions.filter(c => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 2. Work Category Filter (Matching Column: PROJECT DETAILS) */}
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
                {categoryOptions.filter(cat => cat !== "All").map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 3. Work Type Filter (Matching Column: PROJECT DETAILS) */}
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
                {workTypeOptions.filter(wt => wt !== "All").map((wt) => (
                  <option key={wt} value={wt}>{wt}</option>
                ))}
              </select>
            </div>

            {/* 4. Sort By (Matching Columns: WORK DURATION & CREATED DATE) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  sortBy !== "newest"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="newest">Newest First (Created Date)</option>
                <option value="oldest">Oldest First</option>
                <option value="duration_desc">Duration (High to Low)</option>
                <option value="duration_asc">Duration (Low to High)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE LIST WITH SR NO & EXPANDABLE ROWS ================= */}
      <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 shadow-xs overflow-hidden rounded-none">
        <Table
          data={paginatedTemplates}
          columnConfig={columnConfig}
          showSrNo={true}
          currentPage={currentPage}
          totalItems={filteredTemplates.length}
          itemsPerPage={itemsPerPage}
          isLoading={loading}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50, 100]}
        />
      </div>
    </div>
  );
};

export default PmsTemplateComponent;

