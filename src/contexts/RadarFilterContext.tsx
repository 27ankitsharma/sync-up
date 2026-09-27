import { createContext, useContext, useMemo, useState } from "react";
import type {
  RadarDiscoveryTypeFilter,
  RadarFeedTab,
  RadarFilterState,
  RadarPriorityFilter,
  RadarSourceFilter,
  RadarTimeRange,
} from "@/types/radarDiscovery";

interface RadarFilterContextValue {
  filters: RadarFilterState;
  setTimeRange: (value: RadarTimeRange) => void;
  setFeedTab: (value: RadarFeedTab) => void;
  setPriority: (value: RadarPriorityFilter) => void;
  setDiscoveryType: (value: RadarDiscoveryTypeFilter) => void;
  setSource: (value: RadarSourceFilter) => void;
}

const defaultFilters: RadarFilterState = {
  timeRange: "all",
  feedTab: "all",
  priority: "all",
  discoveryType: "all",
  source: "all",
};

const RadarFilterContext = createContext<RadarFilterContextValue | null>(null);

export function RadarFilterProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<RadarFilterState>(defaultFilters);

  const value = useMemo<RadarFilterContextValue>(
    () => ({
      filters,
      setTimeRange: (timeRange) => setFilters((current) => ({ ...current, timeRange })),
      setFeedTab: (feedTab) => setFilters((current) => ({ ...current, feedTab })),
      setPriority: (priority) => setFilters((current) => ({ ...current, priority })),
      setDiscoveryType: (discoveryType) => setFilters((current) => ({ ...current, discoveryType })),
      setSource: (source) => setFilters((current) => ({ ...current, source })),
    }),
    [filters],
  );

  return <RadarFilterContext.Provider value={value}>{children}</RadarFilterContext.Provider>;
}

export function useRadarFilters() {
  const context = useContext(RadarFilterContext);
  if (!context) {
    throw new Error("useRadarFilters must be used within RadarFilterProvider");
  }
  return context;
}
