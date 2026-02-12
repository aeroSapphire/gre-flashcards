import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { IntensityScale as IntensityScaleType } from '@/data/wordRelationships/types';

interface IntensityScaleProps {
  scale: IntensityScaleType;
  learnedWords: Set<string>;
  wordDefinitions: Map<string, string>;
  onWordClick: (word: string) => void;
}

const GROUP_CONFIG = {
  positive: {
    label: 'Positive',
    card: 'border-green-500/25 hover:border-green-500/50',
    bg: 'bg-green-500/5',
    text: 'text-green-400',
    defText: 'text-green-300/70',
  },
  neutral: {
    label: 'Neutral',
    card: 'border-slate-500/25 hover:border-slate-500/50',
    bg: 'bg-slate-500/5',
    text: 'text-slate-300',
    defText: 'text-slate-400/70',
  },
  negative: {
    label: 'Negative',
    card: 'border-red-500/25 hover:border-red-500/50',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
    defText: 'text-red-300/70',
  },
} as const;

type Connotation = keyof typeof GROUP_CONFIG;

export function IntensityScale({ scale, learnedWords, wordDefinitions, onWordClick }: IntensityScaleProps) {
  const groups = useMemo(() => {
    const result: Record<Connotation, typeof scale.words> = {
      positive: [],
      neutral: [],
      negative: [],
    };
    for (const entry of scale.words) {
      result[entry.connotation].push(entry);
    }
    for (const key of Object.keys(result) as Connotation[]) {
      result[key].sort((a, b) => a.position - b.position);
    }
    return result;
  }, [scale.words]);

  const activeGroups = (['positive', 'neutral', 'negative'] as Connotation[]).filter(
    g => groups[g].length > 0
  );

  return (
    <div className="space-y-5">
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
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
                {config.label}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {words.length}
              </span>
            </div>

            {/* Word cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {words.map((entry, i) => {
                const isLearned = learnedWords.has(entry.word);
                const definition = wordDefinitions.get(entry.word) ?? '';

                return (
                  <motion.button
                    key={entry.word}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: gi * 0.08 + i * 0.03 }}
                    onClick={() => onWordClick(entry.word)}
                    className={`text-left rounded-xl border p-3 transition-all cursor-pointer ${config.card} ${config.bg} ${
                      isLearned ? 'ring-1 ring-primary/40' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${config.text}`}>
                        {entry.word}
                      </span>
                      {isLearned && (
                        <span className="text-[9px] text-primary font-medium">learned</span>
                      )}
                    </div>
                    {definition && (
                      <p className={`text-[11px] mt-1 leading-snug line-clamp-2 ${config.defText}`}>
                        {definition}
                      </p>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
