import React, { useState, useEffect } from 'react'
import type { TargetPortfolioFormProps, TargetPortfolioStock, PortfolioValidationResult } from '../types'

export const TargetPortfolioForm: React.FC<TargetPortfolioFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editPortfolio
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [stocks, setStocks] = useState<Omit<TargetPortfolioStock, 'id'>[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editPortfolio) {
      setFormData({
        name: editPortfolio.name,
        description: editPortfolio.description || ''
      })
      setStocks(editPortfolio.stocks.map(stock => ({
        stock_name: stock.stock_name,
        ticker: stock.ticker,
        target_weight: stock.target_weight
      })))
    } else {
      setFormData({ name: '', description: '' })
      setStocks([])
    }
    setErrors({})
  }, [editPortfolio, isOpen])

  const validatePortfolio = (): PortfolioValidationResult => {
    const errors: string[] = []
    const totalWeight = stocks.reduce((sum, stock) => sum + stock.target_weight, 0)

    if (!formData.name.trim()) {
      errors.push('Portfolio name is required')
    }

    if (stocks.length === 0) {
      errors.push('At least one stock is required')
    }

    if (Math.abs(totalWeight - 100) > 0.01) {
      errors.push(`Total weight must equal 100% (current: ${totalWeight.toFixed(2)}%)`)
    }

    stocks.forEach((stock, index) => {
      if (!stock.stock_name.trim()) {
        errors.push(`Stock ${index + 1}: Name is required`)
      }
      if (stock.target_weight <= 0 || stock.target_weight > 100) {
        errors.push(`Stock ${index + 1}: Weight must be between 0% and 100%`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      totalWeight
    }
  }

  const handleAddStock = () => {
    setStocks([...stocks, { stock_name: '', ticker: '', target_weight: 0 }])
  }

  const handleRemoveStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index))
  }

  const handleStockChange = (index: number, field: keyof Omit<TargetPortfolioStock, 'id'>, value: string | number) => {
    const updatedStocks = [...stocks]
    updatedStocks[index] = { ...updatedStocks[index], [field]: value }
    setStocks(updatedStocks)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validation = validatePortfolio()
    if (!validation.isValid) {
      setErrors({ form: validation.errors.join(', ') })
      return
    }

    setIsLoading(true)
    try {
      // TODO: Implement save logic
      console.log('Saving target portfolio:', { ...formData, stocks })
      onSave()
      onClose()
    } catch (error) {
      console.error('Error saving target portfolio:', error)
      setErrors({ form: 'Failed to save target portfolio. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const totalWeight = stocks.reduce((sum, stock) => sum + stock.target_weight, 0)
  const isWeightValid = Math.abs(totalWeight - 100) <= 0.01

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl safe-area-padding">
        <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-semibold">
            {editPortfolio ? 'Edit Target Portfolio' : 'Create Target Portfolio'}
          </h3>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-6">
            {/* Portfolio Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Conservative Growth"
                  className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your portfolio strategy..."
                  rows={3}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all resize-none"
                />
              </div>
            </div>

            {/* Weight Summary */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Weight:</span>
                <span className={`text-lg font-semibold ${isWeightValid ? 'text-green-400' : 'text-red-400'}`}>
                  {totalWeight.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isWeightValid ? 'bg-green-500' : totalWeight > 100 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(totalWeight, 100)}%` }}
                />
              </div>
            </div>

            {/* Stocks List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">Stock Allocation</h4>
                <button
                  type="button"
                  onClick={handleAddStock}
                  className="min-h-[44px] px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add Stock
                </button>
              </div>

              <div className="space-y-3">
                {stocks.map((stock, index) => (
                  <div key={index} className="bg-white/3 border border-white/10 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-400">
                          Stock Name *
                        </label>
                        <input
                          type="text"
                          value={stock.stock_name}
                          onChange={(e) => handleStockChange(index, 'stock_name', e.target.value)}
                          placeholder="Apple Inc."
                          className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-400">
                          Ticker
                        </label>
                        <input
                          type="text"
                          value={stock.ticker || ''}
                          onChange={(e) => handleStockChange(index, 'ticker', e.target.value.toUpperCase())}
                          placeholder="AAPL"
                          className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-400">
                          Target Weight (%)
                        </label>
                        <input
                          type="number"
                          value={stock.target_weight}
                          onChange={(e) => handleStockChange(index, 'target_weight', parseFloat(e.target.value) || 0)}
                          placeholder="25"
                          min="0"
                          max="100"
                          step="0.1"
                          className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      
                      <div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStock(index)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {errors.form && (
            <p className="text-red-400 text-sm mt-4">{errors.form}</p>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isWeightValid}
              className="flex-1 min-h-[44px] p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Saving...' : 'Save Portfolio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}