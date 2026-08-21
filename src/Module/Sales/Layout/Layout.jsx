import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import SalesHeader from './SalesHeader'
import SalseSidebar from './SalseSidebar'
import SalseFooter from './SalseFooter'

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* 1. Left Sidebar */}
      <SalseSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 2. Right Side Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Fixed Header with Mobile Hamburger Toggle */}
        <SalesHeader toggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Dynamic Page Content (Scrollable Middle Section) */}
        <main className="flex-1 p-2.5 sm:p-4 overflow-y-auto scroll-smooth">
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
          className="fixed bottom-5 right-5 z-50 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1 border border-white/20"
          title="Slide to Top"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          <span className="text-[11px] font-bold hidden sm:inline-block pr-0.5">Top</span>
        </button>
      )}
    </div>
  )
}

export default Layout