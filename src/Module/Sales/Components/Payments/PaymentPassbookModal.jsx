import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaRupeeSign,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaFileInvoiceDollar,
  FaSearch,
  FaFilter,
  FaArrowDown,
  FaCheckCircle
} from "react-icons/fa";
import { getProjectPaymentsApi, deletePaymentApi } from "../../services/payment.api";
import { toast } from "react-toastify";

const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "--";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (_) {
    return String(dateStr);
  }
};

const formatDateTime = (dateStr, createdAtStr, timeStr) => {
  if (!dateStr && !createdAtStr) return { date: "--", time: "" };

  let datePart = "--";
  try {
    const d = new Date(dateStr || createdAtStr);
    if (!isNaN(d.getTime())) {
      datePart = d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } else {
      datePart = String(dateStr || "--");
    }
  } catch (_) {
    datePart = String(dateStr || "--");
  }

  let timePart = timeStr || "";
  if (!timePart) {
    const timeSource = createdAtStr || (dateStr && String(dateStr).includes("T") && !String(dateStr).endsWith("T00:00:00.000Z") ? dateStr : null);
    if (timeSource) {
      try {
        const dt = new Date(timeSource);
        if (!isNaN(dt.getTime())) {
          timePart = dt.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });
        }
      } catch (_) {}
    }
  }

  return { date: datePart, time: timePart };
};

const getPaymentTypeBadge = (type) => {
  switch (type) {
    case "Token":
      return "bg-amber-100 text-amber-900 border border-amber-300";
    case "Advance":
      return "bg-blue-100 text-blue-900 border border-blue-300";
    case "Milestone Payment":
      return "bg-purple-100 text-purple-900 border border-purple-300";
    case "Final Payment":
      return "bg-emerald-100 text-emerald-900 border border-emerald-300";
    default:
      return "bg-slate-100 text-slate-800 border border-slate-300";
  }
};

const getModeBadge = (mode) => {
  switch (mode) {
    case "UPI":
      return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    case "Bank Transfer":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    case "Cheque":
      return "bg-amber-50 text-amber-700 border border-amber-200";
    case "Cash":
      return "bg-emerald-50 text-emerald-800 border border-emerald-200";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-200";
  }
};

const PaymentPassbookModal = ({
  isOpen,
  onClose,
  projectId,
  canEdit = true,
  onOpenAddPayment,
  onOpenEditPayment,
  onRefreshParent
}) => {
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    paymentMode: "ALL",
    paymentType: "ALL"
  });

  const fetchPassbook = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.paymentMode !== "ALL") params.paymentMode = filters.paymentMode;
      if (filters.paymentType !== "ALL") params.paymentType = filters.paymentType;

      const res = await getProjectPaymentsApi(projectId, params);
      if (res && res.data) {
        setProjectData(res.data.project);
        setPayments(res.data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load passbook:", err);
      toast.error(err?.response?.data?.message || "Failed to load project payment history");
    } finally {
      setLoading(false);
    }
  }, [projectId, filters]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchPassbook();
    }
  }, [isOpen, projectId, fetchPassbook]);

  if (!isOpen) return null;

  const handleDeletePayment = async (payId, amount) => {
    if (!window.confirm(`Are you sure you want to delete this payment of ${formatINR(amount)}? This will recalculate the balance.`)) {
      return;
    }

    try {
      const res = await deletePaymentApi(payId);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success("Payment record deleted successfully");
        fetchPassbook();
        onRefreshParent?.();
      } else {
        toast.error("Failed to delete payment");
      }
    } catch (err) {
      console.error("Delete payment error:", err);
      toast.error(err?.response?.data?.message || "Error deleting payment");
    }
  };

  const calculatedTotalReceived = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalDeal = Number(projectData?.totalDealValue || 0);
  const remainingBalance = Math.max(0, totalDeal - calculatedTotalReceived);
  const isCompleted = totalDeal > 0 && calculatedTotalReceived >= totalDeal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FaFileInvoiceDollar className="text-xl text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">Payment Records</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                  isCompleted
                    ? "bg-emerald-500/30 text-emerald-300 border-emerald-400/50"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  {isCompleted ? "✓ Completed" : "Project Ledger"}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {projectData?.clientName} • <span className="text-blue-300 font-semibold">{projectData?.projectName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {canEdit && (
              isCompleted ? (
                <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <FaCheckCircle className="text-xs" />
                  <span>Completed</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddPayment?.({
                      projectId,
                      clientName: projectData?.clientName,
                      projectName: projectData?.projectName,
                      totalDealValue: totalDeal,
                      totalReceived: calculatedTotalReceived,
                      balanceLeft: remainingBalance
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <FaPlus className="text-xs" />
                  <span>Add Payment</span>
                </button>
              )
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Financial Overview 3-Box Banner (No Progress Bar) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border-b border-slate-200">
          {/* Box 1: Total Deal Value */}
          <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
              Total Deal Value
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-slate-800 font-mono">
              {formatINR(totalDeal)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Agreed commercial contract value</p>
          </div>

          {/* Box 2: Total Received */}
          <div className="bg-white rounded-xl p-3.5 border border-emerald-200/80 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block tracking-wider mb-1">
              Total Received
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono">
              {formatINR(calculatedTotalReceived)}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">{payments.length} transactions recorded</p>
          </div>

          {/* Box 3: Balance Left / Completed */}
          {isCompleted ? (
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-300 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider mb-1">
                Payment Status
              </span>
              <div className="text-lg sm:text-xl font-black text-emerald-800 font-mono flex items-center gap-1.5">
                <FaCheckCircle className="text-emerald-600 text-base" /> Completed
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">All dues cleared (₹0 balance left)</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-3.5 border border-amber-200/80 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider mb-1">
                Balance Left
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-amber-800 font-mono">
                {formatINR(remainingBalance)}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Remaining receivable amount</p>
            </div>
          )}
        </div>

        {/* Passbook Filters Bar */}
        <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <div className="relative w-full max-w-xs">
              <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search remark or received by..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.paymentType}
              onChange={(e) => setFilters({ ...filters, paymentType: e.target.value })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Token">Token</option>
              <option value="Advance">Advance</option>
              <option value="Milestone Payment">Milestone Payment</option>
              <option value="Final Payment">Final Payment</option>
            </select>

            <select
              value={filters.paymentMode}
              onChange={(e) => setFilters({ ...filters, paymentMode: e.target.value })}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Showing {payments.length} record{payments.length === 1 ? "" : "s"}
          </div>
        </div>

        {/* Passbook Transactions Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-16 text-center text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-xs font-semibold">Loading payment transactions...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8">
              <FaFileInvoiceDollar className="text-4xl mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No Payment Records Yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No advance or token payments have been recorded for this project yet.
              </p>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddPayment?.({
                      projectId,
                      clientName: projectData?.clientName,
                      projectName: projectData?.projectName,
                      totalDealValue: projectData?.totalDealValue
                    });
                  }}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <FaPlus className="text-xs" />
                  <span>Record First Payment</span>
                </button>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-3 text-center w-12">SR. NO.</th>
                    {canEdit && <th className="py-3 px-3 text-center w-16 min-w-[70px]">Actions</th>}
                    <th className="py-3 px-3.5 text-center min-w-[120px]">Date & Time</th>
                    <th className="py-3 px-3.5 text-center">Type</th>
                    <th className="py-3 px-3.5 text-center">Amount (₹)</th>
                    <th className="py-3 px-3.5 text-center">Mode</th>
                    <th className="py-3 px-3.5 text-center">Received By</th>
                    <th className="py-3 px-3.5 text-center">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pay, idx) => {
                    const dt = formatDateTime(pay.dateReceived, pay.createdAt);
                    return (
                    <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* SR. NO. */}
                      <td className="py-3 px-3 font-bold text-slate-500 text-center">
                        {idx + 1}
                      </td>

                      {/* Actions (Edit only) */}
                      {canEdit && (
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenEditPayment?.(pay);
                              }}
                              title="Edit this payment"
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer shadow-2xs hover:scale-105"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Date & Time */}
                      <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center justify-center px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200/90 shadow-2xs">
                          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-800 text-[11px]">
                            <FaCalendarAlt className="text-blue-600 text-[10px]" />
                            <span>{dt.date}</span>
                          </div>
                          {dt.time && (
                            <div className="flex items-center justify-center gap-1 mt-0.5 px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-mono font-semibold">
                              <FaClock className="text-slate-400 text-[9px]" />
                              <span>{dt.time}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${getPaymentTypeBadge(pay.paymentType)}`}>
                          {pay.paymentType}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3.5 font-bold font-mono text-emerald-700 text-sm whitespace-nowrap text-center">
                        {formatINR(pay.amount)}
                      </td>

                      {/* Mode */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${getModeBadge(pay.paymentMode)}`}>
                          {pay.paymentMode}
                        </span>
                      </td>

                      {/* Received By */}
                      <td className="py-3 px-3.5 font-medium text-slate-700 whitespace-nowrap text-center">
                        {projectData?.projectCoordinatorName || projectData?.nextPersonName || pay.receivedBy || "--"}
                      </td>

                      {/* Remark */}
                      <td className="py-3 px-3.5 text-slate-600 max-w-xs truncate text-center" title={pay.remark}>
                        {pay.remark || "--"}
                      </td>
                    </tr>
                  );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPassbookModal;
