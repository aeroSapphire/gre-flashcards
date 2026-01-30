import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ExternalLink, Info, Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { generateEtymologyChallenge, EtymologyChallenge } from '@/services/sentenceEvaluator';

interface Root {
    id: string;
    root: string;
    meaning: string;
    origin: string;
}

interface EtymologyWord {
    id: string;
    word: string;
    definition: string;
    breakdown: string;
}

export default function EtymologyDetail() {
    const { rootId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [root, setRoot] = useState<Root | null>(null);
    const [words, setWords] = useState<EtymologyWord[]>([]);
    const [loading, setLoading] = useState(true);

    // AI Challenge state
    const [challenge, setChallenge] = useState<EtymologyChallenge | null>(null);
    const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showBreakdown, setShowBreakdown] = useState(false);

    useEffect(() => {
        if (rootId) {
            fetchDetail();
        }
    }, [rootId]);

    const fetchDetail = async () => {
        try {
            // Fetch root info
            const { data: rootData, error: rootError } = await supabase
                .from('etymology_roots')
                .select('*')
                .eq('id', rootId)
                .single();

            if (rootError) throw rootError;
            setRoot(rootData);

            // Fetch associated words
            const { data: wordsData, error: wordsError } = await supabase
                .from('etymology_words')
                .select('*')
                .eq('root_id', rootId)
                .order('word');

            if (wordsError) throw wordsError;
            setWords(wordsData || []);
        } catch (error: any) {
            toast({
                title: 'Error loading details',
                description: error.message,
                variant: 'destructive',
            });
            navigate('/etymology');
        } finally {
            setLoading(false);
        }
    };

    const handleStartChallenge = async () => {
        if (!root) return;
        setIsGeneratingChallenge(true);
        setChallenge(null);
        setSelectedOption(null);
        setShowBreakdown(false);

        try {
            const result = await generateEtymologyChallenge(
                root.root,
                root.meaning,
                words.map(w => w.word)
            );
            setChallenge(result);
        } catch (error) {
            toast({
                title: 'AI Error',
                description: 'Failed to generate a challenge. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingChallenge(false);
        }
    };

    const handleSelectOption = (index: number) => {
        if (selectedOption !== null) return;
        setSelectedOption(index);
        setShowBreakdown(true);
    };

    if (loading || !root) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Deconstructing symbols...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/etymology')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-foreground">
                                {root.root}
                            </h1>
                            <p className="text-xs text-muted-foreground">Origin: {root.origin} • Meaning: "{root.meaning}"</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-3xl mx-auto px-4 py-8">
                {/* AI Challenge Section */}
                <div className="mb-12">
                    {!challenge && !isGeneratingChallenge ? (
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/20 text-center space-y-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-display font-bold">Ready to test your intuition?</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Knowledge of <span className="text-foreground font-semibold italic text-primary">"{root.root}"</span> allows you to guess the meaning of words you've never seen before.
                            </p>
                            <Button onClick={handleStartChallenge} className="gap-2" size="lg">
                                <Sparkles className="h-4 w-4" />
                                Start AI Root Challenge
                            </Button>
                        </div>
                    ) : (
                        <Card className="rounded-3xl border-2 border-primary/20 shadow-xl overflow-hidden">
                            <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Sparkles className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-widest">AI Challenge</span>
                                    </div>
                                    {isGeneratingChallenge && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                </div>

                                {isGeneratingChallenge ? (
                                    <h3 className="text-2xl font-display font-semibold text-center py-4">Finding a related GRE word...</h3>
                                ) : (
                                    <div className="text-center space-y-3">
                                        <p className="text-sm text-muted-foreground">Based on the root <span className="font-bold">"{root.root}"</span> ({root.meaning}), what does this word mean?</p>
                                        <h3 className="text-4xl font-display font-bold tracking-tight text-primary uppercase">
                                            {challenge?.word}
                                        </h3>
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="p-8">
                                <div className="grid gap-3">
                                    {challenge?.options.map((option, idx) => {
                                        const isCorrect = idx === challenge.correct_index;
                                        const isSelected = selectedOption === idx;

                                        let borderColor = "border-border";
                                        let bgColor = "bg-card";

                                        if (selectedOption !== null) {
                                            if (isCorrect) {
                                                borderColor = "border-success bg-success/10 ring-1 ring-success";
                                            } else if (isSelected) {
                                                borderColor = "border-destructive bg-destructive/10 ring-1 ring-destructive";
                                            }
                                        } else {
                                            bgColor = "hover:bg-muted/50";
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                disabled={selectedOption !== null}
                                                onClick={() => handleSelectOption(idx)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${borderColor} ${bgColor}`}
                                            >
                                                <span className="font-medium">{option}</span>
                                                {selectedOption !== null && isCorrect && <CheckCircle2 className="h-5 w-5 text-success" />}
                                                {selectedOption !== null && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                <AnimatePresence>
                                    {showBreakdown && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="mt-8 pt-6 border-t border-dashed border-border flex gap-4"
                                        >
                                            <div className="p-3 bg-primary/10 rounded-xl h-fit">
                                                <Info className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="font-semibold text-foreground">Etymological Breakdown</h4>
                                                <p className="text-muted-foreground leading-relaxed">
                                                    {challenge?.breakdown}
                                                </p>
                                                <Button variant="ghost" size="sm" onClick={handleStartChallenge} className="text-primary mt-2">
                                                    Try Another One
                                                </Button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-display font-bold">Standard Examples</h2>
                </div>

                <div className="space-y-6">
                    {words.map((w, index) => (
                        <motion.div
                            key={w.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="border-l-4 border-l-primary/40 shadow-sm overflow-hidden">
                                <CardHeader className="bg-primary/5 pb-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-2xl font-display font-bold text-primary">
                                                {w.word}
                                            </CardTitle>
                                            <div className="flex items-center gap-2 mt-1 text-sm font-mono text-muted-foreground bg-background/50 px-2 py-1 rounded inline-flex border border-border/50">
                                                <Info className="h-3 w-3" />
                                                {w.breakdown}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Definition</p>
                                            <p className="text-lg leading-relaxed text-foreground">
                                                {w.definition}
                                            </p>
                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary hover:text-primary hover:bg-primary/10 gap-2"
                                                onClick={() => {
                                                    // This could potentially search for this word in the main flashcards
                                                    toast({
                                                        title: "View Card",
                                                        description: "Main flashcard sync coming soon!"
                                                    });
                                                }}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                Study Full Card
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {words.length === 0 && (
                    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">No words added for this root yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
