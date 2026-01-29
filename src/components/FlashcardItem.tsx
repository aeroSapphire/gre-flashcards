import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RotateCcw, Trash2, Edit2, Users } from 'lucide-react';
import { FlashcardWithProgress } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface FlashcardItemProps {
  card: FlashcardWithProgress;
  onMarkLearned: (id: string) => void;
  onMarkLearning: (id: string) => void;
  onReset: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (card: FlashcardWithProgress) => void;
}

export function FlashcardItem({
  card,
  onMarkLearned,
  onMarkLearning,
  onReset,
  onDelete,
  onEdit,
}: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { user } = useAuth();

  // Filter out current user from learnedBy list
  const othersWhoLearned = card.learnedBy?.filter((p) => p.id !== user?.id) || [];

  const formatLearnedBy = () => {
    if (othersWhoLearned.length === 0) return null;
    if (othersWhoLearned.length === 1) {
      return `${othersWhoLearned[0].display_name} knows this`;
    }
    if (othersWhoLearned.length === 2) {
      return `${othersWhoLearned[0].display_name} & ${othersWhoLearned[1].display_name} know this`;
    }
    return `${othersWhoLearned[0].display_name} & ${othersWhoLearned.length - 1} others know this`;
  };

  const learnedByText = formatLearnedBy();

  return (
    <div className="perspective-1000 w-full">
      <motion.div
        className="relative w-full min-h-64 cursor-pointer preserve-3d"
        onClick={() => setIsFlipped(!isFlipped)}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div
          className={cn(
            'absolute inset-0 backface-hidden rounded-2xl bg-card border border-border shadow-lg p-6 flex flex-col min-h-64',
            card.status === 'learned' && 'border-success/40 bg-success/5',
            card.status === 'learning' && 'border-accent/40 bg-accent/5'
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between mb-4">
            <span
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded-full',
                card.status === 'new' && 'bg-muted text-muted-foreground',
                card.status === 'learning' && 'bg-accent/20 text-accent',
                card.status === 'learned' && 'bg-success/20 text-success'
              )}
            >
              {card.status === 'new' ? 'New' : card.status === 'learning' ? 'Learning' : 'Learned'}
            </span>
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit(card)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(card.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <h3 className="font-display text-3xl font-semibold text-foreground text-center">
              {card.word}
            </h3>
          </div>
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            {card.part_of_speech && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium italic">
                {card.part_of_speech}
              </span>
            )}
            {card.tags?.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {tag}
              </span>
            ))}
          </div>
          {learnedByText && (
            <div className="flex items-center justify-center gap-1 mb-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{learnedByText}</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground text-center">Tap to reveal definition</p>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-2xl bg-card border border-border shadow-lg p-6 flex flex-col min-h-64"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex-1 overflow-y-auto max-h-48 mb-4">
            <p className="text-lg text-foreground text-center leading-relaxed">
              {card.definition}
            </p>
            {card.example && (
              <p className="text-sm text-muted-foreground text-center italic mt-3">
                "{card.example}"
              </p>
            )}
          </div>
          <div className="flex gap-2 justify-center pt-4 border-t border-border/50 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {card.status !== 'learned' && (
              <Button
                size="sm"
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => onMarkLearned(card.id)}
              >
                <Check className="h-4 w-4 mr-1" />
                Got it!
              </Button>
            )}
            {card.status !== 'learning' && card.status !== 'new' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReset(card.id)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            {card.status === 'new' && (
              <Button
                size="sm"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10"
                onClick={() => onMarkLearning(card.id)}
              >
                Still learning
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
