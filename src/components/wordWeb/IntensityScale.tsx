import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { IntensityScale as IntensityScaleType } from '@/data/wordRelationships/types';

interface IntensityScaleProps {
  scale: IntensityScaleType;
  learnedWords: Set<string>;
  onWordClick: (word: string) => void;
}

const GROUP_CONFIG = {
  positive: {
    label: 'Positive',
    card: 'bg-green-500/8 border-green-500/25 hover:border-green-500/40',
    text: 'text-green-400',
    badge: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  neutral: {
    label: 'Neutral',
    card: 'bg-slate-500/8 border-slate-500/25 hover:border-slate-500/40',
    text: 'text-slate-300',
    badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  negative: {
    label: 'Negative',
    card: 'bg-red-500/8 border-red-500/25 hover:border-red-500/40',
    text: 'text-red-400',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
} as const;

type Connotation = keyof typeof GROUP_CONFIG;

export function IntensityScale({ scale, learnedWords, onWordClick }: IntensityScaleProps) {
  const groups = useMemo(() => {
    const result: Record<Connotation, typeof scale.words> = {
      positive: [],
      neutral: [],
      negative: [],
    };
    for (const entry of scale.words) {
      result[entry.connotation].push(entry);
    }
    // Sort each group by position on the scale
    for (const key of Object.keys(result) as Connotation[]) {
      result[key].sort((a, b) => a.position - b.position);
    }
    return result;
  }, [scale.words]);

  // Only render groups that have words
  const activeGroups = (['positive', 'neutral', 'negative'] as Connotation[]).filter(
    g => groups[g].length > 0
  );

  return (
    <div className="space-y-4">
      {/* Dimension label */}
      <p className="text-xs text-muted-foreground text-center uppercase tracking-wider">
        {scale.dimension}
      </p>

      {/* Three connotation groups */}
      <div className="space-y-3">
        {activeGroups.map((connotation, gi) => {
          const config = GROUP_CONFIG[connotation];
          const words = groups[connotation];

          return (
            <motion.div
              key={connotation}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.08 }}
            >
              {/* Group header */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${config.text}`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  {words.length} {words.length === 1 ? 'word' : 'words'}
                </span>
              </div>

              {/* Word cards grid */}
              <div className="flex flex-wrap gap-2">
                {words.map((entry, i) => {
                  const isLearned = learnedWords.has(entry.word);
                  return (
                    <motion.button
                      key={entry.word}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: gi * 0.08 + i * 0.03 }}
                      onClick={() => onWordClick(entry.word)}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${config.card} ${
                        isLearned ? 'ring-1 ring-primary/40' : ''
                      }`}
                    >
                      <span className={config.text}>{entry.word}</span>
                      {isLearned && (
                        <span className="ml-1.5 text-[9px] text-primary">✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
