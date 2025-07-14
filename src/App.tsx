import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuthStore } from './stores'
import { AuthPage, DashboardPage, TargetPortfolioPage, PortfolioComparisonPage } from './pages'
import { ProtectedRoute, Layout } from './components'
import './App.css'

function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="target-portfolio" element={<TargetPortfolioPage />} />
          <Route path="analytics" element={<PortfolioComparisonPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
