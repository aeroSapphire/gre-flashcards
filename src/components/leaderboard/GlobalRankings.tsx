import { Card, CardContent } from '@/components/ui/card';
import { UserRanking } from '@/hooks/useLeaderboard';
import { User, Trophy } from 'lucide-react';
import { RankBadge } from './RankBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GlobalRankingsProps {
    rankings: UserRanking[];
}

export const GlobalRankings = ({ rankings }: GlobalRankingsProps) => {
    const { user } = useAuth();

    if (rankings.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mb-4 opacity-20" />
                    <p>No rankings yet.</p>
                    <p className="text-sm">Be the first to complete a test!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full">
                    <div className="divide-y divide-border/50">
                        {rankings.map((entry, index) => {
                            const isCurrentUser = user && entry.user_id === user.id;
                            return (
                                <div
                                    key={entry.user_id}
                                    className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 ${isCurrentUser ? 'bg-primary/5 hover:bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                        <RankBadge index={index} />
                                    </div>

                                    <div className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${isCurrentUser ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}
                  `}>
                                        <User className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-medium truncate ${isCurrentUser ? 'text-primary' : 'text-foreground'}`}>
                                                {entry.display_name}
                                            </span>
                                            {isCurrentUser && (
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70 bg-primary/10 px-1.5 py-0.5 rounded">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                            <span>{entry.tests_taken} tests</span>
                                            <span>•</span>
                                            <span>{entry.total_correct} correct</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className={`text-lg font-bold tabular-nums ${entry.avg_percentage >= 80 ? 'text-emerald-500' :
                                                entry.avg_percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
                                            }`}>
                                            {entry.avg_percentage}%
                                        </div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
