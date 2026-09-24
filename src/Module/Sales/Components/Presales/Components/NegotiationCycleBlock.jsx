import React, { useMemo } from "react";
import { FaLock, FaCheckCircle, FaBan, FaCalendarAlt } from "react-icons/fa";

/**
 * Reusable Entry Block for Presale Negotiation Cycle
 * Used across:
 * - Sub-Stage 5: Concept Drawing — Formation & Finalisation
 * - Sub-Stage 8: Front Elevation — Formation & Finalisation
 * - Sub-Stage 9: Material Finalisation (with Construction Rate)
 */
const NegotiationCycleBlock = ({
  title = "Negotiation Cycle",
  data = {},
  onChange,
  readOnly = false,
  extraField = null,
  finalDateLabel = "Drawing Finalisation Date"
}) => {
  const wants = data.wantsItem !== false;

  // Auto-calculate Days Count in Modification (between 1st Mod Request Date and Final Drawing Date)
  const daysInMod = useMemo(() => {
    const finalDate = data.finalDrawingDate || data.materialFinalisationDate || data.finalOptionDate;
    if (!data.modDate || !finalDate) return "--";
    const s = new Date(data.modDate).getTime();
    const e = new Date(finalDate).getTime();
    if (isNaN(s) || isNaN(e)) return "--";
    const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
    if (diff < 0) return "Invalid Range";
    if (diff === 0) return "Same Day";
    return `${diff} Day${diff > 1 ? "s" : ""}`;
  }, [data.modDate, data.finalDrawingDate, data.materialFinalisationDate, data.finalOptionDate]);

  const updateField = (field, value) => {
    if (readOnly) return;
    onChange?.({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Toggle: Client Wants This Item? (Y/N) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/80">
        <div>
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            Client Wants This Item? <span className="text-slate-500 font-normal">({title})</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Select 'No' if the client opted out of this specific drawing or scope item (marks stage as N/A).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={readOnly}
            onClick={() => updateField("wantsItem", true)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
              wants
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
            onClick={() => updateField("wantsItem", false)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
              !wants
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100"
            }`}
          >
            <FaBan className="text-xs" />
            <span>NO (N/A)</span>
          </button>
        </div>
      </div>

      {/* 2. Negotiation Cycle Form Fields (If wants is true) */}
      {wants ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Row 1: Request Receiving Date & 1st Option Given Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Request Receiving Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={data.requestDate || ""}
                onChange={(e) => updateField("requestDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1st Option Given Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={data.optionDate || ""}
                onChange={(e) => updateField("optionDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Row 2: Options Count & Option Finalisation Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Options Count
              </label>
              <input
                type="number"
                min="1"
                max="50"
                disabled={readOnly}
                value={data.optionsCount ?? 1}
                onChange={(e) => updateField("optionsCount", Number(e.target.value) || 1)}
                placeholder="e.g. 2"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Option Finalisation Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={data.finalOptionDate || ""}
                onChange={(e) => updateField("finalOptionDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Row 3: 1st Modification Request Date & Days Count in Modification (Auto-calculated) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1st Modification Request Date
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={data.modDate || ""}
                onChange={(e) => updateField("modDate", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Days Count in Modification</span>
                <span className="text-[10px] text-blue-600 font-normal">Auto-calculated</span>
              </label>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 bg-slate-100/90 text-slate-700 text-xs sm:text-sm font-bold font-mono">
                <span className={daysInMod !== "--" ? "text-blue-700" : "text-slate-400"}>
                  [ {daysInMod} ]
                </span>
                <FaLock className="text-slate-400 text-xs" title="Auto-calculated from Mod Date to Final Date" />
              </div>
            </div>
          </div>

          {/* Row 4: Final Drawing / Item Finalisation Date & Extra Field (e.g. Construction Rate) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {finalDateLabel}
              </label>
              <input
                type="date"
                disabled={readOnly}
                value={data.finalDrawingDate || data.materialFinalisationDate || ""}
                onChange={(e) => {
                  updateField("finalDrawingDate", e.target.value);
                  updateField("materialFinalisationDate", e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            {extraField && <div>{extraField}</div>}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
          <FaBan className="text-amber-600 shrink-0 text-sm" />
          <span>
            This item is marked as <strong>Not Required (N/A)</strong> by the client. You can toggle back to YES anytime if the requirement changes.
          </span>
        </div>
      )}
    </div>
  );
};

export default NegotiationCycleBlock;
