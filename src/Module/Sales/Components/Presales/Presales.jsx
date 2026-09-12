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
  FaSpinner,
  FaBuilding,
  FaStar,
  FaExternalLinkAlt,
  FaBoxes
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { toast } from "react-toastify";
import { useAuth } from "../../../../context/AuthContext";
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
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

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
          leadId: leadObj?._id || (typeof bp.leadId === "string" ? bp.leadId : cleanId),
          clientName: bp.clientName || bp.concernPersonName || leadObj?.clientName || leadObj?.concernPersonName || "Unnamed Client",
          contactNo: bp.phoneNumber || bp.contactNo || bp.whatsappNumber || leadObj?.phoneNumber || leadObj?.contactNo || "--",
          phoneNumber: bp.phoneNumber || bp.contactNo || bp.whatsappNumber || leadObj?.phoneNumber || leadObj?.contactNo || "--",
          alternateNumber: bp.alternateNumber || leadObj?.alternateNumber || "--",
          whatsappNumber: bp.whatsappNumber || bp.phoneNumber || leadObj?.whatsappNumber || leadObj?.phoneNumber || "--",
          emailAddress: bp.emailAddress || bp.email || leadObj?.emailAddress || leadObj?.email || "",
          companyName: bp.companyName || leadObj?.companyName || "--",
          businessType: bp.businessType || leadObj?.businessType || leadObj?.workCategory || "--",
          jobType: bp.jobType || "NEW",
          priority: bp.priority || "High",
          clientDesignation: bp.clientDesignation || "--",
          clientRating: Number(bp.clientRating) || 4.5,
          expectedBusiness: Number(bp.expectedBusiness || bp.amount || bp.expectedRevenue || 0),
          expectedRevenue: Number(bp.expectedBusiness || bp.amount || bp.expectedRevenue || 0),
          assignedTo: bp.assignedTo || bp.salesPerson || leadObj?.salesPerson || "Admin",
          activePerson: bp.assignedTo || bp.salesPerson || leadObj?.salesPerson || "Admin",
          nextPersonName: bp.nextPersonName || "",
          designation: bp.designation || bp.nextPersonDesignation || "",
          city: bp.city || leadObj?.city || "--",
          state: bp.state || leadObj?.state || "",
          pincode: bp.pincode || leadObj?.pincode || "",
          address: bp.address || leadObj?.address || "",
          requirement: bp.requirement || bp.projectDetails || leadObj?.requirement || "--",
          projectDetails: bp.requirement || bp.projectDetails || leadObj?.requirement || "--",
          transferRemark: bp.transferRemark || bp.salesRemarks || bp.remark || leadObj?.remark || "",
          createdAt: bp.createdAt || bp.created_at || bp.date || leadObj?.createdAt || leadObj?.date || null,
          rawProject: bp,
          leadObj: leadObj
        };
      });

      setPresalesList(formatted);
      if (formatted.length > 0) {
        setSelectedPresaleId((prev) => (prev && formatted.some((p) => p.id === prev) ? prev : formatted[0].id));
        setActiveStageId((prev) => prev || 1);
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

  // View Details Modal State (Exact matching Details View)
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Search and Filters for Table (Master Form Pattern)
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterJobType, setFilterJobType] = useState("ALL");
  const [filterBusinessType, setFilterBusinessType] = useState("ALL");
  const [filterAssignedTo, setFilterAssignedTo] = useState("ALL");
  const [filterCity, setFilterCity] = useState("ALL");

  // Modals
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

  // Project actions matching Details View
  const handleEditProject = (project) => {
    const targetLeadId = project.leadId?._id || project.leadId || project._id || project.id;
    navigate(`/sales/leads/sales-form/${targetLeadId}`, {
      state: {
        lead: project.leadObj || { _id: targetLeadId, clientName: project.clientName, phoneNumber: project.phoneNumber },
        project: project.rawProject || project,
        returnToLeadDetails: false,
        from: "presales"
      }
    });
  };

  const handleNavigateToLeadDetails = (project) => {
    const targetLeadId = project.leadId?._id || project.leadId || project._id || project.id;
    navigate(`/sales/leads/details/${targetLeadId}`, {
      state: { lead: project.leadObj || project, from: "presales", allowEdit: false }
    });
  };

  // Unique options for dropdown filters
  const businessTypesList = useMemo(() => {
    const set = new Set();
    presalesList.forEach((p) => {
      if (p.businessType) set.add(p.businessType);
    });
    return Array.from(set).sort();
  }, [presalesList]);

  const assignedToList = useMemo(() => {
    const set = new Set();
    presalesList.forEach((p) => {
      const name = p.assignedTo || p.activePerson;
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [presalesList]);

  const citiesList = useMemo(() => {
    const set = new Set();
    presalesList.forEach((p) => {
      if (p.city) set.add(p.city);
    });
    return Array.from(set).sort();
  }, [presalesList]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filterPriority !== "ALL") count++;
    if (filterJobType !== "ALL") count++;
    if (filterBusinessType !== "ALL") count++;
    if (filterAssignedTo !== "ALL") count++;
    if (filterCity !== "ALL") count++;
    return count;
  }, [searchTerm, filterPriority, filterJobType, filterBusinessType, filterAssignedTo, filterCity]);

  const hasActiveFilters = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterPriority("ALL");
    setFilterJobType("ALL");
    setFilterBusinessType("ALL");
    setFilterAssignedTo("ALL");
    setFilterCity("ALL");
  };

  // Filtered Table Records
  const filteredPresales = useMemo(() => {
    return presalesList.filter((item) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.clientName?.toLowerCase().includes(q) ||
        item.contactNo?.includes(q) ||
        item.phoneNumber?.includes(q) ||
        item.emailAddress?.toLowerCase().includes(q) ||
        item.companyName?.toLowerCase().includes(q) ||
        item.city?.toLowerCase().includes(q) ||
        item.businessType?.toLowerCase().includes(q) ||
        item.assignedTo?.toLowerCase().includes(q) ||
        item.activePerson?.toLowerCase().includes(q) ||
        item.requirement?.toLowerCase().includes(q);

      const itemPriority = String(item.priority || "High").toUpperCase();
      const matchPriority =
        filterPriority === "ALL" ||
        itemPriority === filterPriority.toUpperCase() ||
        (filterPriority === "HIGH" && itemPriority === "HOT") ||
        (filterPriority === "MEDIUM" && itemPriority === "WARM");

      const itemJobType = String(item.jobType || "NEW").toUpperCase();
      const matchJobType =
        filterJobType === "ALL" ||
        itemJobType === filterJobType.toUpperCase();

      const matchBusinessType =
        filterBusinessType === "ALL" ||
        String(item.businessType || "").toLowerCase() === filterBusinessType.toLowerCase();

      const itemAssigned = item.assignedTo || item.activePerson || "";
      const matchAssignedTo =
        filterAssignedTo === "ALL" ||
        itemAssigned.toLowerCase() === filterAssignedTo.toLowerCase();

      const itemCity = item.city || "";
      const matchCity =
        filterCity === "ALL" ||
        itemCity.toLowerCase() === filterCity.toLowerCase();

      return matchSearch && matchPriority && matchJobType && matchBusinessType && matchAssignedTo && matchCity;
    });
  }, [presalesList, searchTerm, filterPriority, filterJobType, filterBusinessType, filterAssignedTo, filterCity]);

  // View Pipeline of a specific Presale
  const handleOpenPipelineForClient = (client) => {
    setSelectedPresaleId(client.id);
    setActiveStageId(client.currentStageId || 1);
    setIsPipelineModalOpen(true);
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
    return presalesList.reduce((acc, curr) => acc + (Number(curr.expectedBusiness) || 0), 0);
  }, [presalesList]);

  const highPriorityCount = useMemo(() => {
    return presalesList.filter((p) => {
      const pr = String(p.priority || "").toUpperCase();
      return pr === "HIGH" || pr === "HOT";
    }).length;
  }, [presalesList]);

  const newJobsCount = useMemo(() => {
    return presalesList.filter((p) => String(p.jobType || "NEW").toUpperCase() === "NEW").length;
  }, [presalesList]);

  // Reusable MasterForm-style KPI Card
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
        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-16 px-1 sm:px-0 font-sans">
      
      {/* ──────────────────────────────────────────────────────────────────
          FIXED / STICKY HEADER BANNER (MASTER FORM DESIGN)
      ────────────────────────────────────────────────────────────────── */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl px-4 py-3 shadow-md border border-indigo-700/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10"
                title="Go Back"
              >
                <FaArrowLeft className="text-xs" />
              </button>
              <div className="p-2 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <FaBuilding className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    Presales Management
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                    <HiSparkles className="w-2.5 h-2.5 text-cyan-300" /> Database Live
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/90 mt-0.5 leading-none font-normal">
                  Approved master pipeline of lead projects, proposals & expected business.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`relative p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm border ${
                  showFilters
                    ? "bg-white text-indigo-950 border-white shadow-md scale-105"
                    : "bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-100 border-indigo-600/50 hover:border-indigo-500"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className={`w-3.5 h-3.5 ${showFilters ? "text-indigo-700" : "text-indigo-300"}`} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/10 text-white border border-white/15">
                {presalesList.length} Active Records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          COMPACT KPI METRIC SUMMARY CARDS (MASTER FORM DESIGN)
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-slate-800 to-slate-900"
          label="Total Presales"
          value={presalesList.length}
          subtitle="Saved in master database"
          icon={<FaBuilding className="w-5 h-5 text-white" />}
          IconBg={<FaBuilding className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Total Value"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          subtitle="Expected business pipeline"
          icon={<FaRupeeSign className="w-5 h-5 text-white" />}
          IconBg={<FaRupeeSign className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-rose-600 to-pink-700"
          label="High Priority"
          value={highPriorityCount}
          subtitle="High / Hot priority leads"
          icon={<FaStar className="w-5 h-5 text-white" />}
          IconBg={<FaStar className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-indigo-600 to-purple-700"
          label="New Jobs"
          value={newJobsCount}
          subtitle="Fresh intake requirements"
          icon={<FaBoxes className="w-5 h-5 text-white" />}
          IconBg={<FaBoxes className="w-20 h-20" />}
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MASTER FORM STYLE SEARCH & TABLE-BASED FILTER CONTROL BAR (COLLAPSIBLE)
      ────────────────────────────────────────────────────────────────── */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top Row: Search Box, Found Count, Reset & Close */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search presales by client, phone, company, city, executive, requirement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
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
                {filteredPresales.length} Found
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

          {/* Bottom Row: Dropdown Filters Matching Table Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
            {/* 1. Priority Filter (Column: PRIORITY) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Priority
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  filterPriority !== "ALL"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High / Hot</option>
                <option value="MEDIUM">Medium / Warm</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* 2. Job Type Filter (Column: JOB TYPE) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Job Type
              </label>
              <select
                value={filterJobType}
                onChange={(e) => setFilterJobType(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  filterJobType !== "ALL"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="ALL">All Job Types</option>
                <option value="NEW">New</option>
                <option value="EXISTING">Existing</option>
                <option value="UPGRADE">Upgrade</option>
              </select>
            </div>

            {/* 3. Business Type Filter (Column: BUSINESS TYPE) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Business Type
              </label>
              <select
                value={filterBusinessType}
                onChange={(e) => setFilterBusinessType(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  filterBusinessType !== "ALL"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="ALL">All Business Types</option>
                {businessTypesList.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Assigned To Filter (Column: ASSIGNED TO) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Assigned To
              </label>
              <select
                value={filterAssignedTo}
                onChange={(e) => setFilterAssignedTo(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  filterAssignedTo !== "ALL"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="ALL">All Executives</option>
                {assignedToList.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Location / City Filter (Column: LOCATION) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Location / City
              </label>
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500 truncate ${
                  filterCity !== "ALL"
                    ? "bg-indigo-50 text-indigo-800 border-indigo-300 font-bold"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                }`}
              >
                <option value="ALL">All Locations</option>
                {citiesList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          PRESALES TABLE VIEW (REAL DATA MATCHING DETAILS VIEW)
      ────────────────────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="w-full bg-white border border-slate-200/90 shadow-xs overflow-hidden rounded-none">

          {/* TABLE CONTAINER */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
                  <th className="py-3 px-3 text-center w-12 border-r border-slate-800 whitespace-nowrap">SR. NO.</th>
                  <th className="py-3 px-3 text-center w-28 border-r border-slate-800 whitespace-nowrap">ACTIONS</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">AMOUNT</th>
                  <th className="py-3 px-3 text-left border-r border-slate-800 whitespace-nowrap">CLIENT</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">COMPANY</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">BUSINESS TYPE</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">JOB TYPE</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">PRIORITY</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">ASSIGNED TO</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">NEXT PERSON</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">LOCATION</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">REQUIREMENT</th>
                  <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">SALES REMARKS</th>
                  <th className="py-3 px-3 text-center whitespace-nowrap">CREATED AT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-slate-500 font-medium">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FaSpinner className="animate-spin text-blue-600 text-xl" />
                        <span className="text-xs font-semibold">Loading presales data from server...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPresales.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-slate-500 font-medium">
                      {presalesList.length === 0
                        ? "No Presale projects found in database."
                        : "No Presale records match your search or filters."}
                    </td>
                  </tr>
                ) : (
                  filteredPresales.map((item, idx) => {
                    const amt = Number(item.expectedBusiness || item.amount || 0);
                    const p = String(item.priority || "High").toUpperCase();
                    const isHigh = p === "HIGH" || p === "HOT";
                    const isMedium = p === "MEDIUM" || p === "WARM";

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

                        {/* 2. ACTIONS */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* VIEW LEAD DETAILS PAGE */}
                            <button
                              type="button"
                              onClick={() => handleNavigateToLeadDetails(item)}
                              className="w-7 h-7 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                              title="View Lead Details"
                            >
                              <FaEye className="text-xs" />
                            </button>

                            {/* EDIT PROJECT IN SALES FORM */}
                            {!isUserObserver ? (
                              <button
                                type="button"
                                onClick={() => handleEditProject(item)}
                                className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                                title="Edit Project Details"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                            ) : (
                              <span
                                className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-60"
                                title="Edit disabled for Observer"
                              >
                                <FaEdit className="text-xs" />
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. AMOUNT */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
                            ₹{amt.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* 4. CLIENT */}
                        <td className="py-2.5 px-3 text-left border-r border-slate-100">
                          <div className="space-y-0.5 max-w-[180px]">
                            <button
                              type="button"
                              onClick={() => handleNavigateToLeadDetails(item)}
                              className="font-bold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer text-left block truncate max-w-full"
                              title={`View Details: ${item.clientName}`}
                            >
                              {item.clientName}
                            </button>
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
                            {item.emailAddress && item.emailAddress !== "--" && item.emailAddress.trim() !== "" ? (
                              <div>
                                <a
                                  href={`mailto:${item.emailAddress}`}
                                  className="text-[10px] text-slate-400 hover:text-blue-600 hover:underline block truncate cursor-pointer max-w-[140px]"
                                  title={`Email ${item.emailAddress}`}
                                >
                                  {item.emailAddress}
                                </a>
                              </div>
                            ) : (
                              <div className="text-[10px] text-slate-400 font-mono">--</div>
                            )}
                          </div>
                        </td>

                        {/* 5. COMPANY */}
                        <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                          {item.companyName || "--"}
                        </td>

                        {/* 6. BUSINESS TYPE */}
                        <td className="py-2.5 px-3 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                          {item.businessType || "--"}
                        </td>

                        {/* 7. JOB TYPE */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                            {item.jobType || "NEW"}
                          </span>
                        </td>

                        {/* 8. PRIORITY */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                              isHigh
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : isMedium
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isHigh ? "🔴 High" : isMedium ? "🟡 Medium" : "🟢 Low"}
                          </span>
                        </td>

                        {/* 9. ASSIGNED TO */}
                        <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                          {item.assignedTo || "Admin"}
                        </td>

                        {/* 10. NEXT PERSON */}
                        <td className="py-2.5 px-3 text-center text-slate-700 border-r border-slate-100 whitespace-nowrap">
                          {item.nextPersonName ? (
                            <div>
                              <div className="font-bold text-slate-800">{item.nextPersonName}</div>
                              {item.designation && (
                                <div className="text-[10px] text-slate-400">({item.designation})</div>
                              )}
                            </div>
                          ) : (
                            "--"
                          )}
                        </td>

                        {/* 11. LOCATION */}
                        <td className="py-2.5 px-3 text-center font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                          {item.city || item.address || "--"}
                        </td>

                        {/* 12. REQUIREMENT */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[160px]">
                          <div className="truncate text-xs text-slate-700 font-medium mx-auto" title={item.requirement}>
                            {item.requirement || "--"}
                          </div>
                        </td>

                        {/* 13. SALES REMARKS */}
                        <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[160px]">
                          <div className="truncate text-xs text-slate-700 font-medium mx-auto" title={item.transferRemark}>
                            {item.transferRemark || "--"}
                          </div>
                        </td>

                        {/* 14. CREATED AT */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          {isValidDate ? (
                            <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs">
                              <span className="font-bold text-xs whitespace-nowrap">{formattedDate}</span>
                              {formattedTime && (
                                <span className="font-mono text-[10px] text-blue-700 whitespace-nowrap">{formattedTime}</span>
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
          MODAL: VIEW FULL PROJECT DETAILS (EXACT MATCH TO DETAILS VIEW)
      ────────────────────────────────────────────────────────────────── */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                  <FaBuilding />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Project Details: {selectedProject.clientName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    ID: {selectedProject.leadId || "--"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Company Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.companyName || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Business Type</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.businessType || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Client Designation</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.clientDesignation || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 font-bold block mb-0.5">Expected Business Value</span>
                <span className="font-extrabold text-emerald-700 text-base font-mono">
                  ₹{Number(selectedProject.expectedBusiness || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Priority & Job Type</span>
                <span className="font-bold text-slate-900 text-sm uppercase">
                  {selectedProject.priority || "High"} • {selectedProject.jobType || "NEW"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Assigned Executive</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.assignedTo || "Admin"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Next Concern Person</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedProject.nextPersonName
                    ? `${selectedProject.nextPersonName} ${selectedProject.designation ? `(${selectedProject.designation})` : ""}`
                    : "--"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Client Rating</span>
                <span className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                  <FaStar /> {selectedProject.clientRating || 4.5} / 5
                </span>
              </div>
            </div>

            {/* LOCATION */}
            {(selectedProject.address || selectedProject.city) && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Location / Address:</span>
                <span className="text-slate-600 font-medium">
                  {[selectedProject.address, selectedProject.city, selectedProject.state, selectedProject.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            {/* REQUIREMENT */}
            {selectedProject.requirement && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Requirement Details:</span>
                <p className="text-slate-800 font-medium whitespace-pre-line">{selectedProject.requirement}</p>
              </div>
            )}

            {/* REMARKS */}
            {selectedProject.transferRemark && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Sales Management Remarks / Notes:</span>
                <p className="text-slate-800 font-medium whitespace-pre-line">{selectedProject.transferRemark}</p>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleNavigateToLeadDetails(selectedProject);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-all"
              >
                <FaExternalLinkAlt className="text-[10px]" />
                <span>Open Lead Details</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                {!isUserObserver && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEditProject(selectedProject);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <FaEdit className="text-xs" />
                    <span>Edit This Project</span>
                  </button>
                )}
              </div>
            </div>
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
