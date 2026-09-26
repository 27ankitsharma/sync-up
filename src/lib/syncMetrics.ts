import type { Topic } from "@/types/syllabus";

export const RADAR_SYNC_WINDOW_WEEKS = 8;

export interface TopicLearningContent {
  topicId: string;
  publishedQuizIds: string[];
}

export interface SyncMetric {
  percent: number | null;
  eligibleTopics: number;
  completedTopics: number;
  progressUnits: number;
}

export interface SyncMetricsOverview {
  knowledgeSync: SyncMetric;
  radarSync: SyncMetric;
}

interface CalculateSyncMetricsInput {
  topics: Topic[];
  selectedLens: string;
  contentByTopicId: Map<string, TopicLearningContent>;
  passedQuizIds: Set<string>;
  asOf?: Date;
}

export function calculateSyncMetrics({
  topics,
  selectedLens,
  contentByTopicId,
  passedQuizIds,
  asOf = new Date(),
}: CalculateSyncMetricsInput): SyncMetricsOverview {
  const assessedTopics = topics.flatMap((topic): AssessedTopic[] => {
    const content = contentByTopicId.get(topic.id);
    if (!content || content.publishedQuizIds.length === 0) return [];
    return [{ topic, quizIds: content.publishedQuizIds }];
  });

  const knowledgeTopics = assessedTopics.filter(
    ({ topic }) => topic.lens_relevance?.[selectedLens] === "Must",
  );
  const radarTopics = assessedTopics.filter(
    ({ topic }) =>
      isTopicRelevantForRadar(topic, selectedLens) &&
      isRadarTopicInSyncWindow(topic, asOf),
  );

  return {
    knowledgeSync: calculateMetric(knowledgeTopics, passedQuizIds),
    radarSync: calculateMetric(radarTopics, passedQuizIds),
  };
}

export function unavailableSyncMetrics(): SyncMetricsOverview {
  return {
    knowledgeSync: emptyMetric(),
    radarSync: emptyMetric(),
  };
}

export function isTopicRelevantForRadar(topic: Topic, selectedLens: string): boolean {
  const relevance = topic.lens_relevance?.[selectedLens];
  return relevance === "Must" || relevance === "Good";
}

export function isRadarTopicInSyncWindow(topic: Topic, asOf: Date): boolean {
  if (!topic.is_radar || !topic.radar_week) return false;
  const topicWeek = isoWeekToDate(topic.radar_week);
  if (!topicWeek) return false;

  const currentWeek = startOfIsoWeek(asOf);
  const windowStart = addDays(currentWeek, -(RADAR_SYNC_WINDOW_WEEKS - 1) * 7);
  return topicWeek >= windowStart && topicWeek <= currentWeek;
}

function calculateMetric(
  topics: AssessedTopic[],
  passedQuizIds: Set<string>,
): SyncMetric {
  if (topics.length === 0) return emptyMetric();

  const completedTopics = topics.filter(({ quizIds }) =>
    quizIds.some((quizId) => passedQuizIds.has(quizId)),
  ).length;

  return {
    percent: Math.round((completedTopics / topics.length) * 100),
    eligibleTopics: topics.length,
    completedTopics,
    progressUnits: completedTopics,
  };
}

interface AssessedTopic {
  topic: Topic;
  quizIds: string[];
}

function emptyMetric(): SyncMetric {
  return {
    percent: null,
    eligibleTopics: 0,
    completedTopics: 0,
    progressUnits: 0,
  };
}

function isoWeekToDate(isoWeek: string): Date | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  if (week < 1 || week > 53) return null;

  const fourthOfJanuary = new Date(Date.UTC(year, 0, 4));
  const fourthDay = fourthOfJanuary.getUTCDay() || 7;
  const firstMonday = addDays(fourthOfJanuary, 1 - fourthDay);
  return addDays(firstMonday, (week - 1) * 7);
}

function startOfIsoWeek(date: Date): Date {
  const start = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
  const day = start.getUTCDay() || 7;
  return addDays(start, 1 - day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
