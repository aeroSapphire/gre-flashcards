import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, PenLine, GitCompare, Play, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionTypeCard } from '@/components/verbal/QuestionTypeCard';
import { ReadingComprehensionGuide } from '@/components/verbal/ReadingComprehensionGuide';
import { TextCompletionGuide } from '@/components/verbal/TextCompletionGuide';
import { SentenceEquivalenceGuide } from '@/components/verbal/SentenceEquivalenceGuide';
import { EssentialPatternsGuide } from '@/components/verbal/EssentialPatternsGuide';
import { supabase } from '@/integrations/supabase/client';

interface Test {
  id: string;
  title: string;
  category: string;
  description: string;
  time_limit_minutes: number;
}

type GuideType = 'reading' | 'text-completion' | 'sentence-equivalence' | 'essential-patterns' | null;

// Map categories to question types
const CATEGORY_MAP = {
  'reading': ['Reading Comprehension'],
  'text-completion': ['No Shift Sentences', 'Shift Sentences', 'Double Blanks', 'Triple Blanks'],
  'sentence-equivalence': ['Sentence Equivalence'],
};

const VerbalPractice = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGuide, setOpenGuide] = useState<GuideType>(null);
  const [selectedType, setSelectedType] = useState<keyof typeof CATEGORY_MAP | null>(null);

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

  const handlePractice = (type: keyof typeof CATEGORY_MAP) => {
    setSelectedType(type);
  };

  const handleBackToTypes = () => {
    setSelectedType(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show filtered tests for selected type
  if (selectedType) {
    const filteredTests = getTestsByType(selectedType);
    const typeLabels = {
      'reading': 'Reading Comprehension',
      'text-completion': 'Text Completion',
      'sentence-equivalence': 'Sentence Equivalence',
    };

    return (
      <div className="min-h-screen">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBackToTypes}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground">
                  {typeLabels[selectedType]} Practice
                </h1>
                <p className="text-xs text-muted-foreground">{filteredTests.length} tests available</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-4xl mx-auto px-4 py-8">
          {filteredTests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No practice tests available for this category yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTests.map((test) => (
                <Card key={test.id} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{test.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {test.category} · {test.time_limit_minutes} min
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {test.description}
                    </p>
                    <Button className="w-full" onClick={() => navigate(`/test/${test.id}`)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Main hub view
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                GRE Verbal Reasoning
              </h1>
              <p className="text-xs text-muted-foreground">Master the three question types</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <p className="text-muted-foreground">
            The GRE Verbal Reasoning section measures your ability to analyze and evaluate written material,
            synthesize information, and recognize relationships among component parts of sentences.
            Master these three question types to excel on test day.
          </p>
        </div>

        {/* Essential Patterns Card */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Essential Verbal Patterns</CardTitle>
                <CardDescription>
                  Master the key patterns that appear across all verbal question types
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Learn passage structures, logical signal words, sentence equivalence pairs, and how to avoid trap answers.
              These patterns will help you recognize question structures and answer more confidently.
            </p>
            <Button onClick={() => setOpenGuide('essential-patterns')}>
              <BookOpen className="h-4 w-4 mr-2" />
              Study Patterns
            </Button>
          </CardContent>
        </Card>

        {/* Question Type Cards */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <QuestionTypeCard
            icon={BookOpen}
            title="Reading Comprehension"
            description="Analyze passages and answer questions about meaning, structure, and author's intent."
            testCount={getTestsByType('reading').length}
            onLearn={() => setOpenGuide('reading')}
            onPractice={() => handlePractice('reading')}
          />

          <QuestionTypeCard
            icon={PenLine}
            title="Text Completion"
            description="Fill in blanks with words that complete passages coherently and meaningfully."
            testCount={getTestsByType('text-completion').length}
            onLearn={() => setOpenGuide('text-completion')}
            onPractice={() => handlePractice('text-completion')}
          />

          <QuestionTypeCard
            icon={GitCompare}
            title="Sentence Equivalence"
            description="Select two answers that create sentences with equivalent meanings."
            testCount={getTestsByType('sentence-equivalence').length}
            onLearn={() => setOpenGuide('sentence-equivalence')}
            onPractice={() => handlePractice('sentence-equivalence')}
          />
        </div>

        {/* Overview Section */}
        <div className="mt-12">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4">
            About Verbal Reasoning
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Section Format</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>Two 27-question sections</li>
                  <li>41 minutes per section</li>
                  <li>Mix of all three question types</li>
                  <li>Score range: 130-170</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Key Skills</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>Vocabulary in context</li>
                  <li>Critical reasoning</li>
                  <li>Sentence structure analysis</li>
                  <li>Understanding complex ideas</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Guide Dialogs */}
      <ReadingComprehensionGuide
        open={openGuide === 'reading'}
        onOpenChange={(open) => !open && setOpenGuide(null)}
      />
      <TextCompletionGuide
        open={openGuide === 'text-completion'}
        onOpenChange={(open) => !open && setOpenGuide(null)}
      />
      <SentenceEquivalenceGuide
        open={openGuide === 'sentence-equivalence'}
        onOpenChange={(open) => !open && setOpenGuide(null)}
      />
      <EssentialPatternsGuide
        open={openGuide === 'essential-patterns'}
        onOpenChange={(open) => !open && setOpenGuide(null)}
      />
    </div>
  );
};

export default VerbalPractice;
