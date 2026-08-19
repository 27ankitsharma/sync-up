import type { User } from "@supabase/supabase-js";
import { ContentService } from "@/services/ContentService";
import { getSupabaseClient, requireSupabaseClient } from "@/lib/supabase";
import type { SyncScoreSnapshot } from "@/types/progress";
import type {
  CompletedTopic,
  NewsletterSubscription,
  NewsletterSubscriptionInput,
  QuizAttempt,
  QuizAttemptInput,
  SavedTopic,
  SyncScoreOverview,
  UserProfile,
  UserProfileInput,
} from "@/types/user";

const WEEKS_IN_SYNC_WINDOW = 8;

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
  id: string;
  user_id: string;
  topic_id: string;
  topic_slug: string;
  score: number;
  passed: boolean;
  answers: Record<string, unknown> | null;
  attempted_at: string;
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
  markTopicCompleted(topicId: string, topicSlug: string, layer?: string | null): Promise<CompletedTopic>;
  saveQuizResult(input: QuizAttemptInput): Promise<QuizAttempt>;
  getQuizAttempts(): Promise<QuizAttempt[]>;
  getBookmarks(): Promise<SavedTopic[]>;
  saveTopic(topicId: string, topicSlug: string): Promise<SavedTopic>;
  removeSavedTopic(topicSlug: string): Promise<void>;
  getSubscription(): Promise<NewsletterSubscription | null>;
  saveSubscription(input: NewsletterSubscriptionInput): Promise<NewsletterSubscription>;
  getSyncScore(selectedLens?: string | null): Promise<SyncScoreOverview>;
  getSyncScoreHistory(layer: string, weeksBack?: number): Promise<SyncScoreSnapshot[]>;
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

  async markTopicCompleted(topicId: string, topicSlug: string, layer?: string | null): Promise<CompletedTopic> {
    const user = await requireUser();
    const { data, error } = await requireSupabaseClient()
      .from("completed_topic")
      .upsert(
        {
          user_id: user.id,
          topic_id: topicId,
          topic_slug: topicSlug,
          layer: layer ?? null,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,topic_slug" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return mapCompletedTopic(data as CompletedTopicRow);
  }

  async saveQuizResult(input: QuizAttemptInput): Promise<QuizAttempt> {
    const user = await requireUser();
    const { data, error } = await requireSupabaseClient()
      .from("quiz_attempt")
      .insert({
        user_id: user.id,
        topic_id: input.topicId,
        topic_slug: input.topicSlug,
        score: input.score,
        passed: input.passed,
        answers: input.answers ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;

    if (input.passed) {
      await this.markTopicCompleted(input.topicId, input.topicSlug, input.layer ?? null);
    }

    return mapQuizAttempt(data as QuizAttemptRow);
  }

  async getQuizAttempts(): Promise<QuizAttempt[]> {
    const user = await this.getCurrentUser();
    if (!user) return [];

    const { data, error } = await requireSupabaseClient()
      .from("quiz_attempt")
      .select("*")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false });

    if (error) throw error;
    return ((data ?? []) as QuizAttemptRow[]).map(mapQuizAttempt);
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

  async getSyncScore(selectedLens: string | null = null): Promise<SyncScoreOverview> {
    const topics = await ContentService.getAllTopics();
    const attempts = await this.getQuizAttempts();
    const completedSlugs = new Set(await this.getCompletedTopicSlugs());
    const windowStart = addDays(new Date(), -90);
    const recentRadarTopics = topics.filter((topic) => {
      if (!topic.is_radar || !topic.radar_week) return false;
      return isoWeekToDate(topic.radar_week) >= windowStart;
    });

    // Role-scoped sync score: only consider radar topics that have lens relevance for the selected role.
    // This keeps the denominator aligned with what the user is currently learning for.
    const relevantTopics = selectedLens
      ? recentRadarTopics.filter((topic) => Boolean(topic.lens_relevance?.[selectedLens]))
      : recentRadarTopics;

    const relevantSlugSet = new Set(relevantTopics.map((topic) => topic.slug));
    const completedTopics = [...completedSlugs].filter((slug) => relevantSlugSet.has(slug)).length;
    const relevantAttempts = attempts.filter((attempt) => relevantSlugSet.has(attempt.topicSlug));
    const quizAccuracy =
      relevantAttempts.length === 0
        ? 0
        : Math.round(
            relevantAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / relevantAttempts.length,
          );

    return {
      importantTopics: relevantTopics.length,
      completedTopics,
      quizAccuracy,
      syncScore: relevantTopics.length === 0 ? 0 : Math.round((completedTopics / relevantTopics.length) * 100),
    };
  }

  async getSyncScoreHistory(layer: string, weeksBack = WEEKS_IN_SYNC_WINDOW): Promise<SyncScoreSnapshot[]> {
    const weeks = getRecentIsoWeeks(Math.max(1, weeksBack));
    return Promise.all(weeks.map((isoWeek) => this.computeSyncScoreForLayer(layer, isoWeek)));
  }

  private async computeSyncScoreForLayer(layer: string, isoWeek: string): Promise<SyncScoreSnapshot> {
    const weekStart = isoWeekToDate(isoWeek);
    const weekEnd = addDays(weekStart, 7);
    const windowStart = addDays(weekStart, -(WEEKS_IN_SYNC_WINDOW - 1) * 7);
    const topics = await ContentService.getAllTopics();
    const completedSlugs = new Set(await this.getCompletedTopicSlugs());
    const windowTopics = topics.filter((topic) => {
      if (!topic.is_radar || topic.layer !== layer || !topic.radar_week) return false;
      const topicWeekStart = isoWeekToDate(topic.radar_week);
      return topicWeekStart >= windowStart && topicWeekStart <= weekStart;
    });
    const completed = windowTopics.filter((topic) => {
      if (!completedSlugs.has(topic.slug)) return false;
      return true;
    }).length;
    const total = windowTopics.length;

    return {
      layer,
      isoWeek,
      completed,
      total,
      score: total === 0 ? 0 : Math.round((completed / total) * 100),
      computedAt: weekEnd < new Date() ? weekEnd.toISOString() : new Date().toISOString(),
    };
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
    id: row.id,
    userId: row.user_id,
    topicId: row.topic_id,
    topicSlug: row.topic_slug,
    score: row.score,
    passed: row.passed,
    answers: row.answers ?? null,
    attemptedAt: row.attempted_at,
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

function getRecentIsoWeeks(weeksBack: number): string[] {
  const currentWeekStart = isoWeekToDate(dateToIsoWeek(new Date()));
  return Array.from({ length: weeksBack }, (_, index) => {
    const offset = index - (weeksBack - 1);
    return dateToIsoWeek(addDays(currentWeekStart, offset * 7));
  });
}

function dateToIsoWeek(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function isoWeekToDate(isoWeek: string): Date {
  const [yearPart, weekPart] = isoWeek.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;

  if (day <= 4) {
    simple.setUTCDate(simple.getUTCDate() - day + 1);
  } else {
    simple.setUTCDate(simple.getUTCDate() + 8 - day);
  }

  return simple;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export const UserService: UserServiceContract = new SupabaseUserService();
