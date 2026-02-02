import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface HardWord {
  id: string;
  user_id: string;
  flashcard_id: string;
  marked_at: string;
  reason: string | null;
}

export function useHardWords() {
  const { user } = useAuth();
  const [hardWords, setHardWords] = useState<HardWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create a Set for O(1) lookup
  const hardWordIds = useMemo(() => new Set(hardWords.map(hw => hw.flashcard_id)), [hardWords]);

  const fetchHardWords = useCallback(async () => {
    if (!user) {
      setHardWords([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_hard_words')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setHardWords(data || []);
    } catch (error) {
      console.error('Error fetching hard words:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHardWords();
  }, [fetchHardWords]);

  // Real-time subscription for hard words
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('hard-words-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_hard_words',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchHardWords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchHardWords]);

  const toggleHardWord = useCallback(async (flashcardId: string, isHard: boolean, reason?: string) => {
    if (!user) {
      toast.error('Please sign in to mark words as hard');
      return;
    }

    try {
      if (isHard) {
        // Add to hard words
        const { error } = await supabase
          .from('user_hard_words')
          .insert({
            user_id: user.id,
            flashcard_id: flashcardId,
            reason: reason || null,
          });

        if (error) {
          // Handle unique constraint violation
          if (error.code === '23505') {
            console.log('Word already marked as hard');
            return;
          }
          throw error;
        }

        // Optimistic update
        setHardWords(prev => [...prev, {
          id: crypto.randomUUID(),
          user_id: user.id,
          flashcard_id: flashcardId,
          marked_at: new Date().toISOString(),
          reason: reason || null,
        }]);

        toast.success('Word marked as hard');
      } else {
        // Remove from hard words
        const { error } = await supabase
          .from('user_hard_words')
          .delete()
          .eq('user_id', user.id)
          .eq('flashcard_id', flashcardId);

        if (error) throw error;

        // Optimistic update
        setHardWords(prev => prev.filter(hw => hw.flashcard_id !== flashcardId));

        toast.success('Word unmarked as hard');
      }
    } catch (error) {
      console.error('Error toggling hard word:', error);
      toast.error('Failed to update hard word status');
      // Refresh to ensure consistency
      fetchHardWords();
    }
  }, [user, fetchHardWords]);

  const isHard = useCallback((flashcardId: string) => {
    return hardWordIds.has(flashcardId);
  }, [hardWordIds]);

  const getHardWordData = useCallback((flashcardId: string) => {
    return hardWords.find(hw => hw.flashcard_id === flashcardId);
  }, [hardWords]);

  return {
    hardWords,
    hardWordIds,
    isLoading,
    toggleHardWord,
    isHard,
    getHardWordData,
    refetch: fetchHardWords,
  };
}
