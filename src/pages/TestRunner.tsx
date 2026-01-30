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

    const [test, setTest] = useState<Test | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number[]>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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
            const { data: questionsData, error: qError } = await (supabase as any)
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

            const { error } = await supabase
                .from('user_test_attempts')
                .insert({
                    user_id: user.id,
                    test_id: test.id,
                    score: score,
                    total_questions: questions.length,
                    time_taken_seconds: timeTaken,
                    answers: answers
                });

            if (error) throw error;

            toast({
                title: autoSubmit ? "Time's up!" : "Test Completed",
                description: `You scored ${score} / ${questions.length}`,
            });

            navigate(`/test/${test.id}/results`);

        } catch (error: any) {
            console.error('Submit error:', error);
            toast({
                title: 'Error submitting test',
                description: 'Your progress has been saved locally. Please try again.',
                variant: 'destructive'
            });
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!test) return <div>Test not found</div>;

    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return <div>No questions found</div>;

    const isMultiSelect = currentQ.type === 'multi_choice' || currentQ.correct_answer.length > 1;

    const renderOptions = () => {
        if (currentQ.type === 'double_blank' || currentQ.type === 'triple_blank') {
            const blanksCount = currentQ.type === 'double_blank' ? 2 : 3;
            const optionsPerBlank = currentQ.options.length / blanksCount;
            const groups = [];
            for (let i = 0; i < blanksCount; i++) {
                groups.push(currentQ.options.slice(i * optionsPerBlank, (i + 1) * optionsPerBlank));
            }
            return (
                <div className="space-y-6">
                    {groups.map((groupOptions, groupIdx) => (
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
                    ))}
                </div>
            );
        }

        return (
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
        );
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="border-b border-border bg-card p-4 sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto flex items-center justify-between">
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
            <main className="flex-1 container max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-4">
                {currentQ.content.includes('---') ? (
                    <>
                        {/* Reading Comprehension Layout */}
                        <div className="flex-1 overflow-y-auto max-h-[60vh] md:max-h-full">
                            <Card className="h-full border-none shadow-none md:border md:shadow-sm">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Passage</span>
                                    </div>
                                    <p className="text-lg leading-relaxed whitespace-pre-line text-foreground/90 font-serif">
                                        {currentQ.content.split('---')[0].replace('PASSAGE:', '').trim()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="flex-1">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Question</span>
                                    </div>
                                    <p className="text-xl leading-relaxed mb-8 font-medium whitespace-pre-line">
                                        {currentQ.content.split('---')[1].replace('QUESTION:', '').trim()}
                                    </p>

                                    {currentQ.type === 'sentence_equivalence' && (
                                        <p className="text-sm text-muted-foreground mb-4 italic border-l-2 border-primary/20 pl-3">
                                            Select exactly two answers that produce sentences with equivalent meanings.
                                        </p>
                                    )}

                                    {renderOptions()}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <div className="max-w-3xl mx-auto w-full">
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <p className="text-lg leading-relaxed mb-8 font-medium whitespace-pre-line">
                                    {currentQ.content}
                                </p>

                                {currentQ.type === 'sentence_equivalence' && (
                                    <p className="text-sm text-muted-foreground mb-4 italic border-l-2 border-primary/20 pl-3">
                                        Select exactly two answers that produce sentences with equivalent meanings.
                                    </p>
                                )}

                                {renderOptions()}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-card p-4">
                <div className="container max-w-4xl mx-auto flex justify-between items-center">
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
                        <Button onClick={() => submitTest()} disabled={submitting} className="bg-success hover:bg-success/90">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {submitting ? 'Submitting...' : 'Finish Test'}
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default TestRunner;
