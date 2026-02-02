import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonalBest } from '@/hooks/useLeaderboard';
import { Target, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PersonalBestsProps {
    personalBests: PersonalBest[];
}

export const PersonalBests = ({ personalBests }: PersonalBestsProps) => {
    const navigate = useNavigate();

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (personalBests.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
                    <p>No personal records yet.</p>
                    <Button
                        variant="link"
                        onClick={() => navigate('/tests')}
                        className="mt-2"
                    >
                        Start a test to set a record
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full">
                    <div className="divide-y divide-border/50">
                        {personalBests.map((entry) => (
                            <div key={entry.test_id} className="group flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Target className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate text-foreground">{entry.test_title}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                                            {entry.test_category}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(entry.time_taken_seconds)}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right mr-4">
                                    <div className={`text-lg font-bold tabular-nums ${entry.percentage >= 80 ? 'text-emerald-500' :
                                            entry.percentage >= 60 ? 'text-amber-500' : 'text-rose-500'
                                        }`}>
                                        {entry.percentage}%
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/test/${entry.test_id}`)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Retry Test"
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};
