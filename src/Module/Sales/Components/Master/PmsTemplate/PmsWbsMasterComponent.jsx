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
export const PMS_MASTER_STATUSES_KEY = "pms_master_statuses_data";
export const PMS_MASTER_STAGES_KEY = "pms_master_stages_data";
export const PMS_MASTER_WORKS_KEY = "pms_master_works_data";
export const PMS_MASTER_TASKS_KEY = "pms_master_tasks_data";

import pmsWbsService from "../../../services/pmsWbsService";
import Table from "../../../../../Common/Components/Table";
import { useAuth } from "../../../../../context/AuthContext";

const PmsWbsMasterComponent = () => {
  const navigate = useNavigate();
  const { role, isObserver, user } = useAuth();
  const currentRole = role || user?.role || localStorage.getItem("role") || "";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  // 1. Data States (Loaded from localStorage or fetched from backend API)
  const [statuses, setStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_STATUSES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [stages, setStages] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_STAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [works, setWorks] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_WORKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(PMS_MASTER_TASKS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Loading & Submitting States
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PMS_MASTER_STATUSES_KEY, JSON.stringify(statuses));
    } catch (e) {
      console.error(e);
    }
  }, [statuses]);

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
      const [wbsRes, statusRes] = await Promise.all([
        pmsWbsService.getAllWbsData().catch(() => null),
        pmsWbsService.getAllProjectStatuses().catch(() => null)
      ]);

      if (wbsRes && wbsRes.success && wbsRes.data) {
        if (Array.isArray(wbsRes.data.stages) && wbsRes.data.stages.length > 0) {
          setStages(wbsRes.data.stages);
        }
        if (Array.isArray(wbsRes.data.works) && wbsRes.data.works.length > 0) {
          setWorks(wbsRes.data.works);
        }
        if (Array.isArray(wbsRes.data.tasks) && wbsRes.data.tasks.length > 0) {
          setTasks(wbsRes.data.tasks);
        }
      }

      if (statusRes && statusRes.success && Array.isArray(statusRes.data)) {
        setStatuses(statusRes.data);
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

  // 2. View Mode State: 'statuses' | 'stages' | 'works' | 'tasks'
  const [viewMode, setViewMode] = useState("statuses");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // 2.1 Backend Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit, setPageLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [paginatedData, setPaginatedData] = useState([]);
  const [isTableLoading, setIsTableLoading] = useState(true);

  // Debounce search term by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page to 1 on tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Fetch Paginated Table Data from Backend
  const fetchPaginatedTableData = async () => {
    try {
      setIsTableLoading(true);
      let res;
      if (viewMode === "statuses") {
        res = await pmsWbsService.getProjectStatusesPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch
        });
      } else if (viewMode === "stages") {
        res = await pmsWbsService.getStagesPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch
        });
      } else if (viewMode === "works") {
        res = await pmsWbsService.getWorksPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch
        });
      } else if (viewMode === "tasks") {
        res = await pmsWbsService.getTasksPaginated({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch
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
  }, [viewMode, currentPage, pageLimit, debouncedSearch]);

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

  // 3. Form State: 'status' | 'stage' | 'work' | 'task'
  const [entryType, setEntryType] = useState("status");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    color: "#3B82F6",
    description: "",
    work_done_by: "CONTRACTOR",
    contractor_type: "",
    tools: "",
    order: 1
  });

  const [editingItem, setEditingItem] = useState(null); // { type: 'status'|'stage'|'work'|'task', item }

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Open Modal for Creating New Entry
  const handleOpenAddModal = (type = viewMode === "statuses" ? "status" : viewMode === "tasks" ? "task" : viewMode === "works" ? "work" : "stage") => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    setEditingItem(null);
    setEntryType(type);

    let suggestedCode = "";
    if (type === "status") {
      suggestedCode = `ST_${statuses.length + 1}`;
    } else if (type === "stage") {
      suggestedCode = `S${stages.length + 1}`;
    } else if (type === "work") {
      suggestedCode = `W${works.length + 1}`;
    } else if (type === "task") {
      suggestedCode = `T${tasks.length + 1}`;
    }

    setFormData({
      code: suggestedCode,
      name: "",
      color: "#3B82F6",
      description: "",
      work_done_by: "CONTRACTOR",
      contractor_type: "",
      tools: "",
      order: type === "status" ? statuses.length + 1 : 1
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Handle Form Submit (Saves into MongoDB collections: pms_project_statuses, pms_stages, pms_works, pms_tasks)
  const handleSaveMaster = async (e) => {
    e.preventDefault();

    if (entryType !== "status" && !formData.code.trim()) {
      toast.error("Please fill required Code field!");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please fill required Name field!");
      return;
    }

    setSubmitting(true);
    try {
      if (entryType === "status") {
        const payload = {
          status_name: formData.name.trim(),
          color: formData.color || "#3B82F6",
        };
        if (formData.code && formData.code.trim()) {
          payload.status_code = formData.code.trim().toUpperCase();
        }

        if (editingItem) {
          const res = await pmsWbsService.updateProjectStatus(editingItem.item._id, payload);
          const updated = res && res.success && res.data ? res.data : { ...editingItem.item, ...payload };
          setStatuses(prev => prev.map(s => s._id === editingItem.item._id ? updated : s));
          toast.success(`Status ${payload.status_name} updated successfully in pms_project_statuses!`);
        } else {
          const res = await pmsWbsService.createProjectStatus(payload);
          const created = res && res.success && res.data ? res.data : { ...payload, _id: `status_${Date.now()}` };
          setStatuses(prev => [...prev, created]);
          toast.success(`Status ${payload.status_name} saved into pms_project_statuses!`);
        }
      } else if (entryType === "stage") {
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
        const payload = {
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
        const payload = {
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
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    setEditingItem({ type, item });
    setEntryType(type);
    if (type === "status") {
      setFormData({
        code: item.status_code,
        name: item.status_name,
        color: item.color || "#3B82F6",
        description: item.description || "",
        work_done_by: "CONTRACTOR",
        contractor_type: "",
        tools: "",
        materials: "",
        order: item.order || 1
      });
    } else if (type === "stage") {
      setFormData({
        code: item.stage_code,
        name: item.stage_name,
        color: "#3B82F6",
        description: item.description || "",
        work_done_by: "CONTRACTOR",
        contractor_type: "",
        tools: "",
        materials: "",
        order: item.order || 1
      });
    } else if (type === "work") {
      setFormData({
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
  const handleDeleteStatus = async (statusItem) => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    if (window.confirm(`Delete Status "${statusItem.status_name}"?`)) {
      try {
        if (statusItem._id) {
          await pmsWbsService.deleteProjectStatus(statusItem._id);
        }
        setStatuses(prev => prev.filter(s => s._id !== statusItem._id));
        toast.info(`Deleted Status ${statusItem.status_name}`);
        fetchPaginatedTableData();
      } catch (err) {
        toast.error("Failed to delete status");
      }
    }
  };

  const handleDeleteStage = (stage) => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    if (window.confirm(`Delete Stage "${stage.stage_code}: ${stage.stage_name}"?`)) {
      setStages(prev => prev.filter(s => s._id !== stage._id));
      toast.info(`Deleted Stage ${stage.stage_code}`);
    }
  };

  const handleDeleteWork = (work) => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    if (window.confirm(`Delete Work "${work.work_code}: ${work.work_name}"?`)) {
      setWorks(prev => prev.filter(w => w._id !== work._id));
      toast.info(`Deleted Work ${work.work_code}`);
    }
  };

  const handleDeleteTask = (task) => {
    if (isUserObserver) {
      toast.info("Observer Mode: Action is disabled.");
      return;
    }
    if (window.confirm(`Delete Task "${task.task_code}: ${task.task_name}"?`)) {
      setTasks(prev => prev.filter(t => t._id !== task._id));
      toast.info(`Deleted Task ${task.task_code}`);
    }
  };

  // Filtering for Tables (Fallback and search cache)
  const filteredStatuses = useMemo(() => {
    return statuses.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        (s.status_code && s.status_code.toLowerCase().includes(term)) ||
        (s.status_name && s.status_name.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term))
      );
    });
  }, [statuses, searchTerm]);

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
      return (
        w.work_code.toLowerCase().includes(term) ||
        w.work_name.toLowerCase().includes(term)
      );
    });
  }, [works, searchTerm]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const term = searchTerm.toLowerCase();
      return (
        t.task_code.toLowerCase().includes(term) ||
        t.task_name.toLowerCase().includes(term) ||
        (t.contractor_type && t.contractor_type.toLowerCase().includes(term)) ||
        (t.tools && t.tools.toLowerCase().includes(term))
      );
    });
  }, [tasks, searchTerm]);

  // Current Display Data (Backend Paginated Data with client fallback)
  const currentStatusesList = useMemo(() => {
    if (viewMode === "statuses" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "statuses" && totalRecords === 0 && !isTableLoading && debouncedSearch) return [];
    return filteredStatuses.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredStatuses, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch]);

  const currentStagesList = useMemo(() => {
    if (viewMode === "stages" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "stages" && totalRecords === 0 && !isTableLoading && debouncedSearch) return [];
    return filteredStages.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredStages, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch]);

  const currentWorksList = useMemo(() => {
    if (viewMode === "works" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "works" && totalRecords === 0 && !isTableLoading && debouncedSearch) return [];
    return filteredWorks.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredWorks, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch]);

  const currentTasksList = useMemo(() => {
    if (viewMode === "tasks" && paginatedData.length > 0) return paginatedData;
    if (viewMode === "tasks" && totalRecords === 0 && !isTableLoading && debouncedSearch) return [];
    return filteredTasks.slice((currentPage - 1) * pageLimit, currentPage * pageLimit);
  }, [viewMode, paginatedData, filteredTasks, currentPage, pageLimit, totalRecords, isTableLoading, debouncedSearch]);

  const activeTotalRecords = totalRecords || (
    viewMode === "statuses" ? filteredStatuses.length :
    viewMode === "stages" ? filteredStages.length :
    viewMode === "works" ? filteredWorks.length : filteredTasks.length
  );
  const activeTotalPages = totalPages || Math.ceil(activeTotalRecords / pageLimit) || 1;

  // Column configurations for the master views
  const statusesColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-28 min-w-[100px]",
      render: (_, st) => (
        !isUserObserver ? (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => handleStartEdit("status", st)}
              title="Edit Status"
              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded cursor-pointer transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDeleteStatus(st)}
              title="Delete Status"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer transition-colors"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      )
    },
    status_name: {
      label: "Status Display Name",
      align: "left",
      headerClass: "min-w-[240px]",
      render: (val, st) => (
        <div className="flex items-center gap-2.5">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white"
            style={{ backgroundColor: st.color || "#3B82F6" }}
          />
          <span className="font-bold text-slate-900">{val}</span>
          <span
            className="text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1"
            style={{
              backgroundColor: (st.color || "#3B82F6") + "18",
              color: st.color || "#3B82F6",
              border: `1px solid ${(st.color || "#3B82F6")}35`
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color || "#3B82F6" }} />
            {val}
          </span>
        </div>
      )
    },
    color: {
      label: "Color Code",
      align: "center",
      headerClass: "w-36 min-w-[120px]",
      render: (val) => (
        <div className="flex items-center justify-center gap-2">
          <span
            className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300 shadow-xs"
            style={{ backgroundColor: val || "#3B82F6" }}
          />
          <span className="font-mono text-xs font-semibold text-slate-700 uppercase">
            {val || "#3B82F6"}
          </span>
        </div>
      )
    }
  }), [isUserObserver]);

  const stagesColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-36 min-w-[140px]",
      render: (_, stage) => (
        !isUserObserver ? (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => handleStartEdit("stage", stage)}
              title="Edit Stage"
              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
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
    }
  }), [isUserObserver]);

  const worksColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-24 min-w-[80px]",
      render: (_, work) => (
        !isUserObserver ? (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => handleStartEdit("work", work)}
              title="Edit Work"
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded cursor-pointer transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
      )
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
      headerClass: "min-w-[260px]",
      render: (val) => (
        <span className="font-bold text-slate-900">{val}</span>
      )
    }
  }), [isUserObserver]);

  const tasksColumnConfig = useMemo(() => ({
    actions: {
      label: "Action",
      align: "center",
      headerClass: "w-24 min-w-[80px]",
      render: (_, task) => (
        !isUserObserver ? (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => handleStartEdit("task", task)}
              title="Edit Task"
              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )
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
      headerClass: "min-w-[260px]",
      render: (val) => (
        <span className="font-bold text-slate-900">{val}</span>
      )
    }
  }), [isUserObserver]);

  const activeTableConfig = useMemo(() => {
    if (viewMode === "statuses") return statusesColumnConfig;
    if (viewMode === "stages") return stagesColumnConfig;
    if (viewMode === "works") return worksColumnConfig;
    return tasksColumnConfig;
  }, [viewMode, statusesColumnConfig, stagesColumnConfig, worksColumnConfig, tasksColumnConfig]);

  const activeTableData = useMemo(() => {
    if (viewMode === "statuses") return currentStatusesList;
    if (viewMode === "stages") return currentStagesList;
    if (viewMode === "works") return currentWorksList;
    return currentTasksList;
  }, [viewMode, currentStatusesList, currentStagesList, currentWorksList, currentTasksList]);

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
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status Master</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{statuses.length}</h3>
            <p className="text-[11px] text-slate-400">Project Statuses</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <FaCheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Stage Master</p>
            <h3 className="text-2xl font-black text-indigo-700 mt-0.5">{stages.length}</h3>
            <p className="text-[11px] text-slate-400">Master Stages</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <FaLayerGroup className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Work Master</p>
            <h3 className="text-2xl font-black text-blue-600 mt-0.5">{works.length}</h3>
            <p className="text-[11px] text-slate-400">Independent Works</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <FaFolder className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Task Master</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{tasks.length}</h3>
            <p className="text-[11px] text-slate-400">Independent Tasks</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FaTasks className="w-5 h-5" />
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
              onClick={() => setViewMode("statuses")}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "statuses"
                  ? "bg-white text-amber-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaCheckCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Status Table ({statuses.length})</span>
            </button>

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

          {/* Right Action: Add button corresponding to active view (Hidden for Observer) */}
          {!isUserObserver && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              {viewMode === "statuses" && (
                <button
                  onClick={() => handleOpenAddModal("status")}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-none text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <FaPlus className="w-3 h-3" />
                  <span>Add Status</span>
                </button>
              )}
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
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="w-full max-w-md">
          {/* Search Input */}
          <div className="relative">
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${viewMode} by code or name...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-none focus:bg-white focus:border-indigo-500 outline-none"
            />
          </div>
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
              entryType === "status"
                ? "bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border-b border-amber-700/40"
                : entryType === "stage"
                ? "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-700/40"
                : entryType === "work"
                ? "bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-700/40"
                : "bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-b border-emerald-700/40"
            }`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-2 rounded-xl border shrink-0 ${
                  entryType === "status"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : entryType === "stage"
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
                      ? `Edit ${editingItem.type.toUpperCase()}: ${editingItem.item.status_name || editingItem.item.status_code || editingItem.item.stage_code || editingItem.item.work_code || editingItem.item.task_code}`
                      : `Add New ${entryType === "status" ? "Project Status" : entryType === "stage" ? "Stage" : entryType === "work" ? "Work" : "Task"}`
                    }
                  </h2>
                  <p className="text-[11px] text-slate-300 truncate">
                    {editingItem ? "Update master item details" : "Fill details to save in PMS master"}
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
                  {entryType === "status" && (
                    <p className="text-slate-600">
                      <strong className="text-amber-700">Project Status Master:</strong> Dynamic project execution statuses configure karein (jaise On Track, Delayed, In Progress, On Hold, Completed).
                    </p>
                  )}
                  {entryType === "stage" && (
                    <p className="text-slate-600">
                      <strong className="text-indigo-700">Stage Master:</strong> Construction ke main stages define karein (jaise S1: Site Preparation, S9: Slab Casting wagera).
                    </p>
                  )}
                  {entryType === "work" && (
                    <p className="text-slate-600">
                      <strong className="text-blue-700">Work Master:</strong> Independent Work item add karein (jaise W1: REINFORCEMENT / BAR BINDING, W2: BRICK WORK wagera).
                    </p>
                  )}
                  {entryType === "task" && (
                    <p className="text-slate-600">
                      <strong className="text-emerald-700">Task Master:</strong> Independent Task / Activity item add karein (jaise T1: MANUAL EXCAVATION, T2: CLEANING wagera).
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CODE INPUT (FOR STAGE, WORK, TASK ONLY) */}
                {entryType !== "status" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {entryType === "stage" ? "Stage Code" : entryType === "work" ? "Work Code" : "Task Code"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={
                        entryType === "stage" ? "e.g. S1 or S24" :
                        entryType === "work" ? "e.g. W1 or W2" :
                        "e.g. T1 or T2"
                      }
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      required
                      className="w-full text-xs font-mono font-bold uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                )}

                {/* NAME INPUT */}
                <div className={entryType === "status" ? "" : ""}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {entryType === "status" ? "Status Display Name" : entryType === "stage" ? "Stage Name" : entryType === "work" ? "Work Name / Description" : "Task Name / Activity"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={
                      entryType === "status" ? "e.g. On Track or Delayed" :
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

                {/* STATUS ONLY: COLOR PICKER */}
                {entryType === "status" && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Color Indicator
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.color || "#3B82F6"}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        className="w-10 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer bg-white shrink-0"
                      />
                      <input
                        type="text"
                        value={formData.color || "#3B82F6"}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        className="w-full text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 focus:bg-white focus:border-indigo-500 outline-none"
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                )}

                {/* DESCRIPTION (STAGE ONLY) */}
                {entryType === "stage" && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description / Milestone Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Initial land clearance, boundary marking"
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
                    entryType === "status"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
                      : entryType === "stage"
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
                      : entryType === "status"
                      ? "Save Status"
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
