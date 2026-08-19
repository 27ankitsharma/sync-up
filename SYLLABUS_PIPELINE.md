# SyncRadar Syllabus Pipeline

SyncRadar authors content in `syllabus.xlsx` and consumes generated JSON from:

- `public/syllabus.json`
- `src/data/syllabus.json`

The frontend must not read Excel directly.

## Workbook Sheets

`syllabus.xlsx` has four sheets:

- `Tracks`
- `Subjects`
- `Modules`
- `Topics`

One row in `Topics` equals one canonical topic.

## Topic Identity

`Topic_ID` is the permanent topic identity. Do not change it when moving a topic.

To move a topic, edit only the `Track_ID`, `Subject_ID`, and `Module_ID` values in the `Topics` sheet.

## Adding Content

To add a topic:

1. Add one row to `Topics`.
2. Set a permanent `Topic_ID`.
3. Fill `Track_ID`, `Subject_ID`, `Module_ID`, and `Topic`.
4. Ensure the referenced Track/Subject/Module IDs already exist in their sheets.
5. Run `python3 build_syllabus.py`.

To add a module, subject, or track:

- Add one row to the matching sheet.
- Modules must include both `Track_ID` and `Subject_ID`.
- Then reference IDs from topic rows.

`Track_ID`, `Subject_ID`, and `Module_ID` are the authoring references. Display names
can change without breaking topic identity or hierarchy references.

## Allowed Values

`Difficulty`:

- `Beginner`
- `Intermediate`
- `Advanced`

`Content_Status`:

- `Draft`
- `Published`
- `Archived`

`Is_Radar`:

- `TRUE`
- `FALSE`

Dates use `YYYY-MM-DD`.

## Lens Relevance

Topic-level `Lens_Relevance` supports JSON or a simple authoring convention.

Preferred simple convention:

```text
AI Engineer: Must; ML Engineer: Good; Data Scientist: Optional
```

Allowed relevance categories:

- `Must`
- `Good`
- `Optional`

The build script aggregates topic relevance by role for Tracks, Subjects, and Modules.

## Resources

Resources are normalized into JSON objects:

```json
[
  { "type": "paper", "title": "LoRA Paper", "url": "https://..." },
  { "type": "video", "title": "LoRA Explained", "url": "https://..." }
]
```

Excel cells may contain that JSON directly, or this simpler line-based format:

```text
paper | LoRA Paper | https://...
video | LoRA Explained | https://...
```

Use one resource per line.

## Aggregation Rules

Do not manually maintain aggregate values for Track, Subject, or Module.

`build_syllabus.py` calculates:

- `Difficulty`: counts by difficulty, not an average.
- `Knowledge_Layer`: counts by topic knowledge layer.
- `Learning_Time`: sum of topic-level hours.
- `Lens_Relevance`: counts by role and relevance category.

On every successful run, `build_syllabus.py` also writes these aggregate values
back into the `Tracks`, `Subjects`, and `Modules` sheets. If you edit topic
`Knowledge_Layer`, `Difficulty`, `Learning_Time`, or `Lens_Relevance`, rerun the
build script and the parent aggregate cells will be refreshed automatically.

## Radar Fields

Each sheet supports:

- `Is_Radar`
- `Radar_Start_Date`
- `Radar_End_Date`

These control current Radar presentation state only. Radar discovery/agent data remains outside `syllabus.xlsx`.

## Archiving

To archive an item, set `Content_Status` to `Archived`.

Do not delete rows unless you intentionally want to remove that item from generated JSON.

## Validation

`build_syllabus.py` fails on:

- Missing or duplicate IDs.
- Invalid hierarchy references.
- Blank required hierarchy fields.
- Invalid `Difficulty`, `Content_Status`, `Lens_Relevance`, or Radar dates.
- `Radar_End_Date` earlier than `Radar_Start_Date`.

It warns on:

- Duplicate topic names in the same module.
- Topics moved to another module.
- Archived topics marked for Radar.
- Missing `Summary`.
- Missing `Why_It_Matters`.

## Running The Build

```bash
python3 build_syllabus.py
```

Outputs:

- `public/syllabus.json`
- `src/data/syllabus.json`
- `syllabus_migration_report.md`

If the workbook is still in the old single-sheet format, the script migrates it to the four-sheet format and creates `syllabus.legacy-backup.xlsx` before overwriting `syllabus.xlsx`.
