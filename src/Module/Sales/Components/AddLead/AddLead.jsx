import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import {
  salesPersonsList,
  leadSourcesList,
  channelsList,
  leadTypesList,
  jobTypesList,
  clientTypesList,
  leadLabelsList,
  indianStatesList,
  availableWorkTypes
} from "../../data/addLeadData";

const Addlead = () => {
  const navigate = useNavigate();

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Initial Form State (All 22 fields included)
  const initialFormState = {
    date: getTodayDate(),
    leadSource: "",
    channel: "Sales",
    leadType: "FRESH",
    jobType: "NEW",
    clientType: "Individual",
    clientName: "",
    clientDesignation: "",
    leadLabel: "",
    phoneNumber: "",
    alternateNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    pincode: "",
    city: "",
    state: "",
    expectedBusiness: "",
    googleLocation: "",
    salesPerson: "Sales TL (Current User)",
    workType: [],
    address: "",
    requirement: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle Input & Select Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Auto sync WhatsApp number with Phone number if WhatsApp is empty
    if (name === "phoneNumber" && !formData.whatsappNumber) {
      setFormData((prev) => ({ ...prev, whatsappNumber: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Toggle Work Types
  const toggleWorkType = (type) => {
    setFormData((prev) => {
      const exists = prev.workType.includes(type);
      const updated = exists
        ? prev.workType.filter((item) => item !== type)
        : [...prev.workType, type];
      return { ...prev, workType: updated };
    });
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.leadSource) newErrors.leadSource = "Please select lead source";
    if (!formData.channel) newErrors.channel = "Please select channel";
    if (!formData.leadType) newErrors.leadType = "Please select lead type";
    if (!formData.jobType) newErrors.jobType = "Please select job type";
    if (!formData.clientType) newErrors.clientType = "Please select client type";

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    if (!formData.clientDesignation.trim()) {
      newErrors.clientDesignation = "Client designation is required";
    }

    if (!formData.leadLabel) newErrors.leadLabel = "Please select lead label";

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter valid 10-digit phone number";
    }

    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = "WhatsApp number is required";
    } else if (!phoneRegex.test(formData.whatsappNumber.trim())) {
      newErrors.whatsappNumber = "Please enter valid 10-digit WhatsApp number";
    }

    if (formData.alternateNumber.trim() && !phoneRegex.test(formData.alternateNumber.trim())) {
      newErrors.alternateNumber = "Alternate number must be 10 digits";
    }

    // Pincode validation
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "Please select state";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submit & Save to LocalStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date();
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-GB', options);

      const newLead = {
        id: `LM-${Math.floor(100000 + Math.random() * 900000)}`,
        concernPersonName: formData.clientName,
        phoneNumber: formData.phoneNumber,
        alternateNumber: formData.alternateNumber,
        whatsappNumber: formData.whatsappNumber,
        emailAddress: formData.emailAddress,
        status: "NEW",
        nextFollowupDate: formattedDate,
        nextFollowupDateRaw: formData.date || today.toISOString().split("T")[0],
        nextFollowupTime: "11:00 am",
        channelType: formData.channel,
        followupRemarksCount: 0,
        followupHistory: [],
        createdDate: formattedDate,
        createdTime: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        leadAge: "0 Days",
        leadLabel: formData.leadLabel,
        leadType: formData.leadType,
        jobType: formData.jobType,
        clientType: formData.clientType,
        workType: formData.workType,
        requirement: formData.requirement || "New Lead Registration",
        expectedBusiness: formData.expectedBusiness || "0",
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        leadSource: formData.leadSource,
        leadBy: formData.salesPerson,
        assignTo: formData.salesPerson,
        address: formData.address || `${formData.city}, ${formData.state} - ${formData.pincode}`,
        clientDesignation: formData.clientDesignation,
        googleLocation: formData.googleLocation
      };

      try {
        const saved = localStorage.getItem("dss_lead_management_sheet_v1");
        const currentLeads = saved ? JSON.parse(saved) : [];
        const updatedLeads = [newLead, ...currentLeads];
        localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(updatedLeads));
      } catch (err) {
        console.error("Failed to save lead to localStorage", err);
      }

      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 500);
  };

  // Reset Form
  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans select-none pb-12">
      
      {/* 1. TOP HEADER BANNER CARD */}
      <PageHeader
        title="!! Capture New Lead !!"
        showBackButton={true}
      />

      {/* 2. MAIN FORM CARD (Border removed, compact side padding & side gaps) */}
      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-2xl shadow-2xs px-2.5 sm:px-4 py-5 space-y-3.5">
        
        {/* 3-COLUMN GRID LAYOUT (Reduced side gaps, bottom spacing preserved) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3">
          
          {/* ROW 1: Lead Source | Channel | Lead Type */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Source <span className="text-red-500">*</span>
            </label>
            <select
              name="leadSource"
              value={formData.leadSource}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadSource ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select Lead Source</option>
              {leadSourcesList.map((source) => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
            {errors.leadSource && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadSource}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Channel <span className="text-red-500">*</span>
            </label>
            <select
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.channel ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              {channelsList.map((ch) => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
            {errors.channel && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.channel}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leadType"
              value={formData.leadType}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadType ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              {leadTypesList.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.leadType && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadType}</p>}
          </div>

          {/* ROW 2: Job Type | Client Type | Client Name */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Job Type <span className="text-red-500">*</span>
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.jobType ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              {jobTypesList.map((job) => (
                <option key={job} value={job}>{job}</option>
              ))}
            </select>
            {errors.jobType && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.jobType}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Client Type <span className="text-red-500">*</span>
            </label>
            <select
              name="clientType"
              value={formData.clientType}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.clientType ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              {clientTypesList.map((ct) => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
            {errors.clientType && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.clientType}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="Enter Client Name"
              value={formData.clientName}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.clientName ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.clientName && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.clientName}</p>}
          </div>

          {/* ROW 3: Client Designation | Lead Label | Phone Number */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Client Designation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientDesignation"
              placeholder="Enter Client Designation"
              value={formData.clientDesignation}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.clientDesignation ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.clientDesignation && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.clientDesignation}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Label <span className="text-red-500">*</span>
            </label>
            <select
              name="leadLabel"
              value={formData.leadLabel}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadLabel ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select Lead Label</option>
              {leadLabelsList.map((label) => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            {errors.leadLabel && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadLabel}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              maxLength={10}
              placeholder="Enter 10-digit Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "phoneNumber", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.phoneNumber ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.phoneNumber}</p>}
          </div>

          {/* ROW 4: Alternate Number | WhatsApp Number | Email Address */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Alternate Number
            </label>
            <input
              type="tel"
              name="alternateNumber"
              maxLength={10}
              placeholder="Enter Alternate Number"
              value={formData.alternateNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "alternateNumber", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.alternateNumber ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.alternateNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.alternateNumber}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              maxLength={10}
              placeholder="Enter WhatsApp Number"
              value={formData.whatsappNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "whatsappNumber", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.whatsappNumber ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.whatsappNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.whatsappNumber}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Email Address
            </label>
            <input
              type="email"
              name="emailAddress"
              placeholder="Enter Email Address"
              value={formData.emailAddress}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* ROW 5: Pincode | City | State */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={formData.pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "pincode", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.pincode ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.pincode && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="Enter City"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.city ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.state ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select State</option>
              {indianStatesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.state}</p>}
          </div>

          {/* ROW 6: Expected Business Amount | Google Location | Lead Date */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Expected Business Amount (₹)
            </label>
            <input
              type="number"
              name="expectedBusiness"
              placeholder="Enter Expected Business Amount"
              value={formData.expectedBusiness}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Google Location
            </label>
            <input
              type="text"
              name="googleLocation"
              placeholder="Enter Google Location"
              value={formData.googleLocation}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer"
            />
          </div>

          {/* ROW 7: Sales Person */}
          <div className="md:col-span-3">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Sales Person / Assign To
            </label>
            <select
              name="salesPerson"
              value={formData.salesPerson}
              onChange={handleChange}
              className="w-full md:w-1/3 px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer"
            >
              {salesPersonsList.map((person) => (
                <option key={person} value={person}>{person}</option>
              ))}
            </select>
          </div>

        </div>

        {/* WORK TYPE / CATEGORIES PILLS */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Work Type / Categories <span className="text-slate-500 font-normal">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {availableWorkTypes.map((type) => {
              const isSelected = formData.workType.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleWorkType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-black/20"
                  }`}
                >
                  <span>{type}</span>
                  {isSelected ? "✓" : "+"}
                </button>
              );
            })}
          </div>
        </div>

        {/* SITE / CLIENT ADDRESS TEXTAREA */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
            Site / Client Address
          </label>
          <textarea
            rows={2}
            name="address"
            placeholder="Enter Site / Client Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* REQUIREMENT DETAILS TEXTAREA */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
            Requirement Details / Remarks
          </label>
          <textarea
            rows={2}
            name="requirement"
            placeholder="Enter Requirement Details"
            value={formData.requirement}
            onChange={handleChange}
            className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Submitting Lead...</span>
              </>
            ) : (
              <span>Submit & Create Lead</span>
            )}
          </button>
        </div>

      </form>

      {/* SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full text-center shadow-xl border border-slate-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Lead Captured Successfully!
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Lead for <strong className="text-slate-900">{formData.clientName}</strong> has been registered and saved to your pipeline.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                + Add Another Lead
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/sales/leads");
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Go to Lead Sheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Addlead;