/**
 * Mock authentication service for development without Docker/Supabase
 */
import type { User } from '@supabase/supabase-js'

export interface MockUser extends Partial<User> {
  id: string
  email: string
  created_at: string
  // Add required User properties for compatibility
  app_metadata: Record<string, any>
  user_metadata: Record<string, any>
  aud: string
}

export interface MockAuthResponse {
  user: MockUser | null
  error: string | null
}

class MockAuthService {
  private isSignedIn = false
  private currentUser: MockUser | null = null

  /**
   * Mock sign in - always succeeds
   */
  async signInWithPassword(credentials: { email: string; password: string }): Promise<MockAuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!credentials.email || !credentials.password) {
      return {
        user: null,
        error: 'Invalid email or password'
      }
    }

    const user: MockUser = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email: credentials.email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }

    this.currentUser = user
    this.isSignedIn = true

    // Store in sessionStorage for persistence during development
    sessionStorage.setItem('mock-auth-user', JSON.stringify(user))
    sessionStorage.setItem('mock-auth-signed-in', 'true')

    return {
      user,
      error: null
    }
  }

  /**
   * Mock sign up - always succeeds
   */
  async signUp(credentials: { email: string; password: string }): Promise<MockAuthResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!credentials.email || !credentials.password) {
      return {
        user: null,
        error: 'Invalid email or password'
      }
    }

    const user: MockUser = {
      id: 'mock-user-' + Math.random().toString(36).substr(2, 9),
      email: credentials.email,
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated'
    }

    this.currentUser = user
    this.isSignedIn = true

    // Store in sessionStorage for persistence during development
    sessionStorage.setItem('mock-auth-user', JSON.stringify(user))
    sessionStorage.setItem('mock-auth-signed-in', 'true')

    return {
      user,
      error: null
    }
  }

  /**
   * Mock sign out
   */
  async signOut(): Promise<{ error: string | null }> {
    this.currentUser = null
    this.isSignedIn = false

    // Clear sessionStorage
    sessionStorage.removeItem('mock-auth-user')
    sessionStorage.removeItem('mock-auth-signed-in')

    return { error: null }
  }

  /**
   * Get current user from session
   */
  async getUser(): Promise<MockAuthResponse> {
    // Try to restore from sessionStorage
    const storedUser = sessionStorage.getItem('mock-auth-user')
    const isSignedIn = sessionStorage.getItem('mock-auth-signed-in') === 'true'

    if (isSignedIn && storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser)
        this.isSignedIn = true
        return {
          user: this.currentUser,
          error: null
        }
      } catch {
        // Invalid stored data, clear it
        sessionStorage.removeItem('mock-auth-user')
        sessionStorage.removeItem('mock-auth-signed-in')
      }
    }

    return {
      user: null,
      error: null
    }
  }

  /**
   * Get current user ID for API calls
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.id || null
  }

  /**
   * Check if user is signed in
   */
  isAuthenticated(): boolean {
    return this.isSignedIn && this.currentUser !== null
  }
}

export const mockAuthService = new MockAuthService()