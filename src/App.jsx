import React from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import MainRoute from './Common/Routes/MainRoute'
import ScrollToTop from './Common/Components/ScrollToTop'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { LeadProvider } from './context/LeadContext'

const App = () => {
  return (
    <Router>
      <LeadProvider>
        <ScrollToTop />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <MainRoute />
      </LeadProvider>
    </Router>
  )
}

export default App