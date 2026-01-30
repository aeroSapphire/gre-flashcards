
import { supabase } from '@/integrations/supabase/client';
import { MistakeLabel } from '@/utils/mistakeClassifier';

export interface PracticeQuestion {
  content: string;
  type: 'single_choice' | 'multi_choice';
  options: string[];
  correct_answer: number[];
  explanation: string;
}

export async function generateTargetedPractice(mistakeLabel: MistakeLabel): Promise<PracticeQuestion[]> {
  try {
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

    return finalData.questions || [];
  } catch (error) {
    console.error('Targeted Practice Generation Failed:', error);
    throw error;
  }
}
