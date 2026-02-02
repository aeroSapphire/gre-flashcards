import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Info, Clock, FileText, Trophy, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GREScoreCard } from '@/components/gre/GREScoreCard';
import { GRESectionCard } from '@/components/gre/GRESectionCard';
import { useGRETest, GRE_PRACTICE_TEST_1 } from '@/hooks/useGRETest';
import { formatTime } from '@/utils/greScoring';

const GRETestHub = () => {
  const navigate = useNavigate();
  const {
    sections,
    attempts,
    combinedScore,
    isComplete,
    loading,
    error,
    previousAttempts,
  } = useGRETest();

  const section2 = sections.find(s => s.id === GRE_PRACTICE_TEST_1.SECTION_2);
  const section3 = sections.find(s => s.id === GRE_PRACTICE_TEST_1.SECTION_3);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 animate-bounce" />
          Loading GRE Practice Test...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/verbal')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Verbal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/verbal')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                GRE Practice Test 1
              </h1>
              <p className="text-xs text-muted-foreground">Full Verbal Reasoning Sections</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Test Overview */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>About This Practice Test</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>
              This practice test simulates the real GRE Verbal Reasoning experience with two timed sections.
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>35 total questions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>41 minutes total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-primary" />
                <span>GRE Score: 130-170</span>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="test" className="space-y-6">
          <TabsList>
            <TabsTrigger value="test">Test Sections</TabsTrigger>
            <TabsTrigger value="history">
              <History className="h-4 w-4 mr-1.5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test" className="space-y-6">
            {/* Combined Score Card - Shows when both sections complete */}
            {isComplete && combinedScore && (
              <div className="grid gap-6 md:grid-cols-2">
                <GREScoreCard
                  score={combinedScore.greScore}
                  rawScore={combinedScore.rawScore}
                  totalQuestions={combinedScore.totalQuestions}
                />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Test Complete!</CardTitle>
                    <CardDescription>
                      You've completed both verbal sections.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">Section 2</div>
                        <div className="font-semibold">
                          {attempts.section2?.score}/{attempts.section2?.total_questions}
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-sm text-muted-foreground">Section 3</div>
                        <div className="font-semibold">
                          {attempts.section3?.score}/{attempts.section3?.total_questions}
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => navigate('/gre-test/results')}
                    >
                      View Detailed Results
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Section Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              {section2 && (
                <GRESectionCard
                  sectionNumber={2}
                  title={section2.title}
                  questionCount={section2.question_count}
                  timeLimitMinutes={section2.time_limit_minutes}
                  testId={section2.id}
                  attempt={attempts.section2}
                  onStart={() => navigate(`/test/${section2.id}`)}
                  onReview={() => navigate(`/test/${section2.id}/results`)}
                />
              )}
              {section3 && (
                <GRESectionCard
                  sectionNumber={3}
                  title={section3.title}
                  questionCount={section3.question_count}
                  timeLimitMinutes={section3.time_limit_minutes}
                  testId={section3.id}
                  attempt={attempts.section3}
                  onStart={() => navigate(`/test/${section3.id}`)}
                  onReview={() => navigate(`/test/${section3.id}/results`)}
                />
              )}
            </div>

            {/* Question Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Question Types</CardTitle>
                <CardDescription>What to expect in each section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-2">Section 2 (15 questions)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reading Comprehension (2 passages, 6 questions)</li>
                      <li>• Text Completion (5 questions)</li>
                      <li>• Sentence Equivalence (3 questions)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Section 3 (20 questions)</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Reading Comprehension (3 passages, 8 questions)</li>
                      <li>• Text Completion (5 questions)</li>
                      <li>• Sentence Equivalence (4 questions)</li>
                      <li>• Critical Reasoning (2 questions)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {previousAttempts.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No previous attempts yet.</p>
                  <p className="text-sm mt-1">Complete a section to see your history here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {previousAttempts.map((attempt, index) => {
                  const section = sections.find(s => s.id === attempt.test_id);
                  const percentage = Math.round((attempt.score / attempt.total_questions) * 100);

                  return (
                    <Card key={attempt.id} className="hover:bg-muted/20 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {section?.title || 'Unknown Section'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(attempt.completed_at).toLocaleDateString()} at{' '}
                              {new Date(attempt.completed_at).toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">
                              {attempt.score}/{attempt.total_questions}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {percentage}% • {formatTime(attempt.time_taken_seconds)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GRETestHub;
