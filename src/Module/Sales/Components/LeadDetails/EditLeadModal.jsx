import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FaEdit,
  FaTimes,
  FaUser,
  FaChartBar,
  FaClipboardList,
  FaMapMarkerAlt,
  FaSave,
  FaCheck,
  FaPlus
} from "react-icons/fa";
import {
  salesPersonsList,
  leadSourcesList,
  channelsList,
  leadTypesList,
  jobTypesList,
  clientTypesList,
  indianStatesList,
  availableWorkTypes,
  workCategoryList
} from "../../data/addLeadData";
import { updateLeadInStorage } from "../../utils/leadStorageUtils";

const EditLeadModal = ({ lead, isOpen, onClose, onSaveSuccess }) => {
  if (!isOpen || !lead) return null;

  const [formData, setFormData] = useState({
    clientName: "",
    clientDesignation: "",
    company: "",
    phoneNumber: "",
    alternateNumber: "",
    whatsappNumber: "",
    emailAddress: "",
    status: "NEW",
    leadLabel: "HOT",
    leadSource: "",
    channel: "Sales",
    leadType: "FRESH",
    jobType: "NEW",
    clientType: "Individual",
    assignTo: "Sales TL (Current User)",
    expectedBusiness: "",
    workCategory: "",
    workType: [],
    requirement: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    googleLocation: ""
  });

  const availableWorkTypeOptions = availableWorkTypes && availableWorkTypes.length > 0 ? availableWorkTypes : [
    "Concept Drawing", "Approval Drawing", "Structure Drawing", "Working Drawing",
    "Electrical Drawing", "Plumbing Drawing", "Survey Drawing", "Landscape Drawing",
    "Submission Drawing", "Elevation Drawing", "Interior Work", "Construction Raw Drawing",
    "Project Management", "Renovation Work", "Site Visit Work", "3D Interior View Design",
    "2D Interior Design", "3D Exterior View Design", "Other"
  ];

  useEffect(() => {
    if (lead) {
      let parsedWorkType = [];
      if (Array.isArray(lead.workType)) {
        parsedWorkType = lead.workType;
      } else if (typeof lead.workType === "string" && lead.workType.trim()) {
        parsedWorkType = lead.workType.split(",").map((s) => s.trim()).filter(Boolean);
      }

      setFormData({
        clientName: lead.clientName || lead.concernPersonName || "",
        clientDesignation: lead.clientDesignation || "",
        company: lead.company || lead.companyName || "",
        phoneNumber: lead.phoneNumber || lead.contact || "",
        alternateNumber: lead.alternateNumber || lead.alternateNo || "",
        whatsappNumber: lead.whatsappNumber || lead.phoneNumber || lead.contact || "",
        emailAddress: lead.emailAddress || lead.email || "",
        status: (lead.status || lead.leadStatus || "NEW").toUpperCase(),
        leadLabel: (lead.leadLabel || lead.priority || "HOT").toUpperCase(),
        leadSource: lead.leadSource || lead.leadMode || "",
        channel: lead.channelType || lead.channel || "Sales",
        leadType: lead.leadType || "FRESH",
        jobType: lead.jobType || "NEW",
        clientType: lead.clientType || "Individual",
        assignTo: lead.assignTo || lead.salesPerson || "Sales TL (Current User)",
        expectedBusiness: lead.expectedBusiness || lead.expectedRevenue || lead.amount || "",
        workCategory: lead.workCategory || "",
        workType: parsedWorkType,
        requirement: lead.requirement || lead.projectDetail || lead.projectDetails || "",
        address: lead.address || "",
        city: lead.city || "",
        state: lead.state || "",
        pincode: lead.pincode || "",
        googleLocation: lead.googleLocation || ""
      });
    }
  }, [lead]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWorkTypeToggle = (wt) => {
    setFormData((prev) => {
      const exists = prev.workType.includes(wt);
      if (exists) {
        return { ...prev, workType: prev.workType.filter((t) => t !== wt) };
      } else {
        return { ...prev, workType: [...prev.workType, wt] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.clientName.trim()) {
      toast.error("Please enter Client / Concern Person Name.");
      return;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Please enter Primary Phone Number.");
      return;
    }

    const updatedLead = {
      ...lead,
      clientName: formData.clientName.trim(),
      concernPersonName: formData.clientName.trim(),
      clientDesignation: formData.clientDesignation.trim(),
      company: formData.company.trim(),
      companyName: formData.company.trim(),
      phoneNumber: formData.phoneNumber.trim(),
      contact: formData.phoneNumber.trim(),
      alternateNumber: formData.alternateNumber.trim(),
      alternateNo: formData.alternateNumber.trim(),
      whatsappNumber: formData.whatsappNumber.trim() || formData.phoneNumber.trim(),
      emailAddress: formData.emailAddress.trim(),
      email: formData.emailAddress.trim(),
      status: formData.status,
      leadStatus: formData.status,
      leadLabel: formData.leadLabel,
      priority: formData.leadLabel,
      leadSource: formData.leadSource,
      leadMode: formData.leadSource,
      channel: formData.channel,
      channelType: formData.channel,
      leadType: formData.leadType,
      jobType: formData.jobType,
      clientType: formData.clientType,
      assignTo: formData.assignTo,
      salesPerson: formData.assignTo,
      expectedBusiness: formData.expectedBusiness,
      expectedRevenue: formData.expectedBusiness,
      amount: formData.expectedBusiness,
      workCategory: formData.workCategory,
      workType: formData.workType,
      requirement: formData.requirement.trim(),
      projectDetail: formData.requirement.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
      googleLocation: formData.googleLocation.trim(),
      lastModified: new Date().toISOString()
    };

    updateLeadInStorage(updatedLead);
    toast.success("Lead details updated successfully!");

    if (onSaveSuccess) {
      onSaveSuccess(updatedLead);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-fadeIn">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-lg font-bold">
              <FaEdit />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Edit Lead Details
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-400/30">
                  {lead.id || "LM-LEAD"}
                </span>
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                Update client info, contact parameters, lead status, deal value, and requirements.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition-all cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* MODAL FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {/* SECTION 1: CLIENT & CONTACT INFORMATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FaUser className="text-blue-600 text-sm" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Client & Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Concern Person Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  placeholder="e.g. Hamilton Wheeler"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                <input
                  type="text"
                  name="clientDesignation"
                  value={formData.clientDesignation}
                  onChange={handleChange}
                  placeholder="e.g. Managing Director"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Acme Infra Pvt Ltd"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alternate Phone Number</label>
                <input
                  type="text"
                  name="alternateNumber"
                  value={formData.alternateNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543211"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder="e.g. client@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: PIPELINE & STATUS CLASSIFICATION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FaChartBar className="text-purple-600 text-sm" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Pipeline Classification & Assignment
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lead Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold"
                >
                  <option value="NEW">NEW</option>
                  <option value="HOT">HOT LEAD</option>
                  <option value="WARM">WARM LEAD</option>
                  <option value="COLD">COLD LEAD</option>
                  <option value="INTERESTED">INTERESTED</option>
                  <option value="IN-PROGRESS">IN-PROGRESS</option>
                  <option value="CONVERTED">CONVERTED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Priority / Label</label>
                <select
                  name="leadLabel"
                  value={formData.leadLabel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-extrabold"
                >
                  <option value="HOT">HOT</option>
                  <option value="WARM">WARM</option>
                  <option value="COLD">COLD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source / Mode</label>
                <select
                  name="leadSource"
                  value={formData.leadSource}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  <option value="">-- Select Source --</option>
                  {(leadSourcesList || ["Business Networking", "By Freelancer", "By Sales Team", "Customer to Customer", "Website", "Social Media"]).map((src, i) => (
                    <option key={i} value={src}>{src}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Sales Representative</label>
                <select
                  name="assignTo"
                  value={formData.assignTo}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold"
                >
                  {(salesPersonsList || ["Sales TL (Current User)", "Rahul Sharma", "Pooja Verma", "Vikram Malhotra"]).map((sp, i) => (
                    <option key={i} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Channel</label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  {(channelsList || ["Sales", "Marketing", "Direct Referral", "Partner"]).map((ch, i) => (
                    <option key={i} value={ch}>{ch}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lead Type</label>
                <select
                  name="leadType"
                  value={formData.leadType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  {(leadTypesList || ["FRESH", "REPEAT"]).map((lt, i) => (
                    <option key={i} value={lt}>{lt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Type</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  {(jobTypesList || ["NEW", "RENOVATION", "MAINTENANCE"]).map((jt, i) => (
                    <option key={i} value={jt}>{jt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client Type</label>
                <select
                  name="clientType"
                  value={formData.clientType}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  {(clientTypesList || ["Individual", "Corporate", "Builder", "Architect", "Government"]).map((ct, i) => (
                    <option key={i} value={ct}>{ct}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: REQUIREMENTS & FINANCIAL DEAL VALUE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FaClipboardList className="text-emerald-600 text-sm" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Requirements & Financial Deal Value
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Business Deal Value (₹)
                </label>
                <input
                  type="text"
                  name="expectedBusiness"
                  value={formData.expectedBusiness}
                  onChange={handleChange}
                  placeholder="e.g. 500000 or ₹ 5,00,000"
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono font-black text-emerald-800 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Work Category</label>
                <select
                  name="workCategory"
                  value={formData.workCategory}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  <option value="">-- Select Work Category --</option>
                  {(workCategoryList || ["Design", "Construction", "Interior", "Full Furnished", "Fabrication", "Other"]).map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Type Multi-Select Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Types / Services Requested
              </label>
              <div className="flex flex-wrap gap-2 p-3 rounded-2xl border border-slate-200 bg-slate-50/70 max-h-40 overflow-y-auto">
                {availableWorkTypeOptions.map((wt, idx) => {
                  const isSelected = formData.workType.includes(wt);
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleWorkTypeToggle(wt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-700 shadow-xs scale-102"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {isSelected ? <FaCheck className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
                      <span>{wt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Requirement Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Requirement Details & Notes</label>
              <textarea
                rows={3}
                name="requirement"
                value={formData.requirement}
                onChange={handleChange}
                placeholder="Enter client's detailed requirement specifications..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* SECTION 4: SITE LOCATION & ADDRESS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FaMapMarkerAlt className="text-rose-500 text-sm" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Site & Client Location Address
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Site / Client Full Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Plot No 45, Sector 62"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Noida"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
                >
                  <option value="">-- Select State --</option>
                  {(indianStatesList || ["Uttar Pradesh", "Delhi", "Haryana", "Maharashtra"]).map((st, i) => (
                    <option key={i} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="e.g. 201301"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono font-semibold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps / Location Link</label>
                <input
                  type="url"
                  name="googleLocation"
                  value={formData.googleLocation}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono text-xs text-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <FaSave className="text-sm" />
              <span>Save Lead Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;
