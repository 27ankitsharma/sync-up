import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/UserService";
import type { QuizAttemptInput, UserProfileInput } from "@/types/user";

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

export function useSyncScoreOverview(selectedLens?: string | null) {
  return useQuery({
    queryKey: ["sync-score-overview", selectedLens ?? null],
    queryFn: () => UserService.getSyncScore(selectedLens ?? null),
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

export function useSaveQuizResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: QuizAttemptInput) => UserService.saveQuizResult(input),
    onSuccess: (_attempt, input) => {
      queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["completed-topic-slugs"] });
      queryClient.invalidateQueries({ queryKey: ["topic-completion", input.topicSlug] });
      queryClient.invalidateQueries({ queryKey: ["sync-score"] });
      queryClient.invalidateQueries({ queryKey: ["sync-score-overview"] });
    },
  });
}

export function useSyncScoreByLayer(layers: string[]) {
  return useQuery({
    queryKey: ["sync-score", layers],
    queryFn: async () =>
      Object.fromEntries(
        await Promise.all(layers.map(async (layer) => [layer, await UserService.getSyncScoreHistory(layer)])),
      ),
    staleTime: FIVE_MINUTES,
  });
}
