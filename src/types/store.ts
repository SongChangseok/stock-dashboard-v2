import type { User, AuthError } from '@supabase/supabase-js'
import { Stock, StockWithValue, PortfolioSummary } from './database'
import { TargetPortfolioData, CreateTargetPortfolioData, UpdateTargetPortfolioData } from './targetPortfolio'

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

// Target Portfolio store types
export interface TargetPortfolioState {
  targetPortfolios: TargetPortfolioData[]
  selectedTargetPortfolio: TargetPortfolioData | null
  isLoading: boolean
  error: string | null
  
  // Async actions
  fetchTargetPortfolios: () => Promise<void>
  createTargetPortfolio: (portfolioData: CreateTargetPortfolioData) => Promise<TargetPortfolioData>
  updateTargetPortfolio: (portfolioData: UpdateTargetPortfolioData) => Promise<TargetPortfolioData>
  deleteTargetPortfolio: (portfolioId: string) => Promise<void>
  
  // Sync actions
  setTargetPortfolios: (portfolios: TargetPortfolioData[]) => void
  setSelectedTargetPortfolio: (portfolio: TargetPortfolioData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}