import { motion } from 'framer-motion';
import { X, ArrowRight, AlertTriangle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WordCluster, WordRelationship, ConfusionPair } from '@/data/wordRelationships/types';

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

export function WordDetailCard({
  word,
  cluster,
  isLearned,
  onClose,
  onWordClick,
  onDrillConfusion,
}: WordDetailCardProps) {
  const lower = word.toLowerCase();

  // Get relationships for this word
  const relationships = cluster.relationships.filter(
    r => r.wordA === lower || r.wordB === lower
  );

  // Group by type
  const grouped = new Map<string, { otherWord: string; rel: WordRelationship }[]>();
  for (const rel of relationships) {
    const otherWord = rel.wordA === lower ? rel.wordB : rel.wordA;
    const type = rel.type;
    if (!grouped.has(type)) grouped.set(type, []);
    grouped.get(type)!.push({ otherWord, rel });
  }

  // Get confusion pairs
  const confusions = cluster.commonConfusions.filter(
    cp => cp.words[0] === lower || cp.words[1] === lower
  );

  // Get intensity position
  const scaleEntry = cluster.intensityScale?.words.find(w => w.word === lower);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">{word}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cluster.name} cluster
            {isLearned && (
              <span className="ml-2 text-green-400">Learned</span>
            )}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Intensity position */}
      {scaleEntry && cluster.intensityScale && (
        <div className="text-xs text-muted-foreground">
          <span className="uppercase tracking-wider font-medium">Intensity</span>
          <span className="ml-2 text-foreground">
            {Math.round(scaleEntry.position * 100)}% on {cluster.intensityScale.dimension} scale
          </span>
          <span className={`ml-1 ${scaleEntry.connotation === 'positive' ? 'text-green-400' : scaleEntry.connotation === 'negative' ? 'text-red-400' : 'text-slate-400'}`}>
            ({scaleEntry.connotation})
          </span>
        </div>
      )}

      {/* Relationships by type */}
      {grouped.size > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Relationships
          </h4>
          {Array.from(grouped.entries()).map(([type, rels]) => (
            <div key={type}>
              <span className={`text-xs font-medium ${TYPE_COLORS[type] ?? 'text-slate-400'}`}>
                {TYPE_LABELS[type] ?? type}
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {rels.map(({ otherWord, rel }) => (
                  <button
                    key={otherWord}
                    onClick={() => onWordClick(otherWord)}
                    className="text-xs px-2 py-1 rounded border border-border bg-muted/50 text-foreground hover:bg-muted hover:border-primary/30 transition-colors cursor-pointer"
                    title={rel.shadeNote}
                  >
                    {otherWord}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shade notes */}
      {relationships.filter(r => r.shadeNote).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Shade Notes
          </h4>
          <div className="space-y-1.5">
            {relationships.filter(r => r.shadeNote).map(rel => {
              const other = rel.wordA === lower ? rel.wordB : rel.wordA;
              return (
                <p key={`${rel.wordA}-${rel.wordB}`} className="text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">{word} vs {other}:</span>{' '}
                  {rel.shadeNote}
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Confusion pairs */}
      {confusions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Commonly Confused
          </h4>
          {confusions.map((cp, i) => {
            const otherWord = cp.words[0] === lower ? cp.words[1] : cp.words[0];
            return (
              <div key={i} className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onWordClick(otherWord)}
                    className="text-sm font-medium text-orange-400 hover:underline cursor-pointer"
                  >
                    {word} <ArrowRight className="h-3 w-3 inline mx-1" /> {otherWord}
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    onClick={() => onDrillConfusion(lower, otherWord)}
                  >
                    Drill
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{cp.whyConfused}</p>
                {cp.mnemonic && (
                  <p className="text-xs text-primary italic">Mnemonic: {cp.mnemonic}</p>
                )}
                <div className="space-y-1">
                  {cp.exampleSentences.map((sent, j) => (
                    <p key={j} className="text-[11px] text-muted-foreground/80 pl-2 border-l border-border">
                      {sent}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
