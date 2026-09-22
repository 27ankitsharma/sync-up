import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LessonCanvas } from "@/components/LessonCanvas";
import type { Lesson } from "@/types/courseContent";

function lesson(id: string, title: string, order: number): Lesson {
  return {
    id,
    courseId: "course-agent-definition",
    title,
    slug: id,
    orderIndex: order,
    content: { type: "doc", content: [{ type: "paragraph", text: `${title} body` }] },
    durationMinutes: 5,
    status: "published",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  };
}

const lessons = [
  lesson("one", "Introduction", 1),
  lesson("two", "What is MHS", 2),
];

describe("LessonCanvas", () => {
  it("renders one lesson as a document and advances with Next Lesson", () => {
    const onSelect = vi.fn();
    render(<LessonCanvas lessons={lessons} activeIndex={0} onSelect={onSelect} />);

    expect(screen.getByText("Lesson 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Introduction" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous Lesson" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next Lesson" }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
