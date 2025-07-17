import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import { StockList } from '../StockList'
import { mockMatchMedia } from '../../test/test-utils'
import type { StockWithValue } from '../../types/database'

// Mock hooks
vi.mock('../../hooks', () => ({
  useTouchButton: vi.fn(() => ({ ref: { current: null } })),
  useTouchList: vi.fn(() => ({ ref: { current: null } })),
  useAccessibleTable: vi.fn(() => ({
    tableProps: {
      role: 'table',
      'aria-label': 'Stock holdings table'
    },
    getColumnHeaderProps: vi.fn(() => ({
      role: 'columnheader',
      'aria-sort': 'none',
      tabIndex: 0
    })),
    getRowProps: vi.fn((index) => ({
      role: 'row',
      'aria-rowindex': index + 1
    }))
  })),
  useAnnouncer: vi.fn(() => ({ announce: vi.fn() })),
}))

// Mock utilities
vi.mock('../../utils/accessibility', () => ({
  getAriaLabels: {
    button: {
      add: vi.fn((item) => `Add ${item}`),
      edit: vi.fn((item) => `Edit ${item}`),
      delete: vi.fn((item) => `Delete ${item}`)
    },
    portfolio: {
      stock: vi.fn((name, value, return_pct) => `${name} stock worth ${value} with ${return_pct} return`)
    }
  }
}))

// Mock window.confirm
global.confirm = vi.fn()

const mockStocks: StockWithValue[] = [
  {
    id: '1',
    user_id: 'user1',
    stock_name: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150,
    current_price: 175,
    totalValue: 1750,
    profitLoss: 250,
    profitLossPercent: 16.67,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    user_id: 'user1',
    stock_name: 'Microsoft Corp.',
    ticker: 'MSFT',
    quantity: 8,
    purchase_price: 200,
    current_price: 225,
    totalValue: 1800,
    profitLoss: 200,
    profitLossPercent: 12.5,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  },
  {
    id: '3',
    user_id: 'user1',
    stock_name: 'Google LLC',
    ticker: 'GOOGL',
    quantity: 5,
    purchase_price: 280,
    current_price: 270,
    totalValue: 1350,
    profitLoss: -50,
    profitLossPercent: -3.57,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }
]

const mockProps = {
  stocks: mockStocks,
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAdd: vi.fn()
}

describe('StockList', () => {
  beforeEach(() => {
    mockMatchMedia(false) // Desktop by default
    vi.clearAllMocks()
  })

  describe('Data Display', () => {
    it('renders stock list with correct data', () => {
      render(<StockList {...mockProps} />)
      
      expect(screen.getByText('Holdings')).toBeInTheDocument()
      expect(screen.getAllByText('AAPL')).toHaveLength(2) // Desktop table + mobile card
      expect(screen.getAllByText('Apple Inc.')).toHaveLength(2)
      expect(screen.getAllByText('MSFT')).toHaveLength(2)
      expect(screen.getAllByText('Microsoft Corp.')).toHaveLength(2)
      expect(screen.getAllByText('GOOGL')).toHaveLength(2)
      expect(screen.getAllByText('Google LLC')).toHaveLength(2)
    })

    it('displays stock financial data correctly', () => {
      render(<StockList {...mockProps} />)
      
      // Check quantity (appears in both desktop and mobile views)
      expect(screen.getAllByText('10')).toHaveLength(2)
      expect(screen.getAllByText('8')).toHaveLength(2)
      expect(screen.getAllByText('5')).toHaveLength(2)
      
      // Check formatted currency values
      expect(screen.getAllByText('$150.00')).toHaveLength(2)
      expect(screen.getAllByText('$175.00')).toHaveLength(2)
      expect(screen.getAllByText('$1,750.00')).toHaveLength(2)
      
      // Check profit/loss formatting (some values might appear in percentages too)
      expect(screen.getAllByText('$250.00').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('$200.00').length).toBeGreaterThanOrEqual(2)
      expect(screen.getAllByText('-$50.00').length).toBeGreaterThanOrEqual(2)
    })

    it('applies correct color styling for profit/loss', () => {
      render(<StockList {...mockProps} />)
      
      // Find profit/loss cells by their parent elements
      const profitCells = screen.getAllByText('$250.00')
      const lossCells = screen.getAllByText('-$50.00')
      
      // Check table cell (desktop view)
      expect(profitCells[0].closest('td')).toHaveClass('text-green-400')
      expect(lossCells[0].closest('td')).toHaveClass('text-red-400')
      
      // Check mobile card view
      expect(profitCells[1]).toHaveClass('text-green-400')
      expect(lossCells[1]).toHaveClass('text-red-400')
    })

    it('handles missing ticker gracefully', () => {
      const stocksWithoutTicker = [
        {
          ...mockStocks[0],
          ticker: null
        }
      ]
      
      render(<StockList {...mockProps} stocks={stocksWithoutTicker} />)
      
      expect(screen.getAllByText('N/A')).toHaveLength(2) // Desktop + mobile
      expect(screen.getAllByText('Apple Inc.')).toHaveLength(2)
    })
  })

  describe('Empty State', () => {
    it('renders empty state when no stocks', () => {
      render(<StockList {...mockProps} stocks={[]} />)
      
      expect(screen.getByText('No Holdings Yet')).toBeInTheDocument()
      expect(screen.getByText('Start building your portfolio by adding your first stock')).toBeInTheDocument()
      expect(screen.getByText('Add Your First Stock')).toBeInTheDocument()
    })

    it('calls onAdd when empty state button is clicked', () => {
      render(<StockList {...mockProps} stocks={[]} />)
      
      const addButton = screen.getByText('Add Your First Stock')
      fireEvent.click(addButton)
      
      expect(mockProps.onAdd).toHaveBeenCalledTimes(1)
    })
  })

  describe('Desktop Table Layout', () => {
    it('renders table headers correctly', () => {
      render(<StockList {...mockProps} />)
      
      // Table headers appear only once in the desktop table
      const tableHeaders = screen.getAllByRole('columnheader')
      expect(tableHeaders).toHaveLength(8)
      
      // Check specific headers exist (some appear in both desktop table and mobile cards)
      expect(screen.getAllByText('Stock')).toHaveLength(1)
      expect(screen.getAllByText('Quantity')).toHaveLength(4) // 1 header + 3 mobile cards
      expect(screen.getAllByText('Average Cost')).toHaveLength(1)
      expect(screen.getAllByText('Current Price')).toHaveLength(4) // 1 header + 3 mobile cards
      expect(screen.getAllByText('Market Value')).toHaveLength(1)
      expect(screen.getAllByText('Gain/Loss')).toHaveLength(4) // 1 header + 3 mobile cards
      expect(screen.getAllByText('Return %')).toHaveLength(1)
      expect(screen.getAllByText('Actions')).toHaveLength(1)
    })

    it('renders table rows with correct structure', () => {
      render(<StockList {...mockProps} />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
      
      // Check that rows are rendered
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(4) // 1 header + 3 data rows
    })

    it('applies hover and transition classes to table rows', () => {
      render(<StockList {...mockProps} />)
      
      const rows = screen.getAllByRole('row')
      const dataRows = rows.slice(1) // Skip header row
      
      dataRows.forEach(row => {
        expect(row).toHaveClass('hover:bg-white/3', 'transition-colors')
      })
    })
  })

  describe('Mobile Card Layout', () => {
    beforeEach(() => {
      mockMatchMedia(true) // Mobile
    })

    it('renders mobile card view with stock information', () => {
      render(<StockList {...mockProps} />)
      
      // Check that cards are rendered (articles)
      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(3)
      
      // Check card content (appears in both desktop table and mobile cards)
      expect(screen.getAllByText('AAPL')).toHaveLength(2) // Desktop + mobile
      expect(screen.getAllByText('Apple Inc.')).toHaveLength(2) // Desktop + mobile
      expect(screen.getAllByText('$1,750.00')).toHaveLength(2) // Desktop + mobile
    })

    it('displays stock details in card format', () => {
      render(<StockList {...mockProps} />)
      
      // Check for card labels (desktop table + mobile cards)
      expect(screen.getAllByText('Quantity')).toHaveLength(4) // 1 header + 3 mobile cards
      expect(screen.getAllByText('Avg Cost')).toHaveLength(3) // 3 mobile cards only
      expect(screen.getAllByText('Current Price')).toHaveLength(4) // 1 header + 3 mobile cards
      expect(screen.getAllByText('Gain/Loss')).toHaveLength(4) // 1 header + 3 mobile cards
    })

    it('applies correct styling for profit/loss in cards', () => {
      render(<StockList {...mockProps} />)
      
      // Find profit/loss values in cards
      const profitElements = screen.getAllByText('$250.00')
      const lossElements = screen.getAllByText('-$50.00')
      
      expect(profitElements[0]).toHaveClass('text-green-400')
      expect(lossElements[0]).toHaveClass('text-red-400')
    })
  })

  describe('User Interactions', () => {
    it('calls onAdd when add button is clicked', () => {
      render(<StockList {...mockProps} />)
      
      // Get the visible "Add Stock" button (desktop version)
      const addButton = screen.getByText('Add Stock')
      fireEvent.click(addButton)
      
      expect(mockProps.onAdd).toHaveBeenCalledTimes(1)
    })

    it('calls onEdit when edit button is clicked', () => {
      render(<StockList {...mockProps} />)
      
      // Get edit buttons (desktop table + mobile cards = 6 total)
      const editButtons = screen.getAllByText('Edit')
      expect(editButtons).toHaveLength(6) // 3 desktop + 3 mobile
      
      fireEvent.click(editButtons[0])
      
      expect(mockProps.onEdit).toHaveBeenCalledWith(mockStocks[0])
    })

    it('calls onDelete when delete is confirmed', async () => {
      global.confirm = vi.fn().mockReturnValue(true)
      
      render(<StockList {...mockProps} />)
      
      // Get delete buttons (desktop table + mobile cards = 6 total)
      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons).toHaveLength(6) // 3 desktop + 3 mobile
      
      fireEvent.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete Apple Inc.?')
        expect(mockProps.onDelete).toHaveBeenCalledWith('1')
      })
    })

    it('does not call onDelete when delete is cancelled', async () => {
      global.confirm = vi.fn().mockReturnValue(false)
      
      render(<StockList {...mockProps} />)
      
      const deleteButtons = screen.getAllByText('Delete')
      expect(deleteButtons).toHaveLength(6) // 3 desktop + 3 mobile
      
      fireEvent.click(deleteButtons[0])
      
      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete Apple Inc.?')
        expect(mockProps.onDelete).not.toHaveBeenCalled()
      })
    })
  })

  describe('Accessibility', () => {
    it('provides proper ARIA labels for buttons', () => {
      render(<StockList {...mockProps} />)
      
      const editButtons = screen.getAllByLabelText(/Edit Apple Inc\./)
      const deleteButtons = screen.getAllByLabelText(/Delete Apple Inc\./)
      
      expect(editButtons).toHaveLength(2) // Desktop table + mobile card
      expect(deleteButtons).toHaveLength(2) // Desktop table + mobile card
    })

    it('provides proper table accessibility', () => {
      render(<StockList {...mockProps} />)
      
      const table = screen.getByRole('table')
      expect(table).toHaveAttribute('aria-label', 'Stock holdings table')
    })

    it('provides proper card accessibility', () => {
      render(<StockList {...mockProps} />)
      
      const cards = screen.getAllByRole('article')
      expect(cards).toHaveLength(3)
      
      cards.forEach(card => {
        expect(card).toHaveAttribute('aria-label')
      })
    })

    it('maintains minimum touch target size', () => {
      render(<StockList {...mockProps} />)
      
      // The button that actually has the class is the parent button element
      const addButton = screen.getByText('Add Stock').closest('button')
      expect(addButton).toHaveClass('min-h-[44px]')
      
      // Check that mobile card edit buttons have proper touch targets
      const editButtons = screen.getAllByText('Edit')
      const mobileEditButtons = editButtons.filter(btn => btn.closest('div[role="article"]'))
      mobileEditButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]') // Mobile cards have larger touch targets
      })
    })

    it('provides focus management', () => {
      render(<StockList {...mockProps} />)
      
      const editButtons = screen.getAllByText('Edit')
      editButtons.forEach(button => {
        expect(button).toHaveClass('focus:outline-none', 'focus:ring-2')
      })
    })
  })

  describe('Responsive Behavior', () => {
    it('shows table on desktop', () => {
      mockMatchMedia(false) // Desktop
      render(<StockList {...mockProps} />)
      
      // Find the container (div) that wraps the table
      const tableContainers = screen.getAllByLabelText('Stock holdings table')
      const tableContainer = tableContainers.find(container => container.tagName === 'DIV')
      expect(tableContainer).toHaveClass('hidden', 'md:block')
    })

    it('shows cards on mobile', () => {
      mockMatchMedia(true) // Mobile
      render(<StockList {...mockProps} />)
      
      const cardContainer = screen.getByLabelText('Stock holdings cards')
      expect(cardContainer).toHaveClass('md:hidden')
    })

    it('adapts button text for mobile', () => {
      render(<StockList {...mockProps} />)
      
      // Desktop shows "Add Stock", mobile shows "Add"
      expect(screen.getByText('Add Stock')).toBeInTheDocument()
      expect(screen.getByText('Add')).toBeInTheDocument()
      
      // Both spans should be present with correct responsive classes
      const desktopSpan = screen.getByText('Add Stock')
      const mobileSpan = screen.getByText('Add')
      
      expect(desktopSpan).toHaveClass('hidden', 'sm:inline')
      expect(mobileSpan).toHaveClass('sm:hidden')
    })
  })

  describe('Performance Optimizations', () => {
    it('applies scroll optimization classes', () => {
      render(<StockList {...mockProps} />)
      
      // Find the table container (div wrapper)
      const tableContainers = screen.getAllByLabelText('Stock holdings table')
      const tableContainer = tableContainers.find(container => container.tagName === 'DIV')
      expect(tableContainer).toHaveClass('scroll-optimized')
      
      const cardContainer = screen.getByLabelText('Stock holdings cards')
      expect(cardContainer).toHaveClass('scroll-optimized')
    })

    it('uses touch-manipulation for buttons', () => {
      render(<StockList {...mockProps} />)
      
      const editButtons = screen.getAllByText('Edit')
      editButtons.forEach(button => {
        expect(button).toHaveClass('touch-manipulation')
      })
    })
  })
})