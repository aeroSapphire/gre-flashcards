import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { Flashcard } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StudyModeProps {
  cards: Flashcard[];
  onMarkLearned: (id: string) => void;
  onMarkLearning: (id: string) => void;
  onExit: () => void;
  listName?: string;
}

export function StudyMode({ cards, onMarkLearned, onMarkLearning, onExit, listName }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const studyCards = useMemo(
    () => cards.filter((c) => c.status !== 'learned'),
    [cards]
  );

  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? (completed.size / studyCards.length) * 100 : 0;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
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
        <div className="w-20" />
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
                className="relative w-full h-80 cursor-pointer preserve-3d"
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 backface-hidden rounded-2xl bg-card border border-border shadow-xl p-8 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <h2 className="font-display text-4xl font-semibold text-foreground text-center">
                    {currentCard.word}
                  </h2>
                  {currentCard.tags && currentCard.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mt-4">
                      {currentCard.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mt-6">Tap to reveal</p>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 backface-hidden rounded-2xl bg-card border border-border shadow-xl p-8 flex flex-col items-center justify-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <p className="text-xl text-foreground text-center leading-relaxed">
                    {currentCard.definition}
                  </p>
                  {currentCard.example && (
                    <p className="text-sm text-muted-foreground text-center italic mt-4">
                      "{currentCard.example}"
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4">
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-center"
          >
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
    </div>
  );
}
