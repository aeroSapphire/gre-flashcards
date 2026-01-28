import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Clock, Play, Trophy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

interface Test {
    id: string;
    title: string;
    category: string;
    description: string;
    time_limit_minutes: number;
}

const CATEGORIES = [
    'No Shift Sentences',
    'Shift Sentences',
    'Double Blanks',
    'Triple Blanks',
    'Sentence Equivalence',
    'Reading Comprehension',
    'Weakening'
];

interface UserScore {
    test_id: string;
    best_score: number;
    total_questions: number;
    percentage: number;
}

const TestDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user } = useAuth();
    const [tests, setTests] = useState<Test[]>([]);
    const [userScores, setUserScores] = useState<Map<string, UserScore>>(new Map());
    const [loading, setLoading] = useState(true);
    const { cacheTests, getCachedTests } = useOfflineStorage();

    useEffect(() => {
        fetchTests();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserScores();
            // Sync any pending test attempts
            syncPendingTestAttempts();
        }
    }, [user]);

    // Listen for online status to sync pending attempts
    useEffect(() => {
        const handleOnline = () => {
            if (user) {
                syncPendingTestAttempts();
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [user]);

    const syncPendingTestAttempts = async () => {
        if (!navigator.onLine || !user) return;

        try {
            const pendingTests = JSON.parse(localStorage.getItem('pending-test-attempts') || '[]');
            if (pendingTests.length === 0) return;

            console.log(`Syncing ${pendingTests.length} pending test attempts...`);
            let syncedCount = 0;

            for (const attempt of pendingTests) {
                try {
                    const { error } = await supabase
                        .from('user_test_attempts')
                        .insert({
                            user_id: attempt.user_id,
                            test_id: attempt.test_id,
                            score: attempt.score,
                            total_questions: attempt.total_questions,
                            time_taken_seconds: attempt.time_taken_seconds,
                            answers: attempt.answers
                        });

                    if (!error) {
                        syncedCount++;
                    }
                } catch (e) {
                    console.error('Failed to sync attempt:', e);
                }
            }

            if (syncedCount > 0) {
                // Clear synced attempts
                localStorage.removeItem('pending-test-attempts');
                toast({
                    title: 'Tests synced!',
                    description: `${syncedCount} test result${syncedCount > 1 ? 's' : ''} synced to server.`,
                });
                // Refresh scores
                fetchUserScores();
            }
        } catch (e) {
            console.error('Error syncing pending tests:', e);
        }
    };

    const fetchTests = async () => {
        // Check online status directly for real-time accuracy
        const currentlyOnline = navigator.onLine;

        if (!currentlyOnline) {
            // Load from cache when offline
            try {
                const cachedTests = await getCachedTests();
                if (cachedTests.length > 0) {
                    setTests(cachedTests as Test[]);
                    toast({
                        title: 'Offline mode',
                        description: `Loaded ${cachedTests.length} tests from cache`,
                    });
                } else {
                    toast({
                        title: 'You are offline',
                        description: 'No cached tests available.',
                        variant: 'destructive',
                    });
                }
            } catch (e) {
                console.error('Cache read error:', e);
            }
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('title');

            if (error) throw error;
            setTests(data || []);

            // Also fetch all questions for offline caching
            const { data: questionsData } = await supabase
                .from('questions')
                .select('*');

            // Cache tests and questions for offline use
            if (data && questionsData) {
                console.log(`Caching ${data.length} tests and ${questionsData.length} questions for offline use`);
                await cacheTests(data, questionsData);
            }
        } catch (error: any) {
            console.error('Fetch error, trying cache:', error);
            // Try cache on error
            try {
                const cachedTests = await getCachedTests();
                if (cachedTests.length > 0) {
                    setTests(cachedTests as Test[]);
                    toast({
                        title: 'Using cached data',
                        description: 'Could not connect to server',
                    });
                } else {
                    toast({
                        title: 'Error loading tests',
                        description: error.message || 'Network error',
                        variant: 'destructive',
                    });
                }
            } catch (e) {
                console.error('Cache fallback error:', e);
                toast({
                    title: 'Error loading tests',
                    description: error.message || 'Network error',
                    variant: 'destructive',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchUserScores = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('user_test_attempts')
                .select('test_id, score, total_questions')
                .eq('user_id', user.id);

            if (error) throw error;

            // Group by test_id and keep best score
            const scoreMap = new Map<string, UserScore>();
            (data || []).forEach(attempt => {
                const percentage = Math.round((attempt.score / attempt.total_questions) * 100);
                const existing = scoreMap.get(attempt.test_id);
                if (!existing || percentage > existing.percentage) {
                    scoreMap.set(attempt.test_id, {
                        test_id: attempt.test_id,
                        best_score: attempt.score,
                        total_questions: attempt.total_questions,
                        percentage
                    });
                }
            });

            setUserScores(scoreMap);
        } catch (error) {
            console.error('Error fetching user scores:', error);
        }
    };

    const startTest = (testId: string) => {
        navigate(`/test/${testId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading tests...</div>
            </div>
        );
    }

    const testsByCategory = CATEGORIES.map(category => ({
        name: category,
        tests: tests.filter(t => t.category === category)
    })).filter(c => c.tests.length > 0);

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="font-display text-xl font-semibold text-foreground">
                                    GRE Practice Tests
                                </h1>
                                <p className="text-xs text-muted-foreground">{tests.length} tests available</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => navigate('/leaderboard')}>
                            <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                            Leaderboard
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
                {testsByCategory.map((category) => (
                    <div key={category.name}>
                        <h2 className="text-lg font-semibold mb-4 text-foreground">{category.name}</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {category.tests.map((test) => {
                                const userScore = userScores.get(test.id);
                                return (
                                <Card key={test.id} className="hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-base">{test.title}</CardTitle>
                                                <CardDescription className="flex items-center gap-1 text-xs">
                                                    <Clock className="h-3 w-3" />
                                                    {test.time_limit_minutes} minutes
                                                </CardDescription>
                                            </div>
                                            {userScore && (
                                                <div className={`flex items-center gap-1 text-sm font-medium ${
                                                    userScore.percentage >= 80 ? 'text-green-600' :
                                                    userScore.percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                                                }`}>
                                                    <CheckCircle className="h-4 w-4" />
                                                    {userScore.percentage}%
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {test.description}
                                        </p>
                                        <Button className="w-full" onClick={() => startTest(test.id)}>
                                            <Play className="h-4 w-4 mr-2" />
                                            {userScore ? 'Retry Test' : 'Start Test'}
                                        </Button>
                                    </CardContent>
                                </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {testsByCategory.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No tests found. Please check database seeding.
                    </div>
                )}
            </main>
        </div>
    );
};

export default TestDashboard;
