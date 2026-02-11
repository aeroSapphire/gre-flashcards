import { BrainMap } from '@/data/brainMapSchema';
import { DIFFICULTY_LEVELS } from '@/data/skillTaxonomy';

export interface ScoreEstimate {
  score: number;
  confidenceInterval: number;
  band: string;
  percentile: number;
}

// GRE score band mapping
const SCORE_BANDS: { min: number; max: number; label: string; percentile: number }[] = [
  { min: 165, max: 170, label: "High", percentile: 96 },
  { min: 156, max: 164, label: "Above Average", percentile: 80 },
  { min: 148, max: 155, label: "Average", percentile: 55 },
  { min: 140, max: 147, label: "Below Average", percentile: 30 },
  { min: 130, max: 139, label: "Low", percentile: 10 },
];

export function getScoreBand(score: number): { label: string; percentile: number } {
  for (const band of SCORE_BANDS) {
    if (score >= band.min && score <= band.max) {
      return { label: band.label, percentile: band.percentile };
    }
  }
  return { label: "Low", percentile: 5 };
}

// Mock test scoring: 2 sections of 20 questions
export interface MockTestScoreInput {
  section1Correct: number;
  section1Total: number;
  section2Correct: number;
  section2Total: number;
  section2Tier: "standard" | "hard" | "easy";
}

// Scoring lookup table (approximation of GRE scoring)
const SCORE_TABLE: Record<number, number> = {
  40: 170, 39: 169, 38: 167, 37: 166, 36: 165,
  35: 164, 34: 163, 33: 161, 32: 160, 31: 158,
  30: 157, 29: 156, 28: 155, 27: 154, 26: 152,
  25: 151, 24: 150, 23: 148, 22: 147, 21: 145,
  20: 144, 19: 143, 18: 141, 17: 140, 16: 138,
  15: 137, 14: 136, 13: 135, 12: 134, 11: 132,
  10: 131, 9: 131, 8: 130, 7: 130, 6: 130,
  5: 130, 4: 130, 3: 130, 2: 130, 1: 130, 0: 130,
};

export function calculateMockTestScore(input: MockTestScoreInput): ScoreEstimate {
  const rawScore = input.section1Correct + input.section2Correct;
  let scaledScore = SCORE_TABLE[rawScore] || 130;

  // Adjust for section 2 difficulty tier
  if (input.section2Tier === "hard") {
    scaledScore = Math.min(170, scaledScore + 2);
  } else if (input.section2Tier === "easy") {
    scaledScore = Math.max(130, scaledScore - 2);
  }

  const band = getScoreBand(scaledScore);
  const totalTests = 1; // For mock test, CI is based on single test
  const ci = Math.max(2, Math.min(6, Math.round(3 / Math.sqrt(totalTests / 2))));

  return {
    score: scaledScore,
    confidenceInterval: ci,
    band: band.label,
    percentile: band.percentile
  };
}

// Determine section 2 tier based on section 1 performance
export function getSection2Tier(section1Correct: number, section1Total: number): "standard" | "hard" | "easy" {
  const ratio = section1Correct / section1Total;
  if (ratio >= 0.7) return "hard";    // ≥14/20
  if (ratio >= 0.4) return "standard"; // 8-13/20
  return "easy";                        // ≤7/20
}

// Calculate overall estimated score from brain map
export function estimateScoreFromBrainMap(brainMap: BrainMap): ScoreEstimate {
  const testCount = brainMap.testHistory.length;

  if (testCount === 0) {
    return {
      score: brainMap.estimatedScore.overall,
      confidenceInterval: 6,
      band: getScoreBand(brainMap.estimatedScore.overall).label,
      percentile: getScoreBand(brainMap.estimatedScore.overall).percentile
    };
  }

  // Weighted average of recent test scores (more recent = higher weight)
  const recentTests = brainMap.testHistory.slice(-10);
  let weightedSum = 0;
  let totalWeight = 0;
  recentTests.forEach((test, i) => {
    const weight = i + 1; // Later tests have higher weight
    weightedSum += test.estimatedGre * weight;
    totalWeight += weight;
  });

  const avgScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 130;
  const ci = Math.max(2, Math.min(6, Math.round(3 / Math.sqrt(testCount / 2))));
  const band = getScoreBand(avgScore);

  return {
    score: Math.max(130, Math.min(170, avgScore)),
    confidenceInterval: ci,
    band: band.label,
    percentile: band.percentile
  };
}
