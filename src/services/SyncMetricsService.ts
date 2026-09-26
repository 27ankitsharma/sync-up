import { AuthService } from "@/services/AuthService";
import { ContentService } from "@/services/ContentService";
import { requireSupabaseClient } from "@/lib/supabase";
import {
  calculateSyncMetrics,
  unavailableSyncMetrics,
  type SyncMetricsOverview,
  type TopicLearningContent,
} from "@/lib/syncMetrics";

interface CourseContentRow {
  id: string;
  topic_id: string;
}

interface QuizCourseRow {
  quiz_id: string;
  course_id: string;
}

interface PassedAttemptRow {
  quiz_id: string | null;
}

export const SyncMetricsService = {
  async getOverview(selectedLens: string): Promise<SyncMetricsOverview> {
    const user = await AuthService.getCurrentUser();
    if (!user || !selectedLens) return unavailableSyncMetrics();

    const supabase = requireSupabaseClient();
    const [topics, coursesResult, quizzesResult, attemptsResult] =
      await Promise.all([
        ContentService.getAllTopics(),
        supabase
          .from("courses")
          .select("id,topic_id")
          .eq("status", "published"),
        supabase
          .from("quizzes")
          .select("quiz_id,course_id")
          .eq("status", "published"),
        supabase
          .from("quiz_attempts")
          .select("quiz_id")
          .eq("user_id", user.id)
          .eq("status", "completed")
          .eq("passed", true),
      ]);

    if (coursesResult.error) throw coursesResult.error;
    if (quizzesResult.error) throw quizzesResult.error;
    if (attemptsResult.error) throw attemptsResult.error;

    const quizzes = (quizzesResult.data ?? []) as QuizCourseRow[];
    const contentByTopicId = buildContentByTopic(
      (coursesResult.data ?? []) as CourseContentRow[],
      quizzes,
    );

    return calculateSyncMetrics({
      topics,
      selectedLens,
      contentByTopicId,
      passedQuizIds: new Set(
        ((attemptsResult.data ?? []) as PassedAttemptRow[])
          .map((attempt) => attempt.quiz_id)
          .filter((quizId): quizId is string => Boolean(quizId)),
      ),
    });
  },
};

function buildContentByTopic(
  courses: CourseContentRow[],
  quizzes: QuizCourseRow[],
): Map<string, TopicLearningContent> {
  const contentByTopic = new Map<string, TopicLearningContent>();
  const quizIdsByCourse = new Map<string, string[]>();

  for (const quiz of quizzes) {
    quizIdsByCourse.set(quiz.course_id, [
      ...(quizIdsByCourse.get(quiz.course_id) ?? []),
      quiz.quiz_id,
    ]);
  }

  for (const course of courses) {
    const existing = contentByTopic.get(course.topic_id) ?? {
      topicId: course.topic_id,
      publishedQuizIds: [],
    };

    contentByTopic.set(course.topic_id, {
      ...existing,
      publishedQuizIds: [
        ...new Set([
          ...existing.publishedQuizIds,
          ...(quizIdsByCourse.get(course.id) ?? []),
        ]),
      ],
    });
  }

  return contentByTopic;
}
