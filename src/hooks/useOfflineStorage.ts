import { useState, useEffect, useCallback } from 'react';

const DB_NAME = 'gre-vocab-offline';
const DB_VERSION = 1;

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
      await putAllToStore('flashcards', flashcards);
      const now = new Date().toISOString();
      await setMetadata('lastSynced', now);
      setLastSynced(new Date(now));
      console.log(`Cached ${flashcards.length} flashcards for offline use`);
    } catch (error) {
      console.error('Failed to cache flashcards:', error);
    }
  }, []);

  // Get cached flashcards
  const getCachedFlashcards = useCallback(async () => {
    try {
      return await getAllFromStore('flashcards');
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

  return {
    isOnline,
    lastSynced,
    cacheFlashcards,
    getCachedFlashcards,
    cacheTests,
    getCachedTests,
    getCachedQuestions,
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
