#!/usr/bin/env python3
"""Sync Markdown-authored courses into the existing Supabase course/lesson tables."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from content_sync.assets import BUCKET, collect_local_images, content_type_for, storage_path_for
from content_sync.client import create_service_client, load_env
from content_sync.discover import CourseDoc, LessonDoc, discover_courses
from content_sync.markdown_to_blocks import markdown_to_content_json
from content_sync.syllabus import load_topics

ROOT = Path(__file__).resolve().parent
CONTENT_ROOT = ROOT / "content"
SYLLABUS_PATH = ROOT / "src" / "data" / "syllabus.json"
ORDER_OFFSET = 10_000


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync Markdown courses to Supabase")
    parser.add_argument("--dry-run", action="store_true", help="Validate and report without writing to Supabase")
    parser.add_argument(
        "--delete-removed",
        action="store_true",
        help="Archive lessons that belong to synced courses but are no longer in Markdown",
    )
    args = parser.parse_args()
    load_env(ROOT)

    topics = load_topics(SYLLABUS_PATH)
    courses = discover_courses(CONTENT_ROOT)
    if not courses:
        print("No course.md files found under content/")
        return 1

    prepared: list[tuple[CourseDoc, dict[str, Any], list[tuple[LessonDoc, dict[str, Any]]]]] = []
    for course in courses:
        if course.topic_id not in topics:
            raise SystemExit(f"{course.path}: topic_id {course.topic_id!r} is not in syllabus.json")
        topic = topics[course.topic_id]
        if topic.get("title") and topic["title"] != course.title:
            print(f"Note: {course.course_id} title {course.title!r} differs from syllabus topic {topic['title']!r}")
        lesson_payloads: list[tuple[LessonDoc, dict[str, Any]]] = []
        for lesson in course.lessons:
            content = markdown_to_content_json(lesson.markdown)
            for block, image_path in collect_local_images(content, lesson.path):
                block["src"] = storage_path_for(course.course_id, image_path)
                block["_local_path"] = str(image_path)
            lesson_payloads.append((lesson, content))
        prepared.append((course, topic, lesson_payloads))

    report = {
        "courses": {"created": 0, "updated": 0, "unchanged": 0, "archived": 0},
        "lessons": {"created": 0, "updated": 0, "unchanged": 0, "archived": 0},
        "assets": {"uploaded": 0, "unchanged": 0},
    }

    if args.dry_run:
        print_plan(prepared)
        print("Dry-run complete. No Supabase or Storage changes were made.")
        return 0

    client = create_service_client()
    for course, _topic, lesson_payloads in prepared:
        sync_course(client, course, lesson_payloads, report)
        if args.delete_removed:
            archive_removed_lessons(client, course, {lesson.lesson_id for lesson, _ in lesson_payloads}, report)

    print_report(report)
    return 0


def sync_course(client: Any, course: CourseDoc, lesson_payloads: list[tuple[LessonDoc, dict[str, Any]]], report: dict) -> None:
    existing = fetch_course(client, course.course_id)
    course_row = {
        "id": course.course_id,
        "topic_id": course.topic_id,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "status": course.status,
    }
    if existing is None:
        client.table("courses").insert(course_row).execute()
        report["courses"]["created"] += 1
    elif comparable_course(existing) == comparable_course(course_row):
        report["courses"]["unchanged"] += 1
    else:
        client.table("courses").update(course_row).eq("id", course.course_id).execute()
        report["courses"]["updated"] += 1

    existing_lessons = fetch_lessons(client, course.course_id)
    existing_by_id = {row["id"]: row for row in existing_lessons}
    needs_order_shift = any(
        existing_by_id.get(lesson.lesson_id, {}).get("order_index") not in {None, lesson.order}
        and existing_by_id.get(lesson.lesson_id, {}).get("order_index") != lesson.order
        for lesson, _ in lesson_payloads
    )
    if needs_order_shift:
        for lesson_id, temporary_order in temporary_order_assignments(existing_lessons):
            client.table("lessons").update({"order_index": temporary_order}).eq("id", lesson_id).execute()

    for lesson, content in lesson_payloads:
        upload_images(client, content, report)
        clean_content = strip_local_paths(content)
        lesson_row = {
            "id": lesson.lesson_id,
            "course_id": lesson.course_id,
            "title": lesson.title,
            "slug": lesson.slug,
            "order_index": lesson.order,
            "content_json": clean_content,
            "duration_minutes": lesson.duration_minutes,
            "status": lesson.status,
        }
        current = existing_by_id.get(lesson.lesson_id)
        if current is None:
            client.table("lessons").insert(lesson_row).execute()
            report["lessons"]["created"] += 1
        elif comparable_lesson(current) == comparable_lesson(lesson_row):
            report["lessons"]["unchanged"] += 1
        else:
            client.table("lessons").update(lesson_row).eq("id", lesson.lesson_id).execute()
            report["lessons"]["updated"] += 1


def archive_removed_lessons(client: Any, course: CourseDoc, local_ids: set[str], report: dict) -> None:
    for row in fetch_lessons(client, course.course_id):
        if row["id"] in local_ids or row.get("status") == "archived":
            continue
        client.table("lessons").update({"status": "archived"}).eq("id", row["id"]).execute()
        report["lessons"]["archived"] += 1


def upload_images(client: Any, content: dict[str, Any], report: dict) -> None:
    for block in content.get("content", []):
        local_path = block.pop("_local_path", None)
        if not local_path:
            continue
        path = Path(local_path)
        storage_path = block["src"]
        if remote_asset_exists(client, storage_path):
            report["assets"]["unchanged"] += 1
            continue
        client.storage.from_(BUCKET).upload(
            storage_path,
            path.read_bytes(),
            {"content-type": content_type_for(path), "upsert": "true"},
        )
        report["assets"]["uploaded"] += 1


def remote_asset_exists(client: Any, storage_path: str) -> bool:
    folder, _, name = storage_path.rpartition("/")
    try:
        items = client.storage.from_(BUCKET).list(folder or "")
    except Exception:
        return False
    return any(item.get("name") == name for item in items or [])


def fetch_course(client: Any, course_id: str) -> dict[str, Any] | None:
    result = client.table("courses").select("*").eq("id", course_id).limit(1).execute()
    rows = result.data or []
    return rows[0] if rows else None


def fetch_lessons(client: Any, course_id: str) -> list[dict[str, Any]]:
    result = client.table("lessons").select("*").eq("course_id", course_id).execute()
    return result.data or []


def temporary_order_assignments(existing_lessons: list[dict[str, Any]]) -> list[tuple[str, int]]:
    """Return collision-free staging orders, including after an interrupted retry."""
    if not existing_lessons:
        return []
    highest_existing_order = max(int(row.get("order_index") or 0) for row in existing_lessons)
    first_temporary_order = highest_existing_order + ORDER_OFFSET
    ordered_rows = sorted(existing_lessons, key=lambda row: str(row["id"]))
    return [
        (str(row["id"]), first_temporary_order + index + 1)
        for index, row in enumerate(ordered_rows)
    ]


def comparable_course(row: dict[str, Any]) -> tuple:
    return (row.get("topic_id"), row.get("title"), row.get("slug"), row.get("description"), row.get("status"))


def comparable_lesson(row: dict[str, Any]) -> tuple:
    return (
        row.get("course_id"),
        row.get("title"),
        row.get("slug"),
        row.get("order_index"),
        json.dumps(row.get("content_json"), sort_keys=True, ensure_ascii=True),
        row.get("duration_minutes"),
        row.get("status"),
    )


def strip_local_paths(content: dict[str, Any]) -> dict[str, Any]:
    cleaned = {"type": "doc", "content": []}
    for block in content.get("content", []):
        item = dict(block)
        item.pop("_local_path", None)
        cleaned["content"].append(item)
    return cleaned


def print_plan(prepared: list[tuple[CourseDoc, dict[str, Any], list[tuple[LessonDoc, dict[str, Any]]]]]) -> None:
    for course, topic, lessons in prepared:
        print(f"Course {course.course_id} → topic {course.topic_id} ({topic.get('title')})")
        for lesson, content in lessons:
            images = sum(1 for block in content["content"] if block.get("type") == "image")
            print(f"  {lesson.order}. {lesson.lesson_id} — {lesson.title} ({len(content['content'])} blocks, {images} images)")


def print_report(report: dict) -> None:
    print("Sync complete")
    for kind, counts in report.items():
        print(f"- {kind}: " + ", ".join(f"{name} {value}" for name, value in counts.items()))


if __name__ == "__main__":
    raise SystemExit(main())
