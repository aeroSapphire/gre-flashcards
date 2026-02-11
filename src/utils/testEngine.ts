import { Question, QuestionType } from '@/data/questionSchema';
import { BrainMap } from '@/data/brainMapSchema';
import { SKILLS, getSkillsByCategory } from '@/data/skillTaxonomy';
import { getRandomQuestions, getQuestionsForPassage, getQuestionsBySkill } from '@/data/questionBank';
import { updateSkillAfterAnswer } from '@/utils/brainMap';

export interface TestConfig {
  category: QuestionType;
  questionCount: number;
  brainMap: BrainMap;
}

export interface GeneratedTest {
  testId: string;
  category: QuestionType;
  questions: Question[];
  targetDifficulties: number[];
}

export interface TestAnswer {
  questionId: string;
  selectedAnswer: string | string[];
}

export interface TestResult {
  testId: string;
  category: QuestionType;
  date: string;
  answers: {
    questionId: string;
    selectedAnswer: string | string[];
    correct: boolean;
    difficulty: number;
    skills: string[];
  }[];
  score: { correct: number; total: number };
  estimatedGre: number;
  confidenceInterval: number;
  skillBreakdown: Record<string, { seen: number; correct: number }>;
  weakSkills: string[];
  strongSkills: string[];
  trapsFallenFor: string[];
}

// Map question type to skill category
function questionTypeToCategory(type: QuestionType): string {
  switch (type) {
    case 'reading_comprehension': return 'reading_comprehension';
    case 'text_completion': return 'text_completion';
    case 'sentence_equivalence': return 'sentence_equivalence';
  }
}

export async function generateTest(config: TestConfig): Promise<GeneratedTest> {
  const { category, questionCount, brainMap } = config;
  const testId = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Get all skills for this category
  const categoryName = questionTypeToCategory(category);
  const categorySkills = getSkillsByCategory(categoryName as any);
  const skillIds = categorySkills.map(s => s.id);

  // Determine skill distribution based on brain map
  const weakSkills: string[] = [];
  const moderateSkills: string[] = [];
  const strongSkills: string[] = [];

  for (const skillId of skillIds) {
    const mastery = brainMap.skills[skillId]?.mastery || 0;
    if (mastery < 0.5) weakSkills.push(skillId);
    else if (mastery < 0.7) moderateSkills.push(skillId);
    else strongSkills.push(skillId);
  }

  // If no brain map data, treat all as moderate
  const hasData = skillIds.some(id => brainMap.skills[id]?.questionsSeen > 0);

  // Build skill slots
  const skillSlots: string[] = [];
  if (hasData && weakSkills.length > 0) {
    // 40% weak, 30% moderate, 30% strong
    const weakCount = Math.ceil(questionCount * 0.4);
    const modCount = Math.ceil(questionCount * 0.3);
    const strongCount = questionCount - weakCount - modCount;

    for (let i = 0; i < weakCount; i++) {
      skillSlots.push(weakSkills[i % weakSkills.length]);
    }
    const modPool = moderateSkills.length > 0 ? moderateSkills : skillIds;
    for (let i = 0; i < modCount; i++) {
      skillSlots.push(modPool[i % modPool.length]);
    }
    const strongPool = strongSkills.length > 0 ? strongSkills : skillIds;
    for (let i = 0; i < strongCount; i++) {
      skillSlots.push(strongPool[i % strongPool.length]);
    }
  } else {
    // Even distribution
    for (let i = 0; i < questionCount; i++) {
      skillSlots.push(skillIds[i % skillIds.length]);
    }
  }

  // Shuffle skill slots but avoid consecutive same skills
  shuffleWithConstraint(skillSlots);

  // Determine difficulty sequence: start at 3, adapt based on answers
  // Since we don't know answers yet, we'll set target difficulties at generation time
  // and let the test-taking flow handle real-time adaptation
  const targetDifficulties: number[] = [];
  for (let i = 0; i < questionCount; i++) {
    if (i < 2) {
      targetDifficulties.push(3); // Baseline
    } else {
      // Start moderate, vary across the test
      const base = 3;
      const variance = Math.sin(i / questionCount * Math.PI) * 1.5;
      targetDifficulties.push(Math.round(Math.max(1, Math.min(5, base + variance))));
    }
  }

  // Select questions
  const selectedQuestions: Question[] = [];
  const usedIds = new Set<string>();
  const usedPassageIds = new Set<string>();
  const skillCounts: Record<string, number> = {};

  for (let i = 0; i < questionCount; i++) {
    const targetSkill = skillSlots[i];
    const targetDiff = targetDifficulties[i];

    // Check skill count constraint (no skill tested more than 3 times)
    const effectiveSkill = (skillCounts[targetSkill] || 0) >= 3
      ? skillSlots.find(s => (skillCounts[s] || 0) < 3) || targetSkill
      : targetSkill;

    // Try to find a matching question
    let candidates = await getQuestionsBySkill(effectiveSkill, targetDiff);
    candidates = candidates.filter(q => !usedIds.has(q.id));

    // If no exact difficulty match, try ±1
    if (candidates.length === 0) {
      const allForSkill = await getQuestionsBySkill(effectiveSkill);
      candidates = allForSkill
        .filter(q => !usedIds.has(q.id) && Math.abs(q.difficulty - targetDiff) <= 1)
        .sort((a, b) => Math.abs(a.difficulty - targetDiff) - Math.abs(b.difficulty - targetDiff));
    }

    // If still nothing, try any question for this type
    if (candidates.length === 0) {
      candidates = await getRandomQuestions({
        type: category,
        count: 5,
        exclude: [...usedIds]
      });
    }

    if (candidates.length > 0) {
      // Pick a random candidate from top matches
      const pick = candidates[Math.floor(Math.random() * Math.min(3, candidates.length))];
      selectedQuestions.push(pick);
      usedIds.add(pick.id);
      if (pick.passageId) usedPassageIds.add(pick.passageId);
      skillCounts[effectiveSkill] = (skillCounts[effectiveSkill] || 0) + 1;
    }
  }

  return {
    testId,
    category,
    questions: selectedQuestions,
    targetDifficulties: targetDifficulties.slice(0, selectedQuestions.length)
  };
}

function shuffleWithConstraint(arr: string[]): void {
  // Fisher-Yates shuffle then fix consecutive duplicates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  // Fix consecutive duplicates
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] === arr[i - 1]) {
      // Find next different element and swap
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] !== arr[i]) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          break;
        }
      }
    }
  }
}

export function scoreTest(
  test: GeneratedTest,
  answers: TestAnswer[],
  brainMap: BrainMap
): { result: TestResult; updatedBrainMap: BrainMap } {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedAnswer]));
  let updatedBrainMap = { ...brainMap };

  const scoredAnswers: TestResult['answers'] = [];
  const skillBreakdown: Record<string, { seen: number; correct: number }> = {};
  const trapsFallenFor: string[] = [];

  for (const question of test.questions) {
    const selected = answerMap.get(question.id);
    if (!selected) continue;

    // Determine correctness
    let correct: boolean;
    if (Array.isArray(selected)) {
      const correctIds = new Set(question.options.filter(o => o.correct).map(o => o.id));
      const selectedSet = new Set(selected);
      correct = correctIds.size === selectedSet.size && [...correctIds].every(id => selectedSet.has(id));
    } else {
      const correctOption = question.options.find(o => o.correct);
      correct = correctOption?.id === selected;
    }

    scoredAnswers.push({
      questionId: question.id,
      selectedAnswer: selected,
      correct,
      difficulty: question.difficulty,
      skills: question.skills
    });

    // Update skill breakdown
    for (const skillId of question.skills) {
      if (!skillBreakdown[skillId]) skillBreakdown[skillId] = { seen: 0, correct: 0 };
      skillBreakdown[skillId].seen++;
      if (correct) skillBreakdown[skillId].correct++;

      // Update brain map
      updatedBrainMap = updateSkillAfterAnswer(updatedBrainMap, skillId, question.difficulty, correct);
    }

    // Check for traps
    if (!correct && question.trapAnalysis) {
      const selectedId = Array.isArray(selected) ? selected[0] : selected;
      for (const skillId of question.skills) {
        if (skillId.startsWith('TRAP-')) {
          trapsFallenFor.push(skillId);
        }
      }
    }
  }

  // Calculate score
  const totalCorrect = scoredAnswers.filter(a => a.correct).length;
  const totalQuestions = scoredAnswers.length;

  // GRE score estimation
  const estimatedGre = calculateGREEstimate(scoredAnswers);
  const totalTests = brainMap.testHistory.length + 1;
  const confidenceInterval = Math.round(Math.max(2, Math.min(6, 3 / Math.sqrt(totalTests / 2))));

  // Determine weak and strong skills
  const weakSkills = Object.entries(skillBreakdown)
    .filter(([_, data]) => data.seen > 0 && data.correct / data.seen < 0.5)
    .map(([skillId]) => skillId);

  const strongSkillsList = Object.entries(skillBreakdown)
    .filter(([_, data]) => data.seen > 0 && data.correct / data.seen === 1)
    .map(([skillId]) => skillId);

  const result: TestResult = {
    testId: test.testId,
    category: test.category,
    date: new Date().toISOString(),
    answers: scoredAnswers,
    score: { correct: totalCorrect, total: totalQuestions },
    estimatedGre,
    confidenceInterval,
    skillBreakdown,
    weakSkills,
    strongSkills: strongSkillsList,
    trapsFallenFor: [...new Set(trapsFallenFor)]
  };

  return { result, updatedBrainMap };
}

function calculateGREEstimate(answers: TestResult['answers']): number {
  if (answers.length === 0) return 130;

  // θ = sum(difficulty of correct) / sum(all difficulties)
  const totalDifficulty = answers.reduce((sum, a) => sum + a.difficulty, 0);
  const correctDifficulty = answers.filter(a => a.correct).reduce((sum, a) => sum + a.difficulty, 0);

  if (totalDifficulty === 0) return 130;

  const theta = correctDifficulty / totalDifficulty;
  const avgDifficulty = totalDifficulty / answers.length;
  const maxDifficulty = Math.max(...answers.map(a => a.difficulty));

  // Normalize
  const normalizedTheta = theta * (maxDifficulty / Math.max(avgDifficulty, 1));

  // Map to GRE scale
  const greScore = 130 + Math.round(normalizedTheta * 40);
  return Math.max(130, Math.min(170, greScore));
}

// Get recommended next steps based on test result
export function getTestRecommendations(result: TestResult): {
  reviewLessons: string[];
  practiceSkills: string[];
  message: string;
} {
  const reviewLessons = result.weakSkills
    .filter(s => SKILLS[s])
    .slice(0, 3);

  const practiceSkills = result.weakSkills
    .filter(s => SKILLS[s] && !s.startsWith('TRAP-'))
    .slice(0, 2);

  let message: string;
  const accuracy = result.score.total > 0 ? result.score.correct / result.score.total : 0;

  if (accuracy >= 0.9) {
    message = "Excellent work! You're performing at a high level. Consider increasing difficulty.";
  } else if (accuracy >= 0.7) {
    message = "Good performance! Focus on your weak areas to push your score higher.";
  } else if (accuracy >= 0.5) {
    message = "Decent start. Review the lessons for your weak skills and practice more.";
  } else {
    message = "Consider reviewing the pattern lessons before taking more tests. Focus on understanding the core patterns.";
  }

  return { reviewLessons, practiceSkills, message };
}
