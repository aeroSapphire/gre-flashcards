
import { supabase } from '@/integrations/supabase/client';
import { MistakeLabel } from '@/utils/mistakeClassifier';

export interface PracticeQuestion {
  id?: string;
  content: string;
  type: 'single_choice' | 'multi_choice';
  options: string[];
  correct_answer: number[];
  explanation: string;
}

export async function markQuestionAsUsed(id: string) {
  const { error } = await supabase
    .from('user_practice_questions')
    .update({ is_used: true })
    .eq('id', id);
  
  if (error) console.error('Failed to mark question as used:', error);
}

export async function generateTargetedPractice(mistakeLabel: MistakeLabel): Promise<PracticeQuestion[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // 1. Check for existing unused questions
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('user_practice_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('mistake_label', mistakeLabel)
      .eq('is_used', false)
      .limit(3);

    if (fetchError) {
      console.error('Error fetching cached questions:', fetchError);
    }

    // If we have enough questions, return them
    if (existingQuestions && existingQuestions.length >= 3) {
      return existingQuestions.map(q => ({
        ...q.question_data,
        id: q.id
      }));
    }

    // 2. Not enough questions, generate more
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        mode: 'generate-targeted-practice',
        mistakeLabel
      },
    });

    if (error) {
      console.error('Edge Function Error:', error);
      throw new Error('Failed to generate practice questions');
    }

    let finalData = data;
    if (typeof data === 'string') {
      try {
        finalData = JSON.parse(data);
      } catch (e) {
        console.error('JSON Parse Error:', e);
        throw new Error('Invalid response format');
      }
    }

    if (!finalData.questions || !Array.isArray(finalData.questions) || finalData.questions.length === 0) {
      console.error('Unexpected API response:', finalData);
      throw new Error('API returned no questions');
    }

    const newQuestions: PracticeQuestion[] = finalData.questions;

    // 3. Save new questions to DB
    const questionsToInsert = newQuestions.map(q => ({
      user_id: user.id,
      mistake_label: mistakeLabel,
      question_data: q,
      is_used: false
    }));

    const { error: insertError } = await supabase
      .from('user_practice_questions')
      .insert(questionsToInsert);

    if (insertError) {
      console.error('Failed to cache new questions:', insertError);
      // If insert fails, we can still return the generated questions, 
      // but they won't have IDs and won't be saved for next time.
      return newQuestions;
    }

    // 4. Fetch again to get a full set of 3 with IDs
    // (We combine what we had + what we just inserted)
    const { data: allQuestions } = await supabase
      .from('user_practice_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('mistake_label', mistakeLabel)
      .eq('is_used', false)
      .limit(3);

    if (allQuestions && allQuestions.length > 0) {
      return allQuestions.map(q => ({
        ...q.question_data,
        id: q.id
      }));
    }

    // Fallback if refetch fails (shouldn't happen)
    return newQuestions;

  } catch (error) {
    console.error('Targeted Practice Generation Failed:', error);
    throw error;
  }
}
