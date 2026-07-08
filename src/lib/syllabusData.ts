import syllabusJson from "@/data/syllabus.json";
import type { RadarTopic, SearchResult, Syllabus, Topic, TopicWithContext } from "@/types/syllabus";

const syllabus = syllabusJson as Syllabus;

const topicsWithContext: TopicWithContext[] = syllabus.tracks.flatMap((track) =>
  track.subjects.flatMap((subject) =>
    subject.modules.flatMap((module) =>
      module.topics.map((topic) => ({
        ...topic,
        track: {
          title: track.title,
          slug: track.slug,
        },
        subject: {
          title: subject.title,
          slug: subject.slug,
        },
        module: {
          title: module.title,
          slug: module.slug,
        },
      })),
    ),
  ),
);

export function getSyllabus(): Syllabus {
  return syllabus;
}

export function getRadarTopics(week?: string): RadarTopic[] {
  return topicsWithContext.filter((topic) => topic.is_radar && (!week || topic.radar_week === week));
}

export function getTopicBySlug(slug: string): TopicWithContext | undefined {
  return topicsWithContext.find((topic) => topic.slug === slug);
}

export function searchTopics(query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return topicsWithContext.filter((topic) => topicMatchesQuery(topic, normalizedQuery));
}

export function getAllTopics(): TopicWithContext[] {
  return topicsWithContext;
}

function topicMatchesQuery(topic: Topic, normalizedQuery: string): boolean {
  return topic.title.toLowerCase().includes(normalizedQuery) || topic.summary.toLowerCase().includes(normalizedQuery);
}
