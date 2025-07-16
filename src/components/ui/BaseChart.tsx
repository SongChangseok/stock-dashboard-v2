import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { BaseChartProps } from '../../types/components'
import { ChartData } from '../../types/base'
import { 
  CHART_CONFIG, 
  formatTooltipValue, 
  getChartHeight 
} from '../../utils/chartConfig'
import { useResponsive } from '../../hooks'

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: ChartData }>
}

const BaseChart: React.FC<BaseChartProps> = ({
  data,
  title,
  height,
  showLegend = true,
  className = ""
}) => {
  const { isMobile } = useResponsive()
  const chartHeight = height || getChartHeight(isMobile)

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div
          style={CHART_CONFIG.tooltip.contentStyle}
          className="p-3 rounded-lg"
        >
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300">
            Value: {formatTooltipValue(data.value, 'value')[0]}
          </p>
          <p className="text-gray-300">
            Percentage: {formatTooltipValue(data.percentage, 'percentage')[0]}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl ${className}`}>
      {title && (
        <div className="p-4 md:p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
      )}
      
      <div className="p-4 md:p-6">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={!isMobile}
              outerRadius={isMobile ? 80 : 100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={CHART_CONFIG.legend.wrapperStyle}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-white text-sm">{value}</span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BaseChart