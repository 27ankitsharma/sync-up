import { getSupabaseClient } from "@/lib/supabase";
import { mapCourse, mapLesson, publishedLessonsInOrder, type CourseRow, type LessonRow } from "@/lib/courseMappers";
import type { Course, CourseLoadResult, Lesson } from "@/types/courseContent";

const COURSE_COLUMNS = "id, topic_id, title, slug, description, status, created_at, updated_at";
const LESSON_COLUMNS = "id, course_id, title, slug, order_index, content_json, duration_minutes, status, created_at, updated_at";

export const CourseService = {
  getPublishedCourseForTopic,
  getCourseForTopic,
  getCourse,
  getLessons,
  getLesson,
};

async function getPublishedCourseForTopic(topicId: string): Promise<CourseLoadResult> {
  const supabase = getSupabaseClient();
  if (!supabase || !topicId) return { status: "error" };

  const { data, error } = await supabase
    .from("courses")
    .select(`${COURSE_COLUMNS}, lessons(${LESSON_COLUMNS})`)
    .eq("topic_id", topicId)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { status: "error" };
  if (!data) return { status: "none" };

  const row = data as CourseRow & { lessons?: LessonRow[] | null };
  return {
    status: "ok",
    course: mapCourse(row),
    lessons: publishedLessonsInOrder(row.lessons ?? []),
  };
}

async function getCourseForTopic(topicId: string): Promise<Course | null> {
  const result = await getPublishedCourseForTopic(topicId);
  return result.status === "ok" ? result.course : null;
}

async function getCourse(courseId: string): Promise<Course | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !courseId) return null;

  const { data, error } = await supabase
    .from("courses")
    .select(COURSE_COLUMNS)
    .eq("id", courseId)
    .maybeSingle();

  if (error || !data) return null;
  return mapCourse(data as CourseRow);
}

async function getLessons(courseId: string): Promise<Lesson[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !courseId) return [];

  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("course_id", courseId)
    .eq("status", "published")
    .order("order_index", { ascending: true });

  if (error) return [];
  return publishedLessonsInOrder((data ?? []) as LessonRow[]);
}

async function getLesson(lessonId: string): Promise<Lesson | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !lessonId) return null;

  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_COLUMNS)
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as LessonRow;
  return row.status === "published" ? mapLesson(row) : null;
}
