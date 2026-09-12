import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaBoxes,
  FaSave,
  FaCheck,
  FaChevronDown,
  FaTimes,
  FaSpinner,
  FaTag,
  FaWarehouse,
  FaCloudUploadAlt,
  FaFileAlt,
  FaTrashAlt,
  FaSearch,
  FaRupeeSign,
  FaInfoCircle
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import { supplierService } from "../../../services/supplierService";
import { materialService } from "../../../services/materialService";

// Local storage key for Material Master backup
export const MATERIAL_STORAGE_KEY = "dss_master_materials_data";

// Material Categories
export const MATERIAL_CATEGORIES = [
  "Roofing & Ceiling",
  "Pipes, Fittings & Sanitaryware",
  "Doors & Windows",
  "Bricks, Blocks & Aggregates",
  "Cement & Concrete",
  "Steel & Structural Metals",
  "Paints, Putty & Coatings",
  "Ceramic & Vitrified Tiles",
  "Electrical Cables & Switchgears",
  "Wood, Plywood & Timber",
  "Hardware & Fasteners",
  "Waterproofing & Construction Chemicals",
  "Glass & Aluminium Sections",
  "Safety Equipment & Consumables"
];

// Sub-categories mapped to Categories
export const SUB_CATEGORIES_MAP = {
  "Roofing & Ceiling": [
    "Roofing Sheet (Metal)",
    "Polycarbonate Roofing Sheet",
    "UPVC Corrugated Sheet",
    "False Ceiling Gypsum Board",
    "Mineral Fiber Ceiling Tiles",
    "Ceiling Grid / Channels"
  ],
  "Pipes, Fittings & Sanitaryware": [
    "CPVC Pipe",
    "UPVC Plumbing Pipe",
    "SWR Drainage Pipe",
    "GI Pipe & Fittings",
    "CPVC/UPVC Elbows & Tees",
    "Sanitaryware Fixtures & Traps"
  ],
  "Doors & Windows": [
    "Flush Door",
    "Panelled Timber Door",
    "Fire Rated Door",
    "Aluminium Sliding Windows",
    "UPVC Casement Windows",
    "Door Frames (Chowkhat)"
  ],
  "Bricks, Blocks & Aggregates": [
    "Fly Ash Bricks",
    "Red Clay Kiln Bricks",
    "AAC Lightweight Blocks",
    "Coarse Aggregate 20mm",
    "Coarse Aggregate 10mm",
    "M-Sand (Manufactured Sand)",
    "River Sand"
  ],
  "Cement & Concrete": [
    "OPC 53 Grade Cement",
    "OPC 43 Grade Cement",
    "PPC Blended Cement",
    "Ready Mix Concrete (RMC)",
    "White Portland Cement"
  ],
  "Steel & Structural Metals": [
    "TMT Rebar Fe550D",
    "TMT Rebar Fe500D",
    "Structural MS Channels & Beams",
    "MS Angle & Flats",
    "Binding Wire (18 Gauge)",
    "Welded Wire Mesh"
  ],
  "Paints, Putty & Coatings": [
    "Interior Acrylic Emulsion",
    "Exterior Weatherproof Coating",
    "White Cement Wall Putty",
    "Water-thinnable Primer",
    "Synthetic Enamel Paint"
  ],
  "Ceramic & Vitrified Tiles": [
    "Glazed Vitrified Tiles (GVT)",
    "Polished Vitrified Tiles (PVT)",
    "Ceramic Wall Tiles",
    "Anti-skid Ceramic Tiles",
    "Tile Adhesive & Epoxy Grout"
  ],
  "Electrical Cables & Switchgears": [
    "FR PVC Insulated Copper Wires",
    "Armoured Power Cable",
    "MCBs & Distribution Boards",
    "Modular Switches & Sockets",
    "PVC Conduit Pipes"
  ],
  "Wood, Plywood & Timber": [
    "Marine Ply (BWP Grade)",
    "Commercial Ply (MR Grade)",
    "Shuttering Plywood (Film Faced)",
    "Blockboard",
    "Hardwood / Sal Wood Beams"
  ],
  "Hardware & Fasteners": [
    "Anchor Fasteners & Bolts",
    "Drywall & Self-drilling Screws",
    "SS Door Hinges",
    "Mortise Locks & Cylinders",
    "Tower Bolts & Aldrops"
  ],
  "Waterproofing & Construction Chemicals": [
    "Liquid Waterproofing Compound",
    "Elastomeric Membrane",
    "Concrete Admixture / Plasticizer",
    "Micro Concrete / Repair Mortar",
    "Silicone & PU Sealants"
  ],
  "Glass & Aluminium Sections": [
    "Toughened Clear Glass 12mm",
    "Laminated Safety Glass",
    "Aluminium Powder Coated Sections",
    "Curtain Wall Profiles"
  ],
  "Safety Equipment & Consumables": [
    "Safety Helmets & Jackets",
    "Safety Shoes & Harness",
    "Welding Electrodes",
    "Cutting & Grinding Wheels",
    "Curing Compounds"
  ]
};

// Material Types (Required)
export const MATERIAL_TYPES = [
  "Construction Material",
  "Consumable",
  "Service",
  "Other"
];

// Base & Purchase UOMs
export const UOM_LIST = [
  "Nos / Pieces",
  "Bags (50kg)",
  "Metric Ton (MT)",
  "Kilogram (kg)",
  "Cubic Meter (cum)",
  "Cubic Feet (cft)",
  "Sq.Meter (sqm)",
  "Sq.Feet (sqft)",
  "Running Feet (rft)",
  "Running Meter (rm)",
  "Length / Piece",
  "Roll (90m)",
  "Bucket (20L)",
  "Litre (L)",
  "Brass",
  "Bundle",
  "Box / Carton",
  "Set",
  "Pair"
];

// Common Brands / Makes
export const COMMON_BRANDS = [
  "UltraTech",
  "Tata Tiscon",
  "Jindal Panther",
  "Astral Pipes",
  "Ashirvad",
  "Supreme",
  "Asian Paints",
  "Berger",
  "Kajaria",
  "Somany",
  "CenturyPly",
  "Greenply",
  "Polycab",
  "Havells",
  "Schneider",
  "Dr. Fixit",
  "Fosroc",
  "Magicrete",
  "Generic / Local",
  "Tata Steel",
  "JSW Steel"
];

// Supplier Types (Configured PMS Supplier Type)
export const SUPPLIER_TYPES = [
  "Manufacturer",
  "Authorized Distributor",
  "Wholesaler / Stockist",
  "Local Retail Supplier",
  "Direct Importer",
  "Trading Company",
  "Fabricator & Material Supplier",
  "Specialized Chemical Vendor"
];

// Storage Requirements
export const STORAGE_REQUIREMENTS = [
  "Dry & Covered Warehouse (Moisture Free)",
  "Open Yard (Weather Resistant)",
  "Covered Shed with Pallet Support",
  "Temperature Controlled (Cool & Dry)",
  "Hazardous / Chemical Storage Area",
  "Vertical Rack / Shelf Storage",
  "Flat Level Storage (No Stacking)"
];

const AddMaterialComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Registered suppliers list from API / Local
  const [registeredSuppliers, setRegisteredSuppliers] = useState([]);

  // Raw file objects selected for Cloudinary upload
  const [selectedFileObjects, setSelectedFileObjects] = useState([]);

  // Form State - 21 Fields
  const [formData, setFormData] = useState({
    code: "MAT-" + Math.floor(1000 + Math.random() * 9000), // 1. Material Code
    name: "",                                              // 2. Material Name (PMS Material Required)
    category: "",                                          // 3. Material Category
    subCategory: "",                                       // 4. Material Sub-Category
    materialType: "Construction Material",                 // 5. Material Type
    materialDetails: "",                                   // 6. Material Details (PMS MATERIAL DETAILS)
    specificationGrade: "",                                // 7. Specification / Grade
    baseUom: "",                                           // 8. Base UOM
    purchaseUom: "",                                       // 9. Purchase UOM
    conversionFactor: "",                                  // 10. Conversion Factor
    brand: "",                                             // 11. Brand / Make
    standardSpecCode: "",                                  // 12. Standard / Specification Code (IS/ASTM)
    preferredSupplier: "",                                 // 13. Preferred Supplier
    supplierType: "",                                      // 14. Supplier Type
    standardPurchaseRate: "",                              // 15. Standard Purchase Rate (₹)
    leadTimeDays: "",                                      // 16. Lead Time (Days)
    moq: "",                                               // 17. MOQ (Min Order Qty)
    storageRequirement: "",                                // 18. Storage Requirement
    documents: [],                                         // 19. Technical Document (Metadata/Existing Cloudinary URLs)
    status: "Active",                                      // 20. Status
    remarks: ""                                            // 21. Remarks
  });

  // Dropdown open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isBaseUomOpen, setIsBaseUomOpen] = useState(false);
  const [isPurchaseUomOpen, setIsPurchaseUomOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [isSupplierTypeOpen, setIsSupplierTypeOpen] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false);

  // Search filter states for DDLs
  const [categorySearch, setCategorySearch] = useState("");
  const [subCategorySearch, setSubCategorySearch] = useState("");
  const [baseUomSearch, setBaseUomSearch] = useState("");
  const [purchaseUomSearch, setPurchaseUomSearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [supplierSearch, setSupplierSearch] = useState("");

  // Refs for outside click detection
  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const typeRef = useRef(null);
  const baseUomRef = useRef(null);
  const purchaseUomRef = useRef(null);
  const brandRef = useRef(null);
  const supplierRef = useRef(null);
  const supplierTypeRef = useRef(null);
  const storageRef = useRef(null);

  // Validation Errors
  const [errors, setErrors] = useState({});

  // Outside click listener for all DDLs
  useEffect(() => {
    const handleMouseDown = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setIsCategoryOpen(false);
      if (subCategoryRef.current && !subCategoryRef.current.contains(e.target)) setIsSubCategoryOpen(false);
      if (typeRef.current && !typeRef.current.contains(e.target)) setIsTypeOpen(false);
      if (baseUomRef.current && !baseUomRef.current.contains(e.target)) setIsBaseUomOpen(false);
      if (purchaseUomRef.current && !purchaseUomRef.current.contains(e.target)) setIsPurchaseUomOpen(false);
      if (brandRef.current && !brandRef.current.contains(e.target)) setIsBrandOpen(false);
      if (supplierRef.current && !supplierRef.current.contains(e.target)) setIsSupplierOpen(false);
      if (supplierTypeRef.current && !supplierTypeRef.current.contains(e.target)) setIsSupplierTypeOpen(false);
      if (storageRef.current && !storageRef.current.contains(e.target)) setIsStorageOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Fetch registered suppliers for lookup
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await supplierService.getAllSuppliers({ limit: 100 });
        if (res?.data?.suppliers) {
          setRegisteredSuppliers(res.data.suppliers);
        } else if (res?.data && Array.isArray(res.data)) {
          setRegisteredSuppliers(res.data);
        }
      } catch (err) {
        setRegisteredSuppliers([
          { id: 1, name: "Apex Steel & Cement Distributors", supplierType: "Authorized Distributor" },
          { id: 2, name: "UltraTech Building Solutions Ltd.", supplierType: "Manufacturer" },
          { id: 3, name: "Tata Steel Procurement Hub", supplierType: "Manufacturer" },
          { id: 4, name: "Kajaria Ceramics Depot", supplierType: "Wholesaler / Stockist" },
          { id: 5, name: "Astral Poly Technik Ltd.", supplierType: "Manufacturer" },
          { id: 6, name: "National Plywood Corporation", supplierType: "Wholesaler / Stockist" }
        ]);
      }
    };
    fetchSuppliers();
  }, []);

  // Load existing data in Edit Mode (from Backend API, fallback to localStorage)
  useEffect(() => {
    if (!id) return;
    setFetching(true);
    const loadMaterial = async () => {
      try {
        let item = null;
        try {
          const res = await materialService.getMaterialById(id);
          if (res?.data?.data) {
            item = res.data.data;
          } else if (res?.data) {
            item = res.data;
          }
        } catch (apiErr) {
          console.warn("Backend fetch failed, checking local cache:", apiErr);
        }

        if (!item) {
          const stored = localStorage.getItem(MATERIAL_STORAGE_KEY);
          if (stored) {
            const list = JSON.parse(stored);
            item = list.find((m) => String(m._id || m.id) === String(id));
          }
        }

        if (item) {
          setFormData({
            code: item.code || "",
            name: item.name || "",
            category: item.category || "",
            subCategory: item.subCategory || "",
            materialType: item.materialType || "Construction Material",
            materialDetails: item.materialDetails || item.description || "",
            specificationGrade: item.specificationGrade || "",
            baseUom: item.baseUom || item.uom || "",
            purchaseUom: item.purchaseUom || "",
            conversionFactor: item.conversionFactor !== null && item.conversionFactor !== undefined ? String(item.conversionFactor) : "",
            brand: item.brand || "",
            standardSpecCode: item.standardSpecCode || "",
            preferredSupplier: item.preferredSupplier || "",
            supplierType: item.supplierType || "",
            standardPurchaseRate: item.standardPurchaseRate !== undefined && item.standardPurchaseRate !== "" 
              ? String(item.standardPurchaseRate) 
              : (item.unitRate !== undefined ? String(item.unitRate) : ""),
            leadTimeDays: item.leadTimeDays !== null && item.leadTimeDays !== undefined ? String(item.leadTimeDays) : "",
            moq: item.moq !== null && item.moq !== undefined ? String(item.moq) : "",
            storageRequirement: item.storageRequirement || "",
            documents: Array.isArray(item.documents) ? item.documents : [],
            status: item.status === "Inactive" ? "Inactive" : "Active",
            remarks: item.remarks || ""
          });
        } else {
          toast.error("Material record not found!");
        }
      } catch (err) {
        console.error("Error loading material:", err);
        toast.error("Could not load material details.");
      } finally {
        setFetching(false);
      }
    };

    loadMaterial();
  }, [id]);

  // Dependent Sub-categories based on selected Category
  const availableSubCategories = useMemo(() => {
    if (!formData.category) return [];
    return SUB_CATEGORIES_MAP[formData.category] || [];
  }, [formData.category]);

  // Filtered dropdown lists for search
  const filteredCategories = useMemo(() => {
    return MATERIAL_CATEGORIES.filter((c) =>
      c.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categorySearch]);

  const filteredSubCategories = useMemo(() => {
    return availableSubCategories.filter((s) =>
      s.toLowerCase().includes(subCategorySearch.toLowerCase())
    );
  }, [availableSubCategories, subCategorySearch]);

  const filteredBaseUoms = useMemo(() => {
    return UOM_LIST.filter((u) =>
      u.toLowerCase().includes(baseUomSearch.toLowerCase())
    );
  }, [baseUomSearch]);

  const filteredPurchaseUoms = useMemo(() => {
    return UOM_LIST.filter((u) =>
      u.toLowerCase().includes(purchaseUomSearch.toLowerCase())
    );
  }, [purchaseUomSearch]);

  const filteredBrands = useMemo(() => {
    return COMMON_BRANDS.filter((b) =>
      b.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandSearch]);

  const filteredSuppliers = useMemo(() => {
    return registeredSuppliers.filter((s) =>
      (s.name || "").toLowerCase().includes(supplierSearch.toLowerCase())
    );
  }, [registeredSuppliers, supplierSearch]);

  // File Upload Handler (Stores raw file objects for Cloudinary + preview metadata)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"];
    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    const newDocs = [];
    const newRawFiles = [];

    files.forEach((file) => {
      const ext = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        toast.error("Invalid file: " + file.name + ". Only PDF, DOC, JPG, PNG allowed.");
        return;
      }
      if (file.size > maxSizeBytes) {
        toast.error("File too large: " + file.name + ". Maximum size allowed is 5MB.");
        return;
      }
      newDocs.push({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB",
        type: ext
      });
      newRawFiles.push(file);
    });

    if (newDocs.length) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...newDocs]
      }));
      setSelectedFileObjects((prev) => [...prev, ...newRawFiles]);
      toast.success(newDocs.length + " file(s) selected for upload.");
    }
  };

  const removeDocument = (index) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
    setSelectedFileObjects((prev) => prev.filter((_, i) => i !== index));
  };

  // Supplier Style Form Validation
  const validateForm = () => {
    const errs = {};

    // 1. Material Code (Required)
    if (!formData.code.trim()) {
      errs.code = "Material Code is required.";
    } else if (formData.code.trim().length < 2) {
      errs.code = "Material Code must be at least 2 characters.";
    }

    // 2. Material Name (Required - PMS Material Required)
    if (!formData.name.trim()) {
      errs.name = "Material Name is required (Maps to PMS Material Required).";
    } else if (formData.name.trim().length < 2) {
      errs.name = "Material Name must be at least 2 characters.";
    }

    // 3. Material Category (Required)
    if (!formData.category) {
      errs.category = "Material Category is required.";
    }

    // 5. Material Type (Required)
    if (!formData.materialType) {
      errs.materialType = "Material Type is required.";
    }

    // 8. Base UOM (Required)
    if (!formData.baseUom) {
      errs.baseUom = "Base UOM is required.";
    }

    // 10. Conversion Factor (Optional, positive)
    if (formData.conversionFactor && Number(formData.conversionFactor) <= 0) {
      errs.conversionFactor = "Conversion Factor must be greater than 0.";
    }

    // 15. Standard Purchase Rate (Optional, positive)
    if (formData.standardPurchaseRate && Number(formData.standardPurchaseRate) < 0) {
      errs.standardPurchaseRate = "Standard Purchase Rate cannot be negative.";
    }

    // 16. Lead Time (Days - Optional, non-negative integer)
    if (formData.leadTimeDays && (Number(formData.leadTimeDays) < 0 || !Number.isInteger(Number(formData.leadTimeDays)))) {
      errs.leadTimeDays = "Lead time must be a valid non-negative number of days.";
    }

    // 17. MOQ (Optional, positive)
    if (formData.moq && Number(formData.moq) < 0) {
      errs.moq = "MOQ cannot be negative.";
    }

    // 20. Status (Required)
    if (!formData.status) {
      errs.status = "Status is required.";
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      window.scrollTo({ top: 100, behavior: "smooth" });
    }

    return Object.keys(errs).length === 0;
  };

  // Submit Handler with Multer + Cloudinary FormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all mandatory fields highlighted in red.");
      return;
    }

    setLoading(true);

    try {
      const rateNum = Number(formData.standardPurchaseRate) || 0;

      // Construct FormData for multipart/form-data upload
      const submitData = new FormData();
      submitData.append("code", formData.code.trim().toUpperCase());
      submitData.append("name", formData.name.trim());
      submitData.append("category", formData.category);
      submitData.append("subCategory", formData.subCategory || "");
      submitData.append("materialType", formData.materialType);
      submitData.append("materialDetails", formData.materialDetails.trim());
      submitData.append("specificationGrade", formData.specificationGrade.trim());
      submitData.append("baseUom", formData.baseUom);
      submitData.append("purchaseUom", formData.purchaseUom || "");
      if (formData.conversionFactor) {
        submitData.append("conversionFactor", formData.conversionFactor);
      }
      submitData.append("brand", formData.brand.trim() || "Generic");
      submitData.append("standardSpecCode", formData.standardSpecCode.trim());
      submitData.append("preferredSupplier", formData.preferredSupplier.trim());
      submitData.append("supplierType", formData.supplierType || "");
      submitData.append("standardPurchaseRate", rateNum);
      if (formData.leadTimeDays) {
        submitData.append("leadTimeDays", formData.leadTimeDays);
      }
      if (formData.moq) {
        submitData.append("moq", formData.moq);
      }
      submitData.append("storageRequirement", formData.storageRequirement || "");
      submitData.append("status", formData.status);
      submitData.append("remarks", formData.remarks.trim());

      // Pass existing documents as JSON string
      submitData.append("documents", JSON.stringify(formData.documents.filter(d => d.url)));

      // Append new file objects for Multer & Cloudinary
      if (selectedFileObjects.length > 0) {
        selectedFileObjects.forEach((file) => {
          submitData.append("documents", file);
        });
      }

      let savedRecord = null;

      // Call Backend API
      try {
        if (isEdit) {
          const res = await materialService.updateMaterial(id, submitData);
          savedRecord = res?.data?.data || res?.data;
          toast.success("Material updated in database & Cloudinary successfully!");
        } else {
          const res = await materialService.createMaterial(submitData);
          savedRecord = res?.data?.data || res?.data;
          toast.success("Material saved to database & Cloudinary successfully!");
        }
      } catch (apiError) {
        console.warn("Backend API error, maintaining local backup:", apiError);
        toast.warning(apiError?.response?.data?.message || "Backend unreachable, saved locally.");
      }

      // Local storage synchronization as robust fallback
      const record = savedRecord || {
        id: isEdit ? Number(id) || id : Date.now(),
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory,
        materialType: formData.materialType,
        materialDetails: formData.materialDetails.trim(),
        specificationGrade: formData.specificationGrade.trim(),
        baseUom: formData.baseUom,
        uom: formData.baseUom,
        purchaseUom: formData.purchaseUom,
        conversionFactor: formData.conversionFactor ? Number(formData.conversionFactor) : null,
        brand: formData.brand.trim() || "Generic",
        standardSpecCode: formData.standardSpecCode.trim(),
        preferredSupplier: formData.preferredSupplier.trim(),
        supplierType: formData.supplierType,
        standardPurchaseRate: rateNum,
        unitRate: rateNum,
        leadTimeDays: formData.leadTimeDays ? Number(formData.leadTimeDays) : null,
        moq: formData.moq ? Number(formData.moq) : null,
        storageRequirement: formData.storageRequirement,
        documents: formData.documents,
        status: formData.status === "Active" ? "In Stock" : "Inactive",
        rawStatus: formData.status,
        remarks: formData.remarks.trim()
      };

      const existingStr = localStorage.getItem(MATERIAL_STORAGE_KEY);
      let list = existingStr ? JSON.parse(existingStr) : [];

      if (isEdit) {
        list = list.map((item) =>
          String(item._id || item.id) === String(id) ? { ...item, ...record } : item
        );
      } else {
        list = [record, ...list];
      }
      localStorage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(list));

      setTimeout(() => {
        navigate("/sales/master/material");
      }, 600);
    } catch (err) {
      console.error("Save material error:", err);
      toast.error(err?.response?.data?.message || "Failed to save Material details.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <FaSpinner className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <p className="text-sm font-semibold">Loading material details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-2 font-sans">
      {/* ================= TOP STICKY HEADER (Supplier Style) ================= */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-xl px-4 py-2.5 shadow-md border border-teal-700/50">
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/sales/master/material")}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all cursor-pointer"
              title="Back to Material Master"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
            </button>
            <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
              <FaBoxes className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                  {isEdit ? "Edit Material" : "Add Material"}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <HiSparkles className="w-2.5 h-2.5 text-emerald-300" /> {isEdit ? "Edit Mode" : "PMS MasterForm"}
                </span>
              </div>
              <p className="text-[11px] text-teal-200/90 leading-none mt-0.5">
                {isEdit
                  ? "Update reusable PMS construction material, specifications, UOMs, and procurement parameters."
                  : "Maintain reusable materials selectable in PMS tasks instead of entering uncontrolled text."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/sales/master/material")}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="material-master-form"
              disabled={loading}
              className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  <span>Saving to DB...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-3 h-3" />
                  <span>{isEdit ? "Update Material" : "Save Material"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= SINGLE CLEAN FORM CONTAINER (21 Fields) ================= */}
      <form
        id="material-master-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Material Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              1. Material Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => {
                setFormData({ ...formData, code: e.target.value });
                if (errors.code) setErrors({ ...errors, code: "" });
              }}
              placeholder="e.g. MAT-1001"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.code ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-slate-50"
              }`}
            />
            {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
            <p className="text-[11px] text-slate-400 mt-0.5">Unique master code identifier</p>
          </div>

          {/* 2. Material Name (Maps to PMS Material Required) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>
                2. Material Name <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Maps to PMS Material Required
              </span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g. Roofing Sheet / CPVC Pipe / Flush Door / Fly Ash Bricks"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.name ? "border-red-500 bg-red-50/50" : "border-slate-200 bg-white"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* 3. Material Category (Searchable DDL) */}
          <div className="relative" ref={categoryRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              3. Material Category <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.category ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.category ? "text-slate-800" : "text-slate-400"}>
                {formData.category || "Select Material Category"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}

            {isCategoryOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsCategoryOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setFormData({ ...formData, category: cat, subCategory: "" });
                          setIsCategoryOpen(false);
                          if (errors.category) setErrors({ ...errors, category: "" });
                        }}
                        className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                          formData.category === cat ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                        }`}
                      >
                        <span>{cat}</span>
                        {formData.category === cat && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">No categories found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. Material Sub-Category (Searchable DDL - Dependent) */}
          <div className="relative" ref={subCategoryRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>4. Material Sub-Category</span>
              {formData.category && (
                <span className="text-[10px] text-slate-400">Dependent on Category</span>
              )}
            </label>
            <div
              onClick={() => {
                if (!formData.category) {
                  toast.info("Please select a Category first.");
                  return;
                }
                setIsSubCategoryOpen(!isSubCategoryOpen);
              }}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer ${
                !formData.category ? "bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200" : "bg-white border-slate-200"
              }`}
            >
              <span className={formData.subCategory ? "text-slate-800" : "text-slate-400"}>
                {formData.subCategory || (formData.category ? "Select Sub-Category" : "Select Category first")}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isSubCategoryOpen && formData.category && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search sub-category..."
                    value={subCategorySearch}
                    onChange={(e) => setSubCategorySearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSubCategoryOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredSubCategories.length > 0 ? (
                    filteredSubCategories.map((sub) => (
                      <div
                        key={sub}
                        onClick={() => {
                          setFormData({ ...formData, subCategory: sub });
                          setIsSubCategoryOpen(false);
                        }}
                        className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                          formData.subCategory === sub ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                        }`}
                      >
                        <span>{sub}</span>
                        {formData.subCategory === sub && <FaCheck className="w-3 h-3 text-emerald-600" />}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">No sub-categories found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 5. Material Type (DDL - Required) */}
          <div className="relative" ref={typeRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              5. Material Type <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsTypeOpen(!isTypeOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.materialType ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.materialType ? "text-slate-800" : "text-slate-400"}>
                {formData.materialType || "Select Material Type"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.materialType && <p className="text-xs text-red-500 mt-1">{errors.materialType}</p>}

            {isTypeOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {MATERIAL_TYPES.map((t) => (
                    <div
                      key={t}
                      onClick={() => {
                        setFormData({ ...formData, materialType: t });
                        setIsTypeOpen(false);
                        if (errors.materialType) setErrors({ ...errors, materialType: "" });
                      }}
                      className={`px-3.5 py-2.5 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-semibold flex items-center justify-between ${
                        formData.materialType === t ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{t}</span>
                      {formData.materialType === t && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. Material Details (Multiline Text - Maps to PMS MATERIAL DETAILS) */}
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>6. Material Details</span>
              <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Maps to PMS MATERIAL DETAILS
              </span>
            </label>
            <textarea
              rows={2}
              value={formData.materialDetails}
              onChange={(e) => setFormData({ ...formData, materialDetails: e.target.value })}
              placeholder="Enter technical or task-specific detail (e.g. 0.50mm BMT Corrugated Galvalume profile with self-tapping screws)..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-normal text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none"
            />
          </div>

          {/* 7. Specification / Grade */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              7. Specification / Grade
            </label>
            <input
              type="text"
              value={formData.specificationGrade}
              onChange={(e) => setFormData({ ...formData, specificationGrade: e.target.value })}
              placeholder="e.g. Fe550D / 53 Grade / SDR 11 / 12mm"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">Grade, size, thickness, rating, etc.</p>
          </div>

          {/* 8. Base UOM (Searchable DDL - Required) */}
          <div className="relative" ref={baseUomRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              8. Base UOM <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => setIsBaseUomOpen(!isBaseUomOpen)}
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white ${
                errors.baseUom ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            >
              <span className={formData.baseUom ? "text-slate-800 font-bold" : "text-slate-400"}>
                {formData.baseUom || "Select Base UOM"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            {errors.baseUom && <p className="text-xs text-red-500 mt-1">{errors.baseUom}</p>}

            {isBaseUomOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search Base UOM..."
                    value={baseUomSearch}
                    onChange={(e) => setBaseUomSearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsBaseUomOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  {filteredBaseUoms.map((unit) => (
                    <div
                      key={unit}
                      onClick={() => {
                        setFormData({ ...formData, baseUom: unit });
                        setIsBaseUomOpen(false);
                        if (errors.baseUom) setErrors({ ...errors, baseUom: "" });
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.baseUom === unit ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{unit}</span>
                      {formData.baseUom === unit && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 9. Purchase UOM (Searchable DDL - Optional) */}
          <div className="relative" ref={purchaseUomRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              9. Purchase UOM (Optional)
            </label>
            <div
              onClick={() => setIsPurchaseUomOpen(!isPurchaseUomOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.purchaseUom ? "text-slate-800" : "text-slate-400"}>
                {formData.purchaseUom || "Select Purchase UOM"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isPurchaseUomOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search Purchase UOM..."
                    value={purchaseUomSearch}
                    onChange={(e) => setPurchaseUomSearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsPurchaseUomOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, purchaseUom: "" });
                      setIsPurchaseUomOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs cursor-pointer hover:bg-slate-100 text-slate-400 italic"
                  >
                    -- None (Same as Base UOM) --
                  </div>
                  {filteredPurchaseUoms.map((unit) => (
                    <div
                      key={unit}
                      onClick={() => {
                        setFormData({ ...formData, purchaseUom: unit });
                        setIsPurchaseUomOpen(false);
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.purchaseUom === unit ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{unit}</span>
                      {formData.purchaseUom === unit && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 10. Conversion Factor (Decimal) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              10. Conversion Factor
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.conversionFactor}
              onChange={(e) => {
                setFormData({ ...formData, conversionFactor: e.target.value });
                if (errors.conversionFactor) setErrors({ ...errors, conversionFactor: "" });
              }}
              placeholder="e.g. 50 (1 Bag = 50 kg)"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.conversionFactor ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            {errors.conversionFactor && <p className="text-xs text-red-500 mt-1">{errors.conversionFactor}</p>}
            <p className="text-[11px] text-slate-400 mt-0.5">1 Purchase UOM = X Base UOM</p>
          </div>

          {/* 11. Brand / Make (Searchable / Text DDL) */}
          <div className="relative" ref={brandRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              11. Brand / Make
            </label>
            <div
              onClick={() => setIsBrandOpen(!isBrandOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.brand ? "text-slate-800" : "text-slate-400"}>
                {formData.brand || "Select or enter Brand"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isBrandOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search or type brand..."
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsBrandOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                {brandSearch.trim() && (
                  <div
                    onClick={() => {
                      setFormData({ ...formData, brand: brandSearch.trim() });
                      setIsBrandOpen(false);
                    }}
                    className="px-3.5 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Use custom brand:</span>
                    <span className="underline italic">"{brandSearch.trim()}"</span>
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filteredBrands.map((b) => (
                    <div
                      key={b}
                      onClick={() => {
                        setFormData({ ...formData, brand: b });
                        setIsBrandOpen(false);
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.brand === b ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{b}</span>
                      {formData.brand === b && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 12. Standard / Specification Code */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              12. Standard / Specification Code
            </label>
            <input
              type="text"
              value={formData.standardSpecCode}
              onChange={(e) => setFormData({ ...formData, standardSpecCode: e.target.value })}
              placeholder="e.g. IS 12269 / IS 1786 / ASTM D2846"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">IS / ASTM / Manufacturer reference</p>
          </div>

          {/* 13. Preferred Supplier (Supplier Lookup linking Supplier Master) */}
          <div className="relative" ref={supplierRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>13. Preferred Supplier</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Links Supplier Master
              </span>
            </label>
            <div
              onClick={() => setIsSupplierOpen(!isSupplierOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.preferredSupplier ? "text-slate-800" : "text-slate-400"}>
                {formData.preferredSupplier || "Select Registered Supplier"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isSupplierOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <FaSearch className="w-3 h-3 text-slate-400 ml-1" />
                  <input
                    type="text"
                    placeholder="Search supplier name..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setIsSupplierOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                {supplierSearch.trim() && (
                  <div
                    onClick={() => {
                      setFormData({ ...formData, preferredSupplier: supplierSearch.trim() });
                      setIsSupplierOpen(false);
                    }}
                    className="px-3.5 py-2 bg-emerald-50/70 border-b border-emerald-100 text-xs font-bold text-emerald-800 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Use:</span>
                    <span className="underline italic">"{supplierSearch.trim()}"</span>
                  </div>
                )}
                <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, preferredSupplier: "" });
                      setIsSupplierOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs cursor-pointer hover:bg-slate-100 text-slate-400 italic"
                  >
                    -- None --
                  </div>
                  {filteredSuppliers.map((s) => (
                    <div
                      key={s._id || s.id || s.name}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          preferredSupplier: s.name,
                          supplierType: s.supplierType || formData.supplierType
                        });
                        setIsSupplierOpen(false);
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.preferredSupplier === s.name ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-semibold">{s.name}</p>
                        {s.supplierType && <p className="text-[10px] text-slate-400">{s.supplierType}</p>}
                      </div>
                      {formData.preferredSupplier === s.name && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 14. Supplier Type (PMS Configured Supplier DDL) */}
          <div className="relative" ref={supplierTypeRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              14. Supplier Type
            </label>
            <div
              onClick={() => setIsSupplierTypeOpen(!isSupplierTypeOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.supplierType ? "text-slate-800" : "text-slate-400"}>
                {formData.supplierType || "Select Supplier Type"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isSupplierTypeOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, supplierType: "" });
                      setIsSupplierTypeOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs cursor-pointer hover:bg-slate-100 text-slate-400 italic"
                  >
                    -- None --
                  </div>
                  {SUPPLIER_TYPES.map((st) => (
                    <div
                      key={st}
                      onClick={() => {
                        setFormData({ ...formData, supplierType: st });
                        setIsSupplierTypeOpen(false);
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.supplierType === st ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{st}</span>
                      {formData.supplierType === st && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 15. Standard Purchase Rate (Currency ₹) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              15. Standard Purchase Rate (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-bold">₹</span>
              <input
                type="number"
                step="any"
                min="0"
                value={formData.standardPurchaseRate}
                onChange={(e) => {
                  setFormData({ ...formData, standardPurchaseRate: e.target.value });
                  if (errors.standardPurchaseRate) setErrors({ ...errors, standardPurchaseRate: "" });
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-3.5 py-2.5 border rounded-lg text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                  errors.standardPurchaseRate ? "border-red-500 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.standardPurchaseRate && <p className="text-xs text-red-500 mt-1">{errors.standardPurchaseRate}</p>}
            <p className="text-[11px] text-slate-400 mt-0.5">Procurement reference price</p>
          </div>

          {/* 16. Lead Time (Days) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              16. Lead Time (Days)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.leadTimeDays}
              onChange={(e) => {
                setFormData({ ...formData, leadTimeDays: e.target.value });
                if (errors.leadTimeDays) setErrors({ ...errors, leadTimeDays: "" });
              }}
              placeholder="e.g. 7"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.leadTimeDays ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            {errors.leadTimeDays && <p className="text-xs text-red-500 mt-1">{errors.leadTimeDays}</p>}
          </div>

          {/* 17. MOQ (Minimum Order Quantity) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              17. MOQ (Minimum Order Qty)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={formData.moq}
              onChange={(e) => {
                setFormData({ ...formData, moq: e.target.value });
                if (errors.moq) setErrors({ ...errors, moq: "" });
              }}
              placeholder="e.g. 50"
              className={`w-full px-3.5 py-2.5 border rounded-lg text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 ${
                errors.moq ? "border-red-500 bg-red-50/50" : "border-slate-200"
              }`}
            />
            {errors.moq && <p className="text-xs text-red-500 mt-1">{errors.moq}</p>}
          </div>

          {/* 18. Storage Requirement (DDL / Text) */}
          <div className="relative" ref={storageRef}>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              18. Storage Requirement
            </label>
            <div
              onClick={() => setIsStorageOpen(!isStorageOpen)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-semibold flex items-center justify-between cursor-pointer bg-white"
            >
              <span className={formData.storageRequirement ? "text-slate-800" : "text-slate-400"}>
                {formData.storageRequirement || "Select Storage Requirement"}
              </span>
              <FaChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            {isStorageOpen && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  <div
                    onClick={() => {
                      setFormData({ ...formData, storageRequirement: "" });
                      setIsStorageOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs cursor-pointer hover:bg-slate-100 text-slate-400 italic"
                  >
                    -- None --
                  </div>
                  {STORAGE_REQUIREMENTS.map((sr) => (
                    <div
                      key={sr}
                      onClick={() => {
                        setFormData({ ...formData, storageRequirement: sr });
                        setIsStorageOpen(false);
                      }}
                      className={`px-3.5 py-2 text-xs cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center justify-between ${
                        formData.storageRequirement === sr ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700"
                      }`}
                    >
                      <span>{sr}</span>
                      {formData.storageRequirement === sr && <FaCheck className="w-3 h-3 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 19. Technical Document (File Upload with Multer & Cloudinary) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>19. Technical Document</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                Cloudinary Upload
              </span>
            </label>
            <div className="border border-dashed border-slate-200 rounded-lg p-2.5 text-center hover:border-emerald-400 transition-colors bg-slate-50/60">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                id="material-doc-upload"
                className="hidden"
              />
              <label htmlFor="material-doc-upload" className="cursor-pointer flex items-center justify-center gap-2">
                <FaCloudUploadAlt className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-700 hover:text-emerald-700">
                  Upload Documents
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
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-emerald-700 hover:underline truncate"
                          title="View on Cloudinary"
                        >
                          {doc.name}
                        </a>
                      ) : (
                        <span className="font-medium text-slate-700 truncate">{doc.name}</span>
                      )}
                      <span className="text-[10px] text-slate-400">({doc.size || doc.type})</span>
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

          {/* 20. Status (DDL - Required) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              20. Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => {
                setFormData({ ...formData, status: e.target.value });
                if (errors.status) setErrors({ ...errors, status: "" });
              }}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* 21. Remarks (Multiline Text - Internal Notes) */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              21. Remarks / Internal Notes
            </label>
            <textarea
              rows={2}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Internal procurement notes, site delivery constraints, or approval references..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm font-normal text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 resize-none"
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/sales/master/material")}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-lg shadow-md transition-all text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <FaSave className="w-3.5 h-3.5" />
                <span>{isEdit ? "Update Material" : "Save Material"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMaterialComponent;
