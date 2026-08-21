import React, { useState } from "react";

const FollowupTimelineCard = ({ lead, onAddRemark }) => {
  const [newRemark, setNewRemark] = useState("");
  const [newNextDate, setNewNextDate] = useState("");
  const [newStatus, setNewStatus] = useState(lead?.status || "INTERESTED");

  const followupHistory = lead?.followupHistory || [
    {
      date: lead?.createdDate || "Today",
      time: lead?.createdTime || "10:00 AM",
      author: lead?.salesPerson || "Sales TL",
      remark: "Initial lead inquiry registered in pipeline.",
      status: lead?.status || "NEW"
    }
  ];

  const handleAddRemarkSubmit = (e) => {
    e.preventDefault();
    if (!newRemark.trim()) return;

    if (onAddRemark) {
      onAddRemark({
        remark: newRemark,
        nextDate: newNextDate,
        status: newStatus
      });
    }

    setNewRemark("");
    setNewNextDate("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-100 shadow-2xs">
            ⏰
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Scheduled Follow-up & Remarks Timeline
            </h2>
            <p className="text-xs text-slate-500 font-medium">Activity logs, communication remarks, and next reminder</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold">
          {lead?.nextFollowup || lead?.nextFollowupDate || "Today 11:00 AM"}
        </span>
      </div>

      {/* Quick Add Remark Input Form */}
      <form onSubmit={handleAddRemarkSubmit} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add New Follow-up Remark</h3>
        <textarea
          rows={2}
          value={newRemark}
          onChange={(e) => setNewRemark(e.target.value)}
          placeholder="Enter detailed conversation remarks or update status..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:border-black/50 placeholder:text-slate-400"
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Next Follow-up Date</label>
            <input
              type="date"
              value={newNextDate}
              onChange={(e) => setNewNextDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium cursor-pointer"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-[11px] font-bold text-slate-600 mb-0.5">Update Lead Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold cursor-pointer"
            >
              <option value="NEW">NEW ⚪</option>
              <option value="INTERESTED">INTERESTED ⚡</option>
              <option value="HOT">HOT LEAD 🔥</option>
              <option value="WARM">WARM LEAD ⚡</option>
              <option value="COLD">COLD LEAD ❄️</option>
              <option value="CONVERTED">CONVERTED 🟢</option>
            </select>
          </div>

          <button
            type="submit"
            className="self-end px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            Save Remark
          </button>
        </div>
      </form>

      {/* Timeline List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Remarks History</h3>

        {followupHistory.map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              #{idx + 1}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-xs font-bold text-slate-900">{item.author || "Sales Representative"}</span>
                <span className="text-[11px] font-mono text-slate-500">{item.date} {item.time && `• ${item.time}`}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium">
                {item.remark}
              </p>
              {item.status && (
                <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  Status: {item.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowupTimelineCard;
