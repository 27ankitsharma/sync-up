-- Secure course assessments. Quiz content is separate from lessons.
-- Correct answers are never readable through the client tables; grading happens in RPCs.

create extension if not exists pgcrypto;

create table if not exists public.quizzes (
  quiz_id text primary key,
  course_id text not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  questions_per_attempt integer not null check (questions_per_attempt > 0),
  passing_score integer not null check (passing_score between 0 and 100),
  max_attempts integer check (max_attempts is null or max_attempts > 0),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id)
);

create table if not exists public.questions (
  question_id text primary key,
  quiz_id text not null references public.quizzes(quiz_id) on delete cascade,
  topic_id text,
  question text not null,
  question_type text not null,
  options jsonb not null check (jsonb_typeof(options) = 'array'),
  correct_answer text,
  correct_values jsonb,
  hint text,
  difficulty text,
  status text not null default 'published' check (status in ('published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Preserve legacy topic-level attempts while moving to the course assessment model.
do $$
begin
  if to_regclass('public.quiz_attempts') is null and to_regclass('public.quiz_attempt') is not null then
    alter table public.quiz_attempt rename to quiz_attempts;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'attempt_id'
  ) then
    alter table public.quiz_attempts rename column id to attempt_id;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'attempted_at'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'quiz_attempts' and column_name = 'started_at'
  ) then
    alter table public.quiz_attempts rename column attempted_at to started_at;
  end if;
end
$$;

create table if not exists public.quiz_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  quiz_id text references public.quizzes(quiz_id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  topic_id text,
  topic_slug text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer check (score is null or score between 0 and 100),
  correct_count integer check (correct_count is null or correct_count >= 0),
  question_count integer check (question_count is null or question_count > 0),
  passed boolean not null default false,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  answers jsonb
);

alter table public.quiz_attempts add column if not exists quiz_id text references public.quizzes(quiz_id) on delete restrict;
alter table public.quiz_attempts add column if not exists completed_at timestamptz;
alter table public.quiz_attempts add column if not exists correct_count integer;
alter table public.quiz_attempts add column if not exists question_count integer;
alter table public.quiz_attempts add column if not exists status text not null default 'in_progress';
alter table public.quiz_attempts alter column score drop not null;
alter table public.quiz_attempts alter column topic_id drop not null;
alter table public.quiz_attempts alter column topic_slug drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'quiz_attempts_status_check'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint quiz_attempts_status_check
      check (status in ('in_progress', 'completed', 'abandoned'));
  end if;
end
$$;

update public.quiz_attempts
set status = 'completed',
    completed_at = coalesce(completed_at, started_at)
where quiz_id is null and score is not null;

create table if not exists public.quiz_attempt_questions (
  attempt_id uuid not null references public.quiz_attempts(attempt_id) on delete cascade,
  question_id text not null references public.questions(question_id) on delete restrict,
  question_order integer not null check (question_order > 0),
  primary key (attempt_id, question_id),
  unique (attempt_id, question_order)
);

create table if not exists public.quiz_answers (
  answer_id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(attempt_id) on delete cascade,
  question_id text not null references public.questions(question_id) on delete restrict,
  selected_answer text not null,
  is_correct boolean not null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists quizzes_course_id_idx on public.quizzes(course_id);
create index if not exists quizzes_status_idx on public.quizzes(status);
create index if not exists questions_quiz_id_idx on public.questions(quiz_id);
create index if not exists questions_topic_id_idx on public.questions(topic_id);
create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_quiz_id_idx on public.quiz_attempts(quiz_id);
create index if not exists quiz_attempts_user_quiz_idx on public.quiz_attempts(user_id, quiz_id);
create index if not exists quiz_attempt_questions_attempt_idx on public.quiz_attempt_questions(attempt_id);
create index if not exists quiz_answers_attempt_idx on public.quiz_answers(attempt_id);

drop trigger if exists quizzes_set_updated_at on public.quizzes;
create trigger quizzes_set_updated_at
  before update on public.quizzes
  for each row execute function public.set_updated_at();

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_questions enable row level security;
alter table public.quiz_answers enable row level security;

drop policy if exists "Published quizzes are readable" on public.quizzes;
create policy "Published quizzes are readable"
  on public.quizzes for select
  using (status = 'published' or public.is_content_admin());

drop policy if exists "Content admins insert quizzes" on public.quizzes;
create policy "Content admins insert quizzes"
  on public.quizzes for insert with check (public.is_content_admin());
drop policy if exists "Content admins update quizzes" on public.quizzes;
create policy "Content admins update quizzes"
  on public.quizzes for update using (public.is_content_admin()) with check (public.is_content_admin());
drop policy if exists "Content admins delete quizzes" on public.quizzes;
create policy "Content admins delete quizzes"
  on public.quizzes for delete using (public.is_content_admin());

-- Questions include answer keys. Only content admins may read/write the table directly.
drop policy if exists "Content admins read questions" on public.questions;
create policy "Content admins read questions"
  on public.questions for select using (public.is_content_admin());
drop policy if exists "Content admins insert questions" on public.questions;
create policy "Content admins insert questions"
  on public.questions for insert with check (public.is_content_admin());
drop policy if exists "Content admins update questions" on public.questions;
create policy "Content admins update questions"
  on public.questions for update using (public.is_content_admin()) with check (public.is_content_admin());
drop policy if exists "Content admins delete questions" on public.questions;
create policy "Content admins delete questions"
  on public.questions for delete using (public.is_content_admin());

drop policy if exists "Quiz attempts are readable by owner" on public.quiz_attempts;
create policy "Quiz attempts are readable by owner"
  on public.quiz_attempts for select using (auth.uid() = user_id);
drop policy if exists "Quiz attempts are insertable by owner" on public.quiz_attempts;

drop policy if exists "Attempt questions are readable by owner" on public.quiz_attempt_questions;
create policy "Attempt questions are readable by owner"
  on public.quiz_attempt_questions for select
  using (
    exists (
      select 1 from public.quiz_attempts attempt
      where attempt.attempt_id = quiz_attempt_questions.attempt_id
        and attempt.user_id = auth.uid()
    )
  );

drop policy if exists "Quiz answers are readable by owner" on public.quiz_answers;
create policy "Quiz answers are readable by owner"
  on public.quiz_answers for select
  using (
    exists (
      select 1 from public.quiz_attempts attempt
      where attempt.attempt_id = quiz_answers.attempt_id
        and attempt.user_id = auth.uid()
    )
  );

-- Course completion is authoritative: clients may read, but only secure functions write.
drop policy if exists "Completed topics are insertable by owner" on public.completed_topic;
drop policy if exists "Completed topics are updatable by owner" on public.completed_topic;

create or replace function public.get_quiz_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select jsonb_build_object(
    'attempt_id', attempt.attempt_id,
    'quiz_id', attempt.quiz_id,
    'status', attempt.status,
    'started_at', attempt.started_at,
    'completed_at', attempt.completed_at,
    'score', attempt.score,
    'correct_count', attempt.correct_count,
    'question_count', attempt.question_count,
    'passed', attempt.passed,
    'quiz', jsonb_build_object(
      'title', quiz.title,
      'description', quiz.description,
      'passing_score', quiz.passing_score,
      'max_attempts', quiz.max_attempts
    ),
    'questions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'question_id', question.question_id,
          'topic_id', question.topic_id,
          'question', question.question,
          'question_type', question.question_type,
          'options', (
            select jsonb_agg(
              jsonb_build_object(
                'value', quiz_option.item->>'value',
                'label', quiz_option.item->>'label'
              ) ||
              case
                when answer.answer_id is not null
                  and quiz_option.item->>'value' = answer.selected_answer
                then jsonb_build_object('feedback', quiz_option.item->>'feedback')
                else '{}'::jsonb
              end
              order by quiz_option.ordinality
            )
            from jsonb_array_elements(question.options) with ordinality as quiz_option(item, ordinality)
          ),
          'hint', question.hint,
          'difficulty', question.difficulty,
          'question_order', selected.question_order,
          'answer', case when answer.answer_id is null then null else jsonb_build_object(
            'selected_answer', answer.selected_answer,
            'is_correct', answer.is_correct,
            'answered_at', answer.answered_at,
            'correct_answer', question.correct_answer
          ) end
        )
        order by selected.question_order
      )
      from public.quiz_attempt_questions selected
      join public.questions question on question.question_id = selected.question_id
      left join public.quiz_answers answer
        on answer.attempt_id = selected.attempt_id
       and answer.question_id = selected.question_id
      where selected.attempt_id = attempt.attempt_id
    ), '[]'::jsonb)
  )
  into result
  from public.quiz_attempts attempt
  join public.quizzes quiz on quiz.quiz_id = attempt.quiz_id
  where attempt.attempt_id = p_attempt_id
    and attempt.user_id = auth.uid();

  if result is null then
    raise exception 'Quiz attempt not found';
  end if;
  return result;
end;
$$;

create or replace function public.start_quiz_attempt(p_quiz_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  quiz public.quizzes%rowtype;
  course public.courses%rowtype;
  v_attempt_id uuid;
  attempt_count integer;
  pool_count integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text || ':' || p_quiz_id, 0));

  select * into quiz from public.quizzes
  where quiz_id = p_quiz_id and status = 'published';
  if not found then
    raise exception 'Published quiz not found';
  end if;

  select * into course from public.courses where id = quiz.course_id;

  select count(*) into attempt_count
  from public.quiz_attempts
  where user_id = auth.uid() and quiz_id = p_quiz_id;

  if quiz.max_attempts is not null and attempt_count >= quiz.max_attempts then
    raise exception 'Maximum quiz attempts reached';
  end if;

  select count(*) into pool_count
  from public.questions
  where quiz_id = p_quiz_id and status = 'published';
  if pool_count < quiz.questions_per_attempt then
    raise exception 'Quiz question pool has % questions; % required', pool_count, quiz.questions_per_attempt;
  end if;

  insert into public.quiz_attempts (
    quiz_id, user_id, topic_id, topic_slug, question_count, status
  ) values (
    quiz.quiz_id, auth.uid(), course.topic_id, course.slug, quiz.questions_per_attempt, 'in_progress'
  ) returning quiz_attempts.attempt_id into v_attempt_id;

  insert into public.quiz_attempt_questions (attempt_id, question_id, question_order)
  select v_attempt_id, selected.question_id, selected.question_order
  from (
    select question_id, row_number() over ()::integer as question_order
    from (
      select question_id
      from public.questions
      where quiz_id = p_quiz_id and status = 'published'
      order by random()
      limit quiz.questions_per_attempt
    ) random_questions
  ) selected;

  return public.get_quiz_attempt(v_attempt_id);
end;
$$;

create or replace function public.submit_quiz_answer(
  p_attempt_id uuid,
  p_question_id text,
  p_selected_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  attempt public.quiz_attempts%rowtype;
  question public.questions%rowtype;
  answer_is_correct boolean;
  v_answered_count integer;
  v_correct_count integer;
  calculated_score integer;
  calculated_passed boolean;
  course public.courses%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  select * into attempt from public.quiz_attempts
  where attempt_id = p_attempt_id and user_id = auth.uid()
  for update;
  if not found then
    raise exception 'Quiz attempt not found';
  end if;
  if attempt.status <> 'in_progress' then
    raise exception 'Quiz attempt is already complete';
  end if;

  select q.* into question
  from public.questions q
  join public.quiz_attempt_questions selected
    on selected.question_id = q.question_id
   and selected.attempt_id = p_attempt_id
  where q.question_id = p_question_id;
  if not found then
    raise exception 'Question is not part of this attempt';
  end if;

  if not exists (
    select 1 from jsonb_array_elements(question.options) option
    where option->>'value' = p_selected_answer
  ) then
    raise exception 'Selected answer is not a valid option';
  end if;

  if exists (
    select 1 from public.quiz_answers
    where attempt_id = p_attempt_id and question_id = p_question_id
  ) then
    raise exception 'Answer is final and has already been submitted';
  end if;

  answer_is_correct := p_selected_answer = question.correct_answer;
  insert into public.quiz_answers (
    attempt_id, question_id, selected_answer, is_correct
  ) values (
    p_attempt_id, p_question_id, p_selected_answer, answer_is_correct
  );

  select count(*), count(*) filter (where is_correct)
  into v_answered_count, v_correct_count
  from public.quiz_answers
  where attempt_id = p_attempt_id;

  if v_answered_count = attempt.question_count then
    calculated_score := round((v_correct_count::numeric / attempt.question_count::numeric) * 100)::integer;
    select calculated_score >= quiz.passing_score
    into calculated_passed
    from public.quizzes quiz
    where quiz.quiz_id = attempt.quiz_id;

    update public.quiz_attempts
    set completed_at = now(),
        score = calculated_score,
        correct_count = v_correct_count,
        passed = calculated_passed,
        status = 'completed'
    where attempt_id = p_attempt_id;

    if calculated_passed then
      select c.* into course
      from public.quizzes quiz
      join public.courses c on c.id = quiz.course_id
      where quiz.quiz_id = attempt.quiz_id;

      insert into public.completed_topic (user_id, topic_id, topic_slug, layer, completed_at)
      values (auth.uid(), course.topic_id, course.slug, null, now())
      on conflict (user_id, topic_slug)
      do update set
        topic_id = excluded.topic_id,
        completed_at = excluded.completed_at;
    end if;
  end if;

  return public.get_quiz_attempt(p_attempt_id);
end;
$$;

revoke all on function public.get_quiz_attempt(uuid) from public;
revoke all on function public.start_quiz_attempt(text) from public;
revoke all on function public.submit_quiz_answer(uuid, text, text) from public;
grant execute on function public.get_quiz_attempt(uuid) to authenticated;
grant execute on function public.start_quiz_attempt(text) to authenticated;
grant execute on function public.submit_quiz_answer(uuid, text, text) to authenticated;
