/**
 * Business logic utilities for rebalancing calculator operations
 * Separates calculation and transformation logic from presentation
 */

import type { RebalancingCalculation } from '../types'


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
 * Filter calculations that need display
 * @param calculations - Rebalancing calculations
 * @returns Filtered calculations
 */
export const filterDisplayCalculations = (calculations: RebalancingCalculation[]): RebalancingCalculation[] => {
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

