import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { PortfolioComparison, RebalancingCalculator, TradingGuide, LoadingIndicator, IntersectionLazyLoader } from '../components'
import { usePortfolioStore, useTargetPortfolioStore } from '../stores'
import { rebalancingService } from '../services'
import { BUSINESS_RULES } from '../utils'
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
    minimumTradingUnit: BUSINESS_RULES.MIN_TRADING_UNIT,
    rebalanceThreshold: BUSINESS_RULES.REBALANCE_THRESHOLD,
    allowPartialShares: false,
    commission: BUSINESS_RULES.DEFAULT_COMMISSION,
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
          <LoadingIndicator size="lg" variant="spinner" color="white" />
          <p className="text-gray-400 mt-4">Loading target portfolios...</p>
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
      <IntersectionLazyLoader
        threshold={0.1}
        rootMargin="100px"
        fallback={<LoadingIndicator size="lg" variant="spinner" color="white" className="flex justify-center py-8" />}
      >
        <PortfolioComparison 
          currentPortfolio={portfolioSummary}
          targetPortfolio={selectedTargetPortfolio}
        />
      </IntersectionLazyLoader>

      {/* Rebalancing Calculator */}
      {selectedTargetPortfolio && portfolioSummary.stocks.length > 0 && (
        <div className="px-4 md:px-0">
          <IntersectionLazyLoader
            threshold={0.1}
            rootMargin="100px"
            fallback={<LoadingIndicator size="lg" variant="spinner" color="white" className="flex justify-center py-8" />}
          >
            <RebalancingCalculator 
              currentPortfolio={portfolioSummary}
              targetPortfolio={selectedTargetPortfolio}
              options={rebalancingOptions}
              onOptionsChange={setRebalancingOptions}
            />
          </IntersectionLazyLoader>
        </div>
      )}

      {/* Trading Guide */}
      {selectedTargetPortfolio && portfolioSummary.stocks.length > 0 && rebalancingResult && (
        <div className="px-4 md:px-0">
          <IntersectionLazyLoader
            threshold={0.1}
            rootMargin="100px"
            fallback={<LoadingIndicator size="lg" variant="spinner" color="white" className="flex justify-center py-8" />}
          >
            <TradingGuide 
              currentPortfolio={portfolioSummary}
              targetPortfolio={selectedTargetPortfolio}
              calculations={rebalancingResult.calculations}
              commission={rebalancingOptions.commission}
            />
          </IntersectionLazyLoader>
        </div>
      )}

    </div>
  )
}