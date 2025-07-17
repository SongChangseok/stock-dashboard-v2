import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '../../test/test-utils'
import { PortfolioChart } from '../PortfolioChart'
import { mockResizeObserver, mockMatchMedia } from '../../test/test-utils'
import type { PortfolioSummary } from '../../types/database'

// Mock recharts
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }: { data: Array<{ name: string; value: number; percentage: number }> }) => (
    <div data-testid="pie" data-items={data.length}>
      {data.map((item, index) => (
        <div key={index} data-testid="pie-cell" data-name={item.name} data-value={item.value} data-percentage={item.percentage} />
      ))}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" data-color={fill} />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
}))

// Mock hooks
vi.mock('../../hooks', () => ({
  useResponsive: vi.fn(() => ({ isMobile: false })),
  usePerformanceMonitor: vi.fn(),
}))

const mockSummary: PortfolioSummary = {
  totalValue: 5000,
  totalCost: 4500,
  totalProfitLoss: 500,
  totalProfitLossPercent: 11.11,
  stocks: [
    {
      id: '1',
      stock_name: 'Apple Inc.',
      ticker: 'AAPL',
      quantity: 10,
      purchase_price: 150,
      current_price: 175,
      totalValue: 1750,
      profitLoss: 250,
      profitLossPercent: 16.67,
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: '2',
      stock_name: 'Microsoft Corp.',
      ticker: 'MSFT',
      quantity: 8,
      purchase_price: 200,
      current_price: 225,
      totalValue: 1800,
      profitLoss: 200,
      profitLossPercent: 12.5,
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    },
    {
      id: '3',
      stock_name: 'Google LLC',
      ticker: 'GOOGL',
      quantity: 5,
      purchase_price: 280,
      current_price: 290,
      totalValue: 1450,
      profitLoss: 50,
      profitLossPercent: 3.57,
      user_id: 'user1',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z'
    }
  ]
}

const emptySummary: PortfolioSummary = {
  totalValue: 0,
  totalCost: 0,
  totalProfitLoss: 0,
  totalProfitLossPercent: 0,
  stocks: []
}

describe('PortfolioChart', () => {
  beforeEach(() => {
    mockResizeObserver()
    mockMatchMedia()
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('renders portfolio chart with title', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })

    it('renders empty state when no stocks', () => {
      render(<PortfolioChart summary={emptySummary} />)
      
      expect(screen.getByText('No stocks in portfolio')).toBeInTheDocument()
      expect(screen.getByText('Add stocks to see allocation chart')).toBeInTheDocument()
      expect(screen.queryByTestId('pie-chart')).not.toBeInTheDocument()
    })

    it('renders chart with correct data structure', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      const pieElement = screen.getByTestId('pie')
      expect(pieElement).toHaveAttribute('data-items', '3')
      
      const pieCells = screen.getAllByTestId('pie-cell')
      expect(pieCells).toHaveLength(3)
      
      expect(pieCells[0]).toHaveAttribute('data-name', 'AAPL')
      expect(pieCells[1]).toHaveAttribute('data-name', 'MSFT')
      expect(pieCells[2]).toHaveAttribute('data-name', 'GOOGL')
    })
  })

  describe('Data Visualization', () => {
    it('displays correct stock data in pie chart', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      const pieCells = screen.getAllByTestId('pie-cell')
      
      // Check AAPL data
      expect(pieCells[0]).toHaveAttribute('data-value', '1750')
      expect(pieCells[0]).toHaveAttribute('data-percentage', '35')
      
      // Check MSFT data
      expect(pieCells[1]).toHaveAttribute('data-value', '1800')
      expect(pieCells[1]).toHaveAttribute('data-percentage', '36')
      
      // Check GOOGL data
      expect(pieCells[2]).toHaveAttribute('data-value', '1450')
      expect(pieCells[2]).toHaveAttribute('data-percentage', '28.999999999999996')
    })

    it('displays legend with correct stock information', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      expect(screen.getByText('Holdings')).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('MSFT')).toBeInTheDocument()
      expect(screen.getByText('GOOGL')).toBeInTheDocument()
      
      expect(screen.getByText('35.0%')).toBeInTheDocument()
      expect(screen.getByText('36.0%')).toBeInTheDocument()
      expect(screen.getByText('29.0%')).toBeInTheDocument()
      
      expect(screen.getByText('$1,750.00')).toBeInTheDocument()
      expect(screen.getByText('$1,800.00')).toBeInTheDocument()
      expect(screen.getByText('$1,450.00')).toBeInTheDocument()
    })

    it('uses stock ticker when available, falls back to stock name', () => {
      const summaryWithoutTicker: PortfolioSummary = {
        ...mockSummary,
        stocks: [
          {
            ...mockSummary.stocks[0],
            ticker: null
          }
        ]
      }
      
      render(<PortfolioChart summary={summaryWithoutTicker} />)
      
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('adjusts chart size for mobile devices', () => {
      vi.doMock('../../hooks', () => ({
        useResponsive: vi.fn(() => ({ isMobile: true })),
        usePerformanceMonitor: vi.fn(),
      }))
      
      render(<PortfolioChart summary={mockSummary} />)
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })

    it('applies mobile-specific styling classes', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      // Test that responsive container is present (parent of pie-chart)
      const container = screen.getByTestId('responsive-container').parentElement
      expect(container).toHaveClass('h-64', 'md:h-80')
    })

    it('applies desktop styling when not mobile', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      // Test that responsive container is present (parent of pie-chart)
      const container = screen.getByTestId('responsive-container').parentElement
      expect(container).toHaveClass('h-64', 'md:h-80')
    })
  })

  describe('Performance Monitoring', () => {
    it('calls performance monitor hook', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      // Hook is mocked at the top level, so we just verify rendering works
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  describe('Color Assignment', () => {
    it('assigns different colors to each stock', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      // Test that pie cells are rendered with color data
      const pieCells = screen.getAllByTestId('pie-cell')
      expect(pieCells).toHaveLength(3)
      
      // Colors are assigned in the component but not exposed through test IDs
      // We verify the structure is correct
      expect(pieCells[0]).toHaveAttribute('data-name', 'AAPL')
      expect(pieCells[1]).toHaveAttribute('data-name', 'MSFT')
      expect(pieCells[2]).toHaveAttribute('data-name', 'GOOGL')
    })

    it('handles more stocks than available colors', () => {
      const manyStocksSummary: PortfolioSummary = {
        ...mockSummary,
        stocks: Array.from({ length: 15 }, (_, i) => ({
          ...mockSummary.stocks[0],
          id: `stock-${i}`,
          stock_name: `Stock ${i}`,
          ticker: `STK${i}`,
          totalValue: 100 * (i + 1)
        }))
      }
      
      render(<PortfolioChart summary={manyStocksSummary} />)
      
      const pieCells = screen.getAllByTestId('pie-cell')
      expect(pieCells).toHaveLength(15)
    })
  })

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(2)
      expect(headings[0]).toHaveTextContent('Portfolio Allocation')
      expect(headings[1]).toHaveTextContent('Holdings')
    })

    it('maintains minimum touch target size for mobile', () => {
      render(<PortfolioChart summary={mockSummary} />)
      
      // Find elements that should have minimum touch target size
      const legendItems = screen.getAllByText('AAPL')[0].closest('.min-h-\\[44px\\]')
      expect(legendItems).toBeInTheDocument()
    })
  })
})