import { describe, expect, it } from "vitest";
import { firstSlideIndexForLesson, isVisualSlide, slidesFromLessons } from "@/lib/lessonSlides";
import type { Lesson } from "@/types/courseContent";

function lesson(id: string, title: string, content: Lesson["content"]["content"]): Lesson {
  return {
    id,
    courseId: "course-model-hardware-standard",
    title,
    slug: id,
    orderIndex: 1,
    content: { type: "doc", content },
    durationMinutes: 5,
    status: "published",
    createdAt: "2026-09-19",
    updatedAt: "2026-09-19",
  };
}

describe("slidesFromLessons", () => {
  it("keeps a one-image lesson as one slide and splits a two-image lesson", () => {
    const lessons = [
      lesson("mhs-introduction", "Introduction", [{ type: "image", src: "./1-Introduction-MHS.png", alt: "Intro" }]),
      lesson("mhs-what-is-mhs", "What is MHS", [
        { type: "image", src: "./2.1-What-is-MHS.png", alt: "2.1" },
        { type: "image", src: "./2.2-What-is-MHS.png", alt: "2.2" },
      ]),
    ];

    const slides = slidesFromLessons(lessons);
    expect(slides).toHaveLength(3);
    expect(slides.map((slide) => slide.lesson.id)).toEqual([
      "mhs-introduction",
      "mhs-what-is-mhs",
      "mhs-what-is-mhs",
    ]);
    expect(slides[1]?.content.content).toEqual([{ type: "image", src: "./2.1-What-is-MHS.png", alt: "2.1" }]);
    expect(slides[2]?.content.content).toEqual([{ type: "image", src: "./2.2-What-is-MHS.png", alt: "2.2" }]);
    expect(firstSlideIndexForLesson(slides, 1)).toBe(1);
    expect(isVisualSlide(slides[0].content)).toBe(true);
    expect(isVisualSlide({ type: "doc", content: [{ type: "paragraph", text: "Hello" }] })).toBe(false);
  });
});
