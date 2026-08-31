import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LeadHeaderBanner from "./LeadHeaderBanner";
import ClientInfoCard from "./ClientInfoCard";
import LeadOverviewCard from "./LeadOverviewCard";
import RequirementAddressCard from "./RequirementAddressCard";
import FollowupTimelineCard from "./FollowupTimelineCard";
import EditLeadModal from "./EditLeadModal";
import { initialTotalLeads } from "../../data/totalLeadsData";
import { updateLeadInStorage, subscribeToLeadUpdates } from "../../utils/leadStorageUtils";

const LeadDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [lead, setLead] = useState(null);
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchLeadData = () => {
    // 1. Check location state
    if (location.state?.lead && (!id || location.state.lead.id === id)) {
      setLead(location.state.lead);
      return;
    }

    // 2. Check localStorage keys
    try {
      const keys = ["dss_leads", "dss_lead_management_sheet_v1", "dss_assigned_leads", "dss_followup_leads"];
      for (let key of keys) {
        const saved = localStorage.getItem(key);
        if (saved) {
          const list = JSON.parse(saved);
          if (Array.isArray(list)) {
            const found = list.find((item) => String(item.id) === String(id));
            if (found) {
              setLead(found);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error reading lead from storage:", err);
    }

    // 3. Fallback search in initial total leads dataset
    const foundInitial = initialTotalLeads.find((item) => String(item.id) === String(id));
    if (foundInitial) {
      setLead(foundInitial);
      return;
    }

    // 4. Default fallback item if no ID match
    if (initialTotalLeads.length > 0) {
      setLead(initialTotalLeads[0]);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [id, location.state]);

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
  }, [id]);

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
