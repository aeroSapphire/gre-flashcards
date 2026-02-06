import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Check, ArrowLeft, Sparkles, RefreshCw, Shuffle } from 'lucide-react';
import { FlashcardList } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type StudyDirection = 'standard' | 'reverse' | 'mixed';

const STUDY_MODES = [
  { id: 'standard' as StudyDirection, name: 'Standard', desc: 'See word, recall definition', icon: BookOpen },
  { id: 'reverse' as StudyDirection, name: 'Reverse', desc: 'See definition, recall word', icon: RefreshCw },
  { id: 'mixed' as StudyDirection, name: 'Mixed', desc: 'Random mix of both', icon: Shuffle },
];

interface StudyModeSelectorProps {
  lists: FlashcardList[];
  getListStats: (listId: string) => { total: number; new: number; learning: number; learned: number };
  onStart: (selectedListIds: string[] | 'all', direction?: StudyDirection) => void;
  onCancel: () => void;
  totalCards: number;
}

export function StudyModeSelector({
  lists,
  getListStats,
  onStart,
  onCancel,
  totalCards,
}: StudyModeSelectorProps) {
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [studyAll, setStudyAll] = useState(false);
  const [studyDirection, setStudyDirection] = useState<StudyDirection>('standard');

  const toggleList = (listId: string) => {
    setStudyAll(false);
    setSelectedLists((prev) => {
      const next = new Set(prev);
      if (next.has(listId)) {
        next.delete(listId);
      } else {
        next.add(listId);
      }
      return next;
    });
  };

  const handleStudyAll = () => {
    setStudyAll(true);
    setSelectedLists(new Set());
  };

  const handleStart = () => {
    if (studyAll) {
      onStart('all', studyDirection);
    } else {
      onStart(Array.from(selectedLists), studyDirection);
    }
  };

  const canStart = studyAll || selectedLists.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="font-display text-xl font-semibold text-foreground">Choose What to Study</h2>
        <div className="w-20" />
      </div>

      {/* Study All Option */}
      <motion.div
        className={cn(
          'rounded-2xl border-2 p-6 cursor-pointer transition-all',
          studyAll
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/30 bg-card'
        )}
        onClick={handleStudyAll}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">Study All Cards</h3>
              <p className="text-sm text-muted-foreground">{totalCards} words total</p>
            </div>
          </div>
          {studyAll && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-4 w-4 text-primary-foreground" />
            </div>
          )}
        </div>
      </motion.div>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">or select specific lists</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* List Options */}
      <div className="grid gap-3">
        {lists.map((list) => {
          const stats = getListStats(list.id);
          const isSelected = selectedLists.has(list.id);
          
          return (
            <motion.div
              key={list.id}
              className={cn(
                'rounded-xl border-2 p-4 cursor-pointer transition-all',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30 bg-card'
              )}
              onClick={() => toggleList(list.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{list.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{stats.total} words</span>
                      <span>•</span>
                      <span>{stats.learned} mastered</span>
                    </div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Study Mode Selection */}
      {canStart && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">study mode</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {STUDY_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = studyDirection === mode.id;

              return (
                <motion.div
                  key={mode.id}
                  className={cn(
                    'rounded-xl border-2 p-3 cursor-pointer transition-all text-center',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30 bg-card'
                  )}
                  onClick={() => setStudyDirection(mode.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-medium text-sm text-foreground">{mode.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{mode.desc}</p>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center mx-auto mt-2">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Start Button */}
      <Button
        size="lg"
        className="w-full"
        disabled={!canStart}
        onClick={handleStart}
      >
        <BookOpen className="h-4 w-4 mr-2" />
        Start Studying
      </Button>
    </motion.div>
  );
}
