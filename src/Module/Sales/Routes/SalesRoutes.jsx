import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../Layout/Layout'
import Login from '../Pages/Login'
import Dashboard from '../Pages/Dashboard'
import AddLead from '../Pages/AddLead'
import TotalLeads from '../Pages/TotalLeads'
import Asign from '../Pages/Asign'
import Loss from '../Pages/Loss'
import Followup from '../Pages/Followup'
import LeadManagement from '../Pages/LeadManagement'
import SalseManagment from '../Pages/SalseManagment'
import LeadDetails from '../Pages/LeadDetails'

const SalesRoutes = () => {
  return (
    <Routes>
      {/* Module Level Login Route (/sales/login) */}
      <Route path="login" element={<Login />} />

      {/* Main Dashboard Layout Routes */}
      <Route element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="leads/add" element={<AddLead />} />
        <Route path="leads/total" element={<TotalLeads />} />
        <Route path="leads/assigned" element={<Asign />} />
        <Route path="leads/lost" element={<Loss />} />
        <Route path="leads/followup" element={<Followup />} />
        <Route path="leads/all" element={<LeadManagement />} />
        <Route path="leads/details" element={<LeadDetails />} />
        <Route path="leads/details/:id" element={<LeadDetails />} />
        <Route path="management-sheet" element={<SalseManagment />} />
      </Route>
    </Routes>
  )
}

export default SalesRoutes