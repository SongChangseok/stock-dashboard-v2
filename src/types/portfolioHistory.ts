// Portfolio history and snapshot types
export interface PortfolioSnapshot {
  id: string
  user_id: string
  snapshot_date: string // ISO date string
  total_value: number
  total_cost: number
  total_gain_loss: number
  total_gain_loss_percentage: number
  created_at: string
  updated_at: string
  stock_snapshots?: StockSnapshot[]
}

export interface StockSnapshot {
  id: string
  portfolio_snapshot_id: string
  stock_name: string
  ticker?: string
  quantity: number
  purchase_price: number
  current_price: number
  total_value: number
  total_cost: number
  gain_loss: number
  gain_loss_percentage: number
  weight_percentage: number
  created_at: string
  updated_at: string
}

export interface PortfolioHistoryData {
  snapshots: PortfolioSnapshot[]
  dateRange: {
    start: string
    end: string
  }
  totalDataPoints: number
}

export interface HistoricalPerformanceMetrics {
  totalReturn: number
  totalReturnPercentage: number
  averageDailyReturn: number
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  bestDay: {
    date: string
    return: number
    returnPercentage: number
  }
  worstDay: {
    date: string
    return: number
    returnPercentage: number
  }
  totalDays: number
  profitableDays: number
  profitableDaysPercentage: number
}

export interface StockPerformanceMetrics {
  stock_name: string
  ticker?: string
  totalReturn: number
  totalReturnPercentage: number
  averageWeight: number
  currentWeight: number
  volatility: number
  contribution: number
  contributionPercentage: number
}

export interface DateRangeOption {
  label: string
  value: string
  days: number
}

export interface ChartDataPoint {
  date: string
  value: number
  cost: number
  gainLoss: number
  gainLossPercentage: number
  formattedDate: string
}

export interface StockChartDataPoint {
  date: string
  [stockName: string]: number | string // Dynamic stock names as keys
}

// API request/response types
export interface CreateSnapshotRequest {
  user_id: string
  date?: string // Optional, defaults to current date
}

export interface CreateSnapshotResponse {
  snapshot_id: string
  success: boolean
  message?: string
}

export interface GetHistoryRequest {
  user_id: string
  start_date?: string
  end_date?: string
  limit?: number
  include_stocks?: boolean
}

export interface GetHistoryResponse {
  data: PortfolioSnapshot[]
  count: number
  hasMore: boolean
}

export interface PortfolioHistoryFilters {
  dateRange: {
    start: string
    end: string
  }
  selectedStocks: string[]
  includeStockDetails: boolean
  groupBy: 'day' | 'week' | 'month'
}

export interface PortfolioHistoryState {
  snapshots: PortfolioSnapshot[]
  isLoading: boolean
  error: string | null
  filters: PortfolioHistoryFilters
  performanceMetrics: HistoricalPerformanceMetrics | null
  stockPerformanceMetrics: StockPerformanceMetrics[]
}

// Chart configuration types
export interface ChartConfig {
  showGrid: boolean
  showTooltip: boolean
  showLegend: boolean
  showDots: boolean
  strokeWidth: number
  colors: {
    value: string
    cost: string
    gainLoss: string
  }
}

export interface DateRangePreset {
  label: string
  getDates: () => { start: string; end: string }
}