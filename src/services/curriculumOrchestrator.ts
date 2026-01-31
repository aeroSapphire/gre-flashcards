
import { supabase } from '@/integrations/supabase/client';
import { getUserSkills, UserSkill, SkillType, ALL_SKILL_TYPES, getSkillDisplayName } from './skillEngine';
import { getMistakeHistory, MistakeEvent } from './mistakeService';

// Phase definitions following pedagogical progression
export type LearningPhase = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const PHASE_NAMES: Record<LearningPhase, string> = {
  0: 'Calibration',
  1: 'Polarity Mastery',
  2: 'Intensity & Vocabulary',
  3: 'Scope & Logic',
  4: 'Context & Tone',
  5: 'Elimination Mastery',
  6: 'Test Readiness'
};

export const PHASE_DESCRIPTIONS: Record<LearningPhase, string> = {
  0: 'Take tests to establish your baseline skill levels',
  1: 'Master positive/negative meaning recognition',
  2: 'Learn word intensity and synonym discrimination',
  3: 'Develop scope awareness and logical reasoning',
  4: 'Understand tone, context, and temporal cues',
  5: 'Perfect your answer elimination process',
  6: 'Maintain all skills through mixed practice'
};

// Skills focused on in each phase
export const PHASE_SKILLS: Record<LearningPhase, SkillType[]> = {
  0: [], // Calibration - any skills
  1: ['POLARITY_ERROR', 'DOUBLE_NEGATIVE_CONFUSION'],
  2: ['INTENSITY_MISMATCH', 'PARTIAL_SYNONYM_TRAP'],
  3: ['SCOPE_ERROR', 'LOGICAL_CONTRADICTION'],
  4: ['TONE_REGISTER_MISMATCH', 'CONTEXT_MISREAD', 'TEMPORAL_ERROR'],
  5: ['ELIMINATION_FAILURE'],
  6: [] // Test readiness - all skills
};

// Exit criteria for each phase (mu thresholds)
export const PHASE_EXIT_CRITERIA: Record<LearningPhase, Record<string, number> | null> = {
  0: null, // Special handling: minQuestions: 20, maxAvgSigma: 12
  1: { POLARITY_ERROR: 65, DOUBLE_NEGATIVE_CONFUSION: 60 },
  2: { INTENSITY_MISMATCH: 65, PARTIAL_SYNONYM_TRAP: 60 },
  3: { SCOPE_ERROR: 65, LOGICAL_CONTRADICTION: 60 },
  4: { TONE_REGISTER_MISMATCH: 65, CONTEXT_MISREAD: 60, TEMPORAL_ERROR: 60 },
  5: { ELIMINATION_FAILURE: 70 },
  6: null // Ongoing maintenance
};

// Calibration phase constants
const MIN_CALIBRATION_QUESTIONS = 20;
const MAX_CALIBRATION_SIGMA = 12;

export type RecommendationType = 'test' | 'weakness_practice' | 'vocabulary' | 'mixed_practice';

export interface Recommendation {
  type: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  skillFocus?: SkillType;
  testId?: string;
  reason: string;
  estimatedBenefit: number; // 1-10 impact score
}

export interface PhaseStatus {
  currentPhase: LearningPhase;
  phaseName: string;
  phaseDescription: string;
  phaseProgress: number;        // 0-100% toward exit criteria
  dominantWeakness: SkillType | null;  // Current priority skill
  blockedBy: SkillType[];       // Skills preventing phase advancement
  recommendation: Recommendation;
  totalQuestions: number;
  avgSigma: number;
}

/**
 * Gets the mu value for a specific skill from the skills array.
 */
function getSkillMu(skills: UserSkill[], skillType: SkillType): number {
  const skill = skills.find(s => s.skill_type === skillType);
  return skill?.mu ?? 50; // Default mu if not found
}

/**
 * Gets the sigma value for a specific skill from the skills array.
 */
function getSkillSigma(skills: UserSkill[], skillType: SkillType): number {
  const skill = skills.find(s => s.skill_type === skillType);
  return skill?.sigma ?? 15; // Default sigma if not found
}

/**
 * Gets the skill with highest uncertainty (needs more practice data).
 */
function getMostUncertainSkill(skills: UserSkill[]): SkillType | null {
  if (skills.length === 0) return ALL_SKILL_TYPES[0];

  // Find skill with highest sigma
  let maxSigma = 0;
  let mostUncertain: SkillType | null = null;

  for (const skill of skills) {
    if (ALL_SKILL_TYPES.includes(skill.skill_type as SkillType) && skill.sigma > maxSigma) {
      maxSigma = skill.sigma;
      mostUncertain = skill.skill_type as SkillType;
    }
  }

  // If no skills found, return the first skill type
  if (!mostUncertain) {
    // Find a skill type that isn't in the skills array
    for (const skillType of ALL_SKILL_TYPES) {
      if (!skills.find(s => s.skill_type === skillType)) {
        return skillType;
      }
    }
    return ALL_SKILL_TYPES[0];
  }

  return mostUncertain;
}

/**
 * Determines the current learning phase based on skill levels.
 */
function determineCurrentPhase(skills: UserSkill[], totalQuestions: number, avgSigma: number): LearningPhase {
  // Phase 0: Calibration
  if (totalQuestions < MIN_CALIBRATION_QUESTIONS || avgSigma > MAX_CALIBRATION_SIGMA) {
    return 0;
  }

  // Check phases 1-5 in order
  for (let phase = 1; phase <= 5; phase++) {
    const criteria = PHASE_EXIT_CRITERIA[phase as LearningPhase];
    if (!criteria) continue;

    // Check if all criteria are met for this phase
    const allCriteriaMet = Object.entries(criteria).every(([skill, threshold]) => {
      return getSkillMu(skills, skill as SkillType) >= threshold;
    });

    if (!allCriteriaMet) {
      return phase as LearningPhase;
    }
  }

  // All phases complete - Test Readiness
  return 6;
}

/**
 * Calculates progress within the current phase (0-100).
 */
function calculatePhaseProgress(skills: UserSkill[], phase: LearningPhase): number {
  if (phase === 0 || phase === 6) {
    // For calibration and test readiness, progress is based on overall stats
    return 0; // Will be calculated differently
  }

  const criteria = PHASE_EXIT_CRITERIA[phase];
  if (!criteria) return 100;

  let totalProgress = 0;
  let criteriaCount = 0;

  for (const [skill, threshold] of Object.entries(criteria)) {
    const currentMu = getSkillMu(skills, skill as SkillType);
    // Progress: 0 at mu=0, 100 at threshold
    const skillProgress = Math.min(100, (currentMu / threshold) * 100);
    totalProgress += skillProgress;
    criteriaCount++;
  }

  return criteriaCount > 0 ? Math.round(totalProgress / criteriaCount) : 0;
}

/**
 * Gets the priority skill to focus on for the current phase.
 */
function getPrioritySkillForPhase(skills: UserSkill[], phase: LearningPhase): SkillType | null {
  const phaseSkills = PHASE_SKILLS[phase];

  if (phaseSkills.length === 0) {
    // For phases 0 and 6, find the weakest overall skill
    if (skills.length === 0) return ALL_SKILL_TYPES[0];

    let weakest: SkillType | null = null;
    let lowestMu = 100;

    for (const skillType of ALL_SKILL_TYPES) {
      const mu = getSkillMu(skills, skillType);
      if (mu < lowestMu) {
        lowestMu = mu;
        weakest = skillType;
      }
    }

    return weakest;
  }

  // Find the weakest skill within the phase
  let weakest: SkillType | null = null;
  let lowestMu = 100;

  for (const skillType of phaseSkills) {
    const mu = getSkillMu(skills, skillType);
    if (mu < lowestMu) {
      lowestMu = mu;
      weakest = skillType;
    }
  }

  return weakest;
}

/**
 * Gets skills that are blocking phase advancement.
 */
function getBlockingSkills(skills: UserSkill[], phase: LearningPhase): SkillType[] {
  const criteria = PHASE_EXIT_CRITERIA[phase];
  if (!criteria) return [];

  return Object.entries(criteria)
    .filter(([skill, threshold]) => getSkillMu(skills, skill as SkillType) < threshold)
    .map(([skill]) => skill as SkillType);
}

/**
 * Generates a recommendation based on current phase and skill levels.
 */
function generateRecommendation(
  phase: LearningPhase,
  dominantWeakness: SkillType | null,
  skills: UserSkill[],
  totalQuestions: number
): Recommendation {
  // Phase 0: Calibration - need more test data
  if (phase === 0) {
    const questionsNeeded = Math.max(0, MIN_CALIBRATION_QUESTIONS - totalQuestions);
    return {
      type: 'test',
      priority: 'high',
      reason: questionsNeeded > 0
        ? `Take tests to establish your baseline (${questionsNeeded} more questions needed)`
        : 'Continue taking tests to reduce uncertainty in your skill estimates',
      estimatedBenefit: 10
    };
  }

  // Phase 6: Test Readiness - mixed practice
  if (phase === 6) {
    return {
      type: 'mixed_practice',
      priority: 'medium',
      reason: 'Maintain your skills with mixed practice across all question types',
      estimatedBenefit: 6
    };
  }

  // Phases 1-5: Focus on phase-specific skills
  if (dominantWeakness) {
    const weaknessMu = getSkillMu(skills, dominantWeakness);
    const displayName = getSkillDisplayName(dominantWeakness);

    // High priority if mu is very low
    const priority = weaknessMu < 40 ? 'high' : weaknessMu < 55 ? 'medium' : 'low';

    return {
      type: 'weakness_practice',
      priority,
      skillFocus: dominantWeakness,
      reason: `Focus on ${displayName} to advance to the next phase`,
      estimatedBenefit: Math.round(10 - (weaknessMu / 10))
    };
  }

  // Default recommendation
  return {
    type: 'test',
    priority: 'medium',
    reason: 'Take a test to assess your current level',
    estimatedBenefit: 5
  };
}

/**
 * Main orchestrator function - gets the complete curriculum status.
 */
export async function getCurriculumStatus(): Promise<PhaseStatus> {
  const skills = await getUserSkills();

  // Filter to only 10-skill types (not old 4-category)
  const relevantSkills = skills.filter(s =>
    ALL_SKILL_TYPES.includes(s.skill_type as SkillType)
  );

  // Calculate total questions and average sigma
  const totalQuestions = relevantSkills.reduce((sum, s) =>
    sum + (s.correct_count || 0) + (s.incorrect_count || 0), 0);

  const avgSigma = relevantSkills.length > 0
    ? relevantSkills.reduce((sum, s) => sum + s.sigma, 0) / relevantSkills.length
    : 15; // Default high uncertainty

  // Determine current phase
  const currentPhase = determineCurrentPhase(relevantSkills, totalQuestions, avgSigma);

  // Get priority skill for this phase
  const dominantWeakness = getPrioritySkillForPhase(relevantSkills, currentPhase);

  // Get blocking skills
  const blockedBy = getBlockingSkills(relevantSkills, currentPhase);

  // Calculate phase progress
  let phaseProgress: number;
  if (currentPhase === 0) {
    // Calibration progress based on questions and sigma
    const questionProgress = Math.min(100, (totalQuestions / MIN_CALIBRATION_QUESTIONS) * 100);
    const sigmaProgress = avgSigma <= MAX_CALIBRATION_SIGMA ? 100 :
      Math.max(0, 100 - ((avgSigma - MAX_CALIBRATION_SIGMA) / 8) * 100);
    phaseProgress = Math.round((questionProgress + sigmaProgress) / 2);
  } else {
    phaseProgress = calculatePhaseProgress(relevantSkills, currentPhase);
  }

  // Generate recommendation
  const recommendation = generateRecommendation(
    currentPhase,
    dominantWeakness,
    relevantSkills,
    totalQuestions
  );

  return {
    currentPhase,
    phaseName: PHASE_NAMES[currentPhase],
    phaseDescription: PHASE_DESCRIPTIONS[currentPhase],
    phaseProgress,
    dominantWeakness,
    blockedBy,
    recommendation,
    totalQuestions,
    avgSigma
  };
}

/**
 * Gets just the current phase without full analysis (lighter weight).
 */
export async function getCurrentPhase(): Promise<LearningPhase> {
  const status = await getCurriculumStatus();
  return status.currentPhase;
}

/**
 * Gets the priority skill for the current phase.
 * Useful as a fallback when analyzeMistakes returns null.
 */
export async function getPhasePrioritySkill(): Promise<SkillType | null> {
  const status = await getCurriculumStatus();
  return status.dominantWeakness;
}

/**
 * Generates a curriculum-aware nudge message.
 */
export function generateCurriculumNudge(status: PhaseStatus): string {
  const { currentPhase, phaseName, dominantWeakness, phaseProgress, recommendation } = status;

  if (currentPhase === 0) {
    return `You're in the ${phaseName} phase. ${recommendation.reason}`;
  }

  if (currentPhase === 6) {
    return `Congratulations! You've reached ${phaseName}. Keep practicing to maintain your skills.`;
  }

  if (dominantWeakness) {
    const displayName = getSkillDisplayName(dominantWeakness);
    return `Phase ${currentPhase}: ${phaseName} (${phaseProgress}% complete). Focus on ${displayName} to progress.`;
  }

  return `You're in ${phaseName}. ${recommendation.reason}`;
}
