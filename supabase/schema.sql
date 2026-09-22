create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text,
  experience text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.completed_topic (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  topic_slug text not null,
  layer text,
  completed_at timestamptz not null default now(),
  unique (user_id, topic_slug)
);

create table if not exists public.quiz_attempt (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  topic_slug text not null,
  score integer not null check (score >= 0 and score <= 100),
  passed boolean not null default false,
  answers jsonb,
  attempted_at timestamptz not null default now()
);

create table if not exists public.saved_topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text not null,
  topic_slug text not null,
  saved_at timestamptz not null default now(),
  unique (user_id, topic_slug)
);

create table if not exists public.subscription (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  subscribed boolean not null default true,
  frequency text not null default 'weekly' check (frequency in ('weekly', 'monthly')),
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists completed_topic_user_id_idx on public.completed_topic(user_id);
create index if not exists completed_topic_topic_slug_idx on public.completed_topic(topic_slug);
create index if not exists quiz_attempt_user_id_idx on public.quiz_attempt(user_id);
create index if not exists quiz_attempt_topic_slug_idx on public.quiz_attempt(topic_slug);
create index if not exists saved_topics_user_id_idx on public.saved_topics(user_id);
create index if not exists subscription_user_id_idx on public.subscription(user_id);

alter table public.profiles enable row level security;
alter table public.completed_topic enable row level security;
alter table public.quiz_attempt enable row level security;
alter table public.saved_topics enable row level security;
alter table public.subscription enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Completed topics are readable by owner"
  on public.completed_topic for select
  using (auth.uid() = user_id);

create policy "Completed topics are insertable by owner"
  on public.completed_topic for insert
  with check (auth.uid() = user_id);

create policy "Completed topics are updatable by owner"
  on public.completed_topic for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Quiz attempts are readable by owner"
  on public.quiz_attempt for select
  using (auth.uid() = user_id);

create policy "Quiz attempts are insertable by owner"
  on public.quiz_attempt for insert
  with check (auth.uid() = user_id);

create policy "Saved topics are readable by owner"
  on public.saved_topics for select
  using (auth.uid() = user_id);

create policy "Saved topics are insertable by owner"
  on public.saved_topics for insert
  with check (auth.uid() = user_id);

create policy "Saved topics are deletable by owner"
  on public.saved_topics for delete
  using (auth.uid() = user_id);

create policy "Newsletter preferences are readable by owner"
  on public.subscription for select
  using (auth.uid() = user_id);

create policy "Newsletter preferences are insertable by owner"
  on public.subscription for insert
  with check (auth.uid() = user_id);

create policy "Newsletter preferences are updatable by owner"
  on public.subscription for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Course content and additive lesson progress are defined in
-- supabase/migrations/20260913120000_courses_and_lessons.sql
