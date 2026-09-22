import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useKnowledgeSelection } from "@/contexts/KnowledgeSelectionContext";
import { useLens } from "@/contexts/LensContext";
import { useSyllabus } from "@/hooks/useSyllabus";
import { useCompletedTopicSlugs } from "@/hooks/useUser";
import {
  countRelevance,
  flattenSyllabusTopics,
  formatLearningTime,
  relevanceBubbleTitle,
  relevanceColor,
  relevancePercent,
  sortRelevanceBubbles,
  summarizeBranchRelevance,
  topicKnowledgeLayer,
  topicRelevance,
  totalLearningHours,
  type RelevanceCategory,
} from "@/lib/syllabusMetrics";
import { KNOWLEDGE_LAYERS, type KnowledgeLayer, type Module, type Subject, type Topic, type Track } from "@/types/syllabus";
import { BookOpen, Boxes, CheckCircle2, ChevronRight, Circle, Clock, Layers3, ListTree, Radar, Search, ShieldCheck } from "lucide-react";

export function LiveMapTree() {
  const { data: syllabus, isLoading } = useSyllabus();
  const { data: completedTopicSlugs = [] } = useCompletedTopicSlugs();
  const { selectedLens } = useLens();
  const { selectedObject, setSelectedObject } = useKnowledgeSelection();
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [knowledgeLayerFilter, setKnowledgeLayerFilter] = useState<KnowledgeLayer | "all">("all");
  const [breadcrumbFocusActive, setBreadcrumbFocusActive] = useState(false);
  const completedTopics = new Set(completedTopicSlugs);

  useEffect(() => {
    const trackSlug = selectedObject?.meta?.trackSlug?.toString() ?? selectedObject?.topic?.track.slug;
    const subjectSlug = selectedObject?.meta?.subjectSlug?.toString() ?? selectedObject?.topic?.subject.slug;
    const moduleSlug = selectedObject?.meta?.moduleSlug?.toString() ?? selectedObject?.topic?.module.slug;

    if (!trackSlug && !subjectSlug && !moduleSlug) return;

    if (trackSlug) {
      setExpandedTracks((current) => new Set(current).add(trackSlug));
    }
    if (subjectSlug) {
      setExpandedSubjects((current) => new Set(current).add(subjectSlug));
    }
    if (moduleSlug) {
      setExpandedModules((current) => new Set(current).add(moduleSlug));
    }
    if (selectedObject?.meta?.focusFromBreadcrumb) {
      setBreadcrumbFocusActive(true);
      setSearchQuery(selectedObject.title);
    }
  }, [selectedObject]);

  if (isLoading) {
    return <div className="rounded-3xl border bg-card/70 p-8 text-muted-foreground">Loading LiveMap...</div>;
  }

  if (!syllabus) {
    return <div className="rounded-3xl border bg-card/70 p-8 text-muted-foreground">No knowledge map found.</div>;
  }

  // Keep Optional topics so parent rows can show ⚪ bubbles from immediate children.
  const visibleTracks = filterTracksByKnowledgeLayer(
    filterTracks(syllabus.tracks, searchQuery),
    knowledgeLayerFilter,
  );
  const overviewTopics = flattenSyllabusTopics(syllabus);
  const relevanceCounts = countRelevance(overviewTopics, selectedLens);
  const totalLearningTime = totalLearningHours(overviewTopics);
  const radarActiveCount = overviewTopics.filter((topic) => topic.is_radar).length;
  const hasSearch = searchQuery.trim().length > 0;
  const shouldForceExpandSearchResults = hasSearch && !breadcrumbFocusActive;
  const allExpanded = expandedTracks.size > 0 && expandedSubjects.size > 0 && expandedModules.size > 0;

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedTracks(new Set());
      setExpandedSubjects(new Set());
      setExpandedModules(new Set());
      return;
    }

    setExpandedTracks(new Set(syllabus.tracks.map((track) => track.slug)));
    setExpandedSubjects(new Set(syllabus.tracks.flatMap((track) => track.subjects.map((subject) => subject.slug))));
    setExpandedModules(new Set(syllabus.tracks.flatMap((track) => track.subjects.flatMap((subject) => subject.modules.map((module) => module.slug)))));
  };

  return (
    <div className="space-y-2">
      <section className="sr-card p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-bold tracking-tight">LiveMap</p>
            <p className="text-xs text-muted-foreground">The complete AI syllabus mapped to your goals.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><ListTree className="h-4 w-4" /></button>
            <button className="rounded-lg border border-violet-100 bg-white px-3 py-2 text-xs font-medium" onClick={toggleExpandAll}>
              {allExpanded ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-slate-600">{selectedLens} Lens:</span>
          <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="font-medium text-slate-700">{relevanceCounts.Must.toLocaleString()} Must</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="font-medium text-slate-700">{relevanceCounts.Good.toLocaleString()} Good</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-300 ring-1 ring-slate-400/40" />
              <span className="font-medium text-slate-700">{relevanceCounts.Optional.toLocaleString()} Optional</span>
            </span>
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          <MapStat icon={<Layers3 />} value={overviewTopics.length.toLocaleString()} label="Total Topics" />
          <MapStat icon={<ShieldCheck />} value={relevanceCounts.Must.toLocaleString()} label="Must Learn" />
          <MapStat icon={<Clock />} value={`${totalLearningTime.toLocaleString()}h`} label="Total Learning" />
          <MapStat icon={<Radar />} value={radarActiveCount.toLocaleString()} label="Radar Active" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-1.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="h-8 min-w-[140px] flex-1 bg-transparent text-xs outline-none"
            placeholder="Search in LiveMap..."
            value={searchQuery}
            onChange={(event) => {
              setBreadcrumbFocusActive(false);
              setSearchQuery(event.target.value);
            }}
          />
          <Select
            value={knowledgeLayerFilter}
            onValueChange={(value) => setKnowledgeLayerFilter(value as KnowledgeLayer | "all")}
          >
            <SelectTrigger className="h-8 w-[200px] border-violet-100 bg-violet-50/60 text-[11px] font-medium shadow-none">
              <SelectValue placeholder="Knowledge Layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Knowledge Layers</SelectItem>
              {KNOWLEDGE_LAYERS.map((layer) => (
                <SelectItem key={layer} value={layer}>
                  {layer}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-medium text-slate-600">
            {hasSearch || knowledgeLayerFilter !== "all" ? `${visibleTracks.length} branches` : "All Topics"}
          </span>
        </div>
      </section>

      <div className="space-y-2">
        {visibleTracks.length === 0 ? (
          <div className="rounded-3xl border bg-card/70 p-8 text-muted-foreground">
            No matching topics found for this search or Knowledge Layer.
          </div>
        ) : (
          visibleTracks.map((track) => {
            const isExpanded = shouldForceExpandSearchResults || expandedTracks.has(track.slug);
            const trackTopics = topicsForTrack(track);
            return (
              <Card
                key={track.id}
                className="overflow-hidden rounded-xl border-violet-100 bg-white shadow-[0_8px_24px_-22px_rgba(87,63,191,0.45)]"
              >
                <button
                  className="flex w-full items-center gap-2 p-2.5 text-left transition-colors hover:bg-violet-50/40"
                  onClick={() => {
                    toggleSet(expandedTracks, setExpandedTracks, track.slug);
                    setSelectedObject(trackSelection(track, selectedLens));
                  }}
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
                    <Layers3 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{track.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {countTrackTopics(track)} topics · {totalLearningHours(trackTopics)} hours
                    </p>
                  </div>
                  <CompletionProgress
                    completed={countCompletedTrack(track, completedTopics)}
                    total={countTrackTopics(track)}
                  />
                  <RelevanceBubbles categories={bubblesForTrack(track, selectedLens)} />
                </button>

                {isExpanded && (
                  <CardContent className="space-y-1.5 border-t bg-violet-50/20 p-2">
                    {track.subjects.map((subject) => (
                      <SubjectNode
                        key={subject.id}
                        track={track}
                        subject={subject}
                        expandedSubjects={expandedSubjects}
                        setExpandedSubjects={setExpandedSubjects}
                        expandedModules={expandedModules}
                        setExpandedModules={setExpandedModules}
                        completedTopics={completedTopics}
                        forceExpanded={shouldForceExpandSearchResults}
                        selectedLens={selectedLens}
                      />
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function SubjectNode({
  track,
  subject,
  expandedSubjects,
  setExpandedSubjects,
  expandedModules,
  setExpandedModules,
  completedTopics,
  forceExpanded,
  selectedLens,
}: {
  track: Track;
  subject: Subject;
  expandedSubjects: Set<string>;
  setExpandedSubjects: (value: Set<string>) => void;
  expandedModules: Set<string>;
  setExpandedModules: (value: Set<string>) => void;
  completedTopics: Set<string>;
  forceExpanded?: boolean;
  selectedLens: string;
}) {
  const { setSelectedObject } = useKnowledgeSelection();
  const isExpanded = Boolean(forceExpanded) || expandedSubjects.has(subject.slug);
  const topicCount = countSubjectTopics(subject);
  const subjectTopics = topicsForSubject(subject);
  const relevance = relevancePercent(subjectTopics, selectedLens);

  return (
    <div className="rounded-xl border border-violet-100 bg-white">
      <button
        className="flex w-full items-center gap-2 p-2 text-left hover:bg-violet-50/40"
        onClick={() => {
          toggleSet(expandedSubjects, setExpandedSubjects, subject.slug);
          setSelectedObject({
            type: "subject",
            id: subject.id,
            title: subject.title,
            subtitle: track.title,
            meta: {
              coursePath: coursePathForTopic(firstTopicInSubject(subject)),
              learningTime: `${totalLearningHours(subjectTopics)} hours`,
              topics: topicCount,
              relevance,
            },
          });
        }}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <BookOpen className="h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{subject.title}</p>
          <p className="text-xs text-muted-foreground">
            {topicCount} topics · {totalLearningHours(subjectTopics)} hours · Relevance {relevance}%
          </p>
        </div>
        <CompletionProgress
          completed={countCompletedSubject(subject, completedTopics)}
          total={topicCount}
        />
        <RelevanceBubbles categories={bubblesForSubject(subject, selectedLens)} />
      </button>

      {isExpanded && (
        <div className="space-y-1.5 border-t p-2">
          {subject.modules.map((module) => (
            <ModuleNode
              key={module.id}
              track={track}
              subject={subject}
              module={module}
              expandedModules={expandedModules}
              setExpandedModules={setExpandedModules}
              completedTopics={completedTopics}
              forceExpanded={forceExpanded}
              selectedLens={selectedLens}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModuleNode({
  track,
  subject,
  module,
  expandedModules,
  setExpandedModules,
  completedTopics,
  forceExpanded,
  selectedLens,
}: {
  track: Track;
  subject: Subject;
  module: Module;
  expandedModules: Set<string>;
  setExpandedModules: (value: Set<string>) => void;
  completedTopics: Set<string>;
  forceExpanded?: boolean;
  selectedLens: string;
}) {
  const { setSelectedObject } = useKnowledgeSelection();
  const isExpanded = Boolean(forceExpanded) || expandedModules.has(module.slug);
  const relevance = relevancePercent(module.topics, selectedLens);

  return (
    <div className="rounded-lg border border-violet-100 bg-white">
      <button
        className="flex w-full items-center gap-2 p-2 text-left hover:bg-violet-50/40"
        onClick={() => {
          toggleSet(expandedModules, setExpandedModules, module.slug);
          setSelectedObject({
            type: "module",
            id: module.id,
            title: module.title,
            subtitle: `${track.title} / ${subject.title}`,
            meta: {
              coursePath: coursePathForTopic(module.topics[0]),
              learningTime: `${totalLearningHours(module.topics)} hours`,
              topics: module.topics.length,
              relevance,
            },
          });
        }}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
        <Boxes className="h-4 w-4 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{module.title}</p>
          <p className="text-xs text-muted-foreground">
            {module.topics.length} topics · {totalLearningHours(module.topics)} hours · Relevance {relevance}%
          </p>
        </div>
        <CompletionProgress
          completed={countCompletedModule(module, completedTopics)}
          total={module.topics.length}
        />
        <RelevanceBubbles categories={bubblesForModule(module, selectedLens)} />
      </button>

      {isExpanded && (
        <div className="space-y-1 border-t p-1.5">
          {module.topics.map((topic) => (
            <TopicNode
              key={topic.id}
              track={track}
              subject={subject}
              module={module}
              topic={topic}
              completed={completedTopics.has(topic.slug)}
              selectedLens={selectedLens}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicNode({
  track,
  subject,
  module,
  topic,
  completed,
  selectedLens,
}: {
  track: Track;
  subject: Subject;
  module: Module;
  topic: Topic;
  completed: boolean;
  selectedLens: string;
}) {
  const { setSelectedObject } = useKnowledgeSelection();
  const relevance = topicRelevance(topic, selectedLens);
  const learningTime = formatLearningTime(topic.learning_time);

  return (
    <button
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-violet-50/50"
      onClick={() =>
        setSelectedObject({
          type: "topic",
          id: topic.id,
          title: topic.title,
          subtitle: `${track.title} / ${subject.title} / ${module.title}`,
          topic: {
            ...topic,
            track: { title: track.title, slug: track.slug },
            subject: { title: subject.title, slug: subject.slug },
            module: { title: module.title, slug: module.slug },
          },
          meta: { coursePath: coursePathForTopic(topic), learningTime, importance: relevance },
        })
      }
    >
      {completed ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{topic.title}</span>
      <CompletionProgress completed={completed ? 1 : 0} total={1} compact />
      <RelevanceBubbles categories={[relevance]} />
      <span className="hidden text-[10px] text-muted-foreground sm:inline">{learningTime}</span>
    </button>
  );
}

function trackSelection(track: Track, selectedLens: string) {
  const topicCount = countTrackTopics(track);
  const topics = topicsForTrack(track);
  return {
    type: "track" as const,
    id: track.id,
    title: track.title,
    subtitle: "Track",
    meta: {
      coursePath: coursePathForTopic(firstTopicInTrack(track)),
      learningTime: `${totalLearningHours(topics)} hours`,
      topics: topicCount,
      relevance: relevancePercent(topics, selectedLens),
    },
  };
}

function MapStat({ icon, value, label }: { icon: ReactElement; value: string | number; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-50 text-primary">{icon}</span>
      <span>
        <span className="block text-sm font-bold">{value}</span>
        <span className="block text-[10px] text-muted-foreground">{label}</span>
      </span>
    </div>
  );
}

function LensKey({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-white px-2 py-1">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function bubblesForTrack(track: Track, lens: string): RelevanceCategory[] {
  return track.subjects.map((subject) => summarizeBranchRelevance(topicsForSubject(subject), lens));
}

function bubblesForSubject(subject: Subject, lens: string): RelevanceCategory[] {
  return subject.modules.map((module) => summarizeBranchRelevance(module.topics, lens));
}

function bubblesForModule(module: Module, lens: string): RelevanceCategory[] {
  return module.topics.map((topic) => topicRelevance(topic, lens));
}

function RelevanceBubbles({ categories }: { categories: RelevanceCategory[] }) {
  if (categories.length === 0) return null;

  const sorted = sortRelevanceBubbles(categories);
  const title = relevanceBubbleTitle(sorted);

  return (
    <div
      className="hidden max-w-[9.5rem] flex-wrap justify-end gap-0.5 sm:flex"
      title={title}
      aria-label={title}
    >
      {sorted.map((category, index) => (
        <span
          key={`${category}-${index}`}
          className={`h-2 w-2 shrink-0 rounded-full ${
            category === "Optional" ? "bg-slate-200 ring-1 ring-slate-400/50" : relevanceColor(category)
          }`}
        />
      ))}
    </div>
  );
}

function filterTracksByKnowledgeLayer(tracks: Track[], layer: KnowledgeLayer | "all"): Track[] {
  if (layer === "all") return tracks;

  return tracks
    .map((track) => ({
      ...track,
      subjects: track.subjects
        .map((subject) => ({
          ...subject,
          modules: subject.modules
            .map((module) => ({
              ...module,
              topics: module.topics.filter((topic) => topicKnowledgeLayer(topic) === layer),
            }))
            .filter((module) => module.topics.length > 0),
        }))
        .filter((subject) => subject.modules.length > 0),
    }))
    .filter((track) => track.subjects.length > 0);
}

function filterTracks(tracks: Track[], query: string): Track[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return tracks;

  return tracks.flatMap((track) => {
    if (matchesQuery(track.title, normalizedQuery)) return [track];

    const subjects = track.subjects.flatMap((subject) => {
      if (matchesQuery(subject.title, normalizedQuery)) return [subject];

      const modules = subject.modules.flatMap((module) => {
        if (matchesQuery(module.title, normalizedQuery)) return [module];
        const topics = module.topics.filter((topic) => matchesQuery(topic.title, normalizedQuery) || matchesQuery(topic.summary, normalizedQuery));
        return topics.length ? [{ ...module, topics }] : [];
      });

      return modules.length ? [{ ...subject, modules }] : [];
    });

    return subjects.length ? [{ ...track, subjects }] : [];
  });
}

function matchesQuery(value: string | undefined, query: string) {
  return Boolean(value?.toLowerCase().includes(query));
}

function toggleSet(current: Set<string>, setNext: (value: Set<string>) => void, key: string) {
  const next = new Set(current);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  setNext(next);
}

function countTrackTopics(track: Track) {
  return track.subjects.reduce((sum, subject) => sum + countSubjectTopics(subject), 0);
}

function countSubjectTopics(subject: Subject) {
  return subject.modules.reduce((sum, module) => sum + module.topics.length, 0);
}

function topicsForTrack(track: Track) {
  return track.subjects.flatMap(topicsForSubject);
}

function topicsForSubject(subject: Subject) {
  return subject.modules.flatMap((module) => module.topics);
}

function firstTopicInTrack(track: Track) {
  for (const subject of track.subjects) {
    const topic = firstTopicInSubject(subject);
    if (topic) return topic;
  }
  return undefined;
}

function firstTopicInSubject(subject: Subject) {
  for (const module of subject.modules) {
    if (module.topics[0]) return module.topics[0];
  }
  return undefined;
}

function coursePathForTopic(topic?: Topic) {
  return topic ? `/topics/${topic.slug}` : "/livemap";
}

function countCompletedTrack(track: Track, completedTopics: Set<string>) {
  return track.subjects.reduce((sum, subject) => sum + countCompletedSubject(subject, completedTopics), 0);
}

function countCompletedSubject(subject: Subject, completedTopics: Set<string>) {
  return subject.modules.reduce((sum, module) => sum + countCompletedModule(module, completedTopics), 0);
}

function countCompletedModule(module: Module, completedTopics: Set<string>) {
  return module.topics.filter((topic) => completedTopics.has(topic.slug)).length;
}

function CompletionProgress({
  completed,
  total,
  compact = false,
}: {
  completed: number;
  total: number;
  compact?: boolean;
}) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  if (compact) {
    return (
      <div className="hidden w-20 lg:block" title={`${percent}% complete`}>
        <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden w-28 shrink-0 lg:block">
      <div className="mb-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>Completed</span>
        <span className="font-medium text-slate-600">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
