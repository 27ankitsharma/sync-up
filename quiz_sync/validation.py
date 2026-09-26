from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")
OPTION_VALUES = ["A", "B", "C", "D"]
VALID_STATUSES = {"draft", "published", "archived"}


@dataclass(frozen=True)
class QuestionDoc:
    question_id: str
    quiz_id: str
    topic_id: str | None
    question: str
    question_type: str
    options: list[dict[str, str]]
    correct_answer: str
    hint: str | None
    difficulty: str | None


@dataclass(frozen=True)
class QuizDoc:
    quiz_id: str
    course_id: str
    title: str
    description: str | None
    questions_per_attempt: int
    passing_score: int
    max_attempts: int | None
    status: str
    questions: list[QuestionDoc]
    path: Path


def load_quiz(path: Path, valid_topic_ids: set[str] | None = None) -> QuizDoc:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(payload, dict):
        raise ValueError(f"{path}: root must be a JSON object")

    quiz_id = require_id(payload, "quiz_id", path)
    course_id = require_id(payload, "course_id", path)
    title = require_text(payload, "title", path)
    description = optional_text(payload.get("description"))
    questions_per_attempt = require_positive_int(payload, "questions_per_attempt", path)
    passing_score = require_int(payload, "passing_score", path)
    if not 0 <= passing_score <= 100:
        raise ValueError(f"{path}: passing_score must be between 0 and 100")
    max_attempts_value = payload.get("max_attempts")
    max_attempts = None if max_attempts_value in (None, "") else parse_positive_int(max_attempts_value, "max_attempts", path)
    status = str(payload.get("status") or "draft").strip().lower()
    if status not in VALID_STATUSES:
        raise ValueError(f"{path}: status must be one of {sorted(VALID_STATUSES)}")

    raw_questions = payload.get("questions")
    if not isinstance(raw_questions, list) or not raw_questions:
        raise ValueError(f"{path}: questions must be a non-empty array")
    questions = [
        parse_question(item, quiz_id, path, index, valid_topic_ids)
        for index, item in enumerate(raw_questions, start=1)
    ]
    question_ids = [question.question_id for question in questions]
    duplicates = sorted({question_id for question_id in question_ids if question_ids.count(question_id) > 1})
    if duplicates:
        raise ValueError(f"{path}: duplicate question_id values: {duplicates}")
    if questions_per_attempt > len(questions):
        raise ValueError(
            f"{path}: questions_per_attempt is {questions_per_attempt}, "
            f"but the pool has only {len(questions)} questions"
        )

    return QuizDoc(
        quiz_id=quiz_id,
        course_id=course_id,
        title=title,
        description=description,
        questions_per_attempt=questions_per_attempt,
        passing_score=passing_score,
        max_attempts=max_attempts,
        status=status,
        questions=questions,
        path=path,
    )


def discover_quizzes(root: Path, valid_topic_ids: set[str] | None = None) -> list[QuizDoc]:
    quizzes = [load_quiz(path, valid_topic_ids) for path in sorted(root.glob("*.json"))]
    quiz_ids = [quiz.quiz_id for quiz in quizzes]
    duplicate_quizzes = sorted({quiz_id for quiz_id in quiz_ids if quiz_ids.count(quiz_id) > 1})
    if duplicate_quizzes:
        raise ValueError(f"Duplicate quiz_id values across content files: {duplicate_quizzes}")

    all_questions = [question.question_id for quiz in quizzes for question in quiz.questions]
    duplicate_questions = sorted(
        {question_id for question_id in all_questions if all_questions.count(question_id) > 1}
    )
    if duplicate_questions:
        raise ValueError(f"Duplicate question_id values across content files: {duplicate_questions}")
    return quizzes


def parse_question(
    value: Any,
    quiz_id: str,
    path: Path,
    index: int,
    valid_topic_ids: set[str] | None,
) -> QuestionDoc:
    label = f"{path}: question {index}"
    if not isinstance(value, dict):
        raise ValueError(f"{label} must be an object")
    question_id = require_id(value, "question_id", Path(label))
    question_type = require_text(value, "question_type", Path(label))
    if question_type != "single_select":
        raise ValueError(f"{label}: only question_type 'single_select' is supported")
    question = require_text(value, "question", Path(label))
    topic_id = optional_text(value.get("topic_id"))
    if topic_id and valid_topic_ids is not None and topic_id not in valid_topic_ids:
        raise ValueError(f"{label}: topic_id {topic_id!r} is not in syllabus.json")

    raw_options = value.get("options")
    if not isinstance(raw_options, list) or len(raw_options) != 4:
        raise ValueError(f"{label}: single_select questions require exactly four options")
    options: list[dict[str, str]] = []
    for option_index, raw_option in enumerate(raw_options, start=1):
        if not isinstance(raw_option, dict):
            raise ValueError(f"{label}: option {option_index} must be an object")
        options.append(
            {
                "value": require_text(raw_option, "value", Path(f"{label} option {option_index}")),
                "label": require_text(raw_option, "label", Path(f"{label} option {option_index}")),
                "feedback": require_text(raw_option, "feedback", Path(f"{label} option {option_index}")),
            }
        )
    values = [option["value"] for option in options]
    if values != OPTION_VALUES:
        raise ValueError(f"{label}: option values must be exactly A, B, C, D in order")

    correct_answer = require_text(value, "correct_answer", Path(label))
    if correct_answer not in OPTION_VALUES:
        raise ValueError(f"{label}: correct_answer must be one of {OPTION_VALUES}")

    return QuestionDoc(
        question_id=question_id,
        quiz_id=quiz_id,
        topic_id=topic_id,
        question=question,
        question_type=question_type,
        options=options,
        correct_answer=correct_answer,
        hint=optional_text(value.get("hint")),
        difficulty=optional_text(value.get("difficulty")),
    )


def require_id(payload: dict[str, Any], key: str, path: Path) -> str:
    value = require_text(payload, key, path)
    if not ID_PATTERN.fullmatch(value):
        raise ValueError(f"{path}: {key} must contain only letters, numbers, hyphens, or underscores")
    return value


def require_text(payload: dict[str, Any], key: str, path: Path) -> str:
    value = str(payload.get(key) or "").strip()
    if not value:
        raise ValueError(f"{path}: missing {key}")
    return value


def optional_text(value: Any) -> str | None:
    text = str(value or "").strip()
    return text or None


def require_positive_int(payload: dict[str, Any], key: str, path: Path) -> int:
    return parse_positive_int(payload.get(key), key, path)


def require_int(payload: dict[str, Any], key: str, path: Path) -> int:
    try:
        return int(payload.get(key))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{path}: {key} must be an integer") from exc


def parse_positive_int(value: Any, key: str, path: Path) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f"{path}: {key} must be a positive integer") from exc
    if parsed <= 0:
        raise ValueError(f"{path}: {key} must be a positive integer")
    return parsed
