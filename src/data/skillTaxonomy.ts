export type SkillCategory = "reading_comprehension" | "text_completion" | "sentence_equivalence" | "trap_recognition";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  description: string;
  triggers: string[];
  parentId: string | null;
}

export const SKILLS: Record<string, Skill> = {
  // Reading Comprehension
  "RC-STR": {
    id: "RC-STR",
    name: "Passage Structure Recognition",
    category: "reading_comprehension",
    description: "Identifying the organizational pattern of a passage: General→Specific, Common View→Challenge→New View, Phenomenon→Explanations, Claim→Concession→Rebuttal, Old View→Modification",
    triggers: ["passage organization", "structure", "how the passage is organized"],
    parentId: null
  },
  "RC-FN": {
    id: "RC-FN",
    name: "Function Questions",
    category: "reading_comprehension",
    description: "Identifying the role a specific sentence or paragraph plays in the argument (example, counterargument, evidence, transition)",
    triggers: ["in order to", "serves primarily to", "the author mentions X to"],
    parentId: null
  },
  "RC-INF": {
    id: "RC-INF",
    name: "Inference Questions",
    category: "reading_comprehension",
    description: "Drawing conclusions that are necessarily true based on the passage — not just plausible, but logically required",
    triggers: ["it can be inferred", "the author would most likely agree", "suggests that"],
    parentId: null
  },
  "RC-EXC": {
    id: "RC-EXC",
    name: "EXCEPT/NOT Questions",
    category: "reading_comprehension",
    description: "Finding the one answer that is NOT supported or IS contradicted by the passage (four answers ARE supported)",
    triggers: ["EXCEPT", "NOT", "all of the following EXCEPT"],
    parentId: null
  },
  "RC-SW": {
    id: "RC-SW",
    name: "Strengthen/Weaken Questions",
    category: "reading_comprehension",
    description: "Identifying the argument's assumptions, then finding what would attack or support them",
    triggers: ["most weaken", "most strengthen", "would undermine", "would support"],
    parentId: null
  },
  "RC-TONE": {
    id: "RC-TONE",
    name: "Author's Tone/Attitude",
    category: "reading_comprehension",
    description: "Determining the author's stance. Common correct answers: skeptical, qualified approval, cautious optimism, measured criticism. Trap answers: indifferent, hostile, completely supportive (usually too extreme)",
    triggers: ["author's attitude", "tone of the passage", "author would most likely describe"],
    parentId: null
  },
  "RC-PP": {
    id: "RC-PP",
    name: "Primary Purpose",
    category: "reading_comprehension",
    description: "Capturing what the entire passage is about — the answer must cover the WHOLE passage, not just one part",
    triggers: ["primary purpose", "mainly concerned with", "which of the following best describes"],
    parentId: null
  },
  "RC-VOC": {
    id: "RC-VOC",
    name: "Vocabulary in Context",
    category: "reading_comprehension",
    description: "Selecting the meaning that fits THIS specific passage context. The correct answer is often NOT the most common definition.",
    triggers: ["as used in the passage", "most nearly means", "the word X refers to"],
    parentId: null
  },

  // Text Completion
  "TC-CON": {
    id: "TC-CON",
    name: "Contrast Signals",
    category: "text_completion",
    description: "The blank must contain the OPPOSITE of what's stated in the other clause. The signal word creates an expectation of reversal.",
    triggers: ["but", "however", "although", "yet", "despite", "while", "whereas", "nevertheless", "notwithstanding", "paradoxically"],
    parentId: null
  },
  "TC-CONT": {
    id: "TC-CONT",
    name: "Continuation Signals",
    category: "text_completion",
    description: "The blank must contain something SIMILAR to or consistent with the other clause. The signal word indicates agreement or extension.",
    triggers: ["and", "moreover", "indeed", "in fact", "furthermore", "similarly", "likewise", "thus", "therefore"],
    parentId: null
  },
  "TC-ELAB": {
    id: "TC-ELAB",
    name: "Colon/Dash Elaboration",
    category: "text_completion",
    description: "A colon or dash signals that what follows defines, explains, or exemplifies what came before. The blank must match the elaboration.",
    triggers: [":", "—", "that is", "namely"],
    parentId: null
  },
  "TC-CE": {
    id: "TC-CE",
    name: "Cause-Effect",
    category: "text_completion",
    description: "One part of the sentence is the cause, the other is the effect. The blank must logically complete the causal chain.",
    triggers: ["because", "since", "therefore", "consequently", "as a result", "leads to", "due to"],
    parentId: null
  },
  "TC-IRO": {
    id: "TC-IRO",
    name: "Irony/Paradox Markers",
    category: "text_completion",
    description: "The blank must contain the OPPOSITE of what would normally be expected. The signal word tells you to reverse your expectation.",
    triggers: ["ironically", "paradoxically", "curiously", "surprisingly", "unexpectedly"],
    parentId: null
  },
  "TC-DEG": {
    id: "TC-DEG",
    name: "Degree Intensifiers",
    category: "text_completion",
    description: "Words like 'even', 'so X that', 'too X to' intensify the meaning. The blank must be extreme enough to justify the intensifier.",
    triggers: ["even", "so X that", "too X to", "such X that"],
    parentId: null
  },
  "TC-DN": {
    id: "TC-DN",
    name: "Double Negative = Positive",
    category: "text_completion",
    description: "Two negatives cancel out. 'Not without merit' = has some merit. 'Hardly insignificant' = significant. Decode the double negative first.",
    triggers: ["not without", "not un-", "hardly insignificant", "never lacked", "cannot deny"],
    parentId: null
  },
  "TC-MB": {
    id: "TC-MB",
    name: "Multi-Blank Coherence",
    category: "text_completion",
    description: "In 2-3 blank questions, all blanks must work together to form a coherent sentence. Solve the most constrained blank first, then check if the others fit.",
    triggers: [],
    parentId: null
  },

  // Sentence Equivalence
  "SE-SYN": {
    id: "SE-SYN",
    name: "Synonym Pair Recognition",
    category: "sentence_equivalence",
    description: "Find the two answer choices that, when plugged into the sentence, produce sentences with the SAME meaning. They are often (but not always) synonyms.",
    triggers: [],
    parentId: null
  },
  "SE-CTX": {
    id: "SE-CTX",
    name: "Context-Driven Selection",
    category: "sentence_equivalence",
    description: "Both selected words must fit the sentence's logic and grammar. Don't just pick synonyms — pick the pair that makes the sentence work.",
    triggers: [],
    parentId: null
  },
  "SE-TRAP": {
    id: "SE-TRAP",
    name: "SE Trap Avoidance",
    category: "sentence_equivalence",
    description: "Avoid near-synonyms that don't fit context. If 'happy' and 'joyful' are synonyms but only one works grammatically, reject BOTH. Also avoid picking one perfect + one almost-fits.",
    triggers: [],
    parentId: null
  },

  // Trap Recognition (Cross-Cutting)
  "TRAP-EXT": {
    id: "TRAP-EXT",
    name: "Too Extreme",
    category: "trap_recognition",
    description: "Answer choices with words like 'always', 'never', 'completely', 'only' are usually wrong on the GRE.",
    triggers: ["always", "never", "completely", "only", "entirely", "absolutely"],
    parentId: null
  },
  "TRAP-IRR": {
    id: "TRAP-IRR",
    name: "True but Irrelevant",
    category: "trap_recognition",
    description: "The statement is factually correct but doesn't answer THIS question. It's about something the passage mentions but not what's being asked.",
    triggers: [],
    parentId: null
  },
  "TRAP-REV": {
    id: "TRAP-REV",
    name: "Reversal",
    category: "trap_recognition",
    description: "The answer switches the relationship — says A causes B when the passage says B causes A, or attributes a view to the wrong person.",
    triggers: [],
    parentId: null
  },
  "TRAP-OOS": {
    id: "TRAP-OOS",
    name: "Out of Scope",
    category: "trap_recognition",
    description: "The answer introduces concepts, people, or ideas that the passage never discusses. If it's not in the passage, it can't be the answer.",
    triggers: [],
    parentId: null
  },
  "TRAP-HALF": {
    id: "TRAP-HALF",
    name: "Half-Right",
    category: "trap_recognition",
    description: "The first part of the answer is correct, but the second part is wrong. Always read the ENTIRE answer choice before selecting it.",
    triggers: [],
    parentId: null
  }
};

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return Object.values(SKILLS).filter(s => s.category === category);
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS[id];
}

export const ALL_SKILL_IDS = Object.keys(SKILLS);

export const SKILL_CATEGORIES_LIST: SkillCategory[] = [
  "reading_comprehension",
  "text_completion",
  "sentence_equivalence",
  "trap_recognition"
];

export const DIFFICULTY_LEVELS: Record<number, { label: string; greRange: [number, number]; description: string }> = {
  1: { label: "Foundation", greRange: [130, 140], description: "Clear signals, common vocabulary, single-skill" },
  2: { label: "Developing", greRange: [140, 148], description: "Moderate vocabulary, 1-2 skills combined" },
  3: { label: "Competent", greRange: [148, 155], description: "Subtle signals, GRE-level vocabulary, multi-skill" },
  4: { label: "Advanced", greRange: [155, 162], description: "Ambiguous signals, traps present, nuanced reasoning" },
  5: { label: "Expert", greRange: [162, 170], description: "Near-authentic GRE difficulty, multiple traps, dense passages" }
};

export const CATEGORY_DISPLAY: Record<SkillCategory, { label: string; shortLabel: string; color: string }> = {
  reading_comprehension: { label: "Reading Comprehension", shortLabel: "RC", color: "blue" },
  text_completion: { label: "Text Completion", shortLabel: "TC", color: "purple" },
  sentence_equivalence: { label: "Sentence Equivalence", shortLabel: "SE", color: "emerald" },
  trap_recognition: { label: "Trap Recognition", shortLabel: "Trap", color: "orange" }
};
