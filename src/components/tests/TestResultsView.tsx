import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, AlertTriangle, BookOpen, ArrowRight, RotateCcw, Brain, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TestResult, getTestRecommendations } from '@/utils/testEngine';
import { SKILLS } from '@/data/skillTaxonomy';
import { getScoreBand } from '@/utils/scoreEstimation';
import { Question } from '@/data/questionSchema';

interface TestResultsViewProps {
  result: TestResult;
  questions: Question[];
  onExit: () => void;
  onRetakeTest: () => void;
  onGoToBrainMap?: () => void;
  onPracticeSkill?: (skillId: string) => void;
  onReviewLesson?: (skillId: string) => void;
}

export function TestResultsView({
  result,
  questions,
  onExit,
  onRetakeTest,
  onGoToBrainMap,
  onPracticeSkill,
  onReviewLesson
}: TestResultsViewProps) {
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const recommendations = getTestRecommendations(result);
  const band = getScoreBand(result.estimatedGre);
  const accuracy = result.score.total > 0 ? Math.round((result.score.correct / result.score.total) * 100) : 0;

  const questionMap = new Map(questions.map(q => [q.id, q]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-3 sm:px-4 py-6"
    >
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Test Results</h2>
        <p className="text-4xl font-black text-primary">{result.score.correct}/{result.score.total}</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="text-lg font-semibold">Est. GRE: {result.estimatedGre} +/- {result.confidenceInterval}</span>
        </div>
        <span className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary mt-2 inline-block">
          {band.label} ({band.percentile}th percentile)
        </span>
      </div>

      {/* Skill Breakdown */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-4">Skill Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(result.skillBreakdown)
            .filter(([id]) => !id.startsWith('TRAP-'))
            .sort(([, a], [, b]) => (a.seen > 0 ? a.correct / a.seen : 0) - (b.seen > 0 ? b.correct / b.seen : 0))
            .map(([skillId, data]) => {
              const skillAccuracy = data.seen > 0 ? data.correct / data.seen : 0;
              const isWeak = skillAccuracy < 0.5;
              const isStrong = skillAccuracy === 1;

              return (
                <div key={skillId} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{SKILLS[skillId]?.name || skillId}</span>
                      <span className={cn(
                        "text-sm font-bold",
                        isStrong && "text-success",
                        isWeak && "text-destructive",
                        !isStrong && !isWeak && "text-foreground"
                      )}>
                        {data.correct}/{data.seen}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          isStrong && "bg-success",
                          isWeak && "bg-destructive",
                          !isStrong && !isWeak && "bg-primary"
                        )}
                        style={{ width: `${skillAccuracy * 100}%` }}
                      />
                    </div>
                  </div>
                  {isWeak && onPracticeSkill && (
                    <Button variant="ghost" size="sm" className="shrink-0 text-xs" onClick={() => onPracticeSkill(skillId)}>
                      Practice
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Traps Fallen For */}
      {result.trapsFallenFor.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Traps You Fell For</h3>
          </div>
          <div className="space-y-2">
            {[...new Set(result.trapsFallenFor)].map(trapId => (
              <div key={trapId} className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">*</span>
                <div>
                  <p className="text-sm font-medium">{SKILLS[trapId]?.name || trapId}</p>
                  <p className="text-xs text-muted-foreground">{SKILLS[trapId]?.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-6">
        <h3 className="font-semibold mb-3">Recommended Next Steps</h3>
        <p className="text-sm text-muted-foreground mb-4">{recommendations.message}</p>
        <div className="space-y-2">
          {recommendations.reviewLessons.map(skillId => (
            <div key={skillId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span className="text-sm">Review: {SKILLS[skillId]?.name}</span>
              </div>
              {onReviewLesson && (
                <Button variant="ghost" size="sm" onClick={() => onReviewLesson(skillId)}>Go</Button>
              )}
            </div>
          ))}
          {recommendations.practiceSkills.map(skillId => (
            <div key={skillId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Practice: {SKILLS[skillId]?.name}</span>
              </div>
              {onPracticeSkill && (
                <Button variant="ghost" size="sm" onClick={() => onPracticeSkill(skillId)}>Go</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Review Questions Toggle */}
      <div className="mb-6">
        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowAllQuestions(!showAllQuestions)}
        >
          <span>Review All Questions</span>
          {showAllQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showAllQuestions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="space-y-3 mt-3"
          >
            {result.answers.map((answer, i) => {
              const question = questionMap.get(answer.questionId);
              if (!question) return null;

              return (
                <div key={answer.questionId} className={cn(
                  "p-3 rounded-lg border",
                  answer.correct ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5"
                )}>
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                      answer.correct ? "bg-success text-white" : "bg-destructive text-white"
                    )}>
                      {answer.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">Q{i + 1}: {question.stem.slice(0, 100)}...</p>
                      <p className="text-xs text-muted-foreground">{question.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button onClick={onRetakeTest} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Take Another Test
        </Button>
        {onGoToBrainMap && (
          <Button variant="outline" onClick={onGoToBrainMap} className="w-full">
            <Brain className="h-4 w-4 mr-2" />
            View Brain Map
          </Button>
        )}
        <Button variant="ghost" onClick={onExit} className="w-full">
          Back to Menu
        </Button>
      </div>
    </motion.div>
  );
}
