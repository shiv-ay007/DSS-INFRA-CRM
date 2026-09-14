import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaArrowLeft,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaFolder,
  FaFolderOpen,
  FaTasks,
  FaTools,
  FaHardHat,
  FaCheckCircle,
  FaLink,
  FaInfoCircle,
  FaTimes
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { MdAccountTree } from "react-icons/md";
import {
  INITIAL_STAGES,
  INITIAL_WORKS,
  INITIAL_TASKS,
  PMS_MASTER_STAGES_KEY,
  PMS_MASTER_WORKS_KEY,
  PMS_MASTER_TASKS_KEY
} from "./pmsMasterInitialData";
import pmsWbsService from "../../../services/pmsWbsService";
import Table from "../../../../../Common/Components/Table";

const PmsWbsMasterComponent = () => {
  const navigate = useNavigate();

  // 1. Data States (Loaded from localStorage with auto-preservation of standard template data)
  const [stages, setStages] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_STAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCodes = new Set(parsed.map(s => s.stage_code));
          const missingStandard = INITIAL_STAGES.filter(s => !existingCodes.has(s.stage_code));
          if (missingStandard.length > 0) {
            return [...parsed, ...missingStandard].sort((a, b) => (a.order || 0) - (b.order || 0));
          }
          return parsed;
        }
      }
      return INITIAL_STAGES;
    } catch {
      return INITIAL_STAGES;
    }
  });

  const [works, setWorks] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_WORKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCodes = new Set(parsed.map(w => w.work_code));
          const missingStandard = INITIAL_WORKS.filter(w => !existingCodes.has(w.work_code));
          if (missingStandard.length > 0) {
            return [...parsed, ...missingStandard].sort((a, b) => (a.order || 0) - (b.order || 0));
          }
          return parsed;
        }
      }
      return INITIAL_WORKS;
    } catch {
      return INITIAL_WORKS;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingCodes = new Set(parsed.map(t => t.task_code));
          const missingStandard = INITIAL_TASKS.filter(t => !existingCodes.has(t.task_code));
          if (missingStandard.length > 0) {
            return [...parsed, ...missingStandard].sort((a, b) => (a.order || 0) - (b.order || 0));
          }
          return parsed;
        }
      }
      return INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Loading & Submitting States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PMS_MASTER_STAGES_KEY, JSON.stringify(stages));
    } catch (e) {
      console.error(e);
    }
  }, [stages]);

  useEffect(() => {
    try {
      localStorage.setItem(PMS_MASTER_WORKS_KEY, JSON.stringify(works));
    } catch (e) {
      console.error(e);
    }
  }, [works]);

  useEffect(() => {
    try {
      localStorage.setItem(PMS_MASTER_TASKS_KEY, JSON.stringify(tasks));
    } catch (e) {
      console.error(e);
    }
  }, [tasks]);

  // 1. Fetch All Master Data from MongoDB (for KPI counts & modal dropdowns)
  const fetchMasterData = async () => {
    try {
      setLoading(true);
      const res = await pmsWbsService.getAllWbsData();
      if (res && res.success && res.data) {
        if (Array.isArray(res.data.stages) && res.data.stages.length > 0) {
          setStages(res.data.stages);
        }
        if (Array.isArray(res.data.works) && res.data.works.length > 0) {
          setWorks(res.data.works);
        }
        if (Array.isArray(res.data.tasks) && res.data.tasks.length > 0) {
          setTasks(res.data.tasks);
        }
      }
    } catch (err) {
      console.warn("Could not fetch PMS WBS data from backend (falling back to cache):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // 2. View Mode State: 'stages' | 'works' | 'tasks'
  const [viewMode, setViewMode] = useState("stages");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStageId, setFilterStageId] = useState("All");
  const [filterWorkId, setFilterWorkId] = useState("All");

  // 2.1 Backend Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Debounce search term by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, filterStageId, filterWorkId]);

  // Fetch Paginated Table Data from Backend
  const fetchPaginatedTableData = async () => {
    try {
      setIsTableLoading(true);
      let res;
      if (viewMode === "stages") {
        res = await pmsWbsService.getStagesPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch
        });
      } else if (viewMode === "works") {
        res = await pmsWbsService.getWorksPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch,
          stage_id: filterStageId !== "All" ? filterStageId : undefined
        });
      } else if (viewMode === "tasks") {
        res = await pmsWbsService.getTasksPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch,
          stage_id: filterStageId !== "All" ? filterStageId : undefined,
          work_id: filterWorkId !== "All" ? filterWorkId : undefined
        });
      }

      if (res && res.success && Array.isArray(res.data)) {
        setPaginatedData(res.data);
        if (res.pagination) {
          setTotalRecords(res.pagination.total);
          setTotalPages(res.pagination.totalPages || 1);
        }
      } else {
        setPaginatedData([]);
      }
    } catch (err) {
      console.warn("Could not fetch paginated data from backend:", err);
      setPaginatedData([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    fetchPaginatedTableData();
  }, [viewMode, currentPage, pageLimit, debouncedSearch, filterStageId, filterWorkId]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
        setEditingItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // 3. Form State: 'stage' | 'work' | 'task'
  const [entryType, setEntryType] = useState("stage");
  const [formData, setFormData] = useState({
    stage_id: "",
    work_id: "",
    code: "",
    name: "",
    description: "",
    work_done_by: "CONTRACTOR",
    contractor_type: "",
    tools: "",
    order: 1
  });

  const [editingItem, setEditingItem] = useState(null); // { type: 'stage'|'work'|'task', item }

  // Available works filtered by selected stage for Task entry
  const availableWorksForSelectedStage = useMemo(() => {
    if (!formData.stage_id) return [];
    return works.filter(w => w.stage_id === formData.stage_id);
  }, [works, formData.stage_id]);

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === "stage_id" && entryType === "task") {
        // Reset work_id if stage changes
        updated.work_id = "";
      }
      return updated;
    });
  };

  // Open Modal for Creating New Entry
  const handleOpenAddModal = (type = viewMode === "tasks" ? "task" : viewMode === "works" ? "work" : "stage") => {
    setEditingItem(null);
    setEntryType(type);

    const prefillStageId = (filterStageId !== "All" && (type === "work" || type === "task")) ? filterStageId : "";
    const prefillWorkId = (filterWorkId !== "All" && type === "task") ? filterWorkId : "";

    let suggestedCode = "";
    if (type === "stage") {
      suggestedCode = `S${stages.length + 1}`;
    } else if (type === "work" && prefillStageId) {
      const parent = stages.find(s => s._id === prefillStageId);
      const workCount = works.filter(w => w.stage_id === prefillStageId).length + 1;
      suggestedCode = parent ? `${parent.stage_code}-W${workCount}` : "";
    } else if (type === "task" && prefillWorkId) {
      const parentW = works.find(w => w._id === prefillWorkId);
      const taskCount = tasks.filter(t => t.work_id === prefillWorkId).length + 1;
      suggestedCode = parentW ? `${parentW.work_code}-T${taskCount}` : "";
    }

    setFormData({
      stage_id: prefillStageId,
      work_id: prefillWorkId,
      code: suggestedCode,
      name: "",
      description: "",
      work_done_by: "CONTRACTOR",
      contractor_type: "",
      tools: "",
      order: 1
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Quick Action from Table: Pre-fill Form and Open Modal
  const triggerAddWorkForStage = (stage) => {
    setEditingItem(null);
    setEntryType("work");
    setFormData({
      stage_id: stage._id,
      work_id: "",
      code: `${stage.stage_code}-W${works.filter(w => w.stage_id === stage._id).length + 1}`,
      name: "",
      description: "",
      work_done_by: "CONTRACTOR",
      contractor_type: "",
      tools: "",
      order: works.filter(w => w.stage_id === stage._id).length + 1
    });
    setIsModalOpen(true);
  };

  const triggerAddTaskForWork = (stage, work) => {
    setEditingItem(null);
    setEntryType("task");
    setFormData({
      stage_id: stage?._id || work.stage_id || "",
      work_id: work._id,
      code: `${work.work_code}-T${tasks.filter(t => t.work_id === work._id).length + 1}`,
      name: "",
      description: "",
      work_done_by: "CONTRACTOR",
      contractor_type: work.contractor_type || "",
      tools: "",
      order: tasks.filter(t => t.work_id === work._id).length + 1
    });
    setIsModalOpen(true);
  };

  // Handle Form Submit (Saves into 3 separate MongoDB collections: pms_stages, pms_works, pms_tasks)
  const handleSaveMaster = async (e) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error("Please fill required Code and Name fields!");
      return;
    }

    setSubmitting(true);
    try {
      if (entryType === "stage") {
        const payload = {
          stage_code: formData.code.trim().toUpperCase(),
          stage_name: formData.name.trim(),
          description: formData.description.trim() || formData.name.trim(),
          order: editingItem ? (editingItem.item.order || 1) : stages.length + 1
        };

        if (editingItem) {
          const res = await pmsWbsService.updateStage(editingItem.item._id, payload);
          const updated = res && res.success && res.data ? res.data : { ...editingItem.item, ...payload };
          setStages(prev => prev.map(s => s._id === editingItem.item._id ? updated : s));
          toast.success(`Stage ${payload.stage_code} updated successfully in pms_stages!`);
        } else {
          const res = await pmsWbsService.createStage(payload);
          const created = res && res.success && res.data ? res.data : { ...payload, _id: `stage_${Date.now()}` };
          setStages(prev => [...prev, created]);
          toast.success(`Stage ${payload.stage_code} saved into pms_stages collection!`);
        }
      } else if (entryType === "work") {
        if (!formData.stage_id) {
          toast.error("Please select a parent Stage!");
          setSubmitting(false);
          return;
        }
        const parentStage = stages.find(s => s._id === formData.stage_id);
        const payload = {
          stage_id: formData.stage_id,
          stage_code: parentStage ? parentStage.stage_code : "",
          work_code: formData.code.trim().toUpperCase(),
          work_name: formData.name.trim(),
          contractor_type: formData.contractor_type ? formData.contractor_type.trim() : "",
          order: editingItem ? (editingItem.item.order || 1) : works.length + 1
        };

        if (editingItem) {
          const res = await pmsWbsService.updateWork(editingItem.item._id, payload);
          const updated = res && res.success && res.data ? res.data : { ...editingItem.item, ...payload };
          setWorks(prev => prev.map(w => w._id === editingItem.item._id ? updated : w));
          toast.success(`Work ${payload.work_code} updated successfully in pms_works!`);
        } else {
          const res = await pmsWbsService.createWork(payload);
          const created = res && res.success && res.data ? res.data : { ...payload, _id: `work_${Date.now()}` };
          setWorks(prev => [...prev, created]);
          toast.success(`Work ${payload.work_code} saved into pms_works collection!`);
        }
      } else if (entryType === "task") {
        if (!formData.work_id) {
          toast.error("Please select a parent Work!");
          setSubmitting(false);
          return;
        }
        const parentWork = works.find(w => w._id === formData.work_id);
        const parentStage = stages.find(s => s._id === formData.stage_id) || stages.find(s => s._id === parentWork?.stage_id);
        const payload = {
          work_id: formData.work_id,
          work_code: parentWork ? parentWork.work_code : "",
          stage_id: parentStage ? parentStage._id : (parentWork?.stage_id || ""),
          stage_code: parentStage ? parentStage.stage_code : (parentWork?.stage_code || ""),
          task_code: formData.code.trim().toUpperCase(),
          task_name: formData.name.trim(),
          work_done_by: formData.work_done_by || "",
          materials: formData.materials || "",
          order: editingItem ? (editingItem.item.order || 1) : tasks.length + 1
        };

        if (editingItem) {
          const res = await pmsWbsService.updateTask(editingItem.item._id, payload);
          const updated = res && res.success && res.data ? res.data : { ...editingItem.item, ...payload };
          setTasks(prev => prev.map(t => t._id === editingItem.item._id ? updated : t));
          toast.success(`Task ${payload.task_code} updated successfully in pms_tasks!`);
        } else {
          const res = await pmsWbsService.createTask(payload);
          const created = res && res.success && res.data ? res.data : { ...payload, _id: `task_${Date.now()}` };
          setTasks(prev => [...prev, created]);
          toast.success(`Task ${payload.task_code} saved into pms_tasks collection!`);
        }
      }

      // Close modal and reset form
      handleCloseModal();
      fetchMasterData();
      fetchPaginatedTableData();
    } catch (err) {
      console.error("Save master error:", err);
      toast.error(err.message || "Failed to save entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Trigger: Open modal populated with item
  const handleStartEdit = (type, item) => {
    setEditingItem({ type, item });
    setEntryType(type);
    if (type === "stage") {
      setFormData({
        stage_id: "",
        work_id: "",
        code: item.stage_code,
        name: item.stage_name,
        description: item.description || "",
        work_done_by: "CONTRACTOR",
        contractor_type: "",
        tools: "",
        materials: "",
        order: item.order || 1
      });
    } else if (type === "work") {
      setFormData({
        stage_id: item.stage_id,
        work_id: "",
        code: item.work_code,
        name: item.work_name,
        description: "",
        work_done_by: "CONTRACTOR",
        contractor_type: item.contractor_type || "",
        tools: "",
        materials: "",
        order: item.order || 1
      });
    } else if (type === "task") {
      setFormData({
        stage_id: item.stage_id || "",
        work_id: item.work_id,
        code: item.task_code,
        name: item.task_name,
        description: "",
        work_done_by: item.work_done_by || "CONTRACTOR",
        contractor_type: "",
        tools: "",
        materials: item.materials || "",
        order: item.order || 1
      });
    }
    setIsModalOpen(true);
  };

  // Delete Handlers
  const handleDeleteStage = (stage) => {
    if (window.confirm(`Delete Stage "${stage.stage_code}: ${stage.stage_name}" and all its linked Works and Tasks?`)) {
      const stageWorkIds = works.filter(w => w.stage_id === stage._id).map(w => w._id);
      setStages(prev => prev.filter(s => s._id !== stage._id));
      setWorks(prev => prev.filter(w => w.stage_id !== stage._id));
      setTasks(prev => prev.filter(t => !stageWorkIds.includes(t.work_id) && t.stage_id !== stage._id));
      toast.info(`Deleted Stage ${stage.stage_code}`);
    }
  };

  const handleDeleteWork = (work) => {
    if (window.confirm(`Delete Work "${work.work_code}: ${work.work_name}" and its linked Tasks?`)) {
      setWorks(prev => prev.filter(w => w._id !== work._id));
      setTasks(prev => prev.filter(t => t.work_id !== work._id));
      toast.info(`Deleted Work ${work.work_code}`);
    }
  };

  const handleDeleteTask = (task) => {
    if (window.confirm(`Delete Task "${task.task_code}: ${task.task_name}"?`)) {
      setTasks(prev => prev.filter(t => t._id !== task._id));
      toast.info(`Deleted Task ${task.task_code}`);
    }
  };


  // Filtering for Tables (Fallback and search cache)
  const filteredStages = useMemo(() => {
    return stages.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        s.stage_code.toLowerCase().includes(term) ||
        s.stage_name.toLowerCase().includes(term) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    });
  }, [stages, searchTerm]);

  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        w.work_code.toLowerCase().includes(term) ||
        w.work_name.toLowerCase().includes(term);
      const matchStage = filterStageId === "All" || w.stage_id === filterStageId;
      return matchSearch && matchStage;
    });
  }, [works, searchTerm, filterStageId]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        t.task_code.toLowerCase().includes(term) ||
        t.task_name.toLowerCase().includes(term) ||
        (t.contractor_type && t.contractor_type.toLowerCase().includes(term)) ||
        (t.tools && t.tools.toLowerCase().includes(term));
      const matchStage = filterStageId === "All" || t.stage_id === filterStageId;
      const matchWork = filterWorkId === "All" || t.work_id === filterWorkId;
      return matchSearch && matchStage && matchWork;
    });
  }, [tasks, searchTerm, filterStageId, filterWorkId]);

  // Current Display Data (Backend Paginated Data with client fallback)
  const currentStagesList = useMemo(() => {
    if (viewMode === "stages" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "stages" && totalRecords === 0 && !isTableLoading && debouncedSearch) return [];
    return filteredStages.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredStages, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch]);

  const currentWorksList = useMemo(() => {
    if (viewMode === "works" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "works" && totalRecords === 0 && !isTableLoading && (debouncedSearch || filterStageId !== "All")) return [];
    return filteredWorks.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredWorks, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch, filterStageId]);

  const currentTasksList = useMemo(() => {
    if (viewMode === "tasks" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "tasks" && totalRecords === 0 && !isTableLoading && (debouncedSearch || filterStageId !== "All" || filterWorkId !== "All")) return [];
    return filteredTasks.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredTasks, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch, filterStageId, filterWorkId]);

  const activeTotalRecords = totalRecords || (
    viewMode === "stages" ? filteredStages.length : viewMode === "works" ? filteredWorks.length : filteredTasks.length
  );
  const activeTotalPages = totalPages || Math.ceil(activeTotalRecords / pageLimit) || 1;

  // Column configurations for the 3 master views (Action first, No ObjectId fields)
  const stagesColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-36 min-w-[140px]",
      render: (_, stage) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => triggerAddWorkForStage(stage)}
            className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold cursor-pointer transition-colors border border-blue-200"
          >
            + Add Work
          </button>
          <button
            onClick={() => handleStartEdit("stage", stage)}
            title="Edit Stage"
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
          >
            <FaEdit className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    stage_code: {
      label: "Code",
      align: "center",
      headerClass: "w-24 min-w-[90px]",
      render: (val) => (
        <span className="font-mono font-bold text-indigo-700">{val}</span>
      )
    },
    stage_name: {
      label: "Stage Name / Description",
      align: "left",
      headerClass: "min-w-[260px]",
      render: (_, stage) => (
        <div className="py-0.5">
          <div className="font-bold text-slate-900">{stage.stage_name}</div>
          {stage.description && (
            <div className="text-[11px] text-slate-500 line-clamp-1">{stage.description}</div>
          )}
        </div>
      )
    },
    linkedWorks: {
      label: "Linked Works",
      align: "center",
      headerClass: "min-w-[120px]",
      render: (_, stage) => {
        const count = works.filter(w => w.stage_id === stage._id).length;
        return (
          <span className="font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full text-xs">
            {count} Works
          </span>
        );
      }
    }
  }), [works]);

  const worksColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-36 min-w-[140px]",
      render: (_, work) => {
        const parentStage = stages.find(s => s._id === work.stage_id);
        return (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => triggerAddTaskForWork(parentStage || {}, work)}
              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold cursor-pointer transition-colors border border-emerald-200"
            >
              + Add Task
            </button>
            <button
              onClick={() => handleStartEdit("work", work)}
              title="Edit Work"
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    },
    work_code: {
      label: "Work Code",
      align: "center",
      headerClass: "w-28 min-w-[100px]",
      render: (val) => (
        <span className="font-mono font-bold text-blue-700">{val}</span>
      )
    },
    work_name: {
      label: "Work Name",
      align: "left",
      headerClass: "min-w-[240px]",
      render: (val) => (
        <span className="font-bold text-slate-900">{val}</span>
      )
    },
    parent_stage: {
      label: "Parent Stage",
      align: "center",
      headerClass: "min-w-[180px]",
      render: (_, work) => {
        const parentStage = stages.find(s => s._id === work.stage_id);
        return (
          <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {parentStage ? `[${parentStage.stage_code}] ${parentStage.stage_name}` : work.stage_code || "Unknown"}
          </span>
        );
      }
    },
    linkedTasks: {
      label: "Linked Tasks",
      align: "center",
      headerClass: "min-w-[120px]",
      render: (_, work) => {
        const count = tasks.filter(t => t.work_id === work._id).length;
        return (
          <span className="font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full text-xs">
            {count} Tasks
          </span>
        );
      }
    }
  }), [stages, tasks]);

  const tasksColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-24 min-w-[80px]",
      render: (_, task) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => handleStartEdit("task", task)}
            title="Edit Task"
            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
          >
            <FaEdit className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
    task_code: {
      label: "Task Code",
      align: "center",
      headerClass: "w-32 min-w-[110px]",
      render: (val) => (
        <span className="font-mono font-bold text-emerald-700">{val}</span>
      )
    },
    task_name: {
      label: "Task Name / Activity",
      align: "left",
      headerClass: "min-w-[240px]",
      render: (val) => (
        <span className="font-bold text-slate-900">{val}</span>
      )
    },
    parent_work: {
      label: "Parent Work",
      align: "center",
      headerClass: "min-w-[160px]",
      render: (_, task) => {
        const parentWork = works.find(w => w._id === task.work_id);
        return (
          <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {parentWork ? `[${parentWork.work_code}] ${parentWork.work_name}` : task.work_code || "--"}
          </span>
        );
      }
    },
    parent_stage: {
      label: "Parent Stage",
      align: "center",
      headerClass: "min-w-[160px]",
      render: (_, task) => {
        const parentWork = works.find(w => w._id === task.work_id);
        const parentStage = stages.find(s => s._id === (task.stage_id || parentWork?.stage_id));
        return (
          <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            {parentStage ? `[${parentStage.stage_code}] ${parentStage.stage_name}` : task.stage_code || "--"}
          </span>
        );
      }
    },
    contractor_tools: {
      label: "Contractor / Tools",
      align: "left",
      headerClass: "min-w-[180px]",
      render: (_, task) => (
        <div>
          {task.contractor_type && (
            <div className="text-[11px] font-semibold text-slate-700">{task.contractor_type}</div>
          )}
          {task.tools && (
            <div className="text-[10px] text-amber-700 font-medium">🛠️ {task.tools}</div>
          )}
          {!task.contractor_type && !task.tools && (
            <span className="text-slate-400 text-xs">--</span>
          )}
        </div>
      )
    }
  }), [stages, works]);

  const activeTableConfig = useMemo(() => {
    if (viewMode === "stages") return stagesColumnConfig;
    if (viewMode === "works") return worksColumnConfig;
    return tasksColumnConfig;
  }, [viewMode, stagesColumnConfig, worksColumnConfig, tasksColumnConfig]);

  const activeTableData = useMemo(() => {
    if (viewMode === "stages") return currentStagesList;
    if (viewMode === "works") return currentWorksList;
    return currentTasksList;
  }, [viewMode, currentStagesList, currentWorksList, currentTasksList]);

  return (
    <div className="w-full max-w-full space-y-5 pb-16 px-1 sm:px-2 font-sans text-slate-800">
      
      {/* 1. COMPACT STICKY HEADER BANNER */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-xl px-4 py-2.5 shadow-md border border-indigo-700/40 relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => navigate("/sales/master/pms-template")}
                title="Back to PMS Template"
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-cyan-300 hover:text-white transition-all cursor-pointer border border-white/10 shrink-0"
              >
                <FaArrowLeft className="w-3.5 h-3.5" />
              </button>

              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <MdAccountTree className="w-4 h-4 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm sm:text-base font-black tracking-tight text-white truncate">
                    WBS Master (Stages, Works & Tasks)
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1 shrink-0">
                    <HiSparkles className="w-2.5 h-2.5" /> 3-Tier Master
                  </span>
                  {loading && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shrink-0 animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" /> Loading...
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate("/sales/master/pms-template")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg shadow-sm text-xs font-bold cursor-pointer transition-all active:scale-95"
              >
                <span>View Templates</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tier 1: Stages</p>
            <h3 className="text-2xl font-black text-indigo-700 mt-0.5">{stages.length}</h3>
            <p className="text-[11px] text-slate-400">Master Stages (S1-S23)</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FaLayerGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tier 2: Works</p>
            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{works.length}</h3>
            <p className="text-[11px] text-slate-400">Linked to Stages</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FaFolder className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tier 3: Tasks</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{tasks.length}</h3>
            <p className="text-[11px] text-slate-400">Linked to Works</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FaTasks className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Architecture</p>
            <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
              <FaCheckCircle className="w-4 h-4 text-emerald-500" /> Relational
            </h3>
            <p className="text-[11px] text-slate-400">Auto Cascading IDs</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <FaLink className="w-5 h-5" />
          </div>
        </div>
      </div>
      {/* MASTER DATA EXPLORER CONTROLS */}
      <div className="bg-white rounded-none border border-slate-200/90 shadow-xs p-4 space-y-3">
        {/* Table View Tabs and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-none border border-slate-200 flex-wrap">
            <button
              onClick={() => setViewMode("stages")}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "stages"
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaLayerGroup className="w-3.5 h-3.5 text-indigo-600" />
              <span>Stages Table ({stages.length})</span>
            </button>

            <button
              onClick={() => setViewMode("works")}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "works"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaFolder className="w-3.5 h-3.5 text-blue-600" />
              <span>Works Table ({works.length})</span>
            </button>

            <button
              onClick={() => setViewMode("tasks")}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "tasks"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaTasks className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tasks Table ({tasks.length})</span>
            </button>
          </div>

          {/* Right Action: Add button corresponding to active view */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {viewMode === "stages" && (
              <button
                onClick={() => handleOpenAddModal("stage")}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-none text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Stage</span>
              </button>
            )}
            {viewMode === "works" && (
              <button
                onClick={() => handleOpenAddModal("work")}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-none text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Work</span>
              </button>
            )}
            {viewMode === "tasks" && (
              <button
                onClick={() => handleOpenAddModal("task")}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-none text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code or title (e.g. S1, Footing, JCB)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Filter by Stage */}
          {(viewMode === "works" || viewMode === "tasks") && (
            <div>
              <select
                value={filterStageId}
                onChange={(e) => {
                  setFilterStageId(e.target.value);
                  setFilterWorkId("All");
                }}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:border-indigo-500 outline-none font-medium"
              >
                <option value="All">Filter: All Stages ({stages.length})</option>
                {stages.map(s => (
                  <option key={s._id} value={s._id}>
                    [{s.stage_code}] {s.stage_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter by Work (when in Tasks view) */}
          {viewMode === "tasks" && (
            <div>
              <select
                value={filterWorkId}
                onChange={(e) => setFilterWorkId(e.target.value)}
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:border-indigo-500 outline-none font-medium"
              >
                <option value="All">Filter: All Works ({works.length})</option>
                {(filterStageId === "All" ? works : works.filter(w => w.stage_id === filterStageId)).map(w => (
                  <option key={w._id} value={w._id}>
                    [{w.work_code}] {w.work_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ================= TABLE SECTION (MATCHING MATERIAL & SUPPLIER / CONTRACTOR) ================= */}
      <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 shadow-xs overflow-hidden rounded-none">
        <Table
          data={activeTableData}
          columnConfig={activeTableConfig}
          showSrNo={true}
          currentPage={currentPage}
          totalItems={activeTotalRecords}
          itemsPerPage={pageLimit}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setPageLimit(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50, 100]}
          isLoading={isTableLoading}
        />
      </div>

      {/* ================= 5. POPUP MODAL FOR ADD / EDIT MASTER DATA ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          {/* Backdrop dismiss */}
          <div
            className="fixed inset-0"
            onClick={handleCloseModal}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto z-10 transition-all transform animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`px-5 py-4 text-white flex items-center justify-between gap-3 ${
              entryType === "stage"
                ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-700/40"
                : entryType === "work"
                ? "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-700/40"
                : "bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-700/40"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-2 rounded-xl border shrink-0 ${
                  entryType === "stage"
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : entryType === "work"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {editingItem ? <FaEdit className="w-4 h-4" /> : <FaPlus className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-white truncate">
                    {editingItem
                      ? `Edit ${editingItem.type.toUpperCase()}: ${editingItem.item.stage_code || editingItem.item.work_code || editingItem.item.task_code}`
                      : `Add New ${entryType === "stage" ? "Stage (Tier 1)" : entryType === "work" ? "Work (Tier 2)" : "Task (Tier 3)"}`
                    }
                  </h2>
                  <p className="text-[11px] text-slate-300 truncate">
                    {editingItem ? "Update master hierarchy item details" : "Fill details to link with PMS master hierarchy"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Close popup"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveMaster} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Informational Guidance Banner */}
              <div className="p-3 rounded-xl text-xs flex items-start gap-2.5 bg-slate-50 border border-slate-200">
                <FaInfoCircle className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  {entryType === "stage" && (
                    <p className="text-slate-600">
                      <strong className="text-indigo-700">Tier 1 (Stage Master):</strong> Construction ke main stages define karein (jaise S1: Site Preparation, S9: Slab Casting wagera). Iska unique ID aage ke Works me reference hoga.
                    </p>
                  )}
                  {entryType === "work" && (
                    <p className="text-slate-600">
                      <strong className="text-blue-700">Tier 2 (Work Master):</strong> Kis Stage ke andar ye Work aata hai, wo select karein. Is Work me selected Stage ki <span className="font-mono text-indigo-700 font-bold">ObjectId (stage_id)</span> automatically attach hogi.
                    </p>
                  )}
                  {entryType === "task" && (
                    <p className="text-slate-600">
                      <strong className="text-emerald-700">Tier 3 (Task Master):</strong> Stage select karte hi uske Works dropdown me filter ho jayenge. Work choose karte hi uski <span className="font-mono text-blue-700 font-bold">ObjectId (work_id)</span> is Task me automatically save hogi.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* WORK OR TASK: Select Parent Stage Dropdown */}
                {(entryType === "work" || entryType === "task") && (
                  <div className={entryType === "work" ? "md:col-span-2" : ""}>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Parent Stage <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.stage_id}
                      onChange={(e) => handleInputChange("stage_id", e.target.value)}
                      required
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    >
                      <option value="">-- Choose Stage (S1 to S23) --</option>
                      {stages.map(s => (
                        <option key={s._id} value={s._id}>
                          [{s.stage_code}] {s.stage_name}
                        </option>
                      ))}
                    </select>
                    {formData.stage_id && (
                      <p className="text-[10px] text-indigo-600 font-mono mt-1 flex items-center gap-1">
                        <FaLink className="w-2.5 h-2.5" /> Stage ID: {formData.stage_id}
                      </p>
                    )}
                  </div>
                )}

                {/* TASK ONLY: Select Parent Work Dropdown (Cascading) */}
                {entryType === "task" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Parent Work <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.work_id}
                      onChange={(e) => handleInputChange("work_id", e.target.value)}
                      disabled={!formData.stage_id}
                      required
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
                    >
                      <option value="">
                        {!formData.stage_id ? "← Select Stage First" : "-- Choose Work --"}
                      </option>
                      {availableWorksForSelectedStage.map(w => (
                        <option key={w._id} value={w._id}>
                          [{w.work_code}] {w.work_name}
                        </option>
                      ))}
                    </select>
                    {formData.work_id && (
                      <p className="text-[10px] text-emerald-600 font-mono mt-1 flex items-center gap-1">
                        <FaLink className="w-2.5 h-2.5" /> Work ID: {formData.work_id}
                      </p>
                    )}
                  </div>
                )}

                {/* CODE INPUT */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {entryType === "stage" ? "Stage Code" : entryType === "work" ? "Work Code" : "Task Code"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      entryType === "stage" ? "e.g. S1 or S24" :
                      entryType === "work" ? "e.g. S1-W1 or S5-W2" :
                      "e.g. S1-W1-T1"
                    }
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    required
                    className="w-full text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                {/* NAME INPUT */}
                <div className={entryType === "stage" ? "" : "md:col-span-2"}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {entryType === "stage" ? "Stage Name" : entryType === "work" ? "Work Name / Description" : "Task Name / Activity"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      entryType === "stage" ? "e.g. SITE PREPARATION" :
                      entryType === "work" ? "e.g. REINFORCEMENT / BAR BINDING WORK" :
                      "e.g. CLEANING [ BY JCB / LABOUR ]"
                    }
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                {/* STAGE ONLY: DESCRIPTION */}
                {entryType === "stage" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description / Milestone Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Initial land clearance, boundary marking, electricity & temporary water setup"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}

              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-60 ${
                    entryType === "stage"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                      : entryType === "work"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
                      : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                  }`}
                >
                  {submitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FaPlus className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {submitting
                      ? "Saving to Database..."
                      : editingItem
                      ? `Update ${editingItem.type.toUpperCase()}`
                      : entryType === "stage"
                      ? "Save Stage"
                      : entryType === "work"
                      ? "Save Work"
                      : "Save Task"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PmsWbsMasterComponent;
