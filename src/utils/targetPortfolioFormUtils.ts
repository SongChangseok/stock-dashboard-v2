/**
 * Business logic utilities for target portfolio form operations
 * Separates calculation and transformation logic from presentation
 */

import type { TargetPortfolioStock, Stock } from '../types'

/**
 * Calculate equal weight distribution for portfolio stocks
 * @param stocks - Array of portfolio stocks
 * @returns Stocks with equal weight distribution
 */
export const calculateEqualWeights = (stocks: TargetPortfolioStock[]): TargetPortfolioStock[] => {
  if (stocks.length === 0) return stocks
  
  const equalWeight = 100 / stocks.length
  const balancedStocks = stocks.map(stock => ({
    ...stock,
    target_weight: Math.round(equalWeight * 10) / 10 // Round to 1 decimal place
  }))
  
  // Adjust the first stock to ensure total equals exactly 100%
  const total = balancedStocks.reduce((sum, stock) => sum + stock.target_weight, 0)
  if (total !== 100) {
    balancedStocks[0].target_weight += 100 - total
  }
  
  return balancedStocks
}

/**
 * Calculate total weight of portfolio stocks
 * @param stocks - Array of portfolio stocks
 * @returns Total weight percentage
 */
export const calculateTotalWeight = (stocks: TargetPortfolioStock[]): number => {
  return stocks.reduce((sum, stock) => sum + stock.target_weight, 0)
}



/**
 * Filter available stocks for selection (excluding already selected)
 * @param availableStocks - All available stocks
 * @param selectedStocks - Currently selected stocks
 * @param excludeIndex - Index to exclude from selection check (for editing)
 * @returns Filtered available stocks
 */
export const getAvailableStocksForSelection = (
  availableStocks: Stock[],
  selectedStocks: TargetPortfolioStock[],
  excludeIndex?: number
): Stock[] => {
  const selectedStockNames = selectedStocks
    .map((s, index) => index === excludeIndex ? null : s.stock_name)
    .filter(Boolean)
  
  return availableStocks.filter(stock => 
    !selectedStockNames.includes(stock.stock_name)
  )
}

/**
 * Create new stock entry from available stock
 * @param availableStock - Available stock to add
 * @returns New target portfolio stock
 */
export const createNewStockEntry = (availableStock: Stock): TargetPortfolioStock => {
  return {
    stock_name: availableStock.stock_name,
    ticker: availableStock.ticker || '',
    target_weight: 0
  }
}

/**
 * Update stock entry with new stock selection
 * @param existingStock - Existing stock entry
 * @param selectedStock - Selected stock from available options
 * @returns Updated stock entry
 */
export const updateStockWithSelection = (
  existingStock: TargetPortfolioStock,
  selectedStock: Stock
): TargetPortfolioStock => {
  return {
    ...existingStock,
    stock_name: selectedStock.stock_name,
    ticker: selectedStock.ticker || ''
  }
}

/**
 * Transform target portfolio form data for submission
 * @param formData - Form data
 * @param stocks - Portfolio stocks
 * @param totalWeight - Total weight
 * @returns Transformed portfolio data
 */
export const transformPortfolioFormData = (
  formData: { name: string; description: string },
  stocks: TargetPortfolioStock[],
  totalWeight: number
) => {
  return {
    name: formData.name.trim(),
    allocations: {
      description: formData.description.trim() || undefined,
      stocks,
      total_weight: totalWeight
    }
  }
}