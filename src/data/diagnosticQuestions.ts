import { MistakeLabel } from '@/utils/mistakeClassifier';

export type QuestionType = 'TC' | 'SE' | 'RC';
export type SkillCategory = 'Polarity & Direction' | 'Intensity & Precision' | 'Scope & Logic' | 'Elimination Skill' | 'Mixed Stress & Switching';

export interface DiagnosticQuestion {
  id: string;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswer: number[]; // Indices
  primarySkill: SkillCategory;
  mistakeMap: Record<number, MistakeLabel>; // Map wrong answers to specific mistakes
  explanation: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 1. Polarity & Direction (TC - Medium)
  {
    id: 'diag_001',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Although the reviewer praised the study’s design, she concluded that the data were __________ about its practical implications.",
    options: ["sanguine", "dismissive", "equivocal", "laudatory", "categorical"],
    correctAnswer: [2], // C. equivocal
    mistakeMap: {
      0: 'POLARITY_ERROR', // sanguine (positive)
      1: 'INTENSITY_MISMATCH', // dismissive (too negative/strong)
      3: 'POLARITY_ERROR', // laudatory (positive)
      4: 'INTENSITY_MISMATCH' // categorical (too absolute)
    },
    explanation: "The sentence contrasts praise for design with a reservation about implications. 'Equivocal' (ambiguous/uncertain) captures this reservation appropriately without being overtly hostile."
  },
  // 2. Polarity & Direction (SE - Medium)
  {
    id: 'diag_002',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The editorial’s tone was unexpectedly ________, considering the magazine’s customary optimism.",
    options: ["affirmative", "jaded", "buoyant", "hostile", "resigned", "sanguine"],
    correctAnswer: [1, 4], // B. jaded, E. resigned
    mistakeMap: {
      0: 'POLARITY_ERROR', // affirmative (positive)
      2: 'POLARITY_ERROR', // buoyant (positive)
      3: 'INTENSITY_MISMATCH', // hostile (too strong/aggressive compared to jaded/resigned)
      5: 'POLARITY_ERROR' // sanguine (positive)
    },
    explanation: "'Unexpectedly' signals a contrast with 'customary optimism'. We need negative/pessimistic words. 'Jaded' and 'Resigned' both imply a lack of optimism/weariness."
  },
  // 3. Polarity & Direction (TC - Hard)
  {
    id: 'diag_003',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "The consultant’s assessment, though punctilious about method, was __________ in its final recommendations.",
    options: ["tepid", "categorical", "complacent", "trenchant", "equivocal"],
    correctAnswer: [0], // A. tepid
    mistakeMap: {
      1: 'POLARITY_ERROR', // categorical (strong/absolute)
      2: 'CONTEXT_MISREAD', // complacent (unrelated to strength of recommendation)
      3: 'POLARITY_ERROR', // trenchant (strong/cutting)
      4: 'PARTIAL_SYNONYM_TRAP' // equivocal (close, but tepid implies weak support, fitting the context better than just ambiguous)
    },
    explanation: "The contrast 'though punctilious' (careful/precise) implies the recommendations were weak or lacking force. 'Tepid' means unenthusiastic. 'Equivocal' is tempting but 'Tepid' is the better fit for weak recommendations."
  },
  // 4. Polarity & Direction (SE - Medium)
  {
    id: 'diag_004',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The professor’s remarks were unexpectedly ________ for someone known for rhetorical restraint.",
    options: ["incisive", "restrained", "measured", "inflammatory", "temperate", "severe"],
    correctAnswer: [0, 5], // A. incisive, F. severe
    mistakeMap: {
      1: 'POLARITY_ERROR', // restrained (synonym of restraint)
      2: 'POLARITY_ERROR', // measured (synonym)
      3: 'INTENSITY_MISMATCH', // inflammatory (too extreme?)
      4: 'POLARITY_ERROR' // temperate (synonym)
    },
    explanation: "Contrast with 'restraint' requires words indicating lack of restraint or sharpness/harshness. 'Incisive' (cutting) and 'Severe' (harsh) fit well as a pair indicating a departure from restraint."
  },
  // 5. Polarity & Direction (TC - Medium)
  {
    id: 'diag_005',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Although the candidate’s evidence was superficially __________, closer inspection revealed numerous logical gaps.",
    options: ["cogent", "persuasive", "compelling", "cursory", "rigorous"],
    correctAnswer: [1], // B. persuasive
    mistakeMap: {
      0: 'PARTIAL_SYNONYM_TRAP', // cogent (means valid/convincing - if it has gaps, it wasn't cogent, even superficially? Or maybe it appeared cogent. Hard trap.)
      2: 'PARTIAL_SYNONYM_TRAP', // compelling
      3: 'POLARITY_ERROR', // cursory (negative)
      4: 'PARTIAL_SYNONYM_TRAP' // rigorous
    },
    explanation: "The evidence looked good ('superficially ___') but had gaps. We need a word for 'convincing/good'. 'Persuasive' fits. 'Cogent' implies logical validity, which it lacked."
  }
  // Note: Only 5 questions were visible in the provided content. 
  // Please provide the full list of 40 questions to complete the implementation.
];
