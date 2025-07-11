# CLAUDE.md

Global stock portfolio dashboard built with React 18, TypeScript, and Vite.

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

## Design References

Use these for all CSS styling work:
- **Template**: `template/` folder HTML files for visual patterns
- **Spotify Design System**: https://spotify.design/ 
- **Material Design**: https://material.io/design

**Design Principles**:
- Minimal & clean with subtle animations
- Glassmorphism patterns and micro-interactions
- Typography hierarchy with bold weights
- Smooth transitions (150ms fast, 350ms standard, 650ms slow)
- Consistent spacing, hover effects, and responsive behavior

## Tech Stack
- React 18, TypeScript, Vite
- Tailwind CSS 3.x with dark mode
- Supabase (configured)
- Recharts (planned)

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

## GitHub Issue Handling
- When referencing GitHub issues, always check issue content for specific requirements
- Adhere strictly to issue descriptions, acceptance criteria, and specifications
- Use issue requirements as primary source of truth for implementation
- Reference issue numbers in commit messages when implementing fixes