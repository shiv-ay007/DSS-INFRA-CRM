import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaEdit,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaUser,
  FaTasks,
  FaLayerGroup,
  FaTools,
  FaBoxes,
  FaTruck,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaInfoCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaFolderOpen,
  FaHammer,
  FaHardHat,
  FaAngleRight
} from "react-icons/fa";
import pmsTemplateService from "../../../services/pmsTemplateService";
import { pmsWbsService } from "../../../services/pmsWbsService";
import { getAllLeadProjectsApi } from "../../../services/leadProject.api";
import { materialService } from "../../../services/materialService";
import { supplierService } from "../../../services/supplierService";
import { PMS_TASKS_STORAGE_KEY } from "./CreatePmsTemplateComponent";

/**
 * Reusable execution resource field data display component
 * Used for Stage level, Work level, and Task level
 */
const ExecutionFieldDataView = ({
  fieldData,
  level = "stage",
  label = "Execution Details",
  materialMap = new Map(),
  supplierMap = new Map()
}) => {
  if (!fieldData) return null;

  const contrName =
    (typeof fieldData.contractorId === "object" ? fieldData.contractorId?.name : null) ||
    fieldData.workWillDoneBy ||
    "—";

  const contrType =
    (typeof fieldData.contractorId === "object" ? fieldData.contractorId?.contractorType : null) ||
    fieldData.contractorType ||
    "";

  const tools = Array.isArray(fieldData.toolsVehicles) ? fieldData.toolsVehicles : [];

  const rawMaterials =
    Array.isArray(fieldData.materialSupplier) && fieldData.materialSupplier.length > 0
      ? fieldData.materialSupplier
      : Array.isArray(fieldData.materials) && fieldData.materials.length > 0
      ? fieldData.materials
      : fieldData.materialRequired
      ? [
          {
            materialRequired: fieldData.materialRequired,
            supplierName: fieldData.supplierName,
            supplierType: fieldData.supplierType
          }
        ]
      : [];

  const durationStr =
    fieldData.durationFormatted ||
    (fieldData.durationDays !== undefined
      ? `${fieldData.durationDays} D ; ${fieldData.durationHours || 0} H`
      : null);

  // Resolve materials with names and suppliers
  const resolvedMaterials = rawMaterials
    .map((m) => {
      if (!m) return null;
      const mIdStr = typeof m.materialId === "string" ? m.materialId : m.materialId?._id;
      const sIdStr = typeof m.supplierId === "string" ? m.supplierId : m.supplierId?._id;

      const matchedMat = mIdStr ? materialMap.get(String(mIdStr)) : null;
      const matchedSupp = sIdStr ? supplierMap.get(String(sIdStr)) : null;

      const matName =
        m.materialName ||
        m.materialRequired ||
        (typeof m.materialId === "object" ? m.materialId?.name || m.materialId?.materialName : null) ||
        matchedMat?.name ||
        matchedMat?.materialName ||
        m.name ||
        (typeof m.materialId === "string" && m.materialId.length !== 24 ? m.materialId : "");

      const suppName =
        m.supplierName ||
        (typeof m.supplierId === "object" ? m.supplierId?.name : null) ||
        matchedSupp?.name ||
        matchedSupp?.supplierName ||
        (typeof m.supplierId === "string" && m.supplierId.length !== 24 ? m.supplierId : "");

      const suppType =
        m.supplierType ||
        (typeof m.supplierId === "object" ? m.supplierId?.supplierType : null) ||
        matchedSupp?.supplierType ||
        "";

      if (!matName && !suppName) return null;

      return {
        materialName: matName || "Standard Material",
        supplierName: suppName || "Standard Vendor",
        supplierType: suppType
      };
    })
    .filter(Boolean);

  const hasAnyCustomData =
    contrName !== "—" ||
    tools.length > 0 ||
    resolvedMaterials.length > 0 ||
    durationStr ||
    fieldData.deadlineDate ||
    fieldData.instruction ||
    fieldData.remark;

  if (!hasAnyCustomData) {
    return (
      <div className="text-xs text-slate-400 italic py-1.5 px-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        Inheriting execution resources and settings from parent level.
      </div>
    );
  }

  // Level specific themes
  const levelThemes = {
    stage: {
      wrapperBg: "bg-slate-50/80",
      wrapperBorder: "border-slate-200",
      accentText: "text-indigo-700",
      icon: <FaHardHat className="text-indigo-600 text-xs" />
    },
    work: {
      wrapperBg: "bg-purple-50/30",
      wrapperBorder: "border-purple-200",
      accentText: "text-purple-800",
      icon: <FaHammer className="text-purple-600 text-xs" />
    },
    task: {
      wrapperBg: "bg-teal-50/30",
      wrapperBorder: "border-teal-200",
      accentText: "text-teal-800",
      icon: <FaTasks className="text-teal-600 text-xs" />
    }
  };

  const theme = levelThemes[level] || levelThemes.stage;

  return (
    <div className={`p-3 rounded-lg border ${theme.wrapperBg} ${theme.wrapperBorder} space-y-2.5 text-xs transition-all`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-xs text-slate-700">
          {theme.icon}
          <span>{label}</span>
        </div>
        {durationStr && (
          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-800 shadow-2xs flex items-center gap-1.5">
            <FaClock className="text-amber-500 text-xs" />
            {durationStr}
          </span>
        )}
      </div>

      {/* Grid: Done By, Tools, Deadline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Done By / Contractor */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase text-[11px] tracking-wider block">
            Work Done By / Contractor
          </span>
          <p className="font-black text-slate-900 mt-1 text-sm">
            {contrName}
          </p>
          {contrType && (
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              Type: {contrType}
            </span>
          )}
        </div>

        {/* Tools & Vehicles */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase text-[11px] tracking-wider block">
            Tools & Vehicles
          </span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tools.length > 0 ? (
              tools.map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-slate-100 text-slate-800 text-xs font-semibold rounded border border-slate-200"
                >
                  {t}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">None specified</span>
            )}
          </div>
        </div>

        {/* Target Deadline */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-slate-500 font-bold uppercase text-[11px] tracking-wider block">
            Target Deadline
          </span>
          <p className="font-bold text-slate-900 mt-1 text-xs flex items-center gap-1.5">
            <FaCalendarAlt className="text-indigo-500 text-xs" />
            {fieldData.deadlineDate
              ? new Date(fieldData.deadlineDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })
              : "As scheduled"}
          </p>
          {fieldData.maxTimeToComplete && (
            <span className="text-xs font-semibold text-slate-600 block mt-1">
              Window: <strong className="text-slate-800">{fieldData.maxTimeToComplete} {fieldData.timeUnit || "Days"}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Materials & Suppliers Details (Always Rendered matching Form Section) */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-500 font-bold uppercase text-[11px] tracking-wider flex items-center gap-1.5">
            <FaBoxes className="text-emerald-600 text-xs" />
            Materials Required & Suppliers ({resolvedMaterials.length})
          </span>
          {resolvedMaterials.length > 0 && (
            <span className="text-xs text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {resolvedMaterials.length} {resolvedMaterials.length === 1 ? "Item" : "Items"}
            </span>
          )}
        </div>

        {resolvedMaterials.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resolvedMaterials.map((m, mIdx) => (
              <div
                key={mIdx}
                className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-xs block leading-tight">
                    {m.materialName}
                  </span>
                  {m.supplierType && (
                    <span className="text-[11px] text-slate-600 font-medium">{m.supplierType}</span>
                  )}
                </div>
                <span className="font-mono text-xs font-bold text-emerald-900 bg-white px-2.5 py-1 rounded border border-emerald-200 shadow-2xs">
                  {m.supplierName}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-xs italic py-0.5">
            None specified (No materials assigned for this {level})
          </p>
        )}
      </div>

      {/* Instructions & Remarks */}
      {(fieldData.instruction || fieldData.remark) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-200 text-xs">
          {fieldData.instruction && (
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200">
              <span className="font-extrabold text-amber-900 block text-[11px] uppercase tracking-wider">
                Instructions:
              </span>
              <p className="text-slate-800 text-xs sm:text-sm font-medium mt-1 leading-relaxed">{fieldData.instruction}</p>
            </div>
          )}
          {fieldData.remark && (
            <div className="p-2.5 bg-slate-100 rounded-lg border border-slate-200">
              <span className="font-extrabold text-slate-800 block text-[11px] uppercase tracking-wider">
                Remarks:
              </span>
              <p className="text-slate-800 text-xs sm:text-sm font-medium mt-1 leading-relaxed">{fieldData.remark}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PmsTemplateDetailsComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [resolvedStages, setResolvedStages] = useState([]);
  const [projectInfo, setProjectInfo] = useState({});
  const [statusList, setStatusList] = useState([]);
  const [materialMap, setMaterialMap] = useState(new Map());
  const [supplierMap, setSupplierMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedStages, setExpandedStages] = useState({});
  const [expandedWorks, setExpandedWorks] = useState({});

  useEffect(() => {
    if (!id) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        let templateData = null;

        // 1. Fetch template from Backend API directly (Populated via Mongoose ObjectIds)
        if (id && id.length === 24) {
          try {
            const res = await pmsTemplateService.getTemplateById(id);
            if (res?.data) {
              templateData = res.data.data || res.data;
            }
          } catch (apiErr) {
            console.warn("Could not fetch template from API, checking local storage cache:", apiErr);
          }
        }

        // 2. Fallback to LocalStorage cache if not found in backend
        if (!templateData) {
          const stored = localStorage.getItem(PMS_TASKS_STORAGE_KEY);
          if (stored) {
            const list = JSON.parse(stored);
            if (Array.isArray(list)) {
              templateData = list.find((t) => String(t._id || t.id) === String(id));
            }
          }
        }

        // If template has unpopulated ObjectIds or came from local storage, fetch fallback master maps
        let stageMap = new Map();
        let workMap = new Map();
        let taskMap = new Map();
        let projectMap = new Map();
        let statusMap = new Map();
        let matMap = new Map();
        let suppMap = new Map();

        const needsMasters =
          !templateData ||
          typeof templateData.projectId !== "object" ||
          !templateData.projectId?.projectName ||
          (Array.isArray(templateData.stages) &&
            templateData.stages.some(
              (s) => typeof s.stageId !== "object" || !s.stageId?.stage_name
            ));

        if (needsMasters) {
          const [
            wbsStagesRes,
            wbsWorksRes,
            wbsTasksRes,
            projectsRes,
            statusesRes,
            materialsRes,
            suppliersRes
          ] = await Promise.allSettled([
            pmsWbsService.getStagesPaginated({ limit: 500 }),
            pmsWbsService.getWorksPaginated({ limit: 500 }),
            pmsWbsService.getTasksPaginated({ limit: 500 }),
            getAllLeadProjectsApi(),
            pmsWbsService.getAllProjectStatuses(),
            materialService.getAllMaterials({ limit: 500 }),
            supplierService.getAllSuppliers({ limit: 500 })
          ]);

          const allStages =
            wbsStagesRes.status === "fulfilled" && wbsStagesRes.value?.data?.data
              ? wbsStagesRes.value.data.data
              : [];
          const allWorks =
            wbsWorksRes.status === "fulfilled" && wbsWorksRes.value?.data?.data
              ? wbsWorksRes.value.data.data
              : [];
          const allTasks =
            wbsTasksRes.status === "fulfilled" && wbsTasksRes.value?.data?.data
              ? wbsTasksRes.value.data.data
              : [];
          const allProjects =
            projectsRes.status === "fulfilled" && projectsRes.value?.data
              ? Array.isArray(projectsRes.value.data)
                ? projectsRes.value.data
                : projectsRes.value.data.data || []
              : [];
          const allStatuses =
            statusesRes.status === "fulfilled" && statusesRes.value?.data
              ? Array.isArray(statusesRes.value.data)
                ? statusesRes.value.data
                : statusesRes.value.data.data || []
              : [];
          const allMaterials =
            materialsRes.status === "fulfilled" && materialsRes.value?.data
              ? Array.isArray(materialsRes.value.data)
                ? materialsRes.value.data
                : materialsRes.value.data.data || []
              : [];
          const allSuppliers =
            suppliersRes.status === "fulfilled" && suppliersRes.value?.data
              ? Array.isArray(suppliersRes.value.data)
                ? suppliersRes.value.data
                : suppliersRes.value.data.data || []
              : [];

          allStages.forEach((s) => {
            if (s._id) stageMap.set(String(s._id), s);
            if (s.id) stageMap.set(String(s.id), s);
            if (s.stage_code) stageMap.set(String(s.stage_code), s);
          });

          allWorks.forEach((w) => {
            if (w._id) workMap.set(String(w._id), w);
            if (w.id) workMap.set(String(w.id), w);
            if (w.work_code) workMap.set(String(w.work_code), w);
          });

          allTasks.forEach((t) => {
            if (t._id) taskMap.set(String(t._id), t);
            if (t.id) taskMap.set(String(t.id), t);
            if (t.task_code) taskMap.set(String(t.task_code), t);
          });

          allProjects.forEach((p) => {
            if (p._id) projectMap.set(String(p._id), p);
            if (p.id) projectMap.set(String(p.id), p);
          });

          allStatuses.forEach((st) => {
            if (st._id) statusMap.set(String(st._id), st);
            if (st.id) statusMap.set(String(st.id), st);
            if (st.status_code) statusMap.set(String(st.status_code), st);
            if (st.status_name) statusMap.set(String(st.status_name).toLowerCase().trim(), st);
          });

          allMaterials.forEach((m) => {
            if (m._id) matMap.set(String(m._id), m);
            if (m.id) matMap.set(String(m.id), m);
            if (m.name) matMap.set(String(m.name).toLowerCase().trim(), m);
            if (m.materialName) matMap.set(String(m.materialName).toLowerCase().trim(), m);
          });
          setMaterialMap(matMap);

          allSuppliers.forEach((s) => {
            if (s._id) suppMap.set(String(s._id), s);
            if (s.id) suppMap.set(String(s.id), s);
            if (s.name) suppMap.set(String(s.name).toLowerCase().trim(), s);
          });
          setSupplierMap(suppMap);
        }

        if (templateData) {
          setData(templateData);

          // Resolve Project Details
          const pRaw = templateData.projectId;
          const pIdStr = typeof pRaw === "string" ? pRaw : pRaw?._id || pRaw?.id;
          const matchedProj = pIdStr ? projectMap.get(String(pIdStr)) : null;
          const pObj = typeof pRaw === "object" && pRaw !== null ? pRaw : matchedProj || {};
          const lObj = typeof templateData.leadId === "object" && templateData.leadId !== null ? templateData.leadId : {};

          const resolvedProject = {
            projectName: pObj.projectName || templateData.projectDetails || templateData.name || "Project Workflow",
            clientName: pObj.clientName || lObj.clientName || templateData.clientName || "Direct Client",
            companyName: pObj.companyName || lObj.companyName || templateData.companyName || "",
            phoneNumber: pObj.phoneNumber || lObj.phoneNumber || "",
            emailAddress: pObj.emailAddress || lObj.emailAddress || "",
            businessType: pObj.businessType || "Construction",
            workCategory: pObj.workCategory || templateData.category || "Construction",
            workType: Array.isArray(pObj.workType)
              ? pObj.workType.join(", ")
              : pObj.workType || templateData.projectType || "Full Turnkey",
            expectedBusiness: pObj.expectedBusiness
              ? `₹${Number(pObj.expectedBusiness).toLocaleString("en-IN")}`
              : null,
            priority: pObj.priority || "Normal",
            jobType: pObj.jobType || "NEW",
            city: pObj.city || lObj.city || "",
            state: pObj.state || lObj.state || "",
            address: pObj.address || lObj.address || "",
            fullAddress: [pObj.address, pObj.city, pObj.state, pObj.pincode].filter(Boolean).join(", "),
            requirement: pObj.requirement || templateData.projectDetails || templateData.description || "",
            transferRemark: pObj.transferRemark || templateData.remarks || ""
          };
          setProjectInfo(resolvedProject);

          // Resolve Project Statuses List (with real names and vibrant colors)
          const rawProjectStatuses = Array.isArray(templateData.projectStatus)
            ? templateData.projectStatus
            : typeof templateData.projectStatus === "string" && templateData.projectStatus.trim()
            ? templateData.projectStatus.split(",").map((s) => s.trim())
            : ["On Track"];

          const resolvedStatuses = rawProjectStatuses
            .map((st) => {
              if (!st) return null;
              let name = "";
              let color = "#10B981";

              if (typeof st === "string") {
                const match = statusMap.get(st) || statusMap.get(st.toLowerCase().trim());
                name = match?.status_name || st;
                color = match?.color || color;
              } else if (typeof st === "object") {
                if (st.statusId && typeof st.statusId === "object") {
                  name = st.statusId.status_name || st.statusId.name || st.statusId.status_code || "";
                  color = st.statusId.color || color;
                } else if (st.statusId && typeof st.statusId === "string") {
                  const match = statusMap.get(String(st.statusId));
                  name = match?.status_name || match?.name || "";
                  color = match?.color || color;
                } else {
                  name = st.status_name || st.name || st.value || "";
                  color = st.color || color;
                }
              }

              if (!name || name.length === 24) return null;
              return { name, color };
            })
            .filter(Boolean);

          if (resolvedStatuses.length === 0) {
            resolvedStatuses.push({ name: templateData.status || "On Track", color: "#10B981" });
          }
          setStatusList(resolvedStatuses);

          // Deep resolve Stages -> Works -> Tasks with full names and fieldData
          const rawStages = templateData.stages || templateData.wbsStructure?.stages || [];
          const initialExpandedStages = {};
          const initialExpandedWorks = {};

          const formattedStages = rawStages.map((stg, sIdx) => {
            const sId = stg.stageId?._id || stg.stageId;
            const sRef =
              typeof stg.stageId === "object" && stg.stageId?.stage_name
                ? stg.stageId
                : stageMap.get(String(sId)) || {};

            const sCode =
              sRef.stage_code ||
              stg.stageId?.stage_code ||
              stg.stage_code ||
              (typeof stg.stageId === "string" ? stg.stageId : `Stage ${sIdx + 1}`);
            const sName = sRef.stage_name || stg.stageId?.stage_name || stg.stage_name || sCode;
            const stageFieldData = stg.fieldData || stg || {};

            initialExpandedStages[sCode] = true;

            const resolvedWorks = (stg.works || []).map((wrk, wIdx) => {
              const wId = wrk.workId?._id || wrk.workId;
              const wRef =
                typeof wrk.workId === "object" && wrk.workId?.work_name
                  ? wrk.workId
                  : workMap.get(String(wId)) || {};

              const wCode =
                wRef.work_code ||
                wrk.workId?.work_code ||
                wrk.work_code ||
                (typeof wrk.workId === "string" ? wrk.workId : `Work ${wIdx + 1}`);
              const wName = wRef.work_name || wrk.workId?.work_name || wrk.work_name || wCode;
              const workFieldData = wrk.fieldData || {};

              initialExpandedWorks[wCode] = true;

              const resolvedTasks = (wrk.tasks || []).map((tsk, tIdx) => {
                const tRawId = typeof tsk === "object" ? tsk.taskId?._id || tsk.taskId : tsk;
                const tRef =
                  typeof tsk === "object" && tsk.taskId?.task_name
                    ? tsk.taskId
                    : taskMap.get(String(tRawId)) || {};

                const tCode =
                  tRef.task_code ||
                  (typeof tsk === "object" ? tsk.taskId?.task_code || tsk.task_code : null) ||
                  (typeof tRawId === "string" ? tRawId : `Task ${tIdx + 1}`);
                const tName =
                  tRef.task_name ||
                  (typeof tsk === "object" ? tsk.taskId?.task_name || tsk.task_name : null) ||
                  tCode;

                const taskFieldData = typeof tsk === "object" ? tsk.fieldData || {} : {};

                return {
                  taskId: tCode,
                  task_code: tCode,
                  task_name: tName,
                  fieldData: taskFieldData
                };
              });

              return {
                workId: wCode,
                work_code: wCode,
                work_name: wName,
                fieldData: workFieldData,
                tasks: resolvedTasks
              };
            });

            return {
              stageId: sCode,
              stage_code: sCode,
              stage_name: sName,
              fieldData: stageFieldData,
              works: resolvedWorks
            };
          });

          setResolvedStages(formattedStages);
          setExpandedStages(initialExpandedStages);
          setExpandedWorks(initialExpandedWorks);
        } else {
          toast.error("Template details not found");
        }
      } catch (err) {
        console.error("Error loading PMS template details:", err);
        toast.error("Failed to load template details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const toggleStage = (key) => {
    setExpandedStages((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleWork = (key) => {
    setExpandedWorks((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const sExpanded = {};
    const wExpanded = {};
    resolvedStages.forEach((s) => {
      sExpanded[s.stage_code] = true;
      (s.works || []).forEach((w) => {
        wExpanded[w.work_code] = true;
      });
    });
    setExpandedStages(sExpanded);
    setExpandedWorks(wExpanded);
  };

  const collapseAll = () => {
    setExpandedStages({});
    setExpandedWorks({});
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 bg-white rounded-xl border border-slate-200 p-8 shadow-xs font-sans">
        <FaSpinner className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-slate-600 text-sm font-medium">Loading PMS Template Details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-xs font-sans">
        <FaTimesCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">PMS Template Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          The requested PMS template could not be found or may have been deleted.
        </p>
        <button
          onClick={() => navigate("/sales/master/pms-template")}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
        >
          Return to PMS Templates
        </button>
      </div>
    );
  }

  const rawStatus = data.status || "Active";
  const totalWorks = resolvedStages.reduce((acc, s) => acc + (s.works?.length || 0), 0);
  const totalTasks = resolvedStages.reduce(
    (acc, s) => acc + (s.works?.reduce((wAcc, w) => wAcc + (w.tasks?.length || 0), 0) || 0),
    0
  );

  const editRoute = `/sales/master/pms-template/edit/${id}`;

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-16 px-1 sm:px-0 font-sans">
      {/* ================= 1. CLEAN CRISP PAGE HEADER (MATCHING DSS CRM) ================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Area: Back Button + Title + Subtitle */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/sales/master/pms-template")}
              className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center shrink-0 mt-0.5"
              title="Back to PMS Templates"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {data.code || data.task || "PMS-TEMPLATE"}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  {projectInfo.workCategory}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {rawStatus}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                {projectInfo.projectName}
              </h1>

              <div className="text-xs sm:text-sm text-slate-600 mt-2 flex items-center gap-3 flex-wrap font-medium">
                <span className="flex items-center gap-1.5">
                  <FaUser className="text-slate-400 text-xs" />
                  Client: <strong className="text-slate-900 font-black text-sm">{projectInfo.clientName}</strong>
                  {projectInfo.companyName && <span className="text-slate-500 font-semibold">({projectInfo.companyName})</span>}
                </span>
                {projectInfo.phoneNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      <FaPhoneAlt className="text-emerald-600 text-xs" />
                      {projectInfo.phoneNumber}
                    </span>
                  </>
                )}
                {projectInfo.workType && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 font-bold text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                      {projectInfo.workType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Action: Edit Template */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <button
              onClick={() => navigate(editRoute)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <FaEdit className="w-3.5 h-3.5" />
              <span>Edit Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. PROJECT NAME & SCOPE DETAILS CARD ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaFolderOpen className="text-indigo-600 text-sm" />
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
              Project Information & Scope Details
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200">
              Job: {projectInfo.jobType || "NEW"}
            </span>
            <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 uppercase">
              {projectInfo.priority || "Normal"} Priority
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Main Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Card 1: Project Name */}
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-all">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider block">
                Project Name
              </span>
              <p className="font-black text-slate-900 text-base sm:text-lg mt-1.5 leading-snug">
                {projectInfo.projectName}
              </p>
            </div>

            {/* Card 2: Client & Contact Details */}
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-all">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider block">
                Client & Contact Details
              </span>
              <div className="mt-1">
                <p className="font-black text-slate-900 text-base">
                  {projectInfo.clientName}
                </p>
                {projectInfo.companyName && (
                  <span className="text-slate-600 font-semibold text-xs bg-slate-200/60 px-2 py-0.5 rounded inline-block mt-0.5">
                    {projectInfo.companyName}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-700 mt-2 space-y-1 font-medium">
                {projectInfo.phoneNumber && (
                  <p className="flex items-center gap-1.5">
                    <FaPhoneAlt className="text-emerald-600 w-3 h-3 shrink-0" />
                    <strong className="font-mono text-slate-900 text-xs">{projectInfo.phoneNumber}</strong>
                  </p>
                )}
                {projectInfo.emailAddress && (
                  <p className="flex items-center gap-1.5 truncate" title={projectInfo.emailAddress}>
                    <FaEnvelope className="text-indigo-600 w-3 h-3 shrink-0" />
                    <span className="text-slate-700 text-xs truncate">{projectInfo.emailAddress}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Card 3: Category & Work Type */}
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-all">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider block">
                Category & Work Type
              </span>
              <p className="font-black text-indigo-700 text-base mt-1">
                {projectInfo.workCategory}
              </p>
              <div className="mt-1.5">
                <span className="inline-block font-bold text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md">
                  {projectInfo.workType}
                </span>
              </div>
              <span className="text-slate-500 text-xs block mt-1.5 font-medium">
                Business: <strong className="text-slate-700 font-bold">{projectInfo.businessType}</strong>
              </span>
            </div>

            {/* Card 4: Commercials & Location */}
            <div className="p-3.5 bg-slate-50 hover:bg-slate-100/60 rounded-xl border border-slate-200 transition-all">
              <span className="text-slate-500 font-bold uppercase text-xs tracking-wider block">
                Commercials & Location
              </span>
              <div className="mt-1">
                <span className="font-black text-emerald-700 text-lg sm:text-xl bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 inline-block shadow-2xs">
                  {projectInfo.expectedBusiness || "Negotiable"}
                </span>
              </div>
              {projectInfo.fullAddress ? (
                <p className="text-slate-700 text-xs mt-2 flex items-start gap-1.5 font-medium leading-snug">
                  <FaMapMarkerAlt className="text-rose-500 shrink-0 mt-0.5 w-3.5 h-3.5" />
                  <span>{projectInfo.fullAddress}</span>
                </p>
              ) : (
                <span className="text-slate-400 text-xs block mt-2">Location not specified</span>
              )}
            </div>
          </div>

          {/* Detailed Project Requirement / Scope Box */}
          {projectInfo.requirement && projectInfo.requirement !== "—" && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 border-l-4 border-l-blue-600 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-950 font-black text-xs uppercase tracking-wider mb-1.5">
                <FaClipboardList className="text-blue-600 w-4 h-4" />
                <span>Project Execution Requirement / Scope</span>
              </div>
              <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-line pl-6">
                {projectInfo.requirement}
              </p>
            </div>
          )}

          {/* Handover / Transfer Remarks */}
          {projectInfo.transferRemark && (
            <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 shadow-2xs">
              <div className="flex items-center gap-2 text-amber-950 font-black text-xs uppercase tracking-wider mb-1">
                <span>Project Handover & Transfer Remarks</span>
              </div>
              <p className="text-slate-800 text-sm font-semibold leading-relaxed pl-6">{projectInfo.transferRemark}</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= 3. KPI METRIC CARDS (FIXED PROJECT STATUS & UNIFORM FONTS) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stages</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FaLayerGroup className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{resolvedStages.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">WBS Milestones</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Works</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaHammer className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalWorks}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Across {resolvedStages.length} Stages</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tasks</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaTasks className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalTasks}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Detailed Deliverables</p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Project Status</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FaCheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {statusList.map((stObj, i) => (
              <span
                key={i}
                style={{
                  backgroundColor: `${stObj.color}15`,
                  color: stObj.color,
                  borderColor: `${stObj.color}40`
                }}
                className="px-2 py-0.5 text-xs font-bold rounded-md border inline-flex items-center gap-1 shadow-2xs"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: stObj.color }}
                />
                {stObj.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 4. WBS EXECUTION BREAKDOWN (STAGE -> WORK -> TASK) ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FaLayerGroup className="text-indigo-600" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">
              WBS Execution Breakdown
            </h2>
            <span className="text-xs text-slate-500 hidden sm:inline font-medium">
              ({resolvedStages.length} Stages • {totalWorks} Works • {totalTasks} Tasks)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200 shadow-2xs cursor-pointer transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {resolvedStages.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No WBS Stages configured in this template.
            </div>
          ) : (
            resolvedStages.map((stg, stgIdx) => {
              const sKey = stg.stage_code || `stage_${stgIdx}`;
              const isStageOpen = expandedStages[sKey];
              const sFieldData = stg.fieldData || {};
              const works = stg.works || [];

              return (
                <div
                  key={sKey}
                  className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white"
                >
                  {/* ================= LEVEL 1: STAGE HEADER ================= */}
                  <div
                    onClick={() => toggleStage(sKey)}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200"
                  >
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded border border-indigo-200">
                        {stg.stage_code}
                      </span>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                        {stg.stage_name}
                      </h3>
                      <span className="text-xs text-slate-700 font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                        {works.length} Works
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-800 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs flex items-center gap-1.5">
                        <FaClock className="text-amber-500 text-xs" />
                        {sFieldData.durationFormatted || `${sFieldData.durationDays || 3} Days`}
                      </span>
                      <span className="p-1 text-slate-500 hover:text-slate-800">
                        {isStageOpen ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* ================= LEVEL 1: STAGE BODY ================= */}
                  {isStageOpen && (
                    <div className="p-4 space-y-4 bg-white">
                      {/* 1. STAGE FIELD DATA */}
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <FaHardHat className="text-indigo-600" />
                          Stage Execution Details ({stg.stage_name})
                        </h4>
                        <ExecutionFieldDataView
                          fieldData={sFieldData}
                          level="stage"
                          label={`Stage ${stg.stage_code} Resources & Schedule`}
                          materialMap={materialMap}
                          supplierMap={supplierMap}
                        />
                      </div>

                      {/* 2. WORKS UNDER THIS STAGE */}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FaHammer className="text-purple-600" />
                            Works under {stg.stage_name} ({works.length})
                          </h4>
                        </div>

                        {works.length === 0 ? (
                          <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No works configured under this stage.
                          </div>
                        ) : (
                          works.map((wrk, wIdx) => {
                            const wKey = wrk.work_code || `work_${wIdx}`;
                            const isWorkOpen = expandedWorks[wKey];
                            const wFieldData = wrk.fieldData || {};
                            const tasks = wrk.tasks || [];

                            return (
                              <div
                                key={wKey}
                                className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40 shadow-2xs ml-0 sm:ml-3"
                              >
                                {/* ================= LEVEL 2: WORK HEADER ================= */}
                                <div
                                  onClick={() => toggleWork(wKey)}
                                  className="p-3 bg-slate-100/80 hover:bg-slate-200/60 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200"
                                >
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                                      {wrk.work_code}
                                    </span>
                                    <strong className="text-xs sm:text-sm font-black text-slate-900">
                                      {wrk.work_name}
                                    </strong>
                                    <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                                      {tasks.length} Tasks
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                      {wFieldData.durationFormatted || `${wFieldData.durationDays || 3} D`}
                                    </span>
                                    <span className="text-slate-500">
                                      {isWorkOpen ? <FaChevronUp className="w-3.5 h-3.5" /> : <FaChevronDown className="w-3.5 h-3.5" />}
                                    </span>
                                  </div>
                                </div>

                                {/* ================= LEVEL 2: WORK BODY ================= */}
                                {isWorkOpen && (
                                  <div className="p-3.5 space-y-3.5 bg-white">
                                    {/* WORK FIELD DATA */}
                                    <div>
                                      <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                                        <FaTools className="text-purple-600 text-xs" />
                                        Work Execution Details ({wrk.work_name})
                                      </h5>
                                      <ExecutionFieldDataView
                                        fieldData={wFieldData}
                                        level="work"
                                        label={`Work ${wrk.work_code} Resources & Schedule`}
                                        materialMap={materialMap}
                                        supplierMap={supplierMap}
                                      />
                                    </div>

                                    {/* ================= LEVEL 3: TASKS UNDER THIS WORK ================= */}
                                    <div className="pt-2">
                                      <h5 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <FaTasks className="text-teal-600 text-xs" />
                                        Tasks under {wrk.work_name} ({tasks.length})
                                      </h5>

                                      {tasks.length === 0 ? (
                                        <div className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                          No tasks configured under this work.
                                        </div>
                                      ) : (
                                        <div className="space-y-3 ml-0 sm:ml-3">
                                          {tasks.map((tsk, tIdx) => {
                                            const tFieldData = tsk.fieldData || {};

                                            return (
                                              <div
                                                key={tIdx}
                                                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
                                              >
                                                {/* Task Header */}
                                                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
                                                  <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-200">
                                                      {tsk.task_code}
                                                    </span>
                                                    <strong className="text-xs sm:text-sm font-black text-slate-900">
                                                      {tsk.task_name}
                                                    </strong>
                                                  </div>
                                                  <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                                    {tFieldData.durationFormatted || `${tFieldData.durationDays || 1} D`}
                                                  </span>
                                                </div>

                                                {/* Task Field Data */}
                                                <ExecutionFieldDataView
                                                  fieldData={tFieldData}
                                                  level="task"
                                                  label={`Task ${tsk.task_code} Resources`}
                                                  materialMap={materialMap}
                                                  supplierMap={supplierMap}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PmsTemplateDetailsComponent;
