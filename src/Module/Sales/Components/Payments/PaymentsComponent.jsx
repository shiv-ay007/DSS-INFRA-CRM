import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRupeeSign,
  FaSearch,
  FaFilter,
  FaSync,
  FaEye,
  FaPlus,
  FaEdit,
  FaCoins,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaBuilding,
  FaTimes
} from "react-icons/fa";
import { getPaymentSummaryApi } from "../../services/payment.api";
import { getAllLeadProjectsApi } from "../../services/leadProject.api";
import { useAuth } from "../../../../context/AuthContext";
import PageHeader from "../../../../Common/Components/PageHeader";
import Table from "../../../../Common/Components/Table";
import AddPaymentModal from "./AddPaymentModal";
import EditPaymentModal from "./EditPaymentModal";
import PaymentPassbookModal from "./PaymentPassbookModal";
import { toast } from "react-toastify";

const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

// Reusable KPI Metric Card matching the CRM style
const KpiCard = ({ gradient, label, value, subtitle, icon }) => (
  <div className={`relative overflow-hidden rounded-xl p-4 text-white shadow-xs transition-all duration-200 ${gradient}`}>
    <div className="relative z-10 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">{label}</p>
        <h3 className="text-2xl font-black mt-0.5 tracking-tight font-mono">{value}</h3>
        <p className="text-[10px] opacity-80 mt-1 font-medium">{subtitle}</p>
      </div>
      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner shrink-0 text-white text-lg">
        {icon}
      </div>
    </div>
  </div>
);

const PaymentsComponent = () => {
  const navigate = useNavigate();
  const { user, role, isObserver } = useAuth();
  const isViewerOnly = isObserver || String(role || user?.role).toLowerCase().trim() === "observer";
  const canEdit = !isViewerOnly;

  const [loading, setLoading] = useState(true);
  const [projectsData, setProjectsData] = useState([]);
  const [overview, setOverview] = useState({
    overallDealValue: 0,
    overallReceived: 0,
    overallBalanceLeft: 0,
    totalProjects: 0,
    totalClients: 0
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim() !== "") count++;
    if (paymentModeFilter !== "ALL") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [searchQuery, paymentModeFilter, startDate, endDate]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals
  const [viewProjectId, setViewProjectId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedProjectForAdd, setSelectedProjectForAdd] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Load Payments Data (with fallback to lead-projects if needed)
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (paymentModeFilter !== "ALL") params.paymentMode = paymentModeFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      // 1. Fetch from payment summary API
      const res = await getPaymentSummaryApi(params);
      const dataObj = res?.data || res || {};
      let list = Array.isArray(dataObj.summary) ? dataObj.summary : [];

      // 2. Intelligent Fallback: If no summary records yet, load from lead-projects directly
      if (list.length === 0 && !searchQuery.trim() && paymentModeFilter === "ALL" && !startDate && !endDate) {
        try {
          const leadProjectsRes = await getAllLeadProjectsApi({ isClosed: "false" });
          const rawProjs =
            leadProjectsRes?.data?.projects ||
            leadProjectsRes?.projects ||
            (Array.isArray(leadProjectsRes?.data) ? leadProjectsRes.data : []);

          if (rawProjs.length > 0) {
            list = rawProjs.map((p) => {
              const totalDeal = Number(p.expectedBusiness || p.leadId?.expectedBusiness) || 0;
              return {
                projectId: p._id || p.id,
                clientName: p.clientName || p.leadId?.clientName || p.leadId?.concernPersonName || "Unnamed Client",
                projectName: p.projectName || p.leadId?.projectName || "Unnamed Project",
                phoneNumber: p.phoneNumber || p.contactNo || p.leadId?.phoneNumber || "",
                totalDealValue: totalDeal,
                totalReceived: 0,
                balanceLeft: totalDeal,
                paymentsCount: 0,
                lastPaymentDate: null,
                modesUsed: [],
                status: p.status || "ACTIVE"
              };
            });
          }
        } catch (fbErr) {
          console.warn("Fallback lead projects fetch error:", fbErr);
        }
      }

      setProjectsData(list);

      // Compute overview
      if (dataObj.overview && dataObj.overview.totalProjects > 0) {
        setOverview(dataObj.overview);
      } else {
        let totalDeal = 0;
        let totalRec = 0;
        const clients = new Set();
        list.forEach((item) => {
          totalDeal += Number(item.totalDealValue) || 0;
          totalRec += Number(item.totalReceived) || 0;
          if (item.clientName) clients.add(item.clientName.trim().toLowerCase());
        });
        setOverview({
          overallDealValue: totalDeal,
          overallReceived: totalRec,
          overallBalanceLeft: Math.max(0, totalDeal - totalRec),
          totalProjects: list.length,
          totalClients: clients.size
        });
      }
    } catch (err) {
      console.error("Error loading payments data:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load payments data");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, paymentModeFilter, startDate, endDate]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Client-side search & filtering over loaded records
  const filteredProjects = useMemo(() => {
    return projectsData.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesClient = item.clientName?.toLowerCase().includes(q);
        const matchesProj = item.projectName?.toLowerCase().includes(q);
        const matchesPhone = item.phoneNumber?.toLowerCase().includes(q);
        if (!matchesClient && !matchesProj && !matchesPhone) return false;
      }
      return true;
    });
  }, [projectsData, searchQuery]);

  // Paginated records for Common Table
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(start, start + itemsPerPage);
  }, [filteredProjects, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setPaymentModeFilter("ALL");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // Actions: Navigate to Details Page
  const handleView = (proj) => {
    const targetId = proj.projectId || proj._id;
    if (targetId) {
      navigate(`/sales/payments/details/${targetId}`, { state: { project: proj } });
    }
  };

  const handleAdd = (proj) => {
    setSelectedProjectForAdd(proj);
    setIsAddModalOpen(true);
  };

  const handleEdit = (proj) => {
    const targetId = proj.projectId || proj._id;
    if (targetId) {
      navigate(`/sales/payments/details/${targetId}`, { state: { project: proj } });
    }
  };

  // Common Table Column Configuration (No Progress Bar)
  const columnConfig = useMemo(
    () => ({
      // 1. Actions Column (View only)
      actions: {
        label: "Actions",
        align: "center",
        headerClass: "min-w-[70px] w-16",
        render: (_, row) => (
          <div className="flex items-center justify-center">
            {/* View Payment Records */}
            <button
              type="button"
              onClick={() => handleView(row)}
              title="View Payment Records"
              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all flex items-center justify-center cursor-pointer shadow-2xs hover:scale-105"
            >
              <FaEye className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      },

      // 2. Client Name
      clientName: {
        label: "Client Name",
        align: "center",
        headerClass: "min-w-[180px]",
        render: (_, row) => (
          <div className="flex flex-col items-center justify-center text-center py-0.5">
            <span className="font-bold text-slate-900 text-xs sm:text-sm">
              {row.clientName || "Unnamed Client"}
            </span>
            {row.phoneNumber && (
              <span className="text-[11px] text-slate-500 font-mono mt-0.5">
                {row.phoneNumber}
              </span>
            )}
          </div>
        )
      },

      // 3. Project Name
      projectName: {
        label: "Project Name",
        align: "center",
        headerClass: "min-w-[160px]",
        render: (_, row) => (
          <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
            {row.projectName || "Unnamed Project"}
          </span>
        )
      },

      // 4. Total Deal Value (₹)
      totalDealValue: {
        label: "Total Deal Value (₹)",
        align: "center",
        headerClass: "min-w-[150px]",
        render: (val) => (
          <span className="font-extrabold font-mono text-slate-900 text-xs sm:text-sm">
            {formatINR(val)}
          </span>
        )
      },

      // 5. Total Received (₹)
      totalReceived: {
        label: "Total Received (₹)",
        align: "center",
        headerClass: "min-w-[150px]",
        render: (val) => (
          <span className="font-extrabold font-mono text-emerald-700 text-xs sm:text-sm">
            {formatINR(val)}
          </span>
        )
      },

      // 6. Balance Left (₹)
      balanceLeft: {
        label: "Balance Left (₹)",
        align: "center",
        headerClass: "min-w-[150px]",
        render: (val, row) => {
          const deal = Number(row?.totalDealValue || 0);
          const rec = Number(row?.totalReceived || 0);
          const isDone = deal > 0 && rec >= deal;
          if (isDone) {
            return (
              <div className="flex flex-col items-center justify-center">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                  ✓ Completed
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">₹0 Left</span>
              </div>
            );
          }
          return (
            <span className="font-extrabold font-mono text-amber-800 text-xs sm:text-sm">
              {formatINR(val)}
            </span>
          );
        }
      }
    }),
    [canEdit]
  );

  return (
    <div className="space-y-4 pb-12 font-sans px-1 sm:px-0 w-full max-w-full min-w-0">
      {/* 1. Fixed / Sticky Header */}
      <div className="sticky -top-2.5 sm:-top-4 z-30 bg-slate-100/95 backdrop-blur-xs pt-1 pb-1">
        <PageHeader
          title="Payments & Financial Tracking"
          description="Advance, token & milestone payment tracking linked directly with Project Deal Values"
          badge="Module 7"
          icon={FaRupeeSign}
          iconBgColor="bg-emerald-50"
          iconColor="text-emerald-600"
          rightActions={
            <div className="flex items-center gap-2">
              {/* Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`relative p-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center cursor-pointer shadow-xs border ${
                  showFilters
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
                title={showFilters ? "Hide Filter Options" : "Show Filter Options"}
              >
                <FaFilter className="w-3.5 h-3.5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={fetchAllData}
                title="Refresh database records"
                className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer flex items-center justify-center"
              >
                <FaSync className={`text-xs ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          }
        />

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-md border border-slate-200 space-y-3 mt-2 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search Input */}
              <div className="relative flex-1 max-w-lg">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by client name, project name, phone..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Mode & Date Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700">
                  <FaFilter className="text-slate-400 text-xs" />
                  <span>Mode:</span>
                  <select
                    value={paymentModeFilter}
                    onChange={(e) => {
                      setPaymentModeFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Modes</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
                  <FaCalendarAlt className="text-slate-400 text-xs" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    title="Start Date"
                    className="bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                  <span className="text-slate-400 font-bold">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    title="End Date"
                    className="bg-transparent text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                {(searchQuery || paymentModeFilter !== "ALL" || startDate || endDate) && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top 3 KPI Financial Cards (Matching Active Projects KPI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <KpiCard
          gradient="bg-gradient-to-r from-blue-700 to-indigo-800"
          label="Total Deal Value"
          value={formatINR(overview.overallDealValue)}
          subtitle={`Across ${overview.totalProjects} projects (${overview.totalClients} clients)`}
          icon={<FaBuilding />}
        />

        <KpiCard
          gradient="bg-gradient-to-r from-emerald-600 to-teal-700"
          label="Total Received"
          value={formatINR(overview.overallReceived)}
          subtitle="Cleared token, advance & milestone receipts"
          icon={<FaRupeeSign />}
        />

        <KpiCard
          gradient="bg-gradient-to-r from-amber-600 to-orange-700"
          label="Balance Left"
          value={formatINR(overview.overallBalanceLeft)}
          subtitle="Remaining receivable amount to be collected"
          icon={<FaCoins />}
        />
      </div>

      {/* 4. Common Table (Matching All Other Pages in the CRM) */}
      <div className="border border-slate-200 overflow-hidden shadow-2xs bg-white">
        <Table
          data={paginatedProjects}
          columnConfig={columnConfig}
          currentPage={currentPage}
          totalItems={filteredProjects.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(limit) => {
            setItemsPerPage(limit);
            setCurrentPage(1);
          }}
          isLoading={loading}
          showSrNo={true}
        />
      </div>

      {/* 5. Add Payment Modal */}
      {isAddModalOpen && (
        <AddPaymentModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedProjectForAdd(null);
          }}
          project={selectedProjectForAdd}
          projectsList={projectsData}
          currentUser={user}
          onSuccess={() => {
            fetchAllData();
            if (viewProjectId) {
              setIsViewModalOpen(true);
            }
          }}
        />
      )}

      {/* 7. Edit Payment Modal */}
      {isEditModalOpen && (
        <EditPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPaymentForEdit(null);
          }}
          payment={selectedPaymentForEdit}
          onSuccess={() => {
            fetchAllData();
            if (viewProjectId) {
              setIsViewModalOpen(true);
            }
          }}
        />
      )}
    </div>
  );
};

export default PaymentsComponent;
