-- Course content layer. Syllabus topic identifiers remain text (not UUIDs).
-- Learner progress tables are unchanged; lesson_progress is additive.

create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists is_content_admin boolean not null default false;

create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_content_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to anon, authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null,
  title text not null,
  slug text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  order_index integer not null check (order_index >= 1),
  content_json jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  duration_minutes integer,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug),
  unique (course_id, order_index)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  topic_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists courses_topic_id_idx on public.courses(topic_id);
create index if not exists courses_status_idx on public.courses(status);
create index if not exists courses_topic_id_status_idx on public.courses(topic_id, status);
create index if not exists lessons_course_id_idx on public.lessons(course_id);
create index if not exists lessons_status_idx on public.lessons(status);
create index if not exists lessons_course_id_order_idx on public.lessons(course_id, order_index);
create index if not exists lesson_progress_user_id_idx on public.lesson_progress(user_id);
create index if not exists lesson_progress_topic_id_idx on public.lesson_progress(topic_id);

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();

alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_progress enable row level security;

drop policy if exists "Published courses are readable" on public.courses;
create policy "Published courses are readable"
  on public.courses for select
  using (status = 'published' or public.is_content_admin());

drop policy if exists "Content admins insert courses" on public.courses;
create policy "Content admins insert courses"
  on public.courses for insert
  with check (public.is_content_admin());

drop policy if exists "Content admins update courses" on public.courses;
create policy "Content admins update courses"
  on public.courses for update
  using (public.is_content_admin())
  with check (public.is_content_admin());

drop policy if exists "Content admins delete courses" on public.courses;
create policy "Content admins delete courses"
  on public.courses for delete
  using (public.is_content_admin());

drop policy if exists "Published lessons are readable" on public.lessons;
create policy "Published lessons are readable"
  on public.lessons for select
  using (status = 'published' or public.is_content_admin());

drop policy if exists "Content admins insert lessons" on public.lessons;
create policy "Content admins insert lessons"
  on public.lessons for insert
  with check (public.is_content_admin());

drop policy if exists "Content admins update lessons" on public.lessons;
create policy "Content admins update lessons"
  on public.lessons for update
  using (public.is_content_admin())
  with check (public.is_content_admin());

drop policy if exists "Content admins delete lessons" on public.lessons;
create policy "Content admins delete lessons"
  on public.lessons for delete
  using (public.is_content_admin());

drop policy if exists "Lesson progress is readable by owner" on public.lesson_progress;
create policy "Lesson progress is readable by owner"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

drop policy if exists "Lesson progress is insertable by owner" on public.lesson_progress;
create policy "Lesson progress is insertable by owner"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

drop policy if exists "Lesson progress is updatable by owner" on public.lesson_progress;
create policy "Lesson progress is updatable by owner"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('course-assets', 'course-assets', true)
on conflict (id) do nothing;

drop policy if exists "Course assets are publicly readable" on storage.objects;
create policy "Course assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'course-assets');

drop policy if exists "Content admins upload course assets" on storage.objects;
create policy "Content admins upload course assets"
  on storage.objects for insert
  with check (bucket_id = 'course-assets' and public.is_content_admin());

drop policy if exists "Content admins update course assets" on storage.objects;
create policy "Content admins update course assets"
  on storage.objects for update
  using (bucket_id = 'course-assets' and public.is_content_admin())
  with check (bucket_id = 'course-assets' and public.is_content_admin());

drop policy if exists "Content admins delete course assets" on storage.objects;
create policy "Content admins delete course assets"
  on storage.objects for delete
  using (bucket_id = 'course-assets' and public.is_content_admin());
