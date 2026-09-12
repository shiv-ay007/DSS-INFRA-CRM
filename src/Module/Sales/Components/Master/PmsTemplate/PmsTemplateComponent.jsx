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
  FaTrashAlt, 
  FaCopy, 
  FaClock, 
  FaLayerGroup, 
  FaCheckCircle, 
  FaRegFolderOpen, 
  FaTimes,
  FaArrowRight
} from "react-icons/fa";
import { HiOutlineTemplate } from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";
import { PMS_TEMPLATES_STORAGE_KEY } from "./CreatePmsTemplateComponent";

export const DEFAULT_INITIAL_TEMPLATES = [
  {
    id: 1,
    code: "PMS-RES-01",
    name: "Luxury Villa Construction Template",
    category: "Residential",
    projectType: "Full Turnkey Construction",
    milestones: 7,
    tasksCount: 38,
    duration: "24 Weeks",
    budgetTier: "Luxury",
    status: "Active",
    description: "End-to-end milestone workflow from foundation excavation to luxury interior handover.",
    createdDate: "2025-01-15"
  },
  {
    id: 2,
    code: "PMS-COM-02",
    name: "Commercial Office Fitout Standard",
    category: "Commercial",
    projectType: "Interior Fitout & Joinery",
    milestones: 5,
    tasksCount: 26,
    duration: "12 Weeks",
    budgetTier: "Premium",
    status: "Active",
    description: "Standard corporate turnkey workspace execution, HVAC, networking & aesthetic fitout.",
    createdDate: "2025-02-04"
  },
  {
    id: 3,
    code: "PMS-INF-03",
    name: "Boundary Wall & Road Infrastructure",
    category: "Infrastructure",
    projectType: "Road & External Infrastructure",
    milestones: 4,
    tasksCount: 18,
    duration: "8 Weeks",
    budgetTier: "Standard",
    status: "Active",
    description: "Civil infrastructure, paving, storm drainage, and perimeter security fencing.",
    createdDate: "2025-02-20"
  },
  {
    id: 4,
    code: "PMS-INT-04",
    name: "Apartment Interior Design & Joinery",
    category: "Interior Turnkey",
    projectType: "Interior Fitout & Joinery",
    milestones: 6,
    tasksCount: 29,
    duration: "10 Weeks",
    budgetTier: "Premium",
    status: "Draft",
    description: "Custom modular kitchen, false ceilings, lighting layouts and bespoke furniture carpentry.",
    createdDate: "2025-03-01"
  },
  {
    id: 5,
    code: "PMS-IND-05",
    name: "Industrial Warehouse PEB Erection",
    category: "Industrial",
    projectType: "PEB & Industrial Shed",
    milestones: 6,
    tasksCount: 32,
    duration: "18 Weeks",
    budgetTier: "Standard",
    status: "Active",
    description: "Pre-engineered building erection, heavy concrete flooring, overhead crane rails & roofing.",
    createdDate: "2025-03-05"
  }
];

const categories = ["All", "Residential", "Commercial", "Infrastructure", "Interior Turnkey", "Industrial"];

const PmsTemplateComponent = () => {
  const navigate = useNavigate();

  // Load templates from localStorage or fallback
  const [templates, setTemplates] = useState(() => {
    try {
      const stored = localStorage.getItem(PMS_TEMPLATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse stored PMS templates", e);
    }
    // Set initial in localStorage if empty
    localStorage.setItem(PMS_TEMPLATES_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_TEMPLATES));
    return DEFAULT_INITIAL_TEMPLATES;
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Sync to localStorage whenever templates change
  const updateTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    try {
      localStorage.setItem(PMS_TEMPLATES_STORAGE_KEY, JSON.stringify(newTemplates));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter(t => t.status === "Active").length;
    const draft = templates.filter(t => t.status === "Draft").length;
    const uniqueCats = new Set(templates.map(t => t.category)).size;
    return { total, active, draft, uniqueCats };
  }, [templates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchSearch =
        (template.name && template.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (template.code && template.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === "All" || template.category === selectedCategory;
      const matchStatus = statusFilter === "All" || template.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [templates, searchTerm, selectedCategory, statusFilter]);

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

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      const updated = templates.filter(t => t.id !== id);
      updateTemplates(updated);
      toast.info(`Deleted "${name}"`);
    }
  };

  const handleDuplicate = (template) => {
    const duplicated = {
      ...template,
      id: Date.now(),
      code: `${template.code}-COPY`,
      name: `${template.name} (Copy)`,
      status: "Draft",
      createdDate: new Date().toISOString().split("T")[0]
    };
    const updated = [duplicated, ...templates];
    updateTemplates(updated);
    toast.success(`Duplicated "${template.name}"`);
  };

  const columnConfig = useMemo(() => ({
    code: {
      label: "Code & Template Name",
      align: "left",
      headerClass: "min-w-[260px]",
      render: (val, row) => (
        <div className="py-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
              {row.code}
            </span>
            {row.projectType && (
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                {row.projectType}
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-xs mt-1 hover:text-indigo-600 cursor-pointer" onClick={() => navigate(`/sales/master/pms-template/edit/${row.id}`)}>
            {row.name}
          </h4>
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{row.description}</p>
        </div>
      )
    },
    category: {
      label: "Category",
      align: "center",
      render: (val) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getCategoryColor(val)}`}>
          {val}
        </span>
      )
    },
    milestones: {
      label: "Milestones & Tasks",
      align: "center",
      render: (val, row) => (
        <div className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          <span className="text-indigo-600 font-bold">{row.milestones || row.milestoneList?.length || 0}</span> Milestones
          <span className="text-slate-400 mx-1.5">•</span>
          <span className="text-slate-600">{row.tasksCount || 0} Tasks</span>
        </div>
      )
    },
    duration: {
      label: "Est. Duration",
      align: "center",
      render: (val) => (
        <span className="font-semibold text-xs text-slate-700">{val}</span>
      )
    },
    budgetTier: {
      label: "Budget Tier",
      align: "center",
      render: (val) => (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
          val === "Luxury" 
            ? "bg-purple-100 text-purple-800"
            : val === "Premium"
            ? "bg-blue-100 text-blue-800"
            : "bg-slate-100 text-slate-700"
        }`}>
          {val}
        </span>
      )
    },
    status: {
      label: "Status",
      align: "center",
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
          val === "Active"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${val === "Active" ? "bg-emerald-500" : "bg-amber-500"}`} />
          {val}
        </span>
      )
    },
    actions: {
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setSelectedTemplate(row)}
            title="View Details"
            className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <FaEye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => navigate(`/sales/master/pms-template/edit/${row.id}`)}
            title="Edit Template"
            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <FaEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDuplicate(row)}
            title="Duplicate Template"
            className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 transition-colors cursor-pointer"
          >
            <FaCopy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            title="Delete Template"
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <FaTrashAlt className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  }), [navigate, templates]);

  // Compact KPI Card Component
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
          {/* Glow Effects */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

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

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/sales/master/pms-template/create")}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-md shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Create PMS Template</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          label="Total Templates"
          value={stats.total}
          subtitle="Configured for sales"
          icon={<FaFileContract className="w-5 h-5 text-white" />}
          IconBg={<FaFileContract className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Active Templates"
          value={stats.active}
          subtitle="Ready to attach to leads"
          icon={<FaCheckCircle className="w-5 h-5 text-white" />}
          IconBg={<FaCheckCircle className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          label="Draft / Review"
          value={stats.draft}
          subtitle="Pending approval"
          icon={<FaClock className="w-5 h-5 text-white" />}
          IconBg={<FaClock className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-purple-600 to-fuchsia-700"
          label="Categories"
          value={stats.uniqueCats}
          subtitle="Sectors covered"
          icon={<FaLayerGroup className="w-5 h-5 text-white" />}
          IconBg={<FaLayerGroup className="w-20 h-20" />}
        />
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search by template name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <FaFilter className="text-slate-400 w-3 h-3" />
            <span className="font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white font-medium"
            >
              <option value="All">All Status</option>
              <option value="Active">Active Only</option>
              <option value="Draft">Draft Only</option>
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-md">
            {filteredTemplates.length} Found
          </span>
        </div>
      </div>

      {/* ================= CATEGORY PILLS ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ================= TABLE LIST ================= */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        {paginatedTemplates.length > 0 ? (
          <Table
            data={paginatedTemplates}
            columnConfig={columnConfig}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalItems={filteredTemplates.length}
          />
        ) : (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
              <FaRegFolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No Templates Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search or category filters.</p>
            <button
              onClick={() => navigate("/sales/master/pms-template/create")}
              className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              + Create Template
            </button>
          </div>
        )}
      </div>

      {/* ================= VIEW TEMPLATE DETAIL MODAL ================= */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-cyan-300 font-bold bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  {selectedTemplate.code}
                </span>
                <span className="text-xs text-slate-300">{selectedTemplate.category}</span>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedTemplate.name}</h3>
                {selectedTemplate.projectType && (
                  <p className="text-xs text-indigo-600 font-semibold mt-0.5">{selectedTemplate.projectType}</p>
                )}
                <p className="text-xs text-slate-600 mt-1.5">{selectedTemplate.description}</p>
              </div>

              {/* Grid specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Category</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedTemplate.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Duration</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Budget Tier</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedTemplate.budgetTier}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Status</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedTemplate.status}</p>
                </div>
              </div>

              {/* Milestones List */}
              {Array.isArray(selectedTemplate.milestoneList) && selectedTemplate.milestoneList.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FaLayerGroup className="text-indigo-600" />
                    Milestones & Phases ({selectedTemplate.milestoneList.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedTemplate.milestoneList.map((m, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{m.name}</span>
                          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                            {m.paymentPercent}% • {m.duration}
                          </span>
                        </div>
                        {m.deliverables && (
                          <p className="text-[11px] text-slate-500 mt-1">{m.deliverables}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions / Exclusions */}
              {(selectedTemplate.inclusions || selectedTemplate.exclusions) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
                  {selectedTemplate.inclusions && (
                    <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                      <span className="font-bold text-emerald-800">Inclusions:</span>
                      <p className="text-slate-700 mt-1">{selectedTemplate.inclusions}</p>
                    </div>
                  )}
                  {selectedTemplate.exclusions && (
                    <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100">
                      <span className="font-bold text-rose-800">Exclusions:</span>
                      <p className="text-slate-700 mt-1">{selectedTemplate.exclusions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = selectedTemplate.id;
                  setSelectedTemplate(null);
                  navigate(`/sales/master/pms-template/edit/${id}`);
                }}
                className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <FaEdit className="w-3 h-3" />
                <span>Edit Full Template</span>
              </button>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-1.5 bg-slate-800 text-white hover:bg-slate-900 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PmsTemplateComponent;
