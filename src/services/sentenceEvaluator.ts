// Sentence Evaluation Service using Supabase Edge Function
import { supabase } from '@/integrations/supabase/client';

const PRACTICE_ENABLED_KEY = 'gre-vocab-sentence-practice-enabled';

import { SRSRating } from '@/utils/srs';

export interface EvaluationResult {
  rating: SRSRating;
  feedback: string;
  suggestion?: string;
  examples?: string[];
}

export function isSentencePracticeEnabled(): boolean {
  return localStorage.getItem(PRACTICE_ENABLED_KEY) === 'true';
}

export function setSentencePracticeEnabled(enabled: boolean): void {
  localStorage.setItem(PRACTICE_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function evaluateSentence(
  word: string,
  definition: string,
  userSentence: string,
  part_of_speech?: string
): Promise<EvaluationResult> {
  try {
    // Check for cached examples
    const { data: flashcard } = await supabase
      .from('flashcards')
      .select('id, example_sentences')
      .eq('word', word)
      .maybeSingle();

    // @ts-ignore - example_sentences is a new column
    const cachedExamples = flashcard?.example_sentences as string[] | undefined;
    const hasCachedExamples = Array.isArray(cachedExamples) && cachedExamples.length > 0;

    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        word,
        definition,
        part_of_speech,
        sentence: userSentence,
        include_examples: !hasCachedExamples
      },
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Invoke Error Details:', error);
      throw new Error(error.message || 'Failed to evaluate sentence');
    }

    if (!data) {
      throw new Error('No evaluation data received');
    }

    // Handle cases where data might be returned as a string rather than an object
    let finalData = data;
    if (typeof data === 'string') {
      try {
        finalData = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse data string:', data);
        throw new Error('Invalid data format received from evaluation service');
      }
    }

    // Check if the AI or function returned an inner error
    if (finalData.error) {
      throw new Error(finalData.error);
    }

    // Map edge function's 4-grade output to 3-grade system
    const ratingMap: Record<string, SRSRating> = {
      'again': 'fail',
      'hard': 'hard',
      'good': 'easy',
      'easy': 'easy',
      // Also accept new ratings directly
      'fail': 'fail',
    };
    const rating: SRSRating = ratingMap[finalData.rating] || 'hard';

    // Cache examples if we got new ones
    if (!hasCachedExamples && finalData.examples && Array.isArray(finalData.examples) && finalData.examples.length > 0 && flashcard?.id) {
      // Fire and forget update
      supabase
        .from('flashcards')
        .update({ example_sentences: finalData.examples } as any)
        .eq('id', flashcard.id)
        .then(({ error }) => {
          if (error) console.error('Failed to cache examples:', error);
        });
    }

    return {
      rating,
      feedback: finalData.feedback || 'No feedback provided',
      suggestion: finalData.suggestion,
      examples: hasCachedExamples ? cachedExamples : (finalData.examples || []),
    };
  } catch (error: any) {
    console.error('Evaluation error:', error);
    throw new Error(error.message || 'Evaluation failed');
  }
}

export async function generateExamples(
  word: string,
  definition: string,
  part_of_speech?: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        word,
        definition,
        part_of_speech,
        mode: 'generate'
      },
    });

    if (error) throw error;

    let finalData = data;
    if (typeof data === 'string') {
      finalData = JSON.parse(data);
    }

    return finalData.examples || [];
  } catch (error) {
    console.error('Failed to generate examples:', error);
    return [];
  }
}

export interface SavedEvaluation {
  id: string;
  user_id: string;
  flashcard_id: string;
  sentence: string;
  rating: SRSRating;
  feedback: string | null;
  created_at: string;
  profile?: {
    display_name: string;
  };
}

export async function saveEvaluation(
  flashcardId: string,
  sentence: string,
  rating: SRSRating,
  feedback: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await (supabase.from('sentence_evaluations') as any)
    .insert({
      user_id: user.id,
      flashcard_id: flashcardId,
      sentence,
      rating,
      feedback,
    });

  if (error) {
    console.error('Failed to save evaluation:', error);
  }
}

export async function getEvaluationsForCard(flashcardId: string): Promise<SavedEvaluation[]> {
  try {
    // First fetch evaluations
    const { data: evaluations, error } = await (supabase
      .from('sentence_evaluations') as any)
      .select('*')
      .eq('flashcard_id', flashcardId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !evaluations) {
      console.error('Failed to fetch evaluations:', error);
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set((evaluations as any[]).map(e => e.user_id))];

    // Fetch profiles for these users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);

    // Map profiles to evaluations
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    return (evaluations as any[]).map(e => ({
      ...e,
      profile: profileMap.get(e.user_id) || null
    }));
  } catch (e) {
    console.error('Error fetching evaluations:', e);
    return [];
  }
}
export interface QuizQuestion {
  content: string;
  type: 'single_choice';
  options: string[];
  correct_answer: number[];
  explanation: string;
}

export async function generateQuiz(
  words: { word: string; definition: string }[]
): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        words,
        mode: 'quiz'
      },
    });

    if (error) throw error;

    let finalData = data;
    if (typeof data === 'string') {
      finalData = JSON.parse(data);
    }

    return finalData.questions || [];
  } catch (error) {
    console.error('Failed to generate quiz:', error);
    return [];
  }
}

export interface EtymologyChallenge {
  word: string;
  options: string[];
  correct_index: number;
  breakdown: string;
}

export async function generateEtymologyChallenge(
  root: string,
  rootMeaning: string,
  existingWords: string[]
): Promise<EtymologyChallenge | null> {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        root: root,
        root_meaning: rootMeaning,
        existing_words: existingWords,
        mode: 'etymology-challenge'
      },
    });

    if (error) throw error;

    let finalData = data;
    if (typeof data === 'string') {
      finalData = JSON.parse(data);
    }

    return finalData || null;
  } catch (error) {
    console.error('Failed to generate etymology challenge:', error);
    return null;
  }
}
