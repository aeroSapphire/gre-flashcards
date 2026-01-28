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

    return {
      isCorrect: !!finalData.isCorrect,
      feedback: finalData.feedback || 'No feedback provided',
      suggestion: finalData.suggestion,
    };
  } catch (error: any) {
    console.error('Evaluation error:', error);
    throw new Error(error.message || 'Evaluation failed');
  }
}
