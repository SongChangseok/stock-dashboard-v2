/**
 * Centralized validation utilities
 * Provides common input validation and parsing functions
 */

import { VALIDATION_RULES, BUSINESS_RULES } from './constants'
import type { ValidationResult } from '../types/api'

/**
 * Validate if a value is a positive number
 * @param value - Value to validate (string or number)
 * @returns Parsed number if valid, null if invalid
 */
export const validatePositiveNumber = (value: string | number): number | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0 ? num : null
}

/**
 * Validate if a number is within a specified range
 * @param value - Value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns True if valid, false otherwise
 */
export const validateNumberRange = (value: number, min: number, max: number): boolean => {
  return !isNaN(value) && value >= min && value <= max
}

/**
 * Validate stock quantity
 * @param quantity - Quantity to validate
 * @returns True if valid stock quantity
 */
export const validateStockQuantity = (quantity: string | number): boolean => {
  const num = validatePositiveNumber(quantity)
  return num !== null && validateNumberRange(num, VALIDATION_RULES.MIN_QUANTITY, VALIDATION_RULES.MAX_QUANTITY)
}

/**
 * Validate stock price
 * @param price - Price to validate
 * @returns True if valid stock price
 */
export const validateStockPrice = (price: string | number): boolean => {
  const num = validatePositiveNumber(price)
  return num !== null && validateNumberRange(num, VALIDATION_RULES.MIN_PRICE, VALIDATION_RULES.MAX_PRICE)
}

/**
 * Validate portfolio weight percentage
 * @param weight - Weight percentage to validate (0-100)
 * @returns True if valid weight percentage
 */
export const validatePortfolioWeight = (weight: number): boolean => {
  return validateNumberRange(weight, BUSINESS_RULES.MIN_STOCK_WEIGHT, BUSINESS_RULES.MAX_STOCK_WEIGHT)
}

/**
 * Validate that total portfolio weights equal 100%
 * @param weights - Array of weight percentages
 * @param tolerance - Allowed tolerance for rounding errors (default: 0.01)
 * @returns True if total equals 100% within tolerance
 */
export const validateTotalPortfolioWeight = (weights: number[], tolerance = 0.01): boolean => {
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  return Math.abs(total - BUSINESS_RULES.TOTAL_PORTFOLIO_WEIGHT) <= tolerance
}

/**
 * Validate string length
 * @param value - String to validate
 * @param minLength - Minimum allowed length
 * @param maxLength - Maximum allowed length
 * @returns True if valid length
 */
export const validateStringLength = (value: string, minLength: number, maxLength: number): boolean => {
  const trimmed = value.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

/**
 * Validate portfolio name
 * @param name - Portfolio name to validate
 * @returns True if valid portfolio name
 */
export const validatePortfolioName = (name: string): boolean => {
  return validateStringLength(name, VALIDATION_RULES.MIN_PORTFOLIO_NAME_LENGTH, VALIDATION_RULES.MAX_PORTFOLIO_NAME_LENGTH)
}

/**
 * Validate stock name
 * @param name - Stock name to validate
 * @returns True if valid stock name
 */
export const validateStockName = (name: string): boolean => {
  return validateStringLength(name, 1, VALIDATION_RULES.MAX_STOCK_NAME_LENGTH)
}

/**
 * Validate ticker symbol
 * @param ticker - Ticker symbol to validate
 * @returns True if valid ticker symbol
 */
export const validateTicker = (ticker: string): boolean => {
  const trimmed = ticker.trim().toUpperCase()
  return trimmed.length > 0 && trimmed.length <= VALIDATION_RULES.MAX_TICKER_LENGTH
}

/**
 * Parse and validate a numeric input string
 * @param input - Input string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed number or default value
 */
export const parseNumericInput = (input: string, defaultValue = 0): number => {
  const trimmed = input.trim()
  if (trimmed === '') return defaultValue
  
  const parsed = parseFloat(trimmed)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Sanitize string input by trimming whitespace
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeStringInput = (input: string): string => {
  return input.trim()
}

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate that a value is not empty or null
 * @param value - Value to validate
 * @returns True if value is not empty
 */
export const validateRequired = (value: unknown): boolean => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return !isNaN(value)
  if (Array.isArray(value)) return value.length > 0
  return true
}

/**
 * Validate percentage change value
 * @param change - Percentage change value
 * @returns True if valid percentage change
 */
export const validatePercentageChange = (change: number): boolean => {
  return !isNaN(change) && isFinite(change)
}

/**
 * Validate commission value
 * @param commission - Commission value to validate
 * @returns True if valid commission (non-negative number)
 */
export const validateCommission = (commission: string | number): boolean => {
  const num = typeof commission === 'string' ? parseFloat(commission) : commission
  return !isNaN(num) && num >= 0
}

/**
 * Validate rebalancing threshold
 * @param threshold - Threshold percentage to validate
 * @returns True if valid threshold (0-100%)
 */
export const validateRebalanceThreshold = (threshold: number): boolean => {
  return validateNumberRange(threshold, 0, 100)
}


/**
 * Validate a complete stock form
 * @param stockData - Stock data to validate
 * @returns Validation result with errors
 */
export const validateStockForm = (stockData: {
  stock_name: string
  ticker?: string
  quantity: string | number
  purchase_price: string | number
  current_price: string | number
}): ValidationResult => {
  const errors: string[] = []

  if (!validateStockName(stockData.stock_name)) {
    errors.push(`Stock name must be 1-${VALIDATION_RULES.MAX_STOCK_NAME_LENGTH} characters`)
  }

  if (stockData.ticker && !validateTicker(stockData.ticker)) {
    errors.push(`Ticker must be 1-${VALIDATION_RULES.MAX_TICKER_LENGTH} characters`)
  }

  if (!validateStockQuantity(stockData.quantity)) {
    errors.push(`Quantity must be between ${VALIDATION_RULES.MIN_QUANTITY} and ${VALIDATION_RULES.MAX_QUANTITY}`)
  }

  if (!validateStockPrice(stockData.purchase_price)) {
    errors.push(`Purchase price must be between ${VALIDATION_RULES.MIN_PRICE} and ${VALIDATION_RULES.MAX_PRICE}`)
  }

  if (!validateStockPrice(stockData.current_price)) {
    errors.push(`Current price must be between ${VALIDATION_RULES.MIN_PRICE} and ${VALIDATION_RULES.MAX_PRICE}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate a target portfolio form
 * @param portfolioData - Portfolio data to validate
 * @returns Validation result with errors
 */
export const validateTargetPortfolioForm = (portfolioData: {
  name: string
  stocks: Array<{ target_weight: number }>
}): ValidationResult => {
  const errors: string[] = []

  if (!validatePortfolioName(portfolioData.name)) {
    errors.push(`Portfolio name must be 1-${VALIDATION_RULES.MAX_PORTFOLIO_NAME_LENGTH} characters`)
  }

  if (portfolioData.stocks.length === 0) {
    errors.push('Portfolio must contain at least one stock')
  }

  const weights = portfolioData.stocks.map(stock => stock.target_weight)
  
  for (const weight of weights) {
    if (!validatePortfolioWeight(weight)) {
      errors.push(`All weights must be between ${BUSINESS_RULES.MIN_STOCK_WEIGHT}% and ${BUSINESS_RULES.MAX_STOCK_WEIGHT}%`)
      break
    }
  }

  if (!validateTotalPortfolioWeight(weights)) {
    errors.push('Total portfolio weight must equal 100%')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}