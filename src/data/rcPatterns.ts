export interface PatternQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SignalWordCategory {
  category: string;
  words: string[];
}

export interface PatternModule {
  id: string;
  tier: 1 | 2 | 3;
  title: string;
  definition: string;
  functions: string[];
  signalWords: SignalWordCategory[];
  examplePassage: string;
  questions: PatternQuestion[];
}

export const RC_PATTERNS: PatternModule[] = [
  // TIER 1: FUNDAMENTAL LOGICAL RELATIONSHIPS
  {
    id: 'contrast',
    tier: 1,
    title: 'Contrast and Opposition',
    definition: 'Contrast signals that two ideas, phenomena, or positions are being placed in opposition. The author uses contrast to highlight differences, introduce complications, or set up an argument by establishing what something is not.',
    functions: [
      'Structural contrast: Organizing an entire passage around opposing views or phenomena',
      'Local contrast: Introducing a complication, exception, or counterpoint within a paragraph',
      'Definitional contrast: Clarifying a concept by distinguishing it from related ideas'
    ],
    signalWords: [
      {
        category: 'Strong opposition',
        words: ['however', 'but', 'yet', 'nevertheless', 'nonetheless', 'on the contrary', 'in contrast', 'conversely', 'whereas', 'while', 'although', 'though', 'despite', 'notwithstanding', 'rather than']
      },
      {
        category: 'Unexpected outcome',
        words: ['surprisingly', 'paradoxically', 'counterintuitively', 'contrary to expectation']
      },
      {
        category: 'Distinction markers',
        words: ['unlike', 'different from', 'distinct from', 'as opposed to', 'far from']
      }
    ],
    examplePassage: `The attempt to explain the extinction of the dinosaurs has produced two dominant hypotheses. The impact hypothesis holds that a massive asteroid collision triggered catastrophic climate change, while the volcanism hypothesis attributes the extinction to prolonged volcanic activity in the Deccan Traps region. Proponents of the impact hypothesis point to the iridium layer found at the Cretaceous-Paleogene boundary, a signature consistent with extraterrestrial origin. However, recent geological surveys reveal that Deccan volcanism began well before the boundary layer formed and continued for hundreds of thousands of years afterward—a timeline that complicates any simple causal narrative. Unlike the sudden, catastrophic mechanism implied by the impact hypothesis, the volcanism hypothesis suggests a more gradual environmental deterioration. Nevertheless, neither hypothesis alone accounts for the selective nature of the extinction, which devastated some lineages while leaving others relatively unscathed.`,
    questions: [
      {
        id: 'contrast-q1',
        text: 'The author\'s use of "However" in line 5 serves primarily to',
        options: [
          'introduce evidence that undermines the impact hypothesis entirely',
          'present data that complicates a straightforward interpretation of either hypothesis',
          'signal the author\'s preference for the volcanism hypothesis',
          'dismiss the relevance of the iridium layer as evidence'
        ],
        correctAnswer: 1,
        explanation: 'The contrast word "However" introduces geological evidence about Deccan volcanism timing. This evidence doesn\'t destroy the impact hypothesis but rather "complicates any simple causal narrative"—affecting interpretation of both hypotheses. The pattern: contrast words often introduce complications rather than complete refutations.'
      },
      {
        id: 'contrast-q2',
        text: 'The passage suggests that the volcanism hypothesis differs from the impact hypothesis primarily in its',
        options: [
          'reliance on geological rather than astronomical evidence',
          'implied timeline and mechanism of environmental change',
          'ability to explain which species survived the extinction',
          'acceptance among contemporary paleontologists'
        ],
        correctAnswer: 1,
        explanation: 'The passage explicitly contrasts "sudden, catastrophic" (impact) with "gradual environmental deterioration" (volcanism). The word "Unlike" directly signals this distinction. When you see definitional contrast markers, the answer typically restates the explicit difference.'
      },
      {
        id: 'contrast-q3',
        text: 'The word "Nevertheless" in the final sentence functions to',
        options: [
          'concede a point to advocates of the impact hypothesis',
          'introduce a limitation that applies to both hypotheses',
          'signal the author\'s ultimate rejection of both theories',
          'transition to the author\'s preferred explanation'
        ],
        correctAnswer: 1,
        explanation: '"Nevertheless" introduces a shared limitation: neither hypothesis explains selective extinction. This is a classic "concession-pivot" structure where the contrast word signals that despite preceding discussion, a problem remains for both positions.'
      }
    ]
  },
  {
    id: 'cause-effect',
    tier: 1,
    title: 'Cause and Effect',
    definition: 'Cause-and-effect reasoning establishes that one phenomenon produces, leads to, or results in another. GRE passages test whether readers can identify causal claims, distinguish them from mere correlation, and recognize when authors qualify causal assertions.',
    functions: [
      'Direct causation: X produces/causes/leads to Y',
      'Causal mechanism: Explaining how X leads to Y',
      'Disputed causation: Questioning whether X actually causes Y or merely correlates with it',
      'Multiple causation: Several factors contribute to an outcome'
    ],
    signalWords: [
      {
        category: 'Causal verbs',
        words: ['causes', 'produces', 'generates', 'triggers', 'induces', 'leads to', 'results in', 'gives rise to', 'brings about', 'contributes to']
      },
      {
        category: 'Consequential markers',
        words: ['therefore', 'thus', 'hence', 'consequently', 'as a result', 'accordingly', 'for this reason']
      },
      {
        category: 'Explanatory markers',
        words: ['because', 'since', 'due to', 'owing to', 'on account of', 'stems from', 'arises from']
      },
      {
        category: 'Enabling conditions',
        words: ['allows', 'permits', 'enables', 'facilitates', 'makes possible']
      }
    ],
    examplePassage: `The dramatic decline of amphibian populations worldwide has prompted extensive research into potential causes. Early investigators focused on habitat destruction, reasoning that because amphibians require both aquatic and terrestrial environments, they would be disproportionately affected by land-use changes. This explanation, however plausible, could not account for population crashes in pristine wilderness areas. The discovery of chytrid fungus in the 1990s provided a more compelling mechanism: the fungus disrupts electrolyte transport across amphibian skin, thereby impairing cardiac function. Yet chytrid alone cannot explain the pattern of decline. Some populations succumb rapidly while others persist despite infection, suggesting that environmental stressors—particularly increased ultraviolet radiation resulting from ozone depletion—may compromise immune function, thus rendering certain populations more susceptible to fungal pathogenesis. The emerging consensus holds that amphibian decline stems not from any single cause but from synergistic interactions among multiple stressors.`,
    questions: [
      {
        id: 'cause-effect-q1',
        text: 'According to the passage, the habitat destruction hypothesis was initially considered plausible because',
        options: [
          'early evidence linked deforestation rates to amphibian mortality',
          'amphibians\' ecological requirements made them theoretically vulnerable to land-use changes',
          'researchers had not yet discovered the chytrid fungus',
          'wilderness areas showed lower rates of amphibian decline'
        ],
        correctAnswer: 1,
        explanation: 'The passage states that investigators reasoned "because amphibians require both aquatic and terrestrial environments, they would be disproportionately affected." The causal word "because" directly signals the reasoning: their ecological requirements (cause) led to theoretical vulnerability (effect).'
      },
      {
        id: 'cause-effect-q2',
        text: 'The passage indicates that ultraviolet radiation contributes to amphibian decline primarily by',
        options: [
          'directly damaging amphibian skin tissue',
          'accelerating the spread of chytrid fungus',
          'increasing amphibians\' vulnerability to fungal infection',
          'disrupting electrolyte transport mechanisms'
        ],
        correctAnswer: 2,
        explanation: 'Follow the causal chain: UV radiation → compromises immune function → renders populations "more susceptible to fungal pathogenesis." The word "thus" signals the causal connection. Note that option D describes what the fungus does, not UV radiation.'
      },
      {
        id: 'cause-effect-q3',
        text: 'The phrase "synergistic interactions" in the final sentence most likely refers to',
        options: [
          'competition among different hypotheses for scientific acceptance',
          'combined effects that exceed what each stressor would produce independently',
          'the sequential stages of amphibian population collapse',
          'cooperation among researchers studying different potential causes'
        ],
        correctAnswer: 1,
        explanation: '"Synergistic" in scientific contexts means combined effects greater than the sum of parts. The passage argues that multiple stressors interact, explaining why "chytrid alone cannot explain the pattern." The causal structure is multiple causation with interaction effects.'
      }
    ]
  },
  {
    id: 'qualification',
    tier: 1,
    title: 'Qualification and Hedging',
    definition: 'Qualification involves limiting the scope, certainty, or applicability of a claim. Authors hedge to acknowledge uncertainty, prevent overgeneralization, or signal intellectual precision. GRE questions frequently test whether readers notice these subtle limitations.',
    functions: [
      'Epistemic hedging: Signaling uncertainty about truth claims',
      'Scope limitation: Restricting claims to specific contexts, populations, or conditions',
      'Degree modification: Indicating that something is partially but not entirely true',
      'Temporal or conditional qualification: Limiting claims to certain times or circumstances'
    ],
    signalWords: [
      {
        category: 'Uncertainty markers',
        words: ['may', 'might', 'could', 'possibly', 'perhaps', 'probably', 'seemingly', 'apparently', 'presumably', 'arguably', 'plausibly']
      },
      {
        category: 'Partial truth',
        words: ['somewhat', 'partly', 'to some extent', 'in part', 'largely', 'mostly', 'generally', 'typically', 'tends to', 'often']
      },
      {
        category: 'Scope limiters',
        words: ['in certain cases', 'under some conditions', 'in particular contexts', 'with respect to', 'in terms of', 'as regards', 'specifically']
      },
      {
        category: 'Conditional markers',
        words: ['if', 'unless', 'provided that', 'assuming that', 'given that', 'insofar as']
      }
    ],
    examplePassage: `The question of whether scientific paradigms shift through revolutionary ruptures, as Thomas Kuhn famously argued, or through gradual accumulation of evidence remains contested. Kuhn's model may accurately describe certain episodes in the history of physics, particularly the transition from Newtonian mechanics to relativity theory. However, this framework seems less applicable to fields like biology, where Darwin's theory, rather than overthrowing an established paradigm, arguably filled a theoretical vacuum. Moreover, even in physics, the revolutionary model probably overstates the discontinuity between successive theories; Einstein himself acknowledged his debt to classical mechanics, and most working physicists continued to employ Newtonian methods for problems where relativistic effects were negligible. The Kuhnian model, then, appears to capture something genuine about certain dramatic transitions while potentially obscuring the substantial continuities that typically characterize scientific development.`,
    questions: [
      {
        id: 'qualification-q1',
        text: 'The author\'s stance toward Kuhn\'s model can best be described as',
        options: [
          'outright rejection based on counterevidence',
          'qualified acceptance with noted limitations',
          'enthusiastic endorsement of its explanatory power',
          'neutral presentation without evaluation'
        ],
        correctAnswer: 1,
        explanation: 'Count the hedging words: "may accurately describe certain episodes," "seems less applicable," "probably overstates," "appears to capture something genuine while potentially obscuring." This density of qualification signals acceptance with reservations—the author neither fully endorses nor rejects the model.'
      },
      {
        id: 'qualification-q2',
        text: 'The word "arguably" in line 6 functions to',
        options: [
          'introduce a controversial claim that the author ultimately rejects',
          'signal that the subsequent characterization is debatable rather than established fact',
          'dismiss the significance of Darwin\'s contribution to biology',
          'indicate the author\'s strong agreement with the claim'
        ],
        correctAnswer: 1,
        explanation: '"Arguably" is an epistemic hedge indicating debatability. The author presents the claim that Darwin "filled a theoretical vacuum" as a reasonable interpretation rather than established fact. Hedging words in GRE passages often signal that the author is acknowledging interpretive uncertainty.'
      },
      {
        id: 'qualification-q3',
        text: 'Based on the passage, which statement would the author most likely endorse?',
        options: [
          'Kuhn\'s model should be abandoned as fundamentally flawed.',
          'Scientific progress occurs exclusively through gradual accumulation.',
          'The applicability of Kuhn\'s model varies across scientific disciplines and historical episodes.',
          'Revolutionary and gradualist models of scientific change are mutually exclusive.'
        ],
        correctAnswer: 2,
        explanation: 'The passage\'s hedging pattern supports this answer: Kuhn\'s model "may accurately describe certain episodes," is "less applicable" to biology, and "captures something genuine about certain dramatic transitions." The repeated qualification of scope indicates discipline- and context-dependent applicability.'
      }
    ]
  },
  {
    id: 'concession-rebuttal',
    tier: 1,
    title: 'Concession and Rebuttal',
    definition: 'Concession-rebuttal structure involves acknowledging an opposing point or potential objection, then pivoting to dismiss, qualify, or overcome it. This pattern demonstrates intellectual fairness while ultimately advancing the author\'s position.',
    functions: [
      'Strengthening through acknowledgment: Conceding a point makes subsequent rebuttal more credible',
      'Preemptive defense: Addressing objections before critics raise them',
      'Nuanced positioning: Showing that the author\'s view accommodates complexity'
    ],
    signalWords: [
      {
        category: 'Concession markers',
        words: ['admittedly', 'granted', 'to be sure', 'certainly', 'of course', 'it is true that', 'no doubt', 'undeniably', 'while it is true that', 'although']
      },
      {
        category: 'Rebuttal/pivot markers',
        words: ['but', 'however', 'yet', 'nevertheless', 'nonetheless', 'still', 'even so', 'that said', 'be that as it may', 'this does not mean that']
      },
      {
        category: 'Dismissive qualification',
        words: ['merely', 'simply', 'only', 'just', 'at most', 'little more than']
      }
    ],
    examplePassage: `Critics of standardized testing argue that such assessments measure test-taking skills rather than genuine intellectual capacity. Admittedly, there is evidence that targeted preparation can boost scores substantially, suggesting that performance reflects, at least in part, familiarity with test conventions rather than underlying ability. To be sure, this coaching effect represents a legitimate concern for those who would use test scores as measures of innate potential. Nevertheless, the inference that standardized tests therefore lack predictive validity does not follow. Longitudinal studies consistently demonstrate that test scores correlate with academic performance, professional achievement, and other outcomes that no amount of test preparation could directly influence. While coaching may introduce noise into individual measurements, it does not fundamentally compromise the tests' utility as predictors of future success at the population level. The proper conclusion is not that standardized tests measure nothing meaningful, but that they measure a complex amalgam of ability, preparation, and opportunity—a limitation, certainly, but hardly a fatal flaw.`,
    questions: [
      {
        id: 'concession-rebuttal-q1',
        text: 'The author concedes that standardized test critics have identified',
        options: [
          'a fundamental flaw that undermines the validity of all standardized testing',
          'a genuine phenomenon that complicates the interpretation of test scores',
          'evidence that conclusively demonstrates tests measure only test-taking skill',
          'problems that have been adequately addressed by test designers'
        ],
        correctAnswer: 1,
        explanation: 'The concession words "Admittedly" and "To be sure" acknowledge that coaching effects exist and represent "a legitimate concern." However, the pivot word "Nevertheless" introduces the rebuttal. The concession is genuine but limited—the author acknowledges the phenomenon without accepting the critics\' conclusion.'
      },
      {
        id: 'concession-rebuttal-q2',
        text: 'The phrase "at most" in line 3 suggests that the author views the coaching effect as',
        options: [
          'the primary factor determining test performance',
          'a significant limitation that critics have underestimated',
          'limited in its implications for test validity',
          'impossible to quantify with current research methods'
        ],
        correctAnswer: 2,
        explanation: '"At most" is a dismissive qualifier that minimizes the significance of what follows. By saying coaching effects represent "at most" a concern about measuring innate potential, the author implies this is the upper bound of their significance—they don\'t constitute a more serious problem.'
      },
      {
        id: 'concession-rebuttal-q3',
        text: 'The author\'s rebuttal to the critics relies primarily on',
        options: [
          'questioning the methodology of studies demonstrating coaching effects',
          'distinguishing between individual measurement and population-level prediction',
          'arguing that test preparation constitutes a legitimate form of learning',
          'demonstrating that coaching effects have been exaggerated'
        ],
        correctAnswer: 1,
        explanation: 'The rebuttal pivots on this distinction: "While coaching may introduce noise into individual measurements, it does not fundamentally compromise the tests\' utility... at the population level." The author concedes individual-level effects but rebuts by shifting to population-level predictive validity.'
      }
    ]
  },

  // TIER 2: PASSAGE-LEVEL STRUCTURES
  {
    id: 'common-new-view',
    tier: 2,
    title: 'Common View to New View',
    definition: 'This structure introduces a widely held or traditional position, presents evidence or arguments that challenge it, and then articulates a revised understanding. The author\'s position aligns with the "new view."',
    functions: [
      'Intellectual progress narrative: Showing how understanding has evolved',
      'Author positioning: Establishing credibility by engaging with existing scholarship',
      'Argumentative leverage: Using the inadequacy of old views to motivate new ones'
    ],
    signalWords: [
      {
        category: 'Common view markers',
        words: ['traditionally', 'conventionally', 'it has long been thought', 'scholars have generally assumed', 'the standard account holds', 'the received view', 'according to conventional wisdom']
      },
      {
        category: 'Challenge markers',
        words: ['however', 'but', 'recent research suggests', 'this view has been challenged', 'new evidence indicates', 'closer examination reveals']
      },
      {
        category: 'New view markers',
        words: ['instead', 'rather', 'a more accurate understanding', 'emerging consensus', 'current thinking holds', 'we now recognize']
      }
    ],
    examplePassage: `Historians have traditionally characterized the Scientific Revolution of the sixteenth and seventeenth centuries as a decisive break with medieval scholasticism—a triumph of empirical observation and mathematical reasoning over textual authority and Aristotelian dogma. This narrative, however convenient for textbook periodization, obscures substantial continuities between medieval and early modern natural philosophy. Recent scholarship has demonstrated that many "revolutionary" figures drew extensively on scholastic predecessors: Copernicus employed mathematical techniques developed by medieval Islamic astronomers, while Galileo's kinematics built upon the impetus theory formulated by fourteenth-century Parisian scholars. Moreover, the supposedly rigid distinction between medieval reliance on authority and early modern empiricism dissolves upon closer inspection; medieval natural philosophers conducted sophisticated observational programs, while early modern scientists, including Newton, grounded their work in theological premises about divine creation. A more defensible account portrays the Scientific Revolution not as rupture but as transformation—an accelerating development of methods and institutions that had medieval antecedents, shaped decisively by social and economic changes that had little to do with purely intellectual factors.`,
    questions: [
      {
        id: 'common-new-view-q1',
        text: 'The author\'s primary purpose is to',
        options: [
          'defend medieval scholasticism against unfair criticism',
          'argue that the Scientific Revolution never actually occurred',
          'complicate the traditional narrative of revolutionary discontinuity',
          'explain why historians have mischaracterized the sixteenth century'
        ],
        correctAnswer: 2,
        explanation: 'The passage follows the Common View → Challenge → New View structure. The traditional view (revolutionary rupture) is challenged by evidence of continuity, leading to a "more defensible account" emphasizing transformation over rupture. The author\'s purpose aligns with the "challenge" function—complicating rather than entirely replacing the traditional narrative.'
      },
      {
        id: 'common-new-view-q2',
        text: 'The passage suggests that the "received view" of the Scientific Revolution is problematic primarily because it',
        options: [
          'ignores the contributions of non-European scholars',
          'underestimates the intellectual achievements of medieval thinkers',
          'exaggerates the methodological differences between successive periods',
          'fails to account for the role of religious belief in early modern science'
        ],
        correctAnswer: 2,
        explanation: 'The challenge section demonstrates that the "supposedly rigid distinction" between periods "dissolves upon closer inspection." Both medieval empiricism and early modern reliance on authority are documented, suggesting the traditional view overstates methodological discontinuity.'
      },
      {
        id: 'common-new-view-q3',
        text: 'The phrase "however convenient for textbook periodization" primarily serves to',
        options: [
          'acknowledge a practical advantage of the traditional narrative',
          'suggest that historians have prioritized simplicity over accuracy',
          'criticize the structure of contemporary science education',
          'dismiss the traditional narrative as pedagogically useless'
        ],
        correctAnswer: 1,
        explanation: '"However convenient" is a concessive phrase that acknowledges utility while implying inadequacy. The convenience is for textbook simplification, suggesting historians have chosen pedagogical ease over historical accuracy. This is a sophisticated concession-dismissal move.'
      }
    ]
  },
  {
    id: 'phenomenon-explanations',
    tier: 2,
    title: 'Phenomenon to Explanations',
    definition: 'This structure presents a puzzling phenomenon or observation, offers one explanatory account, introduces a competing explanation, and then indicates where the author stands—either favoring one explanation, synthesizing them, or remaining neutral.',
    functions: [
      'Intellectual debate format: Presenting scientific or scholarly controversy',
      'Critical evaluation: Showing the author\'s analytical assessment',
      'Complexity acknowledgment: Demonstrating that simple explanations are insufficient'
    ],
    signalWords: [
      {
        category: 'Phenomenon introduction',
        words: ['curiously', 'puzzlingly', 'the question arises', 'a striking feature', 'what explains', 'how can we account for']
      },
      {
        category: 'First explanation',
        words: ['one hypothesis', 'one explanation', 'some researchers argue', 'according to one view', 'one possibility']
      },
      {
        category: 'Second explanation',
        words: ['alternatively', 'another possibility', 'a competing hypothesis', 'others have suggested', 'a different account']
      },
      {
        category: 'Author\'s position',
        words: ['the evidence suggests', 'more plausibly', 'the most compelling explanation', 'on balance', 'ultimately']
      }
    ],
    examplePassage: `The exceptionally high biodiversity of tropical rainforests has long puzzled ecologists. One prominent explanation invokes evolutionary time: tropical regions, having escaped glaciation, allowed species to accumulate over longer periods than temperate zones, which were repeatedly depopulated during ice ages. An alternative account emphasizes ecological productivity; higher solar energy input supports longer food chains and more specialized niches, permitting greater species packing. Recent empirical work complicates both proposals. Phylogenetic analyses reveal that tropical lineages are not uniformly ancient; many diversified relatively recently, undermining simple time-accumulation models. Meanwhile, productivity-based predictions fail to explain why some highly productive ecosystems, such as estuaries, exhibit relatively modest diversity. A more promising framework integrates evolutionary and ecological mechanisms: climatic stability permits specialization and reduces extinction rates, while consistent productivity supports the dense populations required for speciation to outpace extinction. Neither factor alone suffices; their interaction produces the observed pattern.`,
    questions: [
      {
        id: 'phenomenon-explanations-q1',
        text: 'The author\'s evaluation of the evolutionary time hypothesis is best characterized as',
        options: [
          'unqualified endorsement based on phylogenetic evidence',
          'partial acceptance subject to empirical complications',
          'outright rejection in favor of the productivity hypothesis',
          'neutral presentation without critical assessment'
        ],
        correctAnswer: 1,
        explanation: 'The author acknowledges the evolutionary time hypothesis but notes that phylogenetic analyses reveal complications ("not uniformly ancient," "undermining simple time-accumulation models"). This is neither endorsement nor rejection but qualified acceptance—the hypothesis captures something real but is insufficient alone.'
      },
      {
        id: 'phenomenon-explanations-q2',
        text: 'The reference to estuaries serves primarily to',
        options: [
          'provide evidence supporting the evolutionary time hypothesis',
          'illustrate a limitation of the ecological productivity explanation',
          'demonstrate the superiority of integrative frameworks',
          'introduce a third competing hypothesis'
        ],
        correctAnswer: 1,
        explanation: 'The estuaries example appears after introducing the productivity hypothesis and demonstrates its limitation: high productivity without high diversity. This is a counterexample pattern—using a case that violates predicted relationships to challenge an explanation.'
      },
      {
        id: 'phenomenon-explanations-q3',
        text: 'Based on the passage, the author would most likely agree that tropical biodiversity',
        options: [
          'results primarily from the absence of glaciation in tropical regions',
          'can be fully explained by higher solar energy input',
          'reflects the combined operation of multiple interacting mechanisms',
          'remains fundamentally inexplicable given current scientific methods'
        ],
        correctAnswer: 2,
        explanation: 'The author\'s position favors the integrative framework: "Neither factor alone suffices; their interaction produces the observed pattern." The signal "more promising framework" indicates the author\'s view, and the conclusion explicitly endorses interacting mechanisms over single-factor explanations.'
      }
    ]
  },
  {
    id: 'general-specific',
    tier: 2,
    title: 'General to Specific',
    definition: 'This structure introduces a broad principle, theory, or generalization, then examines specific applications or examples, and concludes with the author\'s evaluative commentary on how well the general claim holds up when tested against particulars.',
    functions: [
      'Theory testing: Assessing whether general claims survive specific scrutiny',
      'Complexity revelation: Showing that broad generalizations require nuance',
      'Critical methodology: Demonstrating rigorous intellectual evaluation'
    ],
    signalWords: [
      {
        category: 'General principle markers',
        words: ['in general', 'broadly speaking', 'as a general rule', 'the principle holds that', 'theoretically']
      },
      {
        category: 'Specific application markers',
        words: ['consider', 'for example', 'take the case of', 'a specific instance', 'in particular', 'when applied to']
      },
      {
        category: 'Evaluative markers',
        words: ['this suggests that', 'we can conclude', 'the implication is', 'this demonstrates', 'the case reveals', 'upon examination']
      }
    ],
    examplePassage: `Economic theory generally predicts that minimum wage increases will reduce employment among low-skilled workers: if the price of labor rises above its market-clearing level, employers will demand less of it. Consider, however, the case of New Jersey's 1992 minimum wage increase, which economists David Card and Alan Krueger examined by comparing employment in New Jersey fast-food restaurants to those in neighboring Pennsylvania, where no increase occurred. Contrary to theoretical prediction, employment in New Jersey establishments actually rose relative to Pennsylvania controls. This finding suggests that the standard competitive model—which assumes perfectly elastic labor demand—may not accurately characterize low-wage labor markets, where employers often possess significant market power. When firms face little competition for workers, they may pay wages below competitive levels; minimum wage increases, rather than creating unemployment, may simply transfer rents from employers to workers. The empirical anomaly, then, does not refute economic logic but rather reveals that the relevant logic depends on institutional context.`,
    questions: [
      {
        id: 'general-specific-q1',
        text: 'The author presents the Card and Krueger study primarily as',
        options: [
          'definitive proof that minimum wage increases benefit workers',
          'an empirical case that complicates a standard theoretical prediction',
          'evidence that economic theory is fundamentally unreliable',
          'a methodologically flawed study that should be disregarded'
        ],
        correctAnswer: 1,
        explanation: 'The General → Specific → Evaluation structure is clear: general theory predicts employment decline, specific case shows increase, evaluation concludes the model\'s applicability "depends on institutional context." The specific case complicates rather than refutes the general principle.'
      },
      {
        id: 'general-specific-q2',
        text: 'The phrase "empirical anomaly" refers to',
        options: [
          'the theoretical prediction that higher wages reduce employment',
          'the existence of employer market power in low-wage sectors',
          'the observed employment increase following the minimum wage hike',
          'the difference between New Jersey and Pennsylvania labor markets'
        ],
        correctAnswer: 2,
        explanation: 'An "anomaly" is something that deviates from expectation. The expectation (from theory) was employment decline; the observation was employment increase. The anomaly is the observed outcome that contradicts theoretical prediction.'
      },
      {
        id: 'general-specific-q3',
        text: 'The author\'s final evaluation suggests that',
        options: [
          'economic theory should be abandoned in favor of empirical observation',
          'minimum wage increases always benefit low-skilled workers',
          'the applicability of economic models depends on market characteristics',
          'employer market power is rare in contemporary labor markets'
        ],
        correctAnswer: 2,
        explanation: 'The evaluation concludes that "the relevant logic depends on institutional context"—specifically, whether employers possess market power. This is a qualified conclusion: the general theory isn\'t wrong, but its applicability varies with market characteristics.'
      }
    ]
  },
  {
    id: 'old-modified',
    tier: 2,
    title: 'Old View Modified',
    definition: 'This structure presents a traditional understanding, then introduces evidence or arguments that modify, refine, or extend it—without overthrowing it entirely. The author\'s contribution is nuance rather than revolution.',
    functions: [
      'Incremental scholarship: Showing how knowledge accumulates through refinement',
      'Sophisticated positioning: Demonstrating that wholesale rejection is unnecessary',
      'Both-and logic: Preserving what\'s valuable while adding complexity'
    ],
    signalWords: [
      {
        category: 'Traditional view markers',
        words: ['traditionally', 'historically', 'the original formulation', 'classical accounts', 'the standard interpretation']
      },
      {
        category: 'Modification markers',
        words: ['while essentially correct', 'this account requires modification', 'a more nuanced view', 'this view, though basically sound, needs qualification', 'recent work has added complexity', 'we should not abandon but rather refine']
      },
      {
        category: 'Extension markers',
        words: ['building on', 'extending this insight', 'in addition to', 'moreover', 'furthermore', 'this picture can be enriched by']
      }
    ],
    examplePassage: `Classical theories of emotion, dating to William James, held that emotional experience arises from the perception of bodily states: we feel afraid because we tremble, not the reverse. This view, while capturing something essential about the embodied nature of emotion, requires significant modification in light of subsequent research. Cognitive appraisal theorists demonstrated that identical physiological states can accompany different emotions depending on how individuals interpret their circumstances—the same racing heart might signal fear or excitement depending on context. This finding suggests that bodily perception, though necessary, is not sufficient for emotional experience; cognitive interpretation plays an indispensable mediating role. More recently, neuroscientific research has revealed that emotion involves distributed brain networks rather than discrete neural "centers," further complicating any simple input-output model. The James-Lange tradition remains valuable as a corrective to purely cognitivist accounts that neglect the body, but a complete theory must integrate physiological, cognitive, and neural levels of analysis. The classical view was not wrong so much as incomplete.`,
    questions: [
      {
        id: 'old-modified-q1',
        text: 'The author\'s attitude toward the James-Lange theory is best described as',
        options: [
          'respectful modification rather than dismissive rejection',
          'qualified endorsement pending further research',
          'neutral presentation of competing interpretations',
          'wholesale rejection based on neuroscientific evidence'
        ],
        correctAnswer: 0,
        explanation: 'The modification-not-rejection pattern is explicit: "while capturing something essential," "requires significant modification," "remains valuable," "not wrong so much as incomplete." This vocabulary signals respect combined with refinement.'
      },
      {
        id: 'old-modified-q2',
        text: 'The passage suggests that cognitive appraisal theorists challenged James\'s view primarily by demonstrating that',
        options: [
          'emotional experience does not require any physiological arousal',
          'different interpretations of the same bodily state produce different emotions',
          'neural networks rather than bodily states determine emotional response',
          'the body plays no meaningful role in emotional experience'
        ],
        correctAnswer: 1,
        explanation: 'The passage states that cognitive appraisal theorists showed "identical physiological states can accompany different emotions depending on how individuals interpret their circumstances." This directly challenges the sufficiency (not necessity) of bodily perception.'
      },
      {
        id: 'old-modified-q3',
        text: 'The phrase "not wrong so much as incomplete" serves to',
        options: [
          'dismiss the classical view as scientifically obsolete',
          'characterize the author\'s modification as additive rather than contradictory',
          'criticize contemporary researchers for abandoning valuable insights',
          'suggest that all theories of emotion are equally valid'
        ],
        correctAnswer: 1,
        explanation: '"Not wrong so much as incomplete" is the definitional statement of the modification pattern. The author is adding to rather than contradicting the classical view—the relationship is "both-and" rather than "either-or."'
      }
    ]
  },

  // TIER 3: SUBTLE RHETORICAL PATTERNS
  {
    id: 'attitude-shifts',
    tier: 3,
    title: 'Author Attitude Shifts',
    definition: 'Some passages present the author\'s attitude as evolving across the text—initial skepticism giving way to qualified acceptance, or apparent endorsement eventually yielding to critique. Tracking these shifts is essential for accurate interpretation.',
    functions: [
      'Intellectual honesty: Showing openness to evidence',
      'Complexity modeling: Demonstrating that simple stances are inadequate',
      'Reader engagement: Building suspense about the author\'s ultimate position'
    ],
    signalWords: [
      {
        category: 'Initial stance markers',
        words: ['initially', 'at first', 'on first inspection', 'one might suppose', 'it would seem', 'prima facie']
      },
      {
        category: 'Shift markers',
        words: ['but upon closer examination', 'however', 'yet', 'on reflection', 'more careful analysis reveals', 'ultimately']
      },
      {
        category: 'Final stance markers',
        words: ['in the end', 'ultimately', 'on balance', 'all things considered', 'the preponderance of evidence suggests']
      }
    ],
    examplePassage: `The argument for free will based on introspective experience appears initially compelling: we seem to perceive ourselves deliberating and choosing, and this phenomenological evidence deserves some epistemic weight. Upon closer examination, however, this evidence proves less decisive than it first appears. The experience of deliberation may be real, but it does not follow that the deliberation causally produces the subsequent action; neural activity preceding conscious awareness of decision has been documented in numerous studies, suggesting that what we experience as "choosing" may be post-hoc narrative construction rather than genuine causal intervention. These findings initially led me to a hard determinist position, dismissive of free will as mere illusion. Yet further reflection revealed that this conclusion was premature. The neural-precedes-conscious pattern, while genuine, leaves open whether conscious states might still influence subsequent behavior through feedback loops not captured by the original experiments. Moreover, the very concept of "free will" may be more complex than the simplistic binary of "illusion versus reality" allows. I now hold that while naive introspectionist defenses of free will cannot stand, neither can reductive eliminativism; the truth likely lies in some reconceptualization that preserves what matters about agency without requiring impossible contra-causal powers.`,
    questions: [
      {
        id: 'attitude-shifts-q1',
        text: 'The author\'s argumentative trajectory across the passage moves from',
        options: [
          'defense of introspection to rejection of all evidence for free will',
          'initial sympathy to skepticism to qualified reconceptualization',
          'dismissal of free will to grudging acknowledgment of uncertainty',
          'presentation of competing views to definitive resolution'
        ],
        correctAnswer: 1,
        explanation: 'Track the attitude markers: "appears initially compelling" (initial sympathy) → "proves less decisive" and "initially led me to hard determinist position" (shift to skepticism) → "premature" and "I now hold" (second shift to qualified reconceptualization). Three distinct phases mark this trajectory.'
      },
      {
        id: 'attitude-shifts-q2',
        text: 'The phrase "what we experience as \'choosing\' may be" suggests that the author views introspective evidence as',
        options: [
          'conclusive proof of libertarian free will',
          'entirely fabricated and epistemically worthless',
          'potentially misleading about causal mechanisms',
          'irrelevant to the philosophical debate'
        ],
        correctAnswer: 2,
        explanation: 'The word "may" is a hedging marker indicating possibility rather than certainty. The author suggests introspective experience might be "post-hoc narrative construction rather than genuine causal intervention"—the experience exists but may misrepresent causal reality.'
      },
      {
        id: 'attitude-shifts-q3',
        text: 'The author\'s final position is best characterized as',
        options: [
          'confident assertion of hard determinism',
          'wholesale endorsement of introspectionist arguments',
          'rejection of both extreme positions in favor of conceptual revision',
          'agnosticism about whether the free will question can be answered'
        ],
        correctAnswer: 2,
        explanation: 'The final stance explicitly rejects both poles: "naive introspectionist defenses... cannot stand, neither can reductive eliminativism." The author advocates "reconceptualization"—a middle path that revises the terms of debate rather than picking a side.'
      }
    ]
  },
  {
    id: 'scope-limitation',
    tier: 3,
    title: 'Scope Limitation and Precision',
    definition: 'Authors carefully limit the scope of their claims to avoid overgeneralization. GRE questions frequently test whether readers notice these limitations, offering answer choices that exceed the stated scope.',
    functions: [
      'Intellectual precision: Demonstrating careful thinking',
      'Trap avoidance: Preventing readers from inferring more than is claimed',
      'Nuance signaling: Showing awareness of complexity'
    ],
    signalWords: [
      {
        category: 'Domain limiters',
        words: ['in this context', 'with respect to', 'in the case of', 'specifically', 'in terms of', 'regarding', 'as concerns', 'limited to']
      },
      {
        category: 'Population limiters',
        words: ['some', 'many', 'most', 'certain', 'particular', 'a subset of', 'among', 'in specific populations']
      },
      {
        category: 'Strength limiters',
        words: ['suggests', 'indicates', 'implies', 'points to', 'is consistent with']
      },
      {
        category: 'Condition limiters',
        words: ['when', 'if', 'under circumstances where', 'provided that', 'in situations involving']
      }
    ],
    examplePassage: `Recent studies of cognitive enhancement technologies have produced cautiously optimistic findings, though their implications require careful parsing. Pharmaceutical agents such as modafinil appear to improve performance on certain types of tasks—specifically, those involving sustained attention and working memory maintenance in sleep-deprived populations. However, these benefits do not generalize straightforwardly to well-rested individuals, nor to tasks requiring creative problem-solving or insight. Moreover, the effect sizes observed, while statistically significant, are modest in practical terms, typically corresponding to improvements of less than one standard deviation. These findings suggest that current cognitive enhancers function more as normalizers of impaired performance than as genuine amplifiers of healthy cognition—a distinction with substantial implications for policy debates surrounding their use. The evidence does not support claims that such substances can transform ordinary cognitive abilities into exceptional ones; it suggests only that they may partially compensate for specific deficits under particular conditions.`,
    questions: [
      {
        id: 'scope-limitation-q1',
        text: 'According to the passage, the benefits of modafinil have been demonstrated for',
        options: [
          'all cognitive tasks in all populations',
          'creative tasks in well-rested individuals',
          'attention and memory tasks in sleep-deprived subjects',
          'any tasks involving working memory'
        ],
        correctAnswer: 2,
        explanation: 'Note the scope limiters: "certain types of tasks—specifically, those involving sustained attention and working memory maintenance in sleep-deprived populations." Every element limits the claim: task type, cognitive domain, and population. The correct answer includes all limitations.'
      },
      {
        id: 'scope-limitation-q2',
        text: 'The author\'s characterization of cognitive enhancers as "normalizers" rather than "amplifiers" serves to',
        options: [
          'dismiss all claims about their effectiveness',
          'limit the scope of their documented benefits',
          'advocate for their widespread adoption',
          'suggest that further research is unnecessary'
        ],
        correctAnswer: 1,
        explanation: 'The normalizer/amplifier distinction limits what enhancement drugs can be claimed to do: they restore impaired function rather than boost healthy function. This is scope limitation in conceptual form—reframing understanding to prevent overextension.'
      },
      {
        id: 'scope-limitation-q3',
        text: 'Which of the following claims would most clearly exceed the scope of the author\'s assertions?',
        options: [
          'Modafinil may improve sustained attention in sleep-deprived populations.',
          'Current evidence does not support cognitive enhancement in healthy individuals.',
          'Effect sizes in enhancement studies are statistically significant but modest.',
          'Cognitive enhancers definitely cannot improve performance in any well-rested person.'
        ],
        correctAnswer: 3,
        explanation: 'The passage says benefits "do not generalize straightforwardly to well-rested individuals"—this is weaker than "definitely cannot improve performance in any." The hedge "do not generalize straightforwardly" leaves room for possible exceptions; "definitely... any" is an absolute claim that exceeds the passage\'s careful qualification.'
      }
    ]
  },
  {
    id: 'paradox',
    tier: 3,
    title: 'Paradox and Tension',
    definition: 'Paradox involves an apparent contradiction that requires explanation or dissolution. Authors introduce paradoxes to frame intellectual puzzles, motivate inquiry, or demonstrate that surface contradictions resolve at a deeper level of analysis.',
    functions: [
      'Attention capture: Paradoxes signal something interesting requires explanation',
      'Complexity flag: Surface appearances may mislead',
      'Argument motivation: The need to resolve paradox drives the author\'s analysis'
    ],
    signalWords: [
      {
        category: 'Paradox markers',
        words: ['paradoxically', 'puzzlingly', 'counterintuitively', 'surprisingly', 'contrary to expectation', 'seemingly contradictory', 'at odds with', 'an apparent contradiction', 'the puzzle deepens']
      },
      {
        category: 'Tension markers',
        words: ['on the one hand... on the other', 'tension between', 'conflict between', 'seemingly incompatible', 'at first glance... but', 'despite']
      },
      {
        category: 'Resolution markers',
        words: ['this apparent contradiction dissolves when', 'the key to understanding', 'the resolution lies in', 'closer inspection reveals']
      }
    ],
    examplePassage: `Modern democratic theory confronts a persistent paradox: citizens in democracies consistently demonstrate low levels of political knowledge, yet democratic institutions in such societies remain remarkably stable and responsive. On standard accounts, informed participation is essential to democratic legitimacy—voters must understand policy options to hold representatives accountable. The empirical reality, however, appears to contradict this requirement. Surveys consistently reveal that majorities cannot name their congressional representatives, identify basic constitutional provisions, or distinguish party positions on major issues. How, then, can democracies function at all? The resolution lies in distinguishing between individual and aggregate rationality. While individual citizens may possess little political information, informational diversity across the electorate permits meaningful preference aggregation. Voters with different sources of information and different priorities effectively "divide the labor" of political monitoring; the errors of the uninformed tend to cancel out, leaving the informed minority disproportionately influential in aggregate outcomes. This "miracle of aggregation" suggests that democratic theory requires not universally informed citizens but only a sufficient diversity of information sources and priorities—a far more achievable condition.`,
    questions: [
      {
        id: 'paradox-q1',
        text: 'The passage frames its central question as a paradox because',
        options: [
          'democratic theory predicts instability that does not occur',
          'citizens claim political knowledge they do not possess',
          'survey methodology consistently underestimates actual knowledge',
          'theoretical requirements for democracy seem unmet yet democracy functions'
        ],
        correctAnswer: 3,
        explanation: 'The paradox structure is explicit: theory says informed participation is "essential," yet "empirical reality... appears to contradict this requirement" while democracies "remain remarkably stable and responsive." The contradiction is between theoretical requirements and observed functioning.'
      },
      {
        id: 'paradox-q2',
        text: 'The phrase "miracle of aggregation" refers to the process by which',
        options: [
          'individual ignorance produces collective wisdom through diversity',
          'democratic institutions gradually educate citizens over time',
          'survey errors cancel out to reveal true knowledge levels',
          'representatives become informed regardless of voter knowledge'
        ],
        correctAnswer: 0,
        explanation: 'The passage explains that "informational diversity" permits "meaningful preference aggregation" despite individual ignorance—"errors of the uninformed tend to cancel out." The "miracle" is collective rationality emerging from individually irrational components.'
      },
      {
        id: 'paradox-q3',
        text: 'The author\'s resolution of the paradox primarily involves',
        options: [
          'denying that citizen knowledge is actually as low as surveys suggest',
          'abandoning the requirement that democratic legitimacy requires informed participation',
          'shifting from individual-level to aggregate-level analysis of democratic functioning',
          'demonstrating that political instability is more common than assumed'
        ],
        correctAnswer: 2,
        explanation: 'The resolution "lies in distinguishing between individual and aggregate rationality." The paradox dissolves when we change the level of analysis—democracy requires not individually informed citizens but aggregate informational diversity. This is a level-shift resolution.'
      }
    ]
  },
  {
    id: 'evidence-types',
    tier: 3,
    title: 'Evidence Types and Rhetorical Function',
    definition: 'GRE passages deploy various forms of evidence—examples, data, expert testimony, analogies, logical reasoning—and understanding their rhetorical function (what they\'re meant to accomplish) is often more important than their specific content.',
    functions: [
      'Illustration: Making abstract claims concrete',
      'Support: Providing reasons to accept claims',
      'Counterexample: Demonstrating that generalizations have exceptions',
      'Concession material: What the author acknowledges before pivoting'
    ],
    signalWords: [
      {
        category: 'Illustrative',
        words: ['for example', 'for instance', 'consider', 'such as', 'to illustrate', 'a case in point']
      },
      {
        category: 'Supportive',
        words: ['studies show', 'evidence suggests', 'research indicates', 'data demonstrate', 'according to']
      },
      {
        category: 'Counterexample',
        words: ['but consider', 'however', 'an exception', 'this does not hold for', 'contrary to this']
      },
      {
        category: 'Analogical',
        words: ['similarly', 'likewise', 'just as', 'parallel to', 'comparable to', 'analogous to']
      }
    ],
    examplePassage: `The effectiveness of economic sanctions as instruments of foreign policy remains contested. Proponents cite cases like South Africa, where sustained international pressure arguably contributed to the dismantling of apartheid, as evidence that sanctions can achieve political objectives. Critics, however, note that such successes may be exceptions rather than the rule; comprehensive studies examining hundreds of sanctions episodes find that fewer than one-third achieved their stated goals. Moreover, even apparent successes resist straightforward interpretation. Consider the South African case more carefully: sanctions coincided with numerous other pressures—internal resistance movements, shifts in Cold War dynamics, economic modernization demands—making it difficult to isolate their independent effect. The methodological problem generalizes: sanctions are typically imposed on regimes already experiencing stress, making it nearly impossible to determine whether subsequent changes result from economic pressure or from the conditions that prompted sanctions in the first place. This is analogous to the difficulty of evaluating medical interventions given to the already sick; improvement might reflect the treatment or simply the natural course of the disease.`,
    questions: [
      {
        id: 'evidence-types-q1',
        text: 'The author\'s reference to South Africa serves primarily to',
        options: [
          'prove that sanctions are ineffective instruments of foreign policy',
          'illustrate both the apparent promise and the interpretive difficulties of sanctions evidence',
          'provide definitive support for sanctions as diplomatic tools',
          'contrast successful cases with unsuccessful ones'
        ],
        correctAnswer: 1,
        explanation: 'South Africa appears twice: first as evidence cited by proponents (apparent success), then reexamined by the author to reveal interpretive difficulties (multiple confounding factors). The example does double duty—illustrating both the pro-sanctions position and its limitations.'
      },
      {
        id: 'evidence-types-q2',
        text: 'The comparison to "medical interventions given to the already sick" is used to',
        options: [
          'argue that sanctions should be applied preventively rather than reactively',
          'suggest that economic policy and medical practice share the same goals',
          'illustrate a general methodological problem affecting sanctions research',
          'criticize doctors for prescribing unnecessary treatments'
        ],
        correctAnswer: 2,
        explanation: 'The medical analogy follows "this is analogous to," signaling explicit comparison. The passage\'s methodological problem (can\'t isolate sanctions\' independent effect) is general, and the analogy makes this abstract point concrete. Analogies in GRE passages typically illuminate difficult concepts.'
      },
      {
        id: 'evidence-types-q3',
        text: 'The statistic about "fewer than one-third" achieving stated goals functions in the passage as',
        options: [
          'conclusive evidence that sanctions never work',
          'support for skepticism about sanctions effectiveness',
          'proof that the South African case was atypical',
          'evidence introduced by proponents of sanctions'
        ],
        correctAnswer: 1,
        explanation: 'The statistic appears in the critics\' arsenal: "Critics, however, note that such successes may be exceptions rather than the rule; comprehensive studies examining hundreds of sanctions episodes find that fewer than one-third achieved their stated goals." It supports skepticism, not certainty—"may be exceptions" is hedged.'
      }
    ]
  }
];

// Tier information for display
export const TIERS = [
  {
    tier: 1 as const,
    title: 'Fundamental Logical Relationships',
    description: 'These patterns form the atomic units of argument structure. Nearly every GRE passage deploys multiple instances of these basic relationships.',
    color: 'blue'
  },
  {
    tier: 2 as const,
    title: 'Passage-Level Structures',
    description: 'These patterns organize entire passages or major sections. They represent the architectural logic that determines how information is sequenced.',
    color: 'purple'
  },
  {
    tier: 3 as const,
    title: 'Subtle Rhetorical Patterns',
    description: 'These patterns involve sophisticated authorial moves that require careful reading to detect. They often appear within other structures.',
    color: 'amber'
  }
];

// Progress tracking types and utilities
export interface RCPatternProgress {
  completedModules: string[];
  scores: Record<string, number>;
  lastAccessed: string | null;
}

const STORAGE_KEY = 'rc_pattern_progress';

export function getProgress(): RCPatternProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading RC pattern progress:', e);
  }
  return {
    completedModules: [],
    scores: {},
    lastAccessed: null
  };
}

export function saveProgress(progress: RCPatternProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving RC pattern progress:', e);
  }
}

export function markModuleCompleted(moduleId: string, score: number): void {
  const progress = getProgress();
  if (!progress.completedModules.includes(moduleId)) {
    progress.completedModules.push(moduleId);
  }
  progress.scores[moduleId] = Math.max(progress.scores[moduleId] || 0, score);
  progress.lastAccessed = moduleId;
  saveProgress(progress);
}

export function getModuleById(moduleId: string): PatternModule | undefined {
  return RC_PATTERNS.find(p => p.id === moduleId);
}

export function getModulesByTier(tier: 1 | 2 | 3): PatternModule[] {
  return RC_PATTERNS.filter(p => p.tier === tier);
}
