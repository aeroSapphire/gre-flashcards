export interface ConfusionMatrix {
  confusions: Record<string, Record<string, number>>;
  // confusions["parsimonious"]["frugal"] = 3 means user picked frugal
  // when parsimonious was correct, 3 times
}

export function createEmptyMatrix(): ConfusionMatrix {
  return { confusions: {} };
}

export function recordConfusion(
  matrix: ConfusionMatrix,
  correctWord: string,
  chosenWord: string
): ConfusionMatrix {
  const updated = { confusions: { ...matrix.confusions } };
  if (!updated.confusions[correctWord]) {
    updated.confusions[correctWord] = {};
  }
  updated.confusions[correctWord] = {
    ...updated.confusions[correctWord],
    [chosenWord]: (updated.confusions[correctWord][chosenWord] || 0) + 1,
  };
  return updated;
}

export function getTopConfusions(
  matrix: ConfusionMatrix,
  word: string,
  limit = 5
): { word: string; count: number }[] {
  const wordConfusions = matrix.confusions[word];
  if (!wordConfusions) return [];
  return Object.entries(wordConfusions)
    .map(([w, count]) => ({ word: w, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getMostConfusedPairs(
  matrix: ConfusionMatrix,
  limit = 10
): { wordA: string; wordB: string; count: number }[] {
  const pairs: { wordA: string; wordB: string; count: number }[] = [];
  const seen = new Set<string>();

  for (const [wordA, confusedWith] of Object.entries(matrix.confusions)) {
    for (const [wordB, count] of Object.entries(confusedWith)) {
      const key = [wordA, wordB].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      // Sum both directions
      const reverseCount = matrix.confusions[wordB]?.[wordA] || 0;
      pairs.push({ wordA, wordB, count: count + reverseCount });
    }
  }

  return pairs.sort((a, b) => b.count - a.count).slice(0, limit);
}

export function getConfusionScore(matrix: ConfusionMatrix, word: string): number {
  const wordConfusions = matrix.confusions[word];
  if (!wordConfusions) return 0;
  const totalConfusions = Object.values(wordConfusions).reduce((sum, c) => sum + c, 0);
  // Normalize: 0 = never confused, 1 = highly confused (10+ confusions)
  return Math.min(totalConfusions / 10, 1);
}

export function hasRecentConfusion(
  matrix: ConfusionMatrix,
  wordA: string,
  wordB: string
): boolean {
  return (
    (matrix.confusions[wordA]?.[wordB] || 0) > 0 ||
    (matrix.confusions[wordB]?.[wordA] || 0) > 0
  );
}
