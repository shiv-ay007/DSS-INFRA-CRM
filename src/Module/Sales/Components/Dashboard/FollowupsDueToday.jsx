import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { initialFollowups } from "../../data/dashboardData";

const FollowupsDueToday = ({ data = initialFollowups }) => {
  const [followups] = useState(data);

  return (
    <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 shadow-2xs p-3.5 sm:p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Follow-ups Due Today
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold font-mono">
            {followups.length} Calls Pending
          </span>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {followups.map((item, index) => (
            <div
              key={item.id}
              className="p-3 rounded-lg bg-slate-50/90 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-mono font-bold text-xs shadow-2xs shrink-0">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900">
                      {item.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    <span className="text-slate-800 font-semibold">{item.company}</span> • <span className="font-mono text-slate-700">{item.phone}</span>
                  </div>
                </div>
              </div>

              {/* Time Badge & Call Button */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-mono text-xs font-bold flex items-center gap-1 shadow-2xs">
                  <span>⏰</span>
                  <span>{item.time}</span>
                </span>
                <a
                  href={`tel:${item.phone.replace(/[^0-9+]/g, "")}`}
                  onClick={() => toast.info(`Initiating call to ${item.name} (${item.phone})... 📞`)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-2xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 4V3z" />
                  </svg>
                  <span>Call</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">Keep in touch with every client daily</span>
        <Link
          to="/sales/leads/followup"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          <span>View All Followups</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
};

export default FollowupsDueToday;
