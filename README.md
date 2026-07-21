# SyncRadar.ai

SyncRadar.ai is an AI literacy platform built around SyncUp: LiveMap, Radar, AI-generated course content, and Sync Score. The app is knowledge-centric rather than course-centric, organizing learning as Track -> Subject -> Module -> Topic -> Lesson.

This build is intentionally zero-backend: the frontend loads a generated static syllabus, reads course content from Sanity, and stores user progress on the current device with localStorage.

## Architecture

```text
syllabus.xlsx
  -> build_syllabus.py
  -> public/syllabus.json
  -> React frontend
      -> LiveMap / syllabus navigation
      -> Radar / Sync Score
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

Run `supabase/schema.sql` in the Supabase SQL editor to create:

- `profiles`
- `completed_topic`
- `quiz_attempt`
- `saved_topics`
- `subscription`

Supabase Auth owns user authentication. Application code should access auth/profile/progress through `AuthService` and `UserService`, not directly from React components.

## Course Content

Course content is JSON-backed for the MVP. UI code should access content through `ContentService`, not by importing JSON directly.

The first lesson of each course should be a quiz. Clearing that opening quiz records completion for progress and, for radar topics, Sync Score.

## Adding a Radar Topic

1. Add or edit a topic row in `syllabus.xlsx`.
2. Set `Is_Radar` to `TRUE`.
3. Set `Radar_Week` in ISO week format, for example `2026-W28`.
4. Set `Layer`, `Difficulty`, `Roles`, `Status`, `Priority`, `Summary`, and `Why_It_Matters`.
5. Run `python3 build_syllabus.py`.
6. Restart or refresh the frontend.
7. Add or update related topic/course content in the canonical JSON source when ready.

## Sync Score vs Overall Progress

Sync Score appears on the Radar page. It only considers radar topics within the rolling 8-week window, grouped by dynamic `Layer`, and stores weekly snapshots on the current device.

Overall Progress appears in LiveMap. It counts all topic quiz completions regardless of Radar status or age, then aggregates modules, subjects, and tracks by completed topics divided by total topics.

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
