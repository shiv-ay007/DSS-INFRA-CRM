import React, { useState, useMemo } from "react";
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
  FaTimes
} from "react-icons/fa";
import { HiOutlineTemplate } from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";

// Initial mock templates
const initialTemplates = [
  {
    id: 1,
    code: "PMS-RES-01",
    name: "Luxury Villa Construction Template",
    category: "Residential",
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
  const [templates, setTemplates] = useState(initialTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Form State for new template
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Residential",
    milestones: 5,
    duration: "",
    budgetTier: "Standard",
    status: "Active",
    description: ""
  });

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
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());

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

  const columnConfig = useMemo(() => ({
    code: {
      label: "Code & Template Name",
      align: "left",
      headerClass: "min-w-[260px]",
      render: (val, row) => (
        <div className="py-1">
          <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
            {row.code}
          </span>
          <h4 className="font-bold text-slate-900 text-xs mt-1">{row.name}</h4>
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
          <span className="text-indigo-600 font-bold">{row.milestones}</span> Milestones
          <span className="text-slate-400 mx-1.5">•</span>
          <span className="text-slate-600">{row.tasksCount} Tasks</span>
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
  }), []);

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Template name is required!");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      code: formData.code.trim() || `PMS-${formData.category.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name.trim(),
      category: formData.category,
      milestones: Number(formData.milestones) || 4,
      tasksCount: (Number(formData.milestones) || 4) * 5,
      duration: formData.duration.trim() || "12 Weeks",
      budgetTier: formData.budgetTier,
      status: formData.status,
      description: formData.description.trim() || "Custom project milestone execution framework.",
      createdDate: new Date().toISOString().split("T")[0]
    };

    setTemplates(prev => [newTemplate, ...prev]);
    toast.success("PMS Template created successfully!");
    setIsModalOpen(false);
    setFormData({
      code: "",
      name: "",
      category: "Residential",
      milestones: 5,
      duration: "",
      budgetTier: "Standard",
      status: "Active",
      description: ""
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== id));
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
    setTemplates(prev => [duplicated, ...prev]);
    toast.success(`Duplicated "${template.name}"`);
  };

  // Compact KPI Card Component
  const KpiCard = ({ gradient, icon, label, value, subtitle, IconBg }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 shadow-md ${gradient} text-white group`}>
      <div className="absolute -right-4 -bottom-6 opacity-15 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {IconBg}
      </div>
      <div className="relative z-10 flex items-start justify-between">
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
    <div className="space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* ================= STICKY & THIN HEADER BANNER ================= */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl p-4 shadow-lg border border-indigo-700/50 overflow-hidden mb-2">
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
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-lg shadow-md shadow-cyan-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Create PMS Template</span>
            </button>
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
          gradient="bg-gradient-to-br from-purple-600 to-pink-600"
          label="Categories"
          value={stats.uniqueCats}
          subtitle="Sectors covered"
          icon={<FaLayerGroup className="w-5 h-5 text-white" />}
          IconBg={<FaLayerGroup className="w-20 h-20" />}
        />
      </div>

      {/* ================= SEARCH & FILTER CONTROL BAR ================= */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by template name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400 text-xs" />
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredTemplates.length} Found
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ================= DATA TABLE (Standard Table Design) ================= */}
      <div className="bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <Table
          data={paginatedTemplates}
          columnConfig={columnConfig}
          showSrNo={true}
          currentPage={currentPage}
          totalItems={filteredTemplates.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50]}
        />
      </div>

      {/* ================= CREATE TEMPLATE MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaFileContract className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Create PMS Template</h3>
                  <p className="text-xs text-indigo-200">Add project milestone execution template</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Duplex Villa 4BHK Turnkey Workflow"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Interior Turnkey">Interior Turnkey</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Code</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Milestones</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.milestones}
                    onChange={(e) => setFormData({ ...formData, milestones: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Est. Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 16 Weeks"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Budget Tier</label>
                  <select
                    value={formData.budgetTier}
                    onChange={(e) => setFormData({ ...formData, budgetTier: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={() => setFormData({ ...formData, status: "Active" })}
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Draft"
                      checked={formData.status === "Draft"}
                      onChange={() => setFormData({ ...formData, status: "Draft" })}
                    />
                    Draft
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Scope</label>
                <textarea
                  rows={3}
                  placeholder="Outline what milestones and scopes are covered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW TEMPLATE DETAIL MODAL ================= */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 flex items-center justify-between">
              <span className="font-mono text-xs text-cyan-300 font-bold">{selectedTemplate.code}</span>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="text-lg font-bold text-slate-900">{selectedTemplate.name}</h3>
              <p className="text-sm text-slate-600">{selectedTemplate.description}</p>
              
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Category:</span>
                  <p className="font-bold text-slate-800">{selectedTemplate.category}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Duration:</span>
                  <p className="font-bold text-slate-800">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Milestones:</span>
                  <p className="font-bold text-slate-800">{selectedTemplate.milestones} Phases</p>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Status:</span>
                  <p className="font-bold text-slate-800">{selectedTemplate.status}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PmsTemplateComponent;
