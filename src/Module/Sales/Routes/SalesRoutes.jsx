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
import Presales from '../Pages/Presales'
import PmsTemplate from '../Pages/Master/PmsTemplate'
import MaterialMaster from '../Pages/Master/MaterialMaster'
import SuplireContractor from '../Pages/Master/SuplireContractor'
import AddSupplierPage from '../Pages/Master/AddSupplierPage'
import AddContractorPage from '../Pages/Master/AddContractorPage'
import SupplierContractorDetailsPage from '../Pages/Master/SupplierContractorDetailsPage'

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
        <Route path="presales" element={<Presales />} />
        <Route path="presales/:id" element={<Presales />} />
        {/* MasterForm Routes */}
        <Route path="master/pms-template" element={<PmsTemplate />} />
        <Route path="master/material" element={<MaterialMaster />} />
        <Route path="master/suplire-and-contractor" element={<SuplireContractor />} />
        <Route path="master/suplire-and-contractor/add-supplier" element={<AddSupplierPage />} />
        <Route path="master/suplire-and-contractor/edit-supplier/:id" element={<AddSupplierPage />} />
        <Route path="master/suplire-and-contractor/add-contractor" element={<AddContractorPage />} />
        <Route path="master/suplire-and-contractor/edit-contractor/:id" element={<AddContractorPage />} />
        <Route path="master/suplire-and-contractor/details/:type/:id" element={<SupplierContractorDetailsPage />} />
        <Route path="master/supplier-contractor" element={<Navigate to="/sales/master/suplire-and-contractor" replace />} />
      </Route>
    </Routes>
  )
}

export default SalesRoutes