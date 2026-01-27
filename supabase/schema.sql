-- ============================================
-- GRE Vocab Flashcards - Complete Database Schema
-- ============================================
-- Run this in a new Supabase project's SQL Editor
-- Make sure to run it in order (tables first, then policies)
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile information
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Policies for profiles
create policy "Users can view all profiles"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================
-- 2. FLASHCARDS TABLE
-- ============================================
-- Stores vocabulary flashcards
create table if not exists flashcards (
  id uuid default gen_random_uuid() primary key,
  word text not null unique,
  definition text not null,
  example text,
  tags text[] default '{}',
  status text default 'new' check (status in ('new', 'learning', 'learned')),
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table flashcards enable row level security;

-- Policies for flashcards
create policy "Flashcards are viewable by everyone"
  on flashcards for select
  using (true);

create policy "Authenticated users can insert flashcards"
  on flashcards for insert
  with check (auth.role() = 'authenticated');

create policy "Users can update flashcards"
  on flashcards for update
  using (auth.role() = 'authenticated');

create policy "Users can delete flashcards"
  on flashcards for delete
  using (auth.role() = 'authenticated');

-- Index for faster word lookups
create index if not exists idx_flashcards_word on flashcards(word);
create index if not exists idx_flashcards_created_at on flashcards(created_at desc);


-- ============================================
-- 3. FLASHCARD LISTS TABLE
-- ============================================
-- Organizes flashcards into lists (auto-generated lists of 30)
create table if not exists flashcard_lists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  is_auto boolean default true,
  auto_index integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table flashcard_lists enable row level security;

-- Policies for flashcard_lists
create policy "Lists are viewable by everyone"
  on flashcard_lists for select
  using (true);

create policy "Authenticated users can manage lists"
  on flashcard_lists for all
  using (auth.role() = 'authenticated');


-- ============================================
-- 4. USER WORD PROGRESS TABLE
-- ============================================
-- Tracks each user's progress on each flashcard with SRS data
create table if not exists user_word_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  flashcard_id uuid references flashcards(id) on delete cascade not null,
  status text default 'new' check (status in ('new', 'learning', 'learned')),
  last_reviewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- SRS (Spaced Repetition System) columns
  next_review_at timestamp with time zone,
  interval real default 0,
  ease_factor real default 2.5,
  repetitions integer default 0,
  -- Ensure one progress record per user per flashcard
  unique(user_id, flashcard_id)
);

-- Enable RLS
alter table user_word_progress enable row level security;

-- Policies for user_word_progress
create policy "Users can view all progress"
  on user_word_progress for select
  using (true);

create policy "Users can insert own progress"
  on user_word_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on user_word_progress for update
  using (auth.uid() = user_id);

create policy "Users can delete own progress"
  on user_word_progress for delete
  using (auth.uid() = user_id);

-- Indexes for user_word_progress
create index if not exists idx_user_word_progress_user on user_word_progress(user_id);
create index if not exists idx_user_word_progress_flashcard on user_word_progress(flashcard_id);
create index if not exists idx_user_word_progress_status on user_word_progress(user_id, status);
create index if not exists idx_user_word_progress_next_review on user_word_progress(user_id, next_review_at);


-- ============================================
-- 5. TESTS TABLE
-- ============================================
-- Stores GRE practice tests
create table if not exists tests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null, -- 'No Shift Sentences', 'Shift Sentences', 'Double Blanks', etc.
  description text,
  time_limit_minutes integer default 20,
  question_count integer default 10,
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table tests enable row level security;

-- Policies for tests
create policy "Tests are viewable by everyone"
  on tests for select
  using (true);

create policy "Authenticated users can manage tests"
  on tests for all
  using (auth.role() = 'authenticated');

-- Index for tests
create index if not exists idx_tests_category on tests(category);


-- ============================================
-- 6. QUESTIONS TABLE
-- ============================================
-- Stores questions for each test
create table if not exists questions (
  id uuid default gen_random_uuid() primary key,
  test_id uuid references tests(id) on delete cascade not null,
  content text not null, -- The question text or passage
  type text not null check (type in ('single_choice', 'multi_choice', 'sentence_equivalence', 'double_blank', 'triple_blank')),
  options jsonb not null, -- Array of options or grouped options for multi-blank
  correct_answer jsonb not null, -- Array of correct indices: [0] or [0, 2] or [[0], [1]] for multi-blank
  explanation text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table questions enable row level security;

-- Policies for questions
create policy "Questions are viewable by everyone"
  on questions for select
  using (true);

create policy "Authenticated users can manage questions"
  on questions for all
  using (auth.role() = 'authenticated');

-- Indexes for questions
create index if not exists idx_questions_test on questions(test_id);
create index if not exists idx_questions_order on questions(test_id, order_index);


-- ============================================
-- 7. USER TEST ATTEMPTS TABLE
-- ============================================
-- Stores user's test attempt history for leaderboard
create table if not exists user_test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  test_id uuid references tests(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  time_taken_seconds integer not null,
  answers jsonb not null, -- User's answers: { "question_id": [selected_indices] }
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_test_attempts enable row level security;

-- Policies for user_test_attempts
create policy "Attempts are viewable by everyone"
  on user_test_attempts for select
  using (true);

create policy "Users can insert own attempts"
  on user_test_attempts for insert
  with check (auth.uid() = user_id);

-- Indexes for user_test_attempts
create index if not exists idx_user_test_attempts_user on user_test_attempts(user_id);
create index if not exists idx_user_test_attempts_test on user_test_attempts(test_id);
create index if not exists idx_user_test_attempts_completed on user_test_attempts(completed_at desc);


-- ============================================
-- 8. ENABLE REALTIME
-- ============================================
-- Enable realtime for tables that need live updates
alter publication supabase_realtime add table flashcards;
alter publication supabase_realtime add table flashcard_lists;
alter publication supabase_realtime add table user_word_progress;
alter publication supabase_realtime add table profiles;


-- ============================================
-- DONE!
-- ============================================
-- After running this schema:
-- 1. Update your .env with new Supabase URL and anon key
-- 2. Run your seed scripts to populate flashcards and tests
-- 3. Test the application
-- ============================================
