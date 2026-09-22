import type { ReactNode } from "react";
import { useLens } from "@/contexts/LensContext";
import { useSyllabus } from "@/hooks/useSyllabus";
import { useProgress, useSyncScoreOverview } from "@/hooks/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  Flame,
  Layers3,
  Sparkles,
  Trophy,
} from "lucide-react";

function formatSyncScoreLabel(syncScore?: { syncScore: number; importantTopics: number; completedTopics: number }, hasProgress?: boolean) {
  if (!syncScore || syncScore.importantTopics === 0 || !hasProgress) return "Not assessed";
  return `${syncScore.syncScore}%`;
}

export function MyContextSidebar() {
  const { selectedLens, lenses, setSelectedLens } = useLens();
  const { data: syncScore } = useSyncScoreOverview(selectedLens);
  const { data: progress = [] } = useProgress();
  const { data: syllabus } = useSyllabus();
  const totalTopics = syllabus?.tracks.reduce(
    (trackSum, track) =>
      trackSum + track.subjects.reduce(
        (subjectSum, subject) => subjectSum + subject.modules.reduce((moduleSum, module) => moduleSum + module.topics.length, 0),
        0,
      ),
    0,
  ) ?? 0;
  const progressPercent = totalTopics === 0 ? 0 : Math.round((progress.length / totalTopics) * 100);
  const learningHours = Math.max(0, Math.round(progress.length * 0.75));
  const syncScoreLabel = formatSyncScoreLabel(syncScore, progress.length > 0);

  return (
    <aside className="hidden xl:flex w-[184px] shrink-0 flex-col gap-2">
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
          <StatRow icon={<Trophy className="h-3.5 w-3.5" />} label="Sync Score" value={syncScoreLabel} />
          <StatRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Progress" value={`${progressPercent}%`} percent={progressPercent} />
          <StatRow icon={<Clock className="h-3.5 w-3.5" />} label="Learning Time" value={`${learningHours}h`} />
          <StatRow icon={<Flame className="h-3.5 w-3.5" />} label="Current Streak" value="12 days" />
        </div>
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

function StatRow({ icon, label, value, delta, percent }: { icon: ReactNode; label: string; value: string; delta?: string; percent?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="flex items-center gap-2 text-slate-600">
          <span className="text-primary">{icon}</span>
          {label}
        </span>
        <span className="font-semibold">
          {value} {delta && <span className="text-emerald-600">{delta}</span>}
        </span>
      </div>
      {typeof percent === "number" && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-violet-100">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
        </div>
      )}
    </div>
  );
}
