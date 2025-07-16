import { supabase } from './supabase'
import type { User, AuthError } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: AuthError | null
}

export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { user: null, error }
      }

      const user = authData.user ? this.transformUser(authData.user) : null
      return { user, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during sign up',
          status: 500,
        } as AuthError,
      }
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        return { user: null, error }
      }

      const user = authData.user ? this.transformUser(authData.user) : null
      return { user, error: null }
    } catch (error) {
      return {
        user: null,
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during sign in',
          status: 500,
        } as AuthError,
      }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during sign out',
          status: 500,
        } as AuthError,
      }
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        throw new Error(`Failed to get current user: ${error.message}`)
      }

      return user ? this.transformUser(user) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Get the current user ID
   * @throws Error if user is not authenticated
   */
  async getCurrentUserId(): Promise<string> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    return user.id
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user !== null
    } catch {
      return false
    }
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during password reset',
          status: 500,
        } as AuthError,
      }
    }
  }

  /**
   * Update user password
   */
  async updatePassword(password: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'Unknown error during password update',
          status: 500,
        } as AuthError,
      }
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  /**
   * Transform Supabase user to our domain user
   */
  private transformUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    }
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  validatePassword(password: string): import('../types/base').BaseValidationResult {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}

export const authService = new AuthService()
