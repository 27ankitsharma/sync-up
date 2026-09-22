import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLens } from "@/contexts/LensContext";
import { useRadarFilters } from "@/contexts/RadarFilterContext";
import { filterRadarDiscoveries, radarDiscoveryStats } from "@/lib/radarDiscoveryUtils";
import { RadarDiscoveryService } from "@/services/RadarDiscoveryService";

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useRadarDiscoveries() {
  const { selectedLens } = useLens();
  const { filters } = useRadarFilters();

  const query = useQuery({
    queryKey: ["radar-discoveries"],
    queryFn: () => RadarDiscoveryService.getDiscoveries(),
    staleTime: THIRTY_MINUTES,
  });

  const filtered = useMemo(
    () => filterRadarDiscoveries(query.data ?? [], filters, selectedLens),
    [filters, query.data, selectedLens],
  );

  const stats = useMemo(
    () => radarDiscoveryStats(query.data ?? [], selectedLens, filters.timeRange),
    [filters.timeRange, query.data, selectedLens],
  );

  const highPriority = useMemo(
    () => filtered.filter((discovery) => discovery.priority === "high"),
    [filtered],
  );

  return {
    ...query,
    discoveries: filtered,
    allDiscoveries: query.data ?? [],
    stats,
    highPriority,
  };
}

export function useRadarDiscovery(id?: string | null) {
  return useQuery({
    queryKey: ["radar-discovery", id],
    queryFn: () => RadarDiscoveryService.getDiscoveryById(id ?? ""),
    enabled: Boolean(id),
    staleTime: THIRTY_MINUTES,
  });
}
