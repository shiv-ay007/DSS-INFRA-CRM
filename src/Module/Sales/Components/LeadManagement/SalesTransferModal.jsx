import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaBuilding,
  FaBriefcase,
  FaRupeeSign,
  FaMapMarkerAlt,
  FaClipboardList,
  FaStar,
  FaTimes,
  FaCheck,
  FaExternalLinkAlt,
  FaWhatsapp
} from "react-icons/fa";
import { availableWorkTypes, workCategoryList } from "../../data/addLeadData";

const teamMembers = [
  "Sales TL",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta"
];

const SalesTransferModal = ({ lead, initialRemark, isOpen, onClose, onSubmit }) => {
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
    assignedTo: "Sales TL"
  });

  useEffect(() => {
    if (lead) {
      setFormData({
        clientName: lead.concernPersonName || lead.clientName || "",
        phoneNumber: lead.phoneNumber || lead.contact || "",
        alternateNumber: lead.alternateNumber || "",
        whatsappNumber: lead.whatsappNumber || lead.phoneNumber || "",
        emailAddress: lead.emailAddress || lead.email || "",
        companyName: lead.companyName || lead.company || "",
        businessType: lead.workCategory || lead.businessType || "Information Technology",
        clientDesignation: lead.clientDesignation || "Managing Director",
        expectedBusiness: Number(lead.expectedBusiness || lead.amount || 50000),
        priority: (lead.leadLabel || "").toUpperCase() === "HOT" ? "high" : (lead.leadLabel || "").toUpperCase() === "WARM" ? "medium" : "low",
        jobType: lead.jobType || "NEW",
        city: lead.city || "",
        state: lead.state || "",
        pincode: lead.pincode || "",
        address: lead.address || lead.siteAddress || "",
        requirement: lead.requirement || "",
        transferRemark: initialRemark || lead.remark || "",
        clientRating: Number(lead.clientRating || 4.5),
        assignedTo: lead.assignTo || lead.salesPerson || "Sales TL"
      });
    }
  }, [lead, initialRemark]);

  if (!isOpen || !lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg shadow-inner">
              <FaExternalLinkAlt />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Sales Management Transfer Form
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Pre-Filled Lead Data
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Review and update parameters for <strong className="text-white">{lead.concernPersonName || lead.clientName}</strong> before submitting to Sales Management.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shrink-0"
          >
            <FaTimes />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* SECTION 1: CLIENT INFORMATION */}
          <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60">
              <FaUser className="text-blue-600" />
              <span>Client Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Client / Concern Person Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaUser />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Primary Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaPhoneAlt />
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold font-mono text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Alternate Contact / WhatsApp
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <FaWhatsapp />
                  </span>
                  <input
                    type="text"
                    value={formData.whatsappNumber}
                    onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold font-mono text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Client Designation
                </label>
                <input
                  type="text"
                  value={formData.clientDesignation}
                  onChange={(e) => setFormData({ ...formData, clientDesignation: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Client Rating (1 to 5 ★)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500">
                    <FaStar />
                  </span>
                  <select
                    value={formData.clientRating}
                    onChange={(e) => setFormData({ ...formData, clientRating: parseFloat(e.target.value) })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                  >
                    <option value={5}>5.0 ★ (Highest Potential)</option>
                    <option value={4.5}>4.5 ★ (Very High)</option>
                    <option value={4}>4.0 ★ (High)</option>
                    <option value={3.5}>3.5 ★ (Medium)</option>
                    <option value={3}>3.0 ★ (Average)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: COMPANY & DEAL FINANCIALS */}
          <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60">
              <FaBuilding className="text-indigo-600" />
              <span>Company & Business Parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <FaBuilding />
                  </span>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Business Category / Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  {workCategoryList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Expected Business (₹ Amount) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-xs">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.expectedBusiness}
                    onChange={(e) => setFormData({ ...formData, expectedBusiness: e.target.value })}
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-emerald-700 text-xs focus:border-emerald-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Lead Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Job Type
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
                >
                  <option value="NEW">NEW Client / Job</option>
                  <option value="OLD">OLD / Repeat Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Assigned Executive
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs cursor-pointer"
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

          {/* SECTION 3: SITE ADDRESS & LOCATION */}
          <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60">
              <FaMapMarkerAlt className="text-rose-600" />
              <span>Location & Site Address</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold font-mono text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Full Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* SECTION 4: REQUIREMENT & TRANSFER REMARKS */}
          <div className="space-y-3 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-200/60">
              <FaClipboardList className="text-purple-600" />
              <span>Requirement Details & Sales Remarks</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Client Requirement Details
              </label>
              <textarea
                rows={2}
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Transfer Remarks / Sales Notes
              </label>
              <textarea
                rows={2}
                value={formData.transferRemark}
                onChange={(e) => setFormData({ ...formData, transferRemark: e.target.value })}
                placeholder="Enter sales management notes..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 text-xs focus:border-blue-500 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaCheck className="text-xs" />
              <span>Confirm & Transfer to Sales Management</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default SalesTransferModal;
