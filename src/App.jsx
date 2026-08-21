import React from 'react'
import { BrowserRouter as Router } from "react-router-dom"
import MainRoute from './Common/Routes/MainRoute'
import ScrollToTop from './Common/Components/ScrollToTop'

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <MainRoute />
    </Router>
  )
}

export default App