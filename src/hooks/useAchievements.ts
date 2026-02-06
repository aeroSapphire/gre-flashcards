import { useMemo } from 'react';
import { useFlashcardsDb } from '@/hooks/useFlashcardsDb';
import { useStreak } from '@/hooks/useStreak';
import { useHardWords } from '@/hooks/useHardWords';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import {
  ACHIEVEMENTS,
  Achievement,
  UserAchievementProgress,
  getUnlockedAchievements,
  getNextAchievements,
} from '@/utils/achievements';

export function useAchievements() {
  const { stats, cards } = useFlashcardsDb();
  const { currentStreak, longestStreak } = useStreak();
  const { hardWordIds } = useHardWords();
  const { data: leaderboardData } = useLeaderboard();

  const progress = useMemo((): UserAchievementProgress => {
    // Count hard words that are now learned
    const hardWordsMastered = cards.filter(
      (card) => hardWordIds.has(card.id) && card.status === 'learned'
    ).length;

    return {
      wordsLearned: stats.learned,
      currentStreak,
      longestStreak,
      testsCompleted: leaderboardData?.userStats?.total_tests_taken || 0,
      bestTestScore: leaderboardData?.personalBests?.[0]?.percentage || 0,
      hardWordsMarked: hardWordIds.size,
      hardWordsMastered,
    };
  }, [stats.learned, currentStreak, longestStreak, leaderboardData, hardWordIds, cards]);

  const unlockedAchievements = useMemo(
    () => getUnlockedAchievements(progress),
    [progress]
  );

  const nextAchievements = useMemo(
    () => getNextAchievements(progress),
    [progress]
  );

  const unlockedIds = useMemo(
    () => new Set(unlockedAchievements.map((a) => a.id)),
    [unlockedAchievements]
  );

  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    nextAchievements.forEach(({ achievement, progress: prog }) => {
      map.set(achievement.id, prog);
    });
    return map;
  }, [nextAchievements]);

  return {
    allAchievements: ACHIEVEMENTS,
    unlockedAchievements,
    nextAchievements,
    unlockedIds,
    progressMap,
    progress,
    totalUnlocked: unlockedAchievements.length,
    totalAchievements: ACHIEVEMENTS.length,
  };
}
