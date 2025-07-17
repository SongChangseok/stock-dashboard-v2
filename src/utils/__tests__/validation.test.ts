import { describe, it, expect } from 'vitest'
import {
  validatePositiveNumber,
  validateNumberRange,
  validateStockQuantity,
  validateStockPrice,
  validatePortfolioWeight,
  validateTotalPortfolioWeight,
  isWeightValid,
  validateStringLength,
  validatePortfolioName,
  validateStockName,
  validateTicker,
  parseNumericInput,
  sanitizeStringInput,
  validateEmail,
  validateRequired,
  validatePercentageChange,
  validateCommission,
  validateRebalanceThreshold,
  validateStockForm,
  validateTargetPortfolioForm
} from '../validation'

describe('validation', () => {
  describe('validatePositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(validatePositiveNumber(5)).toBe(5)
      expect(validatePositiveNumber('10.5')).toBe(10.5)
      expect(validatePositiveNumber('100')).toBe(100)
    })

    it('should reject non-positive numbers', () => {
      expect(validatePositiveNumber(0)).toBe(null)
      expect(validatePositiveNumber(-5)).toBe(null)
      expect(validatePositiveNumber('0')).toBe(null)
      expect(validatePositiveNumber('-10')).toBe(null)
    })

    it('should reject invalid inputs', () => {
      expect(validatePositiveNumber('abc')).toBe(null)
      expect(validatePositiveNumber('')).toBe(null)
      expect(validatePositiveNumber(NaN)).toBe(null)
    })
  })

  describe('validateNumberRange', () => {
    it('should validate numbers within range', () => {
      expect(validateNumberRange(5, 1, 10)).toBe(true)
      expect(validateNumberRange(1, 1, 10)).toBe(true)
      expect(validateNumberRange(10, 1, 10)).toBe(true)
    })

    it('should reject numbers outside range', () => {
      expect(validateNumberRange(0, 1, 10)).toBe(false)
      expect(validateNumberRange(11, 1, 10)).toBe(false)
      expect(validateNumberRange(-5, 1, 10)).toBe(false)
    })

    it('should reject NaN values', () => {
      expect(validateNumberRange(NaN, 1, 10)).toBe(false)
    })
  })

  describe('validateStockQuantity', () => {
    it('should validate valid stock quantities', () => {
      expect(validateStockQuantity(1)).toBe(true)
      expect(validateStockQuantity('10')).toBe(true)
      expect(validateStockQuantity(100)).toBe(true)
    })

    it('should reject invalid stock quantities', () => {
      expect(validateStockQuantity(0)).toBe(false)
      expect(validateStockQuantity(-5)).toBe(false)
      expect(validateStockQuantity('abc')).toBe(false)
    })
  })

  describe('validateStockPrice', () => {
    it('should validate valid stock prices', () => {
      expect(validateStockPrice(0.01)).toBe(true)
      expect(validateStockPrice('150.50')).toBe(true)
      expect(validateStockPrice(1000)).toBe(true)
    })

    it('should reject invalid stock prices', () => {
      expect(validateStockPrice(0)).toBe(false)
      expect(validateStockPrice(-10)).toBe(false)
      expect(validateStockPrice('invalid')).toBe(false)
    })
  })

  describe('validatePortfolioWeight', () => {
    it('should validate valid portfolio weights', () => {
      expect(validatePortfolioWeight(25)).toBe(true)
      expect(validatePortfolioWeight(0.1)).toBe(true)
      expect(validatePortfolioWeight(100)).toBe(true)
    })

    it('should reject invalid portfolio weights', () => {
      expect(validatePortfolioWeight(-1)).toBe(false)
      expect(validatePortfolioWeight(101)).toBe(false)
    })
  })

  describe('validateTotalPortfolioWeight', () => {
    it('should validate weights that sum to 100%', () => {
      expect(validateTotalPortfolioWeight([25, 25, 25, 25])).toBe(true)
      expect(validateTotalPortfolioWeight([60, 40])).toBe(true)
      expect(validateTotalPortfolioWeight([99.99, 0.01])).toBe(true) // Within tolerance
    })

    it('should reject weights that don\'t sum to 100%', () => {
      expect(validateTotalPortfolioWeight([25, 25, 25])).toBe(false) // Sums to 75
      expect(validateTotalPortfolioWeight([30, 30, 30, 30])).toBe(false) // Sums to 120
      expect(validateTotalPortfolioWeight([50, 49])).toBe(false) // Sums to 99, outside tolerance
    })

    it('should handle custom tolerance', () => {
      expect(validateTotalPortfolioWeight([99.5, 0.5], 0.1)).toBe(true) // Within 0.1% tolerance
      expect(validateTotalPortfolioWeight([98, 1], 0.5)).toBe(false) // Outside 0.5% tolerance  
    })
  })

  describe('isWeightValid', () => {
    it('should validate weights equal to 100%', () => {
      expect(isWeightValid(100)).toBe(true)
      expect(isWeightValid(100.005)).toBe(true) // Within default 0.01 tolerance
      expect(isWeightValid(99.995)).toBe(true) // Within default 0.01 tolerance
    })

    it('should reject weights not equal to 100%', () => {
      expect(isWeightValid(99)).toBe(false)
      expect(isWeightValid(101)).toBe(false)
      expect(isWeightValid(50)).toBe(false)
    })
  })

  describe('validateStringLength', () => {
    it('should validate strings within length range', () => {
      expect(validateStringLength('hello', 1, 10)).toBe(true)
      expect(validateStringLength('a', 1, 10)).toBe(true)
      expect(validateStringLength('1234567890', 1, 10)).toBe(true)
    })

    it('should reject strings outside length range', () => {
      expect(validateStringLength('', 1, 10)).toBe(false)
      expect(validateStringLength('12345678901', 1, 10)).toBe(false)
    })

    it('should handle trimming', () => {
      expect(validateStringLength('  hello  ', 1, 10)).toBe(true)
      expect(validateStringLength('   ', 1, 10)).toBe(false)
    })
  })

  describe('validatePortfolioName', () => {
    it('should validate valid portfolio names', () => {
      expect(validatePortfolioName('My Portfolio')).toBe(true)
      expect(validatePortfolioName('A')).toBe(true)
    })

    it('should reject invalid portfolio names', () => {
      expect(validatePortfolioName('')).toBe(false)
      expect(validatePortfolioName('   ')).toBe(false)
    })
  })

  describe('validateStockName', () => {
    it('should validate valid stock names', () => {
      expect(validateStockName('Apple Inc.')).toBe(true)
      expect(validateStockName('A')).toBe(true)
    })

    it('should reject invalid stock names', () => {
      expect(validateStockName('')).toBe(false)
      expect(validateStockName('   ')).toBe(false)
    })
  })

  describe('validateTicker', () => {
    it('should validate valid ticker symbols', () => {
      expect(validateTicker('AAPL')).toBe(true)
      expect(validateTicker('aapl')).toBe(true) // Case insensitive
      expect(validateTicker('MSFT')).toBe(true)
      expect(validateTicker('A')).toBe(true)
    })

    it('should reject invalid ticker symbols', () => {
      expect(validateTicker('')).toBe(false)
      expect(validateTicker('   ')).toBe(false)
    })
  })

  describe('parseNumericInput', () => {
    it('should parse valid numeric inputs', () => {
      expect(parseNumericInput('123')).toBe(123)
      expect(parseNumericInput('123.45')).toBe(123.45)
      expect(parseNumericInput('  100  ')).toBe(100)
    })

    it('should return default value for invalid inputs', () => {
      expect(parseNumericInput('')).toBe(0)
      expect(parseNumericInput('abc')).toBe(0)
      expect(parseNumericInput('', 10)).toBe(10)
      expect(parseNumericInput('invalid', 5)).toBe(5)
    })
  })

  describe('sanitizeStringInput', () => {
    it('should trim whitespace from strings', () => {
      expect(sanitizeStringInput('  hello  ')).toBe('hello')
      expect(sanitizeStringInput('world')).toBe('world')
      expect(sanitizeStringInput('   ')).toBe('')
    })
  })

  describe('validateEmail', () => {
    it('should validate valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('123@test.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('@domain.com')).toBe(false)
      expect(validateEmail('user@')).toBe(false)
      expect(validateEmail('user@domain')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      expect(validateRequired('hello')).toBe(true)
      expect(validateRequired(123)).toBe(true)
      expect(validateRequired([1, 2, 3])).toBe(true)
      expect(validateRequired(true)).toBe(true)
      expect(validateRequired(0)).toBe(true)
    })

    it('should reject empty values', () => {
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
      expect(validateRequired('')).toBe(false)
      expect(validateRequired('   ')).toBe(false)
      expect(validateRequired([])).toBe(false)
      expect(validateRequired(NaN)).toBe(false)
    })
  })

  describe('validatePercentageChange', () => {
    it('should validate finite numbers', () => {
      expect(validatePercentageChange(5.5)).toBe(true)
      expect(validatePercentageChange(-10)).toBe(true)
      expect(validatePercentageChange(0)).toBe(true)
    })

    it('should reject invalid numbers', () => {
      expect(validatePercentageChange(NaN)).toBe(false)
      expect(validatePercentageChange(Infinity)).toBe(false)
      expect(validatePercentageChange(-Infinity)).toBe(false)
    })
  })

  describe('validateCommission', () => {
    it('should validate non-negative numbers', () => {
      expect(validateCommission(0)).toBe(true)
      expect(validateCommission(5.5)).toBe(true)
      expect(validateCommission('10')).toBe(true)
      expect(validateCommission('0')).toBe(true)
    })

    it('should reject negative numbers', () => {
      expect(validateCommission(-1)).toBe(false)
      expect(validateCommission('-5')).toBe(false)
    })

    it('should reject invalid inputs', () => {
      expect(validateCommission('invalid')).toBe(false)
      expect(validateCommission(NaN)).toBe(false)
    })
  })

  describe('validateRebalanceThreshold', () => {
    it('should validate thresholds within 0-100%', () => {
      expect(validateRebalanceThreshold(0)).toBe(true)
      expect(validateRebalanceThreshold(5)).toBe(true)
      expect(validateRebalanceThreshold(100)).toBe(true)
    })

    it('should reject thresholds outside 0-100%', () => {
      expect(validateRebalanceThreshold(-1)).toBe(false)
      expect(validateRebalanceThreshold(101)).toBe(false)
    })
  })

  describe('validateStockForm', () => {
    const validStockData = {
      stock_name: 'Apple Inc.',
      ticker: 'AAPL',
      quantity: 10,
      purchase_price: 150,
      current_price: 180
    }

    it('should validate valid stock form data', () => {
      const result = validateStockForm(validStockData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid stock name', () => {
      const result = validateStockForm({ ...validStockData, stock_name: '' })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Stock name'))).toBe(true)
    })

    it('should detect invalid quantity', () => {
      const result = validateStockForm({ ...validStockData, quantity: 0 })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Quantity'))).toBe(true)
    })

    it('should detect invalid prices', () => {
      const result = validateStockForm({ 
        ...validStockData, 
        purchase_price: 0, 
        current_price: -10 
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Purchase price'))).toBe(true)
      expect(result.errors.some(error => error.includes('Current price'))).toBe(true)
    })
  })

  describe('validateTargetPortfolioForm', () => {
    const validPortfolioData = {
      name: 'Balanced Portfolio',
      stocks: [
        { target_weight: 50 },
        { target_weight: 30 },
        { target_weight: 20 }
      ]
    }

    it('should validate valid portfolio form data', () => {
      const result = validateTargetPortfolioForm(validPortfolioData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid portfolio name', () => {
      const result = validateTargetPortfolioForm({ ...validPortfolioData, name: '' })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('Portfolio name'))).toBe(true)
    })

    it('should detect empty stocks array', () => {
      const result = validateTargetPortfolioForm({ ...validPortfolioData, stocks: [] })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('at least one stock'))).toBe(true)
    })

    it('should detect invalid total weight', () => {
      const result = validateTargetPortfolioForm({
        ...validPortfolioData,
        stocks: [{ target_weight: 50 }, { target_weight: 30 }] // Sums to 80%
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('100%'))).toBe(true)
    })

    it('should detect invalid individual weights', () => {
      const result = validateTargetPortfolioForm({
        ...validPortfolioData,
        stocks: [{ target_weight: 150 }, { target_weight: -50 }] // Invalid weights
      })
      expect(result.isValid).toBe(false)
      expect(result.errors.some(error => error.includes('All weights'))).toBe(true)
    })
  })
})