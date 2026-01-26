# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server on port 8080

# Build
npm run build        # Production build
npm run build:dev    # Development build

# Testing
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode

# Lint
npm run lint         # Run ESLint
```

## Architecture

This is a GRE vocabulary flashcard application built with React, TypeScript, Vite, and Supabase.

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack React Query for server state
- **Backend**: Supabase (auth + database)
- **Testing**: Vitest + React Testing Library

### Key Directories
- `src/components/` - React components (app-specific + shadcn/ui in `ui/`)
- `src/hooks/` - Custom hooks including flashcard data management
- `src/contexts/` - React contexts (AuthContext for Supabase auth)
- `src/pages/` - Page components (Index, Auth, NotFound)
- `src/integrations/supabase/` - Supabase client and types
- `src/test/` - Test setup and test files

### Data Layer
Two flashcard hooks exist:
- `useFlashcardsDb` (`src/hooks/useFlashcardsDb.ts`) - **Primary**: Supabase-backed with realtime subscriptions
- `useFlashcards` (`src/hooks/useFlashcards.ts`) - localStorage-backed (legacy/fallback)

The app uses `useFlashcardsDb` in production. Flashcards are auto-organized into lists of 30 words.

### Authentication
Auth is handled via `AuthContext` wrapping Supabase auth. Protected routes use `ProtectedRoute` component.

### Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.json and vite.config.ts)

### Environment Variables
Required for Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
