/**
 * Adaptive Mock Test Service
 *
 * Implements the full GRE adaptive test engine:
 * - Start a test (create DB rows, fetch Section 1 questions)
 * - Submit a section (grade answers, trigger adaptive logic)
 * - Complete a test (calculate scaled scores)
 * - Review a test (return all questions + explanations)
 */

import { supabase } from '@/integrations/supabase/client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Question {
    id: string;
    section: 'verbal' | 'quant';
    question_type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    question_text: string;
    passage: string | null;
    choices: Record<string, unknown>;
    correct_answer: string;
    explanation: string | null;
    topic: string | null;
    source: string | null;
}

/** Question as served to the client (NO correct_answer / explanation) */
export type ClientQuestion = Omit<Question, 'correct_answer' | 'explanation'> & {
    question_order: number;
};

export interface SectionInfo {
    section_id: string;
    time_limit_seconds: number;
    questions: ClientQuestion[];
}

export interface StartTestResponse {
    mock_test_id: string;
    sections: {
        verbal_1: SectionInfo;
        quant_1: SectionInfo;
    };
}

export interface AnswerSubmission {
    question_id: string;
    user_answer: string;
    time_spent_seconds: number;
}

export interface SubmitSectionResponse {
    raw_score: number;
    total_questions: number;
    // Present when a Section 1 was just submitted (triggers Section 2)
    next_section?: SectionInfo & {
        difficulty: 'easy' | 'hard';
    };
}

export interface TestResults {
    mock_test_id: string;
    verbal: {
        section_1_raw: string;
        section_2_raw: string;
        section_2_difficulty: 'easy' | 'hard';
        scaled_score: number;
    };
    quant: {
        section_1_raw: string;
        section_2_raw: string;
        section_2_difficulty: 'easy' | 'hard';
        scaled_score: number;
    };
    total_score: number;
    completed_at: string;
}

export interface ReviewQuestion extends Question {
    question_order: number;
    user_answer: string | null;
    is_correct: boolean | null;
    time_spent_seconds: number | null;
}

export interface ReviewSection {
    section_id: string;
    section_type: 'verbal' | 'quant';
    section_number: 1 | 2;
    difficulty_level: string;
    raw_score: number;
    total_questions: number;
    questions: ReviewQuestion[];
    topic_accuracy: Record<string, { correct: number; total: number }>;
}

export interface TestReview {
    mock_test_id: string;
    verbal_scaled_score: number;
    quant_scaled_score: number;
    total_score: number;
    sections: ReviewSection[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function calculateScaledScore(
    section1Raw: number,
    section1Total: number,
    section2Raw: number,
    section2Total: number,
    section2Difficulty: 'easy' | 'hard'
): number {
    const section1Pct = section1Raw / section1Total;
    const section2Pct = section2Raw / section2Total;
    const weightedPct = section1Pct * 0.4 + section2Pct * 0.6;

    if (section2Difficulty === 'hard') {
        return Math.round(150 + weightedPct * 20);
    } else {
        return Math.round(130 + weightedPct * 25);
    }
}

function stripSensitiveFields(q: Question, order: number): ClientQuestion {
    const { correct_answer: _c, explanation: _e, ...safe } = q;
    void _c; void _e;
    return { ...safe, question_order: order };
}

// ── Question selection helpers ─────────────────────────────────────────────────

/** Fisher-Yates shuffle (returns new array) */
function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Pick `count` items from a difficulty-sorted list, shuffling within each
 * difficulty band so every test gets a different random subset.
 */
function pickByDifficulty(questions: Question[], count: number): Question[] {
    const result: Question[] = [];
    let i = 0;
    while (i < questions.length && result.length < count) {
        const currentDiff = questions[i].difficulty;
        let j = i;
        while (j < questions.length && questions[j].difficulty === currentDiff) j++;
        const band = shuffleArray(questions.slice(i, j));
        result.push(...band.slice(0, count - result.length));
        i = j;
    }
    return result;
}

/** Sort questions so the preferred difficulty comes first. */
function sortByDiffPref(questions: Question[], mode: 'standard' | 'easy' | 'hard'): Question[] {
    const rank: Record<string, number> =
        mode === 'hard'     ? { hard: 0, medium: 1, easy: 2 }   // 70% hard, 30% medium
        : mode === 'easy'   ? { easy: 0, medium: 1, hard: 2 }   // 70% easy, 30% medium
        : /* standard */      { medium: 0, easy: 1, hard: 2 };  // 60% medium, 40% easy
    return [...questions].sort((a, b) => (rank[a.difficulty] ?? 3) - (rank[b.difficulty] ?? 3));
}

/**
 * Fetch questions for a verbal section with correct type distribution:
 *   ~50% Reading Comprehension (grouped by passage)
 *   ~30% Text Completion
 *   ~20% Sentence Equivalence
 *
 * RC questions that share a passage are kept together so they appear
 * consecutively in the section. TC/SE questions come first, RC groups last.
 */
async function fetchVerbalSectionQuestions(
    count: number,
    mode: 'standard' | 'easy' | 'hard',
    usedIds: string[]
): Promise<Question[]> {
    const difficulties = mode === 'hard' ? ['medium', 'hard'] : ['easy', 'medium'];

    let query = supabase
        .from('gre_bank_questions')
        .select('*')
        .eq('section', 'verbal')
        .in('difficulty', difficulties);
    if (usedIds.length > 0) {
        query = query.not('id', 'in', `(${usedIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch verbal questions: ${error.message}`);
    const pool = (data || []) as Question[];

    // Target counts per type
    const rcTarget = Math.round(count * 0.50);
    const tcTarget = Math.round(count * 0.30);
    const seTarget = count - rcTarget - tcTarget;

    // ── RC: select passage groups atomically ──────────────────────────────────
    const rcPool = pool.filter(q => q.question_type === 'reading_comprehension');

    // Build passage → question[] map using the full passage text as the key
    const passageMap = new Map<string, Question[]>();
    for (const q of rcPool) {
        const key = q.passage ?? q.id; // standalone RC uses its own ID as key
        if (!passageMap.has(key)) passageMap.set(key, []);
        passageMap.get(key)!.push(q);
    }

    // Shuffle the group list, then greedily pick whole groups until rcTarget is met
    const groups = shuffleArray([...passageMap.values()]);
    const selectedRC: Question[] = [];
    for (const group of groups) {
        if (selectedRC.length >= rcTarget) break;
        selectedRC.push(...group);
    }

    // ── TC: pick by difficulty preference ────────────────────────────────────
    const tcPool = sortByDiffPref(
        pool.filter(q => q.question_type === 'text_completion'),
        mode
    );
    const selectedTC = pickByDifficulty(tcPool, tcTarget);

    // ── SE: pick by difficulty preference ────────────────────────────────────
    const sePool = sortByDiffPref(
        pool.filter(q => q.question_type === 'sentence_equivalence'),
        mode
    );
    const selectedSE = pickByDifficulty(sePool, seTarget);

    // ── Backfill if any type came up short ────────────────────────────────────
    const chosen = new Set([...selectedRC, ...selectedTC, ...selectedSE].map(q => q.id));
    const remaining = pool.filter(q => !chosen.has(q.id));
    const shortfall = count - selectedRC.length - selectedTC.length - selectedSE.length;
    const backfill = shortfall > 0 ? shuffleArray(remaining).slice(0, shortfall) : [];

    // ── Final ordering: TC/SE first (standalone), then RC groups ──────────────
    // RC questions from the same passage are already consecutive because we
    // pushed whole groups; this mirrors the real GRE layout.
    return [
        ...shuffleArray([...selectedTC, ...selectedSE]),
        ...selectedRC,
        ...backfill,
    ];
}

/**
 * Fetch questions for a quant section with correct type distribution:
 *   ~35% Quantitative Comparison
 *   ~50% Multiple Choice (single + multiple)
 *   ~15% other (numeric entry, data interpretation) — backfilled from MC if absent
 */
async function fetchQuantSectionQuestions(
    count: number,
    mode: 'standard' | 'easy' | 'hard',
    usedIds: string[]
): Promise<Question[]> {
    const difficulties = mode === 'hard' ? ['medium', 'hard'] : ['easy', 'medium'];

    let query = supabase
        .from('gre_bank_questions')
        .select('*')
        .eq('section', 'quant')
        .in('difficulty', difficulties);
    if (usedIds.length > 0) {
        query = query.not('id', 'in', `(${usedIds.join(',')})`);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch quant questions: ${error.message}`);
    const pool = (data || []) as Question[];

    const qcTarget  = Math.round(count * 0.35);
    const mcTarget  = Math.round(count * 0.50);
    const restTarget = count - qcTarget - mcTarget;

    const qcPool = sortByDiffPref(
        pool.filter(q => q.question_type === 'quantitative_comparison'), mode);
    const mcPool = sortByDiffPref(
        pool.filter(q => q.question_type === 'multiple_choice_single'
                      || q.question_type === 'multiple_choice_multiple'), mode);
    const otherPool = sortByDiffPref(
        pool.filter(q => q.question_type !== 'quantitative_comparison'
                      && q.question_type !== 'multiple_choice_single'
                      && q.question_type !== 'multiple_choice_multiple'), mode);

    const selectedQC   = pickByDifficulty(qcPool, qcTarget);
    const selectedMC   = pickByDifficulty(mcPool, mcTarget);
    const selectedOther = restTarget > 0
        ? pickByDifficulty(otherPool.length >= restTarget ? otherPool : mcPool.filter(
              q => !selectedMC.find(s => s.id === q.id)), restTarget)
        : [];

    // Backfill
    const chosen = new Set([...selectedQC, ...selectedMC, ...selectedOther].map(q => q.id));
    const remaining = pool.filter(q => !chosen.has(q.id));
    const shortfall = count - selectedQC.length - selectedMC.length - selectedOther.length;
    const backfill = shortfall > 0 ? shuffleArray(remaining).slice(0, shortfall) : [];

    return shuffleArray([...selectedQC, ...selectedMC, ...selectedOther, ...backfill]);
}

/**
 * Dispatch to the section-specific fetcher based on section type.
 */
async function fetchSectionQuestions(
    section: 'verbal' | 'quant',
    count: number,
    mode: 'standard' | 'easy' | 'hard',
    usedIds: string[]
): Promise<Question[]> {
    if (section === 'verbal') {
        return fetchVerbalSectionQuestions(count, mode, usedIds);
    }
    return fetchQuantSectionQuestions(count, mode, usedIds);
}

async function getUsedQuestionIds(mockTestId: string): Promise<string[]> {
    const { data } = await supabase
        .from('mock_test_answers')
        .select('question_id, mock_test_sections!inner(mock_test_id)')
        .eq('mock_test_sections.mock_test_id', mockTestId);

    return (data || []).map(row => row.question_id);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * 5.1 Start a new mock test.
 * Creates the mock_tests row, 4 section rows, fetches Section 1 questions.
 */
export async function startMockTest(userId: string): Promise<StartTestResponse> {
    // Create the test
    const { data: testRow, error: testError } = await supabase
        .from('mock_tests')
        .insert({ user_id: userId, status: 'in_progress' })
        .select()
        .single();

    if (testError || !testRow) {
        throw new Error(`Failed to create mock test: ${testError?.message}`);
    }

    const mockTestId = testRow.id;

    // Create 4 sections
    const sectionsToInsert = [
        { mock_test_id: mockTestId, section_type: 'verbal', section_number: 1, difficulty_level: 'standard', time_limit_seconds: 1080, total_questions: 12 },
        { mock_test_id: mockTestId, section_type: 'verbal', section_number: 2, difficulty_level: 'standard', time_limit_seconds: 1380, total_questions: 15 },
        { mock_test_id: mockTestId, section_type: 'quant',  section_number: 1, difficulty_level: 'standard', time_limit_seconds: 1260, total_questions: 12 },
        { mock_test_id: mockTestId, section_type: 'quant',  section_number: 2, difficulty_level: 'standard', time_limit_seconds: 1560, total_questions: 15 },
    ];

    const { data: sections, error: sectionsError } = await supabase
        .from('mock_test_sections')
        .insert(sectionsToInsert)
        .select();

    if (sectionsError || !sections) {
        throw new Error(`Failed to create sections: ${sectionsError?.message}`);
    }

    const verbalSection1 = sections.find(s => s.section_type === 'verbal' && s.section_number === 1)!;
    const quantSection1  = sections.find(s => s.section_type === 'quant'  && s.section_number === 1)!;

    // Fetch Section 1 questions for both subjects
    const [verbalQs, quantQs] = await Promise.all([
        fetchSectionQuestions('verbal', 12, 'standard', []),
        fetchSectionQuestions('quant',  12, 'standard', []),
    ]);

    // Insert placeholder answer rows for Section 1
    const verbalAnswerRows = verbalQs.map((q, i) => ({
        section_id: verbalSection1.id,
        question_id: q.id,
        question_order: i + 1,
    }));
    const quantAnswerRows = quantQs.map((q, i) => ({
        section_id: quantSection1.id,
        question_id: q.id,
        question_order: i + 1,
    }));

    const { error: answerError } = await supabase
        .from('mock_test_answers')
        .insert([...verbalAnswerRows, ...quantAnswerRows]);

    if (answerError) {
        throw new Error(`Failed to create answer rows: ${answerError.message}`);
    }

    // Mark sections as started
    await supabase
        .from('mock_test_sections')
        .update({ started_at: new Date().toISOString() })
        .in('id', [verbalSection1.id, quantSection1.id]);

    return {
        mock_test_id: mockTestId,
        sections: {
            verbal_1: {
                section_id: verbalSection1.id,
                time_limit_seconds: verbalSection1.time_limit_seconds,
                questions: verbalQs.map((q, i) => stripSensitiveFields(q, i + 1)),
            },
            quant_1: {
                section_id: quantSection1.id,
                time_limit_seconds: quantSection1.time_limit_seconds,
                questions: quantQs.map((q, i) => stripSensitiveFields(q, i + 1)),
            },
        },
    };
}

/**
 * 5.2 Submit answers for a completed section.
 * Grades answers, applies adaptive logic if Section 1.
 */
export async function submitSection(
    mockTestId: string,
    sectionId: string,
    answers: AnswerSubmission[]
): Promise<SubmitSectionResponse> {
    // Get section info
    const { data: section, error: sectionError } = await supabase
        .from('mock_test_sections')
        .select('*')
        .eq('id', sectionId)
        .eq('mock_test_id', mockTestId)
        .single();

    if (sectionError || !section) {
        throw new Error(`Section not found: ${sectionError?.message}`);
    }

    // Get existing answer rows to find correct answers
    const { data: answerRows, error: answerFetchError } = await supabase
        .from('mock_test_answers')
        .select('id, question_id, question_order')
        .eq('section_id', sectionId);

    if (answerFetchError || !answerRows) {
        throw new Error(`Failed to fetch answer rows: ${answerFetchError?.message}`);
    }

    // Fetch correct answers from gre_bank_questions table
    const questionIds = answerRows.map(r => r.question_id);
    const { data: questions, error: questionsError } = await supabase
        .from('gre_bank_questions')
        .select('id, correct_answer')
        .in('id', questionIds);

    if (questionsError || !questions) {
        throw new Error(`Failed to fetch questions: ${questionsError?.message}`);
    }

    const correctAnswerMap = new Map(questions.map(q => [q.id, q.correct_answer]));

    // Grade each answer and build updates
    let rawScore = 0;
    const updates = answerRows.map(row => {
        const submission = answers.find(a => a.question_id === row.question_id);
        const correctAnswer = correctAnswerMap.get(row.question_id) || '';
        const userAnswer = submission?.user_answer ?? null;

        // Grade: must match exactly (handles multi-select "A,C" format)
        const isCorrect = userAnswer !== null
            ? normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer)
            : false;

        if (isCorrect) rawScore++;

        return {
            id: row.id,
            user_answer: userAnswer,
            is_correct: isCorrect,
            time_spent_seconds: submission?.time_spent_seconds ?? null,
        };
    });

    // Upsert answer updates
    for (const update of updates) {
        await supabase
            .from('mock_test_answers')
            .update({
                user_answer: update.user_answer,
                is_correct: update.is_correct,
                time_spent_seconds: update.time_spent_seconds,
            })
            .eq('id', update.id);
    }

    const totalQuestions = section.total_questions;

    // Update section with raw_score and completed_at
    await supabase
        .from('mock_test_sections')
        .update({
            raw_score: rawScore,
            completed_at: new Date().toISOString(),
        })
        .eq('id', sectionId);

    // If this is Section 1, apply adaptive logic and build Section 2
    if (section.section_number === 1) {
        const percentage = rawScore / totalQuestions;
        const section2Difficulty: 'easy' | 'hard' = percentage >= 0.60 ? 'hard' : 'easy';

        // Find Section 2 for this subject
        const { data: section2, error: section2Error } = await supabase
            .from('mock_test_sections')
            .select('*')
            .eq('mock_test_id', mockTestId)
            .eq('section_type', section.section_type)
            .eq('section_number', 2)
            .single();

        if (section2Error || !section2) {
            throw new Error(`Section 2 not found: ${section2Error?.message}`);
        }

        // Update Section 2 difficulty
        await supabase
            .from('mock_test_sections')
            .update({
                difficulty_level: section2Difficulty,
                started_at: new Date().toISOString(),
            })
            .eq('id', section2.id);

        // Update mock_tests with section 1 score + section 2 difficulty
        const scoreField = section.section_type === 'verbal' ? 'verbal_1_score' : 'quant_1_score';
        const diffField  = section.section_type === 'verbal' ? 'verbal_2_difficulty' : 'quant_2_difficulty';
        await supabase
            .from('mock_tests')
            .update({ [scoreField]: rawScore, [diffField]: section2Difficulty })
            .eq('id', mockTestId);

        // Get already-used question IDs for this test
        const usedIds = await getUsedQuestionIds(mockTestId);

        // Fetch Section 2 questions
        const section2Qs = await fetchSectionQuestions(
            section.section_type as 'verbal' | 'quant',
            15,
            section2Difficulty,
            usedIds
        );

        // Create answer placeholder rows for Section 2
        const section2AnswerRows = section2Qs.map((q, i) => ({
            section_id: section2.id,
            question_id: q.id,
            question_order: i + 1,
        }));

        await supabase
            .from('mock_test_answers')
            .insert(section2AnswerRows);

        return {
            raw_score: rawScore,
            total_questions: totalQuestions,
            next_section: {
                section_id: section2.id,
                time_limit_seconds: section2.time_limit_seconds,
                difficulty: section2Difficulty,
                questions: section2Qs.map((q, i) => stripSensitiveFields(q, i + 1)),
            },
        };
    }

    // Section 2: just record the score
    const scoreField = section.section_type === 'verbal' ? 'verbal_2_score' : 'quant_2_score';
    await supabase
        .from('mock_tests')
        .update({ [scoreField]: rawScore })
        .eq('id', mockTestId);

    return { raw_score: rawScore, total_questions: totalQuestions };
}

/**
 * 5.3 Finalize the test after all 4 sections are submitted.
 */
export async function completeMockTest(mockTestId: string): Promise<TestResults> {
    const { data: test, error: testError } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', mockTestId)
        .single();

    if (testError || !test) {
        throw new Error(`Test not found: ${testError?.message}`);
    }

    const { data: sections } = await supabase
        .from('mock_test_sections')
        .select('*')
        .eq('mock_test_id', mockTestId);

    if (!sections || sections.length < 4) {
        throw new Error('Not all sections are completed yet.');
    }

    const v1 = sections.find(s => s.section_type === 'verbal' && s.section_number === 1)!;
    const v2 = sections.find(s => s.section_type === 'verbal' && s.section_number === 2)!;
    const q1 = sections.find(s => s.section_type === 'quant'  && s.section_number === 1)!;
    const q2 = sections.find(s => s.section_type === 'quant'  && s.section_number === 2)!;

    const verbalDiff = (test.verbal_2_difficulty || 'easy') as 'easy' | 'hard';
    const quantDiff  = (test.quant_2_difficulty  || 'easy') as 'easy' | 'hard';

    const verbalScaled = calculateScaledScore(
        v1.raw_score ?? 0, v1.total_questions,
        v2.raw_score ?? 0, v2.total_questions,
        verbalDiff
    );
    const quantScaled = calculateScaledScore(
        q1.raw_score ?? 0, q1.total_questions,
        q2.raw_score ?? 0, q2.total_questions,
        quantDiff
    );
    const totalScore = verbalScaled + quantScaled;
    const completedAt = new Date().toISOString();

    await supabase
        .from('mock_tests')
        .update({
            status: 'completed',
            completed_at: completedAt,
            verbal_scaled_score: verbalScaled,
            quant_scaled_score: quantScaled,
            total_score: totalScore,
        })
        .eq('id', mockTestId);

    return {
        mock_test_id: mockTestId,
        verbal: {
            section_1_raw: `${v1.raw_score ?? 0}/${v1.total_questions}`,
            section_2_raw: `${v2.raw_score ?? 0}/${v2.total_questions}`,
            section_2_difficulty: verbalDiff,
            scaled_score: verbalScaled,
        },
        quant: {
            section_1_raw: `${q1.raw_score ?? 0}/${q1.total_questions}`,
            section_2_raw: `${q2.raw_score ?? 0}/${q2.total_questions}`,
            section_2_difficulty: quantDiff,
            scaled_score: quantScaled,
        },
        total_score: totalScore,
        completed_at: completedAt,
    };
}

/**
 * 5.4 Get full test review with correct answers and explanations.
 */
export async function getMockTestReview(mockTestId: string): Promise<TestReview> {
    const { data: test, error: testError } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('id', mockTestId)
        .single();

    if (testError || !test) throw new Error(`Test not found: ${testError?.message}`);

    const { data: sections } = await supabase
        .from('mock_test_sections')
        .select('*')
        .eq('mock_test_id', mockTestId)
        .order('section_type')
        .order('section_number');

    if (!sections) throw new Error('No sections found.');

    const reviewSections: ReviewSection[] = [];

    for (const section of sections) {
        const { data: answerRows } = await supabase
            .from('mock_test_answers')
            .select('*')
            .eq('section_id', section.id)
            .order('question_order');

        if (!answerRows || answerRows.length === 0) continue;

        const questionIds = answerRows.map(r => r.question_id);
        const { data: questions } = await supabase
            .from('gre_bank_questions')
            .select('*')
            .in('id', questionIds);

        if (!questions) continue;

        const questionMap = new Map(questions.map(q => [q.id, q]));

        const reviewQuestions: ReviewQuestion[] = answerRows.map(row => {
            const q = questionMap.get(row.question_id)!;
            return {
                ...(q as Question),
                choices: q.choices as Record<string, unknown>,
                question_order: row.question_order,
                user_answer: row.user_answer,
                is_correct: row.is_correct,
                time_spent_seconds: row.time_spent_seconds,
            };
        });

        // Per-topic accuracy
        const topicAccuracy: Record<string, { correct: number; total: number }> = {};
        for (const rq of reviewQuestions) {
            const topic = rq.topic || 'General';
            if (!topicAccuracy[topic]) topicAccuracy[topic] = { correct: 0, total: 0 };
            topicAccuracy[topic].total++;
            if (rq.is_correct) topicAccuracy[topic].correct++;
        }

        reviewSections.push({
            section_id: section.id,
            section_type: section.section_type as 'verbal' | 'quant',
            section_number: section.section_number as 1 | 2,
            difficulty_level: section.difficulty_level,
            raw_score: section.raw_score ?? 0,
            total_questions: section.total_questions,
            questions: reviewQuestions,
            topic_accuracy: topicAccuracy,
        });
    }

    return {
        mock_test_id: mockTestId,
        verbal_scaled_score: test.verbal_scaled_score ?? 0,
        quant_scaled_score:  test.quant_scaled_score  ?? 0,
        total_score: test.total_score ?? 0,
        sections: reviewSections,
    };
}

/**
 * Abandon a test (e.g. user navigates away).
 */
export async function abandonMockTest(mockTestId: string): Promise<void> {
    await supabase
        .from('mock_tests')
        .update({ status: 'abandoned' })
        .eq('id', mockTestId);
}

/**
 * Get list of past mock tests for a user.
 */
export async function getUserMockTests(userId: string) {
    const { data, error } = await supabase
        .from('mock_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

// ── Internal ──────────────────────────────────────────────────────────────────

/** Normalize answer string for comparison: sort multi-select values */
function normalizeAnswer(answer: string): string {
    return answer
        .split(',')
        .map(s => s.trim().toUpperCase())
        .sort()
        .join(',');
}
