import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LearnSection } from '@/components/patterns/LearnSection';
import { QuizSection } from '@/components/patterns/QuizSection';
import { getModuleById, markModuleCompleted } from '@/data/rcPatterns';
import { cn } from '@/lib/utils';

const tierColors = {
  1: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  2: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  3: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
};

const PatternModule = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const module = moduleId ? getModuleById(moduleId) : undefined;

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Module not found</h1>
          <p className="text-muted-foreground mb-4">
            The requested pattern module doesn't exist.
          </p>
          <Button onClick={() => navigate('/verbal/patterns')}>
            Back to Patterns
          </Button>
        </div>
      </div>
    );
  }

  const handleQuizComplete = (score: number) => {
    markModuleCompleted(module.id, score);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/verbal/patterns')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className={cn('text-xs', tierColors[module.tier])}>
                  Tier {module.tier}
                </Badge>
              </div>
              <h1 className="font-display text-lg font-semibold text-foreground truncate">
                {module.title}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="learn" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="learn" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <PenLine className="h-4 w-4" />
              Practice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="learn">
            <LearnSection module={module} />
          </TabsContent>

          <TabsContent value="practice">
            <QuizSection
              questions={module.questions}
              onComplete={handleQuizComplete}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PatternModule;
