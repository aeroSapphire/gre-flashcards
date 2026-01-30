import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'gre-vocab-offline';
const DB_VERSION = 3; // Bumped to refresh cache with etymology data

export interface PendingProgressUpdate {
  id: string;
  flashcard_id: string;
  status: 'new' | 'learning' | 'learned';
  srsData?: {
    next_review_at?: string | null;
    interval?: number;
    ease_factor?: number;
    repetitions?: number;
  };
  timestamp: number;
}

interface OfflineDB {
  flashcards: any[];
  tests: any[];
  questions: any[];
  lastSynced: string | null;
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains('flashcards')) {
        db.createObjectStore('flashcards', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('tests')) {
        db.createObjectStore('tests', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
      // Store for pending progress updates (offline queue)
      if (!db.objectStoreNames.contains('pendingUpdates')) {
        db.createObjectStore('pendingUpdates', { keyPath: 'id' });
      }
      // Store for local user progress (works offline)
      if (!db.objectStoreNames.contains('userProgress')) {
        db.createObjectStore('userProgress', { keyPath: 'flashcard_id' });
      }
    };
  });
}

// Generic store operations
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function putAllToStore<T>(storeName: string, items: T[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    // Clear existing data
    store.clear();

    // Add all items
    items.forEach(item => store.put(item));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

async function getMetadata(key: string): Promise<any> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('metadata', 'readonly');
    const store = transaction.objectStore('metadata');
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.value);
  });
}

async function setMetadata(key: string, value: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('metadata', 'readwrite');
    const store = transaction.objectStore('metadata');
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load last synced time
    getMetadata('lastSynced').then(time => {
      if (time) setLastSynced(new Date(time));
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache flashcards
  const cacheFlashcards = useCallback(async (flashcards: any[]) => {
    try {
      // Store with explicit order index to preserve exact server order
      const flashcardsWithOrder = flashcards.map((card, index) => ({
        ...card,
        _cacheOrder: index,
      }));
      await putAllToStore('flashcards', flashcardsWithOrder);
      const now = new Date().toISOString();
      await setMetadata('lastSynced', now);
      setLastSynced(new Date(now));
      console.log(`Cached ${flashcards.length} flashcards for offline use`);
    } catch (error) {
      console.error('Failed to cache flashcards:', error);
    }
  }, []);

  // Get cached flashcards (sorted by cache order to match server order)
  const getCachedFlashcards = useCallback(async () => {
    try {
      const flashcards = await getAllFromStore<any>('flashcards');
      // Sort by _cacheOrder to restore exact server order
      // This ensures cards stay in the same lists when offline
      return flashcards.sort((a, b) => (a._cacheOrder ?? 0) - (b._cacheOrder ?? 0));
    } catch (error) {
      console.error('Failed to get cached flashcards:', error);
      return [];
    }
  }, []);

  // Cache tests and questions
  const cacheTests = useCallback(async (tests: any[], questions: any[]) => {
    try {
      await putAllToStore('tests', tests);
      await putAllToStore('questions', questions);
      console.log(`Cached ${tests.length} tests and ${questions.length} questions`);
    } catch (error) {
      console.error('Failed to cache tests:', error);
    }
  }, []);

  // Get cached tests
  const getCachedTests = useCallback(async () => {
    try {
      return await getAllFromStore('tests');
    } catch (error) {
      console.error('Failed to get cached tests:', error);
      return [];
    }
  }, []);

  // Get cached questions
  const getCachedQuestions = useCallback(async (testId?: string) => {
    try {
      const questions = await getAllFromStore<any>('questions');
      if (testId) {
        return questions.filter(q => q.test_id === testId);
      }
      return questions;
    } catch (error) {
      console.error('Failed to get cached questions:', error);
      return [];
    }
  }, []);

  // ========== OFFLINE PROGRESS MANAGEMENT ==========

  // Add a pending progress update to the queue
  const queueProgressUpdate = useCallback(async (update: Omit<PendingProgressUpdate, 'id' | 'timestamp'>) => {
    try {
      const db = await openDB();
      const pendingUpdate: PendingProgressUpdate = {
        ...update,
        id: `${update.flashcard_id}-${Date.now()}`,
        timestamp: Date.now(),
      };

      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('pendingUpdates', 'readwrite');
        const store = transaction.objectStore('pendingUpdates');
        const request = store.put(pendingUpdate);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          console.log('Queued progress update for sync:', update.flashcard_id);
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to queue progress update:', error);
    }
  }, []);

  // Get all pending updates
  const getPendingUpdates = useCallback(async (): Promise<PendingProgressUpdate[]> => {
    try {
      return await getAllFromStore<PendingProgressUpdate>('pendingUpdates');
    } catch (error) {
      console.error('Failed to get pending updates:', error);
      return [];
    }
  }, []);

  // Clear a pending update after successful sync
  const clearPendingUpdate = useCallback(async (id: string) => {
    try {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('pendingUpdates', 'readwrite');
        const store = transaction.objectStore('pendingUpdates');
        const request = store.delete(id);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to clear pending update:', error);
    }
  }, []);

  // Clear all pending updates
  const clearAllPendingUpdates = useCallback(async () => {
    try {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('pendingUpdates', 'readwrite');
        const store = transaction.objectStore('pendingUpdates');
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to clear all pending updates:', error);
    }
  }, []);

  // Save user progress locally (for offline display)
  const saveLocalProgress = useCallback(async (flashcardId: string, progress: any) => {
    try {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction('userProgress', 'readwrite');
        const store = transaction.objectStore('userProgress');
        const request = store.put({ flashcard_id: flashcardId, ...progress });
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch (error) {
      console.error('Failed to save local progress:', error);
    }
  }, []);

  // Get all local progress
  const getLocalProgress = useCallback(async () => {
    try {
      return await getAllFromStore('userProgress');
    } catch (error) {
      console.error('Failed to get local progress:', error);
      return [];
    }
  }, []);

  // Cache user progress from server
  const cacheUserProgress = useCallback(async (progressArray: any[]) => {
    try {
      await putAllToStore('userProgress', progressArray.map(p => ({
        ...p,
        flashcard_id: p.flashcard_id
      })));
      console.log(`Cached ${progressArray.length} progress records`);
    } catch (error) {
      console.error('Failed to cache user progress:', error);
    }
  }, []);

  return {
    isOnline,
    lastSynced,
    cacheFlashcards,
    getCachedFlashcards,
    // Offline progress
    queueProgressUpdate,
    getPendingUpdates,
    clearPendingUpdate,
    clearAllPendingUpdates,
    saveLocalProgress,
    getLocalProgress,
    cacheUserProgress,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
