import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFlashcardsDb, FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { useHardWords } from '@/hooks/useHardWords';
import { useMnemonics } from '@/hooks/useMnemonics';
import { CONFUSION_CLUSTERS, findClusterForWord } from '@/data/confusionClusters';
import { MnemonicDisplay } from '@/components/MnemonicDisplay';
import { ConfusionClusterCard } from '@/components/ConfusionClusterCard';
import { HardWordButton } from '@/components/HardWordButton';
import { cn } from '@/lib/utils';

export default function HardWordsHub() {
  const navigate = useNavigate();
  const { cards, isLoaded, markAsLearned, markAsLearning } = useFlashcardsDb();
  const { hardWords, hardWordIds, toggleHardWord, isHard } = useHardWords();
  const { getMnemonic, hasMnemonic, generateAndSaveMnemonic, isGenerating, mnemonics } = useMnemonics();

  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<FlashcardWithProgress | null>(null);

  // Get hard word cards
  const hardWordCards = useMemo(() => {
    return cards.filter(card => hardWordIds.has(card.id));
  }, [cards, hardWordIds]);

  // Cards with mnemonics
  const cardsWithMnemonics = useMemo(() => {
    return hardWordCards.filter(card => hasMnemonic(card.id));
  }, [hardWordCards, hasMnemonic]);

  // Find clusters that contain any of the user's words
  const relevantClusters = useMemo(() => {
    const userWords = new Set(cards.map(c => c.word.toLowerCase()));
    return CONFUSION_CLUSTERS.filter(cluster =>
      cluster.words.some(word => userWords.has(word.toLowerCase()))
    );
  }, [cards]);

  const toggleCluster = (clusterId: string) => {
    setExpandedClusters(prev => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  const handleStartPractice = () => {
    if (hardWordCards.length === 0) return;
    navigate('/study', { state: { hardWordsOnly: true } });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Hard Words Hub
                </h1>
                <p className="text-xs text-muted-foreground">
                  {hardWordCards.length} hard {hardWordCards.length === 1 ? 'word' : 'words'}
                </p>
              </div>
            </div>
            <Button
              onClick={handleStartPractice}
              disabled={hardWordCards.length === 0}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Practice Hard Words
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{hardWordCards.length}</p>
                <p className="text-xs text-muted-foreground">Hard Words</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{cardsWithMnemonics.length}</p>
                <p className="text-xs text-muted-foreground">With Mnemonics</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{relevantClusters.length}</p>
                <p className="text-xs text-muted-foreground">Confusion Clusters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        {hardWordCards.length > 0 && (
          <div className="mb-8 p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Mnemonic Coverage</span>
              <span className="text-sm text-muted-foreground">
                {cardsWithMnemonics.length} / {hardWordCards.length}
              </span>
            </div>
            <Progress
              value={hardWordCards.length > 0 ? (cardsWithMnemonics.length / hardWordCards.length) * 100 : 0}
              className="h-2"
            />
          </div>
        )}

        {/* Hard Words Section */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Your Hard Words
          </h2>

          {hardWordCards.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
              <Flame className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No hard words yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Mark words as hard while studying to add them here. Hard words will get priority in your reviews.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <AnimatePresence>
                {hardWordCards.map(card => {
                  const mnemonic = getMnemonic(card.id);
                  const cluster = findClusterForWord(card.word);

                  return (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-display text-xl font-semibold text-foreground">
                            {card.word}
                          </h3>
                          {card.part_of_speech && (
                            <p className="text-xs text-muted-foreground italic">
                              {card.part_of_speech}
                            </p>
                          )}
                        </div>
                        <HardWordButton
                          isHard={true}
                          onToggle={() => toggleHardWord(card.id, false)}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {card.definition}
                      </p>

                      {/* Mnemonic Section */}
                      {mnemonic ? (
                        <MnemonicDisplay
                          mnemonic={mnemonic}
                          isGenerating={false}
                          onGenerate={() => {}}
                          compact
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateAndSaveMnemonic(
                            card.id,
                            card.word,
                            card.definition,
                            card.part_of_speech,
                            card.etymology
                          )}
                          disabled={isGenerating(card.id)}
                          className="text-muted-foreground hover:text-yellow-600"
                        >
                          {isGenerating(card.id) ? (
                            <>
                              <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-1" />
                              Generate Mnemonic
                            </>
                          )}
                        </Button>
                      )}

                      {/* Confusion Cluster Badge */}
                      {cluster && (
                        <div className="mt-2">
                          <ConfusionClusterCard
                            cluster={cluster}
                            currentWord={card.word}
                            compact
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* Confusion Clusters Section */}
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Confusion Clusters
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            These word groups are commonly confused on the GRE. Learn to distinguish them.
          </p>

          <div className="space-y-3">
            {relevantClusters.length === 0 ? (
              <div className="text-center py-8 bg-muted/30 rounded-xl border border-border">
                <p className="text-sm text-muted-foreground">
                  Add more vocabulary words to see relevant confusion clusters.
                </p>
              </div>
            ) : (
              relevantClusters.map(cluster => {
                const isExpanded = expandedClusters.has(cluster.id);
                const userWordsInCluster = cluster.words.filter(word =>
                  cards.some(c => c.word.toLowerCase() === word.toLowerCase())
                );

                return (
                  <div
                    key={cluster.id}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <button
                      onClick={() => toggleCluster(cluster.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium text-foreground">{cluster.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {userWordsInCluster.length} of {cluster.words.length} words in your vocab
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-0">
                            <p className="text-sm text-muted-foreground mb-3">
                              {cluster.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {cluster.words.map(word => {
                                const card = cards.find(c => c.word.toLowerCase() === word.toLowerCase());
                                const inVocab = !!card;
                                const isHardWord = card && isHard(card.id);

                                return (
                                  <span
                                    key={word}
                                    className={cn(
                                      'text-sm px-3 py-1.5 rounded-full border transition-colors',
                                      inVocab
                                        ? isHardWord
                                          ? 'bg-orange-500/20 text-orange-600 border-orange-500/30'
                                          : 'bg-primary/10 text-primary border-primary/20'
                                        : 'bg-muted/50 text-muted-foreground border-border'
                                    )}
                                  >
                                    {word}
                                    {isHardWord && <Flame className="inline h-3 w-3 ml-1" />}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
