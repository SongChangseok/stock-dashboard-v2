import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { TargetPortfolioPage } from '../../pages/TargetPortfolioPage'
import { 
  renderWithRouter,
  setupServiceMocks,
  mockTargetPortfolio,
  mockStocks,
  waitForLoadingToFinish
} from '../../test/integration-utils'

// Setup mocks
setupServiceMocks()

describe('Target Portfolio Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Portfolio List Display', () => {
    it('should render target portfolio list', async () => {
      const { container } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Check portfolio is displayed
      expect(container).toHaveTextContent('Balanced Portfolio')
      expect(container).toHaveTextContent('A balanced portfolio')
      
      // Check action buttons
      expect(screen.getByText('Edit')).toBeTruthy()
      expect(screen.getByText('Delete')).toBeTruthy()
      expect(screen.getByText('Compare')).toBeTruthy()
    })

    it('should handle empty portfolio list', async () => {
      // Mock empty response
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      vi.mocked(targetPortfolioService.getTargetPortfolios).mockResolvedValue([])

      const { container } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Should show empty state
      expect(container).toHaveTextContent('No target portfolios found')
      expect(screen.getByText('Create Portfolio')).toBeTruthy()
    })

    it('should show loading state initially', async () => {
      const { container } = renderWithRouter(<TargetPortfolioPage />)

      // Should show loading skeleton
      expect(container.querySelector('[data-testid="skeleton-loader"]')).toBeTruthy()

      await waitForLoadingToFinish()

      // Loading should be gone
      expect(container.querySelector('[data-testid="skeleton-loader"]')).toBeFalsy()
    })
  })

  describe('Portfolio Creation', () => {
    it('should open create portfolio form', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click create button
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      // Form should be visible
      expect(screen.getByText('Create Target Portfolio')).toBeTruthy()
      expect(screen.getByLabelText('Portfolio Name')).toBeTruthy()
      expect(screen.getByLabelText('Description')).toBeTruthy()
    })

    it('should create new portfolio successfully', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Open form
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      // Fill form
      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Growth Portfolio')

      const descriptionInput = screen.getByLabelText('Description')
      await user.type(descriptionInput, 'High growth focused portfolio')

      // Add stock allocation
      const stockSelect = screen.getByLabelText('Select Stock')
      await user.selectOptions(stockSelect, 'Apple Inc.')

      const weightInput = screen.getByLabelText('Target Weight (%)')
      await user.type(weightInput, '100')

      // Submit form
      const saveButton = screen.getByText('Create Portfolio')
      await user.click(saveButton)

      // Verify service was called
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalledWith({
        name: 'Growth Portfolio',
        allocations: {
          description: 'High growth focused portfolio',
          stocks: [
            { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 100 }
          ],
          total_weight: 100
        }
      })
    })

    it('should validate portfolio weight allocation', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Open form
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      // Fill form with invalid weights
      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Invalid Portfolio')

      // Add stock with weight > 100%
      const stockSelect = screen.getByLabelText('Select Stock')
      await user.selectOptions(stockSelect, 'Apple Inc.')

      const weightInput = screen.getByLabelText('Target Weight (%)')
      await user.type(weightInput, '150')

      // Try to submit
      const saveButton = screen.getByText('Create Portfolio')
      await user.click(saveButton)

      // Should show validation error
      expect(screen.getByText('Total weight must equal 100%')).toBeTruthy()
    })

    it('should handle multiple stock allocations', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Open form
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      // Fill basic info
      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Balanced Portfolio')

      // Add first stock
      const addStockButton = screen.getByText('Add Stock')
      await user.click(addStockButton)

      const stockSelect1 = screen.getAllByLabelText('Select Stock')[0]
      await user.selectOptions(stockSelect1, 'Apple Inc.')

      const weightInput1 = screen.getAllByLabelText('Target Weight (%)')[0]
      await user.type(weightInput1, '60')

      // Add second stock
      await user.click(addStockButton)

      const stockSelect2 = screen.getAllByLabelText('Select Stock')[1]
      await user.selectOptions(stockSelect2, 'Microsoft Corp.')

      const weightInput2 = screen.getAllByLabelText('Target Weight (%)')[1]
      await user.type(weightInput2, '40')

      // Submit form
      const saveButton = screen.getByText('Create Portfolio')
      await user.click(saveButton)

      // Verify service was called with multiple stocks
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalledWith({
        name: 'Balanced Portfolio',
        allocations: {
          description: '',
          stocks: [
            { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
            { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
          ],
          total_weight: 100
        }
      })
    })
  })

  describe('Portfolio Editing', () => {
    it('should open edit portfolio form', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click edit button
      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      // Form should be pre-filled
      expect(screen.getByDisplayValue('Balanced Portfolio')).toBeTruthy()
      expect(screen.getByDisplayValue('A balanced portfolio')).toBeTruthy()
    })

    it('should update portfolio successfully', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click edit button
      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      // Update name
      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Portfolio')

      // Submit form
      const saveButton = screen.getByText('Update Portfolio')
      await user.click(saveButton)

      // Verify service was called
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.updateTargetPortfolio).toHaveBeenCalledWith({
        id: 'portfolio-1',
        name: 'Updated Portfolio',
        allocations: mockTargetPortfolio.allocations
      })
    })

    it('should handle weight rebalancing', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click edit button
      const editButton = screen.getByText('Edit')
      await user.click(editButton)

      // Update weight allocation
      const weightInput = screen.getAllByLabelText('Target Weight (%)')[0]
      await user.clear(weightInput)
      await user.type(weightInput, '70')

      // Auto-balance should update other weights
      const autoBalanceButton = screen.getByText('Auto Balance')
      await user.click(autoBalanceButton)

      // Second stock should be updated to 30%
      const secondWeightInput = screen.getAllByLabelText('Target Weight (%)')[1]
      expect(secondWeightInput).toHaveValue('30')
    })
  })

  describe('Portfolio Deletion', () => {
    it('should delete portfolio successfully', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click delete button
      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      // Confirm deletion
      const confirmButton = screen.getByText('Confirm Delete')
      await user.click(confirmButton)

      // Verify service was called
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.deleteTargetPortfolio).toHaveBeenCalledWith('portfolio-1')
    })

    it('should cancel deletion', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click delete button
      const deleteButton = screen.getByText('Delete')
      await user.click(deleteButton)

      // Cancel deletion
      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      // Service should not be called
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.deleteTargetPortfolio).not.toHaveBeenCalled()

      // Portfolio should still be visible
      expect(screen.getByText('Balanced Portfolio')).toBeTruthy()
    })
  })

  describe('Portfolio Comparison', () => {
    it('should navigate to comparison page', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click compare button
      const compareButton = screen.getByText('Compare')
      await user.click(compareButton)

      // Should navigate to comparison page
      expect(window.location.pathname).toBe('/portfolio-comparison')
    })

    it('should pass selected portfolio to comparison', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click compare button
      const compareButton = screen.getByText('Compare')
      await user.click(compareButton)

      // Session storage should be updated
      const { saveToSession } = await import('../../utils/sessionStorage')
      expect(saveToSession).toHaveBeenCalledWith('selected_target_portfolio', mockTargetPortfolio)
    })
  })

  describe('Portfolio Duplication', () => {
    it('should duplicate portfolio successfully', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Click duplicate button
      const duplicateButton = screen.getByText('Duplicate')
      await user.click(duplicateButton)

      // Should open form with duplicated data
      expect(screen.getByDisplayValue('Balanced Portfolio (Copy)')).toBeTruthy()
      expect(screen.getByDisplayValue('A balanced portfolio')).toBeTruthy()

      // Submit duplication
      const saveButton = screen.getByText('Create Portfolio')
      await user.click(saveButton)

      // Verify service was called
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      expect(targetPortfolioService.createTargetPortfolio).toHaveBeenCalledWith({
        name: 'Balanced Portfolio (Copy)',
        allocations: mockTargetPortfolio.allocations
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      vi.mocked(targetPortfolioService.getTargetPortfolios).mockRejectedValue(new Error('Service error'))

      const { container } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Should show error message
      expect(container).toHaveTextContent('Service error')
      
      // Should show retry button
      expect(screen.getByText('Retry')).toBeTruthy()
    })

    it('should handle creation errors', async () => {
      const { user } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Mock create to fail
      const { targetPortfolioService } = await import('../../services/targetPortfolioService')
      vi.mocked(targetPortfolioService.createTargetPortfolio).mockRejectedValue(new Error('Creation failed'))

      // Try to create portfolio
      const createButton = screen.getByText('Create Portfolio')
      await user.click(createButton)

      const nameInput = screen.getByLabelText('Portfolio Name')
      await user.type(nameInput, 'Test Portfolio')

      const saveButton = screen.getByText('Create Portfolio')
      await user.click(saveButton)

      await waitForLoadingToFinish()

      // Should show error message
      expect(screen.getByText('Failed to create portfolio')).toBeTruthy()
    })
  })

  describe('Real-time Updates', () => {
    it('should handle real-time portfolio updates', async () => {
      const { container } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Simulate real-time portfolio update
      const { realtimeService } = await import('../../services/realtimeService')
      const mockCallback = vi.mocked(realtimeService.subscribeToTargetPortfolios).mock.calls[0][1]
      
      // Simulate portfolio update
      const updatedPortfolio = { ...mockTargetPortfolio, name: 'Updated Portfolio' }
      mockCallback({
        eventType: 'UPDATE',
        new: updatedPortfolio,
        old: mockTargetPortfolio
      })

      await waitFor(() => {
        expect(container).toHaveTextContent('Updated Portfolio')
      })
    })

    it('should handle real-time portfolio deletion', async () => {
      const { container } = renderWithRouter(<TargetPortfolioPage />)

      await waitForLoadingToFinish()

      // Simulate real-time portfolio deletion
      const { realtimeService } = await import('../../services/realtimeService')
      const mockCallback = vi.mocked(realtimeService.subscribeToTargetPortfolios).mock.calls[0][1]
      
      // Simulate portfolio deletion
      mockCallback({
        eventType: 'DELETE',
        new: null,
        old: mockTargetPortfolio
      })

      await waitFor(() => {
        expect(container).toHaveTextContent('No target portfolios found')
      })
    })
  })
})