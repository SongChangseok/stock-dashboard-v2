import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { stockService } from '../stockService'
import { targetPortfolioService } from '../targetPortfolioService'
import { authService } from '../database'
import { realtimeService } from '../realtimeService'
import { mockStocks, mockTargetPortfolio, mockUser } from '../../test/integration-utils'

// Mock Supabase client
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockStocks, error: null }))
        }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: mockStocks[0], error: null })),
      update: vi.fn(() => Promise.resolve({ data: mockStocks[0], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: null, error: null })),
      channel: vi.fn(() => ({
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      }))
    }))
  }
}))

describe('Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Stock Service Integration', () => {
    it('should fetch stocks successfully', async () => {
      const stocks = await stockService.getStocks()
      
      expect(stocks).toEqual(mockStocks)
      expect(stocks).toHaveLength(2)
      expect(stocks[0]).toHaveProperty('id')
      expect(stocks[0]).toHaveProperty('stock_name')
      expect(stocks[0]).toHaveProperty('ticker')
    })

    it('should create stock successfully', async () => {
      const newStock = {
        stock_name: 'Tesla Inc.',
        ticker: 'TSLA',
        quantity: 5,
        purchase_price: 200.00,
        current_price: 250.00
      }

      const createdStock = await stockService.createStock(newStock)
      
      expect(createdStock).toEqual(mockStocks[0])
      expect(createdStock).toHaveProperty('id')
      expect(createdStock).toHaveProperty('created_at')
      expect(createdStock).toHaveProperty('updated_at')
    })

    it('should update stock successfully', async () => {
      const updateData = {
        current_price: 180.00
      }

      const updatedStock = await stockService.updateStock('stock-1', updateData)
      
      expect(updatedStock).toEqual(mockStocks[0])
      expect(updatedStock).toHaveProperty('updated_at')
    })

    it('should delete stock successfully', async () => {
      await expect(stockService.deleteStock('stock-1')).resolves.toBeUndefined()
    })

    it('should handle stock service errors', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: new Error('Database error') }))
          }))
        }))
      } as any)

      await expect(stockService.getStocks()).rejects.toThrow('Database error')
    })

    it('should validate stock data before creation', async () => {
      const invalidStock = {
        stock_name: '', // Invalid empty name
        ticker: 'TSLA',
        quantity: -1, // Invalid negative quantity
        purchase_price: 200.00,
        current_price: 250.00
      }

      await expect(stockService.createStock(invalidStock)).rejects.toThrow('Invalid stock data')
    })
  })

  describe('Target Portfolio Service Integration', () => {
    it('should fetch target portfolios successfully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: [mockTargetPortfolio], error: null }))
          }))
        }))
      } as any)

      const portfolios = await targetPortfolioService.getTargetPortfolios()
      
      expect(portfolios).toEqual([mockTargetPortfolio])
      expect(portfolios[0]).toHaveProperty('allocations')
      expect(portfolios[0].allocations).toHaveProperty('stocks')
    })

    it('should create target portfolio successfully', async () => {
      const newPortfolio = {
        name: 'Growth Portfolio',
        allocations: {
          description: 'High growth portfolio',
          stocks: [
            { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 100 }
          ],
          total_weight: 100
        }
      }

      const createdPortfolio = await targetPortfolioService.createTargetPortfolio(newPortfolio)
      
      expect(createdPortfolio).toEqual(mockTargetPortfolio)
      expect(createdPortfolio).toHaveProperty('id')
      expect(createdPortfolio).toHaveProperty('user_id')
    })

    it('should validate portfolio allocation weights', async () => {
      const invalidPortfolio = {
        name: 'Invalid Portfolio',
        allocations: {
          description: 'Invalid weights',
          stocks: [
            { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 150 } // Invalid weight > 100
          ],
          total_weight: 150
        }
      }

      await expect(targetPortfolioService.createTargetPortfolio(invalidPortfolio))
        .rejects.toThrow('Invalid portfolio allocation')
    })

    it('should update target portfolio successfully', async () => {
      const updateData = {
        id: 'portfolio-1',
        name: 'Updated Portfolio',
        allocations: mockTargetPortfolio.allocations
      }

      const updatedPortfolio = await targetPortfolioService.updateTargetPortfolio(updateData)
      
      expect(updatedPortfolio).toEqual(mockTargetPortfolio)
      expect(updatedPortfolio).toHaveProperty('updated_at')
    })

    it('should delete target portfolio successfully', async () => {
      await expect(targetPortfolioService.deleteTargetPortfolio('portfolio-1')).resolves.toBeUndefined()
    })

    it('should handle concurrent portfolio operations', async () => {
      // Test multiple operations at once
      const operations = [
        targetPortfolioService.createTargetPortfolio({
          name: 'Portfolio 1',
          allocations: mockTargetPortfolio.allocations
        }),
        targetPortfolioService.createTargetPortfolio({
          name: 'Portfolio 2',
          allocations: mockTargetPortfolio.allocations
        }),
        targetPortfolioService.updateTargetPortfolio({
          id: 'portfolio-1',
          name: 'Updated Portfolio'
        })
      ]

      const results = await Promise.allSettled(operations)
      
      expect(results).toHaveLength(3)
      expect(results[0].status).toBe('fulfilled')
      expect(results[1].status).toBe('fulfilled')
      expect(results[2].status).toBe('fulfilled')
    })
  })

  describe('Auth Service Integration', () => {
    it('should get current user successfully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: mockUser }, error: null })

      const user = await authService.getCurrentUser()
      
      expect(user).toEqual(mockUser)
      expect(user).toHaveProperty('id')
      expect(user).toHaveProperty('email')
    })

    it('should sign up user successfully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signUp).mockResolvedValue({ 
        data: { user: mockUser, session: null }, 
        error: null 
      })

      const result = await authService.signUp('test@example.com', 'password123')
      
      expect(result).toEqual({ user: mockUser, session: null })
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should sign in user successfully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
        data: { user: mockUser, session: null }, 
        error: null 
      })

      const result = await authService.signIn('test@example.com', 'password123')
      
      expect(result).toEqual({ user: mockUser, session: null })
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    it('should sign out user successfully', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await expect(authService.signOut()).resolves.toBeUndefined()
      expect(supabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle auth errors', async () => {
      const { supabase } = await import('../supabase')
      vi.mocked(supabase.auth.signIn).mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: new Error('Invalid credentials') 
      })

      await expect(authService.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should set up auth state change listener', async () => {
      const { supabase } = await import('../supabase')
      const mockCallback = vi.fn()
      vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({ 
        data: { subscription: {} } 
      } as any)

      const subscription = authService.onAuthStateChange(mockCallback)
      
      expect(subscription).toHaveProperty('data')
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(mockCallback)
    })
  })

  describe('Real-time Service Integration', () => {
    it('should subscribe to stock changes', async () => {
      const mockCallback = vi.fn()
      const { supabase } = await import('../supabase')
      
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      }
      vi.mocked(supabase.from).mockReturnValue({
        channel: vi.fn(() => mockChannel)
      } as any)

      const unsubscribe = realtimeService.subscribeToStocks('user-1', mockCallback)
      
      expect(typeof unsubscribe).toBe('function')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'stocks',
          filter: 'user_id=eq.user-1'
        }),
        expect.any(Function)
      )
    })

    it('should subscribe to target portfolio changes', async () => {
      const mockCallback = vi.fn()
      const { supabase } = await import('../supabase')
      
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn()
        }))
      }
      vi.mocked(supabase.from).mockReturnValue({
        channel: vi.fn(() => mockChannel)
      } as any)

      const unsubscribe = realtimeService.subscribeToTargetPortfolios('user-1', mockCallback)
      
      expect(typeof unsubscribe).toBe('function')
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'target_portfolios',
          filter: 'user_id=eq.user-1'
        }),
        expect.any(Function)
      )
    })

    it('should handle real-time events correctly', async () => {
      const mockCallback = vi.fn()
      const { supabase } = await import('../supabase')
      
      let eventHandler: any
      const mockChannel = {
        on: vi.fn((_, __, handler) => {
          eventHandler = handler
          return { subscribe: vi.fn() }
        })
      }
      vi.mocked(supabase.from).mockReturnValue({
        channel: vi.fn(() => mockChannel)
      } as any)

      realtimeService.subscribeToStocks('user-1', mockCallback)
      
      // Simulate INSERT event
      eventHandler({
        eventType: 'INSERT',
        new: mockStocks[0],
        old: null
      })
      
      expect(mockCallback).toHaveBeenCalledWith({
        eventType: 'INSERT',
        new: mockStocks[0],
        old: null
      })
    })

    it('should handle unsubscribe correctly', async () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = vi.fn()
      const { supabase } = await import('../supabase')
      
      const mockChannel = {
        on: vi.fn(() => ({
          subscribe: vi.fn(),
          unsubscribe: mockUnsubscribe
        }))
      }
      vi.mocked(supabase.from).mockReturnValue({
        channel: vi.fn(() => mockChannel)
      } as any)

      const unsubscribe = realtimeService.subscribeToStocks('user-1', mockCallback)
      unsubscribe()
      
      expect(mockUnsubscribe).toHaveBeenCalled()
    })
  })

  describe('Cross-Service Integration', () => {
    it('should handle user authentication and data fetching flow', async () => {
      const { supabase } = await import('../supabase')
      
      // Mock auth success
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
        data: { user: mockUser, session: null }, 
        error: null 
      })
      
      // Mock data fetching
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockStocks, error: null }))
          }))
        }))
      } as any)

      // Sign in user
      const authResult = await authService.signIn('test@example.com', 'password123')
      expect(authResult.user).toEqual(mockUser)

      // Fetch user's stocks
      const stocks = await stockService.getStocks()
      expect(stocks).toEqual(mockStocks)
    })

    it('should handle portfolio creation and stock integration', async () => {
      // First create stocks
      const stock1 = await stockService.createStock({
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00
      })

      // Then create target portfolio using those stocks
      const portfolio = await targetPortfolioService.createTargetPortfolio({
        name: 'Tech Portfolio',
        allocations: {
          description: 'Technology focused portfolio',
          stocks: [
            { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 100 }
          ],
          total_weight: 100
        }
      })

      expect(stock1).toEqual(mockStocks[0])
      expect(portfolio).toEqual(mockTargetPortfolio)
      expect(portfolio.allocations.stocks[0].stock_name).toBe('Apple Inc.')
    })

    it('should handle real-time updates across services', async () => {
      const stockCallback = vi.fn()
      const portfolioCallback = vi.fn()

      // Subscribe to both stock and portfolio updates
      const stockUnsubscribe = realtimeService.subscribeToStocks('user-1', stockCallback)
      const portfolioUnsubscribe = realtimeService.subscribeToTargetPortfolios('user-1', portfolioCallback)

      expect(typeof stockUnsubscribe).toBe('function')
      expect(typeof portfolioUnsubscribe).toBe('function')

      // Clean up
      stockUnsubscribe()
      portfolioUnsubscribe()
    })

    it('should handle service errors gracefully', async () => {
      const { supabase } = await import('../supabase')
      
      // Mock auth failure
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: new Error('Authentication failed') 
      })

      await expect(authService.signIn('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Authentication failed')

      // Subsequent data operations should also fail gracefully
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: new Error('Unauthorized') }))
          }))
        }))
      } as any)

      await expect(stockService.getStocks()).rejects.toThrow('Unauthorized')
    })
  })
})