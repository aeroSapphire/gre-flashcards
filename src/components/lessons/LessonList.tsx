import { motion } from 'framer-motion';
import { BookOpen, Check, Lock, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SKILLS, CATEGORY_DISPLAY, SkillCategory } from '@/data/skillTaxonomy';
import { BrainMap } from '@/data/brainMapSchema';

interface Lesson {
  skillId: string;
  title: string;
  category: string;
  estimatedMinutes: number;
  prerequisiteSkills: string[];
}

interface LessonListProps {
  lessons: Lesson[];
  lessonOrder: string[];
  category: SkillCategory;
  brainMap: BrainMap;
  onSelectLesson: (skillId: string) => void;
}

export function LessonList({ lessons, lessonOrder, category, brainMap, onSelectLesson }: LessonListProps) {
  const categoryInfo = CATEGORY_DISPLAY[category];
  const lessonsCompleted = brainMap.lessonsCompleted;

  const orderedLessons = lessonOrder
    .map(skillId => lessons.find(l => l.skillId === skillId))
    .filter(Boolean) as Lesson[];

  const isLessonUnlocked = (lesson: Lesson): boolean => {
    if (lesson.prerequisiteSkills.length === 0) return true;
    return lesson.prerequisiteSkills.every(preReq => lessonsCompleted[preReq]);
  };

  const completedCount = orderedLessons.filter(l => lessonsCompleted[l.skillId]).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{categoryInfo?.label || category}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount}/{orderedLessons.length} lessons completed
          </p>
        </div>
        <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(completedCount / Math.max(orderedLessons.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Lesson cards */}
      <div className="space-y-2">
        {orderedLessons.map((lesson, index) => {
          const isCompleted = !!lessonsCompleted[lesson.skillId];
          const unlocked = isLessonUnlocked(lesson);
          const skill = SKILLS[lesson.skillId];
          const mastery = brainMap.skills[lesson.skillId]?.mastery || 0;

          return (
            <motion.div
              key={lesson.skillId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => unlocked && onSelectLesson(lesson.skillId)}
                disabled={!unlocked}
                className={cn(
                  "w-full flex items-center gap-3 p-3 sm:p-4 rounded-xl border transition-all text-left",
                  isCompleted && "border-success/30 bg-success/5",
                  !isCompleted && unlocked && "border-border hover:border-primary/50 cursor-pointer",
                  !unlocked && "border-border opacity-50 cursor-not-allowed"
                )}
              >
                {/* Status icon */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  isCompleted && "bg-success/20",
                  !isCompleted && unlocked && "bg-primary/10",
                  !unlocked && "bg-muted"
                )}>
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : !unlocked ? (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <BookOpen className="h-5 w-5 text-primary" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">{index + 1}.</span>
                    <span className="text-sm font-medium truncate">{lesson.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {skill?.description?.slice(0, 80)}...
                  </p>
                  {isCompleted && mastery > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{ width: `${mastery * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(mastery * 100)}%</span>
                    </div>
                  )}
                </div>

                {/* Duration and arrow */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {lesson.estimatedMinutes}m
                  </div>
                  {unlocked && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
