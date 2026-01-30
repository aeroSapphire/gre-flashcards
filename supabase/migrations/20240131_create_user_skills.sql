create table if not exists user_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_type text not null check (skill_type in ('precision', 'vocab', 'logic', 'context')),
  mu double precision default 50.0 not null,
  sigma double precision default 10.0 not null,
  last_practice_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_type)
);

alter table user_skills enable row level security;

create policy "Users can view own skills"
  on user_skills for select
  using (auth.uid() = user_id);

create policy "Users can insert own skills"
  on user_skills for insert
  with check (auth.uid() = user_id);

create policy "Users can update own skills"
  on user_skills for update
  using (auth.uid() = user_id);
