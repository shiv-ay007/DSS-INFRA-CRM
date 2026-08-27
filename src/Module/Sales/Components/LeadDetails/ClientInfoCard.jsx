import React from "react";
import { FaUser, FaPhoneAlt, FaWhatsapp, FaEnvelope, FaCheckCircle } from "react-icons/fa";

const ClientInfoCard = ({ lead }) => {
  const clientName = lead?.clientName || lead?.concernPersonName || "--";
  const designation = lead?.clientDesignation || "--";
  const company = lead?.company || lead?.companyName || "--";
  const phone = lead?.phoneNumber || lead?.contact || "--";
  const altPhone = lead?.alternateNumber || lead?.alternateNo || "--";
  const whatsapp = lead?.whatsappNumber || (phone !== "--" ? phone : "--");
  const email = lead?.emailAddress || lead?.email || "--";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* CARD HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 shadow-2xs">
            <FaUser />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              Client & Contact Details
            </h2>
            <p className="text-xs text-slate-500 font-medium">Customer designation, company, and communication channels</p>
          </div>
        </div>

        <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-extrabold flex items-center gap-1.5 shadow-2xs">
          <FaCheckCircle className="text-emerald-500 text-xs" />
          Verified Contact
        </span>
      </div>

      {/* GRID ITEMS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Concern Person Name</span>
          <strong className="text-slate-900 font-extrabold text-sm sm:text-base block">{clientName}</strong>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Designation / Role</span>
          <strong className="text-slate-900 font-extrabold text-sm block">{designation}</strong>
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Company / Organization</span>
          <strong className="text-slate-900 font-extrabold text-sm block">{company}</strong>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100 hover:border-blue-200 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-blue-700 text-xs font-bold uppercase tracking-wider block">Primary Phone Number</span>
          {phone !== "--" ? (
            <a href={`tel:${phone}`} className="text-blue-600 font-mono font-black text-sm sm:text-base hover:underline flex items-center gap-1.5">
              <FaPhoneAlt className="text-blue-500 text-xs" />
              <span>{phone}</span>
            </a>
          ) : (
            <span className="text-slate-400 font-mono font-medium block">--</span>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Alternate Phone Number</span>
          <span className="text-slate-800 font-mono font-bold text-sm block">{altPhone}</span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-200 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider block">WhatsApp Number</span>
          {whatsapp !== "--" ? (
            <a
              href={`https://wa.me/91${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 font-mono font-black text-sm sm:text-base hover:underline flex items-center gap-1.5"
            >
              <FaWhatsapp className="text-emerald-600 text-base" />
              <span>{whatsapp}</span>
            </a>
          ) : (
            <span className="text-slate-400 font-mono font-medium block">--</span>
          )}
        </div>

        <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all space-y-1 flex flex-col justify-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Email Address</span>
          {email !== "--" ? (
            <a href={`mailto:${email}`} className="text-blue-600 font-mono font-bold text-sm hover:underline flex items-center gap-1.5">
              <FaEnvelope className="text-blue-500 text-xs" />
              <span>{email}</span>
            </a>
          ) : (
            <span className="text-slate-400 font-mono font-medium block">--</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientInfoCard;
