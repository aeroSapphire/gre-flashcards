import { supabase } from '@/integrations/supabase/client';

export interface MnemonicResult {
  mnemonic: string;
  technique: string;
  explanation: string;
}

export interface StoredMnemonic {
  id: string;
  flashcard_id: string;
  mnemonic_text: string;
  technique: string | null;
  created_at: string;
}

export async function generateMnemonic(
  word: string,
  definition: string,
  partOfSpeech?: string | null,
  etymology?: string | null
): Promise<MnemonicResult | null> {
  try {
    const { data, error } = await supabase.functions.invoke('evaluate-sentence', {
      body: {
        mode: 'mnemonic',
        word,
        definition,
        part_of_speech: partOfSpeech,
        etymology,
      },
    });

    if (error) {
      console.error('Error generating mnemonic:', error);
      return null;
    }

    if (data?.mnemonic) {
      return {
        mnemonic: data.mnemonic,
        technique: data.technique || 'ASSOCIATION',
        explanation: data.explanation || '',
      };
    }

    return null;
  } catch (err) {
    console.error('Failed to generate mnemonic:', err);
    return null;
  }
}

export async function saveMnemonic(
  flashcardId: string,
  mnemonic: string,
  technique?: string
): Promise<StoredMnemonic | null> {
  try {
    const { data, error } = await supabase
      .from('word_mnemonics')
      .insert({
        flashcard_id: flashcardId,
        mnemonic_text: mnemonic,
        technique: technique || null,
      })
      .select()
      .single();

    if (error) {
      // Handle unique constraint - mnemonic already exists
      if (error.code === '23505') {
        // Update existing mnemonic instead
        const { data: updated, error: updateError } = await supabase
          .from('word_mnemonics')
          .update({
            mnemonic_text: mnemonic,
            technique: technique || null,
          })
          .eq('flashcard_id', flashcardId)
          .select()
          .single();

        if (updateError) throw updateError;
        return updated;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to save mnemonic:', err);
    return null;
  }
}

export async function getMnemonic(flashcardId: string): Promise<StoredMnemonic | null> {
  try {
    const { data, error } = await supabase
      .from('word_mnemonics')
      .select('*')
      .eq('flashcard_id', flashcardId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - not an error
        return null;
      }
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to get mnemonic:', err);
    return null;
  }
}

export async function deleteMnemonic(flashcardId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('word_mnemonics')
      .delete()
      .eq('flashcard_id', flashcardId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to delete mnemonic:', err);
    return false;
  }
}
