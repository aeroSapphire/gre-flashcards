import { motion } from 'framer-motion';
import { Trophy, Target, Zap, TrendingUp, TrendingDown, BookOpen, RotateCcw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SKILLS } from '@/data/skillTaxonomy';
import { PracticeSessionSummary } from '@/utils/practiceEngine';
import { getMasteryLevel } from '@/utils/brainMap';

interface PracticeResultsProps {
  summary: PracticeSessionSummary;
  onExit: () => void;
  onReviewLesson?: () => void;
  onPracticeAgain: () => void;
}

export function PracticeResults({ summary, onExit, onReviewLesson, onPracticeAgain }: PracticeResultsProps) {
  const skill = SKILLS[summary.skillId];
  const masteryChange = summary.masteryAfter - summary.masteryBefore;
  const masteryIncreased = masteryChange > 0;
  const levelAfter = getMasteryLevel(summary.masteryAfter);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto px-4 py-8"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Practice Complete!</h2>
        <p className="text-muted-foreground">{skill?.name || summary.skillId}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Target className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-xl font-bold">{summary.correctCount}/{summary.totalQuestions}</p>
          <p className="text-xs text-muted-foreground">Correct</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <Zap className="h-5 w-5 text-orange-500 mx-auto mb-1" />
          <p className="text-xl font-bold">{summary.maxStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          {masteryIncreased ? (
            <TrendingUp className="h-5 w-5 text-success mx-auto mb-1" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive mx-auto mb-1" />
          )}
          <p className="text-xl font-bold">{Math.round(summary.accuracy * 100)}%</p>
          <p className="text-xs text-muted-foreground">Accuracy</p>
        </div>
      </div>

      {/* Mastery Change */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Mastery</span>
          <span className="text-sm capitalize text-primary font-medium">{levelAfter}</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
            initial={{ width: `${summary.masteryBefore * 100}%` }}
            animate={{ width: `${summary.masteryAfter * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(summary.masteryBefore * 100)}%</span>
          <span className={masteryIncreased ? "text-success" : "text-destructive"}>
            {masteryIncreased ? "+" : ""}{Math.round(masteryChange * 100)}%
          </span>
          <span>{Math.round(summary.masteryAfter * 100)}%</span>
        </div>
      </div>

      {/* Suggestion */}
      {summary.shouldReviewLesson && onReviewLesson && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Review Recommended</p>
              <p className="text-xs text-muted-foreground mb-3">
                You had 3+ incorrect answers in a row. Reviewing the lesson may help.
              </p>
              <Button variant="outline" size="sm" onClick={onReviewLesson}>
                <BookOpen className="h-4 w-4 mr-2" />
                Review Lesson
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={onPracticeAgain} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Practice Again
        </Button>
        <Button variant="outline" onClick={onExit} className="w-full">
          <ArrowRight className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      </div>
    </motion.div>
  );
}
