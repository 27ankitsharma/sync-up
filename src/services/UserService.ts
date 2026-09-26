import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, requireSupabaseClient } from "@/lib/supabase";
import type {
  CompletedTopic,
  NewsletterSubscription,
  NewsletterSubscriptionInput,
  QuizAttempt,
  SavedTopic,
  UserProfile,
  UserProfileInput,
} from "@/types/user";

interface ProfileRow {
  id: string;
  email: string | null;
  role: string | null;
  experience: string | null;
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

interface CompletedTopicRow {
  id: string;
  user_id: string;
  topic_id: string;
  topic_slug: string;
  layer: string | null;
  completed_at: string;
}

interface QuizAttemptRow {
  attempt_id: string;
  user_id: string;
  topic_id: string | null;
  topic_slug: string | null;
  score: number | null;
  passed: boolean;
  started_at: string;
}

interface SavedTopicRow {
  id: string;
  user_id: string;
  topic_id: string;
  topic_slug: string;
  saved_at: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string;
  email: string;
  subscribed: boolean;
  frequency: "weekly" | "monthly";
  interests: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserServiceContract {
  getCurrentUser(): Promise<User | null>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(input: UserProfileInput): Promise<UserProfile>;
  getProgress(): Promise<CompletedTopic[]>;
  getCompletedTopicSlugs(): Promise<string[]>;
  isTopicCompleted(topicSlug: string): Promise<boolean>;
  getQuizAttempts(): Promise<QuizAttempt[]>;
  getCompletedLessonIds(topicId: string): Promise<string[]>;
  markLessonCompleted(lessonId: string, topicId: string): Promise<void>;
  getBookmarks(): Promise<SavedTopic[]>;
  saveTopic(topicId: string, topicSlug: string): Promise<SavedTopic>;
  removeSavedTopic(topicSlug: string): Promise<void>;
  getSubscription(): Promise<NewsletterSubscription | null>;
  saveSubscription(input: NewsletterSubscriptionInput): Promise<NewsletterSubscription>;
}

class SupabaseUserService implements UserServiceContract {
  async getCurrentUser(): Promise<User | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  }

  async getProfile(): Promise<UserProfile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await requireSupabaseClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProfile(data as ProfileRow) : null;
  }

  async saveProfile(input: UserProfileInput): Promise<UserProfile> {
    const user = await requireUser();
    const { data, error } = await requireSupabaseClient()
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: user.email ?? null,
          role: input.role ?? null,
          experience: input.experience ?? null,
          interests: input.interests ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapProfile(data as ProfileRow);
  }

  async getProgress(): Promise<CompletedTopic[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await requireSupabaseClient()
      .from("completed_topic")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as CompletedTopicRow[]).map(mapCompletedTopic);
  }

  async getCompletedTopicSlugs(): Promise<string[]> {
    const progress = await this.getProgress();
    return progress.map((item) => item.topicSlug);
  }

  async isTopicCompleted(topicSlug: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const { data, error } = await requireSupabaseClient()
      .from("completed_topic")
      .select("id")
      .eq("user_id", user.id)
      .eq("topic_slug", topicSlug)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data);
  }

  async getQuizAttempts(): Promise<QuizAttempt[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await requireSupabaseClient()
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("started_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as QuizAttemptRow[]).map(mapQuizAttempt);
  }

  async getCompletedLessonIds(topicId: string): Promise<string[]> {
    const user = await this.getCurrentUser();
    if (!user || !topicId) return [];

    const { data, error } = await requireSupabaseClient()
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("topic_id", topicId);

    if (error) return [];
    return ((data ?? []) as { lesson_id: string }[]).map((row) => row.lesson_id);
  }

  async markLessonCompleted(lessonId: string, topicId: string): Promise<void> {
    const user = await this.getCurrentUser();
    if (!user) return;
    const { error } = await requireSupabaseClient()
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          topic_id: topicId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );

    if (error) throw error;
  }

  async getBookmarks(): Promise<SavedTopic[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await requireSupabaseClient()
      .from("saved_topics")
      .select("*")
      .eq("user_id", user.id)
      .order("saved_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as SavedTopicRow[]).map(mapSavedTopic);
  }

  async saveTopic(topicId: string, topicSlug: string): Promise<SavedTopic> {
    const user = await requireUser();
    const { data, error } = await requireSupabaseClient()
      .from("saved_topics")
      .upsert(
        {
          user_id: user.id,
          topic_id: topicId,
          topic_slug: topicSlug,
          saved_at: new Date().toISOString(),
        },
        { onConflict: "user_id,topic_slug" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapSavedTopic(data as SavedTopicRow);
  }

  async removeSavedTopic(topicSlug: string): Promise<void> {
    const user = await requireUser();
    const { error } = await requireSupabaseClient()
      .from("saved_topics")
      .delete()
      .eq("user_id", user.id)
      .eq("topic_slug", topicSlug);

    if (error) throw error;
  }

  async getSubscription(): Promise<NewsletterSubscription | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await requireSupabaseClient()
      .from("subscription")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapSubscription(data as SubscriptionRow) : null;
  }

  async saveSubscription(input: NewsletterSubscriptionInput): Promise<NewsletterSubscription> {
    const user = await requireUser();
    const { data, error } = await requireSupabaseClient()
      .from("subscription")
      .upsert(
        {
          user_id: user.id,
          email: input.email,
          subscribed: input.subscribed,
          frequency: input.frequency ?? "weekly",
          interests: input.interests ?? [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapSubscription(data as SubscriptionRow);
  }

}

async function requireUser(): Promise<User> {
  const user = await UserService.getCurrentUser();
  if (!user) {
    throw new Error("You must be signed in to save progress.");
  }

  return user;
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email ?? null,
    role: row.role ?? null,
    experience: row.experience ?? null,
    interests: row.interests ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompletedTopic(row: CompletedTopicRow): CompletedTopic {
  return {
    id: row.id,
    userId: row.user_id,
    topicId: row.topic_id,
    topicSlug: row.topic_slug,
    layer: row.layer ?? null,
    completedAt: row.completed_at,
  };
}

function mapQuizAttempt(row: QuizAttemptRow): QuizAttempt {
  return {
    id: row.attempt_id,
    userId: row.user_id,
    topicId: row.topic_id ?? "",
    topicSlug: row.topic_slug ?? "",
    score: row.score ?? 0,
    passed: row.passed,
    answers: null,
    attemptedAt: row.started_at,
  };
}

function mapSavedTopic(row: SavedTopicRow): SavedTopic {
  return {
    id: row.id,
    userId: row.user_id,
    topicId: row.topic_id,
    topicSlug: row.topic_slug,
    savedAt: row.saved_at,
  };
}

function mapSubscription(row: SubscriptionRow): NewsletterSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    subscribed: row.subscribed,
    frequency: row.frequency,
    interests: row.interests ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const UserService: UserServiceContract = new SupabaseUserService();
