
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Trophy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { classifyMistake, MistakeClassifierInput } from '@/utils/mistakeClassifier';
import { recordMistake } from '@/services/mistakeService';
import { updateSkillModel } from '@/services/skillEngine';

interface Attempt {
    score: number;
    total_questions: number;
    time_taken_seconds: number;
    answers: Record<string, number[]>;
    test: {
        title: string;
        category: string;
    };
}

interface Question {
    id: string;
    content: string;
    type: string;
    options: string[];
    correct_answer: number[];
    explanation: string;
    order_index: number;
}

const TestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            // Get latest attempt with test details
            const { data: attemptData, error } = await supabase
                .from('user_test_attempts')
                .select('*, test:tests(title, category)')
                .eq('test_id', testId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .single();

            if (attemptData) {
                setAttempt(attemptData as any);
                
                // Get questions for review
                const { data: qData } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('test_id', testId)
                    .order('order_index');

                // Parse options nicely
                const parsedQuestions = (qData || []).map((q: any) => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                    correct_answer: typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer
                }));
                setQuestions(parsedQuestions);
            }
            setLoading(false);
        };

        fetchResults();
    }, [testId]);

    // Analyze mistakes if just finished
    useEffect(() => {
        if (!loading && attempt && questions.length > 0 && location.state?.justFinished && !analyzing) {
            analyzeMistakes();
        }
    }, [loading, attempt, questions, location.state]);

    const analyzeMistakes = async () => {
        if (!attempt) return;
        setAnalyzing(true);
        
        // Clear navigation state to prevent re-running on refresh
        window.history.replaceState({}, document.title);

        const incorrectQuestions = questions.filter(q => {
            const userAns = attempt.answers[q.id] || [];
            const isCorrect = userAns.length === q.correct_answer.length &&
                userAns.every(v => q.correct_answer.includes(v));
            return !isCorrect;
        });

        if (incorrectQuestions.length === 0) {
            setAnalyzing(false);
            return;
        }

        toast({
            title: "Analyzing Performance",
            description: "Identifying mistake patterns...",
        });

        let processedCount = 0;

        // Process in parallel but limited? Grok API is fast but rate limited.
        // We implemented rate limiting in the script, but here we are calling client -> edge -> grok.
        // Let's do them one by one or in small batches to be safe and not overwhelm the client/UI.
        
        for (const q of incorrectQuestions) {
            try {
                const userIndices = attempt.answers[q.id] || [];
                const correctIndices = q.correct_answer;
                
                // Map indices to strings
                // Handle multi-blank options structure if necessary
                // The current component renders options simply, assuming flat array or handled by logic.
                // In TestRunner, options are handled as flat array for single/multi, 
                // but for double/triple blank it chunks them for display.
                // The DB 'options' is likely a flat array of all options?
                // Let's assume flat array for mapping indices.
                
                const getOptionText = (idx: number) => q.options[idx] || '';
                
                const userAnswersText = userIndices.map(getOptionText);
                const correctAnswersText = correctIndices.map(getOptionText);
                
                // Determine Type
                let qType: 'TC' | 'SE' | 'RC' = 'TC';
                if (q.type === 'sentence_equivalence') qType = 'SE';
                else if (attempt.test.category.includes('Reading')) qType = 'RC';
                
                const input: MistakeClassifierInput = {
                    questionType: qType,
                    questionText: q.content,
                    options: q.options,
                    correctAnswer: correctAnswersText,
                    userAnswer: userAnswersText
                };

                const result = await classifyMistake(input);
                
                if (result.label !== 'NONE' && result.label !== 'ELIMINATION_FAILURE') {
                    await recordMistake(result.label, qType);
                    await updateSkillModel(result.label, false);
                }
                
                processedCount++;
            } catch (err) {
                console.error('Error analyzing question:', q.id, err);
            }
        }

        setAnalyzing(false);
        if (processedCount > 0) {
            toast({
                title: "Analysis Complete",
                description: "Your mistake patterns have been updated.",
            });
        }
    };

    if (loading) return <div>Loading results...</div>;
    if (!attempt) return <div>No attempt found</div>;

    const percentage = Math.round((attempt.score / attempt.total_questions) * 100);

    return (
        <div className="min-h-screen container max-w-3xl mx-auto p-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate('/tests')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tests
                </Button>
            </div>

            <Card className="text-center py-10 mb-8 border-primary/20 bg-primary/5">
                <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 p-4 rounded-full">
                        <Trophy className="h-10 w-10 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2">Test Complete!</h1>
                <div className="text-5xl font-black text-primary mb-4">{percentage}%</div>
                <p className="text-muted-foreground">
                    You scored {attempt.score} out of {attempt.total_questions} questions correct
                </p>
                {analyzing && (
                    <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground animate-pulse">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing mistake patterns...
                    </div>
                )}
            </Card>

            <h2 className="text-xl font-bold mb-4">Detailed Review</h2>
            <div className="space-y-6">
                {questions.map((q, idx) => {
                    const userAns = attempt.answers[q.id] || [];
                    const isCorrect = userAns.length === q.correct_answer.length &&
                        userAns.every(v => q.correct_answer.includes(v));

                    return (
                        <Card key={q.id} className={isCorrect ? 'border-green-500/50' : 'border-red-500/50'}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base">Question {idx + 1}</CardTitle>
                                    {isCorrect ? (
                                        <span className="text-green-600 font-bold text-sm">Correct</span>
                                    ) : (
                                        <span className="text-red-500 font-bold text-sm">Incorrect</span>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">{q.content}</p>
                                <div className="space-y-2">
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = userAns.includes(optIdx);
                                        const isRightAnswer = q.correct_answer.includes(optIdx);

                                        let styles = "p-3 rounded border text-sm ";
                                        if (isRightAnswer) styles += "bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:text-green-300";
                                        else if (isSelected && !isCorrect) styles += "bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:text-red-300";
                                        else styles += "border-border opacity-70";

                                        return (
                                            <div key={optIdx} className={styles}>
                                                {opt} {isRightAnswer && "(Correct)"} {isSelected && !isRightAnswer && "(Your Answer)"}
                                            </div>
                                        );
                                    })}
                                </div>
                                {q.explanation && (
                                    <div className="mt-4 bg-muted p-3 rounded text-sm">
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-center">
                <Button size="lg" onClick={() => navigate('/tests')}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Take Another Test
                </Button>
            </div>
        </div>
    );
};

export default TestResults;
