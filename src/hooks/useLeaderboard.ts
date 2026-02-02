import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserRanking {
    user_id: string;
    display_name: string;
    tests_taken: number;
    total_correct: number;
    total_questions: number;
    avg_percentage: number;
    best_score: number;
    avg_time: number;
}

export interface PersonalBest {
    test_id: string;
    test_title: string;
    test_category: string;
    score: number;
    total_questions: number;
    percentage: number;
    time_taken_seconds: number;
    completed_at: string;
}

export interface UserStats {
    total_tests_taken: number;
    total_questions_answered: number;
    total_correct: number;
    average_percentage: number;
    best_category: string;
}

export const useLeaderboard = () => {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['leaderboard', user?.id],
        queryFn: async () => {
            // Fetch all test attempts
            const { data: attempts, error: attemptsError } = await supabase
                .from('user_test_attempts')
                .select('user_id, test_id, score, total_questions, time_taken_seconds, completed_at');

            if (attemptsError) throw attemptsError;

            // Fetch all profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, display_name');

            if (profilesError) throw profilesError;

            // Fetch all tests
            const { data: tests } = await supabase
                .from('tests')
                .select('id, title, category');

            const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
            const testMap = new Map(tests?.map(t => [t.id, t]) || []);

            // Aggregate by user
            const userAggregates = new Map<string, {
                tests_taken: number;
                total_correct: number;
                total_questions: number;
                best_score: number;
                total_time: number;
            }>();

            (attempts || []).forEach(a => {
                const existing = userAggregates.get(a.user_id) || {
                    tests_taken: 0,
                    total_correct: 0,
                    total_questions: 0,
                    best_score: 0,
                    total_time: 0
                };

                const percentage = Math.round((a.score / a.total_questions) * 100);

                userAggregates.set(a.user_id, {
                    tests_taken: existing.tests_taken + 1,
                    total_correct: existing.total_correct + a.score,
                    total_questions: existing.total_questions + a.total_questions,
                    best_score: Math.max(existing.best_score, percentage),
                    total_time: existing.total_time + a.time_taken_seconds
                });
            });

            // Convert to rankings array
            const rankingsArray: UserRanking[] = Array.from(userAggregates.entries()).map(([userId, stats]) => ({
                user_id: userId,
                display_name: profileMap.get(userId) || 'Anonymous',
                tests_taken: stats.tests_taken,
                total_correct: stats.total_correct,
                total_questions: stats.total_questions,
                avg_percentage: Math.round((stats.total_correct / stats.total_questions) * 100),
                best_score: stats.best_score,
                avg_time: Math.round(stats.total_time / stats.tests_taken)
            }));

            // Sort by average percentage (descending), then by tests taken (descending)
            rankingsArray.sort((a, b) => {
                if (b.avg_percentage !== a.avg_percentage) return b.avg_percentage - a.avg_percentage;
                return b.tests_taken - a.tests_taken;
            });

            let userStats: UserStats | null = null;
            let personalBests: PersonalBest[] = [];

            // Calculate current user stats and personal bests
            if (user) {
                const userAttempts = (attempts || []).filter(a => a.user_id === user.id);

                if (userAttempts.length > 0) {
                    const totalQuestions = userAttempts.reduce((sum, a) => sum + a.total_questions, 0);
                    const totalCorrect = userAttempts.reduce((sum, a) => sum + a.score, 0);

                    // Calculate best category
                    const categoryScores: Record<string, { correct: number; total: number }> = {};
                    userAttempts.forEach(a => {
                        const test = testMap.get(a.test_id);
                        const category = test?.category || 'Unknown';
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

                    userStats = {
                        total_tests_taken: userAttempts.length,
                        total_questions_answered: totalQuestions,
                        total_correct: totalCorrect,
                        average_percentage: Math.round((totalCorrect / totalQuestions) * 100),
                        best_category: bestCategory
                    };

                    // Get personal bests (best score per test)
                    const bestByTest = new Map<string, PersonalBest>();
                    userAttempts.forEach(a => {
                        const test = testMap.get(a.test_id);
                        const percentage = Math.round((a.score / a.total_questions) * 100);
                        const existing = bestByTest.get(a.test_id);

                        if (!existing || percentage > existing.percentage) {
                            bestByTest.set(a.test_id, {
                                test_id: a.test_id,
                                test_title: test?.title || 'Unknown Test',
                                test_category: test?.category || 'Unknown',
                                score: a.score,
                                total_questions: a.total_questions,
                                percentage,
                                time_taken_seconds: a.time_taken_seconds,
                                completed_at: a.completed_at
                            });
                        }
                    });

                    personalBests = Array.from(bestByTest.values()).sort((a, b) => b.percentage - a.percentage);
                }
            }

            return { rankings: rankingsArray, userStats, personalBests };
        }
    });
};
