
import { DIAGNOSTIC_QUESTIONS, DiagnosticQuestion, SkillCategory } from '@/data/diagnosticQuestions';
import { LearningPhase } from './curriculumOrchestrator';
import { MistakeLabel } from '@/utils/mistakeClassifier';
import { supabase } from '@/integrations/supabase/client';

export interface DiagnosticResult {
  dominantMistake: MistakeLabel | null;
  secondaryMistake: MistakeLabel | null;
  startingLearningPhase: LearningPhase;
  summary: string;
  focusArea: string;
  nextStep: string;
  mistakeCounts: Record<MistakeLabel, number>;
}

export const getDiagnosticQuestions = (): DiagnosticQuestion[] => {
  return DIAGNOSTIC_QUESTIONS;
};

export const analyzeDiagnostic = async (
  answers: Record<string, number[]>, // questionId -> selectedIndices
  timings: Record<string, number>, // questionId -> duration_ms
  userId: string
): Promise<DiagnosticResult> => {
  const mistakeCounts: Record<string, number> = {};
  let totalMistakes = 0;
  let totalTime = 0;

  // 1. Analyze Answers
  for (const question of DIAGNOSTIC_QUESTIONS) {
    const userIndices = answers[question.id] || [];
    const timeSpent = timings[question.id] || 0;
    totalTime += timeSpent;
    
    const isCorrect = 
      userIndices.length === question.correctAnswer.length &&
      userIndices.every(i => question.correctAnswer.includes(i));

    if (!isCorrect) {
      // Find the mistake label for the first wrong answer selected
      // (Simplified logic: grab the first mapped mistake)
      for (const index of userIndices) {
        if (!question.correctAnswer.includes(index)) {
          const label = question.mistakeMap[index];
          if (label) {
            mistakeCounts[label] = (mistakeCounts[label] || 0) + 1;
            totalMistakes++;
          }
        }
      }
    }
  }

  // 2. Determine Dominant Mistake
  let dominantMistake: MistakeLabel | null = null;
  let maxCount = 0;
  
  Object.entries(mistakeCounts).forEach(([label, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantMistake = label as MistakeLabel;
    }
  });

  // 3. Determine Secondary Mistake
  let secondaryMistake: MistakeLabel | null = null;
  let secondMax = 0;
  
  Object.entries(mistakeCounts).forEach(([label, count]) => {
    if (label !== dominantMistake && count > secondMax) {
      secondMax = count;
      secondaryMistake = label as MistakeLabel;
    }
  });

  // 4. Determine Phase (Hierarchy)
  let startingPhase: LearningPhase = 0; // Calibration default

  if (totalMistakes === 0) {
    startingPhase = 6; // Test Readiness
  } else if (dominantMistake === 'POLARITY_ERROR' || dominantMistake === 'DOUBLE_NEGATIVE_CONFUSION') {
    startingPhase = 1;
  } else if (dominantMistake === 'INTENSITY_MISMATCH' || dominantMistake === 'PARTIAL_SYNONYM_TRAP') {
    startingPhase = 2;
  } else if (dominantMistake === 'SCOPE_ERROR' || dominantMistake === 'LOGICAL_CONTRADICTION' || dominantMistake === 'CONTEXT_MISREAD') {
    startingPhase = 3;
  } else if (dominantMistake === 'ELIMINATION_FAILURE') {
    startingPhase = 5; // Note: Spec skips Phase 4 mapping in explicit hierarchy, but we can infer.
    // Spec says: ELIMINATION_UNDER_PRESSURE -> Phase 5
  } else {
    // Default fallback
    startingPhase = 1; 
  }

  // 5. Generate User Output
  const summary = generateSummary(startingPhase, dominantMistake, totalMistakes);
  const focusArea = getFocusArea(startingPhase);
  const nextStep = getNextStep(startingPhase);

  // 6. Save Results (Seed User Skills)
  await seedUserSkills(userId, mistakeCounts, startingPhase);

  return {
    dominantMistake,
    secondaryMistake,
    startingLearningPhase: startingPhase,
    summary,
    focusArea,
    nextStep,
    mistakeCounts: mistakeCounts as Record<MistakeLabel, number>
  };
};

function generateSummary(phase: LearningPhase, weakness: MistakeLabel | null, errorCount: number): string {
  if (phase === 6) return "Your diagnostic results are outstanding. You demonstrated strong command over all verbal reasoning components.";
  
  const weaknessName = weakness ? weakness.replace(/_/g, ' ').toLowerCase() : "general consistency";
  return `Based on your diagnostic performance, your primary opportunity for growth lies in ${weaknessName}. While you showed promise in other areas, systematic errors in this category prevented a higher accuracy rate. Addressing this now will provide the highest ROI for your score.`;
}

function getFocusArea(phase: LearningPhase): string {
  switch (phase) {
    case 1: return "Polarity & Direction (Positive/Negative logic)";
    case 2: return "Intensity & Precision (Nuance and Degree)";
    case 3: return "Scope & Logic (Contextual boundaries)";
    case 4: return "Tone & Register";
    case 5: return "Elimination Strategy";
    case 6: return "Advanced Mixed Practice";
    default: return "Foundational Calibration";
  }
}

function getNextStep(phase: LearningPhase): string {
  return `Begin Phase ${phase} of the curriculum. We have unlocked specific drills to target this weakness directly.`;
}

async function seedUserSkills(userId: string, answers: Record<string, number[]>) {
  console.log('[Diagnostic] Seeding user skills based on results...');
  
  const updatePromises: Promise<void>[] = [];

  for (const question of DIAGNOSTIC_QUESTIONS) {
    const userIndices = answers[question.id] || [];
    
    // Check correctness (logic matches analyzeDiagnostic)
    const isCorrect = 
      userIndices.length === question.correctAnswer.length &&
      userIndices.every(i => question.correctAnswer.includes(i));

    if (isCorrect) {
      // If correct, boost the primary skill of the question
      const skillType = CATEGORY_TO_PRIMARY_SKILL[question.primarySkill];
      if (skillType) {
        updatePromises.push(
          updateSkillModel({
            isCorrect: true,
            primarySkill: skillType,
            questionDifficulty: 0 // Neutral difficulty for diagnostic baseline
          })
        );
      }
    } else {
      // If incorrect, penalize the specific mistake made
      let mistakeFound = false;
      
      for (const index of userIndices) {
        if (!question.correctAnswer.includes(index)) {
          const mistakeLabel = question.mistakeMap[index];
          if (mistakeLabel) {
            updatePromises.push(
              updateSkillModel({
                isCorrect: false,
                primarySkill: mistakeLabel as SkillType,
                questionDifficulty: 0
              })
            );
            mistakeFound = true;
          }
        }
      }

      // If no specific mistake map found (fallback), penalize the category
      if (!mistakeFound) {
        const skillType = CATEGORY_TO_PRIMARY_SKILL[question.primarySkill];
        if (skillType) {
          updatePromises.push(
            updateSkillModel({
              isCorrect: false,
              primarySkill: skillType,
              questionDifficulty: 0
            })
          );
        }
      }
    }
  }

  // Execute all updates
  await Promise.all(updatePromises);
  console.log(`[Diagnostic] Seeding complete. Processed ${updatePromises.length} skill updates.`);
}
