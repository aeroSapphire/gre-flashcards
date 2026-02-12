import { motion } from 'framer-motion';
import type { IntensityScale as IntensityScaleType } from '@/data/wordRelationships/types';

interface IntensityScaleProps {
  scale: IntensityScaleType;
  learnedWords: Set<string>;
  onWordClick: (word: string) => void;
}

const connotationColor = {
  positive: 'bg-green-500/20 text-green-400 border-green-500/40',
  neutral: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  negative: 'bg-red-500/20 text-red-400 border-red-500/40',
};

export function IntensityScale({ scale, learnedWords, onWordClick }: IntensityScaleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Intensity Scale
      </h3>

      {/* Pole labels + gradient bar */}
      <div className="relative">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{scale.poles[0]}</span>
          <span>{scale.poles[1]}</span>
        </div>
        <div className="h-2 rounded-full bg-gradient-to-r from-primary/60 via-muted to-amber-500/60" />

        {/* Word markers positioned along the scale */}
        <div className="relative h-auto mt-4 min-h-[60px]">
          {scale.words.map((entry, i) => (
            <motion.button
              key={entry.word}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onWordClick(entry.word)}
              className={`absolute text-xs px-2 py-1 rounded border cursor-pointer transition-all hover:scale-110 ${connotationColor[entry.connotation]} ${learnedWords.has(entry.word) ? 'ring-1 ring-green-400/50' : ''}`}
              style={{
                left: `${entry.position * 100}%`,
                top: `${(i % 3) * 28}px`,
                transform: 'translateX(-50%)',
              }}
            >
              {entry.word}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground mt-8">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400" /> positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-400" /> neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400" /> negative
        </span>
      </div>
    </div>
  );
}
