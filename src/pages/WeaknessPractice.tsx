
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BrainCircuit, CheckCircle2, XCircle, Loader2, RefreshCw, GraduationCap } from 'lucide-react';
import { getMistakeHistory } from '@/services/mistakeService';
import { analyzeMistakes, NUDGE_MESSAGES } from '@/services/mistakeAnalysis';
import { generateTargetedPractice, PracticeQuestion, markQuestionAsUsed } from '@/services/practiceService';
import { updateSkillModel } from '@/services/skillEngine';
import { MistakeLabel } from '@/utils/mistakeClassifier';
import { useToast } from '@/hooks/use-toast';
import { TutorLesson } from '@/components/TutorLesson';

type Phase = 'initial' | 'tutor' | 'practice' | 'finished';

export default function WeaknessPractice() {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [dominantMistake, setDominantMistake] = useState<MistakeLabel | null>(null);
    const [phase, setPhase] = useState<Phase>('initial');
    const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        loadWeakness();
    }, []);

    const loadWeakness = async () => {
        try {
            const history = await getMistakeHistory();
            const weakness = analyzeMistakes(history);
            setDominantMistake(weakness);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startTutor = () => {
        setPhase('tutor');
    };

    const startPractice = async () => {
        if (!dominantMistake) return;
        setGenerating(true);
        setPhase('practice');
        try {
            const newQuestions = await generateTargetedPractice(dominantMistake);
            setQuestions(newQuestions);
            setCurrentQIndex(0);
            setScore(0);
            setShowResult(false);
            setSelectedIndices([]);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to generate practice questions. Please try again.",
                variant: "destructive"
            });
            setPhase('tutor');
        } finally {
            setGenerating(false);
        }
    };

    const handleAnswer = (idx: number) => {
        if (showResult) return;
        
        const currentQ = questions[currentQIndex];
        const isMulti = currentQ.type === 'multi_choice' || currentQ.correct_answer.length > 1;

        if (isMulti) {
            setSelectedIndices(prev => 
                prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
            );
        } else {
            setSelectedIndices([idx]);
        }
    };

    const checkAnswer = () => {
        setShowResult(true);
        const currentQ = questions[currentQIndex];
        
        // Mark as used
        if (currentQ.id) {
            markQuestionAsUsed(currentQ.id);
        }

        const correct = currentQ.correct_answer;
        
        const isCorrect = selectedIndices.length === correct.length && 
                          selectedIndices.every(i => correct.includes(i));
        
        if (isCorrect) setScore(s => s + 1);

        if (dominantMistake) {
            updateSkillModel(dominantMistake, isCorrect);
        }
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedIndices([]);
            setShowResult(false);
        } else {
            setPhase('finished');
        }
    };

    const resetAndStartOver = () => {
        setPhase('tutor');
        setQuestions([]);
        setCurrentQIndex(0);
        setScore(0);
        setShowResult(false);
        setSelectedIndices([]);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // View: Finished
    if (phase === 'finished') {
        const percentage = Math.round((score / questions.length) * 100);
        const isGood = percentage >= 70;

        return (
            <div className="min-h-screen container max-w-2xl mx-auto p-4 py-8">
                 <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Button>
                </div>
                <Card className="text-center py-10">
                    <CardContent>
                        <h1 className="text-3xl font-bold mb-4">Practice Complete</h1>
                        <div className={`text-5xl font-black mb-4 ${isGood ? 'text-green-500' : 'text-amber-500'}`}>
                            {percentage}%
                        </div>
                        <p className="text-muted-foreground mb-2">
                            You scored {score} out of {questions.length}
                        </p>
                        <p className="text-sm text-muted-foreground mb-8">
                            Weakness: <span className="font-mono text-primary">{dominantMistake}</span>
                        </p>

                        {!isGood && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    <strong>Tip:</strong> Review the lesson again and pay close attention to the strategies. Practice makes perfect!
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Button onClick={resetAndStartOver}>
                                <GraduationCap className="mr-2 h-4 w-4" /> Review Lesson
                            </Button>
                            <Button variant="outline" onClick={startPractice}>
                                <RefreshCw className="mr-2 h-4 w-4" /> More Practice
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/')}>
                                Return Home
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // View: Tutor Lesson
    if (phase === 'tutor' && dominantMistake) {
        return (
            <div className="min-h-screen container max-w-2xl mx-auto p-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => setPhase('initial')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>

                <TutorLesson
                    mistakeLabel={dominantMistake}
                    onContinue={startPractice}
                />

                {generating && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Generating practice questions...</p>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // View: Initial (Start)
    if (phase === 'initial') {
        return (
            <div className="min-h-screen container max-w-2xl mx-auto p-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Button>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-6 w-6 text-primary" />
                            Targeted Weakness Practice
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {dominantMistake ? (
                            <>
                                <div className="p-4 bg-background rounded-lg border">
                                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Identified Weakness</p>
                                    <p className="text-xl font-bold text-red-500">{dominantMistake?.replace(/_/g, ' ')}</p>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                                    <p className="text-sm text-muted-foreground italic">
                                        "{NUDGE_MESSAGES[dominantMistake]}"
                                    </p>
                                </div>

                                <p className="text-muted-foreground">
                                    We'll first help you understand this pattern, then give you targeted practice questions.
                                </p>

                                <Button size="lg" className="w-full" onClick={startTutor}>
                                    <GraduationCap className="mr-2 h-5 w-5" />
                                    Start Learning
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-8">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">No Clear Weakness Detected</h3>
                                <p className="text-muted-foreground mb-4">
                                    You haven't made enough consistent mistakes for us to identify a specific pattern yet. Keep taking regular tests!
                                </p>
                                <Button onClick={() => navigate('/tests')}>Go to Tests</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // View: Practice - Loading
    if (phase === 'practice' && (generating || questions.length === 0)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating practice questions...</p>
                </div>
            </div>
        );
    }

    // View: Question
    const currentQ = questions[currentQIndex];

    if (!currentQ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Something went wrong loading questions.</p>
                    <Button onClick={() => setPhase('initial')}>Go Back</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen container max-w-2xl mx-auto p-4 py-8">
            <div className="mb-6 flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">
                    Question {currentQIndex + 1} of {questions.length}
                </span>
                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                    {dominantMistake}
                </span>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <p className="text-lg font-medium mb-6 leading-relaxed">
                        {currentQ.content}
                    </p>

                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => {
                            const isSelected = selectedIndices.includes(idx);
                            const isCorrect = currentQ.correct_answer.includes(idx);
                            
                            let styles = "w-full justify-start text-left h-auto p-4 border-2 ";
                            
                            if (showResult) {
                                if (isCorrect) {
                                    styles += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-50 hover:text-green-700 ";
                                } else if (isSelected) {
                                    styles += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-50 hover:text-red-700 ";
                                } else {
                                    styles += "border-transparent opacity-50 ";
                                }
                            } else {
                                if (isSelected) {
                                    styles += "border-primary bg-primary/5 ";
                                } else {
                                    styles += "border-transparent hover:bg-muted ";
                                }
                            }

                            return (
                                <Button
                                    key={idx}
                                    variant="ghost"
                                    className={styles}
                                    onClick={() => handleAnswer(idx)}
                                    disabled={showResult}
                                >
                                    <div className="flex items-center w-full">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center mr-3 shrink-0 ${
                                            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                                        }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className="whitespace-normal">{opt}</span>
                                        {showResult && isCorrect && <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />}
                                        {showResult && isSelected && !isCorrect && <XCircle className="ml-auto h-5 w-5 text-red-600" />}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                    {showResult && (
                        <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                            <div className="bg-muted p-4 rounded-lg mb-4">
                                <h4 className="font-semibold mb-1 text-sm">Explanation</h4>
                                <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
                            </div>
                            <Button className="w-full" size="lg" onClick={nextQuestion}>
                                {currentQIndex < questions.length - 1 ? "Next Question" : "Finish Practice"}
                            </Button>
                        </div>
                    )}

                    {!showResult && (
                        <Button 
                            className="w-full mt-6" 
                            size="lg" 
                            onClick={checkAnswer}
                            disabled={selectedIndices.length === 0}
                        >
                            Check Answer
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
