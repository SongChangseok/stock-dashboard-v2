import type { 
  RebalancingCalculation, 
  RebalancingResult, 
  RebalancingOptions,
  TargetPortfolioData,
  PortfolioSummary,
  TargetPortfolioStock,
  TargetPortfolioAllocations
} from '../types'

const DEFAULT_OPTIONS: RebalancingOptions = {
  minimumTradingUnit: 1,
  rebalanceThreshold: 5.0, // 5% threshold for significant differences
  allowPartialShares: false,
  commission: 0,
  considerCommission: false
}

export class RebalancingService {
  /**
   * Calculate rebalancing recommendations for a portfolio
   * @param currentPortfolio Current portfolio data
   * @param targetPortfolio Target portfolio allocation
   * @param options Rebalancing options
   * @returns Detailed rebalancing calculations
   */
  static calculateRebalancing(
    currentPortfolio: PortfolioSummary,
    targetPortfolio: TargetPortfolioData,
    options: Partial<RebalancingOptions> = {}
  ): RebalancingResult {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const calculations: RebalancingCalculation[] = []
    
    // Create stock mapping for efficient lookups
    const currentStockMap = new Map(
      currentPortfolio.stocks.map(stock => [
        stock.ticker || stock.stock_name,
        stock
      ])
    )
    
    const allocations = targetPortfolio.allocations as TargetPortfolioAllocations
    const targetStockMap = new Map(
      allocations.stocks.map((stock: TargetPortfolioStock) => [
        stock.ticker || stock.stock_name,
        stock
      ])
    )
    
    // Get all unique stock names/tickers
    const allStocks = new Set([
      ...currentStockMap.keys(),
      ...targetStockMap.keys()
    ])
    
    let totalBuyValue = 0
    let totalSellValue = 0
    
    // Calculate rebalancing for each stock
    allStocks.forEach(stockKey => {
      const currentStock = currentStockMap.get(stockKey)
      const targetStock = targetStockMap.get(stockKey)
      
      const currentQuantity = currentStock?.quantity || 0
      const currentPrice = currentStock?.current_price || 0
      const currentValue = currentStock?.totalValue || 0
      const currentWeight = currentPortfolio.totalValue > 0 
        ? (currentValue / currentPortfolio.totalValue) * 100 
        : 0
      
      const targetWeight = targetStock?.target_weight || 0
      const targetValue = (targetWeight / 100) * currentPortfolio.totalValue
      
      const difference = currentWeight - targetWeight
      const valueChange = targetValue - currentValue
      
      // Determine action based on difference threshold
      let action: 'buy' | 'sell' | 'hold' = 'hold'
      if (Math.abs(difference) > opts.rebalanceThreshold) {
        action = difference > 0 ? 'sell' : 'buy'
      }
      
      // Calculate quantity change needed
      let quantityChange = 0
      if (currentPrice > 0 && action !== 'hold') {
        quantityChange = valueChange / currentPrice
      }
      
      // Apply minimum trading unit constraints
      let adjustedQuantityChange = quantityChange
      let adjustedValueChange = valueChange
      
      if (!opts.allowPartialShares && Math.abs(quantityChange) > 0) {
        if (action === 'buy') {
          adjustedQuantityChange = Math.floor(Math.abs(quantityChange) / opts.minimumTradingUnit) * opts.minimumTradingUnit
        } else if (action === 'sell') {
          adjustedQuantityChange = -Math.floor(Math.abs(quantityChange) / opts.minimumTradingUnit) * opts.minimumTradingUnit
        }
        adjustedValueChange = adjustedQuantityChange * currentPrice
      }
      
      // Factor in commission costs if enabled
      if (opts.considerCommission && opts.commission > 0 && Math.abs(adjustedQuantityChange) > 0) {
        const commissionCost = Math.abs(adjustedQuantityChange) * opts.commission
        // Reduce trade size if commission makes it uneconomical
        if (commissionCost > Math.abs(adjustedValueChange) * 0.1) { // 10% threshold
          adjustedQuantityChange = 0
          adjustedValueChange = 0
          action = 'hold'
        }
      }
      
      // Track total buy/sell values
      if (adjustedValueChange > 0) {
        totalBuyValue += adjustedValueChange
      } else if (adjustedValueChange < 0) {
        totalSellValue += Math.abs(adjustedValueChange)
      }
      
      const calculation: RebalancingCalculation = {
        stock_name: targetStock?.stock_name || currentStock?.stock_name || stockKey,
        ticker: targetStock?.ticker || currentStock?.ticker || undefined,
        currentQuantity,
        currentWeight,
        targetWeight,
        currentValue,
        targetValue,
        difference,
        action,
        quantityChange,
        valueChange,
        minimumTradingUnit: opts.minimumTradingUnit,
        adjustedQuantityChange,
        adjustedValueChange
      }
      
      calculations.push(calculation)
    })
    
    // Calculate summary metrics
    const hasSignificantDifferences = calculations.some(
      calc => Math.abs(calc.difference) > opts.rebalanceThreshold
    )
    
    const isBalanced = !hasSignificantDifferences
    const totalRebalanceValue = Math.abs(totalBuyValue - totalSellValue)
    
    return {
      calculations: calculations.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference)),
      totalCurrentValue: currentPortfolio.totalValue,
      totalTargetValue: currentPortfolio.totalValue, // Target maintains same total value
      totalRebalanceValue,
      totalBuyValue,
      totalSellValue,
      isBalanced,
      hasSignificantDifferences,
      rebalanceThreshold: opts.rebalanceThreshold
    }
  }
  
  /**
   * Get rebalancing recommendations as actionable items
   * @param result Rebalancing calculation result
   * @returns Array of actionable recommendations
   */
  static getRebalancingRecommendations(result: RebalancingResult): string[] {
    const recommendations: string[] = []
    
    if (result.isBalanced) {
      recommendations.push('Your portfolio is well-balanced and aligned with your target allocation.')
      return recommendations
    }
    
    // Group recommendations by action
    const buyActions = result.calculations.filter(calc => calc.action === 'buy' && calc.adjustedQuantityChange > 0)
    const sellActions = result.calculations.filter(calc => calc.action === 'sell' && calc.adjustedQuantityChange < 0)
    
    if (buyActions.length > 0) {
      recommendations.push('Consider buying:')
      buyActions.forEach(calc => {
        recommendations.push(
          `  • ${calc.stock_name}: ${Math.abs(calc.adjustedQuantityChange)} shares (${calc.adjustedValueChange.toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`
        )
      })
    }
    
    if (sellActions.length > 0) {
      recommendations.push('Consider selling:')
      sellActions.forEach(calc => {
        recommendations.push(
          `  • ${calc.stock_name}: ${Math.abs(calc.adjustedQuantityChange)} shares (${Math.abs(calc.adjustedValueChange).toLocaleString('en-US', { style: 'currency', currency: 'USD' })})`
        )
      })
    }
    
    if (result.totalRebalanceValue > 0) {
      recommendations.push(
        `Total rebalancing value: ${result.totalRebalanceValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`
      )
    }
    
    return recommendations
  }
  
  /**
   * Validate rebalancing calculations
   * @param result Rebalancing calculation result
   * @returns Validation result with any issues found
   */
  static validateCalculations(result: RebalancingResult): { isValid: boolean; issues: string[] } {
    const issues: string[] = []
    
    // Check if total weights add up to 100%
    const totalTargetWeight = result.calculations.reduce((sum, calc) => sum + calc.targetWeight, 0)
    if (Math.abs(totalTargetWeight - 100) > 0.01) {
      issues.push(`Target weights total ${totalTargetWeight.toFixed(2)}% instead of 100%`)
    }
    
    // Check for negative quantities after rebalancing
    const negativeQuantities = result.calculations.filter(
      calc => calc.currentQuantity + calc.adjustedQuantityChange < 0
    )
    if (negativeQuantities.length > 0) {
      issues.push(`Negative quantities would result for: ${negativeQuantities.map(calc => calc.stock_name).join(', ')}`)
    }
    
    // Check for extreme rebalancing (>50% of portfolio value)
    if (result.totalRebalanceValue > result.totalCurrentValue * 0.5) {
      issues.push('Rebalancing requires moving more than 50% of portfolio value - consider gradual rebalancing')
    }
    
    return {
      isValid: issues.length === 0,
      issues
    }
  }
}

export const rebalancingService = RebalancingService