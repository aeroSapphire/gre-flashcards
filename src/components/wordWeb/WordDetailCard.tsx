import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertTriangle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WordCluster, WordRelationship } from '@/data/wordRelationships/types';

interface WordDetailCardProps {
  word: string;
  cluster: WordCluster;
  isLearned: boolean;
  onClose: () => void;
  onWordClick: (word: string) => void;
  onDrillConfusion: (wordA: string, wordB: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  synonym: 'Synonym',
  near_synonym: 'Near synonym',
  antonym: 'Antonym',
  stronger_than: 'Stronger than',
  weaker_than: 'Weaker than',
  formal_variant: 'Formal variant',
  commonly_confused: 'Commonly confused',
  derived_from: 'Derived from',
  category_sibling: 'Related concept',
};

const TYPE_COLORS: Record<string, string> = {
  synonym: 'text-green-400',
  near_synonym: 'text-green-400/70',
  antonym: 'text-red-400',
  stronger_than: 'text-blue-400',
  weaker_than: 'text-blue-400/70',
  formal_variant: 'text-purple-400',
  commonly_confused: 'text-orange-400',
  derived_from: 'text-slate-400',
  category_sibling: 'text-slate-400',
};

// Parse shade note into a structured comparison
function parseShadeNote(shadeNote: string, wordA: string, wordB: string): { wordA: string; noteA: string; wordB: string; noteB: string } | null {
  // Try to split on semicolons or "while" / "whereas"
  const separators = ['; ', ' while ', ' whereas '];
  for (const sep of separators) {
    const idx = shadeNote.toLowerCase().indexOf(sep.toLowerCase());
    if (idx > -1) {
      return {
        wordA,
        noteA: shadeNote.slice(0, idx).trim(),
        wordB,
        noteB: shadeNote.slice(idx + sep.length).trim(),
      };
    }
  }
  return null;
}

export function WordDetailCard({
  word,
  cluster,
  isLearned,
  onClose,
  onWordClick,
  onDrillConfusion,
}: WordDetailCardProps) {
  const [expandedConfusion, setExpandedConfusion] = useState<number | null>(null);
  const lower = word.toLowerCase();

  const relationships = cluster.relationships.filter(
    r => r.wordA === lower || r.wordB === lower
  );

  // Group by type
  const grouped = new Map<string, { otherWord: string; rel: WordRelationship }[]>();
  for (const rel of relationships) {
    const otherWord = rel.wordA === lower ? rel.wordB : rel.wordA;
    if (!grouped.has(rel.type)) grouped.set(rel.type, []);
    grouped.get(rel.type)!.push({ otherWord, rel });
  }

  const confusions = cluster.commonConfusions.filter(
    cp => cp.words[0] === lower || cp.words[1] === lower
  );

  const scaleEntry = cluster.intensityScale?.words.find(w => w.word === lower);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{word}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">{cluster.name}</span>
            {isLearned && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                Learned
              </span>
            )}
            {scaleEntry && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                scaleEntry.connotation === 'positive'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : scaleEntry.connotation === 'negative'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }`}>
                {scaleEntry.connotation}
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Relationships by type */}
      {grouped.size > 0 && (
        <div className="space-y-2.5">
          {Array.from(grouped.entries()).map(([type, rels]) => (
            <div key={type} className="flex items-start gap-2">
              <span className={`text-[10px] font-medium uppercase tracking-wider shrink-0 mt-0.5 w-20 ${TYPE_COLORS[type] ?? 'text-slate-400'}`}>
                {TYPE_LABELS[type] ?? type}
              </span>
              <div className="flex flex-wrap gap-1">
                {rels.map(({ otherWord }) => (
                  <button
                    key={otherWord}
                    onClick={() => onWordClick(otherWord)}
                    className="text-xs px-2 py-0.5 rounded border border-border bg-muted/50 text-foreground hover:bg-muted hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    {otherWord}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shade notes — formatted as structured comparisons */}
      {relationships.filter(r => r.shadeNote).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Shade Notes
          </h4>
          <div className="space-y-2">
            {relationships.filter(r => r.shadeNote).map(rel => {
              const other = rel.wordA === lower ? rel.wordB : rel.wordA;
              const parsed = parseShadeNote(rel.shadeNote, word, other);

              if (parsed) {
                return (
                  <div key={`${rel.wordA}-${rel.wordB}`} className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                    <p className="text-[11px] font-medium text-foreground">
                      {word} vs {other}
                    </p>
                    <div className="space-y-0.5">
                      <p className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">{word}</span>
                        <ArrowRight className="h-2.5 w-2.5 inline mx-1 text-muted-foreground/50" />
                        {parsed.noteA}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        <span className="text-foreground font-medium">{other}</span>
                        <ArrowRight className="h-2.5 w-2.5 inline mx-1 text-muted-foreground/50" />
                        {parsed.noteB}
                      </p>
                    </div>
                  </div>
                );
              }

              // Fallback: short format for unparseable notes
              return (
                <div key={`${rel.wordA}-${rel.wordB}`} className="bg-muted/30 rounded-lg p-2.5">
                  <p className="text-[11px]">
                    <span className="text-foreground font-medium">{word} vs {other}:</span>{' '}
                    <span className="text-muted-foreground">{rel.shadeNote}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confusion pairs — collapsed by default */}
      {confusions.length > 0 && (
        <div className="space-y-1.5">
          <h4 className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Confusion Traps
          </h4>
          {confusions.map((cp, i) => {
            const otherWord = cp.words[0] === lower ? cp.words[1] : cp.words[0];
            const isExpanded = expandedConfusion === i;
            // Build a short one-line summary from whyConfused
            const shortSummary = cp.whyConfused.length > 80
              ? cp.whyConfused.slice(0, 77) + '...'
              : cp.whyConfused;

            return (
              <div key={i} className="bg-orange-500/5 border border-orange-500/20 rounded-lg overflow-hidden">
                {/* Collapsed header: always visible */}
                <button
                  onClick={() => setExpandedConfusion(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left cursor-pointer hover:bg-orange-500/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground">
                      {word} vs {otherWord}
                    </span>
                    {!isExpanded && (
                      <span className="text-[11px] text-muted-foreground ml-2">
                        — {shortSummary}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-5 px-1.5 text-[9px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                      onClick={(e) => { e.stopPropagation(); onDrillConfusion(lower, otherWord); }}
                    >
                      Drill
                    </Button>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-3 pb-2.5 space-y-1.5"
                  >
                    <p className="text-xs text-muted-foreground">{cp.whyConfused}</p>
                    {cp.mnemonic && (
                      <p className="text-xs text-primary italic">{cp.mnemonic}</p>
                    )}
                    <div className="space-y-1 pt-1">
                      {cp.exampleSentences.map((sent, j) => (
                        <p key={j} className="text-[10px] text-muted-foreground/80 pl-2 border-l border-border">
                          {sent}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
