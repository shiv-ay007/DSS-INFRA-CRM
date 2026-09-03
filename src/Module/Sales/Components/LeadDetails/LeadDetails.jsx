import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "react-router-dom";
import LeadHeaderBanner from "./LeadHeaderBanner";
import ClientInfoCard from "./ClientInfoCard";
import LeadOverviewCard from "./LeadOverviewCard";
import RequirementAddressCard from "./RequirementAddressCard";
import FollowupTimelineCard from "./FollowupTimelineCard";
import EditLeadModal from "./EditLeadModal";
import { updateLeadInStorage, subscribeToLeadUpdates } from "../../utils/leadStorageUtils";
import { getLeadByIdApi } from "../../../../services/totalLeads.api";

const LeadDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [lead, setLead] = useState(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchLeadData = useCallback(async () => {
    // 1. Check location state
    if (location.state?.lead && (!id || String(location.state.lead.id || location.state.lead._id) === String(id))) {
      setLead(location.state.lead);
      return;
    }

    // 2. Fetch from Backend API
    if (id) {
      try {
        const res = await getLeadByIdApi(id);
        if (res && res.success && res.data) {
          const backendLead = res.data.lead || res.data;
          const dateObj = new Date(backendLead.createdAt || Date.now());
          const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
          const assignee = backendLead.salesPerson || (typeof backendLead.assignedTo === 'object' ? backendLead.assignedTo?.name : backendLead.assignedTo) || "";

          setLead({
            id: backendLead.leadId || backendLead._id,
            leadId: backendLead.leadId || backendLead._id,
            _id: backendLead._id,
            clientName: backendLead.clientName || "Client",
            concernPersonName: backendLead.clientName || "Client",
            phoneNumber: backendLead.phoneNumber || backendLead.phone || "--",
            alternateNumber: backendLead.alternateNumber || "--",
            emailAddress: backendLead.emailAddress || backendLead.email || "--",
            status: backendLead.leadStatus || backendLead.status || "Warm",
            leadStatus: backendLead.leadStatus || backendLead.status || "Warm",
            leadMode: backendLead.leadMode || backendLead.leadSource || "Business networking",
            workCategory: backendLead.workCategory || "Design",
            workType: Array.isArray(backendLead.workType) ? backendLead.workType : (backendLead.workType ? [backendLead.workType] : ["Concept Drawing"]),
            expectedBusiness: String(backendLead.expectedBusiness || backendLead.budget || 0),
            salesPerson: assignee,
            createdDate: formattedDate,
            date: formattedDate,
            address: backendLead.address || "--",
            projectDetail: backendLead.projectDetail || backendLead.remark || "",
            remarkAttachments: backendLead.remarkAttachments || backendLead.attachments || [],
            attachments: backendLead.remarkAttachments || backendLead.attachments || []
          });
        }
      } catch (err) {
        console.error("Error fetching lead details from API:", err);
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  // Subscribe to live lead updates across components
  useEffect(() => {
    const unsubscribe = subscribeToLeadUpdates((updatedData) => {
      if (updatedData?.lead && String(updatedData.lead.id) === String(id)) {
        setLead(updatedData.lead);
      } else {
        fetchLeadData();
      }
    });
    return () => unsubscribe();
  }, [id, fetchLeadData]);

  const handleAddRemark = (remarkData) => {
    if (!lead) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const existingHistory = Array.isArray(lead.followupHistory) && lead.followupHistory.length > 0
      ? lead.followupHistory
      : [
          {
            date: lead?.nextFollowup || lead?.nextFollowupDate || lead?.createdDate || formattedDate,
            time: lead?.nextFollowupTime || "11:00 AM",
            author: lead?.assignTo || lead?.salesPerson || "Sales Representative",
            remark: lead?.remark || lead?.notes || `Follow-up discussion scheduled with ${lead?.clientName || lead?.concernPersonName || "client"}. Requirement: ${lead?.requirement || "Sales Inquiry"}.`,
            status: lead?.status || "INTERESTED"
          },
          {
            date: lead?.createdDate || lead?.date || "16 Aug 2026",
            time: lead?.createdTime || "10:00 AM",
            author: lead?.assignTo || lead?.salesPerson || "Sales Representative",
            remark: `Initial lead inquiry registered in pipeline. Channel: ${lead?.channelType || lead?.channel || "Sales"}.`,
            status: "NEW"
          }
        ];

    let formattedNextDate = remarkData.nextDate;
    if (remarkData.nextDate && remarkData.nextDate.includes("-")) {
      const parts = remarkData.nextDate.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        formattedNextDate = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      }
    }

    const newHistory = [
      {
        date: formattedDate,
        time: formattedTime,
        author: lead?.assignTo || "Sales Representative",
        remark: remarkData.remark,
        status: remarkData.status || lead?.status || "INTERESTED"
      },
      ...existingHistory
    ];

    const updatedLead = {
      ...lead,
      status: remarkData.status || lead.status,
      nextFollowup: formattedNextDate || lead.nextFollowup || lead.nextFollowupDate,
      nextFollowupDate: formattedNextDate || lead.nextFollowupDate || lead.nextFollowup,
      followupHistory: newHistory
    };

    setLead(updatedLead);
    updateLeadInStorage(updatedLead);
  };

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-4"></div>
        <p className="text-slate-600 font-bold text-base">Loading Lead Details...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. HEADER BANNER */}
        <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
          <LeadHeaderBanner
            lead={lead}
            onOpenFollowupModal={() => setShowFollowupModal(true)}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />
        </div>

        {/* 2. GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN (8 COLS): CLIENT INFO, REQUIREMENTS, & TIMELINE */}
          <div className="lg:col-span-8 space-y-6">
            <ClientInfoCard lead={lead} />
            <RequirementAddressCard lead={lead} />
            <FollowupTimelineCard lead={lead} onAddRemark={handleAddRemark} />
          </div>

          {/* RIGHT COLUMN (4 COLS): LEAD OVERVIEW METADATA */}
          <div className="lg:col-span-4 space-y-6 sticky top-6">
            <LeadOverviewCard lead={lead} />
          </div>
        </div>

        {/* EDIT LEAD MODAL */}
        <EditLeadModal
          lead={lead}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSaveSuccess={(updated) => setLead(updated)}
        />
      </div>
    </div>
  );
};

export default LeadDetails;
