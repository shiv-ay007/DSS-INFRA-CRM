import React from 'react'
import { Outlet } from 'react-router-dom'
import SalesHeader from './SalesHeader'
import SalseSidebar from './SalseSidebar'
import SalseFooter from './SalseFooter'

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex w-full">
      {/* 1. Fixed Left Sidebar */}
      <SalseSidebar />

      {/* 2. Right Side Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <SalesHeader />

        {/* Dynamic Page Content via Outlet */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom Footer */}
        <SalseFooter />
      </div>
    </div>
  )
}

export default Layout