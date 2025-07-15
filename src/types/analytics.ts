/**
 * Portfolio analytics and insights types
 */

export interface PortfolioStockComparison {
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