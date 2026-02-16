ALTER TABLE user_word_progress
ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS consecutive_success INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_grade TEXT DEFAULT NULL;

-- Update default ease_factor for new records
ALTER TABLE user_word_progress ALTER COLUMN ease_factor SET DEFAULT 2.1;
