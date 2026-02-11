export type QuestionType = "reading_comprehension" | "text_completion" | "sentence_equivalence";

export interface AnswerOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface BlankOptions {
  blankIndex: number;
  options: AnswerOption[];
}

export interface Question {
  id: string;
  type: QuestionType;
  skills: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  passage: string | null;
  passageId?: string;
  stem: string;
  blanks: number;
  options: AnswerOption[];
  blankOptions?: BlankOptions[];
  correctCount: number;
  explanation: string;
  skillExplanation: Record<string, string>;
  trapAnalysis: Record<string, string>;
  tags: string[];
}

export interface Passage {
  id: string;
  text: string;
  structure: "general_specific" | "common_view_challenge" | "phenomenon_explanations" | "claim_concession_rebuttal" | "old_view_modification";
  topic: string;
  wordCount: number;
  questionIds: string[];
}
