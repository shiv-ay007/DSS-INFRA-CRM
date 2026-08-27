import React from "react";
import { FaClock, FaCalendarAlt, FaUser, FaTag, FaFileAlt } from "react-icons/fa";

const FollowupTimelineCard = ({ lead }) => {
  // Determine history array safely
  const hasHistory = Array.isArray(lead?.followupHistory) && lead.followupHistory.length > 0;
  
  const defaultHistory = [
    {
      date: lead?.nextFollowup || lead?.nextFollowupDate || lead?.createdDate || "Today",
      time: lead?.nextFollowupTime || "11:00 AM",
      author: lead?.assignTo || lead?.salesPerson || "Sales Representative",
      remark: lead?.remark || lead?.notes || `Follow-up discussion scheduled with ${lead?.clientName || lead?.concernPersonName || "client"}. Requirement: ${lead?.requirement || lead?.projectDetail || "Sales Inquiry"}.`,
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

  const followupHistory = hasHistory ? lead.followupHistory : defaultHistory;

  const getStatusBadgeClass = (st) => {
    const s = (st || "").toUpperCase();
    if (s.includes("HOT")) return "bg-rose-100 text-rose-800 border-rose-300";
    if (s.includes("WARM") || s.includes("INTERESTED")) return "bg-amber-100 text-amber-800 border-amber-300";
    if (s.includes("COLD")) return "bg-sky-100 text-sky-800 border-sky-300";
    if (s.includes("CONVERTED")) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (s.includes("LOST")) return "bg-slate-200 text-slate-800 border-slate-300";
    return "bg-blue-100 text-blue-800 border-blue-300";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100 shadow-2xs">
            <FaClock />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Scheduled Follow-up & Remarks Timeline
            </h2>
            <p className="text-xs text-slate-500 font-medium">Activity logs, communication remarks, and next reminder</p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-2xs">
          <FaCalendarAlt className="text-amber-600 text-xs" />
          <span>Next Follow-up:</span>
          <span>{lead?.nextFollowup || lead?.nextFollowupDate || "Today 11:00 AM"}</span>
        </span>
      </div>

      {/* TIMELINE LOG HISTORY */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <FaClock className="text-slate-500 text-xs" />
            <span>Timeline Activity Log</span>
          </h3>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600 font-mono">
            {followupHistory.length} Entries
          </span>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 pl-4 py-1">
          {followupHistory.map((item, idx) => {
            const remarkText = item.remark || item.notes || item.comment || item.text || "No remarks added.";
            const authorText = item.author || item.rep || item.user || "Sales Representative";
            const dateText = item.date || item.createdDate || "Today";
            const timeText = item.time || item.createdTime || "";
            const statusText = item.status || lead?.status || "NEW";
            const attachments = item.remarkAttachments || item.attachments || [];

            return (
              <div key={idx} className="relative group">
                <div className="absolute -left-[25px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-white shadow-xs group-hover:scale-110 transition-transform"></div>
                <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2 hover:bg-slate-100/70 hover:border-slate-300 transition-all shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                      <FaUser className="text-slate-500 text-[10px]" />
                      <span>{authorText}</span>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px] font-semibold flex items-center gap-1">
                      <FaCalendarAlt className="text-[10px]" />
                      <span>{dateText}</span>
                      {timeText && <span>• {timeText}</span>}
                    </span>
                  </div>

                  <p className="text-slate-800 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    {remarkText}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${getStatusBadgeClass(statusText)}`}>
                      <FaTag className="text-[9px]" />
                      <span>Status: {statusText}</span>
                    </span>

                    {attachments.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                        <FaFileAlt className="text-slate-500" />
                        <span>{attachments.length} Attachment(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FollowupTimelineCard;
