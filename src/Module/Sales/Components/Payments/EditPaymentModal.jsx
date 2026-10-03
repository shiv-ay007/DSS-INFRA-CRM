import React, { useState, useEffect } from "react";
import { FaTimes, FaRupeeSign, FaCheck } from "react-icons/fa";
import { updatePaymentApi } from "../../services/payment.api";
import { uploadMediaFileApi } from "../../services/upload.api";
import CommentWithMedia from "../../../../Common/Components/CommentWithMedia";
import { toast } from "react-toastify";

const PAYMENT_TYPES = [
  "Token",
  "Advance",
  "Milestone Payment",
  "Final Payment"
];

const PAYMENT_MODES = [
  "Cash",
  "Bank Transfer",
  "UPI",
  "Cheque"
];

const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

const EditPaymentModal = ({
  isOpen,
  onClose,
  payment,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    paymentType: "Advance",
    amount: "",
    paymentMode: "UPI",
    dateReceived: "",
    receivedBy: "",
    remark: ""
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && payment) {
      const rawDate = payment.dateReceived
        ? new Date(payment.dateReceived).toISOString().split("T")[0]
        : "";
      setFormData({
        paymentType: payment.paymentType || "Advance",
        amount: payment.amount || "",
        paymentMode: payment.paymentMode || "UPI",
        dateReceived: rawDate,
        receivedBy: payment.receivedBy || "",
        remark: payment.remark || ""
      });
      setMediaFiles(payment.remarksFiles || []);
    }
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numAmount = Number(formData.amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Please enter a valid payment amount (greater than ₹0)");
      return;
    }

    if (!formData.dateReceived) {
      toast.error("Please select a valid payment date");
      return;
    }

    if (!formData.receivedBy?.trim()) {
      toast.error("Please enter the staff member name");
      return;
    }

    try {
      setSubmitting(true);

      // Upload any new media files
      const uploadedRemarksFiles = [];
      if (mediaFiles && mediaFiles.length > 0) {
        for (const item of mediaFiles) {
          if (item.url) {
            uploadedRemarksFiles.push(item);
          } else if (item.file) {
            const upRes = await uploadMediaFileApi(item.file);
            const upData = upRes?.data || upRes;
            if (upData?.url) {
              uploadedRemarksFiles.push({
                url: upData.url,
                name: item.name || upData.name || "Payment Receipt",
                fileType: upData.fileType || item.type || "image",
                size: upData.size || 0,
                public_id: upData.public_id || ""
              });
            }
          }
        }
      }

      const payload = {
        paymentType: formData.paymentType,
        amount: numAmount,
        paymentMode: formData.paymentMode,
        dateReceived: formData.dateReceived,
        receivedBy: formData.receivedBy.trim(),
        remark: formData.remark.trim(),
        remarksFiles: uploadedRemarksFiles
      };

      const res = await updatePaymentApi(payment._id, payload);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success("Payment record updated successfully!");
        window.dispatchEvent(new Event("dss_leads_updated"));
        onSuccess?.();
        onClose();
      } else {
        toast.error(res?.message || "Failed to update payment record");
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      toast.error(err?.response?.data?.message || err?.message || "Error updating payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-amber-400">
              <FaRupeeSign className="text-base" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">Edit Payment Entry</h3>
              <p className="text-[11px] text-slate-300">Modify payment amount, date or remarks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Project Context */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Project</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                {payment.clientName || "Client"}
              </span>
              {payment.projectName && (
                <span className="text-slate-500 font-medium text-xs">({payment.projectName})</span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Original Amount</span>
            <span className="font-black text-slate-700 font-mono text-xs sm:text-sm">
              {formatINR(payment.amount)}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
          {/* Payment Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_TYPES.map((type) => {
                const isSelected = formData.paymentType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, paymentType: type })}
                    className={`py-2 px-2 rounded-lg text-xs font-bold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "border-amber-600 bg-amber-600 text-white shadow-xs"
                        : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <span>{type}</span>
                    {isSelected && <FaCheck className="text-[10px]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs pointer-events-none select-none">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Payment Mode <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Received By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date Received <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dateReceived}
                onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Received By <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.receivedBy}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Remark & Media Files */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Remark & Media Files (Receipts, Cheque Photo, Voice Notes)
            </label>
            <CommentWithMedia
              title="Payment Notes & Receipts"
              placeholder="Write remark or attach receipts, cheque photos, audio..."
              value={formData.remark}
              onChange={(text) => setFormData((prev) => ({ ...prev, remark: text }))}
              files={mediaFiles}
              onFilesChange={setMediaFiles}
              allowMedia={true}
              disabled={submitting}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Updating...</span>
              ) : (
                <>
                  <FaCheck className="text-xs" />
                  <span>Update Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;
