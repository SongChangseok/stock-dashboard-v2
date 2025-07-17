import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  formatPercentageValue,
  formatNumber,
  formatNumberWithSeparators,
  formatCompactNumber,
  formatDecimal,
  formatQuantityChange,
  formatDifference
} from '../formatting'

describe('formatting', () => {
  describe('formatCurrency', () => {
    it('should format currency with default USD locale', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
      expect(formatCurrency(0)).toBe('$0.00')
      expect(formatCurrency(-500)).toBe('-$500.00')
    })

    it('should format currency with different locales', () => {
      expect(formatCurrency(1234.56, 'ko-KR', 'KRW')).toBe('₩1,235')
      // Note: Different environments may use different Unicode spaces
      expect(formatCurrency(1234.56, 'de-DE', 'EUR')).toMatch(/1\.234,56\s€/)
    })
  })

  describe('formatPercentage', () => {
    it('should format decimal to percentage', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%')
      expect(formatPercentage(0.05)).toBe('5.00%')
      expect(formatPercentage(-0.025)).toBe('-2.50%')
      expect(formatPercentage(0)).toBe('0.00%')
    })

    it('should format percentage with custom decimals', () => {
      expect(formatPercentage(0.1234, 1)).toBe('12.3%')
      expect(formatPercentage(0.1234, 0)).toBe('12%')
      expect(formatPercentage(0.1234, 3)).toBe('12.340%')
    })
  })

  describe('formatPercentageValue', () => {
    it('should format percentage value', () => {
      expect(formatPercentageValue(12.34)).toBe('12.34%')
      expect(formatPercentageValue(5)).toBe('5.00%')
      expect(formatPercentageValue(-2.5)).toBe('-2.50%')
      expect(formatPercentageValue(0)).toBe('0.00%')
    })

    it('should format percentage value with custom decimals', () => {
      expect(formatPercentageValue(12.345, 1)).toBe('12.3%')
      expect(formatPercentageValue(12.345, 0)).toBe('12%')
      expect(formatPercentageValue(12.345, 3)).toBe('12.345%')
    })
  })

  describe('formatNumber', () => {
    it('should format number with default locale', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
      expect(formatNumber(0)).toBe('0')
      expect(formatNumber(-1000)).toBe('-1,000')
    })

    it('should format number with custom options', () => {
      expect(formatNumber(1234.56, 'en-US', { minimumFractionDigits: 3 }))
        .toBe('1,234.560')
      expect(formatNumber(1234, 'en-US', { minimumIntegerDigits: 5 }))
        .toBe('01,234')
    })
  })

  describe('formatNumberWithSeparators', () => {
    it('should format number with thousand separators', () => {
      expect(formatNumberWithSeparators(1234567)).toBe('1,234,567')
      expect(formatNumberWithSeparators(1000)).toBe('1,000')
      expect(formatNumberWithSeparators(999)).toBe('999')
      expect(formatNumberWithSeparators(0)).toBe('0')
    })

    it('should format negative numbers correctly', () => {
      expect(formatNumberWithSeparators(-1234567)).toBe('-1,234,567')
    })
  })

  describe('formatCompactNumber', () => {
    it('should format large numbers in compact notation', () => {
      expect(formatCompactNumber(1000)).toBe('1K')
      expect(formatCompactNumber(1500)).toBe('1.5K')
      expect(formatCompactNumber(1000000)).toBe('1M')
      expect(formatCompactNumber(1200000)).toBe('1.2M')
      expect(formatCompactNumber(1000000000)).toBe('1B')
    })

    it('should format small numbers normally', () => {
      expect(formatCompactNumber(999)).toBe('999')
      expect(formatCompactNumber(100)).toBe('100')
      expect(formatCompactNumber(0)).toBe('0')
    })
  })

  describe('formatDecimal', () => {
    it('should format decimal with default 2 places', () => {
      expect(formatDecimal(1234.5678)).toBe('1234.57')
      expect(formatDecimal(100)).toBe('100.00')
      expect(formatDecimal(0)).toBe('0.00')
    })

    it('should format decimal with custom places', () => {
      expect(formatDecimal(1234.5678, 1)).toBe('1234.6')
      expect(formatDecimal(1234.5678, 0)).toBe('1235')
      expect(formatDecimal(1234.5678, 3)).toBe('1234.568')
    })
  })

  describe('formatQuantityChange', () => {
    it('should format positive quantity change with + sign', () => {
      expect(formatQuantityChange(5)).toBe('+5')
      expect(formatQuantityChange(10.7)).toBe('+11')
    })

    it('should format negative quantity change', () => {
      expect(formatQuantityChange(-5)).toBe('-5')
      expect(formatQuantityChange(-10.3)).toBe('-10')
    })

    it('should format zero quantity change', () => {
      expect(formatQuantityChange(0)).toBe('0')
    })
  })

  describe('formatDifference', () => {
    it('should format positive difference with + sign', () => {
      expect(formatDifference(5.67)).toBe('+5.7%')
      expect(formatDifference(10)).toBe('+10.0%')
    })

    it('should format negative difference', () => {
      expect(formatDifference(-5.67)).toBe('-5.7%')
      expect(formatDifference(-10)).toBe('-10.0%')
    })

    it('should format zero difference', () => {
      expect(formatDifference(0)).toBe('0.0%')
    })
  })
})