import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MATERIAL_CATEGORIES,
  SUB_CATEGORIES_MAP,
  MATERIAL_TYPES,
  UOM_LIST
} from "./AddMaterialComponent";
import materialService from "../../../services/materialService";
import {
  FaBoxes,
  FaPlus,
  FaSearch,
  FaFilter,
  FaEdit,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaExternalLinkAlt,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaTruck,
  FaLayerGroup,
  FaRulerCombined,
  FaMoneyBillWave,
  FaWarehouse,
  FaShieldAlt,
  FaInfoCircle
} from "react-icons/fa";
import { MdInventory2 } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";

const MaterialComponent = () => {
  const navigate = useNavigate();

  // State initialized without ANY dummy data - only live backend API data
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedUom, setSelectedUom] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch materials strictly from live API
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await materialService.getAllMaterials({ limit: 500 });
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setMaterials(res.data.data);
      } else if (res?.data && Array.isArray(res.data)) {
        setMaterials(res.data);
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error("Failed to load materials from API:", err);
      toast.error("Failed to load materials from server");
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Dynamic filter options based on materials data & constants
  const brandsList = useMemo(() => {
    const set = new Set();
    materials.forEach((m) => {
      const b = m.brand || m.brandMake;
      if (b && typeof b === "string" && b.trim()) {
        set.add(b.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [materials]);

  const subCategoriesList = useMemo(() => {
    if (selectedCategory && selectedCategory !== "All" && SUB_CATEGORIES_MAP[selectedCategory]) {
      return ["All", ...SUB_CATEGORIES_MAP[selectedCategory]];
    }
    const set = new Set();
    materials.forEach((m) => {
      const s = m.subCategory || m.materialSubCategory;
      if (s && typeof s === "string" && s.trim()) {
        set.add(s.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [materials, selectedCategory]);

  const uomList = useMemo(() => {
    const set = new Set();
    materials.forEach((m) => {
      const u = m.baseUom || m.uom;
      if (u && typeof u === "string" && u.trim()) {
        set.add(u.trim());
      }
    });
    UOM_LIST.forEach((u) => set.add(u));
    return ["All", ...Array.from(set).sort()];
  }, [materials]);

  const materialTypesList = useMemo(() => {
    const set = new Set(MATERIAL_TYPES);
    materials.forEach((m) => {
      if (m.materialType && typeof m.materialType === "string" && m.materialType.trim()) {
        set.add(m.materialType.trim());
      }
    });
    return ["All", ...Array.from(set)];
  }, [materials]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedSubCategory !== "All") count++;
    if (selectedBrand !== "All") count++;
    if (selectedUom !== "All") count++;
    if (selectedType !== "All") count++;
    if (statusFilter !== "All") count++;
    return count;
  }, [selectedCategory, selectedSubCategory, selectedBrand, selectedUom, selectedType, statusFilter]);

  const hasActiveFilters = searchTerm !== "" || activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedSubCategory("All");
    setSelectedBrand("All");
    setSelectedUom("All");
    setSelectedType("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // KPI calculations from real live data
  const stats = useMemo(() => {
    const total = materials.length;
    const active = materials.filter(
      (m) => m.status === "Active" || m.status === "In Stock"
    ).length;
    const lowStock = materials.filter(
      (m) =>
        m.status === "Low Stock" ||
        (m.stock !== undefined &&
          m.reorderLevel !== undefined &&
          Number(m.stock) <= Number(m.reorderLevel))
    ).length;
    const inactive = materials.filter(
      (m) =>
        m.status === "Inactive" ||
        m.status === "Out of Stock" ||
        m.status === "Blocked"
    ).length;
    return { total, active, lowStock, inactive };
  }, [materials]);

  // Filtering based on table columns
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const name = item.name || item.materialName || "";
      const code = item.code || item.materialCode || "";
      const brand = item.brand || item.brandMake || "";
      const spec = item.specificationGrade || item.standardSpecCode || "";
      const category = item.category || item.materialCategory || "";
      const subCategory = item.subCategory || item.materialSubCategory || "";
      const uom = item.baseUom || item.uom || "";
      const itemType = item.materialType || "";
      const supplier =
        item.preferredSupplier ||
        item.preferredSupplierId?.name ||
        "";

      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        !q ||
        name.toLowerCase().includes(q) ||
        code.toLowerCase().includes(q) ||
        brand.toLowerCase().includes(q) ||
        spec.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        subCategory.toLowerCase().includes(q) ||
        supplier.toLowerCase().includes(q);

      const matchCat =
        selectedCategory === "All" ||
        category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSubCat =
        selectedSubCategory === "All" ||
        subCategory.toLowerCase() === selectedSubCategory.toLowerCase();

      const matchBrand =
        selectedBrand === "All" ||
        brand.toLowerCase() === selectedBrand.toLowerCase();

      const matchUom =
        selectedUom === "All" ||
        uom.toLowerCase() === selectedUom.toLowerCase();

      const matchType =
        selectedType === "All" ||
        itemType.toLowerCase() === selectedType.toLowerCase();

      const itemStatus = item.status || "Active";
      const matchStatus =
        statusFilter === "All" ||
        itemStatus.toLowerCase() === statusFilter.toLowerCase();

      return (
        matchSearch &&
        matchCat &&
        matchSubCat &&
        matchBrand &&
        matchUom &&
        matchType &&
        matchStatus
      );
    });
  }, [
    materials,
    searchTerm,
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    selectedUom,
    selectedType,
    statusFilter
  ]);

  const paginatedMaterials = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMaterials.slice(start, start + itemsPerPage);
  }, [filteredMaterials, currentPage, itemsPerPage]);

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "Roofing & Ceiling":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "Pipes, Fittings & Sanitaryware":
      case "Plumbing":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Doors & Windows":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Bricks, Blocks & Aggregates":
      case "Bricks & Blocks":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Cement & Concrete":
      case "Cement":
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "Steel & Structural Metals":
      case "Steel & Rebars":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Paints, Putty & Coatings":
      case "Paints & Finishes":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Ceramic & Vitrified Tiles":
      case "Tiles & Flooring":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Electrical Cables & Switchgears":
      case "Electrical":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Wood, Plywood & Timber":
        return "bg-stone-50 text-stone-700 border-stone-200";
      case "Hardware & Fasteners":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  // Table Column Configuration matching Supplier / Contractor Master
  const columnConfig = useMemo(
    () => ({
      // 1. Action Column (Immediately next to SR. NO. - ONLY View & Edit)
      actions: {
        label: "Action",
        align: "center",
        headerClass: "w-32 min-w-[125px]",
        render: (_, row) => {
          const rowId = row._id || row.id;
          return (
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => navigate(`/sales/master/material/details/${rowId}`)}
                title="View Complete Details"
                className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer shadow-xs"
              >
                <FaEye className="w-3.5 h-3.5 text-emerald-600" />
                <span>View</span>
              </button>
              <button
                onClick={() => navigate(`/sales/master/material/edit-material/${rowId}`)}
                title="Edit Material Details"
                className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
              >
                <FaEdit className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit</span>
              </button>
            </div>
          );
        }
      },

      // 2. Material Name & Code (Centered, bold name, code badge)
      material: {
        label: "Material Name & Code",
        align: "center",
        headerClass: "min-w-[220px]",
        render: (_, row) => (
          <div className="py-1 flex flex-col items-center justify-center text-center">
            <h4 className="font-bold text-slate-900 text-sm leading-snug">
              {row.name || row.materialName}
            </h4>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-center">
              <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block">
                {row.code || row.materialCode}
              </span>
              {row.materialType && (
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {row.materialType}
                </span>
              )}
            </div>
          </div>
        )
      },

      // 3. Category & Sub-Category
      category: {
        label: "Category & Sub-Cat",
        align: "center",
        headerClass: "min-w-[180px]",
        render: (_, row) => {
          const cat = row.category || row.materialCategory || "General";
          const subCat = row.subCategory || row.materialSubCategory;
          return (
            <div className="text-center py-1">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-md border inline-block ${getCategoryBadge(
                  cat
                )}`}
              >
                {cat}
              </span>
              {subCat && (
                <p className="text-[11px] text-slate-500 font-medium mt-1">
                  {subCat}
                </p>
              )}
            </div>
          );
        }
      },

      // 4. Brand / Spec & Grade
      brandSpec: {
        label: "Brand & Specification",
        align: "center",
        headerClass: "min-w-[180px]",
        render: (_, row) => {
          const brand = row.brand || row.brandMake || "Generic";
          const spec = row.specificationGrade || row.standardSpecCode;
          return (
            <div className="text-center py-1">
              <p className="font-bold text-slate-900 text-xs sm:text-sm">{brand}</p>
              {spec && (
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{spec}</p>
              )}
            </div>
          );
        }
      },

      // 5. UOM (Base & Purchase)
      uom: {
        label: "UOM",
        align: "center",
        headerClass: "min-w-[120px]",
        render: (_, row) => {
          const baseUom = row.baseUom || row.uom || "Unit";
          const purchaseUom = row.purchaseUom;
          return (
            <div className="text-center py-1">
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 inline-block">
                {baseUom}
              </span>
              {purchaseUom && purchaseUom !== baseUom && (
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  Purch: {purchaseUom}
                </p>
              )}
            </div>
          );
        }
      },

      // 6. Base Rate & Tax (HSN)
      rateTax: {
        label: "Standard Rate (₹)",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (_, row) => {
          const rate =
            row.standardPurchaseRate !== undefined &&
            row.standardPurchaseRate !== ""
              ? row.standardPurchaseRate
              : row.unitRate || 0;
          return (
            <div className="text-center py-1">
              <span className="font-black text-slate-900 text-xs sm:text-sm">
                ₹ {Number(rate).toLocaleString("en-IN")}
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5 text-[10px] text-slate-500">
                {row.taxGstRate !== undefined && row.taxGstRate !== "" && (
                  <span className="bg-amber-50 text-amber-800 font-semibold px-1.5 py-0.2 rounded border border-amber-200">
                    GST {row.taxGstRate}%
                  </span>
                )}
                {row.hsnSacCode && (
                  <span className="text-slate-400 font-mono">
                    HSN: {row.hsnSacCode}
                  </span>
                )}
              </div>
            </div>
          );
        }
      },

      // 7. Stock / MOQ & Lead Time
      stockMoq: {
        label: "Stock & Lead Time",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (_, row) => {
          const stockVal = row.stock !== undefined ? row.stock : row.moq || 0;
          const uomShort = ((row.baseUom || row.uom) || "").split(" ")[0];
          return (
            <div className="text-center py-1">
              <span className="font-bold text-slate-800 text-xs">
                {stockVal} {uomShort}
              </span>
              {row.leadTimeDays ? (
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                  Lead: <span className="font-bold text-slate-700">{row.leadTimeDays}d</span>
                </p>
              ) : row.reorderLevel ? (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Min: {row.reorderLevel}
                </p>
              ) : null}
            </div>
          );
        }
      },

      // 8. Preferred Supplier
      preferredSupplier: {
        label: "Preferred Supplier",
        align: "center",
        headerClass: "min-w-[170px]",
        render: (_, row) => {
          const suppName =
            row.preferredSupplierId?.name || row.preferredSupplier;
          return (
            <div className="text-center py-1">
              {suppName ? (
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    {suppName}
                  </span>
                  {row.preferredSupplierId?.code && (
                    <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                      {row.preferredSupplierId.code}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </div>
          );
        }
      },

      // 9. Status
      status: {
        label: "Status",
        align: "center",
        headerClass: "min-w-[110px]",
        render: (val, row) => {
          const st = val || row.status || "Active";
          const isAct = st === "Active" || st === "In Stock";
          const isLow = st === "Low Stock";
          const isBlk = st === "Inactive" || st === "Blocked" || st === "Out of Stock";
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                isAct
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isLow
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : isBlk
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAct
                    ? "bg-emerald-500"
                    : isLow
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              {st}
            </span>
          );
        }
      }
    }),
    [navigate]
  );

  // Compact KPI Card Component (Matching Supplier Master)
  const KpiCard = ({ gradient, icon, label, value, subtitle, IconBg }) => (
    <div
      className={`relative overflow-hidden rounded-xl p-4 shadow-md ${gradient} text-white group`}
    >
      <div className="absolute -right-4 -bottom-6 opacity-15 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {IconBg}
      </div>
      <div className="relative z-1 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">
            {label}
          </p>
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
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-xl px-4 py-3 shadow-md border border-teal-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <FaBoxes className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    Material Master Directory
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <HiSparkles className="w-2.5 h-2.5 text-emerald-300" /> Database Live
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/90 mt-0.5 leading-none font-normal">
                  Approved master directory of construction materials, UOM standards, base rates & inventory specs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`relative p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm border ${
                  showFilters
                    ? "bg-white text-emerald-950 border-white shadow-md scale-105"
                    : "bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-600/50 hover:border-emerald-500"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className={`w-3.5 h-3.5 ${showFilters ? "text-emerald-700" : "text-emerald-300"}`} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/sales/master/material/add-material")}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Material</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-slate-800 to-slate-900"
          label="Total Materials"
          value={stats.total}
          subtitle="Saved in master database"
          icon={<MdInventory2 className="w-5 h-5 text-white" />}
          IconBg={<MdInventory2 className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Active Materials"
          value={stats.active}
          subtitle="Ready for PMS tasks"
          icon={<FaCheckCircle className="w-5 h-5 text-white" />}
          IconBg={<FaCheckCircle className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-600 to-orange-700"
          label="Low Stock / Alert"
          value={stats.lowStock}
          subtitle="Needs purchase reorder"
          icon={<FaExclamationTriangle className="w-5 h-5 text-white" />}
          IconBg={<FaExclamationTriangle className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-rose-600 to-red-700"
          label="Inactive / Out of Stock"
          value={stats.inactive}
          subtitle="Restricted or depleted"
          icon={<FaTimesCircle className="w-5 h-5 text-white" />}
          IconBg={<FaTimesCircle className="w-20 h-20" />}
        />
      </div>

      {/* ================= SEARCH & TABLE-BASED FILTER CONTROL BAR (COLLAPSIBLE) ================= */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top Row: Search Box, Found Count, Reset & Close */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search material by name, code, brand, spec, supplier..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
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
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Reset all filters"
                >
                  <FaTimes className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}

              <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                {filteredMaterials.length} Found
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

          {/* Bottom Row: Dropdown Filters Corresponding to Table Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* 1. Category (Column: CATEGORY & SUB-CAT) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubCategory("All");
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                selectedCategory !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All Categories</option>
              {MATERIAL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Sub-Category (Column: CATEGORY & SUB-CAT) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sub-Category
            </label>
            <select
              value={selectedSubCategory}
              onChange={(e) => {
                setSelectedSubCategory(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                selectedSubCategory !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All Sub-Categories</option>
              {subCategoriesList
                .filter((sub) => sub !== "All")
                .map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          {/* 3. Brand (Column: BRAND & SPECIFICATION) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Brand / Make
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                selectedBrand !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All Brands</option>
              {brandsList
                .filter((b) => b !== "All")
                .map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
          </div>

          {/* 4. UOM (Column: UOM) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              UOM
            </label>
            <select
              value={selectedUom}
              onChange={(e) => {
                setSelectedUom(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                selectedUom !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All UOMs</option>
              {uomList
                .filter((u) => u !== "All")
                .map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
            </select>
          </div>

          {/* 5. Material Type (Column: MATERIAL NAME & CODE) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Material Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                selectedType !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All Types</option>
              {materialTypesList
                .filter((t) => t !== "All")
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </select>
          </div>

          {/* 6. Status (Column: STATUS) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                statusFilter !== "All"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
              }`}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Inactive">Inactive</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>
        </div>
      )}

      {/* ================= MATERIAL TABLE (MATCHING SUPPLIER/CONTRACTOR) ================= */}
      <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <FaSpinner className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading materials from database...</span>
          </div>
        ) : filteredMaterials.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 text-sm">
              No materials found in database
            </p>
            <p className="mt-1">
              Add your first material item using the "Add Material" button above.
            </p>
          </div>
        ) : (
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
            itemsPerPageOptions={[10, 25, 50, 100]}
          />
        )}
      </div>
    </div>
  );
};

export default MaterialComponent;
