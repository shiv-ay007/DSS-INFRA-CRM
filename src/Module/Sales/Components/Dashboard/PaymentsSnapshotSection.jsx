import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from "recharts";
import {
  FaRupeeSign,
  FaReceipt,
  FaWallet,
  FaCoins,
  FaCheckDouble,
  FaMoneyCheckAlt
} from "react-icons/fa";

const formatINR = (val) => {
  const num = Number(val) || 0;
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(num);
};

const MODE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

const PaymentsSnapshotSection = ({ paymentsData = {} }) => {
  const {
    totalReceived = 0,
    tokenAmount = 0,
    advanceAmount = 0,
    milestoneAmount = 0,
    finalAmount = 0,
    paymentCount = 0,
    modeChart = []
  } = paymentsData;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-2xs">
            <FaRupeeSign className="text-base" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              4. Payments Snapshot
            </h2>
            <p className="text-xs text-slate-500">
              Passbook &amp; Collection Overview • Filtered advances, tokens &amp; milestone realizations
            </p>
          </div>
        </div>

        {/* Total Received Big Badge */}
        <div className="sm:text-right bg-emerald-50/70 border border-emerald-200/80 px-4 py-2 rounded-xl">
          <span className="text-[11px] uppercase font-bold text-slate-500 block tracking-wider">
            Total Received (Selected Period)
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
            {formatINR(totalReceived)}
          </span>
        </div>
      </div>

      {/* 4 Category Breakdown Cards - Clean Minimal Styling (No top accent line) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
        {/* Token */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-amber-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Tokens Received
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FaCoins className="text-xs" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {formatINR(tokenAmount)}
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Booking commitments
            </p>
          </div>
        </div>

        {/* Advance */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Project Advances
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FaWallet className="text-xs" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono tracking-tight">
              {formatINR(advanceAmount)}
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Mobilization capital
            </p>
          </div>
        </div>

        {/* Milestone */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
              Milestone Inflows
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaReceipt className="text-xs" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-700 font-mono tracking-tight">
              {formatINR(milestoneAmount)}
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              WBS stage realizations
            </p>
          </div>
        </div>

        {/* Final Payment */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-purple-200 hover:shadow-2xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
              Final Handover
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaCheckDouble className="text-xs" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-purple-700 font-mono tracking-tight">
              {formatINR(finalAmount)}
            </div>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              Project closures
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Mode Breakdown Chart (7 cols) + Mode Details (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Payment Mode Bar Chart */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FaMoneyCheckAlt className="text-emerald-600 text-sm" />
              Realization by Payment Mode (₹ Lakhs)
            </span>
            <span className="text-xs text-slate-500 font-mono font-bold">{paymentCount} transactions</span>
          </div>

          <div className="h-[220px] w-full">
            {modeChart && modeChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="mode" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val, name, props) => [formatINR(props.payload.amount), "Received"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey="amountLakhs" radius={[5, 5, 0, 0]} maxBarSize={42}>
                    {modeChart.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={MODE_COLORS[idx % MODE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                No payment transactions recorded for selected period
              </div>
            )}
          </div>
        </div>

        {/* Payment Mode List Cards */}
        <div className="lg:col-span-5 bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
              <span className="text-sm font-bold text-slate-800">Payment Channels</span>
              <span className="text-xs text-slate-500">Mode Breakdown</span>
            </div>

            <div className="space-y-2 mt-2">
              {modeChart && modeChart.length > 0 ? (
                modeChart.map((m, idx) => (
                  <div
                    key={m.mode || idx}
                    className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: MODE_COLORS[idx % MODE_COLORS.length] }}
                      />
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{m.mode}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({m.count} txns)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-xs sm:text-sm">
                      {formatINR(m.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No payment data in this range
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-3 text-right">
            Verified across Passbook receipts &amp; accounts logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSnapshotSection;
