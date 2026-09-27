import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RadarAdvancedFilters } from "@/components/radar/RadarAdvancedFilters";
import { useLens } from "@/contexts/LensContext";
import { useSyncMetrics } from "@/hooks/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Layers3,
  Radio,
  Sparkles,
} from "lucide-react";

export function MyContextSidebar() {
  const { selectedLens, lenses, setSelectedLens } = useLens();
  const { data: syncMetrics, isError } = useSyncMetrics(selectedLens);

  return (
    <aside className="sr-readable-panel hidden xl:flex w-[184px] shrink-0 flex-col gap-2">
      <Panel>
        <PanelTitle>My Context</PanelTitle>
        <div className="rounded-xl bg-violet-50 p-2">
          <p className="text-[10px] text-muted-foreground">Lens (Perspective)</p>
          <Select value={selectedLens} onValueChange={setSelectedLens}>
            <SelectTrigger className="mt-1 h-auto border-0 bg-transparent p-0 text-xs font-semibold text-primary shadow-none focus:ring-0 focus:ring-offset-0 [&>span]:line-clamp-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <Layers3 className="h-3.5 w-3.5 shrink-0" />
                <SelectValue />
              </span>
            </SelectTrigger>
            <SelectContent>
              {lenses.map((lens) => (
                <SelectItem key={lens} value={lens}>
                  {lens}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>My Stats</PanelTitle>
        <div className="space-y-3">
          <StatRow
            href="/livemap"
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="Knowledge Sync"
            value={metricLabel(syncMetrics?.knowledgeSync.percent, isError)}
            percent={syncMetrics?.knowledgeSync.percent}
            tone="indigo"
          />
          <StatRow
            href="/radar"
            icon={<Radio className="h-3.5 w-3.5" />}
            label="Radar Sync"
            value={metricLabel(syncMetrics?.radarSync.percent, isError)}
            percent={syncMetrics?.radarSync.percent}
            tone="emerald"
          />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Filters</PanelTitle>
        <RadarAdvancedFilters />
      </Panel>
    </aside>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-violet-100 bg-white p-3 shadow-[0_8px_28px_-24px_rgba(87,63,191,0.45)]">{children}</section>;
}

function PanelTitle({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">{children}</p>;
}

function StatRow({
  icon,
  label,
  value,
  percent,
  href,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  percent?: number | null;
  href: string;
  tone: "indigo" | "emerald";
}) {
  const content = (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className={`flex items-center gap-2 font-semibold ${tone === "indigo" ? "text-indigo-700" : "text-emerald-700"}`}>
          <span>{icon}</span>
          {label}
        </span>
        <span className={`font-bold ${tone === "indigo" ? "text-indigo-700" : "text-emerald-700"}`}>{value}</span>
      </div>
      {typeof percent === "number" && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-violet-100">
          <div
            className={`h-full rounded-full ${tone === "indigo" ? "bg-indigo-500" : "bg-emerald-500"}`}
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>
      )}
    </div>
  );
  return <Link to={href} className="block rounded-md hover:bg-slate-50">{content}</Link>;
}

function metricLabel(percent: number | null | undefined, isError: boolean) {
  if (isError || percent === null) return "Unavailable";
  if (percent === undefined) return "—";
  return `${percent}%`;
}
