import { MistakeLabel } from '@/utils/mistakeClassifier';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Lightbulb, Target, CheckCircle, ArrowRight } from 'lucide-react';

interface TutorContent {
    title: string;
    whatItIs: string;
    whyItHappens: string[];
    howToFix: string[];
    example: {
        sentence: string;
        trap: string;
        correct: string;
        explanation: string;
    };
}

const TUTOR_LESSONS: Record<MistakeLabel, TutorContent> = {
    POLARITY_ERROR: {
        title: "Polarity Errors: Missing the Meaning Flip",
        whatItIs: "You're selecting words that have the opposite meaning of what the sentence requires. This typically happens when contrast signals reverse the expected meaning.",
        whyItHappens: [
            "Missing contrast words like 'however', 'although', 'despite', 'far from', 'rather than'",
            "Not recognizing that negation words ('not', 'hardly', 'scarcely') flip the meaning",
            "Reading too quickly and missing the sentence's logical direction"
        ],
        howToFix: [
            "Circle or mentally highlight contrast words before choosing an answer",
            "Ask yourself: 'Is this sentence setting up an opposition or agreement?'",
            "After selecting an answer, re-read the sentence with your choice to verify the logic flows"
        ],
        example: {
            sentence: "Far from being _____, the professor was surprisingly approachable.",
            trap: "friendly (matches 'approachable' but ignores 'Far from being')",
            correct: "aloof (opposite of approachable, which is what 'far from being' requires)",
            explanation: "'Far from being X' means the person is NOT X. Since she's approachable, she's 'far from being' unapproachable/aloof."
        }
    },
    INTENSITY_MISMATCH: {
        title: "Intensity Mismatch: Right Direction, Wrong Degree",
        whatItIs: "Your answer captures the correct meaning direction, but the intensity (strength) doesn't match what the context demands.",
        whyItHappens: [
            "Ignoring intensity modifiers like 'merely', 'utterly', 'somewhat', 'extremely'",
            "Not distinguishing between mild words (dislike) and strong words (loathe, detest)",
            "Choosing the first word that 'fits' without checking if the degree is right"
        ],
        howToFix: [
            "Create a mental scale: Is the context asking for mild, moderate, or extreme?",
            "Look for amplifiers ('absolutely', 'completely') or diminishers ('slightly', 'rather')",
            "Compare your options: Which one matches the sentence's emotional temperature?"
        ],
        example: {
            sentence: "The critic didn't merely dislike the film; she absolutely _____ it.",
            trap: "criticized (too neutral for 'absolutely')",
            correct: "excoriated / denounced (matches the extreme intensity of 'absolutely')",
            explanation: "'Didn't merely X... absolutely Y' signals escalation. The blank needs something much stronger than 'dislike'."
        }
    },
    SCOPE_ERROR: {
        title: "Scope Errors: Too Broad or Too Narrow",
        whatItIs: "Your answer either overgeneralizes beyond what the passage states, or narrows the meaning too specifically.",
        whyItHappens: [
            "Adding assumptions not supported by the text",
            "Choosing 'always/never' answers when the passage says 'sometimes/often'",
            "Missing qualifiers that limit the scope ('in some cases', 'primarily')"
        ],
        howToFix: [
            "Match the scope exactly: if the passage says 'some scientists', don't pick 'all scientists'",
            "Be wary of extreme words (always, never, all, none) unless explicitly stated",
            "Ask: 'Does the passage actually say this, or am I inferring too much?'"
        ],
        example: {
            sentence: "The study found that some participants showed improvement...",
            trap: "'The treatment is universally effective' (too broad - 'some' ≠ 'all')",
            correct: "'Certain individuals may benefit from the treatment' (matches 'some')",
            explanation: "The passage only claims 'some' showed improvement. We cannot conclude universal effectiveness."
        }
    },
    LOGICAL_CONTRADICTION: {
        title: "Logical Contradictions: Creating Paradoxes",
        whatItIs: "Your answer creates a logical impossibility or contradiction within the sentence.",
        whyItHappens: [
            "Not checking if the completed sentence makes logical sense",
            "Focusing on individual word meanings without considering the whole",
            "Missing cause-effect or conditional relationships"
        ],
        howToFix: [
            "After filling the blank, ask: 'Does this sentence make logical sense?'",
            "Check for cause-effect: Does A logically lead to B?",
            "Watch for self-contradicting phrases your answer might create"
        ],
        example: {
            sentence: "Because the evidence was _____, the jury quickly reached a verdict.",
            trap: "ambiguous (contradicts 'quickly reached a verdict')",
            correct: "compelling / conclusive (logically leads to quick decision)",
            explanation: "Ambiguous evidence would cause deliberation, not quick decisions. The logic must flow."
        }
    },
    TONE_REGISTER_MISMATCH: {
        title: "Tone & Register Mismatch: Wrong Formality Level",
        whatItIs: "Your word choice doesn't match the formality, academic level, or emotional tone the context requires.",
        whyItHappens: [
            "Using casual words in formal/academic contexts (or vice versa)",
            "Missing tone signals from surrounding vocabulary",
            "Not considering the genre (scientific paper vs. informal discussion)"
        ],
        howToFix: [
            "Identify the passage's register: Is it academic, formal, casual, or technical?",
            "Match your answer's formality to the surrounding words",
            "In GRE passages, lean toward more formal/academic vocabulary"
        ],
        example: {
            sentence: "The researcher's methodology was _____ by her peers.",
            trap: "dissed (too informal for academic context)",
            correct: "criticized / scrutinized (matches academic register)",
            explanation: "Academic writing requires formal vocabulary. 'Dissed' would never appear in a scholarly context."
        }
    },
    TEMPORAL_ERROR: {
        title: "Temporal Errors: Missing Time-Based Cues",
        whatItIs: "You're missing time-related words that shift the sentence's meaning between past, present, or future states.",
        whyItHappens: [
            "Ignoring temporal markers ('formerly', 'now', 'eventually', 'once')",
            "Not recognizing before/after contrasts",
            "Missing verb tense signals"
        ],
        howToFix: [
            "Highlight time words: 'once', 'now', 'formerly', 'eventually', 'initially'",
            "Ask: Is this describing a change over time?",
            "Check if the answer fits the specific time period mentioned"
        ],
        example: {
            sentence: "Once considered _____, the theory is now widely accepted.",
            trap: "valid (doesn't contrast with 'now widely accepted')",
            correct: "fringe / controversial (shows the change from past skepticism)",
            explanation: "'Once X, now Y' signals a transformation. Past and present states should contrast."
        }
    },
    PARTIAL_SYNONYM_TRAP: {
        title: "Partial Synonym Traps: Close But Not Quite",
        whatItIs: "You're choosing words that are similar in meaning but don't fit the specific context, collocation, or nuance required.",
        whyItHappens: [
            "Relying on dictionary definitions without considering usage",
            "Not testing if the word 'sounds right' in the specific phrase",
            "Ignoring subtle differences between near-synonyms"
        ],
        howToFix: [
            "Test collocation: Would a native speaker use this word here?",
            "Consider connotation: Does this word carry the right positive/negative shade?",
            "For Sentence Equivalence, both answers must create sentences with the SAME meaning"
        ],
        example: {
            sentence: "She made a _____ error in her calculations.",
            trap: "big (grammatically correct but weak collocation)",
            correct: "grave / serious (natural collocation with 'error')",
            explanation: "While 'big error' is technically correct, 'grave error' is the natural collocation in formal writing."
        }
    },
    DOUBLE_NEGATIVE_CONFUSION: {
        title: "Double Negative Confusion: Two Wrongs Make a Right",
        whatItIs: "You're getting confused when sentences contain two negative elements that actually create a positive meaning.",
        whyItHappens: [
            "Not tracking multiple negations ('not unlikely' = likely)",
            "Missing that 'un-' + 'not' = positive",
            "Reading negatives individually instead of together"
        ],
        howToFix: [
            "Count the negatives: odd number = negative, even number = positive",
            "Translate double negatives: 'not uncommon' = 'fairly common'",
            "Simplify before solving: rewrite the sentence without double negatives"
        ],
        example: {
            sentence: "It is not unlikely that the experiment will _____.",
            trap: "fail (if you read 'not unlikely' as negative)",
            correct: "succeed ('not unlikely' = 'quite likely', so positive outcome expected)",
            explanation: "'Not unlikely' means 'quite likely'. Two negatives create a positive expectation."
        }
    },
    CONTEXT_MISREAD: {
        title: "Context Misread: Missing the Sentence's Intent",
        whatItIs: "You're misunderstanding the overall logic, purpose, or direction of the sentence.",
        whyItHappens: [
            "Reading too quickly without grasping the main idea",
            "Focusing on individual words instead of the whole structure",
            "Missing the relationship between clauses"
        ],
        howToFix: [
            "Read the entire sentence before looking at options",
            "Identify the main clause and its purpose",
            "Ask: What is this sentence trying to say? What word would make sense here?"
        ],
        example: {
            sentence: "Although initially skeptical, the committee eventually _____ the proposal.",
            trap: "rejected (ignores 'Although initially skeptical... eventually')",
            correct: "endorsed / approved (matches the 'initially X, eventually Y' contrast)",
            explanation: "'Although initially skeptical... eventually' signals a change from doubt to acceptance."
        }
    },
    ELIMINATION_FAILURE: {
        title: "Elimination Failure: Not Ruling Out Wrong Answers",
        whatItIs: "You're failing to eliminate obviously incorrect options, making the final choice harder than necessary.",
        whyItHappens: [
            "Jumping to select an answer without checking all options",
            "Not using process of elimination as a strategy",
            "Second-guessing eliminations and keeping bad options"
        ],
        howToFix: [
            "ALWAYS read ALL options before selecting",
            "Cross out options that are definitely wrong first",
            "If stuck between two, use context to eliminate one more"
        ],
        example: {
            sentence: "The artist's early work was _____, lacking the sophistication of her later pieces.",
            trap: "Keeping 'masterful' as a possibility despite it contradicting 'lacking sophistication'",
            correct: "crude / rudimentary (after eliminating 'masterful', 'brilliant', etc.)",
            explanation: "If early work 'lacked sophistication', we can immediately eliminate all positive words."
        }
    },
    NONE: {
        title: "No Specific Pattern Detected",
        whatItIs: "Your mistakes don't follow a clear pattern.",
        whyItHappens: [],
        howToFix: ["Keep practicing to identify any emerging patterns."],
        example: {
            sentence: "",
            trap: "",
            correct: "",
            explanation: ""
        }
    }
};

interface TutorLessonProps {
    mistakeLabel: MistakeLabel;
    onContinue: () => void;
}

export function TutorLesson({ mistakeLabel, onContinue }: TutorLessonProps) {
    const lesson = TUTOR_LESSONS[mistakeLabel];

    if (!lesson || mistakeLabel === 'NONE') {
        return null;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{lesson.title}</h1>
                <p className="text-muted-foreground">Let's understand this pattern before practicing</p>
            </div>

            {/* What It Is */}
            <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 h-fit">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">What's Happening</h3>
                            <p className="text-red-900/80 dark:text-red-100/80">{lesson.whatItIs}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Why It Happens */}
            <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 h-fit">
                            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-3">Why This Happens</h3>
                            <ul className="space-y-2">
                                {lesson.whyItHappens.map((reason, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-amber-900/80 dark:text-amber-100/80">
                                        <span className="text-amber-500 mt-1">•</span>
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* How To Fix */}
            <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10">
                <CardContent className="pt-6">
                    <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 h-fit">
                            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-3">How To Fix It</h3>
                            <ul className="space-y-2">
                                {lesson.howToFix.map((tip, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-green-900/80 dark:text-green-100/80">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Example */}
            {lesson.example.sentence && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-primary mb-4">Example in Action</h3>

                        <div className="bg-background rounded-lg p-4 mb-4 border">
                            <p className="text-lg font-medium italic">"{lesson.example.sentence}"</p>
                        </div>

                        <div className="grid gap-3 mb-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <span className="text-red-500 font-bold">✗</span>
                                <div>
                                    <span className="font-medium text-red-700 dark:text-red-300">Trap Answer: </span>
                                    <span className="text-red-900/80 dark:text-red-100/80">{lesson.example.trap}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-100/50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <span className="text-green-500 font-bold">✓</span>
                                <div>
                                    <span className="font-medium text-green-700 dark:text-green-300">Correct Answer: </span>
                                    <span className="text-green-900/80 dark:text-green-100/80">{lesson.example.correct}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            <strong>Why:</strong> {lesson.example.explanation}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Continue Button */}
            <div className="pt-4">
                <Button size="lg" className="w-full" onClick={onContinue}>
                    I Understand - Start Practice
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
