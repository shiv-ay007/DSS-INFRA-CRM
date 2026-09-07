import React from "react";
import {
  FaClipboardList,
  FaMapMarkerAlt,
  FaMapMarkedAlt,
  FaExternalLinkAlt,
  FaCommentDots,
  FaPaperclip,
  FaImage,
  FaHeadphones,
  FaVideo,
  FaFileAlt,
  FaDownload
} from "react-icons/fa";

const RequirementAddressCard = ({ lead }) => {
  const rawWorkTypes = lead?.workType;
  const workTypesArray = Array.isArray(rawWorkTypes)
    ? rawWorkTypes
    : typeof rawWorkTypes === "string" && rawWorkTypes.trim()
    ? rawWorkTypes.split(",").map((s) => s.trim()).filter(Boolean)
    : ["General Sales Inquiry"];

  const expectedAmount = lead?.expectedBusiness || lead?.expectedRevenue || lead?.amount || "0";
  const numVal = Number(String(expectedAmount).replace(/[^0-9.]/g, ""));
  const formattedAmount =
    !isNaN(numVal) && numVal > 0
      ? `₹ ${numVal.toLocaleString("en-IN")}`
      : typeof expectedAmount === "string" && expectedAmount.startsWith("₹")
      ? expectedAmount
      : `₹ ${expectedAmount || "0"}`;

  const addressParts = [
    lead?.address,
    lead?.city,
    lead?.state,
    lead?.pincode
  ].filter(Boolean);
  const address = addressParts.length > 0 ? addressParts.join(", ") : "--";
  
  const googleLocation = lead?.googleLocation || "";
  const requirement = lead?.requirement || lead?.projectDetail || lead?.projectDetails || "New Lead Inquiry";
  const remarksText = lead?.remarks || lead?.remark || "";

  // Collect all media attachments from various backend/frontend shapes
  const attachments = [];
  if (Array.isArray(lead?.remarksFiles)) {
    lead.remarksFiles.forEach((item) => {
      if (item?.url && !attachments.some((a) => a.url === item.url)) {
        attachments.push(item);
      }
    });
  }
  if (Array.isArray(lead?.remarkAttachments)) {
    lead.remarkAttachments.forEach((item) => {
      const url = item?.url || item?.preview;
      if (url && !attachments.some((a) => a.url === url)) {
        attachments.push({
          url,
          fileType: item.type || "image",
          name: item.name || "Attachment"
        });
      }
    });
  }
  if (Array.isArray(lead?.attachments)) {
    lead.attachments.forEach((item) => {
      const url = item?.url || item?.preview;
      if (url && !attachments.some((a) => a.url === url)) {
        attachments.push({
          url,
          fileType: item.type || "image",
          name: item.name || "Attachment"
        });
      }
    });
  }
  if (lead?.remarksFile && typeof lead.remarksFile === "string" && !attachments.some((a) => a.url === lead.remarksFile)) {
    const url = lead.remarksFile;
    const isImg = url.match(/\.(png|jpg|jpeg|webp|gif|svg)($|\?)/i);
    const isAudio = url.match(/\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i);
    const isVideo = url.match(/\.(mp4|webm|mov|mkv)($|\?)/i);
    attachments.unshift({
      url,
      fileType: isImg ? "image" : isAudio ? "audio" : isVideo ? "video" : "document",
      name: "Attachment"
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-100 shadow-2xs">
          <FaClipboardList />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Requirements, Financials & Location
          </h2>
          <p className="text-xs text-slate-500 font-medium">Work categories, deal revenue, and site address</p>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm">
        {/* WORK TYPES / CATEGORIES */}
        <div className="space-y-2">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Work Types / Categories Requested
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {workTypesArray.map((wt, idx) => (
              <span
                key={idx}
                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 font-extrabold text-xs shadow-2xs flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {wt}
              </span>
            ))}
          </div>
        </div>

        {/* FINANCIAL DEAL VALUE */}
        <div className="p-4.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/80 border border-emerald-200/90 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-emerald-800 text-xs font-black uppercase tracking-wider block">
              Expected Business Deal Value
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono mt-1 block">
              {formattedAmount}
            </span>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black font-mono shadow-xs">
            Pipeline Potential
          </span>
        </div>

        {/* DETAILED REQUIREMENT */}
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Requirement Details
          </span>
          <p className="text-slate-800 font-semibold text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {requirement}
          </p>
        </div>

        {/* REMARKS & MEDIA ATTACHMENTS */}
        {(remarksText || attachments.length > 0) && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <FaCommentDots className="text-amber-600 text-sm" />
                <span>Remarks & Attached Media</span>
              </span>
              {attachments.length > 0 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <FaPaperclip className="text-[10px]" />
                  <span>{attachments.length} {attachments.length === 1 ? "Attachment" : "Attachments"}</span>
                </span>
              )}
            </div>

            {/* Remarks Text */}
            {remarksText && (
              <p className="text-slate-800 font-medium text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-white/80 p-3 rounded-lg border border-amber-100 shadow-2xs">
                {remarksText}
              </p>
            )}

            {/* Attachments Preview Grid */}
            {attachments.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-slate-600 text-[11px] font-bold uppercase tracking-wider block">
                  Media Files:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((att, idx) => {
                    const isAudio = att.fileType === "audio" || (att.url && att.url.match(/\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i));
                    const isImg = att.fileType === "image" || (att.url && att.url.match(/\.(png|jpg|jpeg|webp|gif|svg)($|\?)/i));
                    const isVideo = att.fileType === "video" || (att.url && att.url.match(/\.(mp4|webm|mov|mkv)($|\?)/i));

                    if (isAudio) {
                      return (
                        <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <FaHeadphones className="text-amber-600 shrink-0" />
                            <span className="truncate">{att.name || "Voice Note Recording"}</span>
                          </div>
                          <audio controls className="w-full h-8" src={att.url}>
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                      );
                    }

                    if (isImg) {
                      return (
                        <div key={idx} className="group relative rounded-xl border border-slate-200 bg-white p-2 shadow-2xs space-y-1.5 overflow-hidden">
                          <a href={att.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                            <img
                              src={att.url}
                              alt={att.name || "Attachment"}
                              className="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                          </a>
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
                            <span className="truncate flex items-center gap-1">
                              <FaImage className="text-emerald-600 shrink-0" />
                              <span>{att.name || "Image"}</span>
                            </span>
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                              <FaExternalLinkAlt className="text-[10px]" />
                            </a>
                          </div>
                        </div>
                      );
                    }

                    if (isVideo) {
                      return (
                        <div key={idx} className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                          <video controls className="w-full h-36 rounded-lg object-cover" src={att.url} />
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-1">
                            <FaVideo className="text-purple-600 shrink-0" />
                            <span className="truncate">{att.name || "Video"}</span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaFileAlt className="text-slate-500 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">{att.name || "Document"}</span>
                        </div>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold flex items-center gap-1 shrink-0"
                        >
                          <FaDownload className="text-[10px]" />
                          <span>View</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SITE / CLIENT ADDRESS */}
        <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-2">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">
            Site / Client Address
          </span>
          <p className="text-slate-900 font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-rose-500 shrink-0 text-sm" />
            <span>{address}</span>
          </p>
          {googleLocation && (
            <div className="pt-1">
              <a
                href={googleLocation.startsWith("http") ? googleLocation : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleLocation)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-extrabold text-blue-700 transition-all shadow-2xs"
              >
                <FaMapMarkedAlt className="text-blue-600" />
                <span>Open Google Location Map</span>
                <FaExternalLinkAlt className="text-[10px]" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementAddressCard;
