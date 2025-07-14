import React from 'react'
import type { StockWithValue } from '../types/database'
import type { StockListProps } from '../types'
import { stockService } from '../services/stockService'

export const StockList: React.FC<StockListProps> = ({
  stocks,
  onEdit,
  onDelete,
  onAdd
}) => {
  const handleDelete = (stock: StockWithValue) => {
    if (window.confirm(`Are you sure you want to delete ${stock.stock_name}?`)) {
      onDelete(stock.id)
    }
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
        <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold">Holdings</h2>
          <button
            onClick={onAdd}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Add Stock
          </button>
        </div>
        <div className="p-8 md:p-16 text-center">
          <div className="text-4xl md:text-6xl mb-4 opacity-50">📈</div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">No Holdings Yet</h3>
          <p className="text-gray-400 mb-6 text-sm md:text-base">Start building your portfolio by adding your first stock</p>
          <button
            onClick={onAdd}
            className="min-h-[44px] px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Add Your First Stock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden">
      <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold">Holdings</h2>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="hidden sm:inline">Add Stock</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-white/2">
              <th className="p-4 text-left text-sm font-medium text-gray-400">Stock</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Quantity</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Avg Cost</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Current Price</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Market Value</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Gain/Loss</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Return %</th>
              <th className="p-4 text-left text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr 
                key={stock.id}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="p-4">
                  <div>
                    <div className="font-semibold text-white">
                      {stock.ticker || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {stock.stock_name}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-white">
                  {stock.quantity}
                </td>
                <td className="p-4 text-white">
                  {stockService.formatCurrency(stock.purchase_price)}
                </td>
                <td className="p-4 text-white">
                  {stockService.formatCurrency(stock.current_price)}
                </td>
                <td className="p-4 text-white">
                  {stockService.formatCurrency(stock.totalValue)}
                </td>
                <td className={`p-4 ${stock.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockService.formatCurrency(stock.profitLoss)}
                </td>
                <td className={`p-4 ${stock.profitLossPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockService.formatPercentage(stock.profitLossPercent)}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(stock)}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-sm hover:bg-blue-600/30 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(stock)}
                      className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded text-sm hover:bg-red-600/30 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-4">
        {stocks.map((stock) => (
          <div 
            key={stock.id}
            className="bg-white/3 border border-white/10 rounded-xl p-4 space-y-3"
          >
            {/* Stock Header */}
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-white text-lg">
                  {stock.ticker || 'N/A'}
                </div>
                <div className="text-sm text-gray-400">
                  {stock.stock_name}
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {stockService.formatCurrency(stock.totalValue)}
                </div>
                <div className={`text-sm ${stock.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockService.formatPercentage(stock.profitLossPercent)}
                </div>
              </div>
            </div>

            {/* Stock Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-400">Quantity</div>
                <div className="text-white font-medium">{stock.quantity}</div>
              </div>
              <div>
                <div className="text-gray-400">Avg Cost</div>
                <div className="text-white font-medium">{stockService.formatCurrency(stock.purchase_price)}</div>
              </div>
              <div>
                <div className="text-gray-400">Current Price</div>
                <div className="text-white font-medium">{stockService.formatCurrency(stock.current_price)}</div>
              </div>
              <div>
                <div className="text-gray-400">Gain/Loss</div>
                <div className={`font-medium ${stock.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stockService.formatCurrency(stock.profitLoss)}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => onEdit(stock)}
                className="flex-1 min-h-[44px] bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg font-medium hover:bg-blue-600/30 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(stock)}
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