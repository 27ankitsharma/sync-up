export interface UserProfile {
  id: string;
  email: string | null;
  role: string | null;
  experience: string | null;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileInput {
  role?: string | null;
  experience?: string | null;
  interests?: string[];
}

export interface CompletedTopic {
  id: string;
  userId: string;
  topicId: string;
  topicSlug: string;
  layer: string | null;
  completedAt: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  topicId: string;
  topicSlug: string;
  score: number;
  passed: boolean;
  answers: Record<string, unknown> | null;
  attemptedAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  topicId: string;
  completedAt: string;
}

export interface SavedTopic {
  id: string;
  userId: string;
  topicId: string;
  topicSlug: string;
  savedAt: string;
}

export interface NewsletterSubscription {
  id: string;
  userId: string;
  email: string;
  subscribed: boolean;
  frequency: "weekly" | "monthly";
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NewsletterSubscriptionInput {
  email: string;
  subscribed: boolean;
  frequency?: "weekly" | "monthly";
  interests?: string[];
}
