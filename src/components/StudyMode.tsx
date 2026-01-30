import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, RotateCcw, Sparkles, BookOpen, X, GitBranch } from 'lucide-react';
import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { generateExamples } from '@/services/sentenceEvaluator';
import { WordConnections } from '@/components/WordConnections';

interface StudyModeProps {
  cards: FlashcardWithProgress[];
  allCards: FlashcardWithProgress[];
  onMarkLearned: (id: string) => void;
  onMarkLearning: (id: string) => void;
  onUpdateCard?: (id: string, updates: any) => void;
  onExit: () => void;
  listName?: string;
}

export function StudyMode({ cards, allCards, onMarkLearned, onMarkLearning, onUpdateCard, onExit, listName }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showEtymology, setShowEtymology] = useState(false);

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
      handleNext();
    }
  };

  const handleStillLearning = () => {
    if (currentCard) {
      onMarkLearning(currentCard.id);
      handleNext();
    }
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
        <div className="w-20 flex justify-end">
          {currentCard?.etymology && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEtymology(!showEtymology)}
              className={showEtymology ? 'text-primary' : 'text-muted-foreground'}
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
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-3xl bg-card/95 border border-border/50 shadow-2xl p-8 flex flex-col items-center justify-center min-h-80 transition-all duration-300 hover:scale-[1.02]"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
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
                  <p className="text-sm text-muted-foreground mt-8 animate-pulse">Tap to reveal</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-3xl bg-card/95 border border-border/50 shadow-2xl p-8 flex flex-col min-h-80"
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="flex-1 overflow-y-auto -mx-2 px-2">
                    <div className="min-h-full flex flex-col items-center justify-center">
                      {currentCard.part_of_speech && (
                        <p className="text-primary/80 mb-3 uppercase tracking-widest text-sm font-medium">
                          {currentCard.part_of_speech}
                        </p>
                      )}
                      <p className="text-xl md:text-2xl text-foreground text-center leading-relaxed font-medium">
                        {currentCard.definition}
                      </p>
                      {currentCard.example && (
                        <div className="mt-6 pt-6 border-t border-white/10 w-full">
                          <p className="text-base text-muted-foreground text-center italic">
                            "{currentCard.example}"
                          </p>
                        </div>
                      )}
                      
                      <div className="w-full">
                        <WordConnections card={currentCard} allCards={allCards} showEtymology={true} />
                      </div>
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
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={currentIndex === studyCards.length - 1}
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
    </div>
  );
}
