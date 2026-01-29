-- Add sentence_practice_enabled to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sentence_practice_enabled BOOLEAN DEFAULT false;
