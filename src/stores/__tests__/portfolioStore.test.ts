// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { usePortfolioStore } from '../portfolioStore'
import type { Stock } from '../../types/database'

// Mock dependencies
vi.mock('../../services/stockService', () => ({
  stockService: {
    getStocks: vi.fn(),
    deleteStock: vi.fn(),
    createStock: vi.fn(),
    updateStock: vi.fn()
  }
}))

vi.mock('../../services/realtimeService', () => ({
  realtimeService: {
    subscribeToStocks: vi.fn()
  }
}))

vi.mock('../../utils/calculations', () => ({
  calculatePortfolioSummary: vi.fn()
}))

vi.mock('../../utils/sessionStorage', () => ({
  saveToSession: vi.fn(),
  loadFromSession: vi.fn(),
  SESSION_KEYS: {
    PORTFOLIO_DATA: 'portfolio_data'
  }
}))

vi.mock('../../utils/loadingState', () => ({
  globalLoadingManager: {
    executeWithLoading: vi.fn((operation, callback) => callback())
  },
  LOADING_OPERATIONS: {
    FETCH_STOCKS: 'fetch_stocks',
    DELETE_STOCK: 'delete_stock',
    CREATE_STOCK: 'create_stock',
    UPDATE_STOCK: 'update_stock'
  }
}))

describe('PortfolioStore', () => {
  const mockStock: Stock = {
    id: 'stock-1',
    stock_name: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150.00,
    current_price: 175.00,
    user_id: 'user-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  const mockPortfolioSummary = {
    totalValue: 1750.00,
    totalCost: 1500.00,
    totalProfitLoss: 250.00,
    totalProfitLossPercent: 16.67,
    stocks: [{
      ...mockStock,
      totalValue: 1750.00,
      profitLoss: 250.00,
      profitLossPercent: 16.67,
      weight: 100.00
    }]
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Reset store state
    usePortfolioStore.setState({
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
      error: null
    })

    // Setup default mocks
    const { calculatePortfolioSummary } = await vi.importMock('../../utils/calculations')
    calculatePortfolioSummary.mockReturnValue(mockPortfolioSummary)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePortfolioStore())

      expect(result.current.stocks).toEqual([])
      expect(result.current.stocksWithValue).toEqual([])
      expect(result.current.portfolioSummary).toEqual({
        totalValue: 0,
        totalCost: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        stocks: []
      })
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('updateCalculations', () => {
    it('should update calculations and derived state', () => {
      const { result } = renderHook(() => usePortfolioStore())

      // First set some stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      // Call updateCalculations
      act(() => {
        result.current.updateCalculations()
      })

      const { calculatePortfolioSummary } = vi.mocked(require('../../utils/calculations'))
      expect(calculatePortfolioSummary).toHaveBeenCalledWith([mockStock])
      expect(result.current.stocksWithValue).toEqual(mockPortfolioSummary.stocks)
      expect(result.current.portfolioSummary).toEqual(mockPortfolioSummary)
    })
  })

  describe('fetchStocks', () => {
    it('should successfully fetch stocks', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      const { saveToSession } = await vi.importMock('../../utils/sessionStorage')
      
      stockService.getStocks.mockResolvedValue([mockStock])

      const { result } = renderHook(() => usePortfolioStore())

      await act(async () => {
        await result.current.fetchStocks()
      })

      expect(result.current.stocks).toEqual([mockStock])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(saveToSession).toHaveBeenCalledWith('portfolio_data', [mockStock])
    })

    it('should handle fetch errors', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      const error = new Error('Network error')
      stockService.getStocks.mockRejectedValue(error)

      const { result } = renderHook(() => usePortfolioStore())

      await act(async () => {
        await result.current.fetchStocks()
      })

      expect(result.current.stocks).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Network error')
    })

    it('should handle non-Error exceptions', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockRejectedValue('String error')

      const { result } = renderHook(() => usePortfolioStore())

      await act(async () => {
        await result.current.fetchStocks()
      })

      expect(result.current.error).toBe('Failed to fetch stocks')
    })

    it('should set loading states correctly', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([mockStock]), 100)
      }))

      const { result } = renderHook(() => usePortfolioStore())

      const fetchPromise = act(async () => {
        await result.current.fetchStocks()
      })

      // Initially loading should be true
      expect(result.current.isLoading).toBe(true)

      await fetchPromise

      // After completion, loading should be false
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('deleteStock', () => {
    it('should successfully delete stock with optimistic update', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.deleteStock.mockResolvedValue(undefined)

      const { result } = renderHook(() => usePortfolioStore())

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      await act(async () => {
        await result.current.deleteStock('stock-1')
      })

      expect(result.current.stocks).toEqual([])
      expect(stockService.deleteStock).toHaveBeenCalledWith('stock-1')
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { stockService } = await vi.importMock('../../services/stockService')
      const error = new Error('Delete failed')
      stockService.deleteStock.mockRejectedValue(error)

      const { result } = renderHook(() => usePortfolioStore())

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      await act(async () => {
        await result.current.deleteStock('stock-1')
      })

      // Should revert to original state
      expect(result.current.stocks).toEqual([mockStock])
      expect(result.current.error).toBe('Delete failed')
    })

    it('should handle non-existent stock gracefully', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      await act(async () => {
        await result.current.deleteStock('non-existent')
      })

      // Should not change anything
      expect(result.current.stocks).toEqual([mockStock])
      expect(result.current.error).toBeNull()
    })
  })

  describe('createStock', () => {
    it('should successfully create stock with optimistic update', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to return the new stock
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockResolvedValue([mockStock])

      const newStockData = {
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      }

      await act(async () => {
        await result.current.createStock(newStockData)
      })

      expect(result.current.stocks).toEqual([mockStock])
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to fail
      const { stockService } = await vi.importMock('../../services/stockService')
      const error = new Error('Create failed')
      stockService.getStocks.mockRejectedValue(error)

      const originalStocks = [mockStock]
      act(() => {
        usePortfolioStore.setState({ stocks: originalStocks })
      })

      const newStockData = {
        stock_name: 'Microsoft Corp.',
        ticker: 'MSFT',
        quantity: 5,
        purchase_price: 300.00,
        current_price: 320.00
      }

      await act(async () => {
        await result.current.createStock(newStockData)
      })

      // Should revert to original state
      expect(result.current.stocks).toEqual(originalStocks)
      expect(result.current.error).toBe('Create failed')
    })

    it('should handle optimistic update correctly', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to be slow
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([mockStock]), 100)
      }))

      const newStockData = {
        stock_name: 'Microsoft Corp.',
        ticker: 'MSFT',
        quantity: 5,
        purchase_price: 300.00,
        current_price: 320.00
      }

      const createPromise = act(async () => {
        await result.current.createStock(newStockData)
      })

      // Should have optimistic stock added immediately
      expect(result.current.stocks).toHaveLength(1)
      expect(result.current.stocks[0].stock_name).toBe('Microsoft Corp.')
      expect(result.current.stocks[0].id).toMatch(/^temp_/)

      await createPromise

      // Should have real stock after fetch
      expect(result.current.stocks).toEqual([mockStock])
    })
  })

  describe('updateStock', () => {
    it('should successfully update stock with optimistic update', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to return updated stock
      const { stockService } = await vi.importMock('../../services/stockService')
      const updatedStock = { ...mockStock, current_price: 180.00 }
      stockService.getStocks.mockResolvedValue([updatedStock])

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      await act(async () => {
        await result.current.updateStock('stock-1', { current_price: 180.00 })
      })

      expect(result.current.stocks).toEqual([updatedStock])
      expect(result.current.error).toBeNull()
    })

    it('should revert optimistic update on error', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to fail
      const { stockService } = await vi.importMock('../../services/stockService')
      const error = new Error('Update failed')
      stockService.getStocks.mockRejectedValue(error)

      const originalStocks = [mockStock]
      act(() => {
        usePortfolioStore.setState({ stocks: originalStocks })
      })

      await act(async () => {
        await result.current.updateStock('stock-1', { current_price: 180.00 })
      })

      // Should revert to original state
      expect(result.current.stocks).toEqual(originalStocks)
      expect(result.current.error).toBe('Update failed')
    })

    it('should handle non-existent stock gracefully', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      await act(async () => {
        await result.current.updateStock('non-existent', { current_price: 180.00 })
      })

      // Should not change anything
      expect(result.current.stocks).toEqual([mockStock])
      expect(result.current.error).toBeNull()
    })

    it('should handle optimistic update correctly', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks to be slow
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve([{ ...mockStock, current_price: 180.00 }]), 100)
      }))

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      const updatePromise = act(async () => {
        await result.current.updateStock('stock-1', { current_price: 180.00 })
      })

      // Should have optimistic update immediately
      expect(result.current.stocks[0].current_price).toBe(180.00)
      expect(result.current.stocks[0].updated_at).not.toBe(mockStock.updated_at)

      await updatePromise

      // Should have real updated stock after fetch
      expect(result.current.stocks[0].current_price).toBe(180.00)
    })
  })

  describe('refreshData', () => {
    it('should call fetchStocks', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Mock fetchStocks
      const { stockService } = await vi.importMock('../../services/stockService')
      stockService.getStocks.mockResolvedValue([mockStock])

      await act(async () => {
        result.current.refreshData()
      })

      expect(stockService.getStocks).toHaveBeenCalled()
    })
  })

  describe('subscribeToRealtime', () => {
    it('should subscribe to real-time updates', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))
      const mockUnsubscribe = vi.fn()
      realtimeService.subscribeToStocks.mockReturnValue(mockUnsubscribe)

      const unsubscribe = result.current.subscribeToRealtime('user-1')

      expect(realtimeService.subscribeToStocks).toHaveBeenCalledWith('user-1', expect.any(Function))
      expect(unsubscribe).toBe(mockUnsubscribe)
    })

    it('should handle INSERT events', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))
      const { saveToSession } = await vi.importMock('../../utils/sessionStorage')

      let realtimeCallback: any

      realtimeService.subscribeToStocks.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      // Simulate INSERT event
      act(() => {
        realtimeCallback({
          eventType: 'INSERT',
          new: mockStock,
          old: null
        })
      })

      expect(result.current.stocks).toEqual([mockStock])
      expect(saveToSession).toHaveBeenCalledWith('portfolio_data', [mockStock])
    })

    it('should handle UPDATE events', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))

      let realtimeCallback: any

      realtimeService.subscribeToStocks.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      const updatedStock = { ...mockStock, current_price: 180.00 }

      // Simulate UPDATE event
      act(() => {
        realtimeCallback({
          eventType: 'UPDATE',
          new: updatedStock,
          old: mockStock
        })
      })

      expect(result.current.stocks).toEqual([updatedStock])
    })

    it('should handle DELETE events', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { realtimeService } = vi.mocked(require('../../services/realtimeService'))

      let realtimeCallback: any

      realtimeService.subscribeToStocks.mockImplementation((userId, callback) => {
        realtimeCallback = callback
        return vi.fn()
      })

      // Set initial stocks
      act(() => {
        usePortfolioStore.setState({ stocks: [mockStock] })
      })

      // Subscribe to real-time
      result.current.subscribeToRealtime('user-1')

      // Simulate DELETE event
      act(() => {
        realtimeCallback({
          eventType: 'DELETE',
          new: null,
          old: mockStock
        })
      })

      expect(result.current.stocks).toEqual([])
    })
  })

  describe('loadFromSession', () => {
    it('should load stocks from session storage', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { loadFromSession } = vi.mocked(require('../../utils/sessionStorage'))

      loadFromSession.mockReturnValue([mockStock])

      act(() => {
        result.current.loadFromSession()
      })

      expect(result.current.stocks).toEqual([mockStock])
      expect(loadFromSession).toHaveBeenCalledWith('portfolio_data')
    })

    it('should handle empty session storage', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { loadFromSession } = vi.mocked(require('../../utils/sessionStorage'))

      loadFromSession.mockReturnValue(null)

      act(() => {
        result.current.loadFromSession()
      })

      expect(result.current.stocks).toEqual([])
    })

    it('should update calculations after loading', () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { loadFromSession } = vi.mocked(require('../../utils/sessionStorage'))
      const { calculatePortfolioSummary } = vi.mocked(require('../../utils/calculations'))

      loadFromSession.mockReturnValue([mockStock])

      act(() => {
        result.current.loadFromSession()
      })

      expect(calculatePortfolioSummary).toHaveBeenCalledWith([mockStock])
      expect(result.current.portfolioSummary).toEqual(mockPortfolioSummary)
    })
  })

  describe('Error States', () => {
    it('should handle async operation errors correctly', async () => {
      const { result } = renderHook(() => usePortfolioStore())

      // Test different error types
      const operations = [
        { method: 'fetchStocks', error: 'Failed to fetch stocks' },
        { method: 'deleteStock', error: 'Failed to delete stock' },
        { method: 'createStock', error: 'Failed to create stock' },
        { method: 'updateStock', error: 'Failed to update stock' }
      ]

      for (const { method, error } of operations) {
        // Reset state
        act(() => {
          usePortfolioStore.setState({ error: null })
        })

        if (method === 'fetchStocks') {
          const { stockService } = await vi.importMock('../../services/stockService')
          stockService.getStocks.mockRejectedValue(error)
          
          await act(async () => {
            await result.current.fetchStocks()
          })
        }

        expect(result.current.error).toBe(error)
      }
    })

    it('should clear error state on successful operations', async () => {
      const { result } = renderHook(() => usePortfolioStore())
      const { stockService } = await vi.importMock('../../services/stockService')

      // Set initial error
      act(() => {
        usePortfolioStore.setState({ error: 'Previous error' })
      })

      // Mock successful fetch
      stockService.getStocks.mockResolvedValue([mockStock])

      await act(async () => {
        await result.current.fetchStocks()
      })

      expect(result.current.error).toBeNull()
    })
  })
})