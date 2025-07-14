import { PortfolioSummary } from './database'
import { TargetPortfolioData } from './targetPortfolio'

export interface RebalancingCalculation {
  stock_name: string
  ticker?: string
  currentQuantity: number
  currentWeight: number
  targetWeight: number
  currentValue: number
  targetValue: number
  difference: number
  action: 'buy' | 'sell' | 'hold'
  quantityChange: number
  valueChange: number
  minimumTradingUnit: number
  adjustedQuantityChange: number
  adjustedValueChange: number
}

export interface RebalancingResult {
  calculations: RebalancingCalculation[]
  totalCurrentValue: number
  totalTargetValue: number
  totalRebalanceValue: number
  totalBuyValue: number
  totalSellValue: number
  isBalanced: boolean
  hasSignificantDifferences: boolean
  rebalanceThreshold: number
}

export interface RebalancingOptions {
  minimumTradingUnit: number
  rebalanceThreshold: number
  allowPartialShares: boolean
  commission: number
  considerCommission: boolean
}

export interface RebalancingCalculatorProps {
  currentPortfolio: PortfolioSummary
  targetPortfolio: TargetPortfolioData
  options?: RebalancingOptions
  onOptionsChange?: (options: RebalancingOptions) => void
}
