import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import DashboardMetrics from "./DashboardMetrics";
import FollowupsDueToday from "./FollowupsDueToday";
import LeadStatusBreakdown from "./LeadStatusBreakdown";
import RecentLeadsTable from "./RecentLeadsTable";
import { metricsData as defaultMetrics, initialFollowups, statusBreakdownData as defaultStatus, recentLeadsData as defaultRecent } from "../../data/dashboardData";
import { subscribeToLeadUpdates, getStoredLeads, getScheduledLeadsFromCache } from "../../utils/leadStorageUtils";
import { getAllLeadsApi } from "../../../../services/totalLeads.api";
import { getFollowupLeadsApi } from "../../../../services/followup.api";
import { getDashboardStatsApi } from "../../../../services/dashboard.api";
import { useLeadContext } from "../../../../context/LeadContext";

const Salesdash = () => {
  const { getCachedData, setCachedData } = useLeadContext();
  const [leads, setLeads] = useState(() => {
    return getStoredLeads("dss_leads");
  });
  const [scheduledFollowups, setScheduledFollowups] = useState([]);

  useEffect(() => {
    const handleRefresh = () => {
      setLeads(getStoredLeads("dss_leads"));
    };
    const unsubscribe = subscribeToLeadUpdates(handleRefresh);

    const fetchBackendData = async () => {
      const cacheKey = "dashboard_leads_all";
      const cached = getCachedData(cacheKey);
      if (cached && Array.isArray(cached.data) && cached.data.length > 0) {
        setLeads(cached.data);
      }

      try {
        const [leadsRes, followupRes] = await Promise.allSettled([
          getAllLeadsApi({ limit: 100, isLoss: false }),
          getFollowupLeadsApi({ limit: 20, isLoss: false })
        ]);

        if (leadsRes.status === "fulfilled" && leadsRes.value && leadsRes.value.success && leadsRes.value.data?.leads) {
          const apiLeads = leadsRes.value.data.leads
            .filter((l) => !l.isLoss && !["LOSS", "LOST", "CLOSED_LOST", "CLOSED_LOSS"].includes(String(l.leadStatus || l.status || "").toUpperCase()))
            .map((backendLead) => {
            const dateObj = new Date(backendLead.createdAt || Date.now());
            const formattedDate = dateObj.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });

            const cleanLeadId = backendLead.leadId || (backendLead._id && !String(backendLead._id).match(/^[0-9a-fA-F]{24}$/) ? backendLead._id : `LD-${String(backendLead._id).slice(-4).toUpperCase()}`);

            return {
              ...backendLead,
              id: cleanLeadId,
              leadId: cleanLeadId,
              _id: backendLead._id,
              clientName: backendLead.clientName || "Client",
              concernPersonName: backendLead.clientName || "Client",
              phoneNumber: backendLead.phoneNumber || backendLead.phone || "--",
              contact: backendLead.phoneNumber || backendLead.phone || "--",
              emailAddress: backendLead.emailAddress || backendLead.email || "--",
              status: backendLead.leadStatus || backendLead.status || "Warm",
              leadStatus: backendLead.leadStatus || backendLead.status || "Warm",
              leadMode: backendLead.leadMode || backendLead.leadSource || "Direct Call",
              expectedBusiness: backendLead.expectedBusiness || backendLead.budget || 0,
              createdDate: formattedDate,
              date: formattedDate,
              address: backendLead.address || backendLead.city || "--",
              projectDetail: backendLead.projectDetail || backendLead.requirement || "Project Inquiry",
              nextFollowupDate: backendLead.nextFollowupDate || backendLead.nextFollowupDateRaw || "",
              nextFollowupTime: backendLead.nextFollowupTime || backendLead.followupTime || "",
              workType: Array.isArray(backendLead.workType) ? backendLead.workType : (backendLead.workType ? [backendLead.workType] : []),
              workCategory: backendLead.workCategory || "Design"
            };
          });

          const stored = getStoredLeads("dss_leads");
          const merged = [...stored];
          apiLeads.forEach((bLead) => {
            if (!merged.some((m) => String(m.id) === String(bLead.id))) {
              merged.push(bLead);
            }
          });
          setLeads(merged);
          setCachedData(cacheKey, merged);
        }

        if (followupRes.status === "fulfilled" && followupRes.value && followupRes.value.success && followupRes.value.data?.leads) {
          setScheduledFollowups(followupRes.value.data.leads);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    };

    fetchBackendData();
    return () => unsubscribe();
  }, [getCachedData, setCachedData]);

  // 1. Dynamic Top 4 Metrics Cards
  const dynamicMetrics = useMemo(() => {
    const total = leads.length;
    const hotCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "hot").length;
    const warmCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "warm").length;
    const coldCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "cold").length;

    return defaultMetrics.map((m) => {
      if (m.id === "total") return { ...m, value: String(total) };
      if (m.id === "hot") return { ...m, value: String(hotCount) };
      if (m.id === "warm") return { ...m, value: String(warmCount) };
      if (m.id === "cold") return { ...m, value: String(coldCount) };
      return m;
    });
  }, [leads]);

  // 2. Dynamic Follow-ups Due Today
  const dynamicFollowups = useMemo(() => {
    const cachedScheduled = getScheduledLeadsFromCache();
    const combinedFollowups = [...scheduledFollowups];
    cachedScheduled.forEach((item) => {
      const id = String(item._id || item.id || item.leadId);
      if (!combinedFollowups.some((f) => String(f._id || f.id || f.leadId) === id)) {
        combinedFollowups.unshift(item);
      }
    });

    let listToUse = combinedFollowups;
    if (listToUse.length === 0) {
      listToUse = leads.filter(
        (l) => l.isFollowupScheduled || l.nextFollowupDate || (Array.isArray(l.followupHistory) && l.followupHistory.length > 0)
      );
    }
    if (listToUse.length === 0) {
      listToUse = leads.slice(0, 4);
    }

    return listToUse.slice(0, 5).map((l, index) => {
      const timeVal = l.nextFollowupTime || l.followupTime || (l.createdTime ? l.createdTime : "10:00 AM");
      const tagVal = Array.isArray(l.workType)
        ? (l.workType[0] || l.workCategory || "Followup Call")
        : (l.workType || l.workCategory || "Followup Call");

      return {
        id: l.leadId || l._id || l.id || index + 1,
        name: l.clientName || l.concernPersonName || "Client",
        company: l.projectDetail || l.companyName || l.address || l.workCategory || "Project Inquiry",
        time: timeVal,
        phone: l.phoneNumber || l.contact || l.phone || "--",
        tag: tagVal
      };
    });
  }, [scheduledFollowups, leads]);

  // 3. Dynamic Lead Status Breakdown (Donut Data)
  const { statusBreakdown, totalLeadsCount, conversionRate } = useMemo(() => {
    const total = leads.length;
    const hotCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "hot").length;
    const warmCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "warm").length;
    const coldCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "cold").length;
    const newCount = leads.filter((l) => (l.leadStatus || l.status || "").toLowerCase() === "new" || l.leadType === "FRESH").length;

    const hotPct = total > 0 ? Math.round((hotCount / total) * 100) : 0;
    const warmPct = total > 0 ? Math.round((warmCount / total) * 100) : 0;
    const coldPct = total > 0 ? Math.round((coldCount / total) * 100) : 0;
    const newPct = total > 0 ? Math.max(0, 100 - (hotPct + warmPct + coldPct)) : 0;

    const formattedBreakdown = [
      { label: "Hot Leads", count: hotCount, percentage: hotPct, dotColor: "bg-rose-500", badgeColor: "bg-rose-50 text-rose-700 border-rose-200", stroke: "#f43f5e" },
      { label: "Warm Leads", count: warmCount, percentage: warmPct, dotColor: "bg-amber-500", badgeColor: "bg-amber-50 text-amber-700 border-amber-200", stroke: "#f59e0b" },
      { label: "Cold Leads", count: coldCount, percentage: coldPct, dotColor: "bg-sky-500", badgeColor: "bg-sky-50 text-sky-700 border-sky-200", stroke: "#0ea5e9" },
      { label: "New Leads", count: newCount, percentage: newPct, dotColor: "bg-emerald-500", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200", stroke: "#10b981" }
    ];

    const rate = total > 0 ? `${hotPct}%` : "0%";

    return {
      statusBreakdown: formattedBreakdown,
      totalLeadsCount: total,
      conversionRate: rate
    };
  }, [leads]);

  // 4. Dynamic Recent Leads Table Data
  const dynamicRecentLeads = useMemo(() => {
    const sliced = leads.slice(0, 5).map((l, index) => {
      const amt = Number(l.expectedBusiness || l.expectedRevenue || l.budget || 0);
      const formattedAmt = amt > 0 ? `₹ ${amt.toLocaleString("en-IN")}` : "₹ 1,50,000";
      const statusRaw = l.leadStatus || l.status || "Warm";
      const formattedStatus = statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();

      const leadIdStr = l.leadId || (l.id && !String(l.id).match(/^[0-9a-fA-F]{24}$/) ? l.id : null) || `LD-${901 + index}`;

      return {
        id: leadIdStr,
        leadId: leadIdStr,
        _id: l._id || l.id,
        date: l.createdDate || l.date || "25/08/2026",
        name: l.clientName || l.concernPersonName || "Client Name",
        company: l.projectDetail || l.companyName || l.workCategory || "Project Inquiry",
        amount: formattedAmt,
        status: formattedStatus,
        source: l.leadMode || l.leadSource || "Direct Call"
      };
    });

    return sliced.length > 0 ? sliced : defaultRecent;
  }, [leads]);

  return (
    <div className="space-y-4 font-sans pb-6">
      {/* 1. HEADER & ADD LEAD CTA */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="LEAD DASHBOARD"
          badge="Live Pipeline"
          badgeColor="bg-emerald-100/90 text-emerald-800 border-emerald-300"
          description="Complete overview of your daily leads, revenue pipeline, status breakdowns, and scheduled follow-ups."
          rightActions={
            <Link
              to="/sales/leads/add"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Lead</span>
            </Link>
          }
        />
      </div>

      {/* 2. 4 TOP STATS CARDS */}
      <DashboardMetrics metrics={dynamicMetrics} />

      {/* 3. MIDDLE SECTION (FOLLOW-UPS & DONUT CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <FollowupsDueToday data={dynamicFollowups} />
        <LeadStatusBreakdown
          statusBreakdown={statusBreakdown}
          totalLeads={totalLeadsCount}
          conversionRate={conversionRate}
        />
      </div>

      {/* 4. RECENT LEADS TABLE */}
      <RecentLeadsTable recentLeads={dynamicRecentLeads} />
    </div>
  );
};

export default Salesdash;