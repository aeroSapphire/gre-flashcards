import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, Clock, ChevronLeft, ChevronRight, Flag, CheckCircle,
  XCircle, RotateCcw, Grid, X, AlertTriangle, Play, Coffee,
  BookOpen, GraduationCap, FileText, Calculator,
} from 'lucide-react';
import { getMockTestById } from '@/data/mockTests';
import type { NamedMockTest, MockTestSection, MockTestQuestion } from '@/data/mockTests';

// ── Types ──

type TestPhase = 'loading' | 'intro' | 'section' | 'break' | 'results' | 'review';

interface UserAnswer {
  questionId: string;
  sectionId: string;
  answer: string | string[];
}

interface SectionResult {
  sectionId: string;
  sectionName: string;
  type: string;
  correct: number;
  total: number;
  answers: {
    questionId: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    explanation: string;
  }[];
}

// ── Timer Hook ──

function useTimer(initialSeconds: number, running: boolean, onExpire: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, onExpire]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return { seconds, formatted: formatTime(seconds) };
}

// ── Calculator ──

function CalculatorWidget({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNum, setNewNum] = useState(true);

  const handleDigit = (d: string) => {
    if (newNum) {
      setDisplay(d === '.' ? '0.' : d);
      setNewNum(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display + d);
    }
  };

  const calculate = (a: string, b: string, operator: string) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    switch (operator) {
      case '+': return na + nb;
      case '-': return na - nb;
      case '×': return na * nb;
      case '÷': return nb !== 0 ? na / nb : NaN;
      default: return nb;
    }
  };

  const handleOp = (o: string) => {
    if (prev && op && !newNum) {
      const result = calculate(prev, display, op);
      setDisplay(String(result));
      setPrev(String(result));
    } else {
      setPrev(display);
    }
    setOp(o);
    setNewNum(true);
  };

  const handleEquals = () => {
    if (prev && op) {
      const result = calculate(prev, display, op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setNewNum(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setNewNum(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border rounded-lg shadow-2xl p-3 w-64">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground">Calculator</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="bg-muted rounded px-3 py-2 text-right text-lg font-mono mb-2 truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {['7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map(key => (
          <Button
            key={key}
            variant={['+','-','×','÷'].includes(key) ? 'secondary' : key === '=' ? 'default' : 'outline'}
            size="sm"
            className="h-9 text-sm"
            onClick={() => {
              if (key === '=') handleEquals();
              else if (['+','-','×','÷'].includes(key)) handleOp(key);
              else handleDigit(key);
            }}
          >
            {key}
          </Button>
        ))}
        <Button variant="destructive" size="sm" className="h-9 text-xs col-span-4" onClick={handleClear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

// ── Question Renderer ──

function QuestionView({
  question,
  questionIndex,
  totalQuestions,
  userAnswer,
  onAnswer,
  flagged,
  onToggleFlag,
  isReview,
}: {
  question: MockTestQuestion;
  questionIndex: number;
  totalQuestions: number;
  userAnswer: string | string[] | null;
  onAnswer: (answer: string | string[]) => void;
  flagged: boolean;
  onToggleFlag: () => void;
  isReview: boolean;
}) {
  const isCorrect = isReview && userAnswer !== null && isAnswerCorrect(question, userAnswer);

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Question {questionIndex + 1} of {totalQuestions}
        </span>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">
            {question.type.replace(/_/g, ' ')}
          </Badge>
          <Button
            variant={flagged ? 'default' : 'ghost'}
            size="sm"
            onClick={onToggleFlag}
            className={flagged ? 'text-amber-500' : ''}
          >
            <Flag className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Passage */}
      {question.passage && (
        <div className="bg-muted/50 rounded-lg p-4 text-sm leading-relaxed max-h-[300px] overflow-y-auto border">
          {question.passage.split('\n').map((para, i) => (
            <p key={i} className={i > 0 ? 'mt-3' : ''}>{para}</p>
          ))}
        </div>
      )}

      {/* QC display */}
      {question.type === 'quantitative_comparison' && (
        <div className="space-y-3">
          {question.condition && (
            <div className="text-sm text-muted-foreground italic">{question.condition}</div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Quantity A</div>
              <div className="font-mono text-lg">{question.quantityA}</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Quantity B</div>
              <div className="font-mono text-lg">{question.quantityB}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stem */}
      <div className="text-base leading-relaxed">{question.stem}</div>

      {/* Data description */}
      {question.dataDescription && (
        <div className="bg-muted/30 rounded-lg p-4 text-sm border">
          <div className="text-xs text-muted-foreground mb-2 font-semibold">Data</div>
          {question.dataDescription}
        </div>
      )}

      {/* Options */}
      {question.type === 'quantitative_comparison' ? (
        <QCOptions
          userAnswer={userAnswer as string | null}
          onAnswer={(a) => onAnswer(a)}
          isReview={isReview}
          correctAnswer={question.correctAnswer as string}
        />
      ) : question.type === 'numeric_entry' ? (
        <NumericEntry
          userAnswer={userAnswer as string | null}
          onAnswer={(a) => onAnswer(a)}
          isReview={isReview}
          correctAnswer={question.correctAnswer as string}
        />
      ) : question.type === 'analytical_writing' ? (
        <AWEntry
          prompt={question.prompt || question.stem}
          directions={question.directions || ''}
        />
      ) : question.blankOptions && question.blankOptions.length > 0 ? (
        <MultiBlankOptions
          blankOptions={question.blankOptions}
          userAnswer={userAnswer as string[] | null}
          onAnswer={onAnswer}
          isReview={isReview}
          correctAnswer={question.correctAnswer as string[]}
        />
      ) : question.options ? (
        <OptionList
          options={question.options}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isReview={isReview}
          correctAnswer={question.correctAnswer}
          selectCount={question.selectCount}
        />
      ) : null}

      {/* Review: explanation */}
      {isReview && question.explanation && (
        <div className="mt-4 p-4 rounded-lg border bg-muted/30">
          <div className="text-xs font-semibold text-muted-foreground mb-2">Explanation</div>
          <div className="text-sm leading-relaxed">{question.explanation}</div>
        </div>
      )}
    </div>
  );
}

// ── Option Components ──

function QCOptions({
  userAnswer, onAnswer, isReview, correctAnswer
}: {
  userAnswer: string | null;
  onAnswer: (a: string) => void;
  isReview: boolean;
  correctAnswer: string;
}) {
  const options = [
    { key: 'A', label: 'Quantity A is greater.' },
    { key: 'B', label: 'Quantity B is greater.' },
    { key: 'C', label: 'The two quantities are equal.' },
    { key: 'D', label: 'The relationship cannot be determined from the information given.' },
  ];

  return (
    <div className="space-y-2">
      {options.map(opt => {
        const selected = userAnswer === opt.key;
        const isCorrectOption = opt.key === correctAnswer;
        let className = 'w-full text-left justify-start h-auto py-3 px-4';
        if (isReview) {
          if (isCorrectOption) className += ' border-green-500 bg-green-500/10';
          else if (selected && !isCorrectOption) className += ' border-red-500 bg-red-500/10';
        } else if (selected) {
          className += ' border-primary bg-primary/10';
        }
        return (
          <Button
            key={opt.key}
            variant="outline"
            className={className}
            onClick={() => !isReview && onAnswer(opt.key)}
            disabled={isReview}
          >
            <span className="font-mono mr-3 text-sm">{opt.key}</span>
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}

function NumericEntry({
  userAnswer, onAnswer, isReview, correctAnswer
}: {
  userAnswer: string | null;
  onAnswer: (a: string) => void;
  isReview: boolean;
  correctAnswer: string;
}) {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={userAnswer || ''}
        onChange={(e) => !isReview && onAnswer(e.target.value)}
        className="w-48 px-4 py-2 border rounded-lg bg-background text-foreground font-mono"
        placeholder="Enter your answer"
        disabled={isReview}
      />
      {isReview && (
        <div className="text-sm">
          <span className="text-muted-foreground">Correct answer: </span>
          <span className="font-mono font-semibold">{correctAnswer}</span>
        </div>
      )}
    </div>
  );
}

function AWEntry({ prompt, directions }: { prompt: string; directions: string }) {
  const [text, setText] = useState('');
  return (
    <div className="space-y-4">
      <div className="bg-muted/50 rounded-lg p-4 text-sm border">
        <div className="font-semibold mb-2">Prompt:</div>
        {prompt}
      </div>
      {directions && (
        <div className="text-sm text-muted-foreground italic">{directions}</div>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-64 px-4 py-3 border rounded-lg bg-background text-foreground resize-y"
        placeholder="Write your response here..."
      />
      <div className="text-xs text-muted-foreground">{text.split(/\s+/).filter(Boolean).length} words</div>
    </div>
  );
}

function OptionList({
  options, userAnswer, onAnswer, isReview, correctAnswer, selectCount,
}: {
  options: string[];
  userAnswer: string | string[] | null;
  onAnswer: (a: string | string[]) => void;
  isReview: boolean;
  correctAnswer: string | string[];
  selectCount?: number | 'all';
}) {
  const isMulti = selectCount === 2 || selectCount === 'all' || Array.isArray(correctAnswer);
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const selected = Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : [];
  const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  const handleClick = (letter: string) => {
    if (isReview) return;
    if (isMulti) {
      const newSelection = selected.includes(letter)
        ? selected.filter(s => s !== letter)
        : [...selected, letter];
      onAnswer(newSelection);
    } else {
      onAnswer(letter);
    }
  };

  return (
    <div className="space-y-2">
      {isMulti && (
        <div className="text-xs text-muted-foreground mb-2">
          {selectCount === 2 ? 'Select exactly 2 answers' : 'Select all that apply'}
        </div>
      )}
      {options.map((opt, i) => {
        const letter = letters[i];
        const isSelected = selected.includes(letter);
        const isCorrectOpt = correctArr.includes(letter);
        let className = 'w-full text-left justify-start h-auto py-3 px-4';
        if (isReview) {
          if (isCorrectOpt) className += ' border-green-500 bg-green-500/10';
          else if (isSelected && !isCorrectOpt) className += ' border-red-500 bg-red-500/10';
        } else if (isSelected) {
          className += ' border-primary bg-primary/10';
        }
        return (
          <Button
            key={letter}
            variant="outline"
            className={className}
            onClick={() => handleClick(letter)}
            disabled={isReview}
          >
            <span className="font-mono mr-3 text-sm w-5">{letter}</span>
            <span className="text-sm">{opt}</span>
          </Button>
        );
      })}
    </div>
  );
}

function MultiBlankOptions({
  blankOptions, userAnswer, onAnswer, isReview, correctAnswer,
}: {
  blankOptions: { blankIndex: number; options: string[] }[];
  userAnswer: string[] | null;
  onAnswer: (a: string[]) => void;
  isReview: boolean;
  correctAnswer: string[];
}) {
  const selected = userAnswer || blankOptions.map(() => '');
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const handleSelect = (blankIdx: number, letter: string) => {
    if (isReview) return;
    const newAnswers = [...selected];
    newAnswers[blankIdx] = letter;
    onAnswer(newAnswers);
  };

  return (
    <div className="space-y-4">
      {blankOptions.map((blank, bIdx) => (
        <div key={bIdx}>
          <div className="text-xs text-muted-foreground mb-2 font-semibold">
            Blank ({['i', 'ii', 'iii'][bIdx] || bIdx + 1})
          </div>
          <div className="space-y-1">
            {blank.options.map((opt, oIdx) => {
              const globalIdx = blankOptions.slice(0, bIdx).reduce((sum, b) => sum + b.options.length, 0) + oIdx;
              const letter = letters[globalIdx];
              const isSelected = selected[bIdx] === letter;
              const isCorrectOpt = correctAnswer[bIdx] === letter;
              let className = 'w-full text-left justify-start h-auto py-2 px-3 text-sm';
              if (isReview) {
                if (isCorrectOpt) className += ' border-green-500 bg-green-500/10';
                else if (isSelected && !isCorrectOpt) className += ' border-red-500 bg-red-500/10';
              } else if (isSelected) {
                className += ' border-primary bg-primary/10';
              }
              return (
                <Button
                  key={letter}
                  variant="outline"
                  className={className}
                  onClick={() => handleSelect(bIdx, letter)}
                  disabled={isReview}
                >
                  <span className="font-mono mr-2 w-4">{letter}</span>
                  {opt}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Helpers ──

function isAnswerCorrect(question: MockTestQuestion, userAnswer: string | string[]): boolean {
  const correct = question.correctAnswer;
  if (Array.isArray(correct) && Array.isArray(userAnswer)) {
    const sortedCorrect = [...correct].sort();
    const sortedUser = [...userAnswer].sort();
    return sortedCorrect.length === sortedUser.length &&
      sortedCorrect.every((c, i) => c === sortedUser[i]);
  }
  if (typeof correct === 'string' && typeof userAnswer === 'string') {
    // For numeric entry, compare values
    if (question.type === 'numeric_entry') {
      const cv = parseFloat(correct);
      const uv = parseFloat(userAnswer);
      if (!isNaN(cv) && !isNaN(uv)) return Math.abs(cv - uv) < 0.001;
    }
    return correct === userAnswer;
  }
  return false;
}

// ── Main Component ──

const NamedMockTestRunner = () => {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const [phase, setPhase] = useState<TestPhase>('loading');
  const [test, setTest] = useState<NamedMockTest | null>(null);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string | string[]>>(new Map());
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNav, setShowNav] = useState(false);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [reviewSection, setReviewSection] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // Load test data
  useEffect(() => {
    if (!testId) return;
    const entry = getMockTestById(testId);
    if (!entry) {
      navigate('/mock-tests');
      return;
    }
    entry.load().then(data => {
      setTest(data);
      setPhase('intro');
    });
  }, [testId, navigate]);

  const currentSection = test?.sections[currentSectionIdx] || null;
  const currentQuestion = currentSection?.questions[currentQuestionIdx] || null;

  const sectionTime = useMemo(() => {
    return (currentSection?.timeMinutes || 30) * 60;
  }, [currentSection]);

  const handleTimeExpire = useCallback(() => {
    handleFinishSection();
  }, []);

  const { formatted: timerDisplay } = useTimer(sectionTime, timerRunning, handleTimeExpire);

  // ── Handlers ──

  const handleStartSection = useCallback(() => {
    setCurrentQuestionIdx(0);
    setTimerRunning(true);
    setPhase('section');
  }, []);

  const handleAnswer = useCallback((answer: string | string[]) => {
    if (!currentQuestion) return;
    setAnswers(prev => new Map(prev).set(currentQuestion.id, answer));
  }, [currentQuestion]);

  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  }, [currentQuestion]);

  const handleFinishSection = useCallback(() => {
    if (!currentSection || !test) return;
    setTimerRunning(false);

    // Score section
    const sectionAnswers = currentSection.questions
      .filter(q => q.type !== 'analytical_writing')
      .map(q => {
        const userAnswer = answers.get(q.id);
        const correct = userAnswer ? isAnswerCorrect(q, userAnswer) : false;
        return {
          questionId: q.id,
          userAnswer: userAnswer || '',
          correctAnswer: q.correctAnswer,
          isCorrect: correct,
          explanation: q.explanation,
        };
      });

    const correctCount = sectionAnswers.filter(a => a.isCorrect).length;
    const totalCount = sectionAnswers.length;

    setSectionResults(prev => [...prev, {
      sectionId: currentSection.id,
      sectionName: currentSection.name,
      type: currentSection.type,
      correct: correctCount,
      total: totalCount,
      answers: sectionAnswers,
    }]);

    // Move to next section or results
    const nextIdx = currentSectionIdx + 1;
    if (nextIdx < test.sections.length) {
      setCurrentSectionIdx(nextIdx);
      setCurrentQuestionIdx(0);
      setPhase('break');
    } else {
      setPhase('results');
    }
  }, [currentSection, test, currentSectionIdx, answers]);

  // ── Loading ──
  if (phase === 'loading' || !test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 animate-bounce" />
          Loading test...
        </div>
      </div>
    );
  }

  // ── Intro Screen ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
          <Button variant="ghost" onClick={() => navigate('/mock-tests')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tests
          </Button>

          <div className="text-center space-y-3">
            <GraduationCap className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">{test.name}</h1>
            <p className="text-muted-foreground">{test.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {test.sections.map((section, i) => (
                <div key={section.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-6">{i + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{section.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {section.questionCount} questions
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {section.timeMinutes} min
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button size="lg" onClick={handleStartSection} className="gap-2">
              <Play className="h-5 w-5" />
              Start Test
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Break Screen ──
  if (phase === 'break') {
    const nextSection = test.sections[currentSectionIdx];
    const lastResult = sectionResults[sectionResults.length - 1];
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <Coffee className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-2xl font-bold">Section Break</h2>

          {lastResult && (
            <div className="text-muted-foreground">
              <span className="font-semibold text-foreground">{lastResult.sectionName}</span>
              {lastResult.type !== 'analytical_writing' && (
                <span> — {lastResult.correct}/{lastResult.total} correct</span>
              )}
            </div>
          )}

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Up Next</div>
            <div className="font-semibold">{nextSection.name}</div>
            <div className="text-sm text-muted-foreground">
              {nextSection.questionCount} questions · {nextSection.timeMinutes} minutes
            </div>
          </div>

          <Button size="lg" onClick={handleStartSection} className="gap-2">
            <Play className="h-5 w-5" />
            Continue to Next Section
          </Button>
        </div>
      </div>
    );
  }

  // ── Results Screen ──
  if (phase === 'results') {
    const totalCorrect = sectionResults.reduce((s, r) => s + r.correct, 0);
    const totalQuestions = sectionResults.reduce((s, r) => s + r.total, 0);
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    if (reviewSection !== null) {
      const section = sectionResults[reviewSection];
      const sectionData = test.sections.find(s => s.id === section.sectionId);
      return (
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setReviewSection(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="font-semibold">{section.sectionName} — Review</h2>
                <p className="text-xs text-muted-foreground">
                  {section.correct}/{section.total} correct
                </p>
              </div>
            </div>
          </header>
          <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
            {sectionData?.questions
              .filter(q => q.type !== 'analytical_writing')
              .map((q, qIdx) => {
                const a = section.answers.find(a => a.questionId === q.id);
                return (
                  <Card key={q.id} className={a?.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}>
                    <CardContent className="pt-6">
                      <QuestionView
                        question={q}
                        questionIndex={qIdx}
                        totalQuestions={section.total}
                        userAnswer={a?.userAnswer || null}
                        onAnswer={() => {}}
                        flagged={false}
                        onToggleFlag={() => {}}
                        isReview={true}
                      />
                    </CardContent>
                  </Card>
                );
              })}
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container max-w-3xl mx-auto px-4 py-12 space-y-8">
          <div className="text-center space-y-3">
            <GraduationCap className="h-12 w-12 mx-auto text-primary" />
            <h1 className="text-3xl font-bold">{test.name}</h1>
            <h2 className="text-xl text-muted-foreground">Test Complete</h2>
          </div>

          {/* Overall score */}
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <div className="text-5xl font-bold text-primary">{percentage}%</div>
              <div className="text-muted-foreground">
                {totalCorrect} / {totalQuestions} correct
              </div>
              <Progress value={percentage} className="h-3" />
            </CardContent>
          </Card>

          {/* Section breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold">Section Results</h3>
            {sectionResults.map((result, idx) => (
              <Card key={result.sectionId}>
                <CardContent className="pt-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{result.sectionName}</div>
                    {result.type !== 'analytical_writing' ? (
                      <div className="text-sm text-muted-foreground">
                        {result.correct}/{result.total} correct (
                        {result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0}%)
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Essay — self-evaluate</div>
                    )}
                  </div>
                  {result.type !== 'analytical_writing' && (
                    <Button variant="outline" size="sm" onClick={() => setReviewSection(idx)}>
                      Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/mock-tests')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tests
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Section (Test Taking) ──
  if (!currentSection || !currentQuestion) return null;

  const sectionQuestions = currentSection.questions;
  const answeredCount = sectionQuestions.filter(q => answers.has(q.id)).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">{currentSection.name}</div>
            <Badge variant="outline" className="text-xs">
              {answeredCount}/{sectionQuestions.length} answered
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={timerRunning ? 'default' : 'secondary'} className="gap-1 font-mono">
              <Clock className="h-3.5 w-3.5" />
              {timerDisplay}
            </Badge>
            {currentSection.type === 'quantitative' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                <Calculator className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowNav(!showNav)}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Question Navigator Overlay */}
      {showNav && (
        <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setShowNav(false)}>
          <div className="absolute top-14 right-4 bg-card rounded-lg shadow-2xl border p-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-semibold mb-3">Question Navigator</div>
            <div className="grid grid-cols-5 gap-2">
              {sectionQuestions.map((q, i) => {
                const answered = answers.has(q.id);
                const isFlagged = flagged.has(q.id);
                const isCurrent = i === currentQuestionIdx;
                return (
                  <Button
                    key={q.id}
                    variant={isCurrent ? 'default' : answered ? 'secondary' : 'outline'}
                    size="sm"
                    className={`h-9 w-9 p-0 text-xs ${isFlagged ? 'ring-2 ring-amber-400' : ''}`}
                    onClick={() => { setCurrentQuestionIdx(i); setShowNav(false); }}
                  >
                    {i + 1}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main question area */}
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        <QuestionView
          question={currentQuestion}
          questionIndex={currentQuestionIdx}
          totalQuestions={sectionQuestions.length}
          userAnswer={answers.get(currentQuestion.id) || null}
          onAnswer={handleAnswer}
          flagged={flagged.has(currentQuestion.id)}
          onToggleFlag={handleToggleFlag}
          isReview={false}
        />
      </main>

      {/* Bottom navigation */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm sticky bottom-0">
        <div className="container max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={currentQuestionIdx === 0}
            onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          <div className="text-xs text-muted-foreground">
            {currentQuestionIdx + 1} / {sectionQuestions.length}
          </div>

          {currentQuestionIdx < sectionQuestions.length - 1 ? (
            <Button
              variant="ghost"
              onClick={() => setCurrentQuestionIdx(prev => Math.min(sectionQuestions.length - 1, prev + 1))}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleFinishSection} className="gap-1">
              <CheckCircle className="h-4 w-4" />
              Finish Section
            </Button>
          )}
        </div>
      </footer>

      {/* Calculator */}
      {showCalculator && <CalculatorWidget onClose={() => setShowCalculator(false)} />}
    </div>
  );
};

export default NamedMockTestRunner;
