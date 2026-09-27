import { cn } from "@/lib/utils";

export function SyncRadarWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      <span className="text-[#2563EB]">Sync</span>
      <span className="text-[#059669]">Radar</span>
    </span>
  );
}
