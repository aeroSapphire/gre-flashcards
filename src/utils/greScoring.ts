/**
 * GRE Verbal Scoring Utility
 *
 * Converts raw scores (number correct out of 35) to scaled GRE scores (130-170)
 * Based on ETS concordance data and typical score distributions.
 */

export interface GREScoreResult {
  scaled: number;      // 130-170 GRE scale
  percentile: number;  // 1-99 percentile rank
  band: 'low' | 'below-average' | 'average' | 'above-average' | 'high';
  bandLabel: string;   // Human-readable band label
}

// Score conversion table based on ETS concordance data
// Format: [minRaw, maxRaw, scaledScore, percentile]
const SCORE_TABLE: [number, number, number, number][] = [
  [35, 35, 170, 99],
  [34, 34, 169, 99],
  [33, 33, 167, 98],
  [32, 32, 166, 97],
  [31, 31, 165, 96],
  [30, 30, 164, 94],
  [29, 29, 162, 91],
  [28, 28, 161, 88],
  [27, 27, 160, 85],
  [26, 26, 158, 80],
  [25, 25, 156, 73],
  [24, 24, 155, 68],
  [23, 23, 154, 65],
  [22, 22, 152, 55],
  [21, 21, 150, 48],
  [20, 20, 148, 38],
  [19, 19, 147, 33],
  [18, 18, 146, 30],
  [17, 17, 144, 23],
  [16, 16, 142, 17],
  [15, 15, 140, 11],
  [14, 14, 139, 9],
  [13, 13, 138, 7],
  [12, 12, 136, 5],
  [11, 11, 135, 4],
  [10, 10, 134, 3],
  [9, 9, 133, 2],
  [8, 8, 132, 2],
  [7, 7, 131, 1],
  [0, 6, 130, 1],
];

/**
 * Calculate GRE Verbal scaled score from raw score
 * @param rawScore Number of questions answered correctly
 * @param totalQuestions Total number of questions (default 35)
 * @returns GRE score result with scaled score, percentile, and band
 */
export function calculateGREVerbalScore(
  rawScore: number,
  totalQuestions: number = 35
): GREScoreResult {
  // Normalize raw score to 35-question scale if different
  const normalizedRaw = totalQuestions !== 35
    ? Math.round((rawScore / totalQuestions) * 35)
    : rawScore;

  // Clamp to valid range
  const clampedRaw = Math.max(0, Math.min(35, normalizedRaw));

  // Find matching score in table
  let scaled = 130;
  let percentile = 1;

  for (const [minRaw, maxRaw, score, pct] of SCORE_TABLE) {
    if (clampedRaw >= minRaw && clampedRaw <= maxRaw) {
      scaled = score;
      percentile = pct;
      break;
    }
  }

  // Determine band
  let band: GREScoreResult['band'];
  let bandLabel: string;

  if (scaled >= 165) {
    band = 'high';
    bandLabel = 'Excellent (Top 5%)';
  } else if (scaled >= 156) {
    band = 'above-average';
    bandLabel = 'Above Average';
  } else if (scaled >= 148) {
    band = 'average';
    bandLabel = 'Average';
  } else if (scaled >= 140) {
    band = 'below-average';
    bandLabel = 'Below Average';
  } else {
    band = 'low';
    bandLabel = 'Needs Improvement';
  }

  return {
    scaled,
    percentile,
    band,
    bandLabel,
  };
}

/**
 * Get color class based on score band
 */
export function getScoreBandColor(band: GREScoreResult['band']): {
  bg: string;
  text: string;
  border: string;
  gradient: string;
} {
  switch (band) {
    case 'high':
      return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-600',
        border: 'border-emerald-500',
        gradient: 'from-emerald-500 to-green-600',
      };
    case 'above-average':
      return {
        bg: 'bg-blue-500',
        text: 'text-blue-600',
        border: 'border-blue-500',
        gradient: 'from-blue-500 to-indigo-600',
      };
    case 'average':
      return {
        bg: 'bg-amber-500',
        text: 'text-amber-600',
        border: 'border-amber-500',
        gradient: 'from-amber-500 to-orange-600',
      };
    case 'below-average':
      return {
        bg: 'bg-orange-500',
        text: 'text-orange-600',
        border: 'border-orange-500',
        gradient: 'from-orange-500 to-red-500',
      };
    case 'low':
      return {
        bg: 'bg-red-500',
        text: 'text-red-600',
        border: 'border-red-500',
        gradient: 'from-red-500 to-rose-600',
      };
  }
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
