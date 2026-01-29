import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserProfile } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { calculateNextReview, SRSRating } from '@/utils/srs';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  part_of_speech?: string;
  example?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface FlashcardWithProgress extends Flashcard {
  status: 'new' | 'learning' | 'learned';
  learnedBy: UserProfile[];
  next_review_at?: string;
  interval?: number;
  repetition?: number;
  ease_factor?: number;
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
  next_review_at?: string | null;
  interval?: number;
  ease_factor?: number;
  repetitions?: number;
}

interface UserStats {
  profile: UserProfile;
  learned: number;
  learning: number;
  total: number;
  testsTaken: number;
  avgScore: number;
}

const WORDS_PER_LIST = 30;

export function useFlashcardsDb() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [myProgress, setMyProgress] = useState<Map<string, UserProgress>>(new Map());
  const [allProgress, setAllProgress] = useState<UserProgress[]>([]);
  const [allTestAttempts, setAllTestAttempts] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isOnline,
    cacheFlashcards,
    getCachedFlashcards,
    queueProgressUpdate,
    getPendingUpdates,
    clearPendingUpdate,
    saveLocalProgress,
    getLocalProgress,
    cacheUserProgress,
  } = useOfflineStorage();

  // Fetch cards from database (with offline fallback)
  const fetchCards = useCallback(async () => {
    // Check online status directly for real-time accuracy
    const currentlyOnline = navigator.onLine;

    if (!currentlyOnline) {
      // Try to load from cache when offline
      try {
        const cachedCards = await getCachedFlashcards();
        if (cachedCards.length > 0) {
          setCards(cachedCards as Flashcard[]);
          toast({
            title: 'Offline mode',
            description: `Loaded ${cachedCards.length} cards from cache`,
          });
          return;
        }
      } catch (e) {
        console.error('Cache read error:', e);
      }
      toast({
        title: 'You are offline',
        description: 'No cached data available. Connect to internet to load cards.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCards(data as Flashcard[]);
      // Cache for offline use
      cacheFlashcards(data);
    } catch (error: any) {
      console.error('Fetch error, trying cache:', error);
      // Try cache on any error (network issues, etc.)
      try {
        const cachedCards = await getCachedFlashcards();
        if (cachedCards.length > 0) {
          setCards(cachedCards as Flashcard[]);
          toast({
            title: 'Using cached data',
            description: 'Could not connect to server',
          });
          return;
        }
      } catch (e) {
        console.error('Cache fallback error:', e);
      }
      toast({
        title: 'Error loading cards',
        description: error.message || 'Network error',
        variant: 'destructive',
      });
    }
  }, [toast, getCachedFlashcards, cacheFlashcards]);

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

  // Fetch current user's progress (with offline fallback)
  const fetchMyProgress = useCallback(async () => {
    if (!user) return;

    const currentlyOnline = navigator.onLine;

    if (!currentlyOnline) {
      // Load from local IndexedDB when offline
      try {
        const localProgress = await getLocalProgress();
        if (localProgress.length > 0) {
          const progressMap = new Map<string, UserProgress>();
          localProgress.forEach((p: any) => {
            progressMap.set(p.flashcard_id, {
              user_id: user.id,
              flashcard_id: p.flashcard_id,
              status: p.status,
              next_review_at: p.next_review_at,
              interval: p.interval,
              ease_factor: p.ease_factor,
              repetitions: p.repetitions,
            } as UserProgress);
          });
          setMyProgress(progressMap);
          console.log(`Loaded ${localProgress.length} progress records from local storage`);
        }
      } catch (e) {
        console.error('Error loading local progress:', e);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap = new Map<string, UserProgress>();
      data?.forEach((p) => {
        progressMap.set(p.flashcard_id, p as UserProgress);
      });
      setMyProgress(progressMap);

      // Cache progress to IndexedDB for offline use
      if (data && data.length > 0) {
        await cacheUserProgress(data);
        console.log(`Cached ${data.length} progress records for offline use`);
      }
    } catch (error: any) {
      console.error('Error loading progress, trying local storage:', error);
      // Try local storage on error
      try {
        const localProgress = await getLocalProgress();
        if (localProgress.length > 0) {
          const progressMap = new Map<string, UserProgress>();
          localProgress.forEach((p: any) => {
            progressMap.set(p.flashcard_id, {
              user_id: user.id,
              flashcard_id: p.flashcard_id,
              status: p.status,
              next_review_at: p.next_review_at,
              interval: p.interval,
              ease_factor: p.ease_factor,
              repetitions: p.repetitions,
            } as UserProgress);
          });
          setMyProgress(progressMap);
        }
      } catch (e) {
        console.error('Local storage fallback error:', e);
      }
    }
  }, [user, getLocalProgress, cacheUserProgress]);

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

  // Fetch all test attempts
  const fetchAllTestAttempts = useCallback(async () => {
    const { data, error } = await supabase
      .from('user_test_attempts')
      .select('user_id, score, total_questions');

    if (error) {
      console.error('Error loading test attempts:', error);
      return;
    }

    setAllTestAttempts(data || []);
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
        fetchAllTestAttempts(),
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
  }, [user, fetchCards, fetchLists, fetchMyProgress, fetchAllProgress, fetchAllProfiles, fetchAllTestAttempts]);

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

  // Sync pending updates when coming back online
  const syncPendingUpdates = useCallback(async () => {
    if (!user) return;

    const pendingUpdates = await getPendingUpdates();
    if (pendingUpdates.length === 0) return;

    console.log(`Syncing ${pendingUpdates.length} pending updates...`);

    let syncedCount = 0;
    for (const update of pendingUpdates) {
      try {
        const { error } = await supabase.from('user_word_progress').upsert(
          {
            user_id: user.id,
            flashcard_id: update.flashcard_id,
            status: update.status,
            ...update.srsData,
            last_reviewed_at: new Date(update.timestamp).toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,flashcard_id' }
        );

        if (!error) {
          await clearPendingUpdate(update.id);
          syncedCount++;
        }
      } catch (e) {
        console.error('Failed to sync update:', e);
      }
    }

    if (syncedCount > 0) {
      toast({
        title: 'Progress synced!',
        description: `${syncedCount} update${syncedCount > 1 ? 's' : ''} synced to server.`,
      });
      // Refresh data from server
      fetchMyProgress();
      fetchAllProgress();
    }
  }, [user, getPendingUpdates, clearPendingUpdate, toast, fetchMyProgress, fetchAllProgress]);

  // Listen for online status changes and sync when back online
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online, syncing pending updates...');
      syncPendingUpdates();
    };

    window.addEventListener('online', handleOnline);

    // Also sync on initial load if online
    if (navigator.onLine) {
      syncPendingUpdates();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
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
      const userProgress = myProgress.get(card.id);
      const status = userProgress?.status || 'new';
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
        next_review_at: userProgress?.next_review_at || undefined,
        interval: userProgress?.interval,
        repetition: userProgress?.repetitions,
        ease_factor: userProgress?.ease_factor,
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

    // Pre-compute test stats per user
    const testStatsByUser = new Map<string, { totalTaken: number; totalScore: number; totalQuestions: number }>();
    allTestAttempts.forEach((attempt: any) => {
      const stats = testStatsByUser.get(attempt.user_id) || { totalTaken: 0, totalScore: 0, totalQuestions: 0 };
      stats.totalTaken += 1;
      stats.totalScore += attempt.score || 0;
      stats.totalQuestions += attempt.total_questions || 0;
      testStatsByUser.set(attempt.user_id, stats);
    });

    return allProfiles.map((profile) => {
      const testStats = testStatsByUser.get(profile.id);
      const avgScore = testStats && testStats.totalQuestions > 0
        ? Math.round((testStats.totalScore / testStats.totalQuestions) * 100)
        : 0;

      return {
        profile,
        learned: learnedCountByUser.get(profile.id) || 0,
        learning: 0,
        total: cards.length,
        testsTaken: testStats?.totalTaken || 0,
        avgScore,
      };
    }).sort((a, b) => b.learned - a.learned);
  }, [allProfiles, allProgress, cards.length, allTestAttempts]);

  const updateProgress = async (flashcardId: string, status: 'new' | 'learning' | 'learned', srsUpdates?: Partial<UserProgress>) => {
    if (!user) return;

    const progressData = {
      user_id: user.id,
      flashcard_id: flashcardId,
      status,
      ...srsUpdates,
      last_reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic update - update local state immediately
    setMyProgress((prev) => {
      const next = new Map(prev);
      const existing = next.get(flashcardId) || { user_id: user.id, flashcard_id: flashcardId, status: 'new' };
      next.set(flashcardId, { ...existing, status, ...srsUpdates });
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

    // Save to local IndexedDB for offline persistence
    await saveLocalProgress(flashcardId, progressData);

    // Check if we're online
    const currentlyOnline = navigator.onLine;

    if (!currentlyOnline) {
      // Queue update for later sync
      await queueProgressUpdate({
        flashcard_id: flashcardId,
        status,
        srsData: srsUpdates ? {
          next_review_at: srsUpdates.next_review_at,
          interval: srsUpdates.interval,
          ease_factor: srsUpdates.ease_factor,
          repetitions: srsUpdates.repetitions,
        } : undefined,
      });

      toast({
        title: status === 'learned' ? 'Marked as learned!' : status === 'learning' ? 'Keep practicing!' : 'Reset to new',
        description: 'Saved offline. Will sync when back online.',
      });
      return;
    }

    // Show feedback
    toast({
      title: status === 'learned' ? 'Marked as learned!' : status === 'learning' ? 'Keep practicing!' : 'Reset to new',
      description: status === 'learned' ? 'Great job!' : undefined,
    });

    // Upsert progress to database
    const { error } = await supabase.from('user_word_progress').upsert(
      progressData,
      { onConflict: 'user_id,flashcard_id' }
    );

    if (error) {
      // Queue for later sync instead of reverting
      await queueProgressUpdate({
        flashcard_id: flashcardId,
        status,
        srsData: srsUpdates ? {
          next_review_at: srsUpdates.next_review_at,
          interval: srsUpdates.interval,
          ease_factor: srsUpdates.ease_factor,
          repetitions: srsUpdates.repetitions,
        } : undefined,
      });

      toast({
        title: 'Saved locally',
        description: 'Will sync when connection is restored.',
      });
    }
  };

  const addCard = async (word: string, definition: string, part_of_speech?: string, example?: string, tags?: string[]) => {
    const { error } = await supabase.from('flashcards').insert({
      word,
      definition,
      part_of_speech,
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
    // Mark as learned AND set next_review_at to NOW so it appears in SRS queue
    updateProgress(id, 'learned', {
      next_review_at: new Date().toISOString(),
      interval: 0,
      ease_factor: 2.5,
      repetitions: 0
    });
  };

  const markAsLearning = (id: string) => {
    // Mark as still learning (not mastered yet)
    updateProgress(id, 'learning');
  };

  const resetCard = (id: string) => {
    updateProgress(id, 'new', {
      interval: 0,
      ease_factor: 2.5,
      repetitions: 0,
      next_review_at: null
    });
  };

  const reviewCard = async (cardId: string, rating: SRSRating) => {
    const currentProgress = myProgress.get(cardId);

    // Calculate new SRS state
    const { state, nextReviewDate } = calculateNextReview(rating, currentProgress ? {
      interval: currentProgress.interval || 0,
      ease_factor: currentProgress.ease_factor || 2.5,
      repetitions: currentProgress.repetitions || 0
    } : undefined);

    // SRS ratings only affect WHEN the card appears next, NOT the learned status
    // Keep the current status (should be 'learned') - don't change it based on rating
    const currentStatus = currentProgress?.status || 'learned';

    await updateProgress(cardId, currentStatus, {
      ...state,
      next_review_at: nextReviewDate.toISOString()
    });
  };

  // True Spaced Repetition: Get cards that are DUE for review
  // A card is due if: status is 'learned' AND next_review_at <= now
  const dueCards = useMemo(() => {
    const now = new Date();

    // Filter to only LEARNED cards that are due for review
    const dueForReview = cardsWithProgress.filter(card => {
      // Must be marked as "learned" (user clicked "Got it")
      if (card.status !== 'learned') return false;

      // If no review date set, it's due immediately
      if (!card.next_review_at) return true;

      // Check if the review date has passed
      return new Date(card.next_review_at) <= now;
    });

    // Shuffle the due cards for randomized review using Fisher-Yates algorithm
    const shuffled = [...dueForReview];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, [cardsWithProgress]);

  const stats = useMemo(() => {
    return {
      total: cardsWithProgress.length,
      new: cardsWithProgress.filter((c) => c.status === 'new').length,
      learning: cardsWithProgress.filter((c) => c.status === 'learning').length,
      learned: cardsWithProgress.filter((c) => c.status === 'learned').length,
    };
  }, [cardsWithProgress]);

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
    }
  };

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
    reviewCard,
    getCardsForList,
    getListStats,
    stats,
    dueCards,
    allUserStats,
    renameList,
  };
}
