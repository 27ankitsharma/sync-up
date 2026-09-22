import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { GridSkeleton } from "@/components/LoadingSkeleton";
import { RadarDiscoveryCard } from "@/components/radar/RadarDiscoveryCard";
import { RadarHeader } from "@/components/radar/RadarHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRadarSelection } from "@/contexts/RadarSelectionContext";
import { useLens } from "@/contexts/LensContext";
import { useRadarDiscoveries } from "@/hooks/useRadarDiscoveries";
import { sourceTypeLabel } from "@/lib/radarDiscoveryUtils";
import type { RadarDiscovery } from "@/types/radarDiscovery";
import { ChevronDown } from "lucide-react";

const INITIAL_VISIBLE = 5;

export default function Radar() {
  const { selectedLens } = useLens();
  const { selectedDiscovery, selectDiscovery, registerReviewHandler } = useRadarSelection();
  const { discoveries, stats, isLoading, isError } = useRadarDiscoveries();
  const [reviewDiscovery, setReviewDiscovery] = useState<RadarDiscovery | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    registerReviewHandler(setReviewDiscovery);
    return () => registerReviewHandler(null);
  }, [registerReviewHandler]);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [discoveries]);

  const visibleDiscoveries = useMemo(
    () => discoveries.slice(0, visibleCount),
    [discoveries, visibleCount],
  );
  const hasMore = visibleCount < discoveries.length;

  const handlePrimaryAction = (discovery: RadarDiscovery) => {
    selectDiscovery(discovery);
    if (discovery.classification === "new_topic_candidate") {
      setReviewDiscovery(discovery);
    }
  };

  return (
    <div className="flex min-h-0 flex-col">
      <RadarHeader total={stats.total} />

      <div className="flex-1 space-y-3">
        {isLoading && <GridSkeleton count={4} />}

        {isError && (
          <EmptyState
            icon="⚠️"
            title="Radar unavailable"
            description="We couldn't load Radar discoveries right now. Please try again later."
          />
        )}

        {!isLoading && !isError && discoveries.length === 0 && (
          <EmptyState
            icon="📡"
            title="Your Radar is warming up"
            description="No AI developments relevant to your lens have been detected in this time range yet."
          />
        )}

        {!isLoading && !isError && visibleDiscoveries.map((discovery) => (
          <RadarDiscoveryCard
            key={discovery.id}
            discovery={discovery}
            selected={selectedDiscovery?.id === discovery.id}
            selectedLens={selectedLens}
            onSelect={selectDiscovery}
            onPrimaryAction={handlePrimaryAction}
          />
        ))}

        {!isLoading && !isError && hasMore && (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1 py-3 text-xs font-semibold text-primary hover:text-primary/80"
            onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE)}
          >
            Load more
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      <Dialog open={Boolean(reviewDiscovery)} onOpenChange={(open) => !open && setReviewDiscovery(null)}>
        <DialogContent className="max-w-lg">
          {reviewDiscovery && (
            <>
              <DialogHeader>
                <DialogTitle>Review New Topic Candidate</DialogTitle>
                <DialogDescription>
                  Radar identified a genuinely new concept. Human review is required before it can enter LiveMap.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Discovery</p>
                  <p className="mt-1 font-semibold">{reviewDiscovery.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Why it may be new</p>
                  <p className="mt-1 text-muted-foreground">{reviewDiscovery.reason}</p>
                </div>
                {reviewDiscovery.suggestedPlacement && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Potential placement</p>
                    <p className="mt-1">{reviewDiscovery.suggestedPlacement}</p>
                  </div>
                )}
                {reviewDiscovery.knowledgeLayer && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Proposed Knowledge Layer</p>
                    <p className="mt-1">{reviewDiscovery.knowledgeLayer}</p>
                  </div>
                )}
                {reviewDiscovery.placementRationale && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Placement rationale</p>
                    <p className="mt-1 text-muted-foreground">{reviewDiscovery.placementRationale}</p>
                  </div>
                )}
                {reviewDiscovery.relatedTopicSlugs && reviewDiscovery.relatedTopicSlugs.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Related existing topics</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {reviewDiscovery.relatedTopicSlugs.map((slug) => (
                        <Link key={slug} to={`/topics/${slug}`} target="_blank" rel="noreferrer" className="rounded-lg bg-violet-50 px-2 py-1 text-xs text-primary">
                          {slug}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {reviewDiscovery.sources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Sources</p>
                    <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                      {reviewDiscovery.sources.map((source) => (
                        <li key={`${source.type}-${source.url}`}>{sourceTypeLabel(source.type)} · {source.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
