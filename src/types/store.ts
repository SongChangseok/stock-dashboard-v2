import type { User, AuthError } from '@supabase/supabase-js'
import { Stock, StockWithValue, PortfolioSummary } from './database'

// Auth store types
export interface AuthState {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
}

// Portfolio store types
export interface PortfolioState {
  stocks: Stock[]
  stocksWithValue: StockWithValue[]
  portfolioSummary: PortfolioSummary
  isLoading: boolean
  error: string | null
  fetchStocks: () => Promise<void>
  deleteStock: (stockId: string) => Promise<void>
  refreshData: () => void
  updateCalculations: () => void
}