import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../Layout/Layout'
import Dashboard from '../Pages/Dashboard'
import AddLead from '../Pages/AddLead'
import TotalLeads from '../Pages/TotalLeads'
import Asign from '../Pages/Asign'
import Loss from '../Pages/Loss'
import Followup from '../Pages/Followup'
import LeadManagement from '../Pages/LeadManagement'
import SalseManagment from '../Pages/SalseManagment'

const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Root redirect */}
      <Route path="/" element={<Navigate to="/sales/dashboard" replace />} />

      {/* 2. Main Sales Layout with Sub-routes */}
      <Route path="/sales" element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads/add" element={<AddLead />} />
        <Route path="leads/total" element={<TotalLeads />} />
        <Route path="leads/assigned" element={<Asign />} />
        <Route path="leads/lost" element={<Loss />} />
        <Route path="leads/followup" element={<Followup />} />
        <Route path="leads/all" element={<LeadManagement />} />
        <Route path="management-sheet" element={<SalseManagment />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes