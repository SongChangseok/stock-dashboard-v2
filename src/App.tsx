import { useEffect, lazy, Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuthStore } from './stores'
import { ProtectedRoute, Layout, ErrorBoundary, LoadingIndicator } from './components'
import { setupGlobalErrorHandler } from './services/errorService'
import './App.css'

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const TargetPortfolioPage = lazy(() => import('./pages/TargetPortfolioPage').then(module => ({ default: module.TargetPortfolioPage })))
const PortfolioComparisonPage = lazy(() => import('./pages/PortfolioComparisonPage').then(module => ({ default: module.PortfolioComparisonPage })))

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
              <Suspense fallback={<LoadingIndicator />}>
                <AuthPage />
              </Suspense>
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
                <Suspense fallback={<LoadingIndicator />}>
                  <DashboardPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="target-portfolio" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingIndicator />}>
                  <TargetPortfolioPage />
                </Suspense>
              </ErrorBoundary>
            } />
            <Route path="portfolio-comparison" element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingIndicator />}>
                  <PortfolioComparisonPage />
                </Suspense>
              </ErrorBoundary>
            } />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  )
}

export default App
