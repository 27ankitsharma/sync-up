import { describe, expect, it } from "vitest";
import { publishedLessonsInOrder, type LessonRow } from "@/lib/courseMappers";
import { parseLessonContent } from "@/lib/lessonContent";

describe("parseLessonContent", () => {
  it("returns an empty doc for invalid input", () => {
    expect(parseLessonContent(null)).toEqual({ type: "doc", content: [] });
    expect(parseLessonContent("not-json")).toEqual({ type: "doc", content: [] });
  });

  it("keeps supported blocks and drops unknown ones", () => {
    const doc = parseLessonContent({
      type: "doc",
      content: [
        { type: "heading", level: 2, text: "What is LoRA?" },
        { type: "paragraph", text: "Existing syllabus summary." },
        { type: "image", src: "lora/lora-architecture.png", alt: "Architecture" },
        { type: "code", language: "python", code: "print('ok')" },
        { type: "list", style: "bullet", items: ["A", "B"] },
        { type: "table", headers: ["A"], rows: [["1"]] },
        { type: "unknown", text: "ignore" },
      ],
    });

    expect(doc.content.map((block) => block.type)).toEqual(["heading", "paragraph", "image", "code", "list", "table"]);
  });
});

describe("publishedLessonsInOrder", () => {
  it("filters unpublished lessons and sorts by order_index", () => {
    const rows: LessonRow[] = [
      lessonRow({ id: "2", order_index: 2, status: "published", title: "Second" }),
      lessonRow({ id: "3", order_index: 3, status: "draft", title: "Hidden" }),
      lessonRow({ id: "1", order_index: 1, status: "published", title: "First" }),
      lessonRow({ id: "4", order_index: 4, status: "archived", title: "Archived" }),
    ];

    const lessons = publishedLessonsInOrder(rows);
    expect(lessons.map((lesson) => lesson.title)).toEqual(["First", "Second"]);
    expect(lessons.every((lesson) => lesson.status === "published")).toBe(true);
  });
});

function lessonRow(overrides: Partial<LessonRow> & Pick<LessonRow, "id" | "order_index" | "status" | "title">): LessonRow {
  return {
    course_id: "course-1",
    slug: overrides.title.toLowerCase(),
    content_json: { type: "doc", content: [{ type: "paragraph", text: "Sample" }] },
    duration_minutes: 8,
    created_at: "2026-09-13T00:00:00.000Z",
    updated_at: "2026-09-13T00:00:00.000Z",
    ...overrides,
  };
}
