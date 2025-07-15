import React from 'react'
import type { RebalancingCalculation } from '../types'
import { formatCurrency } from '../utils'

interface TradingGuideCardProps {
  calculation: RebalancingCalculation
  commission: number
}

const TradingGuideCard: React.FC<TradingGuideCardProps> = ({
  calculation,
  commission,
}) => {
  const { 
    stock_name, 
    ticker, 
    action, 
    adjustedQuantityChange, 
    adjustedValueChange, 
    currentWeight, 
    targetWeight, 
    difference 
  } = calculation

  if (action === 'hold') {
    return (
      <div className="bg-gray-500/10 border border-gray-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-500"></div>
            <div>
              <h4 className="font-medium text-white">{stock_name}</h4>
              {ticker && <p className="text-xs text-gray-400">{ticker}</p>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 text-sm">HOLD</div>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          Current allocation: {currentWeight.toFixed(1)}% (target: {targetWeight.toFixed(1)}%)
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Portfolio is balanced - no action needed
        </div>
      </div>
    )
  }

  const totalCost = Math.abs(adjustedValueChange) + (Math.abs(adjustedQuantityChange) * commission)
  const actionIcon = action === 'buy' ? '↗' : '↘'

  const cardClasses = action === 'buy' 
    ? 'bg-green-500/10 border-green-500/20' 
    : 'bg-red-500/10 border-red-500/20'
  const dotClasses = action === 'buy' 
    ? 'bg-green-500' 
    : 'bg-red-500'
  const textClasses = action === 'buy' 
    ? 'text-green-400' 
    : 'text-red-400'

  return (
    <div className={`${cardClasses} border rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${dotClasses}`}></div>
          <div>
            <h4 className="font-medium text-white">{stock_name}</h4>
            {ticker && <p className="text-xs text-gray-400">{ticker}</p>}
          </div>
        </div>
        <div className="text-right">
          <div className={`${textClasses} text-sm font-medium flex items-center gap-1`}>
            <span>{actionIcon}</span>
            <span>{action.toUpperCase()}</span>
          </div>
          <div className="text-xs text-gray-400">
            {difference > 0 ? 'Overweight' : 'Underweight'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-sm">
          <div className="text-gray-400 mb-1">Current Weight</div>
          <div className="font-medium">{currentWeight.toFixed(1)}%</div>
        </div>
        <div className="text-sm">
          <div className="text-gray-400 mb-1">Target Weight</div>
          <div className="font-medium">{targetWeight.toFixed(1)}%</div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="text-sm">
            <div className="text-gray-400 mb-1">Quantity</div>
            <div className={`font-medium ${textClasses}`}>
              {adjustedQuantityChange > 0 ? '+' : ''}{adjustedQuantityChange.toFixed(0)} shares
            </div>
          </div>
          <div className="text-sm">
            <div className="text-gray-400 mb-1">Trade Value</div>
            <div className={`font-medium ${textClasses}`}>
              {formatCurrency(Math.abs(adjustedValueChange))}
            </div>
          </div>
        </div>

        {commission > 0 && (
          <div className="text-xs text-gray-400 mb-2">
            Commission: {formatCurrency(Math.abs(adjustedQuantityChange) * commission)}
          </div>
        )}

        <div className="text-sm">
          <div className="text-gray-400 mb-1">Total Cost</div>
          <div className={`font-semibold ${textClasses}`}>
            {formatCurrency(totalCost)}
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-white/5 rounded text-xs text-gray-300">
        <div className="font-medium mb-1">Trading Guide:</div>
        <div>
          {action === 'buy' 
            ? `Purchase ${Math.abs(adjustedQuantityChange)} shares to reach target allocation` 
            : `Sell ${Math.abs(adjustedQuantityChange)} shares to reduce position`}
        </div>
      </div>
    </div>
  )
}

export default TradingGuideCard