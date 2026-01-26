import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Edit2, Check, X, Trash2 } from 'lucide-react';
import { FlashcardList } from '@/hooks/useFlashcardsDb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ListCardProps {
  list: FlashcardList;
  stats: {
    total: number;
    new: number;
    learning: number;
    learned: number;
  };
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete?: () => void;
  isAutoList?: boolean;
}

export function ListCard({ list, stats, onSelect, onRename, onDelete, isAutoList }: ListCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);

  const handleSaveEdit = () => {
    if (editName.trim()) {
      onRename(editName.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(list.name);
    setIsEditing(false);
  };

  const progressPercent = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-2xl bg-card border border-border shadow-lg p-6 cursor-pointer transition-all hover:shadow-xl hover:border-primary/30',
        progressPercent === 100 && 'border-success/40 bg-success/5'
      )}
      onClick={() => !isEditing && onSelect()}
    >
      {/* Progress bar background */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-muted rounded-b-2xl overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-success"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          {isEditing ? (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 w-40"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
              />
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveEdit}>
                <Check className="h-4 w-4 text-success" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleCancelEdit}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <h3 className="font-display text-xl font-semibold text-foreground">{list.name}</h3>
          )}
        </div>
        {!isEditing && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {!isAutoList && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">{stats.total} words</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">{stats.new}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-accent">{stats.learning}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-success">{stats.learned}</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
