import React from 'react'
import type { PortfolioSummary as PortfolioSummaryType } from '../types/database'
import { stockService } from '../services/stockService'

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ summary }) => {
  const dailyChange = summary.totalValue * 0.0067 // Simulated daily change

  const summaryCards = [
    {
      title: 'Total Investment',
      value: stockService.formatCurrency(summary.totalCost),
      subtitle: 'Cost Basis',
      color: 'text-gray-300'
    },
    {
      title: 'Current Value',
      value: stockService.formatCurrency(summary.totalValue),
      subtitle: `${stockService.formatCurrency(summary.totalProfitLoss)} (${stockService.formatPercentage(summary.totalProfitLossPercent)})`,
      color: summary.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Daily Change',
      value: stockService.formatCurrency(dailyChange),
      subtitle: stockService.formatPercentage(0.67),
      color: dailyChange >= 0 ? 'text-green-400' : 'text-red-400'
    },
    {
      title: 'Holdings',
      value: summary.stocks.length.toString(),
      subtitle: 'Total Stocks',
      color: 'text-gray-300'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <div
          key={card.title}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden"
          style={{
            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="text-sm text-gray-400 mb-2">{card.title}</div>
          <div className="text-2xl font-bold mb-2">{card.value}</div>
          <div className={`text-sm ${card.color === 'text-gray-300' ? 'text-gray-400' : card.color}`}>
            {card.subtitle}
          </div>
        </div>
      ))}
      
    </div>
  )
}