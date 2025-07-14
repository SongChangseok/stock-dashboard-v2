import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { PortfolioChartProps, ChartData } from '../types'
import { stockService } from '../services/stockService'

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


const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartData }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-gray-800/95 backdrop-blur-xl border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-white font-medium">{data.name}</p>
        <p className="text-indigo-400">{stockService.formatCurrency(data.value)}</p>
        <p className="text-gray-300">{data.percentage.toFixed(1)}%</p>
      </div>
    )
  }
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percentage } = props
  if (percentage < 5) return null // Don't show labels for small slices
  
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  )
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ summary }) => {
  if (!summary.stocks.length) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
        <h3 className="text-xl font-bold mb-6">Portfolio Allocation</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No stocks in portfolio</p>
            <p className="text-sm">Add stocks to see allocation chart</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData: ChartData[] = summary.stocks.map((stock, index) => ({
    name: stock.ticker || stock.stock_name,
    value: stock.totalValue,
    percentage: (stock.totalValue / summary.totalValue) * 100,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      
      <h3 className="text-xl font-bold mb-6">Portfolio Allocation</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="lg:col-span-2">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={2}
                  stroke="rgba(255,255,255,0.1)"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-gray-300 mb-4">Holdings</h4>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {chartData.map((item) => (
              <div 
                key={item.name} 
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-white truncate">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {item.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {stockService.formatCurrency(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}