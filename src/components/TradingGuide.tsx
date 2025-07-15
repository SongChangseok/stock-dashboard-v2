import React, { useState } from 'react'
import TradingGuideCard from './TradingGuideCard'
import RebalancingSimulation from './RebalancingSimulation'
import { formatCurrency } from '../utils'
import type { TradingGuideProps } from '../types'

const TradingGuide: React.FC<TradingGuideProps> = ({
  currentPortfolio,
  targetPortfolio,
  calculations,
  commission,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulation'>('guide')

  const actionableCalculations = calculations.filter(calc => calc.action !== 'hold')
  const totalTrades = actionableCalculations.length
  const totalBuyValue = actionableCalculations
    .filter(calc => calc.action === 'buy')
    .reduce((sum, calc) => sum + Math.abs(calc.adjustedValueChange), 0)
  const totalSellValue = actionableCalculations
    .filter(calc => calc.action === 'sell')
    .reduce((sum, calc) => sum + Math.abs(calc.adjustedValueChange), 0)
  const totalCommission = actionableCalculations
    .reduce((sum, calc) => sum + (Math.abs(calc.adjustedQuantityChange) * commission), 0)

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-semibold">Trading Guide</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Trading Cards
          </button>
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'simulation'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Simulation
          </button>
        </div>
      </div>

      {activeTab === 'guide' ? (
        <div className="space-y-6">
          {/* Trading Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Trades</div>
              <div className="text-white font-semibold">{totalTrades}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Buy Value</div>
              <div className="text-green-400 font-semibold">{formatCurrency(totalBuyValue)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Sell Value</div>
              <div className="text-red-400 font-semibold">{formatCurrency(totalSellValue)}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Total Commission</div>
              <div className="text-amber-400 font-semibold">{formatCurrency(totalCommission)}</div>
            </div>
          </div>

          {/* Action Required Section */}
          {actionableCalculations.length > 0 && (
            <div>
              <h4 className="text-base font-medium mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Action Required ({actionableCalculations.length} trades)
              </h4>
              <div className="grid gap-4">
                {actionableCalculations
                  .sort((a, b) => Math.abs(b.adjustedValueChange) - Math.abs(a.adjustedValueChange))
                  .map((calc, index) => (
                    <TradingGuideCard
                      key={`${calc.stock_name}-${index}`}
                      calculation={calc}
                      commission={commission}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Balanced Holdings Section */}
          {calculations.filter(calc => calc.action === 'hold').length > 0 && (
            <div>
              <h4 className="text-base font-medium mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Balanced Holdings ({calculations.filter(calc => calc.action === 'hold').length} stocks)
              </h4>
              <div className="grid gap-4">
                {calculations
                  .filter(calc => calc.action === 'hold')
                  .map((calc, index) => (
                    <TradingGuideCard
                      key={`${calc.stock_name}-hold-${index}`}
                      calculation={calc}
                      commission={commission}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {actionableCalculations.length > 0 && (
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <h4 className="text-indigo-400 font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span>Priority trades (largest deviations first)</span>
                  <span className="text-indigo-400">
                    {actionableCalculations.slice(0, 3).length} of {actionableCalculations.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Estimated completion time</span>
                  <span className="text-indigo-400">{Math.ceil(actionableCalculations.length / 3)} trading sessions</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Net cash requirement</span>
                  <span className={`font-medium ${
                    totalBuyValue > totalSellValue ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {formatCurrency(Math.abs(totalBuyValue - totalSellValue))}
                    {totalBuyValue > totalSellValue ? ' needed' : ' freed up'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* No Action Required */}
          {actionableCalculations.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">✅</div>
              <h4 className="text-lg font-medium text-green-400 mb-2">Portfolio is Balanced</h4>
              <p className="text-gray-400 text-sm">
                Your current allocation is aligned with your target portfolio. No trades are needed at this time.
              </p>
            </div>
          )}
        </div>
      ) : (
        <RebalancingSimulation
          currentPortfolio={currentPortfolio}
          targetPortfolio={targetPortfolio}
          calculations={calculations}
        />
      )}
    </div>
  )
}

export default TradingGuide