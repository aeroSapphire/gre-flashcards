-- Create sentence_evaluations table
CREATE TABLE IF NOT EXISTS public.sentence_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    sentence TEXT NOT NULL,
    rating TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sentence_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own evaluations"
    ON public.sentence_evaluations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all evaluations (to see others' sentences)"
    ON public.sentence_evaluations FOR SELECT
    USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_sentence_evaluations_flashcard_id ON public.sentence_evaluations(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_sentence_evaluations_user_id ON public.sentence_evaluations(user_id);
