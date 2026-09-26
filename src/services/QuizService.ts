import { requireSupabaseClient } from "@/lib/supabase";
import type {
  AttemptQuestion,
  PublishedQuiz,
  QuizAnswer,
  QuizAttemptDetail,
  QuizOption,
} from "@/types/quiz";

interface QuizRow {
  quiz_id: string;
  course_id: string;
  title: string;
  description: string | null;
  questions_per_attempt: number;
  passing_score: number;
  max_attempts: number | null;
}

export const QuizService = {
  async getPublishedForCourse(courseId: string): Promise<PublishedQuiz | null> {
    const { data, error } = await requireSupabaseClient()
      .from("quizzes")
      .select("quiz_id,course_id,title,description,questions_per_attempt,passing_score,max_attempts")
      .eq("course_id", courseId)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data ? mapQuiz(data as QuizRow) : null;
  },

  async startAttempt(quizId: string): Promise<QuizAttemptDetail> {
    const { data, error } = await requireSupabaseClient().rpc("start_quiz_attempt", {
      p_quiz_id: quizId,
    });
    if (error) throw error;
    return mapAttempt(data);
  },

  async getAttempt(attemptId: string): Promise<QuizAttemptDetail> {
    const { data, error } = await requireSupabaseClient().rpc("get_quiz_attempt", {
      p_attempt_id: attemptId,
    });
    if (error) throw error;
    return mapAttempt(data);
  },

  async submitAnswer(attemptId: string, questionId: string, selectedAnswer: string): Promise<QuizAttemptDetail> {
    const { data, error } = await requireSupabaseClient().rpc("submit_quiz_answer", {
      p_attempt_id: attemptId,
      p_question_id: questionId,
      p_selected_answer: selectedAnswer,
    });
    if (error) throw error;
    return mapAttempt(data);
  },
};

function mapQuiz(row: QuizRow): PublishedQuiz {
  return {
    quizId: row.quiz_id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    questionsPerAttempt: row.questions_per_attempt,
    passingScore: row.passing_score,
    maxAttempts: row.max_attempts,
  };
}

function mapAttempt(value: unknown): QuizAttemptDetail {
  if (!value || typeof value !== "object") throw new Error("The quiz server returned an invalid attempt.");
  const row = value as Record<string, unknown>;
  const quiz = row.quiz as Record<string, unknown>;
  const questions = Array.isArray(row.questions) ? row.questions : [];
  return {
    attemptId: String(row.attempt_id),
    quizId: String(row.quiz_id),
    status: row.status as QuizAttemptDetail["status"],
    startedAt: String(row.started_at),
    completedAt: nullableString(row.completed_at),
    score: row.score == null ? null : Number(row.score),
    correctCount: Number(row.correct_count ?? 0),
    questionCount: Number(row.question_count),
    passed: Boolean(row.passed),
    quiz: {
      title: String(quiz.title),
      description: nullableString(quiz.description),
      passingScore: Number(quiz.passing_score),
      maxAttempts: quiz.max_attempts == null ? null : Number(quiz.max_attempts),
    },
    questions: questions.map(mapQuestion),
  };
}

function mapQuestion(value: unknown): AttemptQuestion {
  const row = value as Record<string, unknown>;
  return {
    questionId: String(row.question_id),
    topicId: nullableString(row.topic_id),
    question: String(row.question),
    questionType: row.question_type as "single_select",
    options: (Array.isArray(row.options) ? row.options : []).map((option) => {
      const item = option as Record<string, unknown>;
      return {
        value: String(item.value) as QuizOption["value"],
        label: String(item.label),
        feedback: nullableString(item.feedback),
      };
    }),
    hint: nullableString(row.hint),
    difficulty: nullableString(row.difficulty),
    questionOrder: Number(row.question_order),
    answer: row.answer ? mapAnswer(row.answer) : null,
  };
}

function mapAnswer(value: unknown): QuizAnswer {
  const row = value as Record<string, unknown>;
  return {
    selectedAnswer: String(row.selected_answer),
    isCorrect: Boolean(row.is_correct),
    answeredAt: String(row.answered_at),
    correctAnswer: String(row.correct_answer),
  };
}

function nullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}
