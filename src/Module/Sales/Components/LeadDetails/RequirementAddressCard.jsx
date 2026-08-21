import React from "react";

const RequirementAddressCard = ({ lead }) => {
  const rawWorkTypes = lead?.workType;
  const workTypesArray = Array.isArray(rawWorkTypes)
    ? rawWorkTypes
    : typeof rawWorkTypes === "string" && rawWorkTypes.trim()
    ? [rawWorkTypes]
    : ["General Sales Inquiry"];

  const expectedAmount = lead?.expectedBusiness || lead?.expectedRevenue || lead?.amount || "0";
  const formattedAmount =
    typeof expectedAmount === "number"
      ? `₹ ${expectedAmount.toLocaleString("en-IN")}`
      : expectedAmount.startsWith("₹")
      ? expectedAmount
      : `₹ ${expectedAmount}`;

  const address = lead?.address || `${lead?.city || ""}, ${lead?.state || ""} - ${lead?.pincode || ""}`.trim() || "--";
  const googleLocation = lead?.googleLocation || "";
  const requirement = lead?.requirement || lead?.projectDetails || "New Lead Inquiry";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100 shadow-2xs">
            📝
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Requirements, Financials & Location
            </h2>
            <p className="text-xs text-slate-500 font-medium">Work categories, deal revenue, and site address</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* Work Types / Categories */}
        <div className="space-y-1.5">
          <span className="text-slate-500 text-xs font-medium block">Work Type / Categories</span>
          <div className="flex flex-wrap gap-1.5">
            {workTypesArray.map((wt, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs shadow-2xs"
              >
                {wt}
              </span>
            ))}
          </div>
        </div>

        {/* Financial Deal Value */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider block">
              Expected Business Deal Value
            </span>
            <span className="text-2xl font-black text-emerald-800 font-mono mt-0.5 block">
              {formattedAmount}
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black font-mono">
            Pipeline Potential
          </span>
        </div>

        {/* Detailed Requirement */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Requirement Details & Remarks</span>
          <p className="text-slate-800 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {requirement}
          </p>
        </div>

        {/* Site / Client Address */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <span className="text-slate-500 text-xs font-medium block">Site / Client Address</span>
          <p className="text-slate-900 font-bold text-xs sm:text-sm">
            {address}
          </p>
          {googleLocation && (
            <a
              href={googleLocation.startsWith("http") ? googleLocation : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleLocation)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
            >
              <span>📍 Open Google Location Map</span>
              <span>↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementAddressCard;
