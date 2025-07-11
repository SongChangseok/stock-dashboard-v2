import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { authService } from '../services/database'
import { User } from '@supabase/supabase-js'

export default function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<
    'testing' | 'connected' | 'error'
  >('testing')
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testConnection()
    checkUser()
  }, [])

  const testConnection = async () => {
    try {
      // Simple health check
      const { error } = await supabase.from('profiles').select('count').limit(1)

      if (error) {
        console.error('Database connection error:', error)
        setError(error.message)
        setConnectionStatus('error')
      } else {
        console.log('Database connection successful')
        setConnectionStatus('connected')
      }
    } catch (err) {
      console.error('Connection test failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setConnectionStatus('error')
    }
  }

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('User check failed:', err)
    }
  }

  const handleSignUp = async () => {
    try {
      const testEmail = 'test@example.com'
      const testPassword = 'testpassword123'

      await authService.signUp(testEmail, testPassword)
      console.log('Sign up successful')
      checkUser()
    } catch (err) {
      console.error('Sign up failed:', err)
      setError(err instanceof Error ? err.message : 'Sign up failed')
    }
  }

  const handleSignIn = async () => {
    try {
      const testEmail = 'test@example.com'
      const testPassword = 'testpassword123'

      await authService.signIn(testEmail, testPassword)
      console.log('Sign in successful')
      checkUser()
    } catch (err) {
      console.error('Sign in failed:', err)
      setError(err instanceof Error ? err.message : 'Sign in failed')
    }
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      console.log('Sign out successful')
      setUser(null)
    } catch (err) {
      console.error('Sign out failed:', err)
      setError(err instanceof Error ? err.message : 'Sign out failed')
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'text-yellow-500'
      case 'connected':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...'
      case 'connected':
        return 'Connected to database'
      case 'error':
        return 'Connection failed'
      default:
        return 'Unknown status'
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Database Test</h2>

      <div className="mb-4">
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          Status: {getStatusText()}
        </div>
        {error && (
          <div className="text-sm text-red-600 mt-2">Error: {error}</div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700">
          User: {user ? user.email : 'Not authenticated'}
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleSignUp}
          disabled={connectionStatus !== 'connected'}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Sign Up
        </button>

        <button
          onClick={handleSignIn}
          disabled={connectionStatus !== 'connected'}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Test Sign In
        </button>

        <button
          onClick={handleSignOut}
          disabled={!user}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign Out
        </button>

        <button
          onClick={testConnection}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          Test Connection Again
        </button>
      </div>
    </div>
  )
}
