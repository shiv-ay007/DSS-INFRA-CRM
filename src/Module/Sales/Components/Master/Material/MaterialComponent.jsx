import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { 
  FaBoxes, 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrashAlt, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaTag, 
  FaWarehouse, 
  FaTimes
} from "react-icons/fa";
import { MdInventory2 } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";

const initialMaterials = [
  {
    id: 1,
    code: "MAT-CEM-01",
    name: "UltraTech Super Cement (53 Grade)",
    category: "Cement",
    uom: "Bags (50kg)",
    unitRate: 395,
    stock: 850,
    reorderLevel: 200,
    brand: "UltraTech",
    status: "In Stock"
  },
  {
    id: 2,
    code: "MAT-STL-02",
    name: "Tata Tiscon TMT Rebar Fe550D (12mm)",
    category: "Steel & Rebars",
    uom: "Metric Ton",
    unitRate: 64500,
    stock: 14.5,
    reorderLevel: 5.0,
    brand: "Tata Steel",
    status: "In Stock"
  },
  {
    id: 3,
    code: "MAT-BRK-03",
    name: "Autoclaved Aerated Concrete (AAC) Blocks",
    category: "Bricks & Blocks",
    uom: "Cubic Meter",
    unitRate: 3200,
    stock: 45,
    reorderLevel: 50,
    brand: "Magicrete",
    status: "Low Stock"
  },
  {
    id: 4,
    code: "MAT-ELE-04",
    name: "Polycab 2.5 sq.mm FR Copper Wire",
    category: "Electrical",
    uom: "Roll (90m)",
    unitRate: 1850,
    stock: 120,
    reorderLevel: 30,
    brand: "Polycab",
    status: "In Stock"
  },
  {
    id: 5,
    code: "MAT-PLM-05",
    name: "Astral CPVC Pipe 1 inch SDR 11",
    category: "Plumbing",
    uom: "Length (3m)",
    unitRate: 460,
    stock: 18,
    reorderLevel: 40,
    brand: "Astral",
    status: "Low Stock"
  },
  {
    id: 6,
    code: "MAT-PNT-06",
    name: "Asian Paints Apex Ultima Weatherproof",
    category: "Paints & Finishes",
    uom: "Bucket (20L)",
    unitRate: 4250,
    stock: 0,
    reorderLevel: 15,
    brand: "Asian Paints",
    status: "Out of Stock"
  },
  {
    id: 7,
    code: "MAT-TIL-07",
    name: "Kajaria 600x1200mm Glazed Vitrified Tiles",
    category: "Tiles & Flooring",
    uom: "Sq.Ft",
    unitRate: 68,
    stock: 4200,
    reorderLevel: 1000,
    brand: "Kajaria",
    status: "In Stock"
  }
];

const categories = [
  "All", 
  "Cement", 
  "Steel & Rebars", 
  "Bricks & Blocks", 
  "Electrical", 
  "Plumbing", 
  "Paints & Finishes", 
  "Tiles & Flooring"
];

const MaterialComponent = () => {
  const [materials, setMaterials] = useState(initialMaterials);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "Cement",
    uom: "Bags (50kg)",
    unitRate: "",
    stock: "",
    reorderLevel: "",
    brand: "",
    status: "In Stock"
  });

  // KPI calculations
  const stats = useMemo(() => {
    const total = materials.length;
    const inStock = materials.filter(m => m.status === "In Stock").length;
    const lowStock = materials.filter(m => m.status === "Low Stock").length;
    const outOfStock = materials.filter(m => m.status === "Out of Stock").length;
    return { total, inStock, lowStock, outOfStock };
  }, [materials]);

  // Filtering
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchStatus = statusFilter === "All" || item.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [materials, searchTerm, selectedCategory, statusFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage, itemsPerPage]);

  const getCategoryBadge = (cat) => {
    switch(cat) {
      case "Cement": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Steel & Rebars": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Bricks & Blocks": return "bg-orange-50 text-orange-700 border-orange-200";
      case "Electrical": return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Plumbing": return "bg-sky-50 text-sky-700 border-sky-200";
      case "Paints & Finishes": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Tiles & Flooring": return "bg-teal-50 text-teal-700 border-teal-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (st) => {
    if (st === "In Stock") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (st === "Low Stock") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  const columnConfig = useMemo(() => ({
    code: {
      label: "Item Code & Name",
      align: "left",
      headerClass: "min-w-[240px]",
      render: (val, row) => (
        <div className="py-1">
          <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            {row.code}
          </span>
          <h4 className="font-bold text-slate-900 text-xs mt-1">{row.name}</h4>
        </div>
      )
    },
    category: {
      label: "Category",
      align: "center",
      render: (val) => (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${getCategoryBadge(val)}`}>
          {val}
        </span>
      )
    },
    brand: {
      label: "Brand / Spec",
      align: "center",
      render: (val) => (
        <span className="font-semibold text-xs text-slate-700">{val}</span>
      )
    },
    uom: {
      label: "UOM",
      align: "center",
      render: (val) => (
        <span className="text-xs font-semibold text-slate-600">{val}</span>
      )
    },
    unitRate: {
      label: "Base Rate (₹)",
      align: "center",
      render: (val) => (
        <span className="font-black text-slate-900 text-xs">
          ₹ {Number(val).toLocaleString("en-IN")}
        </span>
      )
    },
    stock: {
      label: "Current Stock",
      align: "center",
      render: (val, row) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">
            {val} {row.uom.split(" ")[0]}
          </span>
          <p className="text-[10px] text-slate-400">Min: {row.reorderLevel}</p>
        </div>
      )
    },
    status: {
      label: "Status",
      align: "center",
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(val)}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            val === "In Stock" ? "bg-emerald-500" : val === "Low Stock" ? "bg-amber-500" : "bg-rose-500"
          }`} />
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
            onClick={() => handleDelete(row.id, row.name)}
            title="Delete Material"
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <FaTrashAlt className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  }), []);

  // Add Material
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.unitRate) {
      toast.error("Material name and unit rate are required!");
      return;
    }

    const stockNum = Number(formData.stock) || 0;
    const reorderNum = Number(formData.reorderLevel) || 10;
    let computedStatus = formData.status;
    if (stockNum === 0) computedStatus = "Out of Stock";
    else if (stockNum <= reorderNum) computedStatus = "Low Stock";

    const newMaterial = {
      id: Date.now(),
      code: formData.code.trim() || `MAT-${formData.category.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      name: formData.name.trim(),
      category: formData.category,
      uom: formData.uom,
      unitRate: Number(formData.unitRate),
      stock: stockNum,
      reorderLevel: reorderNum,
      brand: formData.brand.trim() || "Standard",
      status: computedStatus
    };

    setMaterials(prev => [newMaterial, ...prev]);
    toast.success("Material added successfully!");
    setIsModalOpen(false);
    setFormData({
      code: "",
      name: "",
      category: "Cement",
      uom: "Bags (50kg)",
      unitRate: "",
      stock: "",
      reorderLevel: "",
      brand: "",
      status: "In Stock"
    });
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete material "${name}"?`)) {
      setMaterials(prev => prev.filter(m => m.id !== id));
      toast.info(`Deleted material "${name}"`);
    }
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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-xl p-4 shadow-lg border border-teal-700/50 overflow-hidden mb-2">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
              <FaBoxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Material
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3 text-emerald-300" /> MasterForm
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-1 max-w-xl font-normal">
                Manage construction materials, standard base rates, measurement units (UOM), and real-time inventory tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-md shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Total Materials"
          value={stats.total}
          subtitle="Cataloged items"
          icon={<MdInventory2 className="w-5 h-5 text-white" />}
          IconBg={<MdInventory2 className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-cyan-600 to-blue-700"
          label="In Stock"
          value={stats.inStock}
          subtitle="Healthy buffer level"
          icon={<FaCheckCircle className="w-5 h-5 text-white" />}
          IconBg={<FaCheckCircle className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          label="Low Stock Alert"
          value={stats.lowStock}
          subtitle="Needs purchase reorder"
          icon={<FaExclamationTriangle className="w-5 h-5 text-white" />}
          IconBg={<FaExclamationTriangle className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-rose-600 to-red-700"
          label="Out of Stock"
          value={stats.outOfStock}
          subtitle="Procurement pending"
          icon={<FaTimesCircle className="w-5 h-5 text-white" />}
          IconBg={<FaTimesCircle className="w-20 h-20" />}
        />
      </div>

      {/* ================= SEARCH & FILTER CONTROL BAR ================= */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search material by name, code, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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

        {/* Status Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400 text-xs" />
            <span className="text-xs font-semibold text-slate-500">Stock Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Items</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            {filteredMaterials.length} Materials
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
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/25"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ================= MATERIAL TABLE (Standard Table Design) ================= */}
      <div className="bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <Table
          data={paginatedMaterials}
          columnConfig={columnConfig}
          showSrNo={true}
          currentPage={currentPage}
          totalItems={filteredMaterials.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50]}
        />
      </div>

      {/* ================= ADD MATERIAL MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FaBoxes className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Add Material</h3>
                  <p className="text-xs text-emerald-200">Register new item to construction master</p>
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
                  Material Name & Spec <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UltraTech Super Cement 53 Grade"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Cement">Cement</option>
                    <option value="Steel & Rebars">Steel & Rebars</option>
                    <option value="Bricks & Blocks">Bricks & Blocks</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Paints & Finishes">Paints & Finishes</option>
                    <option value="Tiles & Flooring">Tiles & Flooring</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Brand / Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. UltraTech / Tata Steel"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit of Measurement (UOM)
                  </label>
                  <select
                    value={formData.uom}
                    onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Bags (50kg)">Bags (50kg)</option>
                    <option value="Metric Ton">Metric Ton</option>
                    <option value="Cubic Meter">Cubic Meter</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                    <option value="Running Feet">Running Feet</option>
                    <option value="Nos / Pieces">Nos / Pieces</option>
                    <option value="Roll (90m)">Roll (90m)</option>
                    <option value="Bucket (20L)">Bucket (20L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Base Rate (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 395"
                    value={formData.unitRate}
                    onChange={(e) => setFormData({ ...formData, unitRate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min. Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 100"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialComponent;
