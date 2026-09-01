import React from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import { FaEdit, FaPhoneAlt, FaWhatsapp, FaPlus } from "react-icons/fa";

const LeadHeaderBanner = ({ lead, onOpenFollowupModal, onOpenEditModal }) => {
  const navigate = useNavigate();

  const phone = lead?.phoneNumber || lead?.contact || lead?.whatsappNumber || "";
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  const assignee = lead?.assignTo || lead?.assignedTo || lead?.salesPerson || "";
  const isAssigned = lead?.isAssigned === true || (!!assignee && assignee !== "Unassigned" && assignee !== "--" && assignee !== "");

  return (
    <div className="w-full">
      <PageHeader
        title={`Lead Details: ${lead?.clientName || lead?.concernPersonName || "Customer Detail"}`}
        badge={lead?.leadId || lead?.id || "LD-DETAILS"}
        badgeColor="bg-blue-100 text-blue-800 border-blue-300 font-mono font-extrabold"
        description="Comprehensive view of client inquiry, contact info, requirement details, and follow-up timeline."
        showBackButton={true}
        rightActions={
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <FaEdit className="w-3.5 h-3.5" />
              <span>Edit Lead</span>
            </button>

            {isAssigned && cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <FaPhoneAlt className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
            )}

            {isAssigned && cleanPhone && (
              <a
                href={`https://wa.me/91${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            )}

            {isAssigned && (
              <button
                type="button"
                onClick={onOpenFollowupModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <FaPlus className="w-3.5 h-3.5" />
                <span>Add Remark</span>
              </button>
            )}
          </div>
        }
      />
    </div>
  );
};

export default LeadHeaderBanner;
