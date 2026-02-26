import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, Clock, FileText, GraduationCap,
  ChevronRight, Library, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_TEST_REGISTRY, getMockTestsBySource } from '@/data/mockTests';
import type { MockTestRegistryEntry } from '@/data/mockTests';

const MockTestBrowser = () => {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState<string | 'all'>('all');

  const testsBySource = useMemo(() => getMockTestsBySource(), []);
  const sources = useMemo(() => Object.keys(testsBySource), [testsBySource]);

  const filteredTests = useMemo(() => {
    if (selectedSource === 'all') return MOCK_TEST_REGISTRY;
    return testsBySource[selectedSource] || [];
  }, [selectedSource, testsBySource]);

  const handleStartTest = (testId: string) => {
    navigate(`/mock-tests/${testId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                <Library className="h-6 w-6 text-primary" />
                Practice Tests
              </h1>
              <p className="text-xs text-muted-foreground">
                Full-length GRE mock tests from leading prep books
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Source filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedSource === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedSource('all')}
          >
            All Sources ({MOCK_TEST_REGISTRY.length})
          </Button>
          {sources.map(source => (
            <Button
              key={source}
              variant={selectedSource === source ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSource(source)}
            >
              {testsBySource[source][0]?.sourceShort || source} ({testsBySource[source].length})
            </Button>
          ))}
        </div>

        {/* Test list */}
        <div className="grid gap-4">
          {filteredTests.map(test => (
            <TestCard key={test.id} test={test} onStart={() => handleStartTest(test.id)} />
          ))}
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tests available for this source.</p>
          </div>
        )}
      </main>
    </div>
  );
};

function TestCard({ test, onStart }: { test: MockTestRegistryEntry; onStart: () => void }) {
  const hours = Math.floor(test.totalTimeMinutes / 60);
  const mins = test.totalTimeMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <Card className="hover:border-primary/40 transition-colors cursor-pointer group" onClick={onStart}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {test.name}
            </CardTitle>
            <CardDescription className="mt-1">{test.description}</CardDescription>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors mt-1 flex-shrink-0" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 text-sm">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            {test.sourceShort}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            {test.questionCount} questions
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeStr}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            {test.sectionCount} sections
          </Badge>
          {test.format === 'old' && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Classic Format
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MockTestBrowser;
