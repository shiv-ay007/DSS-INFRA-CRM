import React from "react";
import { FaClipboardList, FaMapMarkerAlt, FaMapMarkedAlt, FaExternalLinkAlt } from "react-icons/fa";

const RequirementAddressCard = ({ lead }) => {
  const rawWorkTypes = lead?.workType;
  const workTypesArray = Array.isArray(rawWorkTypes)
    ? rawWorkTypes
    : typeof rawWorkTypes === "string" && rawWorkTypes.trim()
    ? rawWorkTypes.split(",").map((s) => s.trim()).filter(Boolean)
    : ["General Sales Inquiry"];

  const expectedAmount = lead?.expectedBusiness || lead?.expectedRevenue || lead?.amount || "0";
  const numVal = Number(String(expectedAmount).replace(/[^0-9.]/g, ""));
  const formattedAmount =
    !isNaN(numVal) && numVal > 0
      ? `₹ ${numVal.toLocaleString("en-IN")}`
      : typeof expectedAmount === "string" && expectedAmount.startsWith("₹")
      ? expectedAmount
      : `₹ ${expectedAmount || "0"}`;

  const addressParts = [
    lead?.address,
    lead?.city,
    lead?.state,
    lead?.pincode
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : "--";
  
  const googleLocation = lead?.googleLocation || "";
  const requirement = lead?.requirement || lead?.projectDetail || lead?.projectDetails || "New Lead Inquiry";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100 shadow-2xs">
          <FaClipboardList />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Requirements, Financials & Location
          </h2>
          <p className="text-xs text-slate-500 font-medium">Work categories, deal revenue, and site address</p>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* WORK TYPES / CATEGORIES */}
        <div className="space-y-2">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Work Types / Categories Requested
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {workTypesArray.map((wt, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-xs shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {wt}
              </span>
            ))}
          </div>
        </div>

        {/* FINANCIAL DEAL VALUE */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/80 border border-emerald-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-emerald-800 text-xs font-black uppercase tracking-wider block">
              Expected Business Deal Value
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono mt-1 block">
              {formattedAmount}
            </span>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-xs">
            Pipeline Potential
          </span>
        </div>

        {/* DETAILED REQUIREMENT */}
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Requirement Details & Remarks
          </span>
          <p className="text-slate-800 font-semibold text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {requirement}
          </p>
        </div>

        {/* SITE / CLIENT ADDRESS */}
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-2">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Site / Client Address
          </span>
          <p className="text-slate-900 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-rose-500 shrink-0 text-sm" />
            <span>{address}</span>
          </p>
          {googleLocation && (
            <div className="pt-1">
              <a
                href={googleLocation.startsWith("http") ? googleLocation : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleLocation)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-extrabold text-blue-700 transition-all shadow-2xs"
              >
                <FaMapMarkedAlt className="text-blue-600" />
                <span>Open Google Location Map</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementAddressCard;
