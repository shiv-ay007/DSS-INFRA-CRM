import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaRupeeSign,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBuilding,
  FaCoins,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaImage,
  FaPlay,
  FaExternalLinkAlt,
  FaTimes,
  FaFileInvoiceDollar,
  FaSync,
  FaCheckCircle
} from "react-icons/fa";
import { getProjectPaymentsApi, deletePaymentApi } from "../../services/payment.api";
import { getAllLeadProjectsApi, getLeadProjectByIdApi } from "../../services/leadProject.api";
import { useAuth } from "../../../../context/AuthContext";
import PageHeader from "../../../../Common/Components/PageHeader";
import AddPaymentModal from "../../Components/Payments/AddPaymentModal";
import EditPaymentModal from "../../Components/Payments/EditPaymentModal";
import WhatsAppAudioPlayer from "../../../../Common/Components/WhatsAppAudioPlayer";
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

const PaymentDetailsPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const stateProject = location.state?.project;

  const { user, role, isObserver } = useAuth();
  const isViewerOnly = isObserver || String(role || user?.role).toLowerCase().trim() === "observer";
  const canEdit = !isViewerOnly;

  const [loading, setLoading] = useState(true);
  const [projectData, setProjectData] = useState(stateProject || null);
  const [payments, setPayments] = useState([]);

  // Search & Filter within project
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterMode, setFilterMode] = useState("ALL");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Lightbox preview modal for media
  const [previewMedia, setPreviewMedia] = useState(null);

  // Fetch Project Passbook from Backend
  const fetchPassbook = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await getProjectPaymentsApi(projectId);
      const dataObj = res?.data || res || {};

      let resolvedCoord =
        dataObj.project?.projectCoordinatorName ||
        dataObj.project?.nextPersonName ||
        stateProject?.projectCoordinatorName ||
        stateProject?.nextPersonName ||
        "";

      // If coordinator not yet resolved, query the project directly
      if (!resolvedCoord) {
        try {
          const lpRes = await getLeadProjectByIdApi(projectId);
          const lp = lpRes?.data || lpRes;
          if (lp) {
            resolvedCoord =
              lp.projectCoordinatorName ||
              lp.nextPersonName ||
              lp.activePerson ||
              lp.assignedTo ||
              lp.salesPerson ||
              "";
          }
        } catch (_) {}
      }

      // Fallback search across lead projects list
      if (!resolvedCoord) {
        try {
          const leadProjectsRes = await getAllLeadProjectsApi({ isClosed: "false" });
          const rawProjs =
            leadProjectsRes?.data?.projects ||
            leadProjectsRes?.projects ||
            (Array.isArray(leadProjectsRes?.data) ? leadProjectsRes.data : []);
          const matched = rawProjs.find((p) => String(p._id || p.id || p.leadId?._id || p.leadId) === String(projectId));
          if (matched) {
            resolvedCoord =
              matched.projectCoordinatorName ||
              matched.nextPersonName ||
              matched.activePerson ||
              matched.assignedTo ||
              matched.salesPerson ||
              "";
          }
        } catch (_) {}
      }

      if (dataObj.project) {
        setProjectData((prev) => ({
          ...prev,
          ...dataObj.project,
          projectCoordinatorName: resolvedCoord || dataObj.project.projectCoordinatorName || prev?.projectCoordinatorName || "",
          nextPersonName: resolvedCoord || dataObj.project.nextPersonName || prev?.nextPersonName || ""
        }));
      } else if (!stateProject) {
        try {
          const leadProjectsRes = await getAllLeadProjectsApi({ isClosed: "false" });
          const rawProjs =
            leadProjectsRes?.data?.projects ||
            leadProjectsRes?.projects ||
            (Array.isArray(leadProjectsRes?.data) ? leadProjectsRes.data : []);
          const matched = rawProjs.find((p) => String(p._id || p.id || p.leadId?._id || p.leadId) === String(projectId));
          if (matched) {
            const totalDeal = Number(matched.expectedBusiness || matched.leadId?.expectedBusiness) || 0;
            const coord =
              matched.projectCoordinatorName ||
              matched.nextPersonName ||
              matched.activePerson ||
              matched.assignedTo ||
              matched.salesPerson ||
              "";
            setProjectData({
              projectId: matched._id || matched.id,
              clientName: matched.clientName || matched.leadId?.clientName || matched.leadId?.concernPersonName || "Unnamed Client",
              projectName: matched.projectName || matched.leadId?.projectName || "Unnamed Project",
              phoneNumber: matched.phoneNumber || matched.contactNo || matched.leadId?.phoneNumber || "",
              totalDealValue: totalDeal,
              totalReceived: 0,
              balanceLeft: totalDeal,
              projectCoordinatorName: coord,
              nextPersonName: coord
            });
          }
        } catch (_) {}
      } else if (resolvedCoord) {
        setProjectData((prev) => ({
          ...prev,
          projectCoordinatorName: resolvedCoord,
          nextPersonName: resolvedCoord
        }));
      }

      if (Array.isArray(dataObj.payments)) {
        setPayments(dataObj.payments);
      }
    } catch (err) {
      console.error("Error fetching passbook:", err);
      if (!stateProject) {
        toast.error(err?.response?.data?.message || err?.message || "Failed to load project payment details");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, stateProject]);

  useEffect(() => {
    fetchPassbook();
  }, [fetchPassbook]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      if (filterType !== "ALL" && pay.paymentType !== filterType) return false;
      if (filterMode !== "ALL" && pay.paymentMode !== filterMode) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesRemark = pay.remark?.toLowerCase().includes(q);
        const matchesPerson = pay.receivedBy?.toLowerCase().includes(q);
        if (!matchesRemark && !matchesPerson) return false;
      }
      return true;
    });
  }, [payments, filterType, filterMode, searchQuery]);

  // Delete Payment
  const handleDeletePayment = async (payId, amount) => {
    if (!window.confirm(`Are you sure you want to delete this payment of ${formatINR(amount)}? This will recalculate the balance.`)) {
      return;
    }

    try {
      const res = await deletePaymentApi(payId);
      if (res && (res.success || res.statusCode === 200)) {
        toast.success("Payment record deleted successfully");
        fetchPassbook();
      } else {
        toast.error("Failed to delete payment");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err?.response?.data?.message || "Error deleting payment");
    }
  };

  // Real-time financial calculations
  const calculatedTotalReceived = useMemo(() => {
    return payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [payments]);

  const totalDealValue = Number(projectData?.totalDealValue || 0);
  const remainingBalance = Math.max(0, totalDealValue - calculatedTotalReceived);
  const isCompleted = totalDealValue > 0 && calculatedTotalReceived >= totalDealValue;

  return (
    <div className="space-y-4 pb-12 font-sans px-1 sm:px-0 w-full max-w-full min-w-0">
      {/* 1. Header with Back Button */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100/95 backdrop-blur-xs pt-1 pb-1">
        <PageHeader
          title={`Payment Records • ${projectData?.projectName || "Project"}`}
          description={`Client: ${projectData?.clientName || "--"} ${projectData?.phoneNumber ? `(${projectData.phoneNumber})` : ""}`}
          badge={isCompleted ? "Payment Complete" : "Payment Records"}
          showBackButton={true}
          onBack={() => navigate("/sales/payments")}
          icon={FaFileInvoiceDollar}
          iconBgColor={isCompleted ? "bg-emerald-100" : "bg-emerald-50"}
          iconColor={isCompleted ? "text-emerald-700" : "text-emerald-600"}
          rightActions={
            <div className="flex items-center gap-2">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                title="Toggle Filters"
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer shadow-xs ${
                  isFilterOpen || filterType !== "ALL" || filterMode !== "ALL" || searchQuery
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                }`}
              >
                <FaFilter className="text-[10px]" />
                <span>Filter</span>
                {(filterType !== "ALL" || filterMode !== "ALL" || searchQuery) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                )}
              </button>

              {canEdit && (
                isCompleted ? (
                  <button
                    type="button"
                    disabled
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white flex items-center gap-1.5 opacity-90 cursor-not-allowed shadow-xs"
                    title="Deal payment is 100% completed"
                  >
                    <FaCheckCircle className="text-xs" />
                    <span>Completed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <FaPlus className="text-xs" />
                    <span>Add Payment</span>
                  </button>
                )
              )}

              <button
                type="button"
                onClick={fetchPassbook}
                title="Refresh database records"
                className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
              >
                <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          }
        />
      </div>

      {/* 2. Top 3 KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Deal Value */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-xl p-4 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Total Deal Value</p>
              <h3 className="text-2xl font-black mt-0.5 tracking-tight font-mono">
                {formatINR(totalDealValue)}
              </h3>
              <p className="text-[10px] opacity-80 mt-1 font-medium">Agreed commercial contract value</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl text-white text-lg">
              <FaBuilding />
            </div>
          </div>
        </div>

        {/* Total Received */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl p-4 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Total Received</p>
              <h3 className="text-2xl font-black mt-0.5 tracking-tight font-mono">
                {formatINR(calculatedTotalReceived)}
              </h3>
              <p className="text-[10px] opacity-80 mt-1 font-medium">{payments.length} transactions recorded</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl text-white text-lg">
              <FaRupeeSign />
            </div>
          </div>
        </div>

        {/* Balance Left / Completed Status */}
        {isCompleted ? (
          <div className="bg-gradient-to-r from-teal-600 to-emerald-700 rounded-xl p-4 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Payment Status</p>
                <h3 className="text-2xl font-black mt-0.5 tracking-tight font-mono flex items-center gap-2">
                  Completed
                </h3>
                <p className="text-[10px] opacity-90 mt-1 font-semibold flex items-center gap-1">
                  <FaCheckCircle className="text-emerald-200" /> All dues cleared (₹0 balance left)
                </p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white text-lg">
                <FaCheckCircle />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-600 to-orange-700 rounded-xl p-4 text-white shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Balance Left</p>
                <h3 className="text-2xl font-black mt-0.5 tracking-tight font-mono">
                  {formatINR(remainingBalance)}
                </h3>
                <p className="text-[10px] opacity-80 mt-1 font-medium">Remaining balance to be collected</p>
              </div>
              <div className="p-3 bg-white/20 rounded-xl text-white text-lg">
                <FaCoins />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Search & Filter Bar (Opens on Header Filter button click) */}
      {isFilterOpen && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs animate-fadeIn">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative w-full max-w-sm">
              <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by remark or staff name..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Token">Token</option>
              <option value="Advance">Advance</option>
              <option value="Milestone Payment">Milestone Payment</option>
              <option value="Final Payment">Final Payment</option>
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 font-semibold cursor-pointer"
            >
              <option value="ALL">All Modes</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>

            {(searchQuery || filterType !== "ALL" || filterMode !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("ALL");
                  setFilterMode("ALL");
                }}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline px-2 py-1 cursor-pointer whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[11px] text-slate-500 font-semibold">
              Showing {filteredPayments.length} of {payments.length} transaction{payments.length === 1 ? "" : "s"}
            </div>
            <button
              type="button"
              onClick={() => setIsFilterOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              title="Close Filters"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Transactions Table (Sharp square borders matching CRM standard) */}
      <div className="border border-slate-200 overflow-hidden shadow-2xs bg-white">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs font-semibold">Loading payment transactions...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-8">
            <FaFileInvoiceDollar className="text-4xl mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No Payment Records Found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No payments have been recorded for this project yet.
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FaPlus className="text-xs" />
                <span>Record First Payment</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-black text-white text-xs font-bold uppercase tracking-wider select-none text-center">
                  <th className="py-2.5 px-3 text-center w-12 border-r border-slate-800">SR. NO.</th>
                  {canEdit && <th className="py-2.5 px-3 text-center w-16 min-w-[70px] border-r border-slate-800">Actions</th>}
                  <th className="py-2.5 px-3 text-center border-r border-slate-800 min-w-[130px]">Date & Time</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-800 min-w-[120px]">Payment Type</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-800 min-w-[130px]">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-800 min-w-[110px]">Mode</th>
                  <th className="py-2.5 px-3 text-center border-r border-slate-800 min-w-[130px]">Received By</th>
                  <th className="py-2.5 px-3 text-center min-w-[240px]">Remark & Media Files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700 bg-white">
                {filteredPayments.map((pay, idx) => {
                  const dt = formatDateTime(pay.dateReceived, pay.createdAt);
                  return (
                  <tr key={pay._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* SR. NO. */}
                    <td className="py-3 px-3 text-center font-bold text-slate-500">
                      {idx + 1}
                    </td>

                    {/* Actions (Edit only) */}
                    {canEdit && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPaymentForEdit(pay);
                              setIsEditModalOpen(true);
                            }}
                            title="Edit this payment"
                            className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <FaEdit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}

                    {/* Date & Time */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
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

                    {/* Payment Type */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${getPaymentTypeBadge(pay.paymentType)}`}>
                        {pay.paymentType}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-center font-extrabold font-mono text-emerald-700 text-sm whitespace-nowrap">
                      {formatINR(pay.amount)}
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${getModeBadge(pay.paymentMode)}`}>
                        {pay.paymentMode}
                      </span>
                    </td>

                    {/* Received By */}
                    <td className="py-3 px-3 text-center whitespace-nowrap font-medium text-slate-800">
                      {projectData?.projectCoordinatorName || projectData?.nextPersonName || pay.receivedBy || "--"}
                    </td>

                    {/* Remark & Media Files */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center justify-center space-y-1.5 max-w-md mx-auto text-center">
                        {pay.remark && (
                          <p className="text-slate-800 text-xs leading-relaxed font-normal text-center w-full">
                            {pay.remark}
                          </p>
                        )}

                        {/* Media Files Attachments (Images, Audio, Docs) */}
                        {Array.isArray(pay.remarksFiles) && pay.remarksFiles.length > 0 && (
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full">
                            {pay.remarksFiles.map((file, fIdx) => {
                              const isImage = file.fileType === "image" || file.url?.match(/\.(jpeg|jpg|png|gif|webp)/i);
                              const isAudio = file.fileType === "audio" || file.url?.match(/\.(mp3|wav|ogg|webm|m4a)/i);

                              if (isAudio) {
                                return (
                                  <div key={fIdx} className="w-full max-w-[260px] mx-auto">
                                    <WhatsAppAudioPlayer src={file.url} />
                                  </div>
                                );
                              }

                              if (isImage) {
                                return (
                                  <div
                                    key={fIdx}
                                    onClick={() => setPreviewMedia(file)}
                                    className="relative group cursor-pointer w-12 h-12 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0 shadow-2xs hover:shadow transition-shadow mx-auto"
                                    title="Click to view image"
                                  >
                                    <img
                                      src={file.url}
                                      alt={file.name || "Payment Receipt"}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px]">
                                      <FaExternalLinkAlt />
                                    </div>
                                  </div>
                                );
                              }

                              // Document or other file
                              return (
                                <a
                                  key={fIdx}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold border border-slate-200 transition-colors mx-auto"
                                  title="Open document"
                                >
                                  <FaFileAlt className="text-slate-500 text-[10px]" />
                                  <span className="max-w-[120px] truncate">{file.name || "Attachment"}</span>
                                </a>
                              );
                            })}
                          </div>
                        )}

                        {!pay.remark && (!pay.remarksFiles || pay.remarksFiles.length === 0) && (
                          <span className="text-slate-400 text-[11px]">--</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add Payment Modal for this project */}
      {isAddModalOpen && (
        <AddPaymentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          project={{
            ...projectData,
            totalDealValue,
            totalReceived: calculatedTotalReceived,
            balanceLeft: remainingBalance
          }}
          currentUser={user}
          onSuccess={() => {
            fetchPassbook();
          }}
        />
      )}

      {/* 6. Edit Payment Modal */}
      {isEditModalOpen && (
        <EditPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPaymentForEdit(null);
          }}
          payment={selectedPaymentForEdit}
          project={{
            ...projectData,
            totalDealValue,
            totalReceived: calculatedTotalReceived,
            balanceLeft: remainingBalance
          }}
          onSuccess={() => {
            fetchPassbook();
          }}
        />
      )}

      {/* 7. Image / Media Lightbox Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-white rounded-xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white text-xs font-bold">
              <span>{previewMedia.name || "Payment Receipt Preview"}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 hover:bg-white/20 rounded cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100">
              <img
                src={previewMedia.url}
                alt="Preview"
                className="max-h-[75vh] w-auto object-contain rounded shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailsPage;
