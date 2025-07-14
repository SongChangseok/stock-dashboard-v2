# CLAUDE.md

Global stock portfolio dashboard built with React 18, TypeScript, and Vite.

**Project Type**: User-input based stock portfolio tracker. All stock data and prices are manually entered by users - no real-time market data or automatic price updates.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint check
- `npm run format` - Format with Prettier
- `npm run preview` - Preview production build
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
- React 18, TypeScript, Vite
- Tailwind CSS 3.x with dark mode + mobile-first responsive classes
- Zustand for state management
- Supabase with real-time database integration
- Recharts for data visualization and portfolio comparison charts

## Project Structure
```
src/
├── components/
│   ├── Layout.tsx                 # Global layout with Header
│   ├── Header.tsx                 # Unified responsive header
│   ├── StockList.tsx              # Responsive table/card layout
│   ├── PortfolioChart.tsx         # Pie chart visualization with Recharts
│   ├── PortfolioComparison.tsx    # Dual chart comparison component
│   ├── TargetPortfolioForm.tsx    # Modal form for portfolio CRUD
│   ├── TargetPortfolioList.tsx    # Grid/list view with action buttons
│   └── ...
├── pages/
│   ├── AuthPage.tsx               # Login/signup authentication
│   ├── DashboardPage.tsx          # Portfolio overview with quick actions
│   ├── TargetPortfolioPage.tsx    # Target portfolio management
│   ├── PortfolioComparisonPage.tsx # Analytics and comparison view
│   └── index.ts                   # Page exports
├── services/
│   ├── stockService.ts            # Stock data CRUD operations
│   ├── targetPortfolioService.ts  # Target portfolio database operations
│   └── supabase.ts                # Database configuration
├── stores/
│   ├── portfolioStore.ts          # Current portfolio state management
│   ├── targetPortfolioStore.ts    # Target portfolio state management
│   ├── authStore.ts               # Authentication state
│   └── index.ts                   # Store exports
├── hooks/
│   ├── useAuth.ts                 # Authentication hook
│   ├── usePortfolio.ts            # Portfolio data hook
│   └── index.ts                   # Hook exports
├── types/
│   ├── components.ts              # Component prop types
│   ├── store.ts                   # State management types
│   ├── targetPortfolio.ts         # Target portfolio specific types
│   ├── api.ts                     # API service types
│   └── database.ts                # Database schema types
└── styles/
    ├── mobile.css                 # Mobile-specific optimizations
    └── index.css                  # Global styles and Tailwind imports
```

## Claude Guidelines
- Keep responses ≤4 lines unless detail requested
- No unnecessary explanations or preambles
- Answer directly without elaboration
- Use TodoWrite for multi-step tasks
- Read files before editing
- Follow existing code patterns and conventions
- Run lint before marking tasks complete
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
- Visual weight distribution with auto-balance functionality
- Portfolio duplication and template management
- Real-time validation ensuring 100% total weight allocation
- Responsive modal form with weight input controls

**Portfolio Comparison & Analytics**:
- Side-by-side dual pie chart comparison (current vs target)
- Weight difference visualization with color-coded indicators
- Rebalancing recommendations and deviation alerts
- Interactive tooltips showing detailed allocation data
- Cross-page navigation with context preservation

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
4. Add stocks with target weight percentages
5. Use "Auto Balance" to distribute weights equally
6. Validate that total weight equals 100%
7. Save to database with real-time sync

**Portfolio Comparison Analysis**:
1. Select target portfolio from comparison page
2. View dual pie charts (current vs target)
3. Analyze weight differences and deviations
4. Check rebalancing recommendations
5. Navigate back to adjust portfolio or holdings

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

**Planned Enhancements**:
- Advanced portfolio analytics and metrics
- Automatic rebalancing suggestions
- Portfolio risk assessment tools
- Historical performance tracking
- Social features (portfolio sharing)
- Mobile app with push notifications

## GitHub Issue Handling
- When referencing GitHub issues, always check issue content for specific requirements
- Adhere strictly to issue descriptions, acceptance criteria, and specifications
- Use issue requirements as primary source of truth for implementation
- Reference issue numbers in commit messages when implementing fixes
- Test all functionality described in acceptance criteria before marking complete