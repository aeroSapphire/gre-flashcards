import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateGREVerbalScore, GREScoreResult } from '@/utils/greScoring';

// Test IDs for GRE Practice Test 1 (deterministic UUIDs)
export const GRE_PRACTICE_TEST_1 = {
  SECTION_2: '11111111-1111-1111-1111-111111111112',
  SECTION_3: '11111111-1111-1111-1111-111111111113',
};

export interface GRESection {
  id: string;
  title: string;
  description: string | null;
  time_limit_minutes: number;
  question_count: number;
  sectionNumber: 2 | 3;
}

export interface GRESectionAttempt {
  id: string;
  test_id: string;
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
  answers: Record<string, number[]>;
}

export interface GRETestState {
  sections: GRESection[];
  attempts: {
    section2: GRESectionAttempt | null;
    section3: GRESectionAttempt | null;
  };
  combinedScore: {
    rawScore: number;
    totalQuestions: number;
    greScore: GREScoreResult;
  } | null;
  isComplete: boolean;
  loading: boolean;
  error: string | null;
}

export interface UseGRETestReturn extends GRETestState {
  refresh: () => Promise<void>;
  getAttemptForSection: (sectionNumber: 2 | 3) => GRESectionAttempt | null;
  getSectionById: (testId: string) => GRESection | undefined;
  previousAttempts: GRESectionAttempt[];
}

export function useGRETest(testGroupName: string = 'GRE Full Test'): UseGRETestReturn {
  const { user } = useAuth();
  const [state, setState] = useState<GRETestState>({
    sections: [],
    attempts: {
      section2: null,
      section3: null,
    },
    combinedScore: null,
    isComplete: false,
    loading: true,
    error: null,
  });
  const [previousAttempts, setPreviousAttempts] = useState<GRESectionAttempt[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch test sections by category
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .eq('category', testGroupName)
        .order('title');

      if (testsError) throw testsError;

      // Map tests to sections
      const sections: GRESection[] = (testsData || []).map(test => ({
        id: test.id,
        title: test.title,
        description: test.description,
        time_limit_minutes: test.time_limit_minutes,
        question_count: test.question_count || 0,
        sectionNumber: test.id === GRE_PRACTICE_TEST_1.SECTION_2 ? 2 : 3,
      }));

      // Fetch user's latest attempts for each section
      const testIds = sections.map(s => s.id);

      const { data: attemptsData, error: attemptsError } = await supabase
        .from('user_test_attempts')
        .select('*')
        .eq('user_id', user.id)
        .in('test_id', testIds)
        .order('completed_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      // Store all attempts for history
      setPreviousAttempts((attemptsData || []) as GRESectionAttempt[]);

      // Get the most recent attempt for each section
      const section2Attempts = (attemptsData || []).filter(
        a => a.test_id === GRE_PRACTICE_TEST_1.SECTION_2
      );
      const section3Attempts = (attemptsData || []).filter(
        a => a.test_id === GRE_PRACTICE_TEST_1.SECTION_3
      );

      const section2Attempt = section2Attempts[0] as GRESectionAttempt | undefined;
      const section3Attempt = section3Attempts[0] as GRESectionAttempt | undefined;

      // Calculate combined score if both sections are complete
      let combinedScore = null;
      const isComplete = !!section2Attempt && !!section3Attempt;

      if (isComplete) {
        const rawScore = section2Attempt!.score + section3Attempt!.score;
        const totalQuestions = section2Attempt!.total_questions + section3Attempt!.total_questions;
        const greScore = calculateGREVerbalScore(rawScore, totalQuestions);

        combinedScore = {
          rawScore,
          totalQuestions,
          greScore,
        };
      }

      setState({
        sections,
        attempts: {
          section2: section2Attempt || null,
          section3: section3Attempt || null,
        },
        combinedScore,
        isComplete,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error fetching GRE test data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load GRE test data',
      }));
    }
  }, [user, testGroupName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAttemptForSection = useCallback(
    (sectionNumber: 2 | 3): GRESectionAttempt | null => {
      return sectionNumber === 2 ? state.attempts.section2 : state.attempts.section3;
    },
    [state.attempts]
  );

  const getSectionById = useCallback(
    (testId: string): GRESection | undefined => {
      return state.sections.find(s => s.id === testId);
    },
    [state.sections]
  );

  return {
    ...state,
    refresh: fetchData,
    getAttemptForSection,
    getSectionById,
    previousAttempts,
  };
}

/**
 * Get performance breakdown by question type
 */
export function analyzePerformanceByType(
  attempts: GRESectionAttempt[],
  questions: Array<{ id: string; type: string; correct_answer: number[] }>
): Record<string, { correct: number; total: number; percentage: number }> {
  const results: Record<string, { correct: number; total: number }> = {};

  for (const attempt of attempts) {
    for (const question of questions) {
      const type = question.type;
      if (!results[type]) {
        results[type] = { correct: 0, total: 0 };
      }

      results[type].total++;

      const userAnswer = attempt.answers[question.id] || [];
      const isCorrect =
        userAnswer.length === question.correct_answer.length &&
        userAnswer.every(v => question.correct_answer.includes(v));

      if (isCorrect) {
        results[type].correct++;
      }
    }
  }

  // Calculate percentages
  const withPercentages: Record<string, { correct: number; total: number; percentage: number }> = {};
  for (const [type, { correct, total }] of Object.entries(results)) {
    withPercentages[type] = {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    };
  }

  return withPercentages;
}
