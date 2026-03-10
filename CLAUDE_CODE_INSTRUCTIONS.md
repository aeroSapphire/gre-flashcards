# GRE Mock Test Engine — Implementation Instructions for Claude Code

## Overview

Build an adaptive GRE mock test engine backed by Supabase. A question bank (`gre_question_bank.json`) is provided in this directory with 200 questions (100 verbal, 100 quant). The app must support the latest GRE format: 2 Verbal sections + 2 Quant sections, where Section 2 adapts in difficulty based on Section 1 performance.

---

## 1. Database Schema (Supabase)

### 1.1 `questions` table — The Question Bank

```sql
CREATE TABLE IF NOT EXISTS questions (
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

CREATE INDEX idx_questions_section ON questions(section);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_section_difficulty ON questions(section, difficulty);
```

**Seed this table** by reading `gre_question_bank.json` from this directory. The file has a top-level `"questions"` array — insert each object directly into this table. The `id` field is pre-generated as UUID.

### 1.2 `mock_tests` table — Tracks each test session

```sql
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

CREATE INDEX idx_mock_tests_user ON mock_tests(user_id);
CREATE INDEX idx_mock_tests_status ON mock_tests(status);
```

### 1.3 `mock_test_sections` table — Each of the 4 sections in a test

```sql
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
```

### 1.4 `mock_test_answers` table — Individual question responses

```sql
CREATE TABLE IF NOT EXISTS mock_test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES mock_test_sections(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    question_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_answers_section ON mock_test_answers(section_id);
```

### 1.5 Row Level Security (RLS)

Enable RLS on all tables. Users should only see their own mock tests and answers:

```sql
ALTER TABLE mock_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_test_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own tests" ON mock_tests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users see own sections" ON mock_test_sections
    FOR ALL USING (mock_test_id IN (SELECT id FROM mock_tests WHERE user_id = auth.uid()));

CREATE POLICY "Users see own answers" ON mock_test_answers
    FOR ALL USING (section_id IN (
        SELECT s.id FROM mock_test_sections s
        JOIN mock_tests t ON s.mock_test_id = t.id
        WHERE t.user_id = auth.uid()
    ));

-- Questions table is read-only for all authenticated users
CREATE POLICY "Anyone can read questions" ON questions
    FOR SELECT USING (true);
```

---

## 2. GRE Test Format — CRITICAL RULES

The real GRE (as of 2024+) has this structure:

| Order | Section | Questions | Time |
|-------|---------|-----------|------|
| 1 | Verbal 1 | 12 questions | 18 minutes |
| 2 | Verbal 2 (adaptive) | 15 questions | 23 minutes |
| 3 | Quant 1 | 12 questions | 21 minutes |
| 4 | Quant 2 (adaptive) | 15 questions | 26 minutes |

**IMPORTANT:** Updated shorter GRE format. Total ~2 hours.

### Question Type Distribution Per Section

**Verbal sections** should contain a mix of:
- Reading Comprehension (~50%)
- Text Completion (~30%)
- Sentence Equivalence (~20%)

**Quant sections** should contain a mix of:
- Quantitative Comparison (~35%)
- Multiple Choice (~50%)
- Data Interpretation / Numeric Entry (~15%)

---

## 3. Adaptive Logic — THE CORE ENGINE

This is the most important part. The adaptive mechanism works as follows:

### 3.1 Section 1 (Standard Difficulty)

When generating Section 1 for either Verbal or Quant:
- Pull a **balanced mix** of easy and medium questions
- Target distribution: ~40% easy, ~60% medium
- This establishes the baseline

```
Query pattern:
SELECT * FROM questions
WHERE section = '{verbal|quant}'
  AND difficulty IN ('easy', 'medium')
  AND id NOT IN (previously_used_question_ids)
ORDER BY RANDOM()
LIMIT {12 for verbal, 12 for quant};
```

### 3.2 Scoring Section 1

After the user completes Section 1, calculate the raw score:
```
raw_score = number of correct answers
total = total questions in section
percentage = raw_score / total
```

### 3.3 Adaptive Threshold

```
IF percentage >= 0.60 THEN
    section_2_difficulty = 'hard'    -- User gets the harder module
ELSE
    section_2_difficulty = 'easy'    -- User gets the easier module
```

This mirrors the real GRE adaptive mechanism where ~60% correct triggers the harder second section.

### 3.4 Section 2 (Adaptive Difficulty)

**If section_2_difficulty = 'hard':**
- Pull ~30% medium + ~70% hard questions
- These users are on track for higher scores (155+)

```sql
SELECT * FROM questions
WHERE section = '{verbal|quant}'
  AND difficulty IN ('medium', 'hard')
  AND id NOT IN (previously_used_question_ids)
ORDER BY
    CASE WHEN difficulty = 'hard' THEN 0 ELSE 1 END,
    RANDOM()
LIMIT {15 for verbal, 15 for quant};
```

**If section_2_difficulty = 'easy':**
- Pull ~70% easy + ~30% medium questions
- These users need more foundational practice

```sql
SELECT * FROM questions
WHERE section = '{verbal|quant}'
  AND difficulty IN ('easy', 'medium')
  AND id NOT IN (previously_used_question_ids)
ORDER BY
    CASE WHEN difficulty = 'easy' THEN 0 ELSE 1 END,
    RANDOM()
LIMIT {15 for verbal, 15 for quant};
```

### 3.5 Preventing Question Reuse

Within a single mock test, **never repeat a question**. Track all question IDs used in Section 1 and exclude them from the Section 2 query. Also, optionally track questions seen across recent tests for a user to minimize repetition:

```sql
-- Get IDs already used in this mock test
SELECT question_id FROM mock_test_answers
WHERE section_id IN (
    SELECT id FROM mock_test_sections WHERE mock_test_id = $current_test_id
);
```

---

## 4. Score Calculation

### 4.1 Raw Scores
Each section produces a raw score (number correct out of total).

### 4.2 Scaled Score Estimation

The GRE reports scores on a 130–170 scale per section. Use this approximation:

```javascript
function calculateScaledScore(section1Raw, section1Total, section2Raw, section2Total, section2Difficulty) {
    const section1Pct = section1Raw / section1Total;
    const section2Pct = section2Raw / section2Total;

    // Weight: Section 1 = 40%, Section 2 = 60% (Section 2 matters more)
    const weightedPct = (section1Pct * 0.4) + (section2Pct * 0.6);

    if (section2Difficulty === 'hard') {
        // Hard module: scores range from 150-170
        return Math.round(150 + (weightedPct * 20));
    } else {
        // Easy module: scores range from 130-155
        return Math.round(130 + (weightedPct * 25));
    }
}
```

### 4.3 Total Score
```
total_score = verbal_scaled_score + quant_scaled_score
// Range: 260–340
```

---

## 5. API Endpoints / Supabase Edge Functions

Implement these as either Supabase Edge Functions (Deno) or in your app's backend:

### 5.1 `POST /api/mock-test/start`

Creates a new mock test and generates Section 1 for both Verbal and Quant.

**Flow:**
1. Create a `mock_tests` row
2. Create 4 `mock_test_sections` rows (V1, V2, Q1, Q2)
   - Section 1s get `difficulty_level = 'standard'`
   - Section 2s get `difficulty_level = NULL` (determined later)
3. Query questions for Verbal Section 1 (12 questions, easy/medium mix)
4. Query questions for Quant Section 1 (12 questions, easy/medium mix)
5. Create `mock_test_answers` rows for Section 1 questions (with `user_answer = NULL`)
6. Return the mock_test_id and Section 1 questions

**Response shape:**
```json
{
    "mock_test_id": "uuid",
    "sections": {
        "verbal_1": {
            "section_id": "uuid",
            "time_limit_seconds": 1080,
            "questions": [
                {
                    "question_order": 1,
                    "question_id": "uuid",
                    "question_type": "reading_comprehension",
                    "question_text": "...",
                    "passage": "...",
                    "choices": {"A": "...", "B": "...", ...}
                }
            ]
        },
        "quant_1": { ... }
    }
}
```

**IMPORTANT:** Never send `correct_answer` or `explanation` to the client during the test.

### 5.2 `POST /api/mock-test/{id}/submit-section`

Submits answers for a completed section and triggers adaptive logic if it's Section 1.

**Request body:**
```json
{
    "section_id": "uuid",
    "answers": [
        {"question_id": "uuid", "user_answer": "B", "time_spent_seconds": 45},
        {"question_id": "uuid", "user_answer": "A,C", "time_spent_seconds": 90}
    ]
}
```

**Flow:**
1. Validate all answers belong to this section
2. Grade each answer (compare `user_answer` against `questions.correct_answer`)
3. Update `mock_test_answers` rows with `user_answer`, `is_correct`, `time_spent_seconds`
4. Calculate `raw_score` and update the section row
5. **If this was Section 1:** Apply adaptive threshold logic:
   - Calculate percentage correct
   - If >= 60%: set Section 2 difficulty to 'hard'
   - If < 60%: set Section 2 difficulty to 'easy'
   - Query questions for Section 2 accordingly
   - Create `mock_test_answers` rows for Section 2 questions
6. Return Section 2 questions (if Section 1 was just submitted) or completion status

### 5.3 `POST /api/mock-test/{id}/complete`

Finalizes the test after all sections are submitted.

**Flow:**
1. Verify all 4 sections are completed
2. Calculate scaled scores using the formula above
3. Update `mock_tests` with all scores and `status = 'completed'`
4. Return full results

**Response shape:**
```json
{
    "mock_test_id": "uuid",
    "verbal": {
        "section_1_raw": "8/12",
        "section_2_raw": "10/15",
        "section_2_difficulty": "hard",
        "scaled_score": 162
    },
    "quant": {
        "section_1_raw": "9/12",
        "section_2_raw": "11/15",
        "section_2_difficulty": "hard",
        "scaled_score": 164
    },
    "total_score": 326,
    "completed_at": "2026-03-10T..."
}
```

### 5.4 `GET /api/mock-test/{id}/review`

Returns the full test with correct answers and explanations for review.

**Flow:**
1. Verify test status is 'completed'
2. Return all sections, questions, user answers, correct answers, and explanations
3. Include per-question breakdown: correct/incorrect, time spent
4. Include per-topic accuracy stats

---

## 6. Test Flow Sequence (Frontend Reference)

```
User clicks "Start Mock Test"
        │
        ▼
┌─────────────────────┐
│  POST /start        │ → Creates test, returns V1 + Q1 questions
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  VERBAL SECTION 1   │ 12 questions, 18 min timer
│  (standard mix)     │ User answers all questions
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  POST /submit       │ → Grades V1, determines V2 difficulty,
│  (verbal_1)         │   returns V2 questions
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  VERBAL SECTION 2   │ 15 questions, 23 min timer
│  (adaptive)         │ Easy track OR Hard track
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  POST /submit       │ → Grades V2
│  (verbal_2)         │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  QUANT SECTION 1    │ 12 questions, 21 min timer
│  (standard mix)     │
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  POST /submit       │ → Grades Q1, determines Q2 difficulty,
│  (quant_1)          │   returns Q2 questions
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  QUANT SECTION 2    │ 15 questions, 26 min timer
│  (adaptive)         │ Easy track OR Hard track
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  POST /complete     │ → Final scoring, scaled scores
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│  RESULTS SCREEN     │ Verbal: 162, Quant: 164, Total: 326
│  + Review option    │ Review each question with explanations
└─────────────────────┘
```

---

## 7. Seeding the Database

A seed script should:

1. Read `gre_question_bank.json` from this directory
2. Parse the `questions` array
3. Insert all 200 questions into the `questions` table
4. Verify counts: 100 verbal + 100 quant

```javascript
// Example seed (Node.js + Supabase client)
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function seed() {
    const data = JSON.parse(fs.readFileSync('./gre_question_bank.json', 'utf8'));
    const questions = data.questions;

    // Insert in batches of 50
    for (let i = 0; i < questions.length; i += 50) {
        const batch = questions.slice(i, i + 50);
        const { error } = await supabase.from('questions').upsert(batch);
        if (error) throw error;
    }

    // Verify
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true });
    console.log(`Seeded ${count} questions`);
}

seed();
```

---

## 8. Important Edge Cases

1. **Not enough questions for a difficulty level:** If the query returns fewer questions than needed (e.g., not enough hard questions), backfill with medium questions. Never serve a section with fewer questions than required.

2. **User abandons mid-test:** Set `status = 'abandoned'` on the mock_test. Don't score incomplete tests.

3. **Timer expiry:** If the frontend timer runs out, auto-submit whatever answers exist. Unanswered questions count as incorrect.

4. **Multi-select answers:** Some questions have multiple correct answers (e.g., `"A,C"`). When grading, the user must select ALL correct answers — partial credit is NOT given on the real GRE.

5. **Question type rendering:** The frontend must handle these types differently:
   - `quantitative_comparison`: Always show the standard 4 choices (A-D)
   - `reading_comprehension`: Show passage above the question
   - `text_completion`: May have 1-3 blanks with separate choice columns
   - `sentence_equivalence`: User must select exactly 2 answers
   - `multiple_choice_multiple`: User may select multiple answers ("select all that apply")

6. **Cross-test question tracking (optional enhancement):** To avoid showing the same questions across multiple tests for the same user, query their recent test history and exclude those question IDs.

---

## 9. File Reference

| File | Purpose |
|------|---------|
| `gre_question_bank.json` | The 200-question bank. Import directly into Supabase. |
| `CLAUDE_CODE_INSTRUCTIONS.md` | This file. Implementation blueprint. |

The JSON file structure:
```
{
    "metadata": { ... },      // Schema info, query examples, stats
    "questions": [ ... ]       // Array of 200 question objects ready for DB insert
}
```

Each question object:
```json
{
    "id": "uuid",
    "section": "verbal|quant",
    "question_type": "reading_comprehension|text_completion|sentence_equivalence|quantitative_comparison|multiple_choice_single|multiple_choice_multiple|numeric_entry",
    "difficulty": "easy|medium|hard",
    "question_text": "The actual question...",
    "passage": "Optional reading passage...",
    "choices": {"A": "...", "B": "...", "C": "...", "D": "...", "E": "..."},
    "correct_answer": "B" or "A,C" for multi-select,
    "explanation": "Why this answer is correct...",
    "topic": "Arithmetic|Algebra|Geometry|Data Analysis (quant only)",
    "source": "source_book_name",
    "created_at": "ISO timestamp"
}
```
