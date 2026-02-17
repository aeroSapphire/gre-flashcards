import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Calculator,
  Play,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import {
  quantQuizzes,
  QuantQuiz,
  QuantQuestion,
} from '@/data/quantQuizzes';

type Mode = 'hub' | 'quiz' | 'results';

const STORAGE_KEY = 'quant-best-scores';

function getBestScores(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveBestScore(quizId: string, score: number) {
  const scores = getBestScores();
  if (!scores[quizId] || score > scores[quizId]) {
    scores[quizId] = score;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-700 dark:text-green-400',
  medium: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  hard: 'bg-red-500/15 text-red-700 dark:text-red-400',
};

const typeLabels: Record<string, string> = {
  qc: 'Quantitative Comparison',
  single: 'Multiple Choice',
  multi: 'Select All That Apply',
  numeric: 'Numeric Entry',
};

const QuantPractice = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('hub');
  const [activeQuiz, setActiveQuiz] = useState<QuantQuiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[] | string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [bestScores, setBestScores] = useState(getBestScores);

  // Timer
  useEffect(() => {
    if (mode !== 'quiz' || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMode('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  const startQuiz = useCallback((quiz: QuantQuiz) => {
    setActiveQuiz(quiz);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(quiz.timeLimit * 60);
    setMode('quiz');
  }, []);

  const finishQuiz = useCallback(() => {
    setMode('results');
    if (activeQuiz) {
      const score = calculateScore();
      saveBestScore(activeQuiz.id, score);
      setBestScores(getBestScores());
    }
  }, [activeQuiz, answers]);

  const calculateScore = useCallback(() => {
    if (!activeQuiz) return 0;
    let correct = 0;
    activeQuiz.questions.forEach((q) => {
      if (isCorrect(q, answers[q.id])) correct++;
    });
    return correct;
  }, [activeQuiz, answers]);

  function isCorrect(q: QuantQuestion, answer: number[] | string | undefined): boolean {
    if (answer === undefined) return false;
    if (q.type === 'numeric') {
      return String(answer).trim() === String(q.correctAnswer).trim();
    }
    // MC types: correctAnswer is number[]
    const correct = q.correctAnswer as number[];
    const given = answer as number[];
    if (correct.length !== given.length) return false;
    return correct.every((v) => given.includes(v)) && given.every((v) => correct.includes(v));
  }

  function getGreScore(correct: number): { score: string; level: string } {
    if (!activeQuiz) return { score: '?', level: '' };
    for (const tier of activeQuiz.scoringGuide) {
      if (correct >= tier.min && correct <= tier.max) return tier;
    }
    return activeQuiz.scoringGuide[activeQuiz.scoringGuide.length - 1];
  }

  // --- HUB ---
  if (mode === 'hub') {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                <h1 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                  GRE Quant Practice
                </h1>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-6 sm:py-8">
          <p className="text-muted-foreground mb-6">
            Practice quizzes covering GRE Quantitative Reasoning topics. All four question formats included.
          </p>

          <div className="grid gap-4">
            {quantQuizzes.map((quiz) => {
              const best = bestScores[quiz.id];
              return (
                <Card key={quiz.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{quiz.description}</p>
                      </div>
                      {best !== undefined && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {best}/{quiz.questions.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {quiz.timeLimit} min
                      </span>
                      <span>{quiz.questions.length} questions</span>
                      <span className="flex gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-green-500/15 text-green-700 dark:text-green-400">
                          {quiz.questions.filter((q) => q.difficulty === 'easy').length} Easy
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-yellow-500/15 text-yellow-700 dark:text-yellow-400">
                          {quiz.questions.filter((q) => q.difficulty === 'medium').length} Med
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/15 text-red-700 dark:text-red-400">
                          {quiz.questions.filter((q) => q.difficulty === 'hard').length} Hard
                        </span>
                      </span>
                    </div>
                    <Button onClick={() => startQuiz(quiz)} className="w-full sm:w-auto">
                      <Play className="h-4 w-4 mr-2" />
                      Start Quiz
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // --- QUIZ RUNNER ---
  if (mode === 'quiz' && activeQuiz) {
    const question = activeQuiz.questions[currentIndex];
    const totalQuestions = activeQuiz.questions.length;
    const currentAnswer = answers[question.id];
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    const handleOptionToggle = (idx: number) => {
      if (question.type === 'multi') {
        const current = (currentAnswer as number[]) || [];
        const next = current.includes(idx)
          ? current.filter((i) => i !== idx)
          : [...current, idx];
        setAnswers((prev) => ({ ...prev, [question.id]: next }));
      } else {
        setAnswers((prev) => ({ ...prev, [question.id]: [idx] }));
      }
    };

    const handleNumericChange = (value: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: value }));
    };

    return (
      <div className="min-h-screen flex flex-col">
        {/* Sticky header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
                    setMode('hub');
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Quit
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {currentIndex + 1} / {totalQuestions}
              </span>
              <div
                className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${
                  timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-yellow-600' : 'text-muted-foreground'
                }`}
              >
                <Clock className="h-4 w-4" />
                {formatTime(timeLeft)}
              </div>
            </div>
            <Progress value={progress} className="mt-2 h-1.5" />
          </div>
        </header>

        {/* Question body */}
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[question.difficulty]}`}>
                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                  {typeLabels[question.type]}
                </span>
              </div>

              {/* Question content */}
              {question.type === 'qc' ? (
                <div className="space-y-4">
                  {question.condition && (
                    <p className="text-sm text-muted-foreground italic">{question.condition}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border-2 border-blue-500/30 bg-blue-500/5 p-4 text-center">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wider">
                        Quantity A
                      </p>
                      <p className="font-medium text-foreground">{question.quantityA}</p>
                    </div>
                    <div className="rounded-xl border-2 border-purple-500/30 bg-purple-500/5 p-4 text-center">
                      <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wider">
                        Quantity B
                      </p>
                      <p className="font-medium text-foreground">{question.quantityB}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <p className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                    {question.content}
                  </p>
                </div>
              )}

              {/* Options / Input */}
              {question.type === 'numeric' ? (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Enter your answer:
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Type your answer..."
                    value={(currentAnswer as string) || ''}
                    onChange={(e) => handleNumericChange(e.target.value)}
                    className="max-w-xs text-lg"
                  />
                </div>
              ) : (
                <div className="mt-6 space-y-2.5">
                  {question.type === 'multi' && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Select all that apply
                    </p>
                  )}
                  {question.options?.map((option, idx) => {
                    const isSelected =
                      question.type === 'multi'
                        ? ((currentAnswer as number[]) || []).includes(idx)
                        : Array.isArray(currentAnswer) && currentAnswer[0] === idx;
                    const letter = String.fromCharCode(65 + idx);

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionToggle(idx)}
                        className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-card hover:border-primary/40 text-foreground'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-sm">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Sticky footer */}
        <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
          <div className="container max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {/* Question dots for quick nav */}
            <div className="hidden sm:flex gap-1 flex-wrap justify-center max-w-md">
              {activeQuiz.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold transition-colors ${
                    idx === currentIndex
                      ? 'bg-primary text-primary-foreground'
                      : answers[q.id] !== undefined
                      ? 'bg-primary/20 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentIndex < totalQuestions - 1 ? (
              <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button size="sm" variant="default" onClick={finishQuiz}>
                Finish
                <CheckCircle2 className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  // --- RESULTS ---
  if (mode === 'results' && activeQuiz) {
    const score = calculateScore();
    const total = activeQuiz.questions.length;
    const percent = Math.round((score / total) * 100);
    const greResult = getGreScore(score);

    const easyQs = activeQuiz.questions.filter((q) => q.difficulty === 'easy');
    const medQs = activeQuiz.questions.filter((q) => q.difficulty === 'medium');
    const hardQs = activeQuiz.questions.filter((q) => q.difficulty === 'hard');

    const countCorrect = (qs: QuantQuestion[]) =>
      qs.filter((q) => isCorrect(q, answers[q.id])).length;

    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-3xl mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setMode('hub')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-display text-lg sm:text-xl font-semibold text-foreground">
                Results: {activeQuiz.title}
              </h1>
            </div>
          </div>
        </header>

        <main className="container max-w-3xl mx-auto px-4 py-6 sm:py-8">
          {/* Score summary */}
          <Card className="mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 sm:p-8 text-center">
              <p className="text-5xl sm:text-6xl font-bold text-foreground mb-1">
                {score}/{total}
              </p>
              <p className="text-lg text-muted-foreground">{percent}% correct</p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/25">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">
                  Est. GRE Score: {greResult.score}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{greResult.level}</p>
            </div>
          </Card>

          {/* Difficulty breakdown */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Difficulty Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-green-500/10 p-3">
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">
                    {countCorrect(easyQs)}/{easyQs.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Easy</p>
                </div>
                <div className="rounded-lg bg-yellow-500/10 p-3">
                  <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">
                    {countCorrect(medQs)}/{medQs.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Medium</p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-3">
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">
                    {countCorrect(hardQs)}/{hardQs.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Hard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 mb-8">
            <Button onClick={() => startQuiz(activeQuiz)} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button variant="outline" onClick={() => setMode('hub')} className="flex-1">
              Back to Hub
            </Button>
          </div>

          {/* Question review */}
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            Question Review
          </h2>
          <div className="space-y-4">
            {activeQuiz.questions.map((q) => {
              const userAnswer = answers[q.id];
              const correct = isCorrect(q, userAnswer);
              return (
                <Card key={q.id} className={`border-l-4 ${correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">Q{q.id}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${difficultyColors[q.difficulty]}`}>
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{typeLabels[q.type]}</span>
                        </div>
                        {q.type === 'qc' ? (
                          <p className="text-sm text-foreground mb-1">
                            {q.condition && <span className="italic text-muted-foreground">{q.condition} </span>}
                            A: {q.quantityA} vs B: {q.quantityB}
                          </p>
                        ) : (
                          <p className="text-sm text-foreground mb-1">{q.content}</p>
                        )}

                        {/* Show user answer vs correct */}
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {q.type === 'numeric' ? (
                            <>
                              <p>Your answer: <span className={correct ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{userAnswer !== undefined ? String(userAnswer) : '(no answer)'}</span></p>
                              {!correct && <p>Correct: <span className="text-green-600 font-medium">{String(q.correctAnswer)}</span></p>}
                            </>
                          ) : (
                            <>
                              <p>
                                Your answer:{' '}
                                <span className={correct ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                  {Array.isArray(userAnswer) && userAnswer.length > 0
                                    ? userAnswer.map((i) => String.fromCharCode(65 + i)).join(', ')
                                    : '(no answer)'}
                                </span>
                              </p>
                              {!correct && (
                                <p>
                                  Correct:{' '}
                                  <span className="text-green-600 font-medium">
                                    {(q.correctAnswer as number[]).map((i) => String.fromCharCode(65 + i)).join(', ')}
                                  </span>
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 rounded p-2">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default QuantPractice;
