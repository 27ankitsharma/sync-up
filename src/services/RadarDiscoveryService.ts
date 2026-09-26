import { getAllTopics, getRadarTopics } from "@/lib/syllabusData";
import { resolveDiscoveryKnowledgeLayer } from "@/lib/radarDiscoveryUtils";
import type {
  RadarDiscovery,
  RadarDiscoveryClassification,
  RadarRecommendedAction,
  RadarSource,
  RadarSourceType,
} from "@/types/radarDiscovery";
import type { RadarTopic } from "@/types/syllabus";

export interface RadarDiscoveryServiceContract {
  getDiscoveries(): Promise<RadarDiscovery[]>;
  getDiscoveryById(id: string): Promise<RadarDiscovery | undefined>;
}

function hydrateDiscovery(discovery: RadarDiscovery): RadarDiscovery {
  const topics = getAllTopics();
  return {
    ...discovery,
    knowledgeLayer: resolveDiscoveryKnowledgeLayer(discovery, topics),
  };
}

class SyllabusRadarDiscoveryService implements RadarDiscoveryServiceContract {
  async getDiscoveries() {
    return syllabusRadarDiscoveries().map(hydrateDiscovery);
  }

  async getDiscoveryById(id: string) {
    const discovery = syllabusRadarDiscoveries().find((item) => item.id === id);
    return discovery ? hydrateDiscovery(discovery) : undefined;
  }
}

function syllabusRadarDiscoveries(): RadarDiscovery[] {
  const today = new Date().toISOString().slice(0, 10);
  return getRadarTopics()
    .filter(
      (topic) =>
        Boolean(topic.radar_start_date && topic.radar_classification) &&
        topic.radar_start_date! <= today &&
        (!topic.radar_end_date || topic.radar_end_date >= today),
    )
    .map(topicToDiscovery);
}

function topicToDiscovery(topic: RadarTopic): RadarDiscovery {
  const classification = topic.radar_classification as RadarDiscoveryClassification;
  return {
    id: `radar-${topic.id}-${topic.radar_start_date}`,
    title: topic.title,
    topicId: topic.id,
    topicSlug: topic.slug,
    syllabusPath: `${topic.track.title} → ${topic.subject.title} → ${topic.module.title} → ${topic.title}`,
    classification,
    summary: topic.summary,
    reason: topic.why_it_matters,
    priority: topic.priority,
    recommendedAction: recommendedAction(classification),
    status: "new",
    discoveredAt: `${topic.radar_start_date}T00:00:00.000Z`,
    lensRelevance: topic.lens_relevance ?? {},
    sources: (topic.resources ?? []).flatMap((source): RadarSource[] =>
      isRadarSourceType(source.type)
        ? [{ type: source.type, title: source.title, url: source.url }]
        : [],
    ),
    knowledgeLayer: topic.knowledge_layer as RadarDiscovery["knowledgeLayer"],
    relatedTopicSlugs: [],
  };
}

function recommendedAction(classification: RadarDiscoveryClassification): RadarRecommendedAction {
  if (classification === "new_topic_candidate") return "Review";
  if (classification === "existing_topic_update") return "Update";
  return "Watch";
}

function isRadarSourceType(value: string): value is RadarSourceType {
  return ["paper", "blog", "github", "course", "lab", "documentation", "industry"].includes(value);
}

export const RadarDiscoveryService: RadarDiscoveryServiceContract = new SyllabusRadarDiscoveryService();
