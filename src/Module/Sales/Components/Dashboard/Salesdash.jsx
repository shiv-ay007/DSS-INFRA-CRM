import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FaTrashRestore } from "react-icons/fa";
import PageHeader from "../../../../Common/Components/PageHeader";
import Loader from "../../../../Common/Components/Loader";
import DashboardMetrics from "./DashboardMetrics";
import ExecutiveKpiBar from "./ExecutiveKpiBar";
import LeadStatusBreakdown from "./LeadStatusBreakdown";
import RevenueAndLeadTrendsChart from "./RevenueAndLeadTrendsChart";
import LeadSourceDistributionChart from "./LeadSourceDistributionChart";
import ActiveProjectsSiteTracker from "./ActiveProjectsSiteTracker";
import ExecutionKpiCards from "./ExecutionKpiCards";
import { metricsData as defaultMetrics, statusBreakdownData as defaultStatus } from "../../data/dashboardData";
import { getAllLeadsApi } from "../../services/totalLeads.api";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import { activeProjectService } from "../../services/activeProjectService";
import { pmsWbsService } from "../../services/pmsWbsService";
import {
  useLeadContext,
  subscribeToLeadUpdates
} from "../../../../context/LeadContext";
import { useAuth } from "../../../../context/AuthContext";

const Salesdash = () => {
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const { getCachedData, setCachedData } = useLeadContext();
  const [leads, setLeads] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [lostCount, setLostCount] = useState(0);
  const [wbsStagesCount, setWbsStagesCount] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackendData = async () => {
      const cacheKey = "dashboard_leads_all";
      const cached = getCachedData(cacheKey);
      const hasCachedLeads = cached && Array.isArray(cached.data) && cached.data.length > 0;
      if (hasCachedLeads) {
        setLeads(cached.data);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      // 1. Fetch Active Construction Projects from Local Execution Service
      try {
        const prjs = activeProjectService.getAllActiveProjects();
        if (Array.isArray(prjs)) {
          setActiveProjects(prjs);
        }
      } catch (err) {
        console.warn("Active projects fetch error:", err);
      }

      // Fetch WBS Master, Leads, and Counts in Parallel (Concurrent 1-roundtrip fetch)
      try {
        if (!hasCachedLeads) {
          setIsLoading(true);
        }

        const [wbsSettled, leadsSettled, closedSettled, lostSettled] = await Promise.allSettled([
          pmsWbsService.getAllWbsData(),
          getAllLeadsApi({ limit: 1000 }),
          getAllLeadProjectsApi({ isClosed: "true" }),
          getAllLeadsApi({ intrestedStatus: "Not Intersted", limit: 1000 })
        ]);

        // 1. Process WBS Master stages count
        if (wbsSettled.status === "fulfilled" && wbsSettled.value) {
          const wbsRes = wbsSettled.value;
          if (wbsRes?.data?.stages && Array.isArray(wbsRes.data.stages)) {
            setWbsStagesCount(wbsRes.data.stages.length);
          } else if (Array.isArray(wbsRes?.data?.data?.stages)) {
            setWbsStagesCount(wbsRes.data.data.stages.length);
          }
        }

        // 2. Process Leads
        if (
          leadsSettled.status === "fulfilled" &&
          leadsSettled.value &&
          leadsSettled.value.success &&
          leadsSettled.value.data?.leads
        ) {
          const apiLeads = leadsSettled.value.data.leads.map((backendLead) => {
            const dateObj = new Date(backendLead.createdAt || Date.now());
            const formattedDate = dateObj.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            });

            const cleanLeadId =
              backendLead.leadId ||
              (backendLead._id && !String(backendLead._id).match(/^[0-9a-fA-F]{24}$/)
                ? backendLead._id
                : `LD-${String(backendLead._id).slice(-4).toUpperCase()}`);

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
              workType: Array.isArray(backendLead.workType)
                ? backendLead.workType
                : backendLead.workType
                ? [backendLead.workType]
                : [],
              workCategory: backendLead.workCategory || "Design"
            };
          });

          setLeads(apiLeads);
          setCachedData(cacheKey, apiLeads);
        }

        // 3. Process Completed & Lost Counts
        let cCount = 0;
        let lCount = 0;

        // Local active projects (100% completed)
        const activePrjs = activeProjectService.getAllActiveProjects() || [];
        const completedActive = activePrjs.filter(
          (p) => p.projectStatus === "Completed" || Number(p.overallProgress || 0) >= 100
        ).length;
        cCount += completedActive;

        // From Lead Projects collection
        if (closedSettled.status === "fulfilled" && closedSettled.value?.data) {
          const rawPrjs = closedSettled.value.data.projects || closedSettled.value.data || [];
          if (Array.isArray(rawPrjs)) {
            rawPrjs.forEach((bp) => {
              const status = String(bp.status || "").toUpperCase();
              const closureStatus = String(bp.closureStatus || "").toLowerCase();
              if (
                bp.isCompleted === true ||
                status === "COMPLETED" ||
                closureStatus.includes("converted")
              ) {
                cCount++;
              } else {
                lCount++;
              }
            });
          }
        }

        // From Lost Leads API
        if (lostSettled.status === "fulfilled" && lostSettled.value?.data?.leads) {
          lCount += lostSettled.value.data.leads.length;
        }

        setCompletedCount(cCount);
        setLostCount(lCount);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();
    const unsubscribe = subscribeToLeadUpdates(fetchBackendData);
    return () => unsubscribe();
  }, [getCachedData, setCachedData]);

  // 1. Dynamic Top 4 Metrics Cards (Brought to Row 1)
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

  // 2. Dynamic Lead Status Breakdown (Donut Data)
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

  return (
    <div className="space-y-4 font-sans pb-8">
      {/* HEADER & ADD LEAD CTA */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="LEAD DASHBOARD"
          badge="Live Pipeline"
          badgeColor="bg-emerald-100/90 text-emerald-800 border-emerald-300"
          description="Executive 360° overview of daily leads, revenue pipeline, construction site execution, and operational health."
          rightActions={
            <div className="flex items-center gap-2">
              <Link
                to="/sales/leads/deleted"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0"
                title="View and restore deleted leads"
              >
                <FaTrashRestore className="text-amber-600 text-xs sm:text-sm" />
                <span>Restore Leads</span>
              </Link>

              {isUserObserver ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-200 text-slate-400 text-xs sm:text-sm font-bold shadow-none cursor-not-allowed opacity-60 shrink-0"
                  title="Disabled for Observer"
                >
                  <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Lead</span>
                </button>
              ) : (
                <Link
                  to="/sales/leads/add"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4 fill-none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Lead</span>
                </Link>
              )}
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[460px] bg-white rounded-2xl border border-slate-200/80 shadow-2xs py-20">
          <Loader text="Loading dashboard insights..." size={40} color="text-emerald-600" />
        </div>
      ) : (
        <>
          {/* ROW 1: PRIMARY METRICS (TOTAL LEADS, HOT, WARM, COLD) */}
          <DashboardMetrics metrics={dynamicMetrics} />

          {/* ROW 2: EXECUTIVE 360° KPI BAR (MINIMALIST STYLE MATCHING ROW 1) */}
          <ExecutiveKpiBar
            leads={leads}
            activeProjectsCount={activeProjects.length}
            wbsStagesCount={wbsStagesCount}
          />

          {/* ROW 3: ACTIVE EXECUTION & PROJECT STATS (DESIGN, ONLY CONST, COMPLETED, LOST/DROP) */}
          <ExecutionKpiCards
            activeProjects={activeProjects}
            completedCount={completedCount}
            lostCount={lostCount}
          />

          {/* ROW 4: REVENUE & PIPELINE TRENDS (8 COLS) + STATUS DISTRIBUTION (4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <RevenueAndLeadTrendsChart leads={leads} />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <LeadStatusBreakdown
                statusBreakdown={statusBreakdown}
                totalLeads={totalLeadsCount}
                conversionRate={conversionRate}
              />
            </div>
          </div>

          {/* ROW 5: ACTIVE CONSTRUCTION SITES TRACKER (8 COLS) + LEAD ACQUISITION CHANNELS (4 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            <div className="lg:col-span-8 flex flex-col">
              <ActiveProjectsSiteTracker
                activeProjects={activeProjects}
                wbsStagesCount={wbsStagesCount}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <LeadSourceDistributionChart leads={leads} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Salesdash;