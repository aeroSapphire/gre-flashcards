import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  studyDates: string[];
  isStudiedToday: boolean;
}

export function useStreak() {
  const { user } = useAuth();
  const [studyDates, setStudyDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchStudyDates() {
      setIsLoading(true);
      try {
        // Get distinct dates when the user reviewed cards
        const { data, error } = await supabase
          .from('user_word_progress')
          .select('last_reviewed_at')
          .eq('user_id', user.id)
          .not('last_reviewed_at', 'is', null)
          .order('last_reviewed_at', { ascending: false });

        if (error) {
          console.error('Error fetching study dates:', error);
          return;
        }

        // Extract unique dates (YYYY-MM-DD format)
        const uniqueDates = new Set<string>();
        data?.forEach((record) => {
          if (record.last_reviewed_at) {
            const date = new Date(record.last_reviewed_at);
            uniqueDates.add(date.toISOString().split('T')[0]);
          }
        });

        setStudyDates(Array.from(uniqueDates).sort().reverse());
      } catch (e) {
        console.error('Error fetching study dates:', e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudyDates();
  }, [user]);

  const streakData = useMemo((): StreakData => {
    if (studyDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        studyDates: [],
        isStudiedToday: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isStudiedToday = studyDates[0] === todayStr;
    const lastStudyDate = studyDates[0] || null;

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = isStudiedToday ? today : yesterday;

    // If last study was not today or yesterday, streak is 0
    if (!isStudiedToday && studyDates[0] !== yesterdayStr) {
      currentStreak = 0;
    } else {
      // Count consecutive days backwards from checkDate
      const dateSet = new Set(studyDates);

      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...studyDates].sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastStudyDate,
      studyDates,
      isStudiedToday,
    };
  }, [studyDates]);

  return {
    ...streakData,
    isLoading,
  };
}
