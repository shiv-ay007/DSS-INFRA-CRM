import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaEye,
  FaEdit,
  FaPlus,
  FaTimes,
  FaStar,
  FaMapMarkerAlt,
  FaClipboardList,
  FaCommentDots,
  FaUserTie,
  FaPhoneAlt,
  FaEnvelope,
  FaRupeeSign,
  FaLayerGroup
} from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";

const SalesProjectDetailsTable = ({ lead, projects = [], onAddProjectClick }) => {
  const navigate = useNavigate();
  const { role, isObserver } = useAuth();
  const currentRole = role || "Worker";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const targetId = lead?._id || lead?.id || lead?.leadId;

  const handleOpenViewModal = (project) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const handleEditProject = (project) => {
    navigate(`/sales/leads/sales-form/${targetId}`, {
      state: { lead, project, returnToLeadDetails: true, from: "salesManagement" }
    });
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mt-6">
      {/* ──────────────────────────────────────────────────────────────────
          TABLE TOP HEADER
      ────────────────────────────────────────────────────────────────── */}
      <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <FaBuilding className="text-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                Project Records
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {projects.length} {projects.length === 1 ? "Record" : "Records"}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Data retrieved directly from MongoDB <span className="font-mono font-bold text-slate-700">leadsproject</span> collection
            </p>
          </div>
        </div>

        {!isUserObserver && (
          <button
            type="button"
            onClick={onAddProjectClick || (() => navigate(`/sales/leads/sales-form/${targetId}`, { state: { lead } }))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>Add / Update Project</span>
          </button>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          RESPONSIVE TABLE CONTAINER
      ────────────────────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none">
              <th className="py-3 px-3 text-center w-12 border-r border-slate-800 whitespace-nowrap">
                SR. NO.
              </th>
              <th className="py-3 px-3 text-center w-24 border-r border-slate-800 whitespace-nowrap">
                ACTIONS
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                AMOUNT
              </th>
              <th className="py-3 px-3 text-left border-r border-slate-800 whitespace-nowrap">
                CLIENT
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                COMPANY
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                BUSINESS TYPE
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                JOB TYPE
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                PRIORITY
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                ASSIGNED TO
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                NEXT PERSON
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                LOCATION
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                REQUIREMENT
              </th>
              <th className="py-3 px-3 text-center border-r border-slate-800 whitespace-nowrap">
                SALES REMARKS
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">
                CREATED AT
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={14} className="py-10 text-center text-slate-500 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaBuilding className="text-3xl text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No Project Records Found</p>
                    <p className="text-xs text-slate-400">
                      Click "+ Add / Update Project" above to create a record in the leadsproject collection.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              projects.map((proj, idx) => {
                const amt = Number(proj.expectedBusiness || proj.amount || 0);
                const p = String(proj.priority || "High").toUpperCase();
                const isHigh = p === "HIGH" || p === "HOT";
                const isMedium = p === "MEDIUM" || p === "WARM";

                const dateObj = new Date(proj.createdAt || Date.now());
                const formattedDate = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                  : "--";
                const formattedTime = !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
                  : "--";

                return (
                  <tr key={proj._id || idx} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. SR NO */}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700 border-r border-slate-100">
                      {idx + 1}
                    </td>

                    {/* 2. ACTIONS (VIEW & EDIT) */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* VIEW BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleOpenViewModal(proj)}
                          className="w-7 h-7 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="View Full Project Details"
                        >
                          <FaEye className="text-xs" />
                        </button>

                        {/* EDIT BUTTON */}
                        {!isUserObserver ? (
                          <button
                            type="button"
                            onClick={() => handleEditProject(proj)}
                            className="w-7 h-7 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Edit Project Details"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                        ) : (
                          <span
                            className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-100 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-60"
                            title="Edit disabled for Observer"
                          >
                            <FaEdit className="text-xs" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. AMOUNT */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-md text-emerald-800 bg-emerald-50 border border-emerald-300 font-mono font-bold text-xs">
                        ₹{amt.toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* 4. CLIENT NAME */}
                    <td className="py-2.5 px-3 text-left border-r border-slate-100">
                      <div className="font-bold text-slate-900">{proj.clientName || "--"}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{proj.phoneNumber || "--"}</div>
                      {proj.emailAddress && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{proj.emailAddress}</div>
                      )}
                    </td>

                    {/* 6. COMPANY NAME */}
                    <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                      {proj.companyName || "--"}
                    </td>

                    {/* 7. BUSINESS TYPE */}
                    <td className="py-2.5 px-3 text-center font-medium text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {proj.businessType || "--"}
                    </td>

                    {/* 8. JOB TYPE */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        {proj.jobType || "NEW"}
                      </span>
                    </td>

                    {/* 9. PRIORITY */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          isHigh
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : isMedium
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isHigh ? "🔴 High" : isMedium ? "🟡 Medium" : "🟢 Low"}
                      </span>
                    </td>

                    {/* 10. ASSIGNED TO */}
                    <td className="py-2.5 px-3 text-center font-medium text-slate-800 border-r border-slate-100 whitespace-nowrap">
                      {proj.assignedTo || "Admin"}
                    </td>

                    {/* 11. NEXT PERSON */}
                    <td className="py-2.5 px-3 text-center text-slate-700 border-r border-slate-100 whitespace-nowrap">
                      {proj.nextPersonName ? (
                        <div>
                          <div className="font-bold text-slate-800">{proj.nextPersonName}</div>
                          {proj.designation && (
                            <div className="text-[10px] text-slate-400">({proj.designation})</div>
                          )}
                        </div>
                      ) : (
                        "--"
                      )}
                    </td>

                    {/* 12. LOCATION */}
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                      {proj.city || proj.address || "--"}
                    </td>

                    {/* 13. REQUIREMENT */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[160px]">
                      <div className="truncate text-xs text-slate-700 font-medium mx-auto" title={proj.requirement}>
                        {proj.requirement || "--"}
                      </div>
                    </td>

                    {/* 14. SALES REMARKS */}
                    <td className="py-2.5 px-3 text-center border-r border-slate-100 max-w-[160px]">
                      <div className="truncate text-xs text-slate-700 font-medium mx-auto" title={proj.transferRemark}>
                        {proj.transferRemark || "--"}
                      </div>
                    </td>

                    {/* 15. CREATED AT */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="inline-flex flex-col items-center px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200/90 shadow-2xs">
                        <span className="font-bold text-xs whitespace-nowrap">{formattedDate}</span>
                        <span className="font-mono text-[10px] text-blue-700 whitespace-nowrap">{formattedTime}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MODAL: VIEW FULL PROJECT DETAILS
      ────────────────────────────────────────────────────────────────── */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                  <FaBuilding />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Project Details: {selectedProject.clientName}
                  </h3>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    ID: {selectedProject.leadId || "--"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Company Name</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.companyName || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Business Type</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.businessType || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Client Designation</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.clientDesignation || "--"}</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-emerald-800 font-bold block mb-0.5">Expected Business Value</span>
                <span className="font-extrabold text-emerald-700 text-base font-mono">
                  ₹{Number(selectedProject.expectedBusiness || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Priority & Job Type</span>
                <span className="font-bold text-slate-900 text-sm uppercase">
                  {selectedProject.priority || "High"} • {selectedProject.jobType || "NEW"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Assigned Executive</span>
                <span className="font-bold text-slate-900 text-sm">{selectedProject.assignedTo || "Admin"}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Next Concern Person</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedProject.nextPersonName
                    ? `${selectedProject.nextPersonName} ${selectedProject.designation ? `(${selectedProject.designation})` : ""}`
                    : "--"}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 font-bold block mb-0.5">Client Rating</span>
                <span className="font-extrabold text-amber-600 text-sm flex items-center gap-1">
                  <FaStar /> {selectedProject.clientRating || 4.5} / 5
                </span>
              </div>
            </div>

            {/* LOCATION */}
            {(selectedProject.address || selectedProject.city) && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-0.5">Location / Address:</span>
                <span className="text-slate-600 font-medium">
                  {[selectedProject.address, selectedProject.city, selectedProject.state, selectedProject.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}

            {/* REQUIREMENT */}
            {selectedProject.requirement && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Requirement Details:</span>
                <p className="text-slate-800 font-medium whitespace-pre-line">{selectedProject.requirement}</p>
              </div>
            )}

            {/* REMARKS */}
            {selectedProject.transferRemark && (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Sales Management Remarks / Notes:</span>
                <p className="text-slate-800 font-medium whitespace-pre-line">{selectedProject.transferRemark}</p>
              </div>
            )}

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              {!isUserObserver && (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditProject(selectedProject);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <FaEdit className="text-xs" />
                  <span>Edit This Project</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesProjectDetailsTable;
