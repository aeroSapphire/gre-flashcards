export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  threshold: number;
  category: 'words' | 'streak' | 'test' | 'hard';
}

export const ACHIEVEMENTS: Achievement[] = [
  // Word learning achievements
  { id: 'first_10', name: 'First Steps', description: 'Learn 10 words', icon: '🌱', threshold: 10, category: 'words' },
  { id: 'half_century', name: 'Half Century', description: 'Learn 50 words', icon: '📖', threshold: 50, category: 'words' },
  { id: 'century', name: 'Century', description: 'Learn 100 words', icon: '💯', threshold: 100, category: 'words' },
  { id: 'scholar', name: 'Scholar', description: 'Learn 500 words', icon: '📚', threshold: 500, category: 'words' },
  { id: 'master', name: 'Vocabulary Master', description: 'Learn 1000 words', icon: '🎓', threshold: 1000, category: 'words' },
  { id: 'lexicon_lord', name: 'Lexicon Lord', description: 'Learn 2000 words', icon: '👑', threshold: 2000, category: 'words' },

  // Streak achievements
  { id: 'streak_3', name: 'Getting Started', description: '3-day streak', icon: '🔥', threshold: 3, category: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', threshold: 7, category: 'streak' },
  { id: 'streak_14', name: 'Fortnight Fighter', description: '14-day streak', icon: '🔥', threshold: 14, category: 'streak' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day streak', icon: '⚡', threshold: 30, category: 'streak' },
  { id: 'streak_60', name: 'Two Month Titan', description: '60-day streak', icon: '⚡', threshold: 60, category: 'streak' },
  { id: 'streak_100', name: 'Century Streak', description: '100-day streak', icon: '🏆', threshold: 100, category: 'streak' },

  // Test achievements
  { id: 'first_test', name: 'Test Taker', description: 'Complete your first test', icon: '📝', threshold: 1, category: 'test' },
  { id: 'perfect_test', name: 'Perfectionist', description: 'Get 100% on a test', icon: '🏆', threshold: 100, category: 'test' },
  { id: 'test_5', name: 'Test Regular', description: 'Complete 5 tests', icon: '📝', threshold: 5, category: 'test' },
  { id: 'test_10', name: 'Test Veteran', description: 'Complete 10 tests', icon: '🎯', threshold: 10, category: 'test' },
  { id: 'test_25', name: 'Test Champion', description: 'Complete 25 tests', icon: '🏅', threshold: 25, category: 'test' },

  // Hard words achievements
  { id: 'hard_10', name: 'Challenge Accepted', description: 'Mark 10 hard words', icon: '🔥', threshold: 10, category: 'hard' },
  { id: 'hard_crusher', name: 'Hard Word Crusher', description: 'Master 50 hard words', icon: '💪', threshold: 50, category: 'hard' },
  { id: 'hard_master', name: 'Difficulty Destroyer', description: 'Master 100 hard words', icon: '🦾', threshold: 100, category: 'hard' },
];

export interface UserAchievementProgress {
  wordsLearned: number;
  currentStreak: number;
  longestStreak: number;
  testsCompleted: number;
  bestTestScore: number;
  hardWordsMarked: number;
  hardWordsMastered: number;
}

export function getUnlockedAchievements(progress: UserAchievementProgress): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => {
    switch (achievement.category) {
      case 'words':
        return progress.wordsLearned >= achievement.threshold;
      case 'streak':
        return progress.longestStreak >= achievement.threshold;
      case 'test':
        if (achievement.id === 'perfect_test') {
          return progress.bestTestScore >= achievement.threshold;
        }
        return progress.testsCompleted >= achievement.threshold;
      case 'hard':
        if (achievement.id === 'hard_10') {
          return progress.hardWordsMarked >= achievement.threshold;
        }
        return progress.hardWordsMastered >= achievement.threshold;
      default:
        return false;
    }
  });
}

export function getNextAchievements(progress: UserAchievementProgress): { achievement: Achievement; progress: number }[] {
  const unlockedIds = new Set(getUnlockedAchievements(progress).map(a => a.id));

  return ACHIEVEMENTS
    .filter(a => !unlockedIds.has(a.id))
    .map((achievement) => {
      let currentValue = 0;

      switch (achievement.category) {
        case 'words':
          currentValue = progress.wordsLearned;
          break;
        case 'streak':
          currentValue = progress.longestStreak;
          break;
        case 'test':
          if (achievement.id === 'perfect_test') {
            currentValue = progress.bestTestScore;
          } else {
            currentValue = progress.testsCompleted;
          }
          break;
        case 'hard':
          if (achievement.id === 'hard_10') {
            currentValue = progress.hardWordsMarked;
          } else {
            currentValue = progress.hardWordsMastered;
          }
          break;
      }

      return {
        achievement,
        progress: Math.min((currentValue / achievement.threshold) * 100, 99),
      };
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 3); // Return top 3 closest achievements
}
