import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserStats } from '@/hooks/useLeaderboard';
import { Trophy, Target, CheckCircle, Brain } from 'lucide-react';

interface LeaderboardStatsProps {
    stats: UserStats;
}

export const LeaderboardStats = ({ stats }: LeaderboardStatsProps) => {
    return (
        <Card className="bg-gradient-to-br from-card to-secondary/10 border-border/50 shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Your Performance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Target className="h-3.5 w-3.5" />
                            <span>Tests Taken</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.total_tests_taken}</div>
                    </div>

                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>Avg accuracy</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">{stats.average_percentage}%</div>
                    </div>

                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Trophy className="h-3.5 w-3.5" />
                            <span>Correct Answers</span>
                        </div>
                        <div className="text-2xl font-bold text-foreground">
                            {stats.total_correct}
                            <span className="text-sm text-muted-foreground font-normal ml-1">
                                / {stats.total_questions_answered}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                            <Brain className="h-3.5 w-3.5" />
                            <span>Best Category</span>
                        </div>
                        <div className="text-lg font-bold text-foreground truncate" title={stats.best_category}>
                            {stats.best_category}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
