import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) env[k.trim()] = v.trim().replace(/"/g, '');
});

// Use service role key for seeding (bypasses RLS)
const supabase = createClient(
    env.VITE_SUPABASE_URL || '',
    env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

// ============================================================================
// SENTENCE EQUIVALENCE - HARD TESTS
// ============================================================================
const sentenceEquivHard = [
    {
        title: 'Sentence Equivalence - Hard Test 1',
        category: 'Sentence Equivalence',
        description: 'Advanced synonym pairs with subtle distinctions.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The professor\'s _______ lectures, packed with digressions and tangential observations, nonetheless contained insights that repaid patient attention.',
                type: 'sentence_equivalence',
                options: ['focused', 'discursive', 'rambling', 'concise', 'terse', 'pointed'],
                correct_answer: [1, 2],
                explanation: '"Digressions and tangential observations" describe unfocused speech. "Discursive" and "rambling" both mean digressing from the main subject. The others suggest focus or brevity.',
                difficulty: 'hard'
            },
            {
                content: 'The diplomat\'s _______ response to the provocation was widely praised as a masterful demonstration of restraint under pressure.',
                type: 'sentence_equivalence',
                options: ['bellicose', 'measured', 'temperate', 'inflammatory', 'incendiary', 'aggressive'],
                correct_answer: [1, 2],
                explanation: '"Restraint under pressure" indicates controlled response. "Measured" and "temperate" both mean showing moderation. The others suggest aggression.',
                difficulty: 'hard'
            },
            {
                content: 'The novelist\'s early work showed _______ promise, but her mature fiction has largely failed to fulfill the expectations raised by her debut.',
                type: 'sentence_equivalence',
                options: ['modest', 'prodigious', 'scant', 'considerable', 'minimal', 'slight'],
                correct_answer: [1, 3],
                explanation: 'High expectations unfulfilled suggest great initial promise. "Prodigious" and "considerable" both mean remarkably great. The others suggest little promise.',
                difficulty: 'hard'
            },
            {
                content: 'The critic\'s _______ dismissal of the exhibition revealed more about her own aesthetic prejudices than about the works on display.',
                type: 'sentence_equivalence',
                options: ['thoughtful', 'cavalier', 'judicious', 'offhand', 'careful', 'considered'],
                correct_answer: [1, 3],
                explanation: 'Revealing prejudices rather than engaging the work suggests hasty judgment. "Cavalier" and "offhand" both mean showing insufficient consideration.',
                difficulty: 'hard'
            },
            {
                content: 'The company\'s _______ commitment to sustainability—announced loudly but implemented halfheartedly—has drawn criticism from environmental advocates.',
                type: 'sentence_equivalence',
                options: ['genuine', 'nominal', 'sincere', 'perfunctory', 'authentic', 'wholehearted'],
                correct_answer: [1, 3],
                explanation: '"Announced loudly but implemented halfheartedly" indicates insincere commitment. "Nominal" and "perfunctory" both mean existing in name only or done without care.',
                difficulty: 'hard'
            },
            {
                content: 'The philosopher\'s arguments, though _______ in their logical construction, rest on premises that few readers will accept without reservation.',
                type: 'sentence_equivalence',
                options: ['fallacious', 'rigorous', 'specious', 'meticulous', 'sloppy', 'flawed'],
                correct_answer: [1, 3],
                explanation: 'Good logic but questionable premises. "Rigorous" and "meticulous" both mean extremely thorough and careful—the logic is sound even if premises aren\'t.',
                difficulty: 'hard'
            },
            {
                content: 'The author\'s _______ style, which eschews ornamentation in favor of stark directness, has won both devoted admirers and impatient detractors.',
                type: 'sentence_equivalence',
                options: ['florid', 'austere', 'ornate', 'spartan', 'baroque', 'elaborate'],
                correct_answer: [1, 3],
                explanation: '"Eschews ornamentation" and "stark directness" indicate simplicity. "Austere" and "spartan" both mean severely simple or unadorned.',
                difficulty: 'hard'
            },
            {
                content: 'The regime\'s _______ treatment of dissidents, while stopping short of outright persecution, created an atmosphere of pervasive fear.',
                type: 'sentence_equivalence',
                options: ['benevolent', 'menacing', 'humanitarian', 'intimidating', 'charitable', 'kindly'],
                correct_answer: [1, 3],
                explanation: '"Pervasive fear" without outright persecution suggests threatening behavior. "Menacing" and "intimidating" both mean causing fear or threat.',
                difficulty: 'hard'
            },
            {
                content: 'The scientist\'s _______ hypothesis, which challenged decades of established consensus, was vindicated by subsequent experimental findings.',
                type: 'sentence_equivalence',
                options: ['orthodox', 'heterodox', 'conventional', 'iconoclastic', 'mainstream', 'traditional'],
                correct_answer: [1, 3],
                explanation: '"Challenged decades of established consensus" indicates unconventional thinking. "Heterodox" and "iconoclastic" both mean going against established beliefs.',
                difficulty: 'hard'
            },
            {
                content: 'The executive\'s _______ approach to decision-making—weighing every option at excruciating length—frequently caused the company to miss time-sensitive opportunities.',
                type: 'sentence_equivalence',
                options: ['decisive', 'deliberate', 'impulsive', 'methodical', 'rash', 'hasty'],
                correct_answer: [1, 3],
                explanation: '"Excruciating length" leading to missed opportunities suggests over-careful. "Deliberate" and "methodical" both mean done consciously and with careful consideration.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Sentence Equivalence - Hard Test 2',
        category: 'Sentence Equivalence',
        description: 'Expert-level vocabulary with near-synonym distinctions.',
        time_limit_minutes: 18,
        questions: [
            {
                content: 'The memoir\'s _______ account of the author\'s failures, which spares no unflattering detail, has been praised for its emotional honesty.',
                type: 'sentence_equivalence',
                options: ['sanitized', 'unflinching', 'guarded', 'unsparing', 'evasive', 'reticent'],
                correct_answer: [1, 3],
                explanation: '"Spares no unflattering detail" indicates complete honesty. "Unflinching" and "unsparing" both mean not avoiding difficult truths.',
                difficulty: 'hard'
            },
            {
                content: 'The artist\'s _______ experimentation with new media, though initially viewed as frivolous, eventually yielded her most significant works.',
                type: 'sentence_equivalence',
                options: ['timid', 'audacious', 'cautious', 'intrepid', 'hesitant', 'tentative'],
                correct_answer: [1, 3],
                explanation: 'Experimentation viewed as frivolous suggests boldness. "Audacious" and "intrepid" both mean showing willingness to take bold risks.',
                difficulty: 'hard'
            },
            {
                content: 'The historian\'s _______ research into previously sealed archives uncovered evidence that fundamentally altered our understanding of the period.',
                type: 'sentence_equivalence',
                options: ['superficial', 'exhaustive', 'cursory', 'painstaking', 'perfunctory', 'hasty'],
                correct_answer: [1, 3],
                explanation: 'Uncovering previously hidden evidence suggests thoroughness. "Exhaustive" and "painstaking" both mean done with great care and thoroughness.',
                difficulty: 'hard'
            },
            {
                content: 'The politician\'s _______ rhetoric, which cast complex issues in starkly moralistic terms, appealed to voters seeking simple answers to difficult questions.',
                type: 'sentence_equivalence',
                options: ['nuanced', 'Manichaean', 'subtle', 'simplistic', 'sophisticated', 'balanced'],
                correct_answer: [1, 3],
                explanation: '"Starkly moralistic" and "simple answers" indicate black-and-white thinking. "Manichaean" (seeing things as good vs. evil) and "simplistic" both mean overly simple.',
                difficulty: 'hard'
            },
            {
                content: 'The composer\'s _______ output—merely a handful of works over three decades—stands in stark contrast to the prolific productivity of his contemporaries.',
                type: 'sentence_equivalence',
                options: ['copious', 'meager', 'abundant', 'sparse', 'voluminous', 'prodigious'],
                correct_answer: [1, 3],
                explanation: '"Merely a handful over three decades" indicates small quantity. "Meager" and "sparse" both mean inadequate in amount or extent.',
                difficulty: 'hard'
            },
            {
                content: 'The witness\'s _______ testimony, riddled with contradictions and improbabilities, ultimately undermined the prosecution\'s case.',
                type: 'sentence_equivalence',
                options: ['credible', 'dubious', 'reliable', 'suspect', 'trustworthy', 'dependable'],
                correct_answer: [1, 3],
                explanation: '"Contradictions and improbabilities" undermining the case indicate unreliability. "Dubious" and "suspect" both mean questionable or not to be trusted.',
                difficulty: 'hard'
            },
            {
                content: 'The negotiator\'s _______ persistence, which kept talks alive through seemingly insurmountable obstacles, eventually produced an agreement that few had thought possible.',
                type: 'sentence_equivalence',
                options: ['wavering', 'dogged', 'faltering', 'tenacious', 'irresolute', 'unsteady'],
                correct_answer: [1, 3],
                explanation: 'Overcoming insurmountable obstacles requires determination. "Dogged" and "tenacious" both mean persisting despite difficulties.',
                difficulty: 'hard'
            },
            {
                content: 'The critic\'s _______ praise for the exhibition—extravagant in its language but vague in its specifics—left readers uncertain what exactly had impressed her.',
                type: 'sentence_equivalence',
                options: ['measured', 'effusive', 'restrained', 'gushing', 'temperate', 'moderate'],
                correct_answer: [1, 3],
                explanation: '"Extravagant in language" indicates excessive expression. "Effusive" and "gushing" both mean expressing feelings too freely or excessively.',
                difficulty: 'hard'
            },
            {
                content: 'The professor\'s _______ standards for scholarly work, which tolerated no lapses in rigor or precision, intimidated students but ultimately improved their research.',
                type: 'sentence_equivalence',
                options: ['lenient', 'exacting', 'relaxed', 'stringent', 'indulgent', 'permissive'],
                correct_answer: [1, 3],
                explanation: '"Tolerated no lapses" indicates high demands. "Exacting" and "stringent" both mean demanding strict attention to detail.',
                difficulty: 'hard'
            },
            {
                content: 'The documentary\'s _______ treatment of its subject, which declines to take a clear position, has frustrated viewers who wanted moral clarity.',
                type: 'sentence_equivalence',
                options: ['partisan', 'equivocal', 'biased', 'noncommittal', 'tendentious', 'slanted'],
                correct_answer: [1, 3],
                explanation: '"Declines to take a clear position" indicates ambiguity. "Equivocal" and "noncommittal" both mean avoiding commitment to a definite position.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// READING COMPREHENSION - HARD TESTS
// ============================================================================
const readingCompHard = [
    {
        title: 'Reading Comprehension - Hard Test 1',
        category: 'Reading Comprehension',
        description: 'Complex academic passages requiring careful analysis.',
        time_limit_minutes: 25,
        questions: [
            {
                content: `PASSAGE: The notion that scientific theories are simply "read off" from nature through neutral observation has long been challenged by historians and philosophers of science. According to the theory-ladenness thesis, observation itself is shaped by the theoretical frameworks observers bring to their investigations. Scientists working within different paradigms may literally see different things when examining the same phenomena, as their prior commitments influence not only the interpretation of data but the very perception of what counts as relevant data in the first place. This view, most forcefully articulated by Thomas Kuhn, has radical implications: if observation cannot provide a neutral arbiter between competing theories, the traditional picture of scientific progress as steady accumulation of objective knowledge becomes untenable.

Critics of the theory-ladenness thesis argue that it leads to an unacceptable relativism. If all observation is theory-laden, they contend, then there can be no objective grounds for preferring one theory over another, and science becomes just another form of socially constructed belief. Defenders respond that acknowledging the role of theoretical presuppositions in observation need not lead to wholesale relativism; intersubjective agreement among scientists with different theoretical commitments provides a practical, if imperfect, check on purely idiosyncratic interpretations.

QUESTION: The author presents the theory-ladenness thesis primarily as`,
                type: 'single_choice',
                options: [
                    'an established scientific fact',
                    'a discredited philosophical position',
                    'a challenge to traditional views of scientific objectivity',
                    'the only viable account of scientific progress',
                    'a theory that has been proven by empirical research'
                ],
                correct_answer: [2],
                explanation: 'The passage presents theory-ladenness as having "challenged" traditional views and having "radical implications" for how we understand scientific progress—it challenges traditional objectivity claims.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The notion that scientific theories are simply "read off" from nature through neutral observation has long been challenged by historians and philosophers of science. According to the theory-ladenness thesis, observation itself is shaped by the theoretical frameworks observers bring to their investigations. Scientists working within different paradigms may literally see different things when examining the same phenomena, as their prior commitments influence not only the interpretation of data but the very perception of what counts as relevant data in the first place. This view, most forcefully articulated by Thomas Kuhn, has radical implications: if observation cannot provide a neutral arbiter between competing theories, the traditional picture of scientific progress as steady accumulation of objective knowledge becomes untenable.

Critics of the theory-ladenness thesis argue that it leads to an unacceptable relativism. If all observation is theory-laden, they contend, then there can be no objective grounds for preferring one theory over another, and science becomes just another form of socially constructed belief. Defenders respond that acknowledging the role of theoretical presuppositions in observation need not lead to wholesale relativism; intersubjective agreement among scientists with different theoretical commitments provides a practical, if imperfect, check on purely idiosyncratic interpretations.

QUESTION: According to the passage, defenders of the theory-ladenness thesis would most likely argue that`,
                type: 'single_choice',
                options: [
                    'scientific knowledge is purely subjective',
                    'all theories are equally valid',
                    'objectivity is achievable through agreement among differently-committed scientists',
                    'observation is never influenced by prior beliefs',
                    'relativism is the only logical conclusion from their position'
                ],
                correct_answer: [2],
                explanation: 'Defenders argue that "intersubjective agreement among scientists with different theoretical commitments provides a practical...check"—objectivity through agreement, not pure subjectivity.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The concept of "rational choice" has been foundational to economic theory since the Enlightenment, positing that individuals make decisions by calculating the costs and benefits of available options and selecting whichever maximizes their utility. Yet behavioral economists have documented systematic departures from this model: people exhibit loss aversion, valuing losses more heavily than equivalent gains; they discount future rewards hyperbolically rather than exponentially; they are susceptible to framing effects that alter preferences based on how options are presented rather than their substantive content.

These findings have prompted divergent responses. Some economists argue that apparent irrationalities are artifacts of experimental design or can be incorporated into expanded utility functions without abandoning the rational choice framework. Others contend that the mounting evidence of cognitive biases necessitates a fundamental reconceptualization of human decision-making, one that takes seriously the heuristics and mental shortcuts that actually guide behavior. A third group suggests that the very notion of "rationality" in this debate is too narrowly conceived: what appears irrational from the perspective of individual utility maximization may be perfectly rational when understood in evolutionary or social context.

QUESTION: The author's attitude toward rational choice theory can best be described as`,
                type: 'single_choice',
                options: [
                    'uncritical acceptance',
                    'outright rejection',
                    'balanced presentation of challenges and responses',
                    'dismissive contempt',
                    'nostalgic appreciation'
                ],
                correct_answer: [2],
                explanation: 'The author presents behavioral findings that challenge rational choice, then describes three different responses without endorsing any—a balanced presentation of challenges and responses.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The concept of "rational choice" has been foundational to economic theory since the Enlightenment, positing that individuals make decisions by calculating the costs and benefits of available options and selecting whichever maximizes their utility. Yet behavioral economists have documented systematic departures from this model: people exhibit loss aversion, valuing losses more heavily than equivalent gains; they discount future rewards hyperbolically rather than exponentially; they are susceptible to framing effects that alter preferences based on how options are presented rather than their substantive content.

These findings have prompted divergent responses. Some economists argue that apparent irrationalities are artifacts of experimental design or can be incorporated into expanded utility functions without abandoning the rational choice framework. Others contend that the mounting evidence of cognitive biases necessitates a fundamental reconceptualization of human decision-making, one that takes seriously the heuristics and mental shortcuts that actually guide behavior. A third group suggests that the very notion of "rationality" in this debate is too narrowly conceived: what appears irrational from the perspective of individual utility maximization may be perfectly rational when understood in evolutionary or social context.

QUESTION: The "third group" mentioned in the passage would most likely agree that`,
                type: 'single_choice',
                options: [
                    'behavioral economics findings are methodologically flawed',
                    'the traditional definition of rationality is adequate',
                    'behavior that seems irrational may serve broader purposes',
                    'cognitive biases should be eliminated from decision-making',
                    'individual utility maximization is the only valid criterion for rationality'
                ],
                correct_answer: [2],
                explanation: 'The third group suggests behavior appearing irrational "from individual utility maximization" may be "perfectly rational when understood in evolutionary or social context"—broader purposes make sense of it.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The rediscovery of Aristotle's works in medieval Europe, mediated through Arabic translations and commentaries, posed both an opportunity and a challenge for Christian theology. Aristotelian philosophy offered a sophisticated conceptual framework for understanding nature, logic, and ethics—tools that theologians eagerly adopted. Yet Aristotle's conclusions often conflicted with Christian doctrine: his belief in the eternity of the world contradicted the biblical account of creation; his naturalistic psychology seemed to leave no room for the immortal soul; his ethical focus on earthly happiness appeared to diminish the importance of salvation.

Thomas Aquinas's achievement was to synthesize Aristotelian philosophy with Christian theology in a manner that preserved what he considered valuable in each while subordinating philosophical conclusions to revealed truth when they conflicted. Critics then and now have questioned whether this synthesis was coherent or merely a diplomatic compromise that papered over fundamental incompatibilities. Defenders argue that Aquinas demonstrated how faith and reason could operate in distinct but complementary spheres—a solution whose influence extends far beyond medieval theology into contemporary debates about the relationship between science and religion.

QUESTION: The passage suggests that Aristotelian philosophy was problematic for medieval Christian theologians primarily because`,
                type: 'single_choice',
                options: [
                    'it was written in Arabic',
                    'it was too unsophisticated for theological purposes',
                    'some of its conclusions contradicted Christian beliefs',
                    'it had no relevance to ethical questions',
                    'it completely rejected the possibility of an afterlife'
                ],
                correct_answer: [2],
                explanation: 'The passage states Aristotle\'s "conclusions often conflicted with Christian doctrine" and provides specific examples—eternity of the world, naturalistic psychology, earthly happiness focus.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The rediscovery of Aristotle's works in medieval Europe, mediated through Arabic translations and commentaries, posed both an opportunity and a challenge for Christian theology. Aristotelian philosophy offered a sophisticated conceptual framework for understanding nature, logic, and ethics—tools that theologians eagerly adopted. Yet Aristotle's conclusions often conflicted with Christian doctrine: his belief in the eternity of the world contradicted the biblical account of creation; his naturalistic psychology seemed to leave no room for the immortal soul; his ethical focus on earthly happiness appeared to diminish the importance of salvation.

Thomas Aquinas's achievement was to synthesize Aristotelian philosophy with Christian theology in a manner that preserved what he considered valuable in each while subordinating philosophical conclusions to revealed truth when they conflicted. Critics then and now have questioned whether this synthesis was coherent or merely a diplomatic compromise that papered over fundamental incompatibilities. Defenders argue that Aquinas demonstrated how faith and reason could operate in distinct but complementary spheres—a solution whose influence extends far beyond medieval theology into contemporary debates about the relationship between science and religion.

QUESTION: According to the passage, defenders of Aquinas's synthesis would most likely respond to critics by arguing that`,
                type: 'single_choice',
                options: [
                    'Aristotle was wrong about everything',
                    'Christian theology has no need for philosophy',
                    'faith and reason can each have their proper domain',
                    'the incompatibilities are real and cannot be resolved',
                    'medieval theology is irrelevant to modern debates'
                ],
                correct_answer: [2],
                explanation: 'Defenders argue Aquinas showed "how faith and reason could operate in distinct but complementary spheres"—each has its proper domain, addressing the coherence concern.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Environmental economists have increasingly advocated for "cap-and-trade" systems as a market-based solution to pollution problems. Under such systems, regulators set a cap on total emissions and issue permits that polluters must hold to emit. These permits can be traded, creating a market price for pollution that theoretically encourages the most efficient allocation of emission reductions. Firms that can reduce emissions cheaply will do so and sell their excess permits; firms facing high reduction costs will buy permits instead, ensuring that reductions occur where they are least expensive.

Proponents argue that cap-and-trade achieves environmental goals more efficiently than traditional "command-and-control" regulations, which mandate specific technologies or emission levels for each source. Critics raise several objections: the initial allocation of permits often favors established polluters over new entrants; market volatility can undermine planning certainty for both firms and regulators; and the commodification of pollution rights offends those who view environmental protection as a moral imperative rather than an economic calculation. Perhaps most fundamentally, critics question whether the efficiency gains of market mechanisms justify ceding regulatory authority over environmental protection to market forces.

QUESTION: Based on the passage, a critic of cap-and-trade would be most likely to express concern that such systems`,
                type: 'single_choice',
                options: [
                    'are too expensive for governments to implement',
                    'reduce pollution more quickly than necessary',
                    'treat environmental protection primarily as an economic rather than moral issue',
                    'give too much power to environmental regulators',
                    'fail to create any incentive for firms to reduce emissions'
                ],
                correct_answer: [2],
                explanation: 'Critics argue "commodification of pollution rights offends those who view environmental protection as a moral imperative rather than an economic calculation"—the concern is moral vs. economic framing.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Environmental economists have increasingly advocated for "cap-and-trade" systems as a market-based solution to pollution problems. Under such systems, regulators set a cap on total emissions and issue permits that polluters must hold to emit. These permits can be traded, creating a market price for pollution that theoretically encourages the most efficient allocation of emission reductions. Firms that can reduce emissions cheaply will do so and sell their excess permits; firms facing high reduction costs will buy permits instead, ensuring that reductions occur where they are least expensive.

Proponents argue that cap-and-trade achieves environmental goals more efficiently than traditional "command-and-control" regulations, which mandate specific technologies or emission levels for each source. Critics raise several objections: the initial allocation of permits often favors established polluters over new entrants; market volatility can undermine planning certainty for both firms and regulators; and the commodification of pollution rights offends those who view environmental protection as a moral imperative rather than an economic calculation. Perhaps most fundamentally, critics question whether the efficiency gains of market mechanisms justify ceding regulatory authority over environmental protection to market forces.

QUESTION: The passage implies that traditional "command-and-control" regulations differ from cap-and-trade primarily in that they`,
                type: 'single_choice',
                options: [
                    'are more efficient at reducing pollution',
                    'do not set any limits on emissions',
                    'prescribe specific requirements rather than allowing market flexibility',
                    'have no associated costs for polluters',
                    'were never widely implemented'
                ],
                correct_answer: [2],
                explanation: 'Command-and-control "mandate specific technologies or emission levels for each source"—they prescribe specifics rather than allowing the flexible market trading that cap-and-trade uses.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The debate over artificial intelligence's potential to achieve human-like consciousness reveals deep disagreements about the nature of mind itself. Functionalists argue that mental states are defined by their functional roles—their causal relationships to inputs, outputs, and other mental states—rather than by their physical substrate. On this view, a computer program that perfectly replicated these functional relationships would genuinely have mental states, including consciousness. The physical medium, whether neurons or silicon, would be irrelevant.

Critics of functionalism, however, argue that it ignores the subjective, qualitative dimension of conscious experience—what philosophers call "qualia." The experience of seeing red, feeling pain, or tasting coffee has an intrinsic phenomenal character that seems to resist functional analysis. A computer might process visual information identically to a human brain, these critics argue, yet lack any inner experience whatsoever. This "hard problem" of consciousness—explaining why physical processes give rise to subjective experience at all—remains unresolved, and some philosophers argue it may be fundamentally unsolvable using our current conceptual tools.

QUESTION: The functionalist view described in the passage would most directly imply that`,
                type: 'single_choice',
                options: [
                    'consciousness cannot exist without biological neurons',
                    'subjective experience is the only important aspect of mind',
                    'a sufficiently sophisticated computer could be genuinely conscious',
                    'the "hard problem" of consciousness has been solved',
                    'qualia are the primary characteristic of mental states'
                ],
                correct_answer: [2],
                explanation: 'Functionalists hold that "a computer program that perfectly replicated these functional relationships would genuinely have mental states"—the medium doesn\'t matter, so computers could be conscious.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The debate over artificial intelligence's potential to achieve human-like consciousness reveals deep disagreements about the nature of mind itself. Functionalists argue that mental states are defined by their functional roles—their causal relationships to inputs, outputs, and other mental states—rather than by their physical substrate. On this view, a computer program that perfectly replicated these functional relationships would genuinely have mental states, including consciousness. The physical medium, whether neurons or silicon, would be irrelevant.

Critics of functionalism, however, argue that it ignores the subjective, qualitative dimension of conscious experience—what philosophers call "qualia." The experience of seeing red, feeling pain, or tasting coffee has an intrinsic phenomenal character that seems to resist functional analysis. A computer might process visual information identically to a human brain, these critics argue, yet lack any inner experience whatsoever. This "hard problem" of consciousness—explaining why physical processes give rise to subjective experience at all—remains unresolved, and some philosophers argue it may be fundamentally unsolvable using our current conceptual tools.

QUESTION: The term "qualia" as used in the passage refers to`,
                type: 'single_choice',
                options: [
                    'the functional relationships between mental states',
                    'the physical substrate of consciousness',
                    'the subjective, qualitative aspects of conscious experience',
                    'the causal relationships between inputs and outputs',
                    'the computational processes underlying thought'
                ],
                correct_answer: [2],
                explanation: 'The passage defines qualia as "the subjective, qualitative dimension of conscious experience"—the phenomenal character of experiences like seeing red or feeling pain.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Reading Comprehension - Hard Test 2',
        category: 'Reading Comprehension',
        description: 'Sophisticated passages on science, philosophy, and society.',
        time_limit_minutes: 25,
        questions: [
            {
                content: `PASSAGE: The concept of "scientific revolution" as a discrete historical event has been increasingly questioned by historians of science. The traditional narrative, popularized by Thomas Kuhn and others, depicts scientific change as punctuated by dramatic paradigm shifts that fundamentally transform how scientists perceive and investigate nature. Yet detailed historical studies have revealed far more continuity between supposedly revolutionary and normal periods than this narrative suggests. Ideas attributed to revolutionary figures often had extensive precedents; "revolutionary" discoveries were frequently anticipated or developed independently by multiple researchers; and the uptake of new frameworks was typically gradual rather than sudden.

These findings have led some historians to advocate abandoning the revolution metaphor entirely in favor of evolutionary models of scientific change that emphasize cumulative development. Others argue that the revisionist critique goes too far, obscuring the genuine discontinuities that do occur in scientific development. The most sophisticated accounts now attempt to preserve insights from both perspectives, recognizing that scientific change involves complex interactions between continuous and discontinuous elements that resist simple characterization.

QUESTION: The passage suggests that the "traditional narrative" of scientific change`,
                type: 'single_choice',
                options: [
                    'has been completely vindicated by historical research',
                    'overemphasizes discontinuity at the expense of continuity',
                    'was never taken seriously by historians',
                    'applies only to the physical sciences',
                    'has been universally abandoned by scholars'
                ],
                correct_answer: [1],
                explanation: 'Historical studies "revealed far more continuity between supposedly revolutionary and normal periods than this narrative suggests"—the traditional narrative overemphasized discontinuity.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The concept of "scientific revolution" as a discrete historical event has been increasingly questioned by historians of science. The traditional narrative, popularized by Thomas Kuhn and others, depicts scientific change as punctuated by dramatic paradigm shifts that fundamentally transform how scientists perceive and investigate nature. Yet detailed historical studies have revealed far more continuity between supposedly revolutionary and normal periods than this narrative suggests. Ideas attributed to revolutionary figures often had extensive precedents; "revolutionary" discoveries were frequently anticipated or developed independently by multiple researchers; and the uptake of new frameworks was typically gradual rather than sudden.

These findings have led some historians to advocate abandoning the revolution metaphor entirely in favor of evolutionary models of scientific change that emphasize cumulative development. Others argue that the revisionist critique goes too far, obscuring the genuine discontinuities that do occur in scientific development. The most sophisticated accounts now attempt to preserve insights from both perspectives, recognizing that scientific change involves complex interactions between continuous and discontinuous elements that resist simple characterization.

QUESTION: The author would most likely agree that the study of scientific change`,
                type: 'single_choice',
                options: [
                    'should focus exclusively on revolutionary moments',
                    'requires recognizing both continuous and discontinuous elements',
                    'proves that scientific progress is purely gradual',
                    'is irrelevant to contemporary science',
                    'has reached a definitive conclusion'
                ],
                correct_answer: [1],
                explanation: 'The "most sophisticated accounts" (which the author favors) "attempt to preserve insights from both perspectives, recognizing...complex interactions between continuous and discontinuous elements."',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Legal theorists have long debated whether judicial interpretation should be constrained by the original meaning of legal texts or should evolve to address changing circumstances. Originalists argue that fidelity to original meaning is essential to the rule of law: if judges can reinterpret texts to mean whatever they think best, constitutional provisions become mere suggestions that constrain no one. Living constitutionalists counter that rigid adherence to original meaning would freeze law in the moral and practical assumptions of an earlier era, producing results that neither the framers nor contemporary citizens would endorse.

Recent scholarship has complicated this debate by questioning whether "original meaning" is even a coherent concept. Texts are inevitably indeterminate; the framers themselves often disagreed about meaning; and the very concepts used in legal texts may have shifted in ways that make historical reconstruction impossible. Some scholars argue that the real divide is not between originalism and living constitutionalism but between different views about the legitimate sources of constitutional authority—text, structure, history, precedent, or evolving social consensus—and how to weigh them when they conflict.

QUESTION: According to the passage, recent scholarship has contributed to the debate by`,
                type: 'single_choice',
                options: [
                    'proving that originalism is the only valid approach',
                    'demonstrating that living constitutionalism is incoherent',
                    'questioning whether "original meaning" is a clear concept',
                    'showing that the framers all agreed on constitutional interpretation',
                    'establishing that precedent should always be decisive'
                ],
                correct_answer: [2],
                explanation: '"Recent scholarship has complicated this debate by questioning whether \'original meaning\' is even a coherent concept"—challenging the foundational assumption of originalism.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Legal theorists have long debated whether judicial interpretation should be constrained by the original meaning of legal texts or should evolve to address changing circumstances. Originalists argue that fidelity to original meaning is essential to the rule of law: if judges can reinterpret texts to mean whatever they think best, constitutional provisions become mere suggestions that constrain no one. Living constitutionalists counter that rigid adherence to original meaning would freeze law in the moral and practical assumptions of an earlier era, producing results that neither the framers nor contemporary citizens would endorse.

Recent scholarship has complicated this debate by questioning whether "original meaning" is even a coherent concept. Texts are inevitably indeterminate; the framers themselves often disagreed about meaning; and the very concepts used in legal texts may have shifted in ways that make historical reconstruction impossible. Some scholars argue that the real divide is not between originalism and living constitutionalism but between different views about the legitimate sources of constitutional authority—text, structure, history, precedent, or evolving social consensus—and how to weigh them when they conflict.

QUESTION: The originalist position as described in the passage is most concerned with`,
                type: 'single_choice',
                options: [
                    'ensuring that law adapts to changing circumstances',
                    'maintaining meaningful legal constraints on judicial discretion',
                    'giving judges maximum flexibility in interpretation',
                    'prioritizing social consensus over textual meaning',
                    'rejecting all forms of constitutional interpretation'
                ],
                correct_answer: [1],
                explanation: 'Originalists argue fidelity to original meaning is "essential to the rule of law"—without it, "constitutional provisions become mere suggestions that constrain no one." The concern is maintaining constraints.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The emergence of large language models has reignited debates about the nature of intelligence and understanding. These systems can produce fluent text, answer questions, and even generate what appears to be original reasoning—all without any direct exposure to the physical world or embodied experience that many theorists have considered essential to genuine cognition. Proponents argue that the distinction between "mere" pattern matching and "true" understanding is misguided: sufficiently sophisticated pattern matching may be all that understanding ever was. If these systems behave in ways indistinguishable from understanding, on what grounds can we deny them the property itself?

Critics respond that behavioral similarity masks fundamental differences. Language models lack the goals, desires, and self-models that give human language use its meaning; their "knowledge" has no connection to action in the world; and they possess no mechanism for updating beliefs in response to evidence except through retraining. Most fundamentally, critics argue, these systems have no inner life—no subjective experience of understanding or confusion, creativity or boredom. The appearance of understanding, however convincing, remains just that: an appearance without the underlying reality.

QUESTION: The critics' position regarding language models most strongly relies on the claim that`,
                type: 'single_choice',
                options: [
                    'these systems cannot produce grammatically correct text',
                    'behavioral indistinguishability is sufficient for attribution of understanding',
                    'genuine understanding requires more than behavioral similarity',
                    'pattern matching has no role in human cognition',
                    'language models will never improve beyond current capabilities'
                ],
                correct_answer: [2],
                explanation: 'Critics argue that "behavioral similarity masks fundamental differences" and "the appearance of understanding...remains just that: an appearance"—mere behavioral similarity is insufficient.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The emergence of large language models has reignited debates about the nature of intelligence and understanding. These systems can produce fluent text, answer questions, and even generate what appears to be original reasoning—all without any direct exposure to the physical world or embodied experience that many theorists have considered essential to genuine cognition. Proponents argue that the distinction between "mere" pattern matching and "true" understanding is misguided: sufficiently sophisticated pattern matching may be all that understanding ever was. If these systems behave in ways indistinguishable from understanding, on what grounds can we deny them the property itself?

Critics respond that behavioral similarity masks fundamental differences. Language models lack the goals, desires, and self-models that give human language use its meaning; their "knowledge" has no connection to action in the world; and they possess no mechanism for updating beliefs in response to evidence except through retraining. Most fundamentally, critics argue, these systems have no inner life—no subjective experience of understanding or confusion, creativity or boredom. The appearance of understanding, however convincing, remains just that: an appearance without the underlying reality.

QUESTION: The proponents' argument that sophisticated pattern matching "may be all that understanding ever was" suggests that they`,
                type: 'single_choice',
                options: [
                    'believe language models have subjective experiences',
                    'reject the possibility that machines can process language',
                    'question whether humans possess something fundamentally beyond pattern matching',
                    'agree with critics that inner life is necessary for understanding',
                    'think language models are inferior to human cognition in every way'
                ],
                correct_answer: [2],
                explanation: 'If sophisticated pattern matching "may be all that understanding ever was," proponents are suggesting human understanding itself might be pattern matching—nothing fundamentally beyond what machines do.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Historians have traditionally explained the rise of European global dominance in terms of internal factors: technological innovation, political organization, cultural values conducive to exploration and conquest. This Eurocentric narrative has been challenged by scholars emphasizing the role of contingency, geographic accident, and the contributions of non-European peoples to European ascent. The conquest of the Americas, for instance, depended heavily on diseases to which indigenous populations had no immunity—a consequence of Eurasia's particular configuration of domesticable animals rather than any European achievement. Similarly, much of the scientific and technological knowledge that fueled European expansion had been developed elsewhere and transmitted through trade networks.

Yet the revisionist critique risks creating its own distortions. Acknowledging the importance of contingency and external factors need not mean denying European agency or the genuine innovations that enabled conquest and colonization. The challenge for historians is to construct accounts that recognize the multi-causal nature of historical change while avoiding both the triumphalism of traditional narratives and the determinism that can afflict revisionist accounts.

QUESTION: The author's position on the historical debate discussed in the passage is best described as`,
                type: 'single_choice',
                options: [
                    'strongly supportive of traditional Eurocentric explanations',
                    'completely endorsing the revisionist critique',
                    'advocating for a balanced multi-causal approach',
                    'dismissive of historical analysis generally',
                    'certain that geography alone explains European dominance'
                ],
                correct_answer: [2],
                explanation: 'The author says both traditional and revisionist views have problems, and "the challenge for historians is to construct accounts that recognize the multi-causal nature"—advocating balance.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: Historians have traditionally explained the rise of European global dominance in terms of internal factors: technological innovation, political organization, cultural values conducive to exploration and conquest. This Eurocentric narrative has been challenged by scholars emphasizing the role of contingency, geographic accident, and the contributions of non-European peoples to European ascent. The conquest of the Americas, for instance, depended heavily on diseases to which indigenous populations had no immunity—a consequence of Eurasia's particular configuration of domesticable animals rather than any European achievement. Similarly, much of the scientific and technological knowledge that fueled European expansion had been developed elsewhere and transmitted through trade networks.

Yet the revisionist critique risks creating its own distortions. Acknowledging the importance of contingency and external factors need not mean denying European agency or the genuine innovations that enabled conquest and colonization. The challenge for historians is to construct accounts that recognize the multi-causal nature of historical change while avoiding both the triumphalism of traditional narratives and the determinism that can afflict revisionist accounts.

QUESTION: The passage mentions the role of disease in the conquest of the Americas primarily to illustrate`,
                type: 'single_choice',
                options: [
                    'European medical superiority',
                    'the deliberate use of biological warfare',
                    'how factors beyond European control contributed to their success',
                    'the resilience of indigenous populations',
                    'the unimportance of military technology'
                ],
                correct_answer: [2],
                explanation: 'Disease immunity was "a consequence of Eurasias particular configuration of domesticable animals rather than any European achievement"—illustrating factors beyond European control or merit.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The therapeutic potential of psychedelic substances, dismissed for decades following their prohibition, has become a subject of renewed scientific interest. Clinical trials have shown promising results for psilocybin in treating depression, MDMA for post-traumatic stress disorder, and ketamine for suicidal ideation. These substances appear to work differently from conventional psychiatric medications: rather than requiring continuous administration to maintain symptom suppression, psychedelic-assisted therapy seems to produce lasting changes through one or a small number of sessions, possibly by disrupting entrenched patterns of thought and emotion.

However, enthusiasm should be tempered by methodological cautions. Many studies have been small, unblinded, or lacking adequate controls. The intense subjective effects of psychedelics make double-blinding difficult: participants can usually tell whether they received the active drug or placebo, potentially biasing self-reported outcomes. Moreover, the set and setting—the participant's mindset and the therapeutic environment—appear crucial to outcomes, raising questions about whether results from carefully controlled research settings will translate to ordinary clinical practice.

QUESTION: The passage suggests that evaluating the effectiveness of psychedelic therapy is complicated by`,
                type: 'single_choice',
                options: [
                    'the substances being too dangerous for any human use',
                    'a complete lack of clinical trials',
                    'the difficulty of conducting properly blinded studies',
                    'resistance from patients to using these substances',
                    'their similarity to conventional psychiatric medications'
                ],
                correct_answer: [2],
                explanation: '"The intense subjective effects of psychedelics make double-blinding difficult: participants can usually tell whether they received the active drug"—proper blinding is a key methodological challenge.',
                difficulty: 'hard'
            },
            {
                content: `PASSAGE: The therapeutic potential of psychedelic substances, dismissed for decades following their prohibition, has become a subject of renewed scientific interest. Clinical trials have shown promising results for psilocybin in treating depression, MDMA for post-traumatic stress disorder, and ketamine for suicidal ideation. These substances appear to work differently from conventional psychiatric medications: rather than requiring continuous administration to maintain symptom suppression, psychedelic-assisted therapy seems to produce lasting changes through one or a small number of sessions, possibly by disrupting entrenched patterns of thought and emotion.

However, enthusiasm should be tempered by methodological cautions. Many studies have been small, unblinded, or lacking adequate controls. The intense subjective effects of psychedelics make double-blinding difficult: participants can usually tell whether they received the active drug or placebo, potentially biasing self-reported outcomes. Moreover, the set and setting—the participant's mindset and the therapeutic environment—appear crucial to outcomes, raising questions about whether results from carefully controlled research settings will translate to ordinary clinical practice.

QUESTION: The concern about "set and setting" raised in the passage most directly relates to`,
                type: 'single_choice',
                options: [
                    'whether the substances are legal',
                    'the cost of providing therapy',
                    'the generalizability of research results to real-world treatment',
                    'the chemical composition of the substances',
                    'the training required for researchers'
                ],
                correct_answer: [2],
                explanation: 'The passage notes set and setting "appear crucial to outcomes, raising questions about whether results from carefully controlled research settings will translate to ordinary clinical practice"—generalizability.',
                difficulty: 'hard'
            }
        ]
    }
];

// ============================================================================
// WEAKENING - HARD TESTS
// ============================================================================
const weakeningHard = [
    {
        title: 'Weakening - Hard Test 1',
        category: 'Weakening',
        description: 'Complex arguments with subtle logical flaws.',
        time_limit_minutes: 18,
        questions: [
            {
                content: `Researchers found that countries with higher chocolate consumption per capita have more Nobel laureates per capita. They concluded that chocolate consumption enhances cognitive function at a population level, leading to greater scientific achievement.

Which of the following, if true, would most weaken the researchers' conclusion?`,
                type: 'single_choice',
                options: [
                    'Nobel Prizes are awarded in several different scientific disciplines',
                    'Chocolate contains flavonoids that have been shown to improve blood flow to the brain',
                    'Countries with higher chocolate consumption also tend to be wealthier nations with better-funded research institutions',
                    'The correlation between chocolate consumption and Nobel laureates has been consistent across multiple years',
                    'Some Nobel laureates report eating chocolate regularly'
                ],
                correct_answer: [2],
                explanation: 'The argument assumes chocolate causes achievement. If wealthy nations have both more chocolate consumption AND better research institutions, wealth could explain both—a confounding variable.',
                difficulty: 'hard'
            },
            {
                content: `A pharmaceutical company argues that its new drug is more effective than the existing standard treatment because in clinical trials, 70% of patients taking the new drug showed improvement compared to only 55% of patients taking the standard treatment.

Which of the following, if true, would most weaken the company's argument?`,
                type: 'single_choice',
                options: [
                    'The new drug costs three times as much as the standard treatment',
                    'Patients who received the new drug were, on average, younger and healthier at baseline than those who received the standard treatment',
                    'Both treatments were administered by qualified medical professionals',
                    'The clinical trials were conducted at multiple research sites',
                    'Some patients in both groups reported side effects'
                ],
                correct_answer: [1],
                explanation: 'Better baseline health in the new drug group could explain higher improvement rates, not the drug itself—selection bias undermines the comparison.',
                difficulty: 'hard'
            },
            {
                content: `A city council member argues that the new traffic cameras have improved public safety because the number of traffic accidents at intersections with cameras decreased by 30% since the cameras were installed.

Which of the following, if true, would most weaken the council member's argument?`,
                type: 'single_choice',
                options: [
                    'Traffic cameras are expensive to install and maintain',
                    'Some drivers have complained about receiving automated tickets',
                    'Accidents decreased by similar percentages at intersections without cameras during the same period',
                    'The cameras operate 24 hours a day',
                    'Other cities have installed similar camera systems'
                ],
                correct_answer: [2],
                explanation: 'If accidents decreased equally at intersections WITHOUT cameras, something else must be causing the decrease—the cameras aren\'t responsible.',
                difficulty: 'hard'
            },
            {
                content: `An economist argues that increasing the minimum wage will reduce poverty because historical data shows that periods of minimum wage increases have coincided with decreases in poverty rates.

Which of the following, if true, would most weaken the economist's argument?`,
                type: 'single_choice',
                options: [
                    'Some workers earning minimum wage support families',
                    'Minimum wage increases have historically occurred during periods of overall economic growth, which independently reduces poverty',
                    'Not all workers are covered by minimum wage laws',
                    'The minimum wage varies by state',
                    'Poverty is measured using consistent methodologies across time periods'
                ],
                correct_answer: [1],
                explanation: 'If minimum wage increases coincide with economic growth, the growth (not the wage increase) might be reducing poverty—correlation without causation due to a confounding factor.',
                difficulty: 'hard'
            },
            {
                content: `A school administrator claims that the district's new mathematics curriculum has improved student performance because test scores increased 15% in the year after the curriculum was adopted.

Which of the following, if true, would most weaken the administrator's claim?`,
                type: 'single_choice',
                options: [
                    'The new curriculum includes more problem-solving exercises',
                    'Teachers received extensive training on the new curriculum',
                    'The state adopted a new, less difficult standardized test in the same year',
                    'Mathematics scores had been declining for the previous three years',
                    'The district spent more money on the new curriculum than on the previous one'
                ],
                correct_answer: [2],
                explanation: 'A less difficult test would produce higher scores regardless of curriculum changes—the apparent improvement might reflect test difficulty, not curriculum effectiveness.',
                difficulty: 'hard'
            },
            {
                content: `A company executive argues that the new open office layout has increased collaboration because the number of collaborative projects increased by 40% after the layout change.

Which of the following, if true, would most weaken the executive's argument?`,
                type: 'single_choice',
                options: [
                    'Some employees have expressed preference for private offices',
                    'Open office layouts are common in the technology industry',
                    'The company simultaneously introduced a new performance evaluation system that rewards team-based projects',
                    'The open office costs less to maintain than the previous layout',
                    'Communication technology has improved over the same period'
                ],
                correct_answer: [2],
                explanation: 'If performance evaluation now rewards team projects, employees have incentive to collaborate regardless of layout—the evaluation change, not the layout, could explain increased collaboration.',
                difficulty: 'hard'
            },
            {
                content: `A health researcher concludes that vegetarian diets reduce the risk of heart disease because vegetarians in the study had lower rates of heart disease than non-vegetarians.

Which of the following, if true, would most weaken the researcher's conclusion?`,
                type: 'single_choice',
                options: [
                    'Heart disease has a genetic component',
                    'Vegetarians in the study also exercised more and smoked less than non-vegetarians',
                    'Some vegetarian foods are high in sodium',
                    'The study was conducted over a ten-year period',
                    'Heart disease is the leading cause of death in the country'
                ],
                correct_answer: [1],
                explanation: 'If vegetarians also exercise more and smoke less, these lifestyle factors (not diet alone) might explain lower heart disease rates—confounding variables obscure the diet\'s effect.',
                difficulty: 'hard'
            },
            {
                content: `A marketing firm claims that its advertising campaign was successful because sales increased 25% during the campaign period.

Which of the following, if true, would most weaken the firm's claim?`,
                type: 'single_choice',
                options: [
                    'The advertising campaign used both television and social media',
                    'Competitors spent less on advertising during the same period',
                    'The product\'s price was reduced by 20% at the start of the campaign',
                    'Consumer surveys showed high awareness of the advertisements',
                    'The company plans to use the same firm for future campaigns'
                ],
                correct_answer: [2],
                explanation: 'A 20% price reduction could explain increased sales regardless of advertising—the sales increase might be due to lower prices, not the campaign.',
                difficulty: 'hard'
            },
            {
                content: `A university administrator argues that the new tutoring program improved student retention because fewer students dropped out in the year after the program was implemented.

Which of the following, if true, would most weaken the administrator's argument?`,
                type: 'single_choice',
                options: [
                    'The tutoring program employs graduate students',
                    'Students who used the tutoring center reported positive experiences',
                    'The university also froze tuition and expanded financial aid in the same year',
                    'The tutoring center is located in the main library',
                    'Other universities have similar tutoring programs'
                ],
                correct_answer: [2],
                explanation: 'Frozen tuition and expanded financial aid could improve retention by reducing financial pressure on students—these changes, not tutoring, might explain lower dropout rates.',
                difficulty: 'hard'
            },
            {
                content: `A criminologist argues that longer prison sentences deter crime because states with longer average sentences have lower crime rates.

Which of the following, if true, would most weaken the criminologist's argument?`,
                type: 'single_choice',
                options: [
                    'Some crimes carry mandatory minimum sentences',
                    'Recidivism rates vary by type of offense',
                    'States with lower crime rates can afford to impose longer sentences because their prisons are less crowded',
                    'Prison sentences have increased in most states over the past decade',
                    'Crime rates are calculated using FBI statistics'
                ],
                correct_answer: [2],
                explanation: 'If lower crime rates allow longer sentences (rather than longer sentences causing lower crime), the causation is reversed—the argument\'s causal direction may be wrong.',
                difficulty: 'hard'
            }
        ]
    },
    {
        title: 'Weakening - Hard Test 2',
        category: 'Weakening',
        description: 'Sophisticated arguments requiring careful logical analysis.',
        time_limit_minutes: 18,
        questions: [
            {
                content: `A museum director argues that free admission increases public engagement with art because the museum's visitor numbers doubled after it eliminated admission fees.

Which of the following, if true, would most weaken the director's argument about increased public engagement?`,
                type: 'single_choice',
                options: [
                    'The museum\'s operating costs increased after eliminating fees',
                    'Other museums in the city still charge admission',
                    'The average time visitors spend viewing exhibits decreased by 60% after admission became free',
                    'The museum received a grant to offset lost admission revenue',
                    'Free admission policies have been adopted by museums worldwide'
                ],
                correct_answer: [2],
                explanation: 'More visitors doesn\'t necessarily mean more engagement. If visitors spend 60% less time viewing exhibits, "engagement" may have actually decreased despite more visitors—the metric doesn\'t support the claim.',
                difficulty: 'hard'
            },
            {
                content: `An education researcher concludes that class size has no effect on student learning because a study found no significant difference in test scores between students in small classes and those in large classes.

Which of the following, if true, would most weaken the researcher's conclusion?`,
                type: 'single_choice',
                options: [
                    'Teachers in the study had similar levels of experience',
                    'The study was conducted across multiple school districts',
                    'Schools with smaller classes were in poorer districts with fewer educational resources overall',
                    'Students in both groups used the same textbooks',
                    'The study used standardized tests to measure learning'
                ],
                correct_answer: [2],
                explanation: 'If smaller classes were in poorer districts, the benefits of small classes might have been offset by fewer resources—small class benefits could exist but be masked by confounding disadvantages.',
                difficulty: 'hard'
            },
            {
                content: `A policy analyst argues that rent control helps low-income tenants because surveys show that tenants in rent-controlled apartments have lower housing costs than tenants in uncontrolled apartments.

Which of the following, if true, would most weaken the analyst's argument?`,
                type: 'single_choice',
                options: [
                    'Rent control laws vary by city',
                    'Most rent-controlled apartments are occupied by middle- and upper-income tenants who obtained them years ago and have since risen economically',
                    'Housing costs represent a significant portion of low-income households\' budgets',
                    'Some landlords oppose rent control',
                    'Rent-controlled apartments are often older buildings'
                ],
                correct_answer: [1],
                explanation: 'If rent control primarily benefits middle/upper-income long-term tenants rather than low-income tenants, the policy doesn\'t help its intended beneficiaries—the argument\'s target population isn\'t being served.',
                difficulty: 'hard'
            },
            {
                content: `A pharmaceutical executive argues that high drug prices are justified because they fund research that produces innovative new treatments. She points to her company's significant R&D spending as evidence.

Which of the following, if true, would most weaken the executive's argument?`,
                type: 'single_choice',
                options: [
                    'Drug development is a lengthy process',
                    'The company\'s R&D spending is exceeded by its spending on marketing and executive compensation',
                    'Some drugs fail during clinical trials',
                    'Generic drugs are less expensive than brand-name drugs',
                    'Government regulations require extensive safety testing'
                ],
                correct_answer: [1],
                explanation: 'If more money goes to marketing and executives than R&D, high prices aren\'t primarily funding innovation—the justification (funding research) is undermined by how money is actually spent.',
                difficulty: 'hard'
            },
            {
                content: `A company claims that its diversity training program has reduced workplace discrimination because complaints of discrimination filed by employees decreased by 50% after the program was implemented.

Which of the following, if true, would most weaken the company's claim?`,
                type: 'single_choice',
                options: [
                    'The diversity training was mandatory for all employees',
                    'Other companies have implemented similar training programs',
                    'Employees reported during the training that the complaint process had become more difficult and was rarely successful',
                    'The training program was developed by outside consultants',
                    'The company hired a more diverse workforce in the same year'
                ],
                correct_answer: [2],
                explanation: 'If the complaint process became harder and less successful, fewer complaints might reflect discouraged reporting, not less discrimination—the measure doesn\'t capture actual discrimination levels.',
                difficulty: 'hard'
            },
            {
                content: `A tech industry analyst argues that artificial intelligence will create more jobs than it eliminates because new technologies have historically created more jobs than they destroyed.

Which of the following, if true, would most weaken the analyst's argument?`,
                type: 'single_choice',
                options: [
                    'Some AI applications are already in commercial use',
                    'Previous technological revolutions occurred gradually, allowing workforce adaptation, while AI is developing rapidly',
                    'Workers in some industries are concerned about automation',
                    'AI requires significant computational resources',
                    'Some economists agree with the analyst\'s prediction'
                ],
                correct_answer: [1],
                explanation: 'Historical precedent may not apply if conditions are fundamentally different. If AI develops much faster than previous technologies, the workforce may not have time to adapt—the historical analogy fails.',
                difficulty: 'hard'
            },
            {
                content: `A city official argues that the new bicycle lane network has reduced traffic congestion because average commute times decreased by 15% after the lanes were installed.

Which of the following, if true, would most weaken the official's argument?`,
                type: 'single_choice',
                options: [
                    'Bicycle usage increased after the lanes were installed',
                    'The lanes connect residential areas to employment centers',
                    'Several major employers moved out of the downtown area during the same period',
                    'Similar lane networks have been successful in other cities',
                    'The lanes were built within the existing road budget'
                ],
                correct_answer: [2],
                explanation: 'If major employers left, fewer people would be commuting downtown—reduced commute times could reflect less traffic demand rather than better infrastructure.',
                difficulty: 'hard'
            },
            {
                content: `A nutritionist concludes that eating breakfast improves academic performance because students who regularly eat breakfast have higher GPAs than students who skip breakfast.

Which of the following, if true, would most weaken the nutritionist's conclusion?`,
                type: 'single_choice',
                options: [
                    'Breakfast is often considered the most important meal of the day',
                    'Students with involved parents who ensure they eat breakfast also receive more academic support at home',
                    'The nutritionist surveyed over 1,000 students',
                    'Some breakfast foods are more nutritious than others',
                    'The study controlled for socioeconomic status'
                ],
                correct_answer: [1],
                explanation: 'If breakfast-eating correlates with parental involvement that includes academic support, the support (not breakfast) might explain better performance—a confounding variable.',
                difficulty: 'hard'
            },
            {
                content: `An environmental group argues that carbon taxes effectively reduce emissions because countries with carbon taxes have shown greater emissions reductions than countries without such taxes.

Which of the following, if true, would most weaken the group's argument?`,
                type: 'single_choice',
                options: [
                    'Carbon taxes are unpopular with some industries',
                    'Countries that implemented carbon taxes also implemented multiple other environmental policies simultaneously',
                    'The carbon tax rates vary significantly between countries',
                    'Some countries are considering implementing carbon taxes',
                    'Emissions reductions benefit global air quality'
                ],
                correct_answer: [1],
                explanation: 'If countries with carbon taxes also implemented other environmental policies, those policies might explain the reductions—the carbon tax\'s specific effect cannot be isolated.',
                difficulty: 'hard'
            },
            {
                content: `A manager argues that the company's new wellness program has improved employee health because healthcare costs per employee decreased by 20% in the year after the program was introduced.

Which of the following, if true, would most weaken the manager's argument?`,
                type: 'single_choice',
                options: [
                    'The wellness program includes gym memberships and health screenings',
                    'Participation in the wellness program is voluntary',
                    'The company switched to a health insurance plan with higher deductibles in the same year',
                    'Some employees have praised the wellness program',
                    'Other companies offer similar wellness programs'
                ],
                correct_answer: [2],
                explanation: 'Higher deductibles mean employees pay more out-of-pocket before insurance kicks in, reducing employer healthcare costs regardless of actual health improvements—the cost reduction might reflect plan changes, not better health.',
                difficulty: 'hard'
            }
        ]
    }
];

async function seed() {
    console.log('Seeding HARD tests (Part 2: Sentence Equivalence, Reading Comp, Weakening)...\n');

    const allTests = [
        ...sentenceEquivHard,
        ...readingCompHard,
        ...weakeningHard
    ];

    for (const test of allTests) {
        console.log(`Creating: ${test.title}`);

        const { data: createdTest, error: testError } = await supabase
            .from('tests')
            .insert({
                title: test.title,
                category: test.category,
                description: test.description,
                time_limit_minutes: test.time_limit_minutes
            })
            .select()
            .single();

        if (testError) {
            console.error(`Error: ${testError.message}`);
            continue;
        }

        const questions = test.questions.map((q, index) => ({
            test_id: createdTest.id,
            content: q.content,
            type: q.type,
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
            order_index: index + 1
        }));

        const { error: qError } = await supabase.from('questions').insert(questions);
        if (qError) console.error(`Questions error: ${qError.message}`);
        else console.log(`  ✓ ${questions.length} questions`);
    }

    console.log('\n========================================');
    console.log('HARD tests seeding complete!');
    console.log('Added 14 hard tests (2 per category).');
    console.log('========================================');
}

seed();
