import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/services/AuthService";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useAuthUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => AuthService.getCurrentUser(),
    staleTime: FIVE_MINUTES,
  });
}

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: (redirectTo?: string) => AuthService.signInWithGoogle(redirectTo),
  });
}

export function useSignInWithEmail() {
  return useMutation({
    mutationFn: ({ email, redirectTo }: { email: string; redirectTo?: string }) =>
      AuthService.signInWithEmail(email, redirectTo),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AuthService.signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["completed-topic-slugs"] });
      queryClient.invalidateQueries({ queryKey: ["sync-metrics"] });
    },
  });
}
