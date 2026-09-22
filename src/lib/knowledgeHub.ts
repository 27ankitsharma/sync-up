import type { AvailabilityStatus, Topic } from "@/types/syllabus";

export const KNOWLEDGE_HUB_TABS = [
  "Overview",
  "Resources",
  "Apply",
  "Interview & FAQ",
  "Updates",
  "Related",
] as const;

export type KnowledgeHubTab = (typeof KNOWLEDGE_HUB_TABS)[number];

export function parseAvailabilityStatus(value?: string | null): AvailabilityStatus {
  if (value === "yes" || value === "WIP" || value === "no") return value;
  return "no";
}

export function availabilityUiLabel(status: AvailabilityStatus) {
  if (status === "yes") return "Active";
  if (status === "WIP") return "Coming Soon";
  return "Not available yet";
}

export function isAvailabilityActive(status: AvailabilityStatus) {
  return status === "yes";
}

export function rollupAvailability(statuses: AvailabilityStatus[]): AvailabilityStatus {
  if (statuses.some((status) => status === "yes")) return "yes";
  if (statuses.some((status) => status === "WIP")) return "WIP";
  return "no";
}

export function topicCourseStatus(topic?: Topic | null): AvailabilityStatus {
  return parseAvailabilityStatus(topic?.course_status);
}

export function topicDiagnosticStatus(topic?: Topic | null): AvailabilityStatus {
  return parseAvailabilityStatus(topic?.diagnostic_status);
}

export function courseStatusForTopics(topics: Topic[], hasParentCourseIds = false): AvailabilityStatus {
  if (hasParentCourseIds) return "yes";
  return rollupAvailability(topics.map(topicCourseStatus));
}

export function diagnosticStatusForTopics(topics: Topic[]): AvailabilityStatus {
  return rollupAvailability(topics.map(topicDiagnosticStatus));
}

export function firstLearnableTopic(topics: Topic[]) {
  return topics.find((topic) => topicCourseStatus(topic) === "yes") ?? topics[0];
}

export function firstDiagnosticTopic(topics: Topic[]) {
  return topics.find((topic) => topicDiagnosticStatus(topic) === "yes") ?? topics[0];
}

export function coursePathForTopic(topic?: Pick<Topic, "slug"> | null) {
  return topic ? `/topics/${topic.slug}` : null;
}

export function diagnosticPathForTopic(topic?: Pick<Topic, "slug"> | null) {
  const coursePath = coursePathForTopic(topic);
  return coursePath ? `${coursePath}?lesson=quiz` : null;
}
