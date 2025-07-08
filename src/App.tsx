import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts'
import { ProtectedRoute } from './components'
import { AuthPage, Dashboard } from './pages'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
