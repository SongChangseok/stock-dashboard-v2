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
  createStock: (stockData: Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateStock: (stockId: string, stockData: Partial<Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>
  refreshData: () => void
  updateCalculations: () => void
  subscribeToRealtime: (userId: string) => () => void
  loadFromSession: () => void
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
  
  // Real-time and persistence
  subscribeToRealtime: (userId: string) => () => void
  saveSelectedToSession: () => void
  loadSelectedFromSession: () => void
}

// Preferences store types
export interface PreferencesState {
  // UI preferences
  viewMode: 'table' | 'cards'
  currency: string
  language: string
  theme: 'light' | 'dark'
  
  // Portfolio preferences
  defaultSortOrder: 'name' | 'value' | 'profit' | 'weight'
  defaultSortDirection: 'asc' | 'desc'
  showProfitLoss: boolean
  showPercentageChange: boolean
  autoRefreshInterval: number
  
  // Chart preferences
  chartType: 'pie' | 'doughnut' | 'bar'
  showLegend: boolean
  showTooltips: boolean
  animateCharts: boolean
  
  // Notification preferences
  enableNotifications: boolean
  notifyOnLargeChanges: boolean
  largeChangeThreshold: number
  
  // Rebalancing preferences
  defaultRebalanceThreshold: number
  defaultMinimumTradingUnit: number
  defaultCommission: number
  
  // Actions
  setViewMode: (mode: 'table' | 'cards') => void
  setCurrency: (currency: string) => void
  setLanguage: (language: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  
  setSortOrder: (order: 'name' | 'value' | 'profit' | 'weight') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  setShowProfitLoss: (show: boolean) => void
  setShowPercentageChange: (show: boolean) => void
  setAutoRefreshInterval: (interval: number) => void
  
  setChartType: (type: 'pie' | 'doughnut' | 'bar') => void
  setShowLegend: (show: boolean) => void
  setShowTooltips: (show: boolean) => void
  setAnimateCharts: (animate: boolean) => void
  
  setEnableNotifications: (enable: boolean) => void
  setNotifyOnLargeChanges: (notify: boolean) => void
  setLargeChangeThreshold: (threshold: number) => void
  
  setDefaultRebalanceThreshold: (threshold: number) => void
  setDefaultMinimumTradingUnit: (unit: number) => void
  setDefaultCommission: (commission: number) => void
  
  updatePreferences: (preferences: Partial<PreferencesState>) => void
  resetPreferences: () => void
}