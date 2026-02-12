import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, AlertTriangle, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getClusterById } from '@/data/wordRelationships/index';
import { getMasteryLevel } from '@/utils/clusterMastery';
import { IntensityScale } from './IntensityScale';
import { WordDetailCard } from './WordDetailCard';
import type { WordCluster } from '@/data/wordRelationships/types';

interface ClusterDetailProps {
  clusterId: string;
  clusterMastery: number;
  learnedWords: Set<string>;
  wordDefinitions: Map<string, string>;
  onBack: () => void;
  onStartDrill: (clusterId: string) => void;
  onDrillConfusion: (wordA: string, wordB: string, clusterId: string) => void;
}

type TabId = 'summary' | 'scale' | 'confusions';

const TABS: { id: TabId; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'scale', label: 'Word Cards' },
  { id: 'confusions', label: 'Confusions' },
];

export function ClusterDetail({
  clusterId,
  clusterMastery,
  learnedWords,
  wordDefinitions,
  onBack,
  onStartDrill,
  onDrillConfusion,
}: ClusterDetailProps) {
  const [cluster, setCluster] = useState<WordCluster | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [loading, setLoading] = useState(true);
  const [dismissedIntro, setDismissedIntro] = useState(false);
  const [expandedConfusion, setExpandedConfusion] = useState<number | null>(null);

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

  const { label: masteryLabel, color: masteryColor } = getMasteryLevel(clusterMastery);
  const learnedInCluster = cluster.words.filter(w => learnedWords.has(w)).length;
  const isFirstVisit = clusterMastery === 0 && !dismissedIntro;

  // Group words by connotation for summary
  const positiveWords = cluster.intensityScale?.words.filter(w => w.connotation === 'positive').map(w => w.word) ?? [];
  const neutralWords = cluster.intensityScale?.words.filter(w => w.connotation === 'neutral').map(w => w.word) ?? [];
  const negativeWords = cluster.intensityScale?.words.filter(w => w.connotation === 'negative').map(w => w.word) ?? [];

  // First-visit intro state
  if (isFirstVisit) {
    const topTrap = cluster.commonConfusions[0];
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">{cluster.name}</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            {cluster.concept}. This cluster covers <span className="text-foreground font-medium">{cluster.words.length} words</span>.
          </p>

          {cluster.intensityScale && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              The key GRE skill here: knowing which words are{' '}
              <span className="text-green-400 font-medium">POSITIVE</span> and which are{' '}
              <span className="text-red-400 font-medium">NEGATIVE</span>.
              {positiveWords.length > 0 && negativeWords.length > 0 && (
                <> For example, <span className="text-foreground">{positiveWords[0]}</span> and{' '}
                <span className="text-foreground">{negativeWords[0]}</span> both relate to {cluster.intensityScale.dimension} — but only one is a compliment.</>
              )}
            </p>
          )}

          {topTrap && (
            <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
              <p className="text-xs text-orange-400 font-medium mb-1">Top Confusion Trap</p>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{topTrap.words[0]}</span> vs{' '}
                <span className="text-foreground font-medium">{topTrap.words[1]}</span> — {topTrap.whyConfused}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setDismissedIntro(true); setActiveTab('scale'); }}
            >
              Explore Words
            </Button>
            <Button
              className="flex-1"
              onClick={() => onStartDrill(cluster.id)}
            >
              <Play className="h-4 w-4 mr-1.5" />
              Jump to Drill
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle word click — show word detail over the current tab
  const handleWordClick = (word: string) => {
    setSelectedWord(word);
  };

  return (
    <div className="space-y-4">
      {/* Header: back + title + inline stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">{cluster.name}</h2>
              <span className={`text-[10px] font-medium ${masteryColor}`}>{masteryLabel}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {cluster.words.length} words · {learnedInCluster} learned · {Math.round(clusterMastery * 100)}% mastered
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => onStartDrill(cluster.id)}>
          <Play className="h-3.5 w-3.5 mr-1" />
          Drill
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {TABS.map(tab => {
          // Hide confusions tab if none exist
          if (tab.id === 'confusions' && cluster.commonConfusions.length === 0) return null;
          // Hide scale tab if no intensity scale
          if (tab.id === 'scale' && !cluster.intensityScale) return null;

          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedWord(null); }}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.id === 'confusions' && (
                <span className="ml-1 text-[10px] text-orange-400">{cluster.commonConfusions.length}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content — word detail overlays when selected */}
      <AnimatePresence mode="wait">
        {selectedWord ? (
          <motion.div
            key="word-detail"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <WordDetailCard
              word={selectedWord}
              cluster={cluster}
              isLearned={learnedWords.has(selectedWord)}
              onClose={() => setSelectedWord(null)}
              onWordClick={handleWordClick}
              onDrillConfusion={(a, b) => onDrillConfusion(a, b, cluster.id)}
            />
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Summary tab */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* Quick connotation summary */}
                {cluster.intensityScale && (
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    {positiveWords.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-green-400 text-sm shrink-0 w-6">+</span>
                        <div>
                          <span className="text-[10px] text-green-400 uppercase tracking-wider font-medium">Positive</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {positiveWords.map(w => (
                              <button
                                key={w}
                                onClick={() => handleWordClick(w)}
                                className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors cursor-pointer"
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {neutralWords.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 text-sm shrink-0 w-6">=</span>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Neutral</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {neutralWords.map(w => (
                              <button
                                key={w}
                                onClick={() => handleWordClick(w)}
                                className="text-xs px-2 py-0.5 rounded bg-slate-500/10 text-slate-300 border border-slate-500/20 hover:bg-slate-500/20 transition-colors cursor-pointer"
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {negativeWords.length > 0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-red-400 text-sm shrink-0 w-6">-</span>
                        <div>
                          <span className="text-[10px] text-red-400 uppercase tracking-wider font-medium">Negative</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {negativeWords.map(w => (
                              <button
                                key={w}
                                onClick={() => handleWordClick(w)}
                                className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors cursor-pointer"
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Top confusion traps — compact */}
                {cluster.commonConfusions.length > 0 && (
                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 space-y-2">
                    <h4 className="text-[10px] text-orange-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Top Traps
                    </h4>
                    {cluster.commonConfusions.slice(0, 3).map((cp, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          <span className="text-foreground font-medium">{cp.words[0]}</span>
                          {' vs '}
                          <span className="text-foreground font-medium">{cp.words[1]}</span>
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 px-1.5 text-[9px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                          onClick={() => onDrillConfusion(cp.words[0], cp.words[1], cluster.id)}
                        >
                          <Zap className="h-2.5 w-2.5 mr-0.5" />
                          Drill
                        </Button>
                      </div>
                    ))}
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
            )}

            {/* Intensity Scale tab */}
            {activeTab === 'scale' && cluster.intensityScale && (
              <div className="bg-card border border-border rounded-xl p-4">
                <IntensityScale
                  scale={cluster.intensityScale}
                  learnedWords={learnedWords}
                  wordDefinitions={wordDefinitions}
                  onWordClick={handleWordClick}
                />
              </div>
            )}

            {/* Confusions tab */}
            {activeTab === 'confusions' && (
              <div className="space-y-2">
                {cluster.commonConfusions.map((cp, i) => {
                  const isExpanded = expandedConfusion === i;
                  return (
                    <div
                      key={i}
                      className="bg-orange-500/5 border border-orange-500/20 rounded-lg overflow-hidden"
                    >
                      {/* Collapsed: pair name + short summary */}
                      <button
                        onClick={() => setExpandedConfusion(isExpanded ? null : i)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-orange-500/5 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">
                            {cp.words[0]} vs {cp.words[1]}
                          </span>
                          {!isExpanded && (
                            <span className="text-xs text-muted-foreground ml-2">
                              — {cp.whyConfused.length > 70 ? cp.whyConfused.slice(0, 67) + '...' : cp.whyConfused}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-[10px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                            onClick={(e) => { e.stopPropagation(); onDrillConfusion(cp.words[0], cp.words[1], cluster.id); }}
                          >
                            <Zap className="h-3 w-3 mr-0.5" />
                            Drill
                          </Button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded details */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="px-4 pb-3 space-y-2"
                        >
                          <p className="text-xs text-muted-foreground">{cp.whyConfused}</p>
                          {cp.mnemonic && (
                            <p className="text-xs text-primary italic">{cp.mnemonic}</p>
                          )}
                          <div className="space-y-1 pt-1">
                            {cp.exampleSentences.map((sent, j) => (
                              <p key={j} className="text-[11px] text-muted-foreground/80 pl-3 border-l-2 border-orange-500/20">
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
        )}
      </AnimatePresence>
    </div>
  );
}
