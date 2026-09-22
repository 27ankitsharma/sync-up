import { useRadarFilters } from "@/contexts/RadarFilterContext";
import { RadarAdvancedFilters } from "@/components/radar/RadarAdvancedFilters";
import type { RadarFeedTab, RadarTimeRange } from "@/types/radarDiscovery";
import { Info, LayoutGrid, RefreshCw, Sparkles, Sprout } from "lucide-react";

const feedTabs: { id: RadarFeedTab; label: string; icon: typeof Sparkles }[] = [
  { id: "for_you", label: "For You", icon: Sparkles },
  { id: "new_candidates", label: "New Topics", icon: Sprout },
  { id: "existing_updates", label: "Topic Updates", icon: RefreshCw },
  { id: "fyi", label: "FYI", icon: Info },
  { id: "all", label: "All", icon: LayoutGrid },
];

function timeRangeLabel(range: RadarTimeRange) {
  if (range === "today") return "Today";
  if (range === "week") return "This week";
  return "This month";
}

export function RadarHeader({ total }: { total: number }) {
  const { filters, setFeedTab } = useRadarFilters();

  return (
    <header className="mb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Your Radar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">What changed in AI that matters to you.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            <span>{total} discoveries</span>
            <span className="mx-1.5">·</span>
            <span>{timeRangeLabel(filters.timeRange)}</span>
          </p>
        </div>
        <RadarAdvancedFilters variant="header" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {feedTabs.map(({ id, label, icon: Icon }) => {
          const active = filters.feedTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setFeedTab(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-violet-100 bg-white text-muted-foreground hover:border-violet-200 hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
