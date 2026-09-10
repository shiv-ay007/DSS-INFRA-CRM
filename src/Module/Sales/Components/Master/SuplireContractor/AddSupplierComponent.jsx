import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaTruck,
  FaSave,
  FaCheck,
  FaChevronDown,
  FaCloudUploadAlt,
  FaFileAlt,
  FaTrashAlt,
  FaBuilding,
  FaUserTie,
  FaBoxes,
  FaUniversity,
  FaFileContract,
  FaLock
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

// 7. SUPPLIER DDL — Exact Reference & Seed Data
// Supplier Type (Configurable master categories)
const INITIAL_SUPPLIER_TYPES = [
  "Manufacturer",
  "Authorized Distributor",
  "Wholesaler / Stockist",
  "Local Retail Supplier",
  "Direct Importer",
  "Trading Company",
  "Fabricator & Material Supplier",
  "Specialized Chemical Vendor"
];

// Supplier Categories (Multi-select)
const SUPPLIER_CATEGORIES = [
  "Cement & Concrete",
  "Steel & Structural Metals",
  "Bricks, Blocks & Aggregates",
  "Paints, Putty & Coatings",
  "Pipes, Fittings & Sanitaryware",
  "Electrical Cables & Switchgears",
  "Ceramic, Vitrified & Marble Tiles",
  "Wood, Plywood & Laminates",
  "Hardware & Fasteners",
  "Waterproofing & Construction Chemicals",
  "Glass & Aluminium Sections",
  "Safety Equipment & Tools"
];

// Material Master lookup seed items
const MATERIAL_LOOKUP_LIST = [
  "UltraTech Super Cement (53 Grade)",
  "Tata Tiscon TMT Rebar Fe550D (12mm)",
  "Autoclaved Aerated Concrete (AAC) Blocks",
  "Polycab 2.5 sq.mm FR Copper Wire",
  "Asian Paints Apex Ultima Weatherproof",
  "Astral CPVC Pro Water Pipes (1 inch)",
  "Kajaria 600x1200mm Vitrified Floor Tiles",
  "CenturyPly Club Prime 19mm Marine Ply",
  "Dr. Fixit Fastflex Waterproofing Compound",
  "Jindal Aluminum Extrusion Window Profiles",
  "Red River Sand / M-Sand (Crushed)",
  "Blue Metal Aggregate 20mm & 10mm"
];

// Payment Terms DDL
const PAYMENT_TERMS_LIST = [
  "Immediate Cash / RTGS Advance",
  "100% Against Delivery (COD)",
  "50% Advance + 50% on Delivery",
  "15 Days Credit",
  "30 Days Credit",
  "45 Days Credit",
  "60 Days Credit",
  "Milestone Linked Billing"
];

// Indian States
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi NCR", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

// Common Indian Cities
const COMMON_CITIES = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Delhi", "Noida", "Gurugram",
  "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Surat", "Jaipur",
  "Lucknow", "Indore", "Bhopal", "Chandigarh", "Patna", "Ranchi", "Dehradun"
];

const AddSupplierComponent = () => {
  const navigate = useNavigate();

  // Form State containing all 28 inputs
  const [formData, setFormData] = useState({
    code: "VEN-SUP-" + Math.floor(1000 + Math.random() * 9000), // 1. Supplier Code (Auto/Text, Yes)
    name: "", // 2. Supplier Name (Text, Yes)
    supplierType: "", // 3. Supplier Type (Searchable DDL, Yes)
    supplierCategories: [], // 4. Supplier Category (Multi-select DDL, No)
    contactPerson: "", // 5. Primary Contact Person (Text, Yes)
    designation: "", // 6. Designation (Text, No)
    phone: "", // 7. Primary Contact No. (Phone, Yes)
    alternatePhone: "", // 8. Alternate Contact No. (Phone, No)
    whatsappNo: "", // 9. WhatsApp No. (Phone, No)
    email: "", // 10. Email (Email, No)
    address: "", // 11. Address (Multiline Text, Yes)
    city: "", // 12. City (Searchable DDL, Yes)
    state: "", // 13. State (Searchable DDL, Yes)
    pincode: "", // 14. Pincode (Text, No)
    gstin: "", // 15. GSTIN (Text, Conditional)
    pan: "", // 16. PAN (Text, Conditional)
    msmeNo: "", // 17. MSME / Registration No. (Text, No)
    materialsSupplied: [], // 18. Materials / Services Supplied (Lookup Multi-select, Yes)
    paymentTerms: "", // 19. Payment Terms (DDL, No)
    creditLimit: "", // 20. Credit Limit (Currency, No)
    deliveryLeadTime: "", // 21. Delivery Lead Time (Number, No)
    bankName: "", // 22. Bank Name (Text, Conditional)
    accountHolderName: "", // 23. Account Holder Name (Text, Conditional)
    accountNumber: "", // 24. Account Number (Text, Conditional)
    ifsc: "", // 25. IFSC (Text, Conditional)
    documents: [], // 26. Documents (File Upload, No)
    status: "Active", // 27. Status (DDL, Yes)
    remarks: "" // 28. Remarks (Multiline Text, No)
  });

  // Search filter states for dropdowns
  const [typeSearch, setTypeSearch] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const [stateSearch, setStateSearch] = useState("");
  const [isStateOpen, setIsStateOpen] = useState(false);

  const [citySearch, setCitySearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Errors state
  const [errors, setErrors] = useState({});

  // Filtered dropdown options
  const filteredSupplierTypes = useMemo(() => {
    return INITIAL_SUPPLIER_TYPES.filter((item) =>
      item.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [typeSearch]);

  const filteredStates = useMemo(() => {
    return INDIAN_STATES.filter((item) =>
      item.toLowerCase().includes(stateSearch.toLowerCase())
    );
  }, [stateSearch]);

  const filteredCities = useMemo(() => {
    return COMMON_CITIES.filter((item) =>
      item.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch]);

  // Handle Multi-select toggle
  const toggleSelection = (field, value) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      if (currentList.includes(value)) {
        return { ...prev, [field]: currentList.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentList, value] };
      }
    });
    if (field === "materialsSupplied") {
      setErrors((prev) => ({ ...prev, materialsSupplied: "" }));
    }
  };

  // Handle File Uploads (Allowed extensions & limit)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    const maxSizeBytes = 5 * 1024 * 1024;

    files.forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        toast.error("Invalid file type: " + file.name + ". Only PDF, DOC, JPG, PNG allowed.");
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error("File too large: " + file.name + ". Maximum limit is 5MB.");
        return;
      }
      validFiles.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: ext
      });
    });

    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...validFiles]
    }));
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // 1. Supplier Code
    if (!formData.code.trim()) {
      newErrors.code = "Supplier Code is required.";
    }

    // 2. Supplier Name
    if (!formData.name.trim()) {
      newErrors.name = "Supplier Name is required.";
    }

    // 3. Supplier Type
    if (!formData.supplierType) {
      newErrors.supplierType = "Supplier Type is required.";
    }

    // 5. Primary Contact Person
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Primary Contact Person is required.";
    }

    // 7. Primary Contact No.
    const phoneClean = formData.phone.replace(/\D/g, "");
    if (!phoneClean) {
      newErrors.phone = "Primary Contact Number is required.";
    } else if (phoneClean.length < 10) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    // 10. Email (if provided)
    if (formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    // 11. Address
    if (!formData.address.trim()) {
      newErrors.address = "Business / Registered Address is required.";
    }

    // 12. City
    if (!formData.city) {
      newErrors.city = "City is required.";
    }

    // 13. State
    if (!formData.state) {
      newErrors.state = "State is required.";
    }

    // 15. GSTIN (Conditional validation if entered)
    if (formData.gstin.trim()) {
      const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinPattern.test(formData.gstin.trim().toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format (e.g. 27AABCV1234A1Z5).";
      }
    }

    // 16. PAN (Conditional validation if entered)
    if (formData.pan.trim()) {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panPattern.test(formData.pan.trim().toUpperCase())) {
        newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F).";
      }
    }

    // 18. Materials / Services Supplied
    if (!formData.materialsSupplied || formData.materialsSupplied.length === 0) {
      newErrors.materialsSupplied = "Please link at least one Material / Service.";
    }

    // 25. IFSC (Conditional validation if entered)
    if (formData.ifsc.trim()) {
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscPattern.test(formData.ifsc.trim().toUpperCase())) {
        newErrors.ifsc = "Invalid IFSC format (e.g. SBIN0001234).";
      }
    }

    // 27. Status
    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all mandatory fields (*)");
      return;
    }

    toast.success("Supplier \"" + formData.name + "\" added successfully!");
    navigate("/sales/master/suplire-and-contractor");
  };

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-xl p-4 shadow-lg border border-teal-700/50 overflow-hidden mb-2">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer mt-0.5"
              title="Back to Directory"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
              <FaTruck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Add Supplier
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3 text-emerald-300" /> New Entry
                </span>
              </div>
              <p className="text-xs text-teal-200/90 mt-1 max-w-xl font-normal">
                Register new material supplier details, procurement contact, and delivery specifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="supplier-form"
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-md shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer text-xs"
            >
              <FaSave className="w-3.5 h-3.5" />
              <span>Save Supplier</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN FORM BODY ================= */}
      <form id="supplier-master-form" onSubmit={handleSubmit} className="space-y-4">

        {/* SECTION 1: BASIC SUPPLIER IDENTITY */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FaBuilding className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">1. Basic Supplier Identity</h2>
              <p className="text-[11px] text-slate-500">Core identification fields mapping to PMS material and procurement workflows.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Supplier Code (Auto / Text, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. VEN-SUP-1001"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.code ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-slate-50/60"
                }`}
              />
              {errors.code && <p className="text-[10px] text-red-500 mt-1">{errors.code}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Unique supplier master code.</p>
            </div>

            {/* 2. Supplier Name (Text, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="e.g. Apex Steel & Cement Distributors"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.name ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Maps to PMS Supplier Name.</p>
            </div>

            {/* 3. Supplier Type (Searchable DDL, Yes) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Supplier Type <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white transition-all ${
                  errors.supplierType ? "border-red-500 bg-red-50/50" : "border-slate-300"
                }`}
              >
                <span className={formData.supplierType ? "text-slate-800" : "text-slate-400"}>
                  {formData.supplierType || "Select Supplier Type"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {errors.supplierType && (
                <p className="text-[10px] text-red-500 mt-1">{errors.supplierType}</p>
              )}

              {isTypeOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search supplier type..."
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {filteredSupplierTypes.length > 0 ? (
                      filteredSupplierTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() => {
                            setFormData({ ...formData, supplierType: type });
                            setIsTypeOpen(false);
                            setTypeSearch("");
                            if (errors.supplierType) setErrors({ ...errors, supplierType: "" });
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 transition-colors ${
                            formData.supplierType === type
                              ? "bg-emerald-50 text-emerald-700 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          <span>{type}</span>
                          {formData.supplierType === type && <FaCheck className="w-2.5 h-2.5 text-emerald-600" />}
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-xs text-slate-400 text-center">No type matching</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Maps to PMS Supplier Type.</p>
            </div>
          </div>

          {/* 4. Supplier Category (Multi-select DDL, No) */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                4. Supplier Category (Procurement Categories)
              </label>
              <span className="text-[11px] font-bold text-emerald-600">
                {formData.supplierCategories.length} selected
              </span>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-wrap gap-2">
              {SUPPLIER_CATEGORIES.map((cat) => {
                const isSelected = formData.supplierCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleSelection("supplierCategories", cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {isSelected && <FaCheck className="w-2.5 h-2.5" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Configurable procurement categories.</p>
          </div>
        </div>

        {/* SECTION 2: CONTACT DETAILS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <FaUserTie className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">2. Contact Person & Communication</h2>
              <p className="text-[11px] text-slate-500">Supplier representatives, purchase coordination, and order follow-up.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 5. Primary Contact Person (Text, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Contact Person <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => {
                  setFormData({ ...formData, contactPerson: e.target.value });
                  if (errors.contactPerson) setErrors({ ...errors, contactPerson: "" });
                }}
                placeholder="e.g. Ramesh Kumar Sharma"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.contactPerson ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.contactPerson && <p className="text-[10px] text-red-500 mt-1">{errors.contactPerson}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Supplier contact.</p>
            </div>

            {/* 6. Designation (Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Sales Head / Owner / Accounts Manager"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Sales / Owner / Accounts etc.</p>
            </div>

            {/* 7. Primary Contact No. (Phone, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Contact No. <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: "" });
                }}
                placeholder="e.g. +91 98765 43210"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Validated phone.</p>
            </div>

            {/* 8. Alternate Contact No. (Phone, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Contact No.</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                placeholder="e.g. +91 98220 11223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional secondary line.</p>
            </div>

            {/* 9. WhatsApp No. (Phone, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp No.</label>
              <input
                type="tel"
                value={formData.whatsappNo}
                onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional for dispatch & bills.</p>
            </div>

            {/* 10. Email (Email, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="e.g. sales@apexmaterials.com"
                className={`w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.email ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Optional; format validated.</p>
            </div>
          </div>
        </div>

        {/* SECTION 3: ADDRESS & LOCATION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaBuilding className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">3. Business Address & Location</h2>
              <p className="text-[11px] text-slate-500">Registered commercial location and dispatch hub.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 11. Address (Multiline Text, Yes) */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business / Registered Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => {
                  setFormData({ ...formData, address: e.target.value });
                  if (errors.address) setErrors({ ...errors, address: "" });
                }}
                placeholder="Godown / Warehouse / Office address, Industrial Area..."
                className={`w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                  errors.address ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.address && <p className="text-[10px] text-red-500 mt-1">{errors.address}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Business / registered address.</p>
            </div>

            {/* 12. City (Searchable DDL, Yes) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setIsCityOpen(!isCityOpen)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white transition-all ${
                  errors.city ? "border-red-500 bg-red-50/50" : "border-slate-300"
                }`}
              >
                <span className={formData.city ? "text-slate-800" : "text-slate-400"}>
                  {formData.city || "Select City"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {errors.city && <p className="text-[10px] text-red-500 mt-1">{errors.city}</p>}

              {isCityOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                    {filteredCities.map((city) => (
                      <div
                        key={city}
                        onClick={() => {
                          setFormData({ ...formData, city });
                          setIsCityOpen(false);
                          setCitySearch("");
                          if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        className="px-3 py-1.5 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Location.</p>
            </div>

            {/* 13. State (Searchable DDL, Yes) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setIsStateOpen(!isStateOpen)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white transition-all ${
                  errors.state ? "border-red-500 bg-red-50/50" : "border-slate-300"
                }`}
              >
                <span className={formData.state ? "text-slate-800" : "text-slate-400"}>
                  {formData.state || "Select State"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {errors.state && <p className="text-[10px] text-red-500 mt-1">{errors.state}</p>}

              {isStateOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search Indian state..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-50">
                    {filteredStates.map((state) => (
                      <div
                        key={state}
                        onClick={() => {
                          setFormData({ ...formData, state });
                          setIsStateOpen(false);
                          setStateSearch("");
                          if (errors.state) setErrors({ ...errors, state: "" });
                        }}
                        className="px-3 py-1.5 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {state}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Location.</p>
            </div>

            {/* 14. Pincode (Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Postal code.</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: TAX & STATUTORY REGISTRATIONS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <FaFileContract className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">4. Tax & Statutory Identification</h2>
              <p className="text-[11px] text-slate-500">GST, PAN and MSME registration verification details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 15. GSTIN (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
              <input
                type="text"
                maxLength={15}
                value={formData.gstin}
                onChange={(e) => {
                  setFormData({ ...formData, gstin: e.target.value.toUpperCase() });
                  if (errors.gstin) setErrors({ ...errors, gstin: "" });
                }}
                placeholder="e.g. 27AABCT1332F1Z8"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase ${
                  errors.gstin ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.gstin && <p className="text-[10px] text-red-500 mt-1">{errors.gstin}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">15-digit GSTIN (Validate if applicable).</p>
            </div>

            {/* 16. PAN (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
              <input
                type="text"
                maxLength={10}
                value={formData.pan}
                onChange={(e) => {
                  setFormData({ ...formData, pan: e.target.value.toUpperCase() });
                  if (errors.pan) setErrors({ ...errors, pan: "" });
                }}
                placeholder="e.g. AABCT1332F"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase ${
                  errors.pan ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.pan && <p className="text-[10px] text-red-500 mt-1">{errors.pan}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">10-digit PAN (Validate if applicable).</p>
            </div>

            {/* 17. MSME / Registration No. (Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">MSME / Registration No.</label>
              <input
                type="text"
                value={formData.msmeNo}
                onChange={(e) => setFormData({ ...formData, msmeNo: e.target.value })}
                placeholder="e.g. UDYAM-MH-01-0012345"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional Udyam / MSME registration.</p>
            </div>
          </div>
        </div>

        {/* SECTION 5: MATERIALS SUPPLIED & COMMERCIAL TERMS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FaBoxes className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">5. Materials Supplied & Commercial Terms</h2>
              <p className="text-[11px] text-slate-500">Links Supplier to Material Master and specifies credit / dispatch terms.</p>
            </div>
          </div>

          {/* 18. Materials / Services Supplied (Material Lookup Multi-select, Yes) */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                18. Materials / Services Supplied <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-600">
                {formData.materialsSupplied.length} materials linked
              </span>
            </div>
            <div className={`p-3 border rounded-xl bg-slate-50/50 flex flex-wrap gap-2 ${
              errors.materialsSupplied ? "border-red-500 bg-red-50/30" : "border-slate-200"
            }`}>
              {MATERIAL_LOOKUP_LIST.map((mat) => {
                const isSelected = formData.materialsSupplied.includes(mat);
                return (
                  <button
                    key={mat}
                    type="button"
                    onClick={() => toggleSelection("materialsSupplied", mat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    {isSelected && <FaCheck className="w-2.5 h-2.5" />}
                    <span>{mat}</span>
                  </button>
                );
              })}
            </div>
            {errors.materialsSupplied && (
              <p className="text-[10px] text-red-500 mt-1">{errors.materialsSupplied}</p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5">Links Supplier to Material Master (Supports preferred supplier mapping).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            {/* 19. Payment Terms (DDL, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Terms</label>
              <select
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">-- Select Payment Terms --</option>
                {PAYMENT_TERMS_LIST.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-0.5">Advance / COD / credit days etc.</p>
            </div>

            {/* 20. Credit Limit (Currency, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                min="0"
                value={formData.creditLimit}
                onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                placeholder="e.g. 500000"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional credit sanction amount.</p>
            </div>

            {/* 21. Delivery Lead Time (Number, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Lead Time (Days)</label>
              <input
                type="number"
                min="0"
                value={formData.deliveryLeadTime}
                onChange={(e) => setFormData({ ...formData, deliveryLeadTime: e.target.value })}
                placeholder="e.g. 2 Days"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Standard turnaround in days.</p>
            </div>
          </div>
        </div>

        {/* SECTION 6: BANK DETAILS, DOCUMENTS & STATUS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaUniversity className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">6. Banking Details, Documents & Status</h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                  <FaLock className="w-2.5 h-2.5" /> Restricted Access
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Permission-restricted settlement details, uploaded verification files, and master status.
              </p>
            </div>
          </div>

          {/* Bank details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 22. Bank Name (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g. State Bank of India"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">If payment module uses bank data.</p>
            </div>

            {/* 23. Account Holder Name (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="e.g. Apex Steel & Cement Pvt Ltd"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Verified detail.</p>
            </div>

            {/* 24. Account Number (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="e.g. 10293847561"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Restricted access.</p>
            </div>

            {/* 25. IFSC (Text, Conditional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                maxLength={11}
                value={formData.ifsc}
                onChange={(e) => {
                  setFormData({ ...formData, ifsc: e.target.value.toUpperCase() });
                  if (errors.ifsc) setErrors({ ...errors, ifsc: "" });
                }}
                placeholder="e.g. SBIN0001234"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase ${
                  errors.ifsc ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.ifsc && <p className="text-[10px] text-red-500 mt-1">{errors.ifsc}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Validate format.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            {/* 26. Documents (File Upload, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                26. Documents (GST, MSME, Bank, Certificates)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:border-emerald-400 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  id="supplier-doc-upload"
                  className="hidden"
                />
                <label htmlFor="supplier-doc-upload" className="cursor-pointer flex flex-col items-center">
                  <FaCloudUploadAlt className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-emerald-600 hover:underline">
                    Click to upload documents
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PDF, DOC, JPG, PNG (Max 5MB)
                  </span>
                </label>
              </div>

              {formData.documents.length > 0 && (
                <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                  {formData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded text-[11px]"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <FaFileAlt className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{doc.name}</span>
                        <span className="text-[9px] text-slate-400">({doc.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <FaTrashAlt className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 27. Status (DDL, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                27. Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Blocked">Blocked</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-0.5">Active / Inactive / Blocked if approved.</p>
            </div>

            {/* 28. Remarks (Multiline Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">28. Remarks</label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Internal notes, preferred vendor terms, delivery reliability..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Internal notes.</p>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/sales/master/suplire-and-contractor")}
            className="px-5 py-2.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel & Return
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
          >
            <FaSave className="w-3.5 h-3.5" />
            <span>Save Supplier Master</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSupplierComponent;
