import React, { useState } from 'react'
import { useAuth } from '../hooks'
import type { AuthFormProps } from '../types'

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSuccess }) => {
  const { signIn, signUp, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (type === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      if (type === 'login') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Login successful!')
          onSuccess?.()
        }
      } else {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setSuccess('Sign up successful! Please check your email.')
          onSuccess?.()
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-white mb-2"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
          required
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 focus:ring-3 focus:ring-indigo-500/10 transition-all duration-300 hover:bg-white/7 hover:border-white/20"
        />
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white mb-2"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={type === 'signup' ? 'Minimum 8 characters' : '••••••••'}
          minLength={type === 'signup' ? 8 : undefined}
          required
          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 focus:ring-3 focus:ring-indigo-500/10 transition-all duration-300 hover:bg-white/7 hover:border-white/20"
        />
      </div>

      {/* Confirm Password Field (Signup only) */}
      {type === 'signup' && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-white mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter password"
            required
            className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 focus:ring-3 focus:ring-indigo-500/10 transition-all duration-300 hover:bg-white/7 hover:border-white/20"
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <span>{type === 'login' ? 'Login' : 'Sign Up'}</span>
        )}
      </button>
    </form>
  )
}
