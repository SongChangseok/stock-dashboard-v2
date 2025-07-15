# Business Logic Refactoring Plan

## 📋 Current State Analysis

### 🔍 Identified Issues

**1. Duplicated Formatting Logic**
- `formatCurrency` function duplicated across 5 files
- Inline implementations in `RebalancingCalculator.tsx:47`, `PortfolioComparisonPage.tsx:167`
- Existing implementation in `stockService.ts:101` but inconsistent usage

**2. Business Logic in Components**
- `TradingGuide.tsx:23-32`: Complex trading aggregation calculations
- `PortfolioComparison.tsx`: Hardcoded threshold (5%)
- `PortfolioSummary.tsx:6`: Daily change simulation (0.67%)
- `StockForm.tsx`: Form handling mixed with validation logic

**3. Scattered Magic Numbers & Business Rules**
- Hardcoded thresholds (5%, 0.67%, etc.)
- UI constants mixed with business logic

## 🎯 Refactoring Plan

### **Phase 1: Create Utils Layer**

**1. `src/utils/formatting.ts`**
```typescript
// Centralize all formatting functions
export const formatCurrency = (value: number, locale = 'en-US', currency = 'USD') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

export const formatPercentage = (value: number, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`
}

export const formatNumber = (value: number, locale = 'en-US') => {
  return new Intl.NumberFormat(locale).format(value)
}
```

**2. `src/utils/calculations.ts`**
```typescript
// Portfolio calculation utilities
export const calculatePortfolioValue = (stocks: Stock[]) => {
  return stocks.reduce((total, stock) => total + (stock.quantity * stock.current_price), 0)
}

export const calculateTradingSummary = (calculations: RebalancingCalculation[]) => {
  const actionable = calculations.filter(calc => calc.action !== 'hold')
  return {
    totalTrades: actionable.length,
    totalBuyValue: actionable
      .filter(calc => calc.action === 'buy')
      .reduce((sum, calc) => sum + Math.abs(calc.adjustedValueChange), 0),
    totalSellValue: actionable
      .filter(calc => calc.action === 'sell')
      .reduce((sum, calc) => sum + Math.abs(calc.adjustedValueChange), 0)
  }
}
```

**3. `src/utils/constants.ts`**
```typescript
// Business rule constants
export const BUSINESS_RULES = {
  REBALANCE_THRESHOLD: 5.0,
  DAILY_CHANGE_SIMULATION: 0.67,
  MIN_TRADING_UNIT: 1,
  DEFAULT_COMMISSION: 0,
} as const

// UI configuration separate from business logic
export const UI_CONFIG = {
  ANIMATION_FAST: 150,
  ANIMATION_STANDARD: 350,
  ANIMATION_SLOW: 650,
  MIN_TOUCH_TARGET: 44,
} as const
```

**4. `src/utils/validation.ts`**
```typescript
// Common validation logic
export const validatePositiveNumber = (value: string | number): number | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return !isNaN(num) && num > 0 ? num : null
}

export const validatePortfolioWeight = (weight: number): boolean => {
  return weight >= 0 && weight <= 100
}
```

### **Phase 2: Enhance Service Layer**

**1. Extend `stockService.ts`**
- Move calculation logic from components
- Add portfolio metrics utilities
- Integrate validation helpers

**2. Create `portfolioAnalyticsService.ts`**
```typescript
export class PortfolioAnalyticsService {
  calculateWeightDifferences(current: PortfolioSummary, target: TargetPortfolioData) {
    // Portfolio comparison logic
  }
  
  generateRebalancingInsights(calculations: RebalancingCalculation[]) {
    // Trading analysis calculations
  }
  
  calculatePerformanceMetrics(portfolio: PortfolioSummary) {
    // Performance metrics
  }
}
```

### **Phase 3: Component Cleanup**

**1. Clean Component Interfaces**
- Remove inline business logic
- Use centralized utilities
- Simplify props interfaces

**2. Consistent Service Usage**
- Standardize formatting approaches
- Remove hardcoded business rules

## 🔧 Implementation Guidelines

### File Organization
```
src/
├── utils/
│   ├── formatting.ts       # Currency, percentage, number formatting
│   ├── calculations.ts     # Portfolio and trading calculations
│   ├── constants.ts        # Business rules and UI config
│   ├── validation.ts       # Input validation helpers
│   └── index.ts           # Export all utilities
├── services/
│   ├── portfolioAnalyticsService.ts  # New analytics service
│   └── ...existing services
```

### Usage Examples

**Before (in component):**
```typescript
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)
}
```

**After (using utility):**
```typescript
import { formatCurrency } from '../utils'

// Simply use the centralized function
formatCurrency(value)
```

### Validation Checklist

- [ ] All `formatCurrency` duplications removed
- [ ] Magic numbers moved to constants
- [ ] Business logic extracted from components
- [ ] Utilities properly typed with TypeScript
- [ ] Tests added for utility functions
- [ ] Components use centralized services
- [ ] Documentation updated

## 📊 Expected Benefits

- **Reusability**: Common utilities available across components
- **Maintainability**: Centralized business rules and configuration
- **Testability**: Isolated business logic easier to unit test
- **Consistency**: Uniform formatting and calculations
- **Performance**: Reduced code duplication and better bundling

## 🚀 Migration Strategy

1. **Create utils layer** with all utility functions
2. **Update components one by one** to use new utilities
3. **Remove duplicate implementations** after migration
4. **Add tests** for utility functions
5. **Update documentation** and code guidelines

## 📝 Testing Requirements

- Unit tests for all utility functions
- Integration tests for service methods
- Component tests to ensure UI still works correctly
- Performance benchmarks to verify optimization gains