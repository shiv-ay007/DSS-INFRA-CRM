import React, { useRef } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaThumbsUp,
  FaChartLine,
  FaMoneyBillWave,
  FaCoins,
  FaGift,
  FaPiggyBank,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

const LeadKpiSlider = ({ stats }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const cardsData = [
    {
      id: "total",
      label: "Total Leads",
      value: stats.total,
      icon: <FaUsers className="w-4 h-4 text-blue-600" />,
      iconBg: "bg-blue-100/90 text-blue-600",
      cardGradient: "from-blue-50/90 via-indigo-50/30 to-white",
      borderColor: "border-blue-200/90",
      textColor: "text-blue-900"
    },
    {
      id: "fresh",
      label: "Fresh Leads",
      value: stats.fresh,
      icon: <FaUserPlus className="w-4 h-4 text-indigo-600" />,
      iconBg: "bg-indigo-100/90 text-indigo-600",
      cardGradient: "from-indigo-50/90 via-blue-50/30 to-white",
      borderColor: "border-indigo-200/90",
      textColor: "text-indigo-900"
    },
    {
      id: "converted",
      label: "Converted Leads",
      value: stats.converted,
      icon: <FaCheckCircle className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-100/90 text-emerald-600",
      cardGradient: "from-emerald-50/90 via-teal-50/30 to-white",
      borderColor: "border-emerald-200/90",
      textColor: "text-emerald-900"
    },
    {
      id: "interested",
      label: "Interested Leads",
      value: stats.interested,
      icon: <FaThumbsUp className="w-4 h-4 text-amber-600" />,
      iconBg: "bg-amber-100/90 text-amber-600",
      cardGradient: "from-amber-50/90 via-yellow-50/30 to-white",
      borderColor: "border-amber-200/90",
      textColor: "text-amber-900"
    },
    {
      id: "conversionRate",
      label: "Conversion Rate",
      value: stats.conversionRate,
      icon: <FaChartLine className="w-4 h-4 text-cyan-600" />,
      iconBg: "bg-cyan-100/90 text-cyan-600",
      cardGradient: "from-cyan-50/90 via-sky-50/30 to-white",
      borderColor: "border-cyan-200/90",
      textColor: "text-cyan-900"
    },
    {
      id: "totalRevenue",
      label: "Total Revenue",
      value: stats.totalRevenue,
      icon: <FaMoneyBillWave className="w-4 h-4 text-emerald-700" />,
      iconBg: "bg-emerald-100/90 text-emerald-700",
      cardGradient: "from-emerald-50/90 via-teal-50/40 to-white",
      borderColor: "border-emerald-300/90",
      textColor: "text-emerald-950"
    },
    {
      id: "expectedRevenue",
      label: "Expected Revenue",
      value: stats.expectedRevenue,
      icon: <FaCoins className="w-4 h-4 text-rose-600" />,
      iconBg: "bg-rose-100/90 text-rose-600",
      cardGradient: "from-rose-50/90 via-pink-50/30 to-white",
      borderColor: "border-rose-200/90",
      textColor: "text-rose-900"
    },
    {
      id: "totalIncentives",
      label: "Total Incentives",
      value: stats.totalIncentives,
      icon: <FaGift className="w-4 h-4 text-teal-600" />,
      iconBg: "bg-teal-100/90 text-teal-600",
      cardGradient: "from-teal-50/90 via-emerald-50/30 to-white",
      borderColor: "border-teal-200/90",
      textColor: "text-teal-900"
    },
    {
      id: "expectedIncentives",
      label: "Expect. Incentive",
      value: stats.expectedIncentives,
      icon: <FaPiggyBank className="w-4 h-4 text-purple-600" />,
      iconBg: "bg-purple-100/90 text-purple-600",
      cardGradient: "from-purple-50/90 via-fuchsia-50/30 to-white",
      borderColor: "border-purple-200/90",
      textColor: "text-purple-900"
    }
  ];

  return (
    <div className="relative group w-full">
      {/* LEFT SCROLL BUTTON */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:bg-white hover:text-black border border-slate-300 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
        title="Slide Left"
      >
        <FaChevronLeft className="text-xs" />
      </button>

      {/* HORIZONTAL SLIDER CONTAINER */}
      <div
        ref={scrollRef}
        className="flex items-center gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cardsData.map((card) => (
          <div
            key={card.id}
            className={`w-[210px] min-w-[210px] h-[105px] shrink-0 p-3.5 rounded-2xl bg-gradient-to-br ${card.cardGradient} border ${card.borderColor} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-extrabold uppercase tracking-wider ${card.textColor}`}>
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs`}>
                {card.icon}
              </div>
            </div>

            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT SCROLL BUTTON */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:bg-white hover:text-black border border-slate-300 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-80 hover:opacity-100 hover:scale-105 active:scale-95"
        title="Slide Right"
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
};

export default LeadKpiSlider;
