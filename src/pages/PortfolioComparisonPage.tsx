import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PortfolioComparison, RebalancingCalculator, TradingGuide } from '../components'
import { usePortfolioStore, useTargetPortfolioStore } from '../stores'
import { rebalancingService } from '../services'
import type { RebalancingOptions } from '../types'

export const PortfolioComparisonPage: React.FC = () => {
  const { portfolioSummary } = usePortfolioStore()
  const { 
    targetPortfolios, 
    selectedTargetPortfolio, 
    isLoading,
    error,
    fetchTargetPortfolios,
    setSelectedTargetPortfolio,
    clearError
  } = useTargetPortfolioStore()

  // Rebalancing options state
  const [rebalancingOptions, setRebalancingOptions] = useState<RebalancingOptions>({
    minimumTradingUnit: 1,
    rebalanceThreshold: 5.0,
    allowPartialShares: false,
    commission: 0,
    considerCommission: false,
  })

  // Calculate rebalancing data
  const rebalancingResult = useMemo(() => {
    if (!selectedTargetPortfolio || !portfolioSummary.stocks.length) return null
    
    return rebalancingService.calculateRebalancing(
      portfolioSummary,
      selectedTargetPortfolio,
      rebalancingOptions
    )
  }, [portfolioSummary, selectedTargetPortfolio, rebalancingOptions])

  // Fetch target portfolios on component mount
  useEffect(() => {
    fetchTargetPortfolios()
  }, [fetchTargetPortfolios])

  // Loading state
  if (isLoading && targetPortfolios.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 160px)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading target portfolios...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="text-red-400 mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                clearError()
                fetchTargetPortfolios()
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Portfolio Comparison</h1>
        <p className="text-gray-400 text-sm md:text-base">
          Compare your current portfolio allocation with target portfolios
        </p>
      </div>

      {/* Target Portfolio Selection */}
      <div className="px-4 md:px-0">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-xl">
          <h3 className="text-lg font-semibold mb-4">Select Target Portfolio</h3>
          
          {targetPortfolios.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <h4 className="text-lg font-medium text-gray-300 mb-2">No Target Portfolios</h4>
              <p className="text-gray-400 text-sm mb-4">
                Create target portfolios to compare with your current allocation
              </p>
              <Link
                to="/target-portfolio"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Target Portfolio
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targetPortfolios.map((portfolio) => (
              <button
                key={portfolio.id}
                onClick={() => setSelectedTargetPortfolio(portfolio)}
                className={`
                  p-4 rounded-lg border transition-all duration-200 text-left min-h-[88px]
                  ${selectedTargetPortfolio?.id === portfolio.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                  }
                `}
              >
                <h4 className="font-medium mb-1">{portfolio.name}</h4>
                <p className="text-sm opacity-80">{portfolio.allocations.description || 'No description'}</p>
                <p className="text-xs mt-2 opacity-60">
                  {portfolio.allocations.stocks.length} assets
                </p>
              </button>
            ))}
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Comparison Component */}
      <PortfolioComparison 
        currentPortfolio={portfolioSummary}
        targetPortfolio={selectedTargetPortfolio}
      />

      {/* Rebalancing Calculator */}
      {selectedTargetPortfolio && portfolioSummary.stocks.length > 0 && (
        <div className="px-4 md:px-0">
          <RebalancingCalculator 
            currentPortfolio={portfolioSummary}
            targetPortfolio={selectedTargetPortfolio}
            options={rebalancingOptions}
            onOptionsChange={setRebalancingOptions}
          />
        </div>
      )}

      {/* Trading Guide */}
      {selectedTargetPortfolio && portfolioSummary.stocks.length > 0 && rebalancingResult && (
        <div className="px-4 md:px-0">
          <TradingGuide 
            currentPortfolio={portfolioSummary}
            targetPortfolio={selectedTargetPortfolio}
            calculations={rebalancingResult.calculations}
            commission={rebalancingOptions.commission}
            formatCurrency={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)}
          />
        </div>
      )}

    </div>
  )
}