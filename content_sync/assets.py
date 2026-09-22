from __future__ import annotations

import hashlib
import mimetypes
from pathlib import Path
from typing import Any


BUCKET = "course-assets"


def collect_local_images(content: dict[str, Any], lesson_path: Path) -> list[tuple[dict[str, Any], Path]]:
    found: list[tuple[dict[str, Any], Path]] = []
    for block in content.get("content", []):
        if block.get("type") != "image":
            continue
        src = str(block.get("src") or "")
        if not src or src.startswith(("http://", "https://", "/")):
            continue
        image_path = (lesson_path.parent / src).resolve()
        if not image_path.exists():
            raise FileNotFoundError(f"{lesson_path}: image does not exist: {src}")
        found.append((block, image_path))
    return found


def storage_path_for(course_id: str, image_path: Path) -> str:
    digest = hashlib.sha256(image_path.read_bytes()).hexdigest()[:12]
    return f"{course_id}/{digest}-{image_path.name}"


def content_type_for(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    return guessed or "application/octet-stream"
