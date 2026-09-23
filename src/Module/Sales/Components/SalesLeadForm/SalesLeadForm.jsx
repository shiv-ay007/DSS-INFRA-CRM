import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  FaCheck,
  FaTable,
  FaSpinner,
  FaSave,
  FaArrowLeft
} from "react-icons/fa";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { workCategoryList, indianStatesList } from "../../data/addLeadData";
import { getLeadByIdApi, updateLeadApi } from "../../services/totalLeads.api";
import { createLeadProjectApi } from "../../services/leadProject.api";
import {
  useLeadContext,
  updateLeadInStorage,
  notifyLeadChange,
  markLeadAsTransferredToSales
} from "../../../../context/LeadContext";
import { useAuth } from "../../../../context/AuthContext";

const SalesLeadForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { invalidateCache } = useLeadContext();
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState(location.state?.lead || null);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    clientName: "",
    phoneNumber: "",
    alternateNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    companyName: "",
    projectName: "",
    workType: "",
    businessType: "Information Technology",
    clientDesignation: "Managing Director",
    expectedBusiness: 50000,
    priority: "high",
    jobType: "NEW",
    city: "",
    state: "",
    pincode: "",
    address: "",
    requirement: "",
    requirementAttachments: [],
    transferRemark: "",
    transferRemarkAttachments: [],
    clientRating: 4.5,
    projectCoordinatorName: "",
    nextPersonName: "",
    designation: ""
  });

  // Populate form data whenever lead is resolved
  const populateFormData = (leadData, initialRemark = "") => {
    if (!leadData) return;
    const existingRemarkAtts = Array.isArray(leadData.remarkAttachments) && leadData.remarkAttachments.length > 0
      ? leadData.remarkAttachments
      : Array.isArray(leadData.remarksFiles) && leadData.remarksFiles.length > 0
      ? leadData.remarksFiles.map((f, idx) => ({
          id: f.id || idx,
          name: f.name || f.filename || `Attachment-${idx + 1}`,
          type: f.type || (f.url?.match(/\.(mp4|webm)$/i) ? "video" : f.url?.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) ? "audio" : "image"),
          url: f.url || f.fileUrl || (typeof f === "string" ? f : ""),
          preview: f.url || f.fileUrl || (typeof f === "string" ? f : "")
        }))
      : [];

    const existingReqAtts = Array.isArray(leadData.requirementAttachments) && leadData.requirementAttachments.length > 0
      ? leadData.requirementAttachments
      : [];

    setFormData({
      clientName: leadData.concernPersonName || leadData.clientName || "",
      phoneNumber: leadData.phoneNumber || leadData.contact || leadData.phone || "",
      alternateNumber: leadData.alternateNumber || "",
      whatsappNumber: leadData.whatsappNumber || leadData.phoneNumber || leadData.phone || "",
      emailAddress: leadData.emailAddress || leadData.email || "",
      companyName: leadData.companyName || leadData.company || "",
      projectName: leadData.projectName || "",
      workType: Array.isArray(leadData.workType)
        ? leadData.workType.join(", ")
        : (leadData.workType || ""),
      businessType: leadData.workCategory || leadData.businessType || "Information Technology",
      clientDesignation: leadData.clientDesignation || "Managing Director",
      expectedBusiness: Number(leadData.expectedBusiness || leadData.amount || leadData.budget || 50000),
      priority: (leadData.leadLabel || leadData.priority || "").toUpperCase() === "HOT" || (leadData.leadLabel || leadData.priority || "").toLowerCase() === "high"
        ? "high"
        : (leadData.leadLabel || leadData.priority || "").toUpperCase() === "WARM" || (leadData.leadLabel || leadData.priority || "").toLowerCase() === "medium"
        ? "medium"
        : "low",
      jobType: leadData.jobType || "NEW",
      city: leadData.city || "",
      state: leadData.state || "",
      pincode: leadData.pincode || "",
      address: leadData.address || leadData.siteAddress || "",
      requirement: leadData.requirement || "",
      requirementAttachments: existingReqAtts,
      transferRemark: initialRemark || leadData.remark || leadData.transferRemark || "",
      transferRemarkAttachments: existingRemarkAtts,
      clientRating: Number(leadData.clientRating || 4.5),
      projectCoordinatorName: leadData.projectCoordinatorName || leadData.nextPersonName || leadData.nextConcernPerson || "",
      nextPersonName: leadData.projectCoordinatorName || leadData.nextPersonName || leadData.nextConcernPerson || "",
      designation: leadData.designation || leadData.nextPersonDesignation || ""
    });
  };

  // Handle generic input change and clear field errors
  const handleInputChange = (field, value) => {
    // Prevent typing numbers in name and location text fields
    if (field === "clientName" || field === "projectCoordinatorName" || field === "nextPersonName" || field === "city" || field === "state") {
      value = value.replace(/[0-9]/g, "");
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle Pincode change and auto-fetch City & State
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({
      ...prev,
      pincode: val
    }));

    if (errors.pincode) {
      setErrors((prev) => ({ ...prev, pincode: "" }));
    }

    if (val.length === 6) {
      setIsFetchingPincode(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await response.json();

        if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
          const po = data[0].PostOffice[0];
          const apiDistrict = po.District || po.Block || po.Circle || "";
          const apiState = po.State || "";

          // Match state in indianStatesList
          const matchedState = indianStatesList?.find(
            (st) => st.toLowerCase() === apiState.toLowerCase() ||
                    (apiState.toLowerCase() === "delhi" && st === "Delhi NCR") ||
                    st.toLowerCase().includes(apiState.toLowerCase())
          ) || apiState;

          setFormData((prev) => ({
            ...prev,
            city: apiDistrict,
            state: matchedState
          }));

          setErrors((prev) => ({
            ...prev,
            city: "",
            state: "",
            pincode: ""
          }));
          toast.success(`Location detected: ${apiDistrict}, ${matchedState}`);
        } else {
          toast.info("Could not fetch city/state for this pincode. You can enter manually.");
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  // Form Validation logic
  const validateForm = () => {
    const newErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    } else if (/[0-9]/.test(formData.clientName)) {
      newErrors.clientName = "Numbers are not allowed in client name";
    }

    const coordVal = formData.projectCoordinatorName || formData.nextPersonName || "";
    if (coordVal && /[0-9]/.test(coordVal)) {
      newErrors.projectCoordinatorName = "Numbers are not allowed in project coordinator name";
    }

    if (formData.city && /[0-9]/.test(formData.city)) {
      newErrors.city = "Numbers are not allowed in city";
    }

    if (formData.state && /[0-9]/.test(formData.state)) {
      newErrors.state = "Numbers are not allowed in state";
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Primary phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Must start with 6, 7, 8, or 9 and be 10 digits";
    }

    if (formData.whatsappNumber && formData.whatsappNumber.trim() && !phoneRegex.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = "Must start with 6, 7, 8, or 9 and be 10 digits";
    }

    if (formData.alternateNumber && formData.alternateNumber.trim() && !phoneRegex.test(formData.alternateNumber.trim())) {
      newErrors.alternateNumber = "Must start with 6, 7, 8, or 9 and be 10 digits";
    }

    if (formData.emailAddress && formData.emailAddress.trim() && !/\S+@\S+\.\S+/.test(formData.emailAddress.trim())) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    if (formData.expectedBusiness === "" || Number(formData.expectedBusiness) < 0) {
      newErrors.expectedBusiness = "Expected Business amount must be a positive number";
    }

    if (formData.pincode && formData.pincode.trim() && !/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      const targetElement = document.getElementById(`field-${firstErrorKey}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        const inputEl = targetElement.querySelector("input, select, textarea");
        if (inputEl && typeof inputEl.focus === "function") {
          inputEl.focus();
        }
      }
      toast.error(newErrors[firstErrorKey]);
      return false;
    }

    return true;
  };

  const [editingProjectId, setEditingProjectId] = useState(
    location.state?.project?._id || location.state?.project?.id || null
  );

  useEffect(() => {
    // If an existing project was passed for editing
    if (location.state?.project) {
      const proj = location.state.project;
      setEditingProjectId(proj._id || proj.id || null);
      setFormData({
        clientName: proj.clientName || "",
        phoneNumber: proj.phoneNumber || "",
        alternateNumber: proj.alternateNumber || "",
        whatsappNumber: proj.whatsappNumber || proj.phoneNumber || "",
        emailAddress: proj.emailAddress || "",
        companyName: proj.companyName || "",
        projectName: proj.projectName || "",
        workType: Array.isArray(proj.workType)
          ? proj.workType.join(", ")
          : (proj.workType || (Array.isArray(location.state?.lead?.workType) ? location.state.lead.workType.join(", ") : location.state?.lead?.workType || "")),
        businessType: proj.businessType || "Information Technology",
        clientDesignation: proj.clientDesignation || "Managing Director",
        expectedBusiness: Number(proj.expectedBusiness || 50000),
        priority: proj.priority || "high",
        jobType: proj.jobType || "NEW",
        city: proj.city || "",
        state: proj.state || "",
        pincode: proj.pincode || "",
        address: proj.address || "",
        requirement: proj.requirement || "",
        transferRemark: proj.transferRemark || "",
        clientRating: Number(proj.clientRating || 4.5),
        projectCoordinatorName: proj.projectCoordinatorName || proj.nextPersonName || "",
        nextPersonName: proj.projectCoordinatorName || proj.nextPersonName || "",
        designation: proj.designation || ""
      });
      if (location.state?.lead) {
        setLead(location.state.lead);
      }
      return;
    }

    if (location.state?.lead) {
      setLead(location.state.lead);
      populateFormData(location.state.lead, location.state.initialRemark || "");
      return;
    }

    if (id) {
      const fetchLeadDetails = async () => {
        setLoading(true);
        try {
          const res = await getLeadByIdApi(id);
          if (res && res.success && res.data) {
            const fetched = res.data.lead || res.data;
            setLead(fetched);
            populateFormData(fetched);
          } else {
            toast.error("Could not load lead information from server.");
          }
        } catch (err) {
          console.error("Error fetching lead:", err);
          toast.error("Failed to load lead details.");
        } finally {
          setLoading(false);
        }
      };
      fetchLeadDetails();
    }
  }, [id, location.state]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting) return;
    if (isUserObserver) {
      toast.info("Observer Mode: Sales Form submission is disabled.");
      return;
    }
    
    // Validate inputs
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const targetId = lead?._id || lead?.id || lead?.leadId || id;
    const formattedDate = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const finalWorkType = formData.workType
      ? (typeof formData.workType === "string" ? formData.workType.split(",").map((s) => s.trim()).filter(Boolean) : formData.workType)
      : (lead?.workType || []);

    const finalLeadData = {
      ...(lead || {}),
      clientName: formData.clientName,
      concernPersonName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      phone: formData.phoneNumber,
      alternateNumber: formData.alternateNumber,
      whatsappNumber: formData.whatsappNumber,
      emailAddress: formData.emailAddress,
      email: formData.emailAddress,
      companyName: formData.companyName,
      projectName: formData.projectName,
      workType: finalWorkType,
      businessType: formData.businessType,
      workCategory: formData.businessType,
      clientDesignation: formData.clientDesignation,
      amount: Number(formData.expectedBusiness) || 0,
      expectedBusiness: Number(formData.expectedBusiness) || 0,
      budget: Number(formData.expectedBusiness) || 0,
      priority: formData.priority,
      status: "INTERESTED",
      leadStatus: "INTERESTED",
      isInterested: true,
      isLoss: false,
      jobType: formData.jobType,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      address: formData.address,
      requirement: formData.requirement,
      requirementAttachments: formData.requirementAttachments || [],
      remark: formData.transferRemark || lead?.remark || "",
      remarks: formData.transferRemark || lead?.remarks || "",
      transferRemark: formData.transferRemark || "",
      remarkAttachments: formData.transferRemarkAttachments || [],
      attachments: formData.transferRemarkAttachments || [],
      remarksFiles: formData.transferRemarkAttachments || [],
      clientRating: Number(formData.clientRating) || 4.5,
      projectCoordinatorName: formData.projectCoordinatorName || formData.nextPersonName || "",
      nextPersonName: formData.projectCoordinatorName || formData.nextPersonName || "",
      designation: formData.designation,
      nextPersonDesignation: formData.designation,
      createdAt: lead?.createdDate || lead?.createdAt || formattedDate,
      createdTime: lead?.createdTime || formattedTime,
      clientId: lead?.clientId || lead?.leadId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: lead?.leadId || lead?.clientId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      inSalesManagement: true,
      isSalesTransferred: true,
      movedToSalesManagementDate: new Date(),
      updatedAt: new Date().toISOString()
    };

    // Upload any newly recorded audio or attached media files
    const rawUploadFiles = [
      ...(formData.transferRemarkAttachments || []),
      ...(formData.requirementAttachments || [])
    ]
      .map((att) => att.file || att.blob || (att instanceof File || att instanceof Blob ? att : null))
      .filter(Boolean);

    if (rawUploadFiles.length > 0 && targetId) {
      try {
        await updateLeadApi(targetId, finalLeadData, rawUploadFiles);
      } catch (upErr) {
        console.error("Error uploading files to lead:", upErr);
      }
    }

      // Save project data ONLY to leadsproject collection with Lead ObjectId reference
      const leadMongoId = lead?._id || (targetId && String(targetId).length === 24 ? targetId : finalLeadData._id || finalLeadData.leadId || id);
      const projectPayload = {
        ...formData,
        leadId: leadMongoId,
        projectId: editingProjectId || undefined,
        workType: finalWorkType,
        expectedBusiness: Number(formData.expectedBusiness) || 0,
        clientRating: Number(formData.clientRating) || 4.5
      };

      // Strip non-schema attachment fields before sending JSON to backend
      delete projectPayload.requirementAttachments;
      delete projectPayload.transferRemarkAttachments;

      const saveRes = await createLeadProjectApi(projectPayload);
      if (saveRes && saveRes.success === false) {
        toast.error(saveRes.message || "Failed to save project records.");
        setSubmitting(false);
        return;
      }

    // Invalidate caches & notify
    invalidateCache("sales_management_sheet");
    invalidateCache("sales_management_sheet_all");
    invalidateCache("leadManagement");

    markLeadAsTransferredToSales(targetId);
    updateLeadInStorage(finalLeadData);
    notifyLeadChange(finalLeadData);

    const successMsg = editingProjectId
      ? `Project updated for ${finalLeadData.clientName}! 🚀`
      : `New project added for ${finalLeadData.clientName}! 🚀`;
    toast.success(successMsg);

    // If opened from Lead Details page, return back to Lead Details page so user sees their new project record
    if (location.state?.returnToLeadDetails) {
      navigate(`/sales/leads/details/${targetId}`, {
        state: { lead: finalLeadData, from: "salesManagement" }
      });
    } else {
      navigate("/sales/management-sheet", { state: { lead: finalLeadData } });
    }
  } catch (err) {
    console.error("Error submitting sales form:", err);
    toast.error("Failed to update sales sheet. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  const handleSkipToSalesSheet = () => {
    if (location.state?.returnToLeadDetails) {
      const targetId = lead?._id || lead?.id || lead?.leadId || id;
      navigate(`/sales/leads/details/${targetId}`, {
        state: { lead: lead || undefined, from: "salesManagement" }
      });
    } else {
      navigate("/sales/management-sheet", { state: { lead: lead || undefined } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-sans">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Lead Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-12">
      
      {/* STICKY TOP HEADER BANNER CARD (Styled like AddLead) */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Sales Management Sheet Form"
          badge="INTERESTED LEAD"
          badgeColor="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold"
          description="Review and complete detailed client information for Sales Management follow-up."
          showBackButton={true}
          rightActions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkipToSalesSheet}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <FaTable className="text-slate-500 text-xs" />
                <span>Go to Sales Sheet</span>
              </button>
              <button
                type="button"
                onClick={isUserObserver ? () => toast.info("Observer Mode: Action is disabled.") : handleSubmit}
                disabled={submitting || isUserObserver}
                className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 ${
                  isUserObserver
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
                }`}
                title={isUserObserver ? "Disabled for Observer" : "Save & Proceed"}
              >
                {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaSave className="text-xs" />}
                <span>Save & Proceed</span>
              </button>
            </div>
          }
        />
      </div>

      {/* MAIN UNIFIED FORM CARD (Matches AddLead and CRM standard style) */}
      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-2xl shadow-2xs px-3.5 sm:px-6 py-5 space-y-3.5">
        
        {/* ROW 1: Client Name | Primary Phone Number | WhatsApp / Alternate Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3">
          <div id="field-clientName">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              placeholder="Enter Client Name"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.clientName ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.clientName && <p className="text-xs text-red-500 font-medium mt-1">{errors.clientName}</p>}
          </div>

          <div id="field-phoneNumber">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Primary Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter 10-digit Phone Number"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.phoneNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.phoneNumber}</p>}
          </div>

          <div id="field-whatsappNumber">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              WhatsApp / Alternate Number
            </label>
            <input
              type="tel"
              maxLength={10}
              value={formData.whatsappNumber}
              onChange={(e) => handleInputChange("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter WhatsApp / Alternate Number"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.whatsappNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.whatsappNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.whatsappNumber}</p>}
          </div>
        </div>

        {/* ROW 2: Email Address | Client Designation | Client Rating */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div id="field-emailAddress">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={formData.emailAddress}
              onChange={(e) => handleInputChange("emailAddress", e.target.value)}
              placeholder="Enter Email Address"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.emailAddress ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.emailAddress && <p className="text-xs text-red-500 font-medium mt-1">{errors.emailAddress}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Client Designation / Role
            </label>
            <input
              type="text"
              value={formData.clientDesignation}
              onChange={(e) => handleInputChange("clientDesignation", e.target.value)}
              placeholder="e.g. Managing Director, Owner"
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Client Rating
            </label>
            <select
              value={formData.clientRating}
              onChange={(e) => handleInputChange("clientRating", parseFloat(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
            >
              <option value={5}>5.0 ★ (Highest Potential)</option>
              <option value={4.5}>4.5 ★ (Very High Potential)</option>
              <option value={4}>4.0 ★ (High Potential)</option>
              <option value={3.5}>3.5 ★ (Medium)</option>
              <option value={3}>3.0 ★ (Average)</option>
            </select>
          </div>
        </div>

        {/* ROW 3: Company Name | Work Type | Work Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => handleInputChange("companyName", e.target.value)}
              placeholder="Enter Company Name"
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Work Type
            </label>
            <input
              type="text"
              value={formData.workType}
              onChange={(e) => handleInputChange("workType", e.target.value)}
              placeholder="e.g. Concept Drawing, Elevation Drawing"
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Work Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.businessType}
              onChange={(e) => handleInputChange("businessType", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
            >
              {workCategoryList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ROW 4: Expected Business | Lead Priority | Job Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div id="field-expectedBusiness">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Expected Business (₹ Amount) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min={0}
              value={formData.expectedBusiness}
              onChange={(e) => handleInputChange("expectedBusiness", e.target.value)}
              placeholder="Enter Amount (₹)"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-emerald-700 text-xs sm:text-sm font-bold font-mono focus:outline-none transition-all ${
                errors.expectedBusiness ? "border-red-500 bg-red-50/20 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.expectedBusiness && <p className="text-xs text-red-500 font-medium mt-1">{errors.expectedBusiness}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Lead Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange("priority", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Job Type
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => handleInputChange("jobType", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
            >
              <option value="NEW">NEW Client / Job</option>
              <option value="OLD">OLD / Repeat Client</option>
            </select>
          </div>
        </div>

        {/* ROW 5: Assigned To Project Coordinator Name | Project Coordinator Designation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div id="field-projectCoordinatorName">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Assigned To Project Coordinator Name
            </label>
            <input
              type="text"
              value={formData.projectCoordinatorName || formData.nextPersonName || ""}
              onChange={(e) => {
                handleInputChange("projectCoordinatorName", e.target.value);
                handleInputChange("nextPersonName", e.target.value);
              }}
              placeholder="Enter Project Coordinator Name"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.projectCoordinatorName || errors.nextPersonName
                  ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500"
                  : "border-black/20 focus:border-black/50"
              }`}
            />
            {(errors.projectCoordinatorName || errors.nextPersonName) && (
              <p className="text-xs text-red-500 font-medium mt-1">
                {errors.projectCoordinatorName || errors.nextPersonName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Project Coordinator Designation
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => handleInputChange("designation", e.target.value)}
              placeholder="e.g. Project Manager, Site Engineer"
              className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ROW 6: Pincode | City | State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div id="field-pincode">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1 flex items-center justify-between">
              <span>Pincode</span>
              {isFetchingPincode && (
                <span className="text-[11px] text-blue-600 animate-pulse font-normal flex items-center gap-1">
                  <FaSpinner className="animate-spin text-[10px]" /> Auto-fetching City & State...
                </span>
              )}
            </label>
            <input
              type="text"
              maxLength={6}
              value={formData.pincode}
              onChange={handlePincodeChange}
              placeholder="Enter 6-digit Pincode"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.pincode ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.pincode && <p className="text-xs text-red-500 font-medium mt-1">{errors.pincode}</p>}
          </div>

          <div id="field-city">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              placeholder="Enter City"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.city ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium mt-1">{errors.city}</p>}
          </div>

          <div id="field-state">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleInputChange("state", e.target.value)}
              placeholder="Enter or select State"
              className={`w-full px-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                errors.state ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.state && <p className="text-xs text-red-500 font-medium mt-1">{errors.state}</p>}
          </div>
        </div>

        {/* ROW: Project Name (Full Width Input above Site / Office Address) */}
        <div id="field-projectName" className="pt-0.5">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Project Name
          </label>
          <input
            type="text"
            value={formData.projectName}
            onChange={(e) => handleInputChange("projectName", e.target.value)}
            placeholder="Enter Project Name"
            className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* ROW: Complete Site / Office Address */}
        <div id="field-address" className="pt-0.5">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Complete Site / Office Address
          </label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="Enter complete plot/site address, landmarks..."
            className="w-full px-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* ROW 8: Requirement Details & Sales Remarks with Media / Audio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3 pt-0.5">
          <div>
            <CommentWithMedia
              title="Client Requirement Details"
              placeholder="Detail out client's specific demands, specifications, or record audio note..."
              value={formData.requirement}
              onChange={(val) => setFormData((prev) => ({ ...prev, requirement: val }))}
              files={formData.requirementAttachments || []}
              onFilesChange={(newFiles) => setFormData((prev) => ({ ...prev, requirementAttachments: newFiles }))}
            />
          </div>

          <div>
            <CommentWithMedia
              title="Sales Management Notes / Remarks"
              placeholder="Add key highlights or instructions for the sales team, or record audio note..."
              value={formData.transferRemark}
              onChange={(val) => setFormData((prev) => ({ ...prev, transferRemark: val }))}
              files={formData.transferRemarkAttachments || []}
              onFilesChange={(newFiles) => setFormData((prev) => ({ ...prev, transferRemarkAttachments: newFiles }))}
            />
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSkipToSalesSheet}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
          >
            <FaTable className="text-slate-500 text-xs" />
            <span>Go to Sales Management Sheet Without Changes</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/sales/leads/all")}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting || isUserObserver}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 ${
                isUserObserver
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer disabled:opacity-50"
              }`}
              title={isUserObserver ? "Disabled for Observer" : "Save & View in Sales Management Sheet"}
            >
              {submitting ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
              <span>Save & View in Sales Management Sheet</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

export default SalesLeadForm;
