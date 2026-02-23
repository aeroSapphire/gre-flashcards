import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calculator,
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  XCircle,
  RotateCcw,
  Grid,
  X,
} from 'lucide-react';
import {
  section1Questions,
  section2EasyQuestions,
  section2HardQuestions,
  shuffleWithinBlocks,
  isAnswerCorrect,
  calculateScaledScore,
  getPercentile,
} from '@/data/greAdaptiveMockTest';
import type { MockQuestion } from '@/data/greAdaptiveMockTest';

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
const SECTION1_TIME = 21 * 60; // seconds
const SECTION2_TIME = 26 * 60;
const BREAK_TIME = 60;
const SECTION1_HARD_THRESHOLD = 8; // score ≥ 8 → hard section 2

type TestPhase = 'intro' | 'section1' | 'break' | 'section2' | 'results' | 'review';

// ─────────────────────────────────────────────────────────
// Calculator Component
// ─────────────────────────────────────────────────────────
function CalculatorWidget({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [prev, setPrev] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNum, setNewNum] = useState(true);

  const handleDigit = (d: string) => {
    if (display.length >= 12 && !newNum) return;
    if (newNum) {
      setDisplay(d === '.' ? '0.' : d);
      setNewNum(false);
    } else {
      if (d === '.' && display.includes('.')) return;
      setDisplay(display + d);
    }
  };

  const handleOp = (o: string) => {
    setPrev(display);
    setOp(o);
    setNewNum(true);
  };

  const handleEquals = () => {
    if (!prev || !op) return;
    const a = parseFloat(prev);
    const b = parseFloat(display);
    let result: number;
    switch (op) {
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b !== 0 ? a / b : NaN; break;
      default: return;
    }
    const str = isNaN(result) ? 'Error' : parseFloat(result.toFixed(8)).toString();
    setDisplay(str);
    setPrev(null);
    setOp(null);
    setNewNum(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setPrev(null);
    setOp(null);
    setNewNum(true);
  };

  const handleToggleSign = () => {
    if (display === '0' || display === 'Error') return;
    setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
  };

  const btnClass = 'h-10 rounded font-medium text-sm transition-colors';

  return (
    <div className="fixed bottom-20 right-4 z-50 w-56 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground">Calculator</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-2">
        {/* Display */}
        <div className="bg-muted rounded-lg px-3 py-2 mb-2 text-right min-h-[2.5rem] flex items-center justify-end">
          <span className={`font-mono font-bold ${display.length > 9 ? 'text-sm' : 'text-lg'} text-foreground`}>
            {op && prev ? <span className="text-xs text-muted-foreground mr-1">{prev} {op}</span> : null}
            {display}
          </span>
        </div>
        {/* Buttons */}
        <div className="grid grid-cols-4 gap-1">
          {/* Row 1 */}
          <button onClick={handleClear} className={`${btnClass} bg-destructive/10 text-destructive hover:bg-destructive/20 col-span-2`}>C</button>
          <button onClick={handleToggleSign} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground`}>+/−</button>
          <button onClick={() => handleOp('÷')} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20 font-bold`}>÷</button>
          {/* Row 2 */}
          {['7', '8', '9'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground`}>{d}</button>
          ))}
          <button onClick={() => handleOp('×')} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20 font-bold`}>×</button>
          {/* Row 3 */}
          {['4', '5', '6'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground`}>{d}</button>
          ))}
          <button onClick={() => handleOp('−')} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20 font-bold`}>−</button>
          {/* Row 4 */}
          {['1', '2', '3'].map(d => (
            <button key={d} onClick={() => handleDigit(d)} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground`}>{d}</button>
          ))}
          <button onClick={() => handleOp('+')} className={`${btnClass} bg-primary/10 text-primary hover:bg-primary/20 font-bold`}>+</button>
          {/* Row 5 */}
          <button onClick={() => handleDigit('0')} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground col-span-2`}>0</button>
          <button onClick={() => handleDigit('.')} className={`${btnClass} bg-muted hover:bg-muted/70 text-foreground`}>.</button>
          <button onClick={handleEquals} className={`${btnClass} bg-primary text-primary-foreground hover:bg-primary/90 font-bold`}>=</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Question Navigator
// ─────────────────────────────────────────────────────────
function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onJump,
  onClose,
}: {
  questions: MockQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  markedForReview: Set<string>;
  onJump: (i: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-card border-t border-border rounded-t-2xl p-4 pb-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Question Navigator</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-primary inline-block" /> Current</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-green-500 inline-block" /> Answered</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-yellow-500 inline-block" /> Marked</span>
          <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-muted border border-border inline-block" /> Unanswered</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.id];
            const isMarked = markedForReview.has(q.id);
            const isCurrent = i === currentIndex;
            let bg = 'bg-muted border-border text-muted-foreground';
            if (isCurrent) bg = 'bg-primary text-primary-foreground border-primary';
            else if (isMarked) bg = 'bg-yellow-500 text-white border-yellow-600';
            else if (isAnswered) bg = 'bg-green-500 text-white border-green-600';
            return (
              <button
                key={q.id}
                onClick={() => { onJump(i); onClose(); }}
                className={`h-9 w-full rounded border text-xs font-bold transition-colors ${bg}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Question Renderer
// ─────────────────────────────────────────────────────────
function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswer,
}: {
  question: MockQuestion;
  questionNumber: number;
  totalQuestions: number;
  answer: string;
  onAnswer: (val: string) => void;
}) {
  const QC_CHOICES = [
    { key: 'A', label: 'Quantity A is greater' },
    { key: 'B', label: 'Quantity B is greater' },
    { key: 'C', label: 'The two quantities are equal' },
    { key: 'D', label: 'The relationship cannot be determined from the information given' },
  ];

  if (question.type === 'qc') {
    return (
      <div className="space-y-5">
        {/* Condition */}
        {question.condition && (
          <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border">
            <p className="text-sm text-foreground italic">{question.condition}</p>
          </div>
        )}

        {/* QC Table */}
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="grid grid-cols-2">
            <div className="bg-blue-500/10 border-r border-border px-4 py-3 text-center">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Quantity A</p>
              <p className="text-lg font-semibold text-foreground">{question.quantityA}</p>
            </div>
            <div className="bg-purple-500/10 px-4 py-3 text-center">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Quantity B</p>
              <p className="text-lg font-semibold text-foreground">{question.quantityB}</p>
            </div>
          </div>
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {QC_CHOICES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onAnswer(key)}
              className={`w-full text-left rounded-lg border px-4 py-3 flex items-center gap-3 transition-all text-sm
                ${answer === key
                  ? 'bg-primary/10 border-primary text-primary font-medium'
                  : 'bg-card border-border hover:bg-muted/50 text-foreground'
                }`}
            >
              <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                ${answer === key ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                {key}
              </span>
              {label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (question.type === 'single') {
    return (
      <div className="space-y-5">
        {question.condition && (
          <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border">
            <p className="text-sm text-foreground italic">{question.condition}</p>
          </div>
        )}
        <p className="text-base text-foreground leading-relaxed">{question.stem}</p>
        <div className="space-y-2">
          {question.options!.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const selected = answer === String(i);
            return (
              <button
                key={i}
                onClick={() => onAnswer(String(i))}
                className={`w-full text-left rounded-lg border px-4 py-3 flex items-center gap-3 transition-all text-sm
                  ${selected
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'bg-card border-border hover:bg-muted/50 text-foreground'
                  }`}
              >
                <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0
                  ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                  {letter}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'multi') {
    const selectedSet = new Set(
      answer ? answer.split(',').filter(Boolean) : []
    );
    const toggle = (idx: string) => {
      const next = new Set(selectedSet);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      onAnswer([...next].sort().join(','));
    };
    return (
      <div className="space-y-5">
        {question.condition && (
          <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border">
            <p className="text-sm text-foreground italic">{question.condition}</p>
          </div>
        )}
        <p className="text-base text-foreground leading-relaxed">{question.stem}</p>
        <p className="text-xs text-muted-foreground italic">Select all that apply.</p>
        <div className="space-y-2">
          {question.options!.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const selected = selectedSet.has(String(i));
            return (
              <button
                key={i}
                onClick={() => toggle(String(i))}
                className={`w-full text-left rounded-lg border px-4 py-3 flex items-center gap-3 transition-all text-sm
                  ${selected
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'bg-card border-border hover:bg-muted/50 text-foreground'
                  }`}
              >
                <span className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold shrink-0
                  ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40'}`}>
                  {selected ? '✓' : letter}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'numeric') {
    return (
      <div className="space-y-5">
        {question.condition && (
          <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border">
            <p className="text-sm text-foreground italic">{question.condition}</p>
          </div>
        )}
        <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{question.stem}</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={answer}
            onChange={e => onAnswer(e.target.value)}
            placeholder="Enter your answer"
            className="w-48 px-4 py-2.5 rounded-lg border border-border bg-muted text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>
      </div>
    );
  }

  if (question.type === 'fraction') {
    const parts = answer ? answer.split('/') : ['', ''];
    const numerator = parts[0] || '';
    const denominator = parts[1] || '';
    const update = (num: string, den: string) => onAnswer(`${num}/${den}`);
    return (
      <div className="space-y-5">
        {question.condition && (
          <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border">
            <p className="text-sm text-foreground italic">{question.condition}</p>
          </div>
        )}
        <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{question.stem}</p>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <input
              type="text"
              value={numerator}
              onChange={e => update(e.target.value, denominator)}
              placeholder="Numerator"
              className="w-28 px-3 py-2 text-center rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <div className="w-28 h-0.5 bg-foreground" />
            <input
              type="text"
              value={denominator}
              onChange={e => update(numerator, e.target.value)}
              placeholder="Denominator"
              className="w-28 px-3 py-2 text-center rounded-lg border border-border bg-muted text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground">Enter as a fraction</p>
        </div>
      </div>
    );
  }

  return null;
}

// ─────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────
const GREAdaptiveMockTest = () => {
  const navigate = useNavigate();

  // Phase
  const [phase, setPhase] = useState<TestPhase>('intro');

  // Questions (shuffled on start)
  const [s1Questions, setS1Questions] = useState<MockQuestion[]>([]);
  const [s2Questions, setS2Questions] = useState<MockQuestion[]>([]);
  const [section2Difficulty, setSection2Difficulty] = useState<'easy' | 'hard'>('hard');

  // Test state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // Scores
  const [s1Score, setS1Score] = useState(0);
  const [s2Score, setS2Score] = useState(0);

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(SECTION1_TIME);
  const [breakTime, setBreakTime] = useState(BREAK_TIME);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  // Review mode - which section to show
  const [reviewSection, setReviewSection] = useState<'section1' | 'section2'>('section1');

  const activeQuestions = phase === 'section2' ? s2Questions : s1Questions;

  // ── Timer ──
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const autoSubmit = useCallback(() => {
    clearTimer();
    if (phase === 'section1') {
      submitSection1();
    } else if (phase === 'section2') {
      submitSection2();
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'section1' || phase === 'section2') {
      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearTimer();
            autoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (phase === 'break') {
      clearTimer();
      timerRef.current = setInterval(() => {
        setBreakTime(prev => {
          if (prev <= 1) {
            clearTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers ──
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerColor = (secs: number) => {
    if (secs <= 60) return 'text-red-500';
    if (secs <= 300) return 'text-yellow-500';
    return 'text-foreground';
  };

  const scoreSection = (questions: MockQuestion[], ans: Record<string, string>) =>
    questions.filter(q => isAnswerCorrect(q, ans[q.id] || '')).length;

  // ── Start test ──
  const startTest = () => {
    const s1 = shuffleWithinBlocks([...section1Questions]);
    setS1Questions(s1);
    setAnswers({});
    setMarkedForReview(new Set());
    setCurrentQ(0);
    setTimeRemaining(SECTION1_TIME);
    setPhase('section1');
  };

  // ── Submit Section 1 ──
  const submitSection1 = useCallback(() => {
    clearTimer();
    setCurrentQ(0);
    const score = scoreSection(s1Questions, answers);
    setS1Score(score);
    const difficulty = score >= SECTION1_HARD_THRESHOLD ? 'hard' : 'easy';
    setSection2Difficulty(difficulty);
    const s2 = shuffleWithinBlocks(
      difficulty === 'hard' ? [...section2HardQuestions] : [...section2EasyQuestions]
    );
    setS2Questions(s2);
    setBreakTime(BREAK_TIME);
    setPhase('break');
  }, [s1Questions, answers, clearTimer]);

  // ── Submit Section 2 ──
  const submitSection2 = useCallback(() => {
    clearTimer();
    const score = scoreSection(s2Questions, answers);
    setS2Score(score);
    setPhase('results');
  }, [s2Questions, answers, clearTimer]);

  // ── Navigation ──
  const goNext = () => {
    const qs = activeQuestions;
    if (currentQ < qs.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Last question — submit
      if (phase === 'section1') submitSection1();
      else if (phase === 'section2') submitSection2();
    }
  };

  const goPrev = () => {
    if (currentQ > 0) setCurrentQ(currentQ - 1);
  };

  const toggleMark = () => {
    const qId = activeQuestions[currentQ]?.id;
    if (!qId) return;
    const next = new Set(markedForReview);
    next.has(qId) ? next.delete(qId) : next.add(qId);
    setMarkedForReview(next);
  };

  const isMarked = activeQuestions[currentQ]
    ? markedForReview.has(activeQuestions[currentQ].id)
    : false;

  const answeredCount = activeQuestions.filter(q => !!answers[q.id]).length;

  // ── Begin Section 2 ──
  const beginSection2 = () => {
    setTimeRemaining(SECTION2_TIME);
    setCurrentQ(0);
    setPhase('section2');
  };

  // ──────────────────────────────
  // RENDER: INTRO
  // ──────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/quant')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold text-foreground">GRE Quantitative Mock Test</h1>
          </div>
        </header>

        <main className="container max-w-3xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">📐</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Adaptive GRE Quant Mock Test
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Experience the real GRE format with 2 adaptive sections covering Arithmetic and Algebra.
            </p>
          </div>

          {/* Test structure */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">S1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Section 1</h3>
                  <p className="text-xs text-muted-foreground">Standard difficulty</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• 12 questions</p>
                <p>• 21 minutes</p>
                <p>• 5 QC + 5 Problem Solving + 2 Numeric</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">S2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Section 2</h3>
                  <p className="text-xs text-muted-foreground">Adaptive (Easy or Hard)</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• 15 questions</p>
                <p>• 26 minutes</p>
                <p>• 6 QC + 6 Problem Solving + 3 Numeric</p>
              </div>
            </div>
          </div>

          {/* Adaptive logic */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-foreground mb-2">How Adaptivity Works</h3>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <p className="font-medium text-green-700 mb-1">Score ≥ 8/12 on Section 1</p>
                <p className="text-green-600">→ Section 2 HARD (scaled up to 170)</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                <p className="font-medium text-orange-700 mb-1">Score ≤ 7/12 on Section 1</p>
                <p className="text-orange-600">→ Section 2 EASY (capped ~154)</p>
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="bg-card border border-border rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-foreground mb-3">Test Rules</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• You can navigate forward and backward within each section</li>
              <li>• You can mark questions for review</li>
              <li>• An on-screen calculator is available throughout</li>
              <li>• The timer auto-submits when it reaches 0:00</li>
              <li>• You have a 1-minute break between sections</li>
              <li>• Total time: 47 minutes (21 + 26)</li>
            </ul>
          </div>

          <div className="text-center">
            <Button size="lg" onClick={startTest} className="px-10 text-base h-12">
              Start Test
            </Button>
            <p className="text-xs text-muted-foreground mt-3">27 questions • 47 minutes total</p>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────
  // RENDER: SECTION TAKING (S1 or S2)
  // ──────────────────────────────
  if (phase === 'section1' || phase === 'section2') {
    const questions = activeQuestions;
    const q = questions[currentQ];
    if (!q) return null;
    const sectionLabel = phase === 'section1' ? 'Section 1 of 2' : `Section 2 of 2 — ${section2Difficulty.toUpperCase()}`;
    const totalTime = phase === 'section1' ? SECTION1_TIME : SECTION2_TIME;
    const timePercent = (timeRemaining / totalTime) * 100;

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Section info */}
              <div>
                <p className="text-xs text-muted-foreground">{sectionLabel}</p>
                <p className="text-sm font-semibold text-foreground">
                  Question {currentQ + 1} of {questions.length}
                </p>
              </div>

              {/* Center: Timer */}
              <div className={`flex items-center gap-2 font-mono font-bold text-xl ${timerColor(timeRemaining)} ${timeRemaining <= 60 ? 'animate-pulse' : ''}`}>
                <Clock className="h-4 w-4" />
                {formatTime(timeRemaining)}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNavigator(!showNavigator)}
                  title="Question navigator"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCalculator(!showCalculator)}
                  title="Calculator"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeRemaining <= 60 ? 'bg-red-500' :
                  timeRemaining <= 300 ? 'bg-yellow-500' : 'bg-primary'
                }`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>
        </header>

        {/* Question */}
        <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
          {/* Q header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-1 rounded uppercase tracking-wide">
                {q.type === 'qc' ? 'Quantitative Comparison' :
                 q.type === 'multi' ? 'Select All That Apply' :
                 q.type === 'numeric' || q.type === 'fraction' ? 'Numeric Entry' :
                 'Multiple Choice'}
              </span>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                q.difficulty === 'hard' ? 'bg-red-500/10 text-red-600' :
                q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                'bg-green-500/10 text-green-600'
              }`}>
                {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
              </span>
            </div>
            <button
              onClick={toggleMark}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                ${isMarked
                  ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-600'
                  : 'border-border text-muted-foreground hover:bg-muted'
                }`}
            >
              <Flag className="h-3.5 w-3.5" />
              {isMarked ? 'Marked' : 'Mark'}
            </button>
          </div>

          {/* Question content */}
          <QuestionDisplay
            question={q}
            questionNumber={currentQ + 1}
            totalQuestions={questions.length}
            answer={answers[q.id] || ''}
            onAnswer={val => setAnswers(prev => ({ ...prev, [q.id]: val }))}
          />
        </main>

        {/* Footer Navigation */}
        <footer className="border-t border-border bg-card/80 backdrop-blur-sm sticky bottom-0 z-30">
          <div className="container max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={goPrev}
                disabled={currentQ === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>

              <div className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </div>

              {currentQ < questions.length - 1 ? (
                <Button size="sm" onClick={goNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => {
                    if (phase === 'section1') submitSection1();
                    else submitSection2();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Submit Section
                  <CheckCircle className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </footer>

        {/* Calculator */}
        {showCalculator && (
          <CalculatorWidget onClose={() => setShowCalculator(false)} />
        )}

        {/* Navigator */}
        {showNavigator && (
          <QuestionNavigator
            questions={questions}
            currentIndex={currentQ}
            answers={answers}
            markedForReview={markedForReview}
            onJump={setCurrentQ}
            onClose={() => setShowNavigator(false)}
          />
        )}
      </div>
    );
  }

  // ──────────────────────────────
  // RENDER: BREAK
  // ──────────────────────────────
  if (phase === 'break') {
    const difficulty = section2Difficulty;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2">
            Section 1 Complete!
          </h2>
          <p className="text-muted-foreground mb-8">
            You scored <span className="font-bold text-foreground">{s1Score}/12</span> on Section 1.
          </p>

          {/* Section 2 difficulty reveal */}
          <div className={`rounded-xl border p-6 mb-8 ${
            difficulty === 'hard'
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-orange-500/10 border-orange-500/20'
          }`}>
            <p className="text-sm text-muted-foreground mb-1">Your Section 2 will be:</p>
            <p className={`text-3xl font-bold ${difficulty === 'hard' ? 'text-green-600' : 'text-orange-600'}`}>
              {difficulty === 'hard' ? 'HARD' : 'EASY'}
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              {difficulty === 'hard'
                ? 'Score ≥ 8/12 → eligible for 142–170 scaled score range'
                : 'Score ≤ 7/12 → scaled score range capped at ~154'}
            </p>
          </div>

          {/* Break timer */}
          <div className="mb-6">
            {breakTime > 0 ? (
              <>
                <div className={`text-4xl font-mono font-bold mb-2 ${timerColor(breakTime)}`}>
                  {formatTime(breakTime)}
                </div>
                <p className="text-sm text-muted-foreground">Section 2 begins in...</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Ready when you are.</p>
            )}
          </div>

          <Button
            size="lg"
            onClick={beginSection2}
            className="px-10 h-12 text-base"
          >
            Begin Section 2 →
          </Button>
          <p className="text-xs text-muted-foreground mt-3">15 questions • 26 minutes</p>
        </div>
      </div>
    );
  }

  // ──────────────────────────────
  // RENDER: RESULTS
  // ──────────────────────────────
  if (phase === 'results') {
    const rawTotal = s1Score + s2Score;
    const scaledScore = calculateScaledScore(rawTotal, section2Difficulty);
    const percentile = getPercentile(scaledScore);

    // Topic breakdown
    const allQ = [...s1Questions, ...s2Questions];
    const topicMap: Record<string, { correct: number; total: number }> = {};
    for (const q of allQ) {
      if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
      topicMap[q.topic].total++;
      if (isAnswerCorrect(q, answers[q.id] || '')) topicMap[q.topic].correct++;
    }
    const weakTopics = Object.entries(topicMap)
      .filter(([, v]) => v.correct < v.total)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
      .slice(0, 5);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/quant')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl font-bold text-foreground">Score Report</h1>
          </div>
        </header>

        <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
          {/* Main Score Card */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">GRE Quantitative Score</p>
            <div className="text-7xl font-bold font-display text-primary mb-2">
              {scaledScore}
            </div>
            <p className="text-base text-muted-foreground">
              Approximately <span className="font-semibold text-foreground">{percentile}th percentile</span>
            </p>
            <div className="mt-4 h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${((scaledScore - 130) / 40) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>130</span>
              <span>170</span>
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Section Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Section 1</p>
                  <p className="text-xs text-muted-foreground">Standard difficulty</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">{s1Score} / 12</p>
                  <p className="text-xs text-muted-foreground">{Math.round((s1Score / 12) * 100)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="font-medium text-foreground">Section 2</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    section2Difficulty === 'hard'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    {section2Difficulty.toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground text-lg">{s2Score} / 15</p>
                  <p className="text-xs text-muted-foreground">{Math.round((s2Score / 15) * 100)}%</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <p className="font-semibold text-foreground">Raw Total</p>
                <p className="font-bold text-foreground text-lg">{rawTotal} / 27</p>
              </div>
            </div>
          </div>

          {/* Scoring method note */}
          <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Score Calculation</p>
            {section2Difficulty === 'hard'
              ? <p>Hard Section 2: Scaled = 142 + round({rawTotal}/27 × 28) = <strong>{scaledScore}</strong></p>
              : <p>Easy Section 2: Scaled = 130 + round({rawTotal}/27 × 24) = <strong>{scaledScore}</strong></p>
            }
          </div>

          {/* Weakest Topics */}
          {weakTopics.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Areas to Improve</h3>
              <div className="space-y-3">
                {weakTopics.map(([topic, stats]) => (
                  <div key={topic} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-foreground truncate">{topic}</p>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground shrink-0">
                      {stats.correct}/{stats.total}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid sm:grid-cols-2 gap-3 pb-8">
            <Button
              variant="outline"
              onClick={() => { setReviewSection('section1'); setPhase('review'); }}
            >
              Review All Answers
            </Button>
            <Button onClick={startTest} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Test
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ──────────────────────────────
  // RENDER: REVIEW
  // ──────────────────────────────
  if (phase === 'review') {
    const LETTER = ['A', 'B', 'C', 'D', 'E'];
    const QC_LABELS: Record<string, string> = {
      A: 'Quantity A is greater',
      B: 'Quantity B is greater',
      C: 'The two quantities are equal',
      D: 'The relationship cannot be determined',
    };

    const displayQuestions = reviewSection === 'section1' ? s1Questions : s2Questions;
    const rawTotal = s1Score + s2Score;
    const scaledScore = calculateScaledScore(rawTotal, section2Difficulty);

    const formatCorrectAnswer = (q: MockQuestion): string => {
      switch (q.type) {
        case 'qc': return `(${q.correctAnswer}) ${QC_LABELS[q.correctAnswer as string]}`;
        case 'single': {
          const idx = q.correctAnswer as number;
          return `(${LETTER[idx]}) ${q.options![idx]}`;
        }
        case 'multi': {
          const indices = q.correctAnswer as number[];
          return indices.map(i => `(${LETTER[i]}) ${q.options![i]}`).join(', ');
        }
        case 'numeric': return String(q.correctAnswer);
        case 'fraction': return String(q.correctAnswer);
        default: return String(q.correctAnswer);
      }
    };

    const formatUserAnswer = (q: MockQuestion, userAns: string): string => {
      if (!userAns) return 'No answer';
      switch (q.type) {
        case 'qc': return `(${userAns}) ${QC_LABELS[userAns] || ''}`;
        case 'single': {
          const idx = parseInt(userAns, 10);
          if (isNaN(idx) || idx < 0 || idx >= (q.options?.length || 0)) return userAns;
          return `(${LETTER[idx]}) ${q.options![idx]}`;
        }
        case 'multi': {
          if (!userAns) return 'No answer';
          const indices = userAns.split(',').filter(Boolean).map(Number);
          return indices.map(i => `(${LETTER[i]}) ${q.options![i]}`).join(', ') || 'No answer';
        }
        case 'numeric': return userAns;
        case 'fraction': return userAns;
        default: return userAns;
      }
    };

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setPhase('results')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Answer Review</h1>
                  <p className="text-xs text-muted-foreground">Scaled Score: {scaledScore}/170</p>
                </div>
              </div>
              {/* Section toggle */}
              <div className="flex bg-muted rounded-lg p-1 gap-1">
                <button
                  onClick={() => setReviewSection('section1')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    reviewSection === 'section1'
                      ? 'bg-card shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Section 1 ({s1Score}/12)
                </button>
                <button
                  onClick={() => setReviewSection('section2')}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    reviewSection === 'section2'
                      ? 'bg-card shadow text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Section 2 ({s2Score}/15)
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-3xl mx-auto px-4 py-6 pb-12 space-y-4">
          {displayQuestions.map((q, idx) => {
            const userAns = answers[q.id] || '';
            const correct = isAnswerCorrect(q, userAns);

            return (
              <div
                key={q.id}
                className={`bg-card border rounded-xl overflow-hidden ${
                  correct ? 'border-green-500/30' : 'border-red-500/30'
                }`}
              >
                {/* Question header */}
                <div className={`flex items-center justify-between px-4 py-3 border-b ${
                  correct ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    {correct
                      ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                      : <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    }
                    <span className="font-semibold text-foreground">Q{idx + 1}</span>
                    <span className="text-xs text-muted-foreground">{q.topic}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    q.difficulty === 'hard' ? 'bg-red-500/10 text-red-600' :
                    q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-700' :
                    'bg-green-500/10 text-green-600'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <div className="p-4 space-y-4">
                  {/* Question content */}
                  {q.type === 'qc' ? (
                    <div>
                      {q.condition && (
                        <p className="text-sm italic text-muted-foreground mb-3">{q.condition}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Quantity A</p>
                          <p className="text-sm font-medium text-foreground">{q.quantityA}</p>
                        </div>
                        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 text-center">
                          <p className="text-xs text-purple-600 font-semibold mb-1">Quantity B</p>
                          <p className="text-sm font-medium text-foreground">{q.quantityB}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{q.stem}</p>
                  )}

                  {/* Answer comparison */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className={`rounded-lg p-3 ${correct ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">Your Answer</p>
                      <p className={`text-sm font-medium ${correct ? 'text-green-700' : 'text-red-600'}`}>
                        {formatUserAnswer(q, userAns)}
                      </p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <p className="text-xs font-semibold mb-1 text-muted-foreground">Correct Answer</p>
                      <p className="text-sm font-medium text-green-700">
                        {formatCorrectAnswer(q)}
                      </p>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Explanation</p>
                    <p className="text-sm text-foreground leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    );
  }

  return null;
};

export default GREAdaptiveMockTest;
