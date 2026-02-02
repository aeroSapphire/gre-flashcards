-- Migration: Hard Words, Mnemonics, and Confusion Clusters
-- Description: Add tables for tracking hard words, storing mnemonics, and confusion clusters

-- 1. User Hard Words table
-- Tracks which words each user has marked as "hard" for extra review
CREATE TABLE IF NOT EXISTS user_hard_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(user_id, flashcard_id)
);

-- Enable RLS
ALTER TABLE user_hard_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_hard_words
CREATE POLICY "Users can view their own hard words"
  ON user_hard_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hard words"
  ON user_hard_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hard words"
  ON user_hard_words FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_hard_words_user_id ON user_hard_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_hard_words_flashcard_id ON user_hard_words(flashcard_id);

-- 2. Word Mnemonics table
-- Stores generated mnemonics for flashcards (shared across all users)
CREATE TABLE IF NOT EXISTS word_mnemonics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  mnemonic_text TEXT NOT NULL,
  technique TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(flashcard_id)
);

-- Enable RLS
ALTER TABLE word_mnemonics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for word_mnemonics (shared/public read, authenticated write)
CREATE POLICY "Anyone can view mnemonics"
  ON word_mnemonics FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert mnemonics"
  ON word_mnemonics FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update mnemonics"
  ON word_mnemonics FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_word_mnemonics_flashcard_id ON word_mnemonics(flashcard_id);

-- 3. Confusion Clusters table
-- Pre-defined clusters of commonly confused GRE words
CREATE TABLE IF NOT EXISTS confusion_clusters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  words TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE confusion_clusters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for confusion_clusters (public read only)
CREATE POLICY "Anyone can view confusion clusters"
  ON confusion_clusters FOR SELECT
  USING (true);

-- Insert pre-defined confusion clusters
INSERT INTO confusion_clusters (name, description, words) VALUES
  ('ex- Prefix Words', 'Words starting with "ex-" that have similar sounds but different meanings', ARRAY['exacerbate', 'exculpate', 'expostulate', 'expiate', 'extenuate']),
  ('Ambiguous vs Ambivalent', 'Ambiguous means unclear/open to interpretation; Ambivalent means having mixed feelings', ARRAY['ambiguous', 'ambivalent']),
  ('Flaunt vs Flout', 'Flaunt means to show off; Flout means to openly disregard rules', ARRAY['flaunt', 'flout']),
  ('Tortuous vs Torturous', 'Tortuous means winding/complex; Torturous means causing torture/painful', ARRAY['tortuous', 'torturous']),
  ('Amoral vs Immoral', 'Amoral means lacking moral sense; Immoral means violating moral principles', ARRAY['amoral', 'immoral']),
  ('Enervate vs Energize', 'Enervate means to weaken/drain energy (opposite of what it sounds like!)', ARRAY['enervate', 'energize']),
  ('Perfunctory vs Peremptory', 'Perfunctory means routine/superficial; Peremptory means commanding/imperious', ARRAY['perfunctory', 'peremptory']),
  ('Ingenious vs Ingenuous', 'Ingenious means clever/inventive; Ingenuous means innocent/naive', ARRAY['ingenious', 'ingenuous']),
  ('Disinterested vs Uninterested', 'Disinterested means impartial/unbiased; Uninterested means not interested', ARRAY['disinterested', 'uninterested']),
  ('Compliment vs Complement', 'Compliment means praise; Complement means to complete or enhance', ARRAY['compliment', 'complement']),
  ('Prescribe vs Proscribe', 'Prescribe means to recommend/order; Proscribe means to forbid/prohibit', ARRAY['prescribe', 'proscribe']),
  ('Elicit vs Illicit', 'Elicit means to draw out/evoke; Illicit means illegal/forbidden', ARRAY['elicit', 'illicit']),
  ('Principal vs Principle', 'Principal means main/chief (or school head); Principle means a rule or standard', ARRAY['principal', 'principle']),
  ('Discreet vs Discrete', 'Discreet means careful/tactful; Discrete means separate/distinct', ARRAY['discreet', 'discrete']),
  ('Affect vs Effect', 'Affect is usually a verb (to influence); Effect is usually a noun (a result)', ARRAY['affect', 'effect']),
  ('Eminent vs Imminent vs Immanent', 'Eminent means distinguished; Imminent means about to happen; Immanent means inherent/indwelling', ARRAY['eminent', 'imminent', 'immanent']),
  ('Venal vs Venial', 'Venal means corrupt/bribable; Venial means minor/pardonable (sin)', ARRAY['venal', 'venial']),
  ('Penurious vs Pernicious', 'Penurious means extremely poor/stingy; Pernicious means harmful/destructive', ARRAY['penurious', 'pernicious']),
  ('Reticent vs Reluctant', 'Reticent means reserved/uncommunicative; Reluctant means unwilling/hesitant', ARRAY['reticent', 'reluctant']),
  ('Diffuse vs Defuse', 'Diffuse means to spread out; Defuse means to remove tension/danger', ARRAY['diffuse', 'defuse'])
ON CONFLICT DO NOTHING;

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_hard_words;
ALTER PUBLICATION supabase_realtime ADD TABLE word_mnemonics;
