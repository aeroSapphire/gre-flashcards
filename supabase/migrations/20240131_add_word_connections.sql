-- Add synonym and antonym columns to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}';
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS antonyms TEXT[] DEFAULT '{}';
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS related_roots TEXT[] DEFAULT '{}';
