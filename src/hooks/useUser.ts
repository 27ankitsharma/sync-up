import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/UserService";
import { SyncMetricsService } from "@/services/SyncMetricsService";
import type { UserProfileInput } from "@/types/user";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => UserService.getCurrentUser(),
    staleTime: FIVE_MINUTES,
  });
}
export function useUserProfile() {
  return useQuery({
    queryKey: ["user-profile"],
    queryFn: () => UserService.getProfile(),
    staleTime: FIVE_MINUTES,
  });
}
export function useSaveUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UserProfileInput) => UserService.saveProfile(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

export function useProgress() {
  return useQuery({
    queryKey: ["user-progress"],
    queryFn: () => UserService.getProgress(),
    staleTime: FIVE_MINUTES,
  });
}

export function useQuizAttempts() {
  return useQuery({
    queryKey: ["quiz-attempts"],
    queryFn: () => UserService.getQuizAttempts(),
    staleTime: FIVE_MINUTES,
  });
}

export function useSyncMetrics(selectedLens?: string | null) {
  return useQuery({
    queryKey: ["sync-metrics", selectedLens ?? null],
    queryFn: () => SyncMetricsService.getOverview(selectedLens ?? ""),
    enabled: Boolean(selectedLens),
    staleTime: FIVE_MINUTES,
  });
}

export function useCompletedTopicSlugs() {
  return useQuery({
    queryKey: ["completed-topic-slugs"],
    queryFn: () => UserService.getCompletedTopicSlugs(),
    staleTime: FIVE_MINUTES,
  });
}

export function useTopicCompletion(topicSlug: string) {
  return useQuery({
    queryKey: ["topic-completion", topicSlug],
    queryFn: () => UserService.isTopicCompleted(topicSlug),
    enabled: Boolean(topicSlug),
    staleTime: FIVE_MINUTES,
  });
}

export function useCompletedLessonIds(topicId?: string | null) {
  return useQuery({
    queryKey: ["completed-lesson-ids", topicId ?? null],
    queryFn: () => UserService.getCompletedLessonIds(topicId ?? ""),
    enabled: Boolean(topicId),
    staleTime: FIVE_MINUTES,
  });
}

export function useMarkLessonCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ lessonId, topicId }: { lessonId: string; topicId: string }) =>
      UserService.markLessonCompleted(lessonId, topicId),
    onSuccess: (_value, input) => {
      queryClient.invalidateQueries({ queryKey: ["completed-lesson-ids", input.topicId] });
    },
  });
}
