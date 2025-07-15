import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { stockService } from '../services/stockService'
import { realtimeService } from '../services/realtimeService'
import { calculatePortfolioSummary } from '../utils/calculations'
import { saveToSession, loadFromSession, SESSION_KEYS } from '../utils/sessionStorage'
import { globalLoadingManager, LOADING_OPERATIONS } from '../utils/loadingState'
import type { PortfolioState } from '../types'


export const usePortfolioStore = create<PortfolioState>()(
  subscribeWithSelector((set, get) => ({
  stocks: [],
  stocksWithValue: [],
  portfolioSummary: {
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    stocks: []
  },
  isLoading: false,
  error: null,

  updateCalculations: () => {
    const { stocks } = get()
    const summary = calculatePortfolioSummary(stocks)
    set({
      stocksWithValue: summary.stocks,
      portfolioSummary: summary
    })
  },

  fetchStocks: async () => {
    try {
      set({ isLoading: true, error: null })
      const fetchedStocks = await globalLoadingManager.executeWithLoading(
        LOADING_OPERATIONS.FETCH_STOCKS,
        () => stockService.getStocks()
      )
      set({ stocks: fetchedStocks })
      get().updateCalculations()
      
      // Save to session storage
      saveToSession(SESSION_KEYS.PORTFOLIO_DATA, fetchedStocks)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch stocks' })
      console.error('Error fetching stocks:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  deleteStock: async (stockId: string) => {
    const { stocks } = get()
    const originalStock = stocks.find(s => s.id === stockId)
    
    if (!originalStock) return
    
    // Optimistic update - remove stock immediately
    const optimisticStocks = stocks.filter(s => s.id !== stockId)
    set({ stocks: optimisticStocks })
    get().updateCalculations()
    
    try {
      await globalLoadingManager.executeWithLoading(
        LOADING_OPERATIONS.DELETE_STOCK,
        () => stockService.deleteStock(stockId)
      )
      // Success - the optimistic update is already correct
    } catch (err) {
      // Revert on error
      set({ 
        stocks: stocks, // Restore original state
        error: err instanceof Error ? err.message : 'Failed to delete stock' 
      })
      get().updateCalculations()
      console.error('Error deleting stock:', err)
    }
  },

  createStock: async (stockData: Omit<import('../types/database').Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const { stocks } = get()
    const tempId = `temp_${Date.now()}`
    
    // Optimistic update - add stock immediately with temporary ID
    const optimisticStock = {
      ...stockData,
      id: tempId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const optimisticStocks = [optimisticStock, ...stocks]
    set({ stocks: optimisticStocks })
    get().updateCalculations()
    
    try {
      // Refresh to get the real stock from database
      await get().fetchStocks()
    } catch (err) {
      // Revert on error
      set({ 
        stocks: stocks, // Restore original state
        error: err instanceof Error ? err.message : 'Failed to create stock' 
      })
      get().updateCalculations()
      console.error('Error creating stock:', err)
    }
  },

  updateStock: async (stockId: string, stockData: Partial<Omit<import('../types/database').Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const { stocks } = get()
    const originalStock = stocks.find(s => s.id === stockId)
    
    if (!originalStock) return
    
    // Optimistic update - update stock immediately
    const optimisticStocks = stocks.map(s => 
      s.id === stockId 
        ? { ...s, ...stockData, updated_at: new Date().toISOString() }
        : s
    )
    set({ stocks: optimisticStocks })
    get().updateCalculations()
    
    try {
      // Refresh to get the real updated stock from database
      await get().fetchStocks()
    } catch (err) {
      // Revert on error
      set({ 
        stocks: stocks, // Restore original state
        error: err instanceof Error ? err.message : 'Failed to update stock' 
      })
      get().updateCalculations()
      console.error('Error updating stock:', err)
    }
  },

  refreshData: () => {
    get().fetchStocks()
  },

  // Real-time subscription management
  subscribeToRealtime: (userId: string) => {
    return realtimeService.subscribeToStocks(userId, (payload) => {
      const { eventType, old: oldStock, new: newStock } = payload
      
      switch (eventType) {
        case 'INSERT':
          if (newStock) {
            set(state => ({
              stocks: [newStock, ...state.stocks]
            }))
            get().updateCalculations()
          }
          break
          
        case 'UPDATE':
          if (newStock) {
            set(state => ({
              stocks: state.stocks.map(stock => 
                stock.id === newStock.id ? newStock : stock
              )
            }))
            get().updateCalculations()
          }
          break
          
        case 'DELETE':
          if (oldStock) {
            set(state => ({
              stocks: state.stocks.filter(stock => stock.id !== oldStock.id)
            }))
            get().updateCalculations()
          }
          break
      }
      
      // Save to session storage after real-time update
      saveToSession(SESSION_KEYS.PORTFOLIO_DATA, get().stocks)
    })
  },

  // Load from session storage
  loadFromSession: () => {
    const cachedStocks = loadFromSession(SESSION_KEYS.PORTFOLIO_DATA)
    if (cachedStocks) {
      set({ stocks: cachedStocks })
      get().updateCalculations()
    }
  }
})))