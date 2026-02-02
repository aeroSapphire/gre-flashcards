
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardStats } from '@/components/leaderboard/LeaderboardStats';
import { GlobalRankings } from '@/components/leaderboard/GlobalRankings';
import { PersonalBests } from '@/components/leaderboard/PersonalBests';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { data, isLoading } = useLeaderboard();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground flex items-center gap-2">
                    <Trophy className="h-5 w-5 animate-bounce" />
                    Loading leaderboard...
                </div>
            </div>
        );
    }

    const { rankings = [], userStats, personalBests = [] } = data || {};

    return (
        <div className="min-h-screen bg-background/95">
            <header className="sticky top-0 z-10 border-b border-border/40 bg-background/80 backdrop-blur-md">
                <div className="container max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/tests')} className="rounded-full">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Leaderboard
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* User Stats Section */}
                {user && userStats && (
                    <section>
                        <LeaderboardStats stats={userStats} />
                    </section>
                )}

                {/* Rankings Tabs */}
                <section>
                    <Tabs defaultValue="global" className="w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold tracking-tight">Rankings</h2>
                            <TabsList className="bg-muted/50 p-1">
                                <TabsTrigger value="global" className="text-xs">Global</TabsTrigger>
                                <TabsTrigger value="personal" className="text-xs">Personal Best</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="global" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <GlobalRankings rankings={rankings} />
                        </TabsContent>

                        <TabsContent value="personal" className="m-0 focus-visible:outline-none focus-visible:ring-0">
                            <PersonalBests personalBests={personalBests} />
                        </TabsContent>
                    </Tabs>
                </section>
            </main>
        </div>
    );
};

export default Leaderboard;
