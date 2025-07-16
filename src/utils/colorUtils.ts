/**
 * Centralized color utility functions
 * Consolidates all color class logic from different utility files
 */

/**
 * Status types for color coding
 */
export type StatusType = 'positive' | 'negative' | 'neutral' | 'warning' | 'success' | 'danger'

/**
 * Action types for trading actions
 */
export type ActionType = 'buy' | 'sell' | 'hold'

/**
 * Get status color class for text
 * @param value - Numeric value to evaluate
 * @param threshold - Threshold for neutral (default: 0)
 * @returns Tailwind text color class
 */
export const getStatusTextColor = (value: number, threshold = 0): string => {
  if (value > threshold) return 'text-green-400'
  if (value < threshold) return 'text-red-400'
  return 'text-gray-400'
}

/**
 * Get status color class for backgrounds
 * @param value - Numeric value to evaluate
 * @param threshold - Threshold for neutral (default: 0)
 * @returns Tailwind background color class
 */
export const getStatusBgColor = (value: number, threshold = 0): string => {
  if (value > threshold) return 'bg-green-500'
  if (value < threshold) return 'bg-red-500'
  return 'bg-gray-500'
}

/**
 * Get weight validation color for text
 * @param totalWeight - Total weight percentage
 * @param target - Target weight (default: 100)
 * @param tolerance - Tolerance for validity (default: 0.01)
 * @returns Tailwind text color class
 */
export const getWeightTextColor = (totalWeight: number, target = 100, tolerance = 0.01): string => {
  if (Math.abs(totalWeight - target) <= tolerance) return 'text-green-400'
  return totalWeight > target ? 'text-red-400' : 'text-yellow-400'
}

/**
 * Get weight validation color for backgrounds
 * @param totalWeight - Total weight percentage
 * @param target - Target weight (default: 100)
 * @param tolerance - Tolerance for validity (default: 0.01)
 * @returns Tailwind background color class
 */
export const getWeightBgColor = (totalWeight: number, target = 100, tolerance = 0.01): string => {
  if (Math.abs(totalWeight - target) <= tolerance) return 'bg-green-500'
  return totalWeight > target ? 'bg-red-500' : 'bg-yellow-500'
}

/**
 * Get action color class based on trading action
 * @param action - Trading action
 * @returns Tailwind color class with background and text
 */
export const getActionColor = (action: ActionType): string => {
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
 * Get difference color based on weight difference magnitude
 * @param difference - Weight difference percentage
 * @param threshold - Threshold for acceptable difference (default: 1)
 * @returns Tailwind text color class
 */
export const getDifferenceColor = (difference: number, threshold = 1): string => {
  if (Math.abs(difference) < threshold) return 'text-green-400'
  if (difference > 0) return 'text-red-400'
  return 'text-blue-400'
}

/**
 * Get balanced status color
 * @param isBalanced - Whether the portfolio is balanced
 * @returns Tailwind text color class
 */
export const getBalancedStatusColor = (isBalanced: boolean): string => {
  return isBalanced ? 'text-green-400' : 'text-amber-400'
}

/**
 * Generic status type color mapping
 * @param statusType - Status type
 * @returns Tailwind text color class
 */
export const getStatusTypeColor = (statusType: StatusType): string => {
  switch (statusType) {
    case 'positive':
      return 'text-green-400'
    case 'negative':
      return 'text-red-400'
    case 'warning':
      return 'text-yellow-400'
    case 'success':
      return 'text-emerald-400'
    case 'danger':
      return 'text-red-500'
    default:
      return 'text-gray-400'
  }
}

