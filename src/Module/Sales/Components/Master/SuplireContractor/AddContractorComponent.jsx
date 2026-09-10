import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaHardHat,
  FaSave,
  FaCheck,
  FaChevronDown,
  FaCloudUploadAlt,
  FaFileAlt,
  FaTrashAlt,
  FaBuilding,
  FaUserTie,
  FaTools,
  FaFileContract,
  FaInfoCircle
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

// 5. CONTRACTOR DDL — Exact Sheet Reference
// Contractor Type (Count: 19)
const CONTRACTOR_TYPES = [
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

// Work Will Done By (Count: 4)
const WORK_WILL_DONE_BY_LIST = [
  "LABOUR",
  "DURMUT",
  "LABOUR - BAR BINDER [LOHAR]",
  "CONTRACTOR = SHUTTERING"
];

// Tools / Vehicle Available (Count: 7)
const TOOLS_VEHICLES_LIST = [
  "DURMUT",
  "MIXING MACHINE",
  "BAR BINDER'S [LOHAR'S] TOOL",
  "SAHUL (LATTU)",
  "VIBRATOR",
  "WATER SYSTEM MANAGEMENT",
  "LABLER MACHINE"
];

// Work Categories
const WORK_CATEGORIES_LIST = [
  "Civil Construction",
  "Structural & RCC Framing",
  "Interior & Fit-out",
  "Electrical & MEP",
  "Plumbing & Sanitation",
  "Fabrication & Metal Works",
  "Painting & Wall Finishes",
  "Flooring & Tiling",
  "Waterproofing & Insulation",
  "Woodwork & Carpentry",
  "Excavation & Earthwork",
  "Glass & Aluminium Windows"
];

// Supported Tasks Mapping
const SUPPORTED_TASKS_LIST = [
  "Site Demolition & Clearance",
  "Foundation Excavation & PCC",
  "Footing Reinforcement & Column Casting",
  "Shuttering & Formwork Assembly",
  "Bar Bending & Rebar Laying",
  "Brick Masonry & AAC Block Work",
  "Internal & External Wall Plastering",
  "Concealed Conduit Electrical Wiring",
  "Plumbing Pipeline & Drainage Fitting",
  "Bathroom Waterproofing Chemical Coat",
  "Vitrified & Ceramic Tile Laying",
  "Italian Marble Grinding & Polishing",
  "False Ceiling Gypsum Framework",
  "Modular Kitchen & Wardrobe Installation",
  "UPVC & Aluminium Window Fixing",
  "Exterior Weathercoat & Primer Painting",
  "Structural MS Girder & Shed Fabrication"
];

// Common Indian States
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi NCR", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
  "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal"
];

// Common Cities
const COMMON_CITIES = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Delhi", "Noida", "Gurugram",
  "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Surat", "Jaipur",
  "Lucknow", "Indore", "Bhopal", "Chandigarh", "Patna", "Ranchi", "Dehradun"
];

const AddContractorComponent = () => {
  const navigate = useNavigate();

  // Form State containing all 21 inputs
  const [formData, setFormData] = useState({
    code: "VEN-CON-" + Math.floor(1000 + Math.random() * 9000), // 1. Contractor Code
    name: "", // 2. Contractor / Company Name
    contractorType: "", // 3. Contractor Type
    contactPerson: "", // 4. Primary Contact Person
    designation: "", // 5. Designation
    phone: "", // 6. Primary Contact No.
    alternatePhone: "", // 7. Alternate Contact No.
    whatsappNo: "", // 8. WhatsApp No.
    email: "", // 9. Email
    address: "", // 10. Address
    city: "", // 11. City
    state: "", // 12. State
    pincode: "", // 13. Pincode
    workCategories: [], // 14. Work Categories
    supportedTasks: [], // 15. Supported Tasks
    toolsVehicles: [], // 16. Tools / Vehicle Available
    workWillDoneBy: "", // Work Will Done By (Executing party)
    commercialTerms: "", // 17. Rate / Commercial Terms
    availability: "Available", // 18. Availability
    documents: [], // 19. Documents
    status: "Active", // 20. Status
    remarks: "" // 21. Remarks
  });

  // Search filter states for dropdowns
  const [typeSearch, setTypeSearch] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  const [stateSearch, setStateSearch] = useState("");
  const [isStateOpen, setIsStateOpen] = useState(false);

  const [citySearch, setCitySearch] = useState("");
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Errors state for validation
  const [errors, setErrors] = useState({});

  // Filtered dropdown lists
  const filteredContractorTypes = useMemo(() => {
    return CONTRACTOR_TYPES.filter((item) =>
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
    if (field === "workCategories") {
      setErrors((prev) => ({ ...prev, workCategories: "" }));
    }
  };

  // Handle File Uploads
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

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Contractor Code is required.";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Contractor / Company Name is required.";
    }
    if (!formData.contractorType) {
      newErrors.contractorType = "Please select a Contractor Type.";
    }
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Primary Contact Person is required.";
    }

    const phoneClean = formData.phone.replace(/\D/g, "");
    if (!phoneClean) {
      newErrors.phone = "Primary Contact Number is required.";
    } else if (phoneClean.length < 10) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.workCategories || formData.workCategories.length === 0) {
      newErrors.workCategories = "Please select at least one Work Category.";
    }

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

    toast.success("Contractor \"" + formData.name + "\" added successfully!");
    navigate("/sales/master/suplire-and-contractor");
  };

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* Top Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 shadow-lg border border-blue-700/50 overflow-hidden mb-2">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer mt-0.5"
              title="Back to Directory"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2.5 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
              <FaHardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Add Contractor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3 text-blue-300" /> New Entry
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1 max-w-xl font-normal">
                Register civil subcontractors, MEP workforce agencies, and labor contracts.
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
              form="contractor-form"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer text-xs"
            >
              <FaSave className="w-3.5 h-3.5" />
              <span>Save Contractor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= MAIN FORM BODY ================= */}
      <form id="contractor-master-form" onSubmit={handleSubmit} className="space-y-4">

        {/* SECTION 1: BASIC IDENTIFICATION */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaBuilding className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">1. Basic Contractor Identity</h2>
              <p className="text-[11px] text-slate-500">Core identification fields for PMS master mapping.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Contractor Code (Auto / Text, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contractor Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="e.g. VEN-CON-1001"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.code ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-slate-50/60"
                }`}
              />
              {errors.code && <p className="text-[10px] text-red-500 mt-1">{errors.code}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Unique contractor master code.</p>
            </div>

            {/* 2. Contractor / Company Name (Text, Yes) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contractor / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="e.g. Royal Civil & Structures Pvt Ltd"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.name ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Used by PMS Work Will Done By.</p>
            </div>

            {/* 3. Contractor Type (Searchable DDL, Yes) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contractor Type <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => setIsTypeOpen(!isTypeOpen)}
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white transition-all ${
                  errors.contractorType ? "border-red-500 bg-red-50/50" : "border-slate-300"
                }`}
              >
                <span className={formData.contractorType ? "text-slate-800" : "text-slate-400"}>
                  {formData.contractorType || "Select Contractor Type (19 Types)"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {errors.contractorType && (
                <p className="text-[10px] text-red-500 mt-1">{errors.contractorType}</p>
              )}

              {isTypeOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search 19 contractor types..."
                      value={typeSearch}
                      onChange={(e) => setTypeSearch(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {filteredContractorTypes.length > 0 ? (
                      filteredContractorTypes.map((type) => (
                        <div
                          key={type}
                          onClick={() => {
                            setFormData({ ...formData, contractorType: type });
                            setIsTypeOpen(false);
                            setTypeSearch("");
                            if (errors.contractorType) setErrors({ ...errors, contractorType: "" });
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 transition-colors ${
                            formData.contractorType === type
                              ? "bg-blue-50 text-blue-700 font-bold"
                              : "text-slate-700"
                          }`}
                        >
                          <span>{type}</span>
                          {formData.contractorType === type && <FaCheck className="w-2.5 h-2.5 text-blue-600" />}
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-xs text-slate-400 text-center">No type matching</p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Exact PMS Contractor Type reference.</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT DETAILS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FaUserTie className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">2. Contact Person & Communication</h2>
              <p className="text-[11px] text-slate-500">Key representatives and communication channels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 4. Primary Contact Person (Text, Yes) */}
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
                placeholder="e.g. Ramesh Chandra Sharma"
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.contactPerson ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.contactPerson && <p className="text-[10px] text-red-500 mt-1">{errors.contactPerson}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Main contractor contact.</p>
            </div>

            {/* 5. Designation (Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g. Owner / Manager / Site Engineer"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Owner/Manager/Site Engineer etc.</p>
            </div>

            {/* 6. Primary Contact No. (Phone, Yes) */}
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
                className={`w-full px-3 py-2 border rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 mt-1">{errors.phone}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Validated phone.</p>
            </div>

            {/* 7. Alternate Contact No. (Phone, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Contact No.</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                placeholder="e.g. +91 98220 11223"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional secondary line.</p>
            </div>

            {/* 8. WhatsApp No. (Phone, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp No.</label>
              <input
                type="tel"
                value={formData.whatsappNo}
                onChange={(e) => setFormData({ ...formData, whatsappNo: e.target.value })}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional for dispatch and updates.</p>
            </div>

            {/* 9. Email (Email, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="e.g. contact@royalcontractors.com"
                className={`w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.email ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"
                }`}
              />
              {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>}
              <p className="text-[10px] text-slate-400 mt-0.5">Optional; validate format.</p>
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
              <h2 className="text-sm font-bold text-slate-800">3. Business Address & Work Geography</h2>
              <p className="text-[11px] text-slate-500">Contractor location and regional base.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 10. Address (Multiline Text, No) */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Office / Yard address, street name, landmark..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Business address.</p>
            </div>

            {/* 11. City (Searchable DDL, No) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <div
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white"
              >
                <span className={formData.city ? "text-slate-800" : "text-slate-400"}>
                  {formData.city || "Select City"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {isCityOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search city..."
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        }}
                        className="px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Contractor location.</p>
            </div>

            {/* 12. State (Searchable DDL, No) */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
              <div
                onClick={() => setIsStateOpen(!isStateOpen)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer bg-white"
              >
                <span className={formData.state ? "text-slate-800" : "text-slate-400"}>
                  {formData.state || "Select State"}
                </span>
                <FaChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </div>

              {isStateOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <input
                      type="text"
                      placeholder="Search Indian state..."
                      value={stateSearch}
                      onChange={(e) => setStateSearch(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                        }}
                        className="px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                      >
                        {state}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Contractor location.</p>
            </div>

            {/* 13. Pincode (Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                placeholder="e.g. 400001"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Postal code.</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: CAPABILITY & PMS MAPPING */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FaTools className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">4. Work Capability, Tasks & Equipment Mapping</h2>
              <p className="text-[11px] text-slate-500">
                Maps directly to PMS task capabilities, Work Will Done By, and tools/vehicles.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 14. Work Categories (Multi-select DDL, Yes) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Work Categories <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-blue-600">
                  {formData.workCategories.length} selected
                </span>
              </div>
              <div className={`p-3 border rounded-xl bg-slate-50/50 flex flex-wrap gap-2 ${
                errors.workCategories ? "border-red-500 bg-red-50/30" : "border-slate-200"
              }`}>
                {WORK_CATEGORIES_LIST.map((cat) => {
                  const isSelected = formData.workCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleSelection("workCategories", cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      {isSelected ? <FaCheck className="w-2.5 h-2.5" /> : null}
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
              {errors.workCategories && (
                <p className="text-[10px] text-red-500 mt-1">{errors.workCategories}</p>
              )}
              <p className="text-[10px] text-slate-400 mt-0.5">Work types/categories contractor can execute.</p>
            </div>

            {/* 15. Supported Tasks (Task Lookup Multi-select, No) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Supported Tasks</label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {formData.supportedTasks.length} mapped
                </span>
              </div>
              <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                {SUPPORTED_TASKS_LIST.map((task) => {
                  const isSelected = formData.supportedTasks.includes(task);
                  return (
                    <button
                      key={task}
                      type="button"
                      onClick={() => toggleSelection("supportedTasks", task)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected && <FaCheck className="w-2 h-2" />}
                      <span>{task}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Optional direct task capability mapping.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* 16. Tools / Vehicle Available (Multi-select Lookup, Count: 7) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Tools / Vehicle Available (Count: 7)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600">
                    {formData.toolsVehicles.length} tools
                  </span>
                </div>
                <div className="p-2.5 border border-slate-200 rounded-xl bg-slate-50/50 space-y-1 max-h-44 overflow-y-auto">
                  {TOOLS_VEHICLES_LIST.map((tool) => {
                    const isChecked = formData.toolsVehicles.includes(tool);
                    return (
                      <label
                        key={tool}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? "bg-emerald-50 text-emerald-900 font-bold" : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelection("toolsVehicles", tool)}
                          className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span>{tool}</span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Maps to PMS Tools / Vehicle capability. Separate resource field.
                </p>
              </div>

              {/* Work Will Done By Reference (Count: 4) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Will Done By (Executing Worker Party)
                </label>
                <select
                  value={formData.workWillDoneBy}
                  onChange={(e) => setFormData({ ...formData, workWillDoneBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer mb-2"
                >
                  <option value="">-- Select Worker Execution Model --</option>
                  {WORK_WILL_DONE_BY_LIST.map((worker) => (
                    <option key={worker} value={worker}>
                      {worker}
                    </option>
                  ))}
                </select>
                <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-800 flex items-start gap-1.5">
                  <FaInfoCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Rule:</strong> "Contractor Type" identifies contractor category; "Work Will Done By"
                    identifies the executing party/worker in PMS.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: COMMERCIALS, DOCUMENTS & STATUS */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaFileContract className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">5. Terms, Documents, Availability & Status</h2>
              <p className="text-[11px] text-slate-500">Commercial agreements, status control, and verification files.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 17. Rate / Commercial Terms (Structured / Multiline, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rate / Commercial Terms</label>
              <textarea
                rows={3}
                value={formData.commercialTerms}
                onChange={(e) => setFormData({ ...formData, commercialTerms: e.target.value })}
                placeholder="e.g. Civil RCC work @ ₹45/sq.ft, Shuttering @ ₹28/sq.ft. Payment cycle: 15 days post billing..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Optional rate card / contract terms.</p>
            </div>

            {/* 21. Remarks (Multiline Text, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Remarks</label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Internal supervisor notes, quality track record, past projects..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Internal notes.</p>
            </div>

            {/* 18. Availability & 20. Status */}
            <div className="grid grid-cols-2 gap-3">
              {/* 18. Availability (DDL, No) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Availability</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">Available / Busy / Inactive.</p>
              </div>

              {/* 20. Status (DDL, Yes) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">Active / Inactive / Blocked.</p>
              </div>
            </div>

            {/* 19. Documents (File Upload, No) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Documents (Agreement, GST, Registration, Insurance)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-3 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  id="contractor-doc-upload"
                  className="hidden"
                />
                <label htmlFor="contractor-doc-upload" className="cursor-pointer flex flex-col items-center">
                  <FaCloudUploadAlt className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-blue-600 hover:underline">
                    Click to upload documents
                  </span>
                  <span className="text-[10px] text-slate-400">
                    PDF, DOC, JPG, PNG (Max 5MB per file)
                  </span>
                </label>
              </div>

              {/* Uploaded Documents List */}
              {formData.documents.length > 0 && (
                <div className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
                  {formData.documents.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FaFileAlt className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-semibold text-slate-700 truncate">{doc.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">({doc.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(idx)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      >
                        <FaTrashAlt className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
          >
            <FaSave className="w-3.5 h-3.5" />
            <span>Save Contractor Master</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContractorComponent;
