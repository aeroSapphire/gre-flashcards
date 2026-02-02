import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  generateMnemonic as generateMnemonicService,
  saveMnemonic,
  StoredMnemonic
} from '@/services/mnemonicService';
import { toast } from 'sonner';

export function useMnemonics() {
  const [mnemonics, setMnemonics] = useState<StoredMnemonic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

  // Create a Map for O(1) lookup by flashcard_id
  const mnemonicsMap = useMemo(() => {
    const map = new Map<string, StoredMnemonic>();
    mnemonics.forEach(m => map.set(m.flashcard_id, m));
    return map;
  }, [mnemonics]);

  const fetchMnemonics = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('word_mnemonics')
        .select('*');

      if (error) throw error;
      setMnemonics(data || []);
    } catch (error) {
      console.error('Error fetching mnemonics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMnemonics();
  }, [fetchMnemonics]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('mnemonics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'word_mnemonics',
        },
        () => {
          fetchMnemonics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMnemonics]);

  const getMnemonic = useCallback((flashcardId: string): StoredMnemonic | null => {
    return mnemonicsMap.get(flashcardId) || null;
  }, [mnemonicsMap]);

  const hasMnemonic = useCallback((flashcardId: string): boolean => {
    return mnemonicsMap.has(flashcardId);
  }, [mnemonicsMap]);

  const generateAndSaveMnemonic = useCallback(async (
    flashcardId: string,
    word: string,
    definition: string,
    partOfSpeech?: string | null,
    etymology?: string | null
  ): Promise<StoredMnemonic | null> => {
    setGeneratingFor(flashcardId);

    try {
      // Generate mnemonic using AI
      const result = await generateMnemonicService(word, definition, partOfSpeech, etymology);

      if (!result) {
        toast.error('Failed to generate mnemonic');
        return null;
      }

      // Save to database
      const saved = await saveMnemonic(flashcardId, result.mnemonic, result.technique);

      if (!saved) {
        toast.error('Failed to save mnemonic');
        return null;
      }

      // Optimistic update
      setMnemonics(prev => {
        const existing = prev.findIndex(m => m.flashcard_id === flashcardId);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = saved;
          return updated;
        }
        return [...prev, saved];
      });

      toast.success('Mnemonic generated!');
      return saved;
    } catch (error) {
      console.error('Error generating mnemonic:', error);
      toast.error('Failed to generate mnemonic');
      return null;
    } finally {
      setGeneratingFor(null);
    }
  }, []);

  const isGenerating = useCallback((flashcardId: string): boolean => {
    return generatingFor === flashcardId;
  }, [generatingFor]);

  return {
    mnemonics,
    isLoading,
    getMnemonic,
    hasMnemonic,
    generateAndSaveMnemonic,
    isGenerating,
    refetch: fetchMnemonics,
  };
}
