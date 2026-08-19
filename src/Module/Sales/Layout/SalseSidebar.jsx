import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import salesLogo from "../../../assets/SalesLogo.png";

// Menus with distinct color themes for icons
const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/sales/dashboard",
    activeGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30",
    iconColor: "text-blue-400 group-hover:text-blue-300",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    id: "add_lead",
    label: "Add Lead",
    path: "/sales/leads/add",
    activeGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30",
    iconColor: "text-emerald-400 group-hover:text-emerald-300",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7h6m-3-3v6" />
      </svg>
    )
  },
  {
    id: "lead_management",
    label: "Lead Management",
    activeGradient: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30",
    iconColor: "text-amber-400 group-hover:text-amber-300",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { id: "total_leads", label: "Total Leads", path: "/sales/leads/total", badge: "All" },
      { id: "assigned_leads", label: "Assigned Leads", path: "/sales/leads/assigned", badge: "Active" },
      { id: "lost_leads", label: "Lost Leads", path: "/sales/leads/lost", badge: "Lost" },
      { id: "followup", label: "Followup", path: "/sales/leads/followup", badge: "Calls" },
      { id: "lead_management_all", label: "Lead Management", path: "/sales/leads/all", badge: "Sheet" }
    ]
  },
  {
    id: "sales_sheet",
    label: "Sales Management Sheet",
    path: "/sales/management-sheet",
    activeGradient: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30",
    iconColor: "text-purple-400 group-hover:text-purple-300",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
];

const SalseSidebar = ({ isOpen = true, setIsOpen }) => {
  const [internalOpen, setInternalOpen] = useState(true);
  const isSidebarOpen = setIsOpen !== undefined ? isOpen : internalOpen;
  const toggle = () => (setIsOpen ? setIsOpen(!isOpen) : setInternalOpen(!internalOpen));

  const location = useLocation();

  // Active check only for Lead Management sub-items
  const isLeadSubActive = [
    "/sales/leads/total",
    "/sales/leads/assigned",
    "/sales/leads/lost",
    "/sales/leads/followup",
    "/sales/leads/all"
  ].includes(location.pathname);

  // Auto expand when active sub-route is visited
  const [isLeadOpen, setIsLeadOpen] = useState(isLeadSubActive);

  useEffect(() => {
    if (isLeadSubActive) {
      setIsLeadOpen(true);
    }
  }, [isLeadSubActive]);

  return (
    <aside
      className={`h-screen bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none sticky top-0 z-50 overflow-x-hidden border-r border-slate-800/80 shadow-xl ${
        isSidebarOpen ? "w-64 sm:w-72" : "w-20"
      }`}
    >
      {/* ================= TOP HEADER (LOGO & HAMBURGER) ================= */}
      <div
        className={`h-16 flex items-center border-b border-slate-800/80 shrink-0 px-3.5 bg-slate-950/60 backdrop-blur-xs ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        {/* LOGO (Only when expanded) */}
        {isSidebarOpen && (
          <div className="bg-white px-2.5 py-1 rounded-xl flex items-center justify-center shrink-0 border border-white shadow-xs max-w-[170px] h-10">
            <img
              src={salesLogo}
              alt="DSS Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        )}

        {/* HAMBURGER BUTTON (☰) */}
        <button
          type="button"
          onClick={toggle}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ================= NAVIGATION MENU ================= */}
      <nav className="flex-1 overflow-y-auto py-3.5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        
        {/* 1. Dashboard */}
        <div className="relative group">
          <NavLink
            to="/sales/dashboard"
            className={({ isActive }) =>
              `w-full flex items-center transition-all duration-200 cursor-pointer ${
                isSidebarOpen ? "px-3.5 py-2.5 rounded-xl gap-3.5" : "p-3 rounded-xl justify-center"
              } ${
                isActive
                  ? menuItems[0].activeGradient + " font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? "text-white" : menuItems[0].iconColor}>
                  {menuItems[0].icon}
                </div>
                {isSidebarOpen && (
                  <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
                    Dashboard
                  </span>
                )}
              </>
            )}
          </NavLink>
          {!isSidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              Dashboard
            </div>
          )}
        </div>

        {/* 2. Add Lead */}
        <div className="relative group">
          <NavLink
            to="/sales/leads/add"
            className={({ isActive }) =>
              `w-full flex items-center transition-all duration-200 cursor-pointer ${
                isSidebarOpen ? "px-3.5 py-2.5 rounded-xl gap-3.5" : "p-3 rounded-xl justify-center"
              } ${
                isActive
                  ? menuItems[1].activeGradient + " font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? "text-white" : menuItems[1].iconColor}>
                  {menuItems[1].icon}
                </div>
                {isSidebarOpen && (
                  <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
                    Add Lead
                  </span>
                )}
              </>
            )}
          </NavLink>
          {!isSidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              Add Lead
            </div>
          )}
        </div>

        {/* 3. Lead Management */}
        <div className="relative group">
          <button
            type="button"
            onClick={() => {
              if (!isSidebarOpen) {
                if (setIsOpen) setIsOpen(true);
                else setInternalOpen(true);
              }
              setIsLeadOpen(!isLeadOpen);
            }}
            className={`w-full flex items-center transition-all duration-200 cursor-pointer ${
              isSidebarOpen ? "px-3.5 py-2.5 rounded-xl justify-between" : "p-3 rounded-xl justify-center"
            } ${
              isLeadSubActive && !isLeadOpen
                ? menuItems[2].activeGradient + " font-bold"
                : isLeadSubActive
                ? "bg-slate-800/90 text-white font-bold"
                : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={isLeadSubActive ? "text-amber-400" : menuItems[2].iconColor}>
                {menuItems[2].icon}
              </div>
              {isSidebarOpen && (
                <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
                  Lead Management
                </span>
              )}
            </div>

            {/* Chevron Arrow */}
            {isSidebarOpen && (
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                  isLeadOpen ? "rotate-0 text-amber-400" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>

          {!isSidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              Lead Management
            </div>
          )}

          {/* Sub-items with colorful highlights */}
          {isSidebarOpen && isLeadOpen && (
            <div className="mt-1.5 ml-4 pl-3 border-l-2 border-slate-800 space-y-1 py-1">
              {menuItems[2].subItems.map((sub) => (
                <NavLink
                  key={sub.id}
                  to={sub.path}
                  className={({ isActive }) =>
                    `w-full text-left py-2 px-3 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer flex items-center justify-between truncate ${
                      isActive
                        ? "text-emerald-300 font-bold bg-emerald-950/50 border border-emerald-800/60 shadow-xs"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2 truncate">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                        <span className="truncate">{sub.label}</span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* 4. Sales Management Sheet */}
        <div className="relative group">
          <NavLink
            to="/sales/management-sheet"
            className={({ isActive }) =>
              `w-full flex items-center transition-all duration-200 cursor-pointer ${
                isSidebarOpen ? "px-3.5 py-2.5 rounded-xl gap-3.5" : "p-3 rounded-xl justify-center"
              } ${
                isActive
                  ? menuItems[3].activeGradient + " font-bold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={isActive ? "text-white" : menuItems[3].iconColor}>
                  {menuItems[3].icon}
                </div>
                {isSidebarOpen && (
                  <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
                    Sales Management Sheet
                  </span>
                )}
              </>
            )}
          </NavLink>
          {!isSidebarOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-2xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
              Sales Management Sheet
            </div>
          )}
        </div>

      </nav>
    </aside>
  );
};

export default SalseSidebar;