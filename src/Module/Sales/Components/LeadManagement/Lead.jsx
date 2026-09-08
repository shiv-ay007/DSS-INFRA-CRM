import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { FaUser, FaImage, FaPlay, FaFileAlt } from "react-icons/fa";
import { getAllLeadsApi, updateLeadApi, markInterestedFromTableApi } from "../../services/totalLeads.api";
import { getAllFollowupsApi, addFollowupApi, addLeadFollowupApi } from "../../services/followup.api";
import {
  useLeadContext,
  subscribeToLeadUpdates,
  updateLeadInStorage,
  notifyLeadChange,
  markLeadAsTransferredToSales,
  isLeadTransferredToSales
} from "../../../../context/LeadContext";
import LeadKpiSlider from "./LeadKpiSlider";
import DateTimePicker from "../Common/DateTimePicker";
import { useAuth } from "../../../../context/AuthContext";

const notInterestedReasonsList = [
  "High Price / Budget Out",
  "Already Purchased / Competitor Chosen",
  "Location / Distance Issue",
  "Requirements Mismatch / Not Feasible",
  "Other"
];

// Helper to format currency
const formatLakhs = (val) => {
  const num = Number(val) || 0;
  return `₹${(num / 100000).toFixed(2)}L`;
};

// Helper: Extract timestamp for sorting
const getLeadTime = (lead) => {
  if (!lead) return 0;
  if (lead.createdAt) {
    const t = new Date(lead.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (lead.updatedAt) {
    const t = new Date(lead.updatedAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (lead._id && String(lead._id).length === 24) {
    const t = parseInt(String(lead._id).substring(0, 8), 16) * 1000;
    if (!isNaN(t)) return t;
  }
  if (lead.createdDate) {
    const t = new Date(lead.createdDate).getTime();
    if (!isNaN(t)) return t;
  }
  if (lead.date) {
    const t = new Date(lead.date).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
};

const Lead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const loggedInUserName = user?.name || "";
  const loggedInDepartment = useMemo(() => {
    const deptObj = user?.departments || user?.department;
    if (typeof deptObj === "object" && deptObj?.name) return deptObj.name;
    if (typeof deptObj === "string" && deptObj.trim()) return deptObj;
    return "Sales";
  }, [user]);

  // Leads state fetched directly from backend API
  const [leads, setLeads] = useState(() => {
    if (location.state?.newInterestedLead) {
      return [location.state.newInterestedLead];
    }
    return [];
  });
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const { getCachedData, setCachedData, invalidateCache } = useLeadContext();

  const fetchBackendLeads = async (forceRefresh = false) => {
    const cacheKey = "leadManagement_sheet_all";
    if (!forceRefresh) {
      const cached = getCachedData(cacheKey);
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        setLeads(cached.data);
        return;
      }
    }

    try {
      const [resLeads, resFollowups] = await Promise.allSettled([
        getAllLeadsApi({ limit: 100 }),
        getAllFollowupsApi({ limit: 50 })
      ]);

      const leadsList = (resLeads.status === "fulfilled" && resLeads.value?.success && resLeads.value?.data?.leads)
        ? resLeads.value.data.leads
        : [];

      const followupsList = (resFollowups.status === "fulfilled" && resFollowups.value?.success && resFollowups.value?.data?.followups)
        ? resFollowups.value.data.followups
        : [];

      const followupMap = new Map();
      followupsList.forEach((f) => {
        const leadObj = f.lead || {};
        const idKey = String(leadObj._id || leadObj.leadId || f.leadId || f._id);
        if (!followupMap.has(idKey)) followupMap.set(idKey, []);
        followupMap.get(idKey).push(f);
      });

      if (leadsList.length > 0) {
        const activeBackendLeads = leadsList
          .filter((l) => {
            const isLost =
              l.isLoss === true ||
              l.intrestedStatus === "Not Intersted" ||
              ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(l.leadStatus || "").toUpperCase()) ||
              ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(l.status || "").toUpperCase());
            if (isLost) return false;

            // Leads already moved to Sales Management Sheet should NOT appear in Lead Management!
            if (isLeadTransferredToSales(l)) return false;

            // Only show leads that belong in Lead Management Sheet:
            // 1. Marked INTERESTED (sent from Total Leads or call status)
            // 2. OR Have an active follow-up scheduled or followup history
            // 3. OR explicitly assigned to Lead Management
            const isInterested =
              l.isInterested === true ||
              l.intrestedFromTableLead === true ||
              l.intrestedStatus === "Intrested" ||
              String(l.status || "").toUpperCase() === "INTERESTED" ||
              String(l.leadStatus || "").toUpperCase() === "INTERESTED";

            const hasFollowup =
              (Array.isArray(l.followups) && l.followups.length > 0) ||
              (l.isFollowupScheduled === true || l.isFollowup === true) &&
              ((Array.isArray(l.followupHistory) && l.followupHistory.length > 0) ||
                Number(l.followupRemarksCount) > 0 ||
                (l.nextFollowupDate && l.nextFollowupDate !== "--" && l.nextFollowupDate !== "Invalid Date" && l.nextFollowupDate !== ""));

            return isInterested || hasFollowup || l.inLeadManagement === true;
          })
          .map((backendLead) => {
            const idKey = String(backendLead._id || backendLead.leadId || backendLead.id);
            const extraFollowups = followupMap.get(idKey) || [];

            const dateObj = new Date(backendLead.createdAt || Date.now());
            const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
            const assignee = backendLead.salesPerson || (typeof backendLead.assignedTo === 'object' ? backendLead.assignedTo?.name : backendLead.assignedTo) || backendLead.assignTo || "--";
            const formattedTime = backendLead.createdTime || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            // 1. Map NEW SCHEMA followups array
            const schemaFollowups = Array.isArray(backendLead.followups) ? backendLead.followups : [];
            const mappedSchemaFollowups = schemaFollowups.map((f) => {
              const dt = f.dateTime ? new Date(f.dateTime) : (f.createdAt ? new Date(f.createdAt) : null);
              const fDate = dt && !isNaN(dt.getTime())
                ? dt.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
                : "--";
              const fTime = dt && !isNaN(dt.getTime())
                ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                : "10:00 am";
              const creatorObj = typeof f.createdBy === "object" ? f.createdBy : null;
              const creatorName = creatorObj?.name;
              const creatorDept = (typeof creatorObj?.departments === "object" ? creatorObj.departments?.name : null) ||
                (typeof creatorObj?.department === "object" ? creatorObj.department?.name : null) ||
                creatorObj?.departments ||
                creatorObj?.department;
              const creatorRole = creatorObj?.role;

              const cleanAssignee = (assignee && assignee !== "--") ? assignee : "";
              const repName = creatorName || cleanAssignee || (typeof backendLead.leadBy === 'object' ? backendLead.leadBy?.name : null) || loggedInUserName || "";
              const repDept = creatorDept || loggedInDepartment || "Sales";

              return {
                _id: f._id,
                date: fDate,
                time: fTime,
                rawDate: f.dateTime,
                type: f.type || "Call",
                discussionType: f.type || "Call",
                status: f.type || "Call",
                rep: repName,
                repDesignation: creatorRole || user?.role || "",
                department: repDept,
                talkToPerson: f.talkToPerson || backendLead.clientName || "--",
                personDesignation: f.personDesignation || "--",
                discussionWithClient: f.currentDiscussion?.discussion || f.followupRemark?.remarks || "--",
                notes: f.currentDiscussion?.discussion || f.followupRemark?.remarks || "--",
                nextDiscussionTopic: f.nextDiscussion?.nextDiscussion || "--",
                rating: f.rating !== undefined ? f.rating : 4,
                matrix: f.matrix || {},
                followupRemark: f.followupRemark?.remarks || "",
                attachments: {
                  current: f.currentDiscussion?.files || [],
                  next: f.nextDiscussion?.files || [],
                  remarks: f.followupRemark?.files || []
                }
              };
            });

            // 2. Combine with any legacy followupHistory
            const legacyHistory = Array.isArray(backendLead.followupHistory) ? backendLead.followupHistory : [];
            const combinedHistory = [...mappedSchemaFollowups, ...legacyHistory];

            const count = Math.max(schemaFollowups.length, combinedHistory.length, extraFollowups.length, Number(backendLead.followupRemarksCount) || 0);

            // Latest Scheduled Date from new schema or fallback
            const latestFollowup = schemaFollowups[0];
            const rawNextDate = latestFollowup?.dateTime || backendLead.nextFollowupDate || (extraFollowups.length > 0 ? extraFollowups[0].scheduledDate : null);
            let formattedNextDate = "";
            let nextTime = "10:00 am";
            if (rawNextDate && rawNextDate !== "--" && rawNextDate !== "Completed" && rawNextDate !== "Invalid Date") {
              try {
                const d = new Date(rawNextDate);
                if (!isNaN(d.getTime())) {
                  formattedNextDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                  nextTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                } else {
                  formattedNextDate = String(rawNextDate);
                }
              } catch (e) {
                formattedNextDate = String(rawNextDate);
              }
            }
            if (backendLead.nextFollowupTime) nextTime = backendLead.nextFollowupTime;

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
              leadMode: backendLead.leadMode || backendLead.leadSource || "Business networking",
              workCategory: backendLead.workCategory || "Design",
              workType: Array.isArray(backendLead.workType) ? backendLead.workType : (backendLead.workType ? [backendLead.workType] : ["Concept Drawing"]),
              expectedBusiness: String(backendLead.expectedBusiness || backendLead.budget || 0),
              salesPerson: assignee,
              assignTo: assignee,
              assignedTo: assignee,
              date: backendLead.date || formattedDate,
              createdDate: formattedDate,
              createdTime: formattedTime,
              address: backendLead.address || "--",
              pincode: backendLead.pincode || "--",
              city: backendLead.city || "--",
              state: backendLead.state || "--",
              projectDetail: backendLead.projectDetail || backendLead.notes || "",
              remarks: backendLead.remarks || backendLead.remark || "",
              remark: backendLead.remarks || backendLead.remark || backendLead.requirement || backendLead.notes || "",
              requirement: backendLead.requirement || backendLead.remarks || backendLead.remark || backendLead.notes || "",
              remarksFile: backendLead.remarksFile || "",
              remarksFiles: backendLead.remarksFiles || [],
              statusTimeline: backendLead.statusTimeline || [],
              remarkAttachments: (Array.isArray(backendLead.remarksFiles) && backendLead.remarksFiles.length > 0) ? backendLead.remarksFiles : (backendLead.remarkAttachments || []),
              attachments: (Array.isArray(backendLead.remarksFiles) && backendLead.remarksFiles.length > 0) ? backendLead.remarksFiles : (backendLead.attachments || []),
              followupHistory: combinedHistory,
              followupCount: count,
              followupRemarksCount: count,
              nextFollowupDate: count > 0 ? (formattedNextDate || "") : "",
              nextFollowupDateRaw: count > 0 ? (backendLead.nextFollowupDateRaw || rawNextDate || "") : "",
              nextFollowupTime: count > 0 ? nextTime : "",
              followupTime: count > 0 ? nextTime : "",
              isFollowupScheduled: count > 0,
              isFollowup: count > 0
            };
          });

        const newInterestedLead = location.state?.newInterestedLead;
        let allActiveLeads = activeBackendLeads;
        if (newInterestedLead) {
          const incId = newInterestedLead.leadId || newInterestedLead.clientId || newInterestedLead.id || newInterestedLead._id;
          const exists = activeBackendLeads.some(
            (l) => (l._id && l._id === incId) || (l.id && l.id === incId) || (l.leadId && l.leadId === incId)
          );
          if (!exists) {
            allActiveLeads = [newInterestedLead, ...activeBackendLeads];
          }
        }

        const sortedLeads = allActiveLeads.sort((a, b) => getLeadTime(b) - getLeadTime(a));
        setLeads(sortedLeads);
        setCachedData(cacheKey, sortedLeads);
      }
    } catch (err) {
      console.error("Error fetching leads for Lead Management Sheet:", err);
    }
  };

  useEffect(() => {
    const handleRefresh = () => {
      fetchBackendLeads(true);
    };
    const unsubscribe = subscribeToLeadUpdates(handleRefresh);
    fetchBackendLeads();

    return () => unsubscribe();
  }, []);

  const saveLeads = (newLeads) => {
    setLeads(newLeads);
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
        const actionButtons = [
          {
            key: "view",
            title: "View Lead Details",
            disabled: false,
            onClick: () => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row, from: "leadManagement", allowEdit: false } }),
            activeColor: "border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 hover:border-orange-300",
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ),
          },
          {
            key: "schedule",
            title: isUserObserver ? "Disabled for Observer (View Only)" : "Schedule / Reschedule Follow-up",
            disabled: isUserObserver,
            onClick: isUserObserver ? () => toast.info("Observer Mode: Scheduling follow-up is disabled.") : () => handleOpenScheduleModal(row),
            activeColor: "border-blue-200 bg-blue-50/70 text-blue-600 hover:bg-blue-100 hover:border-blue-300",
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            key: "status",
            title: isUserObserver ? "Disabled for Observer (View Only)" : "Client Status (Interested / Not Interested)",
            disabled: isUserObserver,
            onClick: isUserObserver
              ? () => toast.info("Observer Mode: Status update is disabled.")
              : () => {
                  setStatusModalLead(row);
                  setSelectedClientStatus("");
                  setNotInterestedReason("");
                  setCustomNotInterestedReason("");
                  setStatusRemark("");
                  setStatusRemarkAttachments([]);
                },
            activeColor: "border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300",
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
          {
            key: "remarks",
            title: "View Follow-up Remarks & History",
            disabled: false,
            onClick: () => setRemarksModalLead(row),
            activeColor: "border-purple-200 bg-purple-50/70 text-purple-600 hover:bg-purple-100 hover:border-purple-300",
            icon: (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ];

        return (
          <div className="grid grid-cols-2 gap-1.5 w-14 mx-auto">
            {actionButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                disabled={btn.disabled}
                onClick={btn.onClick}
                title={btn.title}
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shadow-2xs ${
                  btn.disabled
                    ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                    : `${btn.activeColor} cursor-pointer active:scale-95`
                }`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        );
      },
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
                onClick={() => row.id && navigate(`/sales/leads/details/${row.id}`, { state: { lead: row, from: "leadManagement", allowEdit: false } })}
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
    followupRemarks: {
      label: "FOLLOW-UP REMARK",
      align: "center",
      render: (val, row) => {
        const historyCount = Array.isArray(row.followupHistory) ? row.followupHistory.length : 0;
        const remarksCount = Number(row.followupRemarksCount) || Number(row.followupCount) || 0;
        const count = Math.max(historyCount, remarksCount, row.isFollowupScheduled === true ? 1 : 0);

        return (
          <button
            type="button"
            onClick={() => setFollowupDetailsModalLead(row)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
              count > 0
                ? "bg-blue-50/90 text-blue-600 border border-blue-200 hover:bg-blue-100"
                : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
            }`}
          >
            {count} Follow-up{count !== 1 ? "s" : ""}
          </button>
        );
      }
    },
    nextFollowup: {
      label: "NEXT FOLLOW-UP",
      align: "center",
      render: (val, row) => {
        const historyCount = Array.isArray(row.followupHistory) ? row.followupHistory.length : 0;
        const remarksCount = Number(row.followupRemarksCount) || Number(row.followupCount) || 0;
        const count = Math.max(historyCount, remarksCount, row.isFollowupScheduled === true ? 1 : 0);
        const rawNextDate = row.nextFollowupDate || row.nextFollowup;
        const hasValidDate = !!(rawNextDate && rawNextDate !== "--" && rawNextDate !== "Completed" && rawNextDate !== "Invalid Date");

        if (count === 0 || !hasValidDate) {
          return <span className="text-slate-400 font-medium text-xs">--</span>;
        }

        let displayDate = rawNextDate;
        if (rawNextDate && (rawNextDate.includes("T") || rawNextDate.includes("-") || rawNextDate.includes("/"))) {
          try {
            const d = new Date(rawNextDate);
            if (!isNaN(d.getTime())) {
              displayDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
            }
          } catch (e) {}
        }
        const nextTime = row.nextFollowupTime || row.followupTime || "10:00 am";

        return (
          <div className="inline-flex flex-col items-center px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200/90 shadow-2xs">
            <span className="font-extrabold text-xs text-rose-600 whitespace-nowrap">{displayDate}</span>
            {nextTime && (
              <span className="font-mono text-[10px] font-bold text-slate-600 whitespace-nowrap">{nextTime}</span>
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
        const rem = row.remarks || row.remark || row.requirement || "--";
        const attachments = [];
        if (Array.isArray(row.remarksFiles)) {
          row.remarksFiles.forEach((f) => {
            const url = f?.url || f?.preview;
            if (url && !attachments.some((x) => (x.url || x.preview) === url)) {
              attachments.push({ ...f, type: f.fileType || f.type || "image" });
            }
          });
        }
        if (Array.isArray(row.remarkAttachments)) {
          row.remarkAttachments.forEach((att) => {
            const url = att?.url || att?.preview;
            if (url && !attachments.some((x) => (x.url || x.preview) === url)) {
              attachments.push({ ...att, type: att.type || att.fileType || "image" });
            }
          });
        }
        if (Array.isArray(row.attachments)) {
          row.attachments.forEach((att) => {
            const url = att?.url || att?.preview;
            if (url && !attachments.some((x) => (x.url || x.preview) === url)) {
              attachments.push({ ...att, type: att.type || att.fileType || "image" });
            }
          });
        }
        if (row.remarksFile && typeof row.remarksFile === "string" && !attachments.some((x) => x.url === row.remarksFile)) {
          attachments.push({ url: row.remarksFile, type: "image", name: "Attachment" });
        }

        return (
          <div className="flex items-center justify-center gap-1.5 max-w-[200px] mx-auto text-center">
            <div className="truncate text-xs text-slate-700 font-medium flex-1" title={rem}>
              {rem}
            </div>
            {attachments.length > 0 && (
              <div className="flex items-center gap-1 shrink-0">
                {attachments.map((att, idx) => {
                  const url = att.url || att.preview || "";
                  const type = (att.fileType || att.type || "").toLowerCase();
                  const isAudio = type === "audio" || /\.(mp3|wav|m4a|aac|ogg|webm)(\?.*)?$/i.test(url);
                  const isImage = type === "image" || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url);

                  if (isImage) {
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded-md border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                        title={att.name || "View Image"}
                      >
                        <FaImage className="w-3 h-3 text-emerald-600" />
                      </a>
                    );
                  }

                  if (isAudio) {
                    return (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 flex items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
                        title={att.name || "Play Audio"}
                      >
                        <FaPlay className="w-2.5 h-2.5 text-amber-700" />
                      </a>
                    );
                  }

                  return (
                    <a
                      key={idx}
                      href={url}
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
  }), [currentPage, rowsPerPage, navigate, isUserObserver]);

  // Modals
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [remarksModalLead, setRemarksModalLead] = useState(null);
  const [followupDetailsModalLead, setFollowupDetailsModalLead] = useState(null);

  // Client Status Modal States
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [selectedClientStatus, setSelectedClientStatus] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [customNotInterestedReason, setCustomNotInterestedReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusRemarkAttachments, setStatusRemarkAttachments] = useState([]);

  // Helper to render media files / audio player / image attachments
  const renderMediaFiles = (files) => {
    const list = Array.isArray(files) ? files : (files && typeof files === "object" && files.url ? [files] : []);
    const validFiles = list.filter((f) => f && (f.url || typeof f === "string"));
    if (validFiles.length === 0) return null;

    return (
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {validFiles.map((file, fIdx) => {
          const url = file.url || (typeof file === "string" ? file : "");
          if (!url) return null;
          const name = file.name || (url.startsWith("http") ? url.split("/").pop() : `Attachment ${fIdx + 1}`);
          const type = (file.fileType || file.type || "").toLowerCase();
          const isAudio = type === "audio" || /\.(mp3|wav|m4a|aac|ogg|webm)(\?.*)?$/i.test(url) || /\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(name);
          const isImage = type === "image" || /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url) || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(name);

          if (isAudio) {
            return (
              <div key={fIdx} className="w-full sm:w-auto min-w-[260px] bg-purple-50/80 border border-purple-200 rounded-xl p-2.5 shadow-2xs space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900 truncate">
                  <span>🎙️</span>
                  <span className="truncate">{name}</span>
                </div>
                <audio controls src={url} className="w-full h-8 max-w-[280px]" preload="metadata" />
              </div>
            );
          }

          if (isImage) {
            return (
              <a
                key={fIdx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs hover:border-blue-400 transition-all shrink-0"
                title={`View ${name}`}
              >
                <img src={url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                  View
                </div>
              </a>
            );
          }

          return (
            <a
              key={fIdx}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors shrink-0"
              title={name}
            >
              <span>📎</span>
              <span className="truncate max-w-[150px]">{name}</span>
            </a>
          );
        })}
      </div>
    );
  };

  // Handler to move lead to Lost Leads or open pre-filled Sales Transfer Form
  const handleSendToSalesManagement = async () => {
    if (!statusModalLead) return;
    if (isStatusSubmitting) return;
    if (isUserObserver) {
      toast.info("Observer Mode: Status update is disabled.");
      return;
    }

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

    setIsStatusSubmitting(true);
    try {
      const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const finalReason = notInterestedReason === "Other" ? customNotInterestedReason.trim() : notInterestedReason;

    const rawUploadFiles = (statusRemarkAttachments || [])
      .map((att) => att.file || att.blob || (att instanceof File || att instanceof Blob ? att : null))
      .filter(Boolean);

    const processedAttachments = (statusRemarkAttachments || []).map((item) => ({
      id: item.id || `att-${Date.now()}-${Math.random()}`,
      name: item.name || item.file?.name || "Attachment",
      type: item.type || "file",
      url: item.preview || item.url || ""
    }));

    if (selectedClientStatus === "INTERESTED") {
      const targetId = statusModalLead._id || statusModalLead.id || statusModalLead.leadId;
      const finalRemark = statusRemark || statusModalLead.remark || "";
      const finalLeadData = {
        ...statusModalLead,
        status: "INTERESTED",
        leadStatus: "INTERESTED",
        isInterested: true,
        inSalesManagement: true,
        isSalesTransferred: true,
        isLoss: false,
        remark: finalRemark,
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        movedToSalesManagementDate: new Date(),
        updatedAt: new Date().toISOString()
      };

      // 1. Sync to backend MongoDB & Cloudinary
      try {
        if (targetId) {
          const updateRes = await updateLeadApi(
            targetId,
            {
              status: "INTERESTED",
              leadStatus: "INTERESTED",
              isInterested: true,
              inSalesManagement: true,
              isSalesTransferred: true,
              isLoss: false,
              remark: finalRemark,
              movedToSalesManagementDate: new Date()
            },
            rawUploadFiles
          );
          if (updateRes && (updateRes.data || updateRes.remarksFiles)) {
            const updatedBLead = updateRes.data || updateRes;
            if (updatedBLead.remarksFiles && updatedBLead.remarksFiles.length > 0) {
              finalLeadData.remarksFiles = updatedBLead.remarksFiles;
              finalLeadData.remarkAttachments = updatedBLead.remarksFiles;
              finalLeadData.attachments = updatedBLead.remarksFiles;
            }
          }
        }
      } catch (apiErr) {
        console.error("Error updating lead status in MongoDB:", apiErr);
      }

      // 2. Invalidate cache across all scopes
      invalidateCache("sales_management_sheet");
      invalidateCache("sales_management_sheet_all");
      invalidateCache("leadManagement");
      invalidateCache("leadManagement_sheet_all");

      // 3. Remove from active in-memory list in Lead Management Sheet (since it has moved to Sales Management)
      setLeads((prev) =>
        prev.filter((l) =>
          l._id !== targetId && l.id !== targetId && l.leadId !== targetId
        )
      );

      // 4. Update storage & broadcast event to all listeners
      markLeadAsTransferredToSales(targetId);
      updateLeadInStorage(finalLeadData);
      notifyLeadChange(finalLeadData);

      toast.success(`Lead marked as INTERESTED & moved to Sales Management Sheet! 🚀`);

      const leadToTransfer = { ...statusModalLead, ...finalLeadData };

      // Reset status modal state
      setStatusModalLead(null);
      setSelectedClientStatus("");
      setNotInterestedReason("");
      setCustomNotInterestedReason("");
      setStatusRemark("");
      setStatusRemarkAttachments([]);

      // 5. Navigate directly to dedicated Sales Form Page
      navigate(`/sales/leads/sales-form/${targetId}`, {
        state: { lead: leadToTransfer, initialRemark: finalRemark }
      });
      return;
    } else if (selectedClientStatus === "NOT INTERESTED") {
      const originalLeadStatus = statusModalLead.leadStatus || statusModalLead.status || "Warm";
      const lostLeadData = {
        ...statusModalLead,
        leadStatus: originalLeadStatus,
        status: originalLeadStatus,
        intrestedStatus: "Not Intersted",
        intrestedFromTableLead: false,
        isLoss: true,
        isInterested: false,
        isAssigned: false,
        lostReason: finalReason,
        lossReason: finalReason,
        remark: statusRemark || statusModalLead.remark || statusModalLead.remarks || "",
        remarks: statusRemark || statusModalLead.remarks || statusModalLead.remark || "",
        lossRemark: statusRemark || statusModalLead.remark || statusModalLead.remarks || "",
        remarkAttachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.remarkAttachments || []),
        attachments: processedAttachments.length > 0 ? processedAttachments : (statusModalLead.attachments || []),
        lostDate: formattedDate,
        lossDate: new Date(),
        lostTime: formattedTime
      };

      try {
        const targetId = statusModalLead._id || statusModalLead.id || statusModalLead.leadId;
        if (targetId) {
          await markInterestedFromTableApi(targetId, false, {
            lossReason: finalReason,
            lossRemark: statusRemark || statusModalLead.remark || statusModalLead.remarks || ""
          });

          // Upload remarks files/audio to Cloudinary on lead if present
          if (rawUploadFiles.length > 0) {
            const updateRes = await updateLeadApi(
              targetId,
              {
                remarks: statusRemark || statusModalLead.remark || statusModalLead.remarks || "",
                remark: statusRemark || statusModalLead.remark || statusModalLead.remarks || "",
                lossReason: finalReason
              },
              rawUploadFiles
            );
            if (updateRes && (updateRes.data || updateRes.remarksFiles)) {
              const updatedBLead = updateRes.data || updateRes;
              if (updatedBLead.remarksFiles && updatedBLead.remarksFiles.length > 0) {
                lostLeadData.remarksFiles = updatedBLead.remarksFiles;
                lostLeadData.remarkAttachments = updatedBLead.remarksFiles;
                lostLeadData.attachments = updatedBLead.remarksFiles;
              }
            }
          }
        }
      } catch (e) {
        console.error("Error saving to lost leads:", e);
      }

      updateLeadInStorage(lostLeadData);
      notifyLeadChange(lostLeadData);
      invalidateCache("lostLeads");
      invalidateCache("lostLeads_all");
      invalidateCache("leadManagement");

      // Remove from active lead management sheet
      const filtered = leads.filter(l => l.id !== statusModalLead.id);
      saveLeads(filtered);

      toast.success(`Lead ${statusModalLead.clientName || statusModalLead.concernPersonName} marked as NOT INTERESTED (${finalReason}) and moved to Lost Leads! 📌`);

      setStatusModalLead(null);
      setSelectedClientStatus("");
      setNotInterestedReason("");
      setCustomNotInterestedReason("");
      setStatusRemark("");
      setStatusRemarkAttachments([]);
      navigate("/sales/leads/lost", { state: { lostLead: lostLeadData } });
      return;
    }
  } catch (err) {
    console.error("Error submitting status change:", err);
    toast.error("Failed to update status. Please try again.");
  } finally {
    setIsStatusSubmitting(false);
  }
};

  // Media Attachments State for Schedule Modal
  const [attachments, setAttachments] = useState({
    current: [],
    next: [],
    remarks: []
  });

  // Schedule Form State
  const [scheduleFormData, setScheduleFormData] = useState({
    type: "Call",
    date: "",
    time: "10:00 am",
    assignedTo: "Admin",
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

  // 1. KPI Aggregations
  const stats = useMemo(() => {
    const total = leads.length;
    const fresh = leads.filter((l) => (l.leadType || "").toUpperCase() === "FRESH").length;
    const converted = leads.filter((l) => (l.status || "").toUpperCase() === "CONVERTED").length;
    const interested = leads.filter((l) => (l.status || "").toUpperCase().includes("INTERESTED")).length;
    const conversionRate = total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : "0.0%";
    
    // Revenue calculations
    const totalRevenue = leads
      .filter((l) => (l.status || "").toUpperCase() === "CONVERTED")
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);
    
    const expectedRevenue = leads
      .reduce((sum, l) => sum + (Number(l.expectedBusiness) || 0), 0);

    const totalIncentives = totalRevenue * 0.02; // 2% incentive
    const expectedIncentives = expectedRevenue * 0.02;

    return {
      total: String(total),
      fresh: String(fresh),
      converted: String(converted),
      interested: String(interested),
      conversionRate,
      totalRevenue: formatLakhs(totalRevenue),
      expectedRevenue: formatLakhs(expectedRevenue),
      totalIncentives: formatLakhs(totalIncentives),
      expectedIncentives: formatLakhs(expectedIncentives)
    };
  }, [leads]);

  // 2. Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const isLost =
        lead.isLoss === true ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(lead.leadStatus || "").toUpperCase()) ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(lead.status || "").toUpperCase());
      if (isLost) return false;

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
    }).sort((a, b) => getLeadTime(b) - getLeadTime(a));
  }, [leads, filterStatus, filterLeadType, filterJobType, filterLeadLabel, searchTerm]);

  // 3. Paginated Leads
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLeads.slice(start, start + rowsPerPage);
  }, [filteredLeads, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage) || 1;

  // Open Schedule Modal
  const handleOpenScheduleModal = (lead) => {
    setScheduleModalLead(lead);
    setAttachments({ current: [], next: [], remarks: [] });
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    const tmrStr = tmr.toISOString().split("T")[0];

    setScheduleFormData({
      type: "Call",
      date: lead.nextFollowupDateRaw || tmrStr,
      time: lead.nextFollowupTime !== "--" ? lead.nextFollowupTime : "10:00 am",
      assignedTo: lead.assignTo !== "--" ? lead.assignTo : "Admin",
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
  };

  // Submit Schedule Form
  const handleSaveSchedule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isScheduling) return;
    if (!scheduleModalLead) return;
    if (isUserObserver) {
      toast.info("Observer Mode: Scheduling follow-up is disabled.");
      return;
    }

    setIsScheduling(true);
    try {
      const targetId = String(scheduleModalLead._id || scheduleModalLead.id || scheduleModalLead.leadId);

    // Format combined Date & Time for ISO Date
    let scheduledDateTime = null;
    if (scheduleFormData.date) {
      try {
        const timeStr = scheduleFormData.time || "10:00 AM";
        const combined = new Date(`${scheduleFormData.date} ${timeStr}`);
        scheduledDateTime = !isNaN(combined.getTime()) ? combined : new Date(scheduleFormData.date);
      } catch (err) {
        scheduledDateTime = new Date(scheduleFormData.date);
      }
    }

    const displayDate = scheduleFormData.date;
    let formattedDisplayDate = displayDate;
    if (displayDate) {
      try {
        const d = new Date(displayDate);
        if (!isNaN(d.getTime())) {
          formattedDisplayDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch (err) {}
    }

    // New Schema Payload matching backend followupSchema
    const followupPayload = {
      leadId: targetId,
      type: scheduleFormData.type || "Call",
      dateTime: scheduledDateTime,
      date: scheduleFormData.date,
      time: scheduleFormData.time || "10:00 am",
      talkToPerson: scheduleFormData.talkToPerson || scheduleModalLead.concernPersonName || scheduleModalLead.clientName || "",
      personDesignation: scheduleFormData.personDesignation || scheduleModalLead.clientDesignation || "",
      currentDiscussion: {
        discussion: scheduleFormData.notes || "",
        files: (attachments.current || [])
          .filter((f) => f.url && (f.url.startsWith("http://") || f.url.startsWith("https://")))
          .map((f) => ({
            url: f.url,
            name: f.name || "attachment",
            fileType: f.type || "file",
            size: f.size || 0
          }))
      },
      nextDiscussion: {
        nextDiscussion: scheduleFormData.nextDiscussionTopic || "",
        files: (attachments.next || [])
          .filter((f) => f.url && (f.url.startsWith("http://") || f.url.startsWith("https://")))
          .map((f) => ({
            url: f.url,
            name: f.name || "attachment",
            fileType: f.type || "file",
            size: f.size || 0
          }))
      },
      rating: Number(scheduleFormData.clientRating || 4),
      matrix: {
        revenue: scheduleFormData.revenue || "",
        satisfaction: scheduleFormData.satisfaction || "",
        repeatPotential: scheduleFormData.repeatPotential || "",
        complexity: scheduleFormData.complexity || "",
        engagement: scheduleFormData.engagement || "",
        positiveAttitude: scheduleFormData.positiveAttitude || ""
      },
      followupRemark: {
        remarks: scheduleFormData.followupRemarks || "",
        files: (attachments.remarks || [])
          .filter((f) => f.url && (f.url.startsWith("http://") || f.url.startsWith("https://")))
          .map((f) => ({
            url: f.url,
            name: f.name || "attachment",
            fileType: f.type || "file",
            size: f.size || 0
          }))
      },
      createdBy: user?._id || undefined
    };

    const newHistoryEntry = {
      date: formattedDisplayDate,
      time: scheduleFormData.time || "10:00 am",
      rawDate: scheduledDateTime,
      notes: scheduleFormData.notes || scheduleFormData.followupRemarks || "--",
      discussionWithClient: scheduleFormData.notes || "--",
      nextDiscussionTopic: scheduleFormData.nextDiscussionTopic || "--",
      talkToPerson: scheduleFormData.talkToPerson || scheduleModalLead.concernPersonName || scheduleModalLead.clientName || "--",
      personDesignation: scheduleFormData.personDesignation || scheduleModalLead.clientDesignation || "--",
      discussionType: scheduleFormData.type || "Call",
      type: scheduleFormData.type || "Call",
      rep: user?.name || scheduleModalLead.salesPerson || scheduleFormData.assignedTo || "",
      repDesignation: user?.role || "",
      department: loggedInDepartment || "Sales",
      status: scheduleFormData.type || "Scheduled",
      rating: Number(scheduleFormData.clientRating || 4),
      matrix: followupPayload.matrix,
      followupRemark: scheduleFormData.followupRemarks || "",
      attachments: { ...attachments }
    };

    // Optimistically update React State
    let updatedTargetLead = null;
    const updated = leads.map((item) => {
      if (String(item.id || item._id) === String(scheduleModalLead.id || scheduleModalLead._id)) {
        const prevHist = Array.isArray(item.followupHistory) ? item.followupHistory : [];
        const newHist = [newHistoryEntry, ...prevHist];
        updatedTargetLead = {
          ...item,
          nextFollowupDate: formattedDisplayDate,
          nextFollowupDateRaw: scheduleFormData.date,
          nextFollowupTime: scheduleFormData.time || "10:00 am",
          channelType: scheduleFormData.type || "Call",
          clientRating: scheduleFormData.clientRating,
          isFollowupScheduled: true,
          followupScheduled: true,
          followupRemarksCount: newHist.length,
          followupHistory: newHist,
          notes: scheduleFormData.notes,
          nextDiscussionTopic: scheduleFormData.nextDiscussionTopic,
          talkToPerson: scheduleFormData.talkToPerson || item.talkToPerson,
          personDesignation: scheduleFormData.personDesignation || item.personDesignation,
          assignTo: scheduleFormData.assignedTo || item.assignTo || item.salesPerson,
          inLeadManagement: true
        };
        return updatedTargetLead;
      }
      return item;
    });

    setLeads(updated);

    // Save to Backend using the new Follow-up Schema API (with Cloudinary uploads)
    try {
      const res = await addLeadFollowupApi(targetId, followupPayload, attachments);
      if (res && res.success === false) {
        console.warn("Backend reported unsuccessful followup save:", res.message);
      }
      invalidateCache("leadManagement_sheet_all");
      invalidateCache("leadManagement");
      await fetchBackendLeads(true);
    } catch (err) {
      console.error("Error saving followup to backend:", err);
    }

    if (updatedTargetLead) {
      updateLeadInStorage(updatedTargetLead);
      notifyLeadChange(updatedTargetLead);
    }

    setScheduleModalLead(null);
    toast.success("Follow-up saved successfully! 🎯");
  } catch (err) {
    console.error("Error saving schedule:", err);
    toast.error("Failed to save follow-up. Please try again.");
  } finally {
    setIsScheduling(false);
  }
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
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="Lead Management Sheet"
          badge="Master Sheet"
          badgeColor="bg-emerald-100 text-emerald-800 border-emerald-300"
          description="Complete overview of all leads, conversion metrics, expected revenue, and customer interactions."
          showBackButton={true}
          rightActions={
            <div className="flex items-center gap-2">
              {isUserObserver ? (
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs sm:text-sm font-bold shadow-xs cursor-not-allowed opacity-60 flex items-center gap-1.5"
                  title="Disabled for Observer"
                >
                  <span>+</span> Add Lead
                </button>
              ) : (
                <Link
                  to="/sales/leads/add"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+</span> Add Lead
                </Link>
              )}

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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 00-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          }
        />
      </div>

      {/* ================= 2. DASHBOARD STYLE SLIDABLE KPI STAT CARDS ================= */}
      <LeadKpiSlider stats={stats} />

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
                  disabled={isScheduling || isUserObserver}
                  onClick={isUserObserver ? () => toast.info("Observer Mode: Action is disabled.") : handleSaveSchedule}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                    isScheduling || isUserObserver
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-98 text-white shadow-blue-600/25 cursor-pointer"
                  }`}
                  title={isUserObserver ? "Disabled for Observer" : isScheduling ? "Saving..." : "Save"}
                >
                  {isScheduling ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
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
                  <DateTimePicker
                    dateValue={scheduleFormData.date}
                    timeValue={scheduleFormData.time}
                    onDateTimeChange={({ date, time }) => {
                      setScheduleFormData((prev) => ({
                        ...prev,
                        date,
                        time
                      }));
                    }}
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

              {/* Row 4: CLIENT RATING (0-10) */}
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
              </div>

              {/* Rows 5 & 6: Evaluation Metrics (REVENUE, SATISFACTION, REPEAT POTENTIAL, COMPLEXITY, ENGAGEMENT, POSITIVE ATTITUDE) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { key: "revenue", label: "REVENUE" },
                  { key: "satisfaction", label: "SATISFACTION" },
                  { key: "repeatPotential", label: "REPEAT POTENTIAL" },
                  { key: "complexity", label: "COMPLEXITY" },
                  { key: "engagement", label: "ENGAGEMENT", defaultVal: "HIGH" },
                  { key: "positiveAttitude", label: "POSITIVE ATTITUDE" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      {field.label}
                    </label>
                    <select
                      value={scheduleFormData[field.key] || field.defaultVal || "LOW"}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, [field.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
                    >
                      {["LOW", "MEDIUM", "HIGH"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
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

      {/* ================= MODAL 2A: DISCUSSION LOGS / REMARKS HISTORY TIMELINE (FROM ACTION ICON) ================= */}
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
              {(() => {
                const arr = [];
                // 1. Existing followupHistory (from schema or legacy)
                if (Array.isArray(remarksModalLead.followupHistory) && remarksModalLead.followupHistory.length > 0) {
                  remarksModalLead.followupHistory.forEach((hist, idx) => {
                    arr.push({
                      id: hist._id || hist.id || `hist-${idx}`,
                      rep: hist.rep || remarksModalLead.salesPerson || "Sales",
                      status: hist.status || hist.discussionType || "Follow-up",
                      date: hist.date || "Recently",
                      time: hist.time || "",
                      rawDate: hist.rawDate || null,
                      notes: hist.followupRemark || hist.notes || hist.discussionWithClient || hist.remarks || hist.remark || "",
                      attachments: hist.attachments?.remarks || hist.attachments?.current || hist.attachments || hist.files || []
                    });
                  });
                }

                // 2. Status timeline history
                if (Array.isArray(remarksModalLead.statusTimeline) && remarksModalLead.statusTimeline.length > 0) {
                  remarksModalLead.statusTimeline.forEach((st, sIdx) => {
                    const dt = st.changedAt ? new Date(st.changedAt) : null;
                    const fDate = dt && !isNaN(dt.getTime())
                      ? dt.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
                      : (remarksModalLead.createdDate || "Recently");
                    const fTime = dt && !isNaN(dt.getTime())
                      ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                      : "";
                    const repName = (typeof st.changedBy === 'object' ? st.changedBy?.name : null) || remarksModalLead.salesPerson || "Sales";
                    const isFirst = sIdx === 0;
                    const isLast = sIdx === remarksModalLead.statusTimeline.length - 1;
                    const files = (isFirst || isLast)
                      ? (remarksModalLead.remarksFiles || remarksModalLead.remarkAttachments || remarksModalLead.attachments || [])
                      : [];

                    arr.push({
                      id: st._id || `st-${sIdx}`,
                      rep: repName,
                      status: st.status ? `${st.status} Status` : "Status Change",
                      date: fDate,
                      time: fTime,
                      rawDate: st.changedAt || null,
                      notes: st.remarks || st.remark || (isFirst ? (remarksModalLead.remarks || remarksModalLead.remark) : ""),
                      attachments: files
                    });
                  });
                }

                // 3. Lead base remarks if not yet added
                if (arr.length === 0 && (remarksModalLead.remarks || remarksModalLead.remark || remarksModalLead.requirement || (Array.isArray(remarksModalLead.remarksFiles) && remarksModalLead.remarksFiles.length > 0))) {
                  arr.push({
                    id: "lead-initial",
                    rep: remarksModalLead.salesPerson || (typeof remarksModalLead.leadBy === 'object' ? remarksModalLead.leadBy?.name : null) || "Sales",
                    status: remarksModalLead.leadStatus || remarksModalLead.status || "Lead Remarks",
                    date: remarksModalLead.createdDate || remarksModalLead.date || "Recently",
                    time: remarksModalLead.createdTime || "",
                    rawDate: remarksModalLead.createdAt || null,
                    notes: remarksModalLead.remarks || remarksModalLead.remark || remarksModalLead.requirement || "",
                    attachments: remarksModalLead.remarksFiles || remarksModalLead.remarkAttachments || remarksModalLead.attachments || []
                  });
                }

                // Deduplicate
                const uniqueList = [];
                const seenKeys = new Set();
                arr.forEach((item) => {
                  const key = `${item.notes || ''}-${item.date || ''}-${item.time || ''}-${item.status || ''}`;
                  if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueList.push(item);
                  }
                });

                const sortedLogs = uniqueList.sort((a, b) => {
                  const timeA = a.rawDate ? new Date(a.rawDate).getTime() : 0;
                  const timeB = b.rawDate ? new Date(b.rawDate).getTime() : 0;
                  if (timeA && timeB && timeA !== timeB) return timeB - timeA;
                  return 0;
                });

                if (sortedLogs.length === 0) {
                  return (
                    <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium text-sm">
                      No discussion logs or follow-up remarks recorded yet.
                    </div>
                  );
                }

                return sortedLogs.map((hist, idx) => {
                  const isLast = idx === sortedLogs.length - 1;
                  return (
                    <div key={hist.id || idx} className="relative flex gap-4">
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
                            Commented {hist.date ? hist.date : "recently"} {hist.time ? `at ${hist.time}` : ""}
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
                        </div>

                        {/* Speech Bubble / Remarks Card */}
                        <div className="mt-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 shadow-2xs relative space-y-2">
                          <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <span>REMARKS</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700 italic">
                            "{hist.notes || "No text remarks provided"}"
                          </p>

                          {/* Media attachments & voice notes */}
                          {renderMediaFiles(hist.attachments)}
                        </div>

                      </div>
                    </div>
                  );
                });
              })()}
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

      {/* ================= MODAL 2B: FOLLOW-UP DETAILS MODAL (FROM BADGE CLICK) ================= */}
      {followupDetailsModalLead && (() => {
        const getOrdinal = (n) => {
          const s = ["th", "st", "nd", "rd"];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        let rawHistory = [];
        if (Array.isArray(followupDetailsModalLead.followupHistory) && followupDetailsModalLead.followupHistory.length > 0) {
          rawHistory = [...followupDetailsModalLead.followupHistory];
        } else if (Array.isArray(followupDetailsModalLead.statusTimeline) && followupDetailsModalLead.statusTimeline.length > 0) {
          rawHistory = followupDetailsModalLead.statusTimeline.map((st, sIdx) => {
            const dt = st.changedAt ? new Date(st.changedAt) : null;
            const fDate = dt && !isNaN(dt.getTime())
              ? dt.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })
              : (followupDetailsModalLead.createdDate || "Recently");
            const fTime = dt && !isNaN(dt.getTime())
              ? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
              : "";
            const isInitial = sIdx === 0;
            const isLatest = sIdx === followupDetailsModalLead.statusTimeline.length - 1;
            const files = (isInitial || isLatest)
              ? (followupDetailsModalLead.remarksFiles || followupDetailsModalLead.remarkAttachments || followupDetailsModalLead.attachments || [])
              : [];

            return {
              rep: (typeof st.changedBy === 'object' ? st.changedBy?.name : null) || followupDetailsModalLead.salesPerson || user?.name || "Sales",
              repDesignation: user?.role || "",
              department: loggedInDepartment || "Sales",
              talkToPerson: followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "--",
              discussionType: st.status || "Status Change",
              personDesignation: followupDetailsModalLead.clientDesignation || "--",
              discussionWithClient: st.remarks || st.remark || (isInitial ? (followupDetailsModalLead.remarks || followupDetailsModalLead.remark) : "--"),
              nextDiscussionTopic: "--",
              rating: 4,
              matrix: {},
              followupRemark: st.remarks || st.remark || (isInitial ? (followupDetailsModalLead.remarks || followupDetailsModalLead.remark) : ""),
              date: fDate,
              time: fTime,
              rawDate: st.changedAt,
              attachments: {
                current: [],
                next: [],
                remarks: files
              }
            };
          });
        } else if (followupDetailsModalLead.notes || followupDetailsModalLead.remark || followupDetailsModalLead.remarks || (Array.isArray(followupDetailsModalLead.remarksFiles) && followupDetailsModalLead.remarksFiles.length > 0) || followupDetailsModalLead.nextFollowupDate || followupDetailsModalLead.isFollowupScheduled) {
          rawHistory = [{
            rep: user?.name || followupDetailsModalLead.salesPerson || followupDetailsModalLead.assignTo || "",
            repDesignation: user?.role || "",
            department: loggedInDepartment || "Sales",
            talkToPerson: followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "--",
            discussionType: followupDetailsModalLead.channelType || followupDetailsModalLead.type || "Call",
            personDesignation: followupDetailsModalLead.clientDesignation || "--",
            discussionWithClient: followupDetailsModalLead.notes || followupDetailsModalLead.remark || followupDetailsModalLead.remarks || followupDetailsModalLead.requirement || "--",
            nextDiscussionTopic: followupDetailsModalLead.nextDiscussionTopic || "--",
            rating: followupDetailsModalLead.rating || 4,
            matrix: {},
            followupRemark: followupDetailsModalLead.remark || followupDetailsModalLead.remarks || "",
            date: followupDetailsModalLead.createdDate || "Recently",
            time: followupDetailsModalLead.createdTime || "",
            rawDate: followupDetailsModalLead.createdAt,
            attachments: {
              current: [],
              next: [],
              remarks: followupDetailsModalLead.remarksFiles || followupDetailsModalLead.remarkAttachments || followupDetailsModalLead.attachments || []
            }
          }];
        }

        // Ensure descending chronological order (newest at index 0)
        const historyList = [...rawHistory].sort((a, b) => {
          const timeA = a.rawDate ? new Date(a.rawDate).getTime() : (a.date ? new Date(a.date).getTime() : 0);
          const timeB = b.rawDate ? new Date(b.rawDate).getTime() : (b.date ? new Date(b.date).getTime() : 0);
          if (timeA && timeB && timeA !== timeB) return timeB - timeA;
          return 0; // preserve newest-first order
        });

        const totalFollowups = historyList.length;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Follow-up Details
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
                      {totalFollowups} Follow-up{totalFollowups !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Client: <span className="text-slate-800 font-bold">{followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "Client"}</span>
                    {followupDetailsModalLead.phoneNumber && followupDetailsModalLead.phoneNumber !== "--" && (
                      <span className="ml-2 text-slate-400">• {followupDetailsModalLead.phoneNumber}</span>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFollowupDetailsModalLead(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center transition-colors cursor-pointer text-sm shrink-0"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Follow-up Cards Body */}
              <div className="p-5 sm:p-6 max-h-[72vh] overflow-y-auto space-y-6 bg-slate-50/50">
                {totalFollowups > 0 ? (
                  historyList.map((hist, idx) => {
                    const followupNumber = totalFollowups - idx;
                    const currentFiles = hist.attachments?.current || hist.currentDiscussion?.files || [];
                    const nextFiles = hist.attachments?.next || hist.nextDiscussion?.files || [];
                    const remarkFiles = hist.attachments?.remarks || hist.followupRemark?.files || [];

                    const channel = hist.discussionType || hist.type || hist.status || "Call";
                    const repName = (hist.rep && hist.rep !== "--" && hist.rep !== "Sales Manager")
                      ? hist.rep
                      : (user?.name || (typeof followupDetailsModalLead.leadBy === 'object' ? followupDetailsModalLead.leadBy?.name : null) || followupDetailsModalLead.salesPerson || followupDetailsModalLead.assignTo || "--");
                    const repDesig = (hist.repDesignation && hist.repDesignation !== "--" && hist.repDesignation !== "Sales Manager")
                      ? hist.repDesignation
                      : (user?.role || "");
                    const dept = (hist.department && hist.department !== "--") ? hist.department : (loggedInDepartment || "Sales");

                    const matrixEntries = [
                      { label: "Revenue", val: hist.matrix?.revenue },
                      { label: "Satisfaction", val: hist.matrix?.satisfaction },
                      { label: "Repeat Potential", val: hist.matrix?.repeatPotential },
                      { label: "Complexity", val: hist.matrix?.complexity },
                      { label: "Engagement", val: hist.matrix?.engagement },
                      { label: "Positive Attitude", val: hist.matrix?.positiveAttitude },
                    ];
                    const hasMatrix = matrixEntries.some((m) => m.val && m.val.trim() !== "");

                    return (
                      <div key={idx} className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                        {/* Card Header: Follow-up Ordinal, Date & Time, Discussion Channel */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-2xs tracking-wide">
                              {getOrdinal(followupNumber)} Follow-up
                            </span>
                            <span className="text-xs font-semibold text-slate-500">
                              📅 {hist.date || "--"} {hist.time && hist.time !== "--" ? `• ⏰ ${hist.time}` : ""}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              channel === "Call"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : channel === "Meeting"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : channel === "WhatsApp"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : channel === "Site Visit"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {channel}
                          </span>
                        </div>

                        {/* Executive & Client Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              REPRESENTATIVE
                            </span>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5 block truncate">
                              {repName}
                            </span>
                            {repDesig && (
                              <span className="text-[10px] font-semibold text-slate-500 block truncate">
                                {repDesig}
                              </span>
                            )}
                          </div>

                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              DEPARTMENT
                            </span>
                            <span className="font-extrabold text-blue-700 text-xs sm:text-sm mt-0.5 block truncate">
                              {dept}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              TALKED TO PERSON
                            </span>
                            <span className="font-extrabold text-slate-800 text-xs sm:text-sm mt-0.5 block truncate">
                              {hist.talkToPerson || followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "--"}
                            </span>
                          </div>

                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              PERSON DESIGNATION
                            </span>
                            <span className="font-extrabold text-purple-700 text-xs sm:text-sm mt-0.5 block truncate">
                              {hist.personDesignation || followupDetailsModalLead.clientDesignation || "--"}
                            </span>
                          </div>
                        </div>

                        {/* CURRENT DISCUSSION */}
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                            CURRENT DISCUSSION
                          </span>
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {hist.discussionWithClient || hist.notes || hist.remark || "--"}
                          </div>
                          {renderMediaFiles(currentFiles)}
                        </div>

                        {/* NEXT DISCUSSION TOPIC */}
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                            NEXT DISCUSSION TOPIC
                          </span>
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {hist.nextDiscussionTopic || "--"}
                          </div>
                          {renderMediaFiles(nextFiles)}
                        </div>

                        {/* FOLLOW-UP REMARKS */}
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                            FOLLOW-UP REMARKS
                          </span>
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {hist.followupRemark || "--"}
                          </div>
                          {renderMediaFiles(remarkFiles)}
                        </div>

                        {/* RATING & EVALUATION MATRIX */}
                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              RATING & EVALUATION MATRIX
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold flex items-center gap-1">
                              ⭐ Rating: {hist.rating !== undefined ? hist.rating : 4} / 10
                            </span>
                          </div>

                          {hasMatrix ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                              {matrixEntries.map((m, mIdx) => {
                                const val = (m.val || "").toUpperCase();
                                const isHigh = val === "HIGH";
                                const isLow = val === "LOW";
                                return (
                                  <div key={mIdx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                                    <span className="block text-[9px] font-extrabold text-slate-400 uppercase truncate">
                                      {m.label}
                                    </span>
                                    <span
                                      className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                                        isHigh
                                          ? "bg-emerald-100 text-emerald-800"
                                          : isLow
                                          ? "bg-slate-200 text-slate-700"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {m.val || "--"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No matrix scores recorded</span>
                          )}
                        </div>

                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 font-medium text-sm">
                    No follow-up details recorded yet.
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

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
                disabled={isStatusSubmitting || isUserObserver}
                onClick={isUserObserver ? () => toast.info("Observer Mode: Action is disabled.") : handleSendToSalesManagement}
                className={`px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 ${
                  isStatusSubmitting || isUserObserver
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60 shadow-none"
                    : "bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-orange-500/20 cursor-pointer active:scale-95"
                }`}
                title={isUserObserver ? "Disabled for Observer" : isStatusSubmitting ? "Processing..." : "Submit"}
              >
                {isStatusSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Lead;