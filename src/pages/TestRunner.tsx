import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface Question {
    id: string;
    content: string;
    type: string;
    options: string[];
    correct_answer: number[];
}

interface Test {
    id: string;
    title: string;
    time_limit_minutes: number;
}

const TestRunner = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const { getCachedTests, getCachedQuestions } = useOfflineStorage();

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number[]>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        if (!testId) return;
        fetchTestDetails();
    }, [testId]);

    useEffect(() => {
        if (timeLeft > 0 && !submitting) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        submitTest(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, submitting]);

    const fetchTestDetails = async () => {
        const currentlyOnline = navigator.onLine;

        // Try offline cache first if not online
        if (!currentlyOnline) {
            try {
                const cachedTests = await getCachedTests();
                const cachedQuestions = await getCachedQuestions(testId);

                const testData = cachedTests.find((t: any) => t.id === testId);
                if (testData && cachedQuestions.length > 0) {
                    setTest(testData as Test);
                    setTimeLeft(testData.time_limit_minutes * 60);
                    setIsOfflineMode(true);

                    // Parse options
                    const parsedQuestions = cachedQuestions.map((q: any) => ({
                        ...q,
                        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                        correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer
                    })).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

                    setQuestions(parsedQuestions);
                    setLoading(false);

                    toast({
                        title: 'Offline Mode',
                        description: 'Test loaded from cache. Results will sync when online.',
                    });
                    return;
                }
            } catch (e) {
                console.error('Cache read error:', e);
            }

            toast({
                title: 'You are offline',
                description: 'Cannot load test. Please connect to internet.',
                variant: 'destructive',
            });
            navigate('/tests');
            return;
        }

        try {
            // Fetch test info
            const { data: testData, error: testError } = await supabase
                .from('tests')
                .select('*')
                .eq('id', testId)
                .single();

            if (testError) throw testError;
            setTest(testData);
            setTimeLeft(testData.time_limit_minutes * 60);

            // Fetch questions
            const { data: questionsData, error: qError } = await supabase
                .from('questions')
                .select('*')
                .eq('test_id', testId)
                .order('order_index');

            if (qError) throw qError;

            // Parse options nicely
            const parsedQuestions = (questionsData || []).map((q: any) => ({
                ...q,
                options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer
            }));

            setQuestions(parsedQuestions);
        } catch (error: any) {
            // Try cache on error
            try {
                const cachedTests = await getCachedTests();
                const cachedQuestions = await getCachedQuestions(testId);

                const testData = cachedTests.find((t: any) => t.id === testId);
                if (testData && cachedQuestions.length > 0) {
                    setTest(testData as Test);
                    setTimeLeft(testData.time_limit_minutes * 60);
                    setIsOfflineMode(true);

                    const parsedQuestions = cachedQuestions.map((q: any) => ({
                        ...q,
                        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                        correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer
                    })).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

                    setQuestions(parsedQuestions);

                    toast({
                        title: 'Using cached data',
                        description: 'Could not connect to server.',
                    });
                    setLoading(false);
                    return;
                }
            } catch (e) {
                console.error('Cache fallback error:', e);
            }

            toast({
                title: 'Error loading test',
                description: error.message,
                variant: 'destructive',
            });
            navigate('/tests');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, optionIndex: number, isMulti: boolean) => {
        setAnswers(prev => {
            const current = prev[questionId] || [];
            if (isMulti) {
                if (current.includes(optionIndex)) {
                    return { ...prev, [questionId]: current.filter(i => i !== optionIndex) };
                } else {
                    return { ...prev, [questionId]: [...current, optionIndex].sort() };
                }
            } else {
                return { ...prev, [questionId]: [optionIndex] };
            }
        });
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateScore = () => {
        let correctCount = 0;
        questions.forEach(q => {
            const userAns = answers[q.id] || [];
            const correctAns = q.correct_answer || [];

            // Exact match required
            if (userAns.length === correctAns.length &&
                userAns.every(val => correctAns.includes(val))) {
                correctCount++;
            }
        });
        return correctCount;
    };

    const submitTest = async (autoSubmit = false) => {
        if (submitting) return;
        setSubmitting(true);

        try {
            if (!user || !test) return;

            const score = calculateScore();
            const timeTaken = (test.time_limit_minutes * 60) - timeLeft;

            const attemptData = {
                user_id: user.id,
                test_id: test.id,
                score: score,
                total_questions: questions.length,
                time_taken_seconds: timeTaken,
                answers: answers
            };

            // Store result in sessionStorage for results page
            sessionStorage.setItem(`test-result-${test.id}`, JSON.stringify({
                ...attemptData,
                questions: questions,
                isOffline: !navigator.onLine
            }));

            if (navigator.onLine) {
                const { error } = await supabase
                    .from('user_test_attempts')
                    .insert(attemptData);

                if (error) throw error;
            } else {
                // Queue for later sync
                const pendingTests = JSON.parse(localStorage.getItem('pending-test-attempts') || '[]');
                pendingTests.push({ ...attemptData, timestamp: Date.now() });
                localStorage.setItem('pending-test-attempts', JSON.stringify(pendingTests));
            }

            toast({
                title: autoSubmit ? "Time's up!" : "Test Completed",
                description: navigator.onLine
                    ? `You scored ${score} / ${questions.length}`
                    : `You scored ${score} / ${questions.length}. Will sync when online.`,
            });

            navigate(`/test/${test.id}/results`);

        } catch (error: any) {
            console.error('Submit error:', error);
            // Still allow viewing results even on error
            if (test) {
                const score = calculateScore();
                sessionStorage.setItem(`test-result-${test.id}`, JSON.stringify({
                    user_id: user?.id,
                    test_id: test.id,
                    score: score,
                    total_questions: questions.length,
                    time_taken_seconds: (test.time_limit_minutes * 60) - timeLeft,
                    answers: answers,
                    questions: questions,
                    isOffline: true
                }));

                // Queue for later sync
                const pendingTests = JSON.parse(localStorage.getItem('pending-test-attempts') || '[]');
                pendingTests.push({
                    user_id: user?.id,
                    test_id: test.id,
                    score: score,
                    total_questions: questions.length,
                    time_taken_seconds: (test.time_limit_minutes * 60) - timeLeft,
                    answers: answers,
                    timestamp: Date.now()
                });
                localStorage.setItem('pending-test-attempts', JSON.stringify(pendingTests));

                toast({
                    title: 'Test saved locally',
                    description: 'Results will sync when back online.',
                });
                navigate(`/test/${test.id}/results`);
            } else {
                toast({
                    title: 'Error submitting test',
                    description: 'Please try again.',
                    variant: 'destructive'
                });
                setSubmitting(false);
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!test) return <div>Test not found</div>;

    const currentQ = questions[currentQuestionIndex];
    const isMultiSelect = currentQ.type === 'multi_choice' || currentQ.correct_answer.length > 1;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card p-4 sticky top-0 z-10">
                <div className="container max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/tests')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-semibold">{test.title}</h1>
                            <div className="text-xs text-muted-foreground">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </div>
                        </div>
                    </div>
                    <div className={`font-mono text-lg font-bold flex items-center gap-2 ${timeLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
                        <Clock className="h-5 w-5" />
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-1 mt-4" />
            </header>

            {/* Content */}
            <main className="flex-1 container max-w-3xl mx-auto p-4 flex flex-col justify-center">
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <p className="text-lg leading-relaxed mb-8 font-medium whitespace-pre-line">
                            {currentQ.content}
                        </p>

                        {/* Multi-select hint for sentence equivalence */}
                        {currentQ.type === 'sentence_equivalence' && (
                            <p className="text-sm text-muted-foreground mb-4 italic">
                                Select exactly two answers that produce sentences with equivalent meanings.
                            </p>
                        )}

                        {/* Grouped options for double/triple blank */}
                        {(currentQ.type === 'double_blank' || currentQ.type === 'triple_blank') ? (
                            <div className="space-y-6">
                                {(() => {
                                    const blanksCount = currentQ.type === 'double_blank' ? 2 : 3;
                                    const optionsPerBlank = currentQ.options.length / blanksCount;
                                    const groups = [];
                                    for (let i = 0; i < blanksCount; i++) {
                                        groups.push(currentQ.options.slice(i * optionsPerBlank, (i + 1) * optionsPerBlank));
                                    }
                                    return groups.map((groupOptions, groupIdx) => (
                                        <div key={groupIdx} className="border rounded-lg p-4 bg-muted/30">
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                                                Blank ({['i', 'ii', 'iii'][groupIdx]})
                                            </h4>
                                            <div className="space-y-2">
                                                {groupOptions.map((option, optIdx) => {
                                                    const actualIdx = groupIdx * optionsPerBlank + optIdx;
                                                    const isSelected = (answers[currentQ.id] || []).includes(actualIdx);
                                                    return (
                                                        <div
                                                            key={actualIdx}
                                                            className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                                    ? 'border-primary bg-primary/10'
                                                                    : 'border-border bg-background hover:bg-muted'
                                                                }`}
                                                            onClick={() => handleAnswer(currentQ.id, actualIdx, true)}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                                                                }`}>
                                                                {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                                            </div>
                                                            <span className="flex-1 text-sm">{option}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = (answers[currentQ.id] || []).includes(idx);
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:bg-muted'
                                                }`}
                                            onClick={() => handleAnswer(currentQ.id, idx, isMultiSelect)}
                                        >
                                            <div className={`w-5 h-5 rounded-full border mr-3 flex items-center justify-center ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                                                }`}>
                                                {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                                            </div>
                                            <span className="flex-1">{option}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card p-4">
                <div className="container max-w-3xl mx-auto flex justify-between items-center">
                    <Button
                        variant="outline"
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    >
                        Previous
                    </Button>

                    {currentQuestionIndex < questions.length - 1 ? (
                        <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                            Next Question
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button onClick={() => submitTest()} disabled={submitting}>
                            <CheckCircle2 className="ml-2 h-4 w-4" />
                            {submitting ? 'Submitting...' : 'Finish Test'}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default TestRunner;
