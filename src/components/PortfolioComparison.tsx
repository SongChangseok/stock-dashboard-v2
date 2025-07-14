import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { PortfolioComparisonProps, ComparisonData, ComparisonTooltipProps } from '../types'

const COLORS = [
  '#6366F1', // Indigo - primary
  '#8B5CF6', // Violet  
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#8B5A2B', // Brown
  '#6B7280', // Gray
  '#F97316', // Orange
  '#84CC16', // Lime
  '#3B82F6', // Blue
]


const ComparisonTooltip: React.FC<ComparisonTooltipProps> = ({ active, payload, type }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = type === 'current' ? data.current : data.target
    return (
      <div className="bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{data.name}</p>
        <p className="text-indigo-400">
          {type === 'current' ? 'Current: ' : 'Target: '}
          {value.toFixed(1)}%
        </p>
        {type === 'current' && data.difference !== 0 && (
          <p className={`text-sm ${data.isOverweight ? 'text-red-400' : 'text-green-400'}`}>
            {data.isOverweight ? '+' : ''}{data.difference.toFixed(1)}% vs target
          </p>
        )}
      </div>
    )
  }
  return null
}

const RebalanceAlert: React.FC<{ hasSignificantDifferences: boolean }> = ({ hasSignificantDifferences }) => {
  if (!hasSignificantDifferences) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-green-500 text-xl">✓</div>
          <div>
            <h4 className="text-green-400 font-medium">Portfolio Balanced</h4>
            <p className="text-gray-300 text-sm">Your portfolio is well-aligned with your target allocation</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="text-amber-500 text-xl">⚠️</div>
        <div>
          <h4 className="text-amber-400 font-medium">Rebalancing Recommended</h4>
          <p className="text-gray-300 text-sm">Your portfolio has significant deviations from target allocation</p>
        </div>
      </div>
    </div>
  )
}

export const PortfolioComparison: React.FC<PortfolioComparisonProps> = ({ 
  currentPortfolio, 
  targetPortfolio 
}) => {
  if (!targetPortfolio) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-xl mx-4 md:mx-0">
        <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Portfolio Comparison</h3>
        <div className="flex items-center justify-center h-48 md:h-64 text-gray-400">
          <div className="text-center">
            <div className="text-3xl md:text-4xl mb-2">🎯</div>
            <p className="text-sm md:text-base">No target portfolio selected</p>
            <p className="text-xs md:text-sm">Set a target portfolio to compare allocations</p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentPortfolio.stocks.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-8 backdrop-blur-xl mx-4 md:mx-0">
        <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Portfolio Comparison</h3>
        <div className="flex items-center justify-center h-48 md:h-64 text-gray-400">
          <div className="text-center">
            <div className="text-3xl md:text-4xl mb-2">📊</div>
            <p className="text-sm md:text-base">No stocks in current portfolio</p>
            <p className="text-xs md:text-sm">Add stocks to compare with target allocation</p>
          </div>
        </div>
      </div>
    )
  }

  // Create comparison data
  const comparisonData: ComparisonData[] = []
  const stockMap = new Map<string, { current: number; target: number }>()

  // Map current portfolio weights
  currentPortfolio.stocks.forEach(stock => {
    const key = stock.ticker || stock.stock_name
    const weight = (stock.totalValue / currentPortfolio.totalValue) * 100
    stockMap.set(key, { current: weight, target: 0 })
  })

  // Map target portfolio weights
  targetPortfolio.allocations.stocks.forEach(stock => {
    const key = stock.ticker || stock.stock_name
    const existing = stockMap.get(key)
    if (existing) {
      existing.target = stock.target_weight
    } else {
      stockMap.set(key, { current: 0, target: stock.target_weight })
    }
  })

  // Create comparison array
  let colorIndex = 0
  stockMap.forEach((weights, name) => {
    const difference = weights.current - weights.target
    comparisonData.push({
      name,
      current: weights.current,
      target: weights.target,
      difference,
      isOverweight: difference > 0,
      color: COLORS[colorIndex % COLORS.length]
    })
    colorIndex++
  })

  // Prepare chart data
  const currentChartData = comparisonData
    .filter(item => item.current > 0)
    .map(item => ({
      ...item,
      percentage: item.current,
      value: item.current
    }))

  const targetChartData = comparisonData
    .filter(item => item.target > 0)
    .map(item => ({
      ...item,
      percentage: item.target,
      value: item.target
    }))

  // Check for significant differences (>5%)
  const hasSignificantDifferences = comparisonData.some(item => Math.abs(item.difference) > 5)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-xl mx-4 md:mx-0 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Portfolio Comparison</h3>

      <RebalanceAlert hasSignificantDifferences={hasSignificantDifferences} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Current Portfolio Chart */}
        <div className="space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-center">Current Portfolio</h4>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 768 ? 80 : 100}
                  innerRadius={window.innerWidth < 768 ? 40 : 50}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.1)"
                >
                  {currentChartData.map((entry, index) => (
                    <Cell key={`current-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ComparisonTooltip {...props} type="current" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Portfolio Chart */}
        <div className="space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-center">Target Portfolio</h4>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 768 ? 80 : 100}
                  innerRadius={window.innerWidth < 768 ? 40 : 50}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.1)"
                >
                  {targetChartData.map((entry, index) => (
                    <Cell key={`target-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={(props) => <ComparisonTooltip {...props} type="target" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparison Summary */}
      <div className="space-y-4">
        <h4 className="text-base md:text-lg font-semibold">Weight Differences</h4>
        <div className="grid gap-3">
          {comparisonData
            .filter(item => item.current > 0 || item.target > 0)
            .sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))
            .map((item) => (
            <div 
              key={item.name}
              className="flex items-center justify-between p-3 md:p-4 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm md:text-base font-medium text-white">
                  {item.name}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-right">
                <div className="text-xs md:text-sm">
                  <div className="text-gray-300">
                    {item.current.toFixed(1)}% → {item.target.toFixed(1)}%
                  </div>
                </div>
                
                <div className={`text-sm md:text-base font-medium px-2 py-1 rounded ${
                  Math.abs(item.difference) < 1 
                    ? 'text-green-400 bg-green-500/10' 
                    : item.isOverweight 
                      ? 'text-red-400 bg-red-500/10' 
                      : 'text-blue-400 bg-blue-500/10'
                }`}>
                  {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}