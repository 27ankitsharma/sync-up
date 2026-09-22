import type { Topic as LegacyTopic } from "@/lib/types";
import type { Syllabus, TopicWithContext } from "@/types/syllabus";

export function localTopicToLegacyTopic(topic: TopicWithContext): LegacyTopic {
  return {
    _id: topic.id,
    title: topic.title,
    slug: {
      current: topic.slug,
    },
    roles: topic.roles,
    difficulty: topic.difficulty.toLowerCase() as LegacyTopic["difficulty"],
    layer: topic.layer,
    status: topic.status === "coming_soon" ? "coming-soon" : topic.status,
    lastUpdated: topic.radar_week ? isoWeekToApproxDate(topic.radar_week) : new Date().toISOString(),
    summary: topic.summary,
    order: topic.order,
    priority: topic.priority,
    whyItMatters: portableParagraphs([topic.why_it_matters]),
    lessons: [],
    module: {
      _id: topic.module.slug,
      title: topic.module.title,
      subject: {
        _id: topic.subject.slug,
        title: topic.subject.title,
        track: {
          _id: topic.track.slug,
          title: topic.track.title,
        },
      },
    },
  };
}

export function localSyllabusToLegacyTopics(syllabus: Syllabus): LegacyTopic[] {
  return syllabus.tracks.flatMap((track) =>
    track.subjects.flatMap((subject) =>
      subject.modules.flatMap((module) =>
        module.topics.map((topic) =>
          localTopicToLegacyTopic({
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
          }),
        ),
      ),
    ),
  );
}

function isoWeekToApproxDate(isoWeek: string): string {
  const [yearPart, weekPart] = isoWeek.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const date = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  return date.toISOString();
}

function portableParagraphs(paragraphs: string[]) {
  return paragraphs
    .filter(Boolean)
    .map((text, index) => ({
      _type: "block",
      _key: `paragraph-${index + 1}`,
      children: [
        {
          _type: "span",
          _key: `span-${index + 1}`,
          text,
        },
      ],
    }));
}
