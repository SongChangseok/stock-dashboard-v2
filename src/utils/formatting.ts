/**
 * Centralized formatting utilities
 * Provides consistent formatting for currency, percentages, and numbers across the application
 */

/**
 * Format a number as currency
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param currency - The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

/**
 * Format a number as percentage
 * @param value - The decimal value to format (0.05 = 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format a percentage value that's already in percentage form
 * @param value - The percentage value (5 = 5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentageValue = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Format a number with locale-specific formatting
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number, 
  locale = 'en-US', 
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted number string with thousand separators
 */
export const formatNumberWithSeparators = (value: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format a number as a compact notation (e.g., 1K, 1M)
 * @param value - The number to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted compact number string
 */
export const formatCompactNumber = (value: number, locale = 'en-US'): string => {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value)
}

/**
 * Format a decimal number to a specific number of decimal places
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted decimal string
 */
export const formatDecimal = (value: number, decimals = 2): string => {
  return value.toFixed(decimals)
}