import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import { initialLeadsData } from "../../data/leadManagementData";

/**
 * Component: Lead (Lead Management Sheet)
 * Design matching the DSS CRM Lead Management Sheet screenshot with rich colorful styling & larger text.
 */

// Helper to format currency
const formatLakhs = (val) => {
  const num = Number(val) || 0;
  return `₹${(num / 100000).toFixed(2)}L`;
};

const teamMembers = [
  "Sales TL",
  "John (Sales TL)",
  "Sanjay Srivastava",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra" 
];

const timeOptions = [
  "09:00 am", "09:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am",
  "12:00 pm", "12:30 pm", "02:00 pm", "02:30 pm", "03:00 pm", "03:30 pm",
  "04:00 pm", "04:30 pm", "05:00 pm", "05:30 pm", "06:00 pm"
];

const Lead = () => {
  // Leads state with localStorage cache
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem("dss_lead_management_sheet_v1");
      return saved ? JSON.parse(saved) : initialLeadsData;
    } catch {
      return initialLeadsData;
    }
  });

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(newLeads));
    } catch (e) {
      console.error(e);
    }
  };

  // Filters & Collapsible Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterLeadType, setFilterLeadType] = useState("All");
  const [filterJobType, setFilterJobType] = useState("All");
  const [filterLeadLabel, setFilterLeadLabel] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Table Column Configuration for common Table component matching exact screenshot design
  const columnConfig = useMemo(() => ({
    actions: {
      label: "ACTIONS",
      render: (val, row) => {
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "";
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* Orange Square Eye Button matching screenshot */}
            <button
              type="button"
              onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
              className="w-7 h-7 rounded-lg border border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="View Lead Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Green Phone Call Icon */}
            <a
              href={phone ? `tel:${phone}` : "#"}
              className={`w-7 h-7 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs ${!phone && "opacity-40 pointer-events-none"}`}
              title={phone ? `Call ${phone}` : "No phone available"}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
          </div>
        );
      }
    },
    createdDate: {
      label: "CREATED DATE",
      render: (val, row) => (
        <span className="text-slate-700 text-xs font-sans font-medium">
          {val || row.createdDate || row.date || "18/7/2026, 12:45:35 pm"}
          {row.createdTime && `, ${row.createdTime}`}
        </span>
      )
    },
    leadAge: {
      label: "LEAD AGE",
      render: (val, row) => (
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-bold italic text-xs border border-blue-200 inline-block">
          {val || row.leadAge || "33 Days"}
        </span>
      )
    },
    status: {
      label: "STATUS",
      render: (val, row) => {
        const s = (val || row.status || row.leadStatus || "").toString().toUpperCase();
        const isNew = s === "NEW" || s === "FRESH" || row.jobType === "NEW" || (row.leadType && row.leadType.toUpperCase() === "FRESH");
        const displayStatus = isNew ? "NEW" : "OLD";

        return (
          <span
            className={`px-3 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
              displayStatus === "NEW"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            {displayStatus}
          </span>
        );
      }
    },
    concernPersonName: {
      label: "CONCERN PERSON NAME",
      render: (val, row) => (
        <div className="text-left font-medium text-slate-800 text-xs">
          {row.concernPersonName || row.clientName || "--"}
        </div>
      )
    },
    phoneNumber: {
      label: "PHONE",
      render: (val, row) => {
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        return (
          <div className="text-left font-sans text-slate-800 text-xs font-medium">
            {phone}
          </div>
        );
      }
    },
    email: {
      label: "EMAIL",
      render: (val, row) => (
        <span className="text-xs font-mono text-slate-600">
          {val || row.emailAddress || row.email || "--"}
        </span>
      )
    },
    leadType: {
      label: "LEAD TYPE",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {val || row.leadType || "FRESH"}
        </span>
      )
    },
    jobType: {
      label: "JOB TYPE",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
          {val || row.jobType || "NEW"}
        </span>
      )
    },
    leadLabel: {
      label: "LEAD LABEL",
      render: (val, row) => {
        const lbl = (val || row.leadLabel || row.leadStatus || "WARM").toUpperCase();
        const colors = {
          HOT: "bg-rose-100 text-rose-800 border-rose-200",
          WARM: "bg-amber-100 text-amber-800 border-amber-200",
          COLD: "bg-sky-100 text-sky-800 border-sky-200",
          NEW: "bg-purple-100 text-purple-800 border-purple-200"
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${colors[lbl] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {lbl}
          </span>
        );
      }
    },
    leadSource: {
      label: "LEAD SOURCE",
      render: (val, row) => (
        <span className="text-xs font-bold text-slate-700 uppercase">
          {val || row.leadSource || row.leadMode || "WEBSITE"}
        </span>
      )
    },
    requirement: {
      label: "REQUIREMENTS",
      render: (val, row) => (
        <div className="max-w-[200px] truncate text-xs text-slate-700 font-medium" title={val || row.requirement || row.projectDetails}>
          {val || row.requirement || row.projectDetails || "--"}
        </div>
      )
    },
    addressPincode: {
      label: "ADDRESS & PIN CODE",
      render: (val, row) => (
        <div className="text-left text-xs max-w-[180px]">
          <div className="truncate text-slate-800 font-medium" title={row.address || row.siteAddress || row.city}>
            {row.address || row.siteAddress || row.city || "--"}
          </div>
          {row.pincode && (
            <div className="text-[11px] font-mono text-slate-500 font-bold">
              PIN: {row.pincode}
            </div>
          )}
        </div>
      )
    },
    assignTo: {
      label: "ASSIGN PERSON",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
          {val || row.assignTo || row.salesPerson || "--"}
        </span>
      )
    },
    priority: {
      label: "PRIORITY",
      render: (val, row) => {
        const p = (val || row.priority || (row.leadLabel === "HOT" || row.leadStatus === "Hot" ? "HIGH" : row.leadLabel === "WARM" || row.leadStatus === "Warm" ? "MEDIUM" : "LOW")).toUpperCase();
        const badges = {
          HIGH: "bg-red-50 text-red-700 border-red-200",
          MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
          LOW: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${badges[p] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {p === "HIGH" ? "🔴 High" : p === "MEDIUM" ? "🟡 Medium" : "🟢 Low"}
          </span>
        );
      }
    }
  }), []);

  // Modals
  const [detailModalLead, setDetailModalLead] = useState(null);
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [remarksModalLead, setRemarksModalLead] = useState(null);
  const [completeModalLead, setCompleteModalLead] = useState(null);

  // Media Attachments and Audio Recording State
  const [attachments, setAttachments] = useState({
    current: [],
    next: [],
    remarks: []
  });
  const [recordingState, setRecordingState] = useState({
    current: false,
    next: false,
    remarks: false
  });

  const fileInputRef = useRef(null);
  const activeUploadSectionRef = useRef("current");
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const triggerFileUpload = (section) => {
    activeUploadSectionRef.current = section;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const section = activeUploadSectionRef.current;
    const newItems = files.map((file) => ({
      name: file.name,
      type: file.type.startsWith("image") ? "image" : file.type.startsWith("audio") ? "audio" : file.type.startsWith("video") ? "video" : "file",
      url: URL.createObjectURL(file)
    }));

    setAttachments((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), ...newItems]
    }));
    e.target.value = "";
  };

  const removeAttachment = (section, index) => {
    setAttachments((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const toggleVoiceRecording = async (section) => {
    if (recordingState[section]) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setRecordingState((prev) => ({ ...prev, [section]: false }));
    } else {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (ev) => {
            if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
          };

          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            const audioUrl = URL.createObjectURL(audioBlob);
            const voiceNote = {
              name: `Voice Note (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
              type: "audio",
              url: audioUrl
            };
            setAttachments((prev) => ({
              ...prev,
              [section]: [...(prev[section] || []), voiceNote]
            }));
            stream.getTracks().forEach((t) => t.stop());
          };

          mediaRecorderRef.current.start();
          setRecordingState((prev) => ({ ...prev, [section]: true }));
        } else {
          throw new Error("No mediaDevices");
        }
      } catch (err) {
        const voiceNote = {
          name: `Voice Note (${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})`,
          type: "audio",
          url: ""
        };
        setAttachments((prev) => ({
          ...prev,
          [section]: [...(prev[section] || []), voiceNote]
        }));
      }
    }
  };

  // Schedule Form State
  const [scheduleFormData, setScheduleFormData] = useState({
    type: "Call",
    date: "",
    time: "10:00 am",
    assignedTo: "Sales TL",
    talkToPerson: "",
    personDesignation: "",
    notes: "",
    nextDiscussionTopic: "",
    clientRating: "4",
    revenue: "LOW",
    satisfaction: "LOW",
    repeatPotential: "LOW",
    complexity: "LOW",
    engagement: "HIGH",
    positiveAttitude: "LOW",
    followupRemarks: "",
    reminder: true,
    reminderHours: 24
  });
  const [scheduleFormErrors, setScheduleFormErrors] = useState({});

  // 1. KPI Aggregations
  const stats = useMemo(() => {
    const total = leads.length;
    const fresh = leads.filter((l) => (l.leadType || "").toUpperCase() === "FRESH").length;
    const converted = leads.filter((l) => (l.status || "").toUpperCase() === "CONVERTED").length;
    const interested = leads.filter((l) => (l.status || "").toUpperCase().includes("INTERESTED")).length;
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    
    // Revenue calculations
    const totalRevenue = leads
      .filter((l) => (l.status || "").toUpperCase() === "CONVERTED")
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);
    
    const expectedRevenue = leads
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);

    const totalIncentives = totalRevenue * 0.02; // 2% incentive
    const expectedIncentives = expectedRevenue * 0.02;

    return {
      total,
      fresh,
      converted,
      interested,
      conversionRate: `${conversionRate}%`,
      totalRevenue: formatLakhs(totalRevenue),
      expectedRevenue: formatLakhs(expectedRevenue),
      totalIncentives: formatLakhs(totalIncentives),
      expectedIncentives: formatLakhs(expectedIncentives)
    };
  }, [leads]);

  // 2. Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterStatus !== "All" && lead.status !== filterStatus) return false;
      if (filterLeadType !== "All" && lead.leadType !== filterLeadType) return false;
      if (filterJobType !== "All" && lead.jobType !== filterJobType) return false;
      if (filterLeadLabel !== "All" && lead.leadLabel !== filterLeadLabel) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          (lead.concernPersonName || "").toLowerCase().includes(q) ||
          (lead.phoneNumber || "").includes(q) ||
          (lead.emailAddress || "").toLowerCase().includes(q) ||
          (lead.requirement || "").toLowerCase().includes(q) ||
          (lead.leadSource || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [leads, filterStatus, filterLeadType, filterJobType, filterLeadLabel, searchTerm]);

  // 3. Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;

  // Status Badge Class
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("INTERESTED")) return "text-emerald-700 bg-emerald-50 border border-emerald-300";
    if (s.includes("CONVERTED")) return "text-blue-700 bg-blue-50 border border-blue-300";
    if (s.includes("LOST")) return "text-rose-700 bg-rose-50 border border-rose-300";
    return "text-slate-700 bg-slate-100 border border-slate-300";
  };

  // Lead Label Badge Class
  const getLeadLabelBadgeClass = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "HOT") return "text-rose-700 bg-rose-50 border border-rose-200";
    if (l === "WARM") return "text-amber-700 bg-amber-50 border border-amber-200";
    if (l === "COLD") return "text-sky-700 bg-sky-50 border border-sky-200";
    return "text-purple-700 bg-purple-50 border border-purple-200";
  };

  // Open Schedule Modal
  const handleOpenScheduleModal = (lead) => {
    setScheduleModalLead(lead);
    setAttachments({ current: [], next: [], remarks: [] });
    setRecordingState({ current: false, next: false, remarks: false });
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = tmr.toISOString().split("T")[0];

    setScheduleFormData({
      type: "Call",
      date: lead.nextFollowupDateRaw || tmrStr,
      time: lead.nextFollowupTime !== "--" ? lead.nextFollowupTime : "10:00 am",
      assignedTo: lead.assignTo !== "--" ? lead.assignTo : "Sales TL",
      talkToPerson: lead.concernPersonName || "",
      personDesignation: lead.clientDesignation || "",
      notes: "",
      nextDiscussionTopic: "",
      clientRating: lead.clientRating || "4",
      revenue: "LOW",
      satisfaction: "LOW",
      repeatPotential: "LOW",
      complexity: "LOW",
      engagement: "HIGH",
      positiveAttitude: "LOW",
      followupRemarks: "",
      reminder: true,
      reminderHours: 24
    });
    setScheduleFormErrors({});
  };

  // Submit Schedule Form
  const handleSaveSchedule = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!scheduleModalLead) return;

    const activeNotes = scheduleFormData.notes || scheduleFormData.nextDiscussionTopic || "Follow-up scheduled";

    let formattedDisplayDate = scheduleFormData.date;
    if (scheduleFormData.date && scheduleFormData.date.includes("-")) {
      const [year, month, day] = scheduleFormData.date.split("-");
      formattedDisplayDate = `${day} ${new Date(year, month - 1, day).toLocaleString("en-IN", { month: "short" })} ${year}`;
    }

    const newHistoryEntry = {
      date: formattedDisplayDate,
      time: scheduleFormData.time || "10:00 am",
      notes: activeNotes,
      rep: scheduleFormData.assignedTo || "Sales TL",
      status: scheduleFormData.type || "Scheduled"
    };

    const updated = leads.map((item) => {
      if (item.id === scheduleModalLead.id) {
        const prevHist = item.followupHistory || [];
        return {
          ...item,
          nextFollowupDate: formattedDisplayDate,
          nextFollowupDateRaw: scheduleFormData.date,
          nextFollowupTime: scheduleFormData.time || "10:00 am",
          channelType: scheduleFormData.type || "Call",
          clientRating: scheduleFormData.clientRating,
          followupRemarksCount: prevHist.length + 1,
          followupHistory: [newHistoryEntry, ...prevHist],
          assignTo: scheduleFormData.assignedTo
        };
      }
      return item;
    });

    saveLeads(updated);
    setScheduleModalLead(null);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterLeadType("All");
    setFilterJobType("All");
    setFilterLeadLabel("All");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5 font-sans pb-16 w-full min-h-screen bg-[#F8FAFC]">
      
      {/* ================= 1. SUB-HEADER BANNER ================= */}
      <PageHeader
        title="Lead Management Sheet"
        badge="Master Sheet"
        badgeColor="bg-emerald-100 text-emerald-800 border-emerald-300"
        description="Complete overview of all leads, conversion metrics, expected revenue, and customer interactions."
        showBackButton={true}
        rightActions={
          <Link
            to="/sales/leads/add"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>+</span> Add Lead
          </Link>
        }
      />

      {/* ================= 2. TOP 9 COLORFUL KPI STAT CARDS (Exact Screenshot Match) ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        
        {/* 1. Total Leads (Pastel Purple/Pink) */}
        <div className="p-3.5 rounded-2xl bg-[#FDF2F8] border border-pink-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-base">📊</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.total}</span>
          </div>
          <span className="text-[11px] font-bold text-pink-900 mt-2">Total Leads</span>
        </div>

        {/* 2. Fresh Leads (Pastel Blue) */}
        <div className="p-3.5 rounded-2xl bg-[#EFF6FF] border border-blue-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-base">👤+</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.fresh}</span>
          </div>
          <span className="text-[11px] font-bold text-blue-900 mt-2">Fresh Leads</span>
        </div>

        {/* 3. Converted Leads (Pastel Mint Green) */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 text-base">📈</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.converted}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 mt-2">Converted Leads</span>
        </div>

        {/* 4. Interested Leads (Pastel Yellow) */}
        <div className="p-3.5 rounded-2xl bg-[#FEFCE8] border border-yellow-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-base">👍</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{stats.interested}</span>
          </div>
          <span className="text-[11px] font-bold text-yellow-900 mt-2">Interested Leads</span>
        </div>

        {/* 5. Conversion Rate (Pastel Amber) */}
        <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-amber-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-base">↗️</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono">{stats.conversionRate}</span>
          </div>
          <span className="text-[11px] font-bold text-amber-900 mt-2">Conversion Rate</span>
        </div>

        {/* 6. Total Revenue (Pastel Emerald) */}
        <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-emerald-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-emerald-800 font-mono truncate">{stats.totalRevenue}</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 mt-2">Total Revenue</span>
        </div>

        {/* 7. Expected Revenue (Pastel Rose) */}
        <div className="p-3.5 rounded-2xl bg-[#FFF1F2] border border-rose-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-rose-800 font-mono truncate">{stats.expectedRevenue}</span>
          </div>
          <span className="text-[11px] font-bold text-rose-900 mt-2">Expected Revenue</span>
        </div>

        {/* 8. Total Incentives (Pastel Teal) */}
        <div className="p-3.5 rounded-2xl bg-[#F0FDFA] border border-teal-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-teal-800 font-mono truncate">{stats.totalIncentives}</span>
          </div>
          <span className="text-[11px] font-bold text-teal-900 mt-2">Total Incentives</span>
        </div>

        {/* 9. Expect. Incentive (Pastel Lavender) */}
        <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-purple-200/80 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">₹</span>
            <span className="text-base sm:text-lg font-black text-purple-800 font-mono truncate">{stats.expectedIncentives}</span>
          </div>
          <span className="text-[11px] font-bold text-purple-900 mt-2">Expect. Incentive</span>
        </div>

      </div>

      {/* ================= 3. COLLAPSIBLE FILTER TOGGLE BAR ================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs sm:text-sm font-semibold text-slate-600 text-center sm:text-left">
          Showing <strong className="font-bold text-slate-900">{filteredLeads.length}</strong> of <strong className="font-bold text-slate-900">{leads.length}</strong> Leads
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{showFilters ? "Hide Filter Options ✕" : "Filter Options 🔍"}</span>
        </button>
      </div>

      {/* COLLAPSIBLE FILTER PANEL (Opens on click) */}
      {showFilters && (
        <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-3.5">
            {/* Rows Per Page Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-600">Show:</span>
              <div className="relative w-20">
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="w-full appearance-none px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Real-time Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search Client Name, Phone, Requirement..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-black transition-all placeholder:text-slate-400 font-medium shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black text-xs cursor-pointer font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
              >
                <option value="All">All Status</option>
                <option value="INTERESTED">Interested</option>
                <option value="CONVERTED">Converted</option>
                <option value="LOST">Lost</option>
              </select>

              <select
                value={filterLeadType}
                onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
              >
                <option value="All">All Lead Types</option>
                <option value="FRESH">Fresh</option>
                <option value="REPEAT">Repeat</option>
                <option value="RENEWAL">Renewal</option>
              </select>

              <select
                value={filterJobType}
                onChange={(e) => { setFilterJobType(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 cursor-pointer shadow-2xs hover:border-slate-300"
              >
                <option value="All">All Job Types</option>
                <option value="NEW">New</option>
                <option value="EXISTING">Existing</option>
              </select>

              <button
                type="button"
                onClick={handleResetFilters}
                className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white cursor-pointer shadow-xs transition-colors"
                title="Reset Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. REUSABLE COMMON TABLE COMPONENT ================= */}
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ================= MODAL 1: SCHEDULE FOLLOW-UP MODAL ================= */}
      {scheduleModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-6 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {scheduleModalLead.concernPersonName}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500">
                    {scheduleModalLead.phoneNumber}
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: [Save] & [✕] */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleModalLead(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm cursor-pointer transition-colors"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Hidden File Input for Image/Audio/Video upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              multiple
              className="hidden"
            />

            {/* Modal Body Form */}
            <form onSubmit={handleSaveSchedule} className="p-5 sm:p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              
              {/* Row 1: SELECT TYPE & SCHEDULE DATE & TIME (OPTIONAL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    SELECT TYPE *
                  </label>
                  <select
                    value={scheduleFormData.type || "Call"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="Site Visit">Site Visit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    SCHEDULE DATE & TIME (OPTIONAL)
                  </label>
                  <input
                    type="date"
                    value={scheduleFormData.date}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                    placeholder="Select date and time (optional)"
                  />
                </div>
              </div>

              {/* Row 2: TALK TO PERSON NAME & PERSON DESIGNATION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    TALK TO PERSON NAME
                  </label>
                  <input
                    type="text"
                    placeholder="Who did you speak with?"
                    value={scheduleFormData.talkToPerson || ""}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, talkToPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    PERSON DESIGNATION
                  </label>
                  <input
                    type="text"
                    placeholder="Contact person's designation"
                    value={scheduleFormData.personDesignation || ""}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, personDesignation: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Row 3: CURRENT DISCUSSION & NEXT DISCUSSION TOPIC (SPEECH CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    CURRENT DISCUSSION
                  </label>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative flex flex-col justify-between min-h-[120px] focus-within:bg-white focus-within:border-blue-400 transition-all shadow-2xs">
                    <textarea
                      rows={3}
                      placeholder="Enter current discussion or record..."
                      value={scheduleFormData.notes || ""}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, notes: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                    />

                    {/* Attachments Display */}
                    {attachments.current && attachments.current.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200/60">
                        {attachments.current.map((att, i) => (
                          <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                            <span>{att.type === "image" ? "📷" : att.type === "video" ? "🎥" : "🎵"}</span>
                            <span className="max-w-[100px] truncate">{att.name}</span>
                            {att.url && att.type === "audio" && (
                              <audio src={att.url} controls className="h-6 w-24 text-xs" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeAttachment("current", i)}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {recordingState.current ? (
                        <span className="text-[11px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                          🔴 Recording...
                        </span>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerFileUpload("current")}
                          className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
                          title="Upload Image, Audio or Video"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVoiceRecording("current")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs transition-all cursor-pointer ${
                            recordingState.current ? "bg-red-600 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                          title={recordingState.current ? "Stop Recording" : "Record Voice Note"}
                        >
                          🎙️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                    NEXT DISCUSSION TOPIC
                  </label>
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative flex flex-col justify-between min-h-[120px] focus-within:bg-white focus-within:border-blue-400 transition-all shadow-2xs">
                    <textarea
                      rows={3}
                      placeholder="Enter next topic or record..."
                      value={scheduleFormData.nextDiscussionTopic || ""}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, nextDiscussionTopic: e.target.value })}
                      className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                    />

                    {/* Attachments Display */}
                    {attachments.next && attachments.next.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200/60">
                        {attachments.next.map((att, i) => (
                          <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                            <span>{att.type === "image" ? "📷" : att.type === "video" ? "🎥" : "🎵"}</span>
                            <span className="max-w-[100px] truncate">{att.name}</span>
                            {att.url && att.type === "audio" && (
                              <audio src={att.url} controls className="h-6 w-24 text-xs" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeAttachment("next", i)}
                              className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2 pt-1">
                      {recordingState.next ? (
                        <span className="text-[11px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                          🔴 Recording...
                        </span>
                      ) : (
                        <span />
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => triggerFileUpload("next")}
                          className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
                          title="Upload Image, Audio or Video"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleVoiceRecording("next")}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs transition-all cursor-pointer ${
                            recordingState.next ? "bg-red-600 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                          title={recordingState.next ? "Stop Recording" : "Record Voice Note"}
                        >
                          🎙️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: CLIENT RATING (0-10) & ASSIGNED TO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    CLIENT RATING (0-10)
                  </label>
                  <select
                    value={scheduleFormData.clientRating || "4"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, clientRating: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    ASSIGNED TO
                  </label>
                  <select
                    value={scheduleFormData.assignedTo || "Sales TL"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {teamMembers.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 5 (From Image 2): REVENUE, SATISFACTION, REPEAT POTENTIAL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    REVENUE
                  </label>
                  <select
                    value={scheduleFormData.revenue || "LOW"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, revenue: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    SATISFACTION
                  </label>
                  <select
                    value={scheduleFormData.satisfaction || "LOW"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, satisfaction: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    REPEAT POTENTIAL
                  </label>
                  <select
                    value={scheduleFormData.repeatPotential || "LOW"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, repeatPotential: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              {/* Row 6 (From Image 2): COMPLEXITY, ENGAGEMENT, POSITIVE ATTITUDE */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    COMPLEXITY
                  </label>
                  <select
                    value={scheduleFormData.complexity || "LOW"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, complexity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    ENGAGEMENT
                  </label>
                  <select
                    value={scheduleFormData.engagement || "HIGH"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, engagement: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    POSITIVE ATTITUDE
                  </label>
                  <select
                    value={scheduleFormData.positiveAttitude || "LOW"}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, positiveAttitude: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              {/* Row 7 (From Image 2): FOLLOW-UP REMARKS SPEECH CARD */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  FOLLOW-UP REMARKS
                </label>
                <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 relative flex flex-col justify-between min-h-[120px] focus-within:bg-white focus-within:border-blue-400 transition-all shadow-2xs">
                  <textarea
                    rows={3}
                    placeholder="Enter remarks or record voice note..."
                    value={scheduleFormData.followupRemarks || ""}
                    onChange={(e) => setScheduleFormData({ ...scheduleFormData, followupRemarks: e.target.value })}
                    className="w-full bg-transparent text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                  />

                  {/* Attachments Display */}
                  {attachments.remarks && attachments.remarks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-200/60">
                      {attachments.remarks.map((att, i) => (
                        <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
                          <span>{att.type === "image" ? "📷" : att.type === "video" ? "🎥" : "🎵"}</span>
                          <span className="max-w-[100px] truncate">{att.name}</span>
                          {att.url && att.type === "audio" && (
                            <audio src={att.url} controls className="h-6 w-24 text-xs" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeAttachment("remarks", i)}
                            className="text-slate-400 hover:text-red-500 font-bold ml-1 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-1">
                    {recordingState.remarks ? (
                      <span className="text-[11px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                        🔴 Recording...
                      </span>
                    ) : (
                      <span />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerFileUpload("remarks")}
                        className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
                        title="Upload Image, Audio or Video"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleVoiceRecording("remarks")}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-xs transition-all cursor-pointer ${
                          recordingState.remarks ? "bg-red-600 text-white animate-pulse" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        }`}
                        title={recordingState.remarks ? "Stop Recording" : "Record Voice Note"}
                      >
                        🎙️
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: DISCUSSION LOGS / REMARKS HISTORY MODAL ================= */}
      {remarksModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Discussion Logs
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Client: <strong className="text-slate-800">{remarksModalLead.concernPersonName}</strong> ({remarksModalLead.phoneNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemarksModalLead(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Timeline Body */}
            <div className="p-5 sm:p-6 max-h-[65vh] overflow-y-auto space-y-6">
              {remarksModalLead.followupHistory && remarksModalLead.followupHistory.length > 0 ? (
                remarksModalLead.followupHistory.map((hist, idx) => {
                  const isLast = idx === remarksModalLead.followupHistory.length - 1;
                  return (
                    <div key={idx} className="relative flex gap-4">
                      {/* Left Timeline Avatar & Connecting Vertical Line */}
                      <div className="flex flex-col items-center shrink-0">
                        <div className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-2xs z-10">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        {!isLast && (
                          <div className="w-0.5 bg-slate-200 flex-1 my-1" />
                        )}
                      </div>

                      {/* Right Log Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            REPRESENTATIVE NAME
                          </span>
                          <span className="text-xs text-slate-500 font-medium">
                            Commented {hist.date ? hist.date : "recently"}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 mt-0.5">
                          {hist.rep || "Sales"}
                        </h3>

                        {/* Status Change Tag */}
                        <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/80">
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 12h10M7 17h10" />
                            </svg>
                            <span>{hist.status || "Status Change"}</span>
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {hist.date} at {hist.time}
                          </span>
                        </div>

                        {/* Speech Bubble / Remarks Card */}
                        <div className="mt-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 shadow-2xs relative space-y-1">
                          <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>REMARKS</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 italic">
                            "{hist.notes}"
                          </p>
                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium text-sm">
                  No discussion logs or follow-up remarks recorded yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
              <button
                type="button"
                onClick={() => {
                  const l = remarksModalLead;
                  setRemarksModalLead(null);
                  handleOpenScheduleModal(l);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                + Schedule Next
              </button>
              <button
                type="button"
                onClick={() => setRemarksModalLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 3: LEAD DETAIL MODAL ================= */}
      {detailModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-300 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{detailModalLead.concernPersonName}</h3>
                <p className="text-xs text-slate-300">Lead ID: {detailModalLead.id} • {detailModalLead.leadSource}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLead(null)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">{detailModalLead.phoneNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Email</span>
                  <div className="font-medium text-slate-900 mt-0.5 truncate">{detailModalLead.emailAddress}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Expected Business</span>
                  <div className="font-bold text-emerald-600 mt-0.5">₹{Number(detailModalLead.expectedBusiness).toLocaleString("en-IN")}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pincode & Address</span>
                  <div className="font-medium text-slate-900 mt-0.5">{detailModalLead.pincode} • {detailModalLead.address}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Requirement:</span>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                  {detailModalLead.requirement}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const l = detailModalLead;
                    setDetailModalLead(null);
                    handleOpenScheduleModal(l);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  + Schedule Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModalLead(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL 4: COMPLETE ACTIVITY MODAL ================= */}
      {completeModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mark Lead as Converted</h3>
            <p className="text-slate-600 mb-4">
              Mark deal converted for <span className="font-bold text-slate-800">{completeModalLead.concernPersonName}</span>?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCompleteModalLead(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = leads.map((l) =>
                    l.id === completeModalLead.id ? { ...l, status: "CONVERTED" } : l
                  );
                  saveLeads(updated);
                  setCompleteModalLead(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                Confirm Converted
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Lead;