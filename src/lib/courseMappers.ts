import { parseLessonContent } from "@/lib/lessonContent";
import type { Course, CourseContentStatus, Lesson } from "@/types/courseContent";

export interface CourseRow {
  id: string;
  topic_id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  order_index: number;
  content_json: unknown;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    topicId: row.topic_id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: row.status as CourseContentStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    slug: row.slug,
    orderIndex: row.order_index,
    content: parseLessonContent(row.content_json),
    durationMinutes: row.duration_minutes,
    status: row.status as CourseContentStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function publishedLessonsInOrder(rows: LessonRow[]) {
  return rows
    .filter((row) => row.status === "published")
    .sort((left, right) => left.order_index - right.order_index)
    .map(mapLesson);
}
