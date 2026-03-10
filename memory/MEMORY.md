# GRE Flashcards Project Memory

## Project Overview
GRE vocabulary flashcard + practice app. React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Supabase + TanStack Query.

## Key Architecture
- Primary data hook: `useFlashcardsDb` (Supabase-backed, realtime)
- Auth: `AuthContext` wrapping Supabase auth, `useAuth()` hook
- Routes in `src/App.tsx`
- Migrations in `supabase/migrations/`
- Types in `src/integrations/supabase/types.ts`

## Adaptive Mock Test Engine (implemented 2026-03-10)

### Files Created
- `supabase/migrations/20240206_adaptive_mock_test_engine.sql` — 4 new tables + RLS
- `scripts/seed_adaptive_questions.ts` — seeds 200 questions from `gre_question_bank.json`
- `src/services/adaptiveMockTestService.ts` — full adaptive logic service
- `src/pages/AdaptiveMockTestRunner.tsx` — complete test UI (intro → sections → results → review)

### Files Modified
- `src/App.tsx` — added `/adaptive-mock-test` route
- `src/pages/MockTestBrowser.tsx` — added featured Adaptive Mock Test card at top
- `src/integrations/supabase/types.ts` — added 4 new table types

### DB Tables Added
- `questions` — 200-question bank (seeded from gre_question_bank.json)
- `mock_tests` — tracks each test session per user
- `mock_test_sections` — the 4 sections per test (V1, V2, Q1, Q2)
- `mock_test_answers` — individual question responses

### Test Format
- Verbal 1: 12 questions, 18 min (standard)
- Verbal 2: 15 questions, 23 min (adaptive: easy or hard based on V1 score)
- Quant 1: 12 questions, 21 min (standard)
- Quant 2: 15 questions, 26 min (adaptive: easy or hard based on Q1 score)
- Adaptive threshold: ≥60% on Section 1 → hard module; <60% → easy module
- Scoring: 130–170 per section; Hard module: 150–170, Easy: 130–155

### Seed Script
```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=yyy npx tsx scripts/seed_adaptive_questions.ts
```

## Existing Mock Tests
- 6 Barron's tests (static JSON) at `/mock-tests/:testId`
- Old adaptive quant-only test at `/mock-test` (GREAdaptiveMockTest.tsx)

## Dev Commands
- `npm run dev` — dev server port 8080
- `npm run build` — production build (no errors as of 2026-03-10)
- `npx tsx scripts/seed_adaptive_questions.ts` — seed questions
