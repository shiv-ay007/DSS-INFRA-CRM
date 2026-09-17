import React, { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaSearch,
  FaCheck,
  FaCopy,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlus,
  FaTrashAlt,
  FaTimes
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import ReactSelectMulti from "./ReactSelectMulti";

export const DEFAULT_WORK_WILL_DONE_BY = [
  "LABOUR",
  "DURMUT",
  "LABOUR - BAR BINDER [LOHAR]",
  "CONTRACTOR = SHUTTERING"
];

export const CONTRACTOR_TYPES_LIST = [
  "Main Contractor",
  "Civil Contractor",
  "Excavation Contractor",
  "RCC Contractor",
  "Shuttering Contractor",
  "Masonry Contractor",
  "Steel Contractor",
  "Plaster Contractor",
  "Waterproofing Contractor",
  "Tile Contractor",
  "Marble Contractor",
  "Electrical Contractor",
  "Plumbing Contractor",
  "Sanitary Contractor",
  "Carpentry Contractor",
  "Window Contractor",
  "Interior Contractor",
  "Painting Contractor",
  "Fabrication Contractor"
];

export const TOOLS_VEHICLES_MASTER = [
  "DURMUT",
  "MIXING MACHINE",
  "BAR BINDER'S [LOHAR'S] TOOL",
  "SAHUL (LATTU)",
  "VIBRATOR",
  "WATER SYSTEM MANAGEMENT",
  "LABLER MACHINE",
  "EXCAVATOR",
  "CONCRETE PUMP",
  "SCAFFOLDING SET",
  "TRACTOR / TIPPER",
  "GRINDER / CUTTER MACHINE"
];

export const SUPPLIER_TYPES_LIST = [
  "Manufacturer",
  "Authorized Distributor",
  "Wholesaler / Stockist",
  "Local Retail Supplier",
  "Direct Importer",
  "Trading Company",
  "Agent / Broker"
];

export const TIME_UNITS_LIST = ["Days", "Hours", "Weeks"];

/**
 * Reusable Execution & Resource Details Field Component
 * Used across Stage, Work, and Task levels in WBS PMS Template.
 */
const ExecutionResourceFieldData = ({
  title = "EXECUTION & RESOURCE DETAILS",
  subtitle = "Configure execution team, materials & timeline",
  level = "stage", // "stage" | "work" | "task"
  badge = "",
  data = {},
  onChange,
  onCopyFromParent,
  copyLabel,
  onApplyToAllChildren,
  applyToAllLabel,
  contractorList = [],
  materialList = [],
  supplierList = [],
  toolsOptions = TOOLS_VEHICLES_MASTER,
  errors = {}
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null); // 'contractor' | 'material_${idx}' | 'supplier_${idx}' | null
  const [contractorSearch, setContractorSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Theme accents based on level
  const themeConfig = {
    stage: {
      dotColor: "bg-indigo-600",
      badgeBg: "bg-indigo-600 text-white font-black",
      titleColor: "text-indigo-950 font-black",
      headerBg: "bg-indigo-100/95 border-2 border-indigo-300",
      gridBorder: "border-2 border-indigo-200",
      gridBg: "bg-white",
      reactSelectTheme: "indigo"
    },
    work: {
      dotColor: "bg-blue-600",
      badgeBg: "bg-blue-600 text-white font-black",
      titleColor: "text-blue-950 font-black",
      headerBg: "bg-blue-100/95 border-2 border-blue-300",
      gridBorder: "border-2 border-blue-200",
      gridBg: "bg-white",
      reactSelectTheme: "blue"
    },
    task: {
      dotColor: "bg-emerald-600",
      badgeBg: "bg-emerald-600 text-white font-black",
      titleColor: "text-emerald-950 font-black",
      headerBg: "bg-emerald-100/95 border-2 border-emerald-300",
      gridBorder: "border-2 border-emerald-200",
      gridBg: "bg-white",
      reactSelectTheme: "emerald"
    }
  }[level] || {
    dotColor: "bg-indigo-600",
    badgeBg: "bg-indigo-600 text-white font-black",
    titleColor: "text-indigo-950 font-black",
    headerBg: "bg-indigo-100/95 border-2 border-indigo-300",
    gridBorder: "border-2 border-indigo-200",
    gridBg: "bg-white",
    reactSelectTheme: "indigo"
  };

  const handleChange = (field, val) => {
    if (onChange) {
      onChange(field, val);
    }
  };

  // Work Will Done By selection -> auto-fills Contractor Type & Tools
  const handleSelectWorkDoneBy = (workerOrContractor) => {
    const foundContractor = contractorList.find(
      (c) => c.name?.toLowerCase() === workerOrContractor.toLowerCase()
    );

    let updatedTools = Array.isArray(data.toolsVehicles) ? [...data.toolsVehicles] : [];
    let matchedType = data.contractorType || "";

    if (foundContractor) {
      matchedType = foundContractor.contractorType || matchedType;
      if (Array.isArray(foundContractor.tools)) {
        foundContractor.tools.forEach((t) => {
          if (!updatedTools.includes(t)) updatedTools.push(t);
        });
      }
    } else if (workerOrContractor.includes("SHUTTERING")) {
      matchedType = "Shuttering Contractor";
      if (!updatedTools.includes("DURMUT")) updatedTools.push("DURMUT");
    } else if (workerOrContractor.includes("BAR BINDER")) {
      matchedType = "Steel Contractor";
      if (!updatedTools.includes("BAR BINDER'S [LOHAR'S] TOOL")) {
        updatedTools.push("BAR BINDER'S [LOHAR'S] TOOL");
      }
    } else if (workerOrContractor.includes("DURMUT")) {
      if (!updatedTools.includes("DURMUT")) updatedTools.push("DURMUT");
    }

    if (onChange) {
      onChange("workWillDoneBy", workerOrContractor);
      onChange("contractorId", foundContractor ? (foundContractor.id || foundContractor._id) : null);
      onChange("contractorType", matchedType);
      onChange("toolsVehicles", updatedTools);
    }

    setActiveDropdown(null);
  };

  // Derive materials array from data.materials or fallback to single fields
  const materialsList =
    Array.isArray(data.materials) && data.materials.length > 0
      ? data.materials
      : [
          {
            materialRequired: data.materialRequired || "",
            materialId: data.materialId || null,
            supplierName: data.supplierName || "",
            supplierId: data.supplierId || null,
            supplierType: data.supplierType || ""
          }
        ];

  const handleMaterialItemChange = (index, field, val) => {
    const nextList = materialsList.map((item, idx) =>
      idx === index ? { ...item, [field]: val } : item
    );
    if (onChange) {
      onChange("materials", nextList);
      if (index === 0) {
        onChange(field, val);
      }
    }
  };

  // Material selection -> auto-fills Preferred Supplier for specific row
  const handleSelectMaterialItem = (index, mat) => {
    const autoSuppName = mat.supplier || mat.preferredSupplier || materialsList[index]?.supplierName || "";
    const autoSuppType = mat.supplierType || materialsList[index]?.supplierType || "";
    const matObjId = mat._id || mat.id || null;

    const matchedSupp = (supplierList || []).find(
      (s) => (s.name || s.supplierName || "").toLowerCase() === autoSuppName.toLowerCase()
    );
    const suppObjId = matchedSupp?._id || matchedSupp?.id || materialsList[index]?.supplierId || null;

    const nextList = materialsList.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        materialId: matObjId,
        materialRequired: mat.name,
        supplierName: autoSuppName,
        supplierId: suppObjId,
        supplierType: autoSuppType
      };
    });

    if (onChange) {
      onChange("materials", nextList);
      if (index === 0) {
        onChange("materialId", matObjId);
        onChange("materialRequired", mat.name);
        if (autoSuppName) onChange("supplierName", autoSuppName);
        if (suppObjId) onChange("supplierId", suppObjId);
        if (autoSuppType) onChange("supplierType", autoSuppType);
      }
    }

    setActiveDropdown(null);
  };

  // Supplier selection -> auto-fills Supplier Type for specific row
  const handleSelectSupplierItem = (index, supp) => {
    const suppObjId = supp._id || supp.id || null;
    const nextList = materialsList.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        supplierId: suppObjId,
        supplierName: supp.name,
        supplierType: supp.supplierType || item.supplierType || ""
      };
    });

    if (onChange) {
      onChange("materials", nextList);
      if (index === 0) {
        onChange("supplierId", suppObjId);
        onChange("supplierName", supp.name);
        if (supp.supplierType) onChange("supplierType", supp.supplierType);
      }
    }

    setActiveDropdown(null);
  };

  const handleAddMaterialItem = () => {
    const nextList = [
      ...materialsList,
      {
        materialRequired: "",
        materialId: null,
        supplierName: "",
        supplierId: null,
        supplierType: ""
      }
    ];
    if (onChange) {
      onChange("materials", nextList);
    }
  };

  const handleRemoveMaterialItem = (index) => {
    if (materialsList.length <= 1) {
      const cleared = [
        {
          materialRequired: "",
          materialId: null,
          supplierName: "",
          supplierId: null,
          supplierType: ""
        }
      ];
      if (onChange) {
        onChange("materials", cleared);
        onChange("materialRequired", "");
        onChange("materialId", null);
        onChange("supplierName", "");
        onChange("supplierId", null);
        onChange("supplierType", "");
      }
      return;
    }
    const nextList = materialsList.filter((_, idx) => idx !== index);
    if (onChange) {
      onChange("materials", nextList);
      if (index === 0 && nextList.length > 0) {
        onChange("materialRequired", nextList[0].materialRequired || "");
        onChange("materialId", nextList[0].materialId || null);
        onChange("supplierName", nextList[0].supplierName || "");
        onChange("supplierId", nextList[0].supplierId || null);
        onChange("supplierType", nextList[0].supplierType || "");
      }
    }
  };

  const filteredContractorList = contractorList.filter((c) =>
    c.name?.toLowerCase().includes(contractorSearch.toLowerCase())
  );

  const filteredMaterials = materialList.filter((m) =>
    m.name?.toLowerCase().includes(materialSearch.toLowerCase())
  );

  const filteredSuppliers = supplierList.filter((s) =>
    s.name?.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  const isImportantFilled = Boolean(data.workWillDoneBy && String(data.workWillDoneBy).trim() !== "");

  return (
    <div className="space-y-3.5">
      {/* Prominently Highlighted Level Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border ${themeConfig.headerBg}`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          {badge && (
            <span
              className={`text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg ${themeConfig.badgeBg}`}
            >
              {badge}
            </span>
          )}
          <span className={`text-xs font-black uppercase tracking-wider ${themeConfig.titleColor}`}>
            {title}
          </span>

          {/* Important Field Filled Indication Badge */}
          {isImportantFilled ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300">
              <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
              <span>Mandatory Details Filled</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-300">
              <FaExclamationCircle className="w-2.5 h-2.5 text-amber-600" />
              <span>Mandatory Fields Pending (*)</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {subtitle && (
            <span className="text-[10px] text-slate-500 font-semibold hidden md:inline-block">
              {subtitle}
            </span>
          )}

          {onCopyFromParent && (
            <button
              type="button"
              onClick={onCopyFromParent}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title={copyLabel || "Copy details from parent"}
            >
              <FaCopy className="w-3 h-3 text-slate-500" />
              <span>{copyLabel || "Copy from Above"}</span>
            </button>
          )}

          {onApplyToAllChildren && (
            <button
              type="button"
              onClick={onApplyToAllChildren}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg transition-colors cursor-pointer"
              title={applyToAllLabel || "Apply details to all children"}
            >
              <HiSparkles className="w-3 h-3 text-indigo-600" />
              <span>{applyToAllLabel || "Apply to All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Execution Resource Container */}
      <div className={`space-y-4 ${themeConfig.gridBg} p-4 rounded-xl border ${themeConfig.gridBorder}`}>
        {/* Row 1: Execution Team & Tools (3 Columns: Work Will Done By, Contractor Type, Tools / Vehicle) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Work Will Done By (Searchable Single DDL with Close Option) */}
          <div
            className="relative"
            ref={activeDropdown === "contractor" ? dropdownRef : null}
          >
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Work Will Done By <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() =>
                setActiveDropdown(activeDropdown === "contractor" ? null : "contractor")
              }
              className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white transition-colors ${
                errors.workWillDoneBy
                  ? "border-red-500 bg-red-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={data.workWillDoneBy ? "text-slate-900 truncate" : "text-slate-400"}>
                {data.workWillDoneBy || "Select Contractor / Worker..."}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>
            {errors.workWillDoneBy && (
              <p className="text-[11px] text-red-500 mt-0.5">{errors.workWillDoneBy}</p>
            )}

            {/* Dropdown Popup */}
            {activeDropdown === "contractor" && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
                <div className="relative mb-2 flex items-center">
                  <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search contractor..."
                    value={contractorSearch}
                    onChange={(e) => setContractorSearch(e.target.value)}
                    className="w-full pl-7 pr-7 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setActiveDropdown(null)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    title="Close"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">
                    Contractor Master List
                  </p>
                  {filteredContractorList.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400 italic">
                      No contractors found in master
                    </div>
                  ) : (
                    filteredContractorList.map((c) => (
                      <div
                        key={c.id || c.name}
                        onClick={() => handleSelectWorkDoneBy(c.name)}
                        className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                          data.workWillDoneBy === c.name
                            ? "bg-slate-100 font-bold text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        <div>
                          <span className="block font-medium">{c.name}</span>
                          {c.contractorType && (
                            <span className="text-[10px] text-slate-400">{c.contractorType}</span>
                          )}
                        </div>
                        {data.workWillDoneBy === c.name && (
                          <FaCheck className="text-indigo-600 w-3 h-3" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 2. Contractor Type (Conditional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contractor Type <span className="text-slate-400 font-normal">(Conditional)</span>
            </label>
            <select
              value={data.contractorType || ""}
              onChange={(e) => handleChange("contractorType", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white ${
                errors.contractorType ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <option value="">-- Select Contractor Type --</option>
              {CONTRACTOR_TYPES_LIST.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
            {errors.contractorType && (
              <p className="text-[11px] text-red-500 mt-0.5">{errors.contractorType}</p>
            )}
          </div>

          {/* 3. Tools / Vehicle (Multi-select) */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Tools / Vehicle</span>
              <span className="text-[10px] text-slate-400">Multi-select</span>
            </label>
            <ReactSelectMulti
              options={toolsOptions.map((t) => ({ value: t, label: t }))}
              value={data.toolsVehicles || []}
              onChange={(newTools) => handleChange("toolsVehicles", newTools)}
              placeholder="Select tools / vehicles..."
              themeColor={themeConfig.reactSelectTheme}
              allowSelectAll={true}
            />
          </div>
        </div>

        {/* Row 2: Dedicated Material & Supplier Section (1 Row x 4 Fields + Add More) */}
        <div className="space-y-3 pt-2.5 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Materials & Supplier Details
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md font-semibold">
                {materialsList.length} {materialsList.length === 1 ? "Item" : "Items"}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {materialsList.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2"
              >
                {/* 3 Input Fields in a Single Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  {/* Field 1: Material Required */}
                  <div
                    className="relative"
                    ref={activeDropdown === `material_${idx}` ? dropdownRef : null}
                  >
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Material Required {materialsList.length > 1 && <span className="text-slate-400 font-normal">#{idx + 1}</span>}
                    </label>
                    <div
                      onClick={() => {
                        setMaterialSearch("");
                        setActiveDropdown(activeDropdown === `material_${idx}` ? null : `material_${idx}`);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300"
                    >
                      <span className={item.materialRequired ? "text-slate-900 truncate" : "text-slate-400"}>
                        {item.materialRequired || "Select Material Master..."}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                    </div>

                    {activeDropdown === `material_${idx}` && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
                        <div className="relative mb-2 flex items-center">
                          <FaSearch className="absolute left-2.5 text-slate-400 w-3 h-3" />
                          <input
                            type="text"
                            placeholder="Search material..."
                            value={materialSearch}
                            onChange={(e) => setMaterialSearch(e.target.value)}
                            className="w-full pl-7 pr-7 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(null)}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Close"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {filteredMaterials.map((m) => (
                            <div
                              key={m.id || m.name}
                              onClick={() => handleSelectMaterialItem(idx, m)}
                              className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                                item.materialRequired === m.name
                                   ? "bg-slate-100 font-bold text-slate-900"
                                  : "text-slate-700"
                              }`}
                            >
                              <div>
                                <span className="block font-medium">{m.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {m.category || m.unit} {m.supplier ? `• ${m.supplier}` : ""}
                                </span>
                              </div>
                              {item.materialRequired === m.name && (
                                <FaCheck className="text-indigo-600 w-3 h-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 3: Supplier Name */}
                  <div
                    className="relative"
                    ref={activeDropdown === `supplier_${idx}` ? dropdownRef : null}
                  >
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Supplier Name
                    </label>
                    <div
                      onClick={() => {
                        setSupplierSearch("");
                        setActiveDropdown(activeDropdown === `supplier_${idx}` ? null : `supplier_${idx}`);
                      }}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300"
                    >
                      <span className={item.supplierName ? "text-slate-900 truncate" : "text-slate-400"}>
                        {item.supplierName || "Select Supplier..."}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                    </div>

                    {activeDropdown === `supplier_${idx}` && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
                        <div className="relative mb-2 flex items-center">
                          <FaSearch className="absolute left-2.5 text-slate-400 w-3 h-3" />
                          <input
                            type="text"
                            placeholder="Search supplier..."
                            value={supplierSearch}
                            onChange={(e) => setSupplierSearch(e.target.value)}
                            className="w-full pl-7 pr-7 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setActiveDropdown(null)}
                            className="absolute right-2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                            title="Close"
                          >
                            <FaTimes className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="space-y-1">
                          {filteredSuppliers.map((s) => (
                            <div
                              key={s.id || s.name}
                              onClick={() => handleSelectSupplierItem(idx, s)}
                              className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                                item.supplierName === s.name
                                  ? "bg-slate-100 font-bold text-slate-900"
                                  : "text-slate-700"
                              }`}
                            >
                              <div>
                                <span className="block font-medium">{s.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {s.supplierType} {s.city ? `• ${s.city}` : ""}
                                </span>
                              </div>
                              {item.supplierName === s.name && (
                                <FaCheck className="text-indigo-600 w-3 h-3" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field 4: Supplier Type + Delete button */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Supplier Type
                      </label>
                      <select
                        value={item.supplierType || ""}
                        onChange={(e) => handleMaterialItemChange(idx, "supplierType", e.target.value)}
                        className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
                      >
                        <option value="">-- Select Supplier Type --</option>
                        {SUPPLIER_TYPES_LIST.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialItem(idx)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer shrink-0 mt-5"
                        title="Remove this material row"
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Option Button Underneath */}
          <div>
            <button
              type="button"
              onClick={handleAddMaterialItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300 rounded-lg transition-colors cursor-pointer"
            >
              <FaPlus className="w-3 h-3 text-indigo-600" />
              <span>Add Material / Supplier</span>
            </button>
          </div>
        </div>

        {/* Row 3: Remaining Timeline, Instruction & Remarks */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2.5 border-t border-slate-200">
          {/* Maximum Time to Complete Task (Number + Unit DDL) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Maximum Time to Complete Task
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={data.maxTimeToComplete ?? "3"}
                onChange={(e) => handleChange("maxTimeToComplete", e.target.value)}
                className={`w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
                placeholder="3"
              />
              <select
                value={data.timeUnit || "Days"}
                onChange={(e) => handleChange("timeUnit", e.target.value)}
                className={`w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
              >
                {TIME_UNITS_LIST.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Deadline Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
            <input
              type="date"
              value={data.deadlineDate || ""}
              onChange={(e) => handleChange("deadlineDate", e.target.value)}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
            />
          </div>

          {/* Maximum Time for Work Completion [D ; H] */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Max Time Completion [D ; H]
              </label>
              {((parseInt(data.durationDays || 0, 10) || 0) > 0 ||
                (parseInt(data.durationHours || 0, 10) || 0) > 0) && (
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  ≈ {(parseInt(data.durationDays || 0, 10) || 0) * 24 +
                    (parseInt(data.durationHours || 0, 10) || 0)}{" "}
                  h
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={data.durationDays ?? "3"}
                onChange={(e) => handleChange("durationDays", e.target.value)}
                className={`w-20 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
                placeholder="0"
              />
              <span className="text-xs font-bold text-slate-500">D</span>
              <span className="text-slate-400 font-bold mx-1">;</span>
              <input
                type="number"
                min="0"
                max="23"
                value={data.durationHours ?? "0"}
                onChange={(e) => handleChange("durationHours", e.target.value)}
                className={`w-20 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
                placeholder="0"
              />
              <span className="text-xs font-bold text-slate-500">H</span>
            </div>
          </div>

          {/* Training Material / Instruction / Checklist */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Training Material / Instruction / Checklist
            </label>
            <textarea
              rows={2}
              value={data.instruction || ""}
              onChange={(e) => handleChange("instruction", e.target.value)}
              placeholder={`Guidelines, training instructions or checklists for ${badge || "this level"}...`}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
            />
          </div>

          {/* Remark */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 mb-1">Remark</label>
            <textarea
              rows={2}
              value={data.remark || ""}
              onChange={(e) => handleChange("remark", e.target.value)}
              placeholder={`Internal remarks or site constraints for ${badge || "this level"}...`}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutionResourceFieldData;
