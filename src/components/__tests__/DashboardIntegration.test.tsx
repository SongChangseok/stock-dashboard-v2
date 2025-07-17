import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { DashboardPage } from '../../pages/DashboardPage'
import { 
  renderWithRouter,
  setupServiceMocks,
  mockStocks,
  waitForLoadingToFinish,
  fillStockForm,
  expectStockToBeDisplayed,
  expectPortfolioSummaryToBeDisplayed
} from '../../test/integration-utils'

// Setup mocks
setupServiceMocks()

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Portfolio Display', () => {
    it('should render portfolio summary and stock list', async () => {
      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Check portfolio summary is displayed
      expectPortfolioSummaryToBeDisplayed(container)

      // Check stocks are displayed
      expectStockToBeDisplayed('Apple Inc.', container)
      expectStockToBeDisplayed('Microsoft Corp.', container)
      
      // Check chart is rendered
      expect(container.querySelector('[data-testid="portfolio-chart"]')).toBeTruthy()
    })

    it('should handle loading states correctly', async () => {
      const { container } = renderWithRouter(<DashboardPage />)

      // Should show loading initially
      expect(container.querySelector('[data-testid="skeleton-loader"]')).toBeTruthy()

      await waitForLoadingToFinish()

      // Loading should be gone
      expect(container.querySelector('[data-testid="skeleton-loader"]')).toBeFalsy()
    })

    it('should handle error states gracefully', async () => {
      // Mock service to return error
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.getStocks).mockRejectedValue(new Error('Network error'))

      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Should show error message
      expect(container).toHaveTextContent('Network error')
      
      // Should show retry button
      expect(screen.getByText('Retry')).toBeTruthy()
    })
  })

  describe('Stock Management', () => {
    it('should open stock form when add button is clicked', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Click add button
      const addButton = screen.getByText('Add Stock')
      await user.click(addButton)

      // Form should be visible
      expect(screen.getByText('Add Stock')).toBeTruthy()
      expect(screen.getByLabelText('Stock Name')).toBeTruthy()
    })

    it('should create a new stock successfully', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Open form
      const addButton = screen.getByText('Add Stock')
      await user.click(addButton)

      // Fill form
      await fillStockForm(user, {
        stock_name: 'Tesla Inc.',
        ticker: 'TSLA',
        quantity: 3,
        purchase_price: 200.00,
        current_price: 250.00
      })

      // Submit form
      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      // Verify service was called
      const { stockService } = await import('../../services/stockService')
      expect(stockService.createStock).toHaveBeenCalledWith({
        stock_name: 'Tesla Inc.',
        ticker: 'TSLA',
        quantity: 3,
        purchase_price: 200.00,
        current_price: 250.00
      })
    })

    it('should edit existing stock successfully', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Click edit button for first stock
      const editButton = screen.getAllByText('Edit')[0]
      await user.click(editButton)

      // Form should be pre-filled
      expect(screen.getByDisplayValue('Apple Inc.')).toBeTruthy()
      expect(screen.getByDisplayValue('AAPL')).toBeTruthy()

      // Update price
      const currentPriceInput = screen.getByLabelText('Current Price')
      await user.clear(currentPriceInput)
      await user.type(currentPriceInput, '180.00')

      // Submit form
      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      // Verify service was called
      const { stockService } = await import('../../services/stockService')
      expect(stockService.updateStock).toHaveBeenCalledWith('stock-1', {
        current_price: 180.00
      })
    })

    it('should delete stock successfully', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Click delete button for first stock
      const deleteButton = screen.getAllByText('Delete')[0]
      await user.click(deleteButton)

      // Confirm deletion
      const confirmButton = screen.getByText('Confirm')
      await user.click(confirmButton)

      // Verify service was called
      const { stockService } = await import('../../services/stockService')
      expect(stockService.deleteStock).toHaveBeenCalledWith('stock-1')
    })
  })

  describe('Data Refresh', () => {
    it('should refresh data when retry button is clicked', async () => {
      // Mock initial error
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.getStocks).mockRejectedValueOnce(new Error('Network error'))

      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Should show error
      expect(screen.getByText('Network error')).toBeTruthy()

      // Mock successful retry
      vi.mocked(stockService.getStocks).mockResolvedValueOnce(mockStocks)

      // Click retry
      const retryButton = screen.getByText('Retry')
      await user.click(retryButton)

      await waitForLoadingToFinish()

      // Should show data
      expectStockToBeDisplayed('Apple Inc.', document.body)
    })

    it('should handle real-time updates', async () => {
      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Simulate real-time stock update
      const { realtimeService } = await import('../../services/realtimeService')
      const mockCallback = vi.mocked(realtimeService.subscribeToStocks).mock.calls[0][1]
      
      // Simulate stock price update
      const updatedStock = { ...mockStocks[0], current_price: 200.00 }
      mockCallback({
        eventType: 'UPDATE',
        new: updatedStock,
        old: mockStocks[0]
      })

      await waitFor(() => {
        expect(container).toHaveTextContent('$200.00')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('should show floating action button on desktop', async () => {
      renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // FAB should be hidden on mobile (hidden md:block class)
      const fab = document.querySelector('[data-testid="floating-action-button"]')
      expect(fab).toBeTruthy()
      expect(fab?.classList.contains('hidden')).toBe(true)
      expect(fab?.classList.contains('md:block')).toBe(true)
    })

    it('should display stock list in responsive layout', async () => {
      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Should have responsive grid classes
      const stockList = container.querySelector('[data-testid="stock-list"]')
      expect(stockList).toBeTruthy()
      
      // Should have mobile-first responsive classes
      expect(stockList?.classList.contains('grid')).toBe(true)
    })
  })

  describe('Portfolio Analytics', () => {
    it('should calculate and display portfolio metrics', async () => {
      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Check total value calculation
      expect(container).toHaveTextContent('$3,350.00')
      
      // Check profit/loss calculation
      expect(container).toHaveTextContent('$350.00')
      expect(container).toHaveTextContent('11.67%')
    })

    it('should update calculations when stock data changes', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Edit stock to change price
      const editButton = screen.getAllByText('Edit')[0]
      await user.click(editButton)

      const currentPriceInput = screen.getByLabelText('Current Price')
      await user.clear(currentPriceInput)
      await user.type(currentPriceInput, '200.00')

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      await waitForLoadingToFinish()

      // Portfolio calculations should update
      const { calculatePortfolioSummary } = await import('../../utils/calculations')
      expect(calculatePortfolioSummary).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.getStocks).mockRejectedValue(new Error('Service unavailable'))

      const { container } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Should show error message
      expect(container).toHaveTextContent('Service unavailable')
      
      // Should not crash the app
      expect(container.querySelector('[data-testid="error-boundary"]')).toBeFalsy()
    })

    it('should handle network errors during stock operations', async () => {
      const { user } = renderWithRouter(<DashboardPage />)

      await waitForLoadingToFinish()

      // Mock create stock to fail
      const { stockService } = await import('../../services/stockService')
      vi.mocked(stockService.createStock).mockRejectedValue(new Error('Network error'))

      // Try to create stock
      const addButton = screen.getByText('Add Stock')
      await user.click(addButton)

      await fillStockForm(user, {
        stock_name: 'Tesla Inc.',
        ticker: 'TSLA',
        quantity: 3,
        purchase_price: 200.00,
        current_price: 250.00
      })

      const saveButton = screen.getByText('Save')
      await user.click(saveButton)

      await waitForLoadingToFinish()

      // Should show error message
      expect(screen.getByText('Failed to create stock')).toBeTruthy()
    })
  })
})