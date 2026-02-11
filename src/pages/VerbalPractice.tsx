import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, PenLine, GitCompare, Brain, GraduationCap, Trophy,
  Target, Zap, ArrowRight, Lightbulb, BarChart3, Sparkles,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Data & hooks
import { useBrainMap } from '@/hooks/useBrainMap';
import { SKILLS, CATEGORY_DISPLAY, SkillCategory, getSkillsByCategory } from '@/data/skillTaxonomy';
import { LESSONS, LESSON_ORDER } from '@/data/lessons';
import { QuestionType } from '@/data/questionSchema';
import { BrainMap } from '@/data/brainMapSchema';
import { generateStudyPlan, StudyRecommendation } from '@/utils/studyPlan';
import { estimateScoreFromBrainMap } from '@/utils/scoreEstimation';
import { generateTest, scoreTest, TestAnswer, TestResult, GeneratedTest } from '@/utils/testEngine';
import { initializeBrainMap } from '@/utils/brainMap';

// Components
import { VerbalBrainMap } from '@/components/brainMap/VerbalBrainMap';
import { LessonList } from '@/components/lessons/LessonList';
import { LessonView } from '@/components/lessons/LessonView';
import { PracticeSessionView } from '@/components/practice/PracticeSession';
import { TestTaking } from '@/components/tests/TestTaking';
import { TestResultsView } from '@/components/tests/TestResultsView';
import { MockTestFlow } from '@/components/tests/MockTestFlow';

// Existing guides (keep backwards compatibility)
import { ReadingComprehensionGuide } from '@/components/verbal/ReadingComprehensionGuide';
import { TextCompletionGuide } from '@/components/verbal/TextCompletionGuide';
import { SentenceEquivalenceGuide } from '@/components/verbal/SentenceEquivalenceGuide';
import { EssentialPatternsGuide } from '@/components/verbal/EssentialPatternsGuide';

type ViewMode =
  | 'dashboard'
  | 'brainmap'
  | 'lessons'
  | 'lesson-detail'
  | 'practice'
  | 'test-setup'
  | 'test-taking'
  | 'test-results'
  | 'category-detail'
  | 'mock-test';

type GuideType = 'reading' | 'text-completion' | 'sentence-equivalence' | 'essential' | null;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  reading_comprehension: BookOpen,
  text_completion: PenLine,
  sentence_equivalence: GitCompare,
};

const CATEGORY_COLORS: Record<string, string> = {
  reading_comprehension: 'blue',
  text_completion: 'amber',
  sentence_equivalence: 'purple',
};

const VerbalPractice = () => {
  const navigate = useNavigate();
  const { brainMap, completeLesson, resetBrainMap, isLoaded } = useBrainMap();
  const [currentBrainMap, setCurrentBrainMap] = useState<BrainMap | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<GuideType>(null);

  // Test state
  const [activeTest, setActiveTest] = useState<GeneratedTest | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);

  // Use the live brain map from the hook, but allow local overrides during sessions
  const activeBrainMap = currentBrainMap || brainMap || initializeBrainMap('anon');

  const scoreEstimate = useMemo(
    () => estimateScoreFromBrainMap(activeBrainMap),
    [activeBrainMap]
  );

  const studyPlan = useMemo(
    () => generateStudyPlan(activeBrainMap),
    [activeBrainMap]
  );

  // Keep currentBrainMap in sync with hook's brainMap
  const syncBrainMap = useCallback(() => {
    if (brainMap) setCurrentBrainMap(null); // Reset override to use hook value
  }, [brainMap]);

  // -- Handlers --

  const handleSelectLesson = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
    setViewMode('lesson-detail');
  }, []);

  const handleCompleteLesson = useCallback((quickCheckScore: number) => {
    if (selectedSkillId) {
      completeLesson(selectedSkillId, quickCheckScore);
    }
  }, [selectedSkillId, completeLesson]);

  const handleStartPractice = useCallback((skillId: string) => {
    setSelectedSkillId(skillId);
    setViewMode('practice');
  }, []);

  const handleUpdateBrainMap = useCallback((updated: BrainMap) => {
    setCurrentBrainMap(updated);
  }, []);

  const handleStartTest = useCallback(async (category: SkillCategory) => {
    const typeMap: Record<string, QuestionType> = {
      reading_comprehension: 'reading_comprehension',
      text_completion: 'text_completion',
      sentence_equivalence: 'sentence_equivalence',
    };
    const qType = typeMap[category];
    if (!qType) return;

    const test = await generateTest({
      category: qType,
      questionCount: 10,
      brainMap: activeBrainMap,
    });
    setActiveTest(test);
    setTestQuestions(test.questions);
    setViewMode('test-taking');
  }, [activeBrainMap]);

  const handleSubmitTest = useCallback((answers: TestAnswer[]) => {
    if (!activeTest) return;
    const { result, updatedBrainMap } = scoreTest(activeTest, answers, activeBrainMap);
    setTestResult(result);
    setCurrentBrainMap(updatedBrainMap);
    setViewMode('test-results');
  }, [activeTest, activeBrainMap]);

  const handleGoBack = useCallback(() => {
    if (viewMode === 'lesson-detail' || viewMode === 'practice') {
      if (selectedCategory) {
        setViewMode('category-detail');
      } else {
        setViewMode('lessons');
      }
      setSelectedSkillId(null);
      syncBrainMap();
    } else if (viewMode === 'category-detail') {
      setViewMode('dashboard');
      setSelectedCategory(null);
    } else if (viewMode === 'test-results') {
      setViewMode('dashboard');
      setActiveTest(null);
      setTestResult(null);
      syncBrainMap();
    } else if (viewMode === 'test-taking') {
      setViewMode('dashboard');
      setActiveTest(null);
    } else {
      setViewMode('dashboard');
      setSelectedSkillId(null);
      setSelectedCategory(null);
      syncBrainMap();
    }
  }, [viewMode, selectedCategory, syncBrainMap]);

  const handleRecommendationClick = useCallback((rec: StudyRecommendation) => {
    if (rec.type === 'lesson' && rec.skillId) {
      handleSelectLesson(rec.skillId);
    } else if (rec.type === 'practice' && rec.skillId) {
      handleStartPractice(rec.skillId);
    } else if (rec.type === 'test' && rec.category) {
      handleStartTest(rec.category as SkillCategory);
    } else if (rec.type === 'review' && rec.skillId) {
      handleStartPractice(rec.skillId);
    }
  }, [handleSelectLesson, handleStartPractice, handleStartTest]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground flex items-center gap-2">
          <Brain className="h-5 w-5 animate-bounce" />
          Loading Verbal Hub...
        </div>
      </div>
    );
  }

  // -- Lesson Detail View --
  if (viewMode === 'lesson-detail' && selectedSkillId) {
    const lesson = LESSONS[selectedSkillId];
    if (!lesson) return <div>Lesson not found</div>;

    return (
      <LessonView
        lesson={lesson}
        isCompleted={!!activeBrainMap.lessonsCompleted[selectedSkillId]}
        onComplete={handleCompleteLesson}
        onExit={handleGoBack}
        onPractice={() => handleStartPractice(selectedSkillId)}
      />
    );
  }

  // -- Practice View --
  if (viewMode === 'practice' && selectedSkillId) {
    return (
      <div className="min-h-screen bg-background py-4">
        <PracticeSessionView
          skillId={selectedSkillId}
          brainMap={activeBrainMap}
          onUpdateBrainMap={handleUpdateBrainMap}
          onExit={handleGoBack}
          onReviewLesson={(id) => {
            setSelectedSkillId(id);
            setViewMode('lesson-detail');
          }}
        />
      </div>
    );
  }

  // -- Test Taking View --
  if (viewMode === 'test-taking' && activeTest) {
    return (
      <div className="min-h-screen bg-background py-4">
        <TestTaking
          test={activeTest}
          onSubmit={handleSubmitTest}
          onExit={handleGoBack}
        />
      </div>
    );
  }

  // -- Test Results View --
  if (viewMode === 'test-results' && testResult) {
    return (
      <div className="min-h-screen bg-background py-4">
        <TestResultsView
          result={testResult}
          questions={testQuestions}
          onExit={handleGoBack}
          onRetakeTest={() => {
            if (activeTest) {
              handleStartTest(activeTest.category === 'reading_comprehension' ? 'reading_comprehension'
                : activeTest.category === 'text_completion' ? 'text_completion'
                : 'sentence_equivalence');
            }
          }}
          onGoToBrainMap={() => setViewMode('brainmap')}
          onPracticeSkill={handleStartPractice}
          onReviewLesson={handleSelectLesson}
        />
      </div>
    );
  }

  // -- Mock Test View --
  if (viewMode === 'mock-test') {
    return (
      <MockTestFlow
        brainMap={activeBrainMap}
        onUpdateBrainMap={handleUpdateBrainMap}
        onExit={handleGoBack}
        onPracticeSkill={handleStartPractice}
        onReviewLesson={handleSelectLesson}
      />
    );
  }

  // -- Brain Map View --
  if (viewMode === 'brainmap') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Brain Map
                </h1>
                <p className="text-xs text-muted-foreground">Your skill profile</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-3 sm:px-4 py-6">
          <VerbalBrainMap
            brainMap={activeBrainMap}
            onPracticeSkill={handleStartPractice}
            onReviewLesson={handleSelectLesson}
            onTakeTest={(cat) => handleStartTest(cat as SkillCategory)}
          />
        </main>
      </div>
    );
  }

  // -- Lessons List View --
  if (viewMode === 'lessons') {
    const categories: SkillCategory[] = ['reading_comprehension', 'text_completion', 'sentence_equivalence'];
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Pattern Lessons
                </h1>
                <p className="text-xs text-muted-foreground">Learn the core verbal patterns</p>
              </div>
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-8">
          {categories.map(category => {
            const lessons = Object.values(LESSONS).filter(l => l.category === category);
            const order = LESSON_ORDER[category] || [];
            return (
              <LessonList
                key={category}
                lessons={lessons}
                lessonOrder={order}
                category={category}
                brainMap={activeBrainMap}
                onSelectLesson={handleSelectLesson}
              />
            );
          })}
        </main>
      </div>
    );
  }

  // -- Category Detail View --
  if (viewMode === 'category-detail' && selectedCategory) {
    const info = CATEGORY_DISPLAY[selectedCategory];
    const Icon = CATEGORY_ICONS[selectedCategory] || Target;
    const color = CATEGORY_COLORS[selectedCategory] || 'blue';
    const skills = getSkillsByCategory(selectedCategory);
    const lessons = Object.values(LESSONS).filter(l => l.category === selectedCategory);
    const order = LESSON_ORDER[selectedCategory] || [];
    const completedLessons = skills.filter(s => activeBrainMap.lessonsCompleted[s.id]).length;
    const practicedSkills = skills.filter(s => activeBrainMap.skills[s.id]?.questionsSeen > 0).length;
    const avgMastery = skills.length > 0
      ? skills.reduce((sum, s) => sum + (activeBrainMap.skills[s.id]?.mastery || 0), 0) / skills.length
      : 0;

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleGoBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Icon className={`h-5 w-5 text-${color}-500`} />
                  {info?.label || selectedCategory}
                </h1>
                <p className="text-xs text-muted-foreground">{skills.length} skills to master</p>
              </div>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">
          {/* Stats overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{Math.round(avgMastery * 100)}%</p>
              <p className="text-xs text-muted-foreground">Avg Mastery</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{completedLessons}/{skills.length}</p>
              <p className="text-xs text-muted-foreground">Lessons Done</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{practicedSkills}/{skills.length}</p>
              <p className="text-xs text-muted-foreground">Skills Practiced</p>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-3"
              onClick={() => {
                // Find weakest skill in category for smart practice
                const weakest = skills
                  .filter(s => activeBrainMap.lessonsCompleted[s.id])
                  .sort((a, b) => (activeBrainMap.skills[a.id]?.mastery || 0) - (activeBrainMap.skills[b.id]?.mastery || 0));
                if (weakest.length > 0) {
                  handleStartPractice(weakest[0].id);
                }
              }}
            >
              <Target className="h-4 w-4 mr-2" />
              Smart Practice
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3"
              onClick={() => handleStartTest(selectedCategory)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Take Section Test
            </Button>
          </div>

          {/* Lessons */}
          <LessonList
            lessons={lessons}
            lessonOrder={order}
            category={selectedCategory}
            brainMap={activeBrainMap}
            onSelectLesson={handleSelectLesson}
          />

          {/* Per-skill practice */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Practice by Skill</h3>
            <div className="space-y-2">
              {skills.map(skill => {
                const mastery = activeBrainMap.skills[skill.id];
                const lessonDone = !!activeBrainMap.lessonsCompleted[skill.id];
                const masteryPct = mastery ? Math.round(mastery.mastery * 100) : 0;

                return (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{skill.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${masteryPct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{masteryPct}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-3">
                      {!lessonDone && (
                        <Button variant="ghost" size="sm" onClick={() => handleSelectLesson(skill.id)}>
                          <BookOpen className="h-3.5 w-3.5 mr-1" />
                          Lesson
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleStartPractice(skill.id)}
                        disabled={!lessonDone}
                      >
                        <Target className="h-3.5 w-3.5 mr-1" />
                        Practice
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // -- Main Dashboard View --
  const categories: SkillCategory[] = ['reading_comprehension', 'text_completion', 'sentence_equivalence'];
  const totalLessons = Object.keys(LESSONS).filter(id => !id.startsWith('TRAP-')).length;
  const completedLessonsCount = Object.keys(activeBrainMap.lessonsCompleted).length;
  const totalPracticedSkills = Object.values(activeBrainMap.skills).filter(s => s.questionsSeen > 0).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-5xl mx-auto px-3 sm:px-4 py-4">
          <div className="flex items-center justify-between">
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
            <Button variant="outline" size="sm" onClick={() => setViewMode('brainmap')}>
              <Brain className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Brain Map</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-3 sm:px-4 py-6 space-y-6">

        {/* Score & Progress Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
            <p className="text-xs text-muted-foreground mb-1">Est. GRE Verbal</p>
            <p className="text-3xl font-black text-primary">{scoreEstimate.score}</p>
            <p className="text-xs text-muted-foreground">+/- {scoreEstimate.confidenceInterval}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <BookOpen className="h-5 w-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold">{completedLessonsCount}/{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Lessons</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <Target className="h-5 w-5 text-orange-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{totalPracticedSkills}</p>
            <p className="text-xs text-muted-foreground">Skills Practiced</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <BarChart3 className="h-5 w-5 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold">{activeBrainMap.testHistory.length}</p>
            <p className="text-xs text-muted-foreground">Tests Taken</p>
          </div>
        </div>

        {/* Today's Plan */}
        {studyPlan.today.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Today's Plan
              </CardTitle>
              <CardDescription className="text-xs">{studyPlan.overallMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {studyPlan.today.map((rec, i) => (
                <button
                  key={i}
                  onClick={() => handleRecommendationClick(rec)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    rec.type === 'lesson' && "bg-primary/10",
                    rec.type === 'practice' && "bg-orange-500/10",
                    rec.type === 'test' && "bg-green-500/10",
                    rec.type === 'review' && "bg-blue-500/10",
                  )}>
                    {rec.type === 'lesson' && <BookOpen className="h-4 w-4 text-primary" />}
                    {rec.type === 'practice' && <Target className="h-4 w-4 text-orange-500" />}
                    {rec.type === 'test' && <FileText className="h-4 w-4 text-green-500" />}
                    {rec.type === 'review' && <Zap className="h-4 w-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{rec.description}</p>
                    <p className="text-xs text-muted-foreground">{rec.estimatedMinutes} min</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Focus Areas (Category Cards) */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Focus Areas</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map(category => {
              const info = CATEGORY_DISPLAY[category];
              const Icon = CATEGORY_ICONS[category] || Target;
              const color = CATEGORY_COLORS[category];
              const skills = getSkillsByCategory(category);
              const completedLessons = skills.filter(s => activeBrainMap.lessonsCompleted[s.id]).length;
              const avgMastery = skills.length > 0
                ? skills.reduce((sum, s) => sum + (activeBrainMap.skills[s.id]?.mastery || 0), 0) / skills.length
                : 0;

              return (
                <Card
                  key={category}
                  className={cn(
                    "group relative overflow-hidden hover:shadow-lg transition-all cursor-pointer border-t-4",
                    `border-t-${color}-500`
                  )}
                  onClick={() => {
                    setSelectedCategory(category);
                    setViewMode('category-detail');
                  }}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Icon className="h-20 w-20" />
                  </div>
                  <CardHeader className="pb-2">
                    <div className={`h-10 w-10 rounded-lg bg-${color}-500/10 flex items-center justify-center mb-2`}>
                      <Icon className={`h-5 w-5 text-${color}-500`} />
                    </div>
                    <CardTitle className="text-lg">{info?.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Mastery</span>
                        <span className="font-bold">{Math.round(avgMastery * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${color}-500 rounded-full transition-all`}
                          style={{ width: `${avgMastery * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {completedLessons}/{skills.length} lessons | {skills.filter(s => activeBrainMap.skills[s.id]?.questionsSeen > 0).length}/{skills.length} practiced
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setViewMode('brainmap')}
            >
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-sm">Brain Map</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setViewMode('lessons')}
            >
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-sm">All Lessons</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2"
              onClick={() => {
                // Smart practice: pick weakest skill
                const practiced = Object.entries(activeBrainMap.skills)
                  .filter(([id, s]) => s.questionsSeen > 0 && !id.startsWith('TRAP-'))
                  .sort(([, a], [, b]) => a.mastery - b.mastery);
                if (practiced.length > 0) {
                  handleStartPractice(practiced[0][0]);
                } else {
                  // No skills practiced yet, start with first lesson
                  setViewMode('lessons');
                }
              }}
            >
              <Sparkles className="h-5 w-5 text-orange-500" />
              <span className="text-sm">Smart Practice</span>
            </Button>
          </div>
        </section>

        {/* Mock Test CTA */}
        <Card
          className="relative overflow-hidden cursor-pointer group border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/50 transition-all"
          onClick={() => setViewMode('mock-test')}
        >
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy className="w-full h-full" />
          </div>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              GRE Mock Test
            </CardTitle>
            <CardDescription>
              Take a full 2-section adaptive mock test and get your estimated GRE score (130-170).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="group-hover:bg-primary/90">
              Start Mock Test
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* Essential Patterns (legacy) */}
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Essential Patterns Guide
            </CardTitle>
            <CardDescription className="text-xs">
              Quick reference for core logic patterns across all verbal question types.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setActiveGuide('essential')}>
              Open Pattern Guide
            </Button>
          </CardContent>
        </Card>

      </main>

      {/* Guides (modals) */}
      <EssentialPatternsGuide open={activeGuide === 'essential'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      <ReadingComprehensionGuide open={activeGuide === 'reading'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      <TextCompletionGuide open={activeGuide === 'text-completion'} onOpenChange={(o) => !o && setActiveGuide(null)} />
      <SentenceEquivalenceGuide open={activeGuide === 'sentence-equivalence'} onOpenChange={(o) => !o && setActiveGuide(null)} />
    </div>
  );
};

export default VerbalPractice;
