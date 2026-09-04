import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import ScopeTabs from "../../../../Common/Components/ScopeTabs";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { initialLeadsData } from "../../data/leadManagementData";
import { FaUserPlus, FaUsers, FaUser } from "react-icons/fa";
import { subscribeToLeadUpdates, updateLeadInStorage, notifyLeadChange } from "../../utils/leadStorageUtils";
import { getAllLeadsApi, updateLeadApi } from "../../../../services/totalLeads.api";
import { markLeadAsLossApi, createLossLeadApi } from "../../../../services/lostLeads.api";
import { getAllFollowupsApi, addFollowupApi } from "../../../../services/followup.api";
import { useLeadContext } from "../../../../context/LeadContext";
import LeadKpiSlider from "./LeadKpiSlider";
import SalesTransferModal from "./SalesTransferModal";
import DateTimePicker from "../Common/DateTimePicker";

const notInterestedReasonsList = [
  "High Price / Budget Out",
  "Already Purchased / Competitor Chosen",
  "Location / Distance Issue",
  "Requirements Mismatch / Not Feasible",
  "Other"
];

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
  const navigate = useNavigate();

  // Leads state fetched directly from backend API
  const [leads, setLeads] = useState([]);
  const scheduledFollowupCacheRef = useRef(new Map());
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
              ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(l.leadStatus || "").toUpperCase()) ||
              ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(l.status || "").toUpperCase());
            if (isLost) return false;

            // Only show leads that belong in Lead Management Sheet:
            // 1. Marked INTERESTED (sent from Assigned Leads or call status)
            // 2. OR Have an active follow-up scheduled or followup history
            const isInterested =
              l.isInterested === true ||
              String(l.status || "").toUpperCase() === "INTERESTED" ||
              String(l.leadStatus || "").toUpperCase() === "INTERESTED";

            const hasFollowup =
              (l.isFollowupScheduled === true || l.isFollowup === true) &&
              ((Array.isArray(l.followupHistory) && l.followupHistory.length > 0) ||
                Number(l.followupRemarksCount) > 0 ||
                (l.nextFollowupDate && l.nextFollowupDate !== "--" && l.nextFollowupDate !== "Invalid Date" && l.nextFollowupDate !== ""));

            return isInterested || hasFollowup;
          })
          .map((backendLead) => {
            const idKey = String(backendLead._id || backendLead.leadId || backendLead.id);
            const extraFollowups = followupMap.get(idKey) || [];

            const dateObj = new Date(backendLead.createdAt || Date.now());
            const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
            const assignee = backendLead.salesPerson || (typeof backendLead.assignedTo === 'object' ? backendLead.assignedTo?.name : backendLead.assignedTo) || backendLead.assignTo || "--";
            const formattedTime = backendLead.createdTime || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

            const historyCount = Array.isArray(backendLead.followupHistory) ? backendLead.followupHistory.length : 0;
            const remarksCount = Number(backendLead.followupRemarksCount) || Number(backendLead.followupCount) || 0;
            const count = Math.max(historyCount, remarksCount, extraFollowups.length, (backendLead.isFollowupScheduled && backendLead.nextFollowupDate) ? 1 : 0);

            const rawNextDate = backendLead.nextFollowupDate || (extraFollowups.length > 0 ? extraFollowups[0].scheduledDate : null);
            let formattedNextDate = "";
            if (count > 0 && rawNextDate && rawNextDate !== "--" && rawNextDate !== "Completed" && rawNextDate !== "Invalid Date") {
              try {
                const d = new Date(rawNextDate);
                if (!isNaN(d.getTime())) {
                  formattedNextDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
                } else {
                  formattedNextDate = String(rawNextDate);
                }
              } catch (e) {
                formattedNextDate = String(rawNextDate);
              }
            }

            const nextTime = backendLead.nextFollowupTime || backendLead.followupTime || (extraFollowups.length > 0 ? extraFollowups[0].scheduledTime : "") || "10:00 am";

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
              remark: backendLead.remark || backendLead.requirement || backendLead.notes || "",
              requirement: backendLead.requirement || backendLead.remark || backendLead.notes || "",
              followupHistory: Array.isArray(backendLead.followupHistory) ? backendLead.followupHistory : [],
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

        const getLeadTime = (lead) => {
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

        const sortedLeads = activeBackendLeads.sort((a, b) => getLeadTime(b) - getLeadTime(a));
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
  const [filterScope, setFilterScope] = useState("ALL");
  const [filterSalesPerson, setFilterSalesPerson] = useState("ALL");
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
      render: (val, row) => (
        <div className="grid grid-cols-2 gap-1.5 w-14 mx-auto">
          {/* 1. View Lead Details (Top-Left) */}
          <button
            type="button"
            onClick={() => navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
            className="w-6 h-6 rounded-lg border border-orange-200 bg-orange-50/70 text-orange-600 hover:bg-orange-100 hover:border-orange-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="View Lead Details"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          {/* 2. Schedule / Reschedule Follow-up (Top-Right) */}
          <button
            type="button"
            onClick={() => handleOpenScheduleModal(row)}
            className="w-6 h-6 rounded-lg border border-blue-200 bg-blue-50/70 text-blue-600 hover:bg-blue-100 hover:border-blue-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Schedule / Reschedule Follow-up"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* 3. Client Status (Interested / Not Interested) (Bottom-Left) */}
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
            className="w-6 h-6 rounded-lg border border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Client Status (Interested / Not Interested)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* 4. Follow-up Remarks & History (Bottom-Right) */}
          <button
            type="button"
            onClick={() => setRemarksModalLead(row)}
            className="w-6 h-6 rounded-lg border border-purple-200 bg-purple-50/70 text-purple-600 hover:bg-purple-100 hover:border-purple-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
            title="View Follow-up Remarks & History"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
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
                onClick={() => row.id && navigate(`/sales/leads/details/${row.id}`, { state: { lead: row } })}
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
    assignedTo: {
      label: "ASSIGNED TO",
      align: "center",
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
        return (
          <div className="max-w-[150px] truncate text-xs text-slate-700 font-medium mx-auto text-center" title={rem}>
            {rem}
          </div>
        );
      }
    }
  }), [currentPage, rowsPerPage, navigate]);

  // Modals
  const [detailModalLead, setDetailModalLead] = useState(null);
  const [scheduleModalLead, setScheduleModalLead] = useState(null);
  const [remarksModalLead, setRemarksModalLead] = useState(null);
  const [followupDetailsModalLead, setFollowupDetailsModalLead] = useState(null);
  const [completeModalLead, setCompleteModalLead] = useState(null);

  // Client Status Modal States
  const [statusModalLead, setStatusModalLead] = useState(null);
  const [selectedClientStatus, setSelectedClientStatus] = useState("");
  const [notInterestedReason, setNotInterestedReason] = useState("");
  const [customNotInterestedReason, setCustomNotInterestedReason] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [statusRemarkAttachments, setStatusRemarkAttachments] = useState([]);

  // Sales Management Transfer Modal State
  const [transferModalLead, setTransferModalLead] = useState(null);
  const [transferInitialRemark, setTransferInitialRemark] = useState("");

  // Handler to move lead to Lost Leads or open pre-filled Sales Transfer Form
  const handleSendToSalesManagement = async () => {
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
      // Open the pre-filled Sales Management transfer form modal
      setTransferModalLead(statusModalLead);
      setTransferInitialRemark(statusRemark || statusModalLead.remark || "");

      setStatusModalLead(null);
      setSelectedClientStatus("");
      setNotInterestedReason("");
      setCustomNotInterestedReason("");
      setStatusRemark("");
      setStatusRemarkAttachments([]);
      return;
    } else if (selectedClientStatus === "NOT INTERESTED") {
      // Move to Lost Leads (dss_lost_leads) and remove from current list
      const lostLeadData = {
        ...statusModalLead,
        leadStatus: "CLOSED_LOST",
        status: "CLOSED_LOST",
        isLoss: true,
        isInterested: false,
        isAssigned: false,
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
      notifyLeadChange(lostLeadData);
      invalidateCache("lostLeads");
      invalidateCache("leadManagement");

      try {
        // Sync with MongoDB backend LossLead collection
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
          salesPerson: statusModalLead.salesPerson || statusModalLead.assignTo || "",
          assignTo: statusModalLead.salesPerson || statusModalLead.assignTo || "",
          assignedTo: statusModalLead.assignedTo || statusModalLead.salesPerson || null
        };

        if (targetId) {
          await markLeadAsLossApi(targetId, lossPayload);
        } else {
          await createLossLeadApi(lossPayload);
        }
      } catch (e) {
        console.error("Error saving to lost leads:", e);
      }

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
  };

  // Handler on confirming pre-filled Sales Management Transfer Form
  const handleConfirmSalesTransfer = async (formData) => {
    if (!transferModalLead) return;

    const formattedDate = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    const finalLeadData = {
      ...transferModalLead,
      clientName: formData.clientName,
      concernPersonName: formData.clientName,
      phoneNumber: formData.phoneNumber,
      phone: formData.phoneNumber,
      alternateNumber: formData.alternateNumber,
      whatsappNumber: formData.whatsappNumber,
      emailAddress: formData.emailAddress,
      email: formData.emailAddress,
      companyName: formData.companyName,
      businessType: formData.businessType,
      clientDesignation: formData.clientDesignation,
      amount: Number(formData.expectedBusiness) || 0,
      expectedBusiness: Number(formData.expectedBusiness) || 0,
      budget: Number(formData.expectedBusiness) || 0,
      priority: formData.priority,
      status: "INTERESTED",
      leadStatus: "INTERESTED",
      isInterested: true,
      isLoss: false,
      jobType: formData.jobType,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      address: formData.address,
      requirement: formData.requirement,
      remark: formData.transferRemark || transferModalLead.remark || "",
      clientRating: Number(formData.clientRating) || 4.5,
      assignTo: formData.assignedTo,
      salesPerson: formData.assignedTo,
      createdAt: transferModalLead.createdDate || transferModalLead.createdAt || formattedDate,
      createdTime: transferModalLead.createdTime || formattedTime,
      clientId: transferModalLead.clientId || transferModalLead.leadId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      leadId: transferModalLead.leadId || transferModalLead.clientId || `DSS${Math.floor(10000 + Math.random() * 90000)}`,
      updatedAt: new Date().toISOString()
    };

    // 1. Sync to backend MongoDB
    try {
      const targetId = transferModalLead._id || transferModalLead.id || transferModalLead.leadId;
      if (targetId) {
        await updateLeadApi(targetId, {
          status: "INTERESTED",
          leadStatus: "INTERESTED",
          isInterested: true,
          isLoss: false,
          clientName: formData.clientName,
          concernPersonName: formData.clientName,
          phoneNumber: formData.phoneNumber,
          phone: formData.phoneNumber,
          alternateNumber: formData.alternateNumber,
          whatsappNumber: formData.whatsappNumber,
          emailAddress: formData.emailAddress,
          email: formData.emailAddress,
          companyName: formData.companyName,
          businessType: formData.businessType,
          clientDesignation: formData.clientDesignation,
          amount: Number(formData.expectedBusiness) || 0,
          expectedBusiness: Number(formData.expectedBusiness) || 0,
          budget: Number(formData.expectedBusiness) || 0,
          priority: formData.priority,
          jobType: formData.jobType,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          address: formData.address,
          requirement: formData.requirement,
          remark: formData.transferRemark || transferModalLead.remark || "",
          clientRating: Number(formData.clientRating) || 4.5,
          assignTo: formData.assignedTo,
          salesPerson: formData.assignedTo,
          movedToSalesManagementDate: new Date()
        });
      }
    } catch (apiErr) {
      console.error("Error updating lead status in MongoDB:", apiErr);
    }

    // 2. Invalidate cache across all scopes
    invalidateCache("sales_management_sheet");
    invalidateCache("sales_management_sheet_all");
    invalidateCache("leadManagement");

    // 3. Update active in-memory list in Lead Management Sheet
    setLeads((prev) =>
      prev.map((l) =>
        (l._id === transferModalLead._id || l.id === transferModalLead.id || l.leadId === transferModalLead.leadId)
          ? { ...l, ...finalLeadData }
          : l
      )
    );

    // 4. Update storage & broadcast event to all listeners
    updateLeadInStorage(finalLeadData);
    notifyLeadChange(finalLeadData);

    toast.success(`Lead "${finalLeadData.clientName}" successfully submitted & transferred to Sales Management Sheet! 🚀`);

    setTransferModalLead(null);
    setTransferInitialRemark("");

    // 5. Navigate directly to Sales Management Sheet page with the new lead data
    navigate("/sales/management-sheet", { state: { lead: finalLeadData } });
  };

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
      const isLost =
        lead.isLoss === true ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(lead.leadStatus || "").toUpperCase()) ||
        ["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(lead.status || "").toUpperCase());
      if (isLost) return false;

      const sp = (lead.assignTo || lead.salesPerson || "").toLowerCase();
      const isSelfLead = sp.includes("sales tl") || sp.includes("current") || sp.includes("self") || sp.includes("john") || sp.includes("rahul");
      if (filterScope === "SELF" && !isSelfLead) return false;
      if (filterScope === "TEAM") {
        if (isSelfLead) return false;
        if (filterSalesPerson !== "ALL" && !sp.includes(filterSalesPerson.toLowerCase())) return false;
      }

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
    }).sort((a, b) => {
      const getLeadTime = (lead) => {
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
      return getLeadTime(b) - getLeadTime(a);
    });
  }, [leads, filterScope, filterStatus, filterLeadType, filterJobType, filterLeadLabel, searchTerm]);

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
  const handleSaveSchedule = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!scheduleModalLead) return;

    const activeNotes = scheduleFormData.notes || scheduleFormData.nextDiscussionTopic || "Follow-up scheduled";

    let formattedDisplayDate = scheduleFormData.date;
    if (scheduleFormData.date) {
      try {
        const d = new Date(scheduleFormData.date);
        if (!isNaN(d.getTime())) {
          formattedDisplayDate = d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        }
      } catch (err) {}
    }

    const newHistoryEntry = {
      date: formattedDisplayDate,
      time: scheduleFormData.time || "10:00 am",
      notes: scheduleFormData.notes || activeNotes || "--",
      discussionWithClient: scheduleFormData.notes || activeNotes || "--",
      nextDiscussionTopic: scheduleFormData.nextDiscussionTopic || "--",
      talkToPerson: scheduleFormData.talkToPerson || scheduleModalLead.concernPersonName || scheduleModalLead.clientName || "--",
      personDesignation: scheduleFormData.personDesignation || scheduleModalLead.clientDesignation || "--",
      discussionType: scheduleFormData.type || "Call",
      type: scheduleFormData.type || "Call",
      rep: scheduleModalLead.salesPerson || scheduleFormData.assignedTo || "Sales Manager",
      repDesignation: "Sales Manager",
      department: "Sales",
      status: scheduleFormData.type || "Scheduled"
    };

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
          notes: scheduleFormData.notes || activeNotes,
          nextDiscussionTopic: scheduleFormData.nextDiscussionTopic || item.nextDiscussionTopic,
          talkToPerson: scheduleFormData.talkToPerson || item.talkToPerson,
          personDesignation: scheduleFormData.personDesignation || item.personDesignation,
          assignTo: scheduleFormData.assignedTo || item.assignTo || item.salesPerson
        };
        return updatedTargetLead;
      }
      return item;
    });

    // Update lead in Lead Management Sheet with new followup count and scheduled date
    setLeads(updated);

    if (updatedTargetLead) {
      const targetId = String(updatedTargetLead._id || updatedTargetLead.id || updatedTargetLead.leadId);
      if (targetId) {
        scheduledFollowupCacheRef.current.set(targetId, updatedTargetLead);

        try {
          await addFollowupApi({
            leadId: targetId,
            clientName: updatedTargetLead.clientName,
            phoneNumber: updatedTargetLead.phoneNumber || updatedTargetLead.phone || updatedTargetLead.contact,
            remarks: activeNotes,
            remark: activeNotes,
            notes: activeNotes,
            scheduledDate: scheduleFormData.date,
            nextFollowupDate: scheduleFormData.date,
            date: scheduleFormData.date,
            scheduledTime: scheduleFormData.time || "10:00 am",
            nextFollowupTime: scheduleFormData.time || "10:00 am",
            time: scheduleFormData.time || "10:00 am",
            followupType: scheduleFormData.type || "Call",
            channelType: scheduleFormData.type || "Call",
            assignedTo: scheduleFormData.assignedTo || updatedTargetLead.salesPerson
          });

          await updateLeadApi(targetId, {
            nextFollowupDate: scheduleFormData.date,
            nextFollowupDateRaw: scheduleFormData.date,
            followupTime: scheduleFormData.time || "10:00 am",
            followupRemark: activeNotes,
            isFollowup: true,
            isFollowupScheduled: true,
            followupCount: updatedTargetLead.followupRemarksCount,
            followupRemarksCount: updatedTargetLead.followupRemarksCount,
            followupHistory: updatedTargetLead.followupHistory
          });
        } catch (err) {
          console.error("Error updating lead followup in backend:", err);
        }
      }

      updateLeadInStorage(updatedTargetLead);
    }

    setScheduleModalLead(null);
    toast.success("Follow-up scheduled and lead moved to Follow-up directory! 🎯");
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
              <Link
                to="/sales/leads/add"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span> Add Lead
              </Link>

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
        executives={teamMembers}
      />



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

      {/* ================= MODAL 2B: FOLLOW-UP DETAILS MODAL (FROM BADGE CLICK) ================= */}
      {followupDetailsModalLead && (() => {
        const getOrdinal = (n) => {
          const s = ["th", "st", "nd", "rd"];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        const historyList = (Array.isArray(followupDetailsModalLead.followupHistory) && followupDetailsModalLead.followupHistory.length > 0)
          ? [...followupDetailsModalLead.followupHistory].reverse()
          : (followupDetailsModalLead.notes || followupDetailsModalLead.remark || followupDetailsModalLead.nextFollowupDate || followupDetailsModalLead.isFollowupScheduled)
          ? [{
              repDesignation: "Sales Manager",
              department: "Sales",
              talkToPerson: followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "--",
              discussionType: followupDetailsModalLead.channelType || followupDetailsModalLead.type || "Call",
              personDesignation: followupDetailsModalLead.clientDesignation || "--",
              discussionWithClient: followupDetailsModalLead.notes || followupDetailsModalLead.remark || followupDetailsModalLead.requirement || "--",
              nextDiscussionTopic: followupDetailsModalLead.nextDiscussionTopic || "--"
            }]
          : [];

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="p-5 sm:p-6 pb-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Follow-up Details
                </h2>
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
              <div className="p-5 sm:p-6 max-h-[68vh] overflow-y-auto space-y-6">
                {historyList.length > 0 ? (
                  historyList.map((hist, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="text-base font-extrabold text-slate-900">
                        {getOrdinal(idx + 1)} Follow-up
                      </h3>

                      <div className="rounded-2xl border border-slate-200/90 p-5 bg-white shadow-2xs space-y-4">
                        {/* Row 1: REPRESENTATIVE DESIGNATION, DEPARTMENT, TALKED TO PERSON */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              REPRESENTATIVE DESIGNATION
                            </span>
                            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                              {hist.repDesignation || hist.rep || "Sales Manager"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              DEPARTMENT
                            </span>
                            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                              {hist.department || "Sales"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              TALKED TO PERSON
                            </span>
                            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                              {hist.talkToPerson || followupDetailsModalLead.clientName || followupDetailsModalLead.concernPersonName || "--"}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: DISCUSSION TYPE & TALK TO PERSON DESIGNATION */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              DISCUSSION TYPE
                            </span>
                            <span className="font-extrabold text-purple-600 text-sm mt-0.5 block">
                              {hist.discussionType || hist.type || hist.status || "Call"}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                              TALK TO PERSON DESIGNATION
                            </span>
                            <span className="font-extrabold text-blue-600 text-sm mt-0.5 block">
                              {hist.personDesignation || followupDetailsModalLead.clientDesignation || "--"}
                            </span>
                          </div>
                        </div>

                        {/* Row 3: DISCUSSION WITH CLIENT */}
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                            DISCUSSION WITH CLIENT
                          </span>
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium min-h-[44px]">
                            {hist.discussionWithClient || hist.notes || hist.remark || "--"}
                          </div>
                        </div>

                        {/* Row 4: NEXT DISCUSSION TOPIC */}
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                            NEXT DISCUSSION TOPIC
                          </span>
                          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium min-h-[44px]">
                            {hist.nextDiscussionTopic || "--"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium text-sm">
                    No follow-up details recorded yet.
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

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

      {/* ================= PRE-FILLED SALES MANAGEMENT TRANSFER MODAL ================= */}
      <SalesTransferModal
        isOpen={Boolean(transferModalLead)}
        lead={transferModalLead}
        initialRemark={transferInitialRemark}
        onClose={() => {
          setTransferModalLead(null);
          setTransferInitialRemark("");
        }}
        onSubmit={handleConfirmSalesTransfer}
      />

    </div>
  );
};

export default Lead;