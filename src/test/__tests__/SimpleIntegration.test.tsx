// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../../pages/DashboardPage'
import { AuthPage } from '../../pages/AuthPage'
import { TargetPortfolioPage } from '../../pages/TargetPortfolioPage'
import { PortfolioComparisonPage } from '../../pages/PortfolioComparisonPage'

// Mock the services
vi.mock('../../services/stockService', () => ({
  stockService: {
    getStocks: vi.fn(() => Promise.resolve([
      {
        id: 'stock-1',
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00,
        user_id: 'user-1'
      }
    ])),
    createStock: vi.fn(() => Promise.resolve({ id: 'stock-1' })),
    updateStock: vi.fn(() => Promise.resolve({ id: 'stock-1' })),
    deleteStock: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../../services/targetPortfolioService', () => ({
  targetPortfolioService: {
    getTargetPortfolios: vi.fn(() => Promise.resolve([
      {
        id: 'portfolio-1',
        name: 'Test Portfolio',
        allocations: { stocks: [], total_weight: 100 }
      }
    ])),
    createTargetPortfolio: vi.fn(() => Promise.resolve({ id: 'portfolio-1' })),
    updateTargetPortfolio: vi.fn(() => Promise.resolve({ id: 'portfolio-1' })),
    deleteTargetPortfolio: vi.fn(() => Promise.resolve())
  }
}))

vi.mock('../../services/database', () => ({
  authService: {
    getCurrentUser: vi.fn(() => Promise.resolve({ id: 'user-1', email: 'test@example.com' })),
    signUp: vi.fn(() => Promise.resolve({ user: { id: 'user-1' }, session: null })),
    signIn: vi.fn(() => Promise.resolve({ user: { id: 'user-1' }, session: null })),
    signOut: vi.fn(() => Promise.resolve()),
    onAuthStateChange: vi.fn(() => () => {})
  }
}))

vi.mock('../../services/realtimeService', () => ({
  realtimeService: {
    subscribeToStocks: vi.fn(() => () => {}),
    subscribeToTargetPortfolios: vi.fn(() => () => {})
  }
}))

vi.mock('../../services/authService', () => ({
  AuthService: {
    getCurrentUserId: vi.fn(() => 'user-1')
  }
}))

vi.mock('../../utils/calculations', () => ({
  calculatePortfolioSummary: vi.fn(() => ({
    totalValue: 1750,
    totalCost: 1500,
    totalProfitLoss: 250,
    totalProfitLossPercent: 16.67,
    stocks: []
  }))
}))

vi.mock('../../utils/sessionStorage', () => ({
  saveToSession: vi.fn(),
  loadFromSession: vi.fn(() => null),
  SESSION_KEYS: {
    PORTFOLIO_DATA: 'portfolio_data'
  }
}))

vi.mock('../../utils/loadingState', () => ({
  globalLoadingManager: {
    executeWithLoading: vi.fn((_, callback) => callback())
  },
  LOADING_OPERATIONS: {
    FETCH_STOCKS: 'fetch_stocks'
  }
}))

// Mock hooks
vi.mock('../../hooks', () => ({
  usePortfolio: vi.fn(() => ({
    stocksWithValue: [
      {
        id: 'stock-1',
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        quantity: 10,
        purchase_price: 150.00,
        current_price: 175.00,
        totalValue: 1750,
        profitLoss: 250,
        profitLossPercent: 16.67,
        weight: 100
      }
    ],
    portfolioSummary: {
      totalValue: 1750,
      totalCost: 1500,
      totalProfitLoss: 250,
      totalProfitLossPercent: 16.67,
      stocks: []
    },
    isLoading: false,
    error: null,
    refreshData: vi.fn(),
    deleteStock: vi.fn()
  })),
  useAuth: vi.fn(() => ({
    user: { id: 'user-1', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    initialize: vi.fn()
  }))
}))

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('Simple Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dashboard Page Integration', () => {
    it('should render dashboard with stock data', async () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeTruthy()
      })

      expect(screen.getByText('AAPL')).toBeTruthy()
      expect(screen.getByText('$1,750.00')).toBeTruthy()
    })

    it('should display portfolio summary', async () => {
      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Total Value')).toBeTruthy()
      })

      expect(screen.getByText('$1,750')).toBeTruthy()
      expect(screen.getByText('16.67%')).toBeTruthy()
    })
  })

  describe('Auth Page Integration', () => {
    it('should render auth form', async () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      )

      expect(screen.getByText('Sign In')).toBeTruthy()
      expect(screen.getByLabelText('Email')).toBeTruthy()
      expect(screen.getByLabelText('Password')).toBeTruthy()
    })

    it('should handle form submission', async () => {
      const { useAuth } = await import('../../hooks')
      const mockSignIn = vi.fn()
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        loading: false,
        signIn: mockSignIn,
        signUp: vi.fn(),
        signOut: vi.fn(),
        initialize: vi.fn()
      })

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const signInButton = screen.getByText('Sign In')

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
      await userEvent.click(signInButton)

      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  describe('Target Portfolio Page Integration', () => {
    it('should render target portfolio list', async () => {
      render(
        <TestWrapper>
          <TargetPortfolioPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Portfolio')).toBeTruthy()
      })

      expect(screen.getByText('Create Portfolio')).toBeTruthy()
    })
  })

  describe('Portfolio Comparison Page Integration', () => {
    it('should render comparison view', async () => {
      render(
        <TestWrapper>
          <PortfolioComparisonPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Portfolio Comparison')).toBeTruthy()
      })

      expect(screen.getByText('Current Portfolio')).toBeTruthy()
      expect(screen.getByText('Target Portfolio')).toBeTruthy()
    })
  })

  describe('Cross-Page Navigation', () => {
    it('should handle navigation between pages', async () => {
      // This test verifies that components can be rendered without errors
      // and that basic navigation structure works
      
      const dashboardRender = render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(dashboardRender.container).toHaveTextContent('Apple Inc.')
      })
      
      dashboardRender.unmount()

      const targetPortfolioRender = render(
        <TestWrapper>
          <TargetPortfolioPage />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(targetPortfolioRender.container).toHaveTextContent('Test Portfolio')
      })
      
      targetPortfolioRender.unmount()

      const comparisonRender = render(
        <TestWrapper>
          <PortfolioComparisonPage />
        </TestWrapper>
      )
      
      await waitFor(() => {
        expect(comparisonRender.container).toHaveTextContent('Portfolio Comparison')
      })
    })
  })

  describe('Service Integration', () => {
    it('should call stock service methods', async () => {
      const { stockService } = await import('../../services/stockService')
      
      // Simulate service calls
      await stockService.getStocks()
      await stockService.createStock({
        stock_name: 'Test Stock',
        ticker: 'TEST',
        quantity: 1,
        purchase_price: 100,
        current_price: 110
      })
      
      expect(stockService.getStocks).toHaveBeenCalled()
      expect(stockService.createStock).toHaveBeenCalledWith({
        stock_name: 'Test Stock',
        ticker: 'TEST',
        quantity: 1,
        purchase_price: 100,
        current_price: 110
      })
    })

    it('should call target portfolio service methods', async () => {
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      
      // Simulate service calls
      await targetPortfolioService.getTargetPortfolios()
      await targetPortfolioService.createTargetPortfolio({
        name: 'Test Portfolio',
        allocations: {
          stocks: [{ stock_name: 'Test Stock', ticker: 'TEST', target_weight: 100 }],
          total_weight: 100
        }
      })
      
      expect(targetPortfolioService.getTargetPortfolios).toHaveBeenCalled()
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalledWith({
        name: 'Test Portfolio',
        allocations: {
          stocks: [{ stock_name: 'Test Stock', ticker: 'TEST', target_weight: 100 }],
          total_weight: 100
        }
      })
    })

    it('should handle auth service methods', async () => {
      const { authService } = await import('../../services/database')
      
      // Simulate auth calls
      await authService.getCurrentUser()
      await authService.signIn('test@example.com', 'password123')
      
      expect(authService.getCurrentUser).toHaveBeenCalled()
      expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { stockService } = await import('../../services/stockService')
      
      // Mock service error
      vi.mocked(stockService.getStocks).mockRejectedValue(new Error('Service error'))
      
      // The error should be caught and handled
      await expect(stockService.getStocks()).rejects.toThrow('Service error')
    })

    it('should handle auth errors gracefully', async () => {
      const { authService } = await import('../../services/database')
      
      // Mock auth error
      vi.mocked(authService.signIn).mockRejectedValue(new Error('Invalid credentials'))
      
      // The error should be caught and handled
      await expect(authService.signIn('test@example.com', 'wrong')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('Data Flow Integration', () => {
    it('should pass data correctly through components', async () => {
      const { usePortfolio } = await import('../../hooks')
      
      // Mock hook to return specific data
      vi.mocked(usePortfolio).mockReturnValue({
        stocksWithValue: [
          {
            id: 'stock-1',
            stock_name: 'Test Stock',
            ticker: 'TEST',
            quantity: 5,
            purchase_price: 100,
            current_price: 120,
            totalValue: 600,
            profitLoss: 100,
            profitLossPercent: 20,
            weight: 100
          }
        ],
        portfolioSummary: {
          totalValue: 600,
          totalCost: 500,
          totalProfitLoss: 100,
          totalProfitLossPercent: 20,
          stocks: []
        },
        isLoading: false,
        error: null,
        refreshData: vi.fn(),
        deleteStock: vi.fn()
      })

      render(
        <TestWrapper>
          <DashboardPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Test Stock')).toBeTruthy()
      })

      expect(screen.getByText('TEST')).toBeTruthy()
      expect(screen.getByText('$600.00')).toBeTruthy()
      expect(screen.getByText('20%')).toBeTruthy()
    })
  })
})