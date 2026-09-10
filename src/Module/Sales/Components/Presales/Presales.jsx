import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPlus,
  FaCheck,
  FaLock,
  FaUser,
  FaPhoneAlt,
  FaBriefcase,
  FaRupeeSign,
  FaUserTie,
  FaCity,
  FaLayerGroup,
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaCommentDots,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaInfoCircle,
  FaEdit,
  FaEye,
  FaSearch,
  FaFilter,
  FaTable,
  FaStream,
  FaSpinner
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
  getAllLeadProjectsApi,
  createLeadProjectApi,
  updateLeadProjectApi
} from "../../services/leadProject.api";

// 11 Pipeline Stages Definition (As per Functional Spec)
const PIPELINE_STAGES = [
  { id: 1, name: "Visit", fullName: "Site Visit" },
  { id: 2, name: "Brief", fullName: "Site Briefing" },
  { id: 3, name: "Tent.", fullName: "Tentative Quotation — Formation" },
  { id: 4, name: "Accept", fullName: "Tentative Quotation — Client Acceptance" },
  { id: 5, name: "Concept", fullName: "Concept Drawing — Formation & Finalisation" },
  { id: 6, name: "Bank", fullName: "Bank Quotation — Formation & Handover" },
  { id: 7, name: "Structure", fullName: "Structure Work — Formation" },
  { id: 8, name: "Elev.", fullName: "Front Elevation — Formation & Finalisation" },
  { id: 9, name: "Material", fullName: "Material Finalisation" },
  { id: 10, name: "Final Quotation", fullName: "Final Quotation — Formation & Client Acceptance" },
  { id: 11, name: "Contract", fullName: "Contract Formation & Acceptance" }
];

// Helper to determine if a stage is applicable based on Engagement Scope
const isStageApplicable = (stageId, scope) => {
  if (scope === "Consultancy Only") {
    return stageId <= 2;
  }
  if (scope === "Design Only") {
    return stageId <= 10;
  }
  return true;
};

const Presales = () => {
  const navigate = useNavigate();

  // Active View Mode: "table" (default Table form) vs "pipeline"
  const [viewMode, setViewMode] = useState("table");
  const [loading, setLoading] = useState(true);

  // Presales List state (directly from backend API)
  const [presalesList, setPresalesList] = useState([]);

  // Fetch all projects directly from backend lead-projects API
  const fetchBackendProjects = async () => {
    try {
      setLoading(true);
      const res = await getAllLeadProjectsApi();
      const backendProjects =
        res?.data?.projects || res?.projects || (Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []);

      const formatted = backendProjects.map((bp) => {
        const cleanId = bp._id || bp.leadId || bp.id;
        const leadObj = typeof bp.leadId === "object" && bp.leadId !== null ? bp.leadId : null;
        return {
          id: cleanId,
          _id: bp._id || cleanId,
          leadId: leadObj?._id || bp.leadId || cleanId,
          clientName: bp.clientName || bp.concernPersonName || leadObj?.clientName || leadObj?.concernPersonName || "Unnamed Client",
          contactNo: bp.phoneNumber || bp.contactNo || bp.whatsappNumber || leadObj?.phoneNumber || leadObj?.contactNo || "--",
          emailAddress: bp.emailAddress || bp.email || leadObj?.emailAddress || leadObj?.email || "",
          engagementScope: bp.businessType?.includes("Consultancy")
            ? "Consultancy Only"
            : bp.businessType?.includes("Design")
            ? "Design Only"
            : "Design + Construction",
          projectDetails: bp.requirement || bp.projectDetails || "Interior / Architectural Work",
          expectedRevenue: Number(bp.expectedBusiness || bp.expectedRevenue || 0),
          activePerson: bp.assignedTo || bp.activePerson || "Admin",
          workTypes:
            Array.isArray(bp.workTypes) && bp.workTypes.length > 0
              ? bp.workTypes
              : ["3D View", "Concept Drawing"],
          city: bp.city || leadObj?.city || "Lucknow",
          currentStageId: bp.currentStageId || 1,
          status: bp.status || "OPEN",
          closureStatus: bp.closureStatus || "Open",
          stagesData: bp.stagesData || {},
          remarks: Array.isArray(bp.remarks) ? bp.remarks : [],
          createdAt: bp.createdAt || bp.created_at || bp.date || leadObj?.createdAt || leadObj?.date || null
        };
      });

      setPresalesList(formatted);
      if (formatted.length > 0) {
        setSelectedPresaleId((prev) => (prev && formatted.some((p) => p.id === prev) ? prev : formatted[0].id));
        setActiveStageId((prev) => prev || formatted[0].currentStageId || 1);
      }
    } catch (err) {
      console.error("Error fetching backend projects for Presales:", err);
      toast.error("Failed to load presales data from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendProjects();
  }, []);

  // Selected Presale for Detail / Pipeline View
  const [selectedPresaleId, setSelectedPresaleId] = useState(null);
  const [activeStageId, setActiveStageId] = useState(1);
  const [newRemarkText, setNewRemarkText] = useState("");

  // Search and Filters for Table
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScope, setFilterScope] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPipelineModalOpen, setIsPipelineModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [closureOption, setClosureOption] = useState("Closed — Consultancy Only");

  // Current active presale item
  const currentPresale = useMemo(() => {
    return presalesList.find((p) => p.id === selectedPresaleId) || presalesList[0] || null;
  }, [presalesList, selectedPresaleId]);

  // Check if active stage is applicable
  const isCurrentStageApplicable = useMemo(() => {
    if (!currentPresale) return false;
    return isStageApplicable(activeStageId, currentPresale.engagementScope);
  }, [activeStageId, currentPresale]);

  // Active stage configuration
  const activeStageConfig = useMemo(() => {
    return PIPELINE_STAGES.find((s) => s.id === activeStageId) || PIPELINE_STAGES[0];
  }, [activeStageId]);

  // Form State for Active Stage
  const [stageFormData, setStageFormData] = useState({});

  useEffect(() => {
    const saved = currentPresale?.stagesData?.[activeStageId] || {};
    setStageFormData(saved);
  }, [activeStageId, currentPresale]);

  // Days in Modification calculation
  const calculateDaysInMod = (startDate, endDate) => {
    if (!startDate || !endDate) return "2 Days";
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e)) return "2 Days";
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return diff > 0 ? `${diff} Days` : diff === 0 ? "Same Day" : "0 Days";
  };

  const daysInModNegotiation = useMemo(() => {
    return calculateDaysInMod(stageFormData.modDate, stageFormData.finalDrawingDate);
  }, [stageFormData.modDate, stageFormData.finalDrawingDate]);

  const daysInModContract = useMemo(() => {
    return calculateDaysInMod(stageFormData.modDate, stageFormData.finalContractSignDate);
  }, [stageFormData.modDate, stageFormData.finalContractSignDate]);

  const [savingStage, setSavingStage] = useState(false);
  const [creatingPresale, setCreatingPresale] = useState(false);

  // Update Engagement Scope
  const handleScopeChange = async (newScope) => {
    if (!currentPresale) return;
    const targetId = currentPresale._id || currentPresale.id;
    setPresalesList((prev) =>
      prev.map((item) => (item.id === currentPresale.id ? { ...item, engagementScope: newScope } : item))
    );
    try {
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          businessType: newScope,
          engagementScope: newScope
        });
      }
      toast.info(`Engagement Scope updated to "${newScope}"!`);
    } catch (err) {
      console.error("Error updating scope:", err);
      toast.error("Failed to update engagement scope on server");
    }
  };

  // Save Stage Action
  const handleSaveStage = async () => {
    if (!currentPresale) return;
    const targetId = currentPresale._id || currentPresale.id;
    const updatedStages = {
      ...(currentPresale.stagesData || {}),
      [activeStageId]: { ...stageFormData }
    };
    const newStageId = Math.max(currentPresale.currentStageId || 1, activeStageId);

    setSavingStage(true);
    setPresalesList((prev) =>
      prev.map((item) => {
        if (item.id === currentPresale.id) {
          return { ...item, stagesData: updatedStages, currentStageId: newStageId };
        }
        return item;
      })
    );

    try {
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          stagesData: updatedStages,
          currentStageId: newStageId
        });
      }
      toast.success(`Stage ${activeStageId} (${activeStageConfig.name}) saved successfully! 🚀`);
    } catch (err) {
      console.error("Error saving stage:", err);
      toast.error("Failed to save stage details on server");
    } finally {
      setSavingStage(false);
    }
  };

  // Add Remark Action
  const handleAddRemark = async (e) => {
    e.preventDefault();
    if (!newRemarkText.trim()) {
      toast.error("Please enter a remark first!");
      return;
    }
    if (!currentPresale) return;

    const targetId = currentPresale._id || currentPresale.id;
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

    const newRemark = {
      id: `rem-${Date.now()}`,
      author: currentPresale.activePerson || "Admin",
      dateTime: `${formattedDate}, ${formattedTime}`,
      text: newRemarkText.trim()
    };

    const updatedRemarks = [newRemark, ...(currentPresale.remarks || [])];

    setPresalesList((prev) =>
      prev.map((item) => {
        if (item.id === currentPresale.id) {
          return { ...item, remarks: updatedRemarks };
        }
        return item;
      })
    );
    setNewRemarkText("");

    try {
      if (targetId) {
        await updateLeadProjectApi(targetId, { remarks: updatedRemarks });
      }
      toast.success("Remark added to discussion log!");
    } catch (err) {
      console.error("Error saving remark:", err);
      toast.error("Failed to save remark on server");
    }
  };

  // Move to Active Project Rule Check
  const isMoveToActiveEnabled = useMemo(() => {
    if (!currentPresale || currentPresale.engagementScope !== "Design + Construction") return false;
    const stage11 = currentPresale.stagesData?.[11];
    return Boolean(stage11 && stage11.finalContractSignDate);
  }, [currentPresale]);

  const handleMoveToActive = async () => {
    if (!isMoveToActiveEnabled || !currentPresale) {
      toast.warning("Move to Active Project requires Scope = 'Design + Construction' and Stage 11 Contract signed!");
      return;
    }
    if (window.confirm("Confirm: Move this client to Active Project (Construction Phase)?")) {
      const targetId = currentPresale._id || currentPresale.id;
      setPresalesList((prev) =>
        prev.map((item) =>
          item.id === currentPresale.id
            ? { ...item, status: "ACTIVE_PROJECT", closureStatus: "Converted to Construction" }
            : item
        )
      );
      try {
        if (targetId) {
          await updateLeadProjectApi(targetId, {
            status: "ACTIVE_PROJECT",
            closureStatus: "Converted to Construction"
          });
        }
        toast.success("Presale successfully moved to Active Project! 🎉");
      } catch (err) {
        console.error("Error moving to active project:", err);
        toast.error("Failed to update status on server");
      }
    }
  };

  const handleConfirmClose = async () => {
    if (!currentPresale) return;
    const targetId = currentPresale._id || currentPresale.id;
    setPresalesList((prev) =>
      prev.map((item) =>
        item.id === currentPresale.id ? { ...item, status: "CLOSED", closureStatus: closureOption } : item
      )
    );
    setIsCloseModalOpen(false);
    try {
      if (targetId) {
        await updateLeadProjectApi(targetId, {
          status: "CLOSED",
          closureStatus: closureOption
        });
      }
      toast.info(`Record marked as "${closureOption}".`);
    } catch (err) {
      console.error("Error closing presale:", err);
      toast.error("Failed to update closure status on server");
    }
  };

  // Filtered Table Records
  const filteredPresales = useMemo(() => {
    return presalesList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.clientName?.toLowerCase().includes(q) ||
        item.contactNo?.includes(q) ||
        item.emailAddress?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.activePerson?.toLowerCase().includes(q);

      const matchScope =
        filterScope === "ALL" ||
        item.engagementScope?.toLowerCase() === filterScope.toLowerCase();

      const matchStatus =
        filterStatus === "ALL" ||
        item.status?.toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchScope && matchStatus;
    });
  }, [presalesList, searchTerm, filterScope, filterStatus]);

  // View Pipeline of a specific Presale
  const handleOpenPipelineForClient = (client) => {
    setSelectedPresaleId(client.id);
    setActiveStageId(client.currentStageId || 1);
    setIsPipelineModalOpen(true);
  };

  // New Presale Form State for Modal
  const [newPresaleForm, setNewPresaleForm] = useState({
    clientName: "",
    contactNo: "",
    emailAddress: "",
    engagementScope: "Design + Construction",
    projectDetails: "Residential Work",
    expectedRevenue: 850000,
    activePerson: "Admin",
    city: "Lucknow",
    workTypes: "3D View, Concept Drawing, Elevation"
  });

  const handleCreateNewPresale = async (e) => {
    e.preventDefault();
    if (!newPresaleForm.clientName.trim()) {
      toast.error("Client Name is required!");
      return;
    }
    if (!newPresaleForm.contactNo.trim()) {
      toast.error("Contact Number is required!");
      return;
    }

    setCreatingPresale(true);
    const payload = {
      clientName: newPresaleForm.clientName.trim(),
      phoneNumber: newPresaleForm.contactNo.trim(),
      contactNo: newPresaleForm.contactNo.trim(),
      emailAddress: newPresaleForm.emailAddress.trim(),
      email: newPresaleForm.emailAddress.trim(),
      businessType: newPresaleForm.engagementScope,
      requirement: newPresaleForm.projectDetails,
      expectedBusiness: Number(newPresaleForm.expectedRevenue) || 0,
      assignedTo: newPresaleForm.activePerson,
      city: newPresaleForm.city.trim(),
      workTypes: newPresaleForm.workTypes.split(",").map((w) => w.trim()).filter(Boolean),
      currentStageId: 1,
      status: "OPEN",
      closureStatus: "Open",
      stagesData: {},
      remarks: []
    };

    try {
      const res = await createLeadProjectApi(payload);
      const savedDoc = res?.data?.project || res?.project || res?.data || res;
      const cleanId = savedDoc?._id || savedDoc?.leadId || `PRESALE-${Date.now().toString().slice(-4)}`;

      const newPresaleItem = {
        id: cleanId,
        _id: savedDoc?._id || cleanId,
        leadId: savedDoc?.leadId || cleanId,
        clientName: payload.clientName,
        contactNo: payload.contactNo,
        emailAddress: payload.emailAddress || "",
        engagementScope: payload.businessType,
        projectDetails: payload.requirement,
        expectedRevenue: payload.expectedBusiness,
        activePerson: payload.assignedTo,
        workTypes: payload.workTypes,
        city: payload.city,
        currentStageId: 1,
        status: "OPEN",
        closureStatus: "Open",
        stagesData: {},
        remarks: [],
        createdAt: savedDoc?.createdAt || new Date().toISOString()
      };

      setPresalesList((prev) => [newPresaleItem, ...prev]);
      setSelectedPresaleId(cleanId);
      setActiveStageId(1);
      setIsAddModalOpen(false);
      setNewPresaleForm({
        clientName: "",
        contactNo: "",
        emailAddress: "",
        engagementScope: "Design + Construction",
        projectDetails: "Residential Work",
        expectedRevenue: 850000,
        activePerson: "Admin",
        city: "Lucknow",
        workTypes: "3D View, Concept Drawing, Elevation"
      });
      toast.success(`Presale created for ${newPresaleItem.clientName}! 🚀`);
    } catch (err) {
      console.error("Error creating presale:", err);
      toast.error("Failed to create presale on server");
    } finally {
      setCreatingPresale(false);
    }
  };

  // Reusable Negotiation Block
  const renderNegotiationBlock = (extraField = null) => {
    const wants = stageFormData.wantsItem !== false;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-800">Client Wants This Item? (Y/N)</p>
            <p className="text-[11px] text-slate-500">No select karne par yeh stage N/A mark ho jayegi.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStageFormData({ ...stageFormData, wantsItem: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                wants ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border border-slate-300"
              }`}
            >
              YES {wants ? "●" : "○"}
            </button>
            <button
              type="button"
              onClick={() => setStageFormData({ ...stageFormData, wantsItem: false })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                !wants ? "bg-rose-600 text-white" : "bg-white text-slate-700 border border-slate-300"
              }`}
            >
              NO {!wants ? "●" : "○"}
            </button>
          </div>
        </div>

        {wants ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Receiving Date</label>
                <input
                  type="date"
                  value={stageFormData.requestDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, requestDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1st Option Given Date</label>
                <input
                  type="date"
                  value={stageFormData.optionDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, optionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Options Count</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={stageFormData.optionsCount || 1}
                  onChange={(e) => setStageFormData({ ...stageFormData, optionsCount: Number(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Option Finalisation Date</label>
                <input
                  type="date"
                  value={stageFormData.finalOptionDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, finalOptionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1st Modification Request Date</label>
                <input
                  type="date"
                  value={stageFormData.modDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, modDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Days in Modification</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold font-mono">
                  <span>[ {daysInModNegotiation} ]</span>
                  <FaLock className="text-slate-400 text-xs ml-auto" title="Auto-calculated (Locked)" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final Drawing / Item Finalisation Date</label>
                <input
                  type="date"
                  value={stageFormData.finalDrawingDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, finalDrawingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              {extraField}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
            <FaInfoCircle className="text-amber-600" />
            <span>This item is marked as Not Required (N/A) by client.</span>
          </div>
        )}
      </div>
    );
  };

  // Render Specific Form for Each of the 11 Sub-Stages
  const renderStageForm = () => {
    if (!isCurrentStageApplicable) {
      return (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <FaBan className="text-3xl text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Stage Not Applicable</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            This stage ({activeStageConfig.name}) is not included in the client's current Engagement Scope (
            <span className="font-bold text-blue-700">{currentPresale.engagementScope}</span>).
          </p>
        </div>
      );
    }

    switch (activeStageId) {
      case 1:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Received Date</label>
              <input
                type="date"
                value={stageFormData.requestDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, requestDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Visit Completed Date</label>
              <input
                type="date"
                value={stageFormData.visitCompletedDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, visitCompletedDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Initiated Date</label>
              <input
                type="date"
                value={stageFormData.requestInitiatedDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, requestInitiatedDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completion Date</label>
              <input
                type="date"
                value={stageFormData.completionDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, completionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Request Receiving Date</label>
              <input
                type="date"
                value={stageFormData.requestReceivingDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, requestReceivingDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Work Start Date</label>
              <input
                type="date"
                value={stageFormData.workStartDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, workStartDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Completion & Sent Date</label>
              <input
                type="date"
                value={stageFormData.completionDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, completionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Acceptance Status</label>
              <select
                value={stageFormData.acceptanceStatus || "Accepted"}
                onChange={(e) => setStageFormData({ ...stageFormData, acceptanceStatus: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Accepted">Accepted</option>
                <option value="Under Negotiation">Under Negotiation</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Construction Rate (₹/sqft)</label>
              <input
                type="number"
                value={stageFormData.constructionRate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, constructionRate: Number(e.target.value) || 0 })}
                placeholder="e.g. 1850"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Last Negotiation Date</label>
              <input
                type="date"
                value={stageFormData.lastNegotiationDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, lastNegotiationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Finalisation Date</label>
              <input
                type="date"
                value={stageFormData.finalisationDate || ""}
                onChange={(e) => setStageFormData({ ...stageFormData, finalisationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>
        );
      case 5:
        return renderNegotiationBlock();
      case 6:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Client Wants Bank Quotation? (Y/N)</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStageFormData({ ...stageFormData, wantsBank: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stageFormData.wantsBank !== false ? "bg-emerald-600 text-white" : "bg-white border border-slate-300"
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setStageFormData({ ...stageFormData, wantsBank: false })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stageFormData.wantsBank === false ? "bg-rose-600 text-white" : "bg-white border border-slate-300"
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
            {stageFormData.wantsBank !== false && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Given-to-Client Date</label>
                <input
                  type="date"
                  value={stageFormData.givenToClientDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, givenToClientDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            )}
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs sm:text-sm font-bold text-slate-800">Client Wants Structure Work? (Y/N)</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStageFormData({ ...stageFormData, wantsStructure: true })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stageFormData.wantsStructure !== false ? "bg-emerald-600 text-white" : "bg-white border border-slate-300"
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setStageFormData({ ...stageFormData, wantsStructure: false })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    stageFormData.wantsStructure === false ? "bg-rose-600 text-white" : "bg-white border border-slate-300"
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
            {stageFormData.wantsStructure !== false && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Request Receiving Date</label>
                  <input
                    type="date"
                    value={stageFormData.requestReceivingDate || ""}
                    onChange={(e) => setStageFormData({ ...stageFormData, requestReceivingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Start Date</label>
                  <input
                    type="date"
                    value={stageFormData.workStartDate || ""}
                    onChange={(e) => setStageFormData({ ...stageFormData, workStartDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Completion Date</label>
                  <input
                    type="date"
                    value={stageFormData.workCompletionDate || ""}
                    onChange={(e) => setStageFormData({ ...stageFormData, workCompletionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        );
      case 8:
        return renderNegotiationBlock();
      case 9:
        return renderNegotiationBlock(
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Construction Rate (₹/sqft)</label>
            <input
              type="number"
              value={stageFormData.constructionRate || ""}
              onChange={(e) => setStageFormData({ ...stageFormData, constructionRate: Number(e.target.value) || 0 })}
              placeholder="e.g. 1950"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        );
      case 10:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Receiving Date</label>
                <input
                  type="date"
                  value={stageFormData.requestReceivingDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, requestReceivingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Start Date</label>
                <input
                  type="date"
                  value={stageFormData.workStartDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, workStartDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Completion & Send Date</label>
                <input
                  type="date"
                  value={stageFormData.completionDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, completionDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Acceptance Status</label>
                <select
                  value={stageFormData.acceptanceStatus || "Accepted"}
                  onChange={(e) => setStageFormData({ ...stageFormData, acceptanceStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Accepted">Accepted</option>
                  <option value="Under Negotiation">Under Negotiation</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Last Negotiation Date</label>
                <input
                  type="date"
                  value={stageFormData.lastNegotiationDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, lastNegotiationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Finalisation Date</label>
                <input
                  type="date"
                  value={stageFormData.finalisationDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, finalisationDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Final Rate (₹/sqft)</label>
                <input
                  type="number"
                  value={stageFormData.finalRate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, finalRate: Number(e.target.value) || 0 })}
                  placeholder="e.g. 1950"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
        );
      case 11:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Request Receiving Date</label>
                <input
                  type="date"
                  value={stageFormData.requestReceivingDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, requestReceivingDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">1st Modification Request Date</label>
                <input
                  type="date"
                  value={stageFormData.modDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, modDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Days in Modification</label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold font-mono">
                  <span>[ {daysInModContract} ]</span>
                  <FaLock className="text-slate-400 text-xs ml-auto" title="Auto-calculated (Locked)" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Final Contract Sign Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={stageFormData.finalContractSignDate || ""}
                  onChange={(e) => setStageFormData({ ...stageFormData, finalContractSignDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 bg-white ring-1 ring-emerald-300"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // KPI Metrics
  const totalRevenue = useMemo(() => {
    return presalesList.reduce((acc, curr) => acc + (Number(curr.expectedRevenue) || 0), 0);
  }, [presalesList]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-5 font-sans pb-16">
      
      {/* ──────────────────────────────────────────────────────────────────
          TOP HEADER BAR
      ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Go Back"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Presale / Design Pipeline
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {presalesList.length} Active Presales
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Module 2 — Multi-Stage Design & Negotiation Tracking System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* VIEW SWITCHER: TABLE VIEW vs PIPELINE VIEW */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "table" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaTable className="text-xs" />
              <span>Table View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("pipeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === "pipeline" ? "bg-white text-indigo-600 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaStream className="text-xs" />
              <span>Pipeline View</span>
            </button>
          </div>

          {/* + ADD PRESALE BUTTON */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>Add Presale</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          KPI METRIC SUMMARY CARDS
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Presales</p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono mt-0.5">{presalesList.length}</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pipeline Revenue</p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Pipeline</p>
          <p className="text-lg sm:text-xl font-extrabold text-blue-600 font-mono mt-0.5">
            {presalesList.filter((p) => p.status === "OPEN").length}
          </p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Projects</p>
          <p className="text-lg sm:text-xl font-extrabold text-purple-700 font-mono mt-0.5">
            {presalesList.filter((p) => p.status === "ACTIVE_PROJECT").length}
          </p>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MODE 1: PRESALES TABLE VIEW (CRM STANDARD TABLE FORMAT)
      ────────────────────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-3">
          {/* SEARCH & FILTERS BAR */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by client name, contact, city, active person..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Scopes</option>
                <option value="Consultancy Only">Consultancy Only</option>
                <option value="Design Only">Design Only</option>
                <option value="Design + Construction">Design + Construction</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="OPEN">Open (In Pipeline)</option>
                <option value="CLOSED">Closed</option>
                <option value="ACTIVE_PROJECT">Active Project</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
                  <th className="py-3 px-3 text-center w-12 border-r border-slate-800 whitespace-nowrap">SR. NO.</th>
                  <th className="py-3 px-3 text-center w-28 border-r border-slate-800 whitespace-nowrap">ACTIONS</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">REVENUE</th>
                  <th className="py-3 px-3 text-left border-r border-slate-800 whitespace-nowrap">CLIENT DETAILS</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">ENGAGEMENT SCOPE</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">CURRENT STAGE</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">PROJECT DETAILS</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">CITY</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">ACTIVE PERSON</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">STATUS</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">CREATED AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600 text-xl" />
                        <span className="text-xs font-semibold">Loading presales data from server...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPresales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                      {presalesList.length === 0
                        ? "No Presale projects found in database. Click \"+ Add Presale\" to create one."
                        : "No Presale records match your filters."}
                    </td>
                  </tr>
                ) : (
                  filteredPresales.map((item, idx) => {
                    const stageObj = PIPELINE_STAGES.find((s) => s.id === (item.currentStageId || 1)) || PIPELINE_STAGES[0];
                    const dateObj = item.createdAt ? new Date(item.createdAt) : null;
                    const isValidDate = dateObj && !isNaN(dateObj.getTime());
                    const formattedDate = isValidDate
                      ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                      : "--";
                    const formattedTime = isValidDate
                      ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                      : "";

                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        {/* 1. SR NO */}
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                          {idx + 1}
                        </td>

                        {/* 2. ACTIONS (VIEW PIPELINE & EDIT) */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenPipelineForClient(item)}
                              className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-2xs active:scale-95"
                              title="View & Edit 11-Stage Pipeline"
                            >
                              <FaEye className="text-xs" />
                              <span>Pipeline</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPresaleId(item.id);
                                setViewMode("pipeline");
                              }}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center cursor-pointer shadow-2xs active:scale-95"
                              title="Full Screen Pipeline Mode"
                            >
                              <FaStream className="text-xs" />
                            </button>
                          </div>
                        </td>

                        {/* 3. REVENUE */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
                            ₹{Number(item.expectedRevenue || 0).toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* 4. CLIENT DETAILS */}
                        <td className="py-2.5 px-3 text-left border-r border-slate-100">
                          <div className="space-y-0.5 max-w-[180px]">
                            {/* Client Name (Clickable to open pipeline) */}
                            <div>
                              <button
                                type="button"
                                onClick={() => handleOpenPipelineForClient(item)}
                                className="font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer text-left block truncate max-w-full"
                                title={`Open Pipeline: ${item.clientName}`}
                              >
                                {item.clientName}
                              </button>
                            </div>

                            {/* Phone Number (Clickable link) */}
                            {item.contactNo && item.contactNo !== "--" ? (
                              <div>
                                <a
                                  href={`tel:${item.contactNo}`}
                                  className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline block truncate cursor-pointer"
                                  title={`Call ${item.contactNo}`}
                                >
                                  {item.contactNo}
                                </a>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 font-mono">--</div>
                            )}

                            {/* Email Address (Clickable link) */}
                            {item.emailAddress && item.emailAddress !== "--" && item.emailAddress.trim() !== "" ? (
                              <div>
                                <a
                                  href={`mailto:${item.emailAddress}`}
                                  className="text-[11px] font-mono text-blue-600 hover:text-blue-800 hover:underline block truncate cursor-pointer"
                                  title={`Email ${item.emailAddress}`}
                                >
                                  {item.emailAddress}
                                </a>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 font-mono">--</div>
                            )}
                          </div>
                        </td>

                        {/* 5. ENGAGEMENT SCOPE */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            {item.engagementScope}
                          </span>
                        </td>

                        {/* 6. CURRENT STAGE */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span>Stage {stageObj.id}: {stageObj.name}</span>
                          </span>
                        </td>

                        {/* 7. PROJECT DETAILS */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[160px]">
                          <div className="truncate text-xs text-slate-700 font-medium" title={item.projectDetails}>
                            {item.projectDetails || "--"}
                          </div>
                        </td>

                        {/* 8. CITY */}
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                          {item.city || "--"}
                        </td>

                        {/* 9. ACTIVE PERSON */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="font-medium text-slate-800 flex items-center justify-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{item.activePerson || "Admin"}</span>
                          </span>
                        </td>

                        {/* 10. STATUS */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          {item.status === "CLOSED" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              CLOSED
                            </span>
                          ) : item.status === "ACTIVE_PROJECT" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                              ACTIVE PROJECT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              IN PIPELINE
                            </span>
                          )}
                        </td>

                        {/* 11. CREATED AT */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isValidDate ? (
                            <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs">
                              <span className="font-bold text-xs whitespace-nowrap">{formattedDate}</span>
                              {formattedTime && (
                                <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">{formattedTime}</span>
                              )}
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-slate-400">--</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODE 2: FULL-SCREEN PIPELINE VIEW OR MODAL
      ────────────────────────────────────────────────────────────────── */}
      {(viewMode === "pipeline" || isPipelineModalOpen) && (
        <div className={isPipelineModalOpen ? "fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto" : "space-y-5"}>
          <div className={isPipelineModalOpen ? "bg-[#F8FAFC] border border-slate-200 rounded-3xl max-w-6xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto" : "space-y-5"}>
            
            {!currentPresale ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                <p className="text-sm font-semibold text-slate-600">No Presale record selected or available.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (isPipelineModalOpen) setIsPipelineModalOpen(false);
                    else setViewMode("table");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
                >
                  Back to Table View
                </button>
              </div>
            ) : (
              <>
                {/* MODAL HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 bg-white p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (isPipelineModalOpen) setIsPipelineModalOpen(false);
                        else setViewMode("table");
                      }}
                      className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="Close Pipeline View"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                          11-Stage Design Pipeline: {currentPresale.clientName}
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {currentPresale.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Engagement Scope: <span className="font-bold text-blue-700">{currentPresale.engagementScope}</span> • City: {currentPresale.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentPresale.engagementScope}
                      onChange={(e) => handleScopeChange(e.target.value)}
                      className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    >
                      <option value="Consultancy Only">Consultancy Only (Stages 1-2)</option>
                      <option value="Design Only">Design Only (Stages 1-10)</option>
                      <option value="Design + Construction">Design + Construction (Stages 1-11)</option>
                    </select>
                  </div>
                </div>

            {/* PIPELINE STEPPER (11 STAGES) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FaLayerGroup className="text-blue-600" /> Pipeline Stepper (Click any stage to edit)
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  Selected: Stage {activeStageId} ({activeStageConfig.name})
                </span>
              </div>

              {/* Row 1: Stages 1 to 9 */}
              <div className="relative">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 -z-0"></div>
                <div className="grid grid-cols-9 gap-1 relative z-10">
                  {PIPELINE_STAGES.slice(0, 9).map((stage) => {
                    const applicable = isStageApplicable(stage.id, currentPresale?.engagementScope);
                    const isCurrent = stage.id === (currentPresale?.currentStageId || 1);
                    const isSelected = stage.id === activeStageId;
                    const isCompleted = stage.id < (currentPresale?.currentStageId || 1) && applicable;

                    return (
                      <div
                        key={stage.id}
                        onClick={() => setActiveStageId(stage.id)}
                        className={`flex flex-col items-center select-none text-center cursor-pointer transition-all ${
                          !applicable ? "opacity-35" : "opacity-100"
                        }`}
                      >
                        <span className={`text-[11px] font-mono font-bold mb-1 ${isSelected ? "text-blue-600 font-extrabold" : "text-slate-400"}`}>
                          {stage.id}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                            !applicable
                              ? "bg-slate-100 text-slate-400 border border-slate-300"
                              : isSelected
                              ? "ring-4 ring-blue-100 bg-blue-600 text-white shadow-sm scale-110"
                              : isCurrent
                              ? "bg-slate-900 text-white ring-2 ring-slate-400"
                              : isCompleted
                              ? "bg-emerald-600 text-white"
                              : "bg-white border-2 border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600"
                          }`}
                        >
                          {!applicable ? "✕" : isCompleted ? <FaCheck className="text-[10px]" /> : stage.id}
                        </div>
                        <span className={`text-[11px] mt-1.5 font-bold truncate max-w-[70px] ${!applicable ? "text-slate-400 line-through" : isSelected ? "text-blue-700 font-extrabold" : "text-slate-600"}`}>
                          {stage.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Stages 10 & 11 */}
              <div className="pt-3 border-t border-slate-100 relative">
                <div className="max-w-md">
                  <div className="grid grid-cols-2 gap-8 relative">
                    <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0"></div>
                    {PIPELINE_STAGES.slice(9, 11).map((stage) => {
                      const applicable = isStageApplicable(stage.id, currentPresale?.engagementScope);
                      const isCurrent = stage.id === (currentPresale?.currentStageId || 1);
                      const isSelected = stage.id === activeStageId;
                      const isCompleted = stage.id < (currentPresale?.currentStageId || 1) && applicable;

                      return (
                        <div
                          key={stage.id}
                          onClick={() => setActiveStageId(stage.id)}
                          className={`flex flex-col items-center select-none text-center cursor-pointer relative z-10 transition-all ${
                            !applicable ? "opacity-35" : "opacity-100"
                          }`}
                        >
                          <span className={`text-[11px] font-mono font-bold mb-1 ${isSelected ? "text-blue-600 font-extrabold" : "text-slate-400"}`}>
                            {stage.id}
                          </span>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              !applicable
                                ? "bg-slate-100 text-slate-400 border border-slate-300"
                                : isSelected
                                ? "ring-4 ring-blue-100 bg-blue-600 text-white shadow-sm scale-110"
                                : isCurrent
                                ? "bg-slate-900 text-white ring-2 ring-slate-400"
                                : isCompleted
                                ? "bg-emerald-600 text-white"
                                : "bg-white border-2 border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600"
                            }`}
                          >
                            {!applicable ? "✕" : isCompleted ? <FaCheck className="text-[10px]" /> : stage.id}
                          </div>
                          <span className={`text-xs mt-1.5 font-bold ${!applicable ? "text-slate-400 line-through" : isSelected ? "text-blue-700 font-extrabold" : "text-slate-600"}`}>
                            {stage.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIVE STAGE FORM */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>STAGE {activeStageConfig.id} — {activeStageConfig.fullName.toUpperCase()}</span>
                </h3>
                {isCurrentStageApplicable && (
                  <button
                    type="button"
                    onClick={handleSaveStage}
                    disabled={savingStage}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingStage ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
                    <span>{savingStage ? "Saving..." : "Save Stage"}</span>
                  </button>
                )}
              </div>
              <div>{renderStageForm()}</div>
            </div>

            {/* DISCUSSION REMARKS & FOOTER ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Remarks */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                  <FaCommentDots className="text-blue-600" /> Discussion Log / Remarks
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {(currentPresale?.remarks || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No remarks logged yet.</p>
                  ) : (
                    (currentPresale?.remarks || []).map((r) => (
                      <div key={r.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                        <span className="font-bold text-slate-700">{r.author} • {r.dateTime}:</span>
                        <p className="text-slate-800 mt-0.5">{r.text}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAddRemark} className="flex gap-2">
                  <input
                    type="text"
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    placeholder="Write a remark..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold">
                    Add
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-1">Presale Pipeline Actions</h4>
                  <p className="text-xs text-slate-500">
                    Close the record or promote to Construction Active Project based on scope and contract completion.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCloseModalOpen(true)}
                    className="px-4 py-2 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all"
                  >
                    Mark as Closed
                  </button>
                  <button
                    type="button"
                    onClick={handleMoveToActive}
                    disabled={!isMoveToActiveEnabled}
                    className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                      isMoveToActiveEnabled
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Move to Active Project
                  </button>
                </div>
              </div>
            </div>
            </>
          )}

          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: + ADD PRESALE
      ────────────────────────────────────────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Presale Lead</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPresale} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={newPresaleForm.clientName}
                  onChange={(e) => setNewPresaleForm({ ...newPresaleForm, clientName: e.target.value })}
                  placeholder="e.g. ABC Infra"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact No. *</label>
                  <input
                    type="text"
                    required
                    value={newPresaleForm.contactNo}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, contactNo: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newPresaleForm.emailAddress}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, emailAddress: e.target.value })}
                    placeholder="e.g. client@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={newPresaleForm.city}
                  onChange={(e) => setNewPresaleForm({ ...newPresaleForm, city: e.target.value })}
                  placeholder="e.g. Lucknow"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Engagement Scope</label>
                  <select
                    value={newPresaleForm.engagementScope}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, engagementScope: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Consultancy Only">Consultancy Only</option>
                    <option value="Design Only">Design Only</option>
                    <option value="Design + Construction">Design + Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Details</label>
                  <input
                    type="text"
                    value={newPresaleForm.projectDetails}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, projectDetails: e.target.value })}
                    placeholder="e.g. Residential Work"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expected Revenue (₹)</label>
                  <input
                    type="number"
                    value={newPresaleForm.expectedRevenue}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, expectedRevenue: e.target.value })}
                    placeholder="e.g. 850000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Active Person</label>
                  <input
                    type="text"
                    value={newPresaleForm.activePerson}
                    onChange={(e) => setNewPresaleForm({ ...newPresaleForm, activePerson: e.target.value })}
                    placeholder="e.g. Shivam"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingPresale}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {creatingPresale && <FaSpinner className="animate-spin text-xs" />}
                  <span>{creatingPresale ? "Saving..." : "Save & Add to Table"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: MARK AS CLOSED
      ────────────────────────────────────────────────────────────────── */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FaTimesCircle className="text-rose-600" />
                <span>Mark Presale as Closed</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Select the appropriate Closure Status as per specification:
              </p>
              <select
                value={closureOption}
                onChange={(e) => setClosureOption(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Closed — Consultancy Only">Closed — Consultancy Only (Completed 1-2)</option>
                <option value="Closed — Design Only">Closed — Design Only (Completed Design 1-10)</option>
                <option value="Lost">Lost (Client Dropped / Budget Mismatch)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClose}
                className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Presales;
