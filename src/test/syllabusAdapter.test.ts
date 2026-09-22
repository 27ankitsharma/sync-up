import { describe, expect, it } from "vitest";
import type { TopicWithContext } from "@/types/syllabus";
import { localTopicToLegacyTopic } from "@/utils/syllabusAdapter";

describe("localTopicToLegacyTopic", () => {
  it("does not generate in-memory dummy lessons", () => {
    const topic = localTopicToLegacyTopic(sampleTopic());
    expect(topic.lessons).toEqual([]);
  });
});

function sampleTopic(): TopicWithContext {
  return {
    id: "model-adaptation-parameter-efficient-adaptation-lora",
    title: "LoRA",
    slug: "lora",
    layer: "Techniques & Practices",
    knowledge_layer: "Techniques & Practices",
    difficulty: "Beginner",
    roles: ["AI Engineer"],
    status: "draft",
    priority: "high",
    is_radar: false,
    radar_week: null,
    summary: "Core concept covering lora within Parameter-Efficient Adaptation.",
    why_it_matters: "Builds practical understanding of lora for AI learning and application.",
    order: 1,
    hasCourse: true,
    course_status: "yes",
    diagnostic_status: "yes",
    track: { title: "Foundation Models", slug: "foundation-models" },
    subject: { title: "Model Adaptation", slug: "model-adaptation" },
    module: { title: "Parameter-Efficient Adaptation", slug: "parameter-efficient-adaptation" },
  };
}
