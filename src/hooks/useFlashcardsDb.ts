import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  tags?: string[];
  status: 'new' | 'learning' | 'learned';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FlashcardList {
  id: string;
  name: string;
  is_auto: boolean;
  auto_index?: number;
  created_at: string;
}

const WORDS_PER_LIST = 30;

export function useFlashcardsDb() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch cards from database
  const fetchCards = useCallback(async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading cards',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setCards(data as Flashcard[]);
  }, [toast]);

  // Fetch lists from database
  const fetchLists = useCallback(async () => {
    const { data, error } = await supabase
      .from('flashcard_lists')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: 'Error loading lists',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setLists(data as FlashcardList[]);
  }, [toast]);

  // Initial load
  useEffect(() => {
    if (user) {
      Promise.all([fetchCards(), fetchLists()]).then(() => {
        setIsLoaded(true);
      });
    }
  }, [user, fetchCards, fetchLists]);

  // Set up realtime subscription for flashcards
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('flashcards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flashcards',
        },
        () => {
          fetchCards();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flashcard_lists',
        },
        () => {
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCards, fetchLists]);

  // Auto-generate lists based on card count
  const autoLists = useMemo(() => {
    const numAutoLists = Math.ceil(cards.length / WORDS_PER_LIST);
    
    const generatedLists: FlashcardList[] = [];
    for (let i = 0; i < numAutoLists; i++) {
      const existingList = lists.find(l => l.is_auto && l.auto_index === i + 1);
      generatedLists.push({
        id: existingList?.id || `auto-${i + 1}`,
        name: existingList?.name || `List ${i + 1}`,
        is_auto: true,
        auto_index: i + 1,
        created_at: existingList?.created_at || new Date().toISOString(),
      });
    }
    
    return generatedLists;
  }, [cards.length, lists]);

  // Combine with manual lists
  const allLists = useMemo(() => {
    const manualLists = lists.filter(l => !l.is_auto);
    return [...autoLists, ...manualLists];
  }, [autoLists, lists]);

  // Get cards for a specific list
  const getCardsForList = useCallback((listId: string): Flashcard[] => {
    if (listId.startsWith('auto-')) {
      const listNum = parseInt(listId.split('-')[1], 10);
      const startIdx = (listNum - 1) * WORDS_PER_LIST;
      const endIdx = startIdx + WORDS_PER_LIST;
      return cards.slice(startIdx, endIdx);
    }
    
    const list = lists.find(l => l.id === listId);
    if (list?.is_auto && list.auto_index) {
      const startIdx = (list.auto_index - 1) * WORDS_PER_LIST;
      const endIdx = startIdx + WORDS_PER_LIST;
      return cards.slice(startIdx, endIdx);
    }
    
    return [];
  }, [cards, lists]);

  // Get stats for a specific list
  const getListStats = useCallback((listId: string) => {
    const listCards = getCardsForList(listId);
    return {
      total: listCards.length,
      new: listCards.filter(c => c.status === 'new').length,
      learning: listCards.filter(c => c.status === 'learning').length,
      learned: listCards.filter(c => c.status === 'learned').length,
    };
  }, [getCardsForList]);

  const addCard = async (word: string, definition: string, example?: string, tags?: string[]) => {
    const { error } = await supabase.from('flashcards').insert({
      word,
      definition,
      example,
      tags,
      status: 'new',
      created_by: user?.id,
    });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Word already exists',
          description: `"${word}" is already in your vocabulary list.`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error adding card',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const updateCard = async (id: string, updates: Partial<Omit<Flashcard, 'id' | 'created_at' | 'created_by'>>) => {
    const { error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error updating card',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting card',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAsLearned = (id: string) => {
    updateCard(id, { status: 'learned' });
  };

  const markAsLearning = (id: string) => {
    updateCard(id, { status: 'learning' });
  };

  const resetCard = (id: string) => {
    updateCard(id, { status: 'new' });
  };

  const renameList = async (listId: string, newName: string) => {
    // For auto-generated lists, we need to create or update in database
    const existingList = lists.find(l => l.id === listId);
    
    if (existingList) {
      const { error } = await supabase
        .from('flashcard_lists')
        .update({ name: newName })
        .eq('id', listId);

      if (error) {
        toast({
          title: 'Error renaming list',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else if (listId.startsWith('auto-')) {
      const autoIndex = parseInt(listId.split('-')[1], 10);
      const { error } = await supabase.from('flashcard_lists').insert({
        name: newName,
        is_auto: true,
        auto_index: autoIndex,
      });

      if (error) {
        toast({
          title: 'Error saving list name',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  const stats = useMemo(() => ({
    total: cards.length,
    new: cards.filter((c) => c.status === 'new').length,
    learning: cards.filter((c) => c.status === 'learning').length,
    learned: cards.filter((c) => c.status === 'learned').length,
  }), [cards]);

  return {
    cards,
    lists: allLists,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    markAsLearned,
    markAsLearning,
    resetCard,
    renameList,
    getCardsForList,
    getListStats,
    stats,
  };
}
