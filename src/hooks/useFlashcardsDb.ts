import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  example?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FlashcardWithProgress extends Flashcard {
  status: 'new' | 'learning' | 'learned';
  learnedBy: UserProfile[];
}

export interface FlashcardList {
  id: string;
  name: string;
  is_auto: boolean;
  auto_index?: number;
  created_at: string;
}

interface UserProgress {
  user_id: string;
  flashcard_id: string;
  status: 'new' | 'learning' | 'learned';
}

interface UserStats {
  profile: UserProfile;
  learned: number;
  learning: number;
  total: number;
}

const WORDS_PER_LIST = 30;

export function useFlashcardsDb() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [myProgress, setMyProgress] = useState<Map<string, 'new' | 'learning' | 'learned'>>(new Map());
  const [allProgress, setAllProgress] = useState<UserProgress[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
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

  // Fetch current user's progress
  const fetchMyProgress = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_word_progress')
      .select('flashcard_id, status')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error loading progress:', error);
      return;
    }

    const progressMap = new Map<string, 'new' | 'learning' | 'learned'>();
    data?.forEach((p) => {
      progressMap.set(p.flashcard_id, p.status as 'new' | 'learning' | 'learned');
    });
    setMyProgress(progressMap);
  }, [user]);

  // Fetch all users' progress (for social features)
  const fetchAllProgress = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_word_progress')
      .select('user_id, flashcard_id, status')
      .eq('status', 'learned');

    if (error) {
      console.error('Error loading all progress:', error);
      return;
    }

    setAllProgress(data as UserProgress[]);
  }, []);

  // Fetch all profiles
  const fetchAllProfiles = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) {
      console.error('Error loading profiles:', error);
      return;
    }

    setAllProfiles(data as UserProfile[]);
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      // Safety timeout to ensure we don't get stuck in loading state
      const timeoutId = setTimeout(() => {
        setIsLoaded(true);
      }, 5000);

      Promise.all([
        fetchCards(),
        fetchLists(),
        fetchMyProgress(),
        fetchAllProgress(),
        fetchAllProfiles(),
      ])
        .then(() => {
          setIsLoaded(true);
          clearTimeout(timeoutId);
        })
        .catch((error) => {
          console.error('Error loading data:', error);
          setIsLoaded(true); // Still set loaded to show UI even if there's an error
          clearTimeout(timeoutId);
        });

      return () => clearTimeout(timeoutId);
    }
  }, [user, fetchCards, fetchLists, fetchMyProgress, fetchAllProgress, fetchAllProfiles]);

  // Set up realtime subscription - only for external changes (other users)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flashcards' },
        () => fetchCards()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'flashcard_lists' },
        () => fetchLists()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_word_progress' },
        (payload) => {
          // Only refetch if it's another user's change
          if (payload.new && (payload.new as any).user_id !== user.id) {
            fetchAllProgress();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        () => fetchAllProfiles()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchCards, fetchLists, fetchAllProgress, fetchAllProfiles]);

  // Pre-compute lookup maps for O(1) access
  const progressByCardId = useMemo(() => {
    const map = new Map<string, Set<string>>();
    allProgress.forEach((p) => {
      if (p.status === 'learned') {
        if (!map.has(p.flashcard_id)) {
          map.set(p.flashcard_id, new Set());
        }
        map.get(p.flashcard_id)!.add(p.user_id);
      }
    });
    return map;
  }, [allProgress]);

  const profilesById = useMemo(() => {
    const map = new Map<string, UserProfile>();
    allProfiles.forEach((p) => map.set(p.id, p));
    return map;
  }, [allProfiles]);

  // Cards with user's progress and who learned them - optimized with O(1) lookups
  const cardsWithProgress = useMemo((): FlashcardWithProgress[] => {
    return cards.map((card) => {
      const status = myProgress.get(card.id) || 'new';
      const learnedByUserIds = progressByCardId.get(card.id);
      const learnedBy: UserProfile[] = [];

      if (learnedByUserIds) {
        learnedByUserIds.forEach((userId) => {
          const profile = profilesById.get(userId);
          if (profile) {
            learnedBy.push(profile);
          }
        });
      }

      return {
        ...card,
        status,
        learnedBy,
      };
    });
  }, [cards, myProgress, progressByCardId, profilesById]);

  // Auto-generate lists based on card count
  const autoLists = useMemo(() => {
    const numAutoLists = Math.ceil(cards.length / WORDS_PER_LIST);

    const generatedLists: FlashcardList[] = [];
    for (let i = 0; i < numAutoLists; i++) {
      const existingList = lists.find((l) => l.is_auto && l.auto_index === i + 1);
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
    const manualLists = lists.filter((l) => !l.is_auto);
    return [...autoLists, ...manualLists];
  }, [autoLists, lists]);

  // Get cards for a specific list
  const getCardsForList = useCallback(
    (listId: string): FlashcardWithProgress[] => {
      if (listId.startsWith('auto-')) {
        const listNum = parseInt(listId.split('-')[1], 10);
        const startIdx = (listNum - 1) * WORDS_PER_LIST;
        const endIdx = startIdx + WORDS_PER_LIST;
        return cardsWithProgress.slice(startIdx, endIdx);
      }

      const list = lists.find((l) => l.id === listId);
      if (list?.is_auto && list.auto_index) {
        const startIdx = (list.auto_index - 1) * WORDS_PER_LIST;
        const endIdx = startIdx + WORDS_PER_LIST;
        return cardsWithProgress.slice(startIdx, endIdx);
      }

      return [];
    },
    [cardsWithProgress, lists]
  );

  // Get stats for a specific list
  const getListStats = useCallback(
    (listId: string) => {
      const listCards = getCardsForList(listId);
      return {
        total: listCards.length,
        new: listCards.filter((c) => c.status === 'new').length,
        learning: listCards.filter((c) => c.status === 'learning').length,
        learned: listCards.filter((c) => c.status === 'learned').length,
      };
    },
    [getCardsForList]
  );

  // Get all users' stats - optimized with pre-computed counts
  const allUserStats = useMemo((): UserStats[] => {
    // Pre-compute learned counts per user
    const learnedCountByUser = new Map<string, number>();
    allProgress.forEach((p) => {
      if (p.status === 'learned') {
        learnedCountByUser.set(p.user_id, (learnedCountByUser.get(p.user_id) || 0) + 1);
      }
    });

    return allProfiles.map((profile) => ({
      profile,
      learned: learnedCountByUser.get(profile.id) || 0,
      learning: 0,
      total: cards.length,
    })).sort((a, b) => b.learned - a.learned);
  }, [allProfiles, allProgress, cards.length]);

  const updateProgress = async (flashcardId: string, status: 'new' | 'learning' | 'learned') => {
    if (!user) return;

    // Optimistic update - update local state immediately
    setMyProgress((prev) => {
      const next = new Map(prev);
      next.set(flashcardId, status);
      return next;
    });

    // Also update allProgress for immediate leaderboard update
    if (status === 'learned') {
      setAllProgress((prev) => {
        const existing = prev.find((p) => p.user_id === user.id && p.flashcard_id === flashcardId);
        if (existing) {
          return prev.map((p) =>
            p.user_id === user.id && p.flashcard_id === flashcardId ? { ...p, status } : p
          );
        }
        return [...prev, { user_id: user.id, flashcard_id: flashcardId, status }];
      });
    } else {
      // Remove from allProgress if not learned
      setAllProgress((prev) =>
        prev.filter((p) => !(p.user_id === user.id && p.flashcard_id === flashcardId))
      );
    }

    // Show feedback
    toast({
      title: status === 'learned' ? 'Marked as learned!' : status === 'learning' ? 'Keep practicing!' : 'Reset to new',
      description: status === 'learned' ? 'Great job!' : undefined,
    });

    // Upsert progress to database
    const { error } = await supabase.from('user_word_progress').upsert(
      {
        user_id: user.id,
        flashcard_id: flashcardId,
        status,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,flashcard_id' }
    );

    if (error) {
      // Revert optimistic update on error
      fetchMyProgress();
      fetchAllProgress();
      toast({
        title: 'Error updating progress',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const addCard = async (word: string, definition: string, example?: string, tags?: string[]) => {
    const { error } = await supabase.from('flashcards').insert({
      word,
      definition,
      example,
      tags,
      status: 'new', // Keep for backward compatibility
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

  const updateCard = async (
    id: string,
    updates: Partial<Omit<Flashcard, 'id' | 'created_at' | 'created_by'>>
  ) => {
    // Optimistic update
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );

    const { error } = await supabase.from('flashcards').update(updates).eq('id', id);

    if (error) {
      // Revert on error
      fetchCards();
      toast({
        title: 'Error updating card',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Card updated',
        description: 'Your changes have been saved.',
      });
    }
  };

  const deleteCard = async (id: string) => {
    const { error } = await supabase.from('flashcards').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting card',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const markAsLearned = (id: string) => {
    updateProgress(id, 'learned');
  };

  const markAsLearning = (id: string) => {
    updateProgress(id, 'learning');
  };

  const resetCard = (id: string) => {
    updateProgress(id, 'new');
  };

  const renameList = async (listId: string, newName: string) => {
    const existingList = lists.find((l) => l.id === listId);

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

  const stats = useMemo(
    () => ({
      total: cardsWithProgress.length,
      new: cardsWithProgress.filter((c) => c.status === 'new').length,
      learning: cardsWithProgress.filter((c) => c.status === 'learning').length,
      learned: cardsWithProgress.filter((c) => c.status === 'learned').length,
    }),
    [cardsWithProgress]
  );

  return {
    cards: cardsWithProgress,
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
    allUserStats,
  };
}
