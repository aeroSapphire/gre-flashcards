import { useRef } from 'react';
import { motion } from 'framer-motion';
import type { IntensityScale as IntensityScaleType } from '@/data/wordRelationships/types';

interface IntensityScaleProps {
  scale: IntensityScaleType;
  learnedWords: Set<string>;
  onWordClick: (word: string) => void;
}

const CONNOTATION_DOT: Record<string, string> = {
  positive: 'bg-green-400',
  neutral: 'bg-slate-400',
  negative: 'bg-red-400',
};

const CONNOTATION_TEXT: Record<string, string> = {
  positive: 'text-green-400',
  neutral: 'text-slate-300',
  negative: 'text-red-400',
};

export function IntensityScale({ scale, learnedWords, onWordClick }: IntensityScaleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort words by position (left = one pole, right = other pole)
  const sorted = [...scale.words].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-3">
      {/* Pole labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{scale.poles[0]}</span>
        <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
          {scale.dimension}
        </span>
        <span>{scale.poles[1]}</span>
      </div>

      {/* Gradient bar */}
      <div className="h-1.5 rounded-full bg-gradient-to-r from-primary/50 via-muted to-amber-500/50" />

      {/* Words in a single scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin"
      >
        {sorted.map((entry, i) => (
          <motion.button
            key={entry.word}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onWordClick(entry.word)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-2.5 py-2 rounded-lg border transition-all cursor-pointer hover:bg-muted/50 ${
              learnedWords.has(entry.word)
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-border bg-card'
            }`}
          >
            <span className={`text-xs font-medium whitespace-nowrap ${CONNOTATION_TEXT[entry.connotation]}`}>
              {entry.word}
            </span>
            <span className={`w-2 h-2 rounded-full ${CONNOTATION_DOT[entry.connotation]}`} />
          </motion.button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> negative
        </span>
        {learnedWords.size > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded border border-green-500/30 bg-green-500/5" /> learned
          </span>
        )}
      </div>
    </div>
  );
}
