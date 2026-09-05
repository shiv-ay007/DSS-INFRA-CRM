import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { availableWorkTypes, workCategoryList, indianStatesList } from "../../data/addLeadData";
import { FaUser, FaRegCheckCircle, FaUsers, FaUserCheck, FaImage, FaVideo, FaMicrophone, FaFileAlt, FaPaperclip, FaTimes, FaDownload, FaPlay, FaPause } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";

import { subscribeToLeadUpdates, updateLeadInStorage, getStoredLeads, removeLeadFromSalesTransfer } from "../../utils/leadStorageUtils";
import { getAllLeadsApi, updateLeadApi } from "../../../../services/totalLeads.api";
import { markLeadAsLossApi, createLossLeadApi } from "../../../../services/lostLeads.api";
import { useLeadContext } from "../../../../context/LeadContext";

const notInterestedReasonsList = [
  "High Price / Budget Out",
  "Already Purchased / Competitor Chosen",
  "Location / Distance Issue",
  "Requirements Mismatch / Not Feasible",
  "Other"
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

  const [leads, setLeads] = useState([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  // Pagination State - Default 10 leads per page
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Sort State
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc"
  });

  // Debounce search term to avoid redundant backend requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { getCachedData, setCachedData, invalidateCache } = useLeadContext();

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
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

  const fetchBackendLeads = useCallback(async (forceRefresh = false) => {
    const cacheKey = `totalLeads_${currentPage}_${rowsPerPage}_${debouncedSearch}_${filterStatus}_${filterLeadMode}_${filterLeadType}_${filterWorkCategory}_${filterCity}_${filterState}_${filterSalesPerson}`;

    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && Array.isArray(cached.data)) {
        setLeads(cached.data);
        if (typeof cached.pagination?.total === "number") {
          setTotalLeadsCount(cached.pagination.total);
        }
        setIsLoading(false);
        return;
      }
    }

    try {
      setIsLoading(true);
      const queryParams = {
        page: currentPage,
        limit: rowsPerPage,
        isLoss: false
      };

      if (debouncedSearch && debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
      if (filterStatus && filterStatus !== "ALL") queryParams.status = filterStatus;
      if (filterLeadMode && filterLeadMode !== "ALL") queryParams.leadMode = filterLeadMode;
      if (filterLeadType && filterLeadType !== "ALL") queryParams.leadType = filterLeadType;
      if (filterWorkCategory && filterWorkCategory !== "ALL") queryParams.workCategory = filterWorkCategory;
      if (filterCity && filterCity !== "ALL") queryParams.city = filterCity;
      if (filterState && filterState !== "ALL") queryParams.state = filterState;
      if (filterSalesPerson && filterSalesPerson !== "ALL") queryParams.salesPerson = filterSalesPerson;

      const res = await getAllLeadsApi(queryParams);
      if (res && res.success && res.data && res.data.leads) {
        const activeLeads = res.data.leads.filter((backendLead) => {
          const isLost =
            backendLead.isLoss === true ||
            ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(backendLead.leadStatus || "").toUpperCase()) ||
            ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(backendLead.status || "").toUpperCase());
          return !isLost;
        });
        const mappedLeads = activeLeads.map((backendLead) => {
          const dateObj = new Date(backendLead.createdAt || Date.now());
          const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
          const formattedTime = backendLead.createdTime || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
          const rawAssignee = backendLead.salesPerson || backendLead.assignTo || (typeof backendLead.assignedTo === 'object' ? backendLead.assignedTo?.name : (backendLead.assignedTo && !String(backendLead.assignedTo).match(/^[0-9a-fA-F]{24}$/) ? backendLead.assignedTo : "")) || "";
          const assignee = String(rawAssignee).replace(" (Current User)", "").replace("(Current User)", "").trim();
          const isAssigned = backendLead.isAssigned === true || (!!assignee && assignee !== "Unassigned" && assignee !== "");

          return {
            ...backendLead,
            id: backendLead.leadId || backendLead._id,
            leadId: backendLead.leadId || backendLead._id,
            _id: backendLead._id,
            clientName: backendLead.clientName || "Client",
            concernPersonName: backendLead.clientName || "Client",
            phoneNumber: backendLead.phoneNumber || backendLead.phone || "--",
            contact: backendLead.phoneNumber || backendLead.phone || "--",
            alternateNumber: backendLead.alternateNumber || "--",
            emailAddress: backendLead.emailAddress || backendLead.email || "--",
            email: backendLead.emailAddress || backendLead.email || "--",
            status: backendLead.leadStatus || backendLead.status || "Warm",
            leadStatus: backendLead.leadStatus || backendLead.status || "Warm",
            leadType: backendLead.leadType || "FRESH",
            leadMode: backendLead.leadMode || backendLead.leadSource || "Business networking",
            leadSource: backendLead.leadMode || backendLead.leadSource || "Business networking",
            workCategory: backendLead.workCategory || "Design",
            workType: Array.isArray(backendLead.workType) ? backendLead.workType : (backendLead.workType ? [backendLead.workType] : ["Concept Drawing"]),
            expectedBusiness: String(backendLead.expectedBusiness || backendLead.budget || 0),
            salesPerson: isAssigned ? assignee : "",
            assignTo: isAssigned ? assignee : "",
            assignedTo: isAssigned ? assignee : "",
            isAssigned: isAssigned,
            date: backendLead.date || formattedDate,
            createdDate: formattedDate,
            createdTime: formattedTime,
            address: backendLead.address || backendLead.siteAddress || "--",
            pincode: backendLead.pincode || "--",
            city: backendLead.city || "--",
            state: backendLead.state || "--",
            googleLocation: backendLead.googleLocation || "",
            projectDetail: backendLead.projectDetail || backendLead.notes || "",
            remark: backendLead.remark || backendLead.requirement || backendLead.notes || "",
            requirement: backendLead.requirement || backendLead.remark || backendLead.notes || "",
            remarkAttachments: backendLead.remarkAttachments || backendLead.attachments || [],
            attachments: backendLead.remarkAttachments || backendLead.attachments || []
          };
        });

        setLeads(mappedLeads);
        const total = (res.data.pagination && typeof res.data.pagination.total === "number")
          ? res.data.pagination.total
          : mappedLeads.length;
        setTotalLeadsCount(total);
        setCachedData(cacheKey, mappedLeads, { total, page: currentPage, limit: rowsPerPage });
      }
    } catch (err) {
      console.warn("Backend API fetch leads warning:", err);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    rowsPerPage,
    debouncedSearch,
    filterStatus,
    filterLeadMode,
    filterLeadType,
    filterWorkCategory,
    filterCity,
    filterState,
    filterSalesPerson,
    getCachedData,
    setCachedData
  ]);

  useEffect(() => {
    fetchBackendLeads();

    const unsubscribe = subscribeToLeadUpdates(() => {
      fetchBackendLeads();
    });
    return () => unsubscribe();
  }, [fetchBackendLeads]);

  const saveLeadsToStorage = (newLeads) => {
    setLeads(newLeads);
  };

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

  // Client Status Modal States (Interested / Not Interested)
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [selectedClientStatus, setSelectedClientStatus] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [customNotInterestedReason, setCustomNotInterestedReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusRemarkAttachments, setStatusRemarkAttachments] = useState([]);

  // Handler to move lead to Lead Management or Lost Leads based on Client Status
  const handleClientStatusSubmit = async () => {
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

    if (selectedClientStatus === "INTERESTED") {
      // 1. Move to Lead Management (STRICTLY NOT SALES MANAGEMENT)
      const leadData = {
        ...statusModalLead,
        leadStatus: "Hot",
        status: "INTERESTED",
        isInterested: true,
        inLeadManagement: true,
        inSalesManagement: false,
        isSalesTransferred: false,
        movedToSalesManagementDate: null,
        followupCount: 0,
        followupRemarksCount: 0,
        followupHistory: [],
        remark: statusRemark || statusModalLead.remark || "",
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        movedToLeadManagementDate: formattedDate,
        movedToLeadManagementTime: formattedTime,
        nextFollowupDate: "",
        nextFollowupTime: "",
        isFollowupScheduled: false,
        isFollowup: false
      };

      try {
        const targetId = statusModalLead._id || statusModalLead.id || statusModalLead.leadId;
        await updateLeadApi(targetId, {
          leadStatus: "Hot",
          status: "INTERESTED",
          isInterested: true,
          inLeadManagement: true,
          inSalesManagement: false,
          isSalesTransferred: false,
          movedToSalesManagementDate: null,
          followupCount: 0,
          followupRemarksCount: 0,
          followupHistory: [],
          isFollowupScheduled: false,
          isFollowup: false,
          nextFollowupDate: null,
          nextFollowupTime: "",
          remark: statusRemark || statusModalLead.remark || ""
        });
      } catch (err) {
        console.error("Error syncing INTERESTED lead to backend:", err);
      }

      removeLeadFromSalesTransfer(targetId);
      updateLeadInStorage(leadData);
      setLeads((prevLeads) =>
        prevLeads.map((l) => (String(l.id) === String(leadData.id) ? leadData : l))
      );
      invalidateCache("totalLeads");
      invalidateCache("leadManagement");
      invalidateCache("leadManagement_sheet_all");
      invalidateCache("sales_management_sheet");
      invalidateCache("sales_management_sheet_all");

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName || statusModalLead.id} marked as INTERESTED and sent to Lead Management! 🎯`);
      setStatusModalLead(null);
      setSelectedClientStatus("");
      setNotInterestedReason("");
      setCustomNotInterestedReason("");
      setStatusRemark("");
      setStatusRemarkAttachments([]);

      navigate("/sales/leads/all", { state: { newInterestedLead: leadData } });
    } else if (selectedClientStatus === "NOT INTERESTED") {
      // 2. Move to Lost Leads
      const lostLeadData = {
        ...statusModalLead,
        leadStatus: "CLOSED_LOST",
        status: "CLOSED_LOST",
        isLoss: true,
        isInterested: false,
        lostReason: finalReason,
        lossReason: finalReason,
        remark: statusRemark || statusModalLead.remark || "",
        lossRemark: statusRemark || statusModalLead.remark || "",
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        lostDate: formattedDate,
        lossDate: new Date(),
        lostTime: formattedTime
      };

      updateLeadInStorage(lostLeadData);
      setLeads((prevLeads) =>
        prevLeads.map((l) => (String(l.id) === String(lostLeadData.id) ? lostLeadData : l))
      );
      invalidateCache("totalLeads");
      invalidateCache("lostLeads");

      try {
        const targetId = statusModalLead._id || statusModalLead.id || statusModalLead.leadId;
        const lossPayload = {
          leadId: targetId,
          clientName: statusModalLead.clientName || statusModalLead.concernPersonName,
          phoneNumber: statusModalLead.phoneNumber || statusModalLead.contact,
          phone: statusModalLead.phoneNumber || statusModalLead.contact,
          emailAddress: statusModalLead.emailAddress || statusModalLead.email,
          email: statusModalLead.emailAddress || statusModalLead.email,
          workCategory: statusModalLead.workCategory,
          workType: statusModalLead.workType,
          expectedBusiness: statusModalLead.expectedBusiness,
          lossReason: finalReason,
          reason: finalReason,
          lossRemark: statusRemark || statusModalLead.remark || "",
          remark: statusRemark || statusModalLead.remark || "",
          salesPerson: "Admin",
          assignTo: "Admin",
          assignedTo: null
        };

        if (targetId) {
          await markLeadAsLossApi(targetId, lossPayload);
        } else {
          await createLossLeadApi(lossPayload);
        }
      } catch (e) {
        console.error("Error saving to lost leads:", e);
      }

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName || statusModalLead.id} marked as NOT INTERESTED (${finalReason}) and moved to Lost Leads! 📌`);
      setStatusModalLead(null);
      setSelectedClientStatus("");
      setNotInterestedReason("");
      setCustomNotInterestedReason("");
      setStatusRemark("");
      setStatusRemarkAttachments([]);

      navigate("/sales/leads/lost", { state: { lostLead: lostLeadData } });
    }
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
              onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row, from: "totalLeads", allowEdit: true } })}
              className="w-7 h-7 rounded-lg border border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 hover:border-orange-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              title="View Lead Details"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>

            {/* Client Status (Interested / Not Interested) Button */}
            <button
              type="button"
              onClick={() => {
                setStatusModalLead(row);
                setSelectedClientStatus(row.isInterested ? "INTERESTED" : "");
                setNotInterestedReason("");
                setCustomNotInterestedReason("");
                setStatusRemark(row.remark || "");
                setStatusRemarkAttachments([]);
              }}
              className="w-7 h-7 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Client Status (Interested / Not Interested)"
            >
              <FaRegCheckCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
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
            {/* Line 1: Client Name (Highlighted with color badge) */}
            <div className="mb-0.5">
              <span
                className="font-extrabold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 shadow-2xs inline-block truncate max-w-full text-xs cursor-pointer hover:text-blue-600"
                title={name}
                onClick={() => row.id && navigate(`/sales/leads/details/${row.id}`, { state: { lead: row, from: "totalLeads", allowEdit: true } })}
              >
                {name}
              </span>
            </div>

            {/* Line 2: Contact Number (Clickable) */}
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
      align: "center",
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
      align: "center",
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
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.leadMode || row.leadSource || "Business networking"}
        </span>
      )
    },
    workCategory: {
      label: "WORK CATEGORY",
      align: "center",
      render: (val, row) => (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {row.workCategory || "Design"}
        </span>
      )
    },
    workType: {
      label: "WORK TYPE",
      align: "center",
      render: (val, row) => {
        const wt = Array.isArray(row.workType)
          ? row.workType.join(", ")
          : (row.workType || "Concept Drawing");
        return (
          <div className="max-w-[140px] truncate text-xs font-medium text-slate-700 mx-auto text-center" title={wt}>
            {wt}
          </div>
        );
      }
    },
    alternateNumber: {
      label: "ALTERNATE NUMBER",
      align: "center",
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
      align: "center",
      render: (val, row) => {
        const addr = row.address || row.siteAddress || "--";
        return (
          <div className="max-w-[140px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={addr}>
            {addr}
          </div>
        );
      }
    },
    pincode: {
      label: "PINCODE",
      align: "center",
      render: (val, row) => (
        <span className="font-mono text-xs text-slate-700 font-bold">
          {row.pincode || "--"}
        </span>
      )
    },
    city: {
      label: "CITY",
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.city || "--"}
        </span>
      )
    },
    state: {
      label: "STATE",
      align: "center",
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.state || "--"}
        </span>
      )
    },
    expectedBusiness: {
      label: "EXPECTED BUSINESS (₹)",
      align: "center",
      render: (val, row) => {
        const amt = Number(row.expectedBusiness || row.expectedRevenue || 0);
        return (
          <span className="text-xs font-mono font-bold text-slate-900">
            ₹{amt.toLocaleString('en-IN')}
          </span>
        );
      }
    },
    projectDetail: {
      label: "PROJECT DETAIL",
      align: "center",
      render: (val, row) => {
        const pd = row.projectDetail || row.projectDetails || "--";
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={pd}>
            {pd}
          </div>
        );
      }
    },
    remark: {
      label: "REMARK",
      align: "center",
      render: (val, row) => {
        const rem = row.remark || row.requirement || "--";
        const attachments = row.remarkAttachments || row.attachments || [];

        return (
          <div className="flex items-center justify-center gap-1.5 max-w-[200px] mx-auto text-center">
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
  }), [currentPage, rowsPerPage]);

  // Filter & Search Logic
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const isLost =
        item.isLoss === true ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(item.leadStatus || "").toUpperCase()) ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(item.status || "").toUpperCase());
      if (isLost) return false;

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

      return matchSearch && matchLeadMode && matchLeadType && matchWorkCategory && matchWorkType && matchStatus && matchSalesPerson && matchCity && matchState && matchDate;
    });
  }, [leads, searchTerm, filterLeadMode, filterLeadType, filterWorkCategory, filterWorkType, filterStatus, filterSalesPerson, filterCity, filterState, filterDateFrom, filterDateTo]);

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
  const totalItemsCount = totalLeadsCount > 0 ? totalLeadsCount : sortedLeads.length;
  const totalPages = Math.ceil(totalItemsCount / rowsPerPage) || 1;
  const paginatedLeads = useMemo(() => {
    if (sortedLeads.length <= rowsPerPage) {
      return sortedLeads;
    }
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
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Total Leads Directory"
          badge="Master Directory"
          badgeColor="bg-blue-100 text-blue-800 border-blue-300"
          description={`Showing ${paginatedLeads.length} of ${totalItemsCount} registered pipeline leads`}
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

              <button
                type="button"
                onClick={() => navigate("/sales/leads/add")}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Add Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                  showFilters
                    ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                    : "bg-[#FF5722] hover:bg-[#F4511E] border-[#FF5722] text-white shadow-xs"
                }`}
                title="Toggle Filters"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          }
        />
      </div>

      {/* COLLAPSIBLE FILTER PANEL (Opens on click) */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5 transition-all">
          {/* Top Search, Show Dropdown & Status Tabs */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3.5">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
              {/* Rows Per Page Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-600">Show:</span>
                <div className="relative w-20">
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-slate-800 focus:outline-hidden focus:border-black cursor-pointer pr-6 shadow-2xs"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Real-time Search */}
              <div className="relative flex-1 min-w-[220px] max-w-md">
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
        totalItems={totalItemsCount}
        itemsPerPage={rowsPerPage}
        isLoading={isLoading}
        onPageChange={(page) => setCurrentPage(page)}
        onItemsPerPageChange={(limit) => {
          setRowsPerPage(limit);
          setCurrentPage(1);
        }}
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

      {/* ================= CLIENT STATUS (INTERESTED / NOT INTERESTED) MODAL ================= */}
      {statusModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-slate-900">Lead Status</h3>
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
                {/* Reason Dropdown */}
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

                {/* Remarks Field with Media Attachments */}
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
                onClick={handleClientStatusSubmit}
                className="px-6 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white text-sm font-extrabold shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                Submit
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