import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ArrowLeft, Clock, ChevronLeft, ChevronRight, CheckCircle,
    XCircle, BookOpen, GraduationCap, Brain, AlertTriangle,
    RotateCcw, Target, TrendingUp, Grid3X3, Play, Bookmark,
    BookmarkCheck, Flag, Calculator, X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    startMockTest, submitSection, completeMockTest, getMockTestReview,
    type ClientQuestion, type SectionInfo, type TestResults, type TestReview,
    type AnswerSubmission,
} from '@/services/adaptiveMockTestService';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase =
    | 'intro'
    | 'verbal_1' | 'verbal_2'
    | 'quant_1'  | 'quant_2'
    | 'break'    | 'loading'
    | 'results'  | 'review';

interface UserAnswers {
    [questionId: string]: string;
}

interface QuestionTimer {
    [questionId: string]: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PHASE_LABELS: Record<string, string> = {
    verbal_1: 'Verbal Section 1',
    verbal_2: 'Verbal Section 2',
    quant_1:  'Quantitative Section 1',
    quant_2:  'Quantitative Section 2',
};

const BREAK_MESSAGES: Partial<Record<Phase, string>> = {
    verbal_2: 'Great work on Verbal Section 1! Take a short break before Verbal Section 2.',
    quant_1:  'Verbal sections complete! Take a short break before the Quantitative sections.',
    quant_2:  'Great work on Quant Section 1! Take a short break before Quant Section 2.',
};

// ── Timer Hook ────────────────────────────────────────────────────────────────

function useTimer(initialSeconds: number, running: boolean, onExpire: () => void) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => { setSeconds(initialSeconds); }, [initialSeconds]);

    useEffect(() => {
        if (!running || seconds <= 0) return;
        intervalRef.current = setInterval(() => {
            setSeconds(prev => {
                if (prev <= 1) { onExpire(); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [running, onExpire]);

    const format = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    return { seconds, formatted: format(seconds) };
}

// ── Calculator ────────────────────────────────────────────────────────────────

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

    const calc = (a: string, b: string, o: string) => {
        const na = parseFloat(a), nb = parseFloat(b);
        switch (o) {
            case '+': return na + nb;
            case '-': return na - nb;
            case '×': return na * nb;
            case '÷': return nb !== 0 ? na / nb : NaN;
            default: return nb;
        }
    };

    const handleOp = (o: string) => {
        if (prev && op && !newNum) {
            const r = calc(prev, display, op);
            setDisplay(String(r));
            setPrev(String(r));
        } else {
            setPrev(display);
        }
        setOp(o);
        setNewNum(true);
    };

    const handleEquals = () => {
        if (prev && op) {
            setDisplay(String(calc(prev, display, op)));
            setPrev(null); setOp(null); setNewNum(true);
        }
    };

    const handleClear = () => { setDisplay('0'); setPrev(null); setOp(null); setNewNum(true); };

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

// ── Question text helpers ─────────────────────────────────────────────────────

/**
 * Renders question text, replacing blank markers with styled underline spans.
 * Handles:
 *   - _____(i)_____, _____(ii)_____, _____(iii)_____  — multi-blank TC labels
 *   - _____                                           — single-blank SE/TC
 */
function renderQuestionText(text: string): React.ReactNode {
    // Match labeled blanks first (longer pattern), then plain blanks
    const parts = text.split(/(_____\(i{1,3}\)_____|_____)/g);
    if (parts.length === 1) return text;

    return (
        <>
            {parts.map((part, idx) => {
                if (/^_____\(i{1,3}\)_____$/.test(part)) {
                    const label = part.includes('(iii)') ? 'Blank (iii)'
                                : part.includes('(ii)')  ? 'Blank (ii)'
                                : 'Blank (i)';
                    return (
                        <span key={idx} className="inline-block border-b-2 border-blue-400 text-blue-300 font-semibold px-4 mx-1 text-sm leading-loose">
                            {label}
                        </span>
                    );
                }
                if (part === '_____') {
                    return (
                        <span key={idx} className="inline-block border-b-2 border-blue-400 min-w-[3rem] mx-1 leading-loose">
                            {' '}
                        </span>
                    );
                }
                return <span key={idx}>{part}</span>;
            })}
        </>
    );
}

interface MultiBlankColumn {
    label: string;
    options: Array<{ key: string; text: string }>;
}

/**
 * Parses multi-blank Text Completion choices.
 * New format: {"blank_i": {"A": "...", "B": "...", "C": "..."},
 *              "blank_ii": {"D": "...", "E": "...", "F": "..."},
 *              "blank_iii": {"G": "...", "H": "...", "I": "..."}}
 * Returns null if choices are flat (not grouped).
 */
function parseMultiBlankChoices(choices: Record<string, unknown>): MultiBlankColumn[] | null {
    if (!('blank_i' in choices)) return null;

    const blankKeys = ['blank_i', 'blank_ii', 'blank_iii'] as const;
    const labels = ['Blank (i)', 'Blank (ii)', 'Blank (iii)'];
    const columns: MultiBlankColumn[] = [];

    for (let i = 0; i < blankKeys.length; i++) {
        const blankData = choices[blankKeys[i]];
        if (!blankData || typeof blankData !== 'object') break;
        const opts = blankData as Record<string, string>;
        columns.push({
            label: labels[i],
            options: Object.keys(opts).sort().map(key => ({ key, text: opts[key] })),
        });
    }

    return columns.length > 0 ? columns : null;
}

// ── Question Renderer ─────────────────────────────────────────────────────────

function QuestionDisplay({
    question,
    answer,
    onAnswer,
}: {
    question: ClientQuestion;
    answer: string;
    onAnswer: (val: string) => void;
}) {
    const choices = question.choices as Record<string, unknown>;
    const qtype = question.question_type;

    const isSE = qtype === 'sentence_equivalence';
    const isMultiSelectMultiple = qtype === 'multiple_choice_multiple';
    const isMultiSelect = isSE || isMultiSelectMultiple;
    const isTC = qtype === 'text_completion';

    const selectedSet = new Set(answer ? answer.split(',').map(s => s.trim()).filter(Boolean) : []);

    // Multi-blank TC detection (new grouped format: choices has "blank_i" key)
    const multiBlankCols = isTC ? parseMultiBlankChoices(choices) : null;
    // Flat choices (for SE, MC, QC, single-blank TC)
    const flatChoices = multiBlankCols ? null : choices as Record<string, string>;

    // ── Multi-blank TC answer helpers ──
    function getBlankSelection(blankIndex: number): string {
        // answer is stored as "B,F" — blank0=B, blank1=F
        const parts = answer ? answer.split(',').map(s => s.trim()) : [];
        return parts[blankIndex] || '';
    }

    function setBlankSelection(blankIndex: number, key: string) {
        const parts = answer ? answer.split(',').map(s => s.trim()) : [];
        const newParts = [...parts];
        // Pad with empty strings if needed
        while (newParts.length <= blankIndex) newParts.push('');
        newParts[blankIndex] = key;
        onAnswer(newParts.filter((p, i) => i <= blankIndex || p).join(','));
    }

    // ── Single / multi-select answer toggle ──
    function toggleChoice(key: string) {
        if (!isMultiSelect) {
            onAnswer(key);
            return;
        }
        const next = new Set(selectedSet);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        onAnswer([...next].sort().join(','));
    }

    return (
        <div className="space-y-5">
            {/* Passage */}
            {question.question_type === 'reading_comprehension' && (
                question.passage ? (
                    <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4 text-slate-300 text-sm leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap">
                        {question.passage}
                    </div>
                ) : (
                    <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-4 text-amber-300 text-sm">
                        <p className="font-semibold mb-1">Reading Passage</p>
                        <p className="text-amber-400/80 italic">Passage text is not available for this question in the current question bank. Please refer to your source material.</p>
                    </div>
                )
            )}

            {/* Question text with styled blanks */}
            <div className="text-white font-medium leading-relaxed text-base">
                {renderQuestionText(question.question_text)}
            </div>

            {/* Instruction hints */}
            {isSE && (
                <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Select exactly TWO answer choices that best complete the sentence.
                </p>
            )}
            {isMultiSelectMultiple && (
                <p className="text-xs text-amber-400 font-medium flex items-center gap-1">
                    <Flag className="w-3 h-3" /> Select ALL answer choices that apply.
                </p>
            )}
            {isTC && multiBlankCols && (
                <p className="text-xs text-blue-400 font-medium">
                    Select one answer for each blank.
                </p>
            )}

            {/* ── Numeric entry ── */}
            {qtype === 'numeric_entry' && (
                <input
                    type="number"
                    className="w-40 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white text-center"
                    value={answer}
                    onChange={e => onAnswer(e.target.value)}
                    placeholder="Enter answer"
                />
            )}

            {/* ── Multi-blank TC: column layout ── */}
            {multiBlankCols && (
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${multiBlankCols.length}, 1fr)` }}>
                    {multiBlankCols.map((col, colIdx) => {
                        const selected = getBlankSelection(colIdx);
                        return (
                            <div key={col.label} className="space-y-2">
                                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide border-b border-slate-700 pb-1">
                                    {col.label}
                                </p>
                                {col.options.map(opt => {
                                    const isSelected = selected === opt.key;
                                    return (
                                        <button
                                            key={opt.key}
                                            onClick={() => setBlankSelection(colIdx, opt.key)}
                                            className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-sm ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-500/20 text-white'
                                                    : 'border-slate-600 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60'
                                            }`}
                                        >
                                            <span className={`font-bold w-5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`}>
                                                {opt.key}.
                                            </span>
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Standard single / multi-select choices ── */}
            {qtype !== 'numeric_entry' && !multiBlankCols && flatChoices && (
                <div className="space-y-2">
                    {Object.keys(flatChoices).sort().map(key => {
                        const selected = selectedSet.has(key);
                        return (
                            <button
                                key={key}
                                onClick={() => toggleChoice(key)}
                                className={`w-full text-left flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                    selected
                                        ? 'border-blue-500 bg-blue-500/20 text-white'
                                        : 'border-slate-600 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60'
                                }`}
                            >
                                <span className={`font-bold text-sm mt-0.5 w-5 shrink-0 ${selected ? 'text-blue-400' : 'text-slate-500'}`}>
                                    {key}.
                                </span>
                                <span className="text-sm leading-relaxed">{flatChoices[key]}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Section Taking UI ─────────────────────────────────────────────────────────

function SectionTaking({
    phase,
    sectionInfo,
    onSubmit,
    adaptiveDifficulty,
}: {
    phase: Phase;
    sectionInfo: SectionInfo;
    onSubmit: (answers: UserAnswers, timers: QuestionTimer) => void;
    adaptiveDifficulty?: 'easy' | 'hard';
}) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<UserAnswers>({});
    const [questionTimers, setQuestionTimers] = useState<QuestionTimer>({});
    const [questionStart, setQuestionStart] = useState<number>(Date.now());
    const [showNav, setShowNav] = useState(false);
    const [flagged, setFlagged] = useState<Set<string>>(new Set());
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showCalc, setShowCalc] = useState(false);

    const isQuantPhase = phase === 'quant_1' || phase === 'quant_2';
    const questions = sectionInfo.questions;
    const currentQ = questions[currentIdx];

    const handleExpire = useCallback(() => {
        recordTimeSpent();
        onSubmit(answers, questionTimers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [answers, questionTimers]);

    const { seconds, formatted } = useTimer(sectionInfo.time_limit_seconds, true, handleExpire);
    const timerPercent = (seconds / sectionInfo.time_limit_seconds) * 100;
    const timerColor = seconds < 120 ? 'text-red-400' : seconds < 300 ? 'text-amber-400' : 'text-green-400';

    function recordTimeSpent() {
        const elapsed = Math.round((Date.now() - questionStart) / 1000);
        setQuestionTimers(prev => ({
            ...prev,
            [currentQ.id]: (prev[currentQ.id] || 0) + elapsed,
        }));
    }

    function navigateQ(dir: 'prev' | 'next') {
        recordTimeSpent();
        setQuestionStart(Date.now());
        setCurrentIdx(prev => dir === 'next' ? Math.min(prev + 1, questions.length - 1) : Math.max(prev - 1, 0));
        setShowNav(false);
        setShowSubmitConfirm(false);
    }

    function jumpTo(idx: number) {
        recordTimeSpent();
        setQuestionStart(Date.now());
        setCurrentIdx(idx);
        setShowNav(false);
        setShowSubmitConfirm(false);
    }

    function toggleFlag() {
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(currentQ.id)) next.delete(currentQ.id);
            else next.add(currentQ.id);
            return next;
        });
    }

    function handleAnswer(val: string) {
        setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
    }

    function handleSubmitRequest() {
        recordTimeSpent();
        const finalTimers = {
            ...questionTimers,
            [currentQ.id]: (questionTimers[currentQ.id] || 0) + Math.round((Date.now() - questionStart) / 1000),
        };
        setQuestionTimers(finalTimers);
        setShowSubmitConfirm(true);
    }

    function handleConfirmSubmit() {
        onSubmit(answers, questionTimers);
    }

    const answered = Object.keys(answers).filter(k => answers[k]).length;
    const unanswered = questions.length - answered;
    const flaggedCount = flagged.size;
    const isFlagged = flagged.has(currentQ.id);

    // Nav grid cell color
    function navCellClass(q: ClientQuestion, i: number): string {
        const isCurrent = i === currentIdx;
        const isAnswered = !!answers[q.id];
        const isF = flagged.has(q.id);
        if (isCurrent) return 'bg-blue-600 text-white ring-2 ring-blue-400';
        if (isF && isAnswered) return 'bg-amber-600 text-white';
        if (isF) return 'bg-amber-700/60 text-amber-200 border border-amber-600';
        if (isAnswered) return 'bg-green-700 text-white';
        return 'bg-slate-700 text-slate-300 hover:bg-slate-600';
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Header */}
            <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-semibold text-white">{PHASE_LABELS[phase]}</h2>
                        {adaptiveDifficulty && (
                            <Badge className={adaptiveDifficulty === 'hard'
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : 'bg-green-500/20 text-green-300 border-green-500/30'}>
                                {adaptiveDifficulty === 'hard' ? 'Hard Module' : 'Standard Module'}
                            </Badge>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Q {currentIdx + 1}/{questions.length} · {answered} answered
                        {flaggedCount > 0 && <span className="text-amber-400 ml-2">· {flaggedCount} flagged</span>}
                    </p>
                </div>

                {/* Timer */}
                <div className={`flex items-center gap-1.5 ${timerColor} font-mono text-lg font-bold shrink-0`}>
                    <Clock className="w-4 h-4" />
                    {formatted}
                </div>

                {/* Nav grid toggle */}
                {isQuantPhase && (
                    <Button
                        variant={showCalc ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setShowCalc(v => !v)}
                        className="border-slate-700 shrink-0"
                        title="Calculator"
                    >
                        <Calculator className="w-4 h-4" />
                    </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowNav(!showNav)} className="border-slate-700 shrink-0">
                    <Grid3X3 className="w-4 h-4" />
                </Button>
            </div>

            {/* Timer bar */}
            <div className="h-1 bg-slate-800">
                <div
                    className={`h-full transition-all duration-1000 ${timerPercent < 25 ? 'bg-red-500' : timerPercent < 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    style={{ width: `${timerPercent}%` }}
                />
            </div>

            {/* Navigation grid */}
            {showNav && (
                <div className="border-b border-slate-800 bg-slate-900 px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-slate-300">Question Navigator</p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Current</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-700 inline-block" /> Answered</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-600 inline-block" /> Flagged</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-700 inline-block" /> Unanswered</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {questions.map((q, i) => (
                            <button
                                key={q.id}
                                onClick={() => jumpTo(i)}
                                className={`w-8 h-8 rounded text-xs font-medium transition-all ${navCellClass(q, i)}`}
                                title={flagged.has(q.id) ? 'Flagged for review' : undefined}
                            >
                                {flagged.has(q.id) ? '🔖' : i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Submit confirmation overlay */}
            {showSubmitConfirm && (
                <div className="border-b border-amber-800/50 bg-amber-900/20 px-4 py-4">
                    <div className="max-w-3xl mx-auto">
                        <p className="font-medium text-amber-300 mb-2">Ready to submit this section?</p>
                        <div className="text-sm text-slate-300 space-y-1 mb-4">
                            <p>· <span className="text-green-400 font-medium">{answered}</span> answered</p>
                            {unanswered > 0 && (
                                <p>· <span className="text-slate-400 font-medium">{unanswered}</span> unanswered (will be marked incorrect)</p>
                            )}
                            {flaggedCount > 0 && (
                                <p>· <span className="text-amber-400 font-medium">{flaggedCount}</span> flagged for review — navigate to them before submitting</p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={handleConfirmSubmit}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Confirm Submit
                            </Button>
                            <Button
                                variant="outline"
                                className="border-slate-600"
                                onClick={() => setShowSubmitConfirm(false)}
                            >
                                Go Back & Review
                            </Button>
                            {flaggedCount > 0 && (
                                <Button
                                    variant="outline"
                                    className="border-amber-700 text-amber-400 hover:bg-amber-900/30"
                                    onClick={() => {
                                        const firstFlagged = questions.findIndex(q => flagged.has(q.id));
                                        if (firstFlagged !== -1) jumpTo(firstFlagged);
                                        setShowSubmitConfirm(false);
                                    }}
                                >
                                    <Bookmark className="w-4 h-4 mr-2" /> Jump to Flagged
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto">
                    {/* Question meta + flag button */}
                    <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400 capitalize">
                                {currentQ.question_type.replace(/_/g, ' ')}
                            </Badge>
                        </div>

                        {/* Mark for Review button */}
                        <button
                            onClick={toggleFlag}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${
                                isFlagged
                                    ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                                    : 'border-slate-600 text-slate-400 hover:border-amber-600 hover:text-amber-400'
                            }`}
                        >
                            {isFlagged
                                ? <><BookmarkCheck className="w-3.5 h-3.5" /> Marked for Review</>
                                : <><Bookmark className="w-3.5 h-3.5" /> Mark for Review</>
                            }
                        </button>
                    </div>

                    <QuestionDisplay
                        question={currentQ}
                        answer={answers[currentQ.id] || ''}
                        onAnswer={handleAnswer}
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3 flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => navigateQ('prev')}
                    disabled={currentIdx === 0}
                    className="border-slate-700"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>

                <span className="text-sm text-slate-400">{currentIdx + 1} / {questions.length}</span>

                {currentIdx < questions.length - 1 ? (
                    <Button onClick={() => navigateQ('next')} className="bg-blue-600 hover:bg-blue-700">
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmitRequest}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={showSubmitConfirm}
                    >
                        Submit Section <CheckCircle className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            {/* Calculator widget (quant only) */}
            {isQuantPhase && showCalc && (
                <CalculatorWidget onClose={() => setShowCalc(false)} />
            )}
        </div>
    );
}

// ── Break Screen ──────────────────────────────────────────────────────────────

function BreakScreen({ nextPhase, onContinue, message }: { nextPhase: Phase; onContinue: () => void; message: string }) {
    const [countdown, setCountdown] = useState(60);
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setInterval(() => setCountdown(p => p - 1), 1000);
        return () => clearInterval(t);
    }, [countdown]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-slate-700 max-w-md w-full text-center">
                <CardHeader>
                    <CardTitle className="text-white text-2xl">Section Complete!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-slate-300">{message}</p>
                    <div className="text-6xl font-mono font-bold text-blue-400">
                        {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-slate-400">Next: {PHASE_LABELS[nextPhase]}</p>
                        <Button onClick={onContinue} className="w-full bg-blue-600 hover:bg-blue-700">
                            Continue Now <Play className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// ── Results Screen ────────────────────────────────────────────────────────────

function ResultsScreen({ results, onReview, onNewTest }: {
    results: TestResults; onReview: () => void; onNewTest: () => void;
}) {
    const total = results.total_score;
    const percentile = total >= 330 ? 99 : total >= 320 ? 96 : total >= 310 ? 88 : total >= 300 ? 73 : total >= 290 ? 58 : total >= 280 ? 42 : 28;

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center space-y-2 py-6">
                    <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                        <GraduationCap className="w-5 h-5" />
                        <span>GRE Mock Test Complete</span>
                    </div>
                    <div className="text-7xl font-black text-white">{total}</div>
                    <div className="text-slate-400 text-lg">Combined Score (out of 340)</div>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-sm px-4 py-1">
                        ~{percentile}th Percentile
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Verbal Reasoning', icon: BookOpen, score: results.verbal.scaled_score, s1: results.verbal.section_1_raw, s2: results.verbal.section_2_raw, diff: results.verbal.section_2_difficulty },
                        { label: 'Quantitative Reasoning', icon: Brain, score: results.quant.scaled_score, s1: results.quant.section_1_raw, s2: results.quant.section_2_raw, diff: results.quant.section_2_difficulty },
                    ].map(({ label, icon: Icon, score, s1, s2, diff }) => (
                        <Card key={label} className="bg-slate-900 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
                                    <Icon className="w-4 h-4" /> {label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="text-4xl font-bold text-white">{score}</div>
                                <div className="text-xs text-slate-500">out of 170</div>
                                <Progress value={((score - 130) / 40) * 100} className="h-1.5" />
                                <div className="space-y-1 text-xs text-slate-400">
                                    <div>Section 1: {s1}</div>
                                    <div className="flex items-center gap-1">
                                        Section 2 ({diff === 'hard'
                                            ? <span className="text-red-400">Hard</span>
                                            : <span className="text-green-400">Standard</span>
                                        }): {s2}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Button onClick={onReview} variant="outline" className="border-slate-700 hover:border-blue-500">
                        <BookOpen className="w-4 h-4 mr-2" /> Review Answers
                    </Button>
                    <Button onClick={onNewTest} className="bg-blue-600 hover:bg-blue-700">
                        <RotateCcw className="w-4 h-4 mr-2" /> New Test
                    </Button>
                </div>
                <p className="text-center text-xs text-slate-500">
                    Completed {new Date(results.completed_at).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

// ── Review Screen ─────────────────────────────────────────────────────────────

function ReviewScreen({ review, onBack }: { review: TestReview; onBack: () => void }) {
    const [expandedSection, setExpandedSection] = useState<string | null>(review.sections[0]?.section_id || null);
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="outline" size="sm" onClick={onBack} className="border-slate-700">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
                    </Button>
                    <h1 className="text-xl font-bold text-white">Test Review</h1>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                    <Card className="bg-slate-900 border-slate-700 text-center p-3">
                        <div className="text-2xl font-bold text-white">{review.verbal_scaled_score}</div>
                        <div className="text-xs text-slate-400">Verbal</div>
                    </Card>
                    <Card className="bg-slate-900 border-slate-700 text-center p-3">
                        <div className="text-3xl font-bold text-blue-400">{review.total_score}</div>
                        <div className="text-xs text-slate-400">Total</div>
                    </Card>
                    <Card className="bg-slate-900 border-slate-700 text-center p-3">
                        <div className="text-2xl font-bold text-white">{review.quant_scaled_score}</div>
                        <div className="text-xs text-slate-400">Quant</div>
                    </Card>
                </div>

                {review.sections.map(section => (
                    <Card key={section.section_id} className="bg-slate-900 border-slate-700">
                        <button
                            className="w-full text-left p-4 flex items-center justify-between"
                            onClick={() => setExpandedSection(expandedSection === section.section_id ? null : section.section_id)}
                        >
                            <div>
                                <p className="font-medium text-white capitalize">
                                    {section.section_type} Section {section.section_number}
                                    {section.section_number === 2 && (
                                        <Badge className={`ml-2 text-xs ${section.difficulty_level === 'hard' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                            {section.difficulty_level}
                                        </Badge>
                                    )}
                                </p>
                                <p className="text-sm text-slate-400">{section.raw_score}/{section.total_questions} correct</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-white">
                                    {Math.round((section.raw_score / section.total_questions) * 100)}%
                                </span>
                                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedSection === section.section_id ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        {expandedSection === section.section_id && (
                            <div className="border-t border-slate-800">
                                {Object.keys(section.topic_accuracy).length > 0 && (
                                    <div className="p-4 border-b border-slate-800">
                                        <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" /> Topic Accuracy
                                        </p>
                                        <div className="space-y-1">
                                            {Object.entries(section.topic_accuracy).map(([topic, acc]) => (
                                                <div key={topic} className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-400 w-32 truncate">{topic}</span>
                                                    <Progress value={(acc.correct / acc.total) * 100} className="h-1.5 flex-1" />
                                                    <span className="text-slate-300 w-12 text-right">{acc.correct}/{acc.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="divide-y divide-slate-800">
                                    {section.questions.map(q => (
                                        <div key={q.id} className="p-4">
                                            <button
                                                className="w-full text-left flex items-start gap-3"
                                                onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                                            >
                                                <div className={`mt-0.5 shrink-0 ${q.is_correct ? 'text-green-400' : 'text-red-400'}`}>
                                                    {q.is_correct ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                                                        Q{q.question_order}. {q.question_text}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs border-slate-700 text-slate-500 capitalize">
                                                            {q.question_type.replace(/_/g, ' ')}
                                                        </Badge>
                                                        {q.topic && (
                                                            <Badge variant="outline" className="text-xs border-slate-700 text-slate-500">
                                                                {q.topic}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 text-slate-500 shrink-0 mt-0.5 transition-transform ${expandedQuestion === q.id ? 'rotate-90' : ''}`} />
                                            </button>

                                            {expandedQuestion === q.id && (
                                                <div className="mt-3 ml-7 space-y-3">
                                                    {q.passage && (
                                                        <div className="text-xs text-slate-400 bg-slate-800 rounded p-3 max-h-32 overflow-y-auto">
                                                            {q.passage}
                                                        </div>
                                                    )}
                                                    <p className="text-sm text-white">{renderQuestionText(q.question_text)}</p>
                                                    <div className="space-y-1">
                                                        {(() => {
                                                            const choicesRaw = q.choices as Record<string, unknown>;
                                                            const isMultiBlank = 'blank_i' in choicesRaw;
                                                            const correctParts = q.correct_answer.split(',').map(s => s.trim());
                                                            const userParts = (q.user_answer || '').split(',').map(s => s.trim());

                                                            if (isMultiBlank) {
                                                                // Flatten all blank options for display
                                                                const allOpts: Array<{ key: string; text: string; blankLabel: string }> = [];
                                                                const blankKeys = ['blank_i', 'blank_ii', 'blank_iii'] as const;
                                                                const blankLabels = ['Blank (i)', 'Blank (ii)', 'Blank (iii)'];
                                                                blankKeys.forEach((bk, bi) => {
                                                                    if (choicesRaw[bk] && typeof choicesRaw[bk] === 'object') {
                                                                        Object.entries(choicesRaw[bk] as Record<string, string>).forEach(([k, v]) => {
                                                                            allOpts.push({ key: k, text: v, blankLabel: blankLabels[bi] });
                                                                        });
                                                                    }
                                                                });
                                                                return allOpts.map(({ key, text, blankLabel }) => {
                                                                    const isCorrect = correctParts.includes(key);
                                                                    const isUser = userParts.includes(key);
                                                                    let bg = 'bg-slate-800 border-slate-700';
                                                                    if (isCorrect) bg = 'bg-green-900/40 border-green-700';
                                                                    else if (isUser && !isCorrect) bg = 'bg-red-900/40 border-red-700';
                                                                    return (
                                                                        <div key={key} className={`flex gap-2 p-2 rounded border text-xs ${bg}`}>
                                                                            <span className="font-bold text-slate-400 shrink-0 w-16">{blankLabel} {key}.</span>
                                                                            <span className="text-slate-300">{text}</span>
                                                                            {isCorrect && <CheckCircle className="w-3 h-3 text-green-400 ml-auto shrink-0 mt-0.5" />}
                                                                            {isUser && !isCorrect && <XCircle className="w-3 h-3 text-red-400 ml-auto shrink-0 mt-0.5" />}
                                                                        </div>
                                                                    );
                                                                });
                                                            }

                                                            // Flat choices
                                                            return Object.entries(choicesRaw as Record<string, string>).map(([key, val]) => {
                                                                const isCorrect = correctParts.includes(key);
                                                                const isUser = userParts.includes(key);
                                                                let bg = 'bg-slate-800 border-slate-700';
                                                                if (isCorrect) bg = 'bg-green-900/40 border-green-700';
                                                                else if (isUser && !isCorrect) bg = 'bg-red-900/40 border-red-700';
                                                                return (
                                                                    <div key={key} className={`flex gap-2 p-2 rounded border text-xs ${bg}`}>
                                                                        <span className="font-bold text-slate-400 shrink-0">{key}.</span>
                                                                        <span className="text-slate-300">{val}</span>
                                                                        {isCorrect && <CheckCircle className="w-3 h-3 text-green-400 ml-auto shrink-0 mt-0.5" />}
                                                                        {isUser && !isCorrect && <XCircle className="w-3 h-3 text-red-400 ml-auto shrink-0 mt-0.5" />}
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                    <div className="text-xs text-slate-400 flex gap-2">
                                                        <span>Your answer: <span className={q.is_correct ? 'text-green-400' : 'text-red-400'}>{q.user_answer || 'Not answered'}</span></span>
                                                        <span>·</span>
                                                        <span>Correct: <span className="text-green-400">{q.correct_answer}</span></span>
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="bg-blue-900/20 border border-blue-800/40 rounded p-3 text-xs text-slate-300 leading-relaxed">
                                                            <span className="font-medium text-blue-400">Explanation: </span>
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ── Intro Screen ──────────────────────────────────────────────────────────────

function IntroScreen({ onStart, loading }: { onStart: () => void; loading: boolean }) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Card className="bg-slate-900 border-slate-700 max-w-lg w-full">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8 text-blue-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">GRE Adaptive Mock Test</CardTitle>
                    <p className="text-slate-400 text-sm mt-2">Full-length adaptive test · Real GRE format</p>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-300">Test Structure</p>
                        {[
                            { label: 'Verbal Section 1', detail: '12 questions · 18 min', icon: BookOpen },
                            { label: 'Verbal Section 2 (Adaptive)', detail: '15 questions · 23 min', icon: BookOpen },
                            { label: 'Quant Section 1', detail: '12 questions · 21 min', icon: Brain },
                            { label: 'Quant Section 2 (Adaptive)', detail: '15 questions · 26 min', icon: Brain },
                        ].map(({ label, detail, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                                <Icon className="w-4 h-4 text-blue-400 shrink-0" />
                                <div>
                                    <p className="text-sm text-white">{label}</p>
                                    <p className="text-xs text-slate-400">{detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-200/80 leading-relaxed">
                                <strong>Adaptive Engine:</strong> Section 2 difficulty adjusts based on Section 1 performance.
                                Score ≥60% → Hard module (higher ceiling). Score &lt;60% → Standard module.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 space-y-1">
                        <p className="text-slate-300 font-medium flex items-center gap-1.5"><Bookmark className="w-3.5 h-3.5 text-amber-400" /> Mark for Review</p>
                        <p>Flag any question during the section and return to it before submitting. Flagged questions are highlighted in the navigator.</p>
                    </div>

                    <Button
                        onClick={onStart}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                    >
                        {loading ? 'Loading questions...' : <><Play className="w-4 h-4 mr-2" /> Start Test</>}
                    </Button>
                    <p className="text-center text-xs text-slate-500">Total time: ~88 minutes · Scores saved to your profile</p>
                </CardContent>
            </Card>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AdaptiveMockTestRunner() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [phase, setPhase] = useState<Phase>('intro');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [mockTestId, setMockTestId] = useState<string | null>(null);
    const [verbal1, setVerbal1] = useState<SectionInfo | null>(null);
    const [verbal2, setVerbal2] = useState<(SectionInfo & { difficulty: 'easy' | 'hard' }) | null>(null);
    const [quant1, setQuant1] = useState<SectionInfo | null>(null);
    const [quant2, setQuant2] = useState<(SectionInfo & { difficulty: 'easy' | 'hard' }) | null>(null);
    const [results, setResults] = useState<TestResults | null>(null);
    const [review, setReview] = useState<TestReview | null>(null);
    const [nextPhaseAfterBreak, setNextPhaseAfterBreak] = useState<Phase>('verbal_2');

    useEffect(() => {
        if (['intro', 'results', 'review'].includes(phase)) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [phase]);

    async function handleStart() {
        if (!user) { setError('You must be logged in to take the test.'); return; }
        setLoading(true);
        setError(null);
        try {
            const resp = await startMockTest(user.id);
            setMockTestId(resp.mock_test_id);
            setVerbal1(resp.sections.verbal_1);
            setQuant1(resp.sections.quant_1);
            setPhase('verbal_1');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmitSection(
        sectionInfo: SectionInfo,
        currentPhase: Phase,
        answers: UserAnswers,
        timers: QuestionTimer
    ) {
        if (!mockTestId) return;
        setPhase('loading');
        try {
            const submissions: AnswerSubmission[] = sectionInfo.questions.map(q => ({
                question_id: q.id,
                user_answer: answers[q.id] || '',
                time_spent_seconds: timers[q.id] || 0,
            }));
            const resp = await submitSection(mockTestId, sectionInfo.section_id, submissions);

            if (currentPhase === 'verbal_1') {
                if (resp.next_section) setVerbal2(resp.next_section);
                setNextPhaseAfterBreak('verbal_2');
                setPhase('break');
            } else if (currentPhase === 'verbal_2') {
                setNextPhaseAfterBreak('quant_1');
                setPhase('break');
            } else if (currentPhase === 'quant_1') {
                if (resp.next_section) setQuant2(resp.next_section);
                setNextPhaseAfterBreak('quant_2');
                setPhase('break');
            } else if (currentPhase === 'quant_2') {
                const finalResults = await completeMockTest(mockTestId);
                setResults(finalResults);
                setPhase('results');
            }
        } catch (err) {
            setError((err as Error).message);
            setPhase(currentPhase);
        }
    }

    async function handleLoadReview() {
        if (!mockTestId) return;
        setPhase('loading');
        try {
            setReview(await getMockTestReview(mockTestId));
            setPhase('review');
        } catch (err) {
            setError((err as Error).message);
            setPhase('results');
        }
    }

    function handleNewTest() {
        setPhase('intro');
        setMockTestId(null); setVerbal1(null); setVerbal2(null);
        setQuant1(null); setQuant2(null); setResults(null); setReview(null); setError(null);
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Card className="bg-slate-900 border-red-800 max-w-md w-full">
                    <CardContent className="p-6 text-center space-y-4">
                        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
                        <p className="text-white font-medium">Something went wrong</p>
                        <p className="text-red-300 text-sm">{error}</p>
                        <Button onClick={() => { setError(null); setPhase('intro'); }} className="w-full">Back to Start</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-slate-400">Processing...</p>
                </div>
            </div>
        );
    }

    if (phase === 'intro') return <IntroScreen onStart={handleStart} loading={loading} />;

    if (phase === 'verbal_1' && verbal1)
        return <SectionTaking phase="verbal_1" sectionInfo={verbal1} onSubmit={(a, t) => handleSubmitSection(verbal1, 'verbal_1', a, t)} />;

    if (phase === 'break')
        return <BreakScreen nextPhase={nextPhaseAfterBreak} message={BREAK_MESSAGES[nextPhaseAfterBreak] || ''} onContinue={() => setPhase(nextPhaseAfterBreak)} />;

    if (phase === 'verbal_2' && verbal2)
        return <SectionTaking phase="verbal_2" sectionInfo={verbal2} adaptiveDifficulty={verbal2.difficulty} onSubmit={(a, t) => handleSubmitSection(verbal2, 'verbal_2', a, t)} />;

    if (phase === 'quant_1' && quant1)
        return <SectionTaking phase="quant_1" sectionInfo={quant1} onSubmit={(a, t) => handleSubmitSection(quant1, 'quant_1', a, t)} />;

    if (phase === 'quant_2' && quant2)
        return <SectionTaking phase="quant_2" sectionInfo={quant2} adaptiveDifficulty={quant2.difficulty} onSubmit={(a, t) => handleSubmitSection(quant2, 'quant_2', a, t)} />;

    if (phase === 'results' && results)
        return <ResultsScreen results={results} onReview={handleLoadReview} onNewTest={handleNewTest} />;

    if (phase === 'review' && review)
        return <ReviewScreen review={review} onBack={() => setPhase('results')} />;

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Button onClick={() => navigate('/')} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Home</Button>
        </div>
    );
}
