import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Lightbulb, Check, Target, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SKILLS, CATEGORY_DISPLAY } from '@/data/skillTaxonomy';
import { Question } from '@/data/questionSchema';
import { getQuestionById } from '@/data/questionBank';
import { QuestionDisplay } from '@/components/practice/QuestionDisplay';

interface Lesson {
  skillId: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  sections: {
    explanation: string;
    keyTriggers: string[];
    workedExample: {
      stem: string;
      correctAnswer: string;
      walkthrough: string[];
    };
    tips: string[];
  };
  quickCheckQuestionIds: string[];
  prerequisiteSkills: string[];
}

interface LessonViewProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: (quickCheckScore: number) => void;
  onExit: () => void;
  onPractice?: () => void;
}

type LessonStep = 'explanation' | 'triggers' | 'example' | 'tips' | 'quickcheck' | 'complete';
const STEPS: LessonStep[] = ['explanation', 'triggers', 'example', 'tips', 'quickcheck', 'complete'];

export function LessonView({ lesson, isCompleted, onComplete, onExit, onPractice }: LessonViewProps) {
  const [currentStep, setCurrentStep] = useState<LessonStep>('explanation');
  const [quickCheckQuestions, setQuickCheckQuestions] = useState<Question[]>([]);
  const [quickCheckIndex, setQuickCheckIndex] = useState(0);
  const [quickCheckCorrect, setQuickCheckCorrect] = useState(0);
  const [quickCheckAnswer, setQuickCheckAnswer] = useState<string | string[] | null>(null);
  const [quickCheckSubmitted, setQuickCheckSubmitted] = useState(false);
  const [quickCheckResult, setQuickCheckResult] = useState<boolean | null>(null);

  const skill = SKILLS[lesson.skillId];
  const categoryInfo = CATEGORY_DISPLAY[skill?.category as keyof typeof CATEGORY_DISPLAY];
  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  // Load quick check questions
  useEffect(() => {
    if (lesson.quickCheckQuestionIds.length > 0) {
      Promise.all(lesson.quickCheckQuestionIds.map(id => getQuestionById(id)))
        .then(questions => setQuickCheckQuestions(questions.filter(Boolean) as Question[]));
    }
  }, [lesson.quickCheckQuestionIds]);

  const goNext = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx < STEPS.length) {
      // Skip quickcheck if no questions available
      if (STEPS[nextIdx] === 'quickcheck' && quickCheckQuestions.length === 0) {
        setCurrentStep('complete');
        if (!isCompleted) onComplete(0);
      } else {
        setCurrentStep(STEPS[nextIdx]);
      }
    }
  };

  const goPrev = () => {
    const prevIdx = stepIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(STEPS[prevIdx]);
    }
  };

  const handleQuickCheckSubmit = () => {
    if (!quickCheckAnswer) return;
    const question = quickCheckQuestions[quickCheckIndex];
    const correct = question.options.find(o => o.correct);
    const isCorrect = Array.isArray(quickCheckAnswer)
      ? question.options.filter(o => o.correct).every(o => quickCheckAnswer.includes(o.id))
      : correct?.id === quickCheckAnswer;

    setQuickCheckResult(isCorrect || false);
    setQuickCheckSubmitted(true);
    if (isCorrect) setQuickCheckCorrect(prev => prev + 1);
  };

  const handleQuickCheckNext = () => {
    if (quickCheckIndex < quickCheckQuestions.length - 1) {
      setQuickCheckIndex(prev => prev + 1);
      setQuickCheckAnswer(null);
      setQuickCheckSubmitted(false);
      setQuickCheckResult(null);
    } else {
      // Quick check complete
      const score = quickCheckCorrect + (quickCheckResult ? 1 : 0);
      if (!isCompleted) onComplete(score);
      setCurrentStep('complete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{categoryInfo?.label || lesson.category}</p>
          <p className="text-sm font-medium">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {lesson.estimatedMinutes}m
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        {/* Explanation */}
        {currentStep === 'explanation' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">What is this pattern?</h2>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
              <p className="text-base leading-relaxed whitespace-pre-wrap">{lesson.sections.explanation}</p>
            </div>
          </div>
        )}

        {/* Key Triggers */}
        {currentStep === 'triggers' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold">Key Triggers</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Watch for these signal words and phrases — they indicate this pattern is at play.
            </p>
            <div className="flex flex-wrap gap-2">
              {lesson.sections.keyTriggers.map((trigger, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
                >
                  {trigger}
                </span>
              ))}
            </div>
            {lesson.sections.keyTriggers.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                This pattern doesn't have specific trigger words — it requires analyzing the overall context.
              </p>
            )}
          </div>
        )}

        {/* Worked Example */}
        {currentStep === 'example' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold">Worked Example</h2>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4">
              <p className="text-base leading-relaxed italic">{lesson.sections.workedExample.stem}</p>
            </div>
            <div className="space-y-3">
              {lesson.sections.workedExample.walkthrough.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-sm font-bold text-primary">
                    {i + 1}
                  </div>
                  <p className="text-sm leading-relaxed pt-0.5">{step}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm font-medium text-success">
                Answer: {lesson.sections.workedExample.correctAnswer}
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        {currentStep === 'tips' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold">Pro Tips</h2>
            </div>
            <div className="space-y-3">
              {lesson.sections.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border">
                  <Lightbulb className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Check */}
        {currentStep === 'quickcheck' && quickCheckQuestions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Quick Check</h2>
                <p className="text-xs text-muted-foreground">
                  Question {quickCheckIndex + 1} of {quickCheckQuestions.length}
                </p>
              </div>
            </div>
            <QuestionDisplay
              question={quickCheckQuestions[quickCheckIndex]}
              selectedAnswer={quickCheckAnswer}
              onSelectAnswer={setQuickCheckAnswer}
              showResult={quickCheckSubmitted}
              isCorrect={quickCheckResult}
              showExplanation={quickCheckSubmitted}
            />
            <div className="flex justify-center mt-4">
              {!quickCheckSubmitted ? (
                <Button onClick={handleQuickCheckSubmit} disabled={!quickCheckAnswer}>
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleQuickCheckNext}>
                  {quickCheckIndex < quickCheckQuestions.length - 1 ? 'Next Question' : 'Complete Lesson'}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Complete */}
        {currentStep === 'complete' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
            <p className="text-muted-foreground mb-6">{lesson.title}</p>
            {quickCheckQuestions.length > 0 && (
              <p className="text-sm text-muted-foreground mb-6">
                Quick Check: {quickCheckCorrect}/{quickCheckQuestions.length} correct
              </p>
            )}
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              {onPractice && (
                <Button onClick={onPractice} className="w-full">
                  <Target className="h-4 w-4 mr-2" />
                  Practice This Skill
                </Button>
              )}
              <Button variant="outline" onClick={onExit} className="w-full">
                Back to Lessons
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation */}
      {currentStep !== 'complete' && currentStep !== 'quickcheck' && (
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={stepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button onClick={goNext}>
            {stepIndex === STEPS.length - 2 ? 'Finish' : 'Continue'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
