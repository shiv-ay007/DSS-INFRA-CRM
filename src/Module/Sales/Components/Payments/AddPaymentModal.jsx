import React, { useState, useEffect } from "react";
import { FaTimes, FaRupeeSign, FaCheck } from "react-icons/fa";
import { createPaymentApi } from "../../services/payment.api";
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

const AddPaymentModal = ({
  isOpen,
  onClose,
  project = null,
  projectsList = [],
  currentUser,
  onSuccess
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [formData, setFormData] = useState({
    paymentType: "Advance",
    amount: "",
    paymentMode: "UPI",
    dateReceived: new Date().toISOString().split("T")[0],
    receivedBy: "",
    remark: ""
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Determine current active project (either passed as prop or selected from dropdown)
  const currentProject = React.useMemo(() => {
    if (project) return project;
    if (selectedProjectId) {
      return projectsList.find((p) => String(p.projectId || p._id) === String(selectedProjectId)) || null;
    }
    return projectsList[0] || null;
  }, [project, selectedProjectId, projectsList]);

  useEffect(() => {
    if (isOpen) {
      const initialId = project
        ? String(project.projectId || project._id || "")
        : (projectsList && projectsList.length > 0 ? String(projectsList[0].projectId || projectsList[0]._id || "") : "");

      const defaultPerson =
        project?.projectCoordinatorName ||
        project?.nextPersonName ||
        project?.activePerson ||
        project?.assignedTo ||
        currentUser?.name ||
        "Staff Member";

      setSelectedProjectId(initialId);
      setFormData({
        paymentType: "Advance",
        amount: "",
        paymentMode: "UPI",
        dateReceived: new Date().toISOString().split("T")[0],
        receivedBy: defaultPerson,
        remark: ""
      });
      setMediaFiles([]);
    }
  }, [isOpen, project, currentUser]);

  useEffect(() => {
    if (currentProject) {
      const coord =
        currentProject.projectCoordinatorName ||
        currentProject.nextPersonName ||
        currentProject.activePerson ||
        currentProject.assignedTo;
      if (coord) {
        setFormData((prev) => ({ ...prev, receivedBy: coord }));
      }
    }
  }, [currentProject]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetProjectId = currentProject?.projectId || currentProject?._id || selectedProjectId;
    if (!targetProjectId) {
      toast.error("Please select a project to link this payment to");
      return;
    }

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
      toast.error("Please enter the staff member who received the payment");
      return;
    }

    try {
      setSubmitting(true);

      // Upload media files to Cloudinary if any
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
        projectId: targetProjectId,
        paymentType: formData.paymentType,
        amount: numAmount,
        paymentMode: formData.paymentMode,
        dateReceived: formData.dateReceived,
        receivedBy: formData.receivedBy.trim(),
        remark: formData.remark.trim(),
        remarksFiles: uploadedRemarksFiles
      };

      const res = await createPaymentApi(payload);
      if (res && (res.success || res.statusCode === 201)) {
        toast.success(`Payment of ${formatINR(numAmount)} recorded successfully!`);
        // Notify notification bell & other listeners immediately
        window.dispatchEvent(new Event("dss_leads_updated"));
        onSuccess?.();
        onClose();
      } else {
        toast.error(res?.message || "Failed to save payment record");
      }
    } catch (err) {
      console.error("Error creating payment:", err);
      toast.error(err?.response?.data?.message || err?.message || "Error saving payment");
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
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-emerald-400">
              <FaRupeeSign className="text-base" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white">Record Payment</h3>
              <p className="text-[11px] text-slate-300">Add Token, Advance, or Milestone payment</p>
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

        {/* Project Context Banner */}
        {project ? (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Client & Project</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                  {project.clientName || "Client"}
                </span>
                {project.projectName && (
                  <span className="text-slate-500 font-medium text-xs">({project.projectName})</span>
                )}
                {project.phoneNumber && (
                  <span className="text-slate-400 font-mono text-[11px]">[{project.phoneNumber}]</span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Deal Value</span>
              <span className="font-black text-blue-700 font-mono text-xs sm:text-sm">
                {formatINR(project.totalDealValue)}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 space-y-1 shrink-0">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
              Select Client & Project <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
            >
              {projectsList.map((p) => (
                <option key={p.projectId || p._id} value={p.projectId || p._id}>
                  {p.clientName} — {p.projectName} (Deal: {formatINR(p.totalDealValue)})
                </option>
              ))}
            </select>
          </div>
        )}

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
                        ? "border-blue-600 bg-blue-600 text-white shadow-xs"
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
                  placeholder="e.g. 50000"
                  className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-bold font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Received & Received By */}
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
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Received By (Assigned Project Coordinator) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.receivedBy}
                onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                placeholder="Assigned Coordinator Name"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Remark & Cloudinary Media Upload (Voice Note, Photo, Receipts) */}
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
              className="px-5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <FaCheck className="text-xs" />
                  <span>Save Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPaymentModal;
