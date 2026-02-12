import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { ConfusionMatrix } from '@/utils/confusionMatrix';
import { createEmptyMatrix, recordConfusion as recordConfusionFn } from '@/utils/confusionMatrix';
import type { DrillResult } from '@/utils/clusterMastery';

const STORAGE_KEY = 'gre-word-web';

export interface WordWebState {
  userId: string;
  clustersVisited: string[];
  wordsExplored: string[];
  drillHistory: DrillResult[];
  confusionMatrix: ConfusionMatrix;
  clusterMastery: Record<string, number>; // clusterId → overall mastery 0-1
  lastUpdated: string;
}

function createInitialState(userId: string): WordWebState {
  return {
    userId,
    clustersVisited: [],
    wordsExplored: [],
    drillHistory: [],
    confusionMatrix: createEmptyMatrix(),
    clusterMastery: {},
    lastUpdated: new Date().toISOString(),
  };
}

function loadState(userId: string): WordWebState {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load word web state:', e);
  }
  return createInitialState(userId);
}

function saveState(state: WordWebState): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${state.userId}`, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save word web state:', e);
  }
}

export function useWordWeb() {
  const { user } = useAuth();
  const [state, setState] = useState<WordWebState | null>(null);

  // Load on mount / user change
  useEffect(() => {
    if (user?.id) {
      setState(loadState(user.id));
    } else {
      setState(null);
    }
  }, [user?.id]);

  // Save on every change
  useEffect(() => {
    if (state) {
      saveState(state);
    }
  }, [state]);

  const visitCluster = useCallback((clusterId: string) => {
    setState(prev => {
      if (!prev) return prev;
      if (prev.clustersVisited.includes(clusterId)) return prev;
      return {
        ...prev,
        clustersVisited: [...prev.clustersVisited, clusterId],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const exploreWord = useCallback((word: string) => {
    setState(prev => {
      if (!prev) return prev;
      const lower = word.toLowerCase();
      if (prev.wordsExplored.includes(lower)) return prev;
      return {
        ...prev,
        wordsExplored: [...prev.wordsExplored, lower],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const recordDrill = useCallback((result: DrillResult) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        drillHistory: [...prev.drillHistory, result],
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const recordConfusion = useCallback((correctWord: string, chosenWord: string) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        confusionMatrix: recordConfusionFn(prev.confusionMatrix, correctWord, chosenWord),
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const updateClusterMastery = useCallback((clusterId: string, mastery: number) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        clusterMastery: { ...prev.clusterMastery, [clusterId]: mastery },
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const resetState = useCallback(() => {
    if (user?.id) {
      setState(createInitialState(user.id));
    }
  }, [user?.id]);

  return {
    state,
    visitCluster,
    exploreWord,
    recordDrill,
    recordConfusion,
    updateClusterMastery,
    resetState,
    isLoaded: state !== null,
  };
}
