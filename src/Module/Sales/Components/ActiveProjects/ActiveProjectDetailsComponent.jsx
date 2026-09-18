import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBuilding,
  FaCheckCircle,
  FaHardHat,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaUserTie,
  FaCalendarAlt,
  FaCheck,
  FaExternalLinkAlt,
  FaFileInvoiceDollar
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import activeProjectService from "../../services/activeProjectService";

const ActiveProjectDetailsComponent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const data = activeProjectService.getActiveProjectById(id);
      if (data) {
        setProject(data);
      } else {
        toast.error("Active Project not found with ID: " + id);
        navigate("/sales/active-projects");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  if (loading || !project) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold">Loading project details...</p>
      </div>
    );
  }

  const completedStagesCount = (project.stages || []).filter((s) => s.status === "Completed").length;
  const totalStagesCount = (project.stages || []).length;

  return (
    <div className="space-y-5 pb-20 font-sans max-w-5xl mx-auto">
      {/* ================= HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-purple-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <button
              type="button"
              onClick={() => navigate("/sales/active-projects")}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 shrink-0 border border-white/10 mt-0.5"
              title="Back to Active Projects"
            >
              <FaArrowLeft className="text-sm" />
            </button>
            <div className="p-3 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg flex items-center justify-center shrink-0">
              <FaBuilding className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold text-cyan-300 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">
                  {project.id}
                </span>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  {project.clientName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {project.projectStatus || "On Track"}
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-1 font-normal">
                {project.projectName || "Site Workflow"} • {project.city || "Lucknow"} • Active Site Execution Details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => navigate(`/sales/active-projects/${project.id}`)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <span>Go to Daily Tracking Screen</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= OVERVIEW & METRICS GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Presale Profile & Client Info (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Presale Carry-Forward Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FaBuilding className="text-indigo-600 w-3.5 h-3.5" />
              <span>Presales Contract & Client Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Client / Company Name</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.clientName}</strong>
                {project.companyName && (
                  <span className="text-[11px] text-slate-500 font-medium">({project.companyName})</span>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Phone Contact</span>
                <strong className="text-slate-800 text-xs mt-0.5 block flex items-center gap-1.5">
                  <FaPhoneAlt className="w-2.5 h-2.5 text-slate-400" />
                  {project.phone || "—"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Email Address</span>
                <strong className="text-slate-800 text-xs mt-0.5 block truncate flex items-center gap-1.5">
                  <FaEnvelope className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  {project.email || "—"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">City / Location</span>
                <strong className="text-slate-800 text-xs mt-0.5 block flex items-center gap-1.5">
                  <FaMapMarkerAlt className="w-2.5 h-2.5 text-slate-400" />
                  {project.city || "Lucknow"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                <span className="text-slate-400 block text-[11px] font-medium">Site Address</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">{project.address || "—"}</strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Work Category & Type</span>
                <strong className="text-slate-800 text-xs mt-0.5 block">
                  {project.engagementScope || "Civil Works"} • {project.workType || "Design + Construction"}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[11px] font-medium">Project Budget / Revenue</span>
                <strong className="text-emerald-700 text-xs mt-0.5 block font-black">
                  {project.revenue || "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* Stages Execution Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FaHardHat className="text-indigo-600 w-3.5 h-3.5" />
                <span>Stages Execution Breakdown ({totalStagesCount} Stages)</span>
              </h2>
              <button
                type="button"
                onClick={() => navigate(`/sales/active-projects/${project.id}`)}
                className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Full Checklist</span>
                <FaExternalLinkAlt className="w-2.5 h-2.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
              {(project.stages || []).map((stage) => {
                const isDone = stage.status === "Completed";
                const isInProg = stage.status === "In Progress";
                return (
                  <div key={stage.stageId} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isDone ? "bg-emerald-600 text-white" : isInProg ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {isDone ? <FaCheck className="w-2.5 h-2.5" /> : stage.stageId}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate text-xs">{stage.stageName}</p>
                        <span className="text-[10px] text-slate-400">
                          {stage.completedWorksCount || 0}/{(stage.works || []).length} Works • {stage.completedTasksCount || 0}/{stage.totalTasksCount || 0} Tasks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${isDone ? "bg-emerald-500" : "bg-indigo-600"}`}
                          style={{ width: `${stage.progressPercent || 0}%` }}
                        />
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDone ? "bg-emerald-100 text-emerald-800" : isInProg ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {stage.progressPercent || 0}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Site Operations & Overall Progress (1 col) */}
        <div className="space-y-5">
          {/* Overall Execution Progress Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                Execution Progress
              </span>
              <div className="text-3xl font-black mt-1 text-white">
                {project.overallProgress || 0}%
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${project.overallProgress || 0}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
              <div>
                <span className="text-indigo-200 text-[11px] block">Stages Done</span>
                <strong className="text-white text-sm font-black">
                  {completedStagesCount} / {totalStagesCount}
                </strong>
              </div>
              <div>
                <span className="text-indigo-200 text-[11px] block">Tasks Finished</span>
                <strong className="text-white text-sm font-black">
                  {project.completedTasks || 0} / {project.totalTasks || 0}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/sales/active-projects/${project.id}`)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-extrabold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <span>Open Execution Checklist</span>
              <FaArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Site Operations Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3.5">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <FaUserTie className="text-indigo-600 w-3.5 h-3.5" />
              <span>Site Leadership & Dates</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Assigned Site Incharge</span>
                <strong className="text-indigo-700 block font-bold text-xs mt-0.5">
                  {project.activePerson || "Unassigned"}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Execution Started Date</span>
                <strong className="text-slate-800 block text-xs mt-0.5">
                  {project.contractSignedDate || "—"}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Target Completion Date</span>
                <strong className="text-slate-800 block text-xs mt-0.5">
                  {project.targetCompletionDate || "—"}
                </strong>
              </div>

              {project.overallRemark && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-medium">Site Instructions / Remarks</span>
                  <p className="text-slate-700 text-xs mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {project.overallRemark}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveProjectDetailsComponent;
