import React from "react";
import {
  FaCheckCircle,
  FaLock,
  FaArrowRight,
  FaCalendarAlt,
  FaFileAlt,
  FaExternalLinkAlt,
  FaRupeeSign
} from "react-icons/fa";
import { PIPELINE_ACCEPTANCE_STATUSES } from "./SubStageFormRenderer";

const FIELD_LABELS = {
  requestDate: "Request Received Date",
  visitCompletedDate: "Visit Completed Date",
  requestInitiatedDate: "Request Initiated Date",
  completionDate: "Completion Date",
  requestReceivingDate: "Request Receiving Date",
  targetSubmissionDate: "Target Submission Date",
  submissionTargetDate: "Target Submission Date",
  formationCompletionDate: "Formation Completion Date",
  formationReceivingDate: "Formation Request Date",
  clientAcceptanceStatus: "Client Acceptance Status",
  constructionRateFinalised: "Finalised Rate (₹ / sqft)",
  bankAcceptedRate: "Bank Accepted Rate (₹ / sqft)",
  contractRateNegotiated: "Negotiated Contract Rate (₹ / sqft)",
  finalContractRate: "Final Contract Rate (₹ / sqft)",
  lastModificationDate: "Last Negotiation / Modification Date",
  quotationFinalisationDate: "Quotation Finalisation Date",
  materialSelectionDate: "Material Selection Start Date",
  contractDraftReceivingDate: "Contract Draft Receiving Date",
  modDate: "Modification / Review Date",
  finalContractSignDate: "Final Contract Sign Date",
  finalQuotationAcceptanceDate: "Final Quotation Acceptance Date",
  handoverDate: "Quotation Handover Date",
  contractFile: "Contract Document",
  notes: "Stage Remarks / Notes"
};

const formatKey = (key) => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatDateVal = (val) => {
  if (!val) return "--";
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const isDateString = (val) => {
  if (typeof val !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}/.test(val);
};

const SavedStageSummaryCard = ({
  stageId,
  stageName,
  stageData = {},
  onNextStage,
  hasNextStage = true
}) => {
  if (!stageData || Object.keys(stageData).length === 0) return null;

  // Filter out internal metadata or empty fields
  const entries = Object.entries(stageData).filter(([key, val]) => {
    if (key === "negotiationCycle" || key === "_id" || key === "id") return false;
    return val !== null && val !== undefined && String(val).trim() !== "";
  });

  const negotiationCycles = Array.isArray(stageData.negotiationCycle)
    ? stageData.negotiationCycle
    : [];

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-300/80 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-200/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <FaCheckCircle className="text-sm" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Stage {stageId} Data Saved & Recorded</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                <FaCheckCircle className="text-[9px]" /> Completed
              </span>
            </h4>
            <p className="text-xs text-slate-500 font-medium">
              Yeh stage successfully complete ho chuki hai aur data safe hai.
            </p>
          </div>
        </div>

        {hasNextStage && onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <span>Proceed to Next Stage</span>
            <FaArrowRight className="text-xs" />
          </button>
        )}
      </div>

      {/* Grid of Saved Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {entries.map(([key, val]) => {
          const label = formatKey(key);

          // Status Badge format
          if (key === "clientAcceptanceStatus") {
            const matched = PIPELINE_ACCEPTANCE_STATUSES.find(
              (s) => s.value === String(val).toUpperCase().trim()
            ) || { badgeClass: "bg-slate-100 text-slate-800 border-slate-300", label: String(val) };

            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold ${matched.badgeClass}`}
                  >
                    {matched.label}
                  </span>
                </div>
              </div>
            );
          }

          // Currency / Rate fields
          if (
            key.toLowerCase().includes("rate") ||
            key.toLowerCase().includes("cost") ||
            key.toLowerCase().includes("price") ||
            key.toLowerCase().includes("budget")
          ) {
            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <p className="text-sm font-extrabold text-emerald-800 flex items-center gap-1">
                  <FaRupeeSign className="text-xs text-emerald-600" />
                  <span>
                    {!isNaN(Number(val)) ? Number(val).toLocaleString("en-IN") : val}
                  </span>
                  <span className="text-[11px] font-normal text-slate-400">/ sqft</span>
                </p>
              </div>
            );
          }

          // File URL fields
          if (
            key.toLowerCase().includes("file") ||
            key.toLowerCase().includes("document") ||
            (typeof val === "string" && (val.startsWith("http://") || val.startsWith("https://")))
          ) {
            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <a
                  href={val}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 underline bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  <FaFileAlt className="text-xs" />
                  <span>View Attached File</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            );
          }

          // Date fields
          if (isDateString(val) || key.toLowerCase().includes("date")) {
            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1"
              >
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {label}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-blue-500 text-xs shrink-0" />
                  <span>{formatDateVal(val)}</span>
                </p>
              </div>
            );
          }

          // Default text/number value
          return (
            <div
              key={key}
              className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-1"
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {label}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 break-words">
                {String(val)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Negotiation Cycles Preview (If any exist) */}
      {negotiationCycles.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2">
          <h5 className="text-xs font-bold uppercase text-slate-700">
            Recorded Negotiation Cycles ({negotiationCycles.length})
          </h5>
          <div className="space-y-2">
            {negotiationCycles.map((cycle, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2"
              >
                <span className="font-bold text-blue-800">Cycle {idx + 1}</span>
                <span className="text-slate-600">
                  Date: {formatDateVal(cycle.date || cycle.cycleDate)}
                </span>
                {cycle.rate && (
                  <span className="font-semibold text-emerald-700">
                    Rate: ₹{cycle.rate}
                  </span>
                )}
                {cycle.remark && (
                  <span className="text-slate-500 italic">"{cycle.remark}"</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedStageSummaryCard;
