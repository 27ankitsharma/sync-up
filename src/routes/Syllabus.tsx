import { useState } from "react";
import { useTopics, useFilterOptions } from "@/hooks/useSanity";
import { TopicCard } from "@/components/TopicCard";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";
import type { Filters } from "@/lib/types";

const ALL = "__all__";

export default function Syllabus() {
  const [filters, setFilters] = useState<Filters>({});
  const { data: topics, isLoading, isError } = useTopics(filters);
  const { data: options } = useFilterOptions();

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === ALL ? undefined : value,
    }));
  };

  const clearFilters = () => setFilters({});
  const hasFilters = filters.role || filters.difficulty || filters.layer;

  // Group topics by Track → Subject → Module
  const grouped = (topics || []).reduce<Record<string, Record<string, Record<string, typeof topics>>>>((acc, topic) => {
    if (!acc[topic.track]) acc[topic.track] = {};
    if (!acc[topic.track][topic.subject]) acc[topic.track][topic.subject] = {};
    if (!acc[topic.track][topic.subject][topic.module]) acc[topic.track][topic.subject][topic.module] = [];
    acc[topic.track][topic.subject][topic.module]!.push(topic);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Syllabus</h1>
        <p className="text-muted-foreground mt-1">Browse all topics, filtered by role, difficulty, or layer.</p>
      </div>

      {/* Hierarchy legend */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
        <span className="px-2 py-1 rounded bg-primary/10 text-primary">Track</span>
        <ChevronRight className="h-3 w-3" />
        <span className="px-2 py-1 rounded bg-secondary">Subject</span>
        <ChevronRight className="h-3 w-3" />
        <span className="px-2 py-1 rounded bg-accent">Module</span>
        <ChevronRight className="h-3 w-3" />
        <span className="px-2 py-1 rounded bg-muted">Topic</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.role || ALL} onValueChange={(v) => updateFilter("role", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Roles</SelectItem>
            {options?.roles.map((r) => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.difficulty || ALL} onValueChange={(v) => updateFilter("difficulty", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Levels</SelectItem>
            {options?.difficulties.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.layer || ALL} onValueChange={(v) => updateFilter("layer", v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Layer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Layers</SelectItem>
            {options?.layers.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading && <GridSkeleton />}

      {isError && (
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          description="We couldn't load the syllabus. Please try again later."
        />
      )}

      {!isLoading && !isError && topics?.length === 0 && (
        hasFilters ? (
          <EmptyState
            icon="🔍"
            title="No topics match your filters"
            description="Try adjusting or clearing your filters to see more topics."
          />
        ) : (
          <EmptyState
            icon="📭"
            title="No topics available yet"
            description="Topics will appear here once they're published in the CMS."
          />
        )
      )}

      {!isLoading && topics && topics.length > 0 && (
        <div className="space-y-3">
          {Object.entries(grouped).map(([track, subjects]) => (
            <TreeTrack key={track} track={track} subjects={subjects} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Track level (outermost) ─── */
function TreeTrack({
  track,
  subjects,
}: {
  track: string;
  subjects: Record<string, Record<string, any[]>>;
}) {
  const [open, setOpen] = useState(true);
  const topicCount = Object.values(subjects).flatMap((m) => Object.values(m).flat()).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/15 hover:bg-primary/10 transition-colors">
          <ChevronRight className={`h-4 w-4 text-primary shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          <span className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
          <span className="text-lg font-bold text-foreground text-left flex-1">{track}</span>
          <span className="text-xs text-muted-foreground font-medium">{topicCount} topic{topicCount !== 1 ? "s" : ""}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 pl-4 border-l-2 border-primary/15 mt-1 space-y-2">
          {Object.entries(subjects).map(([subject, modules]) => (
            <TreeSubject key={subject} subject={subject} modules={modules} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─── Subject level ─── */
function TreeSubject({
  subject,
  modules,
}: {
  subject: string;
  modules: Record<string, any[]>;
}) {
  const [open, setOpen] = useState(true);
  const topicCount = Object.values(modules).flat().length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors">
          <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-semibold text-foreground text-left flex-1">{subject}</span>
          <span className="text-xs text-muted-foreground">{topicCount}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 pl-3 border-l border-border mt-1 space-y-1.5">
          {Object.entries(modules).map(([mod, modTopics]) => (
            <TreeModule key={mod} module={mod} topics={modTopics} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─── Module level ─── */
function TreeModule({
  module: mod,
  topics,
}: {
  module: string;
  topics: any[];
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="w-full group">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded bg-accent/50 hover:bg-accent transition-colors">
          <ChevronRight className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
          <span className="text-sm font-medium text-foreground text-left flex-1">{mod}</span>
          <span className="text-xs text-muted-foreground">{topics.length}</span>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-4 pl-3 border-l border-border/50 mt-1.5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic, i) => (
              <TopicCard key={topic._id} topic={topic} index={i} />
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
