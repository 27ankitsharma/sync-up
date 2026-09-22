import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { LessonCarousel } from "@/components/LessonCarousel";
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
  lesson("agent-definition-what-is-an-agent", "What Exactly Is an AI Agent and What Is It Not?", 1),
  lesson("agent-definition-architecture", "Architecture of an AI Agent", 2),
  lesson("agent-definition-conclusion", "Conclusion / Summary", 3),
];

describe("LessonCarousel", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    class IntersectionObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
  });

  it("renders the lesson carousel with overlay prev/next controls", () => {
    render(<LessonCarousel lessons={lessons} activeIndex={0} onSelect={vi.fn()} />);

    expect(screen.getByLabelText("Lesson carousel")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What Exactly Is an AI Agent and What Is It Not?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
  });
});
