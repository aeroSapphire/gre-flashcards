import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Root {
    id: string;
    root: string;
    meaning: string;
    origin: string;
    word_count?: number;
}

export default function EtymologyDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [roots, setRoots] = useState<Root[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRoots();
    }, []);

    const fetchRoots = async () => {
        try {
            // Get roots and count of words for each
            const { data, error } = await supabase
                .from('etymology_roots')
                .select(`
                    *,
                    etymology_words (count)
                `)
                .order('root');

            if (error) throw error;

            const formattedRoots = data.map((r: any) => ({
                ...r,
                word_count: r.etymology_words[0]?.count || 0
            }));

            setRoots(formattedRoots);
        } catch (error: any) {
            toast({
                title: 'Error loading roots',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Exploring word origins...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-foreground">
                                Etymology & Roots
                            </h1>
                            <p className="text-xs text-muted-foreground">Master GRE words through their origins</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8">
                <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">Why study roots?</h2>
                            <p className="text-sm text-muted-foreground">
                                Understanding one root like <span className="text-primary font-mono italic">"circum"</span> (around)
                                helps you instantly decode dozens of complex words.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {roots.map((root, index) => (
                        <motion.div
                            key={root.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
                                onClick={() => navigate(`/etymology/${root.id}`)}
                            >
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl font-display font-bold group-hover:text-primary transition-colors">
                                            {root.root}
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                {root.origin}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {root.word_count} words
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg text-foreground font-medium italic">
                                        "{root.meaning}"
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {roots.length === 0 && (
                    <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <p className="text-muted-foreground">Etymology data is being prepared. Check back soon!</p>
                    </div>
                )}
            </main>
        </div>
    );
}
