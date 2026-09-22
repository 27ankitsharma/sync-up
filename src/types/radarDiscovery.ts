import type { KnowledgeLayer, LensRelevanceCategory } from "@/types/syllabus";

export type RadarPriority = "high" | "medium" | "low";

/** How a discovery affects (or does not affect) the curated LiveMap structure. */
export type RadarDiscoveryClassification =
  | "new_topic_candidate"
  | "existing_topic_update"
  | "fyi";

export type RadarRecommendedAction = "Explore" | "Update" | "Review" | "Watch";

export type RadarDiscoveryStatus = "new" | "reviewed" | "accepted" | "dismissed";

export type RadarSourceType =
  | "paper"
  | "blog"
  | "github"
  | "course"
  | "lab"
  | "documentation"
  | "industry";

export interface RadarSource {
  type: RadarSourceType;
  title: string;
  url: string;
}

export interface RadarDiscovery {
  id: string;
  title: string;
  topicId?: string | null;
  topicSlug?: string | null;
  syllabusPath?: string | null;
  classification: RadarDiscoveryClassification;
  reason: string;
  priority: RadarPriority;
  recommendedAction: RadarRecommendedAction;
  status: RadarDiscoveryStatus;
  discoveredAt: string;
  reviewedAt?: string | null;
  lensRelevance: Record<string, LensRelevanceCategory>;
  sources: RadarSource[];
  relatedTopicSlugs?: string[];
  suggestedPlacement?: string | null;
  /** Existing Topic Update: from syllabus.json. New Topic: agent proposal. FYI: optional. */
  knowledgeLayer?: KnowledgeLayer | null;
  /** Human-review rationale for a proposed New Topic placement. */
  placementRationale?: string | null;
  summary?: string;
}

export type RadarTimeRange = "today" | "week" | "month";

export type RadarFeedTab =
  | "for_you"
  | "new_candidates"
  | "existing_updates"
  | "fyi"
  | "all";

export type RadarPriorityFilter = "all" | RadarPriority;

export type RadarDiscoveryTypeFilter = "all" | RadarDiscoveryClassification;

export type RadarSourceFilter = "all" | RadarSourceType;

export interface RadarFilterState {
  timeRange: RadarTimeRange;
  feedTab: RadarFeedTab;
  priority: RadarPriorityFilter;
  discoveryType: RadarDiscoveryTypeFilter;
  source: RadarSourceFilter;
}
