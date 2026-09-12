import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FaTimes,
  FaSpinner
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { contractorService } from "../../../services/contractorService";

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
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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
    workCategories: [], // 14. Work Categories (Multi-select)
    supportedTasks: [], // 15. Supported Tasks (Multi-select)
    toolsVehicles: [], // 16. Tools / Vehicle Available (Multi-select)
    workWillDoneBy: "", // Work Will Done By (Executing party)
    commercialTerms: "", // 17. Rate / Commercial Terms
    availability: "Available", // 18. Availability
    documents: [], // 19. Documents
    status: "Active", // 20. Status
    remarks: "" // 21. Remarks
  });

  // Dropdown Open/Close states
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isWorkCatOpen, setIsWorkCatOpen] = useState(false);
  const [isTasksOpen, setIsTasksOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isWorkerOpen, setIsWorkerOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Search filter states for dropdowns
  const [typeSearch, setTypeSearch] = useState("");
  const [workCatSearch, setWorkCatSearch] = useState("");
  const [tasksSearch, setTasksSearch] = useState("");
  const [toolsSearch, setToolsSearch] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // Refs for Outside Click detection
  const typeRef = useRef(null);
  const workCatRef = useRef(null);
  const tasksRef = useRef(null);
  const toolsRef = useRef(null);
  const workerRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // Errors state for validation
  const [errors, setErrors] = useState({});
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Fetch existing contractor data if in edit mode
  useEffect(() => {
    if (!id) return;
    const fetchContractorData = async () => {
      try {
        setFetching(true);
        const res = await contractorService.getContractorById(id);
        if (res && res.success && res.data) {
          const c = res.data.contractor || res.data;
          setFormData({
            code: c.code || "",
            name: c.name || "",
            contractorType: c.contractorType || "",
            contactPerson: c.contactPerson || "",
            designation: c.designation || "",
            phone: c.phone || "",
            alternatePhone: c.alternatePhone || "",
            whatsappNo: c.whatsappNo || "",
            email: c.email || "",
            address: c.address || "",
            city: c.city || "",
            state: c.state || "",
            pincode: c.pincode || "",
            workCategories: Array.isArray(c.workCategories) ? c.workCategories : [],
            supportedTasks: Array.isArray(c.supportedTasks) ? c.supportedTasks : [],
            toolsVehicles: Array.isArray(c.toolsVehicles) ? c.toolsVehicles : [],
            workWillDoneBy: c.workWillDoneBy || "",
            commercialTerms: c.commercialTerms || "",
            availability: c.availability || "Available",
            documents: Array.isArray(c.documents) ? c.documents : [],
            status: c.status || "Active",
            remarks: c.remarks || ""
          });
        } else {
          toast.error("Could not load contractor information");
        }
      } catch (err) {
        console.error("Error loading contractor:", err);
        toast.error("Failed to load contractor details from server");
      } finally {
        setFetching(false);
      }
    };
    fetchContractorData();
  }, [id]);

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

          // Match state in INDIAN_STATES
          const matchedState = INDIAN_STATES.find(
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
          toast.success(`Location auto-filled: ${apiDistrict}, ${matchedState} 📍`);
        } else {
          toast.warn("Invalid Pincode or no location found");
        }
      } catch (err) {
        console.error("Error fetching pincode:", err);
      } finally {
        setIsFetchingPincode(false);
      }
    }
  };

  // Outside click listener to auto-close any open DDL
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeRef.current && !typeRef.current.contains(event.target)) setIsTypeOpen(false);
      if (workCatRef.current && !workCatRef.current.contains(event.target)) setIsWorkCatOpen(false);
      if (tasksRef.current && !tasksRef.current.contains(event.target)) setIsTasksOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(event.target)) setIsToolsOpen(false);
      if (workerRef.current && !workerRef.current.contains(event.target)) setIsWorkerOpen(false);
      if (stateRef.current && !stateRef.current.contains(event.target)) setIsStateOpen(false);
      if (cityRef.current && !cityRef.current.contains(event.target)) setIsCityOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered dropdown lists
  const filteredContractorTypes = useMemo(() => {
    return CONTRACTOR_TYPES.filter((item) =>
      item.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [typeSearch]);

  const filteredWorkCategories = useMemo(() => {
    return WORK_CATEGORIES_LIST.filter((item) =>
      item.toLowerCase().includes(workCatSearch.toLowerCase())
    );
  }, [workCatSearch]);

  const filteredTasks = useMemo(() => {
    return SUPPORTED_TASKS_LIST.filter((item) =>
      item.toLowerCase().includes(tasksSearch.toLowerCase())
    );
  }, [tasksSearch]);

  const filteredTools = useMemo(() => {
    return TOOLS_VEHICLES_LIST.filter((item) =>
      item.toLowerCase().includes(toolsSearch.toLowerCase())
    );
  }, [toolsSearch]);

  const filteredWorkers = useMemo(() => {
    return WORK_WILL_DONE_BY_LIST.filter((item) =>
      item.toLowerCase().includes(workerSearch.toLowerCase())
    );
  }, [workerSearch]);

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

  // Remove single badge pill
  const removeSelection = (field, value, e) => {
    if (e) e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((item) => item !== value)
    }));
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

    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = "Contractor / Company Name is required.";
    } else if (nameVal.length < 2) {
      newErrors.name = "Contractor Name must be at least 2 characters long.";
    } else if (/\d/.test(nameVal)) {
      newErrors.name = "Numbers are not allowed in Contractor Name.";
    }

    if (!formData.contractorType) {
      newErrors.contractorType = "Please select a Contractor Type.";
    }

    const contactVal = formData.contactPerson.trim();
    if (!contactVal) {
      newErrors.contactPerson = "Primary Contact Person is required.";
    } else if (contactVal.length < 2) {
      newErrors.contactPerson = "Contact person name must be at least 2 characters.";
    } else if (/\d/.test(contactVal)) {
      newErrors.contactPerson = "Numbers are not allowed in Contact Person name.";
    }

    const phoneClean = formData.phone.replace(/\D/g, "");
    if (!phoneClean) {
      newErrors.phone = "Primary Contact Number is required.";
    } else if (phoneClean.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    } else if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number (starts with 6-9).";
    }

    if (formData.whatsappNo && formData.whatsappNo.trim()) {
      const waClean = formData.whatsappNo.replace(/\D/g, "");
      if (waClean.length !== 10) {
        newErrors.whatsappNo = "WhatsApp number must be exactly 10 digits.";
      } else if (!/^[6-9]\d{9}$/.test(waClean)) {
        newErrors.whatsappNo = "Please enter a valid 10-digit WhatsApp number (starts with 6-9).";
      }
    }

    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
      }
    }

    if (!formData.workCategories || formData.workCategories.length === 0) {
      newErrors.workCategories = "Please select at least one Work Category.";
    }

    if (formData.pincode && formData.pincode.trim()) {
      const pinClean = formData.pincode.replace(/\D/g, "");
      if (pinClean.length !== 6) {
        newErrors.pincode = "Pincode must be exactly 6 digits.";
      }
    }

    if (!formData.status) {
      newErrors.status = "Status is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all mandatory fields (*)");
      return;
    }

    try {
      setLoading(true);
      let res;
      if (isEdit) {
        res = await contractorService.updateContractor(id, formData);
      } else {
        res = await contractorService.createContractor(formData);
      }

      if (res && res.success) {
        toast.success(res.message || `Contractor "${formData.name}" ${isEdit ? "updated" : "added"} successfully!`);
        navigate("/sales/master/suplire-and-contractor");
      } else {
        toast.error(res?.message || `Failed to ${isEdit ? "update" : "add"} contractor`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-2 font-sans">
      {/* Top Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-xl px-4 py-2.5 shadow-md border border-blue-700/50">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Back"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="p-1.5 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
              <FaHardHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {isEdit ? "Edit Contractor" : "Add Contractor"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                  <HiSparkles className="w-2.5 h-2.5 text-blue-300" /> {isEdit ? "Edit Mode" : "New Entry"}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/90 leading-none mt-0.5">
                {isEdit
                  ? `Update contractor profile, workforce details, and execution scope.`
                  : "Register civil subcontractors, workforce agencies, and labor contracts."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE CLEAN FORM CONTAINER (Without separate Section Cards) */}
      <form
        id="contractor-master-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Contractor Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Contractor Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. VEN-CON-1001"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.code ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-slate-50"
              }`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          {/* 2. Contractor / Company Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Contractor / Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onKeyDown={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[0-9]/g, "");
                setFormData({ ...formData, name: val });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g. Royal Civil & Structures Pvt Ltd"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.name ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* 3. Contractor Type (Searchable Single DDL with Close Option) */}
          <div className="relative" ref={typeRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Contractor Type <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.contractorType ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.contractorType ? "text-slate-800" : "text-slate-400"}>
                {formData.contractorType || "Select Contractor Type"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.contractorType && <p className="text-xs text-red-500 mt-1">{errors.contractorType}</p>}

            {isTypeOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search contractor type..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsTypeOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
                    title="Close"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
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
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 ${
                          formData.contractorType === type ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                        }`}
                      >
                        <span>{type}</span>
                        {formData.contractorType === type && <FaCheck className="w-3 h-3 text-blue-600" />}
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-slate-400 text-center">No type found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 14. Work Categories (MULTI-SELECT DDL WITH CLOSE BUTTON & PILLS) */}
          <div className="relative" ref={workCatRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Work Categories <span className="text-red-500">*</span>
              </label>
              {formData.workCategories.length > 0 && (
                <span className="text-xs text-blue-600 font-semibold">
                  {formData.workCategories.length} selected
                </span>
              )}
            </div>
            <div
              onClick={() => setIsWorkCatOpen(!isWorkCatOpen)}
              className={`w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5 ${
                errors.workCategories ? "border-red-500 bg-red-50/40" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.workCategories.length > 0 ? (
                  formData.workCategories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {cat}
                      <span
                        onClick={(e) => removeSelection("workCategories", cat, e)}
                        className="hover:text-red-500 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select Categories...</span>
                )}
              </div>
              <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>
            {errors.workCategories && (
              <p className="text-xs text-red-500 mt-1">{errors.workCategories}</p>
            )}

            {isWorkCatOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={workCatSearch}
                    onChange={(e) => setWorkCatSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsWorkCatOpen(false)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredWorkCategories.map((cat) => {
                    const isSelected = formData.workCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => toggleSelection("workCategories", cat)}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 ${
                          isSelected ? "bg-blue-50 text-blue-800 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span>{cat}</span>
                        </div>
                        {isSelected && <FaCheck className="w-3 h-3 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 15. Supported Tasks (MULTI-SELECT DDL WITH CLOSE BUTTON & PILLS) */}
          <div className="relative" ref={tasksRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Supported Tasks
              </label>
              {formData.supportedTasks.length > 0 && (
                <span className="text-xs text-indigo-600 font-semibold">
                  {formData.supportedTasks.length} mapped
                </span>
              )}
            </div>
            <div
              onClick={() => setIsTasksOpen(!isTasksOpen)}
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5"
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.supportedTasks.length > 0 ? (
                  formData.supportedTasks.map((task) => (
                    <span
                      key={task}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {task}
                      <span
                        onClick={(e) => removeSelection("supportedTasks", task, e)}
                        className="hover:text-red-500 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select Supported Tasks...</span>
                )}
              </div>
              <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>

            {isTasksOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search supported task..."
                    value={tasksSearch}
                    onChange={(e) => setTasksSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsTasksOpen(false)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredTasks.map((task) => {
                    const isSelected = formData.supportedTasks.includes(task);
                    return (
                      <div
                        key={task}
                        onClick={() => toggleSelection("supportedTasks", task)}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-indigo-50 ${
                          isSelected ? "bg-indigo-50 text-indigo-800 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-indigo-600 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span>{task}</span>
                        </div>
                        {isSelected && <FaCheck className="w-3 h-3 text-indigo-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 16. Tools / Vehicle Available (MULTI-SELECT DDL WITH CLOSE BUTTON & PILLS) */}
          <div className="relative" ref={toolsRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Tools / Vehicles Available
              </label>
              {formData.toolsVehicles.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {formData.toolsVehicles.length} selected
                </span>
              )}
            </div>
            <div
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5"
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.toolsVehicles.length > 0 ? (
                  formData.toolsVehicles.map((tool) => (
                    <span
                      key={tool}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {tool}
                      <span
                        onClick={(e) => removeSelection("toolsVehicles", tool, e)}
                        className="hover:text-red-500 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select Tools / Vehicles...</span>
                )}
              </div>
              <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>

            {isToolsOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search tool or vehicle..."
                    value={toolsSearch}
                    onChange={(e) => setToolsSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsToolsOpen(false)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredTools.map((tool) => {
                    const isSelected = formData.toolsVehicles.includes(tool);
                    return (
                      <div
                        key={tool}
                        onClick={() => toggleSelection("toolsVehicles", tool)}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-emerald-50 ${
                          isSelected ? "bg-emerald-50 text-emerald-800 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span>{tool}</span>
                        </div>
                        {isSelected && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Work Will Done By (Searchable Single DDL with Close Option) */}
          <div className="relative" ref={workerRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Work Will Done By (Executing Party)
            </label>
            <div
              onClick={() => setIsWorkerOpen(!isWorkerOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.workWillDoneBy ? "text-slate-800" : "text-slate-400"}>
                {formData.workWillDoneBy || "Select Worker Execution Model"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isWorkerOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search worker model..."
                    value={workerSearch}
                    onChange={(e) => setWorkerSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsWorkerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
                    title="Close"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredWorkers.map((worker) => (
                    <div
                      key={worker}
                      onClick={() => {
                        setFormData({ ...formData, workWillDoneBy: worker });
                        setIsWorkerOpen(false);
                        setWorkerSearch("");
                      }}
                      className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-blue-50 hover:text-blue-700 ${
                        formData.workWillDoneBy === worker ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{worker}</span>
                      {formData.workWillDoneBy === worker && <FaCheck className="w-3 h-3 text-blue-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Primary Contact Person */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Primary Contact Person <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.contactPerson}
              onKeyDown={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[0-9]/g, "");
                setFormData({ ...formData, contactPerson: val });
                if (errors.contactPerson) setErrors({ ...errors, contactPerson: "" });
              }}
              placeholder="e.g. Ramesh Chandra Sharma"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.contactPerson ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
          </div>

          {/* 5. Designation */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Owner / Site Supervisor"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* 6. Primary Contact No. */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Primary Contact No. <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              maxLength={10}
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, phone: val });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              placeholder="e.g. 9876543210"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* 7. Alternate Contact No. */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Alternate Contact No.</label>
            <input
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="e.g. 9822011223"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* 8. WhatsApp No. */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">WhatsApp No.</label>
            <input
              type="tel"
              maxLength={10}
              value={formData.whatsappNo}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                setFormData({ ...formData, whatsappNo: val });
                if (errors.whatsappNo) setErrors({ ...errors, whatsappNo: "" });
              }}
              placeholder="e.g. 9876543210"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.whatsappNo ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.whatsappNo && <p className="text-xs text-red-500 mt-1">{errors.whatsappNo}</p>}
          </div>

          {/* 9. Email Address */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="e.g. contact@contractor.com"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                errors.email ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* 10. Address (Takes 2 cols on md+) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Address / Yard Location</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Office / Yard address, street name, landmark..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* 11. City (Searchable DDL with Close) */}
          <div className="relative" ref={cityRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">City</label>
            <div
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.city ? "text-slate-800" : "text-slate-400"}>
                {formData.city || "Select City"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isCityOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCityOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
                    title="Close"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filteredCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => {
                        setFormData({ ...formData, city });
                        setIsCityOpen(false);
                        setCitySearch("");
                      }}
                      className="px-3.5 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 12. State (Searchable DDL with Close) */}
          <div className="relative" ref={stateRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">State</label>
            <div
              onClick={() => setIsStateOpen(!isStateOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.state ? "text-slate-800" : "text-slate-400"}>
                {formData.state || "Select State"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isStateOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsStateOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200"
                    title="Close"
                  >
                    <FaTimes className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filteredStates.map((state) => (
                    <div
                      key={state}
                      onClick={() => {
                        setFormData({ ...formData, state });
                        setIsStateOpen(false);
                        setStateSearch("");
                      }}
                      className="px-3.5 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700"
                    >
                      {state}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 13. Pincode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">Pincode</label>
              {isFetchingPincode && (
                <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                  <FaSpinner className="w-3 h-3 animate-spin" /> Fetching location...
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="e.g. 400001"
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 ${
                  errors.pincode ? "border-red-500 bg-red-50/50" : "border-slate-200"
                }`}
              />
              {isFetchingPincode && (
                <div className="absolute right-3.5 top-3 text-blue-600">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
            {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            <p className="text-xs text-slate-400 mt-1">Enter 6-digit PIN to auto-fetch City & State</p>
          </div>

          {/* 18. Availability */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Availability</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 cursor-pointer"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* 20. Status */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* 19. Documents Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Documents (Agreement, Proof, etc.)
            </label>
            <div className="border border-dashed border-slate-200 rounded-lg p-2.5 text-center hover:border-blue-400 transition-colors bg-slate-50/60">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                id="contractor-doc-upload"
                className="hidden"
              />
              <label htmlFor="contractor-doc-upload" className="cursor-pointer flex items-center justify-center gap-2">
                <FaCloudUploadAlt className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700 hover:text-blue-700">
                  Upload Files
                </span>
                <span className="text-xs text-slate-400">(Max 5MB)</span>
              </label>
            </div>

            {formData.documents.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-24 overflow-y-auto">
                {formData.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FaFileAlt className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{doc.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(idx)}
                      className="text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                    >
                      <FaTrashAlt className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 17. Rate / Commercial Terms */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Rate / Commercial Terms</label>
            <textarea
              rows={2}
              value={formData.commercialTerms}
              onChange={(e) => setFormData({ ...formData, commercialTerms: e.target.value })}
              placeholder="e.g. Civil RCC work @ ₹45/sq.ft, Shuttering @ ₹28/sq.ft. Payment cycle: 15 days..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          {/* 21. Remarks */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Remarks / Notes</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Internal supervisor notes, quality track record..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate("/sales/master/suplire-and-contractor")}
            className="px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || fetching}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>{isEdit ? "Updating..." : "Saving..."}</span>
              </>
            ) : fetching ? (
              <>
                <FaSpinner className="w-4 h-4 animate-spin" />
                <span>Loading Details...</span>
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4" />
                <span>{isEdit ? "Update Contractor" : "Save Contractor"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddContractorComponent;
