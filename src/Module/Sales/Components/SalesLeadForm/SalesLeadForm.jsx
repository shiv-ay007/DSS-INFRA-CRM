import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  FaUser,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaBriefcase,
  FaStar,
  FaBuilding,
  FaLayerGroup,
  FaRupeeSign,
  FaFlag,
  FaTag,
  FaUserTie,
  FaCity,
  FaMapMarkedAlt,
  FaMapPin,
  FaHome,
  FaClipboardList,
  FaCommentDots,
  FaCheck,
  FaTable,
  FaSpinner,
  FaSave,
  FaArrowLeft,
  FaCheckCircle
} from "react-icons/fa";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
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

const teamMembers = [
  "Admin",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta"
];

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
    transferRemark: "",
    clientRating: 4.5,
    assignedTo: "Admin",
    nextPersonName: "",
    designation: ""
  });

  // Populate form data whenever lead is resolved
  const populateFormData = (leadData, initialRemark = "") => {
    if (!leadData) return;
    setFormData({
      clientName: leadData.concernPersonName || leadData.clientName || "",
      phoneNumber: leadData.phoneNumber || leadData.contact || leadData.phone || "",
      alternateNumber: leadData.alternateNumber || "",
      whatsappNumber: leadData.whatsappNumber || leadData.phoneNumber || leadData.phone || "",
      emailAddress: leadData.emailAddress || leadData.email || "",
      companyName: leadData.companyName || leadData.company || "",
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
      transferRemark: initialRemark || leadData.remark || leadData.transferRemark || "",
      clientRating: Number(leadData.clientRating || 4.5),
      assignedTo: leadData.assignTo || leadData.salesPerson || leadData.assignedTo || "Admin",
      nextPersonName: leadData.nextPersonName || leadData.nextConcernPerson || "",
      designation: leadData.designation || leadData.nextPersonDesignation || ""
    });
  };

  // Handle generic input change and clear field errors
  const handleInputChange = (field, value) => {
    // Prevent typing numbers in name and location text fields
    if (field === "clientName" || field === "nextPersonName" || field === "city" || field === "state") {
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

    if (formData.nextPersonName && /[0-9]/.test(formData.nextPersonName)) {
      newErrors.nextPersonName = "Numbers are not allowed in next person name";
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
        assignedTo: proj.assignedTo || "Admin",
        nextPersonName: proj.nextPersonName || "",
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
      businessType: formData.businessType,
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
      remark: formData.transferRemark || lead?.remark || "",
      clientRating: Number(formData.clientRating) || 4.5,
      assignTo: formData.assignedTo,
      salesPerson: formData.assignedTo,
      nextPersonName: formData.nextPersonName,
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

      // Save project data ONLY to leadsproject collection with Lead ObjectId reference
      try {
        const leadMongoId = lead?._id || (targetId && String(targetId).length === 24 ? targetId : finalLeadData._id || finalLeadData.leadId);
        await createLeadProjectApi({
          ...formData,
          leadId: leadMongoId,
          projectId: editingProjectId || undefined
        });
      } catch (saveErr) {
        console.error("Error saving to leadsproject collection:", saveErr);
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

      {/* LEAD QUICK INFO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shadow-inner">
            <FaUser />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white">
                {formData.clientName || "Lead Client"}
              </h2>
              {lead?.leadId && (
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs font-mono font-semibold text-slate-300">
                  {lead.leadId}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs sm:text-sm text-slate-300">
              {formData.phoneNumber && (
                <span className="flex items-center gap-1.5">
                  <FaPhoneAlt className="text-emerald-400 text-xs" />
                  <span className="font-mono">{formData.phoneNumber}</span>
                </span>
              )}
              {formData.emailAddress && (
                <span className="flex items-center gap-1.5">
                  <FaEnvelope className="text-blue-400 text-xs" />
                  <span>{formData.emailAddress}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 text-right">
            <span className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Expected Business</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
              ₹ {Number(formData.expectedBusiness || 0).toLocaleString("en-IN")}
            </span>
          </div>
          <div className="bg-emerald-500/20 px-3.5 py-2 rounded-xl border border-emerald-400/30 text-center">
            <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Status</span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300">INTERESTED</span>
          </div>
        </div>
      </div>

      {/* MAIN FORM CARD (Styled like AddLead form) */}
      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-2xl shadow-2xs px-3.5 sm:px-6 py-5 space-y-6">
        
        {/* SECTION 1: CLIENT INFORMATION */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900 font-bold text-sm sm:text-base">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <FaUser />
            </div>
            <span>Client & Contact Information</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3">
            <div id="field-clientName">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Client Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaUser />
                </span>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => handleInputChange("clientName", e.target.value)}
                  placeholder="Enter Client Name"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.clientName ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.clientName && <p className="text-xs text-red-500 font-medium mt-1">{errors.clientName}</p>}
            </div>

            <div id="field-phoneNumber">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Primary Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaPhoneAlt />
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter 10-digit Phone Number"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.phoneNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.phoneNumber}</p>}
            </div>

            <div id="field-whatsappNumber">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                WhatsApp / Alternate Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">
                  <FaWhatsapp />
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange("whatsappNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="Enter WhatsApp / Alternate Number"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.whatsappNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.whatsappNumber && <p className="text-xs text-red-500 font-medium mt-1">{errors.whatsappNumber}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-1">
            <div id="field-emailAddress">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                  placeholder="Enter Email Address"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.emailAddress ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.emailAddress && <p className="text-xs text-red-500 font-medium mt-1">{errors.emailAddress}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Client Designation / Role
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaBriefcase />
                </span>
                <input
                  type="text"
                  value={formData.clientDesignation}
                  onChange={(e) => handleInputChange("clientDesignation", e.target.value)}
                  placeholder="e.g. Managing Director, Owner"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Client Rating
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xs sm:text-sm">
                  <FaStar />
                </span>
                <select
                  value={formData.clientRating}
                  onChange={(e) => handleInputChange("clientRating", parseFloat(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  <option value={5}>5.0 ★ (Highest Potential)</option>
                  <option value={4.5}>4.5 ★ (Very High Potential)</option>
                  <option value={4}>4.0 ★ (High Potential)</option>
                  <option value={3.5}>3.5 ★ (Medium)</option>
                  <option value={3}>3.0 ★ (Average)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: COMPANY & DEAL FINANCIALS */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900 font-bold text-sm sm:text-base">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <FaBuilding />
            </div>
            <span>Company & Deal Financials</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Company Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaBuilding />
                </span>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Enter Company Name"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Work Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaLayerGroup />
                </span>
                <select
                  value={formData.businessType}
                  onChange={(e) => handleInputChange("businessType", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  {workCategoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div id="field-expectedBusiness">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Expected Business (₹ Amount) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-sm">
                  <FaRupeeSign />
                </span>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.expectedBusiness}
                  onChange={(e) => handleInputChange("expectedBusiness", e.target.value)}
                  placeholder="Enter Amount (₹)"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-emerald-700 text-xs sm:text-sm font-bold font-mono focus:outline-none transition-all ${
                    errors.expectedBusiness ? "border-red-500 bg-red-50/20 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.expectedBusiness && <p className="text-xs text-red-500 font-medium mt-1">{errors.expectedBusiness}</p>}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Lead Priority
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xs sm:text-sm">
                  <FaFlag />
                </span>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange("priority", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-1">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Job Type
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 text-xs sm:text-sm">
                  <FaTag />
                </span>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange("jobType", e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  <option value="NEW">NEW Client / Job</option>
                  <option value="OLD">OLD / Repeat Client</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Next Person Name
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaUser />
                </span>
                <input
                  type="text"
                  value={formData.nextPersonName}
                  onChange={(e) => handleInputChange("nextPersonName", e.target.value)}
                  placeholder="Enter Next Person Name"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Designation
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaBriefcase />
                </span>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  placeholder="e.g. Project Manager, Site Engineer"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: LOCATION & SITE ADDRESS */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900 font-bold text-sm sm:text-base">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs">
              <FaCity />
            </div>
            <span>Location & Site Address</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3">
            {/* PINCODE FIELD (FIRST FOR AUTO-FETCH) */}
            <div id="field-pincode">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1 flex items-center justify-between">
                <span>Pincode</span>
                {isFetchingPincode && (
                  <span className="text-[11px] text-blue-600 animate-pulse font-normal flex items-center gap-1">
                    <FaSpinner className="animate-spin text-[10px]" /> Auto-fetching City & State...
                  </span>
                )}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaMapPin />
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handlePincodeChange}
                  placeholder="Enter 6-digit Pincode"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.pincode ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.pincode && <p className="text-xs text-red-500 font-medium mt-1">{errors.pincode}</p>}
            </div>

            {/* CITY (AUTO-FETCHED OR MANUAL) */}
            <div id="field-city">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                City
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaCity />
                </span>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter City"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.city ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.city && <p className="text-xs text-red-500 font-medium mt-1">{errors.city}</p>}
            </div>

            {/* STATE (AUTO-FETCHED OR SELECT) */}
            <div id="field-state">
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                State
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaMapMarkedAlt />
                </span>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter or select State"
                  className={`w-full pl-9 pr-3 py-2 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 ${
                    errors.state ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
                  }`}
                />
              </div>
              {errors.state && <p className="text-xs text-red-500 font-medium mt-1">{errors.state}</p>}
            </div>
          </div>

          <div id="field-address">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Complete Site / Office Address
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 text-xs sm:text-sm">
                <FaHome />
              </span>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete plot/site address, landmarks..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 resize-y"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: REQUIREMENT & REMARKS */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-200 text-slate-900 font-bold text-sm sm:text-base">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              <FaClipboardList />
            </div>
            <span>Requirement Details & Sales Management Notes</span>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Client Requirement Details
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 text-xs sm:text-sm">
                <FaClipboardList />
              </span>
              <textarea
                rows={3}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                placeholder="Detail out client's specific demands, specifications, site area, timelines..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 resize-y"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
              Sales Management Notes / Remarks
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-slate-400 text-xs sm:text-sm">
                <FaCommentDots />
              </span>
              <textarea
                rows={2}
                value={formData.transferRemark}
                onChange={(e) => setFormData({ ...formData, transferRemark: e.target.value })}
                placeholder="Add key highlights or instructions for the sales team..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400 resize-y"
              />
            </div>
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
