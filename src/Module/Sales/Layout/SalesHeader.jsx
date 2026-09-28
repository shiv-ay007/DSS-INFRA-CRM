import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  getNotificationsApi,
  getUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi
} from "../services/notification.api";

// Helper for relative time display
const formatTimeAgo = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

const SalesHeader = ({
  department = "Sales Department",
  onLogout,
  toggleSidebar
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"
  const [isLoading, setIsLoading] = useState(false);

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  const { user, role, logout } = useAuth();

  // Fetch unread count & notifications
  const loadNotifications = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const res = await getNotificationsApi({ limit: 30 });
      if (res?.success && res?.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const res = await getUnreadCountApi();
      if (res?.success && res?.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // silent
    }
  }, []);

  // Poll count every 30s and load on mount + instant refresh on lead events
  useEffect(() => {
    loadNotifications(false);

    // 1. Regular 30s interval
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    // 2. Instant refresh when a lead is added, marked interested, or followup is updated
    const handleLeadUpdatedEvent = () => {
      loadNotifications(false);
      loadUnreadCount();
    };
    window.addEventListener("dss_leads_updated", handleLeadUpdatedEvent);

    // 3. Instant refresh when user switches back to this browser tab
    window.addEventListener("focus", handleLeadUpdatedEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("dss_leads_updated", handleLeadUpdatedEvent);
      window.removeEventListener("focus", handleLeadUpdatedEvent);
    };
  }, [loadNotifications, loadUnreadCount]);

  // When opening dropdown, reload notifications
  const handleToggleNotif = () => {
    setIsProfileOpen(false);
    if (!isNotifOpen) {
      loadNotifications(true);
    }
    setIsNotifOpen((prev) => !prev);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setIsProfileOpen(false);
      }
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target)
      ) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single notification as read & navigate to target page
  const handleNotificationClick = async (notif) => {
    // 1. Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) =>
        item._id === notif._id ? { ...item, isRead: true } : item
      )
    );
    if (!notif.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      markNotificationReadApi(notif._id).catch(() => {});
    }

    // 2. Close popover
    setIsNotifOpen(false);

    // 3. Smart redirection to correct Lead Details page
    const targetLeadId = notif.leadId || notif.metadata?.leadId;
    if (targetLeadId) {
      navigate(`/sales/leads/details/${targetLeadId}`, {
        state: { from: "leadManagement" }
      });
    } else if (notif.link) {
      // Normalize link (in case backend sent /sales/lead-details/...)
      const cleanLink = notif.link.replace("/sales/lead-details/", "/sales/leads/details/");
      navigate(cleanLink, {
        state: { from: "leadManagement" }
      });
    } else {
      navigate("/sales/leads/all");
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsReadApi();
      toast.success("All notifications marked as read", { autoClose: 1500 });
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((item) => item._id !== id));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    try {
      await deleteNotificationApi(id);
    } catch (err) {
      console.error("Delete notification failed:", err);
    }
  };

  // Filtered list
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.isRead;
    return true;
  });

  const userName = user?.name || user?.username || "";
  const userRoleDisplay = role || user?.role || "";

  // Handle Logout
  const handleLogout = async () => {
    setIsProfileOpen(false);
    try {
      await logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
    toast.info("Logged out successfully! See you soon 👋", {
      position: "top-right",
      autoClose: 2000
    });
    navigate("/sales/login", { replace: true });
    if (onLogout) onLogout();
  };

  // Icon selector based on notification type
  const renderNotificationIcon = (type, priority) => {
    if (type === "FOLLOWUP_OVERDUE") {
      return (
        <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100/80 flex items-center justify-center text-rose-600 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      );
    }
    if (type === "FOLLOWUP_DUE") {
      return (
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100/80 flex items-center justify-center text-amber-600 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    }
    if (type === "NEW_LEAD") {
      return (
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/80 flex items-center justify-center text-blue-600 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
      );
    }
    // Default / Stage Update
    return (
      <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-600 shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  return (
    <header className="w-full bg-white font-sans antialiased h-14 px-3 sm:px-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-[60]">
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
      <div className="flex items-center gap-2 sm:gap-2.5">
        
        {/* ============================================================== */}
        {/* 1. NOTIFICATION BELL & DROPDOWN CONTAINER */}
        {/* ============================================================== */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            type="button"
            onClick={handleToggleNotif}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isNotifOpen
                ? "bg-slate-200 text-slate-900 shadow-inner"
                : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
            }`}
            title="Notifications"
          >
            <svg
              className="w-4 h-4 transition-transform duration-200"
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

            {/* Dynamic Unread Badge Pill / Dot */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[9.5px] font-bold flex items-center justify-center shadow-xs ring-2 ring-white animate-in zoom-in">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Premium Minimalistic Notification Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 sm:right-[-30px] top-11 w-[320px] sm:w-[380px] bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-900/10 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 tracking-tight">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-orange-100 text-orange-700 rounded-md">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Minimal Filter Tabs */}
              <div className="flex items-center gap-1 px-3 pt-2.5 pb-1.5 bg-white border-b border-slate-50">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === "unread"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification List Container */}
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50 overscroll-contain">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-xs font-medium">Loading notifications...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="py-12 px-4 flex flex-col items-center justify-center text-center gap-2 text-slate-400">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">No notifications</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {activeTab === "unread" ? "You've read all your notifications!" : "You're all caught up! ✨"}
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`group relative p-3 sm:p-3.5 flex items-start gap-3 cursor-pointer transition-all hover:bg-slate-50/80 ${
                        !notif.isRead ? "bg-blue-50/30" : "bg-white"
                      }`}
                    >
                      {/* Left Type Icon */}
                      {renderNotificationIcon(notif.type, notif.priority)}

                      {/* Content Body */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4
                            className={`text-xs truncate ${
                              !notif.isRead
                                ? "font-bold text-slate-900"
                                : "font-semibold text-slate-700"
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>

                        {/* Redirect Hint */}
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-blue-600 group-hover:translate-x-0.5 transition-transform">
                          <span>View Details</span>
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Right Indicator (Unread dot or delete icon on hover) */}
                      <div className="absolute right-2.5 top-3 flex items-center gap-1">
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-blue-100 group-hover:hidden" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotification(e, notif._id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Minimal Footer */}
              <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-[11px] text-slate-500">
                <span className="text-[10px] text-slate-400">Live reminders active</span>
                <button
                  type="button"
                  onClick={() => loadNotifications(true)}
                  className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>

            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 2. USER PROFILE ICON & DROPDOWN CONTAINER */}
        {/* ============================================================== */}
        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(false);
              setIsProfileOpen(!isProfileOpen);
            }}
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

          {/* Profile Dropdown Box */}
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
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                    {userName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {userRoleDisplay}
                  </div>
                </div>
              </div>

              {/* Logout Option */}
              <div className="pt-1.5">
                <button
                  type="button"
                  onClick={handleLogout}
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

      </div>
    </header>
  );
};

export default SalesHeader;