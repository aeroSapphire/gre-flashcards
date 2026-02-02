import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenLine, GitCompare, Brain, Sparkles, GraduationCap, Trophy, Clock, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReadingComprehensionGuide } from '@/components/verbal/ReadingComprehensionGuide';
import { TextCompletionGuide } from '@/components/verbal/TextCompletionGuide';
import { SentenceEquivalenceGuide } from '@/components/verbal/SentenceEquivalenceGuide';
import { EssentialPatternsGuide } from '@/components/verbal/EssentialPatternsGuide';
import { VerbalSection } from '@/components/verbal/VerbalSection';
import { supabase } from '@/integrations/supabase/client';
import { useGRETest } from '@/hooks/useGRETest';

interface Test {
  id: string;
  title: string;
  category: string;
  description: string;
  time_limit_minutes: number;
}

type SectionType = 'reading' | 'text-completion' | 'sentence-equivalence' | 'patterns' | null;

// Map categories to question types
const CATEGORY_MAP = {
  'reading': ['Reading Comprehension'],
  'text-completion': ['No Shift Sentences', 'Shift Sentences', 'Double Blanks', 'Triple Blanks'],
  'sentence-equivalence': ['Sentence Equivalence'],
};

const VerbalPractice = () => {
  console.log("VerbalPractice mounting");
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionType>(null);
  const [activeGuide, setActiveGuide] = useState<SectionType | 'essential'>(null);
  const { combinedScore, isComplete } = useGRETest();

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
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTestsByType = (type: keyof typeof CATEGORY_MAP) => {
    const categories = CATEGORY_MAP[type];
    return tests.filter(t => categories.includes(t.category));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 animate-bounce" />
          Loading Verbal Hub...
        </div>
      </div>
    );
  }

  // --- Detailed Section Views ---

  if (activeSection === 'reading') {
    return (
      <>
        <VerbalSection
          title="Reading Comprehension"
          icon={BookOpen}
          description="Analyze passages and understand structure and intent."
          tests={getTestsByType('reading')}
          onBack={() => setActiveSection(null)}
          onStartTest={(id) => navigate(`/test/${id}`)}
          onOpenGuide={() => setActiveGuide('reading')}
          extraTools={
            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  RC Pattern Practice
                </CardTitle>
                <CardDescription>
                  Master 12 specific reading comprehension logic patterns.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/verbal/patterns')} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                  Launch Pattern Drills
                </Button>
              </CardContent>
            </Card>
          }
        />
        <ReadingComprehensionGuide open={activeGuide === 'reading'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      </>
    );
  }

  if (activeSection === 'text-completion') {
    return (
      <>
        <VerbalSection
          title="Text Completion"
          icon={PenLine}
          description="Use logic and vocabulary to fill in the blanks."
          tests={getTestsByType('text-completion')}
          onBack={() => setActiveSection(null)}
          onStartTest={(id) => navigate(`/test/${id}`)}
          onOpenGuide={() => setActiveGuide('text-completion')}
        />
        <TextCompletionGuide open={activeGuide === 'text-completion'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      </>
    );
  }

  if (activeSection === 'sentence-equivalence') {
    return (
      <>
        <VerbalSection
          title="Sentence Equivalence"
          icon={GitCompare}
          description="Find synonyms that create equivalent sentences."
          tests={getTestsByType('sentence-equivalence')}
          onBack={() => setActiveSection(null)}
          onStartTest={(id) => navigate(`/test/${id}`)}
          onOpenGuide={() => setActiveGuide('sentence-equivalence')}
        />
        <SentenceEquivalenceGuide open={activeGuide === 'sentence-equivalence'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      </>
    );
  }

  // --- Main Dashboard View ---

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                Verbal Reasoning
              </h1>
              <p className="text-xs text-muted-foreground">Master the three pillars of GRE Verbal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Featured: GRE Practice Test */}
        <Card
          className="relative overflow-hidden cursor-pointer group border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/50 transition-all"
          onClick={() => navigate('/gre-test')}
        >
          <div className="absolute top-0 right-0 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-full h-full" />
          </div>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-primary text-primary-foreground">
                FEATURED
              </span>
            </div>
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              Try GRE Test: Verbal Section
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Take a full-length GRE Verbal Reasoning practice test with timed sections and get your estimated GRE score (130-170).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" />
                <span>35 Questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>41 Minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4" />
                <span>GRE Score Estimate</span>
              </div>
            </div>
            {isComplete && combinedScore && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 dark:text-green-400">Your Best Score</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    {combinedScore.greScore.scaled}/170
                  </span>
                </div>
              </div>
            )}
            <Button className="group-hover:bg-primary/90">
              {isComplete ? 'View Results' : 'Start Practice Test'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Hero / Intro */}
        <section className="text-center space-y-4 py-4">
          <h2 className="text-3xl font-bold tracking-tight">Choose your focus area</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The verbal section tests your ability to analyze written material and recognize relationships among words and concepts.
          </p>
        </section>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Reading Comprehension Card */}
          <Card
            className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-blue-500"
            onClick={() => setActiveSection('reading')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="h-24 w-24" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Reading Comprehension</CardTitle>
              <CardDescription>
                Long & short passages testing deep understanding.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                {getTestsByType('reading').length} Tests Available
              </div>
            </CardContent>
          </Card>

          {/* Text Completion Card */}
          <Card
            className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-amber-500"
            onClick={() => setActiveSection('text-completion')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <PenLine className="h-24 w-24" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <PenLine className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Text Completion</CardTitle>
              <CardDescription>
                Fill-in-the-blank questions with 1-3 blanks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                {getTestsByType('text-completion').length} Tests Available
              </div>
            </CardContent>
          </Card>

          {/* Sentence Equivalence Card */}
          <Card
            className="group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer border-t-4 border-t-purple-500"
            onClick={() => setActiveSection('sentence-equivalence')}
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <GitCompare className="h-24 w-24" />
            </div>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                <GitCompare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Sentence Equivalence</CardTitle>
              <CardDescription>
                Find synonyms that complete the sentence similarly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-muted-foreground">
                {getTestsByType('sentence-equivalence').length} Tests Available
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Essential Patterns
              </CardTitle>
              <CardDescription>
                Master the core logic patterns that appear across all verbal question types.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => setActiveGuide('essential')}>
                Open Pattern Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50 border-transparent">
            <CardHeader>
              <CardTitle className="text-base text-muted-foreground">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold">{tests.length}</div>
                <div className="text-xs text-muted-foreground">Total Tests</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-xs text-muted-foreground">Question Types</div>
              </div>
            </CardContent>
          </Card>
        </div>

      </main>

      {/* Global Guides */}
      <EssentialPatternsGuide open={activeGuide === 'essential'} onOpenChange={(o) => !o && setActiveGuide(null)} />
    </div>
  );
};

export default VerbalPractice;
