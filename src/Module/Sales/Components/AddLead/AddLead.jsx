import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import {
  salesPersonsList,
  leadSourcesList,
  channelsList,
  leadTypesList,
  jobTypesList,
  clientTypesList,
  leadLabelsList,
  indianStatesList,
  availableWorkTypes
} from "../../data/addLeadData";
import { FaPlus, FaMicrophone, FaImage, FaVideo, FaFileAudio, FaTimes } from "react-icons/fa";

const Addlead = () => {
  const navigate = useNavigate();

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Lead Mode options
  const leadModeList = ["Online", "Offline", "Reference", "Walk-in", "Call"];

  // Lead Status options (Hot, Warm, Cold)
  const leadStatusList = ["Hot", "Warm", "Cold"];

  // Work Type options for multi-select
  const workTypeOptions = [
    "Architectural Planning",
    "Construction",
    "Interior Design",
    "Fabrication Works",
    "Consultancy"
  ];

  // Initial Form State
  const initialFormState = {
    date: getTodayDate(),
    leadMode: "",
    leadType: "FRESH",
    workType: [],
    leadStatus: "",
    clientName: "",
    phoneNumber: "",
    alternateNumber: "",
    emailAddress: "",
    address: "",
    city: "",
    pincode: "",
    state: "",
    expectedBusiness: "",
    projectDetail: "",
    remark: "",
    remarkAttachments: [],
    // Keeping other fields for completeness
    leadSource: "",
    channel: "Sales",
    jobType: "NEW",
    clientType: "Individual",
    clientDesignation: "",
    leadLabel: "",
    whatsappNumber: "",
    googleLocation: "",
    salesPerson: "Sales TL (Current User)",
    requirement: ""
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  
  // Refs for file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const remarkTextareaRef = useRef(null);

  // Handle Input & Select Changes
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

  // Toggle Work Types (Multi-select)
  const toggleWorkType = (type) => {
    setFormData((prev) => {
      const exists = prev.workType.includes(type);
      const updated = exists
        ? prev.workType.filter((item) => item !== type)
        : [...prev.workType, type];
      return { ...prev, workType: updated };
    });
  };

  // Handle File Upload
  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      remarkAttachments: [...prev.remarkAttachments, ...newAttachments]
    }));

    // Reset file input
    e.target.value = '';
    setShowUploadOptions(false);
  };

  // Remove Attachment
  const removeAttachment = (id) => {
    setFormData(prev => ({
      ...prev,
      remarkAttachments: prev.remarkAttachments.filter(item => item.id !== id)
    }));
  };

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        
        const newAttachment = {
          id: Date.now() + Math.random(),
          file,
          type: 'audio',
          name: `Audio-${Date.now()}.webm`,
          size: blob.size,
          url: url
        };

        setFormData(prev => ({
          ...prev,
          remarkAttachments: [...prev.remarkAttachments, newAttachment]
        }));

        setAudioURL(url);
        setIsRecording(false);
        setAudioChunks([]);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks(chunks);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Please allow microphone access to record audio.");
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.leadMode) newErrors.leadMode = "Please select lead mode";
    if (!formData.leadType) newErrors.leadType = "Please select lead type";
    if (formData.workType.length === 0) newErrors.workType = "Please select at least one work type";
    if (!formData.leadStatus) newErrors.leadStatus = "Please select lead status";

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Please enter valid 10-digit phone number";
    }

    if (formData.alternateNumber.trim() && !phoneRegex.test(formData.alternateNumber.trim())) {
      newErrors.alternateNumber = "Alternate number must be 10 digits";
    }

    // Email validation (optional but if provided should be valid)
    if (formData.emailAddress.trim() && !/\S+@\S+\.\S+/.test(formData.emailAddress.trim())) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.state) newErrors.state = "Please select state";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submit & Save to LocalStorage
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const today = new Date();
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-GB', options);

      const newLead = {
        id: `LM-${Math.floor(100000 + Math.random() * 900000)}`,
        concernPersonName: formData.clientName,
        phoneNumber: formData.phoneNumber,
        alternateNumber: formData.alternateNumber,
        emailAddress: formData.emailAddress,
        status: formData.leadStatus || "NEW",
        nextFollowupDate: formattedDate,
        nextFollowupDateRaw: formData.date || today.toISOString().split("T")[0],
        nextFollowupTime: "11:00 am",
        channelType: formData.channel || "Sales",
        followupRemarksCount: 0,
        followupHistory: [],
        createdDate: formattedDate,
        createdTime: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        leadAge: "0 Days",
        leadLabel: formData.leadLabel || "",
        leadType: formData.leadType,
        jobType: formData.jobType || "NEW",
        clientType: formData.clientType || "Individual",
        workType: formData.workType,
        requirement: formData.remark || "New Lead Registration",
        expectedBusiness: formData.expectedBusiness || "0",
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        leadSource: formData.leadSource || "",
        leadBy: formData.salesPerson || "Sales TL (Current User)",
        assignTo: formData.salesPerson || "Sales TL (Current User)",
        address: formData.address,
        clientDesignation: formData.clientDesignation || "",
        googleLocation: formData.googleLocation || "",
        leadMode: formData.leadMode,
        leadStatus: formData.leadStatus,
        projectDetail: formData.projectDetail || "",
        remark: formData.remark || "",
        remarkAttachments: formData.remarkAttachments.map(att => ({
          name: att.name,
          type: att.type,
          size: att.size
        })),
        whatsappNumber: formData.whatsappNumber || formData.phoneNumber
      };

      try {
        const saved = localStorage.getItem("dss_lead_management_sheet_v1");
        const currentLeads = saved ? JSON.parse(saved) : [];
        const updatedLeads = [newLead, ...currentLeads];
        localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(updatedLeads));
      } catch (err) {
        console.error("Failed to save lead to localStorage", err);
      }

      setIsSubmitting(false);
      setShowSuccessModal(true);
      toast.success("Lead Captured Successfully! 🎯", {
        position: "top-right",
        autoClose: 3000,
      });
    }, 500);
  };

  // Reset Form
  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setShowUploadOptions(false);
    setIsRecording(false);
    setAudioURL(null);
    setAudioChunks([]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Get file icon
  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return <FaImage className="text-green-500" />;
      case 'video': return <FaVideo className="text-purple-500" />;
      case 'audio': return <FaFileAudio className="text-red-500" />;
      default: return <FaFileAudio className="text-gray-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 font-sans pb-12">
      
      {/* TOP HEADER BANNER CARD */}
      <PageHeader
        title="!! Capture New Lead !!"
        showBackButton={true}
      />

      {/* MAIN FORM CARD */}
      <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-2xl shadow-2xs px-2.5 sm:px-4 py-5 space-y-3.5">
        
        {/* ROW 1: Lead Mode | Lead Type | Lead Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Mode <span className="text-red-500">*</span>
            </label>
            <select
              name="leadMode"
              value={formData.leadMode}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadMode ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select Lead Mode</option>
              {leadModeList.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            {errors.leadMode && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadMode}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leadType"
              value={formData.leadType}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadType ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="FRESH">Fresh</option>
              <option value="REPEAT">Repeat</option>
            </select>
            {errors.leadType && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadType}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Status <span className="text-red-500">*</span>
            </label>
            <select
              name="leadStatus"
              value={formData.leadStatus}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.leadStatus ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select Lead Status</option>
              {leadStatusList.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.leadStatus && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadStatus}</p>}
          </div>
        </div>

        {/* ROW 2: Client Name | Phone Number | Alternate Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="Enter Client Name"
              value={formData.clientName}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.clientName ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.clientName && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.clientName}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              maxLength={10}
              placeholder="Enter 10-digit Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "phoneNumber", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.phoneNumber ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.phoneNumber}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Alternate Number
            </label>
            <input
              type="tel"
              name="alternateNumber"
              maxLength={10}
              placeholder="Enter Alternate Number"
              value={formData.alternateNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "alternateNumber", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.alternateNumber ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.alternateNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.alternateNumber}</p>}
          </div>
        </div>

        {/* ROW 3: Email Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Email Address
            </label>
            <input
              type="email"
              name="emailAddress"
              placeholder="Enter Email Address"
              value={formData.emailAddress}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.emailAddress ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.emailAddress && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.emailAddress}</p>}
          </div>
          <div></div>
          <div></div>
        </div>

        {/* ROW 4: Address (Full Width) */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            name="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 resize-y ${
              errors.address ? "border-red-400 bg-red-50/20" : "border-black/20"
            }`}
          />
          {errors.address && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.address}</p>}
        </div>

        {/* ROW 5: City | Pincode | State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3 pt-1">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="Enter City"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.city ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={formData.pincode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                handleChange({ target: { name: "pincode", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 ${
                errors.pincode ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            />
            {errors.pincode && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.pincode}</p>}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer ${
                errors.state ? "border-red-400 bg-red-50/20" : "border-black/20"
              }`}
            >
              <option value="">Select State</option>
              {indianStatesList.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.state}</p>}
          </div>
        </div>

        {/* ROW 6: Work Type / Categories (Full Width - Multi-select Pills) */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Work Type / Categories <span className="text-red-500">*</span> <span className="text-slate-500 font-normal">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {workTypeOptions.map((type) => {
              const isSelected = formData.workType.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleWorkType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-black/20"
                  }`}
                >
                  <span>{type}</span>
                  {isSelected ? "✓" : "+"}
                </button>
              );
            })}
          </div>
          {errors.workType && <p className="text-xs text-red-500 font-medium mt-1">{errors.workType}</p>}
        </div>

        {/* ROW 7: Expected Business Amount | Lead Date | Project Detail */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3 pt-1">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Expected Business Amount (₹)
            </label>
            <input
              type="number"
              name="expectedBusiness"
              placeholder="Enter Expected Business Amount"
              value={formData.expectedBusiness}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Project Detail
            </label>
            <input
              type="text"
              name="projectDetail"
              placeholder="Enter Project Detail"
              value={formData.projectDetail}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* ROW 8: Remark (Full Width) with Icons Inside Textarea */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Remark
          </label>
          
          {/* Hidden file inputs */}
          <input
            type="file"
            ref={imageInputRef}
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
          />
          <input
            type="file"
            ref={videoInputRef}
            accept="video/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'video')}
            className="hidden"
          />
          <input
            type="file"
            ref={audioInputRef}
            accept="audio/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'audio')}
            className="hidden"
          />

          {/* Textarea with Icons Inside */}
          <div className="relative">
            <textarea
              ref={remarkTextareaRef}
              rows={3}
              name="remark"
              placeholder="Enter Remarks"
              value={formData.remark}
              onChange={handleChange}
              className="w-full px-3 py-1.5 pr-28 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 resize-y"
            />
            
            {/* Icons positioned inside the textarea */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-1 border border-slate-200 shadow-sm">
              {/* Plus Icon - Upload Options */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUploadOptions(!showUploadOptions)}
                  className="p-1 rounded-md hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                  title="Add Attachment"
                >
                  <FaPlus size={13} />
                </button>
                
                {/* Upload Options Dropdown */}
                {showUploadOptions && (
                  <div className="absolute right-0 bottom-7 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 z-10 min-w-[150px]">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <FaImage size={12} className="text-green-500" />
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <FaVideo size={12} className="text-purple-500" />
                      Video
                    </button>
                    <button
                      type="button"
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors"
                    >
                      <FaFileAudio size={12} className="text-red-500" />
                      Audio
                    </button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-slate-200"></div>

              {/* Mic Icon - Audio Recording */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  isRecording 
                    ? "text-red-500 animate-pulse" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
                title={isRecording ? "Stop Recording" : "Start Recording"}
              >
                <FaMicrophone size={13} />
              </button>
            </div>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center gap-2 mt-1 text-xs text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Recording audio... Click mic again to stop
            </div>
          )}

          {/* Attachments Preview */}
          {formData.remarkAttachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.remarkAttachments.map((att) => (
                <div key={att.id} className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2 py-1 text-xs">
                  {getFileIcon(att.type)}
                  <span className="text-slate-700 max-w-[120px] truncate">{att.name}</span>
                  <span className="text-slate-400">({formatFileSize(att.size)})</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(att.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Submitting Lead...</span>
              </>
            ) : (
              <span>Submit & Create Lead</span>
            )}
          </button>
        </div>

      </form>

      {/* SUCCESS POPUP MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full text-center shadow-xl border border-slate-100">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Lead Captured Successfully!
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Lead for <strong className="text-slate-900">{formData.clientName}</strong> has been registered and saved to your pipeline.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                + Add Another Lead
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate("/sales/leads");
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Go to Lead Sheet
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Addlead;