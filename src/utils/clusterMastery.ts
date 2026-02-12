import type { ConfusionMatrix } from './confusionMatrix';

export interface DrillResult {
  clusterId: string;
  drillId: string;
  correct: boolean;
  timestamp: string;
  wordsInvolved: string[];
}

export interface ClusterMasteryData {
  clusterId: string;
  wordKnowledge: number;      // 0-1: % of words user has "learned" in flashcards
  contextualAccuracy: number;  // 0-1: % correct on cluster drills
  confusionResolution: number; // 0-1: 1 - (active confusions / total confusion pairs)
  recency: number;             // 0-1: 1 if practiced in last 7 days, decays after
  overall: number;             // weighted average
}

export function calculateClusterMastery(
  clusterId: string,
  clusterWords: string[],
  learnedWords: Set<string>,
  drillHistory: DrillResult[],
  confusionMatrix: ConfusionMatrix,
  confusionPairCount: number
): ClusterMasteryData {
  // 1. Word knowledge: % of cluster words marked as "learned"
  const knownCount = clusterWords.filter(w => learnedWords.has(w)).length;
  const wordKnowledge = clusterWords.length > 0 ? knownCount / clusterWords.length : 0;

  // 2. Contextual accuracy: % correct on cluster drills (last 20 attempts)
  const clusterDrills = drillHistory
    .filter(d => d.clusterId === clusterId)
    .slice(-20);
  const contextualAccuracy =
    clusterDrills.length > 0
      ? clusterDrills.filter(d => d.correct).length / clusterDrills.length
      : 0;

  // 3. Confusion resolution: 1 - (active confusions / total pairs)
  let activeConfusions = 0;
  if (confusionPairCount > 0) {
    for (const word of clusterWords) {
      const wordConf = confusionMatrix.confusions[word];
      if (wordConf) {
        for (const confusedWith of Object.keys(wordConf)) {
          if (clusterWords.includes(confusedWith) && wordConf[confusedWith] > 0) {
            activeConfusions++;
          }
        }
      }
    }
    // Avoid double-counting bidirectional confusions
    activeConfusions = Math.ceil(activeConfusions / 2);
  }
  const confusionResolution =
    confusionPairCount > 0
      ? Math.max(0, 1 - activeConfusions / confusionPairCount)
      : 1;

  // 4. Recency: 1 if practiced in last 7 days, decays linearly to 0 at 30 days
  const lastDrill = clusterDrills[clusterDrills.length - 1];
  let recency = 0;
  if (lastDrill) {
    const daysSince =
      (Date.now() - new Date(lastDrill.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 7) recency = 1;
    else if (daysSince <= 30) recency = 1 - (daysSince - 7) / 23;
  }

  // Weighted average: word knowledge 30%, contextual 35%, confusion 25%, recency 10%
  const overall =
    wordKnowledge * 0.3 +
    contextualAccuracy * 0.35 +
    confusionResolution * 0.25 +
    recency * 0.1;

  return {
    clusterId,
    wordKnowledge,
    contextualAccuracy,
    confusionResolution,
    recency,
    overall,
  };
}

export function getMasteryLevel(overall: number): {
  label: string;
  color: string;
} {
  if (overall >= 0.85) return { label: 'Mastered', color: 'text-green-400' };
  if (overall >= 0.65) return { label: 'Proficient', color: 'text-blue-400' };
  if (overall >= 0.4) return { label: 'Developing', color: 'text-yellow-400' };
  if (overall >= 0.15) return { label: 'Beginner', color: 'text-orange-400' };
  return { label: 'Not Started', color: 'text-muted-foreground' };
}
