export interface LessonExample {
  stem: string;
  correctAnswer: string;
  walkthrough: string[];
}

export interface Lesson {
  skillId: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  sections: {
    explanation: string;
    keyTriggers: string[];
    workedExample: LessonExample;
    tips: string[];
  };
  quickCheckQuestionIds: string[];
  prerequisiteSkills: string[];
}

export const LESSONS: Record<string, Lesson> = {
  // ─────────────────────────────────────────────────────────────────────────
  // READING COMPREHENSION (8 skills)
  // ─────────────────────────────────────────────────────────────────────────

  "RC-STR": {
    skillId: "RC-STR",
    title: "Passage Structure Recognition",
    category: "reading_comprehension",
    estimatedMinutes: 12,
    sections: {
      explanation:
        "Every GRE reading passage follows a recognizable organizational skeleton. The five most common structures are: (1) General statement followed by Specific support, (2) Common View challenged by a New View, (3) Phenomenon followed by competing Explanations, (4) Claim followed by Concession then Rebuttal, and (5) Old View modified or refined. Recognizing the skeleton before you read the questions lets you predict where the author is headed, which dramatically speeds up question answering. The GRE rewards this skill because understanding structure means understanding the author's purpose, and roughly 20% of RC questions test whether you can articulate why the passage is organized the way it is.",
      keyTriggers: [
        "however",
        "on the other hand",
        "while some scholars argue",
        "a competing explanation",
        "traditionally",
        "recently, however",
        "the passage is primarily organized as",
        "which of the following best describes the structure"
      ],
      workedExample: {
        stem:
          "Traditionally, historians attributed the decline of the Roman Republic to moral decay among the elite. Recently, however, economic historians have argued that widening wealth inequality destabilized political institutions. While the moral-decay thesis explains individual acts of corruption, it cannot account for the systemic nature of the collapse. The economic model, by contrast, predicts exactly the pattern of civil unrest that preceded the fall.\n\nWhich of the following best describes the organization of the passage?",
        correctAnswer:
          "An older explanation is presented, an alternative is introduced, and the alternative is shown to have greater explanatory power.",
        walkthrough: [
          "Step 1: Read the first sentence. The word 'Traditionally' signals an old or established view. Tag this as 'Old View.'",
          "Step 2: The phrase 'Recently, however' is a classic pivot. Everything after this introduces a 'New View' -- the economic explanation.",
          "Step 3: The third sentence critiques the Old View ('cannot account for'). This is the author weakening the traditional position.",
          "Step 4: The final sentence supports the New View ('predicts exactly'). The author is siding with the newer explanation.",
          "Step 5: Map the skeleton: Old View -> New View introduced -> Old View critiqued -> New View supported. This is the 'Old View vs. New View' structure where the author favors the new one.",
          "Step 6: Match to the answer that captures this arc: an older explanation is presented, an alternative is introduced, and the alternative is shown to have greater explanatory power."
        ]
      },
      tips: [
        "Before reading answer choices, jot a one-line skeleton in your scratch paper (e.g., 'Old -> Challenge -> New favored'). This prevents you from being swayed by tempting but incomplete descriptions.",
        "Watch for the pivot word -- 'however,' 'but,' 'yet,' 'on the other hand' -- it almost always marks the boundary between structural sections.",
        "If a structure answer only describes part of the passage (e.g., mentions the old view but ignores the new view), eliminate it immediately -- the correct answer must account for the whole passage."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "RC-PP": {
    skillId: "RC-PP",
    title: "Primary Purpose",
    category: "reading_comprehension",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Primary purpose questions ask you to capture what the entire passage is doing in a single phrase. The correct answer must cover the WHOLE passage, not just one section. The GRE uses this question type to test whether you can distinguish the forest from the trees -- many wrong answers accurately describe a paragraph or detail but fail to capture the passage's overarching goal. Think of it as writing a one-sentence summary that a librarian would use to catalog the passage. The most common trap is selecting an answer that is true about a part of the passage but too narrow to be the primary purpose.",
      keyTriggers: [
        "primary purpose",
        "mainly concerned with",
        "which of the following best describes the passage",
        "the passage as a whole serves to",
        "the author's main goal is to"
      ],
      workedExample: {
        stem:
          "Recent scholarship on the Harlem Renaissance has moved beyond the view that it was solely a literary movement. While poetry and fiction were central, historians now emphasize the movement's deep roots in visual art, music, and political organizing. This broader perspective reveals the Harlem Renaissance as a comprehensive cultural mobilization that reshaped African American identity across multiple domains.\n\nThe primary purpose of the passage is to",
        correctAnswer:
          "argue for a more inclusive understanding of a cultural movement",
        walkthrough: [
          "Step 1: Identify the topic -- the Harlem Renaissance and how scholars now view it.",
          "Step 2: Notice the passage starts with a shift ('has moved beyond') from an old, narrower view to a new, broader view.",
          "Step 3: Ask: what is the author DOING across the whole passage? The author is advocating for the broader perspective.",
          "Step 4: Check each answer against the whole passage. An answer like 'discuss the literary achievements of the Harlem Renaissance' only covers the old view -- too narrow.",
          "Step 5: An answer like 'trace the historical causes of a cultural movement' sounds plausible but the passage doesn't discuss causes -- it discusses scope.",
          "Step 6: 'Argue for a more inclusive understanding of a cultural movement' captures the full arc: old narrow view -> new broader view -> author endorses broader view."
        ]
      },
      tips: [
        "After reading the passage, write a 5-word summary before looking at answers. If your summary matches an answer choice, that is almost certainly correct.",
        "Eliminate any answer that only describes one paragraph or one example -- primary purpose must span the entire passage."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR"]
  },

  "RC-FN": {
    skillId: "RC-FN",
    title: "Function Questions",
    category: "reading_comprehension",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Function questions ask WHY the author included a specific sentence, phrase, or paragraph -- not WHAT it says, but what ROLE it plays. Common roles include: providing evidence for a claim, offering a counterexample, conceding a point before rebutting it, illustrating an abstract concept, or transitioning between ideas. The GRE tests this skill because it separates surface-level readers from those who understand argumentative structure. The key mistake students make is choosing an answer that restates the content rather than describing its purpose. Always ask yourself: 'If I removed this sentence, what would the argument lose?'",
      keyTriggers: [
        "in order to",
        "serves primarily to",
        "the author mentions X to",
        "the function of the highlighted sentence is to",
        "the author includes the example of X in order to"
      ],
      workedExample: {
        stem:
          "The theory that dinosaurs were endothermic (warm-blooded) has gained support from bone histology studies. However, a recent analysis of growth rings in sauropod fossils suggests a more complex picture. Like modern crocodilians, which exhibit seasonal growth variation despite being ectothermic, sauropods show growth ring patterns that do not fit neatly into either the endothermic or ectothermic model.\n\nThe author mentions modern crocodilians primarily in order to",
        correctAnswer:
          "provide an analogy that complicates a simple classification of dinosaur metabolism",
        walkthrough: [
          "Step 1: Locate the reference -- 'Like modern crocodilians' appears in the third sentence.",
          "Step 2: Read the surrounding context. The sentence is making a comparison: sauropods show patterns similar to crocodilians.",
          "Step 3: Ask: why bring up crocodilians? They are ectothermic but show growth patterns that muddy the picture. They serve as a comparison case.",
          "Step 4: Look at the argument's flow: Sentence 1 = endothermic theory. Sentence 2 = 'however' + complication. Sentence 3 = the crocodilian analogy supports the complication.",
          "Step 5: The function is to provide a modern parallel that shows the endothermic/ectothermic binary is too simple.",
          "Step 6: Reject answers that merely restate content ('to describe crocodilian growth patterns') -- we need the PURPOSE: to complicate the simple classification."
        ]
      },
      tips: [
        "Mentally delete the sentence in question and ask 'What argument would be weaker without this?' The answer to that question is the function.",
        "Beware of answers that describe WHAT the sentence says rather than WHY it is there. The correct answer always uses purpose language: 'to illustrate,' 'to challenge,' 'to provide evidence for.'"
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP"]
  },

  "RC-INF": {
    skillId: "RC-INF",
    title: "Inference Questions",
    category: "reading_comprehension",
    estimatedMinutes: 12,
    sections: {
      explanation:
        "Inference questions ask you to identify what MUST be true based on the passage -- not what might be true, could be true, or is probably true. The correct answer is a logical consequence of information explicitly stated in the passage, even if the passage never says it directly. The GRE designs these questions to punish two types of errors: (1) choosing something that sounds reasonable but goes beyond what the passage supports, and (2) choosing something the passage explicitly states (which is a detail question, not an inference). A valid GRE inference is a small, conservative logical step from stated facts. Think of it as what a careful lawyer would conclude, not what a creative essayist might speculate.",
      keyTriggers: [
        "it can be inferred",
        "the passage implies",
        "the author would most likely agree",
        "suggests that",
        "the passage supports which of the following",
        "based on the passage, it is reasonable to conclude"
      ],
      workedExample: {
        stem:
          "Eighteenth-century European porcelain manufacturers closely guarded their production techniques, often requiring workers to live on factory grounds and prohibiting them from traveling abroad. Despite these precautions, by 1800 similar porcelain-making methods had appeared across multiple European countries.\n\nIt can be inferred from the passage that",
        correctAnswer:
          "the efforts of porcelain manufacturers to maintain secrecy were not entirely successful",
        walkthrough: [
          "Step 1: Identify the two key facts: (a) manufacturers tried hard to keep techniques secret, (b) by 1800 the techniques had spread anyway.",
          "Step 2: Ask: what MUST be true if both facts are true? If techniques spread despite secrecy measures, the secrecy measures did not fully work.",
          "Step 3: Check: does the passage say this directly? No -- it states the precautions and the outcome separately but never explicitly says the precautions failed. That makes this an inference, not a restatement.",
          "Step 4: Evaluate the logical strength. Is this a 'must be true' conclusion? Yes -- if techniques spread despite precautions, the precautions were by definition not entirely successful.",
          "Step 5: Reject any answer that speculates about HOW the secrets leaked (e.g., 'workers smuggled recipes abroad') -- the passage gives no information about the mechanism.",
          "Step 6: Reject any answer that goes too far (e.g., 'manufacturers made no effort to protect their methods') -- this contradicts the passage."
        ]
      },
      tips: [
        "Apply the 'must be true' test: cover the answer choices and ask what necessarily follows from the passage. If you have to add assumptions or outside knowledge, the inference is too big.",
        "The correct inference is usually boring and conservative. If an answer sounds exciting or surprising, it probably goes beyond what the passage supports."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP", "RC-FN"]
  },

  "RC-TONE": {
    skillId: "RC-TONE",
    title: "Author's Tone and Attitude",
    category: "reading_comprehension",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "Tone and attitude questions ask you to characterize the author's emotional or intellectual stance toward the subject. The GRE almost never uses passages where the author is completely neutral or violently hostile -- the real answers live in the nuanced middle ground. Common correct tones include: 'cautious optimism,' 'qualified approval,' 'measured skepticism,' 'respectful disagreement,' and 'detached curiosity.' Common trap answers include 'indifferent' (authors who write about a topic are rarely indifferent), 'enthusiastic endorsement' (too extreme for academic writing), and 'bitter resentment' (too emotional). The key is to find adjective pairs that capture both the direction (positive/negative) and the intensity (mild/strong) of the author's stance.",
      keyTriggers: [
        "the author's attitude toward",
        "the tone of the passage",
        "the author would most likely describe X as",
        "the author's stance is best characterized as",
        "the author regards X with"
      ],
      workedExample: {
        stem:
          "The new urban planning initiative has produced some encouraging results in pilot neighborhoods, including reduced commute times and increased green space. However, the program's reliance on federal subsidies raises questions about its long-term viability, and its effects on housing affordability remain to be seen.\n\nThe author's attitude toward the urban planning initiative is best described as",
        correctAnswer: "cautiously optimistic",
        walkthrough: [
          "Step 1: Identify positive language: 'encouraging results,' 'reduced commute times,' 'increased green space.' The author acknowledges genuine benefits.",
          "Step 2: Identify qualifying or negative language: 'However,' 'raises questions,' 'remain to be seen.' The author flags real concerns.",
          "Step 3: Determine direction: the author is generally positive (sees benefits) but not unreservedly so. Direction = positive.",
          "Step 4: Determine intensity: the concerns temper the positivity. Intensity = mild/qualified, not enthusiastic.",
          "Step 5: Combine direction + intensity: positive but qualified = 'cautiously optimistic' or 'qualified approval.'",
          "Step 6: Eliminate extremes: 'enthusiastic endorsement' ignores the concerns; 'deep skepticism' ignores the positive results; 'indifference' contradicts the passage's engaged analysis."
        ]
      },
      tips: [
        "Map the tone on two axes: direction (positive vs. negative) and intensity (strong vs. mild). The GRE correct answer almost always falls in the 'mild' column.",
        "If 'indifferent' or 'apathetic' is an answer choice, it is almost always wrong -- an author who writes a passage about a topic is by definition not indifferent to it."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP", "RC-FN", "RC-INF"]
  },

  "RC-SW": {
    skillId: "RC-SW",
    title: "Strengthen/Weaken Questions",
    category: "reading_comprehension",
    estimatedMinutes: 12,
    sections: {
      explanation:
        "Strengthen and weaken questions require you to step outside the passage and evaluate what NEW information would affect the argument's validity. To answer them, you must first identify the argument's conclusion and its underlying assumption -- the unstated link between the evidence and the conclusion. A strengthener supports that assumption; a weakener attacks it. The GRE tests this skill because it requires genuine critical thinking: you are not just reading for comprehension but actively evaluating logical structure. The most common mistake is choosing an answer that merely repeats or elaborates the passage's existing evidence rather than introducing new information that affects the assumption.",
      keyTriggers: [
        "most weaken",
        "most strengthen",
        "would undermine",
        "would support",
        "casts the most doubt on",
        "most seriously calls into question"
      ],
      workedExample: {
        stem:
          "Researchers found that students who listened to classical music for 30 minutes before an exam scored 15% higher on spatial reasoning tasks than students who sat in silence. The researchers concluded that classical music enhances cognitive performance.\n\nWhich of the following, if true, would most weaken the researchers' conclusion?",
        correctAnswer:
          "Students who listened to any genre of music, including pop and jazz, showed similar score improvements.",
        walkthrough: [
          "Step 1: Identify the conclusion: classical music enhances cognitive performance.",
          "Step 2: Identify the evidence: classical music listeners scored higher than silent-sitting students.",
          "Step 3: Identify the hidden assumption: it is something SPECIFIC to classical music (not just any auditory stimulation) that caused the improvement.",
          "Step 4: A weakener must attack this assumption. If any music produces the same effect, then classical music is not special -- it is music in general, or just not sitting in silence.",
          "Step 5: Check the answer: 'Students who listened to any genre showed similar improvements' directly attacks the assumption that classical music specifically is responsible.",
          "Step 6: Reject answers that strengthen (e.g., 'classical music activates brain regions associated with spatial reasoning') or that are irrelevant (e.g., 'the students had varying levels of musical training')."
        ]
      },
      tips: [
        "Always articulate the assumption BEFORE looking at answer choices. Write it on your scratch paper as: 'The argument assumes that ____.' Then look for the answer that attacks or supports that specific assumption.",
        "The correct weakener often introduces an alternative explanation for the evidence, showing that the conclusion does not necessarily follow."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP", "RC-FN", "RC-INF", "RC-TONE"]
  },

  "RC-EXC": {
    skillId: "RC-EXC",
    title: "EXCEPT/NOT Questions",
    category: "reading_comprehension",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "EXCEPT and NOT questions flip the usual logic: four of the five answers ARE supported by the passage, and you must find the one that is NOT. This is cognitively demanding because you must verify each answer against the passage rather than finding one that matches. The GRE uses these questions to test thoroughness and to catch students who skim. The most effective approach is to treat each answer choice as a true/false statement and mark it with a check (supported) or an X (not supported). The odd one out is your answer. A common trap is an answer that sounds wrong to your intuition but is actually stated in the passage, or an answer that sounds right because it aligns with common knowledge but is never mentioned in the text.",
      keyTriggers: [
        "EXCEPT",
        "NOT",
        "all of the following EXCEPT",
        "the passage mentions all of the following EXCEPT",
        "each of the following is stated EXCEPT"
      ],
      workedExample: {
        stem:
          "The passage discusses the benefits of urban green spaces, noting that they reduce air pollution through particulate absorption, lower urban temperatures via evapotranspiration, provide habitats for pollinators, and improve residents' mental health through exposure to natural settings.\n\nThe passage mentions all of the following as benefits of urban green spaces EXCEPT",
        correctAnswer: "reducing noise pollution from traffic",
        walkthrough: [
          "Step 1: Recognize this is an EXCEPT question. You need the one answer NOT in the passage.",
          "Step 2: Go through each answer and check it against the passage. Create a mental checklist.",
          "Step 3: 'Reducing air pollution' -- stated ('reduce air pollution through particulate absorption'). Mark: SUPPORTED.",
          "Step 4: 'Lowering urban temperatures' -- stated ('lower urban temperatures via evapotranspiration'). Mark: SUPPORTED.",
          "Step 5: 'Providing pollinator habitats' -- stated ('provide habitats for pollinators'). Mark: SUPPORTED.",
          "Step 6: 'Reducing noise pollution from traffic' -- not mentioned anywhere. The passage discusses air pollution but never mentions noise. Mark: NOT SUPPORTED. This is the correct answer."
        ]
      },
      tips: [
        "Physically mark each answer choice as you verify it against the passage. Do not rely on memory -- EXCEPT questions require systematic elimination, not intuition.",
        "Be wary of answers that are true in the real world but absent from the passage. The question asks what the PASSAGE states, not what is generally true."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP", "RC-FN", "RC-INF", "RC-TONE", "RC-SW"]
  },

  "RC-VOC": {
    skillId: "RC-VOC",
    title: "Vocabulary in Context",
    category: "reading_comprehension",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "Vocabulary-in-context questions ask you to determine what a word means as it is used in a specific passage. The GRE deliberately selects words with multiple definitions and uses the LESS common meaning. For example, 'qualified' usually means 'having qualifications,' but in an academic passage it often means 'limited or conditional' (as in 'qualified approval'). The test rewards students who read context clues over those who simply know the most common dictionary definition. Always substitute your answer back into the sentence to verify it preserves the passage's meaning. If the word has a common meaning and a secondary meaning, the secondary meaning is more likely to be correct on the GRE.",
      keyTriggers: [
        "as used in the passage",
        "most nearly means",
        "the word X refers to",
        "in context, X most closely means",
        "the author uses the word X to mean"
      ],
      workedExample: {
        stem:
          "The senator's endorsement of the new policy was notably tempered: while she praised its environmental provisions, she expressed reservations about its economic impact and suggested that several clauses needed revision.\n\nAs used in the passage, 'tempered' most nearly means",
        correctAnswer: "moderated or restrained",
        walkthrough: [
          "Step 1: Locate the word 'tempered' in context. It describes the senator's endorsement.",
          "Step 2: Read the surrounding context for clues. 'While she praised' (positive) + 'she expressed reservations' and 'suggested revision' (negative). The endorsement was mixed.",
          "Step 3: 'Tempered' commonly means 'heated and cooled' (metallurgy) or 'moderated/restrained.' Which fits a mixed endorsement?",
          "Step 4: 'Moderated or restrained' fits perfectly -- the endorsement was held back, not full-throated.",
          "Step 5: Test by substitution: 'The senator's endorsement was notably moderated' -- yes, this preserves the meaning.",
          "Step 6: Reject the metallurgical meaning ('strengthened through heating') -- this would imply the endorsement was made stronger, which contradicts the reservations described."
        ]
      },
      tips: [
        "Always substitute your answer back into the original sentence. If the sentence reads naturally and preserves the same meaning, you have the right answer.",
        "On the GRE, the most common or 'first instinct' definition is usually the trap. Train yourself to consider secondary meanings first."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["RC-STR", "RC-PP", "RC-FN", "RC-INF", "RC-TONE", "RC-SW", "RC-EXC"]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TEXT COMPLETION (8 skills)
  // ─────────────────────────────────────────────────────────────────────────

  "TC-CON": {
    skillId: "TC-CON",
    title: "Contrast Signals",
    category: "text_completion",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Contrast signals are words or phrases that tell you the blank must contain the OPPOSITE meaning of what is stated elsewhere in the sentence. When you see 'however,' 'although,' 'despite,' or 'while,' the sentence is setting up a reversal. One side of the contrast describes a quality, and the blank must describe the opposing quality. The GRE heavily tests this pattern because it is the most common structural clue in Text Completion questions -- roughly 30-40% of TC questions use a contrast signal. Mastering this one pattern gives you an enormous scoring advantage. The key discipline is to identify the contrast word first, then identify the clue (the word or phrase the blank must oppose), and only then look at the answer choices.",
      keyTriggers: [
        "but",
        "however",
        "although",
        "yet",
        "despite",
        "while",
        "whereas",
        "nevertheless",
        "notwithstanding",
        "paradoxically",
        "in contrast",
        "on the other hand",
        "rather than"
      ],
      workedExample: {
        stem:
          "Although the professor's lectures were widely regarded as __________, her published papers were dense and nearly impenetrable even to specialists.",
        correctAnswer: "lucid",
        walkthrough: [
          "Step 1: Identify the contrast signal: 'Although' at the beginning tells us the two clauses will oppose each other.",
          "Step 2: Identify the clue: the second clause says her papers were 'dense and nearly impenetrable.' This is what the blank must OPPOSE.",
          "Step 3: Predict the blank: the opposite of dense and impenetrable is something like 'clear' or 'accessible.'",
          "Step 4: Scan the answer choices for a word matching your prediction. 'Lucid' means clear and easy to understand -- a direct opposite of 'impenetrable.'",
          "Step 5: Verify: 'Although her lectures were lucid, her papers were impenetrable' -- the contrast makes perfect sense.",
          "Step 6: Reject words like 'tedious' or 'complicated' which would agree with the second clause rather than contrast with it."
        ]
      },
      tips: [
        "Circle or underline the contrast word before doing anything else. It is your compass for the entire question.",
        "After identifying the clue, write a simple prediction in your own words (e.g., 'opposite of impenetrable = clear') BEFORE looking at choices. This prevents answer choices from biasing your thinking."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "TC-CONT": {
    skillId: "TC-CONT",
    title: "Continuation Signals",
    category: "text_completion",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Continuation signals tell you the blank must match, extend, or agree with what is stated in another part of the sentence. Words like 'and,' 'moreover,' 'indeed,' 'in fact,' and 'furthermore' indicate that the sentence is building on the same idea rather than reversing it. This is the complement of contrast signals, and together they account for the majority of single-blank TC questions. Students who have practiced contrast signals sometimes over-apply the 'opposite' strategy, so it is critical to distinguish continuation from contrast. The clue word in a continuation sentence gives you a synonym or near-synonym for the blank. The discipline is the same: find the signal, find the clue, predict, then match.",
      keyTriggers: [
        "and",
        "moreover",
        "indeed",
        "in fact",
        "furthermore",
        "similarly",
        "likewise",
        "thus",
        "therefore",
        "additionally",
        "also",
        "just as"
      ],
      workedExample: {
        stem:
          "The diplomat was known for her tact; indeed, her ability to navigate sensitive negotiations was considered __________.",
        correctAnswer: "exemplary",
        walkthrough: [
          "Step 1: Identify the signal: 'indeed' is a continuation word. It means 'in fact' or 'even more so.' The blank will AGREE with and possibly intensify what came before.",
          "Step 2: Identify the clue: 'known for her tact' and 'ability to navigate sensitive negotiations.' Both are positive qualities.",
          "Step 3: Predict the blank: since 'indeed' intensifies, the blank should be a strong positive word -- something like 'outstanding' or 'remarkable.'",
          "Step 4: 'Exemplary' means serving as a desirable model -- it matches the prediction of a strong positive evaluation.",
          "Step 5: Verify: 'Her ability to navigate sensitive negotiations was considered exemplary' -- this flows naturally from 'known for her tact.'",
          "Step 6: Reject negative words like 'controversial' or 'unremarkable' since they would contradict the continuation signal."
        ]
      },
      tips: [
        "When you see a semicolon followed by 'indeed' or 'in fact,' the second clause is typically restating or amplifying the first. The blank will be a synonym or intensified version of the clue.",
        "Do not confuse 'therefore' (continuation -- indicating a logical consequence) with 'however' (contrast). Both often appear after semicolons, but they point in opposite directions."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON"]
  },

  "TC-CE": {
    skillId: "TC-CE",
    title: "Cause-Effect Relationships",
    category: "text_completion",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Cause-effect sentences establish that one thing leads to or results from another. The blank is either the cause or the effect, and the other part of the sentence provides the known element. Signal words like 'because,' 'since,' 'therefore,' 'consequently,' and 'as a result' establish the direction of the causal chain. The GRE tests this because cause-effect reasoning is fundamental to academic argumentation, and students often confuse which element is the cause and which is the effect. The critical discipline is to first determine the direction of causality -- is the blank the cause or the result? -- and then find a word that logically completes that chain.",
      keyTriggers: [
        "because",
        "since",
        "therefore",
        "consequently",
        "as a result",
        "leads to",
        "due to",
        "so ... that",
        "caused by",
        "resulted in",
        "stems from"
      ],
      workedExample: {
        stem:
          "Because the city had neglected its infrastructure for decades, the bridges had become so __________ that engineers recommended closing several to traffic.",
        correctAnswer: "decrepit",
        walkthrough: [
          "Step 1: Identify the signal: 'Because' at the start establishes a cause-effect relationship.",
          "Step 2: Identify the cause: 'the city had neglected its infrastructure for decades.' Decades of neglect.",
          "Step 3: Identify the effect: the bridges became so [blank] that engineers recommended closing them. The blank describes the state of the bridges.",
          "Step 4: Follow the causal logic: decades of neglect -> bridges in very bad condition -> recommended closure. The blank must describe severe deterioration.",
          "Step 5: 'Decrepit' means worn out or ruined by age and neglect -- it directly completes the causal chain.",
          "Step 6: Verify the 'so...that' intensifier: the bridges were SO decrepit THAT engineers recommended closing them. The extreme condition justifies the extreme response."
        ]
      },
      tips: [
        "Draw a simple arrow on your scratch paper: Cause -> Effect. Write the known element on one side and a prediction for the blank on the other. This visual prevents you from confusing the direction.",
        "When you see 'so [blank] that [consequence],' the consequence tells you the blank must be extreme enough to justify that outcome. If the consequence is dramatic, the blank must be a strong word."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT"]
  },

  "TC-ELAB": {
    skillId: "TC-ELAB",
    title: "Colon/Dash Elaboration",
    category: "text_completion",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Colons and dashes on the GRE function as equals signs: what comes after the colon or dash defines, explains, or exemplifies what came before. This is one of the most reliable structural clues because its meaning is unambiguous -- if you see a colon, the material on both sides must express the same core idea. The GRE exploits this by placing the blank on one side and the explanation on the other. Students who recognize this pattern can solve the question almost mechanically: read the elaboration, identify its core meaning, and find the word that matches. Colons and dashes never signal contrast on the GRE -- they always signal equivalence or elaboration.",
      keyTriggers: [
        ":",
        " -- ",
        "that is",
        "namely",
        "in other words",
        "specifically"
      ],
      workedExample: {
        stem:
          "The committee's report was __________: it covered every department's expenditures, staffing changes, and projected budgets for the next five years in meticulous detail.",
        correctAnswer: "exhaustive",
        walkthrough: [
          "Step 1: Spot the colon. Everything after the colon elaborates on the blank.",
          "Step 2: Read the elaboration: 'covered every department's expenditures, staffing changes, and projected budgets for the next five years in meticulous detail.' This describes something thorough and complete.",
          "Step 3: Predict the blank: a word meaning 'thorough' or 'comprehensive.'",
          "Step 4: 'Exhaustive' means comprehensive, covering all aspects. It matches the elaboration perfectly.",
          "Step 5: Verify: 'The report was exhaustive: it covered every department...' -- the colon introduces the evidence for the claim that the report was exhaustive.",
          "Step 6: Reject 'brief' or 'superficial' -- these contradict the elaboration. Reject 'controversial' -- thoroughness is not the same as controversy."
        ]
      },
      tips: [
        "Treat colons and dashes as if they say 'which means' or 'in other words.' The blank and the elaboration must express the same idea.",
        "If the blank comes AFTER the colon, read the material BEFORE the colon for your clue. The direction does not matter -- both sides must agree."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT", "TC-CE"]
  },

  "TC-IRO": {
    skillId: "TC-IRO",
    title: "Irony and Paradox Markers",
    category: "text_completion",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Irony and paradox markers signal that the blank must contain something UNEXPECTED -- the opposite of what the context would normally suggest. Words like 'ironically,' 'paradoxically,' 'curiously,' and 'surprisingly' tell you that the situation defies expectations. This is different from a simple contrast signal like 'however': irony markers emphasize the strangeness of the reversal. The blank typically describes an outcome or quality that is the opposite of what you would predict from the setup. The GRE tests this to see if students can handle multi-layered reasoning: you must first establish what the expected outcome would be, then reverse it. Many students treat these like simple contrast signals and get the right answer, but understanding the ironic dimension helps you verify your choice and avoid traps.",
      keyTriggers: [
        "ironically",
        "paradoxically",
        "curiously",
        "surprisingly",
        "unexpectedly",
        "counterintuitively",
        "oddly enough",
        "strangely"
      ],
      workedExample: {
        stem:
          "Paradoxically, the author's attempt to write a simple, accessible guide to tax law produced a volume so __________ that even accountants found it confusing.",
        correctAnswer: "convoluted",
        walkthrough: [
          "Step 1: Identify the irony marker: 'Paradoxically' at the start signals that the outcome is the opposite of what you would expect.",
          "Step 2: Establish the expected outcome: the author tried to write something 'simple and accessible.' You would expect the result to be simple.",
          "Step 3: Apply the paradox: the result must be the OPPOSITE of simple and accessible. Predict something like 'complicated' or 'confusing.'",
          "Step 4: The sentence confirms this: 'even accountants found it confusing.' The blank must mean something like 'extremely complicated.'",
          "Step 5: 'Convoluted' means extremely complex and hard to follow -- a perfect fit for the paradox.",
          "Step 6: Verify the paradox reads naturally: 'Paradoxically, the attempt to write simply produced something convoluted.' Yes, this is a genuine paradox."
        ]
      },
      tips: [
        "When you see an irony marker, explicitly state the expectation before reversing it. Write: 'Expected: [X]. Actual (blank): [opposite of X].' This prevents confusion.",
        "Irony markers on the GRE always produce a genuine surprise -- if your answer does not create a surprising contrast with the setup, you have likely chosen incorrectly."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT", "TC-CE", "TC-ELAB"]
  },

  "TC-DEG": {
    skillId: "TC-DEG",
    title: "Degree Intensifiers",
    category: "text_completion",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "Degree intensifiers are structures like 'even,' 'so X that,' and 'too X to' that require the blank to carry an extreme or emphatic meaning. 'So boring that students fell asleep' requires a word at least as strong as 'boring' -- 'mildly dull' would not justify students falling asleep. The GRE tests this because students often choose a word that is directionally correct but not strong enough. The intensifier sets a minimum threshold of strength: 'even' means the blank exceeds expectations, 'so...that' means the blank is extreme enough to produce the stated consequence, and 'too...to' means the blank prevents the stated action. Matching the degree of the word to the strength of the intensifier is the core skill.",
      keyTriggers: [
        "even",
        "so X that",
        "too X to",
        "such X that",
        "remarkably",
        "exceedingly",
        "to the point where"
      ],
      workedExample: {
        stem:
          "The noise in the factory was so __________ that workers were required to wear industrial-grade ear protection at all times.",
        correctAnswer: "deafening",
        walkthrough: [
          "Step 1: Identify the intensifier: 'so [blank] that' -- this tells you the blank must be strong enough to justify the consequence.",
          "Step 2: Identify the consequence: 'workers were required to wear industrial-grade ear protection at all times.' This is an extreme protective measure.",
          "Step 3: Calibrate the degree: regular noise would not require industrial-grade protection at all times. The blank must describe extremely loud noise.",
          "Step 4: 'Deafening' means extremely loud, enough to cause hearing damage. This justifies industrial-grade protection.",
          "Step 5: Reject milder words: 'noticeable' or 'bothersome' would be directionally correct but far too weak for the consequence described.",
          "Step 6: Verify: 'The noise was so deafening that workers wore industrial ear protection' -- the degree matches the consequence."
        ]
      },
      tips: [
        "Read the consequence first, then ask: 'How extreme must the blank be to produce this result?' Use the consequence as your calibration tool.",
        "When 'even' appears, the blank describes something that exceeds an already established standard. Look for what that standard is and choose a word that surpasses it."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT", "TC-CE", "TC-ELAB", "TC-IRO"]
  },

  "TC-DN": {
    skillId: "TC-DN",
    title: "Double Negative Equals Positive",
    category: "text_completion",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "The GRE frequently uses double negatives to express positive ideas in a roundabout way. 'Not without merit' means 'has some merit.' 'Hardly insignificant' means 'significant.' 'Cannot deny' means 'must admit.' The test rewards students who can decode these constructions quickly because they appear in both the sentence stem and the answer choices. The trap is that students who read quickly may process only one of the two negatives, arriving at the opposite meaning. The technique is simple: when you spot a double negative, cancel both negatives and rewrite the phrase as a straightforward positive. Then solve the question using the simplified version. This pattern also appears in answer choices: a double-negative answer choice may be correct even though it sounds hedging or awkward.",
      keyTriggers: [
        "not without",
        "not un-",
        "hardly insignificant",
        "never lacked",
        "cannot deny",
        "by no means absent",
        "scarcely devoid of",
        "far from negligible"
      ],
      workedExample: {
        stem:
          "The critic's review was not without __________; even the filmmaker's supporters conceded that several of the objections were valid.",
        correctAnswer: "merit",
        walkthrough: [
          "Step 1: Spot the double negative: 'not without [blank].' This structure means 'has some [blank].'",
          "Step 2: Simplify: 'The review had some [blank].' Now solve for the blank.",
          "Step 3: Read the supporting context: 'even the filmmaker's supporters conceded that several objections were valid.' The review's criticisms had legitimate points.",
          "Step 4: The blank should mean something like 'validity' or 'legitimate points.' Predict: 'merit' or 'justification.'",
          "Step 5: 'Merit' means value or worth. 'The review was not without merit' = 'the review had some value.' This matches the context.",
          "Step 6: Verify with the simplified version: 'The review had some merit; even supporters admitted the objections were valid.' Coherent and logical."
        ]
      },
      tips: [
        "When you spot a double negative, immediately rewrite the phrase as a simple positive on your scratch paper. Solve using the simplified version, then verify your answer works in the original.",
        "Watch for double negatives hiding in answer choices too. 'Not dissimilar' means 'similar.' 'Hardly inconsequential' means 'consequential.' Decode before evaluating."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT", "TC-CE", "TC-ELAB", "TC-IRO", "TC-DEG"]
  },

  "TC-MB": {
    skillId: "TC-MB",
    title: "Multi-Blank Coherence",
    category: "text_completion",
    estimatedMinutes: 14,
    sections: {
      explanation:
        "Multi-blank TC questions (2 or 3 blanks) require all blanks to work together to form a coherent, logically consistent sentence. The GRE designs these so that each blank constrains the others -- choosing the wrong word for one blank makes it impossible to find a coherent choice for another. The optimal strategy is NOT to solve blanks left to right. Instead, identify the most constrained blank (the one with the clearest context clue) and solve that first. Then use your answer to constrain the remaining blanks. Each blank is scored independently on the GRE, so even getting one right earns partial understanding, but you need ALL blanks correct to get the point. The coherence test is essential: after filling all blanks, read the complete sentence aloud and verify it tells a single, logical story.",
      keyTriggers: [
        "two-blank text completion",
        "three-blank text completion",
        "for each blank select one entry"
      ],
      workedExample: {
        stem:
          "The scientist's findings were initially met with (i)__________, but as other labs (ii)__________ the results, the broader community grew more (iii)__________.\n\nBlank (i): skepticism / enthusiasm / indifference\nBlank (ii): replicated / challenged / ignored\nBlank (iii): accepting / hostile / confused",
        correctAnswer: "skepticism / replicated / accepting",
        walkthrough: [
          "Step 1: Read the whole sentence for the overall story arc. The structure is: initial reaction -> something happened -> community changed its view.",
          "Step 2: Find the most constrained blank. Blank (ii) has the strongest context: 'as other labs [blank] the results' -- labs produce results, and the word 'but' signals the story shifts from negative to positive.",
          "Step 3: Solve Blank (ii): If the community 'grew more [positive]' after labs did something, the labs must have confirmed the findings. 'Replicated' = reproduced the same results.",
          "Step 4: Solve Blank (i): 'Initially met with [blank], BUT...' The 'but' says the initial reaction was the OPPOSITE of the final reaction. If the community ended up accepting, it initially showed 'skepticism.'",
          "Step 5: Solve Blank (iii): The community 'grew more [blank]' after results were replicated. The logical outcome of confirmation is growing more 'accepting.'",
          "Step 6: Coherence check: 'Findings met with skepticism, but as labs replicated results, the community grew more accepting.' This tells a single logical story: doubt -> confirmation -> acceptance."
        ]
      },
      tips: [
        "Never solve blanks left to right. Find the blank with the most direct context clue and solve it first. Use that answer to unlock the others.",
        "After filling all blanks, read the complete sentence as a whole. If any part sounds contradictory or awkward, re-examine your choices -- all blanks must support a single coherent narrative."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["TC-CON", "TC-CONT", "TC-CE", "TC-ELAB", "TC-IRO", "TC-DEG", "TC-DN"]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SENTENCE EQUIVALENCE (3 skills)
  // ─────────────────────────────────────────────────────────────────────────

  "SE-SYN": {
    skillId: "SE-SYN",
    title: "Synonym Pair Recognition",
    category: "sentence_equivalence",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Sentence Equivalence questions present a single sentence with one blank and six answer choices. You must select exactly TWO answers that produce sentences with the same meaning. The core insight is that the two correct answers must create equivalent sentences -- they are usually synonyms or near-synonyms of each other, and both must fit the sentence's context. The GRE designs these questions with deliberate decoys: there are often two pairs of synonyms in the choices, but only one pair fits the sentence. Your job is first to understand what meaning the blank requires (using TC skills like contrast and continuation signals), and then to find the pair of words that both deliver that meaning. Picking two words that are synonyms of each other but do not fit the sentence is one of the most common errors.",
      keyTriggers: [
        "select the two answer choices that produce sentences most alike in meaning",
        "sentence equivalence"
      ],
      workedExample: {
        stem:
          "Despite the book's commercial success, critics found the author's prose style __________.\n\nA) eloquent\nB) pedestrian\nC) innovative\nD) mundane\nE) provocative\nF) acclaimed",
        correctAnswer: "B) pedestrian and D) mundane",
        walkthrough: [
          "Step 1: Identify the signal: 'Despite' sets up a contrast. The blank must oppose 'commercial success.' Critics had a NEGATIVE view.",
          "Step 2: Predict the blank: critics found the prose 'dull' or 'unimpressive' -- something negative that contrasts with the book's popularity.",
          "Step 3: Scan for synonym pairs: (A) eloquent & (C) innovative are both positive but not synonyms of each other. (B) pedestrian & (D) mundane both mean 'ordinary/dull' -- they are synonyms. (E) provocative & (F) acclaimed are positive.",
          "Step 4: Check which pair fits the context: 'pedestrian' and 'mundane' both mean unexceptional or dull. Both fit the 'despite success, critics found it dull' structure.",
          "Step 5: Verify both sentences: 'Critics found the prose pedestrian' and 'Critics found the prose mundane' convey the same meaning.",
          "Step 6: Reject the eloquent/innovative pair -- even if they were synonyms, positive words contradict the 'despite' contrast."
        ]
      },
      tips: [
        "Before scanning answer choices, predict the blank's meaning using TC signal skills (contrast, continuation, cause-effect). Then look for TWO words matching your prediction.",
        "Quickly scan all six choices for synonym pairs. There are usually 2-3 pairs, but only one pair fits the sentence. Identifying all pairs first gives you a decision framework."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "SE-CTX": {
    skillId: "SE-CTX",
    title: "Context-Driven Selection",
    category: "sentence_equivalence",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "While synonym pair recognition helps you identify candidate pairs, context-driven selection ensures both words actually fit the sentence's grammar, logic, and tone. Two words might be synonyms in isolation but fail to work in a specific sentence due to collocational constraints, connotation mismatches, or grammatical incompatibility. For example, 'happy' and 'elated' are synonyms, but 'the results were happy' sounds awkward while 'the results were encouraging' does not. The GRE exploits these subtle differences to test depth of vocabulary knowledge. This skill requires you to plug each candidate word into the sentence individually and read the complete sentence to verify it sounds natural and conveys the intended meaning. If one word of a synonym pair does not fit, you must reject the ENTIRE pair.",
      keyTriggers: [
        "select the two answer choices",
        "sentences most alike in meaning",
        "sentence equivalence"
      ],
      workedExample: {
        stem:
          "The historian's argument, though initially __________, gained credibility when newly discovered documents corroborated her central thesis.\n\nA) compelling\nB) dubious\nC) meticulous\nD) suspect\nE) thorough\nF) persuasive",
        correctAnswer: "B) dubious and D) suspect",
        walkthrough: [
          "Step 1: Read for context: 'though initially [blank], gained credibility.' The 'though' sets up a contrast. The blank describes the argument's initial state, which was the opposite of credible.",
          "Step 2: Predict: the argument was initially 'doubtful' or 'questionable.'",
          "Step 3: Identify synonym pairs: (A) compelling & (F) persuasive = positive pair. (B) dubious & (D) suspect = negative pair meaning 'doubtful.' (C) meticulous & (E) thorough = positive pair about carefulness.",
          "Step 4: The negative pair fits the contrast. Test each word individually.",
          "Step 5: 'Though initially dubious, gained credibility' -- yes, natural. 'Though initially suspect, gained credibility' -- yes, natural. Both produce the same meaning.",
          "Step 6: Reject compelling/persuasive: 'Though initially compelling, gained credibility' is contradictory -- if it was already compelling, why would it need to gain credibility? Context eliminates this pair."
        ]
      },
      tips: [
        "Always test each word of your chosen pair individually in the full sentence. Read the complete sentence aloud (in your head). If either word sounds unnatural or changes the meaning, reject the pair.",
        "Pay attention to connotation, not just denotation. Two words can share a dictionary meaning but carry different emotional weight or formality levels that make one unfit for the context."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["SE-SYN"]
  },

  "SE-TRAP": {
    skillId: "SE-TRAP",
    title: "SE Trap Avoidance",
    category: "sentence_equivalence",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "The GRE builds specific traps into Sentence Equivalence questions. The three most common are: (1) the 'decoy pair' -- two words that are synonyms of each other but do not fit the sentence, designed to lure students who match synonyms without checking context; (2) the 'one perfect + one almost' trap -- one word fits perfectly and another almost fits, tempting you to pick them even though they are not synonyms and do not produce equivalent sentences; (3) the 'attractive singleton' -- a single word that fits beautifully but has no synonym partner among the choices. Recognizing these traps requires discipline: you must verify that your two choices are BOTH (a) appropriate for the context AND (b) produce sentences with the same meaning. Failing either test means the pair is wrong, even if one of the words seems perfect.",
      keyTriggers: [
        "sentence equivalence",
        "select two",
        "most alike in meaning"
      ],
      workedExample: {
        stem:
          "The filmmaker's latest work was __________, combining elements of documentary and fiction in ways that defied easy categorization.\n\nA) conventional\nB) hybrid\nC) derivative\nD) eclectic\nE) orthodox\nF) predictable",
        correctAnswer: "B) hybrid and D) eclectic",
        walkthrough: [
          "Step 1: Read for context: the film 'combined elements' and 'defied easy categorization.' The blank describes this quality of mixing different things.",
          "Step 2: Predict: 'mixed-genre' or 'diverse in its elements.'",
          "Step 3: Identify potential traps. (A) conventional, (E) orthodox, and (F) predictable are all near-synonyms meaning 'standard' -- this is a DECOY TRIPLE. They fit each other but contradict 'defied easy categorization.'",
          "Step 4: (C) derivative means 'copying others' -- it is negative and does not match 'combining elements in new ways.'",
          "Step 5: (B) hybrid means 'combining different elements' and (D) eclectic means 'drawing from diverse sources.' Both fit the context of a mixed-category film.",
          "Step 6: Verify: 'The work was hybrid, combining elements...' and 'The work was eclectic, combining elements...' -- both sentences convey the same meaning. The conventional/orthodox/predictable triple was the trap."
        ]
      },
      tips: [
        "Count the synonym pairs before choosing. If you see three words that are synonyms, the GRE probably planted that group as a decoy. The correct pair is usually smaller and less obvious.",
        "Never select a word just because it 'kind of works.' Both of your chosen words must produce sentences that a native speaker would say mean the same thing. If you have to stretch to make one of them fit, it is probably wrong."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: ["SE-SYN", "SE-CTX"]
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TRAP RECOGNITION (5 skills)
  // ─────────────────────────────────────────────────────────────────────────

  "TRAP-EXT": {
    skillId: "TRAP-EXT",
    title: "Too Extreme",
    category: "trap_recognition",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "The GRE is written by academics, and academics almost never make absolute claims. Answer choices containing words like 'always,' 'never,' 'only,' 'completely,' 'entirely,' or 'solely' are almost always wrong because they make claims that are too strong for any nuanced passage to support. The correct answer typically uses hedging language: 'some,' 'often,' 'may,' 'tends to,' 'in certain cases.' This trap is one of the most reliable elimination tools on the GRE because the test writers deliberately include extreme options to catch students who do not read carefully. If a passage says 'most scientists agree,' an answer saying 'all scientists agree' is wrong -- the word 'all' makes it too extreme. Learning to spot and eliminate extreme language can immediately improve your accuracy on RC questions.",
      keyTriggers: [
        "always",
        "never",
        "only",
        "completely",
        "entirely",
        "solely",
        "absolutely",
        "all",
        "none",
        "every",
        "without exception",
        "invariably"
      ],
      workedExample: {
        stem:
          "A passage states: 'Many evolutionary biologists now believe that environmental pressures, rather than genetic drift alone, played a significant role in the diversification of early mammals.'\n\nWhich of the following can be inferred from the passage?\n\nA) Environmental pressures were the only factor in mammalian diversification.\nB) Genetic drift played no role in the diversification of early mammals.\nC) Some researchers attribute mammalian diversification partly to environmental factors.\nD) All evolutionary biologists reject the genetic drift hypothesis.\nE) Environmental pressures completely explain mammalian diversification.",
        correctAnswer: "C) Some researchers attribute mammalian diversification partly to environmental factors.",
        walkthrough: [
          "Step 1: Read the passage claim carefully: 'Many' (not all) biologists believe environmental pressures played 'a significant role' (not the only role).",
          "Step 2: Check answer A: 'only factor' -- too extreme. The passage says 'significant role,' not 'only factor.' Eliminate.",
          "Step 3: Check answer B: 'no role' for genetic drift -- too extreme. The passage says 'rather than genetic drift alone,' implying drift still plays SOME role. Eliminate.",
          "Step 4: Check answer C: 'Some researchers' (matches 'many'), 'partly' (matches 'significant role'). This is appropriately hedged.",
          "Step 5: Check answer D: 'All evolutionary biologists' -- too extreme. The passage says 'many,' not 'all.' Eliminate.",
          "Step 6: Check answer E: 'completely explain' -- too extreme. The passage says 'significant role,' not 'complete explanation.' Eliminate. Answer C is correct."
        ]
      },
      tips: [
        "When scanning answer choices, circle any absolute words (always, never, only, all, none). These are red flags. An answer with absolute language is correct less than 10% of the time on GRE RC.",
        "Pay attention to the passage's own hedging. If the passage says 'many scientists,' the correct answer will say 'some' or 'many' -- never 'all scientists.'"
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "TRAP-IRR": {
    skillId: "TRAP-IRR",
    title: "True but Irrelevant",
    category: "trap_recognition",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "The 'true but irrelevant' trap is one of the GRE's most effective because the answer choice is factually correct -- it IS something the passage discusses or that is generally true. However, it does not answer the SPECIFIC question being asked. The GRE exploits the fact that students often select an answer because they recognize it from the passage, without checking whether it addresses the question. For example, if a passage discusses both the economic and environmental impacts of deforestation, and the question asks about the environmental impact, an answer describing the economic impact is true (the passage mentions it) but irrelevant (it does not answer THIS question). The discipline is to re-read the question stem after evaluating each answer choice and ask: 'Does this answer what was actually asked?'",
      keyTriggers: [
        "which of the following",
        "the passage suggests",
        "according to the passage",
        "the author's argument about X"
      ],
      workedExample: {
        stem:
          "A passage discusses how the invention of the printing press led to increased literacy rates in Europe, which in turn contributed to the Protestant Reformation by making religious texts available to ordinary people.\n\nThe passage suggests that the Protestant Reformation was facilitated by\n\nA) the development of new ink formulations that improved print quality\nB) the wider availability of religious texts to non-clergy readers\nC) Martin Luther's personal charisma as a public speaker\nD) the decline of the Catholic Church's political authority",
        correctAnswer: "B) the wider availability of religious texts to non-clergy readers",
        walkthrough: [
          "Step 1: Identify the specific question: what facilitated the Protestant Reformation, according to THIS passage?",
          "Step 2: The passage's causal chain: printing press -> increased literacy -> religious texts available to ordinary people -> facilitated Reformation.",
          "Step 3: Check answer A: new ink formulations. This is plausibly true in history and relates to printing, but the passage never mentions ink formulations. True-ish but not in the passage. Eliminate.",
          "Step 4: Check answer B: wider availability of religious texts to non-clergy. This directly matches the passage's stated mechanism. Keep.",
          "Step 5: Check answer C: Luther's charisma. This is historically relevant to the Reformation, and perhaps true, but the passage does not discuss Luther's speaking ability. True but irrelevant to THIS passage. Eliminate.",
          "Step 6: Check answer D: decline of Catholic political authority. This may be historically true and related to the Reformation, but the passage discusses literacy and text availability, not political authority. True but irrelevant. Eliminate."
        ]
      },
      tips: [
        "After evaluating each answer, re-read the question and ask: 'Does this answer the specific question, or does it just relate to the passage's general topic?' Relating to the topic is not enough.",
        "Be especially suspicious of answer choices that contain information you recognize from the passage but from a DIFFERENT part than what the question is asking about. The passage may discuss many things, but the question only asks about one."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "TRAP-REV": {
    skillId: "TRAP-REV",
    title: "Reversal Traps",
    category: "trap_recognition",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Reversal traps flip a relationship stated in the passage. If the passage says 'A caused B,' the trap answer says 'B caused A.' If the passage says 'Smith argues X,' the trap attributes X to Smith's opponent. If the passage says 'the increase in Y led to a decrease in Z,' the trap says 'the decrease in Z led to an increase in Y.' These traps are insidious because they use the same words and concepts from the passage -- they just rearrange the relationships. Speed readers are especially vulnerable because they recognize the familiar terms without checking the direction of the relationship. The GRE uses reversals in approximately 15-20% of incorrect answer choices, making them one of the most common trap types. The antidote is to explicitly check the DIRECTION of every relationship: Who holds which view? What causes what? What came first?",
      keyTriggers: [
        "the passage states that",
        "according to the author",
        "the author attributes",
        "the relationship between"
      ],
      workedExample: {
        stem:
          "A passage states: 'Dr. Yamamoto argued that the shift to agriculture led to increased social stratification, while Dr. Chen maintained that existing social hierarchies actually drove the adoption of agriculture.'\n\nAccording to the passage, Dr. Yamamoto believes that\n\nA) social stratification was a cause of the agricultural revolution\nB) the transition to farming resulted in greater social inequality\nC) Dr. Chen's hypothesis about agriculture is fundamentally correct\nD) social hierarchies and agriculture developed simultaneously",
        correctAnswer: "B) the transition to farming resulted in greater social inequality",
        walkthrough: [
          "Step 1: Carefully map each scholar's position. Dr. Yamamoto: agriculture -> stratification (agriculture CAUSED stratification). Dr. Chen: hierarchies -> agriculture (hierarchies CAUSED agriculture adoption).",
          "Step 2: The question asks about Dr. YAMAMOTO's view. Focus only on his position: agriculture led to stratification.",
          "Step 3: Check answer A: 'stratification was a cause of agriculture.' This REVERSES Yamamoto's claim -- this is actually Dr. Chen's position! Classic reversal trap.",
          "Step 4: Check answer B: 'transition to farming resulted in greater social inequality.' This correctly states Yamamoto's view: agriculture (cause) -> inequality (effect). Keep.",
          "Step 5: Check answer C: Yamamoto agrees with Chen. The passage presents them as holding opposing views. Eliminate.",
          "Step 6: Check answer D: simultaneous development. Neither scholar claims this -- both propose a causal direction. Eliminate. Answer B is correct, and A was the reversal trap."
        ]
      },
      tips: [
        "When a passage presents two or more viewpoints, draw a quick diagram: 'Scholar A: X -> Y. Scholar B: Y -> X.' This visual makes reversals immediately obvious when you check answer choices.",
        "When a question asks about a causal relationship, explicitly check: does the answer preserve the correct cause-and-effect direction? Flip the arrow mentally and see if that is what the answer says. If so, it is a reversal trap."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "TRAP-OOS": {
    skillId: "TRAP-OOS",
    title: "Out of Scope",
    category: "trap_recognition",
    estimatedMinutes: 8,
    sections: {
      explanation:
        "Out-of-scope traps introduce concepts, people, comparisons, or claims that the passage never mentions. They are designed to tempt students who bring outside knowledge to the test or who assume the passage must have discussed something it actually did not. On the GRE, the correct answer to an RC question must be derivable from the passage alone. If an answer choice introduces a new idea -- even one that is factually correct and logically related to the passage's topic -- it is wrong if the passage does not support it. The strongest out-of-scope traps are the ones that feel like obvious extensions of the passage's argument, because they tempt you to think 'well, the author probably would agree with this.' But inference questions require support IN the passage, not reasonable speculation beyond it.",
      keyTriggers: [
        "the passage suggests",
        "the author implies",
        "it can be inferred",
        "the passage supports"
      ],
      workedExample: {
        stem:
          "A passage discusses how coral reefs support marine biodiversity by providing habitat for fish, crustaceans, and marine plants. It notes that rising ocean temperatures threaten reef health through coral bleaching.\n\nThe passage supports which of the following conclusions?\n\nA) Coral reefs are the most important marine ecosystem on Earth.\nB) Rising ocean temperatures may reduce marine biodiversity by damaging reef habitats.\nC) Government regulation of carbon emissions is necessary to protect coral reefs.\nD) Coral bleaching is caused primarily by industrial pollution rather than climate change.",
        correctAnswer: "B) Rising ocean temperatures may reduce marine biodiversity by damaging reef habitats.",
        walkthrough: [
          "Step 1: Map what the passage actually states: (a) reefs support biodiversity by providing habitat, (b) rising temperatures threaten reefs through bleaching.",
          "Step 2: Check answer A: 'most important marine ecosystem.' The passage says reefs support biodiversity but never compares them to other ecosystems. 'Most important' is out of scope.",
          "Step 3: Check answer B: rising temperatures -> reef damage -> reduced biodiversity. This connects two things the passage states: temperatures threaten reefs, and reefs support biodiversity. This is a valid inference within scope.",
          "Step 4: Check answer C: government regulation of carbon emissions. The passage never discusses policy, government, or emissions. This is entirely out of scope, even though it is a reasonable real-world response.",
          "Step 5: Check answer D: industrial pollution as the primary cause. The passage mentions rising temperatures, not industrial pollution specifically. This introduces new content not in the passage.",
          "Step 6: Answer B is correct because it connects only ideas that are explicitly in the passage. All other answers introduce concepts the passage never mentions."
        ]
      },
      tips: [
        "For every answer choice, ask: 'Where in the passage does it say this?' If you cannot point to a specific sentence or pair of sentences that supports the answer, it is likely out of scope.",
        "Be especially cautious with answers that are true in the real world. Your outside knowledge is irrelevant on the GRE -- only the passage matters."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  },

  "TRAP-HALF": {
    skillId: "TRAP-HALF",
    title: "Half-Right Traps",
    category: "trap_recognition",
    estimatedMinutes: 10,
    sections: {
      explanation:
        "Half-right traps are answer choices where the first part is correct but the second part is wrong, or vice versa. They are the GRE's most deceptive trap because they exploit a common reading shortcut: once students recognize a correct element, they stop reading and select the answer. The test writers know this and deliberately construct answers where an accurate opening leads into an inaccurate conclusion. For example, an answer might correctly identify the author's topic but misstate the author's position on it, or correctly describe one part of the passage but incorrectly connect it to another part. The only defense is to read the ENTIRE answer choice, word by word, and verify that every part of it is supported by the passage. If any clause of the answer is wrong, the entire answer is wrong, no matter how right the rest of it is.",
      keyTriggers: [
        "primary purpose",
        "the passage as a whole",
        "the author argues that",
        "which of the following best describes"
      ],
      workedExample: {
        stem:
          "A passage explains that while renewable energy costs have decreased significantly over the past decade, widespread adoption has been slower than expected because existing power grid infrastructure was designed for centralized fossil fuel plants, not distributed renewable sources.\n\nThe primary purpose of the passage is to\n\nA) explain why renewable energy has become less expensive and argue that cost is no longer a barrier to adoption\nB) describe the decrease in renewable energy costs and identify an infrastructure-related obstacle to wider adoption\nC) advocate for government investment in renewable energy infrastructure to replace fossil fuel systems\nD) compare the efficiency of renewable energy sources with that of traditional fossil fuel plants",
        correctAnswer: "B) describe the decrease in renewable energy costs and identify an infrastructure-related obstacle to wider adoption",
        walkthrough: [
          "Step 1: Map the passage's two main points: (a) renewable costs have decreased, (b) grid infrastructure designed for fossil fuels slows adoption.",
          "Step 2: Check answer A: first part ('less expensive') is correct, but second part ('cost is no longer a barrier') goes beyond the passage. The passage says adoption is slow due to INFRASTRUCTURE, not cost. The second half is wrong. This is a half-right trap.",
          "Step 3: Check answer B: first part ('decrease in costs') matches point (a). Second part ('infrastructure-related obstacle') matches point (b). Both halves are correct.",
          "Step 4: Check answer C: 'advocate for government investment' -- the passage describes a problem but never advocates for a specific policy solution. Out of scope.",
          "Step 5: Check answer D: 'compare efficiency' -- the passage discusses cost and infrastructure, not efficiency comparisons. Out of scope.",
          "Step 6: Answer A was the half-right trap: the first clause was accurate, tempting you to select it without reading the second clause carefully. Answer B is correct because both parts are fully supported."
        ]
      },
      tips: [
        "Read answer choices the way a lawyer reads a contract: every word matters. If an answer has two clauses connected by 'and,' 'because,' or 'which,' verify BOTH clauses independently.",
        "Be most vigilant with longer answer choices. The longer the answer, the more room there is to hide an incorrect element after a correct opening."
      ]
    },
    quickCheckQuestionIds: [],
    prerequisiteSkills: []
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Recommended learning order within each category
// ─────────────────────────────────────────────────────────────────────────────

export const LESSON_ORDER: Record<string, string[]> = {
  reading_comprehension: ["RC-STR", "RC-PP", "RC-FN", "RC-INF", "RC-TONE", "RC-SW", "RC-EXC", "RC-VOC"],
  text_completion: ["TC-CON", "TC-CONT", "TC-CE", "TC-ELAB", "TC-IRO", "TC-DEG", "TC-DN", "TC-MB"],
  sentence_equivalence: ["SE-SYN", "SE-CTX", "SE-TRAP"],
  trap_recognition: ["TRAP-EXT", "TRAP-IRR", "TRAP-REV", "TRAP-OOS", "TRAP-HALF"]
};
