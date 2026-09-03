import React, { useState, useEffect, useRef } from "react";

// Helper to generate 5-minute time intervals for 24 hours
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const period = h >= 12 ? "PM" : "AM";
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      const displayMin = m.toString().padStart(2, "0");
      slots.push(`${displayHour}:${displayMin} ${period}`);
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DateTimePicker({
  dateValue = "",
  timeValue = "",
  onDateTimeChange,
  placeholder = "Select date and time (optional)"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const timeListRef = useRef(null);

  // Parse incoming date or default to current date
  const parseInitialDate = () => {
    if (dateValue) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  };

  const [currentMonthDate, setCurrentMonthDate] = useState(parseInitialDate);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (dateValue) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return null;
  });

  const [selectedTime, setSelectedTime] = useState(timeValue || "10:00 AM");

  // Keep internal state in sync with external props
  useEffect(() => {
    if (dateValue) {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        setSelectedDate(parsed);
        setCurrentMonthDate(parsed);
      }
    } else {
      setSelectedDate(null);
    }
  }, [dateValue]);

  useEffect(() => {
    if (timeValue) {
      setSelectedTime(timeValue);
    }
  }, [timeValue]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to selected time when dropdown opens
  useEffect(() => {
    if (isOpen && timeListRef.current) {
      const selectedIndex = TIME_SLOTS.findIndex(
        (t) => t.toLowerCase() === (selectedTime || "").toLowerCase()
      );
      if (selectedIndex !== -1) {
        const itemHeight = 32;
        timeListRef.current.scrollTop = Math.max(0, selectedIndex * itemHeight - 80);
      }
    }
  }, [isOpen, selectedTime]);

  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Build 42 calendar cells (6 weeks)
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      month: currentMonth - 1,
      year: currentYear,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarDays.push({
      day: d,
      month: currentMonth,
      year: currentYear,
      isCurrentMonth: true
    });
  }

  // Next month leading days (fill up to 35 or 42)
  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    calendarDays.push({
      day: d,
      month: currentMonth + 1,
      year: currentYear,
      isCurrentMonth: false
    });
  }

  const isDaySelected = (cell) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === cell.day &&
      selectedDate.getMonth() === cell.month &&
      selectedDate.getFullYear() === cell.year
    );
  };

  const handleSelectDay = (cell, e) => {
    e.stopPropagation();
    const newDate = new Date(cell.year, cell.month, cell.day);
    setSelectedDate(newDate);

    // Format YYYY-MM-DD
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, "0");
    const dd = String(newDate.getDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    onDateTimeChange?.({
      date: isoDate,
      time: selectedTime || "10:00 AM",
      rawDate: newDate
    });
  };

  const handleSelectTime = (t, e) => {
    e.stopPropagation();
    setSelectedTime(t);

    const baseDate = selectedDate || new Date();
    const yyyy = baseDate.getFullYear();
    const mm = String(baseDate.getMonth() + 1).padStart(2, "0");
    const dd = String(baseDate.getDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    if (!selectedDate) {
      setSelectedDate(baseDate);
    }

    onDateTimeChange?.({
      date: isoDate,
      time: t,
      rawDate: baseDate
    });
  };

  // Clear both date and time
  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
    setSelectedTime("");
    setIsOpen(false);
    
    onDateTimeChange?.({
      date: "",
      time: "",
      rawDate: null
    });
  };

  // Formatted display in input box
  const getDisplayText = () => {
    if (!selectedDate && !dateValue) return "";
    const d = selectedDate || (dateValue ? new Date(dateValue) : null);
    if (!d || isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}${selectedTime ? `   ${selectedTime}` : ""}`;
  };

  // Check if any value is selected
  const hasValue = selectedDate || dateValue;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Clickable input display */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white text-sm font-medium transition-all cursor-pointer shadow-2xs flex items-center justify-between ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-100"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <span className={getDisplayText() ? "text-slate-800 font-semibold" : "text-slate-400"}>
          {getDisplayText() || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {/* Clear Button - X icon */}
          {hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title="Clear date and time"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
          {/* Calendar Icon */}
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Popover Dropdown matching Screenshot 2 */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2.5 z-50 bg-white border border-slate-300/80 rounded-2xl shadow-2xl p-0 animate-in fade-in zoom-in-95 duration-100"
          style={{ width: "345px" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pointer Triangle Arrow at Top */}
          <div
            className="absolute -top-2 left-8 w-4 h-4 bg-slate-100 border-l border-t border-slate-300/80 rotate-45"
            style={{ zIndex: 1 }}
          />

          {/* Header Row: Month / Year on Left, 'Time' on Right */}
          <div className="flex items-center border-b border-slate-200 bg-slate-100/90 rounded-t-2xl relative z-10">
            {/* Left Header: Month Navigation */}
            <div className="flex-1 flex items-center justify-between px-3 py-2.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-xs font-bold"
                title="Previous Month"
              >
                &lt;
              </button>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-md transition-colors cursor-pointer text-xs font-bold"
                title="Next Month"
              >
                &gt;
              </button>
            </div>

            {/* Right Header: Time */}
            <div className="w-24 border-l border-slate-200 text-center py-2.5">
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">
                Time
              </span>
            </div>
          </div>

          {/* Body: Calendar on Left, Scrollable Time Column on Right */}
          <div className="flex relative z-10 bg-white rounded-b-2xl overflow-hidden">
            {/* Calendar Left Section */}
            <div className="flex-1 p-3">
              {/* Day Headers */}
              <div className="grid grid-cols-7 text-center mb-1.5">
                {DAY_NAMES.map((day) => (
                  <span
                    key={day}
                    className="text-xs font-bold text-slate-700 py-1"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Cells (7 x 6) */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((cell, idx) => {
                  const selected = isDaySelected(cell);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectDay(cell, e)}
                      className={`h-7 w-7 mx-auto flex items-center justify-center text-xs transition-all cursor-pointer ${
                        selected
                          ? "bg-sky-200 text-slate-900 font-extrabold rounded-lg shadow-2xs"
                          : cell.isCurrentMonth
                          ? "text-slate-800 font-medium hover:bg-slate-100 rounded-lg"
                          : "text-slate-300 font-normal hover:bg-slate-50 rounded-lg"
                      }`}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Right Section */}
            <div className="w-24 border-l border-slate-200 flex flex-col bg-slate-50/50">
              <div
                ref={timeListRef}
                className="h-[210px] overflow-y-auto py-1 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
              >
                {TIME_SLOTS.map((t) => {
                  const isSelected =
                    (selectedTime || "").toLowerCase() === t.toLowerCase();
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={(e) => handleSelectTime(t, e)}
                      className={`w-full text-center py-1.5 px-1 text-xs font-semibold transition-colors cursor-pointer block ${
                        isSelected
                          ? "bg-sky-200 text-slate-900 font-extrabold"
                          : "text-slate-700 hover:bg-slate-200/70"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}