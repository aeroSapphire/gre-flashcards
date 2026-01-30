
import { supabase } from '@/integrations/supabase/client';
import { MistakeLabel } from '@/utils/mistakeClassifier';

export interface MistakeEvent {
  label: MistakeLabel;
  timestamp: number;
  questionType: 'TC' | 'SE' | 'RC';
}

const ROLLING_WINDOW_SIZE = 100;

/**
 * Records a new mistake for the current user.
 * Maintains a rolling window of the last N mistakes.
 */
export async function recordMistake(
  label: MistakeLabel,
  questionType: 'TC' | 'SE' | 'RC'
) {
  if (label === 'NONE') return; // Ignore correct answers

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    // 1. Insert new mistake
    const { error } = await supabase
      .from('user_mistakes')
      .insert({
        user_id: user.id,
        mistake_label: label,
        question_type: questionType,
        created_at: new Date().toISOString()
      });

    if (error) throw error;

    // 2. Prune old records (Rolling Window)
    // We'll do this occasionally or after insert. 
    // A simple way is to check count and delete if > LIMIT.
    // Since RLS is on, count is scoped to user.
    const { count } = await supabase
      .from('user_mistakes')
      .select('*', { count: 'exact', head: true });

    if (count && count > ROLLING_WINDOW_SIZE) {
        // Delete oldest records
        // Note: Supabase doesn't support DELETE with ORDER BY/LIMIT directly in one query easily without subquery
        // But we can find the cutoff date.
        
        // Fetch the (N+1)th newest record's date
        const { data: cutoffData } = await supabase
            .from('user_mistakes')
            .select('created_at')
            .order('created_at', { ascending: false })
            .range(ROLLING_WINDOW_SIZE, ROLLING_WINDOW_SIZE);
            
        if (cutoffData && cutoffData.length > 0) {
            const cutoffDate = cutoffData[0].created_at;
            await supabase
                .from('user_mistakes')
                .delete()
                .lt('created_at', cutoffDate);
        }
    }

  } catch (err) {
    console.error('Error recording mistake:', err);
  }
}

/**
 * Fetches the user's mistake history.
 */
export async function getMistakeHistory(): Promise<MistakeEvent[]> {
  const { data, error } = await supabase
    .from('user_mistakes')
    .select('mistake_label, created_at, question_type')
    .order('created_at', { ascending: false })
    .limit(ROLLING_WINDOW_SIZE);

  if (error) {
    console.error('Error fetching mistake history:', error);
    return [];
  }

  return data.map((row: any) => ({
    label: row.mistake_label as MistakeLabel,
    timestamp: new Date(row.created_at).getTime(),
    questionType: row.question_type
  }));
}
