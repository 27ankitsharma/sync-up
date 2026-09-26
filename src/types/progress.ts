import type { CourseNodeType } from "./course";

export interface QuizCompletion {
  nodeType: CourseNodeType;
  nodeSlug: string;
  completedAt: string;
  layer?: string;
}

export interface OverallProgress {
  nodeType: CourseNodeType;
  nodeSlug: string;
  completedTopics: number;
  totalTopics: number;
  percent: number;
}
