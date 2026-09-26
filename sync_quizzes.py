#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from dataclasses import asdict
from pathlib import Path
from typing import Any

from content_sync.client import create_service_client, load_env
from content_sync.syllabus import load_topics
from quiz_sync.validation import QuizDoc, discover_quizzes


ROOT = Path(__file__).resolve().parent
QUIZ_ROOT = ROOT / "content" / "quizzes"
SYLLABUS_PATH = ROOT / "src" / "data" / "syllabus.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and sync authored quizzes to Supabase.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without writing to Supabase.")
    args = parser.parse_args()
    load_env(ROOT)

    try:
        topics = load_topics(SYLLABUS_PATH)
        quizzes = discover_quizzes(QUIZ_ROOT, set(topics))
    except (OSError, ValueError) as exc:
        print(f"Quiz validation failed: {exc}", file=sys.stderr)
        return 1

    if not quizzes:
        print(f"No quiz JSON files found in {QUIZ_ROOT}")
        return 0

    if args.dry_run:
        for quiz in quizzes:
            print(
                f"VALID {quiz.quiz_id}: {len(quiz.questions)} questions, "
                f"{quiz.questions_per_attempt} per attempt"
            )
        print(f"Dry run complete: {len(quizzes)} quiz file(s); no Supabase changes made.")
        return 0

    client = create_service_client()
    report = {"created": 0, "updated": 0, "unchanged": 0}
    sync_quizzes(client, quizzes, report)
    print(
        "Quiz sync complete: "
        f"{report['created']} created, {report['updated']} updated, "
        f"{report['unchanged']} unchanged."
    )
    return 0


def sync_quizzes(client: Any, quizzes: list[QuizDoc], report: dict[str, int]) -> None:
    quiz_ids = [quiz.quiz_id for quiz in quizzes]
    question_ids = [question.question_id for quiz in quizzes for question in quiz.questions]
    existing_quizzes = rows_by_id(
        client.table("quizzes").select("*").in_("quiz_id", quiz_ids).execute().data or [],
        "quiz_id",
    )
    existing_questions = rows_by_id(
        client.table("questions").select("*").in_("question_id", question_ids).execute().data or [],
        "question_id",
    )

    for quiz in quizzes:
        quiz_row = {
            "quiz_id": quiz.quiz_id,
            "course_id": quiz.course_id,
            "title": quiz.title,
            "description": quiz.description,
            "questions_per_attempt": quiz.questions_per_attempt,
            "passing_score": quiz.passing_score,
            "max_attempts": quiz.max_attempts,
            "status": quiz.status,
        }
        upsert_row(client, "quizzes", "quiz_id", quiz_row, existing_quizzes, report)

        for question in quiz.questions:
            question_row = asdict(question)
            question_row["status"] = "published"
            upsert_row(client, "questions", "question_id", question_row, existing_questions, report)


def upsert_row(
    client: Any,
    table: str,
    id_field: str,
    row: dict[str, Any],
    existing: dict[str, dict[str, Any]],
    report: dict[str, int],
) -> None:
    current = existing.get(str(row[id_field]))
    if current is not None and all(current.get(key) == value for key, value in row.items()):
        report["unchanged"] += 1
        return
    client.table(table).upsert(row, on_conflict=id_field).execute()
    report["updated" if current is not None else "created"] += 1


def rows_by_id(rows: list[dict[str, Any]], id_field: str) -> dict[str, dict[str, Any]]:
    return {str(row[id_field]): row for row in rows}


if __name__ == "__main__":
    raise SystemExit(main())
