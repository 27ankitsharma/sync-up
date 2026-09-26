import { describe, expect, it } from "vitest";
import { RadarDiscoveryService } from "@/services/RadarDiscoveryService";

describe("RadarDiscoveryService", () => {
  it("derives Radar discoveries from generated syllabus topics", async () => {
    const discoveries = await RadarDiscoveryService.getDiscoveries();
    const mhs = discoveries.find(
      (item) => item.topicId === "agent-foundations-agent-environments-model-hardware-standard",
    );

    expect(mhs).toMatchObject({
      topicId: "agent-foundations-agent-environments-model-hardware-standard",
      classification: "existing_topic_update",
      discoveredAt: "2026-08-27T00:00:00.000Z",
    });
    expect(discoveries.every((item) => item.id.startsWith("radar-"))).toBe(true);
  });
});
