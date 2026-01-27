import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Clock, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

const TestDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const { data, error } = await supabase
                .from('tests')
                .select('*')
                .order('title');

            if (error) throw error;
            setTests(data || []);
        } catch (error: any) {
            toast({
                title: 'Error loading tests',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
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
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
                {testsByCategory.map((category) => (
                    <div key={category.name}>
                        <h2 className="text-lg font-semibold mb-4 text-foreground">{category.name}</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {category.tests.map((test) => (
                                <Card key={test.id} className="hover:border-primary/50 transition-colors">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{test.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1 text-xs">
                                            <Clock className="h-3 w-3" />
                                            {test.time_limit_minutes} minutes
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {test.description}
                                        </p>
                                        <Button className="w-full" onClick={() => startTest(test.id)}>
                                            <Play className="h-4 w-4 mr-2" />
                                            Start Test
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
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
