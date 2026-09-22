export function LandingHeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-violet-100/80 bg-white/70 shadow-[0_40px_90px_-48px_rgba(87,63,191,0.55)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.14),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.12),transparent_36%)]" />
      <div className="relative grid min-h-[320px] lg:min-h-[420px] lg:grid-cols-2">
        <div className="border-b border-violet-100/70 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">LiveMap</p>
          <p className="mt-2 text-sm font-medium text-slate-700">The AI landscape, connected</p>
          <div className="mt-6 space-y-3 text-sm">
            <TreeRow depth={0} label="AI Agents & Agentic Systems" active />
            <TreeRow depth={1} label="Agent Foundations" />
            <TreeRow depth={2} label="Agent Environments" />
            <TreeRow depth={3} label="Model Hardware Standard" highlight />
            <TreeRow depth={0} label="Foundation Models" />
            <TreeRow depth={1} label="Model Adaptation" />
            <TreeRow depth={2} label="LoRA" />
          </div>
        </div>

        <div className="relative flex items-center justify-center p-8">
          <p className="absolute left-6 top-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Radar</p>
          <div className="relative h-56 w-56 sm:h-64 sm:w-64">
            <div className="absolute inset-0 rounded-full border border-violet-200/80" />
            <div className="absolute inset-6 rounded-full border border-violet-200/70" />
            <div className="absolute inset-12 rounded-full border border-violet-200/60" />
            <div className="absolute inset-[4.5rem] rounded-full bg-primary/10" />
            <div className="landing-radar-sweep absolute inset-0 rounded-full" />
            <span className="absolute left-[68%] top-[28%] h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_6px_rgba(139,92,246,0.18)]" />
            <span className="absolute left-[30%] top-[62%] h-2 w-2 rounded-full bg-violet-400" />
            <span className="absolute left-[58%] top-[70%] h-1.5 w-1.5 rounded-full bg-indigo-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeRow({
  depth,
  label,
  active,
  highlight,
}: {
  depth: number;
  label: string;
  active?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 16}px` }}>
      <span className={`h-1.5 w-1.5 rounded-full ${highlight ? "bg-primary" : active ? "bg-violet-400" : "bg-violet-200"}`} />
      <span className={highlight ? "font-medium text-primary" : active ? "text-slate-800" : "text-slate-500"}>{label}</span>
    </div>
  );
}
