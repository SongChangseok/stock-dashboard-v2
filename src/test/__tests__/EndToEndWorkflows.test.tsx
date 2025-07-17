import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import App from '../../App'
import { 
  renderApp,
  setupServiceMocks,
  mockUser,
  mockStocks,
  mockTargetPortfolio,
  waitForLoadingToFinish,
  fillStockForm,
  expectStockToBeDisplayed,
  expectPortfolioSummaryToBeDisplayed
} from '../integration-utils'

// Setup mocks
setupServiceMocks()

describe('End-to-End Workflow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Complete User Journey: Authentication to Portfolio Management', () => {
    it('should handle complete user workflow from login to portfolio creation', async () => {
      const { user } = renderApp(<App />)

      // Step 1: User sees login page
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeTruthy()
      })

      // Step 2: User logs in
      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const signInButton = screen.getByText('Sign In')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Step 3: User is redirected to dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      // Step 4: User sees their portfolio
      await waitForLoadingToFinish()
      expectPortfolioSummaryToBeDisplayed(document.body)
      expectStockToBeDisplayed('Apple Inc.', document.body)

      // Step 5: User adds a new stock
      const addStockButton = screen.getByText('Add Stock')
      await user.click(addStockButton)

      await fillStockForm(user, {
        stock_name: 'Google Inc.',
        ticker: 'GOOGL',
        quantity: 2,
        purchase_price: 2500.00,
        current_price: 2600.00
      })

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      // Step 6: User navigates to target portfolio page
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      await waitForLoadingToFinish()

      // Step 7: User creates a target portfolio
      const createPortfolioButton = screen.getByText('Create Portfolio')
      await user.click(createPortfolioButton)

      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'My Strategy')

      const stockSelect = screen.getByLabelText('Select Stock')
      await user.selectOptions(stockSelect, 'Apple Inc.')

      const weightInput = screen.getByLabelText('Target Weight (%)')
      await user.type(weightInput, '60')

      const addStockButton2 = screen.getByText('Add Stock')
      await user.click(addStockButton2)

      // Add second stock
      const stockSelect2 = screen.getAllByLabelText('Select Stock')[1]
      await user.selectOptions(stockSelect2, 'Google Inc.')

      const weightInput2 = screen.getAllByLabelText('Target Weight (%)')[1]
      await user.type(weightInput2, '40')

      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      // Step 8: User compares portfolio
      const compareButton = screen.getByText('Compare')
      await user.click(compareButton)

      await waitForLoadingToFinish()

      // Step 9: User sees comparison view
      expect(screen.getByText('Portfolio Comparison')).toBeTruthy()
      expect(screen.getByText('Current Portfolio')).toBeTruthy()
      expect(screen.getByText('Target Portfolio')).toBeTruthy()

      // Verify complete workflow
      const { stockService } = await import('../../services/stockService')
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      const { authService } = await import('../../services/database')

      expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123')
      expect(stockService.createStock).toHaveBeenCalled()
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalled()
    })

    it('should handle user journey with error recovery', async () => {
      const { user } = renderApp(<App />)

      // Step 1: Initial login fails
      const { authService } = await import('../../services/database')
      vi.mocked(authService.signIn).mockRejectedValueOnce(new Error('Invalid credentials'))

      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeTruthy()
      })

      const emailInput = screen.getByLabelText('Email')
      const passwordInput = screen.getByLabelText('Password')
      const signInButton = screen.getByText('Sign In')

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(signInButton)

      // Step 2: Error is displayed
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeTruthy()
      })

      // Step 3: User retries with correct credentials
      vi.mocked(authService.signIn).mockResolvedValueOnce({ user: mockUser, session: null })

      await user.clear(passwordInput)
      await user.type(passwordInput, 'password123')
      await user.click(signInButton)

      // Step 4: Success - user reaches dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      // Step 5: Stock operations fail and recover
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.getStocks).mockRejectedValueOnce(new Error('Network error'))

      await waitForLoadingToFinish()

      // Should show error state
      expect(screen.getByText('Network error')).toBeTruthy()

      // Retry should work
      vi.mocked(stockService.getStocks).mockResolvedValueOnce(mockStocks)
      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      await waitForLoadingToFinish()

      // Should show data
      expectStockToBeDisplayed('Apple Inc.', document.body)
    })
  })

  describe('Portfolio Management Workflow', () => {
    it('should handle complete portfolio creation and management workflow', async () => {
      const { user } = renderApp(<App />)

      // Mock authenticated state
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      // Navigate to dashboard
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // Step 1: Create multiple stocks
      const stocksToCreate = [
        { stock_name: 'Tesla Inc.', ticker: 'TSLA', quantity: 5, purchase_price: 200.00, current_price: 250.00 },
        { stock_name: 'Netflix Inc.', ticker: 'NFLX', quantity: 3, purchase_price: 400.00, current_price: 450.00 },
        { stock_name: 'Amazon Inc.', ticker: 'AMZN', quantity: 2, purchase_price: 3000.00, current_price: 3200.00 }
      ]

      for (const stock of stocksToCreate) {
        const addButton = screen.getByText('Add Stock')
        await user.click(addButton)

        await fillStockForm(user, stock)

        const saveButton = screen.getByText('Save')
        await user.click(saveButton)

        await waitForLoadingToFinish()
      }

      // Step 2: Navigate to target portfolio
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      await waitForLoadingToFinish()

      // Step 3: Create balanced portfolio
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Balanced Growth')

      const descInput = screen.getByLabelText('Description')
      await user.type(descInput, 'A balanced growth portfolio')

      // Add multiple stocks with different weights
      const stockAllocations = [
        { stock: 'Apple Inc.', weight: '40' },
        { stock: 'Tesla Inc.', weight: '30' },
        { stock: 'Netflix Inc.', weight: '20' },
        { stock: 'Amazon Inc.', weight: '10' }
      ]

      for (let i = 0; i < stockAllocations.length; i++) {
        if (i > 0) {
          const addStockButton = screen.getByText('Add Stock')
          await user.click(addStockButton)
        }

        const stockSelect = screen.getAllByLabelText('Select Stock')[i]
        await user.selectOptions(stockSelect, stockAllocations[i].stock)

        const weightInput = screen.getAllByLabelText('Target Weight (%)')[i]
        await user.type(weightInput, stockAllocations[i].weight)
      }

      const createPortfolioButton = screen.getByText('Create Portfolio')
      await user.click(createPortfolioButton)

      // Step 4: Verify portfolio creation
      await waitForLoadingToFinish()
      expect(screen.getByText('Balanced Growth')).toBeTruthy()

      // Step 5: Edit portfolio
      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      const nameInputEdit = screen.getByLabelText('Portfolio Name')
      await user.clear(nameInputEdit)
      await user.type(nameInputEdit, 'Updated Balanced Growth')

      const updateButton = screen.getByText('Update Portfolio')
      await user.click(updateButton)

      // Step 6: Compare portfolio
      const compareButton = screen.getByText('Compare')
      await user.click(compareButton)

      await waitForLoadingToFinish()

      // Should show comparison view
      expect(screen.getByText('Portfolio Comparison')).toBeTruthy()
      expect(screen.getByText('Rebalancing Recommendations')).toBeTruthy()

      // Verify all services were called
      const { stockService } = await import('../../services/stockService')
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')

      expect(stockService.createStock).toHaveBeenCalledTimes(3)
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalled()
      expect(targetPortfolioService.updateTargetPortfolio).toHaveBeenCalled()
    })

    it('should handle portfolio rebalancing workflow', async () => {
      const { user } = renderApp(<App />)

      // Mock authenticated state with existing data
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      // Navigate to comparison page
      await waitFor(() => {
        expect(screen.getByText('Portfolio Comparison')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // Step 1: Select target portfolio
      const portfolioSelect = screen.getByLabelText('Select Target Portfolio')
      await user.selectOptions(portfolioSelect, 'Balanced Portfolio')

      // Step 2: View rebalancing recommendations
      expect(screen.getByText('Rebalancing Recommendations')).toBeTruthy()
      expect(screen.getByText('Buy')).toBeTruthy()
      expect(screen.getByText('Sell')).toBeTruthy()

      // Step 3: Use rebalancing calculator
      const calculatorButton = screen.getByText('Advanced Calculator')
      await user.click(calculatorButton)

      // Configure rebalancing options
      const minimumTradeInput = screen.getByLabelText('Minimum Trade Amount')
      await user.type(minimumTradeInput, '100')

      const commissionInput = screen.getByLabelText('Commission per Trade')
      await user.type(commissionInput, '1.00')

      const calculateButton = screen.getByText('Calculate Rebalancing')
      await user.click(calculateButton)

      // Step 4: Review recommendations
      expect(screen.getByText('Trading Guide')).toBeTruthy()
      expect(screen.getByText('Total Trades')).toBeTruthy()
      expect(screen.getByText('Total Commission')).toBeTruthy()

      // Step 5: Simulate rebalancing
      const simulateButton = screen.getByText('Simulate Rebalancing')
      await user.click(simulateButton)

      expect(screen.getByText('Before Rebalancing')).toBeTruthy()
      expect(screen.getByText('After Rebalancing')).toBeTruthy()

      // Verify rebalancing calculations
      const { rebalancingService } = await import('../../services/rebalancingService')
      expect(rebalancingService.calculateRebalancing).toHaveBeenCalled()
    })
  })

  describe('Error Handling and Recovery Workflows', () => {
    it('should handle network failures and recovery across multiple pages', async () => {
      const { user } = renderApp(<App />)

      // Mock authenticated state
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      // Start on dashboard with network error
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.getStocks).mockRejectedValue(new Error('Network error'))

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // Should show error state
      expect(screen.getByText('Network error')).toBeTruthy()

      // Navigate to target portfolio - should also show error
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      vi.mocked(targetPortfolioService.getTargetPortfolios).mockRejectedValue(new Error('Network error'))

      await waitForLoadingToFinish()

      expect(screen.getByText('Network error')).toBeTruthy()

      // Simulate network recovery
      vi.mocked(stockService.getStocks).mockResolvedValue(mockStocks)
      vi.mocked(targetPortfolioService.getTargetPortfolios).mockResolvedValue([mockTargetPortfolio])

      // Retry should work
      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      await waitForLoadingToFinish()

      // Should show data
      expect(screen.getByText('Balanced Portfolio')).toBeTruthy()

      // Navigate back to dashboard - should also recover
      const dashboardNav = screen.getByText('Dashboard')
      await user.click(dashboardNav)

      await waitForLoadingToFinish()

      expectStockToBeDisplayed('Apple Inc.', document.body)
    })

    it('should handle partial failures in multi-step operations', async () => {
      const { user } = renderApp(<App />)

      // Mock authenticated state
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // Step 1: Create stock successfully
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.createStock).mockResolvedValue(mockStocks[0])

      const addButton = screen.getByText('Add Stock')
      await user.click(addButton)

      await fillStockForm(user, {
        stock_name: 'Tesla Inc.',
        ticker: 'TSLA',
        quantity: 5,
        purchase_price: 200.00,
        current_price: 250.00
      })

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      await waitForLoadingToFinish()

      // Step 2: Create target portfolio fails
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      vi.mocked(targetPortfolioService.createTargetPortfolio).mockRejectedValue(new Error('Validation error'))

      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Test Portfolio')

      const createPortfolioButton = screen.getByText('Create Portfolio')
      await user.click(createPortfolioButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText('Failed to create portfolio')).toBeTruthy()
      })

      // Step 3: Retry should work
      vi.mocked(targetPortfolioService.createTargetPortfolio).mockResolvedValue(mockTargetPortfolio)

      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      await waitForLoadingToFinish()

      // Should show success
      expect(screen.getByText('Balanced Portfolio')).toBeTruthy()

      // Verify operations
      expect(stockService.createStock).toHaveBeenCalledTimes(1)
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalledTimes(2) // Once failed, once succeeded
    })
  })

  describe('Real-time Updates Workflow', () => {
    it('should handle real-time updates across multiple components', async () => {
      const { user } = renderApp(<App />)

      // Mock authenticated state
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // Simulate real-time stock update
      const { realtimeService } = await import('../../services/realtimeService')
      const stockCallback = vi.mocked(realtimeService.subscribeToStocks).mock.calls[0][1]

      const updatedStock = { ...mockStocks[0], current_price: 200.00 }
      stockCallback({
        eventType: 'UPDATE',
        new: updatedStock,
        old: mockStocks[0]
      })

      // Should update dashboard
      await waitFor(() => {
        expect(screen.getByText('$200.00')).toBeTruthy()
      })

      // Navigate to target portfolio
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      await waitForLoadingToFinish()

      // Simulate real-time portfolio update
      const portfolioCallback = vi.mocked(realtimeService.subscribeToTargetPortfolios).mock.calls[0][1]

      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }
      portfolioCallback({
        eventType: 'UPDATE',
        new: updatedPortfolio,
        old: mockTargetPortfolio
      })

      // Should update target portfolio page
      await waitFor(() => {
        expect(screen.getByText('Updated Portfolio')).toBeTruthy()
      })

      // Navigate to comparison page
      const compareButton = screen.getByText('Compare')
      await user.click(compareButton)

      await waitForLoadingToFinish()

      // Both updates should be reflected in comparison
      expect(screen.getByText('$200.00')).toBeTruthy()
      expect(screen.getByText('Updated Portfolio')).toBeTruthy()
    })
  })

  describe('Mobile Responsive Workflow', () => {
    it('should handle mobile-specific interactions', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 })
      Object.defineProperty(window, 'innerHeight', { value: 667 })
      
      const { user } = renderApp(<App />)

      // Mock authenticated state
      const { authService } = await import('../../services/database')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeTruthy()
      })

      await waitForLoadingToFinish()

      // On mobile, FAB should be hidden
      const fab = document.querySelector('[data-testid="floating-action-button"]')
      expect(fab?.classList.contains('hidden')).toBe(true)

      // Mobile navigation should work
      const mobileMenuButton = screen.getByLabelText('Open menu')
      await user.click(mobileMenuButton)

      expect(screen.getByText('Target Portfolio')).toBeTruthy()
      expect(screen.getByText('Portfolio Comparison')).toBeTruthy()

      // Navigation should work
      const targetPortfolioNav = screen.getByText('Target Portfolio')
      await user.click(targetPortfolioNav)

      await waitForLoadingToFinish()

      // Mobile-specific layout should be applied
      const portfolioList = document.querySelector('[data-testid="portfolio-list"]')
      expect(portfolioList?.classList.contains('grid')).toBe(true)
      expect(portfolioList?.classList.contains('md:grid-cols-2')).toBe(true)

      // Touch interactions should work
      const portfolioCard = screen.getByText('Balanced Portfolio')
      await user.click(portfolioCard)

      // Should show mobile-optimized view
      expect(screen.getByText('Portfolio Details')).toBeTruthy()
    })
  })
})