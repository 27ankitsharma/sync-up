from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import frontmatter

VALID_STATUSES = {"draft", "published", "archived"}


@dataclass
class CourseDoc:
    course_id: str
    topic_id: str
    title: str
    slug: str
    status: str
    description: str | None
    path: Path
    lessons: list[LessonDoc] = field(default_factory=list)


@dataclass
class LessonDoc:
    lesson_id: str
    course_id: str
    title: str
    slug: str
    order: int
    status: str
    duration_minutes: int | None
    markdown: str
    path: Path


def discover_courses(content_root: Path) -> list[CourseDoc]:
    courses: list[CourseDoc] = []
    for course_file in sorted(content_root.rglob("course.md")):
        courses.append(load_course(course_file))
    return courses


def load_course(course_file: Path) -> CourseDoc:
    post = frontmatter.load(course_file)
    meta = post.metadata
    require_type(meta, "course", course_file)
    course_id = require_id(meta, "course_id", course_file)
    topic_id = require_text(meta, "topic_id", course_file)
    title = require_text(meta, "title", course_file)
    status = parse_status(meta.get("status"), course_file)
    slug = str(meta.get("slug") or slugify(title))
    description = str(post.content).strip() or (str(meta.get("description") or "").strip() or None)
    course = CourseDoc(
        course_id=course_id,
        topic_id=topic_id,
        title=title,
        slug=slug,
        status=status,
        description=description,
        path=course_file,
    )
    for lesson_file in sorted(course_file.parent.glob("*.md")):
        if lesson_file.name == "course.md":
            continue
        course.lessons.append(load_lesson(lesson_file, course_id))
    course.lessons.sort(key=lambda lesson: (lesson.order, lesson.lesson_id))
    validate_unique_orders(course)
    return course


def load_lesson(path: Path, expected_course_id: str) -> LessonDoc:
    post = frontmatter.load(path)
    meta = post.metadata
    require_type(meta, "lesson", path)
    lesson_id = require_id(meta, "lesson_id", path)
    course_id = require_id(meta, "course_id", path)
    if course_id != expected_course_id:
        raise ValueError(f"{path}: course_id {course_id!r} does not match {expected_course_id!r}")
    title = require_text(meta, "title", path)
    status = parse_status(meta.get("status"), path)
    order = parse_order(meta.get("order"), path)
    duration = meta.get("duration_minutes")
    return LessonDoc(
        lesson_id=lesson_id,
        course_id=course_id,
        title=title,
        slug=str(meta.get("slug") or slugify(title)),
        order=order,
        status=status,
        duration_minutes=int(duration) if duration not in (None, "") else None,
        markdown=post.content,
        path=path,
    )


def require_type(meta: dict[str, Any], expected: str, path: Path) -> None:
    if str(meta.get("type") or "") != expected:
        raise ValueError(f"{path}: type must be {expected!r}")


def require_id(meta: dict[str, Any], key: str, path: Path) -> str:
    value = require_text(meta, key, path)
    if not all(char.isalnum() or char in "-_" for char in value):
        raise ValueError(f"{path}: {key} must be a stable slug of letters, numbers, hyphen, or underscore")
    return value


def require_text(meta: dict[str, Any], key: str, path: Path) -> str:
    value = str(meta.get(key) or "").strip()
    if not value:
        raise ValueError(f"{path}: missing {key}")
    return value


def parse_status(value: Any, path: Path) -> str:
    status = str(value or "draft").strip()
    if status not in VALID_STATUSES:
        raise ValueError(f"{path}: status must be one of {sorted(VALID_STATUSES)}")
    return status


def parse_order(value: Any, path: Path) -> int:
    try:
        order = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{path}: order must be an integer") from exc
    if order < 1:
        raise ValueError(f"{path}: order must be >= 1")
    return order


def validate_unique_orders(course: CourseDoc) -> None:
    seen: dict[int, str] = {}
    for lesson in course.lessons:
        if lesson.order in seen:
            raise ValueError(f"{course.path}: duplicate lesson order {lesson.order}")
        seen[lesson.order] = lesson.lesson_id


def slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value).strip("-")
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned or "untitled"
