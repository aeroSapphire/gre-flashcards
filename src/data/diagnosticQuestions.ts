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
  passageText?: string; // For RC questions
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // SECTION A — POLARITY & DIRECTION
  {
    id: 'diag_001',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Although the reviewer praised the study’s design, she concluded that the data were __________ about its practical implications.",
    options: ["sanguine", "dismissive", "equivocal", "laudatory", "categorical"],
    correctAnswer: [2],
    mistakeMap: {
      0: 'POLARITY_ERROR',
      1: 'POLARITY_ERROR',
      3: 'POLARITY_ERROR',
      4: 'POLARITY_ERROR'
    },
    explanation: "The sentence contrasts praise for design with a reservation about implications. 'Equivocal' (ambiguous/uncertain) captures this reservation appropriately."
  },
  {
    id: 'diag_002',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The editorial’s tone was unexpectedly ________, considering the magazine’s customary optimism.",
    options: ["affirmative", "jaded", "buoyant", "hostile", "resigned", "sanguine"],
    correctAnswer: [1, 4],
    mistakeMap: {
      0: 'POLARITY_ERROR',
      2: 'POLARITY_ERROR',
      3: 'INTENSITY_MISMATCH', // Hostile is too strong/wrong tone
      5: 'POLARITY_ERROR'
    },
    explanation: "'Unexpectedly' signals a contrast with 'customary optimism'. 'Jaded' and 'Resigned' both imply a lack of optimism/weariness."
  },
  {
    id: 'diag_003',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "The consultant’s assessment, though punctilious about method, was __________ in its final recommendations.",
    options: ["tepid", "categorical", "complacent", "trenchant", "equivocal"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'POLARITY_ERROR',
      2: 'CONTEXT_MISREAD',
      3: 'POLARITY_ERROR',
      4: 'PARTIAL_SYNONYM_TRAP'
    },
    explanation: "The contrast 'though punctilious' implies the recommendations were weak. 'Tepid' means unenthusiastic."
  },
  {
    id: 'diag_004',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The professor’s remarks were unexpectedly ________ for someone known for rhetorical restraint.",
    options: ["incisive", "restrained", "measured", "inflammatory", "temperate", "severe"],
    correctAnswer: [0, 5],
    mistakeMap: {
      1: 'POLARITY_ERROR',
      2: 'POLARITY_ERROR',
      3: 'INTENSITY_MISMATCH',
      4: 'POLARITY_ERROR'
    },
    explanation: "Contrast with 'restraint' requires words indicating lack of restraint or sharpness. 'Incisive' and 'Severe' fit."
  },
  {
    id: 'diag_005',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Although the candidate’s evidence was superficially __________, closer inspection revealed numerous logical gaps.",
    options: ["cogent", "persuasive", "compelling", "cursory", "rigorous"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'PARTIAL_SYNONYM_TRAP',
      2: 'PARTIAL_SYNONYM_TRAP',
      3: 'POLARITY_ERROR',
      4: 'PARTIAL_SYNONYM_TRAP'
    },
    explanation: "The evidence looked good ('superficially ___') but had gaps. 'Persuasive' fits well in this context."
  },
  {
    id: 'diag_006',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The satirist’s depiction of political life is notable for its __________, which spares neither hypocrite nor populist.",
    options: ["leniency", "asperity", "tenderness", "mordancy", "geniality", "abrasiveness"],
    correctAnswer: [3, 5],
    mistakeMap: {
      0: 'POLARITY_ERROR',
      1: 'POLARITY_ERROR',
      2: 'POLARITY_ERROR',
      4: 'POLARITY_ERROR'
    },
    explanation: "'Spares neither' implies harshness. 'Mordancy' and 'Abrasiveness' capture this biting quality."
  },
  {
    id: 'diag_007',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "The mayor’s remarks were framed to appear conciliatory, but to many listeners they felt __________.",
    options: ["conciliatory", "disingenuous", "magnanimous", "approbatory", "candid"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'POLARITY_ERROR',
      2: 'POLARITY_ERROR',
      3: 'POLARITY_ERROR',
      4: 'POLARITY_ERROR'
    },
    explanation: "The 'but' suggests the remarks were not actually conciliatory. 'Disingenuous' fits the sense of falseness."
  },
  {
    id: 'diag_008',
    type: 'SE',
    primarySkill: 'Polarity & Direction',
    content: "The review was blunt but not _______, leaving readers unsure whether to applaud or to criticize.",
    options: ["flattering", "laudatory", "scathing", "unctuous", "unequivocal", "vague"],
    correctAnswer: [0, 1],
    mistakeMap: {
      2: 'POLARITY_ERROR',
      3: 'POLARITY_ERROR',
      4: 'POLARITY_ERROR',
      5: 'POLARITY_ERROR'
    },
    explanation: "'Blunt but not ___' implies it wasn't overly positive either. 'Flattering' and 'Laudatory' fit."
  },
  {
    id: 'diag_009',
    type: 'TC',
    primarySkill: 'Polarity & Direction',
    content: "Though superficially genial, the columnist’s column was actually __________ about the celebrity’s motives.",
    options: ["effusive", "skeptical", "laudatory", "obsequious", "celebratory"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'POLARITY_ERROR',
      2: 'POLARITY_ERROR',
      3: 'POLARITY_ERROR',
      4: 'POLARITY_ERROR'
    },
    explanation: "Contrast with 'genial' (friendly) requires a negative or questioning stance. 'Skeptical' fits best."
  },

  // SECTION B — INTENSITY & PRECISION
  {
    id: 'diag_010',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The scientist’s conclusion was cautiously _______; it avoided grand pronouncements.",
    options: ["sweeping", "tentative", "conclusive", "emphatic", "modest", "categorical"],
    correctAnswer: [1, 4],
    mistakeMap: {
      0: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH',
      5: 'INTENSITY_MISMATCH'
    },
    explanation: "'Cautiously ___' and 'avoided grand pronouncements' point to 'tentative' and 'modest'."
  },
  {
    id: 'diag_011',
    type: 'TC',
    primarySkill: 'Intensity & Precision',
    content: "The defendant’s apology was __________; it acknowledged the harm but stopped short of full contrition.",
    options: ["contrite", "perfunctory", "fulsome", "heartfelt", "abject"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH',
      4: 'INTENSITY_MISMATCH'
    },
    explanation: "'Stopped short of full contrition' implies a lack of depth. 'Perfunctory' (superficial/routine) fits."
  },
  {
    id: 'diag_012',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The committee’s verdict was measured rather than _______, signaling reluctance to condemn.",
    options: ["scathing", "guarded", "reserved", "vehement", "temperate", "circumspect"],
    correctAnswer: [0, 3],
    mistakeMap: {
      1: 'PARTIAL_SYNONYM_TRAP',
      2: 'PARTIAL_SYNONYM_TRAP',
      4: 'PARTIAL_SYNONYM_TRAP',
      5: 'PARTIAL_SYNONYM_TRAP'
    },
    explanation: "'Measured rather than ___' requires a strong/harsh word to contrast with 'measured'. 'Scathing' and 'Vehement' fit."
  },
  {
    id: 'diag_013',
    type: 'TC',
    primarySkill: 'Intensity & Precision',
    content: "The novel’s ending was ________: it suggested hope but not triumphant resolution.",
    options: ["elegiac", "sanguine", "bleak", "triumphant", "ambivalent"],
    correctAnswer: [4],
    mistakeMap: {
      0: 'INTENSITY_MISMATCH',
      1: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH'
    },
    explanation: "'Hope but not triumphant resolution' suggests mixed feelings. 'Ambivalent' captures this mix."
  },
  {
    id: 'diag_014',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The speaker’s admonition was _______ — not vitriolic, but clearly more than a suggestion.",
    options: ["stern", "ominous", "trenchant", "perfunctory", "vehement", "tepid"],
    correctAnswer: [0, 2],
    mistakeMap: {
      1: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH',
      4: 'INTENSITY_MISMATCH',
      5: 'INTENSITY_MISMATCH'
    },
    explanation: "'Not vitriolic' (so not too strong) but 'more than a suggestion' (so not weak). 'Stern' and 'Trenchant' fit the middle ground."
  },
  {
    id: 'diag_015',
    type: 'TC',
    primarySkill: 'Intensity & Precision',
    content: "The philosopher’s criticism was __________, pinpointing tiny logical flaws rather than denouncing the entire argument.",
    options: ["devastating", "nuanced", "scathing", "cursory", "sweeping"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'PARTIAL_SYNONYM_TRAP',
      4: 'INTENSITY_MISMATCH'
    },
    explanation: "'Pinpointing tiny logical flaws' implies care and detail. 'Nuanced' fits."
  },
  {
    id: 'diag_016',
    type: 'TC',
    primarySkill: 'Intensity & Precision',
    content: "The committee’s response was polite but ultimately ________ toward the petitioners’ demands.",
    options: ["dismissive", "receptive", "accommodating", "supportive", "enthusiastic"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH',
      4: 'INTENSITY_MISMATCH'
    },
    explanation: "'Polite but ultimately ___' implies a negative outcome despite politeness. 'Dismissive' fits."
  },
  {
    id: 'diag_017',
    type: 'SE',
    primarySkill: 'Intensity & Precision',
    content: "The director’s later films are more ______ than his early, exuberant work; they are reflective rather than celebratory.",
    options: ["contemplative", "exultant", "raucous", "introspective", "jubilant", "meditative"],
    correctAnswer: [0, 3],
    mistakeMap: {
      1: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      4: 'INTENSITY_MISMATCH',
      5: 'PARTIAL_SYNONYM_TRAP'
    },
    explanation: "'Reflective rather than celebratory'. 'Contemplative' and 'Introspective' fit the reflective mood."
  },
  {
    id: 'diag_018',
    type: 'TC',
    primarySkill: 'Intensity & Precision',
    content: "The policy changes were described as modest but in practice proved surprisingly ________.",
    options: ["transformative", "negligible", "tentative", "ephemeral", "procedural"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'INTENSITY_MISMATCH',
      2: 'INTENSITY_MISMATCH',
      3: 'INTENSITY_MISMATCH',
      4: 'INTENSITY_MISMATCH'
    },
    explanation: "Contrast with 'modest' implies a significant impact. 'Transformative' fits."
  },

  // SECTION C — SCOPE & LOGIC
  {
    id: 'diag_019',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "The editorial’s claim about the law’s effect is plausible for urban centers, but to assume it applies ________ would be erroneous.",
    options: ["nationwide", "locally", "selectively", "specifically", "partially"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'SCOPE_ERROR',
      2: 'SCOPE_ERROR',
      3: 'SCOPE_ERROR',
      4: 'SCOPE_ERROR'
    },
    explanation: "Contrast with 'urban centers' requires a broader scope. 'Nationwide' fits."
  },
  {
    id: 'diag_020',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "The historian’s thesis emphasizes institutional continuity; it is not trying to explain radical ________ in societal behavior.",
    options: ["transformations", "persistence", "stability", "continuity", "longevity"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'SCOPE_ERROR',
      2: 'SCOPE_ERROR',
      3: 'SCOPE_ERROR',
      4: 'SCOPE_ERROR'
    },
    explanation: "Contrast with 'continuity' requires change. 'Transformations' fits."
  },
  {
    id: 'diag_021',
    type: 'SE',
    primarySkill: 'Scope & Logic',
    content: "The study’s findings apply to a narrow demographic and should not be taken as _______ evidence of a universal trend.",
    options: ["conclusive", "anecdotal", "representative", "marginal", "definitive", "illustrative"],
    correctAnswer: [0, 4],
    mistakeMap: {
      1: 'SCOPE_ERROR',
      2: 'SCOPE_ERROR',
      3: 'SCOPE_ERROR',
      5: 'SCOPE_ERROR'
    },
    explanation: "'Should not be taken as ___ evidence of a universal trend'. 'Conclusive' and 'Definitive' fit the warning against overgeneralization."
  },
  // RC Passage for 22.1, 22.2, 22.3
  {
    id: 'diag_022_1',
    type: 'RC',
    primarySkill: 'Scope & Logic',
    passageText: "Scholars have long debated whether late nineteenth-century urban reforms represented an organic progression of civic improvement or a series of opportunistic responses to crises. Recent archival work highlights how municipal administrators adopted policies selectively: sanitation measures were implemented vigorously in districts where commercial landlords pressured for change, whereas similar interventions languished in working-class neighborhoods. Thus, what appears as a coherent program on the municipal ledger often masks a patchwork of politically contingent measures.",
    content: "According to the passage, which claim about municipal reforms is best supported?",
    options: [
      "They uniformly improved living conditions across all districts.",
      "They were motivated primarily by humanitarian concern.",
      "Their application varied according to local political and economic pressures.",
      "They were conceived as cohesive, citywide programs."
    ],
    correctAnswer: [2],
    mistakeMap: {
      0: 'CONTEXT_MISREAD',
      1: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "The passage states policies were adopted 'selectively' based on pressure from commercial landlords vs working-class neighborhoods."
  },
  {
    id: 'diag_022_2',
    type: 'RC',
    primarySkill: 'Scope & Logic',
    passageText: "(Passage from previous question)",
    content: "The author suggests that municipal ledgers give an impression of:",
    options: [
      "fragmentation and inconsistency.",
      "coherent and unified policy.",
      "neglect of commercial interests.",
      "transparent administrative motives."
    ],
    correctAnswer: [1],
    mistakeMap: {
      0: 'SCOPE_ERROR',
      2: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "The passage says 'what appears as a coherent program on the municipal ledger'."
  },
  {
    id: 'diag_022_3',
    type: 'RC',
    primarySkill: 'Scope & Logic',
    passageText: "(Passage from previous question)",
    content: "Which of the following is an inference the passage supports?",
    options: [
      "Sanitation measures were equally prioritized in all neighborhoods.",
      "Commercial landlord pressure influenced reform implementation.",
      "Working-class neighborhoods benefited most from reforms.",
      "Municipal administrators had a detailed citywide reform plan."
    ],
    correctAnswer: [1],
    mistakeMap: {
      0: 'CONTEXT_MISREAD',
      2: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "The passage mentions sanitation measures were vigorous where 'commercial landlords pressured for change'."
  },
  {
    id: 'diag_023',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "The law may curb some minor abuses, but to claim it will _________ entrenched corruption is optimistic.",
    options: ["eradicate", "mitigate", "check", "expose", "ameliorate"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'LOGICAL_CONTRADICTION',
      2: 'LOGICAL_CONTRADICTION',
      3: 'LOGICAL_CONTRADICTION',
      4: 'LOGICAL_CONTRADICTION'
    },
    explanation: "'Optimistic' to claim it will ___ entrenched corruption implies a very strong positive outcome. 'Eradicate' is the strongest."
  },
  {
    id: 'diag_024',
    type: 'SE',
    primarySkill: 'Scope & Logic',
    content: "The economist argued that the policy produced short-term growth but not ________ reform of the underlying institutions.",
    options: ["systemic", "provisional", "ephemeral", "superficial", "permanent", "enduring"],
    correctAnswer: [0, 5],
    mistakeMap: {
      1: 'SCOPE_ERROR',
      2: 'SCOPE_ERROR',
      3: 'SCOPE_ERROR',
      4: 'SCOPE_ERROR'
    },
    explanation: "Contrast with 'short-term'. 'Systemic' and 'Enduring' suggest lasting/deep change."
  },
  {
    id: 'diag_025',
    type: 'TC',
    primarySkill: 'Scope & Logic',
    content: "The study found a correlation between literacy rates and economic vigor, but to attribute the latter solely to literacy would be ________.",
    options: ["indefensible", "presumptuous", "ironic", "incontrovertible", "spurious"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'LOGICAL_CONTRADICTION',
      2: 'LOGICAL_CONTRADICTION',
      3: 'LOGICAL_CONTRADICTION',
      4: 'LOGICAL_CONTRADICTION'
    },
    explanation: "Attributing solely to one factor is a strong claim. 'Indefensible' (or presumptuous) fits the warning. 'Indefensible' is stronger."
  },

  // SECTION D — ELIMINATION SKILL
  {
    id: 'diag_026',
    type: 'TC',
    primarySkill: 'Elimination Skill',
    content: "The review was careful to note the book’s strengths, but it was less __________ about its weaknesses.",
    options: ["magnanimous", "candid", "lavish", "punctilious", "prolix"],
    correctAnswer: [1],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      2: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "Less ___ about weaknesses implies hiding them. 'Candid' (open/honest) fits 'less candid'."
  },
  {
    id: 'diag_027',
    type: 'SE',
    primarySkill: 'Elimination Skill',
    content: "Despite the compelling narrative, the author’s analysis is not wholly _______.",
    options: ["persuasive", "rigorous", "credible", "impeccable", "cogent", "sound"],
    correctAnswer: [1, 5],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      2: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "Contrast with 'compelling narrative' suggests analysis flaws. 'Rigorous' and 'Sound' fit."
  },
  {
    id: 'diag_028',
    type: 'TC',
    primarySkill: 'Elimination Skill',
    content: "The CEO’s explanation was ostensibly parsimonious, but critics deemed it __________.",
    options: ["convoluted", "simplistic", "evasive", "precise", "scrupulous"],
    correctAnswer: [2],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      1: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "Contrast with 'parsimonious' (economical/simple). Critics seeing it as 'evasive' makes sense."
  },
  {
    id: 'diag_029',
    type: 'TC',
    primarySkill: 'Elimination Skill',
    content: "The mayor’s policy was marketed as visionary but proved mostly __________ in practice.",
    options: ["rhetorical", "transformative", "groundbreaking", "progressive", "effective"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'ELIMINATION_FAILURE',
      2: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "Contrast with 'visionary' (and 'marketed as'). 'Rhetorical' (just talk) fits."
  },
  {
    id: 'diag_030',
    type: 'SE',
    primarySkill: 'Elimination Skill',
    content: "The critics’ reception was partly __________ — not wholly scornful, but tinged with impatience.",
    options: ["approbatory", "dismissive", "tepid", "trenchant", "lukewarm", "scathing"],
    correctAnswer: [2, 4],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      1: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      5: 'ELIMINATION_FAILURE'
    },
    explanation: "'Not wholly scornful' but 'impatience'. 'Tepid' and 'Lukewarm' fit the middle ground."
  },
  {
    id: 'diag_031',
    type: 'TC',
    primarySkill: 'Elimination Skill',
    content: "The article’s conclusions were couched in caveats that made them less __________ than the headline suggested.",
    options: ["sensational", "measured", "certain", "ambiguous", "technical"],
    correctAnswer: [2],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      1: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "'Couched in caveats' makes them less 'certain' or 'definitive'."
  },

  // SECTION E — MIXED STRESS & SWITCHING
  {
    id: 'diag_032_1',
    type: 'RC',
    primarySkill: 'Mixed Stress & Switching',
    passageText: "The band of early ecologists sought to reconcile economic growth with conservation, but they did so with different emphases. Some argued that technological innovation would decouple growth from resource depletion; others insisted that cultural shifts in consumption were essential. Over time, policy favored technology-led solutions because they aligned with market incentives, but scholars note that reliance on technical fixes often postponed difficult conversations about consumption patterns.",
    content: "The passage implies that policy favored technology-led solutions primarily because:",
    options: [
      "they were morally preferable.",
      "market incentives made them politically easier.",
      "cultural change had already occurred.",
      "technology was cheaper."
    ],
    correctAnswer: [1],
    mistakeMap: {
      0: 'CONTEXT_MISREAD',
      2: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "Passage says 'aligned with market incentives'."
  },
  {
    id: 'diag_032_2',
    type: 'RC',
    primarySkill: 'Mixed Stress & Switching',
    passageText: "(Passage from previous question)",
    content: "Which is an inference supported by the passage?",
    options: [
      "Technological fixes always solve resource problems.",
      "Cultural shifts would have been unpopular with markets.",
      "Reliance on technical fixes delayed debate on consumption.",
      "Early ecologists uniformly agreed on solutions."
    ],
    correctAnswer: [2],
    mistakeMap: {
      0: 'CONTEXT_MISREAD',
      1: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "Passage says 'often postponed difficult conversations about consumption patterns'."
  },
  {
    id: 'diag_032_3',
    type: 'RC',
    primarySkill: 'Mixed Stress & Switching',
    passageText: "(Passage from previous question)",
    content: "The author’s stance is best described as:",
    options: [
      "unequivocally pro-technology.",
      "critical of overreliance on technological fixes.",
      "indifferent toward climate issues.",
      "advocating immediate consumption reductions."
    ],
    correctAnswer: [1],
    mistakeMap: {
      0: 'CONTEXT_MISREAD',
      2: 'CONTEXT_MISREAD',
      3: 'CONTEXT_MISREAD'
    },
    explanation: "Passage highlights that technical fixes 'postponed difficult conversations'."
  },
  {
    id: 'diag_033',
    type: 'TC',
    primarySkill: 'Mixed Stress & Switching',
    content: "The candidate’s proposal was billed as innovative, but in practice it was largely ______.",
    options: ["derivative", "avant-garde", "ingenious", "pioneering", "groundbreaking"],
    correctAnswer: [0],
    mistakeMap: {
      1: 'PARTIAL_SYNONYM_TRAP',
      2: 'PARTIAL_SYNONYM_TRAP',
      3: 'PARTIAL_SYNONYM_TRAP',
      4: 'PARTIAL_SYNONYM_TRAP'
    },
    explanation: "Contrast with 'innovative'. 'Derivative' (copied) fits."
  },
  {
    id: 'diag_034',
    type: 'SE',
    primarySkill: 'Mixed Stress & Switching',
    content: "The instructor’s feedback was cursory rather than ________, leaving students uncertain how to improve.",
    options: ["perfunctory", "instructive", "summative", "dismissive", "ambiguous", "explicit"],
    correctAnswer: [1, 5],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      2: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "'Cursory rather than ___'. We need positive words for helpful feedback. 'Instructive' and 'Explicit' fit."
  },
  {
    id: 'diag_035',
    type: 'TC',
    primarySkill: 'Mixed Stress & Switching',
    content: "The artist’s later works retained ________ of his early style while abandoning its flamboyant excesses.",
    options: ["the banality", "the austerity", "the sobriety", "the core elements", "the gaudiness"],
    correctAnswer: [3],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      1: 'ELIMINATION_FAILURE',
      2: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE'
    },
    explanation: "Retained something while abandoning excesses. 'The core elements' makes sense."
  },
  {
    id: 'diag_036',
    type: 'SE',
    primarySkill: 'Mixed Stress & Switching',
    content: "The critic’s review was _______; it praised technical mastery while suggesting emotional resonance was lacking.",
    options: ["laudatory", "ambivalent", "qualified", "effusive", "appreciative", "reserved"],
    correctAnswer: [1, 2],
    mistakeMap: {
      0: 'ELIMINATION_FAILURE',
      3: 'ELIMINATION_FAILURE',
      4: 'ELIMINATION_FAILURE',
      5: 'ELIMINATION_FAILURE'
    },
    explanation: "Mixed review (praised X but Y lacking). 'Ambivalent' and 'Qualified' fit."
  }
];
