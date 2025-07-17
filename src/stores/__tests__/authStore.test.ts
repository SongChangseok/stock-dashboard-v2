// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useAuthStore } from '../authStore'
import type { User, AuthError } from '@supabase/supabase-js'

// Mock the authService
vi.mock('../../services/database', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
}))

describe('AuthStore', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {},
  }

  const mockAuthError: AuthError = {
    message: 'Invalid credentials',
    status: 401,
    name: 'AuthError',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset store state
    useAuthStore.setState({
      user: null,
      loading: true,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore())

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(true)
    })
  })

  describe('setUser', () => {
    it('should set user', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setUser(mockUser)
      })

      expect(result.current.user).toEqual(mockUser)
    })

    it('should clear user when set to null', () => {
      const { result } = renderHook(() => useAuthStore())

      // First set a user
      act(() => {
        result.current.setUser(mockUser)
      })

      // Then clear it
      act(() => {
        result.current.setUser(null)
      })

      expect(result.current.user).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.loading).toBe(false)
    })

    it('should toggle loading state', () => {
      const { result } = renderHook(() => useAuthStore())

      act(() => {
        result.current.setLoading(false)
      })

      expect(result.current.loading).toBe(false)

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.loading).toBe(true)
    })
  })

  describe('initialize', () => {
    it('should initialize with current user', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      const mockOnAuthStateChange = vi.fn()

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.onAuthStateChange).mockReturnValue(
        mockOnAuthStateChange,
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authService.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function),
      )
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })

    it('should handle initialization errors', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      const error = new Error('Initialization failed')

      vi.mocked(authService.getCurrentUser).mockRejectedValue(error)
      vi.mocked(authService.onAuthStateChange).mockReturnValue(vi.fn())

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Error initializing auth:', error)
      expect(result.current.loading).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should set up auth state change listener', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      let authStateCallback: any

      vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback
          return vi.fn()
        },
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      // Simulate auth state change
      act(() => {
        authStateCallback('SIGNED_IN', { user: mockUser })
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
    })

    it('should handle auth state change with no session', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      let authStateCallback: any

      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback
          return vi.fn()
        },
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      // Simulate auth state change with no session
      act(() => {
        authStateCallback('SIGNED_OUT', null)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })

  describe('signUp', () => {
    it('should successfully sign up user', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signUp).mockResolvedValue({
        user: mockUser,
        session: null,
      })

      const { result } = renderHook(() => useAuthStore())

      let signUpResult: any

      await act(async () => {
        signUpResult = await result.current.signUp(
          'test@example.com',
          'password123',
        )
      })

      expect(authService.signUp).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      )
      expect(signUpResult).toEqual({ user: mockUser, error: null })
      expect(result.current.loading).toBe(false)
    })

    it('should handle sign up errors', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signUp).mockRejectedValue(mockAuthError)

      const { result } = renderHook(() => useAuthStore())

      let signUpResult: any

      await act(async () => {
        signUpResult = await result.current.signUp(
          'test@example.com',
          'password123',
        )
      })

      expect(signUpResult).toEqual({ user: null, error: mockAuthError })
      expect(result.current.loading).toBe(false)
    })

    it('should set loading state during sign up', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signUp).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ user: mockUser, session: null }), 100)
          }),
      )

      const { result } = renderHook(() => useAuthStore())

      const signUpPromise = act(async () => {
        await result.current.signUp('test@example.com', 'password123')
      })

      // Initially loading should be true
      expect(result.current.loading).toBe(true)

      await signUpPromise

      // After completion, loading should be false
      expect(result.current.loading).toBe(false)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signIn).mockResolvedValue({
        user: mockUser,
        session: null,
      })

      const { result } = renderHook(() => useAuthStore())

      let signInResult: any

      await act(async () => {
        signInResult = await result.current.signIn(
          'test@example.com',
          'password123',
        )
      })

      expect(authService.signIn).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      )
      expect(signInResult).toEqual({ user: mockUser, error: null })
      expect(result.current.loading).toBe(false)
    })

    it('should handle sign in errors', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signIn).mockRejectedValue(mockAuthError)

      const { result } = renderHook(() => useAuthStore())

      let signInResult: any

      await act(async () => {
        signInResult = await result.current.signIn(
          'test@example.com',
          'wrongpassword',
        )
      })

      expect(signInResult).toEqual({ user: null, error: mockAuthError })
      expect(result.current.loading).toBe(false)
    })

    it('should set loading state during sign in', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signIn).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ user: mockUser, session: null }), 100)
          }),
      )

      const { result } = renderHook(() => useAuthStore())

      const signInPromise = act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      // Initially loading should be true
      expect(result.current.loading).toBe(true)

      await signInPromise

      // After completion, loading should be false
      expect(result.current.loading).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signOut).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthStore())

      let signOutResult: any

      await act(async () => {
        signOutResult = await result.current.signOut()
      })

      expect(authService.signOut).toHaveBeenCalled()
      expect(signOutResult).toEqual({ error: null })
      expect(result.current.loading).toBe(false)
    })

    it('should handle sign out errors', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signOut).mockRejectedValue(mockAuthError)

      const { result } = renderHook(() => useAuthStore())

      let signOutResult: any

      await act(async () => {
        signOutResult = await result.current.signOut()
      })

      expect(signOutResult).toEqual({ error: mockAuthError })
      expect(result.current.loading).toBe(false)
    })

    it('should set loading state during sign out', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signOut).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(undefined), 100)
          }),
      )

      const { result } = renderHook(() => useAuthStore())

      const signOutPromise = act(async () => {
        await result.current.signOut()
      })

      // Initially loading should be true
      expect(result.current.loading).toBe(true)

      await signOutPromise

      // After completion, loading should be false
      expect(result.current.loading).toBe(false)
    })
  })

  describe('Authentication Flow Integration', () => {
    it('should handle complete authentication flow', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))

      // Mock successful operations
      vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
      vi.mocked(authService.onAuthStateChange).mockReturnValue(vi.fn())
      vi.mocked(authService.signUp).mockResolvedValue({
        user: mockUser,
        session: null,
      })
      vi.mocked(authService.signOut).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthStore())

      // Initialize
      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)

      // Sign up
      await act(async () => {
        await result.current.signUp('test@example.com', 'password123')
      })

      // Sign out
      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.loading).toBe(false)
    })

    it('should handle authentication errors gracefully', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))

      // Mock failed operations
      vi.mocked(authService.getCurrentUser).mockRejectedValue(
        new Error('Network error'),
      )
      vi.mocked(authService.onAuthStateChange).mockReturnValue(vi.fn())
      vi.mocked(authService.signIn).mockRejectedValue(mockAuthError)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { result } = renderHook(() => useAuthStore())

      // Initialize with error
      await act(async () => {
        await result.current.initialize()
      })

      expect(result.current.loading).toBe(false)

      // Sign in with error
      let signInResult: any
      await act(async () => {
        signInResult = await result.current.signIn(
          'test@example.com',
          'wrongpassword',
        )
      })

      expect(signInResult.error).toEqual(mockAuthError)
      expect(result.current.loading).toBe(false)

      consoleSpy.mockRestore()
    })
  })

  describe('State Management', () => {
    it('should maintain state correctly during async operations', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))

      // Mock slow operations
      vi.mocked(authService.signIn).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ user: mockUser, session: null }), 100)
          }),
      )

      const { result } = renderHook(() => useAuthStore())

      // Start sign in
      const signInPromise = act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      // Should be loading
      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()

      await signInPromise

      // Should be complete
      expect(result.current.loading).toBe(false)
    })

    it('should handle concurrent async operations', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))

      vi.mocked(authService.signIn).mockResolvedValue({
        user: mockUser,
        session: null,
      })
      vi.mocked(authService.signOut).mockResolvedValue(undefined)

      const { result } = renderHook(() => useAuthStore())

      // Start concurrent operations
      const signInPromise = act(async () => {
        await result.current.signIn('test@example.com', 'password123')
      })

      const signOutPromise = act(async () => {
        await result.current.signOut()
      })

      await Promise.all([signInPromise, signOutPromise])

      // Should end up in consistent state
      expect(result.current.loading).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null user responses', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signIn).mockResolvedValue({
        user: null,
        session: null,
      })

      const { result } = renderHook(() => useAuthStore())

      const signInResult = await act(async () => {
        return await result.current.signIn('test@example.com', 'password123')
      })

      expect(signInResult.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })

    it('should handle non-Error exceptions', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      vi.mocked(authService.signIn).mockRejectedValue('String error')

      const { result } = renderHook(() => useAuthStore())

      const signInResult = await act(async () => {
        return await result.current.signIn('test@example.com', 'password123')
      })

      expect(signInResult.error).toBe('String error')
      expect(result.current.loading).toBe(false)
    })

    it('should handle undefined session in auth state change', async () => {
      const { authService } = vi.mocked(await import('../../services/database'))
      let authStateCallback: any

      vi.mocked(authService.getCurrentUser).mockResolvedValue(null)
      vi.mocked(authService.onAuthStateChange).mockImplementation(
        (callback) => {
          authStateCallback = callback
          return vi.fn()
        },
      )

      const { result } = renderHook(() => useAuthStore())

      await act(async () => {
        await result.current.initialize()
      })

      // Simulate auth state change with undefined session
      act(() => {
        authStateCallback('SIGNED_OUT', undefined)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
    })
  })
})
