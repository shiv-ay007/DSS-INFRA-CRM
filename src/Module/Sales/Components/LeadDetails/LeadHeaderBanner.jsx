import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PageHeader from "../../../../Common/Components/PageHeader";
import { FaEdit, FaPhoneAlt, FaWhatsapp, FaFolderPlus } from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";

const LeadHeaderBanner = ({
  lead,
  onOpenFollowupModal,
  onOpenEditModal,
  allowEdit = false,
  allowAddProject = false
}) => {
  const navigate = useNavigate();
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const phone = lead?.phoneNumber || lead?.contact || lead?.whatsappNumber || "";
  const cleanPhone = phone ? phone.replace(/\D/g, "") : "";

  const assignee = lead?.assignTo || lead?.assignedTo || lead?.salesPerson || "";
  const isAssigned = lead?.isAssigned === true || (!!assignee && assignee !== "Unassigned" && assignee !== "--" && assignee !== "");

  const handleAddProject = () => {
    if (isUserObserver) {
      toast.info("Observer Mode: Adding project is disabled.");
      return;
    }
    const targetId = lead?._id || lead?.id || lead?.leadId;
    navigate(`/sales/leads/sales-form/${targetId}`, {
      state: { lead, returnToLeadDetails: true, from: "salesManagement" }
    });
  };

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
            {/* Add Project Button (Only allowed when navigated from Sales Management Sheet) */}
            {allowAddProject && (
              <button
                type="button"
                onClick={handleAddProject}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all ${
                  isUserObserver
                    ? "bg-slate-400 hover:bg-slate-500 cursor-not-allowed opacity-75"
                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-95 cursor-pointer"
                }`}
                title={isUserObserver ? "Disabled for Observer (View Only)" : "Add / Update Project in Sales Management"}
              >
                <FaFolderPlus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            )}

            {allowEdit && (
              <button
                type="button"
                onClick={onOpenEditModal}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <FaEdit className="w-3.5 h-3.5" />
                <span>Edit Lead</span>
              </button>
            )}

            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <FaPhoneAlt className="w-3.5 h-3.5" />
                <span>Call Client</span>
              </a>
            )}

            {cleanPhone && (
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
          </div>
        }
      />
    </div>
  );
};

export default LeadHeaderBanner;
