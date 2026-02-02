-- GRE Practice Test 1 - Verbal Sections
-- This migration creates the test entries for the full GRE verbal practice test

-- Add question_count and difficulty columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'question_count') THEN
        ALTER TABLE tests ADD COLUMN question_count integer DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'difficulty') THEN
        ALTER TABLE tests ADD COLUMN difficulty text DEFAULT 'medium';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tests' AND column_name = 'updated_at') THEN
        ALTER TABLE tests ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
    END IF;
END $$;

-- Create GRE Practice Test 1 - Section 2 (15 questions, 18 minutes)
INSERT INTO tests (id, title, category, description, time_limit_minutes, question_count, difficulty)
VALUES (
    '11111111-1111-1111-1111-111111111112',
    'GRE Practice Test 1 - Verbal Section 2',
    'GRE Full Test',
    'Official GRE-style verbal reasoning section with 15 questions. Includes Reading Comprehension, Text Completion, and Sentence Equivalence questions.',
    18,
    15,
    'medium'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    time_limit_minutes = EXCLUDED.time_limit_minutes,
    question_count = EXCLUDED.question_count,
    difficulty = EXCLUDED.difficulty;

-- Create GRE Practice Test 1 - Section 3 (20 questions, 23 minutes)
INSERT INTO tests (id, title, category, description, time_limit_minutes, question_count, difficulty)
VALUES (
    '11111111-1111-1111-1111-111111111113',
    'GRE Practice Test 1 - Verbal Section 3',
    'GRE Full Test',
    'Official GRE-style verbal reasoning section with 20 questions. Includes Reading Comprehension, Text Completion, Sentence Equivalence, and Critical Reasoning questions.',
    23,
    20,
    'medium'
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    time_limit_minutes = EXCLUDED.time_limit_minutes,
    question_count = EXCLUDED.question_count,
    difficulty = EXCLUDED.difficulty;

-- Note: Questions will be seeded via the scripts/seed_gre_practice_test_1.ts script
-- which parses the detailed question content from the solutions markdown file.
