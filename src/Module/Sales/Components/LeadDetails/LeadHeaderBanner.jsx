import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";

const LeadHeaderBanner = ({ lead, onOpenFollowupModal }) => {
  const navigate = useNavigate();

  const getStatusBadgeClass = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("HOT")) return "bg-rose-100 text-rose-800 border-rose-300";
    if (s.includes("WARM") || s.includes("INTERESTED")) return "bg-amber-100 text-amber-800 border-amber-300";
    if (s.includes("COLD")) return "bg-sky-100 text-sky-800 border-sky-300";
    return "bg-emerald-100 text-emerald-800 border-emerald-300";
  };

  const phone = lead?.phoneNumber || lead?.contact || lead?.whatsappNumber || "";
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Lead Details: ${lead?.clientName || lead?.concernPersonName || "Customer Detail"}`}
        badge={lead?.id || "LD-DETAILS"}
        badgeColor="bg-blue-100 text-blue-800 border-blue-300"
        description="Comprehensive view of client inquiry, contact info, requirement details, and follow-up timeline."
        showBackButton={true}
        rightActions={
          <div className="flex flex-wrap items-center gap-2">
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>Call Client</span>
              </a>
            )}

            {cleanPhone && (
              <a
                href={`https://wa.me/91${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <span>💬 WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              onClick={onOpenFollowupModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>+ Add Remark</span>
            </button>
          </div>
        }
      />
    </div>
  );
};

export default LeadHeaderBanner;
