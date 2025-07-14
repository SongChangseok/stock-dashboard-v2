import React from 'react'
import type { TargetPortfolioListProps } from '../types'

export const TargetPortfolioList: React.FC<TargetPortfolioListProps> = ({
  portfolios,
  onEdit,
  onDelete,
  onAdd
}) => {
  const handleDelete = (portfolioId: string, portfolioName: string) => {
    if (window.confirm(`Are you sure you want to delete "${portfolioName}"?`)) {
      onDelete(portfolioId)
    }
  }

  if (portfolios.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold">Target Portfolios</h2>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Create Portfolio
          </button>
        </div>
        <div className="p-8 md:p-16 text-center">
          <div className="text-4xl md:text-6xl mb-4 opacity-50">🎯</div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">No Target Portfolios Yet</h3>
          <p className="text-gray-400 mb-6 text-sm md:text-base">Create your first target portfolio to define your ideal allocation strategy</p>
          <button
            onClick={onAdd}
            className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Create Your First Portfolio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold">Target Portfolios</h2>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:inline">Create Portfolio</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Desktop Grid View */}
      <div className="hidden md:block p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="bg-white/3 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
                  {portfolio.description && (
                    <p className="text-sm text-gray-400 mt-1">{portfolio.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(portfolio)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg hover:bg-blue-600/30 transition-colors"
                    title="Edit Portfolio"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio.id, portfolio.name)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                    title="Delete Portfolio"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Stocks:</span>
                  <span className="text-white font-medium">{portfolio.stocks.length}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Weight:</span>
                  <span className={`font-medium ${Math.abs(portfolio.total_weight - 100) <= 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                    {portfolio.total_weight.toFixed(1)}%
                  </span>
                </div>
                
                {/* Top 3 Holdings */}
                <div className="space-y-2">
                  <span className="text-xs text-gray-400">Top Holdings:</span>
                  <div className="space-y-1">
                    {portfolio.stocks
                      .sort((a, b) => b.target_weight - a.target_weight)
                      .slice(0, 3)
                      .map((stock, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-300">
                            {stock.ticker || stock.stock_name}
                          </span>
                          <span className="text-gray-400">
                            {stock.target_weight.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Updated {new Date(portfolio.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-3 p-4">
        {portfolios.map((portfolio) => (
          <div key={portfolio.id} className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{portfolio.name}</h3>
                {portfolio.description && (
                  <p className="text-sm text-gray-400 mt-1">{portfolio.description}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Stocks</div>
                <div className="text-white font-medium">{portfolio.stocks.length}</div>
              </div>
              <div>
                <div className="text-gray-400">Total Weight</div>
                <div className={`font-medium ${Math.abs(portfolio.total_weight - 100) <= 0.01 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio.total_weight.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(portfolio)}
                className="flex-1 min-h-[44px] bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg font-medium hover:bg-blue-600/30 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(portfolio.id, portfolio.name)}
                className="flex-1 min-h-[44px] bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg font-medium hover:bg-red-600/30 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}