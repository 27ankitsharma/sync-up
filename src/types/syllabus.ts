export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type TopicStatus = "draft" | "published" | "coming_soon";

export type Priority = "high" | "medium" | "low";

export interface Topic {
  id: string;
  title: string;
  slug: string;
  layer: string;
  difficulty: Difficulty;
  roles: string[];
  status: TopicStatus;
  priority: Priority;
  is_radar: boolean;
  radar_week: string | null;
  summary: string;
  why_it_matters: string;
  order: number;
  hasCourse: boolean;
}

export interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  hasCourse: boolean;
  topics: Topic[];
}

export interface Subject {
  id: string;
  title: string;
  slug: string;
  order: number;
  hasCourse: boolean;
  modules: Module[];
}

export interface Track {
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
