-- ============================================
-- MISTAKE TRACKING TABLE
-- ============================================
-- Stores user's mistake history for pattern analysis
create table if not exists user_mistakes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mistake_label text not null, -- Enum from MistakeLabel
  question_type text not null, -- TC, SE, RC
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table user_mistakes enable row level security;

-- Policies
create policy "Users can view own mistakes"
  on user_mistakes for select
  using (auth.uid() = user_id);

create policy "Users can insert own mistakes"
  on user_mistakes for insert
  with check (auth.uid() = user_id);

-- Index for efficient rolling window queries
create index if not exists idx_user_mistakes_user_created on user_mistakes(user_id, created_at desc);
