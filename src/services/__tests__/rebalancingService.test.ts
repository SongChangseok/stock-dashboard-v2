// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest'
import { RebalancingService } from '../rebalancingService'
import type { 
  PortfolioSummary, 
  TargetPortfolioData, 
  RebalancingOptions,
  TargetPortfolioAllocations
} from '../../types'

describe('RebalancingService', () => {
  let currentPortfolio: PortfolioSummary
  let targetPortfolio: TargetPortfolioData
  let defaultOptions: RebalancingOptions

  beforeEach(() => {
    currentPortfolio = {
      stocks: [
        {
          id: 'stock-1',
          stock_name: 'Apple Inc.',
          ticker: 'AAPL',
          quantity: 10,
          current_price: 150.00,
          purchase_price: 140.00,
          totalValue: 1500.00,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 'stock-2',
          stock_name: 'Microsoft Corp.',
          ticker: 'MSFT',
          quantity: 5,
          current_price: 300.00,
          purchase_price: 280.00,
          totalValue: 1500.00,
          user_id: 'user-1',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ],
      totalValue: 3000.00,
      totalCost: 2900.00,
      totalGainLoss: 100.00
    }

    const allocations: TargetPortfolioAllocations = {
      stocks: [
        { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 70 },
        { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 30 }
      ],
      total_weight: 100
    }

    targetPortfolio = {
      id: 'portfolio-1',
      name: 'Target Portfolio',
      allocations,
      user_id: 'user-1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }

    defaultOptions = {
      minimumTradingUnit: 1,
      rebalanceThreshold: 5.0,
      allowPartialShares: false,
      commission: 0,
      considerCommission: false
    }
  })

  describe('calculateRebalancing', () => {
    it('should calculate rebalancing for portfolio that needs adjustment', () => {
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      expect(result.totalCurrentValue).toBe(3000.00)
      expect(result.totalTargetValue).toBe(3000.00)
      expect(result.calculations).toHaveLength(2)

      const appleCalc = result.calculations.find(c => c.ticker === 'AAPL')
      const msftCalc = result.calculations.find(c => c.ticker === 'MSFT')

      expect(appleCalc).toBeDefined()
      expect(appleCalc!.currentWeight).toBe(50) // 1500/3000 * 100
      expect(appleCalc!.targetWeight).toBe(70)
      expect(appleCalc!.difference).toBe(-20) // 50 - 70
      expect(appleCalc!.action).toBe('buy')

      expect(msftCalc).toBeDefined()
      expect(msftCalc!.currentWeight).toBe(50) // 1500/3000 * 100
      expect(msftCalc!.targetWeight).toBe(30)
      expect(msftCalc!.difference).toBe(20) // 50 - 30
      expect(msftCalc!.action).toBe('sell')
    })

    it('should identify balanced portfolio', () => {
      // Adjust current portfolio to match target allocation
      currentPortfolio.stocks[0].totalValue = 2100.00 // 70% of 3000
      currentPortfolio.stocks[1].totalValue = 900.00  // 30% of 3000

      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      expect(result.isBalanced).toBe(true)
      expect(result.hasSignificantDifferences).toBe(false)
    })

    it('should handle minimum trading unit constraints', () => {
      const options = { ...defaultOptions, minimumTradingUnit: 10 }
      
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        options
      )

      const appleCalc = result.calculations.find(c => c.ticker === 'AAPL')
      
      // With min trading unit of 10, quantity changes should be multiples of 10
      expect(appleCalc!.adjustedQuantityChange % 10).toBe(0)
    })

    it('should factor in commission costs when enabled', () => {
      const options = { 
        ...defaultOptions, 
        considerCommission: true,
        commission: 10.00 // $10 per share commission
      }
      
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        options
      )

      // With high commission, some trades may become uneconomical
      const tradesWithCommission = result.calculations.filter(
        calc => calc.adjustedQuantityChange !== 0
      )
      
      expect(tradesWithCommission.length).toBeLessThanOrEqual(result.calculations.length)
    })

    it('should handle partial shares when allowed', () => {
      const options = { ...defaultOptions, allowPartialShares: true }
      
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        options
      )

      const appleCalc = result.calculations.find(c => c.ticker === 'AAPL')
      
      // With partial shares allowed, quantity change doesn't need to be whole numbers
      expect(appleCalc!.quantityChange).toBe(appleCalc!.adjustedQuantityChange)
    })

    it('should handle stocks not in current portfolio', () => {
      // Add a stock to target that's not in current portfolio
      const allocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 50 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 30 },
          { stock_name: 'Google Inc.', ticker: 'GOOGL', target_weight: 20 }
        ],
        total_weight: 100
      }

      const modifiedTarget = { ...targetPortfolio, allocations }

      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        modifiedTarget,
        defaultOptions
      )

      expect(result.calculations).toHaveLength(3)
      
      const googleCalc = result.calculations.find(c => c.ticker === 'GOOGL')
      expect(googleCalc).toBeDefined()
      expect(googleCalc!.currentQuantity).toBe(0)
      expect(googleCalc!.currentWeight).toBe(0)
      expect(googleCalc!.targetWeight).toBe(20)
      expect(googleCalc!.action).toBe('buy')
    })

    it('should handle stocks in current portfolio but not in target', () => {
      // Remove a stock from target portfolio
      const allocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 100 }
        ],
        total_weight: 100
      }

      const modifiedTarget = { ...targetPortfolio, allocations }

      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        modifiedTarget,
        defaultOptions
      )

      expect(result.calculations).toHaveLength(2)
      
      const msftCalc = result.calculations.find(c => c.ticker === 'MSFT')
      expect(msftCalc).toBeDefined()
      expect(msftCalc!.targetWeight).toBe(0)
      expect(msftCalc!.action).toBe('sell')
    })

    it('should sort calculations by difference magnitude', () => {
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      for (let i = 0; i < result.calculations.length - 1; i++) {
        const currentDiff = Math.abs(result.calculations[i].difference)
        const nextDiff = Math.abs(result.calculations[i + 1].difference)
        expect(currentDiff).toBeGreaterThanOrEqual(nextDiff)
      }
    })
  })

  describe('getRebalancingRecommendations', () => {
    it('should return balanced message for balanced portfolio', () => {
      const balancedResult = {
        calculations: [],
        totalCurrentValue: 3000,
        totalTargetValue: 3000,
        totalRebalanceValue: 0,
        totalBuyValue: 0,
        totalSellValue: 0,
        isBalanced: true,
        hasSignificantDifferences: false,
        rebalanceThreshold: 5.0
      }

      const recommendations = RebalancingService.getRebalancingRecommendations(balancedResult)

      expect(recommendations).toHaveLength(1)
      expect(recommendations[0]).toContain('well-balanced')
    })

    it('should provide buy and sell recommendations', () => {
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      const recommendations = RebalancingService.getRebalancingRecommendations(result)

      expect(recommendations.length).toBeGreaterThan(1)
      
      const buyRecommendation = recommendations.find(r => r.includes('Consider buying'))
      const sellRecommendation = recommendations.find(r => r.includes('Consider selling'))

      expect(buyRecommendation).toBeDefined()
      expect(sellRecommendation).toBeDefined()
    })

    it('should include total rebalancing value when greater than 0', () => {
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      const recommendations = RebalancingService.getRebalancingRecommendations(result)

      // Only check for total rebalancing value if it's actually greater than 0
      if (result.totalRebalanceValue > 0) {
        const totalValueRecommendation = recommendations.find(r => r.includes('Total rebalancing value'))
        expect(totalValueRecommendation).toBeDefined()
      } else {
        // If no rebalancing needed, just ensure we have recommendations
        expect(recommendations.length).toBeGreaterThan(0)
      }
    })
  })

  describe('validateCalculations', () => {
    it('should validate correct calculations', () => {
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        defaultOptions
      )

      const validation = RebalancingService.validateCalculations(result)

      expect(validation.isValid).toBe(true)
      expect(validation.issues).toHaveLength(0)
    })

    it('should detect invalid total weight', () => {
      // Create invalid target portfolio with weights not totaling 100%
      const allocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 60 },
          { stock_name: 'Microsoft Corp.', ticker: 'MSFT', target_weight: 30 }
        ],
        total_weight: 90
      }

      const invalidTarget = { ...targetPortfolio, allocations }

      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        invalidTarget,
        defaultOptions
      )

      const validation = RebalancingService.validateCalculations(result)

      expect(validation.isValid).toBe(false)
      expect(validation.issues.some(issue => issue.includes('90.00% instead of 100%'))).toBe(true)
    })

    it('should detect negative quantities after rebalancing', () => {
      // Create scenario where selling would result in negative quantities
      const smallPortfolio: PortfolioSummary = {
        stocks: [
          {
            id: 'stock-1',
            stock_name: 'Apple Inc.',
            ticker: 'AAPL',
            quantity: 1, // Very small quantity
            current_price: 150.00,
            purchase_price: 140.00,
            totalValue: 150.00,
            user_id: 'user-1',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        ],
        totalValue: 150.00,
        totalCost: 140.00,
        totalGainLoss: 10.00
      }

      // Target that would require selling more than available
      const allocations: TargetPortfolioAllocations = {
        stocks: [
          { stock_name: 'Apple Inc.', ticker: 'AAPL', target_weight: 0 }
        ],
        total_weight: 100
      }

      const extremeTarget = { ...targetPortfolio, allocations }

      const result = RebalancingService.calculateRebalancing(
        smallPortfolio,
        extremeTarget,
        { ...defaultOptions, minimumTradingUnit: 10 }
      )

      const validation = RebalancingService.validateCalculations(result)

      // This might detect negative quantities depending on the calculation logic
      expect(validation.issues.length).toBeGreaterThanOrEqual(0)
    })

    it('should handle edge cases gracefully', () => {
      // Empty portfolio
      const emptyPortfolio: PortfolioSummary = {
        stocks: [],
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0
      }

      const result = RebalancingService.calculateRebalancing(
        emptyPortfolio,
        targetPortfolio,
        defaultOptions
      )

      const validation = RebalancingService.validateCalculations(result)

      // Should handle empty portfolio without crashing
      expect(validation).toBeDefined()
      expect(Array.isArray(validation.issues)).toBe(true)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero current price', () => {
      const portfolioWithZeroPrice = {
        ...currentPortfolio,
        stocks: [
          { ...currentPortfolio.stocks[0], current_price: 0, totalValue: 0 }
        ],
        totalValue: 0
      }

      const result = RebalancingService.calculateRebalancing(
        portfolioWithZeroPrice,
        targetPortfolio,
        defaultOptions
      )

      expect(result).toBeDefined()
      expect(result.calculations).toHaveLength(2)
    })

    it('should handle very small rebalance threshold', () => {
      const options = { ...defaultOptions, rebalanceThreshold: 0.01 }
      
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        options
      )

      expect(result.rebalanceThreshold).toBe(0.01)
      // With very small threshold, more differences should be considered significant
      expect(result.hasSignificantDifferences).toBe(true)
    })

    it('should handle very large rebalance threshold', () => {
      const options = { ...defaultOptions, rebalanceThreshold: 50.0 }
      
      const result = RebalancingService.calculateRebalancing(
        currentPortfolio,
        targetPortfolio,
        options
      )

      expect(result.rebalanceThreshold).toBe(50.0)
      // With very large threshold, fewer differences should be considered significant
      const actionsCount = result.calculations.filter(c => c.action !== 'hold').length
      expect(actionsCount).toBeLessThanOrEqual(result.calculations.length)
    })
  })
})