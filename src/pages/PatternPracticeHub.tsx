import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ModuleCard } from '@/components/patterns/ModuleCard';
import { RC_PATTERNS, TIERS, getProgress, getModulesByTier } from '@/data/rcPatterns';
import { cn } from '@/lib/utils';

const tierColorClasses = {
  blue: {
    border: 'border-blue-500/30',
    bg: 'from-blue-500/5',
    icon: 'text-blue-500',
    iconBg: 'bg-blue-500/10'
  },
  purple: {
    border: 'border-purple-500/30',
    bg: 'from-purple-500/5',
    icon: 'text-purple-500',
    iconBg: 'bg-purple-500/10'
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'from-amber-500/5',
    icon: 'text-amber-500',
    iconBg: 'bg-amber-500/10'
  }
};

const PatternPracticeHub = () => {
  const navigate = useNavigate();
  const progress = getProgress();

  const completedCount = progress.completedModules.length;
  const totalModules = RC_PATTERNS.length;
  const progressPercent = Math.round((completedCount / totalModules) * 100);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/verbal')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-display text-xl font-semibold text-foreground">
                RC Pattern Practice
              </h1>
              <p className="text-xs text-muted-foreground">
                Master 12 reading comprehension patterns
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                Your Progress
              </CardTitle>
              <span className="text-sm font-medium">
                {completedCount}/{totalModules} modules
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercent === 100
                ? 'Congratulations! You\'ve completed all modules.'
                : progressPercent > 0
                  ? `${progressPercent}% complete. Keep going!`
                  : 'Start with Tier 1 to build your foundation.'}
            </p>
          </CardContent>
        </Card>

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm leading-relaxed">
            GRE passages are constructed using a finite set of verbal and logical patterns.
            Mastering these patterns transforms reading comprehension from an intuitive guessing
            game into a systematic, predictable exercise. Work through each tier to build
            your pattern recognition skills.
          </p>
        </div>

        {/* Tier Sections */}
        {TIERS.map((tier) => {
          const modules = getModulesByTier(tier.tier);
          const tierCompleted = modules.filter(m =>
            progress.completedModules.includes(m.id)
          ).length;
          const colors = tierColorClasses[tier.color as keyof typeof tierColorClasses];

          return (
            <section key={tier.tier} className="mb-8">
              <Card className={cn('mb-4', colors.border, `bg-gradient-to-br ${colors.bg} to-transparent`)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg', colors.iconBg)}>
                      <BookOpen className={cn('h-5 w-5', colors.icon)} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        Tier {tier.tier}: {tier.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {tierCompleted}/{modules.length} completed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-3 sm:grid-cols-2">
                {modules.map((module) => (
                  <ModuleCard
                    key={module.id}
                    id={module.id}
                    title={module.title}
                    tier={module.tier}
                    isCompleted={progress.completedModules.includes(module.id)}
                    score={progress.scores[module.id]}
                    totalQuestions={module.questions.length}
                    onClick={() => navigate(`/verbal/patterns/${module.id}`)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

export default PatternPracticeHub;
