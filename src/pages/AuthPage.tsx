import React, { useState } from 'react'
import { AuthForm } from '../components/AuthForm'
import { useAuth } from '../hooks'
import { Navigate } from 'react-router-dom'

export const AuthPage: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
            StockDash
          </h1>
        </div>

        {/* Auth Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20 relative">
          {/* Glass effect top border */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Tab Navigation */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-8 relative">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${
                activeTab === 'login'
                  ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 relative z-10 ${
                activeTab === 'signup'
                  ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Form */}
          <AuthForm type={activeTab} />
        </div>

        {/* Footer */}
        <div className="text-center pt-6">
          <p className="text-sm text-gray-400">
            {activeTab === 'login'
              ? "Don't have an account?"
              : 'Already have an account?'}{' '}
            <button
              onClick={() =>
                setActiveTab(activeTab === 'login' ? 'signup' : 'login')
              }
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors duration-300"
            >
              {activeTab === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
