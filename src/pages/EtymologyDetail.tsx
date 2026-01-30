import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ExternalLink, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

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
