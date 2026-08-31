import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { createLeadApi } from "../../../../services/api";
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
import { initialTotalLeads } from "../../data/totalLeadsData";
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
  const leadModeList = [
    "Business Networking",
    "By Freelancer",
    "By Sales Team",
    "Customer to Customer"
  ];

  // Work Category options
  const workCategoryList = [
    "Design",
    "Construction",
    "Interior",
    "Full Furnished",
    "Fabrication",
    "Other"
  ];

  // Lead Status options (Hot, Warm, Cold)
  const leadStatusList = ["Hot", "Warm", "Cold"];

  // Work Type options for multi-select
  const workTypeOptions = [
    "Concept Drawing",
    "Approval Drawing",
    "Structure Drawing",
    "Working Drawing",
    "Electrical Drawing",
    "Plumbing Drawing",
    "Survey Drawing",
    "Landscape Drawing",
    "Submission Drawing",
    "Elevation Drawing",
    "Interior Work",
    "Construction Raw Drawing",
    "Project Management",
    "Renovation Work",
    "Site Visit Work",
    "3D Interior View Design",
    "2D Interior Design",
    "3D Exterior View Design",
    "Other"
  ];

  // Initial Form State
  const initialFormState = {
    date: getTodayDate(),
    leadMode: "",
    leadType: "FRESH",
    workCategory: "",
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
  const [customWorkType, setCustomWorkType] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingPincode, setIsFetchingPincode] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  
  // Helper to add custom work type tag
  const handleAddCustomWorkType = () => {
    const val = customWorkType.trim();
    if (!val) return;

    setFormData((prev) => {
      const updated = prev.workType.filter((t) => t !== "Other");
      if (!updated.includes(val)) {
        updated.push(val);
      }
      return { ...prev, workType: updated };
    });
    setCustomWorkType("");
  };
  
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

  // Handle Pincode change and auto-fetch City & State
  const handlePincodeChange = async (e) => {
    const val = e.target.value.replace(/\D/g, "");
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

          // Match state in indianStatesList
          const matchedState = indianStatesList.find(
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
        }
      } catch (err) {
        console.error("Error fetching pincode details:", err);
      } finally {
        setIsFetchingPincode(false);
      }
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
  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newAttachments = await Promise.all(
      files.map(async (file) => {
        const base64Url = await fileToBase64(file);
        const resolvedType = type || (file.type.startsWith("image") ? "image" : file.type.startsWith("audio") ? "audio" : file.type.startsWith("video") ? "video" : "document");
        return {
          id: Date.now() + Math.random(),
          file,
          type: resolvedType,
          name: file.name,
          size: file.size,
          url: base64Url || URL.createObjectURL(file)
        };
      })
    );

    setFormData((prev) => ({
      ...prev,
      remarkAttachments: [...prev.remarkAttachments, ...newAttachments]
    }));

    // Reset file input
    e.target.value = '';
    setShowUploadOptions(false);
  };

  // Remove Attachment
  const removeAttachment = (id) => {
    setFormData((prev) => ({
      ...prev,
      remarkAttachments: prev.remarkAttachments.filter((item) => item.id !== id)
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

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const base64Url = await fileToBase64(blob);
        const file = new File([blob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        
        const newAttachment = {
          id: Date.now() + Math.random(),
          file,
          type: 'audio',
          name: `Audio-${Date.now()}.webm`,
          size: blob.size,
          url: base64Url || URL.createObjectURL(blob)
        };

        setFormData((prev) => ({
          ...prev,
          remarkAttachments: [...prev.remarkAttachments, newAttachment]
        }));

        setAudioURL(base64Url || URL.createObjectURL(blob));
        setIsRecording(false);
        setAudioChunks([]);
        
        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
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
    if (!formData.workCategory) newErrors.workCategory = "Please select work category";

    if (formData.workType.length === 0) {
      newErrors.workType = "Please select at least one work type";
    } else if (formData.workType.includes("Other") && formData.workType.length === 1 && !customWorkType.trim()) {
      newErrors.workType = "Please enter custom work type";
    }

    if (!formData.leadStatus) newErrors.leadStatus = "Please select lead status";

    if (!formData.clientName.trim()) {
      newErrors.clientName = "Client name is required";
    } else if (/[0-9]/.test(formData.clientName)) {
      newErrors.clientName = "Numbers are not allowed in client name";
    }

    // Phone validation (10 digits, starting with 6, 7, 8, or 9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!phoneRegex.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = "Phone number must start with 6, 7, 8, or 9 and be 10 digits";
    }

    if (formData.alternateNumber.trim() && !phoneRegex.test(formData.alternateNumber.trim())) {
      newErrors.alternateNumber = "Alternate number must start with 6, 7, 8, or 9 and be 10 digits";
    }

    // Email validation (optional but if provided should be valid)
    if (formData.emailAddress.trim() && !/\S+@\S+\.\S+/.test(formData.emailAddress.trim())) {
      newErrors.emailAddress = "Please enter a valid email address";
    }

    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "Please select state";

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      setTimeout(() => {
        const targetElement = document.getElementById(`field-${firstErrorKey}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
          const inputEl = targetElement.querySelector("input, select, textarea");
          if (inputEl && typeof inputEl.focus === "function") {
            inputEl.focus();
          }
        }
      }, 100);
      return false;
    }

    return true;
  };

  const compressImageFile = (fileOrBlob, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      if (!(fileOrBlob instanceof Blob)) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result || "");
        img.src = e.target.result;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(fileOrBlob);
    });
  };

  const fileToBase64 = async (fileOrBlobOrUrl) => {
    if (!fileOrBlobOrUrl) return "";
    if (typeof fileOrBlobOrUrl === "string" && fileOrBlobOrUrl.startsWith("data:")) {
      return fileOrBlobOrUrl;
    }
    let target = fileOrBlobOrUrl;
    if (typeof fileOrBlobOrUrl === "string" && fileOrBlobOrUrl.startsWith("blob:")) {
      try {
        const res = await fetch(fileOrBlobOrUrl);
        target = await res.blob();
      } catch (e) {
        return fileOrBlobOrUrl;
      }
    }
    if (target instanceof Blob && target.type?.startsWith("image")) {
      const compressed = await compressImageFile(target);
      if (compressed) return compressed;
    }
    if (!(target instanceof Blob)) {
      return typeof fileOrBlobOrUrl === "string" ? fileOrBlobOrUrl : "";
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(target);
    });
  };

  // Handle Form Submit & Save to LocalStorage
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const processedAttachments = await Promise.all(
      (formData.remarkAttachments || []).map(async (att) => {
        const sourceFile = att.file || att.blob;
        const sourcePreview = att.url || att.preview || "";
        
        let finalUrl = await fileToBase64(sourceFile || sourcePreview);
        if (!finalUrl && sourcePreview) {
          finalUrl = sourcePreview;
        }

        let resolvedType = att.type || "";
        if (!resolvedType && sourceFile && sourceFile.type) {
          resolvedType = sourceFile.type.startsWith("image")
            ? "image"
            : sourceFile.type.startsWith("audio")
            ? "audio"
            : sourceFile.type.startsWith("video")
            ? "video"
            : "document";
        }
        const fileName = att.name || sourceFile?.name || "attachment";
        if (!resolvedType && fileName) {
          if (fileName.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)) resolvedType = "image";
          else if (fileName.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) || fileName.includes("audio")) resolvedType = "audio";
          else if (fileName.match(/\.(mp4|webm|mov|mkv)$/i) || fileName.includes("video")) resolvedType = "video";
          else resolvedType = "document";
        }

        const attId = att.id || Date.now() + Math.random();
        window.__DSS_MEDIA_CACHE = window.__DSS_MEDIA_CACHE || {};
        if (finalUrl) {
          window.__DSS_MEDIA_CACHE[attId] = finalUrl;
          if (fileName) window.__DSS_MEDIA_CACHE[fileName] = finalUrl;
        }

        return {
          id: attId,
          name: fileName,
          type: resolvedType || "image",
          size: att.size || sourceFile?.size || 0,
          url: finalUrl
        };
      })
    );

      const selectedDate = formData.date ? new Date(formData.date) : new Date();
      const today = isNaN(selectedDate.getTime()) ? new Date() : selectedDate;
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const formattedDate = today.toLocaleDateString('en-GB', options);
      const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      let finalWorkType = [...formData.workType];
      if (finalWorkType.includes("Other")) {
        finalWorkType = finalWorkType.filter((t) => t !== "Other");
        if (customWorkType.trim() && !finalWorkType.includes(customWorkType.trim())) {
          finalWorkType.push(customWorkType.trim());
        }
      }
      if (finalWorkType.length === 0) {
        finalWorkType = ["Other"];
      }

      const newLead = {
        id: `LM-${Math.floor(100000 + Math.random() * 900000)}`,
        clientName: formData.clientName,
        concernPersonName: formData.clientName,
        phoneNumber: formData.phoneNumber,
        contact: formData.phoneNumber,
        alternateNumber: formData.alternateNumber,
        alternateNo: formData.alternateNumber,
        emailAddress: formData.emailAddress,
        email: formData.emailAddress,
        status: formData.leadStatus || "Warm",
        leadStatus: formData.leadStatus || "Warm",
        leadLabel: (formData.leadStatus || "Warm").toUpperCase(),
        leadMode: formData.leadMode,
        leadSource: formData.leadMode || "Business networking",
        leadType: formData.leadType || "FRESH",
        workCategory: formData.workCategory || "Design",
        jobType: formData.jobType || "NEW",
        clientType: formData.clientType || "Individual",
        workType: finalWorkType,
        requirement: formData.remark || formData.projectDetail || "New Lead Registration",
        expectedBusiness: formData.expectedBusiness || "0",
        expectedRevenue: formData.expectedBusiness || "0",
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        leadBy: formData.salesPerson || "Sales TL (Current User)",
        salesPerson: formData.salesPerson || "Sales TL (Current User)",
        assignTo: formData.salesPerson || "Sales TL (Current User)",
        address: formData.address,
        siteAddress: formData.address,
        clientDesignation: formData.clientDesignation || "",
        googleLocation: formData.googleLocation || "",
        projectDetail: formData.projectDetail || "",
        projectDetails: formData.projectDetail || "",
        remark: formData.remark || "",
        remarkAttachments: processedAttachments,
        attachments: processedAttachments,
        whatsappNumber: formData.whatsappNumber || formData.phoneNumber,
        createdDate: formattedDate,
        date: formData.date || today.toISOString().split("T")[0],
        createdTime: formattedTime,
        leadAge: "0 Days",
        nextFollowupDate: formattedDate,
        nextFollowupDateRaw: formData.date || today.toISOString().split("T")[0],
        nextFollowupTime: "11:00 am",
        channelType: formData.channel || "Sales",
        followupRemarksCount: 0,
        followupHistory: []
      };

      const safeSaveLocalStorage = (key, dataArray) => {
        try {
          localStorage.setItem(key, JSON.stringify(dataArray));
        } catch (err) {
          console.warn(`Quota exceeded for ${key}, trimming large base64 URLs...`, err);
          try {
            const sanitized = dataArray.map((item) => ({
              ...item,
              remarkAttachments: (item.remarkAttachments || []).map((att) => ({
                ...att,
                url: att.url?.startsWith("data:") ? "" : att.url
              })),
              attachments: (item.attachments || []).map((att) => ({
                ...att,
                url: att.url?.startsWith("data:") ? "" : att.url
              }))
            }));
            localStorage.setItem(key, JSON.stringify(sanitized));
          } catch (e) {
            console.error(`Failed to save to ${key}:`, e);
          }
        }
      };

      try {
        // Save lead to backend MongoDB Atlas Database with all form fields & attachments
        const apiRes = await createLeadApi(newLead);
        if (apiRes && apiRes.success && apiRes.data && apiRes.data._id) {
          newLead.id = apiRes.data._id;
          newLead._id = apiRes.data._id;
        }

        // 1. Save to dss_leads (Used by Total Leads Directory)
        const savedTotal = localStorage.getItem("dss_leads");
        const currentTotalLeads = savedTotal ? JSON.parse(savedTotal) : initialTotalLeads;
        const updatedTotalLeads = [newLead, ...currentTotalLeads];
        safeSaveLocalStorage("dss_leads", updatedTotalLeads);

        // 2. Save to dss_lead_management_sheet_v1 (Used by Lead Sheet)
        const savedSheet = localStorage.getItem("dss_lead_management_sheet_v1");
        const currentSheetLeads = savedSheet ? JSON.parse(savedSheet) : [];
        const updatedSheetLeads = [newLead, ...currentSheetLeads];
        safeSaveLocalStorage("dss_lead_management_sheet_v1", updatedSheetLeads);

        // 3. Save to dss_assigned_leads (Used by Assigned Leads)
        const savedAssigned = localStorage.getItem("dss_assigned_leads");
        const currentAssignedLeads = savedAssigned ? JSON.parse(savedAssigned) : [];
        const updatedAssignedLeads = [newLead, ...currentAssignedLeads];
        safeSaveLocalStorage("dss_assigned_leads", updatedAssignedLeads);

        // 4. Save to dss_scheduled_leads_sheet (Used by Followup Directory)
        const savedScheduled = localStorage.getItem("dss_scheduled_leads_sheet");
        const currentScheduledLeads = savedScheduled ? JSON.parse(savedScheduled) : [];
        const updatedScheduledLeads = [newLead, ...currentScheduledLeads];
        safeSaveLocalStorage("dss_scheduled_leads_sheet", updatedScheduledLeads);
      } catch (err) {
        console.error("Failed to save lead to localStorage", err);
      }

      setIsSubmitting(false);
      toast.success("Lead Captured Successfully! 🎯", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/sales/leads/total");
  };

  // Reset Form
  const handleReset = () => {
    setFormData(initialFormState);
    setCustomWorkType("");
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
        
        {/* ROW 1: Lead Mode | Lead Type | Work Category */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3">
          <div id="field-leadMode">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Mode <span className="text-red-500">*</span>
            </label>
            <select
              name="leadMode"
              value={formData.leadMode}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.leadMode ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            >
              <option value="">Select Lead Mode</option>
              {leadModeList.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
            {errors.leadMode && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadMode}</p>}
          </div>

          <div id="field-leadType">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Type <span className="text-red-500">*</span>
            </label>
            <select
              name="leadType"
              value={formData.leadType}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.leadType ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            >
              <option value="FRESH">Fresh</option>
              <option value="REPEAT">Repeat</option>
            </select>
            {errors.leadType && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadType}</p>}
          </div>

          <div id="field-workCategory">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Work Category <span className="text-red-500">*</span>
            </label>
            <select
              name="workCategory"
              value={formData.workCategory}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.workCategory ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            >
              <option value="">Select Work Category</option>
              {workCategoryList.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.workCategory && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.workCategory}</p>}
          </div>
        </div>

        {/* ROW 2: Work Type (Full Width - Multi-select Pills) */}
        <div id="field-workType" className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1">
            Work Type <span className="text-red-500">*</span> <span className="text-slate-500 font-normal">(Select all that apply)</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
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

            {/* Custom Work Types added dynamically */}
            {formData.workType
              .filter((t) => !workTypeOptions.includes(t))
              .map((customType) => (
                <button
                  key={customType}
                  type="button"
                  onClick={() => toggleWorkType(customType)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-600 text-white shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{customType}</span>
                  <span>✓</span>
                </button>
              ))}

            {/* Inline Custom Input Box when Other is selected */}
            {formData.workType.includes("Other") && (
              <div className="inline-flex items-center gap-1 my-0.5">
                <input
                  type="text"
                  placeholder="Type custom work type..."
                  value={customWorkType}
                  onChange={(e) => {
                    setCustomWorkType(e.target.value);
                    if (errors.workType) setErrors((prev) => ({ ...prev, workType: "" }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomWorkType();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg border bg-white text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 transition-all w-48 placeholder:text-slate-400 ${
                    errors.workType ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomWorkType}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  + Add
                </button>
              </div>
            )}
          </div>
          {errors.workType && <p className="text-xs text-red-500 font-medium mt-1">{errors.workType}</p>}
        </div>

        {/* ROW 3: Lead Status | Client Name | Phone Number */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3 pt-1">
          <div id="field-leadStatus">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Lead Status <span className="text-red-500">*</span>
            </label>
            <select
              name="leadStatus"
              value={formData.leadStatus}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.leadStatus ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            >
              <option value="">Select Lead Status</option>
              {leadStatusList.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            {errors.leadStatus && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.leadStatus}</p>}
          </div>

          <div id="field-clientName">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientName"
              placeholder="Enter Client Name"
              value={formData.clientName}
              onChange={(e) => {
                const val = e.target.value.replace(/[0-9]/g, "");
                handleChange({ target: { name: "clientName", value: val } });
              }}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.clientName ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.clientName && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.clientName}</p>}
          </div>

          <div id="field-phoneNumber">
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
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.phoneNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.phoneNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.phoneNumber}</p>}
          </div>
        </div>

        {/* ROW 4: Alternate Number | Email Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3 pt-1">
          <div id="field-alternateNumber">
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
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.alternateNumber ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.alternateNumber && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.alternateNumber}</p>}
          </div>

          <div id="field-emailAddress">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              Email Address
            </label>
            <input
              type="email"
              name="emailAddress"
              placeholder="Enter Email Address"
              value={formData.emailAddress}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.emailAddress ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.emailAddress && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.emailAddress}</p>}
          </div>
          <div></div>
        </div>

        {/* ROW 5: Address (Full Width) */}
        <div id="field-address" className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            name="address"
            placeholder="Enter Address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 resize-y ${
              errors.address ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
            }`}
          />
          {errors.address && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.address}</p>}
        </div>

        {/* ROW 6: Pincode | City | State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2.5 sm:gap-x-3 gap-y-3 pt-1">
          <div id="field-pincode">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5 flex items-center justify-between">
              <span>Pincode <span className="text-red-500">*</span></span>
              {isFetchingPincode && <span className="text-xs text-blue-600 animate-pulse font-normal">Fetching City/State...</span>}
            </label>
            <input
              type="text"
              name="pincode"
              maxLength={6}
              placeholder="Enter 6-digit Pincode"
              value={formData.pincode}
              onChange={handlePincodeChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.pincode ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.pincode && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.pincode}</p>}
          </div>

          <div id="field-city">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              placeholder="Enter City"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all placeholder:text-slate-400 ${
                errors.city ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
              }`}
            />
            {errors.city && <p className="text-xs text-red-500 font-medium mt-0.5">{errors.city}</p>}
          </div>

          <div id="field-state">
            <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
              State <span className="text-red-500">*</span>
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 rounded-lg border bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 transition-all cursor-pointer ${
                errors.state ? "border-red-500 bg-red-50/20 text-red-900 focus:border-red-500" : "border-black/20 focus:border-black/50"
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

        {/* ROW 7: Expected Business Amount | Lead Date */}
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
          <div></div>
        </div>

        {/* ROW 8: Project Detail (Full Width Textarea) */}
        <div className="pt-1">
          <label className="block text-xs sm:text-sm font-semibold text-slate-800 mb-0.5">
            Project Detail
          </label>
          <textarea
            rows={3}
            name="projectDetail"
            placeholder="Enter Project Detail"
            value={formData.projectDetail}
            onChange={handleChange}
            className="w-full px-3 py-1.5 rounded-lg border border-black/20 bg-white text-slate-800 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 focus:border-black/50 transition-all placeholder:text-slate-400 resize-y"
          />
        </div>

        {/* ROW 9: Remark with CommentWithMedia Component */}
        <div className="pt-1">
          <CommentWithMedia
            title="Remark / Comments"
            placeholder="Write your remark or comment..."
            value={formData.remark}
            onChange={(val) => setFormData((prev) => ({ ...prev, remark: val }))}
            files={formData.remarkAttachments}
            onFilesChange={(newFiles) => setFormData((prev) => ({ ...prev, remarkAttachments: newFiles }))}
          />
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

    </div>
  );
};

export default Addlead;