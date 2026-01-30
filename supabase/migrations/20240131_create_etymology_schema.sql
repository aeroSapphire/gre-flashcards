-- Create etymology roots table
CREATE TABLE IF NOT EXISTS etymology_roots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    root TEXT NOT NULL UNIQUE,
    meaning TEXT NOT NULL,
    origin TEXT DEFAULT 'Latin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create etymology words table
CREATE TABLE IF NOT EXISTS etymology_words (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    root_id UUID REFERENCES etymology_roots(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    definition TEXT NOT NULL,
    breakdown TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE etymology_roots ENABLE ROW LEVEL SECURITY;
ALTER TABLE etymology_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-only access to roots" ON etymology_roots
    FOR SELECT USING (true);

CREATE POLICY "Allow public read-only access to etymology words" ON etymology_words
    FOR SELECT USING (true);
