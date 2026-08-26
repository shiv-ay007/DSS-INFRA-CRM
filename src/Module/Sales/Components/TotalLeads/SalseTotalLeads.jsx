import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import ScopeTabs from "../../../../Common/Components/ScopeTabs";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { initialTotalLeads } from "../../data/totalLeadsData";
import { initialAssignedLeads } from "../../data/assignedLeadsData";
import { availableWorkTypes, workCategoryList, indianStatesList } from "../../data/addLeadData";
import { FaUserPlus, FaUsers, FaUserCheck, FaImage, FaVideo, FaMicrophone, FaFileAlt, FaPaperclip, FaTimes, FaDownload, FaPlay, FaPause } from "react-icons/fa";

const salesPersonsList = [
  "ALL",
  "Sales TL (Current User)",
  "Rahul Sharma",
  "Pooja Verma",
  "Vikram Malhotra",
  "Ankit Patel",
  "Sanjay Gupta"
];

const leadModesList = [
  "ALL",
  "Business networking",
  "By freelancer",
  "By sales Team",
  "Customer to customer"
];

const leadTypesList = [
  "ALL",
  "FRESH",
  "REPEAT"
];

const workCategoriesList = [
  "ALL",
  ...workCategoryList
];

const fullWorkTypesList = [
  "ALL",
  ...availableWorkTypes
];

const citiesList = [
  "ALL",
  "Noida",
  "Delhi NCR",
  "Gurugram",
  "Mumbai",
  "Bengaluru",
  "Jaipur"
];

const fullStatesList = [
  "ALL",
  ...indianStatesList
];

const getSVGPlaceholder = (name = "Image Attachment") => {
  const titleText = name.length > 25 ? name.substring(0, 22) + "..." : name;
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23f8fafc"/><rect x="20" y="20" width="560" height="360" rx="16" fill="%23ffffff" stroke="%23cbd5e1" stroke-width="2"/><circle cx="300" cy="160" r="45" fill="%2310b981" opacity="0.85"/><path d="M 220,240 L 300,170 L 380,240 Z" fill="%23059669"/><text x="300" y="295" font-family="sans-serif" font-size="22" font-weight="bold" fill="%231e293b" text-anchor="middle">${encodeURIComponent(titleText)}</text><text x="300" y="325" font-family="sans-serif" font-size="14" font-weight="600" fill="%23059669" text-anchor="middle">✔ Lead Remark Attachment Preview</text></svg>`;
};

const getImagePreviewUrl = (att) => {
  if (!att) return "";
  const cached = window.__DSS_MEDIA_CACHE?.[att.id] || window.__DSS_MEDIA_CACHE?.[att.name];
  if (cached && typeof cached === "string" && cached.trim()) {
    return cached;
  }
  if (att.url && typeof att.url === "string" && att.url.trim()) {
    if (att.url.startsWith("data:image") || att.url.startsWith("blob:") || att.url.startsWith("http://") || att.url.startsWith("https://")) {
      return att.url;
    }
  }
  if (att.preview && typeof att.preview === "string" && att.preview.trim()) {
    return att.preview;
  }
  return getSVGPlaceholder(att?.name || "Image Attachment");
};

const SalseTotalLeads = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const loadLeadsFromStorage = useCallback(() => {
    const saved = localStorage.getItem("dss_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          const processed = parsed.map((item) => {
            const rawAtts = item.remarkAttachments || item.attachments;
            if (rawAtts && Array.isArray(rawAtts) && rawAtts.length > 0) {
              const updatedAtts = rawAtts.map((att) => {
                const name = (att.name || "").toLowerCase();
                const type = (att.type || "").toLowerCase();
                const isImg = name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || type.includes("image");
                const isAud = name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) || name.includes("audio") || type.includes("audio");

                let newUrl = att.url || att.preview || "";
                if (window.__DSS_MEDIA_CACHE?.[att.id] || window.__DSS_MEDIA_CACHE?.[att.name]) {
                  newUrl = window.__DSS_MEDIA_CACHE[att.id] || window.__DSS_MEDIA_CACHE[att.name];
                }
                if (!newUrl) {
                  if (isImg) {
                    newUrl = getImagePreviewUrl(att);
                  }
                }

                return {
                  ...att,
                  type: isImg ? "image" : isAud ? "audio" : (att.type || "document"),
                  url: newUrl
                };
              });
              return { ...item, remarkAttachments: updatedAtts, attachments: updatedAtts };
            }
            return item;
          });
          setLeads(processed);
          return;
        }
      } catch (e) {
        console.error("Error loading leads from localStorage:", e);
      }
    }
    setLeads(initialTotalLeads);
  }, []);

  // Load leads from localStorage or default dataset
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem("dss_leads");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => {
            const rawAtts = item.remarkAttachments || item.attachments;
            if (rawAtts && Array.isArray(rawAtts) && rawAtts.length > 0) {
              const updatedAtts = rawAtts.map((att) => {
                const name = (att.name || "").toLowerCase();
                const type = (att.type || "").toLowerCase();
                const isImg = name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) || type.includes("image");
                const isAud = name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) || name.includes("audio") || type.includes("audio");

                let newUrl = att.url || att.preview || "";
                if (!newUrl || newUrl.startsWith("blob:")) {
                  if (isImg) {
                    newUrl = getImagePreviewUrl(att);
                  }
                }

                return {
                  ...att,
                  type: isImg ? "image" : isAud ? "audio" : (att.type || "document"),
                  url: newUrl
                };
              });
              return { ...item, remarkAttachments: updatedAtts, attachments: updatedAtts };
            }
            return item;
          });
        }
      } catch (e) {
        return initialTotalLeads;
      }
    }
    return initialTotalLeads;
  });

  useEffect(() => {
    loadLeadsFromStorage();
  }, [location, loadLeadsFromStorage]);

  const saveLeadsToStorage = (newLeads) => {
    setLeads(newLeads);
    localStorage.setItem("dss_leads", JSON.stringify(newLeads));
  };

  // Search & Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterScope, setFilterScope] = useState("ALL");
  const [filterLeadMode, setFilterLeadMode] = useState("ALL");
  const [filterLeadType, setFilterLeadType] = useState("ALL");
  const [filterWorkCategory, setFilterWorkCategory] = useState("ALL");
  const [filterWorkType, setFilterWorkType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
  const [filterCity, setFilterCity] = useState("ALL");
  const [filterState, setFilterState] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterLeadMode("ALL");
    setFilterLeadType("ALL");
    setFilterWorkCategory("ALL");
    setFilterWorkType("ALL");
    setFilterStatus("ALL");
    setFilterSalesPerson("ALL");
    setFilterCity("ALL");
    setFilterState("ALL");
    setFilterDateFrom("");
    setFilterDateTo("");
    setCurrentPage(1);
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Sort State
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc"
  });

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals & Inline Media Playback
  const [activeLeadModal, setActiveLeadModal] = useState(null);
  const [playingMediaId, setPlayingMediaId] = useState(null);
  const activeAudioRef = useRef(null);
  const activeAudioCtxRef = useRef(null);
  const audioTimerRef = useRef(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [audioPlayerModal, setAudioPlayerModal] = useState(null);

  const getMediaType = (att) => {
    if (!att) return "document";
    const t = (att.type || "").toLowerCase();
    const name = (att.name || "").toLowerCase();
    const url = (att.url || "").toLowerCase();

    if (t.includes("image") || url.startsWith("data:image") || name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return "image";
    }
    if (t.includes("audio") || url.startsWith("data:audio") || name.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) || name.includes("audio")) {
      return "audio";
    }
    if (t.includes("video") || url.startsWith("data:video") || name.match(/\.(mp4|webm|ogg|mov|mkv)$/i) || name.includes("video")) {
      return "video";
    }
    return "document";
  };

  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {}
      activeAudioRef.current = null;
    }
    if (activeAudioCtxRef.current) {
      try {
        activeAudioCtxRef.current.close();
      } catch (e) {}
      activeAudioCtxRef.current = null;
    }
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
    setPlayingMediaId(null);
  };

  const toggleMediaPlay = (attId, url) => {
    if (playingMediaId === attId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();

    const playSynthFallback = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        activeAudioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.3);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.6);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setPlayingMediaId(attId);

        audioTimerRef.current = setTimeout(() => {
          stopAllAudio();
        }, 2500);
      } catch (e) {
        stopAllAudio();
      }
    };

    if (!url || url.startsWith("blob:")) {
      playSynthFallback();
      return;
    }

    try {
      const audio = new Audio(url);
      activeAudioRef.current = audio;
      setPlayingMediaId(attId);

      audio.play().catch((err) => {
        console.warn("Audio playback failed, playing synth fallback:", err);
        playSynthFallback();
      });

      audio.onended = () => {
        stopAllAudio();
      };
      audio.onerror = () => {
        playSynthFallback();
      };
    } catch (e) {
      playSynthFallback();
    }
  };
  const [followupModal, setFollowupModal] = useState(null);
  const [followupDate, setFollowupDate] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("Warm");

  // Assign Lead Modal States (Matching User Screenshot Design)
  const [assignModalLead, setAssignModalLead] = useState(null);
  const [assignType, setAssignType] = useState("self"); // "self" or "executive"
  const [selectedExecutive, setSelectedExecutive] = useState("Rahul Sharma");
  const [executiveBranch, setExecutiveBranch] = useState("Noida Branch");
  const [leadPriority, setLeadPriority] = useState("Medium");
  const [assignmentRemark, setAssignmentRemark] = useState("");
  const [assignmentFiles, setAssignmentFiles] = useState([]);

  const executiveBranchMap = useMemo(() => ({
    "Rahul Sharma": "Noida Branch",
    "Pooja Verma": "Delhi NCR Branch",
    "Vikram Malhotra": "Gurugram Branch",
    "Ankit Patel": "Mumbai Branch",
    "Sanjay Gupta": "Bengaluru Branch",
    "Sales TL (Current User)": "Head Office Main"
  }), []);

  const handleExecutiveChange = (execName) => {
    setSelectedExecutive(execName);
    setExecutiveBranch(executiveBranchMap[execName] || "Noida Branch");
  };

  const handleAssignLeadSubmit = () => {
    if (!assignModalLead) return;

    const assignedPerson =
      assignType === "self"
        ? "Sales TL (Current User)"
        : selectedExecutive || "Rahul Sharma";

    const assignedBranch =
      assignType === "self"
        ? "Head Office Main"
        : executiveBranchMap[assignedPerson] || "Noida Branch";

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const updatedLeadData = {
      ...assignModalLead,
      assignTo: assignedPerson,
      salesPerson: assignedPerson,
      assignedTo: assignedPerson,
      leadBy: assignedPerson,
      assignedType: assignType,
      assignedBranch: assignedBranch,
      priority: leadPriority,
      leadPriority: leadPriority,
      isAssigned: true,
      assignedDate: formattedDate,
      assignedTime: formattedTime,
      assignmentRemark: assignmentRemark,
      assignmentFiles: assignmentFiles.map((f) => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    };

    // 1. Update in dss_leads (Total Leads Directory)
    const updatedTotalLeads = leads.map((l) =>
      l.id === assignModalLead.id ? updatedLeadData : l
    );
    saveLeadsToStorage(updatedTotalLeads);

    // 2. Save / prepend to dss_assigned_leads (Assigned Leads)
    try {
      const savedAssigned = localStorage.getItem("dss_assigned_leads");
      let currentAssigned = [];
      if (savedAssigned) {
        try {
          const parsed = JSON.parse(savedAssigned);
          if (Array.isArray(parsed) && parsed.length > 0) currentAssigned = parsed;
        } catch (e) {}
      }
      if (currentAssigned.length === 0) {
        currentAssigned = initialAssignedLeads;
      }

      const filteredAssigned = currentAssigned.filter((item) => item.id !== assignModalLead.id);
      localStorage.setItem(
        "dss_assigned_leads",
        JSON.stringify([updatedLeadData, ...filteredAssigned])
      );
    } catch (e) {
      console.error("Error saving assigned lead:", e);
    }

    toast.success(`Lead ${assignModalLead.clientName || assignModalLead.concernPersonName || assignModalLead.id} assigned to ${assignedPerson} successfully! 🎯`);
    setAssignModalLead(null);
    setAssignmentRemark("");
    setAssignmentFiles([]);
    navigate("/sales/leads/assigned");
  };

  // Table Column Configuration matching AddLead form fields in exact sequence
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
      render: (val, row) => {
        return (
          <div className="flex items-center justify-center gap-1.5">
            {/* View Lead Details Eye Button */}
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

            {/* Assign Lead Icon Button (ONLY SHOWN ON 'ALL' TAB) */}
            {filterScope?.toUpperCase() === "ALL" && (
              <button
                type="button"
                onClick={() => {
                  const assignee = row.assignTo || row.salesPerson || "Rahul Sharma";
                  const isSelf = assignee.includes("Current") || assignee.includes("TL") || assignee.includes("Self");
                  setAssignType(isSelf ? "self" : "executive");
                  if (!isSelf) {
                    setSelectedExecutive(assignee);
                    setExecutiveBranch(executiveBranchMap[assignee] || "Noida Branch");
                  }
                  setAssignModalLead(row);
                }}
                className="w-7 h-7 rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                title="Assign Lead"
              >
                <FaUserPlus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }
    },
    createdDate: {
      label: "CREATED DATE",
      render: (val, row) => {
        const dateStr = row.createdDate || row.date || "2026-08-18";
        const timeStr = row.createdTime || "11:00 am";
        return (
          <div className="text-xs space-y-1 whitespace-nowrap">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200/80 font-extrabold text-xs shadow-2xs">
                {dateStr}
              </span>
            </div>
            <div>
              <span className="inline-block px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono text-[10px] font-extrabold shadow-2xs">
                {timeStr}
              </span>
            </div>
          </div>
        );
      }
    },
    clientDetails: {
      label: "CLIENT DETAILS",
      render: (val, row) => {
        const name = row.clientName || row.concernPersonName || "--";
        const phone = row.phoneNumber || row.contact || row.whatsappNumber || "--";
        const email = row.emailAddress || row.email || "--";

        return (
          <div className="text-xs space-y-0.5 max-w-[160px]">
            {/* Line 1: Client Name (Highlighted with color badge) */}
            <div className="mb-0.5">
              <span
                className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs inline-block truncate max-w-full text-xs"
                title={name}
              >
                {name}
              </span>
            </div>

            {/* Line 2: Contact Number (Clickable, no phone icon) */}
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

            {/* Line 3: Email Address (Clickable) */}
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
        const attachments = row.remarkAttachments || row.attachments || [];

        return (
          <div className="flex items-center gap-1.5 max-w-[200px]">
            {/* Remark Text */}
            <div className="truncate text-xs text-slate-700 font-medium flex-1" title={rem}>
              {rem}
            </div>

            {/* Inline Media Preview & Play/Pause Controls */}
            {attachments.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {attachments.map((att, idx) => {
                  const attId = att.id || `${row.id}-${idx}`;
                  const mediaType = getMediaType(att);
                  const isPlaying = playingMediaId === attId;

                  // 1. IMAGE: Icon-only button -> Opens Lightbox Preview on Click!
                  if (mediaType === "image") {
                    const imgSrc = getImagePreviewUrl(att);
                    return (
                      <button
                        key={attId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLightboxImage({
                            url: imgSrc,
                            title: att.name || row.clientName || "Image View"
                          });
                        }}
                        className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                        title="Click to view full image"
                      >
                        <FaImage className="w-3 h-3 text-emerald-600" />
                      </button>
                    );
                  }

                  // 2. AUDIO / VIDEO: Icon-only button -> Opens Audio Player Modal on Click!
                  if (mediaType === "audio" || mediaType === "video") {
                    return (
                      <button
                        key={attId}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAudioPlayerModal({
                            url: att.url,
                            title: att.name || `${row.clientName || "Lead"} Audio Note`,
                            attId: attId
                          });
                        }}
                        className={`w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer shadow-2xs border ${
                          isPlaying
                            ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                            : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        }`}
                        title="Click to open audio player"
                      >
                        <FaPlay className="w-2.5 h-2.5 text-amber-700" />
                      </button>
                    );
                  }

                  // 3. Document or Other file type:
                  return (
                    <a
                      key={attId}
                      href={att.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                      title={att.name || "View Document"}
                    >
                      <FaFileAlt className="w-3 h-3" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      }
    }
  }), [currentPage, rowsPerPage, filterScope]);

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        item.clientName?.toLowerCase().includes(search) ||
        item.concernPersonName?.toLowerCase().includes(search) ||
        item.projectDetail?.toLowerCase().includes(search) ||
        item.projectDetails?.toLowerCase().includes(search) ||
        item.city?.toLowerCase().includes(search) ||
        item.address?.toLowerCase().includes(search) ||
        item.phoneNumber?.includes(search) ||
        item.contact?.includes(search) ||
        item.emailAddress?.toLowerCase().includes(search) ||
        item.email?.toLowerCase().includes(search) ||
        item.id?.toLowerCase().includes(search);

      const sp = (item.salesPerson || item.assignTo || "").toLowerCase();
      const isSelfLead = sp.includes("sales tl") || sp.includes("current") || sp.includes("self") || sp.includes("rahul");
      const matchScope =
        filterScope === "ALL" ||
        (filterScope === "SELF" ? isSelfLead : !isSelfLead);

      const matchLeadMode =
        filterLeadMode === "ALL" ||
        (item.leadMode || item.leadSource)?.toLowerCase() === filterLeadMode.toLowerCase();

      const matchLeadType =
        filterLeadType === "ALL" ||
        item.leadType?.toLowerCase() === filterLeadType.toLowerCase();

      const matchWorkCategory =
        filterWorkCategory === "ALL" ||
        item.workCategory?.toLowerCase() === filterWorkCategory.toLowerCase();

      const matchWorkType =
        filterWorkType === "ALL" ||
        (Array.isArray(item.workType)
          ? item.workType.includes(filterWorkType)
          : item.workType === filterWorkType);

      const matchStatus =
        filterStatus === "ALL" ||
        (item.leadStatus || item.status)?.toLowerCase() === filterStatus.toLowerCase();

      const matchSalesPerson =
        filterSalesPerson === "ALL" ||
        (item.salesPerson || item.assignTo) === filterSalesPerson;

      const matchCity =
        filterCity === "ALL" || item.city === filterCity;

      const matchState =
        filterState === "ALL" || item.state === filterState;

      let matchDate = true;
      const leadDate = item.createdDate || item.date;
      if (filterDateFrom && leadDate) {
        matchDate = matchDate && leadDate >= filterDateFrom;
      }
      if (filterDateTo && leadDate) {
        matchDate = matchDate && leadDate <= filterDateTo;
      }

      return matchSearch && matchScope && matchLeadMode && matchLeadType && matchWorkCategory && matchWorkType && matchStatus && matchSalesPerson && matchCity && matchState && matchDate;
    });
  }, [leads, searchTerm, filterScope, filterLeadMode, filterLeadType, filterWorkCategory, filterWorkType, filterStatus, filterSalesPerson, filterCity, filterState, filterDateFrom, filterDateTo]);

  // Sort Logic
  const sortedLeads = useMemo(() => {
    const sortable = [...filteredLeads];
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === "expectedRevenue") {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal ? bVal.toLowerCase() : "";
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredLeads, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / rowsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedLeads.slice(start, start + rowsPerPage);
  }, [sortedLeads, currentPage, rowsPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  // Bulk Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedLeads.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete selected ${selectedIds.length} leads permanently?`)) {
      const updated = leads.filter((item) => !selectedIds.includes(item.id));
      saveLeadsToStorage(updated);
      setSelectedIds([]);
    }
  };

  const handleBulkStatusApply = () => {
    const updated = leads.map((item) =>
      selectedIds.includes(item.id) ? { ...item, leadStatus: bulkNewStatus } : item
    );
    saveLeadsToStorage(updated);
    setBulkStatusModal(false);
    setSelectedIds([]);
  };

  const handleExportCSV = () => {
    const exportData = selectedIds.length > 0
      ? leads.filter((item) => selectedIds.includes(item.id))
      : filteredLeads;

    const headers = ["Lead ID", "Date", "Sales Person", "Client Name", "Contact", "Work Type", "Expected Revenue", "City", "Status", "Next Followup"];
    const rows = exportData.map((l) => [
      l.id,
      l.date,
      l.salesPerson,
      `"${l.clientName}"`,
      l.contact,
      Array.isArray(l.workType) ? l.workType.join(" | ") : l.workType,
      l.expectedRevenue,
      l.city,
      l.leadStatus,
      l.nextFollowup || ""
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Row Action Handlers
  const handleDeleteRow = (id) => {
    if (window.confirm("Delete this lead record permanently?")) {
      const updated = leads.filter((item) => item.id !== id);
      saveLeadsToStorage(updated);
    }
  };

  const handleConvertLead = (lead) => {
    if (window.confirm(`Convert ${lead.clientName} lead to Deal / Order?`)) {
      const updated = leads.map((item) =>
        item.id === lead.id ? { ...item, leadStatus: "Converted", nextFollowup: "Deal Won" } : item
      );
      saveLeadsToStorage(updated);
    }
  };

  const handleSaveFollowup = () => {
    if (!followupDate) return;
    const updated = leads.map((item) =>
      item.id === followupModal.id
        ? { ...item, nextFollowup: `${followupDate}`, remarks: followupNotes || item.remarks }
        : item
    );
    saveLeadsToStorage(updated);
    setFollowupModal(null);
    setFollowupDate("");
    setFollowupNotes("");
  };

  // Badges & Dot Styling
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "hot":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "warm":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cold":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "converted":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "new":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case "hot":
        return "bg-rose-500";
      case "warm":
        return "bg-amber-500";
      case "cold":
        return "bg-sky-500";
      case "converted":
        return "bg-emerald-500";
      case "new":
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="space-y-4 font-sans pb-16">
      
      {/* ================= 1. SUB-HEADER / ACTIONS ================= */}
      <PageHeader
        title="Total Leads Directory"
        badge="Master Directory"
        badgeColor="bg-blue-100 text-blue-800 border-blue-300"
        description={`Showing ${filteredLeads.length} of ${leads.length} registered pipeline leads`}
        showBackButton={true}
        rightActions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              title="Export CSV"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export CSV</span>
            </button>

            <Link
              to="/sales/leads/add"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Add Lead
            </Link>

            <button
              type="button"
              onClick={() => setShowFilters((prev) => !prev)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-2xs font-bold text-xs sm:text-sm ${
                showFilters
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-[#FF5722] text-white border-[#FF5722] hover:bg-[#e64a19]"
              }`}
              title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        }
      />

      {/* ================= ALL / SELF / TEAM SCOPE FILTER WITH EXECUTIVE DROPDOWN ================= */}
      <ScopeTabs
        activeTab={filterScope}
        onTabChange={(tab) => {
          setFilterScope(tab);
          setCurrentPage(1);
        }}
        selectedExecutive={filterSalesPerson}
        onExecutiveChange={(exec) => {
          setFilterSalesPerson(exec);
          setCurrentPage(1);
        }}
        executives={salesPersonsList}
      />



      {/* COLLAPSIBLE FILTER PANEL (Opens on click) */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 transition-all">
          {/* Top Search & Status Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
            {/* Real-time Search */}
            <div className="relative w-full lg:w-96">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search Client Name, Project Details, City..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-hidden focus:border-black transition-all placeholder:text-slate-400 font-medium shadow-2xs"
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

            {/* Quick Status Tabs (Only ALL, HOT, WARM, COLD) */}
            <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
              {["ALL", "HOT", "WARM", "COLD"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setFilterStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    filterStatus === st
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {st !== "ALL" && (
                    <span className={`w-2 h-2 rounded-full ${getStatusDot(st)}`} />
                  )}
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filters Matching User Specifications */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs sm:text-sm">
              {/* 1. Lead Type */}
              <select
                value={filterLeadType}
                onChange={(e) => {
                  setFilterLeadType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Type</option>
                {leadTypesList.filter(t => t !== "ALL").map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {/* 2. Lead Mode */}
              <select
                value={filterLeadMode}
                onChange={(e) => {
                  setFilterLeadMode(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Mode</option>
                {leadModesList.filter(m => m !== "ALL").map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* 3. Lead Status (Only Hot, Warm, Cold) */}
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Lead Status</option>
                {["Hot", "Warm", "Cold"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* 4. Work Category */}
              <select
                value={filterWorkCategory}
                onChange={(e) => {
                  setFilterWorkCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Work Category</option>
                {workCategoryList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              {/* 5. Work Type */}
              <select
                value={filterWorkType}
                onChange={(e) => {
                  setFilterWorkType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 cursor-pointer font-medium shadow-2xs"
              >
                <option value="ALL">Work Type</option>
                {availableWorkTypes.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Row 2: Date Picker & Orange Reset Button */}
            <div className="flex items-center gap-3">
              <div className="relative w-48">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 bg-white focus:outline-none focus:border-slate-400 font-medium shadow-2xs cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="w-9 h-9 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center font-bold text-sm shrink-0"
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

      {/* Selected Rows Batch Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
              {selectedIds.length}
            </span>
            <span className="font-bold">Leads Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkStatusModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Change Status
            </button>

            <button
              type="button"
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* ================= 3. REUSABLE COMMON TABLE COMPONENT ================= */}
      <Table
        data={paginatedLeads}
        columnConfig={columnConfig}
        currentPage={currentPage}
        totalItems={filteredLeads.length}
        itemsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* ================= 5. VIEW DETAIL MODAL ================= */}
      {activeLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Lead Details</span>
                <h3 className="text-base font-black text-slate-900">{activeLeadModal.clientName}</h3>
              </div>
              <button
                onClick={() => setActiveLeadModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Lead ID</span>
                <strong className="font-mono">{activeLeadModal.id}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Sales Person</span>
                <strong>{activeLeadModal.salesPerson}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Primary Contact</span>
                <strong className="font-mono">+91 {activeLeadModal.contact}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Deal Value</span>
                <strong className="font-mono text-emerald-600 font-black">
                  ₹ {Number(activeLeadModal.expectedRevenue || 0).toLocaleString("en-IN")}
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 col-span-2">
                <span className="text-slate-400 block text-[10px]">Scope & Requirements</span>
                <p className="mt-1 text-slate-700 leading-relaxed font-medium">
                  {activeLeadModal.projectDetails || "No additional project notes provided."}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">City & Region</span>
                <strong>{activeLeadModal.city} ({activeLeadModal.state || "India"})</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px]">Lead Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(activeLeadModal.leadStatus)}`}>
                  {activeLeadModal.leadStatus}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setActiveLeadModal(null)}
                className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= ASSIGN LEAD MODAL (EXACT SCREENSHOT DESIGN) ================= */}
      {assignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            {/* Header Banner */}
            <div className="bg-[#ff5722] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FaUserPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-extrabold tracking-wide">Assign Lead</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAssignModalLead(null);
                  setAssignmentRemark("");
                  setAssignmentFiles([]);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-base transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* ASSIGN TO RADIO SELECTION */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  ASSIGN TO
                </label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="assignType"
                      value="self"
                      checked={assignType === "self"}
                      onChange={() => {
                        setAssignType("self");
                        setSelectedExecutive("Sales TL (Current User)");
                        setExecutiveBranch("Head Office Main");
                      }}
                      className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722] accent-[#ff5722] cursor-pointer"
                    />
                    <span>Self</span>
                  </label>

                  <label className="flex items-center gap-2 text-sm font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="assignType"
                      value="executive"
                      checked={assignType === "executive"}
                      onChange={() => {
                        setAssignType("executive");
                        const firstExec = salesPersonsList.find(p => p !== "ALL" && !p.includes("Current")) || "Rahul Sharma";
                        setSelectedExecutive(firstExec);
                        setExecutiveBranch(executiveBranchMap[firstExec] || "Noida Branch");
                      }}
                      className="w-4 h-4 text-[#ff5722] focus:ring-[#ff5722] accent-[#ff5722] cursor-pointer"
                    />
                    <span>Executive</span>
                  </label>
                </div>
              </div>

              {/* EXECUTIVE SELECTION & BRANCH AUTO-FILL (Shown when Executive is selected) */}
              {assignType === "executive" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      SELECT SALES EXECUTIVE
                    </label>
                    <select
                      value={selectedExecutive}
                      onChange={(e) => handleExecutiveChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-[#ff5722] shadow-2xs cursor-pointer"
                    >
                      {salesPersonsList.filter(p => p !== "ALL" && !p.includes("Current")).map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      BRANCH (AUTO-FILLED)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={executiveBranch}
                      placeholder="Auto-fills on selection"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 bg-slate-50 italic focus:outline-none cursor-not-allowed shadow-2xs"
                    />
                  </div>
                </div>
              )}

              {/* LEAD PRIORITY */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  LEAD PRIORITY
                </label>
                <select
                  value={leadPriority}
                  onChange={(e) => setLeadPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-orange-300 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-none focus:border-[#ff5722] shadow-2xs cursor-pointer"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              {/* ASSIGNMENT REMARK (COMMENT WITH MEDIA COMPONENT) */}
              <div>
                <CommentWithMedia
                  title="ASSIGNMENT REMARK"
                  placeholder="Write assignment remark here..."
                  value={assignmentRemark}
                  onChange={(val) => setAssignmentRemark(val)}
                  files={assignmentFiles}
                  onFilesChange={(files) => setAssignmentFiles(files)}
                  allowMedia={true}
                />
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAssignModalLead(null);
                  setAssignmentRemark("");
                  setAssignmentFiles([]);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignLeadSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Assign Lead
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= 6. SCHEDULE FOLLOW-UP MODAL ================= */}
      {followupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Schedule Next Follow-up
            </h3>
            <p className="text-xs text-slate-500">
              For: <strong className="text-slate-800">{followupModal.clientName}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(e) => setFollowupDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Call Agenda</label>
                <textarea
                  rows={2}
                  placeholder="Quotation discussion, site survey, demo..."
                  value={followupNotes}
                  onChange={(e) => setFollowupNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFollowupModal(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveFollowup}
                className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Save Followup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 7. BULK STATUS MODAL ================= */}
      {bulkStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              Update Status for {selectedIds.length} Leads
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Select New Status</label>
              <select
                value={bulkNewStatus}
                onChange={(e) => setBulkNewStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white cursor-pointer"
              >
                <option value="Hot">Hot Lead 🔥</option>
                <option value="Warm">Warm Lead ⚡</option>
                <option value="Cold">Cold Lead ❄️</option>
                <option value="New">New ⚪</option>
                <option value="Converted">Converted 🟢</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkStatusModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkStatusApply}
                className="flex-1 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-neutral-800 cursor-pointer"
              >
                Apply Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX ZOOM MODAL */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl p-2 shadow-2xl border border-slate-700 overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 truncate">
                {lightboxImage.title || "Image Preview"}
              </span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <img
              src={lightboxImage.url}
              alt="Full Preview"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getSVGPlaceholder(lightboxImage.title || "Image Attachment");
              }}
              className="max-h-[80vh] w-auto object-contain rounded-lg p-2"
            />
          </div>
        </div>
      )}

      {/* AUDIO PLAYER MODAL */}
      {audioPlayerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn cursor-pointer"
          onClick={() => {
            stopAllAudio();
            setAudioPlayerModal(null);
          }}
        >
          <div
            className="relative max-w-md w-full bg-white rounded-2xl p-5 shadow-2xl border border-slate-100 flex flex-col space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <FaMicrophone className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Audio Note Player
                  </h3>
                  <p className="text-xs text-slate-500 truncate max-w-[220px]">
                    {audioPlayerModal.title || "Voice Recording"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  setAudioPlayerModal(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer text-xs font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Audio Controls Box */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 flex flex-col items-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
                <FaMicrophone className="w-7 h-7" />
              </div>

              {/* Native HTML5 Audio Player with Play, Pause, Seek bar */}
              {audioPlayerModal.url ? (
                <audio
                  controls
                  autoPlay
                  src={audioPlayerModal.url}
                  className="w-full h-10 rounded-lg outline-none"
                  onError={() => {
                    toggleMediaPlay(audioPlayerModal.attId || "modal-synth", audioPlayerModal.url);
                  }}
                />
              ) : (
                /* Fallback Player Button for synth audio notes */
                <div className="w-full space-y-2 text-center">
                  <button
                    type="button"
                    onClick={() => toggleMediaPlay(audioPlayerModal.attId || "modal-synth", audioPlayerModal.url)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                      playingMediaId === (audioPlayerModal.attId || "modal-synth")
                        ? "bg-amber-600 text-white shadow-md animate-pulse"
                        : "bg-amber-500 hover:bg-amber-600 text-white"
                    }`}
                  >
                    {playingMediaId === (audioPlayerModal.attId || "modal-synth") ? (
                      <>
                        <FaPause className="w-4 h-4" /> <span>Pause Audio Note</span>
                      </>
                    ) : (
                      <>
                        <FaPlay className="w-4 h-4" /> <span>Play Audio Note</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  stopAllAudio();
                  setAudioPlayerModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalseTotalLeads;
export { SalseTotalLeads as TotalLeads };