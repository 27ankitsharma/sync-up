import { getAllTopics } from "@/lib/syllabusData";
import type { CourseNodeType } from "@/types/course";
import type { QuizCompletion, SyncScoreSnapshot } from "@/types/progress";

const COMPLETION_INDEX_KEY = "quizcompletions:index";
const WEEKS_IN_SYNC_WINDOW = 8;

export function recordQuizCompletion(nodeType: CourseNodeType, nodeSlug: string, layer?: string): QuizCompletion {
  const completion: QuizCompletion = {
    nodeType,
    nodeSlug,
    completedAt: new Date().toISOString(),
    ...(layer ? { layer } : {}),
  };

  writeCompletion(completion);
  return completion;
}

export function computeSyncScoreForLayer(layer: string, isoWeek: string): SyncScoreSnapshot {
  const currentWeek = getIsoWeek(new Date());
  const cachedSnapshot = isoWeek === currentWeek ? null : readSnapshot(layer, isoWeek);

  if (cachedSnapshot) {
    return cachedSnapshot;
  }

  const snapshot = buildSyncScoreSnapshot(layer, isoWeek);

  if (isoWeek !== currentWeek) {
    writeSnapshot(snapshot);
  }

  return snapshot;
}

export function getSyncScoreHistory(layer: string, weeksBack = WEEKS_IN_SYNC_WINDOW): SyncScoreSnapshot[] {
  const weeks = getRecentIsoWeeks(Math.max(1, weeksBack));
  return weeks.map((isoWeek) => computeSyncScoreForLayer(layer, isoWeek));
}

export function getQuizCompletions(): QuizCompletion[] {
  return readJson<QuizCompletion[]>(COMPLETION_INDEX_KEY, []);
}

export function getQuizCompletion(nodeType: CourseNodeType, nodeSlug: string): QuizCompletion | undefined {
  return readJson<QuizCompletion | null>(completionKey(nodeType, nodeSlug), null) ?? undefined;
}

export function hasQuizCompletion(nodeType: CourseNodeType, nodeSlug: string): boolean {
  return Boolean(getQuizCompletion(nodeType, nodeSlug));
}

function buildSyncScoreSnapshot(layer: string, isoWeek: string): SyncScoreSnapshot {
  const weekStart = isoWeekToDate(isoWeek);
  const weekEnd = addDays(weekStart, 7);
  const windowStart = addWeeks(weekStart, -(WEEKS_IN_SYNC_WINDOW - 1));

  const windowTopicSlugs = getAllTopics()
    .filter((topic) => {
      if (!topic.is_radar || topic.layer !== layer || !topic.radar_week) return false;
      const topicWeekStart = isoWeekToDate(topic.radar_week);
      return topicWeekStart >= windowStart && topicWeekStart <= weekStart;
    })
    .map((topic) => topic.slug);

  const windowTopicSlugSet = new Set(windowTopicSlugs);
  const completedTopicSlugSet = new Set(
    getQuizCompletions()
      .filter((completion) => {
        if (completion.nodeType !== "topic" || !windowTopicSlugSet.has(completion.nodeSlug)) return false;
        return new Date(completion.completedAt) < weekEnd;
      })
      .map((completion) => completion.nodeSlug),
  );

  const total = windowTopicSlugs.length;
  const completed = completedTopicSlugSet.size;

  return {
    layer,
    isoWeek,
    completed,
    total,
    score: total === 0 ? 0 : Math.round((completed / total) * 100),
    computedAt: new Date().toISOString(),
  };
}

function writeCompletion(completion: QuizCompletion): void {
  const existingCompletion = getQuizCompletion(completion.nodeType, completion.nodeSlug);
  const nextCompletion = existingCompletion ?? completion;

  writeJson(completionKey(completion.nodeType, completion.nodeSlug), nextCompletion);

  const completions = getQuizCompletions();
  const withoutDuplicate = completions.filter(
    (item) => !(item.nodeType === completion.nodeType && item.nodeSlug === completion.nodeSlug),
  );
  writeJson(COMPLETION_INDEX_KEY, [...withoutDuplicate, nextCompletion]);
}

function completionKey(nodeType: CourseNodeType, nodeSlug: string): string {
  return `quizcompletions:${nodeType}:${nodeSlug}`;
}

function snapshotKey(layer: string, isoWeek: string): string {
  return `syncscore:${encodeURIComponent(layer)}:${isoWeek}`;
}

function readSnapshot(layer: string, isoWeek: string): SyncScoreSnapshot | null {
  return readJson<SyncScoreSnapshot | null>(snapshotKey(layer, isoWeek), null);
}

function writeSnapshot(snapshot: SyncScoreSnapshot): void {
  writeJson(snapshotKey(snapshot.layer, snapshot.isoWeek), snapshot);
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;

  const value = storage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(key, JSON.stringify(value));
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function getRecentIsoWeeks(weeksBack: number): string[] {
  const currentWeekStart = isoWeekToDate(getIsoWeek(new Date()));
  return Array.from({ length: weeksBack }, (_, index) => {
    const offset = index - (weeksBack - 1);
    return dateToIsoWeek(addWeeks(currentWeekStart, offset));
  });
}

function getIsoWeek(date: Date): string {
  return dateToIsoWeek(date);
}

function dateToIsoWeek(date: Date): string {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${utcDate.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function isoWeekToDate(isoWeek: string): Date {
  const [yearPart, weekPart] = isoWeek.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const day = simple.getUTCDay() || 7;

  if (day <= 4) {
    simple.setUTCDate(simple.getUTCDate() - day + 1);
  } else {
    simple.setUTCDate(simple.getUTCDate() + 8 - day);
  }

  return simple;
}

function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}
