# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start dev server**: `npm run dev` - Runs Vite development server with HMR
- **Build**: `npm run build` - TypeScript compilation and Vite production build
- **Lint**: `npm run lint` - ESLint check for code quality
- **Lint fix**: `npm run lint:fix` - Auto-fix ESLint issues
- **Format**: `npm run format` - Format code with Prettier
- **Format check**: `npm run format:check` - Check code formatting
- **Preview**: `npm run preview` - Preview production build

## Project Architecture

This is a **Korean stock portfolio dashboard** built with React 19, TypeScript, and Vite. The project follows a 4-phase development plan outlined in `docs/development-plan.md`.

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.x with dark mode design system
- **Backend**: Supabase (planned for authentication and database)
- **Charts**: Recharts (planned for portfolio visualization)

### Design System
- **Primary Color**: Indigo Blue (#6366F1)
- **Font**: Pretendard (Korean-optimized)
- **Theme**: Dark mode with 4-tier background colors and semantic text colors
- **Layout**: Mobile-first responsive design

### Design Philosophy (Spotify-Inspired)
Reference: [Spotify Design System](https://spotify.design/stories/design/design-systems) and [Spotify GitHub](https://github.com/spotify)

- **Minimal & Clean**: Spotify's aesthetic with subtle animations and generous whitespace
- **Trendy Simplicity**: Modern component design with fluid interactions inspired by Spotify's design patterns
- **Typography Hierarchy**: Bold weights for emphasis, responsive scaling
- **Smooth Transitions**: 150ms fast, 350ms standard, 650ms slow animations
- **Modular Components**: Flexible, reusable UI elements with consistent spacing
- **Unique Identity**: Create a distinctive visual language while maintaining simplicity - not copying Spotify but drawing inspiration for trendy, modern design
- **Design Innovation**: Develop original design patterns that feel contemporary and unique while being simple and intuitive

### Directory Structure
```
src/
├── components/     # Reusable UI components
│   └── ui/        # Base UI components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── pages/         # Page components
├── services/      # API and external service integrations
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Current State
The project is in initial setup phase with Vite + React template. Key features to be implemented:
1. **Phase 1**: User authentication, stock CRUD operations, portfolio pie charts
2. **Phase 2**: Target portfolio comparison functionality
3. **Phase 3**: Rebalancing calculations and trading guidance
4. **Phase 4**: Testing and production deployment

### Development Notes
- Project uses TypeScript with strict configuration
- ESLint and Prettier configured for code quality
- Tailwind CSS configured with custom color palette for dark mode
- All index.ts files in subdirectories are export aggregators
- Mobile-first approach with 375px+ optimization target
- Korean language support with Pretendard font

## Claude Code Guidelines
- **Compact Communication**: Keep responses concise (≤4 lines) unless detail requested
- **Token Efficiency**: Avoid unnecessary explanations, preambles, or postambles
- **Direct Answers**: Answer questions directly without elaboration unless asked