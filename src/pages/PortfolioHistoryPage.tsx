import { useState, useEffect } from 'react'
import { portfolioHistoryService } from '../services/portfolioHistoryService'
import type { 
  PortfolioSnapshot, 
  PerformanceMetrics, 
  StockPerformanceMetrics,
  DateRangePreset 
} from '../types/portfolioHistory'
import { Card } from '../components/ui/Card'
import LoadingButton from '../components/ui/LoadingButton'
import { EmptyState } from '../components/ui/EmptyState'

const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    label: '1 Week',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    label: '1 Month',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 1)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    label: '3 Months',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 3)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    label: '6 Months',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setMonth(start.getMonth() - 6)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  },
  {
    label: '1 Year',
    getDates: () => {
      const end = new Date()
      const start = new Date()
      start.setFullYear(start.getFullYear() - 1)
      return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    }
  }
]

export function PortfolioHistoryPage() {
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([])
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [stockMetrics, setStockMetrics] = useState<StockPerformanceMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<string>('3 Months')

  const loadData = async (dateRange?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const range = dateRange || selectedDateRange
      const preset = DATE_RANGE_PRESETS.find(p => p.label === range)
      
      let historySnapshots: PortfolioSnapshot[]
      
      if (preset) {
        const { start, end } = preset.getDates()
        historySnapshots = await portfolioHistoryService.getSnapshotsByDateRange(
          start, 
          end, 
          true // Include stock details
        )
      } else {
        // Default to 3 months if no preset found
        const { start, end } = DATE_RANGE_PRESETS[2].getDates()
        historySnapshots = await portfolioHistoryService.getSnapshotsByDateRange(
          start, 
          end, 
          true
        )
      }

      setSnapshots(historySnapshots)

      // Calculate performance metrics
      const metrics = portfolioHistoryService.calculatePerformanceMetrics(historySnapshots)
      setPerformanceMetrics(metrics)

      // Calculate stock performance metrics
      const stockPerformance = portfolioHistoryService.calculateStockPerformanceMetrics(historySnapshots)
      setStockMetrics(stockPerformance)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio history')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSnapshot = async () => {
    try {
      setIsCreatingSnapshot(true)
      setError(null)

      const response = await portfolioHistoryService.createSnapshotForCurrentUser()
      
      if (response.success) {
        // Reload data to include new snapshot
        await loadData()
      } else {
        setError(response.message || 'Failed to create snapshot')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create snapshot')
    } finally {
      setIsCreatingSnapshot(false)
    }
  }

  const handleDateRangeChange = (range: string) => {
    setSelectedDateRange(range)
    loadData(range)
  }

  useEffect(() => {
    loadData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading portfolio history...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio History</h1>
            <p className="text-gray-400">Track your portfolio performance over time</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <LoadingButton
              onClick={handleCreateSnapshot}
              isLoading={isCreatingSnapshot}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Snapshot
            </LoadingButton>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Date Range Selector */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Time Period</h2>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleDateRangeChange(preset.label)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedDateRange === preset.label
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {snapshots.length === 0 ? (
          <EmptyState
            title="No Portfolio History"
            description="Create your first portfolio snapshot to start tracking your performance over time."
            actionLabel="Create Snapshot"
            onAction={handleCreateSnapshot}
          />
        ) : (
          <div className="space-y-6">
            {/* Performance Metrics */}
            {performanceMetrics && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Performance Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Total Return</p>
                      <p className={`text-2xl font-bold ${
                        performanceMetrics.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(performanceMetrics.totalReturn)}
                      </p>
                      <p className={`text-sm ${
                        performanceMetrics.totalReturnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(performanceMetrics.totalReturnPercentage)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Avg Daily Return</p>
                      <p className={`text-2xl font-bold ${
                        performanceMetrics.averageDailyReturn >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(performanceMetrics.averageDailyReturn)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Volatility</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {formatPercentage(performanceMetrics.volatility)}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-1">Max Drawdown</p>
                      <p className="text-2xl font-bold text-red-400">
                        -{formatPercentage(performanceMetrics.maxDrawdown)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div>
                        <p className="text-gray-400 mb-2">Best Day</p>
                        <p className="text-green-400 font-semibold">
                          {formatPercentage(performanceMetrics.bestDay.returnPercentage)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(performanceMetrics.bestDay.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Worst Day</p>
                        <p className="text-red-400 font-semibold">
                          {formatPercentage(performanceMetrics.worstDay.returnPercentage)}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {new Date(performanceMetrics.worstDay.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 mb-2">Profitable Days</p>
                        <p className="text-blue-400 font-semibold">
                          {performanceMetrics.profitableDays} / {performanceMetrics.totalDays}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {formatPercentage(performanceMetrics.profitableDaysPercentage)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Stock Performance */}
            {stockMetrics.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-6">Stock Performance</h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-3 px-2">Stock</th>
                          <th className="text-right py-3 px-2">Total Return</th>
                          <th className="text-right py-3 px-2">Return %</th>
                          <th className="text-right py-3 px-2">Current Weight</th>
                          <th className="text-right py-3 px-2">Volatility</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockMetrics.map((stock) => (
                          <tr key={stock.stock_name} className="border-b border-gray-800">
                            <td className="py-3 px-2">
                              <div>
                                <p className="font-medium">{stock.stock_name}</p>
                                {stock.ticker && (
                                  <p className="text-gray-400 text-sm">{stock.ticker}</p>
                                )}
                              </div>
                            </td>
                            <td className={`text-right py-3 px-2 font-medium ${
                              stock.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(stock.totalReturn)}
                            </td>
                            <td className={`text-right py-3 px-2 font-medium ${
                              stock.totalReturnPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatPercentage(stock.totalReturnPercentage)}
                            </td>
                            <td className="text-right py-3 px-2 text-gray-300">
                              {formatPercentage(stock.currentWeight)}
                            </td>
                            <td className="text-right py-3 px-2 text-yellow-400">
                              {formatPercentage(stock.volatility)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )}

            {/* Snapshot History */}
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6">
                  Snapshot History ({snapshots.length} records)
                </h2>
                
                <div className="space-y-3">
                  {snapshots.slice(0, 10).map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {new Date(snapshot.snapshot_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {snapshot.stock_snapshots?.length || 0} stocks
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2 sm:mt-0">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(snapshot.total_value)}</p>
                          <p className="text-gray-400 text-sm">Portfolio Value</p>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-medium ${
                            snapshot.total_gain_loss >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatCurrency(snapshot.total_gain_loss)}
                          </p>
                          <p className={`text-sm ${
                            snapshot.total_gain_loss_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPercentage(snapshot.total_gain_loss_percentage)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {snapshots.length > 10 && (
                  <p className="text-center text-gray-400 text-sm mt-4">
                    Showing 10 of {snapshots.length} snapshots
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}