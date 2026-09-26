import React, { useState, useMemo } from "react";
import { FaCommentDots, FaPaperPlane, FaSpinner, FaArrowRight, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import CommentWithMedia from "../../../../../Common/Components/CommentWithMedia";
import WhatsAppAudioPlayer from "../../../../../Common/Components/WhatsAppAudioPlayer";
import { addPresaleRemarkApi } from "../../../services/presale.api";

const formatDateTime = (val) => {
  if (!val) return "--";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (_) {
    return String(val);
  }
};

const PresalesDiscussionLog = ({
  projectId,
  activeStageId = 1,
  activeStageName = "Site Visit",
  remarks = [],
  onAddRemark,
  onNextStage,
  onSaveCurrentStage,
  readOnly = false,
  currentUser = "Admin"
}) => {
  const [remarkText, setRemarkText] = useState("");
  const [remarkAttachments, setRemarkAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter remarks specifically for the CURRENT ACTIVE STAGE
  const stageRemarks = useMemo(() => {
    if (!Array.isArray(remarks)) return [];
    return remarks.filter((r) => (Number(r.stageId) || 1) === Number(activeStageId || 1));
  }, [remarks, activeStageId]);

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    if (readOnly || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Always save the current stage form data (dates, rates, statuses, notes)
      if (typeof onSaveCurrentStage === "function") {
        const stageSaved = await onSaveCurrentStage();
        if (stageSaved === false) {
          setIsSubmitting(false);
          return;
        }
      }

      // 2. If a discussion note or audio was provided, upload to Cloudinary & log
      const hasRemarkContent = Boolean(
        (remarkText && remarkText.trim() !== "") ||
        (Array.isArray(remarkAttachments) && remarkAttachments.length > 0)
      );

      if (hasRemarkContent) {
        if (projectId) {
          const formData = new FormData();
          formData.append("text", remarkText.trim());
          formData.append("author", currentUser || "Admin");
          formData.append("stageId", activeStageId);
          formData.append("stageName", activeStageName || `Stage ${activeStageId}`);

          remarkAttachments.forEach((att) => {
            if (att.file) {
              formData.append("files", att.file, att.name || "media");
            }
          });

          const res = await addPresaleRemarkApi(projectId, formData);
          if (res?.data?.newRemark) {
            onAddRemark?.(res.data.newRemark);
          }
        } else {
          const now = new Date();
          const newEntry = {
            id: Date.now(),
            stageId: activeStageId,
            stageName: activeStageName,
            author: currentUser || "Admin",
            dateTime: now,
            text: remarkText.trim(),
            attachments: remarkAttachments.map((f, idx) => ({
              id: idx,
              name: f.name || `Attachment-${idx + 1}`,
              type: f.type || "file",
              url: f.preview || f.url || "",
              preview: f.preview || f.url || ""
            }))
          };
          onAddRemark?.(newEntry);
        }

        setRemarkText("");
        setRemarkAttachments([]);
      }

      // 3. Move to next stage
      if (typeof onNextStage === "function") {
        onNextStage();
      }
    } catch (err) {
      console.error("Error submitting stage & remark:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save on server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <FaCommentDots className="text-blue-600 text-sm" />
            <span>Stage {activeStageId}: {activeStageName} Discussion ({stageRemarks.length})</span>
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Stage {activeStageId} Only
          </span>
        </div>

        {/* Timeline Log List for this specific stage */}
        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mt-3 scrollbar-thin">
          {stageRemarks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-5 text-center">
              No remarks logged for Stage {activeStageId} ({activeStageName}) yet.
              <br />
              Add client discussion notes or audio recordings below.
            </p>
          ) : (
            stageRemarks.map((r, idx) => (
              <div
                key={r._id || r.id || idx}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1 hover:bg-white transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-extrabold text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {r.author || "User"}
                  </span>
                  <span className="font-medium text-slate-400">{formatDateTime(r.dateTime)}</span>
                </div>

                {r.text && <p className="text-slate-800 font-medium whitespace-pre-line leading-relaxed">{r.text}</p>}

                {/* Attachments / Audio Notes */}
                {Array.isArray(r.attachments) && r.attachments.length > 0 && (
                  <div className="mt-2 space-y-1.5 pt-1.5 border-t border-slate-200/60">
                    {r.attachments.map((att, attIdx) => {
                      const isAudio =
                        att.type === "audio" ||
                        att.name?.match(/\.(mp3|wav|ogg|m4a|webm|aac)$/i) ||
                        att.url?.match(/\.(mp3|wav|ogg|m4a|webm|aac)($|\?)/i);

                      const isImage =
                        att.type === "image" ||
                        att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i) ||
                        att.url?.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i);

                      if (isAudio) {
                        return (
                          <div key={attIdx} className="mt-1">
                            <WhatsAppAudioPlayer file={att.file} src={att.url || att.preview} />
                          </div>
                        );
                      }

                      if (isImage) {
                        return (
                          <div key={attIdx} className="inline-block mr-2 mt-1">
                            <a href={att.url || att.preview} target="_blank" rel="noopener noreferrer">
                              <img
                                src={att.url || att.preview}
                                alt={att.name || "Attachment"}
                                className="w-20 h-20 object-cover rounded-lg border border-slate-300 hover:scale-105 transition-all shadow-2xs"
                              />
                            </a>
                          </div>
                        );
                      }

                      return (
                        <a
                          key={attIdx}
                          href={att.url || att.preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mr-2 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                        >
                          📎 <span>{att.name || "Download File"}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Remark Input Box */}
      {!readOnly ? (
        <div className="space-y-2.5 pt-3 border-t border-slate-100">
          <CommentWithMedia
            title={`Add Stage ${activeStageId} Discussion Note / Audio`}
            placeholder={`Record Stage ${activeStageId} negotiation update or audio note...`}
            value={remarkText}
            onChange={(val) => setRemarkText(val)}
            files={remarkAttachments}
            onFilesChange={(newFiles) => setRemarkAttachments(newFiles)}
          />

          <div className="pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Saving Stage & Moving to Next...</span>
                </>
              ) : (
                <>
                  <FaCheck className="text-xs" />
                  <span>{activeStageId < 11 ? "Save & Next Stage" : "Save & Complete Stage"}</span>
                  {activeStageId < 11 && <FaArrowRight className="text-xs ml-0.5" />}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-100 text-slate-500 rounded-lg text-xs italic text-center">
          Discussion log is in Read-Only mode for Viewers.
        </div>
      )}
    </div>
  );
};

export default PresalesDiscussionLog;
