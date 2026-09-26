export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type KnowledgeLayer =
  | "Foundations"
  | "Models & Architectures"
  | "Techniques & Practices"
  | "Systems & Applications"
  | "Frontiers & Emerging";

export const KNOWLEDGE_LAYERS: readonly KnowledgeLayer[] = [
  "Foundations",
  "Models & Architectures",
  "Techniques & Practices",
  "Systems & Applications",
  "Frontiers & Emerging",
] as const;

export type TopicStatus = "draft" | "published" | "archived" | "coming_soon";

export type Priority = "high" | "medium" | "low";
export type ContentStatus = "Draft" | "Published" | "Archived";
export type LensRelevanceCategory = "Must" | "Good" | "Optional";

/** Editorial availability for course and diagnostic experiences. */
export type AvailabilityStatus = "yes" | "no" | "WIP";

export const AVAILABILITY_STATUSES: readonly AvailabilityStatus[] = ["yes", "no", "WIP"] as const;

export interface ResourceLink {
  type: string;
  title: string;
  url: string;
}

export type DifficultyAggregate = Partial<Record<Difficulty, number>>;
export type KnowledgeLayerAggregate = Record<string, number>;
export type LensRelevance = Record<string, LensRelevanceCategory>;
export type LensRelevanceAggregate = Record<string, Partial<Record<LensRelevanceCategory, number>>>;

export interface KnowledgeNodeMetadata {
  summary?: string;
  course_ids?: string[];
  knowledge_layer?: string | KnowledgeLayerAggregate;
  why_it_matters?: string;
  resources?: ResourceLink[];
  content_status?: ContentStatus;
  status?: TopicStatus;
  node_type?: "track" | "subject" | "module";
  is_radar?: boolean;
  radar_start_date?: string | null;
  radar_end_date?: string | null;
  difficulty?: DifficultyAggregate;
  learning_time?: number | null;
  lens_relevance?: LensRelevanceAggregate;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  layer: string;
  knowledge_layer?: string;
  difficulty: Difficulty;
  learning_time?: number | null;
  lens_relevance?: LensRelevance;
  roles: string[];
  status: TopicStatus;
  content_status?: ContentStatus;
  priority: Priority;
  is_radar: boolean;
  radar_week: string | null;
  radar_start_date?: string | null;
  radar_end_date?: string | null;
  radar_classification?: "new_topic_candidate" | "existing_topic_update" | "fyi" | null;
  summary: string;
  why_it_matters: string;
  resources?: ResourceLink[];
  order: number;
  hasCourse: boolean;
  course_status?: AvailabilityStatus;
  diagnostic_status?: AvailabilityStatus;
}

export interface Module extends KnowledgeNodeMetadata {
  id: string;
  title: string;
  slug: string;
  order: number;
  hasCourse: boolean;
  topics: Topic[];
}

export interface Subject extends KnowledgeNodeMetadata {
  id: string;
  title: string;
  slug: string;
  order: number;
  hasCourse: boolean;
  modules: Module[];
}

export interface Track extends KnowledgeNodeMetadata {
  id: string;
  title: string;
  slug: string;
  order: number;
  hasCourse: boolean;
  subjects: Subject[];
}

export interface Syllabus {
  tracks: Track[];
}

export type SyllabusResponse = Syllabus;

export interface ParentContext {
  track: {
    title: string;
    slug: string;
  };
  subject: {
    title: string;
    slug: string;
  };
  module: {
    title: string;
    slug: string;
  };
}

export type TopicWithContext = Topic & ParentContext;

export type RadarTopic = TopicWithContext;

export type SearchResult = TopicWithContext;
