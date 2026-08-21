import React, { useState, useEffect, useRef } from "react";

const SalesHeader = ({
  department = "Sales Department",
  role = "Sales TL",
  unreadNotification = true,
  onLogout,
  toggleSidebar
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white font-sans antialiased h-13 px-3 sm:px-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-40">
      
      {/* Left Space: Mobile Menu Toggle */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer flex items-center justify-center"
          title="Toggle Navigation Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Right Action Icons (Notification + Profile) */}
      <div className="flex items-center gap-2.5 relative" ref={dropdownRef}>
        
        {/* 1. Notification Bell with Orange Dot */}
        <button
          type="button"
          className="relative w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          title="Notifications"
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          {/* Orange Badge Dot */}
          {unreadNotification && (
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white" />
          )}
        </button>

        {/* 2. Black User Profile Icon */}
        <button
          type="button"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          title="Profile"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </button>

        {/* 3. Profile Dropdown Box */}
        {isProfileOpen && (
          <div className="absolute right-0 top-11 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
            
            {/* User Info Header */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-slate-900">
                  {department}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {role}
                </div>
              </div>
            </div>

            {/* Logout Option */}
            <div className="pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg
                  className="w-3.5 h-3.5 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};

export default SalesHeader;