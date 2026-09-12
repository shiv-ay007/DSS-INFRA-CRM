import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaSave,
  FaRedo,
  FaSpinner,
  FaCheck,
  FaChevronDown,
  FaSearch,
  FaTimes,
  FaTasks,
  FaUser,
  FaBuilding
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { materialService } from "../../../services/materialService";
import { supplierService } from "../../../services/supplierService";
import { contractorService } from "../../../services/contractorService";
import { getAllLeadProjectsApi } from "../../../services/leadProject.api";

// Storage Keys
export const PMS_TASKS_STORAGE_KEY = "dss_pms_tasks_master_data";
export const PMS_TEMPLATES_STORAGE_KEY = "dss_pms_templates_data";

// 1. PROJECT STATUS (Count: 1 default | On Track + standard statuses)
export const PROJECT_STATUS_LIST = ["On Track", "Delayed", "In Progress", "Completed", "On Hold"];

// 2. STAGE HIERARCHY (Count: 35)
export const STAGES_LIST = [
  "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10",
  "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19", "S20",
  "S21", "S22", "S23", "1.0", "2.0", "3.0", "4.0", "5.0", "6.0", "7.0",
  "8.0", "9.0", "10.0", "11.0"
];

// 3. WORK (Filtered by Stage - Count: 86)
export const STAGE_TO_WORKS_MAP = {
  "S1": ["S1-W1"],
  "S2": ["S2-W1"],
  "S3": ["S3-W1", "S3-W2"],
  "S4": ["S4-W1", "S4-W2"],
  "S5": ["S5-W1", "S5-W2", "S5-W3", "S5-W4", "S5-W5", "S5-W6"],
  "S6": ["S6-W1", "S6-W2", "S6-W3"],
  "S7": ["S7-W1", "S7-W2"],
  "S8": ["S8-W1", "S8-W2", "S8-W3", "S8-W4"],
  "S9": ["S9-W1", "S9-W2", "S9-W3", "S9-W4", "S9-W5", "S9-W6", "S9-W7", "S9-W8", "S9-W9", "S9-W10", "S9-W11"],
  "S10": ["S10-W1", "S10-W2", "S10-W3", "S10-W4", "S10-W5"],
  "S11": ["S11-W1", "S11-W2", "S11-W3"],
  "S12": ["S12-W1", "S12-W2", "S12-W3"],
  "S13": ["S13-W1"],
  "S14": ["S14-W1", "S14-W2", "S14-W3"],
  "S15": ["S15-W1", "S15-W2", "S15-W3"],
  "S16": ["S16-W1", "S16-W2"],
  "S17": ["S17-W1", "S17-W2", "S17-W3"],
  "S18": ["S18-W1", "S18-W2", "S18-W3"],
  "S19": ["S19-W1"],
  "S20": ["S20-W1", "S20-W2", "S20-W3"],
  "S21": ["S21-W1", "S21-W2", "S21-W3"],
  "S22": ["S22-W1", "S22-W2", "S22-W3"],
  "S23": ["S23-W1", "S23-W2", "S23-W3", "S23-W4", "S23-W5", "S23-W6"],
  "1.0": ["1.0"], "2.0": ["2.0"], "3.0": ["3.0"], "4.0": ["4.0"], "5.0": ["5.0"],
  "6.0": ["6.0"], "7.0": ["7.0"], "8.0": ["8.0"], "9.0": ["9.0"], "10.0": ["10.0"], "11.0": ["11.0"]
};

// 4. TASK (Filtered by Work - Count: 199)
export const WORK_TO_TASKS_MAP = {
  "S1-W1": ["S1-W1-T1", "S1-W1-T2", "S1-W1-T3", "S1-W1-T4", "S1-W1-T5", "S1-W1-T6", "S1-W1-T7", "S1-W1-T8", "S1-W1-T9", "S1-W1-T10", "S1-W1-T11"],
  "S2-W1": ["S2-W1-T1", "S2-W1-T2"],
  "S3-W1": ["S3-W1-T1", "S3-W1-T2", "S3-W1-T3"],
  "S3-W2": ["S3-W2-T1"],
  "S4-W1": ["S4-W1-T1"],
  "S4-W2": ["S4-W2-T1", "S4-W2-T2", "S4-W2-T3", "S4-W2-T4", "S4-W2-T5"],
  "S5-W1": ["S5-W1-T1", "S5-W1-T2", "S5-W1-T3", "S5-W1-T4", "S5-W1-T5"],
  "S5-W2": ["S5-W2-T1", "S5-W2-T2", "S5-W2-T3"],
  "S5-W3": ["S5-W3-T1", "S5-W3-T2", "S5-W3-T3", "S5-W3-T4", "S5-W3-T5", "S5-W3-T6", "S5-W3-T7"],
  "S5-W4": ["S5-W4-T1", "S5-W4-T2", "S5-W4-T3", "S5-W4-T4", "S5-W4-T5"],
  "S5-W5": ["S5-W5-T1"],
  "S5-W6": ["S5-W6-T1"],
  "S6-W1": ["S6-W1-T1", "S6-W1-T2", "S6-W1-T3", "S6-W1-T4", "S6-W1-T5"],
  "S6-W2": ["S6-W2-T1", "S6-W2-T2", "S6-W2-T3", "S6-W2-T4", "S6-W2-T5", "S6-W2-T6", "S6-W2-T7", "S6-W2-T8"],
  "S6-W3": ["S6-W3-T1"],
  "S7-W1": ["S7-W1-T1", "S7-W1-T2", "S7-W1-T3", "S7-W1-T4", "S7-W1-T5", "S7-W1-T6", "S7-W1-T7", "S7-W1-T8", "S7-W1-T9", "S7-W1-T10"],
  "S7-W2": ["S7-W2-T1", "S7-W2-T2", "S7-W2-T3"],
  "S8-W1": ["S8-W1-T1", "S8-W1-T2", "S8-W1-T3", "S8-W1-T4"],
  "S8-W2": ["S8-W2-T1", "S8-W2-T2", "S8-W2-T3"],
  "S8-W3": ["S8-W3-T1", "S8-W3-T2", "S8-W3-T3"],
  "S8-W4": ["S8-W4-T1"],
  "S9-W1": ["S9-W1-T1"],
  "S9-W2": ["S9-W2-T1", "S9-W2-T2", "S9-W2-T3", "S9-W2-T4", "S9-W2-T5", "S9-W2-T6"],
  "S9-W3": ["S9-W3-T1", "S9-W3-T2", "S9-W3-T3", "S9-W3-T4", "S9-W3-T5", "S9-W3-T6"],
  "S9-W4": ["S9-W4-T1"],
  "S9-W5": ["S9-W5-T1", "S9-W5-T2"],
  "S9-W6": ["S9-W6-T1", "S9-W6-T2"],
  "S9-W7": ["S9-W7-T1"],
  "S9-W8": ["S9-W8-T1"],
  "S9-W9": ["S9-W9-T1", "S9-W9-T2", "S9-W9-T3", "S9-W9-T4", "S9-W9-T5", "S9-W9-T6"],
  "S9-W10": ["S9-W10-T1"],
  "S9-W11": ["S9-W11-T1", "S9-W11-T2", "S9-W11-T3", "S9-W11-T4", "S9-W11-T5", "S9-W11-T6", "S9-W11-T7", "S9-W11-T8"],
  "1.0": ["1.0"],
  "2.0": ["2.0"]
};

// 5. WORK WILL DONE BY (Seed Items + Contractor Master Names)
export const DEFAULT_WORK_WILL_DONE_BY = [
  "LABOUR",
  "DURMUT",
  "LABOUR - BAR BINDER [LOHAR]",
  "CONTRACTOR = SHUTTERING"
];

// 6. CONTRACTOR TYPES (Count: 19)
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

// 7. TOOLS / VEHICLE LIST (Count: 7 sheet items + common civil tools)
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

// 10. SUPPLIER TYPES
export const SUPPLIER_TYPES_LIST = [
  "Manufacturer",
  "Authorized Distributor",
  "Wholesaler / Stockist",
  "Local Retail Supplier",
  "Direct Importer",
  "Trading Company",
  "Fabricator & Material Supplier",
  "Specialized Chemical Vendor"
];

// Fallback seed materials if API has none
const SEED_MATERIALS = [
  { id: "M1", name: "UltraTech Super Cement (53 Grade)", category: "Cement & Concrete", details: "OPC 53 Grade high-early-strength Portland cement for structural RCC casting.", supplier: "Ambuja & UltraTech Distributors", supplierType: "Authorized Distributor" },
  { id: "M2", name: "Tata Tiscon TMT Rebar Fe550D (12mm)", category: "Steel & Structural Metals", details: "High-ductility earthquake-resistant Fe550D primary steel rebar.", supplier: "National Steel Corporation", supplierType: "Wholesaler / Stockist" },
  { id: "M3", name: "AAC Lightweight Concrete Blocks (600x200x150)", category: "Bricks, Blocks & Aggregates", details: "Autoclaved Aerated Concrete Blocks with high thermal and sound insulation.", supplier: "Birla Aerocon Supplies", supplierType: "Manufacturer" },
  { id: "M4", name: "Astral CPVC Pro Pipes (1 inch SDR 11)", category: "Pipes, Fittings & Sanitaryware", details: "Chlorinated polyvinyl chloride pipes for hot and cold potable water supply.", supplier: "Shree Plumbing Mart", supplierType: "Authorized Distributor" },
  { id: "M5", name: "Dr. Fixit Fastflex Waterproofing Compound", category: "Waterproofing & Construction Chemicals", details: "Polymer modified cementitious coating for sunken slabs and water tanks.", supplier: "Pidilite Depot Lucknow", supplierType: "Manufacturer" }
];

// Fallback seed suppliers
const SEED_SUPPLIERS = [
  { id: "S1", name: "Ambuja & UltraTech Distributors", supplierType: "Authorized Distributor", city: "Lucknow" },
  { id: "S2", name: "National Steel Corporation", supplierType: "Wholesaler / Stockist", city: "Barabanki" },
  { id: "S3", name: "Birla Aerocon Supplies", supplierType: "Manufacturer", city: "Lucknow" },
  { id: "S4", name: "Shree Plumbing Mart", supplierType: "Local Retail Supplier", city: "Sultanpur" },
  { id: "S5", name: "Pidilite Depot Lucknow", supplierType: "Manufacturer", city: "Lucknow" }
];

// Fallback seed contractors
const SEED_CONTRACTORS = [
  { id: "C1", name: "Apex Civil Infratech Pvt Ltd", contractorType: "Civil Contractor", tools: ["MIXING MACHINE", "VIBRATOR", "SAHUL (LATTU)"] },
  { id: "C2", name: "National Shuttering & Scaffolding Works", contractorType: "Shuttering Contractor", tools: ["DURMUT", "SCAFFOLDING SET"] },
  { id: "C3", name: "Modern Bar Binders & Steel Works", contractorType: "Steel Contractor", tools: ["BAR BINDER'S [LOHAR'S] TOOL", "GRINDER / CUTTER MACHINE"] },
  { id: "C4", name: "Krishna Excavators & Earthmovers", contractorType: "Excavation Contractor", tools: ["EXCAVATOR", "TRACTOR / TIPPER", "DURMUT"] },
  { id: "C5", name: "Reliable MEP & Plumbing Solutions", contractorType: "Plumbing Contractor", tools: ["WATER SYSTEM MANAGEMENT", "GRINDER / CUTTER MACHINE"] }
];

// Seed initial tasks for PMS table preview
const INITIAL_PMS_TASKS = [
  {
    id: "TSK-101",
    projectStatus: "On Track",
    stage: "S1",
    work: "S1-W1",
    task: "S1-W1-T1",
    workWillDoneBy: "Krishna Excavators & Earthmovers",
    contractorType: "Excavation Contractor",
    toolsVehicles: ["EXCAVATOR", "DURMUT", "TRACTOR / TIPPER"],
    materialRequired: "M-Sand / Fine Aggregates",
    materialDetails: "Graded river sand for soil compaction and trench bedding.",
    supplierType: "Local Retail Supplier",
    supplierName: "National Steel Corporation",
    maxTimeToComplete: "4",
    timeUnit: "Days",
    deadlineDate: "2025-04-10",
    durationDays: "4",
    durationHours: "0",
    instruction: "Perform initial site clearing, total station survey benchmarking and excavation up to 1.5m depth.",
    remark: "Check groundwater table level prior to footing excavation.",
    status: "Active"
  },
  {
    id: "TSK-102",
    projectStatus: "On Track",
    stage: "S2",
    work: "S2-W1",
    task: "S2-W1-T1",
    workWillDoneBy: "National Shuttering & Scaffolding Works",
    contractorType: "Shuttering Contractor",
    toolsVehicles: ["DURMUT", "SAHUL (LATTU)", "VIBRATOR"],
    materialRequired: "UltraTech Super Cement (53 Grade)",
    materialDetails: "OPC 53 Grade high-early-strength Portland cement for structural RCC casting.",
    supplierType: "Authorized Distributor",
    supplierName: "Ambuja & UltraTech Distributors",
    maxTimeToComplete: "6",
    timeUnit: "Days",
    deadlineDate: "2025-04-18",
    durationDays: "6",
    durationHours: "4",
    instruction: "Erect plywood formwork with steel props. Verify plumb with Sahul (Lattu).",
    remark: "Shuttering oil application is mandatory before rebar placement.",
    status: "Active"
  }
];

const CreatePmsTemplateComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Master Data Lists (Integrated from APIs + localStorage)
  const [materialList, setMaterialList] = useState(SEED_MATERIALS);
  const [supplierList, setSupplierList] = useState(SEED_SUPPLIERS);
  const [contractorList, setContractorList] = useState(SEED_CONTRACTORS);

  // PMS Tasks List in storage
  const [savedTasks, setSavedTasks] = useState(() => {
    try {
      const stored = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PMS_TASKS;
  });

  // 16 Exact Fields State
  const [formData, setFormData] = useState({
    id: "TSK-" + Math.floor(100 + Math.random() * 900),
    clientName: "",                           // Client Name (From Presales - Searchable)
    projectDetails: "",                       // Project Details (Auto-filled from Presales client)
    projectStatus: "On Track",                 // 1. Project Status (DDL - Req)
    stage: "S1",                              // 2. Stage Code / Name (Lookup/DDL - Req)
    work: "S1-W1",                            // 3. Work Code / Name (Filtered by Stage - Req)
    task: "S1-W1-T1",                         // 4. Task Code / Name (Filtered by Work - Req)
    workWillDoneBy: "",                       // 5. Work Will Done By (Contractor/Worker - Req)
    contractorType: "",                       // 6. Contractor Type (Lookup - Cond)
    toolsVehicles: [],                        // 7. Tools / Vehicle (Multi-select - No)
    materialRequired: "",                     // 8. Material Required (Material Lookup - Cond)
    materialDetails: "",                      // 9. Material Details (Multiline - No)
    supplierType: "",                         // 10. Supplier Type (Lookup - Cond)
    supplierName: "",                         // 11. Supplier Name (Lookup - Cond)
    maxTimeToComplete: "3",                   // 12. Maximum Time to Complete Task (Number + Unit)
    timeUnit: "Days",
    deadlineDate: "",                         // 13. Deadline Date (Date)
    durationDays: "3",                        // 14. Maximum Time for Work Completion [D ; H]
    durationHours: "0",
    instruction: "",                          // 15. Training Material / Instruction / Checklist
    remark: "",                               // 16. Remark (Multiline)
    status: "Active"
  });

  const [errors, setErrors] = useState({});

  // Presales Client List
  const [presalesList, setPresalesList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isClientOpen, setIsClientOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  // Search/Filter states for Lookups
  const [materialSearch, setMaterialSearch] = useState("");
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const materialDropdownRef = useRef(null);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const supplierDropdownRef = useRef(null);

  const [contractorSearch, setContractorSearch] = useState("");
  const [isContractorOpen, setIsContractorOpen] = useState(false);
  const contractorDropdownRef = useRef(null);

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsDropdownRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setIsClientOpen(false);
      }
      if (materialDropdownRef.current && !materialDropdownRef.current.contains(e.target)) {
        setIsMaterialOpen(false);
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(e.target)) {
        setIsSupplierOpen(false);
      }
      if (contractorDropdownRef.current && !contractorDropdownRef.current.contains(e.target)) {
        setIsContractorOpen(false);
      }
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Master Data & Presales Projects from services on mount
  useEffect(() => {
    const fetchMasters = async () => {
      // 0. Presales Projects Master
      try {
        const res = await getAllLeadProjectsApi();
        const projects =
          res?.data?.projects || res?.projects || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);
        if (Array.isArray(projects) && projects.length > 0) {
          const formattedProjects = projects.map((p) => {
            const leadObj = typeof p.leadId === "object" && p.leadId !== null ? p.leadId : null;
            const clientName =
              p.clientName || p.concernPersonName || leadObj?.clientName || leadObj?.concernPersonName || "Unnamed Client";
            const companyName = p.companyName || leadObj?.companyName || "";
            const businessType = p.businessType || leadObj?.businessType || leadObj?.workCategory || "";
            const city = p.city || leadObj?.city || "";
            const requirement = p.requirement || leadObj?.requirement || "";
            const amount = p.expectedBusiness || p.amount || p.expectedRevenue || 0;

            const detailParts = [];
            if (companyName && companyName !== "--") detailParts.push(`Company: ${companyName}`);
            if (businessType && businessType !== "--") detailParts.push(`Type: ${businessType}`);
            if (city && city !== "--") detailParts.push(`City: ${city}`);
            if (amount) detailParts.push(`Budget: ₹${Number(amount).toLocaleString("en-IN")}`);
            if (requirement && requirement !== "--") detailParts.push(`Req: ${requirement}`);

            return {
              id: p._id || p.id || p.leadId,
              clientName,
              companyName,
              businessType,
              city,
              requirement,
              amount,
              projectDetails: detailParts.join(" | ") || "No additional project details"
            };
          });
          setPresalesList(formattedProjects);
        }
      } catch (err) {
        console.log("Error fetching presales leads for PMS:", err);
      }

      // 1. Materials Master
      try {
        const res = await materialService.getAllMaterials({ limit: 500 });
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map((m) => ({
            id: m._id || m.id,
            name: m.name || m.materialName,
            category: m.category || m.materialCategory,
            details: m.materialDetails || m.description || m.specificationGrade || "",
            supplier: m.preferredSupplier || "",
            supplierType: m.supplierType || ""
          }));
          setMaterialList(formatted);
        }
      } catch (e) {
        console.log("Using seed materials fallback");
      }

      // 2. Suppliers Master
      try {
        const res = await supplierService.getAllSuppliers({ limit: 500 });
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map((s) => ({
            id: s._id || s.id,
            name: s.name || s.supplierName,
            supplierType: s.supplierType || "",
            city: s.city || ""
          }));
          setSupplierList(formatted);
        }
      } catch (e) {
        console.log("Using seed suppliers fallback");
      }

      // 3. Contractors Master
      try {
        const res = await contractorService.getAllContractors({ limit: 500 });
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map((c) => ({
            id: c._id || c.id,
            name: c.name || c.contractorName,
            contractorType: c.contractorType || "",
            tools: Array.isArray(c.toolsVehicles) ? c.toolsVehicles : []
          }));
          setContractorList(formatted);
        }
      } catch (e) {
        console.log("Using seed contractors fallback");
      }
    };

    fetchMasters();
  }, []);

  // Load existing task if in Edit mode
  useEffect(() => {
    if (isEdit) {
      setFetching(true);
      try {
        const stored = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
        let list = INITIAL_PMS_TASKS;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) list = parsed;
        }
        const found = list.find((t) => String(t.id) === String(id));
        if (found) {
          setFormData(found);
        } else {
          toast.error("Task not found with ID: " + id);
          navigate("/sales/master/pms-template/create");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
  }, [id, isEdit, navigate]);

  // Combined "Work Will Done By" options (Seed workers + Contractor Master names)
  const workWillDoneByOptions = useMemo(() => {
    const names = new Set(DEFAULT_WORK_WILL_DONE_BY);
    contractorList.forEach((c) => {
      if (c.name && c.name.trim()) names.add(c.name.trim());
    });
    return Array.from(names);
  }, [contractorList]);

  // Filtered Works by Selected Stage
  const availableWorks = useMemo(() => {
    return STAGE_TO_WORKS_MAP[formData.stage] || [`${formData.stage}-W1`];
  }, [formData.stage]);

  // Filtered Tasks by Selected Work
  const availableTasks = useMemo(() => {
    return WORK_TO_TASKS_MAP[formData.work] || [`${formData.work}-T1`, `${formData.work}-T2`];
  }, [formData.work]);

  // Stage change handler -> resets dependent Work & Task
  const handleStageChange = (newStage) => {
    const works = STAGE_TO_WORKS_MAP[newStage] || [`${newStage}-W1`];
    const firstWork = works[0];
    const tasks = WORK_TO_TASKS_MAP[firstWork] || [`${firstWork}-T1`];
    setFormData((prev) => ({
      ...prev,
      stage: newStage,
      work: firstWork,
      task: tasks[0]
    }));
  };

  // Work change handler -> resets dependent Task
  const handleWorkChange = (newWork) => {
    const tasks = WORK_TO_TASKS_MAP[newWork] || [`${newWork}-T1`];
    setFormData((prev) => ({
      ...prev,
      work: newWork,
      task: tasks[0]
    }));
  };

  // Work Will Done By selection -> auto-fills Contractor Type & suggestions
  const handleSelectWorkDoneBy = (workerOrContractor) => {
    const foundContractor = contractorList.find(
      (c) => c.name.toLowerCase() === workerOrContractor.toLowerCase()
    );

    let updatedTools = [...formData.toolsVehicles];
    let matchedType = formData.contractorType;

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

    setFormData((prev) => ({
      ...prev,
      workWillDoneBy: workerOrContractor,
      contractorType: matchedType,
      toolsVehicles: updatedTools
    }));

    setIsContractorOpen(false);
    if (errors.workWillDoneBy) setErrors((prev) => ({ ...prev, workWillDoneBy: "" }));
  };

  // Presales Client selection -> auto-fills Project Details
  const handleSelectClient = (client) => {
    setFormData((prev) => ({
      ...prev,
      clientName: client.clientName,
      projectDetails: client.projectDetails || ""
    }));
    setIsClientOpen(false);
  };

  // Material selection -> auto-fills Material Details & Preferred Supplier
  const handleSelectMaterial = (mat) => {
    let autoSuppType = formData.supplierType;
    let autoSuppName = formData.supplierName;

    if (mat.supplier) {
      autoSuppName = mat.supplier;
      if (mat.supplierType) autoSuppType = mat.supplierType;
    }

    setFormData((prev) => ({
      ...prev,
      materialRequired: mat.name,
      materialDetails: mat.details || prev.materialDetails,
      supplierName: autoSuppName,
      supplierType: autoSuppType
    }));

    setIsMaterialOpen(false);
  };

  // Supplier selection -> auto-fills Supplier Type
  const handleSelectSupplier = (supp) => {
    setFormData((prev) => ({
      ...prev,
      supplierName: supp.name,
      supplierType: supp.supplierType || prev.supplierType
    }));
    setIsSupplierOpen(false);
  };

  // Toggle Tool / Vehicle multi-select
  const handleToggleTool = (tool) => {
    setFormData((prev) => {
      const exists = prev.toolsVehicles.includes(tool);
      const updated = exists
        ? prev.toolsVehicles.filter((t) => t !== tool)
        : [...prev.toolsVehicles, tool];
      return { ...prev, toolsVehicles: updated };
    });
  };

  // Validate form required fields
  const validateForm = () => {
    const errs = {};

    // 1. Project Status (Required)
    if (!formData.projectStatus) errs.projectStatus = "Project Status is required";

    // 2. Stage (Required)
    if (!formData.stage) errs.stage = "Stage is required";

    // 3. Work (Required)
    if (!formData.work) errs.work = "Work is required";

    // 4. Task (Required)
    if (!formData.task) errs.task = "Task is required";

    // 5. Work Will Done By (Required)
    if (!formData.workWillDoneBy || !formData.workWillDoneBy.trim()) {
      errs.workWillDoneBy = "Executing party / worker is required";
    }

    // 6. Contractor Type (Conditional: required if contractor chosen)
    if (formData.workWillDoneBy && !DEFAULT_WORK_WILL_DONE_BY.includes(formData.workWillDoneBy) && !formData.contractorType) {
      errs.contractorType = "Contractor Type is required for contractor execution";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return Object.keys(errs).length === 0;
  };

  // Save / Update Task Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all mandatory fields marked with *");
      return;
    }

    setLoading(true);

    try {
      const durationFormatted = `${formData.durationDays || 0} D ; ${formData.durationHours || 0} H`;

      const taskPayload = {
        ...formData,
        id: formData.id || "TSK-" + Math.floor(100 + Math.random() * 900),
        durationFormatted,
        updatedAt: new Date().toISOString()
      };

      let updatedList;
      if (isEdit) {
        updatedList = savedTasks.map((item) => (String(item.id) === String(id) ? taskPayload : item));
        toast.success(`PMS Task "${formData.task}" updated successfully!`);
      } else {
        updatedList = [taskPayload, ...savedTasks];
        toast.success(`PMS Task "${formData.task}" created successfully!`);
      }

      setSavedTasks(updatedList);
      localStorage.setItem(PMS_TASKS_STORAGE_KEY, JSON.stringify(updatedList));

      // Also ensure PMS Template master reflects this task count & codes
      try {
        const storedTemplates = localStorage.getItem(PMS_TEMPLATES_STORAGE_KEY);
        if (storedTemplates) {
          const templates = JSON.parse(storedTemplates);
          if (Array.isArray(templates) && templates.length > 0) {
            templates[0].tasksCount = updatedList.length;
            localStorage.setItem(PMS_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
          }
        }
      } catch (e) {}

      navigate("/sales/master/pms-template");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save PMS Task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-16 px-1 sm:px-2 font-sans">
      {/* ================= STICKY TOP HEADER BANNER (Same as Supplier & Material) ================= */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-xl px-4 py-2.5 shadow-md border border-indigo-700/50">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/sales/master/pms-template")}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Back"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="p-1.5 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
              <FaTasks className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {isEdit ? "Edit PMS Task" : "Add PMS Task"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <HiSparkles className="w-2.5 h-2.5 text-cyan-300" /> {isEdit ? "Edit Mode" : "New Entry"}
                </span>
              </div>
              <p className="text-[11px] text-indigo-200/90 leading-none mt-0.5">
                PMS Task Form — Integration With All Three Masters (Material, Contractor, Supplier).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= SINGLE CLEAN FORM CONTAINER (Without separate Section Cards) ================= */}
      <form
        id="pms-task-single-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Client Name (Searchable from Presales) */}
          <div className="relative" ref={clientDropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Client Name</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 font-bold px-1.5 py-0.5 rounded">From Presales</span>
            </label>
            <div
              onClick={() => setIsClientOpen(!isClientOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <FaUser className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className={formData.clientName ? "text-slate-900 font-bold truncate" : "text-slate-400 font-normal"}>
                  {formData.clientName || "Search & Select Client from Presales..."}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {formData.clientName && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, clientName: "", projectDetails: "" });
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                    title="Clear Client"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                )}
                <FaChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            {/* Client Searchable Dropdown Popup */}
            {isClientOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-64 overflow-y-auto">
                <div className="relative mb-2">
                  <FaSearch className="absolute left-2.5 top-2.5 text-slate-400 w-3 h-3" />
                  <input
                    type="text"
                    placeholder="Search client by name, company, city, req..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  {presalesList
                    .filter((p) => {
                      const q = clientSearch.toLowerCase();
                      return (
                        !clientSearch ||
                        p.clientName?.toLowerCase().includes(q) ||
                        p.companyName?.toLowerCase().includes(q) ||
                        p.city?.toLowerCase().includes(q) ||
                        p.businessType?.toLowerCase().includes(q) ||
                        p.requirement?.toLowerCase().includes(q)
                      );
                    })
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectClient(p)}
                        className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-indigo-50 flex items-center justify-between transition-colors ${
                          formData.clientName === p.clientName ? "bg-indigo-50 font-bold text-indigo-900 border border-indigo-200" : "text-slate-700"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{p.clientName}</span>
                            {p.companyName && (
                              <span className="text-[10px] text-indigo-600 bg-indigo-50/80 px-1 rounded">
                                {p.companyName}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 truncate flex items-center gap-1.5">
                            {p.businessType && <span>{p.businessType}</span>}
                            {p.city && <span>• {p.city}</span>}
                            {p.amount ? <span>• ₹{Number(p.amount).toLocaleString("en-IN")}</span> : null}
                          </div>
                        </div>
                        {formData.clientName === p.clientName && <FaCheck className="text-indigo-600 w-3 h-3 shrink-0" />}
                      </div>
                    ))}

                  {presalesList.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No Presales clients loaded.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Project Details (Auto-filled from Client Name selection, editable) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Project Details</span>
              <span className="text-[10px] text-slate-400 font-medium">Auto-filled from Presales, editable</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.projectDetails || ""}
                onChange={(e) => setFormData({ ...formData, projectDetails: e.target.value })}
                placeholder="Select client to auto-fill company, business type, city, budget & requirement..."
                className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-slate-50/50 hover:bg-white focus:bg-white transition-colors placeholder:text-slate-400"
              />
              <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
            </div>
          </div>

          {/* 1. Project Status (DDL - Required *) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Project Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.projectStatus}
              onChange={(e) => setFormData({ ...formData, projectStatus: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white ${
                errors.projectStatus ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              {PROJECT_STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            {errors.projectStatus && <p className="text-xs text-red-500 mt-1">{errors.projectStatus}</p>}
          </div>

          {/* 2. Stage Code / Name (Lookup / DDL - Required *) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Stage Code / Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white ${
                errors.stage ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              {STAGES_LIST.map((stg) => (
                <option key={stg} value={stg}>
                  Stage {stg}
                </option>
              ))}
            </select>
            {errors.stage && <p className="text-xs text-red-500 mt-1">{errors.stage}</p>}
          </div>

          {/* 3. Work Code / Name (Filtered by Stage - Required *) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Work Code / Name <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.work}
              onChange={(e) => handleWorkChange(e.target.value)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white ${
                errors.work ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              {availableWorks.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            {errors.work && <p className="text-xs text-red-500 mt-1">{errors.work}</p>}
          </div>

          {/* 4. Task Code / Name (Filtered by Work - Required *) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Task Code / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="task-code-list"
              required
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value.toUpperCase() })}
              placeholder="e.g. S1-W1-T1"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-bold text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white ${
                errors.task ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            <datalist id="task-code-list">
              {availableTasks.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            {errors.task && <p className="text-xs text-red-500 mt-1">{errors.task}</p>}
          </div>

          {/* 5. Work Will Done By (Contractor / Worker Lookup - Required *) */}
          <div className="relative" ref={contractorDropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Work Will Done By <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsContractorOpen(!isContractorOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white ${
                errors.workWillDoneBy ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.workWillDoneBy ? "text-slate-900 truncate" : "text-slate-400"}>
                {formData.workWillDoneBy || "Select Contractor / Worker..."}
              </span>
              <FaChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </div>
            {errors.workWillDoneBy && <p className="text-xs text-red-500 mt-1">{errors.workWillDoneBy}</p>}

            {/* Dropdown popup */}
            {isContractorOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-60 overflow-y-auto">
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
                  {DEFAULT_WORK_WILL_DONE_BY.filter((w) =>
                    w.toLowerCase().includes(contractorSearch.toLowerCase())
                  ).map((w) => (
                    <div
                      key={w}
                      onClick={() => handleSelectWorkDoneBy(w)}
                      className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-indigo-50 flex items-center justify-between ${
                        formData.workWillDoneBy === w ? "bg-indigo-50 font-bold text-indigo-900" : "text-slate-700"
                      }`}
                    >
                      <span>{w}</span>
                      {formData.workWillDoneBy === w && <FaCheck className="text-indigo-600 w-3 h-3" />}
                    </div>
                  ))}

                  <p className="text-[10px] uppercase font-bold text-slate-400 px-2 pt-2 pb-0.5">
                    Contractor Master List
                  </p>
                  {contractorList
                    .filter((c) => c.name.toLowerCase().includes(contractorSearch.toLowerCase()))
                    .map((c) => (
                      <div
                        key={c.id || c.name}
                        onClick={() => handleSelectWorkDoneBy(c.name)}
                        className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-indigo-50 flex items-center justify-between ${
                          formData.workWillDoneBy === c.name ? "bg-indigo-50 font-bold text-indigo-900" : "text-slate-700"
                        }`}
                      >
                        <div>
                          <span className="block font-medium">{c.name}</span>
                          <span className="text-[10px] text-slate-400">{c.contractorType}</span>
                        </div>
                        {formData.workWillDoneBy === c.name && <FaCheck className="text-indigo-600 w-3 h-3" />}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Contractor Type (Conditional) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Contractor Type <span className="text-slate-400 font-normal">(Conditional)</span>
            </label>
            <select
              value={formData.contractorType}
              onChange={(e) => setFormData({ ...formData, contractorType: e.target.value })}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white ${
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
            {errors.contractorType && <p className="text-xs text-red-500 mt-1">{errors.contractorType}</p>}
          </div>

          {/* 7. Tools / Vehicle (Resource Multi-select) */}
          <div className="relative" ref={toolsDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Tools / Vehicle
              </label>
              {formData.toolsVehicles.length > 0 && (
                <span className="text-xs text-indigo-600 font-semibold">
                  {formData.toolsVehicles.length} selected
                </span>
              )}
            </div>

            <div
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5"
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.toolsVehicles.length > 0 ? (
                  formData.toolsVehicles.map((tool) => (
                    <span
                      key={tool}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      {tool}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTool(tool);
                        }}
                        className="hover:text-red-500 cursor-pointer ml-0.5"
                      >
                        <FaTimes className="w-2.5 h-2.5" />
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select Tools / Vehicle...</span>
                )}
              </div>
              <FaChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </div>

            {/* Dropdown Menu */}
            {isToolsOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-56 overflow-y-auto">
                <div className="space-y-1">
                  {TOOLS_VEHICLES_MASTER.map((tool) => {
                    const isChecked = formData.toolsVehicles.includes(tool);
                    return (
                      <div
                        key={tool}
                        onClick={() => handleToggleTool(tool)}
                        className={`px-3 py-2 rounded text-xs cursor-pointer flex items-center justify-between hover:bg-indigo-50 ${
                          isChecked ? "bg-indigo-50 text-indigo-800 font-bold" : "text-slate-700"
                        }`}
                      >
                        <span>{tool}</span>
                        {isChecked && <FaCheck className="w-3 h-3 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 8. Material Required (Material Master Lookup) */}
          <div className="relative" ref={materialDropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Material Required
            </label>
            <div
              onClick={() => setIsMaterialOpen(!isMaterialOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.materialRequired ? "text-slate-900 truncate" : "text-slate-400"}>
                {formData.materialRequired || "Select Material Master..."}
              </span>
              <FaChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </div>

            {isMaterialOpen && (
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
                  {materialList
                    .filter((m) => m.name.toLowerCase().includes(materialSearch.toLowerCase()))
                    .map((m) => (
                      <div
                        key={m.id || m.name}
                        onClick={() => handleSelectMaterial(m)}
                        className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-indigo-50 ${
                          formData.materialRequired === m.name ? "bg-indigo-50 font-bold text-indigo-900" : "text-slate-700"
                        }`}
                      >
                        <span className="block font-medium">{m.name}</span>
                        <span className="text-[10px] text-slate-400">{m.category}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 9. Material Details (Text / Multiline, Task Override) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Material Details
            </label>
            <input
              type="text"
              value={formData.materialDetails}
              onChange={(e) => setFormData({ ...formData, materialDetails: e.target.value })}
              placeholder="Auto-filled from Material Master, editable override..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>

          {/* 10. Supplier Type (Supplier Type Lookup) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Supplier Type
            </label>
            <select
              value={formData.supplierType}
              onChange={(e) => setFormData({ ...formData, supplierType: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            >
              <option value="">-- Select Supplier Type --</option>
              {SUPPLIER_TYPES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 11. Supplier Name (Supplier Lookup) */}
          <div className="relative" ref={supplierDropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Supplier Name
            </label>
            <div
              onClick={() => setIsSupplierOpen(!isSupplierOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.supplierName ? "text-slate-900 truncate" : "text-slate-400"}>
                {formData.supplierName || "Select Supplier..."}
              </span>
              <FaChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </div>

            {isSupplierOpen && (
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
                  {supplierList
                    .filter((s) => s.name.toLowerCase().includes(supplierSearch.toLowerCase()))
                    .map((s) => (
                      <div
                        key={s.id || s.name}
                        onClick={() => handleSelectSupplier(s)}
                        className={`px-3 py-2 rounded text-xs cursor-pointer hover:bg-indigo-50 ${
                          formData.supplierName === s.name ? "bg-indigo-50 font-bold text-indigo-900" : "text-slate-700"
                        }`}
                      >
                        <span className="block font-medium">{s.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {s.supplierType} • {s.city || "Direct"}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 12. Maximum Time to Complete Task (Number + Unit) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Maximum Time to Complete Task
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={formData.maxTimeToComplete}
                onChange={(e) => setFormData({ ...formData, maxTimeToComplete: e.target.value })}
                className="w-28 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
              />
              <select
                value={formData.timeUnit}
                onChange={(e) => setFormData({ ...formData, timeUnit: e.target.value })}
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
              >
                <option value="Days">Days</option>
                <option value="Hours">Hours</option>
                <option value="Weeks">Weeks</option>
              </select>
            </div>
          </div>

          {/* 13. Deadline Date (Date) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Deadline Date
            </label>
            <input
              type="date"
              value={formData.deadlineDate}
              onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>

          {/* 14. Maximum Time for Work Completion [D ; H] (Duration) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Maximum Time for Work Completion [D ; H]
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  min="0"
                  placeholder="Days"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <span className="text-xs font-bold text-slate-500">D</span>
              </div>
              <span className="text-slate-300 font-bold">;</span>
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="Hours"
                  value={formData.durationHours}
                  onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <span className="text-xs font-bold text-slate-500">H</span>
              </div>
            </div>
          </div>

          {/* 15. Training Material / Instruction / Checklist (Multiline) */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Training Material / Instruction / Checklist
            </label>
            <textarea
              rows={2}
              value={formData.instruction}
              onChange={(e) => setFormData({ ...formData, instruction: e.target.value })}
              placeholder="Site execution guidelines, training instructions, quality checklist points..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>

          {/* 16. Remark (Multiline) */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Remark
            </label>
            <textarea
              rows={2}
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="Internal remarks, site constraints, contractor coordination notes..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
            />
          </div>
        </div>

        {/* Bottom Actions (Matching Material & Supplier format) */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Reset this form?")) {
                setFormData({
                  id: "TSK-" + Math.floor(100 + Math.random() * 900),
                  projectStatus: "On Track",
                  stage: "S1",
                  work: "S1-W1",
                  task: "S1-W1-T1",
                  workWillDoneBy: "",
                  contractorType: "",
                  toolsVehicles: [],
                  materialRequired: "",
                  materialDetails: "",
                  supplierType: "",
                  supplierName: "",
                  maxTimeToComplete: "3",
                  timeUnit: "Days",
                  deadlineDate: "",
                  durationDays: "3",
                  durationHours: "0",
                  instruction: "",
                  remark: "",
                  status: "Active"
                });
              }
            }}
            className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FaRedo className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("/sales/master/pms-template")}
            className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || fetching}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Saving Task...</span>
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                <span>{isEdit ? "Update PMS Task" : "Save PMS Task"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePmsTemplateComponent;
