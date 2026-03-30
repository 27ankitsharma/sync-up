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
  subjects: Record<string, string[]>;
  modules: Record<string, Record<string, string[]>>;
  topicsByModule: Record<string, Topic[]>;
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
        `*[_type == "topic"]{
          _id,
          title,
          slug,
          roles,
          difficulty,
          layer,
          status,
          lastUpdated,
          orderRank,
          summary,
          module->{
            _id,
            title,
            orderRank,
            subject->{
              _id,
              title,
              orderRank,
              track->{
                _id,
                title,
                orderRank,
                icon
              }
            }
          }
        }
        | order(
          module.subject.track.orderRank asc,
          module.subject.orderRank asc,
          module.orderRank asc,
          orderRank asc
        )`,
      ),
    staleTime: 0,
  });

  const hierarchy = useMemo<HierarchyData | null>(() => {
    if (!allTopics) return null;

    const tracks: string[] = [];
    const subjects: Record<string, string[]> = {};
    const modules: Record<string, Record<string, string[]>> = {};
    const topicsByModule: Record<string, Topic[]> = {};

    const seenTracks = new Set<string>();

    for (const topic of allTopics) {
      const trackName = topic.module?.subject?.track?.title ?? "";
      const subjectName = topic.module?.subject?.title ?? "";
      const moduleName = topic.module?.title ?? "";

      if (!trackName || !subjectName || !moduleName) continue;

      // ✅ Preserve track order (NO Set bug)
      if (!seenTracks.has(trackName)) {
        tracks.push(trackName);
        seenTracks.add(trackName);
      }

      // Subjects
      if (!subjects[trackName]) subjects[trackName] = [];
      if (!subjects[trackName].includes(subjectName)) {
        subjects[trackName].push(subjectName);
      }

      // Modules
      if (!modules[trackName]) modules[trackName] = {};
      if (!modules[trackName][subjectName]) {
        modules[trackName][subjectName] = [];
      }
      if (!modules[trackName][subjectName].includes(moduleName)) {
        modules[trackName][subjectName].push(moduleName);
      }

      // Topics
      const key = `${trackName}|${subjectName}|${moduleName}`;
      if (!topicsByModule[key]) topicsByModule[key] = [];

      topicsByModule[key].push(topic);
    }

    // ✅ Ensure topic order preserved
    Object.keys(topicsByModule).forEach((key) => {
      topicsByModule[key].sort((a, b) =>
        (a.orderRank || "").localeCompare(b.orderRank || "")
      );
    });

    return { tracks, subjects, modules, topicsByModule };
  }, [allTopics]);

  const setTrack = useCallback((track: string | null) => {
    setState((prev) => ({
      ...prev,
      track,
      subject: null,
      selectedTopicSlug: null,
    }));
  }, []);

  const setSubject = useCallback((subject: string | null) => {
    setState((prev) => ({
      ...prev,
      subject,
      selectedTopicSlug: null,
    }));
  }, []);

  const selectTopic = useCallback((slug: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedTopicSlug: slug,
    }));
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
      return {
        module: mod,
        topics: hierarchy.topicsByModule[key] || [],
      };
    });
  }, [hierarchy, state.track, state.subject]);

  const selectedTopic = useMemo(() => {
    if (!allTopics || !state.selectedTopicSlug) return null;
    return (
      allTopics.find((t) => t.slug.current === state.selectedTopicSlug) || null
    );
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
    <SyllabusContext.Provider value={value}>
      {children}
    </SyllabusContext.Provider>
  );
}

export function useSyllabus() {
  const ctx = useContext(SyllabusContext);
  if (!ctx) {
    throw new Error("useSyllabus must be used within SyllabusProvider");
  }
  return ctx;
}