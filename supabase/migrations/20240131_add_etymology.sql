-- Add etymology columns to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS etymology TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS root_word TEXT;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS root_meaning TEXT;
