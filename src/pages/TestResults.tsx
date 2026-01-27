import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';

interface Attempt {
    score: number;
    total_questions: number;
    time_taken_seconds: number;
    answers: Record<string, number[]>;
}

interface Question {
    id: string;
    content: string;
    options: string[];
    correct_answer: number[];
    explanation: string;
    order_index: number;
}

const TestResults = () => {
    const { testId } = useParams();
    const navigate = useNavigate();
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            // Get latest attempt
            const { data: attemptData } = await supabase
                .from('user_test_attempts')
                .select('*')
                .eq('test_id', testId)
                .order('completed_at', { ascending: false })
                .limit(1)
                .single();

            if (attemptData) {
                setAttempt(attemptData);
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

    if (loading) return <div>Loading results...</div>;
    if (!attempt) return <div>No attempt found</div>;

    const percentage = Math.round((attempt.score / attempt.total_questions) * 100);

    return (
        <div className="min-h-screen bg-background container max-w-3xl mx-auto p-4 py-8">
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
