import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../Layout/Layout'
import Login from '../Pages/Login'
import Dashboard from '../Pages/Dashboard'
import AddLead from '../Pages/AddLead'
import TotalLeads from '../Pages/TotalLeads'
import Loss from '../Pages/Loss'
import LeadManagement from '../Pages/LeadManagement'
import SalseManagment from '../Pages/SalseManagment'
import LeadDetails from '../Pages/LeadDetails'
import SalesLeadForm from '../Pages/SalesLeadForm'

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
        <Route path="leads/lost" element={<Loss />} />
        <Route path="leads/all" element={<LeadManagement />} />
        <Route path="leads/details" element={<LeadDetails />} />
        <Route path="leads/details/:id" element={<LeadDetails />} />
        <Route path="leads/sales-form" element={<SalesLeadForm />} />
        <Route path="leads/sales-form/:id" element={<SalesLeadForm />} />
        <Route path="management-sheet" element={<SalseManagment />} />
      </Route>
    </Routes>
  )
}

export default SalesRoutes