
-- Reset User Data for Fresh Start
-- Preserves 'user_word_progress' (Mastered Words)
-- Deletes 'user_skills', 'user_mistakes', 'user_test_attempts', 'user_practice_questions'

BEGIN;

-- 1. Reset Skills (Mental Model)
TRUNCATE TABLE user_skills;

-- 2. Reset Mistake History
TRUNCATE TABLE user_mistakes;

-- 3. Reset Test Attempts (Scores)
TRUNCATE TABLE user_test_attempts;

-- 4. Reset Practice Questions
TRUNCATE TABLE user_practice_questions;

COMMIT;
