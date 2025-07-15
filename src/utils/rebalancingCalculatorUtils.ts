/**
 * Business logic utilities for rebalancing calculator operations
 * Separates calculation and transformation logic from presentation
 */

import type { RebalancingOptions } from '../types'

/**
 * Get action color class based on rebalancing action
 * @param action - Rebalancing action (buy/sell/hold)
 * @returns Tailwind color class
 */
export const getActionColorClass = (action: string): string => {
  switch (action) {
    case 'buy':
      return 'bg-green-500/20 text-green-400'
    case 'sell':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/**
 * Get quantity change color class
 * @param quantityChange - Quantity change value
 * @returns Tailwind color class
 */
export const getQuantityChangeColorClass = (quantityChange: number): string => {
  if (quantityChange > 0) return 'text-green-400'
  if (quantityChange < 0) return 'text-red-400'
  return 'text-gray-400'
}

/**
 * Get value change color class
 * @param valueChange - Value change amount
 * @returns Tailwind color class
 */
export const getValueChangeColorClass = (valueChange: number): string => {
  if (valueChange > 0) return 'text-green-400'
  if (valueChange < 0) return 'text-red-400'
  return 'text-gray-400'
}

/**
 * Get difference color class based on weight difference
 * @param difference - Weight difference percentage
 * @returns Tailwind color class
 */
export const getDifferenceColorClass = (difference: number): string => {
  if (Math.abs(difference) < 1) return 'text-green-400'
  if (difference > 0) return 'text-red-400'
  return 'text-blue-400'
}

/**
 * Get status color class based on rebalancing status
 * @param isBalanced - Whether portfolio is balanced
 * @returns Tailwind color class
 */
export const getStatusColorClass = (isBalanced: boolean): string => {
  return isBalanced ? 'text-green-400' : 'text-amber-400'
}

/**
 * Format quantity change display
 * @param quantityChange - Quantity change value
 * @returns Formatted quantity change string
 */
export const formatQuantityChange = (quantityChange: number): string => {
  if (quantityChange === 0) return '0'
  const sign = quantityChange > 0 ? '+' : ''
  return `${sign}${quantityChange.toFixed(0)}`
}

/**
 * Format difference display
 * @param difference - Weight difference percentage
 * @returns Formatted difference string
 */
export const formatDifference = (difference: number): string => {
  const sign = difference > 0 ? '+' : ''
  return `${sign}${difference.toFixed(1)}%`
}

/**
 * Validate rebalancing options
 * @param options - Rebalancing options
 * @returns Validation result
 */
export const validateRebalancingOptions = (options: RebalancingOptions): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (options.minimumTradingUnit < 1) {
    errors.push('Minimum trading unit must be at least 1')
  }

  if (options.rebalanceThreshold < 0 || options.rebalanceThreshold > 100) {
    errors.push('Rebalance threshold must be between 0 and 100')
  }

  if (options.commission < 0) {
    errors.push('Commission cannot be negative')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Filter calculations that need display
 * @param calculations - Rebalancing calculations
 * @returns Filtered calculations
 */
export const filterDisplayCalculations = (calculations: Array<{
  currentWeight: number
  targetWeight: number
  [key: string]: unknown
}>): Array<{
  currentWeight: number
  targetWeight: number
  [key: string]: unknown
}> => {
  return calculations.filter(calc => calc.currentWeight > 0 || calc.targetWeight > 0)
}

/**
 * Format recommendation text for display
 * @param recommendation - Recommendation text
 * @returns Formatted recommendation with styling info
 */
export const formatRecommendation = (recommendation: string): {
  text: string
  isSubItem: boolean
  isHighlighted: boolean
} => {
  const isSubItem = recommendation.startsWith('  •')
  const isHighlighted = recommendation.includes('Consider')
  
  return {
    text: recommendation,
    isSubItem,
    isHighlighted
  }
}

/**
 * Get recommendation class based on formatting
 * @param recommendation - Formatted recommendation
 * @returns Tailwind class string
 */
export const getRecommendationClass = (recommendation: {
  isSubItem: boolean
  isHighlighted: boolean
}): string => {
  if (recommendation.isSubItem) return 'ml-4 text-indigo-300'
  if (recommendation.isHighlighted) return 'font-medium text-white'
  return ''
}

/**
 * Update rebalancing options with validation
 * @param currentOptions - Current options
 * @param field - Field to update
 * @param value - New value
 * @returns Updated options or null if invalid
 */
export const updateRebalancingOption = (
  currentOptions: RebalancingOptions,
  field: keyof RebalancingOptions,
  value: string | number | boolean
): RebalancingOptions | null => {
  const newOptions = { ...currentOptions, [field]: value }
  const validation = validateRebalancingOptions(newOptions)
  
  return validation.isValid ? newOptions : null
}