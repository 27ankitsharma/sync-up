import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { sanityClient } from "@/lib/sanity";
import type { Topic } from "@/lib/types";

interface SyllabusState {
  track: string | null;
  subject: string | null;
  selectedTopicSlug: string | null;
}

interface HierarchyData {
  tracks: string[];
  subjects: Record<string, string[]>; // track → subjects
  modules: Record<string, Record<string, string[]>>; // track → subject → modules
  topicsByModule: Record<string, Topic[]>; // "track|subject|module" → topics
}

interface SyllabusContextValue {
  state: SyllabusState;
  hierarchy: HierarchyData | null;
  isLoading: boolean;
  selectedTopic: Topic | null;
  subjectsForTrack: string[];
  modulesForSubject: { module: string; topics: Topic[] }[];
  setTrack: (track: string | null) => void;
  setSubject: (subject: string | null) => void;
  selectTopic: (slug: string | null) => void;
}

const SyllabusContext = createContext<SyllabusContextValue | null>(null);

export function SyllabusProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyllabusState>({
    track: null,
    subject: null,
    selectedTopicSlug: null,
  });

  const { data: allTopics, isLoading } = useQuery<Topic[]>({
    queryKey: ["all-topics-hierarchy"],
    queryFn: () =>
      sanityClient.fetch(
        `*[_type == "topic"] | order(track asc, subject asc, module asc, title asc)`
      ),
  });

  const hierarchy = useMemo<HierarchyData | null>(() => {
    if (!allTopics) return null;

    const tracks = [...new Set(allTopics.map((t) => t.track))];
    const subjects: Record<string, string[]> = {};
    const modules: Record<string, Record<string, string[]>> = {};
    const topicsByModule: Record<string, Topic[]> = {};

    for (const topic of allTopics) {
      // Subjects per track
      if (!subjects[topic.track]) subjects[topic.track] = [];
      if (!subjects[topic.track].includes(topic.subject)) {
        subjects[topic.track].push(topic.subject);
      }

      // Modules per track+subject
      if (!modules[topic.track]) modules[topic.track] = {};
      if (!modules[topic.track][topic.subject]) modules[topic.track][topic.subject] = [];
      if (!modules[topic.track][topic.subject].includes(topic.module)) {
        modules[topic.track][topic.subject].push(topic.module);
      }

      // Topics per module key
      const key = `${topic.track}|${topic.subject}|${topic.module}`;
      if (!topicsByModule[key]) topicsByModule[key] = [];
      topicsByModule[key].push(topic);
    }

    return { tracks, subjects, modules, topicsByModule };
  }, [allTopics]);

  const setTrack = useCallback((track: string | null) => {
    setState((prev) => ({ ...prev, track, subject: null, selectedTopicSlug: null }));
  }, []);

  const setSubject = useCallback((subject: string | null) => {
    setState((prev) => ({ ...prev, subject, selectedTopicSlug: null }));
  }, []);

  const selectTopic = useCallback((slug: string | null) => {
    setState((prev) => ({ ...prev, selectedTopicSlug: slug }));
  }, []);

  const subjectsForTrack = useMemo(() => {
    if (!hierarchy || !state.track) return [];
    return hierarchy.subjects[state.track] || [];
  }, [hierarchy, state.track]);

  const modulesForSubject = useMemo(() => {
    if (!hierarchy || !state.track || !state.subject) return [];
    const mods = hierarchy.modules[state.track]?.[state.subject] || [];
    return mods.map((mod) => {
      const key = `${state.track}|${state.subject}|${mod}`;
      return { module: mod, topics: hierarchy.topicsByModule[key] || [] };
    });
  }, [hierarchy, state.track, state.subject]);

  const selectedTopic = useMemo(() => {
    if (!allTopics || !state.selectedTopicSlug) return null;
    return allTopics.find((t) => t.slug.current === state.selectedTopicSlug) || null;
  }, [allTopics, state.selectedTopicSlug]);

  const value: SyllabusContextValue = {
    state,
    hierarchy,
    isLoading,
    selectedTopic,
    subjectsForTrack,
    modulesForSubject,
    setTrack,
    setSubject,
    selectTopic,
  };

  return (
    <SyllabusContext.Provider value={value}>{children}</SyllabusContext.Provider>
  );
}

export function useSyllabus() {
  const ctx = useContext(SyllabusContext);
  if (!ctx) throw new Error("useSyllabus must be used within SyllabusProvider");
  return ctx;
}
