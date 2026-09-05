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
  FaArrowLeft
} from "react-icons/fa";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import { workCategoryList } from "../../data/addLeadData";
import { getLeadByIdApi, updateLeadApi } from "../../../../services/totalLeads.api";
import { updateLeadInStorage, notifyLeadChange, markLeadAsTransferredToSales } from "../../utils/leadStorageUtils";
import { useLeadContext } from "../../../../context/LeadContext";

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

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState(location.state?.lead || null);

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
    assignedTo: "Admin"
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
      assignedTo: leadData.assignTo || leadData.salesPerson || leadData.assignedTo || "Admin"
    });
  };

  useEffect(() => {
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
    if (!formData.clientName.trim()) {
      toast.error("Client Name is required!");
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast.error("Primary Phone Number is required!");
      return;
    }

    setSubmitting(true);
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
      createdAt: lead?.createdDate || lead?.createdAt || formattedDate,
      createdTime: lead?.createdTime || formattedTime,
      clientId: lead?.clientId || lead?.leadId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: lead?.leadId || lead?.clientId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      inSalesManagement: true,
      isSalesTransferred: true,
      movedToSalesManagementDate: new Date(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (targetId) {
        await updateLeadApi(targetId, {
          status: "INTERESTED",
          leadStatus: "INTERESTED",
          isInterested: true,
          inSalesManagement: true,
          isSalesTransferred: true,
          isLoss: false,
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
          movedToSalesManagementDate: new Date()
        });
      }
    } catch (err) {
      console.error("Error updating lead in API:", err);
    }

    // Invalidate caches & notify
    invalidateCache("sales_management_sheet");
    invalidateCache("sales_management_sheet_all");
    invalidateCache("leadManagement");

    markLeadAsTransferredToSales(targetId);
    updateLeadInStorage(finalLeadData);
    notifyLeadChange(finalLeadData);

    setSubmitting(false);
    toast.success(`Sales Management Sheet updated for ${finalLeadData.clientName}! 🚀`);
    navigate("/sales/management-sheet", { state: { lead: finalLeadData } });
  };

  const handleSkipToSalesSheet = () => {
    navigate("/sales/management-sheet", { state: { lead: lead || undefined } });
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
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            <div>
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
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Enter Client Name"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
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
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter 10-digit Phone Number"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
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
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter WhatsApp / Alternate Number"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-3 sm:gap-x-4 gap-y-3 pt-1">
            <div>
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
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="Enter Email Address"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
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
                  onChange={(e) => setFormData({ ...formData, clientDesignation: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, clientRating: parseFloat(e.target.value) })}
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
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
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

            <div>
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
                  onChange={(e) => setFormData({ ...formData, expectedBusiness: e.target.value })}
                  placeholder="Enter Amount (₹)"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-emerald-700 text-xs sm:text-sm font-bold font-mono focus:outline-none transition-all"
                />
              </div>
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
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 sm:gap-x-4 gap-y-3 pt-1">
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
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  <option value="NEW">NEW Client / Job</option>
                  <option value="OLD">OLD / Repeat Client</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Assigned Sales Executive
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaUserTie />
                </span>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all cursor-pointer"
                >
                  {teamMembers.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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
            <div>
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
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Enter City"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
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
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Enter State"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
                Pincode
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs sm:text-sm">
                  <FaMapPin />
                </span>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/20 focus:border-black/50 bg-white text-slate-800 text-xs sm:text-sm font-medium font-mono focus:outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          <div>
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
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
