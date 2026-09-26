import json
from pathlib import Path

import pytest

from quiz_sync.validation import discover_quizzes, load_quiz


TOPIC_ID = "agent-foundations-agent-concepts-agent-definition"


def valid_payload() -> dict:
    return {
        "quiz_id": "quiz_test",
        "course_id": "course-test",
        "title": "Test Quiz",
        "questions_per_attempt": 1,
        "passing_score": 80,
        "max_attempts": 3,
        "status": "Published",
        "questions": [
            {
                "question_id": "q_test_001",
                "topic_id": TOPIC_ID,
                "question_type": "single_select",
                "question": "Which answer is correct?",
                "options": [
                    {"value": "A", "label": "First", "feedback": "First feedback"},
                    {"value": "B", "label": "Second", "feedback": "Second feedback"},
                    {"value": "C", "label": "Third", "feedback": "Third feedback"},
                    {"value": "D", "label": "Fourth", "feedback": "Fourth feedback"},
                ],
                "correct_answer": "B",
                "hint": "A useful hint",
                "difficulty": "Easy",
            }
        ],
    }


def write_quiz(path: Path, payload: dict) -> Path:
    path.write_text(json.dumps(payload), encoding="utf-8")
    return path


def test_loads_and_normalizes_valid_quiz(tmp_path: Path) -> None:
    quiz = load_quiz(write_quiz(tmp_path / "quiz.json", valid_payload()), {TOPIC_ID})
    assert quiz.status == "published"
    assert quiz.questions[0].correct_answer == "B"
    assert quiz.questions[0].options[1]["feedback"] == "Second feedback"


def test_rejects_option_without_feedback(tmp_path: Path) -> None:
    payload = valid_payload()
    del payload["questions"][0]["options"][2]["feedback"]
    with pytest.raises(ValueError, match="missing feedback"):
        load_quiz(write_quiz(tmp_path / "quiz.json", payload), {TOPIC_ID})


def test_rejects_attempt_larger_than_pool(tmp_path: Path) -> None:
    payload = valid_payload()
    payload["questions_per_attempt"] = 2
    with pytest.raises(ValueError, match="pool has only 1"):
        load_quiz(write_quiz(tmp_path / "quiz.json", payload), {TOPIC_ID})


def test_rejects_duplicate_question_ids_across_files(tmp_path: Path) -> None:
    first = valid_payload()
    second = valid_payload()
    second["quiz_id"] = "quiz_test_2"
    second["course_id"] = "course-test-2"
    write_quiz(tmp_path / "first.json", first)
    write_quiz(tmp_path / "second.json", second)
    with pytest.raises(ValueError, match="Duplicate question_id"):
        discover_quizzes(tmp_path, {TOPIC_ID})
