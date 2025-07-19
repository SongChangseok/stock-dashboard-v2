import { supabase } from './supabase'
import { getCurrentUserId } from './authHelpers'
import type { 
  PortfolioSnapshot, 
  StockSnapshot, 
  CreateSnapshotRequest, 
  CreateSnapshotResponse,
  GetHistoryRequest,
  GetHistoryResponse,
  PerformanceMetrics,
  StockPerformanceMetrics
} from '../types/portfolioHistory'

export class PortfolioHistoryService {
  /**
   * Create a daily portfolio snapshot
   */
  async createSnapshot(request: CreateSnapshotRequest): Promise<CreateSnapshotResponse> {
    try {
      const { user_id, date = new Date().toISOString().split('T')[0] } = request

      const { data, error } = await supabase
        .rpc('create_daily_portfolio_snapshot', {
          p_user_id: user_id,
          p_date: date
        })

      if (error) {
        throw new Error(`Failed to create portfolio snapshot: ${error.message}`)
      }

      return {
        snapshot_id: data,
        success: true
      }
    } catch (error) {
      return {
        snapshot_id: '',
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get portfolio history with optional date range filtering
   */
  async getHistory(request: GetHistoryRequest): Promise<GetHistoryResponse> {
    try {
      const { 
        user_id, 
        start_date, 
        end_date, 
        limit = 365, 
        include_stocks = false 
      } = request

      let query = supabase
        .from('portfolio_snapshots')
        .select(include_stocks ? `
          *,
          stock_snapshots (*)
        ` : '*')
        .eq('user_id', user_id)
        .order('snapshot_date', { ascending: false })
        .limit(limit)

      if (start_date) {
        query = query.gte('snapshot_date', start_date)
      }

      if (end_date) {
        query = query.lte('snapshot_date', end_date)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(`Failed to fetch portfolio history: ${error.message}`)
      }

      return {
        data: data || [],
        count: count || 0,
        hasMore: (data?.length || 0) >= limit
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch portfolio history'
      )
    }
  }

  /**
   * Get portfolio snapshots for a specific date range
   */
  async getSnapshotsByDateRange(
    startDate: string, 
    endDate: string, 
    includeStocks = false
  ): Promise<PortfolioSnapshot[]> {
    try {
      const userId = await getCurrentUserId()

      const request: GetHistoryRequest = {
        user_id: userId,
        start_date: startDate,
        end_date: endDate,
        include_stocks: includeStocks,
        limit: 1000 // Large limit for full date range
      }

      const response = await this.getHistory(request)
      return response.data
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch snapshots by date range'
      )
    }
  }

  /**
   * Get the latest portfolio snapshot
   */
  async getLatestSnapshot(includeStocks = false): Promise<PortfolioSnapshot | null> {
    try {
      const userId = await getCurrentUserId()

      const request: GetHistoryRequest = {
        user_id: userId,
        limit: 1,
        include_stocks: includeStocks
      }

      const response = await this.getHistory(request)
      return response.data[0] || null
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to fetch latest snapshot'
      )
    }
  }

  /**
   * Create snapshot for current user
   */
  async createSnapshotForCurrentUser(date?: string): Promise<CreateSnapshotResponse> {
    try {
      const userId = await getCurrentUserId()
      
      return await this.createSnapshot({
        user_id: userId,
        date
      })
    } catch (error) {
      return {
        snapshot_id: '',
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create snapshot'
      }
    }
  }

  /**
   * Calculate performance metrics from snapshots
   */
  calculatePerformanceMetrics(snapshots: PortfolioSnapshot[]): PerformanceMetrics | null {
    if (snapshots.length < 2) {
      return null
    }

    // Sort snapshots by date (oldest first)
    const sortedSnapshots = [...snapshots].sort((a, b) => 
      new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
    )

    const firstSnapshot = sortedSnapshots[0]
    const lastSnapshot = sortedSnapshots[sortedSnapshots.length - 1]

    // Calculate daily returns
    const dailyReturns: number[] = []
    let maxValue = firstSnapshot.total_value
    let maxDrawdown = 0
    let bestDay = { date: '', return: 0, returnPercentage: 0 }
    let worstDay = { date: '', return: 0, returnPercentage: 0 }

    for (let i = 1; i < sortedSnapshots.length; i++) {
      const current = sortedSnapshots[i]
      const previous = sortedSnapshots[i - 1]
      
      const dailyReturn = current.total_value - previous.total_value
      const dailyReturnPercentage = previous.total_value > 0 
        ? (dailyReturn / previous.total_value) * 100 
        : 0

      dailyReturns.push(dailyReturnPercentage)

      // Track best and worst days
      if (dailyReturn > bestDay.return) {
        bestDay = {
          date: current.snapshot_date,
          return: dailyReturn,
          returnPercentage: dailyReturnPercentage
        }
      }

      if (dailyReturn < worstDay.return) {
        worstDay = {
          date: current.snapshot_date,
          return: dailyReturn,
          returnPercentage: dailyReturnPercentage
        }
      }

      // Calculate max drawdown
      maxValue = Math.max(maxValue, current.total_value)
      const drawdown = ((maxValue - current.total_value) / maxValue) * 100
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }

    // Calculate metrics
    const totalReturn = lastSnapshot.total_value - firstSnapshot.total_value
    const totalReturnPercentage = firstSnapshot.total_value > 0 
      ? (totalReturn / firstSnapshot.total_value) * 100 
      : 0

    const averageDailyReturn = dailyReturns.length > 0 
      ? dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length 
      : 0

    // Calculate volatility (standard deviation of daily returns)
    const variance = dailyReturns.length > 0 
      ? dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - averageDailyReturn, 2), 0) / dailyReturns.length
      : 0
    const volatility = Math.sqrt(variance)

    // Calculate Sharpe ratio (assuming 0% risk-free rate)
    const sharpeRatio = volatility > 0 ? averageDailyReturn / volatility : 0

    const profitableDays = dailyReturns.filter(ret => ret > 0).length
    const profitableDaysPercentage = dailyReturns.length > 0 
      ? (profitableDays / dailyReturns.length) * 100 
      : 0

    return {
      totalReturn,
      totalReturnPercentage,
      averageDailyReturn,
      volatility,
      sharpeRatio,
      maxDrawdown,
      bestDay,
      worstDay,
      totalDays: sortedSnapshots.length,
      profitableDays,
      profitableDaysPercentage
    }
  }

  /**
   * Calculate individual stock performance metrics
   */
  calculateStockPerformanceMetrics(snapshots: PortfolioSnapshot[]): StockPerformanceMetrics[] {
    if (snapshots.length === 0) {
      return []
    }

    const stockMetrics = new Map<string, {
      stock_name: string
      ticker?: string
      returns: number[]
      weights: number[]
      values: number[]
      costs: number[]
    }>()

    // Collect data for each stock across all snapshots
    snapshots.forEach(snapshot => {
      if (snapshot.stock_snapshots) {
        snapshot.stock_snapshots.forEach(stock => {
          const key = stock.stock_name
          
          if (!stockMetrics.has(key)) {
            stockMetrics.set(key, {
              stock_name: stock.stock_name,
              ticker: stock.ticker,
              returns: [],
              weights: [],
              values: [],
              costs: []
            })
          }

          const metrics = stockMetrics.get(key)!
          metrics.returns.push(stock.gain_loss_percentage)
          metrics.weights.push(stock.weight_percentage)
          metrics.values.push(stock.total_value)
          metrics.costs.push(stock.total_cost)
        })
      }
    })

    // Calculate metrics for each stock
    return Array.from(stockMetrics.values()).map(stock => {
      const totalReturn = stock.values.length > 0 
        ? stock.values[stock.values.length - 1] - stock.costs[stock.costs.length - 1]
        : 0

      const totalCost = stock.costs.length > 0 ? stock.costs[stock.costs.length - 1] : 0
      const totalReturnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0

      const averageWeight = stock.weights.length > 0 
        ? stock.weights.reduce((sum, w) => sum + w, 0) / stock.weights.length 
        : 0

      const currentWeight = stock.weights.length > 0 ? stock.weights[stock.weights.length - 1] : 0

      // Calculate volatility of returns
      const avgReturn = stock.returns.length > 0 
        ? stock.returns.reduce((sum, r) => sum + r, 0) / stock.returns.length 
        : 0

      const variance = stock.returns.length > 0 
        ? stock.returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / stock.returns.length
        : 0
      const volatility = Math.sqrt(variance)

      // Calculate contribution to portfolio (simplified as current weight * total return)
      const contribution = (currentWeight / 100) * totalReturn
      const portfolioTotalValue = snapshots[snapshots.length - 1]?.total_value || 1
      const contributionPercentage = portfolioTotalValue > 0 
        ? (contribution / portfolioTotalValue) * 100 
        : 0

      return {
        stock_name: stock.stock_name,
        ticker: stock.ticker,
        totalReturn,
        totalReturnPercentage,
        averageWeight,
        currentWeight,
        volatility,
        contribution,
        contributionPercentage
      }
    })
  }

  /**
   * Delete snapshots older than specified days
   */
  async cleanupOldSnapshots(olderThanDays: number): Promise<void> {
    try {
      const userId = await getCurrentUserId()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      const { error } = await supabase
        .from('portfolio_snapshots')
        .delete()
        .eq('user_id', userId)
        .lt('snapshot_date', cutoffDate.toISOString().split('T')[0])

      if (error) {
        throw new Error(`Failed to cleanup old snapshots: ${error.message}`)
      }
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to cleanup old snapshots'
      )
    }
  }
}

export const portfolioHistoryService = new PortfolioHistoryService()