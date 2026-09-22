import type { ContentBlock, Lesson, LessonContentDoc } from "@/types/courseContent";

export interface LessonSlide {
  lesson: Lesson;
  lessonIndex: number;
  content: LessonContentDoc;
}

export function slidesFromLessons(lessons: Lesson[]): LessonSlide[] {
  return lessons.flatMap((lesson, lessonIndex) => {
    const groups = groupBlocksByImage(lesson.content.content);
    return groups.map((content) => ({ lesson, lessonIndex, content }));
  });
}

export function isVisualSlide(content: LessonContentDoc) {
  return content.content.length > 0 && content.content.every((block) => block.type === "image");
}

export function firstSlideIndexForLesson(slides: LessonSlide[], lessonIndex: number) {
  const index = slides.findIndex((slide) => slide.lessonIndex === lessonIndex);
  return index === -1 ? 0 : index;
}

function groupBlocksByImage(blocks: ContentBlock[]): LessonContentDoc[] {
  if (!blocks.some((block) => block.type === "image")) {
    return [{ type: "doc", content: blocks }];
  }

  const groups: ContentBlock[][] = [];
  let current: ContentBlock[] = [];

  for (const block of blocks) {
    if (block.type === "image" && current.some((item) => item.type === "image")) {
      groups.push(current);
      current = [block];
      continue;
    }
    current.push(block);
  }

  if (current.length > 0) groups.push(current);
  return groups.map((content) => ({ type: "doc", content }));
}
