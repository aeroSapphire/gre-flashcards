import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, RotateCcw, Sparkles, BookOpen, X, GitBranch, Keyboard, Trophy, Clock, Target } from 'lucide-react';
import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateExamples } from '@/services/sentenceEvaluator';
import { WordConnections } from '@/components/WordConnections';
import { HardWordButton } from '@/components/HardWordButton';
import { MnemonicDisplay } from '@/components/MnemonicDisplay';
import { ConfusionClusterCard } from '@/components/ConfusionClusterCard';
import { findClusterForWord } from '@/data/confusionClusters';
import { StoredMnemonic } from '@/services/mnemonicService';

export type StudyDirection = 'standard' | 'reverse' | 'mixed';

interface StudyModeProps {
  cards: FlashcardWithProgress[];
  allCards: FlashcardWithProgress[];
  onMarkLearned: (id: string) => void;
  onMarkLearning: (id: string) => void;
  onUpdateCard?: (id: string, updates: any) => void;
  onExit: () => void;
  listName?: string;
  studyDirection?: StudyDirection;
  hardWordIds?: Set<string>;
  onToggleHard?: (id: string, isHard: boolean) => void;
  getMnemonic?: (id: string) => StoredMnemonic | null;
  isGeneratingMnemonic?: (id: string) => boolean;
  onGenerateMnemonic?: (id: string, word: string, definition: string, pos?: string | null, etymology?: string | null) => void;
}

export function StudyMode({
  cards,
  allCards,
  onMarkLearned,
  onMarkLearning,
  onUpdateCard,
  onExit,
  listName,
  studyDirection = 'standard',
  hardWordIds,
  onToggleHard,
  getMnemonic,
  isGeneratingMnemonic,
  onGenerateMnemonic,
}: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [stillLearning, setStillLearning] = useState<Set<string>>(new Set());
  const [showEtymology, setShowEtymology] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStartTime] = useState(() => Date.now());

  // For mixed mode: randomize whether to show word or definition first per card
  const [cardDirections] = useState<Map<string, 'standard' | 'reverse'>>(() => {
    const map = new Map();
    cards.forEach(card => {
      map.set(card.id, Math.random() > 0.5 ? 'standard' : 'reverse');
    });
    return map;
  });

  // Get the effective direction for the current card
  const getCardDirection = useCallback((cardId: string): 'standard' | 'reverse' => {
    if (studyDirection === 'mixed') {
      return cardDirections.get(cardId) || 'standard';
    }
    return studyDirection === 'reverse' ? 'reverse' : 'standard';
  }, [studyDirection, cardDirections]);

  const studyCards = useMemo(
    () => cards.filter((c) => c.status !== 'learned'),
    [cards]
  );

  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? (completed.size / studyCards.length) * 100 : 0;

  const handleFlip = async () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);

    // Auto-generate example if missing when flipping to back
    if (newFlipped && currentCard && !currentCard.example && onUpdateCard) {
      console.log("Generating missing example for:", currentCard.word);
      try {
        const examples = await generateExamples(currentCard.word, currentCard.definition, currentCard.part_of_speech);
        if (examples.length > 0) {
          onUpdateCard(currentCard.id, { example: examples[0] });
        }
      } catch (error) {
        console.error("Failed to auto-generate example:", error);
      }
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setShowEtymology(false);
    setTimeout(() => {
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setShowEtymology(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 150);
  };

  const handleGotIt = () => {
    if (currentCard) {
      onMarkLearned(currentCard.id);
      setCompleted(new Set([...completed, currentCard.id]));
      // Check if this was the last card
      if (currentIndex === studyCards.length - 1) {
        setSessionComplete(true);
      } else {
        handleNext();
      }
    }
  };

  const handleStillLearning = () => {
    if (currentCard) {
      onMarkLearning(currentCard.id);
      setStillLearning(new Set([...stillLearning, currentCard.id]));
      // Check if this was the last card
      if (currentIndex === studyCards.length - 1) {
        setSessionComplete(true);
      } else {
        handleNext();
      }
    }
  };

  const handleToggleHard = useCallback(() => {
    if (currentCard && onToggleHard) {
      onToggleHard(currentCard.id, !hardWordIds?.has(currentCard.id));
    }
  }, [currentCard, onToggleHard, hardWordIds]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
        case 'Enter':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'KeyG':
          if (isFlipped) {
            e.preventDefault();
            handleGotIt();
          }
          break;
        case 'KeyS':
          if (isFlipped) {
            e.preventDefault();
            handleStillLearning();
          }
          break;
        case 'KeyH':
          e.preventDefault();
          handleToggleHard();
          break;
        case 'Slash':
          if (e.shiftKey) { // ? key
            e.preventDefault();
            setShowKeyboardHelp(prev => !prev);
          }
          break;
        case 'Escape':
          if (showKeyboardHelp) {
            e.preventDefault();
            setShowKeyboardHelp(false);
          } else if (showEtymology) {
            e.preventDefault();
            setShowEtymology(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentIndex, showEtymology, showKeyboardHelp, handleToggleHard]);

  // Calculate session stats
  const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
  const totalReviewed = completed.size + stillLearning.size;
  const accuracy = totalReviewed > 0 ? Math.round((completed.size / totalReviewed) * 100) : 0;
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (studyCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Sparkles className="h-10 w-10 text-success" />
        </div>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
          All cards mastered!
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {listName
            ? `You've learned all vocabulary cards in "${listName}". Great work!`
            : "You've learned all your vocabulary cards. Add more words to continue your GRE prep journey."}
        </p>
        <Button onClick={onExit}>Back to Cards</Button>
      </motion.div>
    );
  }

  // Session complete summary
  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h2 className="font-display text-3xl font-semibold text-foreground mb-3">
          Session Complete!
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          {listName ? `Great job studying "${listName}"!` : 'Great job on your study session!'}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-8 w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
              <Check className="h-5 w-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{completed.size}</p>
            <p className="text-xs text-muted-foreground">Mastered</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
              <RotateCcw className="h-5 w-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{stillLearning.size}</p>
            <p className="text-xs text-muted-foreground">Still Learning</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Clock className="h-4 w-4" />
          <span>Session duration: {formatDuration(sessionDuration)}</span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onExit}>
            Back to Cards
          </Button>
          <Button onClick={() => {
            setSessionComplete(false);
            setCurrentIndex(0);
            setCompleted(new Set());
            setStillLearning(new Set());
            setIsFlipped(false);
          }}>
            Study Again
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Study
        </Button>
        <div className="text-center">
          {listName && (
            <p className="text-xs text-muted-foreground mb-1">{listName}</p>
          )}
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {studyCards.length}
          </span>
        </div>
        <div className="w-32 flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyboardHelp(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Show keyboard shortcuts"
          >
            <Keyboard className="h-4 w-4" />
          </Button>
          {onToggleHard && (
            <HardWordButton
              isHard={hardWordIds?.has(currentCard?.id || '') || false}
              onToggle={() => currentCard && onToggleHard(currentCard.id, !hardWordIds?.has(currentCard.id))}
            />
          )}
          {currentCard?.etymology && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEtymology(!showEtymology)}
              className={showEtymology ? 'text-primary' : 'text-muted-foreground'}
              aria-label={showEtymology ? "Hide etymology" : "Show etymology"}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {completed.size} cards mastered this session
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-lg"
          >
            <div className="perspective-1000">
              <motion.div
                className="relative w-full min-h-80 cursor-pointer preserve-3d"
                onClick={handleFlip}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front - shows word (standard) or definition (reverse) */}
                <div
                  className="absolute inset-0 rounded-3xl bg-card/95 border border-border/50 shadow-2xl p-8 flex flex-col items-center justify-center min-h-80 transition-all duration-300 hover:scale-[1.02]"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  {getCardDirection(currentCard.id) === 'standard' ? (
                    // Standard mode: show word
                    <>
                      <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground text-center tracking-tight">
                        {currentCard.word}
                      </h2>
                      {currentCard.part_of_speech && (
                        <p className="text-lg italic text-primary/80 mt-3 uppercase tracking-widest text-sm">
                          {currentCard.part_of_speech}
                        </p>
                      )}
                      {currentCard.tags && currentCard.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-center mt-4">
                          {currentCard.tags.map((tag) => (
                            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Reverse mode: show definition
                    <>
                      <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">What word means...</p>
                      <p className="text-xl md:text-2xl text-foreground text-center leading-relaxed font-medium max-w-md">
                        {currentCard.definition}
                      </p>
                      {currentCard.part_of_speech && (
                        <p className="text-sm italic text-primary/80 mt-4 uppercase tracking-widest">
                          ({currentCard.part_of_speech})
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-sm text-muted-foreground mt-8 animate-pulse">Tap to reveal</p>
                </div>

                {/* Back - shows definition (standard) or word (reverse) */}
                <div
                  className="absolute inset-0 rounded-3xl bg-card/95 border border-border/50 shadow-2xl p-8 flex flex-col min-h-80"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <div className="min-h-full flex flex-col items-center justify-center">
                      {getCardDirection(currentCard.id) === 'standard' ? (
                        // Standard mode: show definition
                        <>
                          {currentCard.part_of_speech && (
                            <p className="text-primary/80 mb-3 uppercase tracking-widest text-sm font-medium">
                              {currentCard.part_of_speech}
                            </p>
                          )}
                          <p className="text-xl md:text-2xl text-foreground text-center leading-relaxed font-medium">
                            {currentCard.definition}
                          </p>
                        </>
                      ) : (
                        // Reverse mode: show word
                        <>
                          <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">The word is...</p>
                          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground text-center tracking-tight">
                            {currentCard.word}
                          </h2>
                          {currentCard.part_of_speech && (
                            <p className="text-lg italic text-primary/80 mt-3 uppercase tracking-widest text-sm">
                              {currentCard.part_of_speech}
                            </p>
                          )}
                          <div className="mt-6 pt-6 border-t border-border/50 w-full">
                            <p className="text-base text-foreground/80 text-center">
                              {currentCard.definition}
                            </p>
                          </div>
                        </>
                      )}
                      {currentCard.example && getCardDirection(currentCard.id) === 'standard' && (
                        <div className="mt-6 pt-6 border-t border-white/10 w-full">
                          <p className="text-base text-muted-foreground text-center italic">
                            "{currentCard.example}"
                          </p>
                        </div>
                      )}
                      
                      <div className="w-full">
                        <WordConnections card={currentCard} allCards={allCards} showEtymology={true} />
                      </div>

                      {/* Mnemonic Display */}
                      {getMnemonic && (
                        <div className="w-full mt-4">
                          <MnemonicDisplay
                            mnemonic={getMnemonic(currentCard.id)}
                            isGenerating={isGeneratingMnemonic?.(currentCard.id) || false}
                            onGenerate={() => onGenerateMnemonic?.(
                              currentCard.id,
                              currentCard.word,
                              currentCard.definition,
                              currentCard.part_of_speech,
                              currentCard.etymology
                            )}
                            compact={false}
                          />
                        </div>
                      )}

                      {/* Confusion Cluster Display */}
                      {(() => {
                        const cluster = findClusterForWord(currentCard.word);
                        return cluster ? (
                          <div className="w-full mt-4">
                            <ConfusionClusterCard
                              cluster={cluster}
                              currentWord={currentCard.word}
                              compact={false}
                            />
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Etymology Panel */}
      <AnimatePresence>
        {showEtymology && currentCard.etymology && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-card border-t border-border shadow-2xl"
          >
            <div className="container max-w-lg mx-auto">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <GitBranch className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">Word Origin</h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowEtymology(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground/90 font-mono leading-relaxed">
                    {currentCard.etymology}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4">
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 items-center"
          >
            {currentCard.etymology && !showEtymology && (
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setShowEtymology(true)}
                 className="text-muted-foreground hover:text-primary"
               >
                 <GitBranch className="h-4 w-4 mr-2" />
                 Show Origin
               </Button>
            )}

            <div className="flex gap-3 justify-center w-full">
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
                onClick={handleStillLearning}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Still Learning
              </Button>
              <Button
                size="lg"
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={handleGotIt}
              >
                <Check className="h-4 w-4 mr-2" />
                Got It!
              </Button>
            </div>
          </motion.div>
        )}
        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous card"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === studyCards.length - 1}
            aria-label="Next card"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Etymology Side Panel */}
      {showEtymology && currentCard?.etymology && (
        <div className="fixed right-0 top-0 h-full w-80 md:w-96 bg-card border-l shadow-xl z-50 animate-in slide-in-from-right duration-300">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-primary/5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Etymology</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowEtymology(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-2xl font-bold text-primary mb-1">{currentCard.word}</h4>
                  <p className="text-sm text-muted-foreground italic">{currentCard.part_of_speech}</p>
                </div>
                <div className="h-px bg-border" />
                <div className="space-y-3">
                  <p className="text-base leading-relaxed">
                    {currentCard.etymology}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for etymology panel */}
      {showEtymology && (
        <div
          className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-200"
          onClick={() => setShowEtymology(false)}
        />
      )}

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
            onClick={() => setShowKeyboardHelp(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Keyboard className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">Keyboard Shortcuts</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowKeyboardHelp(false)} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Flip card</span>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Space</kbd>
                  <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">Enter</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Previous card</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">&larr;</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Next card</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">&rarr;</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Got It (when flipped)</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">G</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Still Learning (when flipped)</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">S</kbd>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <span className="text-muted-foreground">Toggle hard word</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">H</kbd>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Show this help</span>
                <kbd className="px-2 py-1 rounded bg-muted text-xs font-mono">?</kbd>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">Esc</kbd> to close
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
