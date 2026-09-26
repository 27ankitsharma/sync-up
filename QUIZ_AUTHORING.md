# Quiz authoring

Quizzes are course assessments, not lessons. Author them as JSON files in `content/quizzes/`; Supabase is the runtime source.

## Add or edit a quiz

Copy `content/quizzes/agent-definition.json` and assign stable, explicit `quiz_id` and `question_id` values. Set `course_id` to an existing course ID. A single-select question must have:

- `question_type: "single_select"`
- exactly four options in A, B, C, D order
- a `label` and answer-specific `feedback` for every option
- one `correct_answer` matching A, B, C, or D
- an optional syllabus `topic_id`, hint, and difficulty

`questions_per_attempt` may be smaller than the question pool. The server randomly chooses that many questions once when an attempt starts. `passing_score` is a percentage, and `max_attempts` may be `null` for unlimited attempts.

Quiz and question IDs define identity. Renaming a JSON file does not create new records; changing an ID does.

Statuses are `draft`, `published`, or `archived` for quizzes. Only published quizzes can be started.

## Validate and sync

Apply `supabase/migrations/20260925100000_quiz_assessments.sql` before the first sync. Then set `SUPABASE_SERVICE_ROLE_KEY` in the local `.env`; never expose it through a `VITE_` variable.

```bash
python sync_quizzes.py --dry-run
python sync_quizzes.py
```

Dry-run validates all files and makes no Supabase changes. Normal sync upserts by explicit IDs and reports created, updated, and unchanged records. It does not delete questions merely because a local file or question disappears.

Attempts, random selection, grading, retries, answers, and course completion are runtime responsibilities and are intentionally not handled by the sync script.
