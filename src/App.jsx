import React from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from './Module/Sales/Routes/SalesRoutes'
import ScrollToTop from './Common/Components/ScrollToTop'

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
    </Router>
  )
}

export default App