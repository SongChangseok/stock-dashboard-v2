import React, { useState, useMemo } from 'react'
import { rebalancingService } from '../services'
import { formatCurrency, BUSINESS_RULES } from '../utils'
import { usePerformanceMonitor } from '../hooks'
import type { RebalancingOptions, RebalancingCalculatorProps } from '../types'

const RebalancingCalculator: React.FC<RebalancingCalculatorProps> = React.memo(({
  currentPortfolio,
  targetPortfolio,
  options: externalOptions,
  onOptionsChange,
}) => {
  usePerformanceMonitor('RebalancingCalculator')
  
  const [internalOptions, setInternalOptions] = useState<RebalancingOptions>({
    minimumTradingUnit: BUSINESS_RULES.MIN_TRADING_UNIT,
    rebalanceThreshold: BUSINESS_RULES.REBALANCE_THRESHOLD,
    allowPartialShares: false,
    commission: BUSINESS_RULES.DEFAULT_COMMISSION,
    considerCommission: false,
  })

  const options = externalOptions || internalOptions
  const setOptions = onOptionsChange || ((newOptions: RebalancingOptions | ((prev: RebalancingOptions) => RebalancingOptions)) => {
    if (typeof newOptions === 'function') {
      setInternalOptions(newOptions)
    } else {
      setInternalOptions(newOptions)
    }
  })

  const [showDetails, setShowDetails] = useState(false)

  const rebalancingResult = useMemo(() => {
    return rebalancingService.calculateRebalancing(
      currentPortfolio,
      targetPortfolio,
      options,
    )
  }, [currentPortfolio, targetPortfolio, options])

  const recommendations = useMemo(() => {
    return rebalancingService.getRebalancingRecommendations(rebalancingResult)
  }, [rebalancingResult])

  const validation = useMemo(() => {
    return rebalancingService.validateCalculations(rebalancingResult)
  }, [rebalancingResult])


  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg md:text-xl font-semibold">
          Rebalancing Calculator
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Validation Issues */}
      {!validation.isValid && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="text-red-500 text-xl">⚠️</div>
            <div>
              <h4 className="text-red-400 font-medium mb-2">
                Validation Issues
              </h4>
              <ul className="text-sm text-red-300 space-y-1">
                {validation.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Total Buy</div>
          <div className="text-green-400 font-semibold">
            {formatCurrency(rebalancingResult.totalBuyValue)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Total Sell</div>
          <div className="text-red-400 font-semibold">
            {formatCurrency(rebalancingResult.totalSellValue)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Net Change</div>
          <div className="text-white font-semibold">
            {formatCurrency(rebalancingResult.totalRebalanceValue)}
          </div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <div
            className={`font-semibold ${rebalancingResult.isBalanced ? 'text-green-400' : 'text-amber-400'}`}
          >
            {rebalancingResult.isBalanced ? 'Balanced' : 'Needs Rebalancing'}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h4 className="text-base font-medium mb-3">Recommendations</h4>
        <div className="bg-white/5 rounded-lg p-4 space-y-2">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="text-sm text-gray-300">
              {recommendation.startsWith('  •') ? (
                <div className="ml-4 text-indigo-300">{recommendation}</div>
              ) : (
                <div
                  className={
                    recommendation.includes('Consider')
                      ? 'font-medium text-white'
                      : ''
                  }
                >
                  {recommendation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Calculations */}
      {showDetails && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium">Detailed Calculations</h4>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.allowPartialShares}
                  onChange={(e) => {
                    const newOptions = { ...options, allowPartialShares: e.target.checked }
                    setOptions(newOptions)
                  }}
                  className="rounded border-gray-600"
                />
                <span>Allow Partial Shares</span>
              </label>
              <label className="flex items-center gap-2">
                <span>Min Unit:</span>
                <input
                  type="number"
                  min="1"
                  value={options.minimumTradingUnit}
                  onChange={(e) => {
                    const newOptions = { ...options, minimumTradingUnit: Number(e.target.value) }
                    setOptions(newOptions)
                  }}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
                />
              </label>
              <label className="flex items-center gap-2">
                <span>Threshold:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={options.rebalanceThreshold}
                  onChange={(e) => {
                    const newOptions = { ...options, rebalanceThreshold: Number(e.target.value) }
                    setOptions(newOptions)
                  }}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
                />
                <span>%</span>
              </label>
              <label className="flex items-center gap-2">
                <span>Commission:</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={options.commission}
                  onChange={(e) => {
                    const newOptions = { ...options, commission: Number(e.target.value) }
                    setOptions(newOptions)
                  }}
                  className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-sm"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.considerCommission}
                  onChange={(e) => {
                    const newOptions = { ...options, considerCommission: e.target.checked }
                    setOptions(newOptions)
                  }}
                  className="rounded border-gray-600"
                />
                <span>Consider Commission</span>
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-2">Stock</th>
                  <th className="text-right p-2">Current</th>
                  <th className="text-right p-2">Target</th>
                  <th className="text-right p-2">Diff</th>
                  <th className="text-right p-2">Action</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {rebalancingResult.calculations
                  .filter(
                    (calc) => calc.currentWeight > 0 || calc.targetWeight > 0,
                  )
                  .map((calc, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="p-2 font-medium">{calc.stock_name}</td>
                      <td className="text-right p-2">
                        {calc.currentWeight.toFixed(1)}%
                      </td>
                      <td className="text-right p-2">
                        {calc.targetWeight.toFixed(1)}%
                      </td>
                      <td
                        className={`text-right p-2 ${
                          Math.abs(calc.difference) < 1
                            ? 'text-green-400'
                            : calc.difference > 0
                              ? 'text-red-400'
                              : 'text-blue-400'
                        }`}
                      >
                        {calc.difference > 0 ? '+' : ''}
                        {calc.difference.toFixed(1)}%
                      </td>
                      <td className="text-right p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            calc.action === 'buy'
                              ? 'bg-green-500/20 text-green-400'
                              : calc.action === 'sell'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {calc.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-right p-2">
                        {calc.adjustedQuantityChange !== 0 ? (
                          <span
                            className={
                              calc.adjustedQuantityChange > 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {calc.adjustedQuantityChange > 0 ? '+' : ''}
                            {calc.adjustedQuantityChange.toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="text-right p-2">
                        {calc.adjustedValueChange !== 0 ? (
                          <span
                            className={
                              calc.adjustedValueChange > 0
                                ? 'text-green-400'
                                : 'text-red-400'
                            }
                          >
                            {formatCurrency(calc.adjustedValueChange)}
                          </span>
                        ) : (
                          <span className="text-gray-400">$0</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
})

export default RebalancingCalculator
