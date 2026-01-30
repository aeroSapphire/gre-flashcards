create table if not exists user_practice_questions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  mistake_label text not null,
  question_data jsonb not null,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table user_practice_questions enable row level security;

create policy "Users can view own practice questions"
  on user_practice_questions for select
  using (auth.uid() = user_id);

create policy "Users can insert own practice questions"
  on user_practice_questions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own practice questions"
  on user_practice_questions for update
  using (auth.uid() = user_id);
