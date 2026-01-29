import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsDb, FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle2, Trophy, Send, Loader2, SkipForward, Users } from 'lucide-react';
import { SRSRating, getIntervalPreviews } from '@/utils/srs';
import {
    isSentencePracticeEnabled,
    evaluateSentence,
    saveEvaluation,
    getEvaluationsForCard,
    EvaluationResult,
    SavedEvaluation,
    generateExamples,
} from '@/services/sentenceEvaluator';
import { useAuth } from '@/contexts/AuthContext';

export default function StudySession() {
    const navigate = useNavigate();
    const { dueCards, reviewCard, updateCard, isLoaded } = useFlashcardsDb();
    const { user, profile } = useAuth();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        reviewed: 0,
        correct: 0,
    });
    const [studyQueue, setStudyQueue] = useState<FlashcardWithProgress[]>([]);
    const [sessionInitialized, setSessionInitialized] = useState(false);

    // Sentence practice state
    const [userSentence, setUserSentence] = useState('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
    const [evaluationError, setEvaluationError] = useState<string | null>(null);
    const [communitySentences, setCommunitySentences] = useState<SavedEvaluation[]>([]);
    const [isLoadingCommunity, setIsLoadingCommunity] = useState(false);

    // Check if sentence practice is enabled (Check profile first, then localStorage)
    const practiceEnabled = profile?.sentence_practice_enabled ?? isSentencePracticeEnabled();

    // Track if we're waiting for user to continue after evaluation
    const [awaitingContinue, setAwaitingContinue] = useState(false);

    // Past evaluations from other users
    const [pastEvaluations, setPastEvaluations] = useState<SavedEvaluation[]>([]);

    useEffect(() => {
        if (isLoaded && !sessionInitialized && dueCards.length > 0) {
            setStudyQueue(dueCards);
            setSessionInitialized(true);
        }
    }, [isLoaded, dueCards, sessionInitialized]);

    useEffect(() => {
        if (currentCard) {
            loadCommunitySentences();
        }
    }, [currentCardIndex, studyQueue]);

    const loadCommunitySentences = async () => {
        if (!currentCard) return;
        setIsLoadingCommunity(true);
        const data = await getEvaluationsForCard(currentCard.id);
        setCommunitySentences(data);
        setIsLoadingCommunity(false);
    };

    const currentCard = studyQueue[currentCardIndex];
    const progress = studyQueue.length > 0 ? ((currentCardIndex) / studyQueue.length) * 100 : 100;

    // Fetch past evaluations when card changes
    useEffect(() => {
        if (currentCard) {
            getEvaluationsForCard(currentCard.id)
                .then(evals => {
                    // Filter out current user's evaluations
                    const othersEvals = evals.filter(e => e.user_id !== user?.id);
                    setPastEvaluations(othersEvals);
                })
                .catch(() => {
                    // Table might not exist yet, ignore error
                    setPastEvaluations([]);
                });
        }
    }, [currentCard?.id, user?.id]);

    const handleFlip = async () => {
        setIsFlipped(true);

        // Auto-generate example if missing
        if (!currentCard.example) {
            console.log("Generating missing example for:", currentCard.word);
            const examples = await generateExamples(currentCard.word, currentCard.definition);
            if (examples.length > 0) {
                await updateCard(currentCard.id, { example: examples[0] });
            }
        }
    };

    const resetSentencePractice = () => {
        setUserSentence('');
        setEvaluationResult(null);
        setEvaluationError(null);
        setAwaitingContinue(false);
    };

    const handleRate = async (rating: SRSRating) => {
        if (!currentCard) return;

        await reviewCard(currentCard.id, rating);

        setSessionStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: rating !== 'again' ? prev.correct + 1 : prev.correct
        }));

        setIsFlipped(false);
        resetSentencePractice();

        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            setCurrentCardIndex(prev => prev + 1);
        }
    };

    const handleEvaluateSentence = async () => {
        if (!userSentence.trim() || !currentCard) return;

        setIsEvaluating(true);
        setEvaluationError(null);
        setEvaluationResult(null);

        try {
            const result = await evaluateSentence(
                currentCard.word,
                currentCard.definition,
                userSentence.trim()
            );
            setEvaluationResult(result);
            setIsFlipped(true);
            setAwaitingContinue(true);

            // Save the evaluation to database
            await saveEvaluation(
                currentCard.id,
                userSentence.trim(),
                result.rating,
                result.feedback
            );

            // If card is missing an example, use one from the AI result
            if (!currentCard.example && result.examples && result.examples.length > 0) {
                await updateCard(currentCard.id, { example: result.examples[0] });
            }
        } catch (error: any) {
            setEvaluationError(error.message);
        } finally {
            setIsEvaluating(false);
        }
    };

    const handleContinueAfterEvaluation = async () => {
        if (!evaluationResult || !currentCard) return;

        await reviewCard(currentCard.id, evaluationResult.rating);

        setSessionStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: evaluationResult.rating !== 'again' ? prev.correct + 1 : prev.correct
        }));

        setIsFlipped(false);
        resetSentencePractice();
        setCurrentCardIndex(prev => prev + 1);
    };

    const handleSkipSentencePractice = () => {
        // Skip to manual rating mode
        setIsFlipped(true);
        setAwaitingContinue(false);
    };

    const formatRatingText = (rating: string): string => {
        switch (rating) {
            case 'easy': return 'Excellent';
            case 'good': return 'Good';
            case 'hard': return 'Some';
            case 'again': return 'Weak';
            default: return rating;
        }
    };

    const formatPastEvaluations = (): string | null => {
        if (pastEvaluations.length === 0) return null;

        const latest = pastEvaluations[0];
        const name = latest.profile?.display_name || 'Someone';
        const ratingText = formatRatingText(latest.rating);

        if (pastEvaluations.length === 1) {
            return `${name} showed ${ratingText} understanding`;
        }
        return `${name} & ${pastEvaluations.length - 1} other${pastEvaluations.length > 2 ? 's' : ''} practiced this word`;
    };

    if (!isLoaded || (!sessionInitialized && dueCards.length > 0)) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (studyQueue.length === 0 && dueCards.length === 0) {
        return (
            <div className="container max-w-md mx-auto py-12 px-4 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">All caught up!</h1>
                <p className="text-muted-foreground mb-8">
                    You have no cards due for review right now. Great job keeping up with your studies!
                </p>
                <Button onClick={() => navigate('/')} size="lg">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    if (currentCardIndex >= studyQueue.length) {
        return (
            <div className="container max-w-md mx-auto py-12 px-4 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="h-24 w-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Trophy className="h-12 w-12 text-green-600 dark:text-green-500" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-4">Session Complete!</h1>
                <div className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold">{sessionStats.reviewed}</div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Cards Reviewed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {Math.round((sessionStats.correct / (sessionStats.reviewed || 1)) * 100)}%
                            </div>
                            <div className="text-xs text-muted-foreground uppercase tracking-wide">Retention</div>
                        </div>
                    </div>
                </div>
                <Button onClick={() => navigate('/')} size="lg">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const cardState = {
        interval: currentCard.interval || 0,
        ease_factor: currentCard.ease_factor || 2.5,
        repetitions: currentCard.repetition || 0,
    };
    const previews = getIntervalPreviews(cardState);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
                <div className="container max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="-ml-2">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quit
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground">
                        {currentCardIndex + 1} / {studyQueue.length}
                    </div>
                </div>
                <Progress value={progress} className="h-1 rounded-none" />
            </header>

            {/* Main Card Area */}
            <main className="flex-1 container max-w-2xl mx-auto p-4 flex flex-col justify-center min-h-[500px]">
                <div className="w-full relative perspective-1000">
                    <Card className="w-full min-h-[400px] flex flex-col shadow-lg border-2">
                        <CardHeader className="text-center pt-8 pb-4">
                            <div className="flex justify-center gap-2 mb-4">
                                {currentCard.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                                ))}
                            </div>
                            {formatPastEvaluations() && (
                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>{formatPastEvaluations()}</span>
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-foreground">
                                {currentCard.word}
                            </h2>

                            {isFlipped ? (
                                <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Definition</p>
                                        <p className="text-xl md:text-2xl leading-relaxed font-medium">
                                            {currentCard.definition}
                                        </p>
                                    </div>

                                    {currentCard.example && (
                                        <div className="pt-4 border-t w-full">
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Example</p>
                                            <p className="text-lg italic text-muted-foreground">
                                                "{currentCard.example}"
                                            </p>
                                        </div>
                                    )}

                                    {/* AI Evaluation Result */}
                                    {evaluationResult && (
                                        <div className="pt-4 border-t w-full space-y-4">
                                            <div className="p-4 rounded-lg bg-muted/50 border text-left">
                                                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Your sentence</p>
                                                <p className="text-base italic">"{userSentence}"</p>
                                            </div>
                                            <div className={`p-4 rounded-lg border ${evaluationResult.rating === 'easy' || evaluationResult.rating === 'good'
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                                : evaluationResult.rating === 'hard'
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                }`}>
                                                <div className="space-y-2 text-left">
                                                    <div className="flex items-center justify-between">
                                                        <p className={`font-medium ${evaluationResult.rating === 'easy' || evaluationResult.rating === 'good'
                                                            ? 'text-green-700 dark:text-green-300'
                                                            : evaluationResult.rating === 'hard'
                                                                ? 'text-amber-700 dark:text-amber-300'
                                                                : 'text-red-700 dark:text-red-300'
                                                            }`}>
                                                            {evaluationResult.rating === 'easy' ? 'Excellent!' :
                                                                evaluationResult.rating === 'good' ? 'Good job!' :
                                                                    evaluationResult.rating === 'hard' ? 'Almost there!' : 'Try again next time!'}
                                                        </p>
                                                        <Badge variant="outline" className={`uppercase ${evaluationResult.rating === 'easy' ? 'border-green-500 text-green-600' :
                                                            evaluationResult.rating === 'good' ? 'border-blue-500 text-blue-600' :
                                                                evaluationResult.rating === 'hard' ? 'border-amber-500 text-amber-600' :
                                                                    'border-red-500 text-red-600'
                                                            }`}>
                                                            {evaluationResult.rating}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {evaluationResult.feedback}
                                                    </p>
                                                    {evaluationResult.suggestion && (
                                                        <p className="text-sm text-muted-foreground italic">
                                                            Suggestion: {evaluationResult.suggestion}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Example sentences from AI */}
                                            {evaluationResult.examples && evaluationResult.examples.length > 0 && (
                                                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-3">
                                                        Example Sentences
                                                    </p>
                                                    <ul className="space-y-2 text-left">
                                                        {evaluationResult.examples.map((example, idx) => (
                                                            <li key={idx} className="text-sm text-muted-foreground italic">
                                                                "{example}"
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : practiceEnabled ? (
                                // Sentence practice mode - show input before reveal
                                <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Write a sentence using this word to test your understanding
                                    </p>

                                    <Textarea
                                        placeholder={`Use "${currentCard.word}" in a sentence...`}
                                        value={userSentence}
                                        onChange={(e) => setUserSentence(e.target.value)}
                                        className="min-h-[100px] text-base"
                                        disabled={isEvaluating}
                                        autoFocus
                                    />

                                    {evaluationError && (
                                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                            <p className="text-sm text-red-700 dark:text-red-300">{evaluationError}</p>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEvaluationError(null)}
                                                className="mt-2"
                                            >
                                                Try Again
                                            </Button>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleEvaluateSentence}
                                            disabled={!userSentence.trim() || isEvaluating}
                                            className="flex-1 gap-2"
                                        >
                                            {isEvaluating ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Evaluating...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleSkipSentencePractice}
                                            disabled={isEvaluating}
                                            className="gap-2"
                                        >
                                            <SkipForward className="h-4 w-4" />
                                            Skip
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm animate-pulse">
                                    Tap reveal to see definition
                                </div>
                            )}
                        </CardContent>

                        {!isFlipped && !practiceEnabled && (
                            <CardFooter className="p-6 pt-0">
                                <Button
                                    onClick={handleFlip}
                                    className="w-full h-14 text-lg font-semibold shadow-md active:scale-[0.98] transition-transform"
                                    size="lg"
                                >
                                    Reveal Answer
                                </Button>
                            </CardFooter>
                        )}

                        {isFlipped && <div className="h-4" />}
                    </Card>
                </div>
            </main>

            {/* Controls */}
            {isFlipped && currentCard && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t animate-in slide-in-from-bottom duration-300">
                    <div className="container max-w-2xl mx-auto">
                        {awaitingContinue && evaluationResult ? (
                            // AI-rated mode: show continue button
                            <Button
                                onClick={handleContinueAfterEvaluation}
                                className={`w-full h-14 text-lg font-semibold shadow-md ${evaluationResult.rating === 'easy' ? 'bg-green-600 hover:bg-green-700' :
                                    evaluationResult.rating === 'good' ? 'bg-blue-600 hover:bg-blue-700' :
                                        evaluationResult.rating === 'hard' ? 'bg-amber-600 hover:bg-amber-700' :
                                            'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                Continue ({evaluationResult.rating.charAt(0).toUpperCase() + evaluationResult.rating.slice(1)} - {previews[evaluationResult.rating]})
                            </Button>
                        ) : (
                            // Manual rating mode
                            <div className="grid grid-cols-4 gap-2 md:gap-4">
                                <Button
                                    variant="outline"
                                    className="flex flex-col h-auto py-3 gap-1 hover:bg-red-100 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/30"
                                    onClick={() => handleRate('again')}
                                >
                                    <span className="font-bold text-base">Again</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">{previews.again}</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex flex-col h-auto py-3 gap-1 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-200 dark:hover:bg-orange-900/30"
                                    onClick={() => handleRate('hard')}
                                >
                                    <span className="font-bold text-base">Hard</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">{previews.hard}</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex flex-col h-auto py-3 gap-1 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/30"
                                    onClick={() => handleRate('good')}
                                >
                                    <span className="font-bold text-base">Good</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">{previews.good}</span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="flex flex-col h-auto py-3 gap-1 hover:bg-green-100 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/30"
                                    onClick={() => handleRate('easy')}
                                >
                                    <span className="font-bold text-base">Easy</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">{previews.easy}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
