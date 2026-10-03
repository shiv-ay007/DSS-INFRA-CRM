import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaTrashRestore, FaChartBar, FaThLarge } from "react-icons/fa";
import PageHeader from "../../../../Common/Components/PageHeader";
import Loader from "../../../../Common/Components/Loader";
import DashboardDateFilter from "./DashboardDateFilter";
import SalesSnapshotSection from "./SalesSnapshotSection";
import PresaleSnapshotSection from "./PresaleSnapshotSection";
import ConstructionSnapshotSection from "./ConstructionSnapshotSection";
import PaymentsSnapshotSection from "./PaymentsSnapshotSection";
import ActiveProjectsSiteTracker from "./ActiveProjectsSiteTracker";
import LeadSourceDistributionChart from "./LeadSourceDistributionChart";
import { getDashboardSummaryApi } from "../../services/dashboard.api";
import { getAllLeadsApi } from "../../services/totalLeads.api";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import { activeProjectService } from "../../services/activeProjectService";
import { pmsWbsService } from "../../services/pmsWbsService";
import pmsTemplateService from "../../services/pmsTemplateService";
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
  const [wbsStagesCount, setWbsStagesCount] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  // Module 9 Filter State
  const [filterState, setFilterState] = useState({
    filterType: "this_month",
    startDate: "",
    endDate: ""
  });
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Fetch Module 9 Unified Summary Data
  const loadSummaryData = useCallback(async (filters = filterState) => {
    setIsSummaryLoading(true);
    try {
      const res = await getDashboardSummaryApi(filters);
      const data = res?.data || res;
      if (data && (data.sales || data.presale || data.payments)) {
        setSummaryData(data);
      } else if (res?.success && res?.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      console.error("Dashboard summary fetch error:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [filterState]);

  // Handle Date Filter Change
  const handleFilterChange = (newFilters) => {
    setFilterState(newFilters);
    loadSummaryData(newFilters);
  };

  useEffect(() => {
    loadSummaryData(filterState);
  }, []);

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
        if (Array.isArray(prjs) && prjs.length > 0) {
          setActiveProjects(prjs);
        }
      } catch (err) {
        console.warn("Active projects fetch error:", err);
      }

      // Fetch WBS Master, Leads, Active Projects & Counts in Parallel
      try {
        if (!hasCachedLeads) {
          setIsLoading(true);
        }

        const [
          wbsSettled,
          leadsSettled,
          leadProjectsSettled,
          pmsTemplatesSettled
        ] = await Promise.allSettled([
          pmsWbsService.getAllWbsData(),
          getAllLeadsApi({ limit: 1000 }),
          getAllLeadProjectsApi(),
          pmsTemplateService.getAllTemplates({ limit: 1000 })
        ]);

        let wbsMasterData = null;
        if (wbsSettled.status === "fulfilled" && wbsSettled.value) {
          const wbsRes = wbsSettled.value;
          wbsMasterData = wbsRes?.data?.data || wbsRes?.data || null;
          if (wbsRes?.data?.stages && Array.isArray(wbsRes.data.stages)) {
            setWbsStagesCount(wbsRes.data.stages.length);
          } else if (Array.isArray(wbsRes?.data?.data?.stages)) {
            setWbsStagesCount(wbsRes.data.data.stages.length);
          }
        }

        let liveLeadProjects = [];
        if (leadProjectsSettled.status === "fulfilled") {
          const raw =
            leadProjectsSettled.value?.data?.projects ||
            leadProjectsSettled.value?.data?.data?.projects ||
            leadProjectsSettled.value?.projects ||
            (Array.isArray(leadProjectsSettled.value?.data) ? leadProjectsSettled.value.data : []);
          if (Array.isArray(raw)) liveLeadProjects = raw;
        }

        let livePmsTemplates = [];
        if (pmsTemplatesSettled.status === "fulfilled") {
          const rawT = pmsTemplatesSettled.value?.data?.data || pmsTemplatesSettled.value?.data || [];
          if (Array.isArray(rawT)) livePmsTemplates = rawT;
        }

        try {
          const syncedActive = activeProjectService.syncWithPresales(
            liveLeadProjects,
            livePmsTemplates,
            wbsMasterData
          );
          if (Array.isArray(syncedActive)) {
            setActiveProjects(syncedActive);
          }
        } catch (syncErr) {
          console.warn("Active projects live sync error:", syncErr);
        }

        // Process Leads
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
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackendData();
    const unsubscribe = subscribeToLeadUpdates(() => {
      fetchBackendData();
      loadSummaryData(filterState);
    });
    return () => unsubscribe();
  }, [getCachedData, setCachedData, loadSummaryData, filterState]);

  return (
    <div className="space-y-4 font-sans pb-8">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] pt-1 pb-2">
        <PageHeader
          title="EXECUTIVE DASHBOARDS & REPORTS"
          badge="Module 9 • Business 360°"
          badgeColor="bg-emerald-100/90 text-emerald-800 border-emerald-300"
          description="Read-only executive snapshot aggregated dynamically across Sales, Presale, Construction, and Payments."
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

      {/* TOP PERIOD FILTER BAR */}
      <DashboardDateFilter
        filterType={filterState.filterType}
        startDate={filterState.startDate}
        endDate={filterState.endDate}
        onChange={handleFilterChange}
        onRefresh={() => loadSummaryData(filterState)}
        isLoading={isSummaryLoading}
      />

      {!summaryData && (isSummaryLoading || isLoading) ? (
        <div className="flex flex-col items-center justify-center min-h-[460px] bg-white rounded-2xl border border-slate-200/80 shadow-2xs py-20">
          <Loader text="Loading live business snapshots & charts..." size={40} color="text-emerald-600" />
        </div>
      ) : summaryData ? (
        <>
          {/* SECTION 1: SALES SNAPSHOT */}
          <SalesSnapshotSection salesData={summaryData.sales || {}} />

          {/* SECTION 2: PRESALE SNAPSHOT */}
          <PresaleSnapshotSection presaleData={summaryData.presale || {}} />

          {/* SECTION 3: CONSTRUCTION SNAPSHOT */}
          <ConstructionSnapshotSection
            constructionData={summaryData.construction || {}}
            activeProjects={activeProjects}
          />

          {/* SECTION 4: PAYMENTS SNAPSHOT */}
          <PaymentsSnapshotSection paymentsData={summaryData.payments || {}} />

          {/* SECTION 5: ACTIVE SITE EXECUTION TRACKER & CHANNELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch pt-2">
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
      ) : null}
    </div>
  );
};

export default Salesdash;