import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaThumbsUp,
  FaChartLine,
  FaMoneyBillWave,
  FaCoins,
  FaGift,
  FaFire,
  FaClock,
  FaPaperPlane,
  FaComments,
  FaSun,
  FaSnowflake
} from "react-icons/fa";

const LeadKpiSlider = ({ stats }) => {
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

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
      id: "hot",
      label: "Hot Leads",
      value: stats.hot,
      icon: <FaFire className="w-4 h-4 text-rose-600" />,
      iconBg: "bg-rose-100/90 text-rose-600",
      cardGradient: "from-rose-50/90 via-red-50/30 to-white",
      borderColor: "border-rose-200/90",
      textColor: "text-rose-900"
    },
    {
      id: "warm",
      label: "Warm Leads",
      value: stats.warm,
      icon: <FaSun className="w-4 h-4 text-amber-600" />,
      iconBg: "bg-amber-100/90 text-amber-600",
      cardGradient: "from-amber-50/90 via-orange-50/30 to-white",
      borderColor: "border-amber-200/90",
      textColor: "text-amber-900"
    },
    {
      id: "cold",
      label: "Cold Leads",
      value: stats.cold,
      icon: <FaSnowflake className="w-4 h-4 text-sky-600" />,
      iconBg: "bg-sky-100/90 text-sky-600",
      cardGradient: "from-sky-50/90 via-blue-50/30 to-white",
      borderColor: "border-sky-200/90",
      textColor: "text-sky-900"
    },
    {
      id: "readyForSales",
      label: "Ready for Sales",
      value: stats.readyForSales,
      icon: <FaPaperPlane className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-100/90 text-emerald-600",
      cardGradient: "from-emerald-50/90 via-teal-50/30 to-white",
      borderColor: "border-emerald-200/90",
      textColor: "text-emerald-900"
    },
    {
      id: "inDiscussion",
      label: "In Discussion",
      value: stats.inDiscussion,
      icon: <FaComments className="w-4 h-4 text-purple-600" />,
      iconBg: "bg-purple-100/90 text-purple-600",
      cardGradient: "from-purple-50/90 via-fuchsia-50/30 to-white",
      borderColor: "border-purple-200/90",
      textColor: "text-purple-900"
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
    }
  ];

  // Helper to check if a value is 0 or empty
  const isZeroValue = (val, cardId) => {
    if (val === undefined || val === null) return true;
    // Essential priority cards stay visible if explicitly provided in stats
    if (["total", "fresh", "hot", "warm", "cold", "readyForSales", "inDiscussion", "expectedRevenue"].includes(cardId)) {
      return false;
    }
    const str = String(val).trim();
    if (str === "0" || str === "0.0%" || str === "0%" || str === "0.0") return true;
    const clean = str.replace(/[₹,\sLakhsL%]/gi, "");
    if (clean === "" || clean === "0" || clean === "0.00" || Number(clean) === 0) return true;
    return false;
  };

  const visibleCards = cardsData.filter((card) => !isZeroValue(card.value, card.id));

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 5) {
        setCanScroll(true);
        setScrollProgress((scrollLeft / maxScroll) * 100);
      } else {
        setCanScroll(false);
        setScrollProgress(0);
      }
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [visibleCards.length, checkScroll]);

  return (
    <div className="relative group/slider w-full">
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto pb-1 scroll-smooth snap-x select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {visibleCards.map((card) => (
          <div
            key={card.id}
            className={`min-w-[170px] sm:min-w-[210px] md:min-w-[230px] flex-1 p-3.5 rounded-2xl bg-gradient-to-br ${card.cardGradient} border ${card.borderColor} shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between shrink-0 snap-start`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-700">
                {card.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center shadow-2xs`}>
                {card.icon}
              </div>
            </div>

            <div className={`text-xl sm:text-2xl font-black ${card.textColor} tracking-tight font-mono`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {canScroll && (
        <div className="w-full bg-slate-200/70 h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-slate-400/80 rounded-full transition-all duration-150"
            style={{ width: `${Math.max(15, scrollProgress)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default LeadKpiSlider;
