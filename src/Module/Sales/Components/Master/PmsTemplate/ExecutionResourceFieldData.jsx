import React, { useState, useRef, useEffect } from "react";
import {
  FaChevronDown,
  FaSearch,
  FaCheck,
  FaCopy,
  FaCheckCircle,
  FaExclamationCircle
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
  const [activeDropdown, setActiveDropdown] = useState(null); // 'contractor' | 'material' | 'supplier' | null
  const [contractorSearch, setContractorSearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Theme accents based on level
  const themeConfig = {
    stage: {
      dotColor: "bg-indigo-600",
      badgeBg: "bg-indigo-600 text-white shadow-2xs font-black",
      titleColor: "text-indigo-950 font-black",
      headerBg: "bg-indigo-100/95 border-2 border-indigo-300",
      gridBorder: "border-2 border-indigo-200",
      gridBg: "bg-white",
      reactSelectTheme: "indigo"
    },
    work: {
      dotColor: "bg-blue-600",
      badgeBg: "bg-blue-600 text-white shadow-2xs font-black",
      titleColor: "text-blue-950 font-black",
      headerBg: "bg-blue-100/95 border-2 border-blue-300",
      gridBorder: "border-2 border-blue-200",
      gridBg: "bg-white",
      reactSelectTheme: "blue"
    },
    task: {
      dotColor: "bg-emerald-600",
      badgeBg: "bg-emerald-600 text-white shadow-2xs font-black",
      titleColor: "text-emerald-950 font-black",
      headerBg: "bg-emerald-100/95 border-2 border-emerald-300",
      gridBorder: "border-2 border-emerald-200",
      gridBg: "bg-white",
      reactSelectTheme: "emerald"
    }
  }[level] || {
    dotColor: "bg-indigo-600",
    badgeBg: "bg-indigo-600 text-white shadow-2xs font-black",
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
      onChange("contractorType", matchedType);
      onChange("toolsVehicles", updatedTools);
    }

    setActiveDropdown(null);
  };

  // Material selection -> auto-fills Material Details & Preferred Supplier
  const handleSelectMaterial = (mat) => {
    let autoSuppType = data.supplierType || "";
    let autoSuppName = data.supplierName || "";

    if (mat.supplier) {
      autoSuppName = mat.supplier;
      if (mat.supplierType) autoSuppType = mat.supplierType;
    }

    if (onChange) {
      onChange("materialRequired", mat.name);
      onChange("materialDetails", mat.details || data.materialDetails || "");
      if (autoSuppName) onChange("supplierName", autoSuppName);
      if (autoSuppType) onChange("supplierType", autoSuppType);
    }

    setActiveDropdown(null);
  };

  // Supplier selection -> auto-fills Supplier Type
  const handleSelectSupplier = (supp) => {
    if (onChange) {
      onChange("supplierName", supp.name);
      if (supp.supplierType) onChange("supplierType", supp.supplierType);
    }
    setActiveDropdown(null);
  };

  const filteredWorkWillDoneBy = DEFAULT_WORK_WILL_DONE_BY.filter((w) =>
    w.toLowerCase().includes(contractorSearch.toLowerCase())
  );

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
    <div ref={containerRef} className="space-y-3.5">
      {/* Prominently Highlighted Level Header Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border ${themeConfig.headerBg} shadow-2xs`}>
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
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-2xs">
              <FaCheckCircle className="w-2.5 h-2.5 text-emerald-600" />
              <span>Mandatory Details Filled</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-800 border border-amber-300 shadow-2xs">
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
              title={applyToAllLabel || "Apply details to all children"}
            >
              <HiSparkles className="w-3 h-3 text-indigo-600" />
              <span>{applyToAllLabel || "Apply to All"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 12-Field Grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 ${themeConfig.gridBg} p-4 rounded-xl border ${themeConfig.gridBorder} shadow-2xs`}>
        {/* 1. Work Will Done By (Searchable Single DDL with Close Option) */}
        <div className="relative">
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
              <div className="relative mb-2">
                <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search contractor or worker..."
                  value={contractorSearch}
                  onChange={(e) => setContractorSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5">
                  Standard Sheet Workers
                </p>
                {filteredWorkWillDoneBy.map((w) => (
                  <div
                    key={w}
                    onClick={() => handleSelectWorkDoneBy(w)}
                    className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                      data.workWillDoneBy === w
                        ? "bg-slate-100 font-bold text-slate-900"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{w}</span>
                    {data.workWillDoneBy === w && <FaCheck className="text-indigo-600 w-3 h-3" />}
                  </div>
                ))}

                <p className="text-[10px] uppercase font-bold text-slate-400 px-2 pt-2 pb-0.5">
                  Contractor Master List
                </p>
                {filteredContractorList.map((c) => (
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
                      <span className="text-[10px] text-slate-400">{c.contractorType}</span>
                    </div>
                    {data.workWillDoneBy === c.name && (
                      <FaCheck className="text-indigo-600 w-3 h-3" />
                    )}
                  </div>
                ))}
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

        {/* 4. Material Required (Lookup) */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1">Material Required</label>
          <div
            onClick={() => setActiveDropdown(activeDropdown === "material" ? null : "material")}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300"
          >
            <span className={data.materialRequired ? "text-slate-900 truncate" : "text-slate-400"}>
              {data.materialRequired || "Select Material Master..."}
            </span>
            <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
          </div>

          {activeDropdown === "material" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
              <div className="relative mb-2">
                <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search material..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                {filteredMaterials.map((m) => (
                  <div
                    key={m.id || m.name}
                    onClick={() => handleSelectMaterial(m)}
                    className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                      data.materialRequired === m.name
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
                    {data.materialRequired === m.name && (
                      <FaCheck className="text-indigo-600 w-3 h-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Material Details (Specs) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Material Details</label>
          <input
            type="text"
            placeholder="Auto-filled or custom specs..."
            value={data.materialDetails || ""}
            onChange={(e) => handleChange("materialDetails", e.target.value)}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
          />
        </div>

        {/* 6. Supplier Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Type</label>
          <select
            value={data.supplierType || ""}
            onChange={(e) => handleChange("supplierType", e.target.value)}
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

        {/* 7. Supplier Name (Lookup) */}
        <div className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1">Supplier Name</label>
          <div
            onClick={() => setActiveDropdown(activeDropdown === "supplier" ? null : "supplier")}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300"
          >
            <span className={data.supplierName ? "text-slate-900 truncate" : "text-slate-400"}>
              {data.supplierName || "Select Supplier..."}
            </span>
            <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
          </div>

          {activeDropdown === "supplier" && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
              <div className="relative mb-2">
                <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search supplier..."
                  value={supplierSearch}
                  onChange={(e) => setSupplierSearch(e.target.value)}
                  className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                {filteredSuppliers.map((s) => (
                  <div
                    key={s.id || s.name}
                    onClick={() => handleSelectSupplier(s)}
                    className={`px-3 py-1.5 rounded text-xs cursor-pointer hover:bg-slate-100 flex items-center justify-between ${
                      data.supplierName === s.name
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
                    {data.supplierName === s.name && (
                      <FaCheck className="text-indigo-600 w-3 h-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 8. Maximum Time to Complete Task (Number + Unit DDL) */}
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

        {/* 9. Deadline Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Deadline Date</label>
          <input
            type="date"
            value={data.deadlineDate || ""}
            onChange={(e) => handleChange("deadlineDate", e.target.value)}
            className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 ${themeConfig.accentRing} bg-white`}
          />
        </div>

        {/* 10. Maximum Time for Work Completion [D ; H] */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="flex items-center justify-between mb-1 max-w-sm">
            <label className="block text-xs font-bold text-slate-700">
              Maximum Time for Work Completion [D ; H]
            </label>
            {((parseInt(data.durationDays || 0, 10) || 0) > 0 ||
              (parseInt(data.durationHours || 0, 10) || 0) > 0) && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                ≈ {(parseInt(data.durationDays || 0, 10) || 0) * 24 +
                  (parseInt(data.durationHours || 0, 10) || 0)}{" "}
                Total Hours
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 max-w-xs">
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

        {/* 11. Training Material / Instruction / Checklist */}
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

        {/* 12. Remark */}
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
  );
};

export default ExecutionResourceFieldData;
