// Sentence Evaluation Service using Supabase Edge Function
import { supabase } from '@/integrations/supabase/client';

const PRACTICE_ENABLED_KEY = 'gre-vocab-sentence-practice-enabled';

export interface EvaluationResult {
  isCorrect: boolean;
  feedback: string;
  suggestion?: string;
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
  userSentence: string
): Promise<EvaluationResult> {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        word,
        definition,
        sentence: userSentence,
      },
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      // Try to get more details from the error
      const errorMessage = error.message || 'Failed to evaluate sentence';
      const errorContext = error.context ? JSON.stringify(error.context) : '';
      throw new Error(`${errorMessage}${errorContext ? ` - ${errorContext}` : ''}`);
    }

    if (!data) {
      throw new Error('No response from server');
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      isCorrect: data.isCorrect,
      feedback: data.feedback,
      suggestion: data.suggestion,
    };
  } catch (error: any) {
    console.error('Evaluation error:', error);
    throw new Error(error.message || 'Evaluation failed');
  }
}
