import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, Medal, Clock, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
    id: string;
    user_id: string;
    user_email: string;
    test_id: string;
    test_title: string;
    test_category: string;
    score: number;
    total_questions: number;
    percentage: number;
    time_taken_seconds: number;
    completed_at: string;
}

interface UserStats {
    total_tests_taken: number;
    total_questions_answered: number;
    total_correct: number;
    average_percentage: number;
    best_category: string;
}

const CATEGORIES = [
    'All',
    'No Shift Sentences',
    'Shift Sentences',
    'Double Blanks',
    'Triple Blanks',
    'Sentence Equivalence',
    'Reading Comprehension',
    'Weakening'
];

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
        if (user) {
            fetchUserStats();
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        try {
            // Get all attempts with test info
            const { data: attempts, error } = await supabase
                .from('user_test_attempts')
                .select(`
                    id,
                    user_id,
                    test_id,
                    score,
                    total_questions,
                    time_taken_seconds,
                    completed_at
                `)
                .order('completed_at', { ascending: false });

            if (error) throw error;

            // Get all tests for joining
            const { data: tests } = await supabase
                .from('tests')
                .select('id, title, category');

            // Get user emails (we'll use user_id as display if email not available)
            const testMap = new Map(tests?.map(t => [t.id, t]) || []);

            const enrichedEntries: LeaderboardEntry[] = (attempts || []).map(a => {
                const test = testMap.get(a.test_id);
                return {
                    ...a,
                    user_email: a.user_id.slice(0, 8) + '...', // Anonymized user ID
                    test_title: test?.title || 'Unknown Test',
                    test_category: test?.category || 'Unknown',
                    percentage: Math.round((a.score / a.total_questions) * 100)
                };
            });

            setEntries(enrichedEntries);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserStats = async () => {
        if (!user) return;

        try {
            const { data: attempts } = await supabase
                .from('user_test_attempts')
                .select('score, total_questions, test_id')
                .eq('user_id', user.id);

            const { data: tests } = await supabase
                .from('tests')
                .select('id, category');

            if (attempts && attempts.length > 0) {
                const testMap = new Map(tests?.map(t => [t.id, t.category]) || []);

                const totalTests = attempts.length;
                const totalQuestions = attempts.reduce((sum, a) => sum + a.total_questions, 0);
                const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0);
                const avgPercentage = Math.round((totalCorrect / totalQuestions) * 100);

                // Calculate best category
                const categoryScores: Record<string, { correct: number; total: number }> = {};
                attempts.forEach(a => {
                    const category = testMap.get(a.test_id) || 'Unknown';
                    if (!categoryScores[category]) {
                        categoryScores[category] = { correct: 0, total: 0 };
                    }
                    categoryScores[category].correct += a.score;
                    categoryScores[category].total += a.total_questions;
                });

                let bestCategory = 'N/A';
                let bestPercentage = 0;
                Object.entries(categoryScores).forEach(([cat, scores]) => {
                    const pct = (scores.correct / scores.total) * 100;
                    if (pct > bestPercentage) {
                        bestPercentage = pct;
                        bestCategory = cat;
                    }
                });

                setUserStats({
                    total_tests_taken: totalTests,
                    total_questions_answered: totalQuestions,
                    total_correct: totalCorrect,
                    average_percentage: avgPercentage,
                    best_category: bestCategory
                });
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get top scores per test (best attempt per user per test)
    const getTopScores = () => {
        const filtered = selectedCategory === 'All'
            ? entries
            : entries.filter(e => e.test_category === selectedCategory);

        // Group by test and user, keep best score
        const bestScores = new Map<string, LeaderboardEntry>();
        filtered.forEach(entry => {
            const key = `${entry.test_id}-${entry.user_id}`;
            const existing = bestScores.get(key);
            if (!existing || entry.percentage > existing.percentage) {
                bestScores.set(key, entry);
            }
        });

        // Sort by percentage descending, then by time ascending
        return Array.from(bestScores.values())
            .sort((a, b) => {
                if (b.percentage !== a.percentage) return b.percentage - a.percentage;
                return a.time_taken_seconds - b.time_taken_seconds;
            })
            .slice(0, 50);
    };

    // Get user's personal best scores
    const getUserBestScores = () => {
        if (!user) return [];

        const userEntries = entries.filter(e => e.user_id === user.id);
        const bestByTest = new Map<string, LeaderboardEntry>();

        userEntries.forEach(entry => {
            const existing = bestByTest.get(entry.test_id);
            if (!existing || entry.percentage > existing.percentage) {
                bestByTest.set(entry.test_id, entry);
            }
        });

        return Array.from(bestByTest.values())
            .sort((a, b) => b.percentage - a.percentage);
    };

    const topScores = getTopScores();
    const userBestScores = getUserBestScores();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading leaderboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/tests')}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Leaderboard
                            </h1>
                            <p className="text-xs text-muted-foreground">Top scores and your progress</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* User Stats Card */}
                {user && userStats && (
                    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Your Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{userStats.total_tests_taken}</div>
                                    <div className="text-xs text-muted-foreground">Tests Taken</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{userStats.average_percentage}%</div>
                                    <div className="text-xs text-muted-foreground">Avg Score</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">{userStats.total_correct}/{userStats.total_questions_answered}</div>
                                    <div className="text-xs text-muted-foreground">Correct Answers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-primary truncate">{userStats.best_category}</div>
                                    <div className="text-xs text-muted-foreground">Best Category</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Tabs defaultValue="global" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="global">Global Leaderboard</TabsTrigger>
                        <TabsTrigger value="personal">My Best Scores</TabsTrigger>
                    </TabsList>

                    <TabsContent value="global" className="space-y-4">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.map(cat => (
                                <Button
                                    key={cat}
                                    variant={selectedCategory === cat ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </Button>
                            ))}
                        </div>

                        {/* Leaderboard Table */}
                        <Card>
                            <CardContent className="p-0">
                                {topScores.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No scores yet. Be the first to complete a test!
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {topScores.map((entry, index) => (
                                            <div
                                                key={entry.id}
                                                className={`flex items-center gap-4 p-4 ${
                                                    user && entry.user_id === user.id ? 'bg-primary/5' : ''
                                                }`}
                                            >
                                                <div className="w-8 text-center">
                                                    {index === 0 ? (
                                                        <Medal className="h-6 w-6 text-yellow-500 mx-auto" />
                                                    ) : index === 1 ? (
                                                        <Medal className="h-6 w-6 text-gray-400 mx-auto" />
                                                    ) : index === 2 ? (
                                                        <Medal className="h-6 w-6 text-amber-600 mx-auto" />
                                                    ) : (
                                                        <span className="text-muted-foreground font-medium">{index + 1}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">
                                                        {entry.test_title}
                                                        {user && entry.user_id === user.id && (
                                                            <span className="ml-2 text-xs text-primary">(You)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>{entry.test_category}</span>
                                                        <span>•</span>
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatTime(entry.time_taken_seconds)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold ${
                                                        entry.percentage >= 80 ? 'text-green-600' :
                                                        entry.percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                                                    }`}>
                                                        {entry.percentage}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.score}/{entry.total_questions}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="personal" className="space-y-4">
                        {!user ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    Please log in to see your scores.
                                </CardContent>
                            </Card>
                        ) : userBestScores.length === 0 ? (
                            <Card>
                                <CardContent className="p-8 text-center text-muted-foreground">
                                    You haven't completed any tests yet. Start practicing!
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-border">
                                        {userBestScores.map((entry) => (
                                            <div key={entry.id} className="flex items-center gap-4 p-4">
                                                <Target className="h-5 w-5 text-primary" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{entry.test_title}</div>
                                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                        <span>{entry.test_category}</span>
                                                        <span>•</span>
                                                        <Clock className="h-3 w-3" />
                                                        <span>{formatTime(entry.time_taken_seconds)}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(entry.completed_at)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold ${
                                                        entry.percentage >= 80 ? 'text-green-600' :
                                                        entry.percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                                                    }`}>
                                                        {entry.percentage}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {entry.score}/{entry.total_questions}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/test/${entry.test_id}`)}
                                                >
                                                    Retry
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Leaderboard;
