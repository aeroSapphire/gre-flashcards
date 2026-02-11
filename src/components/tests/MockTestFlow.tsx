import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Brain, Clock, FileText, Trophy,
  Check, X, AlertTriangle, BookOpen, Target, RotateCcw, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrainMap } from '@/data/brainMapSchema';
import { Question } from '@/data/questionSchema';
import { SKILLS } from '@/data/skillTaxonomy';
import {
  MockTest, MockTestAnswer, MockTestResult,
  generateMockTest, generateSection2, scoreMockTest
} from '@/utils/mockTestEngine';
import { TestTaking } from '@/components/tests/TestTaking';
import { GeneratedTest, TestAnswer } from '@/utils/testEngine';

type MockTestPhase = 'intro' | 'section1' | 'section1-break' | 'section2' | 'results';

interface MockTestFlowProps {
  brainMap: BrainMap;
  onUpdateBrainMap: (bm: BrainMap) => void;
  onExit: () => void;
  onPracticeSkill?: (skillId: string) => void;
  onReviewLesson?: (skillId: string) => void;
}

export function MockTestFlow({
  brainMap,
  onUpdateBrainMap,
  onExit,
  onPracticeSkill,
  onReviewLesson
}: MockTestFlowProps) {
  const [phase, setPhase] = useState<MockTestPhase>('intro');
  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [section1Answers, setSection1Answers] = useState<MockTestAnswer[]>([]);
  const [testResult, setTestResult] = useState<MockTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const handleStartTest = useCallback(async () => {
    setIsLoading(true);
    const test = await generateMockTest(brainMap);
    setMockTest(test);
    setIsLoading(false);
    setPhase('section1');
  }, [brainMap]);

  const handleSection1Submit = useCallback(async (answers: TestAnswer[]) => {
    if (!mockTest) return;
    const mockAnswers: MockTestAnswer[] = answers.map(a => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
    }));
    setSection1Answers(mockAnswers);

    // Generate section 2 based on section 1 performance
    setIsLoading(true);
    const updatedTest = await generateSection2(mockTest, mockAnswers, brainMap);
    setMockTest(updatedTest);
    setIsLoading(false);
    setPhase('section1-break');
  }, [mockTest, brainMap]);

  const handleSection2Submit = useCallback((answers: TestAnswer[]) => {
    if (!mockTest) return;
    const section2Answers: MockTestAnswer[] = answers.map(a => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
    }));

    const { result, updatedBrainMap } = scoreMockTest(
      mockTest, section1Answers, section2Answers, brainMap
    );
    setTestResult(result);
    onUpdateBrainMap(updatedBrainMap);
    setPhase('results');
  }, [mockTest, section1Answers, brainMap, onUpdateBrainMap]);

  // Convert MockTestSection to GeneratedTest format for TestTaking component
  const sectionToGeneratedTest = (sectionIdx: number): GeneratedTest | null => {
    if (!mockTest) return null;
    const section = mockTest.sections[sectionIdx];
    return {
      testId: `${mockTest.testId}-s${section.sectionNumber}`,
      category: 'text_completion', // Mixed but we need a category
      questions: section.questions,
      targetDifficulties: section.questions.map(q => q.difficulty),
    };
  };

  // -- Intro --
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto px-4 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-3">GRE Verbal Mock Test</h1>
          <p className="text-muted-foreground mb-8">
            This test simulates the real GRE verbal section with 2 adaptive sections.
            Section 2 difficulty adjusts based on your Section 1 performance.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8 text-left">
            <div className="bg-card border border-border rounded-xl p-4">
              <FileText className="h-5 w-5 text-primary mb-2" />
              <p className="text-sm font-medium">2 Sections</p>
              <p className="text-xs text-muted-foreground">20 questions each</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <Clock className="h-5 w-5 text-orange-500 mb-2" />
              <p className="text-sm font-medium">~40 min</p>
              <p className="text-xs text-muted-foreground">Self-paced</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <Brain className="h-5 w-5 text-purple-500 mb-2" />
              <p className="text-sm font-medium">Adaptive</p>
              <p className="text-xs text-muted-foreground">Section 2 adapts</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <Trophy className="h-5 w-5 text-green-500 mb-2" />
              <p className="text-sm font-medium">GRE Score</p>
              <p className="text-xs text-muted-foreground">130-170 estimate</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={handleStartTest} disabled={isLoading}>
              {isLoading ? 'Generating Test...' : 'Begin Mock Test'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="ghost" onClick={onExit}>
              Back
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -- Section 1 --
  if (phase === 'section1') {
    const test = sectionToGeneratedTest(0);
    if (!test || test.questions.length === 0) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-4">
              Not enough questions in the bank to generate a mock test.
              Complete more lessons and practice to unlock mock tests.
            </p>
            <Button onClick={onExit}>Back to Menu</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary/10 border-b border-primary/20 py-2 text-center">
          <p className="text-sm font-medium text-primary">Section 1 of 2 — Standard Difficulty</p>
        </div>
        <TestTaking
          test={test}
          onSubmit={handleSection1Submit}
          onExit={onExit}
        />
      </div>
    );
  }

  // -- Break between sections --
  if (phase === 'section1-break') {
    const tier = mockTest?.sections[1].difficultyTier || 'standard';
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto px-4 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Section 1 Complete</h2>
          <p className="text-muted-foreground mb-6">
            Based on your performance, Section 2 will be at
            <span className={cn(
              "font-bold ml-1",
              tier === 'hard' && "text-red-500",
              tier === 'easy' && "text-green-500",
              tier === 'standard' && "text-primary",
            )}>
              {tier} difficulty
            </span>.
          </p>

          {tier === 'hard' && (
            <p className="text-sm text-muted-foreground mb-6">
              Great job on Section 1! Harder questions give you a chance at a higher score.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <Button size="lg" onClick={() => setPhase('section2')} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Start Section 2'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // -- Section 2 --
  if (phase === 'section2') {
    const test = sectionToGeneratedTest(1);
    if (!test || test.questions.length === 0) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-muted-foreground mb-4">
              Not enough questions available for Section 2.
            </p>
            <Button onClick={onExit}>Back to Menu</Button>
          </div>
        </div>
      );
    }

    const tier = mockTest?.sections[1].difficultyTier || 'standard';
    return (
      <div className="min-h-screen bg-background">
        <div className={cn(
          "border-b py-2 text-center",
          tier === 'hard' && "bg-red-500/10 border-red-500/20",
          tier === 'easy' && "bg-green-500/10 border-green-500/20",
          tier === 'standard' && "bg-primary/10 border-primary/20",
        )}>
          <p className={cn(
            "text-sm font-medium",
            tier === 'hard' && "text-red-500",
            tier === 'easy' && "text-green-500",
            tier === 'standard' && "text-primary",
          )}>
            Section 2 of 2 — {tier.charAt(0).toUpperCase() + tier.slice(1)} Difficulty
          </p>
        </div>
        <TestTaking
          test={test}
          onSubmit={handleSection2Submit}
          onExit={onExit}
        />
      </div>
    );
  }

  // -- Results --
  if (phase === 'results' && testResult) {
    const accuracy = testResult.totalQuestions > 0
      ? Math.round((testResult.totalCorrect / testResult.totalQuestions) * 100)
      : 0;

    const allQuestions = mockTest
      ? [...mockTest.sections[0].questions, ...mockTest.sections[1].questions]
      : [];
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-3 sm:px-4 py-6"
      >
        {/* Score Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Mock Test Results</h2>
          <p className="text-5xl font-black text-primary">{testResult.scoreEstimate.score}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated GRE Verbal Score (+/- {testResult.scoreEstimate.confidenceInterval})
          </p>
          <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary mt-2 inline-block">
            {testResult.scoreEstimate.band} ({testResult.scoreEstimate.percentile}th percentile)
          </span>
        </div>

        {/* Section Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {testResult.sections.map((section) => (
            <div key={section.sectionNumber} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Section {section.sectionNumber}
                <span className={cn(
                  "ml-1 capitalize",
                  section.difficultyTier === 'hard' && "text-red-500",
                  section.difficultyTier === 'easy' && "text-green-500",
                )}>
                  ({section.difficultyTier})
                </span>
              </p>
              <p className="text-2xl font-bold">{section.correct}/{section.total}</p>
              <p className="text-xs text-muted-foreground">
                {section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0}% accuracy
              </p>
            </div>
          ))}
        </div>

        {/* Overall Stats */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 text-center">
          <p className="text-sm text-muted-foreground">Overall</p>
          <p className="text-3xl font-bold">{testResult.totalCorrect}/{testResult.totalQuestions}</p>
          <p className="text-sm text-muted-foreground">{accuracy}% accuracy</p>
        </div>

        {/* Skill Breakdown */}
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
          <h3 className="font-semibold mb-4">Skill Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(testResult.skillBreakdown)
              .filter(([id]) => !id.startsWith('TRAP-'))
              .sort(([, a], [, b]) => {
                const accA = a.seen > 0 ? a.correct / a.seen : 0;
                const accB = b.seen > 0 ? b.correct / b.seen : 0;
                return accA - accB;
              })
              .map(([skillId, data]) => {
                const acc = data.seen > 0 ? data.correct / data.seen : 0;
                const isWeak = acc < 0.5;
                const isStrong = acc >= 0.8;

                return (
                  <div key={skillId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium truncate">{SKILLS[skillId]?.name || skillId}</span>
                        <span className={cn(
                          "text-sm font-bold",
                          isStrong && "text-success",
                          isWeak && "text-destructive",
                        )}>
                          {data.correct}/{data.seen}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            isStrong && "bg-success",
                            isWeak && "bg-destructive",
                            !isStrong && !isWeak && "bg-primary",
                          )}
                          style={{ width: `${acc * 100}%` }}
                        />
                      </div>
                    </div>
                    {isWeak && onPracticeSkill && (
                      <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => onPracticeSkill(skillId)}>
                        Practice
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Traps */}
        {testResult.trapsFallenFor.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold">Traps You Fell For</h3>
            </div>
            <div className="space-y-2">
              {[...new Set(testResult.trapsFallenFor)].map(trapId => (
                <div key={trapId} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">*</span>
                  <div>
                    <p className="text-sm font-medium">{SKILLS[trapId]?.name || trapId}</p>
                    <p className="text-xs text-muted-foreground">{SKILLS[trapId]?.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Questions */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="w-full justify-between"
            onClick={() => setShowAllQuestions(!showAllQuestions)}
          >
            <span>Review All Questions</span>
            {showAllQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showAllQuestions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-3 mt-3"
            >
              {testResult.answers.map((answer, i) => {
                const question = questionMap.get(answer.questionId);
                if (!question) return null;

                return (
                  <div key={answer.questionId} className={cn(
                    "p-3 rounded-lg border",
                    answer.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                  )}>
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                        answer.correct ? "bg-success text-white" : "bg-destructive text-white"
                      )}>
                        {answer.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">S{answer.sectionNumber}</span>
                          <p className="text-sm font-medium">Q{i + 1}: {question.stem.slice(0, 100)}...</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onExit} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Verbal Hub
          </Button>
        </div>
      </motion.div>
    );
  }

  return null;
}
