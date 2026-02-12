import type { ClusterDrill, WordCluster, DrillType } from '@/data/wordRelationships/types';

export interface DrillSession {
  clusterId: string;
  clusterName: string;
  drills: ClusterDrill[];
  currentIndex: number;
  answers: DrillAnswer[];
}

export interface DrillAnswer {
  drillId: string;
  selectedAnswer: string | string[];
  correct: boolean;
  wordsInvolved: string[];
}

export function generateDrillSession(
  cluster: WordCluster,
  count = 8,
  preferredTypes?: DrillType[]
): DrillSession {
  let available = [...cluster.drills];

  // If preferred types specified, prioritize those
  if (preferredTypes && preferredTypes.length > 0) {
    const preferred = available.filter(d => preferredTypes.includes(d.type));
    const others = available.filter(d => !preferredTypes.includes(d.type));
    available = [...shuffle(preferred), ...shuffle(others)];
  } else {
    available = shuffle(available);
  }

  // Ensure variety: try to include at least one of each available type
  const byType = new Map<DrillType, ClusterDrill[]>();
  for (const drill of available) {
    if (!byType.has(drill.type)) byType.set(drill.type, []);
    byType.get(drill.type)!.push(drill);
  }

  const selected: ClusterDrill[] = [];
  // First pass: one from each type
  for (const [, drills] of byType) {
    if (selected.length >= count) break;
    selected.push(drills[0]);
  }
  // Second pass: fill remaining from shuffled pool
  for (const drill of available) {
    if (selected.length >= count) break;
    if (!selected.includes(drill)) selected.push(drill);
  }

  return {
    clusterId: cluster.id,
    clusterName: cluster.name,
    drills: selected.slice(0, count),
    currentIndex: 0,
    answers: [],
  };
}

export function scoreDrill(
  drill: ClusterDrill,
  userAnswer: string | string[]
): boolean {
  if (Array.isArray(drill.correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;
    if (userAnswer.length !== drill.correctAnswer.length) return false;
    return drill.correctAnswer.every((a, i) => a === userAnswer[i]);
  }
  return drill.correctAnswer === userAnswer;
}

export function getSessionSummary(session: DrillSession): {
  total: number;
  correct: number;
  accuracy: number;
  byType: Record<string, { total: number; correct: number }>;
  wordsStruggled: string[];
} {
  const total = session.answers.length;
  const correct = session.answers.filter(a => a.correct).length;

  const byType: Record<string, { total: number; correct: number }> = {};
  for (let i = 0; i < session.answers.length; i++) {
    const drill = session.drills[i];
    const answer = session.answers[i];
    if (!drill) continue;
    if (!byType[drill.type]) byType[drill.type] = { total: 0, correct: 0 };
    byType[drill.type].total++;
    if (answer.correct) byType[drill.type].correct++;
  }

  // Words the user got wrong
  const struggled = new Set<string>();
  for (const answer of session.answers) {
    if (!answer.correct) {
      answer.wordsInvolved.forEach(w => struggled.add(w));
    }
  }

  return {
    total,
    correct,
    accuracy: total > 0 ? correct / total : 0,
    byType,
    wordsStruggled: Array.from(struggled),
  };
}

export function generateConfusionDrill(
  wordA: string,
  wordB: string,
  cluster: WordCluster
): ClusterDrill[] {
  // Find existing confusion_resolver drills for this pair
  const existing = cluster.drills.filter(
    d =>
      d.type === 'confusion_resolver' &&
      d.options.some(o => o.text === wordA) &&
      d.options.some(o => o.text === wordB)
  );

  // Also include shade_distinction drills involving either word
  const shade = cluster.drills.filter(
    d =>
      d.type === 'shade_distinction' &&
      d.options.some(o => o.text === wordA || o.text === wordB)
  );

  return shuffle([...existing, ...shade]).slice(0, 5);
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
