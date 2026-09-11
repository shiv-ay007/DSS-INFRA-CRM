import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import salesLogo from "../../../assets/SalesLogo.png";
import { useAuth } from "../../../context/AuthContext";
import { FaWpforms, FaBoxes, FaHardHat } from "react-icons/fa";
import { HiOutlineTemplate } from "react-icons/hi";

// 1. Worker (Admin / Staff) Menu Items - Has "Add Lead"
const workerMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/sales/dashboard",
    activeGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30",
    iconColor: "text-blue-400 group-hover:text-blue-300",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
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
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
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
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { id: "total_leads", label: "Total Leads", path: "/sales/leads/total", badge: "All" },
      { id: "lost_leads", label: "Lost Leads", path: "/sales/leads/lost", badge: "Lost" },
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
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: "presales",
    label: "Presales",
    path: "/sales/presales",
    activeGradient: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30",
    iconColor: "text-teal-400 group-hover:text-teal-300",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: "master_form",
    label: "MasterForm",
    activeGradient: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30",
    iconColor: "text-violet-400 group-hover:text-violet-300",
    icon: <FaWpforms className="w-4 h-4 shrink-0" />,
    subItems: [
      { 
        id: "pms_template", 
        label: "PMS Template", 
        path: "/sales/master/pms-template", 
        badge: "PMS",
        icon: <HiOutlineTemplate className="w-3.5 h-3.5 text-cyan-400" />,
        badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      },
      { 
        id: "material", 
        label: "Material", 
        path: "/sales/master/material", 
        badge: "Items",
        icon: <FaBoxes className="w-3.5 h-3.5 text-emerald-400" />,
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      },
      { 
        id: "suplire_contractor", 
        label: "Suplire and Contractor", 
        path: "/sales/master/suplire-and-contractor", 
        badge: "Vendors",
        icon: <FaHardHat className="w-3.5 h-3.5 text-amber-400" />,
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      }
    ]
  }
];

// 2. Observer Menu Items - View Only (No "Add Lead")
const observerMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/sales/dashboard",
    activeGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30",
    iconColor: "text-blue-400 group-hover:text-blue-300",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    id: "lead_management",
    label: "Lead Management",
    activeGradient: "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30",
    iconColor: "text-amber-400 group-hover:text-amber-300",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    subItems: [
      { id: "total_leads", label: "Total Leads", path: "/sales/leads/total", badge: "All" },
      { id: "lost_leads", label: "Lost Leads", path: "/sales/leads/lost", badge: "Lost" },
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
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 4h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: "presales",
    label: "Presalse",
    path: "/sales/presales",
    activeGradient: "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-600/30",
    iconColor: "text-teal-400 group-hover:text-teal-300",
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    id: "master_form",
    label: "MasterForm",
    activeGradient: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-600/30",
    iconColor: "text-violet-400 group-hover:text-violet-300",
    icon: <FaWpforms className="w-4 h-4 shrink-0" />,
    subItems: [
      { 
        id: "pms_template", 
        label: "PMS Template", 
        path: "/sales/master/pms-template", 
        badge: "PMS",
        icon: <HiOutlineTemplate className="w-3.5 h-3.5 text-cyan-400" />,
        badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      },
      { 
        id: "material", 
        label: "Material", 
        path: "/sales/master/material", 
        badge: "Items",
        icon: <FaBoxes className="w-3.5 h-3.5 text-emerald-400" />,
        badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      },
      { 
        id: "suplire_contractor", 
        label: "Suplire and Contractor", 
        path: "/sales/master/suplire-and-contractor", 
        badge: "Vendors",
        icon: <FaHardHat className="w-3.5 h-3.5 text-amber-400" />,
        badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/30"
      }
    ]
  }
];

const SalseSidebar = ({ isOpen = true, setIsOpen }) => {
  const [internalOpen, setInternalOpen] = useState(true);
  const isSidebarOpen = setIsOpen !== undefined ? isOpen : internalOpen;
  const toggle = () => (setIsOpen ? setIsOpen(!isOpen) : setInternalOpen(!internalOpen));

  const location = useLocation();

  // Role detection from AuthContext (Worker vs Observer)
  const { user, role, isObserver } = useAuth();
  const currentRole = role || user?.role || "";
  const isUserObserver = isObserver || String(currentRole).toLowerCase() === "observer";

  // Dynamic menu list based on role
  const activeMenuList = isUserObserver ? observerMenuItems : workerMenuItems;

  // Check if any sub-item in this item is currently active
  const isSubActive = (subItems = []) =>
    subItems.some((sub) => location.pathname === sub.path || location.pathname.startsWith(sub.path + "/"));

  // Track expanded state for any sub-item dropdowns
  const [openSubMenus, setOpenSubMenus] = useState(() => {
    const initial = {};
    [...workerMenuItems, ...observerMenuItems].forEach(item => {
      if (item.subItems) {
        initial[item.id] = isSubActive(item.subItems);
      }
    });
    return initial;
  });

  // Auto expand when active sub-route is visited
  useEffect(() => {
    activeMenuList.forEach(item => {
      if (item.subItems && isSubActive(item.subItems)) {
        setOpenSubMenus(prev => ({ ...prev, [item.id]: true }));
      }
    });
  }, [location.pathname]);

  return (
    <aside
      className={`h-screen bg-[#0F172A] text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none sticky top-0 z-50 overflow-x-hidden border-r border-slate-800/80 shadow-xl max-lg:fixed max-lg:inset-y-0 max-lg:left-0 ${
        isSidebarOpen
          ? "w-60 sm:w-64 max-lg:translate-x-0"
          : "max-lg:-translate-x-full lg:w-16"
      }`}
    >
      {/* ================= TOP HEADER (LOGO & HAMBURGER) ================= */}
      <div
        className={`h-14 flex items-center border-b border-slate-800/80 shrink-0 px-3 bg-slate-950/60 backdrop-blur-xs ${
          isSidebarOpen ? "justify-between" : "justify-center"
        }`}
      >
        {/* LOGO (Only when expanded) */}
        {isSidebarOpen && (
          <div className="bg-white px-3 py-1 flex items-center justify-center shrink-0 border border-white shadow-xs max-w-[165px] h-10">
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
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/90 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* ================= NAVIGATION MENU (Rendered via .map()) ================= */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {activeMenuList.map((item) => {
          const hasSubItems = Array.isArray(item.subItems) && item.subItems.length > 0;

          // If item has dropdown sub-items (e.g. Lead Management, MasterForm)
          if (hasSubItems) {
            const isDropdownActive = isSubActive(item.subItems);
            const isDropdownOpen = !!openSubMenus[item.id];

            return (
              <div key={item.id} className="relative group">
                <button
                  type="button"
                  onClick={() => {
                    if (!isSidebarOpen) {
                      if (setIsOpen) setIsOpen(true);
                      else setInternalOpen(true);
                    }
                    setOpenSubMenus(prev => ({
                      ...prev,
                      [item.id]: !prev[item.id]
                    }));
                  }}
                  className={`w-full flex items-center transition-all duration-200 cursor-pointer ${
                    isSidebarOpen ? "px-3 py-2 rounded-lg justify-between" : "p-2 rounded-lg justify-center"
                  } ${
                    isDropdownActive && !isDropdownOpen
                      ? item.activeGradient + " font-bold"
                      : isDropdownActive
                      ? "bg-slate-800/90 text-white font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={isDropdownActive ? "text-amber-400" : item.iconColor}>
                      {item.icon}
                    </div>
                    {isSidebarOpen && (
                      <span className="text-xs sm:text-sm font-semibold tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </div>

                  {/* Chevron Arrow */}
                  {isSidebarOpen && (
                    <svg
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
                        isDropdownOpen ? "rotate-0 text-amber-400" : "rotate-180"
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

                {/* Collapsed Tooltip */}
                {!isSidebarOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                    {item.label}
                  </div>
                )}

                {/* Sub-items list */}
                {isSidebarOpen && isDropdownOpen && (
                  <div className="mt-1 ml-3 pl-2 border-l border-slate-800 space-y-0.5 py-0.5">
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.id}
                        to={sub.path}
                        className={({ isActive }) =>
                          `w-full text-left py-1.5 px-2.5 rounded-lg text-xs transition-all duration-150 cursor-pointer flex items-center justify-between truncate ${
                            isActive
                              ? "text-emerald-300 font-bold bg-emerald-950/50 border border-emerald-800/60 shadow-xs"
                              : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 font-medium"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center gap-2 truncate">
                              {sub.icon ? (
                                <span className="shrink-0">{sub.icon}</span>
                              ) : (
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                              )}
                              <span className="truncate">{sub.label}</span>
                            </div>
                            {sub.badge && (
                              <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                isActive
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                  : sub.badgeStyle || "bg-slate-800 text-slate-400 border-slate-700"
                              }`}>
                                {sub.badge}
                              </span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // Single Direct NavLink Item
          return (
            <div key={item.id} className="relative group">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center transition-all duration-200 cursor-pointer ${
                    isSidebarOpen ? "px-3 py-2 rounded-lg gap-2.5" : "p-2 rounded-lg justify-center"
                  } ${
                    isActive
                      ? item.activeGradient + " font-bold"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={isActive ? "text-white" : item.iconColor}>
                      {item.icon}
                    </div>
                    {isSidebarOpen && (
                      <span className="text-xs sm:text-sm font-semibold tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </NavLink>

              {/* Collapsed Tooltip */}
              {!isSidebarOpen && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default SalseSidebar;