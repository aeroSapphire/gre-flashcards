import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlashcardsDb, FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, RefreshCcw, Clock, Trophy } from 'lucide-react';
import { SRSRating } from '@/utils/srs';

export default function StudySession() {
    const navigate = useNavigate();
    const { dueCards, reviewCard, isLoaded } = useFlashcardsDb();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        reviewed: 0,
        correct: 0,
    });

    // Filter due cards to ensure we only study what's needed
    // We might want to shuffle them or prioritize "Again" cards?
    // For now, simple list.
    const studyQueue = dueCards;
    const currentCard = studyQueue[currentCardIndex];
    const progress = studyQueue.length > 0 ? ((currentCardIndex) / studyQueue.length) * 100 : 100;

    const handleFlip = () => {
        setIsFlipped(true);
    };

    const handleRate = async (rating: SRSRating) => {
        if (!currentCard) return;

        await reviewCard(currentCard.id, rating);

        setSessionStats(prev => ({
            reviewed: prev.reviewed + 1,
            correct: rating !== 'again' ? prev.correct + 1 : prev.correct
        }));

        setIsFlipped(false);

        // Move to next card
        if (currentCardIndex < studyQueue.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // Session complete
            setCurrentCardIndex(prev => prev + 1); // trigger completion view
        }
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (studyQueue.length === 0) {
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
                            {/* Tags & Metadata could go here */}
                            <div className="flex justify-center gap-2 mb-4">
                                {currentCard.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                                ))}
                            </div>
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
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm animate-pulse">
                                    Tap reveal to see definition
                                </div>
                            )}
                        </CardContent>

                        {!isFlipped && (
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

                        {/* Height spacer for fixed layout when flipped */}
                        {isFlipped && <div className="h-4" />}
                    </Card>
                </div>
            </main>

            {/* Controls */}
            {isFlipped && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t animate-in slide-in-from-bottom duration-300">
                    <div className="container max-w-2xl mx-auto grid grid-cols-4 gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 gap-1 hover:bg-red-100 hover:text-red-700 hover:border-red-200 dark:hover:bg-red-900/30"
                            onClick={() => handleRate('again')}
                        >
                            <span className="font-bold text-base">Again</span>
                            <span className="text-[10px] text-muted-foreground font-normal">1m, &lt;1d</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 gap-1 hover:bg-orange-100 hover:text-orange-700 hover:border-orange-200 dark:hover:bg-orange-900/30"
                            onClick={() => handleRate('hard')}
                        >
                            <span className="font-bold text-base">Hard</span>
                            <span className="text-[10px] text-muted-foreground font-normal">2d</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 gap-1 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/30"
                            onClick={() => handleRate('good')}
                        >
                            <span className="font-bold text-base">Good</span>
                            <span className="text-[10px] text-muted-foreground font-normal">4d</span>
                        </Button>

                        <Button
                            variant="outline"
                            className="flex flex-col h-auto py-3 gap-1 hover:bg-green-100 hover:text-green-700 hover:border-green-200 dark:hover:bg-green-900/30"
                            onClick={() => handleRate('easy')}
                        >
                            <span className="font-bold text-base">Easy</span>
                            <span className="text-[10px] text-muted-foreground font-normal">7d</span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
