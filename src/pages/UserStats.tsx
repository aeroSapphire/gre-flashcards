
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Brain, Loader2, Info } from 'lucide-react';
import { getUserSkills, UserSkill } from '@/services/skillEngine';
import { BrainMap } from '@/components/stats/BrainMap';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UserStats() {
    const navigate = useNavigate();
    const [skills, setSkills] = useState<UserSkill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSkills = async () => {
            try {
                const data = await getUserSkills();
                setSkills(data);
            } catch (error) {
                console.error("Failed to load skills", error);
            } finally {
                setLoading(false);
            }
        };

        loadSkills();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate overall average
    const overallScore = skills.length > 0 
        ? Math.round(skills.reduce((acc, s) => acc + s.mu, 0) / skills.length)
        : 50; // Default if no data

    return (
        <div className="min-h-screen container max-w-5xl mx-auto p-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate('/')}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        Your Mental Model
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        This is how the AI Tutor sees your brain. It adapts in real-time as you practice.
                    </p>
                </div>
                
                <div className="ml-auto flex items-center gap-4 bg-muted/50 p-4 rounded-lg border">
                    <div className="text-right">
                        <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Overall Proficiency</p>
                        <p className="text-3xl font-black text-primary">{overallScore}%</p>
                    </div>
                </div>
            </div>

            {skills.length === 0 ? (
                <Alert className="mb-8">
                    <Info className="h-4 w-4" />
                    <AlertTitle>No Data Yet</AlertTitle>
                    <AlertDescription>
                        Complete some tests or practice sessions to generate your skill map!
                    </AlertDescription>
                </Alert>
            ) : (
                <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-0">
                        <BrainMap skills={skills} />
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>How This Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            <strong>Bayesian Tracking:</strong> The system maintains a probabilistic model of your skills. 
                            It doesn't just count right/wrong; it measures "Surprise". 
                            Getting a hard question right boosts your score more than an easy one.
                        </p>
                        <p>
                            <strong>Uncertainty (Sigma):</strong> The glow around regions represents uncertainty. 
                            If you haven't practiced in a while, the system becomes less sure of your skill, 
                            and the glow expands (sigma increases).
                        </p>
                        <p>
                            <strong>Forgetting Curve:</strong> Your skills naturally decay over time without practice. 
                            Use the "Targeted Practice" to refresh specific lobes of your brain map.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Skill Dimensions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <span className="font-semibold block text-foreground">Logic (Frontal)</span>
                                <span className="text-sm text-muted-foreground">Reasoning, detecting fallacies, and ordering arguments.</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 shrink-0" />
                            <div>
                                <span className="font-semibold block text-foreground">Vocab (Temporal)</span>
                                <span className="text-sm text-muted-foreground">Word knowledge, definitions, and nuance.</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-yellow-500 shrink-0" />
                            <div>
                                <span className="font-semibold block text-foreground">Context (Parietal)</span>
                                <span className="text-sm text-muted-foreground">Reading between the lines and synthesizing information.</span>
                            </div>
                        </div>
                        <div className="flex gap-3 items-start">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                            <div>
                                <span className="font-semibold block text-foreground">Precision (Occipital)</span>
                                <span className="text-sm text-muted-foreground">Attention to detail, spotting polarity shifts and traps.</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
