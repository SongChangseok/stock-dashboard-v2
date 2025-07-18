# CLAUDE.md

Global stock portfolio dashboard built with React 18, TypeScript, and Vite.

**Project Type**: User-input based stock portfolio tracker. All stock data and prices are manually entered by users - no real-time market data or automatic price updates.

## Development Commands

**Core Development**:
- `npm run dev` - Start development server
- `npm run build` - Production build (TypeScript compile + Vite build)
- `npm run preview` - Preview production build
- `npm run lint` - ESLint check
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format with Prettier
- `npm run format:check` - Check formatting without changes

**Testing Commands**:
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:coverage:detailed` - Run detailed coverage analysis with thresholds
- `npm run test:quality-gates` - Run comprehensive quality gate checks
- `npm run test:all` - Run all tests (unit + e2e)

**End-to-End Testing**:
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run e2e tests with UI mode
- `npm run test:e2e:debug` - Run e2e tests in debug mode
- `npm run test:e2e:headed` - Run e2e tests in headed mode
- `npm run test:cross-browser` - Run cross-browser tests (Chrome, Firefox, Safari)
- `npm run test:mobile` - Run mobile device tests
- `npm run test:responsive` - Run responsive design tests
- `npm run test:features` - Run feature detection tests
- `npm run test:compatibility` - Run cross-browser compatibility tests
- `npm run test:user-journey` - Run complete user journey tests
- `npm run test:error-scenarios` - Run error scenario tests
- `npm run test:performance` - Run performance scenario tests
- `npm run test:accessibility` - Run accessibility scenario tests
- `npm run test:scenarios` - Run all user scenario tests
- `npm run test:quality` - Run quality metrics validation tests

**Supabase Commands**:
- `npm run supabase:start` - Start Supabase locally
- `npm run supabase:stop` - Stop Supabase locally
- `npm run supabase:reset` - Reset Supabase database
- `npm run supabase:types` - Generate TypeScript types

## Design System

- **Primary Color**: Indigo Blue (#6366F1)
- **Font**: Pretendard (Korean-optimized)
- **Theme**: Dark mode with mobile-first responsive design
- **Breakpoints**: Mobile 375px+, Tablet 768px+, Desktop 1024px+

## Mobile-First Responsive Implementation

**Navigation**:
- Header with user info and logout
- Table-based data display for desktop
- Card-based layouts for mobile
- Touch-optimized interactions (44px minimum touch targets)

**Responsive Components**:
- `Header` - Unified responsive header (desktop menu, mobile hamburger)
- `Layout` - Global layout wrapper with Header
- `StockList` - Table view (desktop) / Card view (mobile)
- `PortfolioChart` - Responsive pie chart with mobile-optimized sizing
- `PortfolioComparison` - Dual chart layout (stacked mobile, side-by-side desktop)
- `RebalancingCalculator` - Advanced calculator with responsive options grid
- `TradingGuide` - Tab-based interface with trading cards and simulation
- `TradingGuideCard` - Individual stock action cards with visual indicators
- `RebalancingSimulation` - Interactive before/after portfolio visualization
- All components use `min-h-[44px]` for touch accessibility

## Design References

Use these for all CSS styling work:
- **Template**: `template/` folder HTML files for visual patterns
- **Spotify Design System**: https://spotify.design/ 
- **Material Design**: https://material.io/design

**Design Principles**:
- Mobile-first responsive design approach
- Minimal & clean with subtle animations
- Glassmorphism patterns (`bg-white/5`, `backdrop-blur-xl`)
- Typography hierarchy with bold weights
- Smooth transitions (150ms fast, 350ms standard, 650ms slow)
- Consistent spacing with responsive breakpoints (`p-4 md:p-6`)
- Touch-friendly interface with 44px minimum touch targets

## Tech Stack

**Core Framework**:
- React 18.3.1 with TypeScript 5.5.3
- Vite 5.4.1 for build tooling and development server
- React Router DOM 7.6.3 for client-side routing

**Styling & UI**:
- Tailwind CSS 3.4.10 with dark mode + mobile-first responsive classes
- PostCSS 8.4.45 for CSS processing
- Custom CSS modules for mobile optimizations and skeleton loading

**State Management & Backend**:
- Zustand 5.0.6 for lightweight state management
- Supabase 2.50.4 with real-time database integration
- TypeScript-first database schema with generated types

**Data Visualization**:
- Recharts 3.1.0 for interactive charts and portfolio comparisons
- Custom chart configurations with responsive design

**Testing Infrastructure**:
- Vitest 3.2.4 for unit testing with coverage reporting
- Testing Library (React 16.3.0) for component testing
- Playwright 1.54.1 for end-to-end and cross-browser testing
- Jest DOM 6.6.3 for custom DOM matchers
- Axe-core 4.10.3 for accessibility testing

**Development Tools**:
- ESLint 9.9.0 with TypeScript ESLint 8.0.1
- Prettier 3.3.3 for code formatting
- JSDOM 26.1.0 for browser environment simulation

## Project Structure
```
src/
├── components/                      # React components
│   ├── Layout.tsx                   # Global layout with Header and routing
│   ├── Header.tsx                   # Unified responsive header with navigation
│   ├── StockList.tsx                # Responsive table/card layout for stocks
│   ├── StockForm.tsx                # Stock entry/edit form component
│   ├── PortfolioChart.tsx           # Pie chart visualization with Recharts
│   ├── PortfolioComparison.tsx      # Dual chart comparison component
│   ├── PortfolioSummary.tsx         # Portfolio statistics and summary
│   ├── RebalancingCalculator.tsx    # Advanced rebalancing calculations and settings
│   ├── TradingGuide.tsx             # Trading guide with cards and simulation
│   ├── TradingGuideCard.tsx         # Individual stock trading guide cards
│   ├── RebalancingSimulation.tsx    # Before/after rebalancing simulation
│   ├── TargetPortfolioForm.tsx      # Modal form for portfolio CRUD
│   ├── TargetPortfolioList.tsx      # Grid/list view with action buttons
│   ├── AuthForm.tsx                 # Authentication form component
│   ├── ErrorBoundary.tsx            # Error boundary for error handling
│   ├── FloatingActionButton.tsx     # FAB for mobile actions
│   ├── LoadingIndicator.tsx         # Basic loading state indicator
│   ├── AnimatedLoadingScreen.tsx    # Full-screen animated loading component
│   ├── ProtectedRoute.tsx           # Route protection wrapper
│   ├── SkeletonLoader.tsx           # Basic skeleton loading states
│   ├── LazySkeletonLoader.tsx       # Lazy-loaded skeleton with performance optimization
│   ├── SwipeIndicator.tsx           # Mobile swipe interaction indicator
│   ├── ui/                          # Reusable UI components library
│   │   ├── ActionButtonGroup.tsx    # Button group component
│   │   ├── BaseChart.tsx            # Base chart wrapper with common functionality
│   │   ├── Card.tsx                 # Card component with glassmorphism
│   │   ├── EmptyState.tsx           # Empty state component with illustrations
│   │   ├── FormField.tsx            # Form field wrapper with validation
│   │   ├── ListContainer.tsx        # List container component with responsive grid
│   │   ├── LoadingButton.tsx        # Button with loading state and spinner
│   │   ├── Modal.tsx                # Modal dialog component with backdrop
│   │   └── index.ts                 # UI component exports
│   ├── auth/                        # Authentication-related components
│   ├── layout/                      # Layout-specific components
│   ├── __tests__/                   # Component unit and integration tests
│   │   ├── AccessibilityCompliance.test.tsx # Accessibility compliance tests
│   │   ├── DashboardIntegration.test.tsx     # Dashboard integration tests
│   │   ├── PortfolioChart.test.tsx           # Portfolio chart component tests
│   │   ├── StockList.test.tsx                # Stock list component tests
│   │   └── TargetPortfolioIntegration.test.tsx # Target portfolio integration tests
│   └── index.ts                     # Component exports
├── pages/                           # Page-level components
│   ├── AuthPage.tsx                 # Login/signup authentication page
│   ├── DashboardPage.tsx            # Portfolio overview with quick actions
│   ├── TargetPortfolioPage.tsx      # Target portfolio management page
│   ├── PortfolioComparisonPage.tsx  # Analytics, comparison, and rebalancing view
│   └── index.ts                     # Page exports
├── services/                        # Business logic and API services
│   ├── stockService.ts              # Stock data CRUD operations
│   ├── targetPortfolioService.ts    # Target portfolio database operations
│   ├── rebalancingService.ts        # Rebalancing calculations and algorithms
│   ├── authService.ts               # Authentication service
│   ├── authHelpers.ts               # Authentication helper functions
│   ├── baseService.ts               # Base service class with common functionality
│   ├── database.ts                  # Database connection and configuration
│   ├── errorService.ts              # Error handling service
│   ├── realtimeService.ts           # Real-time database subscriptions
│   ├── supabase.ts                  # Supabase client configuration
│   ├── __tests__/                   # Service unit tests
│   │   ├── ServiceIntegration.test.ts        # Service integration tests
│   │   ├── authService.test.ts               # Authentication service tests
│   │   ├── rebalancingService.test.ts        # Rebalancing service tests
│   │   ├── stockService.test.ts              # Stock service tests
│   │   └── targetPortfolioService.test.ts    # Target portfolio service tests
│   └── index.ts                     # Service exports
├── stores/                          # Zustand state management
│   ├── portfolioStore.ts            # Current portfolio state management
│   ├── targetPortfolioStore.ts      # Target portfolio state management
│   ├── authStore.ts                 # Authentication state
│   ├── __tests__/                   # Store unit tests
│   │   ├── authStore.test.ts                 # Authentication store tests
│   │   ├── portfolioStore.test.ts            # Portfolio store tests
│   │   └── targetPortfolioStore.test.ts      # Target portfolio store tests
│   └── index.ts                     # Store exports
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Authentication hook
│   ├── usePortfolio.ts              # Portfolio data hook
│   ├── useAccessibility.ts          # Accessibility features hook
│   ├── useErrorHandler.ts           # Error handling hook
│   ├── useFormValidation.ts         # Form validation hook
│   ├── useLoadingState.ts           # Loading state management hook
│   ├── usePerformanceMonitor.ts     # Performance monitoring hook
│   ├── useResponsive.ts             # Responsive design hook
│   ├── useTouchOptimization.ts      # Touch interaction optimization hook
│   ├── useWindowSize.ts             # Window size tracking hook
│   └── index.ts                     # Hook exports
├── contexts/                        # React context providers
│   └── auth/                        # Authentication context
├── types/                           # TypeScript type definitions
│   ├── components.ts                # Component prop types
│   ├── store.ts                     # State management types
│   ├── targetPortfolio.ts           # Target portfolio specific types
│   ├── rebalancing.ts               # Rebalancing calculation types
│   ├── analytics.ts                 # Portfolio analytics types
│   ├── api.ts                       # API service types
│   ├── base.ts                      # Base types and interfaces
│   ├── database.ts                  # Database schema types
│   └── index.ts                     # Type exports
├── utils/                           # Utility functions and helpers
│   ├── formatting.ts                # Formatting utilities (currency, percentage, etc.)
│   ├── calculations.ts              # Portfolio calculation utilities
│   ├── validation.ts                # Input validation utilities
│   ├── constants.ts                 # Business rules and UI constants
│   ├── accessibility.ts             # Accessibility helper functions
│   ├── accessibilityTester.ts       # Accessibility testing utilities
│   ├── chartConfig.ts               # Chart configuration utilities
│   ├── colorUtils.ts                # Color manipulation utilities
│   ├── errorMonitor.ts              # Error monitoring and reporting
│   ├── loadingState.ts              # Loading state management utilities
│   ├── performanceMonitor.ts        # Performance monitoring utilities
│   ├── qualityMetrics.ts            # Quality metrics collection
│   ├── rebalancingCalculatorUtils.ts # Rebalancing calculator specific utilities
│   ├── sessionStorage.ts            # Session storage utilities
│   ├── stockFormUtils.ts            # Stock form helper utilities
│   ├── targetPortfolioFormUtils.ts  # Target portfolio form utilities
│   ├── touchOptimization.ts         # Touch interaction optimization
│   ├── __tests__/                   # Utility unit tests
│   │   ├── calculations.test.ts     # Portfolio calculation tests
│   │   ├── constants.test.ts        # Constants validation tests
│   │   ├── formatting.test.ts       # Formatting function tests
│   │   └── validation.test.ts       # Validation function tests
│   └── index.ts                     # Utility exports
├── test/                            # Testing configuration and utilities
│   ├── setup.ts                     # Test environment setup
│   ├── test-utils.tsx               # Testing utilities and custom renderers
│   ├── accessibility-utils.tsx      # Accessibility testing utilities
│   ├── integration-utils.tsx        # Integration testing utilities
│   └── __tests__/                   # Test utility tests
│       ├── EndToEndWorkflows.test.tsx        # End-to-end workflow tests
│       └── SimpleIntegration.test.tsx        # Simple integration tests
└── styles/                          # CSS and styling
    ├── mobile.css                   # Mobile-specific optimizations
    ├── skeleton.css                 # Skeleton loader styles
    └── index.css                    # Global styles and Tailwind imports
```

## Testing Infrastructure

**Testing Framework**:
- Vitest for unit testing and component testing
- Testing Library (React) for component interaction testing
- Jest DOM for custom matchers and assertions
- JSDOM for browser environment simulation
- Coverage reporting with @vitest/coverage-v8

**Testing Commands**:
- `npm run test` - Run all tests once
- `npm run test:watch` - Run tests in watch mode during development
- `npm run test:coverage` - Generate coverage reports

**Testing Structure**:
- Unit tests co-located with source files in `__tests__/` directories
- Test utilities and setup in `src/test/` directory
- Custom render functions with provider wrappers
- Mocking strategies for Supabase and external dependencies

**Testing Best Practices**:
- Test behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Mock external dependencies and API calls
- Test accessibility and responsive behavior
- Maintain high test coverage for critical business logic

## Claude Guidelines
- Keep responses ≤4 lines unless detail requested
- No unnecessary explanations or preambles
- Answer directly without elaboration
- Use TodoWrite for multi-step tasks
- Read files before editing
- Follow existing code patterns and conventions
- Run lint and tests before marking tasks complete
- Never commit unless explicitly requested
- **All text content must be in English for global targeting**

## Portfolio Management Features

**Authentication & Security**:
- Supabase Authentication with email/password
- Protected routes with automatic redirect to login
- User-specific data isolation (RLS policies)
- Session management with persistent login state
- Automatic logout and session cleanup

**Current Portfolio Management**:
- Manual stock entry with quantity, purchase price, and current price
- Real-time portfolio value calculation and profit/loss tracking
- Interactive pie chart visualization with Recharts
- Responsive grid/card layout for stock listings
- CRUD operations with Supabase database integration

**Target Portfolio System**:
- Create multiple target portfolio templates with custom allocations
- Stock selection from existing portfolio holdings (dropdown-based)
- Visual weight distribution with auto-balance functionality
- Portfolio duplication and template management
- Real-time validation ensuring 100% total weight allocation
- Responsive modal form with weight input controls
- Automatic ticker population when stocks are selected
- Prevention of duplicate stock selection within portfolios

**Portfolio Comparison & Analytics**:
- Side-by-side dual pie chart comparison (current vs target)
- Weight difference visualization with color-coded indicators
- Rebalancing recommendations and deviation alerts
- Interactive tooltips showing detailed allocation data
- Cross-page navigation with context preservation

**Advanced Rebalancing System**:
- Sophisticated rebalancing calculator with customizable options
- Buy/sell quantity calculations with minimum trading unit constraints
- Commission consideration and cost optimization
- Individual stock trading guide cards with visual action indicators
- Before/after portfolio simulation with interactive toggle
- Trading guide with priority-based recommendations
- Real-time calculation validation and error handling

**Page Interconnections**:
- Dashboard → Analytics: Quick access card for portfolio analysis
- Target Portfolio → Analytics: Direct comparison button integration
- Analytics → Target Portfolio: Create portfolio link when none exist
- Seamless navigation with selected portfolio state persistence

## Development Best Practices

**Mobile-First Development**:
- Start with mobile layout (`base` classes)
- Add tablet/desktop breakpoints (`md:`, `lg:`)
- Use `min-h-[44px]` for all interactive elements
- Test responsive breakpoints at 375px, 768px, 1024px

**Type Organization**:
- Component props: `types/components.ts`
- Store interfaces: `types/store.ts`
- Target portfolio types: `types/targetPortfolio.ts`
- Rebalancing types: `types/rebalancing.ts`
- Analytics types: `types/analytics.ts`
- API types: `types/api.ts`
- Database types: `types/database.ts`
- Export all from `types/index.ts`

**Component Patterns**:
- Use centralized types for all component props
- Implement responsive visibility (`hidden md:block`, `md:hidden`)
- Apply glassmorphism consistently (`bg-white/5`, `backdrop-blur-xl`)
- Follow mobile-first spacing patterns (`p-4 md:p-6`)
- Use proper loading states and error boundaries
- Implement optimistic UI updates for better UX
- Integrate dropdowns for stock selection to prevent data inconsistency
- Auto-populate related fields (ticker from stock name) for better UX

**Business Logic Separation**:
- Utility functions centralized in `utils/` directory
- Formatting utilities: `formatCurrency`, `formatPercentage` in `utils/formatting.ts`
- Calculation utilities: portfolio calculations in `utils/calculations.ts`
- Validation utilities: input validation in `utils/validation.ts`
- Business rules: constants and thresholds in `utils/constants.ts`
- Service layer: database operations separated from UI logic

**Type Declaration Guidelines**:
- **NEVER** declare types in component `.tsx` files
- **NEVER** declare types in utility `.ts` files, service files, or hook files
- **ALWAYS** declare types in the centralized `types/` directory
- Component prop interfaces → `types/components.ts`
- Business logic types → appropriate type files (`types/analytics.ts`, `types/rebalancing.ts`, etc.)
- Import types from centralized location: `import type { TypeName } from '../types'`
- Use `export type` for type-only exports from type files
- Keep type files focused and well-organized by domain

**Database Integration Patterns**:
- Use Zustand stores for state management with async operations
- Implement proper error handling with user-friendly messages
- Use TypeScript interfaces for type-safe database operations
- Follow service layer pattern for database operations
- Handle JSON data types with proper type casting for Supabase

**Layout Architecture**:
- `Layout.tsx` - Global wrapper with Header and main content area
- Pages render content-only using React Router's `<Outlet />` 
- Navigation state managed by React Router `useLocation` hook
- Auth logic centralized in Layout component

## Portfolio Management Workflows

**Creating a Target Portfolio**:
1. Navigate to Target Portfolio page
2. Click "Create Portfolio" button
3. Fill portfolio name and description
4. Select stocks from existing portfolio holdings via dropdown
5. Set target weight percentages for each selected stock
6. Use "Auto Balance" to distribute weights equally
7. Validate that total weight equals 100%
8. Save to database with real-time sync

**Portfolio Comparison Analysis**:
1. Select target portfolio from comparison page
2. View dual pie charts (current vs target)
3. Analyze weight differences and deviations
4. Use rebalancing calculator with customizable options
5. Review individual stock trading guide cards
6. Simulate before/after portfolio scenarios
7. Follow priority-based trading recommendations

**Cross-Page Navigation Flows**:
- Dashboard quick access → Analytics comparison
- Target portfolio "Compare" → Analytics with pre-selection
- Analytics "Create Portfolio" → Target portfolio form
- Portfolio duplication → Edit form with copied data

## Database Schema

**Target Portfolios Table**:
```sql
target_portfolios (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  name: text
  allocations: json {
    description?: string
    stocks: [{
      stock_name: string
      ticker?: string
      target_weight: number
    }]
    total_weight: number
  }
  created_at: timestamp
  updated_at: timestamp
)
```

**Stocks Table**:
```sql
stocks (
  id: uuid (primary key)
  user_id: uuid (foreign key)
  stock_name: text
  ticker?: text
  quantity: number
  purchase_price: number
  current_price: number
  created_at: timestamp
  updated_at: timestamp
)
```

## Current Limitations & Future Features

**Not Yet Implemented**:
- Settings page functionality (navigation exists but no content)
- Real-time stock price updates (manual entry only)
- Portfolio performance history and charts
- Export/import portfolio data
- Email notifications for rebalancing alerts
- Multi-currency support
- Portfolio benchmarking against indices
- Manual stock entry for target portfolios (restricted to existing holdings)

**Planned Enhancements**:
- Advanced portfolio analytics and metrics (partially implemented)
- Automatic rebalancing suggestions (partially implemented)
- Portfolio risk assessment tools (partially implemented)
- Historical performance tracking
- Social features (portfolio sharing)
- Mobile app with push notifications

**Recently Implemented**:
- Business logic separation and utility function centralization
- Portfolio analytics service with risk metrics and performance analysis
- Comprehensive type organization in centralized types/ directory
- Rebalancing calculation utilities with trading insights
- Validation utilities for input handling
- Business rules constants for configuration management
- Unit testing infrastructure with Vitest and Testing Library (Phase 4.1)
- Component testing implementation with test utilities (Phase 4.2)
- Integration testing with advanced testing scenarios (Phase 4.3)
- Enhanced UI component library with accessibility features
- Performance monitoring and optimization hooks with lazy loading (Phase 4.5)
- Advanced error handling and loading state management
- Touch optimization and responsive design enhancements
- Accessibility testing support with axe-core integration (Phase 4.6)
- Cross-browser testing setup with Playwright for Chrome, Firefox, Safari (Phase 4.7)
- User scenario testing with complete user journey coverage (Phase 4.8)
- Quality metrics and reporting with comprehensive quality gates (Phase 4.9)

## GitHub Issue Handling
- When referencing GitHub issues, always check issue content for specific requirements
- Adhere strictly to issue descriptions, acceptance criteria, and specifications
- Use issue requirements as primary source of truth for implementation
- Reference issue numbers in commit messages when implementing fixes
- Test all functionality described in acceptance criteria before marking complete