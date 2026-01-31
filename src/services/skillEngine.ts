
import { supabase } from '@/integrations/supabase/client';

// 10 granular skill types (direct 1:1 mapping with mistake labels)
export type SkillType =
  | 'POLARITY_ERROR'
  | 'INTENSITY_MISMATCH'
  | 'SCOPE_ERROR'
  | 'LOGICAL_CONTRADICTION'
  | 'TONE_REGISTER_MISMATCH'
  | 'TEMPORAL_ERROR'
  | 'PARTIAL_SYNONYM_TRAP'
  | 'DOUBLE_NEGATIVE_CONFUSION'
  | 'CONTEXT_MISREAD'
  | 'ELIMINATION_FAILURE';

// All skill types for iteration
export const ALL_SKILL_TYPES: SkillType[] = [
  'POLARITY_ERROR',
  'INTENSITY_MISMATCH',
  'SCOPE_ERROR',
  'LOGICAL_CONTRADICTION',
  'TONE_REGISTER_MISMATCH',
  'TEMPORAL_ERROR',
  'PARTIAL_SYNONYM_TRAP',
  'DOUBLE_NEGATIVE_CONFUSION',
  'CONTEXT_MISREAD',
  'ELIMINATION_FAILURE'
];

// 4 high-level categories for brain visualization
export type SkillCategory = 'precision' | 'vocab' | 'logic' | 'context';

// Mapping from 10 skills to 4 categories
export const SKILL_CATEGORIES: Record<SkillCategory, SkillType[]> = {
  precision: ['POLARITY_ERROR', 'TEMPORAL_ERROR'],
  vocab: ['INTENSITY_MISMATCH', 'PARTIAL_SYNONYM_TRAP'],
  logic: ['SCOPE_ERROR', 'LOGICAL_CONTRADICTION', 'DOUBLE_NEGATIVE_CONFUSION', 'ELIMINATION_FAILURE'],
  context: ['TONE_REGISTER_MISMATCH', 'CONTEXT_MISREAD']
};

// Reverse mapping: 10 skills to their category (for backward compatibility)
export const SKILL_TO_CATEGORY: Record<SkillType, SkillCategory> = {
  POLARITY_ERROR: 'precision',
  TEMPORAL_ERROR: 'precision',
  INTENSITY_MISMATCH: 'vocab',
  PARTIAL_SYNONYM_TRAP: 'vocab',
  SCOPE_ERROR: 'logic',
  LOGICAL_CONTRADICTION: 'logic',
  DOUBLE_NEGATIVE_CONFUSION: 'logic',
  ELIMINATION_FAILURE: 'logic',
  TONE_REGISTER_MISMATCH: 'context',
  CONTEXT_MISREAD: 'context'
};

// Base difficulty by mistake type (inherent difficulty of avoiding this mistake)
export const MISTAKE_BASE_DIFFICULTY: Record<SkillType, number> = {
  POLARITY_ERROR: 0.0,          // Medium - common trap
  INTENSITY_MISMATCH: 0.5,      // Medium-hard - subtle degree differences
  SCOPE_ERROR: 0.3,             // Medium - overlooking qualifiers
  LOGICAL_CONTRADICTION: 0.4,   // Medium-hard - complex reasoning
  TONE_REGISTER_MISMATCH: 0.6,  // Hard - requires sensitivity to style
  TEMPORAL_ERROR: 0.2,          // Medium - time-related words
  PARTIAL_SYNONYM_TRAP: 1.0,    // Hardest - subtle word traps
  DOUBLE_NEGATIVE_CONFUSION: 0.3, // Medium - confusing negatives
  CONTEXT_MISREAD: 0.7,         // Hard - deep comprehension needed
  ELIMINATION_FAILURE: -0.5     // Easiest - basic process failure
};

export interface UserSkill {
  skill_type: SkillType | SkillCategory; // Supports both new 10-skill and old 4-category schemas
  mu: number;           // Ability estimate (0-100)
  sigma: number;        // Uncertainty (2-20)
  correct_count?: number;  // Optional for old schema compatibility
  incorrect_count?: number; // Optional for old schema compatibility
  last_practice_at: string;
}

// Aggregated category skill for brain visualization
export interface CategorySkill {
  category: SkillCategory;
  mu: number;
  sigma: number;
  componentSkills: SkillType[];
}

const DEFAULT_MU = 50.0;
const DEFAULT_SIGMA = 15.0;  // Higher initial uncertainty
const K_FACTOR = 4.0;        // Volatility factor
const MIN_SIGMA = 2.0;       // Minimum uncertainty
const MAX_SIGMA = 20.0;      // Maximum uncertainty
const SIGMA_DECAY = 0.95;    // How much sigma decreases per practice
const SIGMA_GROWTH_RATE = 0.3; // Sigma growth per day of inactivity

interface UpdateSkillParams {
  isCorrect: boolean;
  primarySkill: SkillType;
  questionDifficulty?: number; // -1 (easy) to +1 (hard), 0 = medium
}

/**
 * Calculates the expected probability of a correct answer given skill and difficulty.
 * Uses a logistic function centered at mu=50.
 */
function calculateExpectedProbability(mu: number, difficulty: number): number {
  // P(correct) = 1 / (1 + exp(-(mu-50)/16.67 - difficulty))
  // 16.67 scales so that mu=50 gives ~50% chance at difficulty=0
  const exponent = -((mu - 50) / 16.67) + difficulty;
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Updates the user's skill model based on a recent answer.
 * Bidirectional: handles both correct AND incorrect answers.
 */
export async function updateSkillModel(params: UpdateSkillParams): Promise<void> {
  const { isCorrect, primarySkill, questionDifficulty = 0 } = params;

  console.log('[SkillEngine] updateSkillModel called:', { isCorrect, primarySkill, questionDifficulty });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('[SkillEngine] No authenticated user found');
    return;
  }
  console.log('[SkillEngine] User:', user.id);

  try {
    // 1. Fetch current skill
    const { data: currentSkill, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_type', primarySkill)
      .single();

    let mu = DEFAULT_MU;
    let sigma = DEFAULT_SIGMA;
    let correctCount = 0;
    let incorrectCount = 0;
    let lastPractice = Date.now();

    if (currentSkill && !error) {
      mu = currentSkill.mu;
      sigma = currentSkill.sigma;
      correctCount = currentSkill.correct_count || 0;
      incorrectCount = currentSkill.incorrect_count || 0;
      lastPractice = new Date(currentSkill.last_practice_at).getTime();
    }

    // 2. Apply time decay to sigma (uncertainty grows with inactivity)
    const now = Date.now();
    const daysSinceLast = (now - lastPractice) / (1000 * 60 * 60 * 24);
    if (daysSinceLast > 1) {
      sigma = Math.min(MAX_SIGMA, sigma + daysSinceLast * SIGMA_GROWTH_RATE);
    }

    // 3. Calculate combined difficulty (base + question difficulty)
    const baseDifficulty = MISTAKE_BASE_DIFFICULTY[primarySkill];
    const combinedDifficulty = baseDifficulty + questionDifficulty;

    // 4. Calculate expected probability and actual outcome
    const expected = calculateExpectedProbability(mu, combinedDifficulty);
    const actual = isCorrect ? 1 : 0;

    // 5. Calculate learning rate based on uncertainty
    // Higher sigma = more uncertain = larger updates
    const learningRate = K_FACTOR * (sigma / 10);

    // 6. Apply Bayesian update with difficulty weighting
    // On correct: mu += K * (sigma/10) * (1 - P) * (1 + 0.2*difficulty)
    // On wrong:   mu += K * (sigma/10) * (0 - P) * (1 - 0.2*difficulty)
    let difficultyMultiplier: number;
    if (isCorrect) {
      // Correct answers on hard questions are worth more
      difficultyMultiplier = 1 + 0.2 * combinedDifficulty;
    } else {
      // Wrong answers on easy questions are punished more
      difficultyMultiplier = 1 - 0.2 * combinedDifficulty;
    }

    const surprise = actual - expected;
    let newMu = mu + learningRate * surprise * Math.max(0.5, difficultyMultiplier);

    // Clamp mu to valid range
    newMu = Math.max(0, Math.min(100, newMu));

    // 7. Update sigma (confidence increases with practice)
    let newSigma = Math.max(MIN_SIGMA, sigma * SIGMA_DECAY);

    // 8. Update counts
    if (isCorrect) {
      correctCount++;
    } else {
      incorrectCount++;
    }

    // 9. Save to database - try new schema first, fall back to old 4-category schema
    console.log('[SkillEngine] Attempting upsert with new schema:', primarySkill);

    const { error: upsertError } = await supabase
      .from('user_skills')
      .upsert({
        user_id: user.id,
        skill_type: primarySkill,
        mu: newMu,
        sigma: newSigma,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        last_practice_at: new Date().toISOString()
      }, { onConflict: 'user_id,skill_type' });

    if (upsertError) {
      console.log('[SkillEngine] Upsert error:', upsertError.code, upsertError.message);

      // Check if it's a constraint violation (old schema with 4 skills)
      // PostgreSQL check constraint violation codes: 23514, or message contains 'violates check constraint'
      const isCheckConstraintError =
        upsertError.code === '23514' ||
        upsertError.message?.includes('check') ||
        upsertError.message?.includes('violates') ||
        upsertError.message?.includes('skill_type');

      if (isCheckConstraintError) {
        // Fall back to old 4-category schema
        const categorySkill = SKILL_TO_CATEGORY[primarySkill];
        console.log(`[SkillEngine] Falling back to old schema: ${primarySkill} -> ${categorySkill}`);

        const { error: fallbackError } = await supabase
          .from('user_skills')
          .upsert({
            user_id: user.id,
            skill_type: categorySkill,
            mu: newMu,
            sigma: newSigma,
            last_practice_at: new Date().toISOString()
          }, { onConflict: 'user_id,skill_type' });

        if (fallbackError) {
          console.error('[SkillEngine] Fallback also failed:', fallbackError);
          throw fallbackError;
        }

        console.log(`[SkillEngine] Updated ${categorySkill} (fallback): mu ${mu.toFixed(1)} → ${newMu.toFixed(1)}`);
        return;
      }
      throw upsertError;
    }

    console.log('[SkillEngine] Upsert successful');

    const direction = isCorrect ? '↑' : '↓';
    console.log(`Updated ${primarySkill}: mu ${mu.toFixed(1)} → ${newMu.toFixed(1)} ${direction} (difficulty: ${combinedDifficulty.toFixed(2)})`);

  } catch (err) {
    console.error('Failed to update skill model:', err);
  }
}

/**
 * Fetches all 10 skills for the user.
 */
export async function getUserSkills(): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*');

  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }

  return (data || []) as UserSkill[];
}

/**
 * Aggregates skills into 4 categories.
 * Handles both new 10-skill schema and old 4-category schema.
 */
export function aggregateSkillsToCategories(skills: UserSkill[]): CategorySkill[] {
  // Detect schema: check if any skill has an old category name
  const oldCategoryNames = ['precision', 'vocab', 'logic', 'context'];
  const isOldSchema = skills.some(s => oldCategoryNames.includes(s.skill_type));

  if (isOldSchema) {
    // Old 4-category schema: use skills directly as categories
    const categoryMap = new Map<SkillCategory, UserSkill>();
    skills.forEach(s => {
      if (oldCategoryNames.includes(s.skill_type)) {
        categoryMap.set(s.skill_type as SkillCategory, s);
      }
    });

    return (['precision', 'vocab', 'logic', 'context'] as SkillCategory[]).map(category => {
      const skill = categoryMap.get(category);
      return {
        category,
        mu: skill?.mu ?? DEFAULT_MU,
        sigma: skill?.sigma ?? DEFAULT_SIGMA,
        componentSkills: SKILL_CATEGORIES[category]
      };
    });
  }

  // New 10-skill schema: aggregate into categories
  const skillMap = new Map<SkillType, UserSkill>();
  skills.forEach(s => skillMap.set(s.skill_type as SkillType, s));

  const categories: CategorySkill[] = [];

  for (const [category, skillTypes] of Object.entries(SKILL_CATEGORIES)) {
    let totalWeight = 0;
    let weightedMuSum = 0;
    let weightedSigmaSum = 0;

    for (const skillType of skillTypes) {
      const skill = skillMap.get(skillType);
      if (skill) {
        // Weight by total practice (correct + incorrect), min weight of 1
        const weight = Math.max(1, (skill.correct_count || 0) + (skill.incorrect_count || 0));
        totalWeight += weight;
        weightedMuSum += skill.mu * weight;
        weightedSigmaSum += skill.sigma * weight;
      } else {
        // Default values for unpracticed skills
        totalWeight += 1;
        weightedMuSum += DEFAULT_MU;
        weightedSigmaSum += DEFAULT_SIGMA;
      }
    }

    categories.push({
      category: category as SkillCategory,
      mu: totalWeight > 0 ? weightedMuSum / totalWeight : DEFAULT_MU,
      sigma: totalWeight > 0 ? weightedSigmaSum / totalWeight : DEFAULT_SIGMA,
      componentSkills: skillTypes
    });
  }

  return categories;
}

/**
 * Gets the weakest skill to target for practice.
 * Returns the skill with the lowest mu value.
 */
export async function getWeakestSkill(): Promise<SkillType | null> {
  const skills = await getUserSkills();
  if (skills.length === 0) return null;

  // Sort by mu ascending (weakest first)
  skills.sort((a, b) => a.mu - b.mu);
  return skills[0].skill_type;
}

/**
 * Gets skills that need the most practice (low mu or high sigma).
 * Returns up to `limit` skills sorted by priority.
 */
export async function getPrioritySkills(limit: number = 3): Promise<SkillType[]> {
  const skills = await getUserSkills();

  // Create a map of existing skills
  const skillMap = new Map<SkillType, UserSkill>();
  skills.forEach(s => skillMap.set(s.skill_type, s));

  // Calculate priority score for each skill type
  const priorities: { skill: SkillType; score: number }[] = ALL_SKILL_TYPES.map(skillType => {
    const skill = skillMap.get(skillType);
    if (!skill) {
      // Unpracticed skills get high priority
      return { skill: skillType, score: 100 };
    }
    // Priority = (100 - mu) + sigma * 2
    // Lower mu and higher uncertainty = higher priority
    return { skill: skillType, score: (100 - skill.mu) + skill.sigma * 2 };
  });

  // Sort by priority descending and return top skills
  priorities.sort((a, b) => b.score - a.score);
  return priorities.slice(0, limit).map(p => p.skill);
}

/**
 * Gets human-readable name for a skill type.
 */
export function getSkillDisplayName(skillType: SkillType): string {
  const names: Record<SkillType, string> = {
    POLARITY_ERROR: 'Polarity Recognition',
    INTENSITY_MISMATCH: 'Intensity Matching',
    SCOPE_ERROR: 'Scope Analysis',
    LOGICAL_CONTRADICTION: 'Logical Consistency',
    TONE_REGISTER_MISMATCH: 'Tone Sensitivity',
    TEMPORAL_ERROR: 'Temporal Awareness',
    PARTIAL_SYNONYM_TRAP: 'Synonym Discrimination',
    DOUBLE_NEGATIVE_CONFUSION: 'Negation Handling',
    CONTEXT_MISREAD: 'Context Comprehension',
    ELIMINATION_FAILURE: 'Elimination Process'
  };
  return names[skillType];
}
