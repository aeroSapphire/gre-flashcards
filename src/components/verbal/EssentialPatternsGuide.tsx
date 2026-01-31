import {
  Brain,
  Lightbulb,
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Quote,
  Table,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EssentialPatternsGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EssentialPatternsGuide = ({ open, onOpenChange }: EssentialPatternsGuideProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-primary" />
            Essential GRE Verbal Patterns
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="passage" className="mt-4">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="passage" className="text-xs px-2 py-1.5">Passage</TabsTrigger>
            <TabsTrigger value="text-completion" className="text-xs px-2 py-1.5">Text Comp</TabsTrigger>
            <TabsTrigger value="sentence-equiv" className="text-xs px-2 py-1.5">Sent Equiv</TabsTrigger>
            <TabsTrigger value="rc-traps" className="text-xs px-2 py-1.5">RC & Traps</TabsTrigger>
          </TabsList>

          {/* Passage Structure Patterns */}
          <TabsContent value="passage" className="space-y-6 py-4">
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Passage Structure Patterns
              </h3>
              <div className="space-y-3">
                <PatternCard
                  number={1}
                  title="General → Specific → Evaluation"
                  points={[
                    "General principle introduced",
                    "Specific application/example given",
                    "Author evaluates or critiques"
                  ]}
                />
                <PatternCard
                  number={2}
                  title="Common View → Challenge → New View"
                  points={[
                    '"Critics have traditionally argued X..."',
                    '"However, recent evidence suggests..."',
                    "Author supports the revision"
                  ]}
                />
                <PatternCard
                  number={3}
                  title="Phenomenon → Explanation A → Explanation B → Author's Position"
                  points={[
                    "Something puzzling is described",
                    "One explanation offered",
                    "Alternative explanation offered",
                    "Author weighs in (or remains neutral)"
                  ]}
                />
                <PatternCard
                  number={4}
                  title="Claim → Concession → Rebuttal"
                  points={[
                    "Author states position",
                    'Acknowledges opposing point ("Admittedly..." / "To be sure...")',
                    'Dismisses or qualifies the concession ("Nevertheless...")'
                  ]}
                />
                <PatternCard
                  number={5}
                  title="Old View → Modification (not rejection)"
                  points={[
                    "Traditional understanding presented",
                    "Author adds to rather than overturns it",
                    "Evidence supports the expansion"
                  ]}
                />
              </div>
            </section>

            {/* Logical Structure Markers */}
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Table className="h-4 w-4 text-primary" />
                Logical Structure Markers
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 text-sm">
                <div className="grid gap-2">
                  <MarkerRow label="Contrast" words="but, however, yet, although, despite, while, nevertheless, notwithstanding" />
                  <MarkerRow label="Continuation" words="moreover, furthermore, indeed, in fact, additionally" />
                  <MarkerRow label="Cause" words="because, since, due to, as a result of" />
                  <MarkerRow label="Effect" words="therefore, thus, consequently, hence, so" />
                  <MarkerRow label="Concession" words="admittedly, granted, to be sure, certainly" />
                  <MarkerRow label="Rebuttal" words="nevertheless, nonetheless, still, yet, even so" />
                  <MarkerRow label="Example" words="for instance, for example, such as, illustrated by" />
                  <MarkerRow label="Emphasis" words="indeed, in fact, notably, especially" />
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Text Completion Logic Patterns */}
          <TabsContent value="text-completion" className="space-y-6 py-4">
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Text Completion Logic Patterns
              </h3>
              <div className="space-y-4">
                <LogicPatternCard
                  number={1}
                  title="Contrast Signals"
                  subtitle="expect opposite ideas"
                  triggers="but, however, although, yet, despite, while, whereas, nevertheless, notwithstanding, paradoxically"
                  example='"She was usually reserved, but at the party she was surprisingly ___."'
                  answer="outgoing/gregarious"
                />
                <LogicPatternCard
                  number={2}
                  title="Continuation Signals"
                  subtitle="expect similar ideas"
                  triggers="and, moreover, indeed, in fact, furthermore, similarly, likewise, thus, therefore"
                  example='"The evidence was thin and the argument ___."'
                  answer="weak/unconvincing"
                />
                <LogicPatternCard
                  number={3}
                  title="Colon/Dash Elaboration"
                  subtitle="definition or example follows"
                  triggers="Statement : elaboration/definition"
                  example='"He was truly parsimonious: he ___."'
                  answer="Answer must define/exemplify extreme frugality"
                />
                <LogicPatternCard
                  number={4}
                  title="Cause-Effect"
                  subtitle=""
                  triggers="because, since, therefore, consequently, as a result, leads to"
                  example='"Because the experiment lacked controls, the results were ___."'
                  answer="unreliable/inconclusive"
                />
                <LogicPatternCard
                  number={5}
                  title="Irony/Paradox Markers"
                  subtitle=""
                  triggers="ironically, paradoxically, curiously, surprisingly, unexpectedly"
                  example={`"Paradoxically, the book's popularity ___ its scholarly reputation."`}
                  answer="damaged/undermined (opposite of expected)"
                />
                <LogicPatternCard
                  number={6}
                  title="Degree Intensifiers"
                  subtitle=""
                  triggers="even, so X that, too X to"
                  example='"The policy was so ___ that even supporters abandoned it."'
                  answer="extreme/flawed/unpopular"
                />
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-medium text-foreground text-sm mb-2">7. Double Negative = Positive</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>"Not without merit" = has some merit</p>
                    <p>"Hardly insignificant" = significant</p>
                  </div>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Sentence Equivalence */}
          <TabsContent value="sentence-equiv" className="space-y-6 py-4">
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Sentence Equivalence Patterns
              </h3>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-foreground mb-2">The Core Rule</h4>
                <p className="text-sm text-muted-foreground mb-2">Both answers must:</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>Be grammatically correct</li>
                  <li>Produce sentences with <strong>the same meaning</strong></li>
                  <li>Often (not always) be synonyms</li>
                </ol>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Common Traps
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li><strong>Near-synonyms that don't fit context:</strong> "happy" and "joyful" are synonyms, but if only one works grammatically, reject both</li>
                  <li><strong>One word fits perfectly, another almost fits:</strong> Both must work equally well</li>
                </ul>
              </div>

              <h4 className="font-semibold text-foreground mb-3">Reliable Pairs to Know</h4>
              <div className="grid gap-2 text-sm">
                <PairRow pair="ubiquitous / universal" meaning="everywhere" />
                <PairRow pair="inscrutable / enigmatic" meaning="mysterious" />
                <PairRow pair="ephemeral / transient" meaning="short-lived" />
                <PairRow pair="bolster / buttress" meaning="support" />
                <PairRow pair="undermine / subvert" meaning="weaken" />
                <PairRow pair="meticulous / scrupulous" meaning="careful" />
                <PairRow pair="capricious / mercurial" meaning="unpredictable" />
                <PairRow pair="reticent / taciturn" meaning="quiet/reserved" />
                <PairRow pair="loquacious / garrulous" meaning="talkative" />
                <PairRow pair="parsimonious / frugal" meaning="cheap" />
                <PairRow pair="sanguine / optimistic" meaning="hopeful" />
                <PairRow pair="ambivalent / equivocal" meaning="uncertain" />
              </div>
            </section>

            {/* Vocabulary in Context */}
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Quote className="h-4 w-4 text-primary" />
                Vocabulary-in-Context
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-foreground text-sm mb-2">The Golden Rule</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The correct answer is often <strong>not</strong> the most common definition—it's the one that fits <em>this specific context</em>.
                </p>
                <div className="bg-background/50 rounded p-3 text-sm">
                  <p className="text-muted-foreground italic mb-2">
                    "The critic's <strong>measured</strong> response surprised fans expecting outrage."
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="line-through">Not "calculated in units"</span><br />
                    Means: restrained, careful, moderate
                  </p>
                </div>
              </div>
            </section>
          </TabsContent>

          {/* Reading Comprehension & Trap Answers */}
          <TabsContent value="rc-traps" className="space-y-6 py-4">
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Reading Comprehension Question Patterns
              </h3>
              <div className="space-y-3">
                <RCPatternCard
                  number={1}
                  title="Function Questions"
                  asks='"The author mentions X in order to..."'
                  strategy="Identify the role in the argument (example? counterargument? evidence? transition?)"
                />
                <RCPatternCard
                  number={2}
                  title="Inference Questions"
                  asks='"It can be inferred..." / "The author would most likely agree..."'
                  strategy="Find what's necessarily true based on the passage—not just plausible"
                />
                <RCPatternCard
                  number={3}
                  title="EXCEPT/NOT Questions"
                  asks=""
                  strategy="Four answers ARE supported; find the one that isn't (or is contradicted)"
                />
                <RCPatternCard
                  number={4}
                  title="Strengthen/Weaken Questions"
                  asks={`"Which would most weaken the author's argument?"`}
                  strategy="Identify the argument's assumptions, then attack or support them"
                />
                <RCPatternCard
                  number={5}
                  title="Author's Tone/Attitude"
                  asks=""
                  strategy="Common answers: skeptical, qualified approval, cautious optimism, measured criticism. Trap answers: indifferent, hostile, completely supportive (usually too extreme)"
                />
                <RCPatternCard
                  number={6}
                  title="Primary Purpose"
                  asks=""
                  strategy='Ask "Why did the author write this?" — the answer should capture the whole passage, not just one part'
                />
              </div>
            </section>

            {/* Trap Answer Patterns */}
            <section>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Trap Answer Patterns
              </h3>
              <div className="space-y-2">
                <TrapCard
                  number={1}
                  title="Too Extreme"
                  description='Words like "always," "never," "completely," "only" are usually wrong'
                />
                <TrapCard
                  number={2}
                  title="True but Irrelevant"
                  description="The statement is factually correct but doesn't answer this question"
                />
                <TrapCard
                  number={3}
                  title="Reversal"
                  description="Switches the relationship (says A causes B when passage says B causes A)"
                />
                <TrapCard
                  number={4}
                  title="Out of Scope"
                  description="Introduces concepts the passage never discusses"
                />
                <TrapCard
                  number={5}
                  title="Half-Right"
                  description="First part is correct, second part is wrong—read the entire answer choice"
                />
              </div>
            </section>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Helper Components

const PatternCard = ({ number, title, points }: { number: number; title: string; points: string[] }) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <h4 className="font-medium text-foreground text-sm mb-2">
      {number}. {title}
    </h4>
    <ul className="text-xs text-muted-foreground space-y-1">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2">
          <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
          {point}
        </li>
      ))}
    </ul>
  </div>
);

const MarkerRow = ({ label, words }: { label: string; words: string }) => (
  <div className="flex gap-3">
    <span className="font-medium text-foreground w-24 shrink-0">{label}</span>
    <span className="text-muted-foreground text-xs">{words}</span>
  </div>
);

const LogicPatternCard = ({
  number,
  title,
  subtitle,
  triggers,
  example,
  answer
}: {
  number: number;
  title: string;
  subtitle: string;
  triggers: string;
  example: string;
  answer: string
}) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <h4 className="font-medium text-foreground text-sm mb-1">
      {number}. {title} {subtitle && <span className="text-muted-foreground font-normal">({subtitle})</span>}
    </h4>
    <p className="text-xs text-muted-foreground mb-2">
      <strong>Triggers:</strong> {triggers}
    </p>
    <div className="bg-background/50 rounded p-2 text-xs">
      <p className="text-muted-foreground italic">{example}</p>
      <p className="text-primary mt-1">→ Answer: {answer}</p>
    </div>
  </div>
);

const PairRow = ({ pair, meaning }: { pair: string; meaning: string }) => (
  <div className="flex items-center gap-3 bg-muted/50 rounded px-3 py-2">
    <span className="font-medium text-foreground flex-1">{pair}</span>
    <span className="text-muted-foreground text-xs">{meaning}</span>
  </div>
);

const RCPatternCard = ({
  number,
  title,
  asks,
  strategy
}: {
  number: number;
  title: string;
  asks: string;
  strategy: string
}) => (
  <div className="bg-muted/50 rounded-lg p-3">
    <h4 className="font-medium text-foreground text-sm mb-1">
      {number}. {title}
    </h4>
    {asks && (
      <p className="text-xs text-muted-foreground italic mb-1">
        Asks: {asks}
      </p>
    )}
    <p className="text-xs text-primary">
      <strong>Strategy:</strong> {strategy}
    </p>
  </div>
);

const TrapCard = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
    <span className="bg-red-500/20 text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
      {number}
    </span>
    <div>
      <h4 className="font-medium text-foreground text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);
