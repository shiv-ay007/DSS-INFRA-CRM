import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaStar,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaTrashAlt,
  FaTimes,
  FaHandshake,
  FaHardHat,
  FaTruck,
  FaUsersCog,
  FaCheckCircle,
  FaClock
} from "react-icons/fa";
import { HiSparkles, HiShieldCheck } from "react-icons/hi2";
import Table from "../../../../../Common/Components/Table";

const initialSuppliersContractors = [
  {
    id: 1,
    code: "VEN-SUP-01",
    name: "Apex Steel & Cement Distributors",
    type: "Supplier",
    trade: "TMT Rebars & 53G Cement",
    contactPerson: "Ramesh Sharma",
    phone: "+91 98765 43210",
    email: "apex.materials@gmail.com",
    city: "Mumbai, MH",
    rating: 4.8,
    projectsDone: 42,
    status: "Verified",
    gstin: "27AAACA1234A1Z5"
  },
  {
    id: 2,
    code: "VEN-CON-02",
    name: "Shree Ram Civil & Structure Contractors",
    type: "Contractor",
    trade: "RCC Framing, Shuttering & Masonry",
    contactPerson: "Vikram Chauhan",
    phone: "+91 98230 11223",
    email: "shreeram.civil@outlook.com",
    city: "Pune, MH",
    rating: 4.9,
    projectsDone: 28,
    status: "Verified",
    gstin: "27AABCS5678B2Z1"
  },
  {
    id: 3,
    code: "VEN-SUP-03",
    name: "Surya Electricals & MEP Solutions",
    type: "Supplier",
    trade: "Electrical Supply & High-Tension Cabling",
    contactPerson: "Deepak Patel",
    phone: "+91 94055 88990",
    email: "surya.mep@domain.com",
    city: "Thane, MH",
    rating: 4.6,
    projectsDone: 19,
    status: "Verified",
    gstin: "27AACCS9988D1Z9"
  },
  {
    id: 4,
    code: "VEN-CON-04",
    name: "Krishna Waterproofing & Coating",
    type: "Contractor",
    trade: "Terrace, Basement & Wet Area Waterproofing",
    contactPerson: "Sunil Verma",
    phone: "+91 91234 56789",
    email: "krishna.waterproof@gmail.com",
    city: "Navi Mumbai, MH",
    rating: 4.4,
    projectsDone: 15,
    status: "Pending",
    gstin: "27AABCV3344E1Z4"
  },
  {
    id: 5,
    code: "VEN-SUP-05",
    name: "Classic Marble & Italian Granite Mart",
    type: "Supplier",
    trade: "Imported Marble, Granite & Tiles",
    contactPerson: "Manish Agarwal",
    phone: "+91 99887 76655",
    email: "classic.marble@gmail.com",
    city: "Mumbai, MH",
    rating: 4.7,
    projectsDone: 34,
    status: "Verified",
    gstin: "27AAACM1122F1Z8"
  }
];

// ❌ "All" हटा दिया गया है
const supplierContractorTypes = ["Supplier", "Contractor"];

const SuplireContractorComponent = () => {
  const navigate = useNavigate();
  const [suppliersContractors, setSuppliersContractors] = useState(initialSuppliersContractors);
  const [searchTerm, setSearchTerm] = useState("");
  // Default को "Supplier" कर दिया है ताकि "All" की जरूरत न पड़े
  const [selectedType, setSelectedType] = useState("Supplier");
  const [statusFilter, setStatusFilter] = useState("All");

  // KPI calculations
  const stats = useMemo(() => {
    const total = suppliersContractors.length;
    const suppliers = suppliersContractors.filter(v => v.type === "Supplier").length;
    const contractors = suppliersContractors.filter(v => v.type === "Contractor").length;
    const verified = suppliersContractors.filter(v => v.status === "Verified").length;
    return { total, suppliers, contractors, verified };
  }, [suppliersContractors]);

  // Filter logic - "All" वाला कंडीशन हटा दिया
  const filteredSuppliersContractors = useMemo(() => {
    return suppliersContractors.filter(v => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        v.name.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q) ||
        v.trade.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.code.toLowerCase().includes(q);

      const matchType = v.type === selectedType; // Strict matching
      const matchStatus = statusFilter === "All" || v.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [suppliersContractors, searchTerm, selectedType, statusFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const paginatedSuppliersContractors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSuppliersContractors.slice(start, start + itemsPerPage);
  }, [filteredSuppliersContractors, currentPage, itemsPerPage]);

  const columnConfig = useMemo(() => ({
    name: {
      label: "Supplier / Contractor",
      align: "left",
      headerClass: "min-w-[240px]",
      render: (val, row) => {
        const avatarBg =
          row.type === "Supplier"
            ? "bg-gradient-to-br from-emerald-500 to-teal-600"
            : "bg-gradient-to-br from-blue-500 to-indigo-600";

        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-xs ${avatarBg}`}>
              {row.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-mono text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                {row.code}
              </span>
              <h4 className="font-bold text-slate-900 mt-0.5 text-xs">{row.name}</h4>
              <span className="text-[9px] text-slate-400 font-mono">GST: {row.gstin}</span>
            </div>
          </div>
        );
      }
    },
    type: {
      label: "Type",
      align: "center",
      render: (val) => (
        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border whitespace-nowrap ${
          val === "Supplier" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"
        }`}>
          {val}
        </span>
      )
    },
    trade: {
      label: "Trade / Specialization",
      align: "center",
      render: (val, row) => (
        <div>
          <span className="text-[11px] font-semibold text-slate-800 line-clamp-2">
            {val}
          </span>
          <p className="text-[9px] text-slate-400 mt-0.5">{row.projectsDone} Projects</p>
        </div>
      )
    },
    contact: {
      label: "Contact Info",
      align: "center",
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-800 text-[11px]">{row.contactPerson}</p>
          <a
            href={`tel:${row.phone}`}
            className="text-[10px] text-slate-500 hover:text-amber-600 inline-flex items-center justify-center gap-1 mt-0.5"
          >
            <FaPhoneAlt className="w-2 h-2 text-slate-400" />
            {row.phone}
          </a>
        </div>
      )
    },
    city: {
      label: "Location",
      align: "center",
      render: (val) => (
        <span className="text-[11px] font-semibold text-slate-700 inline-flex items-center justify-center gap-1 whitespace-nowrap">
          <FaMapMarkerAlt className="w-2.5 h-2.5 text-slate-400" />
          {val}
        </span>
      )
    },
    rating: {
      label: "Rating",
      align: "center",
      render: (val) => (
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          <FaStar className="w-2.5 h-2.5 text-amber-500" />
          {val}
        </div>
      )
    },
    status: {
      label: "Status",
      align: "center",
      render: (val) => (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
          val === "Verified"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}>
          {val === "Verified"
            ? <FaCheckCircle className="w-2.5 h-2.5" />
            : <FaClock className="w-2.5 h-2.5" />}
          {val}
        </span>
      )
    },
    actions: {
      label: "Actions",
      align: "right",
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1.5">
          <a
            href={`mailto:${row.email}`}
            title="Send Email"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
          >
            <FaEnvelope className="w-3 h-3" />
          </a>
          <button
            onClick={() => handleDelete(row.id, row.name)}
            title="Delete Entry"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
          >
            <FaTrashAlt className="w-3 h-3" />
          </button>
        </div>
      )
    }
  }), []);

  const handleDelete = (id, name) => {
    if (window.confirm(`Remove "${name}" from directory?`)) {
      setSuppliersContractors(prev => prev.filter(v => v.id !== id));
      toast.info(`Removed "${name}"`);
    }
  };

  // KPI Card Component
  const KpiCard = ({ gradient, icon, label, value, subtitle, IconBg }) => (
    <div className={`relative overflow-hidden rounded-xl p-4 shadow-md ${gradient} text-white group`}>
      <div className="absolute -right-4 -bottom-6 opacity-15 transform group-hover:scale-110 transition-transform duration-500 pointer-events-none">
        {IconBg}
      </div>
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-widest opacity-90">{label}</p>
          <h3 className="text-3xl font-black mt-1 leading-none">{value}</h3>
          <p className="text-[10px] opacity-80 mt-1 font-medium">{subtitle}</p>
        </div>
        <div className="p-2.5 bg-white/20 rounded-lg backdrop-blur-sm shadow-inner">
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12 px-1 sm:px-0 font-sans">

      {/* ================= STICKY & THIN HEADER BANNER ================= */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 via-orange-950 to-slate-900 text-white rounded-xl p-4 shadow-lg border border-orange-700/50 overflow-hidden mb-2">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg shadow-md flex items-center justify-center shrink-0">
              <FaUsersCog className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Supplier & Contractor
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <HiSparkles className="w-3 h-3 text-amber-300" /> Master Form
                </span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1 max-w-xl font-normal">
                Approved master directory of material suppliers, civil subcontractors, and MEP specialists.
              </p>
            </div>
          </div>

          {/* 🔥 TWO SEPARATE BUTTONS FOR SUPPLIER & CONTRACTOR */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor/add-supplier")}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-lg shadow-md shadow-emerald-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Add Supplier</span>
            </button>
            <button
              onClick={() => navigate("/sales/master/suplire-and-contractor/add-contractor")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 text-xs w-fit"
            >
              <FaPlus className="w-3.5 h-3.5" />
              <span>Add Contractor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= COMPACT KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          label="Total Suppliers & Contractors"
          value={stats.total}
          subtitle="Registered in directory"
          icon={<FaHandshake className="w-5 h-5 text-white" />}
          IconBg={<FaHandshake className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-emerald-600 to-teal-700"
          label="Material Suppliers"
          value={stats.suppliers}
          subtitle="Raw material vendors"
          icon={<FaTruck className="w-5 h-5 text-white" />}
          IconBg={<FaTruck className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
          label="Contractors"
          value={stats.contractors}
          subtitle="Civil & MEP specialists"
          icon={<FaHardHat className="w-5 h-5 text-white" />}
          IconBg={<FaHardHat className="w-20 h-20" />}
        />
        <KpiCard
          gradient="bg-gradient-to-br from-purple-600 to-pink-600"
          label="Verified Entries"
          value={stats.verified}
          subtitle="GST & KYC compliant"
          icon={<HiShieldCheck className="w-5 h-5 text-white" />}
          IconBg={<HiShieldCheck className="w-20 h-20" />}
        />
      </div>

      {/* ================= SEARCH & FILTER BAR ================= */}
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-lg">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search supplier or contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <FaFilter className="text-slate-400 text-[10px]" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-[11px] font-bold bg-transparent text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">
            {filteredSuppliersContractors.length} Found
          </span>
        </div>
      </div>

      {/* ================= TYPE FILTER PILLS (No "All") ================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {supplierContractorTypes.map(type => {
          const active = selectedType === type;
          const iconMap = {
            Supplier: <FaTruck className="w-3 h-3" />,
            Contractor: <FaHardHat className="w-3 h-3" />
          };
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                active
                  ? type === "Supplier"
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-sm shadow-emerald-500/30"
                    : "bg-blue-600 text-white border-blue-700 shadow-sm shadow-blue-500/30"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {iconMap[type]}
              <span>{type}</span>
            </button>
          );
        })}
      </div>

      {/* ================= DIRECTORY TABLE ================= */}
      <div className="bg-white border border-slate-200/90 shadow-xs overflow-hidden">
        <Table
          data={paginatedSuppliersContractors}
          columnConfig={columnConfig}
          showSrNo={true}
          currentPage={currentPage}
          totalItems={filteredSuppliersContractors.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[10, 25, 50]}
        />
      </div>
    </div>
  );
};

export default SuplireContractorComponent;