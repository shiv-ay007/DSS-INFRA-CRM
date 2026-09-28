import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import SalesRoutes from '../../Module/Sales/Routes/SalesRoutes'

const MainRoute = () => {
  return (
    <Routes>
      {/* Default login redirects to Sales module login (/sales/login). Future module logins (/hr/login, /accounts/login) will be inside their respective modules */}
      <Route path="/" element={<Navigate to="/sales/login" replace />} />
      <Route path="/sales/*" element={<SalesRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default MainRoute
