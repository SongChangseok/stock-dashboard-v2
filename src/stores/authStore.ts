import { create } from 'zustand'
import type { AuthError } from '@supabase/supabase-js'
import { authService } from '../services/database'
import type { AuthState } from '../types'


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    try {
      set({ loading: true })
      const user = await authService.getCurrentUser()
      set({ user })

      // Listen for auth changes
      authService.onAuthStateChange((_event, session) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set({ user: (session as any)?.user || null, loading: false })
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const result = await authService.signUp(email, password)
      return { user: result.user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    } finally {
      set({ loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    try {
      const result = await authService.signIn(email, password)
      return { user: result.user, error: null }
    } catch (error) {
      return { user: null, error: error as AuthError }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await authService.signOut()
      return { error: null }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      set({ loading: false })
    }
  }
}))