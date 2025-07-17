import { describe, it, expect } from 'vitest'
import type { Stock } from '../../types'
import {
  calculateStockValue,
  calculatePortfolioValue,
  calculatePortfolioCost,
  calculateStockProfitLoss,
  calculatePortfolioProfitLoss,
  calculateStockWeight,
  calculateStocksWithValue,
  calculatePortfolioSummary,
  calculateTradingSummary,
  calculateWeightDifference,
  isRebalancingNeeded,
  calculateSimulatedDailyChange,
  calculateStockMetrics
} from '../calculations'

describe('calculations', () => {
  const mockStock: Stock = {
    id: '1',
    user_id: 'user1',
    stock_name: 'Apple',
    ticker: 'AAPL',
    quantity: 10,
    purchase_price: 150,
    current_price: 180,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const mockStocks: Stock[] = [
    mockStock,
    {
      id: '2',
      user_id: 'user1', 
      stock_name: 'Microsoft',
      ticker: 'MSFT',
      quantity: 5,
      purchase_price: 300,
      current_price: 330,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  describe('calculateStockValue', () => {
    it('should calculate stock value correctly', () => {
      expect(calculateStockValue(10, 150)).toBe(1500)
      expect(calculateStockValue(0, 150)).toBe(0)
      expect(calculateStockValue(10, 0)).toBe(0)
    })
  })

  describe('calculatePortfolioValue', () => {
    it('should calculate total portfolio value', () => {
      expect(calculatePortfolioValue(mockStocks)).toBe(3450) // 1800 + 1650
    })

    it('should return 0 for empty portfolio', () => {
      expect(calculatePortfolioValue([])).toBe(0)
    })
  })

  describe('calculatePortfolioCost', () => {
    it('should calculate total portfolio cost', () => {
      expect(calculatePortfolioCost(mockStocks)).toBe(3000) // 1500 + 1500
    })

    it('should return 0 for empty portfolio', () => {
      expect(calculatePortfolioCost([])).toBe(0)
    })
  })

  describe('calculateStockProfitLoss', () => {
    it('should calculate profit correctly', () => {
      const result = calculateStockProfitLoss(10, 150, 180)
      
      expect(result.costBasis).toBe(1500)
      expect(result.currentValue).toBe(1800)
      expect(result.absoluteChange).toBe(300)
      expect(result.percentageChange).toBe(20)
    })

    it('should calculate loss correctly', () => {
      const result = calculateStockProfitLoss(10, 180, 150)
      
      expect(result.costBasis).toBe(1800)
      expect(result.currentValue).toBe(1500)
      expect(result.absoluteChange).toBe(-300)
      expect(result.percentageChange).toBeCloseTo(-16.67, 2)
    })

    it('should handle zero cost basis', () => {
      const result = calculateStockProfitLoss(10, 0, 150)
      
      expect(result.percentageChange).toBe(0)
    })
  })

  describe('calculatePortfolioProfitLoss', () => {
    it('should calculate portfolio profit/loss', () => {
      const result = calculatePortfolioProfitLoss(mockStocks)
      
      expect(result.totalCost).toBe(3000)
      expect(result.totalValue).toBe(3450)
      expect(result.absoluteChange).toBe(450)
      expect(result.percentageChange).toBe(15)
    })
  })

  describe('calculateStockWeight', () => {
    it('should calculate stock weight correctly', () => {
      expect(calculateStockWeight(1000, 10000)).toBe(10)
      expect(calculateStockWeight(500, 1000)).toBe(50)
    })

    it('should return 0 for zero portfolio value', () => {
      expect(calculateStockWeight(1000, 0)).toBe(0)
    })
  })

  describe('calculateStocksWithValue', () => {
    it('should add calculated values to stocks', () => {
      const result = calculateStocksWithValue([mockStock])
      
      expect(result).toHaveLength(1)
      expect(result[0].totalValue).toBe(1800)
      expect(result[0].profitLoss).toBe(300)
      expect(result[0].profitLossPercent).toBe(20)
    })
  })

  describe('calculatePortfolioSummary', () => {
    it('should generate complete portfolio summary', () => {
      const result = calculatePortfolioSummary(mockStocks)
      
      expect(result.totalValue).toBe(3450)
      expect(result.totalCost).toBe(3000)
      expect(result.totalProfitLoss).toBe(450)
      expect(result.totalProfitLossPercent).toBe(15)
      expect(result.stocks).toHaveLength(2)
    })
  })

  describe('calculateTradingSummary', () => {
    const mockCalculations = [
      {
        stock_name: 'AAPL',
        action: 'buy' as const,
        adjustedQuantityChange: 5,
        adjustedValueChange: 900
      },
      {
        stock_name: 'MSFT',
        action: 'sell' as const,
        adjustedQuantityChange: -2,
        adjustedValueChange: -660
      },
      {
        stock_name: 'GOOGL',
        action: 'hold' as const,
        adjustedQuantityChange: 0,
        adjustedValueChange: 0
      }
    ]

    it('should calculate trading summary without commission', () => {
      const result = calculateTradingSummary(mockCalculations)
      
      expect(result.totalTrades).toBe(2)
      expect(result.buyTrades).toBe(1)
      expect(result.sellTrades).toBe(1)
      expect(result.totalBuyValue).toBe(900)
      expect(result.totalSellValue).toBe(660)
      expect(result.totalCommission).toBe(0)
    })

    it('should calculate trading summary with commission', () => {
      const result = calculateTradingSummary(mockCalculations, 5)
      
      expect(result.totalCommission).toBe(35) // (5 + 2) * 5
    })
  })

  describe('calculateWeightDifference', () => {
    it('should calculate weight difference correctly', () => {
      expect(calculateWeightDifference(60, 50)).toBe(10)
      expect(calculateWeightDifference(40, 50)).toBe(-10)
      expect(calculateWeightDifference(50, 50)).toBe(0)
    })
  })

  describe('isRebalancingNeeded', () => {
    it('should determine if rebalancing is needed', () => {
      expect(isRebalancingNeeded(6, 5)).toBe(true)
      expect(isRebalancingNeeded(-6, 5)).toBe(true)
      expect(isRebalancingNeeded(3, 5)).toBe(false)
      expect(isRebalancingNeeded(-3, 5)).toBe(false)
    })
  })

  describe('calculateSimulatedDailyChange', () => {
    it('should calculate simulated daily change with default rate', () => {
      const result = calculateSimulatedDailyChange(10000)
      
      expect(result.changeAmount).toBe(67)
      expect(result.changePercentage).toBe(0.67)
      expect(result.newValue).toBe(10067)
      expect(result.isPositive).toBe(true)
    })

    it('should calculate simulated daily change with custom rate', () => {
      const result = calculateSimulatedDailyChange(10000, -1.5)
      
      expect(result.changeAmount).toBe(-150)
      expect(result.changePercentage).toBe(-1.5)
      expect(result.newValue).toBe(9850)
      expect(result.isPositive).toBe(false)
    })
  })

  describe('calculateStockMetrics', () => {
    it('should calculate stock metrics correctly', () => {
      const result = calculateStockMetrics(10, 150, 180)
      
      expect(result.investmentAmount).toBe(1500)
      expect(result.currentValue).toBe(1800)
      expect(result.profitLoss).toBe(300)
      expect(result.returnRate).toBe(20)
    })

    it('should handle zero investment amount', () => {
      const result = calculateStockMetrics(10, 0, 180)
      
      expect(result.returnRate).toBe(0)
    })
  })
})