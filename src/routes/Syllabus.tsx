import { useState } from "react";
import { useTopics, useFilterOptions } from "@/hooks/useSanity";
import { TopicCard } from "@/components/TopicCard";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
        <div className="space-y-10">
          {Object.entries(grouped).map(([track, subjects]) => (
            <section key={track}>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {track}
              </h2>
              {Object.entries(subjects).map(([subject, modules]) => (
                <div key={subject} className="ml-4 mb-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {subject}
                  </h3>
                  {Object.entries(modules).map(([mod, modTopics]) => (
                    <div key={mod} className="ml-4 mb-4">
                      <h4 className="text-sm font-medium text-foreground mb-2">{mod}</h4>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {(modTopics as any[]).map((topic, i) => (
                          <TopicCard key={topic._id} topic={topic} index={i} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
