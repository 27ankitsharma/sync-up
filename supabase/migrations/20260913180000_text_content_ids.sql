-- Authoring IDs come from Markdown frontmatter and must stay stable.
-- Convert course/lesson primary keys from UUID to text so IDs such as
-- course-agent-definition can be stored directly.

alter table public.lesson_progress drop constraint if exists lesson_progress_lesson_id_fkey;
alter table public.lessons drop constraint if exists lessons_course_id_fkey;

alter table public.courses alter column id drop default;
alter table public.lessons alter column id drop default;

alter table public.courses alter column id type text using id::text;
alter table public.lessons alter column id type text using id::text;
alter table public.lessons alter column course_id type text using course_id::text;
alter table public.lesson_progress alter column lesson_id type text using lesson_id::text;

alter table public.lessons
  add constraint lessons_course_id_fkey
  foreign key (course_id) references public.courses(id) on delete cascade;

alter table public.lesson_progress
  add constraint lesson_progress_lesson_id_fkey
  foreign key (lesson_id) references public.lessons(id) on delete cascade;
