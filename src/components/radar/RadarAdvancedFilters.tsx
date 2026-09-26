import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRadarFilters } from "@/contexts/RadarFilterContext";
import type {
  RadarPriorityFilter,
  RadarSourceFilter,
  RadarTimeRange,
} from "@/types/radarDiscovery";
import { Clock3, Database, Flag } from "lucide-react";

export function RadarAdvancedFilters() {
  const { filters, setPriority, setSource, setTimeRange } = useRadarFilters();

  return (
    <div className="space-y-3">
      <FilterField label="Priority" icon={<Flag className="h-3 w-3" />} tone="amber">
        <Select value={filters.priority} onValueChange={(v) => setPriority(v as RadarPriorityFilter)}>
          <SelectTrigger className="h-8 border-amber-200 bg-white/80 text-xs text-amber-900" aria-label="Priority filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="Source" icon={<Database className="h-3 w-3" />} tone="sky">
        <Select value={filters.source} onValueChange={(v) => setSource(v as RadarSourceFilter)}>
          <SelectTrigger className="h-8 border-sky-200 bg-white/80 text-xs text-sky-900" aria-label="Source filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paper">Papers</SelectItem>
            <SelectItem value="blog">Blogs</SelectItem>
            <SelectItem value="github">GitHub</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="lab">AI Labs</SelectItem>
            <SelectItem value="documentation">Docs</SelectItem>
            <SelectItem value="industry">Industry</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="Time" icon={<Clock3 className="h-3 w-3" />} tone="violet">
        <Select value={filters.timeRange} onValueChange={(v) => setTimeRange(v as RadarTimeRange)}>
          <SelectTrigger className="h-8 border-violet-200 bg-white/80 text-xs text-violet-900" aria-label="Time filter">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
    </div>
  );
}

function FilterField({
  label,
  icon,
  tone,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  tone: "amber" | "sky" | "violet";
  children: React.ReactNode;
}) {
  const toneClass = {
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    sky: "border-sky-100 bg-sky-50 text-sky-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
  }[tone];
  return (
    <div className={`space-y-1.5 rounded-lg border p-2 ${toneClass}`}>
      <Label className="flex items-center gap-1.5 text-[10px] font-semibold">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
