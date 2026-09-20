import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
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
  FaBuilding,
  FaArrowRight,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { materialService } from "../../../services/materialService";
import { supplierService } from "../../../services/supplierService";
import { contractorService } from "../../../services/contractorService";
import { getAllLeadProjectsApi } from "../../../services/leadProject.api";
import pmsWbsService from "../../../services/pmsWbsService";
import pmsTemplateService from "../../../services/pmsTemplateService";
export const PMS_MASTER_STAGES_KEY = "pms_master_stages_data";
export const PMS_MASTER_WORKS_KEY = "pms_master_works_data";
export const PMS_MASTER_TASKS_KEY = "pms_master_tasks_data";
import ReactSelectMulti from "./ReactSelectMulti";
import ExecutionResourceFieldData from "./ExecutionResourceFieldData";
import Loader from "../../../../../Common/Components/Loader";

// Storage Keys
export const PMS_TASKS_STORAGE_KEY = "dss_pms_tasks_master_data";
export const PMS_TEMPLATES_STORAGE_KEY = "dss_pms_templates_data";

// 1. PROJECT STATUS (Count: 1 default | On Track + standard statuses)
export const PROJECT_STATUS_LIST = ["On Track", "Delayed", "In Progress", "Completed", "On Hold"];


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


// Default execution details template for each stage
const DEFAULT_STAGE_DETAILS = {
  workWillDoneBy: "",
  contractorType: "",
  toolsVehicles: [],
  materialRequired: "",
  materialDetails: "",
  supplierType: "",
  supplierName: "",
  materials: [],
  maxTimeToComplete: "3",
  timeUnit: "Days",
  deadlineDate: "",
  durationDays: "3",
  durationHours: "0",
  instruction: "",
  remark: ""
};

export const CreatePmsTemplateComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Material, Supplier, Contractor Master Data from Backend (Dedicated APIs)
  const [materialList, setMaterialList] = useState(SEED_MATERIALS);
  const [supplierList, setSupplierList] = useState(SEED_SUPPLIERS);
  const [contractorList, setContractorList] = useState(SEED_CONTRACTORS);

  // WBS Dedicated Data from Backend APIs (Stages, Works, Tasks - Limit: 1000)
  const [wbsStages, setWbsStages] = useState(() => {
    try {
      const cached = localStorage.getItem(PMS_MASTER_STAGES_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading cached stages:", e);
    }
    return [];
  });

  const [wbsWorks, setWbsWorks] = useState(() => {
    try {
      const cached = localStorage.getItem(PMS_MASTER_WORKS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading cached works:", e);
    }
    return [];
  });

  const [wbsTasks, setWbsTasks] = useState(() => {
    try {
      const cached = localStorage.getItem(PMS_MASTER_TASKS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error("Error reading cached tasks:", e);
    }
    return [];
  });

  const [wbsLoading, setWbsLoading] = useState(false);
  const [projectStatusList, setProjectStatusList] = useState(PROJECT_STATUS_LIST);

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

  // Common Header State (Client, Project Details, Status)
  const [formData, setFormData] = useState({
    id: "TSK-" + Math.floor(100 + Math.random() * 900),
    clientName: "",
    projectDetails: "",
    projectStatus: ["On Track"],
    stage: "",
    work: "",
    task: "",
    status: "Active"
  });

  const [errors, setErrors] = useState({});

  // Stage -> Work -> Task hierarchy state with per-stage execution details.
  const [wbsStructure, setWbsStructure] = useState({
    stages: []
  });

  // Accordion expanded state for each Stage card
  const [expandedStages, setExpandedStages] = useState({});

  // 3-Level Stepper Active Tab state (Image 1 Chart UI)
  const [activeStageId, setActiveStageId] = useState(null);
  const [activeWorkId, setActiveWorkId] = useState(null);
  const [activeTaskId, setActiveTaskId] = useState(null);

  // Active Dropdown state tracking: { type: 'contractor'|'material'|'supplier', stageId: 'S1' }
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownContainerRef = useRef(null);

  // Presales Client List
  const [presalesList, setPresalesList] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isClientOpen, setIsClientOpen] = useState(false);
  const clientDropdownRef = useRef(null);

  // Presales Project Single-Select Dropdown state
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const projectDropdownRef = useRef(null);

  // Existing Templates Project IDs (to prevent duplicate creation)
  const [existingProjectIds, setExistingProjectIds] = useState(new Set());

  // Search/Filter states for Lookups inside stages
  const [materialSearch, setMaterialSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");
  const [contractorSearch, setContractorSearch] = useState("");

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target)) {
        setIsClientOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target)) {
        setIsProjectOpen(false);
      }
      if (!e.target.closest(".stage-search-dropdown-container")) {
        setActiveDropdown(null);
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
            const phoneNumber = p.phoneNumber || p.phone || leadObj?.phoneNumber || leadObj?.contactNumber || "";
            const projectName = p.projectName || leadObj?.projectName || "";
            const workCategory = p.workCategory || p.businessType || leadObj?.workCategory || leadObj?.businessType || "";
            const workType = p.workType || leadObj?.workType || "";
            const city = p.city || leadObj?.city || "";
            const requirement = p.requirement || leadObj?.requirement || "";
            const amount = p.expectedBusiness || p.amount || p.expectedRevenue || 0;

            const detailParts = [];
            if (projectName) detailParts.push(projectName);
            if (workCategory && workCategory !== "--") detailParts.push(`Category: ${workCategory}`);
            if (workType && workType !== "--") detailParts.push(`Work Type: ${workType}`);

            return {
              id: p._id || p.id || p.leadId,
              leadId: leadObj?._id || p.leadId,
              clientName,
              companyName,
              phoneNumber,
              projectName,
              workCategory,
              workType,
              businessType: workCategory,
              city,
              requirement,
              amount,
              projectDetails: detailParts.join(" | ") || (projectName || "Project Details")
            };
          });

          // Strictly deduplicate by client identity (phone or name) so each client appears only once
          const uniqueClientsMap = new Map();
          const phoneToKey = new Map();
          const nameToKey = new Map();

          formattedProjects.forEach((proj) => {
            const cleanPhone = proj.phoneNumber ? String(proj.phoneNumber).replace(/\D/g, "") : "";
            const cleanName = proj.clientName ? proj.clientName.trim().toLowerCase() : "";

            let key = null;
            if (cleanPhone && cleanPhone.length >= 7 && phoneToKey.has(cleanPhone)) {
              key = phoneToKey.get(cleanPhone);
            } else if (cleanName && cleanName !== "unnamed client" && cleanName !== "--" && nameToKey.has(cleanName)) {
              key = nameToKey.get(cleanName);
            }

            if (!key) {
              key = (cleanPhone && cleanPhone.length >= 7 ? `phone_${cleanPhone}` : null) ||
                    (cleanName && cleanName !== "unnamed client" && cleanName !== "--" ? `name_${cleanName}` : null) ||
                    `id_${proj.id}`;

              if (cleanPhone && cleanPhone.length >= 7) phoneToKey.set(cleanPhone, key);
              if (cleanName && cleanName !== "unnamed client" && cleanName !== "--") nameToKey.set(cleanName, key);

              uniqueClientsMap.set(key, {
                ...proj,
                allProjects: [proj]
              });
            } else {
              const existing = uniqueClientsMap.get(key);
              existing.allProjects.push(proj);
              if (!existing.companyName && proj.companyName) existing.companyName = proj.companyName;
              if (!existing.city && proj.city) existing.city = proj.city;
              if (!existing.phoneNumber && proj.phoneNumber) existing.phoneNumber = proj.phoneNumber;
              if (cleanPhone && cleanPhone.length >= 7) phoneToKey.set(cleanPhone, key);
              if (cleanName && cleanName !== "unnamed client" && cleanName !== "--") nameToKey.set(cleanName, key);
            }
          });
          setPresalesList(Array.from(uniqueClientsMap.values()));
        }
      } catch (err) {
        console.log("Error fetching presales leads for PMS:", err);
      }

      // 1. Materials Master
      try {
        const res = await materialService.getAllMaterials({ limit: 500 });
        const items = res?.data?.data || res?.data;
        if (Array.isArray(items) && items.length > 0) {
          const formatted = items.map((m) => {
            const autoDetails =
              m.materialDetails ||
              m.specificationGrade ||
              m.description ||
              [
                m.brand && m.brand !== "Generic" ? m.brand : "",
                m.category || m.materialCategory,
                m.baseUom ? `(${m.baseUom})` : ""
              ]
                .filter(Boolean)
                .join(" • ") ||
              m.name ||
              m.materialName ||
              "";

            return {
              ...m,
              id: m._id || m.id,
              name: m.name || m.materialName,
              category: m.category || m.materialCategory,
              details: autoDetails,
              supplier: m.preferredSupplier || "",
              supplierType: m.supplierType || ""
            };
          });
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

      // 4. WBS 3 Dedicated Backend APIs: Stages, Works, Tasks (Limit: 1000)
      try {
        setWbsLoading(true);
        const [stagesRes, worksRes, tasksRes, statusesRes] = await Promise.all([
          pmsWbsService.getStagesPaginated({ limit: 1000 }),
          pmsWbsService.getWorksPaginated({ limit: 1000 }),
          pmsWbsService.getTasksPaginated({ limit: 1000 }),
          pmsWbsService.getAllProjectStatuses().catch(() => null)
        ]);

        const stagesData = stagesRes?.data || stagesRes?.data?.data || (Array.isArray(stagesRes) ? stagesRes : []);
        const worksData = worksRes?.data || worksRes?.data?.data || (Array.isArray(worksRes) ? worksRes : []);
        const tasksData = tasksRes?.data || tasksRes?.data?.data || (Array.isArray(tasksRes) ? tasksRes : []);
        const statusesData = statusesRes?.data?.data || statusesRes?.data || [];

        if (Array.isArray(statusesData) && statusesData.length > 0) {
          setProjectStatusList(statusesData);
        }

        if (Array.isArray(stagesData) && stagesData.length > 0) {
          setWbsStages(stagesData);
          localStorage.setItem(PMS_MASTER_STAGES_KEY, JSON.stringify(stagesData));
        }
        if (Array.isArray(worksData) && worksData.length > 0) {
          setWbsWorks(worksData);
          localStorage.setItem(PMS_MASTER_WORKS_KEY, JSON.stringify(worksData));
        }
        if (Array.isArray(tasksData) && tasksData.length > 0) {
          setWbsTasks(tasksData);
          localStorage.setItem(PMS_MASTER_TASKS_KEY, JSON.stringify(tasksData));
        }

        // 4. Fetch existing PMS templates to detect already configured projects
        try {
          const tRes = await pmsTemplateService.getAllTemplates({ limit: 1000 });
          const templatesList = tRes?.data?.data || tRes?.data || [];
          const ids = new Set();
          if (Array.isArray(templatesList)) {
            templatesList.forEach((t) => {
              const pId = t.projectId?._id || t.projectId;
              if (pId) ids.add(String(pId));
            });
          }
          const stored = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              parsed.forEach((t) => {
                const pId = t.projectId?._id || t.projectId || t.selectedProjectIds?.[0];
                if (pId) ids.add(String(pId));
              });
            }
          }
          setExistingProjectIds(ids);
        } catch (tErr) {
          console.warn("Could not fetch existing templates for project duplicate check:", tErr);
        }
      } catch (e) {
        console.log("Error loading WBS data via separate APIs:", e);
      } finally {
        setWbsLoading(false);
      }
    };

    fetchMasters();
  }, []);

  // Load existing task if in Edit mode
  useEffect(() => {
    if (isEdit && id) {
      setFetching(true);
      const loadEditData = async () => {
        try {
          let found = null;

          // 1. Try Backend API if ObjectId
          if (id.length === 24) {
            try {
              const res = await pmsTemplateService.getTemplateById(id);
              if (res?.data) {
                const apiData = res.data.data || res.data;
                if (apiData) {
                  found = apiData;
                }
              }
            } catch (apiErr) {
              console.warn("Could not fetch template from API for edit, checking local storage:", apiErr);
            }
          }

          // 2. Check local storage cache
          if (!found) {
            const stored = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
            let list = INITIAL_PMS_TASKS;
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) list = parsed;
            }
            found = list.find((t) => String(t._id || t.id) === String(id));
          }

          if (found) {
            const rawProjectStatus = found.projectStatus;
            const normalizedProjectStatus = Array.isArray(rawProjectStatus)
              ? rawProjectStatus.map((st) => (typeof st === "object" ? st.status_name || st.name || st.value : String(st)))
              : typeof rawProjectStatus === "string" && rawProjectStatus.trim()
              ? rawProjectStatus.split(",").map((s) => s.trim()).filter(Boolean)
              : ["On Track"];

            setFormData((prev) => ({
              ...prev,
              ...found,
              clientName: found.leadId?.clientName || found.clientName || "",
              projectDetails: found.projectId?.projectName || found.projectDetails || "",
              projectId: found.projectId?._id || found.projectId || found.selectedProjectIds?.[0] || null,
              projectStatus: normalizedProjectStatus
            }));

            const mapMaterialSupplierToMaterials = (fieldData = {}) => {
              if (Array.isArray(fieldData.materials) && fieldData.materials.length > 0) {
                return fieldData.materials;
              }
              if (Array.isArray(fieldData.materialSupplier) && fieldData.materialSupplier.length > 0) {
                return fieldData.materialSupplier.map((m) => {
                  const mName =
                    (typeof m.materialId === "object" ? m.materialId?.name || m.materialId?.materialName : null) ||
                    m.materialName ||
                    m.materialRequired ||
                    m.name ||
                    "";
                  const sName =
                    (typeof m.supplierId === "object" ? m.supplierId?.name : null) ||
                    m.supplierName ||
                    "";
                  return {
                    materialId: typeof m.materialId === "object" ? m.materialId?._id : m.materialId || null,
                    materialRequired: mName,
                    name: mName,
                    supplierId: typeof m.supplierId === "object" ? m.supplierId?._id : m.supplierId || null,
                    supplierName: sName,
                    supplierType: m.supplierType || (typeof m.supplierId === "object" ? m.supplierId?.supplierType : "") || ""
                  };
                });
              }
              return [];
            };

            // If template has stages array from backend schema
            if (Array.isArray(found.stages) && found.stages.length > 0) {
              const formattedStages = found.stages.map((stg) => {
                const fData = stg.fieldData || {};
                const stgMaterials = mapMaterialSupplierToMaterials(fData);
                return {
                  stageId: stg.stageId?.stage_code || stg.stage_code || stg.stageId,
                  stageObjId: stg.stageId?._id || stg.stageId,
                  ...DEFAULT_STAGE_DETAILS,
                  ...fData,
                  materials: stgMaterials.length > 0 ? stgMaterials : fData.materials || [],
                  works: (stg.works || []).map((wrk) => {
                    const wfData = wrk.fieldData || {};
                    const wrkMaterials = mapMaterialSupplierToMaterials(wfData);
                    return {
                      workId: wrk.workId?.work_code || wrk.work_code || wrk.workId,
                      workObjId: wrk.workId?._id || wrk.workId,
                      ...wfData,
                      materials: wrkMaterials.length > 0 ? wrkMaterials : wfData.materials || [],
                      tasks: (wrk.tasks || []).map((tsk) => {
                        const tfData = tsk.fieldData || {};
                        const tskMaterials = mapMaterialSupplierToMaterials(tfData);
                        return {
                          taskId: tsk.taskId?.task_code || tsk.task_code || tsk.taskId,
                          taskObjId: tsk.taskId?._id || tsk.taskId,
                          ...tfData,
                          materials: tskMaterials.length > 0 ? tskMaterials : tfData.materials || []
                        };
                      })
                    };
                  })
                };
              });
              setWbsStructure({ stages: formattedStages });
              const initialExpanded = {};
              formattedStages.forEach((s) => {
                initialExpanded[s.stageId] = true;
              });
              setExpandedStages(initialExpanded);
            } else if (found.wbsStructure?.stages?.length > 0) {
              const stagesWithDefaults = found.wbsStructure.stages.map((s) => ({
                ...DEFAULT_STAGE_DETAILS,
                ...s
              }));
              setWbsStructure({ stages: stagesWithDefaults });
              const initialExpanded = {};
              stagesWithDefaults.forEach((s) => {
                initialExpanded[s.stageId] = true;
              });
              setExpandedStages(initialExpanded);
            } else if (found.stage) {
              const stg = found.stage;
              const wrk = found.work;
              const tsk = found.task;
              setWbsStructure({
                stages: [
                  {
                    stageId: stg,
                    works: wrk ? [{ workId: wrk, tasks: tsk ? [tsk] : [] }] : [],
                    ...DEFAULT_STAGE_DETAILS,
                    workWillDoneBy: found.workWillDoneBy || "",
                    contractorType: found.contractorType || "",
                    toolsVehicles: found.toolsVehicles || [],
                    materialRequired: found.materialRequired || "",
                    materialDetails: found.materialDetails || "",
                    supplierType: found.supplierType || "",
                    supplierName: found.supplierName || "",
                    maxTimeToComplete: found.maxTimeToComplete || "3",
                    timeUnit: found.timeUnit || "Days",
                    deadlineDate: found.deadlineDate || "",
                    durationDays: found.durationDays || "3",
                    durationHours: found.durationHours || "0",
                    instruction: found.instruction || "",
                    remark: found.remark || ""
                  }
                ]
              });
              setExpandedStages({ [stg]: true });
            }
          } else {
            toast.error("Template not found with ID: " + id);
            navigate("/sales/master/pms-template");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetching(false);
        }
      };

      loadEditData();
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

  // 0. Project Status Multi-Select Options & State handlers
  const projectStatusOptions = useMemo(() => {
    return (projectStatusList || []).map((st) => {
      const val = typeof st === "object" && st !== null ? st.status_name || st.name || st.value : String(st);
      return {
        value: val,
        label: val
      };
    });
  }, [projectStatusList]);

  const selectedProjectStatuses = useMemo(() => {
    if (Array.isArray(formData.projectStatus)) return formData.projectStatus;
    if (typeof formData.projectStatus === "string" && formData.projectStatus.trim()) {
      return formData.projectStatus.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [formData.projectStatus]);

  const handleProjectStatusChange = (newStatuses) => {
    setFormData((prev) => ({
      ...prev,
      projectStatus: newStatuses
    }));
    if (errors.projectStatus) {
      setErrors((prev) => ({ ...prev, projectStatus: "" }));
    }
  };

  // Project Details Single-Select Options for currently selected client
  const projectDetailsOptions = useMemo(() => {
    if (!formData.clientName) return [];
    const client = presalesList.find(
      (c) => c.clientName?.toLowerCase().trim() === formData.clientName?.toLowerCase().trim()
    );
    if (!client) return [];
    const projects = Array.isArray(client.allProjects) && client.allProjects.length > 0
      ? client.allProjects
      : (client.projectDetails ? [client] : []);

    return projects.map((p, idx) => {
      const key = String(p.id || p._id || `proj_${idx}`);
      const pName = p.projectName ? p.projectName : "";
      const cat = p.workCategory || p.businessType || "";
      const wt = p.workType || "";

      // Label contains ONLY: Project Name (or Project #), Category, Work Type
      const parts = [];
      if (pName) {
        parts.push(pName);
      } else {
        parts.push(`Project #${idx + 1}`);
      }
      if (cat && cat !== "--") parts.push(`Category: ${cat}`);
      if (wt && wt !== "--") parts.push(`Work Type: ${wt}`);

      const label = parts.join(" | ");
      const isAlreadyConfigured = existingProjectIds.has(key) && (!isEdit || String(formData.projectId) !== key);

      return {
        value: key,
        label,
        projectName: pName,
        workCategory: cat,
        workType: wt,
        detailText: label,
        data: p,
        isAlreadyConfigured
      };
    });
  }, [formData.clientName, presalesList, existingProjectIds, isEdit, formData.projectId]);

  const handleProjectSelect = (projOption) => {
    if (!projOption) {
      setFormData((prev) => ({
        ...prev,
        projectId: null,
        selectedProjectIds: [],
        projectDetails: ""
      }));
      return;
    }

    // Prevent selecting a project whose template is already created
    if (projOption.isAlreadyConfigured) {
      toast.warning(
        `A PMS Template has already been created for "${projOption.projectName || projOption.label}". You cannot create duplicate templates for the same project.`
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      projectId: projOption.value,
      selectedProjectIds: [projOption.value],
      projectDetails: projOption.label
    }));
    if (errors.projectId) {
      setErrors((prev) => ({ ...prev, projectId: "" }));
    }
    setIsProjectOpen(false);
  };

  // 1. Stage Options (From backend stages API - 1000 limit)
  const stageOptions = useMemo(() => {
    return (wbsStages || []).map((s) => {
      const code = s.stage_code || s.code || s.id || "";
      const name = s.stage_name || s.name || "";
      return {
        value: code,
        label: name ? `${code} - ${name}` : code
      };
    });
  }, [wbsStages]);

  // 2. Dynamic Works for a specific Stage (Backend matching works prioritized, with all works available)
  const getWorksForStage = (stageCode) => {
    const matching = [];
    const others = [];
    (wbsWorks || []).forEach((w) => {
      const code = w.work_code || w.code || w.id || "";
      const name = w.work_name || w.name || "";
      const label = name ? `${code} - ${name}` : code;
      const isMatch =
        w.stage_code === stageCode ||
        code.startsWith(`${stageCode}-`) ||
        code.startsWith(stageCode);
      if (isMatch) {
        matching.push({ value: code, label });
      } else {
        others.push({ value: code, label: `${code} - ${name}` });
      }
    });
    return [...matching, ...others];
  };

  // 3. Dynamic Tasks for a specific Work (Backend matching tasks prioritized, with all tasks available)
  const getTasksForWork = (workCode) => {
    const matching = [];
    const others = [];
    (wbsTasks || []).forEach((t) => {
      const code = t.task_code || t.code || t.id || "";
      const name = t.task_name || t.name || "";
      const label = name ? `${code} - ${name}` : code;
      const isMatch =
        t.work_code === workCode ||
        code.startsWith(`${workCode}-`) ||
        code.startsWith(workCode);
      if (isMatch) {
        matching.push({ value: code, label });
      } else {
        others.push({ value: code, label: `${code} - ${name}` });
      }
    });
    return [...matching, ...others];
  };

  // Toggle stage accordion
  const toggleStageExpanded = (stageId) => {
    setExpandedStages((prev) => ({
      ...prev,
      [stageId]: prev[stageId] !== undefined ? !prev[stageId] : false
    }));
  };

  // Level 1: Stages multi-select change handler
  const handleStagesChange = (newStageIds) => {
    setWbsStructure((prev) => {
      const currentStages = prev.stages || [];
      const currentMap = new Map(currentStages.map((s) => [s.stageId, s]));
      const nextStages = newStageIds.map((sId) => {
        if (currentMap.has(sId)) {
          return currentMap.get(sId);
        }
        const foundStage = (wbsStages || []).find(
          (s) => (s.stage_code || s.code || s.id) === sId
        );
        const matchingWorks = (wbsWorks || []).filter(
          (w) => w.stage_code === sId || (w.work_code || "").startsWith(`${sId}-`)
        );
        const initialWorks = matchingWorks.map((mw) => {
          const matchingTasks = (wbsTasks || []).filter(
            (t) => t.work_code === mw.work_code || (t.task_code || "").startsWith(`${mw.work_code}-`)
          );
          return {
            workId: mw.work_code || mw.code || mw.id,
            workObjId: mw._id || mw.id || null,
            workName: mw.work_name || mw.name || "",
            tasks: matchingTasks.map((mt) => ({
              taskId: mt.task_code || mt.code || mt.id,
              taskObjId: mt._id || mt.id || null,
              taskName: mt.task_name || mt.name || "",
              ...DEFAULT_STAGE_DETAILS
            })),
            ...DEFAULT_STAGE_DETAILS
          };
        });

        return {
          stageId: sId,
          stageObjId: foundStage?._id || foundStage?.id || null,
          stageName: foundStage?.stage_name || foundStage?.name || "",
          works: initialWorks,
          ...DEFAULT_STAGE_DETAILS
        };
      });
      return { stages: nextStages };
    });
    setExpandedStages((prev) => {
      const updated = { ...prev };
      newStageIds.forEach((id) => {
        if (updated[id] === undefined) updated[id] = true;
      });
      return updated;
    });
    if (errors.stage) setErrors((prev) => ({ ...prev, stage: "" }));
  };

  // Level 2: Works multi-select change handler for a specific Stage
  const handleWorksChange = (stageId, newWorkIds) => {
    setWbsStructure((prev) => {
      const nextStages = (prev.stages || []).map((stg) => {
        if (stg.stageId !== stageId) return stg;
        const currentWorksMap = new Map((stg.works || []).map((w) => [w.workId, w]));
        const nextWorks = newWorkIds.map((wId) => {
          if (currentWorksMap.has(wId)) {
            return currentWorksMap.get(wId);
          }
          const foundWork = (wbsWorks || []).find(
            (w) => (w.work_code || w.code || w.id) === wId
          );
          return {
            workId: wId,
            workObjId: foundWork?._id || foundWork?.id || null,
            workName: foundWork?.work_name || foundWork?.name || "",
            tasks: [],
            ...DEFAULT_STAGE_DETAILS
          };
        });
        return { ...stg, works: nextWorks };
      });
      return { stages: nextStages };
    });
    if (newWorkIds.length > 0 && (!activeWorkId || !newWorkIds.includes(activeWorkId))) {
      setActiveWorkId(newWorkIds[0]);
    }
  };

  // Level 3: Tasks multi-select change handler for a specific Work under a Stage
  const handleTasksChange = (stageId, workId, newTaskIds) => {
    setWbsStructure((prev) => {
      const nextStages = (prev.stages || []).map((stg) => {
        if (stg.stageId !== stageId) return stg;
        const nextWorks = (stg.works || []).map((w) => {
          if (w.workId !== workId) return w;
          const currentTasksMap = new Map(
            (w.tasks || []).map((t) => [typeof t === "object" ? t.taskId : t, t])
          );
          const nextTasks = newTaskIds.map((tId) => {
            if (currentTasksMap.has(tId)) {
              return currentTasksMap.get(tId);
            }
            const foundTask = (wbsTasks || []).find(
              (t) => (t.task_code || t.code || t.id) === tId
            );
            return {
              taskId: tId,
              taskObjId: foundTask?._id || foundTask?.id || null,
              taskName: foundTask?.task_name || foundTask?.name || "",
              ...DEFAULT_STAGE_DETAILS
            };
          });
          return { ...w, tasks: nextTasks };
        });
        return { ...stg, works: nextWorks };
      });
      return { stages: nextStages };
    });
    if (newTaskIds.length > 0 && (!activeTaskId || !newTaskIds.includes(activeTaskId))) {
      setActiveTaskId(newTaskIds[0]);
    }
  };

  // Auto-synchronize activeStageId, activeWorkId, and activeTaskId with current hierarchy
  useEffect(() => {
    const stages = wbsStructure.stages || [];
    if (stages.length === 0) {
      if (activeStageId !== null) setActiveStageId(null);
      if (activeWorkId !== null) setActiveWorkId(null);
      if (activeTaskId !== null) setActiveTaskId(null);
      return;
    }

    const currentStageExists = stages.some((s) => s.stageId === activeStageId);
    const effectiveStageId = currentStageExists ? activeStageId : stages[0].stageId;
    if (effectiveStageId !== activeStageId) {
      setActiveStageId(effectiveStageId);
    }

    const currentStage = stages.find((s) => s.stageId === effectiveStageId);
    const works = currentStage?.works || [];
    if (works.length === 0) {
      if (activeWorkId !== null) setActiveWorkId(null);
      if (activeTaskId !== null) setActiveTaskId(null);
      return;
    }

    const currentWorkExists = works.some((w) => w.workId === activeWorkId);
    const effectiveWorkId = currentWorkExists ? activeWorkId : works[0].workId;
    if (effectiveWorkId !== activeWorkId) {
      setActiveWorkId(effectiveWorkId);
    }

    const currentWork = works.find((w) => w.workId === effectiveWorkId);
    const tasks = currentWork?.tasks || [];
    if (tasks.length === 0) {
      if (activeTaskId !== null) setActiveTaskId(null);
      return;
    }

    const getTId = (t) => (typeof t === "object" ? t.taskId : t);
    const currentTaskExists = tasks.some((t) => getTId(t) === activeTaskId);
    const effectiveTaskId = currentTaskExists ? activeTaskId : getTId(tasks[0]);
    if (effectiveTaskId !== activeTaskId) {
      setActiveTaskId(effectiveTaskId);
    }
  }, [wbsStructure, activeStageId, activeWorkId, activeTaskId]);

  const removeStage = (stageId) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).filter((s) => s.stageId !== stageId)
    }));
  };

  const removeWork = (stageId, workId) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).filter((w) => w.workId !== workId)
        };
      })
    }));
  };

  const handleClearAllWbs = () => {
    setWbsStructure({ stages: [] });
    setActiveStageId(null);
    setActiveWorkId(null);
    setActiveTaskId(null);
  };

  // Update field value for a specific Work
  const updateWorkField = (stageId, workId, field, value) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return { ...w, [field]: value };
          })
        };
      })
    }));
  };

  // Update field value for a specific Task
  const updateTaskField = (stageId, workId, taskId, field, value) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return {
              ...w,
              tasks: (w.tasks || []).map((t) => {
                const curId = typeof t === "object" ? t.taskId : t;
                if (curId !== taskId) return t;
                const baseObj = typeof t === "object" ? t : { taskId: t, ...DEFAULT_STAGE_DETAILS };
                return { ...baseObj, [field]: value };
              })
            };
          })
        };
      })
    }));
  };

  // Copy execution details from parent Stage down to Work
  const copyStageToWork = (stageId, workId) => {
    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    if (!targetStage) return;
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return {
              ...w,
              workWillDoneBy: targetStage.workWillDoneBy || w.workWillDoneBy,
              contractorType: targetStage.contractorType || w.contractorType,
              toolsVehicles: Array.isArray(targetStage.toolsVehicles)
                ? [...targetStage.toolsVehicles]
                : w.toolsVehicles,
              materialRequired: targetStage.materialRequired || w.materialRequired,
              materialDetails: targetStage.materialDetails || w.materialDetails,
              supplierType: targetStage.supplierType || w.supplierType,
              supplierName: targetStage.supplierName || w.supplierName,
              materials: Array.isArray(targetStage.materials)
                ? JSON.parse(JSON.stringify(targetStage.materials))
                : (w.materials || []),
              maxTimeToComplete: targetStage.maxTimeToComplete || w.maxTimeToComplete,
              timeUnit: targetStage.timeUnit || w.timeUnit,
              deadlineDate: targetStage.deadlineDate || w.deadlineDate,
              durationDays: targetStage.durationDays || w.durationDays,
              durationHours: targetStage.durationHours || w.durationHours,
              instruction: targetStage.instruction || w.instruction,
              remark: targetStage.remark || w.remark
            };
          })
        };
      })
    }));
    toast.info(`Copied details from Stage ${stageId} to Work ${workId}`);
  };

  // Copy execution details from parent Work down to Task
  const copyWorkToTask = (stageId, workId, taskId) => {
    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    const targetWork = targetStage?.works?.find((w) => w.workId === workId);
    if (!targetWork) return;

    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return {
              ...w,
              tasks: (w.tasks || []).map((t) => {
                const curId = typeof t === "object" ? t.taskId : t;
                if (curId !== taskId) return t;
                const baseObj = typeof t === "object" ? t : { taskId: t };
                return {
                  ...baseObj,
                  workWillDoneBy: targetWork.workWillDoneBy || baseObj.workWillDoneBy,
                  contractorType: targetWork.contractorType || baseObj.contractorType,
                  toolsVehicles: Array.isArray(targetWork.toolsVehicles)
                    ? [...targetWork.toolsVehicles]
                    : baseObj.toolsVehicles,
                  materialRequired: targetWork.materialRequired || baseObj.materialRequired,
                  materialDetails: targetWork.materialDetails || baseObj.materialDetails,
                  supplierType: targetWork.supplierType || baseObj.supplierType,
                  supplierName: targetWork.supplierName || baseObj.supplierName,
                  materials: Array.isArray(targetWork.materials)
                    ? JSON.parse(JSON.stringify(targetWork.materials))
                    : (baseObj.materials || []),
                  maxTimeToComplete: targetWork.maxTimeToComplete || baseObj.maxTimeToComplete,
                  timeUnit: targetWork.timeUnit || baseObj.timeUnit,
                  deadlineDate: targetWork.deadlineDate || baseObj.deadlineDate,
                  durationDays: targetWork.durationDays || baseObj.durationDays,
                  durationHours: targetWork.durationHours || baseObj.durationHours,
                  instruction: targetWork.instruction || baseObj.instruction,
                  remark: targetWork.remark || baseObj.remark
                };
              })
            };
          })
        };
      })
    }));
    toast.info(`Copied details from Work ${workId} to Task ${taskId}`);
  };

  // Bulk apply execution details from Stage down to ALL its works
  const applyStageToAllWorks = (stageId) => {
    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    if (!targetStage) return;
    const worksCount = targetStage.works?.length || 0;
    if (worksCount === 0) {
      toast.warning(`No works selected under Stage ${stageId} yet.`);
      return;
    }

    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => ({
            ...w,
            workWillDoneBy: targetStage.workWillDoneBy || w.workWillDoneBy,
            contractorType: targetStage.contractorType || w.contractorType,
            toolsVehicles: Array.isArray(targetStage.toolsVehicles)
              ? [...targetStage.toolsVehicles]
              : w.toolsVehicles,
            materialRequired: targetStage.materialRequired || w.materialRequired,
            materialDetails: targetStage.materialDetails || w.materialDetails,
            supplierType: targetStage.supplierType || w.supplierType,
            supplierName: targetStage.supplierName || w.supplierName,
            materials: Array.isArray(targetStage.materials)
              ? JSON.parse(JSON.stringify(targetStage.materials))
              : (w.materials || []),
            maxTimeToComplete: targetStage.maxTimeToComplete || w.maxTimeToComplete,
            timeUnit: targetStage.timeUnit || w.timeUnit,
            deadlineDate: targetStage.deadlineDate || w.deadlineDate,
            durationDays: targetStage.durationDays || w.durationDays,
            durationHours: targetStage.durationHours || w.durationHours,
            instruction: targetStage.instruction || w.instruction,
            remark: targetStage.remark || w.remark
          }))
        };
      })
    }));
    toast.success(`Applied Stage ${stageId} details to all ${worksCount} works!`);
  };

  // Bulk apply execution details from Work down to ALL its tasks
  const applyWorkToAllTasks = (stageId, workId) => {
    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    const targetWork = targetStage?.works?.find((w) => w.workId === workId);
    if (!targetWork) return;
    const tasksCount = targetWork.tasks?.length || 0;
    if (tasksCount === 0) {
      toast.warning(`No tasks selected under Work ${workId} yet.`);
      return;
    }

    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        return {
          ...s,
          works: (s.works || []).map((w) => {
            if (w.workId !== workId) return w;
            return {
              ...w,
              tasks: (w.tasks || []).map((t) => {
                const baseObj = typeof t === "object" ? t : { taskId: t };
                return {
                  ...baseObj,
                  workWillDoneBy: targetWork.workWillDoneBy || baseObj.workWillDoneBy,
                  contractorType: targetWork.contractorType || baseObj.contractorType,
                  toolsVehicles: Array.isArray(targetWork.toolsVehicles)
                    ? [...targetWork.toolsVehicles]
                    : baseObj.toolsVehicles,
                  materialRequired: targetWork.materialRequired || baseObj.materialRequired,
                  materialDetails: targetWork.materialDetails || baseObj.materialDetails,
                  supplierType: targetWork.supplierType || baseObj.supplierType,
                  supplierName: targetWork.supplierName || baseObj.supplierName,
                  materials: Array.isArray(targetWork.materials)
                    ? JSON.parse(JSON.stringify(targetWork.materials))
                    : (baseObj.materials || []),
                  maxTimeToComplete: targetWork.maxTimeToComplete || baseObj.maxTimeToComplete,
                  timeUnit: targetWork.timeUnit || baseObj.timeUnit,
                  deadlineDate: targetWork.deadlineDate || baseObj.deadlineDate,
                  durationDays: targetWork.durationDays || baseObj.durationDays,
                  durationHours: targetWork.durationHours || baseObj.durationHours,
                  instruction: targetWork.instruction || baseObj.instruction,
                  remark: targetWork.remark || baseObj.remark
                };
              })
            };
          })
        };
      })
    }));
    toast.success(`Applied Work ${workId} details to all ${tasksCount} tasks!`);
  };

  // Live count computations
  const stagesList = wbsStructure.stages || [];
  const totalStagesCount = stagesList.length;
  const totalWorksCount = useMemo(
    () => stagesList.reduce((sum, s) => sum + (s.works?.length || 0), 0),
    [stagesList]
  );
  const totalTasksCount = useMemo(
    () =>
      stagesList.reduce(
        (sum, s) =>
          sum + (s.works || []).reduce((wSum, w) => wSum + (w.tasks?.length || 0), 0),
        0
      ),
    [stagesList]
  );

  // Auto-save draft to localStorage
  useEffect(() => {
    if (!isEdit && stagesList.length > 0) {
      const draftTimer = setTimeout(() => {
        try {
          localStorage.setItem(
            "pms_template_create_draft",
            JSON.stringify({ wbsStructure, formData, savedAt: new Date().toISOString() })
          );
        } catch (e) {
          // ignore quota
        }
      }, 1000);
      return () => clearTimeout(draftTimer);
    }
  }, [wbsStructure, formData, isEdit, stagesList.length]);

  // Synchronize wbsStructure into primary formData fields (stage, work, task)
  useEffect(() => {
    const allStages = (wbsStructure.stages || []).map((s) => s.stageId);
    const allWorks = (wbsStructure.stages || []).flatMap((s) => (s.works || []).map((w) => w.workId));
    const allTasks = (wbsStructure.stages || []).flatMap((s) =>
      (s.works || []).flatMap((w) => (w.tasks || []).map((t) => (typeof t === "object" ? t.taskId : t)))
    );

    setFormData((prev) => ({
      ...prev,
      stage: allStages.join(", "),
      work: allWorks.join(", "),
      task: allTasks.join(", ")
    }));
  }, [wbsStructure]);

  // Update field value for a specific Stage
  const updateStageField = (stageId, field, value) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) =>
        s.stageId === stageId ? { ...s, [field]: value } : s
      )
    }));
    if (errors[`${stageId}_${field}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${stageId}_${field}`];
        return next;
      });
    }
  };

  // Work Will Done By selection -> auto-fills Contractor Type & suggestions for that Stage
  const handleSelectWorkDoneBy = (stageId, workerOrContractor) => {
    const foundContractor = contractorList.find(
      (c) => c.name.toLowerCase() === workerOrContractor.toLowerCase()
    );

    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    let updatedTools = Array.isArray(targetStage?.toolsVehicles) ? [...targetStage.toolsVehicles] : [];
    let matchedType = targetStage?.contractorType || "";

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

    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) =>
        s.stageId === stageId
          ? {
              ...s,
              workWillDoneBy: workerOrContractor,
              contractorType: matchedType,
              toolsVehicles: updatedTools
            }
          : s
      )
    }));

    setActiveDropdown(null);
    if (errors[`${stageId}_workWillDoneBy`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`${stageId}_workWillDoneBy`];
        return next;
      });
    }
  };

  // Presales Client selection -> Populates Project Details and auto-selects if client has 1 project
  const handleSelectClient = (client) => {
    const clientProjects = Array.isArray(client.allProjects) && client.allProjects.length > 0
      ? client.allProjects
      : (client.projectDetails ? [client] : []);

    let autoProjectId = null;
    let autoProjectDetails = "";
    if (clientProjects.length === 1) {
      const p = clientProjects[0];
      autoProjectId = String(p.id || p._id || "");
      const pName = p.projectName || "";
      const cat = p.workCategory || p.businessType || "";
      const wt = p.workType || "";
      const parts = [];
      if (pName) parts.push(pName);
      else parts.push("Project #1");
      if (cat && cat !== "--") parts.push(`Category: ${cat}`);
      if (wt && wt !== "--") parts.push(`Work Type: ${wt}`);
      autoProjectDetails = parts.join(" | ");
    }

    setFormData((prev) => ({
      ...prev,
      clientId: client.leadId || client.id || client._id,
      clientName: client.clientName,
      selectedProjectIds: autoProjectId ? [autoProjectId] : [],
      projectId: autoProjectId,
      projectDetails: autoProjectDetails
    }));
    setClientSearch("");
    setIsClientOpen(false);
    setIsProjectOpen(false);
  };

  // Auto-fill client & project from URL search parameters (e.g. from Active Projects "+ Add PMS" button)
  useEffect(() => {
    if (isEdit || presalesList.length === 0) return;
    const qClientName = searchParams.get("clientName");
    const qProjectId = searchParams.get("projectId");
    const qProjectName = searchParams.get("projectName");

    if (!qClientName && !qProjectId) return;

    const matchedClient = presalesList.find((c) => {
      if (qClientName && c.clientName?.toLowerCase().trim() === qClientName.toLowerCase().trim()) return true;
      if (qProjectId && (String(c.id) === qProjectId || String(c.leadId) === qProjectId)) return true;
      return false;
    });

    if (matchedClient) {
      handleSelectClient(matchedClient);

      if (qProjectId || qProjectName) {
        const clientProjects = Array.isArray(matchedClient.allProjects) && matchedClient.allProjects.length > 0
          ? matchedClient.allProjects
          : (matchedClient.projectDetails ? [matchedClient] : []);

        const matchedProj = clientProjects.find((p) => {
          if (qProjectId && String(p.id || p._id) === qProjectId) return true;
          if (qProjectName && p.projectName?.toLowerCase().trim() === qProjectName.toLowerCase().trim()) return true;
          return false;
        });

        if (matchedProj) {
          const key = String(matchedProj.id || matchedProj._id || "");
          const pName = matchedProj.projectName || "";
          const cat = matchedProj.workCategory || matchedProj.businessType || "";
          const wt = matchedProj.workType || "";
          const parts = [];
          if (pName) parts.push(pName);
          else parts.push("Project #1");
          if (cat && cat !== "--") parts.push(`Category: ${cat}`);
          if (wt && wt !== "--") parts.push(`Work Type: ${wt}`);
          const autoProjectDetails = parts.join(" | ");

          setFormData((prev) => ({
            ...prev,
            selectedProjectIds: [key],
            projectId: key,
            projectDetails: autoProjectDetails
          }));
        }
      }
    }
  }, [searchParams, presalesList, isEdit]);

  // Material selection -> auto-fills Material Details & Preferred Supplier for that Stage
  const handleSelectMaterial = (stageId, mat) => {
    const targetStage = (wbsStructure.stages || []).find((s) => s.stageId === stageId);
    let autoSuppType = targetStage?.supplierType || "";
    let autoSuppName = targetStage?.supplierName || "";

    if (mat.supplier) {
      autoSuppName = mat.supplier;
      if (mat.supplierType) autoSuppType = mat.supplierType;
    }

    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) =>
        s.stageId === stageId
          ? {
              ...s,
              materialRequired: mat.name,
              materialDetails: mat.details || s.materialDetails,
              supplierName: autoSuppName,
              supplierType: autoSuppType
            }
          : s
      )
    }));

    setActiveDropdown(null);
  };

  // Supplier selection -> auto-fills Supplier Type for that Stage
  const handleSelectSupplier = (stageId, supp) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) =>
        s.stageId === stageId
          ? {
              ...s,
              supplierName: supp.name,
              supplierType: supp.supplierType || s.supplierType
            }
          : s
      )
    }));

    setActiveDropdown(null);
  };

  // Toggle Tool / Vehicle multi-select for that Stage
  const handleToggleTool = (stageId, tool) => {
    setWbsStructure((prev) => ({
      stages: (prev.stages || []).map((s) => {
        if (s.stageId !== stageId) return s;
        const cur = Array.isArray(s.toolsVehicles) ? s.toolsVehicles : [];
        const exists = cur.includes(tool);
        const updated = exists ? cur.filter((t) => t !== tool) : [...cur, tool];
        return { ...s, toolsVehicles: updated };
      })
    }));
  };

  // Validate form required fields (including per-stage execution requirements)
  const validateForm = () => {
    const errs = {};

    // 0. Project Validation (Check Duplicate)
    if (formData.projectId && existingProjectIds.has(String(formData.projectId)) && !isEdit) {
      errs.projectId = "A PMS Template already exists for this project. Cannot create duplicate.";
    }

    // 1. Project Status (Required)
    const hasProjectStatus = Array.isArray(formData.projectStatus)
      ? formData.projectStatus.length > 0
      : Boolean(formData.projectStatus && String(formData.projectStatus).trim());
    if (!hasProjectStatus) errs.projectStatus = "Project Status is required";

    // 2. WBS hierarchy (Requires at least one Stage selected)
    if (!wbsStructure.stages || wbsStructure.stages.length === 0) {
      errs.stage = "Please select at least one Stage";
    } else {
      // Validate each stage has Work Will Done By if needed
      wbsStructure.stages.forEach((stage) => {
        if (!stage.workWillDoneBy || !stage.workWillDoneBy.trim()) {
          errs[`${stage.stageId}_workWillDoneBy`] = `Work Done By is required for Stage ${stage.stageId}`;
        }
      });
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstErrorKey = Object.keys(errs)[0];
      toast.error(errs[firstErrorKey] || "Please fill all mandatory fields marked with *");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    return true;
  };

  // Save / Update Task Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const allStages = (wbsStructure.stages || []).map((s) => s.stageId);
      const allWorks = (wbsStructure.stages || []).flatMap((s) => (s.works || []).map((w) => w.workId));
      const allTasks = (wbsStructure.stages || []).flatMap((s) =>
        (s.works || []).flatMap((w) => (w.tasks || []).map((t) => (typeof t === "object" ? t.taskId : t)))
      );

      const primaryTaskCode =
        allTasks[0] || (formData.task && formData.task !== "--" ? formData.task : `TSK-${Date.now().toString().slice(-4)}`);

      const firstStage = wbsStructure.stages[0] || {};
      const durationFormatted = `${firstStage.durationDays || 0} D ; ${firstStage.durationHours || 0} H`;

      const rawStatus = formData.projectStatus;
      const projectStatusArr = Array.isArray(rawStatus)
        ? rawStatus
        : typeof rawStatus === "string" && rawStatus.trim()
        ? rawStatus.split(",").map((s) => s.trim()).filter(Boolean)
        : ["On Track"];

      // 1. Resolve Client ObjectId
      const foundClient = presalesList.find(
        (c) => c.clientName?.toLowerCase().trim() === formData.clientName?.toLowerCase().trim()
      );
      const resolvedClientId = formData.clientId || foundClient?.leadId || foundClient?.id || foundClient?._id || null;

      // 2. Resolve Project ObjectId
      const selectedProj =
        foundClient?.allProjects?.find((p) => String(p.id || p._id) === String(formData.projectId)) ||
        foundClient?.allProjects?.find((p) => String(p.id || p._id) === String(formData.selectedProjectIds?.[0])) ||
        foundClient?.allProjects?.[0] ||
        foundClient;
      const resolvedProjectId = formData.projectId || selectedProj?._id || selectedProj?.id || null;

      // Duplicate project validation check
      if (resolvedProjectId && existingProjectIds.has(String(resolvedProjectId)) && !isEdit) {
        toast.error("A PMS Template already exists for this project. Duplicate templates cannot be created.");
        setLoading(false);
        return;
      }

      // 3. Resolve Project Statuses with Status ObjectIds (Never null!)
      const mappedProjectStatus = (Array.isArray(formData.projectStatus) ? formData.projectStatus : [formData.projectStatus])
        .filter(Boolean)
        .map((st) => {
          const stNameOrId = typeof st === "object" ? (st.status_name || st.name || st.value || st._id) : String(st);
          const found = (projectStatusList || []).find(
            (s) =>
              String(s._id) === String(stNameOrId) ||
              s.status_name?.toLowerCase().trim() === String(stNameOrId).toLowerCase().trim() ||
              s.status_code?.toLowerCase().trim() === String(stNameOrId).toLowerCase().trim() ||
              s.name?.toLowerCase().trim() === String(stNameOrId).toLowerCase().trim()
          );
          return {
            statusId: found?._id || (stNameOrId.length === 24 ? stNameOrId : null)
          };
        })
        .filter((st) => Boolean(st.statusId));

      // Helper to extract fieldData with materialSupplier matching user schema
      const extractFieldData = (item = {}, parentFallback = {}) => {
        const contrName = item.workWillDoneBy || parentFallback.workWillDoneBy || "";
        const contrObj = (contractorList || []).find(
          (c) => (c.name || "").toLowerCase() === contrName.toLowerCase()
        );
        const contractorId = item.contractorId || contrObj?._id || contrObj?.id || parentFallback.contractorId || null;

        // Extract materialSupplier array (no materialDetails!)
        const rawMats =
          Array.isArray(item.materials) && item.materials.length > 0
            ? item.materials
            : item.materialRequired
            ? [
                {
                  materialId: item.materialId,
                  materialRequired: item.materialRequired,
                  supplierId: item.supplierId,
                  supplierName: item.supplierName || parentFallback.supplierName,
                  supplierType: item.supplierType || parentFallback.supplierType
                }
              ]
            : [];

        const mappedMaterialSupplier = rawMats.map((mat) => {
          const mName = mat.materialRequired || mat.name || "";
          const foundMat = (materialList || []).find(
            (m) =>
              (m.name || m.materialName || "").toLowerCase() === mName.toLowerCase() ||
              String(m.id || m._id) === String(mat.materialId)
          );

          const sName = mat.supplierName || "";
          const foundSupp = (supplierList || []).find(
            (s) =>
              (s.name || s.supplierName || "").toLowerCase() === sName.toLowerCase() ||
              String(s.id || s._id) === String(mat.supplierId)
          );

          return {
            materialId: foundMat?._id || foundMat?.id || (mat.materialId && String(mat.materialId).length === 24 ? mat.materialId : null),
            materialName: mName,
            materialRequired: mName,
            supplierId: foundSupp?._id || foundSupp?.id || (mat.supplierId && String(mat.supplierId).length === 24 ? mat.supplierId : null),
            supplierName: sName,
            supplierType: mat.supplierType || foundSupp?.supplierType || ""
          };
        });

        const dDays = Number(item.durationDays);
        const dHours = Number(item.durationHours);
        const calcDays = !isNaN(dDays) ? dDays : !isNaN(Number(item.maxTimeToComplete)) ? Number(item.maxTimeToComplete) : 3;
        const calcHours = !isNaN(dHours) ? dHours : 0;

        return {
          workWillDoneBy: contrName,
          contractorId: contractorId,
          toolsVehicles: Array.isArray(item.toolsVehicles) ? item.toolsVehicles : [],
          materialSupplier: mappedMaterialSupplier,
          maxTimeToComplete: String(item.maxTimeToComplete || calcDays || 3),
          timeUnit: item.timeUnit || "Days",
          deadlineDate: item.deadlineDate || null,
          durationDays: calcDays,
          durationHours: calcHours,
          durationFormatted: `${calcDays} D ; ${calcHours} H`,
          instruction: item.instruction || "",
          remark: item.remark || ""
        };
      };

      // 4. Transform stages -> works -> tasks hierarchy into Mongoose ObjectIds structure
      const dbStages = (wbsStructure.stages || []).map((stage) => {
        const sObj = (wbsStages || []).find(
          (s) =>
            s.stage_code === stage.stageId ||
            s.code === stage.stageId ||
            s._id === stage.stageObjId ||
            s.id === stage.stageObjId
        );
        const stageObjId = stage.stageObjId || sObj?._id || sObj?.id || null;
        const stageFieldData = extractFieldData(stage);

        const dbWorks = (stage.works || []).map((work) => {
          const wObj = (wbsWorks || []).find(
            (w) =>
              w.work_code === work.workId ||
              w.code === work.workId ||
              w._id === work.workObjId ||
              w.id === work.workObjId
          );
          const workObjId = work.workObjId || wObj?._id || wObj?.id || null;
          const workFieldData = extractFieldData(work, stageFieldData);

          const dbTasks = (work.tasks || []).map((tsk) => {
            const tCode = typeof tsk === "object" ? tsk.taskId : tsk;
            const tObj = (wbsTasks || []).find(
              (t) =>
                t.task_code === tCode ||
                t.code === tCode ||
                t._id === tsk.taskObjId ||
                t.id === tsk.taskObjId
            );
            const tskObj = typeof tsk === "object" ? tsk : {};
            const taskFieldData = extractFieldData(tskObj, workFieldData);

            return {
              taskId: tskObj.taskObjId || tObj?._id || tObj?.id || null,
              fieldData: taskFieldData
            };
          });

          return {
            workId: workObjId,
            fieldData: workFieldData,
            tasks: dbTasks
          };
        });

        return {
          stageId: stageObjId,
          fieldData: stageFieldData,
          works: dbWorks
        };
      });

      // Complete relational backend payload matching user exact Mongoose Schema
      const backendPayload = {
        leadId: resolvedClientId,
        projectId: resolvedProjectId,
        projectStatus: mappedProjectStatus,
        stages: dbStages,
        status: "Active"
      };

      // 5. Send to Database via Backend API
      let apiSavedData = null;
      try {
        if (isEdit && id && id.length === 24) {
          const res = await pmsTemplateService.updateTemplate(id, backendPayload);
          apiSavedData = res?.data?.data || res?.data;
        } else {
          const res = await pmsTemplateService.createTemplate(backendPayload);
          apiSavedData = res?.data?.data || res?.data;
        }
        toast.success(`PMS Task "${primaryTaskCode}" saved to database successfully!`);
      } catch (apiErr) {
        console.error("Backend API save error:", apiErr);
        const errMsg = apiErr?.response?.data?.message || apiErr?.message || "Failed to save PMS Task";
        toast.error(errMsg);
        setLoading(false);
        return; // Stop execution on backend validation error
      }

      // Backward compatible task payload for local storage cache
      const taskPayload = {
        ...formData,
        ...backendPayload,
        _id: apiSavedData?._id || id || undefined,
        id: apiSavedData?._id || formData.id || "TSK-" + Math.floor(100 + Math.random() * 900),
        stage: allStages.join(", ") || formData.stage || "",
        work: allWorks.join(", ") || formData.work || "",
        task: primaryTaskCode,
        wbsStructure,
        updatedAt: new Date().toISOString()
      };

      let updatedList;
      if (isEdit) {
        updatedList = savedTasks.map((item) => (String(item.id) === String(id) ? taskPayload : item));
      } else {
        updatedList = [taskPayload, ...savedTasks];
      }

      setSavedTasks(updatedList);
      localStorage.setItem(PMS_TASKS_STORAGE_KEY, JSON.stringify(updatedList));

      // Also ensure PMS Template master reflects this task count
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
      toast.error("Failed to save PMS Task: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <Loader text="Loading PMS task details..." className="min-h-[400px]" />;
  }

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
                PMS Task Form — Build the Stage → Work → Task hierarchy, then configure execution details.
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
          {/* Client Name (Searchable Single Select from Presales) */}
          <div className="relative" ref={clientDropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span>Client Name</span>
                <span className="text-[10px] text-slate-500 font-medium">(Single Select)</span>
              </span>
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
                      setFormData((prev) => ({
                        ...prev,
                        clientName: "",
                        clientId: null,
                        projectDetails: "",
                        selectedProjectIds: [],
                        projectId: null
                      }));
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
                        p.phoneNumber?.toLowerCase().includes(q) ||
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
                            {Array.isArray(p.allProjects) && p.allProjects.length > 1 && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                                {p.allProjects.length} Projects
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

          {/* Project Details (Single-Select Dropdown for selected client) */}
          <div className="md:col-span-2 relative" ref={projectDropdownRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <span>Project Details</span>
                <span className="text-[10px] text-slate-500 font-medium">(Single Select)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                {formData.clientName
                  ? (() => {
                      const total = projectDetailsOptions.length;
                      const configured = projectDetailsOptions.filter((o) => o.isAlreadyConfigured).length;
                      return `${total} Project${total === 1 ? "" : "s"} Available${configured > 0 ? ` (${configured} Configured)` : ""}`;
                    })()
                  : "Select client first"}
              </span>
            </div>
            {formData.clientName && projectDetailsOptions.length > 0 ? (
              <div className="relative">
                <div
                  onClick={() => setIsProjectOpen(!isProjectOpen)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 flex items-center justify-between cursor-pointer bg-white hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FaBuilding className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className={formData.projectId ? "text-slate-900 font-bold truncate" : "text-slate-400 font-normal"}>
                      {(() => {
                        const currentOpt = projectDetailsOptions.find(
                          (opt) => opt.value === String(formData.projectId) || opt.detailText === formData.projectDetails
                        );
                        return currentOpt ? currentOpt.label : (formData.projectDetails || "Select project details...");
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-1">
                    {formData.projectId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProjectSelect(null);
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                        title="Clear Project"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    )}
                    <FaChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                {/* Project Single-Select Dropdown Options */}
                {isProjectOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-2 max-h-60 overflow-y-auto space-y-1">
                    {projectDetailsOptions.map((opt) => {
                      const isSelected = String(formData.projectId) === String(opt.value);
                      const isConfigured = opt.isAlreadyConfigured;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => handleProjectSelect(opt)}
                          className={`px-3 py-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isConfigured
                              ? "bg-amber-50/50 border border-amber-200/70 cursor-not-allowed opacity-80"
                              : isSelected
                              ? "bg-indigo-50 font-bold text-indigo-900 border border-indigo-200 cursor-pointer"
                              : "hover:bg-indigo-50 text-slate-700 cursor-pointer"
                          }`}
                        >
                          <div className="space-y-1 truncate pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-xs ${isConfigured ? "text-slate-600 line-through decoration-slate-300" : "text-slate-900"}`}>
                                {opt.projectName || opt.label.split("|")[0].trim()}
                              </span>
                              {isConfigured && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                  <FaCheckCircle className="w-2.5 h-2.5 text-amber-600" />
                                  Template Already Created
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 flex-wrap">
                              {opt.workCategory && opt.workCategory !== "--" && (
                                <span className="bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                  Category: {opt.workCategory}
                                </span>
                              )}
                              {opt.workType && opt.workType !== "--" && (
                                <span className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded text-indigo-600 font-medium">
                                  Work Type: {opt.workType}
                                </span>
                              )}
                            </div>
                            {isConfigured && (
                              <p className="text-[10px] text-amber-800 font-medium italic mt-0.5 flex items-center gap-1">
                                <FaExclamationCircle className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                Masterdata already filled for this project (Duplicate not allowed)
                              </p>
                            )}
                          </div>
                          {isSelected && !isConfigured && <FaCheck className="text-indigo-600 w-3.5 h-3.5 shrink-0" />}
                          {isConfigured && (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300/60 shrink-0">
                              Locked
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  disabled
                  placeholder={
                    formData.clientName
                      ? "No project records found for this client"
                      : "Select client first to choose project details..."
                  }
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-400 bg-slate-100/70 cursor-not-allowed"
                />
                <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              </div>
            )}
            {errors.projectId && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.projectId}</p>
            )}
          </div>

          {/* 1. Project Status (Multi-Select with Checkboxes - Required *) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                Project Status <span className="text-red-500">*</span>
              </label>
              {selectedProjectStatuses.length > 0 && (
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                  {selectedProjectStatuses.length} selected
                </span>
              )}
            </div>
            <ReactSelectMulti
              options={projectStatusOptions}
              value={selectedProjectStatuses}
              onChange={handleProjectStatusChange}
              placeholder="Search & select project status(es)..."
              themeColor="indigo"
              allowSelectAll={true}
              hasError={Boolean(errors.projectStatus)}
            />
            {errors.projectStatus && <p className="text-xs text-red-500 mt-1 font-medium">{errors.projectStatus}</p>}
          </div>

          {/* 2-4. WBS Hierarchy Breakdown (Stages -> Works per Stage -> Tasks per Work) */}
          <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            {/* Header with live counters & Level 1 Stage Select */}
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/90">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
                    WBS
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                        WBS Hierarchy Breakdown
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Stages • Works • Tasks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Loaded from 3 dedicated backend APIs ({wbsStages.length} Stages, {wbsWorks.length} Works, {wbsTasks.length} Tasks)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-extrabold text-indigo-700 shadow-2xs">
                    {totalStagesCount} Stage{totalStagesCount === 1 ? "" : "s"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-extrabold text-blue-700 shadow-2xs">
                    {totalWorksCount} Work{totalWorksCount === 1 ? "" : "s"}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-700 shadow-2xs">
                    {totalTasksCount} Task{totalTasksCount === 1 ? "" : "s"}
                  </span>
                  {stagesList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllWbs}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors cursor-pointer ml-1"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Level 1: Stage Multi-Select Dropdown */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Select Stage(s) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {stagesList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleStagesChange([])}
                        className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                        title="Clear all selected stages"
                      >
                        Clear All
                      </button>
                    )}
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {wbsStages.length} Total Available
                    </span>
                  </div>
                </div>
                <ReactSelectMulti
                  options={stageOptions}
                  value={stagesList.map((s) => s.stageId)}
                  onChange={handleStagesChange}
                  placeholder={wbsLoading ? "Loading stages from API..." : "Search & select stages (e.g. S1, S2, S3)..."}
                  themeColor="indigo"
                  allowSelectAll={true}
                  isDisabled={wbsLoading}
                />
                {errors.stage && <p className="text-xs text-red-500 mt-1 font-medium">{errors.stage}</p>}
              </div>
            </div>

            {/* Stage Body */}
            <div className="p-4 sm:p-5 bg-slate-50/40 space-y-4">
              {stagesList.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <FaTasks className="w-5 h-5" />
                  </div>
                  <div className="text-sm font-extrabold text-slate-700">No Stages Selected Yet</div>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Choose one or more stages from the dropdown above to configure works and tasks.
                  </p>
                </div>
              ) : (
                /* ==================== 1. INTERACTIVE STEPPER FLOW VIEW (CHART UI) ==================== */
                (() => {
                  const activeStage =
                    stagesList.find((s) => s.stageId === activeStageId) || stagesList[0];
                  const activeStageWorks = activeStage?.works || [];
                  const activeWork =
                    activeStageWorks.find((w) => w.workId === activeWorkId) || activeStageWorks[0];
                  const activeWorkTasks = activeWork?.tasks || [];
                  const activeTaskRaw =
                    activeWorkTasks.find(
                      (t) => (typeof t === "object" ? t.taskId : t) === activeTaskId
                    ) || activeWorkTasks[0];
                  const activeTaskIdEffective =
                    typeof activeTaskRaw === "object" ? activeTaskRaw.taskId : activeTaskRaw;
                  const activeTaskObj =
                    typeof activeTaskRaw === "object"
                      ? activeTaskRaw
                      : activeTaskRaw
                      ? { taskId: activeTaskRaw, ...DEFAULT_STAGE_DETAILS }
                      : null;

                  // Bottom-up Hierarchical Completion Logic:
                  // 1. Task complete when workWillDoneBy is filled
                  const isTaskComplete = (task) => {
                    if (!task) return false;
                    const obj = typeof task === "object" ? task : null;
                    if (!obj) return false;
                    return Boolean(obj.workWillDoneBy && String(obj.workWillDoneBy).trim() !== "");
                  };

                  // 2. Work complete: Work must have at least 1 task, its own mandatory field filled, AND all child tasks complete
                  const isWorkComplete = (work) => {
                    if (!work) return false;
                    const ownFilled = Boolean(work.workWillDoneBy && String(work.workWillDoneBy).trim() !== "");
                    const tasks = work.tasks || [];
                    if (tasks.length === 0) return false;
                    const allTasksDone = tasks.every((t) => isTaskComplete(t));
                    return ownFilled && allTasksDone;
                  };

                  // 3. Stage complete: Stage must have at least 1 work, its own mandatory field filled, AND all child works complete
                  const isStageComplete = (stg) => {
                    if (!stg) return false;
                    const ownFilled = Boolean(stg.workWillDoneBy && String(stg.workWillDoneBy).trim() !== "");
                    const works = stg.works || [];
                    if (works.length === 0) return false;
                    const allWorksDone = works.every((w) => isWorkComplete(w));
                    return ownFilled && allWorksDone;
                  };

                  const sIdxCurrent = stagesList.findIndex((s) => s.stageId === activeStage?.stageId);
                  const wIdxCurrent = activeStageWorks.findIndex((w) => w.workId === activeWork?.workId);

                  return (
                    <div className="space-y-4">
                      {/* LEVEL 1: STAGE STEPPER PIPELINE (S1 ──➔── S2 ──➔── S3) */}
                      <div className="bg-white p-4 rounded-xl border-2 border-indigo-200/90 shadow-xs">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            Stage Pipeline Stepper
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            Select a stage to view & define its field data, works & tasks
                          </span>
                        </div>
                        <div className="overflow-x-auto pb-2">
                          <div className="flex items-center min-w-max py-2 px-1">
                            {stagesList.map((stg, sIdx) => {
                              const sMeta = wbsStages.find(
                                (s) => (s.stage_code || s.id) === stg.stageId
                              );
                              const isStgActive = activeStage?.stageId === stg.stageId;
                              const isStgDone = isStageComplete(stg);
                              const stgWorks = stg.works || [];
                              const stgWorksCount = stgWorks.length;
                              const stgTasksCount = stgWorks.reduce(
                                (sum, w) => sum + (w.tasks?.length || 0),
                                0
                              );
                              const pendingWorksCount = stgWorks.filter((w) => !isWorkComplete(w)).length;

                              return (
                                <React.Fragment key={stg.stageId}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveStageId(stg.stageId);
                                      const firstWork = stg.works?.[0];
                                      if (firstWork) {
                                        setActiveWorkId(firstWork.workId);
                                        const firstTask = firstWork.tasks?.[0];
                                        if (firstTask) {
                                          setActiveTaskId(
                                            typeof firstTask === "object"
                                              ? firstTask.taskId
                                              : firstTask
                                          );
                                        }
                                      }
                                    }}
                                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                                      isStgActive
                                        ? "bg-white text-slate-900 border-2 border-indigo-600 shadow-xs ring-3 ring-indigo-100/70 scale-[1.01]"
                                        : "bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70"
                                    }`}
                                  >
                                    <div
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                        isStgActive
                                          ? "bg-indigo-600 text-white shadow-2xs"
                                          : isStgDone
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      {stg.stageId}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold truncate max-w-[130px] text-slate-900">
                                          {sMeta?.stage_name || `Stage ${stg.stageId}`}
                                        </span>
                                        {isStgDone ? (
                                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5 shrink-0">
                                            <FaCheckCircle className="w-2 h-2 text-emerald-600" /> Complete
                                          </span>
                                        ) : pendingWorksCount > 0 ? (
                                          <span
                                            className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 shrink-0"
                                            title={`${pendingWorksCount} work(s) incomplete`}
                                          >
                                            <FaExclamationCircle className="w-2 h-2 text-amber-500" /> {pendingWorksCount} Pending
                                          </span>
                                        ) : (
                                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5 shrink-0">
                                            <FaExclamationCircle className="w-2 h-2 text-amber-500" /> Pending
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span>{stgWorksCount} Works</span>
                                        <span>•</span>
                                        <span>{stgTasksCount} Tasks</span>
                                      </div>
                                    </div>
                                  </button>

                                  {/* Thick prominent connecting arrow with circular node */}
                                  {sIdx < stagesList.length - 1 && (
                                    <div className="flex items-center px-2 shrink-0 select-none">
                                      <div
                                        className={`w-4 h-[3px] rounded-l-full transition-colors ${
                                          isStgDone ? "bg-emerald-400" : "bg-slate-300"
                                        }`}
                                      />
                                      <div
                                        className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-2xs shrink-0 ${
                                          isStgDone
                                            ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                                            : "bg-white border-slate-300 text-slate-400"
                                        }`}
                                        title={
                                          isStgDone
                                            ? "Stage & all its works/tasks completed - Ready for next stage"
                                            : "Stage or child works/tasks pending"
                                        }
                                      >
                                        <FaArrowRight className="w-3 h-3" />
                                      </div>
                                      <div
                                        className={`w-4 h-[3px] rounded-r-full transition-colors ${
                                          isStgDone ? "bg-emerald-400" : "bg-slate-300"
                                        }`}
                                      />
                                    </div>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* ACTIVE STAGE CARD */}
                      {activeStage && (
                        <div className="space-y-5 bg-white p-5 rounded-2xl border-[3px] border-indigo-500">
                          {/* 1. STAGE LEVEL EXECUTION & RESOURCE FIELD DATA */}
                          <div className="space-y-2">
                            <ExecutionResourceFieldData
                              title={`STAGE ${activeStage.stageId} — EXECUTION & RESOURCE DETAILS`}
                              subtitle={`Configure execution team, materials & timeline for Stage ${activeStage.stageId}`}
                              level="stage"
                              badge={`STAGE ${activeStage.stageId}`}
                              data={activeStage}
                              onChange={(field, val) =>
                                updateStageField(activeStage.stageId, field, val)
                              }
                              onApplyToAllChildren={() => applyStageToAllWorks(activeStage.stageId)}
                              applyToAllLabel={`Apply to All ${activeStageWorks.length} Works`}
                              contractorList={contractorList}
                              materialList={materialList}
                              supplierList={supplierList}
                              toolsOptions={TOOLS_VEHICLES_MASTER}
                              errors={{
                                workWillDoneBy: errors[`${activeStage.stageId}_workWillDoneBy`],
                                contractorType: errors[`${activeStage.stageId}_contractorType`]
                              }}
                            />
                          </div>

                          {/* 2. WORKS UNDER ACTIVE STAGE */}
                          <div className="pt-4 border-t-2 border-indigo-200 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 bg-blue-100 border-2 border-blue-300 px-3.5 py-1.5 rounded-xl shadow-2xs">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                                <h4 className="text-xs font-black uppercase tracking-wider text-blue-950">
                                  Works for Stage {activeStage.stageId}
                                </h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {activeStageWorks.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleWorksChange(activeStage.stageId, [])}
                                    className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                    title={`Clear all works for Stage ${activeStage.stageId}`}
                                  >
                                    Clear All
                                  </button>
                                )}
                                <span className="text-[10px] font-bold text-blue-800 bg-blue-100 border border-blue-300 px-2.5 py-0.5 rounded-full">
                                  {activeStageWorks.length} Selected
                                </span>
                              </div>
                            </div>
                            <ReactSelectMulti
                              options={getWorksForStage(activeStage.stageId)}
                              value={activeStageWorks.map((w) => w.workId)}
                              onChange={(newWorkIds) =>
                                handleWorksChange(activeStage.stageId, newWorkIds)
                              }
                              placeholder={`Search & select works for Stage ${activeStage.stageId}...`}
                              themeColor="blue"
                              allowSelectAll={true}
                            />

                            {/* IF ACTIVE STAGE HAS WORKS */}
                            {activeStageWorks.length > 0 && (
                              <div className="mt-3 space-y-4">
                                {/* LEVEL 2: WORK STEPPER PIPELINE (W1 ──➔── W2 ──➔── W3) */}
                                <div className="bg-slate-50/90 p-3.5 rounded-xl border-2 border-blue-300 shadow-2xs">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                      Work Pipeline Stepper
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      Click on any work to configure work-level field data & tasks
                                    </span>
                                  </div>
                                  <div className="overflow-x-auto pb-1">
                                    <div className="flex items-center min-w-max py-1 px-1">
                                      {activeStageWorks.map((work, wIdx) => {
                                        const wObj = wbsWorks.find(
                                          (w) => (w.work_code || w.id) === work.workId
                                        );
                                        const isWorkActive = activeWork?.workId === work.workId;
                                        const isWrkDone = isWorkComplete(work);
                                        const workTasks = work.tasks || [];
                                        const workTasksCount = workTasks.length;
                                        const pendingTasksCount = workTasks.filter(
                                          (t) => !isTaskComplete(t)
                                        ).length;

                                        return (
                                          <React.Fragment key={work.workId}>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveWorkId(work.workId);
                                                const firstTask = work.tasks?.[0];
                                                if (firstTask) {
                                                  setActiveTaskId(
                                                    typeof firstTask === "object"
                                                      ? firstTask.taskId
                                                      : firstTask
                                                  );
                                                }
                                              }}
                                              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all cursor-pointer text-left ${
                                                isWorkActive
                                                  ? "bg-white text-slate-900 border-2 border-blue-600 shadow-xs ring-3 ring-blue-100/70"
                                                  : "bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70"
                                              }`}
                                            >
                                              <div
                                                className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-[11px] shrink-0 transition-colors ${
                                                  isWorkActive
                                                    ? "bg-blue-600 text-white shadow-2xs"
                                                    : isWrkDone
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold"
                                                    : "bg-blue-50 text-blue-700"
                                                }`}
                                              >
                                                W
                                              </div>
                                              <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                  <span className="text-xs font-bold truncate max-w-[110px] text-slate-900">
                                                    {work.workId}
                                                  </span>
                                                  {isWrkDone ? (
                                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5 shrink-0">
                                                      <FaCheckCircle className="w-2 h-2 text-emerald-600" /> Complete
                                                    </span>
                                                  ) : pendingTasksCount > 0 ? (
                                                    <span
                                                      className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5 shrink-0"
                                                      title={`${pendingTasksCount} task(s) incomplete`}
                                                    >
                                                      <FaExclamationCircle className="w-2 h-2 text-amber-500" /> {pendingTasksCount} Pending
                                                    </span>
                                                  ) : (
                                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5 shrink-0">
                                                      <FaExclamationCircle className="w-2 h-2 text-amber-500" /> Pending
                                                    </span>
                                                  )}
                                                </div>
                                                <div className="text-[10px] truncate max-w-[130px] text-slate-400 mt-0.5">
                                                  {wObj?.work_name || `${workTasksCount} Tasks`}
                                                </div>
                                              </div>
                                            </button>

                                            {/* Thick connecting arrow between Works */}
                                            {wIdx < activeStageWorks.length - 1 && (
                                              <div className="flex items-center px-2 shrink-0 select-none">
                                                <div
                                                  className={`w-3.5 h-[3px] rounded-l-full transition-colors ${
                                                    isWrkDone ? "bg-emerald-400" : "bg-slate-300"
                                                  }`}
                                                />
                                                <div
                                                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shadow-2xs shrink-0 ${
                                                    isWrkDone
                                                      ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                                                      : "bg-white border-slate-300 text-slate-400"
                                                  }`}
                                                  title={
                                                    isWrkDone
                                                      ? "Work & all its tasks completed - Ready for next work"
                                                      : "Work or tasks pending"
                                                  }
                                                >
                                                  <FaArrowRight className="w-2.5 h-2.5" />
                                                </div>
                                                <div
                                                  className={`w-3.5 h-[3px] rounded-r-full transition-colors ${
                                                    isWrkDone ? "bg-emerald-400" : "bg-slate-300"
                                                  }`}
                                                />
                                              </div>
                                            )}
                                          </React.Fragment>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* ACTIVE WORK DETAILS */}
                                {activeWork && (
                                  <div className="p-4 sm:p-5 rounded-2xl border-[3px] border-blue-500 bg-blue-50/25 space-y-4">
                                    {/* WORK LEVEL EXECUTION & RESOURCE FIELD DATA */}
                                    <ExecutionResourceFieldData
                                      title={`WORK ${activeWork.workId} — EXECUTION & RESOURCE DETAILS`}
                                      subtitle={`Configure execution team, materials & timeline for Work ${activeWork.workId}`}
                                      level="work"
                                      badge={`WORK ${activeWork.workId}`}
                                      data={activeWork}
                                      onChange={(field, val) =>
                                        updateWorkField(
                                          activeStage.stageId,
                                          activeWork.workId,
                                          field,
                                          val
                                        )
                                      }
                                      onCopyFromParent={() =>
                                        copyStageToWork(activeStage.stageId, activeWork.workId)
                                      }
                                      copyLabel={`Copy from Stage ${activeStage.stageId}`}
                                      onApplyToAllChildren={() =>
                                        applyWorkToAllTasks(
                                          activeStage.stageId,
                                          activeWork.workId
                                        )
                                      }
                                      applyToAllLabel={`Apply to All ${activeWorkTasks.length} Tasks`}
                                      contractorList={contractorList}
                                      materialList={materialList}
                                      supplierList={supplierList}
                                      toolsOptions={TOOLS_VEHICLES_MASTER}
                                    />

                                    {/* 3. TASKS UNDER ACTIVE WORK */}
                                    <div className="pt-4 border-t-2 border-blue-200 space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5 bg-emerald-100 border-2 border-emerald-300 px-3.5 py-1.5 rounded-xl shadow-2xs">
                                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                                          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                                            Tasks for Work {activeWork.workId}
                                          </h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {activeWorkTasks.length > 0 && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                handleTasksChange(
                                                  activeStage.stageId,
                                                  activeWork.workId,
                                                  []
                                                )
                                              }
                                              className="text-[10px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                              title={`Clear all tasks for Work ${activeWork.workId}`}
                                            >
                                              Clear All
                                            </button>
                                          )}
                                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                                            {activeWorkTasks.length} Selected
                                          </span>
                                        </div>
                                      </div>
                                      <ReactSelectMulti
                                        options={getTasksForWork(activeWork.workId)}
                                        value={activeWorkTasks.map((t) =>
                                          typeof t === "object" ? t.taskId : t
                                        )}
                                        onChange={(newTaskIds) =>
                                          handleTasksChange(
                                            activeStage.stageId,
                                            activeWork.workId,
                                            newTaskIds
                                          )
                                        }
                                        placeholder={`Search & select tasks for Work ${activeWork.workId}...`}
                                        themeColor="emerald"
                                        allowSelectAll={true}
                                      />

                                      {/* IF ACTIVE WORK HAS TASKS */}
                                      {activeWorkTasks.length > 0 && (
                                        <div className="mt-3 space-y-4">
                                          {/* LEVEL 3: TASK STEPPER PIPELINE (T1 ──➔── T2 ──➔── T3) */}
                                          <div className="bg-slate-50/90 p-3.5 rounded-xl border-2 border-emerald-300 shadow-2xs">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                                Task Pipeline Stepper
                                              </span>
                                              <span className="text-[10px] text-slate-400">
                                                Click on any task to configure task-specific execution details
                                              </span>
                                            </div>
                                            <div className="overflow-x-auto pb-1">
                                              <div className="flex items-center min-w-max py-1 px-1">
                                                {activeWorkTasks.map((t, tIdx) => {
                                                  const tId = typeof t === "object" ? t.taskId : t;
                                                  const tObj = wbsTasks.find(
                                                    (item) => (item.task_code || item.id) === tId
                                                  );
                                                  const isTaskActive =
                                                    activeTaskIdEffective === tId;
                                                  const isTskDone = isTaskComplete(t);

                                                  return (
                                                    <React.Fragment key={tId}>
                                                      <button
                                                        type="button"
                                                        onClick={() => setActiveTaskId(tId)}
                                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer text-left ${
                                                          isTaskActive
                                                            ? "bg-white text-slate-900 border-2 border-emerald-600 shadow-xs ring-3 ring-emerald-100/70"
                                                            : "bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/70"
                                                        }`}
                                                      >
                                                        <span
                                                          className={`w-4 h-4 rounded text-[10px] font-black flex items-center justify-center transition-colors ${
                                                            isTaskActive
                                                              ? "bg-emerald-600 text-white shadow-2xs"
                                                              : isTskDone
                                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold"
                                                              : "bg-slate-100 text-slate-600"
                                                          }`}
                                                        >
                                                          T
                                                        </span>
                                                        <span className="font-bold text-xs text-slate-900">
                                                          {tId}
                                                        </span>
                                                        {tObj?.task_name && (
                                                          <span className="font-normal text-slate-500 text-[11px] truncate max-w-[110px]">
                                                            - {tObj.task_name}
                                                          </span>
                                                        )}
                                                        {isTskDone ? (
                                                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5 shrink-0">
                                                            <FaCheckCircle className="w-2 h-2 text-emerald-600" /> Filled
                                                          </span>
                                                        ) : (
                                                          <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5 shrink-0">
                                                            <FaExclamationCircle className="w-2 h-2 text-amber-500" /> Pending
                                                          </span>
                                                        )}
                                                      </button>

                                                      {/* Thick connecting arrow between Tasks */}
                                                      {tIdx < activeWorkTasks.length - 1 && (
                                                        <div className="flex items-center px-1.5 shrink-0 select-none">
                                                          <div
                                                            className={`w-3 h-[3px] rounded-l-full transition-colors ${
                                                              isTskDone
                                                                ? "bg-emerald-400"
                                                                : "bg-slate-300"
                                                            }`}
                                                          />
                                                          <div
                                                            className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all shadow-2xs shrink-0 ${
                                                              isTskDone
                                                                ? "bg-emerald-50 border-emerald-500 text-emerald-600"
                                                                : "bg-white border-slate-300 text-slate-400"
                                                            }`}
                                                            title={
                                                              isTskDone
                                                                ? "Task filled - Ready for next task"
                                                                : "Task details pending"
                                                            }
                                                          >
                                                            <FaArrowRight className="w-2 h-2" />
                                                          </div>
                                                          <div
                                                            className={`w-3 h-[3px] rounded-r-full transition-colors ${
                                                              isTskDone
                                                                ? "bg-emerald-400"
                                                                : "bg-slate-300"
                                                            }`}
                                                          />
                                                        </div>
                                                      )}
                                                    </React.Fragment>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>

                                          {/* ACTIVE TASK DETAILS */}
                                          {activeTaskObj && (
                                            <div className="p-4 rounded-xl border-[3px] border-emerald-500 bg-emerald-50/25">
                                              <ExecutionResourceFieldData
                                                title={`TASK ${activeTaskIdEffective} — EXECUTION & RESOURCE DETAILS`}
                                                subtitle={`Configure execution team, materials & timeline for Task ${activeTaskIdEffective}`}
                                                level="task"
                                                badge={`TASK ${activeTaskIdEffective}`}
                                                data={activeTaskObj}
                                                onChange={(field, val) =>
                                                  updateTaskField(
                                                    activeStage.stageId,
                                                    activeWork.workId,
                                                    activeTaskIdEffective,
                                                    field,
                                                    val
                                                  )
                                                }
                                                onCopyFromParent={() =>
                                                  copyWorkToTask(
                                                    activeStage.stageId,
                                                    activeWork.workId,
                                                    activeTaskIdEffective
                                                  )
                                                }
                                                copyLabel={`Copy from Work ${activeWork.workId}`}
                                                contractorList={contractorList}
                                                materialList={materialList}
                                                supplierList={supplierList}
                                                toolsOptions={TOOLS_VEHICLES_MASTER}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>
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
                clientName: "",
                projectDetails: "",
                projectStatus: ["On Track"],
                stage: "S1",
                work: "S1-W1",
                task: "S1-W1-T1",
                status: "Active"
              });
              setWbsStructure({
                stages: [
                  {
                    stageId: "S1",
                    works: [{ workId: "S1-W1", tasks: ["S1-W1-T1", "S1-W1-T2"] }],
                    ...DEFAULT_STAGE_DETAILS
                  },
                  {
                    stageId: "S2",
                    works: [{ workId: "S2-W1", tasks: ["S2-W1-T1"] }],
                    ...DEFAULT_STAGE_DETAILS
                  }
                ]
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
