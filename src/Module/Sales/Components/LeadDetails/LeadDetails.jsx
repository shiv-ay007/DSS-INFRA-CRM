import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import LeadHeaderBanner from "./LeadHeaderBanner";
import ClientInfoCard from "./ClientInfoCard";
import LeadOverviewCard from "./LeadOverviewCard";
import RequirementAddressCard from "./RequirementAddressCard";
import FollowupTimelineCard from "./FollowupTimelineCard";
import { initialTotalLeads } from "../../data/totalLeadsData";

const LeadDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [lead, setLead] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. Check location state
    if (location.state?.lead) {
      setLead(location.state.lead);
      return;
    }

    // 2. Check localStorage (dss_leads & dss_lead_management_sheet_v1)
    try {
      const savedTotal = localStorage.getItem("dss_leads");
      if (savedTotal) {
        const list = JSON.parse(savedTotal);
        const found = list.find((item) => item.id === id);
        if (found) {
          setLead(found);
          return;
        }
      }
      const savedSheet = localStorage.getItem("dss_lead_management_sheet_v1");
      if (savedSheet) {
        const list = JSON.parse(savedSheet);
        const found = list.find((item) => item.id === id);
        if (found) {
          setLead(found);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // 3. Check initialTotalLeads dataset
    const foundInitial = initialTotalLeads.find((item) => item.id === id);
    if (foundInitial) {
      setLead(foundInitial);
      return;
    }

    // 4. Default fallback item
    if (initialTotalLeads.length > 0) {
      setLead(initialTotalLeads[0]);
    }
  }, [id, location.state]);

  const handleAddRemark = (remarkData) => {
    if (!lead) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const formattedTime = today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newHistory = [
      {
        date: formattedDate,
        time: formattedTime,
        author: "Sales Representative",
        remark: remarkData.remark,
        status: remarkData.status
      },
      ...(lead.followupHistory || [])
    ];

    const updatedLead = {
      ...lead,
      status: remarkData.status || lead.status,
      nextFollowup: remarkData.nextDate || lead.nextFollowup,
      followupHistory: newHistory
    };

    setLead(updatedLead);

    // Save to localStorage if possible
    try {
      const saved = localStorage.getItem("dss_lead_management_sheet_v1");
      const currentLeads = saved ? JSON.parse(saved) : [];
      const updatedList = currentLeads.map((item) => (item.id === lead.id ? updatedLead : item));
      localStorage.setItem("dss_lead_management_sheet_v1", JSON.stringify(updatedList));
    } catch (err) {
      console.error(err);
    }
  };

  if (!lead) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading lead details...
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans pb-16 w-full min-h-screen bg-[#F8FAFC]">
      {/* 1. HEADER BANNER */}
      <LeadHeaderBanner lead={lead} onOpenFollowupModal={() => setShowModal(true)} />

      {/* 2. GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (8 COLS): CLIENT INFO, REQUIREMENTS, & TIMELINE */}
        <div className="lg:col-span-8 space-y-5">
          <ClientInfoCard lead={lead} />
          <RequirementAddressCard lead={lead} />
          <FollowupTimelineCard lead={lead} onAddRemark={handleAddRemark} />
        </div>

        {/* RIGHT COLUMN (4 COLS): LEAD OVERVIEW METADATA */}
        <div className="lg:col-span-4 space-y-5">
          <LeadOverviewCard lead={lead} />
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;
