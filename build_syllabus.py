#!/usr/bin/env python3
"""Build public/syllabus.json from syllabus.xlsx.

The script intentionally uses only the Python standard library so contributors
can run it without installing a separate Python dependency stack.
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import OrderedDict
from pathlib import Path
from typing import Any
from xml.etree import ElementTree


INPUT_FILE = Path("syllabus.xlsx")
OUTPUT_FILE = Path("public/syllabus.json")
SRC_OUTPUT_FILE = Path("src/data/syllabus.json")

EXPECTED_COLUMNS = [
    "Track",
    "Subject",
    "Module",
    "Topic",
    "Layer",
    "Difficulty",
    "Roles",
    "Status",
    "Priority",
    "Is_Radar",
    "Radar_Week",
    "Summary",
    "Why_It_Matters",
]

VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}
VALID_STATUSES = {"draft", "published", "coming_soon"}
VALID_PRIORITIES = {"high", "medium", "low"}
ISO_WEEK_RE = re.compile(r"^\d{4}-W\d{2}$")

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "rel": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "pkgrel": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def slugify(value: str) -> str:
    """Create lowercase hyphen slugs from titles."""
    slug = value.strip().lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug.strip("-")


def column_index(cell_ref: str) -> int:
    """Convert an Excel cell reference like C12 into a zero-based column index."""
    letters = re.match(r"^[A-Z]+", cell_ref)
    if not letters:
        raise ValueError(f"Invalid cell reference: {cell_ref}")

    index = 0
    for char in letters.group(0):
        index = index * 26 + (ord(char) - ord("A") + 1)
    return index - 1


def text_content(element: ElementTree.Element | None) -> str:
    if element is None:
        return ""
    return "".join(element.itertext())


def read_shared_strings(workbook: zipfile.ZipFile) -> list[str]:
    try:
        root = ElementTree.fromstring(workbook.read("xl/sharedStrings.xml"))
    except KeyError:
        return []

    return [text_content(item) for item in root.findall("main:si", NS)]


def first_sheet_path(workbook: zipfile.ZipFile) -> str:
    """Resolve the first worksheet path from workbook relationships."""
    workbook_root = ElementTree.fromstring(workbook.read("xl/workbook.xml"))
    rels_root = ElementTree.fromstring(workbook.read("xl/_rels/workbook.xml.rels"))

    first_sheet = workbook_root.find("main:sheets/main:sheet", NS)
    if first_sheet is None:
        raise ValueError("Workbook does not contain any sheets")

    relationship_id = first_sheet.attrib[f"{{{NS['rel']}}}id"]
    for relationship in rels_root.findall("pkgrel:Relationship", NS):
        if relationship.attrib["Id"] == relationship_id:
            target = relationship.attrib["Target"].lstrip("/")
            return target if target.startswith("xl/") else f"xl/{target}"

    raise ValueError("Could not resolve first worksheet path")


def read_cell_value(cell: ElementTree.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")

    if cell_type == "inlineStr":
        return text_content(cell.find("main:is", NS)).strip()

    value_node = cell.find("main:v", NS)
    raw_value = text_content(value_node).strip()

    if cell_type == "s":
        return shared_strings[int(raw_value)].strip() if raw_value else ""

    if cell_type == "b":
        return "TRUE" if raw_value == "1" else "FALSE"

    return raw_value


def read_xlsx_rows(path: Path) -> list[dict[str, str]]:
    """Read the first worksheet into dictionaries keyed by the header row."""
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")

    with zipfile.ZipFile(path) as workbook:
        shared_strings = read_shared_strings(workbook)
        worksheet_path = first_sheet_path(workbook)
        sheet_root = ElementTree.fromstring(workbook.read(worksheet_path))

    raw_rows: list[list[str]] = []
    for row in sheet_root.findall(".//main:sheetData/main:row", NS):
        values_by_column: dict[int, str] = {}
        max_column = -1

        for cell in row.findall("main:c", NS):
            cell_ref = cell.attrib.get("r", "")
            index = column_index(cell_ref)
            values_by_column[index] = read_cell_value(cell, shared_strings)
            max_column = max(max_column, index)

        raw_rows.append([values_by_column.get(index, "") for index in range(max_column + 1)])

    if not raw_rows:
        raise ValueError("Workbook is empty")

    headers = raw_rows[0]
    if headers != EXPECTED_COLUMNS:
        raise ValueError(
            "Invalid columns.\n"
            f"Expected: {EXPECTED_COLUMNS}\n"
            f"Found:    {headers}"
        )

    rows: list[dict[str, str]] = []
    for raw_row in raw_rows[1:]:
        padded = raw_row + [""] * (len(EXPECTED_COLUMNS) - len(raw_row))
        if not any(cell.strip() for cell in padded):
            continue
        rows.append(dict(zip(EXPECTED_COLUMNS, padded[: len(EXPECTED_COLUMNS)])))

    return rows


def parse_bool(value: str, row_number: int) -> bool:
    normalized = value.strip().lower()
    if normalized in {"true", "1", "yes", "y"}:
        return True
    if normalized in {"false", "0", "no", "n", ""}:
        return False
    raise ValueError(f"Row {row_number}: Is_Radar must be TRUE or FALSE")


def require_value(row: dict[str, str], column: str, row_number: int) -> str:
    value = row[column].strip()
    if not value:
        raise ValueError(f"Row {row_number}: {column} is required")
    return value


def validate_choice(value: str, valid_values: set[str], column: str, row_number: int) -> str:
    if value not in valid_values:
        raise ValueError(f"Row {row_number}: {column} must be one of {sorted(valid_values)}")
    return value


def build_syllabus(rows: list[dict[str, str]]) -> dict[str, Any]:
    tracks: "OrderedDict[str, dict[str, Any]]" = OrderedDict()
    subject_indexes: dict[str, "OrderedDict[str, dict[str, Any]]"] = {}
    module_indexes: dict[str, "OrderedDict[str, dict[str, Any]]"] = {}

    for index, row in enumerate(rows, start=2):
        track_title = require_value(row, "Track", index)
        subject_title = require_value(row, "Subject", index)
        module_title = require_value(row, "Module", index)
        topic_title = require_value(row, "Topic", index)
        layer = require_value(row, "Layer", index)

        difficulty = validate_choice(require_value(row, "Difficulty", index), VALID_DIFFICULTIES, "Difficulty", index)
        status = validate_choice(require_value(row, "Status", index), VALID_STATUSES, "Status", index)
        priority = validate_choice(require_value(row, "Priority", index), VALID_PRIORITIES, "Priority", index)
        is_radar = parse_bool(row["Is_Radar"], index)
        radar_week = row["Radar_Week"].strip() or None

        if is_radar and not radar_week:
            raise ValueError(f"Row {index}: Radar_Week is required when Is_Radar is TRUE")
        if radar_week and not ISO_WEEK_RE.match(radar_week):
            raise ValueError(f"Row {index}: Radar_Week must use YYYY-Www format, for example 2026-W28")

        track_slug = slugify(track_title)
        subject_slug = slugify(subject_title)
        module_slug = slugify(module_title)
        topic_slug = slugify(topic_title)

        if track_slug not in tracks:
            tracks[track_slug] = {
                "id": track_slug,
                "title": track_title,
                "slug": track_slug,
                "order": len(tracks) + 1,
                "hasCourse": False,
                "subjects": [],
            }
            subject_indexes[track_slug] = OrderedDict()

        subjects = subject_indexes[track_slug]
        if subject_slug not in subjects:
            subjects[subject_slug] = {
                "id": subject_slug,
                "title": subject_title,
                "slug": subject_slug,
                "order": len(subjects) + 1,
                "hasCourse": False,
                "modules": [],
            }
            tracks[track_slug]["subjects"].append(subjects[subject_slug])
            module_indexes[f"{track_slug}/{subject_slug}"] = OrderedDict()

        modules = module_indexes[f"{track_slug}/{subject_slug}"]
        if module_slug not in modules:
            modules[module_slug] = {
                "id": module_slug,
                "title": module_title,
                "slug": module_slug,
                "order": len(modules) + 1,
                "hasCourse": False,
                "topics": [],
            }
            subjects[subject_slug]["modules"].append(modules[module_slug])

        topic_order = len(modules[module_slug]["topics"]) + 1
        modules[module_slug]["topics"].append(
            {
                "id": topic_slug,
                "title": topic_title,
                "slug": topic_slug,
                "layer": layer,
                "difficulty": difficulty,
                "roles": [role.strip() for role in row["Roles"].split(",") if role.strip()],
                "status": status,
                "priority": priority,
                "is_radar": is_radar,
                "radar_week": radar_week,
                "summary": row["Summary"].strip(),
                "why_it_matters": row["Why_It_Matters"].strip(),
                "order": topic_order,
                "hasCourse": False,
            }
        )

    return {"tracks": list(tracks.values())}


def count_nodes(syllabus: dict[str, Any]) -> tuple[int, int, int, int]:
    tracks = len(syllabus["tracks"])
    subjects = sum(len(track["subjects"]) for track in syllabus["tracks"])
    modules = sum(len(subject["modules"]) for track in syllabus["tracks"] for subject in track["subjects"])
    topics = sum(
        len(module["topics"])
        for track in syllabus["tracks"]
        for subject in track["subjects"]
        for module in subject["modules"]
    )
    return tracks, subjects, modules, topics


def main() -> int:
    try:
        rows = read_xlsx_rows(INPUT_FILE)
        syllabus = build_syllabus(rows)
        output_json = json.dumps(syllabus, indent=2) + "\n"
        OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        SRC_OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
        OUTPUT_FILE.write_text(output_json, encoding="utf-8")
        SRC_OUTPUT_FILE.write_text(output_json, encoding="utf-8")

        tracks, subjects, modules, topics = count_nodes(syllabus)
        print(f"Done: {tracks} tracks, {subjects} subjects, {modules} modules, {topics} topics exported to {OUTPUT_FILE}")
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
