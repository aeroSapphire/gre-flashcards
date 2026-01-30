-- Migration: Upgrade user_skills table from 4 skills to 10 skills
-- This enables bidirectional Bayesian skill tracking with difficulty weighting

-- Step 1: Add new columns for tracking correct/incorrect counts
ALTER TABLE user_skills
  ADD COLUMN IF NOT EXISTS correct_count integer DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS incorrect_count integer DEFAULT 0 NOT NULL;

-- Step 2: Create a new table with the updated schema
-- We need to recreate the table because PostgreSQL doesn't allow modifying CHECK constraints directly
CREATE TABLE user_skills_new (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_type text NOT NULL CHECK (skill_type IN (
    'POLARITY_ERROR',
    'INTENSITY_MISMATCH',
    'SCOPE_ERROR',
    'LOGICAL_CONTRADICTION',
    'TONE_REGISTER_MISMATCH',
    'TEMPORAL_ERROR',
    'PARTIAL_SYNONYM_TRAP',
    'DOUBLE_NEGATIVE_CONFUSION',
    'CONTEXT_MISREAD',
    'ELIMINATION_FAILURE'
  )),
  mu double precision DEFAULT 50.0 NOT NULL,
  sigma double precision DEFAULT 15.0 NOT NULL,
  correct_count integer DEFAULT 0 NOT NULL,
  incorrect_count integer DEFAULT 0 NOT NULL,
  last_practice_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, skill_type)
);

-- Step 3: Migrate existing data by mapping old skill types to new ones
-- Old 4-skill → New 10-skill mapping (we'll distribute the old values):
-- precision → POLARITY_ERROR, TEMPORAL_ERROR
-- vocab → INTENSITY_MISMATCH, PARTIAL_SYNONYM_TRAP
-- logic → SCOPE_ERROR, LOGICAL_CONTRADICTION, DOUBLE_NEGATIVE_CONFUSION, ELIMINATION_FAILURE
-- context → TONE_REGISTER_MISMATCH, CONTEXT_MISREAD

-- Insert mapped data for 'precision' → POLARITY_ERROR
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'POLARITY_ERROR', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'precision'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'precision' → TEMPORAL_ERROR
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'TEMPORAL_ERROR', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'precision'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'vocab' → INTENSITY_MISMATCH
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'INTENSITY_MISMATCH', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'vocab'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'vocab' → PARTIAL_SYNONYM_TRAP
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'PARTIAL_SYNONYM_TRAP', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'vocab'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'logic' → SCOPE_ERROR
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'SCOPE_ERROR', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'logic'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'logic' → LOGICAL_CONTRADICTION
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'LOGICAL_CONTRADICTION', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'logic'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'logic' → DOUBLE_NEGATIVE_CONFUSION
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'DOUBLE_NEGATIVE_CONFUSION', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'logic'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'logic' → ELIMINATION_FAILURE
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'ELIMINATION_FAILURE', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'logic'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'context' → TONE_REGISTER_MISMATCH
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'TONE_REGISTER_MISMATCH', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'context'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Insert mapped data for 'context' → CONTEXT_MISREAD
INSERT INTO user_skills_new (user_id, skill_type, mu, sigma, correct_count, incorrect_count, last_practice_at, created_at)
SELECT user_id, 'CONTEXT_MISREAD', mu, sigma, correct_count, incorrect_count, last_practice_at, created_at
FROM user_skills WHERE skill_type = 'context'
ON CONFLICT (user_id, skill_type) DO NOTHING;

-- Step 4: Drop old table and rename new one
DROP TABLE user_skills;
ALTER TABLE user_skills_new RENAME TO user_skills;

-- Step 5: Re-enable RLS and recreate policies
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);
