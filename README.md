# SyncRadar.ai

SyncRadar.ai is an AI literacy platform built around SyncUp: LiveMap, Radar, course content, Knowledge Sync, and Radar Sync. The app is knowledge-centric rather than course-centric, organizing learning as Track -> Subject -> Module -> Topic -> Lesson.

This build is intentionally zero-backend: the frontend loads a generated static syllabus, reads course content from Sanity, and stores user progress on the current device with localStorage.

## Architecture

```text
syllabus.xlsx
  -> build_syllabus.py
  -> public/syllabus.json
  -> React frontend
      -> LiveMap / syllabus navigation
      -> Knowledge Sync / Radar Sync
      -> localStorage progress utilities

Sanity CMS
  -> manually authored, quality-reviewed course content
  -> frontend reads with GROQ through @sanity/client

Future optional generation
  -> hosted serverless function
  -> LLM API + Sanity write token
  -> writes approved course drafts into Sanity
```

There is no FastAPI, Express, or persistent backend server in this build.

## Setup

Install dependencies:

```sh
npm install
```

Start the frontend:

```sh
npm run dev
```

Run checks:

```sh
npm run lint
npm run test
```

## Syllabus Workflow

Edit `syllabus.xlsx` with these exact columns:

- `Track`
- `Subject`
- `Module`
- `Topic`
- `Layer`
- `Difficulty`
- `Roles`
- `Status`
- `Priority`
- `Is_Radar`
- `Radar_Week`
- `Summary`
- `Why_It_Matters`

Then regenerate the static syllabus:

```sh
python3 build_syllabus.py
```

The script writes `public/syllabus.json` and prints a summary like:

```text
Done: 2 tracks, 6 subjects, 12 modules, 36 topics exported to public/syllabus.json
```

`Layer` is open-ended free text. Add new values directly in the workbook; the frontend groups and scores them dynamically.

## Supabase Configuration

Create a Supabase project and configure these environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Run `supabase/schema.sql`, then the SQL files in `supabase/migrations/` in timestamp order. The assessment migration creates the secure quiz/question/attempt/answer tables and runtime functions.

- `profiles`
- `completed_topic`
- `quiz_attempts`
- `saved_topics`
- `subscription`

Supabase Auth owns user authentication. Application code should access auth/profile/progress through `AuthService` and `UserService`, not directly from React components.

## Course Content

Course lessons are Markdown-authored and synced to Supabase. UI code accesses persisted content through the existing course services.

A course quiz is a separate assessment, not a lesson. Passing its server-graded assessment records course/topic completion. See `CONTENT_AUTHORING.md` and `QUIZ_AUTHORING.md`.

## Adding a Radar Topic

1. Add or edit a topic row in `syllabus.xlsx`.
2. Set `Is_Radar` to `TRUE`.
3. Set `Radar_Week` in ISO week format, for example `2026-W28`.
4. Set `Layer`, `Difficulty`, `Roles`, `Status`, `Priority`, `Summary`, and `Why_It_Matters`.
5. Run `python3 build_syllabus.py`.
6. Restart or refresh the frontend.
7. Add or update related topic/course content in the canonical JSON source when ready.

## Knowledge Sync and Radar Sync

Knowledge Sync is the percentage of selected-role `Must` topics with a published assessment that the learner has passed. Radar Sync applies the same assessment-pass rule to selected-role `Must`/`Good` Radar topics in the rolling 8-week window. Course or lesson completion does not count as demonstrated mastery. Both metrics use authoritative Supabase quiz attempts and remain unavailable when no eligible assessment exists.

Both metrics are backed by Supabase for signed-in users. Anonymous users can browse content, but saved quiz progress and personalized metrics require authentication.

## Folder Structure

```text
build_syllabus.py
syllabus.xlsx
public/
  syllabus.json
src/
  components/
  contexts/
  hooks/
    useSyllabus.ts
    useUser.ts
  lib/
    courseContent.ts
    overallProgress.ts
    supabase.ts
    syllabusData.ts
  services/
    AuthService.ts
    ContentService.ts
    UserService.ts
  routes/
  types/
    course.ts
    progress.ts
    syllabus.ts
  utils/
    syllabusAdapter.ts
sanity/
  schemaTypes/
  sanity.config.ts
```
