import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { ChevronDown, SlidersHorizontal } from "lucide-react";

function hasActiveAdvancedFilters(
  priority: RadarPriorityFilter,
  source: RadarSourceFilter,
  timeRange: RadarTimeRange,
) {
  return priority !== "all" || source !== "all" || timeRange !== "week";
}

export function RadarAdvancedFilters({ variant = "inline" }: { variant?: "inline" | "header" }) {
  const { filters, setPriority, setSource, setTimeRange } = useRadarFilters();
  const isActive = hasActiveAdvancedFilters(filters.priority, filters.source, filters.timeRange);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={
            variant === "header"
              ? "h-9 gap-1.5 rounded-lg border-violet-100 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
              : "h-7 gap-1.5 rounded-full border-violet-100 px-2.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          }
        >
          {variant === "header" ? null : <SlidersHorizontal className="h-3 w-3" />}
          Filter
          <ChevronDown className="h-3.5 w-3.5" />
          {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 space-y-3 border-violet-100 p-3">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Filters</p>
        <FilterField label="Priority">
          <Select value={filters.priority} onValueChange={(v) => setPriority(v as RadarPriorityFilter)}>
            <SelectTrigger className="h-8 text-xs">
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
        <FilterField label="Source">
          <Select value={filters.source} onValueChange={(v) => setSource(v as RadarSourceFilter)}>
            <SelectTrigger className="h-8 text-xs">
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
        <FilterField label="Time">
          <Select value={filters.timeRange} onValueChange={(v) => setTimeRange(v as RadarTimeRange)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </PopoverContent>
    </Popover>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
