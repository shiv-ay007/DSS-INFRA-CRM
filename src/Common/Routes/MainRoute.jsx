import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../Pages/Home'
import SalesRoutes from '../../Module/Sales/Routes/SalesRoutes'

const MainRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Default login redirects to Sales module login (/sales/login). Future module logins (/hr/login, /accounts/login) will be inside their respective modules */}
      <Route path="/login" element={<Navigate to="/sales/login" replace />} />
      <Route path="/sales/*" element={<SalesRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default MainRoute
