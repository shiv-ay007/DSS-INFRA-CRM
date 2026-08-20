import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { salesPersonsList, leadModesList, availableWorkTypes } from "../../data/addLeadData";

const Addlead = () => {
  const navigate = useNavigate();

  // Today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    salesPerson: "Sales TL (Current User)",
    leadMode: "",
    clientName: "",
    contactNo: "",
    alternateNo: "",
    projectDetails: "",
    workType: [], // Multi-select array
    expectedRevenue: "",
    city: "",
    address: "",
    leadStatus: "New" // Auto fixed
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle Multi-Select Work Types
  const toggleWorkType = (type) => {
    setFormData((prev) => {
      const exists = prev.workType.includes(type);
      const updated = exists
        ? prev.workType.filter((item) => item !== type)
        : [...prev.workType, type];
      return { ...prev, workType: updated };
    });

    if (errors.workType) {
      setErrors((prev) => ({ ...prev, workType: "" }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.salesPerson) newErrors.salesPerson = "Sales person is required.";
    if (!formData.leadMode) newErrors.leadMode = "Please select lead mode.";

    // Client Name
    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client / Company name is required.";
    } else if (formData.clientName.trim().length < 2) {
      newErrors.clientName = "Name must be at least 2 characters.";
    }

    // Contact No (Exact 10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required.";
    } else if (!/^\d{10}$/.test(formData.contactNo.trim())) {
      newErrors.contactNo = "Contact must be exactly 10 numeric digits.";
    } else if (!phoneRegex.test(formData.contactNo.trim())) {
      newErrors.contactNo = "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.";
    }

    // Alternate No (Optional, if filled must be 10 digits)
    if (formData.alternateNo.trim()) {
      if (!/^\d{10}$/.test(formData.alternateNo.trim())) {
        newErrors.alternateNo = "Alternate number must be exactly 10 digits.";
      }
    }

    // Project Details (Min 10 characters)
    if (!formData.projectDetails.trim()) {
      newErrors.projectDetails = "Project details are required.";
    } else if (formData.projectDetails.trim().length < 10) {
      newErrors.projectDetails = `Minimum 10 characters required (${formData.projectDetails.trim().length}/10).`;
    }

    // Work Type
    if (!formData.workType || formData.workType.length === 0) {
      newErrors.workType = "Please select at least one work type.";
    }

    // Expected Revenue (Positive number > 0)
    if (!formData.expectedRevenue) {
      newErrors.expectedRevenue = "Expected revenue is required.";
    } else if (Number(formData.expectedRevenue) <= 0 || isNaN(Number(formData.expectedRevenue))) {
      newErrors.expectedRevenue = "Revenue must be a positive number greater than 0.";
    }

    // City
    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    // Address (Min 5 characters)
    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = `Minimum 5 characters required (${formData.address.trim().length}/5).`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 100, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    // Simulate API Submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  // Reset Form
  const handleReset = () => {
    setFormData({
      date: getTodayDate(),
      salesPerson: "Sales TL (Current User)",
      leadMode: "",
      clientName: "",
      contactNo: "",
      alternateNo: "",
      projectDetails: "",
      workType: [],
      expectedRevenue: "",
      city: "",
      address: "",
      leadStatus: "New"
    });
    setErrors({});
  };

  return (
    <div className="space-y-6 font-sans select-none max-w-5xl mx-auto pb-12">
      
      {/* ================= 1. SUB-HEADER / BANNER ================= */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white rounded-2xl border border-emerald-200/80 shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Capture New Lead
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                FORM LM-01
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              Fill all mandatory details to register and assign a new sales lead to your pipeline.
            </p>
          </div>
        </div>

        {/* Lead Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-100/80 text-emerald-800 border border-emerald-300 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold font-mono shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Status: <span className="uppercase font-black text-emerald-900">{formData.leadStatus}</span>
        </div>
      </div>

      {/* ================= 2. LEAD FORM CARD ================= */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-4 sm:p-6 space-y-4">
        
        {/* SECTION 1: LEAD METADATA & CONTACT */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold text-blue-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">1</span>
            <span>Basic & Assignment Details</span>
            <span className="flex-1 h-px bg-slate-200/60" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* 1. Date */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Lead Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.date ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
              {errors.date && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.date}</p>}
            </div>

            {/* 2. Sales Person */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Sales Person <span className="text-rose-500">*</span>
              </label>
              <select
                name="salesPerson"
                value={formData.salesPerson}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-semibold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                  errors.salesPerson ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100"
                }`}
              >
                {salesPersonsList.map((person) => (
                  <option key={person} value={person}>
                    {person}
                  </option>
                ))}
              </select>
              {errors.salesPerson && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.salesPerson}</p>}
            </div>

            {/* 3. Lead Mode */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Lead Mode <span className="text-rose-500">*</span>
              </label>
              <select
                name="leadMode"
                value={formData.leadMode}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all cursor-pointer ${
                  errors.leadMode ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-blue-500 focus:ring-blue-100"
                }`}
              >
                <option value="">-- Select Lead Source / Mode --</option>
                {leadModesList.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
              {errors.leadMode && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.leadMode}</p>}
            </div>

          </div>
        </div>

        {/* SECTION 2: CLIENT DETAILS */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">2</span>
            <span>Client & Contact Information</span>
            <span className="flex-1 h-px bg-slate-200/60" />
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            
            {/* 4. Client Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Client / Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="clientName"
                placeholder="e.g. Acme Corporation / Rajesh Kumar"
                value={formData.clientName}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                  errors.clientName ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-amber-500 focus:ring-amber-100"
                }`}
              />
              {errors.clientName && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.clientName}</p>}
            </div>

            {/* 5. Primary Contact No */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Primary Contact No. <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  name="contactNo"
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.contactNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    handleChange({ target: { name: "contactNo", value: val } });
                  }}
                  className={`w-full pl-11 pr-3.5 py-1.5 rounded-lg border text-sm font-mono font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.contactNo ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-amber-500 focus:ring-amber-100"
                  }`}
                />
              </div>
              {errors.contactNo && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.contactNo}</p>}
            </div>

            {/* 6. Alternate Contact No (Optional) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                Alternate Contact No. <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                  +91
                </span>
                <input
                  type="tel"
                  name="alternateNo"
                  maxLength={10}
                  placeholder="Optional 10 digits"
                  value={formData.alternateNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    handleChange({ target: { name: "alternateNo", value: val } });
                  }}
                  className={`w-full pl-11 pr-3.5 py-1.5 rounded-lg border text-sm font-mono font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.alternateNo ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-amber-500 focus:ring-amber-100"
                  }`}
                />
              </div>
              {errors.alternateNo && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.alternateNo}</p>}
            </div>

          </div>
        </div>

        {/* SECTION 3: PROJECT SCOPE & COMMERCIALS */}
        <div>
          <h2 className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">3</span>
            <span>Scope of Work & Commercials</span>
            <span className="flex-1 h-px bg-slate-200/60" />
          </h2>

          <div className="space-y-3.5">
            
            {/* 7. Work Type (Multi-Select Pills) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                Work Type / Categories <span className="text-rose-500">*</span>{" "}
                <span className="text-slate-500 font-normal">(Select all that apply)</span>
              </label>
              
              <div className="flex flex-wrap gap-2 pt-0.5">
                {availableWorkTypes.map((type) => {
                  const isSelected = formData.workType.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWorkType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 scale-102"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70"
                      }`}
                    >
                      <span>{type}</span>
                      {isSelected ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-slate-400 text-sm leading-none font-bold">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.workType && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.workType}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 8. Expected Revenue */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  Expected Revenue (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-700">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    name="expectedRevenue"
                    placeholder="e.g. 500000"
                    value={formData.expectedRevenue}
                    onChange={handleChange}
                    className={`w-full pl-7 pr-3.5 py-1.5 rounded-lg border text-sm font-mono font-bold text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                      errors.expectedRevenue ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                </div>
                {errors.expectedRevenue && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.expectedRevenue}</p>}
              </div>

              {/* 9. City */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1">
                  City / Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Noida, Delhi NCR, Mumbai"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all ${
                    errors.city ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
                {errors.city && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.city}</p>}
              </div>

            </div>

            {/* 10. Project Details (Textarea - Min 10 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">
                  Project Details / Requirements <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  Min 10 chars ({formData.projectDetails.length})
                </span>
              </div>
              <textarea
                rows={2}
                name="projectDetails"
                placeholder="Describe screen dimensions, display requirements, hardware specifications, or client notes (minimum 10 characters)..."
                value={formData.projectDetails}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all resize-y ${
                  errors.projectDetails ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.projectDetails && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.projectDetails}</p>}
            </div>

            {/* 11. Address (Textarea - Min 5 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs sm:text-sm font-bold text-slate-800">
                  Site / Client Address <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  Min 5 chars ({formData.address.length})
                </span>
              </div>
              <textarea
                rows={2}
                name="address"
                placeholder="Complete office, store, or installation site address (minimum 5 characters)..."
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3.5 py-1.5 rounded-lg border text-sm font-medium text-slate-900 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 transition-all resize-y ${
                  errors.address ? "border-rose-300 focus:ring-rose-200 bg-rose-50/30" : "border-slate-200/80 focus:border-emerald-500 focus:ring-emerald-100"
                }`}
              />
              {errors.address && <p className="text-xs text-rose-500 font-semibold mt-1">{errors.address}</p>}
            </div>

          </div>
        </div>

        {/* ================= 3. ACTION BUTTONS ================= */}
        <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Creating Lead...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Save & Create Lead</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* ================= 4. SUCCESS POPUP MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Lead Created Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Lead for <strong className="text-slate-900">{formData.clientName}</strong> has been created with status <span className="font-bold text-emerald-600">"New"</span> and assigned to <strong className="text-slate-900">{formData.salesPerson}</strong>.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                + Add Another Lead
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/sales/dashboard");
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Addlead;