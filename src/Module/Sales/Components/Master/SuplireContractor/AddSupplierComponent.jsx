import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  FaTimes,
  FaSpinner
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { supplierService } from "../../../services/supplierService";


// Master categories
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

// Supplier Categories
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
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "VEN-SUP-" + Math.floor(1000 + Math.random() * 9000),
    name: "",
    supplierType: "",
    supplierCategories: [],
    contactPerson: "",
    designation: "",
    phone: "",
    alternatePhone: "",
    whatsappNo: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    pan: "",
    msmeNo: "",
    materialsSupplied: [],
    paymentTerms: "",
    creditLimit: "",
    deliveryLeadTime: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    documents: [],
    status: "Active",
    remarks: ""
  });

  // Dropdown Open/Close states
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMaterialOpen, setIsMaterialOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);

  // Search states for DDLs
  const [typeSearch, setTypeSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [materialSearch, setMaterialSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // Refs for Outside Click detection
  const typeRef = useRef(null);
  const categoryRef = useRef(null);
  const materialRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // Errors state
  const [errors, setErrors] = useState({});
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);

  // Fetch existing supplier data if in edit mode
  useEffect(() => {
    if (!id) return;
    const fetchSupplierData = async () => {
      try {
        setFetching(true);
        const res = await supplierService.getSupplierById(id);
        if (res && res.success && res.data) {
          const s = res.data.supplier || res.data;
          setFormData({
            code: s.code || "",
            name: s.name || "",
            supplierType: s.supplierType || "",
            supplierCategories: Array.isArray(s.supplierCategories) ? s.supplierCategories : [],
            contactPerson: s.contactPerson || "",
            designation: s.designation || "",
            phone: s.phone || "",
            alternatePhone: s.alternatePhone || "",
            whatsappNo: s.whatsappNo || "",
            email: s.email || "",
            address: s.address || "",
            city: s.city || "",
            state: s.state || "",
            pincode: s.pincode || "",
            gstin: s.gstin || "",
            pan: s.pan || "",
            msmeNo: s.msmeNo || "",
            materialsSupplied: Array.isArray(s.materialsSupplied) ? s.materialsSupplied : [],
            paymentTerms: s.paymentTerms || "",
            creditLimit: s.creditLimit || "",
            deliveryLeadTime: s.deliveryLeadTime || "",
            bankName: s.bankName || "",
            accountHolderName: s.accountHolderName || "",
            accountNumber: s.accountNumber || "",
            ifsc: s.ifsc || "",
            documents: Array.isArray(s.documents) ? s.documents : [],
            status: s.status || "Active",
            remarks: s.remarks || ""
          });
        } else {
          toast.error("Could not load supplier information");
        }
      } catch (err) {
        console.error("Error loading supplier:", err);
        toast.error("Failed to load supplier details from server");
      } finally {
        setFetching(false);
      }
    };
    fetchSupplierData();
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
      if (categoryRef.current && !categoryRef.current.contains(event.target)) setIsCategoryOpen(false);
      if (materialRef.current && !materialRef.current.contains(event.target)) setIsMaterialOpen(false);
      if (stateRef.current && !stateRef.current.contains(event.target)) setIsStateOpen(false);
      if (cityRef.current && !cityRef.current.contains(event.target)) setIsCityOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered dropdown options
  const filteredSupplierTypes = useMemo(() => {
    return INITIAL_SUPPLIER_TYPES.filter((item) =>
      item.toLowerCase().includes(typeSearch.toLowerCase())
    );
  }, [typeSearch]);

  const filteredCategories = useMemo(() => {
    return SUPPLIER_CATEGORIES.filter((item) =>
      item.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const filteredMaterials = useMemo(() => {
    return MATERIAL_LOOKUP_LIST.filter((item) =>
      item.toLowerCase().includes(materialSearch.toLowerCase())
    );
  }, [materialSearch]);

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

  // Remove single selected pill
  const removeSelection = (field, value, e) => {
    e.stopPropagation();
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((item) => item !== value)
    }));
  };

  // File Upload Handling
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    const maxSizeBytes = 5 * 1024 * 1024;

    files.forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        toast.error(`Invalid file type: ${file.name}. Only PDF, DOC, JPG, PNG allowed.`);
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`File too large: ${file.name}. Maximum limit is 5MB.`);
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

  // Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Code
    if (!formData.code.trim()) newErrors.code = "Supplier Code is required.";

    // 2. Name validation (minimum 2 characters, valid alphabets/business name)
    const nameVal = formData.name.trim();
    if (!nameVal) {
      newErrors.name = "Supplier Name is required.";
    } else if (nameVal.length < 2) {
      newErrors.name = "Supplier Name must be at least 2 characters long.";
    } else if (/\d/.test(nameVal)) {
      newErrors.name = "Numbers are not allowed in Supplier Name.";
    }

    // 3. Supplier Type
    if (!formData.supplierType) newErrors.supplierType = "Supplier Type is required.";

    // 4. Contact Person
    const contactVal = formData.contactPerson.trim();
    if (!contactVal) {
      newErrors.contactPerson = "Primary Contact Person is required.";
    } else if (contactVal.length < 2) {
      newErrors.contactPerson = "Contact person name must be at least 2 characters.";
    } else if (/\d/.test(contactVal)) {
      newErrors.contactPerson = "Numbers are not allowed in Contact Person name.";
    }

    // 5. Phone Number validation (Strict 10 digit Indian mobile: starts with 6, 7, 8, 9)
    const phoneClean = formData.phone.replace(/\D/g, "");
    if (!phoneClean) {
      newErrors.phone = "Primary Contact Number is required.";
    } else if (phoneClean.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    } else if (!/^[6-9]\d{9}$/.test(phoneClean)) {
      newErrors.phone = "Please enter a valid 10-digit mobile number (starts with 6-9).";
    }

    // 6. WhatsApp Number validation (Optional, but if entered must be 10 digits starting with 6-9)
    if (formData.whatsappNo && formData.whatsappNo.trim()) {
      const waClean = formData.whatsappNo.replace(/\D/g, "");
      if (waClean.length !== 10) {
        newErrors.whatsappNo = "WhatsApp number must be exactly 10 digits.";
      } else if (!/^[6-9]\d{9}$/.test(waClean)) {
        newErrors.whatsappNo = "Please enter a valid 10-digit WhatsApp number (starts with 6-9).";
      }
    }

    // 7. Email Address validation (Strict email regex)
    if (formData.email && formData.email.trim()) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address (e.g. name@domain.com).";
      }
    }

    // 8. Address
    if (!formData.address.trim()) newErrors.address = "Address is required.";

    // 9. City & State
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.state) newErrors.state = "State is required.";

    // 10. Pincode validation (Optional or if entered must be 6 digits)
    if (formData.pincode && formData.pincode.trim()) {
      const pinClean = formData.pincode.replace(/\D/g, "");
      if (pinClean.length !== 6) {
        newErrors.pincode = "Pincode must be exactly 6 digits.";
      }
    }

    // 11. GSTIN
    if (formData.gstin.trim()) {
      const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstinPattern.test(formData.gstin.trim().toUpperCase())) {
        newErrors.gstin = "Invalid GSTIN format (e.g. 27AABCV1234A1Z5).";
      }
    }

    // 12. PAN
    if (formData.pan.trim()) {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panPattern.test(formData.pan.trim().toUpperCase())) {
        newErrors.pan = "Invalid PAN format (e.g. ABCDE1234F).";
      }
    }

    // 13. Materials Supplied
    if (!formData.materialsSupplied || formData.materialsSupplied.length === 0) {
      newErrors.materialsSupplied = "Please select at least one Material / Service.";
    }

    // 14. IFSC
    if (formData.ifsc.trim()) {
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscPattern.test(formData.ifsc.trim().toUpperCase())) {
        newErrors.ifsc = "Invalid IFSC format (e.g. SBIN0001234).";
      }
    }

    // 15. Status
    if (!formData.status) newErrors.status = "Status is required.";

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

      const payload = {
        ...formData,
        creditLimit: formData.creditLimit ? Number(formData.creditLimit) : 0,
        deliveryLeadTime: formData.deliveryLeadTime ? Number(formData.deliveryLeadTime) : 0,
        gstin: formData.gstin ? formData.gstin.toUpperCase() : "",
        pan: formData.pan ? formData.pan.toUpperCase() : "",
        ifsc: formData.ifsc ? formData.ifsc.toUpperCase() : ""
      };

      let res;
      if (isEdit) {
        res = await supplierService.updateSupplier(id, payload);
      } else {
        res = await supplierService.createSupplier(payload);
      }

      if (res && res.success) {
        toast.success(res.message || `Supplier "${formData.name}" ${isEdit ? "updated" : "added"} successfully!`);
        navigate("/sales/master/suplire-and-contractor");
      } else {
        toast.error(res?.message || `Failed to ${isEdit ? "update" : "add"} supplier`);
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
      <div className="sticky top-0 z-10 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-xl px-4 py-2.5 shadow-md border border-teal-700/50">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor")}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Back"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
              <FaTruck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {isEdit ? "Edit Supplier" : "Add Supplier"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <HiSparkles className="w-2.5 h-2.5 text-emerald-300" /> {isEdit ? "Edit Mode" : "New Entry"}
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 leading-none mt-0.5">
                {isEdit
                  ? `Update supplier profile, procurement terms, tax info, and bank details.`
                  : "Register supplier profile, procurement terms, tax info, and bank details."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SINGLE CLEAN FORM CONTAINER (Without separate Section Cards) */}
      <form
        id="supplier-master-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Supplier Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Supplier Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="e.g. VEN-SUP-1001"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.code ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-slate-50"
              }`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
          </div>

          {/* Supplier Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Supplier Name <span className="text-red-500">*</span>
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
              placeholder="e.g. Apex Steel & Cement Distributors"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.name ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Supplier Type (Searchable Single DDL with Close Option) */}
          <div className="relative" ref={typeRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Supplier Type <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.supplierType ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.supplierType ? "text-slate-800" : "text-slate-400"}>
                {formData.supplierType || "Select Supplier Type"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.supplierType && <p className="text-xs text-red-500 mt-1">{errors.supplierType}</p>}

            {isTypeOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search type..."
                    value={typeSearch}
                    onChange={(e) => setTypeSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-emerald-50 hover:text-emerald-700 ${
                          formData.supplierType === type ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                        }`}
                      >
                        <span>{type}</span>
                        {formData.supplierType === type && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-slate-400 text-center">No type found</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Supplier Category (MULTI-SELECT DDL WITH CLOSE BUTTON & PILLS) */}
          <div className="relative" ref={categoryRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Supplier Category
              </label>
              {formData.supplierCategories.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {formData.supplierCategories.length} selected
                </span>
              )}
            </div>
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full min-h-[42px] px-3 py-1.5 border border-slate-200 rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5"
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.supplierCategories.length > 0 ? (
                  formData.supplierCategories.map((cat) => (
                    <span
                      key={cat}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {cat}
                      <span
                        onClick={(e) => removeSelection("supplierCategories", cat, e)}
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

            {isCategoryOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(false)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredCategories.map((cat) => {
                    const isSelected = formData.supplierCategories.includes(cat);
                    return (
                      <div
                        key={cat}
                        onClick={() => toggleSelection("supplierCategories", cat)}
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
                          <span>{cat}</span>
                        </div>
                        {isSelected && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Materials / Services Supplied (MULTI-SELECT DDL WITH CLOSE BUTTON & PILLS) */}
          <div className="relative" ref={materialRef}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">
                Materials / Services <span className="text-red-500">*</span>
              </label>
              {formData.materialsSupplied.length > 0 && (
                <span className="text-xs text-emerald-600 font-semibold">
                  {formData.materialsSupplied.length} linked
                </span>
              )}
            </div>
            <div
              onClick={() => setIsMaterialOpen(!isMaterialOpen)}
              className={`w-full min-h-[42px] px-3 py-1.5 border rounded-lg text-sm cursor-pointer bg-white flex items-center justify-between flex-wrap gap-1.5 ${
                errors.materialsSupplied ? "border-red-500 bg-red-50/40" : "border-slate-200"
              }`}
            >
              <div className="flex flex-wrap gap-1.5 flex-1">
                {formData.materialsSupplied.length > 0 ? (
                  formData.materialsSupplied.map((mat) => (
                    <span
                      key={mat}
                      className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {mat}
                      <span
                        onClick={(e) => removeSelection("materialsSupplied", mat, e)}
                        className="hover:text-red-500 cursor-pointer font-bold text-sm"
                      >
                        ×
                      </span>
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">Select Materials / Services...</span>
                )}
              </div>
              <FaChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
            </div>
            {errors.materialsSupplied && (
              <p className="text-xs text-red-500 mt-1">{errors.materialsSupplied}</p>
            )}

            {isMaterialOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search material..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsMaterialOpen(false)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredMaterials.map((mat) => {
                    const isSelected = formData.materialsSupplied.includes(mat);
                    return (
                      <div
                        key={mat}
                        onClick={() => toggleSelection("materialsSupplied", mat)}
                        className={`px-3.5 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-emerald-50 ${
                          isSelected ? "bg-indigo-50 text-indigo-800 font-semibold" : "text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded text-emerald-600 focus:ring-0 cursor-pointer w-4 h-4"
                          />
                          <span>{mat}</span>
                        </div>
                        {isSelected && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Primary Contact Person */}
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
              placeholder="e.g. Ramesh Kumar"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.contactPerson ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson}</p>}
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Designation</label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g. Sales Head / Accounts"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Primary Contact No */}
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
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.phone ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Alternate Contact No */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Alternate Contact No.</label>
            <input
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              placeholder="e.g. 9822011223"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* WhatsApp No */}
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
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.whatsappNo ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.whatsappNo && <p className="text-xs text-red-500 mt-1">{errors.whatsappNo}</p>}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              placeholder="e.g. sales@vendor.com"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.email ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Address (Full-width or 2 cols) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Registered Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (errors.address) setErrors({ ...errors, address: "" });
              }}
              placeholder="Warehouse / Office address, Industrial Area..."
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.address ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
          </div>

          {/* City (Searchable DDL with Close) */}
          <div className="relative" ref={cityRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsCityOpen(!isCityOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.city ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.city ? "text-slate-800" : "text-slate-400"}>
                {formData.city || "Select City"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}

            {isCityOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search city..."
                    value={citySearch}
                    onChange={(e) => setCitySearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        if (errors.city) setErrors({ ...errors, city: "" });
                      }}
                      className="px-3.5 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* State (Searchable DDL with Close) */}
          <div className="relative" ref={stateRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              State <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsStateOpen(!isStateOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.state ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.state ? "text-slate-800" : "text-slate-400"}>
                {formData.state || "Select State"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}

            {isStateOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2.5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search state..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                        if (errors.state) setErrors({ ...errors, state: "" });
                      }}
                      className="px-3.5 py-2 text-sm cursor-pointer hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {state}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pincode */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-bold text-slate-700">Pincode</label>
              {isFetchingPincode && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
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
                className={`w-full px-3.5 py-2.5 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                  errors.pincode ? "border-red-500 bg-red-50/50" : "border-slate-200"
                }`}
              />
              {isFetchingPincode && (
                <div className="absolute right-3.5 top-3 text-emerald-600">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                </div>
              )}
            </div>
            {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
            <p className="text-xs text-slate-400 mt-1">Enter 6-digit PIN to auto-fetch City & State</p>
          </div>

          {/* GSTIN */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">GSTIN</label>
            <input
              type="text"
              maxLength={15}
              value={formData.gstin}
              onChange={(e) => {
                setFormData({ ...formData, gstin: e.target.value.toUpperCase() });
                if (errors.gstin) setErrors({ ...errors, gstin: "" });
              }}
              placeholder="e.g. 27AABCT1332F1Z8"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-semibold uppercase ${
                errors.gstin ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.gstin && <p className="text-xs text-red-500 mt-1">{errors.gstin}</p>}
          </div>

          {/* PAN */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">PAN Number</label>
            <input
              type="text"
              maxLength={10}
              value={formData.pan}
              onChange={(e) => {
                setFormData({ ...formData, pan: e.target.value.toUpperCase() });
                if (errors.pan) setErrors({ ...errors, pan: "" });
              }}
              placeholder="e.g. AABCT1332F"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-semibold uppercase ${
                errors.pan ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.pan && <p className="text-xs text-red-500 mt-1">{errors.pan}</p>}
          </div>

          {/* MSME Registration */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">MSME / Udyam No.</label>
            <input
              type="text"
              value={formData.msmeNo}
              onChange={(e) => setFormData({ ...formData, msmeNo: e.target.value })}
              placeholder="e.g. UDYAM-MH-01-0012345"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Payment Terms */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Terms</label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer"
            >
              <option value="">-- Select Terms --</option>
              {PAYMENT_TERMS_LIST.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>

          {/* Credit Limit */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Credit Limit (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.creditLimit}
              onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
              placeholder="e.g. 500000"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Delivery Lead Time */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Delivery Lead Time (Days)</label>
            <input
              type="number"
              min="0"
              value={formData.deliveryLeadTime}
              onChange={(e) => setFormData({ ...formData, deliveryLeadTime: e.target.value })}
              placeholder="e.g. 2"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Bank Name</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="e.g. HDFC Bank"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Account Holder Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Holder Name</label>
            <input
              type="text"
              value={formData.accountHolderName}
              onKeyDown={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/[0-9]/g, "");
                setFormData({ ...formData, accountHolderName: val });
              }}
              placeholder="e.g. Apex Materials Pvt Ltd"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Account Number</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="e.g. 50200012345678"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">IFSC Code</label>
            <input
              type="text"
              maxLength={11}
              value={formData.ifsc}
              onChange={(e) => {
                setFormData({ ...formData, ifsc: e.target.value.toUpperCase() });
                if (errors.ifsc) setErrors({ ...errors, ifsc: "" });
              }}
              placeholder="e.g. HDFC0001234"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono uppercase ${
                errors.ifsc ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.ifsc && <p className="text-xs text-red-500 mt-1">{errors.ifsc}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Documents Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Documents (GST, Cheque, etc.)
            </label>
            <div className="border border-dashed border-slate-200 rounded-lg p-2.5 text-center hover:border-emerald-400 transition-colors bg-slate-50/60">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                id="supplier-doc-upload"
                className="hidden"
              />
              <label htmlFor="supplier-doc-upload" className="cursor-pointer flex items-center justify-center gap-2">
                <FaCloudUploadAlt className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700 hover:text-emerald-700">
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
                      <FaFileAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
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

          {/* Remarks (Takes 2 columns on larger screens) */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Remarks / Notes</label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Internal remarks, special credit terms, dispatch notes..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
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
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
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
                <span>{isEdit ? "Update Supplier" : "Save Supplier"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSupplierComponent;