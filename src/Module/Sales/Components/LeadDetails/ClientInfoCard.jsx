import React from "react";

const ClientInfoCard = ({ lead }) => {
  const clientName = lead?.clientName || lead?.concernPersonName || "--";
  const designation = lead?.clientDesignation || "--";
  const company = lead?.company || lead?.companyName || lead?.clientName || "--";
  const phone = lead?.phoneNumber || lead?.contact || "--";
  const altPhone = lead?.alternateNumber || lead?.alternateNo || "--";
  const whatsapp = lead?.whatsappNumber || phone;
  const email = lead?.emailAddress || lead?.email || "--";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shadow-2xs">
            👤
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Client & Contact Details
            </h2>
            <p className="text-xs text-slate-500 font-medium">Customer designation, company, and communication channels</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
          Verified Contact
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Concern Person Name</span>
          <strong className="text-slate-900 font-bold text-sm block">{clientName}</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Designation / Role</span>
          <strong className="text-slate-900 font-bold text-sm block">{designation}</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Company / Organization</span>
          <strong className="text-slate-900 font-bold text-sm block">{company}</strong>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Primary Phone Number</span>
          <a href={phone !== "--" ? `tel:${phone}` : "#"} className="text-blue-600 font-mono font-bold text-sm hover:underline block">
            {phone}
          </a>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Alternate Phone Number</span>
          <span className="text-slate-800 font-mono font-semibold text-sm block">{altPhone}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">WhatsApp Number</span>
          <span className="text-emerald-700 font-mono font-bold text-sm block">{whatsapp}</span>
        </div>

        <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
          <span className="text-slate-500 text-xs font-medium block">Email Address</span>
          <a href={email !== "--" ? `mailto:${email}` : "#"} className="text-slate-800 font-mono font-medium text-sm hover:text-blue-600 block">
            {email}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;
