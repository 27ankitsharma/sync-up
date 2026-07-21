import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, requireSupabaseClient } from "@/lib/supabase";

export interface AuthServiceContract {
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  signInWithGoogle(redirectTo?: string): Promise<void>;
  signInWithEmail(email: string, redirectTo?: string): Promise<void>;
  signOut(): Promise<void>;
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void;
}

class SupabaseAuthService implements AuthServiceContract {
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async getSession(): Promise<Session | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getSession();
    if (error) return null;
    return data.session;
  }

  async signInWithGoogle(redirectTo = window.location.origin): Promise<void> {
    const { error } = await requireSupabaseClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });

    if (error) throw error;
  }

  async signInWithEmail(email: string, redirectTo = window.location.origin): Promise<void> {
    const { error } = await requireSupabaseClient().auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw error;
  }

  async signOut(): Promise<void> {
    const { error } = await requireSupabaseClient().auth.signOut();
    if (error) throw error;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const { data } = supabase.auth.onAuthStateChange(callback);
    return () => data.subscription.unsubscribe();
  }
}

export const AuthService: AuthServiceContract = new SupabaseAuthService();
