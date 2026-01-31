
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
  // 1. Polarity & Direction (TC)
  {
    id: 'diag_001',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Although the professor's lectures were often ______, her students found the syllabus remarkably clear and structured.",
    options: ["lucid", "convoluted", "abbreviated", "transparent", "methodical"],
    correctAnswer: [1], // convoluted
    mistakeMap: {
      0: 'POLARITY_ERROR', // lucid (opposite)
      2: 'CONTEXT_MISREAD', // abbreviated (unrelated)
      3: 'POLARITY_ERROR', // transparent (opposite)
      4: 'POLARITY_ERROR' // methodical (opposite)
    },
    explanation: "The word 'Although' signals a contrast. If the syllabus was 'clear', the lectures must have been the opposite (confusing/unclear). 'Convoluted' fits best."
  },
  // 2. Intensity & Precision (SE)
  {
    id: 'diag_002',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The CEO's response to the crisis was not merely ______, but strictly negligent, leading to immediate calls for her resignation.",
    options: ["careless", "inadequate", "malicious", "unintentional", "lax", "sufficient"],
    correctAnswer: [0, 4], // careless, lax
    mistakeMap: {
      1: 'INTENSITY_MISMATCH', // inadequate (too weak compared to negligent)
      2: 'CONTEXT_MISREAD', // malicious (wrong direction - intent vs negligence)
      3: 'LOGICAL_CONTRADICTION', // unintentional (doesn't fit structure)
      5: 'POLARITY_ERROR' // sufficient (opposite)
    },
    explanation: "The structure 'not merely X, but Y' implies Y is a stronger version of X. 'Negligent' is strong; we need words meaning 'lacking care' but perhaps slightly softer. 'Careless' and 'Lax' fit."
  },
  // 3. Scope & Logic (RC/TC)
  {
    id: 'diag_003',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "While historical accounts of the event are ______, they generally agree on the timeline of major occurrences.",
    options: ["unanimous", "disparate", "identical", "consistent", "complementary"],
    correctAnswer: [1], // disparate
    mistakeMap: {
      0: 'LOGICAL_CONTRADICTION', // unanimous (contradicts 'While... agree on timeline' implies disagreement elsewhere)
      2: 'LOGICAL_CONTRADICTION', // identical
      3: 'LOGICAL_CONTRADICTION', // consistent
      4: 'SCOPE_ERROR' // complementary (unsupported inference)
    },
    explanation: "'While' implies a contrast. They agree on the timeline, so they must DISAGREE or be different in other aspects. 'Disparate' (different/divergent) fits."
  },
  // 4. Elimination Skill (SE)
  {
    id: 'diag_004',
    type: 'SE',
    primarySkill: 'Elimination Skill',
    content: "The diplomatic talks were ______, producing no tangible results despite weeks of negotiation.",
    options: ["fruitless", "acrimonious", "futile", "cordial", "protracted", "brief"],
    correctAnswer: [0, 2], // fruitless, futile
    mistakeMap: {
      1: 'ELIMINATION_FAILURE', // acrimonious (plausible but unsupported tone)
      3: 'ELIMINATION_FAILURE', // cordial (opposite of 'no results'? No, implies process. But 'no results' is the key.)
      4: 'PARTIAL_SYNONYM_TRAP', // protracted (true they were weeks long, but doesn't mean 'no results')
      5: 'LOGICAL_CONTRADICTION' // brief (contradicts 'weeks')
    },
    explanation: "The clue is 'producing no tangible results'. We need synonyms for ineffective/useless. 'Fruitless' and 'Futile' are the pair."
  },
  // 5. Mixed Stress (TC - Double Blank)
  {
    id: 'diag_005',
    type: 'TC', // Treated as TC for simplicity here, normally double blank
    primarySkill: 'Mixed Stress & Switching',
    content: "The novel's protagonist is (i)______ character, appearing initially as a villain but revealed to be (ii)______ by the final chapter. [Select two: 1 from A-C, 1 from D-F]",
    options: ["an ambiguous", "a malevolent", "a straightforward", "misunderstood", "corrupt", "immutable"],
    correctAnswer: [0, 3], // ambiguous, misunderstood (Simplified for this format)
    mistakeMap: {
      1: 'CONTEXT_MISREAD',
      2: 'POLARITY_ERROR',
      4: 'LOGICAL_CONTRADICTION',
      5: 'SCOPE_ERROR'
    },
    explanation: "If he shifts from villain to something else, he is 'ambiguous' or complex. If he was a villain but isn't, he was likely 'misunderstood'."
  },
  // 6. Polarity & Direction (TC)
  {
    id: 'diag_006',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Far from being ______, the committee's decision was actually quite predictable given their previous conservative rulings.",
    options: ["capricious", "foreseeable", "rational", "calculated", "unprecedented"],
    correctAnswer: [0], // capricious (unpredictable)
    mistakeMap: {
      1: 'POLARITY_ERROR', // foreseeable (synonym trap)
      2: 'CONTEXT_MISREAD', // rational (unrelated)
      3: 'CONTEXT_MISREAD', // calculated (unrelated)
      4: 'POLARITY_ERROR' // unprecedented (synonym for capricious roughly, but context implies predictable) -> Wait, unprecedented means never happened. Predictable means happened before. Unprecedented is similar to capricious in "surprise". But "Far from being X... was predictable". So X must be "unpredictable". Capricious fits well. Unprecedented fits too? "Far from being unprecedented..." = it was precedented. Predictable. Hmm. Capricious focuses on the *nature* of the decision making (whim), predictable focuses on the outcome. "Conservative rulings" implies consistency. Capricious (inconsistent) is the best contrast.
    },
    explanation: "'Far from being X' means X is the opposite of 'predictable'. Capricious (impulsive/unpredictable) is the best fit."
  },
  // 7. Intensity & Precision (SE)
  {
    id: 'diag_007',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The proposal was not merely ______, but positively dangerous to the long-term stability of the region.",
    options: ["imprudent", "catastrophic", "beneficial", "ill-advised", "neutral", "essential"],
    correctAnswer: [0, 3], // imprudent, ill-advised
    mistakeMap: {
      1: 'INTENSITY_MISMATCH', // catastrophic (too strong, equals dangerous)
      2: 'POLARITY_ERROR', // beneficial (opposite)
      4: 'INTENSITY_MISMATCH', // neutral (too weak)
      5: 'POLARITY_ERROR' // essential (opposite)
    },
    explanation: "'Not merely X but Y' implies Y is stronger than X. Dangerous is the strong word. We need something negative but weaker than dangerous. Imprudent/Ill-advised fit."
  },
  // 8. Scope & Logic (TC)
  {
    id: 'diag_008',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "Given the ______ nature of the evidence, the jury could not reach a definitive verdict, resulting in a mistrial.",
    options: ["ambiguous", "comprehensive", "irrefutable", "circumstantial", "corroborated"],
    correctAnswer: [0], // ambiguous
    mistakeMap: {
      1: 'LOGICAL_CONTRADICTION', // comprehensive (would lead to verdict)
      2: 'LOGICAL_CONTRADICTION', // irrefutable (would lead to verdict)
      3: 'SCOPE_ERROR', // circumstantial (circumstantial evidence CAN lead to verdict, ambiguous cannot)
      4: 'LOGICAL_CONTRADICTION' // corroborated (would lead to verdict)
    },
    explanation: "If they could not reach a verdict, the evidence must be unclear. 'Ambiguous' fits best."
  },
  // 9. Elimination Skill (SE)
  {
    id: 'diag_009',
    type: 'SE',
    primarySkill: 'Elimination Skill',
    content: "The novel was ______, failing to engage readers despite its famous author and promising premise.",
    options: ["vapid", "controversial", "complex", "insipid", "lengthy", "derivative"],
    correctAnswer: [0, 3], // vapid, insipid
    mistakeMap: {
      1: 'ELIMINATION_FAILURE', // controversial (usually engages)
      2: 'ELIMINATION_FAILURE', // complex (might engage)
      4: 'ELIMINATION_FAILURE', // lengthy (neutral)
      5: 'PARTIAL_SYNONYM_TRAP' // derivative (could be boring, but vapid/insipid directly mean lacking spirit/flavor)
    },
    explanation: "We need words for 'boring' or 'lacking substance'. Vapid and Insipid are perfect synonyms."
  },
  // 10. Mixed Stress (TC)
  {
    id: 'diag_010',
    type: 'TC',
    primarySkill: 'Mixed Stress & Switching',
    content: "The diplomat's tone was (i)______, yet her underlying message was (ii)______, signaling that negotiations had reached an impasse.",
    options: ["conciliatory", "belligerent", "apologetic", "uncompromising", "flexible", "ambiguous"],
    correctAnswer: [0, 3], // conciliatory, uncompromising
    mistakeMap: {
      1: 'POLARITY_ERROR', // belligerent (doesn't contrast well with uncompromising in this context? "Tone was belligerent yet message was uncompromising" - no contrast. "Yet" implies contrast.)
      2: 'CONTEXT_MISREAD', // apologetic (possible, but conciliatory is standard diplomatic mask)
      4: 'LOGICAL_CONTRADICTION', // flexible (wouldn't be an impasse)
      5: 'SCOPE_ERROR' // ambiguous (impasse usually comes from clear conflict)
    },
    explanation: "The 'Yet' signals contrast. Tone vs Message. Conciliatory (soft) vs Uncompromising (hard) creates the contrast and explains the impasse."
  }
];
