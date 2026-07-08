import { sanityClient } from "@/lib/sanity";
import type { Course, CourseNodeType } from "@/types/course";

interface SanityCourseDocument {
  nodeType: CourseNodeType;
  nodeSlug: string;
  generatedAt: string;
  lessons?: Array<{
    _key?: string;
    id?: string;
    title?: string;
    type?: "quiz" | "lesson";
    content?: string;
    order?: number;
  }>;
}

export async function getCourseByNode(nodeType: CourseNodeType, nodeSlug: string): Promise<Course | null> {
  const course = await sanityClient.fetch<SanityCourseDocument | null>(
    `*[_type == "course" && nodeType == $nodeType && nodeSlug == $nodeSlug][0]{
      nodeType,
      nodeSlug,
      generatedAt,
      lessons[]{
        _key,
        id,
        title,
        type,
        content,
        order
      }
    }`,
    { nodeType, nodeSlug },
  );

  if (!course) return null;

  return {
    nodeType: course.nodeType,
    nodeSlug: course.nodeSlug,
    generatedAt: course.generatedAt,
    lessons: (course.lessons ?? [])
      .map((lesson, index) => ({
        id: lesson.id ?? lesson._key ?? `${course.nodeSlug}-lesson-${index + 1}`,
        title: lesson.title ?? `Lesson ${index + 1}`,
        type: lesson.type ?? (index === 0 ? "quiz" : "lesson"),
        content: lesson.content ?? "",
        order: lesson.order ?? index + 1,
      }))
      .sort((a, b) => a.order - b.order),
  };
}

export async function ensureCourseForNode(nodeType: CourseNodeType, nodeSlug: string): Promise<Course | null> {
  // TODO: If automated generation is added later, call a serverless function here.
  // Do not call an LLM or write to Sanity directly from the browser because that
  // would expose write tokens and model-provider credentials.
  return getCourseByNode(nodeType, nodeSlug);
}
