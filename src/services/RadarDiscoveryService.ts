import { mockRadarDiscoveries } from "@/data/radarDiscoveries.mock";
import { getAllTopics } from "@/lib/syllabusData";
import { resolveDiscoveryKnowledgeLayer } from "@/lib/radarDiscoveryUtils";
import type { RadarDiscovery } from "@/types/radarDiscovery";

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

class MockRadarDiscoveryService implements RadarDiscoveryServiceContract {
  async getDiscoveries() {
    return mockRadarDiscoveries.map(hydrateDiscovery);
  }

  async getDiscoveryById(id: string) {
    const discovery = mockRadarDiscoveries.find((item) => item.id === id);
    return discovery ? hydrateDiscovery(discovery) : undefined;
  }
}

export const RadarDiscoveryService: RadarDiscoveryServiceContract = new MockRadarDiscoveryService();
