import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Mock data for testing
export const mockStock = {
  id: '1',
  user_id: 'user1',
  stock_name: 'Apple Inc.',
  ticker: 'AAPL',
  quantity: 10,
  purchase_price: 150,
  current_price: 175,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockPortfolioData = [
  {
    name: 'Apple Inc.',
    value: 1750,
    percentage: 35
  },
  {
    name: 'Microsoft Corp.',
    value: 1200,
    percentage: 24
  },
  {
    name: 'Google LLC',
    value: 1050,
    percentage: 21
  },
  {
    name: 'Amazon.com Inc.',
    value: 1000,
    percentage: 20
  }
]

export const mockTargetPortfolio = {
  id: '1',
  user_id: 'user1',
  name: 'Tech Portfolio',
  allocations: {
    description: 'Technology focused portfolio',
    stocks: [
      {
        stock_name: 'Apple Inc.',
        ticker: 'AAPL',
        target_weight: 40
      },
      {
        stock_name: 'Microsoft Corp.',
        ticker: 'MSFT',
        target_weight: 30
      },
      {
        stock_name: 'Google LLC',
        ticker: 'GOOGL',
        target_weight: 30
      }
    ],
    total_weight: 100
  },
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const createMockUser = (overrides = {}) => ({
  id: 'user1',
  email: 'test@example.com',
  ...overrides
})

export const createMockAuthStore = (overrides = {}) => ({
  user: createMockUser(),
  isAuthenticated: true,
  isLoading: false,
  initialize: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  ...overrides
})

export const createMockPortfolioStore = (overrides = {}) => ({
  stocks: [mockStock],
  totalValue: 5000,
  totalProfit: 250,
  totalProfitPercentage: 5.26,
  isLoading: false,
  fetchStocks: vi.fn(),
  addStock: vi.fn(),
  updateStock: vi.fn(),
  deleteStock: vi.fn(),
  ...overrides
})

export const createMockTargetPortfolioStore = (overrides = {}) => ({
  portfolios: [mockTargetPortfolio],
  selectedPortfolio: mockTargetPortfolio,
  isLoading: false,
  fetchPortfolios: vi.fn(),
  createPortfolio: vi.fn(),
  updatePortfolio: vi.fn(),
  deletePortfolio: vi.fn(),
  selectPortfolio: vi.fn(),
  ...overrides
})

// Mock browser APIs
export const mockResizeObserver = () => {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

export const mockIntersectionObserver = () => {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}

export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}