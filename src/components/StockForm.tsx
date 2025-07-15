import React, { useState, useEffect } from 'react'
import type { StockFormProps, CreateStockData, UpdateStockData } from '../types'
import { stockService } from '../services/stockService'
import { errorService } from '../services/errorService'
import { validateStockForm } from '../utils/validation'
import { 
  calculateStockMetrics, 
  formatStockMetrics, 
  transformFormToCreateData, 
  transformFormToUpdateData, 
  transformStockToFormData, 
  getProfitLossColorClass,
  type StockFormData 
} from '../utils/stockFormUtils'

export const StockForm: React.FC<StockFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editStock
}) => {
  const [formData, setFormData] = useState<StockFormData>({
    stock_name: '',
    ticker: '',
    quantity: '',
    purchase_price: '',
    current_price: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (editStock) {
      setFormData(transformStockToFormData(editStock))
    } else {
      setFormData({
        stock_name: '',
        ticker: '',
        quantity: '',
        purchase_price: '',
        current_price: ''
      })
    }
    setErrors({})
  }, [editStock, isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const validationResult = validateStockForm({
      stock_name: formData.stock_name,
      ticker: formData.ticker,
      quantity: formData.quantity,
      purchase_price: formData.purchase_price,
      current_price: formData.current_price
    })

    if (!validationResult.isValid) {
      const newErrors: Record<string, string> = {}
      validationResult.errors.forEach((error, index) => {
        const fieldMap = ['stock_name', 'ticker', 'quantity', 'purchase_price', 'current_price']
        if (index < fieldMap.length) {
          newErrors[fieldMap[index]] = error
        } else {
          newErrors.submit = error
        }
      })
      setErrors(newErrors)
    } else {
      setErrors({})
    }

    return validationResult.isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (editStock) {
        await stockService.updateStock(transformFormToUpdateData(formData, editStock.id) as UpdateStockData)
      } else {
        await stockService.createStock(transformFormToCreateData(formData) as CreateStockData)
      }

      onSave()
      onClose()
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Failed to save stock'), {
        context: { component: 'StockForm', action: 'submit' }
      })
      setErrors({ submit: 'Failed to save stock. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const metrics = calculateStockMetrics(formData)
  const formattedMetrics = formatStockMetrics(metrics)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-xl safe-area-padding">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-semibold">
            {editStock ? 'Edit Stock' : 'Add Stock'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Name *
              </label>
              <input
                type="text"
                name="stock_name"
                value={formData.stock_name}
                onChange={handleInputChange}
                placeholder="e.g., Apple Inc."
                className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                required
              />
              {errors.stock_name && (
                <p className="text-red-400 text-sm mt-1">{errors.stock_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ticker Symbol
              </label>
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleInputChange}
                placeholder="e.g., AAPL"
                className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="100"
                  step="0.001"
                  min="0"
                  className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                  required
                />
                {errors.quantity && (
                  <p className="text-red-400 text-sm mt-1">{errors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Purchase Price *
                </label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  placeholder="150"
                  min="0"
                  step="0.0001"
                  className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                  required
                />
                {errors.purchase_price && (
                  <p className="text-red-400 text-sm mt-1">{errors.purchase_price}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Price *
              </label>
              <input
                type="number"
                name="current_price"
                value={formData.current_price}
                onChange={handleInputChange}
                placeholder="175"
                min="0"
                step="0.0001"
                className="w-full min-h-[44px] p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white/8 transition-all"
                required
              />
              {errors.current_price && (
                <p className="text-red-400 text-sm mt-1">{errors.current_price}</p>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-400 mb-1">Investment Amount</label>
                  <div className="text-gray-300">{formattedMetrics.investmentAmount}</div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Current Value</label>
                  <div className="text-gray-300">{formattedMetrics.currentValue}</div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Profit/Loss</label>
                  <div className={getProfitLossColorClass(metrics.profitLoss)}>
                    {formattedMetrics.profitLoss}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">Return Rate</label>
                  <div className={getProfitLossColorClass(metrics.returnRate)}>
                    {formattedMetrics.returnRate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {errors.submit && (
            <p className="text-red-400 text-sm mt-4">{errors.submit}</p>
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
              disabled={isLoading}
              className="flex-1 min-h-[44px] p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}