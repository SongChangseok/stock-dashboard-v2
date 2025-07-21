import { useEffect, lazy, Suspense } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuthStore } from './stores'
import { ProtectedRoute, Layout, ErrorBoundary, PageLoadingWrapper } from './components'
import { setupGlobalErrorHandler } from './services/errorService'
import './App.css'

// Lazy load pages for code splitting
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })))
const TargetPortfolioPage = lazy(() => import('./pages/TargetPortfolioPage').then(module => ({ default: module.TargetPortfolioPage })))
const PortfolioComparisonPage = lazy(() => import('./pages/PortfolioComparisonPage').then(module => ({ default: module.PortfolioComparisonPage })))
const PortfolioHistoryPage = lazy(() => import('./pages/PortfolioHistoryPage'))

function App() {
  const initialize = useAuthStore(state => state.initialize)
  const loading = useAuthStore(state => state.loading)

  useEffect(() => {
    initialize()
    setupGlobalErrorHandler()
  }, [initialize])

  return (
    <ErrorBoundary>
      <PageLoadingWrapper
        isLoading={loading}
        loadingMessage="Initializing application..."
        useTransition={true}
      >
        <Router>
          <Routes>
            <Route path="/auth" element={
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingWrapper isLoading={true} loadingMessage="Loading login page..."><div /></PageLoadingWrapper>}>
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
                  <Suspense fallback={<PageLoadingWrapper isLoading={true} loadingMessage="Loading dashboard..."><div /></PageLoadingWrapper>}>
                    <DashboardPage />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="target-portfolio" element={
                <ErrorBoundary>
                  <Suspense fallback={<PageLoadingWrapper isLoading={true} loadingMessage="Loading target portfolios..."><div /></PageLoadingWrapper>}>
                    <TargetPortfolioPage />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="portfolio-comparison" element={
                <ErrorBoundary>
                  <Suspense fallback={<PageLoadingWrapper isLoading={true} loadingMessage="Loading portfolio analysis..."><div /></PageLoadingWrapper>}>
                    <PortfolioComparisonPage />
                  </Suspense>
                </ErrorBoundary>
              } />
              <Route path="history" element={
                <ErrorBoundary>
                  <Suspense fallback={<PageLoadingWrapper isLoading={true} loadingMessage="Loading portfolio history..."><div /></PageLoadingWrapper>}>
                    <PortfolioHistoryPage />
                  </Suspense>
                </ErrorBoundary>
              } />
            </Route>
          </Routes>
        </Router>
      </PageLoadingWrapper>
    </ErrorBoundary>
  )
}

export default App
