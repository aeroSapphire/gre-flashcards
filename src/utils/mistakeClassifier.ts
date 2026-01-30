import { supabase } from '@/integrations/supabase/client';

export type QuestionType = 'TC' | 'SE' | 'RC';

export interface MistakeClassifierInput {
  questionType: QuestionType;
  questionText: string;
  options: string[];
  correctAnswer: string | string[];
  userAnswer: string | string[];
}

export const MISTAKE_LABELS = [
  'POLARITY_ERROR',
  'INTENSITY_MISMATCH',
  'SCOPE_ERROR',
  'LOGICAL_CONTRADICTION',
  'TONE_REGISTER_MISMATCH',
  'TEMPORAL_ERROR',
  'PARTIAL_SYNONYM_TRAP',
  'DOUBLE_NEGATIVE_CONFUSION',
  'CONTEXT_MISREAD',
  'ELIMINATION_FAILURE',
  'NONE'
] as const;

export type MistakeLabel = typeof MISTAKE_LABELS[number];

export interface MistakeClassifierResult {
  label: MistakeLabel;
  explanation: string;
}

const VALID_LABELS = new Set<string>(MISTAKE_LABELS);

// In-memory cache
// Key: Deterministic string hash of input
// Value: MistakeClassifierResult
const cache = new Map<string, MistakeClassifierResult>();

/**
 * Generates a deterministic string hash for the input.
 */
function generateHash(input: MistakeClassifierInput): string {
  const parts = [
    input.questionType,
    input.questionText.trim(),
    input.options.map(o => o.trim()).sort().join('|'),
    Array.isArray(input.correctAnswer) 
      ? input.correctAnswer.slice().sort().join('|') 
      : input.correctAnswer,
    Array.isArray(input.userAnswer) 
      ? input.userAnswer.slice().sort().join('|') 
      : input.userAnswer
  ];
  return parts.join('||');
}

/**
 * Classifies the user's mistake using the Grok API (via Supabase Edge Function).
 * Caches results to avoid redundant API calls.
 */
export async function classifyMistake(input: MistakeClassifierInput): Promise<MistakeClassifierResult> {
  const hash = generateHash(input);

  if (cache.has(hash)) {
    return cache.get(hash)!;
  }

  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        mode: 'classify-mistake',
        ...input
      }
    });

    if (error) {
        // Fallback for network/function errors
        console.error('Mistake Classifier API Error:', error);
        return {
            label: 'ELIMINATION_FAILURE',
            explanation: 'Unable to reliably classify the mistake.'
        };
    }

    let result: any = data;
    if (typeof data === 'string') {
      try {
        result = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse API response:', data);
        return {
            label: 'ELIMINATION_FAILURE',
            explanation: 'Unable to reliably classify the mistake.'
        };
      }
    }

    // Validation
    if (!result || typeof result.label !== 'string' || !VALID_LABELS.has(result.label)) {
      // Per requirements: If Grok response is invalid JSON or label not in allowed list
      return {
        label: 'ELIMINATION_FAILURE',
        explanation: 'Unable to reliably classify the mistake.'
      };
    }

    const classification: MistakeClassifierResult = {
      label: result.label as MistakeLabel,
      explanation: result.explanation || 'No explanation provided.'
    };

    cache.set(hash, classification);
    return classification;

  } catch (err) {
    console.error('Mistake classification unexpected error:', err);
    return {
      label: 'ELIMINATION_FAILURE',
      explanation: 'Unable to reliably classify the mistake.'
    };
  }
}

// Example Call
/*
classifyMistake({
    questionType: 'TC',
    questionText: 'Although the politician was known for his ______, his latest speech was surprisingly candid.',
    options: ['probity', 'mendacity', 'veracity', 'prevarication'],
    correctAnswer: 'prevarication',
    userAnswer: 'probity'
}).then(console.log);
*/
