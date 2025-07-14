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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent mb-2">
            StockDash
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            Global Stock Portfolio Management Platform
          </p>
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

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="px-4 text-sm text-gray-400">or</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Google Auth Button */}
          <button
            onClick={() => {
              // TODO: Implement Google auth
              alert('Google login feature coming soon.')
            }}
            className="w-full py-4 bg-white/5 border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google {activeTab === 'login' ? 'Continue' : 'Sign Up'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400">
            {activeTab === 'login'
              ? 'Don\'t have an account?'
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
