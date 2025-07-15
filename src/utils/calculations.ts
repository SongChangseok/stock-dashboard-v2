/**
 * Centralized calculation utilities
 * Provides common portfolio and trading calculation functions
 */

import type { Stock, StockWithValue, PortfolioSummary, RebalancingCalculation } from '../types'

/**
 * Calculate the total value of a stock position
 * @param quantity - Number of shares
 * @param currentPrice - Current price per share
 * @returns Total value of the position
 */
export const calculateStockValue = (quantity: number, currentPrice: number): number => {
  return quantity * currentPrice
}

/**
 * Calculate the total portfolio value from an array of stocks
 * @param stocks - Array of stock holdings
 * @returns Total portfolio value
 */
export const calculatePortfolioValue = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => {
    return total + calculateStockValue(stock.quantity, stock.current_price)
  }, 0)
}

/**
 * Calculate the total cost basis of a portfolio
 * @param stocks - Array of stock holdings
 * @returns Total cost basis
 */
export const calculatePortfolioCost = (stocks: Stock[]): number => {
  return stocks.reduce((total, stock) => {
    return total + calculateStockValue(stock.quantity, stock.purchase_price)
  }, 0)
}

/**
 * Calculate profit/loss for a single stock position
 * @param quantity - Number of shares
 * @param purchasePrice - Purchase price per share
 * @param currentPrice - Current price per share
 * @returns Profit/loss object with absolute and percentage values
 */
export const calculateStockProfitLoss = (
  quantity: number, 
  purchasePrice: number, 
  currentPrice: number
) => {
  const costBasis = quantity * purchasePrice
  const currentValue = quantity * currentPrice
  const absoluteChange = currentValue - costBasis
  const percentageChange = costBasis > 0 ? (absoluteChange / costBasis) * 100 : 0

  return {
    absoluteChange,
    percentageChange,
    costBasis,
    currentValue
  }
}

/**
 * Calculate portfolio profit/loss summary
 * @param stocks - Array of stock holdings
 * @returns Portfolio profit/loss summary
 */
export const calculatePortfolioProfitLoss = (stocks: Stock[]) => {
  const totalCost = calculatePortfolioCost(stocks)
  const totalValue = calculatePortfolioValue(stocks)
  const absoluteChange = totalValue - totalCost
  const percentageChange = totalCost > 0 ? (absoluteChange / totalCost) * 100 : 0

  return {
    totalCost,
    totalValue,
    absoluteChange,
    percentageChange
  }
}

/**
 * Calculate stock weight in portfolio
 * @param stockValue - Value of individual stock position
 * @param portfolioValue - Total portfolio value
 * @returns Weight as percentage (0-100)
 */
export const calculateStockWeight = (stockValue: number, portfolioValue: number): number => {
  return portfolioValue > 0 ? (stockValue / portfolioValue) * 100 : 0
}

/**
 * Convert stocks array to StockWithValue array with calculated metrics
 * @param stocks - Array of stock holdings
 * @returns Array of stocks with calculated values and weights
 */
export const calculateStocksWithValue = (stocks: Stock[]): StockWithValue[] => {
  return stocks.map(stock => {
    const value = calculateStockValue(stock.quantity, stock.current_price)
    const profitLoss = calculateStockProfitLoss(
      stock.quantity, 
      stock.purchase_price, 
      stock.current_price
    )

    return {
      ...stock,
      totalValue: value,
      profitLoss: profitLoss.absoluteChange,
      profitLossPercent: profitLoss.percentageChange
    }
  })
}

/**
 * Calculate portfolio summary from stocks array
 * @param stocks - Array of stock holdings
 * @returns Portfolio summary with totals and metrics
 */
export const calculatePortfolioSummary = (stocks: Stock[]): PortfolioSummary => {
  const stocksWithValue = calculateStocksWithValue(stocks)
  const profitLoss = calculatePortfolioProfitLoss(stocks)
  
  return {
    totalValue: profitLoss.totalValue,
    totalCost: profitLoss.totalCost,
    totalProfitLoss: profitLoss.absoluteChange,
    totalProfitLossPercent: profitLoss.percentageChange,
    stocks: stocksWithValue
  }
}

/**
 * Calculate trading summary from rebalancing calculations
 * @param calculations - Array of rebalancing calculations
 * @returns Trading summary with buy/sell totals and commission
 */
export const calculateTradingSummary = (
  calculations: RebalancingCalculation[],
  commission = 0
) => {
  const actionableCalculations = calculations.filter(calc => calc.action !== 'hold')
  
  const totalTrades = actionableCalculations.length
  
  const buyCalculations = actionableCalculations.filter(calc => calc.action === 'buy')
  const sellCalculations = actionableCalculations.filter(calc => calc.action === 'sell')
  
  const totalBuyValue = buyCalculations.reduce(
    (sum, calc) => sum + Math.abs(calc.adjustedValueChange), 
    0
  )
  
  const totalSellValue = sellCalculations.reduce(
    (sum, calc) => sum + Math.abs(calc.adjustedValueChange), 
    0
  )
  
  const totalBuyQuantity = buyCalculations.reduce(
    (sum, calc) => sum + Math.abs(calc.adjustedQuantityChange), 
    0
  )
  
  const totalSellQuantity = sellCalculations.reduce(
    (sum, calc) => sum + Math.abs(calc.adjustedQuantityChange), 
    0
  )
  
  const totalCommission = actionableCalculations.reduce(
    (sum, calc) => sum + (Math.abs(calc.adjustedQuantityChange) * commission), 
    0
  )

  return {
    totalTrades,
    buyTrades: buyCalculations.length,
    sellTrades: sellCalculations.length,
    totalBuyValue,
    totalSellValue,
    totalBuyQuantity,
    totalSellQuantity,
    totalCommission,
    netCashFlow: totalSellValue - totalBuyValue - totalCommission
  }
}

/**
 * Calculate weight difference between current and target portfolio
 * @param currentWeight - Current weight percentage
 * @param targetWeight - Target weight percentage
 * @returns Weight difference (positive = overweight, negative = underweight)
 */
export const calculateWeightDifference = (
  currentWeight: number, 
  targetWeight: number
): number => {
  return currentWeight - targetWeight
}

/**
 * Check if rebalancing is needed based on threshold
 * @param weightDifference - Weight difference percentage
 * @param threshold - Rebalancing threshold percentage
 * @returns True if rebalancing is needed
 */
export const isRebalancingNeeded = (
  weightDifference: number, 
  threshold: number
): boolean => {
  return Math.abs(weightDifference) > threshold
}

/**
 * Calculate simulated daily portfolio change
 * @param portfolioValue - Current portfolio value
 * @param dailyChangeRate - Daily change rate (default: 0.67%)
 * @returns Simulated daily change object
 */
export const calculateSimulatedDailyChange = (
  portfolioValue: number, 
  dailyChangeRate = 0.67
) => {
  const changeAmount = portfolioValue * (dailyChangeRate / 100)
  const newValue = portfolioValue + changeAmount
  
  return {
    changeAmount,
    changePercentage: dailyChangeRate,
    newValue,
    isPositive: changeAmount >= 0
  }
}