import { Question } from '@/data/questionSchema';
import { BrainMap } from '@/data/brainMapSchema';
import { getRandomQuestions } from '@/data/questionBank';
import { updateSkillAfterAnswer } from '@/utils/brainMap';

export interface PracticeSession {
  skillId: string;
  currentDifficulty: number;
  questionsAnswered: string[];
  correctCount: number;
  currentStreak: number;
  sessionHistory: { questionId: string; correct: boolean; difficulty: number; selectedAnswer: string | string[] }[];
}

export function startPracticeSession(skillId: string, brainMap: BrainMap): PracticeSession {
  const skill = brainMap.skills[skillId];
  const startDifficulty = skill && skill.questionsSeen > 0 ? skill.currentDifficulty : 2.0;

  return {
    skillId,
    currentDifficulty: startDifficulty,
    questionsAnswered: [],
    correctCount: 0,
    currentStreak: 0,
    sessionHistory: []
  };
}

export async function getNextPracticeQuestion(
  session: PracticeSession,
  excludeIds?: string[]
): Promise<Question | null> {
  const targetDiff = Math.round(session.currentDifficulty);
  const allExcluded = [...session.questionsAnswered, ...(excludeIds || [])];

  // Try exact difficulty match first
  let questions = await getRandomQuestions({
    skills: [session.skillId],
    difficulty: targetDiff,
    count: 1,
    exclude: allExcluded
  });

  // If no exact match, try ±1 range
  if (questions.length === 0) {
    const minDiff = Math.max(1, targetDiff - 1);
    const maxDiff = Math.min(5, targetDiff + 1);
    questions = await getRandomQuestions({
      skills: [session.skillId],
      difficultyRange: [minDiff, maxDiff],
      count: 1,
      exclude: allExcluded
    });
  }

  // If still nothing, try any difficulty for this skill
  if (questions.length === 0) {
    questions = await getRandomQuestions({
      skills: [session.skillId],
      count: 1,
      exclude: allExcluded
    });
  }

  return questions[0] || null;
}

export interface PracticeAnswerResult {
  correct: boolean;
  updatedSession: PracticeSession;
  updatedBrainMap: BrainMap;
  question: Question;
}

export function submitPracticeAnswer(
  session: PracticeSession,
  question: Question,
  selectedAnswer: string | string[],
  brainMap: BrainMap
): PracticeAnswerResult {
  // Determine correctness
  let correct: boolean;
  if (Array.isArray(selectedAnswer)) {
    // SE or multi-select: all correct options must be selected
    const correctIds = new Set(question.options.filter(o => o.correct).map(o => o.id));
    const selectedSet = new Set(selectedAnswer);
    correct = correctIds.size === selectedSet.size && [...correctIds].every(id => selectedSet.has(id));
  } else {
    const correctOption = question.options.find(o => o.correct);
    correct = correctOption?.id === selectedAnswer;
  }

  // Update session
  const updatedSession: PracticeSession = {
    ...session,
    questionsAnswered: [...session.questionsAnswered, question.id],
    correctCount: session.correctCount + (correct ? 1 : 0),
    currentStreak: correct ? session.currentStreak + 1 : 0,
    sessionHistory: [
      ...session.sessionHistory,
      { questionId: question.id, correct, difficulty: question.difficulty, selectedAnswer }
    ]
  };

  // Adjust difficulty
  if (correct) {
    updatedSession.currentDifficulty = Math.min(5.0, session.currentDifficulty + 0.5);
  } else {
    updatedSession.currentDifficulty = Math.max(1.0, session.currentDifficulty - 0.5);
  }

  // Update brain map for primary skill
  let updatedBrainMap = brainMap;
  for (const skillId of question.skills) {
    updatedBrainMap = updateSkillAfterAnswer(updatedBrainMap, skillId, question.difficulty, correct);
  }

  return { correct, updatedSession, updatedBrainMap, question };
}

export interface PracticeSessionSummary {
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  maxStreak: number;
  difficultyProgression: number[];
  skillId: string;
  masteryBefore: number;
  masteryAfter: number;
  shouldReviewLesson: boolean;
}

export function getPracticeSessionSummary(
  session: PracticeSession,
  brainMapBefore: BrainMap,
  brainMapAfter: BrainMap
): PracticeSessionSummary {
  const totalQuestions = session.sessionHistory.length;
  const accuracy = totalQuestions > 0 ? session.correctCount / totalQuestions : 0;

  // Calculate max streak
  let maxStreak = 0;
  let currentStreak = 0;
  for (const entry of session.sessionHistory) {
    if (entry.correct) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Difficulty progression
  const difficultyProgression = session.sessionHistory.map(h => h.difficulty);

  // Mastery change
  const masteryBefore = brainMapBefore.skills[session.skillId]?.mastery || 0;
  const masteryAfter = brainMapAfter.skills[session.skillId]?.mastery || 0;

  // Check for 3+ consecutive incorrect → suggest lesson review
  let consecutiveWrong = 0;
  let shouldReviewLesson = false;
  for (const entry of session.sessionHistory) {
    if (!entry.correct) {
      consecutiveWrong++;
      if (consecutiveWrong >= 3) {
        shouldReviewLesson = true;
        break;
      }
    } else {
      consecutiveWrong = 0;
    }
  }

  return {
    totalQuestions,
    correctCount: session.correctCount,
    accuracy,
    maxStreak,
    difficultyProgression,
    skillId: session.skillId,
    masteryBefore,
    masteryAfter,
    shouldReviewLesson
  };
}
