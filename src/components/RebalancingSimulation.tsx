import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../utils'
import type { RebalancingSimulationProps, RebalancingSimulationChartData, TargetPortfolioAllocations } from '../types'

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981',
  '#06B6D4', '#8B5A2B', '#6B7280', '#F97316', '#84CC16', '#3B82F6'
]

const RebalancingSimulation: React.FC<RebalancingSimulationProps> = ({
  currentPortfolio,
  targetPortfolio,
  calculations,
}) => {
  const [showAfter, setShowAfter] = useState(false)

  const simulatedPortfolio = useMemo(() => {
    const stocks = currentPortfolio.stocks.map(stock => {
      const calc = calculations.find(c => 
        c.stock_name === stock.stock_name || 
        (c.ticker && c.ticker === stock.ticker)
      )
      
      if (calc) {
        const newQuantity = stock.quantity + calc.adjustedQuantityChange
        const newTotalValue = newQuantity * stock.current_price
        
        return {
          ...stock,
          quantity: newQuantity,
          totalValue: newTotalValue,
          profitLoss: newTotalValue - (stock.purchase_price * newQuantity),
          profitLossPercent: ((newTotalValue - (stock.purchase_price * newQuantity)) / (stock.purchase_price * newQuantity)) * 100
        }
      }
      
      return stock
    }).filter(stock => stock.quantity > 0)

    const totalValue = stocks.reduce((sum, stock) => sum + stock.totalValue, 0)
    const totalCost = stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.quantity), 0)
    const totalProfitLoss = totalValue - totalCost

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent: totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0,
      stocks
    }
  }, [currentPortfolio, calculations])

  const currentRebalancingSimulationChartData = currentPortfolio.stocks.map((stock, index) => ({
    name: stock.ticker || stock.stock_name,
    value: (stock.totalValue / currentPortfolio.totalValue) * 100,
    color: COLORS[index % COLORS.length]
  }))

  const simulatedRebalancingSimulationChartData = simulatedPortfolio.stocks.map((stock, index) => ({
    name: stock.ticker || stock.stock_name,
    value: (stock.totalValue / simulatedPortfolio.totalValue) * 100,
    color: COLORS[index % COLORS.length]
  }))

  const targetRebalancingSimulationChartData: RebalancingSimulationChartData[] = (targetPortfolio.allocations as TargetPortfolioAllocations).stocks.map((stock, index) => ({
    name: stock.ticker || stock.stock_name,
    value: stock.target_weight,
    color: COLORS[index % COLORS.length]
  }))

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: RebalancingSimulationChartData }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-indigo-400">{data.value.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-semibold">Rebalancing Simulation</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAfter(false)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              !showAfter 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Before
          </button>
          <button
            onClick={() => setShowAfter(true)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showAfter 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            After
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Current/Simulated Portfolio */}
        <div className="space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-center">
            {showAfter ? 'After Rebalancing' : 'Current Portfolio'}
          </h4>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={showAfter ? simulatedRebalancingSimulationChartData : currentRebalancingSimulationChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 768 ? 80 : 100}
                  innerRadius={window.innerWidth < 768 ? 40 : 50}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.1)"
                >
                  {(showAfter ? simulatedRebalancingSimulationChartData : currentRebalancingSimulationChartData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Portfolio */}
        <div className="space-y-4">
          <h4 className="text-base md:text-lg font-semibold text-center">Target Portfolio</h4>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetRebalancingSimulationChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 768 ? 80 : 100}
                  innerRadius={window.innerWidth < 768 ? 40 : 50}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.1)"
                >
                  {targetRebalancingSimulationChartData.map((entry, index) => (
                    <Cell key={`target-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Portfolio Metrics Comparison */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Portfolio Value</div>
          <div className="text-white font-semibold">
            {formatCurrency(showAfter ? simulatedPortfolio.totalValue : currentPortfolio.totalValue)}
          </div>
          {showAfter && (
            <div className={`text-xs ${
              simulatedPortfolio.totalValue > currentPortfolio.totalValue 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {simulatedPortfolio.totalValue > currentPortfolio.totalValue ? '+' : ''}
              {formatCurrency(simulatedPortfolio.totalValue - currentPortfolio.totalValue)}
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Total P&L</div>
          <div className={`font-semibold ${
            (showAfter ? simulatedPortfolio.totalProfitLoss : currentPortfolio.totalProfitLoss) >= 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {formatCurrency(showAfter ? simulatedPortfolio.totalProfitLoss : currentPortfolio.totalProfitLoss)}
          </div>
          {showAfter && (
            <div className={`text-xs ${
              simulatedPortfolio.totalProfitLoss > currentPortfolio.totalProfitLoss 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {simulatedPortfolio.totalProfitLoss > currentPortfolio.totalProfitLoss ? '+' : ''}
              {formatCurrency(simulatedPortfolio.totalProfitLoss - currentPortfolio.totalProfitLoss)}
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">P&L %</div>
          <div className={`font-semibold ${
            (showAfter ? simulatedPortfolio.totalProfitLossPercent : currentPortfolio.totalProfitLossPercent) >= 0 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {(showAfter ? simulatedPortfolio.totalProfitLossPercent : currentPortfolio.totalProfitLossPercent).toFixed(1)}%
          </div>
          {showAfter && (
            <div className={`text-xs ${
              simulatedPortfolio.totalProfitLossPercent > currentPortfolio.totalProfitLossPercent 
                ? 'text-green-400' 
                : 'text-red-400'
            }`}>
              {simulatedPortfolio.totalProfitLossPercent > currentPortfolio.totalProfitLossPercent ? '+' : ''}
              {(simulatedPortfolio.totalProfitLossPercent - currentPortfolio.totalProfitLossPercent).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Stocks Count</div>
          <div className="text-white font-semibold">
            {showAfter ? simulatedPortfolio.stocks.length : currentPortfolio.stocks.length}
          </div>
          {showAfter && (
            <div className={`text-xs ${
              simulatedPortfolio.stocks.length > currentPortfolio.stocks.length 
                ? 'text-green-400' 
                : simulatedPortfolio.stocks.length < currentPortfolio.stocks.length 
                  ? 'text-red-400' 
                  : 'text-gray-400'
            }`}>
              {simulatedPortfolio.stocks.length > currentPortfolio.stocks.length ? '+' : ''}
              {simulatedPortfolio.stocks.length - currentPortfolio.stocks.length}
            </div>
          )}
        </div>
      </div>

      {/* Allocation Comparison */}
      <div className="space-y-3">
        <h4 className="text-base font-medium">Allocation Comparison</h4>
        <div className="grid gap-2">
          {(showAfter ? simulatedRebalancingSimulationChartData : currentRebalancingSimulationChartData).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="text-white">{item.value.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">
                    {showAfter ? 'After' : 'Current'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-indigo-400">
                    {targetRebalancingSimulationChartData.find((t) => t.name === item.name)?.value.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-xs text-gray-400">Target</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RebalancingSimulation