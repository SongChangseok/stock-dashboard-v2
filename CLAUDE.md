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

**Mobile Navigation (< 768px)**:
- Bottom tab navigation with 4 tabs (Dashboard, Portfolio, Analytics, Settings)
- Mobile header with hamburger menu
- Card-based layouts for data display
- Touch-optimized interactions (44px minimum touch targets)

**Desktop Navigation (≥ 768px)**:
- Traditional header with user info and logout
- Table-based data display
- Floating action buttons
- Hover states and desktop interactions

**Responsive Components**:
- `BottomTabNavigation` - Mobile-only navigation with React Router integration
- `Header` - Unified responsive header (desktop menu, mobile hamburger)
- `Layout` - Global layout wrapper with Header and BottomTabNavigation
- `StockList` - Table view (desktop) / Card view (mobile)
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
- Supabase (configured)
- Recharts (planned)

## Project Structure
```
src/
├── components/
│   ├── Layout.tsx                 # Global layout with Header & Navigation
│   ├── Header.tsx                 # Unified responsive header
│   ├── BottomTabNavigation.tsx    # Mobile navigation (React Router)
│   ├── StockList.tsx              # Responsive table/card layout
│   └── ...
├── pages/
│   ├── DashboardPage.tsx          # Content-only page (no layout)
│   ├── TargetPortfolioPage.tsx    # Content-only page (no layout)
│   └── ...
├── types/
│   ├── components.ts              # Component prop types
│   ├── store.ts                   # State management types
│   ├── api.ts                     # API service types
│   └── database.ts                # Database types
└── styles/
    └── mobile.css                 # Mobile-specific optimizations
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

## Development Best Practices

**Mobile-First Development**:
- Start with mobile layout (`base` classes)
- Add tablet/desktop breakpoints (`md:`, `lg:`)
- Use `min-h-[44px]` for all interactive elements
- Test responsive breakpoints at 375px, 768px, 1024px

**Type Organization**:
- Component props: `types/components.ts`
- Store interfaces: `types/store.ts`
- API types: `types/api.ts`
- Database types: `types/database.ts`
- Export all from `types/index.ts`

**Component Patterns**:
- Use centralized types for all component props
- Implement responsive visibility (`hidden md:block`, `md:hidden`)
- Apply glassmorphism consistently (`bg-white/5`, `backdrop-blur-xl`)
- Follow mobile-first spacing patterns (`p-4 md:p-6`)

**Layout Architecture**:
- `Layout.tsx` - Global wrapper with Header, main content area, and BottomTabNavigation
- Pages render content-only using React Router's `<Outlet />` 
- Navigation state managed by React Router `useLocation` hook
- No props needed for BottomTabNavigation (auto-detects active route)
- Auth logic centralized in Layout component

## GitHub Issue Handling
- When referencing GitHub issues, always check issue content for specific requirements
- Adhere strictly to issue descriptions, acceptance criteria, and specifications
- Use issue requirements as primary source of truth for implementation
- Reference issue numbers in commit messages when implementing fixes