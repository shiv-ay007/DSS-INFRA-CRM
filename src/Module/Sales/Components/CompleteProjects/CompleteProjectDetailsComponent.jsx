import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaTimesCircle,
  FaBuilding,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaRupeeSign,
  FaLayerGroup,
  FaCalendarAlt,
  FaClock,
  FaHeadphones,
  FaImage,
  FaVideo,
  FaFileAlt,
  FaDownload,
  FaExternalLinkAlt,
  FaTrashRestore,
  FaSpinner,
  FaStar,
  FaClipboardList,
  FaCommentDots,
  FaPaperclip,
  FaTimes,
  FaShieldAlt,
  FaHistory
} from "react-icons/fa";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import { getLeadProjectByIdApi, updateLeadProjectApi } from "../../services/leadProject.api";
import { getPresaleByProjectIdApi, reopenPresaleApi } from "../../services/presale.api";
import { getLeadByIdApi } from "../../services/totalLeads.api";
import activeProjectService from "../../services/activeProjectService";
import { useAuth } from "../../../../context/AuthContext";

const CompleteProjectDetailsComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(location.state?.project || null);
  const [presaleData, setPresaleData] = useState(null);
  const [leadProjectData, setLeadProjectData] = useState(null);

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Image Lightbox Modal State
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch full details from backend APIs
  const fetchAllDetails = useCallback(async () => {
    const targetId = id || projectData?.id || projectData?._id;
    if (!targetId) return;

    setLoading(true);
    try {
      // 1. Fetch LeadProject Details
      let lpData = null;
      let rawLeadId = null;
      try {
        const lpRes = await getLeadProjectByIdApi(targetId);
        if (lpRes && (lpRes.data || lpRes.success)) {
          lpData = lpRes.data || lpRes;
          setLeadProjectData(lpData);
          if (typeof lpData.leadId === "string") {
            rawLeadId = lpData.leadId;
          } else if (lpData.leadId?._id) {
            rawLeadId = lpData.leadId._id;
          }
        }
      } catch (lpErr) {
        console.warn("Could not fetch LeadProject:", lpErr.message);
      }

      // 1b. Fetch Lead directly if not populated or missing audit dates
      if (rawLeadId && (!lpData?.leadId || typeof lpData.leadId !== "object" || !lpData.leadId.createdAt)) {
        try {
          const lRes = await getLeadByIdApi(rawLeadId);
          if (lRes && (lRes.data || lRes.success)) {
            const fetchedLead = lRes.data?.lead || lRes.data || lRes;
            setLeadProjectData((prev) => ({
              ...(prev || {}),
              leadId: fetchedLead
            }));
          }
        } catch (lErr) {
          console.warn("Could not fetch direct Lead:", lErr.message);
        }
      }

      // 2. Fetch Presale Details (Contains all discussion remarks, stage remarks, audit trail)
      let psData = null;
      try {
        const psRes = await getPresaleByProjectIdApi(targetId);
        if (psRes && (psRes.data || psRes.success)) {
          psData = psRes.data?.data || psRes.data || psRes;
          setPresaleData(psData);
        }
      } catch (psErr) {
        console.warn("Could not fetch Presale data:", psErr.message);
      }

      // 3. Fallback to active project service if not found in presale
      if (!lpData && !psData) {
        const activeList = activeProjectService.getAllActiveProjects() || [];
        const found = activeList.find((p) => String(p.id || p._id) === String(targetId));
        if (found) {
          setProjectData((prev) => ({ ...prev, ...found, source: "Active Construction" }));
        }
      }
    } catch (err) {
      console.error("Error fetching completed project details:", err);
      toast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [id, projectData?.id, projectData?._id]);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  // Merge Data into a Single Unified Object
  const mergedProject = {
    ...(projectData || {}),
    ...(leadProjectData || {}),
    leadObj: typeof leadProjectData?.leadId === "object" ? leadProjectData.leadId : (typeof projectData?.leadId === "object" ? projectData.leadId : {}),
    presale: presaleData
  };

  const leadObj = mergedProject.leadObj || {};
  const projectName = mergedProject.projectName || leadObj.projectName || mergedProject.workCategory || "Unnamed Project";
  const clientName = mergedProject.clientName || leadObj.clientName || leadObj.concernPersonName || "Client";
  const phoneNumber = mergedProject.phoneNumber || leadObj.phoneNumber || leadObj.phone || leadObj.contact || "--";
  const alternateNumber = mergedProject.alternateNumber || leadObj.alternateNumber || "--";
  const whatsappNumber = mergedProject.whatsappNumber || leadObj.whatsappNumber || phoneNumber || "--";
  const emailAddress = mergedProject.emailAddress || leadObj.emailAddress || leadObj.email || "--";
  const companyName = mergedProject.companyName || leadObj.companyName || "--";
  const clientDesignation = mergedProject.clientDesignation || leadObj.clientDesignation || "Managing Director";
  const clientRating = Number(mergedProject.clientRating || leadObj.clientRating || 4.5);
  const city = mergedProject.city || leadObj.city || "--";
  const state = mergedProject.state || leadObj.state || "--";
  const pincode = mergedProject.pincode || leadObj.pincode || "--";
  const address = mergedProject.address || leadObj.address || [city, state, pincode].filter((x) => x && x !== "--").join(", ") || "--";

  const expectedAmount = Number(mergedProject.expectedBusiness || mergedProject.amount || leadObj.expectedBusiness || leadObj.budget || 0);
  const workType = Array.isArray(mergedProject.workType)
    ? mergedProject.workType.join(", ")
    : (mergedProject.workType || leadObj.workType || "Execution");
  const workCategory = Array.isArray(mergedProject.workCategory)
    ? mergedProject.workCategory.join(", ")
    : (mergedProject.workCategory || mergedProject.businessType || leadObj.workCategory || "Design");
  const priority = String(mergedProject.priority || leadObj.priority || "High");
  const jobType = mergedProject.jobType || leadObj.jobType || "NEW";
  const projectCode = mergedProject.code || mergedProject.projectCode || leadObj.leadId || (id ? `PRJ-${String(id).slice(-4).toUpperCase()}` : "PRJ-CLS");

  // 1. Lead Captured Date & Time ("Kb lead li gyi")
  const leadCapturedRaw =
    leadObj.date ||
    leadObj.createdAt ||
    mergedProject.leadCreatedAt ||
    mergedProject.leadDate ||
    leadProjectData?.createdAt ||
    mergedProject.createdAt;

  const leadCapturedDateObj = leadCapturedRaw ? new Date(leadCapturedRaw) : null;
  const formattedLeadDate = leadCapturedDateObj && !isNaN(leadCapturedDateObj.getTime())
    ? leadCapturedDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "--";
  const formattedLeadTime = leadCapturedDateObj && !isNaN(leadCapturedDateObj.getTime())
    ? leadCapturedDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  const leadTakenBy =
    leadObj.leadBy?.name ||
    leadObj.leadBy?.userName ||
    leadObj.leadByName ||
    leadObj.createdByName ||
    leadObj.creator ||
    mergedProject.leadBy ||
    mergedProject.leadByName ||
    "Sales Team";

  const leadMode = leadObj.leadMode || mergedProject.leadMode || "Direct Lead";

  // 2. Marked Interested Date & Time ("Kb interested hua")
  const interestedTimeline = Array.isArray(leadObj.statusTimeline)
    ? leadObj.statusTimeline.find(
        (item) => String(item.status).toUpperCase() === "INTERESTED"
      )
    : null;

  const interestedRaw =
    leadObj.intrestedFromTableLeadAt ||
    interestedTimeline?.changedAt ||
    leadProjectData?.createdAt ||
    mergedProject.createdAt ||
    presaleData?.createdAt ||
    leadCapturedRaw;

  const interestedDateObj = interestedRaw ? new Date(interestedRaw) : null;
  const formattedInterestedDate = interestedDateObj && !isNaN(interestedDateObj.getTime())
    ? interestedDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "--";
  const formattedInterestedTime = interestedDateObj && !isNaN(interestedDateObj.getTime())
    ? interestedDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  const interestedBy =
    interestedTimeline?.changedBy?.name ||
    interestedTimeline?.changedBy?.userName ||
    leadObj.intrestedFromTableLeadBy?.name ||
    leadObj.intrestedFromTableLeadBy?.userName ||
    mergedProject.projectCoordinatorName ||
    mergedProject.savedByName ||
    mergedProject.activePerson ||
    "Sales Management";

  // 3. Who closed it & When ("Kb close hua")
  const closedBy =
    presaleData?.updatedByName ||
    mergedProject.closedBy ||
    mergedProject.savedByName ||
    mergedProject.activePerson ||
    mergedProject.nextPersonName ||
    mergedProject.projectCoordinatorName ||
    "Admin";

  const closedAtRaw =
    mergedProject.closedAt ||
    presaleData?.updatedAt ||
    mergedProject.closedAtDate ||
    mergedProject.updatedAt ||
    mergedProject.createdAt ||
    new Date();

  const closedAtDateObj = new Date(closedAtRaw);
  const formattedClosedDate = !isNaN(closedAtDateObj.getTime())
    ? closedAtDateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "--";
  const formattedClosedTime = !isNaN(closedAtDateObj.getTime())
    ? closedAtDateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  const closedAtStage = mergedProject.closedAtStage || presaleData?.closedAtStage || 1;
  const closureReason =
    mergedProject.closureReason ||
    presaleData?.closureReason ||
    mergedProject.closureStatus ||
    "Lost — Client Dropped / Budget Mismatch";
  const closureRemark =
    mergedProject.closureRemark ||
    presaleData?.closureRemark ||
    "";

  // Collect All Attached Media Files for Requirement
  const requirementFiles = [];
  if (Array.isArray(mergedProject.projectDetailFiles)) {
    mergedProject.projectDetailFiles.forEach((f) => {
      if (f?.url && !requirementFiles.some((x) => x.url === f.url)) {
        requirementFiles.push({ ...f, fileType: f.fileType || f.type || "image" });
      }
    });
  }
  if (Array.isArray(leadObj.projectDetailFiles)) {
    leadObj.projectDetailFiles.forEach((f) => {
      if (f?.url && !requirementFiles.some((x) => x.url === f.url)) {
        requirementFiles.push({ ...f, fileType: f.fileType || f.type || "image" });
      }
    });
  }

  // Collect All Attached Media Files for Sales Transfer Remarks
  const salesRemarkFiles = [];
  if (Array.isArray(mergedProject.remarksFiles)) {
    mergedProject.remarksFiles.forEach((f) => {
      if (f?.url && !salesRemarkFiles.some((x) => x.url === f.url)) {
        salesRemarkFiles.push({ ...f, fileType: f.fileType || f.type || "image" });
      }
    });
  }
  if (Array.isArray(leadObj.remarksFiles)) {
    leadObj.remarksFiles.forEach((f) => {
      if (f?.url && !salesRemarkFiles.some((x) => x.url === f.url)) {
        salesRemarkFiles.push({ ...f, fileType: f.fileType || f.type || "image" });
      }
    });
  }

  // Collect Closure Media Files (if captured in presale stageHistory)
  const closureFiles = [];
  if (Array.isArray(presaleData?.stageHistory)) {
    presaleData.stageHistory.forEach((hist) => {
      if (hist.action === "closed_here" && Array.isArray(hist.stageSnapshot?.attachments)) {
        hist.stageSnapshot.attachments.forEach((att) => {
          if (att?.url && !closureFiles.some((x) => x.url === att.url)) {
            closureFiles.push(att);
          }
        });
      }
    });
  }

  // Discussion & Stage Remarks History (Strictly unique stage remarks, no duplicate requirement or transfer remark)
  const allRemarksList = [];
  if (Array.isArray(presaleData?.remarks)) {
    presaleData.remarks.forEach((r) => {
      const text = (r.text || r.remark || "").trim();
      if (text && !allRemarksList.some((existing) => existing.text === text)) {
        allRemarksList.push({
          id: r._id || `ps-rem-${Math.random()}`,
          author: r.author || r.userName || "Team Member",
          stageName: r.stageName || (r.stageId ? `Stage ${r.stageId}` : "Presale Discussion"),
          text: text,
          dateTime: r.dateTime || r.createdAt || new Date(),
          attachments: Array.isArray(r.attachments) ? r.attachments : [],
          type: "presale"
        });
      }
    });
  }

  // Sort remarks descending by dateTime
  allRemarksList.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

  // Normalized Requirement & Sales Transfer Notes (Ensures no identical duplicate text)
  const clientRequirementText = (mergedProject.requirement || leadObj.requirement || "").trim();
  const rawTransferRemark = (mergedProject.transferRemark || "").trim();
  const rawLeadRemarks = (leadObj.remarks || "").trim();
  const salesTransferText =
    rawTransferRemark && rawTransferRemark !== clientRequirementText
      ? rawTransferRemark
      : rawLeadRemarks && rawLeadRemarks !== clientRequirementText && rawLeadRemarks !== closureRemark
      ? rawLeadRemarks
      : "";

  // Handle Restore Action
  const handleConfirmRestore = async () => {
    setIsRestoring(true);
    try {
      const targetId = id || mergedProject.id || mergedProject._id;
      if (mergedProject.source === "Presales Pipeline" || presaleData) {
        try {
          await reopenPresaleApi(targetId);
        } catch (apiErr) {
          console.warn("Reopen Presale fallback to direct update:", apiErr);
          await updateLeadProjectApi(targetId, {
            status: "INTERESTED",
            closureStatus: "",
            closureRemark: "",
            isClosed: false,
            isCompleted: false,
            closedAt: null,
            closedAtStage: null
          });
        }
      } else {
        const list = activeProjectService.getAllActiveProjects();
        const updated = list.map((p) =>
          String(p.id) === String(targetId) ? { ...p, projectStatus: "In Progress" } : p
        );
        activeProjectService.saveActiveProjects(updated);
      }
      toast.success("Project successfully restored back to active pipeline! 🚀");
      setIsRestoreModalOpen(false);
      navigate("/sales/complete-projects");
    } catch (err) {
      console.error("Error restoring project:", err);
      toast.error("Failed to restore project.");
    } finally {
      setIsRestoring(false);
    }
  };

  // Helper to Render Media File Card
  const renderMediaCard = (att, idx) => {
    const url = att?.url || att?.preview;
    if (!url) return null;

    const fType = (att.fileType || att.type || "").toLowerCase();
    const isImg = fType === "image" || /\.(png|jpg|jpeg|webp|gif|svg)($|\?)/i.test(url);
    const isAudio = fType === "audio" || /\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i.test(url);
    const isVideo = fType === "video" || /\.(mp4|webm|mov|mkv)($|\?)/i.test(url);

    if (isAudio) {
      return (
        <div key={idx} className="p-3 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 truncate">
            <FaHeadphones className="text-indigo-600 shrink-0 text-sm" />
            <span className="truncate">{att.name || "Voice Note Recording"}</span>
          </div>
          <audio controls className="w-full h-8" src={url}>
            Your browser does not support audio element.
          </audio>
        </div>
      );
    }

    if (isImg) {
      return (
        <div key={idx} className="group relative rounded-xl border border-slate-200 bg-white p-2 shadow-2xs space-y-1.5 overflow-hidden">
          <div
            onClick={() => setPreviewImage(url)}
            className="block overflow-hidden rounded-lg cursor-pointer"
          >
            <img
              src={url}
              alt={att.name || "Image Attachment"}
              className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 px-1">
            <span className="truncate flex items-center gap-1.5">
              <FaImage className="text-indigo-600 shrink-0 text-xs" />
              <span className="truncate">{att.name || "Photo / Drawing"}</span>
            </span>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-800 p-1"
              title="Open full size"
            >
              <FaExternalLinkAlt className="text-[10px]" />
            </a>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
          <video controls className="w-full h-32 rounded-lg object-cover" src={url} />
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-1 truncate">
            <FaVideo className="text-purple-600 shrink-0 text-xs" />
            <span className="truncate">{att.name || "Video"}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 truncate text-xs font-bold text-slate-700">
          <FaFileAlt className="text-indigo-600 shrink-0 text-sm" />
          <span className="truncate">{att.name || "Document / Attachment"}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <FaDownload className="text-[10px]" />
          <span>Open</span>
        </a>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 font-sans">
        <FaSpinner className="animate-spin text-4xl text-rose-600" />
        <p className="text-sm font-semibold text-slate-600">Loading Full Project & Closure Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans pb-16">
      {/* ──────────────────────────────────────────────────────────────────
          1. STICKY TOP PAGE HEADER
      ────────────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title={projectName}
          badge={`CODE: ${projectCode}`}
          badgeColor="bg-rose-100 text-rose-900 border-rose-300 font-mono font-bold"
          description={`Full lifecycle audit, closure metadata, client details, and complete discussion remarks with media files.`}
          showBackButton={true}
          onBackClick={() => navigate("/sales/complete-projects")}
          rightActions={
            <div className="flex items-center gap-2">
              {!isUserObserver && (
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shadow-2xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95"
                  title="Restore Project"
                >
                  <FaTrashRestore className="text-xs" />
                  <span>Restore Project</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/sales/complete-projects")}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Back to List</span>
              </button>
            </div>
          }
        />
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          2. MINIMAL CLOSURE & LIFECYCLE AUDIT CARD ("Kb lead li gyi, kb interested hua, kb close hui")
      ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
        {/* Top Header: Reason, Stage, Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center text-lg shrink-0 mt-0.5">
              <FaTimesCircle />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  Stage {closedAtStage} Closure
                </span>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Archived / Dropped
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {closureReason}
              </h2>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Project Lifecycle
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg inline-block font-mono mt-0.5">
              {projectCode}
            </span>
          </div>
        </div>

        {/* 3-Step Lifecycle Audit Grid: "Kb lead li gyi", "Kb interested hua", "Kb close hui" */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Lead Captured Milestone */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5 transition-all hover:bg-slate-50">
            <div className="flex items-center justify-between min-h-[22px]">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <FaClipboardList className="text-blue-600 text-xs" />
                <span>1. Lead Captured</span>
              </span>
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-slate-800">
              {formattedLeadDate} {formattedLeadTime && `• ${formattedLeadTime}`}
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
              <FaUserTie className="text-[10px] text-slate-400 shrink-0" />
              <span className="truncate">Taken By: <strong className="text-slate-700 font-semibold">{leadTakenBy}</strong></span>
            </div>
          </div>

          {/* 2. Marked Interested Milestone */}
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5 transition-all hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <FaStar className="text-amber-500 text-xs" />
                <span>2. Marked Interested</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Project Created
              </span>
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-slate-800">
              {formattedInterestedDate} {formattedInterestedTime && `• ${formattedInterestedTime}`}
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
              <FaUserTie className="text-[10px] text-slate-400 shrink-0" />
              <span className="truncate">Handled By: <strong className="text-slate-700 font-semibold">{interestedBy}</strong></span>
            </div>
          </div>

          {/* 3. Closed Project Milestone */}
          <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-200/80 space-y-1.5 transition-all hover:bg-rose-50/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <FaTimesCircle className="text-rose-500 text-xs" />
                <span>3. Closed / Dropped</span>
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100/60 border border-rose-200 px-1.5 py-0.5 rounded">
                Stage {closedAtStage}
              </span>
            </div>
            <div className="font-mono font-bold text-xs sm:text-sm text-slate-800">
              {formattedClosedDate} {formattedClosedTime && `• ${formattedClosedTime}`}
            </div>
            <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 truncate">
              <FaUserTie className="text-[10px] text-rose-400 shrink-0" />
              <span className="truncate">Closed By: <strong className="text-slate-700 font-semibold">{closedBy}</strong></span>
            </div>
          </div>
        </div>

        {/* Detailed Closure Remark (Only shown if recorded) */}
        {closureRemark && (
          <div className="bg-rose-50/40 rounded-xl p-3.5 border border-rose-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
              Recorded Closure Remark:
            </span>
            <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line text-slate-800">
              {closureRemark}
            </p>
          </div>
        )}

        {/* Closure Attached Media */}
        {closureFiles.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FaPaperclip className="text-xs text-slate-400" />
              <span>Closure Attachments ({closureFiles.length}):</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {closureFiles.map(renderMediaCard)}
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          3. TWO-COLUMN DETAILS GRID: CLIENT & COMMERCIALS
      ────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: CLIENT & ADDRESS DETAILS (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                <FaUserTie />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Client & Site Information</h3>
                <p className="text-[11px] text-slate-500 font-medium">Contact details and registered site location</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-mono">
              <FaStar className="text-[10px]" />
              <span>{clientRating} / 5</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Concern Person</span>
                <span className="font-bold text-slate-900 text-sm block">{clientName}</span>
                <span className="text-[11px] text-slate-500 font-medium block">{clientDesignation}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Company Name</span>
                <span className="font-bold text-slate-800 text-sm block">{companyName}</span>
                <span className="text-[11px] text-slate-500 font-medium block">Job Type: {jobType}</span>
              </div>
            </div>

            {/* Quick Contact Bar */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex flex-wrap items-center gap-3">
              {phoneNumber && phoneNumber !== "--" && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FaPhoneAlt className="text-blue-600 text-xs" />
                  <a href={`tel:${phoneNumber}`} className="font-mono font-bold text-blue-600 hover:underline">
                    {phoneNumber}
                  </a>
                </div>
              )}
              {alternateNumber && alternateNumber !== "--" && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Alt:</span>
                  <a href={`tel:${alternateNumber}`} className="font-mono font-medium hover:underline text-slate-700">
                    {alternateNumber}
                  </a>
                </div>
              )}
              {whatsappNumber && whatsappNumber !== "--" && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FaWhatsapp className="text-emerald-600 text-sm" />
                  <span className="font-mono font-semibold text-slate-700">{whatsappNumber}</span>
                </div>
              )}
              {emailAddress && emailAddress !== "--" && (
                <div className="flex items-center gap-1.5 text-slate-700">
                  <FaEnvelope className="text-purple-600 text-xs" />
                  <a href={`mailto:${emailAddress}`} className="text-purple-700 hover:underline">
                    {emailAddress}
                  </a>
                </div>
              )}
            </div>

            {/* Site Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-rose-500" />
                <span>Site Address & Location</span>
              </span>
              <p className="text-slate-800 font-medium text-xs leading-relaxed">
                {address}
              </p>
              {(city !== "--" || state !== "--") && (
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>City: <b className="text-slate-700">{city}</b></span>
                  <span>•</span>
                  <span>State: <b className="text-slate-700">{state}</b></span>
                  {pincode !== "--" && (
                    <>
                      <span>•</span>
                      <span>PIN: <b className="font-mono text-slate-700">{pincode}</b></span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: COMMERCIALS & SCOPE (6 COLS) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold">
                <FaRupeeSign />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Commercials & Scope</h3>
                <p className="text-[11px] text-slate-500 font-medium">Deal revenue and work execution categories</p>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              priority.toLowerCase() === "high"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : priority.toLowerCase() === "medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}>
              {priority} Priority
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Revenue Deal Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  Expected Business Deal Value
                </span>
                <span className="text-2xl font-black text-emerald-900 font-mono mt-0.5 block">
                  ₹{expectedAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono font-bold text-xs shadow-xs">
                Archived Value
              </span>
            </div>

            {/* Scope & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 block mb-0.5">Work Type</span>
                <span className="font-extrabold text-indigo-950 text-xs block truncate" title={workType}>
                  {workType}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[11px] font-bold text-indigo-700 block mb-0.5">Work Category</span>
                <span className="font-extrabold text-indigo-950 text-xs block truncate" title={workCategory}>
                  {workCategory}
                </span>
              </div>
            </div>

            {/* Officer Responsible */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Assigned Officer / Coordinator</span>
                <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                  <FaUserTie className="text-slate-500" />
                  <span>{mergedProject.activePerson || mergedProject.projectCoordinatorName || mergedProject.nextPersonName || "Admin"}</span>
                </span>
              </div>
              {mergedProject.designation && (
                <span className="text-[11px] text-slate-500 font-medium bg-white px-2 py-1 rounded-lg border border-slate-200">
                  {mergedProject.designation}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          4. INITIAL REQUIREMENTS & SALES HANDOVER NOTE
      ────────────────────────────────────────────────────────────────── */}
      <div className={salesTransferText || salesRemarkFiles.length > 0 ? "grid grid-cols-1 md:grid-cols-2 gap-5 items-start" : "space-y-4"}>
        {/* CLIENT INBOUND REQUIREMENT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
              <FaClipboardList className="text-indigo-600" />
              <span>Client Inbound Requirement</span>
            </div>
            {requirementFiles.length > 0 && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FaPaperclip className="text-[9px]" />
                <span>{requirementFiles.length} Media</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line min-h-[44px]">
            {clientRequirementText || "No client requirement notes provided."}
          </p>

          {/* Requirement Media Attachments */}
          {requirementFiles.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Requirement Attached Media:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {requirementFiles.map(renderMediaCard)}
              </div>
            </div>
          )}
        </div>

        {/* SALES HANDOVER NOTE (Rendered strictly once, only if distinct from requirement) */}
        {(salesTransferText || salesRemarkFiles.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-xs sm:text-sm">
                <FaCommentDots className="text-amber-600" />
                <span>Sales Handover / Transfer Note</span>
              </div>
              {salesRemarkFiles.length > 0 && (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaPaperclip className="text-[9px]" />
                  <span>{salesRemarkFiles.length} Media</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line min-h-[44px]">
              {salesTransferText || "Handover notes accompanied with attached media."}
            </p>

            {/* Sales Remarks Media Attachments */}
            {salesRemarkFiles.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
                  Handover Attached Media:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {salesRemarkFiles.map(renderMediaCard)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          5. COMPLETE DISCUSSION & STAGE REMARKS TIMELINE ("Sari remarks with media file")
      ────────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-base shadow-2xs">
              <FaHistory />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Complete Discussion & Stage Remarks History
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {allRemarksList.length} {allRemarksList.length === 1 ? "Remark" : "Remarks"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Every discussion note, stage update, and voice note uploaded during project lifecycle
              </p>
            </div>
          </div>
        </div>

        {allRemarksList.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <FaCommentDots className="text-3xl text-slate-300 mx-auto" />
            <p className="text-xs font-semibold">No discussion remarks recorded for this project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allRemarksList.map((rem, idx) => {
              const dateObj = new Date(rem.dateTime || Date.now());
              const formattedDate = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : "--";
              const formattedTime = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                : "";

              const isClosure = rem.type === "closure" || rem.text?.includes("LEAD CLOSED");
              const attachments = Array.isArray(rem.attachments) ? rem.attachments : [];

              return (
                <div
                  key={rem.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isClosure
                      ? "bg-rose-50/70 border-rose-200/90 shadow-2xs"
                      : "bg-slate-50/80 hover:bg-slate-50 border-slate-200/80 shadow-2xs"
                  }`}
                >
                  {/* Top Bar of Remark */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isClosure
                          ? "bg-rose-200 text-rose-800"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {rem.author ? rem.author.charAt(0).toUpperCase() : "U"}
                      </div>
                      <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {rem.author}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isClosure
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      }`}>
                        {rem.stageName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <FaCalendarAlt className="text-[10px] text-slate-400" />
                      <span>{formattedDate}</span>
                      {formattedTime && (
                        <>
                          <span>•</span>
                          <FaClock className="text-[10px] text-slate-400" />
                          <span>{formattedTime}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remark Text Content */}
                  <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                    {rem.text}
                  </p>

                  {/* Media Attachments in this Remark */}
                  {attachments.length > 0 && (
                    <div className="space-y-2 pt-3 mt-3 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <FaPaperclip className="text-[9px]" />
                        <span>Attached Media ({attachments.length}):</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {attachments.map(renderMediaCard)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          6. RESTORE CONFIRMATION MODAL
      ────────────────────────────────────────────────────────────────── */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                <FaTrashRestore />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Restore Project?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  This project will be reopened back to the active Presales pipeline.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Project Name:</span>
                <span className="font-bold text-slate-900">{projectName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Client:</span>
                <span className="font-bold text-slate-900">{clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Value:</span>
                <span className="font-bold font-mono text-emerald-700">
                  ₹{expectedAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Closure Reason:</span>
                <span className="font-semibold text-rose-700 truncate max-w-[200px]">
                  {closureReason}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setIsRestoreModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleConfirmRestore}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <FaTrashRestore className="text-xs" />
                    <span>Confirm Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          7. IMAGE LIGHTBOX MODAL
      ────────────────────────────────────────────────────────────────── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-800 hover:bg-slate-100 flex items-center justify-center font-bold shadow-lg cursor-pointer"
            >
              <FaTimes className="text-xs" />
            </button>
            <img
              src={previewImage}
              alt="Full Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteProjectDetailsComponent;
