import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRadarTopics, getSyllabus, getTopicBySlug, searchTopics } from "@/lib/syllabusData";

const ONE_HOUR = 60 * 60 * 1000;
const THIRTY_MINUTES = 30 * 60 * 1000;
const SEARCH_DEBOUNCE_MS = 300;

export function useSyllabus() {
  return useQuery({
    queryKey: ["local-syllabus"],
    queryFn: getSyllabus,
    staleTime: ONE_HOUR,
  });
}

export function useRadar(week?: string) {
  return useQuery({
    queryKey: ["local-radar", week ?? "all"],
    queryFn: () => getRadarTopics(week),
    staleTime: THIRTY_MINUTES,
  });
}

export function useTopic(slug: string) {
  return useQuery({
    queryKey: ["local-topic", slug],
    queryFn: () => getTopicBySlug(slug),
    staleTime: ONE_HOUR,
    enabled: Boolean(slug),
  });
}

export function useSearch(query: string) {
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const normalizedQuery = debouncedQuery.trim();

  return useQuery({
    queryKey: ["local-search", normalizedQuery],
    queryFn: () => searchTopics(normalizedQuery),
    staleTime: THIRTY_MINUTES,
    enabled: normalizedQuery.length >= 2,
  });
}

function useDebouncedValue(value: string, delayMs: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [delayMs, value]);

  return debouncedValue;
}
