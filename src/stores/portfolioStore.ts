import { create } from 'zustand'
import { stockService } from '../services/stockService'
import type { Stock, StockWithValue, PortfolioSummary } from '../types/database'

interface PortfolioState {
  stocks: Stock[]
  stocksWithValue: StockWithValue[]
  portfolioSummary: PortfolioSummary
  isLoading: boolean
  error: string | null
  fetchStocks: () => Promise<void>
  deleteStock: (stockId: string) => Promise<void>
  refreshData: () => void
  updateCalculations: () => void
  setStocks: (stocks: Stock[]) => void
  simulatePriceUpdates: () => void
  stopPriceUpdates: () => void
}

let priceUpdateInterval: NodeJS.Timeout | null = null

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  stocks: [],
  stocksWithValue: [],
  portfolioSummary: {
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    stocks: []
  },
  isLoading: true,
  error: null,

  setStocks: (stocks) => {
    set({ stocks })
    get().updateCalculations()
  },

  updateCalculations: () => {
    const { stocks } = get()
    const summary = stockService.calculatePortfolioSummary(stocks)
    set({
      stocksWithValue: summary.stocks,
      portfolioSummary: summary
    })
  },

  fetchStocks: async () => {
    try {
      set({ isLoading: true, error: null })
      const fetchedStocks = await stockService.getStocks()
      set({ stocks: fetchedStocks })
      get().updateCalculations()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch stocks' })
      console.error('Error fetching stocks:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  deleteStock: async (stockId: string) => {
    try {
      await stockService.deleteStock(stockId)
      await get().fetchStocks()
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete stock' })
      console.error('Error deleting stock:', err)
    }
  },

  refreshData: () => {
    get().fetchStocks()
  },

  simulatePriceUpdates: () => {
    const { stocks } = get()
    if (stocks.length === 0) return

    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval)
    }

    priceUpdateInterval = setInterval(() => {
      const { stocks } = get()
      const updatedStocks = stocks.map(stock => ({
        ...stock,
        current_price: Math.max(0.01, stock.current_price * (1 + (Math.random() - 0.5) * 0.02))
      }))
      get().setStocks(updatedStocks)
    }, 30000) // Update every 30 seconds
  },

  stopPriceUpdates: () => {
    if (priceUpdateInterval) {
      clearInterval(priceUpdateInterval)
      priceUpdateInterval = null
    }
  }
}))