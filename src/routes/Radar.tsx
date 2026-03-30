import { useMemo } from "react";
import { useRadarTopics } from "@/hooks/useSanity";
import { TopicCard } from "@/components/TopicCard";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import type { Topic } from "@/lib/types";

export default function Radar() {
  const { data: topics, isLoading, isError } = useRadarTopics();

  const { newThisWeek, byLayer } = useMemo(() => {
    if (!topics) return { newThisWeek: [], byLayer: {} as Record<string, Topic[]> };

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recent: Topic[] = [];
    const rest: Record<string, Topic[]> = {};

    for (const topic of topics) {
      if (topic.lastUpdated && new Date(topic.lastUpdated) >= weekAgo) {
        recent.push(topic);
      }

      if (!rest[topic.layer]) rest[topic.layer] = [];
      rest[topic.layer].push(topic);
    }

    return { newThisWeek: recent, byLayer: rest };
  }, [topics]);

  return (
    <div className="space-y-10 bg-gradient-to-b from-background via-muted/10 to-background p-4 rounded-xl">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          AI Radar
        </h1>
        <p className="text-muted-foreground mt-1">
          What's moving in AI — new updates this week, grouped by layer.
        </p>
      </div>

      {/* Loading */}
      {isLoading && <GridSkeleton count={9} />}

      {/* Error */}
      {isError && (
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          description="We couldn't load the radar. Please try again later."
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && (!topics || topics.length === 0) && (
        <EmptyState
          icon="📡"
          title="No topics available yet"
          description="The radar will populate as topics are published."
        />
      )}

      {/* Content */}
      {!isLoading && topics && topics.length > 0 && (
        <>
          {/* New This Week */}
          {newThisWeek.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 to-primary/10 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  🆕 New This Week
                </h2>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {newThisWeek.length}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {newThisWeek.map((t, i) => (
                  <TopicCard key={t._id} topic={t} index={i} />
                ))}
              </div>
            </motion.section>
          )}

          {/* Grouped by Layer */}
          {Object.entries(byLayer).map(([layer, layerTopics]) => (
            <motion.section
              key={layer}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-xl border border-border/40 bg-gradient-to-br from-muted/40 to-muted/10 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  {layer}
                </h2>
                <span className="text-xs text-muted-foreground">
                  {layerTopics.length} topics
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {layerTopics.map((t, i) => (
                  <TopicCard key={t._id} topic={t} index={i} />
                ))}
              </div>
            </motion.section>
          ))}
        </>
      )}
    </div>
  );
}