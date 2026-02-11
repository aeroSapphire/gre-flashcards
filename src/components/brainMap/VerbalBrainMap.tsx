import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, Target, BookOpen, ChevronDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BrainMap } from '@/data/brainMapSchema';
import { SKILLS, CATEGORY_DISPLAY, SkillCategory, getSkillsByCategory } from '@/data/skillTaxonomy';
import { getMasteryLevel } from '@/utils/brainMap';
import { estimateScoreFromBrainMap } from '@/utils/scoreEstimation';

interface VerbalBrainMapProps {
  brainMap: BrainMap;
  onPracticeSkill?: (skillId: string) => void;
  onReviewLesson?: (skillId: string) => void;
  onTakeTest?: (category: string) => void;
}

const MASTERY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  foundation: { bg: "bg-red-500/10", text: "text-red-500", border: "border-red-500/30" },
  developing: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/30" },
  competent: { bg: "bg-yellow-500/10", text: "text-yellow-500", border: "border-yellow-500/30" },
  advanced: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/30" },
  expert: { bg: "bg-purple-500/10", text: "text-purple-500", border: "border-purple-500/30" },
};

const TREND_ICONS = {
  improving: TrendingUp,
  stable: Minus,
  declining: TrendingDown,
};

export function VerbalBrainMap({ brainMap, onPracticeSkill, onReviewLesson, onTakeTest }: VerbalBrainMapProps) {
  const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const scoreEstimate = useMemo(() => estimateScoreFromBrainMap(brainMap), [brainMap]);

  const categories: SkillCategory[] = ['reading_comprehension', 'text_completion', 'sentence_equivalence'];

  const getCategoryStats = (category: SkillCategory) => {
    const skills = getSkillsByCategory(category);
    const masteries = skills.map(s => brainMap.skills[s.id]?.mastery || 0);
    const avg = masteries.length > 0 ? masteries.reduce((a, b) => a + b, 0) / masteries.length : 0;
    const practiced = skills.filter(s => brainMap.skills[s.id]?.questionsSeen > 0).length;
    const lessonsComplete = skills.filter(s => brainMap.lessonsCompleted[s.id]).length;
    return { avg, practiced, total: skills.length, lessonsComplete };
  };

  // Weak and strong skills
  const weakSkills = useMemo(() => {
    return Object.values(brainMap.skills)
      .filter(s => s.questionsSeen > 0 && !s.skillId.startsWith('TRAP-') && s.mastery < 0.5)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5);
  }, [brainMap]);

  const strongSkills = useMemo(() => {
    return Object.values(brainMap.skills)
      .filter(s => s.questionsSeen > 0 && !s.skillId.startsWith('TRAP-') && s.mastery >= 0.7)
      .sort((a, b) => b.mastery - a.mastery)
      .slice(0, 5);
  }, [brainMap]);

  // Trap vulnerability
  const trapStats = useMemo(() => {
    return Object.entries(brainMap.trapProfile)
      .filter(([_, t]) => t.fallenFor + t.avoided > 0)
      .map(([id, t]) => ({
        id,
        name: SKILLS[id]?.name || id,
        vulnerability: t.fallenFor / (t.fallenFor + t.avoided),
        total: t.fallenFor + t.avoided
      }))
      .sort((a, b) => b.vulnerability - a.vulnerability);
  }, [brainMap]);

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-xl p-4 sm:p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1">Estimated GRE Verbal</p>
          <p className="text-4xl font-black text-primary">{scoreEstimate.score}</p>
          <p className="text-xs text-muted-foreground mt-1">+/- {scoreEstimate.confidenceInterval}</p>
          <p className="text-xs mt-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-block">
            {scoreEstimate.band}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1">RC Score</p>
          <p className="text-3xl font-bold">{brainMap.estimatedScore.rc}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6 text-center">
          <p className="text-xs text-muted-foreground mb-1">TC / SE</p>
          <p className="text-3xl font-bold">
            {brainMap.estimatedScore.tc} / {brainMap.estimatedScore.se}
          </p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="space-y-3">
        {categories.map(category => {
          const info = CATEGORY_DISPLAY[category];
          const stats = getCategoryStats(category);
          const isExpanded = expandedCategory === category;
          const skills = getSkillsByCategory(category);

          return (
            <div key={category} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", `bg-${info.color}-500`)} />
                  <div className="text-left">
                    <p className="font-semibold">{info.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {stats.lessonsComplete}/{stats.total} lessons | {stats.practiced}/{stats.total} practiced
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold">{Math.round(stats.avg * 100)}%</p>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </button>

              {/* Expanded Skills */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-3 space-y-2">
                      {skills.map(skill => {
                        const mastery = brainMap.skills[skill.id];
                        const level = mastery ? getMasteryLevel(mastery.mastery) : 'foundation';
                        const colors = MASTERY_COLORS[level];
                        const TrendIcon = mastery ? TREND_ICONS[mastery.trend] : Minus;

                        return (
                          <div
                            key={skill.id}
                            onClick={() => setSelectedSkill(selectedSkill === skill.id ? null : skill.id)}
                            className={cn(
                              "p-3 rounded-lg border cursor-pointer transition-all",
                              selectedSkill === skill.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-sm font-medium truncate">{skill.name}</span>
                                <span className={cn("text-xs px-1.5 py-0.5 rounded-full capitalize", colors.bg, colors.text)}>
                                  {level}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <TrendIcon className={cn(
                                  "h-3 w-3",
                                  mastery?.trend === 'improving' && "text-success",
                                  mastery?.trend === 'declining' && "text-destructive",
                                  mastery?.trend === 'stable' && "text-muted-foreground"
                                )} />
                                <span className="text-sm font-bold">{Math.round((mastery?.mastery || 0) * 100)}%</span>
                              </div>
                            </div>

                            {/* Expanded skill detail */}
                            {selectedSkill === skill.id && mastery && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                className="mt-3 pt-3 border-t border-border space-y-2"
                              >
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>Questions Seen: <span className="font-bold">{mastery.questionsSeen}</span></div>
                                  <div>Correct: <span className="font-bold">{mastery.correct}</span></div>
                                  <div>Streak: <span className="font-bold">{mastery.streak}</span></div>
                                  <div>Difficulty: <span className="font-bold">{mastery.currentDifficulty.toFixed(1)}</span></div>
                                </div>

                                {/* Accuracy by difficulty */}
                                <div className="space-y-1">
                                  {[1, 2, 3, 4, 5].map(level => {
                                    const d = mastery.accuracyByDifficulty[level];
                                    if (!d || d.seen === 0) return null;
                                    const acc = d.correct / d.seen;
                                    return (
                                      <div key={level} className="flex items-center gap-2 text-xs">
                                        <span className="w-10 text-muted-foreground">Lvl {level}</span>
                                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className={cn("h-full rounded-full", acc >= 0.7 ? "bg-success" : acc >= 0.4 ? "bg-yellow-500" : "bg-destructive")}
                                            style={{ width: `${acc * 100}%` }}
                                          />
                                        </div>
                                        <span className="w-16 text-right">{Math.round(acc * 100)}% ({d.correct}/{d.seen})</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                  {onReviewLesson && (
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onReviewLesson(skill.id); }}>
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      Lesson
                                    </Button>
                                  )}
                                  {onPracticeSkill && (
                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); onPracticeSkill(skill.id); }}>
                                      <Target className="h-3 w-3 mr-1" />
                                      Practice
                                    </Button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}

                      {onTakeTest && (
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => onTakeTest(category)}
                        >
                          Take {info.shortLabel} Test
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            Strengths
          </h4>
          {strongSkills.length > 0 ? (
            <div className="space-y-2">
              {strongSkills.map(s => (
                <div key={s.skillId} className="flex items-center justify-between text-sm">
                  <span className="truncate">{SKILLS[s.skillId]?.name}</span>
                  <span className="font-bold text-success">{Math.round(s.mastery * 100)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Practice more to discover your strengths.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
            Needs Work
          </h4>
          {weakSkills.length > 0 ? (
            <div className="space-y-2">
              {weakSkills.map(s => (
                <div key={s.skillId} className="flex items-center justify-between text-sm">
                  <span className="truncate">{SKILLS[s.skillId]?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-destructive">{Math.round(s.mastery * 100)}%</span>
                    {onPracticeSkill && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => onPracticeSkill(s.skillId)}>
                        Practice
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No weak areas identified yet.</p>
          )}
        </div>
      </div>

      {/* Trap Vulnerability */}
      {trapStats.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-3">Trap Vulnerability</h4>
          <div className="space-y-2">
            {trapStats.map(trap => (
              <div key={trap.id} className="flex items-center gap-3">
                <span className="text-sm min-w-0 truncate flex-1">{trap.name}</span>
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${trap.vulnerability * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {Math.round(trap.vulnerability * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
