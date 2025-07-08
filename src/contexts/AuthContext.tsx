import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { type User, type Session } from '@supabase/supabase-js'
import { authService } from '../services/auth'
import type { Database } from '../types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await authService.getProfile(user.id)
      setProfile(profileData)
    }
  }, [user])

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }

      // Handle automatic logout on token expiry
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [refreshProfile])

  useEffect(() => {
    if (user) {
      refreshProfile()
    }
  }, [user, refreshProfile])

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    await authService.signUp(email, password, fullName)
  }

  const handleSignIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
  }

  const handleSignOut = async () => {
    await authService.signOut()
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}