-- ============================================================
-- Adaptive Mock Test Engine Tables
-- ============================================================

-- 1. GRE_BANK_QUESTIONS TABLE — The question bank (renamed to avoid conflict
--    with the existing `questions` table from 20240126_create_tests_schema.sql)
CREATE TABLE IF NOT EXISTS gre_bank_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section TEXT NOT NULL CHECK (section IN ('verbal', 'quant')),
    question_type TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_text TEXT NOT NULL,
    passage TEXT,
    choices JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    topic TEXT,
    source TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gbq_section ON gre_bank_questions(section);
CREATE INDEX IF NOT EXISTS idx_gbq_difficulty ON gre_bank_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_gbq_type ON gre_bank_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_gbq_section_difficulty ON gre_bank_questions(section, difficulty);

ALTER TABLE gre_bank_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gre_bank_questions" ON gre_bank_questions
    FOR SELECT USING (true);

-- ============================================================

-- 2. MOCK_TESTS TABLE — Tracks each test session
CREATE TABLE IF NOT EXISTS mock_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    verbal_1_score INTEGER,
    verbal_2_score INTEGER,
    verbal_2_difficulty TEXT CHECK (verbal_2_difficulty IN ('easy', 'hard')),
    quant_1_score INTEGER,
    quant_2_score INTEGER,
    quant_2_difficulty TEXT CHECK (quant_2_difficulty IN ('easy', 'hard')),
    verbal_scaled_score INTEGER,
    quant_scaled_score INTEGER,
    total_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mock_tests_user ON mock_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_tests_status ON mock_tests(status);

ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tests" ON mock_tests
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================

-- 3. MOCK_TEST_SECTIONS TABLE — Each of the 4 sections in a test
CREATE TABLE IF NOT EXISTS mock_test_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mock_test_id UUID NOT NULL REFERENCES mock_tests(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN ('verbal', 'quant')),
    section_number INTEGER NOT NULL CHECK (section_number IN (1, 2)),
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('standard', 'easy', 'hard')),
    time_limit_seconds INTEGER NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    raw_score INTEGER,
    total_questions INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(mock_test_id, section_type, section_number)
);

ALTER TABLE mock_test_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sections" ON mock_test_sections
    FOR ALL USING (mock_test_id IN (SELECT id FROM mock_tests WHERE user_id = auth.uid()));

-- ============================================================

-- 4. MOCK_TEST_ANSWERS TABLE — Individual question responses
CREATE TABLE IF NOT EXISTS mock_test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES mock_test_sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES gre_bank_questions(id),
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_answers_section ON mock_test_answers(section_id);

ALTER TABLE mock_test_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own answers" ON mock_test_answers
    FOR ALL USING (section_id IN (
        SELECT s.id FROM mock_test_sections s
        JOIN mock_tests t ON s.mock_test_id = t.id
        WHERE t.user_id = auth.uid()
    ));
