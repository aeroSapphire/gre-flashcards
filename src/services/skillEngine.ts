
import { supabase } from '@/integrations/supabase/client';
import { MistakeLabel } from '@/utils/mistakeClassifier';

export type SkillType = 'precision' | 'vocab' | 'logic' | 'context';

export interface UserSkill {
  skill_type: SkillType;
  mu: number;
  sigma: number;
  last_practice_at: string;
}

const MISTAKE_TO_SKILL: Record<MistakeLabel, SkillType> = {
  POLARITY_ERROR: 'precision',
  INTENSITY_MISMATCH: 'vocab',
  SCOPE_ERROR: 'logic',
  LOGICAL_CONTRADICTION: 'logic',
  TONE_REGISTER_MISMATCH: 'context',
  TEMPORAL_ERROR: 'precision',
  PARTIAL_SYNONYM_TRAP: 'context',
  DOUBLE_NEGATIVE_CONFUSION: 'logic',
  CONTEXT_MISREAD: 'context',
  ELIMINATION_FAILURE: 'logic',
  NONE: 'precision' 
};

const DEFAULT_MU = 50.0;
const DEFAULT_SIGMA = 10.0;
const K_FACTOR = 4.0; // Volatility factor
const DECAY_RATE = 0.5; // Points lost per day of inactivity

/**
 * Updates the user's skill model based on a recent answer.
 */
export async function updateSkillModel(
  label: MistakeLabel,
  isCorrect: boolean
) {
  if (label === 'NONE' && !isCorrect) return; // Should not happen for errors
  
  // If correct, we don't always have a label. 
  // If we want to credit a specific skill for a correct answer, we'd need to know the question's primary skill.
  // For now, if it's a mistake, we punish the specific skill.
  // If it's correct, we might want to reward ALL skills slightly or need more info.
  // Requirement check: "When a user answers... update... based on Surprise".
  // Without question metadata, we can only reliably punish mistakes.
  // However, we can map the *potential* mistake to the skill. 
  // But wait, if they got it right, we don't know which trap they avoided.
  // LIMITATION: For now, we only update on MISTAKES (punishment) or if we explicitly know the skill type of the question.
  // Let's assume for now we primarily use this to track weaknesses (mistakes).
  
  if (isCorrect) {
    // Optional: Global boost or decay check? 
    // Let's skip correct answer updates for now unless we pass a skill type explicitly.
    return; 
  }

  const skillType = MISTAKE_TO_SKILL[label];
  if (!skillType) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // 1. Fetch current skill
    const { data: currentSkill, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_type', skillType)
      .single();

    let mu = DEFAULT_MU;
    let sigma = DEFAULT_SIGMA;
    let lastPractice = new Date().getTime();

    if (currentSkill) {
      mu = currentSkill.mu;
      sigma = currentSkill.sigma;
      lastPractice = new Date(currentSkill.last_practice_at).getTime();
    }

    // 2. Apply Time Decay first
    const now = Date.now();
    const daysSinceLast = (now - lastPractice) / (1000 * 60 * 60 * 24);
    if (daysSinceLast > 1) {
      // Uncertainty grows, Skill might decay slightly
      sigma = Math.min(20, sigma + daysSinceLast * 0.5); 
      // mu = Math.max(0, mu - daysSinceLast * DECAY_RATE); // Optional skill decay
    }

    // 3. Apply Bayesian Update (Simplified)
    // We expected them to get it right (Probability ~ Mu/100)
    // Actual = 0 (since it's a mistake)
    const expected = 1 / (1 + Math.exp(-(mu - 50) / 10)); // Sigmoid centered at 50
    const actual = 0; 
    
    // Update Mu
    // If confidence (sigma) is high (low value), change is smaller? 
    // Actually, in Kalman filters, high uncertainty -> larger update.
    // Let's use Sigma as a learning rate multiplier.
    const learningRate = K_FACTOR * (sigma / 10); 
    let newMu = mu + learningRate * (actual - expected);
    
    // Clamp
    newMu = Math.max(0, Math.min(100, newMu));

    // Update Sigma (Confidence increases => Sigma decreases)
    let newSigma = Math.max(1, sigma * 0.95);

    // 4. Save
    const { error: upsertError } = await supabase
      .from('user_skills')
      .upsert({
        user_id: user.id,
        skill_type: skillType,
        mu: newMu,
        sigma: newSigma,
        last_practice_at: new Date().toISOString()
      }, { onConflict: 'user_id,skill_type' });

    if (upsertError) throw upsertError;

    console.log(`Updated ${skillType}: mu ${mu.toFixed(1)} -> ${newMu.toFixed(1)}`);

  } catch (err) {
    console.error('Failed to update skill model:', err);
  }
}

/**
 * Fetches all skills for the user.
 */
export async function getUserSkills(): Promise<UserSkill[]> {
  const { data, error } = await supabase
    .from('user_skills')
    .select('*');
    
  if (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
  
  return data as UserSkill[];
}

/**
 * Gets the weakest skill to target.
 */
export async function getWeakestSkill(): Promise<SkillType | null> {
  const skills = await getUserSkills();
  if (skills.length === 0) return null;
  
  // Sort by Mu ascending
  skills.sort((a, b) => a.mu - b.mu);
  return skills[0].skill_type;
}
