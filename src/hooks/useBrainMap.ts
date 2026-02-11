import { useState, useEffect, useCallback } from 'react';
import { BrainMap } from '@/data/brainMapSchema';
import { useAuth } from '@/contexts/AuthContext';
import {
  initializeBrainMap,
  updateSkillAfterAnswer,
  updateTrapProfile,
  addTestToHistory,
  markLessonComplete,
} from '@/utils/brainMap';

const STORAGE_KEY = 'gre-verbal-brain-map';

function loadBrainMap(userId: string): BrainMap {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load brain map:', e);
  }
  return initializeBrainMap(userId);
}

function saveBrainMap(brainMap: BrainMap): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${brainMap.userId}`, JSON.stringify(brainMap));
  } catch (e) {
    console.error('Failed to save brain map:', e);
  }
}

export function useBrainMap() {
  const { user } = useAuth();
  const [brainMap, setBrainMap] = useState<BrainMap | null>(null);

  // Load on mount / user change
  useEffect(() => {
    if (user?.id) {
      setBrainMap(loadBrainMap(user.id));
    } else {
      setBrainMap(null);
    }
  }, [user?.id]);

  // Save on every change
  useEffect(() => {
    if (brainMap) {
      saveBrainMap(brainMap);
    }
  }, [brainMap]);

  const recordAnswer = useCallback((skillId: string, difficulty: number, correct: boolean) => {
    setBrainMap(prev => {
      if (!prev) return prev;
      return updateSkillAfterAnswer(prev, skillId, difficulty, correct);
    });
  }, []);

  const recordTrap = useCallback((trapId: string, fellFor: boolean) => {
    setBrainMap(prev => {
      if (!prev) return prev;
      return updateTrapProfile(prev, trapId, fellFor);
    });
  }, []);

  const recordTest = useCallback((entry: BrainMap['testHistory'][0]) => {
    setBrainMap(prev => {
      if (!prev) return prev;
      return addTestToHistory(prev, entry);
    });
  }, []);

  const completeLesson = useCallback((skillId: string, quickCheckScore: number) => {
    setBrainMap(prev => {
      if (!prev) return prev;
      return markLessonComplete(prev, skillId, quickCheckScore);
    });
  }, []);

  const resetBrainMap = useCallback(() => {
    if (user?.id) {
      const fresh = initializeBrainMap(user.id);
      setBrainMap(fresh);
    }
  }, [user?.id]);

  return {
    brainMap,
    recordAnswer,
    recordTrap,
    recordTest,
    completeLesson,
    resetBrainMap,
    isLoaded: brainMap !== null
  };
}
