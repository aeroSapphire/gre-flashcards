
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Lightbulb, ArrowRight } from 'lucide-react';
import { getMistakeHistory } from '@/services/mistakeService';
import { generateDailyNudge } from '@/services/mistakeAnalysis';

export const DailyTutor = () => {
    const navigate = useNavigate();
    const [nudge, setNudge] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNudge = async () => {
            try {
                // Check if we already have a stored nudge for today in localStorage
                // to prevent re-calculating or changing it during the day
                const today = new Date().toISOString().split('T')[0];
                const stored = localStorage.getItem('daily_tutor_nudge');
                
                if (stored) {
                    const { date, text } = JSON.parse(stored);
                    if (date === today) {
                        setNudge(text);
                        setLoading(false);
                        return;
                    }
                }

                // Calculate new nudge
                const history = await getMistakeHistory();
                const newNudge = generateDailyNudge(history);

                if (newNudge) {
                    setNudge(newNudge);
                    localStorage.setItem('daily_tutor_nudge', JSON.stringify({
                        date: today,
                        text: newNudge
                    }));
                }
            } catch (error) {
                console.error('Failed to load tutor nudge:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNudge();
    }, []);

    if (loading || !nudge) return null;

    return (
        <Card className="bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 mb-6">
            <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <CardTitle className="text-lg text-violet-900 dark:text-violet-100">
                    Daily Tutor Insight
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-3 mb-4">
                    <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-violet-800 dark:text-violet-200 leading-relaxed font-medium">
                        {nudge}
                    </p>
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                    onClick={() => navigate('/practice-weakness')}
                >
                    Practice This Weakness <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </CardContent>
        </Card>
    );
};
