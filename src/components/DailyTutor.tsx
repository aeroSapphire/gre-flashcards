
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Lightbulb, ArrowRight, Target, TrendingUp, GraduationCap } from 'lucide-react';
import { getMistakeHistory } from '@/services/mistakeService';
import { generateDailyNudge } from '@/services/mistakeAnalysis';
import { useCurriculumStatus } from '@/hooks/useCurriculumStatus';
import { getSkillDisplayName } from '@/services/skillEngine';

export const DailyTutor = () => {
    const navigate = useNavigate();
    const [legacyNudge, setLegacyNudge] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { status: curriculumStatus, loading: curriculumLoading } = useCurriculumStatus();

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
                        setLegacyNudge(text);
                        setLoading(false);
                        return;
                    }
                }

                // Calculate new nudge from mistake analysis (as fallback)
                const history = await getMistakeHistory();
                const newNudge = generateDailyNudge(history);

                if (newNudge) {
                    setLegacyNudge(newNudge);
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

    // Show loading state while curriculum loads
    if (loading && curriculumLoading) return null;

    // Fresh User Welcome
    if (curriculumStatus && curriculumStatus.totalQuestions === 0) {
        return (
            <Card className="bg-primary/5 border-primary/20 mb-6">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <CardTitle className="text-xl text-primary">
                            Welcome to GRE Tutor
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        I'm your personal AI tutor. To create your custom curriculum, I need to understand your current strengths and weaknesses.
                    </p>
                    <div className="bg-background p-4 rounded-lg border">
                        <p className="font-medium text-sm mb-1">Step 1: Initial Assessment</p>
                        <p className="text-xs text-muted-foreground">
                            Take a short test to set your baseline skill levels.
                        </p>
                    </div>
                    <Button 
                        className="w-full" 
                        size="lg"
                        onClick={() => navigate('/tests')}
                    >
                        Start Diagnostic Test <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Use curriculum status if available, otherwise fall back to legacy nudge
    const hasCurriculumData = curriculumStatus && curriculumStatus.totalQuestions > 0;

    // Don't show anything if we have no data at all
    if (!hasCurriculumData && !legacyNudge) return null;

    // Curriculum-aware display
    if (hasCurriculumData) {
        const { currentPhase, phaseName, phaseProgress, dominantWeakness, recommendation } = curriculumStatus;
        const skillName = dominantWeakness ? getSkillDisplayName(dominantWeakness) : null;

        return (
            <Card className="bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 mb-6">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <CardTitle className="text-lg text-violet-900 dark:text-violet-100">
                                Learning Path
                            </CardTitle>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-violet-200 dark:bg-violet-800 text-violet-700 dark:text-violet-300">
                            Phase {currentPhase}
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Phase Progress */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-violet-800 dark:text-violet-200">
                                {phaseName}
                            </span>
                            <span className="text-xs text-violet-600 dark:text-violet-400">
                                {phaseProgress}% complete
                            </span>
                        </div>
                        <Progress value={phaseProgress} className="h-2" />
                    </div>

                    {/* Priority Focus */}
                    {skillName && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-100/50 dark:bg-violet-900/30">
                            <Target className="h-5 w-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                                    Focus: {skillName}
                                </p>
                                <p className="text-xs text-violet-600 dark:text-violet-400 mt-0.5">
                                    {recommendation.reason}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Recommendation Action */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-violet-300 dark:border-violet-700 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-violet-700 dark:text-violet-300"
                        onClick={() => {
                            if (recommendation.type === 'test') {
                                navigate('/tests');
                            } else if (recommendation.type === 'weakness_practice') {
                                navigate('/practice-weakness');
                            } else {
                                navigate('/tests');
                            }
                        }}
                    >
                        {recommendation.type === 'test' ? (
                            <>Take a Test <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : recommendation.type === 'weakness_practice' ? (
                            <>Practice This Skill <ArrowRight className="ml-2 h-4 w-4" /></>
                        ) : (
                            <>Continue Practice <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    // Legacy nudge display (fallback when no curriculum data)
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
                        {legacyNudge}
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
