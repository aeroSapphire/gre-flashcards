-- Add part_of_speech to flashcards table
ALTER TABLE public.flashcards 
ADD COLUMN IF NOT EXISTS part_of_speech TEXT;
