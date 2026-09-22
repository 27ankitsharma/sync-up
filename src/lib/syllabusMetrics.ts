import {
  KNOWLEDGE_LAYERS,
  type Difficulty,
  type DifficultyAggregate,
  type KnowledgeLayer,
  type Syllabus,
  type Topic,
  type TopicWithContext,
} from "@/types/syllabus";

export type RelevanceCategory = "Must" | "Good" | "Optional";

export const DEFAULT_LENS = "AI Engineer";

export function availableLenses(syllabus?: Syllabus | null) {
  const lenses = new Set<string>();

  for (const track of syllabus?.tracks ?? []) {
    Object.keys(track.lens_relevance ?? {}).forEach((lens) => lenses.add(lens));

    for (const subject of track.subjects) {
      Object.keys(subject.lens_relevance ?? {}).forEach((lens) => lenses.add(lens));

      for (const module of subject.modules) {
        Object.keys(module.lens_relevance ?? {}).forEach((lens) => lenses.add(lens));

        for (const topic of module.topics) {
          Object.keys(topic.lens_relevance ?? {}).forEach((lens) => lenses.add(lens));
        }
      }
    }
  }

  return Array.from(lenses).sort((left, right) => left.localeCompare(right));
}

export function resolveLens({
  stored,
  profileRole,
  lenses,
}: {
  stored?: string | null;
  profileRole?: string | null;
  lenses: string[];
}) {
  if (stored && (lenses.length === 0 || lenses.includes(stored))) return stored;
  if (profileRole && (lenses.length === 0 || lenses.includes(profileRole))) return profileRole;
  if (lenses.includes(DEFAULT_LENS)) return DEFAULT_LENS;
  return lenses[0] ?? DEFAULT_LENS;
}

export function formatDifficultyAggregate(aggregate?: DifficultyAggregate | null) {
  if (!aggregate) return null;

  const entries = (Object.entries(aggregate) as [Difficulty, number][]).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  if (entries.length === 1) return entries[0][0];

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const [top] = entries.sort((left, right) => right[1] - left[1]);
  if (top[1] / total >= 0.6) return top[0];

  const order: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];
  const present = order.filter((level) => aggregate[level]);
  if (present.length <= 1) return present[0] ?? null;

  return `${present[0]}–${present[present.length - 1]}`;
}

export function difficultyFromTopics(topics: Topic[]) {
  if (topics.length === 0) return null;

  const aggregate: DifficultyAggregate = {};
  for (const topic of topics) {
    aggregate[topic.difficulty] = (aggregate[topic.difficulty] ?? 0) + 1;
  }

  return formatDifficultyAggregate(aggregate);
}

export function formatSelectedDifficulty({
  topic,
  nodeDifficulty,
  childTopics,
}: {
  topic?: Topic | null;
  nodeDifficulty?: DifficultyAggregate | null;
  childTopics?: Topic[];
}) {
  if (topic?.difficulty) return topic.difficulty;
  return formatDifficultyAggregate(nodeDifficulty) ?? difficultyFromTopics(childTopics ?? []) ?? "Not set";
}

export function topicsForSelectedNode(syllabus: Syllabus, type: string, id: string) {
  for (const track of syllabus.tracks) {
    if (type === "track" && track.id === id) {
      return flattenSyllabusTopics({ tracks: [track] });
    }

    for (const subject of track.subjects) {
      if (type === "subject" && subject.id === id) {
        return subject.modules.flatMap((module) => module.topics);
      }

      for (const module of subject.modules) {
        if (type === "module" && module.id === id) {
          return module.topics;
        }
      }
    }
  }

  return [];
}

export function nodeDifficultyForSelection(syllabus: Syllabus, type: string, id: string) {
  for (const track of syllabus.tracks) {
    if (type === "track" && track.id === id) return track.difficulty;
    for (const subject of track.subjects) {
      if (type === "subject" && subject.id === id) return subject.difficulty;
      for (const module of subject.modules) {
        if (type === "module" && module.id === id) return module.difficulty;
      }
    }
  }

  return null;
}

export function flattenSyllabusTopics(syllabus: Syllabus): Topic[] {
  return syllabus.tracks.flatMap((track) =>
    track.subjects.flatMap((subject) =>
      subject.modules.flatMap((module) => module.topics),
    ),
  );
}

export function isValidKnowledgeLayer(value: string | null | undefined): value is KnowledgeLayer {
  return Boolean(value && (KNOWLEDGE_LAYERS as readonly string[]).includes(value));
}

/** Topic-level Knowledge Layer from syllabus.json. Does not infer or overwrite. */
export function topicKnowledgeLayer(topic?: Topic | null): KnowledgeLayer | null {
  const value = topic?.knowledge_layer || topic?.layer;
  return isValidKnowledgeLayer(value) ? value : null;
}

export function topicRelevance(topic: Topic, lens: string): RelevanceCategory {
  const direct = topic.lens_relevance?.[lens];
  if (direct) return direct;

  const firstAvailable = Object.values(topic.lens_relevance ?? {})[0];
  if (firstAvailable) return firstAvailable;

  if (topic.priority === "high") return "Must";
  if (topic.priority === "medium") return "Good";
  return "Optional";
}

export function relevanceLabel(category: RelevanceCategory) {
  if (category === "Must") return "Must Learn";
  if (category === "Good") return "Good to Have";
  return "Optional";
}

export function relevanceColor(category: RelevanceCategory) {
  if (category === "Must") return "bg-emerald-500";
  if (category === "Good") return "bg-yellow-500";
  return "bg-slate-400";
}

export function relevanceBadgeClass(category: RelevanceCategory) {
  if (category === "Must") return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
  if (category === "Good") return "bg-yellow-50 text-yellow-700 hover:bg-yellow-50";
  return "bg-slate-100 text-slate-600 hover:bg-slate-100";
}

export function countRelevance(topics: Topic[], lens: string) {
  return topics.reduce(
    (counts, topic) => {
      counts[topicRelevance(topic, lens)] += 1;
      return counts;
    },
    { Must: 0, Good: 0, Optional: 0 } as Record<RelevanceCategory, number>,
  );
}

export function summarizeBranchRelevance(topics: Topic[], lens: string): RelevanceCategory {
  const counts = countRelevance(topics, lens);
  if (counts.Must >= counts.Good && counts.Must >= counts.Optional) return "Must";
  if (counts.Good >= counts.Optional) return "Good";
  return "Optional";
}

/** One bubble per immediate child, sorted Must → Good → Optional for scannability. */
export function sortRelevanceBubbles(categories: RelevanceCategory[]): RelevanceCategory[] {
  const order: Record<RelevanceCategory, number> = { Must: 0, Good: 1, Optional: 2 };
  return [...categories].sort((left, right) => order[left] - order[right]);
}

export function relevanceBubbleTitle(categories: RelevanceCategory[]) {
  const counts = categories.reduce(
    (acc, category) => {
      acc[category] += 1;
      return acc;
    },
    { Must: 0, Good: 0, Optional: 0 } as Record<RelevanceCategory, number>,
  );
  return [
    counts.Must > 0 ? `${counts.Must} Must Learn` : null,
    counts.Good > 0 ? `${counts.Good} Good to Have` : null,
    counts.Optional > 0 ? `${counts.Optional} Optional` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export function relevancePercent(topics: Topic[], lens: string) {
  if (topics.length === 0) return 0;
  const counts = countRelevance(topics, lens);
  return Math.round(((counts.Must + counts.Good * 0.6) / topics.length) * 100);
}

export function topicLearningHours(topic: Topic) {
  return topic.learning_time ?? 0.75;
}

export function totalLearningHours(topics: Topic[]) {
  return Math.round(topics.reduce((sum, topic) => sum + topicLearningHours(topic), 0));
}

export function formatLearningTime(hours?: number | null) {
  if (!hours) return "45m";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)}h`;
}

export function siblingTopics(topic: TopicWithContext, topics: TopicWithContext[]) {
  return topics
    .filter((candidate) => candidate.module.slug === topic.module.slug && candidate.slug !== topic.slug)
    .slice(0, 8);
}
