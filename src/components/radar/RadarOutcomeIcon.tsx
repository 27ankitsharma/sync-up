import type { RadarDiscoveryClassification } from "@/types/radarDiscovery";
import { Info, RefreshCw, Sprout } from "lucide-react";

const outcomeStyles: Record<
  RadarDiscoveryClassification,
  { box: string; icon: typeof Sprout; label: string }
> = {
  new_topic_candidate: {
    box: "bg-violet-100 text-violet-700",
    icon: Sprout,
    label: "NEW",
  },
  existing_topic_update: {
    box: "bg-sky-100 text-sky-700",
    icon: RefreshCw,
    label: "UPDATE",
  },
  fyi: {
    box: "bg-orange-100 text-orange-700",
    icon: Info,
    label: "FYI",
  },
};

export function RadarOutcomeIcon({
  classification,
  size = "md",
}: {
  classification: RadarDiscoveryClassification;
  size?: "sm" | "md" | "lg";
}) {
  const style = outcomeStyles[classification];
  const Icon = style.icon;
  const sizeClass =
    size === "lg" ? "h-14 w-14 rounded-xl" : size === "sm" ? "h-10 w-10 rounded-lg" : "h-12 w-12 rounded-xl";
  const iconSize = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={`grid shrink-0 place-items-center ${sizeClass} ${style.box}`}>
      <div className="flex flex-col items-center gap-0.5">
        <Icon className={iconSize} />
        <span className="text-[9px] font-bold tracking-wide">{style.label}</span>
      </div>
    </div>
  );
}

export function feedPriorityBadge(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return { label: "HIGH", className: "border-red-200 bg-red-50 text-red-700" };
  }
  if (priority === "medium") {
    return { label: "MEDIUM", className: "border-amber-200 bg-amber-50 text-amber-700" };
  }
  return { label: "LOW", className: "border-slate-200 bg-slate-50 text-slate-600" };
}
