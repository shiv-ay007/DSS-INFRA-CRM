import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTrashAlt,
  FaHandshake,
  FaTruck,
  FaHardHat,
  FaUsersCog,
  FaEye,
  FaEdit,
  FaSpinner,
  FaTimes
} from "react-icons/fa";
import { HiSparkles, HiShieldCheck } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";
import { supplierService } from "../../../services/supplierService";
import { contractorService } from "../../../services/contractorService";


const supplierContractorTypes = ["Supplier", "Contractor"];

const SuplireContractorComponent = () => {
  const navigate = useNavigate();

  // Active Type Tab: "Supplier" or "Contractor"
  const [selectedType, setSelectedType] = useState("Supplier");

  // Suppliers & Contractors state from Database
  const [suppliers, setSuppliers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search & Table-Based Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  // Supplier-specific filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [supplierTypeFilter, setSupplierTypeFilter] = useState("All");
  const [paymentTermsFilter, setPaymentTermsFilter] = useState("All");

  // Contractor-specific filters
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [contractorTypeFilter, setContractorTypeFilter] = useState("All");

  // Selected item for Quick View modal/drawer
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewType, setViewType] = useState("Supplier");

  // Fetch data from backend API
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (selectedType === "Supplier") {
        const res = await supplierService.getAllSuppliers({ limit: 500 });
        if (res && res.success) {
          setSuppliers(res.data || []);
        } else {
          setSuppliers([]);
        }
      } else {
        const res = await contractorService.getAllContractors({ limit: 500 });
        if (res && res.success) {
          setContractors(res.data || []);
        } else {
          setContractors([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Failed to load ${selectedType.toLowerCase()}s from database`);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete handler
  const handleDelete = async (id, name, type) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      if (type === "Supplier") {
        const res = await supplierService.deleteSupplier(id);
        if (res && res.success) {
          toast.success(`Supplier "${name}" deleted successfully`);
          setSuppliers((prev) => prev.filter((item) => item._id !== id));
        } else {
          toast.error(res?.message || "Failed to delete supplier");
        }
      } else {
        const res = await contractorService.deleteContractor(id);
        if (res && res.success) {
          toast.success(`Contractor "${name}" deleted successfully`);
          setContractors((prev) => prev.filter((item) => item._id !== id));
        } else {
          toast.error(res?.message || "Failed to delete contractor");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete entry");
    }
  };

  // Dynamic filter options for Supplier
  const supplierCategories = useMemo(() => {
    const set = new Set();
    suppliers.forEach((s) => {
      if (Array.isArray(s.materialCategories)) {
        s.materialCategories.forEach((c) => c && set.add(c.trim()));
      } else if (typeof s.materialCategories === "string" && s.materialCategories.trim()) {
        set.add(s.materialCategories.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [suppliers]);

  const supplierCities = useMemo(() => {
    const set = new Set();
    suppliers.forEach((s) => {
      if (s.city && typeof s.city === "string" && s.city.trim()) {
        set.add(s.city.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [suppliers]);

  const supplierTypesList = useMemo(() => {
    const set = new Set(["Manufacturer", "Trader", "Distributor", "Wholesaler", "Retailer"]);
    suppliers.forEach((s) => {
      if (s.supplierType && typeof s.supplierType === "string" && s.supplierType.trim()) {
        set.add(s.supplierType.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [suppliers]);

  const paymentTermsList = useMemo(() => {
    const set = new Set();
    suppliers.forEach((s) => {
      if (s.paymentTerms && typeof s.paymentTerms === "string" && s.paymentTerms.trim()) {
        set.add(s.paymentTerms.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [suppliers]);

  // Dynamic filter options for Contractor
  const contractorSpecializations = useMemo(() => {
    const set = new Set();
    contractors.forEach((c) => {
      const list = c.workSpecializations || c.specializations;
      if (Array.isArray(list)) {
        list.forEach((w) => w && set.add(w.trim()));
      } else if (typeof list === "string" && list.trim()) {
        set.add(list.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [contractors]);

  const contractorCities = useMemo(() => {
    const set = new Set();
    contractors.forEach((c) => {
      if (c.city && typeof c.city === "string" && c.city.trim()) {
        set.add(c.city.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [contractors]);

  const contractorTypesList = useMemo(() => {
    const set = new Set();
    contractors.forEach((c) => {
      if (c.contractorType && typeof c.contractorType === "string" && c.contractorType.trim()) {
        set.add(c.contractorType.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [contractors]);

  const contractorAvailabilityList = useMemo(() => {
    const set = new Set(["Available", "Busy", "On Project", "Unavailable"]);
    contractors.forEach((c) => {
      if (c.availability && typeof c.availability === "string" && c.availability.trim()) {
        set.add(c.availability.trim());
      }
    });
    return ["All", ...Array.from(set).sort()];
  }, [contractors]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "All") count++;
    if (cityFilter !== "All") count++;
    if (selectedType === "Supplier") {
      if (categoryFilter !== "All") count++;
      if (supplierTypeFilter !== "All") count++;
      if (paymentTermsFilter !== "All") count++;
    } else {
      if (specializationFilter !== "All") count++;
      if (availabilityFilter !== "All") count++;
      if (contractorTypeFilter !== "All") count++;
    }
    return count;
  }, [
    selectedType,
    statusFilter,
    cityFilter,
    categoryFilter,
    supplierTypeFilter,
    paymentTermsFilter,
    specializationFilter,
    availabilityFilter,
    contractorTypeFilter
  ]);

  const hasActiveFilters = searchTerm !== "" || activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCityFilter("All");
    setCategoryFilter("All");
    setSupplierTypeFilter("All");
    setPaymentTermsFilter("All");
    setSpecializationFilter("All");
    setAvailabilityFilter("All");
    setContractorTypeFilter("All");
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
    handleResetFilters();
  };

  // Active current dataset
  const currentData = selectedType === "Supplier" ? suppliers : contractors;

  // KPI calculations
  const stats = useMemo(() => {
    const total = currentData.length;
    const active = currentData.filter((v) => v.status === "Active").length;
    const inactive = currentData.filter((v) => v.status === "Inactive").length;
    const blocked = currentData.filter((v) => v.status === "Blocked").length;
    return { total, active, inactive, blocked };
  }, [currentData]);

  // Filtering based on table columns
  const filteredData = useMemo(() => {
    const rawList = selectedType === "Supplier" ? suppliers : contractors;
    return rawList.filter((item) => {
      const q = searchTerm.toLowerCase().trim();
      const name = (item.name || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      const contactPerson = (item.contactPerson || "").toLowerCase();
      const phone = (item.phone || item.mobile || "").toLowerCase();
      const email = (item.email || "").toLowerCase();
      const city = (item.city || "").toLowerCase();
      const state = (item.state || "").toLowerCase();

      const matchesSearch =
        !q ||
        name.includes(q) ||
        code.includes(q) ||
        contactPerson.includes(q) ||
        phone.includes(q) ||
        email.includes(q) ||
        city.includes(q) ||
        state.includes(q);

      const matchesStatus =
        statusFilter === "All" ||
        (item.status || "Active").toLowerCase() === statusFilter.toLowerCase();

      const matchesCity =
        cityFilter === "All" ||
        city === cityFilter.toLowerCase();

      if (selectedType === "Supplier") {
        const categories = Array.isArray(item.materialCategories)
          ? item.materialCategories.join(" ").toLowerCase()
          : (item.materialCategories || "").toLowerCase();
        const matchesCategory =
          categoryFilter === "All" ||
          categories.includes(categoryFilter.toLowerCase());

        const matchesSupplierType =
          supplierTypeFilter === "All" ||
          (item.supplierType || "").toLowerCase() === supplierTypeFilter.toLowerCase();

        const matchesPaymentTerms =
          paymentTermsFilter === "All" ||
          (item.paymentTerms || "").toLowerCase() === paymentTermsFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCity &&
          matchesCategory &&
          matchesSupplierType &&
          matchesPaymentTerms
        );
      } else {
        const specializations = Array.isArray(item.workSpecializations)
          ? item.workSpecializations.join(" ").toLowerCase()
          : Array.isArray(item.specializations)
          ? item.specializations.join(" ").toLowerCase()
          : (item.workSpecializations || item.specializations || "").toLowerCase();

        const matchesSpec =
          specializationFilter === "All" ||
          specializations.includes(specializationFilter.toLowerCase());

        const matchesAvail =
          availabilityFilter === "All" ||
          (item.availability || "Available").toLowerCase() === availabilityFilter.toLowerCase();

        const matchesContractorType =
          contractorTypeFilter === "All" ||
          (item.contractorType || "").toLowerCase() === contractorTypeFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCity &&
          matchesSpec &&
          matchesAvail &&
          matchesContractorType
        );
      }
    });
  }, [
    selectedType,
    suppliers,
    contractors,
    searchTerm,
    statusFilter,
    cityFilter,
    categoryFilter,
    supplierTypeFilter,
    paymentTermsFilter,
    specializationFilter,
    availabilityFilter,
    contractorTypeFilter
  ]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // 10 Table Heads for Supplier
  const supplierColumnConfig = useMemo(
    () => ({
      // 1. Action Column (Right next to SR NO)
      actions: {
        label: "Action",
        align: "center",
        headerClass: "w-32 min-w-[125px]",
        render: (_, row) => (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => navigate(`/sales/master/suplire-and-contractor/details/supplier/${row._id}`)}
              title="View Complete Details"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all cursor-pointer shadow-xs"
            >
              <FaEye className="w-3.5 h-3.5 text-emerald-600" />
              <span>View</span>
            </button>
            <button
              onClick={() => navigate(`/sales/master/suplire-and-contractor/edit-supplier/${row._id}`)}
              title="Edit Supplier Details"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
            >
              <FaEdit className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </button>
          </div>
        )
      },

      // 2. Supplier Name & Code (Name on top, Code below, center aligned)
      supplier: {
        label: "Supplier Name & Code",
        align: "center",
        headerClass: "min-w-[220px]",
        render: (_, row) => (
          <div className="py-1 flex flex-col items-center justify-center text-center">
            <h4 className="font-bold text-slate-900 text-sm leading-snug">{row.name}</h4>
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block mt-1">
              {row.code}
            </span>
          </div>
        )
      },

      // 3. Contact Details (Phone, WhatsApp, Alternate No, Email) - Right next to Name & Code
      contactInfo: {
        label: "Contact & Email",
        align: "center",
        headerClass: "min-w-[190px]",
        render: (_, row) => (
          <div className="space-y-1 text-left inline-block py-1">
            {row.phone ? (
              <a
                href={`tel:${row.phone}`}
                className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-emerald-600 flex items-center gap-1.5 transition-colors"
                title="Primary Contact Phone"
              >
                <FaPhoneAlt className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                <span>{row.phone}</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}

            {row.whatsappNo && (
              <a
                href={`https://wa.me/${row.whatsappNo.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                title="WhatsApp"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>WA: {row.whatsappNo}</span>
              </a>
            )}

            {row.alternatePhone && (
              <a
                href={`tel:${row.alternatePhone}`}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                title="Alternate Number"
              >
                <span className="text-[10px] font-bold text-slate-400 shrink-0">Alt:</span>
                <span>{row.alternatePhone}</span>
              </a>
            )}

            {row.email && (
              <a
                href={`mailto:${row.email}`}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors truncate max-w-[180px]"
                title={row.email}
              >
                <FaEnvelope className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                <span className="truncate">{row.email}</span>
              </a>
            )}
          </div>
        )
      },

      // 4. Contact Person & Designation
      contactPerson: {
        label: "Contact Person",
        align: "left",
        headerClass: "min-w-[160px]",
        render: (val, row) => (
          <div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">{val || "—"}</p>
            {row.designation && (
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{row.designation}</p>
            )}
          </div>
        )
      },

      // 5. Supplier Type
      supplierType: {
        label: "Supplier Type",
        align: "center",
        headerClass: "min-w-[150px]",
        render: (val) => (
          <span className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded whitespace-nowrap">
            {val || "—"}
          </span>
        )
      },

      // 6. Location (City, State)
      location: {
        label: "Location",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (_, row) => (
          <div className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-1.5 whitespace-nowrap">
            <FaMapMarkerAlt className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{row.city ? `${row.city}${row.state ? `, ${row.state}` : ""}` : "—"}</span>
          </div>
        )
      },

      // 7. Materials / Services Supplied
      materials: {
        label: "Materials Supplied",
        align: "left",
        headerClass: "min-w-[220px]",
        render: (_, row) => {
          const list = row.materialsSupplied || [];
          if (list.length === 0) return <span className="text-slate-400 text-xs">—</span>;
          const firstTwo = list.slice(0, 2);
          const remaining = list.length - 2;

          return (
            <div className="flex flex-wrap gap-1.5">
              {firstTwo.map((mat, i) => (
                <span
                  key={i}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium px-2 py-0.5 rounded truncate max-w-[150px]"
                >
                  {mat}
                </span>
              ))}
              {remaining > 0 && (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  +{remaining} more
                </span>
              )}
            </div>
          );
        }
      },

      // 8. GSTIN / PAN
      taxInfo: {
        label: "GSTIN / PAN",
        align: "center",
        headerClass: "min-w-[160px]",
        render: (_, row) => (
          <div className="space-y-0.5 text-center">
            {row.gstin ? (
              <p className="font-mono text-xs font-semibold text-slate-800">
                GST: {row.gstin}
              </p>
            ) : (
              <p className="text-xs text-slate-400 font-mono">No GST</p>
            )}
            {row.pan && (
              <p className="font-mono text-[11px] text-slate-500">
                PAN: {row.pan}
              </p>
            )}
          </div>
        )
      },

      // 9. Payment Terms
      paymentTerms: {
        label: "Payment Terms",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (val) => (
          <span className="text-xs font-medium text-slate-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded whitespace-nowrap">
            {val || "Immediate / Advance"}
          </span>
        )
      },

      // 10. Status
      status: {
        label: "Status",
        align: "center",
        headerClass: "min-w-[110px]",
        render: (val) => {
          const isAct = val === "Active";
          const isBlk = val === "Blocked";
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                isAct
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isBlk
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAct ? "bg-emerald-500" : isBlk ? "bg-red-500" : "bg-slate-400"
                }`}
              />
              {val || "Active"}
            </span>
          );
        }
      }
    }),
    []
  );

  // 10 Table Heads for Contractor
  const contractorColumnConfig = useMemo(
    () => ({
      actions: {
        label: "Action",
        align: "center",
        headerClass: "w-32 min-w-[125px]",
        render: (_, row) => (
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => navigate(`/sales/master/suplire-and-contractor/details/contractor/${row._id}`)}
              title="View Complete Details"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 transition-all cursor-pointer shadow-xs"
            >
              <FaEye className="w-3.5 h-3.5 text-blue-600" />
              <span>View</span>
            </button>
            <button
              onClick={() => navigate(`/sales/master/suplire-and-contractor/edit-contractor/${row._id}`)}
              title="Edit Contractor Details"
              className="px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs"
            >
              <FaEdit className="w-3.5 h-3.5 text-amber-600" />
              <span>Edit</span>
            </button>
          </div>
        )
      },
      // 2. Contractor Name & Code (Name on top, Code below, center aligned)
      contractor: {
        label: "Contractor Name & Code",
        align: "center",
        headerClass: "min-w-[220px]",
        render: (_, row) => (
          <div className="py-1 flex flex-col items-center justify-center text-center">
            <h4 className="font-bold text-slate-900 text-sm leading-snug">{row.name}</h4>
            <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 inline-block mt-1">
              {row.code}
            </span>
          </div>
        )
      },

      // 3. Contact Details (Phone, WhatsApp, Alternate No, Email) - Right next to Name & Code
      contactInfo: {
        label: "Contact & Email",
        align: "center",
        headerClass: "min-w-[190px]",
        render: (_, row) => (
          <div className="space-y-1 text-left inline-block py-1">
            {row.phone ? (
              <a
                href={`tel:${row.phone}`}
                className="text-xs sm:text-sm font-semibold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
                title="Primary Contact Phone"
              >
                <FaPhoneAlt className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                <span>{row.phone}</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400">—</span>
            )}

            {row.whatsappNo && (
              <a
                href={`https://wa.me/${row.whatsappNo.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                title="WhatsApp"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>WA: {row.whatsappNo}</span>
              </a>
            )}

            {row.alternatePhone && (
              <a
                href={`tel:${row.alternatePhone}`}
                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
                title="Alternate Number"
              >
                <span className="text-[10px] font-bold text-slate-400 shrink-0">Alt:</span>
                <span>{row.alternatePhone}</span>
              </a>
            )}

            {row.email && (
              <a
                href={`mailto:${row.email}`}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors truncate max-w-[180px]"
                title={row.email}
              >
                <FaEnvelope className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                <span className="truncate">{row.email}</span>
              </a>
            )}
          </div>
        )
      },

      // 4. Contact Person
      contactPerson: {
        label: "Contact Person",
        align: "left",
        headerClass: "min-w-[160px]",
        render: (val, row) => (
          <div>
            <p className="font-bold text-slate-900 text-xs sm:text-sm">{val || "—"}</p>
            {row.designation && (
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{row.designation}</p>
            )}
          </div>
        )
      },

      // 5. Contractor Type
      contractorType: {
        label: "Contractor Type",
        align: "center",
        headerClass: "min-w-[150px]",
        render: (val) => (
          <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded whitespace-nowrap">
            {val || "—"}
          </span>
        )
      },
      location: {
        label: "Location",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (_, row) => (
          <div className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center gap-1.5 whitespace-nowrap">
            <FaMapMarkerAlt className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{row.city ? `${row.city}${row.state ? `, ${row.state}` : ""}` : "—"}</span>
          </div>
        )
      },
      workCategories: {
        label: "Work Categories",
        align: "left",
        headerClass: "min-w-[220px]",
        render: (_, row) => {
          const list = row.workCategories || [];
          if (list.length === 0) return <span className="text-slate-400 text-xs">—</span>;
          const firstTwo = list.slice(0, 2);
          const remaining = list.length - 2;

          return (
            <div className="flex flex-wrap gap-1.5">
              {firstTwo.map((w, i) => (
                <span
                  key={i}
                  className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium px-2 py-0.5 rounded truncate max-w-[150px]"
                >
                  {w}
                </span>
              ))}
              {remaining > 0 && (
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">
                  +{remaining} more
                </span>
              )}
            </div>
          );
        }
      },
      availability: {
        label: "Availability",
        align: "center",
        headerClass: "min-w-[130px]",
        render: (val) => (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded whitespace-nowrap">
            {val || "Available"}
          </span>
        )
      },
      commercialTerms: {
        label: "Commercial Terms",
        align: "center",
        headerClass: "min-w-[140px]",
        render: (val) => (
          <span className="text-xs font-medium text-slate-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded whitespace-nowrap">
            {val || "As per Quotation"}
          </span>
        )
      },
      status: {
        label: "Status",
        align: "center",
        headerClass: "min-w-[110px]",
        render: (val) => {
          const isAct = val === "Active";
          const isBlk = val === "Blocked";
          return (
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                isAct
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isBlk
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAct ? "bg-emerald-500" : isBlk ? "bg-red-500" : "bg-slate-400"
                }`}
              />
              {val || "Active"}
            </span>
          );
        }
      }
    }),
    []
  );

  const activeColumnConfig =
    selectedType === "Supplier" ? supplierColumnConfig : contractorColumnConfig;


  // KPI Card Component
  const KpiCard = ({ gradient, icon, label, value, subtitle, IconBg }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 shadow-md ${gradient} text-white group`}>
      <div className="absolute -right-4 -bottom-6 opacity-15 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {IconBg}
      </div>
      <div className="relative z-1 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">{label}</p>
          <h3 className="text-3xl font-black mt-1 leading-none">{value}</h3>
          <p className="text-[10px] opacity-80 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 pb-12 px-1 sm:px-0 font-sans">
      {/* ================= FIXED / STICKY HEADER BANNER ================= */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100 pt-1 pb-1">
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-xl px-4 py-3 shadow-md border border-teal-700/50 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg shadow-sm flex items-center justify-center shrink-0">
                <FaUsersCog className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                    Supplier Master Directory
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <HiSparkles className="w-2.5 h-2.5 text-emerald-300" /> Database Live
                  </span>
                </div>
                <p className="text-[11px] text-teal-200/90 mt-0.5 leading-none font-normal">
                  Approved master directory of registered material suppliers, distributors, and vendors.
                </p>
              </div>
            </div>

            {/* TWO SEPARATE ADD BUTTONS & FILTER BUTTON */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`relative p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-sm border ${
                  showFilters
                    ? "bg-white text-emerald-950 border-white shadow-md scale-105"
                    : "bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-100 border-emerald-600/50 hover:border-emerald-500"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className={`w-3.5 h-3.5 ${showFilters ? "text-emerald-700" : "text-emerald-300"}`} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("/sales/master/suplire-and-contractor/add-supplier")}
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Supplier</span>
              </button>
              <button
                onClick={() => navigate("/sales/master/suplire-and-contractor/add-contractor")}
                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <FaPlus className="w-3 h-3" />
                <span>Add Contractor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-slate-800 to-slate-900"
          label={`Total ${selectedType}s`}
          value={stats.total}
          subtitle={`Saved in ${selectedType} directory`}
          icon={<FaHandshake className="w-5 h-5 text-white" />}
          IconBg={<FaHandshake className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label={`Active ${selectedType}s`}
          value={stats.active}
          subtitle="Ready for engagement"
          icon={<FaTruck className="w-5 h-5 text-white" />}
          IconBg={<FaTruck className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-amber-600 to-orange-700"
          label={`Inactive ${selectedType}s`}
          value={stats.inactive}
          subtitle="Temporarily on hold"
          icon={<HiShieldCheck className="w-5 h-5 text-white" />}
          IconBg={<HiShieldCheck className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-rose-600 to-red-700"
          label={`Blocked ${selectedType}s`}
          value={stats.blocked}
          subtitle="Restricted accounts"
          icon={<HiShieldCheck className="w-5 h-5 text-white" />}
          IconBg={<HiShieldCheck className="w-20 h-20" />}
        />
      </div>

      {/* ================= TYPE SWITCHER TABS ================= */}
      <div className="flex items-center gap-2">
        {supplierContractorTypes.map((type) => {
          const active = selectedType === type;
          const isSupplier = type === "Supplier";
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                active
                  ? isSupplier
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm"
                    : "bg-blue-600 text-white border-blue-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {isSupplier ? <FaTruck className="w-3.5 h-3.5" /> : <FaHardHat className="w-3.5 h-3.5" />}
              <span>{type} Directory</span>
            </button>
          );
        })}
      </div>

      {/* ================= SEARCH & TABLE-BASED FILTER CONTROL BAR (COLLAPSIBLE) ================= */}
      {showFilters && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top Row: Search Box, Found Count, Reset & Close */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 max-w-lg">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder={`Search ${selectedType.toLowerCase()} by name, code, contact person, phone, email, city...`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 ${
                  selectedType === "Supplier" ? "focus:ring-emerald-500" : "focus:ring-blue-500"
                } focus:bg-white transition-all placeholder:text-slate-400 font-medium`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Actions & Count */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Reset all filters"
                >
                  <FaTimes className="w-3 h-3" />
                  <span>Reset Filters</span>
                </button>
              )}

              <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 whitespace-nowrap">
                {filteredData.length} Found
              </span>

              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Filter Panel"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom Row: Dropdown Filters Corresponding to Table Columns */}
          {selectedType === "Supplier" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* 1. Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    statusFilter !== "All"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* 2. Category Filter (Column: Category / Supplied Materials) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    categoryFilter !== "All"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {supplierCategories.map((c) => (
                    <option key={c} value={c}>
                      {c === "All" ? "All Categories" : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Location / City Filter (Column: Location) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location / City
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    cityFilter !== "All"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {supplierCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct === "All" ? "All Locations" : ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Supplier Type Filter (Column: Supplier Type) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Supplier Type
                </label>
                <select
                  value={supplierTypeFilter}
                  onChange={(e) => {
                    setSupplierTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    supplierTypeFilter !== "All"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {supplierTypesList.map((st) => (
                    <option key={st} value={st}>
                      {st === "All" ? "All Supplier Types" : st}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Payment Terms Filter (Column: Payment Terms) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Payment Terms
                </label>
                <select
                  value={paymentTermsFilter}
                  onChange={(e) => {
                    setPaymentTermsFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-500 truncate ${
                    paymentTermsFilter !== "All"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {paymentTermsList.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt === "All" ? "All Payment Terms" : pt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
              {/* 1. Status Filter */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 truncate ${
                    statusFilter !== "All"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>

              {/* 2. Specialization Filter (Column: Work Categories / Specializations) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Work Category
                </label>
                <select
                  value={specializationFilter}
                  onChange={(e) => {
                    setSpecializationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 truncate ${
                    specializationFilter !== "All"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {contractorSpecializations.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp === "All" ? "All Categories" : sp}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Location / City Filter (Column: Location) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location / City
                </label>
                <select
                  value={cityFilter}
                  onChange={(e) => {
                    setCityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 truncate ${
                    cityFilter !== "All"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {contractorCities.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct === "All" ? "All Locations" : ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Contractor Type Filter (Column: Contractor Type) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Contractor Type
                </label>
                <select
                  value={contractorTypeFilter}
                  onChange={(e) => {
                    setContractorTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 truncate ${
                    contractorTypeFilter !== "All"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {contractorTypesList.map((ct) => (
                    <option key={ct} value={ct}>
                      {ct === "All" ? "All Contractor Types" : ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Availability Filter (Column: Availability) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Availability
                </label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => {
                    setAvailabilityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 truncate ${
                    availabilityFilter !== "All"
                      ? "bg-blue-50 text-blue-800 border-blue-300 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white"
                  }`}
                >
                  {contractorAvailabilityList.map((av) => (
                    <option key={av} value={av}>
                      {av === "All" ? "All Availability" : av}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 10-COLUMN DIRECTORY TABLE ================= */}
      <div className="w-full max-w-full min-w-0 bg-white border border-slate-200/90 shadow-xs overflow-hidden rounded-none">
        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <FaSpinner className="w-5 h-5 animate-spin text-slate-600" />
            <span>Loading {selectedType.toLowerCase()}s from database...</span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 text-sm">No {selectedType.toLowerCase()}s found</p>
            <p className="mt-1">
              {hasActiveFilters
                ? "Try adjusting your search query or filter options."
                : `Add your first entry using the "Add ${selectedType}" button above.`}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer"
              >
                <FaTimes className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        ) : (
          <Table
            data={paginatedData}
            columnConfig={activeColumnConfig}
            showSrNo={true}
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
            itemsPerPageOptions={[10, 25, 50]}
          />
        )}
      </div>

      {/* ================= QUICK VIEW DETAILS MODAL ================= */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 text-white p-4 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">{selectedItem.name}</h3>
                  <span className="text-[10px] font-mono bg-white/20 text-emerald-200 px-1.5 py-0.5 rounded">
                    {selectedItem.code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                    {viewType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedItem.supplierType || selectedItem.contractorType}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* Contact Info */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  1. Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><span className="text-slate-500">Contact Person:</span> <strong className="text-slate-800">{selectedItem.contactPerson}</strong></div>
                  <div><span className="text-slate-500">Designation:</span> <strong className="text-slate-800">{selectedItem.designation || "—"}</strong></div>
                  <div><span className="text-slate-500">Phone:</span> <strong className="text-slate-800">{selectedItem.phone}</strong></div>
                  <div><span className="text-slate-500">WhatsApp:</span> <strong className="text-slate-800">{selectedItem.whatsappNo || "—"}</strong></div>
                  <div><span className="text-slate-500">Alt Phone:</span> <strong className="text-slate-800">{selectedItem.alternatePhone || "—"}</strong></div>
                  <div><span className="text-slate-500">Email:</span> <strong className="text-slate-800">{selectedItem.email || "—"}</strong></div>
                </div>
              </div>

              {/* Address */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                  2. Business Address & Location
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="col-span-2"><span className="text-slate-500">Registered Address:</span> <strong className="text-slate-800">{selectedItem.address}</strong></div>
                  <div><span className="text-slate-500">City / State:</span> <strong className="text-slate-800">{selectedItem.city}, {selectedItem.state}</strong></div>
                  <div><span className="text-slate-500">Pincode:</span> <strong className="text-slate-800">{selectedItem.pincode || "—"}</strong></div>
                  {selectedItem.deliveryLeadTime && (
                    <div><span className="text-slate-500">Delivery Lead Time:</span> <strong className="text-slate-800">{selectedItem.deliveryLeadTime} Days</strong></div>
                  )}
                  {selectedItem.availability && (
                    <div><span className="text-slate-500">Availability:</span> <strong className="text-slate-800">{selectedItem.availability}</strong></div>
                  )}
                </div>
              </div>

              {/* Tax & Banking (For Supplier) / Work Scope (For Contractor) */}
              {viewType === "Supplier" ? (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                    3. Tax, Commercial & Bank Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">GSTIN:</span> <strong className="font-mono text-slate-800">{selectedItem.gstin || "—"}</strong></div>
                    <div><span className="text-slate-500">PAN:</span> <strong className="font-mono text-slate-800">{selectedItem.pan || "—"}</strong></div>
                    <div><span className="text-slate-500">MSME / Udyam:</span> <strong className="text-slate-800">{selectedItem.msmeNo || "—"}</strong></div>
                    <div><span className="text-slate-500">Credit Limit:</span> <strong className="text-slate-800">{selectedItem.creditLimit ? `₹ ${selectedItem.creditLimit.toLocaleString()}` : "—"}</strong></div>
                    <div><span className="text-slate-500">Bank Name:</span> <strong className="text-slate-800">{selectedItem.bankName || "—"}</strong></div>
                    <div><span className="text-slate-500">A/C Number:</span> <strong className="font-mono text-slate-800">{selectedItem.accountNumber || "—"}</strong></div>
                    <div><span className="text-slate-500">A/C Holder:</span> <strong className="text-slate-800">{selectedItem.accountHolderName || "—"}</strong></div>
                    <div><span className="text-slate-500">IFSC Code:</span> <strong className="font-mono text-slate-800">{selectedItem.ifsc || "—"}</strong></div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                    3. Contractor Execution & Tools Details
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-500">Work Will Done By:</span> <strong className="text-slate-800">{selectedItem.workWillDoneBy || "—"}</strong></div>
                    <div><span className="text-slate-500">Commercial Terms:</span> <strong className="text-slate-800">{selectedItem.commercialTerms || "—"}</strong></div>
                    {selectedItem.toolsVehicles?.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-slate-500 block mb-1">Tools / Vehicles Available:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedItem.toolsVehicles.map((t, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items List */}
              {viewType === "Supplier" && selectedItem.materialsSupplied?.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                    4. Materials / Services Supplied ({selectedItem.materialsSupplied.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedItem.materialsSupplied.map((m, i) => (
                      <span key={i} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewType === "Contractor" && selectedItem.workCategories?.length > 0 && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2 border-b border-slate-200 pb-1">
                    4. Work Categories & Supported Tasks
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedItem.workCategories.map((w, i) => (
                      <span key={i} className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        {w}
                      </span>
                    ))}
                  </div>
                  {selectedItem.supportedTasks?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedItem.supportedTasks.map((t, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Remarks */}
              {selectedItem.remarks && (
                <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-1">Remarks:</h4>
                  <p className="text-slate-700 text-[11px]">{selectedItem.remarks}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuplireContractorComponent;
