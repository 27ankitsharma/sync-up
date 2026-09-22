import type { ReactNode } from "react";
import { RadarDiscoveryCard } from "@/components/radar/RadarDiscoveryCard";
import type { KnowledgeObject } from "@/contexts/KnowledgeSelectionContext";
import type { RadarDiscovery } from "@/types/radarDiscovery";

export function RadarSection({
  title,
  description,
  icon,
  discoveries,
  selectedId,
  selectedLens,
  onSelect,
  onReview,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  discoveries: RadarDiscovery[];
  selectedId?: string | null;
  selectedLens: string;
  onSelect: (object: KnowledgeObject) => void;
  onReview?: (discovery: RadarDiscovery) => void;
}) {
  if (discoveries.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-bold tracking-tight">{title}</h2>
          <span className="text-[11px] text-muted-foreground">({discoveries.length})</span>
        </div>
        {description && <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>}
      </div>
      <div className="space-y-3">
        {discoveries.map((discovery) => (
          <RadarDiscoveryCard
            key={discovery.id}
            discovery={discovery}
            selected={selectedId === discovery.id}
            selectedLens={selectedLens}
            onSelect={onSelect}
            onReview={onReview}
          />
        ))}
      </div>
    </section>
  );
}
