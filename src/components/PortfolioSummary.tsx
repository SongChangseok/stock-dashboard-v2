import React from 'react'
import type { PortfolioSummaryProps } from '../types'
import { formatCurrency, formatPercentageValue, calculateSimulatedDailyChange, BUSINESS_RULES } from '../utils'

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ summary }) => {
  const dailyChangeData = calculateSimulatedDailyChange(summary.totalValue, BUSINESS_RULES.DAILY_CHANGE_SIMULATION)

  const summaryCards = [
    {
      title: 'Total Investment',
      value: formatCurrency(summary.totalCost),
      subtitle: 'Cost Basis',
      color: 'text-gray-300'
    },
    {
      title: 'Current Value',
      value: formatCurrency(summary.totalValue),
      subtitle: `${formatCurrency(summary.totalProfitLoss)} (${formatPercentageValue(summary.totalProfitLossPercent)})`,
      color: summary.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Daily Change',
      value: formatCurrency(dailyChangeData.changeAmount),
      subtitle: formatPercentageValue(dailyChangeData.changePercentage),
      color: dailyChangeData.isPositive ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Holdings',
      value: summary.stocks.length.toString(),
      subtitle: 'Total Stocks',
      color: 'text-gray-300'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8 px-4 md:px-0">
      {summaryCards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 backdrop-blur-xl relative overflow-hidden min-h-[120px] md:min-h-[140px]"
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="text-xs md:text-sm text-gray-400 mb-2 md:mb-3">{card.title}</div>
          <div className="text-xl md:text-2xl font-bold mb-1 md:mb-2 leading-tight">{card.value}</div>
          <div className={`text-xs md:text-sm ${card.color === 'text-gray-300' ? 'text-gray-400' : card.color}`}>
            {card.subtitle}
          </div>
        </div>
      ))}
      
    </div>
  )
}