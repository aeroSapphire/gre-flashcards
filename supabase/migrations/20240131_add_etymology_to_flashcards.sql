-- Add etymology column to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS etymology TEXT;
