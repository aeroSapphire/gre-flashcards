import { useState, useEffect, useMemo } from 'react';
import { Flashcard, FlashcardList } from '@/types/flashcard';

const STORAGE_KEY = 'gre-flashcards';
const LISTS_STORAGE_KEY = 'gre-flashcard-lists';
const WORDS_PER_LIST = 30;

const defaultCards: Flashcard[] = [
  {
    id: '1',
    word: 'Ephemeral',
    definition: 'Lasting for a very short time; transitory',
    example: 'The ephemeral beauty of cherry blossoms reminds us to appreciate the present moment.',
    status: 'new',
    createdAt: Date.now(),
  },
  {
    id: '2',
    word: 'Obfuscate',
    definition: 'To make unclear or confusing; to bewilder',
    example: 'The politician tried to obfuscate the real issue with irrelevant details.',
    status: 'new',
    createdAt: Date.now(),
  },
  {
    id: '3',
    word: 'Pernicious',
    definition: 'Having a harmful effect, especially in a gradual or subtle way',
    example: 'The pernicious influence of misinformation can erode public trust.',
    status: 'new',
    createdAt: Date.now(),
  },
  {
    id: '4',
    word: 'Sanguine',
    definition: 'Optimistic or positive, especially in a difficult situation',
    example: 'Despite the setbacks, she remained sanguine about the project\'s success.',
    status: 'new',
    createdAt: Date.now(),
  },
  {
    id: '5',
    word: 'Laconic',
    definition: 'Using very few words; concise to the point of seeming rude',
    example: 'His laconic reply of "Fine" revealed nothing about his true feelings.',
    status: 'new',
    createdAt: Date.now(),
  },
];

export function useFlashcards() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [lists, setLists] = useState<FlashcardList[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cards and lists from localStorage
  useEffect(() => {
    const storedCards = localStorage.getItem(STORAGE_KEY);
    const storedLists = localStorage.getItem(LISTS_STORAGE_KEY);
    
    if (storedCards) {
      setCards(JSON.parse(storedCards));
    } else {
      setCards(defaultCards);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCards));
    }
    
    if (storedLists) {
      setLists(JSON.parse(storedLists));
    }
    
    setIsLoaded(true);
  }, []);

  // Save cards to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards, isLoaded]);

  // Save lists to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(lists));
    }
  }, [lists, isLoaded]);

  // Auto-generate lists based on card count
  const autoLists = useMemo(() => {
    const cardsWithoutList = cards.filter(c => !c.listId);
    const numAutoLists = Math.ceil(cardsWithoutList.length / WORDS_PER_LIST);
    
    const generatedLists: FlashcardList[] = [];
    for (let i = 0; i < numAutoLists; i++) {
      const existingList = lists.find(l => l.id === `auto-${i + 1}`);
      generatedLists.push({
        id: `auto-${i + 1}`,
        name: existingList?.name || `List ${i + 1}`,
        createdAt: existingList?.createdAt || Date.now(),
      });
    }
    
    return generatedLists;
  }, [cards, lists]);

  // Combine manual lists with auto-generated lists
  const allLists = useMemo(() => {
    const manualLists = lists.filter(l => !l.id.startsWith('auto-'));
    return [...autoLists, ...manualLists];
  }, [autoLists, lists]);

  // Get cards for a specific list
  const getCardsForList = (listId: string): Flashcard[] => {
    const cardsWithoutList = cards.filter(c => !c.listId);
    
    if (listId.startsWith('auto-')) {
      const listNum = parseInt(listId.split('-')[1], 10);
      const startIdx = (listNum - 1) * WORDS_PER_LIST;
      const endIdx = startIdx + WORDS_PER_LIST;
      return cardsWithoutList.slice(startIdx, endIdx);
    }
    
    return cards.filter(c => c.listId === listId);
  };

  // Get stats for a specific list
  const getListStats = (listId: string) => {
    const listCards = getCardsForList(listId);
    return {
      total: listCards.length,
      new: listCards.filter(c => c.status === 'new').length,
      learning: listCards.filter(c => c.status === 'learning').length,
      learned: listCards.filter(c => c.status === 'learned').length,
    };
  };

  const addCard = (word: string, definition: string, example?: string, listId?: string) => {
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      word,
      definition,
      example,
      status: 'new',
      createdAt: Date.now(),
      listId,
    };
    setCards((prev) => [newCard, ...prev]);
  };

  const updateCard = (id: string, updates: Partial<Omit<Flashcard, 'id' | 'createdAt'>>) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, ...updates } : card))
    );
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((card) => card.id !== id));
  };

  const markAsLearned = (id: string) => {
    updateCard(id, { status: 'learned', lastReviewedAt: Date.now() });
  };

  const markAsLearning = (id: string) => {
    updateCard(id, { status: 'learning', lastReviewedAt: Date.now() });
  };

  const resetCard = (id: string) => {
    updateCard(id, { status: 'new', lastReviewedAt: undefined });
  };

  const renameList = (listId: string, newName: string) => {
    setLists((prev) => {
      const existingIdx = prev.findIndex(l => l.id === listId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], name: newName };
        return updated;
      }
      // If it's an auto-list that hasn't been customized yet, add it
      return [...prev, { id: listId, name: newName, createdAt: Date.now() }];
    });
  };

  const createList = (name: string) => {
    const newList: FlashcardList = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
    };
    setLists((prev) => [...prev, newList]);
    return newList.id;
  };

  const deleteList = (listId: string) => {
    // Move cards from deleted list back to unassigned
    setCards((prev) =>
      prev.map((card) => (card.listId === listId ? { ...card, listId: undefined } : card))
    );
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const moveCardToList = (cardId: string, listId: string | undefined) => {
    updateCard(cardId, { listId });
  };

  const stats = {
    total: cards.length,
    new: cards.filter((c) => c.status === 'new').length,
    learning: cards.filter((c) => c.status === 'learning').length,
    learned: cards.filter((c) => c.status === 'learned').length,
  };

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
    createList,
    deleteList,
    moveCardToList,
    getCardsForList,
    getListStats,
    stats,
  };
}
