import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Question, Passage } from '@/data/questionSchema';
import { GeneratedTest, TestAnswer } from '@/utils/testEngine';
import { SKILLS, DIFFICULTY_LEVELS } from '@/data/skillTaxonomy';
import { getPassageById } from '@/data/questionBank';
import { cn } from '@/lib/utils';

interface TestTakingProps {
  test: GeneratedTest;
  onSubmit: (answers: TestAnswer[]) => void;
  onExit: () => void;
}

export function TestTaking({ test, onSubmit, onExit }: TestTakingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [passages, setPassages] = useState<Map<string, Passage>>(new Map());
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const currentQuestion = test.questions[currentIndex];
  const totalQuestions = test.questions.length;
  const allAnswered = test.questions.every(q => answers.has(q.id));
  const answeredCount = answers.size;

  // Load passages for RC questions
  useEffect(() => {
    const passageIds = new Set(test.questions.filter(q => q.passageId).map(q => q.passageId!));
    passageIds.forEach(async (id) => {
      const p = await getPassageById(id);
      if (p) {
        setPassages(prev => new Map(prev).set(id, p));
      }
    });
  }, [test.questions]);

  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentQuestion) return;
    const isSE = currentQuestion.type === 'sentence_equivalence';

    setAnswers(prev => {
      const next = new Map(prev);
      if (isSE) {
        const current = (next.get(currentQuestion.id) as string[]) || [];
        const idx = current.indexOf(optionId);
        if (idx >= 0) {
          const updated = current.filter(id => id !== optionId);
          if (updated.length === 0) next.delete(currentQuestion.id);
          else next.set(currentQuestion.id, updated);
        } else if (current.length < 2) {
          next.set(currentQuestion.id, [...current, optionId]);
        }
      } else {
        next.set(currentQuestion.id, optionId);
      }
      return next;
    });
  }, [currentQuestion]);

  const handleSubmit = useCallback(() => {
    const testAnswers: TestAnswer[] = test.questions
      .filter(q => answers.has(q.id))
      .map(q => ({
        questionId: q.id,
        selectedAnswer: answers.get(q.id)!
      }));
    onSubmit(testAnswers);
  }, [test.questions, answers, onSubmit]);

  const isSelected = (optionId: string) => {
    const answer = answers.get(currentQuestion?.id || '');
    if (Array.isArray(answer)) return answer.includes(optionId);
    return answer === optionId;
  };

  const passage = currentQuestion?.passageId ? passages.get(currentQuestion.passageId) : null;
  const categoryLabel = test.category === 'reading_comprehension' ? 'Reading Comprehension'
    : test.category === 'text_completion' ? 'Text Completion'
    : 'Sentence Equivalence';

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Exit Test</span>
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{categoryLabel} Test</p>
          <p className="text-sm font-medium">Question {currentIndex + 1} of {totalQuestions}</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {answeredCount}/{totalQuestions}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5 justify-center mb-6 flex-wrap">
        {test.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              i === currentIndex && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              answers.has(q.id) ? "bg-primary" : "bg-muted"
            )}
            aria-label={`Go to question ${i + 1}`}
          />
        ))}
      </div>

      {/* Passage (for RC) */}
      {passage && (
        <div className="bg-muted/50 border border-border rounded-xl p-4 sm:p-6 max-h-[250px] overflow-y-auto mb-4">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{passage.text}</p>
        </div>
      )}

      {/* Question */}
      {currentQuestion && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <p className="text-base sm:text-lg leading-relaxed">{currentQuestion.stem}</p>
            {currentQuestion.type === 'sentence_equivalence' && (
              <p className="text-xs text-muted-foreground mt-2">Select exactly two answers.</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={cn(
                  "flex items-start gap-3 p-3 sm:p-4 rounded-xl border transition-all cursor-pointer",
                  isSelected(option.id)
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-medium",
                  isSelected(option.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {option.id}
                </div>
                <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentIndex < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => allAnswered ? handleSubmit() : setShowSubmitConfirm(true)}
            className={allAnswered ? "bg-success hover:bg-success/90" : ""}
            disabled={answeredCount === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Test
          </Button>
        )}
      </div>

      {/* Submit confirmation for incomplete tests */}
      {showSubmitConfirm && !allAnswered && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <h3 className="font-semibold text-lg">Incomplete Test</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              You've answered {answeredCount} of {totalQuestions} questions.
              Unanswered questions will be marked incorrect.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} className="flex-1">
                Keep Working
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                Submit Anyway
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
