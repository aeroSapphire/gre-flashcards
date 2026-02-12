import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClusterById } from '@/data/wordRelationships/index';
import { getMasteryLevel } from '@/utils/clusterMastery';
import { NetworkGraph } from './NetworkGraph';
import { IntensityScale } from './IntensityScale';
import { WordDetailCard } from './WordDetailCard';
import type { WordCluster } from '@/data/wordRelationships/types';

interface ClusterDetailProps {
  clusterId: string;
  clusterMastery: number;
  learnedWords: Set<string>;
  onBack: () => void;
  onStartDrill: (clusterId: string) => void;
  onDrillConfusion: (wordA: string, wordB: string, clusterId: string) => void;
}

export function ClusterDetail({
  clusterId,
  clusterMastery,
  learnedWords,
  onBack,
  onStartDrill,
  onDrillConfusion,
}: ClusterDetailProps) {
  const [cluster, setCluster] = useState<WordCluster | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClusterById(clusterId).then(data => {
      setCluster(data);
      setLoading(false);
    });
  }, [clusterId]);

  if (loading || !cluster) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const { label, color } = getMasteryLevel(clusterMastery);
  const learnedInCluster = cluster.words.filter(w => learnedWords.has(w)).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{cluster.name}</h2>
            <p className="text-xs text-muted-foreground">{cluster.concept}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${color}`}>{label}</span>
          <Button size="sm" onClick={() => onStartDrill(cluster.id)}>
            <Play className="h-3.5 w-3.5 mr-1" />
            Drill
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-card border border-border rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-foreground">{cluster.words.length}</p>
          <p className="text-[10px] text-muted-foreground">Words</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-400">{learnedInCluster}</p>
          <p className="text-[10px] text-muted-foreground">Learned</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-foreground">{cluster.relationships.length}</p>
          <p className="text-[10px] text-muted-foreground">Connections</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-foreground">{Math.round(clusterMastery * 100)}%</p>
          <p className="text-[10px] text-muted-foreground">Mastery</p>
        </div>
      </div>

      {/* Main content: graph + word detail side by side on desktop */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Network graph */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Relationship Network
          </h3>
          <NetworkGraph
            words={cluster.words}
            relationships={cluster.relationships}
            learnedWords={learnedWords}
            highlightWord={selectedWord ?? undefined}
            onWordClick={setSelectedWord}
          />
        </div>

        {/* Word detail panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedWord ? (
              <WordDetailCard
                key={selectedWord}
                word={selectedWord}
                cluster={cluster}
                isLearned={learnedWords.has(selectedWord)}
                onClose={() => setSelectedWord(null)}
                onWordClick={setSelectedWord}
                onDrillConfusion={(a, b) => onDrillConfusion(a, b, cluster.id)}
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-xl p-5 text-center text-muted-foreground text-sm"
              >
                <p className="mb-1">Click a word in the graph</p>
                <p className="text-xs">to see its relationships and shade notes</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Intensity scale */}
      {cluster.intensityScale && (
        <div className="bg-card border border-border rounded-xl p-4">
          <IntensityScale
            scale={cluster.intensityScale}
            learnedWords={learnedWords}
            onWordClick={setSelectedWord}
          />
        </div>
      )}

      {/* Common confusions */}
      {cluster.commonConfusions.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Common Confusion Traps ({cluster.commonConfusions.length})
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {cluster.commonConfusions.map((cp, i) => (
              <div
                key={i}
                className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {cp.words[0]} vs {cp.words[1]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-[10px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                    onClick={() => onDrillConfusion(cp.words[0], cp.words[1], cluster.id)}
                  >
                    <Zap className="h-3 w-3 mr-0.5" />
                    Drill
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{cp.whyConfused}</p>
                {cp.mnemonic && (
                  <p className="text-xs text-primary italic">{cp.mnemonic}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drill CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Ready to practice?</p>
          <p className="text-xs text-muted-foreground">
            {cluster.drills.length} drills covering shade distinctions, intensity ordering, and more
          </p>
        </div>
        <Button onClick={() => onStartDrill(cluster.id)}>
          <Play className="h-4 w-4 mr-1.5" />
          Start Drill
        </Button>
      </div>
    </div>
  );
}
