// Named Mock Test Types
// Supports full GRE practice tests from various sources (Barron's, ETS, etc.)

export type VerbalQuestionType =
  | 'text_completion'
  | 'sentence_equivalence'
  | 'reading_comprehension';

export type QuantQuestionType =
  | 'quantitative_comparison'
  | 'multiple_choice_single'
  | 'multiple_choice_multi'
  | 'numeric_entry'
  | 'data_interpretation';

export type SectionType = 'verbal' | 'quantitative' | 'analytical_writing';

export type QuestionType = VerbalQuestionType | QuantQuestionType | 'analytical_writing';

export interface MockTestQuestion {
  id: string;
  type: QuestionType;

  // Shared
  stem: string;
  correctAnswer: string | string[];
  explanation: string;

  // Verbal: passages
  passage?: string;
  passageId?: string;

  // TC: blank options
  blanks?: number;
  options?: string[];
  blankOptions?: { blankIndex: number; options: string[] }[];

  // SE / select-all: how many to select
  selectCount?: number | 'all';

  // QC fields
  condition?: string;
  quantityA?: string;
  quantityB?: string;

  // Data Interpretation
  dataDescription?: string;

  // AW
  prompt?: string;
  directions?: string;
}

export interface MockTestSection {
  id: string;
  sectionNumber: number;
  type: SectionType;
  name: string;
  timeMinutes: number;
  questionCount: number;
  questions: MockTestQuestion[];
}

export interface NamedMockTest {
  id: string;
  name: string;
  source: string;
  sourceShort: string;
  description: string;
  sectionCount: number;
  totalTimeMinutes: number;
  /** GRE format: old (5 sections, pre Sep 2023) or new (shorter) */
  format: 'old' | 'new';
  sections: MockTestSection[];
}

export interface MockTestRegistryEntry {
  id: string;
  name: string;
  source: string;
  sourceShort: string;
  description: string;
  sectionCount: number;
  totalTimeMinutes: number;
  format: 'old' | 'new';
  questionCount: number;
  load: () => Promise<NamedMockTest>;
}
