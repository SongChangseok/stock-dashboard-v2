import { supabase, isDevelopmentMode } from './supabase'
import { mockAuthService } from './mockAuthService'

// Authentication operations with mock support for development
export const authService = {
  async signUp(email: string, password: string) {
    if (isDevelopmentMode) {
      console.log('🚀 Using Mock Auth Service for development')
      const result = await mockAuthService.signUp({ email, password })
      if (result.error) {
        throw new Error(result.error)
      }
      return { user: result.user }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    if (isDevelopmentMode) {
      console.log('🚀 Using Mock Auth Service for development')
      const result = await mockAuthService.signInWithPassword({ email, password })
      if (result.error) {
        throw new Error(result.error)
      }
      return { user: result.user }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  async signOut() {
    if (isDevelopmentMode) {
      console.log('🚀 Using Mock Auth Service for development')
      await mockAuthService.signOut()
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    if (isDevelopmentMode) {
      const result = await mockAuthService.getUser()
      return result.user
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    if (isDevelopmentMode) {
      // Mock implementation - in real app you'd implement proper state change listening
      // For now, just call callback once to indicate initial state
      setTimeout(() => {
        mockAuthService.getUser().then(result => {
          callback('INITIAL_SESSION', result.user ? { user: result.user } : null)
        })
      }, 100)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }

    return supabase.auth.onAuthStateChange(callback)
  },
}
