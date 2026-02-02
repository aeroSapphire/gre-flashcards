import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, RotateCcw, ChevronDown, ChevronUp, BookOpen, PenLine, GitCompare, Brain, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { GREScoreCard } from '@/components/gre/GREScoreCard';
import { useGRETest, GRE_PRACTICE_TEST_1 } from '@/hooks/useGRETest';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  test_id: string;
  content: string;
  type: string;
  options: string[];
  correct_answer: number[];
  explanation: string;
  order_index: number;
}

interface QuestionWithAnswer extends Question {
  userAnswer: number[];
  isCorrect: boolean;
}

const GRETestResults = () => {
  const navigate = useNavigate();
  const { combinedScore, attempts, isComplete, loading: testLoading } = useGRETest();
  const [questions, setQuestions] = useState<QuestionWithAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!attempts.section2 && !attempts.section3) {
        setLoading(false);
        return;
      }

      try {
        // Fetch questions for both sections
        const testIds = [GRE_PRACTICE_TEST_1.SECTION_2, GRE_PRACTICE_TEST_1.SECTION_3];

        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .in('test_id', testIds)
          .order('test_id')
          .order('order_index');

        if (error) throw error;

        // Parse and add user answers
        const allQuestions: QuestionWithAnswer[] = (data || []).map((q: any) => {
          const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          const correctAnswer = typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer;

          // Get user's answer from the appropriate attempt
          const attempt = q.test_id === GRE_PRACTICE_TEST_1.SECTION_2
            ? attempts.section2
            : attempts.section3;

          const userAnswer = attempt?.answers?.[q.id] || [];

          // Check if correct
          const isCorrect =
            userAnswer.length === correctAnswer.length &&
            userAnswer.every((v: number) => correctAnswer.includes(v));

          return {
            ...q,
            options,
            correct_answer: correctAnswer,
            userAnswer,
            isCorrect,
          };
        });

        setQuestions(allQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };

    if (!testLoading) {
      fetchQuestions();
    }
  }, [testLoading, attempts]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Calculate performance by question type
  const performanceByType = questions.reduce((acc, q) => {
    const type = getQuestionTypeLabel(q.type);
    if (!acc[type]) {
      acc[type] = { correct: 0, total: 0 };
    }
    acc[type].total++;
    if (q.isCorrect) {
      acc[type].correct++;
    }
    return acc;
  }, {} as Record<string, { correct: number; total: number }>);

  const filteredQuestions = showOnlyIncorrect
    ? questions.filter(q => !q.isCorrect)
    : questions;

  const section2Questions = filteredQuestions.filter(q => q.test_id === GRE_PRACTICE_TEST_1.SECTION_2);
  const section3Questions = filteredQuestions.filter(q => q.test_id === GRE_PRACTICE_TEST_1.SECTION_3);

  if (loading || testLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 animate-bounce" />
          Loading Results...
        </div>
      </div>
    );
  }

  if (!isComplete || !combinedScore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Incomplete Test</CardTitle>
            <CardDescription>
              Complete both sections to see your combined GRE score.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/gre-test')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Hub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/gre-test')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  Test Results
                </h1>
                <p className="text-xs text-muted-foreground">GRE Practice Test 1</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/gre-test')}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Take Again
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Score Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <GREScoreCard
            score={combinedScore.greScore}
            rawScore={combinedScore.rawScore}
            totalQuestions={combinedScore.totalQuestions}
          />

          {/* Performance by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance by Question Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(performanceByType).map(([type, { correct, total }]) => {
                const percentage = Math.round((correct / total) * 100);
                const Icon = getTypeIcon(type);

                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{type}</span>
                      </div>
                      <span className="font-medium">{correct}/{total} ({percentage}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Section Breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Section 2</div>
                  <div className="text-2xl font-bold">
                    {attempts.section2?.score}/{attempts.section2?.total_questions}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-bold">
                    {Math.round(((attempts.section2?.score || 0) / (attempts.section2?.total_questions || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Section 3</div>
                  <div className="text-2xl font-bold">
                    {attempts.section3?.score}/{attempts.section3?.total_questions}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-2xl font-bold">
                    {Math.round(((attempts.section3?.score || 0) / (attempts.section3?.total_questions || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Review */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Detailed Question Review</CardTitle>
              <Button
                variant={showOnlyIncorrect ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
              >
                {showOnlyIncorrect ? 'Show All' : 'Show Incorrect Only'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Section 2 Questions */}
            {section2Questions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="outline">Section 2</Badge>
                  {section2Questions.length} questions
                </h3>
                <div className="space-y-3">
                  {section2Questions.map((q, idx) => (
                    <QuestionReviewItem
                      key={q.id}
                      question={q}
                      questionNumber={q.order_index + 1}
                      isExpanded={expandedQuestions.has(q.id)}
                      onToggle={() => toggleQuestion(q.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section 3 Questions */}
            {section3Questions.length > 0 && (
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Badge variant="outline">Section 3</Badge>
                  {section3Questions.length} questions
                </h3>
                <div className="space-y-3">
                  {section3Questions.map((q, idx) => (
                    <QuestionReviewItem
                      key={q.id}
                      question={q}
                      questionNumber={q.order_index + 1}
                      isExpanded={expandedQuestions.has(q.id)}
                      onToggle={() => toggleQuestion(q.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => navigate('/verbal')}>
            Back to Verbal Hub
          </Button>
          <Button onClick={() => navigate('/gre-test')}>
            View Test Hub
          </Button>
        </div>
      </main>
    </div>
  );
};

// Helper component for question review
function QuestionReviewItem({
  question,
  questionNumber,
  isExpanded,
  onToggle,
}: {
  question: QuestionWithAnswer;
  questionNumber: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const typeLabel = getQuestionTypeLabel(question.type);

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <div
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            question.isCorrect
              ? 'border-green-500/30 hover:border-green-500/50 bg-green-500/5'
              : 'border-red-500/30 hover:border-red-500/50 bg-red-500/5'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {question.isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <span className="font-medium">Question {questionNumber}</span>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {typeLabel}
                </Badge>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 py-3 border border-t-0 rounded-b-lg bg-muted/30 space-y-4">
          {/* Question content */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{question.content}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {question.options.map((opt, idx) => {
              const isSelected = question.userAnswer.includes(idx);
              const isCorrect = question.correct_answer.includes(idx);

              let styles = 'p-3 rounded border text-sm ';
              if (isCorrect) {
                styles += 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300';
              } else if (isSelected) {
                styles += 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300';
              } else {
                styles += 'border-border opacity-70';
              }

              return (
                <div key={idx} className={styles}>
                  {opt}
                  {isCorrect && ' (Correct)'}
                  {isSelected && !isCorrect && ' (Your Answer)'}
                </div>
              );
            })}
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Explanation
              </div>
              <p className="text-sm whitespace-pre-wrap">{question.explanation}</p>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// Helper functions
function getQuestionTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    single_choice: 'Single Choice',
    multi_choice: 'Multi-Select',
    double_blank: 'Text Completion',
    triple_blank: 'Text Completion',
  };
  return typeMap[type] || type;
}

function getTypeIcon(type: string) {
  const iconMap: Record<string, typeof BookOpen> = {
    'Single Choice': BookOpen,
    'Multi-Select': GitCompare,
    'Text Completion': PenLine,
  };
  return iconMap[type] || Brain;
}

export default GRETestResults;
