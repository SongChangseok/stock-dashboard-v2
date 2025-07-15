/**
 * Portfolio Analytics Service
 * Provides advanced analytics and insights for portfolio management
 */

import type { 
  PortfolioSummary, 
  TargetPortfolioData, 
  RebalancingCalculation
} from '../types'
import { 
  calculateWeightDifference, 
  isRebalancingNeeded, 
  calculateTradingSummary,
  calculateStockWeight
} from '../utils/calculations'
import { BUSINESS_RULES } from '../utils/constants'

export interface PortfolioComparison {
  currentWeight: number
  targetWeight: number
  difference: number
  isSignificant: boolean
  action: 'buy' | 'sell' | 'hold'
}

export interface PortfolioAnalytics {
  totalValue: number
  stockCount: number
  diversificationScore: number
  riskMetrics: RiskMetrics
  performanceMetrics: PerformanceMetrics
}

export interface RiskMetrics {
  concentration: number // Highest single stock weight
  volatility: number // Portfolio volatility estimate
  diversificationRatio: number // 1 = perfectly diversified
}

export interface PerformanceMetrics {
  totalReturn: number
  totalReturnPercentage: number
  topPerformer: string | null
  worstPerformer: string | null
  winRate: number // Percentage of profitable positions
}

export interface TradingInsights {
  totalTrades: number
  buyTrades: number
  sellTrades: number
  totalValue: number
  totalCommission: number
  efficiency: number // Value moved per trade
  priority: 'high' | 'medium' | 'low'
}

export class PortfolioAnalyticsService {
  /**
   * Compare current portfolio with target allocation
   * @param currentPortfolio Current portfolio data
   * @param targetPortfolio Target portfolio allocation
   * @returns Detailed comparison metrics
   */
  static comparePortfolios(
    currentPortfolio: PortfolioSummary,
    targetPortfolio: TargetPortfolioData
  ): Map<string, PortfolioComparison> {
    const comparison = new Map<string, PortfolioComparison>()
    
    // Create stock mapping
    const currentStockMap = new Map(
      currentPortfolio.stocks.map(stock => [
        stock.ticker || stock.stock_name,
        stock
      ])
    )
    
    const allocations = targetPortfolio.allocations as { stocks: Array<{ stock_name: string; ticker?: string; target_weight: number }> }
    const targetStocks = allocations.stocks || []
    
    // Compare each target stock
    for (const targetStock of targetStocks) {
      const key = targetStock.ticker || targetStock.stock_name
      const currentStock = currentStockMap.get(key)
      
      const currentWeight = currentStock ? calculateStockWeight(currentStock.totalValue, currentPortfolio.totalValue) : 0
      const targetWeight = targetStock.target_weight
      const difference = calculateWeightDifference(currentWeight, targetWeight)
      const isSignificant = isRebalancingNeeded(difference, BUSINESS_RULES.REBALANCE_THRESHOLD)
      
      let action: 'buy' | 'sell' | 'hold' = 'hold'
      if (isSignificant) {
        action = difference > 0 ? 'sell' : 'buy'
      }
      
      comparison.set(key, {
        currentWeight,
        targetWeight,
        difference,
        isSignificant,
        action
      })
    }
    
    return comparison
  }

  /**
   * Calculate comprehensive portfolio analytics
   * @param portfolio Portfolio data
   * @returns Portfolio analytics metrics
   */
  static calculatePortfolioAnalytics(portfolio: PortfolioSummary): PortfolioAnalytics {
    const riskMetrics = this.calculateRiskMetrics(portfolio)
    const performanceMetrics = this.calculatePerformanceMetrics(portfolio)
    const diversificationScore = this.calculateDiversificationScore(portfolio)
    
    return {
      totalValue: portfolio.totalValue,
      stockCount: portfolio.stocks.length,
      diversificationScore,
      riskMetrics,
      performanceMetrics
    }
  }

  /**
   * Calculate risk metrics for portfolio
   * @param portfolio Portfolio data
   * @returns Risk assessment metrics
   */
  static calculateRiskMetrics(portfolio: PortfolioSummary): RiskMetrics {
    const weights = portfolio.stocks.map(stock => calculateStockWeight(stock.totalValue, portfolio.totalValue))
    
    // Concentration risk (highest single position)
    const concentration = weights.length > 0 ? Math.max(...weights) : 0
    
    // Simple volatility estimate based on profit/loss variance
    const returns = portfolio.stocks.map(stock => stock.profitLossPercent || 0)
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length
    const volatility = Math.sqrt(variance)
    
    // Diversification ratio (inverse of concentration)
    const diversificationRatio = 1 / (concentration / 100)
    
    return {
      concentration,
      volatility,
      diversificationRatio
    }
  }

  /**
   * Calculate performance metrics for portfolio
   * @param portfolio Portfolio data
   * @returns Performance assessment metrics
   */
  static calculatePerformanceMetrics(portfolio: PortfolioSummary): PerformanceMetrics {
    const stocks = portfolio.stocks
    
    // Find top and worst performers
    const sortedByReturn = [...stocks].sort((a, b) => 
      (b.profitLossPercent || 0) - (a.profitLossPercent || 0)
    )
    
    const topPerformer = sortedByReturn[0]?.stock_name || null
    const worstPerformer = sortedByReturn[sortedByReturn.length - 1]?.stock_name || null
    
    // Calculate win rate
    const profitablePositions = stocks.filter(stock => (stock.profitLoss || 0) > 0).length
    const winRate = stocks.length > 0 ? (profitablePositions / stocks.length) * 100 : 0
    
    return {
      totalReturn: portfolio.totalProfitLoss,
      totalReturnPercentage: portfolio.totalProfitLossPercent,
      topPerformer,
      worstPerformer,
      winRate
    }
  }

  /**
   * Calculate diversification score (0-100)
   * @param portfolio Portfolio data
   * @returns Diversification score
   */
  static calculateDiversificationScore(portfolio: PortfolioSummary): number {
    if (portfolio.stocks.length === 0) return 0
    
    const weights = portfolio.stocks.map(stock => calculateStockWeight(stock.totalValue, portfolio.totalValue))
    
    // Perfect diversification would be equal weights
    const idealWeight = 100 / portfolio.stocks.length
    const deviations = weights.map(weight => Math.abs(weight - idealWeight))
    const avgDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length
    
    // Score based on how close to ideal distribution (100 = perfect)
    const score = Math.max(0, 100 - (avgDeviation * 2))
    
    return Math.round(score)
  }

  /**
   * Generate trading insights from rebalancing calculations
   * @param calculations Rebalancing calculations
   * @param commission Commission per trade
   * @returns Trading insights and recommendations
   */
  static generateTradingInsights(
    calculations: RebalancingCalculation[],
    commission = 0
  ): TradingInsights {
    const summary = calculateTradingSummary(calculations, commission)
    
    // Calculate efficiency (value moved per trade)
    const efficiency = summary.totalTrades > 0 
      ? (summary.totalBuyValue + summary.totalSellValue) / summary.totalTrades 
      : 0
    
    // Determine priority based on number of trades and values
    let priority: 'high' | 'medium' | 'low' = 'low'
    if (summary.totalTrades > 5 || summary.totalBuyValue > 10000) {
      priority = 'high'
    } else if (summary.totalTrades > 2 || summary.totalBuyValue > 1000) {
      priority = 'medium'
    }
    
    return {
      totalTrades: summary.totalTrades,
      buyTrades: summary.buyTrades,
      sellTrades: summary.sellTrades,
      totalValue: summary.totalBuyValue + summary.totalSellValue,
      totalCommission: summary.totalCommission,
      efficiency,
      priority
    }
  }

  /**
   * Detect portfolio imbalances and recommend actions
   * @param currentPortfolio Current portfolio
   * @param targetPortfolio Target portfolio
   * @returns Array of recommended actions
   */
  static detectImbalances(
    currentPortfolio: PortfolioSummary,
    targetPortfolio: TargetPortfolioData
  ): Array<{
    stockName: string
    issue: string
    recommendation: string
    severity: 'high' | 'medium' | 'low'
  }> {
    const comparison = this.comparePortfolios(currentPortfolio, targetPortfolio)
    const recommendations: Array<{
      stockName: string
      issue: string
      recommendation: string
      severity: 'high' | 'medium' | 'low'
    }> = []
    
    comparison.forEach((comp, stockName) => {
      if (comp.isSignificant) {
        const absDeficit = Math.abs(comp.difference)
        const severity = absDeficit > 10 ? 'high' : absDeficit > 5 ? 'medium' : 'low'
        
        const issue = comp.difference > 0 
          ? `Overweight by ${absDeficit.toFixed(1)}%`
          : `Underweight by ${absDeficit.toFixed(1)}%`
        
        const recommendation = comp.action === 'buy' 
          ? `Consider buying more ${stockName}`
          : `Consider reducing ${stockName} position`
        
        recommendations.push({
          stockName,
          issue,
          recommendation,
          severity
        })
      }
    })
    
    return recommendations.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Calculate portfolio health score (0-100)
   * @param portfolio Portfolio data
   * @returns Health score with breakdown
   */
  static calculateHealthScore(portfolio: PortfolioSummary): {
    overall: number
    diversification: number
    performance: number
    risk: number
  } {
    const analytics = this.calculatePortfolioAnalytics(portfolio)
    
    // Diversification score (already 0-100)
    const diversification = analytics.diversificationScore
    
    // Performance score based on positive return rate
    const performance = Math.max(0, Math.min(100, 
      50 + (analytics.performanceMetrics.winRate * 0.5)
    ))
    
    // Risk score (inverse of concentration)
    const risk = Math.max(0, 100 - analytics.riskMetrics.concentration)
    
    // Overall score (weighted average)
    const overall = Math.round(
      (diversification * 0.4) + 
      (performance * 0.3) + 
      (risk * 0.3)
    )
    
    return {
      overall,
      diversification: Math.round(diversification),
      performance: Math.round(performance),
      risk: Math.round(risk)
    }
  }
}