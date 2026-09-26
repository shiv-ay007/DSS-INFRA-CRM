import React, { useMemo } from "react";
import { FaBan, FaLock, FaCheckCircle } from "react-icons/fa";
import NegotiationCycleBlock from "./NegotiationCycleBlock";
import { PIPELINE_STAGES, isStageApplicable } from "./PresalesStepper";

export const PIPELINE_ACCEPTANCE_STATUSES = [
  {
    value: "NOT ATTENDED",
    label: "NOT ATTENDED",
    badgeClass: "bg-amber-100 text-amber-900 border border-amber-300 font-semibold"
  },
  {
    value: "ACCEPTED",
    label: "ACCEPTED",
    badgeClass: "bg-emerald-600 text-white font-bold shadow-2xs"
  },
  {
    value: "INTERESTED - WANT NEGOTIATION",
    label: "INTERESTED - WANT NEGOTIATION",
    badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold"
  },
  {
    value: "INTERESTED - WANT MODIFICATION",
    label: "INTERESTED - WANT MODIFICATION",
    badgeClass: "bg-sky-100 text-sky-800 border border-sky-300 font-semibold"
  },
  {
    value: "ATTENDED - NOT INTERESTED",
    label: "ATTENDED - NOT INTERESTED",
    badgeClass: "bg-rose-700 text-white font-bold shadow-2xs"
  },
  {
    value: "NO RESPONSE FROM LONG TIME - BY CLIENT",
    label: "NO RESPONSE FROM LONG TIME - BY CLIENT",
    badgeClass: "bg-[#4a2e18] text-white font-bold shadow-2xs"
  }
];

const AcceptanceStatusSelect = ({ value, onChange, disabled }) => {
  const normalizedValue = String(value || "").toUpperCase().trim();
  const current =
    PIPELINE_ACCEPTANCE_STATUSES.find(
      (s) => s.value === normalizedValue || s.value.startsWith(normalizedValue)
    ) || PIPELINE_ACCEPTANCE_STATUSES[0];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Status <span className="text-[10px] text-slate-400 font-normal">(Client Acceptance)</span>
        </label>
        <span
          className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wide inline-block ${current.badgeClass}`}
        >
          {current.label}
        </span>
      </div>
      <select
        disabled={disabled}
        value={current.value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500 cursor-pointer"
      >
        {PIPELINE_ACCEPTANCE_STATUSES.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-800 font-medium py-1">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const SubStageFormRenderer = ({
  stageId = 1,
  stageData = {},
  onChange,
  engagementScope = "Design + Construction",
  readOnly = false
}) => {
  const applicable = isStageApplicable(stageId, engagementScope);
  const stageConfig = PIPELINE_STAGES.find((s) => s.id === stageId) || PIPELINE_STAGES[0];

  const updateField = (field, value) => {
    if (readOnly) return;
    onChange?.({
      ...stageData,
      [field]: value
    });
  };

  // Stage 11 Auto-calculated Days in Modification
  const daysInModContract = useMemo(() => {
    if (!stageData.modDate || !stageData.finalContractSignDate) return "--";
    const s = new Date(stageData.modDate).getTime();
    const e = new Date(stageData.finalContractSignDate).getTime();
    if (isNaN(s) || isNaN(e)) return "--";
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Invalid Range";
    if (diff === 0) return "Same Day";
    return `${diff} Day${diff > 1 ? "s" : ""}`;
  }, [stageData.modDate, stageData.finalContractSignDate]);

  if (!applicable) {
    return (
      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
        <FaBan className="text-3xl text-slate-400 mx-auto" />
        <h4 className="text-sm font-bold text-slate-700">Sub-Stage Not Applicable</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Stage {stageId} ({stageConfig.fullName}) is not part of the client's current Engagement Scope (
          <span className="font-bold text-blue-700">{engagementScope}</span>).
        </p>
      </div>
    );
  }

  switch (stageId) {
    // ----------------------------------------------------
    // STAGE 1: Visit
    // ----------------------------------------------------
    case 1:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Received Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.requestDate || ""}
                onChange={(e) => updateField("requestDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Visit Completed Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.visitCompletedDate || ""}
                onChange={(e) => updateField("visitCompletedDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>
      );

    // ----------------------------------------------------
    // STAGE 2: Site Briefing
    // ----------------------------------------------------
    case 2:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Request Initiated Date
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={stageData.requestInitiatedDate || ""}
              onChange={(e) => updateField("requestInitiatedDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Completion Date
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={stageData.completionDate || ""}
              onChange={(e) => updateField("completionDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>
      );

    // ----------------------------------------------------
    // STAGE 3: Tentative Quotation — Formation
    // ----------------------------------------------------
    case 3:
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Request Receiving Date
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={stageData.requestReceivingDate || ""}
              onChange={(e) => updateField("requestReceivingDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Work Start Date
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={stageData.workStartDate || ""}
              onChange={(e) => updateField("workStartDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Completion & Sent-to-Client Date
            </label>
            <input
              type="date"
              disabled={readOnly}
              value={stageData.completionDate || ""}
              onChange={(e) => updateField("completionDate", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
            />
          </div>
        </div>
      );

    // ----------------------------------------------------
    // STAGE 4: Tentative Quotation — Client Acceptance
    // ----------------------------------------------------
    case 4: {
      const daysInMod = (() => {
        if (!stageData.lastNegotiationDate || !stageData.finalisationDate) return null;
        const s = new Date(stageData.lastNegotiationDate).getTime();
        const e = new Date(stageData.finalisationDate).getTime();
        if (isNaN(s) || isNaN(e)) return null;
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
        if (diff < 0) return null;
        return diff === 0 ? "Same Day" : `${diff} Day${diff > 1 ? "s" : ""}`;
      })();

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status (Exact 6 Google Sheet options with visual badge) */}
            <AcceptanceStatusSelect
              value={stageData.status || stageData.acceptanceStatus}
              onChange={(val) => {
                updateField("status", val);
                updateField("acceptanceStatus", val);
              }}
              disabled={readOnly}
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Construction Rate (INR / sqft) Finalised
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={stageData.constructionRate || ""}
                onChange={(e) => updateField("constructionRate", Number(e.target.value) || 0)}
                placeholder="e.g. 1850"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Last Modification / Negotiation Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.lastNegotiationDate || ""}
                onChange={(e) => updateField("lastNegotiationDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tentative Quotation Finalisation Date</span>
                {daysInMod && (
                  <span className="text-[10px] text-blue-600 font-semibold font-mono">
                    ({daysInMod} in negotiation)
                  </span>
                )}
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.finalisationDate || ""}
                onChange={(e) => updateField("finalisationDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // STAGE 5: Concept Drawing — Formation & Finalisation
    // ----------------------------------------------------
    case 5:
      return (
        <NegotiationCycleBlock
          title="Concept Drawing"
          data={stageData}
          onChange={onChange}
          readOnly={readOnly}
        />
      );

    // ----------------------------------------------------
    // STAGE 6: Bank Quotation — Formation & Handover
    // ----------------------------------------------------
    case 6: {
      const wantsBank = stageData.wantsBank !== false;
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Client Wants Bank Quotation? (Y/N)
              </p>
              <p className="text-[11px] text-slate-500">
                If the client does not require bank loan estimation quotation, mark as NO.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateField("wantsBank", true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  wantsBank
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <FaCheckCircle className="text-xs" />
                <span>YES</span>
              </button>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateField("wantsBank", false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  !wantsBank
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <FaBan className="text-xs" />
                <span>NO (N/A)</span>
              </button>
            </div>
          </div>

          {wantsBank ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Given-to-Client Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.givenToClientDate || ""}
                onChange={(e) => updateField("givenToClientDate", e.target.value)}
                className="w-full sm:w-1/2 px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
              <FaBan className="text-amber-600 shrink-0 text-sm" />
              <span>Bank Quotation is marked as Not Required (N/A).</span>
            </div>
          )}
        </div>
      );
    }

    // ----------------------------------------------------
    // STAGE 7: Structure Work — Formation
    // ----------------------------------------------------
    case 7: {
      const wantsStructure = stageData.wantsStructure !== false;
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                Client Wants Structure Work? (Y/N)
              </p>
              <p className="text-[11px] text-slate-500">
                Structure drawings/calculation requirement toggle.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateField("wantsStructure", true)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  wantsStructure
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <FaCheckCircle className="text-xs" />
                <span>YES</span>
              </button>
              <button
                type="button"
                disabled={readOnly}
                onClick={() => updateField("wantsStructure", false)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                  !wantsStructure
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
                }`}
              >
                <FaBan className="text-xs" />
                <span>NO (N/A)</span>
              </button>
            </div>
          </div>

          {wantsStructure ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Request Receiving Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.requestReceivingDate || ""}
                  onChange={(e) => updateField("requestReceivingDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Start Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.workStartDate || ""}
                  onChange={(e) => updateField("workStartDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Completion Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.workCompletionDate || ""}
                  onChange={(e) => updateField("workCompletionDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
              <FaBan className="text-amber-600 shrink-0 text-sm" />
              <span>Structure Work is marked as Not Required (N/A).</span>
            </div>
          )}
        </div>
      );
    }

    // ----------------------------------------------------
    // STAGE 8: Front Elevation — Formation & Finalisation
    // ----------------------------------------------------
    case 8:
      return (
        <NegotiationCycleBlock
          title="Front Elevation"
          data={stageData}
          onChange={onChange}
          readOnly={readOnly}
        />
      );

    // ----------------------------------------------------
    // STAGE 9: Material Finalisation
    // ----------------------------------------------------
    case 9:
      return (
        <NegotiationCycleBlock
          title="Material Finalisation"
          data={stageData}
          onChange={onChange}
          readOnly={readOnly}
          finalDateLabel="Material Finalisation Date"
          extraField={
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Construction Rate (per sqft) Given to Client
              </label>
              <input
                type="number"
                disabled={readOnly}
                value={stageData.constructionRate || ""}
                onChange={(e) => updateField("constructionRate", Number(e.target.value) || 0)}
                placeholder="e.g. 1950"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          }
        />
      );

    // ----------------------------------------------------
    // STAGE 10: Final Quotation — Formation & Client Acceptance
    // ----------------------------------------------------
    case 10: {
      const daysInMod = (() => {
        if (!stageData.lastNegotiationDate || !stageData.finalisationDate) return null;
        const s = new Date(stageData.lastNegotiationDate).getTime();
        const e = new Date(stageData.finalisationDate).getTime();
        if (isNaN(s) || isNaN(e)) return null;
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
        if (diff < 0) return null;
        return diff === 0 ? "Same Day" : `${diff} Day${diff > 1 ? "s" : ""}`;
      })();

      return (
        <div className="space-y-6">
          {/* Section 1: Formation = Final Quotation */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>10.1 Formation — Final Quotation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Request Receiving Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.requestReceivingDate || ""}
                  onChange={(e) => updateField("requestReceivingDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Start Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.workStartDate || ""}
                  onChange={(e) => updateField("workStartDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Work Completion & Send to Client Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.completionDate || ""}
                  onChange={(e) => updateField("completionDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Client Acceptance = Final Quotation */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>10.2 Client Acceptance — Final Quotation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AcceptanceStatusSelect
                value={stageData.status || stageData.acceptanceStatus}
                onChange={(val) => {
                  updateField("status", val);
                  updateField("acceptanceStatus", val);
                }}
                disabled={readOnly}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Construction Rate (INR / sqft) Finalised
                </label>
                <input
                  type="number"
                  disabled={readOnly}
                  value={stageData.finalRate || stageData.constructionRate || ""}
                  onChange={(e) => {
                    const num = Number(e.target.value) || 0;
                    updateField("finalRate", num);
                    updateField("constructionRate", num);
                  }}
                  placeholder="e.g. 1950"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Last Modification / Negotiation Date
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.lastNegotiationDate || ""}
                  onChange={(e) => updateField("lastNegotiationDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Final Quotation Finalisation Date</span>
                  {daysInMod && (
                    <span className="text-[10px] text-blue-600 font-semibold font-mono">
                      ({daysInMod} in negotiation)
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  disabled={readOnly}
                  value={stageData.finalisationDate || ""}
                  onChange={(e) => updateField("finalisationDate", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ----------------------------------------------------
    // STAGE 11: Contract Formation & Acceptance
    // ----------------------------------------------------
    case 11:
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Receiving Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.requestReceivingDate || ""}
                onChange={(e) => updateField("requestReceivingDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1st Modification Request Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.modDate || ""}
                onChange={(e) => updateField("modDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Days Count in Modification</span>
                <span className="text-[10px] text-blue-600 font-normal">Auto-calculated</span>
              </label>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-100/90 text-slate-700 text-xs sm:text-sm font-bold font-mono">
                <span className={daysInModContract !== "--" ? "text-blue-700" : "text-slate-400"}>
                  [ {daysInModContract} ]
                </span>
                <FaLock className="text-slate-400 text-xs" title="Auto-calculated from Mod Date to Contract Sign Date" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Final Contract Sign Date</span>
                <span className="text-rose-500 text-xs">* Required for Active Project</span>
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={stageData.finalContractSignDate || ""}
                onChange={(e) => updateField("finalContractSignDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500 ring-1 ring-emerald-300"
              />
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export default SubStageFormRenderer;
