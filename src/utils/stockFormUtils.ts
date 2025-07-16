/**
 * Business logic utilities for stock form operations
 * Separates calculation and transformation logic from presentation
 */

import { formatCurrency, formatPercentageValue } from './formatting'
import { calculateStockMetrics as calculateStockMetricsFromValues, type StockMetrics } from './calculations'
import type { Stock } from '../types'

/**
 * Stock form data interface
 */
export interface StockFormData {
  stock_name: string
  ticker: string
  quantity: string
  purchase_price: string
  current_price: string
}

/**
 * Calculate stock metrics from form data
 * @param formData - Stock form data
 * @returns Calculated metrics
 */
export const calculateStockMetrics = (formData: StockFormData): StockMetrics => {
  const quantity = parseFloat(formData.quantity) || 0
  const purchasePrice = parseFloat(formData.purchase_price) || 0
  const currentPrice = parseFloat(formData.current_price) || 0

  return calculateStockMetricsFromValues(quantity, purchasePrice, currentPrice)
}

/**
 * Format stock metrics for display
 * @param metrics - Stock metrics
 * @returns Formatted metrics
 */
export const formatStockMetrics = (metrics: StockMetrics) => {
  return {
    investmentAmount: formatCurrency(metrics.investmentAmount),
    currentValue: formatCurrency(metrics.currentValue),
    profitLoss: formatCurrency(metrics.profitLoss),
    returnRate: formatPercentageValue(metrics.returnRate)
  }
}

/**
 * Transform form data to stock creation data
 * @param formData - Stock form data
 * @returns Stock creation data
 */
export const transformFormToCreateData = (formData: StockFormData) => {
  return {
    stock_name: formData.stock_name.trim(),
    ticker: formData.ticker.trim().toUpperCase() || undefined,
    quantity: parseFloat(formData.quantity),
    purchase_price: parseFloat(formData.purchase_price),
    current_price: parseFloat(formData.current_price)
  }
}

/**
 * Transform form data to stock update data
 * @param formData - Stock form data
 * @param id - Stock ID
 * @returns Stock update data
 */
export const transformFormToUpdateData = (formData: StockFormData, id: string) => {
  return {
    id,
    ...transformFormToCreateData(formData)
  }
}

/**
 * Transform stock to form data
 * @param stock - Stock data
 * @returns Stock form data
 */
export const transformStockToFormData = (stock: Stock): StockFormData => {
  return {
    stock_name: stock.stock_name,
    ticker: stock.ticker || '',
    quantity: stock.quantity.toString(),
    purchase_price: stock.purchase_price.toString(),
    current_price: stock.current_price.toString()
  }
}

