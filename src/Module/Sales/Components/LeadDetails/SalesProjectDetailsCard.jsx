import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaBriefcase,
  FaRupeeSign,
  FaUserTie,
  FaStar,
  FaMapMarkerAlt,
  FaClipboardList,
  FaCommentDots,
  FaEdit,
  FaFolderPlus
} from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";

const SalesProjectDetailsCard = ({ lead, projectData, onAddProjectClick }) => {
  const navigate = useNavigate();
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const targetId = lead?._id || lead?.id || lead?.leadId;

  // Empty state if no project data exists yet in leadsproject collection
  if (!projectData) {
    return (
      <div className="bg-white border border-dashed border-indigo-200 rounded-2xl p-6 shadow-xs text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mx-auto text-lg">
          <FaBuilding />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800">
            No Sales Project Details Configured
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
            You haven't filled project details for this lead yet. Click the button below or '+ Add Project' above to configure.
          </p>
        </div>
        {!isUserObserver && (
          <button
            type="button"
            onClick={onAddProjectClick || (() => navigate(`/sales/leads/sales-form/${targetId}`, { state: { lead } }))}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FaFolderPlus />
            <span>Add Project Details</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-indigo-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* 1. CARD HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
            <FaBuilding className="text-sm" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Sales Management Project Details
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Lead Project Collection Data • Commercials & Handover Specifications
            </p>
          </div>
        </div>

        {!isUserObserver && (
          <button
            type="button"
            onClick={() => navigate(`/sales/leads/sales-form/${targetId}`, { state: { lead } })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <FaEdit className="text-xs" />
            <span>Edit Project</span>
          </button>
        )}
      </div>

      {/* 2. SPECIFICATION DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Company Name */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Company Name
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {projectData.companyName || "--"}
          </span>
        </div>

        {/* Business Type */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Business Type
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {projectData.businessType || "--"}
          </span>
        </div>

        {/* Client Designation */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Client Designation
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {projectData.clientDesignation || "--"}
          </span>
        </div>

        {/* Expected Business (₹) */}
        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            Expected Business
          </span>
          <span className="text-sm sm:text-base font-extrabold text-emerald-700 font-mono">
            ₹{Number(projectData.expectedBusiness || 0).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Priority */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Priority
          </span>
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
              String(projectData.priority).toLowerCase() === "high"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : String(projectData.priority).toLowerCase() === "medium"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {projectData.priority || "High"}
          </span>
        </div>

        {/* Job Type */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Job Type
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase">
            {projectData.jobType || "NEW"}
          </span>
        </div>

        {/* Assigned Sales Executive */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Assigned Executive
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {projectData.assignedTo || "Admin"}
          </span>
        </div>

        {/* Next Contact Person & Role */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Next Concern Person
          </span>
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            {projectData.nextPersonName
              ? `${projectData.nextPersonName} ${projectData.designation ? `(${projectData.designation})` : ""}`
              : "--"}
          </span>
        </div>

        {/* Client Rating */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Client Rating
          </span>
          <span className="text-xs sm:text-sm font-extrabold text-amber-600 flex items-center gap-1">
            <FaStar /> {projectData.clientRating || 4.5} / 5
          </span>
        </div>
      </div>

      {/* 3. LOCATION / ADDRESS */}
      {(projectData.address || projectData.city) && (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
          <FaMapMarkerAlt className="text-slate-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-700 mr-1.5">Site / Office Location:</span>
            <span className="text-slate-600 font-medium">
              {[projectData.address, projectData.city, projectData.state, projectData.pincode]
                .filter(Boolean)
                .join(", ") || "--"}
            </span>
          </div>
        </div>
      )}

      {/* 4. REQUIREMENT & SALES REMARKS */}
      <div className="space-y-3 pt-1">
        {projectData.requirement && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <FaClipboardList className="text-blue-500" /> Client Requirement Details
            </span>
            <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line">
              {projectData.requirement}
            </p>
          </div>
        )}

        {projectData.transferRemark && (
          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              <FaCommentDots className="text-amber-600" /> Sales Management Notes / Remark
            </span>
            <p className="text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line">
              {projectData.transferRemark}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesProjectDetailsCard;
