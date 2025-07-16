import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuthStore } from './stores'
import { AuthPage, DashboardPage, TargetPortfolioPage, PortfolioComparisonPage } from './pages'
import { ProtectedRoute, Layout, ErrorBoundary } from './components'
import { setupGlobalErrorHandler } from './services/errorService'
import './App.css'

function App() {
  const initialize = useAuthStore(state => state.initialize)

  useEffect(() => {
    initialize()
    setupGlobalErrorHandler()
  }, [initialize])

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/auth" element={
            <ErrorBoundary>
              <AuthPage />
            </ErrorBoundary>
          } />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <Layout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            } />
            <Route path="target-portfolio" element={
              <ErrorBoundary>
                <TargetPortfolioPage />
              </ErrorBoundary>
            } />
            <Route path="portfolio-comparison" element={
              <ErrorBoundary>
                <PortfolioComparisonPage />
              </ErrorBoundary>
            } />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
