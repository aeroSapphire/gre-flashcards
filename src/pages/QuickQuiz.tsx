import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz, QuizQuestion } from '@/services/sentenceEvaluator';
import { motion, AnimatePresence } from 'framer-motion';

const QuickQuiz = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);

    const listName = location.state?.listName || 'Vocab Quiz';
    const words = location.state?.words || [];

    useEffect(() => {
        if (words.length === 0) {
            navigate('/');
            return;
        }
        startQuiz();
    }, []);

    const startQuiz = async () => {
        setLoading(true);
        try {
            const generated = await generateQuiz(words);
            if (generated.length === 0) throw new Error('Failed to generate questions');
            setQuestions(generated);
        } catch (error: any) {
            toast({
                title: 'Quiz Error',
                description: 'The AI failed to generate your quiz. Please try again.',
                variant: 'destructive',
            });
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (optionIdx: number) => {
        if (showExplanation) return;
        setAnswers(prev => ({ ...prev, [currentIndex]: optionIdx }));
        setShowExplanation(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowExplanation(false);
        } else {
            setIsFinished(true);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correct_answer[0]) correct++;
        });
        return correct;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-6"
                >
                    <Sparkles className="h-16 w-16 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-display font-semibold mb-2">AI is Crafting Your Quiz...</h2>
                <p className="text-muted-foreground animate-pulse">Analyzing your word list and writing custom questions.</p>
            </div>
        );
    }

    if (isFinished) {
        const score = calculateScore();
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="h-10 w-10 text-success" />
                    </div>
                    <h1 className="text-3xl font-display font-bold mb-2">Quiz Complete!</h1>
                    <p className="text-muted-foreground mb-8 text-lg">
                        You scored <span className="text-foreground font-bold">{score}</span> out of {questions.length}
                    </p>

                    <div className="bg-card border border-border rounded-2xl p-6 mb-8 shadow-sm">
                        <div className="text-5xl font-bold text-primary mb-2">
                            {Math.round((score / questions.length) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Accuracy</p>
                    </div>

                    <Button className="w-full h-12 text-lg" onClick={() => navigate('/')}>
                        Back to Home
                    </Button>
                </motion.div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const userAns = answers[currentIndex];
    const isCorrect = userAns === currentQ.correct_answer[0];

    const renderContent = (content: string) => {
        return content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded-md decoration-primary/30 underline-offset-4">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            return part;
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10 p-4">
                <div className="container max-w-2xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center">
                        <h1 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{listName}</h1>
                        <p className="text-xs">Question {currentIndex + 1} of {questions.length}</p>
                    </div>
                    <div className="w-10" />
                </div>
                <div className="mt-4 container max-w-2xl mx-auto">
                    <Progress value={((currentIndex + 1) / questions.length) * 100} className="h-1.5" />
                </div>
            </header>

            <main className="flex-1 container max-w-2xl mx-auto p-4 overflow-y-auto">
                <div className="min-h-full flex flex-col justify-center py-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            className="space-y-8"
                        >
                            <h2 className="text-2xl font-medium leading-relaxed">
                                {renderContent(currentQ.content)}
                            </h2>

                            <div className="grid gap-3">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = userAns === idx;
                                    const isCorrectTarget = idx === currentQ.correct_answer[0];

                                    let variantClasses = "border-border hover:bg-muted";
                                    if (showExplanation) {
                                        if (isCorrectTarget) variantClasses = "border-success bg-success/10 ring-1 ring-success";
                                        else if (isSelected) variantClasses = "border-destructive bg-destructive/10 ring-1 ring-destructive";
                                    } else if (isSelected) {
                                        variantClasses = "border-primary bg-primary/10";
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={showExplanation}
                                            onClick={() => handleAnswer(idx)}
                                            className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between ${variantClasses}`}
                                        >
                                            <span className="text-lg">{option}</span>
                                            {showExplanation && isCorrectTarget && <CheckCircle2 className="h-6 w-6 text-success" />}
                                            {showExplanation && isSelected && !isCorrectTarget && <XCircle className="h-6 w-6 text-destructive" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {showExplanation && (
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                                        <h4 className={`font-semibold mb-1 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h4>
                                        <p className="text-muted-foreground">{currentQ.explanation}</p>
                                    </div>
                                    <Button className="w-full h-12" onClick={handleNext}>
                                        {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                        <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// Required forrophy icon
import { Trophy } from 'lucide-react';

export default QuickQuiz;
