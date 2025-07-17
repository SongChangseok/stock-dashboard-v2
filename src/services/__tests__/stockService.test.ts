// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { stockService } from '../stockService'
import type { CreateStockData, UpdateStockData } from '../../types'

// Mock the getCurrentUserId function
vi.mock('../authHelpers', () => ({
  getCurrentUserId: vi.fn()
}))

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}))

describe('StockService', () => {
  const mockUserId = 'test-user-123'
  const mockStock = {
    id: 'stock-1',
    stock_name: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150.00,
    current_price: 175.00,
    user_id: mockUserId,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    const { getCurrentUserId } = require('../authHelpers')
    vi.mocked(getCurrentUserId).mockResolvedValue(mockUserId)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('CRUD Operations', () => {
    it('should get all stocks for authenticated user', async () => {
      const mockChain = {
        data: [mockStock],
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue(mockChain)
          })
        })
      } as any)

      const result = await stockService.getStocks()

      expect(result).toEqual([mockStock])
      expect(supabase.from).toHaveBeenCalledWith('stocks')
    })

    it('should create a new stock', async () => {
      const createData: CreateStockData = {
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      }

      const mockChain = {
        data: mockStock,
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(mockChain)
          })
        })
      } as any)

      const result = await stockService.createStock(createData)

      expect(result).toEqual(mockStock)
    })

    it('should update an existing stock', async () => {
      const updateData: UpdateStockData = {
        id: 'stock-1',
        current_price: 180.00
      }

      const updatedStock = { ...mockStock, current_price: 180.00 }

      const mockChain = {
        data: updatedStock,
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockReturnValue(mockChain)
              })
            })
          })
        })
      } as any)

      const result = await stockService.updateStock(updateData)

      expect(result).toEqual(updatedStock)
    })

    it('should delete a stock by id', async () => {
      const mockChain = {
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue(mockChain)
          })
        })
      } as any)

      await stockService.deleteStock('stock-1')

      expect(supabase.from).toHaveBeenCalledWith('stocks')
    })

    it('should get stock by id', async () => {
      const mockChain = {
        data: mockStock,
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(mockChain)
            })
          })
        })
      } as any)

      const result = await stockService.getStock('stock-1')

      expect(result).toEqual(mockStock)
    })

    it('should return null when stock not found', async () => {
      const mockChain = {
        data: null,
        error: { code: 'PGRST116' }
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockReturnValue(mockChain)
            })
          })
        })
      } as any)

      const result = await stockService.getStock('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('Search and Filter Operations', () => {
    it('should get stocks by ticker', async () => {
      const mockChain = {
        data: [mockStock],
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(mockChain)
            })
          })
        })
      } as any)

      const result = await stockService.getStocksByTicker('AAPL')

      expect(result).toEqual([mockStock])
    })

    it('should search stocks by name', async () => {
      const mockChain = {
        data: [mockStock],
        error: null
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            ilike: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue(mockChain)
            })
          })
        })
      } as any)

      const result = await stockService.searchStocks('Apple')

      expect(result).toEqual([mockStock])
    })
  })

  describe('Portfolio Calculations', () => {
    it('should calculate portfolio value correctly', async () => {
      const stocks = [
        { ...mockStock, quantity: 10, current_price: 175.00, purchase_price: 150.00 },
        { ...mockStock, id: 'stock-2', quantity: 5, current_price: 200.00, purchase_price: 180.00 }
      ]

      vi.spyOn(stockService, 'getStocks').mockResolvedValue(stocks)

      const result = await stockService.getPortfolioValue()

      expect(result).toEqual({
        totalValue: 2750, // (10 * 175) + (5 * 200)
        totalCost: 2400,  // (10 * 150) + (5 * 180)
        totalGainLoss: 350 // 2750 - 2400
      })
    })

    it('should handle empty portfolio', async () => {
      vi.spyOn(stockService, 'getStocks').mockResolvedValue([])

      const result = await stockService.getPortfolioValue()

      expect(result).toEqual({
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0
      })
    })
  })

  describe('Data Validation', () => {
    it('should validate required fields for create operation', () => {
      const validData: CreateStockData = {
        stock_name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      }

      const result = stockService.validateStockData(validData)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject empty stock name', () => {
      const invalidData: CreateStockData = {
        stock_name: '',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      }

      const result = stockService.validateStockData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Stock name is required')
    })

    it('should reject zero or negative quantity', () => {
      const invalidData: CreateStockData = {
        stock_name: 'Apple Inc.',
        quantity: 0,
        purchase_price: 150.00,
        current_price: 175.00
      }

      const result = stockService.validateStockData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Quantity must be greater than 0')
    })

    it('should reject zero or negative purchase price', () => {
      const invalidData: CreateStockData = {
        stock_name: 'Apple Inc.',
        quantity: 10,
        purchase_price: -150.00,
        current_price: 175.00
      }

      const result = stockService.validateStockData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Purchase price must be greater than 0')
    })

    it('should reject zero or negative current price', () => {
      const invalidData: CreateStockData = {
        stock_name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 0
      }

      const result = stockService.validateStockData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Current price must be greater than 0')
    })

    it('should collect multiple validation errors', () => {
      const invalidData: CreateStockData = {
        stock_name: '',
        quantity: -5,
        purchase_price: 0,
        current_price: -10
      }

      const result = stockService.validateStockData(invalidData)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(4)
      expect(result.errors).toContain('Stock name is required')
      expect(result.errors).toContain('Quantity must be greater than 0')
      expect(result.errors).toContain('Purchase price must be greater than 0')
      expect(result.errors).toContain('Current price must be greater than 0')
    })
  })

  describe('Error Handling', () => {
    it('should handle database errors during getStocks', async () => {
      const mockChain = {
        data: null,
        error: { message: 'Database connection failed' }
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue(mockChain)
          })
        })
      } as any)

      await expect(stockService.getStocks()).rejects.toThrow()
    })

    it('should handle authentication errors', async () => {
      const { getCurrentUserId } = require('../authHelpers')
      vi.mocked(getCurrentUserId).mockRejectedValue(new Error('User not authenticated'))

      await expect(stockService.getStocks()).rejects.toThrow('User not authenticated')
    })

    it('should handle database errors during create', async () => {
      const createData: CreateStockData = {
        stock_name: 'Apple Inc.',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      }

      const mockChain = {
        data: null,
        error: { message: 'Insert failed' }
      }

      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue(mockChain)
          })
        })
      } as any)

      await expect(stockService.createStock(createData)).rejects.toThrow()
    })

    it('should handle unexpected errors gracefully', async () => {
      const { getCurrentUserId } = require('../authHelpers')
      vi.mocked(getCurrentUserId).mockRejectedValue('Unexpected error')

      await expect(stockService.getStocks()).rejects.toThrow('Unexpected error fetching stocks')
    })
  })
})