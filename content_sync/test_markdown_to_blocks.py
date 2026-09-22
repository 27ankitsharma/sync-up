from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from content_sync.discover import load_course
from content_sync.markdown_to_blocks import markdown_to_content_json
from sync import temporary_order_assignments


def test_converts_supported_markdown_blocks() -> None:
    markdown = """
# **Agent** title

A paragraph with **bold text**, *italic text*, and a [link](https://example.com).

![Diagram](./images/agent-architecture.svg)

- one
- two

```python
print("ok")
```

> [!TIP]
> Keep the loop explicit.

| A | B |
| --- | --- |
| 1 | 2 |

https://example.com/docs
"""
    doc = markdown_to_content_json(markdown)
    types = [block["type"] for block in doc["content"]]
    assert "heading" in types
    assert "paragraph" in types
    assert "image" in types
    assert "list" in types
    assert "code" in types
    assert "callout" in types
    assert "table" in types
    heading = next(block for block in doc["content"] if block["type"] == "heading")
    paragraph = next(block for block in doc["content"] if block["type"] == "paragraph")
    assert heading["text"] == "**Agent** title"
    assert "**bold text**" in paragraph["text"]
    assert "*italic text*" in paragraph["text"]
    assert "[link](https://example.com)" in paragraph["text"]


def test_filename_is_not_the_lesson_id() -> None:
    root = Path("content/ai-agents-agentic-systems/agent-foundations/agent-foundations-agent-concepts/Agent Definition")
    course = load_course(root / "course.md")
    assert course.course_id == "course-agent-definition"
    assert course.topic_id == "agent-foundations-agent-concepts-agent-definition"
    first_lesson = course.lessons[0]
    assert first_lesson.path.name == "01-what-is-an-ai-agent.md"
    assert first_lesson.lesson_id == "agent-definition-what-is-an-agent"
    orders = [lesson.order for lesson in course.lessons]
    assert orders == sorted(orders)
    assert len(orders) == len(set(orders))


def test_temporary_orders_are_safe_after_interrupted_sync() -> None:
    existing = [
        {"id": "first", "order_index": 3},
        {"id": "second", "order_index": 10003},
        {"id": "third", "order_index": 30005},
    ]
    assignments = temporary_order_assignments(existing)
    temporary_orders = [order for _, order in assignments]
    assert len(temporary_orders) == len(set(temporary_orders))
    assert min(temporary_orders) > 30005


if __name__ == "__main__":
    test_converts_supported_markdown_blocks()
    test_filename_is_not_the_lesson_id()
    test_temporary_orders_are_safe_after_interrupted_sync()
    print("ok")
