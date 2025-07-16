# Code Deduplication Development Plan

## Overview
Comprehensive plan to eliminate redundant and duplicate code across the stock dashboard codebase. This addresses significant code duplication found in utilities, components, services, and type definitions.

## 📋 Implementation Phases

### Phase 1: Utility Functions Consolidation (Priority: Critical)
**Timeline: 2-3 days**

#### 1.1 Formatting Functions Unification
- **Target Files**: `utils/formatting.ts`, `utils/rebalancingCalculatorUtils.ts`
- **Actions**:
  - Move `formatQuantityChange()` and `formatDifference()` from `rebalancingCalculatorUtils.ts` to `formatting.ts`
  - Update all imports across components
  - Remove duplicate formatting logic
- **Impact**: ~200 lines of duplicate code eliminated

#### 1.2 Color Utilities Cleanup
- **Target File**: `utils/colorUtils.ts`
- **Actions**:
  - Remove 8 legacy function aliases:
    - `getProfitLossColorClass()` → use `getStatusTextColor()`
    - `getQuantityChangeColorClass()` → use `getStatusTextColor()`
    - `getValueChangeColorClass()` → use `getStatusTextColor()`
    - `getWeightColorClass()` → use `getWeightTextColor()`
    - `getWeightBarColorClass()` → use `getWeightBgColor()`
    - `getActionColorClass()` → use `getActionColor()`
    - `getDifferenceColorClass()` → use `getDifferenceColor()`
    - `getStatusColorClass()` → use `getBalancedStatusColor()`
  - Update all component imports
- **Impact**: ~150 lines of redundant code removed

#### 1.3 Calculation Functions Consolidation
- **Target Files**: `utils/calculations.ts`, `utils/stockFormUtils.ts`
- **Actions**:
  - Move `calculateStockMetrics()` logic from `stockFormUtils.ts` to `calculations.ts`
  - Create generic calculation functions that can be reused
  - Update component imports
- **Impact**: ~100 lines of duplicate calculations eliminated

#### 1.4 Validation Logic Unification
- **Target Files**: `utils/validation.ts`, `utils/targetPortfolioFormUtils.ts`
- **Actions**:
  - Consolidate `validateTotalPortfolioWeight()` and `isWeightValid()` into single function
  - Move portfolio validation logic to `validation.ts`
  - Update form components
- **Impact**: ~50 lines of duplicate validation removed

### Phase 2: Component Pattern Standardization (Priority: High)
**Timeline: 4-5 days**

#### 2.1 Shared UI Components Creation
- **New Components**:
  ```
  src/components/ui/
  ├── Modal.tsx              # Shared modal wrapper
  ├── Card.tsx               # Glassmorphism card component
  ├── FormField.tsx          # Standard form input with validation
  ├── LoadingButton.tsx      # Button with loading state
  ├── ActionButtonGroup.tsx  # Edit/Delete button group
  └── EmptyState.tsx         # Standard empty state display
  ```

#### 2.2 Chart Components Unification
- **Target Files**: `PortfolioChart.tsx`, `PortfolioComparison.tsx`, `RebalancingSimulation.tsx`
- **Actions**:
  - Extract common chart configuration to `utils/chartConfig.ts`
  - Create shared `CustomTooltip` component
  - Centralize color arrays and chart sizing logic
  - Create `BaseChart` component for common pie chart functionality
- **Impact**: ~300 lines of duplicate chart code eliminated

#### 2.3 Form Pattern Standardization
- **Target Components**: `StockForm.tsx`, `TargetPortfolioForm.tsx`, `AuthForm.tsx`
- **Actions**:
  - Create `useFormValidation` hook for common form logic
  - Create `useLoadingState` hook for submit handling
  - Standardize error display and input styling
  - Extract modal structure to shared `Modal` component
- **Impact**: ~400 lines of form code consolidated

#### 2.4 List Component Pattern Unification
- **Target Components**: `StockList.tsx`, `TargetPortfolioList.tsx`
- **Actions**:
  - Create shared `ListContainer` component
  - Standardize empty state handling
  - Create reusable action button patterns
  - Unify responsive grid/card layouts
- **Impact**: ~250 lines of list code consolidated

### Phase 3: Service Layer Refactoring (Priority: Medium)
**Timeline: 3-4 days**

#### 3.1 Base Service Class Creation
- **New File**: `services/BaseService.ts`
- **Features**:
  - Generic CRUD operations
  - Standardized error handling
  - Common authentication patterns
  - Reusable query builders

#### 3.2 Authentication Service Consolidation
- **Target Files**: `authHelpers.ts`, `database.ts`, `supabase.ts`
- **Actions**:
  - Merge authentication logic into single `AuthService`
  - Remove duplicate `getCurrentUserId()` implementations
  - Centralize user session management
- **Impact**: ~100 lines of auth code consolidated

#### 3.3 Database Operation Standardization
- **Target Files**: `stockService.ts`, `targetPortfolioService.ts`
- **Actions**:
  - Extend from `BaseService` class
  - Remove duplicate CRUD patterns
  - Standardize error handling using `errorService.ts`
  - Create generic query methods
- **Impact**: ~200 lines of service code eliminated

### Phase 4: Type Definition Optimization (Priority: Low)
**Timeline: 1-2 days**

#### 4.1 Base Type Creation
- **New Types**:
  ```typescript
  // types/base.ts
  interface BaseChartData {
    name: string;
    value: number;
    color: string;
  }
  
  interface BaseValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  type ActionType = 'buy' | 'sell' | 'hold';
  ```

#### 4.2 Type Consolidation
- **Actions**:
  - Merge `ChartData` and `RebalancingSimulationChartData`
  - Consolidate validation result types
  - Create base portfolio comparison interface
  - Standardize error handling types
- **Impact**: ~15-20 interface definitions reduced

## 🧪 Testing Strategy

### Unit Tests
- Create tests for consolidated utility functions
- Test shared UI components in isolation
- Validate service layer refactoring

### Integration Tests
- Ensure form patterns work across all forms
- Verify chart components render correctly
- Test service layer CRUD operations

### Visual Regression Tests
- Confirm UI consistency after component consolidation
- Validate responsive design patterns
- Check glassmorphism styling consistency

## 📊 Success Metrics

### Code Quality Metrics
- **Lines of Code Reduction**: Target 15-20% decrease (~1,500 lines)
- **File Count Optimization**: Reduce utility files from 12 to 8
- **Component Reusability**: 80% of UI patterns use shared components
- **Import Statements**: Reduce by ~200 import statements

### Maintainability Improvements
- **Cyclomatic Complexity**: Reduce average complexity by 15%
- **Code Duplication**: Target <5% duplication (currently ~20%)
- **Test Coverage**: Maintain 85%+ coverage
- **Bundle Size**: Reduce by 8-10%

### Developer Experience
- **Consistent Patterns**: 100% of forms use shared validation
- **Reusable Components**: 90% of UI elements use design system
- **Type Safety**: Zero TypeScript errors
- **Documentation**: All shared components documented

## 🚀 Implementation Guidelines

### Code Standards
- Follow existing TypeScript and React patterns
- Maintain mobile-first responsive design
- Preserve glassmorphism design system
- Keep 44px minimum touch targets

### Migration Strategy
- Implement incrementally to avoid breaking changes
- Update imports in batches
- Run tests after each phase
- Maintain backward compatibility during transition

### Git Workflow
- Create feature branch for each phase
- Use conventional commit messages
- Include tests with each consolidation
- Request code review for major changes

## 🎯 Acceptance Criteria

### Phase 1 Complete
- [ ] All utility functions consolidated and tested
- [ ] Zero duplicate formatting/calculation functions
- [ ] All imports updated across codebase
- [ ] Legacy color functions removed

### Phase 2 Complete
- [ ] Shared UI components created and documented
- [ ] All forms use standardized patterns
- [ ] Chart components use shared configuration
- [ ] List components follow unified patterns

### Phase 3 Complete
- [ ] Base service class implemented
- [ ] All services extend base functionality
- [ ] Authentication logic centralized
- [ ] CRUD operations standardized

### Phase 4 Complete
- [ ] Base types created and used
- [ ] Duplicate interfaces eliminated
- [ ] Type imports centralized
- [ ] Zero TypeScript compilation errors

### Final Validation
- [ ] npm run lint passes with zero warnings
- [ ] npm run build completes successfully
- [ ] All tests pass (unit, integration, e2e)
- [ ] Bundle size reduced by target percentage
- [ ] Code duplication below 5% threshold
- [ ] Documentation updated for all changes

## 📝 Risk Assessment

### High Risk
- **Breaking Changes**: Extensive import updates may introduce bugs
- **Mitigation**: Incremental implementation with thorough testing

### Medium Risk
- **Component Refactoring**: UI changes may affect user experience
- **Mitigation**: Visual regression testing and careful styling preservation

### Low Risk
- **Type Consolidation**: TypeScript changes are compile-time safe
- **Mitigation**: Gradual migration with type checking

## 🔄 Post-Implementation

### Monitoring
- Track bundle size changes
- Monitor build times
- Measure development velocity
- Collect developer feedback

### Documentation Updates
- Update component library documentation
- Refresh architecture diagrams
- Update development guidelines
- Create migration guide for future developers

### Continuous Improvement
- Establish code review standards to prevent future duplication
- Set up automated duplicate code detection
- Create coding standards documentation
- Implement pre-commit hooks for code quality

---

**Estimated Total Timeline**: 10-14 days
**Estimated Impact**: 1,500+ lines of code reduced, 20% improvement in maintainability
**Risk Level**: Medium (manageable with proper testing)