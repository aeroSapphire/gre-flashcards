import { useState, useEffect } from 'react';
import { Flashcard } from '@/hooks/useFlashcardsDb';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface AddCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (word: string, definition: string, example?: string, tags?: string[]) => void;
  onUpdate?: (id: string, updates: Partial<Omit<Flashcard, 'id' | 'created_at' | 'created_by'>>) => void;
  editingCard?: Flashcard | null;
}

export function AddCardDialog({
  open,
  onOpenChange,
  onAdd,
  onUpdate,
  editingCard,
}: AddCardDialogProps) {
  const [word, setWord] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (editingCard) {
      setWord(editingCard.word);
      setDefinition(editingCard.definition);
      setExample(editingCard.example || '');
      setTags(editingCard.tags?.join(', ') || '');
    } else {
      setWord('');
      setDefinition('');
      setExample('');
      setTags('');
    }
  }, [editingCard, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!word.trim() || !definition.trim()) return;

    const parsedTags = tags.trim() 
      ? tags.split(',').map(t => t.trim()).filter(Boolean)
      : undefined;

    if (editingCard && onUpdate) {
      onUpdate(editingCard.id, {
        word: word.trim(),
        definition: definition.trim(),
        example: example.trim() || undefined,
        tags: parsedTags,
      });
    } else {
      onAdd(word.trim(), definition.trim(), example.trim() || undefined, parsedTags);
    }

    setWord('');
    setDefinition('');
    setExample('');
    setTags('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {editingCard ? 'Edit Flashcard' : 'Add New Word'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g., Ephemeral"
              className="font-display text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="definition">Definition</Label>
            <Textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="e.g., Lasting for a very short time"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="example">Example Sentence (optional)</Label>
            <Textarea
              id="example"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="e.g., The ephemeral beauty of the sunset..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., GRE, difficult, vocab"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!word.trim() || !definition.trim()}>
              {editingCard ? 'Save Changes' : 'Add Card'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
