import { ArrowLeft, BookOpen, Play, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LucideIcon } from 'lucide-react';

interface Test {
    id: string;
    title: string;
    description: string;
    time_limit_minutes: number;
    category: string;
}

interface VerbalSectionProps {
    title: string;
    icon: LucideIcon;
    description: string;
    tests: Test[];
    onBack: () => void;
    onStartTest: (testId: string) => void;
    onOpenGuide?: () => void;
    extraTools?: React.ReactNode;
}

export const VerbalSection = ({
    title,
    icon: Icon,
    description,
    tests,
    onBack,
    onStartTest,
    onOpenGuide,
    extraTools
}: VerbalSectionProps) => {
    return (
        <div className="min-h-screen bg-background animate-in slide-in-from-right duration-300">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                                <Icon className="h-6 w-6 text-primary" />
                                {title}
                            </h1>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto px-4 py-8">
                <Tabs defaultValue="practice" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                        <TabsTrigger value="practice">Practice Tests</TabsTrigger>
                        <TabsTrigger value="strategies">Strategies & Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="practice" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold tracking-tight">Available Tests</h2>
                            <span className="text-sm text-muted-foreground">{tests.length} tests</span>
                        </div>

                        {tests.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center text-muted-foreground">
                                    No practice tests available for this section yet.
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {tests.map((test) => (
                                    <Card key={test.id} className="hover:border-primary/50 transition-all cursor-pointer group" onClick={() => onStartTest(test.id)}>
                                        <div className="flex items-center p-4">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                                <Play className="h-4 w-4 text-primary fill-current" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate">{test.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1">{test.description}</p>
                                            </div>
                                            <div className="text-xs text-muted-foreground font-mono ml-4 whitespace-nowrap">
                                                {test.time_limit_minutes} min
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="strategies" className="space-y-6">
                        {/* Guide Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-blue-500" />
                                    Official Strategy Guide
                                </CardTitle>
                                <CardDescription>
                                    Learn the core methods and traps for {title}.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={onOpenGuide} variant="outline" className="w-full sm:w-auto">
                                    Open Guide
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Extra Tools (e.g. Patterns) */}
                        {extraTools}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};
