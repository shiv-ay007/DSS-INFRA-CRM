import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SalesHeader from './SalesHeader'
import SalseSidebar from './SalseSidebar'
import SalseFooter from './SalseFooter'

const Layout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector('main');
      const scrolled = window.scrollY > 150 || (mainEl && mainEl.scrollTop > 150);
      setShowScrollTop(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const slideToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="h-screen bg-slate-100 flex w-full relative overflow-hidden">
      {/* 1. Fixed Left Sidebar */}
      <SalseSidebar />

      {/* 2. Right Side Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Fixed Header */}
        <SalesHeader />

        {/* Dynamic Page Content (Scrollable Middle Section) */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto scroll-smooth">
          <Outlet />
        </main>

        {/* Bottom Fixed Footer */}
        <SalseFooter />
      </div>

      {/* Floating Slide to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={slideToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5 group border border-white/20 animate-in fade-in zoom-in-90"
          title="Slide to Top"
        >
          <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-xs font-bold hidden sm:inline-block pr-1">Top</span>
        </button>
      )}
    </div>
  )
}

export default Layout