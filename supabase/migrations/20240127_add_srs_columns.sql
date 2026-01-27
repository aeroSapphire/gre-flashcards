-- Add SRS columns to user_word_progress table
ALTER TABLE user_word_progress
ADD COLUMN next_review_at TIMESTAMPTZ,
ADD COLUMN interval REAL DEFAULT 0,
ADD COLUMN ease_factor REAL DEFAULT 2.5,
ADD COLUMN repetitions INTEGER DEFAULT 0;

-- Create an index to quickly find cards due for review
CREATE INDEX idx_user_word_progress_next_review ON user_word_progress(user_id, next_review_at);
