import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QuizService } from "@/services/QuizService";

export function usePublishedQuiz(courseId?: string | null) {
  return useQuery({
    queryKey: ["published-quiz", courseId ?? null],
    queryFn: () => QuizService.getPublishedForCourse(courseId ?? ""),
    enabled: Boolean(courseId),
  });
}

export function useQuizAttempt(attemptId?: string | null) {
  return useQuery({
    queryKey: ["quiz-attempt", attemptId ?? null],
    queryFn: () => QuizService.getAttempt(attemptId ?? ""),
    enabled: Boolean(attemptId),
    staleTime: 0,
  });
}

export function useStartQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => QuizService.startAttempt(quizId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(["quiz-attempt", attempt.attemptId], attempt);
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
    },
  });
}

export function useSubmitQuizAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attemptId,
      questionId,
      selectedAnswer,
    }: {
      attemptId: string;
      questionId: string;
      selectedAnswer: string;
    }) => QuizService.submitAnswer(attemptId, questionId, selectedAnswer),
    onSuccess: (attempt) => {
      queryClient.setQueryData(["quiz-attempt", attempt.attemptId], attempt);
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      if (attempt.status === "completed" && attempt.passed) {
        queryClient.invalidateQueries({ queryKey: ["user-progress"] });
        queryClient.invalidateQueries({ queryKey: ["completed-topic-slugs"] });
        queryClient.invalidateQueries({ queryKey: ["topic-completion"] });
        queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
      }
    },
  });
}
