import { describe, expect, it } from "vitest";
import {
  calculateSyncMetrics,
  isRadarTopicInSyncWindow,
  type TopicLearningContent,
} from "@/lib/syncMetrics";
import type { Topic } from "@/types/syllabus";

const AS_OF = new Date("2026-09-26T12:00:00Z");

describe("sync metrics", () => {
  it("counts only Must topics with an actually published assessment for Knowledge Sync", () => {
    const topics = [
      topic("must-assessed", { relevance: "Must" }),
      topic("good-assessed", { relevance: "Good" }),
      topic("optional-assessed", { relevance: "Optional" }),
      topic("must-without-assessment", { relevance: "Must" }),
    ];
    const content = new Map<string, TopicLearningContent>([
      ["must-assessed", learningContent("must-assessed", ["quiz-must"])],
      ["good-assessed", learningContent("good-assessed", ["quiz-good"])],
      ["optional-assessed", learningContent("optional-assessed", ["quiz-optional"])],
    ]);

    const result = calculateSyncMetrics({
      topics,
      selectedLens: "AI Engineer",
      contentByTopicId: content,
      passedQuizIds: new Set(),
      asOf: AS_OF,
    });

    expect(result.knowledgeSync.eligibleTopics).toBe(1);
    expect(result.knowledgeSync.percent).toBe(0);
  });

  it("counts only authoritative passed quiz attempts as demonstrated mastery", () => {
    const topics = [
      topic("course-a", { relevance: "Must" }),
      topic("course-b", { relevance: "Must" }),
    ];
    const content = new Map<string, TopicLearningContent>([
      ["course-a", learningContent("course-a", ["quiz-a"])],
      ["course-b", learningContent("course-b", ["quiz-b"])],
    ]);

    const result = calculateSyncMetrics({
      topics,
      selectedLens: "AI Engineer",
      contentByTopicId: content,
      passedQuizIds: new Set(["quiz-b"]),
      asOf: AS_OF,
    });

    expect(result.knowledgeSync.progressUnits).toBe(1);
    expect(result.knowledgeSync.completedTopics).toBe(1);
    expect(result.knowledgeSync.percent).toBe(50);
  });

  it("returns unavailable rather than zero when there are no eligible topics", () => {
    const result = calculateSyncMetrics({
      topics: [topic("optional", { relevance: "Optional" })],
      selectedLens: "AI Engineer",
      contentByTopicId: new Map([
        ["optional", learningContent("optional", ["quiz-optional"])],
      ]),
      passedQuizIds: new Set(),
      asOf: AS_OF,
    });

    expect(result.knowledgeSync.percent).toBeNull();
    expect(result.radarSync.percent).toBeNull();
  });

  it("uses the canonical rolling eight-week Radar window", () => {
    expect(
      isRadarTopicInSyncWindow(
        topic("inside", { radar: true, radarWeek: "2026-W32" }),
        AS_OF,
      ),
    ).toBe(true);
    expect(
      isRadarTopicInSyncWindow(
        topic("too-old", { radar: true, radarWeek: "2026-W31" }),
        AS_OF,
      ),
    ).toBe(false);
    expect(
      isRadarTopicInSyncWindow(
        topic("future", { radar: true, radarWeek: "2026-W40" }),
        AS_OF,
      ),
    ).toBe(false);
  });

  it("changes Knowledge Sync only when the selected lens changes its eligible set", () => {
    const first = topic("first", { relevance: "Must" });
    first.lens_relevance = { "AI Engineer": "Must", "Data Scientist": "Optional" };
    const second = topic("second", { relevance: "Good" });
    second.lens_relevance = { "AI Engineer": "Good", "Data Scientist": "Must" };
    const content = new Map<string, TopicLearningContent>([
      ["first", learningContent("first", ["quiz-first"])],
      ["second", learningContent("second", ["quiz-second"])],
    ]);
    const common = {
      topics: [first, second],
      contentByTopicId: content,
      passedQuizIds: new Set(["quiz-first"]),
      asOf: AS_OF,
    };

    expect(calculateSyncMetrics({ ...common, selectedLens: "AI Engineer" }).knowledgeSync.percent).toBe(100);
    expect(calculateSyncMetrics({ ...common, selectedLens: "Data Scientist" }).knowledgeSync.percent).toBe(0);
  });

  it("changes Radar Sync only from eligible Radar progress and is deterministic on refresh", () => {
    const knowledgeOnly = topic("knowledge-only", {
      relevance: "Must",
    });
    const radar = topic("radar", {
      relevance: "Must",
      radar: true,
      radarWeek: "2026-W35",
    });
    const input = {
      topics: [knowledgeOnly, radar],
      selectedLens: "AI Engineer",
      contentByTopicId: new Map<string, TopicLearningContent>([
        ["knowledge-only", learningContent("knowledge-only", ["quiz-knowledge"])],
        ["radar", learningContent("radar", ["quiz-radar"])],
      ]),
      passedQuizIds: new Set(["quiz-knowledge"]),
      asOf: AS_OF,
    };

    const firstLoad = calculateSyncMetrics(input);
    const refreshed = calculateSyncMetrics(input);

    expect(firstLoad.knowledgeSync.percent).toBe(50);
    expect(firstLoad.radarSync.percent).toBe(0);
    expect(refreshed).toEqual(firstLoad);
  });
});

function topic(
  id: string,
  options: {
    relevance?: "Must" | "Good" | "Optional";
    radar?: boolean;
    radarWeek?: string | null;
  } = {},
): Topic {
  return {
    id,
    title: id,
    slug: id,
    layer: "Models & Architectures",
    difficulty: "Beginner",
    lens_relevance: { "AI Engineer": options.relevance ?? "Must" },
    roles: ["AI Engineer"],
    status: "published",
    priority: "medium",
    is_radar: options.radar ?? false,
    radar_week: options.radarWeek ?? null,
    summary: "",
    why_it_matters: "",
    order: 1,
    hasCourse: false,
    course_status: "no",
    diagnostic_status: "no",
  };
}

function learningContent(
  topicId: string,
  publishedQuizIds: string[],
): TopicLearningContent {
  return { topicId, publishedQuizIds };
}
