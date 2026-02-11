import { BrainMap, SkillMastery, MasteryLevel, Trend, TrapProfile } from '@/data/brainMapSchema';
import { ALL_SKILL_IDS, SKILLS, SkillCategory } from '@/data/skillTaxonomy';

const DIFFICULTY_WEIGHTS: Record<number, number> = { 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.5, 5: 2.0 };
const MAX_RECENT_ANSWERS = 20;

export function initializeBrainMap(userId: string): BrainMap {
  const skills: Record<string, SkillMastery> = {};
  for (const skillId of ALL_SKILL_IDS) {
    skills[skillId] = {
      skillId,
      mastery: 0,
      level: "foundation",
      questionsSeen: 0,
      correct: 0,
      accuracyByDifficulty: { 1: { seen: 0, correct: 0 }, 2: { seen: 0, correct: 0 }, 3: { seen: 0, correct: 0 }, 4: { seen: 0, correct: 0 }, 5: { seen: 0, correct: 0 } },
      currentDifficulty: 2.0,
      trend: "stable",
      lastPracticed: "",
      streak: 0,
      recentAnswers: []
    };
  }

  const trapProfile: Record<string, TrapProfile> = {};
  for (const skillId of ALL_SKILL_IDS) {
    if (skillId.startsWith("TRAP-")) {
      trapProfile[skillId] = { trapId: skillId, fallenFor: 0, avoided: 0 };
    }
  }

  return {
    userId,
    lastUpdated: new Date().toISOString(),
    estimatedScore: { overall: 130, rc: 130, tc: 130, se: 130 },
    skills,
    trapProfile,
    testHistory: [],
    lessonsCompleted: {}
  };
}

export function updateSkillAfterAnswer(
  brainMap: BrainMap,
  skillId: string,
  difficulty: number,
  correct: boolean
): BrainMap {
  const updated = { ...brainMap, lastUpdated: new Date().toISOString() };
  const skill = updated.skills[skillId];
  if (!skill) return updated;

  const updatedSkill = { ...skill };

  // Update counts
  updatedSkill.questionsSeen += 1;
  if (correct) {
    updatedSkill.correct += 1;
    updatedSkill.streak += 1;
  } else {
    updatedSkill.streak = 0;
  }

  // Update accuracy by difficulty
  const diffLevel = Math.round(Math.max(1, Math.min(5, difficulty)));
  const diffRecord = { ...updatedSkill.accuracyByDifficulty[diffLevel] } || { seen: 0, correct: 0 };
  diffRecord.seen += 1;
  if (correct) diffRecord.correct += 1;
  updatedSkill.accuracyByDifficulty = { ...updatedSkill.accuracyByDifficulty, [diffLevel]: diffRecord };

  // Update recent answers (keep last N)
  updatedSkill.recentAnswers = [...updatedSkill.recentAnswers, correct].slice(-MAX_RECENT_ANSWERS);

  // Update last practiced
  updatedSkill.lastPracticed = new Date().toISOString();

  // Recalculate mastery
  updatedSkill.mastery = calculateMastery(updatedSkill);
  updatedSkill.level = getMasteryLevel(updatedSkill.mastery);
  updatedSkill.trend = calculateTrend(updatedSkill);

  updated.skills = { ...updated.skills, [skillId]: updatedSkill };

  // Recalculate estimated scores
  updated.estimatedScore = recalculateScores(updated);

  return updated;
}

export function calculateMastery(skill: SkillMastery): number {
  if (skill.questionsSeen === 0) return 0;

  // Weighted accuracy: harder correct answers count more
  let weightedCorrect = 0;
  let totalWeight = 0;
  for (const [level, record] of Object.entries(skill.accuracyByDifficulty)) {
    const weight = DIFFICULTY_WEIGHTS[Number(level)] || 1;
    weightedCorrect += record.correct * weight;
    totalWeight += record.seen * weight;
  }
  const weightedAccuracy = totalWeight > 0 ? weightedCorrect / totalWeight : 0;

  // Consistency factor: lower stddev of recent answers = more consistent
  const consistencyFactor = calculateConsistency(skill.recentAnswers);

  // Recency factor: decays if not practiced recently
  const recencyFactor = calculateRecency(skill.lastPracticed);

  // Volume factor: more questions = more reliable mastery (ramps up to 1.0 over 15 questions)
  const volumeFactor = Math.min(1.0, skill.questionsSeen / 15);

  const mastery = weightedAccuracy * consistencyFactor * recencyFactor * volumeFactor;
  return Math.max(0, Math.min(1, mastery));
}

function calculateConsistency(recentAnswers: boolean[]): number {
  if (recentAnswers.length < 3) return 0.8; // Not enough data, moderate penalty

  const last10 = recentAnswers.slice(-10);
  const values = last10.map(a => a ? 1 : 0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return Math.max(0.5, 1 - stdDev * 0.3);
}

function calculateRecency(lastPracticed: string): number {
  if (!lastPracticed) return 0.5;
  const daysSince = (Date.now() - new Date(lastPracticed).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0.5, 1 - daysSince * 0.02);
}

export function getMasteryLevel(mastery: number): MasteryLevel {
  if (mastery < 0.30) return "foundation";
  if (mastery < 0.50) return "developing";
  if (mastery < 0.70) return "competent";
  if (mastery < 0.85) return "advanced";
  return "expert";
}

export function getWeakSkills(brainMap: BrainMap, category?: SkillCategory): string[] {
  let skills = Object.values(brainMap.skills);
  if (category) {
    skills = skills.filter(s => {
      const skillDef = SKILLS[s.skillId];
      return skillDef && skillDef.category === category;
    });
  }
  return skills
    .sort((a, b) => a.mastery - b.mastery)
    .map(s => s.skillId);
}

export function getStrongSkills(brainMap: BrainMap, category?: SkillCategory): string[] {
  let skills = Object.values(brainMap.skills);
  if (category) {
    skills = skills.filter(s => {
      const skillDef = SKILLS[s.skillId];
      return skillDef && skillDef.category === category;
    });
  }
  return skills
    .sort((a, b) => b.mastery - a.mastery)
    .map(s => s.skillId);
}

export function calculateTrend(skill: SkillMastery): Trend {
  const recent = skill.recentAnswers;
  if (recent.length < 10) return "stable";

  const last5 = recent.slice(-5);
  const prev5 = recent.slice(-10, -5);

  const last5Acc = last5.filter(Boolean).length / last5.length;
  const prev5Acc = prev5.filter(Boolean).length / prev5.length;

  const diff = last5Acc - prev5Acc;
  if (diff > 0.15) return "improving";
  if (diff < -0.15) return "declining";
  return "stable";
}

export function updateTrapProfile(
  brainMap: BrainMap,
  trapId: string,
  fellFor: boolean
): BrainMap {
  const updated = { ...brainMap };
  const trap = updated.trapProfile[trapId] || { trapId, fallenFor: 0, avoided: 0 };

  if (fellFor) {
    trap.fallenFor += 1;
  } else {
    trap.avoided += 1;
  }

  updated.trapProfile = { ...updated.trapProfile, [trapId]: trap };
  return updated;
}

function recalculateScores(brainMap: BrainMap): BrainMap['estimatedScore'] {
  const getCategoryAvg = (category: SkillCategory): number => {
    const skills = Object.values(brainMap.skills).filter(s => {
      const def = SKILLS[s.skillId];
      return def && def.category === category;
    });
    if (skills.length === 0) return 0;
    const avgMastery = skills.reduce((sum, s) => sum + s.mastery, 0) / skills.length;
    return Math.round(130 + avgMastery * 40);
  };

  const rc = getCategoryAvg("reading_comprehension");
  const tc = getCategoryAvg("text_completion");
  const se = getCategoryAvg("sentence_equivalence");

  // Weighted average (RC is weighted slightly more as it's ~50% of GRE verbal)
  const overall = Math.round(rc * 0.45 + tc * 0.30 + se * 0.25);

  return {
    overall: Math.max(130, Math.min(170, overall)),
    rc: Math.max(130, Math.min(170, rc)),
    tc: Math.max(130, Math.min(170, tc)),
    se: Math.max(130, Math.min(170, se))
  };
}

export function addTestToHistory(
  brainMap: BrainMap,
  entry: BrainMap['testHistory'][0]
): BrainMap {
  return {
    ...brainMap,
    testHistory: [...brainMap.testHistory, entry],
    lastUpdated: new Date().toISOString()
  };
}

export function markLessonComplete(
  brainMap: BrainMap,
  skillId: string,
  quickCheckScore: number
): BrainMap {
  const updated = { ...brainMap };
  updated.lessonsCompleted = {
    ...updated.lessonsCompleted,
    [skillId]: { completedAt: new Date().toISOString(), quickCheckScore }
  };

  // Initialize skill mastery at 0.2 (foundation) when lesson is completed
  if (updated.skills[skillId] && updated.skills[skillId].mastery < 0.2) {
    const skill = { ...updated.skills[skillId] };
    skill.mastery = 0.2;
    skill.level = "foundation";
    updated.skills = { ...updated.skills, [skillId]: skill };
  }

  return updated;
}

export function getSkillsNeedingReview(brainMap: BrainMap): string[] {
  const now = Date.now();
  return Object.values(brainMap.skills)
    .filter(s => {
      if (!s.lastPracticed) return false;
      const daysSince = (now - new Date(s.lastPracticed).getTime()) / (1000 * 60 * 60 * 24);
      return (s.trend === "declining" || daysSince > 5) && s.questionsSeen > 0;
    })
    .sort((a, b) => a.mastery - b.mastery)
    .map(s => s.skillId);
}
