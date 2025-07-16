/**
 * Business logic utilities for rebalancing calculator operations
 * Separates calculation and transformation logic from presentation
 */

import type { RebalancingCalculation } from '../types'




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

