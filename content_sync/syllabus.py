from __future__ import annotations

import json
from pathlib import Path


def load_topics(syllabus_path: Path) -> dict[str, dict]:
    data = json.loads(syllabus_path.read_text(encoding="utf-8"))
    topics: dict[str, dict] = {}
    for track in data.get("tracks", []):
        for subject in track.get("subjects", []):
            for module in subject.get("modules", []):
                for topic in module.get("topics", []):
                    topic_id = topic.get("topic_id") or topic.get("id")
                    if topic_id:
                        topics[topic_id] = topic
    return topics
