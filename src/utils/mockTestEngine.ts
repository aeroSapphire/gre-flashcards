import { Question, QuestionType } from '@/data/questionSchema';
import { BrainMap } from '@/data/brainMapSchema';
import { getRandomQuestions, getAllQuestions, getQuestionsForPassage, getAllPassages } from '@/data/questionBank';
import { updateSkillAfterAnswer, updateTrapProfile } from '@/utils/brainMap';
import { calculateMockTestScore, getSection2Tier, ScoreEstimate } from '@/utils/scoreEstimation';
import { SKILLS } from '@/data/skillTaxonomy';

export interface MockTestSection {
  sectionNumber: 1 | 2;
  questions: Question[];
  difficultyTier: 'standard' | 'hard' | 'easy';
}

export interface MockTest {
  testId: string;
  sections: [MockTestSection, MockTestSection];
  createdAt: string;
}

export interface MockTestAnswer {
  questionId: string;
  selectedAnswer: string | string[];
}

export interface MockTestResult {
  testId: string;
  date: string;
  sections: {
    sectionNumber: number;
    correct: number;
    total: number;
    difficultyTier: string;
  }[];
  totalCorrect: number;
  totalQuestions: number;
  scoreEstimate: ScoreEstimate;
  skillBreakdown: Record<string, { seen: number; correct: number }>;
  weakSkills: string[];
  strongSkills: string[];
  trapsFallenFor: string[];
  answers: {
    questionId: string;
    selectedAnswer: string | string[];
    correct: boolean;
    difficulty: number;
    skills: string[];
    sectionNumber: number;
  }[];
}

/**
 * Generate a mock test with 2 sections of 20 questions each.
 * Section distribution per section: 6 RC, 8 TC, 6 SE
 * Section 2 difficulty adapts based on section 1 performance.
 */
export async function generateMockTest(brainMap: BrainMap): Promise<MockTest> {
  const testId = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const allQuestions = await getAllQuestions();

  // Section 1: standard difficulty (baseline)
  const section1Questions = await selectSectionQuestions(allQuestions, 3, new Set(), brainMap);

  return {
    testId,
    sections: [
      { sectionNumber: 1, questions: section1Questions, difficultyTier: 'standard' },
      // Section 2 will be generated after section 1 is scored
      { sectionNumber: 2, questions: [], difficultyTier: 'standard' },
    ],
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate section 2 based on section 1 performance
 */
export async function generateSection2(
  mockTest: MockTest,
  section1Answers: MockTestAnswer[],
  brainMap: BrainMap
): Promise<MockTest> {
  const section1Questions = mockTest.sections[0].questions;
  const section1Correct = scoreSection(section1Questions, section1Answers);
  const tier = getSection2Tier(section1Correct, section1Questions.length);

  // Determine difficulty level based on tier
  const targetDifficulty = tier === 'hard' ? 4 : tier === 'easy' ? 2 : 3;

  // Exclude section 1 question IDs
  const usedIds = new Set(section1Questions.map(q => q.id));
  const allQuestions = await getAllQuestions();
  const section2Questions = await selectSectionQuestions(allQuestions, targetDifficulty, usedIds, brainMap);

  return {
    ...mockTest,
    sections: [
      mockTest.sections[0],
      { sectionNumber: 2, questions: section2Questions, difficultyTier: tier },
    ],
  };
}

async function selectSectionQuestions(
  allQuestions: Question[],
  targetDifficulty: number,
  excludeIds: Set<string>,
  brainMap: BrainMap
): Promise<Question[]> {
  const available = allQuestions.filter(q => !excludeIds.has(q.id));

  // Target: 6 RC, 8 TC, 6 SE = 20 questions
  const targets: { type: QuestionType; count: number }[] = [
    { type: 'reading_comprehension', count: 6 },
    { type: 'text_completion', count: 8 },
    { type: 'sentence_equivalence', count: 6 },
  ];

  const selected: Question[] = [];
  const usedIds = new Set(excludeIds);
  const usedPassageIds = new Set<string>();

  for (const target of targets) {
    const typeQuestions = available
      .filter(q => q.type === target.type && !usedIds.has(q.id));

    if (target.type === 'reading_comprehension') {
      // For RC, group by passage and select complete passage groups
      const passages = await getAllPassages();
      const passageGroups = new Map<string, Question[]>();

      for (const q of typeQuestions) {
        if (q.passageId && !usedPassageIds.has(q.passageId)) {
          if (!passageGroups.has(q.passageId)) {
            passageGroups.set(q.passageId, []);
          }
          passageGroups.get(q.passageId)!.push(q);
        }
      }

      // Select passages to fill RC quota
      let rcCount = 0;
      const passageEntries = [...passageGroups.entries()]
        .sort(() => Math.random() - 0.5); // Shuffle

      for (const [passageId, questions] of passageEntries) {
        if (rcCount >= target.count) break;

        // Sort questions by difficulty proximity to target
        const sorted = questions
          .sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty));

        const toTake = Math.min(sorted.length, target.count - rcCount, 3); // Max 3 per passage
        for (let i = 0; i < toTake; i++) {
          selected.push(sorted[i]);
          usedIds.add(sorted[i].id);
          rcCount++;
        }
        usedPassageIds.add(passageId);
      }

      // If not enough RC from passages, add standalone RC
      if (rcCount < target.count) {
        const standalone = typeQuestions
          .filter(q => !usedIds.has(q.id))
          .sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty));
        for (let i = 0; i < Math.min(standalone.length, target.count - rcCount); i++) {
          selected.push(standalone[i]);
          usedIds.add(standalone[i].id);
        }
      }
    } else {
      // For TC and SE, select by difficulty proximity
      const sorted = typeQuestions
        .sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty));

      // Add some randomness - pick from top candidates
      const candidates = sorted.slice(0, Math.max(target.count * 2, sorted.length));
      const shuffled = candidates.sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(shuffled.length, target.count); i++) {
        selected.push(shuffled[i]);
        usedIds.add(shuffled[i].id);
      }
    }
  }

  // Shuffle the final selection (but keep RC passage groups together)
  return shuffleKeepingPassageGroups(selected);
}

function shuffleKeepingPassageGroups(questions: Question[]): Question[] {
  // Group RC questions by passage
  const rcGroups: Map<string, Question[]> = new Map();
  const nonRc: Question[] = [];

  for (const q of questions) {
    if (q.passageId) {
      if (!rcGroups.has(q.passageId)) rcGroups.set(q.passageId, []);
      rcGroups.get(q.passageId)!.push(q);
    } else {
      nonRc.push(q);
    }
  }

  // Create blocks: each RC passage group is a block, each non-RC is individual
  const blocks: Question[][] = [];
  for (const group of rcGroups.values()) {
    blocks.push(group);
  }
  for (const q of nonRc) {
    blocks.push([q]);
  }

  // Shuffle blocks
  for (let i = blocks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
  }

  return blocks.flat();
}

function scoreSection(questions: Question[], answers: MockTestAnswer[]): number {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selectedAnswer]));
  let correct = 0;

  for (const q of questions) {
    const selected = answerMap.get(q.id);
    if (!selected) continue;

    if (Array.isArray(selected)) {
      const correctIds = new Set(q.options.filter(o => o.correct).map(o => o.id));
      const selectedSet = new Set(selected);
      if (correctIds.size === selectedSet.size && [...correctIds].every(id => selectedSet.has(id))) {
        correct++;
      }
    } else {
      const correctOption = q.options.find(o => o.correct);
      if (correctOption?.id === selected) correct++;
    }
  }

  return correct;
}

export function scoreMockTest(
  mockTest: MockTest,
  section1Answers: MockTestAnswer[],
  section2Answers: MockTestAnswer[],
  brainMap: BrainMap
): { result: MockTestResult; updatedBrainMap: BrainMap } {
  const allAnswers = [...section1Answers, ...section2Answers];
  const allQuestions = [...mockTest.sections[0].questions, ...mockTest.sections[1].questions];
  const answerMap = new Map(allAnswers.map(a => [a.questionId, a.selectedAnswer]));

  let updatedBrainMap = { ...brainMap };
  const scoredAnswers: MockTestResult['answers'] = [];
  const skillBreakdown: Record<string, { seen: number; correct: number }> = {};
  const trapsFallenFor: string[] = [];

  for (const [sectionIdx, section] of mockTest.sections.entries()) {
    for (const question of section.questions) {
      const selected = answerMap.get(question.id);
      if (!selected) continue;

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
        skills: question.skills,
        sectionNumber: section.sectionNumber,
      });

      // Update skill breakdown
      for (const skillId of question.skills) {
        if (!skillBreakdown[skillId]) skillBreakdown[skillId] = { seen: 0, correct: 0 };
        skillBreakdown[skillId].seen++;
        if (correct) skillBreakdown[skillId].correct++;

        updatedBrainMap = updateSkillAfterAnswer(updatedBrainMap, skillId, question.difficulty, correct);
      }

      // Track traps
      if (!correct) {
        for (const skillId of question.skills) {
          if (skillId.startsWith('TRAP-')) {
            trapsFallenFor.push(skillId);
            updatedBrainMap = updateTrapProfile(updatedBrainMap, skillId, true);
          }
        }
      }
    }
  }

  const section1Correct = scoreSection(mockTest.sections[0].questions, section1Answers);
  const section2Correct = scoreSection(mockTest.sections[1].questions, section2Answers);

  const scoreEstimate = calculateMockTestScore({
    section1Correct,
    section1Total: mockTest.sections[0].questions.length,
    section2Correct,
    section2Total: mockTest.sections[1].questions.length,
    section2Tier: mockTest.sections[1].difficultyTier,
  });

  const weakSkills = Object.entries(skillBreakdown)
    .filter(([_, d]) => d.seen > 0 && d.correct / d.seen < 0.5)
    .map(([id]) => id);

  const strongSkills = Object.entries(skillBreakdown)
    .filter(([_, d]) => d.seen > 0 && d.correct / d.seen >= 0.8)
    .map(([id]) => id);

  const result: MockTestResult = {
    testId: mockTest.testId,
    date: new Date().toISOString(),
    sections: [
      { sectionNumber: 1, correct: section1Correct, total: mockTest.sections[0].questions.length, difficultyTier: mockTest.sections[0].difficultyTier },
      { sectionNumber: 2, correct: section2Correct, total: mockTest.sections[1].questions.length, difficultyTier: mockTest.sections[1].difficultyTier },
    ],
    totalCorrect: section1Correct + section2Correct,
    totalQuestions: mockTest.sections[0].questions.length + mockTest.sections[1].questions.length,
    scoreEstimate,
    skillBreakdown,
    weakSkills,
    strongSkills,
    trapsFallenFor: [...new Set(trapsFallenFor)],
    answers: scoredAnswers,
  };

  return { result, updatedBrainMap };
}
