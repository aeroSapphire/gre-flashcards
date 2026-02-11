export type MasteryLevel = "foundation" | "developing" | "competent" | "advanced" | "expert";
export type Trend = "improving" | "stable" | "declining";

export interface SkillMastery {
  skillId: string;
  mastery: number;
  level: MasteryLevel;
  questionsSeen: number;
  correct: number;
  accuracyByDifficulty: Record<number, { seen: number; correct: number }>;
  currentDifficulty: number;
  trend: Trend;
  lastPracticed: string;
  streak: number;
  recentAnswers: boolean[];
}

export interface TrapProfile {
  trapId: string;
  fallenFor: number;
  avoided: number;
}

export interface TestHistoryEntry {
  testId: string;
  date: string;
  category: string;
  score: string;
  estimatedGre: number;
  difficultyRange: [number, number];
  weakSkills: string[];
  strongSkills: string[];
}

export interface BrainMap {
  userId: string;
  lastUpdated: string;
  estimatedScore: {
    overall: number;
    rc: number;
    tc: number;
    se: number;
  };
  skills: Record<string, SkillMastery>;
  trapProfile: Record<string, TrapProfile>;
  testHistory: TestHistoryEntry[];
  lessonsCompleted: Record<string, { completedAt: string; quickCheckScore: number }>;
}
