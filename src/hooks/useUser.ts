import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "@/services/UserService";
import type { QuizAttemptInput } from "@/types/user";

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
      queryClient.invalidateQueries({ queryKey: ["completed-topic-slugs"] });
      queryClient.invalidateQueries({ queryKey: ["topic-completion", input.topicSlug] });
      queryClient.invalidateQueries({ queryKey: ["sync-score"] });
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
