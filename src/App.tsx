import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { useAuthStore } from './stores'
import { AuthPage, DashboardPage } from './pages'
import { ProtectedRoute } from './components'
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
