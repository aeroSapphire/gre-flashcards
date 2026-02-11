import { Question, Passage, QuestionType } from '@/data/questionSchema';
import { SKILLS } from '@/data/skillTaxonomy';

// Lazy-loaded question data
let tcQuestions: Question[] | null = null;
let seQuestions: Question[] | null = null;
let rcData: { passages: Passage[]; questions: Question[] } | null = null;

async function loadTC(): Promise<Question[]> {
  if (!tcQuestions) {
    const data = await import('./text_completion.json');
    tcQuestions = (data.default || data) as Question[];
  }
  return tcQuestions;
}

async function loadSE(): Promise<Question[]> {
  if (!seQuestions) {
    const data = await import('./sentence_equivalence.json');
    seQuestions = (data.default || data) as Question[];
  }
  return seQuestions;
}

async function loadRC(): Promise<{ passages: Passage[]; questions: Question[] }> {
  if (!rcData) {
    const data = await import('./reading_comprehension.json');
    rcData = (data.default || data) as { passages: Passage[]; questions: Question[] };
  }
  return rcData;
}

export async function getAllQuestions(): Promise<Question[]> {
  const [tc, se, rc] = await Promise.all([loadTC(), loadSE(), loadRC()]);
  return [...tc, ...se, ...rc.questions];
}

export async function getAllPassages(): Promise<Passage[]> {
  const rc = await loadRC();
  return rc.passages;
}

export async function getPassageById(passageId: string): Promise<Passage | null> {
  const passages = await getAllPassages();
  return passages.find(p => p.id === passageId) || null;
}

export async function getQuestionsBySkill(skillId: string, difficulty?: number): Promise<Question[]> {
  const all = await getAllQuestions();
  return all.filter(q => {
    const matchSkill = q.skills.includes(skillId);
    const matchDiff = difficulty === undefined || q.difficulty === difficulty;
    return matchSkill && matchDiff;
  });
}

export async function getQuestionsByType(type: QuestionType): Promise<Question[]> {
  switch (type) {
    case 'text_completion': return loadTC();
    case 'sentence_equivalence': return loadSE();
    case 'reading_comprehension': {
      const rc = await loadRC();
      return rc.questions;
    }
  }
}

export async function getQuestionsByDifficulty(difficulty: number): Promise<Question[]> {
  const all = await getAllQuestions();
  return all.filter(q => q.difficulty === difficulty);
}

export async function getRandomQuestions(filters: {
  type?: QuestionType;
  skills?: string[];
  difficulty?: number;
  difficultyRange?: [number, number];
  count: number;
  exclude?: string[];
}): Promise<Question[]> {
  let pool = await getAllQuestions();

  if (filters.type) {
    pool = pool.filter(q => q.type === filters.type);
  }
  if (filters.skills && filters.skills.length > 0) {
    pool = pool.filter(q => q.skills.some(s => filters.skills!.includes(s)));
  }
  if (filters.difficulty !== undefined) {
    pool = pool.filter(q => q.difficulty === filters.difficulty);
  }
  if (filters.difficultyRange) {
    const [min, max] = filters.difficultyRange;
    pool = pool.filter(q => q.difficulty >= min && q.difficulty <= max);
  }
  if (filters.exclude && filters.exclude.length > 0) {
    const excludeSet = new Set(filters.exclude);
    pool = pool.filter(q => !excludeSet.has(q.id));
  }

  // Fisher-Yates shuffle
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, filters.count);
}

export async function getQuestionById(id: string): Promise<Question | null> {
  const all = await getAllQuestions();
  return all.find(q => q.id === id) || null;
}

// Get questions grouped by passage (for RC)
export async function getQuestionsForPassage(passageId: string): Promise<Question[]> {
  const rc = await loadRC();
  return rc.questions.filter(q => q.passageId === passageId);
}

// Validation utility
export async function validateQuestionBank(): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const all = await getAllQuestions();
  const ids = new Set<string>();

  for (const q of all) {
    // Unique IDs
    if (ids.has(q.id)) {
      errors.push(`Duplicate ID: ${q.id}`);
    }
    ids.add(q.id);

    // Valid skill IDs
    for (const skillId of q.skills) {
      if (!SKILLS[skillId]) {
        errors.push(`Unknown skill ${skillId} in question ${q.id}`);
      }
    }

    // Valid difficulty
    if (q.difficulty < 1 || q.difficulty > 5) {
      errors.push(`Invalid difficulty ${q.difficulty} for ${q.id}`);
    }

    // Correct count
    const correctOptions = q.options.filter(o => o.correct).length;
    if (q.type === 'sentence_equivalence' && correctOptions !== 2) {
      errors.push(`SE question ${q.id} has ${correctOptions} correct options (expected 2)`);
    }
    if (q.type !== 'sentence_equivalence' && correctOptions !== 1) {
      // For multi-blank TC, each blank group has 1 correct, so total can be > 1
      if (q.blanks <= 1 && correctOptions !== 1) {
        errors.push(`Question ${q.id} has ${correctOptions} correct options (expected 1)`);
      }
    }

    // Has explanation
    if (!q.explanation) {
      errors.push(`Missing explanation for ${q.id}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// Get stats about the question bank
export async function getQuestionBankStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byDifficulty: Record<number, number>;
  bySkill: Record<string, number>;
}> {
  const all = await getAllQuestions();
  const byType: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};
  const bySkill: Record<string, number> = {};

  for (const q of all) {
    byType[q.type] = (byType[q.type] || 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] || 0) + 1;
    for (const skill of q.skills) {
      bySkill[skill] = (bySkill[skill] || 0) + 1;
    }
  }

  return { total: all.length, byType, byDifficulty, bySkill };
}
