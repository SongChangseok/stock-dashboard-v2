import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { vi, expect } from 'vitest'
import type { User } from '@supabase/supabase-js'
import type { Stock } from '../types/database'
import type { TargetPortfolioData } from '../types/targetPortfolio'

// Mock user for testing
export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: {}
}

// Mock stock data
export const mockStocks: Stock[] = [
  {
    id: 'stock-1',
    stock_name: 'Apple Inc.',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150.00,
    current_price: 175.00,
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'stock-2',
    stock_name: 'Microsoft Corp.',
    ticker: 'MSFT',
    quantity: 5,
    purchase_price: 300.00,
    current_price: 320.00,
    user_id: 'test-user-id',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Mock target portfolio data
export const mockTargetPortfolio: TargetPortfolioData = {
  id: 'portfolio-1',
  name: 'Balanced Portfolio',
  user_id: 'test-user-id',
  allocations: {
    description: 'A balanced portfolio',
    stocks: [
      { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
      { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 40 }
    ],
    total_weight: 100
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
}

// Mock services setup
export const setupServiceMocks = () => {
  // Mock Supabase
  vi.mock('../services/supabase', () => ({
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
        delete: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }
  }))

  // Mock stock service
  vi.mock('../services/stockService', () => ({
    stockService: {
      getStocks: vi.fn(() => Promise.resolve(mockStocks)),
      createStock: vi.fn(() => Promise.resolve(mockStocks[0])),
      updateStock: vi.fn(() => Promise.resolve(mockStocks[0])),
      deleteStock: vi.fn(() => Promise.resolve())
    }
  }))

  // Mock target portfolio service
  vi.mock('../services/targetPortfolioService', () => ({
    targetPortfolioService: {
      getTargetPortfolios: vi.fn(() => Promise.resolve([mockTargetPortfolio])),
      createTargetPortfolio: vi.fn(() => Promise.resolve(mockTargetPortfolio)),
      updateTargetPortfolio: vi.fn(() => Promise.resolve(mockTargetPortfolio)),
      deleteTargetPortfolio: vi.fn(() => Promise.resolve())
    }
  }))

  // Mock auth service
  vi.mock('../services/database', () => ({
    authService: {
      getCurrentUser: vi.fn(() => Promise.resolve(mockUser)),
      signUp: vi.fn(() => Promise.resolve({ user: mockUser, session: null })),
      signIn: vi.fn(() => Promise.resolve({ user: mockUser, session: null })),
      signOut: vi.fn(() => Promise.resolve()),
      onAuthStateChange: vi.fn(() => () => {})
    }
  }))

  // Mock realtime service
  vi.mock('../services/realtimeService', () => ({
    realtimeService: {
      subscribeToStocks: vi.fn(() => () => {}),
      subscribeToTargetPortfolios: vi.fn(() => () => {})
    }
  }))

  // Mock calculations
  vi.mock('../utils/calculations', () => ({
    calculatePortfolioSummary: vi.fn(() => ({
      totalValue: 3350.00,
      totalCost: 3000.00,
      totalProfitLoss: 350.00,
      totalProfitLossPercent: 11.67,
      stocks: mockStocks.map(stock => ({
        ...stock,
        totalValue: stock.quantity * stock.current_price,
        profitLoss: stock.quantity * (stock.current_price - stock.purchase_price),
        profitLossPercent: ((stock.current_price - stock.purchase_price) / stock.purchase_price) * 100,
        weight: 50
      }))
    }))
  }))

  // Mock session storage
  vi.mock('../utils/sessionStorage', () => ({
    saveToSession: vi.fn(),
    loadFromSession: vi.fn(),
    SESSION_KEYS: {
      PORTFOLIO_DATA: 'portfolio_data',
      SELECTED_TARGET_PORTFOLIO: 'selected_target_portfolio'
    }
  }))

  // Mock loading state
  vi.mock('../utils/loadingState', () => ({
    globalLoadingManager: {
      executeWithLoading: vi.fn((_operation, callback) => callback())
    },
    LOADING_OPERATIONS: {
      FETCH_STOCKS: 'fetch_stocks',
      DELETE_STOCK: 'delete_stock',
      CREATE_STOCK: 'create_stock',
      UPDATE_STOCK: 'update_stock'
    }
  }))
}

// Integration test wrapper with routing
interface IntegrationWrapperProps {
  children: React.ReactNode
  initialEntries?: string[]
  initialIndex?: number
}

export const IntegrationWrapper: React.FC<IntegrationWrapperProps> = ({
  children,
  initialEntries = ['/'],
  initialIndex = 0
}) => {
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {children}
    </MemoryRouter>
  )
}

// Custom render function for integration tests
export const renderWithRouter = (
  ui: ReactElement,
  options?: {
    initialEntries?: string[]
    initialIndex?: number
  } & Omit<RenderOptions, 'wrapper'>
) => {
  const { initialEntries: _initialEntries, initialIndex: _initialIndex, ...renderOptions } = options || {}
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <IntegrationWrapper initialEntries={_initialEntries} initialIndex={_initialIndex}>
      {children}
    </IntegrationWrapper>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Custom render function for full app integration tests
export const renderApp = (
  ui: ReactElement,
  options?: {
    initialEntries?: string[]
    initialIndex?: number
  } & Omit<RenderOptions, 'wrapper'>
) => {
  const { initialEntries: _initialEntries, initialIndex: _initialIndex, ...renderOptions } = options || {}
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  )

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  }
}

// Helper functions for integration tests
export const waitForLoadingToFinish = async () => {
  // Wait for loading states to complete
  await new Promise(resolve => setTimeout(resolve, 100))
}

export const fillStockForm = async (user: ReturnType<typeof userEvent.setup>, stockData: Partial<Stock>) => {
  if (stockData.stock_name) {
    const nameInput = await document.querySelector('input[name="stock_name"]')
    if (nameInput) await user.type(nameInput, stockData.stock_name)
  }
  
  if (stockData.ticker) {
    const tickerInput = await document.querySelector('input[name="ticker"]')
    if (tickerInput) await user.type(tickerInput, stockData.ticker)
  }
  
  if (stockData.quantity) {
    const quantityInput = await document.querySelector('input[name="quantity"]')
    if (quantityInput) await user.type(quantityInput, stockData.quantity.toString())
  }
  
  if (stockData.purchase_price) {
    const purchasePriceInput = await document.querySelector('input[name="purchase_price"]')
    if (purchasePriceInput) await user.type(purchasePriceInput, stockData.purchase_price.toString())
  }
  
  if (stockData.current_price) {
    const currentPriceInput = await document.querySelector('input[name="current_price"]')
    if (currentPriceInput) await user.type(currentPriceInput, stockData.current_price.toString())
  }
}

export const expectStockToBeDisplayed = (stockName: string, container: HTMLElement) => {
  expect(container).toHaveTextContent(stockName)
}

export const expectPortfolioSummaryToBeDisplayed = (container: HTMLElement) => {
  expect(container).toHaveTextContent('Total Value')
  expect(container).toHaveTextContent('Total Cost')
  expect(container).toHaveTextContent('Profit/Loss')
}

// Re-export everything from testing library
export * from '@testing-library/react'
export { userEvent }