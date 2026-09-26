import type {
  RadarDiscovery,
  RadarDiscoveryClassification,
  RadarFeedTab,
  RadarFilterState,
  RadarPriority,
  RadarSourceType,
  RadarTimeRange,
} from "@/types/radarDiscovery";
import type { KnowledgeLayer, LensRelevanceCategory, Topic } from "@/types/syllabus";
import { isValidKnowledgeLayer, relevanceLabel as syllabusRelevanceLabel, topicKnowledgeLayer } from "@/lib/syllabusMetrics";

export function classificationLabel(classification: RadarDiscoveryClassification) {
  if (classification === "new_topic_candidate") return "New Topic Candidate";
  if (classification === "existing_topic_update") return "Existing Topic Update";
  return "FYI";
}

export function classificationShortLabel(classification: RadarDiscoveryClassification) {
  return classificationLabel(classification);
}

/** Compact label for the intelligence feed row. */
export function feedOutcomeLabel(classification: RadarDiscoveryClassification) {
  if (classification === "new_topic_candidate") return "New Topic";
  if (classification === "existing_topic_update") return "Topic Update";
  return "FYI";
}

export function classificationBadgeClass(classification: RadarDiscoveryClassification) {
  if (classification === "new_topic_candidate") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50";
  }
  if (classification === "existing_topic_update") {
    return "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-50";
  }
  return "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-50";
}

export function priorityLabel(priority: RadarPriority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  return "Low";
}

export function priorityShortLabel(priority: RadarPriority) {
  if (priority === "high") return "High";
  return null;
}

export function primaryCtaLabel(_classification: RadarDiscoveryClassification) {
  return "Explore Update";
}

export function findMappedSyllabusTopic<T extends Topic>(discovery: RadarDiscovery, topics: T[]) {
  return topics.find((topic) => {
    if (discovery.topicId && (topic.id === discovery.topicId || topic.slug === discovery.topicId)) return true;
    if (discovery.topicSlug && topic.slug === discovery.topicSlug) return true;
    return false;
  });
}

/**
 * Knowledge Layer is a syllabus-mapping field, not a content type.
 * Existing Topic Update: always from the matched topic.
 * New Topic: validated agent proposal (human review required).
 * FYI: optional; use the mapped topic when present, otherwise the discovery value or null.
 */
export function resolveDiscoveryKnowledgeLayer(
  discovery: RadarDiscovery,
  topics: Topic[],
): KnowledgeLayer | null {
  const mappedTopic = findMappedSyllabusTopic(discovery, topics);

  if (discovery.classification === "existing_topic_update") {
    return topicKnowledgeLayer(mappedTopic);
  }

  if (discovery.classification === "new_topic_candidate") {
    return isValidKnowledgeLayer(discovery.knowledgeLayer) ? discovery.knowledgeLayer : null;
  }

  if (mappedTopic) return topicKnowledgeLayer(mappedTopic);
  return isValidKnowledgeLayer(discovery.knowledgeLayer) ? discovery.knowledgeLayer : null;
}

export function knowledgeLayerSourceLabel(classification: RadarDiscoveryClassification) {
  if (classification === "new_topic_candidate") return "Proposed Knowledge Layer";
  if (classification === "existing_topic_update") return "Knowledge Layer";
  return "Related Knowledge Layer";
}

export function syllabusMapping(discovery: RadarDiscovery): { label: string; path: string | null } {
  if (discovery.classification === "new_topic_candidate") {
    return {
      label: "Potential placement",
      path: discovery.suggestedPlacement ?? null,
    };
  }
  if (discovery.classification === "existing_topic_update") {
    return {
      label: "Existing topic",
      path: discovery.syllabusPath ?? null,
    };
  }
  return {
    label: "Related to",
    path: discovery.syllabusPath ?? null,
  };
}

export function cardWhyItMatters(discovery: RadarDiscovery) {
  if (discovery.summary) return discovery.summary;
  const firstSentence = discovery.reason.split(/(?<=[.!?])\s+/)[0];
  return firstSentence || discovery.reason;
}

export function sourceCount(discovery: RadarDiscovery) {
  return discovery.sources.length;
}

export function currentLensRelevanceLine(discovery: RadarDiscovery, lens: string) {
  const category = lensRelevanceForDiscovery(discovery, lens);
  if (!category) return null;
  return `${lens} · ${syllabusRelevanceLabel(category)}`;
}

export function formatDiscoveredAt(isoDate: string) {
  const discovered = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - discovered.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return discovered.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDiscoveredAtLong(isoDate: string) {
  const relative = formatDiscoveredAt(isoDate);
  if (relative === "Today") return "Discovered today";
  return `Discovered ${relative}`;
}

export function sourceTypeBadge(type: RadarSourceType) {
  const labels: Record<RadarSourceType, string> = {
    paper: "arXiv",
    blog: "Blog",
    github: "GitHub",
    course: "Course",
    lab: "AI Lab",
    documentation: "Docs",
    industry: "Industry",
  };
  return labels[type];
}

export function formatSyllabusBreadcrumb(path: string) {
  return path.replace(/\s→\s/g, " › ");
}

export function summarizeSources(sources: RadarDiscovery["sources"]) {
  const counts = new Map<string, number>();
  for (const source of sources) {
    const label = sourceTypeLabel(source.type);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => `${count} ${label}`);
}

export function sourceTypeLabel(type: RadarSourceType) {
  const labels: Record<RadarSourceType, string> = {
    paper: "Papers",
    blog: "Blogs",
    github: "GitHub",
    course: "Courses",
    lab: "AI Labs",
    documentation: "Docs",
    industry: "Industry",
  };
  return labels[type];
}

export function isWithinTimeRange(isoDate: string, range: RadarTimeRange) {
  if (range === "all") return true;
  const discovered = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - discovered.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (range === "today") return diffDays <= 1;
  if (range === "week") return diffDays <= 7;
  return diffDays <= 31;
}

export function lensRelevanceForDiscovery(discovery: RadarDiscovery, lens: string): LensRelevanceCategory | null {
  return discovery.lensRelevance[lens] ?? null;
}

export function isRelevantForLens(discovery: RadarDiscovery, lens: string) {
  const relevance = lensRelevanceForDiscovery(discovery, lens);
  return relevance === "Must" || relevance === "Good";
}

export function filterRadarDiscoveries(
  discoveries: RadarDiscovery[],
  filters: RadarFilterState,
  selectedLens: string,
) {
  return discoveries
    .filter((discovery) => isWithinTimeRange(discovery.discoveredAt, filters.timeRange))
    .filter((discovery) => filters.priority === "all" || discovery.priority === filters.priority)
    .filter((discovery) => filters.discoveryType === "all" || discovery.classification === filters.discoveryType)
    .filter((discovery) => {
      if (filters.source === "all") return true;
      return discovery.sources.some((source) => source.type === filters.source);
    })
    .filter((discovery) => matchesFeedTab(discovery, filters.feedTab, selectedLens))
    .sort((left, right) =>
      filters.feedTab === "for_you"
        ? compareForYouFeed(left, right, selectedLens)
        : compareDiscoveries(left, right),
    );
}

function lensRelevanceScore(discovery: RadarDiscovery, lens: string) {
  const relevance = lensRelevanceForDiscovery(discovery, lens);
  if (relevance === "Must") return 0;
  if (relevance === "Good") return 1;
  if (relevance === "Optional") return 2;
  return 3;
}

function compareForYouFeed(left: RadarDiscovery, right: RadarDiscovery, lens: string) {
  // Rank: Priority → Lens Relevance → Freshness
  const priorityDiff = priorityRank(left.priority) - priorityRank(right.priority);
  if (priorityDiff !== 0) return priorityDiff;
  const lensDiff = lensRelevanceScore(left, lens) - lensRelevanceScore(right, lens);
  if (lensDiff !== 0) return lensDiff;
  return new Date(right.discoveredAt).getTime() - new Date(left.discoveredAt).getTime();
}

function matchesFeedTab(discovery: RadarDiscovery, tab: RadarFeedTab, selectedLens: string) {
  if (tab === "all") return true;
  // For You: all three content types; ranking applies Priority + Lens + Freshness
  if (tab === "for_you") return true;
  if (tab === "existing_updates") return discovery.classification === "existing_topic_update";
  if (tab === "new_candidates") return discovery.classification === "new_topic_candidate";
  if (tab === "fyi") return discovery.classification === "fyi";
  return isRelevantForLens(discovery, selectedLens);
}

function priorityRank(priority: RadarPriority) {
  if (priority === "high") return 0;
  if (priority === "medium") return 1;
  return 2;
}

function classificationRank(classification: RadarDiscoveryClassification) {
  if (classification === "new_topic_candidate") return 0;
  if (classification === "existing_topic_update") return 1;
  return 2;
}

function compareDiscoveries(left: RadarDiscovery, right: RadarDiscovery) {
  const priorityDiff = priorityRank(left.priority) - priorityRank(right.priority);
  if (priorityDiff !== 0) return priorityDiff;
  const classificationDiff = classificationRank(left.classification) - classificationRank(right.classification);
  if (classificationDiff !== 0) return classificationDiff;
  return new Date(right.discoveredAt).getTime() - new Date(left.discoveredAt).getTime();
}

export function radarDiscoveryStats(discoveries: RadarDiscovery[], selectedLens: string, timeRange: RadarTimeRange) {
  const scoped = discoveries.filter((discovery) => isWithinTimeRange(discovery.discoveredAt, timeRange));
  const forLens = scoped.filter((discovery) => isRelevantForLens(discovery, selectedLens));
  const highPriority = scoped.filter((discovery) => discovery.priority === "high");

  return {
    total: scoped.length,
    forLens: forLens.length,
    highPriority: highPriority.length,
  };
}
