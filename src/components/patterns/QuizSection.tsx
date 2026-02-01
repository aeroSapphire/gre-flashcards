import { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { PatternQuestion } from '@/data/rcPatterns';

interface QuizSectionProps {
  questions: PatternQuestion[];
  onComplete: (score: number) => void;
}

type AnswerState = Record<string, number | null>;

export function QuizSection({ questions, onComplete }: QuizSectionProps) {
  const [answers, setAnswers] = useState<AnswerState>({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every(q => answers[q.id] !== undefined && answers[q.id] !== null);

  const score = submitted
    ? questions.filter(q => answers[q.id] === q.correctAnswer).length
    : 0;

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const finalScore = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    onComplete(finalScore);
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="space-y-6">
      {/* Results Banner */}
      {submitted && (
        <Card className={cn(
          'border-2',
          score === questions.length
            ? 'border-green-500/50 bg-green-500/5'
            : score >= questions.length / 2
              ? 'border-amber-500/50 bg-amber-500/5'
              : 'border-red-500/50 bg-red-500/5'
        )}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">
                  Score: {score}/{questions.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  {score === questions.length
                    ? 'Perfect! You\'ve mastered this pattern.'
                    : score >= questions.length / 2
                      ? 'Good work! Review the explanations below.'
                      : 'Keep practicing! Study the explanations carefully.'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      {questions.map((question, qIndex) => {
        const selectedAnswer = answers[question.id];
        const isCorrect = selectedAnswer === question.correctAnswer;
        const showResult = submitted;

        return (
          <Card key={question.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Question {qIndex + 1}
              </CardTitle>
              <p className="text-sm text-foreground leading-relaxed">
                {question.text}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {question.options.map((option, optIndex) => {
                const isSelected = selectedAnswer === optIndex;
                const isCorrectOption = question.correctAnswer === optIndex;

                return (
                  <button
                    key={optIndex}
                    onClick={() => handleSelect(question.id, optIndex)}
                    disabled={submitted}
                    className={cn(
                      'w-full text-left p-3 rounded-lg border transition-all',
                      'flex items-start gap-3',
                      !submitted && !isSelected && 'hover:bg-muted/50 hover:border-primary/30',
                      !submitted && isSelected && 'bg-primary/10 border-primary',
                      submitted && isCorrectOption && 'bg-green-500/10 border-green-500',
                      submitted && isSelected && !isCorrect && 'bg-red-500/10 border-red-500',
                      submitted && !isSelected && !isCorrectOption && 'opacity-50'
                    )}
                  >
                    <span className={cn(
                      'flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium',
                      !submitted && isSelected && 'bg-primary text-primary-foreground border-primary',
                      !submitted && !isSelected && 'bg-muted',
                      submitted && isCorrectOption && 'bg-green-500 text-white border-green-500',
                      submitted && isSelected && !isCorrect && 'bg-red-500 text-white border-red-500'
                    )}>
                      {String.fromCharCode(65 + optIndex)}
                    </span>
                    <span className="text-sm flex-1">{option}</span>
                    {showResult && isCorrectOption && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}

              {/* Explanation */}
              {showResult && (
                <div className={cn(
                  'mt-4 p-3 rounded-lg text-sm',
                  isCorrect ? 'bg-green-500/10' : 'bg-amber-500/10'
                )}>
                  <p className="font-medium mb-1">
                    {isCorrect ? 'Correct!' : 'Explanation:'}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Submit Button */}
      {!submitted && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={!allAnswered}
        >
          Submit Answers
        </Button>
      )}
    </div>
  );
}
