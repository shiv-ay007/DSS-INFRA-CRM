import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import ScopeTabs from "../../../../Common/Components/ScopeTabs";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { FaFilter, FaSearch, FaUserPlus, FaUser } from "react-icons/fa";
import { availableWorkTypes, workCategoryList, leadTypesList } from "../../data/addLeadData";
import {
  getOffsetDateString,
  teamMembers,
  timeOptions,
  leadTypeOptions,
  leadSourceOptions,
  leadStatusOptions,
  leadLabelOptions,
  timeRangeOptions,
  initialScheduledLeads
} from "../../data/followUpData";

import { subscribeToLeadUpdates, updateLeadInStorage } from "../../utils/leadStorageUtils";
import { addFollowupApi } from "../../../../services/api";

const leadModesList = [
  "ALL",
  "Business networking",
  "By freelancer",
  "By sales Team",
  "Customer to customer"
];

const notInterestedReasonsList = [
  "High Price / Budget Out",
  "Already Purchased / Competitor Chosen",
  "Location / Distance Issue",
  "Requirements Mismatch / Not Feasible",
  "Other"
];

const Follow = () => {
  const navigate = useNavigate();

  const loadLeadsData = React.useCallback(() => {
    try {
      const savedScheduled = localStorage.getItem("dss_scheduled_leads_sheet");
      const savedMgmt = localStorage.getItem("dss_lead_management_sheet_v1");

      const scheduledLeads = savedScheduled ? JSON.parse(savedScheduled) : [];
      const mgmtLeads = savedMgmt ? JSON.parse(savedMgmt) : [];

      const mergedMap = new Map();

      if (Array.isArray(mgmtLeads)) {
        mgmtLeads.forEach((l) => {
          if (l.nextFollowupDate || (l.followupHistory && l.followupHistory.length > 0)) {
            mergedMap.set(l.id, l);
          }
        });
      }

      if (Array.isArray(scheduledLeads)) {
        scheduledLeads.forEach((l) => {
          mergedMap.set(l.id, l);
        });
      }

      const mergedList = Array.from(mergedMap.values());
      return mergedList.length > 0 ? mergedList : initialScheduledLeads;
    } catch (e) {
      return initialScheduledLeads;
    }
  }, []);

  // State for all scheduled leads
  const [leads, setLeads] = useState(loadLeadsData);

  React.useEffect(() => {
    const handleRefresh = () => {
      setLeads(loadLeadsData());
    };
    const unsubscribe = subscribeToLeadUpdates(handleRefresh);
    return () => unsubscribe();
  }, [loadLeadsData]);

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
    try {
      localStorage.setItem("dss_scheduled_leads_sheet", JSON.stringify(newLeads));

      // Also sync to Lead Management sheet
      const savedMgmt = localStorage.getItem("dss_lead_management_sheet_v1");
      const currentMgmt = savedMgmt ? JSON.parse(savedMgmt) : [];

      const mgmtMap = new Map();
      if (Array.isArray(currentMgmt)) {
        currentMgmt.forEach((item) => mgmtMap.set(item.id, item));
      }

      newLeads.forEach((l) => {
        mgmtMap.set(l.id, l);
      });

      const updatedMgmtList = Array.from(mgmtMap.values());
      localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(updatedMgmtList));
    } catch (e) {}
  };

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [filterScope, setFilterScope] = useState("ALL"); // "ALL", "SELF", "TEAM"
  const [filterExecutive, setFilterExecutive] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLeadMode, setFilterLeadMode] = useState("ALL");
  const [filterLeadType, setFilterLeadType] = useState("ALL");
  const [filterWorkCategory, setFilterWorkCategory] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");

  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLeadMode("ALL");
    setFilterLeadType("ALL");
    setFilterWorkCategory("ALL");
    setFilterWorkType("ALL");
    setFilterStatus("ALL");
    setFilterDateFrom("");
    setFilterScope("ALL");
    setFilterExecutive("ALL");
    setCurrentPage(1);
  };

  // Modals States
  const [scheduleModalLead, setScheduleModalLead] = useState(null); // Opens Wireframe Schedule Modal
  const [remarksModalLead, setRemarksModalLead] = useState(null); // Opens Follow-up Remarks History Modal
  const [detailModalLead, setDetailModalLead] = useState(null); // Opens Lead Detail Modal
  const [completeModalLead, setCompleteModalLead] = useState(null); // Opens Mark Complete Modal

  // Client Status Modal States
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [selectedClientStatus, setSelectedClientStatus] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [customNotInterestedReason, setCustomNotInterestedReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusRemarkAttachments, setStatusRemarkAttachments] = useState([]);

  // Handler to move lead to Lead Management or Lost Leads based on Client Status
  const handleSendToSalesManagement = () => {
    if (!statusModalLead) return;

    if (!selectedClientStatus) {
      toast.error("Please select Client Status (INTERESTED or NOT INTERESTED)!");
      return;
    }

    if (selectedClientStatus === "NOT INTERESTED") {
      if (!notInterestedReason) {
        toast.error("Please select a reason why the client is not interested!");
        return;
      }
      if (notInterestedReason === "Other" && !customNotInterestedReason.trim()) {
        toast.error("Please specify the reason in the text input box!");
        return;
      }
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const finalReason = notInterestedReason === "Other" ? customNotInterestedReason.trim() : notInterestedReason;

    const processedAttachments = (statusRemarkAttachments || []).map((item) => ({
      id: item.id || `att-${Date.now()}-${Math.random()}`,
      name: item.name || item.file?.name || "Attachment",
      type: item.type || "file",
      url: item.preview || item.url || ""
    }));

    const targetPath = selectedClientStatus === "INTERESTED" ? "/sales/leads/all" : "/sales/leads/lost";

    if (selectedClientStatus === "INTERESTED") {
      const leadData = {
        ...statusModalLead,
        leadStatus: "Hot",
        status: "INTERESTED",
        isInterested: true,
        remark: statusRemark || statusModalLead.remark || "",
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        movedToFollowupDate: formattedDate,
        movedToFollowupTime: formattedTime,
        nextFollowupDate: formattedDate,
        nextFollowupTime: "11:00 am"
      };

      try {
        const savedMgmt = localStorage.getItem("dss_lead_management_sheet_v1");
        const currentMgmt = savedMgmt ? JSON.parse(savedMgmt) : [];
        const filteredMgmt = currentMgmt.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify([leadData, ...filteredMgmt]));
      } catch (e) {}

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName} marked as INTERESTED and sent to Lead Management! 🎯`);
    } else if (selectedClientStatus === "NOT INTERESTED") {
      const lostLeadData = {
        ...statusModalLead,
        leadStatus: "Cold",
        status: "NOT INTERESTED",
        isInterested: false,
        lostReason: finalReason,
        remark: statusRemark || statusModalLead.remark || "",
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        lostDate: formattedDate,
        lostTime: formattedTime
      };

      try {
        const savedLost = localStorage.getItem("dss_lost_leads");
        const currentLost = savedLost ? JSON.parse(savedLost) : [];
        const filteredLost = currentLost.filter(l => l.id !== statusModalLead.id);
        localStorage.setItem("dss_lost_leads", JSON.stringify([lostLeadData, ...filteredLost]));
      } catch (e) {}

      // Remove from followup leads
      const filtered = leads.filter(l => l.id !== statusModalLead.id);
      saveLeads(filtered);

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName} marked as NOT INTERESTED (${finalReason}) and moved to Lost Leads! 📌`);
    }

    setStatusModalLead(null);
    setSelectedClientStatus("");
    setNotInterestedReason("");
    setCustomNotInterestedReason("");
    setStatusRemark("");
    setStatusRemarkAttachments([]);

    if (targetPath) {
      navigate(targetPath);
    }
  };

  // Table Column Configuration for common Table component
  const columnConfig = useMemo(() => ({
    srNo: {
      label: "SR. NO.",
      align: "center",
      render: (val, row, idx) => (
        <span className="font-mono font-bold text-slate-700 text-xs">
          {(currentPage - 1) * rowsPerPage + idx + 1}
        </span>
      )
    },
    actions: {
      label: "ACTIONS",
      align: "center",
      render: (val, row) => (
        <div className="grid grid-cols-2 gap-1.5 w-14 mx-auto">
          <button
            type="button"
            onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
            className="w-6 h-6 rounded-lg border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="View Lead Details"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => setRemarksModalLead(row)}
            className="w-6 h-6 rounded-lg border border-purple-400 text-purple-600 hover:bg-purple-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="View Follow-up Remarks & History"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusModalLead(row);
              setSelectedClientStatus("");
              setNotInterestedReason("");
              setCustomNotInterestedReason("");
              setStatusRemark("");
              setStatusRemarkAttachments([]);
            }}
            className="w-6 h-6 rounded-lg border border-emerald-400 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Client Status (Interested / Not Interested)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => handleOpenScheduleModal(row)}
            className="w-6 h-6 rounded-lg border border-blue-400 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
            title="Schedule / Reschedule Follow-up"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      )
    },
    nextFollowup: {
      label: "NEXT FOLLOW-UP",
      align: "center",
      render: (val, row) => {
        const nextDate = row.nextFollowupDate || row.nextFollowup || "--";
        const nextTime = row.nextFollowupTime || "";
        const channel = row.channelType || row.channel || "";

        return (
          <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200/90 shadow-2xs">
            <span className="font-extrabold text-xs text-rose-600 whitespace-nowrap">{nextDate}</span>
            {nextTime && (
              <span className="font-mono text-[10px] font-bold text-slate-600 whitespace-nowrap">{nextTime}</span>
            )}
            {channel && (
              <span className="text-[10px] font-extrabold text-blue-600 whitespace-nowrap">{channel}</span>
            )}
          </div>
        );
      }
    },
    followupRemarks: {
      label: "FOLLOW-UP REMARK",
      render: (val, row) => (
        <button
          type="button"
          onClick={() => setRemarksModalLead(row)}
          className="px-3 py-1 rounded-full bg-blue-50/90 text-blue-600 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer shadow-2xs"
        >
          {row.followupRemarksCount || 1} Follow-up{(row.followupRemarksCount || 1) > 1 ? "s" : ""}
        </button>
      )
    },
    createdDate: {
      label: "CREATED DATE",
      align: "center",
      render: (val, row) => {
        const dateStr = row.createdDate || row.date || "2026-08-18";
        const timeStr = row.createdTime || "11:00 am";
        return (
          <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs">
            <span className="font-extrabold text-xs whitespace-nowrap">{dateStr}</span>
            <span className="font-mono text-[10px] font-bold text-blue-700 whitespace-nowrap">{timeStr}</span>
          </div>
        );
      }
    },
    clientDetails: {
      label: "CLIENT DETAILS",
      align: "center",
      render: (val, row) => {
        const name = row.clientName || row.concernPersonName || "--";
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        const email = row.emailAddress || row.email || "--";

        return (
          <div className="text-xs space-y-0.5 max-w-[160px] mx-auto text-center">
            <div className="mb-0.5">
              <span
                className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs inline-block truncate max-w-full text-xs cursor-pointer hover:text-blue-600"
                title={name}
                onClick={() => setDetailModalLead(row)}
              >
                {name}
              </span>
            </div>
            {phone !== "--" ? (
              <div>
                <a
                  href={`tel:${phone}`}
                  className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  {phone}
                </a>
              </div>
            ) : (
              <div className="text-slate-400">--</div>
            )}
            {email !== "--" ? (
              <div>
                <a
                  href={`mailto:${email}`}
                  className="font-mono text-[11px] text-blue-600 hover:text-blue-800 hover:underline truncate block cursor-pointer"
                  title={email}
                >
                  {email}
                </a>
              </div>
            ) : (
              <div className="text-slate-400 font-mono text-[11px]">--</div>
            )}
          </div>
        );
      }
    },
    leadType: {
      label: "LEAD TYPE",
      render: (val, row) => {
        const type = (row.leadType || val || "FRESH").toUpperCase();
        const isFresh = type === "FRESH";
        return (
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide border shadow-2xs ${
              isFresh
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-blue-600 text-white border-blue-700"
            }`}
          >
            {type}
          </span>
        );
      }
    },
    leadStatus: {
      label: "LEAD STATUS",
      render: (val, row) => {
        const status = (row.leadStatus || row.status || "Warm").toUpperCase();
        const colors = {
          HOT: "bg-rose-100 text-rose-800 border-rose-200",
          WARM: "bg-amber-100 text-amber-800 border-amber-200",
          COLD: "bg-sky-100 text-sky-800 border-sky-200",
          NEW: "bg-emerald-100 text-emerald-800 border-emerald-200"
        };
        return (
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase border ${colors[status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {status}
          </span>
        );
      }
    },
    leadMode: {
      label: "LEAD MODE",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.leadMode || row.leadSource || "Business networking"}
        </span>
      )
    },
    workCategory: {
      label: "WORK CATEGORY",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.workCategory || "Design"}
        </span>
      )
    },
    workType: {
      label: "WORK TYPE",
      render: (val, row) => {
        const wt = Array.isArray(row.workType)
          ? row.workType.join(", ")
          : (row.workType || "Concept Drawing");
        return (
          <div className="max-w-[140px] truncate text-xs font-medium text-slate-700" title={wt}>
            {wt}
          </div>
        );
      }
    },
    alternateNumber: {
      label: "ALTERNATE NUMBER",
      render: (val, row) => {
        const alt = row.alternateNumber || "--";
        return alt !== "--" ? (
          <a
            href={`tel:${alt}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {alt}
          </a>
        ) : (
          <span className="text-xs text-slate-400">--</span>
        );
      }
    },
    address: {
      label: "ADDRESS",
      render: (val, row) => {
        const addr = row.address || row.siteAddress || "--";
        return (
          <div className="max-w-[140px] truncate text-xs text-slate-700 font-medium" title={addr}>
            {addr}
          </div>
        );
      }
    },
    pincode: {
      label: "PINCODE",
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-700 font-bold">
          {row.pincode || "--"}
        </span>
      )
    },
    city: {
      label: "CITY",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.city || "--"}
        </span>
      )
    },
    state: {
      label: "STATE",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.state || "--"}
        </span>
      )
    },
    expectedBusiness: {
      label: "EXPECTED BUSINESS (₹)",
      render: (val, row) => {
        const amt = Number(row.expectedBusiness || row.expectedRevenue || 0);
        return (
          <span className="text-xs font-mono font-bold text-slate-900">
            ₹{amt.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    assignedTo: {
      label: "ASSIGNED TO",
      render: (val, row) => {
        const assignee = row.assignTo || row.assignedTo || row.salesPerson || "Sales TL";
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {assignee}
          </span>
        );
      }
    },
    projectDetail: {
      label: "PROJECT DETAIL",
      render: (val, row) => {
        const pd = row.projectDetail || row.projectDetails || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium" title={pd}>
            {pd}
          </div>
        );
      }
    },
    remark: {
      label: "REMARK",
      render: (val, row) => {
        const rem = row.remark || row.requirement || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium" title={rem}>
            {rem}
          </div>
        );
      }
    }
  }), [currentPage, rowsPerPage, navigate]);

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

  // Schedule Modal Form State (Matching reference screenshot specifications)
  const defaultScheduleForm = {
    type: "Call",
    date: getOffsetDateString(1), // Default: Tomorrow
    time: "10:00 am", // Default: 10:00 AM
    assignedTo: "John (Sales TL)", // Default: Current User
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
  };
  const [scheduleFormData, setScheduleFormData] = useState(defaultScheduleForm);
  const [scheduleFormErrors, setScheduleFormErrors] = useState({});

  // Classification for Next Followup Color Coding
  const todayStr = getOffsetDateString(0);
  const tomorrowStr = getOffsetDateString(1);

  const getFollowupCategory = (item) => {
    if (item.status === "CONVERTED" || item.status === "COMPLETED") return "completed";
    if (item.nextFollowupDateRaw < todayStr) return "overdue";
    if (item.nextFollowupDateRaw === todayStr) return "today";
    if (item.nextFollowupDateRaw === tomorrowStr) return "tomorrow";
    return "upcoming";
  };

  // Color Coding Text Helper for Next Followup Column
  const getFollowupColorClass = (item) => {
    const cat = getFollowupCategory(item);
    if (cat === "overdue") return "text-red-500 font-bold"; // Overdue: Red
    if (cat === "today") return "text-emerald-600 font-bold"; // Today: Green
    if (cat === "tomorrow") return "text-amber-500 font-bold"; // Tomorrow: Yellow
    if (cat === "completed") return "text-slate-400 font-medium"; // Completed: Grey
    return "text-red-500 font-bold"; // Default red as in screenshot
  };

  // Status Badge Class Helper
  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("INTERESTED")) return "text-emerald-700 bg-emerald-50 border border-emerald-300";
    if (s.includes("LOST")) return "text-slate-600 bg-slate-100 border border-slate-300";
    if (s.includes("CONVERTED")) return "text-blue-700 bg-blue-50 border border-blue-300";
    return "text-emerald-700 bg-emerald-50 border border-emerald-300";
  };

  // Lead Label Badge Class Helper
  const getLeadLabelBadgeClass = (label) => {
    const l = (label || "").toUpperCase();
    if (l === "HOT") return "text-red-600 bg-red-50 border border-red-200 font-bold";
    if (l === "WARM") return "text-amber-600 bg-amber-50 border border-amber-200 font-bold";
    if (l === "COLD") return "text-sky-600 bg-sky-50 border border-sky-200 font-bold";
    return "text-purple-600 bg-purple-50 border border-purple-200 font-bold";
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search Box
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches =
          (lead.concernPersonName || lead.clientName || "").toLowerCase().includes(q) ||
          (lead.phoneNumber || "").includes(q) ||
          (lead.emailAddress || "").toLowerCase().includes(q) ||
          (lead.requirement || lead.projectDetail || "").toLowerCase().includes(q) ||
          (lead.address || lead.city || "").toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Dropdowns
      if (filterLeadMode !== "ALL" && (lead.leadMode || lead.leadSource) !== filterLeadMode) return false;
      if (filterLeadType !== "ALL" && lead.leadType !== filterLeadType) return false;
      if (filterWorkCategory !== "ALL" && (lead.workCategory || lead.leadLabel) !== filterWorkCategory) return false;
      if (filterWorkType !== "ALL" && (lead.workType || lead.jobType) !== filterWorkType) return false;
      if (filterStatus !== "ALL" && (lead.leadStatus || lead.status) !== filterStatus) return false;

      // Date Filter
      if (filterDateFrom && !(lead.createdDate || lead.date || lead.nextFollowupDate || "").includes(filterDateFrom)) return false;

      // Scope Filter (ALL, SELF, TEAM)
      if (filterScope === "SELF" && lead.assignedType !== "self") return false;
      if (filterScope === "TEAM") {
        if (lead.assignedType === "self") return false;
        if (filterExecutive !== "ALL") {
          const assignee = (lead.assignTo || lead.assignedTo || lead.salesPerson || "").toLowerCase();
          if (!assignee.includes(filterExecutive.toLowerCase())) return false;
        }
      }

      return true;
    });
  }, [
    leads,
    searchTerm,
    filterLeadMode,
    filterLeadType,
    filterWorkCategory,
    filterWorkType,
    filterStatus,
    filterDateFrom,
    filterScope,
    filterExecutive
  ]);

  // Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  // Open Schedule Modal for a lead
  const handleOpenScheduleModal = (lead) => {
    setScheduleModalLead(lead);
    setAttachments({ current: [], next: [], remarks: [] });
    setRecordingState({ current: false, next: false, remarks: false });
    setScheduleFormData({
      type: "Call",
      date: lead.nextFollowupDateRaw || getOffsetDateString(1),
      time: lead.nextFollowupTime !== "--" ? lead.nextFollowupTime : "10:00 am",
      assignedTo: lead.assignTo !== "--" ? lead.assignTo : "John (Sales TL)",
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

    let targetUpdatedLead = null;
    const updated = leads.map((l) => {
      if (l.id === scheduleModalLead.id) {
        targetUpdatedLead = {
          ...l,
          nextFollowupDate: formattedDisplayDate,
          nextFollowupDateRaw: scheduleFormData.date,
          nextFollowupTime: scheduleFormData.time || "10:00 am",
          assignTo: scheduleFormData.assignedTo,
          clientRating: scheduleFormData.clientRating,
          reminder: scheduleFormData.reminder,
          reminderHours: scheduleFormData.reminderHours,
          followupRemarksCount: (l.followupRemarksCount || 0) + 1,
          followupHistory: [newHistoryEntry, ...(l.followupHistory || [])]
        };
        return targetUpdatedLead;
      }
      return l;
    });

    saveLeads(updated);
    if (targetUpdatedLead) {
      updateLeadInStorage(targetUpdatedLead);
    }

    if (scheduleModalLead.id && !String(scheduleModalLead.id).startsWith("LM-")) {
      addFollowupApi({
        leadId: scheduleModalLead.id,
        remarks: activeNotes,
        scheduledDate: scheduleFormData.date ? new Date(scheduleFormData.date) : new Date(),
        status: "SCHEDULED"
      }).catch((err) => console.error("Error calling addFollowupApi:", err));
    }

    setScheduleModalLead(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] font-sans antialiased text-slate-900 p-3 sm:p-5 pb-12">
      
      {/* ================= 1. TOP HEADER ================= */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Scheduled Leads & Follow-ups"
          badge="Daily Calls"
          badgeColor="bg-amber-100 text-amber-900 border-amber-300"
          description="View upcoming, today's and overdue customer follow-ups and log activity notes."
          showBackButton={true}
          className="mb-0"
          rightActions={
            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-2xs font-bold text-xs sm:text-sm ${
                showFilters
                  ? "bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-2xs"
                  : "bg-[#FF5722] text-white border-[#FF5722] hover:bg-[#e64a19]"
              }`}
              title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          }
        />
      </div>

      {/* ================= 2. SCOPE TABS WITH EXECUTIVE DROPDOWN ================= */}
      <ScopeTabs
        activeTab={filterScope}
        onTabChange={(tab) => {
          setFilterScope(tab);
          setCurrentPage(1);
        }}
        selectedExecutive={filterExecutive}
        onExecutiveChange={(exec) => {
          setFilterExecutive(exec);
          setCurrentPage(1);
        }}
        executives={teamMembers}
      />

      {/* ================= 3. COLLAPSIBLE FILTER PANEL ================= */}
      {showFilters && (
        <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 mb-5 space-y-4 animate-in fade-in duration-150">
          {/* Search & Quick Status Tabs */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search Client Name, Project Details, City..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:border-slate-900 transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Status Tabs (ALL, HOT, WARM, COLD) */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {["ALL", "HOT", "WARM", "COLD"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    filterStatus === st
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Filter Dropdowns + Date Picker + Reset Button */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
            {/* 1. Lead Mode Dropdown */}
            <select
              value={filterLeadMode}
              onChange={(e) => { setFilterLeadMode(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Lead Mode</option>
              {leadModesList.filter(m => m !== "ALL").map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* 2. Lead Type Dropdown */}
            <select
              value={filterLeadType}
              onChange={(e) => { setFilterLeadType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Lead Type</option>
              {leadTypesList.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* 3. Lead Status Dropdown */}
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Lead Status</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>

            {/* 4. Work Category Dropdown */}
            <select
              value={filterWorkCategory}
              onChange={(e) => { setFilterWorkCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Work Category</option>
              {workCategoryList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* 5. Work Type Dropdown */}
            <select
              value={filterWorkType}
              onChange={(e) => { setFilterWorkType(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 cursor-pointer shadow-2xs"
            >
              <option value="ALL">Work Type</option>
              {availableWorkTypes.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            {/* Date Picker & Reset Button */}
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-slate-900 shadow-2xs"
              />

              {/* Orange Reset Button */}
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-[#ff5722] hover:bg-[#e64a19] text-white p-2.5 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                title="Reset All Filters"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= 4. MAIN TABLE ================= */}
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ========================================================================= */}
      {/* MODAL 1: SCHEDULE FOLLOW-UP (EXACT ASCII WIREFRAME SPECIFICATION)         */}
      {/* ┌─────────────────────────────────────────────────────────────┐           */}
      {/* │  ✕ SCHEDULE FOLLOW-UP                           [X]       │           */}
      {/* │  Client: Sanjay Srivastava                                │           */}
      {/* │                                                             │           */}
      {/* │  ┌─────────────────────────────────────────────────────┐  │           */}
      {/* │  │ Date* [25/08/2026]   Time* [10:00 ▼]              │  │           */}
      {/* │  │ Assigned To* [John ▼]                              │  │           */}
      {/* │  │ Reminder: [ON] 24 hours before                     │  │           */}
      {/* │  │ Notes* [_________________________________________] │  │           */}
      {/* │  │        [_________________________________________] │  │           */}
      {/* │  └─────────────────────────────────────────────────────┘  │           */}
      {/* │                                                             │           */}
      {/* │                                 [Cancel] [Schedule]        │           */}
      {/* └─────────────────────────────────────────────────────────────┘           */}
      {/* ========================================================================= */}
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
                  <CommentWithMedia
                    title="CURRENT DISCUSSION"
                    placeholder="Enter current discussion or record..."
                    value={scheduleFormData.notes || ""}
                    onChange={(val) => setScheduleFormData((prev) => ({ ...prev, notes: val }))}
                    files={attachments.current || []}
                    onFilesChange={(newFiles) => setAttachments((prev) => ({ ...prev, current: newFiles }))}
                  />
                </div>

                <div>
                  <CommentWithMedia
                    title="NEXT DISCUSSION TOPIC"
                    placeholder="Enter next topic or record..."
                    value={scheduleFormData.nextDiscussionTopic || ""}
                    onChange={(val) => setScheduleFormData((prev) => ({ ...prev, nextDiscussionTopic: val }))}
                    files={attachments.next || []}
                    onFilesChange={(newFiles) => setAttachments((prev) => ({ ...prev, next: newFiles }))}
                  />
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
                    value={scheduleFormData.assignedTo || "John (Sales TL)"}
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
                <CommentWithMedia
                  title="FOLLOW-UP REMARKS"
                  placeholder="Enter remarks or record voice note..."
                  value={scheduleFormData.followupRemarks || ""}
                  onChange={(val) => setScheduleFormData((prev) => ({ ...prev, followupRemarks: val }))}
                  files={attachments.remarks || []}
                  onFilesChange={(newFiles) => setAttachments((prev) => ({ ...prev, remarks: newFiles }))}
                />
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL 2: DISCUSSION LOGS / FOLLOW-UP REMARKS MODAL ================= */}
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
                  const lead = remarksModalLead;
                  setRemarksModalLead(null);
                  handleOpenScheduleModal(lead);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-black transition-all cursor-pointer shadow-xs"
              >
                + Schedule Next Follow-up
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
            
            <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{detailModalLead.concernPersonName}</h3>
                <p className="text-xs text-neutral-400">Lead ID: {detailModalLead.id} • {detailModalLead.leadSource}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalLead(null)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
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
                  <div className="font-bold text-emerald-600 mt-0.5">₹{detailModalLead.expectedBusiness}</div>
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
                    const lead = detailModalLead;
                    setDetailModalLead(null);
                    handleOpenScheduleModal(lead);
                  }}
                  className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-neutral-800 cursor-pointer shadow-xs"
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

      {/* ================= MODAL 4: COMPLETE FOLLOW-UP MODAL ================= */}
      {completeModalLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Mark Activity Complete</h3>
            <p className="text-slate-500 mb-4">
              Mark follow-up completed for <span className="font-bold text-slate-800">{completeModalLead.concernPersonName}</span>.
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
                Confirm Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= CLIENT STATUS / LEAD DETAILS MODAL ================= */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">Lead Details</h3>
              <button
                type="button"
                onClick={() => {
                  setStatusModalLead(null);
                  setSelectedClientStatus("");
                  setNotInterestedReason("");
                  setCustomNotInterestedReason("");
                  setStatusRemark("");
                  setStatusRemarkAttachments([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Top Cards: Client Info (Light Blue) & Expected Business (Light Green) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Left Box: Client Info */}
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <FaUser className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {statusModalLead.clientName || statusModalLead.concernPersonName || "Client Name"}
                  </h4>
                  <p className="text-xs font-mono text-slate-600 font-semibold truncate">
                    {statusModalLead.phoneNumber || statusModalLead.contact || "--"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium truncate">
                    {statusModalLead.emailAddress || statusModalLead.email || "--"}
                  </p>
                </div>
              </div>

              {/* Right Box: Expected Business */}
              <div className="p-4 rounded-2xl bg-emerald-100/70 border border-emerald-200/80 text-center flex flex-col justify-center items-center">
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase mb-1">
                  Expected Business
                </span>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {statusModalLead.expectedBusiness || statusModalLead.expectedRevenue || statusModalLead.expectedBusinessAmount || "0"}
                </span>
              </div>
            </div>

            {/* Form Section: Client Status Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Client Status <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedClientStatus}
                onChange={(e) => {
                  setSelectedClientStatus(e.target.value);
                  if (e.target.value !== "NOT INTERESTED") {
                    setNotInterestedReason("");
                    setCustomNotInterestedReason("");
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-orange-500 shadow-2xs cursor-pointer"
              >
                <option value="">-- Select Status --</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="NOT INTERESTED">NOT INTERESTED</option>
              </select>
            </div>

            {/* If NOT INTERESTED selected: Show Reason Dropdown, Custom Reason Input & Remarks with Media */}
            {selectedClientStatus === "NOT INTERESTED" && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Reason Dropdown (DDL) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Reason For Not Interested <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={notInterestedReason}
                    onChange={(e) => setNotInterestedReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-red-500 shadow-2xs cursor-pointer"
                  >
                    <option value="">-- Select Reason --</option>
                    {notInterestedReasonsList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* If "Other" selected: Custom Reason Write-In Input Box */}
                {notInterestedReason === "Other" && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Specify Other Reason <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Type specific reason why client is not interested..."
                      value={customNotInterestedReason}
                      onChange={(e) => setCustomNotInterestedReason(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 bg-white focus:outline-none focus:border-red-500 shadow-2xs placeholder:text-slate-400"
                    />
                  </div>
                )}

                {/* Remarks Field with Media Attachments (Audio Recording, Photos, Videos, Documents) */}
                <div className="pt-1">
                  <CommentWithMedia
                    title="Remarks & Attachments (Audio / Image)"
                    placeholder="Write detailed remarks or record audio note..."
                    value={statusRemark}
                    onChange={(val) => setStatusRemark(val)}
                    files={statusRemarkAttachments}
                    onFilesChange={(newFiles) => setStatusRemarkAttachments(newFiles)}
                  />
                </div>
              </div>
            )}

            {/* If INTERESTED selected: Optional Remarks with Media Attachment */}
            {selectedClientStatus === "INTERESTED" && (
              <div className="pt-1 animate-in fade-in duration-200">
                <CommentWithMedia
                  title="Remarks & Attachments (Optional)"
                  placeholder="Write optional remark or record audio note..."
                  value={statusRemark}
                  onChange={(val) => setStatusRemark(val)}
                  files={statusRemarkAttachments}
                  onFilesChange={(newFiles) => setStatusRemarkAttachments(newFiles)}
                />
              </div>
            )}

            {/* Modal Footer Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStatusModalLead(null);
                  setSelectedClientStatus("");
                  setNotInterestedReason("");
                  setCustomNotInterestedReason("");
                  setStatusRemark("");
                  setStatusRemarkAttachments([]);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendToSalesManagement}
                className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-sm font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Submit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Follow;