import { Button } from "@/components/ui/button";
import {
  cardWhyItMatters,
  formatDiscoveredAt,
  lensRelevanceForDiscovery,
  primaryCtaLabel,
  sourceCount,
} from "@/lib/radarDiscoveryUtils";
import { relevanceLabel } from "@/lib/syllabusMetrics";
import type { RadarDiscovery } from "@/types/radarDiscovery";
import { ArrowRight, Flame } from "lucide-react";
import { feedPriorityBadge, RadarOutcomeIcon } from "@/components/radar/RadarOutcomeIcon";

export function RadarDiscoveryCard({
  discovery,
  selected,
  selectedLens,
  onSelect,
  onPrimaryAction,
}: {
  discovery: RadarDiscovery;
  selected?: boolean;
  selectedLens: string;
  onSelect: (discovery: RadarDiscovery) => void;
  onPrimaryAction: (discovery: RadarDiscovery) => void;
}) {
  const lensRelevance = lensRelevanceForDiscovery(discovery, selectedLens);
  const priorityBadge = feedPriorityBadge(discovery.priority);
  const sources = sourceCount(discovery);

  return (
    <article
      className={`sr-readable-panel relative rounded-xl border bg-white p-4 transition-all ${
        selected
          ? "border-primary shadow-[0_0_0_1px_hsl(var(--primary))]"
          : "border-violet-100 hover:border-violet-200 hover:shadow-sm"
      }`}
    >
      {priorityBadge && (
        <div
          className={`absolute right-4 top-4 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${priorityBadge.className}`}
        >
          {discovery.priority === "high" && <Flame className="h-3 w-3" />}
          {priorityBadge.label}
        </div>
      )}

      <div className="flex gap-3">
        <RadarOutcomeIcon classification={discovery.classification} size="sm" />

        <div className="min-w-0 flex-1 pr-24">
          <button type="button" className="w-full text-left" onClick={() => onSelect(discovery)}>
            <h3 className="text-sm font-bold leading-snug text-slate-900">{discovery.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 line-clamp-2">
              {cardWhyItMatters(discovery)}
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                {selectedLens}
              </span>
              {lensRelevance && (
                <span className="rounded-md bg-emerald-50/70 px-2 py-0.5 font-medium text-emerald-700">
                  {relevanceLabel(lensRelevance)}
                </span>
              )}
              <span className="text-muted-foreground">{formatDiscoveredAt(discovery.discoveredAt)}</span>
              {sources > 0 && (
                <span className="text-muted-foreground">
                  {sources} source{sources === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </button>

          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-lg border-violet-200 px-3 text-xs font-semibold text-primary hover:bg-violet-50"
              onClick={() => onPrimaryAction(discovery)}
            >
              {primaryCtaLabel(discovery.classification)}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
