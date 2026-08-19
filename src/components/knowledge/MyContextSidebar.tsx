import type { ReactNode } from "react";
import { useLens } from "@/contexts/LensContext";
import { useSyllabus } from "@/hooks/useSyllabus";
import { useProgress, useSyncScoreOverview, useUserProfile } from "@/hooks/useUser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bookmark,
  Calendar,
  Clock,
  Download,
  Flame,
  Folder,
  Layers3,
  NotebookText,
  Share2,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

const filters = ["Importance", "Difficulty", "Learning Time", "Status"];
const workspace = [
  ["Bookmarks", "24", <Bookmark className="h-3.5 w-3.5" />],
  ["Collections", "8", <Folder className="h-3.5 w-3.5" />],
  ["Notes", "16", <NotebookText className="h-3.5 w-3.5" />],
  ["Recent", "12", <Clock className="h-3.5 w-3.5" />],
  ["Downloads", "5", <Download className="h-3.5 w-3.5" />],
] as const;

export function MyContextSidebar() {
  const { data: profile } = useUserProfile();
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
        <div className="mt-3">
          <p className="text-[10px] text-muted-foreground">Current Goal</p>
          <p className="mt-1 text-xs font-semibold">Become {selectedLens}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-violet-100">
            <div className="h-full w-3/5 rounded-full bg-primary" />
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{profile?.experience || "Intermediate"}</span>
            <span>Target: Dec 2026</span>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Filters</PanelTitle>
        <div className="space-y-2">
          {filters.map((filter) => (
            <SidebarRow key={filter} icon={<Target className="h-3.5 w-3.5" />} label={filter} value="All" />
          ))}
          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Updated this month
            </span>
            <span className="h-4 w-7 rounded-full bg-primary p-0.5">
              <span className="block h-3 w-3 translate-x-3 rounded-full bg-white" />
            </span>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelTitle>My Workspace</PanelTitle>
        <div className="space-y-2">
          {workspace.map(([label, value, icon]) => (
            <SidebarRow key={label} icon={icon} label={label} value={value} />
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelTitle>My Stats</PanelTitle>
        <div className="space-y-3">
          <StatRow icon={<Trophy className="h-3.5 w-3.5" />} label="Sync Score" value={`${syncScore?.syncScore ?? 87}%`} />
          <StatRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Progress" value={`${progressPercent}%`} percent={progressPercent} />
          <StatRow icon={<Clock className="h-3.5 w-3.5" />} label="Learning Time" value={`${learningHours}h`} />
          <StatRow icon={<Flame className="h-3.5 w-3.5" />} label="Current Streak" value="12 days" />
        </div>
      </Panel>

      <Panel>
        <PanelTitle>Quick Actions</PanelTitle>
        <div className="space-y-2">
          <SidebarRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Ask AI" />
          <SidebarRow icon={<Folder className="h-3.5 w-3.5" />} label="Create Collection" />
          <SidebarRow icon={<Share2 className="h-3.5 w-3.5" />} label="Share Context" />
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

function SidebarRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-2 text-[11px]">
      <span className="flex min-w-0 items-center gap-2 text-slate-600">
        <span className="text-slate-500">{icon}</span>
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 text-slate-500">{value ?? ""}</span>
    </div>
  );
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
