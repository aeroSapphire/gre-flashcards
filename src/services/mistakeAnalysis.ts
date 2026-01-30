
import { MistakeLabel } from '@/utils/mistakeClassifier';
import { MistakeEvent } from './mistakeService';

interface MistakeScore {
  count: number;
  weightedScore: number;
}

export const NUDGE_MESSAGES: Record<MistakeLabel, string> = {
  POLARITY_ERROR: "You often miss meaning reversals created by contrast words.",
  INTENSITY_MISMATCH: "Your choices match the direction but miss the required strength.",
  SCOPE_ERROR: "You tend to overgeneralize or narrow the sentence's intent too much.",
  LOGICAL_CONTRADICTION: "Your answer creates a direct logical conflict with the premise.",
  TONE_REGISTER_MISMATCH: "You're choosing words with the wrong formality or connotation.",
  TEMPORAL_ERROR: "You're missing time-based cues that shift the sentence's meaning.",
  PARTIAL_SYNONYM_TRAP: "Be careful: that word is similar, but doesn't fit this specific context.",
  DOUBLE_NEGATIVE_CONFUSION: "Watch out for double negatives—they reverse the meaning back to positive.",
  CONTEXT_MISREAD: "You're missing the overall clue provided by the sentence structure.",
  ELIMINATION_FAILURE: "Try to eliminate obviously wrong answers before guessing.",
  NONE: ""
};

/**
 * Analyzes mistake history to find a dominant mistake pattern.
 */
export function analyzeMistakes(history: MistakeEvent[]): MistakeLabel | null {
  if (history.length === 0) return null;

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  const scores = new Map<MistakeLabel, MistakeScore>();
  let totalWeightedScore = 0;

  // Calculate Weighted Scores
  history.forEach(event => {
    const age = now - event.timestamp;
    let weight = 0.3; // Older than 72h

    if (age < ONE_DAY) {
      weight = 1.0;
    } else if (age < 3 * ONE_DAY) {
      weight = 0.6;
    }

    const current = scores.get(event.label) || { count: 0, weightedScore: 0 };
    scores.set(event.label, {
      count: current.count + 1,
      weightedScore: current.weightedScore + weight
    });

    totalWeightedScore += weight;
  });

  // Find Dominant Mistake
  let dominantLabel: MistakeLabel | null = null;
  let maxScore = 0;

  scores.forEach((score, label) => {
    // Criteria: Min count >= 5 AND Min share >= 25%
    const share = score.weightedScore / totalWeightedScore;
    
    if (score.count >= 5 && share >= 0.25) {
      if (score.weightedScore > maxScore) {
        maxScore = score.weightedScore;
        dominantLabel = label;
      }
    }
  });

  return dominantLabel;
}

/**
 * Generates a tutor nudge based on the user's mistake history.
 * Should be called once per day.
 */
export function generateDailyNudge(history: MistakeEvent[]): string | null {
  const dominantMistake = analyzeMistakes(history);
  
  if (dominantMistake && NUDGE_MESSAGES[dominantMistake]) {
    return NUDGE_MESSAGES[dominantMistake];
  }
  
  return null;
}
