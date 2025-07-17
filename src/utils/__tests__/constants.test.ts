import { describe, it, expect } from 'vitest'
import {
  BUSINESS_RULES,
  UI_CONFIG,
  FORMAT_CONFIG,
  SERVICE_CONFIG,
  VALIDATION_RULES,
  BREAKPOINTS,
  COLORS,
  CHART_CONFIG
} from '../constants'

describe('constants', () => {
  describe('BUSINESS_RULES', () => {
    it('should have valid rebalance threshold', () => {
      expect(BUSINESS_RULES.REBALANCE_THRESHOLD).toBe(5.0)
      expect(typeof BUSINESS_RULES.REBALANCE_THRESHOLD).toBe('number')
      expect(BUSINESS_RULES.REBALANCE_THRESHOLD).toBeGreaterThan(0)
    })

    it('should have valid daily change simulation rate', () => {
      expect(BUSINESS_RULES.DAILY_CHANGE_SIMULATION).toBe(0.67)
      expect(typeof BUSINESS_RULES.DAILY_CHANGE_SIMULATION).toBe('number')
    })

    it('should have valid trading unit constraints', () => {
      expect(BUSINESS_RULES.MIN_TRADING_UNIT).toBe(1)
      expect(BUSINESS_RULES.MIN_TRADING_UNIT).toBeGreaterThan(0)
    })

    it('should have valid commission settings', () => {
      expect(BUSINESS_RULES.DEFAULT_COMMISSION).toBe(0)
      expect(BUSINESS_RULES.COMMISSION_THRESHOLD).toBe(0.1)
      expect(BUSINESS_RULES.COMMISSION_THRESHOLD).toBeGreaterThan(0)
    })

    it('should have valid weight constraints', () => {
      expect(BUSINESS_RULES.MIN_STOCK_WEIGHT).toBe(0)
      expect(BUSINESS_RULES.MAX_STOCK_WEIGHT).toBe(100)
      expect(BUSINESS_RULES.TOTAL_PORTFOLIO_WEIGHT).toBe(100)
      expect(BUSINESS_RULES.MIN_STOCK_WEIGHT).toBeLessThanOrEqual(BUSINESS_RULES.MAX_STOCK_WEIGHT)
    })
  })

  describe('UI_CONFIG', () => {
    it('should have valid animation durations', () => {
      expect(UI_CONFIG.ANIMATION_FAST).toBe(150)
      expect(UI_CONFIG.ANIMATION_STANDARD).toBe(350)
      expect(UI_CONFIG.ANIMATION_SLOW).toBe(650)
      
      // Check order: fast < standard < slow
      expect(UI_CONFIG.ANIMATION_FAST).toBeLessThan(UI_CONFIG.ANIMATION_STANDARD)
      expect(UI_CONFIG.ANIMATION_STANDARD).toBeLessThan(UI_CONFIG.ANIMATION_SLOW)
    })

    it('should have valid accessibility settings', () => {
      expect(UI_CONFIG.MIN_TOUCH_TARGET).toBe(44)
      expect(UI_CONFIG.MIN_TOUCH_TARGET).toBeGreaterThanOrEqual(44) // WCAG minimum
    })

    it('should have valid interaction settings', () => {
      expect(UI_CONFIG.DEBOUNCE_DELAY).toBe(300)
      expect(UI_CONFIG.MAX_LIST_ITEMS).toBe(50)
      expect(UI_CONFIG.DEBOUNCE_DELAY).toBeGreaterThan(0)
      expect(UI_CONFIG.MAX_LIST_ITEMS).toBeGreaterThan(0)
    })

    it('should have valid formatting settings', () => {
      expect(UI_CONFIG.PERCENTAGE_DECIMALS).toBe(2)
      expect(UI_CONFIG.CURRENCY_DECIMALS).toBe(2)
      expect(UI_CONFIG.PERCENTAGE_DECIMALS).toBeGreaterThanOrEqual(0)
      expect(UI_CONFIG.CURRENCY_DECIMALS).toBeGreaterThanOrEqual(0)
    })
  })

  describe('FORMAT_CONFIG', () => {
    it('should have valid locale settings', () => {
      expect(FORMAT_CONFIG.DEFAULT_LOCALE).toBe('en-US')
      expect(typeof FORMAT_CONFIG.DEFAULT_LOCALE).toBe('string')
      expect(FORMAT_CONFIG.DEFAULT_LOCALE.length).toBeGreaterThan(0)
    })

    it('should have valid currency settings', () => {
      expect(FORMAT_CONFIG.DEFAULT_CURRENCY).toBe('USD')
      expect(typeof FORMAT_CONFIG.DEFAULT_CURRENCY).toBe('string')
      expect(FORMAT_CONFIG.DEFAULT_CURRENCY.length).toBe(3) // Standard currency code length
    })

    it('should have valid number formatting settings', () => {
      expect(FORMAT_CONFIG.COMPACT_NUMBER_THRESHOLD).toBe(1000)
      expect(FORMAT_CONFIG.MAX_DECIMAL_PLACES).toBe(4)
      expect(FORMAT_CONFIG.COMPACT_NUMBER_THRESHOLD).toBeGreaterThan(0)
      expect(FORMAT_CONFIG.MAX_DECIMAL_PLACES).toBeGreaterThan(0)
    })
  })

  describe('SERVICE_CONFIG', () => {
    it('should have valid timeout settings', () => {
      expect(SERVICE_CONFIG.REQUEST_TIMEOUT).toBe(30000)
      expect(SERVICE_CONFIG.REQUEST_TIMEOUT).toBeGreaterThan(0)
    })

    it('should have valid retry settings', () => {
      expect(SERVICE_CONFIG.MAX_RETRY_ATTEMPTS).toBe(3)
      expect(SERVICE_CONFIG.MAX_RETRY_ATTEMPTS).toBeGreaterThan(0)
    })

    it('should have valid cache settings', () => {
      expect(SERVICE_CONFIG.CACHE_DURATION).toBe(300000) // 5 minutes
      expect(SERVICE_CONFIG.CACHE_DURATION).toBeGreaterThan(0)
    })

    it('should have valid batch settings', () => {
      expect(SERVICE_CONFIG.BATCH_SIZE).toBe(20)
      expect(SERVICE_CONFIG.BATCH_SIZE).toBeGreaterThan(0)
    })
  })

  describe('VALIDATION_RULES', () => {
    it('should have valid quantity constraints', () => {
      expect(VALIDATION_RULES.MIN_QUANTITY).toBe(0.01)
      expect(VALIDATION_RULES.MAX_QUANTITY).toBe(999999)
      expect(VALIDATION_RULES.MIN_QUANTITY).toBeLessThan(VALIDATION_RULES.MAX_QUANTITY)
      expect(VALIDATION_RULES.MIN_QUANTITY).toBeGreaterThan(0)
    })

    it('should have valid price constraints', () => {
      expect(VALIDATION_RULES.MIN_PRICE).toBe(0.01)
      expect(VALIDATION_RULES.MAX_PRICE).toBe(999999)
      expect(VALIDATION_RULES.MIN_PRICE).toBeLessThan(VALIDATION_RULES.MAX_PRICE)
      expect(VALIDATION_RULES.MIN_PRICE).toBeGreaterThan(0)
    })

    it('should have valid length constraints', () => {
      expect(VALIDATION_RULES.MAX_PORTFOLIO_NAME_LENGTH).toBe(100)
      expect(VALIDATION_RULES.MAX_STOCK_NAME_LENGTH).toBe(50)
      expect(VALIDATION_RULES.MAX_TICKER_LENGTH).toBe(10)
      expect(VALIDATION_RULES.MIN_PORTFOLIO_NAME_LENGTH).toBe(1)
      
      // Check reasonable limits
      expect(VALIDATION_RULES.MIN_PORTFOLIO_NAME_LENGTH).toBeGreaterThan(0)
      expect(VALIDATION_RULES.MAX_PORTFOLIO_NAME_LENGTH).toBeGreaterThan(VALIDATION_RULES.MIN_PORTFOLIO_NAME_LENGTH)
      expect(VALIDATION_RULES.MAX_STOCK_NAME_LENGTH).toBeGreaterThan(0)
      expect(VALIDATION_RULES.MAX_TICKER_LENGTH).toBeGreaterThan(0)
    })
  })

  describe('BREAKPOINTS', () => {
    it('should have valid responsive breakpoints', () => {
      expect(BREAKPOINTS.MOBILE).toBe(375)
      expect(BREAKPOINTS.SM).toBe(640)
      expect(BREAKPOINTS.MD).toBe(768)
      expect(BREAKPOINTS.LG).toBe(1024)
      expect(BREAKPOINTS.XL).toBe(1280)
      expect(BREAKPOINTS.XXL).toBe(1536)
    })

    it('should have breakpoints in ascending order', () => {
      const breakpointValues = [
        BREAKPOINTS.MOBILE,
        BREAKPOINTS.SM,
        BREAKPOINTS.MD,
        BREAKPOINTS.LG,
        BREAKPOINTS.XL,
        BREAKPOINTS.XXL
      ]
      
      for (let i = 1; i < breakpointValues.length; i++) {
        expect(breakpointValues[i]).toBeGreaterThan(breakpointValues[i - 1])
      }
    })
  })

  describe('COLORS', () => {
    it('should have valid color values', () => {
      expect(COLORS.SUCCESS).toBe('#10B981')
      expect(COLORS.ERROR).toBe('#EF4444')
      expect(COLORS.WARNING).toBe('#F59E0B')
      expect(COLORS.PRIMARY).toBe('#6366F1')
      expect(COLORS.SECONDARY).toBe('#8B5CF6')
      expect(COLORS.NEUTRAL).toBe('#6B7280')
    })

    it('should have valid hex color format', () => {
      const hexColorRegex = /^#[0-9A-F]{6}$/i
      
      Object.values(COLORS).forEach(color => {
        expect(color).toMatch(hexColorRegex)
      })
    })
  })

  describe('CHART_CONFIG', () => {
    it('should have valid chart dimensions', () => {
      expect(CHART_CONFIG.DEFAULT_HEIGHT).toBe(300)
      expect(CHART_CONFIG.MOBILE_HEIGHT).toBe(200)
      expect(CHART_CONFIG.DEFAULT_HEIGHT).toBeGreaterThan(CHART_CONFIG.MOBILE_HEIGHT)
      expect(CHART_CONFIG.MOBILE_HEIGHT).toBeGreaterThan(0)
    })

    it('should have valid data constraints', () => {
      expect(CHART_CONFIG.MAX_DATA_POINTS).toBe(100)
      expect(CHART_CONFIG.MAX_DATA_POINTS).toBeGreaterThan(0)
    })

    it('should have valid animation settings', () => {
      expect(CHART_CONFIG.ANIMATION_DURATION).toBe(300)
      expect(CHART_CONFIG.ANIMATION_DURATION).toBeGreaterThan(0)
    })
  })

  describe('constant immutability', () => {
    it('should have readonly structure', () => {
      // Constants should be objects with const assertion
      expect(typeof BUSINESS_RULES).toBe('object')
      expect(typeof UI_CONFIG).toBe('object')
      expect(typeof VALIDATION_RULES).toBe('object')
      
      // Verify properties exist and have expected types
      expect(BUSINESS_RULES).toHaveProperty('REBALANCE_THRESHOLD')
      expect(UI_CONFIG).toHaveProperty('ANIMATION_FAST')
      expect(VALIDATION_RULES).toHaveProperty('MIN_QUANTITY')
    })
  })

  describe('type consistency', () => {
    it('should have consistent number types', () => {
      expect(typeof BUSINESS_RULES.REBALANCE_THRESHOLD).toBe('number')
      expect(typeof UI_CONFIG.ANIMATION_FAST).toBe('number')
      expect(typeof VALIDATION_RULES.MIN_QUANTITY).toBe('number')
      expect(typeof BREAKPOINTS.MOBILE).toBe('number')
    })

    it('should have consistent string types', () => {
      expect(typeof FORMAT_CONFIG.DEFAULT_LOCALE).toBe('string')
      expect(typeof FORMAT_CONFIG.DEFAULT_CURRENCY).toBe('string')
      expect(typeof COLORS.PRIMARY).toBe('string')
    })
  })
})