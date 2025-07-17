// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authService } from '../authService'
import type { SignUpData, SignInData } from '../authService'
import type { User, AuthError } from '@supabase/supabase-js'

// Mock Supabase auth
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      onAuthStateChange: vi.fn()
    }
  }
}))

// Mock window.location for password reset tests
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000'
  },
  writable: true
})

describe('AuthService', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {}
  }

  const mockAuthUser = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      const result = await authService.signUp(signUpData)

      expect(result.user).toEqual(mockAuthUser)
      expect(result.error).toBeNull()
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: signUpData.email,
        password: signUpData.password
      })
    })

    it('should handle sign up errors', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const mockError = {
        message: 'Email already registered',
        status: 400,
        code: 'email_already_registered',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authService.signUp(signUpData)

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('should handle unexpected errors during sign up', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signUp).mockRejectedValue(new Error('Network error'))

      const result = await authService.signUp(signUpData)

      expect(result.user).toBeNull()
      expect(result.error?.message).toBe('Network error')
      expect(result.error?.status).toBe(500)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in an existing user', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null
      })

      const result = await authService.signIn(signInData)

      expect(result.user).toEqual(mockAuthUser)
      expect(result.error).toBeNull()
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: signInData.email,
        password: signInData.password
      })
    })

    it('should handle sign in errors', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const mockError: AuthError = {
        message: 'Invalid login credentials',
        status: 401,
        code: 'invalid_credentials',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authService.signIn(signInData)

      expect(result.user).toBeNull()
      expect(result.error).toEqual(mockError)
    })

    it('should handle unexpected errors during sign in', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(new Error('Service unavailable'))

      const result = await authService.signIn(signInData)

      expect(result.user).toBeNull()
      expect(result.error?.message).toBe('Service unavailable')
      expect(result.error?.status).toBe(500)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as any)

      const result = await authService.signOut()

      expect(result.error).toBeNull()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError: AuthError = {
        message: 'Failed to sign out',
        status: 500,
        code: 'signout_failed',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError })

      const result = await authService.signOut()

      expect(result.error).toEqual(mockError)
    })

    it('should handle unexpected errors during sign out', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signOut).mockRejectedValue(new Error('Network error'))

      const result = await authService.signOut()

      expect(result.error?.message).toBe('Network error')
      expect(result.error?.status).toBe(500)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current authenticated user', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result).toEqual(mockAuthUser)
      expect(supabase.auth.getUser).toHaveBeenCalled()
    })

    it('should return null when no user is authenticated', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })

    it('should handle errors and return null', async () => {
      const mockError: AuthError = {
        message: 'Invalid JWT token',
        status: 401,
        code: 'invalid_jwt',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })

    it('should handle unexpected errors gracefully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'))

      const result = await authService.getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getCurrentUserId', () => {
    it('should return current user ID when authenticated', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.getCurrentUserId()

      expect(result).toBe('user-123')
    })

    it('should throw error when user is not authenticated', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      await expect(authService.getCurrentUserId()).rejects.toThrow('User not authenticated')
    })
  })

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('should return false when user is not authenticated', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null, session: null },
        error: null
      })

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })

    it('should return false on errors', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockRejectedValue(new Error('Network error'))

      const result = await authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })

  describe('resetPassword', () => {
    it('should successfully initiate password reset', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null })

      const result = await authService.resetPassword('test@example.com')

      expect(result.error).toBeNull()
      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'http://localhost:3000/auth/reset-password' }
      )
    })

    it('should handle password reset errors', async () => {
      const mockError: AuthError = {
        message: 'Email not found',
        status: 404,
        code: 'email_not_found',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ error: mockError })

      const result = await authService.resetPassword('test@example.com')

      expect(result.error).toEqual(mockError)
    })

    it('should handle unexpected errors during password reset', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.resetPasswordForEmail).mockRejectedValue(new Error('Service error'))

      const result = await authService.resetPassword('test@example.com')

      expect(result.error?.message).toBe('Service error')
      expect(result.error?.status).toBe(500)
    })
  })

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({ data: { user: mockUser }, error: null })

      const result = await authService.updatePassword('newpassword123')

      expect(result.error).toBeNull()
      expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword123' })
    })

    it('should handle password update errors', async () => {
      const mockError: AuthError = {
        message: 'Password too weak',
        status: 400,
        code: 'weak_password',
        name: 'AuthError',
        __isAuthError: true
      } as AuthError

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.updateUser).mockResolvedValue({ error: mockError })

      const result = await authService.updatePassword('weak')

      expect(result.error).toEqual(mockError)
    })

    it('should handle unexpected errors during password update', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.updateUser).mockRejectedValue(new Error('Update failed'))

      const result = await authService.updatePassword('newpassword123')

      expect(result.error?.message).toBe('Update failed')
      expect(result.error?.status).toBe(500)
    })
  })

  describe('onAuthStateChange', () => {
    it('should set up auth state change listener', async () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ data: { subscription: mockUnsubscribe } })

      const result = authService.onAuthStateChange(mockCallback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
      expect(result).toBeDefined()
    })
  })

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(authService.validateEmail('test@example.com')).toBe(true)
      expect(authService.validateEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(authService.validateEmail('simple@test.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(authService.validateEmail('invalid-email')).toBe(false)
      expect(authService.validateEmail('test@')).toBe(false)
      expect(authService.validateEmail('@example.com')).toBe(false)
      expect(authService.validateEmail('test.example.com')).toBe(false)
      expect(authService.validateEmail('')).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const result = authService.validatePassword('StrongPass123')

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject passwords that are too short', () => {
      const result = authService.validatePassword('Short1')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must be at least 8 characters long')
    })

    it('should reject passwords without uppercase letters', () => {
      const result = authService.validatePassword('lowercase123')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
    })

    it('should reject passwords without lowercase letters', () => {
      const result = authService.validatePassword('UPPERCASE123')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one lowercase letter')
    })

    it('should reject passwords without numbers', () => {
      const result = authService.validatePassword('NoNumbers')

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Password must contain at least one number')
    })

    it('should collect multiple validation errors', () => {
      const result = authService.validatePassword('weak')

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors).toContain('Password must be at least 8 characters long')
      expect(result.errors).toContain('Password must contain at least one uppercase letter')
      expect(result.errors).toContain('Password must contain at least one number')
    })
  })

  describe('User Transformation', () => {
    it('should transform Supabase user to domain user', async () => {
      const supabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        user_metadata: {},
        app_metadata: {}
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: supabaseUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      })
    })

    it('should handle missing email in Supabase user', async () => {
      const supabaseUser = {
        id: 'user-123',
        email: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: supabaseUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result?.email).toBe('')
    })

    it('should handle missing timestamps in Supabase user', async () => {
      const supabaseUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: null,
        updated_at: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: supabaseUser },
        error: null
      })

      const result = await authService.getCurrentUser()

      expect(result?.created_at).toBeDefined()
      expect(result?.updated_at).toBeDefined()
      // Should use current date as fallback
      expect(new Date(result!.created_at).getTime()).toBeCloseTo(new Date().getTime(), -1000)
    })
  })
})