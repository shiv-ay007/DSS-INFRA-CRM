import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../../../Common/Components/PageHeader";
import DashboardMetrics from "./DashboardMetrics";
import FollowupsDueToday from "./FollowupsDueToday";
import LeadStatusBreakdown from "./LeadStatusBreakdown";
import RecentLeadsTable from "./RecentLeadsTable";

const Salesdash = () => {
  return (
    <div className="space-y-4 font-sans pb-6">
      {/* 1. HEADER & ADD LEAD CTA */}
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

      {/* 2. 4 TOP STATS CARDS */}
      <DashboardMetrics />

      {/* 3. MIDDLE SECTION (FOLLOW-UPS & DONUT CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <FollowupsDueToday />
        <LeadStatusBreakdown />
      </div>

      {/* 4. RECENT LEADS TABLE */}
      <RecentLeadsTable />
    </div>
  );
};

export default Salesdash;