-- Create tests table
create table tests (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null, -- 'no_shift', 'shift', 'double_blank', etc.
  description text,
  time_limit_minutes integer default 20,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create questions table
create table questions (
  id uuid default gen_random_uuid() primary key,
  test_id uuid references tests(id) on delete cascade not null,
  content text not null, -- The question text or passage
  type text not null, -- 'single_choice', 'multi_choice', 'select_in_passage'
  options jsonb not null, -- Array of options: ["Option A", "Option B"]
  correct_answer jsonb not null, -- Array of correct indices: [0] or [0, 2]
  explanation text,
  order_index integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_test_attempts table
create table user_test_attempts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  test_id uuid references tests(id) on delete cascade not null,
  score integer not null,
  total_questions integer not null,
  time_taken_seconds integer not null,
  answers jsonb not null, -- User's answers map: { "question_id": [0] }
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table tests enable row level security;
alter table questions enable row level security;
alter table user_test_attempts enable row level security;

-- Policies
-- Tests and Questions are readable by everyone
create policy "Tests are viewable by everyone" on tests for select using (true);
create policy "Questions are viewable by everyone" on questions for select using (true);

-- Attempts: Users can insert their own attempts and view all attempts (for leaderboard)
create policy "Users can insert own attempts" on user_test_attempts for insert with check (auth.uid() = user_id);
create policy "Attempts are viewable by everyone" on user_test_attempts for select using (true);
