import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCheckCircle,
  FaThumbsUp,
  FaChartLine,
  FaMoneyBillWave,
  FaCoins,
  FaGift
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
  const isZeroValue = (val) => {
    if (val === undefined || val === null) return true;
    const str = String(val).trim();
    if (str === "0" || str === "0.0%" || str === "0%" || str === "0.0") return true;
    const clean = str.replace(/[₹,\sLakhsL%]/gi, "");
    if (clean === "" || clean === "0" || clean === "0.00" || Number(clean) === 0) return true;
    return false;
  };

  const visibleCards = cardsData.filter((card) => !isZeroValue(card.value));

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll > 5) {
        setCanScroll(true);
        setScrollProgress((scrollLeft / maxScroll) * 100);
      } else {
        setCanScroll(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkScroll);
    };
  }, [visibleCards.length, checkScroll]);

  const handleScroll = () => {
    checkScroll();
  };

  const handleRangeChange = (e) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScroll = scrollWidth - clientWidth;
      scrollRef.current.scrollLeft = (val / 100) * maxScroll;
    }
  };

  if (visibleCards.length === 0) return null;

  return (
    <div className="relative w-full space-y-2">
      {/* HORIZONTAL SLIDER CONTAINER */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex items-center gap-3.5 overflow-x-auto scroll-smooth py-1 px-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-100 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 #F1F5F9" }}
      >
        {visibleCards.map((card) => (
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

      {/* BOTTOM SLIDER OPTION */}
      {canScroll && (
        <div className="flex items-center justify-center gap-2 pt-0.5">
          <input
            type="range"
            min="0"
            max="100"
            value={scrollProgress}
            onChange={handleRangeChange}
            className="w-48 sm:w-64 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF5722] hover:accent-[#E64A19] transition-all"
            title="Slide to scroll cards"
          />
        </div>
      )}
    </div>
  );
};

export default LeadKpiSlider;
